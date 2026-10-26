/**
 * BABYLOG corporate website copy (information only).
 *
 * Scope: business introduction, partnership and inquiry content. No app features, records, login,
 * payment, trading, booking or education management live on the web.
 *
 * Translation state (see i18n-candidates/babylog-site-status.v1.json):
 *   ko — the owner's specification wording (V2 brief 2026-10-19 applied), verbatim where the specification gave wording; connecting text drafted
 *        by Claude and NOT yet reviewed by the owner.
 *   en — draft translation of ko, NOT reviewed.
 *   ja es pt-br fr de hi id — no approved translation: render the English draft (lang="en") until
 *        i18n-approved/ entries exist (P7 translation policy).
 *
 * Public / private revenue rule: this file contains NO price, fee rate or internal revenue hypothesis.
 * qa-babylog-site.mjs fails the check if one appears in the rendered pages.
 */

import { getExpansionCopy } from "./babylog-expansion-copy.mjs";
import { getContent30 } from "./babylog-content30.mjs";
import { getContentV3 } from "./babylog-content-v3.mjs";

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
export const CONTACT_CODES = ["general", "app", "pregnancy", "growth", "health", "family", "commerce", "brand"];
export const BIZ_CODES = ["a", "b", "c", "d", "e", "f"];

/** Status vocabulary (internal data only). `released` = described on the existing store-verified BabyLog page; everything else is not released.
 *  V2 (2026-10-19): these labels are no longer rendered on each card; the page shows one shared `ui.scope` notice instead,
 *  and current features are written in the present tense ("앱에서 …") while future areas are written as direction/vision. */
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
    toPartnershipsLearn: "파트너십 알아보기",
    inquiryCta: "기업·기관 문의하기",
    scope:
      "BABYLOG는 현재 제공하는 육아·가족 서비스를 기반으로 다양한 생활·교육·돌봄·기업·공공 분야로 확장하고 있습니다. 일부 소개된 사업과 기능은 향후 개발 또는 협력 방향에 포함됩니다.",
    infoOnly:
      "이 웹사이트는 BABYLOG 소개와 문의 연결을 제공합니다. 육아 기록과 계정 관리는 BABYLOG 앱에서 이용하며, 웹에서는 로그인·결제·거래·예약을 제공하지 않습니다.",
    noOutsourcing:
      "NEWON은 고객별 외주 개발이나 운영 대행이 아닌, 표준화된 자체 SaaS·플랫폼·라이선스·자동화 제품을 중심으로 사업을 운영합니다.",
    noPrice:
      "아래 수익 모델은 사업 구조의 유형이며 가격이 아닙니다. 요금과 수수료는 실제 출시·승인 후에 공개합니다.",
    noPartner:
      "이 페이지는 협력 파트너를 찾는 안내입니다. 계약이 확인된 기업·기관만 파트너로 표시합니다.",
    privacyNote: "문의 내용은 NEWON 공식 문의 양식으로 전달되며, 개인정보는 개인정보처리방침에 따라 처리됩니다.",
    privacyLink: "개인정보처리방침",
    sectionLabel: "섹션",
    back: "← BABYLOG 소개로",
  },
  seo: {
    overview: {
      title: "BABYLOG | NEWON — 아이와 함께 자라는 모든 순간을, 하나로",
      desc: "BABYLOG는 임신 준비부터 출산, 육아, 성장 기록과 가족생활까지 아이와 가족의 일상을 연결하는 NEWON의 패밀리 라이프 플랫폼입니다.",
    },
    platform: {
      title: "플랫폼 | BABYLOG — 임신 준비부터 아이의 성장까지",
      desc: "BABYLOG 플랫폼의 21개 서비스 영역. 임신·출산, 육아·성장, 가족·커뮤니티, 육아 생활, 공공정보·아동 안전으로 나누어 앱에서 이용하는 기능과 확장 방향을 소개합니다.",
    },
    business: {
      title: "비즈니스 | BABYLOG — 아이와 가족의 일상에서, 패밀리 라이프 산업의 미래까지",
      desc: "BABYLOG의 6개 사업 모델과 8개 그룹 32개 사업 분야, 수익 기회와 단계별 로드맵을 소개합니다.",
    },
    partnerships: {
      title: "파트너십 | BABYLOG — 아이와 가족의 더 나은 일상을 함께",
      desc: "육아·교육·돌봄·커머스·기업·공공 분야의 BABYLOG 협력 기회와 15개 협력 분야, 협력 절차와 원칙을 안내합니다.",
    },
    contact: {
      title: "문의 | BABYLOG — 새로운 가능성을 이야기해 주세요",
      desc: "서비스 이용 문의부터 육아 브랜드·보육기관·기업·공공기관 협력까지, 17개 문의 분야를 NEWON 공식 문의 양식으로 연결합니다.",
    },
  },

  overview: {
    hero: {
      titleHtml: "아이와 함께 자라는 모든 순간을,<br />하나로.",
      lead: "임신 준비부터 출산, 육아, 성장 기록과 가족생활까지. BABYLOG는 아이와 가족의 소중한 일상을 연결하고, 더 편리하고 따뜻한 육아 경험을 만들어가는 패밀리 라이프 플랫폼입니다.",
      ctaMain: "BABYLOG 알아보기",
      ctaSub: "플랫폼 살펴보기",
    },
    connect: {
      kicker: "03 · Our Mission",
      title: "아이와 가족의\n더 나은 일상을 위해.",
      lead: "BABYLOG가 서비스를 만들고 확장할 때 지키는 여섯 가지 핵심 가치입니다.",
      items: [
        { n: "01", name: "Family", lead: "가족이 함께하는 육아. 부모와 보호자가 같은 기록을 보고 함께 이어갑니다." },
        { n: "02", name: "Growth", lead: "아이의 성장과 변화. 작은 기록이 쌓여 아이의 성장 이야기가 됩니다." },
        { n: "03", name: "Connection", lead: "가족과 정보, 서비스의 연결. 흩어진 기록과 정보를 하나의 경험으로 잇습니다." },
        { n: "04", name: "Care", lead: "아이와 보호자를 위한 배려. 보호자의 부담을 덜고 아이에게 집중할 수 있도록 돕습니다." },
        { n: "05", name: "Trust", lead: "신뢰할 수 있는 정보와 경험. 공식 출처를 우선하고, 아이와 가족의 정보를 신중하게 다룹니다." },
        { n: "06", name: "Accessibility", lead: "누구나 쉽게 이용하는 서비스. 처음 육아를 시작하는 가족도 어렵지 않게 이용할 수 있도록 만듭니다." },
      ],
    },
    ecosystem: {
      kicker: "07 · Beyond Parenting",
      title: "육아의 경험에서,\n가족생활의 생태계로.",
      lead: "BABYLOG는 개인과 가족을 위한 서비스에서 출발해 육아 브랜드, 교육기관, 돌봄기관, 기업과 공공기관을 연결하는 플랫폼으로 확장하고자 합니다.",
      items: [
        { n: "01", name: "Families", lead: "아이를 키우는 부모와 보호자, 가족. 기록하고 나누며 필요한 정보를 찾는 BABYLOG의 중심 이용자입니다." },
        { n: "02", name: "Parenting Brands", lead: "육아용품·유아식품·가족생활 브랜드와 판매자. 가족에게 필요한 상품과 정보를 전하는 협력 영역입니다." },
        { n: "03", name: "Education & Care", lead: "어린이집·유치원과 돌봄기관, 교육 전문가. 보호자 소통과 기관 운영을 함께 개선해 나갈 협력 영역입니다." },
        { n: "04", name: "Companies & Public", lead: "임직원 가족복지를 운영하는 기업과 정부·지자체·공공기관. 가족복지와 공공 육아지원 정보의 협력 영역입니다." },
      ],
    },
    opportunities: {
      kicker: "Business Opportunities",
      title: "B2C부터 글로벌까지,\n여섯 개의 사업 모델.",
      lead: "개인·가족 서비스에서 기관·기업 SaaS, 공공, 커머스, 글로벌까지. 사업 모델과 32개 사업 분야는 비즈니스 페이지에서 자세히 소개합니다.",
    },
    newon: {
      kicker: "NEWON Connection",
      title: "NEWON의 표준 제품 방식으로\n만듭니다.",
      lead: "BABYLOG는 NEWON의 핵심 플랫폼이며, NEWON의 다른 플랫폼과 같은 원칙으로 운영합니다.",
      items: [
        { n: "01", name: "자체 제품 중심", body: "고객별 외주가 아닌 표준화된 자체 SaaS·플랫폼·라이선스·자동화 제품을 중심으로 합니다." },
        { n: "02", name: "SHAREON과의 역할 구분", body: "육아용품 쇼핑·중고·공동구매는 BABYLOG 안에서, 대여는 공유·대여 전문인 SHAREON과 연계하는 것으로 역할을 나눕니다. 하나의 거래에 수수료가 이중으로 부과되지 않도록 설계하는 것을 원칙으로 합니다." },
        { n: "03", name: "LIVON·ONGIL과의 역할 구분", body: "출산 지원금·육아휴직 같은 생활 제도 안내는 LIVON이 맡고, 아이의 성장 이후 생애 단계와의 연결은 장기 방향으로 살펴봅니다." },
        { n: "04", name: "웹과 앱의 역할", body: "웹사이트는 브랜드·서비스·사업·협력 소개와 문의 연결을, 앱은 실제 기록과 관리 기능을 담당합니다." },
      ],
    },
    next: {
      kicker: "09 · Next Step",
      titleHtml: "아이와 가족의 모든 순간이<br />이어지도록.",
      lead: "BABYLOG의 플랫폼과 협력 기회를 더 자세히 알아보세요.",
    },
  },

  platform: {
    hero: {
      titleHtml: "임신 준비부터 아이의 성장까지,<br />가족의 모든 순간을 연결합니다.",
      lead: "BABYLOG는 육아와 가족생활에 필요한 기록, 정보, 소통과 다양한 서비스 영역을 하나의 경험으로 연결하는 플랫폼을 지향합니다.",
      ctaMain: "앱 이용 안내",
      ctaSub: "사업 분야 알아보기",
    },
    sections: [
      {
        id: "growth",
        kicker: "02 · Growth Journey",
        title: "임신·출산부터\n성장의 모든 단계까지.",
        lead: "하나의 아이 프로필에서 시작해 단계마다 필요한 기록과 정보로 이어집니다.",
        items: [
          { name: "임신·출산 관리", lead: "앱에서 임신 시기부터 기록을 시작하고, 임신 주차별 변화와 검진 일정을 함께 관리합니다.", status: "released" },
          { name: "아이 프로필", lead: "앱에서 성장 단계, 건강 정보, 기본 일정을 아이별로 관리합니다.", status: "released" },
          { name: "성장 단계별 확장", lead: "아이가 자라는 동안 필요한 기록과 관리 범위를 놀이·교육·가족생활 단계로 넓혀 나갑니다.", status: "direction" },
        ],
      },
      {
        id: "records",
        kicker: "03 · Parenting & Records",
        title: "수유·수면·식사·성장,\n매일의 기록.",
        lead: "반복되는 육아의 순간을 편리하게 기록하고, 작은 기록이 쌓여 아이의 성장 이야기가 됩니다.",
        items: [
          { name: "수유·수면·배변·식사·놀이 기록", lead: "앱에서 매일 반복되는 순간을 간편하게 남기고 일별 요약으로 확인합니다.", status: "released" },
          { name: "성장·건강 기록", lead: "키, 몸무게, 예방접종과 건강 이력을 시간 순서로 모아 봅니다.", status: "released" },
          { name: "성장 통계", lead: "성장 추이와 생활 패턴을 그래프로 확인합니다.", status: "released" },
        ],
      },
      {
        id: "family",
        kicker: "04 · Family Connection",
        title: "가족이 함께 보고,\n함께 관리합니다.",
        lead: "육아는 가족이 함께하는 일입니다. 보호자와 가족이 같은 기록을 확인하고 이어갑니다.",
        items: [
          { name: "가족 공동 관리", lead: "앱에서 부모와 보호자가 같은 아이의 기록과 일정을 함께 확인합니다.", status: "released" },
          { name: "보호자별 접근권한", lead: "부모·조부모·보호자·청소년의 역할에 따라 볼 수 있는 범위를 나누는 구조를 단계적으로 설계합니다. 원칙은 아래 ‘역할과 권한’에서 확인할 수 있습니다.", status: "direction" },
        ],
      },
      {
        id: "learning",
        kicker: "05 · Learning & Education",
        title: "놀이와 학습,\n그리고 교육 연결.",
        lead: "일정 관리에서 시작해 놀이·학습 정보와 교육기관 연결로 넓혀 갑니다.",
        items: [
          { name: "병원·교육 일정", lead: "앱에서 병원 방문, 예방접종, 어린이집·유치원과 교육 일정, 가족 일정을 모아 봅니다.", status: "released" },
          { name: "놀이·독서·학습 정보", lead: "연령별 놀이와 독서, 감각 활동 등 발달 단계에 맞는 활동 정보를 제공하는 방향을 지향합니다.", status: "direction" },
          { name: "교육 콘텐츠·기관 연결", lead: "교육 콘텐츠와 어린이집·유치원 등 교육기관 프로그램을 연결하는 영역으로 확장해 나갑니다.", status: "review" },
        ],
      },
      {
        id: "memories",
        kicker: "06 · Memories & Milestones",
        title: "지나가는 시간을\n추억으로 남깁니다.",
        lead: "빠르게 크는 시기의 변화를 가족이 함께 되돌아볼 수 있는 경험을 지향합니다.",
        items: [
          { name: "사진·일기·성장 추억", lead: "사진, 일기와 월령별 성장 기록을 하나의 아카이브로 모으는 경험을 만들어 갑니다.", status: "direction" },
          { name: "성장 앨범·리포트", lead: "성장 기록을 앨범과 리포트로 정리하는 경험으로 확장해 나갑니다.", status: "review" },
        ],
      },
      {
        id: "assist",
        kicker: "07 · Smart Assistance",
        title: "기록을 정리하는\n참고용 도움.",
        lead: "AI는 기록을 정리해 보여 주는 참고용 도구입니다.",
        items: [
          { name: "AI 기록 요약 및 일반 정보", lead: "앱에서 기록의 패턴을 참고용으로 정리하고 연령과 상황에 맞는 일반 정보를 안내합니다. 의료 진단이나 전문가의 조언을 대신하지 않습니다.", status: "released" },
        ],
      },
      {
        id: "explore",
        kicker: "08 · Explore & Discover",
        title: "가족에게 필요한\n상품과 서비스로.",
        lead: "가족에게 필요한 상품과 서비스를 더 쉽게 찾는 경험으로 확장해 나갑니다.",
        items: [
          { name: "탐색·예약·마켓", lead: "앱의 탐색 영역 안에서 기관·서비스 정보와 예약, 육아용품 쇼핑·중고·공동구매를 이용하는 구조를 다음 버전에서 준비하고 있습니다. 웹사이트에서는 거래·예약을 제공하지 않습니다.", status: "review" },
          { name: "SHAREON과의 역할 구분", lead: "쇼핑·중고·공동구매는 BABYLOG 마켓 안에서, 육아용품 대여는 공유·대여 전문인 SHAREON과 연계합니다. 결제·정산에 NEWON 공통 거래 인프라를 쓰는 방안은 계획이며 아직 구현되지 않았고, 하나의 거래에 수수료가 이중으로 부과되지 않도록 설계합니다.", status: "review" },
        ],
      },
      {
        id: "trust",
        kicker: "09 · Our Commitment",
        title: "아이의 안전과 가족의 신뢰를\n가장 먼저 생각합니다.",
        lead: "아이와 가족의 기록을 다루는 서비스로서 BABYLOG가 먼저 두는 기준입니다.",
        items: [
          { name: "아동과 가족의 개인정보 보호", lead: "아이와 가족의 개인정보를 신중하게 다루며, 처리 기준은 개인정보처리방침에서 확인할 수 있습니다.", status: "released" },
          { name: "신뢰할 수 있는 육아·건강 정보", lead: "AI가 정리한 내용은 참고용이며 의료·법률·교육 전문가의 판단을 대신하지 않습니다.", status: "released" },
          { name: "보호자 권한을 고려한 데이터 관리", lead: "기록의 공유 범위는 가족이 정하는 것을 원칙으로 합니다.", status: "direction" },
          { name: "접근하기 쉬운 서비스", lead: "iOS와 Android 앱으로 이용하며, 누구나 쉽게 쓸 수 있도록 접근성을 계속 개선합니다.", status: "direction" },
          { name: "아동 안전·보호 정보의 책임 있는 제공", lead: "공식 기관의 정보와 신고 경로를 안내하며, 신고 접수나 아이의 위치·신원 확인은 하지 않습니다.", status: "plan" },
          { name: "공익적 정보 접근성", lead: "도움이 필요한 아동과 가족이 공식 제도와 기관 정보에 무료로 닿을 수 있도록 하는 것을 지향합니다.", status: "plan" },
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
    closeTitleHtml: "가족의 일상을 더 편리하게,<br />아이의 성장을 더 소중하게.",
    closeLead: "BABYLOG가 연결하는 서비스와 사업 분야를 비즈니스 페이지에서 확인해 보세요.",
  },

  business: {
    hero: {
      titleHtml: "아이와 가족의 일상에서,<br />패밀리 라이프 산업의 미래까지.",
      lead: "BABYLOG는 임신·출산·육아·성장 기록을 중심으로 교육, 커머스, 돌봄, 가족생활, 기업 솔루션과 아동복지까지 확장하는 종합 패밀리 라이프 생태계를 지향합니다.",
      ctaMain: "사업 분야 보기",
      ctaSub: "파트너십 알아보기",
    },
    intro: {
      kicker: "01 · Business Models",
      title: "개인에서 기업, 공공기관까지\n확장되는 사업 구조.",
      lead: "수익 기회는 개인 프리미엄 구독, 육아 커머스와 적법한 거래 수익, 보육·교육기관 SaaS, 기업 가족복지 솔루션, 육아 브랜드 캠페인, 적격 서비스 사업자 제휴, 공공기관 사업 계약, 글로벌 SaaS·라이선싱입니다. 아동 보호·신고·공공지원 정보와 후원금은 상업 수익과 분리합니다.",
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
        id: "a", code: "A", en: "B2C", name: "개인·가족 서비스",
        items: ["무료·프리미엄 앱", "육아 정보", "생활 서비스 정보", "가족 공유"],
        overview: "부모와 가족이 BABYLOG 앱으로 아이의 일상을 기록하고 필요한 정보를 찾는 소비자 서비스입니다.",
        customers: "부모·가족, 보호자",
        problem: "육아에 필요한 기록과 정보, 일정이 여러 곳에 흩어져 있어 관리 부담이 큽니다.",
        value: "육아 기록 앱을 현재 App Store와 Google Play에서 제공하며, 정보와 생활 서비스로 경험을 넓혀 갑니다.",
        revenue: "개인 프리미엄 구독",
        partners: "교육 콘텐츠 제작자, 교육 전문가",
        status: "review", partnerType: "creator",
      },
      {
        id: "b", code: "B", en: "Enterprise SaaS", name: "보육·교육기관 SaaS",
        items: ["기관 SaaS", "출결·일정 관리", "기관·보호자 소통", "운영 자동화"],
        overview: "어린이집·유치원과 돌봄기관을 위한 표준화된 운영 SaaS 사업입니다.",
        customers: "어린이집, 유치원, 돌봄기관, 돌봄 서비스 사업자",
        problem: "출결과 일정, 보호자 소통과 운영 업무가 분산되어 있어 기관의 운영 부담이 큽니다.",
        value: "맞춤 개발이 아닌 표준화된 자체 SaaS와 자동화 제품으로 기관의 운영 부담을 줄입니다.",
        revenue: "기관 SaaS 구독, 기관 계약",
        partners: "보육·교육기관, 적격 돌봄 서비스 사업자",
        status: "review", partnerType: "institution",
      },
      {
        id: "c", code: "C", en: "B2B", name: "육아 브랜드·기업 솔루션",
        items: ["브랜드 솔루션", "기업 가족복지 솔루션", "브랜드 캠페인", "커머스 연계"],
        overview: "육아 브랜드와 기업을 위한 브랜드 솔루션과 기업 가족복지 솔루션 사업입니다.",
        customers: "육아 브랜드·판매자, 임직원 가족복지를 운영하는 기업",
        problem: "브랜드는 필요한 시기의 가족과 만나기 어렵고, 기업은 임직원 가족 지원을 한곳에서 운영하기 어렵습니다.",
        value: "상품 정보·입점·캠페인 지원과 기업용 가족복지 제품을 표준화된 자체 제품으로 제공합니다.",
        revenue: "기업 가족복지 솔루션 계약, 브랜드 캠페인 계약",
        partners: "육아 브랜드, 기업·복지 담당자",
        status: "review", partnerType: "corporate",
      },
      {
        id: "d", code: "D", en: "B2G", name: "공공기관·지자체 솔루션",
        items: ["공공 육아지원 정보", "아동복지 정보", "지역 육아 프로그램", "공식 신청 경로 안내"],
        overview: "공공기관·지자체와 함께 공공 육아지원 정보와 아동복지 정보 접근성을 높이는 사업입니다.",
        customers: "정부기관, 지방자치단체, 공공 육아지원 관련 기관",
        problem: "가족에게 필요한 지원 제도와 공식 신청 경로를 한눈에 찾기 어렵습니다.",
        value: "공식 제도와 신청 경로를 정확하게 안내합니다. 아동 보호·실종·학대 예방·입양·위탁 관련 공익 정보는 상업적 거래와 구분하고, 취약한 아동의 정보나 보호 필요성을 수익화하지 않습니다.",
        revenue: "공공기관 사업 계약(공공 조달·계약 절차 준수)",
        partners: "정부기관, 지자체, 공공 육아지원 기관",
        status: "direction", partnerType: "institution",
      },
      {
        id: "e", code: "E", en: "Commerce", name: "육아 상품·서비스 연결",
        items: ["육아용품 커머스", "기획전·공동구매", "적격 서비스 연결", "공유·대여(SHAREON 연계)"],
        overview: "육아 브랜드와 판매자, 적격 서비스 사업자의 상품·서비스를 가족과 연결하는 사업입니다.",
        customers: "육아·가족 브랜드, 판매자, 상품과 서비스를 찾는 가족",
        problem: "필요한 시기에 믿을 수 있는 상품과 서비스를 찾기 어렵습니다.",
        value: "적법한 거래 구조로 상품·서비스를 연결하며, 공유·대여 거래는 SHAREON과 역할을 나누어 연계합니다.",
        revenue: "적법한 거래 수익, 적격 서비스 사업자 제휴, 브랜드 캠페인(같은 거래에 수수료 중복 없음)",
        partners: "육아·가족 브랜드, 판매자, 가족 서비스 사업자, SHAREON",
        status: "review", partnerType: "brand",
      },
      {
        id: "f", code: "F", en: "Global", name: "해외 플랫폼·라이선싱",
        items: ["다국어 플랫폼", "기관용 SaaS 라이선스", "현지화", "해외 유통 협력"],
        overview: "국가별 언어와 육아환경, 제도에 맞춘 다국어 플랫폼과 SaaS 라이선싱 사업입니다.",
        customers: "해외 가족, 해외 기업·기관, 전략적 파트너",
        problem: "좋은 가족 서비스와 기술도 언어와 제도의 차이 때문에 전달되지 못합니다.",
        value: "현지화와 라이선스를 통해 다른 시장의 가족에게 닿는 방법을 만들어 갑니다.",
        revenue: "글로벌 SaaS·라이선싱 계약",
        partners: "글로벌·전략적 파트너, 해외 기관",
        status: "direction", partnerType: "global",
      },
    ],
    closeKicker: "Partnership",
    closeTitleHtml: "가족의 일상에서 시작해,<br />더 넓은 패밀리 라이프 생태계로.",
    closeLead: "관심 있는 사업 분야가 있다면 파트너십을 살펴보거나 기업·기관 문의를 남겨 주세요.",
  },

  partnerships: {
    hero: {
      titleHtml: "아이와 가족의 더 나은 일상을<br />함께 만들어갑니다.",
      lead: "BABYLOG는 육아·교육·돌봄·커머스·기업·공공 분야의 다양한 기업과 기관이 함께 참여할 수 있는 패밀리 라이프 생태계를 지향합니다.",
      ctaMain: "파트너 유형 보기",
      ctaSub: "기업·기관 문의하기",
    },
    process: {
      kicker: "Partnership Process",
      title: "제안에서 진행까지,\n다섯 단계.",
      lead: "협력은 아래 순서로 검토합니다. 문의가 협력 확정이나 계약 체결을 보장하지는 않습니다.",
      steps: [
        { n: "01", name: "제안 접수", body: "협력하고 싶은 내용을 문의 양식으로 보내 주세요." },
        { n: "02", name: "사업 적합성 검토", body: "BABYLOG 방향과의 적합성, 파트너의 적격성과 서비스 신뢰성을 살펴봅니다." },
        { n: "03", name: "협력 범위 협의", body: "협력 범위와 일정, 개인정보 보호 기준을 함께 논의합니다." },
        { n: "04", name: "조건 및 계약 검토", body: "합의된 조건을 검토하고 계약으로 정리합니다." },
        { n: "05", name: "협력 진행", body: "계약 범위 안에서 협력을 진행하며, 확인된 뒤에만 파트너로 공개합니다." },
      ],
    },
    principles: {
      title: "Partnership Principles · 협력 원칙",
      items: ["아동과 가족의 권리 존중", "개인정보 보호", "적격 서비스 제공자 확인", "투명한 거래 조건", "실제 제휴 여부의 정확한 표시", "공익 정보와 상업적 협력의 구분"],
    },
    types: {
      kicker: "Partnership Opportunities",
      title: "가족 중심의 플랫폼에서\n새로운 사업 기회를 연결합니다.",
      lead: "BABYLOG는 여섯 가지 협력 모델을 중심으로 파트너와 함께할 기회를 찾습니다. 아래 여덟 유형에서 가장 가까운 협력 방식을 확인해 주세요.",
      models: ["Family Services · 가족 서비스", "Parenting Commerce · 육아 커머스", "Childcare & Education SaaS · 보육·교육 SaaS", "Corporate Family Benefits · 기업 가족복지", "Public & Social Impact · 공공·사회적 가치", "Global Expansion · 글로벌 확장"],
      railLabel: "파트너 유형 바로가기",
      fields: {
        who: "협력 대상",
        areas: "가능한 협력 분야",
        model: "협력 모델",
        terms: "협력 조건 및 검토 사항",
      },
      items: [
        {
          code: "brand", n: "01", name: "육아·가족 브랜드",
          who: "육아용품, 유아식품, 유아 의류, 생활용품을 만들거나 판매하는 브랜드",
          areas: "상품 정보, 플랫폼 입점, 기획전·브랜드 캠페인·공동구매, 해외 유통 협력",
          model: "Parenting Commerce — 육아 브랜드와 소비자 간 상품·서비스 경험 확대.",
          terms: "상품 안전·표시 기준, 브랜드 신뢰도, 가족·아동 대상 광고 기준을 확인합니다.",
        },
        {
          code: "seller", n: "02", name: "육아 커머스 판매자",
          who: "육아 커머스 판매자, 유통 사업자, 육아용품 재사용·공유를 원하는 개인",
          areas: "상품 소개, 중고·공동구매(BABYLOG 마켓, 다음 버전 준비 중), 육아용품 대여(SHAREON 연계)",
          model: "Parenting Commerce — 같은 거래에 수수료가 중복되지 않는 거래 구조.",
          terms: "판매 가능 품목과 거래 안전 기준, 판매자 확인 방식을 협의합니다. 웹사이트에서 판매자 계정을 만들 수 없습니다.",
        },
        {
          code: "creator", n: "03", name: "콘텐츠 제작자",
          who: "육아·놀이·학습·가족 콘텐츠를 만드는 제작자, 교육 콘텐츠 기업과 출판사",
          areas: "연령별 놀이·독서·교육 콘텐츠 제공, 공동 기획",
          model: "Family Services — 가족과 육아 관련 콘텐츠·서비스 정보 연결.",
          terms: "저작권과 이용 범위, 연령 적합성, 콘텐츠 품질, 아동 사진·정보 사용 기준을 확인합니다.",
        },
        {
          code: "expert", n: "04", name: "육아·발달 전문가",
          who: "아동 발달, 부모 교육, 육아·교육 분야의 전문가와 전문 교육기관",
          areas: "부모 교육, 발달 정보, 산후 정서·양육 스트레스 관련 정보, 교육 프로그램",
          model: "Family Services — 공신력 있는 육아·발달 정보와 교육 연결.",
          terms: "전문 분야와 자격 확인 방식, 콘텐츠가 의료·법률 조언으로 오해되지 않도록 하는 기준을 검토합니다.",
        },
        {
          code: "service", n: "05", name: "육아·돌봄 서비스 사업자",
          who: "산후조리원, 산후도우미, 아이돌봄, 키즈 클래스·키즈카페, 가족 촬영, 가족 체험 서비스를 운영하는 적격 사업자",
          areas: "서비스 정보 소개, 적격 서비스 연결, 공동 프로그램",
          model: "Family Services — 가족과 육아 관련 서비스 정보 및 적격 사업자 연결.",
          terms: "사업자 확인, 안전과 자격 요건, 아이를 대상으로 하는 서비스의 기준을 확인합니다. 웹사이트에서 예약은 제공하지 않습니다.",
        },
        {
          code: "corporate", n: "06", name: "기업·복지 담당자",
          who: "임직원 가족복지와 부모 지원 프로그램을 운영하는 기업의 담당자",
          areas: "기업 가족복지 솔루션, 부모 지원 정보, 자동화 제품 활용",
          model: "Corporate Family Benefits — 기업 임직원의 육아·가족생활 지원 솔루션.",
          terms: "복지 제도 연계 방식, 개인정보 처리 범위, 이용 대상 확인 방식을 협의합니다.",
        },
        {
          code: "institution", n: "07", name: "교육·돌봄·공공기관",
          who: "어린이집·유치원·학원·돌봄기관, 정부기관과 지방자치단체",
          areas: "기관 SaaS, 기관·보호자 소통, 공공 육아지원 정보 안내, 프로그램 협력",
          model: "Childcare & Education SaaS · Public & Social Impact — 기관 운영 효율화와 공공정보 접근성.",
          terms: "공공 조달·계약 절차, 아동 정보 보호 기준, 보안 요건을 확인합니다.",
        },
        {
          code: "global", n: "08", name: "글로벌·기술 파트너",
          who: "해외 육아·가족 서비스 사업자와 기관, 보안·데이터 보호·접근성·자동화 기술 파트너",
          areas: "다국어 플랫폼, SaaS 라이선스, 현지화, 기술 협력",
          model: "Global Expansion — 국가별 육아·가족 서비스 및 글로벌 플랫폼 협력.",
          terms: "현지 법규와 아동·개인정보 보호 기준, 언어·문화 적합성, 브랜드 사용 범위를 검토합니다.",
        },
      ],
      cta: "이 유형으로 문의하기",
    },
    closeKicker: "Partnership",
    closeTitleHtml: "BABYLOG와 함께 새로운 가족생활의<br />가능성을 만들어갑니다.",
    closeLead: "육아·가족·교육·돌봄·공공복지·기술 분야의 협력 제안을 기다립니다.",
  },

  contact: {
    hero: {
      titleHtml: "BABYLOG와 새로운 가능성을<br />이야기해 주세요.",
      lead: "서비스 이용 문의부터 육아 브랜드·보육기관·기업·공공기관 협력까지 다양한 제안을 기다립니다.",
      ctaMain: "문의 분야 보기",
      ctaSub: "파트너십 보기",
    },
    list: {
      kicker: "Contact Categories",
      title: "어떤 이야기를\n나누고 싶으신가요?",
      lead: "열일곱 가지 문의 분야 중 가까운 유형을 선택해 주세요. ‘문의하기’를 누르면 BABYLOG와 문의 유형이 선택된 NEWON 통합 문의 페이지가 열립니다.",
      items: [
        { code: "general", n: "01", name: "일반 문의", lead: "BABYLOG에 대한 일반 문의." },
        { code: "app", n: "02", name: "앱·제품 지원", lead: "앱 기능·이용·오류·계정 문의." },
        { code: "pregnancy", n: "03", name: "임신·출산", lead: "임신·출산 관련 서비스와 협력 제안." },
        { code: "growth", n: "04", name: "육아·성장", lead: "육아 기록·성장 관련 서비스 제안." },
        { code: "health", n: "05", name: "아동 건강·발달", lead: "아동 건강·발달 정보 협력. 개별 건강 상담은 의료기관을 이용해 주세요." },
        { code: "family", n: "06", name: "부모 커뮤니티", lead: "부모·가족 커뮤니티 관련 제안." },
        { code: "commerce", n: "07", name: "육아 커머스", lead: "육아 상품·커머스 입점 문의." },
        { code: "brand", n: "08", name: "육아 브랜드", lead: "육아 브랜드 솔루션·캠페인 협력." },
      ],
      go: "이 유형으로 문의하기 →",
    },
    channels: {
      title: "연락 방법",
      mailK: "이메일 · NEWON",
      mailText: "언론·투자 문의를 포함한 모든 문의를 newon@newon.app으로도 받습니다.",
      formK: "NEWON 통합 문의",
      formText: "BABYLOG가 선택된 NEWON 통합 문의 페이지가 열립니다. 앱 이용 문의도 같은 페이지에서 접수합니다.",
    },
    guide: {
      kicker: "Contact Information",
      title: "문의 전에 알아 두세요.",
      items: [
        { n: "01", name: "NEWON", body: "문의는 NEWON 통합 문의 페이지로 이어지며, newon@newon.app으로도 보낼 수 있습니다. BABYLOG 웹페이지에서는 개인정보를 따로 받지 않습니다." },
        { n: "02", name: "BABYLOG와 NEWON", body: "BABYLOG는 NEWON의 핵심 플랫폼입니다. 앱 이용 문의도 같은 문의 페이지로 접수합니다." },
        { n: "03", name: "답변 안내", body: "내용을 검토한 뒤 안내드립니다. 문의가 협력이나 계약을 보장하지는 않습니다." },
      ],
    },
    closeKicker: "BABYLOG",
    closeTitleHtml: "아이와 가족의 모든 순간을<br />함께 연결합니다.",
    closeLead: "BABYLOG와 함께할 새로운 가능성을 기다립니다.",
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
    toPartnershipsLearn: "Explore partnerships",
    inquiryCta: "Business & institution inquiry",
    scope:
      "Building on the parenting and family services it offers today, BABYLOG is expanding into everyday life, education, care, business and public-sector areas. Some of the businesses and features introduced here are part of future development or partnership plans.",
    infoOnly:
      "This website introduces BABYLOG and connects you to inquiries. Parenting records and account management are used in the BABYLOG app; sign-in, payment, trading and booking are not available on the web.",
    noOutsourcing:
      "NEWON does not do per-client outsourcing or operations on behalf of clients. It runs its business around standardized in-house SaaS, platforms, licenses and automation products.",
    noPrice:
      "The revenue models below are types of business structure, not prices. Prices and fees are published only after an actual launch and approval.",
    noPartner:
      "This page is a call for partners. Only companies and institutions with a confirmed contract are shown as partners.",
    privacyNote: "Inquiries are sent through the official NEWON inquiry form, and personal data is handled under the Privacy Policy.",
    privacyLink: "Privacy Policy",
    sectionLabel: "Section",
    back: "← Back to BABYLOG overview",
  },
  seo: {
    overview: {
      title: "BABYLOG | NEWON — Every moment of growing up together, in one place",
      desc: "BABYLOG is NEWON's family life platform, connecting a child's and a family's everyday life from pregnancy planning through birth, parenting, growth records and family life.",
    },
    platform: {
      title: "Platform | BABYLOG — From pregnancy planning to a child's growth",
      desc: "The 21 service areas of the BABYLOG platform across pregnancy and birth, baby care and growth, family and community, parenting lifestyle, and public information and child safety: what the app offers and where it is expanding.",
    },
    business: {
      title: "Business | BABYLOG — From everyday family life to the future of the family life industry",
      desc: "BABYLOG's six business models, 32 business lines in eight groups, revenue opportunities and a staged roadmap.",
    },
    partnerships: {
      title: "Partnerships | BABYLOG — A better everyday life for children and families, together",
      desc: "BABYLOG partnership opportunities across parenting, education, care, commerce, business and the public sector, with 15 partnership categories, the process and our principles.",
    },
    contact: {
      title: "Contact | BABYLOG — Tell us about new possibilities",
      desc: "From questions about the service to partnerships with parenting brands, childcare institutions, companies and public bodies: 17 inquiry categories routed to the official NEWON inquiry form.",
    },
  },

  overview: {
    hero: {
      titleHtml: "Every moment of growing up together,<br />in one place.",
      lead: "From pregnancy planning to birth, parenting, growth records and family life. BABYLOG is a family life platform that connects the precious everyday life of children and families and builds a more convenient, warmer parenting experience.",
      ctaMain: "Discover BABYLOG",
      ctaSub: "Explore the platform",
    },
    connect: {
      kicker: "03 · Our Mission",
      title: "For a better everyday life\nfor children and families.",
      lead: "The six core values BABYLOG keeps as it builds and expands its services.",
      items: [
        { n: "01", name: "Family", lead: "Parenting together as a family. Parents and guardians see the same records and carry them on together." },
        { n: "02", name: "Growth", lead: "A child's growth and change. Small records add up to a child's growth story." },
        { n: "03", name: "Connection", lead: "Connecting families, information and services. Scattered records and information become one experience." },
        { n: "04", name: "Care", lead: "Consideration for children and guardians. Easing the load on guardians so they can focus on the child." },
        { n: "05", name: "Trust", lead: "Trustworthy information and experience. Official sources come first, and children's and families' data is handled with care." },
        { n: "06", name: "Accessibility", lead: "A service anyone can use easily, including families who are just starting out." },
      ],
    },
    ecosystem: {
      kicker: "07 · Beyond Parenting",
      title: "From the parenting experience\nto a family life ecosystem.",
      lead: "Starting from services for individuals and families, BABYLOG aims to expand into a platform that connects parenting brands, education institutions, care institutions, companies and public bodies.",
      items: [
        { n: "01", name: "Families", lead: "Parents, guardians and families raising children: the central users who record, share and look for information." },
        { n: "02", name: "Parenting Brands", lead: "Brands and sellers of baby goods, baby food and family lifestyle products: a partnership area bringing families the goods and information they need." },
        { n: "03", name: "Education & Care", lead: "Daycare centers, kindergartens, care institutions and education experts: a partnership area for improving guardian communication and institution operations together." },
        { n: "04", name: "Companies & Public", lead: "Companies running employee family benefits, and government, local governments and public bodies: a partnership area for family benefits and public parenting support information." },
      ],
    },
    opportunities: {
      kicker: "Business Opportunities",
      title: "From B2C to global:\nsix business models.",
      lead: "From individual and family services to institution and enterprise SaaS, the public sector, commerce and global. The business models and 32 business lines are described on the Business page.",
    },
    newon: {
      kicker: "NEWON Connection",
      title: "Built the NEWON way,\nwith standard products.",
      lead: "BABYLOG is a core NEWON platform and runs under the same principles as NEWON's other platforms.",
      items: [
        { n: "01", name: "In-house products first", body: "Standardized in-house SaaS, platforms, licenses and automation products — not per-client outsourcing." },
        { n: "02", name: "Roles divided with SHAREON", body: "Baby goods shopping, used goods and group buying stay in BABYLOG, while rental links to SHAREON, the sharing and rental platform. The principle is that a single transaction is never charged fees twice." },
        { n: "03", name: "Roles divided with LIVON and ONGIL", body: "Guidance on life-stage systems such as childbirth support and parental leave is handled by LIVON, and links to life stages after childhood are a long-term direction." },
        { n: "04", name: "Roles of the web and the app", body: "The website introduces the brand, services, business and partnerships and routes inquiries; the app handles actual recording and management." },
      ],
    },
    next: {
      kicker: "09 · Next Step",
      titleHtml: "So that every moment of children and families<br />stays connected.",
      lead: "Learn more about the BABYLOG platform and partnership opportunities.",
    },
  },

  platform: {
    hero: {
      titleHtml: "From pregnancy planning to a child's growth,<br />connecting every family moment.",
      lead: "BABYLOG aims to be a platform that connects the records, information, communication and wide range of services that parenting and family life need into one experience.",
      ctaMain: "App access",
      ctaSub: "Explore business areas",
    },
    sections: [
      {
        id: "growth",
        kicker: "02 · Growth Journey",
        title: "From pregnancy and birth\nto every stage of growth.",
        lead: "It starts from one child profile and continues into the records and information each stage needs.",
        items: [
          { name: "Pregnancy & birth", lead: "Start recording from pregnancy in the app and manage weekly changes and checkup schedules together.", status: "released" },
          { name: "Child profile", lead: "Manage growth stage, health information and basic schedule for each child in the app.", status: "released" },
          { name: "Expanding by growth stage", lead: "Widening the records and management a child needs into play, education and family-life stages as the child grows.", status: "direction" },
        ],
      },
      {
        id: "records",
        kicker: "03 · Parenting & Records",
        title: "Feeding, sleep, meals, growth —\nrecords every day.",
        lead: "Repeated parenting moments are logged with ease, and small records add up to a child's growth story.",
        items: [
          { name: "Feeding, sleep, diaper, meal and play records", lead: "Easily log everyday moments in the app and check them in a daily summary.", status: "released" },
          { name: "Growth & health records", lead: "Keep height, weight, vaccinations and health history in one timeline.", status: "released" },
          { name: "Growth statistics", lead: "See growth trends and daily patterns in charts.", status: "released" },
        ],
      },
      {
        id: "family",
        kicker: "04 · Family Connection",
        title: "Family sees and manages\ntogether.",
        lead: "Parenting is something a family does together. Guardians and family check and continue the same records.",
        items: [
          { name: "Shared family management", lead: "In the app, parents and guardians look at the same child's records and schedules together.", status: "released" },
          { name: "Permissions per guardian", lead: "Step by step, we are designing scopes of access by role: parents, grandparents, guardians and teens. See the principles under Roles & Permissions below.", status: "direction" },
        ],
      },
      {
        id: "learning",
        kicker: "05 · Learning & Education",
        title: "Play, learning,\nand links to education.",
        lead: "Starting from schedules and widening into play and learning information and links to education institutions.",
        items: [
          { name: "Hospital and education schedules", lead: "Gather hospital visits, vaccinations, daycare, kindergarten and education schedules and family plans in the app.", status: "released" },
          { name: "Play, reading and learning information", lead: "BABYLOG aims to provide activity information matched to each developmental stage, such as play by age, reading and sensory activities.", status: "direction" },
          { name: "Education content and institutions", lead: "Expanding into connecting education content with programs of institutions such as daycare centers and kindergartens.", status: "review" },
        ],
      },
      {
        id: "memories",
        kicker: "06 · Memories & Milestones",
        title: "Keeping passing time\nas memories.",
        lead: "BABYLOG aims for an experience that lets families look back together on the fast-changing early years.",
        items: [
          { name: "Photos, diary and growth memories", lead: "Building an experience that gathers photos, diary entries and month-by-month growth records into one archive.", status: "direction" },
          { name: "Growth albums and reports", lead: "Expanding into an experience that turns growth records into albums and reports.", status: "review" },
        ],
      },
      {
        id: "assist",
        kicker: "07 · Smart Assistance",
        title: "Reference-only help\nto organize records.",
        lead: "AI is a reference tool that organizes and presents records.",
        items: [
          { name: "AI record summary and general information", lead: "In the app, record patterns are organized for reference and general information suited to age and situation is provided. It does not replace medical diagnosis or professional advice.", status: "released" },
        ],
      },
      {
        id: "explore",
        kicker: "08 · Explore & Discover",
        title: "Toward the products and services\na family needs.",
        lead: "Expanding into an experience that makes the products and services families need easier to find.",
        items: [
          { name: "Explore, booking and market", lead: "Institution and service information with booking, and baby goods shopping, used goods and group buying inside the app's explore area, are being prepared for the next version. The website offers no trading or booking.", status: "review" },
          { name: "Roles divided with SHAREON", lead: "Shopping, used goods and group buying happen in the BABYLOG market, while renting baby goods links to SHAREON, the sharing and rental platform. Using NEWON's shared transaction infrastructure for payment and settlement is a plan that is not yet built, designed so one transaction is never charged fees twice.", status: "review" },
        ],
      },
      {
        id: "trust",
        kicker: "09 · Our Commitment",
        title: "A child's safety and a family's trust\ncome first.",
        lead: "The standards BABYLOG puts first as a service that handles children's and families' records.",
        items: [
          { name: "Protecting children's and families' personal data", lead: "We handle children's and families' personal data with care; how it is handled is described in the Privacy Policy.", status: "released" },
          { name: "Trustworthy parenting and health information", lead: "AI-organized content is for reference and does not replace medical, legal or educational professionals.", status: "released" },
          { name: "Data management that respects guardian permissions", lead: "The principle is that the family decides how far records are shared.", status: "direction" },
          { name: "An accessible service", lead: "Used through the iOS and Android apps, with accessibility continuously improved so anyone can use it easily.", status: "direction" },
          { name: "Responsible child safety and protection information", lead: "We guide official information and reporting channels, and do not accept reports or identify a child's location or identity.", status: "plan" },
          { name: "Public-interest access to information", lead: "BABYLOG aims to let children and families in need reach official systems and institution information free of charge.", status: "plan" },
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
    closeTitleHtml: "Making family life more convenient,<br />and a child's growth more precious.",
    closeLead: "See the services and business lines BABYLOG connects on the Business page.",
  },

  business: {
    hero: {
      titleHtml: "From the everyday life of children and families<br />to the future of the family life industry.",
      lead: "Centered on pregnancy, birth, parenting and growth records, BABYLOG aims for a comprehensive family life ecosystem that extends to education, commerce, care, family life, business solutions and child welfare.",
      ctaMain: "See business areas",
      ctaSub: "Explore partnerships",
    },
    intro: {
      kicker: "01 · Business Models",
      title: "A business structure that grows\nfrom individuals to companies and the public sector.",
      lead: "Revenue opportunities are individual premium subscriptions, parenting commerce and lawful transaction revenue, childcare and education institution SaaS, corporate family-benefit solutions, parenting brand campaigns, partnerships with qualified service providers, public-sector contracts, and global SaaS and licensing. Child protection, reporting and public support information and donations are kept separate from commercial revenue.",
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
        id: "a", code: "A", en: "B2C", name: "Individual & family services",
        items: ["Free and premium app", "Parenting information", "Everyday service information", "Family sharing"],
        overview: "A consumer service in which parents and families record a child's day and find the information they need in the BABYLOG app.",
        customers: "Parents, families and guardians",
        problem: "The records, information and schedules parenting needs are scattered, which makes managing them heavy.",
        value: "The parenting log app is available today on the App Store and Google Play, and the experience is widening with information and everyday services.",
        revenue: "Individual premium subscription",
        partners: "Education content creators and experts",
        status: "review", partnerType: "creator",
      },
      {
        id: "b", code: "B", en: "Enterprise SaaS", name: "Childcare & education institution SaaS",
        items: ["Institution SaaS", "Attendance and schedules", "Institution–guardian communication", "Operations automation"],
        overview: "A standardized operations SaaS business for daycare centers, kindergartens and care institutions.",
        customers: "Daycare centers, kindergartens, care institutions, care service providers",
        problem: "Attendance, schedules, guardian communication and operations are scattered, making institution operations heavy.",
        value: "Reducing institutions' operating burden with standardized in-house SaaS and automation products, not custom development.",
        revenue: "Institution SaaS subscriptions, institutional contracts",
        partners: "Childcare and education institutions, qualified care service providers",
        status: "review", partnerType: "institution",
      },
      {
        id: "c", code: "C", en: "B2B", name: "Parenting brand & corporate solutions",
        items: ["Brand solutions", "Corporate family-benefit solutions", "Brand campaigns", "Commerce links"],
        overview: "A business offering brand solutions and corporate family-benefit solutions for parenting brands and companies.",
        customers: "Parenting brands and sellers, companies running employee family benefits",
        problem: "Brands find it hard to reach families at the right time, and companies find it hard to run family support for employees in one place.",
        value: "Providing product information, listing and campaign support and corporate family-benefit products as standardized in-house products.",
        revenue: "Corporate family-benefit solution contracts, brand campaign contracts",
        partners: "Parenting brands, corporate benefits managers",
        status: "review", partnerType: "corporate",
      },
      {
        id: "d", code: "D", en: "B2G", name: "Public body & local government solutions",
        items: ["Public parenting support information", "Child welfare information", "Local parenting programs", "Official application channels"],
        overview: "A business that improves access to public parenting support and child welfare information together with public bodies and local governments.",
        customers: "Government agencies, local governments, public parenting support bodies",
        problem: "It is hard for families to find the support programs and official application channels they need in one place.",
        value: "Guiding official programs and application channels accurately. Public-interest information on child protection, missing children, abuse prevention, adoption and foster care is kept separate from commercial transactions, and vulnerable children's information or need for protection is never monetized.",
        revenue: "Public-sector contracts (following public procurement and contracting procedures)",
        partners: "Government agencies, local governments, public parenting support bodies",
        status: "direction", partnerType: "institution",
      },
      {
        id: "e", code: "E", en: "Commerce", name: "Connecting parenting goods & services",
        items: ["Baby goods commerce", "Curated sales and group buying", "Qualified service connections", "Sharing and rental (with SHAREON)"],
        overview: "A business that connects families with the goods and services of parenting brands, sellers and qualified service providers.",
        customers: "Parenting and family brands, sellers, families looking for goods and services",
        problem: "It is hard to find trustworthy goods and services at the right time.",
        value: "Connecting goods and services under lawful transaction structures; sharing and rental link to SHAREON with roles kept separate.",
        revenue: "Lawful transaction revenue, partnerships with qualified service providers, brand campaigns (no duplicate fees on one transaction)",
        partners: "Parenting and family brands, sellers, family service providers, SHAREON",
        status: "review", partnerType: "brand",
      },
      {
        id: "f", code: "F", en: "Global", name: "Overseas platform & licensing",
        items: ["Multilingual platform", "SaaS licensing for institutions", "Localization", "Overseas distribution"],
        overview: "A multilingual platform and SaaS licensing business fitted to each country's language, parenting environment and systems.",
        customers: "Families abroad, overseas companies and institutions, strategic partners",
        problem: "Good family services and technology cannot reach families across differences in language and systems.",
        value: "Building ways to reach families in other markets through localization and licensing.",
        revenue: "Global SaaS and licensing contracts",
        partners: "Global and strategic partners, overseas institutions",
        status: "direction", partnerType: "global",
      },
    ],
    closeKicker: "Partnership",
    closeTitleHtml: "Starting from everyday family life,<br />toward a wider family life ecosystem.",
    closeLead: "If a business line interests you, explore partnerships or send a business and institution inquiry.",
  },

  partnerships: {
    hero: {
      titleHtml: "Building a better everyday life<br />for children and families, together.",
      lead: "BABYLOG aims for a family life ecosystem in which companies and institutions across parenting, education, care, commerce, business and the public sector can take part.",
      ctaMain: "See partner types",
      ctaSub: "Business & institution inquiry",
    },
    process: {
      kicker: "Partnership Process",
      title: "From proposal to delivery,\nfive steps.",
      lead: "Cooperation is reviewed in this order. An inquiry does not guarantee a confirmed partnership or a contract.",
      steps: [
        { n: "01", name: "Proposal received", body: "Send what you would like to work on through the inquiry form." },
        { n: "02", name: "Business fit review", body: "We look at fit with BABYLOG's direction and at the partner's eligibility and service reliability." },
        { n: "03", name: "Scope discussion", body: "We discuss scope, timing and personal data protection standards together." },
        { n: "04", name: "Terms & contract review", body: "Agreed terms are reviewed and put into a contract." },
        { n: "05", name: "Partnership in progress", body: "Cooperation proceeds within the contracted scope, and a partner is made public only once confirmed." },
      ],
    },
    principles: {
      title: "Partnership Principles",
      items: ["Respect for the rights of children and families", "Personal data protection", "Verification of qualified service providers", "Transparent transaction terms", "Accurate display of actual partnerships", "Separation of public-interest information and commercial cooperation"],
    },
    types: {
      kicker: "Partnership Opportunities",
      title: "Connecting new business opportunities\non a family-centered platform.",
      lead: "BABYLOG looks for opportunities with partners around six partnership models. Find the closest way of working together among the eight types below.",
      models: ["Family Services", "Parenting Commerce", "Childcare & Education SaaS", "Corporate Family Benefits", "Public & Social Impact", "Global Expansion"],
      railLabel: "Jump to a partner type",
      fields: {
        who: "Who we work with",
        areas: "Possible areas of cooperation",
        model: "Partnership model",
        terms: "Terms and review points",
      },
      items: [
        { code: "brand", n: "01", name: "Parenting & family brands", who: "Brands that make or sell baby goods, baby food, children's clothing and household goods", areas: "Product information, platform listing, curated sales, brand campaigns and group buying, overseas distribution", model: "Parenting Commerce — widening product and service experiences between parenting brands and consumers.", terms: "We check product safety and labeling standards, brand credibility and standards for advertising to families and children." },
        { code: "seller", n: "02", name: "Parenting commerce sellers", who: "Parenting commerce sellers, distributors, and individuals who want to reuse or share baby goods", areas: "Product introduction, used goods and group buying (BABYLOG market, preparing for the next version), baby goods rental (with SHAREON)", model: "Parenting Commerce — a transaction structure with no duplicate fees on one transaction.", terms: "Eligible items, trading safety rules and seller verification are agreed together. Seller accounts cannot be created on this website." },
        { code: "creator", n: "03", name: "Content creators", who: "Creators of parenting, play, learning and family content, education content companies and publishers", areas: "Play, reading and education content by age, joint planning", model: "Family Services — connecting parenting and family content and service information.", terms: "We check copyright and scope of use, age suitability, content quality and standards for using children's photos and information." },
        { code: "expert", n: "04", name: "Parenting & development experts", who: "Experts in child development, parent education, parenting and education, and specialist education institutions", areas: "Parent education, development information, postpartum emotional health and parenting stress information, education programs", model: "Family Services — connecting trusted parenting and development information and education.", terms: "We review how fields and qualifications are verified, and standards so content is not mistaken for medical or legal advice." },
        { code: "service", n: "05", name: "Parenting & care service providers", who: "Qualified providers of postpartum care centers, postpartum helpers, childcare, kids' classes and kids cafes, family photography and family experiences", areas: "Service information, connecting qualified services, joint programs", model: "Family Services — connecting family and parenting service information and qualified providers.", terms: "We check business verification, safety and qualification requirements, and standards for services aimed at children. Booking is not offered on this website." },
        { code: "corporate", n: "06", name: "Companies & benefits managers", who: "Managers at companies that run employee family benefits and parent support programs", areas: "Corporate family-benefit solutions, parent support information, use of automation products", model: "Corporate Family Benefits — solutions supporting employees' parenting and family life.", terms: "We discuss how it connects to benefit programs, the scope of personal data handling and how eligibility is checked." },
        { code: "institution", n: "07", name: "Education, care & public institutions", who: "Daycare centers, kindergartens, academies and care institutions, government agencies and local governments", areas: "Institution SaaS, institution–guardian communication, public parenting support information, program cooperation", model: "Childcare & Education SaaS · Public & Social Impact — more efficient institution operations and access to public information.", terms: "We check public procurement and contracting procedures, child-data protection standards and security requirements." },
        { code: "global", n: "08", name: "Global & technology partners", who: "Overseas parenting and family service providers and institutions, and technology partners in security, data protection, accessibility and automation", areas: "Multilingual platform, SaaS licensing, localization, technology cooperation", model: "Global Expansion — country-specific parenting and family services and global platform cooperation.", terms: "We review local law, child and personal-data protection standards, language and cultural fit, and the scope of brand use." },
      ],
      cta: "Inquire as this type",
    },
    closeKicker: "Partnership",
    closeTitleHtml: "Creating new possibilities for family life<br />together with BABYLOG.",
    closeLead: "We welcome partnership proposals in parenting, family, education, care, public welfare and technology.",
  },

  contact: {
    hero: {
      titleHtml: "Tell us about new possibilities<br />with BABYLOG.",
      lead: "From questions about using the service to partnerships with parenting brands, childcare institutions, companies and public bodies, we welcome all kinds of proposals.",
      ctaMain: "See contact categories",
      ctaSub: "See partnerships",
    },
    list: {
      kicker: "Contact Categories",
      title: "What would you like\nto talk about?",
      lead: "Choose the closest of the seventeen contact categories. ‘Contact us’ opens NEWON’s contact page with BABYLOG and the inquiry type selected.",
      items: [
        { code: "general", n: "01", name: "General inquiry", lead: "General questions about BABYLOG." },
        { code: "app", n: "02", name: "App & product support", lead: "Questions about app features, use, errors and accounts." },
        { code: "pregnancy", n: "03", name: "Pregnancy & birth", lead: "Service and partnership proposals about pregnancy and birth." },
        { code: "growth", n: "04", name: "Baby care & growth", lead: "Service proposals about parenting records and growth." },
        { code: "health", n: "05", name: "Child health & development", lead: "Cooperation on child health and development information. For individual health questions, please see a medical institution." },
        { code: "family", n: "06", name: "Parenting community", lead: "Proposals about parent and family communities." },
        { code: "commerce", n: "07", name: "Parenting commerce", lead: "Listing parenting goods and commerce." },
        { code: "brand", n: "08", name: "Parenting brands", lead: "Cooperation on parenting brand solutions and campaigns." },
      ],
      go: "Inquire as this type →",
    },
    channels: {
      title: "How to reach us",
      mailK: "Email · NEWON",
      mailText: "Every inquiry, including press and investment, can also be sent to newon@newon.app.",
      formK: "NEWON contact page",
      formText: "Opens NEWON’s contact page with BABYLOG selected. Questions about using the app go through the same page.",
    },
    guide: {
      kicker: "Contact Information",
      title: "Before you get in touch.",
      items: [
        { n: "01", name: "NEWON", body: "Inquiries go to NEWON’s contact page and can also be sent to newon@newon.app. This BABYLOG page does not collect personal data itself." },
        { n: "02", name: "BABYLOG and NEWON", body: "BABYLOG is a core NEWON platform. Questions about using the app are received through the same contact page." },
        { n: "03", name: "Replies", body: "We reply after review. An inquiry does not guarantee cooperation or a contract." },
      ],
    },
    closeKicker: "BABYLOG",
    closeTitleHtml: "Connecting every moment<br />of children and families, together.",
    closeLead: "BABYLOG looks forward to new possibilities with you.",
  },
};

const MERGED = {};
/** ko and en have copy; every other locale falls back to the English draft (P7 translation policy).
 *  The expansion copy (24 groups + child safety) is merged over the base copy. */
export function getBabylogCopy(lang) {
  const key = lang === "ko" ? "ko" : "en";
  if (!MERGED[key]) {
    const base = key === "ko" ? KO : EN;
    const x0 = getExpansionCopy(key);
    const c30 = getContent30(key);
    // content upgrade 30: the 27 long-term areas (26 + Giving) replace the earlier 21-service list, the plan's five priorities
    // replace the earlier roadmap, and the vision / journey copy comes from the integrated business plan.
    const x = {
      ...x0,
      platform: { ...x0.platform, screens: c30.platform.areas },
      business: { ...x0.business, phases: c30.business.phases },
    };
    MERGED[key] = {
      ...base,
      status: { ...base.status, ...x.status },
      ui: { ...base.ui, ...x.ui },
      seo: Object.fromEntries(Object.entries(base.seo).map(([k, v]) => [k, { ...v, ...(x.seo[k] || {}), ...(c30.seo[k] || {}) }])),
      overview: { ...base.overview, vision: c30.overview.vision, journey: c30.overview.journey },
      x,
      c30,
      v3: getContentV3(key),
    };
  }
  return MERGED[key];
}

export function copyLangFor(lang) {
  return lang === "ko" ? "ko" : "en";
}
