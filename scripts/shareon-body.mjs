/**
 * SHAREON pages — section HTML, scoped to #shareon-detail (styles: /shareon.css, behaviour: /shareon.js).
 * Layout follows the Newon LivOn page: dark full-bleed hero, breadcrumb rule, two-column "why" rows, tab panels,
 * bordered card grids with chips, big-number steps and a black closing band.
 * Information only: every action is a link to another page, the NEWON inquiry form or the official email.
 * The two interactive pieces (category tabs, hypothetical calculator) work without JS: all panels render visible
 * and the calculator shows its default result; shareon.js only enhances them.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getShareonCopy, SHAREON_PAGES } from "./shareon-copy.mjs";
import { icon } from "./shareon-icons.mjs";

export { getShareonCopy };

const e = (s) => escapeHtml(s == null ? "" : String(s));
const nl = (s) => e(s).replace(/\n/g, "<br>");

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

const MARK = `<svg class="nsh-mark" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">
  <rect width="48" height="48" rx="13" fill="#7771E8"/>
  <circle cx="19" cy="24" r="8.5" fill="none" stroke="#fff" stroke-width="3"/>
  <circle cx="29" cy="24" r="8.5" fill="none" stroke="#fff" stroke-width="3" stroke-opacity="0.72"/>
</svg>`;

/* ───────── small building blocks ───────── */

function badge(c, key) {
  if (!key) return "";
  return `<span class="nsh-badge nsh-badge--${e(key)}"><span class="nsh-badge__dot" aria-hidden="true"></span><span class="visually-hidden">${e(c.statusLabel)}: </span>${e(c.status[key])}</span>`;
}

function head(id, kicker, title, lead, { level = 2, extra = "" } = {}) {
  const tag = `h${level}`;
  return `<header class="nsh-head">
      ${kicker ? `<p class="nsh-kicker">${e(kicker)}</p>` : ""}
      <${tag} class="nsh-title" id="nsh-${e(id)}-t">${nl(title)}</${tag}>
      ${lead ? `<p class="nsh-lead">${e(lead)}</p>` : ""}${extra}
    </header>`;
}

function block(id, inner, cls = "") {
  return `<section class="nsh-block${cls ? ` ${cls}` : ""}" id="nsh-${e(id)}" aria-labelledby="nsh-${e(id)}-t">
    <div class="nsh__wrap">${inner}</div>
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
  return `<a class="nsh-link" href="${e(href)}">${e(label)}${hidden ? `<span class="visually-hidden"> — ${e(hidden)}</span>` : ""} <span aria-hidden="true">→</span></a>`;
}

/** "WHY" layout: heading left, bordered numbered rows right. */
function whyRows(id, kicker, title, lead, rows, { after = "" } = {}) {
  return block(
    id,
    `<div class="nsh-why">
      ${head(id, kicker, title, lead)}
      <ol class="nsh-rows" role="list">${rows
        .map(
          (r) => `<li class="nsh-rows__item"><span class="nsh-rows__n" aria-hidden="true">${e(r.n)}</span><div>${
            r.title ? `<h3 class="nsh-rows__title">${e(r.title)}</h3>` : ""
          }<p class="nsh-rows__body">${e(r.body)}</p></div></li>`
        )
        .join("")}</ol>
    </div>${after}`
  );
}

/* Hero visual: an original "sharing loop" — two linked rings with resource nodes on an orbit. Pure SVG/CSS. */
const ORBIT_ICONS = ["everyday", "camera", "space", "mobility", "electronics", "camping", "pro", "local"];
function heroVisual() {
  const nodes = ORBIT_ICONS.map((k, i) => `<li class="nsh-orbit__node" style="--i:${i}">${icon(k)}</li>`).join("");
  return `<div class="nsh-hero__visual" aria-hidden="true">
      <svg class="nsh-hero__rings" viewBox="0 0 600 600" focusable="false">
        <defs>
          <radialGradient id="nshGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stop-color="#7771E8" stop-opacity=".55"/>
            <stop offset=".55" stop-color="#7771E8" stop-opacity=".12"/>
            <stop offset="1" stop-color="#7771E8" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="300" fill="url(#nshGlow)"/>
        <circle cx="300" cy="300" r="250" fill="none" stroke="#fff" stroke-opacity=".10"/>
        <circle cx="300" cy="300" r="190" fill="none" stroke="#fff" stroke-opacity=".14" stroke-dasharray="2 8"/>
        <circle cx="262" cy="300" r="78" fill="none" stroke="#B3AFFF" stroke-opacity=".55" stroke-width="2"/>
        <circle cx="338" cy="300" r="78" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
      </svg>
      <ul class="nsh-orbit" role="list">${nodes}</ul>
    </div>`;
}

function hero(c, lang, id, h, { primary, secondary } = {}) {
  const pageName = c.subnav.find((s) => s.id === id);
  return `<section class="nsh-hero${id === "overview" ? " nsh-hero--home" : ""}" aria-labelledby="nsh-hero-t">
    ${heroVisual()}
    <div class="nsh__wrap nsh-hero__inner">
      <p class="nsh-hero__kicker">${e(h.kicker)}</p>
      <p class="nsh-hero__word" aria-hidden="true">SHAREON</p>
      <h1 class="nsh-hero__title" id="nsh-hero-t"${c.heroLang && c.heroLang[id] ? ` lang="${e(c.heroLang[id])}"` : ""}><span class="visually-hidden">SHAREON ${e(pageName ? pageName.en : "")} — </span>${nl(h.title)}</h1>
      <p class="nsh-hero__lead">${e(h.lead)}</p>
      <div class="nsh-hero__ctas">
        ${primary ? btn(primary, h.ctaMain, "primary") : ""}
        ${secondary ? btn(secondary, h.ctaSub, "ghost") : ""}
      </div>
      <p class="nsh-hero__pos">${e(c.positioning)}</p>
    </div>
  </section>`;
}

function crumbs(c, lang, id) {
  const cur = c.subnav.find((s) => s.id === id);
  return `<div class="nsh__wrap nsh-crumbs">
    <nav aria-label="Breadcrumb"><ol role="list">
      <li><a href="/${e(lang)}/">Newon</a></li>
      ${id === "overview" ? `<li aria-current="page">SHAREON</li>` : `<li><a href="${pageHref(lang, "overview")}">SHAREON</a></li><li aria-current="page">${e(cur.en)}</li>`}
    </ol></nav>
    <p class="nsh-crumbs__note"><span class="nsh-badge nsh-badge--dev"><span class="nsh-badge__dot" aria-hidden="true"></span>Pilot</span> ${e(c.statusNote)}</p>
  </div>`;
}

function subnav(c, lang, active) {
  return `<nav class="nsh-subnav" aria-label="${e(c.subnavAria)}">
    <div class="nsh__wrap nsh-subnav__inner">
      <a class="nsh-subnav__brand" href="${pageHref(lang, "overview")}">${MARK}<span>SHAREON</span></a>
      <ol class="nsh-subnav__list" role="list">${c.subnav
        .map(
          (s) => `<li><a class="nsh-subnav__link${s.id === active ? " is-active" : ""}" href="${pageHref(lang, s.id)}"${
            s.id === active ? ' aria-current="page"' : ""
          }><span class="nsh-subnav__n" aria-hidden="true">${e(s.n)}</span>${e(c.lang === "ko" ? s.label : s.en)}</a></li>`
        )
        .join("")}</ol>
    </div>
  </nav>`;
}

function closing(id, n, ctas) {
  return `<section class="nsh-closing" id="nsh-${e(id)}" aria-labelledby="nsh-${e(id)}-t">
    <div class="nsh__wrap nsh-closing__inner">
      ${n.kicker ? `<p class="nsh-kicker nsh-kicker--inv">${e(n.kicker)}</p>` : ""}
      <h2 class="nsh-closing__title" id="nsh-${e(id)}-t">${nl(n.title)}</h2>
      ${n.lead ? `<p class="nsh-closing__lead">${e(n.lead)}</p>` : ""}
      <div class="nsh-closing__ctas">${ctas.map(([href, label], i) => btn(href, label, i === 0 ? "primary" : "ghost")).join("")}</div>
    </div>
  </section>`;
}

function stats(c) {
  return `<div class="nsh__wrap"><div class="nsh-stats">
    <dl class="nsh-stats__list">${c.stats.map((s) => `<div class="nsh-stats__item"><dt>${e(s.label)}</dt><dd>${e(s.n)}</dd></div>`).join("")}</dl>
    <p class="nsh-stats__note">${e(c.statsNote)}</p>
  </div></div>`;
}

/** C2C / B2C / … grid (Overview "Who we connect", Business "Structure"). */
function axisGrid(items) {
  return `<ul class="nsh-axis" role="list">${items
    .map(
      (it) => `<li class="nsh-axis__item">
        <span class="nsh-axis__n" aria-hidden="true">${e(it.n)}</span>
        <p class="nsh-axis__en">${e(it.en)}</p>
        <h3 class="nsh-axis__title">${e(it.title)}</h3>
        <p class="nsh-axis__body">${e(it.body)}</p>
      </li>`
    )
    .join("")}</ul>`;
}

/** 8-step flow with a connecting line. */
function flow(steps) {
  return `<ol class="nsh-flow" role="list">${steps
    .map(
      (s) => `<li class="nsh-flow__step">
        <span class="nsh-flow__n" aria-hidden="true">${e(s.n)}</span>
        <span class="nsh-flow__dot" aria-hidden="true"></span>
        <p class="nsh-flow__en">${e(s.en)}</p>
        <h3 class="nsh-flow__title">${e(s.title)}</h3>
        <p class="nsh-flow__body">${e(s.body)}</p>
      </li>`
    )
    .join("")}</ol>`;
}

/** Big faded-number steps (LivOn "01 02 03"). */
function bigSteps(steps, cls = "") {
  return `<ol class="nsh-steps${cls ? ` ${cls}` : ""}" role="list">${steps
    .map(
      (s) => `<li class="nsh-steps__item"><span class="nsh-steps__n" aria-hidden="true">${e(s.n)}</span><h3 class="nsh-steps__title">${e(
        s.title
      )}</h3><p class="nsh-steps__body">${e(s.body)}</p></li>`
    )
    .join("")}</ol>`;
}

/* ───────── 01 Overview ───────── */

function overview(c, lang) {
  const o = c.overview;
  const share = block(
    "share",
    `${head("share", o.share.kicker, o.share.title, o.share.lead)}
    <ul class="nsh-res" role="list">${o.share.items
      .map(
        (it) => `<li class="nsh-res__item">
          <span class="nsh-res__ico">${icon(it.icon)}</span>
          <p class="nsh-res__en">${e(it.en)}</p>
          <h3 class="nsh-res__title">${e(it.title)}</h3>
          <p class="nsh-res__body">${e(it.body)}</p>
          ${chips(it.chips)}
        </li>`
      )
      .join("")}</ul>`
  );
  const how = block("how", `${head("how", o.how.kicker, o.how.title, o.how.lead)}${flow(o.how.steps)}`, "nsh-block--tint");
  const connect = block("connect", `${head("connect", o.connect.kicker, o.connect.title, o.connect.lead)}${axisGrid(o.connect.items)}`);
  const trust = whyRows("trust", o.trust.kicker, o.trust.title, o.trust.lead, o.trust.items, {
    after: `<p class="nsh-callout">${e(o.trust.note)}</p>`,
  });
  const eco = block(
    "eco",
    `${head("eco", o.eco.kicker, o.eco.title, o.eco.lead)}
    ${bigSteps(o.eco.items, "nsh-steps--3")}
    <p class="nsh-more">${link(pageHref(lang, "business"), o.eco.cta)}</p>`,
    "nsh-block--tint"
  );
  const newon = block(
    "newon",
    `<div class="nsh-why">
      ${head("newon", o.newon.kicker, o.newon.title, o.newon.lead)}
      <ol class="nsh-roles" role="list">${o.newon.items
        .map(
          (r, i) => `<li class="nsh-roles__item${r.self ? " is-self" : ""}"><span class="nsh-roles__n" aria-hidden="true">${String(i + 1).padStart(
            2,
            "0"
          )}</span><div><h3 class="nsh-roles__name">${e(r.name)}</h3><p class="nsh-roles__body">${e(r.body)}</p></div></li>`
        )
        .join("")}</ol>
    </div>`
  );
  return [
    hero(c, lang, "overview", o.hero, { primary: pageHref(lang, "platform"), secondary: pageHref(lang, "business") }),
    crumbs(c, lang, "overview"),
    subnav(c, lang, "overview"),
    stats(c),
    whyRows("vision", o.vision.kicker, o.vision.title, o.vision.lead, o.vision.points),
    share,
    how,
    connect,
    trust,
    eco,
    newon,
    closing("next", o.next, [
      [pageHref(lang, "platform"), o.next.ctas[0]],
      [pageHref(lang, "partnerships"), o.next.ctas[1]],
      [pageHref(lang, "contact"), o.next.ctas[2]],
    ]),
  ].join("\n");
}

/* ───────── 02 Platform ───────── */

function platform(c, lang) {
  const p = c.platform;
  const index = `<div class="nsh__wrap"><nav class="nsh-index" aria-labelledby="nsh-index-t">
      <h2 class="nsh-index__title" id="nsh-index-t">${e(p.indexTitle)}</h2>
      <ol class="nsh-index__list" role="list">${p.services
        .map((s) => `<li><a href="#svc-${e(s.n)}"><span aria-hidden="true">${e(s.n)}</span>${e(s.en)}</a></li>`)
        .join("")}</ol>
    </nav></div>`;
  const groups = p.groups
    .map((g, gi) => {
      const list = p.services.filter((s) => s.g === g.id);
      const rows = list
        .map(
          (s) => `<article class="nsh-svc" id="svc-${e(s.n)}" aria-labelledby="svc-${e(s.n)}-t">
            <div class="nsh-svc__side">
              <span class="nsh-svc__n" aria-hidden="true">${e(s.n)}</span>
              <span class="nsh-svc__ico">${icon(s.icon)}</span>
              <p class="nsh-svc__en">${e(s.en)}</p>
              <h3 class="nsh-svc__title" id="svc-${e(s.n)}-t">${e(s.title)}</h3>
              ${badge(c, s.status)}
            </div>
            <div class="nsh-svc__main">
              <p class="nsh-svc__body">${e(s.body)}</p>
              ${chips(s.chips)}
              <p class="nsh-svc__consider"><strong>${e(c.considerLabel)}</strong>${e(s.consider)}</p>
            </div>
          </article>`
        )
        .join("");
      return block(
        `grp-${g.id}`,
        `${head(`grp-${g.id}`, g.kicker, g.title, g.lead)}<div class="nsh-svcs">${rows}</div>`,
        gi % 2 ? "nsh-block--tint" : ""
      );
    })
    .join("\n");
  return [
    hero(c, lang, "platform", p.hero, { primary: pageHref(lang, "business"), secondary: pageHref(lang, "contact") }),
    crumbs(c, lang, "platform"),
    subnav(c, lang, "platform"),
    index,
    groups,
    closing("next", c.overview.next, [
      [pageHref(lang, "business"), c.platform.hero.ctaMain],
      [pageHref(lang, "partnerships"), c.overview.next.ctas[1]],
      [pageHref(lang, "contact"), c.overview.next.ctas[2]],
    ]),
  ].join("\n");
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
  const structure = block(
    "structure",
    `${head("structure", b.structure.kicker, b.structure.title, b.structure.lead)}${axisGrid(c.overview.connect.items)}`
  );

  const k = b.core;
  const tabs = `<div class="nsh-tabs__list" role="tablist" aria-label="${e(k.tabsAria)}" hidden data-nsh-tablist>${k.cats
    .map(
      (cat, i) => `<button type="button" role="tab" class="nsh-tabs__tab" id="tab-${e(cat.id)}" aria-controls="panel-${e(cat.id)}" aria-selected="${
        i === 0 ? "true" : "false"
      }" tabindex="${i === 0 ? "0" : "-1"}"><span class="nsh-tabs__n" aria-hidden="true">${e(cat.n)}</span>${e(cat.title)}</button>`
    )
    .join("")}</div>`;
  const panels = k.cats
    .map((cat) => {
      const items = k.items.filter((it) => it.c === cat.id);
      return `<div class="nsh-tabs__panel" id="panel-${e(cat.id)}" role="region" aria-labelledby="panel-${e(cat.id)}-t" data-nsh-panel>
        <div class="nsh-tabs__hero">
          <span class="nsh-tabs__big" aria-hidden="true">${e(cat.n)}</span>
          <p class="nsh-tabs__en">${e(cat.en)}</p>
          <h3 class="nsh-tabs__title" id="panel-${e(cat.id)}-t">${e(cat.title)}</h3>
          <p class="nsh-tabs__count">${items.length} / 14</p>
        </div>
        <ul class="nsh-biz" role="list">${items
          .map(
            (it) => `<li class="nsh-biz__item">
              <div class="nsh-biz__top">
                <span class="nsh-biz__ico">${icon(it.icon)}</span>
                <div><p class="nsh-biz__en"><span aria-hidden="true">${e(it.n)} · </span>${e(it.en)}</p><h4 class="nsh-biz__title">${e(it.title)}</h4></div>
                ${badge(c, it.status)}
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
  const core = block("core", `${head("core", k.kicker, k.title, k.lead)}<div class="nsh-tabs" data-nsh-tabs>${tabs}${panels}</div>`, "nsh-block--tint");

  const r = b.revenue;
  const revenue = block(
    "revenue",
    `${head("revenue", r.kicker, r.title, r.lead)}
    <div class="nsh-table-wrap" role="region" aria-labelledby="nsh-revenue-t" tabindex="0">
      <table class="nsh-table">
        <thead><tr><th scope="col"><span class="visually-hidden">#</span></th><th scope="col">${e(r.head.name)}</th><th scope="col">${e(
          r.head.target
        )}</th><th scope="col">${e(r.head.model)}</th></tr></thead>
        <tbody>${r.rows
          .map((row) => `<tr><td class="nsh-table__n">${e(row.n)}</td><th scope="row">${e(row.name)}</th><td>${e(row.target)}</td><td>${e(row.model)}</td></tr>`)
          .join("")}</tbody>
      </table>
    </div>
    <p class="nsh-callout">${e(r.note)}</p>`
  );

  const k2 = b.calc;
  const d = k2.defaults;
  const gmv = d.count * d.avg;
  const fee = Math.round((gmv * d.rate) / 100);
  const field = (name, label, unit, val, attrs) =>
    `<div class="nsh-calc__field"><label for="calc-${name}">${e(label)}</label><div class="nsh-calc__input"><input id="calc-${name}" name="${name}" type="number" inputmode="numeric" value="${val}" ${attrs} data-nsh-calc-in="${name}" />${
      unit ? `<span>${e(unit)}</span>` : ""
    }</div></div>`;
  const calc = block(
    "calc",
    `<div class="nsh-calc" data-nsh-calc data-lang="${e(lang === "ko" ? "ko-KR" : "en-US")}">
      <div class="nsh-calc__intro">
        ${head("calc", k2.kicker, k2.title, k2.lead, { extra: `<p class="nsh-calc__badge">${e(k2.badge)}</p>` })}
      </div>
      <form class="nsh-calc__form" aria-labelledby="nsh-calc-t">
        ${field("count", k2.fields.count, k2.fields.countUnit, d.count, 'min="0" max="10000000" step="1"')}
        ${field("avg", k2.fields.avg, k2.fields.avgUnit, d.avg, 'min="0" max="100000000" step="1000"')}
        ${field("rate", k2.fields.rate, k2.fields.rateUnit, d.rate, 'min="0" max="100" step="0.5"')}
        <dl class="nsh-calc__out" aria-live="polite">
          <div><dt>${e(k2.out.gmv)}</dt><dd><output data-nsh-calc-out="gmv" for="calc-count calc-avg">${fmt(gmv, lang)}</output> <span>${e(k2.currency)}</span></dd></div>
          <div class="is-fee"><dt>${e(k2.out.fee)}</dt><dd><output data-nsh-calc-out="fee" for="calc-count calc-avg calc-rate">${fmt(fee, lang)}</output> <span>${e(k2.currency)}</span></dd></div>
        </dl>
        <p class="nsh-calc__note">${e(k2.note)}</p>
      </form>
    </div>`,
    "nsh-block--dark"
  );

  const s = b.saas;
  const saas = block(
    "saas",
    `<div class="nsh-why">
      ${head("saas", s.kicker, s.title, s.lead, { extra: `<p class="nsh-head__badge">${badge(c, s.status)}</p><p class="nsh-more">${link(inquiryHref(lang, "saas"), s.cta)}</p>` })}
      <ul class="nsh-saas" role="list">${s.items
        .map(
          (it, i) => `<li class="nsh-saas__item"><span class="nsh-saas__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><h3 class="nsh-saas__name">${e(
            it.name
          )}</h3><p class="nsh-saas__body">${e(it.body)}</p></li>`
        )
        .join("")}</ul>
    </div>`
  );

  const rm = b.roadmap;
  const roadmap = block(
    "roadmap",
    `${head("roadmap", rm.kicker, rm.title, rm.lead)}
    <ol class="nsh-expand" role="list">${rm.steps
      .map(
        (st, i) => `<li class="nsh-expand__item${i === 0 ? " is-now" : ""}"><span class="nsh-expand__n" aria-hidden="true">${e(st.n)}</span><div><h3 class="nsh-expand__title">${e(
          st.title
        )}${st.tag ? ` <span class="nsh-tag">${e(st.tag)}</span>` : ""}</h3><p class="nsh-expand__body">${e(st.body)}</p></div></li>`
      )
      .join("")}</ol>
    <p class="nsh-callout nsh-callout--brand">${e(rm.now)}</p>`,
    "nsh-block--tint"
  );

  const ex = b.excluded;
  const excluded = whyRows("focus", ex.kicker, ex.title, ex.lead, ex.points);

  return [
    hero(c, lang, "business", b.hero, { primary: pageHref(lang, "partnerships"), secondary: inquiryHref(lang, "business") }),
    crumbs(c, lang, "business"),
    subnav(c, lang, "business"),
    stats(c),
    structure,
    core,
    revenue,
    calc,
    saas,
    roadmap,
    excluded,
    closing("next", b.next, [
      [pageHref(lang, "partnerships"), b.next.ctas[0]],
      [inquiryHref(lang, "business"), b.next.ctas[1]],
    ]),
  ].join("\n");
}

/* ───────── 04 Partnerships ───────── */

function partnerships(c, lang) {
  const p = c.partnerships;
  const t = p.types;
  const types = block(
    "types",
    `${head("types", t.kicker, t.title, "")}
    <p class="nsh-callout">${e(p.notice)}</p>
    <ul class="nsh-partners" role="list">${t.items
      .map(
        (it) => `<li class="nsh-partner">
          <div class="nsh-partner__top"><span class="nsh-partner__ico">${icon(it.icon)}</span><span class="nsh-partner__n" aria-hidden="true">${e(it.n)}</span></div>
          <h3 class="nsh-partner__title">${e(it.title)}</h3>
          <dl class="nsh-partner__dl">
            <div><dt>${e(t.labels.collab)}</dt><dd>${e(it.collab)}</dd></div>
            <div><dt>${e(t.labels.value)}</dt><dd>${e(it.value)}</dd></div>
            <div><dt>${e(t.labels.terms)}</dt><dd>${e(it.terms)}</dd></div>
          </dl>
          <div class="nsh-partner__foot">${badge(c, it.status)}${link(inquiryHref(lang, `partner-${it.n}`), c.partnershipInquiry, it.title)}</div>
        </li>`
      )
      .join("")}</ul>`,
    "nsh-block--tint"
  );
  const pr = p.process;
  const process = block("process", `${head("process", pr.kicker, pr.title, pr.lead)}${bigSteps(pr.steps, "nsh-steps--5")}`);
  return [
    hero(c, lang, "partnerships", p.hero, { primary: inquiryHref(lang, "partnership"), secondary: pageHref(lang, "business") }),
    crumbs(c, lang, "partnerships"),
    subnav(c, lang, "partnerships"),
    whyRows("open", p.open.kicker, p.open.title, p.open.lead, p.open.points),
    types,
    process,
    closing("next", p.next, [
      [inquiryHref(lang, "partnership"), p.next.ctas[0]],
      [pageHref(lang, "overview"), p.next.ctas[1]],
    ]),
  ].join("\n");
}

/* ───────── 05 Contact ───────── */

function contact(c, lang) {
  const k = c.contact;
  const types = block(
    "types",
    `${head("types", k.kicker, k.title, k.lead)}
    <ul class="nsh-contacts" role="list">${k.items
      .map(
        (it) => `<li class="nsh-contact">
          <div class="nsh-contact__top"><span class="nsh-contact__ico">${icon(it.icon)}</span><span class="nsh-contact__n" aria-hidden="true">${e(it.n)}</span></div>
          <h3 class="nsh-contact__title">${e(it.title)}</h3>
          <p class="nsh-contact__body">${e(it.body)}</p>
          <div class="nsh-contact__acts">
            <a class="nsh-contact__btn" href="${e(inquiryHref(lang, it.slug))}">${e(k.formCta)}<span class="visually-hidden"> — ${e(it.title)}</span> <span aria-hidden="true">→</span></a>
            <a class="nsh-contact__mail" href="${e(mailHref(c, it.title))}">${e(k.mailCta)}<span class="visually-hidden"> — ${e(it.title)}</span></a>
          </div>
        </li>`
      )
      .join("")}</ul>`
  );
  const g = k.guide;
  const guide = block(
    "guide",
    `<div class="nsh-why">
      ${head("guide", g.kicker, g.title, "", { extra: `<p class="nsh-more"><a class="nsh-link" href="/${e(lang)}/privacy/">${e(g.privacy)} <span aria-hidden="true">→</span></a></p>` })}
      <ol class="nsh-rows" role="list">${g.items
        .map((t, i) => `<li class="nsh-rows__item"><span class="nsh-rows__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><div><p class="nsh-rows__body">${e(t)}</p></div></li>`)
        .join("")}</ol>
    </div>`,
    "nsh-block--tint"
  );
  return [
    hero(c, lang, "contact", k.hero, { primary: inquiryHref(lang, "general"), secondary: mailHref(c, "SHAREON") }),
    crumbs(c, lang, "contact"),
    subnav(c, lang, "contact"),
    types,
    guide,
    closing("next", { kicker: "NEWON", title: "newon@newon.app", lead: "" }, [
      [inquiryHref(lang, "general"), k.hero.ctaMain],
      [mailHref(c, "SHAREON"), k.hero.ctaSub],
    ]),
  ].join("\n");
}

const RENDER = { overview, platform, business, partnerships, contact };

export function renderShareonPage(lang, id) {
  const c = getShareonCopy(lang);
  const inner = RENDER[id](c, lang);
  return `<div id="shareon-detail" class="nsh" data-shareon-page="${e(id)}" data-content-lang="${e(c.contentLang)}"${
    c.contentLang !== lang ? ` lang="${e(c.contentLang)}"` : ""
  }>
${inner}
</div>`;
}
