# Guide Oracle Cloud - Bot Discord 24/7 Gratuit

## Étape 1 : Créer un compte Oracle Cloud (5 min)
1. Va sur https://www.oracle.com/cloud/free/
2. Clique sur **"Start for free"**
3. Crée un compte :
   - Email
   - Mot de passe
   - Pays : France
   - Il faut une **carte bancaire** pour vérification (mais l'instance free reste gratuite)
4. Attends la confirmation (quelques minutes à quelques heures)

## Étape 2 : Créer une instance VM Ubuntu (3 min)
Une fois connecté à Oracle Cloud :

1. Va dans **Compute** → **Instances**
2. Clique sur **Create Instance**
3. Configure ainsi :
   - **Name** : discord-voice-bot
   - **Image and shape** :
     - Image : **Ubuntu 22.04** (ou 24.04)
     - Shape : **Ampere (ARM)** → **Micro** (toujours gratuit)
   - **Networking** :
     - Virtual Cloud Network : créer un nouveau si besoin
     - Public IP : **Assign public IP address**
   - **Add SSH key** :
     - Génère une paire de clés SSH
     - Télécharge la clé privée et sauvegarde-la bien
     - (Important : tu en auras besoin pour te connecter)
4. Clique **Create**
5. Attends 2-3 minutes que l'instance soit "Running"

## Étape 3 : Se connecter à l'instance (1 min)
Une fois "Running" :

1. Clique sur l'instance
2. Copie l'**adresse IP publique** (ex : 1.2.3.4)
3. Sur ton PC Windows, ouvre PowerShell et fais :

```powershell
ssh -i C:\chemin\vers\cle-privee.key ubuntu@<IP_PUBLIQUE>
# Remplace <IP_PUBLIQUE> par l'adresse que tu as copiée
# Exemple : ssh -i C:\Users\belka\oracle-key.key ubuntu@1.2.3.4
```

4. Accepte le fingerprint (tape `yes`)
5. Tu es maintenant connecté à ton serveur !

## Étape 4 : Déployer le bot automatiquement (2 min)
Une fois connecté en SSH sur le serveur :

```bash
# Crée un dossier pour le projet
mkdir -p ~/discord-bot && cd ~/discord-bot

# Clone ton dépôt GitHub ou copie les fichiers
git clone <URL_DE_TON_DEPOT>
cd Bot-Joiner-Voice---Discord---main

# Lance le script d'installation automatisé
bash deploy/install-ubuntu.sh
```

Quand le script demande d'éditer `.env` :
1. Il va s'arrêter et t'attendre
2. Tu dois entrer :
   - `DISCORD_BOT_TOKEN=ton_token_ici`
   - `DISCORD_GUILD_ID=ton_guild_id_ici`
3. Sauvegarde (Ctrl+X, puis Y, puis Entrée)

Le script installe automatiquement Node.js, PM2 et démarre le bot.

## Étape 5 : Vérifier que le bot tourne
```bash
pm2 status
pm2 logs discord-voice-bot
```

## C'est fini !
Le bot tourne maintenant 24/7 sur ton serveur Oracle gratuit.

---

### Commandes utiles après déploiement

```bash
# Voir le statut
pm2 status

# Voir les logs en direct
pm2 logs discord-voice-bot

# Redémarrer le bot
pm2 restart discord-voice-bot

# Arrêter le bot
pm2 stop discord-voice-bot

# Relancer le bot
pm2 start discord-voice-bot

# Supprimer de PM2
pm2 delete discord-voice-bot
```

### Si tu dois mettre à jour le code
```bash
cd ~/discord-bot/Bot-Joiner-Voice---Discord---main
# Modifie les fichiers (ex : git pull si c'est un repo)
pm2 restart discord-voice-bot
```

---

## Notes importantes

- Oracle Cloud Free Tier inclut **vraiment** une instance gratuite toujours disponible
- Pas de limite de temps (contrairement à AWS)
- Pas de carte bancaire prélevée (la vérification ne débite rien)
- Le bot redémarrera automatiquement après reboot/crash grâce à PM2

---

## Besoin d'aide ?

Si tu as besoin de SCP (copier des fichiers de ton PC au serveur) :
```powershell
# Sur ton PC Windows
scp -i C:\chemin\vers\cle.key C:\chemin\vers\fichier.js ubuntu@IP_SERVEUR:/home/ubuntu/discord-bot/
```

Pour l'éditeur nano sur le serveur :
- Ctrl+X : quitter
- Y : oui, sauvegarder
- Entrée : confirmer le nom
