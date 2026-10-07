#!/bin/bash

# ==============================================================================
# PSY-VIBE Automated Deployment Script for Ubuntu Server
# ==============================================================================

set -e

echo "🚀 [1/5] Memeriksa dan memperbarui dependensi sistem Ubuntu..."
sudo apt-get update -y
sudo apt-get install -y curl git build-essential nginx

# Installing Node.js 20 LTS if not present
if ! command -v node &> /dev/null; then
  echo "📦 [2/5] Menginstall Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "✅ Node.js sudah terinstall: $(node -v)"
fi

# Installing PM2 process manager
if ! command -v pm2 &> /dev/null; then
  echo "⚙️ [3/5] Menginstall PM2 Process Manager secara global..."
  sudo npm install -g pm2
fi

echo "📥 [4/5] Menginstall dependensi proyek & membuat Production Build..."
npm install
npm run build

# Check for .env file
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "⚠️ File .env dibuat dari .env.example. Jangan lupa isi GEMINI_API_KEY di file .env!"
  fi
fi

echo "🔥 [5/5] Memulai aplikasi dengan PM2..."
export NODE_ENV=production
pm2 stop psy-vibe || true
pm2 delete psy-vibe || true
pm2 start server.ts --name "psy-vibe" --interpreter ./node_modules/.bin/tsx --env production

pm2 save
sudo pm2 startup systemd -u $USER --hp $HOME || true

echo "=============================================================================="
echo "🎉 DEPLOYMENT BERHASIL!"
echo "Aplikasi PSY-VIBE berjalan di: http://localhost:3000"
echo "Gunakan 'pm2 status' atau 'pm2 logs psy-vibe' untuk memantau status aplikasi."
echo "=============================================================================="
