/**
 * MY WORLD business site — page bodies (scoped to #myworld-site.mws).
 * Visual language follows /lifestage/ (LivOn): dark hero, split intro, tabbed journey, chip cards,
 * numbered two-column rows, big-number steps, boxed expansion list, black closing band.
 * Information only: no booking, ordering, payment, sign-in, seller registration or record entry.
 */
import { escapeHtml as esc } from "./hub-utils.mjs";
import { MYWORLD_PAGES, myworldPagePath } from "./myworld-site-copy.mjs";
import { icon } from "./myworld-site-icons.mjs";

export const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.newon.myworld&pcampaignid=web_share";
const MAIL = "newon@newon.app";

const pad = (n) => String(n).padStart(2, "0");
const letter = (i) => String.fromCharCode(65 + i);
const lines = (s) => esc(s).split("\n").join("<br />");
const pageHref = (lang, id) => `/${lang}/${myworldPagePath(id)}`;
const mailHref = (copy, topic) =>
  `mailto:${MAIL}?subject=${encodeURIComponent(`${copy.ui.emailSubjectPrefix} ${topic}`)}`;
const arrow = `<span class="mws-arrow" aria-hidden="true">→</span>`;
const ext = `<span class="mws-arrow" aria-hidden="true">↗</span>`;

/* ---------- atoms ---------- */
function badge(copy, status) {
  return `<span class="mws-badge mws-badge--${status}"><span class="mws-badge__dot" aria-hidden="true"></span>${esc(copy.ui.status[status])}</span>`;
}
function btn(href, label, { ghost = false, external = false, light = false } = {}) {
  const e = external ? ' target="_blank" rel="noopener noreferrer"' : "";
  const cls = ["mws-btn", ghost ? "mws-btn--ghost" : "", light ? "mws-btn--light" : ""].filter(Boolean).join(" ");
  return `<a class="${cls}" href="${esc(href)}"${e}>${esc(label)}${external ? ` ${ext}` : ` ${arrow}`}</a>`;
}
function chips(list, cls = "") {
  return `<ul class="mws-chips${cls ? ` ${cls}` : ""}">${list.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;
}
function itemCta(lang, copy, cta, topic) {
  if (cta === "app") return `<a class="mws-link" href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener noreferrer">${esc(copy.ui.appCta)} ${ext}</a>`;
  if (cta === "partner") return `<a class="mws-link" href="${pageHref(lang, "partnerships")}">${esc(copy.ui.partnerCta)} ${arrow}</a>`;
  return `<a class="mws-link" href="${esc(mailHref(copy, topic))}">${esc(copy.ui.inquiryCta)} ${arrow}</a>`;
}
function notes(copy, keys) {
  return `<aside class="mws-notes" aria-label="${esc(copy.ui.notesAria)}">${keys.map((k) => `<p class="mws-note">${esc(copy.ui[k])}</p>`).join("")}</aside>`;
}
function legend(copy) {
  return `<p class="mws-legend"><span class="mws-legend__label">${esc(copy.ui.statusLabel)}</span>${["live", "partial", "planned", "review"].map((s) => badge(copy, s)).join("")}</p>`;
}
function head({ id, kicker, title, lead = "", note = "" }) {
  return `<div class="mws-head">
        ${kicker ? `<p class="mws-kicker">${esc(kicker)}</p>` : ""}
        <h2 class="mws-title" id="${id}-title">${lines(title)}</h2>
        ${lead ? `<p class="mws-lead">${esc(lead)}</p>` : ""}
        ${note ? `<p class="mws-small">${esc(note)}</p>` : ""}
      </div>`;
}
function block({ id, cls = "", inner, ...h }) {
  return `<section class="mws-block${cls ? ` ${cls}` : ""}" id="${id}" aria-labelledby="${id}-title">
    <div class="mws__wrap">
      ${head({ id, ...h })}
      ${inner}
    </div>
  </section>`;
}
/** LivOn "WHY" layout: title left, bordered numbered list right. */
function split({ id, kicker, title, lead = "", note = "", rows, aside = "" }) {
  return `<section class="mws-block" id="${id}" aria-labelledby="${id}-title">
    <div class="mws__wrap mws-split">
      <div>${head({ id, kicker, title, lead, note })}${aside}</div>
      <ol class="mws-boxrows">${rows}</ol>
    </div>
  </section>`;
}
const boxRow = (n, body, title = "", extra = "") =>
  `<li class="mws-boxrow"><span class="mws-n">${n}</span><div>${title ? `<h3 class="mws-h3">${esc(title)}</h3>` : ""}<p class="mws-body">${esc(body)}</p>${extra}</div></li>`;

/* ---------- hero art ---------- */
const HERO_ART = `<svg class="mws-hero__art" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="mwsGlow" cx="50%" cy="58%" r="55%"><stop offset="0" stop-color="#1769ff" stop-opacity=".38"/><stop offset=".55" stop-color="#1769ff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <pattern id="mwsDots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#fff" fill-opacity=".09"/></pattern>
  </defs>
  <rect width="1200" height="640" fill="url(#mwsDots)"/>
  <rect width="1200" height="640" fill="url(#mwsGlow)"/>
  <g fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1">
    <circle cx="600" cy="700" r="430"/>
    <ellipse cx="600" cy="700" rx="430" ry="150"/>
    <ellipse cx="600" cy="700" rx="430" ry="290"/>
    <ellipse cx="600" cy="700" rx="170" ry="430"/>
    <ellipse cx="600" cy="700" rx="320" ry="430"/>
    <line x1="600" y1="270" x2="600" y2="1130"/>
  </g>
  <g fill="none" stroke="#5b9bff" stroke-width="1.6" stroke-dasharray="5 7" stroke-linecap="round">
    <path class="mws-route" d="M300 470 Q 450 250 640 380"/>
    <path class="mws-route" d="M640 380 Q 800 220 930 420"/>
    <path class="mws-route" d="M930 420 Q 1010 520 1060 560"/>
    <path class="mws-route" d="M300 470 Q 220 540 150 560"/>
  </g>
  <g fill="#5b9bff">
    <circle cx="300" cy="470" r="5"/><circle cx="640" cy="380" r="5"/><circle cx="930" cy="420" r="5"/>
    <circle cx="300" cy="470" r="14" fill-opacity=".18"/><circle cx="640" cy="380" r="14" fill-opacity=".18"/><circle cx="930" cy="420" r="14" fill-opacity=".18"/>
  </g>
</svg>`;

function hero(copy, h, { wordmark = false, ctas = "" } = {}) {
  const stats = h.stats
    ? `<dl class="mws-stats">${h.stats.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.n)}</dd></div>`).join("")}</dl>`
    : "";
  return `<header class="mws-hero${wordmark ? " mws-hero--main" : ""}">
    ${HERO_ART}
    <div class="mws__wrap mws-hero__inner">
      ${wordmark ? `<p class="mws-hero__wordmark" aria-hidden="true">${esc(copy.ui.brand)}</p>` : ""}
      <p class="mws-hero__kicker">${esc(h.kicker)}</p>
      <h1 class="mws-hero__title">${wordmark ? `<span class="mws-sr">${esc(copy.ui.brand)} — </span>` : ""}${lines(h.title)}</h1>
      <p class="mws-hero__lead">${esc(h.lead)}</p>
      ${ctas ? `<div class="mws-actions mws-actions--hero">${ctas}</div>` : ""}
      ${stats}
    </div>
  </header>`;
}

function subnav(lang, copy, active) {
  const items = copy.nav
    .map((n) => {
      const cur = n.id === active ? ' aria-current="page"' : "";
      return `<li><a class="mws-subnav__link" href="${pageHref(lang, n.id)}"${cur}><span class="mws-subnav__n">${n.n}</span>${esc(n.label)}</a></li>`;
    })
    .join("");
  return `<nav class="mws-subnav" aria-label="${esc(copy.ui.subnavAria)}">
    <div class="mws__wrap mws-subnav__inner">
      <a class="mws-subnav__brand" href="${pageHref(lang, "overview")}">${esc(copy.ui.brand)}</a>
      <ul class="mws-subnav__list">${items}</ul>
    </div>
  </nav>`;
}

function pager(lang, copy, current) {
  const i = MYWORLD_PAGES.indexOf(current);
  const nav = (id, dir) => {
    if (!id) return "<span></span>";
    const n = copy.nav.find((x) => x.id === id);
    return `<a class="mws-pager__link mws-pager__link--${dir}" href="${pageHref(lang, id)}"><span class="mws-pager__dir">${esc(dir === "prev" ? copy.ui.prev : copy.ui.next)}</span><span class="mws-pager__name">${n.n} ${esc(n.label)}</span></a>`;
  };
  return `<nav class="mws-pager mws__wrap" aria-label="${esc(copy.ui.prev)} / ${esc(copy.ui.next)}">${nav(MYWORLD_PAGES[i - 1], "prev")}${nav(MYWORLD_PAGES[i + 1], "next")}</nav>`;
}

function closeBand(lang, copy) {
  const n = copy.overview.next;
  return `<section class="mws-close" aria-labelledby="mws-close-title">
    <div class="mws__wrap mws-close__inner">
      <p class="mws-close__kicker">${esc(n.kicker)}</p>
      <h2 class="mws-close__title" id="mws-close-title">${lines(n.title)}</h2>
      <p class="mws-close__lead">${esc(n.lead)}</p>
      <div class="mws-actions mws-actions--center">
        ${btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true, light: true })}
        ${btn(pageHref(lang, "partnerships"), copy.ui.partnerCta, { ghost: true })}
        ${btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true })}
      </div>
    </div>
  </section>`;
}

/* ================= 01 OVERVIEW ================= */
function overview(lang, copy) {
  const o = copy.overview;
  const h = hero(copy, o.hero, {
    wordmark: true,
    ctas: btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true, light: true }) + btn(pageHref(lang, "platform"), copy.ui.platformCta, { ghost: true }),
  });

  const now = `<div class="mws__wrap"><p class="mws-now"><span class="mws-now__tag">${esc(o.now.kicker)}</span><span>${esc(o.now.text)}</span></p></div>`;

  const vision = split({
    id: "mws-vision", kicker: o.vision.kicker, title: o.vision.title,
    rows: o.vision.items.map((t, i) => boxRow(pad(i + 1), t)).join(""),
  });

  const j = o.journey;
  const tabs = j.items
    .map((s, i) => `<button type="button" class="mws-tab" role="tab" id="mws-tab-${s.id}" aria-controls="mws-panel-${s.id}" aria-selected="${i === 4}" tabindex="${i === 4 ? 0 : -1}"><span class="mws-tab__n">${pad(i + 1)}</span><span class="mws-tab__name">${esc(s.name)}</span></button>`)
    .join("");
  const panels = j.items
    .map((s, i) => `<div class="mws-panel" role="tabpanel" id="mws-panel-${s.id}" aria-labelledby="mws-tab-${s.id}"${i === 4 ? "" : " data-hidden"}>
        <div class="mws-panel__visual mws-panel__visual--${s.status}"><span class="mws-panel__big">${esc(s.en)}</span><span class="mws-panel__n">${pad(i + 1)}</span></div>
        <div class="mws-panel__body">
          <p class="mws-en">${pad(i + 1)} · ${esc(s.en)}</p>
          <h3 class="mws-h3 mws-h3--lg">${esc(s.head)}</h3>
          <p class="mws-body">${esc(s.lead)}</p>
          ${chips(s.chips)}
          <p class="mws-panel__status">${badge(copy, s.status)}</p>
        </div>
      </div>`)
    .join("");
  const journey = block({
    id: "mws-journey", kicker: j.kicker, title: j.title, lead: j.lead,
    inner: `<div class="mws-tabs" data-mws-tabs>
        <div class="mws-tabs__list" role="tablist" aria-label="${esc(copy.ui.tabsAria)}">${tabs}</div>
        ${panels}
      </div>
      <p class="mws-small">${esc(j.note)}</p>`,
  });

  const p = o.pillars;
  const pillars = block({
    id: "mws-pillars", kicker: p.kicker, title: p.title, lead: p.lead,
    inner: `<ol class="mws-cards mws-cards--5">${p.items.map((c, i) => `<li class="mws-card">
        <p class="mws-n">${pad(i + 1)}</p>
        <p class="mws-en">${esc(c.en)}</p>
        <h3 class="mws-h3">${esc(c.name)}</h3>
        <p class="mws-body">${esc(c.lead)}</p>
        ${chips(c.chips)}
        <p class="mws-card__foot">${badge(copy, c.status)}</p>
      </li>`).join("")}</ol>`,
  });

  const m = o.memories;
  const memories = `<section class="mws-block mws-block--wash" id="mws-memories" aria-labelledby="mws-memories-title">
    <div class="mws__wrap mws-feature">
      <div class="mws-feature__copy">
        ${head({ id: "mws-memories", kicker: m.kicker, title: m.title, lead: m.lead })}
        <p class="mws-feature__badge">${badge(copy, "live")}</p>
        <ol class="mws-list">${m.items.map((it, i) => `<li><span class="mws-n">${pad(i + 1)}</span><div><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></div></li>`).join("")}</ol>
        <div class="mws-actions">${btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true })}</div>
      </div>
      <div class="mws-phones">${m.shots.map((s) => `<img src="${s.src}" alt="${esc(s.alt)}" width="1242" height="2688" loading="lazy" decoding="async" />`).join("")}</div>
    </div>
  </section>`;

  const pl = o.planning;
  const planning = block({
    id: "mws-planning", kicker: pl.kicker, title: pl.title, lead: pl.lead,
    inner: `<ul class="mws-rows2">${pl.items.map((it, i) => `<li class="mws-row2"><span class="mws-n">${pad(i + 1)}</span><div><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p>${badge(copy, it.status)}</div></li>`).join("")}</ul>`,
  });

  const b = o.booking;
  const booking = block({
    id: "mws-booking", kicker: b.kicker, title: b.title, lead: b.lead, note: b.note,
    inner: `<ul class="mws-tiles">${b.items.map((t) => `<li class="mws-tile">
        <span class="mws-tile__ico">${icon(t.icon)}</span>
        <p class="mws-en">${esc(t.en)}</p>
        <h3 class="mws-h3">${esc(t.name)}</h3>
        <p class="mws-body">${esc(t.body)}</p>
        <p class="mws-card__foot">${badge(copy, t.status)}</p>
      </li>`).join("")}</ul>
      <div class="mws-packages"><p class="mws-mini">${esc(b.packagesTitle)}</p>${chips(b.packages, "mws-chips--lg")}</div>`,
  });

  const c = o.commerce;
  const commerce = block({
    id: "mws-commerce", kicker: c.kicker, title: c.title, lead: c.lead,
    inner: `<ul class="mws-rows2">${c.items.map((it, i) => `<li class="mws-row2"><span class="mws-n">${pad(i + 1)}</span><div><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p>${chips(it.chips)}${badge(copy, it.status)}</div></li>`).join("")}</ul>
      <p class="mws-callout"><strong>SHAREON</strong><span>${esc(c.shareon)}</span></p>`,
  });

  const e = o.ecosystem;
  const ecosystem = `<section class="mws-block" id="mws-ecosystem" aria-labelledby="mws-ecosystem-title">
    <div class="mws__wrap">
      ${head({ id: "mws-ecosystem", kicker: e.kicker, title: e.title, lead: e.lead })}
      <div class="mws-eco">
        <div class="mws-eco__core" aria-hidden="true"><span>${esc(copy.ui.brand)}</span></div>
        <ul class="mws-eco__list">${e.items.map((it, i) => `<li class="mws-eco__node"><span class="mws-n">${pad(i + 1)}</span><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ul>
      </div>
      <div class="mws-actions">${btn(pageHref(lang, "business"), copy.ui.businessCta, { ghost: true })}</div>
    </div>
  </section>`;

  const r = o.roadmap;
  const roadmap = block({
    id: "mws-roadmap", kicker: r.kicker, title: r.title, lead: r.lead, note: r.note,
    inner: `<ol class="mws-expand">${r.items.map((s, i) => `<li class="mws-expand__row${i === 0 ? " is-current" : ""}">
        <span class="mws-expand__n">${pad(i + 1)}</span>
        <div><p class="mws-en">${esc(s.stage)}${i === 0 ? ` · <span class="mws-current">${esc(copy.ui.currentStage)}</span>` : ""}</p><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></div>
      </li>`).join("")}</ol>`,
  });

  const nw = o.newon;
  const newon = split({
    id: "mws-newon", kicker: nw.kicker, title: nw.title, lead: nw.lead, note: nw.note,
    rows: nw.items.map((it, i) => `<li class="mws-boxrow${it.self ? " is-self" : ""}"><span class="mws-n">${pad(i + 1)}</span><div><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.role)}</p></div></li>`).join(""),
  });

  return [h, now, vision, journey, pillars, memories, planning, booking, commerce, ecosystem, roadmap, newon,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 02 PLATFORM ================= */
function platform(lang, copy) {
  const p = copy.platform;
  const h = hero(copy, p.hero, {
    ctas: btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true, light: true }) + btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });
  const shots = block({
    id: "mws-shots", cls: "mws-block--wash", kicker: p.shotsKicker, title: p.shotsTitle,
    inner: `<div class="mws-strip" tabindex="0" role="region" aria-label="${esc(p.shotsTitle)}">${p.shots.map((s) => `<img src="${s.src}" alt="${esc(s.alt)}" width="1242" height="2688" loading="lazy" decoding="async" />`).join("")}</div>`,
  });
  const index = block({
    id: "mws-index", kicker: p.indexKicker, title: p.indexTitle,
    inner: `<ol class="mws-cards mws-cards--3">${p.groups.map((g, gi) => `<li class="mws-card">
        <p class="mws-n">${letter(gi)}</p>
        <p class="mws-en">${esc(g.en)}</p>
        <h3 class="mws-h3"><a class="mws-card__title-link" href="#mws-group-${gi + 1}">${esc(g.name)}</a></h3>
        <p class="mws-body">${esc(g.lead)}</p>
        <ul class="mws-chips mws-chips--links">${g.items.map((n) => `<li><a href="#mws-svc-${n}">${pad(n)} ${esc(p.items[n - 1].name)}</a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });
  const svcCard = (s, n) => `<li class="mws-svc" id="mws-svc-${n}">
      <div class="mws-svc__top"><span class="mws-svc__ico">${icon(s.icon)}</span><span class="mws-n">${pad(n)}</span>${badge(copy, s.status)}</div>
      <p class="mws-en">${esc(s.en)}</p>
      <h4 class="mws-h3">${esc(s.name)}</h4>
      <p class="mws-body">${esc(s.desc)}</p>
      <p class="mws-mini">${esc(copy.ui.featuresLabel)}</p>
      ${chips(s.features)}
      <p class="mws-meta"><span>${esc(copy.ui.targetLabel)}</span>${esc(s.target)}</p>
      <p class="mws-card__foot">${itemCta(lang, copy, s.cta, s.name)}</p>
    </li>`;
  const groups = p.groups.map((g, gi) => `<section class="mws-group" id="mws-group-${gi + 1}" aria-labelledby="mws-group-${gi + 1}-title">
      <div class="mws-group__head"><span class="mws-group__n">${letter(gi)}</span><div><p class="mws-en">${esc(g.en)}</p><h3 class="mws-group__title" id="mws-group-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-body">${esc(g.lead)}</p></div></div>
      <ul class="mws-svcs">${g.items.map((n) => svcCard(p.items[n - 1], n)).join("")}</ul>
    </section>`).join("");
  const list = block({
    id: "mws-services", kicker: "20 SERVICES", title: `${copy.ui.brand} ${copy.nav[1].label}`,
    inner: `${legend(copy)}${groups}`,
  });
  return [h, shots, index, list, `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 03 BUSINESS ================= */
function business(lang, copy) {
  const b = copy.business;
  const h = hero(copy, b.hero, {
    ctas: btn(pageHref(lang, "partnerships"), copy.ui.partnerCta, { light: true }) + btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });
  const groupsIdx = block({
    id: "mws-groups", kicker: b.groupsKicker, title: b.groupsTitle, lead: b.groupsLead,
    inner: `<ol class="mws-cards mws-cards--4">${b.groups.map((g, gi) => `<li class="mws-card">
        <p class="mws-n">${letter(gi)}</p>
        <p class="mws-en">${esc(g.en)}</p>
        <h3 class="mws-h3"><a class="mws-card__title-link" href="#mws-bgroup-${gi + 1}">${esc(g.name)}</a></h3>
        <p class="mws-body">${esc(g.lead)}</p>
        <ul class="mws-chips mws-chips--links">${g.lines.map((n) => `<li><a href="#mws-line-${n}">${pad(n)} ${esc(b.lines[n - 1].name)}</a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });
  const dl = (l) => [
    [copy.ui.customersLabel, l.customers],
    [copy.ui.valueLabel, l.value],
    [copy.ui.revenueLabel, l.revenue],
    [copy.ui.partnersLabel, l.partners],
  ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  const lineCard = (l, n) => `<li class="mws-line" id="mws-line-${n}">
      <div class="mws-line__head"><span class="mws-line__n">${pad(n)}</span><div><p class="mws-en">${esc(l.en)}</p><h4 class="mws-h3 mws-h3--lg">${esc(l.name)}</h4></div>${badge(copy, l.status)}</div>
      <div class="mws-line__body">
        <p class="mws-body">${esc(l.intro)}</p>
        <p class="mws-mini">${esc(copy.ui.servicesLabel)}</p>
        ${chips(l.services)}
        <dl class="mws-dl">${dl(l)}</dl>
        <p class="mws-card__foot">${itemCta(lang, copy, l.cta, l.name)}</p>
      </div>
    </li>`;
  const groups = b.groups.map((g, gi) => `<section class="mws-group" id="mws-bgroup-${gi + 1}" aria-labelledby="mws-bgroup-${gi + 1}-title">
      <div class="mws-group__head"><span class="mws-group__n">${letter(gi)}</span><div><p class="mws-en">${esc(g.en)}</p><h3 class="mws-group__title" id="mws-bgroup-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-body">${esc(g.lead)}</p></div></div>
      <ol class="mws-lines">${g.lines.map((n) => lineCard(b.lines[n - 1], n)).join("")}</ol>
    </section>`).join("");
  const linesBlock = block({
    id: "mws-lines", kicker: b.linesKicker, title: b.linesTitle,
    inner: `${legend(copy)}${groups}${notes(copy, ["priceNote", "partnerNote"])}`,
  });
  const rv = b.revenue;
  const revenue = block({
    id: "mws-revenue", cls: "mws-block--wash", kicker: rv.kicker, title: rv.title, lead: rv.lead,
    inner: `<ol class="mws-expand mws-expand--grid">${rv.items.map((it, i) => `<li class="mws-expand__row">
        <span class="mws-expand__n">${pad(i + 1)}</span>
        <div><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-meta"><span>${esc(copy.ui.customersLabel)}</span>${esc(it.target)}</p><p class="mws-body">${esc(it.how)}</p></div>
      </li>`).join("")}</ol>
      ${notes(copy, ["priceNote"])}`,
  });
  const s = b.saas;
  const saas = `<section class="mws-block mws-block--dark" id="mws-saas" aria-labelledby="mws-saas-title">
    <div class="mws__wrap">
      ${head({ id: "mws-saas", kicker: s.kicker, title: s.title, lead: s.lead })}
      <p class="mws-saas__badge">${badge(copy, "review")}</p>
      <ul class="mws-modules">${s.items.map((it, i) => `<li><span class="mws-n">${pad(i + 1)}</span><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ul>
    </div>
  </section>`;
  const r = copy.overview.roadmap;
  const roadmap = block({
    id: "mws-roadmap", kicker: r.kicker, title: r.title, lead: r.lead, note: r.note,
    inner: `<ol class="mws-steps mws-steps--5">${r.items.map((st, i) => `<li class="mws-step${i === 0 ? " is-current" : ""}"><span class="mws-step__n">${pad(i + 1)}</span><p class="mws-en">${esc(st.stage)}${i === 0 ? ` · <span class="mws-current">${esc(copy.ui.currentStage)}</span>` : ""}</p><h3 class="mws-h3">${esc(st.name)}</h3><p class="mws-body">${esc(st.body)}</p></li>`).join("")}</ol>`,
  });
  const cm = b.commerce;
  const commerce = split({
    id: "mws-commerce", kicker: cm.kicker, title: cm.title,
    rows: cm.items.map((t, i) => boxRow(pad(i + 1), t)).join(""),
  });
  const t = b.trust;
  const trust = block({
    id: "mws-trust", kicker: t.kicker, title: t.title, lead: t.lead,
    inner: `<ul class="mws-cards mws-cards--4 mws-cards--flat">${t.items.map((it, i) => `<li class="mws-card"><p class="mws-n">${pad(i + 1)}</p><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ul>`,
  });
  return [h, groupsIdx, linesBlock, revenue, saas, roadmap, commerce, trust,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 04 PARTNERSHIPS ================= */
function partnerships(lang, copy) {
  const p = copy.partnerships;
  const h = hero(copy, p.hero, {
    ctas: btn(mailHref(copy, copy.ui.partnerCta), copy.ui.partnerCta, { light: true }) + btn(pageHref(lang, "business"), copy.ui.businessCta, { ghost: true }),
  });
  const why = split({
    id: "mws-why", kicker: p.why.kicker, title: p.why.title,
    rows: p.why.items.map((t, i) => boxRow(pad(i + 1), t)).join(""),
  });
  const models = block({
    id: "mws-models", kicker: p.models.kicker, title: p.models.title,
    inner: `<ol class="mws-cards mws-cards--3 mws-cards--flat">${p.models.items.map((m, i) => `<li class="mws-card"><p class="mws-n">${pad(i + 1)}</p><h3 class="mws-h3">${esc(m.name)}</h3><p class="mws-body">${esc(m.body)}</p></li>`).join("")}</ol>`,
  });
  const card = (t, n) => `<li class="mws-partner" id="mws-partner-${n}">
      <div class="mws-svc__top"><span class="mws-svc__ico">${icon(t.icon)}</span><span class="mws-n">${pad(n)}</span><span class="mws-tag">${esc(t.field)}</span></div>
      <h4 class="mws-h3">${esc(t.name)}</h4>
      <dl class="mws-dl mws-dl--1">${[
        [copy.ui.targetLabel, t.target],
        [copy.ui.collabLabel, t.collab],
        [copy.ui.valueLabel, t.value],
        [copy.ui.revenueLabel, t.revenue],
        [copy.ui.termsLabel, t.terms],
      ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      <p class="mws-card__foot"><a class="mws-link" href="${esc(mailHref(copy, `${copy.ui.partnerCta} — ${t.name}`))}">${esc(copy.ui.partnerCta)} ${arrow}</a></p>
    </li>`;
  const types = block({
    id: "mws-partners", kicker: p.typesKicker, title: p.typesTitle,
    inner: `${p.groups.map((g, gi) => `<section class="mws-group" id="mws-pgroup-${gi + 1}" aria-labelledby="mws-pgroup-${gi + 1}-title">
        <div class="mws-group__head"><span class="mws-group__n">${letter(gi)}</span><div><p class="mws-en">${esc(g.en)}</p><h3 class="mws-group__title" id="mws-pgroup-${gi + 1}-title">${esc(g.name)}</h3></div></div>
        <ul class="mws-svcs mws-svcs--3">${g.items.map((n) => card(p.items[n - 1], n)).join("")}</ul>
      </section>`).join("")}
      ${notes(copy, ["priceNote", "partnerNote"])}`,
  });
  const pr = p.process;
  const process = block({
    id: "mws-process", cls: "mws-block--wash", kicker: pr.kicker, title: pr.title,
    inner: `<ol class="mws-steps mws-steps--5">${pr.steps.map((s, i) => `<li class="mws-step"><span class="mws-step__n">${pad(i + 1)}</span><p class="mws-en">${esc(s.en)}</p><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });
  const ck = p.checklist;
  const checklist = split({
    id: "mws-checklist", kicker: ck.kicker, title: ck.title,
    aside: `<div class="mws-actions">${btn(mailHref(copy, copy.ui.partnerCta), copy.ui.partnerCta)}</div>`,
    rows: ck.items.map((t) => `<li class="mws-boxrow"><span class="mws-check">${icon("check")}</span><div><p class="mws-body mws-body--ink">${esc(t)}</p></div></li>`).join(""),
  });
  return [h, why, models, types, process, checklist, closeBand(lang, copy)].join("\n");
}

/* ================= 05 CONTACT ================= */
function contact(lang, copy) {
  const c = copy.contact;
  const h = hero(copy, c.hero, {
    ctas: btn(`mailto:${MAIL}?subject=${encodeURIComponent(copy.ui.emailSubjectPrefix)}`, copy.ui.mailCta, { light: true }) + btn(`/${lang}/contact/`, copy.ui.contactPageCta, { ghost: true }),
  });
  const links = (it) => {
    const out = [`<a class="mws-link" href="${esc(mailHref(copy, it.name))}">${esc(copy.ui.mailCta)} ${arrow}</a>`];
    if (it.route === "app") out.push(`<a class="mws-link" href="/${lang}/myworld/delete-account/">${esc(c.channels.items[2].name)} ${arrow}</a>`);
    if (it.route === "partner") out.push(`<a class="mws-link" href="${pageHref(lang, "partnerships")}">${esc(copy.nav[3].label)} ${arrow}</a>`);
    return out.join("");
  };
  const types = block({
    id: "mws-types", kicker: c.typesKicker, title: c.typesTitle,
    inner: c.groups.map((g, gi) => `<section class="mws-group" aria-labelledby="mws-cgroup-${gi + 1}-title">
        <div class="mws-group__head"><span class="mws-group__n">${letter(gi)}</span><div><p class="mws-en">${esc(g.en)}</p><h3 class="mws-group__title" id="mws-cgroup-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-body">${esc(g.lead)}</p></div></div>
        <ul class="mws-svcs mws-svcs--3">${g.items.map((n) => {
          const it = c.items[n - 1];
          return `<li class="mws-inq"><div class="mws-svc__top"><span class="mws-svc__ico">${icon(it.icon)}</span><span class="mws-n">${pad(n)}</span></div><h4 class="mws-h3">${esc(it.name)}</h4><p class="mws-body">${esc(it.body)}</p><p class="mws-card__foot mws-card__foot--multi">${links(it)}</p></li>`;
        }).join("")}</ul>
      </section>`).join(""),
  });
  const how = block({
    id: "mws-how", cls: "mws-block--wash", kicker: c.how.kicker, title: c.how.title,
    inner: `<ol class="mws-steps mws-steps--3">${c.how.steps.map((s, i) => `<li class="mws-step"><span class="mws-step__n">${pad(i + 1)}</span><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });
  const chHref = [`mailto:${MAIL}?subject=${encodeURIComponent(copy.ui.emailSubjectPrefix)}`, `/${lang}/contact/`, `/${lang}/myworld/delete-account/`, `/${lang}/privacy/`];
  const chIcon = ["chat", "building", "shield", "book"];
  const channels = block({
    id: "mws-channels", kicker: c.channels.kicker, title: c.channels.title,
    inner: `<ul class="mws-cards mws-cards--4">${c.channels.items.map((ch, i) => `<li class="mws-card mws-card--link"><a class="mws-card__a" href="${esc(chHref[i])}"><span class="mws-svc__ico">${icon(chIcon[i])}</span><h3 class="mws-h3">${esc(ch.name)} ${arrow}</h3><p class="mws-body">${esc(ch.body)}</p></a></li>`).join("")}</ul>`,
  });
  const faq = split({
    id: "mws-faq", kicker: c.faq.kicker, title: c.faq.title,
    rows: c.faq.items.map((f, i) => `<li class="mws-boxrow mws-faq"><span class="mws-n">Q${i + 1}</span><details><summary class="mws-h3">${esc(f.q)}</summary><p class="mws-body">${esc(f.a)}</p></details></li>`).join(""),
  });
  return [h, types, how, channels, faq, `<div class="mws__wrap">${notes(copy, ["scopeNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

const RENDER = { overview, platform, business, partnerships, contact };

export function renderMyWorldSitePage(pageLang, page, { copy, contentLang, isFallback }) {
  const langAttr = contentLang !== pageLang ? ` lang="${contentLang}"` : "";
  const fallback = isFallback
    ? `<p class="mws-fallback mws__wrap" lang="en">This page is currently available in English. Translations are in preparation.</p>`
    : "";
  const crumbs = `<nav class="mws-crumb mws__wrap" aria-label="Breadcrumb"><a href="/${pageLang}/">${esc(copy.ui.home)}</a><span aria-hidden="true">/</span><a href="${pageHref(pageLang, "overview")}">${esc(copy.ui.brand)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(copy.nav.find((n) => n.id === page).label)}</span></nav>`;
  const body = RENDER[page](pageLang, copy);
  // hero first, then sticky sub-nav + breadcrumb, then the rest
  const cut = body.indexOf("</header>") + "</header>".length;
  return `<div id="myworld-site" class="mws mws--${page}"${langAttr}>
  ${body.slice(0, cut)}
  ${subnav(pageLang, copy, page)}
  ${crumbs}
  ${fallback}
  ${body.slice(cut)}
  ${pager(pageLang, copy, page)}
</div>`;
}
