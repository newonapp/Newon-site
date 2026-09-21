/**
 * Ongil detail section HTML. Scoped to #ongil-detail.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getOngilCopy } from "./home-ongil-copy.mjs";

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
  const items = c.services.items || [];
  const nodes = items
    .map(
      (s, i) => `<button type="button" class="nls-node${i === 0 ? " is-active" : ""}" data-nls-hero-node data-name="${escapeHtml(s.name)}" data-age="${escapeHtml(s.n)}">
        <span class="nls-node__n">${escapeHtml(s.n)}</span>
        <span class="nls-node__age">${escapeHtml(s.n)}</span>
        <span class="nls-node__name">${escapeHtml(s.name)}</span>
      </button>`
    )
    .join("");
  const now = items[0] || { name: "", n: "" };
  const family = items.find((it) => it.id === "family") || items[2] || { name: "", lead: "" };
  const local = items.find((it) => it.id === "local") || items[3] || { name: "", lead: "" };
  return `<div class="nls-visual" aria-hidden="true">
    <div class="nls-sv">
      <div class="nls-sv__head">
        <span class="nls-sv__live"><i></i> CARE TIMELINE</span>
        <span class="nls-sv__meta">DIRECTION</span>
      </div>
      <div class="nls-sv__rail">${nodes}</div>
      <div class="nls-sv__grid">
        <article class="nls-sv__now is-on" data-nls-now>
          <p class="nls-sv__k">NOW</p>
          <strong data-nls-now-title>${escapeHtml(now.name)}</strong>
          <em data-nls-now-age>${escapeHtml(now.n)}</em>
        </article>
        <article>
          <p class="nls-sv__k">FAMILY</p>
          <strong>${escapeHtml(family.name)}</strong>
          <em>${escapeHtml((family.features && family.features[0]) || "")}</em>
        </article>
        <article>
          <p class="nls-sv__k">CONNECT</p>
          <strong>${escapeHtml(local.name)}</strong>
          <em>${escapeHtml((local.features && local.features[0]) || "")}</em>
        </article>
      </div>
    </div>
  </div>`;
}

function heroBlock(c, lang) {
  return `<div class="nls-crumb">
      <a href="/${escapeHtml(lang)}/">NEWON</a>
      <span aria-hidden="true">/</span>
      <span>ONGIL</span>
    </div>
    <div class="nls-hero" data-hs-section>
    <div class="nls-hero__grid">
      <div class="nls-hero__copy">
        <p class="nls-kicker">${escapeHtml(c.hero.kicker)}</p>
        <h1 id="story-ongil-title" class="nls-hero__title">${c.hero.titleHtml}</h1>
        <p class="nls-lead">${escapeHtml(c.hero.lead)}</p>
        <p class="nog-status">${escapeHtml(c.hero.status)}</p>
        <div class="nls-actions">
          <a class="nls-btn" href="#nog-why" data-nls-scroll>${escapeHtml(c.hero.ctaMain)} →</a>
          <a class="nls-btn nls-btn--ghost" href="/${escapeHtml(lang)}/business/inquiry/">${escapeHtml(c.hero.ctaSub)}</a>
        </div>
      </div>
      ${heroVisual(c)}
    </div>
  </div>`;
}

function whyBlock(c) {
  const paras = (c.why.body || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  return `<div id="nog-why" class="nls-block" data-hs-section>
    ${titleBlock(c.why.kicker, c.why.title, "")}
    <div class="nog-why">${paras}</div>
  </div>`;
}

function servicesBlock(c) {
  const cards = (c.services.items || [])
    .map(
      (it) => `<article class="nog-svc">
        <p class="nog-svc__n">${escapeHtml(it.n)}</p>
        <h3>${escapeHtml(it.name)}</h3>
        <p class="nog-svc__lead">${escapeHtml(it.lead)}</p>
        ${list(it.features)}
        ${it.note ? `<p class="nls-note">${escapeHtml(it.note)}</p>` : ""}
      </article>`
    )
    .join("");
  return `<div id="nog-services" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.services.kicker, c.services.title, c.services.lead)}
    <div class="nog-services">${cards}</div>
    <p class="nls-note">${escapeHtml(c.services.aiNote)}</p>
  </div>`;
}

function howBlock(c) {
  const steps = (c.how.steps || [])
    .map(
      (s) => `<article class="nog-step">
        <p class="nog-step__n">${escapeHtml(s.n)}</p>
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.body)}</p>
      </article>`
    )
    .join("");
  return `<div id="nog-how" class="nls-block" data-hs-section>
    ${titleBlock(c.how.kicker, c.how.title, "")}
    <p class="nog-status">${escapeHtml(c.ui.planned)}</p>
    <p class="nls-note">${escapeHtml(c.how.note)}</p>
    <div class="nog-how">${steps}</div>
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
  return `<div id="nog-expand" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.expand.kicker, c.expand.title, "")}
    <p class="nls-note">${escapeHtml(c.ui.expandNote)}</p>
    <p class="nls-note">${escapeHtml(c.expand.note)}</p>
    <ol class="nls-road">${stages}</ol>
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
    ${whyBlock(c)}
    ${servicesBlock(c)}
    ${howBlock(c)}
    ${expandBlock(c)}
    ${closeBlock(c, L)}
  </div>
</section>`;
}
