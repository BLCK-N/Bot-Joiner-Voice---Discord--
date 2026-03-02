#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash deploy/install-ubuntu.sh
# Run as a sudo-capable user on Ubuntu 22.04/24.04.

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required."
  exit 1
fi

echo "[1/5] Installing system packages..."
sudo apt update
sudo apt install -y curl git ca-certificates

echo "[2/5] Installing Node.js 20..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
else
  NODE_MAJOR="$(node -v | sed 's/v//' | cut -d. -f1)"
  if [ "$NODE_MAJOR" -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
  fi
fi

echo "[3/5] Installing PM2..."
sudo npm install -g pm2

echo "[4/5] Installing bot dependencies..."
npm install

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env from .env.example. Edit it now before starting PM2."
  else
    echo "Missing .env and .env.example"
    exit 1
  fi
fi

echo "[5/5] Enabling PM2 startup + starting app..."
pm2 start ecosystem.config.cjs --only discord-voice-bot
pm2 save
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME"

echo "Done. Use: pm2 status && pm2 logs discord-voice-bot"
