#!/usr/bin/env node
/**
 * Reset locale strings corrupted by mangled MT protect-tokens back to English,
 * so auto-translate-app-locales.mjs can re-translate them cleanly.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = path.join(ROOT, "locales");
const LANGS = ["ja", "es", "pt-br", "fr", "de", "hi", "id"];

const CORRUPT = /[\uE000-\uF8FF]|||\[\[[Tt]\d+\]\]|\[\[\[[Tt]\d+\]\]\]/;

function isCorrupt(s) {
  if (typeof s !== "string") return false;
  if (CORRUPT.test(s)) return true;
  // e.g. "0 — ..." brand token mangled to digit + PUA
  if (/^\d[\uE000-\uF8FF]/.test(s)) return true;
  if (/\d[\uE000-\uF8FF]/.test(s) && /<(?:span|p|strong|br)/i.test(s)) return true;
  return false;
}

function repair(enVal, locVal, stats) {
  if (enVal && typeof enVal === "object" && !Array.isArray(enVal)) {
    const out = locVal && typeof locVal === "object" ? { ...locVal } : {};
    for (const [k, v] of Object.entries(enVal)) {
      out[k] = repair(v, out[k], stats);
    }
    return out;
  }
  if (typeof enVal !== "string") return locVal;
  if (isCorrupt(locVal)) {
    stats.reset++;
    return enVal;
  }
  return locVal ?? enVal;
}

const en = JSON.parse(fs.readFileSync(path.join(LOCALES, "en.json"), "utf8"));

for (const lang of LANGS) {
  const file = path.join(LOCALES, `${lang}.json`);
  const loc = JSON.parse(fs.readFileSync(file, "utf8"));
  const stats = { reset: 0 };
  for (const [root, enBlock] of Object.entries(en)) {
    if (!enBlock || typeof enBlock !== "object") continue;
    loc[root] = repair(enBlock, loc[root], stats);
  }
  fs.writeFileSync(file, JSON.stringify(loc, null, 2) + "\n", "utf8");
  console.log(`repair-corrupt-locales: ${lang} reset ${stats.reset}`);

  const spEnPath = path.join(LOCALES, "_sp.en.json");
  const spLocPath = path.join(LOCALES, `_sp.${lang}.json`);
  if (fs.existsSync(spEnPath) && fs.existsSync(spLocPath)) {
    const spEn = JSON.parse(fs.readFileSync(spEnPath, "utf8"));
    const spLoc = JSON.parse(fs.readFileSync(spLocPath, "utf8"));
    const spStats = { reset: 0 };
    const fixed = repair(spEn, spLoc, spStats);
    fs.writeFileSync(spLocPath, JSON.stringify(fixed, null, 2) + "\n", "utf8");
    console.log(`repair-corrupt-locales: _sp.${lang} reset ${spStats.reset}`);
  }
}

console.log("repair-corrupt-locales: OK");
