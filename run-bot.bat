@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

if not exist package.json (
  echo Erreur : ce script doit etre place a la racine du projet.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js n'est pas installe sur cette machine.
  echo Installe Node.js 18+ puis relance ce fichier.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo npm n'est pas installe.
  echo Installe Node.js (npm est inclus) puis relance ce fichier.
  pause
  exit /b 1
)

if not exist .env (
  if exist .env.example (
    copy /y .env.example .env >nul
    echo Fichier .env cree a partir de .env.example.
  ) else (
    echo Fichier .env manquant et .env.example introuvable.
  )
  echo Ouvre .env dans le bloc-notes pour configurer les variables.
  notepad .env
  echo Apres avoir enregistre .env, relance ce fichier.
  pause
  exit /b 0
)

npm install
if errorlevel 1 (
  echo Echec de npm install.
  pause
  exit /b 1
)

npm start
pause
