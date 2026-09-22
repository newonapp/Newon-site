(function () {
  var root = document.getElementById("lifestage-detail");
  if (!root) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("is-js");

  function showDecade(id) {
    if (!id) return;
    root.querySelectorAll("[data-nls-decade]").forEach(function (btn) {
      var on = btn.getAttribute("data-nls-decade") === id;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    root.querySelectorAll("[data-nls-decade-card]").forEach(function (card) {
      card.classList.toggle("is-on", card.getAttribute("data-nls-decade-card") === id);
    });
  }

  function setHeroNow(node) {
    if (!node) return;
    root.querySelectorAll("[data-nls-hero-node]").forEach(function (n) {
      n.classList.toggle("is-active", n === node);
    });
    var title = root.querySelector("[data-nls-now-title]");
    var age = root.querySelector("[data-nls-now-age]");
    if (title) title.textContent = node.getAttribute("data-name") || "";
    if (age) age.textContent = node.getAttribute("data-age") || "";
  }

  root.addEventListener("click", function (e) {
    var node = e.target.closest("[data-nls-hero-node]");
    if (node && root.contains(node)) {
      setHeroNow(node);
      return;
    }
    var decade = e.target.closest("[data-nls-decade]");
    if (decade && root.contains(decade)) {
      showDecade(decade.getAttribute("data-nls-decade"));
      return;
    }
    var scroll = e.target.closest("[data-nls-scroll]");
    if (scroll && root.contains(scroll)) {
      var href = scroll.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", href);
    }
  });

  function goHash() {
    var id = (location.hash || "").replace(/^#/, "");
    if (!id) return;
    var el = document.getElementById(id);
    if (el && (id === "story-lifestage" || root.contains(el))) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }
  if (document.readyState === "complete") goHash();
  else window.addEventListener("load", goHash);

  var film = root.querySelector("[data-nls-film]");
  var video = film && film.querySelector(".nls-film__video");
  if (film) {
    var arm = function () {
      if (!video) return;
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
    };
    var tryPlay = function () {
      if (!video) return;
      arm();
      film.classList.remove("is-static");
      try {
        if (video.ended) video.currentTime = 0;
      } catch (err) {
        /* ignore */
      }
      var play = video.play();
      if (play && typeof play.catch === "function") play.catch(function () {});
    };
    var restart = function () {
      try {
        video.currentTime = 0;
      } catch (err) {
        /* ignore */
      }
      tryPlay();
    };
    if (video) {
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
    }
    requestAnimationFrame(function () {
      film.classList.add("is-ready");
      tryPlay();
    });
  }
})();
