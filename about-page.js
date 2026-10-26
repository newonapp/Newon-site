/**
 * About page — reveal, sticky principles, co-switch scroll border.
 */
(function () {
  var root = document.getElementById("about-main");
  if (!root) return;

  function reduceMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function initReveal() {
    var nodes = root.querySelectorAll("[data-ab-reveal]");
    if (!nodes.length) return;
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, function (el) {
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
    Array.prototype.forEach.call(nodes, function (el) {
      io.observe(el);
    });
  }

  function initPrinciples() {
    var list = root.querySelector("[data-ab-principles]");
    if (!list) return;
    var items = list.querySelectorAll("[data-ab-principle]");
    if (!items.length) return;

    if (window.matchMedia("(max-width: 1024px)").matches || reduceMotion()) {
      Array.prototype.forEach.call(items, function (el) {
        el.classList.add("is-active");
      });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      items[0].classList.add("is-active");
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (e) {
            return e.isIntersecting;
          })
          .sort(function (a, b) {
            return a.boundingClientRect.top - b.boundingClientRect.top;
          });
        if (!visible.length) return;
        var target = visible[0].target;
        Array.prototype.forEach.call(items, function (el) {
          el.classList.toggle("is-active", el === target);
        });
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    Array.prototype.forEach.call(items, function (el) {
      io.observe(el);
    });
  }

  function initSwitchScroll() {
    var nav = document.querySelector(".co-switch");
    if (!nav) return;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      nav.classList.toggle("is-scrolled", y > 8);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initBrandScroll() {
    var link = root.querySelector("[data-ab-brand-scroll]");
    if (!link) return;
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
    });
  }

  initReveal();
  initPrinciples();
  initSwitchScroll();
  initBrandScroll();
})();
