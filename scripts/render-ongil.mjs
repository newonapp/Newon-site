#!/usr/bin/env node
/**
 * Render /{lang}/ongil/ detail pages for all locales.
 * Does not restyle the homepage Ongil story row.
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
import { renderOngilSection } from "./home-ongil-body.mjs";
import { getOngilCopy } from "./home-ongil-copy.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NOG_VER = "20260922nog30";
const SKIP_DIRS = new Set(["node_modules", "_publish", ".git", "docs", "app-icons"]);

const SEO = {
  ko: {
    title: "Ongil | Newon — 시니어 종합 생활·돌봄 플랫폼",
    description:
      "시니어의 일상과 건강, 필요한 돌봄부터 가족과 지역사회까지. 종합 생활 플랫폼 사업 소개이며, 예약·결제·가입은 아직 연결되지 않았습니다.",
  },
  en: {
    title: "Ongil | Newon — A full living and care platform for seniors.",
    description:
      "From daily life and health to care, family, and community. A business introduction — booking, payment, and sign-up are not connected yet.",
  },
};

function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en) };
}

function renderPage(lang) {
  const { flat, flatEn } = localeFlat(lang);
  const copy = getOngilCopy(lang.dir);
  const seo = {
    title: copy.seoTitle || SEO.en.title,
    description: copy.seoDescription || SEO.en.description,
  };
  const header = renderStudioHeader(flat, flatEn, { activeNav: "ongil", base: "../" });
  const footer = renderStudioFooter(flat, flatEn, { base: "../" });
  const canonical = `${SITE_ORIGIN}/${lang.dir}/ongil/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    LANG_DIR: lang.dir,
    FONT_LINKS: fontLinksHtml(lang.dir),
    TITLE: escapeHtml(seo.title),
    META_DESCRIPTION: escapeHtml(clampSeoDescription(seo.description)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock("ongil"),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: renderOngilSection(lang.dir, { detail: true }),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-ongil.css?v=${NOG_VER}" />
    <link rel="stylesheet" href="/home-ongil-layout.css?v=${NOG_VER}" />`,
    EXTRA_SCRIPTS: `<script src="/home-ongil.js?v=${NOG_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, "ongil", "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  console.log("render-ongil:", lang.dir, "services", copy.services.items.length);
}

function langFromFile(file) {
  const rel = path.relative(ROOT, file);
  const first = rel.split(path.sep)[0];
  if (LANGS.some((l) => l.dir === first)) return first;
  if (rel === "index.html") return "ko";
  return "";
}

function patchHtml(file) {
  if (file.includes(`${path.sep}ongil${path.sep}`)) return;
  let html = fs.readFileSync(file, "utf8");
  const orig = html;
  html = html.replace(/href="((?:\.\.\/)+)#story-ongil"/g, 'href="$1ongil/"');
  html = html.replace(/href="(\/(?:ko|en|ja|es|pt-br|fr|de|hi|id)\/)#story-ongil"/g, 'href="$1ongil/"');
  const lang = langFromFile(file);
  if (lang) {
    html = html.replace(
      /<a class="hs-story__cta" href="#story-ongil">/g,
      `<a class="hs-story__cta" href="/${lang}/ongil/">`
    );
  }
  if (html !== orig) fs.writeFileSync(file, html);
}

function walkHtml(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (SKIP_DIRS.has(ent.name) || ent.name.startsWith(".")) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p);
    else if (ent.name.endsWith(".html")) patchHtml(p);
  }
}

function patchSitemap() {
  const file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return;
  let xml = fs.readFileSync(file, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  const extra = LANGS.map((lang) => {
    const loc = `${SITE_ORIGIN}/${lang.dir}/ongil/`;
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
  console.log("render-ongil: sitemap +", extra.length);
}

writeRootRedirect("ongil");
for (const lang of LANGS) renderPage(lang);
walkHtml(ROOT);
patchSitemap();
console.log("render-ongil: OK", getOngilCopy("ko").hero.ctaMain);
