/**
 * LIVON corporate site — page bodies for /{lang}/livon/ (Overview) and its four sub pages
 * (platform/, business/, partnerships/, contact/). One topic per page:
 *   01 Overview      brand story — why, before/after, mission & vision, journey, life stage,
 *                    a person's journey, principles, direction, place in NEWON, links
 *   02 Platform      app tabs, 8 core features, anonymous mode, life-event explorer,
 *                    40 categories, market (in preparation), official info, FAQ
 *   03 Business      principle, two tracks, 15 areas in 5 groups, models table, revenue,
 *                    roadmap, operating principles
 *   04 Partnerships  why partner, 20 types in 5 groups, sources vs partners, principles,
 *                    process, FAQ
 *   05 Contact       14 inquiry types (table), NEWON contact, notes, FAQ, closing
 * Information only: no forms, no storage, no personalisation. Styles: /livon-site.css (scoped to .lvs)
 * on top of the Life Stage styles (/home-lifestage.css, /home-lifestage-layout.css, scoped to .nls).
 */
import { escapeHtml } from "./hub-utils.mjs";
import { renderFlagshipSubnav } from "./flagship-subnav.mjs";
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
  CORE_TAGS,
  BUSINESS,
  BIZ_GROUPS,
  BIZ_TAGS,
  MODELS,
  ROADMAP,
  JOURNEY,
  PLATFORM_EXAMPLES,
  PARTNER_GROUPS,
  PARTNER_STEPS,
  PARTNER_TAGS,
  CONTACT_GROUPS,
  PARTNERS,
  CONTACT_TYPES,
  SUBNAV_I18N,
  siteCopy,
  isKo,
} from "./livon-site-data.mjs";

const FILM = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_102608_5fa1187d-9ac6-44fb-82ab-54376200abc0.mp4";
const NEWON_EMAIL = "newon@newon.app";

const e = (s) => escapeHtml(s == null ? "" : String(s));
const nl = (s) => e(s).replace(/\n/g, "<br>");
const pick = (lang, ko, en) => (isKo(lang) ? ko : en);
const pair = (lang, arr) => (isKo(lang) ? arr[0] : arr[1]);

export function pageHref(lang, id) {
  const p = LIVON_SITE_PAGES.find((x) => x.id === id);
  return `/${lang}/livon/${p ? p.path : ""}`;
}

function pageLabel(lang, p) {
  if (isKo(lang)) return p.ko;
  const t = SUBNAV_I18N[lang];
  return (t && t[p.id]) || p.en;
}

function head(kicker, title, lead, id = "") {
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${e(kicker)}</p>` : ""}
    <h2 class="nls-title"${id ? ` id="${e(id)}"` : ""}>${nl(title)}</h2>
    ${lead ? `<p class="nls-lead">${e(lead)}</p>` : ""}
  </header>`;
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

function shell(lang, active, titleId, hero, body) {
  return `<section id="lifestage-detail" class="nls lvs" data-story="lifestage" data-lvs-page="${e(active)}" aria-labelledby="${e(titleId)}">
    ${hero}
  ${renderFlagshipSubnav({ biz: "livon", lang, active })}
  <div class="nls__wrap">
    ${body}
  </div>
</section>`;
}

const byN = Object.fromEntries(CATEGORIES.map((x) => [x.n, x]));
const pad = (i) => String(i).padStart(2, "0");
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const catHref = (lang, n) => `${pageHref(lang, "platform")}#lvs-cat-${n}`;
const note = (t) => (t ? `<p class="nls-note">${e(t)}</p>` : "");
const stLabel = (lang, key) => {
  const s = STATUS[key] || STATUS.planned;
  return pick(lang, s.ko, s.en);
};
const status = (lang, key) => `<p class="nls-status lvs-st lvs-st--${e(key)}">${e(stLabel(lang, key))}</p>`;
const chip = (lang, key) => `<span class="lvs-chip lvs-st--${e(key)}">${e(stLabel(lang, key))}</span>`;
const roster = (rows) =>
  `<ol class="nls-roster">${rows.map(([n, t]) => `<li><span>${e(n)}</span><p>${t}</p></li>`).join("")}</ol>`;
const sec = (id, n, cls, inner) => `<div id="${e(id)}" class="nls-block${cls ? ` ${cls}` : ""}" data-lvs-section="${e(n)}">${inner}</div>`;

/** Responsive table: rows stack into labelled blocks on narrow screens. */
function rtable(cols, rows, cls = "") {
  const th = cols.map((t) => `<th scope="col">${e(t)}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${r.map((cell, i) => (i === 0 ? `<th scope="row">${cell}</th>` : `<td data-label="${e(cols[i])}">${cell}</td>`)).join("")}</tr>`)
    .join("");
  return `<div class="lvs-rt-wrap"><table class="lvs-rt${cls ? ` ${cls}` : ""}"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/** Checklist (square tick + title + body). */
function checklist(items, cls = "") {
  return `<ul class="lvs-check${cls ? ` ${cls}` : ""}">${items
    .map((it) => (Array.isArray(it) ? `<li><i aria-hidden="true"></i><div><strong>${e(it[0])}</strong><p>${e(it[1])}</p></div></li>` : `<li><i aria-hidden="true"></i><div><p>${e(it)}</p></div></li>`))
    .join("")}</ul>`;
}

/** FAQ accordion. */
function faq(items) {
  return `<div class="lvs-faq">${items
    .map(([q, a], i) => `<details class="lvs-faq__item"${i === 0 ? " open" : ""}><summary><span class="lvs-faq__n">${pad(i + 1)}</span><span class="lvs-faq__q">${e(q)}</span></summary><p>${e(a)}</p></details>`)
    .join("")}</div>`;
}

/** Ink closing block with actions. */
function closing(kicker, title, lead, actions) {
  return `<div class="nls-block nls-close nls-block--ink lvs-close" data-lvs-section="close">
    ${kicker ? `<p class="nls-kicker">${e(kicker)}</p>` : ""}
    <h2 class="nls-hero__title">${nl(title)}</h2>
    ${lead ? `<p class="nls-lead">${e(lead)}</p>` : ""}
    <div class="nls-actions">${actions}</div>
  </div>`;
}

/* ════════════════════════ 01 Overview — brand story ════════════════════════ */
/** First screen: the shared dark film hero (same video + component on every LIVON page). */
function filmHero({ titleHtml, lead, note: sub, id, actions, compact }) {
  return `<div class="nls-film${compact ? " lvs-film--compact" : ""}" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${FILM}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark">LIVON</p>
        <h1 id="${e(id)}" class="nls-film__slogan">${titleHtml}</h1>
        <p class="nls-film__lead">${e(lead)}</p>
        ${sub ? `<p class="nls-film__lead lvs-film__note">${e(sub)}</p>` : ""}
        <div class="nls-film__actions">${actions}</div>
      </div>
    </div>
  </div>`;
}

function overviewHero(lang) {
  const c = siteCopy(lang).overview;
  return filmHero({
    titleHtml: c.heroTitleHtml,
    lead: c.heroLead,
    id: "lvs-overview-title",
    actions: `<a class="nls-btn" href="${e(pageHref(lang, "platform"))}">${e(c.heroCta)} →</a>
          <a class="nls-btn nls-btn--ghost" href="${e(pageHref(lang, "contact"))}">${e(siteCopy(lang).toContact)}</a>`,
  });
}

/** Sub-page first screen: the same film hero, compact, with the page's own headline and lead. */
function subHero(lang, kicker, title, lead, titleId, main) {
  const c = siteCopy(lang);
  return filmHero({
    titleHtml: `<span class="lvs-film__k">${e(kicker)}</span>${nl(title)}`,
    lead,
    note: c.appStatus,
    id: titleId,
    compact: true,
    actions: `<a class="nls-btn" href="${e(main[1])}">${e(main[0])} →</a>
          <a class="nls-btn nls-btn--ghost" href="${e(pageHref(lang, "contact"))}">${e(c.toContact)}</a>`,
  });
}

/* 02 — editorial big-type statement */
function why(lang) {
  const c = siteCopy(lang);
  const w = c.overview.why;
  return sec("lvs-why", "02", "lvs-manifesto", `
    <p class="nls-kicker">${e(w.kicker)} · ${e(c.positioning)}</p>
    <h2 class="lvs-statement">${nl(w.statement)}</h2>
    <div class="lvs-manifesto__body">${w.body.map((t) => `<p>${e(t)}</p>`).join("")}</div>
    <ol class="lvs-marks">${w.marks.map(([k, t], i) => `<li><span>${pad(i + 1)}</span><strong>${e(k)}</strong><p>${e(t)}</p></li>`).join("")}</ol>`);
}

/* 03 — before / after comparison */
function problem(lang) {
  const p = siteCopy(lang).overview.problem;
  return sec("lvs-problem", "03", "nls-block--band", `
    ${head(p.kicker, p.title, "")}
    ${rtable(p.cols, p.rows.map(([k, a, b]) => [e(k), e(a), `<b>${e(b)}</b>`]), "lvs-rt--compare")}`);
}

/* 04 — mission & vision */
function vision(lang) {
  const v = siteCopy(lang).overview.vision;
  const facts = v.facts.map(([n, k]) => `<li><strong>${e(n)}</strong><span>${e(k)}</span></li>`).join("");
  return sec("lvs-vision", "04", "nls-why-sec", `
    <p class="nls-kicker">${e(v.kicker)}</p>
    <div class="lvs-mv">
      <div class="lvs-mv__line"><p class="lvs-mv__k">${e(v.missionLabel)}</p><h2 class="lvs-mv__t">${e(v.mission)}</h2></div>
      <div class="lvs-mv__line"><p class="lvs-mv__k">${e(v.visionLabel)}</p><p class="lvs-mv__t">${e(v.vision)}</p></div>
    </div>
    ${roster(v.points.map(([k, t], i) => [pad(i + 1), `<b>${e(k)}</b> ${e(t)}`]))}
    <ul class="lvs-facts">${facts}</ul>
    ${note(v.factsNote)}`);
}

/* 05 — horizontal journey timeline */
function lifeJourney(lang) {
  const c = siteCopy(lang).overview.journey;
  const items = JOURNEY.map(
    (j, i) => `<li class="lvs-tl__item">
      <span class="lvs-tl__dot" aria-hidden="true"></span>
      <p class="lvs-tl__age">${pad(i + 1)} · ${e(pick(lang, j.ageKo, j.ageEn))}</p>
      <h3>${e(pick(lang, j.ko, j.en))}</h3>
      <p class="lvs-tl__q">“${e(c.questions[i])}”</p>
      <p>${e(pick(lang, j.bodyKo, j.bodyEn))}</p>
    </li>`
  ).join("");
  return sec("lvs-journey", "05", "nls-block--band", `
    ${head(c.kicker, c.title, c.lead)}
    <ol class="lvs-tl">${items}</ol>`);
}

/* 06 — Life Stage rail (interactive, from the existing Life Stage page) */
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
  return sec("lvs-stage", "06", "nls-journey-sec", `
    ${head(c.kicker, c.title, c.lead)}
    <div class="nls-rail" role="group" aria-label="${e(life.hero.pathLabel)}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    <p class="nls-note">${e(life.ui.journeyNote)}</p>`);
}

/* 07 — a person's journey (process stepper with example) */
function personFlow(lang) {
  const f = siteCopy(lang).overview.flow;
  const steps = f.steps
    .map(([t, d, ex], i) => `<li class="lvs-step">
      <p class="lvs-step__n">${pad(i + 1)}</p>
      <h3>${e(t)}</h3>
      <p>${e(d)}</p>
      <p class="lvs-step__ex"><span>${e(f.exampleLabel)}</span>${e(ex)}</p>
    </li>`)
    .join("");
  return sec("lvs-flow", "07", "nls-how-sec", `
    ${head(f.kicker, f.title, f.lead)}
    <ol class="lvs-stepper">${steps}</ol>`);
}

/* 08 — principles checklist */
function principles(lang) {
  const p = siteCopy(lang).overview.principles;
  return sec("lvs-principles", "08", "nls-block--band", `
    <div class="lvs-side">
      ${head(p.kicker, p.title, "")}
      ${checklist(p.items, "lvs-check--2")}
    </div>`);
}

/* 09 — direction (now / next / later) */
function direction(lang) {
  const d = siteCopy(lang).overview.direction;
  const rows = d.items
    .map(([when, t, b, st]) => `<li class="lvs-hz__row">
      <p class="lvs-hz__when">${e(when)}</p>
      <div><h3>${e(t)}</h3><p>${e(b)}</p></div>
      ${chip(lang, st)}
    </li>`)
    .join("");
  return sec("lvs-direction", "09", "", `
    ${head(d.kicker, d.title, d.lead)}
    <ol class="lvs-hz">${rows}</ol>`);
}

/* 10 — LIVON inside NEWON (split: centre block + app directory) */
function inNewon(lang) {
  const c = siteCopy(lang).overview.newon;
  const dir = Object.values(NEWON_APPS)
    .map((a, i) => `<li><span>${pad(i + 1)}</span><div><strong>${e(a.name)}</strong><p>${e(pick(lang, a.ko, a.en))}</p></div></li>`)
    .join("");
  return sec("lvs-newon", "10", "nls-block--band", `
    ${head(c.kicker, c.title, c.lead)}
    <div class="lvs-hub">
      <div class="lvs-hub__core"><p class="nls-kicker">NEWON · ${e(c.center)}</p><p class="lvs-hub__name">LIVON</p><p>${e(c.livon)}</p></div>
      <ol class="nls-dir lvs-hub__dir">${dir}</ol>
    </div>
    <div class="lvs-hub__ex">${pick(lang, PLATFORM_EXAMPLES.ko, PLATFORM_EXAMPLES.en).map((t) => `<p class="nls-note">${e(t)}</p>`).join("")}</div>`);
}

/* small strip linking to the other four pages */
function nextStrip(lang) {
  const n = siteCopy(lang).overview.next;
  const links = LIVON_SITE_PAGES.filter((p) => p.id !== "overview")
    .map((p) => `<li><a href="${e(pageHref(lang, p.id))}"><span>${e(p.n)}</span><strong>${e(p.en)}</strong>${lang === "en" ? "" : `<em>${e(pageLabel(lang, p))}</em>`}<i aria-hidden="true">→</i></a></li>`)
    .join("");
  return `<div id="lvs-next" class="nls-block lvs-strip" data-lvs-section="11">
    <p class="nls-kicker">${e(n.kicker)}</p>
    <h2 class="lvs-h2s">${e(n.title)}</h2>
    <ul class="lvs-strip__list">${links}</ul>
  </div>`;
}

export function renderOverview(lang) {
  const body = `
    ${why(lang)}
    ${problem(lang)}
    ${vision(lang)}
    ${lifeJourney(lang)}
    ${lifeStage(lang)}
    ${personFlow(lang)}
    ${principles(lang)}
    ${direction(lang)}
    ${inNewon(lang)}
    ${nextStrip(lang)}`;
  return shell(lang, "overview", "lvs-overview-title", overviewHero(lang), body);
}

/* ════════════════════════ 02 Platform ════════════════════════ */
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

function appTabs(lang) {
  const t = siteCopy(lang).platform.tabs;
  const bar = t.items.map(([ko, en, , st], i) => `<li class="${i === 0 ? "is-on" : ""}${st === "preparing" ? " is-prep" : ""}"><i aria-hidden="true"></i><span>${e(isKo(lang) ? ko : en)}</span></li>`).join("");
  const rows = t.items
    .map(([ko, en, d, st], i) => `<li><span>${pad(i + 1)}</span><div><strong>${e(isKo(lang) ? ko : en)}${isKo(lang) ? ` <small>${e(en)}</small>` : ""}</strong><p>${e(d)}</p></div>${chip(lang, st)}</li>`)
    .join("");
  return sec("lvs-tabs", "02", "", `
    <div class="lvs-split2">
      <div>
        ${head(t.kicker, t.title, t.lead)}
        <ol class="lvs-tablist">${rows}</ol>
      </div>
      <figure class="lvs-phone" aria-hidden="true">
        <div class="lvs-phone__screen">
          <p class="lvs-phone__brand">LIVON</p>
          <p class="lvs-phone__line"></p><p class="lvs-phone__line lvs-phone__line--s"></p>
          <div class="lvs-phone__cards"><span></span><span></span><span></span><span></span></div>
        </div>
        <ol class="lvs-phone__bar">${bar}</ol>
        <figcaption>${e(t.phoneNote)}</figcaption>
      </figure>
    </div>`);
}

function coreFeatures(lang) {
  const p = siteCopy(lang).platform;
  const rows = CORE_FEATURES.map(
    (x, i) => `<li class="lvs-row lvs-core" data-status="${e(x.st)}">
      <span class="lvs-row__n">${pad(i + 1)}</span>
      <div class="lvs-row__t"><h3>${e(x.en)}</h3>${isKo(lang) ? `<p class="lvs-row__sub">${e(x.ko)}</p>` : ""}</div>
      <div class="lvs-row__d"><p>${e(pick(lang, x.nowKo, x.nowEn))}</p><p class="lvs-row__tags"><span>${e(p.tagsLabel)}</span>${pair(lang, CORE_TAGS[i]).map((t) => `<em>${e(t)}</em>`).join("")}</p></div>
      ${chip(lang, x.st)}
    </li>`
  ).join("");
  return sec("lvs-core", "03", "nls-block--band", `
    ${head(p.coreKicker, p.coreTitle, p.coreLead)}
    <ol class="lvs-rows">${rows}</ol>`);
}

function anonMode(lang) {
  const a = siteCopy(lang).platform.anon;
  return sec("lvs-anon", "04", "", `
    ${head(a.kicker, a.title, a.lead)}
    ${rtable(a.cols, a.rows.map(([f, l, s, st]) => [e(f), e(l), e(s), chip(lang, st)]), "lvs-rt--anon")}
    ${note(a.note)}`);
}

function explorer(lang) {
  const c = siteCopy(lang).platform.events;
  const first = LIFE_EVENTS[0];
  const tabs = LIFE_EVENTS.map(
    (ev, i) => `<button type="button" class="lvs-ex__tab${i === 0 ? " is-on" : ""}" data-lvs-event="${e(ev.id)}" aria-pressed="${i === 0 ? "true" : "false"}"><em>${pad(i + 1)}</em><span>${e(pick(lang, ev.ko, ev.en))}</span></button>`
  ).join("");
  const panels = LIFE_EVENTS.map((ev, i) => {
    const rel = ev.cats.map((n) => `<li><a href="${e(catHref(lang, n))}"><span>${e(n)}</span><strong>${e(pick(lang, byN[n].ko, byN[n].en))}</strong></a></li>`).join("");
    return `<article class="lvs-event${i === 0 ? " is-on" : ""}" id="lvs-event-${e(ev.id)}" data-lvs-event-panel="${e(ev.id)}" data-cats="${e(ev.cats.join(" "))}">
      <p class="nls-decade__n">${pad(i + 1)}</p>
      <h3>${e(pick(lang, ev.ko, ev.en))}</h3>
      <p class="nls-decade__lead">${e(pick(lang, ev.tagKo, ev.tagEn))}</p>
      <p class="lvs-k">${e(c.related)}</p>
      <ol class="nls-index lvs-rel">${rel}</ol>
      <p class="lvs-k">${e(c.check)}</p>
      <ul class="nls-chips">${pick(lang, ev.checkKo, ev.checkEn).map((t) => `<li>${e(t)}</li>`).join("")}</ul>
    </article>`;
  }).join("");
  return sec("lvs-events", "05", "nls-block--band", `
    ${head(c.kicker, c.title, c.lead)}
    <p class="nls-status">${e(c.tag)}</p>
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
    </div>`);
}

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
  return `<article class="nls-board__item lvs-cat" id="lvs-cat-${e(x.n)}" data-status="${e(st)}">
    <div class="nls-board__meta"><span class="nls-board__n">${e(x.n)}</span><span class="lvs-cat__en">${e(x.en)}</span></div>
    <h4>${e(pick(lang, x.ko, x.en))}</h4>
    <p class="lvs-cat__line">${e(pick(lang, x.lineKo, x.lineEn))}</p>
    <p>${e(pick(lang, x.introKo, x.introEn))}</p>
    ${chips(pick(lang, x.topicsKo, x.topicsEn))}
    ${nt ? `<p class="lvs-cat__note">${e(f.note)} · ${e(nt)}</p>` : ""}
    <details class="lvs-more">
      <summary>${e(f.more)}</summary>
      <div class="lvs-more__m"><p>${e(pick(lang, x.introKo, x.introEn))}</p>${chips(pick(lang, x.topicsKo, x.topicsEn))}${nt ? `<p class="lvs-cat__note">${e(nt)}</p>` : ""}</div>
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

function categories(lang) {
  const c = siteCopy(lang);
  const p = c.platform;
  const jump = GROUPS.map((g) => `<li><a href="#lvs-group-${e(g.id)}"><span>${e(g.id)}</span><strong>${e(pick(lang, g.ko, g.en))}</strong><em>${e(g.range)}</em></a></li>`).join("");
  const groups = GROUPS.map((g) => {
    const cards = CATEGORIES.filter((x) => x.g === g.id).map((x) => categoryCard(lang, x)).join("");
    return `<section class="lvs-band" id="lvs-group-${e(g.id)}" aria-labelledby="lvs-group-${e(g.id)}-t">
      <header class="lvs-band__head">
        <p class="lvs-band__id">${e(g.id)}</p>
        <p class="nls-kicker">${e(g.en)} · ${e(g.range)}</p>
        <h3 class="lvs-band__title" id="lvs-group-${e(g.id)}-t">${e(pick(lang, g.ko, g.en))}</h3>
        <p>${e(pick(lang, g.leadKo, g.leadEn))}</p>
      </header>
      <div class="nls-board lvs-board--cats">${cards}</div>
    </section>`;
  }).join("");
  return `<div id="lvs-map" class="nls-block" data-lvs-section="06">
      ${head(p.groupsKicker, p.groupsTitle, p.groupsLead)}
      <p class="nls-note lvs-lead-note">${e(c.notice)}</p>
      <nav class="lvs-jump" aria-label="${e(p.groupsTitle)}"><ul>${jump}</ul></nav>
      ${lifeMap(lang, [], p.groupsTitle)}
      ${legend(lang)}
    </div>
    <div id="lvs-groups" class="nls-block lvs-bands">${groups}</div>`;
}

function market(lang) {
  const m = siteCopy(lang).platform.market;
  return sec("lvs-market", "07", "nls-block--band", `
    <div class="lvs-split2 lvs-split2--even">
      <div>
        ${head(m.kicker, m.title, m.lead)}
        <p class="nls-status lvs-st--preparing">${e(stLabel(lang, "preparing"))}</p>
        <p class="lvs-market__share"><a class="lvs-link" href="/${e(lang)}/shareon/">${e(m.shareon)} →</a></p>
      </div>
      <div class="lvs-duo">
        <section class="lvs-duo__col" aria-labelledby="lvs-market-do"><h3 id="lvs-market-do">${e(m.doTitle)}</h3>${checklist(m.doItems)}</section>
        <section class="lvs-duo__col lvs-duo__col--no" aria-labelledby="lvs-market-no"><h3 id="lvs-market-no">${e(m.dontTitle)}</h3>${checklist(m.dontItems, "lvs-check--no")}</section>
      </div>
    </div>`);
}

function officialInfo(lang) {
  const p = siteCopy(lang).platform;
  return sec("lvs-official", "08", "nls-why-sec", `
    <div class="nls-split">
      ${head(p.officialKicker, p.officialTitle, "")}
      ${roster(p.officialItems.map(([k, v], i) => [pad(i + 1), `<b>${e(k)}</b> ${e(v)}`]))}
    </div>
    ${note(siteCopy(lang).disclaimer)}`);
}

export function renderPlatform(lang) {
  const c = siteCopy(lang);
  const p = c.platform;
  const body = `
    ${appTabs(lang)}
    ${coreFeatures(lang)}
    ${anonMode(lang)}
    ${explorer(lang)}
    ${categories(lang)}
    ${market(lang)}
    ${officialInfo(lang)}
    ${sec("lvs-faq", "09", "nls-block--band", `<div class="lvs-side">${head(p.faq.kicker, p.faq.title, "")}${faq(p.faq.items)}</div>`)}`;
  return shell(lang, "platform", "lvs-platform-title", subHero(lang, "Platform", p.heroTitle, p.heroLead, "lvs-platform-title", [pick(lang, "40개 분야 보기", "See the 40 categories"), "#lvs-map"]), body);
}

/* ════════════════════════ 03 Business ════════════════════════ */
export function renderBusiness(lang) {
  const c = siteCopy(lang);
  const b = c.business;
  const byB = Object.fromEntries(BUSINESS.map((x) => [x.n, x]));
  const area = (x) => {
    const d = pick(lang, x.ko2, x.en2);
    return `<li class="lvs-row lvs-biz" id="lvs-biz-${e(x.n)}" data-status="${e(x.st)}">
      <span class="lvs-row__n">${e(x.n)}</span>
      <div class="lvs-row__t"><h4>${e(pick(lang, x.ko, x.en))}</h4>${isKo(lang) ? `<p class="lvs-row__sub">${e(x.en)}</p>` : ""}</div>
      <div class="lvs-row__d">
        <p>${e(d.what)}</p>
        <p class="lvs-row__tags"><span>${e(b.f.tags)}</span>${pair(lang, BIZ_TAGS[x.n]).map((t) => `<em>${e(t)}</em>`).join("")}</p>
        <details class="lvs-more">
          <summary>${e(b.f.more)}</summary>
          ${dl([[b.f.who, e(d.who)], [b.f.value, e(d.value)], [b.f.rev, e(d.rev)], [b.f.partners, e(d.partners)], [b.f.rule, e(d.rule)]])}
        </details>
      </div>
      ${chip(lang, x.st)}
    </li>`;
  };
  const groups = BIZ_GROUPS.map(
    (g, gi) => `<section class="lvs-band" id="lvs-bizgroup-${e(g.id)}" aria-labelledby="lvs-bizgroup-${e(g.id)}-t">
      <header class="lvs-band__head">
        <p class="lvs-band__id">${ROMAN[gi]}</p>
        <p class="nls-kicker">${e(g.en)} · ${g.ids.length}</p>
        <h3 class="lvs-band__title" id="lvs-bizgroup-${e(g.id)}-t">${e(pick(lang, g.ko, g.en))}</h3>
        <p>${e(pick(lang, g.leadKo, g.leadEn))}</p>
      </header>
      <ol class="lvs-rows lvs-rows--tight">${g.ids.map((n) => area(byB[n])).join("")}</ol>
    </section>`
  ).join("");
  const tracks = b.tracks.items
    .map(([k, t, d, list, st]) => `<article class="lvs-track">
      <p class="lvs-track__k">${e(k)}</p>
      <h3>${e(t)}</h3>
      <p>${e(d)}</p>
      ${chips(list)}
      ${chip(lang, st)}
    </article>`)
    .join("");
  const models = rtable(
    b.models.cols,
    MODELS.map((m) => [e(pick(lang, m.ko, m.en)), e(pick(lang, m.whoKo, m.whoEn)), e(pick(lang, m.valueKo, m.valueEn)), e(pick(lang, m.howKo, m.howEn)), chip(lang, m.st)]),
    "lvs-rt--models"
  );
  const lane = { now: b.roadNow, next: b.roadNext, later: b.roadLater };
  const road = ROADMAP.map(
    (r) => `<article class="nls-lane__item lvs-road__step" data-st="${e(r.st)}">
      <span class="nls-lane__n">${e(pad(r.n))}</span>
      <div class="nls-lane__copy">
        <h3>${e(pick(lang, r.ko, r.en))}</h3>
        <p>${e(pick(lang, r.bodyKo, r.bodyEn))}</p>
      </div>
      <p class="nls-status${r.st === "now" ? " is-now" : ""}">${e(lane[r.st])}</p>
    </article>`
  ).join("");
  const rv = b.revenue;
  const body = `
    ${sec("lvs-verdict", "02", "lvs-manifesto", `
      <p class="nls-kicker">${e(b.verdict.kicker)}</p>
      <h2 class="lvs-statement">${nl(b.verdict.title)}</h2>
      ${roster(b.verdict.items.map((t, i) => [pad(i + 1), e(t)]))}`)}
    ${sec("lvs-tracks", "03", "nls-block--band", `
      ${head(b.tracks.kicker, b.tracks.title, "")}
      <div class="lvs-tracks">${tracks}</div>`)}
    ${sec("lvs-biz", "04", "lvs-bands", `
      ${head(b.kicker, b.title, b.lead)}
      ${groups}`)}
    ${sec("lvs-models", "05", "nls-block--band", `
      ${head(b.models.kicker, b.models.title, b.models.lead)}
      ${models}`)}
    ${sec("lvs-revenue", "06", "", `
      <div class="lvs-split2">
        <div>
          <p class="nls-kicker">${e(rv.kicker)}</p>
          <h2 class="nls-title">${nl(rv.title)}</h2>
          <div class="lvs-prose">${rv.body.map((t) => `<p>${e(t)}</p>`).join("")}</div>
        </div>
        <aside class="lvs-aside" aria-labelledby="lvs-caveats-t"><h3 id="lvs-caveats-t">${e(rv.caveatsTitle)}</h3>${checklist(rv.caveats)}</aside>
      </div>`)}
    ${sec("lvs-roadmap", "07", "nls-block--band nls-expand-sec", `
      ${head(b.roadKicker, b.roadTitle, "")}
      <div class="nls-lane">${road}</div>`)}
    ${sec("lvs-rules", "08", "", `
      <div class="lvs-side">
        ${head(b.ruleKicker, b.ruleTitle, "")}
        ${checklist(b.ruleItems, "lvs-check--2")}
      </div>
      ${note(c.disclaimer)}`)}
    ${closing("Business", b.close.title, b.close.lead, `<a class="nls-btn" href="/${e(lang)}/contact/?type=business">${e(b.f.cta)} →</a><a class="nls-btn nls-btn--ghost" href="${e(pageHref(lang, "contact"))}">${e(c.toContact)}</a>`)}`;
  return shell(lang, "business", "lvs-business-title", subHero(lang, "Business", b.heroTitle, b.heroLead, "lvs-business-title", [pick(lang, "사업 영역 보기", "See the business areas"), "#lvs-biz"]), body);
}

/* ════════════════════════ 04 Partnerships ════════════════════════ */
export function renderPartnerships(lang) {
  const c = siteCopy(lang);
  const p = c.partnerships;
  const byP = Object.fromEntries(PARTNERS.map((x) => [x.n, x]));
  const row = (x) => `<li class="lvs-row lvs-partner${x.official ? " is-source" : ""}" id="lvs-partner-${e(x.n)}">
      <span class="lvs-row__n">${e(x.n)}</span>
      <div class="lvs-row__t"><h4>${e(pick(lang, x.ko, x.en))}</h4>${isKo(lang) ? `<p class="lvs-row__sub">${e(x.en)}</p>` : ""}</div>
      <div class="lvs-row__d"><p>${e(pick(lang, x.whatKo, x.whatEn))}</p><p class="lvs-row__tags">${pair(lang, PARTNER_TAGS[x.n]).map((t) => `<em>${e(t)}</em>`).join("")}</p></div>
      ${x.official ? `<span class="lvs-chip lvs-st--source">${e(p.f.officialTag)}</span>` : chip(lang, "review")}
    </li>`;
  const groups = PARTNER_GROUPS.map(
    (g, gi) => `<section class="lvs-band" aria-labelledby="lvs-pgroup-${gi}">
      <header class="lvs-band__head">
        <p class="lvs-band__id">${ROMAN[gi]}</p>
        <p class="nls-kicker">${e(g.en)} · ${g.ids.length}</p>
        <h3 class="lvs-band__title" id="lvs-pgroup-${gi}">${e(pick(lang, g.ko, g.en))}</h3>
      </header>
      <ol class="lvs-rows lvs-rows--tight">${g.ids.map((n) => row(byP[n])).join("")}</ol>
    </section>`
  ).join("");
  const steps = pick(lang, PARTNER_STEPS.ko, PARTNER_STEPS.en)
    .map(([t, b], i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}"><p class="nls-pipe__n">${pad(i + 1)}</p><h3>${e(t)}</h3><p>${e(b)}</p></article>`)
    .join("");
  const why = p.why.items.map(([k, t], i) => `<li><span>${pad(i + 1)}</span><strong>${e(k)}</strong><p>${e(t)}</p></li>`).join("");
  const body = `
    ${sec("lvs-why-partner", "02", "lvs-manifesto", `
      <p class="nls-kicker">${e(p.why.kicker)}</p>
      <h2 class="lvs-statement lvs-statement--m">${nl(p.why.title)}</h2>
      <ol class="lvs-marks lvs-marks--4">${why}</ol>`)}
    ${sec("lvs-partners", "03", "nls-block--band lvs-bands", `
      ${head(p.kicker, p.title, p.lead)}
      ${groups}`)}
    ${sec("lvs-terms", "04", "", `
      ${head(p.terms.kicker, p.terms.title, p.terms.lead)}
      ${rtable(p.terms.cols, p.terms.rows.map(([k, a, b]) => [e(k), e(a), `<b>${e(b)}</b>`]), "lvs-rt--compare")}`)}
    ${sec("lvs-pprinciples", "05", "nls-block--band", `
      <div class="lvs-side">
        ${head(p.principles.kicker, p.principles.title, "")}
        ${checklist(p.principles.items, "lvs-check--2")}
      </div>`)}
    ${sec("lvs-steps", "06", "nls-how-sec", `
      ${head(p.stepsKicker, p.stepsTitle, "")}
      <div class="nls-pipe lvs-pipe--5">${steps}</div>`)}
    ${sec("lvs-pfaq", "07", "nls-block--band", `<div class="lvs-side">${head(p.faq.kicker, p.faq.title, "")}${faq(p.faq.items)}</div>`)}
    ${closing(p.close.kicker, p.close.title, "", `<a class="nls-btn" href="/${e(lang)}/contact/?type=partnership">${e(p.f.cta)} →</a><a class="nls-btn nls-btn--ghost" href="${e(pageHref(lang, "contact"))}">${e(c.toContact)}</a>`)}`;
  return shell(lang, "partnerships", "lvs-partnerships-title", subHero(lang, "Partnerships", p.heroTitle, p.heroLead, "lvs-partnerships-title", [pick(lang, "협력 유형 보기", "See partnership types"), "#lvs-partners"]), body);
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
      return `<tr class="lvs-contact__item">
        <td class="lvs-ct__n" data-label="${e(k.cols[0])}">${pad(i)}</td>
        <th scope="row">${e(label)}</th>
        <td data-label="${e(k.cols[2])}">${e(pick(lang, x.forKo, x.forEn))}</td>
        <td data-label="${e(k.cols[3])}"><code>[LIVON] ${e(label)}</code></td>
        <td class="lvs-ct__go"><a class="lvs-link" href="/${e(lang)}/contact/?type=${e(x.type)}">${e(k.go)} →</a></td>
      </tr>`;
    }).join("");
    return `<tbody><tr class="lvs-ct__group"><th colspan="5" scope="rowgroup">${e(pick(lang, g.ko, g.en))}</th></tr>${rows}</tbody>`;
  }).join("");
  const ch = k.channel;
  const body = `
    ${sec("lvs-contact", "02", "", `
      ${head(k.kicker, k.title, k.lead)}
      <div class="lvs-rt-wrap"><table class="lvs-rt lvs-ct">
        <thead><tr>${k.cols.map((t) => `<th scope="col">${e(t)}</th>`).join("")}</tr></thead>
        ${groups}
      </table></div>`)}
    ${sec("lvs-channel", "03", "nls-block--band", `
      <div class="lvs-split2 lvs-split2--even">
        ${head(ch.kicker, ch.title, ch.lead)}
        <dl class="lvs-channel">
          <div><dt>${e(ch.emailLabel)}</dt><dd><a class="lvs-channel__mail" href="mailto:${NEWON_EMAIL}">${NEWON_EMAIL}</a></dd></div>
          <div><dt>${e(ch.formLabel)}</dt><dd><a class="nls-btn" href="/${e(lang)}/contact/">${e(ch.formCta)} →</a></dd></div>
          <div><dt>${e(ch.bizLabel)}</dt><dd><a class="lvs-link" href="/${e(lang)}/business/inquiry/">${e(ch.bizCta)} →</a></dd></div>
        </dl>
      </div>`)}
    ${sec("lvs-contact-tips", "04", "", `
      <div class="lvs-duo lvs-duo--wide">
        <section class="lvs-duo__col" aria-labelledby="lvs-tips-t"><h2 class="lvs-h2s" id="lvs-tips-t">${e(k.tipsTitle)}</h2>${checklist(k.tips)}</section>
        <section class="lvs-duo__col lvs-duo__col--no" aria-labelledby="lvs-limits-t"><h2 class="lvs-h2s" id="lvs-limits-t">${e(k.limitsTitle)}</h2>${checklist(k.limits, "lvs-check--no")}</section>
      </div>
      ${note(c.disclaimer)}`)}
    ${sec("lvs-cfaq", "05", "nls-block--band", `<div class="lvs-side">${head(k.faq.kicker, k.faq.title, "")}${faq(k.faq.items)}</div>`)}
    ${closing(k.close.kicker, k.close.title, "", `<a class="nls-btn" href="/${e(lang)}/contact/">${e(ch.formCta)} →</a><a class="nls-btn nls-btn--ghost" href="mailto:${NEWON_EMAIL}">${NEWON_EMAIL}</a>`)}`;
  return shell(lang, "contact", "lvs-contact-title", subHero(lang, "Contact", k.heroTitle, k.heroLead, "lvs-contact-title", [pick(lang, "문의 유형 보기", "See inquiry types"), "#lvs-contact"]), body);
}

export const LIVON_SITE_RENDERERS = {
  overview: renderOverview,
  platform: renderPlatform,
  business: renderBusiness,
  partnerships: renderPartnerships,
  contact: renderContact,
};
