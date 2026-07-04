#!/usr/bin/env node
/** Run all locale sync scripts in dependency order before build-i18n. */
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const args = process.argv.slice(2);
const withTranslate = args.includes("--translate") || args.includes("--auto-translate");
const translateArgs = args.filter((a) => a === "--force" || a.startsWith("--lang="));

const STEPS = [
  "apply-newon-plus-locales.mjs",
  "apply-newon-plus-nav-locales.mjs",
  "apply-ox-sp-hero-copy.mjs",
  "merge-subping-locales.mjs",
  "apply-petlog-locales.mjs",
  "apply-babylog-locales.mjs",
  "apply-pm-locales.mjs",
  "apply-savy-locales.mjs",
  "apply-piggyup-locales.mjs",
  "apply-goalup-countup-locales.mjs",
  "apply-goalup-locales.mjs",
  "apply-countup-locales.mjs",
  "apply-noting-locales.mjs",
  "sync-sp-mobile-hints.mjs",
  "apply-translate-cache.mjs",
  "apply-home-locale-translations.mjs",
];

if (withTranslate) {
  STEPS.push(["auto-translate-app-locales.mjs", ...translateArgs]);
}

for (const step of STEPS) {
  const [scriptName, ...extra] = Array.isArray(step) ? step : [step];
  const script = path.join(__dirname, scriptName);
  console.log(`\n→ ${scriptName}`);
  const r = spawnSync(process.execPath, [script, ...extra], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("\nrun-all-locale-patches: OK");
