/**
 * Store product detail body — Business service design system (bs-*), matching Studio detail pages.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getStoreProducts } from "./resources-data.mjs";
import { getStoreDetail, getStoreDetailUi } from "./store-detail-copy.mjs";
import { storeHeroVisual, storeLargePreview } from "./store-bs-visuals.mjs";

const STORE_NAV_LABELS = {
  "app-launch-kit": "LAUNCH",
  "mvp-planning-kit": "MVP",
  "cursor-prompt-pack": "CURSOR",
  "codex-builder-pack": "CODEX",
  "website-launch-checklist": "WEB",
  "business-planning-workbook": "BIZ PLAN",
  "product-research-template": "RESEARCH",
  "founder-dashboard": "DASHBOARD",
  "product-roadmap": "ROADMAP",
};

const PREVIEW_NAMES = {
  "app-launch-kit": { ko: "Launch Command Center", en: "Launch Command Center" },
  "mvp-planning-kit": { ko: "Product Planning Canvas", en: "Product Planning Canvas" },
  "cursor-prompt-pack": { ko: "Prompt Workspace", en: "Prompt Workspace" },
  "codex-builder-pack": { ko: "Agent Execution Console", en: "Agent Execution Console" },
  "website-launch-checklist": { ko: "QA Checklist", en: "QA Checklist" },
  "business-planning-workbook": { ko: "Business Workbook", en: "Business Workbook" },
  "product-research-template": { ko: "Research Evidence Board", en: "Research Evidence Board" },
  "founder-dashboard": { ko: "Founder Operating Dashboard", en: "Founder Operating Dashboard" },
  "product-roadmap": { ko: "Strategy Roadmap", en: "Strategy Roadmap" },
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function brHeadline(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function pick(detail, lang, koKey, enKey) {
  return lang === "ko" ? detail[koKey] || detail[enKey] || "" : detail[enKey] || detail[koKey] || "";
}

function productTitle(product, lang) {
  return lang === "ko" ? product.titleKo || product.titleEn : product.titleEn || product.titleKo;
}

function statusLabel(product, ui) {
  return product.status === "concept" ? ui.inDevBadge : ui.comingSoonBadge;
}

function previewName(slug, lang) {
  const names = PREVIEW_NAMES[slug];
  if (!names) return lang === "ko" ? "Product Preview" : "Product Preview";
  return lang === "ko" ? names.ko : names.en;
}

function howToSteps(detail, lang) {
  const steps = (lang === "ko" ? detail.howToKo : detail.howToEn) || detail.howToEn || detail.howToKo || [];
  return steps;
}

function breadcrumb(ui, title) {
  const resources = escapeHtml(ui.crumbResources || "RESOURCES");
  const store = escapeHtml(ui.crumbStore || "STORE");
  const current = escapeHtml(title);
  return `<nav class="bs-crumb" aria-label="Breadcrumb">
    <div class="bs-inner">
      <a href="../../">${resources}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <a href="../">${store}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <span>${current}</span>
    </div>
  </nav>`;
}

function productNav(currentSlug) {
  const products = getStoreProducts();
  const links = products
    .map((p) => {
      const label = escapeHtml(STORE_NAV_LABELS[p.slug] || String(p.category || "").toUpperCase());
      const isActive = p.slug === currentSlug;
      const cls = isActive ? "bs-nav__link is-active" : "bs-nav__link";
      const href = isActive ? "#" : `../${p.slug}/`;
      return `<a class="${cls}" href="${href}"${isActive ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");
  return `<nav class="bs-nav" aria-label="Store products"><div class="bs-inner bs-nav__inner"><p class="bs-nav__label">PRODUCTS</p><div class="bs-nav__track">${links}</div></div></nav>`;
}

function heroSection(product, detail, lang, ui) {
  const sub = escapeHtml(detail.categoryEyebrow || "");
  const eyebrow = sub
    ? `NEWON STORE <span class="bs-eyebrow__sep" aria-hidden="true">·</span> <span class="bs-eyebrow__sub">${sub}</span>`
    : "NEWON STORE";
  const subtitle = pick(detail, lang, "subtitleKo", "subtitleEn");
  const description = pick(detail, lang, "descriptionKo", "descriptionEn");
  const badge = escapeHtml(statusLabel(product, ui));

  return `<section class="bs-hero" data-bs-reveal aria-labelledby="bs-hero-title">
  <div class="bs-inner bs-hero__grid">
    <div>
      <p class="bs-eyebrow">${eyebrow}</p>
      <p class="bs-store-badge">${badge}</p>
      <h1 class="bs-hero__title" id="bs-hero-title">${escapeHtml(detail.title)}</h1>
      ${subtitle ? `<p class="bs-hero__lead">${escapeHtml(subtitle)}</p>` : ""}
      <p class="bs-hero__lead">${escapeHtml(description)}</p>
      <div class="bs-hero__actions">
        <a class="bs-btn bs-btn--primary" href="#bs-ss-preview-title" data-bs-cta="hero_primary">${escapeHtml(ui.heroPreviewCta)}</a>
        <a class="bs-btn bs-btn--ghost" href="#bs-ss-included-title" data-bs-cta="hero_secondary">${escapeHtml(ui.heroIncludesCta)}</a>
      </div>
    </div>
    ${storeHeroVisual(product.slug, detail.preview, lang)}
  </div>
</section>`;
}

function snapshotSection(product, detail, lang, ui) {
  const includes = (lang === "ko" ? detail.includesKo : detail.includesEn) || [];
  const format = (lang === "ko" ? detail.formatKo : detail.formatEn) || [];
  const who = (lang === "ko" ? detail.whoKo : detail.whoEn) || [];
  const cells = [
    { k: ui.includesLabel, v: includes.length ? `${includes.length} modules` : "—" },
    { k: ui.formatLabel, v: format.slice(0, 3).join(" · ") || "—" },
    { k: ui.forLabel, v: who.slice(0, 2).join(" · ") || "—" },
    { k: ui.statusLabel, v: statusLabel(product, ui) },
  ];
  const grid = cells
    .map(
      (c) =>
        `<article class="bs-store-snap__cell"><p class="bs-store-snap__k">${escapeHtml(c.k)}</p><p class="bs-store-snap__v">${escapeHtml(c.v)}</p></article>`
    )
    .join("");
  return `<section class="bs-section bs-section--surface bs-store-snap" data-bs-reveal aria-labelledby="bs-ss-snap-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.snapshotEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-snap-title">${escapeHtml(ui.snapshotTitle)}</h2>
      <div class="bs-store-snap__grid">${grid}</div>
    </div></section>`;
}

function overviewSection(product, detail, lang, ui) {
  const description = pick(detail, lang, "descriptionKo", "descriptionEn");
  const kicker = pick(detail, lang, "heroKickerKo", "heroKickerEn");
  const overviewTitle = kicker || ui.overviewTitle;
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-overview-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.overviewEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-overview-title">${brHeadline(overviewTitle)}</h2>
      <div class="bs-overview"><p class="bs-lead">${escapeHtml(description)}</p></div>
    </div></section>`;
}

function includesSection(detail, lang, ui) {
  const includes = (lang === "ko" ? detail.includesKo : detail.includesEn) || [];
  if (!includes.length) return "";
  const grid = `<div class="bs-get bs-get--deliver" data-count="${includes.length}" data-variant="deliver">${includes
    .map((it, i) => {
      const n = it.n || pad2(i + 1);
      return `<article class="bs-get__item"><span class="bs-get__n" aria-hidden="true">${escapeHtml(String(n))}</span><div class="bs-get__copy"><h3>${escapeHtml(
        it.title
      )}</h3><p>${escapeHtml(it.body)}</p></div></article>`;
    })
    .join("")}</div>`;
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-included-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.includesEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-included-title">${escapeHtml(ui.includesTitle)}</h2>
      ${grid}
    </div></section>`;
}

function previewSection(product, detail, lang, ui) {
  const name = previewName(product.slug, lang);
  return `<section class="bs-section bs-store-preview-sec" data-bs-reveal aria-labelledby="bs-ss-preview-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.previewEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-preview-title">${escapeHtml(name)}</h2>
      <p class="bs-note bs-store-preview-sec__note">${escapeHtml(ui.previewNote)}</p>
      ${storeLargePreview(product.slug, detail.preview, lang, name)}
    </div></section>`;
}

function howToSection(detail, lang, ui) {
  const steps = howToSteps(detail, lang);
  if (!steps.length) return "";
  const list = `<ol class="bs-process bs-process--steps" data-count="${steps.length}">${steps
    .map(
      (s, i) =>
        `<li class="bs-process__item"><span class="bs-process__n" aria-hidden="true">${escapeHtml(s.n || pad2(i + 1))}</span><div class="bs-process__copy"><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.body)}</p></div></li>`
    )
    .join("")}</ol>`;
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-how-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.howToEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-how-title">${escapeHtml(ui.howToTitle)}</h2>
      ${list}
    </div></section>`;
}

function tagChips(items) {
  if (!items?.length) return "";
  return `<ul class="bs-chips">${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
}

function whoSection(detail, lang, ui) {
  const who = (lang === "ko" ? detail.whoKo : detail.whoEn) || [];
  if (!who.length) return "";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-who-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.whoEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-who-title">${escapeHtml(ui.whoTitle)}</h2>
      <ol class="bs-who">${who
        .map(
          (t, i) =>
            `<li class="bs-who__item"><span class="bs-who__n">${pad2(i + 1)}</span><p class="bs-who__t">${escapeHtml(t)}</p></li>`
        )
        .join("")}</ol>
    </div></section>`;
}

function formatSection(detail, lang, ui) {
  const format = (lang === "ko" ? detail.formatKo : detail.formatEn) || [];
  if (!format.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-format-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.formatEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-format-title">${escapeHtml(ui.formatTitle)}</h2>
      ${tagChips(format)}
    </div></section>`;
}

function finalSection(product, lang, ui) {
  const statusText = product.status === "concept" ? ui.statusInDevelopment : ui.statusComingSoon;
  const placeholder = "your@email.com";
  const submit = lang === "ko" ? "출시 알림 받기 →" : "Notify me →";
  const ctaTitle = lang === "ko" ? "출시되면 알려드립니다" : "Get notified at launch";
  const body = escapeHtml(ui.statusBody)
    .split("\n")
    .map((p) => `<p class="bs-lead">${p}</p>`)
    .join("");

  return `<section class="bs-section bs-section--dark bs-final" id="bs-store-status" data-bs-reveal aria-labelledby="bs-final-title"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(ui.releaseEyebrow)}</p>
    <h2 class="bs-final__title" id="bs-final-title">${escapeHtml(statusText)}</h2>
    ${body}
    <p class="bs-lead">${escapeHtml(ctaTitle)}</p>
    <form class="waitlist-form bs-store-waitlist" data-waitlist-form data-form-type="waitlist" data-product-id="${escapeHtml(
      product.slug
    )}">
      <input type="hidden" name="productId" value="${escapeHtml(product.slug)}" />
      <div class="bs-hero__actions">
        <input type="email" name="email" class="bs-store-waitlist__email" placeholder="${escapeHtml(placeholder)}" required autocomplete="email" />
        <button type="submit" class="bs-btn bs-btn--primary">${escapeHtml(submit)}</button>
      </div>
      <input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px" />
    </form>
    <p class="bs-note">${escapeHtml(lang === "ko" ? "결제는 아직 연결되지 않았습니다." : "Checkout is not connected yet.")}</p>
  </div></section>`;
}

function relatedSection(product, lang, ui) {
  const peers = getStoreProducts()
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);
  if (!peers.length) return "";
  const cards = peers
    .map((p) => {
      const title = productTitle(p, lang);
      const cat = String(p.category || "").toUpperCase();
      return `<a class="bs-related__link" href="../${escapeHtml(p.slug)}/">
        <span><span class="bs-related__kicker">${escapeHtml(cat)}</span><span class="bs-related__name">${escapeHtml(title)}</span></span>
        <span class="bs-related__go" aria-hidden="true">${escapeHtml(statusLabel(p, ui))} →</span>
      </a>`;
    })
    .join("");
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-related-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.relatedEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-related-title">${escapeHtml(ui.relatedTitle)}</h2>
      <div class="bs-related">${cards}</div>
      <p class="bs-related__all"><a href="../">${escapeHtml(ui.backStore)}</a></p>
    </div></section>`;
}

function adjacentSection(product, lang, ui) {
  const products = getStoreProducts();
  const idx = products.findIndex((p) => p.slug === product.slug);
  if (idx < 0) return "";

  const prev = idx > 0 ? products[idx - 1] : null;
  const next = idx < products.length - 1 ? products[idx + 1] : null;

  const prevBlock = prev
    ? `<a class="bs-adjacent__link bs-adjacent__link--prev" href="../${escapeHtml(prev.slug)}/">
      <span class="bs-adjacent__label">${escapeHtml(ui.prevResource)}</span>
      <span class="bs-adjacent__name">${escapeHtml(productTitle(prev, lang))}</span>
    </a>`
    : `<span class="bs-adjacent__link bs-adjacent__link--prev is-empty"></span>`;

  const nextBlock = next
    ? `<a class="bs-adjacent__link bs-adjacent__link--next" href="../${escapeHtml(next.slug)}/">
      <span class="bs-adjacent__label">${escapeHtml(ui.nextResource)}</span>
      <span class="bs-adjacent__name">${escapeHtml(productTitle(next, lang))}</span>
    </a>`
    : `<span class="bs-adjacent__link bs-adjacent__link--next is-empty"></span>`;

  return `<section class="bs-section bs-adjacent" data-bs-reveal aria-label="Adjacent products">
    <div class="bs-inner bs-adjacent__grid">${prevBlock}${nextBlock}</div>
  </section>`;
}

function noticesSection(detail, lang) {
  const disclaimer = pick(detail, lang, "disclaimerKo", "disclaimerEn");
  if (!disclaimer) return "";
  const label = lang === "ko" ? "안내" : "Notice";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-notices-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(label)}</p>
      <h2 class="bs-title" id="bs-ss-notices-title" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Notice</h2>
      <p class="bs-note">${escapeHtml(disclaimer).replace(/\n/g, "<br />")}</p>
    </div></section>`;
}

/**
 * @param {object} product
 * @param {'ko'|'en'} lang
 */
export function renderStoreDetailBody(product, lang = "ko") {
  const ui = getStoreDetailUi(lang);
  const detail = getStoreDetail(product.slug);
  if (!detail) {
    return `<div class="bs-inner"><p>Product not found.</p><p><a href="../">${escapeHtml(ui.backStore)}</a></p></div>`;
  }

  return `${breadcrumb(ui, detail.title)}
${heroSection(product, detail, lang, ui)}
${productNav(product.slug)}
${snapshotSection(product, detail, lang, ui)}
${overviewSection(product, detail, lang, ui)}
${includesSection(detail, lang, ui)}
${previewSection(product, detail, lang, ui)}
${howToSection(detail, lang, ui)}
${whoSection(detail, lang, ui)}
${formatSection(detail, lang, ui)}
${finalSection(product, lang, ui)}
${relatedSection(product, lang, ui)}
${noticesSection(detail, lang)}
${adjacentSection(product, lang, ui)}`;
}
