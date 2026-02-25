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
  
  document.addEventListener('DOMContentLoaded', function () {
    // 텍스트만 표시 (mailto 없음)
    document.querySelectorAll('.email-js[data-u][data-d]').forEach(function (el) {
      const email = el.dataset.u + '@' + el.dataset.d;
      el.textContent = email;
    });

    // mailto가 필요한 경우만: <a>인 요소에만 href 부여
    document.querySelectorAll('a.email-js[data-u][data-d]').forEach(function (a) {
      const email = a.dataset.u + '@' + a.dataset.d;
      a.href = 'mailto:' + email;
    });
  });
})();
