(function () {
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
      if (!video.paused && !video.ended) return;
      try {
        if (video.ended) video.currentTime = 0;
      } catch (err) {
        /* ignore */
      }
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
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") tryPlay();
    });
    window.addEventListener("pageshow", tryPlay);
    window.addEventListener("focus", tryPlay);
    setInterval(function () {
      if (document.visibilityState === "visible" && (video.paused || video.ended)) {
        tryPlay();
      }
    }, 700);
    tryPlay();
    requestAnimationFrame(function () {
      host.classList.add("is-ready");
      tryPlay();
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
    ];
    pairs.forEach(function (pair) {
      var host = pair[0];
      if (!host) return;
      keepFilm(host, host.querySelector(pair[1]));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
