@echo off
setlocal enabledelayedexpansion
cd /d "c:\Users\belka\Downloads\Bot-Joiner-Voice---Discord---main\Bot-Joiner-Voice---Discord---main"

REM Start PM2 daemon and resurrect saved processes
"C:\Program Files\nodejs\node.exe" "C:\Users\belka\AppData\Roaming\npm\node_modules\pm2\bin\pm2" resurrect

exit /b 0
