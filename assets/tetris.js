(() => {
  const panel = document.querySelector('#tetris-game');
  if (!panel) return;
  const canvas = document.querySelector('#tetris-board'), ctx = canvas.getContext('2d');
  const preview = document.querySelector('#tetris-next').getContext('2d');
  const start = document.querySelector('#tetris-start'), pause = document.querySelector('#tetris-pause');
  const status = document.querySelector('#tetris-status');
  // Sharper rendering on retina displays; every draw call below works in
  // the same 300x600 / 120x120 coordinate space, only the backing store grows.
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  if (pixelRatio > 1) {
    canvas.width = 300 * pixelRatio; canvas.height = 600 * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const nextCanvas = document.querySelector('#tetris-next');
    nextCanvas.width = 120 * pixelRatio; nextCanvas.height = 120 * pixelRatio;
    preview.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }
  let bgGradient = null;
  const shapes = [ [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]] ];
  const colors = ['#66d9ef','#f7d46e','#c4a0ff','#72f6b1','#ff8291','#7da9ff','#f7ad73'];
  let grid, piece, next, bag = [], score = 0, lines = 0, active = false, paused = false, frame, last = 0, elapsed = 0;
  const level = () => 1 + Math.floor(lines / 10);
  function take() {
    if (!bag.length) {
      bag = [0,1,2,3,4,5,6];
      for (let i = 6; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    }
    return bag.pop();
  }
  function fits(matrix, x, y) {
    return matrix.every((row, dy) => row.every((cell, dx) => !cell || (x+dx >= 0 && x+dx < 10 && y+dy >= 0 && y+dy < 20 && !grid[y+dy][x+dx])));
  }
  function blockPath(context, px, py, w, h, r) {
    context.beginPath();
    if (context.roundRect) context.roundRect(px, py, w, h, r);
    else context.rect(px, py, w, h);
  }
  function block(context, x, y, color, size, ghost = false) {
    if (ghost) { context.strokeStyle = color; context.lineWidth = 1.5; blockPath(context, x*size+3, y*size+3, size-6, size-6, size*0.18); context.stroke(); }
    else {
      context.fillStyle = color;
      blockPath(context, x*size+1, y*size+1, size-2, size-2, size*0.2); context.fill();
      context.fillStyle = '#ffffff38'; blockPath(context, x*size+4, y*size+3, size-8, 4, 2); context.fill();
      context.fillStyle = '#00000020'; blockPath(context, x*size+4, y*size+size-7, size-8, 4, 2); context.fill();
    }
  }
  function paint() {
    if (!bgGradient) { bgGradient = ctx.createLinearGradient(0, 0, 0, 600); bgGradient.addColorStop(0, '#0c211a'); bgGradient.addColorStop(1, '#071510'); }
    ctx.fillStyle = bgGradient; ctx.fillRect(0,0,300,600);
    ctx.strokeStyle = '#ffffff08';
    for(let x=0;x<=10;x++){ctx.beginPath();ctx.moveTo(x*30,0);ctx.lineTo(x*30,600);ctx.stroke();}
    for(let y=0;y<=20;y++){ctx.beginPath();ctx.moveTo(0,y*30);ctx.lineTo(300,y*30);ctx.stroke();}
    grid.forEach((row,y)=>row.forEach((cell,x)=>{if(cell)block(ctx,x,y,colors[cell-1],30);}));
    if(piece) {
      let landing = piece.y;
      while(fits(piece.matrix,piece.x,landing+1))landing++;
      piece.matrix.forEach((row,y)=>row.forEach((cell,x)=>{if(cell){block(ctx,piece.x+x,landing+y,colors[piece.type],30,true);block(ctx,piece.x+x,piece.y+y,colors[piece.type],30);}}));
    }
    preview.clearRect(0,0,120,120);
    const matrix=shapes[next]; const ox=(4-matrix[0].length)/2, oy=(4-matrix.length)/2;
    matrix.forEach((row,y)=>row.forEach((cell,x)=>{if(cell)block(preview,ox+x,oy+y,colors[next],30);}));
    document.querySelector('#tetris-score').textContent=score;
    document.querySelector('#tetris-level').textContent=`${lines} / ${level()}`;
    document.querySelector('#tetris-best').textContent=readBest('tetris');
    if(paused || !active){ctx.fillStyle='#050f0bd9';ctx.fillRect(0,235,300,115);ctx.fillStyle='#72f6b1';ctx.fillRect(0,235,300,2);ctx.fillStyle='#ecfff7';ctx.textAlign='center';ctx.font='700 21px Sora, system-ui, sans-serif';ctx.fillText(paused?'PAUSED':piece?'GAME OVER':'READY TO STACK',150,285);ctx.font='500 13px "JetBrains Mono", ui-monospace, monospace';ctx.fillText(paused?'Resume when you’re ready':piece?'Try another round':'Press Start Tetris',150,315);}
  }
  function spawn() {
    piece={type:next,matrix:shapes[next].map(row=>row.slice()),x:Math.floor((10-shapes[next][0].length)/2),y:0};next=take();
    if(!fits(piece.matrix,piece.x,piece.y)) {
      active=false;pause.disabled=true;start.textContent='Play again';cancelAnimationFrame(frame);
      status.textContent=`Stack full. ${score} points, ${lines} lines. Ready for another round?`;
    }
  }
  function lock() {
    piece.matrix.forEach((row,y)=>row.forEach((cell,x)=>{if(cell)grid[piece.y+y][piece.x+x]=piece.type+1;}));
    const kept=grid.filter(row=>!row.every(Boolean));const cleared=20-kept.length;
    if(cleared){score += [0,100,300,500,800][cleared]*level();lines+=cleared;grid=[...Array.from({length:cleared},()=>Array(10).fill(0)),...kept];status.textContent=`${cleared===4?'Tetris! Four':cleared} line${cleared===1?'':'s'} cleared.`;}
    saveScore();spawn();elapsed=0;
  }
  function saveScore(){if(score>readBest('tetris'))saveBest('tetris',score);}
  function down(manual=false){if(fits(piece.matrix,piece.x,piece.y+1)){piece.y++;if(manual)score++;}else lock();}
  function act(action) {
    if(!active || paused)return;
    if(action==='left'||action==='right'){const x=piece.x+(action==='left'?-1:1);if(fits(piece.matrix,x,piece.y))piece.x=x;}
    if(action==='rotate'){
      const rotated=piece.matrix[0].map((_,x)=>piece.matrix.map(row=>row[x]).reverse());
      for(const offset of [0,-1,1,-2,2]){if(fits(rotated,piece.x+offset,piece.y)){piece.matrix=rotated;piece.x+=offset;break;}}
    }
    if(action==='down'){down(true);elapsed=0;}
    if(action==='drop'){while(fits(piece.matrix,piece.x,piece.y+1)){piece.y++;score+=2;}lock();}
    saveScore();paint();
  }
  function loop(now){if(!active||paused)return;elapsed+=Math.min(now-last,100);last=now;if(elapsed>=Math.max(90,750-(level()-1)*65)){down();elapsed=0;paint();}if(active)frame=requestAnimationFrame(loop);}
  function togglePause(){if(!active)return;paused=!paused;pause.textContent=paused?'Resume':'Pause';status.textContent=paused?'Paused. Your stack is safe.':'Back in play.';cancelAnimationFrame(frame);if(!paused){last=performance.now();frame=requestAnimationFrame(loop);}paint();}
  start.addEventListener('click',()=>{cancelAnimationFrame(frame);grid=Array.from({length:20},()=>Array(10).fill(0));bag=[];next=take();score=lines=elapsed=0;active=true;paused=false;spawn();pause.disabled=false;pause.textContent='Pause';start.textContent='Restart';status.textContent='Clear lines. Keep room for the next piece.';last=performance.now();paint();frame=requestAnimationFrame(loop);canvas.focus({preventScroll:true});});
  pause.addEventListener('click',togglePause);
  const keys={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'rotate',ArrowDown:'down',' ':'drop'};
  canvas.addEventListener('keydown',e=>{if(keys[e.key]||e.key.toLowerCase()==='p'){e.preventDefault();if(e.repeat&&(e.key===' '||e.key.toLowerCase()==='p'))return;if(e.key.toLowerCase()==='p')togglePause();else act(keys[e.key]);}});
  panel.querySelectorAll('[data-tetris]').forEach(button=>button.addEventListener('click',()=>act(button.dataset.tetris)));
  function autoPause(){if(active&&!paused&&(document.hidden||panel.hidden))togglePause();}
  document.addEventListener('visibilitychange',autoPause);document.addEventListener('arcadechange',autoPause);
  window.addEventListener('blur',()=>{if(active&&!paused)togglePause();});
  grid=Array.from({length:20},()=>Array(10).fill(0));next=take();paint();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => paint());
})();
