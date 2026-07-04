#!/usr/bin/env node
/** Apply cached EN→locale translations to keys that still match en.json. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = path.join(ROOT, "locales");
const CACHE_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), ".translate-cache.json");

const TARGET_LANGS = ["ja", "es", "pt-br", "fr", "de", "hi", "id"];
const MYMEMORY_LANG = {
  ja: "ja",
  es: "es",
  "pt-br": "pt-BR",
  fr: "fr",
  de: "de",
  hi: "hi",
  id: "id",
};

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function walkApply(enVal, locVal, lang, cache, stats, keyPath) {
  if (enVal && typeof enVal === "object" && !Array.isArray(enVal)) {
    const out = locVal && typeof locVal === "object" ? { ...locVal } : {};
    for (const [k, v] of Object.entries(enVal)) {
      out[k] = walkApply(v, out[k], lang, cache, stats, keyPath ? `${keyPath}.${k}` : k);
    }
    return out;
  }
  if (typeof enVal !== "string") return locVal;
  if (locVal !== undefined && locVal !== null && locVal !== "" && locVal !== enVal) return locVal;
  const pair = `en|${MYMEMORY_LANG[lang] || lang}`;
  const cacheKey = `${pair}\u0000${enVal}`;
  const hit = cache[cacheKey];
  if (hit && hit !== enVal) {
    stats.applied++;
    return hit;
  }
  stats.miss++;
  return locVal ?? enVal;
}

const cache = fs.existsSync(CACHE_PATH) ? loadJson(CACHE_PATH) : {};
const en = loadJson(path.join(LOCALES, "en.json"));

for (const lang of TARGET_LANGS) {
  const file = path.join(LOCALES, `${lang}.json`);
  const loc = loadJson(file);
  const stats = { applied: 0, miss: 0 };
  for (const [root, enBlock] of Object.entries(en)) {
    if (!enBlock || typeof enBlock !== "object") continue;
    loc[root] = walkApply(enBlock, loc[root], lang, cache, stats, root);
  }
  fs.writeFileSync(file, JSON.stringify(loc, null, 2) + "\n", "utf8");
  console.log(`apply-translate-cache: ${lang} applied ${stats.applied}, still missing ${stats.miss}`);
}

console.log("apply-translate-cache: OK");
