#!/usr/bin/env node
/**
 * QA — verify Business pages' public price display against business-pricing.mjs.
 *
 * Policy (PHASE 03 content alignment): the website is information-only and Newon does not take
 * individual outsourcing projects, so service pages may show NO public price.
 *   - A page that shows no price (no amounts, no price markup, no canonical label) PASSES as
 *     "no-public-price" — but must also carry no price residue (starting-at wording, empty price shells).
 *   - A page that DOES show a price keeps every original check: source (SERVICE_PRICING),
 *     displayed value, currency (KRW only) and cross-page consistency.
 * The check is never skipped: each page is classified `no-public-price` or `price-shown` and counted.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BUSINESS_SERVICE_PAGES } from "./business-service-catalog.mjs";
import { PILLAR_SLUGS } from "./business-pillar-copy.mjs";
import {
  formatPriceDisplay,
  formatKrw,
  SERVICE_PRICING,
  PILLAR_SERVICE_SLUGS,
} from "./business-pricing.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

/** Match ₩1,000 / ₩300,000 style amounts in HTML. */
const KRW_RE = /₩\d{1,3}(?:,\d{3})+/g;

/** Markup that only exists to display a price / quote block. */
const PRICE_MARKUP_RE = /class="[^"]*\b(?:bs-price|bp-pricing|bz-pkg__price|bp-explore__price|bs-collab-pricing|bp-quote)\b/;
/** Wording that means a price is being advertised even without a currency amount. */
const PRICE_RESIDUE_RE = /시작가|\bstarting (?:at|from|prices?)\b|\bfrom ₩|[$€¥£]\s?\d[\d,.]*/i;

const STATS = { "price-shown": 0, "no-public-price": 0 };

/** price-shown when any amount, price markup, or canonical price/label for this slug is on the page. */
function priceVisibility(html, slug) {
  if (findKrwTokens(html).size || PRICE_MARKUP_RE.test(html)) return "price-shown";
  if (slug && SERVICE_PRICING[slug]) {
    for (const l of ["ko", "en"]) {
      if (html.includes(formatPriceDisplay(slug, l))) return "price-shown";
    }
  }
  return "no-public-price";
}

function checkNoPublicPrice(rel, html, errors) {
  STATS["no-public-price"]++;
  const m = html.match(PRICE_RESIDUE_RE);
  if (m) errors.push(`${rel}: no public price shown but price wording remains ("${m[0]}")`);
}

/** Related tier amounts may appear in notes (e.g. MVP Standard / App Development). */
function relatedAmountTokensFromText(...texts) {
  const set = new Set();
  for (const text of texts) {
    if (!text) continue;
    for (const m of String(text).match(KRW_RE) || []) set.add(m);
  }
  return set;
}

function allowedAmountTokensForSlug(slug) {
  const cfg = SERVICE_PRICING[slug];
  if (!cfg) return new Set();
  const set = new Set();
  if (!cfg.custom && cfg.amount != null) set.add(formatKrw(cfg.amount));
  for (const t of relatedAmountTokensFromText(
    cfg.basisKo,
    cfg.basisEn,
    cfg.extraNoteKo,
    cfg.extraNoteEn
  )) {
    set.add(t);
  }
  return set;
}

function allowedDisplaysForSlug(slug) {
  const cfg = SERVICE_PRICING[slug];
  if (!cfg) return new Set();
  return new Set([formatPriceDisplay(slug, "ko"), formatPriceDisplay(slug, "en")]);
}

function allowedAmountTokensForSet(slugs) {
  const set = new Set();
  for (const slug of slugs) {
    for (const t of allowedAmountTokensForSlug(slug)) set.add(t);
  }
  return set;
}

function allServiceSlugs() {
  return Object.keys(SERVICE_PRICING);
}

function readSafe(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function findKrwTokens(html) {
  return new Set(html.match(KRW_RE) || []);
}

function checkKrwTokens(rel, html, allowedTokens, errors) {
  for (const token of findKrwTokens(html)) {
    if (!allowedTokens.has(token)) {
      errors.push(`${rel}: unexpected price ${token} (not canonical for this page)`);
    }
  }
}

function checkServicePrice(rel, slug, errors) {
  const html = readSafe(path.join(ROOT, rel));
  if (!html) {
    errors.push(`missing: ${rel}`);
    return;
  }
  const cfg = SERVICE_PRICING[slug];
  if (!cfg) return;

  if (priceVisibility(html, slug) === "no-public-price") {
    checkNoPublicPrice(rel, html, errors);
    return;
  }
  STATS["price-shown"]++;

  if (cfg.custom) {
    const ko = formatPriceDisplay(slug, "ko");
    const en = formatPriceDisplay(slug, "en");
    if (!html.includes(ko) && !html.includes(en)) {
      errors.push(`${rel}: expected custom quote label "${ko}" or "${en}"`);
    }
    // Custom pages should not show a fixed starting KRW from other services
    // (they may still mention none). Allow empty KRW set.
    checkKrwTokens(rel, html, new Set(), errors);
    return;
  }

  const langHint = rel.startsWith("ko/") ? "ko" : "en";
  const primary = formatPriceDisplay(slug, langHint);
  const fallbackKo = formatPriceDisplay(slug, "ko");
  if (!html.includes(primary) && !html.includes(fallbackKo)) {
    errors.push(`${rel}: expected canonical price "${primary}"`);
  }

  checkKrwTokens(rel, html, allowedAmountTokensForSlug(slug), errors);
}

function checkHubFile(rel, allowedTokens, errors) {
  const html = readSafe(path.join(ROOT, rel));
  if (!html) {
    errors.push(`missing: ${rel}`);
    return;
  }
  checkKrwTokens(rel, html, allowedTokens, errors);
}

function main() {
  const errors = [];
  const warns = [];

  for (const lang of LANGS) {
    checkHubFile(
      `${lang}/business/index.html`,
      allowedAmountTokensForSet(allServiceSlugs()),
      errors
    );
    for (const pillar of PILLAR_SLUGS) {
      const slugs = [...(PILLAR_SERVICE_SLUGS[pillar] || [])];
      checkHubFile(
        `${lang}/business/${pillar}/index.html`,
        allowedAmountTokensForSet(slugs),
        errors
      );
    }
    for (const page of BUSINESS_SERVICE_PAGES) {
      const route = page.routePath || page.slug;
      const rel = `${lang}/business/${route}/index.html`;
      if (lang === "ko" || lang === "en") {
        checkServicePrice(rel, page.slug, errors);
      } else {
        const html = readSafe(path.join(ROOT, rel));
        if (!html) {
          errors.push(`missing: ${rel}`);
          continue;
        }
        const cfg = SERVICE_PRICING[page.slug];
        if (!cfg) continue;
        if (priceVisibility(html, page.slug) === "no-public-price") {
          checkNoPublicPrice(rel, html, errors);
          continue;
        }
        STATS["price-shown"]++;
        if (cfg.custom) {
          checkKrwTokens(rel, html, new Set(), errors);
        } else {
          checkKrwTokens(rel, html, allowedAmountTokensForSlug(page.slug), errors);
          if (!html.includes(formatKrw(cfg.amount))) {
            errors.push(`${rel}: expected canonical amount ${formatKrw(cfg.amount)}`);
          }
        }
      }
    }
  }

  if (warns.length) console.log("Warnings:", warns.length);
  warns.forEach((w) => console.log(`[WARN] ${w}`));
  errors.forEach((e) => console.log(`[ERROR] ${e}`));
  console.log(`\nService pages: ${STATS["price-shown"]} price-shown (full checks), ${STATS["no-public-price"]} no-public-price (residue check).`);
  console.log(`Pricing QA: ${errors.length} error(s), ${warns.length} warning(s).`);
  process.exit(errors.length ? 1 : 0);
}

main();
