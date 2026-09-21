/**
 * Ongil detail section HTML. Scoped to #ongil-detail.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getOngilCopy } from "./home-ongil-copy.mjs";

const DISCOVER_FEATURED = new Set(["art", "music", "sport", "travel", "cook", "read"]);
const PILLAR_ORDER = ["care", "family", "hobby"];

function nl(s) {
  return escapeHtml(s || "").replace(/\n/g, "<br>");
}

function titleBlock(kicker, title, lead, extraClass = "") {
  return `<header class="nls-head${extraClass ? ` ${extraClass}` : ""}">
    ${kicker ? `<p class="nls-kicker">${escapeHtml(kicker)}</p>` : ""}
    <h2 class="nls-title">${nl(title)}</h2>
    ${lead ? `<p class="nls-lead">${escapeHtml(lead)}</p>` : ""}
  </header>`;
}

function list(items, cls = "nls-list") {
  return `<ul class="${cls}">${(items || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
}

function moreBlock(label, inner) {
  if (!inner) return "";
  return `<details class="nls-more"><summary>${escapeHtml(label)}</summary><div class="nls-more__body">${inner}</div></details>`;
}

function emptyHint(group, text) {
  return `<p class="nls-empty" data-nls-empty="${escapeHtml(group)}">${escapeHtml(text)}</p>`;
}

function tabBtn(group, key, label, selected, extraClass = "", extraAttr = "") {
  return `<button type="button" class="nls-tab${extraClass}${selected ? " is-active" : ""}" data-nls-tab data-nls-group="${escapeHtml(group)}" data-nls-key="${escapeHtml(key)}"${extraAttr} role="tab" aria-selected="${selected ? "true" : "false"}" tabindex="${selected ? "0" : "-1"}">${label}</button>`;
}

function ecoHref(lang, slug) {
  if (slug === "lifestage") return `/${lang}/lifestage/`;
  return `/${lang}/portfolio/${slug}/`;
}

function orderedPillars(items) {
  const map = Object.fromEntries((items || []).map((it) => [it.id, it]));
  return PILLAR_ORDER.map((id, i) => {
    const it = map[id];
    if (!it) return null;
    return { ...it, n: String(i + 1).padStart(2, "0") };
  }).filter(Boolean);
}

function heroVisual(c) {
  const steps = c.roadmap.steps || [];
  const axes = c.hero.axes || [];
  const care = axes.find((a) => a.id === "care") || axes[0] || { name: "", keys: "" };
  const family = axes.find((a) => a.id === "family") || axes[1] || { name: "", keys: "" };
  const hobby = axes.find((a) => a.id === "hobby") || axes[2] || { name: "", keys: "" };
  const nodes = steps
    .map(
      (s) => `<button type="button" class="nls-node" data-nls-tab data-nls-group="hero" data-nls-key="${escapeHtml(s.n)}" data-name="${escapeHtml(s.title)}" data-age="${escapeHtml(s.n)}" aria-pressed="false">
        <span class="nls-node__n">${escapeHtml(s.n)}</span>
        <span class="nls-node__age">${escapeHtml(s.n)}</span>
        <span class="nls-node__name">${escapeHtml(s.title)}</span>
      </button>`
    )
    .join("");
  return `<div class="nls-visual" aria-label="${escapeHtml(c.hero.theme)}">
    <div class="nls-sv">
      <div class="nls-sv__head">
        <span class="nls-sv__live"><i></i> CARE TIMELINE</span>
        <span class="nls-sv__meta">DIRECTION</span>
      </div>
      <div class="nls-sv__rail">${nodes}</div>
      <div class="nls-sv__grid">
        <article class="nls-sv__now" data-nls-now data-default-title="${escapeHtml(care.name)}" data-default-age="${escapeHtml(care.keys)}">
          <p class="nls-sv__k">NOW</p>
          <strong data-nls-now-title>${escapeHtml(care.name)}</strong>
          <em data-nls-now-age>${escapeHtml(care.keys)}</em>
        </article>
        <article>
          <p class="nls-sv__k">FAMILY</p>
          <strong>${escapeHtml(family.name)}</strong>
          <em>${escapeHtml(family.keys)}</em>
        </article>
        <article>
          <p class="nls-sv__k">CONNECT</p>
          <strong>${escapeHtml(hobby.name)}</strong>
          <em>${escapeHtml(hobby.keys)}</em>
        </article>
      </div>
    </div>
  </div>`;
}

function heroBlock(c, lang) {
  const lead = (c.hero.leads || [])[0]
    ? `<p class="nls-lead">${escapeHtml(c.hero.leads[0])}</p>`
    : "";
  return `<div class="nls-crumb">
      <a href="/${escapeHtml(lang)}/">NEWON</a>
      <span aria-hidden="true">/</span>
      <span>ONGIL</span>
    </div>
    <div class="nls-hero" data-hs-section>
    <div class="nls-hero__grid">
      <div class="nls-hero__copy">
        <p class="nls-kicker">${escapeHtml(c.hero.kicker)}<span class="nls-kicker__sep" aria-hidden="true">·</span><span>${escapeHtml(c.hero.theme)}</span></p>
        <h1 id="story-ongil-title" class="nls-hero__title">${c.hero.titleHtml}</h1>
        ${lead}
        <div class="nls-actions">
          <a class="nls-btn" href="#nog-pillars" data-nls-scroll>${escapeHtml(c.hero.ctaMain)} →</a>
          <a class="nls-btn nls-btn--ghost" href="#nog-family" data-nls-scroll>${escapeHtml(c.hero.ctaSub)}</a>
        </div>
        <p class="nls-note">${escapeHtml(c.hero.status)}</p>
      </div>
      ${heroVisual(c)}
    </div>
  </div>`;
}

function pillarsBlock(c) {
  const items = orderedPillars(c.pillars.items);
  const cards = items
    .map((it) => {
      const tone = it.id === "care" ? "care" : it.id === "family" ? "family" : "hobby";
      const badge =
        it.id === "hobby"
          ? `<span class="nog-badge">${escapeHtml(c.ui.extraBadge)}</span>`
          : it.id === "care"
            ? `<span class="nog-badge nog-badge--core">${escapeHtml(c.ui.coreBadge)}</span>`
            : "";
      return `<article class="nog-pillar nog-pillar--${tone}">
        <p class="nog-pillar__n">${escapeHtml(it.n)}</p>
        ${badge}
        <h3 class="nog-pillar__name">${escapeHtml(it.name)}</h3>
        <p class="nog-pillar__lead">${escapeHtml(it.lead)}</p>
        ${list(it.features, "nls-chips")}
        <details class="nls-more nog-pillar__more">
          <summary>${escapeHtml(c.ui.more)}</summary>
          <div class="nls-more__body">
            ${list(it.details, "nls-points")}
            <p class="nls-mini">${escapeHtml(c.ui.caseLabel)}</p>
            ${list(it.cases, "nls-list")}
          </div>
        </details>
      </article>`;
    })
    .join("");
  return `<div id="nog-pillars" class="nls-block nog-block--pillars" data-hs-section>
    ${titleBlock(c.pillars.kicker, c.pillars.title, "")}
    <div class="nog-pillars">${cards}</div>
  </div>`;
}

function discoverBlock(c) {
  const tabs = c.discover.items
    .map((it) => {
      const feat = DISCOVER_FEATURED.has(it.id);
      const hidden = feat ? "" : " hidden";
      return tabBtn(
        "disc",
        it.id,
        `<strong>${escapeHtml(it.name)}</strong><span>${escapeHtml(it.intro)}</span>`,
        false,
        " nog-disc-tab",
        ` data-nls-featured="${feat ? "1" : "0"}"${hidden}`
      );
    })
    .join("");
  const panels = c.discover.items
    .map(
      (it) => `<article class="nls-panel nog-disc-panel" data-nls-panel data-nls-group="disc" data-nls-key="${escapeHtml(it.id)}" hidden>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        <p class="nls-panel__intro">${escapeHtml(it.intro)}</p>
        <div class="nog-disc-grid4">
          <div><p class="nls-mini">${escapeHtml(c.ui.start)}</p><p>${escapeHtml(it.start)}</p></div>
          <div><p class="nls-mini">${escapeHtml(c.ui.home)}</p><p>${escapeHtml(it.home)}</p></div>
          <div><p class="nls-mini">${escapeHtml(c.ui.together)}</p><p>${escapeHtml(it.together)}</p></div>
          <div><p class="nls-mini">${escapeHtml(c.ui.next)}</p><p>${escapeHtml(it.next)}</p></div>
        </div>
        <p class="nls-note">${escapeHtml(c.ui.check)}: ${escapeHtml(it.check)}</p>
      </article>`
    )
    .join("");
  const extras = (c.hobby.extraGroups || [])
    .map((g) => `<div class="nog-extra"><p class="nls-mini">${escapeHtml(g.title)}</p>${list(g.items, "nls-chips")}</div>`)
    .join("");
  return `<div id="nog-discover" class="nls-block nls-block--band nog-block--leisure" data-hs-section>
    ${titleBlock(c.discover.kicker, c.discover.title, c.discover.lead)}
    <p class="nls-note">${escapeHtml(c.discover.filterNote)}</p>
    <div class="nls-tabs nog-disc-grid" role="tablist">${tabs}</div>
    <p class="nls-actions"><button type="button" class="nls-btn nls-btn--ghost" data-nog-more data-label-all="${escapeHtml(c.ui.showAll)}" data-label-less="${escapeHtml(c.ui.showLess)}">${escapeHtml(c.ui.showAll)}</button></p>
    ${emptyHint("disc", c.ui.pickInterest)}
    <div class="nls-panels">${panels}</div>
    ${moreBlock(c.ui.extra, `<p class="nls-lead">${escapeHtml(c.hobby.extraLead)}</p><p class="nls-note">${escapeHtml(c.ui.bookingNote)}</p><div class="nog-extras">${extras}</div>`)}
  </div>`;
}

function familyBlock(c) {
  const feats = (c.family.features || [])
    .map(
      (it) => `<article class="nog-feat">
        <h3>${escapeHtml(it.name)}</h3>
        ${list((it.items || []).slice(0, 3), "nls-points")}
      </article>`
    )
    .join("");
  const sceneTabs = c.family.scenes
    .map((it, i) => tabBtn("scene", it.id, escapeHtml(it.name), i === 0, " nog-scene-tab"))
    .join("");
  const scenePanels = c.family.scenes
    .map(
      (it, i) => `<article class="nls-panel nog-scene" data-nls-panel data-nls-group="scene" data-nls-key="${escapeHtml(it.id)}"${i === 0 ? "" : " hidden"}>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        <div class="nog-scene-grid">
          <div class="nog-scene-card"><p class="nls-mini">${escapeHtml(c.ui.calendar)}</p>${list(it.calendar, "nls-list")}</div>
          <div class="nog-scene-card"><p class="nls-mini">${escapeHtml(c.ui.messages)}</p>${list(it.messages, "nls-list")}</div>
          <div class="nog-scene-card"><p class="nls-mini">${escapeHtml(c.ui.help)}</p>${list(it.help, "nls-list")}</div>
          <div class="nog-scene-card"><p class="nls-mini">${escapeHtml(c.ui.roles)}</p>${list(it.roles, "nls-list")}</div>
        </div>
      </article>`
    )
    .join("");
  return `<div id="nog-family" class="nls-block nog-block--family" data-hs-section>
    ${titleBlock(c.family.kicker, c.family.title, c.family.lead)}
    <p class="nls-note">${escapeHtml(c.ui.consent)}</p>
    <div class="nog-family">
      <div class="nog-family__feats">${feats}</div>
      <div class="nog-family__preview">
        <p class="nls-mini">${escapeHtml(c.ui.pickFamily)}</p>
        <div class="nls-tabs nog-scene-tabs" role="tablist">${sceneTabs}</div>
        <div class="nls-panels nog-device">${scenePanels}</div>
      </div>
    </div>
  </div>`;
}

function careBlock(c) {
  const tiles = (c.care.items || [])
    .map(
      (it, i) => `<article class="nog-care-tile${i === 0 ? " nog-care-tile--lead" : ""}">
        <p class="nog-care-tile__n">${String(i + 1).padStart(2, "0")}</p>
        <h3>${escapeHtml(it.name)}</h3>
        ${list(it.points, "nls-points")}
      </article>`
    )
    .join("");
  return `<div id="nog-care" class="nls-block nls-block--band nog-block--care" data-hs-section>
    ${titleBlock(c.care.kicker, c.care.title, "")}
    <p class="nls-note">${escapeHtml(c.care.note)}</p>
    <div class="nog-care-grid">${tiles}</div>
    <p class="nls-note">${escapeHtml(c.ui.consent)}</p>
  </div>`;
}

function dayBlock(c) {
  const moments = (c.day.moments || [])
    .map(
      (it, i) => `<article class="nog-moment">
        <span class="nog-moment__n">${String(i + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(it.name)}</h3>
        <p>${escapeHtml(it.body)}</p>
      </article>`
    )
    .join("");
  return `<div id="nog-day" class="nls-block nog-block--day" data-hs-section>
    ${titleBlock(c.day.kicker, c.day.title, "")}
    <p class="nls-note">${escapeHtml(c.ui.dayNote)}</p>
    <div class="nog-day">${moments}</div>
  </div>`;
}

function knowledgeBlock(c) {
  const fields = (c.knowledge.fields || [])
    .map(
      (it) => `<article class="nog-know">
        <h3>${escapeHtml(it.name)}</h3>
        <p>${escapeHtml(it.intro)}</p>
      </article>`
    )
    .join("");
  const firstLesson = (c.knowledge.lessons || [])[0];
  const lesson = firstLesson
    ? `<aside class="nog-lesson">
        <p class="nls-mini">${escapeHtml(c.ui.learnPreview)}</p>
        <h3>${escapeHtml(firstLesson.name)}</h3>
        <ol class="nls-list nog-ol">${(firstLesson.steps || [])
          .map((s, n) => `<li><span>${String(n + 1).padStart(2, "0")}</span> ${escapeHtml(s)}</li>`)
          .join("")}</ol>
      </aside>`
    : "";
  return `<div id="nog-knowledge" class="nls-block nog-block--know" data-hs-section>
    ${titleBlock(c.knowledge.kicker, c.knowledge.title, "")}
    <div class="nog-know-layout">
      <div class="nog-know-grid">${fields}</div>
      ${lesson}
    </div>
  </div>`;
}

function ecoBlock(c, lang) {
  const axes = (c.eco.axes || [])
    .map(
      (a) => `<div class="nog-extra">
        <p class="nls-mini">${escapeHtml(a.name)}</p>
        ${list(a.items, "nls-chips")}
      </div>`
    )
    .join("");
  const links = (c.eco.links || [])
    .map(
      (it) => `<a class="nls-app" href="${escapeHtml(ecoHref(lang, it.slug))}">
        <span>${escapeHtml(it.name)}</span>
        <em>${escapeHtml(it.body)}</em>
      </a>`
    )
    .join("");
  return `<div id="nog-eco" class="nls-block nls-block--band nog-block--eco" data-hs-section>
    ${titleBlock(c.eco.kicker, c.eco.title, "")}
    <div class="nog-extras">${axes}</div>
    <p class="nls-note">${escapeHtml(c.eco.nameNote)}</p>
    <p class="nls-mini">${escapeHtml(c.eco.linksTitle)}</p>
    <p class="nls-note">${escapeHtml(c.ui.futureLink)}</p>
    <div class="nog-links">${links}</div>
    <article class="nog-vs">
      <p class="nls-mini">${escapeHtml(c.eco.vsTitle)}</p>
      <p>${escapeHtml(c.eco.vs)}</p>
    </article>
  </div>`;
}

function businessBlock(c) {
  const rows = (c.business.items || [])
    .map(
      (it) => `<article class="nog-biz">
        <p class="nog-biz__n">${escapeHtml(it.n)}</p>
        <div>
          <h3>${escapeHtml(it.name)}</h3>
          ${list(it.items, "nls-chips")}
        </div>
      </article>`
    )
    .join("");
  return `<div id="nog-business" class="nls-block nog-block--biz" data-hs-section>
    ${titleBlock(c.business.kicker, c.business.title, "")}
    <p class="nls-note">${escapeHtml(c.business.note)}</p>
    <div class="nog-biz-list">${rows}</div>
  </div>`;
}

function roadmapBlock(c) {
  const steps = (c.roadmap.steps || [])
    .map(
      (s) => `<li>
        <span>${escapeHtml(s.n)}</span>
        <div>
          <strong>${escapeHtml(s.title)}</strong>
          <p>${escapeHtml(s.body)}</p>
        </div>
      </li>`
    )
    .join("");
  return `<div id="nog-roadmap" class="nls-block nog-block--road" data-hs-section>
    ${titleBlock(c.roadmap.kicker, c.roadmap.title, "")}
    <p class="nls-note">${escapeHtml(c.roadmap.note)}</p>
    <ol class="nls-road">${steps}</ol>
  </div>`;
}

function closeBlock(c, lang) {
  const inquiry = `/${lang}/business/inquiry/`;
  return `<div id="nog-close" class="nls-block nls-close nls-block--ink" data-hs-section>
    <p class="nls-kicker">${escapeHtml(c.close.kicker)}</p>
    <h2 class="nls-hero__title">${c.close.titleHtml}</h2>
    <p class="nls-lead">${escapeHtml(c.close.lead)}</p>
    <p class="nls-note">${escapeHtml(c.ui.conceptNote)}</p>
    <div class="nls-actions">
      <a class="nls-btn" href="${escapeHtml(inquiry)}">${escapeHtml(c.close.ctaMain)} →</a>
      <a class="nls-btn nls-btn--ghost" href="/${escapeHtml(lang)}/#story-ecosystem">${escapeHtml(c.close.ctaSub)}</a>
    </div>
  </div>`;
}

/** @param {string} lang */
export function renderOngilSection(lang, opts = {}) {
  const L = lang || "en";
  const c = getOngilCopy(L);
  const back = opts.detail
    ? `<p class="nls-closebar"><a class="nls-btn nls-btn--ghost" href="/${escapeHtml(L)}/#story-ongil">${escapeHtml(c.ui.back)}</a></p>`
    : "";
  return `<section id="ongil-detail" class="nls nog" data-story="ongil" aria-labelledby="story-ongil-title">
  <div class="nls__wrap">
    ${back}
    ${heroBlock(c, L)}
    ${pillarsBlock(c)}
    ${dayBlock(c)}
    ${familyBlock(c)}
    ${careBlock(c)}
    ${discoverBlock(c)}
    ${knowledgeBlock(c)}
    ${ecoBlock(c, L)}
    ${businessBlock(c)}
    ${roadmapBlock(c)}
    ${closeBlock(c, L)}
  </div>
</section>`;
}
