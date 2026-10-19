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
  siteCopy,
  isKo,
} from "./livon-site-data.mjs";

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
          <a class="nls-btn" href="/livon/">${e(c.tryWeb)} →</a>
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
/* status pill — yellow-ink outline for what runs today, dashed for plans and concepts */
const status = (lang, key) => {
  const s = STATUS[key] || STATUS.planned;
  return `<p class="lvs-pill lvs-pill--${e(key)}">${e(pick(lang, s.ko, s.en))}</p>`;
};

/* ── simple line icons (inline SVG, 24×24, stroke = currentColor; decorative only) ── */
const ICON_PATHS = {
  path: '<path d="M4 19c3-6 6-2 8-7s5-6 8-7"/><circle cx="4" cy="19" r="1.6"/><circle cx="20" cy="5" r="1.6"/>',
  feed: '<rect x="4" y="4" width="16" height="16"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  route: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6"/>',
  spark: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  doc: '<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  building: '<path d="M4 21V5l8-2v18M12 21V9l8 2v10M3 21h18M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17"/>',
  users: '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3.5 19c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5M14.5 14.3c2.6-.4 4.8.9 5.8 4.2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13"/><path d="M4 6.5l8 6 8-6"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.4"/>',
  book: '<path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/>',
  home: '<path d="M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  coin: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l8-8"/>',
  shield: '<path d="M12 3.5l7 2.5v5.5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  grid: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
  handshake: '<path d="M3 11l4-4 4 2 3-2 4 1 3 3"/><path d="M7 7v6l4 4c.8.8 2 .8 2.8 0l4.2-4.2V8"/><path d="M11 13l2 2M13 11l2 2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};
const icon = (name, cls = "lvs-ico") =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ICON_PATHS.spark}</svg>`;
const GROUP_ICON = { A: "book", B: "doc", C: "coin", D: "heart", E: "leaf" };
const CORE_ICON = ["path", "feed", "search", "person", "chat", "route", "spark", "doc"];
const CA_ICON = ["users", "spark", "shield"];
const TRACK_ICON = ["person", "building", "shield", "globe"];
const CONTACT_ICON = { svc: "chat", info: "book", biz: "handshake" };

/* numbered list with a square yellow-ink number — replaces the black hover roster */
const points = (rows, mod = "") =>
  `<ol class="lvs-points${mod ? ` lvs-points--${mod}` : ""}">${rows.map(([n, t]) => `<li><span class="lvs-points__n">${e(n)}</span><p>${t}</p></li>`).join("")}</ol>`;
/* check list — same content as a numbered roster, with a check mark instead of a number */
const checks = (rows) =>
  `<ul class="lvs-checks">${rows.map((t) => `<li>${icon("check", "lvs-checks__i")}<p>${t}</p></li>`).join("")}</ul>`;

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

const leadNote = (t) => `<p class="lvs-notice">${icon("info", "lvs-notice__i")}<span>${e(t)}</span></p>`;

/* 02 — split (headline / numbered principles) + stat tiles on a pale yellow wash */
function vision(lang) {
  const c = siteCopy(lang);
  const v = c.overview.vision;
  const facts = c.stats.map(([n, k]) => `<li><strong>${e(n)}</strong><span>${e(k)}</span></li>`).join("");
  return `<div id="lvs-vision" class="nls-block lvs-sec" data-lvs-section="02">
    <div class="nls-split">
      ${head(v.kicker, v.title, v.lead)}
      ${points(v.points.map(([k, t], i) => [pad(i + 1), `<b>${e(k)}</b> ${e(t)}`]))}
    </div>
    <ul class="lvs-facts">${facts}</ul>
  </div>`;
}

/* 03 — horizontal timeline (vertical on mobile) */
function lifeJourney(lang) {
  const c = siteCopy(lang).overview.journey;
  const items = JOURNEY.map(
    (j, i) => `<li class="lvs-tl__item lvs-chapter">
      <p class="lvs-tl__age"><span>${pad(i + 1)}</span> ${e(pick(lang, j.ageKo, j.ageEn))}</p>
      <h3>${e(pick(lang, j.ko, j.en))}</h3>
      <p>${e(pick(lang, j.bodyKo, j.bodyEn))}</p>
      <ul class="lvs-tags">${j.areas.map((a) => `<li><b>${e(a)}</b> ${e(pick(lang, groupOf(a).ko, groupOf(a).en))}</li>`).join("")}</ul>
    </li>`
  ).join("");
  return `<div id="lvs-journey" class="nls-block nls-block--band lvs-wash" data-lvs-section="03">
    ${head(c.kicker, c.title, c.lead)}
    <ol class="lvs-tl">${items}</ol>
  </div>`;
}

/* 04 — decade rail (existing interactive component; recoloured in CSS) */
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
  return `<div id="lvs-stage" class="nls-block nls-journey-sec lvs-sec" data-lvs-section="04">
    ${head(c.kicker, c.title, c.lead)}
    <div class="nls-rail" role="group" aria-label="${e(life.hero.pathLabel)}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    <p class="nls-note">${e(life.ui.journeyNote)}</p>
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
    .map((k) => `<li class="lvs-legend--${k}"><i aria-hidden="true"></i>${e(pick(lang, STATUS[k].ko, STATUS[k].en))}</li>`)
    .join("")}</ul>`;
}

/* 05 — tabbed explorer + highlighted 40-cell map (tabs and hits in yellow) */
function explorer(lang) {
  const c = siteCopy(lang).overview.events;
  const first = LIFE_EVENTS[0];
  const tabs = LIFE_EVENTS.map(
    (ev, i) => `<button type="button" class="lvs-ex__tab${i === 0 ? " is-on" : ""}" data-lvs-event="${e(ev.id)}" aria-pressed="${i === 0 ? "true" : "false"}"><em>${pad(i + 1)}</em><span>${e(pick(lang, ev.ko, ev.en))}</span></button>`
  ).join("");
  const panels = LIFE_EVENTS.map((ev, i) => {
    const rel = ev.cats.map((n) => `<li><a href="${e(catHref(lang, n))}"><span>${e(n)}</span><strong>${e(pick(lang, byN[n].ko, byN[n].en))}</strong>${icon("arrow", "lvs-rel__i")}</a></li>`).join("");
    return `<article class="lvs-event${i === 0 ? " is-on" : ""}" id="lvs-event-${e(ev.id)}" data-lvs-event-panel="${e(ev.id)}" data-cats="${e(ev.cats.join(" "))}">
      <p class="lvs-event__n">${pad(i + 1)}</p>
      <h3>${e(pick(lang, ev.ko, ev.en))}</h3>
      <p class="lvs-event__lead">${e(pick(lang, ev.tagKo, ev.tagEn))}</p>
      <p class="lvs-k">${e(c.related)}</p>
      <ol class="lvs-rel">${rel}</ol>
      <p class="lvs-k">${e(c.check)}</p>
      <ul class="nls-chips">${pick(lang, ev.checkKo, ev.checkEn).map((t) => `<li>${e(t)}</li>`).join("")}</ul>
    </article>`;
  }).join("");
  return `<div id="lvs-events" class="nls-block nls-block--band lvs-wash" data-lvs-section="05">
    ${head(c.kicker, c.title, c.lead)}
    <p class="lvs-pill lvs-pill--concept">${e(pick(lang, "구조 예시", "Structure example"))}</p>
    ${note(c.note)}
    <div class="lvs-ex" data-lvs-explorer>
      <div class="lvs-ex__tabs" role="group" aria-label="${e(c.kicker)}" hidden>${tabs}</div>
      <div class="lvs-ex__body">
        <div class="lvs-ex__panels" aria-live="polite">${panels}</div>
        <div class="lvs-ex__map">
          <p class="lvs-k">${e(c.mapLabel)}</p>
          ${lifeMap(lang, first.cats, c.mapLabel)}
          ${legend(lang)}
        </div>
      </div>
    </div>
  </div>`;
}

/* 06 / 07 — two area panels, each with a letter monogram + a directory of 8 categories */
function areaSection(lang, id, sec, key, gids, band) {
  const c = siteCopy(lang).overview[key];
  const cols = gids.map((gid) => {
    const g = groupOf(gid);
    const rows = CATEGORIES.filter((x) => x.g === gid)
      .map((x) => `<li><span>${e(x.n)}</span><div><strong><a href="${e(catHref(lang, x.n))}">${e(pick(lang, x.ko, x.en))}</a></strong><p>${e(pick(lang, x.lineKo, x.lineEn))}</p></div><i class="lvs-mark lvs-mark--${e(categoryStatus(x))}" title="${e(pick(lang, STATUS[categoryStatus(x)].ko, STATUS[categoryStatus(x)].en))}"></i></li>`)
      .join("");
    return `<section class="lvs-area" aria-labelledby="lvs-area-${gid}">
      <header class="lvs-area__head">
        <span class="lvs-mono" aria-hidden="true">${icon(GROUP_ICON[gid])}<b>${e(gid)}</b></span>
        <div>
          <p class="nls-kicker">${e(gid)} · ${e(g.en)} · ${e(g.range)}</p>
          <h3 id="lvs-area-${gid}">${e(pick(lang, g.ko, g.en))}</h3>
          <p>${e(pick(lang, g.leadKo, g.leadEn))}</p>
        </div>
      </header>
      <ol class="lvs-dir">${rows}</ol>
    </section>`;
  }).join("");
  return `<div id="${id}" class="nls-block${band ? " nls-block--band lvs-wash" : " lvs-sec"}" data-lvs-section="${sec}">
    ${head(c.kicker, c.title, c.lead)}
    <div class="lvs-cols${band ? " lvs-cols--cards" : ""}">${cols}</div>
    ${legend(lang)}
  </div>`;
}

/* 08 — bento: one large tile + two stacked tiles */
function communityAi(lang) {
  const c = siteCopy(lang).overview.ca;
  const items = c.items
    .map(([t, sub, body, st], i) => `<article class="lvs-bento__item${i === 0 ? " lvs-bento__item--lg" : ""}">
      <span class="lvs-tile-ico">${icon(CA_ICON[i])}</span>
      <p class="lvs-bento__n">${pad(i + 1)}</p>
      <h3>${e(t)}</h3>
      <p><b>${e(sub)}</b></p>
      <p>${e(body)}</p>
      ${status(lang, st)}
    </article>`)
    .join("");
  return `<div id="lvs-community" class="nls-block lvs-sec" data-lvs-section="08">
    ${head(c.kicker, c.title, "")}
    <div class="lvs-bento">${items}</div>
  </div>`;
}

/* 09 — four audience tiles + split (NEWON text / app list) */
function ecosystem(lang) {
  const c = siteCopy(lang).overview.eco;
  const tracks = c.tracks.map(([t, b], i) => `<li><span class="lvs-tile-ico">${icon(TRACK_ICON[i])}</span><p class="lvs-aud__n">${pad(i + 1)}</p><strong>${e(t)}</strong><p>${e(b)}</p></li>`).join("");
  const apps = [["LIVON", c.livon]].concat(Object.values(NEWON_APPS).map((a) => [a.name, pick(lang, a.ko, a.en)]));
  const dir = apps.map(([n, t], i) => `<li${i === 0 ? ' class="is-self"' : ""}><span>${pad(i + 1)}</span><div><strong>${e(n)}</strong><p>${e(t)}</p></div></li>`).join("");
  return `<div id="lvs-ecosystem" class="nls-block nls-block--band lvs-wash" data-lvs-section="09">
    ${head(c.kicker, c.title, c.lead)}
    <ol class="lvs-aud">${tracks}</ol>
    <div class="nls-split lvs-gap">
      <div>
        <header class="nls-head"><h3 class="lvs-h3">${e(c.newonTitle)}</h3><p class="nls-lead">${e(c.newonLead)}</p></header>
        ${pick(lang, PLATFORM_EXAMPLES.ko, PLATFORM_EXAMPLES.en).map((t) => `<p class="lvs-quote">${e(t)}</p>`).join("")}
      </div>
      <ol class="lvs-apps">${dir}</ol>
    </div>
  </div>`;
}

/* 10 — closing ink band with one yellow call to action */
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
      <a class="nls-btn lvs-btn-point" href="/livon/">${e(c.tryWeb)} →</a>
      ${links}
    </div>
  </div>`;
}

export function renderOverview(lang) {
  const c = siteCopy(lang);
  const body = `
    ${leadNote(c.notice)}
    ${vision(lang)}
    ${lifeJourney(lang)}
    ${lifeStage(lang)}
    ${explorer(lang)}
    ${areaSection(lang, "lvs-daily", "06", "daily", ["B", "C"], false)}
    ${areaSection(lang, "lvs-family", "07", "family", ["D", "E"], true)}
    ${communityAi(lang)}
    ${ecosystem(lang)}
    ${nextStep(lang)}`;
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
      ? `<a class="lvs-link" href="${e(pageHref(lang, "contact"))}">${e(f.ctaPlanned)} →</a>`
      : `<a class="lvs-link" href="/livon/">${e(f.ctaWeb)} →</a>`;
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
  /* core features — icon cards, 4 × 2 */
  const core = CORE_FEATURES.map(
    (x, i) => `<article class="lvs-core" data-status="${e(x.st)}">
      <div class="lvs-core__top"><span class="lvs-tile-ico">${icon(CORE_ICON[i])}</span><span class="lvs-core__n">${pad(i + 1)}</span></div>
      <h3>${e(x.en)}${isKo(lang) ? ` <small>${e(x.ko)}</small>` : ""}</h3>
      <p>${e(pick(lang, x.nowKo, x.nowEn))}</p>
      ${status(lang, x.st)}
    </article>`
  ).join("");
  const jump = GROUPS.map((g) => `<li><a href="#lvs-group-${e(g.id)}"><b>${e(g.id)}</b><span>${icon(GROUP_ICON[g.id])}</span><strong>${e(pick(lang, g.ko, g.en))}</strong><em>${e(g.range)}</em></a></li>`).join("");
  /* each area — sticky side header (letter + title + lead) beside a 2-column card grid */
  const groups = GROUPS.map((g) => {
    const cards = CATEGORIES.filter((x) => x.g === g.id).map((x) => categoryCard(lang, x)).join("");
    return `<section class="lvs-group" id="lvs-group-${e(g.id)}" aria-labelledby="lvs-group-${e(g.id)}-t">
      <header class="lvs-group__head">
        <span class="lvs-group__letter" aria-hidden="true">${e(g.id)}</span>
        <p class="nls-kicker">${e(g.en)} · ${e(g.range)}</p>
        <h3 class="lvs-group__title" id="lvs-group-${e(g.id)}-t">${e(pick(lang, g.ko, g.en))}</h3>
        <p class="nls-lead">${e(pick(lang, g.leadKo, g.leadEn))}</p>
      </header>
      <div class="lvs-cats">${cards}</div>
    </section>`;
  }).join("");
  const body = `
    ${leadNote(c.notice)}
    <div id="lvs-core" class="nls-block lvs-sec">
      ${head(p.coreKicker, p.coreTitle, "")}
      <div class="lvs-corelist">${core}</div>
    </div>
    <div id="lvs-map" class="nls-block nls-block--band lvs-wash">
      ${head(p.groupsKicker, p.groupsTitle, p.groupsLead)}
      <nav class="lvs-jump" aria-label="${e(p.groupsTitle)}"><ul>${jump}</ul></nav>
      ${lifeMap(lang, [], p.groupsTitle)}
      ${legend(lang)}
    </div>
    <div id="lvs-groups" class="nls-block lvs-sec">${groups}</div>
    <div id="lvs-official" class="nls-block nls-block--band lvs-wash">
      <div class="lvs-callout">
        <span class="lvs-callout__ico">${icon("shield")}</span>
        ${head(p.officialKicker, p.officialTitle, "")}
        ${points(p.officialItems.map(([k, v], i) => [pad(i + 1), `<b>${e(k)}</b> ${e(v)}`]), "grid")}
      </div>
    </div>`;
  return shell(lang, "platform", "lvs-platform-title", textHero(lang, "Platform", p.heroTitle, p.heroLead, "lvs-platform-title"), body);
}

/* ════════════════════════ 03 Business ════════════════════════ */
export function renderBusiness(lang) {
  const c = siteCopy(lang);
  const b = c.business;
  /* 15 areas — cards on a pale wash, fields in a 2-column definition grid */
  const cards = BUSINESS.map((x) => {
    const d = pick(lang, x.ko2, x.en2);
    return `<article class="lvs-biz" id="lvs-biz-${e(x.n)}" data-status="${e(x.st)}">
      <div class="lvs-biz__top"><span class="lvs-biz__n">${e(x.n)}</span>${status(lang, x.st)}</div>
      <h3>${e(pick(lang, x.ko, x.en))} <small>${e(x.en)}</small></h3>
      <p class="lvs-biz__what">${e(d.what)}</p>
      ${dl([
        [b.f.who, e(d.who)],
        [b.f.value, e(d.value)],
        [b.f.rev, e(d.rev)],
        [b.f.partners, e(d.partners)],
        [b.f.rule, e(d.rule)],
      ])}
      <a class="lvs-link lvs-biz__cta" href="/${e(lang)}/contact/?type=business">${e(b.f.cta)} →</a>
    </article>`;
  }).join("");
  const revRows = REVENUE.map(
    (r) => `<tr><th scope="row">${e(pick(lang, r.ko, r.en))}</th><td data-label="${e(b.revCols[1])}">${e(pick(lang, r.whoKo, r.whoEn))}</td><td data-label="${e(b.revCols[2])}">${e(pick(lang, r.howKo, r.howEn))}</td><td data-label="${e(b.revCols[3])}"><span class="lvs-pill lvs-pill--concept">${e(b.revStatus)}</span></td></tr>`
  ).join("");
  const stLabel = { now: b.roadNow, next: b.roadNext, later: b.roadLater };
  /* roadmap — vertical timeline; the current step is filled yellow */
  const road = ROADMAP.map(
    (r) => `<li class="lvs-road__step" data-st="${e(r.st)}">
      <span class="lvs-road__n">${e(pad(r.n))}</span>
      <div class="lvs-road__copy">
        <p class="lvs-pill lvs-pill--${r.st === "now" ? "now" : "later"}">${e(stLabel[r.st])}</p>
        <h3>${e(pick(lang, r.ko, r.en))}</h3>
        <p>${e(pick(lang, r.bodyKo, r.bodyEn))}</p>
      </div>
    </li>`
  ).join("");
  const body = `
    <div id="lvs-verdict" class="nls-block lvs-sec">
      <div class="lvs-verdict">
        <p class="nls-kicker">Principle</p>
        <h2 class="nls-title">${e(b.verdictTitle)}</h2>
        ${points([["01", e(b.verdictBody)], ["02", e(pick(lang, "고객별 맞춤 외주가 아니라 표준화된 자체 솔루션과 플랫폼 제품을 만듭니다.", "Standard products and our own platform — not custom client work."))], ["03", e(b.revNote)]], "row")}
      </div>
    </div>
    <div id="lvs-biz" class="nls-block nls-block--band lvs-wash">
      ${head(b.kicker, b.title, b.lead)}
      <div class="lvs-bizgrid">${cards}</div>
    </div>
    <div id="lvs-revenue" class="nls-block lvs-sec">
      ${head(b.revKicker, b.revTitle, "")}
      <p class="lvs-pill lvs-pill--concept">${e(b.revStatus)}</p>
      <div class="lvs-table-wrap"><table class="lvs-table">
        <thead><tr>${b.revCols.map((t) => `<th scope="col">${e(t)}</th>`).join("")}</tr></thead>
        <tbody>${revRows}</tbody>
      </table></div>
    </div>
    <div id="lvs-roadmap" class="nls-block nls-block--band lvs-wash">
      <div class="nls-split">
        ${head(b.roadKicker, b.roadTitle, "")}
        <ol class="lvs-road">${road}</ol>
      </div>
    </div>
    <div id="lvs-rules" class="nls-block lvs-sec">
      ${head(b.ruleKicker, b.ruleTitle, "")}
      ${checks(b.ruleItems.map((t) => e(t)))}
    </div>`;
  return shell(lang, "business", "lvs-business-title", textHero(lang, "Business", b.heroTitle, b.heroLead, "lvs-business-title"), body);
}

/* ════════════════════════ 04 Partnerships ════════════════════════ */
export function renderPartnerships(lang) {
  const c = siteCopy(lang);
  const p = c.partnerships;
  const pc = pick(lang, PARTNER_COMMON.ko, PARTNER_COMMON.en);
  const byP = Object.fromEntries(PARTNERS.map((x) => [x.n, x]));
  const card = (x) => `<article class="lvs-partner${x.official ? " is-source" : ""}" id="lvs-partner-${e(x.n)}">
      <div class="lvs-cat__meta"><span class="lvs-cat__n">${e(x.n)}</span><span class="lvs-cat__en">${e(x.en)}</span></div>
      <h4>${e(pick(lang, x.ko, x.en))}</h4>
      <p>${e(pick(lang, x.whatKo, x.whatEn))}</p>
      ${x.official ? `<p class="lvs-pill lvs-pill--concept">${e(p.f.officialTag)}</p>` : ""}
    </article>`;
  const groups = PARTNER_GROUPS.map(
    (g, gi) => `<section class="lvs-pgroup" aria-labelledby="lvs-pgroup-${gi}">
      <h3 id="lvs-pgroup-${gi}" class="lvs-pgroup__title">${e(pick(lang, g.ko, g.en))} <span>${g.ids.length}</span></h3>
      <div class="lvs-partners">${g.ids.map((n) => card(byP[n])).join("")}</div>
    </section>`
  ).join("");
  const steps = pick(lang, PARTNER_STEPS.ko, PARTNER_STEPS.en)
    .map(([t, b], i) => `<li class="lvs-steps__item${i === 0 ? " is-on" : ""}"><span class="lvs-steps__n">${pad(i + 1)}</span><h3>${e(t)}</h3><p>${e(b)}</p></li>`)
    .join("");
  const terms = [
    [p.f.value, pc.value],
    [p.f.rev, pc.rev],
    [p.f.cond, pc.cond],
    [p.f.officialTag, `${pc.officialRev} ${pc.officialCond}`],
  ]
    .map(([k, v], i) => `<div><dt><span>${pad(i + 1)}</span>${e(k)}</dt><dd>${e(v)}</dd></div>`)
    .join("");
  const body = `
    <div id="lvs-partners" class="nls-block lvs-sec">
      ${head(p.kicker, p.title, "")}
      ${note(p.sourceNote)}
      ${groups}
    </div>
    <div id="lvs-terms" class="nls-block nls-block--band lvs-wash">
      <div class="nls-split">
        <header class="nls-head"><p class="nls-kicker">Terms</p><h2 class="nls-title">${e(p.sourceTitle)}</h2></header>
        <dl class="lvs-terms">${terms}</dl>
      </div>
    </div>
    <div id="lvs-steps" class="nls-block lvs-sec">
      ${head(p.stepsKicker, p.stepsTitle, "")}
      <ol class="lvs-steps">${steps}</ol>
    </div>
    <div class="nls-block nls-close nls-block--ink lvs-close">
      <p class="nls-kicker">Partnership</p>
      <h2 class="nls-hero__title">${nl(p.heroTitle)}</h2>
      <div class="nls-actions"><a class="nls-btn lvs-btn-point" href="/${e(lang)}/contact/?type=partnership">${e(p.f.cta)} →</a></div>
    </div>`;
  return shell(lang, "partnerships", "lvs-partnerships-title", textHero(lang, "Partnerships", p.heroTitle, p.heroLead, "lvs-partnerships-title"), body);
}

/* ════════════════════════ 05 Contact ════════════════════════ */
export function renderContact(lang) {
  const c = siteCopy(lang);
  const k = c.contact;
  let i = 0;
  const groups = Object.entries(CONTACT_GROUPS).map(([gid, g]) => {
    const rows = CONTACT_TYPES.filter((x) => x.g === gid).map((x) => {
      const label = pick(lang, x.ko, x.en);
      i += 1;
      return `<li class="lvs-contact__item"><span>${pad(i)}</span><div><strong>${e(label)}</strong><p>${e(k.subjectLabel)} · [LIVON] ${e(label)}</p></div><a class="lvs-link" href="/${e(lang)}/contact/?type=${e(x.type)}">${e(k.go)} →</a></li>`;
    }).join("");
    return `<section class="lvs-cgroup" aria-labelledby="lvs-cgroup-${gid}">
      <header class="lvs-cgroup__head"><span class="lvs-tile-ico">${icon(CONTACT_ICON[gid] || "mail")}</span><h3 id="lvs-cgroup-${gid}" class="lvs-pgroup__title">${e(pick(lang, g.ko, g.en))}</h3></header>
      <ol class="lvs-clist">${rows}</ol>
    </section>`;
  }).join("");
  const body = `
    <div id="lvs-contact" class="nls-block lvs-sec">
      ${head(k.kicker, k.title, "")}
      <div class="lvs-cgroups">${groups}</div>
    </div>
    <div id="lvs-contact-tips" class="nls-block nls-block--band lvs-wash">
      <div class="nls-split">
        <header class="nls-head"><p class="nls-kicker">Before you write</p><h2 class="nls-title">${e(k.tipsTitle)}</h2></header>
        ${points(k.tips.map((t, j) => [pad(j + 1), e(t)]))}
      </div>
      <div class="lvs-notes">
        ${k.note ? `<p class="lvs-notice">${icon("info", "lvs-notice__i")}<span>${e(k.note)}</span></p>` : ""}
        <p class="lvs-notice">${icon("building", "lvs-notice__i")}<span>${e(k.bizNote)} <a href="/${e(lang)}/business/inquiry/">NEWON Business →</a></span></p>
      </div>
    </div>`;
  return shell(lang, "contact", "lvs-contact-title", textHero(lang, "Contact", k.heroTitle, k.heroLead, "lvs-contact-title"), body);
}

export const LIVON_SITE_RENDERERS = {
  overview: renderOverview,
  platform: renderPlatform,
  business: renderBusiness,
  partnerships: renderPartnerships,
  contact: renderContact,
};
