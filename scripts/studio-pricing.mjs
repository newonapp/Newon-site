/**
 * Studio service pricing — single source of truth.
 * Amounts are KRW starting prices (same numbers all locales; no FX).
 * Aligns with Business: startingAt / From ₩…; no mixed VAT labels.
 */
import { formatKrw } from "./business-pricing.mjs";

/** @typedef {'startingAt'|'customQuote'|'comingSoon'|'internal'} StudioPricingType */

/**
 * @type {Record<string, {
 *   category: 'brand'|'digital'|'content'|'ip',
 *   index: number,
 *   serviceName: string,
 *   serviceNameKo: string,
 *   startingPrice: number|null,
 *   pricingType: StudioPricingType,
 *   timelineKo: string,
 *   timelineEn: string,
 *   status?: string,
 *   designOnly?: boolean,
 *   inquiryService: string,
 * }>}
 */
export const STUDIO_SERVICE_PRICING = {
  "brand-strategy": {
    category: "brand",
    index: 0,
    serviceName: "Brand Strategy",
    serviceNameKo: "브랜드 전략",
    startingPrice: 400000,
    pricingType: "startingAt",
    timelineKo: "1–3주",
    timelineEn: "1–3 weeks",
    inquiryService: "Brand Strategy",
    detailSegment: "strategy",
  },
  naming: {
    category: "brand",
    index: 1,
    serviceName: "Naming",
    serviceNameKo: "네이밍",
    startingPrice: 300000,
    pricingType: "startingAt",
    timelineKo: "1–2주",
    timelineEn: "1–2 weeks",
    inquiryService: "Naming",
    detailSegment: "naming",
  },
  identity: {
    category: "brand",
    index: 2,
    serviceName: "Identity",
    serviceNameKo: "아이덴티티",
    startingPrice: 600000,
    pricingType: "startingAt",
    timelineKo: "2–4주",
    timelineEn: "2–4 weeks",
    inquiryService: "Identity",
    detailSegment: "identity",
  },
  "logo-design": {
    category: "brand",
    index: 3,
    serviceName: "Logo Design",
    serviceNameKo: "로고 디자인",
    startingPrice: 400000,
    pricingType: "startingAt",
    timelineKo: "2–3주",
    timelineEn: "2–3 weeks",
    inquiryService: "Logo Design",
    detailSegment: "logo",
  },
  "web-design": {
    category: "digital",
    index: 0,
    serviceName: "Web Design",
    serviceNameKo: "웹 디자인",
    startingPrice: 600000,
    pricingType: "startingAt",
    timelineKo: "2–5주",
    timelineEn: "2–5 weeks",
    designOnly: true,
    inquiryService: "Web Design",
    detailSegment: "web-design",
  },
  "app-ui-ux": {
    category: "digital",
    index: 1,
    serviceName: "App UI/UX",
    serviceNameKo: "앱 UI/UX",
    startingPrice: 800000,
    pricingType: "startingAt",
    timelineKo: "3–6주",
    timelineEn: "3–6 weeks",
    designOnly: true,
    inquiryService: "App UI/UX",
    detailSegment: "app-ui-ux",
  },
  "landing-page-design": {
    category: "digital",
    index: 2,
    serviceName: "Landing Page Design",
    serviceNameKo: "랜딩페이지 디자인",
    startingPrice: 400000,
    pricingType: "startingAt",
    timelineKo: "1–3주",
    timelineEn: "1–3 weeks",
    designOnly: true,
    inquiryService: "Landing Page Design",
    detailSegment: "landing",
  },
  "product-design": {
    category: "digital",
    index: 3,
    serviceName: "Product Design",
    serviceNameKo: "제품 디자인",
    startingPrice: 1200000,
    pricingType: "startingAt",
    timelineKo: "4–8주",
    timelineEn: "4–8 weeks",
    designOnly: true,
    inquiryService: "Product Design",
    detailSegment: "product-design",
  },
  "social-content": {
    category: "content",
    index: 0,
    serviceName: "Social Content",
    serviceNameKo: "소셜 콘텐츠",
    startingPrice: 300000,
    pricingType: "startingAt",
    timelineKo: "1–3주",
    timelineEn: "1–3 weeks",
    inquiryService: "Social Content",
    detailSegment: "social",
  },
  campaign: {
    category: "content",
    index: 1,
    serviceName: "Campaign",
    serviceNameKo: "캠페인",
    startingPrice: 500000,
    pricingType: "startingAt",
    timelineKo: "2–4주",
    timelineEn: "2–4 weeks",
    inquiryService: "Campaign",
    detailSegment: "campaign",
  },
  "visual-content": {
    category: "content",
    index: 2,
    serviceName: "Visual Content",
    serviceNameKo: "비주얼 콘텐츠",
    startingPrice: 300000,
    pricingType: "startingAt",
    timelineKo: "1–3주",
    timelineEn: "1–3 weeks",
    inquiryService: "Visual Content",
    detailSegment: "visual",
  },
  "character-lab": {
    category: "ip",
    index: 0,
    serviceName: "Character Lab",
    serviceNameKo: "Character Lab",
    startingPrice: 500000,
    pricingType: "startingAt",
    timelineKo: "2–4주",
    timelineEn: "2–4 weeks",
    status: "EXPERIMENTAL",
    inquiryService: "Character Lab",
    detailSegment: "character-lab",
  },
  "digital-stickers": {
    category: "ip",
    index: 1,
    serviceName: "Digital Stickers",
    serviceNameKo: "Digital Stickers",
    startingPrice: null,
    pricingType: "comingSoon",
    timelineKo: "",
    timelineEn: "",
    status: "COMING_SOON",
    inquiryService: "Digital Stickers",
    detailSegment: "digital-stickers",
  },
  "newon-character": {
    category: "ip",
    index: 2,
    serviceName: "Newon Character",
    serviceNameKo: "Newon Character",
    startingPrice: null,
    pricingType: "internal",
    timelineKo: "",
    timelineEn: "",
    status: "BUILDING",
    inquiryService: "Newon Character",
    detailSegment: "newon-character",
  },
  "experimental-ip": {
    category: "ip",
    index: 3,
    serviceName: "Experimental IP",
    serviceNameKo: "Experimental IP",
    startingPrice: null,
    pricingType: "customQuote",
    timelineKo: "",
    timelineEn: "",
    status: "EXPLORING",
    inquiryService: "Experimental IP",
    detailSegment: "experimental-ip",
  },
};

export function studioServicePagePath(slug) {
  const cfg = STUDIO_SERVICE_PRICING[slug];
  if (!cfg?.detailSegment) return "";
  return `studio/${cfg.category}/${cfg.detailSegment}`;
}

export function studioServiceDetailHrefFromPillar(slug) {
  const cfg = STUDIO_SERVICE_PRICING[slug];
  if (!cfg?.detailSegment) return "";
  return `${cfg.detailSegment}/`;
}

/** Ordered slugs per Studio pillar (matches service card order). */
export const STUDIO_PILLAR_SERVICE_SLUGS = {
  brand: ["brand-strategy", "naming", "identity", "logo-design"],
  digital: ["web-design", "app-ui-ux", "landing-page-design", "product-design"],
  content: ["social-content", "campaign", "visual-content"],
  ip: ["character-lab", "digital-stickers", "newon-character", "experimental-ip"],
};

export function formatStudioPriceDisplay(slug, lang = "ko") {
  const cfg = STUDIO_SERVICE_PRICING[slug];
  if (!cfg) return "";
  if (cfg.pricingType === "comingSoon" || cfg.pricingType === "internal") return "";
  if (cfg.pricingType === "customQuote" || cfg.startingPrice == null) {
    return lang === "ko" ? "별도 견적" : "Custom Quote";
  }
  const krw = formatKrw(cfg.startingPrice);
  return lang === "ko" ? `${krw}부터` : `From ${krw}`;
}

export function formatStudioTimelineDisplay(slug, lang = "ko") {
  const cfg = STUDIO_SERVICE_PRICING[slug];
  if (!cfg) return "";
  return lang === "ko" ? cfg.timelineKo : cfg.timelineEn;
}

export function studioScopeDisclaimer(lang = "ko") {
  return lang === "ko"
    ? "표시된 금액은 기본 범위 기준 시작가입니다. 프로젝트 규모, 제작 범위, 결과물 수 및 요구사항에 따라 최종 견적이 달라질 수 있습니다."
    : "Listed amounts are starting prices for a basic scope. Final quotes may vary with project scale, production scope, deliverable count, and requirements.";
}

export function studioDigitalPricingNote(lang = "ko") {
  const base = studioScopeDisclaimer(lang);
  if (lang === "ko") {
    return `${base} DIGITAL 가격은 디자인(Design Only) 비용입니다. 실제 웹·앱 개발이 필요한 프로젝트는 Newon Business BUILD와 연계하여 별도 견적을 제공합니다.`;
  }
  return `${base} DIGITAL prices are design-only. Projects that need implementation are quoted separately through Newon Business BUILD.`;
}

export function studioContentPricingNote(lang = "ko") {
  const base = studioScopeDisclaimer(lang);
  if (lang === "ko") {
    return `${base} 소셜 콘텐츠 시작가는 기본 콘텐츠 방향과 제한된 범위의 디자인 제작 기준입니다. 월간 SNS 운영대행 전체가 포함되지 않으며, 지속 월 운영은 별도 견적입니다.`;
  }
  return `${base} Social Content starting price covers content direction plus a limited design set — not full monthly social ops. Ongoing monthly management is quoted separately.`;
}

export function studioPillarPricingNote(pillarSlug, lang = "ko") {
  if (pillarSlug === "digital") return studioDigitalPricingNote(lang);
  if (pillarSlug === "content") return studioContentPricingNote(lang);
  return studioScopeDisclaimer(lang);
}

export function studioInquiryHref(slug, relativeBase = "../../business/inquiry/") {
  const cfg = STUDIO_SERVICE_PRICING[slug];
  if (!cfg) return `${relativeBase}#inquiry`;
  const params = new URLSearchParams({
    category: "Studio",
    service: cfg.inquiryService,
  });
  return `${relativeBase}?${params.toString()}#inquiry`;
}

export function studioInquiryOptionValue(slug) {
  const cfg = STUDIO_SERVICE_PRICING[slug];
  if (!cfg) return "";
  return `Studio / ${cfg.inquiryService}`;
}

/** Map used by inquiry form preselect (keys → select option value). */
export function studioInquiryServiceMap() {
  /** @type {Record<string, string>} */
  const map = {};
  for (const [slug, cfg] of Object.entries(STUDIO_SERVICE_PRICING)) {
    const value = studioInquiryOptionValue(slug);
    map[slug] = value;
    map[cfg.inquiryService] = value;
    map[cfg.inquiryService.toLowerCase()] = value;
    map[cfg.serviceNameKo] = value;
    map[`studio-${slug}`] = value;
  }
  map.Studio = "Studio / Brand Strategy";
  map.studio = "Studio / Brand Strategy";
  return map;
}

export function applyStudioPillarPricing(copy, pillarSlug, lang = "ko") {
  if (!copy) return copy;
  const slugs = STUDIO_PILLAR_SERVICE_SLUGS[pillarSlug] || [];
  const pageLang = lang === "ko" ? "ko" : "en";

  const pricing = slugs
    .map((slug, i) => {
      const price = formatStudioPriceDisplay(slug, pageLang);
      if (!price) return null;
      const cfg = STUDIO_SERVICE_PRICING[slug];
      return {
        name: cfg?.serviceName || slug,
        price,
        svc: i,
        slug,
        pricingType: cfg?.pricingType,
      };
    })
    .filter(Boolean);

  const services = (copy.services || []).map((s, i) => {
    const slug = slugs[i];
    const cfg = slug ? STUDIO_SERVICE_PRICING[slug] : null;
    if (!cfg) return { ...s };
    const timeline = formatStudioTimelineDisplay(slug, pageLang);
    const inquiryHref = studioInquiryHref(slug);
    const next = { ...s, inquiryHref, _studioSlug: slug };

    if (timeline) next.timeline = timeline;

    if (cfg.designOnly) {
      const designTag = "Design Only";
      if (next.included && !/Design Only/i.test(next.included)) {
        next.included = `${designTag} · ${next.included}`;
      }
    }

    const detailHref = studioServiceDetailHrefFromPillar(slug);
    if (detailHref) {
      next.href = detailHref;
      next.detailCta = pageLang === "ko" ? "자세히 보기 →" : "View details →";
    }

    if (cfg.pricingType === "comingSoon" || cfg.pricingType === "internal") {
      next.inquiryHref = null;
    }

    return next;
  });

  return {
    ...copy,
    _pageLang: pageLang,
    slug: pillarSlug,
    services,
    pricing,
    startingAt: pageLang === "ko" ? "시작가" : "STARTING AT",
    pricingNote: studioPillarPricingNote(pillarSlug, pageLang),
    pricingNoteDefault: studioScopeDisclaimer(pageLang),
  };
}
