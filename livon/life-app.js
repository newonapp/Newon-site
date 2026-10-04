(function () {
  var root = document.getElementById("lv-life-root");
  if (!root) return;
  var KEY = "livon.life.v1";
  var decades = [
    { id: "10", n: "01", age: "10대", title: "가능성을 발견하는 시기", lead: "학업, 진로, 진학과 첫 경험을 탐색하는 시기입니다.", fields: ["학업 및 학습", "진로 탐색", "고등학교 진학", "대학·전공", "자격증·어학", "취미·동아리", "봉사·대외활동", "첫 아르바이트", "금융 기초", "디지털 안전"], checks: ["관심 분야를 세 가지 적기", "진학 일정 정리하기", "학습 목표 하나 정하기", "활동 기록 남기기"], minor: true },
    { id: "20", n: "02", age: "20대", title: "나만의 삶을 시작하는 시기", lead: "대학, 첫 직장, 독립과 주거를 준비하는 시기입니다.", fields: ["대학·전공", "취업·첫 직장", "아르바이트·프리랜서", "자격증", "첫 독립·자취", "월세·전세", "저축", "연애·결혼 준비", "건강", "창업"], checks: ["이력서에 넣을 경험 정리하기", "독립 예산 적기", "주거 계약 전 확인할 항목 보기", "한 달 생활비 항목 나누기"] },
    { id: "30", n: "03", age: "30대", title: "삶의 기반을 넓혀가는 시기", lead: "경력, 주거, 가족과 생활비를 함께 살피는 시기입니다.", fields: ["경력·이직", "결혼·신혼", "주거·이사", "가계", "임신·출산·육아", "자녀 교육", "건강 습관", "일과 생활", "보험 정보", "자기계발"], checks: ["이직 준비 항목 고르기", "이사 일정 적기", "이번 달 생활비 항목 적기", "가족 일정 하나 정하기"] },
    { id: "40", n: "04", age: "40대", title: "삶의 균형을 만들어가는 시기", lead: "일과 가족, 건강과 이후의 생활을 함께 준비하는 시기입니다.", fields: ["경력 관리", "자녀 교육", "가족 생활", "주택·자산", "건강검진", "부모님 돌봄", "노후 준비", "취미", "가족 여가", "지역 활동"], checks: ["건강검진 일정 적기", "가족 할 일 하나 정하기", "돌봄이 필요하면 확인할 정보 적기", "노후 준비 질문 적기"] },
    { id: "50", n: "05", age: "50대", title: "새로운 가능성을 준비하는 시기", lead: "은퇴, 재취업, 건강과 새로운 배움을 준비하는 시기입니다.", fields: ["은퇴 준비", "재취업", "연금·재무", "자녀 독립", "부모님 돌봄", "건강·운동", "취미·여행", "평생교육", "지역 모임", "주거 변화"], checks: ["은퇴 전 확인할 항목 적기", "재취업 관심 분야 적기", "운동 일정 하나 정하기", "배우고 싶은 주제 적기"] },
    { id: "60", n: "06", age: "60대", title: "새로운 일상을 시작하는 시기", lead: "은퇴 이후의 생활, 건강, 배움과 지역 활동을 이어가는 시기입니다.", fields: ["은퇴 이후 생활", "재취업·사회참여", "연금·복지", "건강·식생활", "여행·취미", "평생교육", "봉사", "디지털 생활", "가족", "주거 편의"], checks: ["한 주 생활 일정 적기", "확인하고 싶은 복지 분야 적기", "취미 하나 정하기", "가족 일정 공유 항목 적기"] },
    { id: "70", n: "07", age: "70대 이상", title: "나다운 일상을 이어가는 시기", lead: "건강, 안전, 생활 편의와 가족 소통을 중심으로 일상을 이어가는 시기입니다.", fields: ["건강·일상", "안전·주거", "이동 지원", "복지·돌봄", "가족 소통", "취미·모임", "지역 정보", "디지털 안내", "식생활·운동", "생활 관리"], checks: ["오늘 일정 적기", "주거 안전 점검 항목 보기", "가족 연락 일정 적기", "필요한 생활 편의 적기"], senior: true }
  ];
  var firsts = [
    { id: "adult", title: "첫 성인과 사회생활", items: ["첫 성인", "첫 대학", "첫 아르바이트", "첫 근로계약", "첫 취업", "첫 직장", "첫 월급", "첫 퇴사", "첫 이직", "첫 프리랜서", "첫 사회생활", "첫 자격증"] },
    { id: "money", title: "첫 경제와 금융", items: ["첫 통장", "첫 체크카드", "첫 신용카드", "첫 저축", "첫 적금", "첫 투자", "첫 주식", "첫 대출", "첫 보험", "첫 세금 신고", "첫 신용관리", "첫 자산 계획"], money: true },
    { id: "home", title: "첫 독립과 주거", items: ["첫 자취", "첫 독립", "첫 집 구하기", "첫 월세", "첫 전세", "첫 임대차계약", "첫 이사", "첫 가구", "첫 공과금", "첫 자동차", "첫 주택 마련"] },
    { id: "family", title: "첫 연애와 가족", items: ["첫 연애", "첫 동거", "첫 결혼", "첫 신혼집", "첫 임신", "첫 출산", "첫 육아", "첫 자녀 교육", "첫 반려동물", "첫 가족 돌봄"] },
    { id: "health", title: "첫 건강과 자기관리", items: ["첫 운동", "첫 헬스장", "첫 러닝", "첫 건강검진", "첫 식단 관리", "첫 병원 예약", "첫 심리상담", "첫 수면 관리", "첫 생활 습관"], health: true },
    { id: "biz", title: "첫 창업과 경제활동", items: ["첫 부업", "첫 프리랜서", "첫 창업", "첫 사업자등록", "첫 매출", "첫 세금 신고", "첫 직원 채용", "첫 사업 확장", "첫 온라인 판매", "첫 브랜드"] },
    { id: "trip", title: "첫 여행과 새로운 도전", items: ["첫 해외여행", "첫 여권", "첫 비행기", "첫 혼자 여행", "첫 유학", "첫 워킹홀리데이", "첫 장기 여행", "첫 취미", "첫 봉사", "첫 새로운 지역"] },
    { id: "retire", title: "첫 은퇴와 인생 2막", items: ["첫 은퇴", "첫 연금 수령", "첫 재취업", "첫 귀농·귀촌", "첫 시니어 교육", "첫 부모 돌봄", "첫 노후 설계", "첫 지역사회 활동"] },
    { id: "digital", title: "첫 디지털 생활", items: ["첫 스마트폰", "첫 온라인 결제", "첫 인터넷뱅킹", "첫 모바일 예약", "첫 온라인 쇼핑", "첫 AI 서비스", "첫 온라인 민원", "첫 디지털 금융"] },
    { id: "civic", title: "첫 생활 서비스 이용", items: ["첫 병원 방문", "첫 은행 업무", "첫 행정기관", "첫 공공서비스", "첫 법률 상담", "첫 보험 청구", "첫 생활 수리", "첫 전문 서비스"] }
  ];
  var events = ["진학과 새로운 배움", "취업과 이직", "퇴사와 경력 전환", "독립과 주거 이동", "결혼과 가족 구성의 변화", "임신·출산·육아", "자녀의 성장과 교육", "건강과 생활 습관의 변화", "가족 돌봄과 부양", "은퇴와 새로운 사회활동", "새로운 지역으로의 이동", "경제적 상황과 생활비의 변화", "가족관계 및 생활환경의 변화", "새로운 취미와 삶의 목표", "디지털 생활환경의 변화"];
  var services = ["교육·진로", "취업·직장·경제활동", "금융·자산·보험", "주거·부동산·이사", "건강·운동·생활관리", "연애·결혼·가족", "임신·출산·육아·교육", "시니어·은퇴·돌봄", "여행·문화·여가", "쇼핑·생활 편의", "공공서비스·행정·법률 정보", "디지털 생활·AI"];
  var supportTopics = [
    { id: "youth", title: "청소년 교육 및 활동", decades: ["10"] },
    { id: "young", title: "대학생 및 청년 지원", decades: ["20"] },
    { id: "job", title: "취업 및 직업훈련", decades: ["20", "30", "40", "50"] },
    { id: "house", title: "주거 및 독립", decades: ["20", "30"] },
    { id: "birth", title: "임신·출산·육아", decades: ["20", "30", "40"] },
    { id: "child", title: "자녀 교육 및 가족", decades: ["30", "40"] },
    { id: "mid", title: "중장년 재취업", decades: ["40", "50", "60"] },
    { id: "pension", title: "연금 및 노후", decades: ["50", "60", "70"] },
    { id: "care", title: "시니어 복지 및 돌봄", decades: ["60", "70"] },
    { id: "local", title: "지역별 생활 지원", decades: ["10", "20", "30", "40", "50", "60", "70"] }
  ];
  var shops = ["대학생활 준비물", "첫 자취·독립 준비물", "취업·직장 용품", "결혼·신혼 용품", "임신·출산·육아 용품", "자녀 교육 용품", "건강·운동 용품", "여행·취미 용품", "시니어 생활 편의", "돌봄·안전 용품"];
  var partners = [
    { name: "Newon+", href: "/ko/portfolio/newon-plus/", note: "통합 계정 소개. 라이프 스테이지와 데이터는 연결되어 있지 않습니다." },
    { name: "Savy", href: "/ko/portfolio/savy/", note: "생활비 앱 소개. 기록이 자동으로 넘어오지 않습니다." },
    { name: "SubPing", href: "/ko/portfolio/subping/", note: "구독 앱 소개. 지출이 자동으로 연결되지 않습니다." },
    { name: "GoalUp", href: "/ko/portfolio/goalup/", note: "목표 앱 소개. 계획이 자동으로 동기화되지 않습니다." },
    { name: "CountUp", href: "/ko/portfolio/countup/", note: "일정 앱 소개. 일정이 자동으로 공유되지 않습니다." },
    { name: "FitOn", href: "/ko/portfolio/fiton/", note: "출시 예정. 운동 기록은 연결되어 있지 않습니다." },
    { name: "EatOn", href: "/ko/portfolio/eaton/", note: "출시 예정. 식생활 기록은 연결되어 있지 않습니다." },
    { name: "BabyLog", href: "/ko/portfolio/babylog/", note: "육아 앱 소개. 가족 기록이 자동으로 공유되지 않습니다." },
    { name: "PetLog", href: "/ko/portfolio/petlog/", note: "반려동물 앱 소개. 기록이 자동으로 공유되지 않습니다." },
    { name: "My World", href: "/ko/portfolio/myworld/", note: "여행 앱 소개. 일정이 자동으로 연결되지 않습니다." },
    { name: "Ongil", href: "/ko/ongil/", note: "시니어 생활 소개. 건강 기록과 일정은 자동으로 공유되지 않습니다." }
  ];
  var blank = function () {
    return { profile: { decade: "", situations: [], interests: [], events: [], goal: "", region: "", types: [] }, saved: [], checks: {}, plans: [], dismissed: [], tasks: [], large: false, view: "home", pick: "" };
  };
  var db = blank();
  try { db = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { db = blank(); }
  db.profile = Object.assign(blank().profile, db.profile || {});
  function save() {
    localStorage.setItem(KEY, JSON.stringify(db));
    var slot = document.querySelector("[data-lv-life-slot='tasks']");
    if (slot) slot.textContent = db.tasks.length ? "라이프 스테이지에서 가져온 할 일 " + db.tasks.length + "개" : "오늘의 할 일을 만들 수 있습니다.";
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function say(msg) {
    var live = root.querySelector("[data-lv-live]");
    if (live) live.textContent = msg;
  }
  function saved(id) { return db.saved.indexOf(id) !== -1; }
  function toggleSave(id, title) {
    var i = db.saved.indexOf(id);
    if (i >= 0) db.saved.splice(i, 1);
    else db.saved.push(id + "|" + title);
    save();
  }
  function guide(name) {
    return {
      intro: name + "을 시작하기 전에 순서와 준비물을 정리하는 가이드입니다.",
      before: ["지금 필요한 이유를 한 줄로 적습니다.", "기한과 예산을 직접 적습니다.", "확인할 기관이 있으면 공식 안내를 따로 찾습니다."],
      steps: ["상황을 적기", "준비물과 서류 목록 만들기", "예산 칸을 직접 채우기", "체크리스트를 순서대로 완료하기"],
      docs: ["신분 확인이 필요한 경우의 서류", "계약·신청에 쓰는 서류", "보관할 영수증과 안내문"],
      faq: ["비용은 상황마다 다릅니다. 금액은 직접 적습니다.", "자격과 신청 기간은 공식 안내에서 확인합니다."]
    };
  }
  function checksFor(id, items) {
    var done = 0;
    items.forEach(function (item, i) { if (db.checks[id + ":" + i]) done += 1; });
    return { done: done, total: items.length };
  }
  function bar(done, total) {
    var pct = total ? Math.round(done / total * 100) : 0;
    return '<div class="lv-bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div><p class="nls-note">완료 ' + done + ' / ' + total + ' · ' + pct + '%</p>';
  }
  function checkList(id, items) {
    return items.map(function (item, i) {
      var on = !!db.checks[id + ":" + i];
      return '<label class="lv-check"><input type="checkbox" data-lv-check="' + esc(id + ":" + i) + '"' + (on ? " checked" : "") + '> <span>' + esc(item) + '</span></label>';
    }).join("");
  }
  function back() { return '<button type="button" class="nls-btn nls-btn--ghost" data-lv-go="home">라이프 스테이지로</button>'; }
  function saveBtn(id, title) {
    return '<button type="button" class="nls-btn nls-btn--ghost" data-lv-save="' + esc(id) + '" data-lv-title="' + esc(title) + '">' + (db.saved.some(function (s) { return s.indexOf(id + "|") === 0; }) ? "저장 취소" : "내 생활에 저장") + '</button>';
  }
  function aiLink(q) {
    return '<a class="nls-btn" href="#livon-ai" data-lv-ai="' + esc(q) + '">LIVON AI로 이동</a>';
  }
  function communityLink(label) {
    return '<a class="nls-btn nls-btn--ghost" href="#community">커뮤니티 · ' + esc(label) + '</a>';
  }
  function renderHome() {
    var p = db.profile;
    var decade = decades.filter(function (d) { return d.id === p.decade; })[0];
    var plans = db.plans;
    var open = plans.filter(function (plan) { return plan.progress < 100; });
    var recs = [];
    if (decade) recs.push({ id: "rec-d-" + decade.id, title: decade.age + " 가이드", why: "선택한 생애주기와 관련됩니다.", go: "decade", pick: decade.id });
    (p.events || []).slice(0, 2).forEach(function (ev) {
      recs.push({ id: "rec-e-" + ev, title: ev, why: "준비 중으로 표시한 변화입니다.", go: "event", pick: ev });
    });
    recs = recs.filter(function (r) { return db.dismissed.indexOf(r.id) < 0; });
    var timeline = decades.map(function (d) {
      return '<button type="button" class="nls-node' + (p.decade === d.id ? " is-active" : "") + '" data-lv-go="decade" data-lv-pick="' + d.id + '"><span class="nls-node__age">' + esc(d.age) + '</span></button>';
    }).join("");
    return ''
      + '<section class="nls-hero" id="lv-life-hero"><p class="nls-kicker">LivOn Life Stage</p>'
      + '<h2 class="nls-hero__title">삶의 모든 단계에,<br>필요한 다음을.</h2>'
      + '<p class="nls-lead">10대부터 70대 이상까지. 지금의 나에게 필요한 정보와 서비스를 발견하고, 새로운 시작과 변화의 순간을 함께 준비하세요.</p>'
      + '<div class="nls-actions"><button type="button" class="nls-btn" data-lv-go="profile">나의 라이프 스테이지 시작하기</button><button type="button" class="nls-btn nls-btn--ghost" data-lv-jump="lv-life-ages">생애주기 전체 보기</button></div>'
      + '<div class="nls-sv" style="margin-top:1.5rem"><div class="nls-sv__head"><span>Life timeline</span></div><div class="nls-sv__rail">' + timeline + '</div></div></section>'
      + '<section class="nls-block"><header class="nls-head"><p class="nls-kicker">My stage</p><h2 class="nls-title">지금 나의 준비</h2></header>'
      + '<div class="lv-life-grid lv-life-grid--2">'
      + '<article class="nls-plat"><p class="nls-mini">생애주기</p><h3>' + esc(decade ? decade.age : "아직 선택하지 않음") + '</h3><p class="nls-note">로그인 없이 선택할 수 있습니다.</p></article>'
      + '<article class="nls-plat"><p class="nls-mini">준비 중인 변화</p><h3>' + esc((p.events && p.events[0]) || "없음") + '</h3><p class="nls-note">관심 분야 ' + (p.interests || []).length + '개</p></article>'
      + '<article class="nls-plat"><p class="nls-mini">진행 중인 계획</p><h3>' + open.length + '</h3><p class="nls-note">저장한 정보 ' + db.saved.length + '개 · 완료한 항목은 각 체크리스트에 표시됩니다.</p></article>'
      + '<article class="nls-plat"><p class="nls-mini">다음 활동</p><h3>' + esc(db.tasks[0] || "계획을 만들면 여기에 표시됩니다.") + '</h3></article>'
      + '</div>'
      + (recs.length ? '<div class="lv-life-grid" style="margin-top:1rem">' + recs.map(function (r) {
          return '<article class="nls-card"><p class="nls-mini">추천</p><h3>' + esc(r.title) + '</h3><p class="nls-note">' + esc(r.why) + '</p><div class="nls-actions"><button type="button" class="nls-btn" data-lv-go="' + r.go + '" data-lv-pick="' + esc(r.pick) + '">열기</button><button type="button" class="nls-btn nls-btn--ghost" data-lv-dismiss="' + esc(r.id) + '">관심 없음</button></div></article>';
        }).join("") + '</div>' : '')
      + '</section>'
      + '<section class="nls-block" id="lv-life-ages"><header class="nls-head"><p class="nls-kicker">01</p><h2 class="nls-title">연령별 생애주기</h2><p class="nls-lead">10대부터 70대 이상까지. 나이는 탐색 기준이며, 모든 단계를 볼 수 있습니다.</p></header>'
      + '<div class="nls-rail">' + decades.map(function (d) { return '<button type="button" class="nls-rail__btn" data-lv-go="decade" data-lv-pick="' + d.id + '"><em>' + d.n + '</em> <span>' + esc(d.age) + '</span></button>'; }).join("") + '</div>'
      + '<div class="lv-life-grid">' + decades.map(function (d) {
          return '<article class="nls-decade is-on"><div class="nls-decade__copy"><p class="nls-decade__n">' + d.n + '</p><p class="nls-decade__age">' + esc(d.age) + '</p><h3>' + esc(d.title) + '</h3><p class="nls-decade__lead">' + esc(d.lead) + '</p><button type="button" class="nls-btn" data-lv-go="decade" data-lv-pick="' + d.id + '">이 생애주기 열기</button></div></article>';
        }).join("") + '</div></section>'
      + '<section class="nls-block" id="lv-life-first"><header class="nls-head"><p class="nls-kicker">02</p><h2 class="nls-title">생애 첫 경험</h2></header><div class="lv-life-grid lv-life-grid--2">'
      + firsts.map(function (g) { return '<button type="button" class="nls-plat" data-lv-go="first" data-lv-pick="' + g.id + '" style="text-align:left"><p class="nls-mini">First</p><h3>' + esc(g.title) + '</h3><p class="nls-note">' + g.items.length + '가지</p></button>'; }).join("")
      + '</div></section>'
      + '<section class="nls-block"><header class="nls-head"><p class="nls-kicker">03</p><h2 class="nls-title">인생의 변화</h2></header><div class="lv-life-grid lv-life-grid--2">'
      + events.map(function (ev, i) { return '<button type="button" class="nls-card" data-lv-go="event" data-lv-pick="' + esc(ev) + '" style="text-align:left"><p class="nls-mini">' + String(i + 1).padStart(2, "0") + '</p><h3>' + esc(ev) + '</h3></button>'; }).join("")
      + '</div></section>'
      + '<section class="nls-block"><header class="nls-head"><p class="nls-kicker">Services</p><h2 class="nls-title">생활 서비스</h2><div class="lv-life-form"><label>검색<input type="search" data-lv-filter placeholder="분야 검색"></label></div></header><div class="lv-life-grid lv-life-grid--3" data-lv-services>'
      + services.map(function (name, i) { return '<button type="button" class="nls-card" data-lv-go="service" data-lv-pick="' + esc(name) + '" data-lv-find="' + esc(name) + '" style="text-align:left"><p class="nls-mini">' + String(i + 1).padStart(2, "0") + '</p><h3>' + esc(name) + '</h3></button>'; }).join("")
      + '</div><p class="nls-note" data-lv-filter-empty hidden>찾는 분야가 없습니다.</p></section>'
      + '<section class="nls-block"><div class="nls-actions">'
      + '<button type="button" class="nls-btn nls-btn--ghost" data-lv-go="support">공공지원 탐색</button>'
      + '<button type="button" class="nls-btn nls-btn--ghost" data-lv-go="people">전문가·지역 서비스</button>'
      + '<button type="button" class="nls-btn nls-btn--ghost" data-lv-go="shop">라이프 커머스</button>'
      + '<button type="button" class="nls-btn nls-btn--ghost" data-lv-go="plans">내 계획</button>'
      + '<button type="button" class="nls-btn nls-btn--ghost" data-lv-go="links">Newon 서비스</button>'
      + '</div><p class="nls-note">예약, 결제, 제휴 상담, 상품 구매는 연결되어 있지 않습니다. 사업 확장은 현재 운영 중인 서비스가 아닙니다.</p></section>';
  }
  function renderDecade() {
    var d = decades.filter(function (item) { return item.id === db.pick; })[0] || decades[0];
    var stat = checksFor("decade-" + d.id, d.checks);
    return '<section class="nls-hero"><p class="nls-kicker">' + d.n + ' · ' + esc(d.age) + '</p><h2 class="nls-hero__title">' + esc(d.title) + '</h2><p class="nls-lead">' + esc(d.lead) + '</p>'
      + '<div class="nls-actions">' + back() + '<button type="button" class="nls-btn" data-lv-set-decade="' + d.id + '">나의 생애주기로 두기</button>' + saveBtn("decade-" + d.id, d.age) + aiLink(d.age + "에 필요한 준비를 정리해 줘") + communityLink(d.age + " 생활") + (d.senior ? '<button type="button" class="nls-btn nls-btn--ghost" data-lv-large>큰 글씨</button><button type="button" class="nls-btn nls-btn--ghost" data-lv-speak>읽어 주기</button>' : "") + '</div>'
      + (d.minor ? '<p class="nls-note">10대 안내는 학습과 진로 준비에 한정합니다. 커뮤니티 글쓰기는 보호 조치가 생기기 전까지 열지 않습니다.</p>' : "")
      + (d.senior ? '<p class="nls-note">Ongil은 소개 화면으로만 이동합니다. 건강 기록과 일정은 자동으로 공유되지 않습니다. <a href="/ko/ongil/">Ongil 소개</a></p>' : "")
      + '</section><section class="nls-block"><h2 class="nls-title">주요 생활 분야</h2><ul class="nls-chips">' + d.fields.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join("") + '</ul>'
      + '<h3 style="margin-top:1.5rem">준비 체크리스트</h3>' + bar(stat.done, stat.total) + checkList("decade-" + d.id, d.checks)
      + '<p class="nls-note">지원 제도와 기관의 공식 목록은 아직 연결되어 있지 않습니다. 신청 가능 여부는 표시하지 않습니다.</p></section>';
  }
  function renderFirst() {
    var g = firsts.filter(function (item) { return item.id === db.pick; })[0] || firsts[0];
    return '<section class="nls-hero"><p class="nls-kicker">First</p><h2 class="nls-hero__title">' + esc(g.title) + '</h2><div class="nls-actions">' + back() + '</div></section>'
      + '<section class="nls-block"><div class="lv-life-form"><label>검색<input type="search" data-lv-filter placeholder="경험 검색"></label></div><div class="lv-life-grid lv-life-grid--2">'
      + g.items.map(function (name) { return '<button type="button" class="nls-card" data-lv-go="firstItem" data-lv-pick="' + esc(g.id + "::" + name) + '" data-lv-find="' + esc(name) + '" style="text-align:left"><h3>' + esc(name) + '</h3></button>'; }).join("")
      + '</div><p class="nls-note" data-lv-filter-empty hidden>찾는 경험이 없습니다.</p></section>';
  }
  function renderFirstItem() {
    var parts = String(db.pick).split("::");
    var name = parts[1] || parts[0];
    var g = guide(name);
    var id = "first-" + name;
    var stat = checksFor(id, g.steps);
    var money = firsts.some(function (group) { return group.money && group.items.indexOf(name) >= 0; });
    var health = firsts.some(function (group) { return group.health && group.items.indexOf(name) >= 0; });
    return '<section class="nls-hero"><p class="nls-kicker">Guide</p><h2 class="nls-hero__title">' + esc(name) + '</h2><p class="nls-lead">' + esc(g.intro) + '</p><div class="nls-actions"><button type="button" class="nls-btn nls-btn--ghost" data-lv-go="first" data-lv-pick="' + esc(parts[0]) + '">목록</button>' + saveBtn(id, name) + aiLink(name + " 준비 순서를 정리해 줘") + communityLink(name) + '</div>'
      + (money ? '<p class="nls-note">투자 상품을 추천하거나 수익을 보장하지 않습니다. 용어와 확인할 항목만 안내합니다.</p>' : "")
      + (health ? '<p class="nls-note">진단이나 치료를 대신하지 않습니다. 병원 이용 전 준비만 정리합니다.</p>' : "")
      + '</section><section class="nls-block"><h2 class="nls-title">시작 전</h2><ul class="nls-points">' + g.before.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>'
      + '<h3 style="margin-top:1.4rem">준비 단계</h3>' + bar(stat.done, stat.total) + checkList(id, g.steps)
      + '<h3 style="margin-top:1.4rem">서류와 예산</h3><ul class="nls-points">' + g.docs.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul><p class="nls-note">예상 비용은 비워 둡니다. 금액을 직접 적으면 계획에 저장됩니다.</p>'
      + '<div class="lv-life-form"><label>예상 비용<input data-lv-cost placeholder="직접 입력"></label><button type="button" class="nls-btn" data-lv-plan="' + esc(name) + '">이 경험으로 계획 만들기</button></div>'
      + '<h3 style="margin-top:1.4rem">자주 묻는 질문</h3><ul class="nls-points">' + g.faq.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>'
      + '<p class="nls-note">관련 기관 링크는 공식 출처가 확인되기 전까지 연결하지 않습니다.</p></section>';
  }
  function renderEvent() {
    var name = db.pick || events[0];
    var steps = ["현재 상황 적기", "시작일과 목표일 정하기", "필요한 정보와 서류 모으기", "예산 칸 채우기", "다음 할 일 하나 끝내기"];
    var id = "event-" + name;
    var stat = checksFor(id, steps);
    return '<section class="nls-hero"><p class="nls-kicker">Change</p><h2 class="nls-hero__title">' + esc(name) + '</h2><p class="nls-lead">지금 겪거나 곧 준비할 변화를 계획으로 남깁니다.</p><div class="nls-actions">' + back() + saveBtn(id, name) + aiLink(name + " 준비를 한 달 단위로 나눠 줘") + communityLink(name) + '</div></section>'
      + '<section class="nls-block"><form class="lv-life-form" data-lv-event-form><label>현재 상황<select name="situation"><option value="">선택 안 함</option><option>알아보는 중</option><option>준비 중</option><option>진행 중</option><option>마친 뒤 정리</option></select></label>'
      + '<label>시작일<input type="date" name="start"></label><label>목표일<input type="date" name="end"></label>'
      + '<label>희망 지역<input name="region" placeholder="선택"></label><label>예산<input name="budget" placeholder="직접 입력"></label>'
      + '<label>메모<textarea name="memo" rows="3"></textarea></label>'
      + '<button type="submit" class="nls-btn">준비 계획 저장</button></form>'
      + '<h3 style="margin-top:1.4rem">체크리스트</h3>' + bar(stat.done, stat.total) + checkList(id, steps) + '</section>';
  }
  function renderPlans() {
    if (!db.plans.length) return '<section class="nls-hero"><h2 class="nls-hero__title">아직 만든 계획이 없습니다.</h2><div class="nls-actions">' + back() + '</div></section>';
    return '<section class="nls-hero"><p class="nls-kicker">Plans</p><h2 class="nls-hero__title">내 계획</h2><div class="nls-actions">' + back() + '</div></section><section class="nls-block"><div class="lv-life-grid">'
      + db.plans.map(function (plan) {
          return '<article class="nls-plat"><p class="nls-mini">' + esc(plan.kind) + '</p><h3>' + esc(plan.title) + '</h3>' + bar(plan.done, plan.total) + '<p class="nls-note">' + esc(plan.detail || "") + '</p><button type="button" class="nls-btn nls-btn--ghost" data-lv-drop-plan="' + esc(plan.id) + '">계획 삭제</button></article>';
        }).join("") + '</div></section>';
  }
  function renderSupport() {
    var decade = db.profile.decade;
    var list = supportTopics.filter(function (t) { return !decade || t.decades.indexOf(decade) >= 0; });
    return '<section class="nls-hero"><p class="nls-kicker">Support</p><h2 class="nls-hero__title">공공지원 탐색</h2><p class="nls-lead">확인된 제도 데이터가 없습니다. 신청 가능한 제도처럼 보이지 않습니다.</p><div class="nls-actions">' + back() + '</div></section>'
      + '<section class="nls-block"><div class="lv-life-form"><label>연령대<select data-lv-support-age><option value="">전체</option>' + decades.map(function (d) { return '<option value="' + d.id + '"' + (decade === d.id ? " selected" : "") + '>' + esc(d.age) + '</option>'; }).join("") + '</select></label><label>지역<input data-lv-region value="' + esc(db.profile.region || "") + '" placeholder="선택"></label></div>'
      + '<div class="lv-life-grid">' + list.map(function (t) {
          return '<article class="nls-card"><h3>' + esc(t.title) + '</h3><p class="nls-note">공식 출처, 자격, 신청 기간, 서류가 확인되지 않았습니다. 최종 확인일 없음.</p>' + saveBtn("support-" + t.id, t.title) + '</article>';
        }).join("") + '</div></section>';
  }
  function renderPeople() {
    return '<section class="nls-hero"><p class="nls-kicker">Providers</p><h2 class="nls-hero__title">전문가와 지역 서비스</h2><p class="nls-lead">등록된 제휴 전문가가 없습니다. 제휴처럼 표시하지 않습니다.</p><div class="nls-actions">' + back() + '</div></section>'
      + '<section class="nls-block"><form class="lv-life-form" data-lv-people><label>분야<select name="field"><option>교육·진로</option><option>취업·경력</option><option>재무·세무</option><option>주거</option><option>법률</option><option>가족·육아</option><option>건강·생활</option><option>시니어·돌봄</option><option>생활 편의</option></select></label><label>지역<input name="region" placeholder="선택"></label><button type="submit" class="nls-btn">검색</button></form><p class="nls-note" data-lv-people-note>검색하면 이 문장이 유지됩니다. 예약과 결제는 없습니다.</p></section>';
  }
  function renderShop() {
    return '<section class="nls-hero"><p class="nls-kicker">Commerce</p><h2 class="nls-hero__title">라이프 커머스</h2><p class="nls-lead">검증된 상품, 가격, 구매 연결이 없습니다.</p><div class="nls-actions">' + back() + '</div></section><section class="nls-block"><div class="lv-life-grid lv-life-grid--2">'
      + shops.map(function (name) { return '<article class="nls-card"><h3>' + esc(name) + '</h3><p class="nls-note">상품 없음</p>' + saveBtn("shop-" + name, name) + '</article>'; }).join("")
      + '</div></section>';
  }
  function renderLinks() {
    return '<section class="nls-hero"><p class="nls-kicker">Newon</p><h2 class="nls-hero__title">다른 서비스</h2><p class="nls-lead">소개 화면으로만 이동합니다.</p><div class="nls-actions">' + back() + '</div></section><section class="nls-block"><div class="lv-life-grid">'
      + partners.map(function (p) { return '<a class="nls-plat" href="' + esc(p.href) + '"><h3>' + esc(p.name) + '</h3><p class="nls-note">' + esc(p.note) + '</p></a>'; }).join("")
      + '</div></section>';
  }
  function renderProfile() {
    var p = db.profile;
    function opts(list, selected) {
      return list.map(function (name) {
        var on = selected.indexOf(name) >= 0;
        return '<label class="lv-check"><input type="checkbox" name="multi" value="' + esc(name) + '"' + (on ? " checked" : "") + '> <span>' + esc(name) + '</span></label>';
      }).join("");
    }
    return '<section class="nls-hero"><p class="nls-kicker">Profile</p><h2 class="nls-hero__title">나의 생활 상황</h2><p class="nls-lead">모두 선택입니다. 비워 두어도 탐색할 수 있습니다.</p><div class="nls-actions">' + back() + '</div></section>'
      + '<section class="nls-block"><form class="lv-life-form" data-lv-profile><label>연령대<select name="decade"><option value="">선택 안 함</option>' + decades.map(function (d) { return '<option value="' + d.id + '"' + (p.decade === d.id ? " selected" : "") + '>' + esc(d.age) + '</option>'; }).join("") + '</select></label>'
      + '<fieldset><legend class="nls-mini">관심 생애주기와 같은 연령대 외의 단계도 홈에서 열 수 있습니다.</legend></fieldset>'
      + '<fieldset><legend class="nls-mini">관심 분야</legend>' + opts(services, p.interests || []) + '</fieldset>'
      + '<fieldset data-lv-events><legend class="nls-mini">준비 중인 변화</legend>' + opts(events, p.events || []) + '</fieldset>'
      + '<label>현재 목표<input name="goal" value="' + esc(p.goal || "") + '"></label>'
      + '<label>선호 지역<input name="region" value="' + esc(p.region || "") + '"></label>'
      + '<button type="submit" class="nls-btn">저장</button></form></section>';
  }
  function renderService() {
    var name = db.pick || services[0];
    return '<section class="nls-hero"><p class="nls-kicker">Service</p><h2 class="nls-hero__title">' + esc(name) + '</h2><p class="nls-lead">이 분야의 안내를 저장할 수 있습니다. 외부 예약은 연결되어 있지 않습니다.</p><div class="nls-actions">' + back() + saveBtn("service-" + name, name) + aiLink(name + "에서 지금 확인할 것") + communityLink(name) + '</div></section>';
  }
  function render() {
    var shell = document.getElementById("lifestage-detail");
    if (shell) shell.classList.toggle("is-large", !!db.large);
    var html = { home: renderHome, decade: renderDecade, first: renderFirst, firstItem: renderFirstItem, event: renderEvent, plans: renderPlans, support: renderSupport, people: renderPeople, shop: renderShop, links: renderLinks, profile: renderProfile, service: renderService }[db.view] || renderHome;
    root.innerHTML = '<p class="visually-hidden" data-lv-live aria-live="polite"></p>' + html();
  }
  function addPlan(title, kind, detail) {
    var id = "plan-" + Date.now();
    var steps = ["상황 확인", "일정 잡기", "서류와 비용 적기", "다음 할 일"];
    db.plans.unshift({ id: id, title: title, kind: kind, detail: detail, done: 0, total: steps.length, progress: 0 });
    if (db.tasks.indexOf(title) < 0) db.tasks.unshift(title);
    save();
    db.view = "plans";
    render();
    say(title + " 계획을 저장했습니다. 내 생활 할 일에 표시됩니다.");
  }
  root.addEventListener("click", function (event) {
    var go = event.target.closest("[data-lv-go]");
    if (go) {
      db.view = go.getAttribute("data-lv-go");
      db.pick = go.getAttribute("data-lv-pick") || "";
      render();
      root.scrollIntoView({ block: "start" });
      return;
    }
    var jump = event.target.closest("[data-lv-jump]");
    if (jump) {
      var el = document.getElementById(jump.getAttribute("data-lv-jump"));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    var saveNode = event.target.closest("[data-lv-save]");
    if (saveNode) {
      var sid = saveNode.getAttribute("data-lv-save");
      var title = saveNode.getAttribute("data-lv-title");
      var exists = db.saved.some(function (s) { return s.indexOf(sid + "|") === 0; });
      db.saved = db.saved.filter(function (s) { return s.indexOf(sid + "|") !== 0; });
      if (!exists) db.saved.push(sid + "|" + title);
      save();
      render();
      say(exists ? "저장을 취소했습니다." : "내 생활에 저장했습니다.");
      return;
    }
    var dismiss = event.target.closest("[data-lv-dismiss]");
    if (dismiss) {
      db.dismissed.push(dismiss.getAttribute("data-lv-dismiss"));
      save();
      render();
      return;
    }
    var setDecade = event.target.closest("[data-lv-set-decade]");
    if (setDecade) {
      db.profile.decade = setDecade.getAttribute("data-lv-set-decade");
      save();
      say("생애주기를 저장했습니다.");
      return;
    }
    var planBtn = event.target.closest("[data-lv-plan]");
    if (planBtn) {
      var cost = root.querySelector("[data-lv-cost]");
      addPlan(planBtn.getAttribute("data-lv-plan"), "첫 경험", cost && cost.value ? "예상 비용 " + cost.value : "");
      return;
    }
    var drop = event.target.closest("[data-lv-drop-plan]");
    if (drop) {
      db.plans = db.plans.filter(function (plan) { return plan.id !== drop.getAttribute("data-lv-drop-plan"); });
      save();
      render();
      say("계획을 삭제했습니다.");
      return;
    }
    if (event.target.closest("[data-lv-large]")) {
      db.large = !db.large;
      save();
      render();
      return;
    }
    if (event.target.closest("[data-lv-speak]")) {
      var title = root.querySelector("h2");
      if (title && window.speechSynthesis) speechSynthesis.speak(new SpeechSynthesisUtterance(title.textContent));
      else say("이 브라우저에서는 읽어 주기를 사용할 수 없습니다.");
      return;
    }
    var ai = event.target.closest("[data-lv-ai]");
    if (ai) sessionStorage.setItem("livon.ai.prompt", ai.getAttribute("data-lv-ai") || "");
  });
  root.addEventListener("change", function (event) {
    var box = event.target.closest("[data-lv-check]");
    if (!box) return;
    db.checks[box.getAttribute("data-lv-check")] = box.checked;
    db.plans.forEach(function (plan) {
      var prefix = "event-" + plan.title + ":";
      if (box.getAttribute("data-lv-check").indexOf(prefix) !== 0 && box.getAttribute("data-lv-check").indexOf("first-" + plan.title + ":") !== 0) return;
    });
    var title = db.pick && String(db.pick).split("::").pop();
    db.plans.forEach(function (plan) {
      if (plan.title !== title && plan.title !== db.pick) return;
      var keys = Object.keys(db.checks).filter(function (k) { return k.indexOf(plan.title) >= 0 && db.checks[k]; });
      plan.done = keys.length;
      plan.progress = plan.total ? Math.round(plan.done / plan.total * 100) : 0;
    });
    save();
    var note = root.querySelector(".lv-bar");
    if (note) render();
    say(box.checked ? "완료로 저장했습니다." : "완료를 해제했습니다.");
  });
  root.addEventListener("input", function (event) {
    var filter = event.target.closest("[data-lv-filter]");
    if (!filter) return;
    var q = filter.value.trim();
    var any = false;
    root.querySelectorAll("[data-lv-find]").forEach(function (node) {
      var show = !q || node.getAttribute("data-lv-find").indexOf(q) >= 0;
      node.hidden = !show;
      if (show) any = true;
    });
    var empty = root.querySelector("[data-lv-filter-empty]");
    if (empty) empty.hidden = any;
  });
  root.addEventListener("submit", function (event) {
    event.preventDefault();
    var form = event.target;
    if (form.hasAttribute("data-lv-profile")) {
      var data = new FormData(form);
      var interests = [];
      var evs = [];
      form.querySelectorAll("input[name='multi']").forEach(function (box) {
        if (!box.checked) return;
        if (box.closest("[data-lv-events]")) evs.push(box.value);
        else interests.push(box.value);
      });
      db.profile.decade = data.get("decade") || "";
      db.profile.goal = data.get("goal") || "";
      db.profile.region = data.get("region") || "";
      db.profile.interests = interests;
      db.profile.events = evs;
      save();
      db.view = "home";
      render();
      say("생활 상황을 저장했습니다.");
      return;
    }
    if (form.hasAttribute("data-lv-event-form")) {
      var data2 = new FormData(form);
      var bits = [data2.get("situation"), data2.get("start"), data2.get("end"), data2.get("region"), data2.get("budget"), data2.get("memo")].filter(Boolean).join(" · ");
      addPlan(db.pick || "인생 이벤트", "인생의 변화", bits);
      return;
    }
    if (form.hasAttribute("data-lv-people")) {
      var note = root.querySelector("[data-lv-people-note]");
      if (note) note.textContent = "조건에 맞는 제휴 전문가가 없습니다.";
      say("검색 결과가 없습니다.");
    }
  });
  root.addEventListener("change", function (event) {
    var age = event.target.closest("[data-lv-support-age]");
    if (!age) return;
    db.profile.decade = age.value;
    save();
    render();
  });
  save();
  render();
})();
