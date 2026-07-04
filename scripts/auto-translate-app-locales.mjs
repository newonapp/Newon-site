#!/usr/bin/env node
/**
 * Fills app locale blocks (ox, pm, sv, bl, pl) where copy still matches en.json.
 * Uses MyMemory free API with on-disk cache. Skips ko/en and SubPing (merge-subping-locales).
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
const APP_KEYS = ["ox", "pm", "sv", "bl", "pl", "sp", "pu", "gu", "cu", "nt"];
const ROOT_KEYS = ["home", "nav", "footer", "ui", "meta", "common", "legal"];
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
  "newon.app",
  "play.google.com",
  "apps.apple.com",
  "mailto:",
  "http://",
  "https://",
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

function shouldSkipTranslate(text) {
  if (!text || typeof text !== "string") return true;
  const t = text.trim();
  if (!t) return true;
  if (!/[a-zA-Z\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF]/.test(t)) return true;
  if (SKIP_SUBSTRINGS.some((s) => t.includes(s))) return true;
  return false;
}

/** Protect HTML, template tokens, and brand tokens from translation. */
function protect(text) {
  const tokens = [];
  let safe = text.replace(
    /(\[\[IMG:[^\]]+\]\]|\{\{[^}]+\}\}|<[^>]+>|OX MONTH|SubPing|Pillmate|BabyLog|PetLog|PiggyUp|SAVY|GoalUp|CountUp|Noting|Newon|Google Play|App Store)/gi,
    (m) => {
      const id = tokens.length;
      tokens.push(m);
      return `\uE000${id}\uE001`;
    }
  );
  return { safe, tokens };
}

function unprotect(text, tokens) {
  let out = text;
  for (let i = 0; i < tokens.length; i++) {
    out = out.replace(`\uE000${i}\uE001`, tokens[i]);
    out = out.replace(new RegExp(`\uE000${i}\uE001`, "g"), tokens[i]);
  }
  return out;
}

async function translateGoogleFallback(safe, targetLang) {
  const to = GOOGLE_LANG[targetLang] || targetLang;
  const res = await googleTranslate(safe, { from: "en", to });
  return res.text;
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
  if (
    !safe.trim() ||
    (safe.trim() === text.trim() && !/[a-zA-Z]{3,}/.test(safe.replace(/\uE000\d+\uE001/g, "")))
  ) {
    cache[cacheKey] = text;
    return text;
  }

  let translated;
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      translated = await translateGoogleFallback(safe, targetLang);
      break;
    } catch (e) {
      lastErr = e;
      await sleep(800 * (attempt + 1));
    }
  }

  if (!translated) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        translated = await translateMyMemory(safe, targetLang);
        break;
      } catch (e) {
        lastErr = e;
        if (e.quota) break;
        await sleep(600 * (attempt + 1));
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
      await sleep(25);
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
      await sleep(25);
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
      await sleep(25);
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
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
    console.log(`  done ${lang}: ${stats.translated} translated, ${stats.failed} failed`);
  }

  console.log("\nauto-translate-app-locales: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
