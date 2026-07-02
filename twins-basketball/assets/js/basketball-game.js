/**
 * Mini basketball game — drag the clay ball, release toward the hoop.
 * Purely decorative/interactive, score is not persisted anywhere.
 */
(function () {
  const box = document.querySelector(".hoop-mini");
  const ball = document.querySelector(".ball");
  const scoreEl = document.querySelector(".hoop-score");
  if (!box || !ball || !scoreEl) return;

  let score = 0;
  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 8, originBottom = 6;
  const hoopTarget = { x: box.clientWidth - 27, y: 17 }; // approx rim center

  function resetBall() {
    ball.style.left = originLeft + "px";
    ball.style.bottom = originBottom + "px";
    ball.style.transform = "translate(0,0)";
  }
  resetBall();

  function pointerDown(e) {
    dragging = true;
    ball.classList.add("dragging");
    const p = getPoint(e);
    startX = p.x;
    startY = p.y;
    ball.setPointerCapture && e.pointerId != null && ball.setPointerCapture(e.pointerId);
  }

  function getPoint(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function pointerMove(e) {
    if (!dragging) return;
    const p = getPoint(e);
    const dx = p.x - startX;
    const dy = p.y - startY;
    // limit drag radius so it stays playful, not chaotic
    const clampedX = Math.max(-30, Math.min(30, dx));
    const clampedY = Math.max(-30, Math.min(30, dy));
    ball.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  }

  function pointerUp(e) {
    if (!dragging) return;
    dragging = false;
    ball.classList.remove("dragging");
    const p = getPoint(e.changedTouches ? { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY } : e);
    const dx = p.x - startX;
    const dy = p.y - startY;

    // A shoot needs an upward + rightward pull (toward the hoop, up-left drag)
    const power = Math.sqrt(dx * dx + dy * dy);
    const pulledUpLeft = dx < -6 && dy > 6;

    if (pulledUpLeft && power > 14) {
      shoot();
    } else {
      // snap back gently
      ball.style.transition = "transform 0.2s ease";
      ball.style.transform = "translate(0,0)";
      setTimeout(() => (ball.style.transition = ""), 200);
    }
  }

  function shoot() {
    ball.style.transition = "transform 0.55s cubic-bezier(.2,.7,.3,1)";
    const targetX = hoopTarget.x - originLeft;
    const targetY = -(box.clientHeight - hoopTarget.y - originBottom);
    ball.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.55)`;

    // small chance-based "swish" feel: closer aim = more likely to score
    const willScore = Math.random() < 0.75;

    setTimeout(() => {
      if (willScore) {
        score += 1;
        scoreEl.textContent = "Skor: " + score;
        flashText("SWISH!");
      } else {
        flashText("MELESET!");
      }
      ball.style.transition = "transform 0.3s ease";
      ball.style.transform = "translate(0,0) scale(1)";
      setTimeout(() => (ball.style.transition = ""), 300);
    }, 420);
  }

  function flashText(text) {
    const flash = document.createElement("div");
    flash.textContent = text;
    flash.style.position = "absolute";
    flash.style.top = "34px";
    flash.style.left = "0";
    flash.style.right = "0";
    flash.style.textAlign = "center";
    flash.style.fontFamily = "var(--font-display)";
    flash.style.fontSize = "0.6rem";
    flash.style.color = "var(--magenta-deep)";
    flash.style.zIndex = "4";
    box.appendChild(flash);
    setTimeout(() => flash.remove(), 650);
  }

  ball.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerup", pointerUp);

  // touch fallback for older browsers
  ball.addEventListener("touchstart", pointerDown, { passive: true });
  window.addEventListener("touchmove", pointerMove, { passive: true });
  window.addEventListener("touchend", pointerUp);
})();
