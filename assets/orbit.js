(()=>{const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],R=document.documentElement,V=n=>getComputedStyle(R).getPropertyValue(n).trim();
/* skill sphere */
const G=[['Languages','#72f6b1',['C','C++','Java','Python','PHP','JavaScript','SQL']],['Frontend','#5fb6ff',['HTML & CSS','Canvas','Figma','Responsive UI']],['Data','#f8c45c',['MySQL','ER diagrams','Normalization','Database design']],['Deploy','#ff8fab',['Cloudflare Workers','Netlify','Vercel','GitHub Pages']],['Workflow','#b69cff',['Git & GitHub','VS Code','Streamlit','Packet Tracer']]];
const oc=$('#orbit'),ox=oc.getContext('2d'),N=[];let act=-1,rY=.6,rX=.15,dr=0,lx=0,ly=0,ow=0,oh=0,orbOn=false;
G.forEach((g,gi)=>g[2].forEach(n=>N.push({n,gi})));
N.forEach((o,i)=>{const p=Math.acos(1-2*(i+.5)/N.length),th=Math.PI*(1+Math.sqrt(5))*i;o.x=Math.sin(p)*Math.cos(th);o.y=Math.cos(p)*.8;o.z=Math.sin(p)*Math.sin(th)});
G.forEach((g,i)=>{const b=document.createElement('button');b.type='button';b.style.setProperty('--c',g[1]);b.setAttribute('aria-pressed','false');b.innerHTML='<i></i>'+g[0];b.onclick=()=>{act=act===i?-1:i;$$('#chips button').forEach((x,j)=>x.setAttribute('aria-pressed',j===act))};$('#chips').append(b)});
const os=()=>{const r=Math.min(devicePixelRatio||1,2),b=oc.getBoundingClientRect();ow=b.width;oh=b.height;oc.width=ow*r;oc.height=oh*r;ox.setTransform(r,0,0,r,0,0)};addEventListener('resize',os);os();
new IntersectionObserver(e=>orbOn=e[0].isIntersecting).observe(oc);window.__tick=()=>{if(orbOn){if(!dr&&!matchMedia('(prefers-reduced-motion:reduce)').matches)rY+=.003;od()}};
oc.onpointerdown=e=>{dr=1;lx=e.clientX;ly=e.clientY;oc.setPointerCapture(e.pointerId);oc.style.cursor='grabbing'};
oc.onpointermove=e=>{if(!dr)return;rY+=(e.clientX-lx)*.007;rX=Math.max(-.9,Math.min(.9,rX+(e.clientY-ly)*.005));lx=e.clientX;ly=e.clientY};
oc.onpointerup=oc.onpointercancel=()=>{dr=0;oc.style.cursor=''};
const od=()=>{ox.clearRect(0,0,ow,oh);const Rd=Math.min(ow,oh)*.38,cy=Math.cos(rY),sy=Math.sin(rY),cx=Math.cos(rX),sx=Math.sin(rX),ink=V('--tx');
N.forEach(o=>{const x1=o.x*cy-o.z*sy,z1=o.x*sy+o.z*cy,y2=o.y*cx-z1*sx,z2=o.y*sx+z1*cx,s=1/(1-z2*.35);o.sx=ow/2+x1*Rd*s*1.25;o.sy=oh/2+y2*Rd*s;o.d=(z2+1)/2;o.s=s});
G.forEach((g,gi)=>{ox.beginPath();N.filter(o=>o.gi===gi).forEach((o,i)=>i?ox.lineTo(o.sx,o.sy):ox.moveTo(o.sx,o.sy));ox.strokeStyle=g[1];ox.globalAlpha=act===gi?.55:act<0?.12:.03;ox.stroke()});
[...N].sort((a,b)=>a.d-b.d).forEach(o=>{const on=act<0||act===o.gi;ox.globalAlpha=on?.35+.65*o.d:.12;ox.fillStyle=G[o.gi][1];ox.beginPath();ox.arc(o.sx,o.sy,2.6*o.s,0,6.283);ox.fill();ox.font='600 '+(11+4*o.d)+'px Manrope,sans-serif';ox.fillStyle=ink;ox.fillText(o.n,o.sx+8,o.sy+4)});ox.globalAlpha=1};

})();
