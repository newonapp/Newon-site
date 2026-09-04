/**
 * Shared SEO helpers for public site metadata (Naver Search Advisor friendly).
 * Prefer writing short source copy; clamp as a safety net at render time.
 */

/** Unicode-aware length (Naver counts graphemes roughly as characters). */
export function seoLen(s) {
  return [...String(s || "")].length;
}

/**
 * Clamp description/OG/Twitter description to max characters without stuffing.
 * Tries to end on sentence or word boundary; never invents new claims.
 */
export function clampSeoDescription(raw, max = 80) {
  const text = String(raw || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (seoLen(text) <= max) return text;

  const chars = [...text];
  let slice = chars.slice(0, max).join("");

  // Prefer ending at sentence punctuation within the window
  const sentence = slice.match(/^([\s\S]*?[.。!?…])(?=\s|$)/);
  if (sentence && seoLen(sentence[1]) >= Math.min(40, Math.floor(max * 0.5))) {
    return sentence[1].trim();
  }

  // Else cut at last space / middle-dot / comma
  const breakAt = Math.max(
    slice.lastIndexOf(" "),
    slice.lastIndexOf("·"),
    slice.lastIndexOf("—"),
    slice.lastIndexOf("-"),
    slice.lastIndexOf(","),
    slice.lastIndexOf("、")
  );
  if (breakAt >= Math.min(36, Math.floor(max * 0.45))) {
    slice = slice.slice(0, breakAt);
  } else {
    slice = chars.slice(0, Math.max(1, max - 1)).join("");
  }

  return slice.replace(/[·,\s—\-、]+$/u, "").trim() + "…";
}

/** True when a locale/template key is an SEO description field. */
export function isSeoDescriptionKey(key) {
  const k = String(key || "");
  return (
    /(^|\.)(metaDescription|ogDescription|twitterDescription|seoDescription|exploreMetaDescription|productsMetaDescription|aiMetaDescription|saasMetaDescription|gamesMetaDescription|toolsMetaDescription|studioMetaDescription|mediaMetaDescription|labsMetaDescription|marketMetaDescription|contactMetaDescription)$/i.test(
      k
    ) ||
    k === "meta.description" ||
    k === "meta.ogDescription" ||
    k === "meta.twitterDescription"
  );
}
