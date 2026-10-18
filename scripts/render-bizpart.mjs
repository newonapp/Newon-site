#!/usr/bin/env node
/**
 * NEWON Business & Partnerships — the five hub screens × 9 locales, plus the redirect stubs that retire the
 * old Business and Partnerships URLs (2026-10-19 owner brief: one "Business & Partnerships" menu).
 *
 *   /{lang}/business/                 01 Overview         (Studio film)
 *   /{lang}/business/platforms/       02 Our Platforms    (Studio film)
 *   /{lang}/business/models/          03 Business Models  (Studio film)
 *   /{lang}/business/partnerships/    04 Partnerships     (Partnerships film)
 *   /{lang}/business/contact/         05 Contact          (Partnerships film)
 *
 * Design: the BABYLOG corporate-site pattern, unchanged — hub-shell + Life Stage nls-* components
 * (home-lifestage CSS/JS), the shared five-menu bar (flagship-subnav, `bizpart` config) directly under the
 * film hero, and /bizpart-site.css (babylog-site.css re-scoped to data-story="bizpart"). Black/white only.
 *
 * Contact reuses the existing inquiry mechanism unchanged in behaviour: form#bz-inquiry-form +
 * /business/inquiry.js (FormSubmit, honeypot, validation, e-mail fallback, shared success page).
 * /{lang}/business/inquiry/ (used by the six business sites) is not touched.
 *
 * Old URLs: every retired Business / Partnerships page becomes a static redirect stub (GitHub Pages has no
 * server 301): noindex + canonical to the new page + meta refresh + location.replace. See LEGACY_REDIRECTS.
 * Runs last among the page renderers (after render-bsp / render-business-* which still write the old pages).
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
  ensureDir,
  escapeHtml,
  pick,
  fontLinksHtml,
} from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";
import { renderStudioHeader, renderStudioFooter } from "./site-chrome.mjs";
import { renderFlagshipSubnav } from "./flagship-subnav.mjs";
import {
  BP_SLUG,
  BP_NAV,
  BP_FILMS,
  BP_PAGE_FILM,
  BP_PLATFORMS,
  BP_INQUIRY_TYPES,
  BP_INQUIRY_PLATFORMS,
  getBizpartCopy,
  bpCopyLang,
} from "./bizpart-content.mjs";

const esc = escapeHtml;
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");
const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20260924livon1"; // Life Stage assets are reused as-is
const BP_VER = "20261019bp1";

/** /{lang}/business/{sub}/ */
export const bpPath = (lang, sub = "") => `/${lang}/${BP_SLUG}/${sub ? sub + "/" : ""}`;
const navOf = (id) => BP_NAV.find((n) => n.id === id);
const pageHref = (lang, id) => bpPath(lang, navOf(id).sub);
const contactHref = (lang, q = "") => `${pageHref(lang, "contact")}${q ? "?" + q : ""}#bpt-form`;

/** Paths (without /{lang}/) of the five screens — sitemap + tests. */
export const BIZPART_PATHS = BP_NAV.map((n) => (n.sub ? `${BP_SLUG}/${n.sub}` : BP_SLUG));

/* ------------------------------------------------------------------------------------------------
 * Old URL → new screen. Keys are paths below /{lang}/ (and below the site root for the root stubs);
 * values are the new path below /{lang}/ (trailing slash). Outsourcing pages (web / app / MVP / landing /
 * renewal / maintenance / custom builds / research services / design services) go to Overview, which
 * states NEWON's own-platform model; product, automation and solution pages go to Business Models;
 * collaboration and partnership pages to Partnerships; the inquiry page to Contact.
 * ---------------------------------------------------------------------------------------------- */
const OV = "business/";
const PL = "business/platforms/";
const MO = "business/models/";
const PA = "business/partnerships/";
const CO = "business/contact/";
export const LEGACY_REDIRECTS = {
  // Build / custom production / care / research / design services (outsourcing) → Overview
  "business/build": OV,
  "business/build/app": OV,
  "business/build/landing": OV,
  "business/build/mvp": OV,
  "business/build/website": OV,
  "business/mvp": OV,
  "business/landing": OV,
  "business/web": OV,
  "business/app": OV,
  "business/website-renewal": OV,
  "business/improvement": OV,
  "business/care": OV,
  "business/maintenance": OV,
  "business/post-launch": OV,
  "business/research": OV,
  "business/market-research": OV,
  "business/competitor-analysis": OV,
  "business/consumer-research": OV,
  "business/trend-research": OV,
  "business/ux-audit": OV,
  "business/design": OV,
  "business/creative": OV,
  "business-hub": OV,
  // Own automation products, solutions and digital products → Business Models
  "business/automation": MO,
  "business/automation/workflow": MO,
  "business/automation/data-reporting": MO,
  "business/automation/internal-tools": MO,
  "business/ai-automation": MO,
  "business/data-reporting": MO,
  "business/internal-tools": MO,
  "business/booking": MO,
  "business/solutions": MO,
  "business/white-label": MO,
  "business/custom-product": MO,
  "business/internal-system": MO,
  "business/product-launch": MO,
  "business/digital-products": MO,
  // Collaboration and partnership pages → Partnerships
  "business/partners": PA,
  "business/seller-center": PA,
  "business/partnership": PA,
  "business/promotion": PA,
  "business/service": PA,
  "business/development": PA,
  "business/collaboration/partnership": PA,
  "business/collaboration/product-service": PA,
  "business/collaboration/promotion": PA,
  "business/collaboration/development": PA,
  partnerships: PA,
  "partnerships/corporate": PA,
  "partnerships/individuals": PA,
  "partnerships/public": PA,
  "partnerships/strategic": PA,
  "partnerships/platforms": PL,
  "partnerships/inquiry": CO,
  // Per-platform partnership pages → that platform's own Partnerships page (not modified)
  ...Object.fromEntries(BP_PLATFORMS.map((p) => [`partnerships/platforms/${p.id}`, `${p.slug}/partnerships/`])),
};
/** Root-only legacy stub (no /{lang}/ page ever existed). */
const ROOT_ONLY_REDIRECTS = { "business/workflow-automation": MO };

/** True when a path (with or without the /{lang}/ prefix) is a retired URL. */
export function isLegacyBizpartPath(p) {
  const clean = String(p || "").replace(/^\/+|\/+$/g, "").replace(/^(ko|en|ja|es|pt-br|fr|de|hi|id)(\/|$)/, "");
  return Object.prototype.hasOwnProperty.call(LEGACY_REDIRECTS, clean) || Object.prototype.hasOwnProperty.call(ROOT_ONLY_REDIRECTS, clean);
}

/* ------------------------------------------------------------------------------------------------
 * Blocks (same markup vocabulary as scripts/babylog-site-body.mjs)
 * ---------------------------------------------------------------------------------------------- */
function titleBlock(kicker, title, lead, id) {
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${esc(kicker)}</p>` : ""}
    <h2 class="nls-title" id="${id}">${nl(title)}</h2>
    ${lead ? `<p class="nls-lead">${esc(lead)}</p>` : ""}
  </header>`;
}
const chips = (items) => `<ul class="nls-chips">${(items || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
function block(id, inner, band = false, cls = "") {
  return `<section id="${id}" class="nls-block${band ? " nls-block--band" : ""}${cls ? " " + cls : ""}" data-hs-section aria-labelledby="${id}-title">${inner}</section>`;
}
/** Alternate band backgrounds in order (as on the BABYLOG pages). */
function bands(list) {
  return list.map((b, i) => block(b.id, b.inner, i % 2 === 1, b.cls || "")).join("\n");
}
function dl(rows) {
  return `<dl class="bpt-dl">${rows.map(([k, v]) => `<div class="bpt-dl__row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
}
const notice = (C) => `<p class="nls-note bpt-scope">${esc(C.ui.notice)}</p>`;

function hero(C, lang, page, h, compact) {
  const film = BP_FILMS[BP_PAGE_FILM[page]];
  return `<div class="nls-film bpt-film${compact ? " bpt-film--compact" : ""}" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${film}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${film}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__eyebrow" lang="en">${esc(h.eyebrow)}</p>
        <p class="nls-film__wordmark" lang="en">${esc(h.wordmark)}</p>
        <h1 id="bpt-title" class="nls-film__slogan">${h.titleHtml}</h1>
        <p class="nls-film__lead">${esc(h.lead)}</p>
        <div class="nls-film__actions">
          ${heroActions(lang, page, h)}
        </div>
      </div>
    </div>
  </div>`;
}

function heroActions(lang, page, h) {
  const first = {
    overview: `<a class="nls-btn" href="${pageHref(lang, "platforms")}">${esc(h.ctaMain)} →</a>`,
    platforms: `<a class="nls-btn" href="#bpt-list" data-nls-scroll>${esc(h.ctaMain)} ↓</a>`,
    models: `<a class="nls-btn" href="#bpt-models" data-nls-scroll>${esc(h.ctaMain)} ↓</a>`,
    partnerships: `<a class="nls-btn" href="#bpt-types" data-nls-scroll>${esc(h.ctaMain)} ↓</a>`,
    contact: `<a class="nls-btn" href="#bpt-form" data-nls-scroll>${esc(h.ctaMain)} ↓</a>`,
  }[page];
  const second = {
    overview: pageHref(lang, "models"),
    platforms: pageHref(lang, "models"),
    models: pageHref(lang, "partnerships"),
    partnerships: contactHref(lang),
    contact: pageHref(lang, "partnerships"),
  }[page];
  return `${first}
          <a class="nls-btn nls-btn--ghost" href="${second}">${esc(h.ctaSub)}</a>`;
}

function closeBlock(C, c, ctas) {
  return `<section id="bpt-close" class="nls-block nls-close nls-block--ink" data-hs-section aria-labelledby="bpt-close-title">
    <p class="nls-kicker">${esc(c.kicker)}</p>
    <h2 class="nls-hero__title" id="bpt-close-title">${c.titleHtml}</h2>
    <p class="nls-lead">${esc(c.lead)}</p>
    <p class="nls-note">${esc(C.ui.infoOnly)}</p>
    <div class="nls-actions">${ctas}</div>
  </section>`;
}

/** Platform detail links — the twelve existing flagship pages (never modified here). */
const platBiz = (lang, p) => `/${lang}/${p.slug}/business/`;
const platPart = (lang, p) => `/${lang}/${p.slug}/partnerships/`;

/* ------------------------------------------------------------------ 01 Overview */
function overviewBody(C, lang) {
  const o = C.overview;
  const cl = bpCopyLang(lang);
  const roster = o.about.lines.map((p, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${esc(p)}</p></li>`).join("");
  const plats = BP_PLATFORMS.map((p, i) => {
    const d = p[cl];
    return `<article class="bpt-biz bpt-plat" id="ov-${p.id}" aria-labelledby="ov-${p.id}-title">
      <header class="bpt-biz__head">
        <span class="bpt-biz__code" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <p class="nls-kicker" lang="en">${esc(p.category)}</p>
          <h3 id="ov-${p.id}-title" class="bpt-biz__title">${esc(p.name)}</h3>
        </div>
      </header>
      <p class="bpt-plat__headline">${esc(d.headline)}</p>
      <p class="bpt-plat__desc">${esc(d.desc)}</p>
      ${chips(d.keywords)}
      <ul class="bpt-plat__go">
        <li><a href="${platBiz(lang, p)}" aria-label="${esc(p.name)} — ${esc(C.ui.toBusiness)}">${esc(C.ui.toBusiness)} <span aria-hidden="true">→</span></a></li>
        <li><a href="${platPart(lang, p)}" aria-label="${esc(p.name)} — ${esc(C.ui.toPartnerships)}">${esc(C.ui.toPartnerships)} <span aria-hidden="true">→</span></a></li>
      </ul>
    </article>`;
  }).join("");
  const approach = o.approach.items
    .map((it) => `<article class="nls-flow__item"><span class="nls-flow__n">${esc(it.n)}</span><h3 lang="en">${esc(it.en)}</h3><p>${esc(it.lead)}</p></article>`)
    .join("");
  const eco = o.ecosystem.items
    .map((it) => `<article class="nls-proc__item"><span class="nls-proc__n">${esc(it.n)}</span><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`)
    .join("");
  const ctas = `<a class="nls-btn" href="${pageHref(lang, "platforms")}">${esc(o.close.ctaMain)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${contactHref(lang)}">${esc(o.close.ctaSub)}</a>`;
  return {
    hero: hero(C, lang, "overview", o.hero, false),
    main: [
      bands([
        { id: "bpt-about", inner: `<div class="nls-split">${titleBlock(o.about.kicker, o.about.title, "", "bpt-about-title")}<ol class="nls-roster">${roster}</ol></div>` },
        { id: "bpt-platforms", inner: `${titleBlock(o.platforms.kicker, o.platforms.title, o.platforms.lead, "bpt-platforms-title")}<div class="bpt-plats">${plats}</div>` },
        {
          id: "bpt-approach",
          inner: `${titleBlock(o.approach.kicker, o.approach.title, o.approach.lead, "bpt-approach-title")}<div class="nls-flow bpt-flow4">${approach}</div>
    <div class="nls-actions"><a class="nls-btn" href="${pageHref(lang, "models")}">${esc(o.approach.cta)} →</a></div>`,
        },
        { id: "bpt-ecosystem", inner: `${titleBlock(o.ecosystem.kicker, o.ecosystem.title, o.ecosystem.lead, "bpt-ecosystem-title")}<div class="nls-proc bpt-proc3">${eco}</div><p class="nls-note">${esc(o.ecosystem.note)}</p>` },
      ]),
      closeBlock(C, o.close, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ 02 Our Platforms */
function platformsBody(C, lang) {
  const P = C.platforms;
  const cl = bpCopyLang(lang);
  const rail = BP_PLATFORMS.map((p, i) => `<li><a class="bpt-rail__link" href="#platform-${p.id}"><span aria-hidden="true">${String(i + 1).padStart(2, "0")}</span> ${esc(p.name)}</a></li>`).join("");
  const cards = BP_PLATFORMS.map((p, i) => {
    const d = p[cl];
    return `<article id="platform-${p.id}" class="bpt-biz" aria-labelledby="platform-${p.id}-title">
      <header class="bpt-biz__head">
        <span class="bpt-biz__code" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <p class="nls-kicker" lang="en">${esc(p.name)} · ${esc(p.category)}</p>
          <h3 id="platform-${p.id}-title" class="bpt-biz__title">${esc(d.title)}</h3>
        </div>
      </header>
      <p class="bpt-biz__p">${esc(d.lead)}</p>
      ${dl([
        [C.ui.areasLabel, chips(d.areas)],
        [C.ui.partnersLabel, chips(d.partners)],
      ])}
      <p class="bpt-biz__cta">
        <a class="nls-btn" href="${platBiz(lang, p)}">${esc(C.ui.platformBusiness(p.name))} →</a>
        <a class="nls-btn nls-btn--ghost" href="${platPart(lang, p)}">${esc(C.ui.platformPartnerships(p.name))}</a>
      </p>
    </article>`;
  }).join("");
  const ctas = `<a class="nls-btn" href="${pageHref(lang, "models")}">${esc(P.close.ctaMain)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${contactHref(lang)}">${esc(P.close.ctaSub)}</a>`;
  return {
    hero: hero(C, lang, "platforms", P.hero, true),
    main: [
      block(
        "bpt-list",
        `${titleBlock(P.list.kicker, P.list.title, P.list.lead, "bpt-list-title")}
    <nav class="bpt-rail" aria-label="${esc(C.ui.railLabel)}"><ol class="bpt-rail__list">${rail}</ol></nav>
    <div class="bpt-biz__list">${cards}</div>`
      ),
      closeBlock(C, P.close, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ 03 Business Models */
function modelsBody(C, lang) {
  const M = C.models;
  const cards = M.items
    .map((m) => {
      const extra = [];
      if (m.apps) extra.push(`<p class="bpt-sub">${esc(C.ui.applicationsLabel)}</p>${chips(m.apps)}`);
      if (m.links === "tools") {
        extra.push(`<p class="bpt-biz__cta"><a class="nls-btn nls-btn--ghost" href="#bpt-now">${esc(M.now.kicker.replace(/^\d+ · /, ""))} ↓</a></p>`);
      }
      if (m.note) extra.push(`<p class="nls-note">${esc(m.note)}</p>`);
      return `<article id="model-${m.code}" class="bpt-biz" aria-labelledby="model-${m.code}-title">
      <header class="bpt-biz__head">
        <span class="bpt-biz__code" aria-hidden="true">${esc(m.code)}</span>
        <div>
          <p class="nls-kicker" lang="en">${esc(m.category)}</p>
          <h3 id="model-${m.code}-title" class="bpt-biz__title">${esc(m.name)}</h3>
        </div>
      </header>
      ${m.body.map((t) => `<p class="bpt-biz__p">${esc(t)}</p>`).join("\n      ")}
      ${extra.join("\n      ")}
    </article>`;
    })
    .join("");
  const now = M.now.items
    .map(
      (it) => `<li><a class="bpt-card" href="/${lang}/${it.href}">
        <span class="bpt-card__n" aria-hidden="true">${esc(it.n)}</span>
        <strong class="bpt-card__t">${esc(it.name)}</strong>
        <span class="bpt-card__d">${esc(it.lead)}</span>
        <span class="bpt-card__go">${esc(it.go)} →</span>
      </a></li>`
    )
    .join("");
  const dir = M.principles.items.map((s) => `<li><span>${esc(s.n)}</span><div><strong>${esc(s.name)}</strong><p>${esc(s.body)}</p></div></li>`).join("");
  const ctas = `<a class="nls-btn" href="${pageHref(lang, "platforms")}">${esc(M.close.ctaMain)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${contactHref(lang, "type=general")}">${esc(M.close.ctaSub)}</a>`;
  return {
    hero: hero(C, lang, "models", M.hero, true),
    main: [
      bands([
        { id: "bpt-models", inner: `${titleBlock(M.list.kicker, M.list.title, M.list.lead, "bpt-models-title")}<div class="bpt-biz__list">${cards}</div>` },
        { id: "bpt-now", inner: `${titleBlock(M.now.kicker, M.now.title, M.now.lead, "bpt-now-title")}<ul class="bpt-cards bpt-cards--2">${now}</ul>` },
        { id: "bpt-principles", inner: `<div class="nls-split"><div>${titleBlock(M.principles.kicker, M.principles.title, M.principles.lead, "bpt-principles-title")}</div><ol class="nls-dir">${dir}</ol></div>
    ${notice(C)}` },
      ]),
      closeBlock(C, M.close, ctas),
    ].join("\n"),
  };
}
const cl = (lang) => bpCopyLang(lang);

/* ------------------------------------------------------------------ 04 Partnerships */
function partnershipsBody(C, lang) {
  const P = C.partnerships;
  const types = P.types.items
    .map(
      (t) => `<article id="type-${t.type}" class="bpt-biz" aria-labelledby="type-${t.type}-title">
      <header class="bpt-biz__head">
        <span class="bpt-biz__code" aria-hidden="true">${esc(t.code)}</span>
        <div>
          <p class="nls-kicker" lang="en">${esc(t.en)}</p>
          <h3 id="type-${t.type}-title" class="bpt-biz__title">${esc(t.name)}</h3>
        </div>
      </header>
      ${t.body.map((x) => `<p class="bpt-biz__p">${esc(x)}</p>`).join("\n      ")}
      <p class="bpt-biz__cta"><a class="nls-btn nls-btn--ghost" href="${contactHref(lang, `type=${t.type}`)}" aria-label="${esc(C.ui.askType)}: ${esc(t.name)}">${esc(C.ui.askType)} →</a></p>
    </article>`
    )
    .join("");
  const find = BP_PLATFORMS.map(
    (p, i) => `<li><a class="bpt-card" href="${platPart(lang, p)}">
        <span class="bpt-card__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <strong class="bpt-card__t">${esc(p.name)}</strong>
        <span class="bpt-card__d">${esc(p[cl(lang)].find)}</span>
        <span class="bpt-card__go">${esc(C.ui.toPartnerships)} →</span>
      </a></li>`
  ).join("");
  const pipe = P.process.items
    .map((s, i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}"><p class="nls-pipe__n">${esc(s.n)}</p>${s.en !== s.name ? `<p class="nls-kicker" lang="en">${esc(s.en)}</p>` : ""}<h3>${esc(s.name)}</h3><p>${esc(s.body)}</p></article>`)
    .join("");
  const channels = P.channels.items
    .map(
      (it) => `<li><a class="bpt-card" href="/${lang}/${it.href}">
        <span class="bpt-card__n" aria-hidden="true">${esc(it.n)}</span>
        <strong class="bpt-card__t" lang="en">${esc(it.name)}</strong>
        <span class="bpt-card__d">${esc(it.lead)}</span>
        <span class="bpt-card__go" aria-hidden="true">→</span>
      </a></li>`
    )
    .join("");
  const ctas = `<a class="nls-btn" href="${contactHref(lang)}">${esc(P.close.ctaMain)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pageHref(lang, "platforms")}">${esc(P.close.ctaSub)}</a>`;
  return {
    hero: hero(C, lang, "partnerships", P.hero, true),
    main: [
      bands([
        { id: "bpt-types", inner: `${titleBlock(P.types.kicker, P.types.title, P.types.lead, "bpt-types-title")}<div class="bpt-biz__list bpt-biz__list--2">${types}</div>` },
        { id: "bpt-find", inner: `${titleBlock(P.find.kicker, P.find.title, P.find.lead, "bpt-find-title")}<ul class="bpt-cards bpt-cards--3">${find}</ul>` },
        { id: "bpt-process", inner: `${titleBlock(P.process.kicker, P.process.title, P.process.lead, "bpt-process-title")}<div class="nls-pipe bpt-pipe5">${pipe}</div><p class="nls-note">${esc(P.process.note)}</p>` },
        { id: "bpt-channels", inner: `${titleBlock(P.channels.kicker, P.channels.title, P.channels.lead, "bpt-channels-title")}<ul class="bpt-cards bpt-cards--2">${channels}</ul>
    ${notice(C)}` },
      ]),
      closeBlock(C, P.close, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ 05 Contact */
/** Existing inquiry form styles, copied verbatim from templates/business-inquiry.html (as render-bsp does). */
let FORM_CSS = null;
function formCss() {
  if (FORM_CSS) return FORM_CSS;
  const tpl = fs.readFileSync(path.join(ROOT, "templates", "business-inquiry.html"), "utf8");
  const a = tpl.indexOf("      .bz-form-wrap {");
  const end = ".bz-fail.is-visible { display: block; }";
  const b = tpl.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error("render-bizpart: inquiry form styles not found in templates/business-inquiry.html");
  FORM_CSS = tpl.slice(a, b + end.length);
  return FORM_CSS;
}

function formHtml(C, lang) {
  const F = C.contact.form;
  const L = cl(lang);
  const typeOpts = BP_INQUIRY_TYPES.map((t) => `<option value="${esc(t.value)}" data-code="${esc(t.code)}">${esc(t[L][0])}</option>`).join("\n              ");
  const platOpts = BP_INQUIRY_PLATFORMS.map((p) => `<option value="${esc(p.value)}" data-code="${esc(p.code)}">${esc(p[L])}</option>`).join("\n              ");
  return `<div class="bz-form-wrap bpt-form">
      <form class="bz-form" id="bz-inquiry-form" novalidate data-analytics="bizpart_inquiry" data-submit="${esc(F.submit)}" data-submitting="${esc(F.submitting)}" data-subject="${esc(F.subject)}" aria-describedby="bpt-form-lead">
        <input type="hidden" name="category" value="Business &amp; Partnerships" />
        <div class="bz-field">
          <label for="bz-name">${esc(F.name)}<span class="bz-req" aria-hidden="true">*</span></label>
          <input id="bz-name" name="name" type="text" required maxlength="80" autocomplete="name" />
        </div>
        <div class="bz-field">
          <label for="bpt-company">${esc(F.company)} <span class="bz-opt">(${esc(F.optional)})</span></label>
          <input id="bpt-company" name="company" type="text" maxlength="120" autocomplete="organization" aria-describedby="bpt-company-hint" />
          <p class="bz-field-hint" id="bpt-company-hint">${esc(F.companyHint)}</p>
        </div>
        <div class="bz-field">
          <label for="bz-email">${esc(F.email)}<span class="bz-req" aria-hidden="true">*</span></label>
          <input id="bz-email" name="email" type="email" required maxlength="120" autocomplete="email" inputmode="email" />
        </div>
        <div class="bz-field">
          <label for="bpt-platform">${esc(F.platform)}<span class="bz-req" aria-hidden="true">*</span></label>
          <select id="bpt-platform" name="platform" required>
              <option value="" disabled selected>${esc(F.choose)}</option>
              ${platOpts}
          </select>
        </div>
        <div class="bz-field">
          <label for="bz-type">${esc(F.type)}<span class="bz-req" aria-hidden="true">*</span></label>
          <select id="bz-type" name="type" required>
              <option value="" disabled selected>${esc(F.choose)}</option>
              ${typeOpts}
          </select>
        </div>
        <div class="bz-field">
          <label for="bz-message">${esc(F.message)}<span class="bz-req" aria-hidden="true">*</span></label>
          <textarea id="bz-message" name="message" required maxlength="4000" placeholder="${esc(F.messagePh)}"></textarea>
        </div>
        <div class="bz-field bz-field--check">
          <div class="bz-consent">
            <label class="bz-consent__label" for="bz-consent">
              <input id="bz-consent" name="consent" type="checkbox" value="yes" required />
              <span class="bz-consent__box" aria-hidden="true"></span>
              <span class="bz-consent__text">${esc(F.consent)}</span>
            </label>
            <a class="bz-consent__link" href="/${lang}/privacy/" target="_blank" rel="noopener noreferrer">${esc(F.privacy)}<span aria-hidden="true"> ↗</span></a>
          </div>
        </div>
        <div class="bz-hp" aria-hidden="true">
          <input name="_honey" tabindex="-1" autocomplete="off" />
        </div>
        <button class="bz-submit btn btn-primary" type="submit" id="bz-submit">
          <span class="bz-submit-spin" aria-hidden="true"></span>
          <span class="bz-submit-label">${esc(F.submit)}</span>
        </button>
      </form>
      <p class="bz-fail" id="bz-fail" role="alert" hidden>${esc(F.fail)}</p>
      <p class="bz-field-hint">${esc(F.direct)} <a class="bpt-link" href="mailto:newon@newon.app">newon@newon.app</a></p>
    </div>
<script>
(function () {
  /* Preselect inquiry type (?type=) and platform (?platform=) by code or value; keep ?source= for the inbox. */
  var p = new URLSearchParams(location.search);
  function pre(id, v) {
    var sel = document.getElementById(id);
    if (!v || !sel) return;
    v = String(v).toLowerCase();
    for (var i = 0; i < sel.options.length; i++) {
      var o = sel.options[i];
      if ((o.getAttribute("data-code") || "") === v || String(o.value).toLowerCase() === v) { sel.selectedIndex = i; break; }
    }
  }
  pre("bz-type", p.get("type"));
  pre("bpt-platform", p.get("platform"));
  var src = p.get("source");
  var form = document.getElementById("bz-inquiry-form");
  if (src && form) {
    var h = document.createElement("input");
    h.type = "hidden"; h.name = "source"; h.value = String(src).slice(0, 80);
    form.appendChild(h);
  }
})();
</script>
<script src="/business/inquiry.js?v=20261019bp1" defer></script>`;
}

function contactBody(C, lang) {
  const c = C.contact;
  const L = cl(lang);
  const types = BP_INQUIRY_TYPES.map(
    (t, i) => `<li><a class="bpt-card" href="?type=${t.code}#bpt-form" data-bpt-type="${t.code}">
        <span class="bpt-card__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <strong class="bpt-card__t">${esc(t[L][0])}</strong>
        <span class="bpt-card__d">${esc(t[L][1])}</span>
        <span class="bpt-card__go">${esc(c.types.go)}</span>
      </a></li>`
  ).join("");
  const guide = c.guide.items.map((it) => `<article class="nls-proc__item"><span class="nls-proc__n">${esc(it.n)}</span><h3>${esc(it.name)}</h3><p>${esc(it.body)}</p></article>`).join("");
  const F = c.form;
  const formBlock = `<div class="nls-split bpt-form-split">
      <div>
        ${titleBlock(F.kicker, F.title, "", "bpt-form-title")}
        <p class="nls-lead" id="bpt-form-lead">${esc(F.lead)}</p>
        <dl class="bpt-dl bpt-contact">
          <div class="bpt-dl__row"><dt lang="en">${esc(F.contactLabel)}</dt><dd><strong>${esc(F.contactName)}</strong><br><a class="bpt-link" href="mailto:newon@newon.app">newon@newon.app</a></dd></div>
        </dl>
      </div>
      ${formHtml(C, lang)}
    </div>`;
  const ctas = `<a class="nls-btn" href="${pageHref(lang, "platforms")}">${esc(c.close.ctaMain)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pageHref(lang, "partnerships")}">${esc(c.close.ctaSub)}</a>`;
  return {
    hero: hero(C, lang, "contact", c.hero, true),
    main: [
      `<link rel="stylesheet" href="/business-page.css?v=20260923pad1" />
<style>
${formCss()}
</style>`,
      bands([
        { id: "bpt-types", inner: `${titleBlock(c.types.kicker, c.types.title, c.types.lead, "bpt-types-title")}<ul class="bpt-cards bpt-cards--5">${types}</ul>` },
        { id: "bpt-form", cls: "bpt-form-sec", inner: formBlock },
        {
          id: "bpt-guide",
          inner: `${titleBlock(c.guide.kicker, c.guide.title, "", "bpt-guide-title")}<div class="nls-proc bpt-proc3">${guide}</div>
    <p class="nls-note">${esc(c.guide.privacyNote)} <a class="bpt-link" href="/${lang}/privacy/">${esc(c.guide.privacyLink)}</a></p>`,
        },
      ]),
      closeBlock(C, c.close, ctas),
    ].join("\n"),
  };
}

const BODY = { overview: overviewBody, platforms: platformsBody, models: modelsBody, partnerships: partnershipsBody, contact: contactBody };

export function renderBizpartSection(lang, page) {
  const C = getBizpartCopy(lang);
  const { hero: heroHtml, main } = BODY[page](C, lang);
  const fallbackLang = bpCopyLang(lang) !== lang ? ` lang="${bpCopyLang(lang)}"` : "";
  return `<section id="lifestage-detail" class="nls" data-story="bizpart" data-bpt-page="${page}"${fallbackLang} aria-labelledby="bpt-title">
    ${heroHtml}
  ${renderFlagshipSubnav({ biz: "bizpart", lang, active: page })}
  <div class="nls__wrap">
    ${main}
  </div>
</section>`;
}

/* ------------------------------------------------------------------------------------------------
 * Pages
 * ---------------------------------------------------------------------------------------------- */
function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en) };
}

function jsonLd(lang, nav, seo, url) {
  const C = getBizpartCopy(lang);
  const page = {
    "@context": "https://schema.org",
    "@type": nav.id === "contact" ? "ContactPage" : "WebPage",
    name: seo.title,
    description: seo.desc,
    url,
    inLanguage: bpCopyLang(lang),
    isPartOf: { "@type": "WebSite", name: "Newon", url: SITE_ORIGIN },
    publisher: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN, email: "newon@newon.app" },
  };
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${lang}/` },
    { "@type": "ListItem", position: 2, name: C.ui.crumb, item: `${SITE_ORIGIN}${bpPath(lang)}` },
  ];
  if (nav.id !== "overview") crumbs.push({ "@type": "ListItem", position: 3, name: bpCopyLang(lang) === "ko" ? nav.ko : nav.en, item: url });
  const crumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs };
  return `    <script type="application/ld+json">${JSON.stringify(page)}</script>
    <script type="application/ld+json">${JSON.stringify(crumb)}</script>`;
}

function renderPage(lang, nav) {
  const { flat, flatEn } = localeFlat(lang);
  const C = getBizpartCopy(lang.dir);
  const seo = C.seo[nav.id];
  const sub = nav.sub ? `${BP_SLUG}/${nav.sub}` : BP_SLUG;
  const base = nav.sub ? "../../" : "../";
  const header = renderStudioHeader(flat, flatEn, { activeNav: "business", base });
  const footer = renderStudioFooter(flat, flatEn, { base });
  const canonical = `${SITE_ORIGIN}/${lang.dir}/${sub}/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    LANG_DIR: lang.dir,
    FONT_LINKS: fontLinksHtml(lang.dir),
    TITLE: escapeHtml(seo.title),
    META_DESCRIPTION: escapeHtml(clampSeoDescription(seo.desc)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock(sub),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: renderBizpartSection(lang.dir, nav.id),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="/flagship-subnav.css?v=20261018fsn2" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="/bizpart-site.css?v=${BP_VER}" />
${jsonLd(lang.dir, nav, seo, canonical)}`,
    EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260924play2"></script>
    <script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, BP_SLUG, nav.sub, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  return path.relative(ROOT, out);
}

/* ------------------------------------------------------------------------------------------------
 * Redirect stubs (static hosting: no server 301). noindex · canonical · meta refresh · location.replace.
 * ---------------------------------------------------------------------------------------------- */
function langStub(lang, target) {
  const to = `/${lang.dir}/${target}`;
  return `<!DOCTYPE html>
<html lang="${lang.htmlLang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, follow" />
<title>NEWON Business &amp; Partnerships</title>
<link rel="canonical" href="${SITE_ORIGIN}${to}" />
<meta http-equiv="refresh" content="0;url=${to}" />
<script>location.replace(${JSON.stringify(to)} + (location.hash || ""));</script>
</head>
<body><p><a href="${to}">NEWON Business &amp; Partnerships →</a></p></body>
</html>
`;
}

function rootStub(target) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, follow" />
<title>NEWON Business &amp; Partnerships</title>
<link rel="canonical" href="${SITE_ORIGIN}/ko/${target}" />
<meta http-equiv="refresh" content="0;url=/ko/${target}" />
<script>
(function(){
  var LANGS=["ko","en","ja","es","pt-br","fr","de","hi","id"];
  var pref="ko";
  try{var s=localStorage.getItem("newon-lang-dir");if(s&&LANGS.indexOf(s)!==-1)pref=s;}catch(e){}
  location.replace("/"+pref+"/${target}"+(location.hash||""));
})();
</script>
</head>
<body><p><a href="/ko/${target}">NEWON Business &amp; Partnerships →</a></p></body>
</html>
`;
}

function writeFile(rel, html, written) {
  const out = path.join(ROOT, rel);
  ensureDir(out);
  fs.writeFileSync(out, html);
  written.push(rel);
}

export function renderBizpart() {
  const written = [];
  for (const nav of BP_NAV) for (const lang of LANGS) written.push(renderPage(lang, nav));
  // Old /{lang}/… URLs → new screens.
  for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
    for (const lang of LANGS) writeFile(path.join(lang.dir, from, "index.html"), langStub(lang, to), written);
  }
  // Root /… (language-less) URLs → preferred-language new screen.
  for (const [from, to] of Object.entries({ ...LEGACY_REDIRECTS, ...ROOT_ONLY_REDIRECTS })) {
    writeFile(path.join(from, "index.html"), rootStub(to), written);
  }
  for (const nav of BP_NAV) if (nav.sub) writeFile(path.join(BP_SLUG, nav.sub, "index.html"), rootStub(`${BP_SLUG}/${nav.sub}/`), written);
  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const rel of written) {
      const dest = path.join(pub, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(ROOT, rel), dest);
    }
  }
  console.log(`render-bizpart: wrote ${written.length} files (${BP_NAV.length} screens × ${LANGS.length} locales + ${Object.keys(LEGACY_REDIRECTS).length} legacy URLs × ${LANGS.length} + root stubs)`);
  return written;
}

if (import.meta.url === `file://${process.argv[1]}`) renderBizpart();
