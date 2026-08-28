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
    { titleKey: "nav.media", descKey: "nav.megaMediaDesc", href: "media/", titleFb: "Media" },
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
        desc: "어디서 보여도 같은 브랜드로 느껴지는 시각 언어 설계.",
        descEn: "A visual language that feels consistent wherever the brand appears.",
        href: "studio/brand/identity/",
      },
      {
        title: "Logo",
        titleKo: "로고",
        desc: "브랜드 성격을 담은 로고와 기본 사용 시스템 제작.",
        descEn: "A logo and basic usage system that express the brand simply.",
        href: "studio/brand/logo/",
      },
    ],
  },
  {
    id: "digital",
    labelKey: "nav.studioDigital",
    labelFb: "DIGITAL",
    leadKey: "studioHub.digitalLead",
    leadFb: "웹과 앱에서 사용자가 만나는 경험을 설계합니다.",
    leadFbEn: "We design the experiences users meet on web and apps.",
    moreHref: "studio/digital/",
    items: [
      {
        title: "Web Design",
        titleKo: "웹 디자인",
        desc: "브랜드와 서비스를 명확히 전달하는 웹 경험 설계.",
        descEn: "Web experiences that present brand and service clearly.",
        href: "studio/digital/web-design/",
      },
      {
        title: "App UI/UX",
        titleKo: "앱 UI/UX",
        desc: "앱의 핵심 흐름과 화면 구조를 설계합니다.",
        descEn: "Flows and screen structure for core app features.",
        href: "studio/digital/app-ui-ux/",
      },
      {
        title: "Landing",
        titleKo: "랜딩",
        desc: "전환을 위한 랜딩페이지 경험 설계.",
        descEn: "Landing experiences built for conversion.",
        href: "studio/digital/landing/",
      },
      {
        title: "Product Design",
        titleKo: "제품 디자인",
        desc: "제품 전체가 일관된 경험으로 작동하도록 설계.",
        descEn: "Whole-product experience design — not only screens.",
        href: "studio/digital/product-design/",
      },
    ],
  },
  {
    id: "content",
    labelKey: "nav.studioContent",
    labelFb: "CONTENT",
    leadKey: "studioHub.contentLead",
    leadFb: "브랜드의 메시지를 실제 콘텐츠와 비주얼로 만듭니다.",
    leadFbEn: "We turn brand messages into real content and visuals.",
    moreHref: "studio/content/",
    items: [
      {
        title: "Social Content",
        titleKo: "소셜 콘텐츠",
        desc: "SNS에서 꾸준히 쓸 수 있는 브랜드 콘텐츠 체계.",
        descEn: "A content system for ongoing social brand presence.",
        href: "studio/content/social/",
      },
      {
        title: "Campaign",
        titleKo: "캠페인",
        desc: "출시·프로모션을 하나의 메시지와 비주얼로 연결.",
        descEn: "Launches and promotions connected by one message and visual.",
        href: "studio/content/campaign/",
      },
      {
        title: "Visual Content",
        titleKo: "비주얼 콘텐츠",
        desc: "웹·SNS·프로모션용 브랜드 비주얼 에셋 제작.",
        descEn: "Brand visual assets for web, social, and promotions.",
        href: "studio/content/visual/",
      },
    ],
  },
  {
    id: "ip",
    labelKey: "nav.studioIp",
    labelFb: "IP",
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
