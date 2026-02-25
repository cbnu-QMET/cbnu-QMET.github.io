// menu.js (수정본)

(function () {
  const SELECTORS = {
    HEADER: 'header',
    NAV: 'nav',
    MENU_TOGGLE: '.menu-toggle',
    NAV_LINKS: 'a[href]',
  };

  const CLASSES = {
    MOBILE_OPEN: 'mobile-open',
    NO_SCROLL: 'no-scroll',
  };

  const ATTRS = {
    ARIA_CURRENT: 'aria-current',
    ARIA_EXPANDED: 'aria-expanded',
  };

  function normalizePath(path) {
    if (!path) return '/';
    let normalized = path.split(/[?#]/, 1)[0] || '/';
    normalized = normalized.replace(/\/index\.html$/i, '/');
    normalized = normalized.replace(/\.html$/i, '');
    if (normalized.length > 1) normalized = normalized.replace(/\/+$/, '');
    return normalized || '/';
  }

  function getLocalPathFromHref(href) {
    if (!href) return null;

    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return null;
      return normalizePath(url.pathname);
    } catch (_) {
      return null;
    }
  }

  function applyCurrentNavState(nav) {
    const currentPath = normalizePath(window.location.pathname);

    nav.querySelectorAll(`a[${ATTRS.ARIA_CURRENT}="page"]`).forEach((link) => {
      link.removeAttribute(ATTRS.ARIA_CURRENT);
    });

    nav.querySelectorAll(SELECTORS.NAV_LINKS).forEach((link) => {
      const href = link.getAttribute('href');
      const linkPath = getLocalPathFromHref(href);
      if (!linkPath) return;

      if (linkPath === currentPath) {
        link.setAttribute(ATTRS.ARIA_CURRENT, 'page');
      }
    });
  }

  function initMenu() {
    const header = document.querySelector(SELECTORS.HEADER);
    if (!header) return;

    const nav = header.querySelector(SELECTORS.NAV);
    if (!nav) return;

    // Keep current-page state in sync even if a page layout omits mobile controls.
    applyCurrentNavState(nav);

    const menuToggle = header.querySelector(SELECTORS.MENU_TOGGLE);
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
      nav.classList.remove(CLASSES.MOBILE_OPEN);
      document.body.classList.remove(CLASSES.NO_SCROLL);
      menuToggle.setAttribute(ATTRS.ARIA_EXPANDED, 'false');
    };

    menuToggle.setAttribute(ATTRS.ARIA_EXPANDED, 'false');

    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      applyNavOffset();

      const isOpen = nav.classList.toggle(CLASSES.MOBILE_OPEN);
      document.body.classList.toggle(CLASSES.NO_SCROLL, isOpen);
      menuToggle.setAttribute(ATTRS.ARIA_EXPANDED, String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (!nav.classList.contains(CLASSES.MOBILE_OPEN)) return;
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
