(() => {
  const nav=document.querySelector('#nav-links');
  if(nav){
    const light=document.createElement('span');light.className='nav-stage-light';light.setAttribute('aria-hidden','true');nav.prepend(light);
    const links=[...nav.querySelectorAll('a')];
    function point(link){if(!link)return;light.style.setProperty('--spot-left',link.offsetLeft+'px');light.style.setProperty('--spot-width',link.offsetWidth+'px');}
    const reset=()=>point(nav.querySelector('[aria-current="page"]')||links[0]);
    links.forEach(link=>{link.addEventListener('pointerenter',()=>point(link));link.addEventListener('focus',()=>point(link));});
    nav.addEventListener('pointerleave',reset);nav.addEventListener('focusout',event=>{if(!nav.contains(event.relatedTarget))reset();});new ResizeObserver(reset).observe(nav);reset();
  }
  document.querySelectorAll('.button').forEach(button=>button.addEventListener('pointermove',event=>{const r=button.getBoundingClientRect();button.style.setProperty('--button-x',((event.clientX-r.left)/r.width*100)+'%');},{passive:true}));
})();
