(function () {
  var film = document.querySelector("[data-st-film]");
  if (!film) return;

  var video = film.querySelector(".st-film__video");
  if (!video) {
    requestAnimationFrame(function () {
      film.classList.add("is-ready");
    });
    return;
  }

  function arm() {
    var source = video.querySelector("source");
    if (source && source.src && video.getAttribute("src") !== source.src) {
      video.src = source.src;
    }
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("preload", "auto");
    video.removeAttribute("controls");
  }

  function tryPlay() {
    arm();
    film.classList.remove("is-static");
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
  video.addEventListener("playing", function () {
    film.classList.remove("is-static");
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") tryPlay();
  });
  window.addEventListener("pageshow", tryPlay);
  window.addEventListener("focus", tryPlay);
  document.addEventListener("pointerdown", tryPlay, { passive: true });
  document.addEventListener("touchstart", tryPlay, { passive: true });
  setInterval(function () {
    if (document.visibilityState === "visible" && (video.paused || video.ended)) {
      tryPlay();
    }
  }, 800);

  tryPlay();
  requestAnimationFrame(function () {
    film.classList.add("is-ready");
    tryPlay();
  });
})();
