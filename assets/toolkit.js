/* Toolkit section: 3D skill constellation + expandable groups.
   Single source of truth: the orbit is generated from the .tk-tag[data-orbit]
   items in the accordion, so editing skills means editing HTML in one place. */
(() => {
  'use strict';

  const stage = document.getElementById('orbitStage');
  const canvas = document.getElementById('orbitCanvas');
  const nodesWrap = document.getElementById('orbitNodes');
  const list = document.getElementById('toolkitList');
  if (!stage || !canvas || !nodesWrap || !list) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rows = [...list.querySelectorAll('.tk-row')];

  /* ---------------- Accordion ---------------- */
  const setOpen = (row, open) => {
    row.classList.toggle('active', open);
    row.querySelector('.tk-trigger').setAttribute('aria-expanded', String(open));
  };

  const openOnly = (target) => {
    rows.forEach((row) => setOpen(row, row === target));
    syncLit();
  };

  rows.forEach((row) => {
    const btn = row.querySelector('.tk-trigger');
    const preview = row.querySelector('.tk-inline-preview');
    const tags = [...row.querySelectorAll('.tk-tag')];
    if (preview) preview.textContent = tags.slice(0, 4).map((t) => t.textContent.trim()).join(' · ');

    btn.addEventListener('click', () => {
      const wasOpen = row.classList.contains('active');
      rows.forEach((r) => setOpen(r, false));
      if (!wasOpen) setOpen(row, true);
      syncLit();
    });
  });

  /* ---------------- Orbit nodes (Fibonacci sphere) ---------------- */
  const tagEls = [...list.querySelectorAll('.tk-tag[data-orbit]')];
  const total = tagEls.length;
  const items = tagEls.map((tag, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;

    const el = document.createElement('div');
    el.className = 'skill-node';
    const dot = document.createElement('span');
    dot.className = 'dot';
    const label = document.createElement('span');
    label.textContent = tag.textContent.trim();
    el.append(dot, label);
    nodesWrap.appendChild(el);

    return {
      el,
      row: tag.closest('.tk-row'),
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.cos(phi) * 0.72,           // slightly flattened sphere
      z: Math.sin(phi) * Math.sin(theta),
      sx: 0,
      sy: 0
    };
  });

  function syncLit() {
    items.forEach((it) => it.el.classList.toggle('is-lit', it.row.classList.contains('active')));
  }
  syncLit();

  /* ---------------- State ---------------- */
  const SPEED = 0.25;                    // rad / second
  let rotY = 0.6;
  let rotX = 0.12;
  let width = 0;
  let height = 0;
  let hover = false;
  let dragging = false;
  let visible = false;
  let lineColor = 'rgba(114,246,177,0.35)';
  let raf = 0;
  let last = 0;

  const shouldAnimate = () => visible && !reduceMotion.matches && !document.hidden;

  function resize() {
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    schedule();
  }

  function readTheme() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--line-strong').trim();
    if (v) lineColor = v;
    schedule();
  }

  function draw() {
    const cx = width / 2;
    const cy = height / 2;
    const narrow = width < 520;
    const radiusX = Math.min(width * (narrow ? 0.37 : 0.4), 460);
    const radiusY = Math.min(height * (narrow ? 0.44 : 0.4), 215);

    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    items.forEach((it) => {
      const x1 = it.x * cosY - it.z * sinY;
      const z1 = it.x * sinY + it.z * cosY;
      const y2 = it.y * cosX - z1 * sinX;
      const z2 = it.y * sinX + z1 * cosX;

      const persp = 1 / (1.85 - z2 * 0.55);
      it.sx = cx + x1 * radiusX * persp * 1.5;
      it.sy = cy + y2 * radiusY * persp * 1.5;

      const scale = 0.76 + (z2 + 1) * 0.18;
      const opacity = 0.3 + (z2 + 1) * 0.35;
      it.el.style.transform =
        `translate(-50%, -50%) translate3d(${(it.sx - cx).toFixed(1)}px, ${(it.sy - cy).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      it.el.style.opacity = opacity.toFixed(3);
      it.el.style.zIndex = z2 >= 0 ? '8' : '3';   // behind / in front of the portrait
    });

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    const reach = narrow ? 110 : 160;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const d = Math.hypot(items[i].sx - items[j].sx, items[i].sy - items[j].sy);
        if (d < reach) {
          ctx.globalAlpha = (1 - d / reach) * 0.6;
          ctx.beginPath();
          ctx.moveTo(items[i].sx, items[i].sy);
          ctx.lineTo(items[j].sx, items[j].sy);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function tick(now) {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (!dragging && shouldAnimate()) rotY += SPEED * dt * (hover ? 0.35 : 1);
    draw();
    if (dragging || shouldAnimate()) schedule();
    else last = 0;                        // idle: stop the loop, no wasted frames
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  /* ---------------- Interaction ---------------- */
  let moved = 0;
  let startNode = null;
  let lastX = 0;
  let lastY = 0;

  stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
  stage.addEventListener('pointerleave', () => { hover = false; });

  stage.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    dragging = true;
    moved = 0;
    startNode = e.target.closest('.skill-node');
    lastX = e.clientX;
    lastY = e.clientY;
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('is-dragging');
    schedule();
  });

  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    moved += Math.abs(dx) + Math.abs(dy);
    rotY += dx * 0.006;
    rotX = Math.max(-0.55, Math.min(0.55, rotX + dy * 0.004));
    lastX = e.clientX;
    lastY = e.clientY;
    schedule();
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    // A tap (not a drag) on a skill opens its group in the list below.
    if (e.type === 'pointerup' && moved < 6 && startNode) {
      const hit = items.find((it) => it.el === startNode);
      if (hit) {
        openOnly(hit.row);
        hit.row.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    }
    startNode = null;
    schedule();
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  /* ---------------- Lifecycle ---------------- */
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { rootMargin: '80px' }).observe(stage);
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('visibilitychange', schedule);
  reduceMotion.addEventListener('change', schedule);

  readTheme();
  resize();
})();
