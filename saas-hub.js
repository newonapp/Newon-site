/**
 * Newon+ SaaS hub — reveal, package detail, smooth in-page scroll.
 */
(function () {
  "use strict";

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initReveal(root) {
    var nodes = Array.prototype.slice.call(root.querySelectorAll("[data-saas-reveal]"));
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

  function initScroll(root) {
    root.addEventListener("click", function (e) {
      var a = e.target.closest("[data-plus-scroll]");
      if (!a || !root.contains(a)) return;
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
    });
  }

  function initDetails(root) {
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-plus-detail]"));
    if (!panels.length) return;

    function closeAll() {
      panels.forEach(function (p) {
        p.hidden = true;
        p.classList.remove("is-open");
      });
    }

    function open(id) {
      closeAll();
      var panel = root.querySelector('[data-plus-detail="' + id + '"]');
      if (!panel) return;
      panel.hidden = false;
      panel.classList.add("is-open");
      panel.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "nearest" });
    }

    root.addEventListener("click", function (e) {
      var openBtn = e.target.closest("[data-plus-open]");
      if (openBtn && root.contains(openBtn)) {
        e.preventDefault();
        open(openBtn.getAttribute("data-plus-open"));
        return;
      }
      if (e.target.closest("[data-plus-close]")) {
        e.preventDefault();
        closeAll();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
  }

  function init() {
    var root = document.querySelector("[data-plus-page], [data-saas-page]");
    if (!root) return;
    initReveal(root);
    initScroll(root);
    initDetails(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
