#!/usr/bin/env node
/**
 * Fills NEWS_ARTICLES + PRODUCT_HISTORY copy packs for ja/es/pt-br/fr/de/hi/id
 * from English (or Korean when EN missing). Writes scripts/news-copy-i18n.json
 * and patches articleCopy / history lookups via that overlay at render time.
 *
 * Run: node scripts/fill-news-history-i18n.mjs [--force] [--lang=ja]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { translate as googleTranslate } from "@vitalets/google-translate-api";
import { NEWS_ARTICLES } from "./news-data.mjs";
import { PRODUCT_HISTORY } from "./product-history-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, ".translate-cache.json");
const OUT_PATH = path.join(__dirname, "news-copy-i18n.json");

const TARGET_LANGS = ["ja", "es", "pt-br", "fr", "de", "hi", "id"];
const force = process.argv.includes("--force");
const langArg = process.argv.find((a) => a.startsWith("--lang="));
const onlyLang = langArg ? langArg.split("=")[1] : null;

const GOOGLE_LANG = {
  ja: "ja",
  es: "es",
  "pt-br": "pt",
  fr: "fr",
  de: "de",
  hi: "hi",
  id: "id",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadJson(p) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : {};
}

async function translateGtx(text, targetLang) {
  const tl = GOOGLE_LANG[targetLang] || targetLang;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", tl);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text.slice(0, 4500));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`gtx HTTP ${res.status}`);
  const data = await res.json();
  const parts = (data[0] || []).map((chunk) => chunk?.[0]).filter(Boolean);
  if (!parts.length) throw new Error("gtx empty");
  return parts.join("");
}

async function translateOne(text, targetLang, cache) {
  if (!text || typeof text !== "string") return text;
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (!/[a-zA-Z\u00C0-\u024F]/.test(trimmed) && /[\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(trimmed)) {
    // Already CJK/Hangul-heavy — still translate from EN source only
  }
  const cacheKey = `en|${GOOGLE_LANG[targetLang] || targetLang}\u0000${text}`;
  if (!force && cache[cacheKey]) return cache[cacheKey];

  // Preserve <br /> markers
  const tokens = [];
  const safe = text.replace(/<br\s*\/?>/gi, () => {
    const id = tokens.length;
    tokens.push("<br />");
    return `[[[T${id}]]]`;
  });

  let translated;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      translated = await translateGtx(safe, targetLang);
      break;
    } catch {
      await sleep(500 * (attempt + 1));
    }
  }
  if (!translated) {
    const res = await googleTranslate(safe, { from: "en", to: GOOGLE_LANG[targetLang] || targetLang });
    translated = res.text;
  }
  for (let i = 0; i < tokens.length; i++) {
    translated = translated.replace(new RegExp(`\\[\\[\\[T${i}\\]\\]\\]`, "gi"), tokens[i]);
  }
  cache[cacheKey] = translated;
  return translated;
}

async function translateValue(val, lang, cache, stats) {
  if (typeof val === "string") {
    const out = await translateOne(val, lang, cache);
    stats.n++;
    await sleep(60);
    return out;
  }
  if (Array.isArray(val)) {
    const arr = [];
    for (const item of val) arr.push(await translateValue(item, lang, cache, stats));
    return arr;
  }
  if (val && typeof val === "object") {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = await translateValue(v, lang, cache, stats);
    }
    return out;
  }
  return val;
}

function looksTranslated(pack, lang) {
  if (!pack || !pack[lang]) return false;
  const sample = pack[lang].title || pack[lang].summary || pack[lang].description || "";
  if (!sample) return false;
  if (pack.en && sample === pack.en.title) return false;
  if (pack.en && sample === pack.en.summary) return false;
  if (pack.en && sample === pack.en.description) return false;
  return true;
}

async function main() {
  const cache = loadJson(CACHE_PATH);
  const out = loadJson(OUT_PATH);
  out.articles = out.articles || {};
  out.history = out.history || {};
  out.imageAlt = out.imageAlt || {};
  out.activity = out.activity || {};

  const langs = onlyLang ? [onlyLang] : TARGET_LANGS;
  const stats = { n: 0 };

  for (const article of NEWS_ARTICLES) {
    const id = article.id;
    const enPack = article.copy?.en || article.copy?.ko;
    if (!enPack) continue;
    out.articles[id] = out.articles[id] || {};
    for (const lang of langs) {
      if (!force && out.articles[id][lang] && looksTranslated({ ...article.copy, [lang]: out.articles[id][lang] }, lang)) {
        continue;
      }
      if (!force && article.copy?.[lang] && looksTranslated(article.copy, lang)) {
        out.articles[id][lang] = article.copy[lang];
        continue;
      }
      console.log(`article ${id} → ${lang}`);
      out.articles[id][lang] = await translateValue(enPack, lang, cache, stats);
    }

    if (article.imageAlt?.en || article.imageAlt?.ko) {
      out.imageAlt[id] = out.imageAlt[id] || {};
      const src = article.imageAlt.en || article.imageAlt.ko;
      for (const lang of langs) {
        if (!force && out.imageAlt[id][lang]) continue;
        out.imageAlt[id][lang] = await translateOne(src, lang, cache);
        stats.n++;
        await sleep(60);
      }
    }

    if (article.activity) {
      out.activity[id] = out.activity[id] || {};
      for (const field of ["area", "label"]) {
        const srcObj = article.activity[field];
        if (!srcObj || typeof srcObj === "string") continue;
        const src = srcObj.en || srcObj.ko;
        if (!src) continue;
        out.activity[id][field] = out.activity[id][field] || {};
        for (const lang of langs) {
          if (!force && out.activity[id][field][lang]) continue;
          out.activity[id][field][lang] = await translateOne(src, lang, cache);
          stats.n++;
          await sleep(60);
        }
      }
    }
  }

  for (const entry of PRODUCT_HISTORY) {
    const id = entry.id;
    const enPack = entry.copy?.en || entry.copy?.ko;
    if (!enPack) continue;
    out.history[id] = out.history[id] || {};
    for (const lang of langs) {
      if (!force && out.history[id][lang] && looksTranslated({ ...entry.copy, [lang]: out.history[id][lang] }, lang)) {
        continue;
      }
      if (!force && entry.copy?.[lang] && looksTranslated(entry.copy, lang)) {
        out.history[id][lang] = entry.copy[lang];
        continue;
      }
      console.log(`history ${id} → ${lang}`);
      out.history[id][lang] = await translateValue(enPack, lang, cache, stats);
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
  console.log(`fill-news-history-i18n: OK (${stats.n} strings) → ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
