/**
 * Newon Insights — published articles / reports registry.
 * No fake research as published. Empty or Coming Soon placeholders only.
 */

/** @typedef {'TECH'|'AI'|'PRODUCT'|'CONSUMER'|'STARTUP'|'MARKET'} InsightCategory */
/** @typedef {'ARTICLE'|'DATA'|'REPORT'|'CUSTOM_RESEARCH'} InsightType */
/** @typedef {'published'|'building'|'coming_soon'|'draft'} InsightStatus */

export const INSIGHT_CATEGORIES = ["TECH", "AI", "PRODUCT", "CONSUMER", "STARTUP", "MARKET"];

export const INSIGHT_TYPES = ["ARTICLE", "DATA", "REPORT", "CUSTOM_RESEARCH"];

/**
 * Published = status === "published" only.
 * Placeholder below is Building / Coming Soon — not a real report.
 * @type {Array<object>}
 */
export const INSIGHT_ARTICLES = [
  {
    id: "insights-hub-building",
    slug: "building",
    titleKo: "Insights hub — Building",
    titleEn: "Insights hub — Building",
    descKo: "제품·소비자·시장 관찰을 정리하는 공간입니다. 발행된 리포트는 아직 없습니다.",
    descEn: "A space for product, consumer, and market observations. No published reports yet.",
    category: "PRODUCT",
    type: "ARTICLE",
    status: "coming_soon",
    publishedAt: null,
    featured: false,
  },
];

export function getInsightArticles() {
  return INSIGHT_ARTICLES.slice();
}

/** Real published pieces only — empty until content ships. */
export function getPublishedInsights() {
  return INSIGHT_ARTICLES.filter((a) => a && a.status === "published");
}

export function getInsight(slug) {
  return INSIGHT_ARTICLES.find((a) => a.slug === slug) || null;
}

export function getInsightCategoryCounts() {
  const counts = Object.fromEntries(INSIGHT_CATEGORIES.map((c) => [c, 0]));
  for (const a of getPublishedInsights()) {
    const cat = String(a.category || "").toUpperCase();
    if (counts[cat] != null) counts[cat] += 1;
  }
  return counts;
}
