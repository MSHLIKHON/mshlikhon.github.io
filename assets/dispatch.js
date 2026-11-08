(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arrival = document.querySelector('#arrival');
  let seen = false;
  try { seen = sessionStorage.getItem('msh-arrived') === 'yes'; } catch {}
  if (!seen && !location.hash && !reduced) {
    arrival.hidden = false;
    const enter = arrival.querySelector('button');
    const close = () => {
      if (arrival.hidden) return;
      arrival.hidden = true;
      try { sessionStorage.setItem('msh-arrived', 'yes'); } catch {}
      if (document.activeElement === enter) document.querySelector('.brand').focus();
    };
    enter.onclick = close;
    arrival.onkeydown = event => { if (event.key === 'Escape' || event.key === 'Tab') close(); };
    enter.focus({preventScroll:true});
    setTimeout(close, 1900);
  }

  const board = document.querySelector('.dispatch-board');
  const stations = [...board.querySelectorAll('.dispatch-stations button')];
  const mode = document.querySelector('#dispatch-mode');
  const request = document.querySelector('#dispatch-request');
  const score = document.querySelector('#dispatch-score');
  const start = document.querySelector('#dispatch-start');
  let playing = false, delivered = 0, target = 0;
  function showRequest(prefix = 'Incoming EV') {
    request.textContent = prefix + ' → ' + stations[target].textContent;
    stations.forEach((button, index) => button.classList.toggle('demo-dock', !playing && index === target));
  }
  function next() { target = (target + 1 + Math.floor(Math.random() * 2)) % stations.length; }
  function begin() {
    playing = true;
    delivered = 0;
    mode.textContent = 'Your control';
    score.textContent = '0 / 5 routed';
    start.textContent = 'Restart round';
    showRequest();
  }
  function route(index) {
    if (!playing) return;
    if (index !== target) { showRequest('Station mismatch · requested'); return; }
    score.textContent = ++delivered + ' / 5 routed';
    if (delivered === 5) {
      playing = false;
      mode.textContent = 'Round complete';
      request.textContent = 'All five EVs reached their stations.';
      start.textContent = 'Play again';
    } else { next(); showRequest('Delivered! Next EV'); }
  }
  board.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' && !delivered && !playing) begin(); });
  stations.forEach((station,index) => {
    station.onpointerenter = event => { if (event.pointerType === 'mouse') route(index); };
    station.onclick = event => {
      if (delivered === 5) return;
      if (!playing) begin();
      if (event.detail === 0 || !matchMedia('(hover:hover) and (pointer:fine)').matches) route(index);
    };
  });
  start.onclick = begin;
  showRequest();
  if (!reduced) {
    const demo = setInterval(() => {
      if (playing || delivered) { clearInterval(demo); return; }
      if (!document.hidden && board.getBoundingClientRect().bottom > 0 && board.getBoundingClientRect().top < innerHeight) {
        next(); showRequest();
      }
    }, 1600);
  }
})();
