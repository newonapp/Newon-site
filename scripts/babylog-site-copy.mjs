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

import { getExpansionCopy } from "./babylog-expansion-copy.mjs";

export const BL_SLUG = "babylog";

/** The five top-level items. Overview is the page root; the others are sub-routes. */
export const BL_NAV = [
  { id: "overview", sub: "", n: "01", en: "Overview", ko: "소개" },
  { id: "platform", sub: "platform", n: "02", en: "Platform", ko: "서비스" },
  { id: "business", sub: "business", n: "03", en: "Business", ko: "비즈니스" },
  { id: "partnerships", sub: "partnerships", n: "04", en: "Partnerships", ko: "파트너십" },
  { id: "contact", sub: "contact", n: "05", en: "Contact", ko: "문의" },
];

/** 8 partnership types and the first 8 of the 17 inquiry categories (stable codes used in the inquiry `source`). */
export const PARTNER_CODES = ["brand", "seller", "creator", "expert", "service", "corporate", "institution", "global"];
export const CONTACT_CODES = ["general", "app", "pregnancy", "health", "family", "commerce", "services", "education"];
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
    toBusiness: "사업 분야 알아보기",
    toPlatform: "플랫폼 살펴보기",
    toPartnerships: "파트너십 문의하기",
    inquiryCta: "기업·기관 문의하기",
    infoOnly:
      "이 웹사이트는 BABYLOG 브랜드·서비스·사업·협력 소개와 문의 연결만 제공합니다. 실제 기록·관리·거래·예약 등의 기능은 BABYLOG 앱에서 제공하는 방향이며, 로그인, 육아 기록, 결제, 거래, 예약, 교육 관리는 웹에서 제공하지 않습니다.",
    noOutsourcing:
      "NEWON은 고객별 웹·앱 외주 개발, 수탁 디자인, 운영 대행을 하지 않습니다. 표준화된 자체 SaaS·플랫폼·라이선스·자동화 제품을 중심으로 소개합니다.",
    noPrice:
      "확정된 요금과 수수료는 실제로 출시·승인된 뒤에 공개합니다. 이 페이지의 수익 구조는 검토 중인 사업 방향이며 가격이 아닙니다.",
    noPartner:
      "이 페이지는 파트너 모집 안내입니다. 특정 기업·기관과의 제휴나 계약이 확정되었음을 뜻하지 않으며, 계약되지 않은 기관을 실제 제휴사로 표시하지 않습니다.",
    privacyNote: "문의 내용은 NEWON 공식 문의 양식으로 전달됩니다. 개인정보 처리는 개인정보처리방침을 따릅니다.",
    privacyLink: "개인정보처리방침",
    sectionLabel: "섹션",
    back: "← BABYLOG 소개로",
  },
  seo: {
    overview: {
      title: "BABYLOG | NEWON — 아이와 함께 자라는 모든 순간을, 하나로",
      desc: "BABYLOG는 임신을 준비하는 순간부터 아이가 성장하는 모든 과정까지 부모와 아이, 가족과 돌봄기관을 연결하는 통합 육아·가족 플랫폼을 지향합니다.",
    },
    platform: {
      title: "플랫폼 | BABYLOG — 임신부터 육아, 성장과 가족생활까지",
      desc: "BABYLOG 플랫폼 소개. 임신·출산, 육아·성장, 가족·커뮤니티, 육아 생활, 공공정보·안전의 21개 서비스를 현재 앱 이용 범위와 구분해 안내합니다.",
    },
    business: {
      title: "비즈니스 | BABYLOG — 가족의 일상에서, 육아 산업의 미래까지",
      desc: "BABYLOG의 6개 사업 모델과 8개 카테고리 32개 사업 분야를 대상, 가치, 운영 조건, 현재 상태로 소개합니다.",
    },
    partnerships: {
      title: "파트너십 | BABYLOG — 더 나은 육아와 가족의 미래를 함께",
      desc: "BABYLOG가 협력을 찾는 파트너 유형과 15개 협력 분야, 협력 절차를 안내합니다. 확정된 제휴를 뜻하지 않는 모집 안내입니다.",
    },
    contact: {
      title: "문의 | BABYLOG — 새로운 가능성을 이야기해 주세요",
      desc: "BABYLOG 일반 문의, 앱 지원, 임신·육아, 커머스, 교육·보육기관, 기관 SaaS, 기업, 공공, 기술, 글로벌, 미디어 문의를 NEWON 공식 문의 양식으로 연결합니다.",
    },
  },

  overview: {
    hero: {
      titleHtml: "아이와 함께 자라는 모든 순간을,<br />하나로.",
      lead: "임신을 준비하는 순간부터 아이가 태어나고 성장하는 모든 과정까지. BABYLOG는 부모와 아이, 가족과 돌봄기관을 연결하는 통합 육아·가족 플랫폼을 만들어갑니다.",
      ctaMain: "플랫폼 살펴보기",
      ctaSub: "파트너십 문의하기",
    },
    vision: {
      kicker: "02 · About BABYLOG",
      title: "육아의 모든 순간이\n하나로 이어지는 경험.",
      lines: [
        "아이를 키우는 일에는 수많은 기록과 선택, 정보와 준비가 필요합니다. 임신 주차별 정보부터 출산 준비, 수유와 수면, 성장과 건강, 교육과 돌봄, 가족의 일정까지 부모가 관리해야 할 일은 끊임없이 이어집니다.",
        "BABYLOG는 이러한 경험을 하나의 플랫폼으로 연결하고자 합니다. 부모가 아이와 함께하는 시간을 더 의미 있게 보낼 수 있도록, 가족에게 필요한 기록과 정보, 생활 서비스와 기관 연결을 통합하는 디지털 생태계를 지향합니다.",
        "지금은 육아 기록 앱이 출시되어 있고, 그 너머의 방향은 단계적으로 검토합니다.",
      ],
    },
    journey: {
      kicker: "03 · The Parenting Journey",
      title: "임신 준비부터\n성장과 교육까지.",
      lead: "아이의 성장에는 각기 다른 필요와 변화가 있습니다. BABYLOG는 임신과 출산, 영유아기, 아동 성장 단계에 맞춰 가족에게 필요한 경험을 연결하는 플랫폼을 지향합니다.",
      note: "단계별 주제는 BABYLOG가 바라보는 방향입니다. 모든 항목이 현재 앱에서 제공되는 것은 아니며, 가족마다 다를 수 있습니다.",
      items: [
        { id: "s1", n: "01", age: "임신 준비", name: "새로운 가족을 준비하는 첫걸음", lead: "건강한 생활 습관과 검진 준비, 필요한 정보를 살펴보며 새로운 가족을 맞을 준비를 시작하는 시기.", topics: ["임신 준비 체크리스트", "건강한 생활 습관", "검진 준비", "전문기관 안내"] },
        { id: "s2", n: "02", age: "임신", name: "임신 기간의 변화와 중요한 일정을 함께", lead: "임신 주차별 변화와 산전검사 일정을 확인하고, 가족이 함께 출산을 준비하는 시기.", topics: ["임신 주차 정보", "산전검사 일정", "임신 기록", "출산 준비물"] },
        { id: "s3", n: "03", age: "출산·회복", name: "출산과 산후 회복의 모든 과정", lead: "아이를 맞이하고, 부모의 회복과 새로운 생활을 준비하는 시기.", topics: ["출산 기록", "산후 회복", "산후조리 정보", "산후 지원제도"] },
        { id: "s4", n: "04", age: "신생아", name: "수유·수면·기저귀 등 신생아의 일상", lead: "매일 반복되는 수유와 수면, 기저귀의 순간이 기록으로 쌓이는 시기.", topics: ["수유 기록", "수면 기록", "기저귀 기록", "일별 요약"] },
        { id: "s5", n: "05", age: "영아 성장", name: "성장·건강·발달을 기록하는 시간", lead: "키·몸무게와 예방접종, 이유식과 발달 변화를 시간의 흐름에 따라 살펴보는 시기.", topics: ["키·몸무게", "예방접종", "이유식", "발달 정보"] },
        { id: "s6", n: "06", age: "유아·아동·가족", name: "놀이·교육·가족생활로 넓어지는 경험", lead: "놀이와 독서, 어린이집·유치원 생활로 아이의 세상이 넓어지고, 부모·보호자와 돌봄기관이 함께 아이의 성장을 살펴보는 시기.", topics: ["연령별 놀이", "어린이집·유치원", "가족 공동 육아", "보호자·기관 소통"] },
      ],
    },
    connect: {
      kicker: "04 · Our Mission",
      title: "부모의 부담은 줄이고,\n아이와 함께하는 시간은 더 소중하게.",
      lead: "BABYLOG는 단순한 기록을 넘어 부모와 가족의 일상을 돕는 서비스를 목표로 합니다.",
      items: [
        { n: "01", name: "체계적인 성장 기록", lead: "아이의 성장을 체계적으로 기록하는 경험. 일상과 성장, 건강 이력을 시간 순서로 모읍니다." },
        { n: "02", name: "가족 중심의 관리", lead: "부모와 보호자가 함께 참여하는 가족 중심의 관리. 같은 기록을 함께 보고 이어갑니다." },
        { n: "03", name: "단계별 정보와 연결", lead: "성장 단계에 맞는 정보와 서비스, 그리고 육아 산업과 전문기관을 연결하는 플랫폼을 지향합니다." },
        { n: "04", name: "안전한 성장을 위한 정보", lead: "모든 아이가 안전하고 건강하게 성장할 수 있도록 공식 정보에 쉽게 닿는 접근성을 지향합니다." },
      ],
    },
    ecosystem: {
      kicker: "05 · Beyond Parenting",
      title: "육아 기록을 넘어,\n가족을 위한 더 큰 연결로.",
      lead: "BABYLOG는 가족 사용자와 육아 브랜드, 교육·돌봄기관, 기업, 공공기관을 연결하는 플랫폼 생태계로 확장하고자 합니다. 가정의 일상에서 시작해 육아 산업의 운영과 서비스, 아동 복지와 안전에 이르기까지 더 넓은 가치를 만들어갑니다.",
      items: [
        { n: "01", name: "Families", lead: "아이를 키우는 부모와 보호자, 가족. 기록하고 나누고 필요한 정보를 찾는 BABYLOG의 중심 이용자입니다." },
        { n: "02", name: "Parenting Brands", lead: "육아용품·유아식품·가족생활 브랜드와 판매자. 가족에게 필요한 상품과 정보를 전하는 협력 대상입니다." },
        { n: "03", name: "Education & Care", lead: "어린이집·유치원과 돌봄기관, 교육 전문가. 보호자 소통과 기관 운영 협력의 대상입니다." },
        { n: "04", name: "Companies & Public", lead: "임직원 가족복지를 운영하는 기업과 정부·지자체·공공기관. 가족복지와 공공 육아지원 정보 협력의 대상입니다." },
      ],
    },
    opportunities: {
      kicker: "06 · Business Opportunities",
      title: "B2C부터 글로벌까지, 여섯 개의 사업 모델.",
      lead: "부모·가족을 위한 B2C부터 교육·돌봄기관과 브랜드·기업을 위한 B2B, B2G, 플랫폼 커머스, 글로벌까지. 각 모델의 대상과 방향은 비즈니스 페이지에서 자세히 소개합니다.",
      note: "모든 사업 모델은 출시 전 검토 단계입니다. 확정된 요금과 수수료는 공개하지 않습니다.",
    },
    newon: {
      kicker: "07 · NEWON Connection",
      title: "NEWON의 표준 제품 방식으로\n만듭니다.",
      lead: "BABYLOG는 NEWON의 핵심 플랫폼이며, NEWON이 운영하는 여러 플랫폼과 같은 원칙으로 소개합니다.",
      items: [
        { n: "01", name: "자체 제품 중심", body: "고객별 외주가 아니라 표준화된 자체 SaaS·플랫폼·라이선스·자동화 제품을 중심으로 합니다." },
        { n: "02", name: "SHAREON과의 역할 구분", body: "육아용품 공유·대여와 개인 간 거래는 SHAREON과 역할을 구분해 연계하는 방향을 검토합니다. 하나의 거래에 수수료가 이중으로 부과되지 않도록 구조를 설계하는 것이 원칙입니다. 확정된 정책은 아닙니다." },
        { n: "03", name: "LIVON·ONGIL과의 역할 구분", body: "출산 지원금·육아휴직 같은 생활 제도 안내는 LIVON과 역할을 나누고, 아이의 성장 이후 생애 단계와의 연결은 장기 방향으로만 검토합니다." },
        { n: "04", name: "웹과 앱의 역할", body: "웹사이트는 브랜드·서비스·사업·협력 소개와 문의 연결을 담당하고, 실제 기록과 관리 기능은 앱에서 이용합니다." },
      ],
    },
    next: {
      kicker: "08 · Next Step",
      titleHtml: "아이와 가족의 새로운 일상을<br />BABYLOG와 함께.",
      lead: "BABYLOG 플랫폼과 사업, 기업·기관 협력에 대해 자세히 알아보세요.",
    },
  },

  platform: {
    hero: {
      titleHtml: "임신부터 육아,<br />성장과 가족생활까지.",
      lead: "아이와 가족의 삶에 필요한 기록, 정보, 일정, 커뮤니티와 서비스를 하나의 경험으로 연결합니다. 각 서비스의 실제 제공 여부는 개발 상태에 맞춰 표시합니다.",
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
          { name: "임신·출산 관리", lead: "임신 시기부터 기록을 시작하는 예비 부모를 위한 앱 안내. 임신 주차별 변화와 검진 일정을 함께 관리합니다.", status: "released" },
          { name: "아이 프로필", lead: "성장 단계, 건강 정보, 기본 일정을 아이별로 관리합니다.", status: "released" },
          { name: "영유아기 이후 단계 확장", lead: "아이가 자라는 동안 필요한 기록과 관리 범위를 놀이·교육·가족생활 단계로 넓히는 방향.", status: "direction" },
        ],
      },
      {
        id: "records",
        kicker: "03 · Parenting & Records",
        title: "수유·수면·식사·성장,\n매일의 기록.",
        lead: "반복되는 육아의 순간을 편리하게 기록하고, 하루의 작은 기록이 쌓여 아이의 성장 이야기가 됩니다.",
        items: [
          { name: "수유·수면·배변·식사·놀이 기록", lead: "매일 반복되는 순간을 간편하게 남기고 일별 요약으로 확인합니다.", status: "released" },
          { name: "성장·건강 기록", lead: "키, 몸무게, 예방접종과 건강 이력을 시간 순서로 모아 봅니다.", status: "released" },
          { name: "성장 통계", lead: "성장 추이와 생활 패턴을 그래프로 확인합니다.", status: "released" },
        ],
      },
      {
        id: "family",
        kicker: "04 · Family Connection",
        title: "가족이 함께 보고,\n함께 관리합니다.",
        lead: "육아는 혼자가 아닌, 가족이 함께하는 일입니다. 보호자와 가족이 같은 기록을 확인하고 이어갑니다.",
        items: [
          { name: "가족 공동 관리", lead: "부모와 보호자가 같은 아이의 기록과 일정을 함께 확인합니다.", status: "released" },
          { name: "보호자별 접근권한 방향", lead: "보호자별 접근권한과 아이가 자라면서 스스로 관리하는 범위를 넓히는 방향을 검토합니다. 구체적인 권한 구조는 정해지지 않았습니다.", status: "direction" },
        ],
      },
      {
        id: "learning",
        kicker: "05 · Learning & Education",
        title: "놀이와 학습,\n그리고 교육 연결.",
        lead: "일정 관리는 앱에서 이용하는 범위이고, 놀이·학습 콘텐츠와 교육기관 연결은 방향입니다.",
        items: [
          { name: "병원·교육 일정", lead: "병원 방문, 예방접종, 어린이집·유치원과 교육 일정, 가족 일정을 모아 봅니다.", status: "released" },
          { name: "놀이·독서·학습 정보", lead: "연령별 놀이와 독서, 감각 활동 등 발달 단계에 맞는 활동 정보를 가족이 함께 살펴보는 방향.", status: "direction" },
          { name: "교육 콘텐츠·기관 연결", lead: "교육 콘텐츠와 어린이집·유치원 등 교육기관 프로그램을 연결하는 방향을 검토합니다.", status: "review" },
        ],
      },
      {
        id: "memories",
        kicker: "06 · Memories & Milestones",
        title: "지나가는 시간을\n추억으로 남깁니다.",
        lead: "빠르게 크는 시기의 변화를 나중에 가족과 함께 되돌아볼 수 있도록 하는 방향입니다.",
        items: [
          { name: "사진·일기·성장 추억", lead: "사진, 일기와 월령별 성장 기록을 하나의 아카이브로 모으는 방향. 앱 출시 기능으로 안내하지 않습니다.", status: "direction" },
          { name: "성장 앨범·리포트", lead: "성장 기록을 앨범과 리포트로 정리하는 상품 방향을 검토합니다.", status: "review" },
        ],
      },
      {
        id: "assist",
        kicker: "07 · Smart Assistance",
        title: "기록을 정리하는\n참고용 도움.",
        lead: "AI는 기록을 정리해 보여 주는 참고용 도구입니다.",
        items: [
          { name: "AI 기록 요약 및 일반 정보", lead: "기록의 패턴을 참고용으로 정리하고 연령과 상황에 맞는 일반 정보를 제공합니다. 의료 진단이나 전문가의 조언을 대신하지 않습니다.", status: "released" },
        ],
      },
      {
        id: "explore",
        kicker: "08 · Explore & Discover",
        title: "상품과 서비스를\n탐색하는 방향.",
        lead: "가족에게 필요한 상품과 서비스를 찾는 경험을 검토합니다. 웹사이트에서 구매·예약·거래는 제공하지 않습니다.",
        items: [
          { name: "상품·서비스 탐색", lead: "육아용품·교육 상품과 산후조리·돌봄 등 가족 서비스 정보를 탐색하는 방향을 검토합니다.", status: "review" },
          { name: "SHAREON 공유·대여 연계 방향", lead: "육아용품 공유·대여와 개인 간 거래는 SHAREON과 역할을 구분해 연계하는 방향을 검토합니다. 거래 기능은 웹사이트에 없으며, 하나의 거래에 수수료가 이중으로 부과되지 않도록 구조를 설계하는 것이 원칙입니다. 확정된 정책은 아닙니다.", status: "review" },
        ],
      },
      {
        id: "trust",
        kicker: "09 · Our Commitment",
        title: "아이의 안전과 가족의 신뢰를\n가장 먼저 생각합니다.",
        lead: "BABYLOG가 지향하는 기준입니다. 아이와 가족의 기록을 다루는 서비스로서 이 기준을 먼저 둡니다.",
        items: [
          { name: "아동과 가족의 개인정보 보호", lead: "아이와 가족의 개인정보를 중요하게 다룹니다. 처리 기준은 개인정보처리방침에서 확인할 수 있습니다.", status: "released" },
          { name: "신뢰할 수 있는 육아·건강 정보", lead: "AI가 정리한 내용은 참고용이며 의료·법률·교육 전문가의 판단을 대신하지 않습니다.", status: "released" },
          { name: "보호자 권한을 고려한 데이터 관리", lead: "기록은 가족이 공유 범위를 정하는 것을 원칙으로 합니다.", status: "direction" },
          { name: "접근하기 쉬운 서비스", lead: "iOS와 Android 앱으로 이용하며, 접근성은 계속 개선해 나가는 방향입니다.", status: "direction" },
          { name: "아동 안전·보호 정보의 책임 있는 제공", lead: "공식 기관의 정보와 신고 경로를 안내하며, 신고 접수나 아이의 위치·신원 확인은 하지 않습니다.", status: "plan" },
          { name: "공익적 정보 접근성", lead: "취약 아동과 가족이 공식 제도와 기관 정보에 무료로 닿을 수 있도록 하는 방향입니다.", status: "plan" },
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
    closeKicker: "Platform",
    closeTitleHtml: "가족의 일상에서 시작해,<br />아이의 미래까지.",
    closeLead: "BABYLOG는 아이의 성장 단계와 가족의 변화에 맞춰 필요한 경험을 연결하는 플랫폼을 만들어갑니다.",
  },

  business: {
    hero: {
      titleHtml: "가족의 일상에서,<br />육아 산업의 미래까지.",
      lead: "BABYLOG는 임신·출산·육아·아동 성장과 관련된 디지털 서비스에서 출발해 커머스, 교육·돌봄기관, 기업 솔루션, 공공복지와 아동 보호까지 확장하는 플랫폼 생태계를 지향합니다.",
      ctaMain: "사업 분야 보기",
      ctaSub: "파트너십 알아보기",
    },
    intro: {
      kicker: "01 · Business Models",
      title: "개인에서 기업, 공공기관까지\n확장되는 사업 구조.",
      lead: "BABYLOG는 개인 프리미엄 구독, 육아 커머스, 적격 서비스 연결, 기관 SaaS, 기업 가족복지 솔루션, 브랜드 광고, 공공기관 계약, 글로벌 라이선싱 등 다양한 수익 모델을 검토합니다. 아래 ‘수익 모델’은 가격이 아닌 검토 중인 구조 유형입니다.",
    },
    fields: {
      overview: "사업 개요",
      customers: "대상",
      problem: "해결하는 문제",
      value: "주요 방향",
      revenue: "수익 모델",
      partners: "협력 대상",
      status: "현재 제공 상태",
      cta: "관련 파트너십",
    },
    categories: [
      {
        id: "a", code: "A", en: "B2C", name: "부모·가족 서비스",
        items: ["무료·프리미엄 앱", "육아 정보", "생활 서비스 정보", "가족 공유"],
        overview: "부모와 가족이 BABYLOG 앱으로 아이의 일상을 기록하고 필요한 정보를 찾는 소비자 서비스 영역입니다.",
        customers: "부모·가족, 보호자",
        problem: "육아에 필요한 기록과 정보, 일정이 여러 곳에 흩어져 있어 관리 부담이 큽니다.",
        value: "무료·프리미엄 앱과 정보·생활 서비스로 기록·정보·일정을 하나의 경험으로 연결합니다. 육아 기록 앱은 현재 스토어에서 이용할 수 있습니다.",
        revenue: "개인 프리미엄 구독 구조를 검토 중입니다. 확정된 요금은 없습니다.",
        partners: "교육 콘텐츠 제작자, 교육 전문가",
        status: "review", partnerType: "creator",
      },
      {
        id: "b", code: "B", en: "B2B · Institutions", name: "교육·돌봄기관 솔루션",
        items: ["기관 SaaS", "출결·일정 관리", "기관·보호자 소통", "운영 자동화"],
        overview: "어린이집·유치원과 돌봄기관을 위한 표준화된 운영 SaaS 영역입니다.",
        customers: "어린이집, 유치원, 돌봄기관, 돌봄 서비스 사업자",
        problem: "출결과 일정, 보호자 소통과 운영 업무가 분산되어 있어 기관의 운영 부담이 큽니다.",
        value: "맞춤 개발이 아닌 표준화된 자체 SaaS와 자동화 제품으로 운영 부담을 줄이는 방향입니다.",
        revenue: "기관 SaaS 구독과 기관 계약 구조를 검토 중입니다. 확정된 요금은 없습니다.",
        partners: "보육·교육기관, 적격 돌봄 서비스 사업자",
        status: "review", partnerType: "institution",
      },
      {
        id: "c", code: "C", en: "B2B · Brands & Companies", name: "브랜드·기업 솔루션",
        items: ["브랜드 솔루션", "기업 가족복지 솔루션", "브랜드 광고·캠페인", "커머스 연계"],
        overview: "육아 브랜드와 기업을 위한 브랜드 솔루션, 기업 가족복지 솔루션, 커머스 영역입니다.",
        customers: "육아 브랜드·판매자, 임직원 가족복지를 운영하는 기업",
        problem: "브랜드는 필요한 시기의 가족과 만나기 어렵고, 기업은 임직원 가족 지원을 한곳에서 운영하기 어렵습니다.",
        value: "상품 정보·입점·캠페인 지원과 기업용 가족복지 제품을 표준화된 자체 제품으로 제공하는 방향입니다.",
        revenue: "기업 가족복지 솔루션과 브랜드 광고·캠페인 계약 구조를 검토 중입니다. 확정된 요금은 없습니다.",
        partners: "육아 브랜드, 기업·복지 담당자",
        status: "review", partnerType: "corporate",
      },
      {
        id: "d", code: "D", en: "B2G", name: "공공기관·지자체 협력",
        items: ["공공 육아지원 정보", "아동복지 정보", "지역 육아 프로그램", "공식 신청 경로 안내"],
        overview: "공공기관·지자체와 함께 공공 육아지원 정보와 아동복지 솔루션을 검토하는 영역입니다.",
        customers: "정부기관, 지방자치단체, 공공 육아지원 관련 기관",
        problem: "가족에게 필요한 지원 제도와 공식 신청 경로를 한눈에 찾기 어렵습니다.",
        value: "공식 제도와 신청 경로를 정확하게 안내하는 방향입니다. 아동 보호·실종·학대 예방·입양·위탁 관련 공익 정보는 상업적 거래와 구분하고, 취약한 아동의 정보나 보호 필요성을 수익화하지 않습니다.",
        revenue: "공공기관 계약 구조를 검토 중입니다. 공공 조달·계약 절차를 따르며 확정된 조건은 없습니다.",
        partners: "정부기관, 지자체, 공공 육아지원 기관",
        status: "direction", partnerType: "institution",
      },
      {
        id: "e", code: "E", en: "Platform Commerce", name: "플랫폼 커머스",
        items: ["육아용품 커머스", "기획전·공동구매", "적격 서비스 연결", "공유·대여(SHAREON 연계)"],
        overview: "육아 브랜드와 판매자, 적격 서비스 사업자의 상품·서비스를 가족과 연결하는 영역입니다.",
        customers: "육아·가족 브랜드, 판매자, 상품과 서비스를 찾는 가족",
        problem: "필요한 시기에 믿을 수 있는 상품과 서비스를 찾기 어렵습니다.",
        value: "상품·서비스 연결과 적법한 거래 구조를 검토합니다. 공유·대여 거래는 SHAREON과 역할을 구분해 연계하는 방향입니다.",
        revenue: "적법한 거래 연계와 브랜드 캠페인 계약 구조를 검토 중입니다. 같은 거래에 수수료가 중복되지 않도록 설계하는 것이 원칙이며, 확정된 요금은 없습니다.",
        partners: "육아·가족 브랜드, 판매자, 가족 서비스 사업자, SHAREON",
        status: "review", partnerType: "brand",
      },
      {
        id: "f", code: "F", en: "Global", name: "글로벌",
        items: ["다국어 플랫폼", "기관용 SaaS 라이선스", "현지화", "해외 유통 협력"],
        overview: "국가별 언어와 육아환경, 제도에 맞춘 다국어 플랫폼과 SaaS 라이선스를 장기적으로 검토하는 영역입니다.",
        customers: "해외 가족, 해외 기업·기관, 전략적 파트너",
        problem: "좋은 가족 서비스와 기술도 언어와 제도의 차이 때문에 전달되지 못합니다.",
        value: "현지화와 라이선스를 통해 다른 시장의 가족에게 닿는 방법을 모색합니다.",
        revenue: "다국어 플랫폼·SaaS 라이선스 계약 구조를 검토 중입니다. 계약별로 협의합니다.",
        partners: "글로벌·전략적 파트너, 해외 기관",
        status: "direction", partnerType: "global",
      },
    ],
    closeKicker: "Partnership",
    closeTitleHtml: "육아의 일상에서 시작해,<br />가족과 산업을 연결하는 플랫폼으로.",
    closeLead: "BABYLOG는 부모와 아이에게 필요한 서비스를 발전시키고, 육아 관련 기업과 기관이 함께 참여할 수 있는 생태계를 만들어갑니다.",
  },

  partnerships: {
    hero: {
      titleHtml: "더 나은 육아와 가족의 미래를<br />함께 만들어갑니다.",
      lead: "BABYLOG는 육아 브랜드, 교육·돌봄기관, 전문기관, 기업, 공공기관, 기술 파트너와의 협력을 통해 가족과 아이를 위한 새로운 경험을 만들어가고자 합니다.",
      ctaMain: "파트너 유형 보기",
      ctaSub: "기업·기관 문의하기",
    },
    process: {
      kicker: "01 · Process",
      title: "제안에서 진행까지,\n다섯 단계.",
      lead: "협력은 아래 순서로 검토합니다. 문의는 단계별 결과를 약속하는 것이 아니며, 실제 계약·제휴 여부는 투명하게 표시합니다.",
      steps: [
        { n: "01", name: "제안", body: "협력하고 싶은 내용을 문의 양식으로 보내 주세요." },
        { n: "02", name: "검토", body: "BABYLOG 방향과 맞는지, 파트너의 적격성과 서비스 신뢰성을 살펴봅니다." },
        { n: "03", name: "협의", body: "협력 범위, 조건, 일정과 개인정보 보호 기준을 함께 논의합니다." },
        { n: "04", name: "계약", body: "합의된 내용을 계약으로 정리합니다." },
        { n: "05", name: "진행", body: "계약 범위 안에서 협력을 진행하고, 확인된 뒤에만 파트너로 공개합니다." },
      ],
    },
    types: {
      kicker: "02 · Why Partner With BABYLOG",
      title: "가족 중심의 플랫폼에서\n새로운 사업 기회를 연결합니다.",
      lead: "BABYLOG는 가족의 일상과 육아 산업을 이해하는 플랫폼을 지향합니다. 협력 분야에 따라 브랜드와 소비자 연결, 기관 운영 효율화, 가족복지 서비스, 공공정보 접근성, 기술·글로벌 협력 등 다양한 가능성을 함께 검토합니다. 아래 여덟 유형은 소개를 위한 분류이며, 선택해도 계정이나 계약이 만들어지지 않습니다.",
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
          who: "육아용품, 유아식품, 유아 의류, 생활용품을 만들거나 판매하는 브랜드",
          areas: "상품 정보, 플랫폼 입점, 기획전·브랜드 캠페인·공동구매, 해외 유통 협력",
          revenue: "거래 연계 또는 캠페인 계약 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "상품 안전·표시 기준, 브랜드 신뢰도, 가족·아동 대상 광고 기준을 확인합니다.",
        },
        {
          code: "seller", n: "02", name: "육아 커머스 판매자",
          who: "육아 커머스 판매자, 유통 사업자, 육아용품 재사용·공유를 원하는 개인",
          areas: "상품 소개, 공유·대여와 개인 간 거래(SHAREON 연계 방향)",
          revenue: "거래 구조를 검토 중입니다. 같은 거래에 수수료가 중복되지 않도록 설계하는 것이 원칙이며 확정된 조건은 없습니다.",
          terms: "판매 가능 품목, 거래 안전 기준, 판매자 확인 방식은 정해지지 않았습니다. 웹사이트에서 판매자 계정을 만들 수 없습니다.",
        },
        {
          code: "creator", n: "03", name: "콘텐츠 제작자",
          who: "육아·놀이·학습·가족 콘텐츠를 만드는 제작자",
          areas: "연령별 놀이·독서·교육 콘텐츠 제공, 공동 기획",
          revenue: "콘텐츠 이용권 또는 판매 연계 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "저작권과 이용 범위, 연령 적합성, 콘텐츠 품질, 아동 사진·정보 사용 기준을 확인합니다.",
        },
        {
          code: "expert", n: "04", name: "육아·발달 전문가",
          who: "아동 발달, 부모 교육, 육아·교육 분야의 전문가와 전문 교육기관",
          areas: "부모 교육, 발달 정보, 산후 정서·양육 스트레스 관련 정보, 교육 프로그램",
          revenue: "콘텐츠 판매 연계 또는 계약 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "전문 분야와 자격 확인 방식, 콘텐츠가 의료·법률 조언으로 오해되지 않도록 하는 기준을 검토합니다.",
        },
        {
          code: "service", n: "05", name: "육아·돌봄 서비스 사업자",
          who: "산후조리, 산후도우미, 아이돌봄, 가족 체험 서비스를 운영하는 적격 사업자",
          areas: "서비스 정보 소개, 적격 서비스 연결 방향 검토, 공동 프로그램",
          revenue: "서비스 연결 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "사업자 확인, 안전과 자격 요건, 아이를 대상으로 하는 서비스의 기준을 확인합니다. 웹사이트에서 예약은 제공하지 않습니다.",
        },
        {
          code: "corporate", n: "06", name: "기업·복지 담당자",
          who: "임직원 가족복지와 부모 지원 프로그램을 운영하는 기업의 담당자",
          areas: "기업 가족복지 솔루션, 부모 지원 정보, 자동화 제품 활용",
          revenue: "이용권 또는 구독 계약 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "복지 제도 연계 방식, 개인정보 처리 범위, 이용 대상 확인 방식을 협의합니다.",
        },
        {
          code: "institution", n: "07", name: "교육·돌봄·공공기관",
          who: "어린이집·유치원·돌봄기관, 정부기관과 지방자치단체",
          areas: "기관 SaaS, 기관·보호자 소통, 공공 육아지원 정보 안내, 프로그램 협력",
          revenue: "표준 제품 이용 또는 기관 계약 구조를 검토 중입니다. 확정된 조건은 없습니다.",
          terms: "공공 조달·계약 절차, 아동 정보 보호 기준, 보안 요건을 확인합니다.",
        },
        {
          code: "global", n: "08", name: "글로벌·기술 파트너",
          who: "해외 육아·가족 서비스 사업자와 기관, 보안·데이터 보호·접근성·자동화 기술 파트너",
          areas: "다국어 플랫폼, SaaS 라이선스, 현지화, 기술 협력",
          revenue: "라이선스 또는 공동 개발 계약 구조를 검토 중입니다. 계약별로 협의합니다.",
          terms: "현지 법규와 아동·개인정보 보호 기준, 언어·문화 적합성, 브랜드 사용 범위를 검토합니다.",
        },
      ],
      cta: "이 유형으로 문의하기",
    },
    closeKicker: "Partnership",
    closeTitleHtml: "BABYLOG와 함께할<br />파트너를 찾습니다.",
    closeLead: "육아·가족·교육·돌봄·공공복지·기술 분야에서 새로운 협력 가능성을 제안해 주세요.",
  },

  contact: {
    hero: {
      titleHtml: "BABYLOG와 새로운 가능성을<br />이야기해 주세요.",
      lead: "서비스 이용 문의부터 육아 브랜드 입점, 기업 솔루션, 교육·돌봄기관 협력, 공공기관 및 글로벌 사업까지 다양한 제안을 기다립니다.",
      ctaMain: "문의 분야 보기",
      ctaSub: "파트너십 보기",
    },
    list: {
      kicker: "01 · Contact Categories",
      title: "어떤 이야기를\n나누고 싶으신가요?",
      lead: "열일곱 가지 문의 분야 중 가까운 유형을 선택해 주세요. 선택한 유형은 NEWON 공식 문의 양식에 함께 전달됩니다.",
      items: [
        { code: "general", n: "01", name: "일반 문의", lead: "BABYLOG에 대한 일반 문의." },
        { code: "app", n: "02", name: "앱·제품 지원", lead: "앱 기능·이용·오류·계정 문의." },
        { code: "pregnancy", n: "03", name: "임신·출산·육아", lead: "임신·출산·육아 서비스 관련 제안." },
        { code: "health", n: "04", name: "건강·성장", lead: "아동 건강·성장 정보 관련 협력. 개별 건강 상담은 의료기관을 이용해 주세요." },
        { code: "family", n: "05", name: "가족·커뮤니티", lead: "가족 서비스·커뮤니티 제안." },
        { code: "commerce", n: "06", name: "육아 커머스", lead: "육아 브랜드·상품·커머스 입점 문의." },
        { code: "services", n: "07", name: "육아 서비스", lead: "산후조리·돌봄·육아 서비스 협력. 제공자의 자격 확인이 전제입니다." },
        { code: "education", n: "08", name: "교육·보육기관", lead: "어린이집·유치원·교육기관 협력." },
      ],
      go: "이 유형으로 문의하기 →",
    },
    guide: {
      kicker: "02 · Contact Information",
      title: "문의 전에 알아 두세요.",
      items: [
        { n: "01", name: "공식 문의 양식", body: "문의는 NEWON 공식 문의 양식으로 이어지며, 일반·사업 문의는 newon@newon.app으로도 보낼 수 있습니다. BABYLOG 웹페이지에서 별도로 개인정보를 받지 않습니다." },
        { n: "02", name: "BABYLOG와 NEWON", body: "BABYLOG는 NEWON의 핵심 플랫폼입니다. 앱 이용 문의도 같은 양식으로 접수합니다." },
        { n: "03", name: "답변 안내", body: "검토 후 안내드립니다. 문의가 협력이나 계약을 보장하지는 않습니다." },
      ],
    },
    closeKicker: "BABYLOG",
    closeTitleHtml: "가족의 더 나은 내일을<br />함께 만들어갑니다.",
    closeLead: "BABYLOG는 부모와 아이, 기업과 기관이 함께 만들어갈 새로운 가능성을 기다립니다.",
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
    toBusiness: "Explore business areas",
    toPlatform: "Explore the platform",
    toPartnerships: "Partnership inquiry",
    inquiryCta: "Business & institution inquiry",
    infoOnly:
      "This website only introduces the BABYLOG brand, services, business and partnerships and links to inquiries. Actual recording, management, trading and booking are meant to be provided in the BABYLOG app; sign-in, parenting records, payment, trading, booking and education management are not available on the web.",
    noOutsourcing:
      "NEWON does not do custom web or app development, contract design or operations outsourcing for individual clients. We focus on standardized in-house SaaS, platforms, licenses and automation products.",
    noPrice:
      "Confirmed prices and fees are published only after they are actually launched and approved. Revenue structures on this page are business directions under review, not prices.",
    noPartner:
      "This page is a call for partners. It does not mean a partnership or contract with any specific company or institution has been confirmed, and institutions without a contract are never shown as actual partners.",
    privacyNote: "Inquiries are sent through the official NEWON inquiry form. Personal data is handled under the Privacy Policy.",
    privacyLink: "Privacy Policy",
    sectionLabel: "Section",
    back: "← Back to BABYLOG overview",
  },
  seo: {
    overview: {
      title: "BABYLOG | NEWON — Every moment of growing up together, in one place",
      desc: "From the moment you plan a pregnancy through every stage of a child's growth, BABYLOG aims to be an integrated parenting and family platform connecting parents, children, families and care institutions.",
    },
    platform: {
      title: "Platform | BABYLOG — From pregnancy to parenting, growth and family life",
      desc: "The BABYLOG platform: 21 services across pregnancy and birth, baby care and growth, family and community, parenting lifestyle, and public information and safety, separated from what the app offers today.",
    },
    business: {
      title: "Business | BABYLOG — From everyday family life to the future of the parenting industry",
      desc: "BABYLOG's six business models and 32 business lines in eight categories, with target customers, value, operating conditions and current status.",
    },
    partnerships: {
      title: "Partnerships | BABYLOG — Building a better future for parenting and families, together",
      desc: "The partner types and 15 partnership categories BABYLOG is looking for, and how we work together. A call for partners, not a confirmed partnership.",
    },
    contact: {
      title: "Contact | BABYLOG — Tell us about new possibilities",
      desc: "Reach BABYLOG about general questions, app support, pregnancy and parenting, commerce, education and childcare, institution SaaS, companies, the public sector, technology, global business and media through the official NEWON inquiry form.",
    },
  },

  overview: {
    hero: {
      titleHtml: "Every moment of growing up together,<br />in one place.",
      lead: "From the moment you plan a pregnancy through a child's birth and every stage of growth. BABYLOG is building an integrated parenting and family platform that connects parents and children, families and care institutions.",
      ctaMain: "Explore the platform",
      ctaSub: "Partnership inquiry",
    },
    vision: {
      kicker: "02 · About BABYLOG",
      title: "An experience where every moment\nof parenting connects.",
      lines: [
        "Raising a child takes countless records, choices, information and preparation. From week-by-week pregnancy information to birth preparation, feeding and sleep, growth and health, education and care, and the family's schedule, the things parents manage never stop.",
        "BABYLOG aims to connect these experiences on one platform. So that parents can spend more meaningful time with their children, it aims for a digital ecosystem that brings together the records, information, everyday services and institution links a family needs.",
        "A parenting log app is available today; the direction beyond it is being reviewed step by step.",
      ],
    },
    journey: {
      kicker: "03 · The Parenting Journey",
      title: "From planning a pregnancy\nto growth and education.",
      lead: "A child's growth brings different needs and changes. BABYLOG aims to be a platform that connects the experiences a family needs at each stage: pregnancy and birth, early childhood and childhood.",
      note: "Stage topics are the direction BABYLOG is looking at. Not every item is offered in the app today, and every family is different.",
      items: [
        { id: "s1", n: "01", age: "Pregnancy Planning", name: "The first step toward a new family", lead: "Looking at healthy habits, checkup preparation and the information you need as you start preparing for a new family.", topics: ["Pregnancy planning checklist", "Healthy habits", "Checkup preparation", "Specialist institutions"] },
        { id: "s2", n: "02", age: "Pregnancy", name: "Changes and key dates during pregnancy, together", lead: "Following week-by-week changes and prenatal test schedules while the family prepares for birth together.", topics: ["Pregnancy week information", "Prenatal test schedule", "Pregnancy records", "Birth essentials"] },
        { id: "s3", n: "03", age: "Birth & Recovery", name: "Every step of birth and postpartum recovery", lead: "Welcoming the baby and preparing for the parents' recovery and a new daily life.", topics: ["Birth records", "Postpartum recovery", "Postpartum care information", "Postpartum support programs"] },
        { id: "s4", n: "04", age: "Newborn Care", name: "A newborn's day: feeding, sleep, diapers", lead: "When feeding, sleep and diaper moments repeat every day and add up to records.", topics: ["Feeding records", "Sleep records", "Diaper records", "Daily summary"] },
        { id: "s5", n: "05", age: "Infant Growth", name: "A time to record growth, health and development", lead: "Following height and weight, vaccinations, baby food and developmental changes over time.", topics: ["Height · weight", "Vaccinations", "Baby food", "Development information"] },
        { id: "s6", n: "06", age: "Toddler, Child & Family", name: "Widening through play, learning and family life", lead: "When play, reading and daycare or kindergarten life widen a child's world, and parents, guardians and care institutions look after a child's growth together.", topics: ["Play by age", "Daycare · kindergarten", "Shared parenting", "Guardian–institution communication"] },
      ],
    },
    connect: {
      kicker: "04 · Our Mission",
      title: "Less burden on parents,\nmore precious time with children.",
      lead: "BABYLOG aims to go beyond simple records to a service that helps the everyday life of parents and families.",
      items: [
        { n: "01", name: "Structured growth records", lead: "An experience of recording a child's growth systematically, gathering daily life, growth and health history in order." },
        { n: "02", name: "Family-centered care", lead: "Family-centered management where parents and guardians take part together, viewing and continuing the same records." },
        { n: "03", name: "Information and links by stage", lead: "Information and services matched to each growth stage, and a platform that connects the parenting industry and specialist institutions." },
        { n: "04", name: "Information for safe growth", lead: "Easy access to official information so every child can grow up safe and healthy." },
      ],
    },
    ecosystem: {
      kicker: "05 · Beyond Parenting",
      title: "Beyond parenting records,\ntoward a bigger connection for families.",
      lead: "BABYLOG aims to grow into a platform ecosystem that connects family users with parenting brands, education and care institutions, companies and public bodies. Starting from everyday family life, it aims to create wider value, from the operations and services of the parenting industry to child welfare and safety.",
      items: [
        { n: "01", name: "Families", lead: "Parents, guardians and families raising children. The central users who record, share and look for information." },
        { n: "02", name: "Parenting Brands", lead: "Brands and sellers of baby goods, baby food and family lifestyle products, bringing families the goods and information they need." },
        { n: "03", name: "Education & Care", lead: "Daycare centers, kindergartens, care institutions and education experts: partners for guardian communication and institution operations." },
        { n: "04", name: "Companies & Public", lead: "Companies running employee family benefits, and government, local governments and public bodies: partners for family benefits and public parenting support information." },
      ],
    },
    opportunities: {
      kicker: "06 · Business Opportunities",
      title: "From B2C to global: six business models.",
      lead: "From B2C for parents and families to B2B for education and care institutions and for brands and companies, B2G, platform commerce and global. The target and direction of each model are on the Business page.",
      note: "All business models are at a pre-launch review stage. Confirmed prices and fees are not published.",
    },
    newon: {
      kicker: "07 · NEWON Connection",
      title: "Built the NEWON way,\nwith standard products.",
      lead: "BABYLOG is a core NEWON platform and is introduced under the same principles as the other platforms NEWON runs.",
      items: [
        { n: "01", name: "In-house products first", body: "Standardized in-house SaaS, platforms, licenses and automation products — not per-client outsourcing." },
        { n: "02", name: "Roles divided with SHAREON", body: "Sharing and renting baby goods and person-to-person trading are being considered in connection with SHAREON, with roles kept separate. The principle is to design it so a single transaction is not charged fees twice. This is not a confirmed policy." },
        { n: "03", name: "Roles divided with LIVON and ONGIL", body: "Guidance on life-stage systems such as childbirth support and parental leave is divided with LIVON, and links to life stages after childhood are considered only as a long-term direction." },
        { n: "04", name: "Roles of the web and the app", body: "The website introduces the brand, services, business and partnerships and routes inquiries; actual recording and management are used in the app." },
      ],
    },
    next: {
      kicker: "08 · Next Step",
      titleHtml: "A new everyday life for children and families,<br />with BABYLOG.",
      lead: "Learn more about the BABYLOG platform, business and cooperation with companies and institutions.",
    },
  },

  platform: {
    hero: {
      titleHtml: "From pregnancy to parenting,<br />growth and family life.",
      lead: "Connecting the records, information, schedules, community and services a child and family need into one experience. Whether each service is actually offered is shown according to its development status.",
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
          { name: "Pregnancy & birth", lead: "App guidance for expecting parents who start recording during pregnancy, with weekly changes and checkup schedules managed together.", status: "released" },
          { name: "Child profile", lead: "Manage growth stage, health information and basic schedule for each child.", status: "released" },
          { name: "Extending beyond early childhood", lead: "Gradually widening the records and management a child needs into play, education and family-life stages.", status: "direction" },
        ],
      },
      {
        id: "records",
        kicker: "03 · Parenting & Records",
        title: "Feeding, sleep, meals, growth —\nrecords every day.",
        lead: "Repeated parenting moments are logged with ease, and small daily records add up to a child's growth story.",
        items: [
          { name: "Feeding, sleep, diaper, meal and play records", lead: "Easily log everyday moments and check them in a daily summary.", status: "released" },
          { name: "Growth & health records", lead: "Keep height, weight, vaccinations and health history in one timeline.", status: "released" },
          { name: "Growth statistics", lead: "See growth trends and daily patterns in charts.", status: "released" },
        ],
      },
      {
        id: "family",
        kicker: "04 · Family Connection",
        title: "Family sees and manages\ntogether.",
        lead: "Parenting is not done alone; it is something a family does together. Guardians and family check and continue the same records.",
        items: [
          { name: "Shared family management", lead: "Parents and guardians look at the same child's records and schedules together.", status: "released" },
          { name: "Direction for guardian permissions", lead: "Considering permissions for each guardian and ways to widen what a growing child manages on their own. No permission structure has been decided.", status: "direction" },
        ],
      },
      {
        id: "learning",
        kicker: "05 · Learning & Education",
        title: "Play, learning,\nand links to education.",
        lead: "Schedules are in the app; play and learning content and links to education institutions are direction.",
        items: [
          { name: "Hospital and education schedules", lead: "Gather hospital visits, vaccinations, daycare, kindergarten and education schedules and family plans.", status: "released" },
          { name: "Play, reading and learning information", lead: "A direction for families to explore activity information matched to each stage, such as play by age, reading and sensory activities.", status: "direction" },
          { name: "Education content and institutions", lead: "Considering ways to connect education content with programs of institutions such as daycare centers and kindergartens.", status: "review" },
        ],
      },
      {
        id: "memories",
        kicker: "06 · Memories & Milestones",
        title: "Keeping passing time\nas memories.",
        lead: "A direction that lets families look back together on the fast-changing early years.",
        items: [
          { name: "Photos, diary and growth memories", lead: "A direction for gathering photos, diary entries and month-by-month growth records into one archive. Not presented as a released app feature.", status: "direction" },
          { name: "Growth albums and reports", lead: "Considering a product that turns growth records into albums and reports.", status: "review" },
        ],
      },
      {
        id: "assist",
        kicker: "07 · Smart Assistance",
        title: "Reference-only help\nto organize records.",
        lead: "AI is a reference tool that organizes and presents records.",
        items: [
          { name: "AI record summary and general information", lead: "Organizes record patterns for reference and provides general information suited to age and situation. It does not replace medical diagnosis or professional advice.", status: "released" },
        ],
      },
      {
        id: "explore",
        kicker: "08 · Explore & Discover",
        title: "A direction for exploring\nproducts and services.",
        lead: "Considering an experience for finding products and services families need. Purchase, booking and trading are not offered on this website.",
        items: [
          { name: "Explore products and services", lead: "Considering a way to explore baby goods, education products and family service information such as postpartum care and childcare.", status: "review" },
          { name: "Direction with SHAREON sharing and rental", lead: "Sharing and renting baby goods and person-to-person trading are being considered in connection with SHAREON, with roles kept separate. There is no trading on this website, and the principle is to design it so one transaction is not charged fees twice. Not a confirmed policy.", status: "review" },
        ],
      },
      {
        id: "trust",
        kicker: "09 · Our Commitment",
        title: "A child's safety and a family's trust\ncome first.",
        lead: "These are the standards BABYLOG aims for. As a service that handles children's and families' records, they come first.",
        items: [
          { name: "Protecting children's and families' personal data", lead: "We treat children's and families' personal data with care. How it is handled is described in the Privacy Policy.", status: "released" },
          { name: "Trustworthy parenting and health information", lead: "AI-organized content is for reference and does not replace medical, legal or educational professionals.", status: "released" },
          { name: "Data management that respects guardian permissions", lead: "The principle is that the family decides how far records are shared.", status: "direction" },
          { name: "An accessible service", lead: "Used through the iOS and Android apps; accessibility is a direction we keep improving.", status: "direction" },
          { name: "Responsible child safety and protection information", lead: "We guide official information and reporting channels, and do not accept reports or identify a child's location or identity.", status: "plan" },
          { name: "Public-interest access to information", lead: "A direction to let vulnerable children and families reach official systems and institution information free of charge.", status: "plan" },
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
    closeKicker: "Platform",
    closeTitleHtml: "Starting from family life,<br />toward a child's future.",
    closeLead: "BABYLOG is building a platform that connects the experiences a family needs as a child grows and the family changes.",
  },

  business: {
    hero: {
      titleHtml: "From everyday family life<br />to the future of the parenting industry.",
      lead: "Starting from digital services for pregnancy, birth, parenting and child growth, BABYLOG aims for a platform ecosystem that extends to commerce, education and care institutions, business solutions, public welfare and child protection.",
      ctaMain: "See business areas",
      ctaSub: "Explore partnerships",
    },
    intro: {
      kicker: "01 · Business Models",
      title: "A business structure that grows\nfrom individuals to companies and the public sector.",
      lead: "BABYLOG is considering a range of revenue models: individual premium subscriptions, parenting commerce, connections to qualified services, institution SaaS, corporate family-benefit solutions, brand advertising, public-sector contracts and global licensing. “Revenue model” below is a structure type under review, not a price.",
    },
    fields: {
      overview: "Overview",
      customers: "Target",
      problem: "Problem we address",
      value: "Main direction",
      revenue: "Revenue model",
      partners: "Partners",
      status: "Current status",
      cta: "Related partnership",
    },
    categories: [
      {
        id: "a", code: "A", en: "B2C", name: "Services for parents & families",
        items: ["Free and premium app", "Parenting information", "Everyday service information", "Family sharing"],
        overview: "A consumer service area where parents and families record a child's day and find the information they need in the BABYLOG app.",
        customers: "Parents, families and guardians",
        problem: "The records, information and schedules parenting needs are scattered, which makes managing them heavy.",
        value: "A free and premium app with information and everyday services, connecting records, information and schedules into one experience. The parenting log app is available in the stores today.",
        revenue: "An individual premium subscription structure is under review. No confirmed prices.",
        partners: "Education content creators and experts",
        status: "review", partnerType: "creator",
      },
      {
        id: "b", code: "B", en: "B2B · Institutions", name: "Education & care institution solutions",
        items: ["Institution SaaS", "Attendance and schedules", "Institution–guardian communication", "Operations automation"],
        overview: "Standardized operations SaaS for daycare centers, kindergartens and care institutions.",
        customers: "Daycare centers, kindergartens, care institutions, care service providers",
        problem: "Attendance, schedules, guardian communication and operations are scattered, making institution operations heavy.",
        value: "A direction that reduces operating burden with standardized in-house SaaS and automation products, not custom development.",
        revenue: "Institution SaaS subscriptions and institutional contracts are under review. No confirmed prices.",
        partners: "Childcare and education institutions, qualified care service providers",
        status: "review", partnerType: "institution",
      },
      {
        id: "c", code: "C", en: "B2B · Brands & Companies", name: "Brand & corporate solutions",
        items: ["Brand solutions", "Corporate family-benefit solutions", "Brand advertising and campaigns", "Commerce links"],
        overview: "Brand solutions, corporate family-benefit solutions and commerce for parenting brands and companies.",
        customers: "Parenting brands and sellers, companies running employee family benefits",
        problem: "Brands find it hard to reach families at the right time, and companies find it hard to run family support for employees in one place.",
        value: "A direction to provide product information, listing and campaign support and corporate family-benefit products as standardized in-house products.",
        revenue: "Corporate family-benefit solutions and brand advertising and campaign contracts are under review. No confirmed prices.",
        partners: "Parenting brands, corporate benefits managers",
        status: "review", partnerType: "corporate",
      },
      {
        id: "d", code: "D", en: "B2G", name: "Public bodies & local governments",
        items: ["Public parenting support information", "Child welfare information", "Local parenting programs", "Official application channels"],
        overview: "An area for considering public parenting support information and child welfare solutions together with public bodies and local governments.",
        customers: "Government agencies, local governments, public parenting support bodies",
        problem: "It is hard for families to find the support programs and official application channels they need in one place.",
        value: "A direction to guide official programs and application channels accurately. Public-interest information on child protection, missing children, abuse prevention, adoption and foster care is kept separate from commercial transactions, and vulnerable children's information or need for protection is never monetized.",
        revenue: "Public-sector contract structures are under review. Public procurement and contracting procedures are followed and nothing is confirmed.",
        partners: "Government agencies, local governments, public parenting support bodies",
        status: "direction", partnerType: "institution",
      },
      {
        id: "e", code: "E", en: "Platform Commerce", name: "Platform commerce",
        items: ["Baby goods commerce", "Curated sales and group buying", "Qualified service connections", "Sharing and rental (with SHAREON)"],
        overview: "An area that connects families with the goods and services of parenting brands, sellers and qualified service providers.",
        customers: "Parenting and family brands, sellers, families looking for goods and services",
        problem: "It is hard to find trustworthy goods and services at the right time.",
        value: "Connecting goods and services under lawful transaction structures is under review. Sharing and rental transactions are meant to link to SHAREON with roles kept separate.",
        revenue: "Lawful transaction-linked and brand-campaign contract structures are under review. The principle is to avoid duplicate fees on one transaction; no confirmed prices.",
        partners: "Parenting and family brands, sellers, family service providers, SHAREON",
        status: "review", partnerType: "brand",
      },
      {
        id: "f", code: "F", en: "Global", name: "Global",
        items: ["Multilingual platform", "SaaS licensing for institutions", "Localization", "Overseas distribution"],
        overview: "A long-term area for a multilingual platform and SaaS licensing fitted to each country's language, parenting environment and systems.",
        customers: "Families abroad, overseas companies and institutions, strategic partners",
        problem: "Good family services and technology cannot reach families across differences in language and systems.",
        value: "Look for ways to reach families in other markets through localization and licensing.",
        revenue: "Multilingual platform and SaaS licensing contract structures are under review, negotiated per contract.",
        partners: "Global and strategic partners, overseas institutions",
        status: "direction", partnerType: "global",
      },
    ],
    closeKicker: "Partnership",
    closeTitleHtml: "Starting from everyday parenting,<br />toward a platform that connects families and industry.",
    closeLead: "BABYLOG develops the services parents and children need and builds an ecosystem in which parenting companies and institutions can take part.",
  },

  partnerships: {
    hero: {
      titleHtml: "Building a better future for parenting<br />and families, together.",
      lead: "Through cooperation with parenting brands, education and care institutions, specialist institutions, companies, public bodies and technology partners, BABYLOG aims to create new experiences for families and children.",
      ctaMain: "See partner types",
      ctaSub: "Business & institution inquiry",
    },
    process: {
      kicker: "01 · Process",
      title: "From proposal to delivery,\nfive steps.",
      lead: "Cooperation is reviewed in this order. An inquiry does not promise an outcome at any step, and whether a contract or partnership actually exists is shown transparently.",
      steps: [
        { n: "01", name: "Proposal", body: "Send what you would like to work on through the inquiry form." },
        { n: "02", name: "Review", body: "We look at fit with BABYLOG's direction and at the partner's eligibility and service reliability." },
        { n: "03", name: "Discussion", body: "We discuss scope, terms, timing and personal data protection standards together." },
        { n: "04", name: "Contract", body: "Agreed terms are put into a contract." },
        { n: "05", name: "Delivery", body: "Cooperation proceeds within the contracted scope, and a partner is made public only once confirmed." },
      ],
    },
    types: {
      kicker: "02 · Why Partner With BABYLOG",
      title: "Connecting new business opportunities\non a family-centered platform.",
      lead: "BABYLOG aims to be a platform that understands everyday family life and the parenting industry. Depending on the field, we look together at possibilities such as connecting brands with consumers, more efficient institution operations, family-benefit services, access to public information, and technology and global cooperation. The eight types below are for introduction only; choosing one does not create an account or a contract.",
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
        { code: "brand", n: "01", name: "Parenting & family brands", who: "Brands that make or sell baby goods, baby food, children's clothing and household goods", areas: "Product information, platform listing, curated sales, brand campaigns and group buying, overseas distribution", revenue: "Transaction-linked or campaign contract structures are under review. Nothing is confirmed.", terms: "We check product safety and labeling standards, brand credibility and standards for advertising to families and children." },
        { code: "seller", n: "02", name: "Parenting commerce sellers", who: "Parenting commerce sellers, distributors, and individuals who want to reuse or share baby goods", areas: "Product introduction, sharing, rental and person-to-person trading (direction with SHAREON)", revenue: "Transaction structures are under review. The principle is to avoid duplicate fees on one transaction; nothing is confirmed.", terms: "Eligible items, trading safety rules and seller verification are undecided. Seller accounts cannot be created on this website." },
        { code: "creator", n: "03", name: "Content creators", who: "Creators of parenting, play, learning and family content", areas: "Play, reading and education content by age, joint planning", revenue: "Content pass or sales-linked structures are under review. Nothing is confirmed.", terms: "We check copyright and scope of use, age suitability, content quality and standards for using children's photos and information." },
        { code: "expert", n: "04", name: "Parenting & development experts", who: "Experts in child development, parent education, parenting and education, and specialist education institutions", areas: "Parent education, development information, postpartum emotional health and parenting stress information, education programs", revenue: "Content-sales-linked or contract structures are under review. Nothing is confirmed.", terms: "We review how fields and qualifications are verified, and standards so content is not mistaken for medical or legal advice." },
        { code: "service", n: "05", name: "Parenting & care service providers", who: "Qualified providers of postpartum care, postpartum helpers, childcare and family experiences", areas: "Service information, a direction for connecting qualified services under review, joint programs", revenue: "Service connection structures are under review. Nothing is confirmed.", terms: "We check business verification, safety and qualification requirements, and standards for services aimed at children. Booking is not offered on this website." },
        { code: "corporate", n: "06", name: "Companies & benefits managers", who: "Managers at companies that run employee family benefits and parent support programs", areas: "Corporate family-benefit solutions, parent support information, use of automation products", revenue: "Pass or subscription contract structures are under review. Nothing is confirmed.", terms: "We discuss how it connects to benefit programs, the scope of personal data handling and how eligibility is checked." },
        { code: "institution", n: "07", name: "Education, care & public institutions", who: "Daycare centers, kindergartens and care institutions, government agencies and local governments", areas: "Institution SaaS, institution–guardian communication, public parenting support information, program cooperation", revenue: "Standard-product use or institutional contract structures are under review. Nothing is confirmed.", terms: "We check public procurement and contracting procedures, child-data protection standards and security requirements." },
        { code: "global", n: "08", name: "Global & technology partners", who: "Overseas parenting and family service providers and institutions, and technology partners in security, data protection, accessibility and automation", areas: "Multilingual platform, SaaS licensing, localization, technology cooperation", revenue: "Licensing or joint-development contract structures are under review. Negotiated per contract.", terms: "We review local law, child and personal-data protection standards, language and cultural fit, and the scope of brand use." },
      ],
      cta: "Inquire as this type",
    },
    closeKicker: "Partnership",
    closeTitleHtml: "Looking for partners<br />to build with BABYLOG.",
    closeLead: "Propose new possibilities for cooperation in parenting, family, education, care, public welfare and technology.",
  },

  contact: {
    hero: {
      titleHtml: "Tell us about new possibilities<br />with BABYLOG.",
      lead: "From questions about using the service to listing parenting brands, business solutions, cooperation with education and care institutions, the public sector and global business, we welcome all kinds of proposals.",
      ctaMain: "See contact categories",
      ctaSub: "See partnerships",
    },
    list: {
      kicker: "01 · Contact Categories",
      title: "What would you like\nto talk about?",
      lead: "Choose the closest of the seventeen contact categories. The type you choose is passed along with the official NEWON inquiry form.",
      items: [
        { code: "general", n: "01", name: "General inquiry", lead: "General questions about BABYLOG." },
        { code: "app", n: "02", name: "App & product support", lead: "Questions about app features, use, errors and accounts." },
        { code: "pregnancy", n: "03", name: "Pregnancy & parenting", lead: "Proposals about pregnancy, birth and parenting services." },
        { code: "health", n: "04", name: "Health & growth", lead: "Cooperation on child health and growth information. For individual health questions, please see a medical institution." },
        { code: "family", n: "05", name: "Family & community", lead: "Proposals about family services and community." },
        { code: "commerce", n: "06", name: "Parenting commerce", lead: "Listing parenting brands, products and commerce." },
        { code: "services", n: "07", name: "Parenting services", lead: "Cooperation on postpartum care, childcare and parenting services. Verifying provider qualifications is a precondition." },
        { code: "education", n: "08", name: "Education & childcare", lead: "Cooperation with daycare centers, kindergartens and education institutions." },
      ],
      go: "Inquire as this type →",
    },
    guide: {
      kicker: "02 · Contact Information",
      title: "Before you get in touch.",
      items: [
        { n: "01", name: "Official inquiry form", body: "Inquiries go to the official NEWON inquiry form; general and business inquiries can also be sent to newon@newon.app. This BABYLOG page does not collect personal data itself." },
        { n: "02", name: "BABYLOG and NEWON", body: "BABYLOG is a core NEWON platform. Questions about using the app are received through the same form." },
        { n: "03", name: "Replies", body: "We reply after review. An inquiry does not guarantee cooperation or a contract." },
      ],
    },
    closeKicker: "BABYLOG",
    closeTitleHtml: "Building a better tomorrow<br />for families, together.",
    closeLead: "BABYLOG looks forward to the new possibilities parents and children, companies and institutions will create together.",
  },
};

const MERGED = {};
/** ko and en have copy; every other locale falls back to the English draft (P7 translation policy).
 *  The expansion copy (24 groups + child safety) is merged over the base copy. */
export function getBabylogCopy(lang) {
  const key = lang === "ko" ? "ko" : "en";
  if (!MERGED[key]) {
    const base = key === "ko" ? KO : EN;
    const x = getExpansionCopy(key);
    MERGED[key] = {
      ...base,
      status: { ...base.status, ...x.status },
      ui: { ...base.ui, ...x.ui },
      seo: Object.fromEntries(Object.entries(base.seo).map(([k, v]) => [k, { ...v, ...(x.seo[k] || {}) }])),
      x,
    };
  }
  return MERGED[key];
}

export function copyLangFor(lang) {
  return lang === "ko" ? "ko" : "en";
}
