(function () {
  var style = document.createElement("style");
  style.textContent =
    "video.nhv-video,video[class*='film__video'],video[class*='film__bg'],video.og-film__bg,video.og-hero__video,video.lv-lum__bg,video.games-hero__video,video.ir-hero__film,.np-film video,.ir-marquee__film video,.ir-lane video,.livon-hero__bg video{pointer-events:none}" +
    "video.nhv-video::-webkit-media-controls,video.nhv-video::-webkit-media-controls-start-playback-button," +
    "video[class*='film__video']::-webkit-media-controls,video[class*='film__video']::-webkit-media-controls-start-playback-button," +
    "video[class*='film__bg']::-webkit-media-controls-start-playback-button," +
    "video.og-film__bg::-webkit-media-controls-start-playback-button,video.og-hero__video::-webkit-media-controls-start-playback-button," +
    "video.lv-lum__bg::-webkit-media-controls-start-playback-button," +
    "video.games-hero__video::-webkit-media-controls-start-playback-button,video.ir-hero__film::-webkit-media-controls-start-playback-button," +
    ".np-film video::-webkit-media-controls-start-playback-button,.ir-marquee__film video::-webkit-media-controls-start-playback-button," +
    ".ir-lane video::-webkit-media-controls-start-playback-button,.livon-hero__bg video::-webkit-media-controls-start-playback-button" +
    "{display:none!important;-webkit-appearance:none;opacity:0;pointer-events:none}";
  document.head.appendChild(style);

  var HERO_SEL = [
    "video.og-hero__video",
    "video.og-film__bg",
    "video.lv-lum__bg",
    "video.lv-ex-film__bg",
    "video.lv-cm-film__bg",
    "video.lv-td-film__bg",
    "video.lv-ai-film__bg",
    "video[data-livon-video]",
    ".livon-hero__bg video",
    "video.nhv-video",
    "video[class*='film__video']",
    "video.games-hero__video",
    "video.ir-hero__film",
    ".np-film video",
  ].join(",");

  function isHeroFilm(video) {
    if (!video || video.tagName !== "VIDEO") return false;
    if (video.getAttribute("data-film-keep") === "1") return true;
    if (video.matches(HERO_SEL)) return true;
    return !!(
      video.closest(
        "[data-og-film], [data-lv-life-hero], [data-lv-ml-hero], [data-lv-ex-hero], [data-lv-cm-hero], [data-lv-td-hero], [data-lv-ai-hero], .livon-hero, .og-hero, .lv-life__hero, .lv-ml__hero"
      )
    );
  }

  window.FilmKeep = window.FilmKeep || {};
  window.FilmKeep.isHeroFilm = isHeroFilm;
  window.FilmKeep.kick = function (root) {
    (root || document).querySelectorAll(HERO_SEL).forEach(function (video) {
      keepFilm(hostFor(video), video);
      tryPlay(video);
    });
  };

  function hostFor(video) {
    return (
      video.closest(
        "[data-og-film], [data-lv-life-hero], [data-lv-ml-hero], [data-lv-ex-hero], [data-lv-cm-hero], [data-lv-td-hero], [data-lv-ai-hero], [data-bz-film], [data-st-film], [data-eco-film], [data-nog-film], [data-nls-film], [data-nai-film], [data-games-film], [data-apps-film], .livon-hero, .og-hero, .lv-life__hero, .lv-ml__hero, .hero--film"
      ) || video.parentElement
    );
  }

  function arm(video) {
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
    video.setAttribute("preload", "auto");
    video.removeAttribute("controls");
  }

  function tryPlay(video) {
    if (!video) return;
    arm(video);
    if (document.visibilityState === "hidden") return;
    try {
      if (video.error) {
        var src = video.currentSrc || video.src;
        if (src) {
          video.removeAttribute("src");
          video.src = src;
          video.load();
        }
      }
    } catch (err) {
      /* ignore */
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
    if (play && typeof play.catch === "function") {
      play.catch(function () {
        setTimeout(function () {
          var retry = video.play();
          if (retry && retry.catch) retry.catch(function () {});
        }, 250);
      });
    }
  }

  function keepFilm(host, video) {
    if (!host) return;
    if (!video) {
      requestAnimationFrame(function () {
        host.classList.add("is-ready");
      });
      return;
    }
    if (video.getAttribute("data-film-keep") === "1") {
      tryPlay(video);
      return;
    }
    video.setAttribute("data-film-keep", "1");
    video.setAttribute("data-film-bg", "1");

    function restart() {
      try {
        video.currentTime = 0;
      } catch (err) {
        /* ignore */
      }
      tryPlay(video);
    }

    function recover() {
      if (document.visibilityState !== "visible") return;
      tryPlay(video);
    }

    arm(video);
    try {
      if (video.readyState < 2) video.load();
    } catch (err) {
      /* ignore */
    }

    video.addEventListener("ended", restart);
    video.addEventListener("pause", function () {
      // Hero films stay playing while the page is visible (hidden tabs still warm).
      if (document.visibilityState === "visible") tryPlay(video);
    });
    video.addEventListener("canplay", function () {
      tryPlay(video);
    });
    video.addEventListener("canplaythrough", function () {
      tryPlay(video);
    });
    video.addEventListener("loadeddata", function () {
      tryPlay(video);
    });
    video.addEventListener("loadedmetadata", function () {
      tryPlay(video);
    });
    video.addEventListener("playing", function () {
      host.classList.remove("is-static");
      video.style.opacity = "1";
    });
    video.addEventListener("waiting", recover);
    video.addEventListener("stalled", recover);
    video.addEventListener("suspend", function () {
      if (video.paused) recover();
    });
    video.addEventListener("error", function () {
      setTimeout(recover, 400);
    });
    video.addEventListener("timeupdate", function () {
      if (!video.duration) return;
      if (video.currentTime >= video.duration - 0.12) {
        try {
          video.currentTime = 0.05;
        } catch (err) {
          /* ignore */
        }
        if (video.paused) tryPlay(video);
      }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") tryPlay(video);
    });
    window.addEventListener("pageshow", function () {
      tryPlay(video);
    });
    window.addEventListener("focus", function () {
      tryPlay(video);
    });
    ["pointerdown", "touchstart", "click", "keydown"].forEach(function (ev) {
      document.addEventListener(
        ev,
        function () {
          tryPlay(video);
        },
        { capture: true, passive: true, once: true }
      );
    });
    setInterval(function () {
      if (document.visibilityState === "visible" && (video.paused || video.ended || video.readyState < 2)) {
        tryPlay(video);
      }
    }, 500);

    tryPlay(video);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!host.hasAttribute("data-lockup-reveal")) {
          host.classList.add("is-ready");
        }
        tryPlay(video);
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

    document.querySelectorAll(HERO_SEL).forEach(function (video) {
      keepFilm(hostFor(video), video);
    });

    // Warm every hero source early so menu switches do not wait on first buffer.
    document.querySelectorAll(HERO_SEL).forEach(function (video) {
      try {
        if (video.readyState < 2) video.load();
      } catch (err) {
        /* ignore */
      }
      tryPlay(video);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
