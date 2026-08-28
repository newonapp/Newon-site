/**
 * Newon Resources — hub catalog under /{lang}/resources/{slug}/
 * Primary local nav: Store · Insights · Blog · Labs
 * Secondary (reachable, not in primary tabs): Notes · Education
 * Media lives under Company at /{lang}/media/
 */
export const RESOURCE_PAGES = [
  {
    slug: "store",
    navLabelKey: "nav.store",
    visual: "shelf",
    path: "resources/store/",
    primary: true,
  },
  {
    slug: "insights",
    navLabelKey: "nav.insights",
    visual: "insights",
    path: "resources/insights/",
    primary: true,
  },
  {
    slug: "blog",
    navLabelKey: "nav.blog",
    visual: "publication",
    path: "resources/blog/",
    primary: true,
  },
  {
    slug: "labs",
    navLabelKey: "nav.labs",
    visual: "terminal",
    path: "resources/labs/",
    primary: true,
  },
  {
    slug: "newsletter",
    navLabelKey: "nav.newsletter",
    visual: "subscribe",
    path: "resources/newsletter/",
    primary: false,
  },
  {
    slug: "education",
    navLabelKey: "nav.education",
    visual: "topics",
    path: "resources/education/",
    primary: false,
  },
];

/** Primary switcher + mega + explore index */
export const RESOURCE_PRIMARY_PAGES = RESOURCE_PAGES.filter((p) => p.primary !== false);

/** Secondary hubs (Notes / Education) — keep routes, omit from primary tabs */
export const RESOURCE_SECONDARY_PAGES = RESOURCE_PAGES.filter((p) => p.primary === false);

export const RESOURCE_SLUGS = RESOURCE_PAGES.map((p) => p.slug);

export function resourceBySlug(slug) {
  return RESOURCE_PAGES.find((p) => p.slug === slug) || null;
}
