(() => {
  const board = document.querySelector('#gridlock-board');
  const next = document.querySelector('#gridlock-next');
  const status = document.querySelector('#gridlock-status');
  const time = document.querySelector('#gridlock-time');
  const moveCount = document.querySelector('#gridlock-moves');
  const bestLabel = document.querySelector('#gridlock-best');
  const scoreKey = 'msh-gridlock-best';
  const size = 4;
  const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const names = ['north', 'east', 'south', 'west'];
  const glyphs = { 3: '└', 5: '│', 6: '┌', 9: '┘', 10: '─', 12: '┐' };
  let map, moves, deadline, timer, finished;
  let best = 0;
  try { best = Number(localStorage.getItem(scoreKey)) || 0; } catch {}

  const opposite = direction => (direction + 2) % 4;
  const bit = direction => 1 << direction;
  const rotate = mask => ((mask << 1) | (mask >> 3)) & 15;
  const random = count => Math.floor(Math.random() * count);

  function trace(tiles) {
    const connected = new Set();
    let col = 0, row = 0, entry = 3;
    while (col >= 0 && col < size && row >= 0 && row < size) {
      const index = row * size + col;
      if (connected.has(index) || !(tiles[index] & bit(entry))) break;
      connected.add(index);
      const exit = directions.findIndex((_, dir) => dir !== entry && (tiles[index] & bit(dir)));
      if (index === size * size - 1 && exit === 1) return { connected, won: true };
      col += directions[exit][0];
      row += directions[exit][1];
      entry = opposite(exit);
    }
    return { connected, won: false };
  }

  function makeMap() {
    const pieces = Object.keys(glyphs).map(Number);
    const tiles = Array.from({ length: size * size }, () => pieces[random(pieces.length)]);
    const steps = [1, 1, 1, 2, 2, 2];
    let index = 0, entry = 3;
    while (steps.length) {
      const [exit] = steps.splice(random(steps.length), 1);
      tiles[index] = bit(entry) | bit(exit);
      index += exit === 1 ? 1 : size;
      entry = opposite(exit);
    }
    tiles[index] = bit(entry) | bit(1);
    const scrambled = tiles.map(mask => {
      for (let turns = random(4); turns > 0; turns--) mask = rotate(mask);
      return mask;
    });
    if (trace(scrambled).won) scrambled[0] = rotate(scrambled[0]);
    return scrambled;
  }

  const buttons = Array.from({ length: size * size }, (_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.addEventListener('click', () => turn(index));
    board.append(button);
    return button;
  });

  function render() {
    const route = trace(map);
    map.forEach((mask, index) => {
      const button = buttons[index];
      button.textContent = glyphs[mask];
      const exits = names.filter((_, dir) => mask & bit(dir)).join(' and ');
      button.setAttribute('aria-label', `Row ${Math.floor(index / size) + 1}, column ${index % size + 1}: ${exits}`);
      button.classList.toggle('connected', route.connected.has(index));
    });
    moveCount.textContent = `${moves} ${moves === 1 ? 'move' : 'moves'}`;
    bestLabel.textContent = best ? `Best ${best}` : 'Best —';
    return route.won;
  }

  function end(message) {
    finished = true;
    clearInterval(timer);
    buttons.forEach(button => button.setAttribute('aria-disabled', 'true'));
    status.textContent = message;
  }

  function tick() {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    time.textContent = `${remaining}s`;
    if (!remaining) end('Time’s up. Try a new map!');
    return remaining;
  }

  function turn(index) {
    if (finished) return;
    if (!deadline) {
      deadline = Date.now() + 60000;
      timer = setInterval(tick, 200);
    }
    const remaining = tick();
    if (!remaining) return;
    map[index] = rotate(map[index]);
    moves++;
    if (!render()) return;
    const score = Math.max(1, 200 + remaining * 5 - moves * 8);
    const record = score > best;
    if (record) {
      best = score;
      try { localStorage.setItem(scoreKey, String(best)); } catch {}
    }
    render();
    end(`Route connected in ${moves} moves! Score: ${score}.${record ? ' New personal best!' : ''}`);
  }

  function reset() {
    clearInterval(timer);
    map = makeMap();
    moves = 0;
    deadline = 0;
    finished = false;
    buttons.forEach(button => button.removeAttribute('aria-disabled'));
    time.textContent = '60s';
    status.textContent = 'Tap a tile or use Tab and Enter to turn it clockwise.';
    render();
  }

  next.addEventListener('click', reset);
  reset();
})();
