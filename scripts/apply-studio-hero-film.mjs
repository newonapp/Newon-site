#!/usr/bin/env node
/**
 * Studio sub-pages (brand, care, content, contact, design-systems, digital, partnerships, projects — all locales):
 * put the Studio first-screen film behind the existing light `bp-hero` first screen.
 * Background only (owner request 2026-10-19): text, layout and buttons are untouched; a light veil keeps the dark text readable.
 * Idempotent — re-running replaces the previously inserted block.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const STUDIO_HERO_FILM =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_202655_a7f5aca0-2f80-4bc9-bcb5-96ac95662003.mp4";
const CSS = "/studio-hero-film.css?v=20261019shf1";
const KEEP = "/film-keep.js?v=20260924play2";
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const SUBS = ["brand", "care", "content", "contact", "design-systems", "digital", "partnerships", "projects"];
const START = "<!--shf-->";
const END = "<!--/shf-->";

const block = `${START}<div class="shf" aria-hidden="true"><video class="shf__video" src="${STUDIO_HERO_FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true"><source src="${STUDIO_HERO_FILM}" type="video/mp4" /></video><span class="shf__veil"></span></div>${END}`;

let n = 0;
for (const lang of LANGS) {
  for (const sub of SUBS) {
    const f = path.join(ROOT, lang, "studio", sub, "index.html");
    if (!fs.existsSync(f)) continue;
    let h = fs.readFileSync(f, "utf8");
    if (h.includes('http-equiv="refresh"')) continue;
    if (!/<section class="bp-hero( shf-host)?"/.test(h)) continue;
    h = h.replace(new RegExp(`${START}[\\s\\S]*?${END}`, "g"), "");
    h = h.replace(/<section class="bp-hero"/, '<section class="bp-hero shf-host"');
    h = h.replace(/(<section class="bp-hero shf-host"[^>]*>)/, `$1\n  ${block}`);
    h = h.replace(/<link rel="stylesheet" href="\/studio-hero-film\.css[^"]*" \/>\n?/g, "");
    h = h.replace("</head>", `  <link rel="stylesheet" href="${CSS}" />\n</head>`);
    if (!h.includes("/film-keep.js")) h = h.replace("</body>", `  <script src="${KEEP}" defer></script>\n</body>`);
    fs.writeFileSync(f, h);
    n++;
  }
}
console.log(`apply-studio-hero-film: ${n} page(s)`);
