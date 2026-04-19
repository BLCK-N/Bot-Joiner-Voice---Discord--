@echo off
setlocal enabledelayedexpansion

echo Configuration de l'auto-redemarrage PM2 au boot Windows...

set "STARTUP_SCRIPT=%~dp0startup-pm2.bat"
set "TASKNAME=PM2-Discord-Voice-Bot"

REM Create Windows scheduled task for startup
schtasks /Create /TN "%TASKNAME%" /TR "\"%STARTUP_SCRIPT%\"" /SC ONSTART /RU SYSTEM /F >nul 2>&1

if errorlevel 1 (
  echo Echec de creation de la tache. Lance ce script en tant qu'administrateur.
  pause
  exit /b 1
)

echo Tache planifiee creee avec succes : %TASKNAME%
echo PM2 relancera le bot au prochain redemarrage.
echo.
echo Status actuel :
"C:\Program Files\nodejs\node.exe" "C:\Users\belka\AppData\Roaming\npm\node_modules\pm2\bin\pm2" status
pause
