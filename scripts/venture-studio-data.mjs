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

/**
 * Top-level nav order. Business and Partnerships are one menu since 2026-10-19 ("Business & Partnerships",
 * id "business", where Business used to be); the separate Partnerships item is gone.
 */
export const TOP_NAV = ["consumer", "ai", "ongil", "lifestage", "shareon", "babylog", "petlog", "myworld", "business", "studio", "company"];

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
    { titleKey: "nav.livonMenuOverview", descKey: "nav.livonMenuOverviewDesc", href: "livon/", titleFb: "Overview" },
    { titleKey: "nav.livonMenuPlatform", descKey: "nav.livonMenuPlatformDesc", href: "livon/platform/", titleFb: "Platform" },
    { titleKey: "nav.livonMenuBusiness", descKey: "nav.livonMenuBusinessDesc", href: "livon/business/", titleFb: "Business" },
    { titleKey: "nav.livonMenuPartnerships", descKey: "nav.livonMenuPartnershipsDesc", href: "livon/partnerships/", titleFb: "Partnerships" },
    { titleKey: "nav.livonMenuContact", descKey: "nav.livonMenuContactDesc", href: "livon/contact/", titleFb: "Contact" },
  ],
  ongil: [
    { titleKey: "nav.ongilMenuOverview", descKey: "nav.ongilMenuOverviewDesc", href: "ongil/", titleFb: "Overview" },
    { titleKey: "nav.ongilMenuPlatform", descKey: "nav.ongilMenuPlatformDesc", href: "ongil/platform/", titleFb: "Platform" },
    { titleKey: "nav.ongilMenuBusiness", descKey: "nav.ongilMenuBusinessDesc", href: "ongil/business/", titleFb: "Business" },
    { titleKey: "nav.ongilMenuPartnerships", descKey: "nav.ongilMenuPartnershipsDesc", href: "ongil/partnerships/", titleFb: "Partnerships" },
    { titleKey: "nav.ongilMenuContact", descKey: "nav.ongilMenuContactDesc", href: "ongil/contact/", titleFb: "Contact" },
  ],
  babylog: [
    { titleKey: "nav.babylogMenuOverview", descKey: "nav.babylogMenuOverviewDesc", href: "babylog/", titleFb: "Overview" },
    { titleKey: "nav.babylogMenuPlatform", descKey: "nav.babylogMenuPlatformDesc", href: "babylog/platform/", titleFb: "Platform" },
    { titleKey: "nav.babylogMenuBusiness", descKey: "nav.babylogMenuBusinessDesc", href: "babylog/business/", titleFb: "Business" },
    { titleKey: "nav.babylogMenuPartnerships", descKey: "nav.babylogMenuPartnershipsDesc", href: "babylog/partnerships/", titleFb: "Partnerships" },
    { titleKey: "nav.babylogMenuContact", descKey: "nav.babylogMenuContactDesc", href: "babylog/contact/", titleFb: "Contact" },
  ],
  myworld: [
    { titleKey: "nav.myworldMenuOverview", descKey: "nav.myworldMenuOverviewDesc", href: "myworld/", titleFb: "Overview" },
    { titleKey: "nav.myworldMenuPlatform", descKey: "nav.myworldMenuPlatformDesc", href: "myworld/platform/", titleFb: "Platform" },
    { titleKey: "nav.myworldMenuBusiness", descKey: "nav.myworldMenuBusinessDesc", href: "myworld/business/", titleFb: "Business" },
    { titleKey: "nav.myworldMenuPartnerships", descKey: "nav.myworldMenuPartnershipsDesc", href: "myworld/partnerships/", titleFb: "Partnerships" },
    { titleKey: "nav.myworldMenuContact", descKey: "nav.myworldMenuContactDesc", href: "myworld/contact/", titleFb: "Contact" },
  ],
  shareon: [
    { titleKey: "nav.shareonOverview", descKey: "nav.shareonOverviewDesc", href: "shareon/", titleFb: "Overview" },
    { titleKey: "nav.shareonPlatform", descKey: "nav.shareonPlatformDesc", href: "shareon/platform/", titleFb: "Platform" },
    { titleKey: "nav.shareonBusiness", descKey: "nav.shareonBusinessDesc", href: "shareon/business/", titleFb: "Business" },
    { titleKey: "nav.shareonPartnerships", descKey: "nav.shareonPartnershipsDesc", href: "shareon/partnerships/", titleFb: "Partnerships" },
    { titleKey: "nav.shareonContact", descKey: "nav.shareonContactDesc", href: "shareon/contact/", titleFb: "Contact" },
  ],
  // PETLOG business site (Oct 2026): Overview · Platform · Business · Partnerships · Contact (business row mega).
  petlog: [
    { titleKey: "nav.petlogMenuOverview", descKey: "nav.petlogMenuOverviewDesc", href: "petlog/", titleFb: "Overview" },
    { titleKey: "nav.petlogMenuPlatform", descKey: "nav.petlogMenuPlatformDesc", href: "petlog/platform/", titleFb: "Platform" },
    { titleKey: "nav.petlogMenuBusiness", descKey: "nav.petlogMenuBusinessDesc", href: "petlog/business/", titleFb: "Business" },
    { titleKey: "nav.petlogMenuPartnerships", descKey: "nav.petlogMenuPartnershipsDesc", href: "petlog/partnerships/", titleFb: "Partnerships" },
    { titleKey: "nav.petlogMenuContact", descKey: "nav.petlogMenuContactDesc", href: "petlog/contact/", titleFb: "Contact" },
  ],
  // Business & Partnerships (2026-10-19): five hub screens; each platform's own Business/Partnerships pages hold the detail.
  business: [
    { titleKey: "nav.bpOverview", descKey: "nav.bpOverviewDesc", href: "business/", titleFb: "Overview" },
    { titleKey: "nav.bpPlatforms", descKey: "nav.bpPlatformsDesc", href: "business/platforms/", titleFb: "Our Platforms" },
    { titleKey: "nav.bpModels", descKey: "nav.bpModelsDesc", href: "business/models/", titleFb: "Business Models" },
    { titleKey: "nav.bpPartnerships", descKey: "nav.bpPartnershipsDesc", href: "business/partnerships/", titleFb: "Partnerships" },
    { titleKey: "nav.bpContact", descKey: "nav.bpContactDesc", href: "business/contact/", titleFb: "Contact" },
  ],
  // NEWON Studio (2026-10-19): five screens; the six platform product pages sit under Our Platforms.
  studio: [
    { titleKey: "nav.stOverview", descKey: "nav.stOverviewDesc", href: "studio/", titleFb: "Overview" },
    { titleKey: "nav.stStore", descKey: "nav.stStoreDesc", href: "studio/store/", titleFb: "Digital Store" },
    { titleKey: "nav.stPlatforms", descKey: "nav.stPlatformsDesc", href: "studio/platforms/", titleFb: "Our Platforms" },
    { titleKey: "nav.stBusiness", descKey: "nav.stBusinessDesc", href: "studio/business/", titleFb: "Business Products" },
    { titleKey: "nav.stContact", descKey: "nav.stContactDesc", href: "studio/contact/", titleFb: "Contact" },
  ],
  bizhubBusiness: [
    { titleKey: "nav.bhAutomation", descKey: "nav.bhAutomationDesc", href: "business/automation/", titleFb: "Automation" },
    { titleKey: "nav.bhSellerCenter", descKey: "nav.bhSellerCenterDesc", href: "business/seller-center/", titleFb: "Seller Center" },
    { titleKey: "nav.bhTools", descKey: "nav.bhToolsDesc", href: "tools/", titleFb: "Business Tools" },
    { titleKey: "nav.bhEnterprise", descKey: "nav.bhEnterpriseDesc", href: "ai/enterprise/", titleFb: "Enterprise" },
    { titleKey: "nav.bhInsights", descKey: "nav.bhInsightsDesc", href: "resources/insights/", titleFb: "Insights" },
    { titleKey: "nav.bhPartners", descKey: "nav.bhPartnersDesc", href: "business/partners/", titleFb: "Partners" },
  ],
  bizhubStudio: [
    { titleKey: "nav.studioPartnerships", descKey: "nav.megaStudioPartnershipsDesc", href: "studio/partnerships/", titleFb: "Partnerships" },
    { titleKey: "nav.studioDigitalProducts", descKey: "nav.megaStudioDigitalProductsDesc", href: "studio/digital/", titleFb: "Digital Products" },
    { titleKey: "nav.studioProjects", descKey: "nav.megaStudioProjectsDesc", href: "studio/projects/", titleFb: "Projects" },
    { titleKey: "nav.studioContact", descKey: "nav.megaStudioContactDesc", href: "studio/contact/", titleFb: "Contact" },
  ],
  company: [
    { titleKey: "nav.aboutNewon", descKey: "nav.megaAboutDesc", href: "about/", titleFb: "About" },
    { titleKey: "nav.portfolio", descKey: "nav.megaPortfolioDesc", href: "portfolio/", titleFb: "Portfolio" },
    { titleKey: "nav.newsUpdates", descKey: "nav.megaNewsDesc", href: "news/", titleFb: "News" },
    { titleKey: "nav.media", descKey: "nav.megaMediaDesc", href: "media/", titleFb: "Media" },
    { titleKey: "nav.blog", descKey: "nav.megaBlogDesc", href: "resources/blog/", titleFb: "BLOG" },
    { titleKey: "nav.market", descKey: "nav.megaMarketDesc", href: "market/", titleFb: "Market" },
    { titleKey: "nav.contact", descKey: "nav.megaContactDesc", href: "contact/", titleFb: "Contact" },
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
      { titleKey: "nav.bizRenewal", descKey: "nav.bizRenewalDesc", href: "business/website-renewal/", status: "OPERATING" },
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

/** Business Hub page data (kept for the /business-hub/ page; not a top menu). */
export const BIZHUB_PATH = "business-hub/";
export const BIZHUB_GROUPS = [
  {
    id: "business",
    labelKey: "nav.businessMenuLabel",
    labelFb: "Business",
    leadKey: "nav.bhBusinessLead",
    href: "business/",
  },
  {
    id: "studio",
    labelKey: "nav.studioMenuLabel",
    labelFb: "Studio",
    leadKey: "nav.bhStudioLead",
    href: "studio/",
  },
];
