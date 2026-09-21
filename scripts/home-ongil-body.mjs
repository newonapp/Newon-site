/**
 * Ongil detail section HTML. Scoped to #ongil-detail.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getOngilCopy } from "./home-ongil-copy.mjs";

const DISCOVER_FEATURED = new Set(["art", "music", "sport", "travel", "cook", "read"]);

function nl(s) {
  return escapeHtml(s || "").replace(/\n/g, "<br>");
}

function titleBlock(kicker, title, lead) {
  return `<header class="nls-head">
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

function attrJson(value) {
  return escapeHtml(JSON.stringify(value));
}

function ecoHref(lang, slug) {
  if (slug === "lifestage") return `/${lang}/lifestage/`;
  return `/${lang}/portfolio/${slug}/`;
}

function heroBlock(c, lang) {
  const axes = (c.hero.axes || [])
    .map(
      (a) => `<article class="nog-axis">
        <p class="nls-mini">${escapeHtml(a.name)}</p>
        <strong>${escapeHtml(a.keys)}</strong>
      </article>`
    )
    .join("");
  const leads = (c.hero.leads || []).map((t) => `<p class="nls-lead">${escapeHtml(t)}</p>`).join("");
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
        ${leads}
        <div class="nls-actions">
          <a class="nls-btn" href="#nog-pillars" data-nls-scroll>${escapeHtml(c.hero.ctaMain)} →</a>
          <a class="nls-btn nls-btn--ghost" href="#nog-discover" data-nls-scroll>${escapeHtml(c.hero.ctaSub)}</a>
        </div>
        <p class="nls-note">${escapeHtml(c.hero.status)}</p>
      </div>
      <div class="nls-visual" aria-hidden="true">
        <div class="nog-axes">${axes}</div>
      </div>
    </div>
  </div>`;
}

function pillarsBlock(c) {
  const tabs = c.pillars.items
    .map((it) =>
      tabBtn(
        "pillar",
        it.id,
        `<span class="nls-age-tab__age">${escapeHtml(it.n)}</span><strong class="nls-age-tab__name">${escapeHtml(it.name)}</strong><span>${escapeHtml(it.lead)}</span>`,
        false,
        " nog-card-tab"
      )
    )
    .join("");
  const panels = c.pillars.items
    .map((it) => {
      return `<article class="nls-panel" data-nls-panel data-nls-group="pillar" data-nls-key="${escapeHtml(it.id)}" hidden>
        <p class="nls-panel__kicker">${escapeHtml(it.n)} · ${escapeHtml(it.name)}</p>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        <p class="nls-panel__intro">${escapeHtml(it.lead)}</p>
        <p class="nls-mini">${escapeHtml(c.ui.features)}</p>
        ${list(it.features, "nls-chips")}
        ${list(it.details, "nls-points")}
        <p class="nls-mini">${escapeHtml(c.ui.caseLabel)}</p>
        ${list(it.cases, "nls-list")}
      </article>`;
    })
    .join("");
  return `<div id="nog-pillars" class="nls-block" data-hs-section>
    ${titleBlock(c.pillars.kicker, c.pillars.title, "")}
    <p class="nls-note">${escapeHtml(c.ui.pickPillar)}</p>
    <div class="nls-tabs nog-tabs-3" role="tablist">${tabs}</div>
    ${emptyHint("pillar", c.ui.pickPillar)}
    <div class="nls-panels">${panels}</div>
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
      (it) => `<article class="nls-panel" data-nls-panel data-nls-group="disc" data-nls-key="${escapeHtml(it.id)}" hidden>
        <p class="nls-panel__kicker">${escapeHtml(it.name)}</p>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        <p class="nls-panel__intro">${escapeHtml(it.intro)}</p>
        <p class="nls-mini">${escapeHtml(c.ui.start)}</p>
        <p>${escapeHtml(it.start)}</p>
        <p class="nls-mini">${escapeHtml(c.ui.home)}</p>
        <p>${escapeHtml(it.home)}</p>
        <p class="nls-mini">${escapeHtml(c.ui.together)}</p>
        <p>${escapeHtml(it.together)}</p>
        <p class="nls-mini">${escapeHtml(c.ui.check)}</p>
        <p>${escapeHtml(it.check)}</p>
        <p class="nls-mini">${escapeHtml(c.ui.next)}</p>
        <p>${escapeHtml(it.next)}</p>
      </article>`
    )
    .join("");
  return `<div id="nog-discover" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.discover.kicker, c.discover.title, c.discover.lead)}
    <p class="nls-note">${escapeHtml(c.discover.filterNote)}</p>
    <p class="nls-note">${escapeHtml(c.ui.pickInterest)}</p>
    <div class="nls-tabs nog-disc-grid" role="tablist">${tabs}</div>
    <p class="nls-actions"><button type="button" class="nls-btn nls-btn--ghost" data-nog-more data-label-all="${escapeHtml(c.ui.showAll)}" data-label-less="${escapeHtml(c.ui.showLess)}">${escapeHtml(c.ui.showAll)}</button></p>
    ${emptyHint("disc", c.ui.pickInterest)}
    <div class="nls-panels">${panels}</div>
  </div>`;
}

function journeyBlock(c) {
  const cases = c.journey.cases
    .map((it, i) =>
      tabBtn(
        "jcase",
        it.id,
        `<strong>${escapeHtml(it.name)}</strong>`,
        i === 0,
        "",
        ` data-nls-name="${escapeHtml(it.name)}" data-nls-bodies="${attrJson(it.bodies)}"`
      )
    )
    .join("");
  const steps = c.journey.steps
    .map((s, i) =>
      tabBtn(
        "jstep",
        s.id,
        `<span>${escapeHtml(s.n)}</span><strong>${escapeHtml(s.name)}</strong><em>${escapeHtml(s.lead)}</em>`,
        i === 0,
        " nog-step-tab",
        ` data-nls-idx="${i}"`
      )
    )
    .join("");
  const first = c.journey.cases[0] || { name: "", bodies: [] };
  return `<div id="nog-journey" class="nls-block" data-hs-section>
    ${titleBlock(c.journey.kicker, c.journey.title, c.journey.lead)}
    <p class="nls-note">${escapeHtml(c.ui.pickCase)}</p>
    <p class="nls-mini">${escapeHtml(c.ui.caseLabel)}</p>
    <div class="nls-tabs" role="tablist">${cases}</div>
    <p class="nls-note">${escapeHtml(c.ui.pickStep)}</p>
    <div class="nls-tabs nog-steps" role="tablist">${steps}</div>
    <article class="nls-panel nog-journey-panel">
      <p class="nls-panel__kicker">${escapeHtml(c.ui.caseLabel)}</p>
      <h4 class="nls-panel__title" data-nog-jtitle>${escapeHtml(first.name)}</h4>
      <p class="nls-panel__intro" data-nog-jtext>${escapeHtml((first.bodies || [])[0] || "")}</p>
      <p class="nls-note">${escapeHtml(c.ui.bookingNote)}</p>
    </article>
  </div>`;
}

function hobbyBlock(c) {
  const tabs = c.hobby.items
    .map((it) => tabBtn("hobby", it.id, `<strong>${escapeHtml(it.name)}</strong><span>${escapeHtml(it.lead)}</span>`, false, " nog-card-tab"))
    .join("");
  const panels = c.hobby.items
    .map(
      (it) => `<article class="nls-panel" data-nls-panel data-nls-group="hobby" data-nls-key="${escapeHtml(it.id)}" hidden>
        <p class="nls-panel__kicker">${escapeHtml(it.name)}</p>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        <p class="nls-panel__intro">${escapeHtml(it.lead)}</p>
        ${list(it.points, "nls-points")}
        ${it.note ? `<p class="nls-note">${escapeHtml(it.note)}</p>` : ""}
      </article>`
    )
    .join("");
  const extras = (c.hobby.extraGroups || [])
    .map((g) => `<div class="nog-extra"><p class="nls-mini">${escapeHtml(g.title)}</p>${list(g.items, "nls-chips")}</div>`)
    .join("");
  return `<div id="nog-hobby" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.hobby.kicker, c.hobby.title, "")}
    <p class="nls-note">${escapeHtml(c.ui.pickHobby)}</p>
    <div class="nls-tabs nog-disc-grid" role="tablist">${tabs}</div>
    ${emptyHint("hobby", c.ui.pickHobby)}
    <div class="nls-panels">${panels}</div>
    ${moreBlock(c.ui.extra, `<p class="nls-lead">${escapeHtml(c.hobby.extraLead)}</p><p class="nls-note">${escapeHtml(c.ui.bookingNote)}</p><div class="nog-extras">${extras}</div>`)}
  </div>`;
}

function familyBlock(c) {
  const featTabs = c.family.features
    .map((it) => tabBtn("ffeat", it.id, escapeHtml(it.name), false))
    .join("");
  const featPanels = c.family.features
    .map(
      (it) => `<article class="nls-panel" data-nls-panel data-nls-group="ffeat" data-nls-key="${escapeHtml(it.id)}" hidden>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        ${list(it.items, "nls-points")}
      </article>`
    )
    .join("");
  const sceneTabs = c.family.scenes
    .map((it, i) => tabBtn("scene", it.id, escapeHtml(it.name), i === 0))
    .join("");
  const scenePanels = c.family.scenes
    .map(
      (it, i) => `<article class="nls-panel nog-scene" data-nls-panel data-nls-group="scene" data-nls-key="${escapeHtml(it.id)}"${i === 0 ? "" : " hidden"}>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        <div class="nog-scene-grid">
          <div><p class="nls-mini">${escapeHtml(c.ui.calendar)}</p>${list(it.calendar, "nls-list")}</div>
          <div><p class="nls-mini">${escapeHtml(c.ui.messages)}</p>${list(it.messages, "nls-list")}</div>
          <div><p class="nls-mini">${escapeHtml(c.ui.help)}</p>${list(it.help, "nls-list")}</div>
          <div><p class="nls-mini">${escapeHtml(c.ui.roles)}</p>${list(it.roles, "nls-list")}</div>
        </div>
      </article>`
    )
    .join("");
  return `<div id="nog-family" class="nls-block" data-hs-section>
    ${titleBlock(c.family.kicker, c.family.title, c.family.lead)}
    <p class="nls-note">${escapeHtml(c.ui.consent)}</p>
    <p class="nls-mini">${escapeHtml(c.ui.features)}</p>
    <div class="nls-tabs" role="tablist">${featTabs}</div>
    ${emptyHint("ffeat", c.ui.pickFamily)}
    <div class="nls-panels">${featPanels}</div>
    <p class="nls-note">${escapeHtml(c.ui.pickFamily)}</p>
    <div class="nls-tabs" role="tablist">${sceneTabs}</div>
    <div class="nls-panels">${scenePanels}</div>
  </div>`;
}

function careBlock(c) {
  const tabs = c.care.items
    .map((it) => tabBtn("care", it.id, escapeHtml(it.name), false))
    .join("");
  const panels = c.care.items
    .map(
      (it) => `<article class="nls-panel" data-nls-panel data-nls-group="care" data-nls-key="${escapeHtml(it.id)}" hidden>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        ${list(it.points, "nls-points")}
        <p class="nls-note">${escapeHtml(c.ui.consent)}</p>
      </article>`
    )
    .join("");
  return `<div id="nog-care" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.care.kicker, c.care.title, "")}
    <p class="nls-note">${escapeHtml(c.care.note)}</p>
    <p class="nls-note">${escapeHtml(c.ui.pickCare)}</p>
    <div class="nls-tabs" role="tablist">${tabs}</div>
    ${emptyHint("care", c.ui.pickCare)}
    <div class="nls-panels">${panels}</div>
  </div>`;
}

function dayBlock(c) {
  const tabs = c.day.moments
    .map((it, i) => tabBtn("day", it.id, escapeHtml(it.name), i === 0))
    .join("");
  const panels = c.day.moments
    .map(
      (it, i) => `<article class="nls-panel" data-nls-panel data-nls-group="day" data-nls-key="${escapeHtml(it.id)}"${i === 0 ? "" : " hidden"}>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        <p class="nls-panel__intro">${escapeHtml(it.body)}</p>
      </article>`
    )
    .join("");
  return `<div id="nog-day" class="nls-block" data-hs-section>
    ${titleBlock(c.day.kicker, c.day.title, "")}
    <p class="nls-note">${escapeHtml(c.ui.dayNote)}</p>
    <p class="nls-note">${escapeHtml(c.ui.pickDay)}</p>
    <div class="nls-tabs" role="tablist">${tabs}</div>
    <div class="nls-panels">${panels}</div>
  </div>`;
}

function knowledgeBlock(c) {
  const fields = c.knowledge.fields
    .map((it) => tabBtn("know", it.id, escapeHtml(it.name), false))
    .join("");
  const fieldPanels = c.knowledge.fields
    .map(
      (it) => `<article class="nls-panel" data-nls-panel data-nls-group="know" data-nls-key="${escapeHtml(it.id)}" hidden>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        <p class="nls-panel__intro">${escapeHtml(it.intro)}</p>
        <p class="nls-note">${escapeHtml(c.ui.learnPreview)}</p>
      </article>`
    )
    .join("");
  const lessons = c.knowledge.lessons
    .map((it, i) => tabBtn("lesson", it.id, escapeHtml(it.name), i === 0))
    .join("");
  const lessonPanels = c.knowledge.lessons
    .map((it, i) => {
      const steps = `<ol class="nls-list nog-ol">${(it.steps || [])
        .map((s, n) => `<li><span>${String(n + 1).padStart(2, "0")}</span> ${escapeHtml(s)}</li>`)
        .join("")}</ol>`;
      return `<article class="nls-panel" data-nls-panel data-nls-group="lesson" data-nls-key="${escapeHtml(it.id)}"${i === 0 ? "" : " hidden"}>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        ${steps}
        <p class="nls-note">${escapeHtml(c.ui.learnPreview)}</p>
      </article>`;
    })
    .join("");
  return `<div id="nog-knowledge" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.knowledge.kicker, c.knowledge.title, "")}
    <p class="nls-note">${escapeHtml(c.ui.pickKnow)}</p>
    <div class="nls-tabs" role="tablist">${fields}</div>
    ${emptyHint("know", c.ui.pickKnow)}
    <div class="nls-panels">${fieldPanels}</div>
    <p class="nls-mini">${escapeHtml(c.ui.learnPreview)}</p>
    <div class="nls-tabs" role="tablist">${lessons}</div>
    <div class="nls-panels">${lessonPanels}</div>
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
  return `<div id="nog-eco" class="nls-block" data-hs-section>
    ${titleBlock(c.eco.kicker, c.eco.title, "")}
    <div class="nog-extras">${axes}</div>
    <p class="nls-mini">${escapeHtml(c.eco.baseName)}</p>
    ${list(c.eco.base, "nls-chips")}
    <p class="nls-note">${escapeHtml(c.eco.nameNote)}</p>
    <p class="nls-mini">${escapeHtml(c.eco.linksTitle)}</p>
    <p class="nls-note">${escapeHtml(c.ui.futureLink)}</p>
    <div class="nog-links">${links}</div>
    <article class="nls-panel">
      <p class="nls-mini">${escapeHtml(c.eco.vsTitle)}</p>
      <p>${escapeHtml(c.eco.vs)}</p>
      <p class="nls-note">${escapeHtml(c.ui.vsNote)}</p>
    </article>
  </div>`;
}

function businessBlock(c) {
  const tabs = c.business.items
    .map((it) => tabBtn("biz", it.id, `<span>${escapeHtml(it.n)}</span><strong>${escapeHtml(it.name)}</strong>`, false, " nog-card-tab"))
    .join("");
  const panels = c.business.items
    .map(
      (it) => `<article class="nls-panel" data-nls-panel data-nls-group="biz" data-nls-key="${escapeHtml(it.id)}" hidden>
        <p class="nls-panel__kicker">${escapeHtml(it.n)}</p>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        ${list(it.items, "nls-points")}
      </article>`
    )
    .join("");
  return `<div id="nog-business" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.business.kicker, c.business.title, "")}
    <p class="nls-note">${escapeHtml(c.business.note)}</p>
    <div class="nls-tabs nog-tabs-3" role="tablist">${tabs}</div>
    ${emptyHint("biz", c.ui.pickHobby)}
    <div class="nls-panels">${panels}</div>
  </div>`;
}

function roadmapBlock(c) {
  const tabs = c.roadmap.steps
    .map((s, i) => tabBtn("road", s.n, `<span>${escapeHtml(s.n)}</span><strong>${escapeHtml(s.title)}</strong>`, i === 0, " nog-card-tab"))
    .join("");
  const panels = c.roadmap.steps
    .map(
      (s, i) => `<article class="nls-panel" data-nls-panel data-nls-group="road" data-nls-key="${escapeHtml(s.n)}"${i === 0 ? "" : " hidden"}>
        <p class="nls-panel__kicker">${escapeHtml(s.n)}</p>
        <h4 class="nls-panel__title">${escapeHtml(s.title)}</h4>
        <p class="nls-panel__intro">${escapeHtml(s.body)}</p>
      </article>`
    )
    .join("");
  const steps = c.roadmap.steps
    .map(
      (s) => `<li>
        <span>${escapeHtml(s.n)}</span>
        <strong>${escapeHtml(s.title)}</strong>
        <p>${escapeHtml(s.body)}</p>
      </li>`
    )
    .join("");
  return `<div id="nog-roadmap" class="nls-block" data-hs-section>
    ${titleBlock(c.roadmap.kicker, c.roadmap.title, "")}
    <p class="nls-note">${escapeHtml(c.roadmap.note)}</p>
    <p class="nls-note">${escapeHtml(c.ui.pickRoad)}</p>
    <div class="nls-tabs nog-tabs-3" role="tablist">${tabs}</div>
    <div class="nls-panels">${panels}</div>
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
  return `<section id="ongil-detail" class="nls" data-story="ongil" aria-labelledby="story-ongil-title">
  <div class="nls__wrap">
    ${back}
    ${heroBlock(c, L)}
    ${pillarsBlock(c)}
    ${discoverBlock(c)}
    ${journeyBlock(c)}
    ${hobbyBlock(c)}
    ${familyBlock(c)}
    ${careBlock(c)}
    ${dayBlock(c)}
    ${knowledgeBlock(c)}
    ${ecoBlock(c, L)}
    ${businessBlock(c)}
    ${roadmapBlock(c)}
    ${closeBlock(c, L)}
  </div>
</section>`;
}
