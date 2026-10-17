/**
 * BABYLOG corporate website copy (information only).
 *
 * Scope: business introduction, partnership and inquiry content. No app features, records, login,
 * payment, trading, booking or education management live on the web.
 *
 * Translation state (see i18n-candidates/babylog-site-status.v1.json):
 *   ko — the owner's specification wording, verbatim where the specification gave wording; connecting text drafted
 *        by Claude and NOT yet reviewed by the owner.
 *   en — draft translation of ko, NOT reviewed.
 *   ja es pt-br fr de hi id — no approved translation: render the English draft (lang="en") until
 *        i18n-approved/ entries exist (P7 translation policy).
 *
 * Public / private revenue rule: this file contains NO price, fee rate or internal revenue hypothesis.
 * qa-babylog-site.mjs fails the check if one appears in the rendered pages.
 */

export const BL_SLUG = "babylog";

/** The five top-level items. Overview is the page root; the others are sub-routes. */
export const BL_NAV = [
  { id: "overview", sub: "", n: "01", en: "Overview", ko: "소개" },
  { id: "platform", sub: "platform", n: "02", en: "Platform", ko: "서비스" },
  { id: "business", sub: "business", n: "03", en: "Business", ko: "비즈니스" },
  { id: "partnerships", sub: "partnerships", n: "04", en: "Partnerships", ko: "파트너십" },
  { id: "contact", sub: "contact", n: "05", en: "Contact", ko: "문의" },
];

/** 8 partnership types and 8 inquiry categories (stable codes used in the inquiry `source`). */
export const PARTNER_CODES = ["brand", "seller", "creator", "expert", "service", "corporate", "institution", "global"];
export const CONTACT_CODES = ["app", "subscription", "seller", "brand", "education", "institution", "license", "global"];
export const BIZ_CODES = ["a", "b", "c", "d", "e", "f"];

/** Status vocabulary. `released` = described on the existing store-verified BabyLog page; everything else is not released. */
const STATUS = {
  ko: {
    released: "앱 이용 중 · 스토어 소개 기준",
    direction: "방향 · 출시 일정 미정",
    review: "검토 중",
    inquiry: "문의 접수 중",
    legend: "표시 안내",
    legendBody:
      "‘앱 이용 중’은 현재 스토어에 소개된 BabyLog 앱 기능에 한합니다. ‘방향’과 ‘검토 중’은 출시된 기능이나 서비스가 아니며 일정과 범위가 바뀔 수 있습니다.",
  },
  en: {
    released: "In the app · per store listing",
    direction: "Direction · no release date",
    review: "Under review",
    inquiry: "Inquiries open",
    legend: "How to read the labels",
    legendBody:
      "“In the app” covers only the BabyLog app features described in the store listing. “Direction” and “Under review” are not released features or services, and scope and timing may change.",
  },
};

const KO = {
  lang: "ko",
  status: STATUS.ko,
  ui: {
    menuLabel: "BABYLOG 메뉴",
    crumbHome: "Newon",
    crumbBabylog: "BabyLog",
    wordmark: "BabyLog",
    toInquiry: "문의하기",
    toBusiness: "비즈니스 살펴보기",
    toPlatform: "서비스 알아보기",
    toPartnerships: "파트너십 문의하기",
    inquiryCta: "사업 문의",
    infoOnly:
      "이 웹사이트는 BABYLOG 사업 소개, 파트너십 안내, 문의 연결만 제공합니다. 로그인, 육아 기록, 결제, 거래, 예약, 교육 관리는 웹에서 제공하지 않습니다.",
    noOutsourcing:
      "NEWON은 고객별 웹·앱 외주 개발, 수탁 디자인, 운영 대행을 하지 않습니다. 표준화된 자체 제품·라이선스·플랫폼·자동화 상품을 중심으로 소개합니다.",
    noPrice:
      "확정된 요금과 수수료는 실제로 출시·승인된 뒤에 공개합니다. 이 페이지의 수익 구조는 검토 중인 사업 방향이며 가격이 아닙니다.",
    noPartner:
      "이 페이지는 파트너 모집 안내입니다. 특정 기업·기관과의 제휴나 계약이 확정되었음을 뜻하지 않습니다.",
    privacyNote: "문의 내용은 NEWON 공식 문의 양식으로 전달됩니다. 개인정보 처리는 개인정보처리방침을 따릅니다.",
    privacyLink: "개인정보처리방침",
    sectionLabel: "섹션",
    back: "← BABYLOG 소개로",
  },
  seo: {
    overview: {
      title: "BABYLOG | NEWON — 가족의 모든 성장 순간을, 하나의 연결로",
      desc: "BABYLOG는 임신과 출산, 육아와 교육, 아이의 성장과 가족의 일상을 연결하는 종합 가족 플랫폼을 지향합니다. 사업 소개 페이지이며 출시되지 않은 기능은 방향으로만 안내합니다.",
    },
    platform: {
      title: "서비스 | BABYLOG — 가족의 시작부터 성장의 다음 단계까지",
      desc: "BABYLOG 서비스 소개. 임신·출산, 육아 기록, 가족 공유, 학습·교육, 추억 보관까지의 방향과 현재 앱 이용 범위를 구분해 안내합니다.",
    },
    business: {
      title: "비즈니스 | BABYLOG — 가족을 위한 서비스에서, 산업을 연결하는 플랫폼으로",
      desc: "BABYLOG의 6개 사업 영역(가족·구독, 커머스, 교육·콘텐츠, 가족 서비스, 기업·기관 솔루션, 라이선스·글로벌)을 고객, 문제, 가치, 협력 대상, 현재 상태로 소개합니다.",
    },
    partnerships: {
      title: "파트너십 | BABYLOG — 함께 만들어갈 파트너를 찾습니다",
      desc: "BABYLOG가 협력을 찾는 8개 파트너 유형과 제안, 검토, 협의, 계약, 진행의 협력 절차를 안내합니다. 확정된 제휴를 뜻하지 않는 모집 안내입니다.",
    },
    contact: {
      title: "문의 | BABYLOG — 새로운 가능성을 이야기해 주세요",
      desc: "BABYLOG 앱 이용, 구독·결제, 판매자, 기업·브랜드 제휴, 교육, 기관·공공 협력, 라이선스·자동화, 글로벌 협력 문의를 NEWON 공식 문의 양식으로 연결합니다.",
    },
  },

  overview: {
    hero: {
      titleHtml: "가족의 모든 성장 순간을,<br />하나의 연결로.",
      lead: "BABYLOG는 임신과 출산, 육아와 교육, 아이의 성장과 가족의 일상을 연결하는 종합 가족 플랫폼을 지향합니다.",
      ctaMain: "서비스 알아보기",
      ctaSub: "파트너십 문의하기",
    },
    vision: {
      kicker: "02 · Our Vision",
      title: "임신부터 고등학교 졸업까지,\n가족의 시간을 잇습니다.",
      lines: [
        "아이가 자라는 동안 가족에게 필요한 기록, 정보, 교육, 서비스는 시기마다 달라집니다.",
        "BABYLOG는 이 흩어진 순간들을 하나의 연결로 이어, 가족이 아이의 성장에 더 집중할 수 있는 플랫폼을 지향합니다.",
        "지금은 육아 기록 앱이 출시되어 있고, 그 너머의 방향은 단계적으로 검토합니다.",
      ],
    },
    journey: {
      kicker: "03 · Family Journey",
      title: "여섯 단계로 이어지는\n가족의 여정.",
      lead: "임신·출산부터 고등학교까지, 단계마다 필요한 것이 달라집니다. 아래는 일반적인 예시이며 가족마다 다를 수 있습니다.",
      note: "단계별 주제는 BABYLOG가 바라보는 방향입니다. 모든 항목이 현재 앱에서 제공되는 것은 아닙니다.",
      items: [
        { id: "s1", n: "01", age: "임신·출산", name: "만남을 준비하는 시기", lead: "아이를 맞이하기 전후, 가족이 준비하고 기록하는 시기.", topics: ["임신 기록", "출산 준비", "산후 기록", "가족 준비"] },
        { id: "s2", n: "02", age: "신생아·영아", name: "하루하루가 기록이 되는 시기", lead: "수유·수면·배변처럼 매일 반복되는 순간이 쌓이는 시기.", topics: ["수유·수면·배변", "성장 기록", "예방접종·건강", "가족 공유"] },
        { id: "s3", n: "03", age: "유아", name: "놀고 배우며 넓어지는 시기", lead: "식사, 놀이, 첫 경험과 기관 생활이 시작되는 시기.", topics: ["식사·놀이", "발달 기록", "어린이집·유치원 일정", "첫 경험"] },
        { id: "s4", n: "04", age: "초등학교", name: "학교와 학습이 더해지는 시기", lead: "학교·학원 일정, 학습과 독서 습관이 가족의 일상에 들어오는 시기.", topics: ["학교·학원 일정", "학습·독서", "생활 습관", "추억 보관"] },
        { id: "s5", n: "05", age: "중학교", name: "스스로 해보는 시기", lead: "아이의 자기 관리와 가족의 역할이 함께 달라지는 시기.", topics: ["학습 관리", "자기 관리", "독립 권한 방향", "가족 소통"] },
        { id: "s6", n: "06", age: "고등학교", name: "다음 단계를 준비하는 시기", lead: "진로와 학업, 졸업까지 아이의 선택을 가족이 함께 지켜보는 시기.", topics: ["진로 관리", "학업 계획", "졸업 기록", "교육 기관 연결 방향"] },
      ],
    },
    connect: {
      kicker: "04 · What We Connect",
      title: "기록에서 시작해\n네 가지를 연결합니다.",
      lead: "BABYLOG는 하나의 기록을 중심으로 가족, 학습, 서비스가 이어지는 구조를 지향합니다.",
      items: [
        { n: "01", name: "기록과 성장", lead: "아이의 일상과 성장, 건강 이력을 시간 순서로 모읍니다." },
        { n: "02", name: "가족과 보호자", lead: "보호자와 가족이 같은 기록을 함께 보고 이어갑니다." },
        { n: "03", name: "학습과 교육", lead: "학습·독서·진로 관리와 교육 콘텐츠·기관 연결을 방향으로 검토합니다." },
        { n: "04", name: "상품과 서비스", lead: "육아·교육 상품과 가족 서비스를 탐색하는 방향을 검토합니다." },
      ],
    },
    ecosystem: {
      kicker: "05 · Our Ecosystem",
      title: "가족을 중심으로\n함께하는 네 주체.",
      lead: "BABYLOG 생태계는 가족과, 가족에게 가치를 전하는 판매자·기업·기관으로 구성되는 것을 방향으로 합니다.",
      items: [
        { n: "01", name: "Families", lead: "아이를 키우는 가족과 보호자. 기록하고, 나누고, 필요한 정보를 찾는 중심 이용자입니다." },
        { n: "02", name: "Creators & Sellers", lead: "교육 전문가, 콘텐츠 제작자, 개인 판매자. 가족에게 필요한 콘텐츠와 상품을 전하는 주체입니다." },
        { n: "03", name: "Businesses", lead: "육아·가족 브랜드와 서비스 사업자, 복지를 운영하는 기업. 상품과 서비스로 가족과 만납니다." },
        { n: "04", name: "Institutions", lead: "보육·교육·공공기관. 정보 안내와 프로그램 협력의 대상입니다." },
      ],
    },
    opportunities: {
      kicker: "06 · Business Opportunities",
      title: "여섯 개의 사업 영역.",
      lead: "각 영역의 고객, 해결하는 문제, 협력 대상과 현재 상태는 비즈니스 페이지에서 자세히 소개합니다.",
      note: "모든 사업 영역은 출시 전 검토 단계입니다. 확정된 요금과 수수료는 공개하지 않습니다.",
    },
    newon: {
      kicker: "07 · NEWON Connection",
      title: "NEWON의 표준 제품 방식으로\n만듭니다.",
      lead: "BABYLOG는 NEWON이 운영하는 여러 플랫폼과 같은 원칙으로 소개합니다.",
      items: [
        { n: "01", name: "자체 제품 중심", body: "고객별 외주가 아니라 표준화된 자체 제품·라이선스·플랫폼·자동화 상품을 중심으로 합니다." },
        { n: "02", name: "ShareOn과의 연계 방향", body: "개인 간 거래는 ShareOn과 연계하는 방향을 검토합니다. 하나의 거래에 수수료가 이중으로 부과되지 않도록 구조를 설계하는 것이 원칙입니다. 확정된 정책은 아닙니다." },
        { n: "03", name: "LivOn·Ongil과의 연결 방향", body: "아이의 성장 이후 생애 단계와의 연결은 장기 방향으로만 검토합니다." },
        { n: "04", name: "정보 제공 웹사이트", body: "웹사이트는 소개와 문의 연결만 담당합니다. 기능은 앱에서 이용합니다." },
      ],
    },
    next: {
      kicker: "08 · Next Step",
      titleHtml: "BABYLOG가 그리는 다음을,<br />함께 살펴보세요.",
      lead: "서비스의 방향을 보고, 사업 영역을 확인하고, 함께할 방법을 문의해 주세요.",
    },
  },

  platform: {
    hero: {
      titleHtml: "가족의 시작부터<br />성장의 다음 단계까지.",
      lead: "BABYLOG 서비스의 방향과 현재 앱에서 이용할 수 있는 범위를 구분해 소개합니다.",
      ctaMain: "앱 이용 안내",
      ctaSub: "문의하기",
    },
    sections: [
      {
        id: "growth",
        kicker: "02 · Growth Journey",
        title: "임신·출산부터\n성장의 모든 단계까지.",
        lead: "하나의 아이 프로필에서 시작해 단계마다 필요한 기록과 정보로 이어집니다.",
        items: [
          { name: "임신·출산 관리", lead: "임신 시기부터 기록을 시작하는 예비 부모를 위한 앱 안내.", status: "released" },
          { name: "아이 프로필", lead: "성장 단계, 건강 정보, 기본 일정을 아이별로 관리합니다.", status: "released" },
          { name: "초등·중등·고등 단계 확장", lead: "아이가 자라는 동안 필요한 기록과 관리 범위를 단계적으로 넓히는 방향.", status: "direction" },
        ],
      },
      {
        id: "records",
        kicker: "03 · Parenting & Records",
        title: "수유·수면·식사·성장,\n매일의 기록.",
        lead: "하루의 작은 기록이 쌓여 아이의 성장 이야기가 됩니다.",
        items: [
          { name: "수유·수면·배변·식사·놀이 기록", lead: "매일 반복되는 순간을 간편하게 남깁니다.", status: "released" },
          { name: "성장·건강 기록", lead: "키, 몸무게, 예방접종과 건강 이력을 시간 순서로 모아 봅니다.", status: "released" },
          { name: "성장 통계", lead: "성장 추이와 생활 패턴을 그래프로 확인합니다.", status: "released" },
        ],
      },
      {
        id: "family",
        kicker: "04 · Family Connection",
        title: "가족이 함께 보고,\n함께 관리합니다.",
        lead: "보호자와 가족이 같은 기록을 확인하고 이어갑니다.",
        items: [
          { name: "가족 공동 관리", lead: "보호자와 가족이 같은 아이의 기록을 함께 확인합니다.", status: "released" },
          { name: "청소년 독립 권한 방향", lead: "아이가 자라면서 스스로 관리하는 범위를 넓히는 방향을 검토합니다. 구체적인 권한 구조는 정해지지 않았습니다.", status: "direction" },
        ],
      },
      {
        id: "learning",
        kicker: "05 · Learning & Education",
        title: "학교와 학습,\n그리고 교육 연결.",
        lead: "학교·학원 일정은 앱에서 이용하는 범위이고, 학습 관리와 교육 연결은 방향입니다.",
        items: [
          { name: "학교·학원 일정", lead: "병원 방문, 예방접종, 학교·학원 행사와 가족 일정을 모아 봅니다.", status: "released" },
          { name: "학습·독서·진로 관리", lead: "아이의 학습과 독서, 진로 탐색을 가족이 함께 정리하는 방향.", status: "direction" },
          { name: "교육 콘텐츠·기관 연결", lead: "교육 콘텐츠와 교육기관 프로그램을 연결하는 방향을 검토합니다.", status: "review" },
        ],
      },
      {
        id: "memories",
        kicker: "06 · Memories & Milestones",
        title: "지나가는 시간을\n추억으로 남깁니다.",
        lead: "빠르게 크는 시기의 변화를 나중에 되돌아볼 수 있도록 하는 방향입니다.",
        items: [
          { name: "사진·일기·성장 아카이브", lead: "사진, 일기와 성장 기록을 하나의 아카이브로 모으는 방향. 앱 출시 기능으로 안내하지 않습니다.", status: "direction" },
          { name: "성장 앨범·리포트", lead: "성장 기록을 앨범과 리포트로 정리하는 상품 방향을 검토합니다.", status: "review" },
        ],
      },
      {
        id: "assist",
        kicker: "07 · Smart Assistance",
        title: "기록을 정리하는\n참고용 도움.",
        lead: "AI는 기록을 정리해 보여 주는 참고용 도구입니다.",
        items: [
          { name: "AI 기록 요약 및 일반 정보", lead: "기록의 패턴을 참고용으로 정리하고 일반 정보를 제공합니다. 의료 진단이나 전문가의 조언을 대신하지 않습니다.", status: "released" },
        ],
      },
      {
        id: "explore",
        kicker: "08 · Explore & Discover",
        title: "상품과 서비스를\n탐색하는 방향.",
        lead: "가족에게 필요한 상품과 서비스를 찾는 경험을 검토합니다. 웹사이트에서 구매·예약·거래는 제공하지 않습니다.",
        items: [
          { name: "상품·서비스 탐색", lead: "육아·교육 상품과 가족 서비스를 탐색하는 방향을 검토합니다.", status: "review" },
          { name: "SHAREON 거래 연계 방향", lead: "개인 간 거래는 SHAREON과 연계하는 방향을 검토합니다. 거래 기능은 웹사이트에 없으며, 하나의 거래에 수수료가 이중으로 부과되지 않도록 구조를 설계하는 것이 원칙입니다. 확정된 정책은 아닙니다.", status: "review" },
        ],
      },
      {
        id: "trust",
        kicker: "09 · Privacy & Trust",
        title: "가족의 정보는\n가족의 것입니다.",
        lead: "아이와 가족의 기록을 다루는 서비스로서 지켜야 할 기준을 먼저 둡니다.",
        items: [
          { name: "정보 소유와 공유 범위", lead: "기록은 가족이 공유 범위를 정하는 것을 원칙으로 합니다.", status: "direction" },
          { name: "AI 정보의 한계 안내", lead: "AI가 정리한 내용은 참고용이며 의료·법률·교육 전문가의 판단을 대신하지 않습니다.", status: "released" },
          { name: "개인정보 처리 안내", lead: "개인정보 처리 기준은 개인정보처리방침에서 확인할 수 있습니다.", status: "released" },
        ],
      },
    ],
    access: {
      kicker: "10 · App Access",
      title: "앱에서 이용하세요.",
      lead: "BabyLog는 iOS와 Android 앱으로 이용합니다. 아래 링크는 확인된 공식 스토어 주소입니다.",
      appStore: "App Store에서 보기",
      googlePlay: "Google Play에서 보기",
      deleteNote: "계정 삭제 안내",
      note: "웹사이트에서는 로그인, 기록, 결제를 제공하지 않습니다.",
    },
  },

  business: {
    hero: {
      titleHtml: "가족을 위한 서비스에서,<br />산업을 연결하는 플랫폼으로.",
      lead: "BABYLOG가 검토하는 여섯 개 사업 영역을 고객, 문제, 가치, 협력 대상과 현재 상태 기준으로 소개합니다.",
      ctaMain: "사업 영역 보기",
      ctaSub: "파트너십 문의하기",
    },
    intro: {
      kicker: "01 · Business Areas",
      title: "여섯 영역, 하나의 가족 플랫폼.",
      lead: "각 영역은 출시 전 검토 단계입니다. 아래 ‘수익 모델’은 가격이 아닌 검토 중인 구조 유형입니다.",
    },
    fields: {
      overview: "사업 개요",
      customers: "주요 고객",
      problem: "해결하는 문제",
      value: "제품·서비스 가치",
      revenue: "수익 모델",
      partners: "협력 대상",
      status: "현재 제공 상태",
      cta: "관련 파트너십",
    },
    categories: [
      {
        id: "a", code: "A", en: "Family & Subscription", name: "가족·구독",
        items: ["가족 프리미엄", "가족 디지털 상품", "성장 앨범·리포트", "교육 콘텐츠 이용권"],
        overview: "가족이 BABYLOG 앱을 더 깊게 이용하도록 돕는 구독형·디지털 상품 영역입니다.",
        customers: "아이를 키우는 가족과 보호자",
        problem: "기록은 쌓이지만 이를 앨범, 리포트, 학습 자료로 활용하기는 어렵습니다.",
        value: "쌓인 성장 기록을 가족이 간직하고 활용할 수 있는 형태로 정리합니다.",
        revenue: "구독형 이용과 디지털 상품 개별 구매 구조를 검토 중입니다. 확정된 요금은 없습니다.",
        partners: "교육 콘텐츠 제작자, 교육 전문가",
        status: "review", partnerType: "creator",
      },
      {
        id: "b", code: "B", en: "Commerce & Marketplace", name: "커머스·마켓플레이스",
        items: ["육아 브랜드 상품", "개인 중고거래", "디지털 상품 유통", "공동 상품·캠페인"],
        overview: "육아 브랜드와 개인 판매자의 상품이 가족과 만나는 방식을 검토하는 영역입니다.",
        customers: "육아·가족 브랜드, 개인 판매자, 상품을 찾는 가족",
        problem: "필요한 시기에 믿을 수 있는 상품과 중고 물품을 찾기 어렵습니다.",
        value: "단계별로 필요한 상품을 탐색하고, 개인 간 거래는 ShareOn과 연계하는 방향을 검토합니다.",
        revenue: "거래 연계 구조와 브랜드 캠페인 계약 구조를 검토 중입니다. 같은 거래에 수수료가 중복되지 않도록 설계하는 것이 원칙이며, 확정된 요금은 없습니다.",
        partners: "육아·가족 브랜드, 개인 판매자, ShareOn",
        status: "review", partnerType: "brand",
      },
      {
        id: "c", code: "C", en: "Education & Content", name: "교육·콘텐츠",
        items: ["부모 교육 콘텐츠", "학습·독서 콘텐츠", "교육 전문가 콘텐츠", "교육기관 프로그램 연결"],
        overview: "부모와 아이를 위한 교육 콘텐츠와 기관 프로그램을 연결하는 영역입니다.",
        customers: "부모·보호자, 학습하는 아이, 교육 전문가, 교육기관",
        problem: "신뢰할 수 있는 교육 콘텐츠를 아이의 단계에 맞춰 찾기 어렵습니다.",
        value: "아이의 성장 단계에 맞는 콘텐츠와 프로그램을 가족에게 소개하는 방향입니다.",
        revenue: "콘텐츠 이용권과 콘텐츠 판매 연계 구조를 검토 중입니다. 확정된 요금은 없습니다.",
        partners: "교육 전문가, 콘텐츠 제작자, 보육·교육기관",
        status: "review", partnerType: "expert",
      },
      {
        id: "d", code: "D", en: "Family Services", name: "가족 서비스",
        items: ["가족 체험·놀이 프로그램", "가족사진·기념 서비스", "적격 돌봄 서비스 제공자 연결"],
        overview: "가족의 체험, 기념, 돌봄 서비스를 제공하는 사업자와 가족을 연결하는 방향의 영역입니다.",
        customers: "서비스를 찾는 가족, 가족 서비스 사업자",
        problem: "신뢰할 수 있는 체험·기념·돌봄 서비스를 한곳에서 찾기 어렵습니다.",
        value: "서비스 정보를 소개하고 제공자와 가족의 연결을 돕는 방향입니다. NEWON이 직접 돌봄이나 체험을 제공하는 것은 아닙니다.",
        revenue: "예약·연결 구조를 검토 중입니다. 돌봄 서비스 제공자의 자격과 요건을 확인하는 기준은 별도로 정해야 하며 확정되지 않았습니다.",
        partners: "가족 체험·사진·기념 서비스 사업자, 자격과 요건을 확인할 수 있는 돌봄 제공자",
        status: "review", partnerType: "service",
      },
      {
        id: "e", code: "E", en: "Business & Institution Solutions", name: "기업·기관 솔루션",
        items: ["기업 가족복지 이용권", "기관용 표준 SaaS", "파트너 운영 도구", "운영 자동화 제품"],
        overview: "기업의 가족복지와 기관 운영에 쓰이는 표준화된 제품을 소개하는 영역입니다.",
        customers: "복지 담당자, 보육·교육·공공기관, BABYLOG 파트너",
        problem: "가족 지원 제도와 기관 운영 업무가 분산되어 있어 운영 부담이 큽니다.",
        value: "맞춤 개발이 아닌 표준화된 제품과 자동화 상품으로 운영 부담을 줄이는 방향입니다.",
        revenue: "이용권, 표준 제품 구독, 기관 계약 구조를 검토 중입니다. 확정된 요금은 없습니다.",
        partners: "기업·복지 담당자, 보육·교육·공공기관",
        status: "review", partnerType: "corporate",
      },
      {
        id: "f", code: "F", en: "Licensing & Global", name: "라이선스·글로벌",
        items: ["콘텐츠·기술 라이선스", "해외 유통·현지화", "공동 상품 개발"],
        overview: "BABYLOG의 콘텐츠와 기술을 다른 기업·국가와 함께 확장하는 방향의 영역입니다.",
        customers: "콘텐츠·기술을 활용하려는 기업, 해외 사업자·전략적 파트너",
        problem: "좋은 가족 콘텐츠와 기술도 국가와 언어의 벽 때문에 전달되지 못합니다.",
        value: "라이선스와 현지화를 통해 다른 시장의 가족에게 닿는 방법을 모색합니다.",
        revenue: "라이선스 계약과 공동 상품 개발 계약 구조를 검토 중입니다. 계약별로 협의합니다.",
        partners: "글로벌·전략적 파트너, 콘텐츠·기술 활용 기업",
        status: "direction", partnerType: "global",
      },
    ],
    closeKicker: "Partnership",
    closeTitleHtml: "함께 만들 수 있는 영역을<br />이야기해 주세요.",
    closeLead: "관심 있는 영역을 알려 주시면 검토 후 안내드립니다.",
  },

  partnerships: {
    hero: {
      titleHtml: "가족의 더 나은 일상을 함께<br />만들어갈 파트너를 찾습니다.",
      lead: "BABYLOG가 협력을 찾는 여덟 유형의 파트너와 협력 절차를 안내합니다.",
      ctaMain: "파트너 유형 보기",
      ctaSub: "사업 문의",
    },
    process: {
      kicker: "01 · Process",
      title: "제안에서 진행까지,\n다섯 단계.",
      lead: "협력은 아래 순서로 검토합니다. 문의는 단계별 결과를 약속하는 것이 아닙니다.",
      steps: [
        { n: "01", name: "제안", body: "협력하고 싶은 내용을 문의 양식으로 보내 주세요." },
        { n: "02", name: "검토", body: "BABYLOG 방향과 맞는지, 현재 상태에서 가능한지 살펴봅니다." },
        { n: "03", name: "협의", body: "협력 범위, 조건, 일정을 함께 논의합니다." },
        { n: "04", name: "계약", body: "합의된 내용을 계약으로 정리합니다." },
        { n: "05", name: "진행", body: "계약 범위 안에서 협력을 진행합니다." },
      ],
    },
    types: {
      kicker: "02 · Partner Types",
      title: "여덟 유형의 파트너.",
      lead: "파트너 유형은 소개를 위한 분류입니다. 유형을 선택해도 계정이나 계약이 만들어지지 않습니다.",
      railLabel: "파트너 유형 바로가기",
      fields: {
        who: "협력 대상",
        areas: "가능한 협력 분야",
        revenue: "수익 구조",
        terms: "협력 조건 및 검토 사항",
        flow: "진행 절차",
      },
      flowText: "제안 → 검토 → 협의 → 계약 → 진행",
      items: [
        {
          code: "brand", n: "01", name: "육아·가족 브랜드",
          who: "육아·출산·가족 용품을 만들거나 판매하는 브랜드",
          areas: "상품 소개, 공동 상품·캠페인, 해외 유통 협력",
          revenue: "거래 연계 또는 캠페인 계약 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "상품 안전·표시 기준, 브랜드 신뢰도, 가족 대상 광고·홍보 기준을 확인합니다.",
        },
        {
          code: "seller", n: "02", name: "개인 판매자",
          who: "육아 용품 중고거래나 디지털 상품을 판매하려는 개인",
          areas: "개인 간 거래(ShareOn 연계 방향), 디지털 상품 소개",
          revenue: "거래 구조를 검토 중입니다. 같은 거래에 수수료가 중복되지 않도록 설계하는 것이 원칙이며 확정된 조건은 없습니다.",
          terms: "판매 가능 품목, 거래 안전 기준, 판매자 확인 방식은 정해지지 않았습니다. 웹사이트에서 판매자 계정을 만들 수 없습니다.",
        },
        {
          code: "creator", n: "03", name: "콘텐츠 제작자",
          who: "가족·육아·학습 콘텐츠를 만드는 제작자",
          areas: "콘텐츠 제공, 디지털 상품, 공동 기획",
          revenue: "콘텐츠 이용권 또는 판매 연계 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "저작권과 이용 범위, 연령 적합성, 콘텐츠 품질 기준을 확인합니다.",
        },
        {
          code: "expert", n: "04", name: "교육 전문가",
          who: "육아·교육·발달 분야의 전문가와 강사",
          areas: "부모 교육 콘텐츠, 전문가 콘텐츠, 교육 프로그램",
          revenue: "콘텐츠 판매 연계 또는 계약 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "전문 분야와 자격 확인 방식, 콘텐츠가 의료·법률 조언으로 오해되지 않도록 하는 기준을 검토합니다.",
        },
        {
          code: "service", n: "05", name: "가족 서비스 사업자",
          who: "체험·놀이, 가족사진·기념, 돌봄 서비스를 운영하는 사업자",
          areas: "서비스 정보 소개, 예약·연결 방향 검토, 공동 프로그램",
          revenue: "예약·연결 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "사업자 확인, 안전과 자격 요건, 아이를 대상으로 하는 서비스의 기준을 확인합니다. 웹사이트에서 예약은 제공하지 않습니다.",
        },
        {
          code: "corporate", n: "06", name: "기업·복지 담당자",
          who: "임직원 가족복지를 운영하는 기업의 담당자",
          areas: "기업 가족복지 이용권, 자동화 제품 활용",
          revenue: "이용권 또는 구독 계약 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "복지 제도 연계 방식, 개인정보 처리 범위, 이용 대상 확인 방식을 협의합니다.",
        },
        {
          code: "institution", n: "07", name: "보육·교육·공공기관",
          who: "보육·교육기관, 지자체와 공공기관",
          areas: "기관용 표준 SaaS, 교육 콘텐츠 라이선스, 프로그램 협력, 정보 안내",
          revenue: "표준 제품 이용 또는 기관 계약 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "공공 조달·계약 절차, 아동 정보 보호 기준, 보안 요건을 확인합니다.",
        },
        {
          code: "global", n: "08", name: "글로벌·전략적 파트너",
          who: "해외 유통·현지화와 콘텐츠·기술 활용을 함께할 기업",
          areas: "콘텐츠·기술 라이선스, 해외 유통·현지화, 공동 상품 개발",
          revenue: "라이선스 또는 공동 개발 계약 구조를 검토 중입니다. 계약별로 협의합니다.",
          terms: "현지 법규와 아동·개인정보 보호 기준, 언어·문화 적합성, 브랜드 사용 범위를 검토합니다.",
        },
      ],
      cta: "이 유형으로 문의하기",
    },
    closeKicker: "Contact",
    closeTitleHtml: "파트너십이 궁금하다면,<br />먼저 이야기해 주세요.",
    closeLead: "문의는 NEWON 공식 문의 양식으로 전달됩니다.",
  },

  contact: {
    hero: {
      titleHtml: "BABYLOG와 함께할<br />새로운 가능성을 이야기해 주세요.",
      lead: "문의 유형을 고르면 NEWON 공식 문의 양식으로 연결됩니다.",
      ctaMain: "문의 유형 보기",
      ctaSub: "파트너십 보기",
    },
    list: {
      kicker: "01 · Inquiry Types",
      title: "어떤 이야기를\n나누고 싶으신가요?",
      lead: "아래 여덟 가지 중 가까운 유형을 선택해 주세요. 선택한 유형은 문의 양식에 함께 전달됩니다.",
      items: [
        { code: "app", n: "01", name: "앱 이용 문의", lead: "BabyLog 앱 이용과 관련한 문의." },
        { code: "subscription", n: "02", name: "가족 구독·결제 문의", lead: "구독과 결제에 관한 문의. 아직 출시되지 않은 상품은 안내만 가능합니다." },
        { code: "seller", n: "03", name: "개인 판매자·디지털 상품", lead: "판매자와 디지털 상품 협력 문의." },
        { code: "brand", n: "04", name: "기업·브랜드 제휴", lead: "육아·가족 브랜드와 기업의 제휴 문의." },
        { code: "education", n: "05", name: "교육 콘텐츠·서비스", lead: "교육 전문가, 콘텐츠 제작자, 서비스 사업자 문의." },
        { code: "institution", n: "06", name: "기관용 제품·공공 협력", lead: "보육·교육·공공기관의 제품·협력 문의." },
        { code: "license", n: "07", name: "기업 라이선스·자동화", lead: "콘텐츠·기술 라이선스, 자동화 제품 문의." },
        { code: "global", n: "08", name: "글로벌·전략적 협력", lead: "해외 유통·현지화와 전략적 협력 문의." },
      ],
      go: "이 유형으로 문의하기 →",
    },
    guide: {
      kicker: "02 · Before You Write",
      title: "문의 전에 알아 두세요.",
      items: [
        { n: "01", name: "공식 문의 양식", body: "문의는 NEWON 공식 문의 양식으로 이어집니다. BABYLOG 웹페이지에서 별도로 개인정보를 받지 않습니다." },
        { n: "02", name: "앱 이용 문의", body: "앱 이용 문의도 같은 양식으로 접수합니다." },
        { n: "03", name: "답변 안내", body: "검토 후 안내드립니다. 문의가 협력이나 계약을 보장하지는 않습니다." },
      ],
    },
    closeKicker: "BABYLOG",
    closeTitleHtml: "먼저, 이야기부터<br />시작해 주세요.",
    closeLead: "여덟 가지 유형 중 가까운 것을 골라 문의해 주세요.",
  },
};

const EN = {
  lang: "en",
  status: STATUS.en,
  ui: {
    menuLabel: "BABYLOG menu",
    crumbHome: "Newon",
    crumbBabylog: "BabyLog",
    wordmark: "BabyLog",
    toInquiry: "Contact us",
    toBusiness: "Explore business",
    toPlatform: "Explore the platform",
    toPartnerships: "Partnership inquiry",
    inquiryCta: "Business inquiry",
    infoOnly:
      "This website only provides BABYLOG business information, partnership guidance and an inquiry link. Sign-in, parenting records, payment, trading, booking and education management are not available on the web.",
    noOutsourcing:
      "NEWON does not do custom web or app development, contract design or operations outsourcing for individual clients. We focus on standardized in-house products, licenses, platforms and automation products.",
    noPrice:
      "Confirmed prices and fees are published only after they are actually launched and approved. Revenue structures on this page are business directions under review, not prices.",
    noPartner:
      "This page is a call for partners. It does not mean a partnership or contract with any specific company or institution has been confirmed.",
    privacyNote: "Inquiries are sent through the official NEWON inquiry form. Personal data is handled under the Privacy Policy.",
    privacyLink: "Privacy Policy",
    sectionLabel: "Section",
    back: "← Back to BABYLOG overview",
  },
  seo: {
    overview: {
      title: "BABYLOG | NEWON — Every moment of family growth, in one connection",
      desc: "BABYLOG aims to be a comprehensive family platform connecting pregnancy and birth, parenting and education, a child's growth and everyday family life. A business introduction; features not yet released are described only as direction.",
    },
    platform: {
      title: "Platform | BABYLOG — From the start of a family to the next stage of growth",
      desc: "BABYLOG platform overview: the direction from pregnancy and parenting records to family sharing, learning and memories, clearly separated from what the app offers today.",
    },
    business: {
      title: "Business | BABYLOG — From services for families to a platform that connects industries",
      desc: "Six BABYLOG business areas — family and subscription, commerce, education and content, family services, business and institution solutions, licensing and global — by customer, problem, value, partners and current status.",
    },
    partnerships: {
      title: "Partnerships | BABYLOG — Looking for partners to build with",
      desc: "Eight partner types BABYLOG is looking for and the five-step process from proposal to delivery. A call for partners, not a confirmed partnership.",
    },
    contact: {
      title: "Contact | BABYLOG — Tell us about new possibilities",
      desc: "Reach BABYLOG about app use, subscriptions, sellers, brand partnerships, education, institutions, licensing and automation, or global cooperation through the official NEWON inquiry form.",
    },
  },

  overview: {
    hero: {
      titleHtml: "Every moment of family growth,<br />in one connection.",
      lead: "BABYLOG aims to be a comprehensive family platform connecting pregnancy and birth, parenting and education, a child's growth and everyday family life.",
      ctaMain: "Explore the platform",
      ctaSub: "Partnership inquiry",
    },
    vision: {
      kicker: "02 · Our Vision",
      title: "From pregnancy to high-school graduation,\nconnecting a family's time.",
      lines: [
        "What a family needs while a child grows — records, information, education, services — changes with each stage.",
        "BABYLOG aims to connect these scattered moments so families can focus more on their child's growth.",
        "A parenting log app is available today; the direction beyond it is being reviewed step by step.",
      ],
    },
    journey: {
      kicker: "03 · Family Journey",
      title: "A family's journey\nin six stages.",
      lead: "From pregnancy and birth to high school, what a family needs changes at each stage. These are general examples and every family is different.",
      note: "Stage topics are the direction BABYLOG is looking at. Not every item is offered in the app today.",
      items: [
        { id: "s1", n: "01", age: "Pregnancy & birth", name: "Preparing to meet your child", lead: "The time before and after birth when a family prepares and keeps records.", topics: ["Pregnancy records", "Birth preparation", "Postpartum records", "Family preparation"] },
        { id: "s2", n: "02", age: "Newborn & infant", name: "When every day becomes a record", lead: "Feeding, sleep and diapers add up day after day.", topics: ["Feeding · sleep · diapers", "Growth records", "Vaccination · health", "Family sharing"] },
        { id: "s3", n: "03", age: "Toddler", name: "Widening through play and learning", lead: "Meals, play, first experiences and the start of group care.", topics: ["Meals · play", "Development records", "Daycare · kindergarten schedule", "First experiences"] },
        { id: "s4", n: "04", age: "Elementary school", name: "When school and study join in", lead: "School and academy schedules, study and reading habits enter family life.", topics: ["School · academy schedule", "Study · reading", "Daily habits", "Keepsakes"] },
        { id: "s5", n: "05", age: "Middle school", name: "Trying things on their own", lead: "A child's self-management and the family's role change together.", topics: ["Study management", "Self-management", "Independent permissions (direction)", "Family communication"] },
        { id: "s6", n: "06", age: "High school", name: "Preparing for what comes next", lead: "Career, studies and graduation — a family watches a child's choices together.", topics: ["Career management", "Study planning", "Graduation records", "Education institutions (direction)"] },
      ],
    },
    connect: {
      kicker: "04 · What We Connect",
      title: "Starting from records,\nconnecting four things.",
      lead: "BABYLOG aims for a structure where family, learning and services connect around one record.",
      items: [
        { n: "01", name: "Records & growth", lead: "Gather a child's daily life, growth and health history in order." },
        { n: "02", name: "Family & guardians", lead: "Guardians and family see and continue the same records together." },
        { n: "03", name: "Learning & education", lead: "Learning, reading and career management, and links to education content and institutions, are under review as direction." },
        { n: "04", name: "Products & services", lead: "A way to explore parenting and education products and family services is under review." },
      ],
    },
    ecosystem: {
      kicker: "05 · Our Ecosystem",
      title: "Four parties,\ncentered on the family.",
      lead: "The BABYLOG ecosystem is meant to include families and the sellers, businesses and institutions that bring value to them.",
      items: [
        { n: "01", name: "Families", lead: "Families and guardians raising children. The central users who record, share and look for information." },
        { n: "02", name: "Creators & Sellers", lead: "Education experts, content creators and individual sellers who bring content and goods to families." },
        { n: "03", name: "Businesses", lead: "Parenting and family brands, service providers and companies that run family benefits." },
        { n: "04", name: "Institutions", lead: "Childcare, education and public institutions — partners for information and programs." },
      ],
    },
    opportunities: {
      kicker: "06 · Business Opportunities",
      title: "Six business areas.",
      lead: "Each area's customers, problems solved, partners and current status are on the Business page.",
      note: "All business areas are at a pre-launch review stage. Confirmed prices and fees are not published.",
    },
    newon: {
      kicker: "07 · NEWON Connection",
      title: "Built the NEWON way,\nwith standard products.",
      lead: "BABYLOG is introduced under the same principles as the other platforms NEWON runs.",
      items: [
        { n: "01", name: "In-house products first", body: "Standardized in-house products, licenses, platforms and automation products — not per-client outsourcing." },
        { n: "02", name: "Direction with ShareOn", body: "Person-to-person trading is being considered in connection with ShareOn. The principle is to design it so a single transaction is not charged fees twice. This is not a confirmed policy." },
        { n: "03", name: "Direction with LivOn and Ongil", body: "Links to life stages after childhood are considered only as a long-term direction." },
        { n: "04", name: "An information website", body: "The website only introduces and routes inquiries. Features are used in the app." },
      ],
    },
    next: {
      kicker: "08 · Next Step",
      titleHtml: "See what BABYLOG<br />is building next.",
      lead: "Look at the direction, check the business areas, and tell us how we might work together.",
    },
  },

  platform: {
    hero: {
      titleHtml: "From the start of a family<br />to the next stage of growth.",
      lead: "The direction of the BABYLOG platform, with what the app offers today clearly separated.",
      ctaMain: "App access",
      ctaSub: "Contact us",
    },
    sections: [
      {
        id: "growth",
        kicker: "02 · Growth Journey",
        title: "From pregnancy and birth\nto every stage of growth.",
        lead: "It starts from one child profile and continues into the records and information each stage needs.",
        items: [
          { name: "Pregnancy & birth", lead: "App guidance for expecting parents who want to start recording during pregnancy.", status: "released" },
          { name: "Child profile", lead: "Manage growth stage, health information and basic schedule for each child.", status: "released" },
          { name: "Extending to elementary, middle and high school", lead: "Gradually widening the records and management a child needs as they grow.", status: "direction" },
        ],
      },
      {
        id: "records",
        kicker: "03 · Parenting & Records",
        title: "Feeding, sleep, meals, growth —\nrecords every day.",
        lead: "Small daily records add up to a child's growth story.",
        items: [
          { name: "Feeding, sleep, diaper, meal and play records", lead: "Easily log everyday moments.", status: "released" },
          { name: "Growth & health records", lead: "Keep height, weight, vaccinations and health history in one timeline.", status: "released" },
          { name: "Growth statistics", lead: "See growth trends and daily patterns in charts.", status: "released" },
        ],
      },
      {
        id: "family",
        kicker: "04 · Family Connection",
        title: "Family sees and manages\ntogether.",
        lead: "Guardians and family check and continue the same records.",
        items: [
          { name: "Shared family management", lead: "Guardians and family look at the same child's records together.", status: "released" },
          { name: "Direction for teen independence", lead: "Considering ways to widen what a growing child manages on their own. No permission structure has been decided.", status: "direction" },
        ],
      },
      {
        id: "learning",
        kicker: "05 · Learning & Education",
        title: "School, study,\nand links to education.",
        lead: "School and academy schedules are in the app; learning management and education links are direction.",
        items: [
          { name: "School and academy schedules", lead: "Gather hospital visits, vaccinations, school and academy events and family plans.", status: "released" },
          { name: "Study, reading and career management", lead: "A direction for families to organize a child's study, reading and career exploration together.", status: "direction" },
          { name: "Education content and institutions", lead: "Considering ways to connect education content and institution programs.", status: "review" },
        ],
      },
      {
        id: "memories",
        kicker: "06 · Memories & Milestones",
        title: "Keeping passing time\nas memories.",
        lead: "A direction that lets families look back on the fast-changing early years.",
        items: [
          { name: "Photo, diary and growth archive", lead: "A direction for gathering photos, diary and growth records into one archive. Not presented as a released app feature.", status: "direction" },
          { name: "Growth albums and reports", lead: "Considering a product that turns growth records into albums and reports.", status: "review" },
        ],
      },
      {
        id: "assist",
        kicker: "07 · Smart Assistance",
        title: "Reference-only help\nto organize records.",
        lead: "AI is a reference tool that organizes and presents records.",
        items: [
          { name: "AI record summary and general information", lead: "Organizes record patterns for reference and provides general information. It does not replace medical diagnosis or professional advice.", status: "released" },
        ],
      },
      {
        id: "explore",
        kicker: "08 · Explore & Discover",
        title: "A direction for exploring\nproducts and services.",
        lead: "Considering an experience for finding products and services families need. Purchase, booking and trading are not offered on this website.",
        items: [
          { name: "Explore products and services", lead: "Considering a way to explore parenting and education products and family services.", status: "review" },
          { name: "Direction with SHAREON trading", lead: "Person-to-person trading is being considered in connection with SHAREON. There is no trading on this website, and the principle is to design it so one transaction is not charged fees twice. Not a confirmed policy.", status: "review" },
        ],
      },
      {
        id: "trust",
        kicker: "09 · Privacy & Trust",
        title: "A family's information\nbelongs to the family.",
        lead: "As a service that handles children's and families' records, standards come first.",
        items: [
          { name: "Ownership and sharing scope", lead: "The principle is that the family decides how far records are shared.", status: "direction" },
          { name: "Limits of AI information", lead: "AI-organized content is for reference and does not replace medical, legal or educational professionals.", status: "released" },
          { name: "Personal data handling", lead: "How personal data is handled is described in the Privacy Policy.", status: "released" },
        ],
      },
    ],
    access: {
      kicker: "10 · App Access",
      title: "Use it in the app.",
      lead: "BabyLog is available as an iOS and Android app. The links below are verified official store addresses.",
      appStore: "View on the App Store",
      googlePlay: "View on Google Play",
      deleteNote: "Account deletion guide",
      note: "Sign-in, records and payment are not available on this website.",
    },
  },

  business: {
    hero: {
      titleHtml: "From services for families<br />to a platform that connects industries.",
      lead: "The six business areas BABYLOG is considering, by customer, problem, value, partners and current status.",
      ctaMain: "See business areas",
      ctaSub: "Partnership inquiry",
    },
    intro: {
      kicker: "01 · Business Areas",
      title: "Six areas, one family platform.",
      lead: "Every area is at a pre-launch review stage. “Revenue model” below is a structure type under review, not a price.",
    },
    fields: {
      overview: "Overview",
      customers: "Main customers",
      problem: "Problem we address",
      value: "Product and service value",
      revenue: "Revenue model",
      partners: "Partners",
      status: "Current status",
      cta: "Related partnership",
    },
    categories: [
      {
        id: "a", code: "A", en: "Family & Subscription", name: "Family & Subscription",
        items: ["Family premium", "Family digital products", "Growth albums & reports", "Education content passes"],
        overview: "Subscription and digital products that help families use the BABYLOG app more deeply.",
        customers: "Families and guardians raising children",
        problem: "Records pile up, but turning them into albums, reports or study material is hard.",
        value: "Organize accumulated growth records into forms families can keep and use.",
        revenue: "Subscription use and per-item digital product purchase structures are under review. No confirmed prices.",
        partners: "Education content creators and experts",
        status: "review", partnerType: "creator",
      },
      {
        id: "b", code: "B", en: "Commerce & Marketplace", name: "Commerce & Marketplace",
        items: ["Parenting brand products", "Person-to-person second-hand trading", "Digital product distribution", "Joint products & campaigns"],
        overview: "An area for considering how parenting brands' and individual sellers' goods reach families.",
        customers: "Parenting and family brands, individual sellers, families looking for goods",
        problem: "It is hard to find trustworthy goods and second-hand items at the right time.",
        value: "Explore goods by stage, with person-to-person trading considered in connection with ShareOn.",
        revenue: "Transaction-linked and brand-campaign contract structures are under review. The principle is to avoid duplicate fees on one transaction; no confirmed prices.",
        partners: "Parenting and family brands, individual sellers, ShareOn",
        status: "review", partnerType: "brand",
      },
      {
        id: "c", code: "C", en: "Education & Content", name: "Education & Content",
        items: ["Parent education content", "Learning & reading content", "Education expert content", "Education institution programs"],
        overview: "Connecting education content for parents and children with institution programs.",
        customers: "Parents and guardians, learning children, education experts, institutions",
        problem: "It is hard to find reliable education content matched to a child's stage.",
        value: "A direction for introducing content and programs that fit a child's stage of growth.",
        revenue: "Content pass and content-sales-linked structures are under review. No confirmed prices.",
        partners: "Education experts, content creators, childcare and education institutions",
        status: "review", partnerType: "expert",
      },
      {
        id: "d", code: "D", en: "Family Services", name: "Family Services",
        items: ["Family activity & play programs", "Family photo & keepsake services", "Connecting qualified care providers"],
        overview: "A direction for connecting families with providers of experiences, keepsakes and care.",
        customers: "Families looking for services, family service providers",
        problem: "It is hard to find trustworthy experience, keepsake and care services in one place.",
        value: "Introduce service information and help families and providers connect. NEWON does not provide care or activities itself.",
        revenue: "Booking and referral structures are under review. Standards for verifying care providers' qualifications are yet to be set and are not confirmed.",
        partners: "Experience, photo and keepsake providers; care providers whose qualifications and requirements can be verified",
        status: "review", partnerType: "service",
      },
      {
        id: "e", code: "E", en: "Business & Institution Solutions", name: "Business & Institution Solutions",
        items: ["Corporate family-benefit passes", "Standard SaaS for institutions", "Partner operations tools", "Operations automation products"],
        overview: "Standardized products used for corporate family benefits and institution operations.",
        customers: "Benefits managers, childcare, education and public institutions, BABYLOG partners",
        problem: "Family-support programs and institution operations are scattered, making operations heavy.",
        value: "A direction that reduces operating burden with standardized products and automation, not custom development.",
        revenue: "Pass, standard-product subscription and institutional contract structures are under review. No confirmed prices.",
        partners: "Corporate benefits managers, childcare, education and public institutions",
        status: "review", partnerType: "corporate",
      },
      {
        id: "f", code: "F", en: "Licensing & Global", name: "Licensing & Global",
        items: ["Content & technology licensing", "Overseas distribution & localization", "Joint product development"],
        overview: "A direction for extending BABYLOG's content and technology with other companies and countries.",
        customers: "Companies that want to use the content and technology, overseas operators, strategic partners",
        problem: "Good family content and technology cannot reach families across language and country barriers.",
        value: "Look for ways to reach families in other markets through licensing and localization.",
        revenue: "Licensing and joint-development contract structures are under review. Negotiated per contract.",
        partners: "Global and strategic partners, companies using the content and technology",
        status: "direction", partnerType: "global",
      },
    ],
    closeKicker: "Partnership",
    closeTitleHtml: "Tell us what we could<br />build together.",
    closeLead: "Tell us which area interests you and we will get back to you after review.",
  },

  partnerships: {
    hero: {
      titleHtml: "We are looking for partners to build<br />a better everyday life for families.",
      lead: "Eight types of partners BABYLOG is looking for, and how we work together.",
      ctaMain: "See partner types",
      ctaSub: "Business inquiry",
    },
    process: {
      kicker: "01 · Process",
      title: "From proposal to delivery,\nfive steps.",
      lead: "Cooperation is reviewed in this order. An inquiry does not promise an outcome at any step.",
      steps: [
        { n: "01", name: "Proposal", body: "Send what you would like to work on through the inquiry form." },
        { n: "02", name: "Review", body: "We look at fit with BABYLOG's direction and what is possible now." },
        { n: "03", name: "Discussion", body: "We discuss scope, terms and timing together." },
        { n: "04", name: "Contract", body: "Agreed terms are put into a contract." },
        { n: "05", name: "Delivery", body: "Cooperation proceeds within the contracted scope." },
      ],
    },
    types: {
      kicker: "02 · Partner Types",
      title: "Eight types of partners.",
      lead: "Partner types are for introduction only. Choosing one does not create an account or a contract.",
      railLabel: "Jump to a partner type",
      fields: {
        who: "Who we work with",
        areas: "Possible areas of cooperation",
        revenue: "Revenue structure",
        terms: "Terms and review points",
        flow: "Process",
      },
      flowText: "Proposal → Review → Discussion → Contract → Delivery",
      items: [
        { code: "brand", n: "01", name: "Parenting & family brands", who: "Brands that make or sell parenting, maternity and family goods", areas: "Product introduction, joint products and campaigns, overseas distribution", revenue: "Transaction-linked or campaign contract structures are under review. Nothing is confirmed.", terms: "We check product safety and labeling standards, brand credibility and standards for advertising to families." },
        { code: "seller", n: "02", name: "Individual sellers", who: "Individuals who want to sell second-hand parenting goods or digital products", areas: "Person-to-person trading (direction with ShareOn), digital product introduction", revenue: "Transaction structures are under review. The principle is to avoid duplicate fees on one transaction; nothing is confirmed.", terms: "Eligible items, trading safety rules and seller verification are undecided. Seller accounts cannot be created on this website." },
        { code: "creator", n: "03", name: "Content creators", who: "Creators of family, parenting and learning content", areas: "Content supply, digital products, joint planning", revenue: "Content pass or sales-linked structures are under review. Nothing is confirmed.", terms: "We check copyright and scope of use, age suitability and content quality standards." },
        { code: "expert", n: "04", name: "Education experts", who: "Experts and instructors in parenting, education and development", areas: "Parent education content, expert content, education programs", revenue: "Content-sales-linked or contract structures are under review. Nothing is confirmed.", terms: "We review how fields and qualifications are verified, and standards so content is not mistaken for medical or legal advice." },
        { code: "service", n: "05", name: "Family service providers", who: "Providers of activities and play, family photos and keepsakes, and care services", areas: "Service information, booking and referral direction under review, joint programs", revenue: "Booking and referral structures are under review. Nothing is confirmed.", terms: "We check business verification, safety and qualification requirements, and standards for services aimed at children. Booking is not offered on this website." },
        { code: "corporate", n: "06", name: "Companies & benefits managers", who: "Managers of employee family benefits at companies", areas: "Corporate family-benefit passes, use of automation products", revenue: "Pass or subscription contract structures are under review. Nothing is confirmed.", terms: "We discuss how it connects to benefit programs, the scope of personal data handling and how eligibility is checked." },
        { code: "institution", n: "07", name: "Childcare, education & public institutions", who: "Childcare and education institutions, local governments and public bodies", areas: "Standard SaaS for institutions, education content licensing, program cooperation, information guidance", revenue: "Standard-product use or institutional contract structures are under review. Nothing is confirmed.", terms: "We check public procurement and contracting procedures, child-data protection standards and security requirements." },
        { code: "global", n: "08", name: "Global & strategic partners", who: "Companies for overseas distribution, localization and use of content and technology", areas: "Content and technology licensing, overseas distribution and localization, joint product development", revenue: "Licensing or joint-development contract structures are under review. Negotiated per contract.", terms: "We review local law, child and personal-data protection standards, language and cultural fit, and the scope of brand use." },
      ],
      cta: "Inquire as this type",
    },
    closeKicker: "Contact",
    closeTitleHtml: "Curious about partnering?<br />Start by talking to us.",
    closeLead: "Inquiries are sent through the official NEWON inquiry form.",
  },

  contact: {
    hero: {
      titleHtml: "Tell us about the new possibilities<br />you see with BABYLOG.",
      lead: "Choose an inquiry type and you will be taken to the official NEWON inquiry form.",
      ctaMain: "See inquiry types",
      ctaSub: "See partnerships",
    },
    list: {
      kicker: "01 · Inquiry Types",
      title: "What would you like\nto talk about?",
      lead: "Choose the closest of the eight types. The type you choose is passed along with the inquiry form.",
      items: [
        { code: "app", n: "01", name: "App use", lead: "Questions about using the BabyLog app." },
        { code: "subscription", n: "02", name: "Family subscription & payment", lead: "Questions about subscriptions and payment. Products not yet released can only be explained." },
        { code: "seller", n: "03", name: "Individual sellers & digital products", lead: "Seller and digital product cooperation." },
        { code: "brand", n: "04", name: "Business & brand partnerships", lead: "Partnerships with parenting and family brands and companies." },
        { code: "education", n: "05", name: "Education content & services", lead: "Education experts, content creators and service providers." },
        { code: "institution", n: "06", name: "Institution products & public cooperation", lead: "Product and cooperation questions from childcare, education and public institutions." },
        { code: "license", n: "07", name: "Corporate licensing & automation", lead: "Content and technology licensing, automation products." },
        { code: "global", n: "08", name: "Global & strategic cooperation", lead: "Overseas distribution, localization and strategic cooperation." },
      ],
      go: "Inquire as this type →",
    },
    guide: {
      kicker: "02 · Before You Write",
      title: "Before you get in touch.",
      items: [
        { n: "01", name: "Official inquiry form", body: "Inquiries go to the official NEWON inquiry form. This BABYLOG page does not collect personal data itself." },
        { n: "02", name: "App use questions", body: "Questions about using the app are received through the same form." },
        { n: "03", name: "Replies", body: "We reply after review. An inquiry does not guarantee cooperation or a contract." },
      ],
    },
    closeKicker: "BABYLOG",
    closeTitleHtml: "Start with<br />a conversation.",
    closeLead: "Pick the closest of the eight types and send us your inquiry.",
  },
};

/** ko and en have copy; every other locale falls back to the English draft (P7 translation policy). */
export function getBabylogCopy(lang) {
  return lang === "ko" ? KO : EN;
}

export function copyLangFor(lang) {
  return lang === "ko" ? "ko" : "en";
}
