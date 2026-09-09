/**
 * SaaS hub — reveal, principle lines, product nav active state, smooth anchors.
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    nodes.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add("is-in");
      else io.observe(el);
    });
    window.setTimeout(function () {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
    }, 1400);
  }

  function initPrinciple(root) {
    var section = root.querySelector("[data-saas-principle]");
    if (!section) return;
    var lines = Array.prototype.slice.call(section.querySelectorAll("[data-principle-line]"));
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      lines.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          lines.forEach(function (line, i) {
            window.setTimeout(function () {
              line.classList.add("is-in");
            }, i * 100);
          });
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    io.observe(section);
  }

  function initNav(root) {
    var links = Array.prototype.slice.call(root.querySelectorAll("[data-saas-nav]"));
    var sections = Array.prototype.slice.call(root.querySelectorAll("[data-saas-section]"));
    if (!links.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("data-saas-nav") === id);
      });
    }

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id.charAt(0) !== "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", id);
        setActive(a.getAttribute("data-saas-nav"));
      });
    });

    if (!sections.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          setActive(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
    );
    sections.forEach(function (sec) {
      io.observe(sec);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-saas-page]").forEach(function (root) {
      initReveal(root);
      initPrinciple(root);
      initNav(root);
    });
  });
})();
