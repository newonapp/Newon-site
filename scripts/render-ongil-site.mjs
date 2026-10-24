#!/usr/bin/env node
/**
 * ONGIL corporate website — five pages for KO and EN:
 *   /{ko,en}/ongil/               01 Overview      (replaces the earlier single ONGIL introduction for these two locales)
 *   /{ko,en}/ongil/platform/      02 Platform      (28 long-term areas in 6 groups; Life Box · Friends · Safe Band as own sections)
 *   /{ko,en}/ongil/business/      03 Business      (20 business groups in 8 categories + payers, fee principles, GTM, roadmap)
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
  roadArt,
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
export const OGS_VER = "20261024ogs4";
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

/* ───────── shared pieces ───────── */

/** Section heading in the Life Stage vocabulary (nls-head / nls-kicker / nls-title / nls-lead). */
function head(id, kicker, title, lead, n = "", ico = "") {
  return `<header class="nls-head">
      <p class="nls-kicker ogs-kicker">${ico ? `<span class="ogs-kicker__ico">${icon(ico)}</span>` : ""}${n ? `<span class="ogs-kicker__n">${e(n)}</span>` : ""}${e(kicker)}</p>
      <h2 class="nls-title" id="${id}-t">${nl(title)}</h2>
      ${lead ? `<p class="nls-lead">${e(lead)}</p>` : ""}
    </header>`;
}

/** One body section. tone: "" (white) · "tint" (apricot wash band) · "ink" (black band). */
function sec(id, inner, { tone = "", cls = "" } = {}) {
  const t = tone === "tint" ? " nls-block--band ogs-tint" : tone === "ink" ? " nls-block--ink ogs-ink" : "";
  return `<section id="${id}" class="nls-block ogs-sec${t}${cls ? " " + cls : ""}" data-hs-section aria-labelledby="${id}-t">
    ${inner}
  </section>`;
}

const note = (t, strong = false) => (t ? `<p class="nls-note ogs-note${strong ? " ogs-note--strong" : ""}">${e(t)}</p>` : "");
/** The one shared notice per page (replaces the per-card status badges). Same look as .ogs-note. */
const notice = (c) => `<p class="nls-note ogs-note ogs-notice">${e(c.notice)}</p>`;
/** Small apricot icon tile. */
const tile = (name, mod = "") => `<span class="ogs-tile${mod ? " ogs-tile--" + mod : ""}">${icon(name)}</span>`;

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

const chips = (items) => `<ul class="nls-chips ogs-chips">${(items || []).map((t) => `<li>${e(t)}</li>`).join("")}</ul>`;

/** Black closing band: road line art + centred title; the first action is the apricot CTA. */
function closeInk(c, lang, actions, x) {
  return sec(
    "ogs-close",
    `<div class="ogs-close">
      <p class="nls-kicker" lang="en">${e(x.closeKicker || c.ui.closeKicker)}</p>
      <h2 class="nls-hero__title" id="ogs-close-t">${x.closeTitleHtml}</h2>
      <p class="nls-lead">${e(x.closeLead)}</p>
      <div class="nls-actions">${actions
        .map(([label, href], i) => `<a class="nls-btn${i ? " nls-btn--ghost" : " ogs-btn--accent"}" href="${e(href)}">${e(label)}${i ? "" : " →"}</a>`)
        .join("")}</div>
    </div>`,
    { tone: "ink" }
  );
}

/* ───────── shared V4 pieces ───────── */

/** Area number (01–28) by area id: 25 regular areas + the 3 signature features. */
function areaIndex(c) {
  const map = {};
  c.platform.sections.forEach((s, i) => (map[s.id] = pad(i + 1)));
  c.platform.features.forEach((f) => (map[f.id] = f.n));
  return map;
}

/** Status board: four status groups (now / in development / planned / under review) instead of per-card badges.
 *  Reuses the 4-column .ogs-cats board. hrefFor(areaId) → link to the area. */
function statusBoard(c, hrefFor) {
  const st = c.status;
  const nums = areaIndex(c);
  return `<ol class="ogs-cats ogs-cats--status">${st.cols
    .map(
      (col, ci) => `<li><div class="ogs-cats__top">${tile(col.icon)}<span class="ogs-cats__n">${pad(ci + 1)}</span></div><p class="ogs-cats__en">${e(col.ko)}</p>${c.lang === "ko" ? `<p class="ogs-cats__ko" lang="en">${e(col.en)}</p>` : ""}
        <ul>${col.items.map((it) => `<li><a href="${e(hrefFor(it.a))}"><span>${e(nums[it.a] || "")}</span>${e(it.t)}</a></li>`).join("")}</ul></li>`
    )
    .join("")}</ol>
      ${note(st.basis)}`;
}

/** Wide rows with a heading column and a definition column (problem → solution, alternatives, customers). */
function dlRows(items, map) {
  return `<div class="ogs-rows">${items
    .map((it, i) => {
      const m = map(it, i);
      return `<article class="ogs-row">
          <div class="ogs-row__head">${m.label ? `<p class="ogs-label"><span class="ogs-label__n">${pad(i + 1)}</span><span>${e(m.label)}</span></p>` : ""}<h3>${e(m.title)}</h3>${m.text ? `<p>${e(m.text)}</p>` : ""}</div>
          <div class="ogs-row__body"><dl class="ogs-dl ogs-dl--rows">${m.rows.map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join("")}</dl></div>
        </article>`;
    })
    .join("")}</div>`;
}

/** Check list (trust / privacy / fee principles); items with alert get the alert mark. */
function checkList(points, cls = "ogs-checks--grid") {
  return `<ol class="ogs-checks ${cls}">${points
    .map(
      (p, i) => `<li${p.alert ? ' class="ogs-checks__alert"' : ""}><span class="ogs-checks__mark">${icon(p.alert ? "alert" : "check")}</span><div><span class="ogs-checks__n">${pad(i + 1)}</span><p><strong>${e(p.t)}</strong> · ${e(p.text)}</p></div></li>`
    )
    .join("")}</ol>`;
}

/** Numbered stepper cards (.ogs-proc); n = 3, 4 or 5 columns. */
function procList(steps, icons, n) {
  return `<ol class="ogs-proc ogs-proc--${n}">${steps
    .map((s, i) => `<li><div class="ogs-proc__top"><span class="ogs-proc__n">${e(s.n)}</span>${tile(icons[i % icons.length], "round")}</div><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`)
    .join("")}</ol>`;
}

/** Intro statement + facts panel (Overview A, Partnerships A). */
function introBlock(c, ab, withNotice) {
  return `<div class="ogs-intro">
      <div class="ogs-intro__text">
        <p class="nls-kicker ogs-kicker" lang="en">${e(ab.kicker)}</p>
        <p class="ogs-intro__statement" id="ogs-intro-t">${e(ab.statement)}</p>
        <p class="nls-lead">${e(ab.lead)}</p>
      </div>
      <div class="ogs-panel">
        <dl class="ogs-facts">${ab.facts.map((f, i) => `<div>${tile(FACT_ICONS[i % FACT_ICONS.length])}<dt>${e(f.k)}</dt><dd>${e(f.v)}</dd></div>`).join("")}</dl>
      </div>
    </div>
    ${withNotice ? notice(c) : ""}`;
}

/* ───────── 01 Overview ───────── */

function overviewMain(c, S, lang) {
  const o = c.overview;
  const plat = (id) => `${pagePath(lang, "platform")}#p-${id}`;

  // A · definition statement + facts panel, then the page's one shared notice
  const intro = sec("ogs-intro", introBlock(c, o.about, true));

  // B · problem → solution rows (tinted band)
  const pr = o.problems;
  const problems = sec(
    "ogs-problems",
    `${head("ogs-problems", pr.label, pr.title, pr.lead, pr.n)}
      ${dlRows(pr.items, (it) => ({ label: "Problem", title: it.problem, text: it.text, rows: [[pr.solutionLabel, it.how]] }))}`,
    { tone: "tint", cls: "ogs-sec--rows" }
  );

  // C · core values (open icon columns)
  const mission = sec(
    "ogs-vision",
    `${head("ogs-vision", o.mission.label, o.mission.title, o.mission.lead, o.mission.n)}
      <ol class="ogs-values">${o.mission.values
        .map(
          (v, i) => `<li><div class="ogs-values__top">${tile(VALUE_ICONS[i % VALUE_ICONS.length], "round")}<span class="ogs-values__n">${pad(i + 1)}</span></div><p class="ogs-values__en" lang="en">${e(v.en)}</p>${c.lang === "ko" ? `<p class="ogs-values__ko">${e(v.ko)}</p>` : ""}<p class="ogs-values__t">${e(v.text)}</p></li>`
        )
        .join("")}</ol>`
  );

  // D · 28 areas at a glance: six group tiles on the apricot wash band
  const journey = sec(
    "ogs-support",
    `${head("ogs-support", o.journey.label, o.journey.title, o.journey.lead, o.journey.n)}
      <ol class="ogs-signal ogs-signal--6">${o.journey.items
        .map(
          (s, i) => `<li><div class="ogs-signal__top">${tile(JOURNEY_ICONS[i % JOURNEY_ICONS.length])}<span class="ogs-signal__n">${e(s.n)}</span></div><div><p class="ogs-label"><span lang="en">${e(s.en)}</span></p>${c.lang === "ko" ? `<h3>${e(s.name)}</h3>` : ""}<p>${e(s.text)}</p></div></li>`
        )
        .join("")}</ol>
      <div class="ogs-foot-links"><a class="ogs-link" href="${pagePath(lang, "platform")}#ogs-index">${e(c.ui.toPlatform)} →</a></div>`,
    { tone: "tint" }
  );

  // E · use cases: numbered stepper
  const core = sec(
    "ogs-journey",
    `${head("ogs-journey", o.core.label, o.core.title, o.core.lead, o.core.n)}
      <ol class="ogs-timeline">${o.core.steps
        .map((s, i) => `<li><span class="ogs-timeline__dot" aria-hidden="true">${icon(CORE_ICONS[i % CORE_ICONS.length])}</span><span class="ogs-timeline__n">${e(s.n)}</span><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`)
        .join("")}</ol>`
  );

  // F · core users: split heading + role cards (consent card highlighted)
  const people = sec(
    "ogs-who",
    `<div class="nls-split">
      ${head("ogs-who", o.people.label, o.people.title, o.people.lead, o.people.n)}
      <ol class="ogs-roles">${o.people.items
        .map((s, i) => `<li${i === o.people.items.length - 1 ? ' class="ogs-roles__key"' : ""}>${tile(PEOPLE_ICONS[i % PEOPLE_ICONS.length])}<div><span class="ogs-roles__n">${e(s.n)}</span><strong>${e(s.name)}</strong><p>${e(s.text)}</p></div></li>`)
        .join("")}</ol>
    </div>`,
    { tone: "tint" }
  );

  // G · differentiation vs existing alternatives
  const cp = o.compare;
  const compare = sec(
    "ogs-compare",
    `${head("ogs-compare", cp.label, cp.title, cp.lead, cp.n)}
      ${dlRows(cp.items, (it) => ({ label: cp.altLabel, title: it.alt, text: it.text, rows: [[cp.diffLabel, it.diff]] }))}`,
    { cls: "ogs-sec--rows ogs-sec--rule" }
  );

  // H · current service status (grouped; no per-card badges)
  const status = sec(
    "ogs-status",
    `${head("ogs-status", c.status.label, c.status.title, c.status.lead, "08")}
      ${statusBoard(c, plat)}`,
    { tone: "tint" }
  );

  // I · long-term vision: widening layer stack
  const beyond = sec(
    "ogs-ecosystem",
    `${head("ogs-ecosystem", o.beyond.label, o.beyond.title, o.beyond.lead, o.beyond.n)}
      <ol class="ogs-layers">${o.beyond.layers
        .map((s, i) => `<li style="--ogs-w:${40 + i * 20}%"><span class="ogs-layers__n">${e(s.n)}</span>${tile(LAYER_ICONS[i % LAYER_ICONS.length], "round")}<h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`)
        .join("")}</ol>
      ${note(o.beyond.note)}`
  );

  // J · trust & responsibility
  const trust = sec(
    "ogs-family",
    `<div class="nls-split ogs-split--wide">
      ${head("ogs-family", o.trust.label, o.trust.title, o.trust.lead, o.trust.n)}
      ${checkList(o.trust.points)}
    </div>`
  );

  // K · related Newon platforms
  const newon = sec(
    "ogs-newon",
    `${head("ogs-newon", o.newon.label, o.newon.title, o.newon.lead, o.newon.n)}
      <ol class="ogs-linkrows">${o.newon.items
        .map((s) => `<li><a href="${rel(lang, s.href)}"><span class="ogs-linkrows__n">${e(s.n)}</span><strong lang="en">${e(s.name)}</strong><span class="ogs-linkrows__t">${e(s.text)}</span><span class="ogs-linkrows__arrow" aria-hidden="true">${icon("arrow")}</span></a></li>`)
        .join("")}</ol>`
  );

  // L · black close with three next steps
  const next = sec(
    "ogs-next",
    `
      ${head("ogs-next", o.next.label, o.next.title, "", o.next.n)}
      <ol class="ogs-next">${o.next.items
        .map(
          (s, i) => `<li>${tile(NEXT_ICONS[i % NEXT_ICONS.length], "ink")}<span class="ogs-next__n">${pad(i + 1)}</span><p class="ogs-next__k">${e(s.k)}</p><p>${e(s.text)}</p><a class="nls-btn${i ? " nls-btn--ghost" : " ogs-btn--accent"}" href="${rel(lang, s.href)}">${e(s.cta)} →</a></li>`
        )
        .join("")}</ol>`,
    { tone: "ink" }
  );

  return [intro, problems, mission, journey, core, people, compare, status, beyond, trust, newon, next].join("\n");
}

/* ───────── 02 Platform ───────── */

function areaBody(c, S, lang, s) {
  return `${chips(s.services)}
        <dl class="ogs-dl">
          <div><dt>${e(c.ui.audience)}</dt><dd>${e(s.audience)}</dd></div>
        </dl>
        ${note(s.note)}
        <div class="ogs-foot-links">${ctaLink(c, lang, s.cta)}${backLink(c)}</div>`;
}

/** One signature area (26 Life Box · 27 Friends · 28 Safe Band) as its own section. */
function featureSection(c, lang, f, i) {
  const id = `p-${f.id}`;
  return sec(
    id,
    `${head(id, `${f.kicker}`, f.title, f.lead, "", f.icon)}
      <div class="ogs-cards ogs-cards--2 ogs-cards--feature">
        <article class="ogs-card">
          <div class="ogs-card__top">${tile(f.icon)}<p class="ogs-label"><span class="ogs-label__n">${e(f.n)}</span><span lang="en">${e(f.label)}</span></p></div>
          <h3>${e(f.listTitle)}</h3>
          <dl class="ogs-dl ogs-dl--rows">${f.list.map((it) => `<div><dt>${e(it.t)}</dt><dd>${e(it.text)}</dd></div>`).join("")}</dl>
        </article>
        <article class="ogs-card">
          <div class="ogs-card__top">${tile("shield")}<p class="ogs-label"><span lang="en">${e(f.label)}</span></p></div>
          <h3>${e(f.moreTitle)}</h3>
          <ul class="nls-chips ogs-chips ogs-chips--check">${f.more.map((t) => `<li>${icon("check")}${e(t)}</li>`).join("")}</ul>
          ${note(f.note)}
          <div class="ogs-foot-links">${ctaLink(c, lang, "partners")}${backLink(c)}</div>
        </article>
      </div>
      ${procList(f.steps, ["spark", "link", "star"], 3)}`,
    { tone: i % 2 === 0 ? "tint" : "" }
  );
}

function platformMain(c, S, lang) {
  const p = c.platform;
  const all = [...p.sections.map((s, i) => ({ ...s, n: pad(i + 1) })), ...p.features.map((f) => ({ id: f.id, grp: "F", n: f.n, title: f.title.split("\n")[1] || f.title, label: f.label }))];
  // Groups A–F: a map of group tiles (letter badge, name, area numbers, count).
  const groupRows = p.groupMap
    .map((g) => {
      const nums = all.filter((s) => s.grp === g.id).map((s) => s.n);
      return `<li><span class="ogs-legend__badge" lang="en">${e(g.id)}</span><strong lang="en">${e(g.en)}</strong><span class="ogs-legend__note">${c.lang === "ko" ? `${e(g.ko)} · ` : ""}${nums.join(" · ")}</span><b class="ogs-legend__count">${nums.length}</b></li>`;
    })
    .join("");
  const groupMap = `<div class="ogs-legend"><p class="ogs-legend__t">${e(c.ui.groupMapTitle)}</p><ul>${groupRows}</ul></div>`;
  const idx = all
    .map((s) => `<li><a href="#p-${e(s.id)}"><span>${e(s.n)}</span><strong>${e(s.title)}</strong><em lang="en">${e(s.label.replace(/^\d\d /, ""))}</em></a></li>`)
    .join("");

  // A · split: heading + notice + group map | 2-col numbered index of all 28 areas
  const index = sec(
    "ogs-index",
    `<div class="nls-split ogs-split--index">
      <div>
        ${head("ogs-index", `${c.ui.onThisPage} · 28`, p.indexTitle, p.indexLead)}
        ${notice(c)}
        ${groupMap}
      </div>
      <ol class="ogs-index">${idx}</ol>
    </div>`
  );

  // B · current offer vs development plan (status groups)
  const status = sec(
    "ogs-status",
    `${head("ogs-status", c.status.label, c.status.title, c.status.lead)}
      ${statusBoard(c, (id) => `#p-${id}`)}`,
    { tone: "tint" }
  );

  // C · groups A–E, rotating layouts: wide icon rows · 2-col cards on wash · 3-col cards with apricot rule
  const layouts = ["rows", "cards2", "cards3", "rows", "cards2"];
  const groups = p.groups
    .map((g, gi) => {
      const items = p.sections.slice(g.from, g.to);
      const layout = layouts[gi % layouts.length];
      const label = (s, i) => `<p class="ogs-label"><span class="ogs-label__n">${pad(g.from + i + 1)}</span><span lang="en">${e(s.label.replace(/^\d\d /, ""))}</span></p>`;
      let body;
      if (layout === "rows") {
        body = `<div class="ogs-rows">${items
          .map(
            (s, i) => `<article class="ogs-row" id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
          <div class="ogs-row__head">${tile(AREA_ICONS[s.id])}${label(s, i)}<h3 id="p-${e(s.id)}-t">${e(s.title)}</h3><p>${e(s.desc)}</p></div>
          <div class="ogs-row__body"><p class="ogs-dt">${e(c.ui.services)}</p>${areaBody(c, S, lang, s)}</div>
        </article>`
          )
          .join("")}</div>`;
      } else {
        const n = layout === "cards2" ? "2" : items.length === 4 ? "2" : "3";
        body = `<div class="ogs-cards ogs-cards--${n}">${items
          .map(
            (s, i) => `<article class="ogs-card" id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
          <div class="ogs-card__top">${tile(AREA_ICONS[s.id])}${label(s, i)}</div><h3 id="p-${e(s.id)}-t">${e(s.title)}</h3><p class="ogs-card__desc">${e(s.desc)}</p>
          ${areaBody(c, S, lang, s)}
        </article>`
          )
          .join("")}</div>`;
      }
      return sec(`ogs-area-${gi + 1}`, `${head(`ogs-area-${gi + 1}`, g.kicker, g.title, g.lead)}${body}`, {
        tone: layout === "cards2" ? "tint" : "",
        cls: layout === "cards3" ? "ogs-sec--rule" : "",
      });
    })
    .join("\n");

  // D · the three signature areas, each its own section
  const features = p.features.map((f, i) => featureSection(c, lang, f, i)).join("\n");

  // E · user scenarios: 2-col cards with "now / later"
  const sc = p.scenarios;
  const scenarios = sec(
    "ogs-scenarios",
    `${head("ogs-scenarios", sc.label, sc.title, sc.lead)}
      <div class="ogs-cards ogs-cards--2">${sc.items
        .map(
          (it, i) => `<article class="ogs-card">
          <div class="ogs-card__top">${tile(["sun", "users", "chat", "clipboard"][i % 4])}<p class="ogs-label"><span class="ogs-label__n">${pad(i + 1)}</span><span>${e(it.who)}</span></p></div>
          <h3>${e(it.title)}</h3><p class="ogs-card__desc">${e(it.text)}</p>
          <dl class="ogs-dl ogs-dl--rows"><div><dt>${e(sc.nowLabel)}</dt><dd>${e(it.now)}</dd></div><div><dt>${e(sc.laterLabel)}</dt><dd>${e(it.later)}</dd></div></dl>
        </article>`
        )
        .join("")}</div>`,
    { cls: "ogs-sec--rule" }
  );

  // F · by user type: split heading + role cards
  const ro = p.roles;
  const roles = sec(
    "ogs-roles",
    `<div class="nls-split">
      ${head("ogs-roles", ro.label, ro.title, ro.lead)}
      <ol class="ogs-roles">${ro.items
        .map((s, i) => `<li${i === ro.items.length - 1 ? ' class="ogs-roles__key"' : ""}>${tile(["person", "users", "hands", "building"][i % 4])}<div><span class="ogs-roles__n">${e(s.n)}</span><strong>${e(s.name)}</strong><p>${e(s.text)}</p></div></li>`)
        .join("")}</ol>
    </div>`,
    { tone: "tint" }
  );

  // G · how the areas connect: shared systems as a layer stack
  const sy = p.systems;
  const systems = sec(
    "ogs-systems",
    `${head("ogs-systems", sy.label, sy.title, sy.lead)}
      <ol class="ogs-layers">${sy.layers
        .map((s, i) => `<li style="--ogs-w:${36 + i * 16}%"><span class="ogs-layers__n">${e(s.n)}</span>${tile(["lock", "clipboard", "shield", "compass", "layers"][i % 5], "round")}<h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`)
        .join("")}</ol>`
  );

  // H · privacy, security & trust
  const pv = p.privacy;
  const privacy = sec(
    "ogs-privacy",
    `<div class="nls-split ogs-split--wide">
      ${head("ogs-privacy", pv.label, pv.title, pv.lead)}
      ${checkList(pv.points)}
    </div>`,
    { cls: "ogs-sec--rule" }
  );

  // I · using ONGIL / app guide: 4-step stepper
  const ap = p.app;
  const app = sec(
    "ogs-app",
    `${head("ogs-app", ap.label, ap.title, ap.lead)}
      ${procList(ap.steps, ["form", "phone", "type", "route"], 4)}`,
    { tone: "tint" }
  );

  // J · FAQ (native disclosure, no script)
  const faq = sec(
    "ogs-faq",
    `<div class="nls-split ogs-split--wide">
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
  return [index, status, groups, features, scenarios, roles, systems, privacy, app, faq, close].join("\n");
}

/* ───────── 03 Business ───────── */

function groupDl(c, S, g) {
  return `<dl class="ogs-dl ogs-dl--rows">
          <div><dt>${e(c.ui.audience)}</dt><dd>${e(g.audience)}</dd></div>
          <div><dt>${e(c.ui.value)}</dt><dd>${e(g.value)}</dd></div>
          <div><dt>${e(c.ui.partners)}</dt><dd>${e(g.partners)}</dd></div>
          <div><dt>${e(c.ui.revenue)}</dt><dd>${e(g.revenue)}</dd></div>
          <div><dt>${e(c.ui.regulation)}</dt><dd>${e(g.regulation)}</dd></div>
        </dl>`;
}

function businessMain(c, S, lang) {
  const b = c.business;
  const byCat = Object.fromEntries(b.categories.map((k) => [k.id, []]));
  b.groups.forEach((g, i) => byCat[g.cat].push(i));

  // A · 4-column category board (icon tiles) + the one shared notice
  const catBoard = b.categories
    .map(
      (k, ci) => `<li><div class="ogs-cats__top">${tile(CATEGORY_ICONS[k.id])}<span class="ogs-cats__n">${pad(ci + 1)}</span></div><p class="ogs-cats__en" lang="en"><a href="#bc-${e(k.id)}">${e(k.en)}</a></p>${c.lang === "ko" ? `<p class="ogs-cats__ko">${e(k.ko)}</p>` : ""}
        <ul>${byCat[k.id].map((i) => `<li><a href="#b-${pad(i + 1)}"><span>${pad(i + 1)}</span>${e(b.groups[i].name)}</a></li>`).join("")}</ul></li>`
    )
    .join("");
  const index = sec(
    "ogs-index",
    `${head("ogs-index", `${c.ui.category} · ${b.categories.length} / ${b.groups.length}`, b.indexTitle, b.indexLead)}
      <ol class="ogs-cats">${catBoard}</ol>
      ${notice(c)}`
  );

  // B · now vs proposed: no paid product today; 12 proposed revenue models with payer
  const revenue = sec(
    "ogs-revenue",
    `<div class="nls-split">
      <div>
        ${head("ogs-revenue", b.revenueKicker, b.revenueTitle, b.models)}
        ${note(b.disclaimer)}
      </div>
      <div>
        <ol class="ogs-rev">${b.revenue.map((r, i) => `<li><span>${pad(i + 1)}</span><p>${e(r)}</p></li>`).join("")}</ol>
        ${note(b.revenueNote)}
      </div>
    </div>`,
    { tone: "tint" }
  );

  // C · customers and payers (B2C / B2B / B2B2C / B2G)
  const cu = b.customers;
  const customers = sec(
    "ogs-customers",
    `${head("ogs-customers", cu.label, cu.title, cu.lead)}
      ${dlRows(cu.items, (it) => ({ label: it.k, title: it.name, text: "", rows: [[cu.useLabel, it.use], [cu.payLabel, it.pay]] }))}`,
    { cls: "ogs-sec--rows" }
  );

  // D · market problems and opportunity hypotheses (2-col cards on wash)
  const mk = b.market;
  const market = sec(
    "ogs-market",
    `${head("ogs-market", mk.label, mk.title, mk.lead)}
      <div class="ogs-cards ogs-cards--2">${mk.items
        .map(
          (it, i) => `<article class="ogs-card"><div class="ogs-card__top">${tile(["info", "users", "clipboard", "link"][i % 4])}<p class="ogs-label"><span class="ogs-label__n">${pad(i + 1)}</span></p></div>
          <dl class="ogs-dl ogs-dl--rows"><div><dt>${e(mk.problemLabel)}</dt><dd>${e(it.problem)}</dd></div><div><dt>${e(mk.chanceLabel)}</dt><dd>${e(it.chance)}</dd></div></dl></article>`
        )
        .join("")}</div>
      ${note(mk.note)}`,
    { tone: "tint" }
  );

  // E · one section per category, alternating card grid / wide rows
  let flip = 0;
  const cats = b.categories
    .map((k, ci) => {
      const ids = byCat[k.id];
      const rows = flip++ % 2 === 1;
      const label = (i) => `<p class="ogs-label"><span class="ogs-label__n">${pad(i + 1)}</span><span lang="en">${e(k.en)}</span></p>`;
      const foot = (g) => `<div class="ogs-foot-links">${ctaLink(c, lang, g.cta)}${backLink(c)}</div>`;
      const body = rows
        ? `<div class="ogs-rows">${ids
            .map((i) => {
              const g = b.groups[i];
              return `<article class="ogs-row" id="b-${pad(i + 1)}" aria-labelledby="b-${pad(i + 1)}-t">
          <div class="ogs-row__head">${label(i)}<h3 id="b-${pad(i + 1)}-t">${e(g.name)}</h3><p>${e(g.intro)}</p></div>
          <div class="ogs-row__body">${groupDl(c, S, g)}${foot(g)}</div>
        </article>`;
            })
            .join("")}</div>`
        : `<div class="ogs-cards ogs-cards--${ids.length === 3 ? "3" : ids.length === 1 ? "1" : "2"}">${ids
            .map((i) => {
              const g = b.groups[i];
              return `<article class="ogs-card" id="b-${pad(i + 1)}" aria-labelledby="b-${pad(i + 1)}-t">
          ${label(i)}<h3 id="b-${pad(i + 1)}-t">${e(g.name)}</h3><p class="ogs-card__desc">${e(g.intro)}</p>
          ${groupDl(c, S, g)}${foot(g)}
        </article>`;
            })
            .join("")}</div>`;
      const title = c.lang === "ko" ? k.ko : k.en;
      const kicker = `${pad(ci + 1)} · ${k.en} · ${ids.length}`;
      return sec(`bc-${k.id}`, `${head(`bc-${k.id}`, kicker, title, "", "", CATEGORY_ICONS[k.id])}${body}`, {
        tone: !rows && ci % 4 === 2 ? "tint" : "",
        cls: rows ? "ogs-sec--rows" : "",
      });
    })
    .join("\n");

  // F · fee principles (where fees are considered, where never)
  const fe = b.fees;
  const fees = sec(
    "ogs-fees",
    `<div class="nls-split ogs-split--wide">
      ${head("ogs-fees", fe.label, fe.title, fe.lead)}
      ${checkList(fe.points)}
    </div>`,
    { tone: "tint" }
  );

  // G · go-to-market: 4-step stepper
  const gt = b.gtm;
  const gtm = sec(
    "ogs-gtm",
    `${head("ogs-gtm", gt.label, gt.title, gt.lead)}
      ${procList(gt.steps, ["sun", "users", "link", "building"], 4)}
      ${note(gt.note)}`
  );

  // H · growth roadmap: numbered horizontal timeline (plan priorities 1–5)
  const roadmap = sec(
    "ogs-roadmap",
    `${head("ogs-roadmap", b.roadmapKicker, b.roadmapTitle, b.roadmapLead)}
      <ol class="ogs-timeline ogs-timeline--road">${b.roadmap
        .map((s) => `<li><span class="ogs-timeline__dot ogs-timeline__dot--n" aria-hidden="true">${e(s.n)}</span><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`)
        .join("")}</ol>`,
    { tone: "tint" }
  );

  // I · operating & legal principles: compact pills
  const lg = b.legal;
  const legal = sec(
    "ogs-legal",
    `${head("ogs-legal", lg.label, lg.title, lg.lead)}
      <ol class="ogs-rev ogs-rev--plain">${lg.points.map((r, i) => `<li><span>${pad(i + 1)}</span><p><strong>${e(r.t)}</strong> · ${e(r.text)}</p></li>`).join("")}</ol>`,
    { cls: "ogs-sec--rule" }
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

  // A · partnership vision: statement + facts panel + the one shared notice
  const vision = sec("ogs-intro", introBlock(c, p.vision, true));

  // B · tinted chip cloud of the 14 types
  const index = sec(
    "ogs-index",
    `${head("ogs-index", `${c.ui.onThisPage} · ${p.items.length}`, c.ui.partnerIndexTitle, p.indexLead)}
      <ol class="ogs-cloud">${p.items.map((it, i) => `<li><a href="#pt-${pad(i + 1)}"><span>${pad(i + 1)}</span>${e(it.name)}</a></li>`).join("")}</ol>`,
    { tone: "tint" }
  );

  // C · 2-column partner cards with icon tiles (collaboration model per type)
  const items = sec(
    "ogs-partner-types",
    `${head("ogs-partner-types", "Partner Types", c.ui.partnerTypesTitle, "")}
      <div class="ogs-cards ogs-cards--2 ogs-cards--partners">${p.items
        .map(
          (it, i) => `<article class="ogs-card" id="pt-${pad(i + 1)}" aria-labelledby="pt-${pad(i + 1)}-t">
          <div class="ogs-card__top">${tile(PARTNER_ICONS[i % PARTNER_ICONS.length])}<p class="ogs-label"><span class="ogs-label__n">${pad(i + 1)}</span><span lang="en">${e(it.opp)}</span></p></div>
          <h3 id="pt-${pad(i + 1)}-t">${e(it.name)}</h3>
          <dl class="ogs-dl ogs-dl--rows">
            <div><dt>${e(c.ui.field)}</dt><dd>${e(it.field)}</dd></div>
            <div><dt>${e(c.ui.value)}</dt><dd>${e(it.value)}</dd></div>
            <div><dt>${e(c.ui.structure)}</dt><dd>${e(it.structure)}</dd></div>
            <div><dt>${e(c.ui.conditions)}</dt><dd>${e(it.conditions)}</dd></div>
          </dl>
          <div class="ogs-foot-links"><a class="ogs-link" href="${pagePath(lang, "contact")}#ogs-types">${e(c.ui.propose)} →</a>${backLink(c)}</div>
        </article>`
        )
        .join("")}</div>`
  );

  // D · PoC & pilot proposals: wide rows
  const pc = p.pocs;
  const pocs = sec(
    "ogs-pocs",
    `${head("ogs-pocs", pc.label, pc.title, pc.lead)}
      ${dlRows(pc.items, (it) => ({ label: "PoC", title: it.name, text: it.partner, rows: [[pc.goalLabel, it.goal], [pc.scopeLabel, it.scope], [pc.metricLabel, it.metric], [pc.needLabel, it.need]] }))}`,
    { tone: "tint", cls: "ogs-sec--rows" }
  );

  // E · data & API possibilities
  const da = p.data;
  const data = sec(
    "ogs-data",
    `<div class="nls-split ogs-split--wide">
      ${head("ogs-data", da.label, da.title, da.lead)}
      ${checkList(da.points, "ogs-checks--cards")}
    </div>`
  );

  // F · joint services & campaigns: tiles on wash
  const ca = p.campaigns;
  const campaigns = sec(
    "ogs-campaigns",
    `${head("ogs-campaigns", ca.label, ca.title, ca.lead)}
      <ol class="ogs-signal">${ca.items
        .map((s, i) => `<li><div class="ogs-signal__top">${tile(["phone", "shield", "route", "heart"][i % 4])}<span class="ogs-signal__n">${pad(i + 1)}</span></div><div><h3>${e(s.name)}</h3><p>${e(s.text)}</p></div></li>`)
        .join("")}</ol>`,
    { tone: "tint" }
  );

  // G · process stepper + principles
  const process = sec(
    "ogs-process",
    `${head("ogs-process", "Process", p.processTitle, "")}
      ${procList(p.process, PROCESS_ICONS, 5)}
      <div class="ogs-note ogs-principles"><p class="ogs-dt">${e(c.ui.principlesTitle)}</p><ul class="nls-chips ogs-chips ogs-chips--check">${p.principles
        .map((t) => `<li>${icon("check")}${e(t)}</li>`)
        .join("")}</ul></div>
      ${note(p.note)}`
  );

  // H · expected value: role cards
  const va = p.valueBlock;
  const value = sec(
    "ogs-value",
    `<div class="nls-split">
      ${head("ogs-value", va.label, va.title, "")}
      <ol class="ogs-roles">${va.items
        .map((s, i) => `<li${i === va.items.length - 1 ? ' class="ogs-roles__key"' : ""}>${tile(["building", "landmark", "briefcase", "heart"][i % 4])}<div><span class="ogs-roles__n">${pad(i + 1)}</span><strong>${e(s.name)}</strong><p>${e(s.text)}</p></div></li>`)
        .join("")}</ol>
    </div>`,
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

  // A · two large channel panels (email = apricot wash, form = white)
  const channels = sec(
    "ogs-channels",
    `${head("ogs-channels", "Channels", k.channelsTitle, "")}
      <ul class="ogs-channels">${k.channels
        .map((ch, i) => {
          const href = ch.href ? `/${lang}/${ch.href.replace("source=/ongil/", `source=/${lang}/ongil/`)}` : `mailto:${ch.v}`;
          return `<li><div class="ogs-channels__top">${tile(ch.href ? "form" : "mail", "lg")}<span class="ogs-channels__n">${pad(i + 1)}</span></div><p class="ogs-channels__k">${e(ch.k)}</p><a class="ogs-channels__v" href="${e(href)}">${e(ch.v)}${ch.href ? " →" : ""}</a><p>${e(ch.text)}</p></li>`;
        })
        .join("")}</ul>`
  );

  // B · inquiry types grouped by audience (people · institutions · press/investors); channel shown as an icon chip
  let n = 0;
  const groups = k.groups
    .map((g) => {
      const list = k.types.filter((t) => t.grp === g.id);
      return `<p class="ogs-dt ogs-board__group">${e(c.lang === "ko" ? g.ko : g.en)}${c.lang === "ko" ? ` · <span lang="en">${e(g.en)}</span>` : ""}</p>
      <ol class="ogs-board">${list
        .map((t) => {
          n++;
          return `<li id="c-${pad(n)}">
          <div class="ogs-board__meta"><span>${pad(n)}</span><em lang="en">${icon(t.channel === "mail" ? "mail" : "form")}${t.channel === "mail" ? "Email" : "Form"}</em></div>
          <h3>${e(t.name)}</h3>
          <p>${e(t.text)}</p>
          <a class="ogs-link" href="${e(t.channel === "mail" ? mailHref(t.name) : formHref(t.name))}">${e(t.channel === "mail" ? k.mailCta : k.formCta)} →</a>
        </li>`;
        })
        .join("")}</ol>`;
    })
    .join("\n");
  const types = sec(
    "ogs-types",
    `${head("ogs-types", `Inquiry Types · ${k.types.length}`, c.ui.typesTitle, k.typesLead)}
      ${groups}
      ${notice(c)}`,
    { tone: "tint" }
  );

  // C · split: what to include, privacy & emergency as callout cards
  const careTitle = c.lang === "ko" ? "문의 전에\n확인해 주세요." : "Before you\nget in touch.";
  const guard = sec(
    "ogs-guard",
    `<div class="nls-split">
      ${head("ogs-guard", "Privacy & Safety", careTitle, "")}
      <ol class="ogs-checks ogs-checks--cards">
        <li><span class="ogs-checks__mark">${icon("form")}</span><div><span class="ogs-checks__n">01</span><p>${e(k.include)}</p></div></li>
        <li><span class="ogs-checks__mark">${icon("lock")}</span><div><span class="ogs-checks__n">02</span><p>${e(k.privacy)}</p></div></li>
        <li class="ogs-checks__alert"><span class="ogs-checks__mark">${icon("alert")}</span><div><span class="ogs-checks__n">03</span><p><strong>${e(k.emergency)}</strong></p></div></li>
      </ol>
    </div>`
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
    <link rel="stylesheet" href="/ongil-site.css?v=20261025ov1" />`,
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
