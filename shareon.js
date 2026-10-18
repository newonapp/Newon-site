/* SHAREON pages — progressive enhancement only. No network calls.
   Business page: highlights the sticky group index entry for the group currently on screen.
   Everything else (FAQ <details>, anchors) works without JS. */
(function () {
  "use strict";
  var root = document.getElementById("shareon-detail");
  if (!root || !("IntersectionObserver" in window)) return;

  Array.prototype.forEach.call(root.querySelectorAll("[data-nsh-groups]"), function (box) {
    var links = {};
    Array.prototype.forEach.call(box.querySelectorAll("[data-nsh-group-link]"), function (a) {
      links[a.getAttribute("data-nsh-group-link")] = a;
    });
    var groups = box.querySelectorAll("[data-nsh-group]");
    if (!groups.length) return;
    function mark(id) {
      Object.keys(links).forEach(function (k) {
        if (k === id) links[k].setAttribute("aria-current", "true");
        else links[k].removeAttribute("aria-current");
      });
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) mark(en.target.getAttribute("data-nsh-group"));
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    Array.prototype.forEach.call(groups, function (g) { io.observe(g); });
    mark(groups[0].getAttribute("data-nsh-group"));
  });
})();
