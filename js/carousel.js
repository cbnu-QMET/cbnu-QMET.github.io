// carousel.js
// Activity carousel + (optional) mailto contact helper.

(function () {
  function initCarousel() {
    document.querySelectorAll('.activity-carousel').forEach((carousel) => {
      const track = carousel.querySelector('.carousel-track');
      if (!track) return;
      // Avoid cloning twice if initCarousel runs again.
      if (track.dataset.cloned === '1') return;
      track.dataset.cloned = '1';

      const slides = Array.from(track.querySelectorAll('.carousel-slide'));
      slides.forEach((slide) => {
        track.appendChild(slide.cloneNode(true));
      });
    });
  }

  window.initCarousel = initCarousel;
})();
