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

function textHero(lang, kicker, title, lead, titleId) {
  const c = siteCopy(lang);
  return `<div class="nls-block nls-close nls-block--ink lvs-top">
    <p class="nls-kicker">${e(c.brand)} · ${e(kicker)}</p>
    <h1 class="nls-hero__title" id="${e(titleId)}">${nl(title)}</h1>
    <p class="nls-lead">${e(lead)}</p>
    <p class="nls-note">${e(c.appStatus)}</p>
  </div>`;
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
const groupOf = (id) => GROUPS.find((g) => g.id === id);
const pad = (i) => String(i).padStart(2, "0");
const catHref = (lang, n) => `${pageHref(lang, "platform")}#lvs-cat-${n}`;
const note = (t) => (t ? `<p class="nls-note">${e(t)}</p>` : "");
const status = (lang, key) => {
  const s = STATUS[key] || STATUS.planned;
  return `<p class="nls-status lvs-st lvs-st--${e(key)}">${e(pick(lang, s.ko, s.en))}</p>`;
};
const roster = (rows) =>
  `<ol class="nls-roster">${rows.map(([n, t]) => `<li><span>${e(n)}</span><p>${t}</p></li>`).join("")}</ol>`;

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

function vision(lang) {
  const c = siteCopy(lang);
  const v = c.overview.vision;
  const facts = c.stats.map(([n, k]) => `<li><strong>${e(n)}</strong><span>${e(k)}</span></li>`).join("");
  return `<div id="lvs-vision" class="nls-block nls-why-sec" data-lvs-section="02">
    <div class="nls-split">
      ${head(v.kicker, v.title, v.lead)}
      ${roster(v.points.map(([k, t], i) => [pad(i + 1), `<b>${e(k)}</b> ${e(t)}`]))}
    </div>
    <ul class="lvs-facts">${facts}</ul>
  </div>`;
}

function lifeJourney(lang) {
  const c = siteCopy(lang).overview.journey;
  const items = JOURNEY.map(
    (j, i) => `<article class="nls-board__item lvs-chapter">
      <div class="nls-board__meta"><span class="nls-board__n">${pad(i + 1)}</span><span class="lvs-chapter__age">${e(pick(lang, j.ageKo, j.ageEn))}</span></div>
      <h3>${e(pick(lang, j.ko, j.en))}</h3>
      <p>${e(pick(lang, j.bodyKo, j.bodyEn))}</p>
      <ul class="nls-chips">${j.areas.map((a) => `<li>${e(a)} ${e(pick(lang, groupOf(a).ko, groupOf(a).en))}</li>`).join("")}</ul>
    </article>`
  ).join("");
  return `<div id="lvs-journey" class="nls-block nls-block--band" data-lvs-section="03">
    ${head(c.kicker, c.title, c.lead)}
    <div class="nls-board lvs-board--5">${items}</div>
  </div>`;
}

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
  return `<div id="lvs-stage" class="nls-block nls-journey-sec" data-lvs-section="04">
    ${head(c.kicker, c.title, c.lead)}
    <div class="nls-rail" role="group" aria-label="${e(life.hero.pathLabel)}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    <p class="nls-note">${e(life.ui.journeyNote)}</p>
  </div>`;
}

/** 40-cell map: 5 rows (areas) × 8 categories, hairline grid like the Life Stage rail. */
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

function explorer(lang) {
  const c = siteCopy(lang).overview.events;
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
  return `<div id="lvs-events" class="nls-block nls-block--band" data-lvs-section="05">
    ${head(c.kicker, c.title, c.lead)}
    <p class="nls-status">${e(pick(lang, "구조 예시", "Structure example"))}</p>
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

function areaSection(lang, id, sec, key, gids, band) {
  const c = siteCopy(lang).overview[key];
  const cols = gids.map((gid) => {
    const g = groupOf(gid);
    const rows = CATEGORIES.filter((x) => x.g === gid)
      .map((x) => `<li><span>${e(x.n)}</span><div><strong><a href="${e(catHref(lang, x.n))}">${e(pick(lang, x.ko, x.en))}</a></strong><p>${e(pick(lang, x.lineKo, x.lineEn))}</p></div><i class="lvs-mark lvs-mark--${e(categoryStatus(x))}" title="${e(pick(lang, STATUS[categoryStatus(x)].ko, STATUS[categoryStatus(x)].en))}"></i></li>`)
      .join("");
    return `<section class="lvs-area" aria-labelledby="lvs-area-${gid}">
      <header class="lvs-area__head">
        <p class="nls-kicker">${e(gid)} · ${e(g.en)} · ${e(g.range)}</p>
        <h3 id="lvs-area-${gid}">${e(pick(lang, g.ko, g.en))}</h3>
        <p>${e(pick(lang, g.leadKo, g.leadEn))}</p>
      </header>
      <ol class="nls-dir lvs-dir">${rows}</ol>
    </section>`;
  }).join("");
  return `<div id="${id}" class="nls-block${band ? " nls-block--band" : ""}" data-lvs-section="${sec}">
    ${head(c.kicker, c.title, c.lead)}
    <div class="lvs-cols">${cols}</div>
    ${legend(lang)}
  </div>`;
}

function communityAi(lang) {
  const c = siteCopy(lang).overview.ca;
  const items = c.items
    .map(([t, sub, body, st], i) => `<article class="nls-flow__item">
      <span class="nls-flow__n">${pad(i + 1)}</span>
      <h3>${e(t)}</h3>
      <p><b>${e(sub)}</b></p>
      <p>${e(body)}</p>
      ${status(lang, st)}
    </article>`)
    .join("");
  return `<div id="lvs-community" class="nls-block nls-pillars-sec" data-lvs-section="08">
    ${head(c.kicker, c.title, "")}
    <div class="nls-flow">${items}</div>
  </div>`;
}

function ecosystem(lang) {
  const c = siteCopy(lang).overview.eco;
  const tracks = c.tracks.map(([t, b], i) => `<li><span>${pad(i + 1)}</span><strong>${e(t)} — ${e(b)}</strong></li>`).join("");
  const apps = [["LIVON", c.livon]].concat(Object.values(NEWON_APPS).map((a) => [a.name, pick(lang, a.ko, a.en)]));
  const dir = apps.map(([n, t], i) => `<li><span>${pad(i + 1)}</span><div><strong>${e(n)}</strong><p>${e(t)}</p></div></li>`).join("");
  return `<div id="lvs-ecosystem" class="nls-block nls-block--band nls-related-sec" data-lvs-section="09">
    ${head(c.kicker, c.title, c.lead)}
    <ol class="nls-index">${tracks}</ol>
    <div class="nls-split lvs-gap">
      <div>
        <header class="nls-head"><h3 class="lvs-h3">${e(c.newonTitle)}</h3><p class="nls-lead">${e(c.newonLead)}</p></header>
        ${pick(lang, PLATFORM_EXAMPLES.ko, PLATFORM_EXAMPLES.en).map((t) => `<p class="nls-note">${e(t)}</p>`).join("")}
      </div>
      <ol class="nls-dir">${dir}</ol>
    </div>
  </div>`;
}

function nextStep(lang) {
  const c = siteCopy(lang);
  const n = c.overview.next;
  const links = LIVON_SITE_PAGES.filter((p) => p.id !== "overview")
    .map((p) => `<a class="nls-btn nls-btn--ghost" href="${e(pageHref(lang, p.id))}">${e(p.en)}${lang === "en" ? "" : ` · ${e(pageLabel(lang, p))}`}</a>`)
    .join("");
  return `<div id="lvs-next" class="nls-block nls-close nls-block--ink" data-lvs-section="10">
    <p class="nls-kicker">${e(n.kicker)}</p>
    <h2 class="nls-hero__title">${nl(n.title)}</h2>
    <p class="nls-lead">${e(n.lead)}</p>
    <p class="nls-note">${e(c.appStatus)}</p>
    <div class="nls-actions">
      <a class="nls-btn" href="/livon/">${e(c.tryWeb)} →</a>
      ${links}
    </div>
  </div>`;
}

export function renderOverview(lang) {
  const c = siteCopy(lang);
  const body = `
    <p class="nls-note lvs-lead-note">${e(c.notice)}</p>
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
  return `<article class="nls-board__item lvs-cat" id="lvs-cat-${e(x.n)}" data-status="${e(st)}">
    <div class="nls-board__meta"><span class="nls-board__n">${e(x.n)}</span><span class="lvs-cat__en">${e(x.en)}</span></div>
    <h4>${e(pick(lang, x.ko, x.en))}</h4>
    <p class="lvs-cat__line">${e(pick(lang, x.lineKo, x.lineEn))}</p>
    <p>${e(pick(lang, x.introKo, x.introEn))}</p>
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
  const core = CORE_FEATURES.map(
    (x, i) => `<article class="nls-proc__item lvs-core" data-status="${e(x.st)}">
      <span class="nls-proc__n">${pad(i + 1)}</span>
      <h3>${e(x.en)}${isKo(lang) ? ` <small>${e(x.ko)}</small>` : ""}</h3>
      <p>${e(pick(lang, x.nowKo, x.nowEn))}</p>
      ${status(lang, x.st)}
    </article>`
  ).join("");
  const jump = GROUPS.map((g) => `<li><a href="#lvs-group-${e(g.id)}"><span>${e(g.id)}</span><strong>${e(pick(lang, g.ko, g.en))}</strong><em>${e(g.range)}</em></a></li>`).join("");
  const groups = GROUPS.map((g) => {
    const cards = CATEGORIES.filter((x) => x.g === g.id).map((x) => categoryCard(lang, x)).join("");
    return `<section class="lvs-group" id="lvs-group-${e(g.id)}" aria-labelledby="lvs-group-${e(g.id)}-t">
      <header class="nls-head lvs-group__head">
        <p class="nls-kicker">${e(g.id)} · ${e(g.en)} · ${e(g.range)}</p>
        <h3 class="lvs-group__title" id="lvs-group-${e(g.id)}-t">${e(pick(lang, g.ko, g.en))}</h3>
        <p class="nls-lead">${e(pick(lang, g.leadKo, g.leadEn))}</p>
      </header>
      <div class="nls-board lvs-board--cats">${cards}</div>
    </section>`;
  }).join("");
  const body = `
    <p class="nls-note lvs-lead-note">${e(c.notice)}</p>
    <div id="lvs-core" class="nls-block nls-platform-sec">
      ${head(p.coreKicker, p.coreTitle, "")}
      <div class="nls-proc lvs-proc">${core}</div>
    </div>
    <div id="lvs-map" class="nls-block nls-block--band">
      ${head(p.groupsKicker, p.groupsTitle, p.groupsLead)}
      <nav class="lvs-jump" aria-label="${e(p.groupsTitle)}"><ul>${jump}</ul></nav>
      ${lifeMap(lang, [], p.groupsTitle)}
      ${legend(lang)}
    </div>
    <div id="lvs-groups" class="nls-block">${groups}</div>
    <div id="lvs-official" class="nls-block nls-block--band nls-why-sec">
      <div class="nls-split">
        ${head(p.officialKicker, p.officialTitle, "")}
        ${roster(p.officialItems.map(([k, v], i) => [pad(i + 1), `<b>${e(k)}</b> ${e(v)}`]))}
      </div>
    </div>`;
  return shell(lang, "platform", "lvs-platform-title", textHero(lang, "Platform", p.heroTitle, p.heroLead, "lvs-platform-title"), body);
}

/* ════════════════════════ 03 Business ════════════════════════ */
export function renderBusiness(lang) {
  const c = siteCopy(lang);
  const b = c.business;
  const cards = BUSINESS.map((x) => {
    const d = pick(lang, x.ko2, x.en2);
    return `<article class="nls-signal__item lvs-biz" id="lvs-biz-${e(x.n)}" data-status="${e(x.st)}">
      <span class="nls-signal__n">${e(x.n)}</span>
      <div class="nls-signal__copy">
        <h3>${e(pick(lang, x.ko, x.en))} <small>${e(x.en)}</small></h3>
        <p>${e(d.what)}</p>
        ${dl([
          [b.f.who, e(d.who)],
          [b.f.value, e(d.value)],
          [b.f.rev, e(d.rev)],
          [b.f.partners, e(d.partners)],
          [b.f.rule, e(d.rule)],
        ])}
        <div class="lvs-cat__foot">${status(lang, x.st)}<a class="lvs-link" href="/${e(lang)}/contact/?type=business">${e(b.f.cta)} →</a></div>
      </div>
    </article>`;
  }).join("");
  const revRows = REVENUE.map(
    (r) => `<tr><th scope="row">${e(pick(lang, r.ko, r.en))}</th><td>${e(pick(lang, r.whoKo, r.whoEn))}</td><td>${e(pick(lang, r.howKo, r.howEn))}</td><td>${e(b.revStatus)}</td></tr>`
  ).join("");
  const stLabel = { now: b.roadNow, next: b.roadNext, later: b.roadLater };
  const road = ROADMAP.map(
    (r) => `<article class="nls-lane__item lvs-road__step" data-st="${e(r.st)}">
      <span class="nls-lane__n">${e(pad(r.n))}</span>
      <div class="nls-lane__copy">
        <h3>${e(pick(lang, r.ko, r.en))}</h3>
        <p>${e(pick(lang, r.bodyKo, r.bodyEn))}</p>
      </div>
      <p class="nls-status${r.st === "now" ? " is-now" : ""}">${e(stLabel[r.st])}</p>
    </article>`
  ).join("");
  const body = `
    <div id="lvs-verdict" class="nls-block nls-why-sec">
      <div class="nls-split">
        <header class="nls-head"><p class="nls-kicker">Principle</p><h2 class="nls-title">${e(b.verdictTitle)}</h2></header>
        ${roster([["01", e(b.verdictBody)], ["02", e(pick(lang, "고객별 맞춤 외주가 아니라 표준화된 자체 솔루션과 플랫폼 제품을 만듭니다.", "Standard products and our own platform — not custom client work."))], ["03", e(b.revNote)]])}
      </div>
    </div>
    <div id="lvs-biz" class="nls-block nls-block--band nls-areas-sec">
      ${head(b.kicker, b.title, b.lead)}
      <div class="nls-signal lvs-signal">${cards}</div>
    </div>
    <div id="lvs-revenue" class="nls-block">
      ${head(b.revKicker, b.revTitle, "")}
      <p class="nls-status">${e(b.revStatus)}</p>
      <div class="lvs-table-wrap"><table class="lvs-table">
        <thead><tr>${b.revCols.map((t) => `<th scope="col">${e(t)}</th>`).join("")}</tr></thead>
        <tbody>${revRows}</tbody>
      </table></div>
    </div>
    <div id="lvs-roadmap" class="nls-block nls-block--band nls-expand-sec">
      ${head(b.roadKicker, b.roadTitle, "")}
      <div class="nls-lane">${road}</div>
    </div>
    <div id="lvs-rules" class="nls-block nls-why-sec">
      <div class="nls-split">
        ${head(b.ruleKicker, b.ruleTitle, "")}
        ${roster(b.ruleItems.map((t, i) => [pad(i + 1), e(t)]))}
      </div>
    </div>`;
  return shell(lang, "business", "lvs-business-title", textHero(lang, "Business", b.heroTitle, b.heroLead, "lvs-business-title"), body);
}

/* ════════════════════════ 04 Partnerships ════════════════════════ */
export function renderPartnerships(lang) {
  const c = siteCopy(lang);
  const p = c.partnerships;
  const pc = pick(lang, PARTNER_COMMON.ko, PARTNER_COMMON.en);
  const byP = Object.fromEntries(PARTNERS.map((x) => [x.n, x]));
  const card = (x) => `<article class="nls-board__item lvs-partner${x.official ? " is-source" : ""}" id="lvs-partner-${e(x.n)}">
      <div class="nls-board__meta"><span class="nls-board__n">${e(x.n)}</span><span class="lvs-cat__en">${e(x.en)}</span></div>
      <h4>${e(pick(lang, x.ko, x.en))}</h4>
      <p>${e(pick(lang, x.whatKo, x.whatEn))}</p>
      ${x.official ? `<p class="nls-status">${e(p.f.officialTag)}</p>` : ""}
    </article>`;
  const groups = PARTNER_GROUPS.map(
    (g, gi) => `<section class="lvs-pgroup" aria-labelledby="lvs-pgroup-${gi}">
      <h3 id="lvs-pgroup-${gi}" class="lvs-pgroup__title">${e(pick(lang, g.ko, g.en))} <span>${g.ids.length}</span></h3>
      <div class="nls-board lvs-board--4">${g.ids.map((n) => card(byP[n])).join("")}</div>
    </section>`
  ).join("");
  const steps = pick(lang, PARTNER_STEPS.ko, PARTNER_STEPS.en)
    .map(([t, b], i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}"><p class="nls-pipe__n">${pad(i + 1)}</p><h3>${e(t)}</h3><p>${e(b)}</p></article>`)
    .join("");
  const body = `
    <div id="lvs-partners" class="nls-block nls-first-sec">
      ${head(p.kicker, p.title, "")}
      ${note(p.sourceNote)}
      ${groups}
    </div>
    <div id="lvs-terms" class="nls-block nls-block--band nls-why-sec">
      <div class="nls-split">
        <header class="nls-head"><p class="nls-kicker">Terms</p><h2 class="nls-title">${e(p.sourceTitle)}</h2></header>
        ${roster([
          ["01", `<b>${e(p.f.value)}</b> ${e(pc.value)}`],
          ["02", `<b>${e(p.f.rev)}</b> ${e(pc.rev)}`],
          ["03", `<b>${e(p.f.cond)}</b> ${e(pc.cond)}`],
          ["04", `<b>${e(p.f.officialTag)}</b> ${e(pc.officialRev)} ${e(pc.officialCond)}`],
        ])}
      </div>
    </div>
    <div id="lvs-steps" class="nls-block nls-how-sec">
      ${head(p.stepsKicker, p.stepsTitle, "")}
      <div class="nls-pipe lvs-pipe--4">${steps}</div>
    </div>
    <div class="nls-block nls-close nls-block--ink">
      <p class="nls-kicker">Partnership</p>
      <h2 class="nls-hero__title">${nl(p.heroTitle)}</h2>
      <div class="nls-actions"><a class="nls-btn" href="/${e(lang)}/contact/?type=partnership">${e(p.f.cta)} →</a></div>
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
      <h3 id="lvs-cgroup-${gid}" class="lvs-pgroup__title">${e(pick(lang, g.ko, g.en))}</h3>
      <ol class="nls-dir lvs-dir">${rows}</ol>
    </section>`;
  }).join("");
  const body = `
    <div id="lvs-contact" class="nls-block">
      ${head(k.kicker, k.title, "")}
      <div class="lvs-cols lvs-cols--3">${groups}</div>
    </div>
    <div id="lvs-contact-tips" class="nls-block nls-block--band nls-why-sec">
      <div class="nls-split">
        <header class="nls-head"><p class="nls-kicker">Before you write</p><h2 class="nls-title">${e(k.tipsTitle)}</h2></header>
        ${roster(k.tips.map((t, j) => [pad(j + 1), e(t)]))}
      </div>
      ${note(k.note)}
      <p class="nls-note">${e(k.bizNote)} <a href="/${e(lang)}/business/inquiry/">NEWON Business →</a></p>
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
