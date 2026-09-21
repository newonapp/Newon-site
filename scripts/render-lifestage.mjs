#!/usr/bin/env node
/**
 * Render /{lang}/lifestage/ detail pages for all locales.
 * Does not restyle the homepage Life Stage story row.
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
const NLS_VER = "20260921nls19";

const SEO = {
  ko: {
    title: "Life Stage | Newon — 인생의 다양한 처음을 준비하고 연결하다.",
    description:
      "진로, 경제생활, 취업, 독립, 가족, 건강, 은퇴처럼 전 연령의 생애 상황을 연결하는 플랫폼입니다. 현재는 사업 소개이며, 개인별 분석·AI 상담·예약은 아직 이용할 수 없습니다.",
  },
  en: {
    title: "Life Stage | Newon — First moments in life, prepared and connected.",
    description:
      "An all-age platform for career, money, work, independence, family, health, and retirement. This page is a business introduction — personal analysis, AI advice, and booking are not live yet.",
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
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=${NLS_VER}" />`,
    EXTRA_SCRIPTS: `<script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, "lifestage", "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  const ages = copy.ages.items.map((a) => a.id).join(",");
  console.log("render-lifestage:", lang.dir, "ages", ages, "sits", copy.sits.items.length, "fields", copy.knowledge.fields.length);
}

function patchHomeNav() {
  for (const lang of LANGS) {
    const file = path.join(ROOT, lang.dir, "index.html");
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, "utf8");
    const from = new RegExp(`href="/${lang.dir}/#story-lifestage"`, "g");
    const to = `href="/${lang.dir}/lifestage/"`;
    html = html.replace(from, to);
    fs.writeFileSync(file, html);
  }
  const root = path.join(ROOT, "index.html");
  if (fs.existsSync(root)) {
    let html = fs.readFileSync(root, "utf8");
    html = html.replace(/href="\/ko\/#story-lifestage"/g, 'href="/ko/lifestage/"');
    fs.writeFileSync(root, html);
  }
}

writeRootRedirect("lifestage");
for (const lang of LANGS) renderPage(lang);
patchHomeNav();
console.log("render-lifestage: OK", getLifeStageCopy("ko").hero.ctaMain);
