#!/usr/bin/env node
/**
 * Render /{lang}/business/{build|automation|research|solutions}/ pillar detail pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGS, OG_LOCALE, SITE_ORIGIN, ROOT, escapeHtml } from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { PILLAR_SLUGS, getPillarCopy } from "./business-pillar-copy.mjs";

const template = fs.readFileSync(path.join(ROOT, "templates", "business-pillar.html"), "utf8");

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

function hreflangBlock(slug) {
  const lines = LANGS.map(
    ({ dir, hreflang }) =>
      `    <link rel="alternate" hreflang="${hreflang}" href="${SITE_ORIGIN}/${dir}/business/${slug}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/business/${slug}/" />`);
  return lines.join("\n");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function jsonLd(slug, copy, langDir) {
  const url = `${SITE_ORIGIN}/${langDir}/business/${slug}/`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: copy.seoTitle || `Newon ${slug}`,
    description: copy.metaDescription || copy.lead || "",
    provider: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN },
    url,
    areaServed: "Worldwide",
  };
  const crumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${langDir}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.crumbBusiness || "Business",
        item: `${SITE_ORIGIN}/${langDir}/business/`,
      },
      { "@type": "ListItem", position: 3, name: slug.toUpperCase(), item: url },
    ],
  };
  return `    <script type="application/ld+json">${JSON.stringify(data)}</script>
    <script type="application/ld+json">${JSON.stringify(crumb)}</script>`;
}

function breadcrumb(copy, slug) {
  return `<nav class="bp-crumb" aria-label="Breadcrumb">
  <div class="bp-inner">
    <ol class="bp-crumb__list">
      <li><a href="../">${escapeHtml(copy.crumbBusiness || "Business")}</a></li>
      <li aria-current="page">${escapeHtml(slug.toUpperCase())}</li>
    </ol>
  </div>
</nav>`;
}


function heroVisual(copy) {
  const mark = (copy.eyebrow || "NEWON").replace(/^NEWON\s+/i, "") || "NEWON";
  return `<aside class="bp-hero__visual bp-hero__visual--mark" aria-hidden="true">
    <p class="bp-mark">${escapeHtml(mark)}</p>
  </aside>`;
}

function priceForIndex(copy, index) {
  const list = copy.pricing || [];
  const bySvc = list.find((p) => p.svc === index);
  if (bySvc) return bySvc.price;
  return "";
}

function shortTitle(title) {
  const t = String(title || "");
  if (t.includes("LANDING")) return "LANDING";
  if (t.includes("MVP")) return "MVP";
  if (t.includes("WEBSITE")) return "WEBSITE";
  if (t.includes("APP")) return "APP";
  if (t.includes("WORKFLOW")) return "WORKFLOW";
  if (t.includes("INTERNAL")) return "TOOLS";
  if (t.includes("DATA")) return "DATA";
  if (t.includes("AI")) return "AI";
  if (t.includes("UX")) return "UX AUDIT";
  if (t.includes("COMPETITOR")) return "COMPETITOR";
  if (t.includes("MARKET")) return "MARKET";
  if (t.includes("CUSTOM")) return "CUSTOM";
  return t.split(/\s+/)[0] || t;
}

function detailAction(copy, s) {
  const href = s.href || "";
  if (href) {
    return `<a class="bp-btn bp-btn--ghost" href="${escapeHtml(href)}" data-analytics="business_pillar_detail">${escapeHtml(copy.detailCta || "자세히 보기 →")}</a>`;
  }
  return `<span class="bp-btn bp-btn--soon" aria-disabled="true">${escapeHtml(copy.soonBtn || "준비 중")}</span>`;
}

function servicesSection(copy) {
  const services = copy.services || [];
  if (!services.length) return "";

  const tabs = services
    .map((s, i) => {
      const n = pad2(i + 1);
      const selected = i === 0 ? "true" : "false";
      return `<button type="button" class="bp-explore__tab${i === 0 ? " is-active" : ""}" role="tab" id="bp-tab-${i}" aria-selected="${selected}" aria-controls="bp-panel-${i}" data-bp-tab="${i}">
      <span class="bp-explore__tab-n">${n}</span>
      <span class="bp-explore__tab-t">${escapeHtml(s.tab || shortTitle(s.title))}</span>
    </button>`;
    })
    .join("");

  const panels = services
    .map((s, i) => {
      const price = priceForIndex(copy, i);
      const hidden = i === 0 ? "" : " hidden";
      const active = i === 0 ? " is-active" : "";
      const label = escapeHtml(s.tab || shortTitle(s.title));
      const isReady = s.ready !== false && !!(s.summary || s.what);
      const actions = `<div class="bp-explore__actions">${detailAction(copy, s)}<a class="bp-btn bp-btn--primary" href="../#inquiry" data-analytics="business_pillar_cta">${escapeHtml(copy.quoteCta || "")}</a></div>`;

      if (!isReady) {
        return `<article class="bp-explore__panel bp-explore__panel--soon${active}" role="tabpanel" id="bp-panel-${i}" aria-labelledby="bp-tab-${i}" data-bp-panel="${i}"${hidden}>
      <p class="bp-explore__kicker">${pad2(i + 1)} · ${label}</p>
      <h2 class="bp-explore__title">${escapeHtml(copy.comingSoon || "준비중")}</h2>
      <p class="bp-explore__summary">${escapeHtml(copy.comingSoonLead || "")}</p>
      <footer class="bp-explore__foot">
        <div class="bp-explore__price bp-explore__price--empty"></div>
        ${actions}
      </footer>
    </article>`;
      }

      return `<article class="bp-explore__panel${active}" role="tabpanel" id="bp-panel-${i}" aria-labelledby="bp-tab-${i}" data-bp-panel="${i}"${hidden}>
      <p class="bp-explore__kicker">${pad2(i + 1)} · ${label}</p>
      <h2 class="bp-explore__title">${escapeHtml(s.title)}</h2>
      <p class="bp-explore__summary">${escapeHtml(s.summary)}</p>
      <dl class="bp-explore__detail">
        <div><dt>${escapeHtml(copy.whatWeBuild)}</dt><dd>${escapeHtml(s.what)}</dd></div>
        <div><dt>${escapeHtml(copy.recommendedFor)}</dt><dd>${escapeHtml(s.for)}</dd></div>
        <div><dt>${escapeHtml(copy.included)}</dt><dd>${escapeHtml(s.included)}</dd></div>
        <div><dt>${escapeHtml(copy.deliverables)}</dt><dd>${escapeHtml(s.deliverables)}</dd></div>
        <div><dt>${escapeHtml(copy.timeline)}</dt><dd>${escapeHtml(s.timeline)}</dd></div>
      </dl>
      <footer class="bp-explore__foot">
        ${
          price
            ? `<div class="bp-explore__price">${
                copy.startingAt ? `<span>${escapeHtml(copy.startingAt)}</span>` : ""
              }<strong>${escapeHtml(price)}</strong></div>`
            : `<div class="bp-explore__price bp-explore__price--empty"></div>`
        }
        ${actions}
      </footer>
    </article>`;
    })
    .join("");

  const note = copy.pricingNote || copy.pricingNoteDefault || "";

  return `<section id="services" class="bp-sec bp-explore-sec" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">${escapeHtml(copy.servicesLabel || "SERVICES")}</p>
    </header>
    <div class="bp-explore" data-bp-explore>
      <div class="bp-explore__tabs" role="tablist" aria-label="${escapeHtml(copy.servicesLabel || "Services")}">${tabs}</div>
      <div class="bp-explore__stage">${panels}</div>
    </div>
    ${note ? `<p class="bp-explore__note">${escapeHtml(note)}</p>` : ""}
  </div>
</section>`;
}

function processSection(copy) {
  if (!copy.process || !copy.process.length) return "";
  const n = copy.process.length;
  const steps = copy.process
    .map(
      (p, i) => `<li class="bp-proc__step" style="--i:${i}">
      <span class="bp-proc__n" aria-hidden="true">${escapeHtml(p.n || pad2(i + 1))}</span>
      <span class="bp-proc__label">${escapeHtml(p.n || pad2(i + 1))}</span>
      <span class="bp-proc__t">${escapeHtml(p.t)}</span>
      <span class="bp-proc__d">${escapeHtml(p.d)}</span>
    </li>`
    )
    .join("");

  return `<section id="process" class="bp-sec bp-process" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">${escapeHtml(copy.processLabel || "PROCESS")}</p>
    </header>
    <ol class="bp-proc" style="--bp-proc-n:${n}">${steps}</ol>
  </div>
</section>`;
}

function useCasesSection(copy) {
  if (!copy.useCases || !copy.useCases.length) return "";
  const items = copy.useCases
    .map(
      (u, i) => `<li class="bp-uc__item">
      <span class="bp-uc__n">${pad2(i + 1)}</span>
      <span class="bp-uc__t">${escapeHtml(u)}</span>
      <span class="bp-uc__arrow" aria-hidden="true">→</span>
    </li>`
    )
    .join("");
  return `<section id="use-cases" class="bp-sec bp-usecases" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head bp-sec__head--row bp-uc__head">
      <div class="bp-uc__head-l">
        <p class="bp-label">${escapeHtml(copy.useCasesLabel || "USE CASES")}</p>
      </div>
      <p class="bp-note">${escapeHtml(copy.useCasesNote || "")}</p>
    </header>
    <ol class="bp-uc__list">${items}</ol>
  </div>
</section>`;
}

function beforeAfterSection(copy) {
  if (!copy.before || !copy.after) return "";
  const beforeItems = copy.before
    .map(
      (x, i) => `<li class="bp-shift__item">
      <span class="bp-shift__n">${pad2(i + 1)}</span>
      <span class="bp-shift__t">${escapeHtml(x)}</span>
    </li>`
    )
    .join("");
  const afterItems = copy.after
    .map(
      (x, i) => `<li class="bp-shift__item">
      <span class="bp-shift__n">${pad2(i + 1)}</span>
      <span class="bp-shift__t">${escapeHtml(x)}</span>
    </li>`
    )
    .join("");

  return `<section id="before-after" class="bp-sec bp-ba" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">${escapeHtml(copy.beforeAfterLabel || "BEFORE / AFTER")}</p>
    </header>
    <div class="bp-shift">
      <div class="bp-shift__panel bp-shift__panel--before">
        <p class="bp-shift__k">BEFORE</p>
        <ol class="bp-shift__list">${beforeItems}</ol>
      </div>
      <div class="bp-shift__mid" aria-hidden="true">
        <span class="bp-shift__arrow">→</span>
      </div>
      <div class="bp-shift__panel bp-shift__panel--after">
        <p class="bp-shift__k">AFTER</p>
        <ol class="bp-shift__list">${afterItems}</ol>
      </div>
    </div>
  </div>
</section>`;
}

function researchOutputSection(copy) {
  if (!copy.outputs || !copy.outputs.length) return "";
  const items = copy.outputs
    .map(
      (o, i) => `<li class="bp-out__item">
      <span class="bp-out__n">${pad2(i + 1)}</span>
      <span class="bp-out__t">${escapeHtml(o)}</span>
    </li>`
    )
    .join("");
  return `<section id="output" class="bp-sec bp-output" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head bp-sec__head--row bp-out__head">
      <p class="bp-label">${escapeHtml(copy.outputLabel || "RESEARCH OUTPUT")}</p>
      <p class="bp-note">${escapeHtml(copy.outputNote || "")}</p>
    </header>
    <article class="bp-out">
      <div class="bp-out__banner">
        <p class="bp-out__k">${escapeHtml(copy.outputK || "RESEARCH BRIEF")}</p>
        <h2 class="bp-out__title">${escapeHtml(copy.outputTitle || "Project Research Summary")}</h2>
        <p class="bp-out__lead">${escapeHtml(copy.outputLead || "")}</p>
      </div>
      <ol class="bp-out__list">${items}</ol>
    </article>
  </div>
</section>`;
}

function launchFlowSection(copy) {
  if (!copy.launchFlow || !copy.launchFlow.length) return "";
  const n = copy.launchFlow.length;
  const steps = copy.launchFlow
    .map(
      (s, i) => `<li class="bp-lflow__step" style="--i:${i}">
      <span class="bp-lflow__n" aria-hidden="true">${pad2(i + 1)}</span>
      <span class="bp-lflow__label">${pad2(i + 1)}</span>
      <span class="bp-lflow__t">${escapeHtml(s.t)}</span>
      <span class="bp-lflow__d">${escapeHtml(s.d)}</span>
    </li>`
    )
    .join("");
  return `<section id="launch-flow" class="bp-sec bp-launch" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">${escapeHtml(copy.launchLabel || "PRODUCT LAUNCH FLOW")}</p>
    </header>
    <ol class="bp-lflow" style="--bp-lflow-n:${n}">${steps}</ol>
  </div>
</section>`;
}

function whenSection(copy) {
  if (!copy.whenItems || !copy.whenItems.length) return "";
  const items = copy.whenItems
    .map((w, i) => {
      const text = typeof w === "string" ? w : w.t;
      const tag = typeof w === "string" ? "" : w.tag || "";
      const n = pad2(i + 1);
      return `<li class="bp-when__item" style="--i:${i}">
      <span class="bp-when__n">${n}</span>
      <div class="bp-when__body">
        ${tag ? `<span class="bp-when__tag">${escapeHtml(tag)}</span>` : ""}
        <span class="bp-when__t">${escapeHtml(text)}</span>
      </div>
      <span class="bp-when__ghost" aria-hidden="true">${n}</span>
      <span class="bp-when__arrow" aria-hidden="true">→</span>
    </li>`;
    })
    .join("");
  return `<section id="when" class="bp-sec bp-when" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head bp-sec__head--row bp-when__head">
      <p class="bp-label">${escapeHtml(copy.whenLabel || "WHEN TO USE")}</p>
      <p class="bp-note">${escapeHtml(copy.whenNote || "")}</p>
    </header>
    <ol class="bp-when__list">${items}</ol>
  </div>
</section>`;
}

function pricingSection(copy) {
  /* List pricing is folded into the services explorer — keep only custom quotes */
  if (!copy.pricingCustom) return "";
  const axes = (copy.pricingAxes || ["Scope", "Complexity", "Timeline", "Integration"])
    .map((a) => `<li class="bp-quote__axis">${escapeHtml(a)}</li>`)
    .join("");
  return `<section id="pricing" class="bp-sec bp-pricing" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head bp-sec__head--row bp-quote__head">
      <p class="bp-label">${escapeHtml(copy.pricingLabel || "PRICING")}</p>
      <p class="bp-note">${escapeHtml(copy.pricingNote || "")}</p>
    </header>
    <div class="bp-quote">
      <div class="bp-quote__main">
        <p class="bp-quote__k">${escapeHtml(copy.pricingTitle || "CUSTOM PROJECT")}</p>
        <h2 class="bp-quote__title">${escapeHtml(copy.pricingLead || "")}</h2>
        <p class="bp-quote__body">${escapeHtml(copy.pricingBody || "")}</p>
        <ul class="bp-quote__axes" aria-label="Quote factors">${axes}</ul>
      </div>
      <div class="bp-quote__aside">
        <a class="bp-btn bp-btn--primary bp-quote__cta" href="../#inquiry" data-analytics="business_pillar_cta">${escapeHtml(copy.quoteCta || "")}</a>
      </div>
    </div>
  </div>
</section>`;
}

function otherServices(copy, slug, lang) {
  const labels = { build: "BUILD", automation: "AUTOMATION", research: "RESEARCH", solutions: "SOLUTIONS" };
  const items = PILLAR_SLUGS.map((s, i) => {
    const peer = getPillarCopy(s, lang);
    const active = s === slug;
    return `<a class="bp-other__card${active ? " is-active" : ""}" href="../${s}/"${
      active ? ' aria-current="page"' : ""
    }>
      <span class="bp-other__top">
        <span class="bp-other__n">${pad2(i + 1)}</span>
        <span class="bp-other__arrow" aria-hidden="true">${active ? "·" : "→"}</span>
      </span>
      <span class="bp-other__t">${labels[s]}</span>
      <span class="bp-other__lead">${escapeHtml(peer?.headline || "")}</span>
    </a>`;
  }).join("");

  return `<section class="bp-sec bp-other" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">${escapeHtml(copy.otherTitle || "MORE FROM BUSINESS")}</p>
    </header>
    <nav class="bp-other__grid" aria-label="${escapeHtml(copy.otherTitle || "Other services")}">${items}</nav>
  </div>
</section>`;
}

function faqSection(copy) {
  if (!copy.faq || !copy.faq.length) return "";
  const items = copy.faq
    .map(
      (f, i) => `<div class="bp-faq__item">
      <button type="button" class="bp-faq__q" aria-expanded="false" id="bp-faq-q-${i}" aria-controls="bp-faq-a-${i}">
        <span class="bp-faq__q-text">${escapeHtml(f.q)}</span>
        <span class="bp-faq__icon" aria-hidden="true"></span>
      </button>
      <div class="bp-faq__a" id="bp-faq-a-${i}" role="region" aria-labelledby="bp-faq-q-${i}" hidden>
        <div class="bp-faq__a-inner"><p>${escapeHtml(f.a)}</p></div>
      </div>
    </div>`
    )
    .join("");
  return `<section id="faq" class="bp-sec bp-faq" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">${escapeHtml(copy.faqLabel || "FAQ")}</p>
    </header>
    <div class="bp-faq__list">${items}</div>
  </div>
</section>`;
}

function finalCta(copy) {
  return `<section class="bp-cta" data-bp-reveal>
  <div class="bp-inner bp-cta__inner">
    <p class="bp-label">${escapeHtml(copy.ctaEyebrow || "HAVE A PROJECT?")}</p>
    <h2 class="bp-cta__title">${escapeHtml(copy.ctaTitle || "")}</h2>
    <p class="bp-cta__lead">${escapeHtml(copy.ctaLead || "")}</p>
    <a class="bp-btn bp-btn--primary" href="../#inquiry" data-analytics="business_pillar_cta">${escapeHtml(copy.ctaBtn || "")}</a>
  </div>
</section>`;
}

function buildBody(slug, copy, lang) {
  return `${breadcrumb(copy, slug)}
<section class="bp-hero" data-bp-reveal aria-labelledby="bp-hero-title">
  <div class="bp-inner bp-hero__grid">
    <div class="bp-hero__copy">
      <p class="bp-eyebrow">${escapeHtml(copy.eyebrow || "")}</p>
      <h1 class="bp-hero__title" id="bp-hero-title">${escapeHtml(copy.headline || "")}</h1>
      <p class="bp-hero__lead">${escapeHtml(copy.lead || "")}</p>
      <div class="bp-hero__actions">
        <a class="bp-btn bp-btn--primary" href="../#inquiry" data-analytics="business_pillar_cta">${escapeHtml(copy.ctaPrimary || "")}</a>
        <a class="bp-btn bp-btn--ghost" href="#services">${escapeHtml(copy.ctaSecondary || "")}</a>
      </div>
    </div>
    ${heroVisual(copy)}
  </div>
</section>
${servicesSection(copy)}
${useCasesSection(copy)}
${beforeAfterSection(copy)}
${researchOutputSection(copy)}
${launchFlowSection(copy)}
${whenSection(copy)}
${processSection(copy)}
${pricingSection(copy)}
${otherServices(copy, slug, lang)}
${faqSection(copy)}
${finalCta(copy)}`;
}

function writeRedirect(slug) {
  const dir = path.join(ROOT, "business", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=/en/business/${slug}/"/><link rel="canonical" href="${SITE_ORIGIN}/en/business/${slug}/"/><title>Redirect</title></head><body><p><a href="/en/business/${slug}/">Continue</a></p></body></html>\n`
  );
}

export function renderBusinessPillars() {
  const flatEn = flatten(loadJson("en.json"));

  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(loadJson(file));
    const lang = dir === "ko" ? "ko" : "en";

    for (const slug of PILLAR_SLUGS) {
      const copy = getPillarCopy(slug, lang);
      let html = template;
      html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
      html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
      html = html.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/business/${slug}/`);
      html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(slug));
      html = html.replace(/\{\{JSON_LD\}\}/g, jsonLd(slug, copy, dir));
      html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(copy.seoTitle || ""));
      html = html.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(copy.metaDescription || ""));
      html = html.replace(/\{\{PILLAR_SLUG\}\}/g, slug);
      html = html.replace(/\{\{PAGE_BODY\}\}/g, buildBody(slug, copy, lang));
      html = injectSiteChrome(html, flat, flatEn, { activeNav: "business", base: "../../" });

      const outDir = path.join(ROOT, dir, "business", slug);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
    }
  }

  for (const slug of PILLAR_SLUGS) writeRedirect(slug);

  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const { dir } of LANGS) {
      for (const slug of PILLAR_SLUGS) {
        const src = path.join(ROOT, dir, "business", slug, "index.html");
        const destDir = path.join(pub, dir, "business", slug);
        if (!fs.existsSync(src)) continue;
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, path.join(destDir, "index.html"));
      }
    }
    for (const slug of PILLAR_SLUGS) {
      const src = path.join(ROOT, "business", slug, "index.html");
      const destDir = path.join(pub, "business", slug);
      if (!fs.existsSync(src)) continue;
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, path.join(destDir, "index.html"));
    }
    for (const f of ["business-pillar.css", "business-pillar.js"]) {
      const src = path.join(ROOT, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(pub, f));
    }
  }

  console.log(`render-business-pillars: wrote ${LANGS.length * PILLAR_SLUGS.length} pages`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) renderBusinessPillars();
