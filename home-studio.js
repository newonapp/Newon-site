(function () {
  var root = document.querySelector("[data-hs-home]");
  if (!root) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = root.querySelectorAll("[data-hs-section]");

  if (!targets.length) return;

  if (reduce) {
    targets.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  targets.forEach(function (el, i) {
    el.classList.add("hs-reveal");
    el.style.transitionDelay = Math.min(i * 20, 120) + "ms";
  });
  if (targets[0]) targets[0].classList.add("is-in");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  } else {
    targets.forEach(function (el) {
      el.classList.add("is-in");
    });
  }
})();
