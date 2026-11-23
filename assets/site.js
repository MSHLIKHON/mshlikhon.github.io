(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],R=document.documentElement,RM=matchMedia('(prefers-reduced-motion:reduce)').matches,V=n=>getComputedStyle(R).getPropertyValue(n).trim();
$('#theme').onclick=()=>{const t=R.dataset.theme==='light'?'dark':'light';R.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}};
let mx=-999,my=-999,sc=0;
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
document.addEventListener('pointerleave',()=>{mx=my=-999});
const ck=()=>{if($('#clk'))$('#clk').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit'}).format(new Date())};ck();setInterval(ck,2e4);
const bar=$('#bar');addEventListener('scroll',()=>{sc=scrollY;bar.style.transform='scaleX('+sc/Math.max(1,R.scrollHeight-innerHeight)+')'},{passive:true});
/* dot field: the GitHub site's signature background, page-wide on inner pages; the home hero keeps the original GitHub particle field (hero-particles.js) */
const fc=$('#field'),fx=fc?fc.getContext('2d'):null;let W=0,H=0,dots=[];
const size=()=>{if(!fx)return;const r=Math.min(devicePixelRatio||1,2),g=innerWidth<680?40:44;W=innerWidth;H=innerHeight;fc.width=W*r;fc.height=H*r;fx.setTransform(r,0,0,r,0,0);dots=[];for(let y=g/2;y<H+g;y+=g)for(let x=g/2;x<W+g;x+=g)dots.push([x,y])};
addEventListener('resize',size);size();
/* hero name: letters swell near the pointer */
const L=$$('.hero h1 span'),hero=$('.hero');let heroOn=true;if(hero)new IntersectionObserver(e=>heroOn=e[0].isIntersecting).observe(hero);
/* portrait tilt */
const pt=$('#pt');if(pt&&!RM){pt.addEventListener('pointermove',e=>{const r=pt.getBoundingClientRect();pt.style.transform='perspective(900px) rotateY('+((e.clientX-r.left)/r.width-.5)*10+'deg) rotateX('+-((e.clientY-r.top)/r.height-.5)*10+'deg)'});pt.addEventListener('pointerleave',()=>pt.style.transform='')}
/* project preview that follows the cursor */
const pv=$('#pv'),pi=pv.firstElementChild;let px=0,py=0,tx=0,ty=0;
$$('.row[data-img]').forEach(r=>{r.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){pi.src=r.dataset.img;pv.classList.add('on')}});r.addEventListener('pointerleave',()=>pv.classList.remove('on'));r.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY})});
/* education ring */
$$('.ring').forEach(r=>new IntersectionObserver((e,o)=>e.forEach(i=>{if(i.isIntersecting){i.target.classList.add('in');o.unobserve(i.target)}}),{threshold:.4}).observe(r));
/* filters and mobile menu */
$$('[data-filter]').forEach(b=>b.onclick=()=>{$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));const k=b.dataset.filter;$$('[data-k]').forEach(c=>c.hidden=k!=='all'&&!c.dataset.k.split(' ').includes(k))});
const mt=$('#mt');if(mt)mt.onclick=()=>{const o=$('nav').classList.toggle('open');mt.setAttribute('aria-expanded',o)};
/* one render loop */
const loop=t=>{
const T=RM?0:t,c=V('--dot'),oy=-(sc*.3)%44;if(fx)fx.clearRect(0,0,W,H);
if(fx&&mx>=0){const g=fx.createRadialGradient(mx,my,0,mx,my,220);g.addColorStop(0,'rgba('+c+',.12)');g.addColorStop(1,'rgba('+c+',0)');fx.fillStyle=g;fx.fillRect(mx-220,my-220,440,440)}
if(fx)for(const[x,y0]of dots){const y=y0+oy,dx=x-mx,dy=y-my,f=Math.max(0,1-Math.hypot(dx,dy)/130),p=f*f*34,a=Math.atan2(dy,dx);fx.fillStyle='rgba('+c+','+(.1+.05*Math.sin(T/900+x*.012+y*.009)+f*.6)+')';fx.beginPath();fx.arc(x+Math.cos(a)*p,y+Math.sin(a)*p,1.1+f*1.8,0,6.283);fx.fill()}
if(heroOn)L.forEach((s,i)=>{let w=520;if(mx>=0){const r=s.getBoundingClientRect();w=480+320*Math.max(0,1-Math.hypot(mx-r.left-r.width/2,my-r.top-r.height/2)/280)}else if(!RM)w=580+110*Math.sin(t/800-i*.7);s.style.fontWeight=w|0});
if(window.__tick)__tick();
px+=(tx-px)*.14;py+=(ty-py)*.14;pv.style.transform='translate('+(px+26)+'px,'+(py-110)+'px) rotate('+(tx-px)*.06+'deg)';
requestAnimationFrame(loop)};
requestAnimationFrame(loop);
})();

/* nav stage light: the original GitHub tab-bar effect */
(()=>{const ls=document.querySelector('.ls');if(!ls||!matchMedia('(hover:hover)').matches)return;const light=document.createElement('span');light.className='nav-stage-light';light.setAttribute('aria-hidden','true');ls.prepend(light);const links=[...ls.querySelectorAll('a')];const point=l=>{if(!l)return;light.style.width=l.offsetWidth+'px';light.style.transform='translateX('+l.offsetLeft+'px)'};const reset=()=>point(ls.querySelector('[aria-current]')||links[0]);links.forEach(l=>{l.addEventListener('pointerenter',()=>point(l));l.addEventListener('focus',()=>point(l))});ls.addEventListener('pointerleave',reset);ls.addEventListener('focusout',e=>{if(!ls.contains(e.relatedTarget))reset()});new ResizeObserver(reset).observe(ls);reset()})();
/* fun bar: dismiss for the session */
(()=>{const fb=document.querySelector('.funbar');if(!fb)return;try{if(sessionStorage.getItem('fb-closed')){fb.remove();return}}catch(e){}const x=fb.querySelector('.fb-x');if(x)x.onclick=()=>{fb.remove();try{sessionStorage.setItem('fb-closed','1')}catch(e){}}})();
/* scroll reveal with a gentle stagger */
(()=>{const els=[...document.querySelectorAll('.sec .cd,.sec .row,.tl li,.funseg,.jg>*,.tk>*')];els.forEach((el,i)=>{el.classList.add('rv');el.style.transitionDelay=(i%4)*60+'ms'});const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});els.forEach(el=>io.observe(el))})();
/* cursor glow */
(()=>{if(!matchMedia('(hover:hover)').matches)return;const g=document.createElement('div');g.id='glow';g.setAttribute('aria-hidden','true');document.body.appendChild(g);let gx=innerWidth/2,gy=innerHeight/2,tx=gx,ty=gy;addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY},{passive:true});(function f(){gx+=(tx-gx)*.08;gy+=(ty-gy)*.08;g.style.transform='translate('+gx+'px,'+gy+'px)';requestAnimationFrame(f)})()})();
