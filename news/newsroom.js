/**
 * Company > News index — category filter only (.nr-*).
 * Empty state when filtered results are 0. No search.
 */
(function () {
  var hub = document.querySelector("[data-nr-hub]");
  if (!hub) return;

  var CATS = ["all", "launch", "update", "feature", "company", "notice"];
  var tabs = hub.querySelectorAll("[data-nr-filter]");
  var items = hub.querySelectorAll("[data-nr-item]");
  var empty = hub.querySelector("[data-nr-empty]");
  var current = "all";

  function fromUrl() {
    try {
      var q = new URLSearchParams(location.search);
      var c = (q.get("category") || q.get("cat") || "all").toLowerCase();
      if (CATS.indexOf(c) !== -1) return c;
    } catch (e) {}
    return "all";
  }

  function setUrl(cat, replace) {
    try {
      var u = new URL(location.href);
      if (cat === "all") {
        u.searchParams.delete("category");
        u.searchParams.delete("cat");
      } else {
        u.searchParams.set("category", cat);
        u.searchParams.delete("cat");
      }
      var next = u.pathname + u.search + u.hash;
      if (replace) history.replaceState({}, "", next);
      else history.pushState({}, "", next);
    } catch (e) {}
  }

  function apply(cat) {
    current = cat === "all" ? "all" : cat;
    var filteredNews = 0;
    Array.prototype.forEach.call(items, function (el) {
      var itemCat = (el.getAttribute("data-nr-cat") || "").toLowerCase();
      var show = current === "all" || itemCat === current;
      el.hidden = !show;
      if (show) filteredNews += 1;
    });
    /* Empty only when a non-ALL category is active and filteredNews.length === 0 */
    if (empty) {
      var showEmpty = current !== "all" && filteredNews === 0;
      empty.hidden = !showEmpty;
      if (showEmpty) {
        empty.removeAttribute("hidden");
        empty.setAttribute("aria-hidden", "false");
      } else {
        empty.setAttribute("hidden", "");
        empty.setAttribute("aria-hidden", "true");
      }
    }
    Array.prototype.forEach.call(tabs, function (btn) {
      var on = btn.getAttribute("data-nr-filter") === current;
      btn.classList.toggle("is-active", on);
      if (on) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
  }

  current = fromUrl();
  apply(current);

  Array.prototype.forEach.call(tabs, function (btn) {
    btn.addEventListener("click", function () {
      var next = btn.getAttribute("data-nr-filter") || "all";
      if (next === current) return;
      setUrl(next, false);
      apply(next);
    });
  });

  window.addEventListener("popstate", function () {
    apply(fromUrl());
  });
})();
