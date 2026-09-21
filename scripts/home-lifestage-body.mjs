/**
 * Life Stage detail section HTML. Scoped to #lifestage-detail.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getLifeStageCopy } from "./home-lifestage-copy.mjs";

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

function list(items, cls = "nls-points") {
  return `<ul class="${cls}">${(items || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
}

function heroVisual(c) {
  const items = c.journey.items || [];
  const nodes = items
    .map(
      (a, i) => `<button type="button" class="nls-node${i === 0 ? " is-active" : ""}" data-nls-hero-node data-name="${escapeHtml(a.name)}" data-age="${escapeHtml(a.age)}">
        <span class="nls-node__n">${escapeHtml(a.n)}</span>
        <span class="nls-node__age">${escapeHtml(a.age)}</span>
        <span class="nls-node__name">${escapeHtml(a.name)}</span>
      </button>`
    )
    .join("");
  const first = items[0] || { name: "", age: "" };
  return `<div class="nls-visual" aria-hidden="true">
    <div class="nls-sv">
      <div class="nls-sv__head">
        <span class="nls-sv__live"><i></i> LIFE TIMELINE</span>
        <span class="nls-sv__meta">DIRECTION</span>
      </div>
      <div class="nls-sv__rail">${nodes}</div>
      <div class="nls-sv__grid">
        <article class="nls-sv__now is-on" data-nls-now>
          <p class="nls-sv__k">NOW</p>
          <strong data-nls-now-title>${escapeHtml(first.name)}</strong>
          <em data-nls-now-age>${escapeHtml(first.age)}</em>
        </article>
        <article>
          <p class="nls-sv__k">LEARN</p>
          <strong>Knowledge</strong>
          <em>Life Knowledge</em>
        </article>
        <article>
          <p class="nls-sv__k">CONNECT</p>
          <strong>Guide → Plan → Do</strong>
          <em>Info to service</em>
        </article>
      </div>
    </div>
  </div>`;
}

function heroBlock(c, lang) {
  return `<div class="nls-crumb">
      <a href="/${escapeHtml(lang)}/">NEWON</a>
      <span aria-hidden="true">/</span>
      <span>LIFE STAGE</span>
    </div>
    <div class="nls-hero" data-hs-section>
    <div class="nls-hero__grid">
      <div class="nls-hero__copy">
        <p class="nls-kicker">${escapeHtml(c.hero.kicker)}</p>
        <h1 id="story-lifestage-title" class="nls-hero__title">${c.hero.titleHtml}</h1>
        <p class="nls-lead">${escapeHtml(c.hero.lead)}</p>
        <p class="nls-status">${escapeHtml(c.hero.status)}</p>
        <div class="nls-actions">
          <a class="nls-btn" href="#nls-why" data-nls-scroll>${escapeHtml(c.hero.ctaMain)} →</a>
          <a class="nls-btn nls-btn--ghost" href="/${escapeHtml(lang)}/business/inquiry/">${escapeHtml(c.hero.ctaSub)}</a>
        </div>
      </div>
      ${heroVisual(c)}
    </div>
  </div>`;
}

function whyBlock(c) {
  const paras = (c.why.body || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  return `<div id="nls-why" class="nls-block" data-hs-section>
    ${titleBlock(c.why.kicker, c.why.title, "")}
    <div class="nls-why">${paras}</div>
  </div>`;
}

function journeyBlock(c) {
  const rail = (c.journey.items || [])
    .map(
      (it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${escapeHtml(it.id)}" aria-pressed="${i === 0 ? "true" : "false"}">
        <span>${escapeHtml(it.age)}</span>
      </button>`
    )
    .join("");
  const cards = (c.journey.items || [])
    .map(
      (it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${escapeHtml(it.id)}" data-scene="${escapeHtml(it.id)}">
        <div class="nls-decade__scene" aria-hidden="true"></div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${escapeHtml(it.n)}</p>
          <p class="nls-decade__age">${escapeHtml(it.age)}</p>
          <h3>${escapeHtml(it.name)}</h3>
          <p class="nls-decade__lead">${escapeHtml(it.lead)}</p>
          ${list(it.topics)}
        </div>
      </article>`
    )
    .join("");
  return `<div id="nls-journey" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.journey.kicker, c.journey.title, c.journey.lead)}
    <div class="nls-rail" role="tablist" aria-label="${escapeHtml(c.hero.pathLabel)}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    <p class="nls-note">${escapeHtml(c.ui.journeyNote)}</p>
    <p class="nls-note">${escapeHtml(c.ui.ongilNote)}</p>
  </div>`;
}

function platformBlock(c) {
  const cards = (c.platform.items || [])
    .map(
      (it) => `<article class="nls-plat">
        <p class="nls-plat__n">${escapeHtml(it.n)}</p>
        <h3>${escapeHtml(it.name)}</h3>
        ${it.planned ? `<p class="nls-status">${escapeHtml(c.ui.plannedFlag)}</p>` : ""}
        <p class="nls-plat__lead">${escapeHtml(it.lead)}</p>
      </article>`
    )
    .join("");
  return `<div id="nls-platform" class="nls-block" data-hs-section>
    ${titleBlock(c.platform.kicker, c.platform.title, c.platform.lead)}
    <div class="nls-plats">${cards}</div>
  </div>`;
}

function howBlock(c) {
  const steps = (c.how.steps || [])
    .map(
      (s) => `<article class="nls-step">
        <p class="nls-step__n">${escapeHtml(s.n)}</p>
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.body)}</p>
      </article>`
    )
    .join("");
  return `<div id="nls-how" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.how.kicker, c.how.title, "")}
    <p class="nls-status">${escapeHtml(c.ui.planned)}</p>
    <p class="nls-note">${escapeHtml(c.how.note)}</p>
    <div class="nls-how">${steps}</div>
  </div>`;
}

function expandBlock(c) {
  const stages = (c.expand.stages || [])
    .map(
      (s) => `<li>
        <span>${escapeHtml(s.n)}</span>
        <div>
          <strong>${escapeHtml(s.name)}</strong>
          <p>${escapeHtml(s.body)}</p>
        </div>
      </li>`
    )
    .join("");
  return `<div id="nls-expand" class="nls-block" data-hs-section>
    ${titleBlock(c.expand.kicker, c.expand.title, "")}
    <p class="nls-note">${escapeHtml(c.ui.expandNote)}</p>
    <p class="nls-note">${escapeHtml(c.expand.note)}</p>
    <ol class="nls-road">${stages}</ol>
  </div>`;
}

function closeBlock(c, lang) {
  const inquiry = `/${lang}/business/inquiry/`;
  return `<div id="nls-close" class="nls-block nls-close nls-block--ink" data-hs-section>
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
export function renderLifeStageSection(lang, opts = {}) {
  const L = lang || "en";
  const c = getLifeStageCopy(L);
  const back = opts.detail
    ? `<p class="nls-closebar"><a class="nls-btn nls-btn--ghost" href="/${escapeHtml(L)}/#story-lifestage">${escapeHtml(c.ui.back)}</a></p>`
    : "";
  return `<section id="lifestage-detail" class="nls" data-story="lifestage" aria-labelledby="story-lifestage-title">
  <div class="nls__wrap">
    ${back}
    ${heroBlock(c, L)}
    ${whyBlock(c)}
    ${journeyBlock(c)}
    ${platformBlock(c)}
    ${howBlock(c)}
    ${expandBlock(c)}
    ${closeBlock(c, L)}
  </div>
</section>`;
}
