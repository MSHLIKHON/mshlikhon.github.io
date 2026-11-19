(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wordmark = document.querySelector('.footer-wordmark');
  wordmark?.addEventListener('pointermove', event => {
    const rect = wordmark.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top - 20;
    wordmark.style.setProperty('--light-x', `${x}px`);
    wordmark.style.setProperty('--light-y', `${y}px`);
    wordmark.style.setProperty('--scan-x', `${x * .65}px`);
  }, {passive:true});
  wordmark?.addEventListener('pointerdown', () => {
    if (!reduced) wordmark.animate([{filter:'brightness(1)'},{filter:'brightness(1.8)'},{filter:'brightness(1)'}],{duration:500});
  });

  const examples = {
    'C':['Programming foundation','education.html'], 'Python':['Career Copilot Lab','projects.html#project-career-copilot-lab'],
    'PHP':['BloodBridge BD','projects.html#project-bloodbridge-bd'], 'Java':["Mayor’s Rise",'projects.html#project-mayor-s-rise'],
    'HTML & CSS':['This portfolio’s source','https://github.com/MSHLIKHON/mshlikhon.github.io'],
    'JavaScript':['Explore the arcade','games.html'], 'MySQL & SQL':['BloodBridge BD','projects.html#project-bloodbridge-bd'],
    'Data modeling':['ChargeBD concept','projects.html#chargebd-preview'], 'Git & GitHub':['Public repositories','github.html'],
    'Figma & UI tools':['ChargeBD concept','projects.html#chargebd-preview'], 'Networking':['Academic journey','education.html'],
    'Streamlit':['Career Copilot Lab','projects.html#project-career-copilot-lab']
  };
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('pointermove', e => {const r=card.getBoundingClientRect();card.style.setProperty('--skill-x', `${e.clientX-r.left}px`);card.style.setProperty('--skill-y', `${e.clientY-r.top}px`);},{passive:true});
    const example=examples[card.querySelector('h3').textContent];
    if(example){const a=document.createElement('a');a.className='skill-evidence';a.textContent=example[0];a.href=example[1];card.append(a);}
  });

  const timeline=document.querySelector('.timeline');
  if(timeline){
    let scheduled=false;
    const progress=()=>{const r=timeline.getBoundingClientRect();timeline.style.setProperty('--journey-progress',Math.max(0,Math.min(1,(innerHeight*.65-r.top)/r.height)));scheduled=false;};
    addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(progress);}},{passive:true});addEventListener('resize',progress);progress();
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('in-view',entry.isIntersecting)),{threshold:.3});
    timeline.querySelectorAll('.timeline-item').forEach(item=>observer.observe(item));
  }
})();

(() => {
  const grid=document.querySelector('#project-carousel');
  if(!grid)return;
  const cards=[...grid.querySelectorAll(':scope > .project-card')];
  const shell=document.createElement('div');shell.className='project-explorer';
  const files=document.createElement('div');files.className='project-files';files.setAttribute('role','tablist');files.setAttribute('aria-label','Browse projects');
  const label=document.createElement('p');label.textContent='WORKSPACE / PROJECTS';files.append(label);
  const workspace=document.createElement('div');workspace.className='project-workspace';
  const header=document.createElement('div');header.className='project-workspace-header';
  const filename=document.createElement('span');const kind=document.createElement('span');kind.textContent='PROJECT OVERVIEW';header.append(filename,kind);
  grid.before(shell);shell.append(files,workspace);workspace.append(header,grid);
  const buttons=cards.map((card,i)=>{
    const title=card.querySelector('h3').textContent;
    card.id='project-'+title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    card.classList.remove('reveal','isometric-card');card.classList.add('visible');card.setAttribute('role','tabpanel');
    const button=document.createElement('button');button.type='button';button.textContent=title;button.id='file-'+i;button.setAttribute('role','tab');button.setAttribute('aria-controls',card.id);card.setAttribute('aria-labelledby',button.id);files.append(button);
    if(!card.querySelector('.project-shot,.project-visual')){
      const cover=document.createElement('div');cover.className='project-cover';cover.setAttribute('aria-hidden','true');
      const initials=document.createElement('strong');initials.textContent=['OMR','NGDC','UIU','','','','JAVA'][i]||'</>';
      const detail=document.createElement('span');detail.textContent=[...card.querySelectorAll('.project-meta span')].map(span=>span.textContent).join(' / ')||'PROJECT';cover.append(initials,detail);card.prepend(cover);
    }
    button.addEventListener('click',()=>select(i,true));
    button.addEventListener('keydown',e=>{
      let next;if(['ArrowDown','ArrowRight'].includes(e.key))next=(i+1)%cards.length;if(['ArrowUp','ArrowLeft'].includes(e.key))next=(i+cards.length-1)%cards.length;if(e.key==='Home')next=0;if(e.key==='End')next=cards.length-1;
      if(next!==undefined){e.preventDefault();select(next,true);buttons[next].focus();}
    });return button;
  });
  function select(i,updateURL=false){
    cards.forEach((card,n)=>{card.hidden=n!==i;buttons[n].setAttribute('aria-selected',String(n===i));buttons[n].tabIndex=n===i?0:-1;card.classList.toggle('panel-enter',n===i);});
    filename.textContent=cards[i].querySelector('h3').textContent+' / overview';
    if(updateURL)history.replaceState(null,'','#'+cards[i].id);
  }
  function fromHash(){
    const target=document.getElementById(location.hash.slice(1));
    const i=cards.findIndex(card=>card===target||card.contains(target));
    select(i>=0?i:4);
    if(target?.tagName==='DETAILS')target.open=true;
  }
  addEventListener('hashchange',fromHash);fromHash();
})();

(() => {
  const map=document.querySelector('#ev-map');if(!map)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const car=document.querySelector('#lab-car'), cable=document.querySelector('#lab-cable');
  const mode=document.querySelector('#lab-mode'), battery=document.querySelector('#lab-battery'), status=document.querySelector('#lab-status');
  const autoButton=document.querySelector('#lab-auto');
  const stations=[{x:110,y:150,name:'Mirpur',cy:130},{x:300,y:230,name:'Dhanmondi',cy:267},{x:490,y:150,name:'Gulshan',cy:130}];
  let x=55,y=190,tx=110,ty=150,angle=0,power=48,auto=!reduced,target=0,docked=-1,dwell=0,visible=false,last=0,frame=0,phase='approach';
  function message(text){if(status.textContent!==text)status.textContent=text;}
  function setAuto(value){auto=value;mode.textContent=auto?'AUTOPILOT':'YOUR CONTROL';autoButton.textContent=auto?'Autopilot on':'Resume autopilot';autoButton.setAttribute('aria-pressed',String(auto));}
  function drive(i){setAuto(false);tx=stations[i].x;ty=stations[i].y;message(`Driving to ${stations[i].name}.`);wake();}
  document.querySelectorAll('[data-drive]').forEach(button=>button.addEventListener('click',()=>drive(Number(button.dataset.drive))));
  autoButton.addEventListener('click',()=>{setAuto(!auto);if(auto){target=(target+1)%3;phase='road';dwell=0;}message(auto?'The EV is finding its next charging stop.':'Hover to steer, or choose a station.');wake();});
  function pointer(e){
    const pt=map.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const local=pt.matrixTransform(map.getScreenCTM().inverse());
    setAuto(false);tx=Math.max(32,Math.min(568,local.x));ty=Math.max(120,Math.min(258,local.y));message('You’re driving. Head to a station to charge.');wake();
  }
  map.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')pointer(e);});
  map.addEventListener('pointerdown',e=>{
    const pt=map.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const local=pt.matrixTransform(map.getScreenCTM().inverse());
    let closest=0;stations.forEach((s,i)=>{if(Math.hypot(s.x-local.x,s.y-local.y)<Math.hypot(stations[closest].x-local.x,stations[closest].y-local.y))closest=i;});drive(closest);
  });
  map.addEventListener('keydown',e=>{
    const keys={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,-30],ArrowDown:[0,30]};
    if(['1','2','3'].includes(e.key)){e.preventDefault();drive(Number(e.key)-1);}
    if(keys[e.key]){e.preventDefault();setAuto(false);tx=Math.max(32,Math.min(568,tx+keys[e.key][0]));ty=Math.max(120,Math.min(258,ty+keys[e.key][1]));wake();}
  });
  function tick(now){
    frame=0;if(!visible||document.hidden)return;
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(auto){const s=stations[target];if(phase==='road'){tx=x;ty=190;if(Math.abs(y-190)<3)phase='across';}else if(phase==='across'){tx=s.x;ty=190;if(Math.abs(x-s.x)<3)phase='approach';}else{tx=s.x;ty=s.y;}}
    const dx=tx-x,dy=ty-y,dist=Math.hypot(dx,dy),speed=Math.min(dist,dt*125);
    if(dist>1){x+=dx/dist*speed;y+=dy/dist*speed;angle=Math.atan2(dy,dx)*180/Math.PI;power=Math.max(15,power-dt*.8);}
    const near=stations.findIndex(s=>Math.hypot(s.x-x,s.y-y)<19);
    if(near>=0&&dist<10){power=Math.min(100,power+dt*15);dwell+=dt;cable.setAttribute('d',`M${stations[near].x} ${stations[near].cy} Q${x+30} ${y-12} ${x} ${y}`);if(docked!==near){message(`Charging at ${stations[near].name}. Clean energy, next stop.`);docked=near;}if(auto&&dwell>2.8){target=(target+1)%3;phase='road';dwell=0;power=Math.max(35,power-18);}}
    else{cable.setAttribute('d','');dwell=0;docked=-1;}
    document.querySelectorAll('.lab-station').forEach((station,i)=>station.classList.toggle('active',i===docked));
    car.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(1)})`);battery.textContent=Math.round(power)+'%';
    if(auto||dist>1||(docked>=0&&power<100))frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}},{threshold:.1}).observe(map);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
  setAuto(auto);if(reduced)message('Choose a station to begin. Autopilot is off for reduced motion.');
})();
