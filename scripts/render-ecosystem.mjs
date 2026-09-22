#!/usr/bin/env node
/**
 * Render /{lang}/ecosystem/ first-screen pages.
 * Does not restyle homepage or other business pages.
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
import { renderEcosystemSection } from "./ecosystem-body.mjs";
import { getEcosystemCopy } from "./ecosystem-copy.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const ECO_VER = "20260922close1";

function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en) };
}

function renderPage(lang) {
  const { flat, flatEn } = localeFlat(lang);
  const copy = getEcosystemCopy(lang.dir);
  const header = renderStudioHeader(flat, flatEn, { activeNav: "consumer", base: "../" });
  const footer = renderStudioFooter(flat, flatEn, { base: "../" });
  const canonical = `${SITE_ORIGIN}/${lang.dir}/ecosystem/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    LANG_DIR: lang.dir,
    FONT_LINKS: fontLinksHtml(lang.dir),
    TITLE: escapeHtml(copy.seoTitle),
    META_DESCRIPTION: escapeHtml(clampSeoDescription(copy.seoDescription)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock("ecosystem"),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: renderEcosystemSection(lang.dir),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/ecosystem.css?v=${ECO_VER}" />`,
    EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260922play1"></script>
    <script src="/ecosystem.js?v=${ECO_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, "ecosystem", "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  console.log("render-ecosystem:", lang.dir);
}

function patchSitemap() {
  const file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return;
  let xml = fs.readFileSync(file, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  const extra = LANGS.map((lang) => {
    const loc = `${SITE_ORIGIN}/${lang.dir}/ecosystem/`;
    if (xml.includes(`<loc>${loc}</loc>`)) return "";
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      "    <changefreq>monthly</changefreq>",
      "    <priority>0.65</priority>",
      "  </url>",
    ].join("\n");
  }).filter(Boolean);
  if (!extra.length) return;
  xml = xml.replace("</urlset>", `${extra.join("\n")}\n</urlset>\n`);
  fs.writeFileSync(file, xml);
  console.log("render-ecosystem: sitemap +", extra.length);
}

writeRootRedirect("ecosystem");
for (const lang of LANGS) renderPage(lang);
patchSitemap();
console.log("render-ecosystem: OK");
