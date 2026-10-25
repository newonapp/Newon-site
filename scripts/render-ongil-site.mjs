#!/usr/bin/env node
/**
 * ONGIL corporate website — five pages for KO and EN:
 *   /{ko,en}/ongil/               01 Overview      (replaces the earlier single ONGIL introduction for these two locales)
 *   /{ko,en}/ongil/platform/      02 Platform      (29 long-term areas in 7 groups; Life Box · Friends · Safe Band as own sections; 29 Giving after them)
 *   /{ko,en}/ongil/business/      03 Business      (21 business groups in 8 categories + payers, fee principles, GTM, roadmap)
 *   /{ko,en}/ongil/partnerships/  04 Partnerships  (14 partner types + PoC proposals, data/API, campaigns)
 *   /{ko,en}/ongil/contact/       05 Contact       (14 inquiry types in 3 groups → the existing Newon email / business inquiry form)
 *
 * Design: the same Life Stage shell as PETLOG / BABYLOG / LIVON — the dark "film" first screen
 * (#lifestage-detail.nls .nls-film, home-lifestage.css + home-lifestage-layout.css + home-lifestage.js), then the shared
 * five-menu bar (flagship-subnav.mjs), then white/black minimal sections. ONGIL-only layouts are ogs-* classes in
 * /ongil-site.css, scoped to #lifestage-detail.ogs (ONGIL Warm Apricot used only as a point colour).
 *
 * Runs AFTER render-ongil.mjs (build-i18n.mjs). The other seven locales keep the existing localized ONGIL page that
 * render-ongil.mjs writes; their sub-pages forward to EN (writeForwardStubs). Header/footer come from site-chrome.mjs.
 * Business introduction only: no sign-in, booking, payment, CRM or new inquiry backend.
 *
 * V2 (2026-10-19): per-card status badges and the status legend are no longer rendered. Each page shows one shared
 * notice (c.notice, existing .ogs-note style, marked .ogs-notice) and each item states availability in its own copy.
 * Design (Warm Apricot, ongil-site.css) is unchanged; only existing component classes are used.
 *
 * V3 accent redesign (2026-10-19): sections below the film hero use varied layouts (icon tiles, wash bands, stepper,
 * layer stack, role cards, check grid, callouts) with Warm Apricot as a point colour and inline line icons
 * (ongil-site-icons.mjs). No screenshots or raster images. Hero, shared menu and all copy/links are unchanged.
 *
 * V4 content upgrade (2026-10-24): content follows the final integrated business plan (28 areas) and the IR summary.
 * Status is shown by grouping (c.status: now / in development / planned / under review), never by per-card badges.
 * The film hero (video, text, buttons, size, veil) is untouched. Reuses the existing ogs-* patterns; the only new
 * CSS is a few column modifiers and the FAQ disclosure list (ongil-site.css, scoped).
 *
 * RD body redesign (2026-10-25): everything below the film hero and the shared sub-menu is re-laid out as an editorial,
 * calm product site for seniors and families — one layout per content type (statement, paired rows, bento, comparison
 * tables, phase board, real step sequences, directories, accordions), body text >= 16px, no section numbers, no
 * decorative shapes. Copy, links, ids/anchors and status grouping are unchanged. Hero markup/CSS untouched.
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
import { renderFlagshipSubnav, FLAGSHIP_SUBNAV_CSS } from "./flagship-subnav.mjs";
import { KO } from "./ongil-site-ko.mjs";
import { EN } from "./ongil-site-en.mjs";
import {
  icon,
  FACT_ICONS,
  VALUE_ICONS,
  JOURNEY_ICONS,
  CORE_ICONS,
  PEOPLE_ICONS,
  LAYER_ICONS,
  NEXT_ICONS,
  AREA_ICONS,
  CATEGORY_ICONS,
  PARTNER_ICONS,
  PROCESS_ICONS,
} from "./ongil-site-icons.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
export const OGS_VER = "20261026ng2";
const NLS_VER = "20261025ov1"; // Life Stage assets are reused as-is
/** ONGIL first-screen background film (owner-provided, 2026-10-18). */
const ONGIL_FILM = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260323_071151_38c3924f-c312-48af-a196-3fbb80e4226f.mp4";

export const SITE_LANGS = ["ko", "en"];
export const PAGES = ["overview", "platform", "business", "partnerships", "contact"];
const CONTENT = { ko: { c: KO }, en: { c: EN } };

const e = escapeHtml;
const nl = (s) => e(s || "").replace(/\n/g, "<br>");
const pad = (i) => String(i).padStart(2, "0");

function pagePath(lang, page) {
  return page === "overview" ? `/${lang}/ongil/` : `/${lang}/ongil/${page}/`;
}
function rel(lang, p) {
  // content links: "contact/" → ONGIL page, "lifestage/" etc → site page, "/x" absolute
  if (!p) return `/${lang}/ongil/`;
  if (p.startsWith("/") || /^https?:|^mailto:/.test(p)) return p;
  if (["platform/", "business/", "partnerships/", "contact/"].includes(p)) return `/${lang}/ongil/${p}`;
  return `/${lang}/${p}`;
}

/* ───────── shared pieces (RD 2026-10-25: editorial body redesign; hero + sub-menu untouched) ───────── */

/** Kicker text that is plain English/ASCII gets lang="en" (screen readers pronounce it correctly). */
const enAttr = (t) => (/^[\x20-\x7E·–—→↓]+$/.test(t || "") ? ' lang="en"' : "");

/** Section heading. split = title left, lead right (desktop). Quiet sentence-case eyebrow, no numbers. */
function head(id, kicker, title, lead, { split = false, wide = false } = {}) {
  return `<header class="ogs-head${split ? " ogs-head--split" : ""}${wide ? " ogs-head--wide" : ""}">
      <div class="ogs-head__main">
        ${kicker ? `<p class="ogs-eyebrow"${enAttr(kicker)}>${e(kicker)}</p>` : ""}
        <h2 class="ogs-h2" id="${id}-t">${nl(title)}</h2>
      </div>
      ${lead ? `<p class="ogs-lead">${e(lead)}</p>` : ""}
    </header>`;
}

/** One body section. tone: "" (white) · "tint" (apricot wash, one key band) · "mist" (neutral band) · "ink" (black band). */
function sec(id, inner, { tone = "", cls = "" } = {}) {
  const t =
    tone === "tint" ? " nls-block--band ogs-band ogs-tint" : tone === "mist" ? " nls-block--band ogs-band ogs-mist" : tone === "ink" ? " nls-block--ink ogs-band ogs-ink" : "";
  return `<section id="${id}" class="nls-block ogs-sec${t}${cls ? " " + cls : ""}" data-hs-section aria-labelledby="${id}-t">
    ${inner}
  </section>`;
}

const note = (t, strong = false) => (t ? `<p class="nls-note ogs-note${strong ? " ogs-note--strong" : ""}">${e(t)}</p>` : "");
/** The one shared notice per page (replaces the per-card status badges). */
const notice = (c) => `<p class="nls-note ogs-note ogs-notice">${e(c.notice)}</p>`;
/** Apricot icon tile. */
const tile = (name, mod = "") => `<span class="ogs-tile${mod ? " ogs-tile--" + mod : ""}">${icon(name)}</span>`;
/** Small inline icon mark (no tile). */
const mark = (name, mod = "") => `<span class="ogs-mark${mod ? " ogs-mark--" + mod : ""}">${icon(name)}</span>`;
/** Small label above a value / heading. */
const tag = (t, accent = false, n = "") =>
  `<p class="ogs-tag${accent ? " ogs-tag--accent" : ""}">${n ? `<span class="ogs-tag__n">${e(n)}</span>` : ""}<span${enAttr(t)}>${e(t)}</span></p>`;

/** First screen: the shared dark film hero, no video and no poster (gradient fallback in ongil-site.css). */
function hero(c, h, { main, sub, compact }) {
  const lead = h.lead || h.body;
  const btn = ([label, href], ghost) => {
    const scroll = href.startsWith("#") ? " data-nls-scroll" : "";
    return `<a class="nls-btn${ghost ? " nls-btn--ghost" : ""}" href="${e(href)}"${scroll}>${e(label)}</a>`;
  };
  return `<div class="nls-film ogs-film${compact ? " ogs-film--compact" : ""}" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${ONGIL_FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${ONGIL_FILM}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark" lang="en">${e(c.brand)}</p>
        <h1 id="ogs-hero-title" class="nls-film__slogan">${h.titleHtml}</h1>
        ${lead ? `<p class="nls-film__lead">${e(lead)}</p>` : ""}
        <div class="nls-film__actions">
          ${btn(main, false)}
          ${btn(sub, true)}
        </div>
      </div>
    </div>
  </div>`;
}

function notesFoot(c) {
  return `<aside class="ogs-foot" aria-label="${e(c.ui.notesLabel)}">
    <div class="nls__wrap ogs-foot__in">
      <p><span class="ogs-foot__k" lang="en">App</span>${e(c.appNote)}</p>
      <p><span class="ogs-foot__k" lang="en">Safety</span>${e(c.safetyNote)}</p>
    </div>
  </aside>`;
}

/** Item CTA. The web-preview ("start") entry points were removed by the owner; those items point to the inquiry page. */
function ctaLink(c, lang, key) {
  if (key === "partners") return `<a class="ogs-link" href="${pagePath(lang, "partnerships")}">${e(c.ui.propose)} →</a>`;
  return `<a class="ogs-link" href="${pagePath(lang, "contact")}">${e(c.ui.inquiry)} →</a>`;
}
const backLink = (c) => `<a class="ogs-top" href="#ogs-index">${e(c.ui.back)} ↑</a>`;
const footLinks = (...links) => `<div class="ogs-foot-links">${links.join("")}</div>`;

/** Black closing band: centred title; the first action is the apricot CTA. */
function closeInk(c, lang, actions, x) {
  return sec(
    "ogs-close",
    `<div class="ogs-close">
      <p class="ogs-eyebrow"${enAttr(x.closeKicker || c.ui.closeKicker)}>${e(x.closeKicker || c.ui.closeKicker)}</p>
      <h2 class="ogs-close__title" id="ogs-close-t">${x.closeTitleHtml}</h2>
      <p class="ogs-close__lead">${e(x.closeLead)}</p>
      <div class="ogs-actions">${actions
        .map(([label, href], i) => `<a class="nls-btn${i ? " nls-btn--ghost" : " ogs-btn--accent"}" href="${e(href)}">${e(label)}${i ? "" : " →"}</a>`)
        .join("")}</div>
    </div>`,
    { tone: "ink" }
  );
}

/** Area number (01–29) by area id: 25 regular areas + the 3 signature features + 29 Giving (fixed n). */
const areaN = (s, i) => s.n || pad(i + 1);
function areaIndex(c) {
  const map = {};
  c.platform.sections.forEach((s, i) => (map[s.id] = areaN(s, i)));
  c.platform.features.forEach((f) => (map[f.id] = f.n));
  return map;
}

/** Status board: now / in development / planned / under review as one four-column comparison panel.
 *  "Available now" is the only highlighted column, so present and future never read alike. hrefFor(areaId) → link. */
function phaseBoard(c, hrefFor) {
  const st = c.status;
  const nums = areaIndex(c);
  return `<ol class="ogs-phase">${st.cols
    .map(
      (col, ci) => `<li class="ogs-phase__col${ci === 0 ? " ogs-phase__col--now" : ""}">
        <div class="ogs-phase__head">${mark(col.icon)}<div><p class="ogs-phase__t">${e(col.ko)}</p>${c.lang === "ko" ? `<p class="ogs-phase__en" lang="en">${e(col.en)}</p>` : ""}</div></div>
        <ul>${col.items.map((it) => `<li><a href="${e(hrefFor(it.a))}"><span class="ogs-phase__n">${e(nums[it.a] || "")}</span><span class="ogs-phase__x">${e(it.t)}</span></a></li>`).join("")}</ul>
      </li>`
    )
    .join("")}</ol>
      ${note(st.basis)}`;
}

/** Check list (trust / privacy / data). Alert items are pulled out into one red callout at the end. */
function checkList(points, cls = "") {
  const plain = points.filter((p) => !p.alert);
  const alerts = points.filter((p) => p.alert);
  return `<ul class="ogs-checks${cls ? " " + cls : ""}">${plain
    .map((p) => `<li>${mark("check")}<div><strong>${e(p.t)}</strong><p>${e(p.text)}</p></div></li>`)
    .join("")}</ul>${alerts
    .map((p) => `<div class="ogs-callout ogs-callout--alert">${mark("alert")}<div><strong>${e(p.t)}</strong><p>${e(p.text)}</p></div></div>`)
    .join("")}`;
}

/** Real sequence only: numbered steps in columns (n = 3, 4 or 5). */
function steps(list, icons, n) {
  return `<ol class="ogs-steps ogs-steps--${n}">${list
    .map((s, i) => `<li><div class="ogs-steps__top"><span class="ogs-steps__n">${e(s.n)}</span>${icons ? mark(icons[i % icons.length]) : ""}</div><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`)
    .join("")}</ol>`;
}

/** Large statement + lead + facts (Overview A, Partnerships A). */
function introBlock(c, ab) {
  return `<div class="ogs-intro">
      <p class="ogs-eyebrow" lang="en">${e(ab.kicker)}</p>
      <h2 class="ogs-statement" id="ogs-intro-t">${e(ab.statement)}</h2>
      <div class="ogs-intro__grid">
        <p class="ogs-intro__lead">${e(ab.lead)}</p>
        <dl class="ogs-facts">${ab.facts.map((f, i) => `<div><dt>${mark(FACT_ICONS[i % FACT_ICONS.length])}${e(f.k)}</dt><dd>${e(f.v)}</dd></div>`).join("")}</dl>
      </div>
    </div>
    ${notice(c)}`;
}

/** Two-or-three column comparison table; on phones each row becomes a stacked block with inline labels. */
function table(cls, cols, rows) {
  return `<div class="ogs-table-wrap"><table class="ogs-table ${cls}">
      <thead><tr>${cols.map((h, i) => (h ? `<th scope="col">${e(h)}</th>` : `<td aria-hidden="true"></td>`)).join("")}</tr></thead>
      <tbody>${rows
        .map((r) => `<tr><th scope="row">${r.head}</th>${r.cells.map((v, i) => `<td><span class="ogs-td-k" aria-hidden="true">${e(cols[i + 1])}</span>${v}</td>`).join("")}</tr>`)
        .join("")}</tbody>
    </table></div>`;
}

/* ───────── 01 Overview ───────── */

function overviewMain(c, S, lang) {
  const o = c.overview;
  const plat = (id) => `${pagePath(lang, "platform")}#p-${id}`;

  // A · large statement, lead + four facts, then the page's one shared notice
  const intro = sec("ogs-intro", introBlock(c, o.about));

  // B · problem → ONGIL's way, as paired rows (no boxes)
  const pr = o.problems;
  const problems = sec(
    "ogs-problems",
    `${head("ogs-problems", pr.label, pr.title, pr.lead, { split: true })}
      <ol class="ogs-pairs">${pr.items
        .map(
          (it) => `<li class="ogs-pair">
          <div class="ogs-pair__q">${tag("Problem")}<h3>${e(it.problem)}</h3><p>${e(it.text)}</p></div>
          <div class="ogs-pair__a">${tag(pr.solutionLabel, true)}<p>${e(it.how)}</p></div>
        </li>`
        )
        .join("")}</ol>`
  );

  // C · six core values: large-type cards on a neutral band
  const mission = sec(
    "ogs-vision",
    `${head("ogs-vision", o.mission.label, o.mission.title, o.mission.lead, { split: true })}
      <ul class="ogs-vals">${o.mission.values
        .map(
          (v, i) => `<li>${mark(VALUE_ICONS[i % VALUE_ICONS.length])}<p class="ogs-vals__en" lang="en">${e(v.en)}</p>${c.lang === "ko" ? `<p class="ogs-vals__ko">${e(v.ko)}</p>` : ""}<p class="ogs-vals__t">${e(v.text)}</p></li>`
        )
        .join("")}</ul>`,
    { tone: "mist" }
  );

  // D · 28 areas at a glance: bento of the six groups (area ranges are the real area numbers)
  const journey = sec(
    "ogs-support",
    `${head("ogs-support", o.journey.label, o.journey.title, o.journey.lead, { split: true })}
      <ul class="ogs-bento">${o.journey.items
        .map(
          (s, i) => `<li class="ogs-bento__t ogs-bento__t--${i + 1}">
          <div class="ogs-bento__top">${tile(JOURNEY_ICONS[i % JOURNEY_ICONS.length])}<span class="ogs-bento__n">${e(s.n)}</span></div>
          <div class="ogs-bento__body">${c.lang === "ko" ? `<p class="ogs-bento__en" lang="en">${e(s.en)}</p><h3>${e(s.name)}</h3>` : `<h3>${e(s.en)}</h3>`}<p>${e(s.text)}</p></div>
        </li>`
        )
        .join("")}</ul>
      ${footLinks(`<a class="ogs-link" href="${pagePath(lang, "platform")}#ogs-index">${e(c.ui.toPlatform)} →</a>`)}`
  );

  // E · use cases: asymmetric split, a calm list of moments
  const core = sec(
    "ogs-journey",
    `<div class="ogs-split">
      ${head("ogs-journey", o.core.label, o.core.title, o.core.lead)}
      <ul class="ogs-moments">${o.core.steps
        .map((s, i) => `<li>${tile(CORE_ICONS[i % CORE_ICONS.length])}<div><h3>${e(s.name)}</h3><p>${e(s.text)}</p></div></li>`)
        .join("")}</ul>
    </div>`
  );

  // F · three core users as columns; the consent rule as a full-width bar beneath
  const ppl = o.people.items;
  const people = sec(
    "ogs-who",
    `${head("ogs-who", o.people.label, o.people.title, o.people.lead, { split: true })}
      <ul class="ogs-people">${ppl
        .slice(0, -1)
        .map((s, i) => `<li>${tile(PEOPLE_ICONS[i % PEOPLE_ICONS.length], "lg")}<h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`)
        .join("")}</ul>
      <div class="ogs-callout ogs-callout--key">${mark(PEOPLE_ICONS[3])}<div><strong>${e(ppl[ppl.length - 1].name)}</strong><p>${e(ppl[ppl.length - 1].text)}</p></div></div>`,
    { tone: "mist" }
  );

  // G · differentiation vs existing alternatives: a two-column comparison table
  const cp = o.compare;
  const compare = sec(
    "ogs-compare",
    `${head("ogs-compare", cp.label, cp.title, cp.lead, { split: true })}
      ${table(
        "ogs-table--compare",
        [cp.altLabel, cp.diffLabel],
        cp.items.map((it) => ({ head: `<strong>${e(it.alt)}</strong><span>${e(it.text)}</span>`, cells: [`${mark("arrow")}<span>${e(it.diff)}</span>`] }))
      )}`
  );

  // H · current service status: the key apricot band (now vs later kept clearly apart)
  const status = sec(
    "ogs-status",
    `${head("ogs-status", c.status.label, c.status.title, c.status.lead, { split: true })}
      ${phaseBoard(c, plat)}`,
    { tone: "tint" }
  );

  // I · long-term vision: four expansion stages in order
  const beyond = sec(
    "ogs-ecosystem",
    `${head("ogs-ecosystem", o.beyond.label, o.beyond.title, o.beyond.lead, { split: true })}
      ${steps(o.beyond.layers, LAYER_ICONS, 4)}
      ${note(o.beyond.note)}`
  );

  // J · trust & responsibility: two-column check list, emergency guidance as a red callout
  const trust = sec(
    "ogs-family",
    `${head("ogs-family", o.trust.label, o.trust.title, o.trust.lead, { split: true })}
      ${checkList(o.trust.points, "ogs-checks--2")}`,
    { cls: "ogs-sec--rule" }
  );

  // K · related Newon platforms: link rows
  const newon = sec(
    "ogs-newon",
    `${head("ogs-newon", o.newon.label, o.newon.title, o.newon.lead, { split: true })}
      <ul class="ogs-linkrows">${o.newon.items
        .map((s) => `<li><a href="${rel(lang, s.href)}"><strong lang="en">${e(s.name)}</strong><span class="ogs-linkrows__t">${e(s.text)}</span><span class="ogs-linkrows__arrow" aria-hidden="true">${icon("arrow")}</span></a></li>`)
        .join("")}</ul>`,
    { tone: "mist" }
  );

  // L · black close with three next steps
  const next = sec(
    "ogs-next",
    `<header class="ogs-head ogs-head--center"><div class="ogs-head__main"><p class="ogs-eyebrow" lang="en">${e(o.next.label)}</p><h2 class="ogs-h2" id="ogs-next-t">${nl(o.next.title)}</h2></div></header>
      <ul class="ogs-next">${o.next.items
        .map(
          (s, i) => `<li>${tile(NEXT_ICONS[i % NEXT_ICONS.length], "ink")}<p class="ogs-next__k">${e(s.k)}</p><p>${e(s.text)}</p><a class="nls-btn${i ? " nls-btn--ghost" : " ogs-btn--accent"}" href="${rel(lang, s.href)}">${e(s.cta)} →</a></li>`
        )
        .join("")}</ul>`,
    { tone: "ink" }
  );

  return [intro, problems, mission, journey, core, people, compare, status, beyond, trust, newon, next].join("\n");
}

/* ───────── 02 Platform ───────── */

/** Area label: area number (real 01–25 id) + English area name. */
const areaTag = (s, n) => tag(s.label.replace(/^\d\d /, ""), true, n);
const areaMeta = (c, s) =>
  `<dl class="ogs-meta"><div><dt>${e(c.ui.audience)}</dt><dd>${e(s.audience)}</dd></div></dl>${note(s.note)}`;
const ticks = (items, cls = "") => `<ul class="ogs-ticks${cls ? " " + cls : ""}">${(items || []).map((t) => `<li>${mark("check")}<span>${e(t)}</span></li>`).join("")}</ul>`;
const chips = (items) => `<ul class="ogs-chips">${(items || []).map((t) => `<li>${e(t)}</li>`).join("")}</ul>`;

/** One signature area (26 Life Box · 27 Friends · 28 Safe Band) as its own section. */
function featureSection(c, lang, f, i) {
  const id = `p-${f.id}`;
  return sec(
    id,
    `${head(id, f.kicker, f.title, f.lead, { split: true })}
      <div class="ogs-feat">
        <div class="ogs-feat__main">
          <div class="ogs-feat__top">${tile(f.icon, "lg")}${tag(f.label, true, f.n)}</div>
          <h3>${e(f.listTitle)}</h3>
          <dl class="ogs-feat__dl">${f.list.map((it) => `<div><dt>${e(it.t)}</dt><dd>${e(it.text)}</dd></div>`).join("")}</dl>
        </div>
        <div class="ogs-feat__side">
          <h3>${e(f.moreTitle)}</h3>
          ${ticks(f.more)}
          ${note(f.note)}
          ${footLinks(ctaLink(c, lang, "partners"), backLink(c))}
        </div>
      </div>
      ${steps(f.steps, ["spark", "link", "star"], 3)}`,
    { tone: "tint", cls: `ogs-sec--sig${i ? "" : " ogs-sec--sig-first"}` }
  );
}

function platformMain(c, S, lang) {
  const p = c.platform;
  const all = [...p.sections.map((s, i) => ({ ...s, n: areaN(s, i) })), ...p.features.map((f) => ({ id: f.id, grp: "F", n: f.n, title: f.title.split("\n")[1] || f.title, label: f.label }))];

  // A · heading + notice, then a directory: the six groups (letter, name, count) each listing its areas
  const dir = p.groupMap
    .map((g) => {
      const list = all.filter((s) => s.grp === g.id);
      return `<li class="ogs-dir__g">
        <div class="ogs-dir__h"><span class="ogs-dir__badge" lang="en">${e(g.id)}</span><div><strong lang="en">${e(g.en)}</strong>${c.lang === "ko" ? `<span>${e(g.ko)}</span>` : ""}</div><b class="ogs-dir__count">${list.length}</b></div>
        <ol>${list.map((s) => `<li><a href="#p-${e(s.id)}"><span class="ogs-dir__n">${e(s.n)}</span><span class="ogs-dir__x"><strong>${e(s.title)}</strong><em lang="en">${e(s.label.replace(/^\d\d /, "").replace(/^ONGIL /, ""))}</em></span></a></li>`).join("")}</ol>
      </li>`;
    })
    .join("");
  const index = sec(
    "ogs-index",
    `${head("ogs-index", `${c.ui.onThisPage} · ${all.length}`, p.indexTitle, p.indexLead, { split: true })}
      ${notice(c)}
      <p class="ogs-dir__title">${e(c.ui.groupMapTitle)}</p>
      <ol class="ogs-dir">${dir}</ol>`
  );

  // B · current offer vs development plan (key apricot band)
  const status = sec(
    "ogs-status",
    `${head("ogs-status", c.status.label, c.status.title, c.status.lead, { split: true })}
      ${phaseBoard(c, (id) => `#p-${id}`)}`,
    { tone: "tint" }
  );

  // C · groups A–E, each with a layout of its own: split rows · cards on mist · three-column lines · cards · rows on mist.
  //     A group marked `after` (G · 29 Giving) is rendered after the signature sections, as split rows.
  const layouts = ["rows", "cards", "lines", "cards", "rows", "rows"];
  const groupSecs = p.groups
    .map((g, gi) => {
      const items = p.sections.slice(g.from, g.to);
      const layout = layouts[gi % layouts.length];
      const n = (i) => areaN(items[i], g.from + i);
      let body;
      if (layout === "rows") {
        body = `<div class="ogs-rows">${items
          .map(
            (s, i) => `<article class="ogs-row" id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
          <div class="ogs-row__head">${tile(AREA_ICONS[s.id] || JOURNEY_ICONS[gi])}${areaTag(s, n(i))}<h3 id="p-${e(s.id)}-t">${e(s.title)}</h3><p>${e(s.desc)}</p></div>
          <div class="ogs-row__body"><p class="ogs-dt">${e(c.ui.services)}</p>${ticks(s.services, "ogs-ticks--2")}${areaMeta(c, s)}${footLinks(ctaLink(c, lang, s.cta), backLink(c))}</div>
        </article>`
          )
          .join("")}</div>`;
      } else if (layout === "lines") {
        body = `<div class="ogs-lines">${items
          .map(
            (s, i) => `<article class="ogs-row" id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
          <div class="ogs-lines__a">${mark(AREA_ICONS[s.id] || JOURNEY_ICONS[gi])}${areaTag(s, n(i))}<h3 id="p-${e(s.id)}-t">${e(s.title)}</h3></div>
          <div class="ogs-lines__b"><p>${e(s.desc)}</p>${areaMeta(c, s)}</div>
          <div class="ogs-lines__c"><p class="ogs-dt">${e(c.ui.services)}</p>${chips(s.services)}${footLinks(ctaLink(c, lang, s.cta), backLink(c))}</div>
        </article>`
          )
          .join("")}</div>`;
      } else {
        body = `<div class="ogs-cards ogs-cards--2">${items
          .map(
            (s, i) => `<article class="ogs-card" id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
          <div class="ogs-card__top">${tile(AREA_ICONS[s.id] || JOURNEY_ICONS[gi])}${areaTag(s, n(i))}</div><h3 id="p-${e(s.id)}-t">${e(s.title)}</h3><p class="ogs-card__desc">${e(s.desc)}</p>
          <p class="ogs-dt">${e(c.ui.services)}</p>${chips(s.services)}
          ${areaMeta(c, s)}
          ${footLinks(ctaLink(c, lang, s.cta), backLink(c))}
        </article>`
          )
          .join("")}</div>`;
      }
      const tone = gi === 1 || gi === 4 ? "mist" : "";
      return { after: !!g.after, html: sec(`ogs-area-${gi + 1}`, `${head(`ogs-area-${gi + 1}`, g.kicker, g.title, g.lead, { split: true })}${body}`, {
        tone,
        cls: tone ? "" : "ogs-sec--rule",
      }) };
    });
  const groups = groupSecs.filter((g) => !g.after).map((g) => g.html).join("\n");
  const later = groupSecs.filter((g) => g.after).map((g) => g.html).join("\n");

  // D · the three signature areas: one continuous apricot zone, each its own section
  const features = p.features.map((f, i) => featureSection(c, lang, f, i)).join("\n");

  // E · user scenarios: "now vs later" comparison table
  const sc = p.scenarios;
  const scenarios = sec(
    "ogs-scenarios",
    `${head("ogs-scenarios", sc.label, sc.title, sc.lead, { split: true })}
      ${table(
        "ogs-table--nowlater",
        ["", sc.nowLabel, sc.laterLabel],
        sc.items.map((it) => ({ head: `<span class="ogs-table__who">${e(it.who)}</span><strong>${e(it.title)}</strong><span>${e(it.text)}</span>`, cells: [e(it.now), e(it.later)] }))
      )}`
  );

  // F · by user type: four columns on mist; the last (institution accounts) carries the apricot rule
  const ro = p.roles;
  const roles = sec(
    "ogs-roles",
    `${head("ogs-roles", ro.label, ro.title, ro.lead, { split: true })}
      <ul class="ogs-people ogs-people--4">${ro.items
        .map((s, i) => `<li${i === ro.items.length - 1 ? ' class="ogs-people__key"' : ""}>${tile(["person", "users", "hands", "building"][i % 4], "lg")}<h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`)
        .join("")}</ul>`,
    { tone: "mist" }
  );

  // G · how the areas connect: one spec panel listing the five shared systems
  const sy = p.systems;
  const systems = sec(
    "ogs-systems",
    `${head("ogs-systems", sy.label, sy.title, sy.lead, { split: true })}
      <ul class="ogs-spec">${sy.layers
        .map((s, i) => `<li>${tile(["lock", "clipboard", "shield", "compass", "layers"][i % 5])}<h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`)
        .join("")}</ul>`
  );

  // H · privacy, security & trust: split, single-column check list + emergency callout
  const pv = p.privacy;
  const privacy = sec(
    "ogs-privacy",
    `<div class="ogs-split">
      ${head("ogs-privacy", pv.label, pv.title, pv.lead)}
      <div>${checkList(pv.points, "ogs-checks--2")}</div>
    </div>`,
    { cls: "ogs-sec--rule" }
  );

  // I · using ONGIL / app guide: a real four-step sequence
  const ap = p.app;
  const app = sec(
    "ogs-app",
    `${head("ogs-app", ap.label, ap.title, ap.lead, { split: true })}
      ${steps(ap.steps, ["form", "phone", "type", "route"], 4)}`,
    { tone: "mist" }
  );

  // J · FAQ (native disclosure, keyboard-operable, no script)
  const faq = sec(
    "ogs-faq",
    `<div class="ogs-split">
      ${head("ogs-faq", "FAQ", c.ui.faqTitle, "")}
      <div class="ogs-faq">${p.faq.map((f) => `<details><summary>${e(f.q)}</summary><p>${e(f.a)}</p></details>`).join("")}</div>
    </div>`
  );

  const close = closeInk(
    c,
    lang,
    [
      [c.ui.toBusiness, pagePath(lang, "business")],
      [c.ui.toPartnerships, pagePath(lang, "partnerships")],
      [c.ui.inquiry, pagePath(lang, "contact")],
    ],
    p
  );
  return [index, status, groups, features, later, scenarios, roles, systems, privacy, app, faq, close].filter(Boolean).join("\n");
}

/* ───────── 03 Business ───────── */

function groupSpec(c, g) {
  return `<dl class="ogs-specgrid">
          <div><dt>${e(c.ui.audience)}</dt><dd>${e(g.audience)}</dd></div>
          <div><dt>${e(c.ui.value)}</dt><dd>${e(g.value)}</dd></div>
          <div><dt>${e(c.ui.partners)}</dt><dd>${e(g.partners)}</dd></div>
          <div><dt>${e(c.ui.revenue)}</dt><dd>${e(g.revenue)}</dd></div>
          <div class="ogs-specgrid__wide"><dt>${e(c.ui.regulation)}</dt><dd>${e(g.regulation)}</dd></div>
        </dl>`;
}

function businessMain(c, S, lang) {
  const b = c.business;
  const byCat = Object.fromEntries(b.categories.map((k) => [k.id, []]));
  b.groups.forEach((g, i) => byCat[g.cat].push(i));

  // A · category directory (8 categories → 20 numbered business groups) + the one shared notice
  const catBoard = b.categories
    .map(
      (k) => `<li class="ogs-dir__g">
        <div class="ogs-dir__h">${tile(CATEGORY_ICONS[k.id])}<div><strong lang="en"><a href="#bc-${e(k.id)}">${e(k.en)}</a></strong>${c.lang === "ko" ? `<span>${e(k.ko)}</span>` : ""}</div><b class="ogs-dir__count">${byCat[k.id].length}</b></div>
        <ol>${byCat[k.id].map((i) => `<li><a href="#b-${pad(i + 1)}"><span class="ogs-dir__n">${pad(i + 1)}</span><span class="ogs-dir__x"><strong>${e(b.groups[i].name)}</strong></span></a></li>`).join("")}</ol>
      </li>`
    )
    .join("");
  const index = sec(
    "ogs-index",
    `${head("ogs-index", `${c.ui.category} · ${b.categories.length} / ${b.groups.length}`, b.indexTitle, b.indexLead, { split: true })}
      <ol class="ogs-dir ogs-dir--4">${catBoard}</ol>
      ${notice(c)}`
  );

  // B · now vs proposed: a large statement (no paid product today) beside the 12 proposed models
  const revenue = sec(
    "ogs-revenue",
    `<div class="ogs-split ogs-split--even">
      <div>
        ${head("ogs-revenue", b.revenueKicker, b.revenueTitle, b.models, { wide: true })}
        ${note(b.disclaimer)}
      </div>
      <div class="ogs-panel">
        <ul class="ogs-dots">${b.revenue.map((r) => `<li>${e(r)}</li>`).join("")}</ul>
        ${note(b.revenueNote, true)}
      </div>
    </div>`,
    { tone: "tint" }
  );

  // C · customers and payers: a clean table (segment · who · how they use it · proposed payment)
  const cu = b.customers;
  const customers = sec(
    "ogs-customers",
    `${head("ogs-customers", cu.label, cu.title, cu.lead, { split: true })}
      ${table(
        "ogs-table--pay",
        ["", cu.useLabel, cu.payLabel],
        cu.items.map((it) => ({ head: `<span class="ogs-pill" lang="en">${e(it.k)}</span><strong>${e(it.name)}</strong>`, cells: [e(it.use), e(it.pay)] }))
      )}`
  );

  // D · market problems → opportunity hypotheses: paired cards on mist
  const mk = b.market;
  const market = sec(
    "ogs-market",
    `${head("ogs-market", mk.label, mk.title, mk.lead, { split: true })}
      <ul class="ogs-duo">${mk.items
        .map(
          (it, i) => `<li>${tile(["info", "users", "clipboard", "link"][i % 4])}
          <div class="ogs-duo__q">${tag(mk.problemLabel)}<p>${e(it.problem)}</p></div>
          <div class="ogs-duo__a">${tag(mk.chanceLabel, true)}<p>${e(it.chance)}</p></div></li>`
        )
        .join("")}</ul>
      ${note(mk.note)}`,
    { tone: "mist" }
  );

  // E · one section per category: category column on the left, its business groups (with spec grid) on the right
  const cats = b.categories
    .map((k, ci) => {
      const ids = byCat[k.id];
      const title = c.lang === "ko" ? k.ko : k.en;
      const kicker = `${pad(ci + 1)} · ${k.en} · ${ids.length}`;
      const body = ids
        .map((i) => {
          const g = b.groups[i];
          return `<article class="ogs-card" id="b-${pad(i + 1)}" aria-labelledby="b-${pad(i + 1)}-t">
          ${tag(k.en, true, pad(i + 1))}<h3 id="b-${pad(i + 1)}-t">${e(g.name)}</h3><p class="ogs-card__desc">${e(g.intro)}</p>
          ${groupSpec(c, g)}${footLinks(ctaLink(c, lang, g.cta), backLink(c))}
        </article>`;
        })
        .join("");
      return sec(
        `bc-${k.id}`,
        `<div class="ogs-cat">
        <div class="ogs-cat__side">${tile(CATEGORY_ICONS[k.id], "lg")}${head(`bc-${k.id}`, kicker, title, "")}</div>
        <div class="ogs-cat__list${ids.length > 1 ? " ogs-cat__list--multi" : ""}">${body}</div>
      </div>`,
        { tone: ci % 2 ? "mist" : "", cls: "ogs-sec--cat" }
      );
    })
    .join("\n");

  // F · fee principles: where fees are considered (left) and where never (right)
  const fe = b.fees;
  const feeItem = (p) => `<li>${mark(p.alert ? "alert" : "check")}<div><strong>${e(p.t)}</strong><p>${e(p.text)}</p></div></li>`;
  const fees = sec(
    "ogs-fees",
    `${head("ogs-fees", fe.label, fe.title, fe.lead, { split: true })}
      <div class="ogs-fees">
        <ul class="ogs-fees__col">${fe.points.filter((p) => !p.alert).map(feeItem).join("")}</ul>
        <ul class="ogs-fees__col ogs-fees__col--never">${fe.points.filter((p) => p.alert).map(feeItem).join("")}</ul>
      </div>`,
    { tone: "tint" }
  );

  // G · go-to-market: real four-step sequence
  const gt = b.gtm;
  const gtm = sec(
    "ogs-gtm",
    `${head("ogs-gtm", gt.label, gt.title, gt.lead, { split: true })}
      ${steps(gt.steps, ["sun", "users", "link", "building"], 4)}
      ${note(gt.note)}`
  );

  // H · growth roadmap: five priorities as an editorial vertical list
  const roadmap = sec(
    "ogs-roadmap",
    `<div class="ogs-split">
      ${head("ogs-roadmap", b.roadmapKicker, b.roadmapTitle, b.roadmapLead)}
      <ol class="ogs-vlist">${b.roadmap.map((s) => `<li><span class="ogs-vlist__n">${e(s.n)}</span><div><h3>${e(s.name)}</h3><p>${e(s.text)}</p></div></li>`).join("")}</ol>
    </div>`,
    { tone: "mist" }
  );

  // I · operating & legal principles: three-column text grid
  const lg = b.legal;
  const legal = sec(
    "ogs-legal",
    `${head("ogs-legal", lg.label, lg.title, lg.lead, { split: true })}
      <ul class="ogs-grid3">${lg.points.map((r) => `<li><strong>${e(r.t)}</strong><p>${e(r.text)}</p></li>`).join("")}</ul>`
  );

  const close = closeInk(
    c,
    lang,
    [
      [c.ui.toPartnerships, pagePath(lang, "partnerships")],
      [c.ui.inquiry, pagePath(lang, "contact")],
    ],
    b
  );
  return [index, revenue, customers, market, cats, fees, gtm, roadmap, legal, close].join("\n");
}

/* ───────── 04 Partnerships ───────── */

function partnershipsMain(c, S, lang) {
  const p = c.partnerships;

  // A · partnership vision: statement + facts + the one shared notice
  const vision = sec("ogs-intro", introBlock(c, p.vision));

  // B · the 14 types grouped by their six opportunity areas (pill links)
  const opps = [];
  p.items.forEach((it, i) => {
    let g = opps.find((o) => o.opp === it.opp);
    if (!g) opps.push((g = { opp: it.opp, list: [] }));
    g.list.push(i);
  });
  const index = sec(
    "ogs-index",
    `${head("ogs-index", `${c.ui.onThisPage} · ${p.items.length}`, c.ui.partnerIndexTitle, p.indexLead, { split: true })}
      <ul class="ogs-opps">${opps
        .map(
          (g) => `<li><p class="ogs-opps__t" lang="en">${e(g.opp)}</p><ul class="ogs-cloud">${g.list
            .map((i) => `<li><a href="#pt-${pad(i + 1)}"><span>${pad(i + 1)}</span>${e(p.items[i].name)}</a></li>`)
            .join("")}</ul></li>`
        )
        .join("")}</ul>`,
    { tone: "mist" }
  );

  // C · partner type cards (collaboration model per type)
  const items = sec(
    "ogs-partner-types",
    `${head("ogs-partner-types", "Partner Types", c.ui.partnerTypesTitle, "")}
      <div class="ogs-cards ogs-cards--2 ogs-cards--partners">${p.items
        .map(
          (it, i) => `<article class="ogs-card" id="pt-${pad(i + 1)}" aria-labelledby="pt-${pad(i + 1)}-t">
          <div class="ogs-card__top">${tile(PARTNER_ICONS[i % PARTNER_ICONS.length])}${tag(it.opp, true, pad(i + 1))}</div>
          <h3 id="pt-${pad(i + 1)}-t">${e(it.name)}</h3>
          <dl class="ogs-stackdl">
            <div><dt>${e(c.ui.field)}</dt><dd>${e(it.field)}</dd></div>
            <div><dt>${e(c.ui.value)}</dt><dd>${e(it.value)}</dd></div>
            <div><dt>${e(c.ui.structure)}</dt><dd>${e(it.structure)}</dd></div>
            <div><dt>${e(c.ui.conditions)}</dt><dd>${e(it.conditions)}</dd></div>
          </dl>
          ${footLinks(`<a class="ogs-link" href="${pagePath(lang, "contact")}#ogs-types">${e(c.ui.propose)} →</a>`, backLink(c))}
        </article>`
        )
        .join("")}</div>`
  );

  // D · PoC & pilot proposals: wide rows with a 2×2 spec grid
  const pc = p.pocs;
  const pocs = sec(
    "ogs-pocs",
    `${head("ogs-pocs", pc.label, pc.title, pc.lead, { split: true })}
      <div class="ogs-rows ogs-rows--poc">${pc.items
        .map(
          (it) => `<article class="ogs-row">
          <div class="ogs-row__head">${tag("PoC", true)}<h3>${e(it.name)}</h3><p>${e(it.partner)}</p></div>
          <div class="ogs-row__body"><dl class="ogs-specgrid ogs-specgrid--2">
            <div><dt>${e(pc.goalLabel)}</dt><dd>${e(it.goal)}</dd></div>
            <div><dt>${e(pc.scopeLabel)}</dt><dd>${e(it.scope)}</dd></div>
            <div><dt>${e(pc.metricLabel)}</dt><dd>${e(it.metric)}</dd></div>
            <div><dt>${e(pc.needLabel)}</dt><dd>${e(it.need)}</dd></div>
          </dl></div>
        </article>`
        )
        .join("")}</div>`,
    { tone: "tint" }
  );

  // E · data & API possibilities: split with a check list
  const da = p.data;
  const data = sec(
    "ogs-data",
    `<div class="ogs-split">
      ${head("ogs-data", da.label, da.title, da.lead)}
      <div>${checkList(da.points, "ogs-checks--boxed")}</div>
    </div>`
  );

  // F · joint services & campaigns: four open columns on mist
  const ca = p.campaigns;
  const campaigns = sec(
    "ogs-campaigns",
    `${head("ogs-campaigns", ca.label, ca.title, ca.lead, { split: true })}
      <ul class="ogs-cols4">${ca.items.map((s, i) => `<li>${tile(["phone", "shield", "route", "heart"][i % 4], "lg")}<h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`).join("")}</ul>`,
    { tone: "mist" }
  );

  // G · process (real five-step sequence) + principles + note
  const process = sec(
    "ogs-process",
    `${head("ogs-process", "Process", p.processTitle, "")}
      ${steps(p.process, PROCESS_ICONS, 5)}
      <div class="ogs-principles"><p class="ogs-dt">${e(c.ui.principlesTitle)}</p>${ticks(p.principles, "ogs-ticks--pills")}</div>
      ${note(p.note)}`
  );

  // H · expected value: 2×2 large-text items
  const va = p.valueBlock;
  const value = sec(
    "ogs-value",
    `${head("ogs-value", va.label, va.title, "", { split: true })}
      <ul class="ogs-quad">${va.items
        .map((s, i) => `<li>${tile(["building", "landmark", "briefcase", "heart"][i % 4])}<div><h3>${e(s.name)}</h3><p>${e(s.text)}</p></div></li>`)
        .join("")}</ul>`,
    { cls: "ogs-sec--rule" }
  );

  const close = closeInk(
    c,
    lang,
    [
      [c.ui.partnerInquiry, `${pagePath(lang, "contact")}#ogs-types`],
      [c.ui.toBusiness, pagePath(lang, "business")],
    ],
    p
  );
  return [vision, index, items, pocs, data, campaigns, process, value, close].join("\n");
}

/* ───────── 05 Contact ───────── */

function contactMain(c, S, lang) {
  const k = c.contact;
  const formHref = (topic) =>
    `/${lang}/business/inquiry/?service=partnership&source=${encodeURIComponent(`/${lang}/ongil/contact/`)}&topic=${encodeURIComponent(`ONGIL - ${topic}`)}`;
  const mailHref = (topic) => `mailto:${k.email}?subject=${encodeURIComponent(`[ONGIL] ${topic}`)}`;

  // A · two large channel panels (email on apricot wash, form on white)
  const channels = sec(
    "ogs-channels",
    `${head("ogs-channels", "Channels", k.channelsTitle, "")}
      <ul class="ogs-channels">${k.channels
        .map((ch) => {
          const href = ch.href ? `/${lang}/${ch.href.replace("source=/ongil/", `source=/${lang}/ongil/`)}` : `mailto:${ch.v}`;
          return `<li>${tile(ch.href ? "form" : "mail", "lg")}<p class="ogs-channels__k">${e(ch.k)}</p><a class="ogs-channels__v" href="${e(href)}">${e(ch.v)}${ch.href ? " →" : ""}</a><p class="ogs-channels__t">${e(ch.text)}</p></li>`;
        })
        .join("")}</ul>`
  );

  // B · inquiry types grouped by audience; each a row with its channel and a large action link
  let n = 0;
  const groups = k.groups
    .map((g) => {
      const list = k.types.filter((t) => t.grp === g.id);
      return `<div class="ogs-tgroup">
        <div class="ogs-tgroup__h"><p class="ogs-tgroup__t">${e(c.lang === "ko" ? g.ko : g.en)}</p>${c.lang === "ko" ? `<p class="ogs-tgroup__en" lang="en">${e(g.en)}</p>` : ""}</div>
        <ol class="ogs-tlist">${list
          .map((t) => {
            n++;
            const mail = t.channel === "mail";
            return `<li id="c-${pad(n)}">
          <div class="ogs-tlist__x"><h3>${e(t.name)}</h3><p>${e(t.text)}</p></div>
          <a class="ogs-tlist__go" href="${e(mail ? mailHref(t.name) : formHref(t.name))}"><span class="ogs-tlist__ch" lang="en">${icon(mail ? "mail" : "form")}${mail ? "Email" : "Form"}</span><span>${e(mail ? k.mailCta : k.formCta)} →</span></a>
        </li>`;
          })
          .join("")}</ol>
      </div>`;
    })
    .join("\n");
  const types = sec(
    "ogs-types",
    `${head("ogs-types", `Inquiry Types · ${k.types.length}`, c.ui.typesTitle, k.typesLead, { split: true })}
      ${groups}
      ${notice(c)}`,
    { tone: "tint" }
  );

  // C · before you get in touch: three callouts (emergency in red)
  const careTitle = c.lang === "ko" ? "문의 전에\n확인해 주세요." : "Before you\nget in touch.";
  const guard = sec(
    "ogs-guard",
    `${head("ogs-guard", "Privacy & Safety", careTitle, "", { split: true })}
      <ul class="ogs-guard">
        <li>${tile("form", "lg")}<p>${e(k.include)}</p></li>
        <li>${tile("lock", "lg")}<p>${e(k.privacy)}</p></li>
        <li class="ogs-guard__alert">${tile("alert", "lg")}<p><strong>${e(k.emergency)}</strong></p></li>
      </ul>`
  );

  // D · black close: Contact → the official inquiry form
  const close = closeInk(
    c,
    lang,
    [
      [k.formCta, formHref(c.lang === "ko" ? "일반 문의" : "General inquiry")],
      [k.mailCta, mailHref(c.lang === "ko" ? "문의" : "Inquiry")],
    ],
    k
  );

  return [channels, types, guard, close].join("\n");
}

const MAINS = { overview: overviewMain, platform: platformMain, business: businessMain, partnerships: partnershipsMain, contact: contactMain };

function heroFor(c, lang, page) {
  const u = c.ui;
  const map = {
    overview: { h: c.overview.hero, main: [`${u.toAbout} ↓`, "#ogs-intro"], sub: [`${u.toPlatform} →`, pagePath(lang, "platform")] },
    platform: { h: c.platform.hero, main: [u.heroCta.platform, "#ogs-index"], sub: [u.inquiry, pagePath(lang, "contact")] },
    business: { h: c.business.hero, main: [u.heroCta.business, "#ogs-index"], sub: [u.toPartnerships, pagePath(lang, "partnerships")] },
    partnerships: { h: c.partnerships.hero, main: [u.heroCta.partnerships, "#ogs-index"], sub: [u.propose, `${pagePath(lang, "contact")}#ogs-types`] },
    contact: { h: c.contact.hero, main: [u.heroCta.contact, "#ogs-types"], sub: [c.contact.mailCta, `mailto:${c.contact.email}?subject=${encodeURIComponent("[ONGIL]")}`] },
  }[page];
  return hero(c, map.h, { main: map.main, sub: map.sub, compact: page !== "overview" });
}

export function renderMain(lang, page) {
  const { c } = CONTENT[lang];
  return `<section id="lifestage-detail" class="nls ogs" data-story="ongil" data-ogs-page="${page}" lang="${lang}" aria-labelledby="ogs-hero-title">
  ${heroFor(c, lang, page)}
  ${renderFlagshipSubnav({ biz: "ongil", lang, active: page })}
  <div class="nls__wrap">
  ${MAINS[page](c, null, lang)}
  </div>
  ${notesFoot(c)}
</section>`;
}

function hreflangSub(page) {
  const p = page === "overview" ? "ongil" : `ongil/${page}`;
  if (page === "overview") return hreflangBlock("ongil");
  return [
    `    <link rel="alternate" hreflang="ko" href="${SITE_ORIGIN}/ko/${p}/" />`,
    `    <link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/en/${p}/" />`,
    `    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/${p}/" />`,
  ].join("\n");
}

function renderPage(lang, page) {
  const L = LANGS.find((l) => l.dir === lang);
  const en = loadJson("en.json");
  const loc = lang === "en" ? en : fillMissing(loadJson(L.file), en);
  const flat = flatten(loc);
  const flatEn = flatten(en);
  const { c } = CONTENT[lang];
  const seo = c.seo[page];
  const depth = page === "overview" ? "../" : "../../";
  const header = renderStudioHeader(flat, flatEn, { activeNav: "ongil", base: depth });
  const footer = renderStudioFooter(flat, flatEn, { base: depth });
  const canonical = `${SITE_ORIGIN}${pagePath(lang, page)}`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: L.htmlLang,
    LANG_DIR: lang,
    FONT_LINKS: fontLinksHtml(lang),
    TITLE: e(seo.title),
    META_DESCRIPTION: e(clampSeoDescription(seo.description)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang] || "en_US",
    HREFLANG_BLOCK: hreflangSub(page),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: renderMain(lang, page),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=20261019rest1" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="${FLAGSHIP_SUBNAV_CSS}" />
    <link rel="stylesheet" href="/ongil-site.css?v=${OGS_VER}" />`,
    EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260924play2"></script>
    <script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
  });
  const out = page === "overview" ? path.join(ROOT, lang, "ongil", "index.html") : path.join(ROOT, lang, "ongil", page, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  return out;
}

function patchSitemap() {
  const file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return 0;
  let xml = fs.readFileSync(file, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  const extra = [];
  for (const lang of SITE_LANGS) {
    for (const page of PAGES.filter((p) => p !== "overview")) {
      const loc = `${SITE_ORIGIN}${pagePath(lang, page)}`;
      if (xml.includes(`<loc>${loc}</loc>`)) continue;
      extra.push(["  <url>", `    <loc>${loc}</loc>`, `    <lastmod>${today}</lastmod>`, "    <changefreq>monthly</changefreq>", "    <priority>0.6</priority>", "  </url>"].join("\n"));
    }
  }
  if (!extra.length) return 0;
  xml = xml.replace("</urlset>", `${extra.join("\n")}\n</urlset>\n`);
  fs.writeFileSync(file, xml);
  return extra.length;
}

/** Other languages: ONGIL sub-pages exist in KO/EN only, so /{lang}/ongil/{page}/ forwards to the English page
 *  (keeps the shared ONGIL menu working in every language; noindex, canonical = EN). */
function writeForwardStubs() {
  let n = 0;
  for (const L of LANGS) {
    if (SITE_LANGS.includes(L.dir)) continue;
    for (const page of PAGES.filter((pg) => pg !== "overview")) {
      const target = pagePath("en", page);
      const out = path.join(ROOT, L.dir, "ongil", page, "index.html");
      ensureDir(out);
      fs.writeFileSync(
        out,
        `<!doctype html>\n<html lang="${L.htmlLang}">\n<head>\n<meta charset="utf-8" />\n<meta name="robots" content="noindex" />\n<link rel="canonical" href="${SITE_ORIGIN}${target}" />\n<meta http-equiv="refresh" content="0;url=${target}" />\n<title>ONGIL</title>\n</head>\n<body><p><a href="${target}">ONGIL</a></p></body>\n</html>\n`
      );
      n++;
    }
  }
  return n;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const lang of SITE_LANGS) for (const page of PAGES) renderPage(lang, page);
  writeForwardStubs();
  const added = patchSitemap();
  console.log("render-ongil-site: OK", SITE_LANGS.join(","), PAGES.length, "pages each; sitemap +", added);
}
