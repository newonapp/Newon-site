#!/usr/bin/env node
/**
 * Fills app locale blocks (ox, pm, sv, bl, pl) where copy still matches en.json.
 * Uses Google Translate + MyMemory fallback with on-disk cache. Skips ko/en.
 * SubPing copy lives in locales/_sp.{lang}.json (merged by merge-subping-locales.mjs).
 * Run: node scripts/auto-translate-app-locales.mjs [--force] [--lang=ja]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { translate as googleTranslate } from "@vitalets/google-translate-api";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "locales");
const CACHE_PATH = path.join(__dirname, ".translate-cache.json");

const TARGET_LANGS = ["ja", "es", "pt-br", "fr", "de", "hi", "id"];
const APP_KEYS = ["ox", "pm", "sv", "bl", "pl", "pu", "gu", "cu", "nt", "np", "mw"];
const ROOT_KEYS = ["home", "nav", "footer", "ui", "meta", "common", "legal", "about"];
const META_KEYS = [
  "titleOx",
  "titlePillmate",
  "titleBabylog",
  "titlePetlog",
  "titleSavy",
  "titlePiggyup",
  "titleGoalup",
  "titleCountup",
  "titleNoting",
  "titleNewonPlus",
  "titleMyworld",
  "titleHome",
  "description",
  "ogTitle",
  "ogDescription",
  "twitterTitle",
  "twitterDescription",
  "orgDescription",
];
const NAV_KEYS = [
  "pillmateDesc",
  "babylogDesc",
  "petlogDesc",
  "savyDesc",
  "piggyupDesc",
  "goalupDesc",
  "countupDesc",
  "notingDesc",
  "newonPlusDesc",
  "myworldDesc",
  "mobileOxHint",
  "mobileSubpingHint",
  "mobilePillmateHint",
  "mobileBabylogHint",
  "mobilePetlogHint",
  "mobileSavyHint",
  "mobilePiggyupHint",
  "mobileGoalupHint",
  "mobileCountupHint",
  "mobileNotingHint",
  "mobileNewonPlusHint",
  "mobileMyworldHint",
  "headerHubTagline",
  "mobileSummary",
];

const MYMEMORY_LANG = {
  ja: "ja",
  es: "es",
  "pt-br": "pt-BR",
  fr: "fr",
  de: "de",
  hi: "hi",
  id: "id",
};

const GOOGLE_LANG = {
  ja: "ja",
  es: "es",
  "pt-br": "pt",
  fr: "fr",
  de: "de",
  hi: "hi",
  id: "id",
};

const SKIP_SUBSTRINGS = [
  "[[IMG:",
  "{{",
];

const force = process.argv.includes("--force");
const forceRootArg = process.argv.find((a) => a.startsWith("--force-root="));
const forceRoots = forceRootArg
  ? forceRootArg
      .split("=")[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];
const langArg = process.argv.find((a) => a.startsWith("--lang="));
const onlyLang = langArg ? langArg.split("=")[1] : null;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function saveJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

const BRAND_ONLY = /^(OX MONTH|SubPing|Pillmate|BabyLog|PetLog|PiggyUp|SAVY|GoalUp|CountUp|Noting|NOTING|Newon|My World)$/i;

function isBrandOnly(text) {
  return BRAND_ONLY.test(String(text).trim());
}

function shouldSkipTranslate(text) {
  if (isBrandOnly(text)) return true;
  if (!text || typeof text !== "string") return true;
  const t = text.trim();
  if (!t) return true;
  if (/^https?:\/\//i.test(t) || /^mailto:/i.test(t)) return true;
  if (!/[a-zA-Z\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF]/.test(t)) return true;
  if (SKIP_SUBSTRINGS.some((s) => t.includes(s))) return true;
  return false;
}

/** Protect HTML, template tokens, URLs, and brand tokens from translation.
 * Use ASCII placeholders — private-use Unicode (U+E000) gets mangled by some MT APIs. */
function protect(text) {
  const tokens = [];
  let safe = text.replace(
    /(\[\[IMG:[^\]]+\]\]|\{\{[^}]+\}\}|https?:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|<[^>]+>|OX MONTH|SubPing|Pillmate|BabyLog|PetLog|PiggyUp|SAVY|GoalUp|CountUp|Noting|Newon|My World|Google Play|App Store)/gi,
    (m) => {
      const id = tokens.length;
      tokens.push(m);
      return `[[[T${id}]]]`;
    }
  );
  return { safe, tokens };
}

function unprotect(text, tokens) {
  let out = String(text);
  for (let i = 0; i < tokens.length; i++) {
    out = out.replace(new RegExp(`\\[\\[\\[T${i}\\]\\]\\]`, "gi"), tokens[i]);
    out = out.replace(new RegExp(`\\[\\[T${i}\\]\\]`, "gi"), tokens[i]);
  }
  return out;
}

async function translateGtx(safe, targetLang) {
  const tl = GOOGLE_LANG[targetLang] || targetLang;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", tl);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", safe.slice(0, 4500));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`gtx HTTP ${res.status}`);
  const data = await res.json();
  const parts = (data[0] || []).map((chunk) => chunk?.[0]).filter(Boolean);
  if (!parts.length) throw new Error("gtx empty");
  return parts.join("");
}

async function translateGoogleFallback(safe, targetLang) {
  try {
    return await translateGtx(safe, targetLang);
  } catch {
    const to = GOOGLE_LANG[targetLang] || targetLang;
    const res = await googleTranslate(safe, { from: "en", to });
    return res.text;
  }
}

async function translateMyMemory(safe, targetLang) {
  const pair = `en|${MYMEMORY_LANG[targetLang] || targetLang}`;
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", safe.slice(0, 450));
  url.searchParams.set("langpair", pair);
  const res = await fetch(url);
  const data = await res.json();
  if (data.quotaFinished) {
    const err = new Error("quota");
    err.quota = true;
    throw err;
  }
  const status = Number(data.responseStatus);
  if (status !== 200 || !data.responseData?.translatedText) {
    throw new Error(data.responseDetails || `HTTP ${data.responseStatus}`);
  }
  const body = String(data.responseData.translatedText);
  if (/MYMEMORY WARNING/i.test(body)) {
    const err = new Error("quota");
    err.quota = true;
    throw err;
  }
  return body;
}

async function translateOne(text, targetLang, cache) {
  const pair = `en|${MYMEMORY_LANG[targetLang] || targetLang}`;
  const cacheKey = `${pair}\u0000${text}`;
  if (!force && cache[cacheKey]) return cache[cacheKey];

  const { safe, tokens } = protect(text);
  const stripped = safe.replace(/\[\[\[T\d+\]\]\]/g, "").trim();
  if (
    !stripped ||
    !/[a-zA-Z\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF\u0900-\u097F]/.test(stripped)
  ) {
    cache[cacheKey] = text;
    return text;
  }
  if (
    !safe.trim() ||
    (safe.trim() === text.trim() && !/[a-zA-Z]{3,}/.test(stripped))
  ) {
    cache[cacheKey] = text;
    return text;
  }

  let translated;
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      translated = await translateGtx(safe, targetLang);
      break;
    } catch (e) {
      lastErr = e;
      await sleep(600 * (attempt + 1));
    }
  }

  if (!translated) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        translated = await translateGoogleFallback(safe, targetLang);
        break;
      } catch (e) {
        lastErr = e;
        await sleep(1200 * (attempt + 1));
      }
    }
  }

  if (!translated) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        translated = await translateMyMemory(safe, targetLang);
        if (/MYMEMORY WARNING/i.test(translated)) {
          translated = null;
          break;
        }
        break;
      } catch (e) {
        lastErr = e;
        if (e.quota) break;
        await sleep(800 * (attempt + 1));
      }
    }
  }

  if (!translated) throw lastErr || new Error("translate failed");

  translated = unprotect(translated, tokens);
  cache[cacheKey] = translated;
  return translated;
}

function deepAssign(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      target[k] = target[k] && typeof target[k] === "object" ? target[k] : {};
      deepAssign(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

async function translateBlock(enBlock, locBlock, targetLang, cache, stats, blockForce = false) {
  const out = structuredClone(locBlock || {});
  for (const [k, enVal] of Object.entries(enBlock)) {
    if (enVal && typeof enVal === "object" && !Array.isArray(enVal)) {
      out[k] = await translateBlock(enVal, out[k] || {}, targetLang, cache, stats, blockForce);
      continue;
    }
    if (typeof enVal !== "string") continue;
    const cur = out[k];
    const needs =
      force ||
      blockForce ||
      cur === undefined ||
      cur === null ||
      cur === "" ||
      cur === enVal;
    if (!needs || shouldSkipTranslate(enVal)) {
      if (cur === undefined) out[k] = enVal;
      continue;
    }
    try {
      out[k] = await translateOne(enVal, targetLang, cache);
      stats.translated++;
      if (stats.translated % 25 === 0) {
        fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
        process.stdout.write(`  …${stats.translated} strings\n`);
      }
      await sleep(80);
    } catch (e) {
      console.error(`\n[${targetLang}] failed key ${k}: ${e.message}`);
      stats.failed++;
      out[k] = cur ?? enVal;
      if (String(e.message).includes("quota")) throw e;
    }
  }
  return out;
}

async function patchMetaNav(lang, en, loc, cache, stats) {
  const metaForce = force || forceRoots.includes("meta");
  const navForce = force || forceRoots.includes("nav");
  loc.meta = loc.meta || {};
  for (const key of META_KEYS) {
    const enVal = en.meta?.[key];
    const cur = loc.meta[key];
    if (typeof enVal !== "string" || !enVal) continue;
    if (!metaForce && cur && cur !== enVal) continue;
    if (shouldSkipTranslate(enVal)) continue;
    try {
      loc.meta[key] = await translateOne(enVal, lang, cache);
      stats.translated++;
      await sleep(80);
    } catch (e) {
      if (String(e.message).includes("quota")) throw e;
    }
  }
  loc.nav = loc.nav || {};
  for (const key of NAV_KEYS) {
    const enVal = en.nav?.[key];
    const cur = loc.nav[key];
    if (typeof enVal !== "string" || !enVal) continue;
    if (!navForce && cur && cur !== enVal) continue;
    if (shouldSkipTranslate(enVal)) continue;
    try {
      loc.nav[key] = await translateOne(enVal, lang, cache);
      stats.translated++;
      await sleep(80);
    } catch (e) {
      if (String(e.message).includes("quota")) throw e;
    }
  }
}

async function main() {
  const en = loadJson(path.join(LOCALES, "en.json"));
  const cache = fs.existsSync(CACHE_PATH) ? loadJson(CACHE_PATH) : {};
  const langs = onlyLang ? [onlyLang] : TARGET_LANGS;

  for (const lang of langs) {
    if (!TARGET_LANGS.includes(lang)) {
      console.error(`Unknown lang: ${lang}`);
      process.exit(1);
    }
    const file = path.join(LOCALES, `${lang}.json`);
    const loc = loadJson(file);
    const stats = { translated: 0, failed: 0 };
    console.log(`\nauto-translate: ${lang}`);

    for (const app of APP_KEYS) {
      if (!en[app]) continue;
      loc[app] = await translateBlock(en[app], loc[app], lang, cache, stats, false);
    }
    for (const root of ROOT_KEYS) {
      if (!en[root]) continue;
      const blockForce = forceRoots.includes(root);
      loc[root] = await translateBlock(en[root], loc[root], lang, cache, stats, blockForce);
    }
    await patchMetaNav(lang, en, loc, cache, stats);

    saveJson(file, loc);

    const spEnPath = path.join(LOCALES, "_sp.en.json");
    const spLocPath = path.join(LOCALES, `_sp.${lang}.json`);
    if (fs.existsSync(spEnPath) && fs.existsSync(spLocPath)) {
      const spEn = loadJson(spEnPath);
      const spLoc = loadJson(spLocPath);
      const spOut = await translateBlock(spEn, spLoc, lang, cache, stats, false);
      saveJson(spLocPath, spOut);
    }

    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
    console.log(`  done ${lang}: ${stats.translated} translated, ${stats.failed} failed`);
  }

  console.log("\nauto-translate-app-locales: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
