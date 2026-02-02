// media.js - Media page controls (filter/search/sort/embed + pagination)
// Safe to load on any page: exits if required DOM is missing.

(function () {
  function initMedia() {
    const list = document.getElementById('mediaList');
    if (!list) return;

    const cards = Array.from(list.querySelectorAll('.media-card'));
    const chips = Array.from(document.querySelectorAll('.chip[data-filter]'));
    const search = document.getElementById('mediaSearch');
    const sort = document.getElementById('mediaSort');

    // Pagination elements (optional but recommended)
    const pagePrev = document.getElementById('pagePrev');
    const pageNext = document.getElementById('pageNext');
    const pageNumbers = document.getElementById('pageNumbers');

    // === Pagination config ===
    const PAGE_SIZE = 5; // ✅ 페이지당 카드 수 (원하는 숫자로 변경)
    let currentPage = 1;

    // Filter state
    let currentFilter = 'all';
    let query = '';
    let sortMode = 'date_desc';

    // Helper: parse date (YYYY-MM-DD)
    function dateValue(card) {
      const d = card.getAttribute('data-date') || '1970-01-01';
      return new Date(d + 'T00:00:00').getTime();
    }

    // Helper: searchable text
    function textValue(card) {
      const t = (card.getAttribute('data-title') || '').toLowerCase();
      const o = (card.getAttribute('data-outlet') || '').toLowerCase();
      const k = (card.getAttribute('data-keywords') || '').toLowerCase();
      return (t + ' ' + o + ' ' + k);
    }

    // Auto thumbnail for YouTube if img src empty and embed is youtube
    function fillYouTubeThumb(card) {
      const type = card.getAttribute('data-type');
      if (type !== 'youtube' && type !== 'video') return;

      const img = card.querySelector('.media-thumb img');
      if (!img) return;

      const src = (img.getAttribute('src') || '').trim();
      if (src !== '') return;

      const embed = card.getAttribute('data-embed') || '';
      const m = embed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
      if (!m) return;

      img.src = 'https://img.youtube.com/vi/' + m[1] + '/hqdefault.jpg';
    }

    // Expand/collapse embed
    function setEmbedSrc(card, on) {
      const iframe = card.querySelector('.media-embed iframe');
      if (!iframe) return;
      const embed = card.getAttribute('data-embed') || '';
      iframe.src = on ? embed : '';
    }

    function collapseAll() {
      cards.forEach(c => {
        c.classList.remove('expanded');
        setEmbedSrc(c, false);
      });
    }

    // Card click handler
    cards.forEach(card => {
      fillYouTubeThumb(card);

      card.addEventListener('click', (e) => {
        const toggle = e.target.closest('[data-action="toggle"]');
        if (toggle) {
          e.preventDefault();
          const isOpen = card.classList.contains('expanded');

          collapseAll();
          if (!isOpen) {
            card.classList.add('expanded');
            setEmbedSrc(card, true);
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }

        // If clicked inside links, let them work
        if (e.target.closest('a')) return;

        const url = card.getAttribute('data-url');
        if (url) window.open(url, '_blank', 'noopener');
      });
    });

    // Sort cards, then return the sorted array (does not filter yet)
    function getSortedCards() {
      const sorted = cards.slice().sort((a, b) => {
        if (sortMode === 'date_desc') return dateValue(b) - dateValue(a);
        if (sortMode === 'date_asc') return dateValue(a) - dateValue(b);
        if (sortMode === 'title_asc') {
          const at = (a.getAttribute('data-title') || '').toLowerCase();
          const bt = (b.getAttribute('data-title') || '').toLowerCase();
          return at.localeCompare(bt);
        }
        return 0;
      });

      // keep DOM in sorted order for consistent reading
      sorted.forEach(c => list.appendChild(c));
      return sorted;
    }

    // Apply filter+search to sorted array
    function getFilteredCards(sorted) {
      return sorted.filter(card => {
        const type = card.getAttribute('data-type') || '';
        const okType = (currentFilter === 'all') ? true : (type === currentFilter);
        const okQuery = query ? textValue(card).includes(query) : true;
        return okType && okQuery;
      });
    }

    function clampPage(page, totalPages) {
      if (totalPages <= 1) return 1;
      if (page < 1) return 1;
      if (page > totalPages) return totalPages;
      return page;
    }

    // Build page numbers UI
    function renderPagination(totalItems) {
      if (!pageNumbers || !pagePrev || !pageNext) return;

      const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
      currentPage = clampPage(currentPage, totalPages);

      // Prev/Next enable
      pagePrev.disabled = (currentPage <= 1);
      pageNext.disabled = (currentPage >= totalPages);

      // Page number buttons (compact)
      pageNumbers.innerHTML = '';

      function addPageButton(p) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'page-num' + (p === currentPage ? ' active' : '');
        btn.textContent = String(p);
        btn.addEventListener('click', () => {
          currentPage = p;
          apply();
          // go to top of list for better UX
          list.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        pageNumbers.appendChild(btn);
      }

      function addEllipsis() {
        const span = document.createElement('span');
        span.textContent = '…';
        span.style.opacity = '.6';
        span.style.padding = '0 .25rem';
        pageNumbers.appendChild(span);
      }

      // Show: 1, (…)? , current-1,current,current+1, (…)? , last
      const windowSize = 1; // neighbors around current
      const pagesToShow = new Set([1, totalPages]);

      for (let p = currentPage - windowSize; p <= currentPage + windowSize; p++) {
        if (p >= 1 && p <= totalPages) pagesToShow.add(p);
      }

      const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);

      let prev = 0;
      sortedPages.forEach(p => {
        if (prev && p - prev > 1) addEllipsis();
        addPageButton(p);
        prev = p;
      });
    }

    // Main apply: sort + filter + paginate + show/hide
    function apply() {
      const sorted = getSortedCards();
      const filtered = getFilteredCards(sorted);

      const totalItems = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
      currentPage = clampPage(currentPage, totalPages);

      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;

      // Hide all first
      cards.forEach(c => { c.style.display = 'none'; });

      // Show only current page items (already in DOM sorted order)
      filtered.slice(start, end).forEach(c => { c.style.display = ''; });

      // close embeds when changing state/page
      collapseAll();

      // Update pagination UI
      renderPagination(totalItems);

      // Wire prev/next (safe to call repeatedly)
      if (pagePrev && !pagePrev.dataset.bound) {
        pagePrev.dataset.bound = '1';
        pagePrev.addEventListener('click', () => {
          currentPage -= 1;
          apply();
          list.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      if (pageNext && !pageNext.dataset.bound) {
        pageNext.dataset.bound = '1';
        pageNext.addEventListener('click', () => {
          currentPage += 1;
          apply();
          list.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }

      // If pagination elements are missing, just show all (fallback)
      if (!pagePrev || !pageNext || !pageNumbers) {
        cards.forEach(c => { c.style.display = ''; });
      }
    }

    // Filter chips
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.getAttribute('data-filter') || 'all';
        currentPage = 1; // ✅ reset page
        apply();
      });
    });

    // Search
    if (search) {
      search.addEventListener('input', () => {
        query = (search.value || '').trim().toLowerCase();
        currentPage = 1; // ✅ reset page
        apply();
      });
    }

    // Sort
    if (sort) {
      sort.addEventListener('change', () => {
        sortMode = sort.value || 'date_desc';
        currentPage = 1; // ✅ reset page
        apply();
      });
    }

    // initial apply
    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMedia);
  } else {
    initMedia();
  }

  window.initMedia = initMedia;
})();
