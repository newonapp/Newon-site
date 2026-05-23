#!/usr/bin/env node
/**
 * Report keys in en.json that are missing or empty-string in other main locale files.
 *   node scripts/check-locales.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "locales");

function flatten(obj, prefix = "") {
  const out = {};
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== "object") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    Object.assign(out, flatten(v, p));
  }
  return out;
}

function isEmpty(val) {
  return val === undefined || val === null || String(val).trim() === "";
}

const main = ["en", "ko", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const en = flatten(JSON.parse(fs.readFileSync(path.join(ROOT, "en.json"), "utf8")));
const enKeys = Object.keys(en).sort();

let exit = 0;
for (const lang of main) {
  if (lang === "en") continue;
  const file = `${lang}.json`;
  const flat = flatten(JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")));
  const miss = enKeys.filter((k) => !isEmpty(en[k]) && isEmpty(flat[k]));
  if (miss.length) {
    exit = 1;
    console.error(`${file}: ${miss.length} missing / empty`);
    miss.slice(0, 24).forEach((k) => console.error(`  ${k}`));
    if (miss.length > 24) console.error(`  ... (${miss.length - 24} more)`);
  }
}

if (exit === 0) console.log("Locales OK vs en.json:", main.filter((x) => x !== "en").join(", "));
process.exit(exit);
