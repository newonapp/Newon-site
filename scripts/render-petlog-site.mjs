#!/usr/bin/env node
/**
 * PETLOG business website — /{lang}/petlog/{,platform/,business/,partnerships/,contact/} for all locales.
 *
 * Design: the existing LivOn Life Stage page (/lifestage/) — same shell, same #lifestage-detail.nls
 * components (film hero, roster, journey rail, flow/board/signal/index/dir/pipe lists, ink close) and the same
 * home-lifestage.css / home-lifestage-layout.css / home-lifestage.js. The PETLOG green is used only for the
 * small kicker labels and status tags (scoped .nls--petlog rules below). The Contact form is the shared Newon
 * inquiry form (render-bsp.mjs → business/inquiry.js → FormSubmit).
 * No app feature (records, booking, orders, payment, sign-in, seller sign-up, posting) is built on the web.
 * Copy: scripts/petlog-site-content.mjs (ko + en; other locales show the English body, like the rest of the site).
 * V2: no per-card status badge (owner brief PART 04) — one shared notice per page in the existing .nls-note style.
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
import { renderGlobalHeader, renderStudioFooter } from "./site-chrome.mjs";
import { inquiryFormHtml } from "./render-bsp.mjs";
import { NOTICE, PETLOG_FILM, STORE, PETLOG_MENU, OVERVIEW, PLATFORM, BUSINESS, PARTNERS, CONTACT } from "./petlog-site-content.mjs";
import { renderFlagshipSubnav, FLAGSHIP_SUBNAV_CSS } from "./flagship-subnav.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20260924livon1";
const esc = escapeHtml;
const bl = (lang) => (lang === "ko" ? "ko" : "en");
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");
const pad2 = (n) => String(n).padStart(2, "0");
const rel = (depth, p) => (/^(https?:|mailto:|#|\/)/.test(p) ? p : "../".repeat(depth) + p);

/* PETLOG green (#278A53 brand; darker #1E6B41 for text contrast on white) — kicker labels and status tags only. */
const PETLOG_CSS = `<style>
  #lifestage-detail.nls--petlog .nls-kicker { color: #1e6b41; }
  #lifestage-detail.nls--petlog .nls-status { border-color: #278a53; color: #1e6b41; }
  #lifestage-detail.nls--petlog .nls-status[data-status="app"] { background: #278a53; border-color: #278a53; color: #fff; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-kicker,
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-status { color: #6fcf97; border-color: #6fcf97; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-status[data-status="app"] { background: #1e6b41 !important; border-color: #1e6b41; color: #fff; }
  #lifestage-detail.nls--petlog .nls-link { display: inline-block; margin-top: 0.9rem; font-weight: 600; text-decoration: underline; text-underline-offset: 0.2em; color: inherit; }
  #lifestage-detail.nls--petlog .nls-board__item .nls-status { margin: 0 0 0.6rem; }
  /* small additions built from the existing Life Stage tokens */
  #lifestage-detail.nls--petlog .nls-card__label { margin: 0 0 0.35rem; font-size: 0.72rem; font-weight: 650; letter-spacing: 0.1em; text-transform: uppercase; color: var(--nls-faint); }
  #lifestage-detail.nls--petlog article .nls-status { margin: 0 0 0.7rem; }
  #lifestage-detail.nls--petlog article .nls-points { margin: 0.85rem 0 0; padding: 0; list-style: none; display: grid; gap: 0.35rem; font-size: 0.86rem; line-height: 1.5; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog article .nls-points li { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 0.7rem; padding: 0.22rem 0; font-size: inherit; }
  #lifestage-detail.nls--petlog article .nls-points li::before { content: none; }
  #lifestage-detail.nls--petlog article .nls-points strong { min-width: 4.6rem; color: var(--nls-ink); font-weight: 650; }
  html:not([lang="ko"]) #lifestage-detail.nls--petlog article .nls-points strong { min-width: 6.8rem; }
  #lifestage-detail.nls--petlog article .nls-chips { margin-top: 0.85rem; }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .nls-signal--single { grid-template-columns: 1fr; }
    #lifestage-detail.nls--petlog .nls-board--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail--petlog { grid-template-columns: repeat(var(--petlog-rail-n, 7), minmax(0, 1fr)); }
  }
  #lifestage-detail.nls--petlog .nls-status { width: fit-content; max-width: 100%; }
  #lifestage-detail.nls--petlog .nls-board__item { padding: 1.25rem 1.25rem 1.35rem; }
  #lifestage-detail.nls--petlog .nls-subhead { margin: 2.6rem 0 1.4rem; }
  #lifestage-detail.nls--petlog .nls-subhead .nls-title { font-size: clamp(1.35rem, 2.4vw, 1.75rem); }
  #lifestage-detail.nls--petlog .nls-pipe__item .nls-pipe__n { color: var(--nls-ink); }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog article .nls-points strong { color: #f5f5f5; }
  html[data-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on,
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on { background: #fff !important; border-color: #fff; color: rgba(17, 17, 17, 0.6); }
  html[data-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on span,
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on span { color: #111; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on > * { color: #111 !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on > *,
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-status[data-status="app"] * { background: transparent !important; }
  /* the shared film fallback is the LIVON poster; PETLOG shows plain black until its film loads */
  #lifestage-detail.nls--petlog .nls-film__fallback { background: #050505; }
</style>`;

/* ---------------------------------------------------------------- shared blocks (Life Stage markup) */
function head(kicker, title, lead) {
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${esc(kicker)}</p>` : ""}
    <h2 class="nls-title">${nl(title)}</h2>
    ${lead ? `<p class="nls-lead">${esc(lead)}</p>` : ""}
  </header>`;
}
const chips = (items) => (items && items.length ? `<ul class="nls-chips">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "");
const note = (t) => (t ? `<p class="nls-note">${esc(t)}</p>` : "");
const ext = (h) => /^https?:/.test(h);

function hero({ wordmark, titleHtml, lead, main, sub }) {
  return `<div class="nls-film" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${esc(PETLOG_FILM)}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${esc(PETLOG_FILM)}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark" lang="en">${esc(wordmark)}</p>
        <h1 id="story-lifestage-title" class="nls-film__slogan">${titleHtml}</h1>
        <p class="nls-film__lead">${esc(lead)}</p>
        <div class="nls-film__actions">
          <a class="nls-btn" href="${esc(main[1])}"${main[1].startsWith("#") ? " data-nls-scroll" : ""}>${esc(main[0])}</a>
          <a class="nls-btn nls-btn--ghost" href="${esc(sub[1])}"${ext(sub[1]) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(sub[0])}</a>
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Card grid using one of the Life Stage card components.
 * kind: board (4 col) · flow (3 col) · signal (2 col) · proc (4 col, boxed numbers)
 * card: { n, label?, name, lead, points?: [k, v][], chips?, link?: [label, href] }
 */
function cardsHtml(kind, cards, lang, depth) {
  const inner = (c) => `${c.label ? `<p class="nls-card__label" lang="en">${esc(c.label)}</p>` : ""}
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.lead)}</p>
        ${c.points ? `<ul class="nls-points">${c.points.filter(([, v]) => v && v !== "—").map(([k, v]) => `<li><strong>${esc(k)}</strong> ${esc(v)}</li>`).join("")}</ul>` : ""}
        ${chips(c.chips)}
        ${c.link ? `<a class="nls-link" href="${esc(ext(c.link[1]) ? c.link[1] : rel(depth, c.link[1]))}"${ext(c.link[1]) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(c.link[0])} →</a>` : ""}`;
  const id = (c) => (c.anchor ? ` id="${esc(c.anchor)}"` : "");
  if (kind === "board")
    return `<div class="nls-board">${cards.map((c) => `<article class="nls-board__item"${id(c)}>
        <div class="nls-board__meta"><span class="nls-board__n">${esc(c.n)}</span></div>
        ${inner(c)}
      </article>`).join("")}</div>`;
  // "flow" = the board card in three columns (the Life Stage flow grid is six narrow columns on desktop)
  if (kind === "flow")
    return `<div class="nls-board nls-board--3">${cards.map((c) => `<article class="nls-board__item"${id(c)}>
        <div class="nls-board__meta"><span class="nls-board__n">${esc(c.n)}</span></div>
        ${inner(c)}
      </article>`).join("")}</div>`;
  if (kind === "proc")
    return `<div class="nls-proc">${cards.map((c) => `<article class="nls-proc__item"${id(c)}>
        <span class="nls-proc__n">${esc(c.n)}</span>
        ${inner(c)}
      </article>`).join("")}</div>`;
  return `<div class="nls-signal">${cards.map((c) => `<article class="nls-signal__item"${id(c)}>
        <span class="nls-signal__n">${esc(c.n)}</span>
        <div class="nls-signal__copy">${inner(c)}</div>
      </article>`).join("")}</div>`;
}

function section(id, { kicker, title, lead, noteText, band, body }) {
  return `<div id="${id}" class="nls-block${band ? " nls-block--band" : ""}" data-hs-section>
    ${head(kicker, title, lead)}
    ${note(noteText)}
    ${body}
  </div>`;
}

function rosterBlock(id, kicker, title, body) {
  const rows = body.map((p, i) => `<li><span>${pad2(i + 1)}</span><p>${esc(p)}</p></li>`).join("");
  return `<div id="${id}" class="nls-block nls-why-sec" data-hs-section>
    <div class="nls-split">
      ${head(kicker, title, "")}
      <ol class="nls-roster">${rows}</ol>
    </div>
  </div>`;
}

const indexList = (items) => `<ol class="nls-index">${items.map((t, i) => `<li><span>${pad2(i + 1)}</span><strong>${esc(t)}</strong></li>`).join("")}</ol>`;

function dirList(items, depth) {
  return `<ol class="nls-dir">${items
    .map((s) => `<li><span>${esc(s.n)}</span><div><strong>${s.href ? `<a href="${esc(rel(depth, s.href))}"${s.on ? ' aria-current="page"' : ""}>${esc(s.name)}</a>` : esc(s.name)}</strong>${s.body ? `<p>${esc(s.body)}</p>` : ""}</div></li>`)
    .join("")}</ol>`;
}

function splitDir(id, { kicker, title, lead, noteText, items, depth }) {
  return `<div id="${id}" class="nls-block nls-related-sec" data-hs-section>
    <div class="nls-split">
      <div>${head(kicker, title, lead)}${note(noteText)}</div>
      ${dirList(items, depth)}
    </div>
  </div>`;
}

/** Big-number rows (Life Stage "business expansion" lane). rows: [title, body][] */
const laneList = (rows) => `<div class="nls-lane">${rows.map(([t, d], i) => `<article class="nls-lane__item"><span class="nls-lane__n">${pad2(i + 1)}</span><div class="nls-lane__copy"><h3>${esc(t)}</h3><p>${esc(d)}</p></div></article>`).join("")}</div>`;

/** Big-number columns (Life Stage "how it works" pipe). cols: [big, title, body][] */
const pipeList = (cols) => `<div class="nls-pipe">${cols.map(([n, t, d], i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}"><p class="nls-pipe__n">${esc(n)}</p><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join("")}</div>`;

/** Tab rail + cards (Life Stage "life journey"). One rail per page (home-lifestage.js). */
function railBlock(id, { kicker, title, lead, noteText, items, ariaLabel }) {
  const rail = items
    .map((it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${esc(it.id)}" aria-pressed="${i === 0}"><em>${esc(it.n)}</em><span>${esc(it.tab)}</span></button>`)
    .join("");
  const cards = items
    .map(
      (it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${esc(it.id)}" data-scene="${esc(it.id)}">
        <div class="nls-decade__mark" aria-hidden="true"><b>${esc(it.mark)}</b><em>${esc(it.n)}</em></div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${esc(it.n)}</p>
          <p class="nls-decade__age" lang="en">${esc(it.label)}</p>
          <h3>${esc(it.name)}</h3>
          <p class="nls-decade__lead">${esc(it.lead)}</p>
          ${chips(it.chips)}
        </div>
      </article>`
    )
    .join("");
  return `<div id="${id}" class="nls-block nls-block--band nls-journey-sec" data-hs-section>
    ${head(kicker, title, lead)}
    <div class="nls-rail nls-rail--petlog" style="--petlog-rail-n:${items.length}" role="group" aria-label="${esc(ariaLabel || kicker)}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    ${note(noteText)}
  </div>`;
}

function menuBlock(lang, depth, active) {
  const items = PETLOG_MENU.map((m) => ({ n: m.n, name: `${m.name} · ${m[bl(lang)]}`, body: bl(lang) === "ko" ? m.koLead : m.enLead, href: m.href, on: m.id === active }));
  const label = lang === "ko" ? "PETLOG 메뉴" : "PETLOG MENU";
  return `<div id="nls-petlog-menu" class="nls-block nls-related-sec" data-hs-section>
    <div class="nls-split">
      <div>${head("PETLOG", label, "")}</div>
      <nav aria-label="${esc(label)}">${dirList(items, depth)}</nav>
    </div>
  </div>`;
}

function closeBlock(c, depth) {
  return `<div id="nls-close" class="nls-block nls-close nls-block--ink" data-hs-section>
    <p class="nls-kicker">${esc(c.kicker)}</p>
    <h2 class="nls-hero__title">${c.titleHtml}</h2>
    <p class="nls-lead">${esc(c.lead)}</p>
    <div class="nls-actions">
      <a class="nls-btn" href="${esc(rel(depth, c.main[1]))}">${esc(c.main[0])} →</a>
      <a class="nls-btn nls-btn--ghost" href="${esc(ext(c.sub[1]) ? c.sub[1] : rel(depth, c.sub[1]))}"${ext(c.sub[1]) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(c.sub[0])}</a>
    </div>
  </div>`;
}

const wrap = (inner) => `<section id="lifestage-detail" class="nls nls--petlog" data-story="petlog" aria-labelledby="story-lifestage-title">${inner}</section>`;
const CONTACT_HREF = (type) => `petlog/contact/?type=${type}#inquiry`;

/* ---------------------------------------------------------------- pages */
function overviewPage(lang) {
  const c = OVERVIEW[bl(lang)];
  const L = bl(lang);
  const D = 1;
  const journey = c.journey.items.map((it) => ({ id: it.id, n: it.n, tab: it.tab, mark: it.tab, label: it.label, name: it.name, lead: it.lead, chips: it.topics }));
  const storeLinks = `<p class="nls-note">${esc(c.core.appLabel)} — <a class="nls-link" href="${esc(STORE.ios)}" target="_blank" rel="noopener noreferrer">App Store →</a>&emsp;<a class="nls-link" href="${esc(STORE.android)}" target="_blank" rel="noopener noreferrer">Google Play →</a></p>`;
  return wrap(`${hero({ wordmark: "PETLOG", titleHtml: c.heroTitle, lead: c.heroLead, main: [`${c.ctaMain} →`, "#nls-mission"], sub: [c.ctaSub, rel(D, "petlog/platform/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "overview" })}
  <div class="nls__wrap">
    ${rosterBlock("nls-mission", c.mission.kicker, c.mission.title, c.mission.body)}
    ${section("nls-about", { kicker: c.about.kicker, title: c.about.title, lead: c.about.lead, body: pipeList(c.about.steps) })}
    ${railBlock("nls-journey", { kicker: c.journey.kicker, title: c.journey.title, lead: c.journey.lead, items: journey })}
    ${section("nls-core", { kicker: c.core.kicker, title: c.core.title, lead: c.core.lead, body: `${cardsHtml("proc", c.core.items, lang, D)}${storeLinks}` })}
    ${section("nls-family", { kicker: c.family.kicker, title: c.family.title, lead: c.family.lead, band: true, body: cardsHtml("flow", c.family.items, lang, D) })}
    ${section("nls-beyond", { kicker: c.beyond.kicker, title: c.beyond.title, lead: c.beyond.lead, noteText: NOTICE[L], body: `${cardsHtml("flow", c.beyond.items, lang, D)}<p class="nls-note"><a class="nls-link" href="${rel(D, "petlog/business/")}">${esc(c.beyond.cta)} →</a></p>` })}
    ${section("nls-trust", { kicker: c.trust.kicker, title: c.trust.title, band: true, body: cardsHtml("signal", c.trust.items, lang, D) })}
    ${splitDir("nls-newon", { kicker: c.newon.kicker, title: c.newon.title, lead: c.newon.lead, items: c.newon.items, depth: D })}
    ${menuBlock(lang, D, "overview")}
    ${closeBlock({ ...c.close, main: [c.close.ctaMain, "petlog/platform/"], sub: [c.close.ctaSub, "petlog/business/"] }, D)}
  </div>`);
}

function platformPage(lang) {
  const m = PLATFORM.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const card = (idx) => {
    const it = PLATFORM.items[idx];
    const link = it.cta === "app" ? [m.labels.app, STORE.ios] : [m.labels.cta, CONTACT_HREF(it.cta)];
    return { n: pad2(idx + 1), label: it.label, name: it.name[L], lead: it.lead[L], points: [[m.labels.users, it.users[L]]], chips: it.f[L], link, anchor: it.label.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "") };
  };
  const groups = m.groups
    .map((g, gi) => section(`nls-${g.id}`, { kicker: g.kicker, title: g.title, lead: g.lead, band: gi % 2 === 1, body: cardsHtml(g.layout, g.items.map(card), lang, D) }))
    .join("\n");
  const legend = m.legend.map(([k, v], i) => ({ n: pad2(i + 1), name: k, body: v }));
  const close = { ...m.close, main: [m.close.ctaMain, "petlog/business/"], sub: [m.close.ctaSub, STORE.ios] };
  return wrap(`${hero({ wordmark: "Platform", titleHtml: m.heroTitle, lead: m.heroLead, main: [lang === "ko" ? "18개 서비스 보기 ↓" : "See 18 services ↓", "#nls-records"], sub: [lang === "ko" ? "PETLOG 소개" : "About PETLOG", rel(D, "petlog/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "platform" })}
  <div class="nls__wrap">
    ${splitDir("nls-legend", { kicker: m.legendKicker, title: m.legendTitle, noteText: NOTICE[L], items: legend, depth: D })}
    ${groups}
    ${menuBlock(lang, D, "platform")}
    ${closeBlock(close, D)}
  </div>`);
}

function businessPage(lang) {
  const m = BUSINESS.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const line = (no) => BUSINESS.lines.find((x) => x.no === no);
  const rail = BUSINESS.groups.map((g, i) => ({ id: g.id, n: pad2(i + 1), tab: g.tab, mark: String(g.lines.length).padStart(2, "0"), label: g.label, name: g[L], lead: L === "ko" ? g.koLead : g.enLead, chips: g.lines.map((no) => `${no} ${line(no).name[L]}`) }));
  const lineCard = (no) => {
    const x = line(no);
    return {
      n: x.no,
      label: x.label,
      name: x.name[L],
      lead: x.lead[L],
      points: [
        [m.labels.customers, x.customers[L]],
        [m.labels.value, x.value[L]],
        [m.labels.revenue, x.revenue[L]],
        [m.labels.partners, x.partners[L]],
        [m.labels.stage, m.stageLabel(x.stage)],
      ],
      link: [m.labels.cta, CONTACT_HREF(x.type)],
      anchor: `line-${x.no}`,
    };
  };
  const layoutFor = (n) => (n === 4 ? "board" : n === 3 ? "flow" : "signal");
  const groupSections = BUSINESS.groups
    .map((g, gi) => {
      const body =
        g.id === "enterprise"
          ? `${cardsHtml("signal", g.lines.map(lineCard), lang, D)}
    <div class="nls-subhead">${head(m.saasKicker, m.saasTitle, m.saasLead)}</div>
    ${cardsHtml("flow", m.saas.slice(0, 3).map(([t, d], i) => ({ n: pad2(i + 1), name: t, lead: d })), lang, D)}
    ${cardsHtml("signal", m.saas.slice(3).map(([t, d], i) => ({ n: pad2(i + 4), name: t, lead: d })), lang, D)}`
          : cardsHtml(layoutFor(g.lines.length), g.lines.map(lineCard), lang, D);
      return section(`nls-group-${g.id}`, { kicker: `${pad2(gi + 1)} · ${g.label.toUpperCase()}`, title: g[L], lead: L === "ko" ? g.koLead : g.enLead, band: gi % 2 === 1, body });
    })
    .join("\n");
  const structure = m.structure.map(([k, v], i) => ({ n: pad2(i + 1), name: k, body: v }));
  const revenue = m.revenue.map(([t, d, stage], i) => ({ n: pad2(i + 1), name: t, lead: d, chips: [stage] }));
  return wrap(`${hero({ wordmark: "Business", titleHtml: m.heroTitle, lead: m.heroLead, main: [lang === "ko" ? "20개 사업 분야 보기 ↓" : "See 20 areas ↓", "#nls-groups"], sub: [m.close.ctaMain, rel(D, "petlog/partnerships/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "business" })}
  <div class="nls__wrap">
    ${splitDir("nls-structure", { kicker: m.structureKicker, title: m.structureTitle, noteText: NOTICE[L], items: structure, depth: D })}
    ${railBlock("nls-groups", { kicker: m.groupsKicker, title: m.groupsTitle, lead: m.groupsLead, items: rail })}
    ${groupSections}
    ${section("nls-revenue", { kicker: m.revenueKicker, title: m.revenueTitle, lead: m.revenueLead, band: true, body: cardsHtml("flow", revenue, lang, D) })}
    ${splitDir("nls-priority", { kicker: m.priorityKicker, title: m.priorityTitle, items: m.priority.map(([t, d], i) => ({ n: pad2(i + 1), name: t, body: d })), depth: D })}
    ${section("nls-roadmap", { kicker: m.roadmapKicker, title: m.roadmapTitle, lead: m.roadmapNote, body: laneList(m.roadmap) })}
    ${section("nls-trust", { kicker: m.trustKicker, title: m.trustTitle, band: true, body: indexList(m.trust) })}
    ${menuBlock(lang, D, "business")}
    ${closeBlock({ ...m.close, main: [m.close.ctaMain, "petlog/partnerships/"], sub: [m.close.ctaSub, "petlog/contact/"] }, D)}
  </div>`);
}

function partnershipsPage(lang) {
  const m = PARTNERS.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const card = (no) => {
    const p = PARTNERS.items.find((x) => x.no === no);
    return { n: p.no, name: p.name[L], lead: p.value[L], points: [[m.labels.scope, p.scope[L]], [m.labels.how, p.how[L]], [m.labels.terms, p.terms[L]]], link: [m.labels.cta, CONTACT_HREF(p.type)], anchor: `partner-${p.no}` };
  };
  const groups = m.groups.map((g, gi) => section(`nls-p-${g.id}`, { kicker: g.kicker, title: g.title, lead: g.lead, band: gi % 2 === 0, body: cardsHtml(g.layout, g.items.map(card), lang, D) })).join("\n");
  const steps = m.steps.map(([t, d]) => [t, d]);
  return wrap(`${hero({ wordmark: "Partnerships", titleHtml: m.heroTitle, lead: m.heroLead, main: [lang === "ko" ? "14개 협력 분야 ↓" : "14 partner types ↓", "#nls-p-care"], sub: [m.labels.cta, rel(D, "petlog/contact/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "partnerships" })}
  <div class="nls__wrap">
    ${section("nls-offer", { kicker: m.offerKicker, title: m.offerTitle, body: cardsHtml("proc", m.offer, lang, D) })}
    ${groups}
    ${section("nls-principles", { kicker: m.principlesKicker, title: m.principlesTitle, body: indexList(m.principles) })}
    ${section("nls-process", { kicker: m.processKicker, title: m.processTitle, noteText: m.processNote, band: true, body: laneList(steps) })}
    ${menuBlock(lang, D, "partnerships")}
    ${closeBlock({ ...m.close, main: [m.close.ctaMain, "petlog/contact/"], sub: [m.close.ctaSub, "partnerships/"] }, D)}
  </div>`);
}

function contactPage(lang) {
  const c = CONTACT[bl(lang)];
  const D = 2;
  const items = c.types.map(([key, name, body], i) => ({ n: pad2(i + 1), name, body, href: `petlog/contact/?type=${key}#inquiry` }));
  const form = inquiryFormHtml(lang, D, {
    category: "PETLOG",
    interest: "PETLOG",
    copy: { label: "PETLOG", title: c.formTitle, subject: c.subject, types: c.types.map(([k, n]) => [k, n]), type: c.typeLabel, message: c.messageLabel, messagePh: c.messagePh, submit: lang === "ko" ? "문의 보내기" : "Send inquiry" },
  });
  return wrap(`${hero({ wordmark: "Contact", titleHtml: c.heroTitle, lead: c.heroLead, main: [lang === "ko" ? "문의하기 ↓" : "Send an inquiry ↓", "#inquiry"], sub: [lang === "ko" ? "PETLOG 소개" : "About PETLOG", rel(D, "petlog/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "contact" })}
  <div class="nls__wrap">
    ${splitDir("nls-types", { kicker: c.kicker, title: c.listTitle, lead: c.listLead, items, depth: D })}
    ${section("nls-guide", { kicker: c.guideKicker, title: c.guideTitle, band: true, body: indexList(c.guide) })}
  </div>
  <div class="bp-page">${form}</div>
  <div class="nls__wrap">
    ${menuBlock(lang, D, "contact")}
  </div>`);
}

const PAGES = [
  { slug: "petlog", render: overviewPage, seo: (l) => OVERVIEW[bl(l)] },
  { slug: "petlog/platform", render: platformPage, seo: (l) => PLATFORM.meta[bl(l)] },
  { slug: "petlog/business", render: businessPage, seo: (l) => BUSINESS.meta[bl(l)] },
  { slug: "petlog/partnerships", render: partnershipsPage, seo: (l) => PARTNERS.meta[bl(l)] },
  { slug: "petlog/contact", render: contactPage, seo: (l) => CONTACT[bl(l)], contact: true },
];
export const PETLOG_SITE_PATHS = PAGES.map((p) => p.slug);

function jsonLd(page, lang, seo) {
  const url = `${SITE_ORIGIN}/${lang}/${page.slug}/`;
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${lang}/` },
    { "@type": "ListItem", position: 2, name: "PETLOG", item: `${SITE_ORIGIN}/${lang}/petlog/` },
  ];
  if (page.slug !== "petlog") crumbs.push({ "@type": "ListItem", position: 3, name: page.slug.split("/")[1].replace(/^./, (c) => c.toUpperCase()), item: url });
  const main =
    page.slug === "petlog"
      ? {
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          name: "PETLOG",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "iOS, Android",
          url,
          description: seo.desc,
          publisher: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN },
          sameAs: [STORE.ios, STORE.android],
        }
      : { "@context": "https://schema.org", "@type": page.contact ? "ContactPage" : "WebPage", name: seo.title, description: seo.desc, url, inLanguage: lang };
  return `    <script type="application/ld+json">${JSON.stringify(main)}</script>
    <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs })}</script>`;
}

/** Root /petlog/… → preferred-language page (lang-nav.js does not know /petlog/, so it is not loaded here). */
function writeRootStub(slug) {
  const dir = path.join(ROOT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="refresh" content="0;url=/ko/${slug}/" />
<script>
(function(){
  var LANGS=["ko","en","ja","es","pt-br","fr","de","hi","id"];
  var pref="ko";
  try{var s=localStorage.getItem("newon-lang-dir");if(s&&LANGS.indexOf(s)!==-1)pref=s;}catch(e){}
  location.replace("/"+pref+"/${slug}/"+(location.search||"")+(location.hash||""));
})();
</script>
<title>Redirect</title>
</head>
<body><p><a href="/ko/${slug}/">Continue</a></p></body>
</html>`
  );
}

export function renderPetlogSite() {
  const en = loadJson("en.json");
  const flatEn = flatten(en);
  let n = 0;
  for (const lang of LANGS) {
    const flat = flatten(lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en));
    for (const page of PAGES) {
      const depth = page.slug.split("/").length;
      const seo = page.seo(lang.dir);
      const header = renderGlobalHeader(flat, flatEn, { activeNav: "petlog", base: "../".repeat(depth), idSuffix: "hub" });
      const footer = renderStudioFooter(flat, flatEn, { base: "../".repeat(depth) });
      let main = page.render(lang.dir);
      if (lang.dir !== "ko" && lang.dir !== "en") main = main.replace('<section id="lifestage-detail"', '<section lang="en" id="lifestage-detail"');
      let html = applyTemplate(SHELL, flat, flatEn, {
        HTML_LANG: lang.htmlLang,
        LANG_DIR: lang.dir,
        FONT_LINKS: fontLinksHtml(lang.dir),
        TITLE: esc(seo.title),
        META_DESCRIPTION: esc(clampSeoDescription(seo.desc, 160)),
        CANONICAL: `${SITE_ORIGIN}/${lang.dir}/${page.slug}/`,
        OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
        HREFLANG_BLOCK: `${hreflangBlock(page.slug)}\n${jsonLd(page, lang.dir, seo)}`,
        SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
        CHROME_HEADER: header,
        MAIN_CONTENT: main,
        CHROME_FOOTER: footer,
        EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=20261019hero1" />
    <link rel="stylesheet" href="/flagship-subnav.css?v=20261018fsn2" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />${page.contact ? `\n    <link rel="stylesheet" href="/business-pillar.css?v=20260923pad1" />` : ""}
    ${PETLOG_CSS}`,
        EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260924play2"></script>
    <script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
      });
      const out = path.join(ROOT, lang.dir, page.slug, "index.html");
      ensureDir(out);
      fs.writeFileSync(out, html);
      n++;
    }
  }
  for (const page of PAGES) writeRootStub(page.slug);
  return n;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = renderPetlogSite();
  console.log(`render-petlog-site: wrote ${n} pages + ${PAGES.length} root redirects`);
}
