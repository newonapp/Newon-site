(function () {
  var style = document.createElement("style");
  style.textContent = "video.nhv-video,video[class*='film__video'],video.games-hero__video,video.ir-hero__film,.np-film video,.ir-marquee__film video,.ir-lane video{pointer-events:none}video.nhv-video::-webkit-media-controls,video.nhv-video::-webkit-media-controls-start-playback-button,video[class*='film__video']::-webkit-media-controls,video[class*='film__video']::-webkit-media-controls-start-playback-button,video.games-hero__video::-webkit-media-controls-start-playback-button,video.ir-hero__film::-webkit-media-controls-start-playback-button,.np-film video::-webkit-media-controls-start-playback-button,.ir-marquee__film video::-webkit-media-controls-start-playback-button,.ir-lane video::-webkit-media-controls-start-playback-button{display:none!important;-webkit-appearance:none;opacity:0;pointer-events:none}";
  document.head.appendChild(style);

  function keepFilm(host, video) {
    if (!host) return;
    if (!video) {
      requestAnimationFrame(function () {
        host.classList.add("is-ready");
      });
      return;
    }
    if (video.getAttribute("data-film-keep") === "1") return;
    video.setAttribute("data-film-keep", "1");

    function arm() {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.loop = true;
      video.autoplay = true;
      video.controls = false;
      video.preload = "auto";
      try {
        video.playsInline = true;
      } catch (err) {
        /* ignore */
      }
      try {
        video.disablePictureInPicture = true;
      } catch (err) {
        /* ignore */
      }
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("loop", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.removeAttribute("controls");
      video.removeAttribute("poster");
    }

    function tryPlay() {
      arm();
      host.classList.remove("is-static");
      if (video.readyState < 1) {
        try {
          video.load();
        } catch (err) {
          /* ignore */
        }
      }
      try {
        if (video.ended || (video.duration && video.currentTime >= video.duration - 0.05)) {
          video.currentTime = 0;
        }
      } catch (err) {
        /* ignore */
      }
      if (!video.paused && !video.ended) return;
      var play = video.play();
      if (play && typeof play.catch === "function") play.catch(function () {});
    }

    function restart() {
      try {
        video.currentTime = 0;
      } catch (err) {
        /* ignore */
      }
      tryPlay();
    }

    arm();
    video.addEventListener("ended", restart);
    video.addEventListener("pause", function () {
      if (document.visibilityState === "visible") tryPlay();
    });
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("canplaythrough", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("loadedmetadata", tryPlay);
    video.addEventListener("playing", function () {
      host.classList.remove("is-static");
    });
    video.addEventListener("timeupdate", function () {
      if (!video.duration) return;
      if (video.currentTime >= video.duration - 0.12) {
        try {
          video.currentTime = 0.05;
        } catch (err) {
          /* ignore */
        }
        if (video.paused) tryPlay();
      }
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") tryPlay();
    });
    window.addEventListener("pageshow", tryPlay);
    window.addEventListener("focus", tryPlay);
    ["pointerdown", "touchstart", "click", "keydown"].forEach(function (ev) {
      document.addEventListener(ev, tryPlay, { capture: true, passive: true });
    });
    setInterval(function () {
      if (document.visibilityState === "visible" && (video.paused || video.ended)) {
        tryPlay();
      }
    }, 400);
    tryPlay();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!host.hasAttribute("data-lockup-reveal")) {
          host.classList.add("is-ready");
        }
        tryPlay();
      });
    });
  }

  function boot() {
    var pairs = [
      [document.querySelector("#home.site-shell #top.hero--film"), ".nhv-video"],
      [document.querySelector("[data-bz-film]"), ".bz-film__video"],
      [document.querySelector("[data-st-film]"), ".st-film__video"],
      [document.querySelector("[data-eco-film]"), ".eco-film__video"],
      [document.querySelector("[data-nog-film]"), ".nog-film__video"],
      [document.querySelector("[data-nls-film]"), ".nls-film__video"],
      [document.querySelector("[data-nai-film]"), ".nai-film__video"],
      [document.querySelector("[data-games-film]"), ".games-hero__video"],
      [document.querySelector("[data-apps-film]"), ".apps-film__video"],
    ];
    pairs.forEach(function (pair) {
      var host = pair[0];
      if (!host) return;
      keepFilm(host, host.querySelector(pair[1]));
    });
    document.querySelectorAll("video.nhv-video, video[class*='film__video'], video.games-hero__video").forEach(function (video) {
      var host =
        video.closest("[data-bz-film], [data-st-film], [data-eco-film], [data-nog-film], [data-nls-film], [data-nai-film], [data-games-film], [data-apps-film], .hero--film") ||
        video.parentElement;
      keepFilm(host, video);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
