(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storage = {
    get(key) { try { return window.localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch { /* Storage may be blocked in local preview. */ } }
  };
  const savedTheme = storage.get('msh-theme');
  root.dataset.theme = savedTheme || 'dark';
  themeToggle?.addEventListener('click', () => {
    const applyTheme = () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      storage.set('msh-theme', root.dataset.theme);
    };
    if (reducedMotion || !document.startViewTransition) {
      applyTheme();
      return;
    }
    const bounds = themeToggle.getBoundingClientRect();
    root.style.setProperty('--theme-x', bounds.left + bounds.width / 2 + 'px');
    root.style.setProperty('--theme-y', bounds.top + bounds.height / 2 + 'px');
    document.startViewTransition(applyTheme);
  });

  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const closeMenu = () => {
    menuToggle?.classList.remove('open');
    navLinks?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  };

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.classList.toggle('open');
    navLinks?.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const typingText = document.getElementById('typing-text');
  if (typingText) {
    const hour = Number(new Intl.DateTimeFormat('en-GB', {hour: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Dhaka'}).format(new Date()));
    const greeting = hour < 6 || hour >= 18 ? 'শুভ সন্ধ্যা · Good evening' : hour < 12 ? 'শুভ সকাল · Good morning' : 'শুভ অপরাহ্ণ · Good afternoon';
    typingText.textContent = greeting + ' from Dhaka.';
  }
  if (typingText && !reducedMotion && matchMedia('(min-width: 720px)').matches) {
    typingText.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650 });
  }

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((element) => revealObserver.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add('visible'));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  const navAnchors = [...document.querySelectorAll('.nav-links a')];
  const setActiveLink = () => {
    const marker = window.scrollY + 140;
    let current = 'home';
    sections.forEach((section) => {
      if (section.offsetTop <= marker) current = section.id;
    });
    navAnchors.forEach((anchor) => anchor.classList.toggle('active', anchor.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  const filterButtons = document.querySelectorAll('.filter-button');
  const projectCards = document.querySelectorAll('.project-card');
  filterButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      if (button.classList.contains('active')) return;
      const carousel = document.querySelector('#project-carousel');
      if (!reducedMotion) {
        await carousel.animate(
          [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(18px)' }],
          { duration: 160, easing: 'ease-in', fill: 'forwards' }
        ).finished;
      }
      filterButtons.forEach((item) => item.classList.remove('active'));
      filterButtons.forEach((item) => item.setAttribute('aria-selected', 'false'));
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      const filter = button.dataset.filter;
      projectCards.forEach((card) => {
        const categories = card.dataset.category?.split(' ') || [];
        card.classList.toggle('hidden', filter !== 'all' && !categories.includes(filter));
      });
      carousel.scrollLeft = 0;
      if (!reducedMotion) {
        carousel.animate(
          [{ opacity: 0, transform: 'translateX(-18px)' }, { opacity: 1, transform: 'translateX(0)' }],
          { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }
        );
      }
    });
  });
  filterButtons.forEach((button, index) => {
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = (index + direction + filterButtons.length) % filterButtons.length;
      filterButtons[next].focus();
      filterButtons[next].click();
      event.preventDefault();
    });
  });

  const glow = document.querySelector('.cursor-glow');
  if (glow && !reducedMotion) {
    window.addEventListener('pointermove', (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  };

  document.querySelector('.copy-email')?.addEventListener('click', async (event) => {
    const email = event.currentTarget.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard.');
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });

  document.getElementById('contact-form')?.addEventListener('submit', (event) => {
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }
    form.querySelector('[name="_subject"]').value = `Portfolio: ${form.elements.subject.value}`;
  });

  const year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
})();
