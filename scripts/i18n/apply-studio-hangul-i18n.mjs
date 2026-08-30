#!/usr/bin/env node
/**
 * Patch locales/*.json so studio.* keys are no longer leftover Korean
 * (except locales/ko.json). Keeps brand "Newon" as-is inside strings.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { STUDIO_I18N } from "./studio-hangul-translations.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LOCALES = path.join(ROOT, "locales");

function setDeep(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

const langs = Object.keys(STUDIO_I18N);
let patched = 0;
for (const lang of langs) {
  const file = path.join(LOCALES, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const pack = STUDIO_I18N[lang];
  for (const [key, value] of Object.entries(pack)) {
    setDeep(data, `studio.${key}`, value);
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  patched += 1;
  console.log(`patched studio.* → ${lang}.json (${Object.keys(pack).length} keys)`);
}
console.log(`apply-studio-hangul-i18n: ${patched} locale files`);
