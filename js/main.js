// main.js - entrypoint
(function () {
  const INIT_FNS = [
    'initPartials',
    'initMenu',
    'initLightbox',
    'initCarousel',
    'initNews',
    'initMedia',
    'initEmailReveal',
  ];
  function safeCall(fnName) {
    const fn = window[fnName];
    if (typeof fn !== 'function') return;
    try { fn(); } catch (err) {
      console.warn(`[main] ${fnName} failed:`, err);
    }
  }

  function boot() { INIT_FNS.forEach(safeCall); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('partials:loaded', () => {
    ['initLightbox', 'initCarousel', 'initNews', 'initEmailReveal'].forEach(safeCall);
  });

  window.initEmailReveal = function initEmailReveal() {
    if (window.__emailRevealBound) return;
    window.__emailRevealBound = true;

    document.addEventListener('click', function (ev) {
      const btn = ev.target.closest('.email-reveal[data-e]');
      if (!btn) return;

      const out = btn.nextElementSibling;
      if (!out || !out.classList.contains('email-out')) return;

      if (out.dataset.revealed === '1') return;

      try {
        const email = atob(btn.dataset.e);
        out.textContent = email;
        out.dataset.revealed = '1';
        btn.disabled = true;
        btn.textContent = 'E-mail';
      } catch (e) {}
    });
  };
})();