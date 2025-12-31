#!/bin/bash
set -e

APP_NAME="openai-fm"

echo "=== Updating system ==="
sudo apt update -y

echo "=== Installing system prerequisites ==="
sudo apt install -y \
  curl \
  ca-certificates \
  build-essential \
  sqlite3 \
  nginx

echo "=== Installing Node.js 18 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

echo "=== Installing PM2 ==="
sudo npm install -g pm2

echo "=== Installing app dependencies ==="
npm install

echo "=== Starting app with PM2 ==="
pm2 start npm --name "$APP_NAME" -- start
pm2 save

echo "=== Enabling PM2 on boot ==="
pm2 startup systemd -u $USER --hp $HOME

echo "=== Bootstrap completed successfully ==="
