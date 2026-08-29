#!/usr/bin/env node
/**
 * Rebuild homepage studio body (below hero) for all locale index.html files.
 * Does not modify the hero / first viewport.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildHomeStudioBody } from "./home-page-body.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const CSS_VER = "20260830finalrail1";
const JS_VER = "20260830finalrail1";

function copyLang(lang) {
  return lang === "ko" ? "ko" : "en";
}

function patchHome(html, body) {
  // Prefer HQ class; normalize legacy opener to HQ without touching hero.
  let next = html.replace(
    /<div class="hs-home(?:\s+hs-home--hq)?" data-hs-home>/,
    '<div class="hs-home hs-home--hq" data-hs-home>'
  );

  const start = next.indexOf('<div class="hs-home hs-home--hq" data-hs-home>');
  if (start === -1) throw new Error("hs-home not found");
  const endMarker = "<!-- HOME_STUDIO_END -->";
  const end = next.indexOf(endMarker, start);
  if (end === -1) throw new Error("HOME_STUDIO_END not found");
  const openEnd = next.indexOf(">", start) + 1;
  const closeDiv = next.lastIndexOf("</div>", end);
  next = `${next.slice(0, openEnd)}\n${body.trim()}\n        ${next.slice(closeDiv)}`;
  return next
    .replace(/home-studio\.css\?v=[^"]+/g, `home-studio.css?v=${CSS_VER}`)
    .replace(/home-studio\.js\?v=[^"]+/g, `home-studio.js?v=${JS_VER}`);
}

for (const lang of LANGS) {
  const file = path.join(ROOT, lang, "index.html");
  if (!fs.existsSync(file)) {
    console.warn("skip missing", lang);
    continue;
  }
  const body = buildHomeStudioBody(copyLang(lang));
  const html = patchHome(fs.readFileSync(file, "utf8"), body);
  fs.writeFileSync(file, html);
  console.log("render-home-studio:", lang);
}

// Keep root homepage in sync with KO (hero + studio).
const ko = path.join(ROOT, "ko", "index.html");
const root = path.join(ROOT, "index.html");
if (fs.existsSync(ko) && fs.existsSync(root)) {
  fs.copyFileSync(ko, root);
  console.log("render-home-studio: root index synced from ko");
}

console.log("render-home-studio: OK");
