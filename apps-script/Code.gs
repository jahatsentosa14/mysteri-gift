/**
 * ====================================================================
 *  TWINS BASKETBALL - MYSTERY GIFT — BACKEND (Google Apps Script)
 * ====================================================================
 *  Cara pakai: lihat README.md bagian "Setup Google Sheets + Apps
 *  Script". File ini ditempel di Extensions > Apps Script pada Google
 *  Sheet kamu.
 * ====================================================================
 */

// -------------------- KONFIGURASI --------------------
const SHEET_PARTICIPANTS = "Participants";
const SHEET_WINNERS = "Winners";
const MAX_WINNERS = 5; // <-- atur jumlah maksimal pemenang mystery gift di sini
// -------------------------------------------------------

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function participantsSheet_() {
  return getSheet_(SHEET_PARTICIPANTS, ["Timestamp", "Nama"]);
}

function winnersSheet_() {
  return getSheet_(SHEET_WINNERS, ["Rank", "Nama", "Timestamp"]);
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ==================== doGet: baca data ==================== */

function doGet(e) {
  const action = (e.parameter.action || "state").toLowerCase();

  if (action === "state") {
    return jsonOut_(buildState_());
  }

  return jsonOut_({ ok: false, message: "Unknown action" });
}

function buildState_() {
  const pSheet = participantsSheet_();
  const wSheet = winnersSheet_();

  const pValues = pSheet.getDataRange().getValues().slice(1); // skip header
  const wValues = wSheet.getDataRange().getValues().slice(1);

  const fastest = pValues
    .filter((row) => row[1])
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(0, 10)
    .map((row) => ({ timestamp: row[0], name: row[1] }));

  const winners = wValues
    .filter((row) => row[1])
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map((row) => ({ rank: row[0], name: row[1], timestamp: row[2] }));

  return {
    ok: true,
    serverTime: new Date().toISOString(),
    participantsCount: pValues.length,
    fastest: fastest,
    winners: winners,
  };
}

/* ==================== doPost: submit nama ==================== */

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, message: "Payload tidak valid" });
  }

  const action = body.action;

  if (action === "submit") {
    return handleSubmit_(body);
  }

  return jsonOut_({ ok: false, message: "Unknown action" });
}

function handleSubmit_(body) {
  const name = (body.name || "").toString().trim();
  if (!name) {
    return jsonOut_({ ok: false, message: "Nama tidak boleh kosong" });
  }
  if (name.length > 60) {
    return jsonOut_({ ok: false, message: "Nama terlalu panjang" });
  }

  const sheet = participantsSheet_();

  // Cegah duplikat nama (case-insensitive)
  const existing = sheet.getDataRange().getValues().slice(1).map((r) => String(r[1]).toLowerCase());
  if (existing.indexOf(name.toLowerCase()) !== -1) {
    return jsonOut_({ ok: false, message: "Nama ini sudah terdaftar sebelumnya" });
  }

  sheet.appendRow([new Date(), name]);
  return jsonOut_({ ok: true });
}

/* ==================== drawWinners: undian ====================
 * Jalankan fungsi ini secara MANUAL sekali (tombol Run di editor Apps
 * Script), ATAU pasang time-driven trigger (lihat README.md) supaya
 * berjalan otomatis persis di tanggal & jam Expo Ekskul.
 *
 * Fungsi ini idempotent-guarded: kalau sheet Winners sudah pernah
 * terisi, fungsi tidak akan menarik ulang supaya hasil tidak berubah
 * setelah tampil ke publik. Hapus isi sheet Winners kalau memang mau
 * mengulang undian.
 * =============================================================== */

function drawWinners() {
  const wSheet = winnersSheet_();
  const alreadyDrawn = wSheet.getLastRow() > 1;
  if (alreadyDrawn) {
    Logger.log("Winners sudah pernah diundi. Hapus sheet Winners dulu kalau mau mengulang.");
    return;
  }

  const pSheet = participantsSheet_();
  const allRows = pSheet.getDataRange().getValues();
  const header = allRows[0];
  const data = allRows.slice(1).filter((row) => row[1]);

  if (data.length === 0) {
    Logger.log("Belum ada peserta terdaftar.");
    return;
  }

  // Fisher-Yates shuffle
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }

  const winnerCount = Math.min(MAX_WINNERS, data.length);
  const chosen = data.slice(0, winnerCount);

  chosen.forEach((row, idx) => {
    wSheet.appendRow([idx + 1, row[1], new Date()]);
  });

  Logger.log(`${winnerCount} pemenang berhasil diundi.`);
}

/**
 * Helper opsional: hapus semua data Winners untuk mengulang undian
 * dari nol. Jalankan manual lewat editor Apps Script kalau perlu.
 */
function resetWinners() {
  const wSheet = winnersSheet_();
  const lastRow = wSheet.getLastRow();
  if (lastRow > 1) {
    wSheet.getRange(2, 1, lastRow - 1, wSheet.getLastColumn()).clearContent();
  }
}
