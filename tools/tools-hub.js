/**
 * Tools hub — search, filters, ⌘K, command panel, reveal.
 */
(function () {
  "use strict";

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initReveal(root) {
    var nodes = Array.prototype.slice.call(root.querySelectorAll("[data-tools-reveal]"));
    if (!nodes.length) return;
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );
    nodes.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add("is-in");
      else io.observe(el);
    });
    window.setTimeout(function () {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
    }, 1200);
  }

  function loadIndex() {
    var el = document.getElementById("tools-search-index");
    if (!el) return [];
    try {
      return JSON.parse(el.textContent || "[]");
    } catch (e) {
      return [];
    }
  }

  function initHub(root) {
    var input = root.querySelector("[data-tools-search]");
    var panel = root.querySelector("[data-tools-results]");
    var grid = root.querySelector("[data-tools-grid]");
    var empty = root.querySelector("[data-tools-empty]");
    var countEl = root.querySelector("[data-tools-count]");
    var kbd = root.querySelector("[data-tools-kbd]");
    var index = loadIndex();
    var filter = "all";
    var activeIdx = -1;
    var panelOpen = false;

    if (kbd) {
      var isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
      kbd.textContent = isMac ? "⌘ K" : "Ctrl K";
    }

    function visibleItems() {
      if (!grid) return [];
      return Array.prototype.slice.call(grid.querySelectorAll("[data-tool-item]")).filter(function (el) {
        return !el.classList.contains("is-hidden");
      });
    }

    function updateCount() {
      var n = visibleItems().length;
      if (countEl) {
        var num = countEl.querySelector("[data-count-num]");
        if (num) num.textContent = String(n);
        else countEl.innerHTML = "<strong>" + n + "</strong>";
      }
      if (empty) empty.hidden = n !== 0;
    }

    function applyFilterAndQuery() {
      if (!grid) return;
      var q = (input && input.value ? input.value : "").trim().toLowerCase();
      grid.querySelectorAll("[data-tool-item]").forEach(function (card) {
        var filters = (card.getAttribute("data-tool-filters") || "").split(/\s+/);
        var search = card.getAttribute("data-tool-search") || "";
        var okFilter = filter === "all" || filters.indexOf(filter) !== -1;
        var okQuery = !q || search.indexOf(q) !== -1;
        card.classList.toggle("is-hidden", !(okFilter && okQuery));
      });
      updateCount();
    }

    function closePanel() {
      if (!panel || !input) return;
      panel.hidden = true;
      panelOpen = false;
      activeIdx = -1;
      input.setAttribute("aria-expanded", "false");
    }

    function escapeText(s) {
      return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function syncActive() {
      if (!panel) return;
      var items = panel.querySelectorAll(".tools-search__item");
      items.forEach(function (el, i) {
        el.classList.toggle("is-active", i === activeIdx);
      });
    }

    function renderPanel(results) {
      if (!panel) return;
      if (!results.length) {
        var emptyMsg = panel.getAttribute("data-empty-msg") || "No tools found.";
        panel.innerHTML = '<p class="tools-search__empty">' + escapeText(emptyMsg) + "</p>";
        panel.hidden = false;
        panelOpen = true;
        input.setAttribute("aria-expanded", "true");
        return;
      }
      var html =
        '<p class="tools-search__meta">TOOLS / ' +
        results.length +
        "</p>" +
        results
          .map(function (r, i) {
            return (
              '<a class="tools-search__item" role="option" href="' +
              r.href +
              '" data-result-idx="' +
              i +
              '"><strong>' +
              escapeText(r.name) +
              "</strong><span>" +
              escapeText(r.desc) +
              "</span></a>"
            );
          })
          .join("");
      panel.innerHTML = html;
      panel.hidden = false;
      panelOpen = true;
      activeIdx = 0;
      syncActive();
      input.setAttribute("aria-expanded", "true");
    }

    function queryResults(q) {
      q = (q || "").trim().toLowerCase();
      if (!q) return [];
      return index.filter(function (row) {
        return row.search.indexOf(q) !== -1;
      });
    }

    function focusSearch(prefill) {
      if (!input) return;
      if (typeof prefill === "string" && prefill) {
        input.value = prefill;
        input.dispatchEvent(new Event("input"));
      }
      input.focus();
      input.select();
    }

    if (input) {
      input.addEventListener("input", function () {
        applyFilterAndQuery();
        var q = input.value.trim();
        if (!q) {
          closePanel();
          return;
        }
        renderPanel(queryResults(q));
      });

      input.addEventListener("keydown", function (e) {
        if (!panelOpen) return;
        var items = panel.querySelectorAll(".tools-search__item");
        if (e.key === "ArrowDown") {
          e.preventDefault();
          activeIdx = Math.min(items.length - 1, activeIdx + 1);
          syncActive();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          activeIdx = Math.max(0, activeIdx - 1);
          syncActive();
        } else if (e.key === "Enter" && activeIdx >= 0 && items[activeIdx]) {
          e.preventDefault();
          window.location.href = items[activeIdx].getAttribute("href");
        } else if (e.key === "Escape") {
          e.preventDefault();
          closePanel();
          input.blur();
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        if (!input) return;
        e.preventDefault();
        focusSearch();
      }
    });

    root.querySelectorAll("[data-tools-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filter = btn.getAttribute("data-tools-filter") || "all";
        root.querySelectorAll("[data-tools-filter]").forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        applyFilterAndQuery();
      });
    });

    root.querySelectorAll("[data-cmd-focus]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        focusSearch(btn.getAttribute("data-cmd-query") || "");
      });
    });

    document.addEventListener("click", function (e) {
      if (!panelOpen) return;
      var shell = root.querySelector("[data-tools-search-root]");
      if (shell && !shell.contains(e.target)) closePanel();
    });

    applyFilterAndQuery();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-tools-page]").forEach(function (root) {
      initReveal(root);
      initHub(root);
    });
  });
})();
