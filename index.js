require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const {
  joinVoiceChannel,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus,
} = require('@discordjs/voice');

const token = process.env.DISCORD_BOT_TOKEN;
const envGuildId = process.env.DISCORD_GUILD_ID || '';
const defaultVoiceChannelId = process.env.DISCORD_VOICE_CHANNEL_ID || '';

if (!token) {
  console.error('Missing env var: DISCORD_BOT_TOKEN');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const persistentVoiceByGuild = new Map();
const reconnectTimerByGuild = new Map();

function clearReconnectTimer(guildId) {
  const t = reconnectTimerByGuild.get(guildId);
  if (t) {
    clearTimeout(t);
    reconnectTimerByGuild.delete(guildId);
  }
}

function scheduleReconnect(guildId, delayMs = 5000) {
  if (!persistentVoiceByGuild.has(guildId)) return;
  if (reconnectTimerByGuild.has(guildId)) return;

  const timer = setTimeout(async () => {
    reconnectTimerByGuild.delete(guildId);
    const targetChannelId = persistentVoiceByGuild.get(guildId);
    if (!targetChannelId) return;

    try {
      const guild = await client.guilds.fetch(guildId);
      const channel = await guild.channels.fetch(targetChannelId);
      if (!channel || channel.type !== ChannelType.GuildVoice) {
        console.error('Reconnect failed: target channel invalid or not voice.');
        return;
      }

      await connectPersistentVoice(guild, channel);
      console.log(`Reconnected to ${channel.name} (${channel.id})`);
    } catch (err) {
      console.error('Reconnect attempt failed:', err?.message || err);
      scheduleReconnect(guildId, 10_000);
    }
  }, delayMs);

  reconnectTimerByGuild.set(guildId, timer);
}

function attachConnectionHandlers(connection, guildId) {
  if (connection.__persistentHandlersAttached) return;
  connection.__persistentHandlersAttached = true;

  connection.on('stateChange', async (_oldState, newState) => {
    if (!persistentVoiceByGuild.has(guildId)) return;

    if (newState.status === VoiceConnectionStatus.Disconnected) {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch {
        scheduleReconnect(guildId, 3000);
      }
      return;
    }

    if (newState.status === VoiceConnectionStatus.Destroyed) {
      scheduleReconnect(guildId, 3000);
      return;
    }

    if (newState.status === VoiceConnectionStatus.Ready) {
      clearReconnectTimer(guildId);
    }
  });
}

async function connectPersistentVoice(guild, channel) {
  const existing = getVoiceConnection(guild.id);

  if (existing && existing.joinConfig.channelId === channel.id) {
    attachConnectionHandlers(existing, guild.id);
    await entersState(existing, VoiceConnectionStatus.Ready, 15_000);
    return existing;
  }

  if (existing) existing.destroy();

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
  });

  attachConnectionHandlers(connection, guild.id);
  await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
  return connection;
}

function buildCommands() {
  return [
    new SlashCommandBuilder()
      .setName('join')
      .setDescription('Join a voice channel and stay connected')
      .addChannelOption((opt) =>
        opt
          .setName('channel')
          .setDescription('Voice channel to join')
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(false)
      ),
    new SlashCommandBuilder()
      .setName('leave')
      .setDescription('Leave voice and disable persistent reconnect'),
    new SlashCommandBuilder()
      .setName('moveall')
      .setDescription('Move all members from one voice channel to another')
      .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
      .addChannelOption((opt) =>
        opt
          .setName('from')
          .setDescription('Source voice channel')
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true)
      )
      .addChannelOption((opt) =>
        opt
          .setName('to')
          .setDescription('Destination voice channel')
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true)
      ),
  ].map((c) => c.toJSON());
}

async function getTargetGuilds() {
  if (envGuildId) {
    return [await client.guilds.fetch(envGuildId)];
  }

  const guilds = await client.guilds.fetch();
  const ids = [...guilds.keys()];
  if (ids.length === 0) {
    throw new Error('Bot is not in any guild.');
  }

  return Promise.all(ids.map((id) => client.guilds.fetch(id)));
}

async function registerCommands() {
  const commands = buildCommands();
  const guilds = await getTargetGuilds();

  for (const guild of guilds) {
    await guild.commands.set(commands);
    console.log(`Slash commands registered in guild: ${guild.name} (${guild.id})`);
  }
}

async function resolveAutoJoinTarget() {
  if (!defaultVoiceChannelId) return null;

  if (envGuildId) {
    const guild = await client.guilds.fetch(envGuildId);
    const channel = await guild.channels.fetch(defaultVoiceChannelId);
    if (channel && channel.type === ChannelType.GuildVoice) {
      return { guild, channel };
    }
    return null;
  }

  const guilds = await getTargetGuilds();
  for (const guild of guilds) {
    const channel = await guild.channels.fetch(defaultVoiceChannelId).catch(() => null);
    if (channel && channel.type === ChannelType.GuildVoice) {
      return { guild, channel };
    }
  }

  return null;
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag} (${client.user.id})`);

  try {
    await registerCommands();
  } catch (err) {
    console.error('Failed to register commands:', err?.message || err);
  }

  if (defaultVoiceChannelId) {
    try {
      const target = await resolveAutoJoinTarget();
      if (!target) {
        console.error('Auto-join skipped: DISCORD_VOICE_CHANNEL_ID not found in accessible guilds.');
        return;
      }

      persistentVoiceByGuild.set(target.guild.id, target.channel.id);
      await connectPersistentVoice(target.guild, target.channel);
      console.log(`Auto-joined persistent voice channel: ${target.channel.name}`);
    } catch (err) {
      console.error('Auto-join failed:', err?.message || err);
      if (envGuildId) scheduleReconnect(envGuildId, 10_000);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'join') {
    const requestedChannel = interaction.options.getChannel('channel');
    const memberChannel = interaction.member?.voice?.channel;
    const channel = requestedChannel || memberChannel;

    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({ content: 'Provide a voice channel or join one first.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      persistentVoiceByGuild.set(interaction.guild.id, channel.id);
      clearReconnectTimer(interaction.guild.id);
      await connectPersistentVoice(interaction.guild, channel);
      await interaction.editReply(`Joined **${channel.name}** and persistent mode is ON.`);
    } catch (err) {
      console.error(err);
      scheduleReconnect(interaction.guild.id, 8000);
      await interaction.editReply('Failed to join now. Reconnect will retry automatically.');
    }
    return;
  }

  if (interaction.commandName === 'leave') {
    persistentVoiceByGuild.delete(interaction.guild.id);
    clearReconnectTimer(interaction.guild.id);

    const existing = getVoiceConnection(interaction.guild.id);
    if (existing) existing.destroy();

    await interaction.reply({ content: 'Left voice. Persistent mode is OFF.', ephemeral: true });
    return;
  }

  if (interaction.commandName === 'moveall') {
    const from = interaction.options.getChannel('from');
    const to = interaction.options.getChannel('to');

    if (from.id === to.id) {
      await interaction.reply({ content: 'Source and destination channels must be different.', ephemeral: true });
      return;
    }

    const members = [...from.members.values()];
    if (members.length === 0) {
      await interaction.reply({ content: `No members in **${from.name}**.`, ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    let moved = 0;
    let failed = 0;

    for (const m of members) {
      try {
        await m.voice.setChannel(to, `Moved by ${interaction.user.tag} via /moveall`);
        moved += 1;
      } catch {
        failed += 1;
      }
    }

    await interaction.editReply(`Done. Moved: ${moved}. Failed: ${failed}.`);
  }
});

client.login(token);
