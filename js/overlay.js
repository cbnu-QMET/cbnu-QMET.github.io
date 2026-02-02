// overlay.js
// Overlay open/close with event delegation so it works for dynamically injected overlays.

(function () {
  function getActiveOverlays() {
    return Array.from(document.querySelectorAll('.overlay.active'));
  }

  function updateBodyScrollLock() {
    const anyOpen = getActiveOverlays().length > 0;
    document.body.classList.toggle('no-scroll', anyOpen);
  }

  function openOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.add('active');
    updateBodyScrollLock();
  }

  function closeOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.remove('active');
    updateBodyScrollLock();
  }

  function closeAllOverlays() {
    getActiveOverlays().forEach((o) => o.classList.remove('active'));
    updateBodyScrollLock();
  }

  function initOverlay() {
    // Bind once.
    if (document.documentElement.dataset.overlayBound === '1') return;
    document.documentElement.dataset.overlayBound = '1';

    // Open triggers: <a data-overlay="someOverlayId">
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-overlay]');
      if (!trigger) return;
      const overlayId = trigger.getAttribute('data-overlay');
      if (!overlayId) return;
      e.preventDefault();
      openOverlay(overlayId);
    });

    // Close buttons: <button class="overlay-close" data-close="someOverlayId">
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-close]');
      if (!closeBtn) return;
      const overlayId = closeBtn.getAttribute('data-close');
      if (!overlayId) return;
      e.preventDefault();
      closeOverlay(overlayId);
    });

    // Close when clicking overlay background.
    document.addEventListener('click', (e) => {
      const overlay = e.target.classList?.contains('overlay') ? e.target : null;
      if (!overlay) return;
      // Only close if click is on background (not inside content)
      if (e.target === overlay) closeAllOverlays();
    });

    // Close on Escape.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllOverlays();
    });
  }

  // Expose for main.js
  window.initOverlay = initOverlay;
  // Expose helpers for optional use
  window.__overlay = { openOverlay, closeOverlay, closeAllOverlays };
})();
