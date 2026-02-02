// partials.js - loads overlay HTML partials into #overlays
(function () {
  async function loadPartials() {
    const host = document.getElementById('overlays');
    if (!host) return;

    const files = ["partials/overlay-aboutOverlay.html", "partials/overlay-professorOverlay.html", "partials/overlay-teamOverlay.html", "partials/overlay-publicationOverlay.html", "partials/overlay-activityOverlay.html", "partials/overlay-insideLabOverlay.html", "partials/overlay-researchOverlay.html", "partials/overlay-contactOverlay.html"];

    try {
      const htmlChunks = await Promise.all(
        files.map(async (path) => {
          const res = await fetch(path, { cache: 'no-store' });
          // If partials directory isn't shipped, just skip silently.
          if (!res.ok) return '';
          return await res.text();
        })
      );

      const html = htmlChunks.filter(Boolean).join('\n');
      if (html) {
        host.innerHTML = html;
        // Signal other scripts that depend on partial DOM
        window.__partialsLoaded = true;
        document.dispatchEvent(new Event('partials:loaded'));
      }
    } catch (err) {
      // Do not break the site if partial fetching fails.
      console.warn('[partials] failed to load overlays:', err);
    }
  }

  function initPartials() {
    // Start as early as possible, but after DOM is ready enough to find #overlays
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadPartials);
    } else {
      loadPartials();
    }
  }

  window.initPartials = initPartials;
  // Auto-run for pages that still include partials.js without main.js
  initPartials();
})(); 
