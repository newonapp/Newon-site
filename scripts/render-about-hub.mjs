#!/usr/bin/env node
/**
 * Render templates/about.html into {lang}/about/ for all locales.
 * Body HTML comes from about-page-body.mjs (live catalog / news / labs).
 */
import fs from "fs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import path from "path";
import { fileURLToPath } from "url";
import { buildAboutPageBody, getAboutSeo } from "./about-page-body.mjs";
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
  const out = target && typeof target === "object" && !Array.isArray(target) ? { ...target } : {};
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

function writeRootRedirect(page, titleEn, titleKo) {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/${page}/"/><title>Newon — ${titleEn}</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/${page}/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/${page}/">${titleEn}</a> · <a href="/ko/${page}/">${titleKo}</a></p></body></html>`;
  const dir = path.join(ROOT, page);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

function copyToPublish() {
  const pub = path.join(ROOT, "_publish");
  if (!fs.existsSync(pub)) return;
  for (const { dir } of LANGS) {
    const src = path.join(ROOT, dir, "about", "index.html");
    const destDir = path.join(pub, dir, "about");
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, path.join(destDir, "index.html"));
  }
  const rootAbout = path.join(ROOT, "about", "index.html");
  if (fs.existsSync(rootAbout)) {
    const destDir = path.join(pub, "about");
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(rootAbout, path.join(destDir, "index.html"));
  }
  for (const name of ["about-page.css", "about-page.js", "hub-pages.css"]) {
    const src = path.join(ROOT, name);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(pub, name));
  }
}

const enData = loadJson("en.json");
const flatEn = flatten(enData);
const template = fs.readFileSync(path.join(ROOT, "templates", "about.html"), "utf8");

for (const { dir, file, htmlLang } of LANGS) {
  const merged = fillMissing(loadJson(file), enData);
  const flat = flatten(merged);
  const copyLang = dir;
  const seo = getAboutSeo(copyLang);
  const body = buildAboutPageBody(copyLang, dir);

  let pt = template;
  pt = pt.replace(/\{\{LANG_DIR\}\}/g, dir);
  pt = pt.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  pt = pt.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
  pt = pt.replace(/\{\{HREFLANG_BLOCK_LEGAL\}\}/g, hreflangBlockLegal("about"));
  pt = pt.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/about/`);
  pt = pt.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(seo.seoTitle));
  pt = pt.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(clampSeoDescription(seo.metaDescription)));
  pt = pt.replace(/\{\{JS_SEO_TITLE\}\}/g, JSON.stringify(seo.seoTitle));
  pt = pt.replace(/\{\{JS_META_DESCRIPTION\}\}/g, JSON.stringify(clampSeoDescription(seo.metaDescription)));
  pt = pt.replace(/\{\{ABOUT_BODY\}\}/g, body);
  pt = applyTemplate(pt, flat, flatEn);
  if (seo.metaKeywords) {
    pt = pt.replace(
      /<meta name="keywords" content="[^"]*" \/>/,
      `<meta name="keywords" content="${escapeHtml(seo.metaKeywords)}" />`
    );
  }
  pt = injectSiteChrome(pt, flat, flatEn, { activeNav: "company", companySwitch: "about" });

  const pd = path.join(ROOT, dir, "about");
  fs.mkdirSync(pd, { recursive: true });
  fs.writeFileSync(path.join(pd, "index.html"), pt);
}

writeRootRedirect("about", "About Newon", "회사 소개");
copyToPublish();

console.log("render-about-hub: wrote redesigned about for 9 languages");
