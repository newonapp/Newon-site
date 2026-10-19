#!/usr/bin/env node
/**
 * Moves committed pages onto the new "Studio" menu (five screens, 2026-10-19).
 * Only the Studio mega panel (desktop) and the Studio accordion (mobile drawer) are swapped for what the
 * current site-chrome.mjs + locales generate for that page's language and link base; everything else in the
 * header (other menus, ids, active states) stays byte-for-byte. Footers are unchanged (the Studio footer link
 * still points at studio/).
 *
 * Use (repo root, after venture-studio-data.mjs / locales are in place):  node scripts/migrate-studio-nav.mjs [--dry]
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { renderGlobalHeader } from "./site-chrome.mjs";

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function flatten(obj, prefix = "") {
  const out = {};
  if (obj == null) return out;
  if (typeof obj !== "object") { out[prefix] = obj; return out; }
  if (Array.isArray(obj)) { obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`))); return out; }
  for (const [k, v] of Object.entries(obj)) Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  return out;
}
function fillMissing(target, source) {
  if (source == null || typeof source !== "object" || Array.isArray(source)) return target;
  const out = target && typeof target === "object" && !Array.isArray(target) ? target : {};
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) out[k] = fillMissing(out[k], v);
    else if (out[k] === undefined || out[k] === null || out[k] === "") out[k] = v;
  }
  return out;
}
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "locales", f), "utf8"));
const EN = read("en.json");
const FLATS = Object.fromEntries(LANGS.map((l) => [l, { flat: flatten(l === "en" ? EN : fillMissing(read(`${l}.json`), EN)), flatEn: flatten(EN) }]));

const PANEL_RE = /<div class="gnav-mega" data-gnav-mega="studio" role="menu" hidden>[\s\S]*?<p class="gnav-mega__foot"><a class="gnav-mega__foot-link" href="([^"]*)studio\/">[\s\S]*?<\/p><\/div>\s*<\/div>\s*<\/div>/;
const ACC_RE = /<div class="gnav-mobile__acc" data-gnav-acc>\s*<div class="gnav-mobile__acc-head">\s*<a class="gnav-mobile__acc-link" href="([^"]*?)(?<![a-z-])studio\/">[\s\S]*?<div class="gnav-mobile__acc-panel" hidden>[\s\S]*?<\/div>\s*<\/div>/;

const cache = new Map();
function generated(lang, base) {
  const key = `${lang}|${base}`;
  if (!cache.has(key)) {
    const { flat, flatEn } = FLATS[lang];
    const h = renderGlobalHeader(flat, flatEn, { base, langDir: "", idSuffix: "x" });
    cache.set(key, { panel: h.match(PANEL_RE)[0], acc: h.match(ACC_RE)[0] });
  }
  return cache.get(key);
}

const files = execSync("git ls-files '*.html'", { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
const stats = { pages: 0, panels: 0, accs: 0, already: 0, nomenu: 0 };
for (const f of files) {
  if (f.startsWith("_publish/") || f.startsWith("templates/")) continue;
  const abs = path.join(ROOT, f);
  if (!fs.existsSync(abs)) continue;
  let html = fs.readFileSync(abs, "utf8");
  if (!html.includes('data-gnav-mega="studio"')) { stats.nomenu++; continue; }
  const before = html;
  const segs = f.split("/");
  const htmlLang = ((html.match(/<html[^>]*\slang="([^"]+)"/) || [])[1] || "ko").toLowerCase();
  const lang = LANGS.includes(segs[0]) ? segs[0] : LANGS.includes(htmlLang) ? htmlLang : "ko";
  const pm = html.match(PANEL_RE);
  if (pm) {
    const g = generated(lang, pm[1]);
    if (pm[0] !== g.panel) { html = html.replace(pm[0], g.panel); stats.panels++; }
  }
  const am = html.match(ACC_RE);
  if (am) {
    const g = generated(lang, am[1]);
    if (am[0] !== g.acc) { html = html.replace(am[0], g.acc); stats.accs++; }
  }
  if (html !== before) {
    stats.pages++;
    if (!DRY) fs.writeFileSync(abs, html);
  } else stats.already++;
}
console.log(JSON.stringify(stats));
