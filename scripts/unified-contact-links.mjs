/**
 * Inquiry links of the six business sites (ONGIL · LIVON · SHAREON · BABYLOG · PETLOG · MY WORLD).
 *
 * Owner (2026-10-26): every inquiry action on the six businesses' pages is ONE button "문의하기" / "Contact us"
 * that opens the unified NEWON Contact page with the business (and a fitting inquiry type) preselected:
 *   /{lang}/contact/?platform=<biz>&type=<type>&source=<biz>-<page>[&topic=<id>]
 * The businesses keep their own Contact menu page (/{lang}/{biz}/contact/ — the 01–05 menu still opens it).
 *
 * - unifiedContactHref(): builds the link (same language prefix as the page; never forces /ko/).
 * - toUnifiedContact(): render-time safety net for the business pages' MAIN content. It rewrites any link that
 *   still points at an old inquiry form (/{lang}/business/inquiry/…, /{lang}/business/contact/…, or the business's
 *   own …/{biz}/contact/?type=… shortcuts) to the unified page, mapping the old type codes onto the unified page's
 *   primary types. Plain menu links (/{lang}/{biz}/contact/ without a query), e-mail addresses, app-store links,
 *   anchors and links that already open /{lang}/contact/ are left alone.
 */

/** Primary inquiry types of the unified page (scripts/contact-page-copy.mjs CONTACT_CATEGORY_IDS). */
export const PRIMARY_TYPES = ["personal", "business", "public", "partnership", "investment", "media"];

/** Old per-business / business-form codes → unified primary type. */
const LEGACY_TYPE = {
  personal: "personal", support: "personal", "app-support": "personal", general: "personal", app: "personal",
  business: "business", project: "business", enterprise: "business", saas: "business", participation: "business",
  brand: "business", "booking-provider": "business",
  public: "public", institution: "public", government: "public",
  partnership: "partnership", partner: "partnership", technology: "partnership", global: "partnership",
  investment: "investment", invest: "investment", ir: "investment",
  media: "media", press: "media", other: "media",
};

export function normalizeType(t) {
  return LEGACY_TYPE[String(t || "").toLowerCase()] || "";
}

/** The six businesses. A partnership button also names the business's "<biz>-partnership" topic
 *  (scripts/contact-taxonomy.mjs CONTACT_TOPICS, agent U's unified-page taxonomy). */
export const SIX_BUSINESSES = ["ongil", "livon", "shareon", "babylog", "petlog", "myworld"];

export function unifiedContactHref(lang, biz, { type = "", source = "", topic = "" } = {}) {
  const q = [`platform=${encodeURIComponent(biz)}`];
  const t = normalizeType(type) || (PRIMARY_TYPES.includes(type) ? type : "");
  if (t) q.push(`type=${t}`);
  if (!topic && t === "partnership" && SIX_BUSINESSES.includes(biz)) topic = `${biz}-partnership`;
  if (topic) q.push(`topic=${encodeURIComponent(topic)}`);
  if (source) q.push(`source=${encodeURIComponent(source)}`);
  return `/${lang}/contact/?${q.join("&")}`;
}

const FORM_HREF = /^(?:(?:\.\.\/)+|\/[a-z]{2}(?:-[a-z]{2})?\/)?business\/(?:inquiry|contact)\/(?:[?#][^"]*)?$/i;

/** Old form query → unified type (type / service / category codes used by the old forms). */
function typeFromQuery(params) {
  for (const k of ["type", "service"]) {
    const t = normalizeType(params.get(k));
    if (t) return t;
  }
  return params.get("category") ? "partnership" : "";
}

/**
 * @param {string} html  rendered main content of one business page
 * @param {string} lang  page language
 * @param {string} biz   ongil | livon | shareon | babylog | petlog | myworld
 * @param {string} [page] overview | platform | business | partnerships | contact (used for source=<biz>-<page>)
 */
export function toUnifiedContact(html, lang, biz, page = "contact") {
  const self = new RegExp(`^(?:(?:\\.\\./)+|/${lang}/)?${biz}/contact/\\?[^"]*$`, "i");
  return html.replace(/(<a\b[^>]*?\bhref=")([^"]+)(")/g, (m, a, href, z) => {
    const h = href.replace(/&amp;/g, "&");
    if (!(FORM_HREF.test(h) || self.test(h))) return m;
    const params = new URLSearchParams((h.split("#")[0].split("?")[1] || ""));
    const fallback = { business: "business", partnerships: "partnership" }[page] || "personal";
    const url = unifiedContactHref(lang, biz, { type: typeFromQuery(params) || fallback, source: `${biz}-${page}` });
    return `${a}${url.replace(/&/g, "&amp;")}${z}`;
  });
}
