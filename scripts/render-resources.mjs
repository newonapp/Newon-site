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
  getFeaturedStoreProducts,
  getPublishedBlogPosts,
  getLabsExperiments,
  getLabStatusCounts,
  getNewsletterIssues,
  getEducationTopics,
  getPublishedMediaItems,
  MEDIA_SERIES,
  buildSearchIndex,
  STORE_CATEGORIES,
} from "./resources-data.mjs";
import { labDetailBody as buildLabDetailBody } from "./lab-detail-bodies.mjs";
import { buildLabsHubBody } from "./labs-hub.mjs";
import { buildResourcesIndexBody } from "./resources-index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const template = fs.readFileSync(path.join(ROOT, "templates", "resource.html"), "utf8");

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
  const resourcesHref = opts.resourcesHref || "../";
  const mid = opts.mid
    ? `<span class="rs-crumb__sep" aria-hidden="true">/</span><a href="${opts.midHref}">${escapeHtml(opts.mid)}</a>`
    : "";
  return `<nav class="rs-crumb" aria-label="Breadcrumb">
    <div class="rs-inner">
      <a href="${resourcesHref}">${escapeHtml(copy.crumbResources || "RESOURCES")}</a>
      ${mid}
      <span class="rs-crumb__sep" aria-hidden="true">/</span>
      <span>${escapeHtml(currentLabel)}</span>
    </div>
  </nav>`;
}

function resourceSwitcher(activeSlug, copies, base = "../") {
  const homeActive = activeSlug === "index";
  const homeHref = homeActive ? "#" : base === "" || base === "./" ? "./" : base;
  const homeLabel = escapeHtml(copies.index?.navLabel || copies.index?.switcherLabel || "RESOURCES");
  const home = `<a class="rs-switch__link${homeActive ? " is-active" : ""}" href="${homeHref}"${
    homeActive ? ' aria-current="page"' : ""
  }>${homeLabel}</a>`;
  const links = RESOURCE_PAGES.map((p) => {
    const c = copies[p.slug];
    const label = escapeHtml(c?.navLabel || p.slug.toUpperCase());
    const cls = p.slug === activeSlug ? "rs-switch__link is-active" : "rs-switch__link";
    const href = p.slug === activeSlug ? "#" : `${base}${p.slug}/`;
    return `<a class="${cls}" href="${href}"${p.slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");
  return `<nav class="rs-switch" aria-label="Resources">
    <div class="rs-inner rs-switch__inner">
      <div class="rs-switch__track">${home}${links}</div>
    </div>
  </nav>`;
}

function exploreGrid(copies, base = "../", activeSlug = "") {
  const title = escapeHtml(copies.index?.exploreTitle || copies.store?.exploreTitle || "EXPLORE RESOURCES");
  const indexLabel = escapeHtml(copies.index?.exploreIndexLabel || "INDEX");
  const total = String(RESOURCE_PAGES.length).padStart(2, "0");
  const items = RESOURCE_PAGES.map((p, i) => {
    const c = copies[p.slug];
    const item = copies.index?.indexItems?.[p.slug];
    const name = escapeHtml(item?.title || c?.navLabel || p.slug.toUpperCase());
    const desc = escapeHtml(item?.desc || c?.lead || "");
    const idx = String(i + 1).padStart(2, "0");
    const current = activeSlug && activeSlug === p.slug;
    const cls = current ? "rs-explore__item is-current" : "rs-explore__item";
    const href = current ? "#" : `${base}${p.slug}/`;
    const aria = current ? ' aria-current="page"' : "";
    return `<a class="${cls}" href="${href}" data-rs-explore="${escapeHtml(p.slug)}"${aria}>
      <span class="rs-explore__top">
        <span class="rs-explore__idx" aria-hidden="true">${idx}</span>
        <span class="rs-explore__arrow" aria-hidden="true">→</span>
      </span>
      <span class="rs-explore__name">${name}</span>
      <span class="rs-explore__desc">${desc}</span>
      <span class="rs-explore__motif" aria-hidden="true"></span>
    </a>`;
  }).join("");
  return `<section class="rs-section rs-explore" data-rs-reveal aria-labelledby="rs-explore-title">
    <div class="rs-inner">
      <header class="rs-explore__head">
        <p class="rs-eyebrow" id="rs-explore-title">${title}</p>
        <p class="rs-explore__count"><span class="rs-explore__count-label">${indexLabel}</span><span class="rs-explore__count-n">${total}</span></p>
      </header>
      <div class="rs-explore__grid">${items}</div>
    </div>
  </section>`;
}

function heroBlock(copy, visualHtml = "") {
  return `<section class="rs-hero" data-rs-reveal aria-labelledby="rs-hero-title">
    <div class="rs-inner rs-hero__grid${visualHtml ? "" : " rs-hero__grid--solo"}">
      <div class="rs-hero__copy">
        <p class="rs-eyebrow">${escapeHtml(copy.eyebrow || "")}${
    copy.subEyebrow
      ? `<span class="rs-eyebrow__sep" aria-hidden="true">·</span><span class="rs-eyebrow__sub">${escapeHtml(copy.subEyebrow)}</span>`
      : ""
  }</p>
        <h1 class="rs-hero__title" id="rs-hero-title">${brHeadline(copy.headline)}</h1>
        <p class="rs-hero__lead">${escapeHtml(copy.lead || "")}</p>
        ${
          copy.ctaPrimary
            ? `<div class="rs-hero__actions"><a class="rs-btn rs-btn--primary" href="#rs-content">${escapeHtml(copy.ctaPrimary)}</a></div>`
            : ""
        }
      </div>
      ${visualHtml ? `<div class="rs-hero__visual">${visualHtml}</div>` : ""}
    </div>
  </section>`;
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

/* ——— Hub bodies ——— */
function indexBody(copies, lang) {
  return buildResourcesIndexBody(copies, lang, {
    escapeHtml,
    brHeadline,
    resourceSwitcher,
    tField,
  });
}

function storeHubBody(copies, lang) {
  const copy = copies.store;
  const products = getStoreProducts();
  const shelf = getFeaturedStoreProducts(3);
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
      const cat = escapeHtml(p.category || "");
      return `<a class="rs-product" href="${p.slug}/" data-category="${cat}" data-rs-reveal>
        <span class="rs-product__cat">${cat.toUpperCase()}</span>
        <span class="rs-product__title">${title}</span>
        <span class="rs-product__desc">${desc}</span>
        <span class="rs-product__price">${price}</span>
      </a>`;
    })
    .join("");

  return `${breadcrumb(copy, copy.navLabel || "STORE")}
${heroBlock(copy, visualShelf(shelf, copy, lang))}
${resourceSwitcher("store", copies)}
<section class="rs-section" id="rs-content" data-rs-reveal>
  <div class="rs-inner">
    <p class="rs-eyebrow">${escapeHtml(copy.catalogTitle || "PRODUCT CATALOG")}</p>
    <div class="rs-filters" data-rs-filters>${filters}</div>
    <div class="rs-product-grid" data-rs-filter-grid>${cards}</div>
    <p class="rs-filter-empty" data-rs-filter-empty hidden>${escapeHtml(copy.emptyTitle || "")}</p>
  </div>
</section>
${exploreGrid(copies, "../", "store")}`;
}

function storeDetailBody(product, copies, lang) {
  const copy = copies.store;
  const title = tField(product, lang, "titleKo", "titleEn");
  const desc = tField(product, lang, "descKo", "descEn");
  const audience = tField(product, lang, "audienceKo", "audienceEn");
  const includes = (lang === "ko" ? product.includesKo : product.includesEn) || [];
  const price = priceLabel(product, copy);
  const includesHtml = includes.map((x) => `<li>${escapeHtml(x)}</li>`).join("");

  const waitlist = `<form class="rs-form waitlist-form" data-waitlist-form data-form-type="waitlist" data-product-id="${escapeHtml(product.slug)}">
    <input type="hidden" name="productId" value="${escapeHtml(product.slug)}" />
    <input type="email" name="email" placeholder="email@example.com" required autocomplete="email" />
    <input type="text" name="_honey" class="rs-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
    <button type="submit" class="rs-btn rs-btn--primary">${escapeHtml(copy.waitlistCta)}</button>
  </form>
  <p class="rs-form__msg" data-waitlist-success hidden>${escapeHtml(copy.waitlistSuccess)}</p>
  <p class="rs-form__msg" data-waitlist-duplicate hidden>${escapeHtml(copy.waitlistDuplicate)}</p>
  <p class="rs-form__msg rs-form__msg--error" data-waitlist-error hidden role="alert">${escapeHtml(copy.waitlistError)}</p>
  <p class="rs-form__note">${escapeHtml(copy.waitlistNote)}</p>
  <p class="rs-form__alt"><a href="../../business/#inquiry">${escapeHtml(copy.inquiryCta)}</a></p>`;

  return `${breadcrumb(copy, title, { resourcesHref: "../../", mid: copy.navLabel || "STORE", midHref: "../" })}
<article class="rs-detail" data-rs-reveal>
  <div class="rs-inner rs-detail__grid">
    <div>
      <p class="rs-eyebrow">${escapeHtml((product.category || "").toUpperCase())}</p>
      <h1 class="rs-hero__title">${escapeHtml(title)}</h1>
      <p class="rs-price">${escapeHtml(price)}</p>
      <p class="rs-hero__lead">${escapeHtml(desc)}</p>
      <div class="rs-detail__meta">
        <div><span class="rs-k">${escapeHtml(copy.versionLabel)}</span><strong>${escapeHtml(product.version || "—")}</strong></div>
        <div><span class="rs-k">${escapeHtml(copy.updatedLabel)}</span><strong>${escapeHtml(product.updated || "—")}</strong></div>
      </div>
      ${waitlist}
    </div>
    <aside class="rs-detail__aside">
      <div class="rs-preview">
        <p class="rs-k">${escapeHtml(copy.previewLabel)}</p>
        <div class="rs-preview__frame"><span>${escapeHtml(title)}</span></div>
      </div>
      <div class="rs-detail__block">
        <p class="rs-k">${escapeHtml(copy.audienceLabel)}</p>
        <p>${escapeHtml(audience)}</p>
      </div>
      <div class="rs-detail__block">
        <p class="rs-k">${escapeHtml(copy.includesLabel)}</p>
        <ul class="rs-includes">${includesHtml}</ul>
      </div>
    </aside>
  </div>
</article>
${exploreGrid(copies, "../../", "store")}
${resourceSwitcher("store", copies, "../")}`;
}

function blogHubBody(copies, lang) {
  const copy = copies.blog;
  const posts = getPublishedBlogPosts();
  const filters = Object.entries(copy.filterLabels || { all: "ALL" })
    .map(
      ([k, v]) =>
        `<button type="button" class="rs-chip${k === "all" ? " is-active" : ""}" data-rs-filter="${escapeHtml(k)}">${escapeHtml(v)}</button>`
    )
    .join("");

  let content = emptyState(copy.emptyTitle, copy.emptyLead);
  if (posts.length) {
    const featured = posts.find((p) => p.featured) || posts[0];
    const latest = posts[0];
    const index = posts
      .map((p) => {
        const title = escapeHtml(tField(p, lang, "titleKo", "titleEn"));
        const cat = escapeHtml(p.category || "");
        return `<a class="rs-pub-row" href="${p.slug}/" data-category="${cat}" data-rs-reveal>
          <span class="rs-pub-row__cat">${cat}</span>
          <span class="rs-pub-row__title">${title}</span>
          <span class="rs-pub-row__arrow" aria-hidden="true">→</span>
        </a>`;
      })
      .join("");
    content = `
      ${
        featured
          ? `<div class="rs-featured" data-rs-reveal><p class="rs-eyebrow">${escapeHtml(copy.featuredTitle)}</p>
        <a class="rs-featured__link" href="${featured.slug}/"><h2 class="rs-featured__title">${escapeHtml(tField(featured, lang, "titleKo", "titleEn"))}</h2>
        <p>${escapeHtml(tField(featured, lang, "descKo", "descEn"))}</p></a></div>`
          : ""
      }
      ${
        latest
          ? `<div class="rs-latest" data-rs-reveal><p class="rs-eyebrow">${escapeHtml(copy.latestTitle)}</p>
        <a href="${latest.slug}/">${escapeHtml(tField(latest, lang, "titleKo", "titleEn"))} →</a></div>`
          : ""
      }
      <p class="rs-eyebrow">${escapeHtml(copy.indexTitle)}</p>
      <div class="rs-filters" data-rs-filters>${filters}</div>
      <div class="rs-pub-index" data-rs-filter-grid>${index}</div>`;
  }

  return `${breadcrumb(copy, copy.navLabel || "BLOG")}
${heroBlock(copy, visualPublication())}
${resourceSwitcher("blog", copies)}
<section class="rs-section" id="rs-content">
  <div class="rs-inner">${content}</div>
</section>
${exploreGrid(copies, "../", "blog")}`;
}

function mediaHubBody(copies, lang) {
  const copy = copies.media;
  const items = getPublishedMediaItems();
  const filters = Object.entries(copy.filterLabels || { all: "ALL" })
    .map(
      ([k, v]) =>
        `<button type="button" class="rs-chip${k === "all" ? " is-active" : ""}" data-rs-filter="${escapeHtml(k)}">${escapeHtml(v)}</button>`
    )
    .join("");

  const series = MEDIA_SERIES.map(
    (s) => `<div class="rs-series__item"><span class="rs-series__label">${escapeHtml(s.label)}</span><span class="rs-series__state">${escapeHtml(copy.comingSoon)}</span></div>`
  ).join("");

  let indexHtml = emptyState(copy.emptyTitle, copy.emptyLead);
  if (items.length) {
    indexHtml = items
      .map((m) => {
        const title = escapeHtml(tField(m, lang, "titleKo", "titleEn"));
        return `<a class="rs-media-row" href="${m.slug}/" data-category="${escapeHtml(m.category || "")}" data-rs-reveal>
          <span class="rs-media-row__title">${title}</span>
          <span class="rs-media-row__arrow">→</span>
        </a>`;
      })
      .join("");
  }

  return `${breadcrumb(copy, copy.navLabel || "MEDIA")}
${heroBlock(copy, visualFilm(copy))}
${resourceSwitcher("media", copies)}
<section class="rs-section" id="rs-content">
  <div class="rs-inner">
    <p class="rs-eyebrow">${escapeHtml(copy.featuredTitle)}</p>
    <div class="rs-film rs-film--wide" data-rs-reveal aria-hidden="true">
      <div class="rs-film__frame rs-film__frame--lg">
        <span class="rs-film__label">${escapeHtml(copy.featuredFrame)}</span>
        <span class="rs-film__play"></span>
      </div>
    </div>
    <div class="rs-filters" data-rs-filters>${filters}</div>
    <p class="rs-eyebrow" style="margin-top:2.5rem">${escapeHtml(copy.indexTitle)}</p>
    <div data-rs-filter-grid>${indexHtml}</div>
    <p class="rs-eyebrow" style="margin-top:2.5rem">${escapeHtml(copy.seriesTitle)}</p>
    <div class="rs-series">${series}</div>
  </div>
</section>
${exploreGrid(copies, "../", "media")}`;
}

function labsHubBody(copies, lang) {
  return buildLabsHubBody(copies, lang, {
    getLabsExperiments,
    getLabStatusCounts,
    breadcrumb,
    heroBlock,
    resourceSwitcher,
    exploreGrid: (c, b = "../") => exploreGrid(c, b, "labs"),
    brHeadline,
  });
}

function labDetailBody(exp, copies, lang) {
  return buildLabDetailBody(exp, copies, lang, {
    breadcrumb,
    exploreGrid: (c, b = "../../") => exploreGrid(c, b, "labs"),
    resourceSwitcher,
  });
}

function newsletterHubBody(copies) {
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
      : issues
          .map((iss) => `<div class="rs-archive-row"><span>${escapeHtml(iss.title || iss.id)}</span></div>`)
          .join("");

  return `${breadcrumb(copy, copy.navLabel || "NEWSLETTER")}
${heroBlock(copy, visualSubscribe())}
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
${exploreGrid(copies, "../", "newsletter")}`;
}

function educationHubBody(copies, lang) {
  const copy = copies.education;
  const topics = getEducationTopics()
    .map((t, i) => {
      const title = escapeHtml(tField(t, lang, "titleKo", "titleEn"));
      const body = escapeHtml(tField(t, lang, "bodyKo", "bodyEn"));
      return `<article class="rs-topic" id="${escapeHtml(t.slug)}" data-rs-reveal>
        <span class="rs-topic__n">${pad3(i + 1)}</span>
        <div>
          <h3 class="rs-topic__title">${title}</h3>
          <p class="rs-topic__body">${body}</p>
        </div>
      </article>`;
    })
    .join("");

  return `${breadcrumb(copy, copy.navLabel || "EDUCATION")}
${heroBlock(
  {
    ...copy,
    ctaPrimary: copy.ctaPrimary,
  },
  visualTopics()
)}
${resourceSwitcher("education", copies)}
<section class="rs-section" id="rs-content">
  <div class="rs-inner">
    <p class="rs-badge">${escapeHtml(copy.badge || "COMING SOON")}</p>
    <div class="rs-edu-msg" data-rs-reveal>
      <h2 class="rs-title">${escapeHtml(copy.notCourseTitle)}</h2>
      <p class="rs-lead">${escapeHtml(copy.notCourseLead)}</p>
    </div>
    <p class="rs-eyebrow" style="margin-top:3rem">${escapeHtml(copy.topicsTitle)}</p>
    <div class="rs-topics">${topics}</div>
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
${exploreGrid(copies, "../", "education")}`;
}

function hubBody(slug, copies, lang) {
  switch (slug) {
    case "store":
      return storeHubBody(copies, lang);
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

function renderHtml({ htmlLang, ogLocale, canonical, hreflang, seoTitle, metaDescription, hubSlug, analyticsId, body, flat, flatEn, chromeBase }) {
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
  html = injectSiteChrome(html, flat, flatEn, { activeNav: "resources", base: chromeBase });
  return html;
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

    // Hubs
    for (const page of RESOURCE_PAGES) {
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

    // Store details
    for (const product of getStoreProducts()) {
      const copy = copies.store;
      const title = tField(product, lang, "titleKo", "titleEn");
      const desc = tField(product, lang, "descKo", "descEn");
      const html = renderHtml({
        htmlLang,
        ogLocale: OG_LOCALE[dir] || "en_US",
        canonical: `${SITE_ORIGIN}/${dir}/resources/store/${product.slug}/`,
        hreflang: hreflangBlock(`store/${product.slug}`),
        seoTitle: `${title} | Newon Store`,
        metaDescription: desc,
        hubSlug: "store",
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
      const desc = tField(exp, lang, "descKo", "descEn");
      const html = renderHtml({
        htmlLang,
        ogLocale: OG_LOCALE[dir] || "en_US",
        canonical: `${SITE_ORIGIN}/${dir}/resources/labs/${exp.slug}/`,
        hreflang: hreflangBlock(`labs/${exp.slug}`),
        seoTitle: `${title} | Newon Labs`,
        metaDescription: desc,
        hubSlug: "labs",
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

    // Blog details — only if posts exist
    for (const post of getPublishedBlogPosts()) {
      // reserved for future
      void post;
    }

    // Old flat hub redirects (keep news alone)
    for (const slug of ["store", "blog", "media", "labs"]) {
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
  for (const slug of ["store", "blog", "media", "labs"]) {
    writeFile(path.join(ROOT, slug, "index.html"), metaRefreshHtml(`/en/resources/${slug}/`, slug));
  }

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

      for (const slug of ["store", "blog", "media", "labs"]) {
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
    for (const f of ["resources.css", "resources.js", "labs-detail.css", "labs-detail.js"]) {
      const src = path.join(ROOT, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(pub, f));
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
