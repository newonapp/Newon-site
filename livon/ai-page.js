(function () {
  var KEY_SAVED = "livon.aiSaved";
  var STAGES = {
    "10": {
      label: "10대 — 성장과 발견",
      desc: "학습과 진로, 진학, 취미, 청소년 활동",
      q: "관심 있는 진로를 어떻게 탐색하면 좋을까?",
      img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80"
    },
    "20": {
      label: "20대 — 독립과 도전",
      desc: "첫 자취, 취업, 생활비, 여행, 자기계발",
      q: "첫 독립을 준비하려면 무엇부터 해야 할까?",
      img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80"
    },
    "30": {
      label: "30대 — 성장과 균형",
      desc: "커리어, 주거, 가족 생활, 새로운 배움, 건강한 일상",
      q: "일과 생활의 균형을 위한 계획을 세워줘.",
      img: "https://images.unsplash.com/photo-1476703993599-003e7c9c03e6?auto=format&fit=crop&w=1400&q=80"
    },
    "40": {
      label: "40대 — 삶의 확장",
      desc: "가족 활동, 자녀 교육, 새로운 취미, 커리어 변화, 부모님 생활 지원",
      q: "가족과 함께할 수 있는 주말 활동을 찾아줘.",
      img: "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=1400&q=80"
    },
    "50": {
      label: "50대 — 새로운 전환",
      desc: "경력 전환, 재취업, 평생교육, 취미, 은퇴 준비",
      q: "새로운 일을 준비하려면 어떤 교육부터 알아보면 좋을까?",
      img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80"
    },
    "60": {
      label: "60대 — 새로운 시작",
      desc: "은퇴 후 생활, 새로운 배움, 지역 활동, 여행, 디지털 생활",
      q: "우리 지역에서 참여할 수 있는 평생교육 프로그램을 찾고 싶어.",
      img: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=1400&q=80"
    },
    "70": {
      label: "70대 이상 — 여유와 연결",
      desc: "생활 편의, 문화 프로그램, 가족 활동, 디지털 배움, 지역 모임",
      q: "가까운 곳에서 참여할 수 있는 문화 프로그램을 알려줘.",
      img: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1400&q=80"
    }
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function readJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function gnavOffset() {
    return (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h"), 10) || 74) + 8;
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function appendMsg(box, text, cls) {
    if (!box) return;
    var p = document.createElement("p");
    p.className = cls;
    p.textContent = text;
    box.appendChild(p);
    box.scrollTop = box.scrollHeight;
  }

  function startChat(question) {
    var q = (question || "").trim();
    if (!q) return;
    scrollToId("ai-chat");
    location.hash = "ai-chat";
    var box = $("[data-lv-ai-msgs]");
    var input = $("[data-lv-ai-chat-q]");
    if (input) input.value = q;
    appendMsg(box, q, "is-user");
    appendMsg(box, "LIVON AI 응답 API는 아직 연결되지 않았습니다. 질문은 이 화면에 기록되었고, 서버 연동 후 실제 답변·체크리스트·서비스 추천이 표시됩니다. 관련 메뉴(라이프 스테이지·오늘의 발견·탐색·커뮤니티·내 생활)는 지금 바로 이동할 수 있습니다.", "is-bot");
  }

  function setStage(id) {
    var data = STAGES[id];
    if (!data) return;
    $$("[data-lv-ai-stage]").forEach(function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-lv-ai-stage") === id);
    });
    var title = $("[data-lv-ai-stage-title]");
    var desc = $("[data-lv-ai-stage-desc]");
    var qbtn = $("[data-lv-ai-stage-q]");
    var img = $("[data-lv-ai-stage-img]");
    if (title) title.textContent = data.label;
    if (desc) desc.textContent = data.desc;
    if (qbtn) {
      qbtn.textContent = data.q;
      qbtn.setAttribute("data-lv-ai-ask", data.q);
    }
    if (img) {
      img.src = data.img;
      img.alt = data.label;
    }
  }

  function bindFilm() {
    var hero = $("#ai-hero");
    if (!hero) return;
    var reveal = function () { hero.classList.add("is-ready"); };
    var video = hero.querySelector("video");
    if (video) {
      if (video.readyState >= 2) reveal();
      else video.addEventListener("loadeddata", reveal, { once: true });
      setTimeout(reveal, 600);
    } else reveal();
  }

  function bindReveal() {
    var nodes = $$("[data-lv-ai-reveal]");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    nodes.forEach(function (el) { io.observe(el); });
  }

  function bindNav() {
    var links = $$(".lv-ai-nav__track a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").replace("#", "");
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-on"); });
        if (map[entry.target.id]) map[entry.target.id].classList.add("is-on");
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  function bindClicks() {
    document.addEventListener("click", function (e) {
      var ask = e.target.closest("[data-lv-ai-ask]");
      if (ask) {
        e.preventDefault();
        startChat(ask.getAttribute("data-lv-ai-ask") || ask.textContent);
        return;
      }
      var stage = e.target.closest("[data-lv-ai-stage]");
      if (stage) {
        e.preventDefault();
        setStage(stage.getAttribute("data-lv-ai-stage"));
        return;
      }
      var filter = e.target.closest("[data-lv-ai-filter]");
      if (filter) {
        e.preventDefault();
        var on = filter.getAttribute("aria-pressed") === "true";
        filter.setAttribute("aria-pressed", on ? "false" : "true");
        filter.classList.toggle("is-on", !on);
        var selected = $$("[data-lv-ai-filter][aria-pressed='true']").map(function (b) {
          return b.getAttribute("data-lv-ai-filter");
        });
        writeJSON("livon.aiDiscoverFilters", selected);
        return;
      }
      var discoverAsk = e.target.closest("[data-lv-ai-discover-ask]");
      if (discoverAsk) {
        e.preventDefault();
        var picks = readJSON("livon.aiDiscoverFilters", []);
        var q = picks.length
          ? "다음 조건에 맞는 새로운 경험과 배움을 추천해 줘: " + picks.join(", ")
          : "관심사에 맞는 새로운 경험과 배움을 추천해 줘.";
        startChat(q);
        return;
      }
      var newchat = e.target.closest("[data-lv-ai-newchat]");
      if (newchat) {
        e.preventDefault();
        var box = $("[data-lv-ai-msgs]");
        if (box) {
          box.innerHTML = "";
          appendMsg(box, "지금 어떤 생활을 준비하고 있나요? 궁금한 점을 입력하거나 아래 추천 질문을 눌러 보세요.", "is-bot");
          appendMsg(box, "참고: 실제 AI 응답 API는 아직 서버에 연결되지 않았습니다. 질문은 기록되며, 연동 후 답변·체크리스트·관련 콘텐츠가 표시됩니다.", "is-bot");
        }
        var chatInput = $("[data-lv-ai-chat-q]");
        if (chatInput) chatInput.value = "";
        return;
      }
      var save = e.target.closest("[data-lv-ai-save]");
      if (save) {
        e.preventDefault();
        var id = save.getAttribute("data-lv-ai-save");
        var label = save.getAttribute("data-lv-ai-label") || id;
        var list = readJSON(KEY_SAVED, []);
        if (!Array.isArray(list)) list = [];
        var exists = list.some(function (x) { return x.id === id; });
        var next = exists ? list.filter(function (x) { return x.id !== id; }) : list.concat([{ id: id, label: label, at: Date.now() }]).slice(0, 40);
        writeJSON(KEY_SAVED, next);
        try {
          var ml = readJSON("livon.mlInterests", []);
          if (!Array.isArray(ml)) ml = [];
          if (!exists && ml.indexOf(label) === -1) writeJSON("livon.mlInterests", ml.concat([label]).slice(0, 40));
        } catch (err) {}
        if (save.tagName === "BUTTON") {
          if (!save.getAttribute("data-lv-ai-label-default")) save.setAttribute("data-lv-ai-label-default", save.textContent.trim());
          save.textContent = exists ? save.getAttribute("data-lv-ai-label-default") : "저장됨";
        }
        return;
      }
    });

    $$("[data-lv-ai-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("[data-lv-ai-q], [data-lv-ai-chat-q]");
        startChat(input ? input.value : "");
        if (input && form.querySelector("[data-lv-ai-q]")) input.value = "";
      });
    });
  }

  function consumePendingPrompt() {
    try {
      var raw = sessionStorage.getItem("livon.aiPrompt");
      if (!raw) return;
      sessionStorage.removeItem("livon.aiPrompt");
      var data = JSON.parse(raw);
      if (data && data.q) setTimeout(function () { startChat(data.q); }, 80);
    } catch (e) {}
  }

  function onShow(hash) {
    consumePendingPrompt();
    if (!hash || hash === "livon-ai" || hash === "ai-hero") {
      window.scrollTo(0, 0);
      return;
    }
    if (hash.indexOf("ai-") === 0) setTimeout(function () { scrollToId(hash); }, 40);
  }

  function restoreFilters() {
    var selected = readJSON("livon.aiDiscoverFilters", []);
    if (!Array.isArray(selected)) return;
    $$("[data-lv-ai-filter]").forEach(function (b) {
      var on = selected.indexOf(b.getAttribute("data-lv-ai-filter")) >= 0;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.classList.toggle("is-on", on);
    });
  }

  function init() {
    if (!$("#livon-ai")) return;
    bindFilm();
    bindReveal();
    bindNav();
    bindClicks();
    setStage("20");
    restoreFilters();
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "livon-ai") onShow(hash || "livon-ai");
  }

  window.LivonAI = { onShow: onShow, startChat: startChat };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
