#!/usr/bin/env node
/**
 * Render Newon Ideas hub + success pages for all languages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ideaProducts } from "./ideas-data.mjs";
import { replaceLegacyChrome } from "./inject-chrome.mjs";

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

const I18N_JS_KEYS = [
  "submitApp",
  "submitFeature",
  "submitMessage",
  "submitting",
  "appFormTitle",
  "featureFormTitle",
  "msgFormTitle",
  "formSubject",
  "errRequired",
  "errEmail",
  "fail",
];

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

function t(flat, flatEn, key) {
  const val = pick(flat, flatEn, key);
  return val != null ? String(val) : "";
}

function applyTemplate(template, flat, flatEn) {
  let out = template.replace(/\{\{html:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    return val != null ? String(val) : "";
  });
  out = out.replace(/\{\{t:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    if (val === undefined || val === null) return "";
    return escapeHtml(String(val));
  });
  return out;
}

function hreflangIdeas(suffix) {
  const pathSuffix = suffix ? `${suffix}/` : "";
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/ideas/${pathSuffix}" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/ideas/${pathSuffix}" />`);
  return lines.join("\n");
}

function productOptionsHtml(flat, flatEn) {
  const ph = t(flat, flatEn, "ideas.featureProductPlaceholder");
  const opts = ideaProducts()
    .map((p) => `                <option value="${escapeHtml(p.slug)}">${escapeHtml(p.name)}</option>`)
    .join("\n");
  return `                <option value="">${escapeHtml(ph)}</option>\n${opts}`;
}

function ideasI18nJson(flat, flatEn) {
  const obj = {};
  for (const k of I18N_JS_KEYS) {
    obj[k] = t(flat, flatEn, `ideas.${k}`);
  }
  obj.typeApp = t(flat, flatEn, "ideas.type1En");
  obj.typeFeature = t(flat, flatEn, "ideas.type2En");
  obj.typeMessage = t(flat, flatEn, "ideas.type3En");
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function writeRootRedirect() {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/ideas/"/><title>Newon — Ideas</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/ideas/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/ideas/">Ideas</a> · <a href="/ko/ideas/">아이디어</a></p></body></html>`;
  const dir = path.join(ROOT, "ideas");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

function copyToPublish() {
  const pub = path.join(ROOT, "_publish");
  if (!fs.existsSync(pub)) return;
  const ideasPub = path.join(pub, "ideas");
  fs.mkdirSync(ideasPub, { recursive: true });
  for (const name of ["ideas.css", "ideas.js", "index.html"]) {
    const src = path.join(ROOT, "ideas", name);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(ideasPub, name));
  }
  for (const { dir } of LANGS) {
    const srcHub = path.join(ROOT, dir, "ideas", "index.html");
    const destHub = path.join(pub, dir, "ideas");
    fs.mkdirSync(destHub, { recursive: true });
    if (fs.existsSync(srcHub)) fs.copyFileSync(srcHub, path.join(destHub, "index.html"));
    const srcOk = path.join(ROOT, dir, "ideas", "success", "index.html");
    const destOk = path.join(pub, dir, "ideas", "success");
    fs.mkdirSync(destOk, { recursive: true });
    if (fs.existsSync(srcOk)) fs.copyFileSync(srcOk, path.join(destOk, "index.html"));
  }
}

const enData = loadJson("en.json");
const flatEn = flatten(enData);
const hubTpl = fs.readFileSync(path.join(ROOT, "templates", "ideas.html"), "utf8");
const okTpl = fs.readFileSync(path.join(ROOT, "templates", "ideas-success.html"), "utf8");

for (const { dir, file, htmlLang } of LANGS) {
  const merged = fillMissing(loadJson(file), enData);
  const flat = flatten(merged);

  let hub = hubTpl;
  hub = hub.replace(/\{\{LANG_DIR\}\}/g, dir);
  hub = hub.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  hub = hub.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
  hub = hub.replace(/\{\{HREFLANG_BLOCK_LEGAL\}\}/g, hreflangIdeas(""));
  hub = hub.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/ideas/`);
  hub = applyTemplate(hub, flat, flatEn);
  hub = replaceLegacyChrome(hub, flat, flatEn, { activeNav: "about" });
  hub = hub.replace("{{PRODUCT_OPTIONS}}", productOptionsHtml(flat, flatEn));
  hub = hub.replace("{{IDEAS_I18N}}", ideasI18nJson(flat, flatEn));
  const hubDir = path.join(ROOT, dir, "ideas");
  fs.mkdirSync(hubDir, { recursive: true });
  fs.writeFileSync(path.join(hubDir, "index.html"), hub);

  let ok = okTpl;
  ok = ok.replace(/\{\{LANG_DIR\}\}/g, dir);
  ok = ok.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  ok = ok.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
  ok = ok.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangIdeas("success"));
  ok = ok.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/ideas/success/`);
  ok = applyTemplate(ok, flat, flatEn);
  const okDir = path.join(hubDir, "success");
  fs.mkdirSync(okDir, { recursive: true });
  fs.writeFileSync(path.join(okDir, "index.html"), ok);
}

writeRootRedirect();
copyToPublish();

console.log(`render-ideas: ${LANGS.length} languages`);
