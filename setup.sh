#!/bin/bash
set -e

# ✅ Updated App Name
APP_NAME="geminiai-fm"

echo "=== Updating system ==="
sudo apt update -y

echo "=== Installing system prerequisites ==="
sudo apt install -y \
  curl \
  ca-certificates \
  build-essential \
  sqlite3 \
  nginx \
  git

# ✅ Switched to Node.js 20 (LTS) - Better for Next.js 15
echo "=== Installing Node.js 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "=== Installing PM2 ==="
sudo npm install -g pm2

echo "=== Installing app dependencies ==="
npm install

# ✅ CRITICAL FIX: Build step was missing!
echo "=== Building the application ==="
npm run build

echo "=== Starting app with PM2 ==="
# Delete existing process if it exists to avoid conflicts
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start npm --name "$APP_NAME" -- start
pm2 save

echo "=== Enabling PM2 on boot ==="
pm2 startup systemd -u $USER --hp $HOME

echo "=== Bootstrap completed successfully! ==="
echo "🦅 GeminiAI-FM is now running on port 3000"
