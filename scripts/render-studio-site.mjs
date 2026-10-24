#!/usr/bin/env node
/**
 * NEWON Studio — eleven screens × 9 locales, plus the redirect stubs that retire the old Studio URLs
 * (owner brief "NEWON STUDIO — CONTENT DEPTH EXPANSION", 2026-10-19).
 *
 *   /{lang}/studio/                         01 Overview
 *   /{lang}/studio/store/                   02 Digital Store
 *   /{lang}/studio/platforms/               03 Our Platforms
 *   /{lang}/studio/platforms/{platform}/    six platform product pages (sub-menu: Our Platforms active)
 *   /{lang}/studio/business/                04 Business Products
 *   /{lang}/studio/contact/                 05 Contact
 *
 * Design: exactly the Business & Partnerships pattern (render-bizpart.mjs): hub-shell + Life Stage nls-*
 * components (home-lifestage CSS/JS), the dark film first screen (Studio page film, STUDIO_PAGE_FILM_SRC),
 * the shared five-menu bar (flagship-subnav, `studio` config) and /studio-site.css (bizpart-site.css
 * re-scoped to data-story="studio", class prefix sts-, plus Studio content components). Black/white only.
 *
 * Contact reuses the existing inquiry mechanism unchanged in behaviour: form#bz-inquiry-form +
 * /business/inquiry.js (FormSubmit, honeypot, validation, e-mail fallback, shared success page).
 * /{lang}/business/inquiry/ is not touched.
 *
 * Old URLs (design-service and pillar pages of the previous Studio) become static redirect stubs:
 * noindex + canonical + meta refresh + location.replace (LEGACY_STUDIO_REDIRECTS).
 * Runs after every other page renderer (the old Studio renderers still write the old pages first).
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
import { ST_SLUG, ST_NAV, ST_FILM, ST_PLATFORMS, ST_STORE_HREF, ST_INQUIRY_TYPES, ST_INQUIRY_AREAS } from "./studio-site-content.mjs";
import { KO } from "./studio-site-copy-ko.mjs";
import { EN } from "./studio-site-copy-en.mjs";

const esc = escapeHtml;
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");
const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20260924livon1";
const ST_VER = "20261024h1";

export const stCopyLang = (lang) => (lang === "ko" ? "ko" : "en");
export const getStudioCopy = (lang) => (stCopyLang(lang) === "ko" ? KO : EN);

/** /{lang}/studio/{sub}/ */
export const stPath = (lang, sub = "") => `/${lang}/${ST_SLUG}/${sub ? sub + "/" : ""}`;
const navOf = (id) => ST_NAV.find((n) => n.id === id);
const pageHref = (lang, id) => stPath(lang, navOf(id).sub);
const platHref = (lang, id) => stPath(lang, `platforms/${id}`);
const contactHref = (lang, q = "") => `${pageHref(lang, "contact")}${q ? "?" + q : ""}#sts-form`;

/** Every screen: { id, sub (below /{lang}/studio/), active (sub-menu id), platform? } */
export const STUDIO_SCREENS = [
  ...ST_NAV.map((n) => ({ id: n.id, sub: n.sub, active: n.id })),
  ...ST_PLATFORMS.map((p) => ({ id: p.id, sub: `platforms/${p.id}`, active: "platforms", platform: p })),
];
/** Paths (without /{lang}/) of the eleven screens — sitemap + tests. */
export const STUDIO_SITE_PATHS = STUDIO_SCREENS.map((s) => (s.sub ? `${ST_SLUG}/${s.sub}` : ST_SLUG));

/* ------------------------------------------------------------------------------------------------
 * Old URL → new screen (paths below /{lang}/, values below /{lang}/ with trailing slash).
 * Design-service pages (brand, digital design, content, care) describe work NEWON no longer offers →
 * Overview; digital products, design systems and IP assets → Digital Store; projects → Our Platforms;
 * distribution / licensing partnerships → Business Products. /studio/contact/ stays (now the new Contact).
 * ---------------------------------------------------------------------------------------------- */
const OV = "studio/";
const ST = "studio/store/";
const PL = "studio/platforms/";
const BU = "studio/business/";
export const LEGACY_STUDIO_REDIRECTS = {
  "studio/digital": ST,
  "studio/digital/web-design": OV,
  "studio/digital/app-ui-ux": OV,
  "studio/digital/landing": OV,
  "studio/digital/product-design": OV,
  "studio/design-systems": ST,
  "studio/projects": PL,
  "studio/partnerships": BU,
  "studio/brand": OV,
  "studio/brand/strategy": OV,
  "studio/brand/naming": OV,
  "studio/brand/identity": OV,
  "studio/brand/logo": OV,
  "studio/care": OV,
  "studio/care/monthly-design": OV,
  "studio/care/design-improvement": OV,
  "studio/content": OV,
  "studio/content/social": OV,
  "studio/content/campaign": OV,
  "studio/content/visual": OV,
  "studio/ip": ST,
  "studio/ip/newon-character": ST,
  "studio/ip/digital-stickers": ST,
  "studio/ip/character-lab": ST,
  "studio/ip/experimental-ip": ST,
};

/** True when a path (with or without the /{lang}/ prefix) is a retired Studio URL. */
export function isLegacyStudioPath(p) {
  const clean = String(p || "").replace(/^\/+|\/+$/g, "").replace(/^(ko|en|ja|es|pt-br|fr|de|hi|id)(\/|$)/, "");
  return Object.prototype.hasOwnProperty.call(LEGACY_STUDIO_REDIRECTS, clean);
}

/* ------------------------------------------------------------------------------------------------
 * Blocks (same markup vocabulary as render-bizpart.mjs)
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
function bands(list) {
  return list.map((b, i) => block(b.id, b.inner, i % 2 === 1, b.cls || "")).join("\n");
}
const dl = (rows) => `<dl class="sts-dl">${rows.map(([k, v]) => `<div class="sts-dl__row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
const notice = (C) => `<p class="nls-note sts-scope">${esc(C.ui.notice)}</p>`;
const n2 = (i) => String(i + 1).padStart(2, "0");
const roster = (lines) => `<ol class="nls-roster">${lines.map((p, i) => `<li><span>${n2(i)}</span><p>${esc(p)}</p></li>`).join("")}</ol>`;
const dirList = (items) => `<ol class="nls-dir">${items.map((s) => `<li><span>${esc(s.n)}</span><div><strong>${esc(s.name)}</strong><p>${esc(s.body)}</p></div></li>`).join("")}</ol>`;
const flow = (items, cls = "sts-flow4") =>
  `<div class="nls-flow ${cls}">${items.map((it, i) => `<article class="nls-flow__item"><span class="nls-flow__n">${esc(it.n || n2(i))}</span><h3>${esc(it.name)}</h3><p>${esc(it.lead || it.body)}</p></article>`).join("")}</div>`;
const proc = (items, cls = "sts-proc3") =>
  `<div class="nls-proc ${cls}">${items.map((it, i) => `<article class="nls-proc__item"><span class="nls-proc__n">${esc(it.n || n2(i))}</span><h3>${esc(it.name)}</h3><p>${esc(it.body || it.lead)}</p></article>`).join("")}</div>`;
const pipe = (items, cls = "sts-pipe5") =>
  `<div class="nls-pipe ${cls}">${items.map((s, i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}"><p class="nls-pipe__n">${esc(s.n)}</p><h3>${esc(s.name)}</h3><p>${esc(s.body)}</p></article>`).join("")}</div>`;
/** Last-card span so a board never ends on a grey filler cell (desktop: `cols` columns; tablet: 2). */
const fillCls = (i, n, cols) => {
  if (i !== n - 1) return "";
  const r = n % cols;
  return `${r ? ` sts-last-d${cols - r + 1}` : ""}${n % 2 ? " sts-last-t2" : ""}`;
};
/** Best desktop column count for n cards (4 or 3), preferring full rows. */
const colsFor = (n) => (n % 4 === 0 ? 4 : n % 3 === 0 ? 3 : n >= 7 ? 4 : 3);
const board = (items, cols = colsFor(items.length), h = "h3") =>
  `<div class="nls-board sts-cols-${cols}">${items
    .map(
      (it, i) => `<article class="nls-board__item${fillCls(i, items.length, cols)}">
        <div class="nls-board__meta"><span class="nls-board__n" aria-hidden="true">${esc(it.n || n2(i))}</span>${it.en ? `<span class="nls-board__tag" lang="en">${esc(it.en)}</span>` : ""}</div>
        <${h}>${esc(it.name)}</${h}>
        <p>${esc(it.lead || it.body)}</p>
      </article>`
    )
    .join("")}</div>`;
function table(cols, rows, caption) {
  const head = cols.map((c, i) => `<th scope="col"${i === 0 ? ' class="sts-table__k"' : ""}>${esc(c)}</th>`).join("");
  const body = rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td data-label="${esc(cols[i])}">${esc(c)}</td>`)).join("")}</tr>`).join("");
  return `<div class="sts-tablewrap" role="region" aria-label="${esc(caption)}" tabindex="0"><table class="sts-table sts-table--${cols.length}"><caption class="visually-hidden">${esc(caption)}</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
const twoLists = (a, b, aT, bT, cls = "") =>
  `<div class="sts-two${cls ? " " + cls : ""}">
      <div class="sts-two__col"><h3 class="sts-two__t">${esc(aT)}</h3><ul class="sts-list">${a.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="sts-two__col sts-two__col--b"><h3 class="sts-two__t">${esc(bT)}</h3><ul class="sts-list${cls.includes("sts-two--scope") ? " sts-list--x" : ""}">${b.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
    </div>`;
function faqBlock(C, id, title, items, band) {
  const list = items
    .map(
      ([q, a], i) => `<details class="sts-faq__item"${i === 0 ? " open" : ""}>
        <summary><span class="sts-faq__n" aria-hidden="true">${n2(i)}</span><span class="sts-faq__q">${esc(q)}</span><span class="sts-faq__chev" aria-hidden="true"></span></summary>
        <div class="sts-faq__a"><p>${esc(a)}</p></div>
      </details>`
    )
    .join("");
  return { id, inner: `<div class="nls-split sts-faq-split"><div>${titleBlock(C.ui.faqKicker, title, "", `${id}-title`)}</div><div class="sts-faq" data-sts-faq="${items.length}">${list}</div></div>`, band };
}

function hero(lang, h, compact) {
  return `<div class="nls-film sts-film${compact ? " sts-film--compact" : ""}" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${ST_FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${ST_FILM}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__eyebrow" lang="en">${esc(h.eyebrow)}</p>
        <p class="nls-film__wordmark" lang="en">${esc(h.wordmark)}</p>
        <h1 id="sts-title" class="nls-film__slogan">${h.titleHtml}</h1>
        <p class="nls-film__lead">${esc(h.lead)}</p>
        <div class="nls-film__actions">
          <a class="nls-btn" href="${h.mainHref}"${h.mainHref.startsWith("#") ? " data-nls-scroll" : ""}>${esc(h.ctaMain)} ${h.mainHref.startsWith("#") ? "↓" : "→"}</a>
          <a class="nls-btn nls-btn--ghost" href="${h.subHref}">${esc(h.ctaSub)}</a>
        </div>
      </div>
    </div>
  </div>`;
}

function closeBlock(C, c, ctas) {
  return `<section id="sts-close" class="nls-block nls-close nls-block--ink" data-hs-section aria-labelledby="sts-close-title">
    <p class="nls-kicker">${esc(c.kicker)}</p>
    <h2 class="nls-hero__title" id="sts-close-title">${c.titleHtml}</h2>
    <p class="nls-lead">${esc(c.lead)}</p>
    <p class="nls-note">${esc(C.ui.infoOnly)}</p>
    <div class="nls-actions">${ctas}</div>
  </section>`;
}
const btns = (a, aT, b, bT) => `<a class="nls-btn" href="${a}">${esc(aT)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${b}">${esc(bT)}</a>`;

/** The two products that really exist today (tools, starter kit). */
function availableCards(C, lang, now) {
  return `<ul class="sts-cards sts-cards--2 sts-avail">
      <li><a class="sts-card" href="/${lang}/tools/">
        <span class="sts-card__n" aria-hidden="true">01 · ${esc(C.ui.available)}</span>
        <strong class="sts-card__t">${esc(now.tools.name)}</strong>
        <span class="sts-card__d">${esc(now.tools.lead)}</span>
        <span class="sts-card__go">${esc(C.ui.openTools)} →</span>
      </a></li>
      <li><a class="sts-card" href="/${lang}/${ST_STORE_HREF}newon-project-starter-kit/">
        <span class="sts-card__n" aria-hidden="true">02 · ${esc(C.ui.available)}</span>
        <strong class="sts-card__t" lang="en">${esc(now.kit.name)}</strong>
        <span class="sts-card__d">${esc(now.kit.lead)}</span>
        <span class="sts-card__go">${esc(C.ui.openKit)} →</span>
      </a></li>
    </ul>`;
}

/* ------------------------------------------------------------------ 01 Overview */
function overviewBody(C, lang) {
  const o = C.overview;
  const fam = o.families.items
    .map(
      (f) => `<article id="family-${f.code}" class="sts-biz" aria-labelledby="family-${f.code}-title">
      <header class="sts-biz__head">
        <span class="sts-biz__code" aria-hidden="true">${esc(f.code)}</span>
        <div>
          <p class="nls-kicker" lang="en">${esc(f.en)}</p>
          <h3 id="family-${f.code}-title" class="sts-biz__title">${esc(f.name)}</h3>
        </div>
      </header>
      <p class="sts-biz__p">${esc(f.body)}</p>
      ${dl([
        [o.families.typesLabel, chips(f.types)],
        [o.families.useLabel, esc(f.use)],
        [o.families.forLabel, esc(f.who)],
      ])}
    </article>`
    )
    .join("");
  const plats = ST_PLATFORMS.map(
    (p, i) => `<li><a class="sts-card" href="${platHref(lang, p.id)}">
        <span class="sts-card__n" aria-hidden="true">${n2(i)} · <span lang="en">${esc(p.category)}</span></span>
        <strong class="sts-card__t">${esc(p.name)}</strong>
        <span class="sts-card__d">${esc(o.platforms.items[p.id])}</span>
        <span class="sts-card__go">${esc(C.ui.toPlatformPage(p.name))} →</span>
      </a></li>`
  ).join("");
  return {
    hero: hero(lang, { ...o.hero, mainHref: pageHref(lang, "store"), subHref: pageHref(lang, "business") }, false),
    main: [
      bands([
        { id: "sts-about", inner: `<div class="nls-split">${titleBlock(o.about.kicker, o.about.title, "", "sts-about-title")}${roster(o.about.lines)}</div>` },
        { id: "sts-why", inner: `<div class="nls-split"><div>${titleBlock(o.why.kicker, o.why.title, o.why.lead, "sts-why-title")}</div>${dirList(o.why.items)}</div>` },
        { id: "sts-families", inner: `${titleBlock(o.families.kicker, o.families.title, o.families.lead, "sts-families-title")}<div class="sts-biz__list sts-biz__list--2">${fam}</div>` },
        { id: "sts-range", inner: `${titleBlock(o.range.kicker, o.range.title, o.range.lead, "sts-range-title")}${twoLists(o.range.personal.items, o.range.business.items, o.range.personal.title, o.range.business.title)}<p class="nls-note">${esc(o.range.note)}</p>` },
        { id: "sts-platforms", inner: `${titleBlock(o.platforms.kicker, o.platforms.title, o.platforms.lead, "sts-platforms-title")}<ul class="sts-cards sts-cards--3">${plats}</ul>` },
        { id: "sts-howto", inner: `${titleBlock(o.howto.kicker, o.howto.title, o.howto.lead, "sts-howto-title")}${pipe(o.howto.items)}` },
        { id: "sts-principles", inner: `${titleBlock(o.principles.kicker, o.principles.title, "", "sts-principles-title")}${proc(o.principles.items)}` },
        { id: "sts-now", inner: `${titleBlock(o.now.kicker, o.now.title, o.now.lead, "sts-now-title")}${availableCards(C, lang, o.now)}${notice(C)}` },
        faqBlock(C, "sts-faq", o.faq.title, o.faq.items),
      ]),
      closeBlock(C, o.close, btns(pageHref(lang, "store"), o.close.ctaMain, pageHref(lang, "platforms"), o.close.ctaSub)),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ 02 Digital Store */
function storeBody(C, lang) {
  const s = C.store;
  const sw = s.software.items
    .map(
      (it) => `<article class="sts-biz sts-biz--compact" aria-labelledby="sw-${it.code}-title">
      <header class="sts-biz__head">
        <span class="sts-biz__code" aria-hidden="true">${esc(it.code)}</span>
        <div>
          <p class="nls-kicker" lang="en">${esc(it.en)}</p>
          <h3 id="sw-${it.code}-title" class="sts-biz__title">${esc(it.name)}</h3>
        </div>
      </header>
      ${dl([
        [C.ui.include, `<ul class="sts-list">${it.include.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`],
        [C.ui.exclude, `<ul class="sts-list sts-list--x">${it.exclude.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`],
      ])}
    </article>`
    )
    .join("");
  const usage = `<div class="sts-two sts-two--steps">
      <div class="sts-two__col"><h3 class="sts-two__t">${esc(s.usage.download.title)}</h3>${dirList(s.usage.download.items)}</div>
      <div class="sts-two__col sts-two__col--b"><h3 class="sts-two__t">${esc(s.usage.software.title)}</h3>${dirList(s.usage.software.items)}</div>
    </div>`;
  const check = `<ol class="sts-check">${s.check.items.map((x, i) => `<li><span aria-hidden="true">${n2(i)}</span><p>${esc(x)}</p></li>`).join("")}</ol>`;
  return {
    hero: hero(lang, { ...s.hero, mainHref: "#sts-cats", subHref: `/${lang}/${ST_STORE_HREF}` }, true),
    main: [
      bands([
        { id: "sts-cats", inner: `${titleBlock(s.cats.kicker, s.cats.title, s.cats.lead, "sts-cats-title")}${board(s.cats.items)}` },
        { id: "sts-now", inner: `${titleBlock(s.now.kicker, s.now.title, s.now.lead, "sts-now-title")}${availableCards(C, lang, C.overview.now)}<p class="sts-biz__cta"><a class="nls-btn nls-btn--ghost" href="/${lang}/${ST_STORE_HREF}">${esc(C.ui.openStore)} →</a></p>` },
        { id: "sts-templates", inner: `<div class="nls-split"><div>${titleBlock(s.templates.kicker, s.templates.title, s.templates.lead, "sts-templates-title")}</div>${dl(s.templates.rows.map(([k, v]) => [k, esc(v)]))}</div>` },
        { id: "sts-situations", inner: `${titleBlock(s.situations.kicker, s.situations.title, s.situations.lead, "sts-situations-title")}${flow(s.situations.items)}` },
        { id: "sts-software", inner: `${titleBlock(s.software.kicker, s.software.title, s.software.lead, "sts-software-title")}<div class="sts-biz__list sts-biz__list--3">${sw}</div>` },
        { id: "sts-packages", inner: `${titleBlock(s.packages.kicker, s.packages.title, s.packages.lead, "sts-packages-title")}${proc(s.packages.items)}` },
        { id: "sts-detail", inner: `${titleBlock(s.detail.kicker, s.detail.title, s.detail.lead, "sts-detail-title")}${board(s.detail.items.map((x) => ({ ...x, lead: x.body })))}` },
        { id: "sts-usage", inner: `${titleBlock(s.usage.kicker, s.usage.title, "", "sts-usage-title")}${usage}` },
        { id: "sts-license", inner: `${titleBlock(s.license.kicker, s.license.title, s.license.lead, "sts-license-title")}${table(s.license.cols, s.license.rows, s.license.title.replace(/\n/g, " "))}<p class="nls-note">${esc(s.license.note)}</p>` },
        { id: "sts-check", inner: `<div class="nls-split"><div>${titleBlock(s.check.kicker, s.check.title, "", "sts-check-title")}</div>${check}</div>` },
        { id: "sts-after", inner: `<div class="nls-split"><div>${titleBlock(s.after.kicker, s.after.title, "", "sts-after-title")}</div>${dl(s.after.rows.map(([k, v]) => [k, esc(v)]))}</div>${notice(C)}` },
        faqBlock(C, "sts-faq", s.faq.title, s.faq.items),
      ]),
      closeBlock(C, s.close, btns(`/${lang}/${ST_STORE_HREF}`, s.close.ctaMain, contactHref(lang, "type=product&area=store"), s.close.ctaSub)),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ 03 Our Platforms */
function platformsBody(C, lang) {
  const P = C.platforms;
  const rail = ST_PLATFORMS.map((p, i) => `<li><a class="sts-rail__link" href="#platform-${p.id}"><span aria-hidden="true">${n2(i)}</span> ${esc(p.name)}</a></li>`).join("");
  const cards = ST_PLATFORMS.map((p, i) => {
    const d = C.plat[p.id];
    return `<article id="platform-${p.id}" class="sts-biz" aria-labelledby="platform-${p.id}-title">
      <header class="sts-biz__head">
        <span class="sts-biz__code" aria-hidden="true">${n2(i)}</span>
        <div>
          <p class="nls-kicker" lang="en">${esc(p.name)} · ${esc(p.category)}</p>
          <h3 id="platform-${p.id}-title" class="sts-biz__title">${d.hero.titleHtml.replace(/<br>/g, " ")}</h3>
        </div>
      </header>
      <p class="sts-biz__p">${esc(d.purpose.lines[0])} ${esc(d.purpose.lines[2])}</p>
      ${dl([
        [C.ui.personalLabel, chips(d.personal.items.map((x) => x.name))],
        [C.ui.businessLabel, chips(d.biz.items.map((x) => x.name))],
        [C.ui.formatsLabel, esc(d.formats.join(" · "))],
      ])}
      <p class="sts-biz__cta">
        <a class="nls-btn" href="${platHref(lang, p.id)}">${esc(C.ui.toPlatformPage(p.name))} →</a>
        <a class="nls-btn nls-btn--ghost" href="${pageHref(lang, "business")}#industry-${p.id}">${esc(C.ui.toBusiness)}</a>
      </p>
    </article>`;
  }).join("");
  const rows = ST_PLATFORMS.map((p) => {
    const d = C.plat[p.id];
    return [p.name, d.personal.items.slice(0, 3).map((x) => x.name).join(", "), d.biz.items.slice(0, 3).map((x) => x.name).join(", "), d.formats.slice(0, 3).join(", ")];
  });
  return {
    hero: hero(lang, { ...P.hero, mainHref: "#sts-list", subHref: pageHref(lang, "business") }, true),
    main: [
      bands([
        { id: "sts-relation", inner: `<div class="nls-split">${titleBlock(P.relation.kicker, P.relation.title, "", "sts-relation-title")}${roster(P.relation.lines)}</div>` },
        {
          id: "sts-list",
          inner: `${titleBlock(P.list.kicker, P.list.title, P.list.lead, "sts-list-title")}
    <nav class="sts-rail" aria-label="${esc(C.ui.railLabel)}"><ol class="sts-rail__list">${rail}</ol></nav>
    <div class="sts-biz__list sts-biz__list--2">${cards}</div>`,
        },
        { id: "sts-matrix", inner: `${titleBlock(P.matrix.kicker, P.matrix.title, "", "sts-matrix-title")}${table(P.matrix.cols, rows, P.matrix.title.replace(/\n/g, " "))}` },
        { id: "sts-rules", inner: `${titleBlock(P.rules.kicker, P.rules.title, "", "sts-rules-title")}${flow(P.rules.items.map((x) => ({ ...x, lead: x.body })))}${notice(C)}` },
        faqBlock(C, "sts-faq", P.faq.title, P.faq.items),
      ]),
      closeBlock(C, P.close, btns(pageHref(lang, "business"), P.close.ctaMain, contactHref(lang, "type=product"), P.close.ctaSub)),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ Six platform product pages */
function switcher(C, lang, current) {
  const items = ST_PLATFORMS.map(
    (p) => `<li><a class="sts-switch__a" href="${platHref(lang, p.id)}"${p.id === current ? ' aria-current="page"' : ""}>${esc(p.name)}</a></li>`
  ).join("");
  return `<nav class="sts-switch" aria-label="${esc(C.ui.switcherLabel)}">
    <div class="sts-switch__in"><a class="sts-switch__all" href="${pageHref(lang, "platforms")}">← ${esc(C.ui.switcherLabel)}</a><ol class="sts-switch__list">${items}</ol></div>
  </nav>`;
}

function platformBody(C, lang, p) {
  const d = C.plat[p.id];
  const K = C.platCommon;
  const prods = d.products
    .map(
      (it, i) => `<article class="nls-board__item sts-prod${fillCls(i, d.products.length, colsFor(d.products.length))}">
        <div class="nls-board__meta"><span class="nls-board__n" aria-hidden="true">${n2(i)}</span><span class="nls-board__tag">${esc(C.ui.candidateLabel)}</span></div>
        <h3>${esc(it.name)}</h3>
        <p>${esc(it.body)}</p>
        <dl class="sts-prod__meta"><div><dt>${esc(C.ui.formatLabel)}</dt><dd>${esc(it.format)}</dd></div><div><dt>${esc(C.ui.forLabel)}</dt><dd>${esc(it.for)}</dd></div></dl>
      </article>`
    )
    .join("");
  const links = `<ul class="sts-cards sts-cards--3">
      <li><a class="sts-card" href="#sts-products" data-nls-scroll><span class="sts-card__n" aria-hidden="true">01</span><strong class="sts-card__t">${esc(C.ui.toProducts)}</strong><span class="sts-card__d">${esc(K.linkProducts)}</span><span class="sts-card__go">↑</span></a></li>
      <li><a class="sts-card" href="${pageHref(lang, "business")}#industry-${p.id}"><span class="sts-card__n" aria-hidden="true">02</span><strong class="sts-card__t">${esc(C.ui.toBusiness)}</strong><span class="sts-card__d">${esc(K.linkBusiness)}</span><span class="sts-card__go">→</span></a></li>
      <li><a class="sts-card" href="/${lang}/${p.site}/"><span class="sts-card__n" aria-hidden="true">03</span><strong class="sts-card__t">${esc(C.ui.toPlatformSite(p.name))}</strong><span class="sts-card__d">${esc(K.linkSite)}</span><span class="sts-card__go">→</span></a></li>
    </ul>`;
  const h = { eyebrow: K.eyebrow(p.name), wordmark: p.name, titleHtml: d.hero.titleHtml, lead: d.hero.lead, ctaMain: K.ctaMain, ctaSub: K.ctaSub, mainHref: "#sts-products", subHref: `${pageHref(lang, "business")}#industry-${p.id}` };
  return {
    hero: hero(lang, h, true),
    pre: switcher(C, lang, p.id),
    main: [
      bands([
        { id: "sts-purpose", inner: `<div class="nls-split">${titleBlock(K.purposeKicker, d.purpose.title, "", "sts-purpose-title")}${roster(d.purpose.lines)}</div>` },
        { id: "sts-personal", inner: `${titleBlock(K.personalKicker, K.personalTitle(p.name), d.personal.lead, "sts-personal-title")}${board(d.personal.items)}` },
        { id: "sts-biz", inner: `${titleBlock(K.bizKicker, K.bizTitle(p.name), d.biz.lead, "sts-biz-title")}${board(d.biz.items)}` },
        { id: "sts-products", inner: `${titleBlock(K.productsKicker, K.productsTitle, K.productsLead, "sts-products-title")}<div class="nls-board sts-cols-${colsFor(d.products.length)} sts-prods" data-sts-candidates="${d.products.length}">${prods}</div>${notice(C)}` },
        { id: "sts-cases", inner: `${titleBlock(K.casesKicker, K.casesTitle, "", "sts-cases-title")}${flow(d.cases, d.cases.length === 4 ? "sts-flow4" : "sts-flow3")}` },
        {
          id: "sts-fit",
          inner: `<div class="nls-split"><div>${titleBlock(K.fitKicker, K.fitTitle, "", "sts-fit-title")}</div>${dl([
            [C.ui.formatsLabel, chips(d.formats)],
            [C.ui.audienceLabel, chips(d.audience)],
          ])}</div><p class="nls-note sts-caution">${esc(d.caution)}</p>`,
        },
        { id: "sts-links", inner: `${titleBlock(K.linksKicker, K.linksTitle, "", "sts-links-title")}${links}` },
        faqBlock(C, "sts-faq", K.faqTitle(p.name), d.faq),
      ]),
      closeBlock(C, { kicker: K.closeKicker, titleHtml: K.closeTitleHtml(esc(p.name)), lead: K.closeLead }, btns(contactHref(lang, `type=product&area=${p.id}`), K.closeCtaMain, pageHref(lang, "platforms"), K.closeCtaSub)),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ 04 Business Products */
function businessBody(C, lang) {
  const B = C.business;
  const types = B.types.items
    .map(
      (t) => `<article id="type-${t.code}" class="sts-biz" aria-labelledby="type-${t.code}-title">
      <header class="sts-biz__head">
        <span class="sts-biz__code" aria-hidden="true">${esc(t.code)}</span>
        <div>
          <p class="nls-kicker" lang="en">${esc(t.en)}</p>
          <h3 id="type-${t.code}-title" class="sts-biz__title">${esc(t.name)}</h3>
        </div>
      </header>
      <p class="sts-biz__p">${esc(t.body)}</p>
      <p class="sts-sub">${esc(B.types.typesLabel)}</p>${chips(t.examples)}
    </article>`
    )
    .join("");
  const ind = ST_PLATFORMS.map((p, i) => {
    const it = B.industries.items[p.id];
    return `<article id="industry-${p.id}" class="nls-board__item sts-ind">
        <div class="nls-board__meta"><span class="nls-board__n" aria-hidden="true">${n2(i)}</span><span class="nls-board__tag" lang="en">${esc(p.name)}</span></div>
        <h3>${esc(it.name)}</h3>
        <ul class="sts-list">${it.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <p class="sts-ind__go"><a class="sts-link" href="${platHref(lang, p.id)}">${esc(C.ui.toPlatformPage(p.name))} →</a></p>
      </article>`;
  }).join("");
  return {
    hero: hero(lang, { ...B.hero, mainHref: "#sts-types", subHref: contactHref(lang, "type=license&area=business") }, true),
    main: [
      bands([
        { id: "sts-diff", inner: `${titleBlock(B.diff.kicker, B.diff.title, B.diff.lead, "sts-diff-title")}${table(B.diff.cols, B.diff.rows, B.diff.title.replace(/\n/g, " "))}` },
        { id: "sts-types", inner: `${titleBlock(B.types.kicker, B.types.title, "", "sts-types-title")}<div class="sts-biz__list sts-biz__list--3">${types}</div>` },
        { id: "sts-industries", inner: `${titleBlock(B.industries.kicker, B.industries.title, B.industries.lead, "sts-industries-title")}<div class="nls-board sts-cols-3">${ind}</div>${notice(C)}` },
        { id: "sts-packages", inner: `${titleBlock(B.packages.kicker, B.packages.title, B.packages.lead, "sts-packages-title")}${proc(B.packages.items)}` },
        { id: "sts-license", inner: `${titleBlock(B.license.kicker, B.license.title, B.license.lead, "sts-license-title")}${table(B.license.cols, B.license.rows, B.license.title.replace(/\n/g, " "))}` },
        { id: "sts-adopt", inner: `${titleBlock(B.adopt.kicker, B.adopt.title, "", "sts-adopt-title")}${pipe(B.adopt.items)}<p class="nls-note">${esc(B.adopt.note)}</p>` },
        { id: "sts-terms", inner: `<div class="nls-split"><div>${titleBlock(B.terms.kicker, B.terms.title, "", "sts-terms-title")}</div>${dl(B.terms.rows.map(([k, v]) => [k, esc(v)]))}</div>` },
        { id: "sts-support", inner: `${titleBlock(B.support.kicker, B.support.title, "", "sts-support-title")}${twoLists(B.support.include, B.support.exclude, C.ui.include, C.ui.exclude, "sts-two--scope")}` },
        {
          id: "sts-inquire",
          inner: `<div class="nls-split"><div>${titleBlock(B.inquire.kicker, B.inquire.title, B.inquire.lead, "sts-inquire-title")}<div class="nls-actions"><a class="nls-btn" href="${contactHref(lang, "type=license&area=business")}">${esc(B.inquire.cta)} →</a></div></div>${dirList(B.inquire.items)}</div>`,
        },
        faqBlock(C, "sts-faq", B.faq.title, B.faq.items),
      ]),
      closeBlock(C, B.close, btns(contactHref(lang, "type=license&area=business"), B.close.ctaMain, pageHref(lang, "platforms"), B.close.ctaSub)),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ 05 Contact */
let FORM_CSS = null;
function formCss() {
  if (FORM_CSS) return FORM_CSS;
  const tpl = fs.readFileSync(path.join(ROOT, "templates", "business-inquiry.html"), "utf8");
  const a = tpl.indexOf("      .bz-form-wrap {");
  const end = ".bz-fail.is-visible { display: block; }";
  const b = tpl.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error("render-studio-site: inquiry form styles not found in templates/business-inquiry.html");
  FORM_CSS = tpl.slice(a, b + end.length);
  return FORM_CSS;
}

function formHtml(C, lang) {
  const F = C.contact.form;
  const L = stCopyLang(lang);
  const typeOpts = ST_INQUIRY_TYPES.map((t) => `<option value="${esc(t.value)}" data-code="${esc(t.code)}">${esc(t[L][0])}</option>`).join("\n              ");
  const areaOpts = ST_INQUIRY_AREAS.map((p) => `<option value="${esc(p.value)}" data-code="${esc(p.code)}">${esc(p[L])}</option>`).join("\n              ");
  return `<div class="bz-form-wrap sts-form">
      <form class="bz-form" id="bz-inquiry-form" novalidate data-analytics="studio_inquiry" data-submit="${esc(F.submit)}" data-submitting="${esc(F.submitting)}" data-subject="${esc(F.subject)}" aria-describedby="sts-form-lead">
        <input type="hidden" name="category" value="NEWON Studio" />
        <div class="bz-field">
          <label for="bz-name">${esc(F.name)}<span class="bz-req" aria-hidden="true">*</span></label>
          <input id="bz-name" name="name" type="text" required maxlength="80" autocomplete="name" />
        </div>
        <div class="bz-field">
          <label for="sts-company">${esc(F.company)} <span class="bz-opt">(${esc(F.optional)})</span></label>
          <input id="sts-company" name="company" type="text" maxlength="120" autocomplete="organization" aria-describedby="sts-company-hint" />
          <p class="bz-field-hint" id="sts-company-hint">${esc(F.companyHint)}</p>
        </div>
        <div class="bz-field">
          <label for="bz-email">${esc(F.email)}<span class="bz-req" aria-hidden="true">*</span></label>
          <input id="bz-email" name="email" type="email" required maxlength="120" autocomplete="email" inputmode="email" />
        </div>
        <div class="bz-field">
          <label for="sts-area">${esc(F.area)}<span class="bz-req" aria-hidden="true">*</span></label>
          <select id="sts-area" name="area" required>
              <option value="" disabled selected>${esc(F.choose)}</option>
              ${areaOpts}
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
      <p class="bz-field-hint">${esc(F.direct)} <a class="sts-link" href="mailto:newon@newon.app">newon@newon.app</a></p>
    </div>
<script>
(function () {
  /* Preselect inquiry type (?type=) and product area (?area= or ?platform=) by code or value; keep ?source= for the inbox. */
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
  pre("sts-area", p.get("area") || p.get("platform"));
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
  const L = stCopyLang(lang);
  const types = ST_INQUIRY_TYPES.map(
    (t, i) => `<li><a class="sts-card" href="?type=${t.code}#sts-form" data-sts-type="${t.code}">
        <span class="sts-card__n" aria-hidden="true">${n2(i)}</span>
        <strong class="sts-card__t">${esc(t[L][0])}</strong>
        <span class="sts-card__d">${esc(t[L][1])}</span>
        <span class="sts-card__go">${esc(c.types.go)}</span>
      </a></li>`
  ).join("");
  const guide = ST_INQUIRY_TYPES.map((t, i) => {
    const g = c.guide.items[t.code];
    return `<article id="guide-${t.code}" class="sts-biz sts-biz--compact" aria-labelledby="guide-${t.code}-title">
      <header class="sts-biz__head">
        <span class="sts-biz__code" aria-hidden="true">${n2(i)}</span>
        <div><h3 id="guide-${t.code}-title" class="sts-biz__title">${esc(t[L][0])}</h3></div>
      </header>
      ${dl([
        [c.guide.whenLabel, esc(g.when)],
        [c.guide.writeLabel, esc(g.write)],
      ])}
      <p class="sts-biz__cta"><a class="sts-link" href="?type=${t.code}#sts-form">${esc(C.ui.askAbout)} →</a></p>
    </article>`;
  }).join("");
  const F = c.form;
  const formBlock = `<div class="nls-split sts-form-split">
      <div>
        ${titleBlock(F.kicker, F.title, "", "sts-form-title")}
        <p class="nls-lead" id="sts-form-lead">${esc(F.lead)}</p>
        <dl class="sts-dl sts-contact">
          <div class="sts-dl__row"><dt lang="en">${esc(F.contactLabel)}</dt><dd><strong>${esc(F.contactName)}</strong><br><a class="sts-link" href="mailto:newon@newon.app">newon@newon.app</a></dd></div>
        </dl>
      </div>
      ${formHtml(C, lang)}
    </div>`;
  const faq = faqBlock(C, "sts-faq", c.faq.title, c.faq.items);
  faq.inner += `<p class="nls-note">${esc(c.faq.privacyNote)} <a class="sts-link" href="/${lang}/privacy/">${esc(c.faq.privacyLink)}</a></p>`;
  return {
    hero: hero(lang, { ...c.hero, mainHref: "#sts-form", subHref: "#sts-types" }, true),
    main: [
      `<link rel="stylesheet" href="/business-page.css?v=20260923pad1" />
<style>
${formCss()}
</style>`,
      bands([
        { id: "sts-types", inner: `${titleBlock(c.types.kicker, c.types.title, c.types.lead, "sts-types-title")}<ul class="sts-cards sts-cards--3">${types}</ul>` },
        { id: "sts-guide", inner: `${titleBlock(c.guide.kicker, c.guide.title, "", "sts-guide-title")}<div class="sts-biz__list sts-biz__list--3">${guide}</div>` },
        { id: "sts-form", cls: "sts-form-sec", inner: formBlock },
        { id: "sts-include", inner: `<div class="nls-split"><div>${titleBlock(c.include.kicker, c.include.title, "", "sts-include-title")}</div>${dirList(c.include.items)}</div>` },
        { id: "sts-after", inner: `${titleBlock(c.after.kicker, c.after.title, "", "sts-after-title")}${pipe(c.after.items, "sts-pipe4")}<p class="nls-note">${esc(c.after.note)}</p>` },
        { id: "sts-scope", inner: `${titleBlock(c.scope.kicker, c.scope.title, "", "sts-scope-title")}${twoLists(c.scope.include, c.scope.exclude, C.ui.include, C.ui.exclude, "sts-two--scope")}` },
        faq,
      ]),
      closeBlock(C, c.close, btns(pageHref(lang, "store"), c.close.ctaMain, pageHref(lang, "business"), c.close.ctaSub)),
    ].join("\n"),
  };
}

const BODY = { overview: overviewBody, store: storeBody, platforms: platformsBody, business: businessBody, contact: contactBody };

export function renderStudioSection(lang, screen) {
  const C = getStudioCopy(lang);
  const out = screen.platform ? platformBody(C, lang, screen.platform) : BODY[screen.id](C, lang);
  const fallbackLang = stCopyLang(lang) !== lang ? ` lang="${stCopyLang(lang)}"` : "";
  return `<section id="lifestage-detail" class="nls" data-story="studio" data-sts-page="${screen.id}"${fallbackLang} aria-labelledby="sts-title">
    ${out.hero}
  ${renderFlagshipSubnav({ biz: "studio", lang, active: screen.active })}
  ${out.pre || ""}
  <div class="nls__wrap">
    ${out.main}
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

function jsonLd(lang, screen, seo, url) {
  const C = getStudioCopy(lang);
  const ko = stCopyLang(lang) === "ko";
  const page = {
    "@context": "https://schema.org",
    "@type": screen.id === "contact" ? "ContactPage" : "WebPage",
    name: seo.title,
    description: seo.desc,
    url,
    inLanguage: stCopyLang(lang),
    isPartOf: { "@type": "WebSite", name: "Newon", url: SITE_ORIGIN },
    publisher: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN, email: "newon@newon.app" },
  };
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${lang}/` },
    { "@type": "ListItem", position: 2, name: C.ui.crumb, item: `${SITE_ORIGIN}${stPath(lang)}` },
  ];
  if (screen.platform) {
    const pl = navOf("platforms");
    crumbs.push({ "@type": "ListItem", position: 3, name: ko ? pl.ko : pl.en, item: `${SITE_ORIGIN}${pageHref(lang, "platforms")}` });
    crumbs.push({ "@type": "ListItem", position: 4, name: screen.platform.name, item: url });
  } else if (screen.id !== "overview") {
    const n = navOf(screen.id);
    crumbs.push({ "@type": "ListItem", position: 3, name: ko ? n.ko : n.en, item: url });
  }
  const crumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs };
  return `    <script type="application/ld+json">${JSON.stringify(page)}</script>
    <script type="application/ld+json">${JSON.stringify(crumb)}</script>`;
}

function renderPage(lang, screen) {
  const { flat, flatEn } = localeFlat(lang);
  const C = getStudioCopy(lang.dir);
  const seo = C.seo[screen.id];
  const sub = screen.sub ? `${ST_SLUG}/${screen.sub}` : ST_SLUG;
  const depth = sub.split("/").length;
  const base = "../".repeat(depth);
  const header = renderStudioHeader(flat, flatEn, { activeNav: "studio", base });
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
    MAIN_CONTENT: renderStudioSection(lang.dir, screen),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=${ST_VER}" />
    <link rel="stylesheet" href="/flagship-subnav.css?v=20261019fsn3" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="/studio-site.css?v=${ST_VER}" />
${jsonLd(lang.dir, screen, seo, canonical)}`,
    EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260924play2"></script>
    <script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, ST_SLUG, screen.sub, "index.html");
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
<title>NEWON Studio</title>
<link rel="canonical" href="${SITE_ORIGIN}${to}" />
<meta http-equiv="refresh" content="0;url=${to}" />
<script>location.replace(${JSON.stringify(to)} + (location.hash || ""));</script>
</head>
<body><p><a href="${to}">NEWON Studio →</a></p></body>
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
<title>NEWON Studio</title>
<link rel="canonical" href="${SITE_ORIGIN}/ko/${target}" />
<meta http-equiv="refresh" content="0;url=/ko/${target}" />
<script>
(function(){
  var LANGS=["ko","en","ja","es","pt-br","fr","de","hi","id"];
  var pref="ko";
  try{var s=localStorage.getItem("newon-lang-dir");if(s&&LANGS.indexOf(s)!==-1)pref=s;}catch(e){}
  location.replace("/"+pref+"/${target}"+(location.search||"")+(location.hash||""));
})();
</script>
</head>
<body><p><a href="/ko/${target}">NEWON Studio →</a></p></body>
</html>
`;
}

function writeFile(rel, html, written) {
  const out = path.join(ROOT, rel);
  ensureDir(out);
  fs.writeFileSync(out, html);
  written.push(rel);
}

export function renderStudioSite() {
  const written = [];
  for (const screen of STUDIO_SCREENS) for (const lang of LANGS) written.push(renderPage(lang, screen));
  for (const [from, to] of Object.entries(LEGACY_STUDIO_REDIRECTS)) {
    for (const lang of LANGS) writeFile(path.join(lang.dir, from, "index.html"), langStub(lang, to), written);
    writeFile(path.join(from, "index.html"), rootStub(to), written);
  }
  // Root (language-less) entries for the new screens; /studio/ itself keeps its existing language redirect.
  for (const screen of STUDIO_SCREENS) if (screen.sub) writeFile(path.join(ST_SLUG, screen.sub, "index.html"), rootStub(`${ST_SLUG}/${screen.sub}/`), written);
  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const rel of written) {
      const dest = path.join(pub, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(ROOT, rel), dest);
    }
  }
  console.log(`render-studio-site: wrote ${written.length} files (${STUDIO_SCREENS.length} screens × ${LANGS.length} locales + ${Object.keys(LEGACY_STUDIO_REDIRECTS).length} legacy URLs × ${LANGS.length + 1})`);
  return written;
}

if (import.meta.url === `file://${process.argv[1]}`) renderStudioSite();
