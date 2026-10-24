#!/usr/bin/env node
/**
 * Render the SHAREON pages for all locales (writes only SHAREON files):
 *   /{lang}/shareon/                Overview
 *   /{lang}/shareon/platform/       Platform
 *   /{lang}/shareon/business/       Business
 *   /{lang}/shareon/partnerships/   Partnerships
 *   /{lang}/shareon/contact/        Contact
 * plus the root language redirects (/shareon/…) and missing sitemap entries.
 * Runs on its own (node scripts/render-shareon.mjs); it does not rebuild or patch any other page.
 */
import fs from "fs";
import path from "path";
import {
  ROOT,
  LANGS,
  OG_LOCALE,
  SITE_ORIGIN,
  loadJson,
  flatten,
  fillMissing,
  applyTemplate,
  hreflangBlock,
  writeRootRedirect,
  ensureDir,
  escapeHtml,
  pick,
  fontLinksHtml,
} from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";
import { renderStudioHeader, renderStudioFooter } from "./site-chrome.mjs";
import { renderShareonPage, getShareonCopy } from "./shareon-body.mjs";
import { SHAREON_PAGES } from "./shareon-copy.mjs";
import { FLAGSHIP_SUBNAV_CSS } from "./flagship-subnav.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const CSS_VER = "20261024c30";
const NLS_VER = "20260924livon1"; // shared Life Stage film hero assets, reused as-is

function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en) };
}

function renderPage(lang, page) {
  const { flat, flatEn } = localeFlat(lang);
  const copy = getShareonCopy(lang.dir);
  const seo = copy[page.id];
  const depth = page.path.split("/").length;          // shareon → 1, shareon/platform → 2
  const base = "../".repeat(depth);
  const header = renderStudioHeader(flat, flatEn, { activeNav: "shareon", base });
  const footer = renderStudioFooter(flat, flatEn, { base });
  const canonical = `${SITE_ORIGIN}/${lang.dir}/${page.path}/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    LANG_DIR: lang.dir,
    FONT_LINKS: fontLinksHtml(lang.dir),
    TITLE: escapeHtml(seo.seoTitle),
    META_DESCRIPTION: escapeHtml(clampSeoDescription(seo.seoDescription)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock(page.path),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: renderShareonPage(lang.dir, page.id),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=20261019rest1" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="${FLAGSHIP_SUBNAV_CSS}" />
    <link rel="stylesheet" href="/shareon.css?v=20261024c30" />`,
    EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260924play2"></script>
    <script src="/home-lifestage.js?v=${NLS_VER}" defer></script>
    <script src="/shareon.js?v=${CSS_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, page.path, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  return out;
}

function patchSitemap() {
  const file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return 0;
  let xml = fs.readFileSync(file, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  const extra = [];
  for (const page of SHAREON_PAGES) {
    for (const lang of LANGS) {
      const loc = `${SITE_ORIGIN}/${lang.dir}/${page.path}/`;
      if (xml.includes(`<loc>${loc}</loc>`)) continue;
      extra.push(["  <url>", `    <loc>${loc}</loc>`, `    <lastmod>${today}</lastmod>`, "    <changefreq>monthly</changefreq>", `    <priority>${page.id === "overview" ? "0.7" : "0.6"}</priority>`, "  </url>"].join("\n"));
    }
  }
  if (!extra.length) return 0;
  xml = xml.replace(/\n?<\/urlset>\s*$/, `\n${extra.join("\n")}\n</urlset>\n`);
  fs.writeFileSync(file, xml);
  return extra.length;
}

let n = 0;
for (const page of SHAREON_PAGES) {
  writeRootRedirect(page.path);
  for (const lang of LANGS) {
    renderPage(lang, page);
    n++;
  }
}
const added = patchSitemap();
console.log(`render-shareon: ${n} pages (${SHAREON_PAGES.length} × ${LANGS.length} locales), sitemap +${added}`);
