function readBest(game) { try { return Number(localStorage.getItem('msh-arcade-' + game)) || 0; } catch { return 0; } }
function saveBest(game, score) { try { localStorage.setItem('msh-arcade-' + game, score); } catch {} }
(() => {
  const tabs = [...document.querySelectorAll('[data-game]')];
  function select(tab) {
    tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', selected); item.tabIndex = selected ? 0 : -1; document.getElementById(item.dataset.game).hidden = !selected; });
    document.dispatchEvent(new Event('arcadechange'));
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      e.preventDefault(); select(tabs[next]); tabs[next].focus();
    });
  });
})();

function boardButtons(board, count, choose) {
  return Array.from({ length: count }, (_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.addEventListener('click', () => choose(index));
    board.append(button);
    return button;
  });
}

(() => {
  const status = document.querySelector('#ttt-status');
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const cells = boardButtons(document.querySelector('#ttt-board'), 9, play);
  let board, pending, busy, ended;
  const winner = mark => wins.some(line => line.every(i => board[i] === mark));
  const available = () => board.flatMap((mark, i) => mark ? [] : [i]);

  function render() {
    cells.forEach((cell, i) => {
      cell.textContent = board[i] || '';
      cell.dataset.mark = board[i];
      cell.classList.toggle('winner', wins.some(line => line.includes(i) && line.every(n => board[n] && board[n] === board[i])));
      cell.setAttribute('aria-label', `Square ${i + 1}: ${board[i] || 'empty'}`);
      cell.setAttribute('aria-disabled', String(ended || busy || Boolean(board[i])));
    });
  }

  function finish(mark) {
    if (winner(mark)) status.textContent = mark === 'X' ? 'You win!' : 'Computer wins.';
    else if (!available().length) status.textContent = 'Draw.';
    else return false;
    ended = true;
    return true;
  }

  function computer() {
    const open = available();
    function winningMove(mark) {
      return open.find(i => {
        board[i] = mark;
        const winsNow = winner(mark);
        board[i] = '';
        return winsNow;
      });
    }
    function minimax(mark, depth) {
      if (winner('O')) return 10 - depth;
      if (winner('X')) return depth - 10;
      const free = available();
      if (!free.length) return 0;
      const scores = free.map(i => { board[i] = mark; const score = minimax(mark === 'O' ? 'X' : 'O', depth + 1); board[i] = ''; return score; });
      return mark === 'O' ? Math.max(...scores) : Math.min(...scores);
    }
    let choice;
    if (document.querySelector('#ttt-level').value === 'expert') {
      let best = -Infinity;
      open.forEach(i => { board[i] = 'O'; const score = minimax('X', 0); board[i] = ''; if (score > best) { best = score; choice = i; } });
    } else choice = winningMove('O') ?? winningMove('X') ?? open[Math.floor(Math.random() * open.length)];
    board[choice] = 'O';
    busy = false;
    if (!finish('O')) status.textContent = 'Your turn.';
    render();
  }

  function play(i) {
    if (busy || ended || board[i]) return;
    board[i] = 'X';
    if (!finish('X')) {
      busy = true;
      status.textContent = 'Computer’s turn…';
      pending = setTimeout(computer, 320);
    }
    render();
  }

  function reset() {
    clearTimeout(pending);
    board = Array(9).fill('');
    busy = ended = false;
    status.textContent = 'Your turn.';
    render();
  }
  document.querySelector('#ttt-reset').addEventListener('click', reset);
  document.querySelector('#ttt-level').addEventListener('change', reset);
  reset();
})();

(() => {
  const names = ['Python', 'SQL', 'Git', 'PHP', 'Java', 'CSS'];
  const status = document.querySelector('#memory-status');
  const cells = boardButtons(document.querySelector('#memory-board'), 12, flip);
  let deck, open, matched, turns, pending;

  function render() {
    cells.forEach((cell, i) => {
      const shown = open.includes(i) || matched.has(i);
      cell.textContent = shown ? deck[i] : '?';
      cell.classList.toggle('revealed', shown);
      cell.classList.toggle('matched', matched.has(i));
      cell.setAttribute('aria-label', `Card ${i + 1}: ${shown ? deck[i] : 'face down'}${matched.has(i) ? ', matched' : ''}`);
      cell.setAttribute('aria-disabled', String(shown || open.length === 2));
    });
    const pairs = matched.size / 2;
    if (pairs === 6) { const best = readBest('memory'); if (!best || turns < best) saveBest('memory', turns); }
    document.querySelector('#memory-best').textContent = `Best: ${readBest('memory') || '—'} turns`;
    status.textContent = pairs === 6 ? `All six pairs in ${turns} turns!` : `${turns} turns · ${pairs} of 6 pairs`;
  }

  function flip(i) {
    if (open.length === 2 || open.includes(i) || matched.has(i)) return;
    open.push(i);
    if (open.length === 2) {
      turns++;
      const [first, second] = open;
      if (deck[first] === deck[second]) {
        matched.add(first);
        matched.add(second);
        open = [];
      } else {
        pending = setTimeout(() => { open = []; render(); }, 700);
      }
    }
    render();
  }

  function reset() {
    clearTimeout(pending);
    deck = [...names, ...names];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    open = [];
    matched = new Set();
    turns = 0;
    render();
  }
  document.querySelector('#memory-reset').addEventListener('click', reset);
  reset();
})();

(() => {
  const panel = document.querySelector('#snake-game');
  const canvas = document.querySelector('#snake-board');
  const draw = canvas.getContext('2d');
  if (!draw) return;
  const status = document.querySelector('#snake-status');
  const start = document.querySelector('#snake-start');
  const size = 14;
  const tile = canvas.width / size;
  const directions = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] };
  let body = [[4, 7], [3, 7], [2, 7]], food = [9, 7];
  let direction, next, timer, score, paused = false, active = false;
  const pause = document.querySelector('#snake-pause');
  const speed = document.querySelector('#snake-speed');
  const bestLabel = document.querySelector('#snake-best');
  bestLabel.textContent = `Best: ${readBest('snake')}`;
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];

  function paint() {
    draw.fillStyle = '#0a1a15';
    draw.fillRect(0, 0, canvas.width, canvas.height);
    draw.fillStyle = '#143029';
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) draw.fillRect(x * tile + 1, y * tile + 1, tile - 2, tile - 2);
    }
    if (food) {
      draw.fillStyle = '#ffd173';
      draw.fillRect(food[0] * tile + 5, food[1] * tile + 5, tile - 10, tile - 10);
    }
    body.forEach(([x, y], i) => {
      draw.fillStyle = i ? '#43b98b' : '#a3ffd0';
      draw.fillRect(x * tile + 2, y * tile + 2, tile - 4, tile - 4);
    });
  }

  function stop(message) {
    clearInterval(timer);
    timer = null;
    status.textContent = message;
    start.textContent = 'Play again';
    active = false; pause.disabled = true; speed.disabled = false;
  }

  function tick() {
    direction = next;
    const head = [body[0][0] + direction[0], body[0][1] + direction[1]];
    const eats = same(head, food);
    if (head.some(n => n < 0 || n >= size) ||
        (eats ? body : body.slice(0, -1)).some(cell => same(head, cell))) {
      stop(`Game over. ${score} cells collected.`);
      return;
    }
    body.unshift(head);
    if (!eats) body.pop();
    else {
      score++;
      if (score > readBest('snake')) saveBest('snake', score);
      bestLabel.textContent = `Best: ${readBest('snake')}`;
      const taken = new Set(body.map(([x, y]) => y * size + x));
      const free = Array.from({ length: size * size }, (_, i) => i).filter(i => !taken.has(i));
      const position = free[Math.floor(Math.random() * free.length)];
      food = free.length ? [position % size, Math.floor(position / size)] : null;
      if (!food) stop(`Board cleared! ${score} cells collected.`);
      else status.textContent = `Score: ${score}`;
    }
    paint();
  }

  function turn(key) {
    if (!timer) return;
    const candidate = directions[key];
    if (candidate && !same(candidate, direction.map(n => -n))) next = candidate;
  }
  function togglePause() {
    if (!active) return;
    paused = !paused;
    clearInterval(timer); timer = paused ? null : setInterval(tick, Number(speed.value));
    pause.textContent = paused ? 'Resume' : 'Pause';
    status.textContent = paused ? `Paused · Score: ${score}` : `Score: ${score}`;
  }
  pause.addEventListener('click', togglePause);
  canvas.addEventListener('keydown', event => {
    const keys = {w:'ArrowUp',a:'ArrowLeft',s:'ArrowDown',d:'ArrowRight'};
    const key = keys[event.key.toLowerCase()] || event.key;
    if (key === ' ' && active) { event.preventDefault(); togglePause(); }
    if (directions[key] && active) { event.preventDefault(); turn(key); }
  });
  let touch;
  canvas.addEventListener('pointerdown', event => { touch = [event.clientX, event.clientY]; canvas.setPointerCapture(event.pointerId); });
  canvas.addEventListener('pointerup', event => {
    if (!touch) return;
    const dx = event.clientX - touch[0], dy = event.clientY - touch[1]; touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'));
  });
  panel.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => turn(button.dataset.direction)));
  function autoPause() { if (active && !paused && (document.hidden || panel.hidden)) togglePause(); }
  document.addEventListener('visibilitychange', autoPause);
  document.addEventListener('arcadechange', autoPause);
  start.addEventListener('click', () => {
    clearInterval(timer);
    body = [[4, 7], [3, 7], [2, 7]];
    food = [9, 7];
    direction = next = directions.ArrowRight;
    score = 0;
    status.textContent = 'Score: 0';
    start.textContent = 'Restart Snake';
    paint();
    active = true; paused = false; pause.disabled = false; pause.textContent = 'Pause'; speed.disabled = true;
    timer = setInterval(tick, Number(speed.value));
    canvas.focus({ preventScroll: true });
  });
  paint();
})();

(() => {
  const station = document.querySelector('#station');
  const slot = document.querySelector('#slot');
  const reserve = document.querySelector('#reserve');
  const receipt = document.querySelector('#receipt');
  const availability = { 'Dhaka North': [2, 0, 1], 'Dhaka South': [0, 3, 2] };
  const held = new Set();
  const key = () => `${station.value} / ${slot.value}`;
  const spaces = () => availability[station.value][slot.selectedIndex];

  function update() {
    const reserved = held.has(key());
    const count = spaces() - Number(reserved);
    reserve.disabled = !count || reserved;
    if (reserved) receipt.textContent = `Sample hold confirmed · ${key()}`;
    else if (count) receipt.textContent = `${count} connector${count > 1 ? 's' : ''} free · ${key()}`;
    else receipt.textContent = 'This slot is full. Try another time or station.';
  }
  station.addEventListener('change', update);
  slot.addEventListener('change', update);
  reserve.addEventListener('click', () => {
    if (!spaces() || held.has(key())) return;
    held.add(key());
    update();
  });
  update();
})();

(() => {
  const panel = document.querySelector('#ev-game');
  const start = document.querySelector('#ev-start');
  const pause = document.querySelector('#ev-pause');
  const status = document.querySelector('#ev-status');
  const clock = document.querySelector('#ev-clock');
  const score = document.querySelector('#ev-score');
  let bays, selected = 0, remaining = 45, charged = 0, missed = 0, active = false, paused = false, last = 0;
  const buttons = boardButtons(document.querySelector('#ev-bays'), 3, select);
  const newCar = () => ({ battery: 15 + Math.random() * 25, patience: 12 + Math.random() * 9 });
  buttons.forEach((button, i) => {
    button.innerHTML = `<small>BAY 0${i + 1}</small><span class="ev-car" aria-hidden="true">🚙</span><strong></strong><span class="battery" aria-hidden="true"><i></i></span><small class="patience"></small>`;
  });
  function render() {
    buttons.forEach((button, i) => {
      const car = bays[i];
      button.classList.toggle('active', selected === i);
      button.setAttribute('aria-pressed', String(selected === i));
      button.disabled = !active || paused;
      button.querySelector('strong').textContent = `${Math.floor(car.battery)}%`;
      button.querySelector('i').style.width = `${car.battery}%`;
      const patience = button.querySelector('.patience');
      patience.textContent = `${Math.ceil(car.patience)}s left${selected === i ? ' ⚡' : ''}`;
      patience.classList.toggle('urgent', car.patience < 5);
      button.setAttribute('aria-label', `Bay ${i + 1}, ${Math.floor(car.battery)} percent charged, ${Math.ceil(car.patience)} seconds left${selected === i ? ', charging' : ''}`);
    });
    clock.textContent = `${Math.ceil(remaining)}s ${paused ? '· paused' : 'remaining'}`;
    score.textContent = `${charged} charged · ${missed} missed`;
  }
  function select(i) { if (active && !paused) { selected = i; render(); } }
  function togglePause() {
    if (!active) return;
    paused = !paused; last = performance.now();
    pause.textContent = paused ? 'Resume' : 'Pause';
    status.textContent = paused ? 'Round paused. Resume when you’re ready.' : `Power routed to bay ${selected + 1}.`;
    render();
  }
  start.addEventListener('click', () => {
    bays = Array.from({length:3}, newCar); remaining = 45; charged = missed = selected = 0;
    active = true; paused = false; last = performance.now();
    start.textContent = 'Restart round'; pause.disabled = false; pause.textContent = 'Pause';
    status.textContent = 'Bay 1 is charging. Watch the other drivers’ countdowns.';
    render(); buttons[0].focus({preventScroll:true});
  });
  pause.addEventListener('click', togglePause);
  panel.addEventListener('keydown', e => { if (['1','2','3'].includes(e.key)) { e.preventDefault(); select(Number(e.key) - 1); } });
  function autoPause() { if (active && !paused && (document.hidden || panel.hidden)) togglePause(); }
  document.addEventListener('visibilitychange', autoPause);
  document.addEventListener('arcadechange', autoPause);
  setInterval(() => {
    const now = performance.now();
    if (!active || paused) { last = now; return; }
    const dt = Math.min((now - last) / 1000, .5); last = now;
    remaining = Math.max(0, remaining - dt);
    bays.forEach((car, i) => {
      car.patience -= dt;
      if (i === selected) car.battery = Math.min(100, car.battery + dt * 24);
      if (car.battery >= 100) { charged++; bays[i] = newCar(); status.textContent = `EV charged at bay ${i + 1}. Next driver is ready!`; }
      else if (car.patience <= 0) { missed++; bays[i] = newCar(); status.textContent = `A driver left bay ${i + 1}. Keep an eye on the countdowns.`; }
    });
    if (!remaining) {
      active = false; pause.disabled = true; start.textContent = 'Play again';
      if (charged > readBest('ev')) saveBest('ev', charged);
      status.textContent = `Shift complete! ${charged} EVs charged, ${missed} missed. Personal best: ${readBest('ev')}.`;
    }
    render();
  }, 100);
  bays = Array.from({length:3}, newCar); render();
})();
