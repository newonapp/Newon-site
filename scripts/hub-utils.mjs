/**
 * Shared utilities for studio hub page generation.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SITE_ORIGIN = "https://www.newon.app";

export const LANGS = [
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

export const OG_LOCALE = {
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

export const STATUS_LABEL = {
  concept: { ko: "Coming Soon", en: "Coming Soon" },
  building: { ko: "준비 중", en: "Building" },
  beta: { ko: "Beta", en: "Beta" },
  live: { ko: "Live", en: "Live" },
  paused: { ko: "Paused", en: "Paused" },
  archived: { ko: "Archived", en: "Archived" },
};

export function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
}

export function flatten(obj, prefix = "") {
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

export function fillMissing(target, source) {
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

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function pick(flat, flatEn, key) {
  let val = flat[key];
  if (val === undefined || val === null || val === "") val = flatEn[key];
  return val;
}

export function applyTemplate(template, flat, flatEn, extras = {}) {
  let out = template;
  for (const [key, val] of Object.entries(extras)) {
    out = out.split(`{{${key}}}`).join(val != null ? String(val) : "");
  }
  out = out.replace(/\{\{html:([^}]+)\}\}/g, (_, key) => {
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

export function hreflangBlock(page, xDefaultLang = "en") {
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/${page}/" />`
  );
  lines.push(
    `    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/${xDefaultLang}/${page}/" />`
  );
  return lines.join("\n");
}

export function writeRootRedirect(page) {
  const dir = path.join(ROOT, page);
  fs.mkdirSync(dir, { recursive: true });
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="refresh" content="0;url=/ko/${page}/" />
<script src="/lang-nav.js"></script>
<script>
(function(){
  var LANGS=["ko","en","ja","es","pt-br","fr","de","hi","id"];
  var pref="ko";
  try{var s=localStorage.getItem("newon-lang-dir");if(s&&LANGS.indexOf(s)!==-1)pref=s;}catch(e){}
  location.replace("/"+pref+"/${page}/");
})();
</script>
<title>Redirect</title>
</head>
<body><p><a href="/ko/${page}/">Continue</a></p></body>
</html>`;
  fs.writeFileSync(path.join(dir, "index.html"), body);
}

export function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

export function statusBadge(status, lang = "ko") {
  const labels = STATUS_LABEL[status] || STATUS_LABEL.concept;
  const label = labels[lang] || labels.en;
  const cls = `hub-badge hub-badge--${status}`;
  return `<span class="${cls}">${escapeHtml(label)}</span>`;
}
