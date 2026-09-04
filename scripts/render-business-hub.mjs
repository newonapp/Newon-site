#!/usr/bin/env node
/**
 * Render business explore hub + inquiry hub for all locales.
 *   /business/         — Studio-style service overview (explore)
 *   /business/inquiry/ — Full collaboration page + inquiry form
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  APP_CATALOG,
  BUSINESS_APP_EXTRAS,
  BUSINESS_ECOSYSTEM,
} from "./portfolio-data.mjs";
import { writeInquirySuccessPages } from "./gen-business-details.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { businessInquiryExploreHtml } from "./business-inquiry-explore-html.mjs";
import { businessExploreHtml } from "./business-explore-html.mjs";
import { renderStudioHeader, renderStudioFooter } from "./site-chrome.mjs";
import { renderBusinessServices } from "./render-business-services.mjs";
import { renderBusinessPillars } from "./render-business-pillars.mjs";
import { renderPillarServices } from "./render-pillar-services.mjs";
import { renderCreative } from "./render-creative.mjs";
import { fontLinksHtml } from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";
import {
  businessInquirySelectOptionsHtml,
  businessInquiryServiceMap,
  businessInquiryPackagePrices,
} from "./business-pricing.mjs";

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

function businessEcosystemHtml(flat, flatEn, appPrefix = "../") {
  const bySlug = Object.fromEntries(
    [...APP_CATALOG, ...BUSINESS_APP_EXTRAS].map((app) => [app.slug, app])
  );
  return BUSINESS_ECOSYSTEM.map((group) => {
    const title = escapeHtml(pick(flat, flatEn, group.titleKey) || group.titleKey);
    const apps = group.slugs
      .map((slug) => bySlug[slug])
      .filter(Boolean)
      .map(
        (app) => `<a class="bz-app" href="${appPrefix}${app.homeHash.replace(/^\.\.\//, "")}">
                  <img src="${escapeHtml(app.icon)}" alt="" width="36" height="36" decoding="async" />
                  <span>${escapeHtml(app.name)}</span>
                </a>`
      )
      .join("\n                ");
    return `<div class="bz-eco-card">
              <h3>${title}</h3>
              <div class="bz-app-row">
                ${apps}
              </div>
            </div>`;
  }).join("\n            ");
}

const hubShell = fs.readFileSync(path.join(ROOT, "templates", "hub-shell.html"), "utf8");
const inquiryTemplate = fs.readFileSync(path.join(ROOT, "templates", "business-inquiry.html"), "utf8");
const enData = loadJson("en.json");

for (const { file } of LANGS) {
  if (file === "en.json") continue;
  const locPath = path.join(ROOT, "locales", file);
  const loc = JSON.parse(fs.readFileSync(locPath, "utf8"));
  loc.business = fillMissing(loc.business, enData.business);
  fs.writeFileSync(locPath, JSON.stringify(loc, null, 2) + "\n");
}

const flatEn = flatten(loadJson("en.json"));

for (const { dir, file, htmlLang } of LANGS) {
  const flat = flatten(loadJson(file));

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

  // Inquiry hub — /business/inquiry/
  let inquiry = inquiryTemplate;
  inquiry = inquiry.replace(/\{\{LANG_DIR\}\}/g, dir);
  inquiry = inquiry.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  inquiry = inquiry.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(dir));
  inquiry = inquiry.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
  inquiry = inquiry.replace(/\{\{HREFLANG_BLOCK_LEGAL\}\}/g, hreflangBlock("business/inquiry"));
  inquiry = inquiry.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/business/inquiry/`);
  inquiry = applyTemplate(inquiry, flat, flatEn);
  const pkgPrices = businessInquiryPackagePrices(dir === "ko" ? "ko" : "en");
  inquiry = inquiry.replace(/\{\{BUSINESS_SELECT_OPTIONS\}\}/g, businessInquirySelectOptionsHtml());
  inquiry = inquiry.replace(
    /\{\{BUSINESS_SERVICE_MAP_JSON\}\}/g,
    JSON.stringify(businessInquiryServiceMap())
  );
  inquiry = inquiry.replace(/\{\{BUSINESS_PKG_LANDING_PRICE\}\}/g, escapeHtml(pkgPrices.landing));
  inquiry = inquiry.replace(/\{\{BUSINESS_PKG_WEB_PRICE\}\}/g, escapeHtml(pkgPrices.web));
  inquiry = inquiry.replace(/\{\{BUSINESS_PKG_MVP_PRICE\}\}/g, escapeHtml(pkgPrices.mvp));
  inquiry = inquiry.replace(/\{\{BUSINESS_PKG_CUSTOM_PRICE\}\}/g, escapeHtml(pkgPrices.custom));
  inquiry = inquiry.replace(/\{\{BUSINESS_ECOSYSTEM\}\}/g, businessEcosystemHtml(flat, flatEn, "../../"));
  inquiry = inquiry.replace(
    /\{\{BUSINESS_SERVICES\}\}/g,
    businessInquiryExploreHtml(flat, flatEn, dir)
  );
  inquiry = injectSiteChrome(inquiry, flat, flatEn, { activeNav: "business", base: "../../" });
  const inquiryDir = path.join(ROOT, dir, "business", "inquiry");
  fs.mkdirSync(inquiryDir, { recursive: true });
  fs.writeFileSync(path.join(inquiryDir, "index.html"), inquiry);
}

writeInquirySuccessPages();
renderBusinessServices();
renderBusinessPillars();
renderPillarServices();
renderCreative();

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

console.log("render-business-hub: wrote explore + inquiry hub pages (9 langs)");
