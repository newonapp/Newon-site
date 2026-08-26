/**
 * AI hub — reveal, process pulse, product nav, business use-case.
 */
(function () {
  "use strict";

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initReveal(root) {
    var nodes = Array.prototype.slice.call(root.querySelectorAll("[data-ai-reveal]"));
    if (!nodes.length) return;
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
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
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );
    nodes.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add("is-in");
      else io.observe(el);
    });
    window.setTimeout(function () {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
    }, 1400);
  }

  function initProcess(root) {
    var process = root.querySelector("[data-ai-process]");
    if (!process || reduceMotion()) return;
    var steps = Array.prototype.slice.call(process.querySelectorAll("[data-process-step]"));
    if (!steps.length) return;
    var i = 0;
    steps[0].classList.add("is-pulse");
    window.setInterval(function () {
      steps.forEach(function (el) {
        el.classList.remove("is-pulse");
      });
      steps[i % steps.length].classList.add("is-pulse");
      i += 1;
    }, 1600);
  }

  var BIZ_CASES = {
    automation: [
      ["Input", "Customer inquiry"],
      ["AI", "Classify + Analyze"],
      ["Action", "Generate response"],
      ["Result", "Support workflow"]
    ],
    workflow: [
      ["Input", "Existing tools"],
      ["AI", "Connect + Orchestrate"],
      ["Action", "Run workflow"],
      ["Result", "Less manual work"]
    ],
    knowledge: [
      ["Input", "Docs & policies"],
      ["AI", "Retrieve + Ground"],
      ["Action", "Answer with sources"],
      ["Result", "Consistent knowledge"]
    ],
    action: [
      ["Input", "Analysis result"],
      ["AI", "Prioritize"],
      ["Action", "Create next task"],
      ["Result", "Work moves forward"]
    ]
  };

  function renderCase(container, key) {
    var rows = BIZ_CASES[key] || BIZ_CASES.automation;
    container.innerHTML = rows
      .map(function (r) {
        return "<div><span>" + r[0] + "</span><strong>" + r[1] + "</strong></div>";
      })
      .join("");
  }

  function initBiz(root) {
    var pipe = root.querySelector("[data-ai-biz-pipe]");
    var body = root.querySelector("[data-case-body]");
    if (!pipe || !body) return;
    var steps = Array.prototype.slice.call(pipe.querySelectorAll("[data-biz-step]"));
    function activate(step) {
      steps.forEach(function (el) {
        el.classList.toggle("is-active", el === step);
      });
      renderCase(body, step.getAttribute("data-case") || "automation");
    }
    if (steps[0]) activate(steps[0]);
    steps.forEach(function (step) {
      step.addEventListener("mouseenter", function () {
        activate(step);
      });
      step.addEventListener("focus", function () {
        activate(step);
      });
      step.setAttribute("tabindex", "0");
    });
  }

  function initNav(root) {
    var links = Array.prototype.slice.call(root.querySelectorAll("[data-ai-nav]"));
    var sections = Array.prototype.slice.call(root.querySelectorAll("[data-ai-section]"));
    if (!links.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("data-ai-nav") === id);
      });
    }

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", href);
        setActive(a.getAttribute("data-ai-nav"));
      });
    });

    if (!sections.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          setActive(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
    );
    sections.forEach(function (sec) {
      io.observe(sec);
    });
  }

  function initCaps(root) {
    var section = root.querySelector("[data-ai-caps]");
    if (!section) return;
    var rows = Array.prototype.slice.call(section.querySelectorAll("[data-cap-row]"));
    if (!rows.length) return;

    function activate(row) {
      rows.forEach(function (r) {
        var on = r === row;
        r.classList.toggle("is-active", on);
        var btn = r.querySelector("[data-cap-trigger]");
        if (btn) btn.setAttribute("aria-expanded", on ? "true" : "false");
      });
    }

    rows.forEach(function (row) {
      var btn = row.querySelector("[data-cap-trigger]");
      if (!btn) return;
      btn.addEventListener("click", function () {
        activate(row);
      });
      btn.addEventListener("mouseenter", function () {
        if (window.matchMedia("(hover: hover)").matches) activate(row);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-ai-page]").forEach(function (root) {
      initReveal(root);
      initProcess(root);
      initBiz(root);
      initNav(root);
      initCaps(root);
    });
  });
})();
