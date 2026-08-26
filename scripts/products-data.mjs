/**
 * Unified product catalog for Product Studio hubs.
 * @see APP_CATALOG for live apps
 */
import { APP_CATALOG } from "./portfolio-data.mjs";

/** @typedef {'apps'|'ai'|'saas'|'games'|'tools'|'store'|'labs'} ProductType */
/** @typedef {'concept'|'building'|'beta'|'live'|'paused'|'archived'} ProductStatus */

export const PRODUCT_TYPES = ["apps", "ai", "saas", "games", "tools", "store", "labs"];

/** Placeholder AI products — Coming Soon until launch */
export const AI_PRODUCTS = [
  {
    id: "newon-review-ai",
    slug: "review-ai",
    type: "ai",
    status: "building",
    nameKey: "studio.aiProduct1Name",
    taglineKey: "studio.aiProduct1Tagline",
    featured: true,
  },
  {
    id: "newon-content-ai",
    slug: "content-ai",
    type: "ai",
    status: "concept",
    nameKey: "studio.aiProduct2Name",
    taglineKey: "studio.aiProduct2Tagline",
    featured: false,
  },
  {
    id: "newon-launch-ai",
    slug: "launch-ai",
    type: "ai",
    status: "concept",
    nameKey: "studio.aiProduct3Name",
    taglineKey: "studio.aiProduct3Tagline",
    featured: false,
  },
  {
    id: "newon-cs-ai",
    slug: "cs-ai",
    type: "ai",
    status: "concept",
    nameKey: "studio.aiProduct4Name",
    taglineKey: "studio.aiProduct4Tagline",
    featured: false,
  },
];

/** Placeholder SaaS products */
export const SAAS_PRODUCTS = [
  {
    id: "newon-review",
    slug: "review",
    type: "saas",
    status: "building",
    nameKey: "studio.saas1Name",
    taglineKey: "studio.saas1Tagline",
    pricing: "paid",
    featured: true,
  },
  {
    id: "newon-qr",
    slug: "qr",
    type: "saas",
    status: "building",
    nameKey: "studio.saas2Name",
    taglineKey: "studio.saas2Tagline",
    pricing: "free",
    featured: false,
  },
  {
    id: "newon-link",
    slug: "link",
    type: "saas",
    status: "concept",
    nameKey: "studio.saas3Name",
    taglineKey: "studio.saas3Tagline",
    pricing: "free",
    featured: false,
  },
  {
    id: "newon-form",
    slug: "form",
    type: "saas",
    status: "concept",
    nameKey: "studio.saas4Name",
    taglineKey: "studio.saas4Tagline",
    pricing: "free",
    featured: false,
  },
];

export const GAMES_PRODUCTS = [
  {
    id: "404-human",
    slug: "404-human",
    type: "games",
    status: "live",
    name: "404: HUMAN",
    taglineKey: "studio.game404Tagline",
    icon: "/404-human-logo.png",
    url: "/404-human/",
    playUrl: "/404-human/play/",
    platforms: ["Web"],
    featured: true,
  },
];

export function appsAsProducts(lang = "ko") {
  return APP_CATALOG.map((app) => ({
    id: app.slug,
    slug: app.slug,
    type: "apps",
    status: "live",
    name: app.name,
    taglineKey: null,
    tagline: app.label || app.name,
    icon: app.icon,
    homeHash: app.homeHash,
    url: `/${lang}/${app.homeHash}`,
    platforms: ["iOS", "Android"],
    featured: app.featured,
    launchDate: null,
    pricing: "free",
  }));
}

export function allProducts(lang = "ko") {
  return [
    ...appsAsProducts(lang),
    ...GAMES_PRODUCTS,
    ...AI_PRODUCTS,
    ...SAAS_PRODUCTS,
  ];
}

export function productsByType(type, lang = "ko") {
  if (type === "all") return allProducts(lang);
  return allProducts(lang).filter((p) => p.type === type);
}

export function productStatusUi(status) {
  const map = {
    concept: "Coming Soon",
    building: "Building",
    beta: "Beta",
    live: "Live",
    paused: "Paused",
    archived: "Archived",
  };
  return map[status] || "Coming Soon";
}

/** CTA label + href by product status */
export function productCta(product, lang = "ko") {
  const status = product.status || "concept";
  const labels = {
    concept: { label: "Coming Soon", action: "learn" },
    building: { label: "Follow Progress", action: "waitlist" },
    beta: { label: "Join Beta", action: "waitlist" },
    live: { label: "Open", action: "open" },
    paused: { label: "View Project", action: "open" },
    archived: { label: "Archive", action: "open" },
  };
  const cfg = labels[status] || labels.concept;
  let href = "#";
  if (cfg.action === "open") {
    if (product.type === "apps" && product.homeHash) href = `../${product.homeHash}`;
    else if (product.url) href = product.url.startsWith("/") ? `../..${product.url.replace(`/${lang}/`, "/")}` : product.url;
    else if (product.slug === "404-human") href = "../404-human/";
  } else if (cfg.action === "waitlist") {
    href = product.type === "ai" ? "../ai/" : product.type === "saas" ? "../saas/" : "../products/";
  } else {
    href = product.type === "ai" ? "../ai/" : product.type === "saas" ? "../saas/" : "../products/";
  }
  return { label: cfg.label, href, action: cfg.action };
}
