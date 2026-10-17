/**
 * SHAREON pages — section HTML, scoped to #shareon-detail (styles: /shareon.css).
 * Information only: every action is a link to another page, the NEWON inquiry form or the official email.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getShareonCopy, SHAREON_PAGES } from "./shareon-copy.mjs";

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
  const subject = `${c.contact.mailSubjectPrefix} ${title}`;
  return `mailto:newon@newon.app?subject=${encodeURIComponent(subject)}`;
}

const MARK = `<svg class="nsh-mark" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">
  <rect width="48" height="48" rx="13" fill="#7771E8"/>
  <circle cx="19" cy="24" r="8.5" fill="none" stroke="#fff" stroke-width="3"/>
  <circle cx="29" cy="24" r="8.5" fill="none" stroke="#fff" stroke-width="3" stroke-opacity="0.72"/>
</svg>`;

function statusLine(c, key, note) {
  if (!key) return "";
  return `<p class="nsh-status"><span class="nsh-status__dot nsh-status__dot--${e(key)}" aria-hidden="true"></span><span class="nsh-status__label">${e(c.statusLabel)}</span><span class="nsh-status__val">${e(c.status[key])}</span></p>${note ? `<p class="nsh-note">${e(note)}</p>` : ""}`;
}

function head(kicker, title, lead, { n, level = 2, id } = {}) {
  const k = kicker ? `<p class="nsh-kicker">${n ? `<span class="nsh-kicker__n">${e(n)}</span>` : ""}${e(kicker)}</p>` : "";
  const tag = `h${level}`;
  return `<header class="nsh-head">
      ${k}
      <${tag} class="nsh-title"${id ? ` id="${e(id)}"` : ""}>${nl(title)}</${tag}>
      ${lead ? `<p class="nsh-lead">${e(lead)}</p>` : ""}
    </header>`;
}

function block(id, inner, cls = "") {
  return `<section class="nsh-block${cls ? ` ${cls}` : ""}" id="nsh-${e(id)}" aria-labelledby="nsh-${e(id)}-t">
    <div class="nsh__wrap">${inner}</div>
  </section>`;
}

function cards(items, { title = "en", body = "body", num = "n", cls = "" } = {}) {
  return `<ul class="nsh-cards${cls ? ` ${cls}` : ""}" role="list">${items
    .map(
      (it) => `<li class="nsh-card">
        ${it[num] ? `<span class="nsh-card__n" aria-hidden="true">${e(it[num])}</span>` : ""}
        <h3 class="nsh-card__title">${e(it[title])}</h3>
        ${it[body] ? `<p class="nsh-card__body">${e(it[body])}</p>` : ""}
      </li>`
    )
    .join("")}</ul>`;
}

function chips(items) {
  return `<ul class="nsh-chips" role="list">${items.map((t) => `<li>${e(t)}</li>`).join("")}</ul>`;
}

function btn(href, label, ghost = false) {
  return `<a class="nsh-btn${ghost ? " nsh-btn--ghost" : ""}" href="${e(href)}">${e(label)}</a>`;
}

function subnav(c, lang, active) {
  return `<nav class="nsh-subnav" aria-label="${e(c.subnavAria)}">
    <div class="nsh__wrap nsh-subnav__inner">
      <a class="nsh-subnav__brand" href="${pageHref(lang, "overview")}">${MARK}<span>SHAREON</span></a>
      <ol class="nsh-subnav__list">${c.subnav
        .map(
          (s) => `<li><a class="nsh-subnav__link${s.id === active ? " is-active" : ""}" href="${pageHref(lang, s.id)}"${s.id === active ? ' aria-current="page"' : ""}><span class="nsh-subnav__n" aria-hidden="true">${e(s.n)}</span><span class="nsh-subnav__en">${e(s.en)}</span>${c.lang === "ko" ? `<span class="nsh-subnav__ko">${e(s.label)}</span>` : ""}</a></li>`
        )
        .join("")}</ol>
    </div>
  </nav>`;
}

function hero(c, h, ctas = "") {
  return `<section class="nsh-hero" aria-labelledby="nsh-hero-t">
    <div class="nsh__wrap">
      <p class="nsh-kicker nsh-kicker--hero">${e(h.kicker)}</p>
      <h1 class="nsh-hero__title" id="nsh-hero-t">${nl(h.title)}</h1>
      ${h.lead ? `<p class="nsh-hero__lead">${e(h.lead)}</p>` : ""}
      ${h.sub ? `<p class="nsh-hero__sub">${e(h.sub)}</p>` : ""}
      ${ctas ? `<div class="nsh-actions">${ctas}</div>` : ""}
      <p class="nsh-pilot" role="note">${e(c.statusNote)}</p>
    </div>
  </section>`;
}

function closing(id, title, ctas) {
  return `<section class="nsh-block nsh-close" id="nsh-${e(id)}" aria-labelledby="nsh-${e(id)}-t">
    <div class="nsh__wrap">
      <h2 class="nsh-close__title" id="nsh-${e(id)}-t">${nl(title)}</h2>
      <div class="nsh-actions">${ctas}</div>
    </div>
  </section>`;
}

/* ───────────── 01 Overview ───────────── */
function overview(c, lang) {
  const o = c.overview;
  return [
    hero(c, o.hero, btn(pageHref(lang, "platform"), o.hero.ctaMain) + btn(pageHref(lang, "business"), o.hero.ctaSub, true)),
    block("vision", head(o.vision.kicker, o.vision.title, o.vision.lead, { n: "02", id: "nsh-vision-t" }) + cards(o.vision.values, { cls: "nsh-cards--3 nsh-cards--values" })),
    block("how", head(o.how.kicker, o.how.title, o.how.lead, { n: "03", id: "nsh-how-t" }) + `<ol class="nsh-steps" role="list">${o.how.steps
      .map((s) => `<li class="nsh-step"><span class="nsh-step__n" aria-hidden="true">${e(s.n)}</span><h3 class="nsh-step__title">${e(s.en)}</h3><p class="nsh-step__body">${e(s.body)}</p></li>`)
      .join("")}</ol>`),
    block("share", head(o.share.kicker, o.share.title, "", { n: "04", id: "nsh-share-t" }) + cards(o.share.items, { cls: "nsh-cards--3" })),
    block("market", head(o.market.kicker, o.market.title, o.market.lead, { n: "05", id: "nsh-market-t" }) + cards(o.market.types, { cls: "nsh-cards--3 nsh-cards--values" }) + `<p class="nsh-note">${e(o.market.note)}</p>`),
    block("ecosystem", head(o.eco.kicker, o.eco.title, o.eco.lead, { n: "06", id: "nsh-ecosystem-t" }) + `<ol class="nsh-list" role="list">${o.eco.items.map((t, i) => `<li><span class="nsh-list__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>${e(t)}</li>`).join("")}</ol>`),
    block("opportunities", head(o.biz.kicker, o.biz.title, "", { n: "07", id: "nsh-opportunities-t" }) + cards(o.biz.items, { cls: "nsh-cards--4" }) + `<div class="nsh-actions">${btn(pageHref(lang, "business"), o.biz.cta, true)}</div>`),
    block("newon", head(o.newon.kicker, o.newon.title, o.newon.lead, { n: "08", id: "nsh-newon-t" }) + cards(o.newon.items, { title: "name", cls: "nsh-cards--3" })),
    closing("next", o.next.title, btn(pageHref(lang, "platform"), o.next.ctas[0]) + btn(pageHref(lang, "partnerships"), o.next.ctas[1], true) + btn(pageHref(lang, "contact"), o.next.ctas[2], true)),
  ].join("\n");
}

/* ───────────── 02 Platform ───────────── */
function platform(c, lang) {
  const p = c.platform;
  const secs = p.sections
    .map((s) =>
      block(
        `p${s.n}`,
        `<div class="nsh-split">
          ${head(s.en, s.title, s.body, { n: s.n, id: `nsh-p${s.n}-t` })}
          <div class="nsh-split__aside">${chips(s.items)}${statusLine(c, s.status, s.note)}</div>
        </div>`
      )
    )
    .join("\n");
  const a = p.app;
  const app = block(
    `p${a.n}`,
    `<div class="nsh-split">
      ${head(a.en, a.title, a.body, { n: a.n, id: `nsh-p${a.n}-t` })}
      <div class="nsh-split__aside">${chips(a.platforms)}${statusLine(c, a.status, a.note)}</div>
    </div>`
  );
  return [hero(c, p.hero, btn(pageHref(lang, "business"), c.subnav[2].label, true) + btn(pageHref(lang, "contact"), c.inquiry, true)), secs, app].join("\n");
}

/* ───────────── 03 Business ───────────── */
function business(c, lang) {
  const b = c.business;
  const L = b.core.labels;
  const core = `<ol class="nsh-biz" role="list">${b.core.items
    .map(
      (it) => `<li class="nsh-biz__item">
        <div class="nsh-biz__top"><span class="nsh-card__n" aria-hidden="true">${e(it.n)}</span><h3 class="nsh-biz__title">${e(it.title)}</h3></div>
        <dl class="nsh-dl">
          <div><dt>${e(L.customer)}</dt><dd>${e(it.customer)}</dd></div>
          <div><dt>${e(L.target)}</dt><dd>${e(it.target)}</dd></div>
          <div><dt>${e(L.revenue)}</dt><dd>${e(it.revenue)}</dd></div>
        </dl>
        ${statusLine(c, it.status, it.note)}
      </li>`
    )
    .join("")}</ol>`;
  const rev = `<div class="nsh-table-wrap"><table class="nsh-table">
      <thead><tr><th scope="col">${e(b.revenue.head.area)}</th><th scope="col">${e(b.revenue.head.model)}</th></tr></thead>
      <tbody>${b.revenue.rows.map((r) => `<tr><th scope="row">${e(r.area)}</th><td>${e(r.model)}</td></tr>`).join("")}</tbody>
    </table></div><p class="nsh-note">${e(b.revenue.note)}</p>`;
  const SL = b.solutions.labels;
  const sol = `<ul class="nsh-cards nsh-cards--sol" role="list">${b.solutions.items
    .map(
      (s) => `<li class="nsh-card nsh-card--sol">
        <h3 class="nsh-card__title">${e(s.name)}</h3>
        <p class="nsh-card__body">${e(s.lead)}</p>
        <dl class="nsh-dl nsh-dl--compact">
          <div><dt>${e(SL.target)}</dt><dd>${e(s.target)}</dd></div>
          <div><dt>${e(SL.features)}</dt><dd>${e(s.features)}</dd></div>
          <div><dt>${e(SL.value)}</dt><dd>${e(s.value)}</dd></div>
        </dl>
        <a class="nsh-link" href="${e(inquiryHref(lang, "rental-saas"))}">${e(b.solutions.cta)} <span aria-hidden="true">→</span></a>
      </li>`
    )
    .join("")}</ul>${statusLine(c, b.solutions.status)}`;
  return [
    hero(c, b.hero, btn(pageHref(lang, "partnerships"), c.subnav[3].label, true) + btn(inquiryHref(lang, "business"), c.businessInquiry, true)),
    block("overview", head(b.overview.kicker, b.overview.title, "", { n: "01", id: "nsh-overview-t" }) + cards(b.overview.items, { cls: "nsh-cards--3" })),
    block("core", head(b.core.kicker, b.core.title, b.core.lead, { n: "02", id: "nsh-core-t" }) + core),
    block("revenue", head(b.revenue.kicker, b.revenue.title, b.revenue.lead, { n: "03", id: "nsh-revenue-t" }) + rev),
    block("solutions", head(b.solutions.kicker, b.solutions.title, b.solutions.lead, { n: "04", id: "nsh-solutions-t" }) + sol),
    block("models", head(b.models.kicker, b.models.title, "", { n: "05", id: "nsh-models-t" }) + cards(b.models.items, { cls: "nsh-cards--3 nsh-cards--values" })),
    closing("next", b.next.title, btn(pageHref(lang, "partnerships"), b.next.ctas[0]) + btn(inquiryHref(lang, "business"), b.next.ctas[1], true)),
  ].join("\n");
}

/* ───────────── 04 Partnerships ───────────── */
function partnerships(c, lang) {
  const p = c.partnerships;
  const L = p.labels;
  const types = `<ol class="nsh-partners" role="list">${p.types
    .map(
      (t) => `<li class="nsh-partner">
        <details class="nsh-partner__d">
          <summary class="nsh-partner__sum">
            <span class="nsh-card__n" aria-hidden="true">${e(t.n)}</span>
            <span class="nsh-partner__head"><span class="nsh-partner__title">${e(t.title)}</span><span class="nsh-partner__lead">${e(t.lead)}</span></span>
            <span class="nsh-partner__chev" aria-hidden="true"></span>
          </summary>
          <dl class="nsh-dl">
            <div><dt>${e(L.who)}</dt><dd>${e(t.who)}</dd></div>
            <div><dt>${e(L.resources)}</dt><dd>${e(t.resources)}</dd></div>
            <div><dt>${e(L.services)}</dt><dd>${e(t.services)}</dd></div>
            <div><dt>${e(L.value)}</dt><dd>${e(t.value)}</dd></div>
            <div><dt>${e(L.revenue)}</dt><dd>${e(t.revenue)}</dd></div>
            <div><dt>${e(L.terms)}</dt><dd>${e(t.terms)}</dd></div>
            <div><dt>${e(L.status)}</dt><dd>${e(c.status[t.status])}</dd></div>
          </dl>
          <a class="nsh-link" href="${e(inquiryHref(lang, `partner-${t.n}`))}">${e(c.partnershipInquiry)} <span aria-hidden="true">→</span></a>
        </details>
      </li>`
    )
    .join("")}</ol>`;
  const proc = `<ol class="nsh-steps nsh-steps--5" role="list">${p.process.steps
    .map((s) => `<li class="nsh-step"><span class="nsh-step__n" aria-hidden="true">${e(s.n)}</span><h3 class="nsh-step__title">${e(s.en)}</h3>${c.lang === "ko" ? `<p class="nsh-step__body">${e(s.label)}</p>` : ""}</li>`)
    .join("")}</ol>`;
  return [
    hero(c, p.hero, btn(inquiryHref(lang, "partnership"), c.partnershipInquiry)),
    block("types", `<p class="nsh-notice" role="note">${e(p.notice)}</p>` + head(p.typesKicker, p.typesTitle, "", { n: "01", id: "nsh-types-t" }) + types),
    block("process", head(p.process.kicker, p.process.title, p.process.lead, { n: "02", id: "nsh-process-t" }) + proc),
    closing("next", p.next.title, btn(inquiryHref(lang, "partnership"), p.next.cta)),
  ].join("\n");
}

/* ───────────── 05 Contact ───────────── */
function contact(c, lang) {
  const k = c.contact;
  const items = `<ol class="nsh-contact" role="list">${k.items
    .map(
      (it) => `<li class="nsh-contact__item">
        <span class="nsh-card__n" aria-hidden="true">${e(it.n)}</span>
        <div class="nsh-contact__main"><h3 class="nsh-card__title">${e(it.title)}</h3><p class="nsh-card__body">${e(it.body)}</p></div>
        <div class="nsh-contact__go">
          <a class="nsh-link" href="${e(inquiryHref(lang, it.slug))}">${e(k.formCta)}<span class="visually-hidden"> — ${e(it.title)}</span> <span aria-hidden="true">→</span></a>
          <a class="nsh-link nsh-link--muted" href="${e(mailHref(c, it.title))}">${e(k.mailCta)}<span class="visually-hidden"> — ${e(it.title)}</span></a>
        </div>
      </li>`
    )
    .join("")}</ol>`;
  const g = k.guide;
  const guide = `<ul class="nsh-guide" role="list">${g.items.map((t) => `<li>${e(t)}</li>`).join("")}</ul><p class="nsh-note"><a class="nsh-link nsh-link--muted" href="/${e(lang)}/privacy/">${e(g.privacy)}</a></p>`;
  return [
    hero(c, k.hero),
    block("types", head(k.kicker, k.title, k.lead, { n: "01", id: "nsh-types-t" }) + items),
    block("guide", head(g.kicker, g.title, "", { n: "02", id: "nsh-guide-t" }) + guide),
  ].join("\n");
}

const RENDER = { overview, platform, business, partnerships, contact };

export function renderShareonPage(lang, id) {
  const c = getShareonCopy(lang);
  const contentLang = c.contentLang !== lang ? ` lang="${e(c.contentLang)}"` : "";
  return `<div id="shareon-detail" class="nsh" data-shareon-page="${e(id)}" data-content-lang="${e(c.contentLang)}"${contentLang}>
  ${subnav(c, lang, id)}
  ${RENDER[id](c, lang)}
</div>`;
}

export { getShareonCopy };
