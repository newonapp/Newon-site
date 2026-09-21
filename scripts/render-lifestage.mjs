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
const NLS_VER = "20260921nls13";

const SEO = {
  ko: {
    title: "Life Stage | Newon — 인생의 모든 처음을, 더 쉽게.",
    description:
      "진로와 독립, 취업과 커리어, 가족과 돌봄, 은퇴 이후까지. Life Stage는 삶의 모든 단계에서 필요한 지식과 도구, 사람과 서비스를 연결하는 종합 라이프 플랫폼입니다.",
  },
  en: {
    title: "Life Stage | Newon — Every first in life, made clearer.",
    description:
      "Career and independence, work and family, caregiving and later life. Life Stage connects the knowledge, tools, people, and services every stage needs.",
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
