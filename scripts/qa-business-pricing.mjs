#!/usr/bin/env node
/**
 * QA — verify Business pricing is unified (no stale amounts).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BUSINESS_SERVICE_PAGES } from "./business-service-catalog.mjs";
import { PILLAR_SLUGS } from "./business-pillar-copy.mjs";
import { formatPriceDisplay, SERVICE_PRICING } from "./business-pricing.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const STALE_PATTERNS = [
  /₩400,000/,
  /From ₩400,000/,
  /₩500,000(?!부터)/,
  /From ₩500,000/,
  /₩700,000(?!부터)/,
  /From ₩700,000/,
  /₩200,000/,
  /From ₩200,000/,
  /₩1,000,000부터(?![\s\S]{0,20}1,500,000)/, // allow if page also has 1.5M for product-launch
  /50만/,
  /500K/,
  /KRW 500000/,
  /₩500,000~/,
];

const EXPECTED = Object.fromEntries(
  Object.entries(SERVICE_PRICING).map(([slug, cfg]) => [
    slug,
    cfg.custom ? (["ko", "en"].map((l) => formatPriceDisplay(slug, l))) : [formatPriceDisplay(slug, "ko"), formatPriceDisplay(slug, "en")],
  ])
);

function readSafe(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function checkFile(rel, errors, warns) {
  const html = readSafe(path.join(ROOT, rel));
  if (!html) {
    errors.push(`missing: ${rel}`);
    return;
  }
  for (const re of STALE_PATTERNS) {
    if (re.test(html)) {
      // product-launch and mvp pages may legitimately mention 1,000,000
      if (rel.includes("product-launch") && /1,000,000/.test(html) && !/400,000|500,000|200,000|700,000/.test(html)) continue;
      if (rel.includes("mvp") && /1,000,000/.test(html) && !/400,000|500,000|200,000/.test(html)) {
        errors.push(`${rel}: stale price pattern ${re}`);
        continue;
      }
      if (!rel.includes("mvp") || /400,000|500,000|200,000/.test(html)) {
        errors.push(`${rel}: stale price pattern ${re}`);
      }
    }
  }
}

function checkServicePrice(rel, slug, errors) {
  const html = readSafe(path.join(ROOT, rel));
  if (!html) {
    errors.push(`missing: ${rel}`);
    return;
  }
  const expected = EXPECTED[slug];
  if (!expected) return;
  const koOk = html.includes(expected[0]);
  const enOk = html.includes(expected[expected.length - 1]) || html.includes(expected[0]);
  if (!koOk && rel.startsWith("ko/")) {
    errors.push(`${rel}: expected price ${expected[0]}`);
  }
  if (!enOk && !rel.startsWith("ko/")) {
    errors.push(`${rel}: expected price ${expected[expected.length - 1]}`);
  }
}

function main() {
  const errors = [];
  const warns = [];

  for (const lang of LANGS) {
    checkFile(`${lang}/business/index.html`, errors, warns);
    for (const pillar of PILLAR_SLUGS) {
      checkFile(`${lang}/business/${pillar}/index.html`, errors, warns);
    }
    for (const page of BUSINESS_SERVICE_PAGES) {
      const route = page.routePath || page.slug;
      const rel = `${lang}/business/${route}/index.html`;
      checkFile(rel, errors, warns);
      if (lang === "ko" || lang === "en") {
        checkServicePrice(rel, page.slug, errors);
      }
    }
  }

  if (warns.length) console.log("Warnings:", warns.length);
  warns.forEach((w) => console.log(`[WARN] ${w}`));
  errors.forEach((e) => console.log(`[ERROR] ${e}`));
  console.log(`\nPricing QA: ${errors.length} error(s), ${warns.length} warning(s).`);
  process.exit(errors.length ? 1 : 0);
}

main();
