#!/usr/bin/env node
/**
 * Site-wide perf patch — move late CSS to head, locale fonts, defer non-critical JS.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fontLinksHtml } from "./hub-utils.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const HEAD_CSS = `<link rel="stylesheet" href="/site-dark.css?v=20260902perf1" />
    <link rel="stylesheet" href="/site-mobile.css?v=20260902nav1" />`;

const FONT_BLOCK_RE =
  /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com"[\s\S]*?fonts\.googleapis\.com\/css2[^"]+"[\s\S]*?\/>/g;

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (name === "node_modules" || name.startsWith(".") || name === "_publish") continue;
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

function patchHtml(html, lang) {
  let out = html;

  out = out.replace(/\s*<link rel="stylesheet" href="\/site-dark\.css[^"]*" \/?>\s*/g, "\n");
  out = out.replace(/\s*<link rel="stylesheet" href="\/site-mobile\.css[^"]*" \/?>\s*/g, "\n");

  if (!out.includes("site-dark.css")) {
    out = out.replace(/<\/head>/, `    ${HEAD_CSS}\n  </head>`);
  } else {
    out = out.replace(/site-dark\.css\?v=[^"]+/g, "site-dark.css?v=20260902perf1");
    out = out.replace(/site-mobile\.css\?v=[^"]+/g, "site-mobile.css?v=20260902nav1");
  }

  if (out.includes("fonts.googleapis.com")) {
    out = out.replace(FONT_BLOCK_RE, fontLinksHtml(lang));
  } else if (!out.includes("{{FONT_LINKS}}") && out.includes("</head>") && out.includes('rel="stylesheet" href="/styles.css')) {
    out = out.replace(
      /(<link rel="stylesheet" href="\/styles\.css[^"]*" \/>)/,
      `${fontLinksHtml(lang)}\n    $1`
    );
  }

  out = out.replace(/<script src="\/lang-dropdown\.js"><\/script>/g, '<script src="/lang-dropdown.js" defer></script>');
  out = out.replace(/<script src="\/hero-apps\.js"><\/script>/g, '<script src="/hero-apps.js" defer></script>');

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
