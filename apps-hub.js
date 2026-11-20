/**
 * Apps hub — category filter + section reveal (no page reload).
 */
(function () {
  "use strict";

  function initFilter(root) {
    var filters = root.querySelector("[data-apps-filters]");
    var grid = root.querySelector("[data-apps-grid]");
    var empty = root.querySelector("[data-apps-empty]");
    if (!filters || !grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-apps-card]"));
    var buttons = Array.prototype.slice.call(filters.querySelectorAll("[data-filter]"));

    function apply(cat) {
      var visible = 0;
      cards.forEach(function (card) {
        var match = cat === "all" || card.getAttribute("data-category") === cat;
        card.hidden = !match;
        if (match) visible += 1;
      });
      buttons.forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-filter") === cat);
      });
      if (empty) empty.hidden = visible > 0;
    }

    filters.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn || !filters.contains(btn)) return;
      apply(btn.getAttribute("data-filter") || "all");
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("category") || "all";
    if (!buttons.some(function (b) { return b.getAttribute("data-filter") === initial; })) {
      initial = "all";
    }
    apply(initial);
  }

  function initReveal(root) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var sections = Array.prototype.slice.call(root.querySelectorAll("[data-apps-section]"));
    if (!sections.length) return;

    function show(el) {
      el.classList.add("apps-reveal", "is-in");
    }

    if (reduce || !("IntersectionObserver" in window)) {
      sections.forEach(show);
      return;
    }

    sections.forEach(function (el) {
      el.classList.add("apps-reveal");
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.05 }
    );

    sections.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        show(el);
      } else {
        io.observe(el);
      }
    });

    // Safety: never leave sections invisible
    window.setTimeout(function () {
      sections.forEach(function (el) {
        if (!el.classList.contains("is-in")) show(el);
      });
    }, 1200);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-apps-page]").forEach(function (root) {
      initFilter(root);
      initReveal(root);
    });
  });
})();
