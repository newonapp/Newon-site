#!/usr/bin/env node
/**
 * Render templates/about.html into {lang}/… only.
 * News and Ideas are rendered by dedicated scripts.
 * Does not regenerate home, portfolio, or business pages.
 */
import fs from "fs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ORIGIN = "https://www.newon.app";
const PAGES = ["about"];
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

function sitemapBlock(page, priority) {
  const alts = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <xhtml:link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/${page}/" />`
  );
  alts.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/${page}/" />`
  );
  const today = new Date().toISOString().slice(0, 10);
  return LANGS.map(
    ({ dir: d }) => `  <url>
    <loc>${SITE_ORIGIN}/${d}/${page}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
${alts.join("\n")}
  </url>`
  ).join("\n");
}

function patchSitemap() {
  const smPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(smPath)) return;
  let xml = fs.readFileSync(smPath, "utf8");
  for (const page of []) {
    if (xml.includes(`/${page}/</loc>`)) continue;
    xml = xml.replace("</urlset>", `${sitemapBlock(page, "0.6")}\n</urlset>`);
  }
  fs.writeFileSync(smPath, xml);
}

function copyToPublish() {
  const pub = path.join(ROOT, "_publish");
  if (!fs.existsSync(pub)) return;
  for (const { dir } of LANGS) {
    for (const page of PAGES) {
      const src = path.join(ROOT, dir, page, "index.html");
      const destDir = path.join(pub, dir, page);
      if (!fs.existsSync(src)) continue;
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, path.join(destDir, "index.html"));
    }
  }
  for (const page of PAGES) {
    const src = path.join(ROOT, page, "index.html");
    if (!fs.existsSync(src)) continue;
    const destDir = path.join(pub, page);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, path.join(destDir, "index.html"));
  }
  const smSrc = path.join(ROOT, "sitemap.xml");
  if (fs.existsSync(smSrc)) fs.copyFileSync(smSrc, path.join(pub, "sitemap.xml"));
}

const enData = loadJson("en.json");
const flatEn = flatten(enData);

for (const { dir, file, htmlLang } of LANGS) {
  const merged = fillMissing(loadJson(file), enData);
  const flat = flatten(merged);
  for (const page of PAGES) {
    let pt = fs.readFileSync(path.join(ROOT, "templates", `${page}.html`), "utf8");
    pt = pt.replace(/\{\{LANG_DIR\}\}/g, dir);
    pt = pt.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
    pt = pt.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
    pt = pt.replace(/\{\{HREFLANG_BLOCK_LEGAL\}\}/g, hreflangBlockLegal(page));
    pt = pt.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/${page}/`);
    pt = applyTemplate(pt, flat, flatEn);
    pt = injectSiteChrome(pt, flat, flatEn, { activeNav: "about" });
    const pd = path.join(ROOT, dir, page);
    fs.mkdirSync(pd, { recursive: true });
    fs.writeFileSync(path.join(pd, "index.html"), pt);
  }
}

patchSitemap();
copyToPublish();

console.log("render-about-hub: wrote about for 9 languages");
