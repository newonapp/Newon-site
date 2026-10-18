/**
 * BABYLOG corporate website copy (information only) — Website Content Master Plan, 2026-10-18.
 *
 * Source: the owner's "BABYLOG 공식 웹사이트 최종 콘텐츠 구성안" (Overview / Platform / Business / Partnerships / Contact).
 *   ko — the owner's wording, verbatim wherever the plan gives wording. Short UI strings (labels, link text, notes)
 *        were added by Claude and are not yet owner-reviewed.
 *   en — faithful English rendering of ko, not yet owner-reviewed.
 *   ja es pt-br fr de hi id — no approved translation: render the English text (lang="en") until approved entries exist.
 *
 * Status rule (plan §7): only features already offered in the BABYLOG app (per the store listing) are "live" and
 * written in the present tense. Everything else is "prep" (준비 중) or "plan" (추진 예정); partnership areas are
 * "review" (협력 검토 분야). No partner names, no prices, no login / booking / payment on the web.
 *
 * Public / private revenue rule: this file contains NO price, fee rate or internal revenue figure.
 * qa-babylog-site.mjs fails the check if one appears in the rendered pages.
 */

export const BL_SLUG = "babylog";

/** The five top-level items. Overview is the page root; the others are sub-routes. */
export const BL_NAV = [
  { id: "overview", sub: "", n: "01", en: "Overview", ko: "소개" },
  { id: "platform", sub: "platform", n: "02", en: "Platform", ko: "플랫폼" },
  { id: "business", sub: "business", n: "03", en: "Business", ko: "비즈니스" },
  { id: "partnerships", sub: "partnerships", n: "04", en: "Partnerships", ko: "파트너십" },
  { id: "contact", sub: "contact", n: "05", en: "Contact", ko: "문의" },
];

/** Stable codes (used in ids and in the inquiry `source`). */
export const PLATFORM_GROUP_CODES = ["a", "b", "c", "d", "e"];
export const PARTNER_CODES = [
  "maternity", "brands", "healthcare", "development", "childcare", "care-services", "commerce", "lifestyle",
  "corporate", "saas", "government", "child-safety", "nonprofit", "technology", "global",
];
export const CONTACT_CODES = [
  "general", "app", "pregnancy", "health", "family", "commerce", "services", "education", "saas",
  "corporate", "public", "child-safety", "impact", "technology", "global", "media", "other",
];

/**
 * Status per item (language independent). live = in the app today (store listing); prep = 준비 중; plan = 추진 예정.
 * Kept conservative: only the existing store-verified features (pregnancy tracker, feeding/sleep/diaper log, growth
 * records, health & vaccination records, feeding records, family sharing, family calendar) are live.
 */
export const CORE_STATUS = ["live", "live", "live", "prep", "plan", "plan"];
export const PLATFORM_STATUS = [
  "prep", "live", "prep", "prep", // A 01–04
  "live", "live", "live", "prep", "live", "plan", // B 05–10
  "live", "live", "plan", "plan", // C 11–14
  "plan", "plan", "plan", "plan", // D 15–18
  "plan", "plan", "plan", // E 19–21
];
export const BUSINESS_STATUS = [
  "prep", "live", "prep", "live", // 01–04
  "prep", "prep", "prep", "plan", // 05–08
  "live", "plan", "live", "plan", // 09–12
  "plan", "plan", "plan", "plan", // 13–16
  "plan", "plan", "plan", "plan", // 17–20
  "plan", "plan", "prep", "plan", // 21–24
  "plan", "plan", "plan", "plan", // 25–28
  "plan", "plan", "plan", "plan", // 29–32
];

/* =================================================================================================== KO */
const KO = {
  lang: "ko",
  status: {
    live: "제공 중",
    prep: "준비 중",
    plan: "추진 예정",
    review: "협력 검토 분야",
    legend: "상태 표시 안내",
    legendBody:
      "‘제공 중’은 현재 BABYLOG 앱(스토어 소개 기준)에서 이용할 수 있는 기능에 한합니다. ‘준비 중’과 ‘추진 예정’은 아직 출시된 서비스가 아니며, 범위와 일정은 바뀔 수 있습니다.",
  },
  ui: {
    wordmark: "BabyLog",
    crumbBabylog: "BabyLog",
    menuLabel: "BABYLOG 메뉴",
    infoOnly:
      "웹사이트는 BABYLOG의 사업과 플랫폼을 소개하는 공간입니다. 실제 육아 기록·가족 데이터·거래·예약 등의 기능은 BABYLOG 앱에서 제공하는 방향으로 구분합니다.",
    noPrice: "확정된 요금과 수수료는 실제로 출시·승인된 뒤에 안내합니다. 이 페이지는 가격을 공개하지 않습니다.",
    noPartner: "아래 분야는 협력 검토 분야이며, 특정 기업·기관과의 제휴나 계약이 확정되었음을 뜻하지 않습니다. 실제 계약·제휴 여부는 확인된 뒤에 투명하게 표시합니다.",
    medical: "의료적 진단이나 처방을 대신하지 않습니다.",
    shareon: "공유·대여 거래 기능은 NEWON의 SHAREON과 역할을 구분해 연결할 수 있습니다.",
    csNote:
      "아동 안전·보호·복지 영역은 공식 정보 안내와 공식 기관 연결을 중심으로 하는 추진 분야입니다. 전문 판단·공식 신고·법적 절차를 대체하지 않으며, 대한민국 제도를 기준으로 안내합니다.",
    emergencyTitle: "긴급할 때는 먼저 공식 경로로.",
    emergencyBody:
      "아이가 위험하거나 실종·학대가 의심되면 이 웹사이트가 아니라 112(경찰) 등 공식 신고 경로를 먼저 이용해 주세요. BABYLOG는 신고를 접수하거나 아이의 위치·신원을 확인하지 않습니다.",
    noChildData: "이 웹사이트와 문의 양식에는 아이의 이름·사진·현재 위치·학대 관련 상세 내용을 적지 말아 주세요.",
    privacyNote: "문의 내용은 NEWON 공식 문의 양식으로 전달됩니다. 개인정보 처리는 개인정보처리방침을 따릅니다.",
    privacyLink: "개인정보처리방침",
    more: "다른 메뉴 살펴보기",
    keyAreas: "주요 영역",
    count: "개",
    copy: "복사",
    copied: "복사됨",
    mail: "메일 보내기",
    form: "공식 문의 양식 열기",
    propose: "이 분야 제안하기",
    ask: "문의하기",
    groupIndex: "그룹 바로가기",
    bizIndex: "사업 그룹 바로가기",
  },
  seo: {
    overview: {
      title: "BABYLOG | NEWON — 아이와 함께 자라는 모든 순간을, 하나로",
      desc: "BABYLOG는 임신 준비부터 출산, 육아, 아이의 성장과 교육까지 부모와 아이, 가족과 돌봄기관을 연결하는 통합 육아·가족 플랫폼을 만들어갑니다. 비전, 미션, 육아 여정과 핵심 경험을 소개합니다.",
    },
    platform: {
      title: "Platform | BABYLOG — 임신부터 육아, 성장과 가족생활까지",
      desc: "BABYLOG 플랫폼의 21개 서비스 영역을 임신·출산, 육아·성장, 가족·커뮤니티, 육아 생활, 공공정보·안전 5개 그룹으로 소개하고, 현재 앱에서 제공 중인 기능과 준비 중·추진 예정 영역을 구분합니다.",
    },
    business: {
      title: "Business | BABYLOG — 가족의 일상에서, 육아 산업의 미래까지",
      desc: "BABYLOG의 8개 사업 그룹과 32개 사업 분야, B2C·B2B·B2G·플랫폼 커머스·글로벌 사업 모델과 수익 기회를 소개합니다. 아동 보호 관련 공익 정보는 수익화하지 않습니다.",
    },
    partnerships: {
      title: "Partnerships | BABYLOG — 더 나은 육아와 가족의 미래를 함께",
      desc: "BABYLOG가 육아 브랜드, 교육·돌봄기관, 전문기관, 기업, 공공기관, 기술 파트너와 함께 검토하는 15개 협력 분야와 협력 원칙, 진행 절차를 안내합니다. 확정된 제휴를 뜻하지 않습니다.",
    },
    contact: {
      title: "Contact | BABYLOG — 새로운 가능성을 이야기해 주세요",
      desc: "서비스 이용 문의부터 육아 브랜드 입점, 기업 솔루션, 교육·돌봄기관 협력, 공공기관과 글로벌 사업까지 17개 BABYLOG 문의 분야를 NEWON 공식 문의 양식으로 연결합니다.",
    },
  },

  /* ---------------------------------------------------------------------------------- 01 Overview */
  overview: {
    hero: {
      titleHtml: "아이와 함께 자라는 모든 순간을,<br />하나로.",
      lead: "임신을 준비하는 순간부터 아이가 태어나고 성장하는 모든 과정까지. BABYLOG는 부모와 아이, 가족과 돌봄기관을 연결하는 통합 육아·가족 플랫폼을 만들어갑니다.",
      ctaMain: "플랫폼 살펴보기",
      ctaSub: "파트너십 문의하기",
    },
    eyebrow: "BABYLOG — ALL-IN-ONE FAMILY & CHILD PLATFORM",
    about: {
      kicker: "02 · About BABYLOG",
      title: "육아의 모든 순간이\n하나로 이어지는 경험.",
      body: [
        "아이를 키우는 일에는 수많은 기록과 선택, 정보와 준비가 필요합니다. 임신 주차별 정보부터 출산 준비, 수유와 수면, 성장과 건강, 교육과 돌봄, 가족의 일정까지 부모가 관리해야 할 일은 끊임없이 이어집니다.",
        "BABYLOG는 이러한 경험을 하나의 플랫폼으로 연결하고자 합니다.",
        "부모가 아이와 함께하는 시간을 더 의미 있게 보낼 수 있도록, 가족에게 필요한 기록과 정보, 생활 서비스와 기관 연결을 통합하는 디지털 생태계를 지향합니다.",
      ],
      facets: ["임신 주차별 정보", "출산 준비", "수유와 수면", "성장과 건강", "교육과 돌봄", "가족의 일정"],
    },
    mission: {
      kicker: "03 · Our Mission",
      title: "부모의 부담은 줄이고,\n아이와 함께하는 시간은 더 소중하게.",
      lead: "BABYLOG는 단순한 기록을 넘어 부모와 가족의 일상을 돕는 서비스를 목표로 합니다.",
      items: [
        "아이의 성장을 체계적으로 기록하는 경험",
        "부모와 보호자가 함께 참여하는 가족 중심의 관리",
        "성장 단계에 맞는 정보와 서비스",
        "육아 산업과 전문기관을 연결하는 플랫폼",
        "모든 아이가 안전하고 건강하게 성장할 수 있도록 돕는 정보 접근성",
      ],
    },
    journey: {
      kicker: "04 · The Parenting Journey",
      title: "임신 준비부터\n성장과 교육까지.",
      body: "아이의 성장에는 각기 다른 필요와 변화가 있습니다. BABYLOG는 임신과 출산, 영유아기, 아동 성장 단계에 맞춰 가족에게 필요한 경험을 연결하는 플랫폼을 지향합니다.",
      cols: ["단계", "소개"],
      items: [
        ["Pregnancy Planning", "새로운 가족을 준비하는 첫걸음"],
        ["Pregnancy", "임신 기간의 변화와 중요한 일정을 함께"],
        ["Birth & Recovery", "출산과 산후 회복의 모든 과정"],
        ["Newborn Care", "수유·수면·기저귀 등 신생아의 일상"],
        ["Infant Growth", "성장·건강·발달을 기록하는 시간"],
        ["Toddler & Child", "놀이·교육·가족생활로 넓어지는 경험"],
        ["Family & Care", "부모·보호자·돌봄기관의 연결"],
      ],
    },
    core: {
      kicker: "05 · Core Experience",
      title: "가족에게 필요한 경험을\n한곳에서.",
      items: [
        ["Daily Records", "수유·수면·기저귀·성장 등 일상 기록"],
        ["Health & Growth", "건강·예방접종·발달 정보"],
        ["Family Sharing", "부모·보호자의 공동 육아"],
        ["Parenting Information", "연령과 상황에 맞는 육아 정보"],
        ["Community", "부모와 가족의 정보·경험 공유"],
        ["Lifestyle & Services", "육아용품·교육·돌봄 서비스 정보"],
      ],
    },
    family: {
      kicker: "06 · Family First",
      title: "육아는 혼자가 아닌,\n가족이 함께하는 일입니다.",
      body: [
        "아이의 일상은 한 사람의 기록으로만 완성되지 않습니다. 부모와 보호자, 가족 구성원이 각자의 역할에서 아이의 성장을 함께 살펴보고 소통할 수 있는 경험을 지향합니다.",
        "BABYLOG는 가족의 편리함뿐 아니라 아이의 개인정보와 보호자별 접근권한을 중요하게 생각합니다.",
      ],
      center: "아이",
      roles: [
        ["부모", "함께 기록하고 확인"],
        ["보호자", "역할에 맞는 접근권한"],
        ["가족 구성원", "성장을 함께 살펴보고 소통"],
      ],
      guard: "개인정보 · 보호자별 접근권한",
    },
    beyond: {
      kicker: "07 · Beyond Parenting",
      title: "육아 기록을 넘어,\n가족을 위한 더 큰 연결로.",
      body: [
        "BABYLOG는 가족 사용자와 육아 브랜드, 교육·돌봄기관, 기업, 공공기관을 연결하는 플랫폼 생태계로 확장하고자 합니다.",
        "가정의 일상에서 시작해 육아 산업의 운영과 서비스, 아동 복지와 안전에 이르기까지 더 넓은 가치를 만들어갑니다.",
      ],
      chain: ["가족 사용자", "육아 브랜드", "교육·돌봄기관", "기업", "공공기관"],
      path: ["가정의 일상", "육아 산업의 운영과 서비스", "아동 복지와 안전"],
      tag: "확장 방향",
    },
    commitment: {
      kicker: "08 · Our Commitment",
      title: "아이의 안전과 가족의 신뢰를\n가장 먼저 생각합니다.",
      lead: "BABYLOG가 지향하는 기준은 다음과 같습니다.",
      items: [
        "아동과 가족의 개인정보 보호",
        "신뢰할 수 있는 육아·건강 정보",
        "보호자 권한을 고려한 데이터 관리",
        "접근하기 쉬운 서비스",
        "아동 안전·보호 정보의 책임 있는 제공",
        "취약 아동과 가족을 위한 공익적 정보 접근성",
      ],
    },
    next: {
      kicker: "09 · Next Step",
      titleHtml: "아이와 가족의 새로운 일상을<br />BABYLOG와 함께.",
      lead: "BABYLOG 플랫폼과 사업, 기업·기관 협력에 대해 자세히 알아보세요.",
      ctas: ["플랫폼 살펴보기", "사업 분야 알아보기", "파트너십 문의하기"],
    },
  },

  /* ---------------------------------------------------------------------------------- 02 Platform */
  platform: {
    hero: {
      titleHtml: "임신부터 육아,<br />성장과 가족생활까지.",
      lead: "아이와 가족의 삶에 필요한 기록, 정보, 일정, 커뮤니티와 서비스를 하나의 경험으로 연결합니다.",
      ctaMain: "서비스 영역 보기",
      ctaSub: "문의하기",
    },
    intro: {
      kicker: "MENU 02 · Platform",
      title: "21개 서비스 영역,\n5개 그룹.",
      lead: "BABYLOG가 다루는 개인·가족 중심의 서비스 영역입니다. 각 영역의 실제 제공 여부는 현재 개발 상태에 맞춰 표시합니다.",
    },
    groups: [
      {
        id: "a", en: "Pregnancy & Birth", name: "임신·출산",
        items: [
          ["01", "임신 준비", "새로운 가족을 준비하는 과정에서 필요한 일정과 정보를 체계적으로 살펴볼 수 있도록 돕습니다.", ["임신 준비 체크리스트", "가임기 정보", "건강한 생활 습관", "검진 준비", "관련 전문기관 안내"]],
          ["02", "임신 관리", "임신 주차별 변화와 검진 일정, 출산 준비 과정을 함께 관리하는 경험을 지향합니다.", ["임신 주차 정보", "산전검사 일정", "임신 기록", "출산 준비물", "가족 일정"]],
          ["03", "출산·산후 회복", "출산 이후 부모의 회복과 새로운 생활을 준비하는 데 필요한 정보를 연결합니다.", ["출산 기록", "산후 회복 기록", "산후조리 정보", "산후 지원제도", "전문기관 정보"]],
          ["04", "출산 준비·가족 계획", "출산 전후 필요한 준비를 가족이 함께 확인하고 계획할 수 있도록 돕습니다.", ["병원 준비물", "출산 일정", "육아용품 준비", "가족 역할 분담", "초기 육아 체크리스트"]],
        ],
      },
      {
        id: "b", en: "Baby Care & Growth", name: "육아·성장",
        items: [
          ["05", "수유·수면·기저귀 기록", "반복되는 육아의 순간을 편리하게 기록하고 확인하는 경험을 제공합니다.", ["수유 기록", "수면 기록", "기저귀 기록", "일별 요약", "생활 패턴 확인"]],
          ["06", "성장 기록", "아이의 성장 과정을 시간의 흐름에 따라 기록하고 가족과 함께 돌아볼 수 있도록 합니다.", ["키·몸무게", "성장 변화", "월령별 기록", "사진", "성장 추억"]],
          ["07", "건강·예방접종", "건강검진과 예방접종 등 중요한 일정을 놓치지 않도록 관련 정보를 정리합니다.", ["예방접종 일정", "검진 기록", "건강 기록", "병원 방문 기록", "공식 건강정보"], "medical"],
          ["08", "발달·성장 정보", "아이의 발달과 성장을 이해할 수 있는 연령별 정보와 관찰 기록을 연결합니다.", ["발달 정보", "월령별 놀이", "성장 체크리스트", "발달 관련 전문기관 안내"]],
          ["09", "이유식·영양·식단", "아이의 식생활 변화를 기록하고 가족이 식단을 계획할 수 있도록 돕습니다.", ["이유식 기록", "식단 계획", "식재료 정보", "알레르기 관련 정보", "식사 기록"]],
          ["10", "놀이·학습·교육", "아이의 연령과 관심사에 맞는 놀이와 학습 경험을 소개합니다.", ["연령별 놀이", "독서", "감각 활동", "교육 콘텐츠", "발달 단계별 활동 정보"]],
        ],
      },
      {
        id: "c", en: "Family & Community", name: "가족·커뮤니티",
        items: [
          ["11", "가족 공동 육아", "부모와 보호자가 함께 아이의 일상과 중요한 정보를 관리할 수 있는 경험을 지향합니다.", ["가족 구성원 관리", "공동 기록", "일정 공유", "보호자 권한", "가족 소통"]],
          ["12", "가족 일정·생활 관리", "아이의 일정과 가족의 일상적인 준비를 보다 편리하게 정리합니다.", ["병원 일정", "교육 일정", "가족 일정", "준비물", "할 일", "알림"]],
          ["13", "부모 커뮤니티", "비슷한 성장 단계와 생활환경을 경험하는 부모가 정보를 공유하고 소통하는 공간을 지향합니다.", ["연령별 커뮤니티", "지역별 정보", "육아 경험", "질문과 답변", "생활 정보"]],
          ["14", "부모 웰니스·교육", "부모의 건강한 일상과 양육 역량을 지원하는 정보와 교육을 연결합니다.", ["부모 교육", "산후 정서 정보", "양육 스트레스 관리 정보", "상담기관 안내", "가족관계 콘텐츠"]],
        ],
      },
      {
        id: "d", en: "Parenting Lifestyle", name: "육아 생활",
        items: [
          ["15", "육아용품·쇼핑", "아이와 가족에게 필요한 상품과 브랜드를 탐색할 수 있는 커머스 영역을 지향합니다.", ["육아용품", "유아 가구", "의류", "식품", "생활용품", "브랜드 상품 정보"]],
          ["16", "육아용품 공유·대여", "성장 단계에 따라 사용 기간이 달라지는 육아용품의 합리적인 이용을 지원합니다.", [], "shareon"],
          ["17", "육아 서비스", "출산과 육아 과정에 필요한 전문 서비스와 적격 제공기관 정보를 연결합니다.", ["산후조리", "산후도우미", "육아 지원", "돌봄 서비스", "전문기관 정보"]],
          ["18", "어린이집·유치원·교육기관", "가족이 교육·돌봄기관 정보를 탐색하고 관련 일정을 이해할 수 있도록 돕습니다.", ["어린이집", "유치원", "보육 정보", "입소·입학 안내", "기관 프로그램"]],
        ],
      },
      {
        id: "e", en: "Public & Safety", name: "공공정보·안전",
        items: [
          ["19", "육아지원·정부 복지", "부모와 가족에게 필요한 공공 육아지원 제도와 공식 신청 경로를 안내합니다.", ["출산지원", "양육지원", "보육료", "가족복지", "지역별 지원제도"]],
          ["20", "아동 안전·보호", "아동의 안전한 생활과 보호를 위한 공식 정보와 교육 콘텐츠를 연결합니다.", ["생활 안전", "사고 예방", "실종 예방", "아동학대 예방", "보호기관 정보"]],
          ["21", "아동 보호·복지 정보", "도움이 필요한 아동과 가족이 공식 제도 및 기관 정보를 찾을 수 있도록 지원합니다.", ["보호체계", "가정위탁", "입양 절차 정보", "자립지원", "검증된 공익기관 안내"]],
        ],
      },
    ],
    access: {
      kicker: "App Access",
      title: "실제 기록과 관리는 앱에서.",
      lead: "‘제공 중’ 기능은 BABYLOG 앱에서 이용합니다. 아래 링크는 확인된 공식 스토어 주소입니다.",
      appStore: "App Store에서 보기",
      googlePlay: "Google Play에서 보기",
      deleteNote: "계정 삭제 안내",
    },
    close: {
      kicker: "Platform",
      titleHtml: "가족의 일상에서 시작해,<br />아이의 미래까지.",
      lead: "BABYLOG는 아이의 성장 단계와 가족의 변화에 맞춰 필요한 경험을 연결하는 플랫폼을 만들어갑니다.",
      ctas: ["사업 분야 보기", "협력 분야 알아보기"],
    },
  },

  /* ---------------------------------------------------------------------------------- 03 Business */
  business: {
    hero: {
      titleHtml: "가족의 일상에서,<br />육아 산업의 미래까지.",
      lead: "BABYLOG는 임신·출산·육아·아동 성장과 관련된 디지털 서비스에서 출발해 커머스, 교육·돌봄기관, 기업 솔루션, 공공복지와 아동 보호까지 확장하는 플랫폼 생태계를 지향합니다.",
      ctaMain: "32개 사업 보기",
      ctaSub: "파트너십 알아보기",
    },
    intro: {
      kicker: "MENU 03 · Business",
      title: "8개 그룹, 32개 사업 분야.",
      lead: "개인 사용자뿐 아니라 육아 브랜드, 교육·돌봄기관, 기업, 공공기관, 글로벌 파트너가 BABYLOG의 사업 범위를 확인하는 페이지입니다. 현재 제공 중인 영역 외에는 추진 분야와 확장 방향으로 표시합니다.",
      stats: [["32", "사업 분야"], ["8", "사업 그룹"], ["5", "사업 모델"]],
    },
    groups: [
      { n: "01", en: "Pregnancy & Parenting Business", name: "임신·출산·육아 관리 사업", items: [
        ["Pregnancy Planning", "임신 준비 과정에 필요한 일정, 체크리스트, 건강정보와 관련 기관 정보를 연결하는 서비스 영역입니다."],
        ["Pregnancy Management", "임신 주차별 정보, 산전검사 일정, 임신 기록, 출산 준비를 지원하는 서비스 영역입니다."],
        ["Birth & Postpartum", "출산 과정과 산후 회복, 산후조리 정보, 가족의 새로운 생활 준비를 지원하는 영역입니다."],
        ["Baby Care & Growth Records", "수유·수면·기저귀·성장 등 아이의 일상을 기록하고 관리하는 핵심 플랫폼 사업입니다."],
      ] },
      { n: "02", en: "Child Health & Education Business", name: "아동 건강·발달·교육 사업", items: [
        ["Child Health & Vaccination", "예방접종, 건강검진, 성장 관련 기록과 공식 의료정보를 연결하는 서비스 영역입니다."],
        ["Child Development", "연령별 발달 정보와 관찰 기록, 전문기관 정보를 통해 아이의 성장을 지원하는 영역입니다."],
        ["Nutrition & Meal Planning", "이유식, 식단, 영양 관련 정보와 식생활 기록을 연결하는 서비스 영역입니다."],
        ["Play & Early Education", "놀이, 독서, 학습, 유아교육 콘텐츠와 관련 교육기관 정보를 연결하는 영역입니다."],
      ] },
      { n: "03", en: "Family & Community Business", name: "가족생활·커뮤니티 사업", items: [
        ["Family Care Management", "부모와 보호자의 공동 육아, 가족 일정, 기록 공유, 접근권한 관리 등을 지원하는 플랫폼 영역입니다."],
        ["Parenting Community", "부모와 가족이 육아 경험, 생활 정보, 지역별 정보를 공유할 수 있는 커뮤니티 사업입니다."],
        ["Family Schedule & Daily Life", "가족의 일정, 준비물, 체크리스트, 알림 등 일상 운영을 지원하는 서비스 영역입니다."],
        ["Parent Wellness & Support", "부모 교육, 산후 정서 정보, 양육 스트레스 관리, 전문 상담기관 안내 등 부모를 지원하는 영역입니다."],
      ] },
      { n: "04", en: "Parenting Commerce & Services", name: "육아 커머스·서비스 사업", items: [
        ["Parenting Commerce", "육아용품과 가족생활 상품을 제공하는 브랜드·판매자와 소비자를 연결하는 커머스 사업입니다."],
        ["Baby Product Sharing & Rental", "육아용품의 공유·대여 수요를 연결하는 사업으로, 실제 대여 거래는 SHAREON과 연계하는 방향을 검토합니다."],
        ["Parenting Service Network", "산후조리, 육아 지원, 돌봄 등 관련 서비스를 제공하는 적격 사업자와 가족을 연결하는 영역입니다."],
        ["Parenting Brands & Group Buying", "육아 브랜드와 소비자를 연결하는 기획전, 브랜드 캠페인, 공동구매 등 커머스 확장 사업입니다."],
      ] },
      { n: "05", en: "Education & Care Institution Business", name: "교육·돌봄기관 사업", items: [
        ["Childcare & Kindergarten Information", "어린이집, 유치원, 보육기관의 공식 정보와 프로그램, 입소·입학 관련 정보를 연결하는 사업입니다."],
        ["Institution & Family Communication", "교육·돌봄기관과 보호자 간 공지, 일정, 알림장, 소통 등을 지원하는 플랫폼 사업입니다."],
        ["Childcare Service Operations", "적격 돌봄기관과 서비스 사업자의 일정, 이용 안내, 운영 관리를 지원하는 솔루션 영역입니다."],
        ["Childcare Institution SaaS", "어린이집, 유치원 및 돌봄기관을 위한 표준화된 출결, 일정, 보호자 소통, 운영관리 SaaS 사업입니다."],
      ] },
      { n: "06", en: "Enterprise & Technology Business", name: "기업·기술·글로벌 사업", items: [
        ["Parenting Brand Solutions", "육아 브랜드와 판매자를 위한 상품 정보, 플랫폼 입점, 고객 연결, 캠페인 및 운영 지원 솔루션입니다."],
        ["Corporate Family Benefits", "기업 임직원과 가족을 위한 육아 정보, 부모 지원, 가족복지 관련 디지털 솔루션 사업입니다."],
        ["AI & Intelligent Parenting Tools", "육아 일정 정리, 기록 요약, 개인화된 정보 탐색과 업무 자동화를 지원하는 기술 기반 제품 영역입니다. 의료 판단이나 전문가 진단을 대체하지 않습니다."],
        ["Global Parenting Platform", "국가별 언어와 육아환경, 제도에 맞춘 글로벌 플랫폼 및 기관용 SaaS 확장 사업입니다."],
      ] },
      { n: "07", en: "Public Welfare & Child Safety", name: "공공복지·아동 안전 사업", cs: true, items: [
        ["Government Parenting Support", "정부와 지방자치단체의 출산·육아·보육·가족지원 제도 및 공식 신청 경로를 연결하는 공공정보 영역입니다."],
        ["Child Safety & Prevention", "아동의 일상 안전, 사고 예방, 실종 예방과 보호자 교육을 지원하는 정보·콘텐츠 영역입니다."],
        ["Missing Children Information", "실종아동 관련 공식 신고기관과 예방 정보, 공공기관의 공식 안내 경로를 연결하는 공익 영역입니다."],
        ["Child Protection & Abuse Prevention", "아동학대 예방, 보호자 교육, 공식 신고체계, 아동 보호기관 정보를 연결하는 공익 정보 영역입니다."],
      ] },
      { n: "08", en: "Child Welfare & Social Impact", name: "아동 보호·자립·사회적 가치 사업", cs: true, items: [
        ["Child Welfare Facilities & Protection", "아동양육시설과 아동 보호체계, 관련 공공지원 제도 및 공식 기관 정보를 안내하는 영역입니다."],
        ["Foster Care & Adoption Information", "가정위탁과 입양 관련 공식 제도, 절차, 담당기관 정보를 제공하는 공익 정보 영역입니다. 아동의 사적 매칭이나 거래를 제공하지 않습니다."],
        ["Youth Independence Support", "자립준비청년을 위한 주거, 교육, 취업, 경제·생활 지원제도와 공식 지원기관 정보를 연결하는 영역입니다."],
        ["Verified Giving & Social Impact", "검증된 공익기관과 기업의 사회공헌 활동을 연결하고 아동과 가족을 위한 사회적 가치 창출을 지향하는 영역입니다."],
      ] },
    ],
    models: {
      kicker: "Business Models",
      title: "개인에서 기업, 공공기관까지\n확장되는 사업 구조.",
      cols: ["사업 모델", "대상", "주요 방향"],
      rows: [
        ["B2C", "부모·가족", "무료·프리미엄 앱, 정보·생활 서비스"],
        ["B2B", "육아 브랜드·교육·돌봄기관", "SaaS, 기업 솔루션, 커머스"],
        ["B2G", "공공기관·지자체", "공공정보, 육아지원·아동복지 솔루션"],
        ["Platform Commerce", "판매자·소비자", "상품·서비스 연결 및 적법한 거래 수익"],
        ["Global", "해외 가족·기업·기관", "다국어 플랫폼·SaaS 라이선스"],
      ],
    },
    revenue: {
      label: "수익 기회",
      kicker: "Revenue Opportunities",
      body: "BABYLOG는 개인 프리미엄 구독, 육아 커머스, 적격 서비스 연결, 기관 SaaS, 기업 가족복지 솔루션, 브랜드 광고, 공공기관 계약, 글로벌 라이선싱 등 다양한 수익 모델을 검토합니다.",
      streams: ["개인 프리미엄 구독", "육아 커머스", "적격 서비스 연결", "기관 SaaS", "기업 가족복지 솔루션", "브랜드 광고", "공공기관 계약", "글로벌 라이선싱"],
      ruleLabel: "수익화하지 않는 영역",
      rule: "아동 보호·실종·학대 예방·입양·위탁 관련 공익 정보는 상업적 거래와 구분하고, 취약한 아동의 정보나 보호 필요성을 수익화하지 않습니다.",
    },
    close: {
      kicker: "Business",
      titleHtml: "육아의 일상에서 시작해,<br />가족과 산업을 연결하는 플랫폼으로.",
      lead: "BABYLOG는 부모와 아이에게 필요한 서비스를 발전시키고, 육아 관련 기업과 기관이 함께 참여할 수 있는 생태계를 만들어갑니다.",
      ctas: ["파트너십 알아보기", "기업·기관 문의하기"],
    },
  },

  /* ------------------------------------------------------------------------------ 04 Partnerships */
  partnerships: {
    hero: {
      titleHtml: "더 나은 육아와 가족의 미래를<br />함께 만들어갑니다.",
      lead: "BABYLOG는 육아 브랜드, 교육·돌봄기관, 전문기관, 기업, 공공기관, 기술 파트너와의 협력을 통해 가족과 아이를 위한 새로운 경험을 만들어가고자 합니다.",
      ctaMain: "협력 분야 보기",
      ctaSub: "문의하기",
    },
    cats: {
      kicker: "Partnership Categories",
      title: "15개 협력 분야.",
      items: [
        ["Pregnancy & Maternity", "산부인과 관련 전문기관, 산후조리, 임신·출산 관련 적격 서비스 사업자"],
        ["Baby & Parenting Brands", "육아용품, 유아식품, 유아 의류, 생활용품 브랜드와 판매자"],
        ["Child Healthcare", "소아청소년과 등 의료기관, 건강정보 제공기관, 관련 전문기관"],
        ["Child Development", "아동 발달, 놀이, 교육 콘텐츠, 전문 교육기관"],
        ["Childcare & Kindergarten", "어린이집, 유치원, 보육·교육 운영기관"],
        ["Parenting & Care Services", "적격 산후도우미·돌봄 서비스 사업자와 관련 기관"],
        ["Parenting Commerce", "육아 커머스 브랜드, 판매자, 유통 사업자"],
        ["Family Lifestyle", "가족생활, 육아 편의, 가족 여행 관련 브랜드"],
        ["Corporate Family Benefits", "임직원 가족복지와 부모 지원 프로그램을 운영하는 기업"],
        ["Institution SaaS", "교육·돌봄기관 운영 솔루션 도입 및 협력"],
        ["Government & Municipalities", "정부기관, 지방자치단체, 공공 육아지원 관련 기관"],
        ["Child Safety & Welfare", "아동 안전, 보호, 복지 관련 공공기관과 적격 비영리기관"],
        ["Nonprofit & Social Impact", "검증된 비영리기관, 아동·가족 지원 단체, 사회공헌 파트너"],
        ["Technology & AI", "보안, 데이터 보호, 접근성, 자동화 관련 기술 파트너"],
        ["Global Partners", "해외 육아·가족 서비스 사업자, 기관, 글로벌 기술·유통 파트너"],
      ],
    },
    why: {
      kicker: "Why Partner With BABYLOG",
      title: "가족 중심의 플랫폼에서\n새로운 사업 기회를 연결합니다.",
      body: "BABYLOG는 가족의 일상과 육아 산업을 이해하는 플랫폼을 지향합니다. 협력 분야에 따라 브랜드와 소비자 연결, 기관 운영 효율화, 가족복지 서비스, 공공정보 접근성, 기술·글로벌 협력 등 다양한 가능성을 함께 검토합니다.",
      points: ["브랜드와 소비자 연결", "기관 운영 효율화", "가족복지 서비스", "공공정보 접근성", "기술·글로벌 협력"],
    },
    principles: {
      kicker: "Partnership Principles",
      title: "협력의 여섯 가지 원칙.",
      items: [
        "아동과 가족의 안전을 우선합니다.",
        "개인정보 보호와 관련 법규를 준수합니다.",
        "파트너의 적격성 및 서비스 신뢰성을 확인합니다.",
        "공익사업과 상업적 협력을 구분합니다.",
        "실제 계약·제휴 여부를 투명하게 표시합니다.",
        "아동을 대상으로 부적절한 광고나 데이터 활용을 하지 않습니다.",
      ],
    },
    process: {
      kicker: "Process",
      title: "제안에서 진행까지, 다섯 단계.",
      lead: "협력은 아래 순서로 검토합니다. 문의는 단계별 결과를 약속하는 것이 아닙니다.",
      steps: [
        ["제안", "협력하고 싶은 내용을 NEWON 공식 문의 양식으로 보내 주세요."],
        ["검토", "BABYLOG 방향과 맞는지, 파트너 적격성과 현재 상태에서 가능한지 살펴봅니다."],
        ["협의", "협력 범위, 조건, 일정을 함께 논의합니다."],
        ["계약", "합의된 내용을 계약으로 정리합니다."],
        ["진행", "계약 범위 안에서 협력을 진행하고, 확정된 협력만 공개합니다."],
      ],
    },
    close: {
      kicker: "Partnerships",
      titleHtml: "BABYLOG와 함께할<br />파트너를 찾습니다.",
      lead: "육아·가족·교육·돌봄·공공복지·기술 분야에서 새로운 협력 가능성을 제안해 주세요.",
      ctas: ["파트너십 문의하기", "문의 분야 보기"],
    },
  },

  /* ---------------------------------------------------------------------------------- 05 Contact */
  contact: {
    hero: {
      titleHtml: "BABYLOG와 새로운 가능성을<br />이야기해 주세요.",
      lead: "서비스 이용 문의부터 육아 브랜드 입점, 기업 솔루션, 교육·돌봄기관 협력, 공공기관 및 글로벌 사업까지 다양한 제안을 기다립니다.",
      ctaMain: "문의 분야 보기",
      ctaSub: "파트너십 보기",
    },
    cats: {
      kicker: "Contact Categories",
      title: "17개 문의 분야.",
      lead: "가까운 분야를 고르면 NEWON 공식 문의 양식으로 연결됩니다.",
      cols: ["번호", "문의 분야", "내용"],
      items: [
        ["General Inquiry", "BABYLOG 일반 문의"],
        ["App & Product Support", "앱 기능·이용·오류·계정 문의"],
        ["Pregnancy & Parenting", "임신·출산·육아 서비스 관련 제안"],
        ["Health & Growth", "아동 건강·성장 정보 관련 협력"],
        ["Family & Community", "가족 서비스·커뮤니티 제안"],
        ["Parenting Commerce", "육아 브랜드·상품·커머스 입점"],
        ["Parenting Services", "산후조리·돌봄·육아 서비스 협력"],
        ["Education & Childcare", "어린이집·유치원·교육기관 협력"],
        ["Institution SaaS", "기관 운영 솔루션 도입·제안"],
        ["Corporate Solutions", "기업 가족복지·B2B 사업"],
        ["Government & Public", "공공기관·지자체 협력"],
        ["Child Safety & Welfare", "아동 안전·복지·공익 정보 협력"],
        ["Social Impact", "비영리기관·사회공헌·후원 협력"],
        ["Technology & AI", "기술·보안·AI 협력"],
        ["Global Partnerships", "해외 사업·글로벌 파트너십"],
        ["Media & Press", "미디어·홍보·취재"],
        ["Other Proposals", "기타 사업 제안"],
      ],
    },
    info: {
      kicker: "GENERAL & BUSINESS INQUIRIES",
      name: "NEWON",
      email: "newon@newon.app",
      note: "BABYLOG는 NEWON의 핵심 플랫폼입니다.",
    },
    guide: {
      kicker: "Before You Write",
      title: "문의 전에 알아 두세요.",
      items: [
        ["공식 문의 양식", "문의는 NEWON 공식 문의 양식으로 이어집니다. BABYLOG 웹페이지에서 별도로 개인정보를 받지 않습니다."],
        ["앱 이용 문의", "앱 기능·이용·오류·계정 문의도 같은 양식으로 접수합니다. 실제 기록과 계정 관리는 앱에서 이루어집니다."],
        ["답변 안내", "검토 후 안내드립니다. 문의가 협력이나 계약을 보장하지는 않습니다."],
      ],
    },
    close: {
      kicker: "Contact",
      titleHtml: "가족의 더 나은 내일을<br />함께 만들어갑니다.",
      lead: "BABYLOG는 부모와 아이, 기업과 기관이 함께 만들어갈 새로운 가능성을 기다립니다.",
      ctas: ["공식 문의 양식 열기", "파트너십 알아보기"],
    },
  },

  brand: {
    kicker: "BABYLOG BY NEWON",
    title: "아이와 함께 자라는 모든 순간을, 하나로.",
    body: "BABYLOG는 임신·출산·육아·성장·교육·가족생활·아동 안전과 보호를 연결하는 종합 육아·가족 플랫폼을 지향합니다.",
    sign: "A NEWON PLATFORM",
  },
};

/* =================================================================================================== EN */
const EN = {
  lang: "en",
  status: {
    live: "Available",
    prep: "In preparation",
    plan: "Planned",
    review: "Under consideration",
    legend: "How to read the labels",
    legendBody:
      "“Available” covers only features offered in the BABYLOG app today (per the store listing). “In preparation” and “Planned” are not released services, and their scope and timing may change.",
  },
  ui: {
    wordmark: "BabyLog",
    crumbBabylog: "BabyLog",
    menuLabel: "BABYLOG menu",
    infoOnly:
      "This website introduces BABYLOG's business and platform. Actual parenting records, family data, transactions and bookings are provided in the BABYLOG app, not on the web.",
    noPrice: "Confirmed prices and fees are announced only after a product is released and approved. This page does not publish prices.",
    noPartner: "The areas below are under consideration for cooperation and do not mean that a partnership or contract with any company or institution has been confirmed. Actual contracts and partnerships are shown transparently once confirmed.",
    medical: "This does not replace medical diagnosis or prescription.",
    shareon: "Sharing and rental transactions can be connected through NEWON's SHAREON, with the two services' roles kept separate.",
    csNote:
      "Child safety, protection and welfare are planned areas focused on official information and connection to official bodies. They do not replace professional judgment, official reporting or legal procedures, and are described according to the systems of the Republic of Korea.",
    emergencyTitle: "In an emergency, use official channels first.",
    emergencyBody:
      "If a child is in danger or you suspect a child is missing or being abused, please use official reporting channels such as 112 (police) first, not this website. BABYLOG does not accept reports or identify a child’s location or identity.",
    noChildData: "Please do not write a child’s name, photo, current location or abuse-related details on this website or in the inquiry form.",
    privacyNote: "Your inquiry is sent through the official NEWON inquiry form. Personal data is handled according to the Privacy Policy.",
    privacyLink: "Privacy Policy",
    more: "Explore the other menus",
    keyAreas: "Key areas",
    count: "",
    copy: "Copy",
    copied: "Copied",
    mail: "Send email",
    form: "Open the inquiry form",
    propose: "Propose in this area",
    ask: "Inquire",
    groupIndex: "Jump to group",
    bizIndex: "Jump to business group",
  },
  seo: {
    overview: {
      title: "BABYLOG | NEWON — Every moment of growing up with your child, in one place",
      desc: "BABYLOG is building an all-in-one parenting and family platform that connects parents and children, families and care institutions, from planning a pregnancy to birth, growth and education. Vision, mission, the parenting journey and core experience.",
    },
    platform: {
      title: "Platform | BABYLOG — From pregnancy to parenting, growth and family life",
      desc: "The 21 service areas of the BABYLOG platform in five groups: pregnancy & birth, baby care & growth, family & community, parenting lifestyle, public & safety, with features available in the app today clearly separated from those in preparation or planned.",
    },
    business: {
      title: "Business | BABYLOG — From everyday family life to the future of the parenting industry",
      desc: "BABYLOG's 32 business areas in eight groups, its B2C, B2B, B2G, platform commerce and global business models, and revenue opportunities. Public-interest child protection information is never monetized.",
    },
    partnerships: {
      title: "Partnerships | BABYLOG — Building a better future for parenting and families, together",
      desc: "The 15 cooperation areas BABYLOG is considering with parenting brands, education and care institutions, specialist bodies, companies, public institutions and technology partners, plus partnership principles and process. Not confirmed partnerships.",
    },
    contact: {
      title: "Contact | BABYLOG — Talk to us about new possibilities",
      desc: "Seventeen BABYLOG inquiry categories, from app support to parenting brand listings, corporate solutions, education and childcare cooperation, public institutions and global business, routed to the official NEWON inquiry form.",
    },
  },

  overview: {
    hero: {
      titleHtml: "Every moment of growing up together,<br />in one place.",
      lead: "From the moment you start planning a pregnancy through birth and every stage of growing up, BABYLOG is building an all-in-one parenting and family platform that connects parents and children, families and care institutions.",
      ctaMain: "Explore the platform",
      ctaSub: "Partnership inquiry",
    },
    eyebrow: "BABYLOG — ALL-IN-ONE FAMILY & CHILD PLATFORM",
    about: {
      kicker: "02 · About BABYLOG",
      title: "An experience where every moment\nof parenting connects.",
      body: [
        "Raising a child takes countless records and choices, information and preparation. From week-by-week pregnancy information to preparing for birth, feeding and sleep, growth and health, education and care, and the family schedule, the things parents have to manage never stop.",
        "BABYLOG aims to connect these experiences in a single platform.",
        "So that parents can spend more meaningful time with their children, we are working toward a digital ecosystem that brings together the records and information families need, everyday services and connections to institutions.",
      ],
      facets: ["Week-by-week pregnancy info", "Preparing for birth", "Feeding & sleep", "Growth & health", "Education & care", "Family schedule"],
    },
    mission: {
      kicker: "03 · Our Mission",
      title: "Less burden for parents,\nmore precious time with children.",
      lead: "BABYLOG aims to go beyond simple record-keeping to a service that supports the everyday life of parents and families.",
      items: [
        "An experience that records a child's growth systematically",
        "Family-centred care in which parents and guardians take part together",
        "Information and services that fit each stage of growth",
        "A platform that connects the parenting industry and specialist institutions",
        "Access to information that helps every child grow up safe and healthy",
      ],
    },
    journey: {
      kicker: "04 · The Parenting Journey",
      title: "From planning a pregnancy\nto growth and education.",
      body: "Each stage of a child's growth brings different needs and changes. BABYLOG aims to be a platform that connects families with the experiences they need through pregnancy and birth, infancy and early childhood, and childhood.",
      cols: ["Stage", "What it covers"],
      items: [
        ["Pregnancy Planning", "The first step in preparing for a new family"],
        ["Pregnancy", "Changes and key dates during pregnancy, together"],
        ["Birth & Recovery", "Every part of birth and postpartum recovery"],
        ["Newborn Care", "A newborn's day: feeding, sleep, diapers"],
        ["Infant Growth", "A time to record growth, health and development"],
        ["Toddler & Child", "Widening into play, learning and family life"],
        ["Family & Care", "Connecting parents, guardians and care institutions"],
      ],
    },
    core: {
      kicker: "05 · Core Experience",
      title: "What families need,\nin one place.",
      items: [
        ["Daily Records", "Everyday records: feeding, sleep, diapers, growth"],
        ["Health & Growth", "Health, vaccination and development information"],
        ["Family Sharing", "Shared parenting between parents and guardians"],
        ["Parenting Information", "Parenting information for each age and situation"],
        ["Community", "Parents and families sharing information and experience"],
        ["Lifestyle & Services", "Information on baby products, education and care services"],
      ],
    },
    family: {
      kicker: "06 · Family First",
      title: "Parenting is not done alone.\nIt is something families do together.",
      body: [
        "A child's day is never complete in one person's record. We aim for an experience in which parents, guardians and family members each look after the child's growth and communicate from their own role.",
        "BABYLOG cares not only about convenience for the family but also about the child's personal data and each guardian's access rights.",
      ],
      center: "Child",
      roles: [
        ["Parents", "Record and check together"],
        ["Guardians", "Access rights that fit their role"],
        ["Family members", "Follow growth and stay in touch"],
      ],
      guard: "Personal data · access rights per guardian",
    },
    beyond: {
      kicker: "07 · Beyond Parenting",
      title: "Beyond parenting records,\nto a bigger connection for families.",
      body: [
        "BABYLOG aims to grow into a platform ecosystem connecting family users with parenting brands, education and care institutions, companies and public institutions.",
        "Starting from everyday life at home, we want to create wider value, from how the parenting industry operates and serves families to child welfare and safety.",
      ],
      chain: ["Family users", "Parenting brands", "Education & care institutions", "Companies", "Public institutions"],
      path: ["Everyday life at home", "Parenting industry operations & services", "Child welfare & safety"],
      tag: "Direction of expansion",
    },
    commitment: {
      kicker: "08 · Our Commitment",
      title: "Children's safety and families' trust\ncome first.",
      lead: "These are the standards BABYLOG holds itself to.",
      items: [
        "Protecting the personal data of children and families",
        "Trustworthy parenting and health information",
        "Data management that respects guardians' rights",
        "Services that are easy to access",
        "Responsible provision of child safety and protection information",
        "Public-interest access to information for vulnerable children and families",
      ],
    },
    next: {
      kicker: "09 · Next Step",
      titleHtml: "A new everyday life for children and families,<br />with BABYLOG.",
      lead: "Learn more about the BABYLOG platform, its business and cooperation with companies and institutions.",
      ctas: ["Explore the platform", "See business areas", "Partnership inquiry"],
    },
  },

  platform: {
    hero: {
      titleHtml: "From pregnancy to parenting,<br />growth and family life.",
      lead: "Connecting the records, information, schedules, community and services that children and families need into one experience.",
      ctaMain: "See service areas",
      ctaSub: "Contact us",
    },
    intro: {
      kicker: "MENU 02 · Platform",
      title: "21 service areas,\nfive groups.",
      lead: "The individual- and family-centred service areas BABYLOG covers. Whether each area is actually available is shown according to its current development status.",
    },
    groups: [
      {
        id: "a", en: "Pregnancy & Birth", name: "Pregnancy & Birth",
        items: [
          ["01", "Pregnancy planning", "Helps families look through the schedule and information they need while preparing for a new family member.", ["Pregnancy planning checklist", "Fertility window information", "Healthy habits", "Check-up preparation", "Guide to specialist institutions"]],
          ["02", "Pregnancy management", "Aims for an experience of managing week-by-week changes, check-up schedules and birth preparation together.", ["Pregnancy week information", "Prenatal test schedule", "Pregnancy records", "Birth checklist", "Family schedule"]],
          ["03", "Birth & postpartum recovery", "Connects the information parents need to recover after birth and prepare for a new life.", ["Birth records", "Postpartum recovery records", "Postpartum care information", "Postpartum support programs", "Specialist institution information"]],
          ["04", "Birth preparation & family planning", "Helps the family check and plan together what is needed before and after birth.", ["Hospital bag", "Birth schedule", "Baby gear preparation", "Sharing family roles", "Early parenting checklist"]],
        ],
      },
      {
        id: "b", en: "Baby Care & Growth", name: "Baby Care & Growth",
        items: [
          ["05", "Feeding, sleep & diaper records", "Makes it easy to record and review the recurring moments of baby care.", ["Feeding log", "Sleep log", "Diaper log", "Daily summary", "Routine patterns"]],
          ["06", "Growth records", "Records a child's growth over time so the family can look back on it together.", ["Height & weight", "Growth changes", "Records by month of age", "Photos", "Growth memories"]],
          ["07", "Health & vaccination", "Organizes information so important dates such as health check-ups and vaccinations are not missed.", ["Vaccination schedule", "Check-up records", "Health records", "Hospital visit records", "Official health information"], "medical"],
          ["08", "Development & growth information", "Connects age-based information and observation records that help families understand a child's development.", ["Development information", "Play by month of age", "Growth checklist", "Guide to development specialists"]],
          ["09", "Baby food, nutrition & meals", "Records changes in a child's eating and helps the family plan meals.", ["Baby food log", "Meal planning", "Ingredient information", "Allergy-related information", "Meal log"]],
          ["10", "Play, learning & education", "Introduces play and learning experiences suited to a child's age and interests.", ["Play by age", "Reading", "Sensory activities", "Educational content", "Activities by developmental stage"]],
        ],
      },
      {
        id: "c", en: "Family & Community", name: "Family & Community",
        items: [
          ["11", "Shared family parenting", "Aims for an experience in which parents and guardians manage a child's day and important information together.", ["Family member management", "Shared records", "Shared schedule", "Guardian permissions", "Family communication"]],
          ["12", "Family schedule & daily life", "Organizes the child's schedule and the family's everyday preparation more conveniently.", ["Hospital appointments", "Education schedule", "Family schedule", "Things to bring", "To-dos", "Reminders"]],
          ["13", "Parent community", "Aims to be a space where parents at similar stages and in similar circumstances share information and talk.", ["Communities by age", "Local information", "Parenting experiences", "Questions & answers", "Everyday tips"]],
          ["14", "Parent wellness & education", "Connects information and education that support parents' healthy daily life and parenting skills.", ["Parent education", "Postpartum emotional health information", "Parenting stress information", "Guide to counselling services", "Family relationship content"]],
        ],
      },
      {
        id: "d", en: "Parenting Lifestyle", name: "Parenting Lifestyle",
        items: [
          ["15", "Baby products & shopping", "Aims to be a commerce area where families can explore the products and brands children and families need.", ["Baby products", "Children's furniture", "Clothing", "Food", "Household goods", "Brand product information"]],
          ["16", "Baby product sharing & rental", "Supports sensible use of baby products whose period of use changes with each stage of growth.", [], "shareon"],
          ["17", "Parenting services", "Connects information on the specialist services and qualified providers needed through birth and parenting.", ["Postpartum care", "Postpartum helpers", "Parenting support", "Care services", "Specialist institution information"]],
          ["18", "Childcare centres, kindergartens & education", "Helps families explore information on education and care institutions and understand the related schedules.", ["Childcare centres", "Kindergartens", "Childcare information", "Enrolment & admission guides", "Institution programs"]],
        ],
      },
      {
        id: "e", en: "Public & Safety", name: "Public & Safety",
        items: [
          ["19", "Parenting support & public welfare", "Guides parents and families to public parenting support programs and official application channels.", ["Birth support", "Parenting support", "Childcare fees", "Family welfare", "Regional support programs"]],
          ["20", "Child safety & protection", "Connects official information and educational content for children's safe daily life and protection.", ["Everyday safety", "Accident prevention", "Missing-child prevention", "Child abuse prevention", "Protection agency information"]],
          ["21", "Child protection & welfare information", "Helps children and families in need find information on official systems and institutions.", ["Protection system", "Foster care", "Adoption procedure information", "Independence support", "Guide to verified public-interest bodies"]],
        ],
      },
    ],
    access: {
      kicker: "App Access",
      title: "Real records and management live in the app.",
      lead: "“Available” features are used in the BABYLOG app. The links below are verified official store addresses.",
      appStore: "View on the App Store",
      googlePlay: "View on Google Play",
      deleteNote: "Account deletion guide",
    },
    close: {
      kicker: "Platform",
      titleHtml: "Starting from everyday family life,<br />all the way to a child's future.",
      lead: "BABYLOG is building a platform that connects the experiences families need as children grow and families change.",
      ctas: ["See business areas", "Explore cooperation areas"],
    },
  },

  business: {
    hero: {
      titleHtml: "From everyday family life<br />to the future of the parenting industry.",
      lead: "Starting from digital services for pregnancy, birth, parenting and child growth, BABYLOG aims to become a platform ecosystem that extends to commerce, education and care institutions, corporate solutions, public welfare and child protection.",
      ctaMain: "See all 32 areas",
      ctaSub: "Explore partnerships",
    },
    intro: {
      kicker: "MENU 03 · Business",
      title: "Eight groups, 32 business areas.",
      lead: "The page where parenting brands, education and care institutions, companies, public bodies and global partners, as well as individual users, can see the scope of BABYLOG's business. Apart from areas available today, everything is shown as a planned area or direction of expansion.",
      stats: [["32", "Business areas"], ["8", "Business groups"], ["5", "Business models"]],
    },
    groups: [
      { n: "01", en: "Pregnancy & Parenting Business", name: "Pregnancy, birth & parenting management", items: [
        ["Pregnancy Planning", "A service area connecting the schedule, checklists, health information and institution information needed while preparing for pregnancy."],
        ["Pregnancy Management", "A service area supporting week-by-week pregnancy information, prenatal test schedules, pregnancy records and birth preparation."],
        ["Birth & Postpartum", "An area supporting birth, postpartum recovery, postpartum care information and the family's preparation for a new life."],
        ["Baby Care & Growth Records", "The core platform business: recording and managing a child's day, including feeding, sleep, diapers and growth."],
      ] },
      { n: "02", en: "Child Health & Education Business", name: "Child health, development & education", items: [
        ["Child Health & Vaccination", "A service area connecting vaccination, health check-up and growth records with official medical information."],
        ["Child Development", "An area supporting a child's growth through age-based development information, observation records and specialist institution information."],
        ["Nutrition & Meal Planning", "A service area connecting baby food, meal and nutrition information with eating records."],
        ["Play & Early Education", "An area connecting play, reading, learning and early-education content with information on related education institutions."],
      ] },
      { n: "03", en: "Family & Community Business", name: "Family life & community", items: [
        ["Family Care Management", "A platform area supporting shared parenting between parents and guardians, family schedules, record sharing and access-rights management."],
        ["Parenting Community", "A community business where parents and families share parenting experiences, everyday tips and local information."],
        ["Family Schedule & Daily Life", "A service area supporting the running of family life: schedules, things to bring, checklists and reminders."],
        ["Parent Wellness & Support", "An area supporting parents through parent education, postpartum emotional health information, parenting stress management and guidance to specialist counselling services."],
      ] },
      { n: "04", en: "Parenting Commerce & Services", name: "Parenting commerce & services", items: [
        ["Parenting Commerce", "A commerce business connecting consumers with brands and sellers of baby products and family goods."],
        ["Baby Product Sharing & Rental", "A business connecting demand for sharing and renting baby products; linking actual rental transactions with SHAREON is under consideration."],
        ["Parenting Service Network", "An area connecting families with qualified providers of related services such as postpartum care, parenting support and childcare."],
        ["Parenting Brands & Group Buying", "A commerce expansion business connecting parenting brands and consumers through curated sales, brand campaigns and group buying."],
      ] },
      { n: "05", en: "Education & Care Institution Business", name: "Education & care institutions", items: [
        ["Childcare & Kindergarten Information", "A business connecting official information, programs and enrolment information for childcare centres, kindergartens and other care institutions."],
        ["Institution & Family Communication", "A platform business supporting notices, schedules, daily notes and communication between education and care institutions and guardians."],
        ["Childcare Service Operations", "A solution area supporting the scheduling, service information and operations of qualified care institutions and service providers."],
        ["Childcare Institution SaaS", "A standardized SaaS business for childcare centres, kindergartens and care institutions covering attendance, schedules, guardian communication and operations."],
      ] },
      { n: "06", en: "Enterprise & Technology Business", name: "Enterprise, technology & global", items: [
        ["Parenting Brand Solutions", "Solutions for parenting brands and sellers covering product information, platform listing, customer connection, campaigns and operational support."],
        ["Corporate Family Benefits", "A digital solutions business for employees and their families covering parenting information, parent support and family welfare."],
        ["AI & Intelligent Parenting Tools", "A technology-based product area supporting parenting schedule organization, record summaries, personalized information search and task automation. It does not replace medical judgment or professional diagnosis."],
        ["Global Parenting Platform", "A business extending the platform and institution SaaS globally, adapted to each country's language, parenting environment and systems."],
      ] },
      { n: "07", en: "Public Welfare & Child Safety", name: "Public welfare & child safety", cs: true, items: [
        ["Government Parenting Support", "A public-information area connecting government and local-authority birth, parenting, childcare and family support programs and their official application channels."],
        ["Child Safety & Prevention", "An information and content area supporting children's everyday safety, accident prevention, missing-child prevention and guardian education."],
        ["Missing Children Information", "A public-interest area connecting official reporting bodies for missing children, prevention information and the official guidance channels of public institutions."],
        ["Child Protection & Abuse Prevention", "A public-interest information area connecting child abuse prevention, guardian education, the official reporting system and child protection agency information."],
      ] },
      { n: "08", en: "Child Welfare & Social Impact", name: "Child protection, independence & social value", cs: true, items: [
        ["Child Welfare Facilities & Protection", "An area guiding families to information on child welfare facilities, the child protection system, related public support programs and official bodies."],
        ["Foster Care & Adoption Information", "A public-interest information area providing official programs, procedures and responsible agencies for foster care and adoption. It does not provide private matching of children or any transaction."],
        ["Youth Independence Support", "An area connecting young people leaving care with housing, education, employment, financial and living support programs and official support bodies."],
        ["Verified Giving & Social Impact", "An area connecting verified public-interest organizations with corporate social contribution, aiming to create social value for children and families."],
      ] },
    ],
    models: {
      kicker: "Business Models",
      title: "A business structure that extends\nfrom individuals to companies and public bodies.",
      cols: ["Business model", "Who it serves", "Main direction"],
      rows: [
        ["B2C", "Parents & families", "Free and premium app, information and everyday services"],
        ["B2B", "Parenting brands, education & care institutions", "SaaS, corporate solutions, commerce"],
        ["B2G", "Public institutions & local authorities", "Public information, parenting support and child welfare solutions"],
        ["Platform Commerce", "Sellers & consumers", "Connecting products and services, and lawful transaction revenue"],
        ["Global", "Families, companies & institutions abroad", "Multilingual platform and SaaS licensing"],
      ],
    },
    revenue: {
      label: "How BABYLOG earns",
      kicker: "Revenue Opportunities",
      body: "BABYLOG is considering a range of revenue models, including individual premium subscriptions, parenting commerce, connections to qualified services, institution SaaS, corporate family-benefit solutions, brand advertising, public-sector contracts and global licensing.",
      streams: ["Individual premium subscriptions", "Parenting commerce", "Qualified service connections", "Institution SaaS", "Corporate family-benefit solutions", "Brand advertising", "Public-sector contracts", "Global licensing"],
      ruleLabel: "What is never monetized",
      rule: "Public-interest information on child protection, missing children, abuse prevention, adoption and foster care is kept separate from commercial transactions, and the information or protection needs of vulnerable children are never monetized.",
    },
    close: {
      kicker: "Business",
      titleHtml: "Starting from everyday parenting,<br />a platform connecting families and industry.",
      lead: "BABYLOG will keep developing the services parents and children need and build an ecosystem in which parenting companies and institutions can take part together.",
      ctas: ["Explore partnerships", "Company & institution inquiry"],
    },
  },

  partnerships: {
    hero: {
      titleHtml: "Building a better future for parenting<br />and families, together.",
      lead: "Through cooperation with parenting brands, education and care institutions, specialist bodies, companies, public institutions and technology partners, BABYLOG aims to create new experiences for families and children.",
      ctaMain: "See cooperation areas",
      ctaSub: "Contact us",
    },
    cats: {
      kicker: "Partnership Categories",
      title: "15 cooperation areas.",
      items: [
        ["Pregnancy & Maternity", "Obstetrics-related specialist institutions, postpartum care and qualified pregnancy and birth service providers"],
        ["Baby & Parenting Brands", "Brands and sellers of baby products, baby food, children's clothing and household goods"],
        ["Child Healthcare", "Medical institutions such as paediatric clinics, health information providers and related specialist bodies"],
        ["Child Development", "Child development, play, educational content and specialist education institutions"],
        ["Childcare & Kindergarten", "Childcare centres, kindergartens and childcare and education operators"],
        ["Parenting & Care Services", "Qualified postpartum helper and care service providers and related institutions"],
        ["Parenting Commerce", "Parenting commerce brands, sellers and distributors"],
        ["Family Lifestyle", "Brands for family life, parenting convenience and family travel"],
        ["Corporate Family Benefits", "Companies running employee family-welfare and parent support programs"],
        ["Institution SaaS", "Adopting and cooperating on operating solutions for education and care institutions"],
        ["Government & Municipalities", "Government bodies, local authorities and public parenting support institutions"],
        ["Child Safety & Welfare", "Public institutions and qualified nonprofits in child safety, protection and welfare"],
        ["Nonprofit & Social Impact", "Verified nonprofits, child and family support organizations and social contribution partners"],
        ["Technology & AI", "Technology partners in security, data protection, accessibility and automation"],
        ["Global Partners", "Overseas parenting and family service providers, institutions, and global technology and distribution partners"],
      ],
    },
    why: {
      kicker: "Why Partner With BABYLOG",
      title: "Connecting new business opportunities\non a family-centred platform.",
      body: "BABYLOG aims to be a platform that understands everyday family life and the parenting industry. Depending on the area, we explore many possibilities together: connecting brands and consumers, making institutions run more efficiently, family-welfare services, access to public information, and technology and global cooperation.",
      points: ["Connecting brands and consumers", "Efficient institution operations", "Family-welfare services", "Access to public information", "Technology & global cooperation"],
    },
    principles: {
      kicker: "Partnership Principles",
      title: "Six principles of cooperation.",
      items: [
        "We put the safety of children and families first.",
        "We comply with personal data protection and related laws.",
        "We verify partners' eligibility and the reliability of their services.",
        "We keep public-interest work separate from commercial cooperation.",
        "We show transparently whether a contract or partnership actually exists.",
        "We do not run inappropriate advertising aimed at children or use children's data inappropriately.",
      ],
    },
    process: {
      kicker: "Process",
      title: "From proposal to delivery, five steps.",
      lead: "Cooperation is reviewed in this order. An inquiry does not promise an outcome at any step.",
      steps: [
        ["Proposal", "Send what you would like to work on through the official NEWON inquiry form."],
        ["Review", "We look at fit with BABYLOG's direction, partner eligibility and what is possible now."],
        ["Discussion", "We discuss scope, terms and timing together."],
        ["Contract", "Agreed terms are put into a contract."],
        ["Delivery", "Cooperation proceeds within the contracted scope, and only confirmed cooperation is made public."],
      ],
    },
    close: {
      kicker: "Partnerships",
      titleHtml: "We are looking for partners<br />to work with BABYLOG.",
      lead: "Propose new possibilities for cooperation in parenting, family, education, care, public welfare and technology.",
      ctas: ["Partnership inquiry", "See inquiry categories"],
    },
  },

  contact: {
    hero: {
      titleHtml: "Talk to BABYLOG<br />about new possibilities.",
      lead: "From questions about using the service to parenting brand listings, corporate solutions, education and childcare cooperation, public institutions and global business, we welcome every kind of proposal.",
      ctaMain: "See inquiry categories",
      ctaSub: "See partnerships",
    },
    cats: {
      kicker: "Contact Categories",
      title: "17 inquiry categories.",
      lead: "Choose the closest category and you will be taken to the official NEWON inquiry form.",
      cols: ["No.", "Category", "Covers"],
      items: [
        ["General Inquiry", "General questions about BABYLOG"],
        ["App & Product Support", "App features, usage, errors and accounts"],
        ["Pregnancy & Parenting", "Proposals on pregnancy, birth and parenting services"],
        ["Health & Growth", "Cooperation on child health and growth information"],
        ["Family & Community", "Proposals on family services and community"],
        ["Parenting Commerce", "Parenting brand, product and commerce listings"],
        ["Parenting Services", "Cooperation on postpartum care, childcare and parenting services"],
        ["Education & Childcare", "Cooperation with childcare centres, kindergartens and education institutions"],
        ["Institution SaaS", "Adopting or proposing institution operating solutions"],
        ["Corporate Solutions", "Corporate family welfare and B2B business"],
        ["Government & Public", "Cooperation with public institutions and local authorities"],
        ["Child Safety & Welfare", "Cooperation on child safety, welfare and public-interest information"],
        ["Social Impact", "Cooperation with nonprofits, social contribution and giving"],
        ["Technology & AI", "Technology, security and AI cooperation"],
        ["Global Partnerships", "Overseas business and global partnerships"],
        ["Media & Press", "Media, publicity and press"],
        ["Other Proposals", "Other business proposals"],
      ],
    },
    info: {
      kicker: "GENERAL & BUSINESS INQUIRIES",
      name: "NEWON",
      email: "newon@newon.app",
      note: "BABYLOG is a core NEWON platform.",
    },
    guide: {
      kicker: "Before You Write",
      title: "Before you get in touch.",
      items: [
        ["Official inquiry form", "Inquiries go to the official NEWON inquiry form. This BABYLOG page does not collect personal data itself."],
        ["App questions", "Questions about app features, usage, errors and accounts go through the same form. Records and accounts themselves are managed in the app."],
        ["Replies", "We reply after review. An inquiry does not guarantee cooperation or a contract."],
      ],
    },
    close: {
      kicker: "Contact",
      titleHtml: "Building a better tomorrow<br />for families, together.",
      lead: "BABYLOG looks forward to the new possibilities that parents and children, companies and institutions will create together.",
      ctas: ["Open the inquiry form", "Explore partnerships"],
    },
  },

  brand: {
    kicker: "BABYLOG BY NEWON",
    title: "Every moment of growing up together, in one place.",
    body: "BABYLOG aims to be an all-in-one parenting and family platform connecting pregnancy, birth, parenting, growth, education, family life, and child safety and protection.",
    sign: "A NEWON PLATFORM",
  },
};

export function getBabylogCopy(lang) {
  return lang === "ko" ? KO : EN;
}

/** Locales without an approved translation render the English copy (lang="en"). */
export function copyLangFor(lang) {
  return lang === "ko" ? "ko" : "en";
}
