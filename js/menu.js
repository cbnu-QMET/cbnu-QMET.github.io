// menu.js (수정본)

(function () {

  function normalizePath(path) {
    if (!path) return '/';
    let normalized = path.replace(/\/index\.html$/i, '/');
    normalized = normalized.replace(/\.html$/i, '');
    if (normalized.length > 1) normalized = normalized.replace(/\/+$/, '');
    return normalized || '/';
  }

  function applyCurrentNavState(nav) {
    const currentPath = normalizePath(window.location.pathname);

    nav.querySelectorAll('a[aria-current="page"]').forEach((link) => {
      link.removeAttribute('aria-current');
    });

    nav.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('./')) return;

      const linkPath = normalizePath(`/${href.slice(2)}`);
      if (linkPath === currentPath) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function initMenu() {
    const header = document.querySelector('header');
    if (!header) return;

    const nav = header.querySelector('nav');
    if (!nav) return;

    // Keep current-page state in sync even if a page layout omits mobile controls.
    applyCurrentNavState(nav);

    const menuToggle = header.querySelector('.menu-toggle');
    if (!menuToggle) return;

    if (menuToggle.dataset.bound === '1') return;
    menuToggle.dataset.bound = '1';

    const applyNavOffset = () => {
      const h = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
      nav.style.setProperty('--header-h', `${h}px`);
    };

    applyNavOffset();
    window.addEventListener('resize', applyNavOffset);

    const closeMenu = () => {
      nav.classList.remove('mobile-open');
      document.body.classList.remove('no-scroll');
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.setAttribute('aria-expanded', 'false');

    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      applyNavOffset();

      const isOpen = nav.classList.toggle('mobile-open');
      document.body.classList.toggle('no-scroll', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('mobile-open')) return;
      const target = e.target;
      if (!(target instanceof Element)) return;

      if (!nav.contains(target) && !menuToggle.contains(target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  window.initMenu = initMenu;
})();
