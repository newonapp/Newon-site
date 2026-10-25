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
import { CS_PARTNER_CODES, IND_PARTNER_CODES } from "./babylog-expansion-copy.mjs";

const esc = escapeHtml;
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");

export const pagePath = (lang, sub = "") => `/${lang}/${BL_SLUG}/${sub ? sub + "/" : ""}`;

/** Existing official inquiry form, passing the BABYLOG source and inquiry type (no new data path). */
export function inquiryHref(lang, page, code) {
  const source = `babylog-${page}${code ? "-" + code : ""}`;
  return `/${lang}/business/inquiry/?category=Partnership&source=${encodeURIComponent(source)}#inquiry`;
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

/** Section. tone: "" (paper) | "tint" (pale pink full-bleed band) | "band" (paper full-bleed band). */
function block(id, inner, tone = "", cls = "") {
  const t = tone === "tint" ? " nls-block--band bl-tint" : tone === "band" ? " nls-block--band" : "";
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
    contact: `<a class="nls-btn" href="#bl-contact-list" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
  }[page];
  const second = {
    overview: pagePath(lang, "platform"),
    platform: pagePath(lang, "business"),
    business: pagePath(lang, "partnerships"),
    partnerships: pagePath(lang, "contact"),
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

/** Jump chips (anchor links only; no hidden tabs). n is shown only when it is an existing ID (category 01–08, area 25–32). */
function jump(label, items, cls = "") {
  return `<nav class="bl-rail${cls ? " " + cls : ""}" aria-label="${esc(label)}"><ol class="bl-rail__list">${items
    .map(([href, n, name]) => `<li><a class="bl-rail__link" href="${href}">${n ? `<span aria-hidden="true">${esc(n)}</span> ` : ""}${esc(name)}</a></li>`)
    .join("")}</ol></nav>`;
}

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
      (c, i) => `<article class="bl-board__col${i === 0 ? " is-now" : ""}"><h3 class="bl-board__t">${esc(c.name)}</h3><ul class="bl-board__list">${(c.items || [])
        .map((t) => `<li>${esc(t)}</li>`)
        .join("")}</ul><p class="bl-board__basis">${esc(c.basis)}</p></article>`
    )
    .join("");
  return `<div class="bl-board" style="--bl-n:${columns.length}">${cols}</div>${note ? `<p class="nls-note bl-board__note">${esc(note)}</p>` : ""}`;
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

/* ------------------------------------------------------------------ Overview */
function overviewBody(C, lang) {
  const o = C.overview;
  const X = C.x.overview;

  // About — statement split: title left; the first line set large, the rest as calm body copy
  const roster = o.vision.lines.map((p, i) => `<p class="${i === 0 ? "bl-statement__lead" : "bl-statement__p"}">${esc(p)}</p>`).join("");
  const vision = block("bl-vision", `<div class="bl-split bl-split--statement"><div>${titleBlock(o.vision.kicker, o.vision.title, "", 2, "bl-vision-title")}</div><div class="bl-statement">${roster}</div></div>`);

  // Mission — six values as an open three-column feature list on the pale band
  const valueIcons = ["heart", "sprout", "link", "hand", "shield", "access"];
  const values = o.connect.items
    .map((it, i) => `<article class="bl-val">${ico(valueIcons[i % 6])}<h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`)
    .join("");
  const connect = block("bl-connect", `${titleBlock(o.connect.kicker, o.connect.title, o.connect.lead, 2, "bl-connect-title")}<div class="bl-values">${values}</div>`, "tint");

  const O30 = C.c30.overview;
  // Problem → solution — two-column comparison (labels come from the existing kicker "Problem → Solution")
  const [pL, sL] = O30.problem.kicker.split("→").map((s) => s.trim());
  const problemRows = O30.problem.items
    .map((it) => `<li class="bl-vs__row"><h3 class="bl-vs__a">${esc(it.name)}</h3><span class="bl-vs__arrow" aria-hidden="true">${icon("arrow")}</span><p class="bl-vs__b">${esc(it.lead)}</p></li>`)
    .join("");
  const problem = block(
    "bl-problem",
    `${titleBlock(O30.problem.kicker, O30.problem.title, O30.problem.lead, 2, "bl-problem-title")}
    <div class="bl-vs">${sL ? `<p class="bl-vs__head" aria-hidden="true"><span>${esc(pL)}</span><span></span><span>${esc(sL)}</span></p>` : ""}<ul class="bl-vs__list">${problemRows}</ul></div>`
  );
  // Customers (bento, the core family first and largest) and typical moments (scene cards, scroll rail on phones)
  const moments = O30.who.moments.map((it) => `<li class="bl-scene"><h4>${esc(it.name)}</h4><p>${esc(it.body ?? it.lead)}</p></li>`).join("");
  const who = block(
    "bl-who",
    `${titleBlock(O30.who.kicker, O30.who.title, O30.who.lead, 2, "bl-who-title")}
    ${icards(O30.who.customers, ["baby", "users", "book", "building"], 3, "bl-icards--who")}
    <h3 class="bl-sub bl-sub--lg">${esc(O30.who.momentsTitle)}</h3>
    <ul class="bl-scenes">${moments}</ul>`,
    "tint"
  );
  // Differentiation hypotheses — "existing alternative → BABYLOG" table
  const diffRows = O30.diff.items
    .map((it) => {
      const [a, b] = it.name.split("→").map((s) => s.trim());
      return `<li class="bl-cmp__row">${
        b ? `<h3 class="bl-cmp__name"><span class="bl-cmp__a">${esc(a)}</span><span class="bl-cmp__arrow" aria-hidden="true">${icon("arrow")}</span><span class="bl-cmp__b">${esc(b)}</span></h3>` : `<h3 class="bl-cmp__name"><span class="bl-cmp__b">${esc(it.name)}</span></h3>`
      }<p>${esc(it.lead)}</p></li>`;
    })
    .join("");
  const diff = block("bl-diff", `<div class="bl-split bl-split--wide"><div>${titleBlock(O30.diff.kicker, O30.diff.title, O30.diff.lead, 2, "bl-diff-title")}</div><ul class="bl-cmp">${diffRows}</ul></div>`, "tint");
  // Current service status — four-stage board
  const now = block(
    "bl-now",
    `${titleBlock(O30.now.kicker, O30.now.title, O30.now.lead, 2, "bl-now-title")}
    ${board(C.c30.status.columns, C.c30.status.note)}
    <p class="bl-biz__cta"><a class="bl-arrow" href="${pagePath(lang, "platform")}#bl-roadmap">${esc(C.c30.status.more)} ${icon("arrow")}</a></p>`
  );

  // Journey — interactive six-stage rail (home-lifestage.js), pink active state
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
  const journey = block(
    "bl-journey",
    `${titleBlock(o.journey.kicker, o.journey.title, o.journey.lead, 2, "bl-journey-title")}
    <div class="nls-rail" role="group" aria-label="${esc(o.journey.kicker.replace(/^\d+ · /, ""))}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    ${scopeNote(C)}`,
    "",
    "nls-journey-sec"
  );

  // Core experience — bento (wide, wide / four small / wide, wide)
  const dailyIcons = ["baby", "chart", "heart", "users", "calendar", "chat", "home", "shield"];
  const bento = X.daily.items
    .map((it, i) => `<article class="bl-bento__item${[0, 1, 6, 7].includes(i) ? " is-wide" : ""}">${ico(dailyIcons[i % 8])}<h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`)
    .join("");
  const daily = block("bl-daily", `${titleBlock(X.daily.kicker, X.daily.title, X.daily.lead, 2, "bl-daily-title")}<div class="bl-bento">${bento}</div>`);

  // For families — four open feature columns on the pale band
  const health = block("bl-health", `${titleBlock(X.health.kicker, X.health.title, X.health.lead, 2, "bl-health-title")}${features(X.health.items, ["users", "lock", "calendar", "shield"], 3, "bl-feat--4")}`, "tint");

  // Beyond parenting — split: statement left, the four sides as a large-type list right (no hub diagram)
  const net = o.ecosystem.items.map((it) => `<article class="bl-net__item"><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`).join("");
  const ecosystem = block(
    "bl-ecosystem",
    `<div class="bl-split bl-split--wide"><div>${titleBlock(o.ecosystem.kicker, o.ecosystem.title, o.ecosystem.lead, 2, "bl-ecosystem-title")}</div><div class="bl-net">${net}</div></div>`
  );

  // Lifestyle & services — four tiles
  const parentEco = block("bl-parent-eco", `${titleBlock(X.parentEco.kicker, X.parentEco.title, X.parentEco.lead, 2, "bl-parent-eco-title")}${icards(X.parentEco.items, ["bag", "hand", "book", "chat"], 3, "bl-icards--4 bl-icards--rail")}`, "tint");

  // Trust — split with check list
  const trust = block("bl-trust", `<div class="bl-split bl-split--wide"><div>${titleBlock(X.trust.kicker, X.trust.title, X.trust.lead, 2, "bl-trust-title")}</div>${checks(X.trust.items)}</div>`);

  // Business opportunities — six model tiles (A–F are the IDs used on the Business page) + 8-category index
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
    "tint"
  );

  // Child safety & social impact — dark band (kept)
  const impactItems = X.impact.items
    .map((it) => `<li><span>${esc(it.n)}</span><div><strong>${esc(it.name)}</strong><p>${esc(it.lead)}</p></div></li>`)
    .join("");
  const impact = `<section id="bl-impact" class="nls-block nls-block--ink bl-impact" data-hs-section aria-labelledby="bl-impact-title">
    <div class="bl-split">
      <div>
        ${titleBlock(X.impact.kicker, X.impact.title, "", 2, "bl-impact-title")}
        <p class="nls-lead">${esc(X.impact.body)}</p>
        <div class="nls-actions">
          <a class="nls-btn" href="${pagePath(lang, "business")}#cat-07">${esc(X.impact.ctaBusiness)} →</a>
          <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}#bl-cs-partners">${esc(X.impact.ctaPartner)}</a>
        </div>
      </div>
      <ol class="bl-ilist">${impactItems}</ol>
    </div>
    <div class="bl-impact__notes">
      <p class="nls-note">${esc(C.ui.csNote)}</p>
      <p class="nls-note">${esc(C.ui.koreaNote)}</p>
    </div>
  </section>`;

  // Global vision (future plan, 2026-10-26) — three open feature columns on the pale band
  const GO = C.c30.global.overview;
  const globalVision = block(
    "bl-global",
    `${titleBlock(GO.kicker, GO.title, GO.lead, 2, "bl-global-title")}
    ${features(GO.items, ["sprout", "shield", "link"], 3, "bl-feat--3")}
    <p class="nls-note">${esc(GO.note)}</p>
    <p class="bl-biz__cta"><a class="bl-arrow" href="${pagePath(lang, "platform")}#bl-global">${esc(GO.more)} ${icon("arrow")}</a></p>`,
    "tint"
  );

  // NEWON connection — large statement, four principles in open columns
  const principles = o.newon.items.map((s) => `<li><h3>${esc(s.name)}</h3><p>${esc(s.body)}</p></li>`).join("");
  const newon = block("bl-newon", `<div class="bl-callout">${titleBlock(o.newon.kicker, o.newon.title, o.newon.lead, 2, "bl-newon-title")}<ol class="bl-pr">${principles}</ol></div>`);

  // NEWON ecosystem — six platform tiles, BABYLOG highlighted
  const plats = X.platforms.items
    .map((s2, i) => `<li class="bl-plat${i === 0 ? " is-self" : ""}"><h3>${esc(s2.name)}</h3><p>${esc(s2.body)}</p></li>`)
    .join("");
  const platforms = block(
    "bl-platforms",
    `${titleBlock(X.platforms.kicker, X.platforms.title, X.platforms.lead, 2, "bl-platforms-title")}<ol class="bl-plats">${plats}</ol><p class="nls-note">${esc(X.platforms.note)}</p>`,
    "band"
  );

  const ctas = `<a class="nls-btn" href="${pagePath(lang, "platform")}">${esc(C.ui.toPlatform)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}">${esc(C.ui.toPartnershipsLearn)}</a>`;
  return {
    hero: hero(C, lang, "overview", o.hero, false),
    main: [vision, connect, problem, who, journey, daily, health, ecosystem, parentEco, trust, diff, now, opportunities, impact, globalVision, newon, platforms, closeBlock(C, lang, "overview", o, ctas)].join("\n"),
  };
}

/* ------------------------------------------------------------------ Platform */
const SECTION_LAYOUT = {
  growth: { tone: "", render: (s) => steps(s.items, 3, "bl-steps--3") },
  records: { tone: "tint", split: true, render: (s) => rows(s.items, ["calendar", "heart", "chart"]) },
  family: { tone: "", render: (s) => duo(s.items, ["users", "lock"]) },
  learning: { tone: "tint", render: (s) => icards(s.items, ["calendar", "book", "building"], 3, "bl-icards--3") },
  memories: { tone: "", split: true, render: (s) => features(s.items, ["photo", "book"], 3, "bl-feat--2") },
  assist: { tone: "tint", render: (s) => s.items.map((it) => `<div class="bl-solo">${ico("sparkle")}<div><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></div></div>`).join("") },
  explore: { tone: "", render: (s) => duo(s.items, ["compass", "link"], 3, "bl-duo--line") },
  trust: { tone: "tint", split: true, wide: true, render: (s) => checks(s.items) },
};

function platformBody(C, lang) {
  const p = C.platform;
  const X = C.x.platform;
  const sc = X.screens;

  // 27 long-term areas in five groups: group label left, an open two-column list right (no card boxes)
  const screenGroups = sc.groups
    .map(
      (g) => `<div class="bl-scr__grp" aria-labelledby="bl-${g.id}-t">
      <div class="bl-scr__label"><h3 class="bl-group__t" id="bl-${g.id}-t">${esc(g.name)}</h3></div>
      <div class="bl-scr__list">${g.items
        .map(
          (it) => `<article class="bl-screen">
        <p class="bl-screen__n" aria-hidden="true">${esc(it.n)}</p>
        <div><p class="nls-kicker">${esc(it.en)}</p>
        <h4>${esc(it.name)}</h4>
        <p>${esc(it.lead)}</p></div>
      </article>`
        )
        .join("")}</div>
    </div>`
    )
    .join("");
  const screens = block(
    "bl-screens",
    `${titleBlock(sc.kicker, sc.title, sc.lead, 2, "bl-screens-title")}
    ${scopeNote(C)}
    <div class="bl-scr">${screenGroups}</div>`
  );

  const P30 = C.c30.platform;
  const sections = p.sections.map((s) => (s.id === "trust" ? { ...s, items: [...s.items, ...P30.trustExtra] } : s));
  const flow = block(
    "bl-flow",
    `${titleBlock(P30.flow.kicker, P30.flow.title, P30.flow.lead, 2, "bl-flow-title")}
    ${steps(P30.flow.items, 3, "bl-steps--5")}
    <p class="nls-note">${esc(P30.flow.note)}</p>`,
    "tint"
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
      .join("")}</ul>`,
    "tint"
  );
  const roadmap = block(
    "bl-roadmap",
    `${titleBlock(P30.roadmap.kicker, P30.roadmap.title, P30.roadmap.lead, 2, "bl-roadmap-title")}
    ${board(C.c30.status.columns, C.c30.status.note)}`
  );
  const faqItems = P30.faq.items
    .map(
      (f) => `<details class="bl-faq__item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}${
        f.link === "delete" ? ` <a class="bl-link" href="/${lang}/${BL_SLUG}/delete-account/">${esc(P30.faq.deleteLink)}</a>` : ""
      }</p></details>`
    )
    .join("");
  const faq = block("bl-faq", `<div class="bl-split bl-split--faq"><div>${titleBlock(P30.faq.kicker, P30.faq.title, "", 2, "bl-faq-title")}</div><div class="bl-faq">${faqItems}</div></div>`, "tint");

  const secs = sections
    .map((s) => {
      const L = SECTION_LAYOUT[s.id] || { tone: "", render: (x) => icards(x.items, ["sparkle"], 3, "bl-icards--3") };
      const head = titleBlock(s.kicker, s.title, s.lead, 2, `bl-${s.id}-title`);
      const inner = L.split ? `<div class="bl-split${L.wide ? " bl-split--wide" : ""}"><div>${head}</div>${L.render(s)}</div>` : `${head}${L.render(s)}`;
      return block(`bl-${s.id}`, inner, L.tone, `bl-v-${s.id}`);
    })
    .join("\n");

  // Public-welfare / child-safety areas 25–32: intro band, then the eight areas as a two-column card grid
  const F2 = X.cs.fields;
  const csIntro = block(
    "bl-cs",
    `${titleBlock(X.cs.kicker, X.cs.title, X.cs.lead, 2, "bl-cs-title")}
    ${csNotices(C, true)}
    ${jump(X.cs.railLabel, C.x.csGroups.map((g) => [`#bl-cs-${g.id}`, g.n, g.en]), "bl-rail--chips")}`,
    "tint"
  );
  const csIcons = ["building", "shield", "compass", "hand", "home", "heart", "sprout", "sparkle"];
  const csCards = C.x.csGroups
    .map(
      (g, i) => `<section id="bl-cs-${g.id}" class="bl-cscard" data-hs-section aria-labelledby="bl-cs-${g.id}-title">
      <header class="bl-cscard__head">${ico(csIcons[i % 8])}<p class="nls-kicker">${esc(`${g.n} · ${g.en}`)}</p></header>
      <h2 class="bl-cscard__title" id="bl-cs-${g.id}-title">${nl(g.title)}</h2>
      <p class="bl-cscard__lead">${esc(g.service)}</p>
      <p class="bl-sub">${esc(F2.subs)}</p>
      ${chips(g.subs)}
      ${dl([
        [F2.sources, esc(g.sources)],
        [F2.guard, esc(g.guard)],
      ], "bl-dl--stack")}
    </section>`
    )
    .join("\n");
  const csGrid = `<div class="bl-csgrid">${csCards}</div>`;
  const csNote = block("bl-cs-note", `<p class="nls-note">${esc(C.ui.sourcesNote)}</p>`, "", "bl-cs-end");

  // Global services & localisation (future plan, 2026-10-26): services as rows, criteria as a check list
  const GP = C.c30.global.platform;
  const globalServices = block(
    "bl-global",
    `${titleBlock(GP.kicker, GP.title, GP.lead, 2, "bl-global-title")}
    <div class="bl-split bl-split--wide"><div><h3 class="bl-sub bl-sub--lg">${esc(GP.servicesTitle)}</h3></div>${rows(GP.services, ["book", "users", "calendar", "home", "hand"], 4)}</div>
    <div class="bl-split bl-split--wide"><div><h3 class="bl-sub bl-sub--lg">${esc(GP.locTitle)}</h3></div>${checks(GP.loc, 4)}</div>`,
    "tint"
  );

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
    </div>`
  );
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "platform", "app")}">${esc(C.ui.toInquiry)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "business")}">${esc(C.ui.toBusiness)}</a>`;
  return {
    hero: hero(C, lang, "platform", p.hero, true),
    main: [
      screens,
      flow,
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
  const modelIcons = { a: "users", b: "building", c: "bag", d: "shield", e: "store", f: "globe" };
  const cards = b.categories
    .map((cat) => {
      const rows2 = [
        [F.overview, esc(cat.overview)],
        [F.customers, esc(cat.customers)],
        [F.problem, esc(cat.problem)],
        [F.value, esc(cat.value)],
        [F.revenue, esc(cat.revenue)],
        [F.partners, esc(cat.partners)],
      ];
      return `<article id="biz-${cat.id}" class="bl-biz bl-model-card" aria-labelledby="biz-${cat.id}-title">
      <header class="bl-biz__head">
        <span class="bl-biz__code" aria-hidden="true">${esc(cat.code)}</span>
        <div>
          <p class="nls-kicker">${esc(cat.en)}</p>
          <h3 id="biz-${cat.id}-title" class="bl-biz__title">${esc(cat.name)}</h3>
        </div>
        <span class="bl-biz__ico" aria-hidden="true">${icon(modelIcons[cat.id] || "sparkle")}</span>
      </header>
      ${chips(cat.items)}
      ${dl(rows2, "bl-dl--grid")}
      <p class="bl-biz__cta"><a class="bl-arrow" href="${pagePath(lang, "partnerships")}#partner-${cat.partnerType}" aria-label="${esc(F.cta)}: ${esc(cat.name)}">${esc(F.cta)} ${icon("arrow")}</a></p>
    </article>`;
    })
    .join("\n");
  const intro = block(
    "bl-biz",
    `<div class="bl-split bl-split--top">${titleBlock(b.intro.kicker, b.intro.title, b.intro.lead, 2, "bl-biz-title")}
    <div class="bl-aside">${icon("info", "bl-aside__ico")}<p class="nls-note">${esc(C.ui.noOutsourcing)}</p>
    <p class="nls-note">${esc(C.ui.noPrice)}</p></div></div>
    <div class="bl-biz__list">${cards}</div>`
  );

  const G = C.x.business.groups;
  const GF = G.fields;
  const gmap = allGroups(C);
  const catHtml = G.cats
    .map((c) => {
      const members = c.groups.map((id) => gmap.get(id));
      const csCat = !!c.cs;
      const catRows = [
        [GF.model, esc(c.model)],
        [GF.revenue, esc(c.revenue)],
      ];
      const forb = c.forbidden ? `<div class="bl-forbid"><p class="bl-sub">${esc(c.forbiddenLabel)}</p>${chips(c.forbidden)}</div>` : "";
      const cards2 = members
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
          // details: the field names themselves label the disclosure (no new copy)
          const more = rows3.map(([k]) => k).join(" · ");
          return `<article id="grp-${g.n}" class="bl-grp${g.cs ? " bl-grp--cs" : ""}" aria-labelledby="grp-${g.n}-title">
        <header class="bl-grp__head">
          <span class="bl-grp__n" aria-hidden="true">${esc(g.n)}</span>
          <div><p class="nls-kicker">${esc(g.en)}</p><h4 id="grp-${g.n}-title" class="bl-biz__title">${esc(copyLangFor(lang) === "ko" ? g.name : g.en)}</h4></div>
        </header>
        ${chips(g.subs)}
        <details class="bl-more"><summary>${esc(more)}</summary>${dl(rows3, "bl-dl--stack")}</details>
        <p class="bl-biz__cta"><a class="bl-arrow" href="${target}">${esc(b.fields.cta)} ${icon("arrow")}</a></p>
      </article>`;
        })
        .join("");
      return `<section id="cat-${c.id}" class="bl-cat${csCat ? " bl-cat--cs" : ""}" aria-labelledby="cat-${c.id}-title">
      <div class="bl-cat__side">
        <header class="bl-cat__head">
          <span class="bl-cat__n" aria-hidden="true">${esc(c.id)}</span>
          <div><p class="nls-kicker">${esc(c.en)}</p><h3 id="cat-${c.id}-title" class="bl-biz__title">${esc(copyLangFor(lang) === "ko" ? c.name : c.en)}</h3></div>
          <span class="bl-cat__count">${members.length}${esc(C.x.overview.groupsIndex.countUnit)}</span>
        </header>
        <div class="bl-cat__meta">${dl(catRows, "bl-dl--stack")}<p class="nls-note">${esc(C.ui.catApplies)}</p></div>
        ${forb}
      </div>
      <div class="bl-cat__main">
        ${csCat ? csNotices(C, true) : ""}
        <div class="bl-grp__list">${cards2}</div>
      </div>
    </section>`;
    })
    .join("\n");
  const groups = block(
    "bl-groups",
    `${titleBlock(G.kicker, G.title, G.lead, 2, "bl-groups-title")}
    ${scopeNote(C)}
    <p class="nls-note">${esc(G.note)}</p>
    ${jump(C.ui.cats, G.cats.map((c) => [`#cat-${c.id}`, c.id, copyLangFor(lang) === "ko" ? c.name : c.en]), "bl-rail--cats bl-rail--chips")}
    ${catHtml}`,
    "tint"
  );
  const ph = C.x.business.phases;
  const phases = block(
    "bl-phases",
    `<div class="bl-split bl-split--wide"><div>${titleBlock(ph.kicker, ph.title, ph.lead, 2, "bl-phases-title")}<p class="nls-note">${esc(ph.note)}</p></div>
    ${vsteps(ph.items, 3)}</div>`
  );
  const B30 = C.c30.business;
  const PY = B30.payers;
  // Customers & payers — a data table grouped by stage (stacks into cards on phones)
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
    </div>`,
    "tint"
  );
  const RV = B30.revenue;
  const revenue = block(
    "bl-revenue",
    `${titleBlock(RV.kicker, RV.title, RV.lead, 2, "bl-revenue-title")}
    ${features(RV.kinds, ["users", "bag", "building"], 3, "bl-feat--3")}
    ${board(RV.columns, RV.note)}`
  );
  const MK = B30.market;
  const market = block(
    "bl-market",
    `<div class="bl-split bl-split--wide"><div>${titleBlock(MK.kicker, MK.title, MK.lead, 2, "bl-market-title")}</div>${rows(MK.items, ["chart", "link", "shield", "alert"])}</div>
    <h3 class="bl-sub bl-sub--lg">${esc(MK.diffTitle)}</h3>
    ${icards(MK.diff, null, 4, "bl-icards--3 bl-icards--quote")}
    <p class="nls-note">${esc(MK.diffNote)}</p>`,
    "tint"
  );
  const EN2 = B30.entry;
  const entry = block("bl-entry", `${titleBlock(EN2.kicker, EN2.title, EN2.lead, 2, "bl-entry-title")}${steps(EN2.items, 3)}`);
  const RU = B30.rules;
  const rules = block("bl-rules", `<div class="bl-split bl-split--wide"><div>${titleBlock(RU.kicker, RU.title, RU.lead, 2, "bl-rules-title")}</div>${checks(RU.items)}</div>`, "tint");
  // Global go-to-market (future plan, 2026-10-26): customer groups, revenue models under review, five steps
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
  const ctas = `<a class="nls-btn" href="${pagePath(lang, "partnerships")}">${esc(C.ui.toPartnerships)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${inquiryHref(lang, "business", "")}">${esc(C.ui.inquiryCta)}</a>`;
  return {
    hero: hero(C, lang, "business", b.hero, true),
    main: [intro, payers, revenue, market, entry, groups, phases, rules, globalGtm, closeBlock(C, lang, "business", b, ctas)].join("\n"),
  };
}

/* -------------------------------------------------------------- Partnerships */
function partnershipsBody(C, lang) {
  const p = C.partnerships;
  const T = p.types;
  const typeIcons = ["store", "bag", "book", "heart", "hand", "building", "home", "globe"];
  const cards = T.items
    .map((it, i) => {
      const r = [
        [T.fields.who, esc(it.who)],
        [T.fields.areas, esc(it.areas)],
        [T.fields.model, esc(it.model)],
        [T.fields.terms, esc(it.terms)],
      ];
      return `<article id="partner-${it.code}" class="bl-biz bl-pcard" aria-labelledby="partner-${it.code}-title">
      <header class="bl-biz__head">
        ${ico(typeIcons[i % 8])}
        <div><h3 id="partner-${it.code}-title" class="bl-biz__title">${esc(it.name)}</h3></div>
      </header>
      ${dl(r, "bl-dl--grid")}
      <p class="bl-biz__cta"><a class="nls-btn bl-btn-point" href="${inquiryHref(lang, "partnerships", it.code)}">${esc(T.cta)} →</a></p>
    </article>`;
    })
    .join("\n");
  const PX = C.x.partnerships;
  const ind = PX.industry;
  // 15 industry partner types — a clean table: name | purpose | terms | inquiry link
  const indRows = ind.items
    .map((it, i) => {
      const code = IND_PARTNER_CODES[i];
      return `<article id="partner-${code}" class="bl-trow" aria-labelledby="partner-${code}-title">
      <h3 id="partner-${code}-title" class="bl-trow__name">${esc(it[0])}</h3>
      ${dl([
        [ind.fields.purpose, esc(it[1])],
        [ind.fields.terms, esc(it[2])],
      ], "bl-trow__cells")}
      <p class="bl-trow__go"><a class="bl-arrow" href="${inquiryHref(lang, "partnerships", code)}" aria-label="${esc(T.cta)}: ${esc(it[0])}">${esc(T.cta)} ${icon("arrow")}</a></p>
    </article>`;
    })
    .join("\n");
  const cs = PX.cs;
  const csCards = cs.items
    .map((it, i) => {
      const code = CS_PARTNER_CODES[i];
      return `<article id="partner-${code}" class="bl-biz bl-biz--compact bl-biz--cs" aria-labelledby="partner-${code}-title">
      <header class="bl-biz__head"><div><h3 id="partner-${code}-title" class="bl-biz__title">${esc(it[0])}</h3></div></header>
      ${dl([
        [cs.fields.purpose, esc(it[1])],
        [cs.fields.value, esc(it[2])],
        [cs.fields.terms, esc(it[3])],
      ], "bl-dl--stack")}
      <p class="bl-biz__cta"><a class="bl-arrow" href="${inquiryHref(lang, "partnerships", code)}">${esc(cs.cta)} ${icon("arrow")}</a></p>
    </article>`;
    })
    .join("\n");
  const R30 = C.c30.partnerships;
  const pvision = block("bl-pvision", `${titleBlock(R30.vision.kicker, R30.vision.title, R30.vision.lead, 2, "bl-pvision-title")}${features(R30.vision.items, ["heart", "shield", "hand"], 3, "bl-feat--3 bl-feat--lg")}`);
  const PL = R30.pilots;
  const pilots = block(
    "bl-pilots",
    `${titleBlock(PL.kicker, PL.title, PL.lead, 2, "bl-pilots-title")}
    <div class="bl-biz__list bl-biz__list--3 bl-pilots">${dcards(
      PL.items.map((it) => ({ ...it, id: it.code })),
      [["who", PL.fields.who], ["how", PL.fields.how], ["check", PL.fields.check]],
      3,
      { label: PL.cta, href: (it) => inquiryHref(lang, "partnerships", it.code) }
    )}</div>
    <p class="nls-note">${esc(C.ui.noPartner)}</p>`,
    "tint"
  );
  const DA = R30.data;
  const data = block(
    "bl-data",
    `<div class="bl-split bl-split--wide"><div>${titleBlock(DA.kicker, DA.title, DA.lead, 2, "bl-data-title")}</div>${rows(DA.items, ["globe", "calendar", "store", "link"])}</div>
    <div class="bl-principles bl-principles--panel"><h3 class="bl-sub bl-sub--lg">${esc(DA.principlesTitle)}</h3>
    <ul class="bl-plist">${DA.principles.map((t) => `<li>${icon("lock")}<span>${esc(t)}</span></li>`).join("")}</ul></div>`
  );
  const joint = block("bl-joint", `${titleBlock(R30.joint.kicker, R30.joint.title, R30.joint.lead, 2, "bl-joint-title")}${icards(R30.joint.items, ["book", "shield", "building"], 3, "bl-icards--3")}`, "tint");
  const pvalue = block("bl-pvalue", `<div class="bl-split bl-split--wide"><div>${titleBlock(R30.value.kicker, R30.value.title, R30.value.lead, 2, "bl-pvalue-title")}</div>${checks(R30.value.items)}</div>`, "tint");
  // Global partnerships (possibilities only, 2026-10-26): partner kinds as a table, shared principles, one inquiry
  // button to the unified NEWON Contact page (BABYLOG preselected via ?platform=).
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
    <div class="bl-ttable">
      <div class="bl-ttable__head" aria-hidden="true"><span></span><span>${esc(GR.fields.area)}</span><span>${esc(GR.fields.check)}</span><span></span></div>
      ${globalRows}
    </div>
    <div class="bl-principles bl-principles--panel"><h3 class="bl-sub bl-sub--lg">${esc(GR.principlesTitle)}</h3>
    <ul class="bl-plist">${GR.principles.map((t) => `<li>${icon("lock")}<span>${esc(t)}</span></li>`).join("")}</ul></div>
    <div class="nls-actions"><a class="nls-btn bl-btn-point" href="/${lang}/contact/?type=partnership&amp;platform=babylog">${esc(GR.cta)} →</a></div>
    <p class="nls-note">${esc(GR.ctaNote)}</p>`,
    "tint"
  );
  const principleList = `<ul class="bl-plist">${p.principles.items.map((t) => `<li>${icon("check")}<span>${esc(t)}</span></li>`).join("")}</ul>`;
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "partnerships", "")}">${esc(C.ui.inquiryCta)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "contact")}">${esc(C.ui.toInquiry)}</a>`;
  return {
    hero: hero(C, lang, "partnerships", p.hero, true),
    main: [
      pvision,
      block(
        "bl-types",
        `${titleBlock(T.kicker, T.title, T.lead, 2, "bl-types-title")}
    <div class="bl-models-chips">${chips(T.models)}
    <p class="nls-note">${esc(C.ui.noPartner)}</p></div>
    ${jump(T.railLabel, T.items.map((it) => [`#partner-${it.code}`, "", it.name]), "bl-rail--chips")}
    <div class="bl-biz__list bl-biz__list--2">${cards}</div>
    <p class="nls-note">${esc(C.ui.noPrice)}</p>`,
        "tint"
      ),
      block(
        "bl-industry",
        `${titleBlock(ind.kicker, ind.title, ind.lead, 2, "bl-industry-title")}
    ${jump(ind.railLabel, ind.items.map((it, i) => [`#partner-${IND_PARTNER_CODES[i]}`, "", it[0]]), "bl-rail--chips")}
    <div class="bl-ttable">
      <div class="bl-ttable__head" aria-hidden="true"><span></span><span>${esc(ind.fields.purpose)}</span><span>${esc(ind.fields.terms)}</span><span></span></div>
      ${indRows}
    </div>`
      ),
      pilots,
      data,
      joint,
      block(
        "bl-cs-partners",
        `${titleBlock(cs.kicker, cs.title, cs.lead, 2, "bl-cs-partners-title")}
    ${csNotices(C, true)}
    <p class="nls-note bl-flow-note">${esc(C.ui.csPartnerNote)} ${esc(cs.fields.flow)}: ${esc(cs.flowText)}</p>
    ${jump(cs.railLabel, cs.items.map((it, i) => [`#partner-${CS_PARTNER_CODES[i]}`, "", it[0]]), "bl-rail--chips")}
    <div class="bl-biz__list bl-biz__list--3">${csCards}</div>`,
        "band"
      ),
      globalPartners,
      block(
        "bl-process",
        `${titleBlock(p.process.kicker, p.process.title, p.process.lead, 2, "bl-process-title")}
    ${steps(p.process.steps.map((s) => ({ n: s.n, name: s.name, body: s.body })), 3, "bl-steps--5")}
    <div class="bl-principles bl-principles--panel"><h3 class="bl-sub bl-sub--lg">${esc(p.principles.title)}</h3>
    ${principleList}</div>`
      ),
      pvalue,
      closeBlock(C, lang, "partnerships", p, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------- Contact */
function contactBody(C, lang) {
  const c = C.contact;
  const CX = C.x.contact;
  // Contact categories keep their 01–26 numbers: the copy refers to them ("09–17").
  const card = (it, extra = "") => `<li><a class="bl-card${extra}" href="${inquiryHref(lang, "contact", it.code)}" data-analytics="babylog_contact_${it.code}">
        <span class="bl-card__n" aria-hidden="true">${esc(it.n)}</span>
        <strong class="bl-card__t">${esc(it.name)}</strong>
        <span class="bl-card__d">${esc(it.lead)}</span>
        <span class="bl-card__go">${esc(c.list.go)}</span>
      </a></li>`;
  const guideIcons = ["mail", "link", "chat", "lock"];
  const K30 = C.c30.contact;
  const PU = K30.purpose;
  const purposeHref = (to, i) => {
    if (to.startsWith("babylog:")) return inquiryHref(lang, "contact", to.slice(8));
    if (to.startsWith("biz:")) return `/${lang}/business/contact/?type=${to.slice(4)}&platform=babylog#bpt-form`;
    const subject = i === PU.items.length - 1 ? PU.mailSubjectInvest : PU.mailSubjectMedia;
    return `mailto:newon@newon.app?subject=${encodeURIComponent(subject)}`;
  };
  const purposeIcons = ["chat", "info", "store", "building", "link", "photo", "chart"];
  const purpose = block(
    "bl-contact-purpose",
    `<div class="bl-split bl-split--wide"><div>${titleBlock(PU.kicker, PU.title, PU.lead, 2, "bl-contact-purpose-title")}</div>
    <ul class="bl-rows bl-rows--purpose">${PU.items
      .map(
        (it, i) => `<li class="bl-rows__item">${ico(purposeIcons[i % 7])}<div><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></div>
        <p class="bl-rows__go"><a class="bl-arrow" href="${purposeHref(it.to, i)}">${esc(it.go)} ${icon("arrow")}</a></p></li>`
      )
      .join("")}</ul></div>`,
    "tint"
  );
  const guide = [...c.guide.items, K30.sensitive]
    .map((it, i) => `<li class="bl-guide__item">${ico(guideIcons[i % 4])}<h3>${esc(it.name)}</h3><p>${esc(it.body)}</p></li>`)
    .join("");
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "contact", "")}">${esc(C.ui.toInquiry)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}">${esc(C.ui.toPartnerships)}</a>`;
  return {
    hero: hero(C, lang, "contact", c.hero, true),
    main: [
      purpose,
      block("bl-contact-list", `${titleBlock(c.list.kicker, c.list.title, c.list.lead, 2, "bl-contact-list-title")}<ul class="bl-cards">${c.list.items.map((it) => card(it)).join("")}</ul>`),
      block(
        "bl-contact-more",
        `${titleBlock(CX.more.kicker, CX.more.title, CX.more.lead, 2, "bl-contact-more-title")}<ul class="bl-cards bl-cards--rows">${CX.more.items.map((it) => card(it, " bl-card--row")).join("")}</ul>`,
        "tint"
      ),
      block(
        "bl-contact-cs",
        `${titleBlock(CX.cs.kicker, CX.cs.title, CX.cs.lead, 2, "bl-contact-cs-title")}
    ${csNotices(C, true)}
    <ul class="bl-cards bl-cards--cs">${CX.cs.items.map((it) => card(it)).join("")}</ul>`
      ),
      block(
        "bl-guide",
        `${titleBlock(c.guide.kicker, c.guide.title, "", 2, "bl-guide-title")}<ol class="bl-guide">${guide}</ol>
    <p class="nls-note">${esc(C.ui.privacyNote)} <a class="bl-link" href="/${lang}/privacy/">${esc(C.ui.privacyLink)}</a></p>`,
        "tint"
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
  ${renderFlagshipSubnav({ biz: "babylog", lang, active: page })}
  <div class="nls__wrap">
    ${main}
  </div>
</section>`;
}
