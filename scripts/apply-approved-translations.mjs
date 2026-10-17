#!/usr/bin/env node
/**
 * Apply reviewed translations (i18n-approved/<lang>.json) to locales/<lang>.json.
 *
 * Policy (PHASE 03 P7):
 *   1. a reviewed and approved localized translation wins;
 *   2. only when none exists the existing English fallback stays;
 *   3. nothing is ever promoted automatically - an entry exists only after a person approved it
 *      (scripts/approve-translation-candidates.mjs records who and when).
 *
 * An approved entry looks like:
 *   "sp.closingFoot": { "text": "...", "reviewStatus": "approved", "reviewer": "name", "reviewedAt": "2026-10-18",
 *                       "candidateId": "locales/_sp.de.json#1" }
 * Invalid entries fail the build instead of being skipped. The target key must already exist in locales/en.json
 * as a string (no new keys are invented). This step runs last in run-all-locale-patches.mjs.
 *
 *   node scripts/apply-approved-translations.mjs [--check] [--root <dir>]
 *   --check validates and reports without writing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const check = argv.includes("--check");
const rootArg = argv.includes("--root") ? argv[argv.indexOf("--root") + 1] : null;
const ROOT = rootArg ? path.resolve(rootArg) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPROVED = path.join(ROOT, "i18n-approved");
const LOCALES = path.join(ROOT, "locales");
const LANGS = ["ja", "es", "pt-br", "fr", "de", "hi", "id"]; // ko and en are the confirmed source languages

function getPath(obj, p) {
  return p.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), obj);
}
function setPath(obj, p, v) {
  const ks = p.split(".");
  let o = obj;
  for (const k of ks.slice(0, -1)) {
    if (!o[k] || typeof o[k] !== "object") return false;
    o = o[k];
  }
  o[ks[ks.length - 1]] = v;
  return true;
}

const errors = [];
const summary = {};
const en = JSON.parse(fs.readFileSync(path.join(LOCALES, "en.json"), "utf8"));
for (const lang of LANGS) {
  const f = path.join(APPROVED, `${lang}.json`);
  if (!fs.existsSync(f)) { summary[lang] = { approved: 0, applied: 0 }; continue; }
  let doc;
  try { doc = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { errors.push(`${lang}: unparseable (${e.message})`); continue; }
  if (doc.lang !== lang) errors.push(`${lang}: "lang" must be "${lang}"`);
  const entries = doc.entries || {};
  const lp = path.join(LOCALES, `${lang}.json`);
  const loc = JSON.parse(fs.readFileSync(lp, "utf8"));
  let applied = 0;
  for (const [key, e] of Object.entries(entries)) {
    const where = `${lang}:${key}`;
    if (!e || e.reviewStatus !== "approved") { errors.push(`${where}: reviewStatus must be "approved"`); continue; }
    if (typeof e.text !== "string" || !e.text.trim()) { errors.push(`${where}: text missing`); continue; }
    if (typeof e.reviewer !== "string" || !e.reviewer.trim()) { errors.push(`${where}: reviewer missing`); continue; }
    if (!/^\d{4}-\d{2}-\d{2}/.test(e.reviewedAt || "")) { errors.push(`${where}: reviewedAt must be a date`); continue; }
    if (typeof getPath(en, key) !== "string") { errors.push(`${where}: key does not exist as a string in locales/en.json`); continue; }
    if (!check && !setPath(loc, key, e.text)) { errors.push(`${where}: parent object missing in locales/${lang}.json`); continue; }
    applied += 1;
  }
  if (!check && applied) fs.writeFileSync(lp, `${JSON.stringify(loc, null, 2)}\n`, "utf8");
  summary[lang] = { approved: Object.keys(entries).length, applied };
}
const total = Object.values(summary).reduce((a, s) => a + s.approved, 0);
console.log(`apply-approved-translations: ${total} approved entr${total === 1 ? "y" : "ies"} · ${LANGS.map((l) => `${l} ${summary[l].applied}`).join(" · ")}${check ? " (check only)" : ""}`);
for (const e of errors) console.error(`apply-approved-translations: ${e}`);
process.exit(errors.length ? 1 : 0);
