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
      cell.textContent = board[i] || '·';
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
    const choice = winningMove('O') ?? winningMove('X') ?? open[Math.floor(Math.random() * open.length)];
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
  let direction, next, timer, score;
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
  canvas.addEventListener('keydown', event => {
    if (!timer || !directions[event.key]) return;
    event.preventDefault();
    turn(event.key);
  });
  panel.querySelectorAll('[data-direction]').forEach(button => {
    button.addEventListener('click', () => turn(button.dataset.direction));
  });
  panel.addEventListener('toggle', () => {
    if (!panel.open && timer) stop(`Round ended. ${score} cells collected.`);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer) stop(`Round ended. ${score} cells collected.`);
  });
  start.addEventListener('click', () => {
    clearInterval(timer);
    body = [[4, 7], [3, 7], [2, 7]];
    food = [9, 7];
    direction = next = directions.ArrowRight;
    score = 0;
    status.textContent = 'Score: 0';
    start.textContent = 'Restart Snake';
    paint();
    timer = setInterval(tick, 180);
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
