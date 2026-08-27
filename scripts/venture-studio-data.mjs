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
  "COMING_SOON",
  "ARCHIVED",
];

export const STUDIO_STATUS_LABEL = {
  LIVE: { ko: "Live", en: "Live" },
  OPERATING: { ko: "Operating", en: "Operating" },
  BUILDING: { ko: "Building", en: "Building" },
  TESTING: { ko: "Testing", en: "Testing" },
  EXPLORING: { ko: "Exploring", en: "Exploring" },
  COMING_SOON: { ko: "Coming Soon", en: "Coming Soon" },
  ARCHIVED: { ko: "Archived", en: "Archived" },
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

/** Top-level nav order */
export const TOP_NAV = ["products", "business", "studio", "resources", "company"];

/**
 * Mega menu: exactly up to 4 editorial destinations per top menu.
 * titleKey / descKey are locale keys under nav.*
 */
export const MEGA_DESTINATIONS = {
  products: [
    { titleKey: "nav.apps", descKey: "nav.megaAppsDesc", href: "apps/", titleFb: "Apps" },
    { titleKey: "nav.ai", descKey: "nav.megaAiDesc", href: "ai/", titleFb: "AI" },
    { titleKey: "nav.games", descKey: "nav.megaGamesDesc", href: "games/", titleFb: "Games" },
    { titleKey: "nav.tools", descKey: "nav.megaToolsDesc", href: "tools/", titleFb: "Tools" },
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
      titleKey: "nav.bizColResearch",
      descKey: "nav.megaResearchDesc",
      href: "business/research/",
      titleFb: "RESEARCH",
    },
    {
      titleKey: "nav.bizColSolutions",
      descKey: "nav.megaSolutionsDesc",
      href: "business/solutions/",
      titleFb: "SOLUTIONS",
    },
  ],
  studio: [
    { titleKey: "nav.studioBrand", descKey: "nav.megaBrandDesc", href: "studio/brand/", titleFb: "BRAND" },
    { titleKey: "nav.studioDigital", descKey: "nav.megaDigitalDesc", href: "studio/digital/", titleFb: "DIGITAL" },
    { titleKey: "nav.studioContent", descKey: "nav.megaContentDesc", href: "studio/content/", titleFb: "CONTENT" },
    { titleKey: "nav.studioIp", descKey: "nav.megaIpDesc", href: "studio/ip/", titleFb: "IP" },
  ],
  resources: [
    { titleKey: "nav.store", descKey: "nav.megaStoreDesc", href: "resources/store/", titleFb: "STORE" },
    { titleKey: "nav.insights", descKey: "nav.megaInsightsDesc", href: "resources/insights/", titleFb: "INSIGHTS" },
    { titleKey: "nav.blog", descKey: "nav.megaBlogDesc", href: "resources/blog/", titleFb: "BLOG" },
    { titleKey: "nav.labs", descKey: "nav.megaLabsDesc", href: "resources/labs/", titleFb: "LABS" },
  ],
  company: [
    { titleKey: "nav.aboutNewon", descKey: "nav.megaAboutDesc", href: "about/", titleFb: "About" },
    { titleKey: "nav.portfolio", descKey: "nav.megaPortfolioDesc", href: "portfolio/", titleFb: "Portfolio" },
    { titleKey: "nav.newsUpdates", descKey: "nav.megaNewsDesc", href: "news/", titleFb: "News" },
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
      { titleKey: "nav.bizMvp", descKey: "nav.bizMvpDesc", href: "business/mvp/", status: "OPERATING" },
      { titleKey: "nav.bizWeb", descKey: "nav.bizWebDesc", href: "business/web/", status: "OPERATING" },
      { titleKey: "nav.bizLanding", descKey: "nav.bizLandingDesc", href: "business/landing/", status: "OPERATING" },
      { titleKey: "nav.bizApp", descKey: "nav.bizAppDesc", href: "business/app/", status: "OPERATING" },
    ],
  },
  {
    id: "automation",
    labelKey: "nav.bizColAutomation",
    labelFb: "AUTOMATION",
    detailHref: "business/automation/",
    items: [
      {
        titleKey: "nav.bizAi",
        descKey: "nav.bizAiDesc",
        href: "business/ai-automation/",
        status: "OPERATING",
      },
      { titleKey: "nav.bizWorkflow", descKey: "nav.bizWorkflowDesc", href: "business/automation/workflow/", status: "OPERATING" },
      { titleKey: "nav.bizInternal", descKey: "nav.bizInternalDesc", href: "business/internal-tools/", status: "OPERATING" },
    ],
  },
  {
    id: "research",
    labelKey: "nav.bizColResearch",
    labelFb: "RESEARCH",
    detailHref: "business/research/",
    items: [
      { titleKey: "nav.bizMarket", descKey: "nav.bizMarketDesc", href: "business/market-research/", status: "OPERATING" },
      { titleKey: "nav.bizCompetitor", descKey: "nav.bizCompetitorDesc", href: "business/competitor-analysis/", status: "OPERATING" },
      { titleKey: "nav.bizConsumer", descKey: "nav.bizConsumerDesc", href: "business/consumer-research/", status: "OPERATING" },
      { titleKey: "nav.bizUxAudit", descKey: "nav.bizUxAuditDesc", href: "business/ux-audit/", status: "OPERATING" },
    ],
  },
  {
    id: "solutions",
    labelKey: "nav.bizColSolutions",
    labelFb: "SOLUTIONS",
    detailHref: "business/solutions/",
    items: [
      {
        titleKey: "nav.bizWhitelabel",
        descKey: "nav.bizWhitelabelDesc",
        href: "business/white-label/",
        status: "OPERATING",
      },
      { titleKey: "nav.bizCustom", descKey: "nav.bizCustomDesc", href: "business/custom-product/", status: "OPERATING" },
      { titleKey: "nav.bizLaunchPkg", descKey: "nav.bizLaunchPkgDesc", href: "business/product-launch/", status: "OPERATING" },
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
    leadFb: "브랜드의 방향과 정체성.",
    leadFbEn: "Brand direction and identity.",
    moreHref: "studio/brand/",
    items: [
      {
        title: "Brand Strategy",
        titleKo: "브랜드 전략",
        desc: "브랜드가 어디로 가야 하는지 방향과 포지셔닝을 정의합니다.",
        descEn: "Define where the brand should go — direction and positioning.",
        href: "business/creative/#brand",
      },
      {
        title: "Naming",
        titleKo: "네이밍",
        desc: "기억에 남고 확장 가능한 이름과 네이밍 시스템을 만듭니다.",
        descEn: "Create memorable, expandable names and naming systems.",
        href: "business/creative/#brand",
      },
      {
        title: "Identity",
        titleKo: "아이덴티티",
        desc: "색, 타이포, 톤을 포함한 브랜드 정체성 시스템을 설계합니다.",
        descEn: "Design identity systems — color, type, and tone.",
        href: "business/creative/#brand",
      },
      {
        title: "Logo",
        titleKo: "로고",
        desc: "브랜드의 상징이 되는 마크와 로고 시스템을 제작합니다.",
        descEn: "Craft the mark and logo system that stands for the brand.",
        href: "business/design/",
      },
    ],
  },
  {
    id: "digital",
    labelKey: "nav.studioDigital",
    labelFb: "DIGITAL",
    leadKey: "studioHub.digitalLead",
    leadFb: "웹과 제품 경험.",
    leadFbEn: "Web and product experience.",
    moreHref: "studio/digital/",
    items: [
      {
        title: "Web Design",
        titleKo: "웹 디자인",
        desc: "브랜드와 서비스를 설명하는 웹 UI를 설계합니다.",
        descEn: "Design web UI that presents brand and service clearly.",
        href: "business/design/",
      },
      {
        title: "App UI/UX",
        titleKo: "앱 UI/UX",
        desc: "앱의 핵심 흐름과 화면 경험을 설계합니다.",
        descEn: "Design core app flows and screen experience.",
        href: "business/design/",
      },
      {
        title: "Landing",
        titleKo: "랜딩",
        desc: "출시와 전환을 위한 랜딩 페이지 경험을 만듭니다.",
        descEn: "Build landing experiences for launch and conversion.",
        href: "business/build/landing/",
      },
      {
        title: "Product Design",
        titleKo: "제품 디자인",
        desc: "제품 전체의 구조와 시각 언어를 하나로 맞춥니다.",
        descEn: "Align product structure and visual language as one system.",
        href: "business/creative/#digital",
      },
    ],
  },
  {
    id: "content",
    labelKey: "nav.studioContent",
    labelFb: "CONTENT",
    leadKey: "studioHub.contentLead",
    leadFb: "브랜드 콘텐츠와 비주얼.",
    leadFbEn: "Brand content and visuals.",
    moreHref: "studio/content/",
    items: [
      {
        title: "Social Content",
        titleKo: "소셜 콘텐츠",
        desc: "채널에 맞는 브랜드 콘텐츠와 포맷을 기획합니다.",
        descEn: "Plan brand content and formats for each channel.",
        href: "business/creative/#content",
      },
      {
        title: "Campaign",
        titleKo: "캠페인",
        desc: "출시·프로모션 캠페인의 메시지와 비주얼을 구성합니다.",
        descEn: "Shape campaign messaging and visuals for launches and promos.",
        href: "business/creative/#content",
      },
      {
        title: "Visual Content",
        titleKo: "비주얼 콘텐츠",
        desc: "브랜드를 보여주는 이미지·모션·비주얼 에셋을 만듭니다.",
        descEn: "Create image, motion, and visual assets that carry the brand.",
        href: "business/creative/#content",
      },
    ],
  },
  {
    id: "ip",
    labelKey: "nav.studioIp",
    labelFb: "IP",
    leadKey: "studioHub.ipLead",
    leadFb: "캐릭터와 새로운 IP 실험.",
    leadFbEn: "Characters and new IP experiments.",
    moreHref: "studio/ip/",
    items: [
      {
        title: "Character Lab",
        titleKo: "캐릭터 랩",
        desc: "캐릭터 콘셉트와 IP의 첫 형태를 실험합니다.",
        descEn: "Experiment with character concepts and early IP forms.",
        href: "resources/labs/character-lab/",
      },
      {
        title: "Digital Sticker",
        titleKo: "디지털 스티커",
        desc: "캐릭터 기반 디지털 스티커와 표현을 준비합니다.",
        descEn: "Prepare character-based digital stickers and expressions.",
        href: "resources/labs/character-lab/",
        status: "COMING_SOON",
      },
      {
        title: "Newon Characters",
        titleKo: "Newon 캐릭터",
        desc: "Newon 고유 캐릭터 IP를 확장합니다.",
        descEn: "Expand Newon’s own character IP.",
        href: "resources/labs/character-lab/",
        status: "BUILDING",
      },
      {
        title: "Experimental IP",
        titleKo: "실험 IP",
        desc: "아직 정의되지 않은 새로운 IP 가능성을 탐색합니다.",
        descEn: "Explore new IP possibilities still being defined.",
        href: "resources/labs/",
        status: "EXPLORING",
      },
    ],
  },
];

/** @deprecated kept for any imports — prefer MEGA_DESTINATIONS.resources */
export const RESOURCES_IA = MEGA_DESTINATIONS.resources.map((d) => ({
  titleKey: d.titleKey,
  descKey: d.descKey,
  href: d.href,
  status: "OPERATING",
}));

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
