(function () {
  var KEY_STAGE = "livon.lifeStage";
  var KEY_INTERESTS = "livon.mlInterests";
  var KEY_PREP = "livon.mlPrep";
  var KEY_FUTURE = "livon.mlFuture";

  var STAGE = {
    "10": { age: "10대", name: "성장과 발견", desc: "새로운 관심사를 발견하고 미래를 그려가는 시간.", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85" },
    "20": { age: "20대", name: "독립과 도전", desc: "새로운 경험과 선택으로 나만의 삶을 만들어가는 시간.", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85" },
    "30": { age: "30대", name: "성장과 균형", desc: "일과 일상의 균형을 만들어가는 시간.", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=85" },
    "40": { age: "40대", name: "안정과 확장", desc: "나와 가족의 삶을 함께 설계하는 시간.", img: "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=1400&q=85" },
    "50": { age: "50대", name: "전환과 재발견", desc: "다음 삶의 가능성을 발견하는 시간.", img: "https://images.unsplash.com/photo-1573497019940-1cfe39e0434e?auto=format&fit=crop&w=1400&q=85" },
    "60": { age: "60대", name: "새로운 시작", desc: "나를 위한 새로운 일상을 시작하는 시간.", img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1400&q=85" },
    "70": { age: "70대 이상", name: "여유와 연결", desc: "나답게, 편안하게, 함께하는 시간.", img: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce0?auto=format&fit=crop&w=1400&q=85" }
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function readJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h")) || 74) - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function openAgeModal() {
    var modal = $("#lv-ml-age-modal");
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeAgeModal() {
    var modal = $("#lv-ml-age-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  function openLogin() {
    var modal = $("#lv-ml-login-modal");
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLogin() {
    var modal = $("#lv-ml-login-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function applyStage(id) {
    var meta = STAGE[id];
    var img = $("[data-lv-ml-stage-img]");
    var kick = $("[data-lv-ml-stage-kicker]");
    var name = $("[data-lv-ml-stage-name]");
    var desc = $("[data-lv-ml-stage-desc]");
    var ov = $("[data-lv-ml-ov-stage]");
    var hint = $("[data-lv-ml-prep-hint]");
    var phint = $("[data-lv-ml-prio-hint]");
    $$("[data-prep-list]").forEach(function (el) { el.hidden = el.getAttribute("data-prep-list") !== String(id); });
    $$("[data-prio]").forEach(function (el) { el.hidden = el.getAttribute("data-prio") !== String(id); });
    if (!meta) {
      if (kick) kick.textContent = "라이프 스테이지 미설정";
      if (name) name.textContent = "나에게 맞는 단계를 선택해 주세요";
      if (desc) desc.textContent = "연령대와 관계없이 모든 생애주기를 자유롭게 탐색할 수 있습니다.";
      if (ov) ov.textContent = "—";
      if (hint) hint.hidden = false;
      if (phint) phint.hidden = false;
      return;
    }
    if (img) { img.src = meta.img; img.alt = meta.age + " · " + meta.name; }
    if (kick) kick.textContent = meta.age + " · " + meta.name;
    if (name) name.textContent = meta.age + " — " + meta.name;
    if (desc) desc.textContent = meta.desc;
    if (ov) ov.textContent = meta.age;
    if (hint) hint.hidden = true;
    if (phint) phint.hidden = true;
    var link = $("[data-lv-ml-to-life]");
    if (link) link.href = "#stage-" + id;
  }

  function setStage(id) {
    if (id) writeJSON(KEY_STAGE, id);
    applyStage(id || readJSON(KEY_STAGE, null));
    refreshOverview();
  }

  function refreshOverview() {
    var interests = $$("[data-lv-ml-interests] button.is-on").length;
    var stage = readJSON(KEY_STAGE, null);
    var prep = readJSON(KEY_PREP, {});
    var done = 0;
    if (stage && prep[stage]) {
      Object.keys(prep[stage]).forEach(function (k) { if (prep[stage][k]) done += 1; });
    }
    var oi = $("[data-lv-ml-ov-interest]");
    var op = $("[data-lv-ml-ov-prep]");
    if (oi) oi.textContent = String(interests);
    if (op) op.textContent = String(done);
  }

  function initInterests() {
    var saved = readJSON(KEY_INTERESTS, []);
    // map old short labels if any — ignore mismatch
    $$("[data-lv-ml-interests] button").forEach(function (btn) {
      var val = btn.getAttribute("data-interest");
      if (saved.indexOf(val) >= 0) btn.classList.add("is-on");
      btn.addEventListener("click", function () {
        btn.classList.toggle("is-on");
        var next = $$("[data-lv-ml-interests] button.is-on").map(function (b) { return b.getAttribute("data-interest"); });
        writeJSON(KEY_INTERESTS, next);
        refreshOverview();
      });
    });
  }

  function initPrep() {
    var prep = readJSON(KEY_PREP, {});
    $$("[data-prep-list]").forEach(function (list) {
      var sid = list.getAttribute("data-prep-list");
      if (!prep[sid]) prep[sid] = {};
      list.querySelectorAll("[data-prep-check]").forEach(function (input) {
        var item = input.closest("[data-prep-item]");
        var key = item && item.getAttribute("data-prep-item");
        if (key && prep[sid][key]) {
          input.checked = true;
          item.classList.add("is-done");
        }
        input.addEventListener("change", function () {
          if (!prep[sid]) prep[sid] = {};
          prep[sid][key] = !!input.checked;
          item.classList.toggle("is-done", input.checked);
          writeJSON(KEY_PREP, prep);
          refreshOverview();
        });
      });
    });
  }

  function initFuture() {
    var saved = readJSON(KEY_FUTURE, []);
    $$("[data-lv-ml-future] button").forEach(function (btn) {
      var val = btn.getAttribute("data-future");
      if (saved.indexOf(val) >= 0) btn.classList.add("is-on");
      btn.addEventListener("click", function () {
        btn.classList.toggle("is-on");
        writeJSON(KEY_FUTURE, $$("[data-lv-ml-future] button.is-on").map(function (b) { return b.getAttribute("data-future"); }));
      });
    });
  }

  function initReveal() {
    var nodes = $$("#life-now [data-lv-reveal]");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function initHero() {
    var hero = $("[data-lv-ml-hero]");
    if (!hero) return;
    requestAnimationFrame(function () { hero.classList.add("is-ready"); });
  }

  function bind() {
    $$("[data-lv-ml-find]").forEach(function (btn) {
      btn.addEventListener("click", function (e) { e.preventDefault(); openAgeModal(); });
    });
    $$("[data-lv-ml-login]").forEach(function (btn) {
      btn.addEventListener("click", function () { openLogin(); });
    });
    $$("[data-lv-ml-scroll]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href") || "";
        if (href.charAt(0) === "#") {
          e.preventDefault();
          document.documentElement.dataset.lvView = "life-now";
          scrollToId(href.slice(1));
        }
      });
    });
    var ageModal = $("#lv-ml-age-modal");
    if (ageModal) {
      ageModal.querySelectorAll("[data-age]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-age");
          closeAgeModal();
          setStage(id);
          scrollToId("ml-stage");
        });
      });
      ageModal.querySelectorAll("[data-lv-ml-modal-close]").forEach(function (btn) {
        btn.addEventListener("click", closeAgeModal);
      });
    }
    var loginModal = $("#lv-ml-login-modal");
    if (loginModal) {
      loginModal.querySelectorAll("[data-lv-ml-modal-close]").forEach(function (btn) {
        btn.addEventListener("click", closeLogin);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeAgeModal(); closeLogin(); }
    });
  }

  window.LivonMyLife = {
    onShow: function (hash) {
      initHero();
      setStage(readJSON(KEY_STAGE, null));
      $$("#life-now [data-lv-reveal]").forEach(function (n) {
        if (n.getBoundingClientRect().top < window.innerHeight * 1.2) n.classList.add("is-in");
      });
      if (hash.indexOf("ml-") === 0) {
        setTimeout(function () {
          scrollToId(hash);
          var t = document.getElementById(hash);
          if (t) t.classList.add("is-in");
        }, 50);
      } else if (hash === "life-now") {
        window.scrollTo(0, 0);
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initHero();
    initReveal();
    initInterests();
    initPrep();
    initFuture();
    bind();
    setStage(readJSON(KEY_STAGE, null));
  });
})();
