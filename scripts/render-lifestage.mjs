#!/usr/bin/env node
/**
 * Render /{lang}/lifestage/ detail pages for all locales.
 * Does not restyle the homepage Livon story row.
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
import { renderLifeStageSection } from "./home-lifestage-body.mjs";
import { getLifeStageCopy } from "./home-lifestage-copy.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20260922loop2";

const SEO = {
  ko: {
    title: "Livon | Newon — 10대부터 70대까지, 생애주기 종합 플랫폼",
    description:
      "삶의 모든 단계에, 필요한 다음을. 10대부터 70대까지, 생애 첫 경험과 인생의 변화까지 함께하는 생애주기 플랫폼입니다. 현재는 사업 소개이며, 예약·결제·가입은 아직 연결되지 않았습니다.",
  },
  en: {
    title: "Livon | Newon — A life-stage platform from the teens through the 70s.",
    description:
      "At every stage of life, the next thing you need. A platform for first experiences, life changes, and new beginnings, from the teens through the 70s. This page is an introduction — booking, payment, and sign-up are not connected yet.",
  },
};

function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en) };
}

function seoFor(dir) {
  return SEO[dir] || SEO.en;
}

function renderPage(lang) {
  const { flat, flatEn } = localeFlat(lang);
  const seo = seoFor(lang.dir);
  const copy = getLifeStageCopy(lang.dir);
  const header = renderStudioHeader(flat, flatEn, { activeNav: "lifestage", base: "../" });
  const footer = renderStudioFooter(flat, flatEn, { base: "../" });
  const canonical = `${SITE_ORIGIN}/${lang.dir}/lifestage/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    LANG_DIR: lang.dir,
    FONT_LINKS: fontLinksHtml(lang.dir),
    TITLE: escapeHtml(seo.title),
    META_DESCRIPTION: escapeHtml(clampSeoDescription(seo.description)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock("lifestage"),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: renderLifeStageSection(lang.dir, { detail: true }),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />`,
    EXTRA_SCRIPTS: `<script src="/film-keep.js?v=${NLS_VER}"></script>
    <script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, "lifestage", "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  const ages = copy.journey.items.map((a) => a.id).join(",");
  const firstN = (copy.first && copy.first.items && copy.first.items.length) || 0;
  console.log("render-lifestage:", lang.dir, "journey", ages, "first", firstN, "platform", copy.platform.items.length);
}

writeRootRedirect("lifestage");
for (const lang of LANGS) renderPage(lang);
console.log("render-lifestage: OK", getLifeStageCopy("ko").hero.ctaMain);
