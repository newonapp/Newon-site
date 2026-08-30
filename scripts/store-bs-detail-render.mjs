/**
 * Store product detail body — Brand Strategy–level narrative + Studio bs-* system.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getStoreProducts } from "./resources-data.mjs";
import { getStoreDetail, getStoreDetailUi } from "./store-detail-copy.mjs";
import { storeHeroVisual, storeLargePreview } from "./store-bs-visuals.mjs";

const STORE_NAV_LABELS = {
  "app-launch-kit": "LAUNCH",
  "mvp-planning-kit": "MVP",
  "cursor-prompt-pack": "PROMPTS",
  "codex-builder-pack": "AI BUILD",
  "website-launch-checklist": "WEB",
  "business-planning-workbook": "BIZ PLAN",
  "product-research-template": "RESEARCH",
  "founder-dashboard": "DASHBOARD",
  "product-roadmap": "ROADMAP",
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

function pickArr(detail, lang, koKey, enKey) {
  const v = lang === "ko" ? detail[koKey] || detail[enKey] : detail[enKey] || detail[koKey];
  return Array.isArray(v) ? v : [];
}

function productTitle(product, lang) {
  return lang === "ko" ? product.titleKo || product.titleEn : product.titleEn || product.titleKo;
}

function statusLabel(product, ui) {
  return product.status === "concept" ? ui.inDevBadge : ui.comingSoonBadge;
}

function proseLead(text) {
  if (!text) return "";
  return `<p class="bs-hero__lead">${escapeHtml(String(text)).replace(/\n/g, "<br />")}</p>`;
}

function overviewBodyHtml(paras) {
  if (!paras?.length) return "";
  return `<div class="bs-overview">${paras
    .map((p, i) => `<p class="${i === 0 ? "bs-lead" : ""}">${escapeHtml(String(p)).replace(/\n/g, "<br />")}</p>`)
    .join("")}</div>`;
}

function getGridHtml(items, variant = "board") {
  if (!items?.length) return "";
  const mod = variant ? ` bs-get--${variant}` : "";
  return `<div class="bs-get${mod}" data-count="${items.length}" data-variant="${escapeHtml(variant)}">${items
    .map((item, i) => {
      const title = typeof item === "string" ? item : item.t || item.title || "";
      const body = typeof item === "string" ? "" : item.d || item.body || "";
      const n = typeof item === "object" && item?.n ? String(item.n) : pad2(i + 1);
      const prose = body
        ? `<p>${escapeHtml(body).replace(/\n{2,}/g, "\n").replace(/\n/g, "<br />")}</p>`
        : "";
      return `<article class="bs-get__item"><span class="bs-get__n" aria-hidden="true">${escapeHtml(
        n
      )}</span><div class="bs-get__copy"><h3>${escapeHtml(title)}</h3>${prose}</div></article>`;
    })
    .join("")}</div>`;
}

function deliverListHtml(items, variant = "included") {
  if (!items?.length) return "";
  return `<ul class="bs-deliver bs-deliver--${escapeHtml(variant)}" data-count="${items.length}" data-variant="${escapeHtml(
    variant
  )}">${items
    .map((item, i) => {
      const text = typeof item === "string" ? item : item.t || item.title || "";
      return `<li class="bs-deliver__item"><span class="bs-deliver__n" aria-hidden="true">${pad2(
        i + 1
      )}</span><span class="bs-deliver__t">${escapeHtml(text)}</span></li>`;
    })
    .join("")}</ul>`;
}

function tagChips(items) {
  if (!items?.length) return "";
  return `<ul class="bs-chips">${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
}

function faqHtml(items) {
  if (!items?.length) return "";
  return `<div class="bs-faq">${items
    .map((item, i) => {
      const qid = `bs-faq-q-${i}`;
      const aid = `bs-faq-a-${i}`;
      return `<div class="bs-faq-item">
      <button type="button" class="bs-faq-q" aria-expanded="false" id="${qid}" aria-controls="${aid}">
        <span>${escapeHtml(item.q)}</span><span class="bs-faq-icon" aria-hidden="true"></span>
      </button>
      <div class="bs-faq-a" id="${aid}" role="region" aria-labelledby="${qid}"><div><p>${escapeHtml(item.a).replace(
        /\n/g,
        "<br />"
      )}</p></div></div>
    </div>`;
    })
    .join("")}</div>`;
}

function breadcrumb(ui, title) {
  return `<nav class="bs-crumb" aria-label="Breadcrumb">
    <div class="bs-inner">
      <a href="../../">${escapeHtml(ui.crumbResources)}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <a href="../">${escapeHtml(ui.crumbStore)}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <span>${escapeHtml(title)}</span>
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
  const headline = pick(detail, lang, "heroTitleKo", "heroTitleEn") || pick(detail, lang, "subtitleKo", "subtitleEn") || detail.title;
  const lead = pick(detail, lang, "heroLeadKo", "heroLeadEn") || pick(detail, lang, "descriptionKo", "descriptionEn");

  return `<section class="bs-hero" data-bs-reveal aria-labelledby="bs-hero-title">
  <div class="bs-inner bs-hero__grid">
    <div>
      <p class="bs-eyebrow">${eyebrow}</p>
      <h1 class="bs-hero__title" id="bs-hero-title">${brHeadline(headline)}</h1>
      ${proseLead(lead)}
      <div class="bs-hero__actions">
        <a class="bs-btn bs-btn--primary" href="#bs-store-status" data-bs-cta="hero_primary">${escapeHtml(
          ui.heroNotifyCta
        )}</a>
        <a class="bs-btn bs-btn--ghost" href="#process" data-bs-cta="hero_secondary">${escapeHtml(
          ui.heroProcessCta || ui.heroIncludesCta
        )}</a>
      </div>
    </div>
    ${storeHeroVisual(product.slug, detail.preview, lang)}
  </div>
</section>`;
}

function metaRows(product, detail, lang, ui) {
  const includes = pickArr(detail, lang, "includesKo", "includesEn");
  const format = pickArr(detail, lang, "formatKo", "formatEn");
  const who = pickArr(detail, lang, "whoKo", "whoEn");
  const whoPreview = who
    .slice(0, 2)
    .map((w) => (typeof w === "string" ? w : w.t))
    .filter(Boolean)
    .join(" · ");
  const rows = [
    { k: "PRODUCT", v: detail.title },
    { k: "CATEGORY", v: String(product.category || "").toUpperCase() || "—" },
    { k: "STATUS", v: statusLabel(product, ui) },
    { k: (ui.includesLabel || "MODULES").toUpperCase(), v: includes.length ? String(includes.length) : "—" },
    { k: (ui.formatLabel || "FORMAT").toUpperCase(), v: format.slice(0, 3).join(" · ") || "—" },
    { k: (ui.forLabel || "FOR").toUpperCase(), v: whoPreview || "—" },
  ];
  return rows
    .map(
      (m) =>
        `<div class="bs-dr-meta__row"><p class="bs-dr-meta__k">${escapeHtml(m.k)}</p><p class="bs-dr-meta__v">${escapeHtml(
          m.v
        )}</p></div>`
    )
    .join("");
}

function overviewSection(product, detail, lang, ui) {
  const title = pick(detail, lang, "overviewTitleKo", "overviewTitleEn") || ui.overviewTitle || ui.overviewEyebrow;
  const body = pickArr(detail, lang, "overviewBodyKo", "overviewBodyEn");
  const fallback = pick(detail, lang, "descriptionKo", "descriptionEn");
  const bodyHtml = body.length ? overviewBodyHtml(body) : overviewBodyHtml(fallback ? [fallback] : []);

  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-overview-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(ui.overviewEyebrow)}</p>
          <h2 class="bs-title" id="bs-ss-overview-title">${brHeadline(title)}</h2>
          ${bodyHtml}
        </div>
        <aside class="bs-dr-meta" aria-label="Product summary">${metaRows(product, detail, lang, ui)}</aside>
      </div>
    </div></section>`;
}

function whoSection(detail, lang, ui) {
  const who = pickArr(detail, lang, "whoKo", "whoEn");
  if (!who.length) return "";
  const title = pick(detail, lang, "whoTitleKo", "whoTitleEn") || ui.whoTitle;
  const items = who.map((w) =>
    typeof w === "string" ? { t: w, d: "" } : { t: w.t || w.title, d: w.d || w.body || "" }
  );
  return `<section class="bs-section bs-section--surface" data-bs-part="who" data-bs-reveal aria-labelledby="bs-ss-who-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.whoEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-who-title">${brHeadline(title)}</h2>
      ${getGridHtml(items, "who")}
    </div></section>`;
}

function whatSection(detail, lang, ui) {
  const what = pickArr(detail, lang, "whatKo", "whatEn");
  if (!what.length) return "";
  const title = pick(detail, lang, "whatTitleKo", "whatTitleEn") || ui.whatTitle;
  return `<section class="bs-section bs-section--surface" data-bs-part="what" data-bs-reveal aria-labelledby="bs-ss-what-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.whatEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-what-title">${brHeadline(title)}</h2>
      ${getGridHtml(what, "what")}
    </div></section>`;
}

function includesSection(detail, lang, ui) {
  const includes = pickArr(detail, lang, "includesKo", "includesEn");
  if (!includes.length) return "";
  const lead = ui.includesLead ? `<p class="bs-lead">${escapeHtml(ui.includesLead)}</p>` : "";
  return `<section class="bs-section" data-bs-part="included" data-bs-reveal aria-labelledby="bs-ss-included-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.includesEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-included-title">${escapeHtml(ui.includesTitle)}</h2>
      ${lead}
      ${deliverListHtml(includes, "included")}
    </div></section>`;
}

function outcomesSection(detail, lang, ui) {
  const outcomes = pickArr(detail, lang, "outcomesKo", "outcomesEn");
  if (!outcomes.length) return "";
  const title = pick(detail, lang, "outcomesTitleKo", "outcomesTitleEn") || ui.outcomesTitle;
  return `<section class="bs-section bs-section--surface" data-bs-part="deliver" data-bs-reveal aria-labelledby="bs-ss-outcomes-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.outcomesEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-outcomes-title">${brHeadline(title)}</h2>
      ${getGridHtml(outcomes, "deliver")}
    </div></section>`;
}

function previewSection(product, detail, lang, ui) {
  const name =
    pick(detail, lang, "previewNameKo", "previewNameEn") ||
    (lang === "ko" ? "Product Preview" : "Product Preview");
  return `<section class="bs-section" data-bs-part="preview" data-bs-reveal aria-labelledby="bs-ss-preview-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.previewEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-preview-title">${escapeHtml(name)}</h2>
      ${ui.previewNote ? `<p class="bs-lead">${escapeHtml(ui.previewNote)}</p>` : ""}
      ${storeLargePreview(product.slug, detail.preview, lang, name)}
    </div></section>`;
}

function howToSection(detail, lang, ui) {
  const steps = pickArr(detail, lang, "howToKo", "howToEn");
  if (!steps.length) return "";
  const title = pick(detail, lang, "howToTitleKo", "howToTitleEn") || ui.howToTitle;
  const list = `<ol class="bs-process bs-process--steps" data-count="${steps.length}">${steps
    .map(
      (s, i) =>
        `<li class="bs-process__item"><span class="bs-process__n" aria-hidden="true">${escapeHtml(
          s.n || pad2(i + 1)
        )}</span><div class="bs-process__copy"><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.body).replace(
          /\n/g,
          "<br />"
        )}</p></div></li>`
    )
    .join("")}</ol>`;
  return `<section class="bs-section" data-bs-part="process" data-bs-reveal id="process" aria-labelledby="bs-ss-how-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.howToEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-how-title">${brHeadline(title)}</h2>
      ${list}
    </div></section>`;
}

function formatSection(detail, lang, ui) {
  const format = pickArr(detail, lang, "formatKo", "formatEn");
  if (!format.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-part="format" data-bs-reveal aria-labelledby="bs-ss-format-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(ui.formatEyebrow)}</p>
          <h2 class="bs-title" id="bs-ss-format-title">${escapeHtml(ui.formatTitle)}</h2>
          ${tagChips(format)}
        </div>
        <aside class="bs-dr-meta" aria-label="Format">
          <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">FORMAT</p><p class="bs-dr-meta__v">${escapeHtml(
            format.join(" · ")
          )}</p></div>
          <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">PRODUCT</p><p class="bs-dr-meta__v">${escapeHtml(
            detail.title
          )}</p></div>
        </aside>
      </div>
    </div></section>`;
}

function faqSection(detail, lang, ui) {
  const faq = pickArr(detail, lang, "faqKo", "faqEn");
  if (!faq.length) return "";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-faq-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.faqEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-faq-title">${escapeHtml(ui.faqTitle)}</h2>
      ${faqHtml(faq)}
    </div></section>`;
}

function noticesSection(detail, lang, ui) {
  const disclaimer = pick(detail, lang, "disclaimerKo", "disclaimerEn");
  if (!disclaimer) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-notices-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(ui.noticeEyebrow)}</p>
      <h2 class="bs-title" id="bs-ss-notices-title" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Notice</h2>
      <p class="bs-note">${escapeHtml(disclaimer).replace(/\n/g, "<br />")}</p>
    </div></section>`;
}

function finalSection(product, detail, lang, ui) {
  const statusText = product.status === "concept" ? ui.statusInDevelopment : ui.statusComingSoon;
  const placeholder = "your@email.com";
  const submit = lang === "ko" ? "출시 알림 받기 →" : "Notify me →";
  const ctaTitle = pick(detail, lang, "finalTitleKo", "finalTitleEn") || ui.finalTitle;
  const lead = pick(detail, lang, "finalLeadKo", "finalLeadEn") || ui.finalLead;
  const body = escapeHtml(ui.statusBody)
    .split("\n")
    .filter(Boolean)
    .map((p, i) => `<p class="${i === 0 ? "bs-lead" : ""}">${p}</p>`)
    .join("");

  return `<section class="bs-section bs-section--dark bs-final" id="bs-store-status" data-bs-reveal aria-labelledby="bs-final-title"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(ui.releaseEyebrow)}</p>
    <h2 class="bs-final__title" id="bs-final-title">${brHeadline(ctaTitle)}</h2>
    ${lead ? `<p class="bs-lead">${escapeHtml(lead)}</p>` : ""}
    ${body}
    <p class="bs-lead">${escapeHtml(statusText)}</p>
    <form class="waitlist-form bs-store-waitlist nw-notify-form" data-waitlist-form data-form-type="waitlist" data-product-id="${escapeHtml(
      product.slug
    )}">
      <input type="hidden" name="productId" value="${escapeHtml(product.slug)}" />
      <div class="nw-notify-form__row">
        <input type="email" name="email" class="bs-store-waitlist__email nw-notify-form__email" placeholder="${escapeHtml(
          placeholder
        )}" required autocomplete="email" />
        <button type="submit" class="bs-btn bs-btn--primary nw-notify-form__btn">${escapeHtml(submit)}</button>
      </div>
      <a class="bs-btn bs-btn--ghost nw-notify-form__ghost" href="../">${escapeHtml(ui.ctaSecondary)}</a>
      <input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px" />
    </form>
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
      <span class="bs-adjacent__label">${escapeHtml(ui.prevProduct)}</span>
      <span class="bs-adjacent__name">${escapeHtml(STORE_NAV_LABELS[prev.slug] || productTitle(prev, lang))}</span>
    </a>`
    : `<span class="bs-adjacent__link bs-adjacent__link--prev is-empty"></span>`;

  const nextBlock = next
    ? `<a class="bs-adjacent__link bs-adjacent__link--next" href="../${escapeHtml(next.slug)}/">
      <span class="bs-adjacent__label">${escapeHtml(ui.nextProduct)}</span>
      <span class="bs-adjacent__name">${escapeHtml(STORE_NAV_LABELS[next.slug] || productTitle(next, lang))}</span>
    </a>`
    : `<span class="bs-adjacent__link bs-adjacent__link--next is-empty"></span>`;

  return `<section class="bs-section bs-adjacent" data-bs-reveal aria-label="Adjacent products">
    <div class="bs-inner bs-adjacent__grid">${prevBlock}${nextBlock}</div>
  </section>`;
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
${overviewSection(product, detail, lang, ui)}
${whoSection(detail, lang, ui)}
${whatSection(detail, lang, ui)}
${includesSection(detail, lang, ui)}
${outcomesSection(detail, lang, ui)}
${howToSection(detail, lang, ui)}
${previewSection(product, detail, lang, ui)}
${formatSection(detail, lang, ui)}
${faqSection(detail, lang, ui)}
${noticesSection(detail, lang, ui)}
${finalSection(product, detail, lang, ui)}
${adjacentSection(product, lang, ui)}`;
}
