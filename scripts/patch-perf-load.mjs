#!/usr/bin/env node
/**
 * Site-wide perf patch — locale fonts + preconnect, defer non-critical JS.
 * Safe to re-run. Does not rewrite design or SEO structure.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fontLinksHtml } from "./hub-utils.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const HEAD_CSS = `<link rel="stylesheet" href="/site-dark.css?v=20260902perf1" />
    <link rel="stylesheet" href="/site-mobile.css?v=20260902nav1" />`;

const SKIP_DIR = new Set([
  "node_modules",
  ".git",
  "_publish",
  "_restore_tmp",
  "_preview-shots",
  "admin",
  "reports",
  ".chrome-dark-tmp3",
  ".chrome-dark-tmp4",
]);

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIR.has(name) || name.startsWith(".")) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (name.endsWith(".html")) files.push(p);
  }
  return files;
}

function langFromPath(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const seg = rel.split("/")[0];
  return LANGS.includes(seg) ? seg : "en";
}

function stripGoogleFontTags(html) {
  let out = html;
  // preconnect / dns-prefetch to Google Fonts hosts
  out = out.replace(
    /\s*<link[^>]*(?:href="https:\/\/fonts\.(?:googleapis|gstatic)\.com")[^>]*\/?>\s*/gi,
    "\n"
  );
  // single-line stylesheet
  out = out.replace(
    /\s*<link[^>]*href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+"[^>]*\/?>\s*/gi,
    "\n"
  );
  // multi-line <link href=... rel=stylesheet />
  out = out.replace(
    /\s*<link\s*\n\s*href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+"\s*\n\s*rel="stylesheet"\s*\/>\s*/gi,
    "\n"
  );
  return out;
}

function ensureFontLinks(html, lang) {
  let out = html;
  if (out.includes("{{FONT_LINKS}}")) {
    out = out.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(lang));
  }
  if (out.includes("fonts.googleapis.com/css2") || out.includes("{{FONT_LINKS}}")) {
    return out;
  }
  const block = fontLinksHtml(lang);
  if (out.includes('rel="apple-touch-icon"')) {
    return out.replace(
      /(<link[^>]*rel="apple-touch-icon"[^>]*\/?>)/i,
      `$1\n    ${block}`
    );
  }
  if (out.includes("</head>")) {
    return out.replace(/<\/head>/i, `    ${block}\n  </head>`);
  }
  return out;
}

function patchHtml(html, lang) {
  let out = html;
  const hadFonts = /fonts\.googleapis\.com|\{\{FONT_LINKS\}\}/.test(out);

  out = out.replace(/\s*<link rel="stylesheet" href="\/site-dark\.css[^"]*" \/?>\s*/g, "\n");
  out = out.replace(/\s*<link rel="stylesheet" href="\/site-mobile\.css[^"]*" \/?>\s*/g, "\n");

  if (!out.includes("site-dark.css")) {
    out = out.replace(/<\/head>/i, `    ${HEAD_CSS}\n  </head>`);
  } else {
    out = out.replace(/site-dark\.css\?v=[^"]+/g, "site-dark.css?v=20260902perf1");
    out = out.replace(/site-mobile\.css\?v=[^"]+/g, "site-mobile.css?v=20260902nav1");
  }

  if (hadFonts || /fonts\.googleapis\.com|\{\{FONT_LINKS\}\}/.test(out)) {
    out = stripGoogleFontTags(out);
    out = ensureFontLinks(out, lang);
  }

  // Nav/footer logos: small display should not pull the master mark
  out = out.replace(
    /(<img class="gnav__logo" src=")\/logo\.png(")/g,
    "$1/logo-nav.png$2"
  );
  out = out.replace(
    /(<img\s+class="footer-brand-img"\s+src=")\/logo\.png(")/g,
    "$1/logo-nav.png$2"
  );

  // Safe defer for end-of-body interaction scripts
  out = out.replace(
    /<script src="\/lang-dropdown\.js"><\/script>/g,
    '<script src="/lang-dropdown.js" defer></script>'
  );
  out = out.replace(
    /<script src="\/hero-apps\.js"><\/script>/g,
    '<script src="/hero-apps.js" defer></script>'
  );
  out = out.replace(
    /<script src="(\/business\/inquiry\.js[^"]*)"><\/script>/g,
    '<script src="$1" defer></script>'
  );
  out = out.replace(
    /<script src="(\/portfolio\/portfolio\.js[^"]*)"><\/script>/g,
    '<script src="$1" defer></script>'
  );
  out = out.replace(
    /<script src="(\/ideas\/ideas\.js[^"]*)"><\/script>/g,
    '<script src="$1" defer></script>'
  );
  out = out.replace(
    /<script src="(\/news\/news\.js[^"]*)"><\/script>/g,
    '<script src="$1" defer></script>'
  );

  // Home LCP: prefer WebP wordmark; keep PNG fallback
  out = out.replace(
    /<link rel="preload" as="image" href="\/newon-wordmark-chrome\.png" \/>/g,
    '<link rel="preload" as="image" type="image/webp" href="/newon-wordmark-chrome.webp" />'
  );

  // Dark wordmark: do not compete with LCP on light theme
  out = out.replace(
    /(<img\s+class="hero-brand-mark__img hero-brand-mark__img--dark"\s+)src="\/newon-wordmark-chrome-dark\.png"/g,
    '$1data-src="/newon-wordmark-chrome-dark.webp" data-src-fallback="/newon-wordmark-chrome-dark.png"'
  );

  // Light wordmark → picture (only if not already wrapped)
  if (!out.includes("hero-brand-mark__picture--light") && out.includes('src="/newon-wordmark-chrome.png"')) {
    out = out.replace(
      /<img\s+class="hero-brand-mark__img hero-brand-mark__img--light"\s+src="\/newon-wordmark-chrome\.png"\s+alt="([^"]*)"\s+width="948"\s+height="361"\s+decoding="sync"\s+fetchpriority="high"\s*\/>/g,
      `<picture class="hero-brand-mark__picture hero-brand-mark__picture--light">
                  <source type="image/webp" srcset="/newon-wordmark-chrome.webp" />
                  <img
                  class="hero-brand-mark__img hero-brand-mark__img--light"
                  src="/newon-wordmark-chrome.png"
                  alt="$1"
                  width="948"
                  height="361"
                  decoding="sync"
                  fetchpriority="high"
                />
                </picture>`
    );
  }

  return out;
}

let n = 0;
for (const file of walk(ROOT)) {
  const before = fs.readFileSync(file, "utf8");
  const after = patchHtml(before, langFromPath(file));
  if (after !== before) {
    fs.writeFileSync(file, after);
    n++;
  }
}

console.log(`patch-perf-load: updated ${n} html files`);
