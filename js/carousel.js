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

  /**
   * Optional: a minimal mailto-based contact submission.
   * If the contact form uses inline onclick="sendMail(event)", this ensures it works.
   */
  function sendMail(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    const nameEl = document.getElementById('name');
    const emailEl = document.getElementById('email');
    const subjectEl = document.getElementById('subject');
    const messageEl = document.getElementById('message');

    if (!nameEl || !emailEl || !messageEl) return;

    const name = nameEl.value || '';
    const email = emailEl.value || '';
    const subject = (subjectEl && subjectEl.value) || 'Contact from QMET website';
    const message = messageEl.value || '';

    const to = 'kiwoong@cbnu.ac.kr';
    const bodyText = `Name: ${name}\nEmail: ${email}\n\n${message}`;

    const mailtoLink =
      `mailto:${encodeURIComponent(to)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyText)}`;

    window.location.href = mailtoLink;
  }

  window.initCarousel = initCarousel;
  window.sendMail = sendMail;
})();
