/**
 * Newon IA — Global nav destinations (max 4 per top menu).
 * Detail services live on hub pages, not in mega menus.
 */

/** Unified project / surface status (display) */
export const STUDIO_STATUSES = [
  "LIVE",
  "OPERATING",
  "BUILDING",
  "TESTING",
  "EXPLORING",
  "EXPERIMENTAL",
  "COMING_SOON",
  "ARCHIVED",
];

export const STUDIO_STATUS_LABEL = {
  LIVE: { ko: "운영 중", en: "Live" },
  OPERATING: { ko: "운영", en: "Operating" },
  BUILDING: { ko: "내부 구축 중", en: "Internal · Building" },
  TESTING: { ko: "테스트", en: "Testing" },
  EXPLORING: { ko: "탐색 · 맞춤", en: "Exploring · Custom" },
  EXPERIMENTAL: { ko: "실험 · 이용 가능", en: "Experimental · Available" },
  COMING_SOON: { ko: "곧 공개", en: "Coming Soon" },
  INTERNAL: { ko: "내부", en: "Internal" },
  ARCHIVED: { ko: "보관", en: "Archived" },
};

export const LEGACY_STATUS_MAP = {
  live: "LIVE",
  building: "BUILDING",
  beta: "TESTING",
  concept: "COMING_SOON",
  paused: "ARCHIVED",
  archived: "ARCHIVED",
  exploring: "EXPLORING",
};

/** Top-level nav order — 7 business menus */
export const TOP_NAV = ["consumer", "ai", "lifestage", "ongil", "business", "studio", "company"];

/**
 * Mega menu destinations per top menu.
 * Hash hrefs (#…) link to homepage story sections (no new pages).
 */
export const MEGA_DESTINATIONS = {
  consumer: [
    { titleKey: "nav.ecosystem", descKey: "nav.megaEcosystemDesc", href: "ecosystem/", titleFb: "Newon Ecosystem" },
    { titleKey: "nav.apps", descKey: "nav.megaAppsDesc", href: "apps/", titleFb: "Apps" },
    { titleKey: "nav.newonPlus", descKey: "nav.newonPlusMenuDesc", href: "#newon-plus-app", titleFb: "Newon+" },
    { titleKey: "nav.games", descKey: "nav.megaGamesDesc", href: "games/", titleFb: "Games" },
    { titleKey: "nav.saas", descKey: "nav.saasMenuDesc", href: "saas/", titleFb: "SaaS" },
  ],
  ai: [
    { titleKey: "nav.aiPersonal", descKey: "nav.aiPersonalDesc", href: "ai/", titleFb: "Personal AI" },
    {
      titleKey: "nav.aiEnterprise",
      descKey: "nav.aiEnterpriseDesc",
      href: "ai/enterprise/",
      titleFb: "Enterprise AI",
    },
  ],
  lifestage: [
    {
      titleKey: "nav.lifeStageIntro",
      descKey: "nav.lifeStageIntroDesc",
      href: "lifestage/",
      titleFb: "LivOn",
    },
  ],
  ongil: [
    {
      titleKey: "nav.ongilIntro",
      descKey: "nav.ongilIntroDesc",
      href: "ongil/",
      titleFb: "Ongil",
    },
  ],
  business: [
    { titleKey: "nav.bizColBuild", descKey: "nav.megaBuildDesc", href: "business/build/", titleFb: "BUILD" },
    {
      titleKey: "nav.bizColAutomation",
      descKey: "nav.megaAutomationDesc",
      href: "business/automation/",
      titleFb: "AUTOMATION",
    },
    {
      titleKey: "nav.bizColSolutions",
      descKey: "nav.megaSolutionsDesc",
      href: "business/solutions/",
      titleFb: "SOLUTIONS",
    },
    {
      titleKey: "nav.bizColCare",
      descKey: "nav.megaCareDesc",
      href: "business/care/",
      titleFb: "CARE",
    },
    { titleKey: "nav.insights", descKey: "nav.megaInsightsDesc", href: "resources/insights/", titleFb: "INSIGHTS" },
    { titleKey: "nav.tools", descKey: "nav.megaToolsDesc", href: "tools/", titleFb: "Tools" },
  ],
  studio: [
    { titleKey: "nav.studioBrand", descKey: "nav.megaBrandDesc", href: "studio/brand/", titleFb: "BRAND" },
    { titleKey: "nav.studioDigital", descKey: "nav.megaDigitalDesc", href: "studio/digital/", titleFb: "DIGITAL DESIGN" },
    { titleKey: "nav.studioContent", descKey: "nav.megaContentDesc", href: "studio/content/", titleFb: "CONTENT & CAMPAIGN" },
    { titleKey: "nav.studioIp", descKey: "nav.megaIpDesc", href: "studio/ip/", titleFb: "CREATIVE LAB" },
    { titleKey: "nav.studioCare", descKey: "nav.megaStudioCareDesc", href: "studio/care/", titleFb: "DESIGN CARE" },
    { titleKey: "nav.store", descKey: "nav.megaStoreDesc", href: "resources/store/", titleFb: "STORE" },
    { titleKey: "nav.labs", descKey: "nav.megaLabsDesc", href: "resources/labs/", titleFb: "LABS" },
  ],
  company: [
    { titleKey: "nav.aboutNewon", descKey: "nav.megaAboutDesc", href: "about/", titleFb: "About" },
    { titleKey: "nav.portfolio", descKey: "nav.megaPortfolioDesc", href: "portfolio/", titleFb: "Portfolio" },
    { titleKey: "nav.newsUpdates", descKey: "nav.megaNewsDesc", href: "news/", titleFb: "News" },
    { titleKey: "nav.media", descKey: "nav.megaMediaDesc", href: "media/", titleFb: "Media" },
    { titleKey: "nav.blog", descKey: "nav.megaBlogDesc", href: "resources/blog/", titleFb: "BLOG" },
    { titleKey: "nav.market", descKey: "nav.megaMarketDesc", href: "market/", titleFb: "Market" },
    { titleKey: "nav.contact", descKey: "nav.megaContactDesc", href: "business/inquiry/", titleFb: "Contact" },
  ],
};

/**
 * Business hub pillars (no Creative — that lives under Studio).
 * Detail links still use existing URLs.
 */
export const BUSINESS_IA = [
  {
    id: "build",
    labelKey: "nav.bizColBuild",
    labelFb: "BUILD",
    detailHref: "business/build/",
    items: [
      { titleKey: "nav.bizLanding", descKey: "nav.bizLandingDesc", href: "business/landing/", status: "OPERATING" },
      { titleKey: "nav.bizWeb", descKey: "nav.bizWebDesc", href: "business/web/", status: "OPERATING" },
      { titleKey: "nav.bizMvp", descKey: "nav.bizMvpDesc", href: "business/mvp/", status: "OPERATING" },
      { titleKey: "nav.bizApp", descKey: "nav.bizAppDesc", href: "business/app/", status: "OPERATING" },
    ],
  },
  {
    id: "automation",
    labelKey: "nav.bizColAutomation",
    labelFb: "AUTOMATION",
    detailHref: "business/automation/",
    items: [
      { titleKey: "nav.bizWorkflow", descKey: "nav.bizWorkflowDesc", href: "business/automation/workflow/", status: "OPERATING" },
      { titleKey: "nav.bizInternal", descKey: "nav.bizInternalDesc", href: "business/internal-tools/", status: "OPERATING" },
      { titleKey: "nav.bizBooking", descKey: "nav.bizBookingDesc", href: "business/booking/", status: "OPERATING" },
      {
        titleKey: "nav.bizAi",
        descKey: "nav.bizAiDesc",
        href: "business/ai-automation/",
        status: "OPERATING",
      },
    ],
  },
  {
    id: "solutions",
    labelKey: "nav.bizColSolutions",
    labelFb: "SOLUTIONS",
    detailHref: "business/solutions/",
    items: [
      { titleKey: "nav.bizCustom", descKey: "nav.bizCustomDesc", href: "business/custom-product/", status: "OPERATING" },
      {
        titleKey: "nav.bizWhitelabel",
        descKey: "nav.bizWhitelabelDesc",
        href: "business/white-label/",
        status: "OPERATING",
      },
      { titleKey: "nav.bizInternalSystem", descKey: "nav.bizInternalSystemDesc", href: "business/internal-system/", status: "OPERATING" },
    ],
  },
  {
    id: "care",
    labelKey: "nav.bizColCare",
    labelFb: "CARE",
    detailHref: "business/care/",
    items: [
      { titleKey: "nav.bizMaintenance", descKey: "nav.bizMaintenanceDesc", href: "business/maintenance/", status: "OPERATING" },
      { titleKey: "nav.bizPostLaunch", descKey: "nav.bizPostLaunchDesc", href: "business/post-launch/", status: "OPERATING" },
      { titleKey: "nav.bizImprovement", descKey: "nav.bizImprovementDesc", href: "business/improvement/", status: "OPERATING" },
    ],
  },
];

/** Studio hub pillars — Brand / Digital / Content / IP */
export const STUDIO_IA = [
  {
    id: "brand",
    labelKey: "nav.studioBrand",
    labelFb: "BRAND",
    leadKey: "studioHub.brandLead",
    leadFb: "브랜드의 방향과 정체성을 설계합니다.",
    leadFbEn: "We design brand direction and identity.",
    moreHref: "studio/brand/",
    items: [
      {
        title: "Brand Strategy",
        titleKo: "브랜드 전략",
        desc: "브랜드의 포지셔닝과 핵심 메시지를 정의합니다.",
        descEn: "Define positioning and core brand messages.",
        href: "studio/brand/strategy/",
      },
      {
        title: "Naming",
        titleKo: "네이밍",
        desc: "기억하기 쉽고 확장 가능한 이름과 네이밍 방향 제작.",
        descEn: "Memorable names and naming direction that can grow with the brand.",
        href: "studio/brand/naming/",
      },
      {
        title: "Identity",
        titleKo: "아이덴티티",
        desc: "컬러, 타이포, 그래픽 시스템을 설계합니다.",
        descEn: "Color, type, and graphic system for consistent use.",
        href: "studio/brand/identity/",
      },
      {
        title: "Logo",
        titleKo: "로고",
        desc: "로고와 기본 사용 규칙을 디자인합니다.",
        descEn: "Logo mark and basic usage rules.",
        href: "studio/brand/logo/",
      },
    ],
  },
  {
    id: "digital",
    labelKey: "nav.studioDigital",
    labelFb: "DIGITAL DESIGN",
    leadKey: "studioHub.digitalLead",
    leadFb: "웹·앱의 화면과 사용 경험을 설계합니다.",
    leadFbEn: "We design screens and user experience for web and apps.",
    moreHref: "studio/digital/",
    items: [
      {
        title: "Web Design",
        titleKo: "웹 디자인",
        desc: "웹사이트 구조와 화면을 설계합니다. (Design Only)",
        descEn: "Website structure and screens. (Design Only)",
        href: "studio/digital/web-design/",
      },
      {
        title: "App UI/UX",
        titleKo: "앱 UI/UX",
        desc: "앱의 핵심 흐름과 화면을 설계합니다. (Design Only)",
        descEn: "App flows and screens. (Design Only)",
        href: "studio/digital/app-ui-ux/",
      },
      {
        title: "Landing",
        titleKo: "랜딩",
        desc: "전환용 랜딩페이지 화면을 설계합니다. (Design Only)",
        descEn: "Landing page screens for conversion. (Design Only)",
        href: "studio/digital/landing/",
      },
      {
        title: "Product Design",
        titleKo: "제품 디자인",
        desc: "제품 전체 UX와 UI 시스템을 설계합니다. (Design Only)",
        descEn: "Whole-product UX and UI system. (Design Only)",
        href: "studio/digital/product-design/",
      },
    ],
  },
  {
    id: "content",
    labelKey: "nav.studioContent",
    labelFb: "CONTENT & CAMPAIGN",
    leadKey: "studioHub.contentLead",
    leadFb: "SNS·캠페인·채널용 콘텐츠와 비주얼을 만듭니다.",
    leadFbEn: "We make social, campaign, and channel content and visuals.",
    moreHref: "studio/content/",
    items: [
      {
        title: "Social Content",
        titleKo: "소셜 콘텐츠",
        desc: "SNS용 콘텐츠 방향과 디자인. 계정 운영은 별도.",
        descEn: "Social content direction and design. Account ops extra.",
        href: "studio/content/social/",
      },
      {
        title: "Campaign",
        titleKo: "캠페인",
        desc: "캠페인 메시지와 비주얼 제작. 광고 집행은 별도.",
        descEn: "Campaign message and visuals. Media buying extra.",
        href: "studio/content/campaign/",
      },
      {
        title: "Visual Content",
        titleKo: "비주얼 콘텐츠",
        desc: "웹·SNS·프로모션용 이미지와 비주얼 에셋 제작.",
        descEn: "Images and visual assets for web, social, and promo.",
        href: "studio/content/visual/",
      },
    ],
  },
  {
    id: "ip",
    labelKey: "nav.studioIp",
    labelFb: "CREATIVE LAB",
    leadKey: "studioHub.ipLead",
    leadFb: "캐릭터와 새로운 브랜드 자산의 가능성을 실험합니다.",
    leadFbEn: "We experiment with characters and new brand-asset possibilities.",
    moreHref: "studio/ip/",
    items: [
      {
        title: "Character Lab",
        titleKo: "캐릭터 랩",
        desc: "초기 Character Concept과 IP 가능성을 탐색. Experimental · Available.",
        descEn: "Early character concept and IP potential. Experimental · Available.",
        href: "studio/ip/character-lab/",
        status: "EXPERIMENTAL",
      },
      {
        title: "Digital Stickers",
        titleKo: "디지털 스티커",
        desc: "캐릭터 감정을 디지털 표현으로 확장. Coming Soon.",
        descEn: "Character emotion as digital expressions. Coming Soon.",
        href: "studio/ip/digital-stickers/",
        status: "COMING_SOON",
      },
      {
        title: "Newon Character",
        titleKo: "Newon 캐릭터",
        desc: "Newon 자체 브랜드용 캐릭터 IP. Internal · Building.",
        descEn: "Internal Newon brand character IP. Internal · Building.",
        href: "studio/ip/newon-character/",
        status: "BUILDING",
      },
      {
        title: "Experimental IP",
        titleKo: "실험 IP",
        desc: "고정 패키지 없이 Custom Experimental Project. Exploring · Custom.",
        descEn: "Custom experimental project — not a fixed package. Exploring · Custom.",
        href: "studio/ip/experimental-ip/",
        status: "EXPLORING",
      },
    ],
  },
  {
    id: "care",
    labelKey: "nav.studioCare",
    labelFb: "DESIGN CARE",
    leadKey: "studioHub.careLead",
    leadFb: "제작 이후 디자인을 계약 범위에서 운영하고 개선합니다.",
    leadFbEn: "After delivery, we run and improve design within an agreed range.",
    moreHref: "studio/care/",
    items: [
      {
        title: "Monthly Design Support",
        titleKo: "월간 디자인 운영",
        desc: "정기 SNS·배너·프로모션 디자인을 계약 범위에서 지원. 별도 견적.",
        descEn: "Regular social, banner, and promo design by contract. Custom quote.",
        href: "studio/care/monthly-design/",
      },
      {
        title: "Design Improvement",
        titleKo: "기존 디자인 개선",
        desc: "이미 보유한 브랜드·웹·앱 디자인을 정리하고 개선. 별도 견적.",
        descEn: "Tidy and improve brand, web, and app design you already have. Custom quote.",
        href: "studio/care/design-improvement/",
      },
      {
        title: "Brand Design Care",
        titleKo: "브랜드 디자인 유지관리",
        desc: "기존 브랜드 시각 요소를 일관되게 유지·확장. 디자인 개선 페이지에서 안내.",
        descEn: "Keep and extend existing brand visuals. Covered on Design Improvement.",
        href: "studio/care/design-improvement/",
      },
      {
        title: "UI/UX Improvement",
        titleKo: "웹·앱 UI/UX 개선",
        desc: "운영 중인 화면의 디자인 개선. 개발은 Business.",
        descEn: "Design improvements to live screens. Build sits in Business.",
        href: "studio/care/design-improvement/",
      },
      {
        title: "Regular Content Design",
        titleKo: "SNS·마케팅 콘텐츠 정기 제작",
        desc: "월간 디자인 운영 범위에서 진행. 광고 집행은 제외.",
        descEn: "Regular content under Monthly Design Support. Media buying not included.",
        href: "studio/care/monthly-design/",
      },
    ],
  },
];

/** @deprecated former Resources mega — Store/Labs live under Studio, Insights under Business. */
export const RESOURCES_IA = [
  { titleKey: "nav.store", descKey: "nav.megaStoreDesc", href: "resources/store/", status: "OPERATING" },
  { titleKey: "nav.insights", descKey: "nav.megaInsightsDesc", href: "resources/insights/", status: "OPERATING" },
  { titleKey: "nav.blog", descKey: "nav.megaBlogDesc", href: "resources/blog/", status: "OPERATING" },
  { titleKey: "nav.labs", descKey: "nav.megaLabsDesc", href: "resources/labs/", status: "OPERATING" },
];

export function studioStatusLabel(status, lang = "en") {
  const key = String(status || "")
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  const row = STUDIO_STATUS_LABEL[key] || STUDIO_STATUS_LABEL.COMING_SOON;
  return lang === "ko" ? row.ko : row.en;
}

export function studioStatusClass(status) {
  const key = String(status || "COMING_SOON")
    .toLowerCase()
    .replace(/_/g, "-");
  return `studio-status studio-status--${key}`;
}
