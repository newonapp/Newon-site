/* LIVON site — Life Event Explorer (progressive enhancement).
   Without JS every event is listed. With JS one event shows at a time and the 40-cell map highlights it.
   Nothing is stored; no network requests. */
(function () {
  var roots = document.querySelectorAll("[data-lvs-explorer]");
  Array.prototype.forEach.call(roots, function (root) {
    var tabs = root.querySelector(".lvs-ex__tabs");
    if (!tabs) return;
    var buttons = tabs.querySelectorAll("[data-lvs-event]");
    var panels = root.querySelectorAll("[data-lvs-event-panel]");
    var cells = root.querySelectorAll(".lvs-map__cell");
    function show(id) {
      var cats = [];
      Array.prototype.forEach.call(panels, function (p) {
        var on = p.getAttribute("data-lvs-event-panel") === id;
        p.classList.toggle("is-on", on);
        if (on) cats = (p.getAttribute("data-cats") || "").split(" ");
      });
      Array.prototype.forEach.call(buttons, function (b) {
        var on = b.getAttribute("data-lvs-event") === id;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      Array.prototype.forEach.call(cells, function (c) {
        c.classList.toggle("is-hit", cats.indexOf(c.getAttribute("data-n")) !== -1);
      });
    }
    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener("click", function () { show(b.getAttribute("data-lvs-event")); });
    });
    tabs.hidden = false;
    root.classList.add("is-ready");
    if (buttons[0]) show(buttons[0].getAttribute("data-lvs-event"));
  });
})();
