/**
 * LIVON corporate site — page bodies for /{lang}/livon/ (Overview) and its four sub pages
 * (platform/, business/, partnerships/, contact/). Information only: no forms, no storage,
 * no personalisation. Styles: /livon-site.css (scoped to .lvs) on top of the existing
 * Life Stage styles (/home-lifestage.css, /home-lifestage-layout.css, scoped to .nls).
 */
import { escapeHtml } from "./hub-utils.mjs";
import { renderFlagshipSubnav, FLAGSHIP_SUBNAV_CSS } from "./flagship-subnav.mjs";
import { getLifeStageCopy } from "./home-lifestage-copy.mjs";
import {
  LIVON_SITE_PAGES,
  STATUS,
  GROUPS,
  CATEGORIES,
  categoryStatus,
  NEWON_APPS,
  LIFE_EVENTS,
  CORE_FEATURES,
  BUSINESS,
  REVENUE,
  ROADMAP,
  JOURNEY,
  PLATFORM_EXAMPLES,
  PARTNER_GROUPS,
  PARTNER_STEPS,
  CONTACT_GROUPS,
  PARTNERS,
  PARTNER_COMMON,
  CONTACT_TYPES,
  SUBNAV_I18N,
  REVENUE_GROUPS,
  siteCopy,
  isKo,
} from "./livon-site-data.mjs";
import { AREAS, AREA_GROUPS, REVIEW_ITEMS, FLOW, SCENARIOS, CONTACT_PURPOSE_HREF, CONTACT_PURPOSE_ICON, c30, v3 } from "./livon-site-content30.mjs";

const FILM = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_102608_5fa1187d-9ac6-44fb-82ab-54376200abc0.mp4";

const e = (s) => escapeHtml(s == null ? "" : String(s));
const nl = (s) => e(s).replace(/\n/g, "<br>");
const pick = (lang, ko, en) => (isKo(lang) ? ko : en);

export function pageHref(lang, id) {
  const p = LIVON_SITE_PAGES.find((x) => x.id === id);
  return `/${lang}/livon/${p ? p.path : ""}`;
}

function pageLabel(lang, p) {
  if (isKo(lang)) return p.ko;
  const t = SUBNAV_I18N[lang];
  return (t && t[p.id]) || p.en;
}

function subnav(lang, active) {
  const c = siteCopy(lang);
  const items = LIVON_SITE_PAGES.map((p) => {
    const cur = p.id === active;
    return `<li><a href="${e(pageHref(lang, p.id))}"${cur ? ' aria-current="page" class="is-on"' : ""}><span class="lvs-subnav__n" aria-hidden="true">${e(p.n)}</span><span class="lvs-subnav__en">${e(p.en)}</span>${lang === "en" ? "" : `<span class="lvs-subnav__loc">${e(pageLabel(lang, p))}</span>`}</a></li>`;
  }).join("");
  return `<nav class="lvs-subnav" aria-label="${e(c.subnavLabel)}"><ol>${items}</ol></nav>`;
}

function head(kicker, title, lead, level = 2, id = "") {
  const h = level === 1 ? "h1" : "h2";
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${e(kicker)}</p>` : ""}
    <${h} class="nls-title"${id ? ` id="${e(id)}"` : ""}>${nl(title)}</${h}>
    ${lead ? `<p class="nls-lead">${e(lead)}</p>` : ""}
  </header>`;
}

function badge(lang, key) {
  const s = STATUS[key] || STATUS.planned;
  return `<span class="lvs-status lvs-status--${e(key)}">${e(pick(lang, s.ko, s.en))}</span>`;
}

function chips(items) {
  return `<ul class="nls-chips">${(items || []).map((t) => `<li>${e(t)}</li>`).join("")}</ul>`;
}

function dl(rows) {
  return `<dl class="lvs-dl">${rows
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${v}</dd></div>`)
    .join("")}</dl>`;
}

/* Sub-page first screen: the same LIVON film hero as the Overview (same video, same nls-film component),
   carrying the page's own headline and lead. `kicker` is kept for the page id only. */
function textHero(lang, kicker, title, lead, titleId) {
  const c = siteCopy(lang);
  const isContact = kicker === "Contact";
  const contactHref = isContact ? "#lvs-contact" : pageHref(lang, "contact");
  return `<div class="nls-film lvs-film" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${FILM}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark">${e(c.brand)}</p>
        <h1 id="${e(titleId)}" class="nls-film__slogan">${nl(title)}</h1>
        <p class="nls-film__lead">${e(lead)}</p>
        <div class="nls-film__actions">
          <a class="nls-btn" href="${e(pageHref(lang, "platform"))}#lvs-app">${e(c.tryWeb)} →</a>
          <a class="nls-btn nls-btn--ghost" href="${e(contactHref)}"${isContact ? " data-nls-scroll" : ""}>${e(c.toContact)}${isContact ? " ↓" : ""}</a>
        </div>
      </div>
    </div>
  </div>`;
}

function shell(lang, active, titleId, hero, body) {
  return `<section id="lifestage-detail" class="nls lvs" data-story="lifestage" data-lvs-page="${e(active)}" aria-labelledby="${e(titleId)}">
    ${hero}
  ${renderFlagshipSubnav({ biz: "livon", lang, active })}
  <div class="nls__wrap">
    ${active === "overview" ? "" : `<p class="nls-note lvs-app-note">${e(siteCopy(lang).appStatus)}</p>
    `}${body}
  </div>
</section>`;
}

const byN = Object.fromEntries(CATEGORIES.map((x) => [x.n, x]));
const groupOf = (id) => GROUPS.find((g) => g.id === id);
const pad = (i) => String(i).padStart(2, "0");
const catHref = (lang, n) => `${pageHref(lang, "platform")}#lvs-cat-${n}`;
const note = (t) => (t ? `<p class="nls-note">${e(t)}</p>` : "");
const stLabel = (lang, key) => {
  const s = STATUS[key] || STATUS.planned;
  return pick(lang, s.ko, s.en);
};
/* status pill — filled butter yellow for what runs today, dashed outline for plans and concepts */
const status = (lang, key) => `<p class="lvs-pill lvs-pill--${e(key)}">${e(stLabel(lang, key))}</p>`;
const statusSpan = (lang, key) => `<span class="lvs-pill lvs-pill--${e(key)}">${e(stLabel(lang, key))}</span>`;

/* ── simple line icons (inline SVG, 24×24, stroke = currentColor; decorative only) ── */
const ICON_PATHS = {
  feed: '<rect x="4" y="4" width="16" height="16"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  spark: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  doc: '<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  building: '<path d="M4 21V5l8-2v18M12 21V9l8 2v10M3 21h18M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>',
  users: '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3.5 19c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5M14.5 14.3c2.6-.4 4.8.9 5.8 4.2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13"/><path d="M4 6.5l8 6 8-6"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.4"/>',
  book: '<path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/>',
  home: '<path d="M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  list: '<path d="M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01"/>',
  shield: '<path d="M12 3.5l7 2.5v5.5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  grid: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
  handshake: '<path d="M3 11l4-4 4 2 3-2 4 1 3 3"/><path d="M7 7v6l4 4c.8.8 2 .8 2.8 0l4.2-4.2V8"/><path d="M11 13l2 2M13 11l2 2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  coin: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
};
const icon = (name, cls = "lvs-ico") =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ICON_PATHS.spark}</svg>`;
const CORE_ICON = ["calendar", "feed", "search", "person", "chat", "list", "spark", "doc"];
const CA_ICON = ["users", "spark", "shield"];
const CONTACT_ICON = { svc: "chat", info: "book", biz: "handshake" };
const arrow = icon("arrow", "lvs-arr");

/* ── building blocks (one small vocabulary, a different layout per section) ── */
/* section frame: white (lvs-sec), white with a hairline on top (rule), a full-bleed pale-yellow band (band, used
   sparingly) or the page's one full-bleed butter-yellow band (accent) */
const block = (id, inner, { band = false, accent = false, rule = false, cls = "", attr = "" } = {}) =>
  `<div${id ? ` id="${e(id)}"` : ""} class="nls-block ${accent ? "nls-block--band lvs-accent" : band ? "nls-block--band lvs-wash" : "lvs-sec"}${rule ? " lvs-rule" : ""}${cls ? ` ${cls}` : ""}"${attr}>
    ${inner}
  </div>`;
/* editorial head: title on the left, lead on the right */
const headSplit = (kicker, title, lead) => `<div class="lvs-hsplit">
      <header class="nls-head">${kicker ? `<p class="nls-kicker">${e(kicker)}</p>` : ""}<h2 class="nls-title">${nl(title)}</h2></header>
      ${lead ? `<p class="lvs-hsplit__lead">${e(lead)}</p>` : ""}
    </div>`;
/* term → description rows */
const defs = (rows, mod = "") =>
  `<dl class="lvs-defs${mod ? ` lvs-defs--${mod}` : ""}">${rows.map(([k, t]) => `<div><dt>${e(k)}</dt><dd>${e(t)}</dd></div>`).join("")}</dl>`;
/* feature columns: optional icon, a heading and a paragraph — no boxes */
const feats = (rows, cols, opts = {}) =>
  `<ul class="lvs-feats lvs-feats--${cols}${opts.mod ? ` lvs-feats--${opts.mod}` : ""}">${rows
    .map(([t, b], i) => `<li>${opts.icons ? `<span class="lvs-feats__i">${icon(opts.icons[i])}</span>` : ""}${t ? `<h3>${e(t)}</h3>` : ""}<p>${e(b)}</p></li>`)
    .join("")}</ul>`;
/* real sequence: numbered steps */
const steps = (rows, mod = "") =>
  `<ol class="lvs-steps${mod ? ` lvs-steps--${mod}` : ""}">${rows
    .map(([t, b, k], i) => `<li class="lvs-steps__item${i === 0 ? " is-on" : ""}"><span class="lvs-steps__n">${pad(i + 1)}</span>${k ? `<p class="lvs-steps__k">${e(k)}</p>` : ""}<h3>${e(t)}</h3><p>${e(b)}</p></li>`)
    .join("")}</ol>`;
/* check list — principles that hold today */
const checks = (rows) =>
  `<ul class="lvs-checks">${rows.map((t) => `<li>${icon("check", "lvs-checks__i")}<p>${t}</p></li>`).join("")}</ul>`;
/* comparison rows: an existing way on the left, what LIVON does on the right */
const vsRows = (rows) =>
  `<div class="lvs-vs">${rows.map(([t, b]) => `<div class="lvs-vs__row"><h3>${e(t)}</h3><p>${e(b)}</p></div>`).join("")}</div>`;

/* ── 2026-10 content upgrade helpers (21 core areas) ── */
const byArea = Object.fromEntries(AREAS.map((a) => [a.n, a]));
const areaT = (lang, a) => (isKo(lang) ? a.ko : a.enx);
const zoneHref = (lang, n) => `${pageHref(lang, "platform")}#lvs-zone-${n}`;
const catLinks = (lang, cats) =>
  cats.map((n) => `<a href="${e(catHref(lang, n))}">${e(n)} ${e(pick(lang, byN[n].ko, byN[n].en))}</a>`).join(", ");
const zoneLinks = (lang, ids) =>
  ids.map((n) => `<a href="${e(zoneHref(lang, n))}">${e(n)} ${e(areaT(lang, byArea[n]).name)}</a>`).join(", ");
/* one list row inside a status group; the number is shown only when it is a real id */
const dirRow = (n, title, line, href) =>
  `<li>${n ? `<span>${e(n)}</span>` : ""}<div><strong>${href ? `<a href="${e(href)}">${e(title)}</a>` : e(title)}</strong>${line ? `<p>${e(line)}</p>` : ""}</div></li>`;
function statusGroup(lang, key, title, rows, gid) {
  return `<section class="lvs-cgroup lvs-sgroup" data-group="${e(key)}" aria-labelledby="${e(gid)}">
      <header class="lvs-sgroup__head"><i class="lvs-mark lvs-mark--${e(key)}" aria-hidden="true"></i><h3 id="${e(gid)}" class="lvs-sgroup__title">${e(title)}</h3><span class="lvs-count">${rows.length}</span></header>
      <ol class="lvs-dir">${rows.join("")}</ol>
    </section>`;
}
/* tabs (progressive enhancement): without JS the tab row is a jump menu and every panel is shown */
const tabs = (label, items) =>
  `<nav class="lvs-tabs__list" aria-label="${e(label)}" data-lvs-tablist><ul>${items
    .map(([href, title, meta, lead]) => `<li><a class="lvs-tab" href="#${e(href)}" data-lvs-tab="${e(href)}">${lead ? `<b>${e(lead)}</b>` : ""}<strong>${e(title)}</strong>${meta ? `<span>${e(meta)}</span>` : ""}</a></li>`)
    .join("")}</ul></nav>`;

/* ════════════════════════ 01 Overview ════════════════════════ */
function overviewHero(lang) {
  const c = siteCopy(lang).overview;
  return `<div class="nls-film" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${FILM}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark">LIVON</p>
        <h1 id="lvs-overview-title" class="nls-film__slogan">${c.heroTitleHtml}</h1>
        <p class="nls-film__lead">${e(c.heroLead)}</p>
        <div class="nls-film__actions">
          <a class="nls-btn" href="${e(pageHref(lang, "platform"))}">${e(c.heroCta)} →</a>
          <a class="nls-btn nls-btn--ghost" href="${e(pageHref(lang, "contact"))}">${e(siteCopy(lang).toContact)}</a>
        </div>
      </div>
    </div>
  </div>`;
}

const leadNote = (t) => `<p class="lvs-notice lvs-notice--lead">${icon("info", "lvs-notice__i")}<span>${e(t)}</span></p>`;
const SEC = { attr: " data-lvs-section" };
const RULE = { rule: true, attr: " data-lvs-section" };
const BAND = { band: true, attr: " data-lvs-section" };
const ACCENT = { accent: true, attr: " data-lvs-section" };
/* accordion list (FAQ) — two columns on wide screens */
const faqList = (items, mod = "") => `<div class="lvs-faq${mod ? ` lvs-faq--${mod}` : ""}">${items.map(([q, a]) => `<details class="lvs-acc"><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join("")}</div>`;
/* compact key → value grid (no boxes; hairlines only) */
const matrix = (rows, cols = 3, mod = "") => `<dl class="lvs-matrix lvs-matrix--${cols}${mod ? ` lvs-matrix--${mod}` : ""}">${rows.map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join("")}</dl>`;

/* what LIVON is — editorial head, then problem → common way → LIVON as a three-column comparison */
function defineSec(lang) {
  const d = c30(lang).define;
  const rows = d.rows.map(([p, now, l]) => `<tr><th scope="row">${e(p)}</th><td data-label="${e(d.cols[1])}">${e(now)}</td><td class="lvs-table__hl" data-label="${e(d.cols[2])}">${e(l)}</td></tr>`).join("");
  return block("lvs-define", `${headSplit(d.kicker, d.title, d.lead)}
    <div class="lvs-table-wrap"><table class="lvs-table lvs-table--vs">
      <thead><tr>${d.cols.map((t, i) => `<th scope="col"${i === 2 ? ' class="lvs-table__hl"' : ""}>${e(t)}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="lvs-examples">
      <p class="lvs-k">${e(v3(lang).examples.title)}</p>
      <ul>${v3(lang).examples.items.map(([t, b]) => `<li><strong>${e(t)}</strong><p>${e(b)}</p></li>`).join("")}</ul>
    </div>`, SEC);
}

/* vision — statement on the left, five principles as term rows on the right */
function vision(lang) {
  const v = siteCopy(lang).overview.vision;
  return block("lvs-vision", `<div class="nls-split lvs-split">
      ${head(v.kicker, v.title, v.lead)}
      ${defs(v.points)}
    </div>`, ACCENT);
}

/* five chapters of a life — a real sequence, shown as one stepped row */
function lifeJourney(lang) {
  const c = siteCopy(lang).overview.journey;
  const items = JOURNEY.map(
    (j, i) => `<li class="lvs-tl__item lvs-chapter">
      <p class="lvs-tl__age"><span>${pad(i + 1)}</span>${e(pick(lang, j.ageKo, j.ageEn))}</p>
      <h3>${e(pick(lang, j.ko, j.en))}</h3>
      <p>${e(pick(lang, j.bodyKo, j.bodyEn))}</p>
      <ul class="lvs-tags">${j.areas.map((a) => `<li><b>${e(a)}</b> ${e(pick(lang, groupOf(a).ko, groupOf(a).en))}</li>`).join("")}</ul>
    </li>`
  ).join("");
  return block("lvs-journey", `${head(c.kicker, c.title, c.lead)}
    <ol class="lvs-tl">${items}</ol>`, SEC);
}

/* decade rail (existing interactive Life Stage component; restyled in CSS) */
function lifeStage(lang) {
  const c = siteCopy(lang).overview.stage;
  const life = getLifeStageCopy(lang);
  const items = life.journey.items || [];
  const rail = items
    .map((it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${e(it.id)}" aria-pressed="${i === 0 ? "true" : "false"}"><em>${e(it.n)}</em><span>${e(it.age)}</span></button>`)
    .join("");
  const cards = items
    .map((it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${e(it.id)}" data-scene="${e(it.id)}">
        <div class="nls-decade__mark" aria-hidden="true"><b>${e(it.age)}</b><em>${e(it.n)}</em></div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${e(it.n)}</p>
          <p class="nls-decade__age">${e(it.age)}</p>
          <h3>${e(it.name)}</h3>
          <p class="nls-decade__lead">${e(it.lead)}</p>
          ${chips(it.topics)}
        </div>
      </article>`)
    .join("");
  return block("lvs-stage", `${headSplit(c.kicker, c.title, c.lead)}
    <div class="nls-rail" role="group" aria-label="${e(life.hero.pathLabel)}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    <p class="nls-note">${e(life.ui.journeyNote)}</p>
    ${stageRec(lang)}`, { cls: "nls-journey-sec lvs-rule", attr: " data-lvs-section" });
}

/* seven stages → where each starts (plan §3); a scroll-snap rail on phones */
function stageRec(lang) {
  const r = v3(lang).stageRec;
  return `<div class="lvs-srec">
      <header class="lvs-srec__head"><h3 class="lvs-h4">${e(r.title)}</h3><span class="lvs-pill lvs-pill--planned">${e(r.tag)}</span><p>${e(r.note)}</p></header>
      <ol class="lvs-srec__list">${r.rows.map(([t, b], i) => `<li><span>${pad(i + 1)}</span><strong>${e(t)}</strong><p>${e(b)}</p></li>`).join("")}</ol>
    </div>`;
}

/** 40-cell map: 5 rows (areas) × 8 categories. */
function lifeMap(lang, hits = [], label = "") {
  const rows = GROUPS.map((g) => {
    const cells = CATEGORIES.filter((x) => x.g === g.id)
      .map((x) => `<li><a class="lvs-map__cell${hits.includes(x.n) ? " is-hit" : ""}" data-n="${e(x.n)}" data-status="${e(categoryStatus(x))}" href="${e(catHref(lang, x.n))}"><span>${e(x.n)}</span><b>${e(pick(lang, x.ko, x.en)).replace(/·/g, "·<wbr>")}</b></a></li>`)
      .join("");
    return `<li class="lvs-map__row"><p class="lvs-map__g"><b>${e(g.id)}</b><span>${e(pick(lang, g.ko, g.en))}</span></p><ol>${cells}</ol></li>`;
  }).join("");
  return `<div class="lvs-map"${label ? ` role="group" aria-label="${e(label)}"` : ""}><ol class="lvs-map__rows">${rows}</ol></div>`;
}

function legend(lang) {
  return `<ul class="lvs-legend">${["web", "partial", "planned"]
    .map((k) => `<li class="lvs-legend--${k}"><i aria-hidden="true"></i>${e(stLabel(lang, k))}</li>`)
    .join("")}</ul>`;
}

/* life event explorer — segmented event picker, event panel and the highlighted 40-cell map */
function explorer(lang) {
  const c = siteCopy(lang).overview.events;
  const first = LIFE_EVENTS[0];
  const tabsHtml = LIFE_EVENTS.map(
    (ev, i) => `<button type="button" class="lvs-ex__tab${i === 0 ? " is-on" : ""}" data-lvs-event="${e(ev.id)}" aria-pressed="${i === 0 ? "true" : "false"}"><span>${e(pick(lang, ev.ko, ev.en))}</span></button>`
  ).join("");
  const panels = LIFE_EVENTS.map((ev, i) => {
    const rel = ev.cats.map((n) => `<li><a href="${e(catHref(lang, n))}"><span>${e(n)}</span><strong>${e(pick(lang, byN[n].ko, byN[n].en))}</strong>${icon("arrow", "lvs-rel__i")}</a></li>`).join("");
    return `<article class="lvs-event${i === 0 ? " is-on" : ""}" id="lvs-event-${e(ev.id)}" data-lvs-event-panel="${e(ev.id)}" data-cats="${e(ev.cats.join(" "))}">
      <h3>${e(pick(lang, ev.ko, ev.en))}</h3>
      <p class="lvs-event__lead">${e(pick(lang, ev.tagKo, ev.tagEn))}</p>
      <p class="lvs-k">${e(c.related)}</p>
      <ol class="lvs-rel">${rel}</ol>
      <p class="lvs-k">${e(c.check)}</p>
      <ul class="nls-chips">${pick(lang, ev.checkKo, ev.checkEn).map((t) => `<li>${e(t)}</li>`).join("")}</ul>
    </article>`;
  }).join("");
  return block("lvs-events", `${head(c.kicker, c.title, c.lead)}
    <div class="lvs-ex-meta"><p class="lvs-pill lvs-pill--concept">${e(pick(lang, "구조 예시", "Structure example"))}</p>${note(c.note)}</div>
    <div class="lvs-ex" data-lvs-explorer>
      <div class="lvs-ex__tabs" role="group" aria-label="${e(c.kicker)}" hidden>${tabsHtml}</div>
      <div class="lvs-ex__body">
        <div class="lvs-ex__panels" aria-live="polite">${panels}</div>
        <div class="lvs-ex__map">
          <p class="lvs-k">${e(c.mapLabel)}</p>
          ${lifeMap(lang, first.cats, c.mapLabel)}
          ${legend(lang)}
        </div>
      </div>
    </div>`, BAND);
}

/* area head: the group letter (A–E, the id used across the site), name, range and lead */
function areaHead(lang, gid, hid) {
  const g = groupOf(gid);
  return `<header class="lvs-area__head">
        <span class="lvs-letter" aria-hidden="true">${e(gid)}</span>
        <div>
          <p class="lvs-meta">${e(gid)} · ${e(g.en)} · ${e(g.range)}</p>
          <h3 id="${e(hid)}">${e(pick(lang, g.ko, g.en))}</h3>
          <p>${e(pick(lang, g.leadKo, g.leadEn))}</p>
        </div>
      </header>`;
}
const markOf = (lang, x) => {
  const st = categoryStatus(x);
  return `<span class="lvs-st"><i class="lvs-mark lvs-mark--${e(st)}" aria-hidden="true"></i><span>${e(stLabel(lang, st))}</span></span>`;
};

/* Daily life — two areas side by side as clean directories */
function dailySec(lang) {
  const c = siteCopy(lang).overview.daily;
  const cols = ["B", "C"].map((gid) => {
    const rows = CATEGORIES.filter((x) => x.g === gid)
      .map((x) => `<li><span>${e(x.n)}</span><div><strong><a href="${e(catHref(lang, x.n))}">${e(pick(lang, x.ko, x.en))}</a></strong><p>${e(pick(lang, x.lineKo, x.lineEn))}</p></div>${markOf(lang, x)}</li>`)
      .join("");
    return `<section class="lvs-area" aria-labelledby="lvs-area-${gid}">
      ${areaHead(lang, gid, `lvs-area-${gid}`)}
      <ol class="lvs-dir lvs-dir--cats">${rows}</ol>
    </section>`;
  }).join("");
  return block("lvs-daily", `${head(c.kicker, c.title, c.lead)}
    <div class="lvs-cols">${cols}</div>
    ${legend(lang)}`, SEC);
}

/* Family & wellness — the same data as tiles on the band, for a different rhythm */
function familySec(lang) {
  const c = siteCopy(lang).overview.family;
  const groups = ["D", "E"].map((gid) => {
    const tiles = CATEGORIES.filter((x) => x.g === gid)
      .map((x) => `<li class="lvs-tile" data-status="${e(categoryStatus(x))}"><a href="${e(catHref(lang, x.n))}"><span class="lvs-tile__n">${e(x.n)}</span><strong>${e(pick(lang, x.ko, x.en))}</strong><p>${e(pick(lang, x.lineKo, x.lineEn))}</p>${markOf(lang, x)}</a></li>`)
      .join("");
    return `<section class="lvs-area lvs-area--tiles" aria-labelledby="lvs-area-${gid}">
      ${areaHead(lang, gid, `lvs-area-${gid}`)}
      <ol class="lvs-tiles">${tiles}</ol>
    </section>`;
  }).join("");
  return block("lvs-family", `${headSplit(c.kicker, c.title, c.lead)}
    <div class="lvs-stack">${groups}</div>
    ${legend(lang)}`, RULE);
}

/* who it is for — four columns */
function customers(lang) {
  const k = c30(lang).customers;
  return block("lvs-customers", `${headSplit(k.kicker, k.title, k.lead)}
    ${feats(k.items, 4, { icons: ["person", "users", "building", "handshake"] })}`, RULE);
}

/* why LIVON — each existing way of doing it against what LIVON does */
function diffSec(lang) {
  const k = c30(lang).diff;
  return block("lvs-diff", `<div class="nls-split lvs-split lvs-split--wide">
      ${head(k.kicker, k.title, k.lead)}
      ${vsRows(k.items)}
    </div>`, RULE);
}

/* community / AI / official information — bento: one large tile and two stacked */
function communityAi(lang) {
  const c = siteCopy(lang).overview.ca;
  const items = c.items
    .map(([t, sub, body, st], i) => `<article class="lvs-bento__item${i === 0 ? " lvs-bento__item--lg" : ""}">
      <span class="lvs-feats__i">${icon(CA_ICON[i])}</span>
      <h3>${e(t)}</h3>
      <p class="lvs-bento__sub">${e(sub)}</p>
      <p>${e(body)}</p>
      ${status(lang, st)}
    </article>`)
    .join("");
  return block("lvs-community", `${head(c.kicker, c.title, "")}
    <div class="lvs-bento">${items}</div>`, BAND);
}

/* service status — one board, one column per status */
function nowSec(lang) {
  const k = c30(lang).now;
  const groups = k.groups.map(([key, title, rows], gi) => statusGroup(lang, key, title, rows.map(([t, l]) => dirRow("", t, l)), `lvs-now-${gi}`)).join("");
  return block("lvs-now", `${headSplit(k.kicker, k.title, k.lead)}
    <div class="lvs-board lvs-board--${k.groups.length}">${groups}</div>
    <p class="lvs-notice">${icon("info", "lvs-notice__i")}<span>${e(siteCopy(lang).appStatus)}</span></p>`, SEC);
}

/* long-term vision — the 21 areas as an index (group on the left, areas on the right), then the priorities in order */
function futureSec(lang) {
  const k = c30(lang).future;
  const rows = AREA_GROUPS.map((g) => {
    const items = g.ids.map((n) => {
      const t = areaT(lang, byArea[n]);
      return `<li><a href="${e(zoneHref(lang, n))}"><span>${e(n)}</span><strong>${e(t.name)}</strong><em>${e(byArea[n].en)} · ${e(t.who)}</em></a></li>`;
    }).join("");
    return `<section class="lvs-index__row" aria-labelledby="lvs-future-${g.id}">
      <header><p class="lvs-meta">${e(g.en)} · ${g.ids.length}</p><h3 id="lvs-future-${g.id}">${e(pick(lang, g.ko, g.en))}</h3><p>${e(pick(lang, g.leadKo, g.leadEn))}</p></header>
      <ol class="lvs-index__list">${items}</ol>
    </section>`;
  }).join("");
  const t = v3(lang).trio;
  const trio = t.items.map(([n, en, name, body]) => `<li><a href="${e(zoneHref(lang, n))}"><span class="lvs-trio__n">${e(n)} · ${e(en)}</span><strong>${e(name)}</strong><p>${e(body)}</p>${arrow}</a></li>`).join("");
  return block("lvs-future", `${headSplit(k.kicker, k.title, k.lead)}
    <div class="lvs-index">${rows}</div>
    <div class="lvs-trio">
      <header class="lvs-trio__head"><h3 class="lvs-h3">${e(t.title)}</h3><p>${e(t.lead)}</p></header>
      <ol class="lvs-trio__list">${trio}</ol>
    </div>
    <div class="lvs-prio">
      <h3 class="lvs-h3">${e(k.prioTitle)}</h3>
      ${steps(k.prio, "prio")}
    </div>
    <p class="lvs-more-link"><a class="lvs-link" href="${e(pageHref(lang, "platform"))}#lvs-areas">${e(k.more)} ${arrow}</a></p>`, RULE);
}

/* ecosystem — four tracks, then NEWON (text and examples) beside the app list */
function ecosystem(lang) {
  const c = siteCopy(lang).overview.eco;
  const tracks = c.tracks.map(([t, b], i) => `<li${i === 0 ? ' class="is-self"' : ""}><h3>${e(t)}</h3><p>${e(b)}</p></li>`).join("");
  const x = v3(lang).eco;
  const apps = [["livon", "LIVON", c.livon]].concat(Object.entries(NEWON_APPS).map(([k, a]) => [k, a.name, pick(lang, a.ko, a.en)]));
  const dir = apps.map(([k, n, t], i) => `<tr${i === 0 ? ' class="is-self"' : ""}><th scope="row">${e(n)}</th><td data-label="${e(x.cols[1])}">${e(t)}</td><td data-label="${e(x.cols[2])}">${e(x.when[k])}</td></tr>`).join("");
  return block("lvs-ecosystem", `${head(c.kicker, c.title, c.lead)}
    <ol class="lvs-tracks">${tracks}</ol>
    <div class="lvs-gap">
      <header class="nls-head lvs-subhead"><h3 class="lvs-h3">${e(c.newonTitle)}</h3><p class="nls-lead">${e(c.newonLead)} ${e(x.lead2)}</p></header>
      <div class="lvs-table-wrap"><table class="lvs-table lvs-table--apps">
        <thead><tr>${x.cols.map((t) => `<th scope="col">${e(t)}</th>`).join("")}</tr></thead>
        <tbody>${dir}</tbody>
      </table></div>
      <div class="lvs-quotes">${pick(lang, PLATFORM_EXAMPLES.ko, PLATFORM_EXAMPLES.en).map((t) => `<p class="lvs-quote">${e(t)}</p>`).join("")}</div>
    </div>`, RULE);
}

/* global vision (2026-10 owner brief) — the same split as the vision band: statement left, four directions right */
function globalSec(lang) {
  const g = c30(lang).global.overview;
  return block("lvs-global", `${headSplit(g.kicker, g.title, g.lead)}
    ${defs(g.points, "grid")}
    <p class="lvs-more-link"><a class="lvs-link" href="${e(pageHref(lang, "business"))}#lvs-global">${e(g.more)} ${arrow}</a></p>`, RULE);
}

/* closing ink band with one yellow call to action */
function nextStep(lang) {
  const c = siteCopy(lang);
  const n = c.overview.next;
  const links = LIVON_SITE_PAGES.filter((p) => p.id !== "overview")
    .map((p) => `<a class="nls-btn nls-btn--ghost" href="${e(pageHref(lang, p.id))}">${e(p.en)}${lang === "en" ? "" : ` · ${e(pageLabel(lang, p))}`}</a>`)
    .join("");
  return `<div id="lvs-next" class="nls-block nls-close nls-block--ink lvs-close" data-lvs-section="10">
    <p class="nls-kicker">${e(n.kicker)}</p>
    <h2 class="nls-hero__title">${nl(n.title)}</h2>
    <p class="nls-lead">${e(n.lead)}</p>
    <p class="nls-note">${e(c.appStatus)}</p>
    <div class="nls-actions">
      <a class="nls-btn lvs-btn-point" href="${e(pageHref(lang, "platform"))}#lvs-app">${e(c.tryWeb)} →</a>
      ${links}
    </div>
  </div>`;
}

/* data-lvs-section numbers follow the order on the page (the hero is 01) */
const numberSections = (html) => { let i = 1; return html.replace(/data-lvs-section(="[^"]*")?/g, () => `data-lvs-section="${pad(++i)}"`); };

export function renderOverview(lang) {
  const c = siteCopy(lang);
  const body = numberSections(`
    ${leadNote(c.notice)}
    ${defineSec(lang)}
    ${vision(lang)}
    ${lifeJourney(lang)}
    ${lifeStage(lang)}
    ${explorer(lang)}
    ${dailySec(lang)}
    ${familySec(lang)}
    ${customers(lang)}
    ${diffSec(lang)}
    ${communityAi(lang)}
    ${nowSec(lang)}
    ${futureSec(lang)}
    ${ecosystem(lang)}
    ${globalSec(lang)}
    ${nextStep(lang)}`);
  return shell(lang, "overview", "lvs-overview-title", overviewHero(lang), body);
}

/* ════════════════════════ 02 Platform ════════════════════════ */
function categoryCard(lang, x) {
  const f = siteCopy(lang).platform.f;
  const st = categoryStatus(x);
  const app = x.newon ? NEWON_APPS[x.newon] : null;
  const newon = app ? `${e(app.name)} — ${e(pick(lang, app.ko, app.en))} (${e(f.newonNote)})` : e(f.newonNone);
  const cta =
    st === "planned"
      ? `<a class="lvs-link" href="${e(pageHref(lang, "contact"))}">${e(f.ctaPlanned)} ${arrow}</a>`
      : `<a class="lvs-link" href="${e(pageHref(lang, "platform"))}#lvs-app">${e(f.ctaWeb)} ${arrow}</a>`;
  const nt = pick(lang, x.noteKo, x.noteEn);
  return `<article class="lvs-cat" id="lvs-cat-${e(x.n)}" data-status="${e(st)}">
    <div class="lvs-cat__meta"><span class="lvs-cat__n">${e(x.n)}</span><span class="lvs-cat__en">${e(x.en)}</span></div>
    <h4>${e(pick(lang, x.ko, x.en))}</h4>
    <p class="lvs-cat__line">${e(pick(lang, x.lineKo, x.lineEn))}</p>
    <p class="lvs-cat__intro">${e(pick(lang, x.introKo, x.introEn))}</p>
    ${chips(pick(lang, x.topicsKo, x.topicsEn))}
    ${nt ? `<p class="lvs-cat__note">${e(f.note)} · ${e(nt)}</p>` : ""}
    <details class="lvs-more">
      <summary>${e(f.more)}</summary>
      ${dl([
        [f.situations, e(pick(lang, x.sitKo, x.sitEn).join(", "))],
        [f.who, e(pick(lang, x.whoKo, x.whoEn))],
        [f.src, e(pick(lang, x.srcKo, x.srcEn))],
        [f.svc, e(pick(lang, x.svcKo, x.svcEn))],
        [f.newon, newon],
      ])}
    </details>
    <div class="lvs-cat__foot">${status(lang, st)}${cta}</div>
  </article>`;
}

export function renderPlatform(lang) {
  const c = siteCopy(lang);
  const p = c.platform;
  const x = c30(lang).platform;
  /* core features — a 4 × 2 feature list, status under each */
  const core = CORE_FEATURES.map(
    (f, i) => `<article class="lvs-core" data-status="${e(f.st)}">
      <span class="lvs-feats__i">${icon(CORE_ICON[i])}</span>
      <h3>${e(f.en)}${isKo(lang) ? ` <small>${e(f.ko)}</small>` : ""}</h3>
      <p>${e(pick(lang, f.nowKo, f.nowEn))}</p>
      ${status(lang, f.st)}
    </article>`
  ).join("");
  /* 21 core areas — one tab per group; without JS the tab row is a jump menu and every group is listed */
  const zf = x.f;
  const zoneCard = (a) => {
    const t = areaT(lang, a);
    return `<article class="lvs-cat lvs-zone" id="lvs-zone-${e(a.n)}">
      <div class="lvs-cat__meta"><span class="lvs-cat__n">${e(a.n)}</span><span class="lvs-cat__en">${e(a.en)}</span></div>
      <h4>${e(t.name)}</h4>
      <p class="lvs-cat__line">${e(zf.who)} · ${e(t.who)}</p>
      <p class="lvs-cat__intro"><b>${e(zf.problem)}</b> ${e(t.problem)}</p>
      <p class="lvs-k">${e(zf.features)}</p>
      ${chips(t.features)}
      ${dl([
        [zf.connect, e(t.connect)],
        [zf.now, e(t.now)],
        [zf.plan, e(t.plan)],
        [zf.cats, a.cats.length ? catLinks(lang, a.cats) : ""],
      ])}
    </article>`;
  };
  const ztabs = tabs(x.areasTitle, AREA_GROUPS.map((g) => [`lvs-zgroup-${g.id}`, pick(lang, g.ko, g.en), g.ids.join(" · "), ""]));
  const zgroups = AREA_GROUPS.map((g) => `<section class="lvs-group" id="lvs-zgroup-${e(g.id)}" aria-labelledby="lvs-zgroup-${e(g.id)}-t" data-lvs-panel>
      <header class="lvs-group__head">
        <p class="lvs-meta">${e(g.en)} · ${g.ids.length}</p>
        <h3 class="lvs-group__title" id="lvs-zgroup-${e(g.id)}-t">${e(pick(lang, g.ko, g.en))}</h3>
        <p class="lvs-group__lead">${e(pick(lang, g.leadKo, g.leadEn))}</p>
      </header>
      <div class="lvs-cats">${g.ids.map((n) => zoneCard(byArea[n])).join("")}</div>
    </section>`).join("");
  /* status board — one place for the status of all 21 areas */
  const sg = x.sgroups;
  const zrows = (st) => AREAS.filter((a) => a.st === st).map((a) => dirRow(a.n, areaT(lang, a).name, a.en, `#lvs-zone-${a.n}`));
  const board = [
    statusGroup(lang, "now", sg.now, zrows("now"), "lvs-sg-now"),
    statusGroup(lang, "partial", sg.partial, zrows("partial"), "lvs-sg-partial"),
    statusGroup(lang, "planned", sg.planned, zrows("planned"), "lvs-sg-planned"),
    statusGroup(lang, "review", sg.review, pick(lang, REVIEW_ITEMS.ko, REVIEW_ITEMS.en).map((t) => dirRow("", t, "")), "lvs-sg-review"),
  ].join("");
  const flow = pick(lang, FLOW.ko, FLOW.en).map(([t, b], i) => [t, b, ["Understand", "Explore", "Plan", "Connect", "Record"][i]]);
  const sf = x.scnF;
  const scn = SCENARIOS.map((s) => {
    const t = isKo(lang) ? s.ko : s.en;
    return `<article class="lvs-biz lvs-scn" id="lvs-scn-${e(s.id)}">
      <header class="lvs-scn__head"><h3>${e(t.title)}</h3><p>${e(sf.who)} · ${e(t.who)}</p></header>
      <p class="lvs-biz__what">${e(t.steps)}</p>
      <dl class="lvs-scn__nl">
        <div class="is-now"><dt>${e(sf.now)}</dt><dd>${e(t.now)}</dd></div>
        <div><dt>${e(sf.later)}</dt><dd>${e(t.later)}</dd></div>
      </dl>
      <p class="lvs-scn__areas"><b>${e(sf.areas)}</b> ${zoneLinks(lang, s.areas)}</p>
    </article>`;
  }).join("");
  const users = x.users.map(([t, now, later]) => `<div class="lvs-compare__row"><h3>${e(t)}</h3><p class="is-now">${e(now)}</p><p>${e(later)}</p></div>`).join("");
  /* the first two notes as a pair of cards; the third (the planned tab bar) leads the five-tab strip below */
  const app = x.app.slice(0, 2).map(([t, sub, body], i) => `<article class="lvs-bento__item${i === 0 ? " lvs-bento__item--hl" : ""}">
      <span class="lvs-feats__i">${icon(["home", "list"][i])}</span>
      <h3>${e(t)}</h3>
      <p class="lvs-bento__sub">${e(sub)}</p>
      <p>${e(body)}</p>
    </article>`).join("");
  const appTabsLead = x.app[2];
  const gp = c30(lang).global.platform;
  const y3 = v3(lang);
  /* LIVON AI (plan §5) */
  const ai = y3.ai;
  const aiSec = block("lvs-ai", `${headSplit(ai.kicker, ai.title, ai.lead)}
      <p class="lvs-pill lvs-pill--planned lvs-pill--lead">${e(ai.tag)}</p>
      <ul class="lvs-aigrid">${ai.items.map(([t, b]) => `<li><strong>${e(t)}</strong><p>${e(b)}</p></li>`).join("")}</ul>
      ${feats(ai.rules, 4, { mod: "rule" })}`, { rule: true });
  /* three independent areas, step by step (plan §4) — tabs; without JS every panel is listed */
  const td = y3.trioDetail;
  const tdTabs = tabs(td.title.replace(/\n/g, " "), td.panels.map((q) => [`lvs-trio-${q.id}`, q.tab, `${q.id} · ${byArea[q.id].en}`, ""]));
  const tdPanels = td.panels.map((q) => `<section class="lvs-group lvs-n3" id="lvs-trio-${e(q.id)}" aria-labelledby="lvs-trio-${e(q.id)}-t" data-lvs-panel>
      <header class="lvs-n3__head">
        <p class="lvs-meta">${e(q.id)} · ${e(byArea[q.id].en)}</p>
        <h3 class="lvs-group__title" id="lvs-trio-${e(q.id)}-t">${e(areaT(lang, byArea[q.id]).name)}</h3>
        <p class="lvs-group__lead"><b>${e(td.who)}</b> ${e(q.who)}</p>
        <p class="lvs-n3__rule">${icon("shield", "lvs-notice__i")}<span>${e(q.rule)}</span></p>
        <a class="lvs-link" href="#lvs-zone-${e(q.id)}">${e(td.more)} ${arrow}</a>
      </header>
      <ol class="lvs-n3__rows" aria-label="${e(td.cols[q.head])} · ${e(td.cols.fn)}">${q.rows.map(([k, v], i) => `<li><span>${pad(i + 1)}</span><strong>${e(k)}</strong><p>${e(v)}</p></li>`).join("")}</ol>
    </section>`).join("");
  const trioSec = block("lvs-trio", `${headSplit(td.kicker, td.title, td.lead)}
      <p class="lvs-pill lvs-pill--planned lvs-pill--lead">${e(td.tag)}</p>
      <div class="lvs-tabs" data-lvs-tabs>
        ${tdTabs}
        <div class="lvs-n3s">${tdPanels}</div>
      </div>`);
  const at = y3.appTabs;
  /* 40 categories — one tab per area (A–E) */
  const ctabs = tabs(p.groupsTitle, GROUPS.map((g) => [`lvs-group-${g.id}`, pick(lang, g.ko, g.en), g.range, g.id]));
  const groups = GROUPS.map((g) => {
    const cards = CATEGORIES.filter((y) => y.g === g.id).map((y) => categoryCard(lang, y)).join("");
    return `<section class="lvs-group" id="lvs-group-${e(g.id)}" aria-labelledby="lvs-group-${e(g.id)}-t" data-lvs-panel>
      <header class="lvs-group__head">
        <span class="lvs-letter" aria-hidden="true">${e(g.id)}</span>
        <div>
          <p class="lvs-meta">${e(g.en)} · ${e(g.range)}</p>
          <h3 class="lvs-group__title" id="lvs-group-${e(g.id)}-t">${e(pick(lang, g.ko, g.en))}</h3>
          <p class="lvs-group__lead">${e(pick(lang, g.leadKo, g.leadEn))}</p>
        </div>
      </header>
      <div class="lvs-cats">${cards}</div>
    </section>`;
  }).join("");
  const body = `
    ${leadNote(c.notice)}
    ${block("lvs-flow", `${headSplit(x.flowKicker, x.flowTitle, x.flowLead)}
      ${steps(flow, "5")}`, { accent: true })}
    ${block("lvs-core", `${head(p.coreKicker, p.coreTitle, "")}
      <div class="lvs-corelist">${core}</div>`, { rule: true })}
    ${block("lvs-areas", `${headSplit(x.areasKicker, x.areasTitle, x.areasLead)}
      <div class="lvs-tabs" data-lvs-tabs>
        ${ztabs}
        <div class="lvs-zgroups">${zgroups}</div>
      </div>`, { rule: true })}
    ${block("lvs-status", `${headSplit(x.statusKicker, x.statusTitle, x.statusLead)}
      <div class="lvs-board lvs-board--4">${board}</div>
      <p class="lvs-notice">${icon("info", "lvs-notice__i")}<span><b>${e(x.appRow[0])}</b> · ${e(x.appRow[1])}</span></p>`, { band: true })}
    ${trioSec}
    ${block("lvs-scenarios", `${headSplit(x.scnKicker, x.scnTitle, x.scnLead)}
      <div class="lvs-scngrid">${scn}</div>`, { rule: true })}
    ${block("lvs-users", `${head(x.usersKicker, x.usersTitle, "")}
      <div class="lvs-compare">${users}</div>`, { rule: true })}
    ${block("lvs-links", `${head(x.linkKicker, x.linkTitle, "")}
      ${defs(x.links, "grid3")}`, { rule: true })}
    ${block("lvs-map", `${headSplit(x.catsKicker, x.catsTitle, x.catsLead)}
      ${lifeMap(lang, [], p.groupsTitle)}
      ${legend(lang)}`, { band: true })}
    ${block("lvs-groups", `<div class="lvs-tabs" data-lvs-tabs>
        ${ctabs}
        <div class="lvs-cgroups-panels">${groups}</div>
      </div>`, { cls: "lvs-groups" })}
    ${block("lvs-official", `<div class="nls-split lvs-split">
        <div class="lvs-official__head">
          <span class="lvs-official__ico">${icon("shield")}</span>
          ${head(p.officialKicker, p.officialTitle, "")}
        </div>
        ${defs(p.officialItems, "grid")}
      </div>`, { rule: true })}
    ${block("lvs-trust", `${head(x.trustKicker, x.trustTitle, "")}
      ${checks(x.trust.map((t) => e(t)))}`, { rule: true })}
    ${aiSec}
    ${block("lvs-global", `${headSplit(gp.kicker, gp.title, gp.lead)}
      ${feats(gp.services, 4, { mod: "rule" })}
      <div class="lvs-gap">
        <header class="nls-head lvs-subhead"><h3 class="lvs-h3">${e(gp.locTitle)}</h3><p class="nls-lead">${e(gp.locLead)}</p></header>
        ${defs(gp.loc, "grid")}
      </div>
      <p class="nls-note">${e(gp.related)} ${catLinks(lang, ["13", "37"])}</p>`, { cls: "lvs-rule" })}
    ${block("lvs-app", `${head(x.appKicker, x.appTitle, "")}
      <div class="lvs-bento lvs-bento--pair">${app}</div>
      <div class="lvs-apptabs">
        <header class="lvs-apptabs__head"><span class="lvs-feats__i">${icon("grid")}</span><div><h3 class="lvs-h4">${e(appTabsLead[0])}</h3><p>${e(appTabsLead[2])}</p></div></header>
        <ol aria-label="${e(appTabsLead[1])}">${at.rows.map(([t, b]) => `<li><strong>${e(t)}</strong><p>${e(b)}</p></li>`).join("")}</ol>
        <p class="nls-note">${e(at.note)}</p>
      </div>`, { band: true })}
    ${block("lvs-faq", `${head(x.faqKicker, x.faqTitle, "")}
      ${faqList(x.faq, "2")}`, { rule: true })}`;
  return shell(lang, "platform", "lvs-platform-title", textHero(lang, "Platform", p.heroTitle, p.heroLead, "lvs-platform-title"), body);
}

/* ════════════════════════ 03 Business ════════════════════════ */
export function renderBusiness(lang) {
  const c = siteCopy(lang);
  const b = c.business;
  const x = c30(lang).business;
  /* 15 areas — an accordion: number, name and status at a glance; the full fields when opened */
  const areas = BUSINESS.map((y) => {
    const d = pick(lang, y.ko2, y.en2);
    return `<details class="lvs-biz" id="lvs-biz-${e(y.n)}" data-status="${e(y.st)}">
      <summary><span class="lvs-biz__n">${e(y.n)}</span><h3>${e(pick(lang, y.ko, y.en))} <small>${e(y.en)}</small></h3>${statusSpan(lang, y.st)}</summary>
      <div class="lvs-biz__body">
        <p class="lvs-biz__what">${e(d.what)}</p>
        ${dl([
          [b.f.who, e(d.who)],
          [b.f.value, e(d.value)],
          [b.f.rev, e(d.rev)],
          [b.f.partners, e(d.partners)],
          [b.f.rule, e(d.rule)],
        ])}
        <a class="lvs-link lvs-biz__cta" href="/${e(lang)}/contact/?type=business">${e(b.f.cta)} ${arrow}</a>
      </div>
    </details>`;
  }).join("");
  const revRows = REVENUE.map(
    (r) => `<tr><th scope="row">${e(pick(lang, r.ko, r.en))}<small class="lvs-table__g">${e(r.n)} · ${e(pick(lang, REVENUE_GROUPS[r.g].ko, REVENUE_GROUPS[r.g].en))}</small></th><td data-label="${e(b.revCols[1])}">${e(pick(lang, r.whoKo, r.whoEn))}</td><td data-label="${e(b.revCols[2])}">${e(pick(lang, r.howKo, r.howEn))}</td><td data-label="${e(b.revCols[3])}"><span class="lvs-pill lvs-pill--concept">${e(b.revStatus)}</span></td></tr>`
  ).join("");
  const stRoad = { now: b.roadNow, next: b.roadNext, later: b.roadLater };
  const y3 = v3(lang);
  /* roadmap — eight steps in a 4 × 2 grid; scope and the completion test are split out of the same sentence */
  const road = ROADMAP.map((r) => {
    const body = pick(lang, r.bodyKo, r.bodyEn);
    const m = body.match(/^(.*?)\s*(?:완료 기준:\s*|Done when\s*)(.*)$/);
    const scope = m ? m[1] : body;
    const done = m ? m[2].replace(/\.$/, "") : "";
    return `<li class="lvs-road__step" data-st="${e(r.st)}">
      <div class="lvs-road__top"><span class="lvs-road__n">${e(r.n)}</span><p class="lvs-pill lvs-pill--${r.st === "now" ? "now" : "later"}">${e(stRoad[r.st])}</p></div>
      <h3>${e(pick(lang, r.ko, r.en))}</h3>
      <p>${e(scope)}</p>
      ${done ? `<p class="lvs-road__done"><b>${e(y3.road.done)}</b> ${e(done)}</p>` : ""}
    </li>`;
  }).join("");
  const tr = y3.trioRev;
  const trioRev = tr.items.map(([en, name, free, paid]) => `<li><p class="lvs-meta">${e(en)}</p><h3>${e(name)}</h3><dl><div class="is-free"><dt>${e(tr.free)}</dt><dd>${e(free)}</dd></div><div><dt>${e(tr.paid)}</dt><dd>${e(paid)}</dd></div></dl></li>`).join("");
  const plans = x.plans.map(([t, st, body], i) => `<li class="lvs-plan${i === 0 ? " is-now" : ""}"><p class="lvs-plan__st">${e(st)}</p><h3>${e(t)}</h3><p>${e(body)}</p></li>`).join("");
  const gb = c30(lang).global.business;
  const principles = [b.verdictBody, pick(lang, "고객별 맞춤 외주가 아니라 표준화된 자체 솔루션과 플랫폼 제품을 만듭니다.", "Standard products and our own platform — not custom client work."), b.revNote];
  const body = `
    ${block("lvs-verdict", `<div class="lvs-statement">
        <p class="nls-kicker">Principle</p>
        <h2 class="nls-title lvs-statement__title">${e(b.verdictTitle)}</h2>
        ${feats(principles.map((t) => ["", t]), 3, { mod: "plain" })}
      </div>`, { accent: true })}
    ${block("lvs-model", `<div class="nls-split lvs-split">
        ${head(x.modelKicker, x.modelTitle, x.modelLead)}
        ${defs(x.structure)}
      </div>`)}
    ${block("lvs-revenue", `${headSplit(x.revKicker, b.revTitle, x.revLead)}
      <p class="lvs-pill lvs-pill--concept">${e(b.revStatus)}</p>
      <div class="lvs-table-wrap"><table class="lvs-table">
        <thead><tr>${b.revCols.map((t) => `<th scope="col">${e(t)}</th>`).join("")}</tr></thead>
        <tbody>${revRows}</tbody>
      </table></div>
      <p class="lvs-notice">${icon("arrow", "lvs-notice__i")}<span>${e(y3.revPriority)}</span></p>`, { rule: true })}
    ${block("lvs-plans", `${headSplit(x.plansKicker, x.plansTitle, x.plansLead)}
      <ol class="lvs-plans">${plans}</ol>
      <p class="lvs-notice">${icon("building", "lvs-notice__i")}<span>${e(x.plansBiz)}</span></p>`, { band: true })}
    ${block("lvs-fees", `<div class="nls-split lvs-split">
        ${head(x.feeKicker, x.feeTitle, x.feeLead)}
        ${defs(x.fees.concat([y3.feeExpert]), "tags")}
      </div>
      <div class="lvs-gap lvs-trev">
        <header class="nls-head lvs-subhead"><h3 class="lvs-h3">${e(tr.title)}</h3><p class="nls-lead">${e(tr.lead)}</p></header>
        <ol class="lvs-trev__list">${trioRev}</ol>
      </div>`)}
    ${block("lvs-biz", `${headSplit(b.kicker, b.title, b.lead)}
      <div class="lvs-accs">${areas}</div>`, { band: true })}
    ${block("lvs-market", `${head(x.mktKicker, x.mktTitle, "")}
      ${feats(x.mkt, 3, { mod: "rule" })}
      <div class="lvs-gap">
        <header class="nls-head lvs-subhead"><h3 class="lvs-h3">${e(x.diffTitle)}</h3><p class="nls-lead">${e(c30(lang).diff.lead)}</p></header>
        ${vsRows(x.diffs)}
      </div>`)}
    ${block("lvs-gtm", `${head(x.gtmKicker, x.gtmTitle, "")}
      ${steps(x.gtm)}`, { rule: true })}
    ${block("lvs-roadmap", `${headSplit(b.roadKicker, b.roadTitle, x.roadLead)}
      <ol class="lvs-road">${road}</ol>
      <p class="lvs-notice">${icon("shield", "lvs-notice__i")}<span>${e(y3.road.note)}</span></p>`, { rule: true })}
    ${block("lvs-rules", `${head(b.ruleKicker, b.ruleTitle, "")}
      ${checks(b.ruleItems.concat(x.rulesExtra).map((t) => e(t)))}
      <div class="lvs-gap">
        <header class="nls-head lvs-subhead"><h3 class="lvs-h3">${e(y3.review.title)}</h3><p class="nls-lead">${e(y3.review.lead)}</p></header>
        ${matrix(y3.review.rows, 4)}
      </div>`, { band: true })}
    ${block("lvs-global", `${headSplit(gb.kicker, gb.title, gb.lead)}
      <header class="nls-head lvs-subhead"><h3 class="lvs-h3">${e(gb.custTitle)}</h3><p class="nls-lead">${e(gb.custLead)}</p></header>
      ${feats(gb.customers, 4, { mod: "rule" })}
      <div class="lvs-gap">
        <header class="nls-head lvs-subhead"><h3 class="lvs-h3">${e(gb.phaseTitle)}</h3><p class="nls-lead">${e(gb.phaseLead)}</p></header>
        ${steps(gb.phases, "5")}
      </div>
      <div class="nls-split lvs-split lvs-gap">
        <header class="nls-head lvs-subhead"><h3 class="lvs-h3">${e(gb.revTitle)}</h3><p class="nls-lead">${e(gb.revLead)}</p></header>
        ${defs(gb.revenue)}
      </div>`, { rule: true })}
    <div class="nls-block nls-close nls-block--ink lvs-close">
      <p class="nls-kicker">Business</p>
      <h2 class="nls-hero__title">${nl(x.ctaTitle)}</h2>
      <p class="nls-lead">${e(x.ctaLead)}</p>
      <div class="nls-actions">
        <a class="nls-btn lvs-btn-point" href="/${e(lang)}/business/contact/?type=saas&amp;platform=livon">${e(x.ctaBiz)} →</a>
        <a class="nls-btn nls-btn--ghost" href="${e(pageHref(lang, "partnerships"))}">${e(x.ctaPartner)}</a>
      </div>
    </div>`;
  return shell(lang, "business", "lvs-business-title", textHero(lang, "Business", b.heroTitle, b.heroLead, "lvs-business-title"), body);
}

/* ════════════════════════ 04 Partnerships ════════════════════════ */
export function renderPartnerships(lang) {
  const c = siteCopy(lang);
  const p = c.partnerships;
  const pc = pick(lang, PARTNER_COMMON.ko, PARTNER_COMMON.en);
  const byP = Object.fromEntries(PARTNERS.map((y) => [y.n, y]));
  const card = (y) => `<article class="lvs-partner${y.official ? " is-source" : ""}" id="lvs-partner-${e(y.n)}">
      <span class="lvs-cat__n">${e(y.n)}</span>
      <div>
        <h4>${e(pick(lang, y.ko, y.en))} <small>${e(y.en)}</small></h4>
        <p>${e(pick(lang, y.whatKo, y.whatEn))}</p>
        ${y.official ? `<p class="lvs-pill lvs-pill--concept">${e(p.f.officialTag)}</p>` : ""}
      </div>
    </article>`;
  const groups = PARTNER_GROUPS.map(
    (g, gi) => `<section class="lvs-pgroup" aria-labelledby="lvs-pgroup-${gi}">
      <h3 id="lvs-pgroup-${gi}" class="lvs-pgroup__title">${e(pick(lang, g.ko, g.en))} <span class="lvs-count">${g.ids.length}</span></h3>
      <div class="lvs-partners">${g.ids.map((n) => card(byP[n])).join("")}</div>
    </section>`
  ).join("");
  const terms = defs([
    [p.f.value, pc.value],
    [p.f.rev, pc.rev],
    [p.f.cond, pc.cond],
    [p.f.officialTag, `${pc.officialRev} ${pc.officialCond}`],
  ], "grid");
  const x = c30(lang).partnerships;
  const mf = x.modelsF;
  const models = x.models.map(([t, who, what, value, cond], i) => `<article class="lvs-biz lvs-pmodel" id="lvs-pmodel-${pad(i + 1)}">
      <header><h3>${e(t)}</h3><p><span>${e(mf.who)}</span> ${e(who)}</p></header>
      <p class="lvs-biz__what">${e(what)}</p>
      ${dl([[mf.value, e(value)], [mf.cond, e(cond)]])}
    </article>`).join("");
  const pf = x.pocF;
  const gq = c30(lang).global.partnerships;
  const pocs = x.pocs.map(([t, scope, period, measure, cond], i) => `<article class="lvs-biz lvs-poc" id="lvs-poc-${pad(i + 1)}">
      <h3>${e(t)}</h3>
      <p class="lvs-biz__what">${e(scope)}</p>
      ${dl([[pf.period, e(period)], [pf.measure, e(measure)], [pf.cond, e(cond)]])}
    </article>`).join("");
  const y3 = v3(lang);
  const cItems = Object.fromEntries(c30(lang).contact.items.map(([id, t, , include]) => [id, [t, include]]));
  const body = `
    ${block("lvs-pvision", `<div class="lvs-statement">
        ${head(x.visionKicker, x.visionTitle, x.visionLead)}
        ${feats(x.vision, 3, { mod: "rule" })}
      </div>`, { accent: true })}
    ${block("lvs-pmodels", `${head(x.modelsKicker, x.modelsTitle, "")}
      <div class="lvs-pmodels">${models}</div>`)}
    ${block("lvs-partners", `${headSplit(p.kicker, p.title, p.sourceNote)}
      <div class="lvs-pgroups">${groups}</div>`, { rule: true })}
    ${block("lvs-poc", `${head(x.pocKicker, x.pocTitle, x.pocLead)}
      <p class="lvs-pill lvs-pill--concept">${e(pick(lang, "제안 · 진행 중인 파일럿 없음", "Proposal · no pilot running"))}</p>
      <div class="lvs-pocs">${pocs}</div>`, { band: true })}
    ${block("lvs-data", `${headSplit(x.dataKicker, x.dataTitle, x.dataLead)}
      <ul class="lvs-list lvs-list--2">${x.data.map((t) => `<li>${e(t)}</li>`).join("")}</ul>`, { rule: true })}
    ${block("lvs-campaigns", `${head(x.campKicker, x.campTitle, "")}
      ${feats(x.camps, x.camps.length > 3 ? 4 : 3, { mod: "card" })}`, { rule: true })}
    ${block("lvs-value", `${head(x.valueKicker, x.valueTitle, "")}
      ${feats(x.values, 4, { icons: ["building", "home", "book", "shield"] })}`, { rule: true })}
    ${block("lvs-terms", `${headSplit("Terms", p.sourceTitle, y3.pTermsLead)}
      ${terms}
      <div class="lvs-gap">
        <h3 class="lvs-h4">${e(y3.pChecksTitle)}</h3>
        ${matrix(y3.pChecks, 4)}
      </div>`, { band: true })}
    ${block("lvs-steps", `${head(p.stepsKicker, p.stepsTitle, "")}
      ${steps(pick(lang, PARTNER_STEPS.ko, PARTNER_STEPS.en))}
      <div class="lvs-gap lvs-pinc">
        <h3 class="lvs-h4">${e(y3.pInclude.title)}</h3>
        ${matrix(y3.pInclude.ids.map((id) => cItems[id]), 4)}
      </div>`, { rule: true })}
    ${block("lvs-pfaq", `${head(y3.pFaq.kicker, y3.pFaq.title, "")}
      ${faqList(y3.pFaq.items, "2")}`, { rule: true })}
    ${block("lvs-global", `${headSplit(gq.kicker, gq.title, gq.lead)}
      ${feats(gq.items, 3, { mod: "card" })}
      <p class="lvs-more-link"><a class="lvs-link" href="/${e(lang)}/contact/?type=partnership&amp;platform=livon">${e(gq.cta)} ${arrow}</a></p>`, { band: true })}
    <div class="nls-block nls-close nls-block--ink lvs-close">
      <p class="nls-kicker">Partnership</p>
      <h2 class="nls-hero__title">${nl(p.heroTitle)}</h2>
      <div class="nls-actions"><a class="nls-btn lvs-btn-point" href="/${e(lang)}/contact/?type=partnership">${e(p.f.cta)} →</a><a class="nls-btn nls-btn--ghost" href="/${e(lang)}/business/contact/?type=general&amp;platform=livon">${e(x.ctaSecond)}</a></div>
    </div>`;
  return shell(lang, "partnerships", "lvs-partnerships-title", textHero(lang, "Partnerships", p.heroTitle, p.heroLead, "lvs-partnerships-title"), body);
}

/* ════════════════════════ 05 Contact ════════════════════════ */
export function renderContact(lang) {
  const c = siteCopy(lang);
  const k = c.contact;
  const groups = Object.entries(CONTACT_GROUPS).map(([gid, g]) => {
    const rows = CONTACT_TYPES.filter((y) => y.g === gid).map((y) => {
      const label = pick(lang, y.ko, y.en);
      return `<li class="lvs-contact__item"><div><strong>${e(label)}</strong><p>${e(k.subjectLabel)} · [LIVON] ${e(label)}</p></div><a class="lvs-link" href="/${e(lang)}/contact/?type=${e(y.type)}" aria-label="${e(label)} — ${e(k.go)}">${e(k.go)} ${arrow}</a></li>`;
    }).join("");
    return `<section class="lvs-cgroup" aria-labelledby="lvs-cgroup-${gid}">
      <header class="lvs-cgroup__head"><span class="lvs-feats__i">${icon(CONTACT_ICON[gid] || "mail")}</span><h3 id="lvs-cgroup-${gid}" class="lvs-cgroup__title">${e(pick(lang, g.ko, g.en))}</h3><span class="lvs-count">${CONTACT_TYPES.filter((y) => y.g === gid).length}</span></header>
      <ol class="lvs-clist">${rows}</ol>
    </section>`;
  }).join("");
  const x = c30(lang).contact;
  const purposes = x.items.map(([id, t, what, include]) => {
    const href = CONTACT_PURPOSE_HREF[id](lang);
    const mail = href.startsWith("mailto:");
    return `<article class="lvs-biz lvs-purpose" id="lvs-purpose-${e(id)}">
      <span class="lvs-feats__i">${icon(CONTACT_PURPOSE_ICON[id])}</span>
      <div class="lvs-purpose__copy">
        <h3>${e(t)}</h3>
        <p class="lvs-biz__what">${e(what)}</p>
        ${dl([[x.f.include, e(include)]])}
        <a class="lvs-link lvs-biz__cta" href="${e(href)}">${e(mail ? "newon@newon.app" : x.f.go)} ${arrow}</a>
      </div>
    </article>`;
  }).join("");
  const y3 = v3(lang);
  const ch = y3.channels;
  const CH_HREF = { unified: `/${lang}/contact/?type=support`, business: `/${lang}/business/contact/?type=general&platform=livon`, mail: "mailto:newon@newon.app" };
  const CH_ICON = { unified: "chat", business: "building", mail: "mail", none: "info" };
  const channels = ch.items.map(([id, t, b]) => {
    const href = CH_HREF[id];
    return `<li class="lvs-chan${href ? "" : " is-off"}" data-chan="${e(id)}"><span class="lvs-feats__i">${icon(CH_ICON[id])}</span><h3>${e(t)}</h3><p>${e(b)}</p>${href ? `<a class="lvs-link" href="${e(href)}">${e(href.startsWith("mailto:") ? "newon@newon.app" : ch.go)} ${arrow}</a>` : ""}</li>`;
  }).join("");
  const body = `
    ${block("lvs-contact", `${head(k.kicker, k.title, "")}
      <div class="lvs-cgroups">${groups}</div>`)}
    ${block("lvs-purpose", `${headSplit(x.purposeKicker, x.purposeTitle, x.purposeLead)}
      <p class="lvs-notice lvs-notice--strong">${icon("shield", "lvs-notice__i")}<span>${e(x.privacy)}</span></p>
      <div class="lvs-purposes">${purposes}</div>`, { band: true })}
    ${block("lvs-channels", `${headSplit(ch.kicker, ch.title, ch.lead)}
      <ul class="lvs-chans">${channels}</ul>`, { rule: true })}
    ${block("lvs-contact-tips", `${head("Before you write", k.tipsTitle, "")}
      <div class="lvs-tips">
        <ul class="lvs-list">${k.tips.map((t) => `<li>${e(t)}</li>`).join("")}</ul>
        <div class="lvs-notes">
          ${k.note ? `<p class="lvs-notice">${icon("info", "lvs-notice__i")}<span>${e(k.note)}</span></p>` : ""}
          <p class="lvs-notice">${icon("building", "lvs-notice__i")}<span>${e(k.bizNote)} <a href="/${e(lang)}/business/inquiry/">NEWON Business →</a></span></p>
          <p class="lvs-notice">${icon("mail", "lvs-notice__i")}<span>${e(x.mailNote)} · <a href="mailto:newon@newon.app">newon@newon.app</a></span></p>
        </div>
      </div>`, { rule: true })}
    ${block("lvs-cfaq", `${head(y3.cFaq.kicker, y3.cFaq.title, "")}
      ${faqList(y3.cFaq.items, "2")}`, { rule: true })}`;
  return shell(lang, "contact", "lvs-contact-title", textHero(lang, "Contact", k.heroTitle, k.heroLead, "lvs-contact-title"), body);
}

export const LIVON_SITE_RENDERERS = {
  overview: renderOverview,
  platform: renderPlatform,
  business: renderBusiness,
  partnerships: renderPartnerships,
  contact: renderContact,
};
