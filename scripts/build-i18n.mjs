#!/usr/bin/env node
/**
 * Reads locale JSON from locales/*.json and templates/*.html,
 * emits: {lang}/index.html, {lang}/privacy/, {lang}/terms/, {lang}/about/,
 * {lang}/business/, per-app delete-account pages under each {lang}/, plus root redirects.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

import { DELETE_ACCOUNT_APPS } from "./delete-account-data.mjs";
import {
  APP_CATALOG,
  BUSINESS_APP_EXTRAS,
  BUSINESS_ECOSYSTEM,
} from "./portfolio-data.mjs";
import { mergeBusinessPagesLocales, writeInquirySuccessPages, BUSINESS_DETAIL_PAGES } from "./gen-business-details.mjs";
import { renderBusinessCollabDetails } from "./render-business-collab-details.mjs";
import { renderBusinessServices } from "./render-business-services.mjs";
import { BUSINESS_SERVICE_PAGES } from "./business-service-catalog.mjs";
import { publishedArticles } from "./news-data.mjs";
import { buildHomeStudioBody } from "./home-page-body.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { businessServicesHtml } from "./business-services-html.mjs";
import { renderGlobalHeader } from "./site-chrome.mjs";
import { fontLinksHtml } from "./hub-utils.mjs";
import { clampSeoDescription, isSeoDescriptionKey } from "./seo-meta.mjs";
import { STORE_PRODUCTS, LABS_EXPERIMENTS } from "./resources-data.mjs";
import { TOOLS } from "./tools-data.mjs";
import {
  STUDIO_SERVICE_PRICING,
  STUDIO_PILLAR_SERVICE_SLUGS,
  studioServicePagePath,
} from "./studio-pricing.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function runScript(name) {
  const r = spawnSync(process.execPath, [path.join(__dirname, name)], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

runScript("run-index-patches.mjs");
runScript("run-all-locale-patches.mjs");
const I18N_IMG = path.join(ROOT, "i18n-img");
const OX_IMG = path.join(ROOT, "ox-img");

/**
 * [[IMG:file.png]] resolution:
 * 1) ox-showcase-NN.png: KO uses i18n-img/ko/ (else ja); all other langs use i18n-img/en/ (English UI art).
 * 2) pm-showcase-NN.png: KO uses /subping-img/ (Korean UI). JA / ES / pt-BR use i18n-img/{lang}/ when present.
 *    All other locales (EN, FR, DE, HI, ID, …) use i18n-img/en/ (same English screenshots); then /subping-img/ fallback.
 * 2b) sp-showcase-NN.png (SubPing): KO → /subping-img/; JA / ES / pt-BR → i18n-img/{lang}/;
 *     EN + FR + DE + HI + ID → i18n-img/en/ (English UI art).
 * 3) sv-showcase-NN.png: i18n-img/{lang}/ if present; otherwise i18n-img/en/ (English UI); otherwise i18n-img/ko/.
 * 3b) bl-showcase-NN.png / pl-showcase-NN.png / pu-showcase-NN.png / cu-showcase-NN.png / gu-showcase-NN.png / np-showcase-NN.png: i18n-img/{lang}/ if present; otherwise i18n-img/en/; otherwise i18n-img/ko/.
 * 4) /i18n-img/{lang}/file.png if present
 * 5) Korean only: /subping-img/ before EN fallback
 * 6) /i18n-img/en/file.png if present
 * 7) /subping-img/file.png
 * 8) /ox-img/file.png, else /file.png
 */
function localizedImageUrl(langDir, filename) {
  if (/^ox-showcase-\d+\.png$/.test(filename)) {
    if (langDir === "ko") {
      const koScroll = path.join(I18N_IMG, "ko", filename);
      if (fs.existsSync(koScroll)) {
        return `/i18n-img/ko/${filename}`;
      }
      const jaScroll = path.join(I18N_IMG, "ja", filename);
      if (fs.existsSync(jaScroll)) {
        return `/i18n-img/ja/${filename}`;
      }
    } else {
      const enScroll = path.join(I18N_IMG, "en", filename);
      if (fs.existsSync(enScroll)) {
        return `/i18n-img/en/${filename}`;
      }
    }
  }
  if (/^pm-showcase-\d+\.png$/.test(filename)) {
    if (langDir === "ko") {
      const subpingKo = path.join(ROOT, "subping-img", filename);
      if (fs.existsSync(subpingKo)) {
        return `/subping-img/${filename}`;
      }
    }
    if (langDir === "ja" || langDir === "es" || langDir === "pt-br") {
      const ownPm = path.join(I18N_IMG, langDir, filename);
      if (fs.existsSync(ownPm)) {
        return `/i18n-img/${langDir}/${filename}`;
      }
    }
    const enPm = path.join(I18N_IMG, "en", filename);
    if (fs.existsSync(enPm)) {
      return `/i18n-img/en/${filename}`;
    }
    const subpingPm = path.join(ROOT, "subping-img", filename);
    if (fs.existsSync(subpingPm)) {
      return `/subping-img/${filename}`;
    }
  }
  if (/^sp-showcase-\d+\.png$/.test(filename)) {
    if (langDir === "ko") {
      const subpingKo = path.join(ROOT, "subping-img", filename);
      if (fs.existsSync(subpingKo)) {
        return `/subping-img/${filename}`;
      }
    }
    if (langDir === "ja" || langDir === "es" || langDir === "pt-br") {
      const ownSp = path.join(I18N_IMG, langDir, filename);
      if (fs.existsSync(ownSp)) {
        return `/i18n-img/${langDir}/${filename}`;
      }
    }
    const enSp = path.join(I18N_IMG, "en", filename);
    if (fs.existsSync(enSp)) {
      return `/i18n-img/en/${filename}`;
    }
    const subpingFallback = path.join(ROOT, "subping-img", filename);
    if (fs.existsSync(subpingFallback)) {
      return `/subping-img/${filename}`;
    }
  }
  if (/^sv-showcase-\d+\.png$/.test(filename)) {
    const forLang = path.join(I18N_IMG, langDir, filename);
    if (fs.existsSync(forLang)) {
      return `/i18n-img/${langDir}/${filename}`;
    }
    const enSv = path.join(I18N_IMG, "en", filename);
    if (fs.existsSync(enSv)) {
      return `/i18n-img/en/${filename}`;
    }
    const koSv = path.join(I18N_IMG, "ko", filename);
    if (fs.existsSync(koSv)) {
      return `/i18n-img/ko/${filename}`;
    }
  }
  if (/^bl-showcase-\d+\.png$/.test(filename) || /^pl-showcase-\d+\.png$/.test(filename) || /^pu-showcase-\d+\.png$/.test(filename) || /^cu-showcase-\d+\.png$/.test(filename) || /^gu-showcase-\d+\.png$/.test(filename) || /^np-showcase-\d+\.png$/.test(filename) || /^mw-showcase-\d+\.png$/.test(filename)) {
    const forLang = path.join(I18N_IMG, langDir, filename);
    if (fs.existsSync(forLang)) {
      return `/i18n-img/${langDir}/${filename}`;
    }
    const enBl = path.join(I18N_IMG, "en", filename);
    if (fs.existsSync(enBl)) {
      return `/i18n-img/en/${filename}`;
    }
    const koBl = path.join(I18N_IMG, "ko", filename);
    if (fs.existsSync(koBl)) {
      return `/i18n-img/ko/${filename}`;
    }
  }
  const localized = path.join(I18N_IMG, langDir, filename);
  if (fs.existsSync(localized)) {
    return `/i18n-img/${langDir}/${filename}`;
  }
  if (langDir === "ko") {
    const subpingKo = path.join(ROOT, "subping-img", filename);
    if (fs.existsSync(subpingKo)) {
      return `/subping-img/${filename}`;
    }
  }
  const english = path.join(I18N_IMG, "en", filename);
  if (fs.existsSync(english)) {
    return `/i18n-img/en/${filename}`;
  }
  const subpingShared = path.join(ROOT, "subping-img", filename);
  if (fs.existsSync(subpingShared)) {
    return `/subping-img/${filename}`;
  }
  const oxShared = path.join(OX_IMG, filename);
  if (fs.existsSync(oxShared)) {
    return `/ox-img/${filename}`;
  }
  return `/${filename}`;
}

function applyLocImgs(template, langDir) {
  return template.replace(/\[\[IMG:([^\]]+)\]\]/g, (_, filename) =>
    localizedImageUrl(langDir, filename.trim())
  );
}

/** All locales: 9-up horizontal scroll; composite ox-month-panels strip only */
function stripOxMonthShowcaseVariants(template, _langDir) {
  return template.replace(
    /<!-- OX_MONTH_PANELS_SINGLE_START -->[\s\S]*?<!-- OX_MONTH_PANELS_SINGLE_END -->\n?/,
    ""
  );
}

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

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
}

function flatten(obj, prefix = "") {
  const out = {};
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== "object") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    Object.assign(out, flatten(v, p));
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

function applyTemplate(template, flat, flatEn) {
  let out = template.replace(/\{\{html:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    return val != null ? String(val) : "";
  });
  out = out.replace(/\{\{js:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    let s = val != null ? String(val) : "";
    if (isSeoDescriptionKey(key)) s = clampSeoDescription(s);
    return JSON.stringify(s);
  });
  out = out.replace(/\{\{t:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    if (val === undefined || val === null) return "";
    let s = String(val);
    if (isSeoDescriptionKey(key)) s = clampSeoDescription(s);
    return escapeHtml(s);
  });
  return out;
}

const SITE_ORIGIN = "https://www.newon.app";

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

function hreflangBlock() {
  const base = SITE_ORIGIN;
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${base}/${d}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${base}/en/" />`);
  return lines.join("\n");
}

function hreflangBlockLegal(page) {
  const base = SITE_ORIGIN;
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${base}/${d}/${page}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${base}/en/${page}/" />`);
  return lines.join("\n");
}

/** Public unified policy URL (Korean body); links from Play / app pages. */
function hreflangBlockPrivacyRoot() {
  const base = SITE_ORIGIN;
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${base}/${d}/privacy/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="https://www.newon.app/privacy/" />`);
  return lines.join("\n");
}

function writeRootPrivacyPage() {
  const data = loadJson("ko.json");
  const flat = flatten(data);
  const flatEn = flatten(loadJson("en.json"));

  let pt = fs.readFileSync(path.join(ROOT, "templates", "privacy.html"), "utf8");
  pt = pt.replace(/\{\{LANG_DIR\}\}/g, "ko");
  pt = pt.replace(/\{\{HTML_LANG\}\}/g, "ko");
  pt = pt.replace(/\{\{HREFLANG_BLOCK_LEGAL\}\}/g, hreflangBlockPrivacyRoot());
  pt = pt.replace(/\{\{CANONICAL\}\}/g, "https://www.newon.app/privacy/");
  pt = applyTemplate(pt, flat, flatEn);
  pt = applyLocImgs(pt, "ko");

  const pd = path.join(ROOT, "privacy");
  fs.mkdirSync(pd, { recursive: true });
  fs.writeFileSync(path.join(pd, "index.html"), pt);
}

const flatEn = flatten(loadJson("en.json"));

for (const { dir, file, htmlLang } of LANGS) {
  const data = loadJson(file);
  const flat = flatten(data);

  let tpl = fs.readFileSync(path.join(ROOT, "templates", "index.html"), "utf8");
  const baseUrl = `${SITE_ORIGIN}/${dir}/`;
  tpl = tpl.replace(/\{\{LANG_DIR\}\}/g, dir);
  tpl = tpl.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  tpl = tpl.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(dir));
  tpl = tpl.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
  tpl = tpl.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock());
  tpl = tpl.replace(/\{\{CANONICAL\}\}/g, baseUrl);
  tpl = applyTemplate(tpl, flat, flatEn);
  if (!tpl.includes("site-dark.css")) {
    const headCss = `    <link rel="stylesheet" href="/site-dark.css?v=20260902perf1" />\n    <link rel="stylesheet" href="/site-mobile.css?v=20260902nav1" />`;
    tpl = tpl.replace(/<\/head>/, `${headCss}\n  </head>`);
  }
  tpl = applyLocImgs(tpl, dir);
  tpl = stripOxMonthShowcaseVariants(tpl, dir);

  const copyLang = dir === "ko" ? "ko" : "en";
  tpl = tpl.replace(/\{\{HOME_STUDIO_BODY\}\}/g, buildHomeStudioBody(copyLang));

  tpl = tpl.replace(/\{\{GLOBAL_HEADER\}\}/g, renderGlobalHeader(flat, flatEn, { activeNav: "", base: "", idSuffix: "home", langDir: dir }));

  const outDir = path.join(ROOT, dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), tpl);

  for (const page of ["privacy", "terms", "business"]) {
    let pt = fs.readFileSync(path.join(ROOT, "templates", `${page}.html`), "utf8");
    pt = pt.replace(/\{\{LANG_DIR\}\}/g, dir);
    pt = pt.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
    pt = pt.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
    pt = pt.replace(/\{\{HREFLANG_BLOCK_LEGAL\}\}/g, hreflangBlockLegal(page));
    pt = pt.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/${page}/`);
    pt = applyTemplate(pt, flat, flatEn);
    pt = applyLocImgs(pt, dir);
    if (page === "business") {
      pt = pt.replace(/\{\{BUSINESS_ECOSYSTEM\}\}/g, businessEcosystemHtml(flat, flatEn));
      pt = pt.replace(/\{\{BUSINESS_SERVICES\}\}/g, businessServicesHtml(flat, flatEn));
    }
    if (page === "business") {
      pt = injectSiteChrome(pt, flat, flatEn, { activeNav: "business" });
    }
    const pd = path.join(ROOT, dir, page);
    fs.mkdirSync(pd, { recursive: true });
    fs.writeFileSync(path.join(pd, "index.html"), pt);
  }

  for (const app of DELETE_ACCOUNT_APPS) {
    const tplName =
      app.ns === "ox"
        ? "oxmonth-delete-account.html"
        : app.ns === "sp"
          ? "subping-delete-account.html"
          : "app-delete-account.html";
    let delHtml = fs.readFileSync(path.join(ROOT, "templates", tplName), "utf8");
    if (tplName === "app-delete-account.html") {
      delHtml = delHtml.replace(/__NS__/g, app.ns);
    }
    delHtml = delHtml.replace(/\{\{LANG_DIR\}\}/g, dir);
    delHtml = delHtml.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
    delHtml = delHtml.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/${app.slug}/delete-account/`);
    delHtml = applyTemplate(delHtml, flat, flatEn);
    delHtml = applyLocImgs(delHtml, dir);
    const delOut = path.join(ROOT, dir, app.slug, "delete-account");
    fs.mkdirSync(delOut, { recursive: true });
    fs.writeFileSync(path.join(delOut, "index.html"), delHtml);
  }
}

/** Root / serves Korean homepage directly (no JS redirect — crawlers read robots/meta). */
function writeRootHomepage() {
  fs.copyFileSync(path.join(ROOT, "ko", "index.html"), path.join(ROOT, "index.html"));
}

writeRootHomepage();

writeRootPrivacyPage();

/** Root /{slug}/delete-account/ → localized page */
function writeRootDeleteAccountRedirects() {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  for (const app of DELETE_ACCOUNT_APPS) {
    const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex"/><title>Redirect</title><script>(function(){var L=${list};var d="ko";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/${app.slug}/delete-account/"+(location.hash||""));})();</script></head><body><p style="font-family:system-ui,sans-serif;padding:1.5rem"><a href="/ko/${app.slug}/delete-account/">${app.name} account deletion — continue</a></p></body></html>`;
    const dir = path.join(ROOT, app.slug, "delete-account");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html);
  }
}

writeRootDeleteAccountRedirects();

/** Root /terms/ → multilingual Newon terms (honors newon-lang-dir). Legacy Savy EULA: /terms/savy-ai-eula.html */
function writeRootTermsRedirect() {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex"/><title>Redirect</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/terms/"+(location.search||"")+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/terms/">Newon Terms</a> · <a href="/terms/savy-ai-eula.html">Savy EULA (standalone)</a></p></body></html>`;
  const dir = path.join(ROOT, "terms");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

writeRootTermsRedirect();

/** Root /about/ → localized about page (honors newon-lang-dir). */
function writeRootAboutRedirect() {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/about/"/><title>Newon — About</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/about/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/about/">About Newon</a> · <a href="/ko/about/">회사 소개</a></p></body></html>`;
  const dir = path.join(ROOT, "about");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

writeRootAboutRedirect();

function writeRootNewsRedirect() {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/news/"/><title>Newon — News</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/news/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/news/">News</a> · <a href="/ko/news/">새 소식</a></p></body></html>`;
  const dir = path.join(ROOT, "news");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

writeRootNewsRedirect();

function writeRootIdeasRedirect() {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/ideas/"/><title>Newon — Ideas</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/ideas/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/ideas/">Ideas</a> · <a href="/ko/ideas/">아이디어</a></p></body></html>`;
  const dir = path.join(ROOT, "ideas");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

writeRootIdeasRedirect();

/** Root /business/ → localized business page (honors newon-lang-dir). */
function writeRootBusinessRedirect() {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/business/"/><title>Newon — Business</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/business/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/business/">Business</a> · <a href="/ko/business/">Newon 비즈니스</a></p></body></html>`;
  const dir = path.join(ROOT, "business");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

writeRootBusinessRedirect();
mergeBusinessPagesLocales();
writeInquirySuccessPages();
renderBusinessCollabDetails();
renderBusinessServices();

/** robots.txt at site root (allow indexed pages; hide QR card + admin). */
function writeRobotsTxt() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /card-n7x4k9",
    "Disallow: /card-n7x4k9/",
    "Disallow: /admin/",
    "Disallow: /admin/growth/",
    "",
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    "",
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, "robots.txt"), body);
}

/**
 * Pure urlset sitemap (Naver-compatible): no xhtml:link.
 * Uses catalog routePath / studio paths; skips redirects, admin, success, delete-account.
 */
function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  /** @type {Map<string, { changefreq: string, priority: string }>} */
  const entries = new Map();

  function add(locPath, priority = "0.5", changefreq = "monthly") {
    const clean = String(locPath || "").replace(/^\/+/, "").replace(/\/+$/, "");
    const loc = clean ? `${SITE_ORIGIN}/${clean}/` : `${SITE_ORIGIN}/`;
    if (entries.has(loc)) return;
    // Soft existence check when locale HTML already exists from this/prior build
    if (clean) {
      const rel = clean.split("/").join(path.sep);
      const indexPath = path.join(ROOT, rel, "index.html");
      // Only enforce existence for known locale-prefixed paths after renders
      const first = clean.split("/")[0];
      const isLocale = LANGS.some((l) => l.dir === first);
      if (isLocale && !fs.existsSync(indexPath)) {
        return;
      }
    }
    entries.set(loc, { priority, changefreq });
  }

  function addAllLocales(subPath, priority, changefreq) {
    const rest = String(subPath || "").replace(/^\/+|\/+$/g, "");
    for (const { dir } of LANGS) {
      add(rest ? `${dir}/${rest}` : dir, priority, changefreq);
    }
  }

  // Root (Korean homepage copy) + locale homes
  add("", "1.0", "weekly");
  addAllLocales("", "0.9", "weekly");

  addAllLocales("about", "0.7", "monthly");
  addAllLocales("news", "0.6", "monthly");
  addAllLocales("ideas", "0.5", "monthly");
  for (const article of publishedArticles()) {
    addAllLocales(`news/${article.slug}`, "0.55", "monthly");
  }

  // Product hubs
  for (const page of ["products", "apps", "ai", "saas", "games", "tools", "market", "contact", "media"]) {
    addAllLocales(page, "0.65", "monthly");
  }

  // Live Tools details only (from tools-data — no hardcoded URL list)
  for (const tool of TOOLS) {
    if (tool.status !== "live") continue;
    addAllLocales(`tools/${tool.slug}`, "0.55", "monthly");
  }

  // Business hub + pillars + inquiry (not success)
  addAllLocales("business", "0.75", "monthly");
  for (const pillar of ["build", "automation", "research", "solutions"]) {
    addAllLocales(`business/${pillar}`, "0.7", "monthly");
  }
  addAllLocales("business/inquiry", "0.55", "monthly");

  for (const page of BUSINESS_DETAIL_PAGES) {
    const route = `business/collaboration/${page.pathSlug || page.slug}`;
    addAllLocales(route, "0.55", "monthly");
  }

  for (const page of BUSINESS_SERVICE_PAGES) {
    const route = page.routePath || page.slug;
    addAllLocales(`business/${route}`, "0.65", "monthly");
  }

  // Studio hub + pillars + indexable service details
  addAllLocales("studio", "0.7", "monthly");
  for (const pillar of Object.keys(STUDIO_PILLAR_SERVICE_SLUGS)) {
    addAllLocales(`studio/${pillar}`, "0.65", "monthly");
  }
  const skipStudioStatus = new Set(["COMING_SOON", "BUILDING"]);
  for (const slug of Object.keys(STUDIO_SERVICE_PRICING)) {
    const cfg = STUDIO_SERVICE_PRICING[slug];
    if (skipStudioStatus.has(String(cfg.status || "").toUpperCase())) continue;
    const pagePath = studioServicePagePath(slug);
    if (!pagePath) continue;
    addAllLocales(pagePath, "0.6", "monthly");
  }

  // Resources (canonical paths only — not /store /blog /labs aliases)
  for (const page of [
    "resources",
    "resources/store",
    "resources/insights",
    "resources/blog",
    "resources/labs",
    "resources/newsletter",
    "resources/education",
  ]) {
    addAllLocales(page, "0.65", "weekly");
  }
  try {
    for (const product of STORE_PRODUCTS) {
      if (product.listed === false) continue;
      addAllLocales(`resources/store/${product.slug}`, "0.5", "monthly");
    }
    for (const exp of LABS_EXPERIMENTS) {
      addAllLocales(`resources/labs/${exp.slug}`, "0.45", "monthly");
    }
  } catch {
    /* optional */
  }

  // Portfolio — locale canonical only (root /portfolio/ is a redirect stub)
  addAllLocales("portfolio", "0.65", "monthly");
  for (const app of APP_CATALOG) {
    addAllLocales(`portfolio/${app.slug}`, "0.55", "monthly");
  }

  // Legal
  addAllLocales("privacy", "0.3", "yearly");
  addAllLocales("terms", "0.3", "yearly");

  const esc = (s) => String(s).replace(/&/g, "&amp;");
  const body = [...entries.entries()]
    .map(([loc, meta]) =>
      [
        "  <url>",
        `    <loc>${esc(loc)}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${meta.changefreq}</changefreq>`,
        `    <priority>${meta.priority}</priority>`,
        "  </url>",
      ].join("\n")
    )
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
  console.log(
    `writeSitemap: ${entries.size} urls, ${(Buffer.byteLength(xml) / 1024).toFixed(1)} KB (no xhtml)`
  );
}

// robots/sitemap written after page renders so existence checks see real output
runScript("render-about-hub.mjs");
runScript("render-news.mjs");
runScript("render-ideas.mjs");
runScript("render-business-hub.mjs");
runScript("render-studio-hubs.mjs");
runScript("render-company.mjs");
runScript("render-blog.mjs");
runScript("generate-search-index.mjs");
runScript("generate-admin-data.mjs");
writeRobotsTxt();
writeSitemap();

console.log("i18n build OK:", LANGS.map((l) => l.dir).join(", "));
