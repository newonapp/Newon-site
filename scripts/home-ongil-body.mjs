/**
 * Ongil detail section HTML. Scoped to #ongil-detail.
 * Reuses existing nls / nog patterns. Hero CARE TIMELINE still uses the four core services.
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
  if (!items || !items.length) return "";
  return `<ul class="${cls}">${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
}

function notes(...parts) {
  return parts.filter(Boolean).map((t) => `<p class="nls-note">${escapeHtml(t)}</p>`).join("");
}

function chips(items) {
  if (!items || !items.length) return "";
  return `<ul class="nls-chips">${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
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
  return `<div class="nog-film" data-nog-film data-hs-section>
    <div class="nog-film__stage">
      <div class="nog-film__fallback" aria-hidden="true"></div>
      <video
        class="nog-film__video"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        poster="/assets/hero-film/ongil-poster.jpg"
        aria-hidden="true"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260323_071151_38c3924f-c312-48af-a196-3fbb80e4226f.mp4" type="video/mp4" />
      </video>
      <div class="nog-film__lockup">
        <div class="nog-film__veil" aria-hidden="true"></div>
        <p class="nog-film__wordmark">Ongil</p>
        <h1 id="story-ongil-title" class="nog-film__slogan">${c.hero.titleHtml}</h1>
        <p class="nog-film__lead">${escapeHtml(c.hero.lead)}</p>
        <div class="nog-film__actions">
          <a class="nls-btn" href="#nog-why" data-nls-scroll>${escapeHtml(c.hero.ctaMain)} →</a>
          <a class="nls-btn nls-btn--ghost" href="/${escapeHtml(lang)}/business/inquiry/">${escapeHtml(c.hero.ctaSub)}</a>
        </div>
      </div>
    </div>
  </div>`;
}

function whyBlock(c) {
  const rows = (c.why.body || [])
    .map(
      (p, i) => `<li>
        <span>${String(i + 1).padStart(2, "0")}</span>
        <p>${escapeHtml(p)}</p>
      </li>`
    )
    .join("");
  return `<div id="nog-why" class="nls-block" data-hs-section>
    <div class="nls-split">
      ${titleBlock(c.why.kicker, c.why.title, "")}
      <ol class="nls-roster">${rows}</ol>
    </div>
  </div>`;
}

function whoBlock(c) {
  if (!c.who) return "";
  const items = (c.who.items || [])
    .map(
      (it) => `<article class="nls-lane__item">
        <span class="nls-lane__n">${escapeHtml(it.n)}</span>
        <div class="nls-lane__copy">
          <h3>${escapeHtml(it.name)}</h3>
          <p>${escapeHtml(it.lead || "")}</p>
        </div>
      </article>`
    )
    .join("");
  return `<div id="nog-who" class="nls-block nls-block--band nog-who-sec" data-hs-section>
    ${titleBlock(c.who.kicker, c.who.title, c.who.lead || "")}
    <div class="nls-lane">${items}</div>
  </div>`;
}

function servicesBlock(c) {
  const items = (c.services.items || [])
    .map(
      (it) => `<article class="nls-proc__item">
        <span class="nls-proc__n">${escapeHtml(it.n)}</span>
        <h3>${escapeHtml(it.name)}</h3>
        ${it.lead ? `<p>${escapeHtml(it.lead)}</p>` : ""}
        ${it.features ? chips(it.features) : ""}
        ${it.note ? `<p class="nls-note">${escapeHtml(it.note)}</p>` : ""}
      </article>`
    )
    .join("");
  return `<div id="nog-services" class="nls-block" data-hs-section>
    ${titleBlock(c.services.kicker, c.services.title, c.services.lead || "")}
    <div class="nls-proc">${items}</div>
  </div>`;
}

function domainsBlock(c) {
  if (!c.domains) return "";
  const items = c.domains.items || [];
  const rail = items
    .map(
      (it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${escapeHtml(it.n)}" aria-pressed="${i === 0 ? "true" : "false"}">
        <em>${escapeHtml(it.n)}</em>
      </button>`
    )
    .join("");
  const cards = items
    .map(
      (it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${escapeHtml(it.n)}">
        <div class="nls-decade__mark" aria-hidden="true">
          <b>${escapeHtml(it.n)}</b>
          <em>${escapeHtml(c.domains.kicker || "")}</em>
        </div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${escapeHtml(it.n)}</p>
          <h3>${escapeHtml(it.name)}</h3>
          ${it.lead ? `<p class="nls-decade__lead">${escapeHtml(it.lead)}</p>` : ""}
          ${it.features ? chips(it.features) : ""}
          ${
            it.situations?.length
              ? `${it.situationsLead ? `<p class="nls-note">${escapeHtml(it.situationsLead)}</p>` : ""}${list(it.situations)}`
              : ""
          }
          ${it.note ? `<p class="nls-note">${escapeHtml(it.note)}</p>` : ""}
        </div>
      </article>`
    )
    .join("");
  return `<div id="nog-domains" class="nls-block nls-block--band nog-domains-sec" data-hs-section>
    ${titleBlock(c.domains.kicker, c.domains.title, c.domains.lead || "")}
    <div class="nls-rail" role="tablist">${rail}</div>
    <div class="nls-journey">${cards}</div>
  </div>`;
}

function aiBlock(c) {
  if (!c.ai) return "";
  const items = (c.ai.items || [])
    .map(
      (it) => `<article class="nls-board__item">
        <span class="nls-board__n">${escapeHtml(it.n)}</span>
        <h3>${escapeHtml(it.name)}</h3>
        <p>${escapeHtml(it.lead || "")}</p>
      </article>`
    )
    .join("");
  return `<div id="nog-ai" class="nls-block" data-hs-section>
    ${titleBlock(c.ai.kicker, c.ai.title, c.ai.lead || "")}
    ${notes(c.ai.note)}
    <div class="nls-board">${items}</div>
  </div>`;
}

function commerceBlock(c) {
  if (!c.commerce) return "";
  const items = (c.commerce.items || [])
    .map(
      (it) => `<article class="nls-board__item">
        <span class="nls-board__n">${escapeHtml(it.n)}</span>
        <h3>${escapeHtml(it.name)}</h3>
        <p>${escapeHtml(it.lead || "")}</p>
      </article>`
    )
    .join("");
  return `<div id="nog-commerce" class="nls-block nls-block--band nog-commerce-sec" data-hs-section>
    ${titleBlock(c.commerce.kicker, c.commerce.title, c.commerce.lead || "")}
    ${chips(c.commerce.models)}
    <div class="nls-board">${items}</div>
    ${notes(c.commerce.note)}
  </div>`;
}

function howBlock(c) {
  const steps = (c.how.steps || [])
    .map(
      (s) => `<article class="nls-step">
        <p class="nls-step__n">${escapeHtml(s.n)}</p>
        <div class="nls-step__copy">
          <h3>${escapeHtml(s.name)}</h3>
          <p>${escapeHtml(s.body)}</p>
        </div>
      </article>`
    )
    .join("");
  return `<div id="nog-how" class="nls-block nog-how-sec" data-hs-section>
    ${titleBlock(c.how.kicker, c.how.title, "")}
    ${notes(c.how.note)}
    <div class="nls-steps">${steps}</div>
  </div>`;
}

function ecosystemBlock(c) {
  if (!c.ecosystem) return "";
  const rows = (c.ecosystem.items || [])
    .map(
      (t, i) => `<li>
        <span>${String(i + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(t)}</strong>
      </li>`
    )
    .join("");
  return `<div id="nog-ecosystem" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.ecosystem.kicker, c.ecosystem.title, c.ecosystem.lead || "")}
    <ol class="nls-index">${rows}</ol>
    ${notes(c.ecosystem.note)}
  </div>`;
}

function modelBlock(c) {
  if (!c.model) return "";
  const rows = (c.model.items || [])
    .map(
      (s) => `<li>
        <span>${escapeHtml(s.n)}</span>
        <div>
          <strong>${escapeHtml(s.name)}</strong>
          <p>${escapeHtml(s.body || "")}</p>
        </div>
      </li>`
    )
    .join("");
  return `<div id="nog-model" class="nls-block nog-model-sec" data-hs-section>
    ${titleBlock(c.model.kicker, c.model.title, c.model.lead || "")}
    <ol class="nls-index">${rows}</ol>
    ${notes(c.model.note)}
  </div>`;
}

function expandBlock(c) {
  const stages = (c.expand.stages || [])
    .map(
      (s) => `<article class="nls-flow__item">
        <span class="nls-flow__n">${escapeHtml(s.n)}</span>
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.body)}</p>
      </article>`
    )
    .join("");
  return `<div id="nog-expand" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.expand.kicker, c.expand.title, "")}
    ${notes(c.ui.expandNote, c.expand.note)}
    <div class="nls-flow">${stages}</div>
  </div>`;
}

function relatedBlock(c) {
  if (!c.related) return "";
  const rows = (c.related.items || [])
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
  return `<div id="nog-related" class="nls-block" data-hs-section>
    <div class="nls-split">
      <div>
        ${titleBlock(c.related.kicker, c.related.title, c.related.lead || "")}
      </div>
      <ol class="nls-dir">${rows}</ol>
    </div>
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
    ${heroBlock(c, L)}
  <div class="nls__wrap">
    ${back}
    ${whyBlock(c)}
    ${whoBlock(c)}
    ${servicesBlock(c)}
    ${domainsBlock(c)}
    ${aiBlock(c)}
    ${commerceBlock(c)}
    ${howBlock(c)}
    ${ecosystemBlock(c)}
    ${modelBlock(c)}
    ${expandBlock(c)}
    ${relatedBlock(c)}
    ${closeBlock(c, L)}
  </div>
</section>`;
}
