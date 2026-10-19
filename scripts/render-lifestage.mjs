#!/usr/bin/env node
/**
 * Render the LivOn business pages for all locales.
 * LIVON site (2026-10): five pages — /{lang}/livon/ (01 Overview) plus platform/, business/,
 * partnerships/ and contact/ — from scripts/livon-site-data.mjs + livon-site-body.mjs.
 * Canonical: /{lang}/livon/ (LIVON_HUB_PATH). The former /{lang}/lifestage/ URL is kept
 * as a redirect stub (meta refresh + canonical + noindex) so old links and search
 * results keep working. Does not restyle the homepage LivOn story row.
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
  ensureDir,
  escapeHtml,
  pick,
  fontLinksHtml,
} from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";
import { renderStudioHeader, renderStudioFooter } from "./site-chrome.mjs";
import { LIVON_SITE_RENDERERS } from "./livon-site-body.mjs";
import { LIVON_SITE_PAGES, siteCopy } from "./livon-site-data.mjs";
import { getLifeStageCopy } from "./home-lifestage-copy.mjs";
import { LIVON_HUB_PATH, LIVON_LEGACY_PATH } from "./newon-business-units.mjs";

const HUB = LIVON_HUB_PATH.replace(/\/$/, "");
const LEGACY = LIVON_LEGACY_PATH.replace(/\/$/, "");

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20260924livon1";
const LVS_VER = "20261018lvs3";

function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en) };
}

/** Title / description per page (KO and EN written; other languages use EN, like the rest of the LivOn copy). */
function seoFor(dir, pageId) {
  return siteCopy(dir).seo[pageId];
}

function renderPage(lang, page) {
  const { flat, flatEn } = localeFlat(lang);
  const seo = seoFor(lang.dir, page.id);
  const rel = `${HUB}/${page.path}`.replace(/\/$/, "");
  const depth = rel.split("/").length;
  const base = "../".repeat(depth);
  const header = renderStudioHeader(flat, flatEn, { activeNav: "lifestage", base });
  const footer = renderStudioFooter(flat, flatEn, { base });
  const canonical = `${SITE_ORIGIN}/${lang.dir}/${rel}/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    LANG_DIR: lang.dir,
    FONT_LINKS: fontLinksHtml(lang.dir),
    TITLE: escapeHtml(seo.title),
    META_DESCRIPTION: escapeHtml(clampSeoDescription(seo.desc)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock(rel),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: LIVON_SITE_RENDERERS[page.id](lang.dir),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=20261019rest1" />
    <link rel="stylesheet" href="/flagship-subnav.css?v=20261018fsn2" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="/livon-site.css?v=${LVS_VER}" />`,
    EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260924play2"></script>
    <script src="/home-lifestage.js?v=${NLS_VER}" defer></script>
    <script src="/livon-site.js?v=${LVS_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, rel, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  if (page.id === "overview") writeLegacyRedirect(lang.dir);
  console.log("render-lifestage:", lang.dir, page.id);
}

/** Append the LIVON sub pages to sitemap.xml (append-only; existing entries untouched). */
function patchSitemap() {
  const file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return;
  let xml = fs.readFileSync(file, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  const extra = [];
  for (const page of LIVON_SITE_PAGES) {
    for (const lang of LANGS) {
      const loc = `${SITE_ORIGIN}/${lang.dir}/${HUB}/${page.path}`;
      if (xml.includes(`<loc>${loc}</loc>`)) continue;
      extra.push(["  <url>", `    <loc>${loc}</loc>`, `    <lastmod>${today}</lastmod>`, "    <changefreq>monthly</changefreq>", "    <priority>0.6</priority>", "  </url>"].join("\n"));
    }
  }
  if (!extra.length) return;
  xml = xml.replace("</urlset>", `${extra.join("\n")}\n</urlset>`);
  fs.writeFileSync(file, xml);
  console.log("render-lifestage: sitemap +", extra.length);
}

/** /{lang}/lifestage/ → /{lang}/livon/ (keeps #hash). */
function writeLegacyRedirect(dir) {
  const target = `/${dir}/${HUB}/`;
  const html = `<!DOCTYPE html><html lang="${dir}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex, follow"/><link rel="canonical" href="${SITE_ORIGIN}${target}"/><meta http-equiv="refresh" content="0;url=${target}"/><title>LivOn | Newon</title><script>location.replace("${target}"+(location.hash||""));</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="${target}">LivOn</a></p></body></html>`;
  const out = path.join(ROOT, dir, LEGACY, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
}

/** Root /lifestage/ → preferred locale /{lang}/livon/ (root /livon/ is the LivOn web service itself). */
function writeRootLegacyRedirect() {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="robots" content="noindex, follow"/><link rel="canonical" href="${SITE_ORIGIN}/ko/${HUB}/"/><meta http-equiv="refresh" content="0;url=/ko/${HUB}/"/><title>LivOn | Newon</title><script>(function(){var L=${list};var d="ko";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/${HUB}/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/ko/${HUB}/">LivOn</a></p></body></html>`;
  fs.mkdirSync(path.join(ROOT, LEGACY), { recursive: true });
  fs.writeFileSync(path.join(ROOT, LEGACY, "index.html"), html);
}

writeRootLegacyRedirect();
for (const lang of LANGS) for (const page of LIVON_SITE_PAGES) renderPage(lang, page);
patchSitemap();
console.log("render-lifestage: OK", getLifeStageCopy("ko").hero.ctaMain, "pages", LIVON_SITE_PAGES.length * LANGS.length);
