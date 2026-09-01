#!/usr/bin/env node
/**
 * Render Newon Company pages at classic paths:
 * /{lang}/about|portfolio|news|ideas|contact/
 * Company design (company.css). /company/* redirects here.
 * Portfolio/news detail pages under classic paths keep their original designs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGS, OG_LOCALE, SITE_ORIGIN, ROOT, escapeHtml } from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { COMPANY_PAGES, COMPANY_NAV_LABELS, COMPANY_HUB_REDIRECTS } from "./company-catalog.mjs";
import { getCompanyCopy } from "./company-copy.mjs";
import { getCompanyProjects, getPortfolioFilters } from "./company-portfolio-data.mjs";
import {
  NEWS_PRODUCTS,
  NEWS_LAUNCH_ORDER,
  publishedArticles,
  articleCopy,
  articleProductSlug,
  productBySlug,
  formatNewsDate,
  buildTimelineEntries,
  formatHistoryDisplayDate,
  historyDatetimeAttr,
  monthLabelFromDate,
} from "./news-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const template = fs.readFileSync(path.join(ROOT, "templates", "company.html"), "utf8");

const TIMELINE_ABOUT_LIMIT = 16;
const TIMELINE_NEWS_LIMIT = 24;
const FORMSUBMIT_INBOX = "newon@newon.app";

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
  return dir;
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function metaRefreshHtml(target, title = "Redirect") {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=${target}"/><link rel="canonical" href="${SITE_ORIGIN}${target}"/><meta name="robots" content="noindex"/><title>${escapeHtml(title)}</title></head><body><p><a href="${target}">Continue</a></p></body></html>\n`;
}

function langListJson() {
  return JSON.stringify(LANGS.map((l) => l.dir));
}

/** Root redirect preferring localStorage lang, default en. */
function writeRootLangRedirect(relPath, title = "Newon") {
  const list = langListJson();
  const targetPath = relPath.replace(/^\/+|\/+$/g, "");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/${targetPath}/"/><title>${escapeHtml(title)}</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/${targetPath}/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/${targetPath}/">${escapeHtml(title)}</a> · <a href="/ko/${targetPath}/">${escapeHtml(title)}</a></p></body></html>\n`;
  writeFile(path.join(ROOT, ...targetPath.split("/"), "index.html"), html);
}

function hreflangBlock(subpath) {
  const rel = String(subpath || "").replace(/^\/+|\/+$/g, "");
  const lines = LANGS.map(
    ({ dir, hreflang }) =>
      `    <link rel="alternate" hreflang="${hreflang}" href="${SITE_ORIGIN}/${dir}/${rel}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/${rel}/" />`);
  return lines.join("\n");
}

function historyEntryCopy(entry, lang) {
  const pack = entry.copy || {};
  return lang === "ko" ? pack.ko || pack.en || {} : pack.en || pack.ko || {};
}

function newsArticleCopy(article, lang) {
  const pack = article.copy || {};
  return pack[lang] || pack.en || pack.ko || {};
}

function isNonEmpty(val) {
  if (Array.isArray(val)) return val.some((x) => String(x || "").trim());
  return String(val || "").trim().length > 0;
}

/* ——— Shared chrome ——— */

function breadcrumb(copy, currentLabel, opts = {}) {
  const companyHref = opts.companyHref || "../";
  const mid = opts.mid
    ? `<span class="co-crumb__sep" aria-hidden="true">/</span><a href="${opts.midHref}">${escapeHtml(opts.mid)}</a>`
    : "";
  return `<nav class="co-crumb" aria-label="Breadcrumb">
    <div class="co-inner">
      <a href="${companyHref}">${escapeHtml(copy.crumbCompany || "COMPANY")}</a>
      ${mid}
      <span class="co-crumb__sep" aria-hidden="true">/</span>
      <span>${escapeHtml(currentLabel)}</span>
    </div>
  </nav>`;
}

function companySwitcher(_activeSlug, _lang, _base = "../") {
  return "";
}

function exploreFooter(copy, base = "../") {
  const title = escapeHtml(copy.exploreTitle || "MORE FROM COMPANY");
  const items = [
    { label: copy.exploreProducts || "Products", href: `${base}products/` },
    { label: copy.exploreBusiness || "Business", href: `${base}business/` },
    { label: copy.exploreResources || "Resources", href: `${base}resources/` },
  ];
  const grid = items
    .map(
      (it) => `<a class="co-explore__item" href="${it.href}">
      <span class="co-explore__name">${escapeHtml(it.label)}</span>
      <span class="co-explore__arrow" aria-hidden="true">→</span>
    </a>`
    )
    .join("");
  return `<section class="co-section co-explore" data-co-reveal aria-labelledby="co-explore-title">
    <div class="co-inner">
      <p class="co-eyebrow" id="co-explore-title">${title}</p>
      <div class="co-explore__grid">${grid}</div>
    </div>
  </section>`;
}

function heroBlock(copy, extraActions = "") {
  const actions = extraActions
    ? `<div class="co-hero__actions">${extraActions}</div>`
    : "";
  return `<section class="co-hero" data-co-reveal aria-labelledby="co-hero-title">
    <div class="co-inner">
      <p class="co-eyebrow">${escapeHtml(copy.eyebrow || "")}${
    copy.subEyebrow
      ? `<span class="co-eyebrow__sep" aria-hidden="true">·</span><span class="co-eyebrow__sub">${escapeHtml(copy.subEyebrow)}</span>`
      : ""
  }</p>
      <h1 class="co-title co-hero__title" id="co-hero-title">${brHeadline(copy.headline)}</h1>
      <p class="co-lead">${escapeHtml(copy.lead || "")}</p>
      ${actions}
    </div>
  </section>`;
}

/* ——— ABOUT ——— */

function aboutTimelineHtml(lang, copy) {
  const articles = publishedArticles();
  const entries = buildTimelineEntries(articles, {
    productBySlug,
    articleCopy,
    articleProductSlug,
  }).slice(0, TIMELINE_ABOUT_LIMIT);
  if (!entries.length) return "";

  const rows = entries
    .map((entry) => {
      const c = historyEntryCopy(entry, lang);
      const product = productBySlug(entry.product);
      const name = product ? product.name : entry.product || "Newon";
      const displayDate = formatHistoryDisplayDate(entry.date, entry.datePrecision);
      const datetime = historyDatetimeAttr(entry.date, entry.datePrecision);
      const newsHref = entry.newsSlug ? `../news/${entry.newsSlug}/` : "";
      const title = c.title || name;
      const titleHtml = newsHref
        ? `<a href="${escapeHtml(newsHref)}">${escapeHtml(title)}</a>`
        : escapeHtml(title);
      return `<li class="co-timeline__item">
        <time class="co-timeline__date" datetime="${escapeHtml(datetime)}">${escapeHtml(displayDate)}</time>
        <div class="co-timeline__body">
          <p class="co-timeline__product">${escapeHtml(name)}</p>
          <h3 class="co-timeline__title">${titleHtml}</h3>
          ${c.description ? `<p class="co-timeline__desc">${escapeHtml(c.description)}</p>` : ""}
        </div>
      </li>`;
    })
    .join("\n");

  return `<section class="co-section co-timeline" data-co-reveal aria-labelledby="co-timeline-title">
    <div class="co-inner">
      <p class="co-eyebrow">${escapeHtml(copy.timelineEyebrow || "TIMELINE")}</p>
      <h2 class="co-title" id="co-timeline-title">${escapeHtml(copy.timelineTitle || "")}</h2>
      ${copy.timelineNote ? `<p class="co-lead co-lead--tight">${escapeHtml(copy.timelineNote)}</p>` : ""}
      <ol class="co-timeline__list">${rows}</ol>
    </div>
  </section>`;
}

function aboutBody(copy, lang) {
  const indexItems = (copy.indexItems || [])
    .map(
      (it) => `<a class="co-index__item" href="${escapeHtml(it.href)}"><span>${escapeHtml(it.k)}</span><span aria-hidden="true">→</span></a>`
    )
    .join("");

  const buildItems = (copy.buildItems || [])
    .map(
      (it) => `<div class="co-build__item">
        <span class="co-build__n">${escapeHtml(it.n)}</span>
        <h3 class="co-build__title">${escapeHtml(it.title)}</h3>
        <p class="co-build__body">${escapeHtml(it.body)}</p>
      </div>`
    )
    .join("");

  const workSteps = (copy.workSteps || [])
    .map(
      (it) => `<li class="co-work__step">
        <span class="co-work__n">${escapeHtml(it.n)}</span>
        <div>
          <h3 class="co-work__title">${escapeHtml(it.title)}</h3>
          <p class="co-work__body">${escapeHtml(it.body)}</p>
        </div>
      </li>`
    )
    .join("");

  const principles = (copy.principles || [])
    .map(
      (it) => `<li class="co-principles__item">
        <span class="co-principles__n">${escapeHtml(it.n)}</span>
        <div>
          <h3 class="co-principles__title">${escapeHtml(it.title)}</h3>
          <p class="co-principles__body">${escapeHtml(it.body)}</p>
        </div>
      </li>`
    )
    .join("");

  const flow = (copy.systemFlow || [])
    .map((s, i) => {
      const sep =
        i < (copy.systemFlow || []).length - 1
          ? `<span class="co-system__arrow" aria-hidden="true">→</span>`
          : "";
      return `<span class="co-system__node">${escapeHtml(s)}</span>${sep}`;
    })
    .join("");

  const hubs = (copy.systemHubs || [])
    .map(
      (h) => `<a class="co-system__hub" href="${escapeHtml(h.href)}">${escapeHtml(h.title)}</a>`
    )
    .join("");

  const heroActions = `<a class="co-btn co-btn--primary" href="../products/">${escapeHtml(copy.ctaProducts || "")}</a>
      <a class="co-btn co-btn--ghost" href="../portfolio/">${escapeHtml(copy.ctaPortfolio || "")}</a>`;

  return `${breadcrumb(copy, COMPANY_NAV_LABELS.about[lang === "ko" ? "ko" : "en"] || "ABOUT", { companyHref: "./" })}
${companySwitcher("about", lang, "../")}
${heroBlock(copy, heroActions)}
<section class="co-section co-index" data-co-reveal aria-labelledby="co-index-title">
  <div class="co-inner">
    <h2 class="co-title" id="co-index-title">${escapeHtml(copy.indexTitle || "")}</h2>
    <div class="co-index__grid">${indexItems}</div>
  </div>
</section>
<section class="co-section co-build" data-co-reveal aria-labelledby="co-build-title">
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(copy.buildEyebrow || "")}</p>
    <h2 class="co-title" id="co-build-title">${brHeadline(copy.buildTitle)}</h2>
    <div class="co-build__grid">${buildItems}</div>
  </div>
</section>
<section class="co-section co-work" data-co-reveal aria-labelledby="co-work-title">
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(copy.workEyebrow || "")}</p>
    <h2 class="co-title" id="co-work-title">${escapeHtml(copy.workTitle || "")}</h2>
    <ol class="co-work__list">${workSteps}</ol>
  </div>
</section>
<section class="co-section co-principles" data-co-reveal aria-labelledby="co-principles-title">
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(copy.principlesEyebrow || "")}</p>
    <h2 class="co-title" id="co-principles-title">${escapeHtml(copy.principlesTitle || "")}</h2>
    <ul class="co-principles__list">${principles}</ul>
  </div>
</section>
<section class="co-section co-system" data-co-reveal aria-labelledby="co-system-title">
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(copy.systemEyebrow || "")}</p>
    <h2 class="co-title" id="co-system-title">${escapeHtml(copy.systemTitle || "")}</h2>
    <div class="co-system__flow" aria-hidden="true">${flow}</div>
    <div class="co-system__hubs">${hubs}</div>
  </div>
</section>
${aboutTimelineHtml(lang, copy)}
<section class="co-section co-vision" data-co-reveal aria-labelledby="co-vision-title">
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(copy.visionEyebrow || "")}</p>
    <h2 class="co-title" id="co-vision-title">${brHeadline(copy.visionTitle)}</h2>
    ${copy.visionEn ? `<p class="co-vision__en">${escapeHtml(copy.visionEn)}</p>` : ""}
    <div class="co-hero__actions">
      <a class="co-btn co-btn--primary" href="../portfolio/">${escapeHtml(copy.visionCtaPortfolio || "")}</a>
      <a class="co-btn co-btn--ghost" href="../contact/">${escapeHtml(copy.visionCtaContact || "")}</a>
    </div>
  </div>
</section>
${exploreFooter(copy, "../")}`;
}

function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Newon",
    url: "https://www.newon.app",
    email: "newon@newon.app",
    logo: "https://www.newon.app/logo.png",
  };
}

/* ——— PORTFOLIO ——— */

function portfolioProjectHref(project, lang) {
  if (project.pageHref) {
    const href = String(project.pageHref);
    if (href.startsWith("/")) return href;
    return href;
  }
  if (project.slug === "404-human") return `../404-human/`;
  return `./${project.slug}/`;
}

function portfolioFeaturedRow(project, copy, lang) {
  const href = portfolioProjectHref(project, lang);
  const icon = project.icon
    ? `<img class="co-feat__icon" src="${escapeHtml(project.icon)}" alt="" width="56" height="56" loading="lazy" decoding="async" />`
    : "";
  const tags = (project.tags || [])
    .map((t) => `<span class="co-tag">${escapeHtml(t)}</span>`)
    .join("");
  return `<a class="co-feat" href="${href}" data-co-filter-item data-co-cat="${escapeHtml(project.filter || "")}">
    <div class="co-feat__media">${icon}</div>
    <div class="co-feat__copy">
      <p class="co-feat__meta"><span>${escapeHtml(project.categoryLabel || "")}</span>${
    project.year ? `<span aria-hidden="true">·</span><span>${escapeHtml(project.year)}</span>` : ""
  }</p>
      <h3 class="co-feat__title">${escapeHtml(project.name)}</h3>
      <p class="co-feat__lead">${escapeHtml(project.oneLiner || project.summary || "")}</p>
      <div class="co-feat__tags">${tags}</div>
      <span class="co-feat__cta">${escapeHtml(copy.viewProject || "VIEW PROJECT →")}</span>
    </div>
  </a>`;
}

function portfolioIndexRow(project, copy, lang) {
  const href = portfolioProjectHref(project, lang);
  const icon = project.icon
    ? `<img class="co-plist__icon" src="${escapeHtml(project.icon)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`
    : "";
  return `<a class="co-plist__row" href="${href}" data-co-filter-item data-co-cat="${escapeHtml(project.filter || "")}">
    ${icon}
    <span class="co-plist__name">${escapeHtml(project.name)}</span>
    <span class="co-plist__cat">${escapeHtml(project.categoryLabel || "")}</span>
    <span class="co-plist__year">${escapeHtml(project.year || "")}</span>
    <span class="co-plist__go" aria-hidden="true">→</span>
  </a>`;
}

function portfolioBody(copy, lang) {
  const projects = getCompanyProjects(lang);
  const filters = getPortfolioFilters(projects);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  const filterBtns = filters
    .map((f) => {
      const label = f.id === "all" ? copy.filterAll || "ALL" : f.label;
      const active = f.id === "all" ? " is-active" : "";
      return `<button type="button" class="co-filter__btn${active}" data-co-filter="${escapeHtml(f.id)}">${escapeHtml(label)}</button>`;
    })
    .join("");

  const featuredHtml = featured.map((p) => portfolioFeaturedRow(p, copy, lang)).join("\n");
  const listHtml = rest.map((p) => portfolioIndexRow(p, copy, lang)).join("\n");

  return `${breadcrumb(copy, COMPANY_NAV_LABELS.portfolio[lang === "ko" ? "ko" : "en"] || "PORTFOLIO")}
${companySwitcher("portfolio", lang, "../")}
${heroBlock(copy)}
<section class="co-section co-portfolio" data-co-reveal>
  <div class="co-inner">
    <div class="co-filter" role="group" aria-label="Filter">${filterBtns}</div>
    <p class="co-filter__empty" data-co-filter-empty hidden>${escapeHtml(copy.emptyFilter || "")}</p>
    <div class="co-feat__list">${featuredHtml}</div>
    ${
      rest.length
        ? `<div class="co-plist" aria-label="Projects">${listHtml}</div>`
        : ""
    }
  </div>
</section>
${exploreFooter(copy, "../")}`;
}

function caseSectionHtml(key, label, content) {
  if (!isNonEmpty(content)) return "";
  let body = "";
  if (Array.isArray(content)) {
    body = `<ul class="co-case__list">${content
      .filter((x) => String(x || "").trim())
      .map((x) => `<li>${escapeHtml(x)}</li>`)
      .join("")}</ul>`;
  } else {
    body = `<p class="co-case__text">${escapeHtml(content)}</p>`;
  }
  return `<section class="co-case__block" data-co-reveal>
    <h2 class="co-case__heading">${escapeHtml(label)}</h2>
    ${body}
  </section>`;
}

function portfolioDetailBody(project, copy, lang, prev, next) {
  const cs = project.caseStudy || {};
  const sections = copy.caseSections || {};
  const metaBits = [
    project.categoryLabel
      ? `<div><dt>${escapeHtml(copy.metaCategory || "CATEGORY")}</dt><dd>${escapeHtml(project.categoryLabel)}</dd></div>`
      : "",
    project.year
      ? `<div><dt>${escapeHtml(copy.metaYear || "YEAR")}</dt><dd>${escapeHtml(project.year)}</dd></div>`
      : "",
    project.platform
      ? `<div><dt>${escapeHtml(copy.metaPlatform || "PLATFORM")}</dt><dd>${escapeHtml(project.platform)}</dd></div>`
      : "",
    project.status
      ? `<div><dt>${escapeHtml(copy.metaStatus || "STATUS")}</dt><dd>${escapeHtml(project.status)}</dd></div>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const storeLinks = [];
  if (project.appStoreUrl) {
    storeLinks.push(
      `<a class="co-btn co-btn--ghost" href="${escapeHtml(project.appStoreUrl)}" rel="noopener noreferrer" target="_blank">${escapeHtml(copy.appStore || "APP STORE →")}</a>`
    );
  }
  if (project.googlePlayUrl) {
    storeLinks.push(
      `<a class="co-btn co-btn--ghost" href="${escapeHtml(project.googlePlayUrl)}" rel="noopener noreferrer" target="_blank">${escapeHtml(copy.googlePlay || "GOOGLE PLAY →")}</a>`
    );
  }
  if (project.playHref) {
    storeLinks.push(
      `<a class="co-btn co-btn--primary" href="${escapeHtml(project.playHref)}">${escapeHtml(copy.playGame || "PLAY / VISIT →")}</a>`
    );
  }

  const caseBlocks = [
    caseSectionHtml("overview", sections.overview || "01 OVERVIEW", cs.overview),
    caseSectionHtml("idea", sections.idea || "02 THE IDEA", cs.idea),
    caseSectionHtml("problem", sections.problem || "03 THE PROBLEM", cs.problem),
    caseSectionHtml("product", sections.product || "04 PRODUCT", cs.product),
    caseSectionHtml("design", sections.design || "05 DESIGN", cs.design),
    caseSectionHtml("build", sections.build || "06 BUILD", cs.build),
    caseSectionHtml("launch", sections.launch || "07 LAUNCH", cs.launch),
    caseSectionHtml("learnings", sections.learnings || "08 LEARNINGS", cs.learnings),
    caseSectionHtml("next", sections.next || "09 NEXT", cs.next),
  ].join("\n");

  const icon = project.icon
    ? `<img class="co-detail__icon" src="${escapeHtml(project.icon)}" alt="" width="72" height="72" />`
    : "";

  const nav = `<nav class="co-pager" aria-label="Projects">
    <div class="co-inner co-pager__inner">
      ${
        prev
          ? `<a class="co-pager__link" href="../${escapeHtml(prev.slug)}/"><span class="co-pager__label">${escapeHtml(copy.prev || "PREVIOUS")}</span><span class="co-pager__name">${escapeHtml(prev.name)}</span></a>`
          : `<span></span>`
      }
      <a class="co-pager__back" href="../">${escapeHtml(copy.backPortfolio || "← Portfolio")}</a>
      ${
        next
          ? `<a class="co-pager__link co-pager__link--next" href="../${escapeHtml(next.slug)}/"><span class="co-pager__label">${escapeHtml(copy.next || "NEXT")}</span><span class="co-pager__name">${escapeHtml(next.name)}</span></a>`
          : `<span></span>`
      }
    </div>
  </nav>`;

  return `${breadcrumb(copy, project.name, {
    companyHref: "../../",
    mid: COMPANY_NAV_LABELS.portfolio[lang === "ko" ? "ko" : "en"] || "PORTFOLIO",
    midHref: "../",
  })}
${companySwitcher("portfolio", lang, "../../")}
<section class="co-hero co-hero--detail" data-co-reveal aria-labelledby="co-hero-title">
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(copy.caseEyebrow || "PROJECT")}</p>
    <div class="co-detail__head">
      ${icon}
      <div>
        <h1 class="co-title co-hero__title" id="co-hero-title">${escapeHtml(project.name)}</h1>
        <p class="co-lead">${escapeHtml(project.oneLiner || project.summary || "")}</p>
      </div>
    </div>
    ${metaBits ? `<dl class="co-meta">${metaBits}</dl>` : ""}
    ${storeLinks.length ? `<div class="co-hero__actions">${storeLinks.join("\n")}</div>` : ""}
  </div>
</section>
<div class="co-case">
  <div class="co-inner">${caseBlocks}</div>
</div>
${nav}
${exploreFooter(copy, "../../")}`;
}

/* ——— NEWS (newsroom — index body only) ——— */

const NR_FILTER_CATS = [
  { id: "all", labelKey: "filterAll" },
  { id: "launch", labelKey: "catLaunch" },
  { id: "update", labelKey: "catUpdate" },
  { id: "feature", labelKey: "catFeature" },
  { id: "company", labelKey: "catNewon" },
  { id: "notice", labelKey: "catNotice" },
];

function nrCatLabel(copy, category) {
  const map = {
    launch: copy.catLaunch || "PRODUCT LAUNCH",
    update: copy.catUpdate || "UPDATE",
    feature: copy.catFeature || "FEATURE",
    company: copy.catNewon || "NEWON",
    notice: copy.catNotice || "NOTICE",
  };
  return map[category] || (category || "").toUpperCase();
}

function nrNormalizeCat(category) {
  const c = String(category || "").toLowerCase();
  if (c === "launch" || c === "product_launch" || c === "product-launch") return "launch";
  if (c === "update") return "update";
  if (c === "feature") return "feature";
  if (c === "company" || c === "newon") return "company";
  if (c === "notice") return "notice";
  return c || "update";
}

function nrResolveImage(file, lang) {
  if (!file) return "";
  const candidates = [`i18n-img/${lang}/${file}`, `i18n-img/en/${file}`, `i18n-img/ko/${file}`];
  for (const c of candidates) {
    if (fs.existsSync(path.join(ROOT, c))) return "/" + c;
  }
  return "";
}

function newsCategoryFilters(copy) {
  return NR_FILTER_CATS.map((c, i) => {
    const active = i === 0 ? " is-active" : "";
    const aria = i === 0 ? ' aria-current="true"' : "";
    return `<button type="button" class="nr-tabs__btn${active}" data-nr-filter="${escapeHtml(c.id)}"${aria}>${escapeHtml(copy[c.labelKey] || c.id.toUpperCase())}</button>`;
  }).join("\n      ");
}

function newsProductHref(product, lang) {
  if (!product) return "";
  if (product.pageHref) {
    return String(product.pageHref).replace(/\{\{LANG\}\}/g, lang || "en");
  }
  return `../portfolio/${product.slug}/`;
}

function newsLogoMark(product, size = 48, extraClass = "") {
  if (!product || !product.icon) return "";
  const cls = ["nr-logo", extraClass].filter(Boolean).join(" ");
  return `<img class="${cls}" src="${escapeHtml(product.icon)}" alt="${escapeHtml(product.name)}" width="${size}" height="${size}" loading="lazy" decoding="async" />`;
}

function newsProductsInLaunchOrder() {
  const bySlug = Object.fromEntries(NEWS_PRODUCTS.map((p) => [p.slug, p]));
  const ordered = [];
  const seen = new Set();
  for (const slug of NEWS_LAUNCH_ORDER) {
    if (bySlug[slug]) {
      ordered.push(bySlug[slug]);
      seen.add(slug);
    }
  }
  for (const p of NEWS_PRODUCTS) {
    if (!seen.has(p.slug)) ordered.push(p);
  }
  return ordered;
}

function newsAppsLogoList(lang, { labeled = true } = {}) {
  return newsProductsInLaunchOrder()
    .map((raw) => {
      const product = productBySlug(raw.slug);
      if (!product || !product.icon) return "";
      const href = newsProductHref(product, lang);
      const name = labeled
        ? `<span class="nr-apps__name">${escapeHtml(product.name)}</span>`
        : `<span class="visually-hidden">${escapeHtml(product.name)}</span>`;
      const inner = `${newsLogoMark(product, labeled ? 56 : 44, labeled ? "nr-apps__logo" : "nr-hero__app-logo")}${name}`;
      if (href) {
        return `<li class="nr-apps__item"><a class="nr-apps__link" href="${escapeHtml(href)}">${inner}</a></li>`;
      }
      return `<li class="nr-apps__item"><span class="nr-apps__link">${inner}</span></li>`;
    })
    .filter(Boolean)
    .join("\n");
}

function newsAppsSection(lang, copy) {
  const products = newsProductsInLaunchOrder();
  const items = products
    .map((raw, i) => {
      const product = productBySlug(raw.slug);
      if (!product || !product.icon) return "";
      const href = newsProductHref(product, lang);
      const n = String(i + 1).padStart(2, "0");
      const inner = `<span class="nr-apps__n" aria-hidden="true">${n}</span>
        ${newsLogoMark(product, 52, "nr-apps__logo")}
        <span class="nr-apps__name">${escapeHtml(product.name)}</span>`;
      if (href) {
        return `<li class="nr-apps__item"><a class="nr-apps__link" href="${escapeHtml(href)}">${inner}</a></li>`;
      }
      return `<li class="nr-apps__item"><span class="nr-apps__link">${inner}</span></li>`;
    })
    .filter(Boolean)
    .join("\n");
  if (!items) return "";
  const lead = copy.appsLead ? `<p class="nr-section-lead">${escapeHtml(copy.appsLead)}</p>` : "";
  return `<section class="nr-apps" aria-labelledby="nr-apps-title">
    <div class="nr-inner">
      <p class="nr-kicker">${escapeHtml(copy.appsEyebrow || "2026 LINEUP")}</p>
      <h2 class="nr-section-title" id="nr-apps-title">${escapeHtml(copy.appsTitle || "")}</h2>
      ${lead}
      <ol class="nr-apps__grid">${items}</ol>
    </div>
  </section>`;
}

function newsFeaturedBlock(article, copy, lang) {
  if (!article) return "";
  const c = newsArticleCopy(article, lang);
  const cat = nrNormalizeCat(article.category);
  const product = productBySlug(articleProductSlug(article));
  const href = `./${escapeHtml(article.slug)}/`;
  const logo = product && product.icon ? product.icon : "";

  // News index: logos only — never app screenshots.
  const visual = logo
    ? `<div class="nr-latest__visual nr-latest__visual--logo">
        <img class="nr-latest__logo" src="${escapeHtml(logo)}" alt="${escapeHtml(product.name)}" width="140" height="140" loading="lazy" decoding="async" />
        <p class="nr-latest__product">${escapeHtml(product.name)}</p>
      </div>`
    : `<div class="nr-latest__visual nr-latest__visual--type" aria-hidden="true">
        <p class="nr-latest__type-mark">${escapeHtml(nrCatLabel(copy, cat))}</p>
      </div>`;

  const productChip = product
    ? `<span class="nr-latest__chip">${newsLogoMark(product, 22, "nr-latest__chip-logo")}<span>${escapeHtml(product.name)}</span></span>`
    : "";

  return `<section class="nr-latest" aria-labelledby="nr-latest-title" data-nr-item data-nr-cat="${escapeHtml(cat)}">
    <div class="nr-inner">
      <p class="nr-kicker">${escapeHtml(copy.latestFrom || copy.latestLabel || "LATEST")}</p>
      <a class="nr-latest__link" href="${href}">
        <div class="nr-latest__grid">
          <div class="nr-latest__copy">
            <p class="nr-latest__meta">
              ${productChip}
              <span>${escapeHtml(nrCatLabel(copy, cat))}</span>
              <span aria-hidden="true">·</span>
              <time datetime="${escapeHtml(article.date)}">${escapeHtml(formatNewsDate(article.date))}</time>
            </p>
            <h2 class="nr-latest__title" id="nr-latest-title">${escapeHtml(c.title || "")}</h2>
            <p class="nr-latest__desc">${escapeHtml(c.summary || c.lead || "")}</p>
            <span class="nr-latest__cta">${escapeHtml(copy.readUpdate || "READ UPDATE →")}</span>
          </div>
          ${visual}
        </div>
      </a>
    </div>
  </section>`;
}

function newsArchiveRow(article, copy, lang) {
  const c = newsArticleCopy(article, lang);
  const cat = nrNormalizeCat(article.category);
  const product = productBySlug(articleProductSlug(article));
  const href = `./${escapeHtml(article.slug)}/`;
  const logo = product
    ? `<span class="nr-row__logo-wrap">${newsLogoMark(product, 48, "nr-row__logo")}</span>`
    : `<span class="nr-row__logo-wrap nr-row__logo-wrap--empty" aria-hidden="true"></span>`;
  return `<a class="nr-row" href="${href}" data-nr-item data-nr-cat="${escapeHtml(cat)}">
    ${logo}
    <div class="nr-row__meta">
      <time datetime="${escapeHtml(article.date)}">${escapeHtml(formatNewsDate(article.date))}</time>
      <span class="nr-row__cat">${escapeHtml(nrCatLabel(copy, cat))}</span>
      ${product ? `<span class="nr-row__app">${escapeHtml(product.name)}</span>` : ""}
    </div>
    <div class="nr-row__body">
      <h3 class="nr-row__title">${escapeHtml(c.title || "")}</h3>
      <p class="nr-row__desc">${escapeHtml(c.summary || c.lead || "")}</p>
    </div>
    <span class="nr-row__go" aria-hidden="true">→</span>
  </a>`;
}

function newsTimelineTypeKind(type) {
  if (type === "update" || type === "feature") return "expand";
  return "launch";
}

function newsTimelineTypeLabel(copy, entry) {
  const t = entry.type || "";
  if (t === "update") return copy.tlTypeUpdate || "UPDATE";
  if (t === "feature") return copy.tlTypeFeature || "FEATURE";
  if (t === "project") return copy.tlTypeProject || "PROJECT";
  if (t === "launch") return copy.tlTypeLaunch || "LAUNCH";
  if (t === "product") return copy.tlTypeProduct || "APP";
  return copy.tlTypeMilestone || "MILESTONE";
}

function newsTimelineDateLabel(entry) {
  if (entry.datePrecision === "day") {
    return formatNewsDate(entry.date) || formatHistoryDisplayDate(entry.date, entry.datePrecision);
  }
  if (entry.datePrecision === "month") {
    return (
      monthLabelFromDate(entry.date.length === 7 ? `${entry.date}-01` : entry.date) ||
      formatHistoryDisplayDate(entry.date, entry.datePrecision)
    );
  }
  return "";
}

function newsTimelineLaunchRow(entry, lang, copy, index) {
  const product = productBySlug(entry.product);
  const name = product ? product.name : entry.product || "Newon";
  const c = historyEntryCopy(entry, lang);
  const short = c.title && c.title !== name ? c.title : c.description || "";
  const productHref = product
    ? newsProductHref(product, lang)
    : entry.productUrl
      ? String(entry.productUrl).replace(/\{\{LANG\}\}/g, lang || "en")
      : "";
  const logo = product
    ? newsLogoMark(product, 48, "nr-rec__logo")
    : entry.icon
      ? `<img class="nr-logo nr-rec__logo" src="${escapeHtml(entry.icon)}" alt="${escapeHtml(name)}" width="48" height="48" loading="lazy" decoding="async" />`
      : `<span class="nr-rec__logo nr-rec__logo--empty" aria-hidden="true"></span>`;
  const n = String(index + 1).padStart(2, "0");
  const type = newsTimelineTypeLabel(copy, entry);
  const title = productHref
    ? `<a class="nr-rec__name" href="${escapeHtml(productHref)}">${escapeHtml(name)}</a>`
    : `<span class="nr-rec__name">${escapeHtml(name)}</span>`;
  return `<li class="nr-rec__row nr-rec__row--launch">
    <span class="nr-rec__n" aria-hidden="true">${n}</span>
    ${logo}
    <div class="nr-rec__text">
      <p class="nr-rec__meta"><span class="nr-rec__type">${escapeHtml(type)}</span></p>
      ${title}
      ${short ? `<p class="nr-rec__short">${escapeHtml(short)}</p>` : ""}
    </div>
  </li>`;
}

function newsTimelineExpandRow(entry, lang, copy) {
  const product = productBySlug(entry.product);
  const name = product ? product.name : entry.product || "Newon";
  const c = historyEntryCopy(entry, lang);
  const short = c.title || "";
  const desc = c.description && c.description !== short ? c.description : "";
  const dateLabel = newsTimelineDateLabel(entry);
  const newsHref = entry.newsSlug ? `./${entry.newsSlug}/` : "";
  const productHref = product ? newsProductHref(product, lang) : "";
  const logo = product
    ? newsLogoMark(product, 40, "nr-rec__logo")
    : `<span class="nr-rec__logo nr-rec__logo--empty" aria-hidden="true"></span>`;
  const type = newsTimelineTypeLabel(copy, entry);
  const titleInner = escapeHtml(short || name);
  const title = newsHref
    ? `<a class="nr-rec__name" href="${escapeHtml(newsHref)}">${titleInner}</a>`
    : productHref
      ? `<a class="nr-rec__name" href="${escapeHtml(productHref)}">${titleInner}</a>`
      : `<span class="nr-rec__name">${titleInner}</span>`;
  return `<li class="nr-rec__row nr-rec__row--expand">
    <time class="nr-rec__date" datetime="${escapeHtml(historyDatetimeAttr(entry.date, entry.datePrecision))}">${escapeHtml(dateLabel || "—")}</time>
    ${logo}
    <div class="nr-rec__text">
      <p class="nr-rec__meta">
        <span class="nr-rec__type">${escapeHtml(type)}</span>
        ${product ? `<span class="nr-rec__app">${escapeHtml(name)}</span>` : ""}
      </p>
      ${title}
      ${desc ? `<p class="nr-rec__short">${escapeHtml(desc)}</p>` : ""}
    </div>
    ${newsHref ? `<span class="nr-rec__go" aria-hidden="true">→</span>` : ""}
  </li>`;
}

function newsTimelineSection(lang, copy) {
  const entries = buildTimelineEntries(publishedArticles(), {
    productBySlug,
    articleCopy,
    articleProductSlug,
  }).slice(0, TIMELINE_NEWS_LIMIT);
  if (!entries.length) return "";

  const byYear = new Map();
  for (const entry of entries) {
    const year = String(entry.date || "").slice(0, 4) || "0000";
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(entry);
  }

  const launchIndex = Object.fromEntries(NEWS_LAUNCH_ORDER.map((s, i) => [s, i]));
  const yearBlocks = [...byYear.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
    .map(([year, yearEntries]) => {
      const launches = yearEntries
        .filter((e) => newsTimelineTypeKind(e.type) === "launch")
        .sort((a, b) => {
          const ai = launchIndex[a.product] ?? 999;
          const bi = launchIndex[b.product] ?? 999;
          if (ai !== bi) return ai - bi;
          return String(a.id).localeCompare(String(b.id));
        });
      const expands = yearEntries
        .filter((e) => newsTimelineTypeKind(e.type) === "expand")
        .sort((a, b) => {
          if (a.sortKey < b.sortKey) return 1;
          if (a.sortKey > b.sortKey) return -1;
          return 0;
        });

      const launchList = launches.length
        ? `<div class="nr-rec__block">
            <div class="nr-rec__block-head">
              <p class="nr-rec__block-k">${escapeHtml(copy.timelineLaunch || "APP LAUNCH")}</p>
              ${copy.timelineLaunchLead ? `<p class="nr-rec__block-lead">${escapeHtml(copy.timelineLaunchLead)}</p>` : ""}
            </div>
            <ol class="nr-rec__list nr-rec__list--launch">${launches
              .map((e, i) => newsTimelineLaunchRow(e, lang, copy, i))
              .join("\n")}</ol>
          </div>`
        : "";

      const expandList = expands.length
        ? `<div class="nr-rec__block">
            <div class="nr-rec__block-head">
              <p class="nr-rec__block-k">${escapeHtml(copy.timelineExpand || "PRODUCT EXPANSION")}</p>
              ${copy.timelineExpandLead ? `<p class="nr-rec__block-lead">${escapeHtml(copy.timelineExpandLead)}</p>` : ""}
            </div>
            <ol class="nr-rec__list nr-rec__list--expand">${expands
              .map((e) => newsTimelineExpandRow(e, lang, copy))
              .join("\n")}</ol>
          </div>`
        : "";

      return `<div class="nr-rec__year-block">
        <p class="nr-rec__year">${escapeHtml(year)}</p>
        ${launchList}
        ${expandList}
      </div>`;
    })
    .join("\n");

  const lead = copy.timelineLead ? `<p class="nr-section-lead">${escapeHtml(copy.timelineLead)}</p>` : "";

  return `<section class="nr-timeline nr-rec" aria-labelledby="nr-timeline-title">
    <div class="nr-inner">
      <p class="nr-kicker">${escapeHtml(copy.timelineEyebrow || "TIMELINE")}</p>
      <h2 class="nr-section-title" id="nr-timeline-title">${escapeHtml(copy.timelineTitle || "")}</h2>
      ${lead}
      <div class="nr-rec__years">${yearBlocks}</div>
    </div>
  </section>`;
}

function newsExploreSection(copy, base = "../") {
  const links = [
    { label: copy.exploreAbout || "ABOUT", desc: copy.exploreAboutDesc || "", href: `${base}about/` },
    { label: copy.explorePortfolio || "PORTFOLIO", desc: copy.explorePortfolioDesc || "", href: `${base}portfolio/` },
    { label: copy.exploreMedia || "MEDIA", desc: copy.exploreMediaDesc || "", href: `${base}media/` },
    { label: copy.exploreContact || "CONTACT", desc: copy.exploreContactDesc || "", href: `${base}contact/` },
  ];
  const items = links
    .map(
      (it) => `<a class="nr-explore__link" href="${escapeHtml(it.href)}">
      <span class="nr-explore__label">${escapeHtml(it.label)}</span>
      <span class="nr-explore__desc">${escapeHtml(it.desc)}</span>
      <span class="nr-explore__arrow" aria-hidden="true">→</span>
    </a>`
    )
    .join("\n      ");
  return `<section class="nr-explore" aria-labelledby="nr-explore-title">
    <div class="nr-inner">
      <p class="nr-kicker" id="nr-explore-title">${escapeHtml(copy.exploreEyebrow || "EXPLORE NEWON")}</p>
      <div class="nr-explore__grid">${items}</div>
    </div>
  </section>`;
}

function newsFinalCta(copy, base = "../") {
  return `<section class="nr-cta" aria-labelledby="nr-cta-title">
    <div class="nr-inner">
      <p class="nr-cta__brand">${escapeHtml(copy.ctaBrand || "NEWON")}</p>
      <h2 class="nr-cta__title" id="nr-cta-title">${brHeadline(copy.ctaTitle || "")}</h2>
      <p class="nr-cta__lead">${escapeHtml(copy.ctaLead || "")}</p>
      <div class="nr-cta__actions">
        <a class="nr-cta__btn nr-cta__btn--primary" href="${base}products/">${escapeHtml(copy.ctaProducts || "EXPLORE PRODUCTS →")}</a>
        <a class="nr-cta__btn" href="${base}portfolio/">${escapeHtml(copy.ctaPortfolio || "VIEW PORTFOLIO →")}</a>
      </div>
    </div>
  </section>`;
}

function newsBody(copy, lang) {
  const articles = publishedArticles();
  const featured = articles.find((a) => a.featured) || articles[0] || null;
  const rest = featured ? articles.filter((a) => a.slug !== featured.slug) : articles;

  const sub =
    copy.headlineKo
      ? `<p class="nr-hero__sub">${brHeadline(copy.headlineKo)}</p>`
      : "";

  const hero = `<section class="nr-hero" aria-labelledby="nr-hero-title">
    <div class="nr-inner">
      <div class="nr-hero__copy">
        <p class="nr-kicker">${escapeHtml(copy.eyebrow || "NEWON NEWS")}</p>
        <h1 class="nr-hero__title" id="nr-hero-title">${escapeHtml(copy.headline || "News & Updates")}</h1>
        ${sub}
        <p class="nr-hero__lead">${escapeHtml(copy.lead || "")}</p>
      </div>
      <p class="nr-hero__tags" aria-hidden="true">
        <span>${escapeHtml(copy.heroMeta || "PRODUCT LAUNCH · UPDATE · FEATURE")}</span>
      </p>
    </div>
  </section>`;

  const archive =
    rest.length > 0
      ? `<section class="nr-archive" aria-labelledby="nr-archive-title">
    <div class="nr-inner">
      <p class="nr-kicker">${escapeHtml(copy.archiveLabel || "NEWS ARCHIVE")}</p>
      <h2 class="nr-section-title" id="nr-archive-title">${escapeHtml(copy.archiveTitle || "All Updates")}</h2>
      <div class="nr-archive__list" data-nr-archive>
        ${rest.map((a) => newsArchiveRow(a, copy, lang)).join("\n        ")}
      </div>
    </div>
  </section>`
      : `<div class="nr-archive nr-archive--empty-slot" data-nr-archive-slot hidden>
    <div class="nr-inner">
      <div class="nr-archive__list" data-nr-archive></div>
    </div>
  </div>`;

  const emptyAll =
    articles.length === 0
      ? `<p class="nr-empty nr-empty--all">${escapeHtml(copy.empty || "")}</p>`
      : "";

  return `${companySwitcher("news", lang, "../")}
<div class="nr-room" data-nr-hub>
${hero}
${featured ? newsFeaturedBlock(featured, copy, lang) : emptyAll}
<section class="nr-filters" aria-label="${escapeHtml(copy.filterAria || "Categories")}">
  <div class="nr-inner">
    <div class="nr-tabs" role="tablist">
      ${newsCategoryFilters(copy)}
    </div>
    <p class="nr-empty" data-nr-empty hidden>${escapeHtml(copy.emptyFilter || "")}</p>
  </div>
</section>
${archive}
${newsTimelineSection(lang, copy)}
${newsAppsSection(lang, copy)}
${newsExploreSection(copy, "../")}
${newsFinalCta(copy, "../")}
</div>`;
}

function newsDetailBody(article, copy, lang, prev, next) {
  const c = newsArticleCopy(article, lang);
  const paragraphs = (c.paragraphs || [])
    .map((p) => `<p class="co-article__p">${escapeHtml(p)}</p>`)
    .join("\n");
  const whatsNew = (c.whatsNew || [])
    .map(
      (w) => `<li class="co-article__new">
        <h3 class="co-article__new-title">${escapeHtml(w.title || "")}</h3>
        <p>${escapeHtml(w.body || "")}</p>
      </li>`
    )
    .join("");

  const nav = `<nav class="co-pager" aria-label="News">
    <div class="co-inner co-pager__inner">
      ${
        prev
          ? `<a class="co-pager__link" href="../${escapeHtml(prev.slug)}/"><span class="co-pager__label">${escapeHtml(copy.prev || "PREVIOUS")}</span><span class="co-pager__name">${escapeHtml(newsArticleCopy(prev, lang).title || prev.slug)}</span></a>`
          : `<span></span>`
      }
      <a class="co-pager__back" href="../">${escapeHtml(copy.backNews || "← News")}</a>
      ${
        next
          ? `<a class="co-pager__link co-pager__link--next" href="../${escapeHtml(next.slug)}/"><span class="co-pager__label">${escapeHtml(copy.next || "NEXT")}</span><span class="co-pager__name">${escapeHtml(newsArticleCopy(next, lang).title || next.slug)}</span></a>`
          : `<span></span>`
      }
    </div>
  </nav>`;

  return `${breadcrumb(copy, c.title || article.slug, {
    companyHref: "../../",
    mid: COMPANY_NAV_LABELS.news[lang === "ko" ? "ko" : "en"] || "NEWS",
    midHref: "../",
  })}
${companySwitcher("news", lang, "../../")}
<article class="co-article" data-co-reveal>
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(nrCatLabel(copy, nrNormalizeCat(article.category)))}</p>
    <h1 class="co-title co-hero__title" id="co-hero-title">${escapeHtml(c.title || "")}</h1>
    <p class="co-article__meta">
      <time datetime="${escapeHtml(article.date)}">${escapeHtml(formatNewsDate(article.date))}</time>
    </p>
    ${c.lead ? `<p class="co-lead">${escapeHtml(c.lead)}</p>` : ""}
    <div class="co-article__body">${paragraphs}</div>
    ${
      whatsNew
        ? `<section class="co-article__whats" aria-label="What's new"><ul class="co-article__whats-list">${whatsNew}</ul></section>`
        : ""
    }
  </div>
</article>
${nav}
${exploreFooter(copy, "../../")}`;
}

function articleJsonLd(article, lang, canonical) {
  const c = newsArticleCopy(article, lang);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: c.title || article.slug,
    description: c.summary || c.lead || "",
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: canonical,
    author: { "@type": "Organization", name: "Newon" },
    publisher: {
      "@type": "Organization",
      name: "Newon",
      logo: { "@type": "ImageObject", url: "https://www.newon.app/logo.png" },
    },
  };
}

/* ——— IDEA ——— */

function ideaBody(copy, lang) {
  const howSteps = (copy.howSteps || [])
    .map(
      (s) => `<li class="co-how__step">
        <span class="co-how__n">${escapeHtml(s.n)}</span>
        <div>
          <h3 class="co-how__title">${escapeHtml(s.title)}</h3>
          <p>${escapeHtml(s.body)}</p>
        </div>
      </li>`
    )
    .join("");

  const audience = (copy.audience || [])
    .map(
      (a) => `<label class="co-chip"><input type="checkbox" name="audience" value="${escapeHtml(a)}" /> <span>${escapeHtml(a)}</span></label>`
    )
    .join("");

  const forms = (copy.forms || [])
    .map(
      (f) => `<label class="co-chip"><input type="radio" name="product_form" value="${escapeHtml(f)}" /> <span>${escapeHtml(f)}</span></label>`
    )
    .join("");

  const legalItems = (copy.legalItems || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const heroActions = `<a class="co-btn co-btn--primary" href="#co-idea-form">${escapeHtml(copy.ctaForm || "")}</a>`;

  return `${breadcrumb(copy, COMPANY_NAV_LABELS.idea[lang === "ko" ? "ko" : "en"] || "IDEA")}
${companySwitcher("idea", lang, "../")}
${heroBlock(copy, heroActions)}
<section class="co-section co-how" data-co-reveal aria-labelledby="co-how-title">
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(copy.howEyebrow || "")}</p>
    <h2 class="co-title" id="co-how-title">${escapeHtml(copy.howTitle || "")}</h2>
    <ol class="co-how__list">${howSteps}</ol>
  </div>
</section>
<section class="co-section co-form-sec" data-co-reveal aria-labelledby="co-form-title">
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(copy.formEyebrow || "")}</p>
    <h2 class="co-title" id="co-form-title">${escapeHtml(copy.formTitle || "")}</h2>
    <form id="co-idea-form" class="co-form" data-co-idea-form novalidate>
      <input type="hidden" name="_subject" value="Newon Idea" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="text" name="_honey" class="co-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />

      <fieldset class="co-form__step">
        <legend>${escapeHtml(copy.step1 || "")}</legend>
        <label class="co-label" for="co-idea-title">${escapeHtml(copy.titleLabel || "")}</label>
        <input class="co-input" id="co-idea-title" name="title" type="text" required maxlength="200" placeholder="${escapeHtml(copy.titlePh || "")}" />
      </fieldset>

      <fieldset class="co-form__step">
        <legend>${escapeHtml(copy.step2 || "")}</legend>
        <label class="co-label visually-hidden" for="co-idea-problem">${escapeHtml(copy.step2 || "")}</label>
        <textarea class="co-input co-textarea" id="co-idea-problem" name="problem" rows="5" required maxlength="4000" placeholder="${escapeHtml(copy.problemPh || "")}"></textarea>
      </fieldset>

      <fieldset class="co-form__step">
        <legend>${escapeHtml(copy.step3 || "")}</legend>
        <div class="co-chip-row">${audience}</div>
      </fieldset>

      <fieldset class="co-form__step">
        <legend>${escapeHtml(copy.step4 || "")}</legend>
        <div class="co-chip-row">${forms}</div>
      </fieldset>

      <fieldset class="co-form__step">
        <legend>${escapeHtml(copy.step5 || "")}</legend>
        <label class="co-label visually-hidden" for="co-idea-more">${escapeHtml(copy.step5 || "")}</label>
        <textarea class="co-input co-textarea" id="co-idea-more" name="more" rows="4" maxlength="4000" placeholder="${escapeHtml(copy.morePh || "")}"></textarea>
      </fieldset>

      <fieldset class="co-form__step">
        <legend>${escapeHtml(copy.step6 || "")}</legend>
        <label class="co-label visually-hidden" for="co-idea-link">${escapeHtml(copy.step6 || "")}</label>
        <input class="co-input" id="co-idea-link" name="link" type="url" inputmode="url" placeholder="${escapeHtml(copy.linkPh || "https://")}" />
      </fieldset>

      <fieldset class="co-form__step">
        <legend>${escapeHtml(copy.step7 || "")}</legend>
        <label class="co-label visually-hidden" for="co-idea-email">${escapeHtml(copy.step7 || "")}</label>
        <input class="co-input" id="co-idea-email" name="email" type="email" autocomplete="email" placeholder="${escapeHtml(copy.emailPh || "")}" />
        ${copy.emailHint ? `<p class="co-hint">${escapeHtml(copy.emailHint)}</p>` : ""}
      </fieldset>

      <div class="co-legal">
        <h3 class="co-legal__title">${escapeHtml(copy.legalTitle || "")}</h3>
        <ul class="co-legal__list">${legalItems}</ul>
        <label class="co-check">
          <input type="checkbox" name="legal" value="yes" required />
          <span>${escapeHtml(copy.legalCheck || "")}</span>
        </label>
      </div>

      <p class="co-form__error" data-co-form-error hidden role="alert"></p>
      <button type="submit" class="co-btn co-btn--primary" data-co-submit>${escapeHtml(copy.submit || "")}</button>
      <div class="co-form__success" data-co-form-success hidden>
        <h3 class="co-form__success-title">${escapeHtml(copy.successTitle || "")}</h3>
        <p>${escapeHtml(copy.successBody || "")}</p>
      </div>
    </form>
  </div>
</section>
${exploreFooter(copy, "../")}`;
}

/* ——— CONTACT ——— */

function contactBody(copy, lang) {
  const types = (copy.types || [])
    .map(
      (t, i) => `<button type="button" class="co-type${i === 0 ? " is-active" : ""}" data-co-type="${escapeHtml(t.id)}" aria-pressed="${i === 0 ? "true" : "false"}">
        <span class="co-type__title">${escapeHtml(t.title)}</span>
        <span class="co-type__body">${escapeHtml(t.body)}</span>
      </button>`
    )
    .join("");

  const projectKinds = (copy.projectKinds || [])
    .map((k) => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`)
    .join("");
  const timelines = (copy.timelines || [])
    .map((k) => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`)
    .join("");

  return `${breadcrumb(copy, COMPANY_NAV_LABELS.contact[lang === "ko" ? "ko" : "en"] || "CONTACT")}
${companySwitcher("contact", lang, "../")}
${heroBlock(copy)}
<section class="co-section co-types" data-co-reveal aria-labelledby="co-type-title">
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(copy.typeEyebrow || "")}</p>
    <h2 class="co-title" id="co-type-title">${escapeHtml(copy.typeTitle || "")}</h2>
    <div class="co-type__grid" role="group" aria-label="Contact type">${types}</div>
  </div>
</section>
<section class="co-section co-form-sec" data-co-reveal aria-labelledby="co-form-title">
  <div class="co-inner">
    <p class="co-eyebrow">${escapeHtml(copy.formEyebrow || "")}</p>
    <h2 class="co-title" id="co-form-title">${escapeHtml(copy.formTitle || "")}</h2>
    <form id="co-contact-form" class="co-form" data-co-contact-form novalidate>
      <input type="hidden" name="_subject" value="Newon Contact" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="contact_type" id="co-contact-type" value="project" />
      <input type="text" name="_honey" class="co-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />

      <div class="co-form__row">
        <div class="co-field">
          <label class="co-label" for="co-contact-name">${escapeHtml(copy.nameLabel || "")}</label>
          <input class="co-input" id="co-contact-name" name="name" type="text" required autocomplete="name" maxlength="120" />
        </div>
        <div class="co-field">
          <label class="co-label" for="co-contact-email">${escapeHtml(copy.emailLabel || "")}</label>
          <input class="co-input" id="co-contact-email" name="email" type="email" required autocomplete="email" />
        </div>
      </div>

      <div class="co-field">
        <label class="co-label" for="co-contact-company">${escapeHtml(copy.companyLabel || "")}</label>
        <input class="co-input" id="co-contact-company" name="company" type="text" autocomplete="organization" maxlength="160" />
      </div>

      <div class="co-field">
        <label class="co-label" for="co-contact-subject">${escapeHtml(copy.subjectLabel || "")}</label>
        <input class="co-input" id="co-contact-subject" name="subject" type="text" required maxlength="200" />
      </div>

      <div class="co-field">
        <label class="co-label" for="co-contact-message">${escapeHtml(copy.messageLabel || "")}</label>
        <textarea class="co-input co-textarea" id="co-contact-message" name="message" rows="6" required maxlength="5000"></textarea>
      </div>

      <div class="co-field">
        <label class="co-label" for="co-contact-url">${escapeHtml(copy.urlLabel || "")}</label>
        <input class="co-input" id="co-contact-url" name="url" type="url" inputmode="url" placeholder="https://" />
      </div>

      <div class="co-when" data-co-when="project">
        <div class="co-form__row">
          <div class="co-field">
            <label class="co-label" for="co-project-kind">${escapeHtml(copy.projectKindLabel || "")}</label>
            <select class="co-input" id="co-project-kind" name="project_kind">
              <option value="">—</option>${projectKinds}
            </select>
          </div>
          <div class="co-field">
            <label class="co-label" for="co-timeline">${escapeHtml(copy.timelineLabel || "")}</label>
            <select class="co-input" id="co-timeline" name="timeline">
              <option value="">—</option>${timelines}
            </select>
          </div>
        </div>
      </div>

      <div class="co-when" data-co-when="partnership" hidden>
        <div class="co-form__row">
          <div class="co-field">
            <label class="co-label" for="co-brand">${escapeHtml(copy.brandLabel || "")}</label>
            <input class="co-input" id="co-brand" name="brand" type="text" maxlength="160" />
          </div>
          <div class="co-field">
            <label class="co-label" for="co-collab">${escapeHtml(copy.collabLabel || "")}</label>
            <input class="co-input" id="co-collab" name="collab_type" type="text" maxlength="160" />
          </div>
        </div>
      </div>

      <div class="co-when" data-co-when="media" hidden>
        <div class="co-field">
          <label class="co-label" for="co-media-name">${escapeHtml(copy.mediaNameLabel || "")}</label>
          <input class="co-input" id="co-media-name" name="media_name" type="text" maxlength="160" />
        </div>
        <div class="co-field">
          <label class="co-label" for="co-media-request">${escapeHtml(copy.mediaRequestLabel || "")}</label>
          <input class="co-input" id="co-media-request" name="media_request" type="text" maxlength="200" />
        </div>
        <div class="co-field">
          <label class="co-label" for="co-media-date">${escapeHtml(copy.mediaDateLabel || "")}</label>
          <input class="co-input" id="co-media-date" name="media_date" type="text" maxlength="120" />
        </div>
      </div>

      <div class="co-when" data-co-when="support" hidden>
        <div class="co-form__row">
          <div class="co-field">
            <label class="co-label" for="co-product">${escapeHtml(copy.productLabel || "")}</label>
            <input class="co-input" id="co-product" name="product" type="text" maxlength="120" />
          </div>
          <div class="co-field">
            <label class="co-label" for="co-issue">${escapeHtml(copy.issueLabel || "")}</label>
            <input class="co-input" id="co-issue" name="issue_type" type="text" maxlength="160" />
          </div>
        </div>
      </div>

      <p class="co-form__error" data-co-form-error hidden role="alert"></p>
      <button type="submit" class="co-btn co-btn--primary" data-co-submit>${escapeHtml(copy.submit || "")}</button>
      <div class="co-form__success" data-co-form-success hidden>
        <h3 class="co-form__success-title">${escapeHtml(copy.successTitle || "")}</h3>
        <p>${escapeHtml(copy.successBody || "")}</p>
      </div>
    </form>

    <aside class="co-direct" data-co-reveal>
      <p class="co-eyebrow">${escapeHtml(copy.directContact || "DIRECT CONTACT")}</p>
      <p class="co-direct__label">GENERAL / BUSINESS</p>
      <div class="co-direct__row">
        <a class="co-direct__email" href="mailto:${FORMSUBMIT_INBOX}">${FORMSUBMIT_INBOX}</a>
        <button type="button" class="co-btn co-btn--ghost" data-co-copy-email="${FORMSUBMIT_INBOX}">${escapeHtml(copy.copyEmail || "COPY EMAIL")}</button>
      </div>
      ${copy.responseNote ? `<p class="co-hint">${escapeHtml(copy.responseNote)}</p>` : ""}
    </aside>
  </div>
</section>
${exploreFooter(copy, "../")}`;
}

/* ——— I18N + render ——— */

function ideaI18n(copy) {
  return {
    submitting: copy.submitting || "SUBMITTING...",
    submit: copy.submit || "",
    successTitle: copy.successTitle || "",
    successBody: copy.successBody || "",
    errRequired: copy.errRequired || "",
    errEmail: copy.errEmail || "",
    errUrl: copy.errUrl || "",
    errLegal: copy.errLegal || "",
    errSend: copy.errSend || "",
  };
}

function contactI18n(copy) {
  return {
    submitting: copy.submitting || "SENDING...",
    submit: copy.submit || "",
    successTitle: copy.successTitle || "",
    successBody: copy.successBody || "",
    errRequired: copy.errRequired || "",
    errEmail: copy.errEmail || "",
    errUrl: copy.errUrl || "",
    errSend: copy.errSend || "",
    copyEmail: copy.copyEmail || "COPY EMAIL",
    copied: copy.copied || "COPIED",
  };
}

function structuredDataScript(obj) {
  if (!obj) return "";
  return `    <script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function renderPage({
  htmlLang,
  ogLocale,
  canonical,
  hreflang,
  seoTitle,
  metaDescription,
  pageSlug,
  analyticsId,
  body,
  flat,
  flatEn,
  chromeBase,
  ogType = "website",
  structuredData = "",
  i18n = {},
  extraHead = "",
  extraScripts = "",
}) {
  let html = template;
  html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
  html = html.replace(/\{\{OG_LOCALE\}\}/g, ogLocale);
  html = html.replace(/\{\{OG_TYPE\}\}/g, ogType);
  html = html.replace(/\{\{CANONICAL\}\}/g, canonical);
  html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflang);
  html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(seoTitle || ""));
  html = html.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(metaDescription || ""));
  html = html.replace(/\{\{PAGE_SLUG\}\}/g, pageSlug || "");
  html = html.replace(/\{\{ANALYTICS_ID\}\}/g, analyticsId || pageSlug || "");
  html = html.replace(/\{\{STRUCTURED_DATA\}\}/g, structuredData);
  html = html.replace(/\{\{PAGE_BODY\}\}/g, body);
  html = html.replace(/\{\{I18N_JSON\}\}/g, JSON.stringify(i18n));
  html = html.replace(/\{\{EXTRA_HEAD\}\}/g, extraHead || "");
  html = html.replace(/\{\{EXTRA_SCRIPTS\}\}/g, extraScripts || "");
  html = injectSiteChrome(html, flat, flatEn, {
    activeNav: "company",
    base: chromeBase,
  });
  return html;
}

function renderCompany() {
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.slice("--only=".length) : "";
  const flatEn = flatten(loadJson("en.json"));
  const articles = publishedArticles();
  let pageCount = 0;

  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(loadJson(file));
    const lang = copyLang(dir);
    const ogLocale = OG_LOCALE[dir] || "en_US";
    const projects = getCompanyProjects(lang);
    const chromeBase = "../";

    // ABOUT → owned by render-about-hub.mjs (redesigned About page)
    // Keep redirect only; body is written by render-about-hub.

    // PORTFOLIO index → /{lang}/portfolio/ (details keep original portfolio design)
    if (!only || only === "portfolio") {
      const copy = getCompanyCopy("portfolio", lang);
      const html = renderPage({
        htmlLang,
        ogLocale,
        canonical: `${SITE_ORIGIN}/${dir}/portfolio/`,
        hreflang: hreflangBlock("portfolio"),
        seoTitle: copy.seoTitle,
        metaDescription: copy.metaDescription,
        pageSlug: "portfolio",
        analyticsId: "company_portfolio",
        body: portfolioBody(copy, lang),
        flat,
        flatEn,
        chromeBase,
        i18n: { emptyFilter: copy.emptyFilter || "" },
      });
      writeFile(path.join(ROOT, dir, "portfolio", "index.html"), html);
      pageCount += 1;
    }

    // NEWS index → /{lang}/news/ (article pages keep original news design)
    if (!only || only === "news") {
      const copy = getCompanyCopy("news", lang);
      const html = renderPage({
        htmlLang,
        ogLocale,
        canonical: `${SITE_ORIGIN}/${dir}/news/`,
        hreflang: hreflangBlock("news"),
        seoTitle: copy.seoTitle,
        metaDescription: copy.metaDescription,
        pageSlug: "news",
        analyticsId: "company_news",
        body: newsBody(copy, lang),
        flat,
        flatEn,
        chromeBase,
        i18n: { emptyFilter: copy.emptyFilter || "" },
        extraHead: '<link rel="stylesheet" href="/news/newsroom.css?v=20260830nrtight1" />',
        extraScripts: '<script src="/news/newsroom.js?v=20260830empty1" defer></script>',
      });
      writeFile(path.join(ROOT, dir, "news", "index.html"), html);
      pageCount += 1;
    }

    // IDEA → /{lang}/ideas/
    if (!only || only === "ideas") {
      const copy = getCompanyCopy("idea", lang);
      const html = renderPage({
        htmlLang,
        ogLocale,
        canonical: `${SITE_ORIGIN}/${dir}/ideas/`,
        hreflang: hreflangBlock("ideas"),
        seoTitle: copy.seoTitle,
        metaDescription: copy.metaDescription,
        pageSlug: "idea",
        analyticsId: "company_idea",
        body: ideaBody(copy, lang),
        flat,
        flatEn,
        chromeBase,
        i18n: ideaI18n(copy),
      });
      writeFile(path.join(ROOT, dir, "ideas", "index.html"), html);
      pageCount += 1;
    }

    // CONTACT → /{lang}/contact/
    if (!only || only === "contact") {
      const copy = getCompanyCopy("contact", lang);
      const html = renderPage({
        htmlLang,
        ogLocale,
        canonical: `${SITE_ORIGIN}/${dir}/contact/`,
        hreflang: hreflangBlock("contact"),
        seoTitle: copy.seoTitle,
        metaDescription: copy.metaDescription,
        pageSlug: "contact",
        analyticsId: "company_contact",
        body: contactBody(copy, lang),
        flat,
        flatEn,
        chromeBase,
        i18n: contactI18n(copy),
      });
      writeFile(path.join(ROOT, dir, "contact", "index.html"), html);
      pageCount += 1;
    }

    // /company/* → classic paths (do not overwrite portfolio/{slug} or news/{slug})
    if (!only) {
      for (const redir of COMPANY_HUB_REDIRECTS) {
        const target = `/${dir}/${redir.to}/`;
        writeFile(
          path.join(ROOT, dir, ...redir.from.split("/"), "index.html"),
          metaRefreshHtml(target, `Redirect · ${redir.from}`)
        );
        pageCount += 1;
      }

      // Old company portfolio/news detail URLs → classic detail pages
      for (const project of projects) {
        writeFile(
          path.join(ROOT, dir, "company", "portfolio", project.slug, "index.html"),
          metaRefreshHtml(`/${dir}/portfolio/${project.slug}/`, project.name || project.slug)
        );
        pageCount += 1;
      }
      for (const article of articles) {
        writeFile(
          path.join(ROOT, dir, "company", "news", article.slug, "index.html"),
          metaRefreshHtml(`/${dir}/news/${article.slug}/`, article.slug)
        );
        pageCount += 1;
      }
    }
  }

  // Root redirects prefer classic paths
  if (!only) {
    writeRootLangRedirect("about", "About Newon");
    writeRootLangRedirect("portfolio", "Portfolio");
    writeRootLangRedirect("news", "News");
    writeRootLangRedirect("ideas", "Ideas");
    writeRootLangRedirect("contact", "Contact");
    writeRootLangRedirect("company", "Newon Company");
    writeRootLangRedirect("company/about", "About Newon");
    writeRootLangRedirect("company/portfolio", "Portfolio");
    writeRootLangRedirect("company/news", "News");
    writeRootLangRedirect("company/idea", "Idea");
    writeRootLangRedirect("company/contact", "Contact");
  }

  const pubRoot = path.join(ROOT, "_publish");
  if (fs.existsSync(pubRoot) && (!only || only === "news")) {
    const pubNews = path.join(pubRoot, "news");
    fs.mkdirSync(pubNews, { recursive: true });
    for (const name of ["newsroom.css", "newsroom.js"]) {
      const src = path.join(ROOT, "news", name);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(pubNews, name));
    }
    for (const { dir } of LANGS) {
      const srcHub = path.join(ROOT, dir, "news", "index.html");
      if (!fs.existsSync(srcHub)) continue;
      const destHub = path.join(pubRoot, dir, "news");
      fs.mkdirSync(destHub, { recursive: true });
      fs.copyFileSync(srcHub, path.join(destHub, "index.html"));
    }
  }

  console.log(
    `render-company: ${only ? `only=${only}; ` : ""}${COMPANY_PAGES.length} hubs at classic paths; portfolio details + news articles keep original design; company/* redirects × ${LANGS.length} langs (${pageCount} writes)`
  );
}

const isMain =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("render-company.mjs");

if (isMain) {
  renderCompany();
}

export { renderCompany };
