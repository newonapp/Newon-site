/**
 * About page copy (KO / EN). Structural lists live with the page body builder.
 *
 * Corporate positioning (2026-10): NEWON is a digital platform company that plans,
 * builds and runs six core platforms (BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL),
 * with Business & Partnerships and NEWON Studio (own digital products — never outsourcing).
 *
 * Facts rules:
 * - Platform status follows each platform's own page (/{lang}/{platform}/).
 * - Figures come from verifiedFacts() in about-page-body.mjs — never invent numbers.
 *   Removed as unverifiable in the repo: 177 countries, 13 languages, "13+ products", "EST. 2026".
 * - Journey milestones only from git history / news data; no invented dates.
 *
 * Other locales (ja, es, pt-br, fr, de, hi, id) render the EN copy — as the About body already
 * did (buildAboutPageBody maps every non-ko locale to "en"), and like the Business &
 * Partnerships, Studio and platform pages. The machine-translated packs in
 * scripts/i18n/packs/{lang}/about-page.json describe the retired "Product & Venture Studio"
 * identity and are not applied; re-translate them from this EN copy before using them.
 */
import { resolveCopyLang } from "./i18n/copy-lang.mjs";

export function getAboutPageCopy(lang) {
  const L = resolveCopyLang(lang);
  if (L === "ko") return KO;
  return EN;
}

const KO = {
  seoTitle: "회사 소개 | Newon",
  metaDescription:
    "NEWON은 육아·반려생활·여행·자산 공유·생애주기·시니어 라이프의 6개 핵심 플랫폼을 직접 만들고 운영하는 디지털 플랫폼 기업입니다.",
  metaKeywords:
    "NEWON, 뉴온, 디지털 플랫폼 기업, BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL, NEWON Business & Partnerships, NEWON Studio",
  brandAria: "Newon",
  brandMarkAlt: "Newon",
  brandWord: "Newon",
  brandLine: "6개 핵심 플랫폼",
  brandCrumb: "회사 / ABOUT",
  brandScroll: "아래로 스크롤",
  brandPointTitle: "NEWON CARD",
  brandPointSub: "디지털 명함으로 만나는 Newon",
  brandPointBadge: "DIGITAL",
  brandMetaLeft: "NEWON",
  brandMetaRight: "6 PLATFORMS",
  brandKicker: "NEW + ON",
  brandTag: "BABYLOG · PETLOG · MY WORLD · SHAREON · LIVON · ONGIL",
  brandDomainsAria: "6개 핵심 플랫폼",
  brandDomains: ["BABYLOG", "PETLOG", "MY WORLD", "SHAREON", "LIVON", "ONGIL"],
  brandMeaning: "새로운 일상의 경험을 실제로 작동하게 만듭니다.",
  heroEyebrow: "ABOUT NEWON",
  heroTitleHtml: "일상을 연결하는<br />디지털 플랫폼 기업.",
  heroLeadHtml:
    "NEWON은 육아, 반려생활, 여행, 자산 공유, 생애주기, 시니어 라이프 분야의 여섯 플랫폼을 직접 기획하고 개발합니다.",
  heroNameAria: "New + On",
  heroNameKicker: "NEW + ON",
  heroNameNew: "NEW",
  heroNameNewDesc: "새로운 일상의 경험",
  heroNameOn: "ON",
  heroNameOnDesc: "실제로 작동하는 서비스",
  heroNameNote:
    "새로운(New) 일상의 경험을 실제로 작동하게(On) 만든다는 의미를 담고 있습니다.",
  cardAria: "Newon 디지털 명함 열기",
  cardAlt: "Newon 명함",
  cardHint: "디지털 명함 · 터치하여 열기",
  ctaProducts: "6개 플랫폼 →",
  ctaProductsHref: "#ab-build-title",
  ctaBusiness: "비즈니스·파트너십 →",
  ctaBusinessHref: "../business/",

  metricItems: [
    { key: "platforms", label: "PLATFORMS" },
    { key: "businessAreas", label: "BUSINESS AREAS" },
    { key: "languages", label: "SITE LANGUAGES" },
    { key: "apps", label: "APPS RELEASED" },
  ],
  metricLabels: {
    apps: "APPS",
    products: "PRODUCTS",
    countries: "COUNTRIES",
    languages: "LANGUAGES",
  },

  /* 2 · WHO WE ARE */
  whyEyebrow: "WHO WE ARE",
  whyTitle: "자체 플랫폼을 만들고 운영하는 기업.",
  whyTagline: "New + On",
  whyTaglineEn: "TURN POSSIBILITIES ON",
  whyBody: [
    "NEWON은 일상의 다양한 영역을 연결하는 디지털 플랫폼 기업입니다. 고객의 의뢰를 받아 대신 만들어 주는 회사가 아니라, 직접 기획하고 개발한 자체 플랫폼과 디지털 제품으로 사업을 하는 회사입니다.",
    "육아, 반려생활, 여행, 자산 공유, 생애주기, 시니어 라이프는 서로 다른 영역이지만, 기록을 남기고, 믿을 수 있는 정보를 찾고, 필요한 서비스와 연결되어야 한다는 같은 필요를 갖고 있습니다. NEWON은 이 공통의 필요를 각 영역에 맞는 여섯 개의 플랫폼으로 풀어 갑니다.",
    "NEWON이라는 이름은 New + On에서 시작했습니다. 새로운(New) 일상의 경험을 실제로 작동하게(On) 만들고, 각 플랫폼의 사용자 경험을 꾸준히 개선하며, 개인과 기업이 함께 참여하는 지속 가능한 디지털 생태계를 만드는 것을 지향합니다.",
  ],
  whyNewCols: [
    {
      head: "NEW",
      items: ["새로운 일상 경험", "새로운 연결 방식", "새로운 참여 기회", "새로운 가능성"],
    },
    {
      head: "ON",
      items: ["직접 기획하기", "직접 개발하기", "운영하며 개선하기", "생태계로 넓히기"],
    },
  ],
  missionEyebrow: "OUR PHILOSOPHY",
  missionTitle: "영역마다 맞는 플랫폼을 만듭니다.",
  missionLead:
    "하나의 앱에 모든 기능을 담기보다, 영역마다 필요한 기록·정보·서비스를 그 영역의 이용자에게 맞게 설계합니다. NEWON이 여섯 개의 플랫폼을 따로 운영하는 이유입니다.",
  missionPoints: [
    {
      n: "01",
      title: "FOCUS",
      body: "육아와 시니어 돌봄, 여행과 자산 대여는 이용자도 필요도 다릅니다. 플랫폼마다 한 영역에 집중해 그 영역의 문제를 깊게 다룹니다.",
    },
    {
      n: "02",
      title: "OWN & OPERATE",
      body: "플랫폼을 직접 기획·개발하고 운영합니다. 출시 후에도 이용자의 사용 흐름과 의견을 바탕으로 계속 고쳐 나갑니다.",
    },
    {
      n: "03",
      title: "OPEN ECOSYSTEM",
      body: "개인은 서비스를 이용하고, 기업과 기관은 입점·제휴·협력으로 참여합니다. 각 플랫폼이 개인과 기업을 잇는 연결점이 되도록 만듭니다.",
    },
  ],

  /* 3 · OUR SIX PLATFORMS — status wording follows each platform page */
  buildEyebrow: "OUR SIX PLATFORMS",
  buildTitle: "여섯 개의 핵심 플랫폼.",
  buildMeta: "NEWON · 6",
  buildBoardLabel: "PLATFORMS",
  buildBoardTags: "BABYLOG · PETLOG · MY WORLD · SHAREON · LIVON · ONGIL",
  buildAreas: [
    {
      n: "01",
      title: "BABYLOG — Parenting & Family",
      body: "임신 준비부터 출산, 육아, 성장 기록과 가족생활까지 흩어지기 쉬운 아이와 가족의 기록과 정보를 하나로 잇습니다. 예비 부모와 아이를 키우는 가족, 함께 돌보는 보호자가 주요 이용 대상이며, 지금은 iOS와 Android 앱에서 육아 기록, 성장·건강 기록, 일정 관리와 가족 공유를 제공합니다. 가족은 같은 기록을 함께 이어 가고, 육아·교육·돌봄 분야의 기업과 기관은 제휴와 협력으로 참여하는 방향을 지향합니다.",
      tags: ["육아 기록", "성장·건강 기록", "가족 공유", "교육·돌봄"],
      href: "../babylog/",
    },
    {
      n: "02",
      title: "PETLOG — Pet Life",
      body: "반려동물의 일상과 건강 이력, 예방접종·병원 일정이 보호자마다 따로 흩어지는 문제를 줄입니다. 반려동물과 함께 사는 보호자와 가족이 주요 이용 대상이며, 지금은 PETLOG 앱에서 프로필과 일상·건강 기록, 예방접종·병원 일정, 가족 공동 관리를 이용할 수 있습니다. 반려생활 정보와 커뮤니티는 준비하고 있는 영역이며, 반려동물 브랜드와 생활·돌봄 서비스 사업자의 참여는 앞으로의 협력 방향입니다.",
      tags: ["일상·건강 기록", "예방접종·병원 일정", "가족 공동 관리", "반려생활 서비스"],
      href: "../petlog/",
    },
    {
      n: "03",
      title: "MY WORLD — Travel & Experience",
      body: "여행의 탐색, 계획, 예약, 기록, 공유가 여러 서비스에 흩어져 있는 문제에서 출발합니다. 여행자가 주요 이용 대상이며, 지금 MY WORLD 앱은 방문한 국가와 도시를 홈 화면의 세계지도에 기록하고 이동 경로·사진·통계·AI 여행 리포트로 여행을 돌아보는 여행 기록 서비스입니다. 예약·커머스·공유형 커뮤니티는 단계적으로 준비하고 있으며, 여행사·숙박·투어 사업자와 브랜드, 지역과 기관이 여행자를 만나는 구조를 함께 만들어 가려 합니다.",
      tags: ["세계지도 여행 기록", "여행 계획", "예약·체험", "여행자 커뮤니티"],
      href: "../myworld/",
    },
    {
      n: "04",
      title: "SHAREON — Sharing & Rental",
      body: "자주 쓰지 않지만 사기에는 부담스러운 물건, 쓰지 않는 시간이 긴 장비와 공간의 문제를 다룹니다. 필요한 기간만 빌리려는 이용자와 물건·장비·공간을 가진 개인·기업 공급자를 잇는 공유·대여 오픈 마켓플레이스를 지향합니다. SHAREON 앱은 출시 전으로, 지금은 실제 대여·예약 확정·결제·보증금·정산이 운영되지 않으며 첫 출시는 대여·공간 중심의 승인형 예약으로 준비하고 있습니다.",
      tags: ["물건", "장비", "공간", "이동수단"],
      href: "../shareon/",
    },
    {
      n: "05",
      title: "LIVON — Life Stage",
      body: "교육, 진로, 취업, 군 복무, 금융, 주거, 결혼, 출산, 가족, 건강, 복지, 은퇴까지 삶의 단계마다 필요한 정보가 여러 곳에 흩어진 문제를 다룹니다. 10대부터 70대 이상까지 지금의 생애 단계에서 출발하는 통합 라이프 플랫폼으로, 현재 LIVON 앱 출시를 준비하고 있습니다. 공공 제도는 공식 출처와 기준일을 함께 표시하며, 교육·채용·생활정보 분야의 기업과 공공기관 협력을 지향합니다.",
      tags: ["생애 단계별 정보", "공공 제도 안내", "생활 기록", "교육·진로·복지"],
      href: "../livon/",
    },
    {
      n: "06",
      title: "ONGIL — Senior Life",
      body: "시니어가 자신의 속도와 방식으로 일상을 이어 갈 수 있도록 생활정보와 가족 연결, 돌봄·복지 정보를 잇습니다. 시니어 본인과 가족이 주요 이용 대상이며, 현재 iOS·Android 앱의 국내 첫 출시를 준비하고 있습니다. 돌봄 사업자, 복지기관, 기업·지자체와의 협력을 검토하고 있으며, 공식 제휴가 확정된 기관은 아직 없습니다.",
      tags: ["일상생활", "건강 기록", "가족 연결", "돌봄·복지 안내"],
      href: "../ongil/",
    },
  ],

  /* 4 · OUR BUSINESS */
  venturesEyebrow: "OUR BUSINESS",
  venturesTitle: "세 영역으로 이루어진 사업 구조.",
  venturesLead:
    "NEWON의 사업은 자체 플랫폼 운영, 플랫폼을 기반으로 한 기업·기관 협력, 자체 디지털 제품의 세 영역으로 나뉩니다. 세 영역 모두 NEWON이 직접 소유하고 운영하는 서비스와 제품을 바탕으로 하며, 고객별 외주 제작은 하지 않습니다.",
  ventures: [
    {
      n: "01",
      title: "SIX CORE PLATFORMS",
      badge: "플랫폼 운영",
      body: "BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL 여섯 플랫폼을 직접 운영합니다. 각 플랫폼은 이용자에게 기록·정보·서비스를 제공하고, 그 영역에서 플랫폼 기반 사업이 자라는 토대가 됩니다.",
      notes: [
        "이용 가능 — BABYLOG·PETLOG·MY WORLD 앱",
        "준비 중 — SHAREON 앱, LIVON 앱, ONGIL 앱",
      ],
      links: [{ href: "#ab-build-title", label: "6개 플랫폼 보기 →" }],
    },
    {
      n: "02",
      title: "BUSINESS & PARTNERSHIPS",
      badge: "기업·기관 협력",
      body: "플랫폼 입점, 브랜드·기업 제휴, 기업·기관 협력과 플랫폼 기반 비즈니스를 담당합니다. 각 플랫폼의 이용자와 서비스 영역을 바탕으로, 적격 사업자와 기관이 참여할 수 있는 구조를 설계합니다.",
      notes: [
        "사업 모델 — Marketplace & Transactions · SaaS & Enterprise · Partnerships & Ecosystem · Digital Products & Licensing",
        "소개하는 협력 대상은 NEWON이 지향하는 참여자 유형이며, 실제 계약이나 제휴 관계를 뜻하지 않습니다.",
      ],
      links: [{ href: "../business/", label: "Business & Partnerships →" }],
    },
    {
      n: "03",
      title: "NEWON STUDIO",
      badge: "자체 디지털 제품",
      body: "NEWON이 직접 기획하고 소유하는 디지털 상품, 소프트웨어, 기업용 표준 제품과 라이선스 사업입니다. 한 번 만든 표준 제품을 여러 고객이 같은 조건으로 사용하며, 특정 고객을 위한 맞춤 제작이나 제작 대행은 하지 않습니다.",
      notes: ["제품 형태 — 디지털 템플릿 · 생산성 도구 · 소프트웨어 · 기업용 표준 제품"],
      links: [{ href: "../studio/", label: "NEWON Studio →" }],
    },
  ],
  productAreasEyebrow: "BUSINESS MODELS",
  productAreas: ["플랫폼 서비스", "입점·적격 거래", "SaaS·기업 솔루션", "제휴·협력", "디지털 상품", "라이선스"],

  /* 5 · NEWON ECOSYSTEM */
  glanceEyebrow: "NEWON ECOSYSTEM",
  glanceTitle: "플랫폼, Business, Studio의 연결.",
  glanceLead:
    "플랫폼은 이용자를 만나는 접점이고, Business & Partnerships는 그 접점에 기업과 기관이 참여하는 길이며, Studio는 플랫폼에서 반복해서 보이는 필요를 누구나 쓸 수 있는 표준 제품으로 만듭니다.",
  glanceRoles: [
    {
      n: "01",
      title: "SIX CORE PLATFORMS",
      via: "이용자 접점",
      body: "개인과 가족이 매일 쓰는 기록·정보·서비스를 제공합니다. 플랫폼마다 이용자가 실제로 겪는 문제를 확인하고, 그 결과가 Business와 Studio의 출발점이 됩니다.",
      tags: ["개인", "가족", "보호자", "여행자"],
    },
    {
      n: "02",
      title: "BUSINESS & PARTNERSHIPS",
      via: "기업·기관 참여",
      body: "브랜드와 사업자, 기관이 각 플랫폼의 성격에 맞게 입점·제휴·협력으로 참여합니다. 플랫폼별 참여 방식은 각 플랫폼의 Business·Partnerships 페이지에서 안내합니다.",
      tags: ["브랜드·기업", "소상공인", "기관·지자체", "기술 파트너"],
    },
    {
      n: "03",
      title: "NEWON STUDIO",
      via: "자체 제품",
      body: "플랫폼 영역에서 확인한 기록·일정·비용·운영 문제를 템플릿, 도구, 소프트웨어, 기업용 표준 제품으로 만듭니다. 개인과 사업자가 같은 품질, 같은 조건으로 사용합니다.",
      tags: ["템플릿", "생산성 도구", "소프트웨어", "라이선스"],
    },
  ],

  /* 6 · HOW WE BUILD */
  workEyebrow: "HOW WE BUILD",
  workTitle: "작게 시작하고, 운영하며 개선합니다.",
  workSteps: [
    { n: "01", title: "LISTEN", body: "각 영역 이용자가 실제로 겪는 문제와 필요를 확인합니다." },
    { n: "02", title: "DESIGN", body: "기록·정보·서비스를 그 영역에 맞는 흐름으로 설계합니다." },
    { n: "03", title: "BUILD", body: "꼭 필요한 기능부터 직접 개발해 출시합니다." },
    { n: "04", title: "OPERATE", body: "운영하며 이용 흐름과 의견에서 배웁니다." },
    { n: "05", title: "IMPROVE", body: "검증된 기능을 넓히고, 준비 중인 기능은 준비 중이라고 알립니다." },
  ],
  principlesEyebrow: "PRINCIPLES",
  principlesTitle: "제품을 만드는 기준.",
  principles: [
    { n: "01", title: "USEFUL FIRST", body: "실제로 쓰이는 기능을 먼저 만듭니다. 기록하고, 찾고, 연결하는 일이 쉬워야 합니다." },
    { n: "02", title: "HONEST STATUS", body: "제공 중인 기능과 준비 중인 기능을 구분해 알립니다. 출시되지 않은 기능을 제공 중이라고 말하지 않습니다." },
    { n: "03", title: "TRUST & PRIVACY", body: "아이, 반려동물, 건강, 가족의 정보는 신중하게 다루고, 공공 정보는 공식 출처를 우선합니다." },
    { n: "04", title: "EASY FOR EVERYONE", body: "처음 쓰는 사람도, 큰 글씨가 필요한 사람도 어렵지 않게 쓸 수 있도록 설계합니다." },
    { n: "05", title: "BUILT TO LAST", body: "한 번 만들고 끝내지 않고, 버전을 이어 가며 꾸준히 개선합니다." },
  ],

  /* 7 · OUR VISION */
  studioNoteEyebrow: "OUR VISION",
  studioNoteTitle: "삶의 여러 단계에 함께하는 플랫폼 기업.",
  studioNoteBody:
    "NEWON은 아이를 기다리는 순간부터 반려동물과의 일상, 여행, 필요한 물건을 빌리는 일, 인생의 중요한 결정, 나이 들어가는 시간까지 삶의 여러 단계에 필요한 서비스를 연결하는 기업을 지향합니다. 각 플랫폼이 자기 영역에서 신뢰를 쌓고, 그 위에 개인과 기업이 함께 참여하는 지속 가능한 디지털 생태계를 만들어 가려 합니다.",
  spacesEyebrow: "LONG-TERM DIRECTION",
  spacesTitle: "장기적으로 지향하는 방향.",
  spaces: [
    {
      n: "01",
      title: "CONNECTED EVERYDAY",
      count: "LIFE",
      body: "여섯 플랫폼이 각자의 영역에서 깊어지고, 삶의 단계가 바뀔 때 필요한 서비스로 자연스럽게 이어지는 경험을 지향합니다. 지금 플랫폼 사이의 데이터는 자동으로 연결되거나 공유되지 않습니다.",
      slugs: [],
    },
    {
      n: "02",
      title: "OPEN ECOSYSTEM",
      count: "PARTNERS",
      body: "개인 공급자와 소상공인, 브랜드와 기업, 기관과 지자체가 플랫폼별 조건에 맞게 참여하는 구조를 단계적으로 만들어 갑니다.",
      slugs: [],
    },
    {
      n: "03",
      title: "GLOBAL READY",
      count: "9 LANGUAGES",
      body: "NEWON 웹사이트는 9개 언어 버전으로 제공되며, 일부 페이지는 영어로 안내합니다. 이는 해외 이용자 확보나 국가별 서비스 운영을 뜻하지 않으며, 플랫폼별 해외 확장은 각 서비스의 검증과 준비에 맞춰 단계적으로 검토합니다.",
      slugs: [],
    },
    {
      n: "04",
      title: "LASTING TRUST",
      count: "TRUST",
      body: "빠른 확장보다 이용자가 믿고 오래 쓸 수 있는 서비스를 우선합니다. NEWON은 확인된 사실과 실제 제공 상태를 기준으로 자신을 소개합니다.",
      slugs: [],
    },
  ],

  /* 8 · OUR JOURNEY — git history / news data only */
  journeyEyebrow: "OUR JOURNEY",
  journeyTitle: "확인된 이정표만 기록합니다.",
  journeyNote:
    "날짜는 공식 웹사이트 기록과 공개된 소식으로 확인한 범위에서만 표기하고, 정확한 날짜를 확인할 수 없는 항목은 연도만 적습니다.",
  journeyMeta: "01 → 04",
  journeyBoardTags: "START · LAUNCH · EXPAND · NOW",
  journeyMilestones: [
    {
      year: "2026.04",
      title: "공식 웹사이트 시작",
      body: "newon.app 공식 웹사이트의 첫 버전을 만들고, NEWON의 서비스를 소개하기 시작했습니다.",
    },
    {
      year: "2026",
      title: "모바일 앱 출시",
      body: "BABYLOG, PETLOG, MY WORLD를 포함해 NEWON이 직접 만든 모바일 앱 11개를 App Store와 Google Play에 출시했습니다.",
    },
    {
      year: "2026.09",
      title: "LIVON·ONGIL 공개",
      body: "생애주기 플랫폼 LIVON과 시니어 라이프 플랫폼 ONGIL을 웹사이트에 소개했습니다. 두 플랫폼은 앱 출시를 준비하고 있습니다.",
    },
    {
      year: "NOW",
      title: "6개 핵심 플랫폼 체계",
      body: "여섯 개의 핵심 플랫폼을 중심으로 사업 구조를 정리하고, Business & Partnerships와 NEWON Studio를 함께 전개합니다.",
      isNow: true,
    },
  ],
  selectedEyebrow: "PRODUCT HISTORY",
  selectedTitle: "NEWON이 출시한 앱.",
  selectedLead:
    "NEWON이 직접 기획·개발해 App Store와 Google Play에 출시한 모바일 앱입니다. BABYLOG, PETLOG, MY WORLD 앱은 지금 각 플랫폼의 기반이 되고 있습니다.",
  selectedAll: "VIEW ALL PRODUCTS →",
  selectedProductsMax: 11,
  universeView: "제품 보기 ↗",
  statusLive: "출시",
  statusSoon: "출시 예정",
  statusProject: "프로젝트",
  productBlurbs: {
    "newon-plus": "통합 계정과 멤버십을 구축 중이며, 앱 연동은 단계적으로 확장합니다.",
  },
  productCats: {
    "ox-month": "Habit / Life",
    goalup: "Productivity",
    countup: "Utility",
    savy: "Finance",
    subping: "Finance",
    piggyup: "Finance",
    pillmate: "Health",
    babylog: "Parenting & Family",
    petlog: "Pet Life",
    myworld: "Travel & Experience",
    eaton: "Food / Life",
    fiton: "Sports / Fitness",
    "newon-plus": "Platform",
    "404-human": "Games",
  },
  productOrder: [
    "babylog",
    "petlog",
    "myworld",
    "ox-month",
    "goalup",
    "countup",
    "savy",
    "subping",
    "piggyup",
    "pillmate",
    "newon-plus",
  ],

  /* 9 · EXPLORE NEWON */
  exploreEyebrow: "EXPLORE NEWON",
  exploreTitle: "NEWON의 플랫폼과 사업을 살펴보세요.",
  exploreLogoSlugs: [],
  explorePanels: [
    { n: "01", title: "BABYLOG", body: "Parenting & Family — 아이와 가족의 기록, 성장, 가족생활.", cta: "BABYLOG →", href: "../babylog/" },
    { n: "02", title: "PETLOG", body: "Pet Life — 반려동물의 일상·건강 기록과 가족 공동 관리.", cta: "PETLOG →", href: "../petlog/" },
    { n: "03", title: "MY WORLD", body: "Travel & Experience — 세계지도 여행 기록에서 출발하는 여행 플랫폼.", cta: "MY WORLD →", href: "../myworld/" },
    { n: "04", title: "SHAREON", body: "Sharing & Rental — 물건·장비·공간을 공유하고 대여하는 마켓플레이스 (앱 출시 준비 중).", cta: "SHAREON →", href: "../shareon/" },
    { n: "05", title: "LIVON", body: "Life Stage — 삶의 단계마다 필요한 정보와 서비스를 잇는 라이프 플랫폼.", cta: "LIVON →", href: "../livon/" },
    { n: "06", title: "ONGIL", body: "Senior Life — 시니어의 일상, 가족 연결, 돌봄·복지 정보 (앱 출시 준비 중).", cta: "ONGIL →", href: "../ongil/" },
    { n: "07", title: "BUSINESS & PARTNERSHIPS", body: "플랫폼 입점, 제휴, 기업·기관 협력과 플랫폼 기반 비즈니스.", cta: "Business & Partnerships →", href: "../business/" },
    { n: "08", title: "NEWON STUDIO", body: "NEWON이 직접 만드는 디지털 상품, 소프트웨어, 기업용 표준 제품.", cta: "NEWON Studio →", href: "../studio/" },
  ],
  ideaEyebrow: "PARTNER WITH NEWON",
  ideaTitleHtml: "NEWON의 플랫폼과<br />함께할 기업과 기관을 찾습니다.",
  ideaLead:
    "입점, 제휴, 기업·기관 협력은 Business & Partnerships에서 안내합니다. 플랫폼별 협력 가능성은 각 플랫폼의 Partnerships 페이지에서 확인할 수 있습니다.",
  ideaCta: "협력 문의하기 →",
  ideaHref: "../business/contact/",
  ideaHint: "BABYLOG · PETLOG · MY WORLD · SHAREON · LIVON · ONGIL",
  closeEyebrow: "NEWON",
  closeTitleHtml: "일상의 다양한 영역을<br />하나로 연결합니다.",
  closeLead:
    "여섯 개의 핵심 플랫폼과 Business & Partnerships, NEWON Studio로 개인과 기업이 함께 참여하는 디지털 생태계를 만들어 갑니다.",
  closeTaglineEn: "",
  closeProducts: "6개 플랫폼 보기 →",
  closeProductsHref: "#ab-build-title",
  closeBusiness: "Business & Partnerships →",
  closeBusinessHref: "../business/",
  closePortfolio: "NEWON Studio →",
  closePortfolioHref: "../studio/",
};

const EN = {
  seoTitle: "About | Newon",
  metaDescription:
    "NEWON is a digital platform company that builds and runs six core platforms.",
  metaKeywords:
    "NEWON, digital platform company, BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL, NEWON Business & Partnerships, NEWON Studio",
  brandAria: "Newon",
  brandMarkAlt: "Newon",
  brandWord: "Newon",
  brandLine: "Six Core Platforms",
  brandCrumb: "Company / ABOUT",
  brandScroll: "Scroll down",
  brandPointTitle: "NEWON CARD",
  brandPointSub: "Meet Newon through the digital card",
  brandPointBadge: "DIGITAL",
  brandMetaLeft: "NEWON",
  brandMetaRight: "6 PLATFORMS",
  brandKicker: "NEW + ON",
  brandTag: "BABYLOG · PETLOG · MY WORLD · SHAREON · LIVON · ONGIL",
  brandDomainsAria: "Six core platforms",
  brandDomains: ["BABYLOG", "PETLOG", "MY WORLD", "SHAREON", "LIVON", "ONGIL"],
  brandMeaning: "Switching new everyday experiences on.",
  heroEyebrow: "ABOUT NEWON",
  heroTitleHtml: "A digital platform company<br />connecting everyday life.",
  heroLeadHtml:
    "NEWON plans and builds six core platforms for parenting, pets, travel, sharing, life stages and senior life.",
  heroNameAria: "New + On",
  heroNameKicker: "NEW + ON",
  heroNameNew: "NEW",
  heroNameNewDesc: "New everyday experiences",
  heroNameOn: "ON",
  heroNameOnDesc: "Services that actually work",
  heroNameNote: "New + On means switching new everyday experiences on — making them work.",
  cardAria: "Open Newon digital card",
  cardAlt: "Newon business card",
  cardHint: "Digital card · tap to open",
  ctaProducts: "Six platforms →",
  ctaProductsHref: "#ab-build-title",
  ctaBusiness: "Business & Partnerships →",
  ctaBusinessHref: "../business/",

  metricItems: [
    { key: "platforms", label: "PLATFORMS" },
    { key: "businessAreas", label: "BUSINESS AREAS" },
    { key: "languages", label: "SITE LANGUAGES" },
    { key: "apps", label: "APPS RELEASED" },
  ],
  metricLabels: {
    apps: "APPS",
    products: "PRODUCTS",
    countries: "COUNTRIES",
    languages: "LANGUAGES",
  },

  whyEyebrow: "WHO WE ARE",
  whyTitle: "A company that builds and runs its own platforms.",
  whyTagline: "New + On",
  whyTaglineEn: "TURN POSSIBILITIES ON",
  whyBody: [
    "NEWON is a digital platform company that connects many areas of everyday life. We are not a studio that builds to order for clients: our business is the platforms and digital products we plan and build ourselves.",
    "Parenting, pet life, travel, sharing, life stages and senior life are different areas, but they share the same needs — keeping records, finding information you can trust and reaching the right services. NEWON answers those shared needs with six platforms, each designed for its own area.",
    "The name NEWON starts from New + On: switching new everyday experiences on and making them work. We keep improving each platform's experience and aim to build a sustainable digital ecosystem that people and companies can take part in.",
  ],
  whyNewCols: [
    {
      head: "NEW",
      items: ["New everyday experiences", "New ways to connect", "New ways to take part", "New possibilities"],
    },
    {
      head: "ON",
      items: ["Plan it ourselves", "Build it ourselves", "Run and improve it", "Grow an ecosystem"],
    },
  ],
  missionEyebrow: "OUR PHILOSOPHY",
  missionTitle: "A platform built for each area of life.",
  missionLead:
    "Rather than putting everything into one app, we design the records, information and services each area needs for the people in that area. That is why NEWON runs six separate platforms.",
  missionPoints: [
    {
      n: "01",
      title: "FOCUS",
      body: "Parenting and senior care, travel and renting things have different users and different needs. Each platform focuses on one area and goes deep into its problems.",
    },
    {
      n: "02",
      title: "OWN & OPERATE",
      body: "We plan, build and run the platforms ourselves, and keep improving them after launch based on how people use them and what they tell us.",
    },
    {
      n: "03",
      title: "OPEN ECOSYSTEM",
      body: "People use the services; companies and institutions take part through listings, partnerships and collaboration. Each platform becomes a point where people and businesses meet.",
    },
  ],

  buildEyebrow: "OUR SIX PLATFORMS",
  buildTitle: "Six core platforms.",
  buildMeta: "NEWON · 6",
  buildBoardLabel: "PLATFORMS",
  buildBoardTags: "BABYLOG · PETLOG · MY WORLD · SHAREON · LIVON · ONGIL",
  buildAreas: [
    {
      n: "01",
      title: "BABYLOG — Parenting & Family",
      body: "From preparing for pregnancy to birth, parenting, growth records and family life, BABYLOG brings a child's and a family's scattered records and information together. It is built for parents-to-be, families raising children and the carers who share the work. Today the iOS and Android app offers parenting records, growth and health records, schedules and family sharing. Families keep the same records together, and companies and institutions in parenting, education and care are invited to take part through partnerships.",
      tags: ["Parenting records", "Growth & health", "Family sharing", "Education & care"],
      href: "../babylog/",
    },
    {
      n: "02",
      title: "PETLOG — Pet Life",
      body: "PETLOG reduces the problem of a pet's daily life, health history and vet dates being split across different owners. It is built for pet owners and their families. Today the PETLOG app offers profiles, daily and health records, vaccination and vet schedules, and shared family care. Pet life information and a community are areas in preparation, and pet brands and care providers taking part is a future partnership direction.",
      tags: ["Daily & health records", "Vaccination & vet dates", "Shared family care", "Pet life services"],
      href: "../petlog/",
    },
    {
      n: "03",
      title: "MY WORLD — Travel & Experience",
      body: "MY WORLD starts from the problem that discovery, planning, booking, records and sharing are spread across many services. It is built for travellers. Today the MY WORLD app is a travel-record service: mark the countries and cities you have visited on the world map on its home screen, and look back on trips through routes, photos, stats and an AI travel report. Booking, commerce and a shared community are being prepared in stages, with travel agencies, stays, tour operators, brands, regions and institutions meeting travellers.",
      tags: ["World-map travel records", "Trip planning", "Booking & experiences", "Traveller community"],
      href: "../myworld/",
    },
    {
      n: "04",
      title: "SHAREON — Sharing & Rental",
      body: "SHAREON deals with things that are used rarely but cost too much to buy, and equipment and spaces that sit idle. It aims to be an open sharing and rental marketplace connecting people who want to borrow for just the time they need with individuals and businesses that own items, equipment and spaces. The SHAREON app has not launched yet: no real rentals, confirmed bookings, payments, deposits or settlements run today. The first launch is being prepared around rentals and spaces with approval-based booking.",
      tags: ["Things", "Equipment", "Spaces", "Mobility"],
      href: "../shareon/",
    },
    {
      n: "05",
      title: "LIVON — Life Stage",
      body: "LIVON deals with information scattered across many places at every stage of life — education, careers, jobs, military service, money, housing, marriage, birth, family, health, welfare and retirement. It is an integrated life platform that starts from your current life stage, from the teens to 70 and over. The LIVON app is being prepared for launch. Public programmes are shown with their official source and reference date, and LIVON aims to work with companies and public bodies in education, recruitment and everyday information.",
      tags: ["Life-stage information", "Public programmes", "Life records", "Education, careers & welfare"],
      href: "../livon/",
    },
    {
      n: "06",
      title: "ONGIL — Senior Life",
      body: "ONGIL connects everyday information, family connection and care and welfare information so that seniors can carry on their lives at their own pace and in their own way. It is built for seniors and their families. The iOS and Android app is being prepared for its first release in Korea. Collaboration with care providers, welfare bodies, companies and local governments is under review, and no institution has a confirmed official partnership yet.",
      tags: ["Daily life", "Health records", "Family connection", "Care & welfare guidance"],
      href: "../ongil/",
    },
  ],

  venturesEyebrow: "OUR BUSINESS",
  venturesTitle: "A business in three areas.",
  venturesLead:
    "NEWON's business has three areas: running its own platforms, partnerships with companies and institutions built on those platforms, and its own digital products. All three rest on services and products NEWON owns and runs itself — we do not build to order for clients.",
  ventures: [
    {
      n: "01",
      title: "SIX CORE PLATFORMS",
      badge: "Platforms",
      body: "NEWON runs six platforms itself: BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON and ONGIL. Each gives people records, information and services, and becomes the base on which platform business grows in its area.",
      notes: [
        "Available — BABYLOG, PETLOG and MY WORLD apps",
        "In preparation — SHAREON app, LIVON app, ONGIL app",
      ],
      links: [{ href: "#ab-build-title", label: "See the six platforms →" }],
    },
    {
      n: "02",
      title: "BUSINESS & PARTNERSHIPS",
      badge: "Partnerships",
      body: "Platform listings, brand and company partnerships, collaboration with companies and institutions, and platform-based business. Built on each platform's users and service areas, it designs how eligible businesses and institutions can take part.",
      notes: [
        "Business models — Marketplace & Transactions · SaaS & Enterprise · Partnerships & Ecosystem · Digital Products & Licensing",
        "The participant types described are the kinds of partners NEWON aims to work with; they do not describe existing contracts or partnerships.",
      ],
      links: [{ href: "../business/", label: "Business & Partnerships →" }],
    },
    {
      n: "03",
      title: "NEWON STUDIO",
      badge: "Own products",
      body: "Digital goods, software, standard business products and licences that NEWON plans and owns itself. Each standard product is used by many customers on the same terms; there is no custom work or building on behalf of a specific client.",
      notes: ["Product forms — digital templates · productivity tools · software · standard business products"],
      links: [{ href: "../studio/", label: "NEWON Studio →" }],
    },
  ],
  productAreasEyebrow: "BUSINESS MODELS",
  productAreas: ["Platform services", "Listings & eligible transactions", "SaaS & enterprise", "Partnerships", "Digital goods", "Licensing"],

  glanceEyebrow: "NEWON ECOSYSTEM",
  glanceTitle: "Platforms, Business and Studio, connected.",
  glanceLead:
    "The platforms are where we meet people; Business & Partnerships is how companies and institutions take part there; Studio turns needs that keep appearing on the platforms into standard products anyone can use.",
  glanceRoles: [
    {
      n: "01",
      title: "SIX CORE PLATFORMS",
      via: "WHERE PEOPLE MEET US",
      body: "Records, information and services that people and families use every day. Each platform shows us the real problems people face, and that becomes the starting point for Business and Studio.",
      tags: ["People", "Families", "Carers", "Travellers"],
    },
    {
      n: "02",
      title: "BUSINESS & PARTNERSHIPS",
      via: "HOW BUSINESSES TAKE PART",
      body: "Brands, businesses and institutions take part through listings, partnerships and collaboration that fit each platform. How to take part is set out on each platform's Business and Partnerships pages.",
      tags: ["Brands & companies", "Small businesses", "Institutions", "Technology partners"],
    },
    {
      n: "03",
      title: "NEWON STUDIO",
      via: "OUR OWN PRODUCTS",
      body: "Records, schedules, costs and operations problems seen across the platform areas become templates, tools, software and standard business products, used by people and businesses at the same quality and on the same terms.",
      tags: ["Templates", "Productivity tools", "Software", "Licensing"],
    },
  ],

  workEyebrow: "HOW WE BUILD",
  workTitle: "Start small. Improve while we run it.",
  workSteps: [
    { n: "01", title: "LISTEN", body: "Find the real problems and needs of people in each area." },
    { n: "02", title: "DESIGN", body: "Shape records, information and services into a flow that fits the area." },
    { n: "03", title: "BUILD", body: "Build the features that matter most ourselves, and ship them." },
    { n: "04", title: "OPERATE", body: "Run the service and learn from how it is used and what people say." },
    { n: "05", title: "IMPROVE", body: "Widen what is proven, and say clearly what is still in preparation." },
  ],
  principlesEyebrow: "PRINCIPLES",
  principlesTitle: "How we hold the work.",
  principles: [
    { n: "01", title: "USEFUL FIRST", body: "Build what people actually use first. Recording, finding and connecting should be easy." },
    { n: "02", title: "HONEST STATUS", body: "Separate what is available from what is in preparation. We never call an unreleased feature available." },
    { n: "03", title: "TRUST & PRIVACY", body: "Handle information about children, pets, health and families with care, and put official sources first for public information." },
    { n: "04", title: "EASY FOR EVERYONE", body: "Design so first-time users, and people who need large text, can use it without difficulty." },
    { n: "05", title: "BUILT TO LAST", body: "We don't build once and walk away — we keep improving, version after version." },
  ],

  studioNoteEyebrow: "OUR VISION",
  studioNoteTitle: "A platform company for every stage of life.",
  studioNoteBody:
    "NEWON aims to be a company that connects the services people need across many stages of life — from waiting for a child to daily life with a pet, travel, borrowing what you need, big life decisions and growing older. Each platform earns trust in its own area, and on that base we want to build a sustainable digital ecosystem that people and companies take part in together.",
  spacesEyebrow: "LONG-TERM DIRECTION",
  spacesTitle: "Where we are heading.",
  spaces: [
    {
      n: "01",
      title: "CONNECTED EVERYDAY",
      count: "LIFE",
      body: "Six platforms that grow deeper in their own areas and lead naturally to the services people need as their life stage changes. Today data is not linked or automatically shared between the platforms.",
      slugs: [],
    },
    {
      n: "02",
      title: "OPEN ECOSYSTEM",
      count: "PARTNERS",
      body: "Step by step, a structure in which individual suppliers and small businesses, brands and companies, institutions and local governments take part on each platform's terms.",
      slugs: [],
    },
    {
      n: "03",
      title: "GLOBAL READY",
      count: "9 LANGUAGES",
      body: "The NEWON website is available in 9 language versions, with some pages shown in English. That does not mean overseas users or country-by-country operations; overseas expansion is reviewed platform by platform as each service is validated and ready.",
      slugs: [],
    },
    {
      n: "04",
      title: "LASTING TRUST",
      count: "TRUST",
      body: "Services people can trust and use for a long time come before fast growth. NEWON describes itself by verified facts and what is actually available.",
      slugs: [],
    },
  ],

  journeyEyebrow: "OUR JOURNEY",
  journeyTitle: "Only milestones we can verify.",
  journeyNote:
    "Dates are shown only where the official website's records and published news confirm them; where an exact date cannot be confirmed, only the year is given.",
  journeyMeta: "01 → 04",
  journeyBoardTags: "START · LAUNCH · EXPAND · NOW",
  journeyMilestones: [
    {
      year: "2026.04",
      title: "Official website begins",
      body: "The first version of the newon.app website was built, and NEWON began introducing its services there.",
    },
    {
      year: "2026",
      title: "Mobile apps released",
      body: "NEWON released 11 mobile apps it built itself, including BABYLOG, PETLOG and MY WORLD, on the App Store and Google Play.",
    },
    {
      year: "2026.09",
      title: "LIVON and ONGIL introduced",
      body: "The life-stage platform LIVON and the senior life platform ONGIL were introduced on the website. Both platforms are preparing their app launch.",
    },
    {
      year: "NOW",
      title: "Six core platforms",
      body: "The business is organised around six core platforms, alongside Business & Partnerships and NEWON Studio.",
      isNow: true,
    },
  ],
  selectedEyebrow: "PRODUCT HISTORY",
  selectedTitle: "Apps NEWON has released.",
  selectedLead:
    "Mobile apps NEWON planned, built and released on the App Store and Google Play. The BABYLOG, PETLOG and MY WORLD apps are now the base of their platforms.",
  selectedAll: "VIEW ALL PRODUCTS →",
  selectedProductsMax: 11,
  universeView: "View product ↗",
  statusLive: "Released",
  statusSoon: "Coming soon",
  statusProject: "Project",
  productBlurbs: {
    "newon-plus": "Shared account and membership are in progress. App links expand in stages.",
  },
  productCats: {
    "ox-month": "Habit / Life",
    goalup: "Productivity",
    countup: "Utility",
    savy: "Finance",
    subping: "Finance",
    piggyup: "Finance",
    pillmate: "Health",
    babylog: "Parenting & Family",
    petlog: "Pet Life",
    myworld: "Travel & Experience",
    eaton: "Food / Life",
    fiton: "Sports / Fitness",
    "newon-plus": "Platform",
    "404-human": "Games",
  },
  productOrder: [
    "babylog",
    "petlog",
    "myworld",
    "ox-month",
    "goalup",
    "countup",
    "savy",
    "subping",
    "piggyup",
    "pillmate",
    "newon-plus",
  ],

  exploreEyebrow: "EXPLORE NEWON",
  exploreTitle: "Explore NEWON's platforms and businesses.",
  exploreLogoSlugs: [],
  explorePanels: [
    { n: "01", title: "BABYLOG", body: "Parenting & Family — records, growth and family life for children and families.", cta: "BABYLOG →", href: "../babylog/" },
    { n: "02", title: "PETLOG", body: "Pet Life — daily and health records for pets, with shared family care.", cta: "PETLOG →", href: "../petlog/" },
    { n: "03", title: "MY WORLD", body: "Travel & Experience — a travel platform that starts from your world-map travel records.", cta: "MY WORLD →", href: "../myworld/" },
    { n: "04", title: "SHAREON", body: "Sharing & Rental — a marketplace for sharing and renting items, equipment and spaces (app in preparation).", cta: "SHAREON →", href: "../shareon/" },
    { n: "05", title: "LIVON", body: "Life Stage — a life platform connecting the information and services each stage of life needs.", cta: "LIVON →", href: "../livon/" },
    { n: "06", title: "ONGIL", body: "Senior Life — daily life, family connection and care and welfare information for seniors (app in preparation).", cta: "ONGIL →", href: "../ongil/" },
    { n: "07", title: "BUSINESS & PARTNERSHIPS", body: "Platform listings, partnerships, collaboration with companies and institutions, and platform-based business.", cta: "Business & Partnerships →", href: "../business/" },
    { n: "08", title: "NEWON STUDIO", body: "Digital goods, software and standard business products NEWON builds itself.", cta: "NEWON Studio →", href: "../studio/" },
  ],
  ideaEyebrow: "PARTNER WITH NEWON",
  ideaTitleHtml: "Companies and institutions<br />to grow with NEWON's platforms.",
  ideaLead:
    "Listings, partnerships and collaboration with companies and institutions are handled through Business & Partnerships. Each platform's Partnerships page shows how you could work with it.",
  ideaCta: "Partnership inquiry →",
  ideaHref: "../business/contact/",
  ideaHint: "BABYLOG · PETLOG · MY WORLD · SHAREON · LIVON · ONGIL",
  closeEyebrow: "NEWON",
  closeTitleHtml: "Connecting many areas<br />of everyday life.",
  closeLead:
    "With six core platforms, Business & Partnerships and NEWON Studio, we are building a digital ecosystem that people and companies take part in together.",
  closeTaglineEn: "",
  closeProducts: "See the six platforms →",
  closeProductsHref: "#ab-build-title",
  closeBusiness: "Business & Partnerships →",
  closeBusinessHref: "../business/",
  closePortfolio: "NEWON Studio →",
  closePortfolioHref: "../studio/",
};
