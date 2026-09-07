(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function reveal() {
    var nodes = document.querySelectorAll("[data-ir-reveal]");
    if (!nodes.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  function bindPrint() {
    var btn = document.getElementById("ir-print");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.print();
    });
  }

  function navSpy() {
    var links = document.querySelectorAll(".ir-nav__link");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").slice(1);
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = map[entry.target.id];
          if (!link) return;
          links.forEach(function (el) {
            el.classList.toggle("is-on", el === link);
          });
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.01 }
    );
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  function beforePrint() {
    document.querySelectorAll("[data-ir-reveal]").forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if ("onbeforeprint" in window) {
    window.addEventListener("beforeprint", beforePrint);
  }
  if (window.matchMedia) {
    try {
      window.matchMedia("print").addListener(function (m) {
        if (m.matches) beforePrint();
      });
    } catch (_) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      reveal();
      bindPrint();
      navSpy();
    });
  } else {
    reveal();
    bindPrint();
    navSpy();
  }
})();
