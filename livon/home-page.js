/*
 * LIVON Home V2 — the personal hub.
 *
 *   오늘 → 내 생활 → 지금 내 생애주기 → 발견 → 저장한 것, then Community and LIVON AI as small ways in, then the
 *   introduction to LIVON (meaning, seven stages, six services, start).
 *
 * Home is a reading and linking layer. It owns no data and writes none:
 *   오늘 / 내 생활     LivonMyLife.api.today(now) — the model 오늘의 발견 › 내 오늘 uses — and api.snapshot() for goals
 *   생애주기           livon.lifeStage (chosen by the person in onboarding) + LivonLifeHub data; never inferred
 *   발견               the registered 오늘의 발견 and 탐색 items, in their own order
 *   저장한 것          LivonPlatform.listSaves("all") (livon.platform.v1 → saves) and nothing else
 * Each section is drawn on its own, so one that fails says so in its own box and the rest stay.
 */
(function () {
  var KEY_STAGE = "livon.lifeStage";
  var KEY_INTERESTS = "livon.lifeInterests";
  var KEY_AIQ = "livon.aiPrompt";
  /* lists served by the LIVON Data Platform (visible rows only); the files' own arrays if the platform is unavailable */
  var SD = window.LivonScreenData;
  function tdList() { var l = SD ? SD.todayContents() : (window.LivonTodayData && window.LivonTodayData.contents); return Array.isArray(l) ? l : []; }
  function exList() { var l = SD ? SD.exploreItems() : (window.LivonExploreData && window.LivonExploreData.items); return Array.isArray(l) ? l : []; }

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


  var state = { stageIdx: 1, svcIdx: 0 };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /* stored value must keep the shape the caller expects (old schema / corrupted data → fallback, null entries dropped) */
  function fitShape(v, fb) { if (Array.isArray(fb)) return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : fb; if (fb && typeof fb === "object") return v && typeof v === "object" && !Array.isArray(v) ? v : fb; return v; }
  /* Home only reads. It never writes localStorage: stage, interests and everything else are set where they belong. */
  function readJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return fitShape(raw ? JSON.parse(raw) : fallback, fallback); } catch (e) { return fallback; }
  }
  function str(v) { return typeof v === "string" ? v : ""; }
  function list(v) { return Array.isArray(v) ? v.filter(function (x) { return x && typeof x === "object"; }) : []; }
  /* only an in-app link is followed from a stored row; anything else goes to the screen that owns the data */
  function inApp(href, fallback) { href = str(href); return /^#[\w\-\/?=&%.:~+]*$/.test(href) ? href : fallback; }

  function gnavOffset() {
    return (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h"), 10) || 74) + 8;
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ? "auto" : "smooth" });
  }

  function getStagePref() {
    var s = readJSON(KEY_STAGE, null);
    if (typeof s === "string") return s;
    if (s && s.id) return String(s.id);
    return "";
  }
  function getInterests() {
    var l = readJSON(KEY_INTERESTS, []);
    return Array.isArray(l) ? l.filter(function (x) { return typeof x === "string" && x; }) : [];
  }

  /* ───────── brand / introduction (below the hub): the seven stages and the six services, as before ───────── */
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
    if (link) link.href = "#life/" + s.id + "s";
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
          "<video class=\"lv-hm-svc__video\" muted loop playsinline autoplay preload=\"none\" data-src=\"" + esc(s.video) + "\"></video>" +
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

  /* ───────── hub pieces ───────── */
  function note(text) { return "<p class=\"lv-hm-note\">" + esc(text) + "</p>"; }
  function row(href, title, meta) {
    return "<li><a href=\"" + esc(href) + "\"><strong>" + esc(title) + "</strong>" + (meta ? "<small>" + esc(meta) + "</small>" : "") + "</a></li>";
  }
  function rows(items) { return "<ul class=\"lv-hm-hub__list\">" + items.join("") + "</ul>"; }
  function myApi() { var m = window.LivonMyLife; return m && m.api && typeof m.api.today === "function" ? m.api : null; }

  /*
   * 오늘 — the same model 오늘의 발견 › 내 오늘 shows: LivonMyLife.api.today(now). One call, one date boundary.
   * Home has no date arithmetic of its own, so the two screens cannot disagree about what "today" holds.
   */
  var hubDay = null;
  function todayModel() {
    var api = myApi();
    if (!api) return null;
    var m = api.today(new Date());
    if (!m || typeof m !== "object") return null;
    return { date: str(m.date), label: str(m.label), todos: list(m.todos), overdue: list(m.overdue), events: list(m.events), routines: list(m.routines), upcoming: list(m.upcoming) };
  }
  function renderHubToday(host) {
    var m = hubDay;
    if (!m) { host.innerHTML = note("내 생활 정보를 불러오지 못했어요. 새로고침하거나 내 생활에서 확인해 주세요."); return; }
    var tDone = m.todos.filter(function (x) { return x.done; }).length, rDone = m.routines.filter(function (x) { return x.done; }).length;
    var first = function (l) { var x = l.filter(function (i) { return !i.done; })[0] || l[0]; return x ? str(x.title) : ""; };
    var stat = function (href, label, value, sub) {
      return "<li><a class=\"lv-hm-hub__stat\" href=\"" + href + "\"><span>" + esc(label) + "</span><strong>" + esc(value) + "</strong>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</a></li>";
    };
    var ev = m.events[0];
    host.innerHTML =
      "<p class=\"lv-hm-hub__date\"><time datetime=\"" + esc(m.date) + "\">" + esc(m.label) + "</time></p>" +
      "<ul class=\"lv-hm-hub__stats\" aria-label=\"오늘 요약\">" +
        stat("#ml-todos?filter=today", "오늘 할 일", m.todos.length ? m.todos.length + "개 중 " + tDone + "개 완료" : "없음", first(m.todos)) +
        stat("#ml-calendar", "오늘 일정", m.events.length ? m.events.length + "개" : "없음", ev ? (ev.allDay ? "종일 · " : ev.start ? ev.start + " · " : "") + str(ev.title) : "") +
        stat("#ml-routines", "오늘 루틴", m.routines.length ? m.routines.length + "개 중 " + rDone + "개 완료" : "없음", first(m.routines)) +
      "</ul>" +
      (m.overdue.length ? "<p class=\"lv-hm-hub__flag\"><a href=\"#ml-todos\">기한 지난 할 일 " + m.overdue.length + "개</a></p>" : "") +
      (!m.todos.length && !m.events.length && !m.routines.length && !m.overdue.length ? note("오늘 마감인 할 일, 오늘 일정, 오늘 루틴이 없어요. 내 생활에서 추가하면 여기에 보여요.") : "");
  }

  /* 내 생활 — what is coming (the same 다가오는 7일 list as Today) and the goals in progress. A summary only. */
  function renderHubMyLife(host) {
    var m = hubDay, api = myApi();
    if (!m || !api) { host.innerHTML = note("내 생활 정보를 불러오지 못했어요. 내 생활에서 확인해 주세요."); return; }
    var KIND = { event: "일정", todo: "할 일 마감", goal: "목표일" };
    var up = m.upcoming.slice(0, 3).map(function (x) {
      return row(x.kind === "event" ? "#ml-calendar" : x.kind === "goal" ? "#ml-goals" : "#ml-todos", str(x.title), [str(x.dateLabel), KIND[x.kind], str(x.time)].filter(Boolean).join(" · "));
    });
    var snap = null;
    try { snap = typeof api.snapshot === "function" ? api.snapshot() : null; } catch (e) { snap = null; }
    var todos = list(snap && snap.todos);
    var goals = list(snap && snap.goals).filter(function (g) { return g.status !== "완료" && g.status !== "보류" && str(g.title); }).slice(0, 2).map(function (g) {
      var linked = todos.filter(function (x) { return x.goalId === g.id; });
      /* progress is a count of linked to-dos the person ticked — never a score Home makes up */
      return row("#ml-goals", g.title, linked.length ? "연결한 할 일 " + linked.filter(function (x) { return x.done; }).length + " / " + linked.length : str(g.status) || "진행 중");
    });
    if (!up.length && !goals.length) {
      host.innerHTML = note("앞으로 7일 동안 예정된 일정·마감이 없고, 진행 중인 목표도 없어요.") +
        "<p class=\"lv-hm-hub__links\"><a class=\"lv-hm-hub__more\" href=\"#ml-calendar\">일정 추가하기</a><a class=\"lv-hm-hub__more\" href=\"#ml-goals\">목표 만들기</a></p>";
      return;
    }
    host.innerHTML =
      (up.length ? "<h4>다가오는 7일" + (m.upcoming.length > up.length ? " <small>외 " + (m.upcoming.length - up.length) + "개</small>" : "") + "</h4>" + rows(up) : "") +
      (goals.length ? "<h4>진행 중인 목표</h4>" + rows(goals) : "");
  }

  /* ───────── 지금 내 생애주기: only the stage the person chose (livon.lifeStage). Nothing is guessed. ───────── */
  var hubHooked = false;
  function lifeRepo() {
    var hub = window.LivonLifeHub;
    var repo = hub && hub.repo;
    if (!repo) return null;
    if (!hubHooked && typeof hub.onChange === "function") {
      hubHooked = true;
      hub.onChange(function (st) { if (st === "ready" && document.documentElement.dataset.lvView === "home") safe("stage"); });
      if (window.LivonData && window.LivonData.repository) window.LivonData.repository.onChange(function () { if (document.documentElement.dataset.lvView === "home") safe("stage"); });
    }
    if (repo.status !== "ready") { if (repo.status === "idle" && typeof repo.load === "function") repo.load().catch(function () {}); return null; }
    return repo;
  }
  function topicHref(t) { return "#life/" + t.stageSlug + "/" + t.slug; }
  function checklistProgress(repo) {
    var all = readJSON("livon.lifeHub.checklist.v1", {}) || {};
    return Object.keys(all).map(function (id) {
      var t = repo.topic(id);
      if (!t || !Array.isArray(t.checklist) || !t.checklist.length) return null;
      var done = t.checklist.filter(function (c) { return all[id] && all[id][c.id]; }).length;
      return done ? { t: t, done: done, total: t.checklist.length } : null;
    }).filter(Boolean).sort(function (a, b) { return ((a.done === a.total) - (b.done === b.total)) || (b.done / b.total - a.done / a.total); });
  }
  /* Stable ordering: items that contain a word the person chose as an interest come first, original order otherwise. */
  function byInterest(l, interests) {
    if (!interests || !interests.length) return l.slice();
    return l.map(function (c, i) {
      var hay = (c.tags || []).join(" ") + " " + (c.title || "") + " " + (c.category || "");
      var hit = interests.some(function (n) { return n && hay.indexOf(n) >= 0; }) ? 1 : 0;
      return { c: c, i: i, hit: hit };
    }).sort(function (a, b) { return (b.hit - a.hit) || (a.i - b.i); }).map(function (x) { return x.c; });
  }
  /* Real Data Layer hook: events · policies · programs from external providers that match the chosen stage or interests.
     Only real entities; "" when no provider has data. */
  function realDataCols(stage) {
    var D = window.LivonData;
    if (!D || typeof D.forHome !== "function") return "";
    var r;
    try { r = D.forHome({ stage: stage, interests: getInterests() }); } catch (e) { return ""; }
    var col = function (label, l) {
      if (!l || !l.length) return "";
      return "<h4>" + esc(label) + "</h4><ul class=\"lv-hm-hub__list\">" + l.map(function (e) {
        var a = D.action(e), when = e.schedule && e.schedule.startAt ? D.ui.day(e.schedule.startAt).slice(5) + " · " : "";
        return "<li><a href=\"" + esc(a ? a.url : "#explore") + "\"" + (a ? " target=\"_blank\" rel=\"noopener noreferrer\"" : "") + "><strong>" + esc(e.title) + "</strong><small>" +
          esc(when + (e.source.providerName || "") + (a ? " · " + a.label : "")) + "</small>" + (a ? "<span class=\"visually-hidden\"> (새 창)</span>" : "") + "</a></li>";
      }).join("") + "</ul>";
    };
    return col("관련 행사", r.events) + col("관련 정책·지원", r.policies) + col("관련 클래스·프로그램", r.programs);
  }
  /* Topics that match what the person chose in onboarding (Life Events), each with the reason it is shown.
     An empty profile changes nothing. */
  function profileTopics(repo, hasStage) {
    var PZ = window.LivonPersonalization, prof = PZ ? PZ.getProfile() : null;
    if (!repo || !PZ || !PZ.hasSignals(prof) || !(prof.lifeEvents.length || !hasStage)) return [];
    return PZ.recommend(prof, { kinds: ["topic"], limit: 3 }).items.map(function (x) {
      return { t: repo.topic(String(x.id).replace(/^topic:/, "")), why: x.why };
    }).filter(function (x) { return x.t; });
  }
  var STAGE_SETUP = "<p class=\"lv-hm-hub__links\"><button type=\"button\" class=\"lv-hm-btn\" data-lv-hm-onboard>내 라이프 스테이지 설정하기</button>" +
    "<a class=\"lv-hm-hub__more\" href=\"#life\">라이프 스테이지 둘러보기</a></p>";
  function renderMyStage(host) {
    var stage = getStagePref();
    var meta = STAGES.find(function (s) { return s.id === stage; });
    if (!meta) {
      var repo0 = lifeRepo(), mine0 = profileTopics(repo0, false);
      host.innerHTML = note("아직 라이프 스테이지를 고르지 않았어요. 고르기 전에는 어떤 단계도 짐작해서 보여 주지 않아요.") +
        (mine0.length ? "<h4>내가 고른 변화와 관련된 주제</h4>" + rows(mine0.map(function (x) { return row(topicHref(x.t), x.t.title, x.why || x.t.category || ""); })) : "") +
        realDataCols("") + STAGE_SETUP;
      return;
    }
    var slug = meta.id + "s";
    var head = "<p class=\"lv-hm-hub__stage\"><strong>" + esc(meta.label) + "</strong> " + esc(meta.title) + "</p>";
    var foot = "<p class=\"lv-hm-hub__links\"><a class=\"lv-hm-hub__more\" href=\"#life/" + esc(slug) + "\">내 단계 전체 보기</a>" +
      "<a class=\"lv-hm-hub__more\" href=\"#life-events\">준비 중인 변화 보기</a>" +
      "<button type=\"button\" class=\"lv-hm-hub__more\" data-lv-hm-onboard aria-label=\"라이프 스테이지 변경\">변경</button></p>";
    var repo = lifeRepo();
    if (!repo) { host.innerHTML = head + note("라이프 스테이지 정보를 불러오는 중입니다.") + foot; return; }
    var st = repo.stage(meta.id);
    var topics = st ? (st.featuredTopicIds || []).map(repo.topic).filter(Boolean) : [];
    topics = byInterest(topics.map(function (t) { return { t: t, title: t.title, category: t.category + " " + (t.communityInterest || ""), tags: [] }; }), getInterests()).map(function (x) { return x.t; }).slice(0, 2);
    var mine = profileTopics(repo, true);
    var progress = checklistProgress(repo).slice(0, 1);
    if (mine.length) topics = mine.map(function (x) { return x.t; });
    var seen = {}, services = [];
    topics.forEach(function (t) {
      (t.relatedServiceIds || []).forEach(function (id) {
        var sv = repo.service(id);
        if (sv && !seen[id] && services.length < 1) { seen[id] = 1; services.push(sv); }
      });
    });
    host.innerHTML = head +
      (mine.length ? "<h4>내가 고른 변화와 관련된 주제</h4>" + rows(mine.map(function (x) { return row(topicHref(x.t), x.t.title, x.why || x.t.category || ""); }))
        : topics.length ? "<h4>이 단계의 주제</h4>" + rows(topics.map(function (t) { return row(topicHref(t), t.title, t.category || ""); })) : note("이 단계에 등록된 주제가 아직 없습니다.")) +
      (progress.length ? "<h4>진행 중인 체크리스트</h4>" + rows(progress.map(function (x) { return row(topicHref(x.t), x.t.title, x.done + " / " + x.total + (x.done === x.total ? " 완료" : " 진행")); })) : "") +
      (services.length ? "<h4>관련 서비스</h4>" + rows(services.map(function (sv) { return row("#life/services/" + sv.id, sv.name, sv.group || ""); })) : "") +
      realDataCols(meta.id) + foot;
  }

  /* ───────── 발견: what is registered in 오늘의 발견 and 탐색. No ranking, no score, nothing called a recommendation. ───────── */
  function renderHubDiscover(host) {
    var interests = getInterests();
    var today = byInterest(tdList().filter(function (c) { return c && c.id && c.title; }), interests).slice(0, 2);
    var explore = exList().filter(function (c) { return c && c.id && c.title; }).slice(0, 2);
    if (!today.length && !explore.length) { host.innerHTML = note("등록된 발견 콘텐츠가 아직 없어요. 가짜 장소·행사는 만들지 않습니다."); return; }
    var order = interests.length
      ? "오늘의 발견은 내가 고른 관심사(" + interests.slice(0, 3).join(", ") + ")의 낱말이 들어 있는 항목을 먼저, 나머지는 등록된 순서대로 보여요. 순위나 점수는 없어요."
      : "등록된 순서대로 보여요. 순위나 점수는 없어요.";
    host.innerHTML = note(order) +
      "<div class=\"lv-hm-hub__cols\">" +
        (today.length ? "<div><h4>오늘의 발견</h4>" + rows(today.map(function (c) { return row("#today/" + c.id, c.title, [c.category || c.type, c.region].filter(Boolean).join(" · ")); })) + "</div>" : "") +
        (explore.length ? "<div><h4>탐색에서 둘러볼 정보</h4>" + rows(explore.map(function (c) { return row("#ex-item-" + c.id, c.title, c.provider || c.subfield || c.field || ""); })) + "</div>" : "") +
      "</div>";
  }

  /* ───────── 저장한 것: the shared saves (livon.platform.v1 → saves) through LivonPlatform, and nothing else ───────── */
  function renderHubSaved(host) {
    var P = window.LivonPlatform;
    if (!P || typeof P.listSaves !== "function") { host.innerHTML = note("저장한 항목을 불러오지 못했어요. 내 생활 › 저장에서 확인해 주세요."); return; }
    var all = list(P.listSaves("all")).filter(function (x) { return x.id != null && (str(x.title) || str(x.label)); });
    if (!all.length) { host.innerHTML = note("저장한 항목이 없어요. 오늘의 발견·탐색·라이프 스테이지에서 저장하면 여기에 최근 것부터 보여요."); return; }
    var when = function (x) { return Number(x.savedAt || x.at) || 0; };
    var recent = all.map(function (x, i) { return { x: x, i: i }; }).sort(function (a, b) { return (when(b.x) - when(a.x)) || (a.i - b.i); }).slice(0, 3);
    host.innerHTML = "<p class=\"lv-hm-hub__date\">저장한 항목 " + all.length + "개 · 최근 저장한 순</p>" +
      rows(recent.map(function (r) { return row(inApp(r.x.href, "#ml-saved"), str(r.x.title) || str(r.x.label), str(r.x.source)); }));
  }

  /* ───────── Community: this device's public posts, newest first. No counts, no numbering. ───────── */
  function communityPosts() {
    var l = [];
    var repo = window.LivonCommunityRepo;
    if (repo && typeof repo.visiblePosts === "function") {
      try { l = repo.visiblePosts(); } catch (e) { l = []; }
    } else {
      var store = readJSON("livon.cmStore.v1", null);
      l = store && Array.isArray(store.posts) ? store.posts : [];
    }
    return list(l).filter(function (p) { return p.id && p.title && !p.deleted && !p.draft && (!p.visibility || p.visibility === "public"); })
      .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  }
  function cmType(t) {
    var labels = (window.LivonCommunityData && window.LivonCommunityData.typeLabels) || {};
    return labels[t] || "이야기";
  }
  function renderCommunity(host) {
    var posts = communityPosts().slice(0, 3);
    if (!posts.length) {
      host.innerHTML = "<div class=\"lv-hm-cm-empty\"><p>아직 공개 게시글이 없어요. 질문이나 경험을 남기면 이곳에 가장 최근 글부터 보여 드립니다.</p>" +
        "<div class=\"lv-hm-actions\"><a class=\"lv-hm-btn\" href=\"#cm-write\">첫 글 작성하기</a></div></div>";
      return;
    }
    host.innerHTML = "<p class=\"lv-hm-note\">이 기기에 있는 공개 글을 최근 순으로 보여요.</p>" +
      "<ul class=\"lv-hm-cm-rail\">" + posts.map(function (p) {
        return "<li><a href=\"#cm-post-" + esc(p.id) + "\"><strong>" + esc(p.title) + "</strong><small>" + esc(cmType(p.type)) + "</small></a></li>";
      }).join("") + "</ul>";
  }

  /* Hand-off to LIVON AI: the question is only placed in the composer (draftOnly) — never sent automatically,
     and nothing from the hub (to-dos, events, saves, stage) goes with it. */
  function goAi(q) {
    var text = String(q || "").trim().slice(0, 4000);
    if (text) {
      try { sessionStorage.setItem(KEY_AIQ, JSON.stringify({ q: text, draftOnly: true, source: "home", at: Date.now() })); } catch (e) {}
    }
    location.hash = "ai-chat";
  }

  function unifiedSearch(q) {
    if (window.LivonPlatform && typeof window.LivonPlatform.search === "function") {
      return window.LivonPlatform.search(q, "all") || "";
    }
    q = String(q || "").trim();
    if (!q) return "";
    return "‘" + q + "’ · 플랫폼 검색 준비 중";
  }

  /*
   * One section, one try: a section that cannot be drawn (a broken stored row, a module that did not load) says so in
   * its own box and every other section is still drawn.
   */
  var SECTIONS = {
    today: { sel: "[data-lv-hm-v2=\"today\"]", fn: renderHubToday },
    mylife: { sel: "[data-lv-hm-v2=\"mylife\"]", fn: renderHubMyLife },
    stage: { sel: "[data-lv-hm-mystage]", fn: renderMyStage },
    discover: { sel: "[data-lv-hm-v2=\"discover\"]", fn: renderHubDiscover },
    saved: { sel: "[data-lv-hm-v2=\"saved\"]", fn: renderHubSaved },
    community: { sel: "[data-lv-hm-cm-list]", fn: renderCommunity }
  };
  var ORDER = ["today", "mylife", "stage", "discover", "saved", "community"];
  function safe(name) {
    var s = SECTIONS[name], host = s && $(s.sel);
    if (!host) return false;
    try { s.fn(host); return true; }
    catch (e) {
      try { host.innerHTML = note("이 영역을 지금 보여 드리지 못했어요. 다른 영역은 그대로 볼 수 있어요."); } catch (e2) {}
      if (window.console && window.console.error) window.console.error("[LivonHome] " + name, e && e.message);
      return false;
    }
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
      /* choosing or changing the stage happens in the one place that owns it (onboarding); Home stores nothing */
      var onboard = e.target.closest("[data-lv-hm-onboard]");
      if (onboard) {
        e.preventDefault();
        if (window.LivonPlatform && typeof window.LivonPlatform.openOnboarding === "function") window.LivonPlatform.openOnboarding();
        else location.hash = "life";
        return;
      }
      var svc = e.target.closest("[data-lv-hm-svc]");
      if (svc) {
        e.preventDefault();
        state.svcIdx = Number(svc.getAttribute("data-lv-hm-svc")) || 0;
        renderSvcPanel();
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
        var q = String(new FormData(exForm).get("q") || "").trim().slice(0, 80);
        location.hash = q ? "ex-results?q=" + encodeURIComponent(q) : "explore";
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
    /* the personal hub first; the day model is read once and shared by 오늘 and 내 생활 */
    try { hubDay = todayModel(); } catch (e) { hubDay = null; }
    ORDER.forEach(safe);
    hubDay = null;
    /* introduction below the hub */
    try {
      var pref = getStagePref();
      if (pref) {
        var idx = STAGES.findIndex(function (s) { return s.id === pref; });
        if (idx >= 0) state.stageIdx = idx;
      }
      renderStagePanel();
    } catch (e) {}
    try { renderSvcPanel(); } catch (e2) {}
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
    var hash = (location.hash || "").slice(1);
    /* render once: onShow renders when home is the current view, otherwise render in the background */
    if (document.documentElement.dataset.lvView === "home") onShow(hash || "livon-home");
    else renderAll();
  }

  /* render(): other screens call it after a profile change; before Home has started there is nothing to refresh */
  window.LivonHome = { onShow: onShow, search: unifiedSearch, render: function () { if (window.LivonBoot && !window.LivonBoot.isStarted("home")) return; renderAll(); } };

  if (window.LivonBoot && typeof window.LivonBoot.view === "function") window.LivonBoot.view("home", init);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
