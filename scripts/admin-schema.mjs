/**
 * Admin data schema — future backend wiring (not exposed publicly).
 * TODO: implement authenticated admin at /admin/ when DB is available.
 */
export const ADMIN_COLLECTIONS = {
  products: {
    fields: ["id", "slug", "type", "status", "name", "tagline", "platforms", "pricing", "featured", "url", "launchDate"],
  },
  businessLeads: {
    fields: ["id", "name", "company", "email", "phone", "type", "budget", "timeline", "message", "createdAt"],
    source: "FormSubmit → newon@newon.app",
  },
  storeProducts: {
    fields: ["slug", "category", "status", "price", "includes", "faq"],
  },
  blog: {
    fields: ["slug", "title", "summary", "date", "category", "readingTime", "bodyPath"],
  },
  news: {
    fields: ["slug", "category", "tags", "published", "copy"],
    source: "scripts/news-data.mjs",
  },
  newsletter: {
    fields: ["email", "productId", "createdAt"],
    source: "FormSubmit waitlist",
  },
  tools: {
    fields: ["slug", "category", "status", "analytics"],
    source: "scripts/tools-data.mjs",
  },
  experiments: {
    fields: ["id", "slug", "status", "type", "name", "desc"],
    source: "scripts/labs-data.mjs",
  },
};
