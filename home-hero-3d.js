(() => {
  const hero = document.querySelector("#home.site-shell #top.hero--film");
  if (!hero) return;

  const video = hero.querySelector(".nhv-video");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const markReady = () => {
    hero.classList.add("is-ready");
  };

  const freeze = () => {
    hero.classList.add("is-static");
    if (video) {
      video.pause();
      video.removeAttribute("autoplay");
    }
  };

  const tryPlay = () => {
    if (!video || reduced || hero.classList.contains("is-static")) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => freeze());
    }
  };

  if (reduced) {
    freeze();
    markReady();
    return;
  }

  if (video) {
    video.addEventListener("error", freeze, { once: true });
    video.addEventListener("stalled", () => {
      if (video.readyState < 2) freeze();
    });
    video.addEventListener(
      "canplay",
      () => {
        hero.classList.remove("is-static");
        tryPlay();
      },
      { once: true }
    );
  }

  if ("IntersectionObserver" in window && video) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) tryPlay();
          else if (!video.paused) video.pause();
        });
      },
      { threshold: 0.18 }
    );
    io.observe(hero);
  } else {
    tryPlay();
  }

  requestAnimationFrame(markReady);
})();
