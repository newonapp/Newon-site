#!/usr/bin/env node
/**
 * Render Studio per-service detail pages (Business service design system).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  ROOT,
  LANGS,
  OG_LOCALE,
  SITE_ORIGIN,
  loadJson,
  flatten,
  fillMissing,
  escapeHtml,
  hreflangBlock,
  ensureDir,
  writeRootRedirect,
  fontLinksHtml,
} from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import {
  listStudioDetailSlugs,
  getStudioServiceDetail,
  renderStudioServiceDetailBody,
} from "./studio-service-detail-render.mjs";
import { studioServicePagePath } from "./studio-pricing.mjs";

const TEMPLATE = fs.readFileSync(path.join(ROOT, "templates/business-service.html"), "utf8");

function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en) };
}

function chromeBaseForPath(pagePath) {
  const depth = String(pagePath || "")
    .split("/")
    .filter(Boolean).length;
  return "../".repeat(depth + 1);
}

function renderPage(lang, pagePath, opts) {
  const { flat, flatEn } = localeFlat(lang);
  const base = opts.base || chromeBaseForPath(pagePath);
  const canonical = `${SITE_ORIGIN}/${lang.dir}/${pagePath}/`;
  let html = TEMPLATE;
  html = html.replace(/\{\{HTML_LANG\}\}/g, lang.htmlLang);
  html = html.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(lang.dir));
  html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[lang.dir] || "en_US");
  html = html.replace(/\{\{CANONICAL\}\}/g, canonical);
  html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(pagePath));
  html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(opts.title));
  html = html.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(clampSeoDescription(opts.description)));
  html = html.replace(/\{\{SERVICE_SLUG\}\}/g, escapeHtml(opts.slug));
  html = html.replace(/\{\{ANALYTICS_ID\}\}/g, escapeHtml(opts.analyticsId || `studio_${opts.slug}`));
  html = html.replace(/\{\{PAGE_BODY\}\}/g, opts.body);
  html = injectSiteChrome(html, flat, flatEn, { activeNav: "studio", base, idSuffix: "hub" });
  const out = path.join(ROOT, lang.dir, pagePath, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
}

export function renderStudioServiceDetails() {
  const slugs = listStudioDetailSlugs();
  let count = 0;

  for (const slug of slugs) {
    const pagePath = studioServicePagePath(slug);
    if (!pagePath) continue;
    writeRootRedirect(pagePath);

    for (const lang of LANGS) {
      const pageLang = lang.dir;
      const detail = getStudioServiceDetail(slug, pageLang);
      if (!detail) continue;
      const body = renderStudioServiceDetailBody(slug, pageLang);
      renderPage(lang, pagePath, {
        slug,
        title: detail.seoTitle,
        description: detail.metaDescription,
        body,
        analyticsId: `studio_${slug}`,
      });
      count++;
    }
  }

  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const lang of LANGS) {
      for (const slug of slugs) {
        const pagePath = studioServicePagePath(slug);
        const src = path.join(ROOT, lang.dir, pagePath, "index.html");
        if (!fs.existsSync(src)) continue;
        const dest = path.join(pub, lang.dir, pagePath, "index.html");
        ensureDir(dest);
        fs.copyFileSync(src, dest);
      }
    }
  }

  console.log(`render-studio-service-details: wrote ${count} pages (${slugs.length} services × ${LANGS.length} langs)`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) renderStudioServiceDetails();
