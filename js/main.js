// main.js - entrypoint
// Centralized bootstrap so each module can stay page-safe (no-op when DOM is missing).

(function () {
  const INIT_FNS = [
    'initPartials',
    'initMenu',
    'initOverlay',
    'initLightbox',
    'initCarousel',
    'initNews',
  ];

  function safeCall(fnName) {
    const fn = window[fnName];
    if (typeof fn !== 'function') return;
    try {
      fn();
    } catch (err) {
      // Keep the site usable even if one feature fails.
      console.warn(`[main] ${fnName} failed:`, err);
    }
  }

  function boot() {
    INIT_FNS.forEach(safeCall);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // If overlays are injected later (e.g., via partials), re-run feature init that may
  // depend on dynamically added DOM.
  document.addEventListener('partials:loaded', () => {
    ['initOverlay', 'initLightbox', 'initCarousel', 'initNews'].forEach(safeCall);
  });
  
  // Email obfuscation: render addresses from data-u/data-d, and open mail client on click.
  // Keeps raw email + mailto out of HTML to reduce scraping by simple bots.
  window.initEmails = function initEmails() {
    const nodes = document.querySelectorAll('.email[data-u][data-d]');
    if (!nodes.length) return;

    nodes.forEach((el) => {
      const u = el.getAttribute('data-u');
      const d = el.getAttribute('data-d');
      if (!u || !d) return;

      const addr = `${u}@${d}`;

      // Display text (human-friendly). If you want heavier obfuscation, switch to `${u} [at] ${d}`.
      el.textContent = addr;
      el.setAttribute('role', 'link');
      el.setAttribute('tabindex', '0');
      el.style.cursor = 'pointer';

      const openMail = () => {
        // Create mailto only at interaction time.
        window.location.href = `mailto:${addr}`;
      };

      el.addEventListener('click', openMail, { passive: true });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMail();
        }
      });
    });
  };
})();
