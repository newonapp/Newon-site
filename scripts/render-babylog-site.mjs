#!/usr/bin/env node
/**
 * Render the BABYLOG corporate website (5 menu pages × 9 locales), information only.
 *
 *   /{lang}/babylog/                 01 Overview
 *   /{lang}/babylog/platform/        02 Platform
 *   /{lang}/babylog/business/        03 Business
 *   /{lang}/babylog/partnerships/    04 Partnerships
 *   /{lang}/babylog/contact/         05 Contact
 *
 * Design: reuses the Life Stage page shell (hub-shell + nls-* components + home-lifestage CSS/JS, unchanged).
 * Only BABYLOG-specific additions live in /babylog-site.css, scoped to #lifestage-detail[data-story="babylog"].
 * Runs after render-business-intro.mjs and replaces its /{lang}/babylog/index.html (the earlier single page's
 * content is carried into Platform §10 App Access and the Business/Partnerships pages).
 * /babylog/delete-account/ is not touched.
 *
 * Translation: ko = owner wording (+ unreviewed connecting text); en = unreviewed draft; the other 7 locales render
 * the English draft inside lang="en" until i18n-approved/ entries exist. See i18n-candidates/babylog-site-status.v1.json.
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
import { BL_NAV, BL_SLUG, getBabylogCopy, copyLangFor } from "./babylog-site-copy.mjs";
import { renderBabylogSection } from "./babylog-site-body.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20260924livon1"; // Life Stage assets are reused as-is
const BL_VER = "20261018bl2";

function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en) };
}

function jsonLd(lang, nav, seo, url) {
  const C = getBabylogCopy(lang);
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.title,
    description: seo.desc,
    url,
    inLanguage: copyLangFor(lang),
    isPartOf: { "@type": "WebSite", name: "Newon", url: SITE_ORIGIN },
    publisher: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN },
  };
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${lang}/` },
    { "@type": "ListItem", position: 2, name: C.ui.crumbBabylog, item: `${SITE_ORIGIN}/${lang}/${BL_SLUG}/` },
  ];
  if (nav.id !== "overview") {
    crumbs.push({
      "@type": "ListItem",
      position: 3,
      name: copyLangFor(lang) === "ko" ? nav.ko : nav.en,
      item: url,
    });
  }
  const crumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs };
  return `    <script type="application/ld+json">${JSON.stringify(page)}</script>
    <script type="application/ld+json">${JSON.stringify(crumb)}</script>`;
}

function renderPage(lang, nav) {
  const { flat, flatEn } = localeFlat(lang);
  const C = getBabylogCopy(lang.dir);
  const seo = C.seo[nav.id];
  const sub = nav.sub ? `${BL_SLUG}/${nav.sub}` : BL_SLUG;
  const header = renderStudioHeader(flat, flatEn, { activeNav: "babylog", base: nav.sub ? "../../" : "../" });
  const footer = renderStudioFooter(flat, flatEn, { base: nav.sub ? "../../" : "../" });
  const canonical = `${SITE_ORIGIN}/${lang.dir}/${sub}/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    LANG_DIR: lang.dir,
    FONT_LINKS: fontLinksHtml(lang.dir),
    TITLE: escapeHtml(seo.title),
    META_DESCRIPTION: escapeHtml(clampSeoDescription(seo.desc)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock(sub),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: renderBabylogSection(lang.dir, nav.id),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="/babylog-site.css?v=${BL_VER}" />
${jsonLd(lang.dir, nav, seo, canonical)}`,
    EXTRA_SCRIPTS: `<script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, BL_SLUG, nav.sub, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  return path.relative(ROOT, out);
}

export function renderBabylogSite() {
  const written = [];
  for (const nav of BL_NAV) {
    if (nav.sub) writeRootRedirect(`${BL_SLUG}/${nav.sub}`);
    for (const lang of LANGS) written.push(renderPage(lang, nav));
  }
  for (const nav of BL_NAV) if (nav.sub) written.push(path.join(BL_SLUG, nav.sub, "index.html"));
  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const rel of written) {
      const dest = path.join(pub, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(ROOT, rel), dest);
    }
  }
  console.log(`render-babylog-site: wrote ${written.length} files (${BL_NAV.length} pages × ${LANGS.length} locales + root redirects)`);
  return written;
}

if (import.meta.url === `file://${process.argv[1]}`) renderBabylogSite();
