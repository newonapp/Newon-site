(function () {
  var KEY_STAGE = "livon.lifeStage";
  var KEY_INTERESTS = "livon.lifeInterests";
  var KEY_SAVED = "livon.lifeSavedLocal";
  var KEY_AIQ = "livon.aiPrompt";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function stageLabel(id) {
    var map = { "10": "10대", "20": "20대", "30": "30대", "40": "40대", "50": "50대", "60": "60대", "70": "70대 이상" };
    return map[id] || "없음";
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h")) || 74) - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function setStage(id, opts) {
    opts = opts || {};
    if (id) writeJSON(KEY_STAGE, id);
    var label = $("[data-lv-life-stage-label]");
    if (label) label.textContent = "선택된 라이프 스테이지: " + stageLabel(id || readJSON(KEY_STAGE, null));
    $$(".lv-life-card[data-stage]").forEach(function (card) {
      card.classList.toggle("is-on", card.getAttribute("data-stage") === String(id));
    });
    if (opts.goto && id) {
      if (location.hash !== "#stage-" + id) {
        history.replaceState(null, "", "#stage-" + id);
      }
      document.documentElement.dataset.lvView = "life";
      requestAnimationFrame(function () { scrollToId("stage-" + id); });
    }
  }

  function openModal() {
    var modal = $("#lv-life-age-modal");
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var first = modal.querySelector("button[data-age]");
    if (first) first.focus();
  }
  function closeModal() {
    var modal = $("#lv-life-age-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function openLoginNotice(msg) {
    var modal = $("#lv-life-login-modal");
    if (!modal) return;
    var p = modal.querySelector("[data-lv-life-login-msg]");
    if (p && msg) p.textContent = msg;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLoginNotice() {
    var modal = $("#lv-life-login-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function initHero() {
    var hero = $("[data-lv-life-hero]");
    if (!hero) return;
    requestAnimationFrame(function () { hero.classList.add("is-ready"); });
  }

  function initReveal() {
    var nodes = $$("#life [data-lv-reveal]");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function initInterests() {
    var saved = readJSON(KEY_INTERESTS, []);
    $$("[data-lv-life-interests] button").forEach(function (btn) {
      var val = btn.getAttribute("data-interest");
      if (saved.indexOf(val) >= 0) btn.classList.add("is-on");
      btn.addEventListener("click", function () {
        btn.classList.toggle("is-on");
        var next = $$("[data-lv-life-interests] button.is-on").map(function (b) { return b.getAttribute("data-interest"); });
        writeJSON(KEY_INTERESTS, next);
      });
    });
  }

  function initFields() {
    $$("[data-lv-life-fields]").forEach(function (wrap) {
      var id = wrap.getAttribute("data-lv-life-fields");
      var panel = $('[data-lv-life-field-panel="' + id + '"]');
      wrap.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          wrap.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-on"); });
          btn.classList.add("is-on");
          if (panel) {
            panel.hidden = false;
            panel.textContent = "「" + btn.getAttribute("data-field") + "」 상세 콘텐츠는 준비 중입니다. 관련 서비스와 AI 질문으로 먼저 탐색해 보세요.";
          }
        });
      });
    });
  }

  function initSave() {
    $$("[data-lv-life-save]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openLoginNotice("저장은 로그인 후 계정에 동기화됩니다. 현재 계정 연동이 없어 클라우드 저장은 제공되지 않습니다. 관심 분야·라이프 스테이지만 이 기기에 저장됩니다.");
      });
    });
  }

  function initAiq() {
    $$("[data-lv-life-aiq]").forEach(function (link) {
      link.addEventListener("click", function () {
        var q = link.getAttribute("data-lv-life-aiq") || "";
        var stage = link.getAttribute("data-stage") || readJSON(KEY_STAGE, "");
        try {
          sessionStorage.setItem(KEY_AIQ, JSON.stringify({ q: q, stage: stage, at: Date.now() }));
        } catch (e) {}
      });
    });
  }

  function bind() {
    $$("[data-lv-life-find]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });
    $$("[data-lv-life-scroll]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href") || "";
        if (href.charAt(0) === "#") {
          e.preventDefault();
          var id = href.slice(1);
          if (location.hash !== href) history.replaceState(null, "", href.indexOf("life") === 1 || id.indexOf("life") === 0 ? "#life" : location.hash);
          // Keep view as life; scroll within page
          document.documentElement.dataset.lvView = "life";
          scrollToId(id);
        }
      });
    });
    $$("[data-lv-life-goto]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = (btn.getAttribute("data-lv-life-goto") || "").replace("stage-", "");
        setStage(id, { goto: true });
      });
    });
    var ageModal = $("#lv-life-age-modal");
    if (ageModal) {
      ageModal.querySelectorAll("[data-age]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-age");
          closeModal();
          setStage(id, { goto: true });
        });
      });
      ageModal.querySelectorAll("[data-lv-life-modal-close]").forEach(function (btn) {
        btn.addEventListener("click", closeModal);
      });
    }
    var loginModal = $("#lv-life-login-modal");
    if (loginModal) {
      loginModal.querySelectorAll("[data-lv-life-modal-close]").forEach(function (btn) {
        btn.addEventListener("click", closeLoginNotice);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); closeLoginNotice(); }
    });
  }

  window.LivonLife = {
    setStage: setStage,
    scrollToId: scrollToId,
    isLifeHash: function (hash) {
      return hash === "life" || hash === "life-stages" || hash.indexOf("stage-") === 0 || (hash.indexOf("life-") === 0 && hash !== "life-now");
    },
    onShow: function (hash) {
      initHero();
      var stage = null;
      if (hash.indexOf("stage-") === 0) stage = hash.replace("stage-", "");
      else stage = readJSON(KEY_STAGE, null);
      setStage(stage, { goto: false });
      $$("#life [data-lv-reveal]").forEach(function (n) {
        if (n.getBoundingClientRect().top < window.innerHeight * 1.2) n.classList.add("is-in");
      });
      if (hash.indexOf("stage-") === 0 || hash === "life-explore" || hash === "life-mine" || hash === "life-recommend" || hash === "life-services" || hash === "life-ai" || hash === "life-cta") {
        setTimeout(function () {
          scrollToId(hash);
          var target = document.getElementById(hash);
          if (target) target.classList.add("is-in");
        }, 50);
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initHero();
    initReveal();
    initInterests();
    initFields();
    initSave();
    initAiq();
    bind();
    setStage(readJSON(KEY_STAGE, null), { goto: false });
  });
})();
