(function () {
  "use strict";

  var lang = localStorage.getItem("newon-ir-lang") === "en" ? "en" : "ko";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var narrow = window.matchMedia("(max-width: 767px)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-ko]").forEach(function (el) {
      var value = el.getAttribute(lang === "en" ? "data-en" : "data-ko");
      if (value == null) return;
      if (el.childElementCount && el.querySelector("input, select, textarea, br")) {
        var textNode = Array.prototype.find.call(el.childNodes, function (node) {
          return node.nodeType === 3 && node.textContent.trim();
        });
        if (textNode) textNode.textContent = value;
        else if (!el.querySelector("input, select, textarea")) el.textContent = value;
      } else if (!el.querySelector("input, select, textarea")) {
        el.textContent = value;
      }
    });
    document.querySelectorAll(".ir-lang button").forEach(function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-lang") === lang);
    });
    var about = document.getElementById("ir-about");
    var ai = document.getElementById("ir-ai-link");
    var games = document.getElementById("ir-games-link");
    if (about) about.href = "/" + lang + "/about/";
    if (ai) ai.href = "/" + lang + "/ai/";
    if (games) games.href = "/" + lang + "/games/";
    renderApps();
    paintAbout();
  }

  document.querySelectorAll(".ir-lang button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      lang = btn.getAttribute("data-lang");
      localStorage.setItem("newon-ir-lang", lang);
      applyLang();
    });
  });

  var menu = document.querySelector(".ir-menu");
  var drawer = document.getElementById("ir-drawer");
  if (menu && drawer) {
    menu.addEventListener("click", function () {
      var open = drawer.hasAttribute("hidden");
      if (open) drawer.removeAttribute("hidden");
      else drawer.setAttribute("hidden", "");
      drawer.classList.toggle("is-open", open);
      menu.setAttribute("aria-expanded", open ? "true" : "false");
    });
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        drawer.setAttribute("hidden", "");
        drawer.classList.remove("is-open");
        menu.setAttribute("aria-expanded", "false");
      });
    });
  }

  function renderApps() {
    var root = document.getElementById("ir-apps");
    var data = window.NEWON_IR_DATA;
    if (!root || !data) return;
    var items = [];
    data.categories.forEach(function (cat) {
      cat.products.forEach(function (product) { items.push(product); });
    });
    items.sort(function (a, b) {
      return (a.status === "released" ? 0 : 1) - (b.status === "released" ? 0 : 1);
    });
    root.innerHTML = items.map(function (product) {
      var live = product.status === "released" || product.status === "current";
      var status = live ? (lang === "en" ? "Released" : "출시") : (lang === "en" ? "In development" : "개발 중");
      var href = (product.href || "#").replace(/^\/(ko|en)\//, "/" + lang + "/");
      return (
        '<a class="ir-app" href="' + href + '">' +
        '<img src="' + product.icon + '" alt="" width="48" height="48" loading="lazy" />' +
        "<span><b>" + product.name + "</b><small>" + status + "</small></span>" +
        '<span class="ir-soon">' + (live ? "→" : status) + "</span></a>"
      );
    }).join("");
  }

  var FILM_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4";
  var film = document.getElementById("ir-film");
  var poster = document.getElementById("ir-film-poster");
  var canvas = document.getElementById("ir-film-canvas");
  if (film && canvas) {
    var ctx = canvas.getContext("2d");
    var frames = [];
    var cacheReady = false;
    var target = 0;
    var smooth = 0;
    var seeking = false;
    var lastIndex = -1;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    }
    function drawCover(bitmap) {
      var cw = canvas.width;
      var ch = canvas.height;
      var scale = Math.max(cw / bitmap.width, ch / bitmap.height);
      var dw = bitmap.width * scale;
      var dh = bitmap.height * scale;
      ctx.drawImage(bitmap, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }
    function hidePoster() { if (poster) poster.classList.add("is-off"); }
    resizeCanvas();
    window.addEventListener("resize", function () { lastIndex = -1; resizeCanvas(); });

    var extractStarted = false;
    function onFilmReady() {
      film.classList.add("is-on");
      hidePoster();
      if (reduced || saveData || extractStarted) return;
      extractStarted = true;
      setTimeout(extractFrames, 300);
    }
    film.addEventListener("loadeddata", onFilmReady);
    film.addEventListener("error", function () { film.classList.remove("is-on"); });
    if (film.readyState >= 2) onFilmReady();

    function extractFrames() {
      var off = document.createElement("video");
      off.muted = true;
      off.playsInline = true;
      off.preload = "auto";
      off.crossOrigin = "anonymous";
      off.src = FILM_SRC;
      off.addEventListener("error", function () { off.removeAttribute("src"); });
      off.addEventListener("loadedmetadata", function () {
        var duration = off.duration || 0;
        if (!duration) return;
        var count = Math.min(90, Math.max(24, Math.round(duration * 12)));
        var index = 0;
        function take() {
          if (index >= count) {
            cacheReady = frames.length > 0;
            if (cacheReady) {
              canvas.classList.add("is-on");
              film.classList.remove("is-on");
            }
            off.pause();
            off.removeAttribute("src");
            off.load();
            return;
          }
          var at = (index / Math.max(1, count - 1)) * Math.max(0, duration - 0.05);
          var onSeek = function () {
            off.removeEventListener("seeked", onSeek);
            var scale = Math.min(1, 960 / (off.videoWidth || 960));
            var w = Math.max(1, Math.round((off.videoWidth || 960) * scale));
            var h = Math.max(1, Math.round((off.videoHeight || 540) * scale));
            var snap = document.createElement("canvas");
            snap.width = w;
            snap.height = h;
            snap.getContext("2d").drawImage(off, 0, 0, w, h);
            createImageBitmap(snap).then(function (bitmap) {
              frames[index] = bitmap;
              index += 1;
              take();
            }).catch(function () {
              index += 1;
              take();
            });
          };
          off.addEventListener("seeked", onSeek);
          try { off.currentTime = at; } catch (err) { index = count; take(); }
        }
        take();
      }, { once: true });
    }

    function tick() {
      var span = document.documentElement.scrollHeight - window.innerHeight;
      target = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0;
      smooth += (target - smooth) * 0.12;
      if (!reduced && cacheReady) {
        var index = Math.min(frames.length - 1, Math.max(0, Math.round(smooth * (frames.length - 1))));
        if (index !== lastIndex && frames[index]) {
          lastIndex = index;
          drawCover(frames[index]);
        }
      } else if (!reduced && film.readyState >= 2 && film.duration && !seeking) {
        var next = smooth * Math.max(0, film.duration - 0.05);
        if (Math.abs(film.currentTime - next) > 0.04) {
          seeking = true;
          var timer = setTimeout(function () {
            seeking = false;
            film.removeEventListener("seeked", done);
          }, 420);
          var done = function () {
            seeking = false;
            clearTimeout(timer);
            film.removeEventListener("seeked", done);
          };
          film.addEventListener("seeked", done);
          try { film.currentTime = next; } catch (err) { seeking = false; clearTimeout(timer); }
        }
      }
      requestAnimationFrame(tick);
    }
    if (reduced) {
      film.addEventListener("loadeddata", function () {
        try { film.pause(); } catch (err) {}
      });
    }
    window.addEventListener("pagehide", function () {
      frames.forEach(function (bitmap) { if (bitmap && bitmap.close) bitmap.close(); });
    });
    requestAnimationFrame(tick);
  }

  var heroFilm = document.getElementById("ir-hero-film");
  if (heroFilm && reduced) {
    heroFilm.removeAttribute("autoplay");
    heroFilm.pause();
  }

  var films = [
    ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260330_153826_e9005cf7-a1c7-4c7d-886f-fea22d644a9c.mp4", "Newon\nApp", "Everyday apps you need,\nin one Newon."],
    ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260723_145606_ab143199-b593-4941-bb1b-9afca215416b.mp4", "Newon AI", "Closer AI,\nfor your everyday life."],
    ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_102608_5fa1187d-9ac6-44fb-82ab-54376200abc0.mp4", "LivOn", "At every stage of life,\nthe next thing you need."],
    ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260323_071151_38c3924f-c312-48af-a196-3fbb80e4226f.mp4", "Ongil", "Warm connection,\nthrough the years of daily life."],
    ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4", "Newon Business", "Expanding what business can do,\nwith technology."],
    ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_202655_a7f5aca0-2f80-4bc9-bcb5-96ac95662003.mp4", "Newon Studio", "From idea to reality,\nfrom experience to new value."],
    ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_230900_ef8565a6-16eb-4fe9-98e4-4b972d3f436d.mp4", "404:\nHUMAN", "In a world of AI,\nhide that you are the last human."]
  ];
  var logos = ["ox-month", "savy", "goalup", "subping", "babylog", "pillmate", "petlog", "myworld", "countup", "piggyup", "newon-plus"];
  var hero = document.querySelector(".ir-hero");
  if (hero && !document.querySelector(".ir-marquee")) {
    var marquee = document.createElement("section");
    marquee.className = "ir-marquee";
    marquee.setAttribute("aria-label", "Selected work");
    var label = document.createElement("p");
    label.className = "ir-marquee__label";
    label.textContent = "Selected work";
    marquee.appendChild(label);
    function addRow(dir, fill) {
      var row = document.createElement("div");
      row.className = "ir-marquee__row";
      var track = document.createElement("div");
      track.className = "ir-marquee__track";
      track.setAttribute("data-dir", String(dir));
      fill(track);
      fill(track);
      if (dir < 0) fill(track);
      row.appendChild(track);
      marquee.appendChild(row);
    }
    addRow(1, function (track) {
      films.forEach(function (film) {
        var plate = document.createElement("div");
        plate.className = "ir-marquee__film";
        var video = document.createElement("video");
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.autoplay = true;
        video.controls = false;
        video.playsInline = true;
        video.preload = "auto";
        video.src = film[0];
        video.setAttribute("muted", "");
        video.setAttribute("autoplay", "");
        video.setAttribute("loop", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.setAttribute("aria-label", (film[1] + " " + film[2]).replace(/\n/g, " "));
        if (!reduced) {
          var start = video.play();
          if (start && typeof start.catch === "function") start.catch(function () {});
        }
        var lock = document.createElement("div");
        lock.className = "ir-marquee__lockup";
        var veil = document.createElement("div");
        veil.className = "ir-marquee__veil";
        veil.setAttribute("aria-hidden", "true");
        var word = document.createElement("p");
        word.className = "ir-marquee__wordmark";
        film[1].split("\n").forEach(function (line) {
          var span = document.createElement("span");
          span.textContent = line;
          word.appendChild(span);
        });
        var slogan = document.createElement("p");
        slogan.className = "ir-marquee__slogan";
        film[2].split("\n").forEach(function (line) {
          var span = document.createElement("span");
          span.textContent = line;
          slogan.appendChild(span);
        });
        lock.appendChild(veil);
        lock.appendChild(word);
        lock.appendChild(slogan);
        plate.appendChild(video);
        plate.appendChild(lock);
        track.appendChild(plate);
      });
    });
    addRow(-1, function (track) {
      logos.forEach(function (name) {
        var tile = document.createElement("div");
        tile.className = "ir-marquee__logo";
        var img = document.createElement("img");
        img.src = "/" + name + "-logo.png";
        img.alt = name;
        img.width = 64;
        img.height = 64;
        tile.appendChild(img);
        track.appendChild(tile);
      });
    });
    hero.insertAdjacentElement("afterend", marquee);
  }

  function paintAbout() {
    var body = document.querySelector(".ir-about__body");
    if (!body || reduced) return;
    var text = body.getAttribute(lang === "en" ? "data-en" : "data-ko") || "";
    body.textContent = "";
    Array.from(text).forEach(function (ch) {
      if (ch === " ") {
        body.appendChild(document.createTextNode(" "));
        return;
      }
      var span = document.createElement("span");
      span.className = "ir-char";
      span.textContent = ch;
      span.style.opacity = "0.2";
      body.appendChild(span);
    });
  }

  var pins = [];
  if (!reduced) {
    document.querySelectorAll(".ir-stack .ir-project").forEach(function (card, index, list) {
      var pin = document.createElement("div");
      pin.className = "ir-pin";
      card.parentNode.insertBefore(pin, card);
      pin.appendChild(card);
      card.style.zIndex = String(index + 1);
      card.style.top = "calc(var(--nav) + 1.25rem + " + (index * 28) + "px)";
      pins.push({ pin: pin, card: card, index: index, total: list.length });
    });
  }

  var ticking = false;
  function moveOnScroll() {
    ticking = false;
    var marqueeEl = document.querySelector(".ir-marquee");
    if (marqueeEl && !reduced) {
      var top = marqueeEl.getBoundingClientRect().top + window.scrollY;
      var offset = (window.scrollY - top + window.innerHeight) * 0.3;
      marqueeEl.querySelectorAll(".ir-marquee__track").forEach(function (track) {
        var dir = Number(track.getAttribute("data-dir")) || 1;
        var x = dir === 1 ? offset - 200 : -(offset - 200);
        track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
      });
    }
    var about = document.querySelector(".ir-about__body");
    if (about && !reduced) {
      var chars = about.querySelectorAll(".ir-char");
      var rect = about.getBoundingClientRect();
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
    pins.forEach(function (item) {
      var rect = item.pin.getBoundingClientRect();
      var passed = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      var endScale = 1 - (item.total - 1 - item.index) * 0.03;
      var scale = 1 + (endScale - 1) * passed;
      item.card.style.transform = "scale(" + scale.toFixed(4) + ")";
    });
  }
  function requestScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(moveOnScroll);
  }
  if (!reduced) {
    window.addEventListener("scroll", requestScroll, { passive: true });
    window.addEventListener("resize", requestScroll);
    requestScroll();
  }

  function armIrFilm(video) {
    if (reduced || !video) return;
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
  document.querySelectorAll(".ir-lane video, .ir-marquee__film video").forEach(function (video) {
    if (reduced) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }
    armIrFilm(video);
    video.addEventListener("pause", function () { armIrFilm(video); });
    video.addEventListener("ended", function () { armIrFilm(video); });
  });
  if (!reduced) {
    setInterval(function () {
      if (document.visibilityState !== "visible") return;
      document.querySelectorAll(".ir-lane video, .ir-marquee__film video").forEach(function (video) {
        if (video.paused || video.ended) armIrFilm(video);
      });
    }, 700);
  }

  if (!reduced && "IntersectionObserver" in window) {
    document.querySelectorAll(".ir-block, .ir-detail, .ir-lane, .ir-hero h1").forEach(function (el, index) {
      if (el.hasAttribute("data-delay")) return;
      el.classList.add("ir-reveal");
      el.style.transitionDelay = Math.min(index % 4, 3) * 80 + "ms";
    });
    document.querySelectorAll("[data-delay]").forEach(function (el) {
      el.classList.add("ir-reveal");
      el.style.transitionDelay = el.getAttribute("data-delay") + "ms";
    });
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("is-in");
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".ir-reveal").forEach(function (el) { reveal.observe(el); });
  }

  document.querySelectorAll("[data-request]").forEach(function (link) {
    link.addEventListener("click", function () {
      var type = document.querySelector('#ir-form select[name="inquiry_type"]');
      if (type) type.value = "materials";
    });
  });

  var form = document.getElementById("ir-form");
  var status = document.getElementById("ir-status");
  var sending = false;
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (sending) return;
      var data = new FormData(form);
      if ((data.get("_honey") || "").trim()) return;
      var email = String(data.get("email") || "").trim();
      var businesses = data.getAll("business");
      var ok = true;
      form.querySelectorAll("input, select, textarea").forEach(function (field) {
        field.classList.remove("is-bad");
        if (field.required && !String(field.value || "").trim()) {
          field.classList.add("is-bad");
          ok = false;
        }
      });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.email.classList.add("is-bad");
        ok = false;
      }
      if (!businesses.length) ok = false;
      if (!form.privacy.checked) ok = false;
      if (!ok) {
        status.textContent = lang === "en" ? "Check the required fields." : "필수 항목을 확인해 주세요.";
        return;
      }
      sending = true;
      var button = form.querySelector('[type="submit"]');
      button.disabled = true;
      status.textContent = lang === "en" ? "Sending…" : "보내는 중…";
      var payload = {
        name: data.get("name"),
        organization: data.get("organization"),
        email: email,
        phone: data.get("phone") || "",
        inquiry_type: data.get("inquiry_type"),
        businesses: businesses.join(", "),
        amount: data.get("amount") || "",
        investor_type: data.get("investor_type") || "",
        message: data.get("message"),
        _subject: "NEWON IR inquiry — " + data.get("inquiry_type"),
        _captcha: "false",
        _template: "table"
      };
      fetch("https://formsubmit.co/ajax/newon@newon.app", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error("status");
        form.reset();
        status.textContent = lang === "en" ? "Received. We will reply by email." : "접수되었습니다. 이메일로 답변드립니다.";
      }).catch(function () {
        status.textContent = lang === "en" ? "Could not send. Email newon@newon.app." : "전송되지 않았습니다. newon@newon.app 로 보내 주세요.";
      }).finally(function () {
        sending = false;
        button.disabled = false;
      });
    });
  }

  applyLang();
})();
