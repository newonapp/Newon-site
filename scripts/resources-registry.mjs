/**
 * Unified Newon Resources registry — single source for Home, Featured, Latest, Popular, Search, Related.
 */

import {
  STORE_PRODUCTS,
  MEDIA_ITEMS,
  NEWSLETTER_ISSUES,
  EDUCATION_TOPICS,
} from "./resources-data.mjs";
import { getPublishedInsights } from "./insights-data.mjs";
import { getLabsExperiments } from "./lab-experiments.mjs";
import { loadPublishedBlogRegistry } from "./blog-data.mjs";

function sortKey(isoOrMonth) {
  const s = String(isoOrMonth || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  return "";
}

function normalizeStore(item, lang) {
  const isKo = lang === "ko";
  return {
    id: item.id || item.slug,
    slug: item.slug,
    type: "store",
    category: item.category || "templates",
    title: isKo ? item.titleKo : item.titleEn,
    titleKo: item.titleKo,
    titleEn: item.titleEn,
    description: isKo ? item.descKo : item.descEn,
    descKo: item.descKo,
    descEn: item.descEn,
    date: item.updated || null,
    updatedAt: sortKey(item.updated) || null,
    status: item.status || "building",
    featured: !!item.featured,
    tags: [item.category, item.type, "store"].filter(Boolean),
    url: `store/${item.slug}/`,
    format: item.type || "kit",
    price: item.price,
    buyable: !!item.buyable,
    relatedProducts: [],
    relatedResources: [],
    cta: isKo ? "상품 보기 ↗" : "View product ↗",
    locale: item.locale || "all",
  };
}

function normalizeLab(item, lang) {
  const isKo = lang === "ko";
  return {
    id: item.experimentId || item.id || item.slug,
    slug: item.slug,
    type: "labs",
    category: String(item.category || "experiment").toLowerCase(),
    title: isKo ? item.titleKo : item.titleEn,
    titleKo: item.titleKo,
    titleEn: item.titleEn,
    description: isKo ? item.descKo || item.listDescKo : item.descEn || item.listDescEn,
    descKo: item.descKo || item.listDescKo,
    descEn: item.descEn || item.listDescEn,
    date: item.updatedAt || null,
    updatedAt: item.updatedAt || null,
    status: item.status || "RESEARCH",
    featured: item.featured !== false,
    tags: ["experiment", item.category, "labs"].filter(Boolean),
    url: `labs/${item.slug}/`,
    relatedProducts: item.relatedProduct ? [item.relatedProduct.slug || item.relatedProduct.id].filter(Boolean) : [],
    relatedResources: [],
    cta: isKo ? "실험 보기 ↗" : "View experiment ↗",
    locale: "all",
  };
}

function normalizeInsight(item, lang) {
  const isKo = lang === "ko";
  return {
    id: item.id || item.slug,
    slug: item.slug,
    type: "insights",
    category: String(item.category || "PRODUCT").toLowerCase(),
    title: isKo ? item.titleKo : item.titleEn,
    titleKo: item.titleKo,
    titleEn: item.titleEn,
    description: isKo ? item.descKo : item.descEn,
    descKo: item.descKo,
    descEn: item.descEn,
    date: item.publishedAt || null,
    updatedAt: item.publishedAt || null,
    status: item.status || "published",
    featured: !!item.featured,
    tags: [item.category, item.type, "insights"].filter(Boolean),
    url: `insights/${item.slug}/`,
    relatedProducts: [],
    relatedResources: [],
    cta: isKo ? "리포트 읽기 ↗" : "Read report ↗",
    locale: "all",
  };
}

function normalizeBlog(item, lang) {
  const isKo = lang === "ko";
  return {
    id: item.id || `blog-${item.slug}`,
    slug: item.slug,
    type: "blog",
    category: String(item.category || "product").toLowerCase(),
    title: isKo ? item.titleKo || item.title : item.titleEn || item.title,
    titleKo: item.titleKo || item.title,
    titleEn: item.titleEn || item.title,
    description: isKo ? item.descKo || item.description : item.descEn || item.description,
    descKo: item.descKo || item.description,
    descEn: item.descEn || item.description,
    date: item.date || null,
    updatedAt: item.updatedAt || item.date || null,
    status: "published",
    featured: !!item.featured,
    tags: [...(item.tags || []), "blog"],
    url: `blog/${item.slug}/`,
    relatedProducts: [],
    relatedResources: [],
    cta: isKo ? "글 읽기 ↗" : "Read article ↗",
    locale: item.locale || "all",
  };
}

function normalizeMedia(item, lang) {
  const isKo = lang === "ko";
  return {
    id: item.id || item.slug,
    slug: item.slug,
    type: "media",
    category: String(item.category || "update").toLowerCase(),
    title: isKo ? item.titleKo : item.titleEn,
    titleKo: item.titleKo,
    titleEn: item.titleEn,
    description: isKo ? item.descKo : item.descEn,
    descKo: item.descKo,
    descEn: item.descEn,
    date: item.publishedAt || item.date || null,
    updatedAt: item.updatedAt || item.publishedAt || null,
    status: item.status || "published",
    featured: !!item.featured,
    tags: [item.category, "media"].filter(Boolean),
    url: `media/${item.slug}/`,
    relatedProducts: item.relatedProducts || [],
    relatedResources: [],
    cta: isKo ? "콘텐츠 보기 ↗" : "View media ↗",
    locale: "all",
  };
}

function normalizeNote(item, lang) {
  const isKo = lang === "ko";
  return {
    id: item.id || item.slug,
    slug: item.slug,
    type: "newsletter",
    category: item.category || "build-log",
    title: isKo ? item.titleKo : item.titleEn,
    titleKo: item.titleKo,
    titleEn: item.titleEn,
    description: isKo ? item.excerptKo || item.descKo : item.excerptEn || item.descEn,
    descKo: item.excerptKo || item.descKo,
    descEn: item.excerptEn || item.descEn,
    date: item.publishedAt || item.date || null,
    updatedAt: item.updatedAt || item.publishedAt || null,
    status: "published",
    featured: !!item.featured,
    tags: [item.category, "notes", "build-log"].filter(Boolean),
    url: `newsletter/#${item.slug}`,
    relatedProducts: item.relatedProducts || [],
    relatedResources: item.relatedResources || [],
    cta: isKo ? "더 읽기 ↗" : "Read note ↗",
    locale: "all",
  };
}

function normalizeEducation(item, lang) {
  const isKo = lang === "ko";
  return {
    id: item.id || item.slug,
    slug: item.slug,
    type: "education",
    category: item.track || "guides",
    title: isKo ? item.titleKo : item.titleEn,
    titleKo: item.titleKo,
    titleEn: item.titleEn,
    description: isKo ? item.bodyKo : item.bodyEn,
    descKo: item.bodyKo,
    descEn: item.bodyEn,
    date: null,
    updatedAt: null,
    status: item.status || "coming_soon",
    featured: false,
    tags: [item.track || "guides", "education"],
    url: `education/#${item.slug}`,
    relatedProducts: [],
    relatedResources: [],
    cta: isKo ? "가이드 보기 ↗" : "View guide ↗",
    locale: "all",
  };
}

export function getAllResources(lang = "en") {
  const items = [];
  for (const p of STORE_PRODUCTS) {
    if (p.listed === false) continue;
    items.push(normalizeStore(p, lang));
  }
  for (const a of getPublishedInsights()) items.push(normalizeInsight(a, lang));
  for (const b of loadPublishedBlogRegistry()) items.push(normalizeBlog(b, lang));
  for (const m of MEDIA_ITEMS.filter((x) => x && x.status === "published")) items.push(normalizeMedia(m, lang));
  for (const e of getLabsExperiments()) items.push(normalizeLab(e, lang));
  for (const n of NEWSLETTER_ISSUES.filter((x) => x && x.status === "published")) items.push(normalizeNote(n, lang));
  for (const t of EDUCATION_TOPICS.filter((x) => x && x.status !== "hidden")) items.push(normalizeEducation(t, lang));
  return items.sort((a, b) => String(b.updatedAt || b.date || "").localeCompare(String(a.updatedAt || a.date || "")));
}

export function getFeaturedResources(lang = "en", limit = 3) {
  const featured = getAllResources(lang).filter((r) => r.featured);
  const pool = featured.length >= limit ? featured : getAllResources(lang);
  return pool.slice(0, limit);
}

export function getLatestResources(lang = "en", limit = 8) {
  return getAllResources(lang).slice(0, limit);
}

export function getPopularResources(lang = "en", limit = 6) {
  const featured = getAllResources(lang).filter((r) => r.featured);
  if (featured.length < 2) return [];
  return featured.slice(0, limit);
}

export function getResourcesByType(type, lang = "en") {
  return getAllResources(lang).filter((r) => r.type === type);
}

export function getRelatedResources(item, lang = "en", limit = 4) {
  if (!item) return [];
  const all = getAllResources(lang).filter((r) => r.id !== item.id);
  const tagSet = new Set((item.tags || []).map((t) => String(t).toLowerCase()));
  const scored = all.map((r) => {
    let score = 0;
    if (r.type === item.type) score += 2;
    for (const t of r.tags || []) {
      if (tagSet.has(String(t).toLowerCase())) score += 1;
    }
    if (r.category === item.category) score += 1;
    return { r, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || String(b.r.updatedAt || "").localeCompare(String(a.r.updatedAt || "")))
    .slice(0, limit)
    .map((x) => x.r);
}

export function buildRegistrySearchIndex(lang = "en") {
  return getAllResources(lang).map((r) => ({
    type: r.type,
    title: r.title,
    description: r.description || "",
    url: r.url,
    tags: r.tags || [],
    category: r.category || "",
  }));
}
