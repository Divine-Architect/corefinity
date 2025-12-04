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
// Hero geometric cursor follow
// ===================================================================
(function () {
  const geo = document.getElementById('cf-hero-geo');
  if (!geo) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return;

  function updateFromEvent(event) {
    const rect = geo.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    geo.style.setProperty('--cursor-x', `${x.toFixed(2)}%`);
    geo.style.setProperty('--cursor-y', `${y.toFixed(2)}%`);
  }

  geo.addEventListener('pointerenter', updateFromEvent);
  geo.addEventListener('pointermove', updateFromEvent);
  geo.addEventListener('pointerleave', () => {
    geo.style.removeProperty('--cursor-x');
    geo.style.removeProperty('--cursor-y');
  });
})();