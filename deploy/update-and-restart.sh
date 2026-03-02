#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash deploy/update-and-restart.sh

npm install
pm2 restart discord-voice-bot
pm2 save
pm2 status
