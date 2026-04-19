# Gestion du bot avec PM2

## Status actuel
Pour voir si le bot tourne :
```powershell
pm2 status
```

## Voir les logs en direct
```powershell
pm2 logs discord-voice-bot
```

## Redémarrer le bot
```powershell
pm2 restart discord-voice-bot
```

## Arrêter le bot
```powershell
pm2 stop discord-voice-bot
```

## Supprimer le bot de PM2
```powershell
pm2 delete discord-voice-bot
```

## Relancer tout (après un reboot Windows)
```powershell
pm2 resurrect
```

## Config auto-restart au boot
1. Lance ce script en tant qu'administrateur :
   - `setup-auto-restart.bat`
2. Cela créera une tâche planifiée Windows qui relance PM2 au démarrage.

## Ou pour relancer manuellement
- Double-clique sur `startup-pm2.bat`

## Commandes PM2 utiles
- `pm2 monit` : interface de monitoring (temps réel)
- `pm2 logs discord-voice-bot --lines 50` : voir les 50 dernières lignes
- `pm2 describe discord-voice-bot` : détails du processus
- `pm2 save` : sauvegarder la configuration actuelle
