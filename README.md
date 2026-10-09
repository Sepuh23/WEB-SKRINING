# 🚀 PSY-VIBE (Youth Sanctuary - Ruang Aman Curhat AI & Skrining Emosi)

Aplikasi Web & Full-Stack **PSY-VIBE** dibuat menggunakan **React 19 + Vite + Express + Tailwind CSS v4** dengan integrasi **WebSocket Real-time Chat** dan **Gemini AI Core Proxy**.

---

## 💻 Panduan Menjalankan di Server Lokal (Localhost)

Aplikasi ini sudah dirancang full-stack (Frontend React + Backend Express & WebSocket dalam satu server). Kamu bisa langsung menjalankannya di laptop/PC lokal (Windows, macOS, maupun Linux).

### 1. Prasyarat Sistem
- **Node.js**: Versi `18.x`, `20.x`, atau lebih baru (Disarankan Node.js 20 LTS dari [nodejs.org](https://nodejs.org/)).
- **npm**: Sudah terpasang otomatis bersama Node.js.
- **Git** (opsional): Untuk clone repository.

---

### 2. Langkah-Langkah Menjalankan

#### Langkah A: Buka Terminal di Folder Proyek
Buka VS Code, Terminal (Mac/Linux), atau Command Prompt / PowerShell (Windows) di direktori proyek ini:

```bash
# Pastikan kamu berada di folder proyek (tempat file package.json berada)
```

#### Langkah B: Install Seluruh Dependencies
Jalankan perintah berikut untuk mengunduh semua library yang dibutuhkan:
```bash
npm install
```

#### Langkah C: Buat File `.env` (Opsional)
Salin file `.env.example` menjadi `.env`:
```bash
# Di Windows PowerShell:
copy .env.example .env

# Di Mac / Linux:
cp .env.example .env
```
Isi file `.env` (jika ingin menggunakan Gemini AI server-side):
```env
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```
> 💡 **Catatan Penting**: Jika tidak mengisi `GEMINI_API_KEY`, aplikasi **tetap berjalan 100% lancar**. Fitur VibeBot AI akan otomatis beralih ke *Smart Empathetic Rule-Based Engine* tanpa error, dan WebSocket Live Chat antar Siswa-BK-Psikolog tetap aktif penuh.

#### Langkah D: Jalankan Server (Mode Development)
Jalankan perintah:
```bash
npm run dev
```
Setelah muncul log:
```
PSY-VIBE Server listening on http://0.0.0.0:3000 (HTTP & WebSocket /ws)
```
Buka browser favoritmu (Chrome, Edge, Firefox, Safari) dan akses:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### 3. Menjalankan Mode Production di Lokal
Jika ingin menguji aplikasi dalam mode kecepatan optimal (dist bundle):
```bash
# 1. Build aplikasi Vite ke folder /dist
npm run build

# 2. Jalankan server produksi
npm start
```
Buka browser di **http://localhost:3000**.

---

### 4. Alternatif: Jalankan Menggunakan Docker
Jika kamu sudah memiliki **Docker Desktop** terpasang:
```bash
docker compose up -d --build
```
Aplikasi akan langsung berjalan di background pada port `3000`.

---

## 🔑 Akun & Kredensial Demo untuk Pengujian Lokal

Semua akun demo sudah siap pakai dengan password standar: `123`

| Role | Username | Password | Deskripsi Akses |
| :--- | :--- | :--- | :--- |
| **🎒 Siswa 1** | `farel` | `123` | Dashboard Siswa, Skrining Wajah/Suara, Chat Konseling Langsung, Mood Tracker, Tic-Tac-Toe Anti-Stres |
| **🎒 Siswa 2** | `ayu` | `123` | Dashboard Siswa kelas XI, Jurnal Harian |
| **🏫 Guru BK** | `ratnabk` | `123` | Portal Guru BK, Monitoring Skrining Siswa, Tab **💬 Chat Konseling Direct (LIVE)**, Buat Link Meet |
| **🧠 Psikolog** | `mayapsi` | `123` | Portal Psikolog Klinis, Skrining Klinis FACS, Tab **💬 Chat Konseling Siswa (LIVE)**, Treatment Plan |
| **⚡ Admin** | `admin` | `123` | Panel Pengelola, Manajemen Akun Pengguna, Export Data |

---

## 🛠️ Ringkasan Script `package.json`

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server Express full-stack + Vite middleware di port 3000 |
| `npm run build` | Melakukan compile TypeScript dan build frontend Vite ke folder `dist` |
| `npm start` | Menjalankan server produksi (`node server.ts` via tsx) |
| `npm run lint` | Memeriksa validasi tipe TypeScript (`tsc --noEmit`) |

---

## ❓ Troubleshooting Lokal

1. **Port 3000 sedang digunakan (EADDRINUSE)?**
   - Kamu bisa ubah variabel `PORT=3001` di file `.env` atau jalankan:
     - Windows: `netstat -ano | findstr :3000` lalu `taskkill /PID <PID> /F`
     - Mac/Linux: `lsof -i :3000` lalu `kill -9 <PID>`
2. **Kamera/Mikrofon tidak bisa diakses saat skrining emosi?**
   - Browser modern (Chrome/Firefox/Edge) mengizinkan akses kamera & mic secara default di alamat `http://localhost`. Pastikan klik tombol **Allow / Izinkan** saat muncul popup perizinan browser.
