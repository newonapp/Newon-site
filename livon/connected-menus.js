(function () {
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
  CONNECT_MENUS.unshift({
      id: "life", n: "01", label: "LIFE STAGE", title: "지금의 나에게 필요한 다음을.",
      desc: "10대부터 70대 이후까지. 생애 단계별 생활 정보와 준비 과정을 탐색하세요.",
      feats: ["생애 단계별 생활 가이드", "주요 생활 주제", "상황별 준비 정보", "관련 서비스 연결"],
      href: "#life", cta: "라이프 스테이지 살펴보기",
      wordmark: "LIFE STAGE", slogan: "삶의 모든 단계에,<br>필요한 다음을.",
      video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4"
    });
  var escape = function (value) { return String(value).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  document.querySelectorAll('[data-lv-connect]').forEach(function (host) {
    var destinations = host.dataset.lvConnect === 'today' ? ['#life','#life-now','#explore','#community','#livon-ai'] : ['#life','#today','#explore','#life-now','/ongil-start/#ongil-home'];
    var menus = destinations.map(function (href) { return CONNECT_MENUS.find(function (m) { return m.href === href; }); });
    var prefix = 'connect-' + host.dataset.lvConnect;
    host.innerHTML = '<div class="lv-life-showcase"><div class="lv-life-showcase__nav" role="tablist" aria-label="연결 메뉴"></div><article class="lv-life-showcase__panel" role="tabpanel" tabindex="0" id="'+prefix+'-panel"></article></div>';
    var nav = host.querySelector('[role="tablist"]'), panel = host.querySelector('[role="tabpanel"]');
    nav.innerHTML = menus.map(function (m, i) { return '<button type="button" role="tab" id="'+prefix+'-'+i+'" aria-controls="'+prefix+'-panel"><em>'+String(i+1).padStart(2,'0')+'</em><span>'+escape(m.label)+'</span></button>'; }).join('');
    var buttons = Array.from(nav.children);
    function select(index) {
      buttons.forEach(function (button, i) { button.classList.toggle('is-on', i === index); button.setAttribute('aria-selected', i === index); button.tabIndex = i === index ? 0 : -1; });
      var m = menus[index];
      panel.setAttribute('aria-labelledby', buttons[index].id);
      panel.innerHTML = '<div class="lv-life-svc-card"><div class="lv-life-svc-card__copy"><p class="lv-life-eyebrow">'+String(index+1).padStart(2,'0')+' · '+escape(m.label)+'</p><h3>'+escape(m.title)+'</h3><p>'+escape(m.desc)+'</p><ul>'+m.feats.map(function (f) { return '<li>'+escape(f)+'</li>'; }).join('')+'</ul><a class="lv-life-btn" href="'+escape(m.href)+'">'+escape(m.cta)+'</a></div><div class="lv-life-svc-card__film"><video class="lv-life-svc-card__video" muted loop playsinline preload="none" src="'+escape(m.video)+'"></video><div class="lv-life-svc-card__veil"></div><div class="lv-life-svc-card__lockup"><p class="lv-life-svc-card__wordmark">'+escape(m.wordmark)+'</p><p class="lv-life-svc-card__slogan">'+m.slogan+'</p></div></div></div>';
      observer.disconnect();
      observer.observe(panel.querySelector('video'));
    }
    var observer = new IntersectionObserver(function (entries) { entries.forEach(function (entry) { var video = entry.target; if (entry.isIntersecting && !matchMedia('(prefers-reduced-motion: reduce)').matches) { video.play().catch(function () {}); } else { video.pause(); } }); });
    buttons.forEach(function (button, index) {
      button.addEventListener('click', function () { select(index); });
      button.addEventListener('keydown', function (event) {
        var next = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % menus.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + menus.length - 1) % menus.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = menus.length - 1;
        else return;
        event.preventDefault(); select(next); buttons[next].focus();
      });
    });
    select(0);
  });
})();
