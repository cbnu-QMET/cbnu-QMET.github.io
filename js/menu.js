// menu.js
// Mobile nav toggle. Safe to call on any page.

(function () {
  function initMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    if (!menuToggle || !nav || !header) return;

    // Prevent duplicate binding if initMenu is called more than once.
    if (menuToggle.dataset.bound === '1') return;
    menuToggle.dataset.bound = '1';

    // Apply nav offset so it starts below the fixed header (prevents overlap)
    const applyNavOffset = () => {
      const h = header.getBoundingClientRect().height;
      nav.style.setProperty('--header-h', `${h}px`);
    };

    applyNavOffset();
    window.addEventListener('resize', applyNavOffset);

    const openMenu = () => {
      nav.classList.add('mobile-open');
      document.body.classList.add('no-scroll');
      menuToggle.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      nav.classList.remove('mobile-open');
      document.body.classList.remove('no-scroll');
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      applyNavOffset();

      const isOpen = nav.classList.toggle('mobile-open');
      document.body.classList.toggle('no-scroll', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile menu when clicking nav links
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    // Close on outside click (when open)
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('mobile-open')) return;
      const target = e.target;
      if (!(target instanceof Element)) return;

      const clickedInsideNav = nav.contains(target);
      const clickedToggle = menuToggle.contains(target);
      if (!clickedInsideNav && !clickedToggle) closeMenu();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  window.initMenu = initMenu;
})();
