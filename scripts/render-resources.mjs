#!/usr/bin/env node
/**
 * Render /{lang}/resources/ and /{lang}/resources/{slug}/ (+ details).
 * Also writes meta-refresh aliases for old flat hubs and root redirects.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGS, OG_LOCALE, SITE_ORIGIN, ROOT, escapeHtml } from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { RESOURCE_PAGES } from "./resources-catalog.mjs";
import { getResourceCopy, getAllResourceCopies } from "./resources-copy.mjs";
import {
  getStoreProducts,
  getPublishedBlogPosts,
  getLabsExperiments,
  getLabStatusCounts,
  getNewsletterIssues,
  getEducationTopics,
  getPublishedMediaItems,
  getMediaItem,
  buildSearchIndex,
  STORE_CATEGORIES,
  normalizeStoreCategory,
} from "./resources-data.mjs";
import { getPublishedInsights, INSIGHT_CATEGORIES, getInsight } from "./insights-data.mjs";
import { labDetailSeoDescription } from "./lab-detail-bodies.mjs";
import { renderLabDetailBody } from "./labs-bs-detail-render.mjs";
import { buildLabsHubBody } from "./labs-hub.mjs";
import { buildResourcesIndexBody } from "./resources-index.mjs";
import { getRelatedResources } from "./resources-registry.mjs";
import { resourceRelatedList, resourceMetaRow, resourceShare, resourceRelatedProducts, resourcePrevNext, jsonLdScript } from "./resources-components.mjs";
import { buildStoreDetailBody, storeDetailSeo } from "./store-detail-body.mjs";
import { buildBlogHubBody } from "./blog-hub-body.mjs";
import { buildMediaHubBody } from "./media-hub-body.mjs";
import { resourcesBreadcrumb, resourcesHeroBlock } from "./resources-hub-hero.mjs";
import { buildRhExploreSection } from "./resources-explore-grid.mjs";
import { insightsResearchSection } from "./insights-research-section.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const template = fs.readFileSync(path.join(ROOT, "templates", "resource.html"), "utf8");
const bsTemplate = fs.readFileSync(path.join(ROOT, "templates", "business-service.html"), "utf8");

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
}

function flatten(obj, prefix = "") {
  const out = {};
  if (obj == null) return out;
  if (typeof obj !== "object") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

function brHeadline(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function copyLang(dir) {
  return dir === "ko" ? "ko" : "en";
}

function tField(obj, lang, koKey, enKey) {
  if (!obj) return "";
  return lang === "ko" ? obj[koKey] || obj[enKey] || "" : obj[enKey] || obj[koKey] || "";
}

function hreflangBlock(subpath) {
  const rel = subpath ? `resources/${subpath}` : "resources";
  const lines = LANGS.map(
    ({ dir, hreflang }) =>
      `    <link rel="alternate" hreflang="${hreflang}" href="${SITE_ORIGIN}/${dir}/${rel}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/${rel}/" />`);
  return lines.join("\n");
}

function metaRefreshHtml(target, title = "Redirect") {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=${target}"/><link rel="canonical" href="${SITE_ORIGIN}${target}"/><title>${escapeHtml(title)}</title></head><body><p><a href="${target}">Continue</a></p></body></html>\n`;
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function pad3(n) {
  return String(n).padStart(3, "0");
}

function priceLabel(product, copy) {
  if (product.price === "FREE") return "FREE";
  if (product.price === "COMING SOON" || product.price == null) {
    return copy.comingSoon || "COMING SOON";
  }
  return String(product.price);
}

function shelfPrice(product, copy) {
  if (product.price === "FREE") return "FREE";
  if (product.price === "COMING SOON" || product.price == null) {
    return copy.comingSoon || "COMING SOON";
  }
  return copy.pricePlaceholder || "—";
}

/* ——— Shared chrome ——— */
function breadcrumb(copy, currentLabel, opts = {}) {
  return resourcesBreadcrumb(copy, currentLabel, opts, escapeHtml);
}

function resourceSwitcher(activeSlug, copies, base = "../") {
  const homeActive = activeSlug === "index";
  const homeHref = homeActive ? "#" : base === "" || base === "./" ? "./" : base;
  const homeLabel = escapeHtml(copies.index?.navLabel || copies.index?.switcherLabel || "RESOURCES");
  const home = `<a class="rs-switch__link${homeActive ? " is-active" : ""}" href="${homeHref}"${
    homeActive ? ' aria-current="page"' : ""
  }>${homeLabel}</a>`;
  const pages = RESOURCE_PAGES.filter((p) => p.primary !== false);
  const links = pages
    .map((p) => {
      const c = copies[p.slug];
      const label = escapeHtml(c?.navLabel || p.slug.toUpperCase());
      const cls = p.slug === activeSlug ? "rs-switch__link is-active" : "rs-switch__link";
      const href = p.slug === activeSlug ? "#" : `${base}${p.slug}/`;
      return `<a class="${cls}" href="${href}"${p.slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");
  return `<nav class="rs-switch" aria-label="Resources">
    <div class="rs-inner rs-switch__inner">
      <div class="rs-switch__track">${home}${links}</div>
    </div>
  </nav>`;
}

function exploreGrid(copies, base = "../", activeSlug = "", lang = "ko") {
  return buildRhExploreSection(copies, {
    base,
    activeSlug,
    escapeHtml,
    brHeadline,
    lang,
  });
}

function heroBlock(copy, opts = {}) {
  return resourcesHeroBlock(copy, { escapeHtml, brHeadline, ...opts });
}

function emptyState(title, lead) {
  if (!title) return "";
  return `<div class="rs-empty" data-rs-reveal>
    <p class="rs-empty__title">${escapeHtml(title)}</p>
    ${lead ? `<p class="rs-empty__lead">${escapeHtml(lead)}</p>` : ""}
  </div>`;
}

/* ——— Visuals ——— */
function visualShelf(products, copy, lang) {
  const rows = products
    .map((p, i) => {
      const title = escapeHtml(tField(p, lang, "titleKo", "titleEn"));
      const price = escapeHtml(shelfPrice(p, copy));
      return `<div class="rs-shelf__row">
        <span class="rs-shelf__id">PRODUCT ${pad3(i + 1)}</span>
        <span class="rs-shelf__name">${title}</span>
        <span class="rs-shelf__price">${price}</span>
      </div>`;
    })
    .join("");
  return `<div class="rs-visual rs-visual--shelf" aria-hidden="true">
    <p class="rs-visual__badge">${escapeHtml(copy.shelfTitle || "DIGITAL PRODUCT SHELF")}</p>
    <div class="rs-shelf">${rows}</div>
  </div>`;
}

function visualFilm(copy) {
  return `<div class="rs-visual rs-visual--film" aria-hidden="true">
    <div class="rs-film">
      <div class="rs-film__frame">
        <span class="rs-film__mark">NEWON</span>
        <span class="rs-film__label">${escapeHtml(copy.featuredFrame || "NEWON / PRODUCT FILM / 001")}</span>
        <span class="rs-film__play" aria-hidden="true"></span>
      </div>
    </div>
  </div>`;
}

function visualLabStatus(counts, copy) {
  const activeTesting = (counts.ACTIVE || 0) + (counts.TESTING || 0);
  return `<div class="rs-visual rs-visual--lab" aria-hidden="true">
    <div class="rs-labpanel">
      <div class="rs-labpanel__top">
        <p class="rs-labpanel__badge">${escapeHtml(copy.statusTitle || "LAB STATUS")}</p>
        <span class="rs-labpanel__live"><i></i> LIVE BOARD</span>
      </div>
      <div class="rs-labpanel__grid">
        <div class="rs-labpanel__cell">
          <span class="rs-labpanel__k">${escapeHtml(copy.activeLabel || "ACTIVE / TESTING")}</span>
          <strong class="rs-labpanel__v">${activeTesting}</strong>
        </div>
        <div class="rs-labpanel__cell">
          <span class="rs-labpanel__k">${escapeHtml(copy.researchLabel || "RESEARCH")}</span>
          <strong class="rs-labpanel__v">${counts.RESEARCH || 0}</strong>
        </div>
        <div class="rs-labpanel__cell">
          <span class="rs-labpanel__k">${escapeHtml(copy.archivedLabel || "ARCHIVED")}</span>
          <strong class="rs-labpanel__v">${counts.ARCHIVED || 0}</strong>
        </div>
        <div class="rs-labpanel__cell">
          <span class="rs-labpanel__k">${escapeHtml(copy.nextReleaseLabel || "NEXT RELEASE")}</span>
          <strong class="rs-labpanel__v">${escapeHtml(copy.nextReleaseValue || "TBA")}</strong>
        </div>
      </div>
      <p class="rs-labpanel__foot">BUILD · TEST · LEARN</p>
    </div>
  </div>`;
}

function visualPublication() {
  return `<div class="rs-visual rs-visual--pub" aria-hidden="true">
    <div class="rs-pub">
      <span class="rs-pub__rule"></span>
      <span class="rs-pub__line"></span>
      <span class="rs-pub__line rs-pub__line--short"></span>
      <span class="rs-pub__line"></span>
      <span class="rs-pub__meta">VOL. — / ESSAY</span>
    </div>
  </div>`;
}

function visualSubscribe() {
  return `<div class="rs-visual rs-visual--mail" aria-hidden="true">
    <div class="rs-mail">
      <span class="rs-mail__from">FROM · NEWON</span>
      <span class="rs-mail__subj">WEEKLY / PREVIEW</span>
      <span class="rs-mail__line"></span>
      <span class="rs-mail__line rs-mail__line--mid"></span>
      <span class="rs-mail__line rs-mail__line--short"></span>
    </div>
  </div>`;
}

function visualTopics() {
  return `<div class="rs-visual rs-visual--topics" aria-hidden="true">
    <div class="rs-topics-viz">
      <span>01 IDEA → MVP</span>
      <span>02 PRODUCT</span>
      <span>03 AI</span>
      <span>04 LAUNCH</span>
      <span>05 VALIDATE</span>
    </div>
  </div>`;
}

function visualInsights() {
  return `<div class="rs-visual rs-visual--pub" aria-hidden="true">
    <div class="rs-pub">
      <span class="rs-pub__rule"></span>
      <span class="rs-pub__line"></span>
      <span class="rs-pub__line rs-pub__line--short"></span>
      <span class="rs-pub__line"></span>
      <span class="rs-pub__meta">INSIGHTS · TECH · AI · MARKET</span>
    </div>
  </div>`;
}

/* ——— Hub bodies ——— */
function indexBody(copies, lang) {
  return buildResourcesIndexBody(copies, lang, {
    escapeHtml,
    brHeadline,
  });
}

function storeHubBody(copies, lang) {
  const copy = copies.store;
  const products = getStoreProducts();
  const filters = ["all", ...STORE_CATEGORIES]
    .map((cat) => {
      const label = escapeHtml(copy.filterLabels?.[cat] || cat.toUpperCase());
      return `<button type="button" class="rs-chip${cat === "all" ? " is-active" : ""}" data-rs-filter="${cat}">${label}</button>`;
    })
    .join("");

  const cards = products
    .map((p) => {
      const title = escapeHtml(tField(p, lang, "titleKo", "titleEn"));
      const desc = escapeHtml(tField(p, lang, "descKo", "descEn"));
      const price = escapeHtml(priceLabel(p, copy));
      const cat = normalizeStoreCategory(p.category || "");
      const collection = p.collection ? String(p.collection).toLowerCase() : "";
      const cats = [cat, collection, p.free ? "free" : ""].filter(Boolean).join(" ");
      return `<a class="rs-product" href="${p.slug}/" data-category="${escapeHtml(cats)}" data-collection="${escapeHtml(collection)}" data-analytics="store_product_view" data-item-id="${escapeHtml(p.slug)}" data-category-prop="${escapeHtml(cat)}" data-rs-reveal>
        <span class="rs-product__cat">${escapeHtml((cat || "").toUpperCase())}${collection ? ` · ${escapeHtml(collection.toUpperCase())}` : ""}</span>
        <span class="rs-product__title">${title}</span>
        <span class="rs-product__desc">${desc}</span>
        <span class="rs-product__price">${price}</span>
      </a>`;
    })
    .join("");

  return `${breadcrumb(copy, copy.navLabel || "STORE")}
${heroBlock(copy)}
${resourceSwitcher("store", copies)}
<section class="rs-section" id="rs-content" data-rs-reveal>
  <div class="rs-inner">
    <p class="rs-eyebrow">${escapeHtml(copy.catalogTitle || "PRODUCT CATALOG")}</p>
    <div class="rs-filters" data-rs-filters>${filters}</div>
    <div class="rs-product-grid" data-rs-filter-grid>${cards}</div>
    <p class="rs-filter-empty" data-rs-filter-empty hidden>${escapeHtml(copy.emptyTitle || "")}</p>
  </div>
</section>
${exploreGrid(copies, "../", "store", lang)}`;
}

function storeDetailBody(product, copies, lang) {
  return buildStoreDetailBody(product, copies, lang);
}

function renderStoreDetailHtml({
  htmlLang,
  ogLocale,
  canonical,
  hreflang,
  seoTitle,
  metaDescription,
  serviceSlug,
  analyticsId,
  body,
  flat,
  flatEn,
  chromeBase,
}) {
  let html = bsTemplate;
  html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  html = html.replace(/\{\{OG_LOCALE\}\}/g, ogLocale);
  html = html.replace(/\{\{CANONICAL\}\}/g, canonical);
  html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflang);
  html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(seoTitle || ""));
  html = html.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(metaDescription || ""));
  html = html.replace(/\{\{SERVICE_SLUG\}\}/g, escapeHtml(serviceSlug || ""));
  html = html.replace(/\{\{ANALYTICS_ID\}\}/g, escapeHtml(analyticsId || serviceSlug || ""));
  html = html.replace(/\{\{PAGE_BODY\}\}/g, body);
  html = injectSiteChrome(html, flat, flatEn, {
    activeNav: "resources",
    base: chromeBase,
  });
  html = html.replace(
    '<script src="/business-service.js',
    '<script src="/waitlist.js" defer></script>\n    <script src="/business-service.js'
  );
  return html;
}

function blogHubBody(copies, lang) {
  return buildBlogHubBody(copies, lang, {
    breadcrumb,
    resourceSwitcher,
    exploreGrid: (c, b, a) => exploreGrid(c, b, a, lang),
    heroBlock,
  });
}

function mediaHubBody(copies, lang) {
  return buildMediaHubBody(copies, lang, {});
}

function renderHtml({
  htmlLang,
  ogLocale,
  canonical,
  hreflang,
  seoTitle,
  metaDescription,
  hubSlug,
  analyticsId,
  body,
  flat,
  flatEn,
  chromeBase,
  activeNav = "resources",
  companySwitch = "",
}) {
  let html = template;
  html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  html = html.replace(/\{\{OG_LOCALE\}\}/g, ogLocale);
  html = html.replace(/\{\{CANONICAL\}\}/g, canonical);
  html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflang);
  html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(seoTitle || ""));
  html = html.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(metaDescription || ""));
  html = html.replace(/\{\{HUB_SLUG\}\}/g, hubSlug || "");
  html = html.replace(/\{\{ANALYTICS_ID\}\}/g, analyticsId || hubSlug || "");
  html = html.replace(/\{\{PAGE_BODY\}\}/g, body);
  html = injectSiteChrome(html, flat, flatEn, {
    activeNav,
    base: chromeBase,
    companySwitch,
  });
  return html;
}

function labsHubBody(copies, lang) {
  return buildLabsHubBody(copies, lang, {
    getLabsExperiments,
    getLabStatusCounts,
    breadcrumb,
    heroBlock,
    resourceSwitcher,
    brHeadline,
  });
}

function renderLabDetailHtml({
  htmlLang,
  ogLocale,
  canonical,
  hreflang,
  seoTitle,
  metaDescription,
  serviceSlug,
  analyticsId,
  body,
  flat,
  flatEn,
  chromeBase,
}) {
  let html = bsTemplate;
  html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  html = html.replace(/\{\{OG_LOCALE\}\}/g, ogLocale);
  html = html.replace(/\{\{CANONICAL\}\}/g, canonical);
  html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflang);
  html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(seoTitle || ""));
  html = html.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(metaDescription || ""));
  html = html.replace(/\{\{SERVICE_SLUG\}\}/g, escapeHtml(serviceSlug || ""));
  html = html.replace(/\{\{ANALYTICS_ID\}\}/g, escapeHtml(analyticsId || serviceSlug || ""));
  html = html.replace(/\{\{PAGE_BODY\}\}/g, body);
  html = html.replace(
    '<main id="bs-main" class="bs-page"',
    '<main id="bs-main" class="bs-page bs-page--lab" data-bs-lab="1"'
  );
  html = html.replace(
    '<link rel="stylesheet" href="/business-service.css',
    '<link rel="stylesheet" href="/labs-detail.css?v=20260828lx2" />\n    <link rel="stylesheet" href="/business-service.css'
  );
  html = injectSiteChrome(html, flat, flatEn, {
    activeNav: "resources",
    base: chromeBase,
  });
  html = html.replace(
    '<script src="/business-service.js',
    '<script src="/labs-detail.js?v=20260828lx2" defer></script>\n    <script src="/business-service.js'
  );
  return html;
}

function labDetailBody(exp, copies, lang) {
  void copies;
  return renderLabDetailBody(exp, lang);
}

function newsletterHubBody(copies, lang) {
  const copy = copies.newsletter;
  const issues = getNewsletterIssues();
  const getItems = (copy.getItems || [])
    .map(
      (it) => `<div class="rs-get__col" data-rs-reveal>
      <p class="rs-get__title">${escapeHtml(it.title)}</p>
      <p class="rs-get__body">${escapeHtml(it.body)}</p>
    </div>`
    )
    .join("");

  const archive =
    issues.length === 0
      ? emptyState(copy.emptyTitle || copy.archiveTitle, copy.emptyLead)
      : `<ol class="rs-build-log">${issues
          .map((iss) => {
            const date = iss.publishedAt || iss.date || "";
            const title = escapeHtml(lang === "ko" ? iss.titleKo || iss.title : iss.titleEn || iss.title);
            const cat = escapeHtml(String(iss.category || "build-log").toUpperCase());
            const excerpt = escapeHtml(lang === "ko" ? iss.excerptKo || iss.bodyKo || "" : iss.excerptEn || iss.bodyEn || "");
            const links = (iss.links || [])
              .map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`)
              .join("");
            return `<li class="rs-build-log__item" id="${escapeHtml(iss.slug || iss.id)}">
              <time class="rs-build-log__date" datetime="${escapeHtml(date)}">${escapeHtml(date.replace(/-/g, "."))}</time>
              <span class="rs-build-log__cat">${cat}</span>
              <h3 class="rs-build-log__title">${title}</h3>
              ${excerpt ? `<div class="rs-build-log__body">${excerpt.split("\n\n").map((p) => `<p>${p}</p>`).join("")}</div>` : ""}
              ${links ? `<div class="rs-build-log__links">${links}</div>` : ""}
            </li>`;
          })
          .join("")}</ol>`;

  return `${breadcrumb(copy, copy.navLabel || "NEWSLETTER")}
${heroBlock(copy)}
${resourceSwitcher("newsletter", copies)}
<section class="rs-section" id="rs-content">
  <div class="rs-inner rs-newsletter">
    <form class="rs-form rs-form--newsletter waitlist-form" data-waitlist-form data-form-type="newsletter" data-product-id="newsletter">
      <input type="hidden" name="productId" value="newsletter" />
      <div class="rs-form__row">
        <input type="email" name="email" placeholder="${escapeHtml(copy.formPlaceholder)}" required autocomplete="email" />
        <button type="submit" class="rs-btn rs-btn--primary">${escapeHtml(copy.ctaPrimary)}</button>
      </div>
      <input type="text" name="_honey" class="rs-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
    </form>
    <p class="rs-form__msg" data-waitlist-success hidden>${escapeHtml(copy.success)}</p>
    <p class="rs-form__msg" data-waitlist-duplicate hidden>${escapeHtml(copy.duplicate)}</p>
    <p class="rs-form__msg rs-form__msg--error" data-waitlist-error hidden role="alert">${escapeHtml(copy.error)}</p>
    <p class="rs-form__note">${escapeHtml(copy.formNote)}</p>
    <p class="rs-form__note"><a href="../../privacy/">${escapeHtml(copy.privacyNote)}</a></p>

    <p class="rs-eyebrow" style="margin-top:3rem">${escapeHtml(copy.getTitle)}</p>
    <div class="rs-get">${getItems}</div>

    <p class="rs-eyebrow" style="margin-top:3rem">${escapeHtml(copy.archiveTitle || "ARCHIVE")}</p>
    ${archive}
  </div>
</section>
${exploreGrid(copies, "../", "newsletter", lang)}`;
}

function educationHubBody(copies, lang) {
  const copy = copies.education;
  const tracks = [
    { id: "guides", title: copy.trackGuides || "FREE GUIDES" },
    { id: "courses", title: copy.trackCourses || "COURSES" },
    { id: "workshops", title: copy.trackWorkshops || "WORKSHOPS" },
  ];
  const topicsByTrack = tracks
    .map((track) => {
      const items = getEducationTopics().filter((t) => (t.track || "guides") === track.id);
      if (!items.length) return "";
      const rows = items
        .map((t, i) => {
          const title = escapeHtml(tField(t, lang, "titleKo", "titleEn"));
          const body = escapeHtml(tField(t, lang, "bodyKo", "bodyEn"));
          const soon = t.status === "coming_soon" ? `<span class="rs-badge rs-badge--inline">${escapeHtml(copy.badge || "COMING SOON")}</span>` : "";
          return `<article class="rs-topic" id="${escapeHtml(t.slug)}" data-rs-reveal>
        <span class="rs-topic__n">${pad3(i + 1)}</span>
        <div>
          <h3 class="rs-topic__title">${title} ${soon}</h3>
          <p class="rs-topic__body">${body}</p>
        </div>
      </article>`;
        })
        .join("");
      return `<section class="rs-edu-track" aria-labelledby="rs-edu-${track.id}"><h2 class="rs-title" id="rs-edu-${track.id}">${escapeHtml(track.title)}</h2><div class="rs-topics">${rows}</div></section>`;
    })
    .filter(Boolean)
    .join("");

  return `${breadcrumb(copy, copy.navLabel || "EDUCATION")}
${heroBlock(copy)}
${resourceSwitcher("education", copies)}
<section class="rs-section" id="rs-content">
  <div class="rs-inner">
    <p class="rs-badge">${escapeHtml(copy.badge || "COMING SOON")}</p>
    <div class="rs-edu-msg" data-rs-reveal>
      <h2 class="rs-title">${escapeHtml(copy.notCourseTitle)}</h2>
      <p class="rs-lead">${escapeHtml(copy.notCourseLead)}</p>
    </div>
    <p class="rs-eyebrow" style="margin-top:3rem">${escapeHtml(copy.topicsTitle)}</p>
    ${topicsByTrack}
    <div class="rs-notify" data-rs-reveal>
      <p class="rs-eyebrow">${escapeHtml(copy.notifyTitle)}</p>
      <p class="rs-lead">${escapeHtml(copy.notifyLead)}</p>
      <form class="rs-form waitlist-form" data-waitlist-form data-form-type="waitlist" data-product-id="education">
        <input type="hidden" name="productId" value="education" />
        <input type="hidden" name="interest" value="${escapeHtml(copy.interestHidden || "education")}" />
        <div class="rs-form__row">
          <input type="email" name="email" placeholder="${escapeHtml(copy.formPlaceholder)}" required autocomplete="email" />
          <button type="submit" class="rs-btn rs-btn--primary">${escapeHtml(copy.ctaPrimary)}</button>
        </div>
        <input type="text" name="_honey" class="rs-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      </form>
      <p class="rs-form__msg" data-waitlist-success hidden>${escapeHtml(copy.success)}</p>
      <p class="rs-form__msg" data-waitlist-duplicate hidden>${escapeHtml(copy.duplicate)}</p>
      <p class="rs-form__msg rs-form__msg--error" data-waitlist-error hidden role="alert">${escapeHtml(copy.error)}</p>
    </div>
  </div>
</section>
${exploreGrid(copies, "../", "education", lang)}`;
}

function insightsHubBody(copies, lang) {
  const copy = copies.insights;
  const published = getPublishedInsights();
  const filters = ["all", ...INSIGHT_CATEGORIES]
    .map((cat) => {
      const label = escapeHtml(copy.filterLabels?.[cat] || cat);
      return `<button type="button" class="rs-chip${cat === "all" ? " is-active" : ""}" data-rs-filter="${escapeHtml(cat)}">${label}</button>`;
    })
    .join("");

  let content = emptyState(copy.emptyTitle, copy.emptyLead);
  if (published.length) {
    content = published
      .map((a) => {
        const title = escapeHtml(tField(a, lang, "titleKo", "titleEn"));
        const desc = escapeHtml(tField(a, lang, "descKo", "descEn"));
        const cat = escapeHtml(a.category || "");
        const type = escapeHtml(copy.typeLabels?.[a.type] || a.type || "");
        return `<a class="rs-pub-row" href="${escapeHtml(a.slug)}/" data-category="${cat}" data-analytics="insight_view" data-item-id="${escapeHtml(a.slug)}" data-rs-reveal>
          <span class="rs-pub-row__cat">${cat} · ${type}</span>
          <span class="rs-pub-row__title">${title}</span>
          <span class="rs-pub-row__arrow" aria-hidden="true">→</span>
        </a>
        ${desc ? `<p class="rs-pub-row__desc">${desc}</p>` : ""}`;
      })
      .join("");
  }

  return `${breadcrumb(copy, copy.navLabel || "INSIGHTS")}
${heroBlock(copy)}
${resourceSwitcher("insights", copies)}
<section class="rs-section" id="rs-content">
  <div class="rs-inner">
    <p class="rs-eyebrow">${escapeHtml(copy.catalogTitle || "INSIGHT CATALOG")}</p>
    <div class="rs-filters" data-rs-filters>${filters}</div>
    <div data-rs-filter-grid>${content}</div>
    <p class="rs-filter-empty" data-rs-filter-empty hidden>${escapeHtml(copy.emptyTitle || "")}</p>
  </div>
</section>
${insightsResearchSection(copy, lang, { escapeHtml })}
${exploreGrid(copies, "../", "insights", lang)}`;
}

function insightSection(title, bodyHtml) {
  if (!bodyHtml) return "";
  return `<section class="rs-detail__block" data-rs-reveal>
    <h2 class="rs-title rs-title--sm">${escapeHtml(title)}</h2>
    <div class="rs-prose">${bodyHtml}</div>
  </section>`;
}

function insightDetailBody(article, copies, lang) {
  const copy = copies.insights;
  const title = tField(article, lang, "titleKo", "titleEn");
  const summary = tField(article, lang, "summaryKo", "summaryEn") || tField(article, lang, "descKo", "descEn");
  const findings = (lang === "ko" ? article.keyFindingsKo : article.keyFindingsEn) || [];
  const evidence = tField(article, lang, "evidenceKo", "evidenceEn");
  const meaning = tField(article, lang, "meaningKo", "meaningEn");
  const take = tField(article, lang, "newonTakeKo", "newonTakeEn");
  const findingsHtml = findings.length
    ? `<ul class="rs-includes">${findings.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
    : "";
  const related = getRelatedResources(
    { id: article.id, type: "insights", category: article.category, tags: [article.category, article.type] },
    lang,
    4
  );
  const published = article.publishedAt ? String(article.publishedAt).replace(/-/g, ".") : "—";

  return `${breadcrumb(copy, title, { resourcesHref: "../../", mid: copy.navLabel || "INSIGHTS", midHref: "../" })}
<article class="rs-detail" data-rs-reveal itemscope itemtype="https://schema.org/Article">
  <div class="rs-inner">
    <p class="rs-eyebrow">${escapeHtml(String(article.category || "").toUpperCase())} · ${escapeHtml(copy.typeLabels?.[article.type] || article.type || "")}</p>
    <h1 class="rs-hero__title" itemprop="headline">${escapeHtml(title)}</h1>
    ${resourceMetaRow({
      escapeHtml,
      items: [
        { label: lang === "ko" ? "발행일" : "PUBLISHED", value: published },
        { label: lang === "ko" ? "카테고리" : "CATEGORY", value: String(article.category || "").toUpperCase() },
        { label: lang === "ko" ? "유형" : "TYPE", value: copy.typeLabels?.[article.type] || article.type || "—" },
      ],
    })}
    ${insightSection(copy.detailSummary || (lang === "ko" ? "요약" : "SUMMARY"), summary ? `<p>${escapeHtml(summary)}</p>` : "")}
    ${insightSection(copy.detailFindings || (lang === "ko" ? "핵심 발견" : "KEY FINDINGS"), findingsHtml)}
    ${insightSection(copy.detailEvidence || (lang === "ko" ? "근거 · 관찰" : "EVIDENCE / OBSERVATIONS"), evidence ? `<p>${escapeHtml(evidence)}</p>` : "")}
    ${insightSection(copy.detailMeaning || (lang === "ko" ? "의미" : "WHAT IT MEANS"), meaning ? `<p>${escapeHtml(meaning)}</p>` : "")}
    ${insightSection(copy.detailTake || (lang === "ko" ? "Newon 관점" : "NEWON TAKE"), take ? `<p>${escapeHtml(take)}</p>` : "")}
    ${resourceShare({ escapeHtml, url: `${SITE_ORIGIN}/${lang === "ko" ? "ko" : "en"}/resources/insights/${article.slug}/`, title, copy: { shareLabel: lang === "ko" ? "공유" : "SHARE" } })}
  </div>
</article>
${resourceRelatedList({ escapeHtml, title: copy.relatedTitle || (lang === "ko" ? "관련 리소스" : "Related Resources"), items: related })}
${insightsResearchSection(copy, lang, { escapeHtml, pathPrefix: "../../../" })}
${jsonLdScript({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description: summary,
  datePublished: article.publishedAt || undefined,
  author: { "@type": "Organization", name: "Newon" },
})}
${exploreGrid(copies, "../../", "insights", lang)}
${resourceSwitcher("insights", copies, "../")}`;
}

function mediaDetailBody(item, copies, lang) {
  const copy = copies.media;
  const title = tField(item, lang, "titleKo", "titleEn");
  const desc = tField(item, lang, "descKo", "descEn");
  const body = tField(item, lang, "bodyKo", "bodyEn");
  const published = item.publishedAt || item.date ? String(item.publishedAt || item.date).replace(/-/g, ".") : "—";
  const related = getRelatedResources(
    { id: item.id, type: "media", category: item.category, tags: [item.category, "media"] },
    lang,
    4
  );
  const products = item.relatedProducts || [];

  return `${breadcrumb(copy, title, { resourcesHref: "../../", mid: copy.navLabel || "MEDIA", midHref: "../" })}
<article class="rs-detail" data-rs-reveal itemscope itemtype="https://schema.org/VideoObject">
  <div class="rs-inner rs-detail__grid">
    <div>
      <p class="rs-eyebrow">${escapeHtml(String(item.category || "").toUpperCase())}</p>
      <h1 class="rs-hero__title" itemprop="name">${escapeHtml(title)}</h1>
      ${resourceMetaRow({
        escapeHtml,
        items: [
          { label: lang === "ko" ? "발행일" : "PUBLISHED", value: published },
          { label: lang === "ko" ? "카테고리" : "CATEGORY", value: String(item.category || "").toUpperCase() },
          { label: lang === "ko" ? "형식" : "FORMAT", value: String(item.format || "video").toUpperCase() },
        ],
      })}
      <p class="rs-hero__lead" itemprop="description">${escapeHtml(desc)}</p>
      ${body ? `<div class="rs-prose">${body.split("\n\n").map((p) => `<p>${escapeHtml(p)}</p>`).join("")}</div>` : ""}
      ${resourceShare({ escapeHtml, url: `${SITE_ORIGIN}/${lang === "ko" ? "ko" : "en"}/resources/media/${item.slug}/`, title, copy: { shareLabel: lang === "ko" ? "공유" : "SHARE" } })}
    </div>
    <aside class="rs-detail__aside">
      <div class="rs-preview">
        <p class="rs-k">${escapeHtml(copy.featuredTitle || "PREVIEW")}</p>
        <div class="rs-preview__frame rs-preview__frame--media"><span>${escapeHtml(title)}</span></div>
      </div>
    </aside>
  </div>
</article>
${resourceRelatedProducts({ escapeHtml, title: copy.relatedProductsTitle || (lang === "ko" ? "관련 제품" : "Related Products"), products })}
${resourceRelatedList({ escapeHtml, title: copy.relatedTitle || (lang === "ko" ? "관련 리소스" : "Related Resources"), items: related })}
${jsonLdScript({
  "@context": "https://schema.org",
  "@type": item.format === "article" ? "Article" : "VideoObject",
  name: title,
  description: desc,
  uploadDate: item.publishedAt || item.date || undefined,
})}
${exploreGrid(copies, "../../", "media", lang)}
${resourceSwitcher("media", copies, "../")}`;
}

function hubBody(slug, copies, lang) {
  switch (slug) {
    case "store":
      return storeHubBody(copies, lang);
    case "insights":
      return insightsHubBody(copies, lang);
    case "blog":
      return blogHubBody(copies, lang);
    case "media":
      return mediaHubBody(copies, lang);
    case "labs":
      return labsHubBody(copies, lang);
    case "newsletter":
      return newsletterHubBody(copies, lang);
    case "education":
      return educationHubBody(copies, lang);
    default:
      return indexBody(copies, lang);
  }
}

function hreflangMedia() {
  const lines = LANGS.map(
    ({ dir, hreflang }) =>
      `    <link rel="alternate" hreflang="${hreflang}" href="${SITE_ORIGIN}/${dir}/media/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/media/" />`);
  return lines.join("\n");
}

function publishCopy(relPath) {
  const pub = path.join(ROOT, "_publish");
  if (!fs.existsSync(pub)) return;
  const src = path.join(ROOT, relPath);
  if (!fs.existsSync(src)) return;
  const dest = path.join(pub, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

export function renderResources() {
  const flatEn = flatten(loadJson("en.json"));

  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(loadJson(file));
    const lang = copyLang(dir);
    const copies = getAllResourceCopies(lang);

    // Index /{lang}/resources/
    {
      const copy = copies.index;
      const html = renderHtml({
        htmlLang,
        ogLocale: OG_LOCALE[dir] || "en_US",
        canonical: `${SITE_ORIGIN}/${dir}/resources/`,
        hreflang: hreflangBlock(""),
        seoTitle: copy.seoTitle,
        metaDescription: copy.metaDescription,
        hubSlug: "index",
        analyticsId: "resources_index",
        body: indexBody(copies, lang),
        flat,
        flatEn,
        chromeBase: "../",
      });
      writeFile(path.join(ROOT, dir, "resources", "index.html"), html);
    }

    // Hubs (Resources — Media lives under Company)
    for (const page of RESOURCE_PAGES) {
      if (page.slug === "media") continue;
      const copy = copies[page.slug];
      const html = renderHtml({
        htmlLang,
        ogLocale: OG_LOCALE[dir] || "en_US",
        canonical: `${SITE_ORIGIN}/${dir}/resources/${page.slug}/`,
        hreflang: hreflangBlock(page.slug),
        seoTitle: copy.seoTitle,
        metaDescription: copy.metaDescription,
        hubSlug: page.slug,
        analyticsId: page.slug,
        body: hubBody(page.slug, copies, lang),
        flat,
        flatEn,
        chromeBase: "../../",
      });
      writeFile(path.join(ROOT, dir, "resources", page.slug, "index.html"), html);
    }

    // Company Media hub — /{lang}/media/
    {
      const copy = copies.media;
      const html = renderHtml({
        htmlLang,
        ogLocale: OG_LOCALE[dir] || "en_US",
        canonical: `${SITE_ORIGIN}/${dir}/media/`,
        hreflang: hreflangMedia(),
        seoTitle: copy.seoTitle,
        metaDescription: copy.metaDescription,
        hubSlug: "media",
        analyticsId: "media",
        body: mediaHubBody(copies, lang),
        flat,
        flatEn,
        chromeBase: "../",
        activeNav: "company",
        companySwitch: "media",
      });
      writeFile(path.join(ROOT, dir, "media", "index.html"), html);

      // Legacy Resources Media → Company Media
      writeFile(
        path.join(ROOT, dir, "resources", "media", "index.html"),
        metaRefreshHtml(`/${dir}/media/`, "Redirect · Media")
      );
    }

    // Store details
    for (const product of getStoreProducts()) {
      const seo = storeDetailSeo(product, lang);
      const html = renderStoreDetailHtml({
        htmlLang,
        ogLocale: OG_LOCALE[dir] || "en_US",
        canonical: `${SITE_ORIGIN}/${dir}/resources/store/${product.slug}/`,
        hreflang: hreflangBlock(`store/${product.slug}`),
        seoTitle: seo.seoTitle,
        metaDescription: seo.metaDescription,
        serviceSlug: product.slug,
        analyticsId: `store_${product.slug}`,
        body: storeDetailBody(product, copies, lang),
        flat,
        flatEn,
        chromeBase: "../../../",
      });
      writeFile(path.join(ROOT, dir, "resources", "store", product.slug, "index.html"), html);
    }

    // Lab details
    for (const exp of getLabsExperiments()) {
      const title = tField(exp, lang, "titleKo", "titleEn");
      const desc = labDetailSeoDescription(exp, lang);
      const html = renderLabDetailHtml({
        htmlLang,
        ogLocale: OG_LOCALE[dir] || "en_US",
        canonical: `${SITE_ORIGIN}/${dir}/resources/labs/${exp.slug}/`,
        hreflang: hreflangBlock(`labs/${exp.slug}`),
        seoTitle: `${title} — Newon Labs | Newon`,
        metaDescription: desc,
        serviceSlug: exp.slug,
        analyticsId: `labs_${exp.slug}`,
        body: labDetailBody(exp, copies, lang),
        flat,
        flatEn,
        chromeBase: "../../../",
      });
      writeFile(path.join(ROOT, dir, "resources", "labs", exp.slug, "index.html"), html);
    }

    // Legacy lab slug redirects
    writeFile(
      path.join(ROOT, dir, "resources", "labs", "ai-service", "index.html"),
      metaRefreshHtml(`/${dir}/resources/labs/ai-experiment/`, "Redirect · AI Product Discovery")
    );

    // Insight details — published only
    for (const article of getPublishedInsights()) {
      const copy = copies.insights;
      const title = tField(article, lang, "titleKo", "titleEn");
      const desc = tField(article, lang, "descKo", "descEn");
      const html = renderHtml({
        htmlLang,
        ogLocale: OG_LOCALE[dir] || "en_US",
        canonical: `${SITE_ORIGIN}/${dir}/resources/insights/${article.slug}/`,
        hreflang: hreflangBlock(`insights/${article.slug}`),
        seoTitle: `${title} | Newon Insights`,
        metaDescription: desc,
        hubSlug: "insights",
        analyticsId: `insights_${article.slug}`,
        body: insightDetailBody(article, copies, lang),
        flat,
        flatEn,
        chromeBase: "../../../",
      });
      writeFile(path.join(ROOT, dir, "resources", "insights", article.slug, "index.html"), html);
    }

    // Media details — published only
    for (const item of getPublishedMediaItems()) {
      const title = tField(item, lang, "titleKo", "titleEn");
      const desc = tField(item, lang, "descKo", "descEn");
      const html = renderHtml({
        htmlLang,
        ogLocale: OG_LOCALE[dir] || "en_US",
        canonical: `${SITE_ORIGIN}/${dir}/resources/media/${item.slug}/`,
        hreflang: hreflangBlock(`media/${item.slug}`),
        seoTitle: `${title} | Newon Media`,
        metaDescription: desc,
        hubSlug: "media",
        analyticsId: `media_${item.slug}`,
        body: mediaDetailBody(item, copies, lang),
        flat,
        flatEn,
        chromeBase: "../../../",
      });
      writeFile(path.join(ROOT, dir, "resources", "media", item.slug, "index.html"), html);
    }

    // Blog details — only if posts exist
    for (const post of getPublishedBlogPosts()) {
      // reserved for future
      void post;
    }

    // Old flat hub redirects (media canonical is /{lang}/media/ — already written above)
    for (const slug of ["store", "blog", "labs"]) {
      writeFile(
        path.join(ROOT, dir, slug, "index.html"),
        metaRefreshHtml(`/${dir}/resources/${slug}/`, `Redirect · ${slug}`)
      );
    }

    // Old store product pages → new paths
    for (const product of getStoreProducts()) {
      writeFile(
        path.join(ROOT, dir, "store", product.slug, "index.html"),
        metaRefreshHtml(`/${dir}/resources/store/${product.slug}/`, `Redirect · ${product.slug}`)
      );
    }
  }

  // Root redirects
  writeFile(path.join(ROOT, "resources", "index.html"), metaRefreshHtml("/en/resources/", "Resources"));
  for (const page of RESOURCE_PAGES) {
    writeFile(
      path.join(ROOT, "resources", page.slug, "index.html"),
      metaRefreshHtml(`/en/resources/${page.slug}/`, page.slug)
    );
  }
  for (const slug of ["store", "blog", "labs"]) {
    writeFile(path.join(ROOT, slug, "index.html"), metaRefreshHtml(`/en/resources/${slug}/`, slug));
  }
  writeFile(path.join(ROOT, "media", "index.html"), metaRefreshHtml("/en/media/", "media"));
  writeFile(path.join(ROOT, "resources", "media", "index.html"), metaRefreshHtml("/en/media/", "media"));

  // Publish mirror
  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const { dir } of LANGS) {
      const srcRoot = path.join(ROOT, dir, "resources");
      if (!fs.existsSync(srcRoot)) continue;
      // recursive copy of resources tree
      const walk = (from, to) => {
        fs.mkdirSync(to, { recursive: true });
        for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
          const a = path.join(from, ent.name);
          const b = path.join(to, ent.name);
          if (ent.isDirectory()) walk(a, b);
          else fs.copyFileSync(a, b);
        }
      };
      walk(srcRoot, path.join(pub, dir, "resources"));

      // Company Media hub
      const mediaSrc = path.join(ROOT, dir, "media", "index.html");
      if (fs.existsSync(mediaSrc)) {
        writeFile(path.join(pub, dir, "media", "index.html"), fs.readFileSync(mediaSrc, "utf8"));
      }

      for (const slug of ["store", "blog", "labs"]) {
        const src = path.join(ROOT, dir, slug, "index.html");
        if (fs.existsSync(src)) {
          writeFile(path.join(pub, dir, slug, "index.html"), fs.readFileSync(src, "utf8"));
        }
      }
      for (const product of getStoreProducts()) {
        const src = path.join(ROOT, dir, "store", product.slug, "index.html");
        if (fs.existsSync(src)) {
          writeFile(path.join(pub, dir, "store", product.slug, "index.html"), fs.readFileSync(src, "utf8"));
        }
      }
    }
    for (const f of [
      "resources.css",
      "resources.js",
      "labs-detail.css",
      "labs-detail.js",
      "store-detail.css",
      "blog-hub.css",
      "media-hub.css",
      "media-hub.js",
      "business-service.css",
      "business-service.js",
      "business-type.css",
      "waitlist.js",
    ]) {
      const src = path.join(ROOT, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(pub, f));
    }
    const walkAssets = (from, to) => {
      fs.mkdirSync(to, { recursive: true });
      for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
        if (ent.name.startsWith("_")) continue;
        const a = path.join(from, ent.name);
        const b = path.join(to, ent.name);
        if (ent.isDirectory()) walkAssets(a, b);
        else fs.copyFileSync(a, b);
      }
    };
    for (const dir of ["media-thumbs", "blog-thumbs"]) {
      const srcDir = path.join(ROOT, dir);
      if (fs.existsSync(srcDir)) walkAssets(srcDir, path.join(pub, dir));
    }
    const rootRes = path.join(ROOT, "resources");
    if (fs.existsSync(rootRes)) {
      const walk = (from, to) => {
        fs.mkdirSync(to, { recursive: true });
        for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
          const a = path.join(from, ent.name);
          const b = path.join(to, ent.name);
          if (ent.isDirectory()) walk(a, b);
          else fs.copyFileSync(a, b);
        }
      };
      walk(rootRes, path.join(pub, "resources"));
    }
  }

  console.log(
    `render-resources: index + ${RESOURCE_PAGES.length} hubs × ${LANGS.length} langs; store ${getStoreProducts().length}; labs ${getLabsExperiments().length}`
  );
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("render-resources.mjs")) {
  renderResources();
}
