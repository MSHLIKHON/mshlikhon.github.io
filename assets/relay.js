// Bits clockwise from north: N=1, E=2, S=4, W=8.
(() => {
  const board = document.querySelector('#pipes');
  if (!board) return;
  const turns = m => ((m << 1) & 15) | (m >> 3);
  const dirs = [[-1,0],[0,1],[1,0],[0,-1]];
  const ends = [[25,0],[50,25],[25,50],[0,25]];
  let tiles, moves, won;
  function trace() {
    const seen = new Set(), stack = tiles[0]&8 ? [0] : [];
    while(stack.length) {
      const i=stack.pop();
      if(seen.has(i)) continue;
      seen.add(i);
      dirs.forEach(([dy,dx],d)=>{
        const y=(i>>2)+dy,x=i%4+dx,j=y*4+x;
        if(y>=0&&y<4&&x>=0&&x<4&&(tiles[i]&(1<<d))&&(tiles[j]&(1<<((d+2)%4)))) stack.push(j);
      });
    }
    return seen;
  }
  function draw() {
    const live=trace(); won=live.has(15)&&Boolean(tiles[15]&2);
    tiles.forEach((m,i)=>{
      const b=board.children[i], names=['north','east','south','west'].filter((_,d)=>m&(1<<d));
      b.classList.toggle('live',live.has(i));
      b.setAttribute('aria-label','Row '+((i>>2)+1)+', column '+(i%4+1)+': '+names.join(' and ')+(live.has(i)?', powered':'')+'. Rotate.');
      b.innerHTML='<svg aria-hidden="true" viewBox="0 0 50 50">'+ends.map(([x,y],d)=>m&(1<<d)?'<path d="M25 25 L'+x+' '+y+'"/>':'').join('')+'<circle cx="25" cy="25" r="4"/></svg>';
    });
    document.querySelector('#signal-status').textContent=(won?'✓ Signal delivered':'Route the signal')+' · '+moves+' turns';
  }
  function reset(){
    // Each template has a complete inlet-to-outlet route before rotation.
    const paths=[[0,4,5,1,2,6,10,9,13,14,15],[0,1,5,4,8,12,13,9,10,6,7,11,15],[0,4,8,9,5,1,2,3,7,6,10,14,15]];
    const path=paths[Math.floor(Math.random()*paths.length)];
    tiles=Array.from({length:16},()=>Math.random()<.5?3:5);
    path.forEach((i,k)=>{const edge=j=>({1:2,'-1':8,4:4,'-4':1})[j-i]; tiles[i]=(k?edge(path[k-1]):8)|(k+1<path.length?edge(path[k+1]):2);});
    tiles=tiles.map(m=>{for(let n=Math.floor(Math.random()*4);n;n--)m=turns(m);return m;});
    while(tiles[0]&8)tiles[0]=turns(tiles[0]);
    moves=0;draw();
  }
  for(let i=0;i<16;i++){const b=document.createElement('button');b.type='button';b.onclick=()=>{if(!won){tiles[i]=turns(tiles[i]);moves++;draw();}};board.append(b);}
  document.querySelector('#shuffle').onclick=reset;reset();
})();
