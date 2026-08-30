#!/usr/bin/env node
/**
 * Generate per-language JSON overlays from EN source packs via Google Translate.
 * Preserves brand "Newon". Skips already-generated files unless --force.
 *
 * Usage:
 *   node scripts/i18n/mt-generate-packs.mjs
 *   node scripts/i18n/mt-generate-packs.mjs --only=ja,de --files=business-pillar,home-page
 *   node scripts/i18n/mt-generate-packs.mjs --force
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { translate } from "@vitalets/google-translate-api";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = path.join(ROOT, "scripts/i18n/packs/_source");
const OUT = path.join(ROOT, "scripts/i18n/packs");
const CACHE = path.join(ROOT, "scripts/i18n/.mt-cache.json");

const TARGETS = {
  ja: "ja",
  es: "es",
  "pt-br": "pt",
  fr: "fr",
  de: "de",
  hi: "hi",
  id: "id",
};

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only="));
const filesArg = args.find((a) => a.startsWith("--files="));
const onlyLangs = onlyArg ? onlyArg.slice(7).split(",").filter(Boolean) : Object.keys(TARGETS);
const onlyFiles = filesArg ? filesArg.slice(8).split(",").filter(Boolean) : null;

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
let cacheDirty = false;
let calls = 0;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function protectBrand(s) {
  return String(s)
    .replace(/Newon\+/g, "⟦NEWONPLUS⟧")
    .replace(/Newon/g, "⟦NEWON⟧");
}

function restoreBrand(s) {
  return String(s)
    .replace(/⟦NEWONPLUS⟧/g, "Newon+")
    .replace(/⟦NEWON⟧/g, "Newon")
    .replace(/\[NEWONPLUS\]/g, "Newon+")
    .replace(/\[NEWON\]/g, "Newon");
}

function shouldTranslate(s) {
  if (s == null) return false;
  const t = String(s).trim();
  if (!t) return false;
  // Keep pure codes / labels that are intentionally English product taxonomy
  if (/^[\d\s$€₩¥.,+\-–—/%·•|:/]+$/.test(t)) return false;
  if (/^[A-Z0-9][A-Z0-9\s/&+.\-]{0,40}$/.test(t) && !/[a-z]/.test(t) && t.length <= 40) {
    // ALL CAPS short labels — still translate soft words later; keep as-is for product codes
    if (/^(MVP|AI|SEO|API|UI|UX|SaaS|QR|iOS|Android|Flutter|CRM|FAQ|CTA)$/.test(t)) return false;
  }
  return /[A-Za-z\u00C0-\u024F]/.test(t);
}

async function mt(text, to) {
  const key = `${to}::${text}`;
  if (cache[key]) return cache[key];
  const protectedText = protectBrand(text);
  let lastErr;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await translate(protectedText, { from: "en", to });
      const out = restoreBrand(res.text);
      cache[key] = out;
      cacheDirty = true;
      calls += 1;
      if (calls % 25 === 0) {
        fs.writeFileSync(CACHE, JSON.stringify(cache));
        cacheDirty = false;
        console.log(`  … ${calls} strings translated`);
      }
      await sleep(80 + Math.random() * 120);
      return out;
    } catch (e) {
      lastErr = e;
      await sleep(600 * (attempt + 1));
    }
  }
  console.warn("MT failed, keeping EN:", String(text).slice(0, 60), lastErr?.message || lastErr);
  return text;
}

async function walk(node, to) {
  if (typeof node === "string") {
    if (!shouldTranslate(node)) return node;
    return mt(node, to);
  }
  if (Array.isArray(node)) {
    const out = [];
    for (const item of node) out.push(await walk(item, to));
    return out;
  }
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = await walk(v, to);
    }
    return out;
  }
  return node;
}

const sources = fs
  .readdirSync(SOURCE)
  .filter((f) => f.endsWith(".json"))
  .filter((f) => !onlyFiles || onlyFiles.some((n) => f === `${n}.json` || f.startsWith(n)));

console.log("sources:", sources.join(", "));
console.log("langs:", onlyLangs.join(", "));

for (const lang of onlyLangs) {
  const to = TARGETS[lang];
  if (!to) {
    console.warn("skip unknown lang", lang);
    continue;
  }
  const dir = path.join(OUT, lang);
  fs.mkdirSync(dir, { recursive: true });
  for (const file of sources) {
    const name = file.replace(/\.json$/, "");
    const dest = path.join(dir, `${name}.json`);
    if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 50) {
      console.log(`skip existing ${lang}/${name}.json`);
      continue;
    }
    console.log(`translate → ${lang}/${name}.json`);
    const src = JSON.parse(fs.readFileSync(path.join(SOURCE, file), "utf8"));
    const translated = await walk(src, to);
    fs.writeFileSync(dest, `${JSON.stringify(translated, null, 2)}\n`);
    if (cacheDirty) {
      fs.writeFileSync(CACHE, JSON.stringify(cache));
      cacheDirty = false;
    }
  }
}

if (cacheDirty) fs.writeFileSync(CACHE, JSON.stringify(cache));
console.log(`done. translated string calls=${calls}`);
