#!/usr/bin/env node
/**
 * Reads locale JSON from locales/*.json and templates/*.html,
 * emits: {lang}/index.html, {lang}/privacy/, {lang}/terms/,
 * {lang}/oxmonth/delete-account/, {lang}/subping/delete-account/, plus root redirects for legacy URLs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

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
 * 3b) bl-showcase-NN.png / pl-showcase-NN.png / pu-showcase-NN.png / cu-showcase-NN.png / gu-showcase-NN.png: i18n-img/{lang}/ if present; otherwise i18n-img/en/; otherwise i18n-img/ko/.
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
  if (/^bl-showcase-\d+\.png$/.test(filename) || /^pl-showcase-\d+\.png$/.test(filename) || /^pu-showcase-\d+\.png$/.test(filename) || /^cu-showcase-\d+\.png$/.test(filename) || /^gu-showcase-\d+\.png$/.test(filename)) {
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

/** Public unified policy URL (Korean body); links from Play / app pages. */
function hreflangBlockPrivacyRoot() {
  const base = "https://newon.app";
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
  const baseUrl = `https://newon.app/${dir}/`;
  tpl = tpl.replace(/\{\{LANG_DIR\}\}/g, dir);
  tpl = tpl.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  tpl = tpl.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock());
  tpl = tpl.replace(/\{\{CANONICAL\}\}/g, baseUrl);
  tpl = applyTemplate(tpl, flat, flatEn);
  tpl = applyLocImgs(tpl, dir);
  tpl = stripOxMonthShowcaseVariants(tpl, dir);

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

  for (const del of [
    { tpl: "oxmonth-delete-account.html", canon: `https://newon.app/${dir}/oxmonth/delete-account/`, rel: ["oxmonth", "delete-account"] },
    { tpl: "subping-delete-account.html", canon: `https://newon.app/${dir}/subping/delete-account/`, rel: ["subping", "delete-account"] },
  ]) {
    let delHtml = fs.readFileSync(path.join(ROOT, "templates", del.tpl), "utf8");
    delHtml = delHtml.replace(/\{\{LANG_DIR\}\}/g, dir);
    delHtml = delHtml.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
    delHtml = delHtml.replace(/\{\{CANONICAL\}\}/g, del.canon);
    delHtml = applyTemplate(delHtml, flat, flatEn);
    delHtml = applyLocImgs(delHtml, dir);
    const delOut = path.join(ROOT, dir, ...del.rel);
    fs.mkdirSync(delOut, { recursive: true });
    fs.writeFileSync(path.join(delOut, "index.html"), delHtml);
  }
}

writeRootPrivacyPage();

/** Legacy URLs /oxmonth/delete-account/ and /subping/delete-account/ → localized page */
function writeRootDeleteAccountRedirects() {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const ox = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex"/><title>Redirect</title><script>(function(){var L=${list};var d="ko";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/oxmonth/delete-account/"+(location.hash||""));})();</script></head><body><p style="font-family:system-ui,sans-serif;padding:1.5rem"><a href="/ko/oxmonth/delete-account/">OX MONTH account deletion — continue</a></p></body></html>`;
  const sp = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex"/><title>Redirect</title><script>(function(){var L=${list};var d="ko";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/subping/delete-account/"+(location.hash||""));})();</script></head><body><p style="font-family:system-ui,sans-serif;padding:1.5rem"><a href="/ko/subping/delete-account/">SubPing account deletion — continue</a></p></body></html>`;
  const oxDir = path.join(ROOT, "oxmonth", "delete-account");
  const spDir = path.join(ROOT, "subping", "delete-account");
  fs.mkdirSync(oxDir, { recursive: true });
  fs.mkdirSync(spDir, { recursive: true });
  fs.writeFileSync(path.join(oxDir, "index.html"), ox);
  fs.writeFileSync(path.join(spDir, "index.html"), sp);
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

console.log("i18n build OK:", LANGS.map((l) => l.dir).join(", "));
