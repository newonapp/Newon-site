(function () {
  var film = document.querySelector("[data-st-film]");
  if (!film) return;

  var video = film.querySelector(".st-film__video");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function freezeFilm() {
    film.classList.add("is-static");
    if (video) {
      video.pause();
      video.removeAttribute("autoplay");
    }
  }

  function tryPlay() {
    if (!video || reduce || film.classList.contains("is-static")) return;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.removeAttribute("controls");
    var play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(function () {
        /* Keep the solid fallback instead of swapping in another image. */
      });
    }
  }

  if (reduce) {
    freezeFilm();
  } else if (video) {
    video.addEventListener("error", freezeFilm, { once: true });
    video.addEventListener(
      "canplay",
      function () {
        film.classList.remove("is-static");
        tryPlay();
      },
      { once: true }
    );
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) tryPlay();
            else if (entry.intersectionRatio === 0 && video && !video.paused) video.pause();
          });
        },
        { threshold: [0, 0.18] }
      );
      io.observe(film);
    } else {
      tryPlay();
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") tryPlay();
    else if (video && !video.paused) video.pause();
  });

  requestAnimationFrame(function () {
    film.classList.add("is-ready");
  });
})();
