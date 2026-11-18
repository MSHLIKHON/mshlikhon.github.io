(() => {
  const start = document.querySelector('#signal-start');
  const switchButton = document.querySelector('#signal-switch');
  const clock = document.querySelector('#signal-clock');
  const scoreboard = document.querySelector('#signal-score');
  const result = document.querySelector('#signal-result');
  const lights = [0, 1].map(i => document.querySelector('#signal-light-' + i));
  const traffic = [0, 1].map(i => document.querySelector('#signal-queue-' + i));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vehicles = ['🚗', '🛺'];
  let waiting, green, passed, missed, step, deadline;
  let mode = 'demo', visible = true;
  let best = 0;
  const bestKey = 'msh-signal-best';
  try { best = Number(localStorage.getItem(bestKey)) || 0; } catch {}

  function reset() {
    waiting = [['🚗', '🛺', '🚗'], ['🛺', '🚗']];
    green = passed = missed = step = 0;
  }

  function render() {
    scoreboard.textContent = `${passed} passed · ${missed} turned away`;
    waiting.forEach((lane, index) => {
      const isGreen = index === green;
      lights[index].textContent = isGreen ? 'Green' : 'Red';
      lights[index].classList.toggle('go', isGreen);
      traffic[index].textContent = lane.join(' ') || 'Clear';
      traffic[index].setAttribute('aria-label', `${lane.length} waiting`);
    });
  }

  function stop() {
    mode = 'finished';
    clock.textContent = '0s';
    if (passed > best) {
      best = passed;
      try { localStorage.setItem(bestKey, String(best)); } catch {}
    }
    result.textContent = `${passed} vehicles passed. Personal best: ${best}.`;
    start.textContent = 'Play again';
    if (document.activeElement === switchButton) start.focus({ preventScroll: true });
    switchButton.disabled = true;
  }

  function tick() {
    if (mode === 'finished') return;
    if (mode === 'manual') {
      const remaining = Math.ceil((deadline - performance.now()) / 1000);
      if (remaining <= 0) { stop(); return; }
      clock.textContent = remaining + 's';
    }
    if (document.hidden || (mode === 'demo' && (!visible || reduced))) return;

    step += 1;
    if (mode === 'demo' && step % 4 === 0) green = 1 - green;
    let departing;
    if (waiting[green].length) {
      departing = waiting[green].shift();
      passed += 1;
    }
    const busierRoad = Math.floor(step / 5) % 2;
    const lane = waiting[Math.random() < .7 ? busierRoad : 1 - busierRoad];
    if (lane.length < 5) lane.push(vehicles[step % vehicles.length]);
    else missed += 1;
    render();
    if (departing && !reduced) {
      const car = document.createElement('span');
      car.className = 'signal-departure';
      car.textContent = departing;
      car.setAttribute('aria-hidden', 'true');
      traffic[green].append(car);
      car.addEventListener('animationend', () => car.remove(), { once: true });
    }
  }

  reset();
  render();
  if (reduced) result.textContent = 'Take control to start the traffic.';
  if ('IntersectionObserver' in window) {
    visible = false;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; })
      .observe(document.querySelector('.signal-card'));
  }
  setInterval(tick, 850);
  start.addEventListener('click', () => {
    reset();
    mode = 'manual';
    deadline = performance.now() + 30000;
    clock.textContent = '30s';
    result.textContent = 'Mirpur has the green light. Switch before the other queue fills.';
    start.textContent = 'Restart round';
    switchButton.disabled = false;
    render();
    switchButton.focus({ preventScroll: true });
  });
  switchButton.addEventListener('click', () => {
    if (mode !== 'manual') return;
    if (performance.now() >= deadline) { stop(); return; }
    green = 1 - green;
    result.textContent = (green === 0 ? 'Mirpur' : 'Gulshan') + ' has the green light.';
    render();
  });
})();

(() => {
  const orbit = document.querySelector('#tool-orbit');
  const buttons = [...orbit.querySelectorAll('[data-tool]')];
  const note = document.querySelector('#tool-note');
  const link = document.querySelector('#tool-link');
  const examples = {
    python: ['Python powers the practice workflow in Career Copilot Lab.', 'Career Copilot Lab', 'career_copilot_lab'],
    sql: ['BloodBridge BD uses MySQL to organize donation records and workflow data.', 'BloodBridge BD', 'BloodBridge-BD'],
    php: ['I used PHP while fixing the direct-donation card layout in BloodBridge BD.', 'BloodBridge BD', 'BloodBridge-BD'],
    js: ['JavaScript handles traffic queues, the timer, and signal switches in the demo above.', 'this portfolio', 'mshlikhon.github.io'],
    git: ['Git tracks changes to this portfolio, including its demos and public releases.', 'this portfolio', 'mshlikhon.github.io']
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    const [description, project, repo] = examples[button.dataset.tool];
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    note.textContent = description;
    link.textContent = `Explore ${project} ↗`;
    link.href = `https://github.com/MSHLIKHON/${repo}`;
  }));
  orbit.hidden = false;
})();
