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
})();
