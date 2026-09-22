(function () {
  var root = document.querySelector("#ecosystem-detail.eco");
  if (!root) return;

  var film = root.querySelector("[data-eco-film]");
  if (film) {
    requestAnimationFrame(function () {
      film.classList.add("is-ready");
    });
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nodes = root.querySelectorAll("[data-eco-reveal]");
  var map = root.querySelector("[data-eco-map]");

  function showAll() {
    root.classList.add("is-static-motion");
    nodes.forEach(function (el) {
      el.classList.add("is-in");
    });
    if (map) map.classList.add("is-in");
  }

  if (reduce || !("IntersectionObserver" in window)) {
    showAll();
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        if (entry.target.hasAttribute("data-eco-map")) {
          entry.target.querySelectorAll("[data-eco-reveal]").forEach(function (el) {
            el.classList.add("is-in");
          });
        }
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px 12% 0px" }
  );

  nodes.forEach(function (el) {
    io.observe(el);
  });
  if (map) io.observe(map);
})();
