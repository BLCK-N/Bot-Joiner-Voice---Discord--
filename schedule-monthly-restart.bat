@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

if not exist run-bot.bat (
  echo Erreur : run-bot.bat introuvable. Place ce fichier a la racine du projet.
  pause
  exit /b 1
)

set "TASKNAME=DiscordVoiceBotRestart"
set "TASKCMD=%~dp0run-bot.bat"

echo Creation de la tache planifiee mensuelle...
schtasks /Create /SC MONTHLY /MO 1 /TN "%TASKNAME%" /TR "\"%TASKCMD%\"" /ST 00:00 /RL HIGHEST /F
if errorlevel 1 (
  echo Echec de creation de la tache planifiee.
  echo Lance ce script en tant qu'administrateur si necessaire.
  pause
  exit /b 1
)
echo Tache mensuelle cree : %TASKNAME%
echo Elle lancera run-bot.bat une fois par mois.
pause
