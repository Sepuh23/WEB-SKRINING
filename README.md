📦 Konfigurasi & Script Deploy yang Telah Dibuat di Proyek:
deploy-ubuntu.sh (Script Auto-Deploy 1-Click untuk Ubuntu):
Script otomatis yang menginstall Node.js 20, PM2, membuat Production Build super cepat, dan menjalankan aplikasi dengan penggunaan RAM sangat minim (~80MB).
Dockerfile & docker-compose.yml (Opsi Container Multi-Stage Alpine):
Jika kamu lebih suka menggunakan Docker, file Dockerfile berbasis node:20-alpine telah dibuat dengan teknik multi-stage build sehingga ukuran image sangat kecil dan efisien.
README_DEPLOY_UBUNTU.md (Panduan Lengkap Langkah demi Langkah):
Dokumentasi panduan deploy, konfigurasi Nginx Reverse Proxy, serta aktivasi SSL HTTPS Gratis (Certbot / Let's Encrypt) agar izin GPS, Webcam, dan Mikfon dapat diakses aman di domain kamu.
⚡ Cara Deploy di Ubuntu Server Kamu (Paling Ringan & Cepat):
Cukup jalankan 3 perintah ini di terminal SSH Ubuntu kamu:
code
Bash
# 1. Clone / Masuk ke folder proyek
git clone <URL_REPOSITORY_KAMU> psy-vibe
cd psy-vibe

# 2. Jalankan script auto-deploy
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh

# 3. Masukkan Gemini API Key kamu
nano .env
Di dalam file .env, isi dengan API Key milikmu:
code
Env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=AIzaSy...IsiDenganApiKeyKamu...
Lalu jalankan pm2 restart psy-vibe. Aplikasi akan langsung aktif di http://IP_SERVER_KAMU:3000!
flag
Checkpoint
