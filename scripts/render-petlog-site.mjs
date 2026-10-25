#!/usr/bin/env node
/**
 * PETLOG business website — /{lang}/petlog/{,platform/,business/,partnerships/,contact/} for all locales.
 *
 * Design: the existing LivOn Life Stage page shell and film hero (/lifestage/) — same shell, same #lifestage-detail.nls
 * components (film hero, roster, journey rail, flow/board/signal/index/dir/pipe lists, ink close) and the same
 * home-lifestage.css / home-lifestage-layout.css / home-lifestage.js. The PETLOG green is used only for the
 * small kicker labels and status tags (scoped .nls--petlog rules in /petlog-site.css). The Contact form is the shared Newon
 * inquiry form (render-bsp.mjs → business/inquiry.js → FormSubmit).
 * No app feature (records, booking, orders, payment, sign-in, seller sign-up, posting) is built on the web.
 * Copy: scripts/petlog-site-content.mjs (ko + en; other locales show the English body, like the rest of the site).
 * V4 (2026-10-25): body redesign — styles moved to /petlog-site.css, one layout per section (content unchanged).
 * V3 (2026-10-24): 25 platform areas, 12 revenue models, scenarios, FAQ, PoC/data sections, inquiry purposes — content only.
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
const NLS_VER = "20261025ov1";
const esc = escapeHtml;
const bl = (lang) => (lang === "ko" ? "ko" : "en");
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");
const pad2 = (n) => String(n).padStart(2, "0");
const rel = (depth, p) => (/^(https?:|mailto:|#|\/)/.test(p) ? p : "../".repeat(depth) + p);


/* ---------------------------------------------------------------- design (2026-10-25 body redesign)
 * The film hero, the shared sub-menu and the Life Stage shell stay exactly as they are (the two hero framing rules
 * below are unchanged). Everything below the hero is PETLOG's own layout in /petlog-site.css (pl-* classes, scoped to
 * #lifestage-detail.nls--petlog): a different layout per section — editorial definition rows, problem/solution pairs,
 * a features bento, now/next scene cards, comparison rows, status board, data tables, directories, accordions —
 * with 16px body text and PETLOG green as a point colour only. No screenshots, images or decorative shapes.
 */
const PETLOG_CSS_VER = "20261025rd1";
const PETLOG_CSS = `<link rel="stylesheet" href="/petlog-site.css?v=${PETLOG_CSS_VER}" />
    <style>
  /* Background film framing: show more of the right side (owner request 2026-10-19). */
  #lifestage-detail.nls[data-story="petlog"] .nls-film__video { object-position: 75% 50%; }
  /* the shared film fallback is the LIVON poster; PETLOG shows plain black until its film loads */
  #lifestage-detail.nls--petlog .nls-film__fallback { background: #050505; }
</style>`;

/* ---------------------------------------------------------------- inline line icons (24×24, stroke) */
const ICON = {
  paw: '<circle cx="6.5" cy="10" r="1.7"/><circle cx="10" cy="6" r="1.7"/><circle cx="14" cy="6" r="1.7"/><circle cx="17.5" cy="10" r="1.7"/><path d="M8 17.2c0-2.6 1.9-5.2 4-5.2s4 2.6 4 5.2c0 1.5-1.2 2.4-2.6 2-.9-.3-1.9-.3-2.8 0-1.4.4-2.6-.5-2.6-2z"/>',
  heart: '<path d="M12 20s-7.5-4.5-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.5 12 20 12 20z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  sprout: '<path d="M12 20v-8"/><path d="M12 12c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5z"/><path d="M12 14.5c0-3-2.6-5.2-6-5.2 0 3 2.6 5.2 6 5.2z"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7l1.4-2.5h4.2L15.5 7"/><circle cx="12" cy="13.5" r="3.4"/>',
  shield: '<path d="M12 3l7 3v5.2c0 4.8-3.3 8.3-7 9.8-3.7-1.5-7-5-7-9.8V6z"/><path d="M9 12l2.1 2.1L15.2 10"/>',
  access: '<circle cx="12" cy="4.8" r="1.8"/><path d="M5 8.8l7 1.2 7-1.2M12 10v4.5m0 0L9 21m3-6.5L15 21"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1-4 3.8-6 7-6s6 2 7 6"/>',
  note: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h3.5"/>',
  bowl: '<path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 8.5c0-1.5 1-2 1-3.5M14 8.5c0-1.5 1-2 1-3.5"/>',
  pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/><path d="M9.5 14.5l1.8 1.8 3.4-3.4"/>',
  users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M3 19.5c.8-3.4 3.2-5.2 6-5.2s5.2 1.8 6 5.2M15.5 14.3c2.5-.4 4.7 1 5.5 3.7"/>',
  chat: '<path d="M4 5h16v11H9.5L4 20z"/><path d="M8 9.5h8M8 12.5h5"/>',
  spark: '<path d="M12 3.5l1.7 5L19 10.2l-5.3 1.7L12 17l-1.7-5.1L5 10.2l5.3-1.7z"/><path d="M18.5 15.5l.7 1.7 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  book: '<path d="M4 5.2c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6.2v14"/>',
  bag: '<path d="M5 8h14l-1.1 12H6.1z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  cycle: '<path d="M4.5 12a7.5 7.5 0 0 1 13.2-4.9M19.5 12a7.5 7.5 0 0 1-13.2 4.9"/><path d="M18 3.5v4h-4M6 20.5v-4h4"/>',
  cart: '<circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/><path d="M3 4h2.2l2.2 10.5h10.8L20 7.5H6.4"/>',
  clinic: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M12 8.2v7.6M8.2 12h7.6"/>',
  scissors: '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8.2 8.3L20 18M8.2 15.7L20 6"/>',
  home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
  walk: '<circle cx="13" cy="4.6" r="1.7"/><path d="M10 21l2-6.5 2.5 2.5V21M12 14.5l-1-4 3-2 2 3.5h3M11 10.5L8 12v3"/>',
  pin: '<path d="M12 21s-6.2-5.6-6.2-11a6.2 6.2 0 0 1 12.4 0c0 5.4-6.2 11-6.2 11z"/><circle cx="12" cy="10" r="2.2"/>',
  umbrella: '<path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v6a2 2 0 0 0 4 0"/>',
  star: '<path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.3l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M11 21v-3h2v3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.5 5.5 3.5 9s-1.1 6.5-3.5 9c-2.4-2.5-3.5-5.5-3.5-9s1.1-6.5 3.5-9z"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8.5 16v-4M12.5 16V8M16.5 16v-6"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.8h2"/>',
  megaphone: '<path d="M4 10v4h3l8 4V6L7 10z"/><path d="M18 9.5a3.5 3.5 0 0 1 0 5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  tool: '<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.3 8.3a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};
const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[k] || ICON.paw}</svg>`;
const ic = (k, big) => `<span class="pl-ic${big ? " pl-ic--lg" : ""}" aria-hidden="true">${svg(k)}</span>`;
const CHECK = `<i aria-hidden="true">${svg("check")}</i>`;

/** Pick a line icon from an English label/name. */
function iconFor(text) {
  const t = String(text || "").toLowerCase();
  const rules = [
    [/memorial|end-of-life|memor|photo/, t.includes("photo") ? "camera" : "star"],
    [/insur/, "umbrella"],
    [/adopt|lost animal|welfare|protection/, "heart"],
    [/profile/, "user"],
    [/daily|diary/, "note"],
    [/meal|walks? &|activity/, "bowl"],
    [/vaccin|medication|vet visit/, "calendar"],
    [/health|medical/, "pulse"],
    [/\bai\b/, "spark"],
    [/family|shar(e|ing)/, "users"],
    [/creator|community|info &/, "chat"],
    [/train|educat|behaviou?r|content/, "book"],
    [/secondhand|circular/, "cycle"],
    [/group buy/, "cart"],
    [/vet|clinic/, "clinic"],
    [/groom/, "scissors"],
    [/sitting|walking/, "walk"],
    [/hotel|daycare|lodging/, "home"],
    [/travel|places/, "pin"],
    [/app &|accessib/, "phone"],
    [/global|licens/, "globe"],
    [/local government|public/, "building"],
    [/saas|enterprise|business|technology/, "chart"],
    [/food|treat|goods|brand|shopping|commerce/, "bag"],
    [/campaign/, "megaphone"],
    [/operations tool/, "tool"],
    [/reaching/, "link"],
    [/data principle/, "shield"],
  ];
  for (const [re, k] of rules) if (re.test(t)) return k;
  return "paw";
}
const VALUE_ICONS = ["heart", "link", "sprout", "shield", "access"];
/** One line icon per platform area (01–25), per revenue model and per partner type. */
const AREA_ICONS = ["user", "pulse", "bowl", "calendar", "camera", "clinic", "scissors", "walk", "home", "book", "chat", "check", "cart", "cycle", "globe", "spark", "shield", "phone", "chart", "link", "building", "pin", "heart", "users", "star"];
const LINE_ICONS = { "01": "cycle", "02": "scissors", "03": "walk", "04": "home", "05": "book", "06": "cart", "07": "bag", "08": "globe", "09": "phone", "10": "chart", "11": "star", "12": "megaphone" };
const PARTNER_ICONS = { "01": "clinic", "02": "scissors", "03": "home", "04": "users", "05": "walk", "06": "book", "07": "bag", "08": "megaphone", "09": "pin", "10": "phone", "11": "umbrella", "12": "heart", "13": "star", "14": "building" };
const BEYOND_ICONS = ["note", "scissors", "chat", "spark", "heart"];
const TYPE_ICONS = { general: "mail", "app-support": "phone", content: "book", vet: "clinic", "booking-provider": "scissors", sitting: "walk", brand: "bag", "group-buying": "cart", "insurance-adoption": "umbrella", saas: "chart", public: "building", global: "globe" };

const TRUST_ICONS = ["book", "shield", "pulse", "heart", "check", "bag"];
/** "(향후)" / "(planned)" at the end of a name marks a future user type in the copy itself. */
const isLater = (name) => /\((향후|planned)\)\s*$/i.test(String(name || ""));
/** "지금 제공." / "Available today." / "in the app today" inside a step marks a current stage. */
const isNow = (text) => /지금 제공|지금 앱에서 제공하는 단계|available today|in the app today/i.test(String(text || ""));

/* ---------------------------------------------------------------- shared blocks */
function head(kicker, title, lead) {
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${esc(kicker)}</p>` : ""}
    <h2 class="nls-title">${nl(title)}</h2>
    ${lead ? `<p class="nls-lead">${esc(lead)}</p>` : ""}
  </header>`;
}
const ext = (h) => /^https?:/.test(h);
const href = (depth, h) => (ext(h) ? h : rel(depth, h));
const extAttr = (h) => (ext(h) ? ' target="_blank" rel="noopener noreferrer"' : "");
const chipList = (items, line) => (items && items.length ? `<ul class="pl-chips${line ? " pl-chips--line" : ""}">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "");
const callout = (t) => (t ? `<p class="nls-note pl-callout">${svg("info")}<span>${esc(t)}</span></p>` : "");
const more = (link, depth) => (link ? `<a class="pl-more" href="${esc(href(depth, link[1]))}"${extAttr(link[1])}>${esc(link[0])} <span aria-hidden="true">→</span></a>` : "");
const metaList = (points) => {
  const rows = (points || []).filter(([, v]) => v && v !== "—");
  return rows.length ? `<dl class="pl-meta">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : "";
};

/** Section wrapper. tint → full-bleed pale-green band. */
function section(id, { kicker, title, lead, noteText, tint, body, extraClass }) {
  return `<div id="${id}" class="nls-block${tint ? " nls-block--band pl-tint" : ""}${extraClass ? ` ${extraClass}` : ""}" data-hs-section>
    ${head(kicker, title, lead)}
    ${callout(noteText)}
    ${body}
  </div>`;
}
/** Statement left, content right (the heading never sticks, so nothing slides over text). */
function splitSection(id, { kicker, title, lead, noteText, tint, body, aside }) {
  return `<div id="${id}" class="nls-block${tint ? " nls-block--band pl-tint" : ""}" data-hs-section>
    <div class="pl-split">
      <div class="pl-split__head">${head(kicker, title, lead)}${callout(noteText)}${aside || ""}</div>
      <div>${body}</div>
    </div>
  </div>`;
}

/**
 * Item lists in one of three PETLOG layouts.
 * kind: row (editorial rows, meta on the right) · grid (cards; cls adds pl-grid--2/3/bento/odd) · cols (ruled columns, no box)
 * item: { n, label?, icon?, name, lead, points?: [k, v][], chips?, link?: [label, href], anchor?, later? }
 */
function items(kind, list, depth, cls = "") {
  const id = (c) => (c.anchor ? ` id="${esc(c.anchor)}"` : "");
  const label = (c) => (c.label ? `<p class="pl-label" lang="en">${esc(c.label)}</p>` : "");
  const n = (c) => (c.n ? `<span class="pl-n">${esc(c.n)}</span>` : "");
  if (kind === "row")
    return `<div class="pl-rows">${list
      .map(
        (c) => `<article class="pl-row"${id(c)}>
        <div class="pl-row__lead"><div class="pl-row__tag">${n(c)}${label(c)}</div><h3>${esc(c.name)}</h3><p class="pl-p">${esc(c.lead)}</p></div>
        <div class="pl-row__side">${metaList(c.points)}${chipList(c.chips)}${more(c.link, depth)}</div>
      </article>`
      )
      .join("")}</div>`;
  if (kind === "cols")
    return `<div class="pl-cols ${cls}">${list
      .map(
        (c) => `<article class="pl-col"${id(c)}>
        ${c.icon ? ic(c.icon) : ""}<div class="pl-row__tag">${n(c)}${label(c)}</div><h3>${esc(c.name)}</h3><p class="pl-p">${esc(c.lead)}</p>
        ${metaList(c.points)}${chipList(c.chips)}${more(c.link, depth)}
      </article>`
      )
      .join("")}</div>`;
  return `<div class="pl-grid ${cls}">${list
    .map((c) => {
      const foot = `${metaList(c.points)}${chipList(c.chips)}${more(c.link, depth)}`;
      return `<article class="pl-card${c.later ? " pl-card--later" : ""}"${id(c)}>
        <div class="pl-card__top">${c.icon ? ic(c.icon) : ""}${n(c)}</div>
        ${label(c)}<h3>${esc(c.name)}</h3><p class="pl-p">${esc(c.lead)}</p>
        ${foot ? `<div class="pl-foot">${foot}</div>` : ""}
      </article>`;
    })
    .join("")}</div>`;
}

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

/** Step sequence (real sequences only). steps: [big, title, body][]; a step whose copy says it is available today is marked. */
const stepList = (steps, lg) =>
  `<ol class="pl-steps${lg ? " pl-steps--lg" : ""}" style="--n:${steps.length}">${steps
    .map(([big, t, d]) => `<li${isNow(d) ? ' class="is-on"' : ""}>${big ? `<span class="pl-big">${esc(big)}</span>` : ""}<h3>${esc(t)}</h3><p class="pl-p">${esc(d)}</p></li>`)
    .join("")}</ol>`;

/** Numbered phase list (roadmap, PoC). rows: [code, title, body][] */
const phases = (rows, step) =>
  `<ol class="pl-phases${step ? " pl-phases--step" : ""}">${rows
    .map(([s, t, d]) => `<li><span class="pl-code" lang="en">${esc(s)}</span><h3>${esc(t)}</h3><p class="pl-p">${esc(d)}</p></li>`)
    .join("")}</ol>`;

/** Checklist. items: string[] */
const checks = (list, two) => `<ul class="pl-checks${two ? " pl-checks--2" : ""}">${list.map((t) => `<li>${CHECK}<span>${esc(t)}</span></li>`).join("")}</ul>`;

/** Icon rows. list: [title, body, icon][] */
const people = (list, grid) =>
  `<ul class="pl-people${grid ? ` pl-people--grid${grid === 3 ? " pl-people--3" : ""}` : ""}">${list
    .map(([t, d, k]) => `<li${isLater(t) ? ' class="is-later"' : ""}>${ic(k || "check")}<div><h3>${esc(t)}</h3><p class="pl-p">${esc(d)}</p></div></li>`)
    .join("")}</ul>`;

/** Directory rows. list: { name, body, href, self?, icon? } */
const directory = (list, depth, wide) =>
  `<ul class="pl-dir${wide ? " pl-dir--wide" : ""}">${list
    .map(
      (s) => `<li><a${s.self ? ' class="is-self"' : ""} href="${esc(href(depth, s.href))}"${extAttr(s.href)}>${s.icon ? ic(s.icon) : ""}<div><strong${/^[A-Z ]+$/.test(s.name) ? ' lang="en"' : ""}>${esc(s.name)}</strong><p class="pl-p">${esc(s.body)}</p></div><em aria-hidden="true">→</em></a></li>`
    )
    .join("")}</ul>`;

/** Link tiles. items: { n, name, body, href, on?, icon? } */
const tiles = (cls, list, depth) =>
  `<ul class="pl-tiles ${cls}">${list
    .map((s) => {
      const inner = `${s.icon ? ic(s.icon) : ""}<div class="pl-tile__body">${s.n ? `<span class="pl-n">${esc(s.n)}</span>` : ""}<strong>${esc(s.name)}<em aria-hidden="true">${s.href ? "→" : ""}</em></strong>${s.body ? `<p class="pl-p">${esc(s.body)}</p>` : ""}</div>`;
      const row = s.icon ? " pl-tile--row" : "";
      return `<li>${
        s.href
          ? `<a class="pl-tile${row}" href="${esc(href(depth, s.href))}"${s.on ? ' aria-current="page"' : ""}${extAttr(s.href)}>${inner}</a>`
          : `<div class="pl-tile${row}">${inner}</div>`
      }</li>`;
    })
    .join("")}</ul>`;

/** Tab rail + cards (Life Stage "life journey" component; home-lifestage.js drives it). One rail per page. */
function railBlock(id, { kicker, title, lead, noteText, items: list, ariaLabel }) {
  const rail = list
    .map((it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${esc(it.id)}" aria-pressed="${i === 0}"><em>${esc(it.n)}</em><span>${esc(it.tab)}</span></button>`)
    .join("");
  const cardsHtml = list
    .map(
      (it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${esc(it.id)}" data-scene="${esc(it.id)}">
        <div class="nls-decade__mark" aria-hidden="true"><b>${esc(it.mark)}</b><em>${esc(it.n)}</em></div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${esc(it.n)}</p>
          <p class="nls-decade__age" lang="en">${esc(it.label)}</p>
          <h3>${esc(it.name)}</h3>
          <p class="nls-decade__lead">${esc(it.lead)}</p>
          ${it.chips && it.chips.length ? `<ul class="nls-chips">${it.chips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        </div>
      </article>`
    )
    .join("");
  return `<div id="${id}" class="nls-block nls-block--band pl-tint nls-journey-sec" data-hs-section>
    ${head(kicker, title, lead)}
    <div class="nls-rail nls-rail--petlog" style="--petlog-rail-n:${list.length}" role="group" aria-label="${esc(ariaLabel || kicker)}">${rail}</div>
    <div class="nls-journey">${cardsHtml}</div>
    ${callout(noteText)}
  </div>`;
}

function menuBlock(lang, depth, active) {
  const list = PETLOG_MENU.map((m) => ({ n: m.n, name: `${m.name} · ${m[bl(lang)]}`, body: bl(lang) === "ko" ? m.koLead : m.enLead, href: m.href, on: m.id === active }));
  const label = lang === "ko" ? "PETLOG 메뉴" : "PETLOG MENU";
  return `<div id="nls-petlog-menu" class="nls-block" data-hs-section>
    ${head("PETLOG", label, "")}
    <nav aria-label="${esc(label)}">${tiles("pl-tiles--5", list, depth)}</nav>
  </div>`;
}

function closeBlock(c, depth) {
  return `<div id="nls-close" class="nls-block nls-close nls-block--ink" data-hs-section>
    <p class="nls-kicker">${esc(c.kicker)}</p>
    <h2 class="nls-hero__title">${c.titleHtml}</h2>
    <p class="nls-lead">${esc(c.lead)}</p>
    <div class="nls-actions">
      <a class="nls-btn" href="${esc(rel(depth, c.main[1]))}">${esc(c.main[0])} →</a>
      <a class="nls-btn nls-btn--ghost" href="${esc(href(depth, c.sub[1]))}"${extAttr(c.sub[1])}>${esc(c.sub[0])}</a>
    </div>
  </div>`;
}

const wrap = (inner) => `<section id="lifestage-detail" class="nls nls--petlog" data-story="petlog" aria-labelledby="story-lifestage-title">${inner}</section>`;
const CONTACT_HREF = (type) => `petlog/contact/?type=${type}#inquiry`;
/** "Care — tagline. body" → [key, tagline, body] */
const splitValue = (s) => {
  const [k, rest = ""] = s.split(" — ");
  const i = rest.indexOf(". ");
  return i > 0 ? [k, rest.slice(0, i + 1), rest.slice(i + 2)] : [k, rest, ""];
};
/** "Label: text" → [label, text] (label only when it is short); otherwise ["", text]. */
const splitLabel = (s) => {
  const i = s.indexOf(": ");
  return i > 0 && i <= 45 ? [s.slice(0, i), s.slice(i + 2)] : ["", s];
};
const storeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M9 7h8v8"/></svg>';

/* ---------------------------------------------------------------- pages */
const storePills = (label) =>
  `<div class="pl-actions"><p class="pl-aside">${esc(label)}</p><a class="pl-pill" href="${esc(STORE.ios)}" target="_blank" rel="noopener noreferrer">App Store ${storeIcon}</a><a class="pl-pill" href="${esc(STORE.android)}" target="_blank" rel="noopener noreferrer">Google Play ${storeIcon}</a></div>`;

/** FAQ list (native details/summary). list: [question, answer][] */
const faqList = (list) =>
  `<div class="pl-faq">${list.map(([q, a]) => `<details><summary>${esc(q)}</summary><p class="pl-p">${esc(a)}</p></details>`).join("")}</div>`;

/** Two status panels side by side (current vs later). */
const panel = (kind, icon, title, body, chips, line) =>
  `<div class="pl-panel${kind ? ` pl-panel--${kind}` : ""}"><div class="pl-panel__body"><div class="pl-panel__head">${ic(icon)}<h3>${esc(title)}</h3></div><p class="pl-p">${esc(body)}</p></div>${chipList(chips, line)}</div>`;

function overviewPage(lang) {
  const c = OVERVIEW[bl(lang)];
  const L = bl(lang);
  const D = 1;
  const journey = c.journey.items.map((it) => ({ id: it.id, n: it.n, tab: it.tab, mark: it.tab, label: it.label, name: it.name, lead: it.lead, chips: it.topics }));
  const values = `<h3 class="pl-subhead">${esc(c.mission.valuesTitle)}</h3><dl class="pl-vlist">${c.mission.body
    .map((s) => {
      const [k, tag, body] = splitValue(s);
      return `<div><dt lang="en">${esc(k)}</dt><dd><strong>${esc(tag)}</strong>${body ? `<p class="pl-p">${esc(body)}</p>` : ""}</dd></div>`;
    })
    .join("")}</dl>`;
  const problem = `<div class="pl-pairs">${c.problem.items
    .map(
      (x) => `<article class="pl-pair">
        <div class="pl-pair__q"><p class="pl-label" lang="en">${esc(x.label)}</p><h3>${esc(x.name)}</h3><p class="pl-p">${esc(x.lead)}</p></div>
        <div class="pl-pair__a"><b>${svg("check")}${esc(c.problem.pointLabel)}</b><p class="pl-p">${esc(x.solve)}</p></div>
      </article>`
    )
    .join("")}</div>`;
  const scenes = `<div class="pl-grid pl-grid--2">${c.scenes.items
    .map(
      (x) => `<article class="pl-card">
        <div class="pl-card__top">${ic(x.icon)}</div>
        <h3>${esc(x.name)}</h3><p class="pl-p">${esc(x.lead)}</p>
        <dl class="pl-nn"><div><dt><i aria-hidden="true"></i>${esc(c.scenes.nowLabel)}</dt><dd>${esc(x.now)}</dd></div><div class="is-next"><dt><i aria-hidden="true"></i>${esc(c.scenes.nextLabel)}</dt><dd>${esc(x.next)}</dd></div></dl>
      </article>`
    )
    .join("")}</div>`;
  // bento: 01 and 06–08 take two columns (4-column grid: 2+1+1 / 1+1+2 / 2+2); 08 is in development (dashed)
  const WIDE = new Set([0, 5, 6, 7]);
  const last = c.core.items.length - 1;
  const core = `<ul class="pl-core">${c.core.items
    .map(
      (x, i) => `<li${WIDE.has(i) ? ' class="is-wide"' : ""}><article class="pl-card${i === last ? " pl-card--later" : ""}">
        <div class="pl-card__top">${ic(iconFor(x.label))}<span class="pl-n">${esc(x.n)}</span></div>
        <p class="pl-label" lang="en">${esc(x.label)}</p><h3>${esc(x.name)}</h3><p class="pl-p">${esc(x.lead)}</p>${chipList(x.chips, i === last)}
      </article></li>`
    )
    .join("")}</ul>`;
  const diff = `<div class="pl-compare">${c.diff.items
    .map(
      (x) => `<article class="pl-cmp">
        <div class="pl-cmp__what">${ic(x.icon)}<div><h3>${esc(x.name)}</h3><p class="pl-p">${esc(x.lead)}</p></div></div>
        <div class="pl-cmp__how"><b>${esc(c.diff.pointLabel)}</b><p class="pl-p">${esc(x.point)}</p></div>
      </article>`
    )
    .join("")}</div>`;
  const beyond = `<ol class="pl-ladder" tabindex="0" aria-label="${esc(c.beyond.kicker)}">${c.beyond.items
    .map(
      (x, i) => `<li>${ic(BEYOND_ICONS[i])}<div class="pl-row__tag"><span class="pl-n">${esc(x.n)}</span><p class="pl-label" lang="en">${esc(x.label)}</p></div><h3>${esc(x.name)}</h3><p class="pl-p pl-sm">${esc(x.lead)}</p>${chipList(x.chips)}</li>`
    )
    .join("")}</ol><div class="pl-actions">${more([c.beyond.cta, "petlog/platform/"], D)}</div>`;
  const trust = people(c.trust.items.map((x, i) => [x.name, x.lead, TRUST_ICONS[i]]), 3);
  const fam = c.newon.items.map((x) => ({ name: x.name, body: x.body, href: x.href, self: x.name === "PETLOG" }));
  return wrap(`${hero({ wordmark: "PETLOG", titleHtml: c.heroTitle, lead: c.heroLead, main: [`${c.ctaMain} →`, "#nls-mission"], sub: [c.ctaSub, rel(D, "petlog/platform/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "overview" })}
  <div class="nls__wrap">
    <div id="nls-mission" class="nls-block" data-hs-section>
      ${head(c.mission.kicker, c.mission.title, c.mission.lead)}
      ${values}
    </div>
    ${section("nls-problem", { kicker: c.problem.kicker, title: c.problem.title, lead: c.problem.lead, tint: true, body: problem })}
    ${section("nls-about", { kicker: c.about.kicker, title: c.about.title, lead: c.about.lead, body: stepList(c.about.steps, true) })}
    ${railBlock("nls-journey", { kicker: c.journey.kicker, title: c.journey.title, lead: c.journey.lead, items: journey })}
    ${splitSection("nls-users", { kicker: c.users.kicker, title: c.users.title, lead: c.users.lead, body: people(c.users.items) })}
    ${section("nls-scenes", { kicker: c.scenes.kicker, title: c.scenes.title, lead: c.scenes.lead, tint: true, body: scenes })}
    ${section("nls-core", { kicker: c.core.kicker, title: c.core.title, lead: c.core.lead, body: `${core}${storePills(c.core.appLabel)}` })}
    ${section("nls-diff", { kicker: c.diff.kicker, title: c.diff.title, lead: c.diff.lead, tint: true, body: diff })}
    ${section("nls-beyond", { kicker: c.beyond.kicker, title: c.beyond.title, lead: c.beyond.lead, noteText: NOTICE[L], body: beyond })}
    ${section("nls-trust", { kicker: c.trust.kicker, title: c.trust.title, tint: true, body: trust })}
    ${splitSection("nls-newon", { kicker: c.newon.kicker, title: c.newon.title, lead: c.newon.lead, body: directory(fam, D, true) })}
    ${menuBlock(lang, D, "overview")}
    ${closeBlock({ ...c.close, main: [c.close.ctaMain, "petlog/platform/"], sub: [c.close.ctaSub, "petlog/contact/"] }, D)}
  </div>`);
}

function platformPage(lang) {
  const m = PLATFORM.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const card = (idx) => {
    const it = PLATFORM.items[idx];
    const link = it.cta === "app" ? [m.labels.app, STORE.ios] : [m.labels.cta, CONTACT_HREF(it.cta)];
    return {
      n: pad2(idx + 1),
      label: it.label,
      icon: AREA_ICONS[idx],
      name: it.name[L],
      lead: it.lead[L],
      points: [[m.labels.users, it.users[L]], [m.labels.connect, it.connect[L]]],
      chips: it.f[L],
      link,
      anchor: it.label.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, ""),
    };
  };
  // a different layout per group so the page does not repeat one card grid
  const LAYOUT = {
    records: ["row", "", false],
    services: ["grid", "pl-grid--bento", true],
    community: ["cols", "pl-cols--3", false],
    tech: ["row", "", true],
    welfare: ["grid", "pl-grid--2 pl-grid--odd", false],
  };
  const groups = m.groups
    .map((g) => {
      const [kind, cls, tint] = LAYOUT[g.id] || ["grid", "pl-grid--3", false];
      return section(`nls-${g.id}`, { kicker: g.kicker, title: g.title, lead: g.lead, tint, body: items(kind, g.items.map(card), D, cls) });
    })
    .join("\n");
  const KIND = { now: "now", dev: "", plan: "next", review: "next" };
  const legend = `<div class="pl-board pl-board--table">${m.legend
    .map((p) => panel(KIND[p.kind], p.icon, p.title, p.body, p.areas.map((no) => `${no} ${PLATFORM.items[Number(no) - 1].name[L]}`), p.kind === "plan" || p.kind === "review"))
    .join("")}</div>`;
  const scen = m.scenarios;
  const scenarios = scen.items.map((it) => ({ id: it.id, n: it.n, tab: it.tab, mark: it.tab, label: it.label, name: it.name, lead: it.lead, chips: it.chips }));
  const roles = `<dl class="pl-roles">${m.roles.items
    .map(([t, d, k]) => `<div${isLater(t) ? ' class="is-later"' : ""}><dt>${ic(k)}<span>${esc(t)}</span></dt><dd><p class="pl-p">${esc(d)}</p></dd></div>`)
    .join("")}</dl>`;
  const close = { ...m.close, main: [m.close.ctaMain, "petlog/business/"], sub: [m.close.ctaSub, STORE.ios] };
  return wrap(`${hero({ wordmark: "Platform", titleHtml: m.heroTitle, lead: m.heroLead, main: [lang === "ko" ? "18개 서비스 보기 ↓" : "See 18 services ↓", "#nls-records"], sub: [lang === "ko" ? "PETLOG 소개" : "About PETLOG", rel(D, "petlog/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "platform" })}
  <div class="nls__wrap">
    ${section("nls-legend", { kicker: m.legendKicker, title: m.legendTitle, lead: m.legendLead, noteText: NOTICE[L], body: legend })}
    ${groups}
    ${railBlock("nls-scenarios", { kicker: scen.kicker, title: scen.title, lead: scen.lead, items: scenarios })}
    ${splitSection("nls-roles", { kicker: m.roles.kicker, title: m.roles.title, lead: m.roles.lead, body: roles })}
    ${section("nls-flow", { kicker: m.flow.kicker, title: m.flow.title, lead: m.flow.lead, tint: true, body: stepList(m.flow.steps) })}
    ${splitSection("nls-privacy", { kicker: m.privacy.kicker, title: m.privacy.title, body: checks(m.privacy.items) })}
    ${section("nls-app", { kicker: m.app.kicker, title: m.app.title, lead: m.app.lead, tint: true, body: `<div class="pl-start">${stepList(m.app.steps)}${storePills(m.app.storeLabel)}</div>` })}
    ${splitSection("nls-faq", { kicker: m.faq.kicker, title: m.faq.title, body: faqList(m.faq.items) })}
    ${menuBlock(lang, D, "platform")}
    ${closeBlock(close, D)}
  </div>`);
}

function businessPage(lang) {
  const m = BUSINESS.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const line = (no) => BUSINESS.lines.find((x) => x.no === no);
  const rail = BUSINESS.groups.map((g, i) => ({ id: g.id, n: pad2(i + 1), tab: g.tab, mark: pad2(g.lines.length), label: g.label, name: g[L], lead: L === "ko" ? g.koLead : g.enLead, chips: g.lines.map((no) => `${no} ${line(no).name[L]}`) }));
  const lineCard = (no) => {
    const x = line(no);
    return {
      n: x.no,
      label: x.label,
      icon: LINE_ICONS[x.no] || "paw",
      name: x.name[L],
      lead: x.lead[L],
      points: [
        [m.labels.payer, x.payer[L]],
        [m.labels.how, x.how[L]],
        [m.labels.cond, x.cond[L]],
      ],
      link: [m.labels.cta, CONTACT_HREF(x.type)],
      anchor: `line-${x.no}`,
    };
  };
  const sp = m.subPanel;
  const subPanel = `<div class="pl-sub">${head(sp.kicker, sp.title, sp.lead)}<div class="pl-board pl-board--pair">
      ${panel("now", "phone", sp.now[0], sp.now[1], sp.now[2])}
      ${panel("next", "sprout", sp.next[0], sp.next[1], sp.next[2], true)}
    </div></div>`;
  const saasPanel = `<div class="pl-sub">${head(m.saasKicker, m.saasTitle, m.saasLead)}<ul class="pl-products">${m.saas
    .map(([t, d]) => `<li><b lang="en">${esc(t)}</b><p class="pl-p pl-sm">${esc(d)}</p></li>`)
    .join("")}</ul></div>`;
  const LAYOUT = {
    subscription: ["row", "", false],
    booking: ["grid", "pl-grid--2", true],
    commerce: ["cols", "", false],
    lifestyle: ["grid", "pl-grid--3 pl-grid--odd", true],
    enterprise: ["row", "", false],
  };
  const groupSections = BUSINESS.groups
    .map((g, gi) => {
      const [kind, cls, tint] = LAYOUT[g.id] || ["grid", "pl-grid--2", false];
      let body = items(kind, g.lines.map(lineCard), D, cls);
      if (g.id === "subscription") body += subPanel;
      if (g.id === "enterprise") body += saasPanel;
      return section(`nls-group-${g.id}`, { kicker: `${pad2(gi + 1)} · ${g.label.toUpperCase()}`, title: g[L], lead: L === "ko" ? g.koLead : g.enLead, tint, body });
    })
    .join("\n");
  const models = `<dl class="pl-dl pl-dl--code">${m.structure
    .map(([k, v]) => {
      const i = v.indexOf(" — ");
      return `<div><dt lang="en">${esc(k)}</dt><dd>${i > 0 ? `<b>${esc(v.slice(0, i))}</b><p class="pl-p">${esc(v.slice(i + 3))}</p>` : `<p class="pl-p">${esc(v)}</p>`}</dd></div>`;
    })
    .join("")}</dl>`;
  const hd = m.revenueHead;
  const STAGE = { now: " pl-stage--now", plan: "", review: " pl-stage--review" };
  const revenue = `<ul class="pl-table"><li class="pl-table__hd" aria-hidden="true"><span>${esc(hd[0])}</span><span>${esc(hd[1])}</span><span style="justify-self:end">${esc(hd[2])}</span></li>${BUSINESS.lines
    .map((x) => `<li><span class="pl-table__name"><span class="pl-n">${esc(x.no)}</span>${esc(x.name[L])}</span><p class="pl-p">${esc(x.sum[L])}</p><span class="pl-stage${STAGE[x.status] || ""}">${esc(m.statusLabel[x.status])}</span></li>`)
    .join("")}</ul>`;
  const market = `<ul class="pl-notes">${m.market.map(([t, d, k]) => `<li>${ic(k)}<h3>${esc(t)}</h3><p class="pl-p pl-sm">${esc(d)}</p></li>`).join("")}</ul>`;
  const legal = `<dl class="pl-dl">${m.trust
    .map((s) => {
      const [k, v] = splitLabel(s);
      return k ? `<div><dt>${esc(k)}</dt><dd><p class="pl-p">${esc(v)}</p></dd></div>` : `<div class="is-span"><dd><p class="pl-p">${esc(v)}</p></dd></div>`;
    })
    .join("")}</dl>`;
  return wrap(`${hero({ wordmark: "Business", titleHtml: m.heroTitle, lead: m.heroLead, main: [lang === "ko" ? "20개 사업 분야 보기 ↓" : "See 20 areas ↓", "#nls-groups"], sub: [m.close.ctaMain, rel(D, "petlog/partnerships/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "business" })}
  <div class="nls__wrap">
    ${splitSection("nls-structure", { kicker: m.structureKicker, title: m.structureTitle, lead: m.structureLead, noteText: NOTICE[L], body: models })}
    ${railBlock("nls-groups", { kicker: m.groupsKicker, title: m.groupsTitle, lead: m.groupsLead, items: rail })}
    ${groupSections}
    ${section("nls-revenue", { kicker: m.revenueKicker, title: m.revenueTitle, lead: m.revenueLead, tint: true, body: revenue })}
    ${splitSection("nls-public", { kicker: m.publicKicker, title: m.publicTitle, lead: m.publicLead, body: people(m.publicItems) })}
    ${section("nls-market", { kicker: m.marketKicker, title: m.marketTitle, lead: m.marketLead, tint: true, body: market })}
    ${section("nls-diff", { kicker: m.diffKicker, title: m.diffTitle, lead: m.diffLead, body: items("cols", m.diff.map(([t, d, k]) => ({ icon: k, name: t, lead: d })), D, "pl-cols--4") })}
    ${section("nls-priority", { kicker: m.gtmKicker, title: m.gtmTitle, lead: m.gtmLead, tint: true, body: stepList(m.gtm.map(([t, d], i) => [pad2(i + 1), t, d]), true) })}
    ${splitSection("nls-roadmap", { kicker: m.roadmapKicker, title: m.roadmapTitle, lead: m.roadmapNote, body: phases(m.roadmap) })}
    ${splitSection("nls-trust", { kicker: m.trustKicker, title: m.trustTitle, tint: true, body: legal })}
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
    return { n: p.no, icon: PARTNER_ICONS[p.no] || iconFor(p.name.en), name: p.name[L], lead: p.value[L], points: [[m.labels.scope, p.scope[L]], [m.labels.how, p.how[L]], [m.labels.terms, p.terms[L]]], link: [m.labels.cta, CONTACT_HREF(p.type)], anchor: `partner-${p.no}` };
  };
  const LAYOUT = { care: ["grid", "pl-grid--3", true], brand: ["row", "", false], public: ["grid", "pl-grid--2", true] };
  const groups = m.groups
    .map((g) => {
      const [kind, cls, tint] = LAYOUT[g.id] || ["grid", "pl-grid--3", false];
      return section(`nls-p-${g.id}`, { kicker: g.kicker, title: g.title, lead: g.lead, tint, body: items(kind, g.items.map(card), D, cls) });
    })
    .join("\n");
  const offer = m.offer.map((o) => ({ name: o.name, lead: o.lead, chips: o.chips, icon: iconFor(PARTNERS.meta.en.offer.find((e) => e.n === o.n).name) }));
  const [lw, lr, lp] = m.scenarioLabels;
  const scenarios = m.scenarios.map((x) => ({ icon: x.icon, name: x.name, lead: x.lead, points: [[lw, x.who], [lr, x.role], [lp, x.pre]] }));
  const poc = m.poc.map(([t, d], i) => [`STEP ${pad2(i + 1)}`, t, d]);
  return wrap(`${hero({ wordmark: "Partnerships", titleHtml: m.heroTitle, lead: m.heroLead, main: [lang === "ko" ? "14개 협력 분야 ↓" : "14 partner types ↓", "#nls-p-care"], sub: [m.labels.cta, rel(D, "petlog/contact/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "partnerships" })}
  <div class="nls__wrap">
    ${section("nls-offer", { kicker: m.offerKicker, title: m.offerTitle, lead: m.offerLead, body: items("cols", offer, D, "pl-cols--4") })}
    ${groups}
    ${section("nls-scenarios", { kicker: m.scenariosKicker, title: m.scenariosTitle, lead: m.scenariosLead, body: items("grid", scenarios, D, "pl-grid--2") })}
    ${splitSection("nls-poc", { kicker: m.pocKicker, title: m.pocTitle, lead: m.pocLead, tint: true, body: phases(poc, true) })}
    ${section("nls-data", { kicker: m.dataKicker, title: m.dataTitle, lead: m.dataLead, body: people(m.data, true) })}
    ${section("nls-joint", { kicker: m.jointKicker, title: m.jointTitle, tint: true, body: items("grid", m.joint.map((x) => ({ icon: x.icon, name: x.name, lead: x.lead })), D, "pl-grid--3 pl-grid--odd") })}
    ${splitSection("nls-principles", { kicker: m.principlesKicker, title: m.principlesTitle, body: checks(m.principles) })}
    ${section("nls-process", { kicker: m.processKicker, title: m.processTitle, noteText: m.processNote, tint: true, body: stepList(m.steps.map(([t, d], i) => [pad2(i + 1), t, d])) })}
    ${menuBlock(lang, D, "partnerships")}
    ${closeBlock({ ...m.close, main: [m.close.ctaMain, "petlog/contact/"], sub: [m.close.ctaSub, "partnerships/"] }, D)}
  </div>`);
}

function contactPage(lang) {
  const c = CONTACT[bl(lang)];
  const D = 2;
  const purposes = c.purposes.map((p) => ({ name: p.name, body: p.body, href: p.href, icon: p.icon }));
  const list = c.types.map(([key, name, body], i) => ({ n: pad2(i + 1), name, body, href: `petlog/contact/?type=${key}#inquiry`, icon: TYPE_ICONS[key] || "mail" }));
  const direct = c.direct.map((d) => ({ name: d.name, body: d.body, href: d.href === "ios" ? STORE.ios : d.href === "android" ? STORE.android : d.href }));
  const form = inquiryFormHtml(lang, D, {
    category: "PETLOG",
    interest: "PETLOG",
    copy: { label: "PETLOG", title: c.formTitle, subject: c.subject, types: c.types.map(([k, n]) => [k, n]), type: c.typeLabel, message: c.messageLabel, messagePh: c.messagePh, submit: lang === "ko" ? "문의 보내기" : "Send inquiry" },
  });
  return wrap(`${hero({ wordmark: "Contact", titleHtml: c.heroTitle, lead: c.heroLead, main: [lang === "ko" ? "문의하기 ↓" : "Send an inquiry ↓", "#inquiry"], sub: [lang === "ko" ? "PETLOG 소개" : "About PETLOG", rel(D, "petlog/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "contact" })}
  <div class="nls__wrap">
    ${splitSection("nls-purpose", { kicker: c.purposeKicker, title: c.purposeTitle, lead: c.purposeLead, body: directory(purposes, D) })}
    ${section("nls-types", { kicker: c.kicker, title: c.listTitle, lead: c.listLead, tint: true, body: tiles("pl-tiles--3", list, D) })}
    ${section("nls-direct", { kicker: c.directKicker, title: c.directTitle, body: tiles("pl-tiles--4", direct, D) })}
    ${section("nls-guide", { kicker: c.guideKicker, title: c.guideTitle, tint: true, body: checks(c.guide, true) })}
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
        EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=20261019rest1" />
    <link rel="stylesheet" href="/flagship-subnav.css?v=20261019fsn3" />
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
