(function () {
  var KEY_STAGE = "livon.lifeStage";
  var KEY_INTERESTS = "livon.lifeInterests";
  var KEY_ML = "livon.mlStore.v1";
  var KEY_TD_SAVED = "livon.tdSaved";
  var KEY_AIQ = "livon.aiPrompt";
  var KEY_REGION = "livon.hmRegion";

  var STAGES = [
    { id: "10", label: "10대", title: "성장과 발견", desc: "나를 알아가고 미래를 그리는 시간.", keys: "학습 · 진로 · 취미", img: "/livon/assets/topics/students.jpg" },
    { id: "20", label: "20대", title: "독립과 도전", desc: "새로운 경험으로 나만의 삶을 만들어가는 시간.", keys: "독립 · 커리어 · 경험", img: "/livon/assets/topics/twenties.jpg" },
    { id: "30", label: "30대", title: "성장과 균형", desc: "일과 일상의 균형을 만들어가는 시간.", keys: "커리어 · 주거 · 가족", img: "/livon/assets/topics/housing.jpg" },
    { id: "40", label: "40대", title: "안정과 확장", desc: "나와 가족의 삶을 함께 설계하는 시간.", keys: "일상 · 가족 · 자기계발", img: "/livon/assets/topics/forties.jpg" },
    { id: "50", label: "50대", title: "전환과 재발견", desc: "다음 삶의 가능성을 발견하는 시간.", keys: "새로운 도전 · 건강 · 여가", img: "/livon/assets/topics/fifties.jpg" },
    { id: "60", label: "60대", title: "새로운 시작", desc: "나를 위한 새로운 일상을 시작하는 시간.", keys: "배움 · 취미 · 지역 활동", img: "/livon/assets/topics/senior.jpg" },
    { id: "70", label: "70대 이상", title: "여유와 연결", desc: "나답게, 편안하게, 함께하는 시간.", keys: "일상 · 취미 · 가족 · 지역 활동", img: "/livon/assets/topics/senior.jpg" }
  ];

  var SERVICES = [
    {
      id: "life", n: "01", label: "LIFE STAGE", title: "지금의 나에게 필요한 다음을.",
      desc: "10대부터 70대 이후까지. 생애 단계별 생활 정보와 준비 과정을 탐색하세요.",
      feats: ["생애 단계별 생활 가이드", "주요 생활 주제", "상황별 준비 정보", "관련 서비스 연결"],
      href: "#life", cta: "라이프 스테이지 살펴보기",
      wordmark: "LIFE STAGE", slogan: "삶의 모든 단계에,<br>필요한 다음을.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4"
    },
    {
      id: "today", n: "02", label: "TODAY'S DISCOVERY", title: "평범한 오늘에, 새로운 발견을.",
      desc: "관심사에 맞는 장소와 활동, 행사와 배움을 찾아 일상에 새로운 경험을 더해 보세요.",
      feats: ["새로운 활동", "장소와 행사", "취미와 클래스", "관심 콘텐츠 저장"],
      href: "#today", cta: "오늘의 발견 시작하기",
      wordmark: "DISCOVERY", slogan: "오늘, 새로운 일상을<br>발견하다.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260419_065931_e3ca7b53-d32e-4ad5-81de-dc9d6fcfda6d.mp4"
    },
    {
      id: "life-now", n: "03", label: "MY LIFE", title: "복잡한 일상을, 나답게 정리하다.",
      desc: "일정과 목표, 할 일과 저장한 콘텐츠를 한곳에서 관리하세요.",
      feats: ["일정 및 할 일", "목표와 습관", "저장한 콘텐츠", "생활 계획 관리"],
      href: "#life-now", cta: "내 생활 열기",
      wordmark: "MY LIFE", slogan: "나의 삶을 위한,<br>나만의 생활 공간.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
    },
    {
      id: "explore", n: "04", label: "EXPLORE", title: "필요한 사람과 서비스를, 한곳에서.",
      desc: "전문가와 생활 서비스, 교육과 지역 정보를 찾고 비교해 보세요.",
      feats: ["전문가 찾기", "생활 서비스 탐색", "교육·클래스", "지역 정보"],
      href: "#explore", cta: "탐색 시작하기",
      wordmark: "EXPLORE", slogan: "필요한 사람과 서비스,<br>한곳에서.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260819_212700_3bb9329b-5c50-4257-a09b-ca85cf3654a3.mp4"
    },
    {
      id: "community", n: "05", label: "COMMUNITY", title: "서로의 이야기가, 새로운 일상이 되다.",
      desc: "일상의 질문과 경험을 나누고, 관심사가 비슷한 사람들과 연결되어 보세요.",
      feats: ["질문과 답변", "경험과 후기", "관심사별 커뮤니티", "모임과 챌린지"],
      href: "#community", cta: "커뮤니티 둘러보기",
      wordmark: "COMMUNITY", slogan: "서로의 이야기가 모여,<br>새로운 일상이 되다.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
    },
    {
      id: "ai", n: "06", label: "LIVON AI", title: "일상의 질문부터, 앞으로의 계획까지.",
      desc: "생활 속 궁금한 점을 질문하고, 필요한 정보를 찾고, 나만의 생활 계획을 정리해 보세요.",
      feats: ["대화형 생활 안내", "생활 계획 생성", "체크리스트 정리", "LIVON 서비스 연결"],
      href: "#livon-ai", cta: "LIVON AI 시작하기",
      wordmark: "LIVON AI", slogan: "지금의 삶에 필요한 정보부터,<br>다음 단계의 준비까지.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260411_104032_69319010-2458-492b-b04d-b40a5dfa4482.mp4"
    }
  ];

  var INTEREST_OPTS = ["여행", "배움", "건강", "주거", "커리어", "가족", "취미", "지역 활동", "문화", "시니어 생활"];

  var state = { stageIdx: 1, svcIdx: 0 };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function readJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
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
  function todayKey() {
    var d = new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  function getStagePref() {
    var s = readJSON(KEY_STAGE, null);
    if (typeof s === "string") return s;
    if (s && s.id) return String(s.id);
    return "";
  }
  function getInterests() {
    var list = readJSON(KEY_INTERESTS, []);
    return Array.isArray(list) ? list : [];
  }

  function renderStageTabs() {
    var host = $("[data-lv-hm-stage-tabs]");
    if (!host) return;
    host.innerHTML = STAGES.map(function (s, i) {
      return "<button type=\"button\" role=\"tab\" data-lv-hm-stage=\"" + i + "\"" +
        (i === state.stageIdx ? " class=\"is-on\" aria-selected=\"true\"" : " aria-selected=\"false\"") + ">" +
        esc(s.label) + "</button>";
    }).join("");
  }
  function renderStagePanel() {
    var s = STAGES[state.stageIdx] || STAGES[1];
    var label = $("[data-lv-hm-stage-label]");
    var title = $("[data-lv-hm-stage-title]");
    var desc = $("[data-lv-hm-stage-desc]");
    var keys = $("[data-lv-hm-stage-keys]");
    var link = $("[data-lv-hm-stage-link]");
    var visual = $("[data-lv-hm-stage-visual]");
    if (label) label.textContent = s.label;
    if (title) title.textContent = s.title;
    if (desc) desc.textContent = s.desc;
    if (keys) keys.textContent = s.keys;
    if (link) link.href = "#stage-" + s.id;
    if (visual) visual.style.backgroundImage = "url(" + s.img + ")";
    renderStageTabs();
  }

  function renderSvcTabs() {
    var host = $("[data-lv-hm-svc-tabs]");
    if (!host) return;
    host.innerHTML = SERVICES.map(function (s, i) {
      return "<button type=\"button\" role=\"tab\" data-lv-hm-svc=\"" + i + "\"" +
        (i === state.svcIdx ? " class=\"is-on\" aria-selected=\"true\"" : " aria-selected=\"false\"") + ">" +
        "<em>" + esc(s.n) + "</em><span>" + esc(s.label) + "</span></button>";
    }).join("");
  }
  function renderSvcPanel() {
    var s = SERVICES[state.svcIdx] || SERVICES[0];
    var panel = $("[data-lv-hm-svc-panel]");
    if (!panel) return;
    panel.innerHTML =
      "<div class=\"lv-hm-svc\">" +
        "<div class=\"lv-hm-svc__copy\">" +
          "<p class=\"lv-hm-eyebrow\">" + esc(s.n) + " · " + esc(s.label) + "</p>" +
          "<h3>" + esc(s.title) + "</h3>" +
          "<p>" + esc(s.desc) + "</p>" +
          "<ul>" + s.feats.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
          "<a class=\"lv-hm-btn\" href=\"" + esc(s.href) + "\">" + esc(s.cta) + "</a>" +
        "</div>" +
        "<div class=\"lv-hm-svc__film\" aria-hidden=\"false\">" +
          "<video class=\"lv-hm-svc__video\" muted loop playsinline autoplay preload=\"metadata\" src=\"" + esc(s.video) + "\"></video>" +
          "<div class=\"lv-hm-svc__veil\" aria-hidden=\"true\"></div>" +
          "<div class=\"lv-hm-svc__lockup\">" +
            "<p class=\"lv-hm-svc__wordmark\">" + esc(s.wordmark) + "</p>" +
            "<p class=\"lv-hm-svc__slogan\">" + s.slogan + "</p>" +
          "</div>" +
        "</div>" +
      "</div>";
    renderSvcTabs();
    var vid = panel.querySelector(".lv-hm-svc__video");
    if (vid && typeof vid.play === "function") {
      var p = vid.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    }
  }

  function renderDash() {
    var host = $("[data-lv-hm-dash]");
    if (!host) return;
    var stage = getStagePref();
    var interests = getInterests();
    var region = readJSON(KEY_REGION, "") || "";
    var ml = readJSON(KEY_ML, null);
    var t = todayKey();
    var events = (ml && Array.isArray(ml.events)) ? ml.events.filter(function (e) { return e.date === t; }) : [];
    var todos = (ml && Array.isArray(ml.todos)) ? ml.todos.filter(function (x) { return !x.done && (!x.due || x.due === t || x.due >= t); }).slice(0, 4) : [];
    var goals = (ml && Array.isArray(ml.goals)) ? ml.goals.filter(function (g) { return g.status !== "완료"; }).slice(0, 3) : [];
    var saved = readJSON(KEY_TD_SAVED, []);
    if (!Array.isArray(saved)) saved = [];
    var cmSaved = (ml && Array.isArray(ml.savedCommunity)) ? ml.savedCommunity : [];
    var stageMeta = STAGES.find(function (s) { return s.id === stage; });
    var dateLabel = (function () {
      try {
        var d = new Date();
        return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
      } catch (e) { return t; }
    })();

    var setup =
      "<div class=\"lv-hm-me\">" +
        "<aside class=\"lv-hm-me__stage\">" +
          "<p class=\"lv-hm-eyebrow\">MY STAGE</p>" +
          "<p class=\"lv-hm-me__num\">" + (stageMeta ? esc(stageMeta.label) : "—") + "</p>" +
          "<p class=\"lv-hm-me__title\">" + (stageMeta ? esc(stageMeta.title) : "스테이지를 선택해 주세요") + "</p>" +
          (interests.length
            ? "<ul class=\"lv-hm-me__tags\">" + interests.slice(0, 5).map(function (n) {
                return "<li>" + esc(n) + "</li>";
              }).join("") + "</ul>"
            : "<p class=\"lv-hm-me__hint\">관심사를 고르면 추천이 달라집니다</p>") +
        "</aside>" +
        "<div class=\"lv-hm-me__form\">" +
          "<p class=\"lv-hm-eyebrow\">PERSONALIZE</p>" +
          "<h3>나에게 맞는 LIVON</h3>" +
          "<p class=\"lv-hm-me__desc\">관심사와 라이프 스테이지를 선택하면 관련 공개 콘텐츠를 더 쉽게 탐색할 수 있어요.</p>" +
          "<label class=\"lv-hm-field\">라이프 스테이지<select data-lv-hm-stage-select>" +
            "<option value=\"\">선택 안 함</option>" +
            STAGES.map(function (s) {
              return "<option value=\"" + s.id + "\"" + (stage === s.id ? " selected" : "") + ">" + esc(s.label + " · " + s.title) + "</option>";
            }).join("") +
          "</select></label>" +
          "<div class=\"lv-hm-chips\" data-lv-hm-interest-chips>" +
            INTEREST_OPTS.map(function (name) {
              var on = interests.indexOf(name) >= 0;
              return "<button type=\"button\" data-lv-hm-interest=\"" + esc(name) + "\"" + (on ? " class=\"is-on\"" : "") + ">" + esc(name) + "</button>";
            }).join("") +
          "</div>" +
          "<div class=\"lv-hm-me__row\">" +
            "<label class=\"lv-hm-field\">관심 지역 (선택)<input data-lv-hm-region value=\"" + esc(region) + "\" placeholder=\"예: 서울, 온라인\" maxlength=\"40\" /></label>" +
            "<button type=\"button\" class=\"lv-hm-btn\" data-lv-hm-save-prefs>설정 저장</button>" +
          "</div>" +
        "</div>" +
      "</div>";

    var hasLife = events.length || todos.length || goals.length || saved.length || cmSaved.length;
    var lifeHtml = "<div class=\"lv-hm-day\">";
    lifeHtml +=
      "<header class=\"lv-hm-day__head\">" +
        "<div><p class=\"lv-hm-eyebrow\">MY DAY</p><h3>오늘의 나</h3></div>" +
        "<time datetime=\"" + esc(t) + "\">" + esc(dateLabel) + "</time>" +
      "</header>";

    if (!hasLife) {
      lifeHtml +=
        "<div class=\"lv-hm-day__empty\">" +
          "<h4>아직 등록된 일정이 없어요</h4>" +
          "<p>내 생활에서 일정·할 일·목표를 추가하면 여기에 요약됩니다. 가짜 데이터는 표시하지 않습니다.</p>" +
          "<div class=\"lv-hm-actions\">" +
            "<a class=\"lv-hm-btn\" href=\"#life-now\">일정 추가하기</a>" +
            "<a class=\"lv-hm-btn lv-hm-btn--ghost\" href=\"#ml-goals\">목표 만들기</a>" +
          "</div></div>";
    } else {
      var leadEvent = events[0];
      lifeHtml += "<div class=\"lv-hm-day__spread\">";
      lifeHtml +=
        "<a class=\"lv-hm-day__hero\" href=\"#life-now\">" +
          "<p class=\"lv-hm-eyebrow\">01 · NOW</p>" +
          "<h4>" + (leadEvent ? esc(leadEvent.title || "오늘의 일정") : "오늘 일정이 없습니다") + "</h4>" +
          (leadEvent && leadEvent.time ? "<span class=\"lv-hm-day__when\">" + esc(leadEvent.time) + "</span>" : "") +
          (events.length > 1
            ? "<ul class=\"lv-hm-day__more\">" + events.slice(1, 4).map(function (e) {
                return "<li>" + esc(e.title || "일정") + (e.time ? "<em>" + esc(e.time) + "</em>" : "") + "</li>";
              }).join("") + "</ul>"
            : "") +
          "<span class=\"lv-hm-day__cta\">내 생활 →</span></a>";

      lifeHtml +=
        "<div class=\"lv-hm-day__side\">" +
          "<a class=\"lv-hm-stat\" href=\"#life-now\">" +
            "<em>02</em><strong>" + String(todos.length) + "</strong>" +
            "<span>남은 할 일</span>" +
            (todos.length
              ? "<small>" + esc(todos[0].title) + "</small>"
              : "<small>남은 할 일이 없습니다</small>") +
          "</a>" +
          "<a class=\"lv-hm-stat\" href=\"#ml-goals\">" +
            "<em>03</em><strong>" + String(goals.length) + "</strong>" +
            "<span>진행 중 목표</span>" +
            (goals.length
              ? "<small>" + esc(goals[0].title) + (goals[0].progress != null ? " · " + goals[0].progress + "%" : "") + "</small>"
              : "<small>진행 중 목표가 없습니다</small>") +
          "</a>" +
        "</div>";

      lifeHtml +=
        "<div class=\"lv-hm-day__shelf\">" +
          "<div class=\"lv-hm-day__shelf-h\">" +
            "<p class=\"lv-hm-eyebrow\">04 · SAVED</p>" +
            "<h4>저장한 콘텐츠</h4>" +
            "<a href=\"#life-now\">저장함 →</a>" +
          "</div>" +
          ((saved.length || cmSaved.length)
            ? "<ul class=\"lv-hm-shelf\">" +
                saved.slice(0, 4).map(function (x) {
                  return "<li><span>" + esc(x.label || x.id) + "</span></li>";
                }).join("") +
                cmSaved.slice(0, 3).map(function (x) {
                  return "<li><a href=\"" + esc(x.href || "#community") + "\">" + esc(x.title || "게시글") + "</a></li>";
                }).join("") +
              "</ul>"
            : "<p class=\"lv-hm-note\">저장한 콘텐츠가 없습니다.</p>") +
        "</div>";

      lifeHtml += "</div>";
    }
    lifeHtml += "</div>";

    var recs = recommendItems(interests, stage).slice(0, 5);
    var todayData = (window.LivonTodayData && window.LivonTodayData.contents) || [];
    var recHtml = "<div class=\"lv-hm-rec\">" +
      "<div class=\"lv-hm-rec__head\">" +
        "<p class=\"lv-hm-eyebrow\">FOR YOU</p>" +
        "<h3>나를 위한 추천</h3>" +
        "<a class=\"lv-hm-rec__more\" href=\"#today\">더 보기 →</a>" +
      "</div>";
    if (!recs.length) {
      recHtml += "<p class=\"lv-hm-note\">관심사를 선택하면 실제 등록된 콘텐츠를 연결합니다.</p>";
    } else {
      recHtml += "<div class=\"lv-hm-rec__mosaic\">";
      recs.forEach(function (r, i) {
        var img = "";
        if (r.kind === "발견") {
          var hit = todayData.find(function (c) { return ("#td-item-" + c.id) === r.href; });
          if (hit && hit.img) img = hit.img;
        }
        var cls = "lv-hm-rec__card";
        if (i === 0) cls += " is-hero";
        if (i === 3) cls += " is-wide";
        if (img) cls += " has-img";
        recHtml += "<a class=\"" + cls + "\" href=\"" + esc(r.href) + "\"" +
          (img ? " style=\"background-image:url(" + esc(img) + ")\"" : "") + ">" +
          "<em>" + esc(r.kind) + "</em><strong>" + esc(r.title) + "</strong></a>";
      });
      recHtml += "</div>";
    }
    recHtml += "</div>";

    host.innerHTML = setup + lifeHtml + recHtml;
  }

  function recommendItems(interests, stage) {
    var out = [];
    var q = (interests || []).join(" ") + " " + stage;
    var today = (window.LivonTodayData && window.LivonTodayData.contents) || [];
    today.forEach(function (c) {
      if (interests.length) {
        var tags = c.tags || [];
        var hit = interests.some(function (i) {
          return tags.indexOf(i) >= 0 || String(c.title + c.blurb).indexOf(i) >= 0;
        });
        if (!hit) return;
      }
      out.push({ kind: "발견", title: c.title, href: "#td-item-" + c.id });
    });
    var explore = (window.LivonExploreData && window.LivonExploreData.items) || [];
    explore.slice(0, 40).forEach(function (c) {
      if (interests.length) {
        var hit = interests.some(function (i) {
          return (c.tags || []).indexOf(i) >= 0 || String(c.title + (c.subfield || "")).indexOf(i) >= 0;
        });
        if (!hit && q) return;
      }
      out.push({ kind: "탐색", title: c.title, href: "#ex-item-" + c.id });
    });
    return out;
  }

  function renderToday() {
    var cats = $("[data-lv-hm-today-cats]");
    var host = $("[data-lv-hm-today]");
    var list = (window.LivonTodayData && window.LivonTodayData.contents) || [];
    if (cats) {
      var labels = ["장소", "행사·전시", "취미·클래스", "여행·나들이", "문화생활", "지역 활동", "새로운 배움"];
      cats.innerHTML = labels.map(function (l) {
        return "<a href=\"#today\">" + esc(l) + "</a>";
      }).join("");
    }
    if (!host) return;
    if (!list.length) {
      host.innerHTML = "<div class=\"lv-hm-day__empty\"><p class=\"lv-hm-eyebrow\">DISCOVERY</p><h4>등록된 발견 콘텐츠가 아직 없어요</h4><p>가짜 장소·행사는 만들지 않습니다.</p><a class=\"lv-hm-btn\" href=\"#today\">오늘의 발견 열기</a></div>";
      return;
    }
    var featured = list.find(function (c) { return c.featured && c.img; }) || list.find(function (c) { return c.img; }) || list[0];
    var rest = list.filter(function (c) { return c.id !== featured.id; }).slice(0, 4);
    var strip = rest.slice(0, 3);
    var last = rest[3];

    host.innerHTML =
      "<a class=\"lv-hm-mag__feature" + (featured.img ? "" : " is-plain") + "\" href=\"#td-item-" + esc(featured.id) + "\"" +
        (featured.img ? " style=\"background-image:url(" + esc(featured.img) + ")\"" : "") + ">" +
        "<span class=\"lv-hm-mag__veil\" aria-hidden=\"true\"></span>" +
        "<span class=\"lv-hm-mag__copy\">" +
          "<em>" + esc(featured.category || featured.type || "발견") + "</em>" +
          "<strong>" + esc(featured.title) + "</strong>" +
          "<small>" + esc(featured.region || "") + (featured.price ? " · " + esc(featured.price) : "") + "</small>" +
        "</span></a>" +
      "<div class=\"lv-hm-mag__strip\">" + strip.map(function (c, i) {
        return "<a class=\"lv-hm-mag__cell" + (c.img ? "" : " is-plain") + (i === 0 ? " is-focus" : "") + "\" href=\"#td-item-" + esc(c.id) + "\"" +
          (c.img ? " style=\"background-image:url(" + esc(c.img) + ")\"" : "") + ">" +
          "<span class=\"lv-hm-mag__veil\" aria-hidden=\"true\"></span>" +
          "<span class=\"lv-hm-mag__copy\">" +
            "<em>" + esc(c.category || "") + "</em>" +
            "<strong>" + esc(c.title) + "</strong>" +
            "<small>" + esc(c.region || "") + "</small>" +
          "</span></a>";
      }).join("") + "</div>" +
      (last
        ? "<a class=\"lv-hm-mag__banner" + (last.img ? "" : " is-plain") + "\" href=\"#td-item-" + esc(last.id) + "\"" +
            (last.img ? " style=\"background-image:url(" + esc(last.img) + ")\"" : "") + ">" +
            "<span class=\"lv-hm-mag__veil\" aria-hidden=\"true\"></span>" +
            "<span class=\"lv-hm-mag__copy\">" +
              "<em>" + esc(last.category || "") + "</em>" +
              "<strong>" + esc(last.title) + "</strong>" +
              "<small>" + esc(last.region || "") + "</small>" +
            "</span></a>"
        : "");
  }

  function renderExplore() {
    var cats = $("[data-lv-hm-ex-cats]");
    var list = $("[data-lv-hm-ex-list]");
    var data = window.LivonExploreData || {};
    if (cats && Array.isArray(data.categories)) {
      cats.innerHTML = data.categories.slice(0, 6).map(function (c) {
        return "<li><a href=\"#explore\">" + esc(c.title) + "</a></li>";
      }).join("");
    }
    if (!list) return;
    var items = Array.isArray(data.items) ? data.items.slice(0, 5) : [];
    if (!items.length) {
      list.innerHTML = "<p class=\"lv-hm-note\">등록된 서비스가 없습니다.</p>";
      return;
    }
    list.innerHTML = "<ol class=\"lv-hm-ex-ol\">" + items.map(function (c, i) {
      return "<li><a href=\"#ex-item-" + esc(c.id) + "\">" +
        "<span class=\"lv-hm-ex-ol__n\">" + String(i + 1).padStart(2, "0") + "</span>" +
        "<span class=\"lv-hm-ex-ol__body\"><strong>" + esc(c.title) + "</strong>" +
        "<em>" + esc(c.provider || c.subfield || c.field || "") + "</em></span></a></li>";
    }).join("") + "</ol>";
  }

  function renderCommunity() {
    var host = $("[data-lv-hm-cm-list]");
    if (!host) return;
    var store = readJSON("livon.cmStore.v1", null);
    var posts = (store && Array.isArray(store.posts))
      ? store.posts.filter(function (p) { return !p.deleted && !p.draft && p.visibility !== "private"; }).slice(0, 4)
      : [];
    if (!posts.length) {
      host.innerHTML = "<div class=\"lv-hm-cm-empty\"><p>아직 공개 게시글이 없어요. 커뮤니티에서 첫 이야기를 남겨보세요.</p></div>";
      return;
    }
    var lead = posts[0];
    var rest = posts.slice(1);
    host.innerHTML =
      "<a class=\"lv-hm-cm-lead\" href=\"#cm-post-" + esc(lead.id) + "\">" +
        "<span class=\"lv-hm-cm-lead__mark\" aria-hidden=\"true\">“</span>" +
        "<em>" + esc(lead.type || "이야기") + "</em>" +
        "<strong>" + esc(lead.title) + "</strong>" +
        (lead.body ? "<span>" + esc(String(lead.body).slice(0, 140)) + (String(lead.body).length > 140 ? "…" : "") + "</span>" : "") +
      "</a>" +
      (rest.length
        ? "<ul class=\"lv-hm-cm-rail\">" + rest.map(function (p, i) {
            return "<li><a href=\"#cm-post-" + esc(p.id) + "\">" +
              "<em>" + String(i + 2).padStart(2, "0") + "</em>" +
              "<strong>" + esc(p.title) + "</strong>" +
              "<small>" + esc(p.type || "이야기") + "</small></a></li>";
          }).join("") + "</ul>"
        : "");
  }

  function goAi(q) {
    var text = String(q || "").trim();
    try {
      sessionStorage.setItem(KEY_AIQ, JSON.stringify({ q: text, stage: getStagePref(), at: Date.now(), source: "home" }));
    } catch (e) {}
    location.hash = "livon-ai";
    if (window.LivonAI && typeof window.LivonAI.startChat === "function" && text) {
      setTimeout(function () { window.LivonAI.startChat(text); }, 80);
    }
  }

  function unifiedSearch(q) {
    q = String(q || "").trim();
    if (!q) return "";
    var ql = q.toLowerCase();
    var results = [];
    var today = (window.LivonTodayData && window.LivonTodayData.contents) || [];
    today.forEach(function (c) {
      var hay = [c.title, c.blurb, (c.tags || []).join(" ")].join(" ").toLowerCase();
      if (hay.indexOf(ql) >= 0 || ql.split(/\s+/).some(function (t) { return t.length > 1 && hay.indexOf(t) >= 0; })) {
        results.push({ kind: "오늘의 발견", title: c.title, href: "#td-item-" + c.id });
      }
    });
    var explore = (window.LivonExploreData && window.LivonExploreData.items) || [];
    explore.forEach(function (c) {
      var hay = [c.title, c.blurb, c.provider, (c.tags || []).join(" ")].join(" ").toLowerCase();
      if (hay.indexOf(ql) >= 0 || ql.split(/\s+/).some(function (t) { return t.length > 1 && hay.indexOf(t) >= 0; })) {
        results.push({ kind: "탐색", title: c.title, href: "#ex-item-" + c.id });
      }
    });
    var cm = readJSON("livon.cmStore.v1", null);
    if (cm && Array.isArray(cm.posts)) {
      cm.posts.filter(function (p) { return !p.deleted && !p.draft && p.visibility !== "private"; }).forEach(function (p) {
        var hay = [p.title, p.body, (p.tags || []).join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(ql) >= 0) results.push({ kind: "커뮤니티", title: p.title, href: "#cm-post-" + p.id });
      });
    }
    var life = (window.LivonLifeData && window.LivonLifeData.stages) || [];
    life.forEach(function (s) {
      var hay = [s.label, s.title, s.desc, s.focus].join(" ").toLowerCase();
      if (hay.indexOf(ql) >= 0) results.push({ kind: "라이프 스테이지", title: s.label + " · " + s.title, href: "#stage-" + s.id });
    });

    var note = $("[data-livon-search-note]");
    var panel = $("[data-livon-panel='search']");
    if (panel) {
      var list = panel.querySelector("[data-lv-hm-search-results]");
      if (!list) {
        list = document.createElement("div");
        list.setAttribute("data-lv-hm-search-results", "");
        list.className = "lv-hm-search-results";
        panel.appendChild(list);
      }
      if (!results.length) {
        list.innerHTML = "";
        return "‘" + q + "’에 대한 공개 결과가 없습니다. 조건을 바꿔 탐색해 보세요.";
      }
      list.innerHTML = "<ul>" + results.slice(0, 8).map(function (r) {
        return "<li><a href=\"" + esc(r.href) + "\"><em>" + esc(r.kind) + "</em> " + esc(r.title) + "</a></li>";
      }).join("") + "</ul>";
    }
    return "‘" + q + "’ · 결과 " + results.length + "건";
  }

  function bindReveal() {
    var home = $("#livon-home");
    var nodes = $$("[data-lv-hm-reveal]");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    if (home) home.classList.add("is-hm-motion");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    nodes.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.classList.add("is-in");
      else io.observe(el);
    });
  }

  function bindEvents() {
    document.addEventListener("click", function (e) {
      var stageBtn = e.target.closest("[data-lv-hm-stage]");
      if (stageBtn) {
        e.preventDefault();
        state.stageIdx = Number(stageBtn.getAttribute("data-lv-hm-stage")) || 0;
        renderStagePanel();
        return;
      }
      var setStage = e.target.closest("[data-lv-hm-set-stage]");
      if (setStage) {
        e.preventDefault();
        var s = STAGES[state.stageIdx];
        if (!s) return;
        writeJSON(KEY_STAGE, s.id);
        renderDash();
        alert(s.label + "을(를) 나의 라이프 스테이지로 이 기기에 저장했습니다.");
        return;
      }
      var svc = e.target.closest("[data-lv-hm-svc]");
      if (svc) {
        e.preventDefault();
        state.svcIdx = Number(svc.getAttribute("data-lv-hm-svc")) || 0;
        renderSvcPanel();
        return;
      }
      var interest = e.target.closest("[data-lv-hm-interest]");
      if (interest) {
        e.preventDefault();
        var name = interest.getAttribute("data-lv-hm-interest");
        var list = getInterests();
        list = list.indexOf(name) >= 0 ? list.filter(function (x) { return x !== name; }) : list.concat([name]).slice(0, 20);
        writeJSON(KEY_INTERESTS, list);
        writeJSON("livon.mlInterests", list);
        renderDash();
        return;
      }
      var savePrefs = e.target.closest("[data-lv-hm-save-prefs]");
      if (savePrefs) {
        e.preventDefault();
        var sel = $("[data-lv-hm-stage-select]");
        var reg = $("[data-lv-hm-region]");
        if (sel) writeJSON(KEY_STAGE, sel.value || "");
        if (reg) writeJSON(KEY_REGION, reg.value.trim());
        renderDash();
        alert("설정이 이 기기에 저장되었습니다.");
        return;
      }
      var aiq = e.target.closest("[data-lv-hm-aiq]");
      if (aiq) {
        e.preventDefault();
        goAi(aiq.getAttribute("data-lv-hm-aiq") || aiq.textContent);
        return;
      }
    });

    var exForm = $("[data-lv-hm-explore-form]");
    if (exForm) {
      exForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = String(new FormData(exForm).get("q") || "").trim();
        try { sessionStorage.setItem("livon.exQuery", q); } catch (err) {}
        location.hash = q ? "explore" : "explore";
      });
    }
    var aiForm = $("[data-lv-hm-ai-form]");
    if (aiForm) {
      aiForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = $("[data-lv-hm-ai-q]");
        goAi(input ? input.value : "");
      });
    }
  }

  function renderAll() {
    var pref = getStagePref();
    if (pref) {
      var idx = STAGES.findIndex(function (s) { return s.id === pref; });
      if (idx >= 0) state.stageIdx = idx;
    }
    renderStagePanel();
    renderSvcPanel();
    renderDash();
    renderToday();
    renderExplore();
    renderCommunity();
  }

  function onShow(hash) {
    renderAll();
    if (!hash || hash === "livon-home" || hash === "home") {
      window.scrollTo(0, 0);
      return;
    }
    if (hash.indexOf("hm-") === 0) setTimeout(function () { scrollToId(hash); }, 40);
  }

  function init() {
    if (!$("#livon-home") || !$("[data-lv-hm]")) return;
    bindEvents();
    bindReveal();
    renderAll();
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "home") onShow(hash || "livon-home");
  }

  window.LivonHome = { onShow: onShow, search: unifiedSearch, render: renderAll };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
