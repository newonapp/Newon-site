#!/usr/bin/env node
/**
 * Ensures all _sp.*.json files share the same keys as _sp.en.json (reference).
 * Run: node scripts/validate-sp-locales.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "locales");

const REF = "_sp.en.json";
const FILES = [
  "_sp.ko.json",
  "_sp.en.json",
  "_sp.ja.json",
  "_sp.es.json",
  "_sp.pt-br.json",
  "_sp.fr.json",
  "_sp.de.json",
  "_sp.hi.json",
  "_sp.id.json",
];

const refPath = path.join(ROOT, REF);
const ref = JSON.parse(fs.readFileSync(refPath, "utf8"));
const refKeys = Object.keys(ref).sort();

let failed = false;
for (const f of FILES) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) {
    console.error(`validate-sp-locales: missing ${f}`);
    failed = true;
    continue;
  }
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const k = Object.keys(j).sort();
  const missing = refKeys.filter((x) => !k.includes(x));
  const extra = k.filter((x) => !refKeys.includes(x));
  if (missing.length || extra.length) {
    console.error(`validate-sp-locales: ${f}`);
    if (missing.length) console.error(`  missing keys: ${missing.join(", ")}`);
    if (extra.length) console.error(`  extra keys: ${extra.join(", ")}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("validate-sp-locales: OK");
