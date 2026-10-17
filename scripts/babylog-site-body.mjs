/**
 * BABYLOG corporate site — section HTML per page.
 *
 * Reuses the Life Stage (nls-*) component vocabulary and its stylesheet unchanged:
 *   nls-film hero, nls-head, nls-split/nls-roster, nls-rail + nls-decade (journey), nls-flow, nls-proc,
 *   nls-board, nls-index, nls-pipe, nls-dir, nls-close, nls-chips, nls-note, nls-btn.
 * BABYLOG-only additions (sub navigation, status labels, detail list) are bl-* classes in babylog-site.css,
 * scoped to #lifestage-detail.nls[data-story="babylog"].
 *
 * Information only: no form, input, login or commerce control is rendered here.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { BUSINESS } from "./six-businesses.mjs";
import { BL_NAV, BL_SLUG, getBabylogCopy, copyLangFor } from "./babylog-site-copy.mjs";

const esc = escapeHtml;
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");

export const pagePath = (lang, sub = "") => `/${lang}/${BL_SLUG}/${sub ? sub + "/" : ""}`;

/** Existing official inquiry form, passing the BABYLOG source and inquiry type (no new data path). */
export function inquiryHref(lang, page, code) {
  const source = `babylog-${page}${code ? "-" + code : ""}`;
  return `/${lang}/business/inquiry/?category=Partnership&source=${encodeURIComponent(source)}#inquiry`;
}

function titleBlock(kicker, title, lead, level = 2, id = "") {
  const tag = `h${level}`;
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${esc(kicker)}</p>` : ""}
    <${tag} class="nls-title"${id ? ` id="${id}"` : ""}>${nl(title)}</${tag}>
    ${lead ? `<p class="nls-lead">${esc(lead)}</p>` : ""}
  </header>`;
}

function chips(items) {
  return `<ul class="nls-chips">${(items || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
}

function statusChip(C, key) {
  return `<span class="bl-status bl-status--${esc(key)}">${esc(C.status[key])}</span>`;
}

function block(id, inner, band = false, cls = "") {
  return `<section id="${id}" class="nls-block${band ? " nls-block--band" : ""}${cls ? " " + cls : ""}" data-hs-section aria-labelledby="${id}-title">${inner}</section>`;
}

/** Compact or full dark hero. No video, no external media. */
function hero(C, lang, page, h, compact) {
  return `<div class="nls-film bl-film${compact ? " bl-film--compact" : ""}" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark">${esc(C.ui.wordmark)}</p>
        <h1 id="story-babylog-title" class="nls-film__slogan">${h.titleHtml}</h1>
        <p class="nls-film__lead">${esc(h.lead)}</p>
        <div class="nls-film__actions">
          ${heroActions(lang, page, h)}
        </div>
      </div>
    </div>
  </div>`;
}

function heroActions(lang, page, h) {
  const first = {
    overview: `<a class="nls-btn" href="${pagePath(lang, "platform")}">${esc(h.ctaMain)} →</a>`,
    platform: `<a class="nls-btn" href="#bl-access" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    business: `<a class="nls-btn" href="#bl-biz" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    partnerships: `<a class="nls-btn" href="#bl-types" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    contact: `<a class="nls-btn" href="#bl-contact-list" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
  }[page];
  const second = {
    overview: pagePath(lang, "partnerships"),
    platform: pagePath(lang, "contact"),
    business: pagePath(lang, "partnerships"),
    partnerships: pagePath(lang, "contact"),
    contact: pagePath(lang, "partnerships"),
  }[page];
  return `${first}
          <a class="nls-btn nls-btn--ghost" href="${second}">${esc(h.ctaSub)}</a>`;
}

/** The five-item BABYLOG menu. Same on every BABYLOG page; current page marked with aria-current. */
function subnav(C, lang, active) {
  const cl = copyLangFor(lang);
  const items = BL_NAV.map((it) => {
    const cur = it.id === active;
    return `<li><a class="bl-subnav__link${cur ? " is-current" : ""}" href="${pagePath(lang, it.sub)}"${cur ? ' aria-current="page"' : ""}>
        <span class="bl-subnav__n" aria-hidden="true">${it.n}</span>
        <span class="bl-subnav__en">${esc(it.en)}</span>
        <span class="bl-subnav__ko">${esc(cl === "ko" ? it.ko : it.en)}</span>
      </a></li>`;
  }).join("");
  return `<nav class="bl-subnav" aria-label="${esc(C.ui.menuLabel)}"><ul class="bl-subnav__list">${items}</ul></nav>`;
}

function legend(C) {
  return `<aside class="bl-legend" aria-label="${esc(C.status.legend)}">
    <p class="bl-legend__k">${esc(C.status.legend)}</p>
    <ul class="bl-legend__list">
      <li>${statusChip(C, "released")}</li>
      <li>${statusChip(C, "direction")}</li>
      <li>${statusChip(C, "review")}</li>
    </ul>
    <p class="nls-note">${esc(C.status.legendBody)}</p>
  </aside>`;
}

function closeBlock(C, lang, page, c, ctas) {
  return `<section id="bl-close" class="nls-block nls-close nls-block--ink" data-hs-section aria-labelledby="bl-close-title">
    <p class="nls-kicker">${esc(c.closeKicker || c.next?.kicker || "")}</p>
    <h2 class="nls-hero__title" id="bl-close-title">${c.closeTitleHtml || c.next.titleHtml}</h2>
    <p class="nls-lead">${esc(c.closeLead || c.next.lead)}</p>
    <p class="nls-note">${esc(C.ui.infoOnly)}</p>
    <div class="nls-actions">${ctas}</div>
  </section>`;
}

/* ------------------------------------------------------------------ Overview */
function overviewBody(C, lang) {
  const o = C.overview;
  const roster = o.vision.lines
    .map((p, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${esc(p)}</p></li>`)
    .join("");
  const rail = o.journey.items
    .map(
      (it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${it.id}" aria-pressed="${i === 0 ? "true" : "false"}">
        <em>${esc(it.n)}</em><span>${esc(it.age)}</span></button>`
    )
    .join("");
  const cards = o.journey.items
    .map(
      (it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${it.id}" data-scene="${it.id}">
        <div class="nls-decade__mark" aria-hidden="true"><b>${esc(it.age)}</b><em>${esc(it.n)}</em></div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${esc(it.n)}</p>
          <p class="nls-decade__age">${esc(it.age)}</p>
          <h3>${esc(it.name)}</h3>
          <p class="nls-decade__lead">${esc(it.lead)}</p>
          ${chips(it.topics)}
        </div>
      </article>`
    )
    .join("");
  const connect = o.connect.items
    .map((it) => `<article class="nls-flow__item"><span class="nls-flow__n">${esc(it.n)}</span><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`)
    .join("");
  const eco = o.ecosystem.items
    .map((it) => `<article class="nls-proc__item"><span class="nls-proc__n">${esc(it.n)}</span><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`)
    .join("");
  const opp = C.business.categories
    .map(
      (b) => `<li><span>${esc(b.code)}</span><strong><a class="bl-link" href="${pagePath(lang, "business")}#biz-${b.id}">${esc(b.en)} <em>${esc(b.name === b.en ? "" : b.name)}</em></a></strong></li>`
    )
    .join("");
  const dir = o.newon.items
    .map((s) => `<li><span>${esc(s.n)}</span><div><strong>${esc(s.name)}</strong><p>${esc(s.body)}</p></div></li>`)
    .join("");
  const ctas = `<a class="nls-btn" href="${pagePath(lang, "platform")}">${esc(C.ui.toPlatform)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "business")}">${esc(C.ui.toBusiness)}</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}">${esc(C.ui.toPartnerships)}</a>`;
  return {
    hero: hero(C, lang, "overview", o.hero, false),
    main: [
      subnav(C, lang, "overview"),
      block(
        "bl-vision",
        `<div class="nls-split">${titleBlock(o.vision.kicker, o.vision.title, "", 2, "bl-vision-title")}<ol class="nls-roster">${roster}</ol></div>`
      ),
      block(
        "bl-journey",
        `${titleBlock(o.journey.kicker, o.journey.title, o.journey.lead, 2, "bl-journey-title")}
    <div class="nls-rail" role="group" aria-label="${esc(o.journey.kicker.replace(/^\d+ · /, ""))}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    <p class="nls-note">${esc(o.journey.note)}</p>`,
        true,
        "nls-journey-sec"
      ),
      block("bl-connect", `${titleBlock(o.connect.kicker, o.connect.title, o.connect.lead, 2, "bl-connect-title")}<div class="nls-flow bl-flow4">${connect}</div>`),
      block("bl-ecosystem", `${titleBlock(o.ecosystem.kicker, o.ecosystem.title, o.ecosystem.lead, 2, "bl-ecosystem-title")}<div class="nls-proc">${eco}</div>`, true),
      block(
        "bl-opportunities",
        `${titleBlock(o.opportunities.kicker, o.opportunities.title, o.opportunities.lead, 2, "bl-opportunities-title")}
    <p class="nls-note">${esc(o.opportunities.note)}</p>
    <ol class="nls-index">${opp}</ol>`
      ),
      block(
        "bl-newon",
        `<div class="nls-split"><div>${titleBlock(o.newon.kicker, o.newon.title, o.newon.lead, 2, "bl-newon-title")}</div><ol class="nls-dir">${dir}</ol></div>
    ${legend(C)}`,
        true
      ),
      closeBlock(C, lang, "overview", o, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ Platform */
function platformBody(C, lang) {
  const p = C.platform;
  const secs = p.sections
    .map((s, i) => {
      const n = s.items.length;
      const items = s.items
        .map(
          (it) => `<article class="nls-board__item">
        <div class="nls-board__meta">${statusChip(C, it.status)}</div>
        <h3>${esc(it.name)}</h3>
        <p>${esc(it.lead)}</p>
      </article>`
        )
        .join("");
      return block(
        `bl-${s.id}`,
        `${titleBlock(s.kicker, s.title, s.lead, 2, `bl-${s.id}-title`)}
    <div class="nls-board bl-cols-${Math.min(n, 3)}">${items}</div>`,
        i % 2 === 1
      );
    })
    .join("\n");
  const a = p.access;
  const b = BUSINESS.babylog;
  const access = block(
    "bl-access",
    `${titleBlock(a.kicker, a.title, a.lead, 2, "bl-access-title")}
    <div class="nls-actions">
      <a class="nls-btn" href="${esc(b.stores.appStore)}" target="_blank" rel="noopener" data-analytics="app_store_babylog">${esc(a.appStore)}</a>
      <a class="nls-btn" href="${esc(b.stores.googlePlay)}" target="_blank" rel="noopener" data-analytics="google_play_babylog">${esc(a.googlePlay)}</a>
      <a class="nls-btn nls-btn--ghost" href="/${lang}/${BL_SLUG}/delete-account/">${esc(a.deleteNote)}</a>
    </div>
    <p class="nls-note">${esc(a.note)}</p>
    ${legend(C)}`,
    true
  );
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "platform", "app")}">${esc(C.ui.toInquiry)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "business")}">${esc(C.ui.toBusiness)}</a>`;
  return {
    hero: hero(C, lang, "platform", p.hero, true),
    main: [
      subnav(C, lang, "platform"),
      secs,
      access,
      closeBlock(C, lang, "platform", { closeKicker: C.contact.closeKicker, closeTitleHtml: C.contact.closeTitleHtml, closeLead: C.contact.closeLead }, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ Business */
function dl(rows) {
  return `<dl class="bl-dl">${rows
    .map(([k, v]) => `<div class="bl-dl__row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
    .join("")}</dl>`;
}

function businessBody(C, lang) {
  const b = C.business;
  const F = b.fields;
  const cards = b.categories
    .map((cat) => {
      const rows = [
        [F.overview, esc(cat.overview)],
        [F.customers, esc(cat.customers)],
        [F.problem, esc(cat.problem)],
        [F.value, esc(cat.value)],
        [F.revenue, esc(cat.revenue)],
        [F.partners, esc(cat.partners)],
        [F.status, statusChip(C, cat.status)],
      ];
      return `<article id="biz-${cat.id}" class="bl-biz" aria-labelledby="biz-${cat.id}-title">
      <header class="bl-biz__head">
        <span class="bl-biz__code" aria-hidden="true">${esc(cat.code)}</span>
        <div>
          <p class="nls-kicker">${esc(cat.en)}</p>
          <h3 id="biz-${cat.id}-title" class="bl-biz__title">${esc(cat.name)}</h3>
        </div>
      </header>
      ${chips(cat.items)}
      ${dl(rows)}
      <p class="bl-biz__cta"><a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}#partner-${cat.partnerType}" aria-label="${esc(F.cta)}: ${esc(cat.name)}">${esc(F.cta)} →</a></p>
    </article>`;
    })
    .join("\n");
  const intro = block(
    "bl-biz",
    `${titleBlock(b.intro.kicker, b.intro.title, b.intro.lead, 2, "bl-biz-title")}
    <p class="nls-note">${esc(C.ui.noOutsourcing)}</p>
    <p class="nls-note">${esc(C.ui.noPrice)}</p>
    <div class="bl-biz__list">${cards}</div>
    ${legend(C)}`
  );
  const ctas = `<a class="nls-btn" href="${pagePath(lang, "partnerships")}">${esc(C.ui.toPartnerships)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${inquiryHref(lang, "business", "")}">${esc(C.ui.inquiryCta)}</a>`;
  return {
    hero: hero(C, lang, "business", b.hero, true),
    main: [subnav(C, lang, "business"), intro, closeBlock(C, lang, "business", b, ctas)].join("\n"),
  };
}

/* -------------------------------------------------------------- Partnerships */
function partnershipsBody(C, lang) {
  const p = C.partnerships;
  const T = p.types;
  const steps = p.process.steps
    .map(
      (s, i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}"><p class="nls-pipe__n">${esc(s.n)}</p><h3>${esc(s.name)}</h3><p>${esc(s.body)}</p></article>`
    )
    .join("");
  const rail = T.items
    .map((it) => `<li><a class="bl-rail__link" href="#partner-${it.code}"><span aria-hidden="true">${esc(it.n)}</span> ${esc(it.name)}</a></li>`)
    .join("");
  const cards = T.items
    .map((it) => {
      const rows = [
        [T.fields.who, esc(it.who)],
        [T.fields.areas, esc(it.areas)],
        [T.fields.revenue, esc(it.revenue)],
        [T.fields.terms, esc(it.terms)],
        [T.fields.flow, esc(T.flowText)],
      ];
      return `<article id="partner-${it.code}" class="bl-biz" aria-labelledby="partner-${it.code}-title">
      <header class="bl-biz__head">
        <span class="bl-biz__code" aria-hidden="true">${esc(it.n)}</span>
        <div><h3 id="partner-${it.code}-title" class="bl-biz__title">${esc(it.name)}</h3></div>
      </header>
      ${dl(rows)}
      <p class="bl-biz__cta"><a class="nls-btn" href="${inquiryHref(lang, "partnerships", it.code)}">${esc(T.cta)} →</a></p>
    </article>`;
    })
    .join("\n");
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "partnerships", "")}">${esc(C.ui.inquiryCta)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "contact")}">${esc(C.ui.toInquiry)}</a>`;
  return {
    hero: hero(C, lang, "partnerships", p.hero, true),
    main: [
      subnav(C, lang, "partnerships"),
      block(
        "bl-process",
        `${titleBlock(p.process.kicker, p.process.title, p.process.lead, 2, "bl-process-title")}<div class="nls-pipe bl-pipe5">${steps}</div>`
      ),
      block(
        "bl-types",
        `${titleBlock(T.kicker, T.title, T.lead, 2, "bl-types-title")}
    <p class="nls-note">${esc(C.ui.noPartner)}</p>
    <nav class="bl-rail" aria-label="${esc(T.railLabel)}"><ol class="bl-rail__list">${rail}</ol></nav>
    <div class="bl-biz__list">${cards}</div>
    <p class="nls-note">${esc(C.ui.noPrice)}</p>`,
        true
      ),
      closeBlock(C, lang, "partnerships", p, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------- Contact */
function contactBody(C, lang) {
  const c = C.contact;
  const cards = c.list.items
    .map(
      (it) => `<li><a class="bl-card" href="${inquiryHref(lang, "contact", it.code)}" data-analytics="babylog_contact_${it.code}">
        <span class="bl-card__n" aria-hidden="true">${esc(it.n)}</span>
        <strong class="bl-card__t">${esc(it.name)}</strong>
        <span class="bl-card__d">${esc(it.lead)}</span>
        <span class="bl-card__go">${esc(c.list.go)}</span>
      </a></li>`
    )
    .join("");
  const guide = c.guide.items
    .map((it) => `<article class="nls-proc__item"><span class="nls-proc__n">${esc(it.n)}</span><h3>${esc(it.name)}</h3><p>${esc(it.body)}</p></article>`)
    .join("");
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "contact", "")}">${esc(C.ui.toInquiry)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}">${esc(C.ui.toPartnerships)}</a>`;
  return {
    hero: hero(C, lang, "contact", c.hero, true),
    main: [
      subnav(C, lang, "contact"),
      block("bl-contact-list", `${titleBlock(c.list.kicker, c.list.title, c.list.lead, 2, "bl-contact-list-title")}<ul class="bl-cards">${cards}</ul>`),
      block(
        "bl-guide",
        `${titleBlock(c.guide.kicker, c.guide.title, "", 2, "bl-guide-title")}<div class="nls-proc bl-proc3">${guide}</div>
    <p class="nls-note">${esc(C.ui.privacyNote)} <a class="bl-link" href="/${lang}/privacy/">${esc(C.ui.privacyLink)}</a></p>`,
        true
      ),
      closeBlock(C, lang, "contact", c, ctas),
    ].join("\n"),
  };
}

const BODY = { overview: overviewBody, platform: platformBody, business: businessBody, partnerships: partnershipsBody, contact: contactBody };

/** @returns {string} the <section id="lifestage-detail" data-story="babylog"> markup for one page */
export function renderBabylogSection(lang, page) {
  const C = getBabylogCopy(lang);
  const { hero: heroHtml, main } = BODY[page](C, lang);
  const fallbackLang = copyLangFor(lang) !== lang ? ` lang="${copyLangFor(lang)}"` : "";
  return `<section id="lifestage-detail" class="nls" data-story="babylog" data-bl-page="${page}"${fallbackLang} aria-labelledby="story-babylog-title">
    ${heroHtml}
  <div class="nls__wrap">
    <nav class="bl-crumb" aria-label="Breadcrumb"><ol>
      <li><a href="/${lang}/">${esc(C.ui.crumbHome)}</a></li>
      <li>${page === "overview" ? `<span aria-current="page">${esc(C.ui.crumbBabylog)}</span>` : `<a href="${pagePath(lang)}">${esc(C.ui.crumbBabylog)}</a>`}</li>
      ${page === "overview" ? "" : `<li><span aria-current="page">${esc(BL_NAV.find((n) => n.id === page)[copyLangFor(lang) === "ko" ? "ko" : "en"])}</span></li>`}
    </ol></nav>
    ${main}
  </div>
</section>`;
}
