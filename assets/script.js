(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const storage = {
    get(key) { try { return window.localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch { /* Storage may be blocked in local preview. */ } }
  };
  const savedTheme = storage.get('msh-theme');
  root.dataset.theme = savedTheme || 'dark';

  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    storage.set('msh-theme', root.dataset.theme);
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

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const typingText = document.getElementById('typing-text');
  const phrases = [
    'Loading CSE student profile...',
    'Building practical software solutions...',
    'Exploring smart mobility and databases...',
    'Ready to learn, collaborate, and contribute.'
  ];

  if (typingText && !reducedMotion) {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const type = () => {
      const phrase = phrases[phraseIndex];
      charIndex += deleting ? -1 : 1;
      typingText.textContent = phrase.slice(0, charIndex);
      let delay = deleting ? 22 : 45;
      if (!deleting && charIndex === phrase.length) {
        deleting = true;
        delay = 1450;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 260;
      }
      window.setTimeout(type, delay);
    };
    type();
  } else if (typingText) {
    typingText.textContent = phrases[3];
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
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      projectCards.forEach((card) => {
        const categories = card.dataset.category?.split(' ') || [];
        card.classList.toggle('hidden', filter !== 'all' && !categories.includes(filter));
      });
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
