(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.particle-field').forEach(canvas => {
    const host = canvas.closest('section');
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

  function enableDragCarousel(carousel) {
    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    carousel.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.target.closest('a, button, input, select, summary')) return;
      dragging = true;
      startX = event.clientX;
      startScroll = carousel.scrollLeft;
      carousel.classList.add('dragging');
      carousel.setPointerCapture(event.pointerId);
    });
    carousel.addEventListener('pointermove', event => {
      if (dragging) carousel.scrollLeft = startScroll - (event.clientX - startX);
    });
    const stopDrag = () => {
      dragging = false;
      carousel.classList.remove('dragging');
    };
    carousel.addEventListener('pointerup', stopDrag);
    carousel.addEventListener('pointercancel', stopDrag);

    if (carousel.id === 'project-carousel') {
      const scrollAmount = () => Math.min(carousel.clientWidth * .78, 680);
      document.querySelector('#projects-prev')?.addEventListener('click', () => {
        carousel.scrollBy({ left: -scrollAmount(), behavior: reducedMotion ? 'auto' : 'smooth' });
      });
      document.querySelector('#projects-next')?.addEventListener('click', () => {
        carousel.scrollBy({ left: scrollAmount(), behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    }
  }
  document.querySelectorAll('[data-drag-carousel]').forEach(enableDragCarousel);

  if (!reducedMotion && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.isometric-card, .skill-card, .repo-shelf article, .leadership-card').forEach(card => {
      card.classList.add('tilt-card');
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        const strength = card.classList.contains('project-featured') ? 5 : 2.5;
        card.style.setProperty('--tilt-x', (-y * strength).toFixed(2) + 'deg');
        card.style.setProperty('--tilt-y', (x * strength).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  const topButton = document.querySelector('#back-to-top');
  if (topButton) {
    const updateTopButton = () => topButton.classList.toggle('visible', scrollY > 520);
    addEventListener('scroll', updateTopButton, { passive: true });
    topButton.addEventListener('click', () => {
      history.replaceState(null, '', location.pathname + location.search);
      const previousBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      if (reducedMotion) {
        scrollTo(0, 0);
        document.documentElement.style.scrollBehavior = previousBehavior;
        document.querySelector('.brand')?.focus({ preventScroll: true });
        return;
      }
      const start = scrollY;
      const startedAt = performance.now();
      const duration = 620;
      const step = now => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        scrollTo(0, Math.round(start * (1 - eased)));
        if (progress < 1) requestAnimationFrame(step);
        else {
          document.documentElement.style.scrollBehavior = previousBehavior;
          document.querySelector('.brand')?.focus({ preventScroll: true });
        }
      };
      requestAnimationFrame(step);
    });
    updateTopButton();
  }
})();
