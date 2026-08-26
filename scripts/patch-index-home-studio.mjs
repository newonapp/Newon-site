#!/usr/bin/env node
/** Replace legacy home sections with ecosystem hero + Product Studio blocks (idempotent). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TPL = path.join(ROOT, "templates", "index.html");
const HERO = path.join(ROOT, "templates", "home-ecosystem-hero-inc.html");
const INC = path.join(ROOT, "templates", "home-studio-inc.html");
const START = "<!-- HOME_STUDIO_START -->";
const END = "<!-- HOME_STUDIO_END -->";

const LEGACY_START = '<section id="top"';
const HOME_MORE_END = "<!-- HOME_MORE_END -->";

function patchIndex(html, block) {
  const studioStart = html.indexOf(START);
  const studioEnd = html.indexOf(END);
  if (studioStart !== -1 && studioEnd !== -1) {
    const before = html.slice(0, studioStart);
    const after = html.slice(studioEnd + END.length);
    const mainIdx = before.lastIndexOf("<main id=\"main\">");
    if (mainIdx === -1) throw new Error("main#main not found");
    const heroEnd = before.indexOf(START);
    const prefix = before.slice(0, mainIdx + '<main id="main">'.length) + "\n";
    return prefix + block.trim() + "\n\n" + after;
  }

  const mainIdx = html.indexOf('<main id="main">');
  if (mainIdx === -1) throw new Error("main#main not found");
  const legacyIdx = html.indexOf(LEGACY_START, mainIdx);
  const hsIdx = html.indexOf('<div class="hs-home"', mainIdx);
  const startIdx = legacyIdx !== -1 ? legacyIdx : hsIdx !== -1 ? hsIdx : -1;
  if (startIdx === -1) throw new Error("home start not found");

  let endIdx = html.indexOf(HOME_MORE_END, startIdx);
  if (endIdx === -1) {
    endIdx = html.indexOf(END, startIdx);
    if (endIdx !== -1) endIdx += END.length;
    else {
      endIdx = html.indexOf("</main>", startIdx);
      if (endIdx === -1) throw new Error("home end not found");
    }
  } else {
    endIdx += HOME_MORE_END.length;
  }

  return html.slice(0, startIdx) + block.trim() + "\n\n      " + html.slice(endIdx);
}

function ensureAssets(html) {
  let out = html;
  if (!out.includes('href="/home-studio.css')) {
    out = out.replace(
      '<link rel="stylesheet" href="/hub-pages.css?v=20260825studio" />',
      '<link rel="stylesheet" href="/hub-pages.css?v=20260826bw1" />\n    <link rel="stylesheet" href="/home-studio.css?v=20260826bw1" />'
    );
  } else {
    out = out.replace(/home-studio\.css\?v=[^"]+/, "home-studio.css?v=20260826bw1");
    out = out.replace(/hub-pages\.css\?v=[^"]+/, "hub-pages.css?v=20260826bw1");
  }
  if (!out.includes('src="/home-studio.js')) {
    out = out.replace(
      '<script src="/site-chrome.js?v=20260826gnav3" defer></script>',
      '<script src="/site-chrome.js?v=20260826gnav3" defer></script>\n    <script src="/home-studio.js?v=20260826ps3" defer></script>'
    );
  } else {
    out = out.replace(/home-studio\.js\?v=[^"]+/, "home-studio.js?v=20260826ps3");
  }
  return out;
}

const hero = fs.readFileSync(HERO, "utf8");
const studio = fs.readFileSync(INC, "utf8").trim();
const block = hero + "\n" + studio;

let html = fs.readFileSync(TPL, "utf8");
html = patchIndex(html, block);
html = ensureAssets(html);
fs.writeFileSync(TPL, html);
console.log("patch-index-home-studio: OK");
