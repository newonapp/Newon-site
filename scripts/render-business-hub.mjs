#!/usr/bin/env node
/**
 * Render business explore hub + inquiry hub for all locales.
 *   /business/         — Studio-style service overview (explore)
 *   /business/inquiry/ — Business Inquiry: six-platform business · partnership inquiries + form
 */
import { legacyRedirectScript } from "./contact-taxonomy.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { writeInquirySuccessPages } from "./gen-business-details.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { fillBusinessInquiry } from "./business-inquiry-sections.mjs";
import { businessExploreHtml } from "./business-explore-html.mjs";
import { renderStudioHeader, renderStudioFooter } from "./site-chrome.mjs";
import { renderBusinessServices } from "./render-business-services.mjs";
import { renderBusinessPillars } from "./render-business-pillars.mjs";
import { renderPillarServices } from "./render-pillar-services.mjs";
import { renderCreative } from "./render-creative.mjs";
import { fontLinksHtml } from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ORIGIN = "https://www.newon.app";
const LANGS = [
  { dir: "ko", file: "ko.json", htmlLang: "ko", hreflang: "ko" },
  { dir: "en", file: "en.json", htmlLang: "en", hreflang: "en" },
  { dir: "ja", file: "ja.json", htmlLang: "ja", hreflang: "ja" },
  { dir: "es", file: "es.json", htmlLang: "es", hreflang: "es" },
  { dir: "pt-br", file: "pt-br.json", htmlLang: "pt-BR", hreflang: "pt-BR" },
  { dir: "fr", file: "fr.json", htmlLang: "fr", hreflang: "fr" },
  { dir: "de", file: "de.json", htmlLang: "de", hreflang: "de" },
  { dir: "hi", file: "hi.json", htmlLang: "hi", hreflang: "hi" },
  { dir: "id", file: "id.json", htmlLang: "id", hreflang: "id" },
];
const OG_LOCALE = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  es: "es_ES",
  "pt-br": "pt_BR",
  fr: "fr_FR",
  de: "de_DE",
  hi: "hi_IN",
  id: "id_ID",
};

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
}

function flatten(obj, prefix = "") {
  const out = {};
  if (obj == null) return out;
  if (typeof obj !== "object") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

function fillMissing(target, source) {
  if (source == null || typeof source !== "object") return target;
  if (Array.isArray(source)) return target;
  const out = target && typeof target === "object" && !Array.isArray(target) ? target : {};
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = fillMissing(out[k], v);
    } else if (out[k] === undefined || out[k] === null || out[k] === "") {
      out[k] = v;
    }
  }
  return out;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pick(flat, flatEn, key) {
  let val = flat[key];
  if (val === undefined || val === null || val === "") val = flatEn[key];
  return val;
}

function applyTemplate(template, flat, flatEn) {
  let out = template.replace(/\{\{html:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    return val != null ? String(val) : "";
  });
  out = out.replace(/\{\{js:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    return JSON.stringify(val != null ? String(val) : "");
  });
  out = out.replace(/\{\{t:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    if (val === undefined || val === null) return "";
    return escapeHtml(String(val));
  });
  return out;
}

function hreflangBlock(pagePath) {
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/${pagePath}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/${pagePath}/" />`);
  return lines.join("\n");
}

const hubShell = fs.readFileSync(path.join(ROOT, "templates", "hub-shell.html"), "utf8");
const inquiryTemplate = fs.readFileSync(path.join(ROOT, "templates", "business-inquiry.html"), "utf8");
const exploreOnly = process.argv.includes("--explore-only");
const inquiryOnly = process.argv.includes("--inquiry-only");

const flatEn = flatten(loadJson("en.json"));

for (const { dir, file, htmlLang } of LANGS) {
  const flat = flatten(loadJson(file));

  if (!inquiryOnly) {
  // Explore hub — /business/
  const exploreTitle =
    pick(flat, flatEn, "business.exploreSeoTitle") || pick(flat, flatEn, "business.seoTitle");
  const exploreDesc =
    pick(flat, flatEn, "business.exploreMetaDescription") || pick(flat, flatEn, "business.metaDescription");
  const exploreCanonical = `${SITE_ORIGIN}/${dir}/business/`;
  let explore = hubShell;
  explore = explore.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  explore = explore.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(dir));
  explore = explore.replace(/\{\{TITLE\}\}/g, escapeHtml(exploreTitle));
  explore = explore.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(clampSeoDescription(exploreDesc)));
  explore = explore.replace(/\{\{CANONICAL\}\}/g, exploreCanonical);
  explore = explore.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
  explore = explore.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock("business"));
  explore = explore.replace(
    /\{\{SKIP_LABEL\}\}/g,
    escapeHtml(pick(flat, flatEn, "common.skipToContent") || "Skip to content")
  );
  explore = explore.replace(/\{\{MAIN_CONTENT\}\}/g, businessExploreHtml(flat, flatEn, dir));
  explore = explore.replace(/\{\{EXTRA_CSS\}\}/g, "");
  explore = explore.replace(/\{\{EXTRA_SCRIPTS\}\}/g, "");
  explore = explore.replace(
    /\{\{CHROME_HEADER\}\}/g,
    renderStudioHeader(flat, flatEn, { activeNav: "business", base: "../" })
  );
  explore = explore.replace(
    /\{\{CHROME_FOOTER\}\}/g,
    renderStudioFooter(flat, flatEn, { base: "../" })
  );
  const exploreDir = path.join(ROOT, dir, "business");
  fs.mkdirSync(exploreDir, { recursive: true });
  fs.writeFileSync(path.join(exploreDir, "index.html"), explore);
  }

  if (exploreOnly) continue;

  // Inquiry hub — /business/inquiry/
  let inquiry = inquiryTemplate;
  inquiry = inquiry.replace(/\{\{LANG_DIR\}\}/g, dir);
  // Forward to the unified /{lang}/contact/ (store purchase inflow excepted) — scripts/contact-taxonomy.mjs
  inquiry = inquiry.replace("{{CONTACT_FORWARD}}", () => legacyRedirectScript(dir, "business-inquiry"));
  inquiry = inquiry.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  inquiry = inquiry.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(dir));
  inquiry = inquiry.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
  inquiry = inquiry.replace(/\{\{HREFLANG_BLOCK_LEGAL\}\}/g, hreflangBlock("business/inquiry"));
  inquiry = inquiry.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/business/inquiry/`);
  // Business Inquiry copy (six-platform business · partnership inquiries) — scripts/business-inquiry-copy.mjs
  inquiry = fillBusinessInquiry(inquiry, dir);
  inquiry = applyTemplate(inquiry, flat, flatEn);
  inquiry = injectSiteChrome(inquiry, flat, flatEn, { activeNav: "business", base: "../../" });
  const inquiryDir = path.join(ROOT, dir, "business", "inquiry");
  fs.mkdirSync(inquiryDir, { recursive: true });
  fs.writeFileSync(path.join(inquiryDir, "index.html"), inquiry);
}

if (!exploreOnly && !inquiryOnly) {
  writeInquirySuccessPages();
  renderBusinessServices();
  renderBusinessPillars();
  renderPillarServices();
  renderCreative();
}

const pub = path.join(ROOT, "_publish");
if (fs.existsSync(pub)) {
  for (const { dir } of LANGS) {
    for (const sub of ["", "inquiry"]) {
      const src = path.join(ROOT, dir, "business", sub, "index.html");
      if (!fs.existsSync(src)) continue;
      const destDir = path.join(pub, dir, "business", sub);
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, path.join(destDir, "index.html"));
    }
  }
}

console.log(
  exploreOnly
    ? "render-business-hub: wrote explore hub pages only (9 langs)"
    : inquiryOnly
      ? "render-business-hub: wrote inquiry hub pages only (9 langs)"
      : "render-business-hub: wrote explore + inquiry hub pages (9 langs)"
);
