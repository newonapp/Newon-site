#!/usr/bin/env node
/** Run all locale sync scripts in dependency order before build-i18n. */
import fs from "fs";
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
  "apply-app-ox-layout.mjs",
  "merge-subping-locales.mjs",
  "apply-petlog-locales.mjs",
  "apply-babylog-locales.mjs",
  "apply-pm-locales.mjs",
  "apply-savy-locales.mjs",
  "apply-piggyup-locales.mjs",
  "apply-goalup-countup-locales.mjs",
  "apply-goalup-locales.mjs",
  "apply-countup-locales.mjs",
  "apply-myworld-locales.mjs",
  "apply-eaton-locales.mjs",
  "apply-fiton-locales.mjs",
  "apply-app-intro-branding.mjs",
  "apply-app-hero-badges.mjs",
  "apply-app-closing-copy.mjs",
  "apply-app-reviews.mjs",
  "apply-app-landing-extras.mjs",
  "patch-index-eaton-app.mjs",
  "patch-index-fiton-app.mjs",
  "apply-app-hero-accent.mjs",
  "apply-delete-account-locales.mjs",
  "sync-sp-mobile-hints.mjs",
  "patch-app-premium-cards.mjs",
  "apply-translate-cache.mjs",
  "apply-home-locale-translations.mjs",
  "apply-home-11-apps.mjs",
  "apply-studio-locales.mjs",
  "apply-site-chrome-i18n.mjs",
];

if (withTranslate) {
  STEPS.push(["auto-translate-app-locales.mjs", ...translateArgs]);
}

// Reviewed (approved) translations win over every English fallback written above. Must stay last.
STEPS.push("apply-approved-translations.mjs");

/**
 * Translation-source protection (P7).
 * locales/_sp.<lang>.json hold the committed per-language SubPing copy. Several steps above rewrite those files in
 * place with English fallback text, so a second build in the same working tree would merge English into
 * locales/<lang>.json (merge-subping-locales runs first) and change the output. The files are restored to their
 * pre-run content when the run ends, so a build is a function of tracked sources and repeats are identical.
 * NEWON_UPDATE_TRANSLATION_SOURCE=1 (or --translate) keeps the rewritten files for a deliberate source update.
 */
const keepSource = process.env.NEWON_UPDATE_TRANSLATION_SOURCE === "1" || withTranslate;
const LOCALES_DIR = path.join(ROOT, "locales");
const protectedSources = new Map();
if (!keepSource) {
  for (const f of fs.readdirSync(LOCALES_DIR)) {
    if (/^_sp\..+\.json$/.test(f)) protectedSources.set(f, fs.readFileSync(path.join(LOCALES_DIR, f)));
  }
}
function restoreProtectedSources() {
  let restored = 0;
  for (const [f, buf] of protectedSources) {
    const p = path.join(LOCALES_DIR, f);
    if (!fs.existsSync(p) || !fs.readFileSync(p).equals(buf)) { fs.writeFileSync(p, buf); restored += 1; }
  }
  if (protectedSources.size) console.log(`\ntranslation-source protection: ${protectedSources.size} _sp files checked, ${restored} restored to pre-run content`);
}

for (const step of STEPS) {
  const [scriptName, ...extra] = Array.isArray(step) ? step : [step];
  const script = path.join(__dirname, scriptName);
  console.log(`\n→ ${scriptName}`);
  const r = spawnSync(process.execPath, [script, ...extra], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) { restoreProtectedSources(); process.exit(r.status ?? 1); }
}

restoreProtectedSources();
console.log("\nrun-all-locale-patches: OK");
