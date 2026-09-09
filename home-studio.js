(function () {
  var root = document.querySelector("[data-hs-home]");
  if (!root) return;

  var targets = root.querySelectorAll("[data-hs-section], .hs-bridge");
  if (!targets.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  targets.forEach(function (el, i) {
    el.classList.add("hs-reveal");
    el.style.transitionDelay = Math.min(i * 35, 180) + "ms";
  });

  // First below-hero section should be visible immediately
  if (targets[0]) {
    targets[0].classList.add("is-in");
    targets[0].querySelectorAll(
      ".hs-prod-feat, .hs-prod-tile, .hs-does-tile, .hs-business-stack__row, .hs-studio-compose__cell, .hs-built-word, .hs-lab-card, .hs-resources-card, .hs-latest-row, .hs-company-grid__item"
    ).forEach(function (kid) {
      kid.classList.add("hs-child-in");
    });
  }

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        var kids = e.target.querySelectorAll(
          ".hs-prod-feat, .hs-prod-tile, .hs-does-tile, .hs-business-stack__row, .hs-studio-compose__cell, .hs-built-word, .hs-lab-card, .hs-resources-card, .hs-latest-row, .hs-company-grid__item"
        );
        kids.forEach(function (kid, i) {
          kid.style.transitionDelay = Math.min(60 + i * 45, 360) + "ms";
          kid.classList.add("hs-child-in");
        });
        io.unobserve(e.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
  );

  targets.forEach(function (el) {
    io.observe(el);
  });
})();
