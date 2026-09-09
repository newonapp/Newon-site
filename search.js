/**
 * Global search modal — Cmd/Ctrl+K, keyboard selection, analytics.
 */
(function () {
  "use strict";

  var index = null;
  var modal = null;
  var activeIdx = -1;
  var searchOpener = null;
  var LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

  function langDir() {
    var segs = (location.pathname || "").replace(/\/index\.html$/i, "").replace(/\/$/, "").split("/").filter(Boolean);
    for (var i = 0; i < segs.length; i++) {
      if (LANGS.indexOf(segs[i]) !== -1) return segs[i];
    }
    return "ko";
  }

  function track(name, props) {
    if (window.newonTrack) window.newonTrack(name, props || {});
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "search-modal";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="search-modal__backdrop" data-search-close tabindex="-1" aria-hidden="true"></div>' +
      '<div class="search-modal__panel" role="dialog" aria-modal="true" aria-label="Search">' +
      '<label class="visually-hidden" for="newon-search-input">Search</label>' +
      '<input id="newon-search-input" type="search" class="search-modal__input" data-search-input placeholder="Search products, tools, blog…" autocomplete="off" aria-label="Search" aria-controls="newon-search-results" />' +
      '<ul id="newon-search-results" class="search-modal__results" data-search-results role="listbox" aria-live="polite" aria-atomic="true"></ul>' +
      "</div>";
    document.body.appendChild(modal);
    modal.querySelector("[data-search-close]").addEventListener("click", close);
    document.addEventListener("keydown", onGlobalKey);
    return modal;
  }

  function onGlobalKey(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      open();
      return;
    }
    if (!modal || modal.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    var ul = modal.querySelector("[data-search-results]");
    var links = ul ? ul.querySelectorAll("a") : [];
    if (!links.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, links.length - 1);
      highlight(links);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      highlight(links);
    }
    if (e.key === "Enter" && activeIdx >= 0 && links[activeIdx]) {
      e.preventDefault();
      links[activeIdx].click();
    }
  }

  function highlight(links) {
    Array.prototype.forEach.call(links, function (a, i) {
      a.classList.toggle("is-active", i === activeIdx);
      if (i === activeIdx) a.focus();
    });
  }

  function loadIndex(cb) {
    if (index) return cb(index);
    fetch("/search-index.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        index = data;
        cb(index);
      })
      .catch(function () {
        cb([]);
      });
  }

  function open(opener) {
    var m = ensureModal();
    searchOpener = opener || document.activeElement;
    m.hidden = false;
    activeIdx = -1;
    var input = m.querySelector("[data-search-input]");
    input.value = "";
    input.focus();
    track(window.newonAnalyticsEvents && window.newonAnalyticsEvents.SEARCH_OPEN, {});
    render("");
  }

  function close() {
    if (modal) modal.hidden = true;
    activeIdx = -1;
    var opener = searchOpener;
    searchOpener = null;
    if (opener && typeof opener.focus === "function" && document.contains(opener)) {
      try {
        opener.focus();
      } catch (err) {}
    }
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeHref(url) {
    var u = String(url || "").trim();
    if (!u) return "#";
    if (/^(https?:|\/|#|mailto:|tel:)/i.test(u) && !/^javascript:/i.test(u)) return u;
    return "#";
  }

  function render(q) {
    var m = ensureModal();
    var ul = m.querySelector("[data-search-results]");
    var lang = langDir();
    var needle = (q || "").trim();
    if (needle && window.newonAnalyticsEvents) {
      track(window.newonAnalyticsEvents.SEARCH_QUERY, { qLen: needle.length });
    }
    loadIndex(function (items) {
      var lower = needle.toLowerCase();
      var hits = items
        .filter(function (item) {
          if (item.lang && item.lang !== lang && item.lang !== "all") return false;
          if (!lower) return item.featured;
          var hay = (item.title + " " + (item.desc || item.description || "") + " " + (item.tags || []).join(" ")).toLowerCase();
          return hay.indexOf(lower) !== -1;
        })
        .slice(0, 12);
      activeIdx = hits.length ? 0 : -1;
      ul.innerHTML = hits.length
        ? hits
            .map(function (h, i) {
              var desc = h.desc || h.description || "";
              return (
                '<li role="option"><a href="' +
                escapeHtml(safeHref(h.url)) +
                '" class="' +
                (i === 0 ? "is-active" : "") +
                '" data-search-hit="' +
                i +
                '"><span class="search-modal__type">' +
                escapeHtml(h.type || "") +
                "</span><strong>" +
                escapeHtml(h.title) +
                "</strong>" +
                (desc ? '<span class="search-modal__desc">' + escapeHtml(desc) + "</span>" : "") +
                "</a></li>"
              );
            })
            .join("")
        : "<li class='search-modal__empty' role='presentation'>No results</li>";

      ul.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          track(window.newonAnalyticsEvents && window.newonAnalyticsEvents.SEARCH_RESULT_CLICK, {
            type: (a.querySelector(".search-modal__type") || {}).textContent || "",
          });
          close();
        });
      });
    });
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-search-open]");
    if (opener) {
      e.preventDefault();
      open(opener);
    }
  });

  document.addEventListener("input", function (e) {
    if (e.target.matches("[data-search-input]")) render(e.target.value);
  });
})();
