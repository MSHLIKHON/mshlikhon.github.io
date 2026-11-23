/* Home hero background: the original GitHub site's particle field, kept as-is.
   Adapted from the previous site's effects.js so it works with the new design. */
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.particle-field').forEach(canvas => {
    const host = canvas.closest('section');
    if (!host) return;
    const context = canvas.getContext('2d');
    const pointer = { x: -1000, y: -1000 };
    let dots = [];
    let active = false;

    function resizeParticles() {
      const bounds = host.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * ratio);
      canvas.height = Math.round(bounds.height * ratio);
      canvas.style.width = bounds.width + 'px';
      canvas.style.height = bounds.height + 'px';
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = [];
      const gap = innerWidth < 680 ? 42 : 38;
      for (let y = gap / 2; y < bounds.height; y += gap) {
        for (let x = gap / 2; x < bounds.width; x += gap) dots.push({ x, y });
      }
    }

    function drawParticles() {
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent');
      for (const dot of dots) {
        const dx = dot.x - pointer.x;
        const dy = dot.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const force = Math.max(0, 1 - distance / 115);
        const push = force * force * 32;
        const angle = Math.atan2(dy, dx);
        context.globalAlpha = .12 + force * .55;
        context.beginPath();
        context.arc(
          dot.x + Math.cos(angle) * push,
          dot.y + Math.sin(angle) * push,
          1.15 + force * 1.5,
          0,
          Math.PI * 2
        );
        context.fill();
      }
      context.globalAlpha = 1;
    }

    host.addEventListener('pointermove', event => {
      const bounds = host.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      if (active && !reducedMotion) drawParticles();
    });
    host.addEventListener('pointerleave', () => {
      pointer.x = -1000;
      pointer.y = -1000;
      if (active) drawParticles();
    });
    new ResizeObserver(() => {
      resizeParticles();
      if (active) drawParticles();
    }).observe(host);
    new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) drawParticles();
    }).observe(host);
    resizeParticles();
  });
})();
