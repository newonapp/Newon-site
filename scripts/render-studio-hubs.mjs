#!/usr/bin/env node
/**
 * Render Product Studio hub pages for all locales.
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
  statusBadge,
  studioStatusBadge,
} from "./hub-utils.mjs";
import { renderStudioHeader, renderStudioFooter, renderCompanySwitcher } from "./site-chrome.mjs";
import { allProducts, productsByType, AI_PRODUCTS, SAAS_PRODUCTS, GAMES_PRODUCTS, productCta } from "./products-data.mjs";
import { renderAppsShowcaseBody } from "./apps-showcase-render.mjs";
import { renderAiShowcaseBody } from "./ai-hub-render.mjs";
import { renderSaasShowcaseBody } from "./saas-hub-render.mjs";
import { renderGamesShowcaseBody } from "./games-hub-render.mjs";
import { renderToolsShowcaseBody, renderToolDetailBody } from "./tools-hub-render.mjs";
import { BUSINESS_PACKAGES, BUSINESS_SERVICES } from "./business-pricing.mjs";
import { TOOLS } from "./tools-data.mjs";
import { STORE_PRODUCTS } from "./store-data.mjs";
import { renderResources } from "./render-resources.mjs";
import { STUDIO_IA } from "./venture-studio-data.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const HUB_PAGES = [
  "products",
  "apps",
  "ai",
  "saas",
  "games",
  "studio",
  "tools",
  "store",
  "media",
  "blog",
  "labs",
  "market",
  "contact",
];

function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en), loc };
}

function chromeBaseForPath(pagePath) {
  const depth = String(pagePath || "")
    .split("/")
    .filter(Boolean).length;
  return "../".repeat(Math.max(1, depth));
}

function renderPage(lang, pagePath, opts) {
  const { flat, flatEn } = localeFlat(lang);
  const base = opts.base || chromeBaseForPath(pagePath);
  const header = renderStudioHeader(flat, flatEn, { activeNav: opts.activeNav || "", base });
  const footer = renderStudioFooter(flat, flatEn, { base });
  const switcher = opts.companySwitch
    ? renderCompanySwitcher(flat, flatEn, { active: opts.companySwitch, base })
    : "";
  const canonical = `${SITE_ORIGIN}/${lang.dir}/${pagePath}/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    TITLE: escapeHtml(opts.title),
    META_DESCRIPTION: escapeHtml(opts.description),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock(pagePath.replace(/\/.*$/, "") || pagePath.split("/")[0]),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header + switcher,
    MAIN_CONTENT: opts.body,
    CHROME_FOOTER: footer,
    EXTRA_CSS: opts.extraCss || "",
    EXTRA_SCRIPTS: opts.extraScripts || "",
  });
  const out = path.join(ROOT, lang.dir, pagePath, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
}

function productCard(p, flat, flatEn, lang) {
  const name = p.name || pick(flat, flatEn, p.nameKey) || p.slug;
  const tagline = p.tagline || pick(flat, flatEn, p.taglineKey) || "";
  const cta = productCta(p, lang.dir || lang);
  const icon = p.icon ? `<img class="hub-card__icon" src="${p.icon}" alt="" width="40" height="40" loading="lazy" decoding="async" />` : "";
  const analytics = cta.action === "open" ? 'data-analytics="product_view"' : 'data-analytics="product_cta_click"';
  return `<a class="hub-card" href="${cta.href}" data-product-type="${p.type}" ${analytics} data-analytics-product="${p.id || p.slug}">
    ${icon}
    <span class="hub-card__title">${escapeHtml(name)}</span>
    <span class="hub-card__body">${escapeHtml(tagline)}</span>
    <span class="hub-card__meta"><span>${escapeHtml(p.type)}</span> ${statusBadge(p.status, lang.dir || lang)} · ${escapeHtml(cta.label)}</span>
  </a>`;
}

function productsBody(flat, flatEn, lang) {
  const items = allProducts(lang.dir);
  const cards = items.map((p) => productCard(p, flat, flatEn, lang)).join("\n");
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  return `<section class="hub-hero hub-inner">
    <p class="hub-eyebrow">${t("studio.productsHeroLabel")}</p>
    <h1 class="hub-title">${t("studio.productsHeroTitle")}</h1>
    <p class="hub-lead">${t("studio.productsHeroLead")}</p>
  </section>
  <section class="hub-inner hub-section">
    <div class="hub-filters" data-product-filters>
      <button type="button" class="hub-filter is-active" data-filter="all">${t("studio.filterAll")}</button>
      <button type="button" class="hub-filter" data-filter="apps">${t("studio.filterApps")}</button>
      <button type="button" class="hub-filter" data-filter="ai">${t("studio.filterAi")}</button>
      <button type="button" class="hub-filter" data-filter="saas">${t("studio.filterSaas")}</button>
      <button type="button" class="hub-filter" data-filter="games">${t("studio.filterGames")}</button>
      <button type="button" class="hub-filter" data-filter="tools">${t("studio.filterTools")}</button>
    </div>
    <div class="hub-grid hub-grid--3" data-product-grid>${cards}</div>
  </section>
  <script>
  (function(){
    var params=new URLSearchParams(location.search);
    var initial=params.get("filter")||"all";
    var grid=document.querySelector("[data-product-grid]");
    var cards=grid?grid.querySelectorAll("[data-product-type]"):[];
    function setFilter(f){
      document.querySelectorAll("[data-product-filters] .hub-filter").forEach(function(b){
        b.classList.toggle("is-active",b.getAttribute("data-filter")===f);
      });
      cards.forEach(function(c){
        c.style.display=(f==="all"||c.getAttribute("data-product-type")===f)?"":"none";
      });
    }
    setFilter(initial);
    document.querySelectorAll("[data-product-filters] .hub-filter").forEach(function(btn){
      btn.addEventListener("click",function(){ setFilter(btn.getAttribute("data-filter")); });
    });
  })();
  </script>`;
}

function appsBody(flat, flatEn, lang) {
  return renderAppsShowcaseBody(flat, flatEn, lang);
}

function aiBody(flat, flatEn, lang) {
  return renderAiShowcaseBody(flat, flatEn, lang);
}

function saasBody(flat, flatEn) {
  return renderSaasShowcaseBody(flat, flatEn);
}

function gamesBody(flat, flatEn, lang) {
  return renderGamesShowcaseBody(flat, flatEn, lang);
}

function studioBody(flat, flatEn, lang = "en") {
  const t = (k, fb = "") => {
    const v = pick(flat, flatEn, k);
    return escapeHtml(v != null && v !== "" ? String(v) : fb);
  };
  const pillars = STUDIO_IA.map((col, idx) => {
    const n = String(idx + 1).padStart(2, "0");
    const title = t(col.labelKey, col.labelFb);
    const lead = t(col.leadKey, col.leadFb);
    const items = (col.items || [])
      .map((it) => {
        const status =
          it.status && it.status !== "OPERATING" && it.status !== "LIVE"
            ? studioStatusBadge(it.status, lang === "ko" ? "ko" : "en")
            : "";
        if (!it.href) {
          return `<div class="ns-pillar__item ns-pillar__item--soon"><span>${escapeHtml(it.title)}</span>${status}</div>`;
        }
        return `<a class="ns-pillar__item" href="../${escapeHtml(it.href)}"><span>${escapeHtml(it.title)}</span><span class="ns-pillar__meta">${status}<span aria-hidden="true">→</span></span></a>`;
      })
      .join("");
    return `<article class="ns-pillar" id="${escapeHtml(col.id)}">
      <header class="ns-pillar__head">
        <span class="ns-pillar__n" aria-hidden="true">${n}</span>
        <div>
          <h2 class="ns-pillar__title">${title}</h2>
          <p class="ns-pillar__lead">${lead}</p>
        </div>
      </header>
      <div class="ns-pillar__list">${items}</div>
    </article>`;
  }).join("");

  return `<link rel="stylesheet" href="/newon-studio.css?v=20260826ns1" />
<section class="ns-hero">
  <div class="ns-inner">
    <p class="ns-kicker">${t("studioHub.eyebrow", "NEWON STUDIO")}</p>
    <h1 class="ns-title">${t("studioHub.heroTitle", "브랜드와 제품이 세상에 보이는 방식을 만듭니다.")}</h1>
    <p class="ns-lead">${t("studioHub.heroLead", "브랜드의 이름과 정체성부터 디지털 경험, 콘텐츠와 새로운 IP까지 하나의 방향으로 설계합니다.")}</p>
    <div class="ns-actions">
      <a class="btn btn-ghost" href="#brand">${t("studioHub.ctaExplore", "Explore Studio ↓")}</a>
      <a class="btn btn-primary" href="../business/creative/#inquiry">${t("studioHub.ctaProject", "Start a Project ↗")}</a>
    </div>
    <p class="ns-note">${t("studioHub.positioning", "Creative Studio · Product Studio · Experimental Lab")}</p>
  </div>
</section>
<section class="ns-pillars" aria-label="Studio areas">
  <div class="ns-inner ns-pillars__grid">${pillars}</div>
</section>
<section class="ns-close">
  <div class="ns-inner">
    <p class="ns-kicker">${t("studioHub.closeKicker", "NEXT")}</p>
    <h2 class="ns-close__title">${t("studioHub.closeTitle", "프로젝트를 시작해 보세요.")}</h2>
    <div class="ns-actions">
      <a class="btn btn-primary" href="../business/creative/#inquiry">${t("studioHub.ctaProject", "Start a Project ↗")}</a>
      <a class="btn btn-ghost" href="../resources/labs/character-lab/">${t("studioHub.ctaIp", "Character Lab →")}</a>
    </div>
  </div>
</section>`;
}

function toolsHubBody(flat, flatEn) {
  return renderToolsShowcaseBody(flat, flatEn);
}

function toolPageBody(tool, flat, flatEn) {
  return renderToolDetailBody(tool, flat, flatEn);
}

function storeBody() {
  return "";
}

function mediaBody() {
  return "";
}

function blogBody() {
  return "";
}

function labsBody() {
  return "";
}

function metaRefreshPage(langDir, targetPath) {
  const target = `/${langDir}/${targetPath}/`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=${target}"/><link rel="canonical" href="${SITE_ORIGIN}${target}"/><title>Redirect</title></head><body><p><a href="${target}">Continue</a></p></body></html>\n`;
}

function marketBody(flat, flatEn) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  const cats = ["Templates", "Prompts", "UI Kits", "Developer Assets"];
  const cards = cats.map((c) => `<article class="hub-card"><span class="hub-card__title">${escapeHtml(c)}</span><span class="hub-card__body">${t("studio.marketHeroLead")}</span></article>`).join("");
  return `<section class="hub-hero hub-inner"><h1 class="hub-title">${t("studio.marketHeroTitle")}</h1><p class="hub-lead">${t("studio.marketHeroLead")}</p></section>
  <section class="hub-inner hub-section"><div class="hub-grid hub-grid--2">${cards}</div></section>`;
}

function contactBody(flat, flatEn) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  return `<section class="hub-hero hub-inner"><h1 class="hub-title">${t("studio.contactHeroTitle")}</h1><p class="hub-lead">${t("studio.contactHeroLead")}</p></section>
  <section class="hub-inner hub-section"><div class="hub-grid hub-grid--2">
    <a class="hub-card" href="mailto:newon@newon.app"><span class="hub-card__title">${t("studio.contactGeneral")}</span><span class="hub-card__body">newon@newon.app</span></a>
    <a class="hub-card" href="../business/#inquiry"><span class="hub-card__title">${t("studio.contactBusiness")}</span><span class="hub-card__body">Business form →</span></a>
    <a class="hub-card" href="mailto:newon@newon.app?subject=Partnership"><span class="hub-card__title">${t("studio.contactPartnership")}</span></a>
    <a class="hub-card" href="mailto:newon@newon.app?subject=Press"><span class="hub-card__title">${t("studio.contactPress")}</span></a>
    <a class="hub-card" href="../products/?filter=apps"><span class="hub-card__title">${t("studio.contactSupport")}</span><span class="hub-card__body">App support flows</span></a>
  </div></section>`;
}

const RESOURCE_REDIRECT_HUBS = new Set(["store", "blog", "media", "labs"]);

const HUB_RENDERERS = {
  products: (f, fe, l) => ({ activeNav: "products", title: pick(f, fe, "studio.productsSeoTitle"), description: pick(f, fe, "studio.productsMetaDescription"), body: productsBody(f, fe, l) }),
  apps: (f, fe, l) => ({
    activeNav: "products",
    title: pick(f, fe, "studio.appsSeoTitle"),
    description: pick(f, fe, "studio.appsMetaDescription"),
    body: appsBody(f, fe, l),
    extraCss: '<link rel="stylesheet" href="/apps-hub.css?v=20260825apps7" />',
    extraScripts: '<script src="/apps-hub.js?v=20260825apps5" defer></script>',
  }),
  ai: (f, fe, l) => ({
    activeNav: "products",
    title: pick(f, fe, "studio.aiSeoTitle"),
    description: pick(f, fe, "studio.aiMetaDescription"),
    body: aiBody(f, fe, l),
    extraCss: '<link rel="stylesheet" href="/ai-hub.css?v=20260825ai7" />',
    extraScripts: '<script src="/ai-hub.js?v=20260825ai5" defer></script>',
  }),
  saas: (f, fe, l) => ({
    activeNav: "products",
    title: pick(f, fe, "studio.saasSeoTitle"),
    description: pick(f, fe, "studio.saasMetaDescription"),
    body: saasBody(f, fe, l),
    extraCss: '<link rel="stylesheet" href="/saas-hub.css?v=20260825saas7" />',
    extraScripts: '<script src="/saas-hub.js?v=20260825saas6" defer></script>',
  }),
  games: (f, fe, l) => ({
    activeNav: "products",
    title: pick(f, fe, "studio.gamesSeoTitle"),
    description: pick(f, fe, "studio.gamesMetaDescription"),
    body: gamesBody(f, fe, l),
    extraCss: '<link rel="stylesheet" href="/games-hub.css?v=20260825games5" />',
    extraScripts: '<script src="/games-hub.js?v=20260825games4" defer></script>',
  }),
  studio: (f, fe, l) => ({
    activeNav: "studio",
    title: pick(f, fe, "studioHub.seoTitle") || pick(f, fe, "studio.studioSeoTitle"),
    description: pick(f, fe, "studioHub.metaDescription") || pick(f, fe, "studio.studioMetaDescription"),
    body: studioBody(f, fe, l?.dir || "en"),
  }),
  tools: (f, fe) => ({
    activeNav: "products",
    title: pick(f, fe, "studio.toolsSeoTitle"),
    description: pick(f, fe, "studio.toolsMetaDescription"),
    body: toolsHubBody(f, fe),
    extraCss: '<link rel="stylesheet" href="/tools-hub.css?v=20260826tools9" />',
    extraScripts: '<script src="/tools/tools-hub.js?v=20260825tools2" defer></script>',
  }),
  store: (f, fe) => ({ activeNav: "resources", title: pick(f, fe, "studio.storeSeoTitle"), description: pick(f, fe, "studio.storeMetaDescription"), body: storeBody(f, fe) }),
  media: (f, fe) => ({ activeNav: "resources", title: pick(f, fe, "studio.mediaSeoTitle"), description: pick(f, fe, "studio.mediaMetaDescription"), body: mediaBody(f, fe) }),
  blog: (f, fe) => ({ activeNav: "resources", title: pick(f, fe, "studio.blogSeoTitle"), description: pick(f, fe, "studio.blogMetaDescription"), body: blogBody(f, fe) }),
  labs: (f, fe, l) => ({ activeNav: "resources", title: pick(f, fe, "studio.labsSeoTitle"), description: pick(f, fe, "studio.labsMetaDescription"), body: labsBody(f, fe, l) }),
  market: (f, fe) => ({ activeNav: "resources", title: pick(f, fe, "studio.marketSeoTitle"), description: pick(f, fe, "studio.marketMetaDescription"), body: marketBody(f, fe) }),
  contact: (f, fe) => ({
    activeNav: "company",
    companySwitch: "contact",
    title: pick(f, fe, "studio.contactSeoTitle"),
    description: pick(f, fe, "studio.contactMetaDescription"),
    body: contactBody(f, fe),
  }),
};

for (const hub of HUB_PAGES) {
  writeRootRedirect(hub);
  const fn = HUB_RENDERERS[hub];
  for (const lang of LANGS) {
    if (RESOURCE_REDIRECT_HUBS.has(hub)) {
      const out = path.join(ROOT, lang.dir, hub, "index.html");
      ensureDir(out);
      fs.writeFileSync(out, metaRefreshPage(lang.dir, `resources/${hub}`));
      continue;
    }
    const { flat, flatEn } = localeFlat(lang);
    const opts = fn(flat, flatEn, lang);
    renderPage(lang, hub, opts);
  }
}

// Tool detail pages
for (const tool of TOOLS) {
  for (const lang of LANGS) {
    const { flat, flatEn } = localeFlat(lang);
    renderPage(lang, `tools/${tool.slug}`, {
      activeNav: "products",
      title: `${pick(flat, flatEn, tool.nameKey)} | Newon Tools`,
      description: pick(flat, flatEn, tool.descKey),
      body: toolPageBody(tool, flat, flatEn),
      extraCss: '<link rel="stylesheet" href="/tools-hub.css?v=20260826tools9" />',
      extraScripts: '<script src="/tools/tools-runtime.js?v=20260826tools9" defer></script>',
    });
  }
}

// Store detail pages → resources/store/{slug}/
for (const product of STORE_PRODUCTS) {
  for (const lang of LANGS) {
    const out = path.join(ROOT, lang.dir, "store", product.slug, "index.html");
    ensureDir(out);
    fs.writeFileSync(out, metaRefreshPage(lang.dir, `resources/store/${product.slug}`));
  }
}

// Copy tools assets to root tools/
const toolsDir = path.join(ROOT, "tools");
fs.mkdirSync(toolsDir, { recursive: true });

renderResources();

console.log("render-studio-hubs OK:", HUB_PAGES.join(", "));
