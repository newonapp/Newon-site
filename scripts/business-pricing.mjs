/**
 * Business service pricing — single source of truth.
 * Amounts are KRW starting prices; final quotes vary by scope.
 */

export const PRICING_CATEGORIES = {
  BUILD: "BUILD",
  AUTOMATION: "AUTOMATION",
  RESEARCH: "RESEARCH",
  SOLUTIONS: "SOLUTIONS",
  DESIGN: "DESIGN",
};

/**
 * Estimated project timelines — same slugs as SERVICE_PRICING.
 * Ranges are after requirements lock + kickoff (not a hard guarantee).
 */
export const SERVICE_TIMELINES = {
  landing: { timelineKo: "3–5일", timelineEn: "3–5 days" },
  web: { timelineKo: "5–10일", timelineEn: "5–10 days" },
  app: { timelineKo: "3–7일", timelineEn: "3–7 days" },
  mvp: {
    timelineKo: "1–2주",
    timelineEn: "1–2 weeks",
    timelineExtraNoteKo:
      "MVP Standard·Custom 및 앱스토어 심사가 필요한 경우 일정은 별도로 추가될 수 있습니다.",
    timelineExtraNoteEn:
      "MVP Standard/Custom scopes and app-store review time may extend the schedule separately.",
  },
  "ai-automation": {
    timelineKo: "1–2주",
    timelineEn: "1–2 weeks",
    timelineExtraNoteKo:
      "외부 API 및 SaaS 접근 권한·환경에 따라 연동·테스트 일정이 달라질 수 있습니다.",
    timelineExtraNoteEn:
      "Integration and testing may shift with third-party API/SaaS access and environment.",
  },
  "workflow-automation": {
    timelineKo: "3–7일",
    timelineEn: "3–7 days",
    timelineExtraNoteKo:
      "외부 API 및 SaaS 접근 권한·환경에 따라 연동·테스트 일정이 달라질 수 있습니다.",
    timelineExtraNoteEn:
      "Integration and testing may shift with third-party API/SaaS access and environment.",
  },
  "data-reporting": {
    timelineKo: "5–10일",
    timelineEn: "5–10 days",
    timelineExtraNoteKo:
      "외부 API 및 SaaS 접근 권한·환경에 따라 연동·테스트 일정이 달라질 수 있습니다.",
    timelineExtraNoteEn:
      "Integration and testing may shift with third-party API/SaaS access and environment.",
  },
  "internal-tools": { timelineKo: "5–10일", timelineEn: "5–10 days" },
  "market-research": { timelineKo: "1–2주", timelineEn: "1–2 weeks" },
  "competitor-analysis": { timelineKo: "1–2주", timelineEn: "1–2 weeks" },
  "consumer-research": {
    timelineKo: "2–4주",
    timelineEn: "2–4 weeks",
    timelineExtraNoteKo:
      "설문·인터뷰 및 참여자 모집이 포함되면 모집 일정에 따라 전체 기간이 달라질 수 있습니다.",
    timelineExtraNoteEn:
      "If surveys, interviews, or recruitment are included, the overall timeline may shift.",
  },
  "ux-audit": { timelineKo: "1–3주", timelineEn: "1–3 weeks" },
  "trend-research": { timelineKo: "1–2주", timelineEn: "1–2 weeks" },
  "white-label": {
    timelineKo: "별도 협의",
    timelineEn: "By agreement",
    timelineExtraNoteKo: "요구사항 확인 후 범위와 상세 일정을 별도로 확정합니다.",
    timelineExtraNoteEn: "We confirm scope and a detailed schedule after reviewing requirements.",
  },
  "custom-product": {
    timelineKo: "별도 협의",
    timelineEn: "By agreement",
    timelineExtraNoteKo: "요구사항 확인 후 범위와 상세 일정을 별도로 확정합니다.",
    timelineExtraNoteEn: "We confirm scope and a detailed schedule after reviewing requirements.",
  },
  "product-launch": { timelineKo: "2–4주", timelineEn: "2–4 weeks" },
  "internal-system": {
    timelineKo: "2–4주",
    timelineEn: "2–4 weeks",
    timelineExtraNoteKo: "복잡도에 따라 별도 협의로 일정이 확정됩니다.",
    timelineExtraNoteEn: "Complex scopes are scheduled by agreement after review.",
  },
  design: { timelineKo: "3–5일", timelineEn: "3–5 days" },
};

/** @type {Record<string, { amount?: number, custom?: boolean, category: string, externalCost?: boolean, basisKo: string, basisEn: string, extraNoteKo?: string, extraNoteEn?: string, inquiryLabelKo?: string, inquiryLabelEn?: string }>} */
export const SERVICE_PRICING = {
  landing: {
    amount: 700000,
    category: PRICING_CATEGORIES.BUILD,
    basisKo: "1페이지 랜딩 · 반응형 · 기본 UI/UX · 문의 CTA · 기본 SEO · 배포 기준",
    basisEn: "1-page landing · responsive · basic UI/UX · inquiry CTA · basic SEO · deploy",
    inquiryLabelKo: "Landing Page Development",
    inquiryLabelEn: "Landing Page Development",
  },
  web: {
    amount: 1200000,
    category: PRICING_CATEGORIES.BUILD,
    basisKo: "기업/브랜드 다중 페이지 웹 · 반응형 · UI/UX · 문의 폼 · 기본 SEO · 배포 기준",
    basisEn: "Multi-page company/brand site · responsive · UI/UX · inquiry form · basic SEO · deploy",
    extraNoteKo:
      "로그인·DB·Dashboard·API 등이 필요한 Web Service는 ₩1,800,000부터이며 복잡도에 따라 별도 견적입니다.",
    extraNoteEn:
      "Web Service scopes (login, DB, dashboard, API) start from ₩1,800,000 and are quoted by complexity.",
    inquiryLabelKo: "Website Development",
    inquiryLabelEn: "Website Development",
  },
  app: {
    amount: 1000000,
    category: PRICING_CATEGORIES.BUILD,
    basisKo: "App Prototype — 핵심 화면 · 기본 인터랙션 · MVP 검증용 구조 기준",
    basisEn: "App Prototype — key screens · basic interaction · MVP validation structure",
    extraNoteKo:
      "App Development(iOS+Android / Flutter / Firebase 기본 연동)은 ₩2,500,000부터입니다. 관리자·결제·AI·채팅·지도·고급 Backend 등은 추가 견적입니다. 프로젝트 범위와 기능 복잡도에 따라 최종 견적이 결정됩니다.",
    extraNoteEn:
      "App Development (iOS+Android / Flutter / basic Firebase) starts from ₩2,500,000. Admin, payments, AI, chat, maps, and advanced backend are add-ons. Final quotes depend on scope and complexity.",
    inquiryLabelKo: "App Prototype",
    inquiryLabelEn: "App Prototype",
  },
  mvp: {
    amount: 3000000,
    category: PRICING_CATEGORIES.BUILD,
    basisKo: "MVP Starter — 아이디어에서 출시 가능한 첫 제품까지 (기본 범위)",
    basisEn: "MVP Starter — from idea to a launchable first product (basic scope)",
    extraNoteKo:
      "MVP Standard ₩4,500,000~ · MVP Custom ₩6,000,000~. 화면 수가 아니라 기능 복잡도에 따라 견적이 결정됩니다.",
    extraNoteEn:
      "MVP Standard from ₩4,500,000 · MVP Custom from ₩6,000,000. Quotes follow feature complexity, not screen count alone.",
    inquiryLabelKo: "MVP",
    inquiryLabelEn: "MVP",
  },
  "ai-automation": {
    amount: 2000000,
    category: PRICING_CATEGORIES.AUTOMATION,
    externalCost: true,
    basisKo: "Business Automation — 핵심 업무 자동화 1건 기준",
    basisEn: "Business Automation — one core business workflow automation",
    inquiryLabelKo: "AI Automation",
    inquiryLabelEn: "AI Automation",
  },
  "workflow-automation": {
    amount: 1000000,
    category: PRICING_CATEGORIES.AUTOMATION,
    externalCost: true,
    basisKo: "Workflow Automation — 하나의 핵심 워크플로 및 기본 연동 기준",
    basisEn: "Workflow Automation — one core workflow with basic integrations",
    inquiryLabelKo: "Workflow Automation",
    inquiryLabelEn: "Workflow Automation",
  },
  "data-reporting": {
    amount: 700000,
    category: PRICING_CATEGORIES.AUTOMATION,
    externalCost: true,
    basisKo: "기본 데이터 수집·정리·Reporting 자동화 기준",
    basisEn: "Starting point for basic data collection, cleanup, and reporting automation",
    inquiryLabelKo: "Data & Reporting",
    inquiryLabelEn: "Data & Reporting",
  },
  "internal-tools": {
    amount: 1500000,
    category: PRICING_CATEGORIES.AUTOMATION,
    externalCost: true,
    basisKo: "Admin Dashboard — 내부 운영 대시보드 기본 범위",
    basisEn: "Admin Dashboard — basic internal operations dashboard",
    extraNoteKo:
      "Internal Tool은 ₩2,500,000부터 · Custom Business System은 ₩4,000,000부터입니다.",
    extraNoteEn:
      "Internal Tool starts from ₩2,500,000 · Custom Business System from ₩4,000,000.",
    inquiryLabelKo: "Internal Tools",
    inquiryLabelEn: "Internal Tools",
  },
  "market-research": {
    amount: 300000,
    category: PRICING_CATEGORIES.RESEARCH,
    basisKo: "기본 시장 조사 범위 기준",
    basisEn: "Starting point for a basic market research scope",
    inquiryLabelKo: "Market Research",
    inquiryLabelEn: "Market Research",
  },
  "competitor-analysis": {
    amount: 300000,
    category: PRICING_CATEGORIES.RESEARCH,
    basisKo: "주요 경쟁사 분석 기준",
    basisEn: "Starting point for primary competitor analysis",
    inquiryLabelKo: "Competitor Analysis",
    inquiryLabelEn: "Competitor Analysis",
  },
  "consumer-research": {
    amount: 400000,
    category: PRICING_CATEGORIES.RESEARCH,
    basisKo: "기본 소비자 조사 프로젝트 기준",
    basisEn: "Starting point for a basic consumer research project",
    extraNoteKo:
      "설문·인터뷰 참가자 모집, 리워드 및 외부 조사 비용은 별도로 발생할 수 있습니다.",
    extraNoteEn:
      "Recruitment, incentives, and third-party research costs may apply separately.",
    inquiryLabelKo: "Consumer Research",
    inquiryLabelEn: "Consumer Research",
  },
  "ux-audit": {
    amount: 300000,
    category: PRICING_CATEGORIES.RESEARCH,
    basisKo: "핵심 사용자 흐름 및 UX 진단 기준",
    basisEn: "Starting point for core journey and UX diagnosis",
    inquiryLabelKo: "UX Audit",
    inquiryLabelEn: "UX Audit",
  },
  "trend-research": {
    amount: 300000,
    category: PRICING_CATEGORIES.RESEARCH,
    basisKo: "특정 시장/주제의 기본 Trend Research 기준",
    basisEn: "Starting point for basic trend research on a topic or market",
    inquiryLabelKo: "Trend Research",
    inquiryLabelEn: "Trend Research",
  },
  "white-label": {
    custom: true,
    category: PRICING_CATEGORIES.SOLUTIONS,
    basisKo: "프로젝트의 기능, 규모, 기술 환경과 운영 요구사항을 확인한 후 견적을 안내합니다.",
    basisEn:
      "We provide a quote after reviewing features, scale, technical environment, and operational requirements.",
    inquiryLabelKo: "White-label",
    inquiryLabelEn: "White-label",
  },
  "custom-product": {
    custom: true,
    category: PRICING_CATEGORIES.SOLUTIONS,
    basisKo: "프로젝트의 기능, 규모, 기술 환경과 운영 요구사항을 확인한 후 견적을 안내합니다.",
    basisEn:
      "We provide a quote after reviewing features, scale, technical environment, and operational requirements.",
    inquiryLabelKo: "Custom Product",
    inquiryLabelEn: "Custom Product",
  },
  "product-launch": {
    amount: 1000000,
    category: PRICING_CATEGORIES.SOLUTIONS,
    basisKo: "기본적인 제품 출시 지원 범위 기준",
    basisEn: "Starting point for a basic product launch support scope",
    inquiryLabelKo: "Product Launch",
    inquiryLabelEn: "Product Launch",
  },
  "internal-system": {
    amount: 4000000,
    category: PRICING_CATEGORIES.SOLUTIONS,
    basisKo: "Custom Business System — Admin/CRM/운영 시스템 기본 범위",
    basisEn: "Custom Business System — admin/CRM/ops system basic scope",
    inquiryLabelKo: "Internal System",
    inquiryLabelEn: "Internal System",
  },
  design: {
    amount: 400000,
    category: PRICING_CATEGORIES.DESIGN,
    basisKo: "Landing UI 디자인 기본 범위 (Design Only)",
    basisEn: "Landing UI design basic scope (design only)",
    extraNoteKo:
      "Web UI/UX ₩600,000~ · App UI/UX ₩700,000~ · Product Design ₩1,000,000~. Brand Identity는 별도 견적. 구현이 필요하면 Business BUILD와 연결합니다.",
    extraNoteEn:
      "Web UI/UX from ₩600,000 · App UI/UX from ₩700,000 · Product Design from ₩1,000,000. Brand Identity is custom. Implementation continues through Business BUILD.",
    inquiryLabelKo: "Design",
    inquiryLabelEn: "Design",
  },
};

/**
 * Quote / HQ starting packages — same numbers as public Business productization.
 * Used by admin Quote Builder; not a separate price table.
 * amount null = custom quote (user fills unit price).
 */
export const QUOTE_PACKAGES = [
  {
    id: "landing",
    group: "WEB",
    label: "Landing",
    amount: 700000,
    timelineKo: "3–5일",
    timelineEn: "3–5 days",
    serviceSlug: "landing",
  },
  {
    id: "business-website",
    group: "WEB",
    label: "Business Website",
    amount: 1200000,
    timelineKo: "5–10일",
    timelineEn: "5–10 days",
    serviceSlug: "web",
  },
  {
    id: "web-service",
    group: "WEB",
    label: "Web Service",
    amount: 1800000,
    timelineKo: "1–3주",
    timelineEn: "1–3 weeks",
    serviceSlug: "web",
  },
  {
    id: "app-prototype",
    group: "APP",
    label: "App Prototype",
    amount: 1000000,
    timelineKo: "3–7일",
    timelineEn: "3–7 days",
    serviceSlug: "app",
  },
  {
    id: "app-development",
    group: "APP",
    label: "App Development",
    amount: 2500000,
    timelineKo: "1–3주",
    timelineEn: "1–3 weeks",
    serviceSlug: "app",
  },
  {
    id: "mvp-starter",
    group: "MVP",
    label: "MVP Starter",
    amount: 3000000,
    timelineKo: "1–2주",
    timelineEn: "1–2 weeks",
    serviceSlug: "mvp",
  },
  {
    id: "mvp-standard",
    group: "MVP",
    label: "MVP Standard",
    amount: 4500000,
    timelineKo: "2–3주",
    timelineEn: "2–3 weeks",
    serviceSlug: "mvp",
  },
  {
    id: "mvp-custom",
    group: "MVP",
    label: "MVP Custom",
    amount: 6000000,
    timelineKo: "별도 협의",
    timelineEn: "By agreement",
    serviceSlug: "mvp",
  },
  {
    id: "admin-dashboard",
    group: "INTERNAL",
    label: "Admin Dashboard",
    amount: 1500000,
    timelineKo: "5–10일",
    timelineEn: "5–10 days",
    serviceSlug: "internal-tools",
  },
  {
    id: "internal-tool",
    group: "INTERNAL",
    label: "Internal Tool",
    amount: 2500000,
    timelineKo: "1–2주",
    timelineEn: "1–2 weeks",
    serviceSlug: "internal-tools",
  },
  {
    id: "custom-business-system",
    group: "INTERNAL",
    label: "Custom Business System",
    amount: 4000000,
    timelineKo: "2–4주 / 별도 협의",
    timelineEn: "2–4 weeks / by agreement",
    serviceSlug: "internal-system",
  },
  {
    id: "workflow-automation",
    group: "AUTOMATION",
    label: "Workflow Automation",
    amount: 1000000,
    timelineKo: "3–7일",
    timelineEn: "3–7 days",
    serviceSlug: "workflow-automation",
  },
  {
    id: "business-automation",
    group: "AUTOMATION",
    label: "Business Automation",
    amount: 2000000,
    timelineKo: "1–2주",
    timelineEn: "1–2 weeks",
    serviceSlug: "ai-automation",
  },
  {
    id: "custom-automation",
    group: "AUTOMATION",
    label: "Custom Automation",
    amount: null,
    custom: true,
    timelineKo: "별도 견적",
    timelineEn: "Custom quote",
    serviceSlug: "ai-automation",
  },
  {
    id: "landing-ui",
    group: "DESIGN",
    label: "Landing UI",
    amount: 400000,
    timelineKo: "3–5일",
    timelineEn: "3–5 days",
    serviceSlug: "design",
  },
  {
    id: "web-ui-ux",
    group: "DESIGN",
    label: "Web UI/UX",
    amount: 600000,
    timelineKo: "5–7일",
    timelineEn: "5–7 days",
    serviceSlug: "design",
  },
  {
    id: "app-ui-ux",
    group: "DESIGN",
    label: "App UI/UX",
    amount: 700000,
    timelineKo: "5–10일",
    timelineEn: "5–10 days",
    serviceSlug: "design",
  },
  {
    id: "product-design",
    group: "DESIGN",
    label: "Product Design",
    amount: 1000000,
    timelineKo: "1–2주",
    timelineEn: "1–2 weeks",
    serviceSlug: "design",
  },
];

/**
 * Editorial product lines for Business hub comparison (starting engagement model).
 * Links into existing routes — no new public pages required.
 */
export const BUSINESS_PRODUCT_LINES = [
  {
    id: "web",
    nameKo: "WEB",
    nameEn: "WEB",
    priceShortKo: "₩700,000~",
    priceShortEn: "₩700K~",
    timelineShortKo: "3일~",
    timelineShortEn: "3 DAYS~",
    href: "landing/",
    pillar: "build",
  },
  {
    id: "app",
    nameKo: "APP",
    nameEn: "APP",
    priceShortKo: "₩1,000,000~",
    priceShortEn: "₩1M~",
    timelineShortKo: "3일~",
    timelineShortEn: "3 DAYS~",
    href: "app/",
    pillar: "build",
  },
  {
    id: "mvp",
    nameKo: "MVP",
    nameEn: "MVP",
    priceShortKo: "₩3,000,000~",
    priceShortEn: "₩3M~",
    timelineShortKo: "1주~",
    timelineShortEn: "1 WEEK~",
    href: "mvp/",
    pillar: "build",
  },
  {
    id: "internal",
    nameKo: "INTERNAL",
    nameEn: "INTERNAL",
    priceShortKo: "₩1,500,000~",
    priceShortEn: "₩1.5M~",
    timelineShortKo: "5일~",
    timelineShortEn: "5 DAYS~",
    href: "internal-tools/",
    pillar: "automation",
  },
  {
    id: "automation",
    nameKo: "AUTOMATION",
    nameEn: "AUTOMATION",
    priceShortKo: "₩1,000,000~",
    priceShortEn: "₩1M~",
    timelineShortKo: "3일~",
    timelineShortEn: "3 DAYS~",
    href: "automation/workflow/",
    pillar: "automation",
  },
  {
    id: "design",
    nameKo: "DESIGN",
    nameEn: "DESIGN",
    priceShortKo: "₩400,000~",
    priceShortEn: "₩400K~",
    timelineShortKo: "3일~",
    timelineShortEn: "3 DAYS~",
    href: "../studio/digital/",
    pillar: "design",
  },
];

/** Pillar tab order → service slug */
export const PILLAR_SERVICE_SLUGS = {
  build: ["mvp", "web", "landing", "app"],
  automation: ["ai-automation", "workflow-automation", "internal-tools", "data-reporting"],
  research: [
    "market-research",
    "competitor-analysis",
    "consumer-research",
    "ux-audit",
    "trend-research",
  ],
  solutions: ["white-label", "custom-product", "product-launch", "internal-system"],
};

export function isCustomQuote(slug) {
  return !!SERVICE_PRICING[slug]?.custom;
}

export function hasExternalCost(slug) {
  return !!SERVICE_PRICING[slug]?.externalCost;
}

export function formatKrw(amount) {
  return `₩${Number(amount).toLocaleString("en-US")}`;
}

export function formatTimelineDisplay(slug, lang = "ko") {
  const cfg = SERVICE_TIMELINES[slug];
  if (!cfg) return "";
  return lang === "ko" ? cfg.timelineKo : cfg.timelineEn;
}

export function timelineMetaLabel(lang = "ko") {
  return lang === "ko" ? "예상 기간" : "Estimated timeline";
}

export function timelineSectionLabel(lang = "ko") {
  return lang === "ko" ? "예상 기간" : "Estimated timeline";
}

export function timelineDisclaimer(lang = "ko") {
  return lang === "ko"
    ? "표시된 기간은 요구사항 확정 및 착수 이후 기본 범위 기준 예상 기간입니다. 기능·화면 수, 외부 연동, 피드백 지연, App Store/Google Play 심사 등에 따라 달라질 수 있습니다."
    : "Timelines are estimates after requirements lock and kickoff for a basic scope. They may change with features, integrations, feedback delays, and App Store / Google Play review.";
}

export function getTimelineExtraNote(slug, lang = "ko") {
  const cfg = SERVICE_TIMELINES[slug];
  if (!cfg) return "";
  return lang === "ko" ? cfg.timelineExtraNoteKo || "" : cfg.timelineExtraNoteEn || "";
}

function isTimelineFaqQuestion(q) {
  return /작업 기간|프로젝트 기간|얼마나 걸|일정은|how long|timeline take|project take|how many weeks|기간은/i.test(
    String(q || "")
  );
}

function serviceTimelineFaqAnswer(slug, lang = "ko") {
  const display = formatTimelineDisplay(slug, lang);
  if (!display) return "";
  if (lang === "ko") {
    return `요구사항 확정·착수 이후 기본 범위 기준 예상 기간은 ${display}입니다. 기능·연동·피드백 및 스토어 심사에 따라 달라질 수 있습니다.`;
  }
  return `After requirements lock and kickoff, the estimated basic-scope timeline is ${display}. It may vary with features, integrations, feedback, and store review.`;
}

function pillarBuildTimelineFaqAnswer(lang = "ko") {
  if (lang === "ko") {
    return "랜딩 3–5일, 웹사이트 5–10일, 앱 프로토타입 3–7일, MVP Starter 1–2주가 일반적인 예상 기간입니다. 표시된 기간은 요구사항 확정·착수 이후 기본 범위 기준이며, 상세 일정은 함께 정합니다.";
  }
  return "Typical estimates after kickoff: landing 3–5 days, website 5–10 days, app prototype 3–7 days, MVP Starter 1–2 weeks. Ranges reflect a basic scope; we confirm a detailed schedule together.";
}

function patchStaleTimelineText(text, lang = "ko") {
  if (!text) return text;
  let out = String(text);
  if (lang === "ko") {
    out = out
      .replace(/보통\s*/g, "")
      .replace(/약\s*/g, "")
      .replace(/범위에 따라 상이/g, "")
      .replace(/ · 범위별 상이/g, "");
  } else {
    out = out
      .replace(/Typically\s*/gi, "")
      .replace(/About\s*/gi, "")
      .replace(/depending on scope\.?/gi, "");
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

export function formatPriceDisplay(slug, lang = "ko") {
  const cfg = SERVICE_PRICING[slug];
  if (!cfg) return "";
  if (cfg.custom) return lang === "ko" ? "맞춤 견적" : "Custom quote";
  const ko = lang === "ko";
  if (ko) return `${formatKrw(cfg.amount)}부터`;
  return `From ${formatKrw(cfg.amount)}`;
}

export function getPriceBasis(slug, lang = "ko") {
  const cfg = SERVICE_PRICING[slug];
  if (!cfg) return "";
  return lang === "ko" ? cfg.basisKo : cfg.basisEn;
}

export function getServiceCategory(slug) {
  return SERVICE_PRICING[slug]?.category || "";
}

export function getPillarServiceSlug(pillarSlug, index) {
  const list = PILLAR_SERVICE_SLUGS[pillarSlug];
  return list?.[index] || "";
}

export function scopeDisclaimer(lang = "ko") {
  return lang === "ko"
    ? "프로젝트 범위, 기능 복잡도, 외부 연동 및 일정에 따라 최종 견적이 달라질 수 있습니다."
    : "Final quotes may vary with project scope, feature complexity, integrations, and timeline.";
}

export function externalCostDisclaimer(lang = "ko") {
  return lang === "ko"
    ? "Domain, Hosting, Server, Paid API, External SaaS, App Store/Google Play 계정 비용 등 외부 비용은 별도일 수 있습니다."
    : "External costs such as domain, hosting, servers, paid APIs, SaaS, and App Store / Google Play accounts may apply separately.";
}

export function inquiryStartingPriceNote(lang = "ko") {
  return lang === "ko"
    ? "표시된 시작가는 기본 범위 기준이며, 요구사항 확인 후 최종 견적을 안내합니다."
    : "The starting price shown reflects a basic scope. We confirm the final quote after reviewing your requirements.";
}

export function paymentPolicyBrief(lang = "ko") {
  return lang === "ko"
    ? "소규모 프로젝트는 착수 50% / 완료 전 50%가 기본입니다. 규모가 큰 프로젝트는 계약에 따라 단계별 결제가 가능합니다."
    : "Small projects typically use 50% at kickoff / 50% before completion. Larger projects can use milestone payments by agreement.";
}

export function revisionPolicyBrief(lang = "ko") {
  return lang === "ko"
    ? "기본 범위 내 수정은 계약별 기준(보통 2회)으로 진행합니다. 합의 범위를 넘는 신규 기능은 추가 개발로 별도 견적합니다. 장기 유지보수는 별도 계약입니다."
    : "In-scope revisions follow the contract (typically two rounds). New features beyond agreed scope are quoted separately. Ongoing maintenance is a separate agreement.";
}

export function pillarPricingNote(pillarSlug, lang = "ko") {
  const ko = lang === "ko";
  if (pillarSlug === "automation") {
    return `${scopeDisclaimer(lang)} ${externalCostDisclaimer(lang)}`.trim();
  }
  if (pillarSlug === "research") {
    return ko
      ? `${scopeDisclaimer(lang)} Research는 맞춤 engagement로 진행하며, 소비자 조사의 모집·리워드·외부 비용은 별도일 수 있습니다.`
      : `${scopeDisclaimer(lang)} Research remains a custom engagement; consumer research may incur separate recruitment or third-party costs.`;
  }
  return scopeDisclaimer(lang);
}

function patchPriceText(text, slug, lang) {
  if (!text) return text;
  const display = formatPriceDisplay(slug, lang);
  const cfg = SERVICE_PRICING[slug];
  if (!cfg || cfg.custom) return text;
  const krw = formatKrw(cfg.amount);
  return String(text)
    .replace(/₩[\d,]+부터/g, display)
    .replace(/From ₩[\d,]+/gi, display)
    .replace(/Von ₩[\d,]+/gi, display)
    .replace(/Desde ₩[\d,]+/gi, display)
    .replace(/À partir de ₩[\d,]+/gi, display)
    .replace(/₩[\d,]+\s*から/g, display)
    .replace(/₩[\d,]+\s*부터/g, display)
    .replace(/₩[\d,]+\s*से\s*शुरू/g, `${display}`)
    .replace(/₩[\d,]+\s*से/g, `${krw} से`)
    .replace(/Starting from ₩[\d,]+/gi, display)
    .replace(/₩[\d,]+부터 시작/g, `${display} 시작`);
}

function isPriceMetaKey(k) {
  return /PRICE|STARTING|PREIS|PRIX|PRECIO|PREÇO|PRECO|価格|가격|HARGA|कीमत|GIÁ/i.test(String(k || ""));
}

function isTimelineMetaKey(k) {
  return /TIMELINE|ESTIMATED|예상 기간|期間|タイムライン|ZEIT|PLAZO|PRAZO|DÉLAI|DELAI|THỜI|समय|WAKTU/i.test(
    String(k || "")
  );
}

export function applyServiceTimeline(copy, slug, lang = "ko") {
  const timelineCfg = SERVICE_TIMELINES[slug];
  if (!timelineCfg || !copy) return copy;
  const ko = lang === "ko";
  const display = formatTimelineDisplay(slug, lang);
  const label = timelineSectionLabel(lang);

  let meta = copy.meta;
  if (Array.isArray(meta)) {
    const hasTimeline = meta.some((m) => isTimelineMetaKey(m.k));
    meta = meta.map((m) => {
      if (isTimelineMetaKey(m.k)) {
        return { ...m, k: timelineMetaLabel(lang), v: display };
      }
      return m;
    });
    if (!hasTimeline) {
      meta = [...meta, { k: timelineMetaLabel(lang), v: display }];
    }
  }

  const faqs = (copy.faqs || []).map((f) => {
    const q = patchPriceText(f.q, slug, lang);
    let a = patchPriceText(f.a, slug, lang);
    if (isTimelineFaqQuestion(q)) {
      a = serviceTimelineFaqAnswer(slug, lang);
    } else {
      a = patchStaleTimelineText(a, lang);
    }
    return { ...f, q, a };
  });

  return {
    ...copy,
    meta,
    faqs,
    timelines: [{ t: label, d: display }],
    timeLabel: label,
    timeTitle: ko ? "예상 프로젝트 기간" : "Estimated project timeline",
    timeLead: timelineDisclaimer(lang),
    _timelineValue: display,
    _timelineExtraNote: getTimelineExtraNote(slug, lang),
  };
}

export function applyServicePricing(copy, slug, lang = "ko") {
  const cfg = SERVICE_PRICING[slug];
  if (!cfg || !copy) return copy;
  const ko = lang === "ko";
  const display = formatPriceDisplay(slug, lang);
  const basis = getPriceBasis(slug, lang);
  const custom = isCustomQuote(slug);

  let meta = copy.meta;
  if (Array.isArray(meta)) {
    meta = meta.map((m) => {
      if (isPriceMetaKey(m.k) || /₩/.test(String(m.v || ""))) {
        return { ...m, v: display };
      }
      return m;
    });
  }

  const faqs = (copy.faqs || []).map((f) => {
    let q = patchPriceText(f.q, slug, lang);
    let a = patchPriceText(f.a, slug, lang);
    // FAQ questions often hard-code the old starting amount — normalize to canonical KRW.
    if (!custom && cfg.amount != null) {
      q = String(q || "").replace(/₩[\d,]+/g, formatKrw(cfg.amount));
    }
    return { ...f, q, a };
  });

  const extraNote = ko ? cfg.extraNoteKo || "" : cfg.extraNoteEn || "";
  const priceNote = [basis, extraNote].filter(Boolean).join(" ");

  const priced = {
    ...copy,
    meta,
    faqs,
    priceValue: display,
    priceNote,
    priceName: custom ? "PRICE" : copy.priceName,
    priceTitle: ko ? "시작가와 기본 범위" : "Starting price and basic scope",
    priceLabel: "PROJECT SCOPE",
    priceFactorsLabel: ko ? "기본 범위" : "Basic scope",
    _pageLang: lang,
    _pageSlug: slug,
    _pricingCategory: cfg.category,
    _pricingExternalCost: !!cfg.externalCost,
    _pricingExtraNote: ko ? cfg.extraNoteKo || "" : cfg.extraNoteEn || "",
    _pricingCustom: custom,
  };

  return SERVICE_TIMELINES[slug] ? applyServiceTimeline(priced, slug, lang) : priced;
}

export function applyPillarPricing(copy, pillarSlug, lang = "ko") {
  if (!copy) return copy;
  const slugs = PILLAR_SERVICE_SLUGS[pillarSlug] || [];
  const pricing = slugs.map((slug, i) => {
    const cfg = SERVICE_PRICING[slug];
    const name =
      (lang === "ko" ? cfg?.inquiryLabelKo : cfg?.inquiryLabelEn) ||
      slug.toUpperCase().replace(/-/g, " ");
    return { name, price: formatPriceDisplay(slug, lang), svc: i, slug };
  });
  const services = (copy.services || []).map((s, i) => {
    const slug = slugs[i];
    const timeline = formatTimelineDisplay(slug, lang);
    return timeline ? { ...s, timeline } : s;
  });
  let faq = copy.faq;
  if (Array.isArray(faq) && pillarSlug === "build") {
    faq = faq.map((f) => {
      if (isTimelineFaqQuestion(f.q)) {
        return { ...f, a: pillarBuildTimelineFaqAnswer(lang) };
      }
      return { ...f, a: patchStaleTimelineText(f.a, lang) };
    });
  }
  return {
    ...copy,
    _pageLang: lang,
    slug: pillarSlug,
    services,
    faq,
    pricing,
    pricingNote: pillarPricingNote(pillarSlug, lang),
    pricingNoteDefault: scopeDisclaimer(lang),
  };
}

/** JSON-safe map for inquiry form prefill */
export function inquiryPricingJson() {
  const out = {};
  for (const [slug, cfg] of Object.entries(SERVICE_PRICING)) {
    out[slug] = {
      category: cfg.category,
      labelKo: cfg.inquiryLabelKo || slug,
      labelEn: cfg.inquiryLabelEn || slug,
      displayKo: formatPriceDisplay(slug, "ko"),
      displayEn: formatPriceDisplay(slug, "en"),
      timelineKo: formatTimelineDisplay(slug, "ko"),
      timelineEn: formatTimelineDisplay(slug, "en"),
      custom: !!cfg.custom,
      basisKo: cfg.basisKo,
      basisEn: cfg.basisEn,
    };
  }
  return out;
}

const PILLAR_AREA = {
  build: "BUILD",
  automation: "AUTOMATION",
  research: "RESEARCH",
  solutions: "SOLUTIONS",
  design: "DESIGN",
};

/** Canonical select value: "BUILD / MVP", "AUTOMATION / AI Automation", … */
export function businessInquiryOptionValue(slug) {
  const cfg = SERVICE_PRICING[slug];
  if (!cfg?.inquiryLabelEn) return "";
  return `${cfg.category} / ${cfg.inquiryLabelEn}`;
}

/** Human-readable service name for query `service=` (stable EN label). */
export function businessInquiryServiceName(slug) {
  return SERVICE_PRICING[slug]?.inquiryLabelEn || "";
}

export function listBusinessInquirableSlugs() {
  return Object.keys(SERVICE_PRICING);
}

/**
 * Detail-page CTA → /business/inquiry/?category=Business&service&slug&area&source#inquiry
 * @param {string} slug
 * @param {string} relativeBase e.g. "../inquiry/" or "../../inquiry/"
 * @param {{ source?: string }} [opts]
 */
export function businessInquiryHref(slug, relativeBase = "../inquiry/", opts = {}) {
  const cfg = SERVICE_PRICING[slug];
  const params = new URLSearchParams({ category: "Business" });
  if (cfg) {
    params.set("service", cfg.inquiryLabelEn);
    params.set("slug", slug);
    params.set("area", cfg.category);
  }
  if (opts.source) params.set("source", opts.source);
  else if (slug) params.set("source", `/business/${slug}/`);
  return `${relativeBase}?${params.toString()}#inquiry`;
}

/**
 * Pillar CTA — no service preselect.
 * @param {string} pillarSlug build|automation|research|solutions
 */
export function businessPillarInquiryHref(pillarSlug, relativeBase = "../inquiry/", opts = {}) {
  const area = PILLAR_AREA[pillarSlug] || String(pillarSlug || "").toUpperCase();
  const params = new URLSearchParams({ category: "Business", area });
  params.set("source", opts.source || `business-${pillarSlug}-pillar`);
  return `${relativeBase}?${params.toString()}#inquiry`;
}

/** Keys → select option value (includes legacy aliases). */
export function businessInquiryServiceMap() {
  /** @type {Record<string, string>} */
  const map = {};
  for (const slug of listBusinessInquirableSlugs()) {
    const cfg = SERVICE_PRICING[slug];
    const value = businessInquiryOptionValue(slug);
    if (!value) continue;
    map[slug] = value;
    map[cfg.inquiryLabelEn] = value;
    map[cfg.inquiryLabelEn.toLowerCase()] = value;
    map[cfg.inquiryLabelKo] = value;
    map[value] = value;
    map[`${cfg.category} / ${cfg.inquiryLabelEn.toUpperCase()}`] = value;
  }
  // High-level product lines (inquiry UX)
  Object.assign(map, {
    Web: "BUILD / Website Development",
    web: "BUILD / Website Development",
    WEB: "BUILD / Website Development",
    App: "BUILD / App Prototype",
    APP: "BUILD / App Prototype",
    "Internal Tool": "AUTOMATION / Internal Tools",
    "Internal Tools": "AUTOMATION / Internal Tools",
    Internal: "AUTOMATION / Internal Tools",
    Automation: "AUTOMATION / Workflow Automation",
    AUTOMATION: "AUTOMATION / Workflow Automation",
    Design: "DESIGN / Design",
    DESIGN: "DESIGN / Design",
  });
  // Legacy aliases from older CTAs / select values
  Object.assign(map, {
    website: "BUILD / Website Development",
    Website: "BUILD / Website Development",
    WEBSITE: "BUILD / Website Development",
    "BUILD / WEBSITE": "BUILD / Website Development",
    "build-website": "BUILD / Website Development",
    "LANDING PAGE": "BUILD / Landing Page Development",
    "BUILD / LANDING": "BUILD / Landing Page Development",
    "build-landing": "BUILD / Landing Page Development",
    "APP PROTOTYPE": "BUILD / App Prototype",
    "BUILD / APP": "BUILD / App Prototype",
    "build-app": "BUILD / App Prototype",
    MVP: "BUILD / MVP",
    "BUILD / MVP": "BUILD / MVP",
    "build-mvp": "BUILD / MVP",
    AI: "AUTOMATION / AI Automation",
    "AI AUTOMATION": "AUTOMATION / AI Automation",
    "ai-automation": "AUTOMATION / AI Automation",
    "WORKFLOW AUTOMATION": "AUTOMATION / Workflow Automation",
    "AUTOMATION / WORKFLOW AUTOMATION": "AUTOMATION / Workflow Automation",
    "automation-workflow": "AUTOMATION / Workflow Automation",
    "INTERNAL TOOLS": "AUTOMATION / Internal Tools",
    "AUTOMATION / INTERNAL TOOLS": "AUTOMATION / Internal Tools",
    "automation-internal-tools": "AUTOMATION / Internal Tools",
    "DATA & REPORTING": "AUTOMATION / Data & Reporting",
    "AUTOMATION / DATA & REPORTING": "AUTOMATION / Data & Reporting",
    "automation-data-reporting": "AUTOMATION / Data & Reporting",
    "MARKET RESEARCH": "RESEARCH / Market Research",
    "RESEARCH / MARKET RESEARCH": "RESEARCH / Market Research",
    "COMPETITOR ANALYSIS": "RESEARCH / Competitor Analysis",
    "RESEARCH / COMPETITOR ANALYSIS": "RESEARCH / Competitor Analysis",
    "CONSUMER RESEARCH": "RESEARCH / Consumer Research",
    "RESEARCH / CONSUMER RESEARCH": "RESEARCH / Consumer Research",
    "UX AUDIT / RESEARCH": "RESEARCH / UX Audit",
    "RESEARCH / UX AUDIT": "RESEARCH / UX Audit",
    "TREND RESEARCH": "RESEARCH / Trend Research",
    "RESEARCH / TREND RESEARCH": "RESEARCH / Trend Research",
    "WHITE-LABEL": "SOLUTIONS / White-label",
    "White-label": "SOLUTIONS / White-label",
    whitelabel: "SOLUTIONS / White-label",
    "CUSTOM PRODUCT": "SOLUTIONS / Custom Product",
    "SOLUTIONS / CUSTOM PRODUCT": "SOLUTIONS / Custom Product",
    "PRODUCT LAUNCH": "SOLUTIONS / Product Launch",
    "SOLUTIONS / PRODUCT LAUNCH": "SOLUTIONS / Product Launch",
    "INTERNAL SYSTEM": "SOLUTIONS / Internal System",
    "SOLUTIONS / INTERNAL SYSTEM": "SOLUTIONS / Internal System",
  });
  return map;
}

/** Primary product lines first, then detailed BUILD + AUTOMATION, then Research/Solutions. */
export function businessInquirySelectOptionsHtml() {
  const productLineOptions = [
    { value: "Web", slug: "web", area: "BUILD" },
    { value: "App", slug: "app", area: "BUILD" },
    { value: "MVP", slug: "mvp", area: "BUILD" },
    { value: "Internal Tool", slug: "internal-tools", area: "AUTOMATION" },
    { value: "Automation", slug: "workflow-automation", area: "AUTOMATION" },
    { value: "Design", slug: "design", area: "DESIGN" },
  ]
    .map((o) => {
      const label = o.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
      return `                <option value="${label}" data-biz-option="1" data-slug="${o.slug}" data-area="${o.area}">${label}</option>`;
    })
    .join("\n");

  const order = [
    ...(PILLAR_SERVICE_SLUGS.build || []),
    ...(PILLAR_SERVICE_SLUGS.automation || []),
    ...(PILLAR_SERVICE_SLUGS.research || []),
    ...(PILLAR_SERVICE_SLUGS.solutions || []),
    "design",
  ];
  const detailed = order
    .map((slug) => {
      const value = businessInquiryOptionValue(slug);
      const cfg = SERVICE_PRICING[slug];
      if (!value || !cfg) return "";
      const label = value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
      return `                <option value="${label}" data-biz-option="1" data-slug="${slug}" data-area="${cfg.category}">${label}</option>`;
    })
    .filter(Boolean)
    .join("\n");

  return `${productLineOptions}\n${detailed}`;
}

/** Inquiry package prices — single source of truth. */
export function businessInquiryPackagePrices(lang = "ko") {
  return {
    landing: formatPriceDisplay("landing", lang),
    web: formatPriceDisplay("web", lang),
    mvp: formatPriceDisplay("mvp", lang),
    custom: lang === "ko" ? "별도 견적" : "Custom quote",
  };
}

/** Legacy exports used by studio hub */
export const BUSINESS_PACKAGES = [
  {
    id: "start",
    nameKey: "studio.pkgStartName",
    descKey: "studio.pkgStartDesc",
    priceKo: formatPriceDisplay("landing", "ko"),
    priceEn: formatPriceDisplay("landing", "en"),
  },
  {
    id: "build",
    nameKey: "studio.pkgBuildName",
    descKey: "studio.pkgBuildDesc",
    priceKo: formatPriceDisplay("web", "ko"),
    priceEn: formatPriceDisplay("web", "en"),
  },
  {
    id: "mvp",
    nameKey: "studio.pkgMvpName",
    descKey: "studio.pkgMvpDesc",
    priceKo: formatPriceDisplay("mvp", "ko"),
    priceEn: formatPriceDisplay("mvp", "en"),
  },
  {
    id: "custom",
    nameKey: "studio.pkgCustomName",
    descKey: "studio.pkgCustomDesc",
    priceKo: "맞춤 견적",
    priceEn: "Custom quote",
  },
];

export const BUSINESS_SERVICES = [
  { id: "mvp", num: "01", titleKey: "studio.svcMvpTitle", descKey: "studio.svcMvpDesc", itemsKey: "studio.svcMvpItems" },
  { id: "website", num: "02", titleKey: "studio.svcWebsiteTitle", descKey: "studio.svcWebsiteDesc", itemsKey: "studio.svcWebsiteItems" },
  { id: "ai", num: "03", titleKey: "studio.svcAiTitle", descKey: "studio.svcAiDesc", itemsKey: "studio.svcAiItems" },
  { id: "app", num: "04", titleKey: "studio.svcAppTitle", descKey: "studio.svcAppDesc", itemsKey: "studio.svcAppItems" },
  { id: "whitelabel", num: "05", titleKey: "studio.svcWhitelabelTitle", descKey: "studio.svcWhitelabelDesc", itemsKey: "studio.svcWhitelabelItems" },
  { id: "improve", num: "06", titleKey: "studio.svcImproveTitle", descKey: "studio.svcImproveDesc", itemsKey: "studio.svcImproveItems" },
  { id: "design", num: "07", titleKey: "studio.svcDesignTitle", descKey: "studio.svcDesignDesc", itemsKey: "studio.svcDesignItems" },
];

/** Editorial HTML for Business hub product matrix (reuses bp-* classes). */
export function businessProductMatrixHtml(lang = "en") {
  const ko = lang === "ko";
  const title = ko ? "기본 시작가" : "Starting engagement";
  const lead = ko
    ? "필요한 문제에서 시작하는 기본 시작가와 예상 기간입니다. 최종 견적은 범위 확인 후 안내합니다."
    : "Starting prices and timelines for common engagements. Final quotes follow scope review.";
  const note = scopeDisclaimer(lang);
  const rows = BUSINESS_PRODUCT_LINES.map((line, i) => {
    const name = ko ? line.nameKo : line.nameEn;
    const price = ko ? line.priceShortKo : line.priceShortEn;
    const time = ko ? line.timelineShortKo : line.timelineShortEn;
    return `<a class="bp-other__card" href="${escapeAttr(line.href)}">
      <span class="bp-other__top">
        <span class="bp-other__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="bp-other__arrow" aria-hidden="true">→</span>
      </span>
      <span class="bp-other__t">${escapeAttr(name)}</span>
      <span class="bp-other__lead">${escapeAttr(price)} · ${escapeAttr(time)}</span>
    </a>`;
  }).join("");

  return `<section class="bp-sec bp-other bz-product-matrix" data-bp-reveal aria-labelledby="bz-product-matrix-label">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label" id="bz-product-matrix-label">${escapeAttr(title)}</p>
      <p class="bp-lead" style="margin-top:0.75rem;max-width:36rem">${escapeAttr(lead)}</p>
    </header>
    <nav class="bp-other__grid" aria-label="${escapeAttr(title)}">${rows}</nav>
    <p class="bp-note" style="margin-top:1.25rem">${escapeAttr(note)}</p>
  </div>
</section>`;
}

function escapeAttr(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}
