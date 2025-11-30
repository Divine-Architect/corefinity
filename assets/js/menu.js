document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.querySelector(
    '[data-cf-mobile-toggle="main-nav"]'
  );
  const mainNav = document.getElementById("cf-main-nav");

  const solutionsTrigger = document.querySelector(
    '[data-cf-mega-toggle="solutions"]'
  );
  const solutionsMega = document.getElementById("cf-mega-solutions");

  let isMobileNavOpen = false;
  let isMegaOpen = false;

  function isMobileViewport() {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  // --- Mobile Nav ---
  function setMobileNav(open) {
    if (!mobileToggle || !mainNav) return;

    isMobileNavOpen = !!open;
    mainNav.style.display = isMobileNavOpen ? "flex" : "";
    mainNav.style.flexDirection = isMobileNavOpen ? "column" : "";
    mobileToggle.setAttribute("aria-expanded", String(isMobileNavOpen));

    if (!isMobileNavOpen) {
      closeMega(); // ensure mega closed when nav closes
    }
  }

  function toggleMobileNav() {
    setMobileNav(!isMobileNavOpen);
  }

  // --- Mega Menu (Solutions) ---
  function setMega(open) {
    if (!solutionsTrigger || !solutionsMega) return;

    isMegaOpen = !!open;

    solutionsTrigger.setAttribute("aria-expanded", String(isMegaOpen));

    if (isMegaOpen) {
      solutionsMega.classList.add("is-open");
    } else {
      solutionsMega.classList.remove("is-open");
    }
  }

  function openMega() {
    if (isMobileViewport()) return; // no mega on mobile
    setMega(true);
  }

  function closeMega() {
    setMega(false);
  }

  function toggleMega() {
    if (isMobileViewport()) return; // handled differently for mobile later
    setMega(!isMegaOpen);
  }

  // --- Event wiring ---

  // Mobile nav button
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMobileNav();
    });

    // Close mobile nav on resize to desktop
    window.addEventListener("resize", () => {
      if (!isMobileViewport()) {
        setMobileNav(false);
      }
    });
  }

  // Solutions mega trigger
  if (solutionsTrigger && solutionsMega) {
    // Click toggles mega on desktop
    solutionsTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMega();
    });

    // Basic hover open on desktop
    solutionsTrigger.addEventListener("mouseenter", () => {
      if (!isMobileViewport()) {
        openMega();
      }
    });

    // Close mega when mouse leaves the panel area
    solutionsMega.addEventListener("mouseleave", () => {
      if (!isMobileViewport()) {
        closeMega();
      }
    });
  }

  // Global ESC key handler
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.key === "Esc") {
      setMobileNav(false);
      closeMega();
    }
  });

  // Click outside to close
  document.addEventListener("click", (event) => {
    const target = event.target;

    const clickedInsideHeader =
      target.closest &&
      target.closest(".cf-header, .cf-mega");

    if (!clickedInsideHeader) {
      setMobileNav(false);
      closeMega();
    }
  });
});


