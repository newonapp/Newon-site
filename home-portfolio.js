(function () {
  "use strict";
  var root = document.querySelector(".np-home");
  if (!root) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var body = root.querySelector("[data-np-chars]");
  if (body && !reduced) {
    var text = body.textContent || "";
    body.textContent = "";
    Array.from(text).forEach(function (ch) {
      if (ch === " ") {
        body.appendChild(document.createTextNode(" "));
        return;
      }
      var span = document.createElement("span");
      span.className = "np-char";
      span.textContent = ch;
      span.style.opacity = "0.2";
      body.appendChild(span);
    });
  }

  var pins = [];
  if (!reduced) {
    root.querySelectorAll(".np-pin").forEach(function (pin) {
      var card = pin.querySelector(".np-card");
      if (!card) return;
      var index = Number(card.style.getPropertyValue("--np-i")) || 0;
      var total = Number(card.style.getPropertyValue("--np-n")) || 1;
      card.style.zIndex = String(index + 1);
      card.style.top = "calc(var(--nav) + 1.25rem + " + index * 28 + "px)";
      pins.push({ pin: pin, card: card, index: index, total: total });
    });
  }

  var ticking = false;
  function frame() {
    ticking = false;
    var marquee = root.querySelector(".np-marquee");
    if (marquee && !reduced) {
      var top = marquee.getBoundingClientRect().top + window.scrollY;
      var offset = (window.scrollY - top + window.innerHeight) * 0.3;
      marquee.querySelectorAll(".np-marquee__track").forEach(function (track) {
        var dir = Number(track.getAttribute("data-dir")) || 1;
        var x = dir === 1 ? offset - 200 : -(offset - 200);
        track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
      });
    }
    if (body && !reduced) {
      var chars = body.querySelectorAll(".np-char");
      var rect = body.getBoundingClientRect();
      var travel = rect.height + window.innerHeight * 0.6;
      var progress = Math.min(1, Math.max(0, (window.innerHeight * 0.8 - rect.top) / Math.max(1, travel)));
      var count = chars.length || 1;
      chars.forEach(function (node, index) {
        var start = index / count;
        var end = (index + 1) / count;
        var local = (progress - start) / Math.max(0.0001, end - start);
        node.style.opacity = (0.2 + 0.8 * Math.min(1, Math.max(0, local))).toFixed(3);
      });
    }
    root.querySelectorAll("[data-np-x]").forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var delay = Number(el.getAttribute("data-np-delay")) || 0;
      var raw = (vh * 0.9 - rect.top) / (vh * 0.5);
      var p = Math.min(1, Math.max(0, (raw - delay) / Math.max(0.35, 1 - delay)));
      var x = (1 - p) * (Number(el.getAttribute("data-np-x")) || 0);
      var y = (1 - p) * 42;
      el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      el.style.opacity = (0.15 + 0.85 * p).toFixed(3);
    });
    pins.forEach(function (item) {
      var rect = item.pin.getBoundingClientRect();
      var passed = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      var endScale = 1 - (item.total - 1 - item.index) * 0.03;
      var scale = 1 + (endScale - 1) * passed;
      item.card.style.transform = "scale(" + scale.toFixed(4) + ")";
    });
  }
  function request() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }
  if (!reduced) {
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    request();
    if ("IntersectionObserver" in window) {
      root.querySelectorAll(".np-reveal").forEach(function (el, index) {
        el.style.transitionDelay = Math.min(index % 4, 3) * 80 + "ms";
      });
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("is-in");
        });
      }, { threshold: 0.15 });
      root.querySelectorAll(".np-reveal").forEach(function (el) { reveal.observe(el); });
    }
  }

  function armFilm(video) {
    if (reduced) return;
    var src = video.getAttribute("data-src");
    if (src && !video.getAttribute("src")) video.src = src;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.loop = true;
    video.autoplay = true;
    video.controls = false;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.removeAttribute("controls");
    var play = video.play();
    if (play && typeof play.catch === "function") play.catch(function () {});
  }
  root.querySelectorAll(".np-film video, .np-end__film").forEach(function (video) {
    if (reduced) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }
    armFilm(video);
    video.addEventListener("pause", function () { armFilm(video); });
    video.addEventListener("ended", function () { armFilm(video); });
  });
  if (!reduced) {
    setInterval(function () {
      if (document.visibilityState !== "visible") return;
      root.querySelectorAll(".np-film video, .np-end__film").forEach(function (video) {
        if (video.paused || video.ended) armFilm(video);
      });
    }, 700);
  }
})();
