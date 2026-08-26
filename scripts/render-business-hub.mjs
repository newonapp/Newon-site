#!/usr/bin/env node
/**
 * Render templates/business.html into {lang}/business/index.html only.
 * Does not touch home, portfolio, or other pages.
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
import { businessServicesHtml } from "./business-services-html.mjs";
import { renderBusinessServices } from "./render-business-services.mjs";
import { renderBusinessPillars } from "./render-business-pillars.mjs";
import { renderPillarServices } from "./render-pillar-services.mjs";
import { renderCreative } from "./render-creative.mjs";

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

function hreflangBlockLegal(page) {
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/${page}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/${page}/" />`);
  return lines.join("\n");
}

function businessEcosystemHtml(flat, flatEn) {
  const bySlug = Object.fromEntries(
    [...APP_CATALOG, ...BUSINESS_APP_EXTRAS].map((app) => [app.slug, app])
  );
  return BUSINESS_ECOSYSTEM.map((group) => {
    const title = escapeHtml(pick(flat, flatEn, group.titleKey) || group.titleKey);
    const apps = group.slugs
      .map((slug) => bySlug[slug])
      .filter(Boolean)
      .map(
        (app) => `<a class="bz-app" href="../${app.homeHash}">
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

const enData = loadJson("en.json");
for (const { file } of LANGS) {
  if (file === "en.json") continue;
  const locPath = path.join(ROOT, "locales", file);
  const loc = JSON.parse(fs.readFileSync(locPath, "utf8"));
  loc.business = fillMissing(loc.business, enData.business);
  fs.writeFileSync(locPath, JSON.stringify(loc, null, 2) + "\n");
}

const template = fs.readFileSync(path.join(ROOT, "templates", "business.html"), "utf8");
const flatEn = flatten(loadJson("en.json"));

for (const { dir, file, htmlLang } of LANGS) {
  const flat = flatten(loadJson(file));
  let pt = template;
  pt = pt.replace(/\{\{LANG_DIR\}\}/g, dir);
  pt = pt.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  pt = pt.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
  pt = pt.replace(/\{\{HREFLANG_BLOCK_LEGAL\}\}/g, hreflangBlockLegal("business"));
  pt = pt.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/business/`);
  pt = applyTemplate(pt, flat, flatEn);
  pt = pt.replace(/\{\{BUSINESS_ECOSYSTEM\}\}/g, businessEcosystemHtml(flat, flatEn));
  pt = pt.replace(/\{\{BUSINESS_SERVICES\}\}/g, businessServicesHtml(flat, flatEn, dir));
  pt = injectSiteChrome(pt, flat, flatEn, { activeNav: "business" });
  const pd = path.join(ROOT, dir, "business");
  fs.mkdirSync(pd, { recursive: true });
  fs.writeFileSync(path.join(pd, "index.html"), pt);
}

writeInquirySuccessPages();
renderBusinessServices();
renderBusinessPillars();
renderPillarServices();
renderCreative();

const pub = path.join(ROOT, "_publish");
if (fs.existsSync(pub)) {
  for (const { dir } of LANGS) {
    const src = path.join(ROOT, dir, "business", "index.html");
    const destDir = path.join(pub, dir, "business");
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, path.join(destDir, "index.html"));
  }
}

console.log("render-business-hub: wrote 9 language hub pages");
