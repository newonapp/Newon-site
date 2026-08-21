/**
 * Newon Ideas — product list and type constants.
 * Products come from the live portfolio catalog only.
 */
import { APP_CATALOG } from "./portfolio-data.mjs";

export const IDEA_TYPES = ["app", "feature", "message"];

export const IDEA_TYPE_INTERNAL = {
  app: "new_app",
  feature: "feature_request",
  message: "message",
};

export function ideaProducts() {
  return APP_CATALOG.map((a) => ({
    slug: a.slug,
    name: a.name,
  }));
}

export function productBySlug(slug) {
  return APP_CATALOG.find((a) => a.slug === slug) || null;
}

export function resolveProductSlug(input) {
  if (!input) return "";
  const raw = String(input).trim().toLowerCase();
  if (!raw) return "";
  const bySlug = productBySlug(raw);
  if (bySlug) return bySlug.slug;
  const byName = APP_CATALOG.find((a) => a.name.toLowerCase() === raw);
  return byName ? byName.slug : "";
}
