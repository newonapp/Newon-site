/**
 * Business service detail pages — catalog (6 services).
 * Slugs are URL paths under /{lang}/business/{slug}/
 */
export const BUSINESS_SERVICE_PAGES = [
  {
    slug: "mvp",
    hubId: "mvp",
    formType: "MVP",
    analyticsId: "mvp",
    navKey: "nav.bizMvp",
    visual: "pipeline",
    related: ["web", "app", "design"],
  },
  {
    slug: "web",
    hubId: "website",
    formType: "Website",
    analyticsId: "web",
    navKey: "nav.bizWeb",
    visual: "browser",
    related: ["design", "ai-automation", "mvp"],
  },
  {
    slug: "app",
    hubId: "app",
    formType: "App",
    analyticsId: "app",
    navKey: "nav.bizApp",
    visual: "devices",
    related: ["mvp", "design", "ai-automation"],
  },
  {
    slug: "ai-automation",
    hubId: "ai",
    formType: "AI",
    analyticsId: "ai_automation",
    navKey: "nav.bizAi",
    visual: "workflow",
    related: ["web", "white-label", "mvp"],
  },
  {
    slug: "white-label",
    hubId: "whitelabel",
    formType: "White-label",
    analyticsId: "white_label",
    navKey: "nav.bizWhitelabel",
    visual: "brand-stack",
    related: ["web", "app", "ai-automation"],
  },
  {
    slug: "design",
    hubId: "design",
    formType: "Design",
    analyticsId: "design",
    navKey: "nav.bizDesign",
    visual: "system",
    related: ["web", "app", "mvp"],
  },
];

export const HUB_ID_TO_SLUG = Object.fromEntries(
  BUSINESS_SERVICE_PAGES.map((s) => [s.hubId, s.slug])
);

export const SLUG_TO_FORM_TYPE = Object.fromEntries(
  BUSINESS_SERVICE_PAGES.map((s) => [s.slug, s.formType])
);

/** Map query aliases → form select value */
export const SERVICE_QUERY_TO_TYPE = {
  mvp: "MVP",
  web: "Website",
  website: "Website",
  app: "App",
  "ai-automation": "AI",
  ai: "AI",
  "white-label": "White-label",
  whitelabel: "White-label",
  design: "Design",
  MVP: "MVP",
  Website: "Website",
  App: "App",
  AI: "AI",
  "White-label": "White-label",
  Design: "Design",
};
