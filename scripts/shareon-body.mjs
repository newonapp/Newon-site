/**
 * SHAREON pages — section HTML.
 *
 *   <section id="lifestage-detail" class="nls" data-story="shareon">   shared dark "film" first screen
 *                                                                       (/home-lifestage*.css + /home-lifestage.js)
 *   <nav class="fsn" data-biz="shareon">                                shared five-menu bar (scripts/flagship-subnav.mjs)
 *   <div id="shareon-detail" class="nsh">                               body sections (/shareon.css, /shareon.js)
 *
 * One topic per page. The Overview tells the brand story (why, gap, mission, journey, people, principles, where we
 * are, place in NEWON) and ends with a small strip to the other four pages; services, business areas, partner types
 * and inquiry types live only on their own pages.
 *
 * Body language: white/black Life Stage look (thin lines, generous whitespace, big headings, small uppercase labels)
 * with SHAREON purple only as a point colour. Neighbouring sections never reuse the same layout.
 * Information only: every action is a link to another page, the NEWON inquiry form or the official email.
 * Everything works without JS (FAQ uses <details>); shareon.js only adds the active state of the sticky index.
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
  return `mailto:newon@newon.app?subject=${encodeURIComponent(`${c.contact.types.mailSubjectPrefix} ${title}`)}`;
}

/* ───────── small building blocks ───────── */

function badge(c, key) {
  if (!key) return "";
  return `<span class="nsh-badge nsh-badge--${e(key)}"><span class="nsh-badge__dot" aria-hidden="true"></span><span class="nsh-vh">${e(c.statusLabel)}: </span>${e(
    c.status[key]
  )}</span>`;
}

function head(id, kicker, title, lead, { extra = "", cls = "" } = {}) {
  return `<header class="nsh-head${cls ? ` ${cls}` : ""}">
      ${kicker ? `<p class="nsh-kicker" lang="en">${e(kicker)}</p>` : ""}
      <h2 class="nsh-title" id="nsh-${e(id)}-t">${nl(title)}</h2>
      ${lead ? `<p class="nsh-lead">${e(lead)}</p>` : ""}${extra}
    </header>`;
}

/** One body section. `mod` picks the background: "" (white, thin top rule) · "band" (purple tint) · "ink" (black). */
function sec(id, inner, mod = "") {
  return `<section class="nsh-sec${mod ? ` nsh-sec--${mod}` : ""}" id="nsh-${e(id)}" aria-labelledby="nsh-${e(id)}-t">
    <div class="nsh-wrap">${inner}</div>
  </section>`;
}

function chips(items, cls = "", label = "") {
  if (!items || !items.length) return "";
  return `<ul class="nsh-chips${cls ? ` ${cls}` : ""}" role="list"${label ? ` aria-label="${e(label)}"` : ""}>${items.map((t) => `<li>${e(t)}</li>`).join("")}</ul>`;
}

function btn(href, label, kind = "") {
  return `<a class="nsh-btn${kind ? ` nsh-btn--${kind}` : ""}" href="${e(href)}">${e(label)}${kind === "primary" ? ' <span aria-hidden="true">→</span>' : ""}</a>`;
}

function link(href, label, hidden = "") {
  return `<a class="nsh-link" href="${e(href)}">${e(label)}${hidden ? `<span class="nsh-vh"> — ${e(hidden)}</span>` : ""} <span aria-hidden="true">→</span></a>`;
}

function note(c, text) {
  return text ? `<p class="nsh-consider"><strong>${e(c.considerLabel)}</strong>${e(text)}</p>` : "";
}

const CHECK_SVG = `<svg class="nsh-checks__ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M3 3h18v18H3z" fill="none" stroke="#7771E8" stroke-width="1.6"/><path d="m7.5 12.5 3 3 6-7" fill="none" stroke="#554CC8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ───────── first screen: shared film hero ───────── */

function hero(c, lang, id, h, main, sub) {
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
        <h1 id="nsh-hero-t" class="nls-film__slogan"${heroLang ? ` lang="${e(heroLang)}"` : ""}>${nl(h.title)}</h1>
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

/** Thin status strip directly under the menu bar: pilot note + the status keys used on this page. */
function status(c, keys) {
  return `<div class="nsh-wrap nsh-status">
    <p class="nsh-status__note"><span class="nsh-status__pilot" lang="en">Pilot</span>${e(c.statusNote)}</p>
    ${keys.length ? `<ul class="nsh-status__legend" role="list" aria-label="${e(c.statusLabel)}">${keys.map((k) => `<li>${badge(c, k)}</li>`).join("")}</ul>` : ""}
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

/* ───────── shared layouts ───────── */

/** Split: sticky heading left, thin numbered rows right. */
function split(id, kicker, title, lead, rows, { mod = "" } = {}) {
  return sec(
    id,
    `<div class="nsh-split">
      ${head(id, kicker, title, lead, { cls: "nsh-head--side" })}
      <ol class="nsh-rows" role="list">${rows
        .map(
          (r, i) => `<li class="nsh-rows__item"><span class="nsh-rows__n" aria-hidden="true">${pad(i)}</span><div>${
            r.title ? `<h3 class="nsh-rows__title">${e(r.title)}</h3>` : ""
          }<p class="nsh-rows__body">${e(r.body)}</p></div></li>`
        )
        .join("")}</ol>
    </div>`,
    mod
  );
}

/**
 * Comparison table. `cols` = [[key, label], …]; the first column is the row header.
 * On phones each row becomes a block and every cell shows its column label (data-label).
 */
function xtable(id, cols, rows, { cls = "", cell = null } = {}) {
  const [first, ...rest] = cols;
  return `<div class="nsh-xt-wrap${cls ? ` ${cls}` : ""}" role="region" aria-labelledby="nsh-${e(id)}-t" tabindex="0">
      <table class="nsh-xt">
        <thead><tr>${cols.map(([, label]) => `<th scope="col">${e(label)}</th>`).join("")}</tr></thead>
        <tbody>${rows
          .map(
            (r) => `<tr><th scope="row">${cell ? cell(first[0], r) : e(r[first[0]])}</th>${rest
              .map(([k, label]) => `<td data-label="${e(label)}">${cell ? cell(k, r) : e(r[k])}</td>`)
              .join("")}</tr>`
          )
          .join("")}</tbody>
      </table>
    </div>`;
}

/** FAQ accordion on native <details>. */
function faq(id, f, mod = "") {
  return sec(
    id,
    `<div class="nsh-faq">
      ${head(id, f.kicker, f.title, "", { cls: "nsh-head--side" })}
      <div class="nsh-faq__list">${f.items
        .map(
          (it, i) => `<details class="nsh-faq__item"${i === 0 ? " open" : ""}>
          <summary><span class="nsh-faq__n" aria-hidden="true">Q${i + 1}</span><span class="nsh-faq__q">${e(it.q)}</span><span class="nsh-faq__mark" aria-hidden="true"></span></summary>
          <p class="nsh-faq__a">${e(it.a)}</p>
        </details>`
        )
        .join("")}</div>
    </div>`,
    mod
  );
}

/** Two contrasting columns (direct vs partnership, can vs cannot). */
function cols(c2) {
  return `<div class="nsh-cols">${c2
    .map(
      (col, i) => `<div class="nsh-cols__col${i === 1 ? " is-alt" : ""}">
        ${col.k ? `<p class="nsh-cols__k" lang="en">${e(col.k)}</p>` : ""}
        <h3 class="nsh-cols__title">${e(col.title)}</h3>
        <ul class="nsh-cols__list" role="list">${col.items.map((t) => `<li>${e(t)}</li>`).join("")}</ul>
      </div>`
    )
    .join("")}</div>`;
}

/* ───────── 01 Overview — brand story ───────── */

/* Original diagram: BABYLOG and LIVON flow into SHAREON; the other NEWON apps sit around it. */
function ecoSvg(o) {
  return `<svg class="nsh-eco__svg" viewBox="0 0 420 320" aria-hidden="true" focusable="false">
  <circle cx="210" cy="160" r="128" fill="none" stroke="#e2e0f7" stroke-width="1.5" stroke-dasharray="3 7"/>
  <path d="M86 78 C140 92 160 120 178 138" fill="none" stroke="#7771E8" stroke-width="2.5" stroke-linecap="round"/>
  <path d="m170 128 10 12-15 2" fill="none" stroke="#7771E8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M86 242 C140 228 160 200 178 182" fill="none" stroke="#7771E8" stroke-width="2.5" stroke-linecap="round"/>
  <path d="m165 178 15 2-10 12" fill="none" stroke="#7771E8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M334 78 C290 96 270 120 252 140M334 242 C290 224 270 200 252 180M352 160h-74" fill="none" stroke="#cfcfd6" stroke-width="1.5" stroke-dasharray="4 6"/>
  <circle cx="210" cy="160" r="54" fill="#7771E8"/>
  <text x="210" y="157" text-anchor="middle" font-size="15" font-weight="700" fill="#fff" letter-spacing="1.2">SHAREON</text>
  <text x="210" y="177" text-anchor="middle" font-size="11.5" fill="#f0eeff">${e(o.center)}</text>
  <g font-size="12" font-weight="700" letter-spacing="1">
    <rect x="18" y="58" width="92" height="30" rx="15" fill="#fff" stroke="#7771E8" stroke-width="1.5"/><text x="64" y="78" text-anchor="middle" fill="#554CC8">BABYLOG</text>
    <rect x="18" y="232" width="92" height="30" rx="15" fill="#fff" stroke="#7771E8" stroke-width="1.5"/><text x="64" y="252" text-anchor="middle" fill="#554CC8">LIVON</text>
    <rect x="300" y="58" width="102" height="30" rx="15" fill="#fff" stroke="#cfcfd6" stroke-width="1.5"/><text x="351" y="78" text-anchor="middle" fill="#525252">MY WORLD</text>
    <rect x="318" y="145" width="84" height="30" rx="15" fill="#fff" stroke="#cfcfd6" stroke-width="1.5"/><text x="360" y="165" text-anchor="middle" fill="#525252">PETLOG</text>
    <rect x="310" y="232" width="84" height="30" rx="15" fill="#fff" stroke="#cfcfd6" stroke-width="1.5"/><text x="352" y="252" text-anchor="middle" fill="#525252">ONGIL</text>
  </g>
</svg>`;
}

function overview(c, lang) {
  const o = c.overview;

  /* 1 · editorial statement */
  const why = sec(
    "why",
    `<div class="nsh-statement">
      <p class="nsh-kicker" lang="en">${e(o.why.kicker)}</p>
      <h2 class="nsh-statement__title" id="nsh-why-t">${nl(o.why.title)}</h2>
      <div class="nsh-statement__body">${o.why.body.map((p) => `<p>${e(p)}</p>`).join("")}</div>
    </div>`
  );

  /* 2 · the gap — sticky heading + numbered rows */
  const gap = split("gap", o.gap.kicker, o.gap.title, o.gap.lead, o.gap.rows);

  /* 3 · mission & vision — two big statements on the band */
  const m = o.mission;
  const mission = sec(
    "mission",
    `<h2 class="nsh-vh" id="nsh-mission-t">${e(m.kicker)}</h2>
    <div class="nsh-mv">${m.items
      .map(
        (it) => `<div class="nsh-mv__item"><p class="nsh-mv__k" lang="en">${e(it.k)}</p><h3 class="nsh-mv__title">${nl(it.title)}</h3><p class="nsh-mv__body">${e(
          it.body
        )}</p></div>`
      )
      .join("")}</div>
    <p class="nsh-mv__line"><span aria-hidden="true">“</span>${e(m.line)}<span aria-hidden="true">”</span></p>`,
    "band"
  );

  /* 4 · two-lane horizontal journey */
  const j = o.journey;
  const journey = sec(
    "journey",
    `${head("journey", j.kicker, j.title, j.lead)}
    <p class="nsh-lanes__legend" aria-hidden="true"><span class="is-a">${e(j.laneA)}</span><span class="is-b">${e(j.laneB)}</span></p>
    <ol class="nsh-lanes" role="list">${j.steps
      .map(
        (s, i) => `<li class="nsh-lanes__step">
        <p class="nsh-lanes__n"><span aria-hidden="true">${pad(i)}</span> <span lang="en">${e(s.en)}</span></p>
        <div class="nsh-lanes__card is-a"><p class="nsh-lanes__who">${e(j.laneA)}</p><h3 class="nsh-lanes__title">${e(s.a.title)}</h3><p class="nsh-lanes__body">${e(s.a.body)}</p></div>
        <div class="nsh-lanes__card is-b"><p class="nsh-lanes__who">${e(j.laneB)}</p><h3 class="nsh-lanes__title">${e(s.b.title)}</h3><p class="nsh-lanes__body">${e(s.b.body)}</p></div>
      </li>`
      )
      .join("")}</ol>`
  );

  /* 5 · people — four wide columns with big index */
  const p = o.people;
  const people = sec(
    "people",
    `${head("people", p.kicker, p.title, p.lead)}
    <ul class="nsh-people" role="list">${p.items
      .map(
        (it, i) => `<li class="nsh-people__item"><span class="nsh-people__n" aria-hidden="true">${pad(i)}</span><p class="nsh-people__en" lang="en">${e(
          it.en
        )}</p><h3 class="nsh-people__title">${e(it.title)}</h3><p class="nsh-people__body">${e(it.body)}</p></li>`
      )
      .join("")}</ul>`
  );

  /* 6 · principles checklist on ink */
  const pr = o.principles;
  const principles = sec(
    "principles",
    `${head("principles", pr.kicker, pr.title, pr.lead)}
    <ol class="nsh-princ" role="list">${pr.items
      .map(
        (it, i) => `<li class="nsh-princ__item"><span class="nsh-princ__n" aria-hidden="true">${pad(i)}</span><svg class="nsh-princ__ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><h3 class="nsh-princ__title">${e(
          it.title
        )}</h3><p class="nsh-princ__body">${e(it.body)}</p></li>`
      )
      .join("")}</ol>`,
    "ink"
  );

  /* 7 · where we are — honest now / next table */
  const n = o.now;
  const now = sec(
    "now",
    `${head("now", n.kicker, n.title, n.lead)}
    ${xtable("now", [["item", n.head.item], ["now", n.head.now], ["next", n.head.next]], n.rows, { cls: "nsh-xt-wrap--now" })}`
  );

  /* 8 · inside NEWON — split text / diagram */
  const w = o.newon;
  const newon = sec(
    "newon",
    `<div class="nsh-eco">
      <div class="nsh-eco__text">
        ${head("newon", w.kicker, w.title, w.lead, { cls: "nsh-head--side" })}
        <ul class="nsh-eco__list" role="list">${w.items
          .map(
            (it) => `<li class="nsh-eco__item${it.flow ? " is-flow" : ""}"><h3 class="nsh-eco__name" lang="en">${
              it.link ? `<a href="/${e(lang)}/${e(it.link)}/">${e(it.name)} <span aria-hidden="true">→</span></a>` : e(it.name)
            }</h3><p class="nsh-eco__body">${e(it.body)}</p></li>`
          )
          .join("")}</ul>
      </div>
      <div class="nsh-eco__art">${ecoSvg(w)}</div>
    </div>`,
    "band"
  );

  /* 9 · small strip to the other four pages */
  const pg = o.pages;
  const pages = sec(
    "pages",
    `<div class="nsh-pages">
      ${head("pages", pg.kicker, pg.title, "", { cls: "nsh-head--side" })}
      <ul class="nsh-pages__list" role="list">${pg.items
        .map((it) => {
          const s = c.subnav.find((x) => x.id === it.id);
          return `<li><a class="nsh-pages__link" href="${e(pageHref(lang, it.id))}"><span class="nsh-pages__n" aria-hidden="true">${e(s.n)}</span><span class="nsh-pages__en" lang="en">${e(
            s.en
          )}</span><span class="nsh-pages__label">${e(s.label)}</span><span class="nsh-pages__body">${e(it.body)}</span><span class="nsh-pages__arrow" aria-hidden="true">→</span></a></li>`;
        })
        .join("")}</ul>
    </div>`,
    "ink"
  );

  return {
    hero: hero(c, lang, "overview", o.hero, pageHref(lang, "platform"), pageHref(lang, "contact")),
    keys: [],
    body: [why, gap, mission, journey, people, principles, now, newon, pages],
  };
}

/* ───────── 02 Platform ───────── */

function svcMeta(s) {
  return `<p class="nsh-svc__meta"><span class="nsh-svc__n" aria-hidden="true">${e(s.n)}</span><span lang="en">${e(s.en)}</span></p>`;
}

function platform(c, lang) {
  const p = c.platform;
  const G = Object.fromEntries(p.groups.map((g) => [g.id, g]));
  const S = (gid) => p.services.filter((s) => s.g === gid);
  const areas = (s, cls = "") => chips(s.areas, cls, `${s.title} — ${c.areasLabel}`);

  /* index — grouped chip cloud with anchors */
  const index = sec(
    "index",
    `${head("index", p.indexKicker, p.indexTitle, p.indexLead)}
    <div class="nsh-cloud nsh-cloud--4">${p.groups
      .map(
        (g) => `<div class="nsh-cloud__group"><p class="nsh-cloud__k" lang="en">${e(g.kicker)}</p><p class="nsh-cloud__t">${e(g.title)}</p><ul class="nsh-cloud__list" role="list">${S(g.id)
          .map((s) => `<li><a href="#svc-${e(s.n)}"><span aria-hidden="true">${e(s.n)}</span>${e(s.title)}</a></li>`)
          .join("")}</ul></div>`
      )
      .join("")}</div>`
  );

  /* A — numbered list rows with tags */
  const a = sec(
    "grp-a",
    `${head("grp-a", G.a.kicker, G.a.title, G.a.lead)}
    <div class="nsh-svcrows">${S("a")
      .map(
        (s) => `<article class="nsh-svcrows__row" id="svc-${e(s.n)}" aria-labelledby="svc-${e(s.n)}-t">
          <div class="nsh-svcrows__id"><span class="nsh-svcrows__ico">${icon(s.icon)}</span>${svcMeta(s)}</div>
          <div class="nsh-svcrows__main"><h3 class="nsh-svc__title" id="svc-${e(s.n)}-t">${e(s.title)}</h3><p class="nsh-svcrows__body">${e(s.body)}</p>${note(c, s.note)}</div>
          <div class="nsh-svcrows__side">${badge(c, s.status)}<p class="nsh-svcrows__k">${e(c.areasLabel)}</p>${areas(s, "nsh-chips--sm")}</div>
        </article>`
      )
      .join("")}</div>`
  );

  /* B — 2 × 2 large cards on the band */
  const b = sec(
    "grp-b",
    `${head("grp-b", G.b.kicker, G.b.title, G.b.lead)}
    <div class="nsh-quad">${S("b")
      .map(
        (s) => `<article class="nsh-quad__item" id="svc-${e(s.n)}" aria-labelledby="svc-${e(s.n)}-t">
          <div class="nsh-quad__top"><span class="nsh-quad__ico">${icon(s.icon)}</span>${badge(c, s.status)}</div>
          ${svcMeta(s)}
          <h3 class="nsh-quad__title" id="svc-${e(s.n)}-t">${e(s.title)}</h3>
          <p class="nsh-quad__body">${e(s.body)}</p>
          ${areas(s)}
          ${note(c, s.note)}
        </article>`
      )
      .join("")}</div>`,
    "band"
  );

  /* C — vertical process stepper */
  const cc = sec(
    "grp-c",
    `<div class="nsh-split">
      ${head("grp-c", G.c.kicker, G.c.title, G.c.lead, { cls: "nsh-head--side" })}
      <ol class="nsh-stepper" role="list">${S("c")
        .map(
          (s, i) => `<li class="nsh-stepper__item" id="svc-${e(s.n)}">
          <span class="nsh-stepper__dot" aria-hidden="true">${pad(i)}</span>
          <div class="nsh-stepper__body">
            <div class="nsh-stepper__top">${svcMeta(s)}${badge(c, s.status)}</div>
            <h3 class="nsh-svc__title">${e(s.title)}</h3>
            <p class="nsh-stepper__text">${e(s.body)}</p>
            ${areas(s, "nsh-chips--sm")}
            ${note(c, s.note)}
          </div>
        </li>`
        )
        .join("")}</ol>
    </div>`
  );

  /* D — app visual (five tabs) + trust / used goods / app rows */
  const phone = `<div class="nsh-phone" aria-hidden="true">
      <div class="nsh-phone__screen">
        <span class="nsh-phone__bar"></span><span class="nsh-phone__bar is-short"></span>
        <span class="nsh-phone__grid"><i></i><i></i><i></i><i></i></span>
        <span class="nsh-phone__bar is-soft"></span>
      </div>
      <ul class="nsh-phone__tabs">${p.tabs.map((t, i) => `<li${i === 0 ? ' class="is-on"' : ""}><i></i>${e(t.k)}</li>`).join("")}</ul>
    </div>`;
  const d = sec(
    "grp-d",
    `<div class="nsh-app">
      <div class="nsh-app__art">${phone}
        <dl class="nsh-app__tabs">${p.tabs.map((t) => `<div><dt>${e(t.k)}</dt><dd>${e(t.body)}</dd></div>`).join("")}</dl>
      </div>
      <div class="nsh-app__text">
        ${head("grp-d", G.d.kicker, G.d.title, G.d.lead)}
        <div class="nsh-app__list">${S("d")
          .map(
            (s) => `<article class="nsh-app__item" id="svc-${e(s.n)}" aria-labelledby="svc-${e(s.n)}-t">
            <div class="nsh-app__top">${svcMeta(s)}${badge(c, s.status)}</div>
            <h3 class="nsh-svc__title" id="svc-${e(s.n)}-t">${e(s.title)}</h3>
            <p class="nsh-app__body">${e(s.body)}</p>
            ${areas(s, "nsh-chips--sm")}
            ${note(c, s.note)}
          </article>`
          )
          .join("")}</div>
      </div>
    </div>`
  );

  /* first launch — compare table */
  const l = p.launch;
  const launch = sec(
    "launch",
    `${head("launch", l.kicker, l.title, l.lead)}
    ${xtable("launch", [["item", l.head.item], ["first", l.head.first], ["later", l.head.later]], l.rows, { cls: "nsh-xt-wrap--launch" })}`,
    "band"
  );

  return {
    hero: hero(c, lang, "platform", p.hero, pageHref(lang, "business"), pageHref(lang, "contact")),
    keys: ["dev", "prep", "long"],
    body: [
      index,
      a,
      b,
      cc,
      d,
      launch,
      faq("faq", p.faq),
      closing("next", p.next, [
        [pageHref(lang, "business"), p.next.ctas[0]],
        [pageHref(lang, "partnerships"), p.next.ctas[1]],
      ]),
    ],
  };
}

/* ───────── 03 Business ───────── */

function matrix(c, items) {
  const m = c.matrix;
  const by = Object.fromEntries(items.map((it) => [it.en, it]));
  const cell = (it) =>
    `<li class="nsh-matrix__cell"><p class="nsh-matrix__code" lang="en">${e(it.en)}</p><h3 class="nsh-matrix__title">${e(it.title)}</h3><p class="nsh-matrix__body">${e(it.body)}</p></li>`;
  return `<div class="nsh-matrix">
      <p class="nsh-matrix__axis nsh-matrix__axis--x" aria-hidden="true"><span>${e(m.renter)} →</span><span>${e(m.person)}</span><span>${e(m.business)}</span></p>
      <p class="nsh-matrix__axis nsh-matrix__axis--y" aria-hidden="true"><span>${e(m.provider)} ↓</span><span>${e(m.person)}</span><span>${e(m.business)}</span></p>
      <ul class="nsh-matrix__grid" role="list">${cell(by.C2C)}${cell(by.C2B)}${cell(by.B2C)}${cell(by.B2B)}</ul>
    </div>`;
}

function business(c, lang) {
  const b = c.business;

  const structure = sec("structure", `${head("structure", b.structure.kicker, b.structure.title, b.structure.lead)}${matrix(c, b.structure.items)}`);

  /* 14 areas — grouped bands with a sticky index */
  const ar = b.areas;
  const L = ar.labels;
  const areas = sec(
    "areas",
    `${head("areas", ar.kicker, ar.title, ar.lead)}
    <div class="nsh-groups" data-nsh-groups>
      <nav class="nsh-groups__nav" aria-label="${e(ar.kicker)}">
        <ol role="list">${ar.groups
          .map(
            (g) => `<li><a href="#grp-${e(g.id)}" data-nsh-group-link="${e(g.id)}"><span aria-hidden="true">${e(g.n)}</span>${e(g.title)}<em>${ar.items.filter((it) => it.g === g.id).length}</em></a></li>`
          )
          .join("")}</ol>
      </nav>
      <div class="nsh-groups__body">${ar.groups
        .map((g) => {
          const items = ar.items.filter((it) => it.g === g.id);
          return `<section class="nsh-group" id="grp-${e(g.id)}" aria-labelledby="grp-${e(g.id)}-t" data-nsh-group="${e(g.id)}">
          <header class="nsh-group__head"><span class="nsh-group__n" aria-hidden="true">${e(g.n)}</span><div><p class="nsh-group__en" lang="en">${e(g.en)}</p><h3 class="nsh-group__title" id="grp-${e(
            g.id
          )}-t">${e(g.title)}</h3><p class="nsh-group__body">${e(g.body)}</p></div></header>
          <ul class="nsh-area" role="list">${items
            .map(
              (it) => `<li class="nsh-area__item">
              <div class="nsh-area__name"><span class="nsh-area__ico">${icon(it.icon)}</span><div><p class="nsh-area__en"><span aria-hidden="true">${e(it.n)} · </span><span lang="en">${e(
                it.en
              )}</span></p><h4 class="nsh-area__title">${e(it.title)}</h4></div>${badge(c, it.status)}</div>
              <p class="nsh-area__body">${e(it.body)}</p>
              <dl class="nsh-area__dl">
                <div><dt>${e(L.targets)}</dt><dd>${chips(it.targets, "nsh-chips--sm")}</dd></div>
                <div><dt>${e(L.customer)}</dt><dd>${e(it.customer)}</dd></div>
                <div><dt>${e(L.revenue)}</dt><dd>${e(it.revenue)}</dd></div>
              </dl>
            </li>`
            )
            .join("")}</ul>
        </section>`;
        })
        .join("")}</div>
    </div>`,
    "band"
  );

  /* business models table */
  const md = b.models;
  const H = md.head;
  const models = sec(
    "models",
    `${head("models", md.kicker, md.title, md.lead)}
    ${xtable(
      "models",
      [["code", H.model], ["flow", H.flow], ["example", H.example], ["revenue", H.revenue], ["status", H.status]],
      md.rows,
      {
        cls: "nsh-xt-wrap--models",
        cell: (k, r) => (k === "code" ? `<span class="nsh-xt__code" lang="en">${e(r.code)}</span>` : k === "status" ? badge(c, r.status) : e(r[k])),
      }
    )}`
  );

  /* revenue — editorial paragraphs + caveats */
  const rv = b.revenue;
  const revenue = sec(
    "revenue",
    `<div class="nsh-edit">
      ${head("revenue", rv.kicker, rv.title, "", { cls: "nsh-head--side" })}
      <div class="nsh-edit__body">${rv.paras.map((t, i) => `<p${i === 0 ? ' class="is-first"' : ""}>${e(t)}</p>`).join("")}
        <div class="nsh-caveats">
          <h3 class="nsh-caveats__title">${e(rv.caveatsTitle)}</h3>
          <ol class="nsh-caveats__list" role="list">${rv.caveats.map((t, i) => `<li><span aria-hidden="true">${pad(i)}</span>${e(t)}</li>`).join("")}</ol>
        </div>
      </div>
    </div>`
  );

  /* roadmap — vertical timeline on the band */
  const rm = b.roadmap;
  const roadmap = sec(
    "roadmap",
    `<div class="nsh-split">
      ${head("roadmap", rm.kicker, rm.title, rm.lead, { cls: "nsh-head--side", extra: `<p class="nsh-now"><span class="nsh-now__dot" aria-hidden="true"></span>${e(rm.now)}</p>` })}
      <ol class="nsh-timeline" role="list">${rm.steps
        .map(
          (st, i) => `<li class="nsh-timeline__item${i === 0 ? " is-now" : ""}"><span class="nsh-timeline__dot" aria-hidden="true"></span><p class="nsh-timeline__n" lang="en">STEP ${e(
            st.n
          )}</p><h3 class="nsh-timeline__title">${e(st.title)}${st.tag ? ` <span class="nsh-tag">${e(st.tag)}</span>` : ""}</h3><p class="nsh-timeline__body">${e(st.body)}</p></li>`
        )
        .join("")}</ol>
    </div>`,
    "band"
  );

  /* focus — two-tone statement cards */
  const fx = b.focus;
  const focus = sec(
    "focus",
    `${head("focus", fx.kicker, fx.title, fx.lead)}
    <ol class="nsh-statements" role="list">${fx.points
      .map(
        (pt) => `<li class="nsh-statements__item"><span class="nsh-statements__n" aria-hidden="true">${e(pt.n)}</span><h3 class="nsh-statements__title">${e(pt.title)}</h3><p class="nsh-statements__body">${e(
          pt.body
        )}</p></li>`
      )
      .join("")}</ol>`
  );

  return {
    hero: hero(c, lang, "business", b.hero, pageHref(lang, "partnerships"), inquiryHref(lang, "business")),
    keys: ["dev", "prep", "long"],
    body: [
      structure,
      areas,
      models,
      revenue,
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

  const open = sec("open", `${head("open", p.open.kicker, p.open.title, p.open.lead)}${cols(p.open.cols)}`);

  const why = split("why", p.why.kicker, p.why.title, p.why.lead, p.why.rows, { mod: "band" });

  const types = sec(
    "types",
    `<div class="nsh-dir__head">${head("types", t.kicker, t.title, "")}<p class="nsh-notice"><span class="nsh-notice__k" aria-hidden="true">!</span>${e(p.notice)}</p></div>
    <ol class="nsh-dir" role="list">
      <li class="nsh-dir__row nsh-dir__row--head" aria-hidden="true"><span></span><span></span><span>${e(t.labels.collab)}</span><span>${e(t.labels.value)}</span><span>${e(
        t.labels.terms
      )}</span><span>${e(t.labels.status)}</span></li>
      ${t.items
        .map(
          (it) => `<li class="nsh-dir__row">
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
          <div><dt>${e(t.labels.status)}</dt><dd>${badge(c, "review")}</dd></div>
        </dl>
      </li>`
        )
        .join("")}
    </ol>`
  );

  /* principles — big numbered editorial lines on ink */
  const pc = p.principles;
  const principles = sec(
    "principles",
    `<div class="nsh-split">
      ${head("principles", pc.kicker, pc.title, "", { cls: "nsh-head--side" })}
      <ol class="nsh-lines" role="list">${pc.items.map((it, i) => `<li><span class="nsh-lines__n" aria-hidden="true">${pad(i)}</span><p>${e(it)}</p></li>`).join("")}</ol>
    </div>`,
    "ink"
  );

  const pr = p.process;
  const process = sec(
    "process",
    `${head("process", pr.kicker, pr.title, pr.lead)}
    <ol class="nsh-steps" role="list">${pr.steps
      .map(
        (s, i) => `<li class="nsh-steps__item"><span class="nsh-steps__box" aria-hidden="true">${e(s.n)}</span><h3 class="nsh-steps__title">${e(s.title)}</h3><p class="nsh-steps__body">${e(
          s.body
        )}</p>${i < pr.steps.length - 1 ? '<span class="nsh-steps__arrow" aria-hidden="true">→</span>' : ""}</li>`
      )
      .join("")}</ol>`
  );

  return {
    hero: hero(c, lang, "partnerships", p.hero, inquiryHref(lang, "partnership"), pageHref(lang, "business")),
    keys: ["review"],
    body: [
      open,
      why,
      types,
      principles,
      process,
      faq("faq", p.faq, "band"),
      closing("next", p.next, [
        [inquiryHref(lang, "partnership"), p.next.ctas[0]],
        [pageHref(lang, "overview"), p.next.ctas[1]],
      ]),
    ],
  };
}

/* ───────── 05 Contact ───────── */

function contact(c, lang) {
  const k = c.contact;
  const ty = k.types;

  /* inquiry types — table with form / email links */
  const types = sec(
    "types",
    `${head("types", ty.kicker, ty.title, ty.lead)}
    ${xtable("types", [["title", ty.head.type], ["body", ty.head.about], ["channel", ty.head.channel]], ty.items, {
      cls: "nsh-xt-wrap--inq",
      cell: (key, it) =>
        key === "title"
          ? `<span class="nsh-inq__name"><span class="nsh-inq__n" aria-hidden="true">${e(it.n)}</span><span class="nsh-inq__ico">${icon(it.icon)}</span>${e(it.title)}</span>`
          : key === "channel"
          ? `<span class="nsh-inq__acts"><a class="nsh-inq__form" href="${e(inquiryHref(lang, it.slug))}">${e(ty.formCta)}<span class="nsh-vh"> — ${e(it.title)}</span> <span aria-hidden="true">→</span></a><a class="nsh-inq__mail" href="${e(
              mailHref(c, it.title)
            )}">${e(ty.mailCta)}<span class="nsh-vh"> — ${e(it.title)}</span></a></span>`
          : e(it[key]),
    })}`
  );

  /* official channel — split card */
  const ch = k.channel;
  const channel = sec(
    "channel",
    `<div class="nsh-channel">
      ${head("channel", ch.kicker, ch.title, ch.lead, { cls: "nsh-head--side" })}
      <dl class="nsh-channel__dl">${ch.rows
        .map(
          (r) => `<div class="nsh-channel__row${r.mail ? " is-mail" : ""}"><dt>${e(r.k)}</dt><dd>${
            r.mail
              ? `<a href="${e(mailHref(c, "SHAREON"))}">${e(r.v)}</a>`
              : r.form
              ? `<a href="${e(inquiryHref(lang, "general"))}">${e(r.v)} <span aria-hidden="true">→</span></a>`
              : e(r.v)
          }</dd></div>`
        )
        .join("")}</dl>
    </div>`
  );

  /* notes — checklist on the band */
  const g = k.guide;
  const guide = sec(
    "guide",
    `<div class="nsh-split">
      ${head("guide", g.kicker, g.title, "", {
        cls: "nsh-head--side",
        extra: `<p class="nsh-more"><a class="nsh-link" href="/${e(lang)}/privacy/">${e(g.privacy)} <span aria-hidden="true">→</span></a></p>`,
      })}
      <ul class="nsh-checks" role="list">${g.items.map((t) => `<li class="nsh-checks__item">${CHECK_SVG}<p>${e(t)}</p></li>`).join("")}</ul>
    </div>`,
    "band"
  );

  /* scope — can / cannot */
  const sc = k.scope;
  const scope = sec("scope", `${head("scope", sc.kicker, sc.title, "")}${cols([sc.can, sc.cannot])}`);

  return {
    hero: hero(c, lang, "contact", k.hero, inquiryHref(lang, "general"), mailHref(c, "SHAREON")),
    keys: [],
    body: [
      types,
      channel,
      guide,
      scope,
      closing(
        "next",
        k.close,
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
  const { hero: first, body, keys } = RENDER[id](c, lang);
  return `${first}
${renderFlagshipSubnav({ biz: "shareon", lang, active: id })}
<div id="shareon-detail" class="nsh" data-shareon-page="${e(id)}" data-content-lang="${e(c.contentLang)}"${c.contentLang !== lang ? ` lang="${e(c.contentLang)}"` : ""}>
${status(c, keys)}
${body.join("\n")}
</div>`;
}
