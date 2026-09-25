(function () {
  var KEY_STAGE = "livon.lifeStage";
  var KEY_SITUATIONS = "livon.lifeSituations";
  var KEY_INTERESTS = "livon.lifeInterests";
  var KEY_GOALS = "livon.lifeGoals";
  var KEY_EVENTS = "livon.lifeEvents";
  var KEY_SAVED = "livon.lifeSavedLocal";
  var KEY_AIQ = "livon.aiPrompt";
  var DATA = window.LivonLifeData || { stages: [], situations: [], interests: [], goals: [], transitions: [], packages: [], statusLabel: {} };
  var EVENT_DATA = window.LivonLifeEvents || { events: [], statusLabel: {}, stageGuides: {} };

  var CONNECT_MENUS = [
    {
      n: "01", label: "TODAY'S DISCOVERY", title: "평범한 오늘에, 새로운 발견을.",
      desc: "여행·문화·취미·새로운 활동 추천으로 일상에 경험을 더해 보세요.",
      feats: ["새로운 활동", "장소와 행사", "취미와 클래스", "관심 콘텐츠 저장"],
      href: "#today", cta: "둘러보기",
      wordmark: "DISCOVERY", slogan: "오늘, 새로운 일상을<br>발견하다.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260419_065931_e3ca7b53-d32e-4ad5-81de-dc9d6fcfda6d.mp4"
    },
    {
      n: "02", label: "MY LIFE", title: "복잡한 일상을, 나답게 정리하다.",
      desc: "일정·목표·기록·체크리스트·저장을 한곳에서 관리하세요.",
      feats: ["일정 및 할 일", "목표와 습관", "저장한 콘텐츠", "생활 계획 관리"],
      href: "#life-now", cta: "시작하기",
      wordmark: "MY LIFE", slogan: "나의 삶을 위한,<br>나만의 생활 공간.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
    },
    {
      n: "03", label: "EXPLORE", title: "필요한 사람과 서비스를, 한곳에서.",
      desc: "전문가·업체·기관·상품·공간을 찾고 비교해 보세요.",
      feats: ["전문가 찾기", "생활 서비스", "교육·클래스", "지역 정보"],
      href: "#explore", cta: "탐색하기",
      wordmark: "EXPLORE", slogan: "필요한 사람과 서비스,<br>한곳에서.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260819_212700_3bb9329b-5c50-4257-a09b-ca85cf3654a3.mp4"
    },
    {
      n: "04", label: "COMMUNITY", title: "서로의 이야기가, 새로운 일상이 되다.",
      desc: "질문·후기·경험을 나누고 관심사가 비슷한 사람들과 연결하세요.",
      feats: ["질문과 답변", "경험과 후기", "관심사별 커뮤니티", "모임과 챌린지"],
      href: "#community", cta: "둘러보기",
      wordmark: "COMMUNITY", slogan: "서로의 이야기가 모여,<br>새로운 일상이 되다.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
    },
    {
      n: "05", label: "LIVON AI", title: "일상의 질문부터, 앞으로의 계획까지.",
      desc: "선택한 단계·분야 맥락으로 대화형 지원을 이어갑니다.",
      feats: ["대화형 생활 안내", "생활 계획 생성", "체크리스트 정리", "LIVON 서비스 연결"],
      href: "#livon-ai", cta: "시작하기",
      wordmark: "LIVON AI", slogan: "지금의 삶에 필요한 정보부터,<br>다음 단계의 준비까지.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260411_104032_69319010-2458-492b-b04d-b40a5dfa4482.mp4"
    },
    {
      n: "06", label: "ONGIL", title: "시니어 생활과 가족을 연결하다.",
      desc: "시니어 생활 지원과 가족 돌봄 안내는 Ongil로 이어집니다.",
      feats: ["시니어 생활", "가족 돌봄", "생활 편의", "Ongil 연결"],
      href: "/ongil-start/#ongil-home", cta: "이동하기",
      wordmark: "ONGIL", slogan: "시니어 생활과<br>가족을 잇다.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4"
    }
  ];

  var state = {
    setupTab: "stage",
    activeField: null,
    stageId: null,
    viewStage: null,
    eventFilter: "all",
    openEventId: null,
    svcIdx: 0
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function stages() { return DATA.stages || []; }
  function stageById(id) {
    return stages().find(function (s) { return s.id === String(id); }) || null;
  }
  function statusLabel(key) {
    return (DATA.statusLabel && DATA.statusLabel[key]) || key || "안내";
  }
  function gnavOffset() {
    return (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h")) || 74) + 56;
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function resolveServices(stage, names) {
    var list = stage && stage.services ? stage.services : [];
    if (!names || !names.length) return list.slice(0, 6);
    return names.map(function (n) {
      return list.find(function (s) { return s.name === n; }) || {
        name: n,
        desc: "관련 생활 안내입니다.",
        feats: ["정보 안내"],
        audience: stage ? stage.label : "전체",
        status: "info",
        href: "#explore"
      };
    });
  }

  function prefs() {
    return {
      stage: readJSON(KEY_STAGE, null),
      situations: readJSON(KEY_SITUATIONS, []),
      interests: readJSON(KEY_INTERESTS, []),
      events: readJSON(KEY_EVENTS, []),
      goals: readJSON(KEY_GOALS, [])
    };
  }

  function savedList() {
    return readJSON(KEY_SAVED, []);
  }
  function isSaved(name) {
    return savedList().indexOf(name) >= 0;
  }
  function toggleSave(name) {
    var list = savedList();
    var i = list.indexOf(name);
    if (i >= 0) list.splice(i, 1);
    else list.push(name);
    writeJSON(KEY_SAVED, list);
    return list.indexOf(name) >= 0;
  }

  function linkHtml(links) {
    if (!links) return "";
    var items = [];
    if (links.explore) items.push('<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(links.explore) + '">탐색</a>');
    if (links.lifeNow) items.push('<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(links.lifeNow) + '">내 생활</a>');
    if (links.today) items.push('<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(links.today) + '">오늘의 발견</a>');
    if (links.community) items.push('<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(links.community) + '">커뮤니티</a>');
    if (links.ongil) items.push('<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(links.ongil) + '">Ongil</a>');
    if (links.ai) {
      items.push('<a class="lv-life-btn lv-life-btn--dark lv-life-btn--sm" href="#livon-ai" data-lv-life-aiq="' + esc(links.ai) + '">LIVON AI</a>');
    }
    return items.length ? '<div class="lv-life-svc__acts">' + items.join("") + "</div>" : "";
  }

  function svcCard(svc, stageId, opts) {
    opts = opts || {};
    var saved = isSaved(svc.name);
    var feats = (svc.feats || []).slice(0, 3).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    var href = svc.href || "#explore";
    var status = statusLabel(svc.status);
    return (
      '<article class="lv-life-svc">' +
        '<p class="lv-life-svc__n">' + esc(status) + " · " + esc(svc.audience || "전체") + "</p>" +
        "<h4>" + esc(svc.name) + "</h4>" +
        "<p>" + esc(svc.desc || "") + "</p>" +
        (feats ? "<ul>" + feats + "</ul>" : "") +
        (opts.why ? '<p class="lv-life-svc__why">' + esc(opts.why) + "</p>" : "") +
        '<div class="lv-life-svc__acts">' +
          '<a class="lv-life-btn lv-life-btn--dark lv-life-btn--sm" href="' + esc(href) + '">관련 서비스 이용하기</a>' +
          '<button type="button" class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" data-lv-life-save="' + esc(svc.name) + '">' + (saved ? "저장됨" : "저장하기") + "</button>" +
          '<button type="button" class="lv-life-btn lv-life-btn--ghost-ink lv-life-btn--sm" data-lv-life-share="' + esc(svc.name) + '">공유</button>' +
          (stageId ? '<a class="lv-life-btn lv-life-btn--ghost-ink lv-life-btn--sm" href="#livon-ai" data-lv-life-aiq="' + esc(svc.name + "에 대해 알려 줘.") + '" data-stage="' + esc(stageId) + '">AI에 묻기</a>' : "") +
        "</div>" +
      "</article>"
    );
  }

  function renderRail() {
    var rail = $("[data-lv-life-rail]");
    if (!rail) return;
    rail.innerHTML = stages().map(function (s) {
      var fields = (s.fields || []).slice(0, 3).map(function (f) { return esc(f.name); }).join(" · ");
      return (
        '<button type="button" class="lv-life-card" role="listitem" data-lv-life-goto="stage-' + esc(s.id) + '" data-stage="' + esc(s.id) + '">' +
          '<div class="lv-life-card__media"><img class="lv-life-card__img" src="' + esc(s.img) + '" alt="' + esc(s.alt || "") + '" loading="lazy" /></div>' +
          '<div class="lv-life-card__body">' +
            '<p class="lv-life-card__age">' + esc(s.label) + "</p>" +
            '<p class="lv-life-card__name">' + esc(s.title) + "</p>" +
            '<p class="lv-life-card__desc">' + esc(s.desc) + "</p>" +
            (fields ? '<p class="lv-life-card__focus">' + fields + "</p>" : "") +
            '<span class="lv-life-card__go">살펴보기</span>' +
          "</div>" +
        "</button>"
      );
    }).join("");
  }

  function renderStageNav() {
    var track = $("[data-lv-life-stage-nav]");
    if (!track) return;
    track.innerHTML = stages().map(function (s) {
      return '<button type="button" class="lv-life-sticky__link" data-lv-life-goto="stage-' + esc(s.id) + '" data-stage="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
  }

  function renderStageSwitch() {
    var host = $("[data-lv-life-switch]");
    if (!host) return;
    var active = state.viewStage || "10";
    host.innerHTML = stages().map(function (s) {
      var on = String(s.id) === String(active);
      return '<button type="button" role="tab" aria-selected="' + (on ? "true" : "false") + '"' +
        (on ? ' class="is-on"' : "") +
        ' data-lv-life-switch-btn="' + esc(s.id) + '" data-stage="' + esc(s.id) + '">' +
        esc(s.label) +
      "</button>";
    }).join("");
  }

  function showStageView(id, opts) {
    opts = opts || {};
    var list = stages();
    if (!list.length) return;
    if (!stageById(id)) id = list[0].id;
    state.viewStage = String(id);

    $$("[data-lv-life-stages] .lv-life-decade").forEach(function (sec) {
      var on = sec.getAttribute("data-stage") === String(id);
      sec.hidden = !on;
      if (on) {
        sec.classList.add("is-active-stage", "is-in");
      } else {
        sec.classList.remove("is-active-stage");
      }
    });

    $$("[data-lv-life-switch-btn]").forEach(function (btn) {
      var on = btn.getAttribute("data-lv-life-switch-btn") === String(id);
      if (on) btn.classList.add("is-on");
      else btn.classList.remove("is-on");
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    $$("[data-lv-life-stage-nav] [data-stage]").forEach(function (btn) {
      var on = btn.getAttribute("data-stage") === String(id);
      if (on) btn.classList.add("is-on");
      else btn.classList.remove("is-on");
    });

    if (opts.updateHash !== false) {
      var next = "#stage-" + id;
      if (location.hash !== next) history.replaceState(null, "", next);
    }
    if (opts.scroll) {
      requestAnimationFrame(function () { scrollToId("life-stages-view"); });
    }
  }


  function lifeEvents() { return EVENT_DATA.events || []; }
  function eventStatus(key) {
    return (EVENT_DATA.statusLabel && EVENT_DATA.statusLabel[key]) || (DATA.statusLabel && DATA.statusLabel[key]) || key || "안내";
  }
  function stageGuide(id) {
    return (EVENT_DATA.stageGuides && EVENT_DATA.stageGuides[id]) || { checklist: [], benefits: [], contents: [] };
  }
  function toggleLifeEvent(id) {
    var list = readJSON(KEY_EVENTS, []);
    if (!Array.isArray(list)) list = [];
    var i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    writeJSON(KEY_EVENTS, list.slice(0, 8));
    return list;
  }
  function renderLifeEvents() {
    var filters = $("[data-lv-life-event-filters]");
    var grid = $("[data-lv-life-event-grid]");
    var detail = $("[data-lv-life-event-detail]");
    if (!grid) return;
    var p = prefs();
    var stageId = p.stage ? String(p.stage) : (state.viewStage || "");
    var active = Array.isArray(p.events) ? p.events : [];
    if (filters) {
      var filtersList = [
        { id: "all", label: "전체" },
        { id: "mine", label: "내 선택" },
        { id: "stage", label: "내 연령대" }
      ];
      filters.innerHTML = filtersList.map(function (f) {
        return "<button type=\"button\" data-lv-life-event-filter=\"" + f.id + "\"" +
          (state.eventFilter === f.id ? " class=\"is-on\"" : "") + ">" + esc(f.label) + "</button>";
      }).join("");
    }
    var list = lifeEvents().filter(function (ev) {
      if (state.eventFilter === "mine") return active.indexOf(ev.id) >= 0;
      if (state.eventFilter === "stage" && stageId) return (ev.stages || []).indexOf(stageId) >= 0;
      return true;
    });
    if (!list.length) {
      grid.innerHTML = "<div class=\"lv-life-empty\">표시할 Life Event가 없습니다. 필터를 바꿔 보세요.</div>";
    } else {
      grid.innerHTML = list.map(function (ev, i) {
        var on = active.indexOf(ev.id) >= 0;
        return "<article class=\"lv-life-trans__card\">" +
          "<span class=\"lv-life-trans__n\" aria-hidden=\"true\">" + String(i + 1).padStart(2, "0") + "</span>" +
          "<h3>" + esc(ev.title) + (on ? " · 선택됨" : "") + (ev.planned ? " · 확장 예정" : "") + "</h3>" +
          "<p>" + esc(ev.blurb) + "</p>" +
          "<ol class=\"lv-life-trans__steps\">" + (ev.checklist || []).slice(0, 4).map(function (c, si) {
            return "<li><em>" + String(si + 1).padStart(2, "0") + "</em><span>" + esc(c) + "</span></li>";
          }).join("") + "</ol>" +
          "<div class=\"lv-life-svc__acts\">" +
            "<button type=\"button\" class=\"lv-life-btn lv-life-btn--" + (on ? "dark" : "outline") + " lv-life-btn--sm\" data-lv-life-event-toggle=\"" + esc(ev.id) + "\">" + (on ? "선택 해제" : "선택") + "</button>" +
            "<button type=\"button\" class=\"lv-life-btn lv-life-btn--outline lv-life-btn--sm\" data-lv-life-event-open=\"" + esc(ev.id) + "\">가이드 보기</button>" +
          "</div></article>";
      }).join("");
    }
    if (!detail) return;
    var openId = state.openEventId || (active[0] || null);
    var ev = openId ? lifeEvents().find(function (e) { return e.id === openId; }) : null;
    if (!ev) { detail.hidden = true; detail.innerHTML = ""; return; }
    detail.hidden = false;
    var proj = (window.LivonPlatform && window.LivonPlatform.getEventProgress) ? window.LivonPlatform.getEventProgress(ev.id) : null;
    var pct = (proj && window.LivonPlatform.progressPercent) ? window.LivonPlatform.progressPercent(proj) : 0;
    var areasHtml = "";
    if (proj && proj.areas) {
      areasHtml = "<h4 class=\"lv-life-title lv-life-title--md\">준비 영역 · 진행률 " + pct + "%</h4>" +
        (proj.areas || []).map(function (a) {
          return "<div style=\"margin:0.75rem 0 1rem\"><strong>" + esc(a.title) + "</strong>" +
            "<ul class=\"lv-life-pack__includes\">" + (a.items || []).map(function (it, ii) {
              return "<li><label><input type=\"checkbox\" data-lv-le-item=\"" + esc(ev.id) + "\" data-area=\"" + esc(a.id) + "\" data-idx=\"" + ii + "\"" + (it.done ? " checked" : "") + " /> " + esc(it.text) + "</label></li>";
            }).join("") + "</ul></div>";
        }).join("");
    }
    detail.innerHTML =
      "<article class=\"lv-life-pack\" style=\"margin-top:1.5rem\">" +
        "<p class=\"lv-life-pack__eyebrow\">Life Event Project</p>" +
        "<h3>" + esc(ev.title) + (ev.planned ? " · 확장 예정" : "") + "</h3>" +
        "<p class=\"lv-life-pack__for\">" + esc(ev.blurb) + "</p>" +
        "<p class=\"lv-life-pack__note\">체크리스트·일정·콘텐츠·서비스를 한 프로젝트처럼 연결합니다. 예약·결제는 없습니다.</p>" +
        areasHtml +
        "<h4 class=\"lv-life-title lv-life-title--md\">연결</h4>" +
        "<ul class=\"lv-life-pack__includes\">" + (ev.resources || []).map(function (r) {
          var st = eventStatus(r.status);
          var soon = r.status === "soon" || r.status === "planned";
          return "<li>" + esc(st) + " · " + (soon ? esc(r.label) : ("<a href=\"" + esc(r.href || "#") + "\">" + esc(r.label) + "</a>")) + "</li>";
        }).join("") + "</ul>" +
        "<div class=\"lv-life-svc__acts\">" +
          (ev.links && ev.links.lifeNow ? "<a class=\"lv-life-btn lv-life-btn--dark\" href=\"" + esc(ev.links.lifeNow) + "\">일정·할 일</a>" : "<a class=\"lv-life-btn lv-life-btn--dark\" href=\"#life-now\">내 생활</a>") +
          (ev.links && ev.links.explore ? "<a class=\"lv-life-btn lv-life-btn--outline\" href=\"" + esc(ev.links.explore) + "\">탐색</a>" : "") +
          (ev.links && ev.links.community ? "<a class=\"lv-life-btn lv-life-btn--outline\" href=\"" + esc(ev.links.community) + "\">커뮤니티</a>" : "") +
          (ev.links && ev.links.today ? "<a class=\"lv-life-btn lv-life-btn--outline\" href=\"" + esc(ev.links.today) + "\">콘텐츠</a>" : "<a class=\"lv-life-btn lv-life-btn--outline\" href=\"#today\">콘텐츠</a>") +
          (ev.links && ev.links.ai ? "<button type=\"button\" class=\"lv-life-btn lv-life-btn--outline\" data-lv-life-ai=\"" + esc(ev.links.ai) + "\">LIVON AI</button>" : "") +
          "<button type=\"button\" class=\"lv-life-btn lv-life-btn--outline\" data-lv-le-save=\"" + esc(ev.id) + "\">저장</button>" +
        "</div></article>";
  }

  function renderStages() {
    var host = $("[data-lv-life-stages]");
    if (!host) return;
    host.innerHTML = stages().map(function (s) {
      var meta =
        '<div class="lv-life-decade__meta">' +
          "<div><p>FOCUS</p><strong>" + esc(s.focus) + "</strong></div>" +
          "<div><p>FIELDS</p><strong>" + esc(String((s.fields || []).length)) + "개 생활 분야</strong></div>" +
        "</div>";
      var fields =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Life Fields</p><h3 class="lv-life-title lv-life-title--md">생활 분야</h3></div>' +
        '<div class="lv-life-fields" data-lv-life-fields="' + esc(s.id) + '">' +
          (s.fields || []).map(function (f) {
            return '<button type="button" data-field="' + esc(f.id) + '" data-stage="' + esc(s.id) + '">' + esc(f.name) + "</button>";
          }).join("") +
        "</div>";
      var services =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Services</p><h3 class="lv-life-title lv-life-title--md">관련 생활 서비스</h3></div>' +
        '<div class="lv-life-services is-trio">' +
          (s.services || []).map(function (svc) { return svcCard(svc, s.id); }).join("") +
        "</div>";
      var heroImg = '<div class="lv-life-decade__show"><img src="' + esc(s.img) + '" alt="' + esc(s.alt || "") + '" loading="lazy" /></div>';
      var copy =
        '<div class="lv-life-decade__copy">' +
          '<p class="lv-life-decade__n">' + esc(s.n) + " · " + esc(s.label) + "</p>" +
          '<h2 class="lv-life-title">' + esc(s.title) + "</h2>" +
          '<p class="lv-life-lead">' + esc(s.lead) + "</p>" +
          meta +
        "</div>";
      var top = '<div class="lv-life-decade__split">' + copy + heroImg + "</div>";
      var guide = stageGuide(s.id);
      var stageEvs = lifeEvents().filter(function (ev) { return (ev.stages || []).indexOf(s.id) >= 0; }).slice(0, 6);
      var eventsBlock =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Life Event</p><h3 class="lv-life-title lv-life-title--md">많이 겪는 Life Event</h3></div>' +
        '<div class="lv-life-fields">' + stageEvs.map(function (ev) {
          return '<button type="button" data-lv-life-open-event="' + esc(ev.id) + '">' + esc(ev.title) + "</button>";
        }).join("") + "</div>" +
        '<p class="lv-life-note"><a href="#life-events">전체 Life Event에서 선택·가이드 보기</a></p>';
      var checks = (guide.checklist && guide.checklist.length) ? guide.checklist : (s.fields || []).slice(0, 2).reduce(function (acc, f) {
        return acc.concat((f.steps || []).slice(0, 2));
      }, []).slice(0, 6);
      var checkBlock =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Checklist</p><h3 class="lv-life-title lv-life-title--md">생활 체크리스트</h3></div>' +
        '<ol class="lv-life-trans__steps">' + checks.map(function (c, si) {
          return "<li><em>" + String(si + 1).padStart(2, "0") + "</em><span>" + esc(c) + "</span></li>";
        }).join("") + "</ol>" +
        '<p class="lv-life-note"><a href="#life-now">내 생활에서 할 일로 관리</a> · 자동 완료 추적은 준비 중</p>';
      var contentBlock =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Content</p><h3 class="lv-life-title lv-life-title--md">추천 콘텐츠</h3></div>' +
        '<div class="lv-life-aiq">' + (guide.contents || []).map(function (c) {
          return '<a href="' + esc(c.href) + '">' + esc(c.label) + "</a>";
        }).join("") + "</div>";
      var benefitBlock =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Benefits</p><h3 class="lv-life-title lv-life-title--md">받을 수 있는 혜택 · 안내</h3></div>' +
        '<ul class="lv-life-pack__includes">' + (guide.benefits || []).map(function (b) {
          var st = eventStatus(b.status);
          var soon = b.status === "soon" || b.status === "planned";
          return "<li>" + esc(st) + " · " + (soon || !b.href ? esc(b.label) : ("<a href=\"" + esc(b.href) + "\">" + esc(b.label) + "</a>")) + "</li>";
        }).join("") + "</ul>" +
        '<p class="lv-life-note">자격·신청은 기관 공식 기준입니다.</p>';
      var ai =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Popular</p><h3 class="lv-life-title lv-life-title--md">인기 질문</h3></div>' +
        '<div class="lv-life-aiq">' +
          (s.ai || []).map(function (q) {
            return '<a href="#livon-ai" data-lv-life-aiq="' + esc(q) + '" data-stage="' + esc(s.id) + '">' + esc(q) + "</a>";
          }).join("") +
        "</div>";
      var community =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Community</p><h3 class="lv-life-title lv-life-title--md">관련 커뮤니티</h3></div>' +
        '<p class="lv-life-note">' + esc(s.community || "관련 이야기") +
        ' — <a href="#community">게시판으로 이동</a> · 오프라인 모임 매칭은 확장 예정</p>';

      return (
        '<section class="lv-life-sec lv-life-decade" id="stage-' + esc(s.id) + '" data-stage="' + esc(s.id) + '" hidden>' +
          top + fields + eventsBlock + checkBlock + contentBlock + services + benefitBlock + ai + community +
        "</section>"
      );
    }).join("");

    renderStageSwitch();
    var initial = "10";
    if (location.hash.indexOf("#stage-") === 0) {
      initial = location.hash.replace("#stage-", "");
    } else if (state.viewStage) {
      initial = state.viewStage;
    } else {
      initial = readJSON(KEY_STAGE, null) || "10";
    }
    if (!stageById(initial)) initial = "10";
    state.viewStage = String(initial);
    renderStageSwitch();
    showStageView(initial, { updateHash: false });
  }

  function renderSetupPanel() {
    var panel = $("[data-lv-setup-panel]");
    if (!panel) return;
    var p = prefs();
    var html = "";
    if (state.setupTab === "stage") {
      html = '<div class="lv-life-chips" role="group" aria-label="생애 단계">' +
        stages().map(function (s) {
          return '<button type="button" data-setup-stage="' + esc(s.id) + '"' + (p.stage === s.id ? ' class="is-on"' : "") + ">" + esc(s.label) + " · " + esc(s.title) + "</button>";
        }).join("") + "</div>";
    } else if (state.setupTab === "situation") {
      html = '<div class="lv-life-chips" role="group" aria-label="생활 상황">' +
        (DATA.situations || []).map(function (v) {
          return '<button type="button" data-setup-multi="situation" data-val="' + esc(v) + '"' + (p.situations.indexOf(v) >= 0 ? ' class="is-on"' : "") + ">" + esc(v) + "</button>";
        }).join("") + "</div>";
    } else if (state.setupTab === "interest") {
      html = '<div class="lv-life-chips" role="group" aria-label="관심 분야">' +
        (DATA.interests || []).map(function (v) {
          return '<button type="button" data-setup-multi="interest" data-val="' + esc(v) + '"' + (p.interests.indexOf(v) >= 0 ? ' class="is-on"' : "") + ">" + esc(v) + "</button>";
        }).join("") + "</div>";
    } else {
      html = '<div class="lv-life-chips" role="group" aria-label="현재 목표">' +
        (DATA.goals || []).map(function (v) {
          return '<button type="button" data-setup-multi="goal" data-val="' + esc(v) + '"' + (p.goals.indexOf(v) >= 0 ? ' class="is-on"' : "") + ">" + esc(v) + "</button>";
        }).join("") + "</div>";
    }
    panel.innerHTML = html + '<p class="lv-life-note">복수 선택 가능 · 언제든 수정 · 개인정보를 추가로 요구하지 않습니다.</p>';
  }

  function scoreService(svc, stage, p) {
    var score = 0;
    var reasons = [];
    if (p.stage && stage && stage.id === p.stage) {
      score += 3;
      reasons.push(stage.label + " 선택");
    }
    var blob = (svc.name + " " + (svc.desc || "") + " " + (svc.audience || "")).toLowerCase();
    (p.interests || []).forEach(function (it) {
      if (blob.indexOf(it.toLowerCase()) >= 0 || (stage && (stage.focus || "").indexOf(it) >= 0)) {
        score += 2;
        reasons.push("관심: " + it);
      }
    });
    (p.situations || []).forEach(function (sit) {
      if (blob.indexOf(sit.split("·")[0]) >= 0) {
        score += 2;
        reasons.push("상황: " + sit);
      }
    });
    (p.goals || []).forEach(function (g) {
      if (blob.indexOf(g.split("·")[0]) >= 0) {
        score += 1;
        reasons.push("목표: " + g);
      }
    });
    return { score: score, reasons: reasons.slice(0, 2) };
  }

  function renderPriority() {
    var host = $("[data-lv-life-priority]");
    var why = $("[data-lv-life-why]");
    if (!host) return;
    var p = prefs();
    var scored = [];
    stages().forEach(function (st) {
      (st.services || []).forEach(function (svc) {
        var r = scoreService(svc, st, p);
        if (r.score > 0) scored.push({ svc: svc, stage: st, score: r.score, reasons: r.reasons });
      });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    scored = scored.slice(0, 6);
    if (!scored.length) {
      host.innerHTML = '<div class="lv-life-empty">아직 우선 노출할 항목이 없습니다. 위에서 생애 단계나 관심 분야를 선택해 보세요.</div>';
      if (why) why.textContent = "맞춤 설정을 적용하면 추천 이유가 여기에 표시됩니다.";
      return;
    }
    if (why) {
      var bits = [];
      if (p.stage) bits.push(stageById(p.stage) ? stageById(p.stage).label : p.stage);
      if (p.situations.length) bits.push(p.situations.slice(0, 2).join(", "));
      if (p.interests.length) bits.push(p.interests.slice(0, 2).join(", "));
      why.textContent = "우선 기준: " + (bits.join(" · ") || "선택값") + " (규칙 기반)";
    }
    host.innerHTML = '<div class="lv-life-services is-trio">' +
      scored.map(function (item) {
        return svcCard(item.svc, item.stage.id, {
          why: "이유 · " + (item.reasons.join(" · ") || item.stage.label)
        });
      }).join("") +
    "</div>";
  }

  function renderTransitions() {
    var host = $("[data-lv-life-transitions]");
    if (!host) return;
    host.innerHTML = (DATA.transitions || []).map(function (t, i) {
      return (
        '<article class="lv-life-trans__card">' +
          '<span class="lv-life-trans__n" aria-hidden="true">' + String(i + 1).padStart(2, "0") + "</span>" +
          "<h3>" + esc(t.title) + "</h3>" +
          "<p>" + esc(t.desc) + "</p>" +
          '<ol class="lv-life-trans__steps">' +
            (t.steps || []).map(function (s, si) {
              return "<li><em>" + String(si + 1).padStart(2, "0") + "</em><span>" + esc(s) + "</span></li>";
            }).join("") +
          "</ol>" +
          linkHtml(t.links) +
        "</article>"
      );
    }).join("");
  }

  function renderConnectShowcase() {
    var tabs = $("[data-lv-life-svc-tabs]");
    var panel = $("[data-lv-life-svc-panel]");
    if (!tabs || !panel) return;
    var idx = state.svcIdx || 0;
    if (idx < 0 || idx >= CONNECT_MENUS.length) idx = 0;
    state.svcIdx = idx;
    var s = CONNECT_MENUS[idx];
    tabs.innerHTML = CONNECT_MENUS.map(function (m, i) {
      return '<button type="button" role="tab" data-lv-life-svc="' + i + '"' +
        (i === idx ? ' class="is-on" aria-selected="true"' : ' aria-selected="false"') + ">" +
        "<em>" + esc(m.n) + "</em><span>" + esc(m.label) + "</span></button>";
    }).join("");
    panel.innerHTML =
      '<div class="lv-life-svc-card">' +
        '<div class="lv-life-svc-card__copy">' +
          '<p class="lv-life-eyebrow">' + esc(s.n) + " · " + esc(s.label) + "</p>" +
          "<h3>" + esc(s.title) + "</h3>" +
          "<p>" + esc(s.desc) + "</p>" +
          "<ul>" + s.feats.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
          '<a class="lv-life-btn" href="' + esc(s.href) + '">' + esc(s.cta) + "</a>" +
        "</div>" +
        '<div class="lv-life-svc-card__film">' +
          '<video class="lv-life-svc-card__video" muted loop playsinline autoplay preload="metadata" src="' + esc(s.video) + '"></video>' +
          '<div class="lv-life-svc-card__veil" aria-hidden="true"></div>' +
          '<div class="lv-life-svc-card__lockup">' +
            '<p class="lv-life-svc-card__wordmark">' + esc(s.wordmark) + "</p>" +
            '<p class="lv-life-svc-card__slogan">' + s.slogan + "</p>" +
          "</div>" +
        "</div>" +
      "</div>";
    var vid = panel.querySelector(".lv-life-svc-card__video");
    if (vid && typeof vid.play === "function") {
      var p = vid.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    }
  }

  function renderPackages() {
    var host = $("[data-lv-life-packages]");
    if (!host) return;
    host.innerHTML = (DATA.packages || []).map(function (pk, i) {
      return (
        '<article class="lv-life-pack' + (i % 3 === 0 ? " is-accent" : "") + '">' +
          '<p class="lv-life-pack__eyebrow">Guide package</p>' +
          "<h3>" + esc(pk.title) + "</h3>" +
          '<p class="lv-life-pack__for">' + esc(pk.for) + "</p>" +
          '<p class="lv-life-pack__note">포함 안내 · 결제·예약 없음</p>' +
          '<ul class="lv-life-pack__includes">' +
            (pk.services || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
          "</ul>" +
          '<ol class="lv-life-pack__steps">' +
            (pk.steps || []).map(function (s, si) {
              return "<li><em>" + String(si + 1).padStart(2, "0") + "</em><span>" + esc(s) + "</span></li>";
            }).join("") +
          "</ol>" +
          linkHtml(pk.links) +
        "</article>"
      );
    }).join("");
  }

  function layoutClass(layout) {
    if (layout === "edu") return "is-edu";
    if (layout === "travel") return "is-travel";
    if (layout === "home" || layout === "housing") return "is-home";
    if (layout === "finance") return "is-finance";
    if (layout === "health") return "is-health";
    return "is-info";
  }

  function showField(stageId, fieldId) {
    var stage = stageById(stageId);
    if (!stage) return;
    var field = (stage.fields || []).find(function (f) { return f.id === fieldId; });
    if (!field) return;
    state.activeField = { stageId: stageId, fieldId: fieldId };
    var sec = $("#life-field");
    var view = $("[data-lv-life-field-view]");
    if (!sec || !view) return;
    sec.hidden = false;
    sec.classList.add("is-in");

    var svcs = resolveServices(stage, field.services);
    var related = (stage.fields || []).filter(function (f) { return f.id !== field.id; }).slice(0, 4);

    view.innerHTML =
      '<div class="lv-life-field__inner ' + layoutClass(field.layout) + '">' +
        '<button type="button" class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" data-lv-field-close>닫기</button>' +
        '<p class="lv-life-kicker">' + esc(stage.label) + " · Life Field</p>" +
        '<h2 class="lv-life-title">' + esc(field.name) + "</h2>" +
        '<p class="lv-life-lead">' + esc(field.blurb) + "</p>" +
        '<div class="lv-life-field__grid">' +
          '<div>' +
            '<h3 class="lv-life-title lv-life-title--md">주요 생활 상황</h3>' +
            '<ul class="lv-life-chips lv-life-chips--static">' +
              (field.situations || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
            "</ul>" +
            '<h3 class="lv-life-title lv-life-title--md" style="margin-top:1.75rem">단계별 준비 가이드</h3>' +
            '<ol class="lv-life-steps">' +
              (field.steps || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
            "</ol>" +
          "</div>" +
          '<aside class="lv-life-field__aside">' +
            "<p><strong>탐색</strong><br>전문가·업체·기관은 탐색 메뉴에서 연결합니다.</p>" +
            "<p><strong>내 생활</strong><br>일정·목표·체크리스트는 내 생활에서 관리합니다.</p>" +
            "<p><strong>커뮤니티</strong><br>경험·질문은 커뮤니티에서 나눕니다.</p>" +
            "<p><strong>LIVON AI</strong><br>맞춤 계획은 대화로 이어갑니다.</p>" +
            linkHtml(field.links) +
          "</aside>" +
        "</div>" +
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Related services</p><h3 class="lv-life-title lv-life-title--md">관련 생활 서비스</h3></div>' +
        '<div class="lv-life-services">' + svcs.map(function (svc) { return svcCard(svc, stage.id); }).join("") + "</div>" +
        (related.length
          ? '<div class="lv-life-block-label"><p class="lv-life-kicker">More fields</p><h3 class="lv-life-title lv-life-title--md">연관 생활 분야</h3></div>' +
            '<div class="lv-life-fields">' +
              related.map(function (f) {
                return '<button type="button" data-field="' + esc(f.id) + '" data-stage="' + esc(stage.id) + '">' + esc(f.name) + "</button>";
              }).join("") +
            "</div>"
          : "") +
      "</div>";

    history.replaceState(null, "", "#field-" + stageId + "-" + fieldId);
    document.documentElement.dataset.lvView = "life";
    requestAnimationFrame(function () { scrollToId("life-field"); });
    bindDynamic(view);
  }

  function hideField() {
    var sec = $("#life-field");
    if (sec) sec.hidden = true;
    state.activeField = null;
  }

  function updateStageLabel() {
    var id = readJSON(KEY_STAGE, null);
    state.stageId = id;
    var label = $("[data-lv-life-stage-label]");
    var st = stageById(id);
    if (label) label.textContent = "선택된 라이프 스테이지: " + (st ? st.label + " · " + st.title : "없음");
    /* Prefer preference chips only — do not override the stage view switcher */
    $$("[data-setup-stage]").forEach(function (el) {
      el.classList.toggle("is-on", el.getAttribute("data-setup-stage") === String(id));
    });
    $$("[data-lv-life-rail] [data-stage]").forEach(function (el) {
      el.classList.toggle("is-on", el.getAttribute("data-stage") === String(id));
    });
  }

  function setStage(id, opts) {
    opts = opts || {};
    if (id) writeJSON(KEY_STAGE, String(id));
    updateStageLabel();
    if (id) {
      document.documentElement.dataset.lvView = "life";
      showStageView(id, { updateHash: !!opts.goto || opts.updateHash === true, scroll: !!opts.goto });
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
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function stickyObserve() {
    var sticky = $("[data-lv-life-sticky]");
    var hero = $("[data-lv-life-hero]");
    if (!sticky || !hero) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        sticky.classList.toggle("is-show", !e.isIntersecting);
      });
    }, { threshold: 0.05 });
    io.observe(hero);
  }

  function bindDynamic(root) {
    root = root || document;
    $$("[data-lv-life-aiq]", root).forEach(function (link) {
      if (link._bound) return;
      link._bound = true;
      link.addEventListener("click", function () {
        var q = link.getAttribute("data-lv-life-aiq") || "";
        var stage = link.getAttribute("data-stage") || readJSON(KEY_STAGE, "");
        try {
          sessionStorage.setItem(KEY_AIQ, JSON.stringify({ q: q, stage: stage, at: Date.now() }));
        } catch (e) {}
      });
    });
    $$("[data-lv-life-save]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-lv-life-save");
        var on = toggleSave(name);
        btn.textContent = on ? "저장됨" : "저장하기";
        openLoginNotice("관심 서비스는 이 기기에 저장됩니다. 계정 동기화·클라우드 저장은 아직 연결되지 않았습니다.");
      });
    });
    $$("[data-lv-life-share]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-lv-life-share") || "LIVON 라이프 스테이지";
        var url = location.origin + location.pathname + "#life";
        if (navigator.share) {
          navigator.share({ title: name, url: url }).catch(function () {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            openLoginNotice("링크가 복사되었습니다. 공유 기능은 기기에서 지원하는 범위로 제공됩니다.");
          });
        } else {
          openLoginNotice("이 환경에서는 공유 API를 사용할 수 없습니다. 주소창의 링크를 복사해 주세요.");
        }
      });
    });
    $$("[data-field]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        showField(btn.getAttribute("data-stage"), btn.getAttribute("data-field"));
      });
    });

    $$("[data-lv-life-event-filter]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        state.eventFilter = btn.getAttribute("data-lv-life-event-filter") || "all";
        try {
      var openEv = sessionStorage.getItem("livon.openLifeEvent");
      if (openEv) { state.openEventId = openEv; sessionStorage.removeItem("livon.openLifeEvent"); }
    } catch (e) {}
    renderLifeEvents();
        bindDynamic(document.querySelector("#life-events") || document);
      });
    });
    $$("[data-lv-life-event-toggle]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        toggleLifeEvent(btn.getAttribute("data-lv-life-event-toggle"));
        renderLifeEvents();
        bindDynamic(document.querySelector("#life-events") || document);
      });
    });
    $$("[data-lv-life-event-open], [data-lv-life-open-event]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        state.openEventId = btn.getAttribute("data-lv-life-event-open") || btn.getAttribute("data-lv-life-open-event");
        renderLifeEvents();
        bindDynamic(document.querySelector("#life-events") || document);
        scrollToId("life-events");
      });
    });
    $$("[data-lv-life-ai]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        var q = btn.getAttribute("data-lv-life-ai") || "";
        try { sessionStorage.setItem(KEY_AIQ, JSON.stringify({ q: q, stage: readJSON(KEY_STAGE, ""), at: Date.now(), source: "life-event" })); } catch (e) {}
        location.hash = "livon-ai";
      });
    });

    $$("[data-lv-field-close]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", hideField);
    });
    $$("[data-lv-life-goto]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        var id = (btn.getAttribute("data-lv-life-goto") || "").replace("stage-", "");
        setStage(id, { goto: true });
      });
    });
    $$("[data-lv-life-switch-btn]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-lv-life-switch-btn");
        setStage(id, { goto: true, updateHash: true });
      });
    });
  }

  function bindSetup() {
    $$("[data-lv-setup-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.setupTab = btn.getAttribute("data-lv-setup-tab");
        $$("[data-lv-setup-tab]").forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-on", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        renderSetupPanel();
      });
    });
    var panel = $("[data-lv-setup-panel]");
    if (panel) {
      panel.addEventListener("click", function (e) {
        var t = e.target.closest("[data-setup-stage]");
        if (t) {
          setStage(t.getAttribute("data-setup-stage"), { goto: false });
          renderSetupPanel();
          return;
        }
        var m = e.target.closest("[data-setup-multi]");
        if (m) {
          var kind = m.getAttribute("data-setup-multi");
          var val = m.getAttribute("data-val");
          var key = kind === "situation" ? KEY_SITUATIONS : kind === "interest" ? KEY_INTERESTS : KEY_GOALS;
          var list = readJSON(key, []);
          var i = list.indexOf(val);
          if (i >= 0) list.splice(i, 1); else list.push(val);
          writeJSON(key, list);
          renderSetupPanel();
        }
      });
    }
    var skip = $("[data-lv-setup-skip]");
    if (skip) skip.addEventListener("click", function () { scrollToId("life-explore"); });
    var reset = $("[data-lv-setup-reset]");
    if (reset) reset.addEventListener("click", function () {
      writeJSON(KEY_STAGE, null);
      writeJSON(KEY_SITUATIONS, []);
      writeJSON(KEY_INTERESTS, []);
      writeJSON(KEY_GOALS, []);
      updateStageLabel();
      renderSetupPanel();
      renderPriority();
    });
    var apply = $("[data-lv-setup-apply]");
    if (apply) apply.addEventListener("click", function () {
      renderPriority();
      scrollToId("life-mine");
      var p = prefs();
      if (p.stage) setStage(p.stage, { goto: false });
    });
  }

  function bind() {
    var switchHost = $("[data-lv-life-switch]");
    if (switchHost && !switchHost._boundSwitch) {
      switchHost._boundSwitch = true;
      switchHost.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-lv-life-switch-btn]");
        if (!btn || !switchHost.contains(btn)) return;
        var id = btn.getAttribute("data-lv-life-switch-btn");
        setStage(id, { goto: true, updateHash: true });
      });
    }
    var showcase = $("[data-lv-life-showcase]");
    if (showcase && !showcase._boundSvc) {
      showcase._boundSvc = true;
      showcase.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-lv-life-svc]");
        if (!btn || !showcase.contains(btn)) return;
        state.svcIdx = Number(btn.getAttribute("data-lv-life-svc")) || 0;
        renderConnectShowcase();
      });
    }
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
          document.documentElement.dataset.lvView = "life";
          scrollToId(href.slice(1));
        }
      });
    });
    var ageModal = $("#lv-life-age-modal");
    if (ageModal) {
      ageModal.querySelectorAll("[data-age]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-age");
          closeModal();
          setStage(id, { goto: true });
          renderSetupPanel();
          renderPriority();
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
      if (e.key === "Escape") { closeModal(); closeLoginNotice(); hideField(); }
    });
  }

  function bootRender() {
    renderStageNav();
    renderRail();
    renderStages();
    renderLifeEvents();
    renderSetupPanel();
    renderPriority();
    renderTransitions();
    renderConnectShowcase();
    renderPackages();
    bindDynamic(document);
  }

  window.LivonLife = {
    setStage: setStage,
    scrollToId: scrollToId,
    isLifeHash: function (hash) {
      return hash === "life" ||
        hash === "life-stages" ||
        hash.indexOf("stage-") === 0 ||
        hash.indexOf("field-") === 0 ||
        (hash.indexOf("life-") === 0 && hash !== "life-now");
    },
    onShow: function (hash) {
      initHero();
      updateStageLabel();
      $$("#life [data-lv-reveal]").forEach(function (n) {
        if (n.getBoundingClientRect().top < window.innerHeight * 1.2) n.classList.add("is-in");
      });
      if (hash.indexOf("field-") === 0) {
        var parts = hash.replace("field-", "").split("-");
        if (parts.length >= 2) showField(parts[0], parts.slice(1).join("-"));
        return;
      }
      var stage = null;
      if (hash.indexOf("stage-") === 0) stage = hash.replace("stage-", "");
      else stage = state.viewStage || readJSON(KEY_STAGE, null) || "10";
      showStageView(stage, { updateHash: hash.indexOf("stage-") === 0, scroll: false });
      if (hash.indexOf("stage-") === 0) {
        setTimeout(function () {
          scrollToId("life-stages-view");
          var panel = document.getElementById("life-stages-view");
          if (panel) panel.classList.add("is-in");
        }, 50);
      } else if (hash === "life-transitions") {
        scrollToId("life-events");
      } else if (hash === "life-explore" || hash === "life-mine" || hash === "life-setup" || hash === "life-events" || hash === "life-packages" || hash === "life-family" || hash === "life-services" || hash === "life-ai" || hash === "life-cta" || hash === "life-field" || hash === "life-stages-view") {
        setTimeout(function () {
          scrollToId(hash);
          var target = document.getElementById(hash);
          if (target) target.classList.add("is-in");
        }, 50);
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!DATA.stages || !DATA.stages.length) {
      console.warn("[LivonLife] life-data missing");
    }
    bootRender();
    initHero();
    initReveal();
    stickyObserve();
    bindSetup();
    bind();
    updateStageLabel();
  });
})();
