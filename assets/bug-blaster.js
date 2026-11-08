(() => {
  const canvas = document.querySelector('#bug-canvas');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  const scoreText = document.querySelector('#bug-score');
  const healthText = document.querySelector('#bug-health');
  const logText = document.querySelector('#bug-log');
  const overlay = document.querySelector('#bug-overlay');
  const kicker = document.querySelector('#bug-kicker');
  const message = document.querySelector('#bug-message');
  const startButton = document.querySelector('#bug-start');
  const autoFire = document.querySelector('#bug-autofire');
  const width = canvas.width;
  const height = canvas.height;

  const bugTypes = [
    { name: '404', color: '#f8c45c', points: 10, speed: 1.2 },
    { name: 'NullPtr', color: '#ff7184', points: 15, speed: 1.45 },
    { name: 'SegFault', color: '#ba8cff', points: 20, speed: 1.7 },
    { name: 'MemLeak', color: '#72f6b1', points: 25, speed: 1.9 }
  ];

  const jet = { x: width / 2, y: height - 42 };
  const heldKeys = new Set();
  let shots = [];
  let bugs = [];
  let sparks = [];
  let score = 0;
  let health = 100;
  let frame = 0;
  let running = false;
  let animationFrame = 0;

  function updateHud() {
    scoreText.textContent = String(score).padStart(3, '0');
    healthText.textContent = Math.max(health, 0) + '%';
    healthText.classList.toggle('danger', health <= 40);
  }

  function fire() {
    if (!running || shots.length > 8) return;
    shots.push({ x: jet.x, y: jet.y - 18 });
  }

  function spawnBug() {
    const type = bugTypes[Math.floor(Math.random() * bugTypes.length)];
    bugs.push({
      ...type,
      x: 58 + Math.random() * (width - 116),
      y: -20,
      speed: type.speed + Math.min(score / 350, 1.25)
    });
  }

  function burst(x, y, color) {
    for (let index = 0; index < 8; index += 1) {
      sparks.push({
        x, y, color, life: 18,
        dx: (Math.random() - 0.5) * 5,
        dy: (Math.random() - 0.5) * 5
      });
    }
  }

  function drawBackground() {
    context.strokeStyle = 'rgba(114, 246, 177, .08)';
    context.lineWidth = 1;
    const offset = frame % 36;
    for (let x = 0; x < width; x += 36) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = offset; y < height; y += 36) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
  }

  function drawJet() {
    context.save();
    context.translate(jet.x, jet.y);
    context.fillStyle = frame % 6 < 3 ? '#72f6b1' : '#f8c45c';
    context.beginPath();
    context.moveTo(-5, 12);
    context.lineTo(5, 12);
    context.lineTo(0, 25);
    context.fill();
    context.fillStyle = '#ecfff7';
    context.beginPath();
    context.moveTo(0, -20);
    context.lineTo(20, 13);
    context.lineTo(6, 8);
    context.lineTo(0, 14);
    context.lineTo(-6, 8);
    context.lineTo(-20, 13);
    context.closePath();
    context.fill();
    context.fillStyle = '#23d98a';
    context.fillRect(-3, -8, 6, 14);
    context.restore();
  }

  function drawBug(bug) {
    context.save();
    context.translate(bug.x, bug.y);
    context.fillStyle = '#0a1713';
    context.strokeStyle = bug.color;
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(-38, -13, 76, 26, 5);
    context.fill();
    context.stroke();
    context.fillStyle = bug.color;
    context.font = '700 12px ui-monospace, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(bug.name, 0, 1);
    context.restore();
  }

  function update() {
    frame += 1;
    if (heldKeys.has('ArrowLeft') || heldKeys.has('KeyA')) jet.x -= 6;
    if (heldKeys.has('ArrowRight') || heldKeys.has('KeyD')) jet.x += 6;
    jet.x = Math.max(24, Math.min(width - 24, jet.x));
    if (autoFire.checked && frame % 14 === 0) fire();
    if (frame % Math.max(35, 66 - Math.floor(score / 60)) === 0) spawnBug();

    shots.forEach(shot => { shot.y -= 8; });
    shots = shots.filter(shot => shot.y > -10);

    bugs.forEach(bug => { bug.y += bug.speed; });
    for (let bugIndex = bugs.length - 1; bugIndex >= 0; bugIndex -= 1) {
      const bug = bugs[bugIndex];
      const shotIndex = shots.findIndex(shot =>
        Math.abs(shot.x - bug.x) < 39 && Math.abs(shot.y - bug.y) < 16
      );
      if (shotIndex >= 0) {
        shots.splice(shotIndex, 1);
        bugs.splice(bugIndex, 1);
        score += bug.points;
        burst(bug.x, bug.y, bug.color);
        logText.textContent = bug.name + ' patched · +' + bug.points;
        updateHud();
        continue;
      }
      const hitJet = Math.abs(bug.x - jet.x) < 50 && Math.abs(bug.y - jet.y) < 28;
      if (bug.y > height + 15 || hitJet) {
        bugs.splice(bugIndex, 1);
        health -= 20;
        burst(bug.x, Math.min(height - 8, bug.y), '#ff7184');
        logText.textContent = bug.name + ' reached production.';
        updateHud();
        if (health <= 0) finish();
      }
    }

    sparks.forEach(spark => {
      spark.x += spark.dx;
      spark.y += spark.dy;
      spark.life -= 1;
    });
    sparks = sparks.filter(spark => spark.life > 0);
  }

  function render() {
    context.clearRect(0, 0, width, height);
    drawBackground();
    context.fillStyle = '#72f6b1';
    context.font = '700 15px ui-monospace, monospace';
    context.textAlign = 'center';
    shots.forEach(shot => context.fillText(';', shot.x, shot.y));
    bugs.forEach(drawBug);
    sparks.forEach(spark => {
      context.globalAlpha = spark.life / 18;
      context.fillStyle = spark.color;
      context.fillRect(spark.x, spark.y, 3, 3);
    });
    context.globalAlpha = 1;
    drawJet();
  }

  function loop() {
    if (!running) return;
    update();
    render();
    animationFrame = requestAnimationFrame(loop);
  }

  function finish() {
    running = false;
    cancelAnimationFrame(animationFrame);
    kicker.textContent = 'SERVER DOWN · 500';
    message.textContent = 'Score ' + score + ' · ship another hotfix?';
    startButton.textContent = 'Reboot and play again';
    overlay.hidden = false;
  }

  function start() {
    cancelAnimationFrame(animationFrame);
    score = 0;
    health = 100;
    frame = 0;
    shots = [];
    bugs = [];
    sparks = [];
    jet.x = width / 2;
    updateHud();
    logText.textContent = 'Jet deployed · scanning production.';
    overlay.hidden = true;
    running = true;
    loop();
  }

  function moveToPointer(clientX) {
    const bounds = canvas.getBoundingClientRect();
    jet.x = (clientX - bounds.left) * width / bounds.width;
    jet.x = Math.max(24, Math.min(width - 24, jet.x));
  }

  startButton.addEventListener('click', start);
  canvas.addEventListener('pointermove', event => {
    if (running) moveToPointer(event.clientX);
  });
  canvas.addEventListener('pointerdown', event => {
    if (!running) return;
    moveToPointer(event.clientX);
    if (!autoFire.checked) fire();
  });
  window.addEventListener('keydown', event => {
    if (!running || !['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space'].includes(event.code)) return;
    heldKeys.add(event.code);
    if (event.code === 'Space') fire();
    event.preventDefault();
  });
  window.addEventListener('keyup', event => heldKeys.delete(event.code));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running) {
      running = false;
      cancelAnimationFrame(animationFrame);
      kicker.textContent = 'PAUSED';
      message.textContent = 'Ready when you are.';
      startButton.textContent = 'Restart round';
      overlay.hidden = false;
    }
  });

  updateHud();
  render();
})();
