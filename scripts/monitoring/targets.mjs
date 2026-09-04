/**
 * Production monitoring targets (existing URLs only).
 * Content markers are structural / brand IDs — not full translated copy.
 */

/** @typedef {"CRITICAL"|"PRODUCT"|"BUSINESS"|"SUPPORTING"|"ASSET"|"STORE"|"HQ"} TargetLevel */
/** @typedef {"P0"|"P1"|"P2"|"P3"} Severity */

/**
 * @typedef {object} RouteTarget
 * @property {string} id
 * @property {string} path
 * @property {TargetLevel} level
 * @property {Severity} severity
 * @property {string[]} [markers] — all must appear (case-sensitive substrings)
 * @property {string[]} [anyMarkers] — at least one must appear
 * @property {boolean} [expectRedirect] — 3xx before follow is OK (root → locale)
 * @property {number} [minBytes]
 * @property {string} [type]
 */

/** Soft-404 / error page signals (conservative). */
export const SOFT_404_MARKERS = [
  "Page not found · Newon",
  "There isn't a GitHub Pages site here",
  "File not found",
];

export const GITHUB_PAGES_404 = ["Page not found", "GitHub Pages"];

export const USER_AGENT = "NewonProductionMonitor/1.0 (+https://www.newon.app/; ops-health-check)";

export const DEFAULTS = {
  origin: "https://www.newon.app",
  timeoutMs: 12000,
  retries: 2,
  retryDelayMs: 1500,
  concurrency: 3,
  storeConcurrency: 1,
  storeDelayMs: 800,
  latencyWarnMs: 2000,
  latencyFailMs: 5000,
};

/** LEVEL 1 — CRITICAL */
export const CRITICAL_ROUTES = /** @type {RouteTarget[]} */ ([
  {
    id: "root",
    path: "/",
    level: "CRITICAL",
    severity: "P1",
    type: "http/content",
    markers: ['class="gnav__wordmark">Newon</span>'],
    anyMarkers: ["data-gnav", 'id="hub-main"', "home-studio"],
    minBytes: 800,
  },
  {
    id: "home-ko",
    path: "/ko/",
    level: "CRITICAL",
    severity: "P1",
    type: "http/content",
    markers: ['class="gnav__wordmark">Newon</span>', "data-gnav"],
    minBytes: 800,
  },
  {
    id: "home-en",
    path: "/en/",
    level: "CRITICAL",
    severity: "P1",
    type: "http/content",
    markers: ['class="gnav__wordmark">Newon</span>', "data-gnav"],
    minBytes: 800,
  },
  {
    id: "products-ko",
    path: "/ko/products/",
    level: "CRITICAL",
    severity: "P1",
    type: "http/content",
    markers: ['id="hub-main"', "data-gnav", "Newon"],
    minBytes: 800,
  },
  {
    id: "business-ko",
    path: "/ko/business/",
    level: "CRITICAL",
    severity: "P1",
    type: "http/content",
    markers: ['id="hub-main"', "data-gnav", "Newon Business"],
    minBytes: 800,
  },
  {
    id: "contact-ko",
    path: "/ko/contact/",
    level: "CRITICAL",
    severity: "P1",
    type: "http/form",
    markers: ['id="co-contact-form"', "data-co-contact-form", "data-gnav"],
    minBytes: 800,
  },
  {
    id: "inquiry-ko",
    path: "/ko/business/inquiry/",
    level: "CRITICAL",
    severity: "P1",
    type: "http/form",
    markers: ['id="bz-inquiry-form"', "bz-submit", "data-gnav"],
    minBytes: 800,
  },
]);

/** LEVEL 2 — PRODUCT (11 portfolio detail pages) */
export const PRODUCT_SLUGS = [
  "ox-month",
  "subping",
  "savy",
  "pillmate",
  "babylog",
  "petlog",
  "piggyup",
  "goalup",
  "countup",
  "newon-plus",
  "myworld",
];

export const PRODUCT_ROUTES = PRODUCT_SLUGS.map((slug) => ({
  id: `product-${slug}`,
  path: `/ko/portfolio/${slug}/`,
  level: "PRODUCT",
  severity: "P2",
  type: "http/content",
  markers: ['id="pf-main"', 'class="gnav__wordmark">Newon</span>', "portfolio"],
  minBytes: 800,
}));

/** LEVEL 3 — BUSINESS (core service hubs) */
export const BUSINESS_ROUTES = /** @type {RouteTarget[]} */ ([
  {
    id: "biz-build",
    path: "/ko/business/build/",
    level: "BUSINESS",
    severity: "P2",
    type: "http/content",
    markers: ["data-gnav", "Newon"],
    minBytes: 600,
  },
  {
    id: "biz-automation",
    path: "/ko/business/automation/",
    level: "BUSINESS",
    severity: "P2",
    type: "http/content",
    markers: ["data-gnav", "Newon"],
    minBytes: 600,
  },
  {
    id: "biz-research",
    path: "/ko/business/research/",
    level: "BUSINESS",
    severity: "P2",
    type: "http/content",
    markers: ["data-gnav", "Newon"],
    minBytes: 600,
  },
  {
    id: "biz-solutions",
    path: "/ko/business/solutions/",
    level: "BUSINESS",
    severity: "P2",
    type: "http/content",
    markers: ["data-gnav", "Newon"],
    minBytes: 600,
  },
  {
    id: "biz-mvp",
    path: "/ko/business/mvp/",
    level: "BUSINESS",
    severity: "P2",
    type: "http/content",
    markers: ["data-gnav", "Newon"],
    minBytes: 600,
  },
]);

/** LEVEL 4 — SUPPORTING */
export const SUPPORTING_ROUTES = /** @type {RouteTarget[]} */ ([
  {
    id: "portfolio-hub",
    path: "/ko/portfolio/",
    level: "SUPPORTING",
    severity: "P2",
    type: "http/content",
    markers: ["data-gnav", "Newon"],
    minBytes: 600,
  },
  {
    // /ko/store/ is a tiny client redirect stub → real page lives under resources
    id: "store-hub",
    path: "/ko/resources/store/",
    level: "SUPPORTING",
    severity: "P2",
    type: "http/content",
    markers: ["data-gnav", "Newon"],
    minBytes: 600,
  },
  {
    id: "tools-hub",
    path: "/ko/tools/",
    level: "SUPPORTING",
    severity: "P3",
    type: "http/content",
    markers: ['id="hub-main"', "data-gnav"],
    minBytes: 600,
  },
  {
    id: "delete-account-oxmonth",
    path: "/ko/oxmonth/delete-account/",
    level: "SUPPORTING",
    severity: "P2",
    type: "http/content",
    markers: ["delete", "Newon"],
    minBytes: 400,
  },
  {
    id: "delete-account-subping",
    path: "/ko/subping/delete-account/",
    level: "SUPPORTING",
    severity: "P2",
    type: "http/content",
    markers: ["delete", "Newon"],
    minBytes: 400,
  },
  {
    id: "soft404-probe",
    path: "/__newon-monitor-missing-path-do-not-create__/",
    level: "SUPPORTING",
    severity: "P3",
    type: "http/404-behavior",
    // special handling in checker: expect custom/GH 404, not a real page
  },
]);

/** HQ public shell only */
export const HQ_ROUTES = /** @type {RouteTarget[]} */ ([
  {
    id: "hq-shell",
    path: "/admin/",
    level: "HQ",
    severity: "P2",
    type: "http/hq-public",
    markers: ['name="robots" content="noindex, nofollow"', 'id="hq-login"', "hq-app.js"],
    minBytes: 400,
  },
]);

/** Critical page assets (functional breakage level only) */
export const CRITICAL_ASSETS = [
  { id: "asset-styles", path: "/styles.css", level: "ASSET", severity: "P1" },
  { id: "asset-gnav-css", path: "/gnav-mega.css", level: "ASSET", severity: "P1" },
  { id: "asset-theme-shell", path: "/theme-shell.js", level: "ASSET", severity: "P1" },
  { id: "asset-site-chrome", path: "/site-chrome.js", level: "ASSET", severity: "P1" },
  { id: "asset-logo-nav", path: "/logo-nav.png", level: "ASSET", severity: "P2" },
  { id: "asset-inquiry-js", path: "/business/inquiry.js", level: "ASSET", severity: "P1" },
  { id: "asset-company-js", path: "/company.js", level: "ASSET", severity: "P1" },
];

export const SMOKE_ROUTE_IDS = new Set([
  "home-ko",
  "products-ko",
  "business-ko",
  "inquiry-ko",
]);

export function allRouteTargets() {
  return [
    ...CRITICAL_ROUTES,
    ...PRODUCT_ROUTES,
    ...BUSINESS_ROUTES,
    ...SUPPORTING_ROUTES,
    ...HQ_ROUTES,
  ];
}
