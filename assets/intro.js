(() => {
  const intro = document.querySelector('#site-intro');
  if (!intro || location.hash || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (sessionStorage.getItem('portfolio-intro-v2')) return;
    sessionStorage.setItem('portfolio-intro-v2', 'seen');
  } catch {}

  const percent = document.querySelector('#intro-percent');
  const started = performance.now();
  let frame;
  let finishTimer;

  function dismiss() {
    intro.hidden = true;
    cancelAnimationFrame(frame);
    clearTimeout(finishTimer);
    document.removeEventListener('keydown', dismiss);
    document.removeEventListener('pointerdown', dismiss);
  }

  function animate(now) {
    const progress = Math.min(100, Math.floor((now - started) / 7));
    percent.textContent = progress + '%';
    intro.style.setProperty('--intro-progress', progress + '%');
    if (progress < 100) {
      frame = requestAnimationFrame(animate);
      return;
    }
    intro.classList.add('welcome');
  }

  intro.hidden = false;
  document.addEventListener('keydown', dismiss);
  document.addEventListener('pointerdown', dismiss);
  finishTimer = setTimeout(dismiss, 1450);
  frame = requestAnimationFrame(animate);
})();
