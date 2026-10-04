/**
 * Homepage company-story motion. Does not touch hero or existing .hs-story sections.
 * Never captures or freezes scroll.
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-hs-home]");
  if (!root) return;

  var meaning = root.querySelector("[data-hc-meaning]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var simple = reduce || window.matchMedia("(max-width: 860px)").matches;

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function ease(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function setProgress(el, p) {
    el.style.setProperty("--hc-in", ease((p - 0.02) / 0.2).toFixed(3));
    el.style.setProperty("--hc-plus", ease((p - 0.1) / 0.16).toFixed(3));
    el.style.setProperty("--hc-def", ease((p - 0.22) / 0.18).toFixed(3));
    el.style.setProperty("--hc-merge", ease((p - 0.42) / 0.28).toFixed(3));
    el.style.setProperty("--hc-end", ease((p - 0.66) / 0.2).toFixed(3));
  }

  function showAll(el) {
    el.style.setProperty("--hc-in", "1");
    el.style.setProperty("--hc-plus", "1");
    el.style.setProperty("--hc-def", "1");
    el.style.setProperty("--hc-merge", "1");
    el.style.setProperty("--hc-end", "1");
  }

  function progressOf(el) {
    var vh = window.innerHeight || 1;
    var rect = el.getBoundingClientRect();
    var start = vh * 0.82;
    var end = -(Math.max(el.offsetHeight - vh, vh * 0.35));
    return clamp((start - rect.top) / (start - end), 0, 1);
  }

  if (meaning) {
    if (reduce) {
      showAll(meaning);
    } else if (simple) {
      meaning.classList.add("is-simple");
      meaning.style.setProperty("--hc-in", "0");
      meaning.style.setProperty("--hc-plus", "0");
      meaning.style.setProperty("--hc-def", "0");
      meaning.style.setProperty("--hc-merge", "0");
      meaning.style.setProperty("--hc-end", "0");
      if ("IntersectionObserver" in window) {
        function playSimple() {
          meaning.style.setProperty("--hc-in", "1");
          meaning.style.setProperty("--hc-plus", "1");
          window.setTimeout(function () {
            meaning.style.setProperty("--hc-def", "1");
          }, 160);
          window.setTimeout(function () {
            meaning.style.setProperty("--hc-merge", "1");
          }, 420);
          window.setTimeout(function () {
            meaning.style.setProperty("--hc-end", "1");
          }, 700);
        }
        var mio = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              playSimple();
              mio.unobserve(entry.target);
            });
          },
          { threshold: 0.28, rootMargin: "0px 0px -8% 0px" }
        );
        mio.observe(meaning);
      } else {
        showAll(meaning);
      }
    } else {
      meaning.style.setProperty("--hc-in", "0");
      meaning.style.setProperty("--hc-plus", "0");
      meaning.style.setProperty("--hc-def", "0");
      meaning.style.setProperty("--hc-merge", "0");
      meaning.style.setProperty("--hc-end", "0");
      var ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          setProgress(meaning, progressOf(meaning));
          ticking = false;
        });
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();
    }
  }

  if (simple) {
    var sheet = document.createElement("style");
    sheet.textContent =
      ".hs-home .hc-meaning.is-simple .hc-formula__new," +
      ".hs-home .hc-meaning.is-simple .hc-formula__on," +
      ".hs-home .hc-meaning.is-simple .hc-formula__plus," +
      ".hs-home .hc-meaning.is-simple .hc-formula," +
      ".hs-home .hc-meaning.is-simple .hc-wordmark," +
      ".hs-home .hc-meaning.is-simple .hc-meaning__slogan," +
      ".hs-home .hc-meaning.is-simple .hc-meaning__intro," +
      ".hs-home .hc-meaning.is-simple .hc-meaning__defs," +
      ".hs-home .hc-meaning.is-simple .hc-meaning__eq," +
      ".hs-home .hc-meaning.is-simple .hc-meaning__close{" +
      "transition:opacity .7s ease,transform .7s ease}";
    document.head.appendChild(sheet);
  }
})();
