#!/usr/bin/env node
/**
 * Render Business collaboration detail pages at /business/collaboration/{slug}/
 * using the shared bs-* design system (business-service.html).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGS, OG_LOCALE, SITE_ORIGIN, ROOT, escapeHtml } from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { businessHeroVisual } from "./business-bs-visuals.mjs";
import { BUSINESS_DETAIL_PAGES } from "./gen-business-details.mjs";
import {
  COLLAB_PAGE_META,
  COLLAB_PAGE_ORDER,
  collabPageRoute,
  getCollabCopy,
} from "./business-collab-detail-copy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const template = fs.readFileSync(path.join(ROOT, "templates", "business-service.html"), "utf8");

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

function pick(flat, flatEn, key) {
  let val = flat[key];
  if (val === undefined || val === null || val === "") val = flatEn[key];
  return val;
}

function brHeadline(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}


function businessRel() {
  return "../../";
}

function chromeBase() {
  return "../../../";
}

function pagePath(slug) {
  return `business/${collabPageRoute(slug)}`;
}

function hreflangBlock(slug) {
  const route = pagePath(slug);
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) => `    <link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/${route}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/${route}/" />`);
  return lines.join("\n");
}

function inquiryHref(slug) {
  const type = COLLAB_PAGE_META[slug]?.inquiryType || slug;
  return `${businessRel()}inquiry/?type=${encodeURIComponent(type)}#inquiry`;
}

function navLabel(slug, flat, flatEn) {
  const page = BUSINESS_DETAIL_PAGES.find((p) => p.slug === slug);
  return escapeHtml(pick(flat, flatEn, page?.titleKey || "") || slug);
}

function collabNav(activeSlug, flat, flatEn, copy) {
  const links = COLLAB_PAGE_ORDER.map((slug) => {
    const meta = COLLAB_PAGE_META[slug];
    const label = navLabel(slug, flat, flatEn);
    const cls = slug === activeSlug ? "bs-nav__link is-active" : "bs-nav__link";
    const href = slug === activeSlug ? "#" : `../${meta.pathSlug}/`;
    return `<a class="${cls}" href="${href}"${slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");
  const navAria = escapeHtml(copy?.navAriaLabel || "Collaboration");
  const navLabelText = escapeHtml(copy?.navLabel || "COLLABORATION");
  return `<nav class="bs-nav" aria-label="${navAria}"><div class="bs-inner bs-nav__inner"><p class="bs-nav__label">${navLabelText}</p><div class="bs-nav__track">${links}</div></div></nav>`;
}

function catalogItems(items, mod = "catalog") {
  return items
    .map((item, i) => {
      if (typeof item === "string") {
        return `<article class="bs-get__item"><span class="bs-get__n" aria-hidden="true">${pad2(i + 1)}</span><div class="bs-get__copy"><p>${escapeHtml(item)}</p></div></article>`;
      }
      return `<article class="bs-get__item"><span class="bs-get__n" aria-hidden="true">${pad2(i + 1)}</span><div class="bs-get__copy"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body || "")}</p></div></article>`;
    })
    .join("");
}

function whoCards(items) {
  return `<div class="bs-get bs-get--who bs-get--catalog">${catalogItems(items)}</div>`;
}

function processSteps(items) {
  const count = items?.length || 0;
  return `<ol class="bs-process bs-process--steps"${count ? ` data-count="${count}"` : ""}>${items
    .map(
      (item, i) =>
        `<li class="bs-process__item"><span class="bs-process__n" aria-hidden="true">${pad2(i + 1)}</span><div class="bs-process__copy"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body || "")}</p></div></li>`
    )
    .join("")}</ol>`;
}

function chips(items) {
  return `<ul class="bs-chips bs-chips--tags">${items.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : item.title)}</li>`).join("")}</ul>`;
}

function checklist(items) {
  return `<ul class="bs-checklist">${items.map((item) => `<li class="bs-checklist__item"><span class="bs-checklist__box" aria-hidden="true"></span><span>${escapeHtml(item)}</span></li>`).join("")}</ul>`;
}

function faqHtml(copy) {
  const parts = (copy.faqs || [])
    .map(
      (item) => `<div class="bs-faq-item">
      <button type="button" class="bs-faq-q" aria-expanded="false"><span>${escapeHtml(item.q)}</span><span class="bs-faq-icon" aria-hidden="true"></span></button>
      <div class="bs-faq-a"><div><p>${escapeHtml(item.a || "")}</p></div></div>
    </div>`
    )
    .join("");
  if (!parts) return "";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-faq-title"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(copy.faqEyebrow)}</p>
    <h2 class="bs-title" id="bs-faq-title">${escapeHtml(copy.faqTitle)}</h2>
    <div class="bs-faq">${parts}</div>
  </div></section>`;
}

function relatedServices(copy) {
  const items = (copy.related || [])
    .map(
      (item) =>
        `<a class="bs-related__link" href="${escapeHtml(item.href)}"><span><span class="bs-related__kicker">${escapeHtml(copy.relatedEyebrow)}</span><span class="bs-related__name">${escapeHtml(item.label)}</span></span><span class="bs-related__go" aria-hidden="true">→</span></a>`
    )
    .join("");
  if (!items) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-related-title"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(copy.relatedEyebrow)}</p>
    <h2 class="bs-title" id="bs-related-title">${escapeHtml(copy.relatedTitle)}</h2>
    <div class="bs-related">${items}</div>
  </div></section>`;
}

function otherCollab(activeSlug, flat, flatEn) {
  const cards = COLLAB_PAGE_ORDER.filter((slug) => slug !== activeSlug)
    .map((slug) => {
      const meta = COLLAB_PAGE_META[slug];
      const title = navLabel(slug, flat, flatEn);
      const copy = getCollabCopy(activeSlug, flat.__lang || "en");
      const typeLabel = escapeHtml(copy?.otherTypeLabel || "COLLAB");
      return `<a class="bs-related__item" href="../${meta.pathSlug}/"><span class="bs-related__type">${typeLabel}</span><span class="bs-related__title">${title}</span><span class="bs-related__arrow" aria-hidden="true">→</span></a>`;
    })
    .join("");
  const copy = getCollabCopy(activeSlug, flat.__lang || "en");
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-other-title"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(copy.otherEyebrow)}</p>
    <h2 class="bs-title" id="bs-other-title">${escapeHtml(copy.otherTitle)}</h2>
    <div class="bs-related__list">${cards}</div>
  </div></section>`;
}

function jsonLd(slug, copy, canonical) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: copy.crumbBusiness, item: canonical.replace(/\/collaboration\/[^/]+\/$/, "/") },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.crumbCollaboration,
        item: canonical.replace(/\/collaboration\/[^/]+\/$/, "/inquiry/#work"),
      },
      { "@type": "ListItem", position: 3, name: copy.crumb },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function extrasFor(slug, copy) {
  let html = "";

  if (copy.possibleItems?.length) {
    html += `<section class="bs-section bs-collab-section bs-collab-section--examples" data-bs-reveal aria-labelledby="bs-possible-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.possibleEyebrow || "POSSIBLE COLLABORATION")}</p>
      <h2 class="bs-title" id="bs-possible-title">${escapeHtml(copy.possibleTitle)}</h2>
      ${copy.possibleNote ? `<p class="bs-note">${escapeHtml(copy.possibleNote)}</p>` : ""}
      <ul class="bs-example-list">${copy.possibleItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div></section>`;
  }

  if (copy.useCasesItems?.length) {
    html += `<section class="bs-section bs-collab-section bs-collab-section--examples" data-bs-reveal aria-labelledby="bs-use-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.useCasesEyebrow || "USE CASES")}</p>
      <h2 class="bs-title" id="bs-use-title">${escapeHtml(copy.useCasesTitle)}</h2>
      ${copy.useCasesNote ? `<p class="bs-note">${escapeHtml(copy.useCasesNote)}</p>` : ""}
      <ul class="bs-example-list">${copy.useCasesItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div></section>`;
  }

  if (copy.techItems?.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-tech-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.techEyebrow || "TECHNICAL OPTIONS")}</p>
      <h2 class="bs-title" id="bs-tech-title">${escapeHtml(copy.techTitle)}</h2>
      ${chips(copy.techItems)}
      ${copy.techNote ? `<p class="bs-note">${escapeHtml(copy.techNote)}</p>` : ""}
    </div></section>`;
  }

  if (copy.formatsItems?.length) {
    html += `<section class="bs-section bs-collab-section" data-bs-reveal aria-labelledby="bs-formats-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.formatsEyebrow || "CAMPAIGN FORMATS")}</p>
      <h2 class="bs-title" id="bs-formats-title">${escapeHtml(copy.formatsTitle)}</h2>
      <div class="bs-get bs-get--catalog">${catalogItems(copy.formatsItems)}</div>
    </div></section>`;
  }

  if (copy.principlesItems?.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-prin-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.principlesEyebrow || "PRINCIPLES")}</p>
      <h2 class="bs-title" id="bs-prin-title">${escapeHtml(copy.principlesTitle)}</h2>
      <div class="bs-get bs-get--axiom">${catalogItems(copy.principlesItems)}</div>
    </div></section>`;
  }

  if (copy.measurementItems?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-measure-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.measurementEyebrow || "MEASUREMENT")}</p>
      <h2 class="bs-title" id="bs-measure-title">${escapeHtml(copy.measurementTitle)}</h2>
      ${chips(copy.measurementItems)}
      ${copy.measurementNote ? `<p class="bs-note">${escapeHtml(copy.measurementNote)}</p>` : ""}
      ${copy.importantNote ? `<p class="bs-note bs-note--emph">${escapeHtml(copy.importantNote)}</p>` : ""}
    </div></section>`;
  }

  if (copy.metricsItems?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-metrics-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.metricsEyebrow || "METRICS")}</p>
      <h2 class="bs-title" id="bs-metrics-title">${escapeHtml(copy.metricsTitle)}</h2>
      ${chips(copy.metricsItems)}
      ${copy.metricsNote ? `<p class="bs-note">${escapeHtml(copy.metricsNote)}</p>` : ""}
    </div></section>`;
  }

  if (copy.capabilitiesItems?.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-cap-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.capabilitiesEyebrow || "CAPABILITIES")}</p>
      <h2 class="bs-title" id="bs-cap-title">${escapeHtml(copy.capabilitiesTitle)}</h2>
      <div class="bs-get bs-get--catalog">${catalogItems(copy.capabilitiesItems)}</div>
    </div></section>`;
  }

  if (copy.deliverablesItems?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-deliver-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.deliverablesEyebrow || "DELIVERABLES")}</p>
      <h2 class="bs-title" id="bs-deliver-title">${escapeHtml(copy.deliverablesTitle)}</h2>
      ${chips(copy.deliverablesItems)}
      ${copy.deliverablesNote ? `<p class="bs-note">${escapeHtml(copy.deliverablesNote)}</p>` : ""}
    </div></section>`;
  }

  if (copy.pricingBody) {
    html += `<section class="bs-section bs-section--surface bs-collab-pricing" data-bs-reveal aria-labelledby="bs-pricing-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.pricingEyebrow || "PRICING / STARTING POINT")}</p>
      <h2 class="bs-title" id="bs-pricing-title">${escapeHtml(copy.pricingTitle)}</h2>
      <p class="bs-lead">${escapeHtml(copy.pricingBody)}</p>
      <div class="bs-hero__actions"><a class="bs-btn bs-btn--ghost" href="${inquiryHref(slug)}">${escapeHtml(copy.pricingCta || copy.ctaPrimary)}</a></div>
    </div></section>`;
  }

  if (copy.requirementsItems?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-req-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.requirementsEyebrow || "PROJECT REQUIREMENTS")}</p>
      <h2 class="bs-title" id="bs-req-title">${escapeHtml(copy.requirementsTitle)}</h2>
      ${checklist(copy.requirementsItems)}
    </div></section>`;
  }

  return html;
}

function buildBody(slug, flat, flatEn, lang) {
  const copy = getCollabCopy(slug, lang);
  if (!copy) return "";
  flat.__lang = lang;

  const inq = inquiryHref(slug);
  const heroClass = slug === "promotion" ? " bs-hero--promotion" : slug === "development" ? " bs-hero--development" : slug === "service" ? " bs-hero--service" : " bs-hero--partnership";

  return `${jsonLd(slug, copy, `${SITE_ORIGIN}/${lang}/${pagePath(slug)}/`)}
<nav class="bs-crumb" aria-label="Breadcrumb"><div class="bs-inner">
  <a href="${businessRel()}">${escapeHtml(copy.crumbBusiness)}</a><span class="bs-crumb__sep" aria-hidden="true">/</span>
  <a href="${businessRel()}inquiry/#work">${escapeHtml(copy.crumbCollaboration)}</a><span class="bs-crumb__sep" aria-hidden="true">/</span>
  <span>${escapeHtml(copy.crumb)}</span>
</div></nav>
<section class="bs-hero${heroClass}" data-bs-reveal aria-labelledby="bs-hero-title">
  <div class="bs-inner bs-hero__grid">
    <div>
      <p class="bs-eyebrow">${escapeHtml(copy.heroLabel)}</p>
      <h1 class="bs-hero__title" id="bs-hero-title">${brHeadline(copy.heroTitle)}</h1>
      <p class="bs-hero__lead">${brHeadline(copy.heroLead)}</p>
      <div class="bs-hero__actions">
        <a class="bs-btn bs-btn--primary" href="${inq}" data-bs-cta="hero_primary">${escapeHtml(copy.ctaPrimary)}</a>
        <a class="bs-btn bs-btn--ghost" href="${escapeHtml(copy.ctaSecondaryHref || "#process")}" data-bs-cta="hero_secondary">${escapeHtml(copy.ctaSecondary)}</a>
      </div>
      ${copy.heroKeywords?.length ? `<ul class="bs-hero__keys" aria-label="${escapeHtml(copy.keywordsAria || "Keywords")}">${copy.heroKeywords.map((k) => `<li>${escapeHtml(k)}</li>`).join("")}</ul>` : ""}
    </div>
    ${businessHeroVisual(COLLAB_PAGE_META[slug]?.visual || slug, slug)}
  </div>
</section>
${collabNav(slug, flat, flatEn, copy)}
<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-who-title"><div class="bs-inner">
  <p class="bs-eyebrow">${escapeHtml(copy.whoEyebrow)}</p>
  <h2 class="bs-title" id="bs-who-title">${escapeHtml(copy.whoTitle)}</h2>
  ${whoCards(copy.whoItems || [])}
</div></section>
<section class="bs-section" data-bs-reveal aria-labelledby="bs-what-title"><div class="bs-inner">
  <p class="bs-eyebrow">${escapeHtml(copy.whatEyebrow)}</p>
  <h2 class="bs-title" id="bs-what-title">${escapeHtml(copy.whatTitle)}</h2>
  <div class="bs-get bs-get--what bs-get--catalog">${catalogItems(copy.whatItems || [])}</div>
</div></section>
<section class="bs-section bs-section--surface" data-bs-reveal id="process" aria-labelledby="bs-process-title"><div class="bs-inner">
  <p class="bs-eyebrow">${escapeHtml(copy.processEyebrow)}</p>
  <h2 class="bs-title" id="bs-process-title">${escapeHtml(copy.processTitle)}</h2>
  ${processSteps(copy.processItems || [])}
</div></section>
${extrasFor(slug, copy)}
<section class="bs-section" data-bs-reveal aria-labelledby="bs-brings-title"><div class="bs-inner">
  <p class="bs-eyebrow">${escapeHtml(copy.bringsEyebrow)}</p>
  <h2 class="bs-title" id="bs-brings-title">${escapeHtml(copy.bringsTitle)}</h2>
  <div class="bs-get bs-get--signal bs-get--catalog">${catalogItems(copy.bringsItems || [])}</div>
</div></section>
<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-scope-title"><div class="bs-inner">
  <p class="bs-eyebrow">${escapeHtml(copy.scopeEyebrow)}</p>
  <h2 class="bs-title" id="bs-scope-title">${escapeHtml(copy.scopeTitle)}</h2>
  ${chips(copy.scopeItems || [])}
  ${copy.scopeNote ? `<p class="bs-note">${escapeHtml(copy.scopeNote)}</p>` : ""}
</div></section>
${faqHtml(copy)}
<section class="bs-section bs-section--dark bs-final" data-bs-reveal aria-labelledby="bs-final-title"><div class="bs-inner">
  <h2 class="bs-final__title" id="bs-final-title">${brHeadline(copy.finalTitle)}</h2>
  <p class="bs-lead">${brHeadline(copy.finalLead || "")}</p>
  <div class="bs-hero__actions">
    <a class="bs-btn bs-btn--primary" href="${inq}" data-bs-cta="final">${escapeHtml(copy.finalBtn || copy.ctaPrimary)}</a>
  </div>
</div></section>
${relatedServices(copy)}
${otherCollab(slug, flat, flatEn)}`;
}

function writeLegacyRedirect(fromSlug, toRoute) {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  for (const { dir } of LANGS) {
    const legacyDir = path.join(ROOT, dir, "business", fromSlug);
    fs.mkdirSync(legacyDir, { recursive: true });
    const target = `/${dir}/${toRoute}/`;
    fs.writeFileSync(
      path.join(legacyDir, "index.html"),
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=${target}"/><link rel="canonical" href="${SITE_ORIGIN}${target}"/><title>Redirect</title></head><body><p><a href="${target}">Continue</a></p></body></html>\n`
    );
  }
  const rootDir = path.join(ROOT, "business", fromSlug);
  fs.mkdirSync(rootDir, { recursive: true });
  const enTarget = `/en/${toRoute}/`;
  fs.writeFileSync(
    path.join(rootDir, "index.html"),
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=${enTarget}"/><link rel="canonical" href="${SITE_ORIGIN}${enTarget}"/><title>Redirect</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/${toRoute}/"+(location.hash||""));})();</script></head><body><p><a href="${enTarget}">Continue</a></p></body></html>\n`
  );
}

export function renderBusinessCollabDetails() {
  const flatEn = flatten(loadJson("en.json"));

  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(loadJson(file));
    const lang = dir === "ko" ? "ko" : "en";

    for (const slug of COLLAB_PAGE_ORDER) {
      const route = pagePath(slug);
      let html = template;
      const copy = getCollabCopy(slug, lang);
      html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
      html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
      html = html.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/${route}/`);
      html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(slug));
      html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(copy?.seoTitle || ""));
      html = html.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(copy?.metaDescription || ""));
      html = html.replace(/\{\{SERVICE_SLUG\}\}/g, slug);
      html = html.replace(/\{\{ANALYTICS_ID\}\}/g, `business_collab_${COLLAB_PAGE_META[slug].pathSlug}`);
      html = html.replace(/\{\{PAGE_BODY\}\}/g, buildBody(slug, flat, flatEn, lang));
      html = injectSiteChrome(html, flat, flatEn, { activeNav: "business", base: chromeBase() });
      const outDir = path.join(ROOT, dir, ...route.split("/"));
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
    }
  }

  for (const slug of COLLAB_PAGE_ORDER) {
    const route = pagePath(slug);
    writeLegacyRedirect(slug, route);
  }

  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const { dir } of LANGS) {
      for (const slug of COLLAB_PAGE_ORDER) {
        const route = pagePath(slug);
        const src = path.join(ROOT, dir, ...route.split("/"), "index.html");
        const dest = path.join(pub, dir, ...route.split("/"), "index.html");
        if (!fs.existsSync(src)) continue;
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
      }
    }
  }

  console.log(`render-business-collab-details: ${COLLAB_PAGE_ORDER.length} pages × ${LANGS.length} langs → /business/collaboration/`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("render-business-collab-details.mjs")) {
  renderBusinessCollabDetails();
}
