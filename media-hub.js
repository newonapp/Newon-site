/**
 * Media Hub — click-to-play YouTube embeds + series → filter bridge.
 */
(function () {
  function activateInline(host) {
    if (!host || host.classList.contains("is-playing")) return;
    var embed = host.getAttribute("data-mh-embed");
    var title = host.getAttribute("data-mh-title") || "Newon video";
    if (!embed) return;

    var media = host.classList.contains("mh-card")
      ? host.querySelector(".mh-card__media")
      : host;
    if (!media) return;

    var sep = embed.indexOf("?") >= 0 ? "&" : "?";
    var src = embed + sep + "autoplay=1&rel=0";
    var iframe = document.createElement("iframe");
    iframe.className = "mh-player-frame";
    iframe.src = src;
    iframe.title = title;
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

    media.appendChild(iframe);
    media.classList.add("is-playing");
    host.classList.add("is-playing");
  }

  /** Keep desktop 3-column grids as full rows (6 / 9 / …). */
  function fillDesktopRows() {
    var desktop =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(min-width: 961px)").matches;
    document.querySelectorAll("[data-mh-fill-rows]").forEach(function (grid) {
      var cols = Number(grid.getAttribute("data-mh-fill-rows")) || 3;
      var kids = Array.prototype.slice.call(grid.children);
      kids.forEach(function (el) {
        el.classList.remove("is-row-trim");
      });
      if (!desktop || cols < 2) return;
      var visible = kids.filter(function (el) {
        return (
          !el.hidden &&
          !el.classList.contains("is-filtered-out") &&
          el.getAttribute("aria-hidden") !== "true"
        );
      });
      if (visible.length < cols) return;
      var keep = Math.floor(visible.length / cols) * cols;
      visible.forEach(function (el, i) {
        if (i >= keep) el.classList.add("is-row-trim");
      });
    });
  }

  var fillTimer = null;
  function scheduleFill() {
    if (fillTimer) window.clearTimeout(fillTimer);
    fillTimer = window.setTimeout(fillDesktopRows, 40);
  }

  document.addEventListener(
    "click",
    function (ev) {
      var playBtn = ev.target.closest("[data-mh-play]");
      var host = ev.target.closest("[data-mh-inline]");
      if (playBtn) {
        ev.preventDefault();
        host = playBtn.closest("[data-mh-inline]");
        activateInline(host);
        return;
      }
      if (host && !ev.target.closest("a.mh-link")) {
        var media = host.querySelector(".mh-card__media") || host;
        if (media && !media.classList.contains("is-playing")) {
          if (ev.target.closest(".mh-thumb") || ev.target === host) {
            ev.preventDefault();
            activateInline(host);
          }
        }
      }

      var seriesBtn = ev.target.closest("[data-mh-series-filter]");
      if (seriesBtn) {
        var key = seriesBtn.getAttribute("data-mh-series-filter") || "all";
        var filterBtn = document.querySelector(
          '[data-rs-filters] [data-rs-filter="' + key + '"]'
        );
        if (filterBtn) {
          filterBtn.click();
          var latest = document.getElementById("mh-latest-title");
          if (latest) latest.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      if (ev.target.closest("[data-rs-filter]")) scheduleFill();
    },
    false
  );

  document.addEventListener(
    "keydown",
    function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var host = ev.target.closest("[data-mh-inline]");
      if (!host || ev.target.closest("a")) return;
      if (ev.target.matches("[data-mh-play]") || ev.target === host) {
        ev.preventDefault();
        activateInline(host);
      }
    },
    false
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fillDesktopRows);
  } else {
    fillDesktopRows();
  }
  window.addEventListener("resize", scheduleFill);
  /* Filters may apply from URL on boot after this script — re-run shortly. */
  window.setTimeout(fillDesktopRows, 0);
  window.setTimeout(fillDesktopRows, 120);
})();
