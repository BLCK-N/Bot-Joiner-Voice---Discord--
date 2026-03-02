# Discord Voice Bot (Safe)

This bot uses the official Discord Bot API (no user tokens).

## Features
- `/join [channel]`: bot joins a voice channel and keeps trying to stay connected
- `/leave`: bot leaves voice and disables persistent reconnect
- `/moveall from:<voice> to:<voice>`: move all users from one voice channel to another

## Local Run
```powershell
npm install
Copy-Item .env.example .env
# edit .env with real values
npm start
```

## VPS 24/7 (Ubuntu)
1. Upload this folder to the VPS (SCP, SFTP, or git clone).
2. SSH into VPS and enter project folder.
3. Run:
```bash
chmod +x deploy/install-ubuntu.sh deploy/update-and-restart.sh
bash deploy/install-ubuntu.sh
nano .env
pm2 restart discord-voice-bot
pm2 save
```
4. Check service:
```bash
pm2 status
pm2 logs discord-voice-bot
```

## Update After Code Change
```bash
bash deploy/update-and-restart.sh
```

## Required Bot Permissions
- Connect
- View Channel
- Move Members
- Use Application Commands

## Persistent Voice
- If `DISCORD_VOICE_CHANNEL_ID` is set, the bot auto-joins that voice channel on startup.
- After `/join`, persistent reconnect mode is enabled for that guild.
- Use `/leave` to stop persistent mode and disconnect.

## Notes
- Slash commands are registered for one guild (`DISCORD_GUILD_ID`) on startup.
- Use this only where you have admin permission.
