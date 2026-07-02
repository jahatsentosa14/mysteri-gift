/**
 * Twins Basketball — Mystery Gift
 * Talks to a Google Apps Script Web App (see apps-script/Code.gs + README.md)
 * which uses a Google Sheet as the database.
 */

const $ = (sel) => document.querySelector(sel);

const els = {
  form: $("#name-form"),
  nameInput: $("#name-input"),
  formMsg: $("#form-msg"),
  reminderBox: $("#reminder-box"),
  fastestList: $("#fastest-list"),
  winnerList: $("#winner-list"),
  countdownWrap: $("#countdown-wrap"),
  rouletteWrap: $("#roulette-wrap"),
  rouletteDisplay: $("#roulette-display"),
  rouletteStatus: $("#roulette-status"),
  cd: {
    d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s"),
  },
};

let hasSubmitted = false;
let rouletteRevealStarted = false;

/* ---------------- Utility: talk to Apps Script without CORS preflight ---------------- */

async function gasGet(action) {
  const url = `${CONFIG.GAS_URL}?action=${encodeURIComponent(action)}&_=${Date.now()}`;
  const res = await fetch(url, { method: "GET" });
  return res.json();
}

async function gasPost(payload) {
  // Using text/plain avoids a CORS preflight (Apps Script Web Apps don't
  // handle the OPTIONS preflight request), Code.gs parses it as JSON itself.
  const res = await fetch(CONFIG.GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

/* ---------------- Form submit ---------------- */

els.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = els.nameInput.value.trim();
  if (!name) {
    setFormMsg("Nama wajib diisi ya! ✏️", "err");
    return;
  }

  const btn = els.form.querySelector("button[type=submit]");
  btn.disabled = true;
  setFormMsg("Menyimpan namamu...", "");

  try {
    const result = await gasPost({ action: "submit", name });
    if (result.ok) {
      setFormMsg("Berhasil! Nama kamu sudah tercatat 🎉", "ok");
      els.nameInput.value = "";
      els.reminderBox.classList.add("show");
      hasSubmitted = true;
      loadState();
    } else {
      setFormMsg(result.message || "Gagal menyimpan, coba lagi ya.", "err");
    }
  } catch (err) {
    setFormMsg("Gagal terhubung ke server. Cek koneksi internetmu.", "err");
  } finally {
    btn.disabled = false;
  }
});

function setFormMsg(text, type) {
  els.formMsg.textContent = text;
  els.formMsg.className = "form-msg" + (type ? " " + type : "");
}

/* ---------------- Leaderboard rendering ---------------- */

function renderList(container, items, isWinner) {
  container.innerHTML = "";
  if (!items || items.length === 0) {
    container.innerHTML = `<li class="leader-empty">Belum ada data.</li>`;
    return;
  }
  items.forEach((item, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="leader-rank">${isWinner ? item.rank : idx + 1}</span>
      <span class="leader-name">${escapeHtml(item.name)}</span>
      ${isWinner ? `<span class="winner-badge">Pemenang</span>` : ""}
    `;
    container.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------- Countdown ---------------- */

function tickCountdown() {
  const target = new Date(CONFIG.EVENT_DATE).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    els.countdownWrap.classList.add("hidden");
    els.rouletteWrap.classList.remove("hidden");
    return false; // stop ticking, event has started
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  els.cd.d.textContent = String(d).padStart(2, "0");
  els.cd.h.textContent = String(h).padStart(2, "0");
  els.cd.m.textContent = String(m).padStart(2, "0");
  els.cd.s.textContent = String(s).padStart(2, "0");
  return true;
}

/* ---------------- Roulette reveal ----------------
 * The actual random draw happens server-side in Apps Script (see
 * drawWinners() in Code.gs), triggered by a time-driven trigger you set
 * up once in the Apps Script editor. The frontend never decides winners
 * itself — it only fetches the already-decided winner list and plays a
 * spinning animation through the participant pool before landing on the
 * real result, so every visitor sees a consistent outcome.
 */

function playRouletteReveal(participantNames, winners) {
  if (rouletteRevealStarted) return;
  rouletteRevealStarted = true;

  if (!winners || winners.length === 0) {
    els.rouletteStatus.textContent = "Menunggu panitia memulai undian... ⏳";
    return;
  }

  const pool = participantNames.length ? participantNames : winners.map((w) => w.name);
  let winnerIndex = 0;

  function revealNext() {
    if (winnerIndex >= winners.length) {
      els.rouletteStatus.innerHTML = `<span class="confetti-emoji">🎉🏀🎉</span> Semua pemenang sudah terpilih!`;
      renderList(els.winnerList, winners, true);
      return;
    }

    const winner = winners[winnerIndex];
    let spins = 0;
    const maxSpins = 18 + winnerIndex * 4;
    els.rouletteStatus.textContent = `Mengundi pemenang #${winner.rank}...`;

    const spinTimer = setInterval(() => {
      const randomName = pool[Math.floor(Math.random() * pool.length)];
      els.rouletteDisplay.innerHTML = `<span class="name-spin">${escapeHtml(randomName)}</span>`;
      spins++;
      if (spins >= maxSpins) {
        clearInterval(spinTimer);
        els.rouletteDisplay.innerHTML = `<span class="name-spin">🏆 ${escapeHtml(winner.name)}</span>`;
        els.rouletteStatus.innerHTML = `<span class="confetti-emoji">🎉</span> Pemenang #${winner.rank}: <b>${escapeHtml(winner.name)}</b>`;
        winnerIndex++;
        setTimeout(revealNext, 1800);
      }
    }, 90);
  }

  revealNext();
}

/* ---------------- Polling state from Apps Script ---------------- */

async function loadState() {
  try {
    const state = await gasGet("state");
    if (!state.ok) return;

    renderList(els.fastestList, state.fastest, false);

    const eventStarted = Date.now() >= new Date(CONFIG.EVENT_DATE).getTime();
    if (eventStarted) {
      els.countdownWrap.classList.add("hidden");
      els.rouletteWrap.classList.remove("hidden");
      const names = (state.fastest || []).map((p) => p.name);
      playRouletteReveal(names, state.winners);
    } else if (state.winners && state.winners.length > 0) {
      // Winners already drawn early — show them without waiting further
      els.countdownWrap.classList.add("hidden");
      els.rouletteWrap.classList.remove("hidden");
      const names = (state.fastest || []).map((p) => p.name);
      playRouletteReveal(names, state.winners);
    } else {
      renderList(els.winnerList, state.winners, true);
    }
  } catch (err) {
    // Silently ignore transient network errors during polling
    console.warn("Gagal memuat data:", err);
  }
}

/* ---------------- Init ---------------- */

function init() {
  document.title = CONFIG.TEAM_NAME + " — Mystery Gift";
  document.querySelectorAll(".js-team-name").forEach((el) => (el.textContent = CONFIG.TEAM_NAME));

  const stillCounting = tickCountdown();
  if (stillCounting) {
    setInterval(tickCountdown, 1000);
  }

  loadState();
  setInterval(loadState, CONFIG.POLL_INTERVAL_MS);
}

init();
