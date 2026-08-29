/**
 * Store product detail — delegates to bs-* renderer (Studio service pattern).
 */
import { getStoreDetail } from "./store-detail-copy.mjs";
import { renderStoreDetailBody } from "./store-bs-detail-render.mjs";

function pick(detail, lang, koKey, enKey) {
  return lang === "ko" ? detail[koKey] || detail[enKey] || "" : detail[enKey] || detail[koKey] || "";
}

/**
 * @param {object} product from STORE_PRODUCTS
 * @param {object} _copies unused
 * @param {'ko'|'en'} lang
 * @param {object} [_helpers] unused
 */
export function buildStoreDetailBody(product, _copies, lang) {
  return renderStoreDetailBody(product, lang);
}

export function storeDetailSeo(product, lang) {
  const detail = getStoreDetail(product.slug);
  const title = detail?.title || (lang === "ko" ? product.titleKo : product.titleEn) || product.slug;
  const overview = detail && (lang === "ko" ? detail.overviewBodyKo : detail.overviewBodyEn);
  const overviewFirst = Array.isArray(overview) ? overview[0] : "";
  const metaRaw =
    (detail && pick(detail, lang, "metaKo", "metaEn")) ||
    overviewFirst ||
    (detail && pick(detail, lang, "heroLeadKo", "heroLeadEn")) ||
    (lang === "ko" ? product.descKo : product.descEn) ||
    "";
  const meta = String(metaRaw)
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  return {
    seoTitle: `${title} | Newon Store`,
    metaDescription: meta,
  };
}
