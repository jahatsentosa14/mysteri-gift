/**
 * ====================================================================
 *  KONFIGURASI TWINS BASKETBALL - MYSTERY GIFT
 * ====================================================================
 *  File ini adalah SATU-SATUNYA file yang perlu kamu edit untuk
 *  mengatur website ini. Ikuti README.md untuk penjelasan lengkap.
 * ====================================================================
 */

const CONFIG = {
  // 1. URL Web App dari Google Apps Script (lihat README.md langkah 2).
  //    Contoh: "https://script.google.com/macros/s/AKfycb.../exec"
  GAS_URL: "https://script.google.com/macros/s/AKfycbyvTn8MLajACTSdKrXcEdcu89cOP_CbmI1y1vLAo6snLuFzl-fFYUzq46wpUqm__BnN/exec",

  // 2. Tanggal & jam pelaksanaan Expo / undian roulette.
  //    Format: "YYYY-MM-DDTHH:mm:ss" (pakai zona waktu WIB / +07:00)
  //    Sebelum tanggal ini: yang tampil adalah countdown.
  //    Setelah tanggal ini: roulette otomatis muncul & menampilkan pemenang.
  EVENT_DATE: "2026-07-15T09:00:00+07:00",

  // 3. Nama tim / ekstrakulikuler (dipakai di header & judul tab)
  TEAM_NAME: "Twins Basketball",

  // 4. Berapa banyak nama teratas yang ditampilkan di leaderboard "tercepat daftar"
  LEADERBOARD_LIMIT: 10,

  // 5. Interval (ms) pengecekan otomatis ke Google Sheets untuk update
  //    leaderboard & status roulette tanpa perlu refresh halaman.
  POLL_INTERVAL_MS: 15000,
};
