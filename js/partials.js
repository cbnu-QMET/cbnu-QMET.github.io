(function () {
  const NAV_LINKS = [
    { href: './about', label: 'About' },
    { href: './professor', label: 'Professor' },
    { href: './team', label: 'Members' },
    { href: './publications', label: 'Publications' },
    { href: './activity', label: 'Activity' },
    { href: './media', label: 'Media' },
    { href: './research', label: 'Research' },
  ];

  function normalizePath(pathname) {
    const cleaned = pathname.replace(/index\.html$/i, '').replace(/\.html$/i, '').replace(/\/$/, '');
    return cleaned || '/';
  }

  function buildHeaderNav() {
    const header = document.querySelector('header');
    if (!header) return;

    const nav = header.querySelector('nav');
    if (!nav) return;

    const currentPath = normalizePath(window.location.pathname);

    nav.innerHTML = NAV_LINKS.map(({ href, label }) => {
      const targetPath = normalizePath(new URL(href, window.location.href).pathname);
      const isActive = targetPath === currentPath;
      const activeAttr = isActive ? ' aria-current="page"' : '';
      return `<a href="${href}"${activeAttr}>${label}</a>`;
    }).join('');
  }

  function ensureMainContentId() {
    const main = document.querySelector('main');
    if (!main) return;
    if (!main.id) main.id = 'main-content';
  }

  function ensureSkipLink() {
    if (document.querySelector('.skip-link')) return;

    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to content';

    const bodyFirst = document.body.firstElementChild;
    if (bodyFirst) {
      bodyFirst.insertAdjacentElement('afterend', skipLink);
      return;
    }

    document.body.prepend(skipLink);
  }

  function ensureFooter() {
    const existingFooter = document.querySelector('footer');
    if (existingFooter) {
      const copyright = existingFooter.querySelector('.footer-bottom span');
      if (copyright) {
        const year = new Date().getFullYear();
        copyright.textContent = `©2021–${year}. All rights reserved.`;
      }
      return;
    }

    const year = new Date().getFullYear();
    const footer = document.createElement('footer');
    footer.innerHTML = `
      <div class="footer-grid">
        <div class="footer-location">
          <h3>Quantum metrology laboratory</h3>
          <address>
            <a href="https://maps.google.com/maps?q=Chungbuk+National+University" rel="noopener" target="_blank">
              Room 249, Building S1-1 (College of Natural Sciences)<br/>
              Chungbuk National University<br/>
              1, Chungdae-ro, Seowon-gu<br/>
              Cheongju-si, Chungbuk 28644<br/>
              South Korea
            </a>
          </address>
        </div>
      </div>

      <div class="footer-bottom">
        <span>©2021–${year}. All rights reserved.</span>
      </div>
    `;

    document.body.appendChild(footer);
  }

  window.initPartials = function initPartials() {
    if (window.__partialsInitialized) return;
    window.__partialsInitialized = true;

    buildHeaderNav();
    ensureMainContentId();
    ensureSkipLink();
    ensureFooter();
  };
})();
