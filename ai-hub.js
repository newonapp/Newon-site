/**
 * Consumer AI hub — filter, reveal, detail panels.
 */
(function () {
  "use strict";

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initReveal(root) {
    var nodes = Array.prototype.slice.call(root.querySelectorAll("[data-ai-reveal]"));
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
  }

  function initFilter(root) {
    var bar = root.querySelector(".cai-filter");
    var grid = root.querySelector("[data-cai-grid]");
    if (!bar || !grid) return;
    var buttons = Array.prototype.slice.call(bar.querySelectorAll("[data-cai-filter]"));
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-cai-card]"));

    function apply(cat) {
      buttons.forEach(function (btn) {
        var on = btn.getAttribute("data-cai-filter") === cat;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      cards.forEach(function (card) {
        var match = cat === "all" || card.getAttribute("data-cai-cat") === cat;
        card.hidden = !match;
        card.classList.toggle("is-filtered-out", !match);
      });
    }

    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cai-filter]");
      if (!btn || !bar.contains(btn)) return;
      apply(btn.getAttribute("data-cai-filter"));
    });
  }

  function initDetails(root) {
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-cai-detail]"));
    if (!panels.length) return;

    function closeAll() {
      panels.forEach(function (p) {
        p.hidden = true;
        p.classList.remove("is-open");
      });
      root.classList.remove("has-cai-detail");
    }

    function open(id) {
      closeAll();
      var panel = root.querySelector('[data-cai-detail="' + id + '"]');
      if (!panel) return;
      panel.hidden = false;
      panel.classList.add("is-open");
      root.classList.add("has-cai-detail");
      if (!reduceMotion()) {
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        panel.scrollIntoView({ block: "nearest" });
      }
    }

    root.addEventListener("click", function (e) {
      var openBtn = e.target.closest("[data-cai-open]");
      if (openBtn && root.contains(openBtn)) {
        e.preventDefault();
        open(openBtn.getAttribute("data-cai-open"));
        return;
      }
      if (e.target.closest("[data-cai-close]")) {
        e.preventDefault();
        closeAll();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });

    if (location.hash && location.hash.indexOf("#cai-") === 0) {
      var hid = location.hash.slice(5);
      if (hid) open(hid);
    }
  }

  function init() {
    var root = document.querySelector("[data-cai-page], [data-ai-page]");
    if (!root) return;
    initReveal(root);
    initFilter(root);
    initDetails(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
