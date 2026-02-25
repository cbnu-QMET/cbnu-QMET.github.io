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
  function handleContactSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    const nameEl = document.getElementById('name');
    const emailEl = document.getElementById('email');
    const subjectEl = document.getElementById('subject');
    const messageEl = document.getElementById('message');
    const statusEl = document.getElementById('contactStatus');

    if (!nameEl || !emailEl || !messageEl) return;

    const name = (nameEl.value || '').trim();
    const email = (emailEl.value || '').trim();
    const subject = (subjectEl && subjectEl.value ? subjectEl.value : '').trim();
    const message = (messageEl.value || '').trim();

    // 기본 검증(브라우저 required도 있지만, UX 위해 한번 더)
    if (!name || !email || !message) {
      if (statusEl) statusEl.textContent = 'Please fill in Name, Email, and Message.';
      return;
    }

    // ✅ 여기서 "메일앱 열기" 대신 안내만 표시
    if (statusEl) {
      statusEl.textContent =
        'Thanks! Your message is ready. Please email us at kiwoong@cbnu.ac.kr (copy/paste if needed).';
    }

    // 폼 리셋(원하면 제거 가능)
    const form = event && event.target && event.target.closest ? event.target.closest('form') : null;
    if (form && typeof form.reset === 'function') form.reset();
  }
  window.initCarousel = initCarousel;
  window.handleContactSubmit = handleContactSubmit;

  // (선택) 혹시 다른 페이지/옛 코드가 sendMail을 호출하면 깨지지 않게 alias 유지
  window.sendMail = handleContactSubmit;
})();
