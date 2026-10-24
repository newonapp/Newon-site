/**
 * Business service detail — FAQ + analytics + scroll reveal + reduced motion.
 */
(function () {
  "use strict";

  var root = document.querySelector(".bs-page");
  if (!root) return;

  var service = root.getAttribute("data-bs-service") || "";
  var analyticsId = root.getAttribute("data-bs-analytics") || service;

  function trackServiceView() {
    if (window.newonTrack && window.newonAnalyticsEvents) {
      window.newonTrack(window.newonAnalyticsEvents.BUSINESS_SERVICE_VIEW || "business_service_view", {
        service_id: analyticsId,
        service: analyticsId,
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackServiceView);
  } else {
    trackServiceView();
  }

  document.querySelectorAll("[data-bs-cta]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (!window.newonTrack || !window.newonAnalyticsEvents) return;
      // data-analytics is handled by analytics.js (includes store_buy_click metadata).
      if (el.getAttribute("data-analytics")) return;
      window.newonTrack(window.newonAnalyticsEvents.BUSINESS_SERVICE_CTA_CLICK || "cta_click", {
        service_id: analyticsId,
        service: analyticsId,
        cta_id: el.getAttribute("data-bs-cta") || "primary",
        cta_location: el.getAttribute("data-bs-cta") || "service",
      });
    });
  });

  document.querySelectorAll(".bs-faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".bs-faq-item");
      if (!item) return;
      var open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    root.classList.add("bs-reduced-motion");
  }

  var revealNodes = document.querySelectorAll("[data-bs-reveal]");
  revealNodes.forEach(function (el) {
    el.classList.add("bs-reveal");
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach(function (el) {
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
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  revealNodes.forEach(function (el) {
    io.observe(el);
  });
})();
