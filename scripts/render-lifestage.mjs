#!/usr/bin/env node
/**
 * Render the LivOn business pages for all locales.
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
import { renderLifeStageSection } from "./home-lifestage-body.mjs";
import { getLifeStageCopy } from "./home-lifestage-copy.mjs";
import { LIVON_HUB_PATH, LIVON_LEGACY_PATH } from "./newon-business-units.mjs";

const HUB = LIVON_HUB_PATH.replace(/\/$/, "");
const LEGACY = LIVON_LEGACY_PATH.replace(/\/$/, "");

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20260924livon1";

const SEO = {
  ko: {
    title: "LivOn | Newon — 10대부터 70대 이상까지, 생애주기 생활 플랫폼",
    description:
      "삶의 모든 단계에, 필요한 다음을. 10대부터 70대까지, 생애 첫 경험과 인생의 변화까지 함께하는 생애주기 플랫폼입니다. 현재는 사업 소개이며, 예약·결제·가입은 아직 연결되지 않았습니다.",
  },
  en: {
    title: "LivOn | Newon — A life-journey platform from the teens through the 70s and beyond.",
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
  const canonical = `${SITE_ORIGIN}/${lang.dir}/${HUB}/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    LANG_DIR: lang.dir,
    FONT_LINKS: fontLinksHtml(lang.dir),
    TITLE: escapeHtml(seo.title),
    META_DESCRIPTION: escapeHtml(clampSeoDescription(seo.description)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock(HUB),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: renderLifeStageSection(lang.dir, { detail: true }),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />`,
    EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260924play2"></script>
    <script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, HUB, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  writeLegacyRedirect(lang.dir);
  const ages = copy.journey.items.map((a) => a.id).join(",");
  const firstN = (copy.first && copy.first.items && copy.first.items.length) || 0;
  console.log("render-lifestage:", lang.dir, "journey", ages, "first", firstN, "platform", copy.platform.items.length);
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
for (const lang of LANGS) renderPage(lang);
console.log("render-lifestage: OK", getLifeStageCopy("ko").hero.ctaMain);
