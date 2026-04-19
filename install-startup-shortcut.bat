@echo off
setlocal enabledelayedexpansion

REM Create a startup shortcut automatically
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\PM2-Discord-Bot.lnk"
set "BATCH_FILE=C:\Users\belka\Downloads\Bot-Joiner-Voice---Discord---main\Bot-Joiner-Voice---Discord---main\startup-pm2.bat"

if not exist "%STARTUP_FOLDER%" (
  mkdir "%STARTUP_FOLDER%"
)

REM Create shortcut using PowerShell
powershell -NoProfile -Command ^
  "$WshShell = New-Object -ComObject WScript.Shell; " ^
  "$Shortcut = $WshShell.CreateShortCut('%SHORTCUT_PATH%'); " ^
  "$Shortcut.TargetPath = 'C:\\Windows\\System32\\cmd.exe'; " ^
  "$Shortcut.Arguments = '/c \"%BATCH_FILE%\" && exit'; " ^
  "$Shortcut.WorkingDirectory = 'C:\\Users\\belka\\Downloads\\Bot-Joiner-Voice---Discord---main\\Bot-Joiner-Voice---Discord---main'; " ^
  "$Shortcut.WindowStyle = 7; " ^
  "$Shortcut.Save()"

if exist "%SHORTCUT_PATH%" (
  echo [OK] Raccourci cree avec succes dans le dossier Startup.
  echo.
  echo Chemin : %SHORTCUT_PATH%
  echo.
  echo Le bot redemarrera automatiquement au prochain boot Windows.
) else (
  echo [ERREUR] Echec de creation du raccourci.
)

pause
