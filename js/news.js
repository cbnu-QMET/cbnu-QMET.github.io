// news.js
// Opens external news links from cards. Uses event delegation.

(function () {
  function initNews() {
    if (document.documentElement.dataset.newsBound === '1') return;
    document.documentElement.dataset.newsBound = '1';

    document.addEventListener('click', (e) => {
      const card = e.target.closest('.activity-card.has-news');
      if (!card) return;
      // Don't navigate if clicking inside the carousel.
      if (e.target.closest('.activity-carousel')) return;
      const newsUrl = card.getAttribute('data-news-url');
      if (newsUrl) window.open(newsUrl, '_blank', 'noopener');
    });
  }

  window.initNews = initNews;
})();
