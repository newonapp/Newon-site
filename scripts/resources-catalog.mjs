/**
 * Newon Resources — hub catalog under /{lang}/resources/{slug}/
 */
export const RESOURCE_PAGES = [
  {
    slug: "store",
    navLabelKey: "nav.store",
    visual: "shelf",
    path: "resources/store/",
  },
  {
    slug: "insights",
    navLabelKey: "nav.insights",
    visual: "insights",
    path: "resources/insights/",
  },
  {
    slug: "blog",
    navLabelKey: "nav.blog",
    visual: "publication",
    path: "resources/blog/",
  },
  {
    slug: "media",
    navLabelKey: "nav.media",
    visual: "film",
    path: "resources/media/",
  },
  {
    slug: "labs",
    navLabelKey: "nav.labs",
    visual: "terminal",
    path: "resources/labs/",
  },
  {
    slug: "newsletter",
    navLabelKey: "nav.newsletter",
    visual: "subscribe",
    path: "resources/newsletter/",
  },
  {
    slug: "education",
    navLabelKey: "nav.education",
    visual: "topics",
    path: "resources/education/",
  },
];

export const RESOURCE_SLUGS = RESOURCE_PAGES.map((p) => p.slug);

export function resourceBySlug(slug) {
  return RESOURCE_PAGES.find((p) => p.slug === slug) || null;
}
