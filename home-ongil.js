(function () {
  var root = document.getElementById("ongil-detail");
  if (!root) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function syncEmpty(group) {
    var empty = root.querySelector('[data-nls-empty="' + group + '"]');
    if (!empty) return;
    var any = root.querySelector('[data-nls-panel][data-nls-group="' + group + '"]:not([hidden])');
    empty.hidden = !!any;
  }

  function showJourney() {
    var caseBtn = root.querySelector('[data-nls-tab][data-nls-group="jcase"].is-active');
    var stepBtn = root.querySelector('[data-nls-tab][data-nls-group="jstep"].is-active');
    var title = root.querySelector("[data-nog-jtitle]");
    var text = root.querySelector("[data-nog-jtext]");
    if (!caseBtn) return;
    var bodies = [];
    try {
      bodies = JSON.parse(caseBtn.getAttribute("data-nls-bodies") || "[]");
    } catch (err) {
      bodies = [];
    }
    var idx = stepBtn ? Number(stepBtn.getAttribute("data-nls-idx") || 0) : 0;
    if (title) title.textContent = caseBtn.getAttribute("data-nls-name") || "";
    if (text) text.textContent = bodies[idx] || "";
  }

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
    syncEmpty(group);
    if (group === "jcase" || group === "jstep") showJourney();
  }

  function moveTab(current, dir) {
    var group = current.getAttribute("data-nls-group");
    var tabs = Array.prototype.slice.call(
      root.querySelectorAll('[data-nls-tab][data-nls-group="' + group + '"][role="tab"]:not([hidden])')
    );
    if (!tabs.length) return;
    var i = tabs.indexOf(current);
    var next = tabs[(i + dir + tabs.length) % tabs.length];
    next.focus();
    activate(group, next.getAttribute("data-nls-key"));
  }

  function setDiscoverAll(showAll) {
    var btn = root.querySelector("[data-nog-more]");
    root.querySelectorAll('[data-nls-tab][data-nls-group="disc"]').forEach(function (el) {
      if (showAll) {
        el.hidden = false;
      } else {
        el.hidden = el.getAttribute("data-nls-featured") !== "1";
        el.classList.remove("is-active");
        el.setAttribute("aria-selected", "false");
        el.tabIndex = -1;
      }
    });
    if (!showAll) {
      root.querySelectorAll('[data-nls-panel][data-nls-group="disc"]').forEach(function (el) {
        el.hidden = true;
        el.classList.remove("is-active");
      });
      syncEmpty("disc");
    }
    if (btn) {
      btn.setAttribute("data-open", showAll ? "1" : "0");
      btn.textContent = showAll ? btn.getAttribute("data-label-less") : btn.getAttribute("data-label-all");
    }
  }

  root.addEventListener("click", function (e) {
    var more = e.target.closest("[data-nog-more]");
    if (more && root.contains(more)) {
      setDiscoverAll(more.getAttribute("data-open") !== "1");
      return;
    }

    var tab = e.target.closest("[data-nls-tab]");
    if (tab && root.contains(tab)) {
      activate(tab.getAttribute("data-nls-group"), tab.getAttribute("data-nls-key"));
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
        root.querySelectorAll('[data-nls-tab][data-nls-group="' + group + '"][role="tab"]:not([hidden])')
      );
      var pick = e.key === "Home" ? tabs[0] : tabs[tabs.length - 1];
      if (pick) {
        pick.focus();
        activate(group, pick.getAttribute("data-nls-key"));
      }
    }
  });

  ["pillar", "disc", "hobby", "ffeat", "care", "know", "biz"].forEach(syncEmpty);
  showJourney();
  setDiscoverAll(false);

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
