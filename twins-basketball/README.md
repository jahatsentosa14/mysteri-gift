# 🏀 Twins Basketball — Mystery Gift Hunt

Website bridge untuk event Mystery Gift, ekskul **Twins Basketball**, SMAN 1 Cikembar.
Style: Y2K + Neumorphism + Claymorphism + Glassmorphism, pink magenta.
Database: **Google Sheets** (gratis). Hosting: **GitHub Pages** (gratis).

---

## 📁 Struktur folder

```
twins-basketball/
├── index.html                     ← halaman utama
├── assets/
│   ├── css/style.css              ← semua styling
│   ├── js/config.js                ← ⚙️ SATU-SATUNYA file yang wajib kamu edit
│   ├── js/app.js                   ← logic form, leaderboard, roulette
│   ├── js/basketball-game.js       ← mini game bola basket di header
│   └── img/favicon.svg
├── apps-script/Code.gs             ← kode backend, ditempel di Google Sheets
└── .github/workflows/deploy.yml    ← otomatis deploy ke GitHub Pages
```

Tidak ada proses build (npm, dsb). Ini murni HTML/CSS/JS statis, jadi GitHub Pages bisa langsung menyajikannya.

---

## Langkah 1 — Setup Google Sheets sebagai database

1. Buka [sheets.google.com](https://sheets.google.com) → buat Spreadsheet baru.
   Beri nama misalnya **"Twins Basketball - Mystery Gift DB"**.
2. Di menu atas, klik **Extensions → Apps Script**.
3. Hapus semua kode default (`function myFunction() {...}`), lalu **copy-paste seluruh isi file [`apps-script/Code.gs`](apps-script/Code.gs)** dari project ini.
4. Kalau perlu, ubah baris ini sesuai jumlah hadiah misteri yang tersedia:
   ```js
   const MAX_WINNERS = 5; // ganti sesuai jumlah mystery gift kamu
   ```
5. Klik ikon **Save** (💾).
6. Klik **Deploy → New deployment**.
   - Klik ikon gerigi ⚙️ di sebelah "Select type" → pilih **Web app**.
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (wajib, supaya website bisa mengakses tanpa login)
   - Klik **Deploy**.
7. Google akan minta izin akses (Authorize access) → pilih akun Google kamu → klik **Advanced** → **Go to (nama project) (unsafe)** → **Allow**. Ini normal karena script belum diverifikasi Google, aman karena kamu sendiri yang menulisnya.
8. Setelah deploy, kamu akan dapat **Web app URL**, formatnya seperti:
   ```
   https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxx/exec
   ```
   **Copy URL ini**, kamu akan pakai di Langkah 2.

   > ⚠️ Setiap kali kamu **mengedit ulang** `Code.gs` di masa depan, kamu harus **Deploy → Manage deployments → Edit (ikon pensil) → New version → Deploy** supaya perubahan aktif. URL-nya tetap sama.

### Test backend-nya (opsional tapi disarankan)

Tempel URL Web App tadi ke browser + `?action=state`, contoh:
```
https://script.google.com/macros/s/AKfycbxxx.../exec?action=state
```
Kalau muncul JSON seperti `{"ok":true,"participantsCount":0,...}` — berarti backend sudah jalan dengan benar.

### Mengatur undian otomatis di tanggal Expo

Fungsi `drawWinners()` di `Code.gs` yang melakukan pengundian pemenang (random, dan hasilnya permanen/tidak berubah-ubah). Ada 2 cara menjalankannya:

**Cara A — Manual (paling simpel, disarankan untuk hari-H)**
Saat Expo berlangsung dan mau mulai undian, buka Apps Script editor → pilih fungsi `drawWinners` di dropdown atas → klik **Run**. Website otomatis menampilkan hasilnya dalam ± 15 detik (sesuai `POLL_INTERVAL_MS`).

**Cara B — Otomatis pakai jadwal (Time-driven Trigger)**
1. Di Apps Script editor, klik ikon jam ⏰ (**Triggers**) di sidebar kiri.
2. Klik **Add Trigger**.
3. Pilih:
   - Function to run: `drawWinners`
   - Event source: `Time-driven`
   - Type: `Specific date and time`
   - Tentukan tanggal & jam Expo kamu
4. Klik **Save**.

Kalau mau mengulang undian (misal salah setting), jalankan fungsi `resetWinners` dulu (menghapus data di sheet **Winners**), baru jalankan `drawWinners` lagi.

---

## Langkah 2 — Edit konfigurasi website

Buka file `assets/js/config.js`, isi 2 hal wajib ini:

```js
const CONFIG = {
  GAS_URL: "https://script.google.com/macros/s/AKfycbxxx.../exec", // URL dari Langkah 1
  EVENT_DATE: "2026-08-15T09:00:00+07:00", // tanggal & jam mulai Expo
  TEAM_NAME: "Twins Basketball",
  LEADERBOARD_LIMIT: 10,
  POLL_INTERVAL_MS: 15000,
};
```

- **`EVENT_DATE`** — sebelum tanggal ini, website menampilkan countdown. Begitu waktu ini tiba, roulette otomatis muncul dan menampilkan pemenang (tidak perlu panel panitia).
- **`GAS_URL`** — wajib diisi URL dari Langkah 1, kalau tidak, form submit & leaderboard tidak akan berfungsi.

### Ganti logo

Buka `index.html`, cari bagian ini:
```html
<div class="logo-slot">
  <span>🏀</span>
</div>
```
Ganti jadi:
```html
<div class="logo-slot">
  <img src="assets/img/logo.png" alt="Logo Twins Basketball">
</div>
```
Lalu taruh file logo kamu (PNG/JPG, disarankan persegi/kotak) di `assets/img/logo.png`.

### Ganti warna / gaya (opsional)

Semua warna diatur di bagian atas `assets/css/style.css` (variabel `--magenta`, `--bg-a`, dst), jadi tidak perlu cari-cari di seluruh file.

---

## Langkah 3 — Push ke GitHub & aktifkan Pages

1. Buat repo baru di GitHub (public), misal `twins-basketball-mystery-gift`. **Jangan** centang "Add README" (biar tidak bentrok).
2. Di folder project ini (lokal), jalankan:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Twins Basketball Mystery Gift"
   git branch -M main
   git remote add origin https://github.com/USERNAME/twins-basketball-mystery-gift.git
   git push -u origin main
   ```
3. Buka repo di GitHub → **Settings → Pages**.
4. Di bagian **Build and deployment → Source**, pilih **`GitHub Actions`** (bukan "Deploy from a branch").
5. Buka **Settings → Actions → General → Workflow permissions**, pilih **"Read and write permissions"** → Save.
6. Buka tab **Actions** → workflow **"Deploy to GitHub Pages"** akan otomatis berjalan setelah push. Tunggu sampai tanda centang hijau ✅ muncul (biasanya < 1 menit).
7. Website kamu live di:
   ```
   https://USERNAME.github.io/twins-basketball-mystery-gift/
   ```

> 💡 Kenapa sebelumnya stuck di `deployment_queued` terus-menerus? Karena ada **2 workflow berbeda** (`pages.yml` dan `static.yml`) yang sama-sama trigger saat push ke `main`, dan keduanya pakai metode deploy GitHub Pages yang berbeda (branch-based vs Actions-based) — mereka rebutan slot deployment sehingga job selalu nyangkut di antrian. Project ini sengaja **hanya punya satu workflow** (`deploy.yml`) supaya itu tidak terulang.

---

## Langkah 4 — Generate QR Code untuk barcode scan

Setelah website live, buat QR code yang mengarah ke URL GitHub Pages kamu. Bisa pakai situs gratis seperti [qr-code-generator.com](https://www.qr-code-generator.com/) atau [me-qr.com](https://me-qr.com/) — tempel URL, download PNG, cetak/tempel di lokasi Expo.

---

## Cara kerja alur (ringkas)

```
User scan QR
   → buka website (GitHub Pages)
   → isi nama → klik Submit
   → nama tersimpan ke Google Sheets (via Apps Script)
   → muncul di leaderboard "Tercepat Daftar" (real-time, polling tiap 15 detik)

Hari Expo (EVENT_DATE tercapai)
   → panitia jalankan drawWinners() (manual / trigger otomatis)
   → Apps Script mengacak & memilih pemenang, simpan ke sheet "Winners"
   → website mendeteksi & memutar animasi roulette
   → nama pemenang tampil satu-satu + badge "Pemenang"
   → semua pengunjung melihat hasil yang sama (bukan acak per HP)
```

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| Form submit gagal / leaderboard kosong terus | `GAS_URL` belum diisi / salah | Cek ulang `config.js`, test URL + `?action=state` di browser |
| "Nama sudah terdaftar sebelumnya" padahal baru | Duplikat nama (case-insensitive) di sheet | Ini disengaja untuk mencegah spam submit, boleh dihapus logikanya di `Code.gs` fungsi `handleSubmit_` kalau tidak diinginkan |
| Deploy GitHub Pages stuck `queued` | Ada lebih dari 1 workflow Pages aktif | Pastikan hanya ada `deploy.yml`, hapus workflow lama, pastikan Settings → Pages → Source = GitHub Actions |
| Roulette tidak muncul di tanggal yang ditentukan | Format `EVENT_DATE` salah / timezone beda | Pastikan format `YYYY-MM-DDTHH:mm:ss+07:00` (WIB) |
| Pemenang tidak berubah walau `drawWinners()` dijalankan ulang | Sheet Winners sudah terisi (idempotent guard) | Jalankan fungsi `resetWinners()` dulu, baru `drawWinners()` lagi |

---

Made with ♥ by Loonareen Studios
