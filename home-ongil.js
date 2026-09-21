(function () {
  var root = document.getElementById("ongil-detail");
  if (!root) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("is-js");

  function showDecade(id) {
    if (!id) return;
    root.querySelectorAll("[data-nls-decade]").forEach(function (btn) {
      var on = btn.getAttribute("data-nls-decade") === id;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    root.querySelectorAll("[data-nls-decade-card]").forEach(function (card) {
      card.classList.toggle("is-on", card.getAttribute("data-nls-decade-card") === id);
    });
  }

  root.addEventListener("click", function (e) {
    var node = e.target.closest("[data-nls-hero-node]");
    if (node && root.contains(node)) {
      root.querySelectorAll("[data-nls-hero-node]").forEach(function (n) {
        n.classList.toggle("is-active", n === node);
      });
      var title = root.querySelector("[data-nls-now-title]");
      var age = root.querySelector("[data-nls-now-age]");
      if (title) title.textContent = node.getAttribute("data-name") || "";
      if (age) age.textContent = node.getAttribute("data-age") || "";
      return;
    }
    var decade = e.target.closest("[data-nls-decade]");
    if (decade && root.contains(decade)) {
      showDecade(decade.getAttribute("data-nls-decade"));
      return;
    }
    var scroll = e.target.closest("[data-nls-scroll]");
    if (!scroll || !root.contains(scroll)) return;
    var href = scroll.getAttribute("href") || "";
    if (href.charAt(0) !== "#") return;
    var target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", href);
  });

  function goHash() {
    var id = (location.hash || "").replace(/^#/, "");
    if (!id) return;
    var el = document.getElementById(id);
    if (el && root.contains(el)) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }
  if (document.readyState === "complete") goHash();
  else window.addEventListener("load", goHash);
})();
