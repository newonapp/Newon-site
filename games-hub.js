/**
 * Newon Games hub — surveillance UI motion (restrained).
 */
(function () {
  "use strict";

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initReveal(root) {
    var nodes = Array.prototype.slice.call(root.querySelectorAll("[data-games-reveal]"));
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    nodes.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) el.classList.add("is-in");
      else io.observe(el);
    });
    window.setTimeout(function () {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
    }, 1800);
  }

  function initMeters(root) {
    var panel = root.querySelector("[data-games-meters]");
    if (!panel) return;
    var bars = Array.prototype.slice.call(panel.querySelectorAll(".games-meter__track i"));
    function run() {
      panel.classList.add("is-ready");
      bars.forEach(function (bar) {
        bar.classList.add("is-animate");
      });
    }
    if (reduceMotion()) {
      run();
      return;
    }
    if (!("IntersectionObserver" in window)) {
      run();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run();
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.25 }
    );
    io.observe(panel);
  }

  function initParallax(root) {
    var layer = root.querySelector("[data-games-parallax]");
    if (!layer || reduceMotion()) return;
    var grid = layer.querySelector(".games-hero__grid");
    if (!grid) return;
    var raf = 0;
    var tx = 0;
    var ty = 0;
    function onMove(e) {
      var w = window.innerWidth || 1;
      var h = window.innerHeight || 1;
      tx = ((e.clientX / w) - 0.5) * 4;
      ty = ((e.clientY / h) - 0.5) * 3;
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        grid.style.setProperty("--px", tx.toFixed(2) + "px");
        grid.style.setProperty("--py", ty.toFixed(2) + "px");
        raf = 0;
      });
    }
    window.addEventListener("mousemove", onMove, { passive: true });
  }

  function initDemo(root) {
    var demo = root.querySelector("[data-games-demo]");
    if (!demo) return;
    var valEl = demo.querySelector("[data-demo-det]");
    var bar = demo.querySelector("[data-demo-bar]");
    var analysis = demo.querySelector("[data-demo-analysis]");
    var choices = Array.prototype.slice.call(demo.querySelectorAll("[data-demo-choice]"));
    if (!choices.length) return;

    var current = 32;

    function setDet(n, label) {
      current = n;
      if (valEl) {
        if (reduceMotion()) {
          valEl.textContent = n + "%";
        } else {
          var from = parseInt(String(valEl.textContent).replace(/\D/g, ""), 10) || current;
          var start = performance.now();
          var dur = 420;
          function tick(now) {
            var t = Math.min(1, (now - start) / dur);
            var eased = 1 - Math.pow(1 - t, 3);
            var v = Math.round(from + (n - from) * eased);
            valEl.textContent = v + "%";
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      }
      if (bar) bar.style.setProperty("--w", n + "%");
      if (analysis) analysis.textContent = "SYSTEM ANALYSIS — " + label;
    }

    choices.forEach(function (btn) {
      btn.addEventListener("mouseenter", function () {
        if (btn.disabled) return;
        var n = parseInt(btn.getAttribute("data-det") || "47", 10);
        var label = btn.getAttribute("data-analysis") || "PENDING";
        if (valEl) valEl.textContent = n + "%";
        if (bar) bar.style.setProperty("--w", n + "%");
        if (analysis) analysis.textContent = "SYSTEM ANALYSIS — " + label;
      });
      btn.addEventListener("mouseleave", function () {
        if (btn.classList.contains("is-selected")) return;
        if (valEl) valEl.textContent = current + "%";
        if (bar) bar.style.setProperty("--w", current + "%");
        if (analysis && !demo.querySelector(".games-demo__choice.is-selected")) {
          analysis.textContent = "SYSTEM ANALYSIS — AWAITING INPUT";
        }
      });
      btn.addEventListener("click", function () {
        var n = parseInt(btn.getAttribute("data-det") || "47", 10);
        var label = btn.getAttribute("data-analysis") || "PENDING";
        choices.forEach(function (b) {
          b.classList.toggle("is-selected", b === btn);
        });
        setDet(n, label);
      });
    });
  }

  function initMemory(root) {
    var section = root.querySelector("[data-games-memory]");
    if (!section) return;
    var rows = Array.prototype.slice.call(section.querySelectorAll("[data-mem-row]"));
    if (!rows.length) return;

    function show() {
      if (reduceMotion()) {
        rows.forEach(function (r) {
          r.classList.add("is-show");
        });
        return;
      }
      rows.forEach(function (row, i) {
        window.setTimeout(function () {
          row.classList.add("is-show");
        }, 120 + i * 160);
      });
    }

    if (!("IntersectionObserver" in window)) {
      show();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          show();
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    io.observe(section);
  }

  function initRemember(root) {
    var section = root.querySelector("[data-games-remember]");
    if (!section) return;
    var lines = Array.prototype.slice.call(section.querySelectorAll("[data-remember-line]"));
    if (!lines.length) return;

    function light() {
      if (reduceMotion()) {
        lines.forEach(function (l) {
          l.classList.add("is-lit");
        });
        return;
      }
      lines.forEach(function (line, i) {
        window.setTimeout(function () {
          line.classList.add("is-lit");
        }, 180 + i * 420);
      });
    }

    if (!("IntersectionObserver" in window)) {
      light();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          light();
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    io.observe(section);
  }

  function initEndings(root) {
    root.querySelectorAll("[data-ending]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        root.querySelectorAll("[data-ending]").forEach(function (b) {
          b.classList.toggle("is-class", b === btn);
        });
      });
    });
  }

  function initSmoothAnchors(root) {
    root.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", id);
      });
    });
  }

  function initFinal(root) {
    var section = root.querySelector("[data-games-final]");
    if (!section) return;
    var status = section.querySelector("[data-final-status]");
    if (!status || reduceMotion()) return;
    var msgs = ["INITIALIZING…", "SCANNING…", "SUBJECT DETECTED", "AWAITING INPUT"];
    var i = 0;
    window.setInterval(function () {
      i = (i + 1) % msgs.length;
      status.textContent = msgs[i];
    }, 1800);
  }

  function boot() {
    var root = document.querySelector("[data-games-page]");
    if (!root) return;
    initReveal(root);
    initMeters(root);
    initParallax(root);
    initDemo(root);
    initMemory(root);
    initRemember(root);
    initEndings(root);
    initFinal(root);
    initSmoothAnchors(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
