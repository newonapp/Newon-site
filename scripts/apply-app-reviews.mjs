#!/usr/bin/env node
/** Insert user review sections above features + sync locale keys. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  REVIEW_APPS,
  DATA_FILE_BY_NS,
  SP_FILE_BY_LANG,
  reviewKeysForLang,
  reviewsSectionHtml,
} from "./app-reviews-copy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "locales");
const TPL = path.join(ROOT, "templates");
const SITE_LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function patchDataReviews(filePath, keysKo, keysEn) {
  let s = fs.readFileSync(filePath, "utf8");
  for (const [lang, keys] of [
    ["Ko", keysKo],
    ["En", keysEn],
  ]) {
    const blockRe = new RegExp(`(export const \\w+${lang} = \\{)([\\s\\S]*?)(\\n  featuresLabel:)`, "m");
    const m = s.match(blockRe);
    if (!m) {
      console.warn(`apply-app-reviews: block not found in ${path.basename(filePath)} (${lang})`);
      continue;
    }
    let body = m[2];
    body = body.replace(/,  reviews(?:Label|Title): \"[^\"]*\"(?:,  review\d+(?:Emoji|Quote|Meta): \"[^\"]*\")+/g, "");
    body = body.replace(/\n  reviews(?:Label|Title):[^\n]*\n/g, "");
    body = body.replace(/\n  review\d+(?:Emoji|Quote|Meta):[^\n]*\n/g, "");
    const lines = Object.entries(keys)
      .map(([k, v]) => `\n  ${k}: ${JSON.stringify(v)},`)
      .join("");
    s = s.replace(blockRe, `$1${body}${lines}$3`);
  }
  fs.writeFileSync(filePath, s, "utf8");
}

function stripExistingReviewKeys(obj) {
  for (const k of Object.keys(obj)) {
    if (k.startsWith("review") || k === "reviewsLabel" || k === "reviewsTitle") delete obj[k];
  }
}

for (const app of REVIEW_APPS) {
  const dataFile = DATA_FILE_BY_NS[app.ns];
  if (dataFile) {
    patchDataReviews(
      path.join(ROOT, "scripts", dataFile),
      reviewKeysForLang("ko", app),
      reviewKeysForLang("en", app)
    );
  }
}

for (const lang of SITE_LANGS) {
  const keysFor = (ns) => reviewKeysForLang(lang, REVIEW_APPS.find((a) => a.ns === ns));

  const spFile = SP_FILE_BY_LANG[lang];
  if (spFile && REVIEW_APPS.some((a) => a.ns === "sp")) {
    const p = path.join(LOCALES, spFile);
    const sp = JSON.parse(fs.readFileSync(p, "utf8"));
    stripExistingReviewKeys(sp);
    Object.assign(sp, keysFor("sp"));
    fs.writeFileSync(p, JSON.stringify(sp, null, 2) + "\n", "utf8");
  }

  const localePath = path.join(LOCALES, `${lang}.json`);
  if (!fs.existsSync(localePath)) continue;
  const j = JSON.parse(fs.readFileSync(localePath, "utf8"));
  for (const app of REVIEW_APPS) {
    if (!j[app.ns]) continue;
    stripExistingReviewKeys(j[app.ns]);
    Object.assign(j[app.ns], keysFor(app.ns));
  }
  fs.writeFileSync(localePath, JSON.stringify(j, null, 2) + "\n", "utf8");
}

function stripReviewAccent(html) {
  return html.replace(
    /(<blockquote class="ox-review-quote">\s*<p>&ldquo;)<span class="ox-accent">(\{\{t:[a-z]+\.review\d+Quote\}\})<\/span>(&rdquo;<\/p>)/g,
    "$1$2$3"
  );
}

function insertReviewsSection(html, ns) {
  const marker = `id="${ns}-reviews"`;
  if (html.includes(marker)) return html;

  const featuresRe = new RegExp(`(\\s*)<section id="${ns}-features"`, "m");
  if (!featuresRe.test(html)) return html;

  return html.replace(featuresRe, `\n\n        ${reviewsSectionHtml(ns)}\n\n$1<section id="${ns}-features"`);
}

const templateFiles = fs
  .readdirSync(TPL)
  .filter((f) => f.endsWith("-app-inc.html") || f === "index.html" || f === "subping-page.html");

for (const name of templateFiles) {
  const p = path.join(TPL, name);
  let html = fs.readFileSync(p, "utf8");
  let changed = false;
  for (const app of REVIEW_APPS) {
    const next = insertReviewsSection(html, app.ns);
    if (next !== html) {
      html = next;
      changed = true;
    }
  }
  const stripped = stripReviewAccent(html);
  if (stripped !== html) {
    html = stripped;
    changed = true;
  }
  if (changed) fs.writeFileSync(p, html, "utf8");
}

console.log("apply-app-reviews: OK");
