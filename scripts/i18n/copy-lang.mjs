/**
 * Shared copy-language resolution for multilang page generators.
 * Prefer an exact lang pack, then English, then Korean.
 * Brand name "Newon" should remain untranslated in copy strings.
 */
export const COPY_LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

export function resolveCopyLang(lang) {
  const key = String(lang || "en").toLowerCase();
  return COPY_LANGS.includes(key) ? key : "en";
}

/**
 * @param {Record<string, any>} pack - { ko, en, ja, ... }
 * @param {string} lang
 */
export function pickLangPack(pack, lang) {
  if (!pack || typeof pack !== "object") return null;
  const L = resolveCopyLang(lang);
  return pack[L] || pack.en || pack.ko || null;
}

/**
 * Deep-merge overlay onto base (arrays replaced, objects merged).
 */
export function deepMerge(base, overlay) {
  if (overlay == null) return base;
  if (Array.isArray(overlay)) return overlay.slice();
  if (typeof overlay !== "object") return overlay;
  const out = Array.isArray(base) ? base.slice() : { ...(base || {}) };
  for (const [k, v] of Object.entries(overlay)) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof out[k] === "object" && out[k] && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = deepMerge(undefined, v);
    }
  }
  return out;
}

/**
 * Load optional JSON overlay from scripts/i18n/packs/{lang}/{name}.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PACK_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "packs");

export function loadPackOverlay(name, lang) {
  const L = resolveCopyLang(lang);
  if (L === "ko" || L === "en") return null;
  const file = path.join(PACK_ROOT, L, `${name}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Resolve a { ko, en } pack with optional MT overlay for other langs.
 * Pricing/UI helpers that only know ko|en should use `_priceLang`.
 */
export function resolveKoEnPack(pack, lang, overlayName) {
  const L = resolveCopyLang(lang);
  const en = pack?.en || {};
  const ko = pack?.ko || en;
  let local = L === "ko" ? ko : en;
  if (L !== "ko" && L !== "en" && overlayName) {
    const overlay = loadPackOverlay(overlayName, L);
    if (overlay) local = deepMerge(en, overlay);
  } else if (pack?.[L]) {
    local = pack[L];
  }
  return { ...en, ...local, _pageLang: L, _priceLang: L === "ko" ? "ko" : "en" };
}
