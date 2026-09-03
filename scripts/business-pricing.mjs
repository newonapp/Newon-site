/**
 * Business service pricing — single source of truth.
 * Amounts are KRW starting prices; final quotes vary by scope.
 */

export const PRICING_CATEGORIES = {
  BUILD: "BUILD",
  AUTOMATION: "AUTOMATION",
  RESEARCH: "RESEARCH",
  SOLUTIONS: "SOLUTIONS",
};

/**
 * Estimated project timelines — same slugs as SERVICE_PRICING.
 * Ranges include communication, feedback, revisions, QA, and deploy (not dev-only minimums).
 */
export const SERVICE_TIMELINES = {
  landing: { timelineKo: "1–2주", timelineEn: "1–2 weeks" },
  web: { timelineKo: "2–4주", timelineEn: "2–4 weeks" },
  app: { timelineKo: "1–3주", timelineEn: "1–3 weeks" },
  mvp: {
    timelineKo: "4–8주",
    timelineEn: "4–8 weeks",
    timelineExtraNoteKo:
      "앱스토어 또는 외부 플랫폼 심사가 필요한 경우 심사 기간은 프로젝트 일정과 별도로 추가될 수 있습니다.",
    timelineExtraNoteEn:
      "If app store or external platform review is required, review time may add to the project schedule separately.",
  },
  "ai-automation": {
    timelineKo: "2–6주",
    timelineEn: "2–6 weeks",
    timelineExtraNoteKo:
      "외부 API 및 SaaS의 기술 환경과 접근 권한에 따라 연동 및 테스트 일정이 달라질 수 있습니다.",
    timelineExtraNoteEn:
      "Integration and testing schedules may vary with third-party API/SaaS access and technical environment.",
  },
  "workflow-automation": {
    timelineKo: "2–6주",
    timelineEn: "2–6 weeks",
    timelineExtraNoteKo:
      "외부 API 및 SaaS의 기술 환경과 접근 권한에 따라 연동 및 테스트 일정이 달라질 수 있습니다.",
    timelineExtraNoteEn:
      "Integration and testing schedules may vary with third-party API/SaaS access and technical environment.",
  },
  "data-reporting": {
    timelineKo: "2–5주",
    timelineEn: "2–5 weeks",
    timelineExtraNoteKo:
      "외부 API 및 SaaS의 기술 환경과 접근 권한에 따라 연동 및 테스트 일정이 달라질 수 있습니다.",
    timelineExtraNoteEn:
      "Integration and testing schedules may vary with third-party API/SaaS access and technical environment.",
  },
  "internal-tools": { timelineKo: "4–8주", timelineEn: "4–8 weeks" },
  "market-research": { timelineKo: "1–2주", timelineEn: "1–2 weeks" },
  "competitor-analysis": { timelineKo: "1–2주", timelineEn: "1–2 weeks" },
  "consumer-research": {
    timelineKo: "2–4주",
    timelineEn: "2–4 weeks",
    timelineExtraNoteKo:
      "설문·인터뷰 및 참여자 모집이 포함되는 경우 모집 일정에 따라 전체 기간이 달라질 수 있습니다.",
    timelineExtraNoteEn:
      "If surveys, interviews, or participant recruitment are included, the overall timeline may shift with recruitment.",
  },
  "ux-audit": { timelineKo: "1–3주", timelineEn: "1–3 weeks" },
  "trend-research": { timelineKo: "1–2주", timelineEn: "1–2 weeks" },
  "white-label": {
    timelineKo: "6–12주+",
    timelineEn: "6–12 weeks+",
    timelineExtraNoteKo: "요구사항 확인 후 프로젝트 범위와 상세 일정을 별도로 확정합니다.",
    timelineExtraNoteEn: "We confirm project scope and a detailed schedule after reviewing requirements.",
  },
  "custom-product": {
    timelineKo: "6–12주+",
    timelineEn: "6–12 weeks+",
    timelineExtraNoteKo: "요구사항 확인 후 프로젝트 범위와 상세 일정을 별도로 확정합니다.",
    timelineExtraNoteEn: "We confirm project scope and a detailed schedule after reviewing requirements.",
  },
  "product-launch": { timelineKo: "3–6주", timelineEn: "3–6 weeks" },
  "internal-system": {
    timelineKo: "8–16주+",
    timelineEn: "8–16 weeks+",
    timelineExtraNoteKo: "요구사항 확인 후 프로젝트 범위와 상세 일정을 별도로 확정합니다.",
    timelineExtraNoteEn: "We confirm project scope and a detailed schedule after reviewing requirements.",
  },
};

/** @type {Record<string, { amount?: number, custom?: boolean, category: string, externalCost?: boolean, basisKo: string, basisEn: string, extraNoteKo?: string, extraNoteEn?: string, inquiryLabelKo?: string, inquiryLabelEn?: string }>} */
export const SERVICE_PRICING = {
  landing: {
    amount: 500000,
    category: PRICING_CATEGORIES.BUILD,
    basisKo: "기본 단일 랜딩페이지 제작 기준",
    basisEn: "Starting point for a single landing page",
    inquiryLabelKo: "Landing Page Development",
    inquiryLabelEn: "Landing Page Development",
  },
  web: {
    amount: 800000,
    category: PRICING_CATEGORIES.BUILD,
    basisKo: "소규모 기업·브랜드 웹사이트 기준",
    basisEn: "Starting point for a small company or brand website",
    inquiryLabelKo: "Website Development",
    inquiryLabelEn: "Website Development",
  },
  app: {
    amount: 600000,
    category: PRICING_CATEGORIES.BUILD,
    basisKo: "핵심 사용자 흐름과 주요 화면 Prototype 기준",
    basisEn: "Starting point for core user flows and key prototype screens",
    extraNoteKo:
      "시작가는 Prototype 기준입니다. Backend·결제·스토어 출시 등 상위 범위는 프로젝트에 따라 별도 견적입니다.",
    extraNoteEn:
      "Starting price covers Prototype scope. Backend, payments, store release, and broader scopes are quoted separately by project.",
    inquiryLabelKo: "App Prototype",
    inquiryLabelEn: "App Prototype",
  },
  mvp: {
    amount: 1500000,
    category: PRICING_CATEGORIES.BUILD,
    basisKo: "핵심 기능을 검증하는 초기 제품 기준",
    basisEn: "Starting point for an initial product focused on core validation",
    inquiryLabelKo: "MVP",
    inquiryLabelEn: "MVP",
  },
  "ai-automation": {
    amount: 800000,
    category: PRICING_CATEGORIES.AUTOMATION,
    externalCost: true,
    basisKo: "하나의 핵심 AI 업무 자동화 기준",
    basisEn: "Starting point for one core AI workflow automation",
    inquiryLabelKo: "AI Automation",
    inquiryLabelEn: "AI Automation",
  },
  "workflow-automation": {
    amount: 1000000,
    category: PRICING_CATEGORIES.AUTOMATION,
    externalCost: true,
    basisKo: "하나의 핵심 Workflow 및 기본 서비스 연동 기준",
    basisEn: "Starting point for one core workflow with basic integrations",
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
    basisKo: "하나의 핵심 내부 업무를 위한 소규모 Tool 기준",
    basisEn: "Starting point for one core internal ops tool",
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
    custom: true,
    category: PRICING_CATEGORIES.SOLUTIONS,
    basisKo: "프로젝트의 기능, 규모, 기술 환경과 운영 요구사항을 확인한 후 견적을 안내합니다.",
    basisEn:
      "We provide a quote after reviewing features, scale, technical environment, and operational requirements.",
    inquiryLabelKo: "Internal System",
    inquiryLabelEn: "Internal System",
  },
};

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
    ? "표시된 기간은 기본 프로젝트 범위 기준 예상 기간입니다. 기능 및 화면 수, 외부 서비스 연동, 프로젝트 규모, 자료 전달 및 피드백 일정에 따라 달라질 수 있습니다."
    : "The timeline shown is an estimated range for a basic project scope. It may change with feature and screen count, third-party integrations, project scale, and how quickly materials and feedback are provided.";
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
    return `기본 범위 기준 예상 기간은 ${display}입니다. 기능·화면 수, 연동, 자료 전달 및 피드백 일정에 따라 달라질 수 있습니다.`;
  }
  return `The estimated timeline for a basic scope is ${display}. It may vary with features, screens, integrations, and feedback timing.`;
}

function pillarBuildTimelineFaqAnswer(lang = "ko") {
  if (lang === "ko") {
    return "랜딩 1–2주, 웹사이트 2–4주, 앱 프로토타입 1–3주, MVP 4–8주가 일반적인 예상 기간입니다. 표시된 기간은 기본 범위 기준이며, 요구사항 확인 후 상세 일정을 함께 정합니다.";
  }
  return "Typical estimated timelines: landing 1–2 weeks, website 2–4 weeks, app prototype 1–3 weeks, MVP 4–8 weeks. Ranges reflect a basic scope; we confirm a detailed schedule after reviewing requirements.";
}

function patchStaleTimelineText(text, lang = "ko") {
  if (!text) return text;
  let out = String(text);
  if (lang === "ko") {
    out = out
      .replace(/보통\s*/g, "")
      .replace(/약\s*/g, "")
      .replace(/범위에 따라 상이/g, "")
      .replace(/ · 범위별 상이/g, "")
      .replace(/3–6주/g, "4–8주")
      .replace(/2–5주/g, "2–4주");
  } else {
    out = out
      .replace(/Typically\s*/gi, "")
      .replace(/About\s*/gi, "")
      .replace(/depending on scope\.?/gi, "")
      .replace(/3–6 weeks/gi, "4–8 weeks")
      .replace(/2–5 weeks/gi, "2–4 weeks");
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
    ? "표시된 금액은 기본 범위 기준 시작가입니다. 기능, 화면 수, 데이터 구조, 외부 서비스 연동, 프로젝트 일정 및 작업 범위에 따라 최종 견적이 달라질 수 있습니다."
    : "Listed amounts are starting prices for a basic scope. Final quotes vary with features, screens, data structure, integrations, timeline, and project scope.";
}

export function externalCostDisclaimer(lang = "ko") {
  return lang === "ko"
    ? "AI API, 외부 API, SaaS, 서버, 데이터베이스, 클라우드 및 기타 제3자 서비스 이용료는 별도로 발생할 수 있습니다."
    : "AI APIs, external APIs, SaaS, servers, databases, cloud, and other third-party service fees may apply separately.";
}

export function inquiryStartingPriceNote(lang = "ko") {
  return lang === "ko"
    ? "표시된 시작가는 기본 범위 기준이며, 요구사항 확인 후 최종 견적을 안내합니다."
    : "The starting price shown reflects a basic scope. We confirm the final quote after reviewing your requirements.";
}

export function pillarPricingNote(pillarSlug, lang = "ko") {
  const ko = lang === "ko";
  if (pillarSlug === "automation") {
    return `${scopeDisclaimer(lang)} ${externalCostDisclaimer(lang)}`.trim();
  }
  if (pillarSlug === "research") {
    return ko
      ? `${scopeDisclaimer(lang)} 소비자 조사의 설문·인터뷰 참가자 모집, 리워드 및 외부 조사 비용은 별도로 발생할 수 있습니다.`
      : `${scopeDisclaimer(lang)} Consumer research may incur separate costs for recruitment, incentives, and third-party research.`;
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
    .replace(/From ₩[\d,]+/g, display)
    .replace(/₩[\d,]+은/g, `${krw}은`)
    .replace(/₩[\d,]+은/g, `${krw}은`)
    .replace(/Starting from ₩[\d,]+/g, display)
    .replace(/₩[\d,]+부터 시작/g, `${display} 시작`)
    .replace(/₩[\d,]+부터/g, display);
}

export function applyServiceTimeline(copy, slug, lang = "ko") {
  const timelineCfg = SERVICE_TIMELINES[slug];
  if (!timelineCfg || !copy) return copy;
  const ko = lang === "ko";
  const display = formatTimelineDisplay(slug, lang);
  const label = timelineSectionLabel(lang);

  let meta = copy.meta;
  if (Array.isArray(meta)) {
    const hasTimeline = meta.some((m) => /TIMELINE|예상 기간|ESTIMATED/i.test(String(m.k || "")));
    meta = meta.map((m) => {
      const k = String(m.k || "").toUpperCase();
      if (k === "TIMELINE" || k === "ESTIMATED TIMELINE" || k === "예상 기간") {
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
    timeLead: "",
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
      const k = String(m.k || "").toUpperCase();
      if (k === "PRICE" || k === "STARTING AT") return { ...m, k: "PRICE", v: display };
      return m;
    });
  }

  const faqs = (copy.faqs || []).map((f) => ({
    ...f,
    q: patchPriceText(f.q, slug, lang),
    a: patchPriceText(f.a, slug, lang),
  }));

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
    App: "BUILD / App Prototype",
    MVP: "BUILD / MVP",
    "BUILD / MVP": "BUILD / MVP",
    "build-mvp": "BUILD / MVP",
    AI: "AUTOMATION / AI Automation",
    "AI AUTOMATION": "AUTOMATION / AI Automation",
    "ai-automation": "AUTOMATION / AI Automation",
    Automation: "AUTOMATION / Workflow Automation",
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

/** Primary BUILD + AUTOMATION options first, then Research/Solutions. */
export function businessInquirySelectOptionsHtml() {
  const order = [
    ...(PILLAR_SERVICE_SLUGS.build || []),
    ...(PILLAR_SERVICE_SLUGS.automation || []),
    ...(PILLAR_SERVICE_SLUGS.research || []),
    ...(PILLAR_SERVICE_SLUGS.solutions || []),
  ];
  return order
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
