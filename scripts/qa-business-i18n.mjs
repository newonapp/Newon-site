#!/usr/bin/env node
/**
 * QA — Business / Studio pages across all 9 languages:
 *  1. header menu link set identical in every language
 *  2. footer link set identical (renderStudioFooter) — see also qa-footer-sync
 *  3. notice present exactly where the classification says, in the page's own language (text must equal NOTICE[lang][kind])
 *  4. no leftover project-request CTA wording
 *  5. every local link on the page resolves to an existing file
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, NOTICE } from "./business-model-pages.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const LEFTOVER = /프로젝트 문의|Start a project|Project inquiry|project inquiry|見積もりを依頼|Request a quote/;
const errors = [];
const stats = { pages: 0, notices: 0, links: 0, unresolved: 0 };
const menuSig = {};

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const norm = (h) => h.replace(/^(?:\.\.\/)+/, "").replace(/^\//, "").replace(new RegExp(`^(?:${LANGS.join("|")})/`), "");

function resolves(fromRel, href) {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean || /^(?:[a-z]+:|\/\/)/i.test(clean)) return true;
  const abs = clean.startsWith("/") ? path.join(ROOT, clean) : path.join(ROOT, path.dirname(fromRel), clean);
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return true;
  return fs.existsSync(path.join(abs, "index.html")) || fs.existsSync(abs + ".html");
}

for (const lang of LANGS) {
  for (const [key, meta] of Object.entries(PAGES)) {
    const rel = `${lang}/${key}/index.html`;
    const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
    stats.pages++;
    const isStub = /http-equiv="refresh"/i.test(html) && !/<main\b/.test(html);

    // 1. header menu
    const hm = html.match(/<header class="(?:site-header gnav|gnav site-header)[\s\S]*?<\/header>/);
    if (hm) {
      const sig = [...hm[0].matchAll(/href="([^"#][^"]*)"/g)].map((m) => norm(m[1])).filter((h) => !/^https?:/.test(h)).join("|");
      (menuSig[sig] = menuSig[sig] || []).push(rel);
    } else if (!isStub) errors.push(`${rel}: no header`);

    if (isStub) continue;

    // 3. notice
    const want = meta[2];
    const got = [...html.matchAll(/<aside class="bm-notice[^"]*"[^>]*data-bm-notice="([^"]+)"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/g)];
    if (want === "none") {
      if (got.length) errors.push(`${rel}: unexpected notice`);
    } else if (got.length !== 1) errors.push(`${rel}: expected 1 "${want}" notice, found ${got.length}`);
    else {
      stats.notices++;
      if (got[0][1] !== want) errors.push(`${rel}: notice kind ${got[0][1]} != ${want}`);
      if (decode(got[0][2]) !== NOTICE[want][lang]) errors.push(`${rel}: notice text is not the ${lang} text`);
    }

    // 4. CTA leftovers (main only, notices excluded)
    const main = (html.match(/<main[\s\S]*?<\/main>/) || [html])[0].replace(/<aside class="bm-notice[\s\S]*?<\/aside>/g, "");
    const left = main.replace(/<[^>]+>/g, " ").match(LEFTOVER);
    if (left) errors.push(`${rel}: leftover CTA wording "${left[0]}"`);

    // 5. links
    for (const m of html.matchAll(/<a\b[^>]*?\shref="([^"]+)"/g)) {
      stats.links++;
      if (!resolves(rel, decode(m[1]))) { stats.unresolved++; errors.push(`${rel}: unresolved link ${m[1]}`); }
    }
  }
}

const variants = Object.entries(menuSig);
if (variants.length > 1) {
  variants.sort((a, b) => b[1].length - a[1].length);
  for (const [, files] of variants.slice(1)) for (const f of files) errors.push(`${f}: header menu differs from the majority menu`);
}

errors.slice(0, 40).forEach((e) => console.log(`[ERROR] ${e}`));
console.log(`\nBusiness i18n QA: ${stats.pages} pages, ${stats.notices} notices, ${stats.links} links (${stats.unresolved} unresolved), ${variants.length} header menu variant(s), ${errors.length} error(s).`);
process.exit(errors.length ? 1 : 0);
