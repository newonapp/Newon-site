(() => {
  const hero = document.querySelector("#home.site-shell #top.hero--film");
  if (!hero) return;

  const video = hero.querySelector(".nhv-video");
  if (!video) {
    requestAnimationFrame(() => hero.classList.add("is-ready"));
    return;
  }

  const arm = () => {
    const source = video.querySelector("source");
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
  };

  const tryPlay = () => {
    arm();
    hero.classList.remove("is-static");
    try {
      if (video.ended) video.currentTime = 0;
    } catch (err) {
      /* ignore */
    }
    const play = video.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  };

  const restart = () => {
    try {
      video.currentTime = 0;
    } catch (err) {
      /* ignore */
    }
    tryPlay();
  };

  arm();
  video.addEventListener("ended", restart);
  video.addEventListener("pause", () => {
    if (document.visibilityState === "visible") tryPlay();
  });
  video.addEventListener("canplay", tryPlay);
  video.addEventListener("canplaythrough", tryPlay);
  video.addEventListener("loadeddata", tryPlay);
  video.addEventListener("playing", () => hero.classList.remove("is-static"));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") tryPlay();
  });
  window.addEventListener("pageshow", tryPlay);
  window.addEventListener("focus", tryPlay);
  document.addEventListener("pointerdown", tryPlay, { passive: true });
  document.addEventListener("touchstart", tryPlay, { passive: true });
  setInterval(() => {
    if (document.visibilityState === "visible" && (video.paused || video.ended)) {
      tryPlay();
    }
  }, 800);

  tryPlay();
  requestAnimationFrame(() => {
    hero.classList.add("is-ready");
    tryPlay();
  });
})();
