// main.js - entrypoint
(function () {
  const INIT_FNS = [
    'initPartials',
    'initMenu',
    'initOverlay',
    'initLightbox',
    'initCarousel',
    'initNews',
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
    ['initOverlay', 'initLightbox', 'initCarousel', 'initNews', 'initEmailReveal'].forEach(safeCall);
  });

  // ✅ 여기: window에 직접 등록 (이중 함수 X)
  window.initEmailReveal = function initEmailReveal() {
    // 중복 등록 방지(페이지 내 여러 번 init 호출될 수 있어서)
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
        btn.textContent = 'e-mail';
      } catch (e) {}
    });
  };
})();