(function () {
  var root = document.querySelector("[data-hs-home]");
  if (!root) return;

  var targets = root.querySelectorAll("[data-hs-section], .hs-bridge");
  if (!targets.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  targets.forEach(function (el, i) {
    el.classList.add("hs-reveal");
    el.style.transitionDelay = Math.min(i * 40, 200) + "ms";
  });

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
        io.unobserve(e.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
  );

  targets.forEach(function (el) {
    io.observe(el);
  });
})();
