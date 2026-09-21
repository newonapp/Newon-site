(function () {
  var root = document.getElementById("lifestage-detail") || document.getElementById("story-lifestage");
  if (!root) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function activate(group, key) {
    root.querySelectorAll('[data-nls-group="' + group + '"]').forEach(function (el) {
      var on = el.getAttribute("data-nls-key") === key;
      if (el.hasAttribute("data-nls-tab")) {
        el.classList.toggle("is-active", on);
        if (el.getAttribute("role") === "tab") {
          el.setAttribute("aria-selected", on ? "true" : "false");
          el.tabIndex = on ? 0 : -1;
        } else {
          el.setAttribute("aria-pressed", on ? "true" : "false");
        }
      }
      if (el.hasAttribute("data-nls-panel")) {
        el.hidden = !on;
        el.classList.toggle("is-active", on);
      }
    });
  }

  function moveTab(current, dir) {
    var group = current.getAttribute("data-nls-group");
    var tabs = Array.prototype.slice.call(
      root.querySelectorAll('[data-nls-tab][data-nls-group="' + group + '"][role="tab"]')
    );
    if (!tabs.length) return;
    var i = tabs.indexOf(current);
    var next = tabs[(i + dir + tabs.length) % tabs.length];
    next.focus();
    activate(group, next.getAttribute("data-nls-key"));
  }

  root.addEventListener("click", function (e) {
    var tab = e.target.closest("[data-nls-tab]");
    if (tab && root.contains(tab)) {
      activate(tab.getAttribute("data-nls-group"), tab.getAttribute("data-nls-key"));
      if (tab.getAttribute("data-nls-group") === "plan") updateProgress();
      return;
    }

    var learn = e.target.closest("[data-nls-learn]");
    if (learn && root.contains(learn)) {
      var step = learn.closest(".nls-learn__step");
      var list = learn.closest(".nls-learn__list");
      if (step && list) {
        list.querySelectorAll(".nls-learn__step").forEach(function (s) {
          var open = s === step ? !s.classList.contains("is-open") : false;
          s.classList.toggle("is-open", open);
          var btn = s.querySelector("[data-nls-learn]");
          if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
        if (!list.querySelector(".nls-learn__step.is-open")) {
          step.classList.add("is-open");
          learn.setAttribute("aria-expanded", "true");
        }
      }
      return;
    }

    var scroll = e.target.closest("[data-nls-scroll]");
    if (scroll && root.contains(scroll)) {
      var href = scroll.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", href);
    }
  });

  root.addEventListener("keydown", function (e) {
    var tab = e.target.closest("[data-nls-tab]");
    if (!tab || !root.contains(tab) || tab.getAttribute("role") !== "tab") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      moveTab(tab, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      moveTab(tab, -1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      var group = tab.getAttribute("data-nls-group");
      var tabs = Array.prototype.slice.call(
        root.querySelectorAll('[data-nls-tab][data-nls-group="' + group + '"][role="tab"]')
      );
      var pick = e.key === "Home" ? tabs[0] : tabs[tabs.length - 1];
      if (pick) {
        pick.focus();
        activate(group, pick.getAttribute("data-nls-key"));
      }
    }
  });

  function updateProgress() {
    var pane = root.querySelector('[data-nls-group="plan"][data-nls-panel]:not([hidden])') || root;
    var boxes = pane.querySelectorAll("[data-nls-check]");
    if (!boxes.length) return;
    var done = 0;
    boxes.forEach(function (box) {
      if (box.checked) done += 1;
    });
    var total = boxes.length;
    var label = pane.querySelector("[data-nls-progress] strong");
    if (label) label.textContent = done + " / " + total;
    var bar = pane.querySelector("[data-nls-bar]");
    if (bar) bar.style.width = Math.round((done / total) * 100) + "%";
  }

  root.addEventListener("change", function (e) {
    if (e.target && e.target.hasAttribute("data-nls-check")) updateProgress();
  });
  updateProgress();

  function goHash() {
    var id = (location.hash || "").replace(/^#/, "");
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    if (id === "story-lifestage" || root.contains(el)) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }
  if (document.readyState === "complete") goHash();
  else window.addEventListener("load", goHash);
})();
