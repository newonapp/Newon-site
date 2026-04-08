#!/usr/bin/env node
/**
 * Reads locale JSON from locales/*.json and templates/*.html,
 * emits static pages: {lang}/index.html, {lang}/privacy/index.html, {lang}/terms/index.html
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const I18N_IMG = path.join(ROOT, "i18n-img");
const OX_IMG = path.join(ROOT, "ox-img");

/**
 * [[IMG:file.png]] → /i18n-img/{lang}/file.png if present, else /ox-img/file.png if present, else /file.png
 */
function localizedImageUrl(langDir, filename) {
  const localized = path.join(I18N_IMG, langDir, filename);
  if (fs.existsSync(localized)) {
    return `/i18n-img/${langDir}/${filename}`;
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

function hreflangBlock() {
  const base = "https://newon.app";
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${base}/${d}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${base}/en/" />`);
  return lines.join("\n");
}

function hreflangBlockLegal(page) {
  const base = "https://newon.app";
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${base}/${d}/${page}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${base}/en/${page}/" />`);
  return lines.join("\n");
}

const flatEn = flatten(loadJson("en.json"));

for (const { dir, file, htmlLang } of LANGS) {
  const data = loadJson(file);
  const flat = flatten(data);

  let tpl = fs.readFileSync(path.join(ROOT, "templates", "index.html"), "utf8");
  const baseUrl = `https://newon.app/${dir}/`;
  tpl = tpl.replace(/\{\{LANG_DIR\}\}/g, dir);
  tpl = tpl.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  tpl = tpl.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock());
  tpl = tpl.replace(/\{\{CANONICAL\}\}/g, baseUrl);
  tpl = applyTemplate(tpl, flat, flatEn);
  tpl = applyLocImgs(tpl, dir);

  const outDir = path.join(ROOT, dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), tpl);

  for (const page of ["privacy", "terms"]) {
    let pt = fs.readFileSync(path.join(ROOT, "templates", `${page}.html`), "utf8");
    pt = pt.replace(/\{\{LANG_DIR\}\}/g, dir);
    pt = pt.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
    pt = pt.replace(/\{\{HREFLANG_BLOCK_LEGAL\}\}/g, hreflangBlockLegal(page));
    pt = pt.replace(/\{\{CANONICAL\}\}/g, `https://newon.app/${dir}/${page}/`);
    pt = applyTemplate(pt, flat, flatEn);
    pt = applyLocImgs(pt, dir);
    const pd = path.join(ROOT, dir, page);
    fs.mkdirSync(pd, { recursive: true });
    fs.writeFileSync(path.join(pd, "index.html"), pt);
  }
}

console.log("i18n build OK:", LANGS.map((l) => l.dir).join(", "));
