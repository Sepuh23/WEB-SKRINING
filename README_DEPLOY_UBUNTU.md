# 🚀 Panduan Deploy PSY-VIBE di Server Ubuntu Sendiri (Sangat Ringan)

Aplikasi **PSY-VIBE** dirancang secara efisien menggunakan **Express + Vite React** sehingga dapat dijalankan dengan sangat ringan pada VPS/Server Ubuntu specs rendah (1 vCPU, 1 GB RAM).

---

## 📋 Syarat & Persiapan Server Ubuntu

Sebelum mulai, pastikan kamu sudah memiliki:
1. **VPS / Server Ubuntu** (Ubuntu 20.04 LTS / 22.04 LTS / 24.04 LTS).
2. **Akses SSH** ke server.
3. **API Key Google Gemini** (untuk fitur VibeBot AI). Dapat diambil gratis di [Google AI Studio](https://aistudio.google.com/).

---

## ⚡ METODE 1: Direct Node.js + PM2 (Paling Ringan & Hemat RAM ~80MB)

Metode ini direkomendasikan jika VPS kamu memiliki RAM terbatas (1 GB atau 512 MB).

### Langkah 1: Clone / Upload Source Code ke Server
Upload folder proyek atau clone dari repository Git kamu:
```bash
git clone <URL_REPOSITORY_KAMU> psy-vibe
cd psy-vibe
```

### Langkah 2: Jalankan Script Otomatis
Jalankan script auto-deploy yang sudah disediakan:
```bash
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

*(Script ini otomatis menginstall Node.js 20, PM2, melakukan `npm build`, dan menjalankan server)*

### Langkah 3: Konfigurasi API Key Gemini
Edit file `.env` di server:
```bash
nano .env
```
Isi baris berikut:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=AIzaSy...IsiDenganApiKeyKamu...
```

Lalu restart aplikasi via PM2:
```bash
pm2 restart psy-vibe
```

---

## 🐳 METODE 2: Docker & Docker Compose (Praktis & Terisolasi)

Jika kamu ingin deploy menggunakan Docker agar tidak perlu install Node.js manual:

### Langkah 1: Buat File `.env`
```bash
cp .env.example .env
nano .env
```
Isi `GEMINI_API_KEY` kamu di dalam file `.env`.

### Langkah 2: Jalankan Docker Compose
```bash
docker compose up -d --build
```
Aplikasi akan otomatis berjalan di port `3000`.

---

## 🌐 MENGHUBUNGKAN KE DOMAIN & HTTPS (SSL GRATIS NGINX)

Agar aplikasi dapat diakses lewat domain (misal `https://psyvibe.domainkamu.com`) dan sensor GPS/Webcam/Mic bekerja sempurna di browser, wajib mengaktifkan SSL (HTTPS).

### 1. Install Nginx & Certbot SSL
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Buat Konfigurasi Reverse Proxy Nginx
```bash
sudo nano /etc/nginx/sites-available/psyvibe
```
Masukkan konfigurasi berikut (ganti `domainkamu.com` dengan nama domainmu):
```nginx
server {
    server_name domainkamu.com www.domainkamu.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi dan reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/psyvibe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Aktifkan Sertifikat SSL Gratis (Certbot)
```bash
sudo certbot --nginx -d domainkamu.com -d www.domainkamu.com
```

---

## 🛠️ Perintah Berguna PM2 untuk Pemeliharaan

- **Melihat status aplikasi:**
  ```bash
  pm2 status
  ```
- **Melihat log realtime:**
  ```bash
  pm2 logs psy-vibe
  ```
- **Restart aplikasi:**
  ```bash
  pm2 restart psy-vibe
  ```
- **Memastikan auto-start saat VPS di-reboot:**
  ```bash
  pm2 save
  ```
