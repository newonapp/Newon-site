/**
 * SHAREON pages — section HTML.
 *
 *   <section id="lifestage-detail" class="nls" data-story="shareon">   shared dark "film" first screen
 *                                                                       (/home-lifestage*.css + /home-lifestage.js)
 *   <nav class="fsn" data-biz="shareon">                                shared five-menu bar (scripts/flagship-subnav.mjs)
 *   <div id="shareon-detail" class="nsh">                               body sections (/shareon.css, /shareon.js)
 *
 * Body language: the white/black Life Stage look (thin lines, generous whitespace, big headings, small uppercase
 * labels) with SHAREON purple only as a point colour. Neighbouring sections never reuse the same layout.
 * Information only: every action is a link to another page, the NEWON inquiry form or the official email.
 * The two interactive pieces (category tabs, hypothetical calculator) work without JS; shareon.js enhances them.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getShareonCopy, SHAREON_PAGES } from "./shareon-copy.mjs";
import { icon } from "./shareon-icons.mjs";
import { renderFlagshipSubnav } from "./flagship-subnav.mjs";

export { getShareonCopy };

const e = (s) => escapeHtml(s == null ? "" : String(s));
const nl = (s) => e(s).replace(/\n/g, "<br />");
const pad = (i) => String(i + 1).padStart(2, "0");

/** SHAREON first-screen background film (owner-provided, 2026-10-18). */
const SHAREON_FILM = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4";

function pageHref(lang, id) {
  const p = SHAREON_PAGES.find((x) => x.id === id);
  return `/${lang}/${p.path}/`;
}

export function inquiryHref(lang, slug = "general") {
  const q = new URLSearchParams({ type: "partnership", source: "shareon", utm_source: "shareon", utm_content: slug });
  return `/${lang}/business/inquiry/?${q.toString()}#inquiry`;
}

function mailHref(c, title) {
  return `mailto:newon@newon.app?subject=${encodeURIComponent(`${c.contact.mailSubjectPrefix} ${title}`)}`;
}

/* ───────── small building blocks ───────── */

function head(id, kicker, title, lead, { extra = "", cls = "" } = {}) {
  return `<header class="nsh-head${cls ? ` ${cls}` : ""}">
      ${kicker ? `<p class="nsh-kicker" lang="en">${e(kicker)}</p>` : ""}
      <h2 class="nsh-title" id="nsh-${e(id)}-t">${nl(title)}</h2>
      ${lead ? `<p class="nsh-lead">${e(lead)}</p>` : ""}${extra}
    </header>`;
}

/** One body section. `mod` picks the background: "" (white, thin top rule) · "tint" (faint purple wash) · "band" (purple tint) · "ink" (black). */
function sec(id, inner, mod = "") {
  return `<section class="nsh-sec${mod ? ` nsh-sec--${mod}` : ""}" id="nsh-${e(id)}" aria-labelledby="nsh-${e(id)}-t">
    <div class="nsh-wrap">${inner}</div>
  </section>`;
}

function chips(items, cls = "") {
  if (!items || !items.length) return "";
  return `<ul class="nsh-chips${cls ? ` ${cls}` : ""}" role="list">${items.map((t) => `<li>${e(t)}</li>`).join("")}</ul>`;
}

function btn(href, label, kind = "") {
  return `<a class="nsh-btn${kind ? ` nsh-btn--${kind}` : ""}" href="${e(href)}">${e(label)}${kind === "primary" ? ' <span aria-hidden="true">→</span>' : ""}</a>`;
}

function link(href, label, hidden = "") {
  return `<a class="nsh-link" href="${e(href)}">${e(label)}${hidden ? `<span class="nsh-vh"> — ${e(hidden)}</span>` : ""} <span aria-hidden="true">→</span></a>`;
}

/* ───────── first screen: shared film hero ───────── */

function hero(c, lang, id, h, main, sub) {
  const page = c.subnav.find((s) => s.id === id);
  const heroLang = c.heroLang && c.heroLang[id];
  const bodyLang = c.contentLang !== lang ? c.contentLang : "";
  return `<section id="lifestage-detail" class="nls" data-story="shareon" data-shareon-hero="${e(id)}"${bodyLang ? ` lang="${e(bodyLang)}"` : ""} aria-labelledby="nsh-hero-t">
  <div class="nls-film${id === "overview" ? "" : " nsh-film--compact"}" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${SHAREON_FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${SHAREON_FILM}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark" lang="en" aria-hidden="true">SHAREON</p>
        <h1 id="nsh-hero-t" class="nls-film__slogan"${heroLang ? ` lang="${e(heroLang)}"` : ""}><span class="nsh-vh" lang="en">SHAREON ${e(page ? page.en : "")} — </span>${nl(h.title)}</h1>
        <p class="nls-film__lead">${e(h.lead)}</p>
        <div class="nls-film__actions">
          <a class="nls-btn" href="${e(main)}">${e(h.ctaMain)} <span aria-hidden="true">→</span></a>
          <a class="nls-btn nls-btn--ghost" href="${e(sub)}">${e(h.ctaSub)}</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/** Thin strip directly under the menu bar: the one shared notice per page (per-card status badges were removed in V2). */
function status(c) {
  return `<div class="nsh-wrap nsh-status">
    <p class="nsh-status__note"><span class="nsh-status__pilot" lang="en">Pilot</span><span class="nsh-vh">${e(c.statusLabel)}: </span>${e(c.statusNote)}</p>
  </div>`;
}

/** Black closing band. */
function closing(id, n, ctas, { big = false } = {}) {
  return `<section class="nsh-sec nsh-sec--ink nsh-close" id="nsh-${e(id)}" aria-labelledby="nsh-${e(id)}-t">
    <div class="nsh-wrap nsh-close__in">
      ${n.kicker ? `<p class="nsh-kicker" lang="en">${e(n.kicker)}</p>` : ""}
      <h2 class="nsh-close__title${big ? " nsh-close__title--mail" : ""}" id="nsh-${e(id)}-t">${nl(n.title)}</h2>
      ${n.lead ? `<p class="nsh-close__lead">${e(n.lead)}</p>` : ""}
      <div class="nsh-close__ctas">${ctas.map(([href, label], i) => btn(href, label, i === 0 ? "primary" : "ghost")).join("")}</div>
    </div>
  </section>`;
}

/* ───────── layouts ───────── */

/** A · split: heading left, thin numbered rows right. */
function split(id, kicker, title, lead, rows, { extra = "", mod = "", after = "" } = {}) {
  return sec(
    id,
    `<div class="nsh-split">
      ${head(id, kicker, title, lead, { extra, cls: "nsh-head--side" })}
      <ol class="nsh-rows" role="list">${rows
        .map(
          (r, i) => `<li class="nsh-rows__item"><span class="nsh-rows__n" aria-hidden="true">${e(r.n || pad(i))}</span><div>${
            r.title ? `<h3 class="nsh-rows__title">${e(r.title)}</h3>` : ""
          }<p class="nsh-rows__body">${e(r.body)}</p></div></li>`
        )
        .join("")}</ol>
    </div>${after}`,
    mod
  );
}

/** B · big numbers in three columns with hairline dividers. */
function stats(id, c, kicker, title) {
  return sec(
    id,
    `${head(id, kicker, title, "")}
    <dl class="nsh-stats">${c.stats
      .map((s, i) => `<div class="nsh-stats__item"><dt>${e(s.label)}</dt><dd${i === 0 ? ' class="is-point"' : ""}>${e(s.n)}</dd></div>`)
      .join("")}</dl>
    <p class="nsh-note">${e(c.statsNote)}</p>`
  );
}

/** C · provider × renter matrix (C2C/C2B/B2C/B2B) + two wide signal cards (Marketplace, SaaS). */
function matrix(c, items) {
  const m = c.matrix;
  const by = Object.fromEntries(items.map((it) => [it.en, it]));
  const cell = (it) =>
    it
      ? `<li class="nsh-matrix__cell"><p class="nsh-matrix__code" lang="en">${e(it.en)}</p><h3 class="nsh-matrix__title">${e(it.title)}</h3><p class="nsh-matrix__body">${e(
          it.body
        )}</p></li>`
      : "";
  const rest = items.filter((it) => !["C2C", "C2B", "B2C", "B2B"].includes(it.en));
  return `<div class="nsh-matrix">
      <p class="nsh-matrix__axis nsh-matrix__axis--x" aria-hidden="true"><span>${e(m.renter)} →</span><span>${e(m.person)}</span><span>${e(m.business)}</span></p>
      <p class="nsh-matrix__axis nsh-matrix__axis--y" aria-hidden="true"><span>${e(m.provider)} ↓</span><span>${e(m.person)}</span><span>${e(m.business)}</span></p>
      <ul class="nsh-matrix__grid" role="list">${cell(by.C2C)}${cell(by.C2B)}${cell(by.B2C)}${cell(by.B2B)}</ul>
    </div>
    <ul class="nsh-signal" role="list">${rest
      .map(
        (it) => `<li class="nsh-signal__item"><span class="nsh-signal__n" aria-hidden="true">${e(it.n)}</span><p class="nsh-signal__code" lang="en">${e(
          it.en
        )}</p><h3 class="nsh-signal__title">${e(it.title)}</h3><p class="nsh-signal__body">${e(it.body)}</p></li>`
      )
      .join("")}</ul>`;
}

/* Original sharing-loop visual for "how it works": two arcs forming a loop. */
const LOOP_SVG = `<svg class="nsh-loop" viewBox="0 0 240 120" aria-hidden="true" focusable="false">
  <path d="M60 20a40 40 0 1 0 0 80h120a40 40 0 1 0 0-80z" fill="none" stroke="#d9d6ff" stroke-width="2"/>
  <path d="M60 20h120" fill="none" stroke="#7771E8" stroke-width="3" stroke-linecap="round"/>
  <path d="M172 12l10 8-10 8" fill="none" stroke="#7771E8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M68 92l-10 8 10 8" fill="none" stroke="#7771E8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M60 100h120" fill="none" stroke="#7771E8" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 9"/>
</svg>`;

/* ───────── 01 Overview ───────── */

function overview(c, lang) {
  const o = c.overview;

  const vision = split("vision", o.vision.kicker, o.vision.title, o.vision.lead, o.vision.points);
  const glance = stats("glance", c, "AT A GLANCE", c.lang === "ko" ? "14개 사업군,\n6개 수익원." : "14 businesses,\n6 revenue streams.");

  const share = sec(
    "share",
    `${head("share", o.share.kicker, o.share.title, o.share.lead)}
    <ul class="nsh-board" role="list">${o.share.items
      .map(
        (it, i) => `<li class="nsh-board__item">
          <div class="nsh-board__top"><span class="nsh-board__n" aria-hidden="true">${pad(i)}</span><span class="nsh-board__ico">${icon(it.icon)}</span></div>
          <p class="nsh-board__label" lang="en">${e(it.en)}</p>
          <h3 class="nsh-board__title">${e(it.title)}</h3>
          <p class="nsh-board__body">${e(it.body)}</p>
          ${chips(it.chips)}
        </li>`
      )
      .join("")}</ul>`,
    "tint"
  );

  const how = sec(
    "how",
    `<div class="nsh-how__head">${head("how", o.how.kicker, o.how.title, o.how.lead)}</div>
    <ol class="nsh-track" role="list">${o.how.steps
      .map(
        (s) => `<li class="nsh-track__step">
          <span class="nsh-track__dot" aria-hidden="true"></span>
          <p class="nsh-track__n" aria-hidden="true">${e(s.n)} <span lang="en">${e(s.en)}</span></p>
          <h3 class="nsh-track__title">${e(s.title)}</h3>
          <p class="nsh-track__body">${e(s.body)}</p>
        </li>`
      )
      .join("")}</ol>`
  );

  const connect = sec("connect", `${head("connect", o.connect.kicker, o.connect.title, o.connect.lead)}${matrix(c, o.connect.items)}`);

  const trust = sec(
    "trust",
    `${head("trust", o.trust.kicker, o.trust.title, o.trust.lead)}
    <ol class="nsh-pillars" role="list">${o.trust.items
      .map(
        (it) => `<li class="nsh-pillars__item"><span class="nsh-pillars__n" aria-hidden="true">${e(it.n)}</span><h3 class="nsh-pillars__title">${e(
          it.title
        )}</h3><p class="nsh-pillars__body">${e(it.body)}</p></li>`
      )
      .join("")}</ol>
    <p class="nsh-callout">${e(o.trust.note)}</p>`,
    "band"
  );

  const eco = sec(
    "eco",
    `${head("eco", o.eco.kicker, o.eco.title, o.eco.lead)}
    <ol class="nsh-chain" role="list">${o.eco.items
      .map(
        (it, i) => `<li class="nsh-chain__item"><span class="nsh-chain__n" aria-hidden="true">${e(it.n)}</span><h3 class="nsh-chain__title">${e(
          it.title
        )}</h3><p class="nsh-chain__body">${e(it.body)}</p>${i < o.eco.items.length - 1 ? '<span class="nsh-chain__arrow" aria-hidden="true">→</span>' : ""}</li>`
      )
      .join("")}</ol>
    <p class="nsh-more">${link(pageHref(lang, "business"), o.eco.cta)}</p>`
  );

  const newon = sec(
    "newon",
    `<div class="nsh-family">
      ${head("newon", o.newon.kicker, o.newon.title, o.newon.lead, { cls: "nsh-head--side" })}
      <ul class="nsh-family__grid" role="list">${o.newon.items
        .map(
          (r) => `<li class="nsh-family__item${r.self ? " is-self" : ""}"><span class="nsh-family__dot" aria-hidden="true"></span><h3 class="nsh-family__name" lang="en">${e(
            r.name
          )}</h3><p class="nsh-family__body">${e(r.body)}</p></li>`
        )
        .join("")}</ul>
    </div>`,
    "tint"
  );

  return {
    hero: hero(c, lang, "overview", o.hero, pageHref(lang, "platform"), "#nsh-vision"),
    body: [
      vision,
      glance,
      share,
      how,
      connect,
      trust,
      eco,
      newon,
      closing("next", o.next, [
        [pageHref(lang, "platform"), o.next.ctas[0]],
        [pageHref(lang, "business"), o.next.ctas[1]],
        [pageHref(lang, "contact"), o.next.ctas[2]],
      ]),
    ],
  };
}

/* ───────── 02 Platform ───────── */

function svcHead(c, s) {
  return `<p class="nsh-svc__meta"><span class="nsh-svc__n" aria-hidden="true">${e(s.n)}</span><span lang="en">${e(s.en)}</span></p>
          <h3 class="nsh-svc__title" id="svc-${e(s.n)}-t">${e(s.title)}</h3>`;
}

function consider(c, s) {
  return s.consider ? `<p class="nsh-consider"><strong>${e(c.considerLabel)}</strong>${e(s.consider)}</p>` : "";
}

function platform(c, lang) {
  const p = c.platform;
  const G = Object.fromEntries(p.groups.map((g) => [g.id, g]));
  const S = (gid) => p.services.filter((s) => s.g === gid);

  /* Index — chip cloud grouped by A–E */
  const index = sec(
    "index",
    `${head("index", "18 SERVICES", p.indexTitle, "")}
    <div class="nsh-cloud">${p.groups
      .map(
        (g) => `<div class="nsh-cloud__group"><p class="nsh-cloud__k" lang="en">${e(g.kicker)}</p><ul class="nsh-cloud__list" role="list">${S(g.id)
          .map((s) => `<li><a href="#svc-${e(s.n)}"><span aria-hidden="true">${e(s.n)}</span>${e(s.title)}</a></li>`)
          .join("")}</ul></div>`
      )
      .join("")}</div>`,
    "tint"
  );

  /* A — catalog rows */
  const a = sec(
    "grp-a",
    `${head("grp-a", G.a.kicker, G.a.title, G.a.lead)}
    <div class="nsh-catalog">${S("a")
      .map(
        (s) => `<article class="nsh-catalog__row" id="svc-${e(s.n)}" aria-labelledby="svc-${e(s.n)}-t">
          <div class="nsh-catalog__side"><span class="nsh-catalog__ico">${icon(s.icon)}</span><div>${svcHead(c, s)}</div></div>
          <div class="nsh-catalog__main"><p class="nsh-catalog__body">${e(s.body)}</p>${chips(s.chips)}${consider(c, s)}</div>
        </article>`
      )
      .join("")}</div>`
  );

  /* B — 3-column board with a lead cell */
  const b = sec(
    "grp-b",
    `<ul class="nsh-grid3" role="list">
      <li class="nsh-grid3__lead">${head("grp-b", G.b.kicker, G.b.title, G.b.lead)}</li>
      ${S("b")
        .map(
          (s) => `<li class="nsh-grid3__item" id="svc-${e(s.n)}">
          <div class="nsh-grid3__top"><span class="nsh-grid3__ico">${icon(s.icon)}</span></div>
          ${svcHead(c, s)}
          <p class="nsh-grid3__body">${e(s.body)}</p>
          ${chips(s.chips)}
          ${consider(c, s)}
        </li>`
        )
        .join("")}
    </ul>`
  );

  /* C — purple band, two wide cards */
  const cc = sec(
    "grp-c",
    `${head("grp-c", G.c.kicker, G.c.title, G.c.lead)}
    <div class="nsh-duo">${S("c")
      .map(
        (s) => `<article class="nsh-duo__item" id="svc-${e(s.n)}" aria-labelledby="svc-${e(s.n)}-t">
          <span class="nsh-duo__big" aria-hidden="true">${e(s.n)}</span>
          <div class="nsh-duo__top"><span class="nsh-duo__ico">${icon(s.icon)}</span></div>
          ${svcHead(c, s)}
          <p class="nsh-duo__body">${e(s.body)}</p>
          ${chips(s.chips)}
          ${consider(c, s)}
        </article>`
      )
      .join("")}</div>`,
    "band"
  );

  /* D — boxed step process (the rental system is a sequence) */
  const d = sec(
    "grp-d",
    `${head("grp-d", G.d.kicker, G.d.title, G.d.lead)}
    <ol class="nsh-proc" role="list">${S("d")
      .map(
        (s, i) => `<li class="nsh-proc__item" id="svc-${e(s.n)}">
          <div class="nsh-proc__top"><span class="nsh-proc__box" aria-hidden="true">${pad(i)}</span><span class="nsh-proc__ico">${icon(s.icon)}</span></div>
          ${svcHead(c, s)}
          <p class="nsh-proc__body">${e(s.body)}</p>
          ${chips(s.chips, "nsh-chips--sm")}
          ${consider(c, s)}
        </li>`
      )
      .join("")}</ol>`
  );

  /* E — app & accessibility: device visual + text */
  const app = S("e")[0];
  const e1 = sec(
    "grp-e",
    `<div class="nsh-device nsh-device--solo" id="svc-${e(app.n)}">
      <div class="nsh-device__text">
        ${head("grp-e", G.e.kicker, app.title, "")}
        <p class="nsh-svc__meta"><span class="nsh-svc__n" aria-hidden="true">${e(app.n)}</span><span lang="en">${e(app.en)}</span></p>
        <p class="nsh-device__body">${e(app.body)}</p>
        ${chips(app.chips, "nsh-chips--lg")}
        ${consider(c, app)}
      </div>
    </div>`,
    "tint"
  );

  return {
    hero: hero(c, lang, "platform", p.hero, pageHref(lang, "business"), pageHref(lang, "contact")),
    body: [
      index,
      a,
      b,
      cc,
      d,
      e1,
      closing("next", p.next, [
        [pageHref(lang, "business"), c.platform.hero.ctaMain],
        [pageHref(lang, "partnerships"), c.overview.next.ctas[1]],
        [pageHref(lang, "contact"), c.overview.next.ctas[2]],
      ]),
    ],
  };
}

/* ───────── 03 Business ───────── */

function fmt(n, lang) {
  try {
    return new Intl.NumberFormat(lang === "ko" ? "ko-KR" : "en-US").format(n);
  } catch {
    return String(n);
  }
}

function business(c, lang) {
  const b = c.business;

  const glance = stats("glance", c, "AT A GLANCE", c.lang === "ko" ? "사업 계획의 구성." : "How the plan is built.");
  const structure = sec("structure", `${head("structure", b.structure.kicker, b.structure.title, b.structure.lead)}${matrix(c, c.overview.connect.items)}`);

  /* 14 core businesses — category tabs on the purple band */
  const k = b.core;
  const tabs = `<div class="nsh-tabs__list" role="tablist" aria-label="${e(k.tabsAria)}" hidden data-nsh-tablist>${k.cats
    .map(
      (cat, i) => `<button type="button" role="tab" class="nsh-tabs__tab" id="tab-${e(cat.id)}" aria-controls="panel-${e(cat.id)}" aria-selected="${
        i === 0 ? "true" : "false"
      }" tabindex="${i === 0 ? "0" : "-1"}"><span class="nsh-tabs__n" aria-hidden="true">${e(cat.n)}</span><span class="nsh-tabs__label">${e(cat.title)}</span></button>`
    )
    .join("")}</div>`;
  const panels = k.cats
    .map((cat) => {
      const items = k.items.filter((it) => it.c === cat.id);
      return `<div class="nsh-tabs__panel" id="panel-${e(cat.id)}" role="region" aria-labelledby="panel-${e(cat.id)}-t" data-nsh-panel>
        <div class="nsh-tabs__side">
          <span class="nsh-tabs__big" aria-hidden="true">${e(cat.n)}</span>
          <p class="nsh-tabs__en" lang="en">${e(cat.en)}</p>
          <h3 class="nsh-tabs__title" id="panel-${e(cat.id)}-t">${e(cat.title)}</h3>
          <p class="nsh-tabs__count">${items.length} / ${k.items.length}</p>
        </div>
        <ul class="nsh-biz" role="list">${items
          .map(
            (it) => `<li class="nsh-biz__item">
              <div class="nsh-biz__top">
                <span class="nsh-biz__ico">${icon(it.icon)}</span>
                <div class="nsh-biz__name"><p class="nsh-biz__en"><span aria-hidden="true">${e(it.n)} · </span><span lang="en">${e(it.en)}</span></p><h4 class="nsh-biz__title">${e(
                  it.title
                )}</h4></div>
              </div>
              <dl class="nsh-biz__dl">
                <div><dt>${e(c.targetsLabel)}</dt><dd>${e(it.targets)}</dd></div>
                <div><dt>${e(c.customerLabel)}</dt><dd>${e(it.customer)}</dd></div>
                <div><dt>${e(c.revenueLabel)}</dt><dd>${e(it.revenue)}</dd></div>
                ${it.consider ? `<div><dt>${e(c.considerLabel)}</dt><dd>${e(it.consider)}</dd></div>` : ""}
              </dl>
            </li>`
          )
          .join("")}</ul>
      </div>`;
    })
    .join("");
  const core = sec("core", `${head("core", k.kicker, k.title, k.lead)}<div class="nsh-tabs" data-nsh-tabs>${tabs}${panels}</div>`, "band");

  /* Revenue — six axes as a ruled ledger */
  const r = b.revenue;
  const revenue = sec(
    "revenue",
    `<div class="nsh-ledger">
      ${head("revenue", r.kicker, r.title, r.lead, { cls: "nsh-head--side" })}
      <div class="nsh-ledger__body">
        <div class="nsh-table-wrap" role="region" aria-labelledby="nsh-revenue-t" tabindex="0">
          <table class="nsh-table">
            <thead><tr><th scope="col"><span class="nsh-vh">#</span></th><th scope="col">${e(r.head.name)}</th><th scope="col">${e(r.head.target)}</th><th scope="col">${e(
              r.head.model
            )}</th></tr></thead>
            <tbody>${r.rows
              .map((row) => `<tr><td class="nsh-table__n">${e(row.n)}</td><th scope="row">${e(row.name)}</th><td>${e(row.target)}</td><td>${e(row.model)}</td></tr>`)
              .join("")}</tbody>
          </table>
        </div>
        <p class="nsh-callout">${e(r.note)}</p>
      </div>
    </div>`
  );

  /* Hypothetical calculator — black band */
  const k2 = b.calc;
  const d = k2.defaults;
  const gmv = d.count * d.avg;
  const fee = Math.round((gmv * d.rate) / 100);
  const field = (name, label, unit, val, attrs) =>
    `<div class="nsh-calc__field"><label for="calc-${name}">${e(label)}</label><div class="nsh-calc__input"><input id="calc-${name}" name="${name}" type="number" inputmode="numeric" value="${val}" ${attrs} data-nsh-calc-in="${name}" />${
      unit ? `<span>${e(unit)}</span>` : ""
    }</div></div>`;
  const calc = sec(
    "calc",
    `<div class="nsh-calc" data-nsh-calc data-lang="${e(lang === "ko" ? "ko-KR" : "en-US")}">
      ${head("calc", k2.kicker, k2.title, k2.lead, { extra: `<p class="nsh-calc__badge">${e(k2.badge)}</p>`, cls: "nsh-head--side" })}
      <form class="nsh-calc__form" aria-labelledby="nsh-calc-t">
        <div class="nsh-calc__fields">
          ${field("count", k2.fields.count, k2.fields.countUnit, d.count, 'min="0" max="10000000" step="1"')}
          ${field("avg", k2.fields.avg, k2.fields.avgUnit, d.avg, 'min="0" max="100000000" step="1000"')}
          ${field("rate", k2.fields.rate, k2.fields.rateUnit, d.rate, 'min="0" max="100" step="0.5"')}
        </div>
        <dl class="nsh-calc__out" aria-live="polite">
          <div><dt>${e(k2.out.gmv)}</dt><dd><output data-nsh-calc-out="gmv" for="calc-count calc-avg">${fmt(gmv, lang)}</output> <span>${e(k2.currency)}</span></dd></div>
          <div class="is-fee"><dt>${e(k2.out.fee)}</dt><dd><output data-nsh-calc-out="fee" for="calc-count calc-avg calc-rate">${fmt(fee, lang)}</output> <span>${e(k2.currency)}</span></dd></div>
        </dl>
        <p class="nsh-calc__note">${e(k2.note)}</p>
      </form>
    </div>`,
    "ink"
  );

  /* SaaS — module spec sheet */
  const s = b.saas;
  const saas = sec(
    "saas",
    `${head("saas", s.kicker, s.title, s.lead, { extra: `<div class="nsh-head__row">${link(inquiryHref(lang, "saas"), s.cta)}</div>` })}
    <ul class="nsh-modules" role="list">${s.items
      .map(
        (it, i) => `<li class="nsh-modules__item"><span class="nsh-modules__n" aria-hidden="true">${pad(i)}</span><h3 class="nsh-modules__name" lang="en">${e(
          it.name
        )}</h3><p class="nsh-modules__body">${e(it.body)}</p></li>`
      )
      .join("")}</ul>`
  );

  /* Roadmap — vertical timeline on the band */
  const rm = b.roadmap;
  const roadmap = sec(
    "roadmap",
    `<div class="nsh-split">
      ${head("roadmap", rm.kicker, rm.title, rm.lead, { cls: "nsh-head--side", extra: `<p class="nsh-now"><span class="nsh-now__dot" aria-hidden="true"></span>${e(rm.now)}</p>` })}
      <ol class="nsh-timeline" role="list">${rm.steps
        .map(
          (st, i) => `<li class="nsh-timeline__item${i === 0 ? " is-now" : ""}"><span class="nsh-timeline__dot" aria-hidden="true"></span><p class="nsh-timeline__n" lang="en">STEP ${e(
            st.n
          )}</p><h3 class="nsh-timeline__title">${e(st.title)}${st.tag ? ` <span class="nsh-tag">${e(st.tag)}</span>` : ""}</h3><p class="nsh-timeline__body">${e(
            st.body
          )}</p></li>`
        )
        .join("")}</ol>
    </div>`,
    "band"
  );

  /* Focus — two-tone statement cards */
  const ex = b.excluded;
  const focus = sec(
    "focus",
    `${head("focus", ex.kicker, ex.title, ex.lead)}
    <ol class="nsh-statements" role="list">${ex.points
      .map(
        (pt) => `<li class="nsh-statements__item"><span class="nsh-statements__n" aria-hidden="true">${e(pt.n)}</span><h3 class="nsh-statements__title">${e(
          pt.title
        )}</h3><p class="nsh-statements__body">${e(pt.body)}</p></li>`
      )
      .join("")}</ol>`
  );

  return {
    hero: hero(c, lang, "business", b.hero, pageHref(lang, "partnerships"), inquiryHref(lang, "business")),
    body: [
      glance,
      structure,
      core,
      revenue,
      calc,
      saas,
      roadmap,
      focus,
      closing("next", b.next, [
        [pageHref(lang, "partnerships"), b.next.ctas[0]],
        [inquiryHref(lang, "business"), b.next.ctas[1]],
      ]),
    ],
  };
}

/* ───────── 04 Partnerships ───────── */

function partnerships(c, lang) {
  const p = c.partnerships;
  const t = p.types;

  const open = split("open", p.open.kicker, p.open.title, p.open.lead, p.open.points, { mod: "tint" });

  const types = sec(
    "types",
    `<div class="nsh-dir__head">${head("types", t.kicker, t.title, "")}<p class="nsh-notice"><span class="nsh-notice__k" aria-hidden="true">!</span>${e(p.notice)}</p></div>
    <ul class="nsh-pidx" role="list">${t.items
      .map((it) => `<li><a class="nsh-pidx__a" href="#ptype-${e(it.n)}"><span class="nsh-pidx__ico">${icon(it.icon)}</span><span class="nsh-pidx__n" aria-hidden="true">${e(it.n)}</span><span class="nsh-pidx__t">${e(it.title)}</span></a></li>`)
      .join("")}</ul>
    <ol class="nsh-dir" role="list">
      <li class="nsh-dir__row nsh-dir__row--head" aria-hidden="true"><span></span><span></span><span>${e(t.labels.collab)}</span><span>${e(t.labels.value)}</span><span>${e(
        t.labels.terms
      )}</span><span>${e(t.labels.route)}</span></li>
      ${t.items
        .map(
          (it) => `<li class="nsh-dir__row" id="ptype-${e(it.n)}">
        <span class="nsh-dir__n" aria-hidden="true">${e(it.n)}</span>
        <div class="nsh-dir__name"><span class="nsh-dir__ico">${icon(it.icon)}</span><div><h3 class="nsh-dir__title">${e(it.title)}</h3>${link(
            inquiryHref(lang, `partner-${it.n}`),
            c.partnershipInquiry,
            it.title
          )}</div></div>
        <dl class="nsh-dir__dl">
          <div><dt>${e(t.labels.collab)}</dt><dd>${e(it.collab)}</dd></div>
          <div><dt>${e(t.labels.value)}</dt><dd>${e(it.value)}</dd></div>
          <div><dt>${e(t.labels.terms)}</dt><dd>${e(it.terms)}</dd></div>
          <div><dt>${e(t.labels.route)}</dt><dd>${e(it.route)}</dd></div>
        </dl>
      </li>`
        )
        .join("")}
    </ol>`
  );

  const pr = p.process;
  const process = sec(
    "process",
    `${head("process", pr.kicker, pr.title, pr.lead)}
    <ol class="nsh-steps" role="list">${pr.steps
      .map(
        (s, i) => `<li class="nsh-steps__item"><span class="nsh-steps__box" aria-hidden="true">${e(s.n)}</span><h3 class="nsh-steps__title">${e(
          s.title
        )}</h3><p class="nsh-steps__body">${e(s.body)}</p>${i < pr.steps.length - 1 ? '<span class="nsh-steps__arrow" aria-hidden="true">→</span>' : ""}</li>`
      )
      .join("")}</ol>`,
    "band"
  );

  return {
    hero: hero(c, lang, "partnerships", p.hero, inquiryHref(lang, "partnership"), pageHref(lang, "business")),
    body: [
      open,
      types,
      process,
      closing("next", p.next, [
        [inquiryHref(lang, "partnership"), p.next.ctas[0]],
        [pageHref(lang, "contact"), p.next.ctas[1]],
      ]),
    ],
  };
}

/* ───────── 05 Contact ───────── */

function contact(c, lang) {
  const k = c.contact;
  const types = sec(
    "types",
    `${head("types", k.kicker, k.title, k.lead)}
    <div class="nsh-tgroups">${(k.groups ? Object.keys(k.groups) : [null])
      .map((gid) => {
        const list = gid ? k.items.filter((it) => it.g === gid) : k.items;
        return `<div class="nsh-tgroup${gid ? ` nsh-tgroup--${e(gid)}` : ""}">
      ${gid ? `<p class="nsh-tgroup__k"><span class="nsh-tgroup__dot" aria-hidden="true"></span>${e(k.groups[gid])}<span class="nsh-tgroup__count">${list.length}</span></p>` : ""}
      <ul class="nsh-tiles" role="list">${list
      .map(
        (it) => `<li class="nsh-tiles__item">
          <div class="nsh-tiles__top"><span class="nsh-tiles__ico">${icon(it.icon)}</span><span class="nsh-tiles__n">${k.groups && it.g ? `${e(k.groups[it.g])} ` : ""}<span aria-hidden="true">· ${e(it.n)}</span></span></div>
          <h3 class="nsh-tiles__title">${e(it.title)}</h3>
          <p class="nsh-tiles__body">${e(it.body)}</p>
          <div class="nsh-tiles__acts">
            <a class="nsh-tiles__btn" href="${e(inquiryHref(lang, it.slug))}">${e(k.formCta)}<span class="nsh-vh"> — ${e(it.title)}</span> <span aria-hidden="true">→</span></a>
            <a class="nsh-tiles__mail" href="${e(mailHref(c, k.groups && it.g ? `${k.groups[it.g]} · ${it.title}` : it.title))}">${e(k.mailCta)}<span class="nsh-vh"> — ${e(it.title)}</span></a>
          </div>
        </li>`
      )
      .join("")}</ul></div>`;
      })
      .join("")}</div>`
  );
  const g = k.guide;
  const guide = sec(
    "guide",
    `<div class="nsh-split">
      ${head("guide", g.kicker, g.title, "", {
        cls: "nsh-head--side",
        extra: `<p class="nsh-more"><a class="nsh-link" href="/${e(lang)}/privacy/">${e(g.privacy)} <span aria-hidden="true">→</span></a></p>`,
      })}
      <ul class="nsh-checks" role="list">${g.items
        .map(
          (t) => `<li class="nsh-checks__item"><svg class="nsh-checks__ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M3 3h18v18H3z" fill="none" stroke="#7771E8" stroke-width="1.6"/><path d="m7.5 12.5 3 3 6-7" fill="none" stroke="#554CC8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><p>${e(
            t
          )}</p></li>`
        )
        .join("")}</ul>
    </div>`,
    "band"
  );
  return {
    hero: hero(c, lang, "contact", k.hero, inquiryHref(lang, "general"), mailHref(c, "SHAREON")),
    body: [
      types,
      guide,
      closing(
        "next",
        { kicker: "NEWON · SHAREON", title: "newon@newon.app", lead: "" },
        [
          [inquiryHref(lang, "general"), k.hero.ctaMain],
          [mailHref(c, "SHAREON"), k.hero.ctaSub],
        ],
        { big: true }
      ),
    ],
  };
}

const RENDER = { overview, platform, business, partnerships, contact };

export function renderShareonPage(lang, id) {
  const c = getShareonCopy(lang);
  const { hero: first, body } = RENDER[id](c, lang);
  return `${first}
${renderFlagshipSubnav({ biz: "shareon", lang, active: id })}
<div id="shareon-detail" class="nsh" data-shareon-page="${e(id)}" data-content-lang="${e(c.contentLang)}"${c.contentLang !== lang ? ` lang="${e(c.contentLang)}"` : ""}>
${status(c)}
${body.join("\n")}
</div>`;
}
