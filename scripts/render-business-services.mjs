#!/usr/bin/env node
/**
 * Render /{lang}/business/{slug}/ for 6 service detail pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGS, OG_LOCALE, SITE_ORIGIN, ROOT, escapeHtml } from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { BUSINESS_SERVICE_PAGES } from "./business-service-catalog.mjs";
import { getServiceCopy } from "./business-service-copy.mjs";

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

function brHeadline(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function hreflangBlock(slug) {
  const lines = LANGS.map(
    ({ dir, hreflang }) =>
      `    <link rel="alternate" hreflang="${hreflang}" href="${SITE_ORIGIN}/${dir}/business/${slug}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/business/${slug}/" />`);
  return lines.join("\n");
}

function bySlug(slug) {
  return BUSINESS_SERVICE_PAGES.find((s) => s.slug === slug);
}

function inquiryHref(slug) {
  return `../?service=${encodeURIComponent(slug)}#inquiry`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

/* ——— Hero visuals ——— */
function visualPipeline(copy) {
  const d = copy.demo || {};
  const steps = [
    { t: "IDEA", n: "01" },
    { t: "DEFINE", n: "02" },
    { t: "DESIGN", n: "03" },
    { t: "BUILD", n: "04", on: true },
    { t: "TEST", n: "05" },
    { t: "LAUNCH", n: "06" },
  ];
  const progressVal = d.progress?.value || "68%";
  const progressIsPct = String(progressVal).trim().endsWith("%");
  const progressBar = progressIsPct
    ? `<div class="bs-demo__bar"><span style="width:${escapeHtml(String(progressVal).trim())}"></span></div>`
    : "";
  const statusVal = d.status?.value || "BUILDING";
  const featuresVal = d.features?.value || d.scope?.value || "8 / 12";
  const nextVal = d.next?.value || "QA TEST";

  const stepHtml = steps
    .map(
      (s) =>
        `<div class="bs-pipe__step${s.on ? " is-active" : ""}"><span class="bs-pipe__name">${s.t}</span><span class="bs-pipe__num">${s.n}</span></div>`
    )
    .join('<span class="bs-pipe__conn" aria-hidden="true"></span>');

  return `<div class="bs-visual bs-visual--pipe" aria-hidden="true">
    <div class="bs-pipe">
      <div class="bs-pipe__track">${stepHtml}</div>
      <aside class="bs-pipe-panel">
        <p class="bs-demo__badge">${escapeHtml(copy.demoBadge || "DEMO PROJECT")}</p>
        <div class="bs-pipe-panel__row">
          <p class="bs-demo__k">${escapeHtml(d.status?.label || "PROJECT STATUS")}</p>
          <p class="bs-demo__v">${escapeHtml(statusVal)}</p>
        </div>
        <div class="bs-pipe-panel__row">
          <p class="bs-demo__k">${escapeHtml(d.progress?.label || "PROGRESS")}</p>
          <p class="bs-demo__v">${escapeHtml(progressVal)}</p>
          ${progressBar}
        </div>
        <div class="bs-pipe-panel__row">
          <p class="bs-demo__k">${escapeHtml(d.features?.label || "CORE FEATURES")}</p>
          <p class="bs-demo__v">${escapeHtml(featuresVal)}</p>
        </div>
        <div class="bs-pipe-panel__row">
          <p class="bs-demo__k">${escapeHtml(d.next?.label || "NEXT")}</p>
          <p class="bs-demo__v">${escapeHtml(nextVal)}</p>
        </div>
      </aside>
    </div>
  </div>`;
}

function visualBrowser() {
  return `<div class="bs-visual bs-visual--browser" aria-hidden="true">
    <div class="bs-browser">
      <div class="bs-browser__bar">
        <div class="bs-browser__dots"><span></span><span></span><span></span></div>
        <div class="bs-browser__url">newproduct.com</div>
      </div>
      <div class="bs-browser__body">
        <div class="bs-browser__nav"><span>Product</span><span>Features</span><span>Contact</span></div>
        <p class="bs-browser__brand">NEW PRODUCT</p>
        <p class="bs-browser__tagline">Build something people want to use.</p>
        <span class="bs-browser__cta-chip">Explore Product →</span>
        <div class="bs-browser__wire" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="bs-browser__metrics">
          <div><span class="bs-browser__mk">PERFORMANCE</span><strong>98</strong></div>
          <div><span class="bs-browser__mk">RESPONSIVE</span><strong>READY</strong></div>
          <div><span class="bs-browser__mk">SEO</span><strong>OPTIMIZED</strong></div>
        </div>
        <p class="bs-demo__badge">DEMO PREVIEW</p>
      </div>
    </div>
  </div>`;
}

function visualDevices() {
  return `<div class="bs-visual bs-visual--devices" aria-hidden="true">
    <div class="bs-devices">
      <div class="bs-phone">
        <div class="bs-phone__notch"></div>
        <div class="bs-phone__screen">
          <p class="bs-phone__kicker">WELCOME</p>
          <p class="bs-phone__title">Get started</p>
          <div class="bs-phone__hero-block"></div>
          <div class="bs-phone__btn">Continue</div>
          <div class="bs-phone__dots"><span class="is-on"></span><span></span><span></span></div>
        </div>
      </div>
      <div class="bs-phone bs-phone--lg">
        <div class="bs-phone__notch"></div>
        <div class="bs-phone__screen">
          <p class="bs-phone__kicker">TODAY</p>
          <p class="bs-phone__title">Your activity</p>
          <div class="bs-phone__ring"><span>72%</span></div>
          <div class="bs-phone__stat-row"><span></span><span></span></div>
          <div class="bs-phone__card-row"><span></span><span></span></div>
        </div>
      </div>
      <div class="bs-phone">
        <div class="bs-phone__notch"></div>
        <div class="bs-phone__screen">
          <p class="bs-phone__kicker">INSIGHTS</p>
          <p class="bs-phone__title">Weekly Report</p>
          <div class="bs-phone__bars"><i style="height:40%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:85%"></i><i style="height:45%"></i></div>
          <div class="bs-phone__line"></div>
          <div class="bs-phone__line bs-phone__line--short"></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualWorkflow() {
  return `<div class="bs-visual bs-visual--flow" aria-hidden="true">
    <div class="bs-flow">
      <div class="bs-flow__panel">
        <div class="bs-flow__head">
          <span class="bs-flow__live"><i></i> LIVE WORKFLOW</span>
          <span class="bs-flow__meta">DEMO</span>
        </div>
        <div class="bs-flow__body">
          <div class="bs-flow__col">
            <div class="bs-flow__node"><span class="bs-flow__k">INPUT</span><span class="bs-flow__t">Customer Inquiry</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node is-ai"><span class="bs-flow__k">CLASSIFY</span><span class="bs-flow__t">AI</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node is-ai"><span class="bs-flow__k">SUMMARIZE</span><span class="bs-flow__t">AI</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node"><span class="bs-flow__k">HUMAN</span><span class="bs-flow__t">REVIEW</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node"><span class="bs-flow__k">ACTION</span><span class="bs-flow__t">Route</span></div>
          </div>
          <div class="bs-flow__branch">
            <p class="bs-flow__branch-k">OUTPUTS</p>
            <div class="bs-flow__node bs-flow__node--sm"><span class="bs-flow__t">EMAIL</span></div>
            <div class="bs-flow__node bs-flow__node--sm"><span class="bs-flow__t">CRM</span></div>
            <div class="bs-flow__node bs-flow__node--sm"><span class="bs-flow__t">DATABASE</span></div>
          </div>
        </div>
        <div class="bs-flow__queue">
          <div class="bs-flow__qitem is-done"><span>Classify</span><em>Done</em></div>
          <div class="bs-flow__qitem is-run"><span>Draft reply</span><em>Running</em></div>
          <div class="bs-flow__qitem"><span>Human review</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualBrandStack() {
  return `<div class="bs-visual bs-visual--transform" aria-hidden="true">
    <div class="bs-transform">
      <div class="bs-transform__panel">
        <div class="bs-transform__head">
          <span class="bs-transform__live"><i></i> BRAND TRANSFORM</span>
          <span class="bs-transform__meta">DEMO</span>
        </div>
        <div class="bs-transform__stages">
          <div class="bs-transform__stage is-core">
            <p class="bs-transform__k">CORE PRODUCT</p>
            <div class="bs-transform__mock is-gray">
              <span></span><span></span><span></span>
            </div>
            <p class="bs-transform__note">Shared foundation</p>
          </div>
          <div class="bs-transform__arrow" aria-hidden="true">→</div>
          <div class="bs-transform__stage is-custom">
            <p class="bs-transform__k">CUSTOMIZE</p>
            <div class="bs-transform__chips">
              <span>Brand</span><span>Logo</span><span>Color</span><span>Feature</span><span>Content</span>
            </div>
            <p class="bs-transform__note">Map identity + modules</p>
          </div>
          <div class="bs-transform__arrow" aria-hidden="true">→</div>
          <div class="bs-transform__stage is-yours">
            <p class="bs-transform__k">YOUR PRODUCT</p>
            <div class="bs-transform__mock is-brand">
              <strong>N</strong><span></span><span></span>
            </div>
            <p class="bs-transform__note">Ready on your domain</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualSystem() {
  return `<div class="bs-visual bs-visual--sys" aria-hidden="true">
    <div class="bs-sys">
      <div class="bs-sys__panel">
        <div class="bs-sys__head">
          <span class="bs-sys__live"><i></i> DESIGN SYSTEM</span>
          <span class="bs-sys__meta">DEMO</span>
        </div>
        <div class="bs-sys__grid">
          <div class="bs-sys__cell">
            <p class="bs-sys__k">LOGO</p>
            <div class="bs-sys__logo">N</div>
          </div>
          <div class="bs-sys__cell">
            <p class="bs-sys__k">TYPOGRAPHY</p>
            <div class="bs-sys__type">Aa</div>
            <p class="bs-sys__meta-line">Inter / Pretendard</p>
          </div>
          <div class="bs-sys__cell">
            <p class="bs-sys__k">COLORS</p>
            <div class="bs-sys__swatches">
              <span class="bs-sys__swatch bs-sys__swatch--ink" title="Black"></span>
              <span class="bs-sys__swatch bs-sys__swatch--paper" title="White"></span>
              <span class="bs-sys__swatch bs-sys__swatch--gray" title="Gray"></span>
            </div>
          </div>
          <div class="bs-sys__cell bs-sys__cell--wide">
            <p class="bs-sys__k">COMPONENTS</p>
            <div class="bs-sys__comps">
              <span class="bs-sys__comp-btn">Button</span>
              <span class="bs-sys__comp-input">Input</span>
              <span class="bs-sys__comp-toggle"><i></i></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function heroVisual(visual, copy) {
  switch (visual) {
    case "pipeline":
      return visualPipeline(copy);
    case "browser":
      return visualBrowser();
    case "devices":
      return visualDevices();
    case "workflow":
      return visualWorkflow();
    case "brand-stack":
      return visualBrandStack();
    case "system":
      return visualSystem();
    default:
      return "";
  }
}

/* ——— Shared chrome ——— */
function breadcrumb(copy) {
  const biz = escapeHtml(copy.crumbBusiness || "BUSINESS");
  const svc = escapeHtml(copy.crumbServices || "SERVICES");
  const current = escapeHtml(copy.eyebrow || "");
  return `<nav class="bs-crumb" aria-label="Breadcrumb">
    <div class="bs-inner">
      <a href="../">${biz}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <a href="../#services">${svc}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <span>${current}</span>
    </div>
  </nav>`;
}

function serviceNav(activeSlug, copies) {
  const links = BUSINESS_SERVICE_PAGES.map((s) => {
    const c = copies[s.slug];
    const label = escapeHtml(c?.navLabel || s.slug);
    const cls = s.slug === activeSlug ? "bs-nav__link is-active" : "bs-nav__link";
    const href = s.slug === activeSlug ? "#" : `../${s.slug}/`;
    return `<a class="${cls}" href="${href}"${s.slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");
  return `<nav class="bs-nav" aria-label="Services"><div class="bs-inner bs-nav__inner"><p class="bs-nav__label">SERVICES</p><div class="bs-nav__track">${links}</div></div></nav>`;
}

function adjacentHtml(page, copy, copies) {
  const idx = BUSINESS_SERVICE_PAGES.findIndex((s) => s.slug === page.slug);
  const prev = idx > 0 ? BUSINESS_SERVICE_PAGES[idx - 1] : null;
  const next = idx < BUSINESS_SERVICE_PAGES.length - 1 ? BUSINESS_SERVICE_PAGES[idx + 1] : null;
  const prevLabel = escapeHtml(copy.prevLabel || "PREVIOUS SERVICE");
  const nextLabel = escapeHtml(copy.nextLabel || "NEXT SERVICE");

  let prevBlock = "";
  let nextBlock = "";
  if (prev) {
    const c = copies[prev.slug];
    prevBlock = `<a class="bs-adjacent__link bs-adjacent__link--prev" href="../${prev.slug}/">
      <span class="bs-adjacent__label">${prevLabel}</span>
      <span class="bs-adjacent__name">${escapeHtml(c?.navLabel || c?.eyebrow || prev.slug)}</span>
    </a>`;
  } else {
    prevBlock = `<span class="bs-adjacent__link bs-adjacent__link--prev is-empty"></span>`;
  }
  if (next) {
    const c = copies[next.slug];
    nextBlock = `<a class="bs-adjacent__link bs-adjacent__link--next" href="../${next.slug}/">
      <span class="bs-adjacent__label">${nextLabel}</span>
      <span class="bs-adjacent__name">${escapeHtml(c?.navLabel || c?.eyebrow || next.slug)}</span>
    </a>`;
  } else {
    nextBlock = `<span class="bs-adjacent__link bs-adjacent__link--next is-empty"></span>`;
  }

  return `<section class="bs-section bs-adjacent" data-bs-reveal aria-label="Adjacent services">
    <div class="bs-inner bs-adjacent__grid">${prevBlock}${nextBlock}</div>
  </section>`;
}

function listNumbered(items, className) {
  return `<ul class="${className}">${items
    .map(
      (it) =>
        `<li class="${className}__item"><span class="${className}__n">${escapeHtml(it.n || "")}</span><h3>${escapeHtml(it.title || "")}</h3><p>${escapeHtml(it.body || "")}</p></li>`
    )
    .join("")}</ul>`;
}

function processList(items) {
  return `<ol class="bs-process">${items
    .map(
      (it) =>
        `<li class="bs-process__item"><span class="bs-process__n">${escapeHtml(it.n || "")}</span><h3>${escapeHtml(it.title || "")}</h3><p>${escapeHtml(it.body || "")}</p></li>`
    )
    .join("")}</ol>`;
}

function chips(items) {
  return `<ul class="bs-deliver">${items
    .map(
      (t, i) =>
        `<li class="bs-deliver__item"><span class="bs-deliver__n">${pad2(i + 1)}</span><span class="bs-deliver__t">${escapeHtml(t)}</span></li>`
    )
    .join("")}</ul>`;
}

function whoList(items) {
  return `<ol class="bs-who">${items
    .map(
      (t, i) =>
        `<li class="bs-who__item"><span class="bs-who__n">${pad2(i + 1)}</span><p class="bs-who__t">${escapeHtml(t)}</p></li>`
    )
    .join("")}</ol>`;
}

function faqHtml(faqs) {
  return `<div class="bs-faq">${faqs
    .map(
      (f, i) => `<div class="bs-faq-item">
      <button type="button" class="bs-faq-q" aria-expanded="false" id="bs-faq-q-${i}" aria-controls="bs-faq-a-${i}">
        <span>${escapeHtml(f.q)}</span><span class="bs-faq-icon" aria-hidden="true"></span>
      </button>
      <div class="bs-faq-a" id="bs-faq-a-${i}" role="region" aria-labelledby="bs-faq-q-${i}"><div><p>${escapeHtml(f.a)}</p></div></div>
    </div>`
    )
    .join("")}</div>`;
}

function relatedHtml(page, copy, copies) {
  const links = (page.related || [])
    .map((slug) => {
      const rel = bySlug(slug);
      const c = copies[slug];
      if (!rel || !c) return "";
      return `<a class="bs-related__link" href="../${slug}/">
        <span><span class="bs-related__kicker">NEXT SERVICE</span><span class="bs-related__name">${escapeHtml(c.navLabel || c.eyebrow)}</span></span>
        <span class="bs-related__go" aria-hidden="true">→</span>
      </a>`;
    })
    .join("");
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-related-title">
    <div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.relatedTitle || "RELATED SERVICES")}</p>
      <h2 class="bs-title" id="bs-related-title">${escapeHtml(copy.relatedTitle || "Related")}</h2>
      <div class="bs-related">${links}</div>
      <a class="bs-related__all" href="../">${escapeHtml(copy.exploreAll || "Explore all services →")}</a>
    </div>
  </section>`;
}

function railHtml(steps, className = "bs-rail") {
  return `<div class="${className}" aria-hidden="true">${steps
    .map(
      (s, i) =>
        `${i ? '<span class="bs-rail__conn"></span>' : ""}<div class="bs-rail__step"><span class="bs-rail__n">${escapeHtml(s.n || pad2(i + 1))}</span><span class="bs-rail__t">${escapeHtml(s.title)}</span></div>`
    )
    .join("")}</div>`;
}

/* ——— Mid-page extras ——— */
function mvpExtras(copy) {
  const scopeItems = copy.scopeItems?.length
    ? copy.scopeItems
    : [
        { key: "CORE", title: "CORE", body: "Must-have features for first release" },
        { key: "NEXT", title: "NEXT", body: "Add after launch" },
        { key: "LATER", title: "LATER", body: "Decide after validation" },
      ];
  const buildGridRaw = copy.buildGrid?.length
    ? copy.buildGrid
    : [
        { tag: "WEB", title: "Web MVP", body: "A core flow people can use in the browser." },
        { tag: "APP", title: "Mobile App MVP", body: "Habits and alerts that need mobile." },
        { tag: "OPS", title: "Internal Tool", body: "Daily ops software for your team." },
        { tag: "AI", title: "AI Product", body: "AI that cuts repeat work." },
        { tag: "EXP", title: "Prototype", body: "A clickable demo — fast and sharp." },
        { tag: "GO", title: "Landing + Product", body: "Landing and product entry together." },
      ];
  const buildGrid = buildGridRaw.map((item, i) => {
    if (typeof item === "string") {
      return { tag: pad2(i + 1), title: item, body: "" };
    }
    return {
      tag: item.tag || pad2(i + 1),
      title: item.title || "",
      body: item.body || "",
    };
  });

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-scope-title"><div class="bs-inner">
    <p class="bs-eyebrow">PRODUCT SCOPE</p>
    <h2 class="bs-title" id="bs-scope-title">${brHeadline(copy.scopeTitle || "You don't need to build everything first.")}</h2>
    ${copy.scopeLead ? `<p class="bs-lead">${escapeHtml(copy.scopeLead)}</p>` : ""}
    <div class="bs-scope">${scopeItems
      .map(
        (s) =>
          `<article class="bs-scope__col"><p class="bs-scope__k">${escapeHtml(s.title || s.key || "")}</p><p class="bs-scope__b">${escapeHtml(s.body || "")}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section bs-section--build" data-bs-reveal aria-labelledby="bs-buildgrid-title"><div class="bs-inner">
    <div class="bs-build-head">
      <div class="bs-build-head__copy">
        <p class="bs-eyebrow">${escapeHtml(copy.buildGridEyebrow || "CAPABILITY")}</p>
        <h2 class="bs-title" id="bs-buildgrid-title">${escapeHtml(copy.buildGridTitle || "WHAT WE CAN BUILD")}</h2>
        ${copy.buildGridLead ? `<p class="bs-lead">${escapeHtml(copy.buildGridLead)}</p>` : ""}
      </div>
      <p class="bs-build-head__meta" aria-hidden="true"><span class="bs-mono">${escapeHtml(copy.buildGridMeta || `${pad2(buildGrid.length)} FORMS`)}</span></p>
    </div>
    <div class="bs-build-grid" role="list">${buildGrid
      .map(
        (item, i) =>
          `<article class="bs-build-grid__item${i === 0 ? " is-lead" : ""}" role="listitem">
            <div class="bs-build-grid__top">
              <span class="bs-build-grid__n">${pad2(i + 1)}</span>
              <span class="bs-build-grid__tag">${escapeHtml(item.tag)}</span>
            </div>
            <div class="bs-build-grid__viz" aria-hidden="true" data-viz="${escapeHtml(String(item.tag).toLowerCase())}"></div>
            <h3 class="bs-build-grid__t">${escapeHtml(item.title)}</h3>
            ${item.body ? `<p class="bs-build-grid__b">${escapeHtml(item.body)}</p>` : ""}
          </article>`
      )
      .join("")}</div>
  </div></section>`;

  return html;
}

function webExtras(copy) {
  const defaultTypes = [
    { n: "01", title: "Company site", body: "Clear brand and service story for your team." },
    { n: "02", title: "Brand site", body: "Worldview and tone first, then conversion." },
    { n: "03", title: "Service landing", body: "One product, one value, one CTA." },
    { n: "04", title: "Portfolio / case", body: "Work and process shown with intent." },
    { n: "05", title: "Inquiry hub", body: "Hire, partner, and contact in one place." },
  ];
  const types = (copy.types?.length ? copy.types : defaultTypes).map((t, i) => ({
    ...t,
    n: t.n || pad2(i + 1),
  }));

  const railSteps = [
    { n: "01", title: "STRATEGY" },
    { n: "02", title: "IA" },
    { n: "03", title: "UI/UX" },
    { n: "04", title: "DEVELOPMENT" },
    { n: "05", title: "RESPONSIVE" },
    { n: "06", title: "QA" },
    { n: "07", title: "DEPLOYMENT" },
  ];

  const quality =
    copy.quality?.length >= 4
      ? copy.quality
      : [
          { title: "Hierarchy", body: "Brand and one sentence read first." },
          { title: "Consistency", body: "Rules hold across every page." },
          { title: "Performance", body: "Light surfaces, fast content." },
          { title: "Mobile-first", body: "CTA and copy never collapse." },
          { title: "Operable", body: "Built for post-launch edits." },
        ];

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-types-title"><div class="bs-inner">
    <p class="bs-eyebrow">WHAT WE BUILD</p>
    <h2 class="bs-title" id="bs-types-title">${escapeHtml(copy.typesTitle || "Website types")}</h2>
    <div class="bs-types">${types
      .map(
        (t) =>
          `<article class="bs-types__item"><span class="bs-types__n">${escapeHtml(t.n)}</span><div class="bs-types__body"><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.body)}</p></div></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-resp-title"><div class="bs-inner">
    <p class="bs-eyebrow">RESPONSIVE</p>
    <h2 class="bs-title" id="bs-resp-title">${escapeHtml(copy.responsiveTitle || "RESPONSIVE BY DEFAULT")}</h2>
    ${
      copy.responsiveLead
        ? `<p class="bs-lead">${escapeHtml(copy.responsiveLead)}</p>`
        : ""
    }
    <div class="bs-responsive" aria-hidden="true">
      <div class="bs-responsive__frame bs-responsive__frame--desk">
        <div class="bs-responsive__chrome"><span class="bs-responsive__label">DESKTOP</span><div class="bs-responsive__bar"><span></span><span></span><span></span></div></div>
        <div class="bs-responsive__page">
          <div class="bs-responsive__top"><strong>NEW PRODUCT</strong><em>Menu</em></div>
          <p class="bs-responsive__hero">Build something people want to use.</p>
          <span class="bs-responsive__cta">Explore →</span>
          <div class="bs-responsive__cols"><i></i><i></i><i></i></div>
        </div>
      </div>
      <div class="bs-responsive__frame bs-responsive__frame--tab">
        <div class="bs-responsive__chrome"><span class="bs-responsive__label">TABLET</span><div class="bs-responsive__bar"><span></span><span></span><span></span></div></div>
        <div class="bs-responsive__page">
          <div class="bs-responsive__top"><strong>NEW PRODUCT</strong><em>≡</em></div>
          <p class="bs-responsive__hero">Build something people want to use.</p>
          <span class="bs-responsive__cta">Explore →</span>
          <div class="bs-responsive__cols bs-responsive__cols--2"><i></i><i></i></div>
        </div>
      </div>
      <div class="bs-responsive__frame bs-responsive__frame--mob">
        <div class="bs-responsive__chrome"><span class="bs-responsive__label">MOBILE</span></div>
        <div class="bs-responsive__page">
          <div class="bs-responsive__top"><strong>NEW PRODUCT</strong><em>≡</em></div>
          <p class="bs-responsive__hero">Build something people want to use.</p>
          <span class="bs-responsive__cta">Explore →</span>
          <div class="bs-responsive__cols bs-responsive__cols--1"><i></i><i></i></div>
        </div>
      </div>
    </div>
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-rail-title"><div class="bs-inner">
    <p class="bs-eyebrow">FROM STRUCTURE TO LAUNCH</p>
    <h2 class="bs-title" id="bs-rail-title">${escapeHtml(copy.railTitle || "FROM STRUCTURE TO LAUNCH")}</h2>
    ${railHtml(railSteps)}
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-quality-title"><div class="bs-inner">
    <p class="bs-eyebrow">QUALITY</p>
    <h2 class="bs-title" id="bs-quality-title">${escapeHtml(copy.qualityTitle || "BUILT FOR THE REAL WEB")}</h2>
    <div class="bs-quality">${quality
      .map(
        (q, i) =>
          `<article class="bs-quality__item"><span class="bs-quality__n">${pad2(i + 1)}</span><h3>${escapeHtml(q.title)}</h3><p>${escapeHtml(q.body)}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  return html;
}

function appExtras(copy) {
  const processSteps =
    copy.processItems?.length >= 7
      ? copy.processItems.slice(0, 7)
      : [
          ...(copy.processItems || []),
          ...[
            { n: "01", title: "Product definition", body: "Who it's for and what ships first." },
            { n: "02", title: "Flow & UI", body: "Onboarding to core task." },
            { n: "03", title: "Shared product layer", body: "One experience across platforms." },
            { n: "04", title: "Native polish", body: "iOS and Android patterns." },
            { n: "05", title: "API & data", body: "Auth, sync, notifications." },
            { n: "06", title: "Test builds", body: "Real-device validation." },
            { n: "07", title: "Store release", body: "Listing, review, launch." },
          ].slice(copy.processItems?.length || 0),
        ].slice(0, 7);

  const screens = [
    { label: "01", title: "Onboarding" },
    { label: "02", title: "Home" },
    { label: "03", title: "Detail" },
    { label: "04", title: "Premium" },
    { label: "05", title: "Profile" },
  ];
  const preview = copy.previewScreens?.length >= 5 ? copy.previewScreens.slice(0, 5) : screens;

  const caps = copy.capabilityChips?.length
    ? copy.capabilityChips
    : [
        "Authentication",
        "Notifications",
        "Subscription",
        "API",
        "Analytics",
        "Localization",
        "Dark Mode",
        "Store Release",
      ];

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-plat-title"><div class="bs-inner">
    <p class="bs-eyebrow">PLATFORM</p>
    <h2 class="bs-title" id="bs-plat-title">${escapeHtml(copy.platformTitle || "ONE PRODUCT. TWO PLATFORMS.")}</h2>
    <div class="bs-plat" aria-hidden="true">
      <div class="bs-plat__side"><span>iOS</span></div>
      <div class="bs-plat__mid"><strong>SHARED PRODUCT EXPERIENCE</strong><p>One product logic. Platform-native feel.</p></div>
      <div class="bs-plat__side"><span>Android</span></div>
    </div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal id="process" aria-labelledby="bs-app-process-title"><div class="bs-inner">
    <p class="bs-eyebrow">PROCESS</p>
    <h2 class="bs-title" id="bs-app-process-title">${escapeHtml(copy.processTitle || "FROM FIRST SCREEN TO STORE RELEASE")}</h2>
    ${processList(
      processSteps.map((s, i) => ({
        n: s.n || pad2(i + 1),
        title: s.title,
        body: s.body || "",
      }))
    )}
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-screens-title"><div class="bs-inner">
    <p class="bs-eyebrow">PREVIEW</p>
    <h2 class="bs-title" id="bs-screens-title">${escapeHtml(copy.screensTitle || "APP EXPERIENCE PREVIEW")}</h2>
    <div class="bs-screens">${preview
      .map(
        (s, i) =>
          `<article class="bs-screens__item"><p>${escapeHtml(s.label || pad2(i + 1))}</p><div class="bs-screens__frame" aria-hidden="true"><span class="bs-screens__title-bar"></span><span></span><span></span><span style="width:70%"></span><div class="bs-screens__block"></div></div><strong>${escapeHtml(s.title)}</strong></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-caps-title"><div class="bs-inner">
    <p class="bs-eyebrow">CAPABILITY</p>
    <h2 class="bs-title" id="bs-caps-title">${escapeHtml(copy.capabilityTitle || "Built-in product capabilities")}</h2>
    ${chips(caps)}
  </div></section>`;

  return html;
}

function aiExtras(copy) {
  const defaultAreas = [
    { n: "01", title: "Customer inquiry", body: "Classify, draft, route." },
    { n: "02", title: "Review analysis", body: "Theme clusters and insights." },
    { n: "03", title: "Content drafts", body: "Tone-matched first drafts." },
    { n: "04", title: "Document summary", body: "Decision-ready briefs." },
    { n: "05", title: "Internal search", body: "Answers with sources." },
    { n: "06", title: "Ops automation", body: "Reports, alerts, cleanup." },
  ];
  const useCases = (copy.areas?.length ? copy.areas : defaultAreas).map((a, i) => ({
    ...a,
    n: a.n || pad2(i + 1),
  }));

  const before = copy.beforeSteps || [
    "Requests arrive across channels",
    "Humans classify and draft everything",
    "Answers drift by person",
    "Status is visible too late",
  ];
  const after = copy.afterSteps || [
    "Requests classify automatically",
    "Drafts and summaries appear first",
    "Humans handle review and exceptions",
    "Outcomes stay in the record",
  ];

  const loopSteps = copy.loopSteps?.length
    ? copy.loopSteps
    : [
        { n: "01", title: "AI PROCESS", body: "" },
        { n: "02", title: "CONFIDENCE CHECK", body: "" },
        { n: "03", title: "HUMAN REVIEW", body: "" },
        { n: "04", title: "APPROVED", body: "" },
        { n: "05", title: "ACTION", body: "" },
      ];

  const humanItems = copy.humanItems?.length
    ? copy.humanItems
    : ["Final judgment", "Exceptions", "Brand tone", "Policy", "Quality bar"];

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-compare-title"><div class="bs-inner">
    <p class="bs-eyebrow">COMPARE</p>
    <h2 class="bs-title" id="bs-compare-title">${escapeHtml(copy.compareTitle || "BEFORE vs AFTER")}</h2>
    ${copy.compareLead ? `<p class="bs-lead">${escapeHtml(copy.compareLead)}</p>` : ""}
    <div class="bs-compare">
      <div class="bs-compare__col">
        <div class="bs-compare__head"><span class="bs-compare__tag">01</span><h3>${escapeHtml(copy.beforeTitle || "BEFORE")}</h3></div>
        <ol>${before.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
      </div>
      <div class="bs-compare__col is-after">
        <div class="bs-compare__head"><span class="bs-compare__tag">02</span><h3>${escapeHtml(copy.afterTitle || "AFTER")}</h3></div>
        <ol>${after.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
      </div>
    </div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-areas-title"><div class="bs-inner">
    <p class="bs-eyebrow">USE CASES</p>
    <h2 class="bs-title" id="bs-areas-title">${escapeHtml(copy.areasTitle || "AUTOMATION USE CASES")}</h2>
    ${copy.areasLead ? `<p class="bs-lead">${escapeHtml(copy.areasLead)}</p>` : ""}
    <div class="bs-areas">${useCases
      .map(
        (a) =>
          `<article class="bs-areas__item"><span class="bs-areas__n">${escapeHtml(a.n)}</span><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.body || "")}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-loop-title"><div class="bs-inner">
    <p class="bs-eyebrow">GOVERNANCE</p>
    <h2 class="bs-title" id="bs-loop-title">${escapeHtml(copy.humanTitle || "HUMAN IN THE LOOP")}</h2>
    ${copy.humanLead ? `<p class="bs-lead">${escapeHtml(copy.humanLead)}</p>` : ""}
    <div class="bs-loop" aria-hidden="true">${loopSteps
      .map(
        (s, i) =>
          `<div class="bs-loop__step"><span class="bs-loop__n">${escapeHtml(s.n || pad2(i + 1))}</span><strong class="bs-loop__t">${escapeHtml(s.title)}</strong>${s.body ? `<p class="bs-loop__b">${escapeHtml(s.body)}</p>` : ""}</div>`
      )
      .join("")}</div>
    <div class="bs-human">
      <p class="bs-human__k">${escapeHtml(copy.humanLabel || "STAYS HUMAN")}</p>
      <ul class="bs-human__list">${humanItems.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
    </div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-status-title"><div class="bs-inner">
    <p class="bs-eyebrow">STATUS</p>
    <h2 class="bs-title" id="bs-status-title">${escapeHtml(copy.statusTitle || "WORKFLOW STATUS")}</h2>
    <div class="bs-status">
      <div class="bs-status__top">
        <p class="bs-demo__badge">DEMO DATA</p>
        <span class="bs-status__live"><i></i> RUNNING</span>
      </div>
      <div class="bs-status__grid">
        <div class="bs-status__cell"><p class="bs-demo__k">STATUS</p><p class="bs-demo__v">RUNNING</p></div>
        <div class="bs-status__cell"><p class="bs-demo__k">TASKS PROCESSED</p><p class="bs-demo__v">128</p></div>
        <div class="bs-status__cell"><p class="bs-demo__k">NEEDS REVIEW</p><p class="bs-demo__v">6</p></div>
        <div class="bs-status__cell"><p class="bs-demo__k">AUTOMATION</p><p class="bs-demo__v">ACTIVE</p></div>
        <div class="bs-status__cell"><p class="bs-demo__k">LAST RUN</p><p class="bs-demo__v">JUST NOW</p></div>
      </div>
      <div class="bs-status__queue" aria-hidden="true">
        <div class="bs-status__row"><span class="bs-status__id">#128</span><span>Refund inquiry draft</span><em class="is-review">REVIEW</em></div>
        <div class="bs-status__row"><span class="bs-status__id">#127</span><span>Review theme cluster</span><em class="is-done">DONE</em></div>
        <div class="bs-status__row"><span class="bs-status__id">#126</span><span>Help article outline</span><em class="is-run">RUNNING</em></div>
      </div>
    </div>
  </div></section>`;

  return html;
}

function whiteLabelExtras(copy) {
  const howDefaults = [
    { n: "01", title: "Base", body: "Choose a validated product foundation." },
    { n: "02", title: "Brand", body: "Logo, color, type, and tone." },
    { n: "03", title: "Configure", body: "Turn modules on or off." },
    { n: "04", title: "Launch", body: "Ship and hand over operations." },
  ];
  const how = (copy.how?.length ? copy.how : howDefaults).map((h, i) => ({
    ...h,
    n: h.n || pad2(i + 1),
  }));

  const customAreas = (
    copy.customAreas?.length
      ? copy.customAreas
      : [
          { n: "01", title: "BRAND", body: copy.customItems?.[0] || "Logo, color, typography" },
          { n: "02", title: "PRODUCT", body: copy.customItems?.[2] || "Modules and workflows" },
          { n: "03", title: "CONTENT", body: copy.customItems?.[1] || "Menus, copy, media" },
          { n: "04", title: "SYSTEM", body: copy.customItems?.[5] || "Domain, email, permissions" },
        ]
  ).map((c, i) => ({ ...c, n: c.n || pad2(i + 1) }));

  const u = copy.useCase || {};
  const features = u.features || ["Inquiry inbox", "Booking", "CRM light", "Admin dashboard"];
  const baseBody =
    copy.foundationBaseBody || "Shared product core, proven flows, admin and data model.";
  const brandBody =
    copy.foundationBrandBody || "Identity, domain, features, and content that feel like yours.";

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-found-title"><div class="bs-inner">
    <p class="bs-eyebrow">FOUNDATION</p>
    <h2 class="bs-title" id="bs-found-title">${escapeHtml(copy.foundationTitle || "ONE FOUNDATION. YOUR EXPERIENCE.")}</h2>
    ${copy.foundationLead ? `<p class="bs-lead">${escapeHtml(copy.foundationLead)}</p>` : ""}
    <div class="bs-foundation">
      <div class="bs-foundation__col">
        <div class="bs-foundation__head"><span>01</span><p class="bs-foundation__k">${escapeHtml(copy.foundationBaseLabel || "BASE SYSTEM")}</p></div>
        <p>${escapeHtml(baseBody)}</p>
        <ul class="bs-foundation__tags"><li>Core flows</li><li>Admin</li><li>Data model</li></ul>
      </div>
      <div class="bs-foundation__col is-brand">
        <div class="bs-foundation__head"><span>02</span><p class="bs-foundation__k">${escapeHtml(copy.foundationBrandLabel || "YOUR BRAND")}</p></div>
        <p>${escapeHtml(brandBody)}</p>
        <ul class="bs-foundation__tags"><li>Identity</li><li>Domain</li><li>Modules</li></ul>
      </div>
    </div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-custom-title"><div class="bs-inner">
    <p class="bs-eyebrow">CUSTOMIZE</p>
    <h2 class="bs-title" id="bs-custom-title">${escapeHtml(copy.customTitle || "Customize four areas")}</h2>
    ${copy.customLead ? `<p class="bs-lead">${escapeHtml(copy.customLead)}</p>` : ""}
    <div class="bs-config">${customAreas
      .map(
        (c) =>
          `<article class="bs-config__item"><span class="bs-config__n">${escapeHtml(c.n)}</span><strong>${escapeHtml(c.title)}</strong><span>${escapeHtml(c.body || "")}</span></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-how-title"><div class="bs-inner">
    <p class="bs-eyebrow">HOW IT WORKS</p>
    <h2 class="bs-title" id="bs-how-title">${escapeHtml(copy.howTitle || "How it works")}</h2>
    ${copy.howLead ? `<p class="bs-lead">${escapeHtml(copy.howLead)}</p>` : ""}
    <div class="bs-how">${how
      .map(
        (h) =>
          `<article class="bs-how__item"><span class="bs-how__n">${escapeHtml(h.n)}</span><h3>${escapeHtml(h.title)}</h3><p>${escapeHtml(h.body || "")}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-cfg-title"><div class="bs-inner">
    <p class="bs-eyebrow">DEMO</p>
    <h2 class="bs-title" id="bs-cfg-title">${escapeHtml(copy.useCaseTitle || "Configuration")}</h2>
    <div class="bs-configurator">
      <div class="bs-configurator__top">
        <p class="bs-demo__badge">DEMO CONFIGURATION</p>
        <span class="bs-configurator__ready"><i></i> ${escapeHtml(u.status || "READY TO CUSTOMIZE")}</span>
      </div>
      <div class="bs-configurator__grid">
        <div class="bs-configurator__cell"><p class="bs-demo__k">PRODUCT</p><p class="bs-demo__v">${escapeHtml(u.base || "Operations Suite")}</p></div>
        <div class="bs-configurator__cell"><p class="bs-demo__k">BRAND</p><p class="bs-demo__v">${escapeHtml(u.brand || "Your Brand")}</p></div>
        <div class="bs-configurator__cell"><p class="bs-demo__k">PRIMARY COLOR</p><p class="bs-demo__v bs-configurator__swatch"><i></i> ${escapeHtml(u.color || "#1F1F1F")}</p></div>
        <div class="bs-configurator__cell bs-configurator__cell--wide"><p class="bs-demo__k">FEATURES</p><ul class="bs-configurator__list">${features.map((f) => `<li><span>✓</span>${escapeHtml(f)}</li>`).join("")}</ul></div>
        <div class="bs-configurator__cell"><p class="bs-demo__k">DOMAIN</p><p class="bs-demo__v">${escapeHtml(u.domain || "app.yourbrand.com")}</p></div>
        <div class="bs-configurator__cell"><p class="bs-demo__k">STATUS</p><p class="bs-demo__v">${escapeHtml(u.status || "READY TO CUSTOMIZE")}</p></div>
      </div>
      <div class="bs-configurator__preview" aria-hidden="true">
        <div class="bs-configurator__app">
          <div class="bs-configurator__appbar"><strong>${escapeHtml(u.brand || "Your Brand")}</strong><em>Admin</em></div>
          <div class="bs-configurator__appbody">
            <i></i><i></i><i></i>
          </div>
        </div>
        <p class="bs-configurator__hint">${escapeHtml(copy.configHint || "Same foundation · your brand surface")}</p>
      </div>
    </div>
  </div></section>`;

  if (copy.benefits?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-benefits-title"><div class="bs-inner">
      <p class="bs-eyebrow">OUTCOME</p>
      <h2 class="bs-title" id="bs-benefits-title">${escapeHtml(copy.benefitsTitle || "What to expect")}</h2>
      <ol class="bs-benefits">${copy.benefits
        .map(
          (t, i) =>
            `<li class="bs-benefits__item"><span class="bs-benefits__n">${pad2(i + 1)}</span><p>${escapeHtml(t)}</p></li>`
        )
        .join("")}</ol>
    </div></section>`;
  }

  return html;
}

function designExtras(copy) {
  const defaultServices = [
    { n: "01", title: "Brand Identity", body: "Logo system, color, type." },
    { n: "02", title: "Product UI/UX", body: "Flows and key screens." },
    { n: "03", title: "Design System", body: "Reusable components." },
    { n: "04", title: "Landing", body: "Marketing surfaces." },
    { n: "05", title: "UX improvement", body: "Onboarding and conversion." },
    { n: "06", title: "Handoff", body: "Specs for build." },
  ];
  const designItems = (copy.services?.length ? copy.services : defaultServices).map((s, i) => ({
    ...s,
    n: s.n || pad2(i + 1),
  }));

  const railSteps = (
    copy.process2?.length
      ? copy.process2
      : ["Research & goals", "IA / user flow", "Wireframe", "UI design", "Prototype review", "System & handoff"]
  ).map((t, i) => ({
    n: pad2(i + 1),
    title: typeof t === "string" ? t.toUpperCase() : String(t.title || t).toUpperCase(),
  }));

  const pillars = copy.brandPillars?.length
    ? copy.brandPillars
    : [
        { n: "01", title: "IDENTITY", body: "Logo, tone, and recognition." },
        { n: "02", title: "PRODUCT", body: "Flows that complete the job." },
        { n: "03", title: "INTERFACE", body: "Components and visual rules." },
        { n: "04", title: "EXPERIENCE", body: "One coherent product feel." },
      ];

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-brandgrid-title"><div class="bs-inner">
    <p class="bs-eyebrow">SYSTEM</p>
    <h2 class="bs-title" id="bs-brandgrid-title">${escapeHtml(copy.brandGridTitle || "BRAND IS A SYSTEM")}</h2>
    ${copy.brandGridLead ? `<p class="bs-lead">${escapeHtml(copy.brandGridLead)}</p>` : ""}
    <div class="bs-brand-grid">${pillars
      .map(
        (p, i) =>
          `<article class="bs-brand-grid__item"><span class="bs-brand-grid__n">${escapeHtml(p.n || pad2(i + 1))}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.body || "")}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-dserv-title"><div class="bs-inner">
    <p class="bs-eyebrow">WHAT WE DESIGN</p>
    <h2 class="bs-title" id="bs-dserv-title">${escapeHtml(copy.servicesTitle || "What we design")}</h2>
    ${copy.servicesLead ? `<p class="bs-lead">${escapeHtml(copy.servicesLead)}</p>` : ""}
    <div class="bs-design-scope">${designItems
      .map(
        (s) =>
          `<article class="bs-design-scope__item"><span class="bs-design-scope__n">${escapeHtml(s.n)}</span><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.body || "")}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-drail-title"><div class="bs-inner">
    <p class="bs-eyebrow">PROCESS</p>
    <h2 class="bs-title" id="bs-drail-title">${escapeHtml(copy.processTitle2 || "FROM IDEA TO VISUAL SYSTEM")}</h2>
    ${copy.process2Lead ? `<p class="bs-lead">${escapeHtml(copy.process2Lead)}</p>` : ""}
    ${railHtml(railSteps, "bs-rail bs-rail--design")}
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-lib-title"><div class="bs-inner">
    <p class="bs-eyebrow">LIBRARY</p>
    <h2 class="bs-title" id="bs-lib-title">${escapeHtml(copy.systemTitle || "Component Library")}</h2>
    ${copy.systemLead ? `<p class="bs-lead">${escapeHtml(copy.systemLead)}</p>` : ""}
    <div class="bs-library" aria-hidden="true">
      <div class="bs-library__top">
        <p class="bs-demo__badge">COMPONENT PREVIEW</p>
        <span class="bs-library__live"><i></i> SYSTEM</span>
      </div>
      <div class="bs-library__grid">
        <div class="bs-library__col">
          <p class="bs-library__k">BUTTONS</p>
          <span class="bs-library__btn is-fill">Primary</span>
          <span class="bs-library__btn is-line">Secondary</span>
        </div>
        <div class="bs-library__col">
          <p class="bs-library__k">INPUTS</p>
          <span class="bs-library__input">Email</span>
          <span class="bs-library__input is-focus">Focused</span>
        </div>
        <div class="bs-library__col">
          <p class="bs-library__k">TYPE</p>
          <span class="bs-library__type-lg">Display</span>
          <span class="bs-library__type-sm">Body / Caption</span>
        </div>
        <div class="bs-library__col">
          <p class="bs-library__k">SPACING</p>
          <div class="bs-library__space"><i style="width:25%"></i><i style="width:50%"></i><i style="width:75%"></i><i style="width:100%"></i></div>
        </div>
      </div>
    </div>
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ba-title"><div class="bs-inner">
    <p class="bs-eyebrow">CONCEPT</p>
    <h2 class="bs-title" id="bs-ba-title">${escapeHtml(copy.beforeAfterTitle || "Before / After")}</h2>
    ${copy.beforeAfterLead ? `<p class="bs-lead">${escapeHtml(copy.beforeAfterLead)}</p>` : ""}
    <div class="bs-ba">
      <div class="bs-ba__col">
        <div class="bs-ba__head"><span>01</span><p class="bs-ba__label">${escapeHtml(copy.beforeLabel || "BEFORE")}</p></div>
        <div class="bs-ba__mock is-before" aria-hidden="true">
          <div class="bs-ba__noise"></div>
          <div class="bs-ba__noise"></div>
          <div class="bs-ba__noise is-cta"></div>
          <div class="bs-ba__noise is-cta"></div>
        </div>
        <p class="bs-ba__note">${escapeHtml(copy.beforeNote || "")}</p>
      </div>
      <div class="bs-ba__col">
        <div class="bs-ba__head"><span>02</span><p class="bs-ba__label">${escapeHtml(copy.afterLabel || "AFTER")}</p></div>
        <div class="bs-ba__mock is-after" aria-hidden="true">
          <strong>NEW PRODUCT</strong>
          <p>One clear action.</p>
          <span>Get started →</span>
        </div>
        <p class="bs-ba__note">${escapeHtml(copy.afterNote || "")}</p>
      </div>
    </div>
  </div></section>`;

  return html;
}

function extrasFor(slug, copy) {
  switch (slug) {
    case "mvp":
      return mvpExtras(copy);
    case "web":
      return webExtras(copy);
    case "app":
      return appExtras(copy);
    case "ai-automation":
      return aiExtras(copy);
    case "white-label":
      return whiteLabelExtras(copy);
    case "design":
      return designExtras(copy);
    default:
      return "";
  }
}

function buildBody(page, copy, copies) {
  const inq = inquiryHref(page.slug);
  const processId = "process";
  const skipCommonProcess = page.slug === "app"; // app process lives in extras (7 steps)

  let mid = "";

  if (copy.solveItems?.length) {
    mid += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-solve-title"><div class="bs-inner">
      <p class="bs-eyebrow">WHAT WE SOLVE</p>
      <h2 class="bs-title" id="bs-solve-title">${escapeHtml(copy.solveTitle || "")}</h2>
      ${listNumbered(copy.solveItems, "bs-solve")}
    </div></section>`;
  }

  if (copy.getItems?.length && page.slug !== "design" && page.slug !== "white-label" && page.slug !== "ai-automation") {
    mid += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-get-title"><div class="bs-inner">
      <p class="bs-eyebrow">WHAT YOU GET</p>
      <h2 class="bs-title" id="bs-get-title">${escapeHtml(copy.getTitle || "")}</h2>
      ${listNumbered(copy.getItems, "bs-get")}
    </div></section>`;
  }

  mid += extrasFor(page.slug, copy);

  if (copy.processItems?.length && !skipCommonProcess) {
    mid += `<section class="bs-section" data-bs-reveal id="${processId}" aria-labelledby="bs-process-title"><div class="bs-inner">
      <p class="bs-eyebrow">PROCESS</p>
      <h2 class="bs-title" id="bs-process-title">${escapeHtml(copy.processTitle || "")}</h2>
      ${processList(copy.processItems)}
    </div></section>`;
  }

  if (copy.deliverItems?.length) {
    mid += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-del-title"><div class="bs-inner">
      <p class="bs-eyebrow">DELIVERABLES</p>
      <h2 class="bs-title" id="bs-del-title">${escapeHtml(copy.deliverTitle || "")}</h2>
      ${chips(copy.deliverItems)}
    </div></section>`;
  }

  if (copy.whoItems?.length) {
    mid += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-who-title"><div class="bs-inner">
      <p class="bs-eyebrow">WHO IT'S FOR</p>
      <h2 class="bs-title" id="bs-who-title">${escapeHtml(copy.whoTitle || "")}</h2>
      ${whoList(copy.whoItems)}
    </div></section>`;
  }

  if (copy.faqs?.length) {
    mid += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-faq-title"><div class="bs-inner">
      <p class="bs-eyebrow">FAQ</p>
      <h2 class="bs-title" id="bs-faq-title">${escapeHtml(copy.faqTitle || "FAQ")}</h2>
      ${faqHtml(copy.faqs)}
    </div></section>`;
  }

  mid += relatedHtml(page, copy, copies);
  mid += adjacentHtml(page, copy, copies);

  mid += `<section class="bs-section bs-section--dark bs-final" data-bs-reveal aria-labelledby="bs-final-title"><div class="bs-inner">
    <h2 class="bs-final__title" id="bs-final-title">${brHeadline(copy.ctaFinalTitle || "")}</h2>
    ${copy.ctaFinalLead ? `<p class="bs-lead">${escapeHtml(copy.ctaFinalLead)}</p>` : ""}
    <a class="bs-btn bs-btn--primary" href="${inq}" data-bs-cta="final" data-analytics="business_service_cta_click">${escapeHtml(copy.ctaFinalBtn || copy.ctaPrimary)}</a>
  </div></section>`;

  return `${breadcrumb(copy)}
<section class="bs-hero" data-bs-reveal aria-labelledby="bs-hero-title">
  <div class="bs-inner bs-hero__grid">
    <div>
      <p class="bs-eyebrow">${escapeHtml(copy.eyebrow || "")}${copy.subEyebrow ? `<span class="bs-eyebrow__sep" aria-hidden="true">·</span><span class="bs-eyebrow__sub">${escapeHtml(copy.subEyebrow)}</span>` : ""}</p>
      <h1 class="bs-hero__title" id="bs-hero-title">${brHeadline(copy.headline)}</h1>
      <p class="bs-hero__lead">${escapeHtml(copy.lead || "")}</p>
      <div class="bs-hero__actions">
        <a class="bs-btn bs-btn--primary" href="${inq}" data-bs-cta="hero_primary" data-analytics="business_service_cta_click">${escapeHtml(copy.ctaPrimary || "")}</a>
        <a class="bs-btn bs-btn--ghost" href="#${processId}" data-bs-cta="hero_secondary">${escapeHtml(copy.ctaSecondary || "")}</a>
      </div>
    </div>
    ${heroVisual(page.visual, copy)}
  </div>
</section>
${serviceNav(page.slug, copies)}
${mid}`;
}

function writeRedirect(slug) {
  const dir = path.join(ROOT, "business", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=/en/business/${slug}/"/><link rel="canonical" href="${SITE_ORIGIN}/en/business/${slug}/"/><title>Redirect</title></head><body><p><a href="/en/business/${slug}/">Continue</a></p></body></html>\n`
  );
}

export function renderBusinessServices() {
  const flatEn = flatten(loadJson("en.json"));

  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(loadJson(file));
    const lang = dir === "ko" ? "ko" : "en";
    const copies = Object.fromEntries(BUSINESS_SERVICE_PAGES.map((p) => [p.slug, getServiceCopy(p.slug, lang)]));

    for (const page of BUSINESS_SERVICE_PAGES) {
      const copy = copies[page.slug];
      let html = template;
      html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
      html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
      html = html.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/business/${page.slug}/`);
      html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(page.slug));
      html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(copy.seoTitle || ""));
      html = html.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(copy.metaDescription || ""));
      html = html.replace(/\{\{SERVICE_SLUG\}\}/g, page.slug);
      html = html.replace(/\{\{ANALYTICS_ID\}\}/g, page.analyticsId);
      html = html.replace(/\{\{PAGE_BODY\}\}/g, buildBody(page, copy, copies));
      html = injectSiteChrome(html, flat, flatEn, { activeNav: "business", base: "../../" });

      const outDir = path.join(ROOT, dir, "business", page.slug);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
    }
  }

  for (const page of BUSINESS_SERVICE_PAGES) {
    writeRedirect(page.slug);
  }

  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const { dir } of LANGS) {
      for (const page of BUSINESS_SERVICE_PAGES) {
        const src = path.join(ROOT, dir, "business", page.slug, "index.html");
        const destDir = path.join(pub, dir, "business", page.slug);
        if (!fs.existsSync(src)) continue;
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, path.join(destDir, "index.html"));
      }
    }
    for (const page of BUSINESS_SERVICE_PAGES) {
      const src = path.join(ROOT, "business", page.slug, "index.html");
      const destDir = path.join(pub, "business", page.slug);
      if (!fs.existsSync(src)) continue;
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, path.join(destDir, "index.html"));
    }
    fs.copyFileSync(path.join(ROOT, "business-service.css"), path.join(pub, "business-service.css"));
    fs.copyFileSync(path.join(ROOT, "business-service.js"), path.join(pub, "business-service.js"));
  }

  console.log(`render-business-services: ${BUSINESS_SERVICE_PAGES.length} services × ${LANGS.length} langs`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("render-business-services.mjs")) {
  renderBusinessServices();
}
