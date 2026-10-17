/**
 * MY WORLD business site copy getter.
 * KO and EN are complete. Other locales fall back to EN (isFallback = true) until reviewed translations exist.
 */
import { KO } from "./myworld-site-copy-ko.mjs";
import { EN } from "./myworld-site-copy-en.mjs";

export const MYWORLD_PAGES = ["overview", "platform", "business", "partnerships", "contact"];

/** URL path segment (relative to /{lang}/) for each page id. */
export function myworldPagePath(id) {
  return id === "overview" ? "myworld/" : `myworld/${id}/`;
}

export function getMyWorldSiteCopy(lang) {
  if (lang === "ko") return { copy: KO, contentLang: "ko", isFallback: false };
  return { copy: EN, contentLang: "en", isFallback: lang !== "en" };
}
