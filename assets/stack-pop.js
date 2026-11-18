(() => {
  const start = document.querySelector('#pop-start');
  if (!start) return;
  const orbs = [...document.querySelectorAll('#pop-orbs button')];
  const target = document.querySelector('#pop-target');
  const time = document.querySelector('#pop-time');
  const scoreLabel = document.querySelector('#pop-score');
  const bestLabel = document.querySelector('#pop-best');
  const storageKey = 'msh-stack-pop-best';
  let best = 0;
  try { best = Number(localStorage.getItem(storageKey)) || 0; } catch {}
  bestLabel.textContent = `Best ${best}`;

  let deadline, timer, current, score, streak;
  let playing = false;

  function nextTarget(prefix = '') {
    const choices = orbs.filter(orb => orb !== current);
    current = choices[Math.floor(Math.random() * choices.length)];
    target.textContent = `${prefix}Find ${current.textContent}.`;
  }

  function tick() {
    const seconds = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
    time.textContent = `${seconds}s`;
    if (seconds) return true;

    playing = false;
    clearInterval(timer);
    const record = score > best;
    if (record) {
      best = score;
      bestLabel.textContent = `Best ${best}`;
      try { localStorage.setItem(storageKey, String(best)); } catch {}
    }
    const focusWasOnOrb = orbs.includes(document.activeElement);
    orbs.forEach(orb => { orb.disabled = true; });
    start.textContent = 'Play again';
    target.textContent = `Time’s up! ${score} points.${record ? ' New best!' : ''}`;
    if (focusWasOnOrb) start.focus({ preventScroll: true });
    return false;
  }

  function pick(orb) {
    if (!playing || !tick()) return;
    orbs.forEach(item => item.classList.remove('pop-hit', 'pop-miss'));
    if (orb !== current) {
      streak = 0;
      orb.classList.add('pop-miss');
      target.textContent = `Try again. Find ${current.textContent}.`;
      return;
    }
    orb.classList.add('pop-hit');
    streak += 1;
    const points = Math.min(streak, 5);
    score += points;
    scoreLabel.textContent = `Score ${score}`;
    nextTarget(`+${points}. `);
  }

  orbs.forEach(orb => orb.addEventListener('click', () => pick(orb)));
  start.addEventListener('click', () => {
    clearInterval(timer);
    score = streak = 0;
    current = null;
    playing = true;
    deadline = performance.now() + 20000;
    scoreLabel.textContent = 'Score 0';
    start.textContent = 'Restart round';
    orbs.forEach(orb => {
      orb.disabled = false;
      orb.classList.remove('pop-hit', 'pop-miss');
    });
    nextTarget();
    tick();
    timer = setInterval(tick, 150);
  });
})();
