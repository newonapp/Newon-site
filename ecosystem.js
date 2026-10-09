(function () {
  var root = document.querySelector("#ecosystem-detail.eco");
  if (!root) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nodes = root.querySelectorAll("[data-eco-reveal]");
  var orbit = root.querySelector("[data-eco-orbit]");

  function showAll() {
    root.classList.add("is-static-motion");
    nodes.forEach(function (el) {
      el.classList.add("is-in");
    });
    if (orbit) orbit.classList.add("is-in");
  }

  function drawOrbit() {
    if (!orbit) return;
    var svg = orbit.querySelector(".eco-orbit__svg");
    var hub = orbit.querySelector("[data-eco-hub]");
    var sats = orbit.querySelectorAll("[data-eco-sat]");
    if (!svg || !hub || !sats.length) return;
    if (window.getComputedStyle(orbit).display === "none") return;

    var box = orbit.getBoundingClientRect();
    var hr = hub.getBoundingClientRect();
    var hx = hr.left + hr.width / 2 - box.left;
    var hy = hr.top + hr.height / 2 - box.top;
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    svg.innerHTML = "";
    sats.forEach(function (sat, i) {
      var sr = sat.getBoundingClientRect();
      var x = sr.left + sr.width / 2 - box.left;
      var y = sr.top + sr.height / 2 - box.top;
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", hx.toFixed(1));
      line.setAttribute("y1", hy.toFixed(1));
      line.setAttribute("x2", x.toFixed(1));
      line.setAttribute("y2", y.toFixed(1));
      line.style.animationDelay = 0.05 * i + "s";
      svg.appendChild(line);
    });
  }

  if (reduce || !("IntersectionObserver" in window)) {
    showAll();
    drawOrbit();
    window.addEventListener("resize", drawOrbit);
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
    { threshold: 0.08, rootMargin: "0px 0px 10% 0px" }
  );

  nodes.forEach(function (el) {
    io.observe(el);
  });

  if (orbit) {
    var oio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          orbit.classList.add("is-in");
          drawOrbit();
          oio.unobserve(orbit);
        });
      },
      { threshold: 0.2 }
    );
    oio.observe(orbit);
  }

  window.addEventListener("resize", function () {
    if (orbit && orbit.classList.contains("is-in")) drawOrbit();
  });
})();
