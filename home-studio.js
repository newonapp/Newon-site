(function () {
  var root = document.querySelector("[data-hs-home]");
  if (!root) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = root.querySelectorAll("[data-hs-section]");
  var rail = document.querySelector("[data-hs-story-rail]");
  var links = rail ? rail.querySelectorAll("[data-story-link]") : [];

  function setActive(id) {
    if (!links.length) return;
    links.forEach(function (a) {
      var on = a.getAttribute("data-story-link") === id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  if (targets.length) {
    if (reduce) {
      targets.forEach(function (el) {
        el.classList.add("is-in");
      });
    } else {
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
    }
  }

  var stories = root.querySelectorAll("[data-story]");
  if (stories.length && "IntersectionObserver" in window) {
    var activeIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          setActive(e.target.getAttribute("data-story"));
        });
      },
      { threshold: 0.45, rootMargin: "-20% 0px -35% 0px" }
    );
    stories.forEach(function (el) {
      activeIo.observe(el);
    });
  }
})();
