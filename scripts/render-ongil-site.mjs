#!/usr/bin/env node
/**
 * ONGIL corporate website — five pages for KO and EN, one topic per page:
 *   /{ko,en}/ongil/               01 Overview      brand story only (why, mission, journey, who, family, boundaries, stage, NEWON)
 *   /{ko,en}/ongil/platform/      02 Platform      (18 areas in 6 groups + the five app tabs + design rules)
 *   /{ko,en}/ongil/business/      03 Business      (20 business groups in 8 categories + models table, revenue, guardrails)
 *   /{ko,en}/ongil/partnerships/  04 Partnerships  (14 partner types in 4 bands + principles, criteria, process, FAQ)
 *   /{ko,en}/ongil/contact/       05 Contact       (15 inquiry types → the existing NEWON email / business inquiry form)
 *
 * Design: the same Life Stage shell as PETLOG / BABYLOG / LIVON — the dark "film" first screen
 * (#lifestage-detail.nls .nls-film, home-lifestage.css + home-lifestage-layout.css + home-lifestage.js), then the shared
 * five-menu bar (flagship-subnav.mjs), then white/black minimal sections. ONGIL-only layouts are ogs-* classes in
 * /ongil-site.css, scoped to #lifestage-detail.ogs (ONGIL Warm Apricot used only as a point colour).
 *
 * Runs AFTER render-ongil.mjs (build-i18n.mjs). The other seven locales keep the existing localized ONGIL page that
 * render-ongil.mjs writes; their sub-pages forward to EN (writeForwardStubs). Header/footer come from site-chrome.mjs.
 * Business introduction only: no sign-in, booking, payment, CRM or new inquiry backend.
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
import { KO, STATUS_KO } from "./ongil-site-ko.mjs";
import { EN, STATUS_EN } from "./ongil-site-en.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
export const OGS_VER = "20261018ogs3";
const NLS_VER = "20260924livon1"; // Life Stage assets are reused as-is
/** ONGIL first-screen background film (owner-provided, 2026-10-18). */
const ONGIL_FILM = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260323_071151_38c3924f-c312-48af-a196-3fbb80e4226f.mp4";

export const SITE_LANGS = ["ko", "en"];
export const PAGES = ["overview", "platform", "business", "partnerships", "contact"];
const CONTENT = { ko: { c: KO, s: STATUS_KO }, en: { c: EN, s: STATUS_EN } };

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

function statusBadge(S, key) {
  const st = S[key] || S.plan;
  return `<span class="ogs-status ogs-status--${e(st.tone)}"><i aria-hidden="true"></i>${e(st.label)}</span>`;
}

/** Section heading in the Life Stage vocabulary (nls-head / nls-kicker / nls-title / nls-lead). */
function head(id, kicker, title, lead, n = "") {
  return `<header class="nls-head">
      <p class="nls-kicker ogs-kicker">${n ? `<span class="ogs-kicker__n">${e(n)}</span>` : ""}<span${/[\uac00-\ud7a3]/.test(kicker) ? "" : ' lang="en"'}>${e(kicker)}</span></p>
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

/** First screen: the shared dark film hero (ONGIL_FILM background video + gradient fallback). */
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

function statusLegend(c, S, counts) {
  const rows = ["web", "partial", "prep", "plan"]
    .filter((k) => !counts || counts[k])
    .map((k) => `<li>${statusBadge(S, k)}<span class="ogs-legend__note">${e(S[k].note)}</span>${counts ? `<b class="ogs-legend__count">${counts[k] || 0}</b>` : ""}</li>`)
    .join("");
  return `<div class="ogs-legend"><p class="ogs-legend__t">${e(counts ? c.ui.statusCount : c.ui.statusLegendTitle)}</p><ul>${rows}</ul></div>`;
}

const backLink = (c) => `<a class="ogs-top" href="#ogs-index">${e(c.ui.back)} ↑</a>`;
const chips = (items) => `<ul class="nls-chips ogs-chips">${(items || []).map((t) => `<li>${e(t)}</li>`).join("")}</ul>`;

/** Responsive table: real <table> on wide screens, stacked label/value rows on phones (data-th). */
function table(cols, rows, { cls = "", caption = "" } = {}) {
  return `<div class="ogs-table-wrap${cls ? " " + cls : ""}"><table class="ogs-table">
      ${caption ? `<caption class="ogs-sr">${e(caption)}</caption>` : ""}
      <thead><tr>${cols.map((h) => `<th scope="col">${e(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows
        .map((r) => `<tr>${r.map((cell, i) => (i === 0 ? `<th scope="row" data-th="${e(cols[0])}">${cell}</th>` : `<td data-th="${e(cols[i])}">${cell}</td>`)).join("")}</tr>`)
        .join("")}</tbody>
    </table></div>`;
}

/** FAQ accordion with native <details>. */
function faq(id, f) {
  return sec(
    id,
    `<div class="nls-split">
      ${head(id, f.label, f.title, "")}
      <div class="ogs-faq">${f.items
        .map((it, i) => `<details${i === 0 ? " open" : ""}><summary><span class="ogs-faq__n">Q${pad(i + 1)}</span><span class="ogs-faq__q">${e(it.q)}</span><span class="ogs-faq__icon" aria-hidden="true"></span></summary><p>${e(it.a)}</p></details>`)
        .join("")}</div>
    </div>`
  );
}

function closeInk(c, lang, actions) {
  return sec(
    "ogs-close",
    `<div class="ogs-close">
      <p class="nls-kicker" lang="en">${e(c.ui.closeKicker)}</p>
      <h2 class="nls-hero__title" id="ogs-close-t">${c.ui.closeTitleHtml}</h2>
      <p class="nls-lead">${e(c.ui.closeLead)}</p>
      <div class="nls-actions">${actions
        .map(([label, href], i) => `<a class="nls-btn${i ? " nls-btn--ghost" : ""}" href="${e(href)}">${e(label)}${i ? "" : " →"}</a>`)
        .join("")}</div>
    </div>`,
    { tone: "ink" }
  );
}

/* ───────── 01 Overview — brand story only ───────── */

function overviewMain(c, S, lang) {
  const o = c.overview;
  const h = o.hero;

  // 01 · split statement + facts
  const intro = sec(
    "ogs-intro",
    `<div class="ogs-intro">
      <div>
        <p class="nls-kicker ogs-kicker"><span class="ogs-kicker__n">01</span><span lang="en">${e(h.kicker)}</span></p>
        <p class="ogs-intro__statement" id="ogs-intro-t">${e(h.body)}</p>
      </div>
      <dl class="ogs-facts">${h.facts.map((f) => `<div><dt>${e(f.k)}</dt><dd>${e(f.v)}</dd></div>`).join("")}</dl>
    </div>`
  );

  // 02 · editorial: four gaps in big type
  const why = sec(
    "ogs-why",
    `${head("ogs-why", o.why.label, o.why.title, o.why.lead, o.why.n)}
      <ol class="ogs-gaps">${o.why.items
        .map((g, i) => `<li><span class="ogs-gaps__n">${pad(i + 1)}</span><h3>${e(g.k)}</h3><p>${e(g.text)}</p></li>`)
        .join("")}</ol>
      <p class="ogs-gaps__close">${e(o.why.closing)}</p>`
  );

  // 03 · tinted: big mission statement + value board
  const mission = sec(
    "ogs-mission",
    `<p class="nls-kicker ogs-kicker"><span class="ogs-kicker__n">${e(o.mission.n)}</span><span lang="en">${e(o.mission.label)}</span></p>
      <h2 class="ogs-mission__statement" id="ogs-mission-t">${nl(o.mission.statement)}</h2>
      <p class="nls-lead ogs-mission__lead">${e(o.mission.lead)}</p>
      <ol class="ogs-values">${o.mission.values
        .map(
          (v, i) => `<li><span class="ogs-values__n">${pad(i + 1)}</span><p class="ogs-values__en" lang="en">${e(v.en)}</p>${v.ko ? `<p class="ogs-values__ko">${e(v.ko)}</p>` : ""}<p class="ogs-values__t">${e(v.text)}</p></li>`
        )
        .join("")}</ol>`,
    { tone: "tint" }
  );

  // 04 · horizontal journey timeline
  const journey = sec(
    "ogs-journey",
    `${head("ogs-journey", o.journey.label, o.journey.title, o.journey.lead, o.journey.n)}
      <ol class="ogs-timeline">${o.journey.steps.map((s) => `<li><span class="ogs-timeline__dot" aria-hidden="true"></span><span class="ogs-timeline__n">${e(s.n)}</span><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`).join("")}</ol>`
  );

  // 05 · split heading + roster with "what they gain" tags
  const who = sec(
    "ogs-who",
    `<div class="nls-split">
      ${head("ogs-who", o.who.label, o.who.title, o.who.lead, o.who.n)}
      <ol class="ogs-people">${o.who.items
        .map((s) => `<li><span class="ogs-people__n">${e(s.n)}</span><div><p class="ogs-people__name"><strong>${e(s.name)}</strong><em>${e(s.gets)}</em></p><p>${e(s.text)}</p></div></li>`)
        .join("")}</ol>
    </div>`
  );

  // 06 · ink: quote + four promises
  const family = sec(
    "ogs-family",
    `<div class="ogs-quote">
      <div>
        <p class="nls-kicker ogs-kicker"><span class="ogs-kicker__n">${e(o.family.n)}</span><span lang="en">${e(o.family.label)}</span></p>
        <h2 class="ogs-quote__t" id="ogs-family-t">${nl(o.family.quote)}</h2>
        <p class="ogs-quote__lead">${e(o.family.lead)}</p>
      </div>
      <div>
        <ol class="ogs-promises">${o.family.points.map((p, i) => `<li><span>${pad(i + 1)}</span><p>${e(p)}</p></li>`).join("")}</ol>
        <p class="ogs-statusline">${statusBadge(S, o.family.status)} <span>${e(o.family.statusText)}</span></p>
      </div>
    </div>`,
    { tone: "ink" }
  );

  // 07 · comparison: does / does not
  const boundary = sec(
    "ogs-boundary",
    `${head("ogs-boundary", o.boundary.label, o.boundary.title, o.boundary.lead, o.boundary.n)}
      <div class="ogs-compare" role="table" aria-labelledby="ogs-boundary-t">
        <div class="ogs-compare__row ogs-compare__row--head" role="row"><p role="columnheader" class="ogs-compare__do">${e(o.boundary.doHead)}</p><p role="columnheader" class="ogs-compare__dont">${e(o.boundary.dontHead)}</p></div>
        ${o.boundary.rows
          .map(([d, n]) => `<div class="ogs-compare__row" role="row"><p role="cell" class="ogs-compare__do"><span class="ogs-compare__mark" aria-hidden="true">✓</span>${e(d)}</p><p role="cell" class="ogs-compare__dont"><span class="ogs-compare__mark" aria-hidden="true">✕</span>${e(n)}</p></div>`)
          .join("")}
      </div>`
  );

  // 08 · tinted vertical stepper with status
  const roadmap = sec(
    "ogs-roadmap",
    `<div class="nls-split">
      ${head("ogs-roadmap", o.roadmap.label, o.roadmap.title, o.roadmap.lead, o.roadmap.n)}
      <ol class="ogs-stepper">${o.roadmap.steps
        .map((s, i) => `<li class="${i === 0 ? "is-done" : i === 1 ? "is-now" : ""}"><span class="ogs-stepper__n">${e(s.n)}</span><div><h3>${e(s.name)}</h3><p>${e(s.text)}</p>${statusBadge(S, s.status)}</div></li>`)
        .join("")}</ol>
    </div>`,
    { tone: "tint" }
  );

  // 09 · full-width link rows
  const newon = sec(
    "ogs-newon",
    `${head("ogs-newon", o.newon.label, o.newon.title, o.newon.lead, o.newon.n)}
      <ol class="ogs-linkrows">${o.newon.items
        .map((s) => `<li><a href="${rel(lang, s.href)}"><span class="ogs-linkrows__n">${e(s.n)}</span><strong lang="en">${e(s.name)}</strong><span class="ogs-linkrows__t">${e(s.text)}</span><span class="ogs-linkrows__arrow" aria-hidden="true">→</span></a></li>`)
        .join("")}</ol>`
  );

  // small strip to the other four pages
  const strip = `<nav class="ogs-strip" aria-label="${e(o.strip.label)}">
      <p class="ogs-strip__k" lang="en">${e(o.strip.label)}</p>
      <ol>${o.strip.items
        .map((s) => `<li><a href="${pagePath(lang, s.page)}"><span class="ogs-strip__n">${e(s.n)}</span><strong lang="en">${e(s.name)}</strong><span>${e(s.text)}</span><i aria-hidden="true">→</i></a></li>`)
        .join("")}</ol>
    </nav>`;

  return [intro, why, mission, journey, who, family, boundary, roadmap, newon, strip].join("\n");
}

/* ───────── 02 Platform — 18 areas only ───────── */

function areaLabel(s, n) {
  return `<p class="ogs-label"><span class="ogs-label__n">${pad(n)}</span><span lang="en">${e(s.label)}</span></p>`;
}
function areaMeta(c, S, s) {
  return `<dl class="ogs-dl">
          <div><dt>${e(c.ui.audience)}</dt><dd>${e(s.audience)}</dd></div>
          <div><dt>${e(c.ui.status)}</dt><dd>${statusBadge(S, s.status)}</dd></div>
        </dl>`;
}
function areaFull(c, S, s) {
  return `<p class="ogs-dt">${e(c.ui.services)}</p>${chips(s.services)}${areaMeta(c, S, s)}${note(s.note)}<div class="ogs-foot-links">${backLink(c)}</div>`;
}

function platformMain(c, S, lang) {
  const p = c.platform;
  const counts = {};
  p.sections.forEach((s) => (counts[s.status] = (counts[s.status] || 0) + 1));
  const idx = p.sections
    .map((s, i) => `<li><a href="#p-${e(s.id)}"><span>${pad(i + 1)}</span><strong>${e(s.title)}</strong><em lang="en">${e(s.label)}</em></a></li>`)
    .join("");

  // A · split: heading + status counts | 2-col numbered index
  const index = sec(
    "ogs-index",
    `<div class="nls-split ogs-split--index">
      <div>
        ${head("ogs-index", `${c.ui.onThisPage} · ${p.sections.length}`, c.ui.platformIndexTitle, "")}
        ${statusLegend(c, S, counts)}
      </div>
      <ol class="ogs-index">${idx}</ol>
    </div>`
  );

  // B · the five app tabs: phone-like tab bar + one column per tab
  const tabs = sec(
    "ogs-tabs",
    `${head("ogs-tabs", p.tabs.label, p.tabs.title, p.tabs.lead)}
      <ol class="ogs-tabs">${p.tabs.items
        .map(
          (t, i) => `<li><span class="ogs-tabs__icon" aria-hidden="true">${pad(i + 1)}</span><p class="ogs-tabs__name"><strong>${e(t.tab)}</strong><em lang="${c.lang === "ko" ? "en" : "ko"}">${e(t.en)}</em></p><p class="ogs-tabs__t">${e(t.text)}</p><ul>${t.areas.map((a) => `<li>${e(a)}</li>`).join("")}</ul></li>`
        )
        .join("")}</ol>
      ${note(p.tabs.note)}`,
    { tone: "tint" }
  );

  // C · six groups, each with its own layout
  const groups = p.groups
    .map((g, gi) => {
      const items = p.sections.slice(g.from, g.to).map((s, i) => ({ s, n: g.from + i + 1 }));
      const gid = `ogs-area-${gi + 1}`;
      let body;
      if (g.layout === "rows") {
        body = `<div class="ogs-rows">${items
          .map(
            ({ s, n }) => `<article class="ogs-row" id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
          <div class="ogs-row__head">${areaLabel(s, n)}<h3 id="p-${e(s.id)}-t">${e(s.title)}</h3><p>${e(s.desc)}</p></div>
          <div class="ogs-row__body">${areaFull(c, S, s)}</div>
        </article>`
          )
          .join("")}</div>`;
        return sec(gid, `${head(gid, g.kicker, g.title, g.lead)}${body}`, { tone: g.tone });
      }
      if (g.layout === "sticky") {
        body = `<div class="ogs-band">
          <div class="ogs-band__side">${head(gid, g.kicker, g.title, g.lead)}</div>
          <div class="ogs-band__main">${items
            .map(
              ({ s, n }) => `<article class="ogs-band__item" id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
            ${areaLabel(s, n)}<h3 id="p-${e(s.id)}-t">${e(s.title)}</h3><p class="ogs-card__desc">${e(s.desc)}</p>${areaFull(c, S, s)}
          </article>`
            )
            .join("")}</div>
        </div>`;
        return sec(gid, body, { tone: g.tone });
      }
      if (g.layout === "list") {
        body = `<ol class="ogs-arealist">${items
          .map(
            ({ s, n }) => `<li id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
            <span class="ogs-arealist__n">${pad(n)}</span>
            <div class="ogs-arealist__main"><p class="ogs-arealist__en" lang="en">${e(s.label)}</p><h3 id="p-${e(s.id)}-t">${e(s.title)}</h3><p>${e(s.desc)}</p>${note(s.note)}</div>
            <div class="ogs-arealist__tags"><p class="ogs-dt">${e(c.ui.services)}</p>${chips(s.services)}<p class="ogs-arealist__aud"><b>${e(c.ui.audience)}</b> ${e(s.audience)}</p></div>
            <div class="ogs-arealist__status">${statusBadge(S, s.status)}${backLink(c)}</div>
          </li>`
          )
          .join("")}</ol>`;
        return sec(gid, `${head(gid, g.kicker, g.title, g.lead)}${body}`, { tone: g.tone });
      }
      if (g.layout === "feature") {
        const [first, ...rest] = items;
        body = `<div class="ogs-feature">
          <article class="ogs-feature__main" id="p-${e(first.s.id)}" aria-labelledby="p-${e(first.s.id)}-t">
            <div class="ogs-feature__lead">${areaLabel(first.s, first.n)}<h3 id="p-${e(first.s.id)}-t">${e(first.s.title)}</h3><p class="ogs-feature__desc">${e(first.s.desc)}</p></div>
            <div class="ogs-feature__body">${areaFull(c, S, first.s)}</div>
          </article>
          <div class="ogs-feature__side">${rest
            .map(
              ({ s, n }) => `<article class="ogs-feature__item" id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
            ${areaLabel(s, n)}<h3 id="p-${e(s.id)}-t">${e(s.title)}</h3><p class="ogs-card__desc">${e(s.desc)}</p>${areaFull(c, S, s)}
          </article>`
            )
            .join("")}</div>
        </div>`;
        return sec(gid, `${head(gid, g.kicker, g.title, g.lead)}${body}`, { tone: g.tone });
      }
      // cards3
      body = `<div class="ogs-cards ogs-cards--3">${items
        .map(
          ({ s, n }) => `<article class="ogs-card" id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
          ${areaLabel(s, n)}<h3 id="p-${e(s.id)}-t">${e(s.title)}</h3><p class="ogs-card__desc">${e(s.desc)}</p>
          ${areaFull(c, S, s)}
        </article>`
        )
        .join("")}</div>`;
      return sec(gid, `${head(gid, g.kicker, g.title, g.lead)}${body}`, { tone: g.tone });
    })
    .join("\n");

  // D · shared design rules checklist
  const design = sec(
    "ogs-design",
    `<div class="nls-split">
      ${head("ogs-design", p.design.label, p.design.title, p.design.lead)}
      <ol class="ogs-rules">${p.design.items.map((r, i) => `<li><span class="ogs-rules__n">${pad(i + 1)}</span><div><h3>${e(r.k)}</h3><p>${e(r.text)}</p></div></li>`).join("")}</ol>
    </div>`
  );

  const close = closeInk(c, lang, [
    [c.ui.toBusiness, pagePath(lang, "business")],
    [c.ui.toPartnerships, pagePath(lang, "partnerships")],
    [c.ui.inquiry, pagePath(lang, "contact")],
  ]);
  return [index, tabs, groups, design, close].join("\n");
}

/* ───────── 03 Business — 20 groups, models, revenue ───────── */

function groupDl(c, S, g) {
  return `<dl class="ogs-dl ogs-dl--rows">
          <div><dt>${e(c.ui.audience)}</dt><dd>${e(g.audience)}</dd></div>
          <div><dt>${e(c.ui.value)}</dt><dd>${e(g.value)}</dd></div>
          <div><dt>${e(c.ui.partners)}</dt><dd>${e(g.partners)}</dd></div>
          <div><dt>${e(c.ui.revenue)}</dt><dd>${e(g.revenue)}</dd></div>
          <div><dt>${e(c.ui.regulation)}</dt><dd>${e(g.regulation)}</dd></div>
          <div><dt>${e(c.ui.status)}</dt><dd>${statusBadge(S, g.status)}</dd></div>
        </dl>`;
}

function businessMain(c, S, lang) {
  const b = c.business;
  const byCat = Object.fromEntries(b.categories.map((k) => [k.id, []]));
  b.groups.forEach((g, i) => byCat[g.cat].push(i));
  const catTitle = (k) => (c.lang === "ko" ? k.ko : k.en);

  // A · 4-column category board
  const catBoard = b.categories
    .map(
      (k, ci) => `<li><span class="ogs-cats__n">${pad(ci + 1)}</span><p class="ogs-cats__en" lang="en"><a href="#bc-${e(k.id)}">${e(k.en)}</a></p>${k.ko && c.lang === "ko" ? `<p class="ogs-cats__ko">${e(k.ko)}</p>` : ""}
        <ul>${byCat[k.id].map((i) => `<li><a href="#b-${pad(i + 1)}"><span>${pad(i + 1)}</span>${e(b.groups[i].name)}</a></li>`).join("")}</ul></li>`
    )
    .join("");
  const index = sec(
    "ogs-index",
    `${head("ogs-index", `${c.ui.category} · ${b.categories.length} / ${b.groups.length}`, c.ui.businessIndexTitle, "")}
      <ol class="ogs-cats">${catBoard}</ol>`
  );

  // B · structure diagram (split text / visual)
  const st = b.structure;
  const col = (x, cls) => `<div class="ogs-flow__col ${cls}"><p class="ogs-flow__k" lang="en">${e(x.k)}</p><ul>${x.items.map((t) => `<li>${e(t)}</li>`).join("")}</ul></div>`;
  const structure = sec(
    "ogs-structure",
    `<div class="nls-split">
      ${head("ogs-structure", st.label, st.title, st.lead)}
      <div class="ogs-flow" role="group" aria-label="${e(st.label)}">
        ${col(st.left, "ogs-flow__col--users")}
        <p class="ogs-flow__arrow" aria-hidden="true"><span>⇄</span></p>
        ${col(st.center, "ogs-flow__col--ongil")}
        <p class="ogs-flow__arrow" aria-hidden="true"><span>⇄</span></p>
        ${col(st.right, "ogs-flow__col--supply")}
        <ol class="ogs-flow__notes">${st.flows.map((f, i) => `<li><span>${pad(i + 1)}</span>${e(f)}</li>`).join("")}</ol>
      </div>
    </div>`,
    { tone: "tint" }
  );

  // C · one section per category, layout chosen in content (cards / rows / accordion)
  const cats = b.categories
    .map((k, ci) => {
      const ids = byCat[k.id];
      const label = (i) => `<p class="ogs-label"><span class="ogs-label__n">${pad(i + 1)}</span><span lang="en">${e(k.en)}</span></p>`;
      const foot = `<div class="ogs-foot-links">${backLink(c)}</div>`;
      let body;
      if (k.layout === "rows") {
        body = `<div class="ogs-rows">${ids
          .map((i) => {
            const g = b.groups[i];
            return `<article class="ogs-row" id="b-${pad(i + 1)}" aria-labelledby="b-${pad(i + 1)}-t">
          <div class="ogs-row__head">${label(i)}<h3 id="b-${pad(i + 1)}-t">${e(g.name)}</h3><p>${e(g.intro)}</p></div>
          <div class="ogs-row__body">${groupDl(c, S, g)}${foot}</div>
        </article>`;
          })
          .join("")}</div>`;
      } else if (k.layout === "compare") {
        const gs = ids.map((i) => ({ i, g: b.groups[i] }));
        const attr = [
          [c.ui.audience, "audience"],
          [c.ui.value, "value"],
          [c.ui.partners, "partners"],
          [c.ui.revenue, "revenue"],
          [c.ui.regulation, "regulation"],
        ];
        body = `<div class="ogs-table-wrap ogs-table--compare"><table class="ogs-table">
          <caption class="ogs-sr">${e(catTitle(k))}</caption>
          <thead><tr><th scope="col"><span class="ogs-sr">${e(c.ui.category)}</span></th>${gs
            .map(({ i, g }) => `<th scope="col" id="b-${pad(i + 1)}"><span class="ogs-label__n">${pad(i + 1)}</span><strong id="b-${pad(i + 1)}-t">${e(g.name)}</strong><span class="ogs-compare-intro">${e(g.intro)}</span></th>`)
            .join("")}</tr></thead>
          <tbody>${attr
            .map(([lab, key]) => `<tr><th scope="row">${e(lab)}</th>${gs.map(({ g }) => `<td data-th="${e(g.name)}">${e(g[key])}</td>`).join("")}</tr>`)
            .join("")}
            <tr><th scope="row">${e(c.ui.status)}</th>${gs.map(({ g }) => `<td data-th="${e(g.name)}">${statusBadge(S, g.status)}</td>`).join("")}</tr></tbody>
        </table></div>`;
      } else if (k.layout === "acc") {
        body = `<div class="ogs-acc">${ids
          .map((i, j) => {
            const g = b.groups[i];
            return `<details class="ogs-acc__item" id="b-${pad(i + 1)}"${j === 0 ? " open" : ""}>
          <summary><span class="ogs-acc__n">${pad(i + 1)}</span><span class="ogs-acc__head"><strong id="b-${pad(i + 1)}-t">${e(g.name)}</strong><span>${e(g.intro)}</span></span><span class="ogs-acc__st">${statusBadge(S, g.status)}</span><span class="ogs-acc__icon" aria-hidden="true"></span></summary>
          <div class="ogs-acc__body">${groupDl(c, S, g)}${foot}</div>
        </details>`;
          })
          .join("")}</div>`;
      } else {
        body = `<div class="ogs-cards ogs-cards--${ids.length === 3 ? "3" : ids.length === 1 ? "1" : "2"}">${ids
          .map((i) => {
            const g = b.groups[i];
            return `<article class="ogs-card" id="b-${pad(i + 1)}" aria-labelledby="b-${pad(i + 1)}-t">
          ${label(i)}<h3 id="b-${pad(i + 1)}-t">${e(g.name)}</h3><p class="ogs-card__desc">${e(g.intro)}</p>
          ${groupDl(c, S, g)}${foot}
        </article>`;
          })
          .join("")}</div>`;
      }
      const kicker = `${pad(ci + 1)} · ${k.en} · ${ids.length}`;
      return sec(`bc-${k.id}`, `${head(`bc-${k.id}`, kicker, catTitle(k), "")}${body}`, { tone: k.tone, cls: k.layout === "rows" ? "ogs-sec--rows" : "" });
    })
    .join("\n");

  // D · business-model comparison table
  const m = b.models;
  const T = c.ui.table;
  const models = sec(
    "ogs-models",
    `${head("ogs-models", m.label, m.title, m.lead)}
      ${table(
        [T.model, T.who, T.what, T.candidate, T.rule, T.status],
        m.rows.map((r) => [e(r.model), e(r.who), e(r.what), `<b class="ogs-cand">${e(r.candidate)}</b>`, e(r.rule), statusBadge(S, r.status)]),
        { caption: m.title, cls: "ogs-table--models" }
      )}`
  );

  // E · ink: revenue opportunities paragraph + caveats + free list
  const r = b.revenue;
  const revenue = sec(
    "ogs-revenue",
    `<div class="ogs-revenue">
      <div>
        <p class="nls-kicker ogs-kicker" lang="en">${e(r.label)}</p>
        <h2 class="nls-title" id="ogs-revenue-t">${e(r.title)}</h2>
        <p class="ogs-flag">${e(c.ui.revenueBadge)}</p>
        ${r.paragraphs.map((t) => `<p class="ogs-revenue__p">${e(t)}</p>`).join("")}
      </div>
      <div>
        <ul class="ogs-caveats">${r.caveats.map((t) => `<li>${e(t)}</li>`).join("")}</ul>
        <div class="ogs-free"><p class="ogs-free__t">${e(r.freeTitle)}</p><ul>${r.free.map((t) => `<li>${e(t)}</li>`).join("")}</ul></div>
      </div>
    </div>`,
    { tone: "ink" }
  );

  // F · regulatory guardrails table
  const gr = b.guardrails;
  const guard = sec(
    "ogs-guardrails",
    `${head("ogs-guardrails", gr.label, gr.title, gr.lead)}
      ${table([T.topic, T.law, T.ours], gr.rows.map((x) => [e(x.topic), e(x.law), e(x.ours)]), { caption: gr.label, cls: "ogs-table--guard" })}`
  );

  const close = closeInk(c, lang, [
    [c.ui.propose, pagePath(lang, "partnerships")],
    [c.ui.inquiry, pagePath(lang, "contact")],
  ]);
  return [index, structure, cats, models, revenue, guard, close].join("\n");
}

/* ───────── 04 Partnerships — partner types, principles, process ───────── */

function partnershipsMain(c, S, lang) {
  const p = c.partnerships;
  const T = c.ui.table;

  // A · editorial: why partner
  const why = sec(
    "ogs-pwhy",
    `${head("ogs-pwhy", p.why.label, p.why.title, "")}
      <ol class="ogs-gaps ogs-gaps--why">${p.why.items.map((g, i) => `<li><span class="ogs-gaps__n">${pad(i + 1)}</span><h3>${e(g.k)}</h3><p>${e(g.text)}</p></li>`).join("")}</ol>`
  );

  // B · tinted chip cloud of the 14 types
  const index = sec(
    "ogs-index",
    `${head("ogs-index", `${c.ui.onThisPage} · ${p.items.length}`, c.ui.partnerIndexTitle, "")}
      <ol class="ogs-cloud">${p.items.map((it, i) => `<li><a href="#pt-${pad(i + 1)}"><span>${pad(i + 1)}</span>${e(it.name)}</a></li>`).join("")}</ol>`,
    { tone: "tint" }
  );

  // C · grouped bands with a sticky band label
  const bands = sec(
    "ogs-partner-types",
    `${head("ogs-partner-types", "Partner Types", c.lang === "ko" ? "4개 분야, 14개 파트너 유형" : "Four fields, 14 partner types", "")}
      ${p.bands
        .map(
          (bd, bi) => `<div class="ogs-pband" id="pb-${e(bd.id)}">
        <div class="ogs-pband__side"><span class="ogs-pband__n">${pad(bi + 1)}</span><p class="ogs-pband__en" lang="en">${e(bd.en)}</p>${bd.ko ? `<p class="ogs-pband__ko">${e(bd.ko)}</p>` : ""}<p class="ogs-pband__count">${bd.to - bd.from}</p></div>
        <ol class="ogs-pband__list">${p.items
          .slice(bd.from, bd.to)
          .map((it, j) => {
            const i = bd.from + j;
            return `<li id="pt-${pad(i + 1)}" aria-labelledby="pt-${pad(i + 1)}-t">
            <div class="ogs-pband__head"><span class="ogs-label__n">${pad(i + 1)}</span><h3 id="pt-${pad(i + 1)}-t">${e(it.name)}</h3></div>
            <dl class="ogs-dl ogs-dl--rows">
              <div><dt>${e(c.ui.field)}</dt><dd>${e(it.field)}</dd></div>
              <div><dt>${e(c.ui.value)}</dt><dd>${e(it.value)}</dd></div>
              <div><dt>${e(c.ui.structure)}</dt><dd>${e(it.structure)}</dd></div>
              <div><dt>${e(c.ui.conditions)}</dt><dd>${e(it.conditions)}</dd></div>
            </dl>
            <div class="ogs-foot-links"><a class="ogs-link" href="${pagePath(lang, "contact")}#ogs-types">${e(c.ui.propose)} →</a>${backLink(c)}</div>
          </li>`;
          })
          .join("")}</ol>
      </div>`
        )
        .join("")}`
  );

  // D · ink principles checklist
  const principles = sec(
    "ogs-principles",
    `${head("ogs-principles", p.principles.label, p.principles.title, "")}
      <ol class="ogs-checklist">${p.principles.items.map((t, i) => `<li><span class="ogs-checklist__box" aria-hidden="true">✓</span><span class="ogs-checklist__n">${pad(i + 1)}</span><p>${e(t)}</p></li>`).join("")}</ol>
      ${note(p.note)}`,
    { tone: "ink" }
  );

  // E · review criteria table
  const criteria = sec(
    "ogs-criteria",
    `<div class="nls-split">
      ${head("ogs-criteria", p.criteria.label, p.criteria.title, p.criteria.lead)}
      ${table([T.item, T.check], p.criteria.rows.map((x) => [e(x.item), e(x.check)]), { caption: p.criteria.title, cls: "ogs-table--criteria" })}
    </div>`
  );

  // F · boxed 5-step process + what to prepare
  const process = sec(
    "ogs-process",
    `${head("ogs-process", "Process", p.processTitle, "")}
      <ol class="ogs-proc ogs-proc--5">${p.process.map((s) => `<li><span class="ogs-proc__n">${e(s.n)}</span><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`).join("")}</ol>
      <div class="ogs-prepare"><p class="ogs-prepare__t">${e(p.prepare.title)}</p><ul>${p.prepare.items.map((t) => `<li>${e(t)}</li>`).join("")}</ul></div>`,
    { tone: "tint" }
  );

  const fq = faq("ogs-faq", p.faq);

  const close = closeInk(c, lang, [
    [c.ui.propose, `${pagePath(lang, "contact")}#ogs-types`],
    [c.ui.toBusiness, pagePath(lang, "business")],
  ]);
  return [why, index, bands, principles, criteria, process, fq, close].join("\n");
}

/* ───────── 05 Contact — inquiry types and channels ───────── */

function contactMain(c, S, lang) {
  const k = c.contact;
  const T = c.ui.table;
  const formHref = (topic) =>
    `/${lang}/business/inquiry/?service=partnership&source=${encodeURIComponent(`/${lang}/ongil/contact/`)}&topic=${encodeURIComponent(`ONGIL - ${topic}`)}`;
  const mailHref = (topic) => `mailto:${k.email}?subject=${encodeURIComponent(`[ONGIL] ${topic}`)}`;

  // A · two large channel panels (existing NEWON inquiry system)
  const channels = sec(
    "ogs-channels",
    `${head("ogs-channels", "Channels", k.channelsTitle, "")}
      <ul class="ogs-channels">${k.channels
        .map((ch, i) => {
          const href = ch.href ? `/${lang}/${ch.href.replace("source=/ongil/", `source=/${lang}/ongil/`)}` : `mailto:${ch.v}`;
          return `<li><span class="ogs-channels__n">${pad(i + 1)}</span><p class="ogs-channels__k">${e(ch.k)}</p><a class="ogs-channels__v" href="${e(href)}">${e(ch.v)}${ch.href ? " →" : ""}</a><p>${e(ch.text)}</p></li>`;
        })
        .join("")}</ul>`
  );

  // B · inquiry types table
  const types = sec(
    "ogs-types",
    `${head("ogs-types", `Inquiry Types · ${k.types.length}`, k.typesTitle, k.typesLead)}
      ${table(
        ["No.", T.type, T.example, T.channel],
        k.types.map((t, i) => [
          `<span class="ogs-tnum">${pad(i + 1)}</span>`,
          `<strong>${e(t.name)}</strong>`,
          e(t.text),
          `<a class="ogs-link" href="${e(t.channel === "mail" ? mailHref(t.name) : formHref(t.name))}">${e(t.channel === "mail" ? c.ui.mail : c.ui.form)} →</a>`,
        ]),
        { caption: k.typesTitle, cls: "ogs-table--types" }
      )}`
  );

  // C · tinted split: before you write
  const before = sec(
    "ogs-before",
    `<div class="nls-split">
      ${head("ogs-before", k.before.label, k.before.title, "")}
      <ol class="ogs-checks">${k.before.items.map((it, i) => `<li><span>${pad(i + 1)}</span><p><strong>${e(it.t)}</strong><br>${e(it.d)}</p></li>`).join("")}</ol>
    </div>`,
    { tone: "tint" }
  );

  // D · emergency: official public numbers only, visually distinct
  const sos = sec(
    "ogs-sos",
    `<div class="ogs-sos">
      ${head("ogs-sos", k.sos.label, k.sos.title, k.sos.lead)}
      <ul class="ogs-sos__list">${k.sos.items
        .map((s) => `<li><a href="tel:${e(s.num.replace(/-/g, ""))}"><span class="ogs-sos__num">${e(s.num)}</span><span class="ogs-sos__k">${e(s.k)}</span><span class="ogs-sos__d">${e(s.d)}</span></a></li>`)
        .join("")}</ul>
    </div>`
  );

  // E · what to include + response flow
  const inc = k.include;
  const include = sec(
    "ogs-include",
    `<div class="nls-split">
      <div>
        ${head("ogs-include", "What To Include", inc.title, "")}
        <ol class="ogs-flowline">${inc.flow.map((s) => `<li><span>${e(s.n)}</span><strong>${e(s.name)}</strong><p>${e(s.text)}</p></li>`).join("")}</ol>
      </div>
      <ol class="ogs-includes">${inc.items.map((t, i) => `<li><span>${pad(i + 1)}</span>${e(t)}</li>`).join("")}</ol>
    </div>`
  );

  const fq = faq("ogs-faq", k.faq);

  const close = closeInk(c, lang, [
    [k.mailCta, `mailto:${k.email}?subject=${encodeURIComponent("[ONGIL]")}`],
    [c.ui.toPartnerships, pagePath(lang, "partnerships")],
  ]);
  return [channels, types, before, sos, include, fq, close].join("\n");
}

const MAINS = { overview: overviewMain, platform: platformMain, business: businessMain, partnerships: partnershipsMain, contact: contactMain };

function heroFor(c, lang, page) {
  const u = c.ui;
  const map = {
    overview: { h: c.overview.hero, main: [`${u.toPlatform} →`, pagePath(lang, "platform")], sub: [u.toPartnerships, pagePath(lang, "partnerships")] },
    platform: { h: c.platform.hero, main: [u.heroCta.platform, "#ogs-index"], sub: [u.inquiry, pagePath(lang, "contact")] },
    business: { h: c.business.hero, main: [u.heroCta.business, "#ogs-index"], sub: [u.toPartnerships, pagePath(lang, "partnerships")] },
    partnerships: { h: c.partnerships.hero, main: [u.heroCta.partnerships, "#ogs-index"], sub: [u.propose, `${pagePath(lang, "contact")}#ogs-types`] },
    contact: { h: c.contact.hero, main: [u.heroCta.contact, "#ogs-types"], sub: [c.contact.mailCta, `mailto:${c.contact.email}?subject=${encodeURIComponent("[ONGIL]")}`] },
  }[page];
  return hero(c, map.h, { main: map.main, sub: map.sub, compact: page !== "overview" });
}

export function renderMain(lang, page) {
  const { c, s } = CONTENT[lang];
  return `<section id="lifestage-detail" class="nls ogs" data-story="ongil" data-ogs-page="${page}" lang="${lang}" aria-labelledby="ogs-hero-title">
  ${heroFor(c, lang, page)}
  ${renderFlagshipSubnav({ biz: "ongil", lang, active: page })}
  <div class="nls__wrap">
  ${MAINS[page](c, s, lang)}
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
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=${NLS_VER}" />
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
