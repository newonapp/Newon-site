/**
 * BABYLOG corporate site — section HTML per page.
 *
 * First screen: the Life Stage film hero (nls-film) and the shared flagship sub-menu, unchanged.
 * Below the hero (accent redesign 2026-10-19): BABYLOG's own bl-* layouts in /babylog-site.css, scoped to
 * #lifestage-detail.nls[data-story="babylog"], with BABYLOG pink as a point colour only. Section titles keep the
 * nls-head / nls-kicker / nls-title / nls-lead vocabulary; the interactive six-stage journey keeps nls-rail /
 * nls-decade (driven by home-lifestage.js). Layouts vary per section (bento, split rows, timelines, duo cards,
 * callouts, check lists, jump chips, CTA bands). No raster images or screenshots: icons are small inline SVG.
 *
 * Information only: no form, input, login or commerce control is rendered here.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { renderFlagshipSubnav } from "./flagship-subnav.mjs";
import { BUSINESS } from "./six-businesses.mjs";
import { BL_NAV, BL_SLUG, getBabylogCopy, copyLangFor } from "./babylog-site-copy.mjs";
import { renderBizContact, TYPES_ID } from "./biz-contact-kit.mjs";
import { babylogContactModel } from "./biz-contact-data.mjs";
import { unifiedContactHref } from "./unified-contact-links.mjs";
import { CS_PARTNER_CODES, IND_PARTNER_CODES } from "./babylog-expansion-copy.mjs";

const esc = escapeHtml;
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");

export const pagePath = (lang, sub = "") => `/${lang}/${BL_SLUG}/${sub ? sub + "/" : ""}`;

/** Inquiry buttons → the unified NEWON Contact page with BABYLOG preselected (owner, 2026-10-26).
 *  Type by page: platform → personal, business → business, partnerships → partnership. */
export function inquiryHref(lang, page, code) {
  const type = { business: "business", partnerships: "partnership" }[page] || "personal";
  return unifiedContactHref(lang, "babylog", { type, source: `babylog-${page}` });
}

/* ------------------------------------------------------------------ icons (inline SVG, decorative) */
const ICON_PATHS = {
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  sprout: '<path d="M12 20v-8"/><path d="M12 12c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6z"/><path d="M12 10c0-3 2.4-5.5 5.5-5.5 0 3-2.4 5.5-5.5 5.5z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7L11.5 6.8"/><path d="M14 10a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.1-1.1"/>',
  hand: '<path d="M4 14h3l3.5 2.5a2 2 0 0 0 1.2.4H17l3-3"/><path d="M7 14V9.5a1.5 1.5 0 0 1 3 0V12"/><path d="M12 6.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  access: '<circle cx="12" cy="5" r="1.6"/><path d="M5 8.5l7 1.5 7-1.5"/><path d="M12 10v4l-3 6"/><path d="M12 14l3 6"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M9 3.5v4M15 3.5v4"/>',
  book: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
  users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9.5" r="2.3"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  chat: '<path d="M5 5h14v10H10l-4 3.5V15H5z"/>',
  sparkle: '<path d="M12 3.5l1.8 5 5 1.8-5 1.8-1.8 5-1.8-5-5-1.8 5-1.8z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  chart: '<path d="M4 20h16"/><path d="M7 16v-4M12 16V8M17 16v-7"/>',
  photo: '<rect x="4" y="5.5" width="16" height="13" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20 15.5l-4.5-4.5L7 18.5"/>',
  baby: '<circle cx="12" cy="9" r="4.5"/><path d="M10.4 9.2h.01M13.6 9.2h.01"/><path d="M10.6 11.2a2 2 0 0 0 2.8 0"/><path d="M7 20a5 5 0 0 1 10 0"/>',
  building: '<path d="M5 20V6l7-2.5V20"/><path d="M12 9h7v11"/><path d="M8 9h1M8 12.5h1M8 16h1M15 12.5h1M15 16h1"/><path d="M3.5 20h17"/>',
  globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4c2.4 2.2 3.6 4.9 3.6 8s-1.2 5.8-3.6 8c-2.4-2.2-3.6-4.9-3.6-8S9.6 6.2 12 4z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  arrow: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  compass: '<circle cx="12" cy="12" r="8"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  store: '<path d="M4 9.5l1.5-5h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 12v8h13v-8"/>',
  mail: '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M4 7l8 6 8-6"/>',
};
function icon(name, cls = "bl-ico") {
  const p = ICON_PATHS[name] || ICON_PATHS.sparkle;
  return `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
}
const ico = (name) => `<span class="bl-ico-wrap" aria-hidden="true">${icon(name)}</span>`;

/* ------------------------------------------------------------------ shared pieces */
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

/** One shared scope notice per page (replaces the per-card status badges and the label legend, V2 2026-10-19). */
function scopeNote(C) {
  return `<p class="nls-note bl-scope">${esc(C.ui.scope)}</p>`;
}

/** Section. tone: "" (paper) | "accent" (the page's pale pink full-bleed band, used once or twice per page) |
 *  "band" (paper full-bleed band). Design pass v3 (2026-10-26): white surfaces by default, sections separated by a
 *  hairline; the earlier alternating "tint" bands are gone (owner: no grey/pale boxes, cleaner). */
function block(id, inner, tone = "", cls = "") {
  const t = tone === "pink" ? " nls-block--band bl6-pink" : tone === "accent" ? " nls-block--band bl-accent" : tone === "band" ? " nls-block--band" : "";
  return `<section id="${id}" class="nls-block bl-sec${t}${cls ? " " + cls : ""}" data-hs-section aria-labelledby="${id}-title">${inner}</section>`;
}

/** BABYLOG first-screen background (owner-provided, 2026-10-25): one seamless 5 s loop of the hillside scene,
 *  with its still plate as the paint-before-play fallback. Background only; text and layout unchanged. */
const BABYLOG_FILM = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/d2cb5bef-f92b-4e91-ae93-8dc6555e56ac.mp4";

/** Compact or full dark hero. No video, no external media. */
function hero(C, lang, page, h, compact) {
  return `<div class="nls-film bl-film${compact ? " bl-film--compact" : ""}" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${BABYLOG_FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${BABYLOG_FILM}" type="video/mp4" />
      </video>
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
    overview: `<a class="nls-btn" href="#bl-vision" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    platform: `<a class="nls-btn" href="#bl-access" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    business: `<a class="nls-btn" href="#bl-biz" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    partnerships: `<a class="nls-btn" href="#bl-types" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    contact: `<a class="nls-btn" href="#${TYPES_ID}" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
  }[page];
  const second = {
    overview: pagePath(lang, "platform"),
    platform: pagePath(lang, "business"),
    business: pagePath(lang, "partnerships"),
    partnerships: inquiryHref(lang, "partnerships", ""),
    contact: pagePath(lang, "partnerships"),
  }[page];
  return `${first}
          <a class="nls-btn nls-btn--ghost" href="${second}">${esc(h.ctaSub)}</a>`;
}

function closeBlock(C, lang, page, c, ctas) {
  return `<section id="bl-close" class="nls-block nls-close nls-block--ink bl-close" data-hs-section aria-labelledby="bl-close-title">
    <p class="nls-kicker">${esc(c.closeKicker || c.next?.kicker || "")}</p>
    <h2 class="nls-hero__title" id="bl-close-title">${c.closeTitleHtml || c.next.titleHtml}</h2>
    <p class="nls-lead">${esc(c.closeLead || c.next.lead)}</p>
    <p class="nls-note">${esc(C.ui.infoOnly)}</p>
    <div class="nls-actions">${ctas}</div>
  </section>`;
}

/** Shared child-safety notices. Plan status, Korea-based systems, emergency routing, no child data. */
function csNotices(C, withEmergency = true) {
  return `<aside class="bl-notice" aria-label="${esc(C.x.platform.cs.kicker)}">
    <div class="bl-notice__text">
      <p class="nls-note">${esc(C.ui.csNote)}</p>
      <p class="nls-note">${esc(C.ui.koreaNote)}</p>
    </div>
    ${
      withEmergency
        ? `<div class="bl-emergency" role="note">${icon("alert", "bl-emergency__ico")}<div><p class="bl-emergency__t">${esc(C.ui.emergencyTitle)}</p><p>${esc(C.ui.emergencyBody)}</p><p>${esc(C.ui.noChildData)}</p></div></div>`
        : ""
    }
  </aside>`;
}

function dl(rows, cls = "") {
  return `<dl class="bl-dl${cls ? " " + cls : ""}">${rows
    .map(([k, v]) => `<div class="bl-dl__row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
    .join("")}</dl>`;
}

/** Data table (v3): real <table>; on phones each row stacks and every cell carries its column label.
 *  rows: arrays of cell strings (already escaped HTML allowed via raw: true); the first cell is the row header. */
function dtable(heads, rows, cls = "", { raw = false, caption = "" } = {}) {
  const cell = (v) => (raw ? v : esc(v));
  return `<div class="bl-dtable-wrap${cls ? " " + cls : ""}"><table class="bl-dtable">${caption ? `<caption class="bl-dtable__cap">${esc(caption)}</caption>` : ""}
    <thead><tr>${heads.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map((r) => `<tr>${r.map((v, i) => (i === 0 ? `<th scope="row" data-label="${esc(heads[0])}">${cell(v)}</th>` : `<td data-label="${esc(heads[i])}">${cell(v)}</td>`)).join("")}</tr>`)
      .join("")}</tbody>
  </table></div>`;
}

/** Jump chips (anchor links only; no hidden tabs). n is shown only when it is an existing ID (category 01–08, area 25–32). */
function jump(label, items, cls = "") {
  return `<nav class="bl-rail${cls ? " " + cls : ""}" aria-label="${esc(label)}"><ol class="bl-rail__list">${items
    .map(([href, n, name]) => `<li><a class="bl-rail__link" href="${href}">${n ? `<span aria-hidden="true">${esc(n)}</span> ` : ""}${esc(name)}</a></li>`)
    .join("")}</ol></nav>`;
}

/* --- design pass v4 (2026-10-26): illustrative screens and progressive tab sets ----------------------------- */
/** Short labels for the new visuals only (no new facts). */
const V4 = {
  ko: { mock: "예시 화면", mockNote: "이해를 돕기 위한 예시 화면이며 실제 앱 화면과 다를 수 있습니다." },
  en: { mock: "Illustrative", mockNote: "An illustrative screen to explain the idea; the actual app may look different." },
};
const v4 = (lang) => V4[copyLangFor(lang) === "ko" ? "ko" : "en"];

/** Phone-shaped illustrative screen (HTML/CSS only, aria-hidden visuals stay out; the content is real copy). */
function phone(lang, { title, label, body, tabbar = "", cls = "", decorative = false }) {
  return `<figure class="bl-mock${cls ? " " + cls : ""}">
    <div class="bl-mock__device"${decorative ? ' aria-hidden="true"' : ""}>
      <div class="bl-mock__bar"><span class="bl-mock__brand">BabyLog</span><span class="bl-mock__chip">${esc(v4(lang).mock)}</span></div>
      <div class="bl-mock__screen">${title ? `<p class="bl-mock__title">${esc(title)}</p>` : ""}${label ? `<p class="bl-mock__label">${esc(label)}</p>` : ""}${body}</div>
      ${tabbar}
    </div>
    <figcaption class="bl-mock__cap">${esc(v4(lang).mockNote)}</figcaption>
  </figure>`;
}

/** Progressive tab set: the markup is an anchor rail + panels (all visible without JS); /babylog-site inline JS
 *  turns [data-bl-tabs] into an ARIA tablist (arrow keys, Home/End) and opens the panel a #hash points into. */
const tabsAttr = (label) => ` data-bl-tabs data-bl-tabs-label="${esc(label)}"`;

/* --- reusable item layouts (redesign 2026-10-25: fewer boxes, larger type, numbers only for real sequences) --- */
/** Numbered sequence (real order only). No connector line or dots: a top rule per step, the first in pink. */
function steps(items, h = 3, cls = "") {
  return `<ol class="bl-steps${cls ? " " + cls : ""}" style="--bl-n:${items.length}">${items
    .map((it, i) => `<li class="bl-steps__item"><p class="bl-steps__n">${esc(it.n || String(i + 1).padStart(2, "0"))}</p><h${h}>${esc(it.name)}</h${h}><p>${esc(it.body ?? it.lead)}</p></li>`)
    .join("")}</ol>`;
}
/** Vertical numbered sequence: big numeral left, text right (used where a split layout suits a sequence). */
function vsteps(items, h = 3) {
  return `<ol class="bl-vsteps">${items
    .map((it, i) => `<li class="bl-steps__item"><p class="bl-steps__n">${esc(it.n || String(i + 1).padStart(2, "0"))}</p><div><h${h}>${esc(it.name)}</h${h}><p>${esc(it.body ?? it.lead)}</p></div></li>`)
    .join("")}</ol>`;
}
/** Stacked rows (optional icon · title · text) separated by hairlines. */
function rows(items, icons, h = 3, cls = "") {
  return `<ul class="bl-rows${cls ? " " + cls : ""}">${items
    .map((it, i) => `<li class="bl-rows__item">${icons ? ico(icons[i % icons.length]) : ""}<div><h${h}>${esc(it.name)}</h${h}><p>${esc(it.lead ?? it.body)}</p></div></li>`)
    .join("")}</ul>`;
}
/** Check list (2 columns on wide screens). */
function checks(items, h = 3, cls = "") {
  return `<ul class="bl-checks${cls ? " " + cls : ""}">${items
    .map((it) => `<li class="bl-checks__item"><span class="bl-checks__mark" aria-hidden="true">${icon("check")}</span><div><h${h}>${esc(it.name)}</h${h}><p>${esc(it.lead ?? it.body)}</p></div></li>`)
    .join("")}</ul>`;
}
/** Feature columns: no card boxes, a hairline on top, optional small icon. */
function features(items, icons, h = 3, cls = "") {
  return `<div class="bl-feat${cls ? " " + cls : ""}">${items
    .map((it, i) => `<article class="bl-feat__item">${icons ? ico(icons[i % icons.length]) : ""}<h${h}>${esc(it.name)}</h${h}><p>${esc(it.lead ?? it.body)}</p></article>`)
    .join("")}</div>`;
}
/** Filled tiles. */
function icards(items, icons, h = 3, cls = "") {
  return `<div class="bl-icards${cls ? " " + cls : ""}">${items
    .map((it, i) => `<article class="bl-icard">${icons ? ico(icons[i % icons.length]) : ""}<h${h}>${esc(it.name)}</h${h}><p>${esc(it.lead ?? it.body)}</p></article>`)
    .join("")}</div>`;
}
/** Two large panels side by side. */
function duo(items, icons, h = 3, cls = "") {
  return `<div class="bl-duo${cls ? " " + cls : ""}">${items
    .map((it, i) => `<article class="bl-duo__item">${ico(icons[i % icons.length])}<h${h}>${esc(it.name)}</h${h}><p>${esc(it.lead ?? it.body)}</p></article>`)
    .join("")}</div>`;
}

/** Status board: one column per stage — status is expressed by grouping, never by a per-card badge. The first column
 *  (what exists today) is set apart from the plan columns. */
function board(columns, note = "") {
  const cols = columns
    .map(
      (c, i) => `<article class="bl-board__col${i === 0 ? " is-now" : ""}" data-stage="${esc(c.id || "")}"><h3 class="bl-board__t"><span class="bl-stage">${esc(c.name)}</span><span class="bl-board__count" aria-hidden="true">${(c.items || []).length}</span></h3><ul class="bl-board__list">${(c.items || [])
        .map((t) => `<li>${esc(t)}</li>`)
        .join("")}</ul><p class="bl-board__basis">${esc(c.basis)}</p></article>`
    )
    .join("");
  return `<div class="bl-board" style="--bl-n:${columns.length}">${cols}</div>${note ? `<p class="nls-note bl-board__note">${esc(note)}</p>` : ""}`;
}
/** Design pass v5 (2026-10-27): the status board as full-width stage rows — stage label, count and basis on the
 *  left, that stage's items as an even three-column list on the right — so no column ends with an empty bottom. */
function stageRows(columns, note = "") {
  const rowsHtml = columns
    .map(
      (c, i) => `<article class="bl-srow${i === 0 ? " is-now" : ""}" data-stage="${esc(c.id || "")}">
      <header class="bl-srow__head"><h3 class="bl-srow__t"><span class="bl-stage">${esc(c.name)}</span><span class="bl-srow__count">${(c.items || []).length}</span></h3><p class="bl-srow__basis">${esc(c.basis)}</p></header>
      <ul class="bl-srow__list">${(c.items || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    </article>`
    )
    .join("");
  return `<div class="bl-srows">${rowsHtml}</div>${note ? `<p class="nls-note bl-board__note">${esc(note)}</p>` : ""}`;
}
/** Compact cards with a stacked definition list. */
function dcards(items, fields, h, cta) {
  return items
    .map((it) => {
      const code = it.code && !/^pilot-/.test(it.code) ? `<p class="bl-biz__tag">${esc(it.code)}</p>` : "";
      return `<article${it.id ? ` id="${it.id}"` : ""} class="bl-biz bl-biz--compact">
      <header class="bl-biz__head"><div>${code}<h${h} class="bl-biz__title">${esc(it.name)}</h${h}></div></header>
      ${dl(fields.map(([k, label]) => [label, esc(it[k])]), "bl-dl--stack")}
      ${cta ? `<p class="bl-biz__cta"><a class="bl-arrow" href="${cta.href(it)}">${esc(cta.label)} ${icon("arrow")}</a></p>` : ""}
    </article>`;
    })
    .join("\n");
}

/* --- design pass v6 (2026-10-27): compact accordions with informative summary rows, the solid pink band, timelines --- */
/** Accordion list. Each summary row carries the key information (number, title, a short line, an aside) so the list can be
 *  scanned closed; the inline script opens the item a #hash points to (or into). */
function acc(items, cls = "") {
  return `<div class="bl6-acc${cls ? " " + cls : ""}">${items
    .map((it) => {
      const h = it.h || "h3";
      return `<details class="bl6-acc__item${it.cls ? " " + it.cls : ""}"${it.id ? ` id="${it.id}"` : ""}${it.attr || ""}${it.open ? " open" : ""}>
      <summary class="bl6-acc__sum">${it.n ? `<span class="bl6-acc__n" aria-hidden="true">${esc(it.n)}</span>` : ""}<span class="bl6-acc__main">${it.kicker ? `<span class="bl6-acc__kicker">${esc(it.kicker)}</span>` : ""}<${h} class="bl6-acc__t"${it.tid ? ` id="${it.tid}"` : ""}>${esc(it.title)}</${h}>${it.sub ? `<span class="bl6-acc__sub">${it.sub}</span>` : ""}</span>${it.aside ? `<span class="bl6-acc__aside">${it.aside}</span>` : ""}<span class="bl6-acc__chev" aria-hidden="true"></span></summary>
      <div class="bl6-acc__body">${it.body}</div>
    </details>`;
    })
    .join("\n")}</div>`;
}
/** Simple list of label/value rows as an outlined key-value table (no <table> needed for two short columns). */
function kv(rows, cls = "") {
  return `<dl class="bl6-kv${cls ? " " + cls : ""}">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;
}
const dots = (list) => (list || []).map((t) => esc(t)).join('<span class="bl6-dot" aria-hidden="true"> · </span>');

/* ------------------------------------------------------------------ Overview */
function overviewBody(C, lang) {
  const o = C.overview;
  const X = C.x.overview;
  const V = C.v6.overview;
  const ST = C.c30.status.columns;

  // About — editorial statement left, an illustrative phone screen right (what the app offers today)
  const [visionLead, ...visionRest] = o.vision.lines;
  const nowCol = ST[0];
  const nowIcons = ["baby", "calendar", "heart", "chart", "chart", "calendar", "users", "sparkle", "lock"];
  const todayList = `<ul class="bl-mock__list">${nowCol.items
    .slice(0, 7)
    .map((t, i) => `<li>${icon(nowIcons[i % nowIcons.length], "bl-mock__ico")}<span>${esc(t)}</span></li>`)
    .join("")}</ul>`;
  const vision = block(
    "bl-vision",
    `<div class="bl-hero2">
      <div class="bl-hero2__text">
        <div class="bl-intro">${titleBlock(o.vision.kicker, o.vision.title, "", 2, "bl-vision-title")}<p class="bl-statement__lead">${esc(visionLead)}</p></div>
        <div class="bl-cols bl-cols--stack">${visionRest.map((p) => `<p class="bl-statement__p">${esc(p)}</p>`).join("")}</div>
      </div>
      ${phone(lang, { title: nowCol.name, body: todayList, cls: "bl-mock--today" })}
    </div>`
  );

  // Mission — six values as large words on hairlines (no boxes)
  const valueIcons = ["heart", "sprout", "link", "hand", "shield", "access"];
  const values = o.connect.items
    .map((it, i) => `<article class="bl-val"><header class="bl6-word">${icon(valueIcons[i % 6], "bl6-word__ico")}<h3>${esc(it.name)}</h3></header><p>${esc(it.lead)}</p></article>`)
    .join("");
  const connect = block("bl-connect", `${titleBlock(o.connect.kicker, o.connect.title, o.connect.lead, 2, "bl-connect-title")}<div class="bl-values bl6-words">${values}</div>`);

  const O30 = C.c30.overview;
  // Problem → solution — comparison rows
  const [pL, sL] = O30.problem.kicker.split("→").map((s) => s.trim());
  const problemRows = O30.problem.items
    .map((it) => `<li class="bl-vs__row"><h3 class="bl-vs__a">${esc(it.name)}</h3><span class="bl-vs__arrow" aria-hidden="true">${icon("arrow")}</span><p class="bl-vs__b">${esc(it.lead)}</p></li>`)
    .join("");
  const problem = block(
    "bl-problem",
    `${titleBlock(O30.problem.kicker, O30.problem.title, O30.problem.lead, 2, "bl-problem-title")}
    <div class="bl-vs">${sL ? `<p class="bl-vs__head" aria-hidden="true"><span>${esc(pL)}</span><span></span><span>${esc(sL)}</span></p>` : ""}<ul class="bl-vs__list">${problemRows}</ul></div>`
  );
  // Customers (bento, the core family first and largest) and typical moments
  const moments = O30.who.moments.map((it) => `<li class="bl-scene"><h4>${esc(it.name)}</h4><p>${esc(it.body ?? it.lead)}</p></li>`).join("");
  const who = block(
    "bl-who",
    `${titleBlock(O30.who.kicker, O30.who.title, O30.who.lead, 2, "bl-who-title")}
    ${icards(O30.who.customers, ["baby", "users", "book", "building"], 3, "bl-icards--who")}
    <h3 class="bl-sub bl-sub--lg">${esc(O30.who.momentsTitle)}</h3>
    <ul class="bl-scenes">${moments}</ul>`
  );
  // Differentiation hypotheses — comparison table
  const DF = C.v3.overview.diffFields;
  const diffRows = O30.diff.items.map((it) => {
    const [a, b] = it.name.split("→").map((s) => s.trim());
    return [esc(b ? a : ""), `<strong>${esc(b || it.name)}</strong>`, esc(it.lead)];
  });
  const diff = block("bl-diff", `${titleBlock(O30.diff.kicker, O30.diff.title, O30.diff.lead, 2, "bl-diff-title")}${dtable([DF.a, DF.b, DF.why], diffRows, "bl-dtable--cmp", { raw: true })}`);
  // Current service status — four stage rows
  const now = block(
    "bl-now",
    `${titleBlock(O30.now.kicker, O30.now.title, O30.now.lead, 2, "bl-now-title")}
    ${stageRows(ST, C.c30.status.note)}
    <p class="bl-biz__cta"><a class="bl-arrow" href="${pagePath(lang, "platform")}#bl-roadmap">${esc(C.c30.status.more)} ${icon("arrow")}</a></p>`
  );

  // v6: the six growth stages as a 20-year timeline, every stage visible; status is shown by grouping
  // (what the app covers today | what is planned), never by a per-card badge.
  const VJ = V.journey;
  const stage = (it) => {
    const s = VJ.stages[it.id] || {};
    return `<li class="bl6-tl__item" data-nls-decade-card="${it.id}">
        <p class="bl6-tl__top"><span class="bl6-tl__n">${esc(it.n)}</span><span class="bl6-tl__age">${esc(it.age)}</span></p>
        <h3>${esc(it.name)}</h3>
        <p class="bl6-tl__lead">${esc(it.lead)}</p>
        ${s.focus ? `<p class="bl6-tl__focus"><b>${esc(VJ.focusLabel)}</b>${esc(s.focus)}</p>` : ""}
        <ul class="bl6-tl__chips">${it.topics.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        ${s.manage ? `<p class="bl6-tl__manage">${icon("users", "bl6-tl__ico")}<span><b>${esc(VJ.manageLabel)}</b>${esc(s.manage)}</span></p>` : ""}
      </li>`;
  };
  const tlGroup = (key, label, list) =>
    `<div class="bl6-tl__grp bl6-tl__grp--${key}"><p class="bl6-tl__label"><span class="bl-stage">${esc(label)}</span><span class="bl6-tl__range">${esc(list[0].n)}–${esc(list[list.length - 1].n)}</span></p><ol class="bl6-tl">${list.map(stage).join("")}</ol></div>`;
  const jNow = o.journey.items.filter((it) => (VJ.stages[it.id] || {}).status === "now");
  const jPlan = o.journey.items.filter((it) => (VJ.stages[it.id] || {}).status !== "now");
  const journey = block(
    "bl-journey",
    `${titleBlock(o.journey.kicker, o.journey.title, o.journey.lead, 2, "bl-journey-title")}
    <div class="bl6-tls">${tlGroup("now", ST[0].name, jNow)}${tlGroup("plan", ST[2].name, jPlan)}</div>
    ${scopeNote(C)}`
  );

  // Core experience — bento
  const dailyIcons = ["baby", "chart", "heart", "users", "calendar", "chat", "home", "shield"];
  const bento = X.daily.items
    .map((it, i) => `<article class="bl-bento__item${[0, 1, 6, 7].includes(i) ? " is-wide" : ""}">${ico(dailyIcons[i % 8])}<h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`)
    .join("");
  const daily = block("bl-daily", `${titleBlock(X.daily.kicker, X.daily.title, X.daily.lead, 2, "bl-daily-title")}<div class="bl-bento">${bento}</div>`);

  // For families — split: text + four points left, an illustrative "family sharing" screen right
  const roles = C.c30.platform.roles.items;
  const famIcons = ["users", "heart", "hand", "sprout"];
  const famScreen = `<ul class="bl-mock__list bl-mock__list--people">${roles
    .map((r, i) => `<li>${icon(famIcons[i % 4], "bl-mock__ico")}<span>${esc(r.name)}</span></li>`)
    .join("")}</ul>`;
  const health = block(
    "bl-health",
    `<div class="bl6-split">
      <div class="bl6-split__text">${titleBlock(X.health.kicker, X.health.title, X.health.lead, 2, "bl-health-title")}
      ${rows(X.health.items, ["users", "lock", "calendar", "shield"], 3, "bl6-rows")}</div>
      ${phone(lang, { title: V.familyMock.title, label: V.familyMock.label, body: famScreen, cls: "bl-mock--family" })}
    </div>`
  );

  // Beyond parenting | Lifestyle & services — two halves of one band (both halves filled)
  const net = o.ecosystem.items.map((it) => `<article class="bl-net__item"><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`).join("");
  const ecosystem = block("bl-ecosystem", `${titleBlock(o.ecosystem.kicker, o.ecosystem.title, o.ecosystem.lead, 2, "bl-ecosystem-title")}<div class="bl-net">${net}</div>`);
  const parentEco = block("bl-parent-eco", `${titleBlock(X.parentEco.kicker, X.parentEco.title, X.parentEco.lead, 2, "bl-parent-eco-title")}${icards(X.parentEco.items, ["bag", "hand", "book", "chat"], 3, "bl-icards--2x2")}`);
  const ecoPair = `<div class="bl-pair bl6-pair">${ecosystem}${parentEco}</div>`;

  // Trust — check list + "what we do not do" table
  const LM = C.v3.overview.limits;
  const trust = block(
    "bl-trust",
    `${titleBlock(X.trust.kicker, X.trust.title, X.trust.lead, 2, "bl-trust-title")}${checks(X.trust.items, 3, "bl-checks--3")}
    <div class="bl-subhead"><h3 class="bl-sub bl-sub--lg">${nl(LM.title)}</h3><p class="nls-lead">${esc(LM.lead)}</p></div>
    ${dtable([LM.fields.area, LM.fields.no, LM.fields.instead], LM.items, "bl-dtable--limits")}`
  );

  // Business opportunities — the page's one solid pink band: six model tiles + the 8-category index
  const models = C.business.categories
    .map(
      (b) => `<li><a class="bl-link bl-model" href="${pagePath(lang, "business")}#biz-${b.id}"><span class="bl-model__code" aria-hidden="true">${esc(b.code)}</span><strong>${esc(b.en)}</strong>${b.name === b.en ? "" : `<em>${esc(b.name)}</em>`}<span class="bl-model__go" aria-hidden="true">${icon("arrow")}</span></a></li>`
    )
    .join("");
  const cats = C.x.business.groups.cats;
  const catIndex = cats
    .map(
      (c) => `<li><a class="bl-link bl-catrow" href="${pagePath(lang, "business")}#cat-${c.id}"><span class="bl-catrow__n">${esc(c.id)}</span><strong>${esc(c.en)}</strong>${c.name === c.en ? "" : `<em>${esc(c.name)}</em>`}</a></li>`
    )
    .join("");
  const opportunities = block(
    "bl-opportunities",
    `${titleBlock(o.opportunities.kicker, o.opportunities.title, o.opportunities.lead, 2, "bl-opportunities-title")}
    <ol class="bl-models">${models}</ol>
    <div class="bl-split bl-split--index">
      <div><h3 class="bl-sub bl-sub--lg">${esc(X.groupsIndex.kicker)} · ${esc(X.groupsIndex.title.replace(/\n/g, " "))}</h3>
      <p class="nls-lead">${esc(X.groupsIndex.lead)}</p></div>
      <ol class="bl-catlist">${catIndex}</ol>
    </div>`,
    "pink"
  );

  // Child safety & social impact — dark band (kept), with the inclusive scope of the plan (§1)
  const impactItems = X.impact.items
    .map((it) => `<li><span>${esc(it.n)}</span><div><strong>${esc(it.name)}</strong><p>${esc(it.lead)}</p></div></li>`)
    .join("");
  const impact = `<section id="bl-impact" class="nls-block nls-block--ink bl-impact" data-hs-section aria-labelledby="bl-impact-title">
    <div class="bl-split">
      <div>
        ${titleBlock(X.impact.kicker, X.impact.title, "", 2, "bl-impact-title")}
        <p class="nls-lead">${esc(X.impact.body)}</p>
        <p class="bl6-impact__scope">${esc(V.impactScope)}</p>
        <div class="nls-actions">
          <a class="nls-btn" href="${pagePath(lang, "business")}#cat-07">${esc(X.impact.ctaBusiness)} →</a>
          <a class="nls-btn nls-btn--ghost" href="${esc(unifiedContactHref(lang, "babylog", { type: "partnership", source: "babylog-overview" }))}">${esc(X.impact.ctaPartner)}</a>
        </div>
      </div>
      <ol class="bl-ilist">${impactItems}</ol>
    </div>
    <div class="bl-impact__notes">
      <p class="nls-note">${esc(C.ui.csNote)}</p>
      <p class="nls-note">${esc(C.ui.koreaNote)}</p>
    </div>
  </section>`;

  // Global vision (future plan)
  const GO = C.c30.global.overview;
  const globalVision = block(
    "bl-global",
    `${titleBlock(GO.kicker, GO.title, GO.lead, 2, "bl-global-title")}
    ${features(GO.items, ["sprout", "shield", "link"], 3, "bl-feat--3")}
    <p class="nls-note">${esc(GO.note)}</p>
    <p class="bl-biz__cta"><a class="bl-arrow" href="${pagePath(lang, "platform")}#bl-global">${esc(GO.more)} ${icon("arrow")}</a></p>`
  );

  // NEWON connection — statement + four principles
  const principles = o.newon.items.map((s) => `<li><h3>${esc(s.name)}</h3><p>${esc(s.body)}</p></li>`).join("");
  const newon = block("bl-newon", `<div class="bl-callout">${titleBlock(o.newon.kicker, o.newon.title, o.newon.lead, 2, "bl-newon-title")}<ol class="bl-pr">${principles}</ol></div>`);

  // NEWON ecosystem — six platform tiles, BABYLOG highlighted
  const PLK = C.v3.overview.links;
  const plats = X.platforms.items
    .map((s2, i) => {
      const link = PLK.items[s2.name];
      return `<li class="bl-plat${i === 0 ? " is-self" : ""}"><h3>${esc(s2.name)}</h3><p>${esc(s2.body)}</p>${link ? `<p class="bl-plat__link"><span>${esc(PLK.label)}</span>${esc(link)}</p>` : ""}</li>`;
    })
    .join("");
  const platforms = block(
    "bl-platforms",
    `${titleBlock(X.platforms.kicker, X.platforms.title, X.platforms.lead, 2, "bl-platforms-title")}<ol class="bl-plats">${plats}</ol><p class="nls-note">${esc(X.platforms.note)}</p>`
  );

  const ctas = `<a class="nls-btn" href="${pagePath(lang, "platform")}">${esc(C.ui.toPlatform)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}">${esc(C.ui.toPartnershipsLearn)}</a>`;
  return {
    hero: hero(C, lang, "overview", o.hero, false),
    main: [vision, connect, problem, who, journey, daily, health, ecoPair, diff, trust, now, opportunities, impact, globalVision, newon, platforms, closeBlock(C, lang, "overview", o, ctas)].join("\n"),
  };
}

/* ------------------------------------------------------------------ Platform */
const CHAPTER_ICONS = { growth: "sprout", records: "chart", family: "users", learning: "book", memories: "photo", assist: "sparkle", explore: "compass", trust: "shield" };

function platformBody(C, lang) {
  const p = C.platform;
  const X = C.x.platform;
  const sc = X.screens;
  const AD = C.v3.platform.detail;
  const V = C.v6.platform;
  const detailOf = (n) => AD.areas[n] || V.areas[n] || null;

  // 27 long-term areas in five groups: group label left, a compact accordion right. The closed row shows the number,
  // name and what the area covers; the opened row adds the description, today's status and the detail table.
  const areaItem = (it) => {
    const d = detailOf(it.n);
    const f = (d && d.fields) || AD.fields;
    const sub = d ? dots(d.rows.map((r) => r[0])) : "";
    return {
      id: `bl-area-${it.n}`,
      cls: "bl-area",
      attr: ` data-bl-area="${esc(it.n)}"`,
      n: it.n,
      kicker: it.en,
      title: it.name,
      h: "h4",
      sub,
      body: `<p class="bl6-area__lead">${esc(it.lead)}</p>${
        d
          ? `<div class="bl6-area__grid"><div><p class="bl6-area__now">${icon("info", "bl6-area__ico")}<span>${esc(d.now)}</span></p><p class="nls-note">${esc(d.note)}</p></div>${dtable([f.k, f.v], d.rows, "bl-dtable--kv")}</div>`
          : ""
      }`,
    };
  };
  const screenGroups = sc.groups
    .map(
      (g) => `<div class="bl-scr__grp" id="bl-scr-${g.id}" role="group" aria-labelledby="bl-${g.id}-t">
      <div class="bl-scr__label"><p class="bl-scr__range" aria-hidden="true">${esc(g.items[0].n)}${g.items.length > 1 ? `–${esc(g.items[g.items.length - 1].n)}` : ""}</p><h3 class="bl-group__t" id="bl-${g.id}-t">${esc(g.name)}</h3><p class="bl6-scr__count">${g.items.length}</p></div>
      ${acc(g.items.map(areaItem), "bl6-acc--areas")}
    </div>`
    )
    .join("");
  const screens = block(
    "bl-screens",
    `${titleBlock(sc.kicker, sc.title, sc.lead, 2, "bl-screens-title")}
    ${scopeNote(C)}
    ${jump(sc.kicker, sc.groups.map((g) => [`#bl-scr-${g.id}`, "", `${g.name.split(" · ")[0]} · ${g.name.split(" · ").slice(copyLangFor(lang) === "ko" ? -1 : 1).join(" · ")} (${g.items.length})`]), "bl-rail--seg")}
    <div class="bl-scr bl6-scr">${screenGroups}</div>`
  );

  const P30 = C.c30.platform;
  const sections = p.sections.map((s) => (s.id === "trust" ? { ...s, items: [...s.items, ...P30.trustExtra] } : s));
  const MN = C.v3.platform.menu;
  const flow = block(
    "bl-flow",
    `${titleBlock(P30.flow.kicker, P30.flow.title, P30.flow.lead, 2, "bl-flow-title")}
    ${steps(P30.flow.items, 3, "bl-steps--5")}
    <p class="nls-note">${esc(P30.flow.note)}</p>
    <div class="bl-menu">
      <div class="bl-subhead"><h3 class="bl-sub bl-sub--lg">${esc(MN.title)}</h3><p class="nls-lead">${esc(MN.lead)}</p></div>
      <div class="bl-menu__split">
        ${phone(lang, {
          title: MN.items[0].name,
          body: MN.items
            .map(
              (it, i) => `<div class="bl-mock__pane${i === 0 ? " is-on" : ""}" data-bl-pane="${i}"><ul class="bl-mock__chips">${it.lead
                .split(/[·,]\s*/)
                .map((t) => `<li>${esc(t.trim())}</li>`)
                .join("")}</ul></div>`
            )
            .join(""),
          tabbar: `<div class="bl-mock__tabbar" aria-hidden="true">${MN.items.map((it, i) => `<span class="bl-mock__tab${i === 0 ? " is-on" : ""}" data-bl-tab="${i}">${esc(it.name)}</span>`).join("")}</div>`,
          cls: "bl-mock--menu",
          decorative: true,
        })}
        <ol class="bl-tabs" data-bl-menu>${MN.items.map((it, i) => `<li class="bl-tabs__item${i === 0 ? " is-on" : ""}" data-bl-menu-item="${i}"><span class="bl-tabs__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><div><h4>${esc(it.name)}</h4><p>${esc(it.lead)}</p></div></li>`).join("")}</ol>
      </div>
      <p class="nls-note">${esc(MN.note)}</p>
    </div>`
  );

  // v6: three illustrative app screens side by side, built only from existing copy
  const SH = V.showcase;
  const nowCol = C.c30.status.columns[0];
  const growthRows = (AD.areas["03"] || { rows: [] }).rows.slice(0, 7);
  const todayItems = MN.items[0].lead.split(/,\s*/);
  const todayIcons = ["calendar", "chart", "check", "shield"];
  const scr1 = `<ul class="bl-mock__list">${todayItems.map((t, i) => `<li>${icon(todayIcons[i % 4], "bl-mock__ico")}<span>${esc(t)}</span></li>`).join("")}</ul>`;
  const scr2 = `<ul class="bl6-mock__rows">${growthRows.map(([k, v]) => `<li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join("")}</ul>`;
  const famIcons = ["users", "heart", "hand", "sprout"];
  const scr3 = `<ul class="bl-mock__list bl-mock__list--people">${P30.roles.items.map((r, i) => `<li>${icon(famIcons[i % 4], "bl-mock__ico")}<span>${esc(r.name)}</span></li>`).join("")}</ul>`;
  const showcase = block(
    "bl-showcase",
    `${titleBlock(SH.kicker, SH.title, SH.lead, 2, "bl-showcase-title")}
    <div class="bl6-phones">
      ${phone(lang, { title: SH.screens.today, label: MN.items[0].name, body: scr1, cls: "bl-mock--sm" })}
      ${phone(lang, { title: SH.screens.records, label: nowCol.name, body: scr2, cls: "bl-mock--sm bl-mock--lift" })}
      ${phone(lang, { title: SH.screens.family, label: C.v6.overview.familyMock.label, body: scr3, cls: "bl-mock--sm" })}
    </div>`
  );

  const roles = block(
    "bl-roles",
    `${titleBlock(P30.roles.kicker, P30.roles.title, P30.roles.lead, 2, "bl-roles-title")}
    ${features(P30.roles.items, ["users", "heart", "hand", "sprout"], 3, "bl-feat--4 bl-feat--boxed")}
    <p class="nls-note">${esc(P30.roles.note)}</p>`
  );
  const scenarios = block(
    "bl-scenarios",
    `${titleBlock(P30.scenarios.kicker, P30.scenarios.title, P30.scenarios.lead, 2, "bl-scenarios-title")}<ul class="bl-scenes bl-scenes--5">${P30.scenarios.items
      .map((it) => `<li class="bl-scene"><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></li>`)
      .join("")}</ul>`
  );
  // Roadmap: stage rows, then the development stages P0–P9 as a 5 × 2 sequence of tiles (a real order)
  const DV = C.v3.platform.dev;
  const roadmap = block(
    "bl-roadmap",
    `${titleBlock(P30.roadmap.kicker, P30.roadmap.title, P30.roadmap.lead, 2, "bl-roadmap-title")}
    ${stageRows(C.c30.status.columns, C.c30.status.note)}
    <div class="bl-subhead"><h3 class="bl-sub bl-sub--lg">${esc(DV.title)}</h3><p class="nls-lead">${esc(DV.lead)}</p></div>
    <ol class="bl6-ptiles" aria-label="${esc(DV.title)}">${DV.items.map(([st, scope, goal]) => `<li><p class="bl6-ptiles__n">${esc(st)}</p><h4>${esc(scope)}</h4><p><span class="bl6-ptiles__k">${esc(DV.fields.goal)}</span> ${esc(goal)}</p></li>`).join("")}</ol>
    <p class="nls-note">${esc(DV.note)}</p>`
  );
  const faqItems = P30.faq.items
    .map(
      (f) => `<details class="bl-faq__item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}${
        f.link === "delete" ? ` <a class="bl-link" href="/${lang}/${BL_SLUG}/delete-account/">${esc(P30.faq.deleteLink)}</a>` : ""
      }</p></details>`
    )
    .join("");
  const faq = block("bl-faq", `<div class="bl-split bl-split--faq"><div>${titleBlock(P30.faq.kicker, P30.faq.title, "", 2, "bl-faq-title")}</div><div class="bl-faq">${faqItems}</div></div>`);

  // App chapters: eight compact panels flowing in two balanced columns (masonry by CSS columns)
  const chapter = (s) => `<section id="bl-${s.id}" class="bl-sec bl6-chap__item bl-v-${s.id}" data-hs-section aria-labelledby="bl-${s.id}-title">
      <header class="bl6-chap__head">${ico(CHAPTER_ICONS[s.id] || "sparkle")}<div><p class="nls-kicker">${esc(s.kicker)}</p><h2 class="bl6-chap__t" id="bl-${s.id}-title">${nl(s.title)}</h2></div></header>
      <p class="bl6-chap__lead">${esc(s.lead)}</p>
      <ul class="bl6-chap__list">${s.items.map((it) => `<li><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></li>`).join("")}</ul>
    </section>`;
  const secs = `<div class="bl6-chap">${sections.map(chapter).join("\n")}</div>`;

  // Public-welfare / child-safety areas 25–32: intro band with the emergency routing, then eight full-width rows
  const F2 = X.cs.fields;
  const csIntro = block(
    "bl-cs",
    `${titleBlock(X.cs.kicker, X.cs.title, X.cs.lead, 2, "bl-cs-title")}
    ${csNotices(C, true)}
    ${jump(X.cs.railLabel, C.x.csGroups.map((g) => [`#bl-cs-${g.id}`, g.n, g.en]), "bl-rail--grid")}`
  );
  const csIcons = ["building", "shield", "compass", "hand", "home", "heart", "sprout", "sparkle"];
  const csRows = C.x.csGroups
    .map(
      (g, i) => `<section id="bl-cs-${g.id}" class="bl6-csrow" data-hs-section aria-labelledby="bl-cs-${g.id}-title">
      <div class="bl6-csrow__id">${ico(csIcons[i % 8])}<p class="nls-kicker">${esc(`${g.n} · ${g.en}`)}</p>
      <h2 class="bl6-csrow__t" id="bl-cs-${g.id}-title">${nl(g.title)}</h2></div>
      <div class="bl6-csrow__what"><p>${esc(g.service)}</p><p class="bl-sub">${esc(F2.subs)}</p><ul class="bl6-ticks">${g.subs.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
      ${dl([
        [F2.sources, esc(g.sources)],
        [F2.guard, esc(g.guard)],
      ], "bl-dl--stack bl6-csrow__dl")}
    </section>`
    )
    .join("\n");
  const csGrid = `<div class="bl-csgrid bl6-csrows">${csRows}</div>`;
  const csNote = block("bl-cs-note", `<p class="nls-note">${esc(C.ui.sourcesNote)}</p>`, "", "bl-cs-end");

  // Global services & localisation (future plan)
  const GP = C.c30.global.platform;
  const globalServices = block(
    "bl-global",
    `${titleBlock(GP.kicker, GP.title, GP.lead, 2, "bl-global-title")}
    <div class="bl6-two">
      <div><h3 class="bl-sub bl-sub--lg">${esc(GP.servicesTitle)}</h3>${rows(GP.services, ["book", "users", "calendar", "home", "hand"], 4)}</div>
      <div><h3 class="bl-sub bl-sub--lg">${esc(GP.locTitle)}</h3>${checks(GP.loc, 4, "bl6-checks--1")}</div>
    </div>`
  );

  // App access — the page's one solid pink band
  const a = p.access;
  const b = BUSINESS.babylog;
  const access = block(
    "bl-access",
    `<div class="bl-ctaband">
      <div class="bl-ctaband__body">${titleBlock(a.kicker, a.title, a.lead, 2, "bl-access-title")}</div>
      <div class="bl-ctaband__side">
      <div class="nls-actions">
        <a class="nls-btn bl-btn-point" href="${esc(b.stores.appStore)}" target="_blank" rel="noopener" data-analytics="app_store_babylog">${esc(a.appStore)}</a>
        <a class="nls-btn bl-btn-point" href="${esc(b.stores.googlePlay)}" target="_blank" rel="noopener" data-analytics="google_play_babylog">${esc(a.googlePlay)}</a>
        <a class="nls-btn nls-btn--ghost" href="/${lang}/${BL_SLUG}/delete-account/">${esc(a.deleteNote)}</a>
      </div>
      <p class="nls-note">${esc(a.note)}</p></div>
    </div>`,
    "pink"
  );
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "platform", "app")}">${esc(C.ui.toInquiry)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "business")}">${esc(C.ui.toBusiness)}</a>`;
  return {
    hero: hero(C, lang, "platform", p.hero, true),
    main: [
      flow,
      screens,
      showcase,
      secs,
      roles,
      scenarios,
      roadmap,
      csIntro,
      csGrid,
      csNote,
      globalServices,
      access,
      faq,
      closeBlock(C, lang, "platform", { closeKicker: p.closeKicker || C.contact.closeKicker, closeTitleHtml: p.closeTitleHtml || C.contact.closeTitleHtml, closeLead: p.closeLead || C.contact.closeLead }, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ Business */
/** The 32 business lines: 24 + 8 public welfare / child-safety lines (25-32), with category metadata. */
function allGroups(C) {
  const g = C.x.business.groups;
  const map = new Map();
  for (const it of g.items) {
    const [id, en, name, subs, customers, value, ops, status] = it;
    map.set(id, { id, n: id.slice(1), en, name, subs, customers, value, ops, status, cs: false });
  }
  for (const c of C.x.csGroups) {
    map.set(`g${c.n}`, { id: `g${c.n}`, n: c.n, en: c.en, name: c.name, subs: c.subs, customers: c.customers, value: c.service, ops: c.guard, sources: c.sources, rev: c.rev, status: "plan", cs: true });
  }
  return map;
}

function businessBody(C, lang) {
  const b = C.business;
  const F = b.fields;
  const ko = copyLangFor(lang) === "ko";
  const modelIcons = { a: "users", b: "building", c: "bag", d: "shield", e: "store", f: "globe" };
  // v6: the six models as an explorer — every model's code, name and overview stay visible in the list on the left,
  // the selected model's full sheet on the right (all six sheets visible without JS; #biz-x opens that sheet)
  const sheets = b.categories
    .map((cat) => {
      const rows2 = [
        [F.overview, esc(cat.overview)],
        [F.customers, esc(cat.customers)],
        [F.problem, esc(cat.problem)],
        [F.value, esc(cat.value)],
        [F.revenue, esc(cat.revenue)],
        [F.partners, esc(cat.partners)],
      ];
      return `<article id="biz-${cat.id}" class="bl-biz bl-model-card bl6-sheet" aria-labelledby="biz-${cat.id}-title">
      <header class="bl-biz__head">
        <span class="bl-biz__code" aria-hidden="true">${esc(cat.code)}</span>
        <div>
          <p class="nls-kicker">${esc(cat.en)}</p>
          <h3 id="biz-${cat.id}-title" class="bl-biz__title">${esc(cat.name)}</h3>
        </div>
        <span class="bl-biz__ico" aria-hidden="true">${icon(modelIcons[cat.id] || "sparkle")}</span>
      </header>
      ${chips(cat.items)}
      ${dl(rows2, "bl-dl--grid bl6-sheet__dl")}
      <p class="bl-biz__cta"><a class="bl-arrow" href="${pagePath(lang, "partnerships")}#partner-${cat.partnerType}" aria-label="${esc(F.cta)}: ${esc(cat.name)}">${esc(F.cta)} ${icon("arrow")}</a></p>
    </article>`;
    })
    .join("\n");
  const railItems = b.categories
    .map((cat) => `<li><a href="#biz-${cat.id}" class="bl6-xrail__a"><span class="bl6-xrail__code" aria-hidden="true">${esc(cat.code)}</span><span class="bl6-xrail__txt"><strong>${esc(cat.name)}</strong><span>${esc(cat.en)}</span></span></a></li>`)
    .join("");
  const intro = block(
    "bl-biz",
    `<div class="bl-split bl-split--top">${titleBlock(b.intro.kicker, b.intro.title, b.intro.lead, 2, "bl-biz-title")}
    <div class="bl-aside">${icon("info", "bl-aside__ico")}<p class="nls-note">${esc(C.ui.noOutsourcing)}</p>
    <p class="nls-note">${esc(C.ui.noPrice)}</p></div></div>
    <div class="bl6-x"${tabsAttr(b.intro.kicker)}>
      <nav class="bl-rail bl6-xrail" aria-label="${esc(b.intro.kicker)}"><ol>${railItems}</ol></nav>
      <div class="bl6-x__panels">${sheets}</div>
    </div>`
  );

  const G = C.x.business.groups;
  const GF = G.fields;
  const gmap = allGroups(C);
  const catItems = G.cats.map((c) => {
    const members = c.groups.map((id) => gmap.get(id));
    const csCat = !!c.cs;
    const forb = c.forbidden ? `<div class="bl-forbid"><p class="bl-sub">${esc(c.forbiddenLabel)}</p>${chips(c.forbidden)}</div>` : "";
    const lines = members
      .map((g) => {
        const rows3 = [
          [GF.customers, esc(g.customers)],
          [GF.value, esc(g.value)],
          [GF.ops, esc(g.ops)],
        ];
        if (g.cs) {
          rows3.push([GF.sources, esc(g.sources)]);
          rows3.push([GF.revenue, esc(g.rev)]);
        }
        const target = g.cs ? `${pagePath(lang, "partnerships")}#bl-cs-partners` : `${pagePath(lang, "partnerships")}#bl-industry`;
        return `<article id="grp-${g.n}" class="bl-grp${g.cs ? " bl-grp--cs" : ""}" aria-labelledby="grp-${g.n}-title">
        <header class="bl-grp__head">
          <span class="bl-grp__n" aria-hidden="true">${esc(g.n)}</span>
          <div><p class="nls-kicker">${esc(g.en)}</p><h4 id="grp-${g.n}-title" class="bl-biz__title">${esc(ko ? g.name : g.en)}</h4></div>
        </header>
        <ul class="bl6-grp__subs">${(g.subs || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        ${dl(rows3, "bl-dl--stack bl6-grp__dl")}
        <p class="bl-biz__cta"><a class="bl-arrow" href="${target}">${esc(b.fields.cta)} ${icon("arrow")}</a></p>
      </article>`;
      })
      .join("");
    return {
      id: `cat-${c.id}`,
      cls: `bl6-cat${csCat ? " bl6-cat--cs" : ""}`,
      n: c.id,
      kicker: c.en,
      title: ko ? c.name : c.en,
      tid: `cat-${c.id}-title`,
      sub: dots(members.map((g) => (ko ? g.name : g.en))),
      aside: `<span class="bl6-count">${members.length}${esc(C.x.overview.groupsIndex.countUnit)}</span>`,
      body: `<div class="bl6-cat__meta">${dl([[GF.model, esc(c.model)], [GF.revenue, esc(c.revenue)]], "bl6-cat__dl")}<p class="nls-note">${esc(C.ui.catApplies)}</p></div>
        ${forb}
        ${csCat ? csNotices(C, true) : ""}
        <div class="bl-grp__list">${lines}</div>`,
    };
  });
  const groups = block(
    "bl-groups",
    `${titleBlock(G.kicker, G.title, G.lead, 2, "bl-groups-title")}
    ${scopeNote(C)}
    <p class="nls-note">${esc(G.note)}</p>
    ${acc(catItems, "bl6-acc--cats")}`
  );
  const ph = C.x.business.phases;
  // the five priorities as a horizontal timeline on a dark full-bleed band (a real sequence)
  const phases = block(
    "bl-phases",
    `${titleBlock(ph.kicker, ph.title, ph.lead, 2, "bl-phases-title")}
    ${steps(ph.items, 3, "bl-steps--5 bl-steps--timeline")}
    <p class="nls-note">${esc(ph.note)}</p>`,
    "band",
    "bl-ink"
  );
  const B30 = C.c30.business;
  const PY = B30.payers;
  // Customers & payers — rows grouped by stage
  const payerGroups = PY.stages
    .map((st) => {
      const its = PY.items.filter((it) => it.stage === st.id);
      return `<div class="bl-table__group">
      <h3 class="bl-table__stage">${esc(st.name)}</h3>
      ${its
        .map(
          (it) => `<article class="bl-table__row"><div class="bl-table__name"><p class="bl-biz__tag">${esc(it.code)}</p><h4>${esc(it.name)}</h4></div>
        <dl class="bl-table__cells"><div><dt>${esc(PY.fields.users)}</dt><dd>${esc(it.users)}</dd></div><div><dt>${esc(PY.fields.payer)}</dt><dd>${esc(it.payer)}</dd></div></dl></article>`
        )
        .join("")}
    </div>`;
    })
    .join("\n");
  const payers = block(
    "bl-payers",
    `${titleBlock(PY.kicker, PY.title, PY.lead, 2, "bl-payers-title")}
    <div class="bl-table">
      <div class="bl-table__headrow" aria-hidden="true"><span></span><span>${esc(PY.fields.users)}</span><span>${esc(PY.fields.payer)}</span></div>
      ${payerGroups}
    </div>`
  );
  const RV = B30.revenue;
  const RM = C.v3.business.models;
  const stageKey = RV.columns
    .map(
      (c) => `<div class="bl-stagekey__item${c.id === "free" ? " is-free" : ""}"><h4>${esc(c.id === "free" ? RM.freeTitle : c.name)}</h4><p>${esc(c.basis)}</p>${
        c.id === "free" ? `<ul class="bl-tags">${c.items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""
      }</div>`
    )
    .join("");
  const revenue = block(
    "bl-revenue",
    `${titleBlock(RV.kicker, RV.title, RV.lead, 2, "bl-revenue-title")}
    ${features(RV.kinds, ["users", "bag", "building"], 3, "bl-feat--3 bl-feat--compact")}
    <h3 class="bl-sub bl-sub--lg">${esc(RM.title)}</h3>
    ${dtable([RM.fields.name, RM.fields.how, RM.fields.stage, RM.fields.check], RM.items.map(([n, name, how, stage, check]) => [`<span class="bl-dtable__n">${esc(n)}</span> ${esc(name)}`, esc(how), esc(stage), esc(check)]), "bl-dtable--models", { raw: true })}
    <div class="bl-stagekey">${stageKey}</div>
    <p class="nls-note">${esc(RV.note)}</p>`
  );
  // Product structure hypothesis — two rows of plan tiles (names and scope only, no prices)
  const TR = C.v3.business.tiers;
  const tierRow = (title, list, cls) => `<div class="bl6-tiers__row ${cls}"><h3 class="bl-sub bl-sub--lg">${esc(title)}</h3><ul class="bl6-tiers__list" style="--n:${list.length}">${list
    .map(([name, what], i) => `<li${i === 0 ? ' class="is-base"' : ""}><strong>${esc(name)}</strong><span>${esc(what)}</span></li>`)
    .join("")}</ul></div>`;
  const tiers = block(
    "bl-tiers",
    `${titleBlock(TR.kicker, TR.title, TR.lead, 2, "bl-tiers-title")}
    <div class="bl6-tiers">${tierRow(TR.familyTitle, TR.family, "is-family")}${tierRow(TR.orgTitle, TR.org, "is-org")}</div>
    <p class="nls-note">${esc(TR.note)}</p>`
  );
  const RO = C.v3.business.roles;
  const roles = block(
    "bl-newon-roles",
    `${titleBlock(RO.kicker, RO.title, RO.lead, 2, "bl-newon-roles-title")}
    ${dtable([RO.fields.platform, RO.fields.link, RO.fields.split], RO.items, "bl-dtable--roles")}
    <p class="nls-note">${esc(RO.note)}</p>`
  );
  const MK = B30.market;
  const market = block(
    "bl-market",
    `${titleBlock(MK.kicker, MK.title, MK.lead, 2, "bl-market-title")}
    ${features(MK.items, ["chart", "link", "shield", "alert"], 3, "bl-feat--4")}
    <div class="bl6-diff"><h3 class="bl-sub bl-sub--lg">${esc(MK.diffTitle)}</h3>
    ${icards(MK.diff, null, 4, "bl-icards--3 bl-icards--quote")}
    <p class="nls-note">${esc(MK.diffNote)}</p></div>`
  );
  const EN2 = B30.entry;
  const entry = block("bl-entry", `${titleBlock(EN2.kicker, EN2.title, EN2.lead, 2, "bl-entry-title")}${steps(EN2.items, 3, "bl-steps--4")}`, "pink");
  const RU = B30.rules;
  const ruleItems = [...RU.items.slice(0, -1), ...C.v3.business.rulesExtra, RU.items[RU.items.length - 1]];
  const rules = block(
    "bl-rules",
    `${titleBlock(RU.kicker, RU.title, RU.lead, 2, "bl-rules-title")}
    <dl class="bl-ldl bl6-ldl">${ruleItems.map((it) => `<div class="bl-ldl__row"><dt>${esc(it.name)}</dt><dd>${esc(it.lead)}</dd></div>`).join("")}</dl>`
  );
  // Global go-to-market (future plan)
  const GB = C.c30.global.business;
  const globalGtm = block(
    "bl-global",
    `${titleBlock(GB.kicker, GB.title, GB.lead, 2, "bl-global-title")}
    <h3 class="bl-sub bl-sub--lg">${esc(GB.customersTitle)}</h3>
    ${features(GB.customers, ["users", "book", "building", "hand"], 4, "bl-feat--4")}
    <h3 class="bl-sub bl-sub--lg">${esc(GB.revenueTitle)}</h3>
    ${chips(GB.revenue)}
    <p class="nls-note">${esc(GB.revenueNote)}</p>
    <h3 class="bl-sub bl-sub--lg">${esc(GB.stepsTitle)}</h3>
    ${steps(GB.steps, 4, "bl-steps--5")}
    <p class="nls-note">${esc(GB.note)}</p>
    <p class="bl-biz__cta"><a class="bl-arrow" href="#biz-f">${esc(GB.toModel)} ${icon("arrow")}</a> <a class="bl-arrow" href="#grp-24">${esc(GB.toLine)} ${icon("arrow")}</a></p>`
  );
  const ctas = `<a class="nls-btn" href="${esc(unifiedContactHref(lang, "babylog", { type: "partnership", source: "babylog-business" }))}">${esc(C.ui.toPartnerships)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${inquiryHref(lang, "business", "")}">${esc(C.ui.inquiryCta)}</a>`;
  return {
    hero: hero(C, lang, "business", b.hero, true),
    main: [intro, payers, market, revenue, tiers, entry, groups, phases, rules, roles, globalGtm, closeBlock(C, lang, "business", b, ctas)].join("\n"),
  };
}

/* -------------------------------------------------------------- Partnerships */
function partnershipsBody(C, lang) {
  const p = C.partnerships;
  const T = p.types;
  const typeIcons = ["store", "bag", "book", "heart", "hand", "building", "home", "globe"];
  const TA = C.v3.partnerships.typeAreas;
  // v6: the eight partner types as full-width rows — identity and related areas | four facts | the inquiry button
  const cards = T.items
    .map((it, i) => {
      const r = [
        [T.fields.who, esc(it.who)],
        [T.fields.areas, esc(it.areas)],
        [T.fields.model, esc(it.model)],
        [T.fields.terms, esc(it.terms)],
      ];
      return `<article id="partner-${it.code}" class="bl-biz bl-pcard bl6-prow" aria-labelledby="partner-${it.code}-title">
      <div class="bl6-prow__id">
        <header class="bl-biz__head">${ico(typeIcons[i % 8])}<div><p class="bl6-prow__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</p><h3 id="partner-${it.code}-title" class="bl-biz__title">${esc(it.name)}</h3></div></header>
        ${TA.items[it.code] ? `<div class="bl-relarea"><p class="bl-sub">${esc(TA.label)}</p><ul class="bl-tags">${TA.items[it.code].map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
        <p class="bl-biz__cta"><a class="nls-btn bl-btn-point" href="${inquiryHref(lang, "partnerships", it.code)}">${esc(T.cta)} →</a></p>
      </div>
      ${dl(r, "bl-dl--grid bl6-prow__dl")}
    </article>`;
    })
    .join("\n");
  const PX = C.x.partnerships;
  const ind = PX.industry;
  // 15 industry partner types — an even 3 × 5 index on hairlines (no boxes)
  const indRows = ind.items
    .map((it, i) => {
      const code = IND_PARTNER_CODES[i];
      return `<article id="partner-${code}" class="bl-icat bl6-icat" aria-labelledby="partner-${code}-title">
      <p class="bl-icat__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</p>
      <h3 id="partner-${code}-title" class="bl-icat__name">${esc(it[0])}</h3>
      ${dl([
        [ind.fields.purpose, esc(it[1])],
        [ind.fields.terms, esc(it[2])],
      ], "bl-icat__cells")}
      <p class="bl-icat__go"><a class="bl-arrow" href="${inquiryHref(lang, "partnerships", code)}" aria-label="${esc(T.cta)}: ${esc(it[0])}">${esc(T.cta)} ${icon("arrow")}</a></p>
    </article>`;
    })
    .join("\n");
  const cs = PX.cs;
  const csCards = cs.items
    .map((it, i) => {
      const code = CS_PARTNER_CODES[i];
      return `<article id="partner-${code}" class="bl-trow bl-trow--cs" aria-labelledby="partner-${code}-title">
      <h3 id="partner-${code}-title" class="bl-trow__name">${esc(it[0])}</h3>
      ${dl([
        [cs.fields.purpose, esc(it[1])],
        [cs.fields.value, esc(it[2])],
        [cs.fields.terms, esc(it[3])],
      ], "bl-trow__cells")}
      <p class="bl-trow__go"><a class="bl-arrow" href="${inquiryHref(lang, "partnerships", code)}" aria-label="${esc(cs.cta)}: ${esc(it[0])}">${esc(cs.cta)} ${icon("arrow")}</a></p>
    </article>`;
    })
    .join("\n");
  const R30 = C.c30.partnerships;
  const pvision = block("bl-pvision", `${titleBlock(R30.vision.kicker, R30.vision.title, R30.vision.lead, 2, "bl-pvision-title")}${features(R30.vision.items, ["heart", "shield", "hand"], 3, "bl-feat--3 bl-feat--lg")}`);
  // Pilot proposals — compact accordion; the closed row shows who it is for
  const PL = R30.pilots;
  const pilots = block(
    "bl-pilots",
    `${titleBlock(PL.kicker, PL.title, PL.lead, 2, "bl-pilots-title")}
    ${acc(
      PL.items.map((it, i) => ({
        id: it.code,
        n: String(i + 1).padStart(2, "0"),
        title: it.name,
        sub: `<b>${esc(PL.fields.who)}</b> ${esc(it.who)}`,
        body: `${dl([[PL.fields.how, esc(it.how)], [PL.fields.check, esc(it.check)]], "bl6-pilot__dl")}<p class="bl-biz__cta"><a class="bl-arrow" href="${inquiryHref(lang, "partnerships", it.code)}" aria-label="${esc(PL.cta)}: ${esc(it.name)}">${esc(PL.cta)} ${icon("arrow")}</a></p>`,
      })),
      "bl6-acc--pilots"
    )}
    <p class="nls-note">${esc(C.ui.noPartner)}</p>`
  );
  // v6: when each partnership kind opens, following development stages P4–P9 (plan §24)
  const OR = C.v6.partnerships.order;
  const order = block(
    "bl-order",
    `${titleBlock(OR.kicker, OR.title, OR.lead, 2, "bl-order-title")}
    <ol class="bl6-ptiles bl6-ptiles--6">${OR.items.map((it) => `<li><p class="bl6-ptiles__n">${esc(it.n)}</p><h3>${esc(it.name)}</h3><p>${esc(it.body)}</p></li>`).join("")}</ol>
    <p class="nls-note">${esc(OR.note)}</p>`
  );
  const DA = R30.data;
  const data = block(
    "bl-data",
    `<div class="bl6-split bl6-split--even"><div class="bl6-split__text">${titleBlock(DA.kicker, DA.title, DA.lead, 2, "bl-data-title")}
    <div class="bl-principles bl-principles--panel"><h3 class="bl-sub bl-sub--lg">${esc(DA.principlesTitle)}</h3>
    <ul class="bl-plist">${DA.principles.map((t) => `<li>${icon("lock")}<span>${esc(t)}</span></li>`).join("")}</ul></div></div>
    ${rows(DA.items, ["globe", "calendar", "store", "link"], 3, "bl6-rows")}</div>`
  );
  const joint = block("bl-joint", `${titleBlock(R30.joint.kicker, R30.joint.title, R30.joint.lead, 2, "bl-joint-title")}${icards(R30.joint.items, ["book", "shield", "building"], 3, "bl-icards--3")}`);
  const pvalue = block("bl-pvalue", `${titleBlock(R30.value.kicker, R30.value.title, R30.value.lead, 2, "bl-pvalue-title")}${checks(R30.value.items, 3, "bl-checks--4")}`, "pink");
  // Global partnerships (possibilities only)
  const GR = C.c30.global.partnerships;
  const globalRows = GR.items
    .map(
      (it, i) => `<article class="bl-trow" aria-labelledby="bl-global-p${i + 1}">
      <h3 id="bl-global-p${i + 1}" class="bl-trow__name">${esc(it[0])}</h3>
      ${dl([
        [GR.fields.area, esc(it[1])],
        [GR.fields.check, esc(it[2])],
      ], "bl-trow__cells")}
    </article>`
    )
    .join("\n");
  const globalPartners = block(
    "bl-global",
    `${titleBlock(GR.kicker, GR.title, GR.lead, 2, "bl-global-title")}
    <div class="bl-gsplit">
    <div class="bl-ttable bl-ttable--g">
      <div class="bl-ttable__head" aria-hidden="true"><span></span><span>${esc(GR.fields.area)}</span><span>${esc(GR.fields.check)}</span></div>
      ${globalRows}
    </div>
    <div class="bl-gsplit__side">
    <div class="bl-principles bl-principles--panel"><h3 class="bl-sub bl-sub--lg">${esc(GR.principlesTitle)}</h3>
    <ul class="bl-plist">${GR.principles.map((t) => `<li>${icon("lock")}<span>${esc(t)}</span></li>`).join("")}</ul></div>
    <div class="nls-actions"><a class="nls-btn bl-btn-point" href="${esc(inquiryHref(lang, "partnerships", ""))}">${esc(GR.cta)} →</a></div>
    <p class="nls-note">${esc(GR.ctaNote)}</p>
    </div>
    </div>`
  );
  const PP = C.v3.partnerships.prepare;
  const principleList = `<ul class="bl-plist">${p.principles.items.map((t) => `<li>${icon("check")}<span>${esc(t)}</span></li>`).join("")}</ul>`;
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "partnerships", "")}">${esc(C.ui.inquiryCta)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${esc(unifiedContactHref(lang, "babylog", { type: "personal", source: "babylog-partnerships" }))}">${esc(C.ui.toInquiry)}</a>`;
  return {
    hero: hero(C, lang, "partnerships", p.hero, true),
    main: [
      pvision,
      block(
        "bl-types",
        `${titleBlock(T.kicker, T.title, T.lead, 2, "bl-types-title")}
    <div class="bl-models-chips">${chips(T.models)}
    <p class="nls-note">${esc(C.ui.noPartner)}</p></div>
    <div class="bl6-prows">${cards}</div>
    <p class="nls-note">${esc(C.ui.noPrice)}</p>`
      ),
      order,
      block(
        "bl-industry",
        `${titleBlock(ind.kicker, ind.title, ind.lead, 2, "bl-industry-title")}
    <div class="bl-icats bl6-icats">${indRows}</div>`
      ),
      pilots,
      data,
      joint,
      block(
        "bl-cs-partners",
        `${titleBlock(cs.kicker, cs.title, cs.lead, 2, "bl-cs-partners-title")}
    ${csNotices(C, true)}
    <p class="nls-note bl-flow-note">${esc(C.ui.csPartnerNote)} ${esc(cs.fields.flow)}: ${esc(cs.flowText)}</p>
    <div class="bl-ttable bl-ttable--3">
      <div class="bl-ttable__head" aria-hidden="true"><span></span><span>${esc(cs.fields.purpose)}</span><span>${esc(cs.fields.value)}</span><span>${esc(cs.fields.terms)}</span><span></span></div>
      ${csCards}
    </div>`
      ),
      globalPartners,
      block(
        "bl-process",
        `${titleBlock(p.process.kicker, p.process.title, p.process.lead, 2, "bl-process-title")}
    ${steps(p.process.steps.map((s) => ({ n: s.n, name: s.name, body: s.body })), 3, "bl-steps--5 bl-steps--timeline")}
    <div class="bl-duo2">
      <div class="bl-principles bl-principles--panel"><h3 class="bl-sub bl-sub--lg">${esc(p.principles.title)}</h3>
      ${principleList}</div>
      <div class="bl-principles bl-principles--panel bl-prep"><h3 class="bl-sub bl-sub--lg">${esc(PP.title)}</h3>
      <div class="bl-prep__list">${PP.items.map((it, i) => `<div class="bl-prep__item"><span class="bl-prep__n" aria-hidden="true">${i + 1}</span><div><h4>${esc(it.name)}</h4><p>${esc(it.lead)}</p></div></div>`).join("")}</div>
      <p class="nls-note">${esc(PP.note)}</p></div>
    </div>`
      ),
      block("bl-pfaq", `<div class="bl-split bl-split--faq"><div>${titleBlock(C.v3.partnerships.faq.kicker, C.v3.partnerships.faq.title, "", 2, "bl-pfaq-title")}</div><div class="bl-faq">${C.v3.partnerships.faq.items
        .map((f) => `<details class="bl-faq__item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
        .join("")}</div></div>`),
      pvalue,
      closeBlock(C, lang, "partnerships", p, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------- Contact */
/* ONGIL-style Contact page (owner, 2026-10-26): film hero + menu unchanged; the body is the shared Contact kit
   (biz-contact-kit.mjs, BABYLOG pink), rendered after the Life Stage section. Every inquiry action is one
   "문의하기" → /{lang}/contact/?platform=babylog&type=… */
function contactBody(C, lang) {
  return { hero: hero(C, lang, "contact", C.contact.hero, true), main: "", after: renderBizContact(babylogContactModel(lang)) };
}

const BODY = { overview: overviewBody, platform: platformBody, business: businessBody, partnerships: partnershipsBody, contact: contactBody };

/** @returns {string} the <section id="lifestage-detail" data-story="babylog"> markup for one page */
export function renderBabylogSection(lang, page) {
  const C = getBabylogCopy(lang);
  const { hero: heroHtml, main, after = "" } = BODY[page](C, lang);
  const fallbackLang = copyLangFor(lang) !== lang ? ` lang="${copyLangFor(lang)}"` : "";
  return `<section id="lifestage-detail" class="nls" data-story="babylog" data-bl-page="${page}"${fallbackLang} aria-labelledby="story-babylog-title">
    ${heroHtml}
  ${renderFlagshipSubnav({ biz: "babylog", lang, active: page })}
  ${main ? `<div class="nls__wrap">
    ${main}
  </div>` : ""}
</section>${after ? `\n${after}` : ""}`;
}
