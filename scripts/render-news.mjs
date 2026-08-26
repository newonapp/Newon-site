#!/usr/bin/env node
/**
 * Render News & Updates hub + article pages for all languages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  publishedArticles,
  articleCopy,
  articleProductSlug,
  formatNewsDate,
  productBySlug,
  isNewArticle,
  featuredArticle,
  latestProductSlugs,
  imageAltFor,
  historyEntryCopy,
  NEWS_PAGE_SIZE,
  NEWS_TL_PREVIEW,
  NEWS_PRODUCTS,
  NEWS_SOCIAL_LINKS,
  NEWS_STORE_DEV,
  buildTimelineEntries,
  groupTimelineEntries,
  formatHistoryDisplayDate,
  historyDatetimeAttr,
  historyTypeLabelKey,
  historyFilterBucket,
  HISTORY_TYPE_FILTERS,
} from "./news-data.mjs";
import { replaceLegacyChrome } from "./inject-chrome.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ORIGIN = "https://www.newon.app";
const LANGS = [
  { dir: "ko", file: "ko.json", htmlLang: "ko", hreflang: "ko" },
  { dir: "en", file: "en.json", htmlLang: "en", hreflang: "en" },
  { dir: "ja", file: "ja.json", htmlLang: "ja", hreflang: "ja" },
  { dir: "es", file: "es.json", htmlLang: "es", hreflang: "es" },
  { dir: "pt-br", file: "pt-br.json", htmlLang: "pt-BR", hreflang: "pt-BR" },
  { dir: "fr", file: "fr.json", htmlLang: "fr", hreflang: "fr" },
  { dir: "de", file: "de.json", htmlLang: "de", hreflang: "de" },
  { dir: "hi", file: "hi.json", htmlLang: "hi", hreflang: "hi" },
  { dir: "id", file: "id.json", htmlLang: "id", hreflang: "id" },
];
const OG_LOCALE = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  es: "es_ES",
  "pt-br": "pt_BR",
  fr: "fr_FR",
  de: "de_DE",
  hi: "hi_IN",
  id: "id_ID",
};
const CAT_EN = {
  launch: "LAUNCH",
  update: "UPDATE",
  feature: "FEATURE",
  company: "NEWON",
  notice: "NOTICE",
};

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

function fillMissing(target, source) {
  if (source == null || typeof source !== "object") return target;
  if (Array.isArray(source)) return target;
  const out = target && typeof target === "object" && !Array.isArray(target) ? { ...target } : {};
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = fillMissing(out[k], v);
    } else if (out[k] === undefined || out[k] === null || out[k] === "") {
      out[k] = v;
    }
  }
  return out;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pick(flat, flatEn, key) {
  let val = flat[key];
  if (val === undefined || val === null || val === "") val = flatEn[key];
  return val;
}

function applyTemplate(template, flat, flatEn) {
  let out = template.replace(/\{\{html:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    return val != null ? String(val) : "";
  });
  out = out.replace(/\{\{t:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    if (val === undefined || val === null) return "";
    return escapeHtml(String(val));
  });
  return out;
}

function t(flat, flatEn, key) {
  const val = pick(flat, flatEn, key);
  return val != null ? String(val) : "";
}

function catLabel(flat, flatEn, category) {
  const map = {
    launch: "news.catLaunch",
    update: "news.catUpdate",
    feature: "news.catFeature",
    company: "news.catCompany",
    notice: "news.catNotice",
  };
  return t(flat, flatEn, map[category] || "news.catUpdate");
}

function resolveImage(file, lang) {
  if (!file) return "";
  const candidates = [`i18n-img/${lang}/${file}`, `i18n-img/en/${file}`, `i18n-img/ko/${file}`];
  for (const c of candidates) {
    if (fs.existsSync(path.join(ROOT, c))) return "/" + c;
  }
  return "";
}

function altFor(article, lang) {
  return imageAltFor(article, lang);
}

function productHref(product, depth, lang) {
  if (!product) return "";
  if (product.pageHref) {
    return String(product.pageHref).replace(/\{\{LANG\}\}/g, lang || "en");
  }
  const prefix = depth === 2 ? "../../" : "../";
  return `${prefix}portfolio/${product.slug}/`;
}

function searchBlob(article, lang, product) {
  const copy = articleCopy(article, lang);
  const parts = [
    copy.title,
    copy.summary,
    copy.lead,
    copy.timelineLabel,
    copy.featureName,
    product?.name,
    article.category,
    CAT_EN[article.category],
    ...(copy.paragraphs || []),
    ...((copy.whatsNew || []).flatMap((w) => [w.title, w.body])),
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function hreflangNews(slug) {
  const suffix = slug ? `${slug}/` : "";
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/news/${suffix}" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/news/${suffix}" />`);
  return lines.join("\n");
}

function safeTitleHtml(html, fallback) {
  const raw = html || fallback || "";
  return escapeHtml(raw.replace(/<br\s*\/?>/gi, "\u0000BR\u0000")).replace(/\u0000BR\u0000/g, "<br />");
}

function renderBlock(block) {
  if (!block || typeof block !== "object") return "";
  const type = block.type;
  if (type === "h2") return `<h2>${escapeHtml(block.text || "")}</h2>`;
  if (type === "h3") return `<h3>${escapeHtml(block.text || "")}</h3>`;
  if (type === "p") {
    const text = escapeHtml(block.text || "");
    if (block.href && block.linkLabel) {
      return `<p>${text} <a href="${escapeHtml(block.href)}">${escapeHtml(block.linkLabel)}</a></p>`;
    }
    return `<p>${text}</p>`;
  }
  if (type === "ul" && Array.isArray(block.items)) {
    return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }
  if (type === "ol" && Array.isArray(block.items)) {
    return `<ol>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
  }
  if (type === "hr") return `<hr />`;
  if (type === "img" && block.src) {
    const cap = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : "";
    return `<figure><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || "")}" loading="lazy" decoding="async" />${cap}</figure>`;
  }
  return "";
}

function newBadgeHtml(article) {
  if (!isNewArticle(article)) return "";
  return `<span class="nw-new">NEW</span>`;
}

function productOptionsHtml() {
  return NEWS_PRODUCTS.map(
    (p) => `<option value="${escapeHtml(p.slug)}">${escapeHtml(p.name)}</option>`
  ).join("\n                ");
}

function socialHtml(flat, flatEn) {
  if (!NEWS_SOCIAL_LINKS.length) return "";
  return NEWS_SOCIAL_LINKS.map(
    (s) =>
      `<a class="nw-follow__link" href="${escapeHtml(s.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)}</a>`
  ).join('<span class="nw-follow__sep" aria-hidden="true">·</span>');
}

function appsLogoGridHtml() {
  return NEWS_PRODUCTS.map(
    (p) =>
      `<img class="nw-apps__logo" src="${escapeHtml(p.icon)}" alt="${escapeHtml(p.name)}" width="40" height="40" loading="lazy" decoding="async" />`
  ).join("\n            ");
}

function productAccent(slug) {
  const map = {
    "ox-month": "ox",
    subping: "sp",
    pillmate: "pm",
    savy: "sv",
    babylog: "bl",
    petlog: "pl",
    piggyup: "pu",
    goalup: "gu",
    countup: "cu",
    "newon-plus": "np",
    myworld: "mw",
    "404-human": "fh",
  };
  return map[slug] || "np";
}

function logoHtml(product, className, size = 48) {
  const src = product ? product.icon : "/logo.png";
  const alt = product ? product.name : "Newon";
  return `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="${size}" height="${size}" loading="lazy" decoding="async" />`;
}

function featuredHtml(article, lang, flat, flatEn) {
  if (!article) return "";
  const copy = articleCopy(article, lang);
  const product = productBySlug(articleProductSlug(article));
  const accent = productAccent(articleProductSlug(article));
  const launch =
    article.category === "launch" ? `<span class="nw-badge nw-badge--launch">LAUNCH</span>` : "";
  const titleHtml = safeTitleHtml(copy.titleHtml, copy.title || "");
  const productName = product ? product.name : "Newon";
  return `<section class="nw-featured" id="nw-featured" data-nw-featured data-category="${escapeHtml(article.category)}" data-product="${escapeHtml(articleProductSlug(article))}" data-search="${escapeHtml(searchBlob(article, lang, product))}" aria-labelledby="nw-featured-title">
        <div class="nw-inner">
          <div class="nw-section__head nw-section__head--compact">
            <p class="nw-kicker">${escapeHtml(t(flat, flatEn, "news.featuredLabel"))}</p>
            <h2 id="nw-featured-title">${escapeHtml(t(flat, flatEn, "news.featuredTitle"))}</h2>
          </div>
          <a class="nw-featured__card" href="${escapeHtml(article.slug)}/" data-accent="${escapeHtml(accent)}">
            <div class="nw-featured__brand" aria-hidden="true">
              ${logoHtml(product, "nw-featured__logo", 96)}
              <span class="nw-featured__product">${escapeHtml(productName)}</span>
            </div>
            <div class="nw-featured__copy">
              <div class="nw-featured__meta">
                ${launch}
                <span class="nw-featured__cat">${escapeHtml(catLabel(flat, flatEn, article.category))}</span>
                <time datetime="${escapeHtml(article.date)}">${escapeHtml(formatNewsDate(article.date))}</time>
                ${newBadgeHtml(article)}
              </div>
              <h3 class="nw-featured__title">${titleHtml}</h3>
              <p class="nw-featured__sum">${escapeHtml(copy.summary || "")}</p>
              <span class="nw-featured__go">${escapeHtml(t(flat, flatEn, "news.readMore"))}</span>
            </div>
          </a>
        </div>
      </section>`;
}

function cardHtml(article, lang, flat, flatEn) {
  const copy = articleCopy(article, lang);
  const product = productBySlug(articleProductSlug(article));
  const accent = productAccent(articleProductSlug(article));
  const titleId = `nw-t-${article.slug}`;
  const launch =
    article.category === "launch" ? `<span class="nw-badge nw-badge--launch">LAUNCH</span>` : "";
  return `<article class="nw-card" data-nw-row data-accent="${escapeHtml(accent)}" data-category="${escapeHtml(article.category)}" data-product="${escapeHtml(articleProductSlug(article))}" data-slug="${escapeHtml(article.slug)}" data-search="${escapeHtml(searchBlob(article, lang, product))}">
              <a class="nw-card__link" href="${escapeHtml(article.slug)}/" aria-labelledby="${escapeHtml(titleId)}">
                <div class="nw-card__top">
                  <time datetime="${escapeHtml(article.date)}">${escapeHtml(formatNewsDate(article.date))}</time>
                  <span class="nw-card__cat">${escapeHtml(catLabel(flat, flatEn, article.category))}</span>
                </div>
                <div class="nw-card__brand">
                  ${logoHtml(product, "nw-card__logo", 40)}
                  <span class="nw-card__app">${escapeHtml(product ? product.name : "Newon")}</span>
                  ${launch}
                  ${newBadgeHtml(article)}
                </div>
                <h3 class="nw-card__title" id="${escapeHtml(titleId)}">${escapeHtml(copy.latestTitle || copy.title || "")}</h3>
                <p class="nw-card__sum">${escapeHtml(copy.summary || "")}</p>
                <div class="nw-card__foot">
                  <span class="nw-card__go">${escapeHtml(t(flat, flatEn, "news.readMore"))}</span>
                </div>
              </a>
            </article>`;
}

function historyCopy(entry, lang) {
  return historyEntryCopy(entry, lang);
}

function timelineHtml(lang, flat, flatEn) {
  const entries = buildTimelineEntries(publishedArticles(), {
    productBySlug,
    articleCopy,
    articleProductSlug,
  });
  if (!entries.length) return "";
  const byYear = groupTimelineEntries(entries);

  return byYear
    .map((yg) => {
      const months = yg.months
        .map((mg) => {
          const rows = mg.items
            .map((entry) => {
              const copy = historyCopy(entry, lang);
              const product = productBySlug(entry.product);
              const name = product ? product.name : entry.product || "Newon";
              const icon = entry.icon || (product && product.icon) || "/logo.png";
              const displayDate = formatHistoryDisplayDate(entry.date, entry.datePrecision);
              const datetime = historyDatetimeAttr(entry.date, entry.datePrecision);
              const typeLabel = t(flat, flatEn, historyTypeLabelKey(entry.type));
              const bucket = historyFilterBucket(entry.type);
              const productLink = product
                ? productHref(product, 1, lang)
                : String(entry.productUrl || "#").replace(/\{\{LANG\}\}/g, lang);
              const newsLink = entry.newsSlug ? `${entry.newsSlug}/` : "";
              const search = [name, copy.title, copy.description, entry.type, typeLabel]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
              const titleInner = newsLink
                ? `<a href="${escapeHtml(newsLink)}">${escapeHtml(copy.title || "")}</a>`
                : escapeHtml(copy.title || "");
              const go = newsLink
                ? `<a class="nw-tl-item__go" href="${escapeHtml(newsLink)}">${escapeHtml(t(flat, flatEn, "news.readMore"))}</a>`
                : "";
              return `<article class="nw-tl-item" data-nw-tl data-category="${escapeHtml(entry.category || "")}" data-product="${escapeHtml(entry.product || "")}" data-hist-type="${escapeHtml(bucket)}" data-search="${escapeHtml(search)}">
                    <span class="nw-tl-item__dot" aria-hidden="true"></span>
                    <div class="nw-tl-item__body">
                      <div class="nw-tl-item__meta">
                        <time datetime="${escapeHtml(datetime)}">${escapeHtml(displayDate)}</time>
                        <span class="nw-tl-item__type">${escapeHtml(typeLabel)}</span>
                      </div>
                      <div class="nw-tl-item__brand">
                        <a class="nw-tl-item__icon-link" href="${escapeHtml(productLink)}">
                          <img class="nw-tl-item__icon" src="${escapeHtml(icon)}" alt="" width="36" height="36" loading="lazy" decoding="async" />
                        </a>
                        <a class="nw-tl-item__product" href="${escapeHtml(productLink)}">${escapeHtml(name)}</a>
                      </div>
                      <h3 class="nw-tl-item__title">${titleInner}</h3>
                      ${copy.description ? `<p class="nw-tl-item__desc">${escapeHtml(copy.description)}</p>` : ""}
                      ${go}
                    </div>
                  </article>`;
            })
            .join("\n                  ");
          const monthLabel =
            mg.key === "earlier" ? t(flat, flatEn, "news.timelineEarlier") || "EARLIER" : mg.label;
          return `<div class="nw-tl-month" data-nw-tl-month>
                  <p class="nw-tl-month__label"><span>${escapeHtml(monthLabel)}</span></p>
                  <div class="nw-tl-month__entries">${rows}</div>
                </div>`;
        })
        .join("\n                ");
      return `<div class="nw-tl-group" data-nw-tl-group data-tl-year="${escapeHtml(yg.year)}">
              <div class="nw-tl-group__year">${escapeHtml(yg.year)}</div>
              <div class="nw-tl-group__months">${months}</div>
            </div>`;
    })
    .join("\n            ");
}

function historyFiltersHtml(flat, flatEn) {
  const labels = {
    all: "news.histFilterAll",
    launch: "news.histFilterLaunch",
    update: "news.histFilterUpdate",
    milestone: "news.histFilterMilestone",
  };
  return HISTORY_TYPE_FILTERS.map((key, i) => {
    const active = i === 0 ? " is-active" : "";
    const aria = i === 0 ? ' aria-current="true"' : "";
    return `<button type="button" class="nw-hist-filter${active}" data-nw-hist-filter="${escapeHtml(key)}"${aria}>${escapeHtml(t(flat, flatEn, labels[key]))}</button>`;
  }).join("\n              ");
}

function latestProductsHtml() {
  // Replaced by Store CTA logo grid — keep placeholder empty for template compatibility.
  return "";
}

function bodyHtml(copy) {
  if (Array.isArray(copy.blocks) && copy.blocks.length) {
    return copy.blocks.map(renderBlock).filter(Boolean).join("\n          ");
  }
  return (copy.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("\n          ");
}

function whatsHtml(copy, flat, flatEn) {
  const items = copy.whatsNew || [];
  if (!items.length) return "";
  const lis = items
    .map(
      (it) => `<li>
              <strong>${escapeHtml(it.title)}</strong>
              <span>${escapeHtml(it.body)}</span>
            </li>`
    )
    .join("\n            ");
  return `<section class="nw-whats" aria-labelledby="nw-whats-title">
          <h2 id="nw-whats-title">${escapeHtml(t(flat, flatEn, "news.whatsLabel"))}</h2>
          <ul>${lis}</ul>
        </section>`;
}

function versionMetaHtml(article, product, flat, flatEn) {
  if (article.category !== "update" && !article.version) return "";
  const bits = [];
  if (article.version) {
    bits.push(
      `<div><dt>${escapeHtml(t(flat, flatEn, "news.versionLabel"))}</dt><dd>${escapeHtml(article.version)}</dd></div>`
    );
  }
  if (article.date) {
    bits.push(
      `<div><dt>${escapeHtml(t(flat, flatEn, "news.metaReleased"))}</dt><dd>${escapeHtml(formatNewsDate(article.date))}</dd></div>`
    );
  }
  if (product) {
    bits.push(
      `<div><dt>${escapeHtml(t(flat, flatEn, "news.metaProduct"))}</dt><dd>${escapeHtml(product.name)}</dd></div>`
    );
  }
  if (!bits.length) return "";
  return `<dl class="nw-meta-strip">${bits.join("")}</dl>`;
}

function featureBlockHtml(article, copy, product, flat, flatEn, lang) {
  if (article.category !== "feature") return "";
  const name = copy.featureName || copy.title || "";
  const available = product
    ? `<p class="nw-feature-block__avail"><span>${escapeHtml(t(flat, flatEn, "news.featureAvailable"))}</span> ${escapeHtml(product.name)}</p>`
    : "";
  const cta = product
    ? `<a class="nw-btn nw-btn--primary" href="${escapeHtml(productHref(product, 2, lang))}">${escapeHtml(t(flat, flatEn, "news.featureCta"))}</a>`
    : "";
  return `<section class="nw-feature-block" aria-labelledby="nw-feature-title">
          <p class="nw-kicker">FEATURE</p>
          <h2 id="nw-feature-title">${escapeHtml(name)}</h2>
          ${available}
          <p>${escapeHtml(copy.summary || copy.lead || "")}</p>
          ${cta}
        </section>`;
}

function storeButtons(article, product, loc, flat, flatEn, lang) {
  const ns = product && product.ns;
  const appStore = article.appStoreUrl || (ns && loc[ns] && loc[ns].appStoreUrl) || "";
  const play = article.googlePlayUrl || (ns && loc[ns] && loc[ns].googlePlayUrl) || "";
  const productUrl =
    (article.productUrl && String(article.productUrl).replace(/\{\{LANG\}\}/g, lang || "en")) ||
    (product ? productHref(product, 2, lang) : "");
  const btns = [];
  if (appStore) {
    btns.push(
      `<a class="nw-btn nw-btn--ghost" href="${escapeHtml(appStore)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(flat, flatEn, "news.appStore"))}</a>`
    );
  }
  if (play) {
    btns.push(
      `<a class="nw-btn nw-btn--ghost" href="${escapeHtml(play)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(flat, flatEn, "news.googlePlay"))}</a>`
    );
  }
  if (productUrl) {
    btns.push(
      `<a class="nw-btn nw-btn--primary" href="${escapeHtml(productUrl)}">${escapeHtml(t(flat, flatEn, "news.productIntro"))}</a>`
    );
  }
  return btns;
}

function relatedHtml(article, loc, flat, flatEn, lang) {
  const product = productBySlug(articleProductSlug(article));
  if (!product) return "";
  const ns = product.ns;
  const tagline =
    (ns && loc[ns] && (loc[ns].heroReachSummary || loc[ns].heroSubtitle)) || "";
  const btns = storeButtons(article, product, loc, flat, flatEn, lang);
  return `<section class="nw-related" aria-labelledby="nw-related-title">
          <h2 id="nw-related-title">${escapeHtml(t(flat, flatEn, "news.relatedLabel"))}</h2>
          <div class="nw-related__card">
            <img src="${escapeHtml(product.icon)}" alt="" width="56" height="56" loading="lazy" decoding="async" />
            <div>
              <p class="nw-related__name">${escapeHtml(product.name)}</p>
              ${tagline ? `<p>${escapeHtml(tagline)}</p>` : ""}
            </div>
          </div>
          <div class="nw-related__actions">${btns.join("\n            ")}</div>
        </section>`;
}

function pagerHtml(articles, index, lang, flat, flatEn) {
  const prev = articles[index + 1];
  const next = articles[index - 1];
  if (!prev && !next) return "";
  const prevCopy = prev ? articleCopy(prev, lang) : null;
  const nextCopy = next ? articleCopy(next, lang) : null;
  const prevA = prev
    ? `<a href="../${escapeHtml(prev.slug)}/"><span class="nw-pager__dir">${escapeHtml(t(flat, flatEn, "news.prev"))}</span><span class="nw-pager__title">${escapeHtml(prevCopy.title || "")}</span></a>`
    : "<span></span>";
  const nextA = next
    ? `<a class="nw-pager__next" href="../${escapeHtml(next.slug)}/"><span class="nw-pager__dir">${escapeHtml(t(flat, flatEn, "news.next"))}</span><span class="nw-pager__title">${escapeHtml(nextCopy.title || "")}</span></a>`
    : "<span></span>";
  return `<nav class="nw-pager" aria-label="${escapeHtml(t(flat, flatEn, "news.pagerAria"))}">${prevA}${nextA}</nav>`;
}

function moreNewsHtml(articles, current, lang, flat, flatEn) {
  const others = articles.filter((a) => a.slug !== current.slug).slice(0, 3);
  if (!others.length) return "";
  const items = others
    .map((a) => {
      const copy = articleCopy(a, lang);
      const product = productBySlug(articleProductSlug(a));
      return `<a class="nw-more-row" href="../${escapeHtml(a.slug)}/">
              <span class="nw-more-row__cat">${escapeHtml(catLabel(flat, flatEn, a.category))}</span>
              <span class="nw-more-row__title">${escapeHtml(copy.title || "")}</span>
              <span class="nw-more-row__meta">${escapeHtml(product ? product.name : "")} · ${escapeHtml(formatNewsDate(a.date))}</span>
            </a>`;
    })
    .join("\n            ");
  return `<section class="nw-more-news" aria-labelledby="nw-more-news-title">
          <h2 id="nw-more-news-title">${escapeHtml(t(flat, flatEn, "news.moreNewsTitle"))}</h2>
          <div class="nw-more-list">${items}</div>
        </section>`;
}

function figureHtml() {
  // Screenshots disabled on news pages — product logo is shown via ARTICLE_LOGO.
  return "";
}

function jsonLd(article, copy, canonical, image) {
  const obj = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: copy.title || "",
    description: copy.summary || "",
    datePublished: article.date,
    mainEntityOfPage: canonical,
    publisher: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN },
  };
  if (image) obj.image = `${SITE_ORIGIN}${image}`;
  return `    <script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function writeRootRedirects(articles) {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const hub = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/news/"/><title>Newon — News</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/news/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/news/">News</a> · <a href="/ko/news/">새 소식</a></p></body></html>`;
  const newsRoot = path.join(ROOT, "news");
  fs.mkdirSync(newsRoot, { recursive: true });
  fs.writeFileSync(path.join(newsRoot, "index.html"), hub);
  for (const a of articles) {
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/news/${a.slug}/"/><title>Newon — News</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/news/${a.slug}/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/news/${a.slug}/">News</a></p></body></html>`;
    const d = path.join(newsRoot, a.slug);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, "index.html"), html);
  }
}

function patchSitemap(articles) {
  const smPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(smPath)) return;
  let xml = fs.readFileSync(smPath, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  for (const a of articles) {
    if (xml.includes(`/news/${a.slug}/</loc>`)) continue;
    const alts = LANGS.map(
      ({ dir: d, hreflang: h }) =>
        `    <xhtml:link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/news/${a.slug}/" />`
    );
    alts.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/news/${a.slug}/" />`
    );
    const block = LANGS.map(
      ({ dir: d }) => `  <url>
    <loc>${SITE_ORIGIN}/${d}/news/${a.slug}/</loc>
    <lastmod>${a.date || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.55</priority>
${alts.join("\n")}
  </url>`
    ).join("\n");
    xml = xml.replace("</urlset>", `${block}\n</urlset>`);
  }
  fs.writeFileSync(smPath, xml);
}

function copyToPublish(articles) {
  const pub = path.join(ROOT, "_publish");
  if (!fs.existsSync(pub)) return;
  const newsPub = path.join(pub, "news");
  fs.mkdirSync(newsPub, { recursive: true });
  for (const name of ["news.css", "news.js", "index.html"]) {
    const src = path.join(ROOT, "news", name);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(newsPub, name));
  }
  for (const a of articles) {
    const src = path.join(ROOT, "news", a.slug, "index.html");
    if (!fs.existsSync(src)) continue;
    const dest = path.join(newsPub, a.slug);
    fs.mkdirSync(dest, { recursive: true });
    fs.copyFileSync(src, path.join(dest, "index.html"));
  }
  for (const { dir } of LANGS) {
    const srcHub = path.join(ROOT, dir, "news", "index.html");
    const destHub = path.join(pub, dir, "news");
    fs.mkdirSync(destHub, { recursive: true });
    if (fs.existsSync(srcHub)) fs.copyFileSync(srcHub, path.join(destHub, "index.html"));
    for (const a of articles) {
      const src = path.join(ROOT, dir, "news", a.slug, "index.html");
      if (!fs.existsSync(src)) continue;
      const dest = path.join(pub, dir, "news", a.slug);
      fs.mkdirSync(dest, { recursive: true });
      fs.copyFileSync(src, path.join(dest, "index.html"));
    }
  }
  const smSrc = path.join(ROOT, "sitemap.xml");
  if (fs.existsSync(smSrc)) fs.copyFileSync(smSrc, path.join(pub, "sitemap.xml"));
}

const enData = loadJson("en.json");
const flatEn = flatten(enData);
const articles = publishedArticles();
const listTpl = fs.readFileSync(path.join(ROOT, "templates", "news.html"), "utf8");
const detailTpl = fs.readFileSync(path.join(ROOT, "templates", "news-detail.html"), "utf8");

for (const { dir, file, htmlLang } of LANGS) {
  const merged = fillMissing(loadJson(file), enData);
  const flat = flatten(merged);
  const featured = featuredArticle(articles);

  let hub = listTpl;
  hub = hub.replace(/\{\{LANG_DIR\}\}/g, dir);
  hub = hub.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  hub = hub.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
  hub = hub.replace(/\{\{HREFLANG_BLOCK_LEGAL\}\}/g, hreflangNews(""));
  hub = hub.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/news/`);
  hub = hub.replace(/\{\{TL_PREVIEW\}\}/g, String(NEWS_TL_PREVIEW));
  hub = applyTemplate(hub, flat, flatEn);
  hub = hub.replace("{{PRODUCT_OPTIONS}}", productOptionsHtml());
  hub = hub.replace("{{NEWS_FEATURED}}", featuredHtml(featured, dir, flat, flatEn));
  const listArticles = articles.filter(
    (a) => a.includeInLatest !== false && (!featured || a.slug !== featured.slug)
  );
  const latestSection = `<section class="nw-latest" id="nw-latest" data-nw-latest aria-labelledby="nw-latest-title"${listArticles.length === 0 ? " hidden" : ""}>
          <div class="nw-inner">
            <div class="nw-section__head nw-section__head--row">
              <div>
                <p class="nw-kicker">${escapeHtml(t(flat, flatEn, "news.latestLabel"))}</p>
                <h2 id="nw-latest-title">${escapeHtml(t(flat, flatEn, "news.latestTitle"))}</h2>
              </div>
            </div>
            <div id="nw-list" class="nw-cards"${listArticles.length === 0 ? " hidden" : ""}>
              ${listArticles.map((a) => cardHtml(a, dir, flat, flatEn)).join("\n            ")}
            </div>
            <div class="nw-empty nw-empty--filter" id="nw-empty" hidden>
              <p class="nw-empty__title" id="nw-empty-title">${escapeHtml(t(flat, flatEn, "news.emptyTitle"))}</p>
              <p class="nw-empty__body" id="nw-empty-body">${escapeHtml(t(flat, flatEn, "news.emptyBody"))}</p>
              <button type="button" class="nw-text-btn" id="nw-empty-reset">${escapeHtml(t(flat, flatEn, "news.emptyReset"))}</button>
            </div>
            <div class="nw-empty nw-empty--search" id="nw-search-empty" hidden>
              <p class="nw-empty__title">${escapeHtml(t(flat, flatEn, "news.searchEmptyTitle"))}</p>
              <p class="nw-empty__body">${escapeHtml(t(flat, flatEn, "news.searchEmptyBody"))}</p>
            </div>
            <div class="nw-more-wrap">
              <button class="nw-text-btn" type="button" id="nw-more" hidden>${escapeHtml(t(flat, flatEn, "news.moreStories"))}</button>
            </div>
          </div>
        </section>`;
  hub = hub.replace("{{NEWS_LATEST}}", latestSection);
  hub = hub.replace("{{NEWS_HISTORY_FILTERS}}", historyFiltersHtml(flat, flatEn));
  hub = hub.replace("{{NEWS_TIMELINE}}", timelineHtml(dir, flat, flatEn));
  hub = hub.replaceAll("{{NEWS_APPS_LOGOS}}", appsLogoGridHtml());
  hub = hub.replace("{{NEWS_SOCIAL}}", socialHtml(flat, flatEn));
  hub = hub.replace("{{NEWS_STORE_APP}}", NEWS_STORE_DEV.appStore);
  hub = hub.replace("{{NEWS_STORE_PLAY}}", NEWS_STORE_DEV.googlePlay);
  hub = replaceLegacyChrome(hub, flat, flatEn, { activeNav: "company", companySwitch: "news" });
  const hubDir = path.join(ROOT, dir, "news");
  fs.mkdirSync(hubDir, { recursive: true });
  fs.writeFileSync(path.join(hubDir, "index.html"), hub);

  articles.forEach((article, index) => {
    const copy = articleCopy(article, dir);
    const product = productBySlug(articleProductSlug(article));
    const logoPath = product ? product.icon : "/logo.png";
    const canonical = `${SITE_ORIGIN}/${dir}/news/${article.slug}/`;
    const og = `${SITE_ORIGIN}${logoPath}`;
    let page = detailTpl;
    page = page.replace(/\{\{LANG_DIR\}\}/g, dir);
    page = page.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
    page = page.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
    page = page.replace(/\{\{CANONICAL\}\}/g, canonical);
    page = page.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangNews(article.slug));
    page = applyTemplate(page, flat, flatEn);
    page = page.replace(/\{\{ARTICLE_SEO_TITLE\}\}/g, escapeHtml(`${copy.title || ""} | Newon`));
    page = page.replace(/\{\{ARTICLE_SEO_DESC\}\}/g, escapeHtml(copy.summary || ""));
    page = page.replace(/\{\{ARTICLE_OG_IMAGE\}\}/g, escapeHtml(og));
    page = page.replace(/\{\{ARTICLE_ISO\}\}/g, escapeHtml(article.date));
    page = page.replace(/\{\{ARTICLE_CATEGORY\}\}/g, escapeHtml(article.category));
    page = page.replace("{{JSON_LD}}", jsonLd(article, copy, canonical, logoPath));
    page = page.replace(
      "{{ARTICLE_LAUNCH_BADGE}}",
      article.category === "launch" ? `<p class="nw-badge nw-badge--launch">LAUNCH</p>` : ""
    );
    page = page.replace(/\{\{ARTICLE_CAT_EN\}\}/g, escapeHtml(CAT_EN[article.category] || ""));
    page = page.replace(/\{\{ARTICLE_DATE\}\}/g, escapeHtml(formatNewsDate(article.date)));
    const detailLogoSrc = product ? product.icon : article.category === "company" ? "/logo.png" : "";
    page = page.replace(
      "{{ARTICLE_LOGO}}",
      detailLogoSrc
        ? `<img class="nw-article__logo" src="${escapeHtml(detailLogoSrc)}" alt="${escapeHtml(product ? product.name : "Newon")}" width="72" height="72" loading="lazy" decoding="async" />`
        : ""
    );
    page = page.replace(
      "{{ARTICLE_PRODUCT_LINE}}",
      product
        ? `<p class="nw-article__product"><a href="${escapeHtml(productHref(product, 2, dir))}">${escapeHtml(product.name)}</a></p>`
        : ""
    );
    page = page.replace("{{ARTICLE_TITLE_HTML}}", safeTitleHtml(copy.titleHtml, copy.title || ""));
    page = page.replace(/\{\{ARTICLE_LEAD\}\}/g, escapeHtml(copy.lead || copy.summary || ""));
    page = page.replace("{{ARTICLE_META}}", versionMetaHtml(article, product, flat, flatEn));
    page = page.replace("{{ARTICLE_FIGURE}}", figureHtml(article, dir));
    page = page.replace("{{ARTICLE_BODY}}", bodyHtml(copy));
    page = page.replace("{{ARTICLE_FEATURE}}", featureBlockHtml(article, copy, product, flat, flatEn, dir));
    page = page.replace("{{ARTICLE_WHATS}}", whatsHtml(copy, flat, flatEn));
    page = page.replace("{{ARTICLE_VERSION}}", "");
    page = page.replace("{{ARTICLE_RELATED}}", relatedHtml(article, merged, flat, flatEn, dir));
    page = page.replace("{{ARTICLE_PAGER}}", pagerHtml(articles, index, dir, flat, flatEn));
    page = page.replace("{{ARTICLE_MORE}}", moreNewsHtml(articles, article, dir, flat, flatEn));
    page = replaceLegacyChrome(page, flat, flatEn, { activeNav: "company", base: "../../" });
    const ad = path.join(hubDir, article.slug);
    fs.mkdirSync(ad, { recursive: true });
    fs.writeFileSync(path.join(ad, "index.html"), page);
  });
}

writeRootRedirects(articles);
patchSitemap(articles);
copyToPublish(articles);

void NEWS_PAGE_SIZE;
void latestProductSlugs;

console.log(
  `render-news: ${articles.length} article(s), ${LANGS.length} languages, page size ${NEWS_PAGE_SIZE}`
);
