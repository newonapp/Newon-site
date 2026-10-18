#!/usr/bin/env node
/**
 * Record a person's approval of a translation candidate. Never run by a build or by CI.
 *
 *   node scripts/approve-translation-candidates.mjs --lang de --id "locales/_sp.de.json#1" --reviewer "Name" [--text "override"]
 *   node scripts/approve-translation-candidates.mjs --list --lang de        (json-key candidates that can be approved)
 *
 * Only json-key candidates can be approved here (they map to a locale key: _sp.<lang>.json "x" -> locales key "sp.x").
 * HTML hunks have no single locale key and must first be mapped to one by a reviewer.
 * The approved text is the committed translation unless --text gives the reviewer's corrected wording.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const arg = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : null);
const lang = arg("--lang");
if (!lang || !/^(ja|es|pt-br|fr|de|hi|id)$/.test(lang)) { console.error("approve: --lang must be one of ja es pt-br fr de hi id"); process.exit(2); }
const cand = JSON.parse(fs.readFileSync(path.join(ROOT, "i18n-candidates", "translation-candidates.v1.json"), "utf8"));
const rec = cand.files[`locales/_sp.${lang}.json`]?.records || [];
if (argv.includes("--list")) {
  for (const r of rec) console.log(`${r.id}\tsp.${r.locator}\t${r.currentCommitted.slice(0, 70).replace(/\s+/g, " ")}`);
  process.exit(0);
}
const id = arg("--id");
const reviewer = arg("--reviewer");
if (!id || !reviewer || !reviewer.trim()) { console.error("approve: --id and --reviewer are required"); process.exit(2); }
const r = rec.find((x) => x.id === id);
if (!r) { console.error(`approve: no json-key candidate ${id} for ${lang}`); process.exit(2); }
const text = arg("--text") ?? r.currentCommitted;
const file = path.join(ROOT, "i18n-approved", `${lang}.json`);
const doc = JSON.parse(fs.readFileSync(file, "utf8"));
doc.entries[`sp.${r.locator}`] = {
  text,
  reviewStatus: "approved",
  reviewer: reviewer.trim(),
  reviewedAt: new Date().toISOString().slice(0, 10),
  candidateId: r.id,
};
fs.writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
console.log(`approve: ${lang} sp.${r.locator} recorded for ${reviewer.trim()} - run the build to apply it`);
