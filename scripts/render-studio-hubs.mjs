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
} from "./hub-utils.mjs";
import { renderStudioHeader, renderStudioFooter } from "./site-chrome.mjs";
import { allProducts, productsByType, AI_PRODUCTS, SAAS_PRODUCTS, GAMES_PRODUCTS, productCta } from "./products-data.mjs";
import { BUSINESS_PACKAGES, BUSINESS_SERVICES } from "./business-pricing.mjs";
import { TOOLS } from "./tools-data.mjs";
import { STORE_PRODUCTS } from "./store-data.mjs";
import { LABS_EXPERIMENTS } from "./labs-data.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const HUB_PAGES = [
  "products",
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

function renderPage(lang, pagePath, opts) {
  const { flat, flatEn } = localeFlat(lang);
  const header = renderStudioHeader(flat, flatEn, { activeNav: opts.activeNav || "" });
  const footer = renderStudioFooter(flat, flatEn);
  const canonical = `${SITE_ORIGIN}/${lang.dir}/${pagePath}/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    TITLE: escapeHtml(opts.title),
    META_DESCRIPTION: escapeHtml(opts.description),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock(pagePath.replace(/\/.*$/, "") || pagePath.split("/")[0]),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
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

function aiBody(flat, flatEn, lang) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  const cards = AI_PRODUCTS.map((p) => {
    const name = pick(flat, flatEn, p.nameKey);
    const tag = pick(flat, flatEn, p.taglineKey);
    return `<article class="hub-card">
      <span class="hub-card__title">${escapeHtml(name)}</span>
      <span class="hub-card__body">${escapeHtml(tag)}</span>
      <span class="hub-card__meta">${statusBadge(p.status, lang.dir)}</span>
      <form class="waitlist-form" data-waitlist-form data-product-id="${p.id}" data-form-type="waitlist" style="margin-top:0.75rem">
        <input type="hidden" name="productId" value="${p.id}" />
        <input type="email" name="email" placeholder="email@example.com" required aria-label="Email" />
        <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" />
        <button type="submit" class="btn btn-ghost">${t("studio.storeWaitlist")}</button>
      </form>
      <p class="waitlist-success" data-waitlist-success hidden>${t("studio.waitlistSuccess")}</p>
      <p class="waitlist-success" data-waitlist-duplicate hidden>${t("studio.newsletterAlready")}</p>
      <p class="waitlist-error" data-waitlist-error hidden role="alert">${t("studio.waitlistError")}</p>
    </article>`;
  }).join("");
  return `<section class="hub-hero hub-inner">
    <p class="hub-eyebrow">${t("studio.aiHeroLabel")}</p>
    <h1 class="hub-title">${t("studio.aiHeroTitle")}</h1>
    <div class="hub-hero__actions"><a class="btn btn-primary" href="../business/#inquiry" data-analytics="business_cta_click">${t("studio.aiCta")}</a></div>
  </section>
  <section class="hub-inner hub-section"><h2 class="hub-eyebrow">${t("studio.aiSection1Title")}</h2><p class="hub-lead">${t("studio.aiSection1Lead")}</p><div class="hub-grid hub-grid--2" style="margin-top:1.5rem">${cards}</div></section>
  <section class="hub-inner hub-section"><h2 class="hub-eyebrow">${t("studio.aiSection2Title")}</h2><p class="hub-lead">${t("studio.aiSection2Lead")}</p><p class="hub-lead" style="margin-top:1rem"><a href="../business/#inquiry">${t("studio.aiCta")} →</a></p></section>
  <section class="hub-inner hub-section"><h2 class="hub-eyebrow">${t("studio.aiSection3Title")}</h2><p class="hub-lead">${t("studio.aiSection3Lead")}</p><p class="hub-lead" style="margin-top:1rem"><a href="../products/?filter=apps">${t("studio.viewDetails")} →</a></p></section>`;
}

function saasBody(flat, flatEn, lang) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  const cards = SAAS_PRODUCTS.map((p) => `<article class="hub-card">
    <span class="hub-card__title">${escapeHtml(pick(flat, flatEn, p.nameKey))}</span>
    <span class="hub-card__body">${escapeHtml(pick(flat, flatEn, p.taglineKey))}</span>
    <span class="hub-card__meta"><span>${escapeHtml(p.pricing)}</span> ${statusBadge(p.status, lang.dir)}</span>
  </article>`).join("");
  return `<section class="hub-hero hub-inner"><h1 class="hub-title">${t("studio.saasHeroTitle")}</h1></section>
  <section class="hub-inner hub-section"><div class="hub-grid hub-grid--2">${cards}</div></section>`;
}

function gamesBody(flat, flatEn, lang) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  const g = GAMES_PRODUCTS[0];
  return `<section class="hub-hero hub-inner">
    <p class="hub-eyebrow">${t("studio.gamesHeroLabel")}</p>
    <h1 class="hub-title">${t("studio.gamesHeroTitle")}</h1>
  </section>
  <section class="hub-inner hub-section">
    <div class="hub-grid hub-grid--2">
      <a class="hub-card" href="../404-human/" data-analytics="game_play_click">
        <img class="hub-card__icon" src="/404-human-logo.png" alt="" width="48" height="48" loading="lazy" />
        <span class="hub-card__title">${escapeHtml(g.name)}</span>
        <span class="hub-card__body">${t("studio.game404Tagline")}</span>
        <span class="hub-card__meta">${statusBadge("live", lang.dir)} · ${t("studio.gamesPlay")}</span>
      </a>
    </div>
  </section>
  <section class="hub-inner hub-section">
    <h2 class="hub-eyebrow">${t("studio.gamesTabUniverse")}</h2>
    <p class="hub-lead">${t("studio.gamesUniverseSoon")}</p>
  </section>`;
}

function studioBody(flat, flatEn) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  const areas = [1, 2, 3, 4, 5, 6].map((n) => `<li class="hub-card"><span class="hub-card__title">${t(`studio.studioArea${n}`)}</span></li>`).join("");
  return `<section class="hub-hero hub-inner"><h1 class="hub-title">${t("studio.studioHeroTitle")}</h1>
    <div class="hub-hero__actions"><a class="btn btn-primary" href="../portfolio/">Portfolio</a><a class="btn btn-ghost" href="../business/#inquiry">Business</a></div>
  </section>
  <section class="hub-inner hub-section"><div class="hub-grid hub-grid--3">${areas}</div></section>`;
}

function toolsHubBody(flat, flatEn) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  const cards = TOOLS.map((tool) => `<a class="hub-card" href="${tool.slug}/" data-tool-category="${tool.category}">
    <span class="hub-card__title">${escapeHtml(pick(flat, flatEn, tool.nameKey))}</span>
    <span class="hub-card__body">${escapeHtml(pick(flat, flatEn, tool.descKey))}</span>
  </a>`).join("");
  return `<section class="hub-hero hub-inner">
    <p class="hub-eyebrow">${t("studio.toolsHeroLabel")}</p>
    <h1 class="hub-title">${t("studio.toolsHeroTitle")}</h1>
    <input type="search" class="search-modal__input" data-tools-search placeholder="${t("studio.toolsSearchPlaceholder")}" style="margin-top:1.25rem;max-width:24rem" />
  </section>
  <section class="hub-inner hub-section"><div class="hub-grid hub-grid--3" data-tools-grid>${cards}</div></section>
  <script src="/tools/tools-hub.js" defer></script>`;
}

function storeBody(flat, flatEn) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  const cards = STORE_PRODUCTS.map((p) => `<a class="hub-card" href="${p.slug}/">
    <span class="hub-card__title">${escapeHtml(pick(flat, flatEn, p.nameKey))}</span>
    <span class="hub-card__body">${escapeHtml(pick(flat, flatEn, p.descKey))}</span>
    <span class="hub-card__meta">${statusBadge(p.status)}</span>
  </a>`).join("");
  return `<section class="hub-hero hub-inner"><h1 class="hub-title">${t("studio.storeHeroTitle")}</h1><p class="hub-lead">${t("studio.storeHeroLead")}</p></section>
  <section class="hub-inner hub-section"><div class="hub-grid hub-grid--3">${cards}</div></section>`;
}

function mediaBody(flat, flatEn) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  const cats = ["Build in Public", "Development", "AI", "Startup", "Games", "Product", "Newon"];
  const cards = cats.map((c) => `<article class="hub-card"><span class="hub-card__title">${escapeHtml(c)}</span><span class="hub-card__body">Coming Soon</span></article>`).join("");
  return `<section class="hub-hero hub-inner"><h1 class="hub-title">${t("studio.mediaHeroTitle")}</h1><p class="hub-lead">${t("studio.mediaHeroLead")}</p></section>
  <section class="hub-inner hub-section"><div class="hub-grid hub-grid--3">${cards}</div></section>
  ${newsletterBlock(flat, flatEn)}`;
}

function blogBody(flat, flatEn) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  return `<section class="hub-hero hub-inner"><h1 class="hub-title">${t("studio.blogHeroTitle")}</h1><p class="hub-lead">${t("studio.blogEmpty")}</p></section>
  ${newsletterBlock(flat, flatEn)}`;
}

function labsBody(flat, flatEn, lang) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  const cards = LABS_EXPERIMENTS.map((e) => `<article class="hub-card">
    <span class="hub-card__title">${escapeHtml(pick(flat, flatEn, e.nameKey))}</span>
    <span class="hub-card__body">${escapeHtml(pick(flat, flatEn, e.descKey))}</span>
    <span class="hub-card__meta">${statusBadge(e.status === "exploring" ? "concept" : e.status, lang.dir)}</span>
  </article>`).join("");
  return `<section class="hub-hero hub-inner"><p class="hub-eyebrow">${t("studio.labsHeroLabel")}</p><h1 class="hub-title">${t("studio.labsHeroTitle")}</h1></section>
  <section class="hub-inner hub-section"><div class="hub-grid hub-grid--3">${cards}</div></section>`;
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

function newsletterBlock(flat, flatEn) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  return `<section class="hub-inner hub-section"><h2 class="hub-title" style="font-size:1.5rem">${t("studio.newsletterTitle")}</h2>
    <p class="hub-lead">${t("studio.newsletterLead")}</p>
    <form class="waitlist-form" data-waitlist-form data-form-type="newsletter" data-product-id="newsletter" style="margin-top:1rem">
      <input type="hidden" name="productId" value="newsletter" />
      <input type="email" name="email" placeholder="email@example.com" required />
      <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" />
      <button type="submit" class="btn btn-primary">${t("studio.newsletterBtn")}</button>
    </form>
    <p class="waitlist-success" data-waitlist-success hidden>${t("studio.newsletterSuccess")}</p>
    <p class="waitlist-success" data-waitlist-duplicate hidden>${t("studio.newsletterAlready")}</p>
    <p class="waitlist-error" data-waitlist-error hidden role="alert">${t("studio.waitlistError")}</p>
  </section>`;
}

function toolPageBody(tool, flat, flatEn) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  const related = TOOLS.filter((x) => x.slug !== tool.slug).slice(0, 4)
    .map((x) => `<a class="hub-card" href="../${x.slug}/"><span class="hub-card__title">${escapeHtml(pick(flat, flatEn, x.nameKey))}</span></a>`).join("");
  return `<article class="hub-hero hub-inner">
    <h1 class="hub-title">${t(tool.nameKey)}</h1>
    <p class="hub-lead">${t(tool.descKey)}</p>
  </article>
  <section class="hub-inner hub-section">
    <div class="tool-panel" data-tool-id="${tool.id}"><div data-tool-mount="${tool.slug}"></div></div>
  </section>
  <section class="hub-inner hub-section"><h2 class="hub-eyebrow">FAQ</h2><p class="hub-lead">${t(tool.descKey)}</p></section>
  <section class="hub-inner hub-section"><h2 class="hub-eyebrow">Related</h2><div class="hub-grid hub-grid--2">${related}</div></section>`;
}

function storeDetailBody(product, flat, flatEn) {
  const t = (k) => escapeHtml(pick(flat, flatEn, k) || "");
  return `<article class="hub-hero hub-inner">
    <h1 class="hub-title">${t(product.nameKey)}</h1>
    <p class="hub-lead">${t(product.descKey)}</p>
    <p class="hub-lead">${statusBadge(product.status)}</p>
  </article>
  <section class="hub-inner hub-section">
    <form class="waitlist-form" data-waitlist-form data-product-id="${product.slug}" data-form-type="waitlist">
      <input type="hidden" name="productId" value="${product.slug}" />
      <input type="email" name="email" placeholder="email@example.com" required />
      <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" />
      <button type="submit" class="btn btn-primary" data-analytics="store_buy_click">${t("studio.storeWaitlist")}</button>
    </form>
    <p class="waitlist-success" data-waitlist-success hidden>${t("studio.waitlistSuccess")}</p>
  </section>`;
}

const HUB_RENDERERS = {
  products: (f, fe, l) => ({ activeNav: "products", title: pick(f, fe, "studio.productsSeoTitle"), description: pick(f, fe, "studio.productsMetaDescription"), body: productsBody(f, fe, l) }),
  ai: (f, fe, l) => ({ activeNav: "products", title: pick(f, fe, "studio.aiSeoTitle"), description: pick(f, fe, "studio.aiMetaDescription"), body: aiBody(f, fe, l) }),
  saas: (f, fe, l) => ({ activeNav: "products", title: pick(f, fe, "studio.saasSeoTitle"), description: pick(f, fe, "studio.saasMetaDescription"), body: saasBody(f, fe, l) }),
  games: (f, fe, l) => ({ activeNav: "games", title: pick(f, fe, "studio.gamesSeoTitle"), description: pick(f, fe, "studio.gamesMetaDescription"), body: gamesBody(f, fe, l) }),
  studio: (f, fe) => ({ activeNav: "about", title: pick(f, fe, "studio.studioSeoTitle"), description: pick(f, fe, "studio.studioMetaDescription"), body: studioBody(f, fe) }),
  tools: (f, fe) => ({ activeNav: "tools", title: pick(f, fe, "studio.toolsSeoTitle"), description: pick(f, fe, "studio.toolsMetaDescription"), body: toolsHubBody(f, fe), extraScripts: '<script src="/tools/tools-runtime.js" defer></script>' }),
  store: (f, fe) => ({ activeNav: "store", title: pick(f, fe, "studio.storeSeoTitle"), description: pick(f, fe, "studio.storeMetaDescription"), body: storeBody(f, fe) }),
  media: (f, fe) => ({ activeNav: "about", title: pick(f, fe, "studio.mediaSeoTitle"), description: pick(f, fe, "studio.mediaMetaDescription"), body: mediaBody(f, fe) }),
  blog: (f, fe) => ({ activeNav: "about", title: pick(f, fe, "studio.blogSeoTitle"), description: pick(f, fe, "studio.blogMetaDescription"), body: blogBody(f, fe) }),
  labs: (f, fe, l) => ({ activeNav: "products", title: pick(f, fe, "studio.labsSeoTitle"), description: pick(f, fe, "studio.labsMetaDescription"), body: labsBody(f, fe, l) }),
  market: (f, fe) => ({ activeNav: "store", title: pick(f, fe, "studio.marketSeoTitle"), description: pick(f, fe, "studio.marketMetaDescription"), body: marketBody(f, fe) }),
  contact: (f, fe) => ({ activeNav: "about", title: pick(f, fe, "studio.contactSeoTitle"), description: pick(f, fe, "studio.contactMetaDescription"), body: contactBody(f, fe) }),
};

for (const hub of HUB_PAGES) {
  writeRootRedirect(hub);
  const fn = HUB_RENDERERS[hub];
  for (const lang of LANGS) {
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
      activeNav: "tools",
      title: `${pick(flat, flatEn, tool.nameKey)} — Newon Tools`,
      description: pick(flat, flatEn, tool.descKey),
      body: toolPageBody(tool, flat, flatEn),
      extraScripts: '<script src="/tools/tools-runtime.js" defer></script>',
    });
  }
}

// Store detail pages
for (const product of STORE_PRODUCTS) {
  for (const lang of LANGS) {
    const { flat, flatEn } = localeFlat(lang);
    renderPage(lang, `store/${product.slug}`, {
      activeNav: "store",
      title: `${pick(flat, flatEn, product.nameKey)} — Newon Store`,
      description: pick(flat, flatEn, product.descKey),
      body: storeDetailBody(product, flat, flatEn),
    });
  }
}

// Copy tools assets to root tools/
const toolsDir = path.join(ROOT, "tools");
fs.mkdirSync(toolsDir, { recursive: true });

console.log("render-studio-hubs OK:", HUB_PAGES.join(", "));
