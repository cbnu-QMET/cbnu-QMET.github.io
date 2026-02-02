// lightbox.js
// Image gallery lightbox (page-safe). Requires specific DOM nodes; becomes a no-op if absent.

(function () {
  function initLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    // If this page doesn't have the lightbox markup, exit silently.
    if (!lightbox || !lightboxImage || !lightboxCaption || !lightboxCounter || !lightboxClose || !lightboxPrev || !lightboxNext) {
      return;
    }

    // Bind once.
    if (lightbox.dataset.bound === '1') return;
    lightbox.dataset.bound = '1';

    let currentGalleryImages = [];
    let currentIndex = 0;

    function getAllLightboxImages(clickedImg) {
      const card = clickedImg.closest('.research-card');
      if (card) return Array.from(card.querySelectorAll('[data-lightbox]'));
      return [clickedImg];
    }

    function updateLightboxImage() {
      const img = currentGalleryImages[currentIndex];
      if (!img) return;
      lightboxImage.src = img.src;
      lightboxCaption.textContent = img.alt || '';
      lightboxCounter.textContent = `${currentIndex + 1} / ${currentGalleryImages.length}`;
    }

    function setNavVisibility() {
      const many = currentGalleryImages.length > 1;
      lightboxPrev.style.display = many ? 'flex' : 'none';
      lightboxNext.style.display = many ? 'flex' : 'none';
      lightboxCounter.style.display = many ? 'block' : 'none';
    }

    function openLightbox(img) {
      currentGalleryImages = getAllLightboxImages(img);
      currentIndex = currentGalleryImages.indexOf(img);
      if (currentIndex === -1) currentIndex = 0;
      updateLightboxImage();
      setNavVisibility();
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function navigate(direction) {
      if (currentGalleryImages.length <= 1) return;
      currentIndex += direction;
      if (currentIndex < 0) currentIndex = currentGalleryImages.length - 1;
      if (currentIndex >= currentGalleryImages.length) currentIndex = 0;
      updateLightboxImage();
    }

    // Event delegation for lightbox triggers.
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-lightbox], .gallery-main img');
      if (!trigger) return;

      // If clicking thumbnail, it should only update the main image (handled below).
      if (e.target.closest('.gallery-thumbs')) return;

      openLightbox(trigger);
    });

    // Close button
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigate(-1));
    lightboxNext.addEventListener('click', () => navigate(1));

    // Click outside to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    // Thumbnail click to change main image
    document.addEventListener('click', (e) => {
      const thumb = e.target.closest('.gallery-thumbs img');
      if (!thumb) return;
      e.stopPropagation();

      const gallery = thumb.closest('.research-card-gallery');
      if (!gallery) return;
      const mainImg = gallery.querySelector('.gallery-main img');
      if (!mainImg) return;

      mainImg.src = thumb.src;
      mainImg.alt = thumb.alt;

      gallery.querySelectorAll('.gallery-thumbs img').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  }

  window.initLightbox = initLightbox;
})();
