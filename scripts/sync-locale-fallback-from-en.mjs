#!/usr/bin/env node
/**
 * Deep-merge: for ko, ja, es, pt-br, fr, de, hi, id — copy string/en leaf values from en.json
 * only where the target path is missing, null, or whitespace-only string.
 * Objects are merged recursively.
 *
 *   node scripts/sync-locale-fallback-from-en.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "locales");

const TARGET_LANGS = ["ko", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function isEmptyStringLeaf(v) {
  return typeof v === "string" && v.trim() === "";
}

function fill(target, source) {
  if (source === null || source === undefined) return;
  if (typeof source !== "object" || Array.isArray(source)) return;
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (typeof sv === "object" && sv !== null && !Array.isArray(sv)) {
      if (target[key] === undefined || target[key] === null) target[key] = {};
      if (typeof target[key] !== "object" || Array.isArray(target[key])) target[key] = {};
      fill(target[key], sv);
    } else {
      if (tv === undefined || tv === null || isEmptyStringLeaf(tv)) {
        target[key] = sv;
      }
    }
  }
}

const enPath = path.join(ROOT, "en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

for (const lang of TARGET_LANGS) {
  const p = path.join(ROOT, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  fill(data, en);
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("synced from en →", `${lang}.json`);
}

console.log("done.");
