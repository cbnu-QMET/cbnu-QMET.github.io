// media.js - Media page (data-driven)
// Loads items from data/media.json (generated from data/media.csv) and renders cards.
// Provides filter/search/sort + pagination + inline YouTube embed toggle.

(function () {
  "use strict";

  const DATA_URL = "data/media.json";
  const PAGE_SIZE = 6; // cards per page
  const CARD_OPEN_CLASS = "expanded";

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function norm(s) {
    return (s || "").toString().trim().toLowerCase();
  }

  function safeDate(d) {
    // Expect YYYY-MM-DD; fallback for sorting
    if (!d) return "1970-01-01";
    return d;
  }

  function getYouTubeId(url) {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.replace(/^\//, "");
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/\/embed\/([^/]+)/);
      if (m && m[1]) return m[1];
    } catch (_) {
      // ignore
    }
    const m2 = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return m2 ? m2[1] : "";
  }

  function buildEmbedUrl(item) {
    if (item.embed) return item.embed;
    const id = getYouTubeId(item.url);
    return id ? `https://www.youtube.com/embed/${id}` : "";
  }

  function badgeLabel(type) {
    if (type === "news") return "News";
    if (type === "youtube") return "YouTube";
    if (type === "video") return "News Video";
    return "Media";
  }

  function setEmbedSrc(card, on) {
    const iframe = qs(".media-embed iframe", card);
    if (!iframe) return;
    const embed = card.getAttribute("data-embed") || "";
    iframe.src = on ? embed : "";
  }

  function collapseExpandedCards(list) {
    qsa(`.media-card.${CARD_OPEN_CLASS}`, list).forEach((card) => {
      card.classList.remove(CARD_OPEN_CLASS);
      setEmbedSrc(card, false);
    });
  }

  function scrollToListStart(list) {
    list.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function buildCard(item, list) {
    const type = item.type || "news";
    const date = safeDate(item.date);
    const title = item.title || "";
    const outlet = item.outlet || "";
    const url = item.url || "#";
    const thumb = item.thumb || "";
    const desc = item.desc || "";

    const playable = type === "youtube" || type === "video";
    const embedUrl = playable ? buildEmbedUrl(item) : "";

    const article = document.createElement("article");
    article.className = "media-card";
    article.setAttribute("data-type", type);
    article.setAttribute("data-date", date);
    article.setAttribute("data-title", title);
    article.setAttribute("data-outlet", outlet);
    article.setAttribute("data-keywords", Array.isArray(item.keywords) ? item.keywords.join(" ") : (item.keywords || ""));
    article.setAttribute("data-url", url);
    if (playable) article.setAttribute("data-embed", embedUrl);

    // Make card keyboard accessible
    article.tabIndex = 0;

    // Inner HTML matches existing CSS hooks in media.css
    article.innerHTML = `
      <div class="media-card-inner">
        <div class="media-thumb" aria-hidden="true">
          ${thumb ? `<img src="${thumb}" alt="">` : `<img src="" alt="">`}
          ${playable ? `
            <span class="play-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z"></path>
              </svg>
              Play
            </span>
          ` : ``}
        </div>

        <div class="media-meta">
          <div class="media-topline">
            <span class="media-badge">${badgeLabel(type)}</span>
            <span>${date}</span>
            <span>${outlet}</span>
          </div>

          <h2 class="media-title">${title}</h2>

          ${desc ? `<p class="media-desc">${escapeHtml(desc).replace(/\n/g, "<br>")}</p>` : ``}

          <div class="media-links">
            <a href="${url}" target="_blank" rel="noopener">${playable ? "Open source page →" : "Open article →"}</a>
            ${playable && embedUrl ? `<a href="#" data-action="toggle" aria-label="Toggle video">Play here →</a>` : ``}
          </div>
        </div>
      </div>

      ${playable ? `
        <div class="media-embed">
          <iframe
            title="${badgeLabel(type)}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            src="">
          </iframe>
        </div>
      ` : ``}
    `;

    // Fill YouTube thumb if missing
    if (playable) {
      const img = qs(".media-thumb img", article);
      if (img && !norm(img.getAttribute("src"))) {
        const id = getYouTubeId(url);
        if (id) img.src = `https://i.ytimg.com/vi/${id}/hq720.jpg`;
      }
    }

    // Click behaviors (match previous UX):
    // - Clicking "Play here" toggles embed on this card (collapses others)
    // - Clicking elsewhere opens article in new tab (unless it's a link)
    article.addEventListener("click", (e) => {
      const toggle = e.target && e.target.closest('[data-action="toggle"]');
      if (toggle) {
        e.preventDefault();
        const isOpen = article.classList.contains(CARD_OPEN_CLASS);
        collapseExpandedCards(list);
        if (!isOpen) {
          article.classList.add(CARD_OPEN_CLASS);
          setEmbedSrc(article, true);
          scrollToListStart(list);
        }
        return;
      }

      // let normal links behave
      if (e.target && e.target.closest("a")) return;

      if (!playable) {
        if (url && url !== "#") window.open(url, "_blank", "noopener");
        return;
      }

      // For playable items, clicking card opens source page
      if (url && url !== "#") window.open(url, "_blank", "noopener");
    });

    article.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        article.click();
      }
    });

    return article;
  }

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMedia() {
    const list = document.getElementById("mediaList");
    if (!list) return;

    const chips = qsa('.chip[data-filter]');
    const search = document.getElementById("mediaSearch");
    const sort = document.getElementById("mediaSort");

    const pagePrev = document.getElementById("pagePrev");
    const pageNext = document.getElementById("pageNext");
    const pageNumbers = document.getElementById("pageNumbers");

    const state = {
      filter: "all",
      query: "",
      sortMode: "date_desc",
      page: 1,
      items: [],
    };

    function dateKey(it) {
      return safeDate(it.date);
    }

    function matches(it) {
      const okType = state.filter === "all" ? true : it.type === state.filter;
      if (!okType) return false;

      const q = norm(state.query);
      if (!q) return true;

      const hay = [
        it.title,
        it.outlet,
        Array.isArray(it.keywords) ? it.keywords.join(" ") : (it.keywords || ""),
        it.desc,
        it.date,
        it.type,
      ].map(norm).join(" ");

      return hay.includes(q);
    }

    function sortItems(arr) {
      const out = arr.slice();
      if (state.sortMode === "title_asc") {
        out.sort((a, b) => (a.title || "").localeCompare(b.title || "", "ko"));
        return out;
      }
      out.sort((a, b) => {
        const da = dateKey(a);
        const db = dateKey(b);
        return state.sortMode === "date_asc" ? da.localeCompare(db) : db.localeCompare(da);
      });
      return out;
    }

    function clampPage(p, totalPages) {
      if (totalPages <= 1) return 1;
      if (p < 1) return 1;
      if (p > totalPages) return totalPages;
      return p;
    }

    function renderPagination(totalItems) {
      if (!pagePrev || !pageNext || !pageNumbers) return;

      const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
      state.page = clampPage(state.page, totalPages);

      pagePrev.disabled = state.page <= 1;
      pageNext.disabled = state.page >= totalPages;

      pageNumbers.innerHTML = "";

      function addBtn(p) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "page-num" + (p === state.page ? " active" : "");
        btn.textContent = String(p);
        btn.addEventListener("click", () => {
          state.page = p;
          apply();
          scrollToListStart(list);
        });
        pageNumbers.appendChild(btn);
      }

      function addEllipsis() {
        const span = document.createElement("span");
        span.textContent = "…";
        span.style.opacity = ".6";
        span.style.padding = "0 .25rem";
        pageNumbers.appendChild(span);
      }

      const windowSize = 1;
      const pagesToShow = new Set([1, totalPages]);
      for (let p = state.page - windowSize; p <= state.page + windowSize; p++) {
        if (p >= 1 && p <= totalPages) pagesToShow.add(p);
      }
      const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);

      let prev = 0;
      sortedPages.forEach((p) => {
        if (prev && p - prev > 1) addEllipsis();
        addBtn(p);
        prev = p;
      });

      // bind prev/next once
      if (pagePrev && !pagePrev.dataset.bound) {
        pagePrev.dataset.bound = "1";
        pagePrev.addEventListener("click", () => {
          state.page -= 1;
          apply();
          scrollToListStart(list);
        });
      }
      if (pageNext && !pageNext.dataset.bound) {
        pageNext.dataset.bound = "1";
        pageNext.addEventListener("click", () => {
          state.page += 1;
          apply();
          scrollToListStart(list);
        });
      }
    }

    function apply() {
      const filtered = state.items.filter(matches);
      const sorted = sortItems(filtered);

      const totalItems = sorted.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
      state.page = clampPage(state.page, totalPages);

      const start = (state.page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const slice = sorted.slice(start, end);

      list.innerHTML = "";

      if (totalItems === 0) {
        const empty = document.createElement("div");
        empty.style.opacity = ".8";
        empty.textContent = "No results. Try adjusting filters or search keywords.";
        list.appendChild(empty);
        renderPagination(0);
        return;
      }

      slice.forEach((it) => list.appendChild(buildCard(it, list)));
      renderPagination(totalItems);
    }

    function setActiveChip(filter) {
      chips.forEach((chip) => {
        const isActive = (chip.getAttribute("data-filter") || "all") === filter;
        chip.classList.toggle("active", isActive);
        chip.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    // Wire chips/search/sort
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        state.filter = chip.getAttribute("data-filter") || "all";
        state.page = 1;
        setActiveChip(state.filter);
        apply();
      });
    });

    if (search) {
      search.addEventListener("input", () => {
        state.query = search.value || "";
        state.page = 1;
        apply();
      });
    }

    if (sort) {
      sort.addEventListener("change", () => {
        state.sortMode = sort.value || "date_desc";
        state.page = 1;
        apply();
      });
    }

    // Load data
    fetch(DATA_URL, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${DATA_URL}: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        state.items = Array.isArray(data) ? data : [];
        // normalize keywords if string
        state.items = state.items.map((it) => {
          const out = Object.assign({}, it);
          if (typeof out.keywords === "string") {
            out.keywords = out.keywords.split(/[\s,]+/).filter(Boolean);
          }
          out.date = safeDate(out.date);
          return out;
        });

        setActiveChip(state.filter);
        apply();
      })
      .catch((err) => {
        console.error(err);
        list.innerHTML = "";
        const box = document.createElement("div");
        box.style.opacity = ".85";
        box.style.lineHeight = "1.8";
        box.innerHTML = `Failed to load media data. <br><span style="opacity:.7">${escapeHtml(err.message)}</span>`;
        list.appendChild(box);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMedia);
  } else {
    initMedia();
  }

  window.initMedia = initMedia;
})();
