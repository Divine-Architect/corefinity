// ===================================================================
// Corefinity Header Behaviour
// - Desktop mega menu (hover + click)
// - Arrow state
// - Mobile drawer
// - ESC + outside click
// ===================================================================

(function () {
  const nav = document.querySelector('.cf-header');
  const triggers = Array.from(document.querySelectorAll('.cf-nav-trigger'));
  const panels = Array.from(document.querySelectorAll('.cf-mega-panel'));
  const megaContainer = document.querySelector('.cf-mega-container');

  const mobileToggle = document.getElementById('cf-nav-toggle');
  const mobileMenu = document.getElementById('cf-mobile-menu');
  const mobileClose = document.getElementById('cf-mobile-close');

  let openId = null;

  function isDesktop() {
    return window.matchMedia('(min-width: 1200px)').matches;
  }

  function closeMega() {
    openId = null;
    triggers.forEach(t => {
      t.classList.remove('is-active');
      t.setAttribute('aria-expanded', 'false');
    });
    panels.forEach(p => p.classList.remove('is-active'));
  }

  function openMega(id) {
    openId = id;
    triggers.forEach(t => {
      const active = t.dataset.menu === id;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
    panels.forEach(p => {
      p.classList.toggle('is-active', p.dataset.menuPanel === id);
    });
  }

  // Desktop interactions
  triggers.forEach(trigger => {
    const id = trigger.dataset.menu;

    // Hover (desktop)
    trigger.addEventListener('mouseenter', () => {
      if (!isDesktop()) return;
      openMega(id);
    });

    // Focus (keyboard)
    trigger.addEventListener('focus', () => {
      if (!isDesktop()) return;
      openMega(id);
    });

    // Click toggles open/close on desktop
    trigger.addEventListener('click', evt => {
      if (!isDesktop()) return; // handled as mobile in drawer
      evt.preventDefault();
      if (openId === id) {
        closeMega();
      } else {
        openMega(id);
      }
    });
  });

  // Close mega when leaving header area on desktop
  if (megaContainer && nav) {
    nav.addEventListener('mouseleave', () => {
      if (!isDesktop()) return;
      closeMega();
    });
  }

  // Outside click
  document.addEventListener('click', evt => {
    if (!isDesktop()) return;
    if (!nav.contains(evt.target)) {
      closeMega();
    }
  });

  // ESC key closes mega + mobile
  document.addEventListener('keydown', evt => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      closeMega();
      closeMobile();
    }
  });

  // ================= MOBILE MENU =================

  function openMobile() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    document.body.classList.add('cf-no-scroll');
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', 'true');
    }
  }

  function closeMobile() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('cf-no-scroll');
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        closeMobile();
      } else {
        closeMobile(); // ensure clean
        closeMega();
        openMobile();
      }
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      closeMobile();
    });
  }

  // Close mobile when clicking outside inner panel
  if (mobileMenu) {
    mobileMenu.addEventListener('click', evt => {
      if (evt.target === mobileMenu) {
        closeMobile();
      }
    });
  }

  // Reset state on resize (desktop ↔ mobile)
  window.addEventListener('resize', () => {
    if (!isDesktop()) {
      closeMega();
    }
  });
})();

// ===================================================================
// Hero Orb – lightweight cursor highlight
// ===================================================================
(function () {
  const orb = document.getElementById('cf-hero-orb');
  if (!orb) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return;

  function updateFromEvent(event) {
    const rect = orb.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    orb.style.setProperty('--cursor-x', `${x.toFixed(2)}%`);
    orb.style.setProperty('--cursor-y', `${y.toFixed(2)}%`);
  }

  orb.addEventListener('pointerenter', updateFromEvent);
  orb.addEventListener('pointermove', updateFromEvent);
  orb.addEventListener('pointerleave', () => {
    orb.style.removeProperty('--cursor-x');
    orb.style.removeProperty('--cursor-y');
  });
})();

// ===================================================================
// Support video motion gating
// ===================================================================
(function () {
  const frame = document.querySelector('.cf-support-video-frame');
  if (!frame) return;

  const supportVideo = frame.querySelector('.cf-support-video');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactView = window.matchMedia('(max-width: 900px)');

  const shouldUseStatic = () => prefersReducedMotion.matches || compactView.matches;

  function updateState() {
    const useStatic = shouldUseStatic();
    frame.dataset.motion = useStatic ? 'static' : 'animated';

    if (!supportVideo) return;

    if (useStatic || document.visibilityState === 'hidden') {
      supportVideo.pause();
    } else {
      supportVideo.play().catch(() => {});
    }
  }

  prefersReducedMotion.addEventListener('change', updateState);
  compactView.addEventListener('change', updateState);
  document.addEventListener('visibilitychange', updateState);

  updateState();
})();

// ===================================================================
// Neon benchmark pill interactions
// ===================================================================
(function () {
  const rows = Array.from(document.querySelectorAll('.cf-fttb-row'));
  if (!rows.length) return;

  const rowsContainer = document.querySelector('.cf-fttb-rows');
  const pills = rows
    .map(row => row.querySelector('.cf-fttb-pill'))
    .filter(Boolean);
  const variants = rows.map(row => row.dataset.variant).filter(Boolean);
  if (!variants.length) return;

  let activeVariant = variants[0];
  let autoplayId = null;
  let userInteracted = false;

  function restartSegments(row) {
    const targets = [
      row.querySelector('.cf-fttb-bar-fill'),
      row.querySelector('.cf-fttb-bar-dot'),
    ];

    targets.forEach(el => {
      if (!el) return;
      el.classList.remove('is-animating');
      // force reflow to restart keyframe
      void el.offsetWidth;
      el.classList.add('is-animating');
    });
  }

  function tickMetric(row) {
    const metric = row.querySelector('.cf-fttb-pill-metric');
    if (!metric) return;
    metric.classList.remove('is-ticking');
    void metric.offsetWidth;
    metric.classList.add('is-ticking');
  }

  function setActive(variant) {
    if (!variant) return;
    activeVariant = variant;

    rows.forEach(row => {
      const isActive = row.dataset.variant === variant;
      row.classList.toggle('is-active', isActive);

      const pill = row.querySelector('.cf-fttb-pill');
      if (pill) {
        pill.classList.toggle('is-active', isActive);
        pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
      }

      if (isActive) {
        restartSegments(row);
        tickMetric(row);
      }
    });
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function startAutoplay() {
    if (variants.length <= 1) return;
    stopAutoplay();
    autoplayId = setInterval(() => {
      const current = variants.indexOf(activeVariant);
      const next = variants[(current + 1) % variants.length];
      setActive(next);
    }, 5200);
  }

  const activateVariant = variant => {
    userInteracted = true;
    stopAutoplay();
    setActive(variant);
  };

  pills.forEach(pill => {
    const variant = pill.dataset.variant;
    if (!variant) return;

    pill.addEventListener('click', () => activateVariant(variant));
    pill.addEventListener('mouseenter', () => activateVariant(variant));
    pill.addEventListener('focus', () => activateVariant(variant));
  });

  if (rowsContainer) {
    rowsContainer.addEventListener('mouseleave', () => {
      if (userInteracted) return;
      startAutoplay();
    });
  }

  function handleVisibility() {
    const hidden = document.visibilityState === 'hidden';
    rowsContainer?.classList.toggle('is-paused', hidden);
    if (hidden) {
      stopAutoplay();
    } else {
      if (!userInteracted) {
        startAutoplay();
      }
      setActive(activeVariant);
    }
  }

  document.addEventListener('visibilitychange', handleVisibility);

  setActive(activeVariant);
  startAutoplay();
  handleVisibility();
})();

// ===================================================================
// Brands marquee seamless loop
// ===================================================================
(function () {
  const marquee = document.querySelector('.cf-brands-marquee');
  const track = marquee?.querySelector('.cf-brands-track');
  if (!marquee || !track) return;

  const originals = Array.from(track.children).map(node => node.cloneNode(true));
  let loopDistancePx = 0;

  function renderBase() {
    track.innerHTML = '';
    originals.forEach(node => track.appendChild(node.cloneNode(true)));
  }

  function ensureLoop() {
    const marqueeWidth = marquee.offsetWidth || 0;
    let trackWidth = track.scrollWidth;

    while (trackWidth < marqueeWidth * 2) {
      originals.forEach(node => track.appendChild(node.cloneNode(true)));
      trackWidth = track.scrollWidth;
    }

    loopDistancePx = trackWidth - marqueeWidth;
    marquee.style.setProperty('--brands-loop-distance', `-${loopDistancePx}px`);
    const pixelsPerSecond = 35; // smooth glide speed
    const duration = loopDistancePx / pixelsPerSecond;
    track.style.setProperty('--brands-loop-duration', `${duration.toFixed(2)}s`);
  }

  function refresh() {
    renderBase();
    ensureLoop();
  }

  function debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  refresh();
  window.addEventListener('resize', debounce(refresh, 250));
  document.addEventListener('visibilitychange', () => {
    const hidden = document.visibilityState === 'hidden';
    track.classList.toggle('is-paused', hidden);
  });
  track.classList.toggle('is-paused', document.visibilityState === 'hidden');
})();