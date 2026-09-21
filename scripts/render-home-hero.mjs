#!/usr/bin/env node
/**
 * Re-inject homepage hero from templates/home-ecosystem-hero-inc.html
 * into locale index.html files only (does not rebuild other pages).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = path.join(ROOT, "locales");
const HERO = path.join(ROOT, "templates", "home-ecosystem-hero-inc.html");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
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
  if (flat[key] != null && flat[key] !== "") return flat[key];
  return flatEn[key];
}

function applyTemplate(template, flat, flatEn, lang) {
  let out = template.replace(/\{\{LANG_DIR\}\}/g, lang);
  out = out.replace(/\{\{html:([^}]+)\}\}/g, (_, key) => {
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

function replaceHero(html, heroHtml) {
  let start = html.indexOf('<section id="top"');
  if (start === -1) {
    const m = html.match(/<section\s+id="top"/);
    start = m ? html.indexOf(m[0]) : -1;
  }
  if (start === -1) throw new Error("hero section not found");
  const end = html.indexOf("</section>", start);
  if (end === -1) throw new Error("hero end not found");
  const close = end + "</section>".length;
  return html.slice(0, start) + heroHtml.trim() + html.slice(close);
}

const HERO3D_VER = "20260921s3d43";

function ensureHero3dAssets(html) {
  let out = html;
  if (out.includes("home-hero-3d.css")) {
    out = out.replace(/home-hero-3d\.css\?v=[^"]+/g, `home-hero-3d.css?v=${HERO3D_VER}`);
  } else {
    out = out.replace(
      /<link rel="stylesheet" href="\/home-studio\.css\?v=[^"]+" \/>/,
      `<link rel="stylesheet" href="/home-hero-3d.css?v=${HERO3D_VER}" />\n    $&`
    );
  }
  if (out.includes("home-hero-3d.js")) {
    out = out.replace(/home-hero-3d\.js\?v=[^"]+/g, `home-hero-3d.js?v=${HERO3D_VER}`);
  } else {
    out = out.replace(
      /<script src="\/home-studio\.js\?v=[^"]+" defer><\/script>/,
      `<script type="module" src="/home-hero-3d.js?v=${HERO3D_VER}"></script>\n    $&`
    );
  }
  return out;
}

const heroTpl = fs.readFileSync(HERO, "utf8");
const flatEn = flatten(JSON.parse(fs.readFileSync(path.join(LOCALES, "en.json"), "utf8")));

// Keep templates/index.html in sync for future full builds
{
  const tplPath = path.join(ROOT, "templates", "index.html");
  let tpl = fs.readFileSync(tplPath, "utf8");
  tpl = replaceHero(tpl, heroTpl);
  tpl = ensureHero3dAssets(tpl);
  fs.writeFileSync(tplPath, tpl);
  console.log("render-home-hero: templates/index.html");
}

for (const lang of LANGS) {
  const file = path.join(ROOT, lang, "index.html");
  if (!fs.existsSync(file)) {
    console.warn("skip missing", lang);
    continue;
  }
  const flat = flatten(JSON.parse(fs.readFileSync(path.join(LOCALES, `${lang}.json`), "utf8")));
  const hero = applyTemplate(heroTpl, flat, flatEn, lang);
  let html = fs.readFileSync(file, "utf8");
  html = replaceHero(html, hero);
  html = ensureHero3dAssets(html);
  fs.writeFileSync(file, html);
  console.log("render-home-hero:", lang);
}

const ko = path.join(ROOT, "ko", "index.html");
const root = path.join(ROOT, "index.html");
if (fs.existsSync(ko) && fs.existsSync(root)) {
  fs.copyFileSync(ko, root);
  console.log("render-home-hero: root synced from ko");
}

console.log("render-home-hero: OK");
