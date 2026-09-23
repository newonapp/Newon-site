/**
 * LivOn detail section HTML. Scoped to #lifestage-detail.
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

function chips(items) {
  return `<ul class="nls-chips">${(items || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
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
  return `<div class="nls-film" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video
        class="nls-film__video"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_102608_5fa1187d-9ac6-44fb-82ab-54376200abc0.mp4"
        autoplay
        muted
        loop
        playsinline
        webkit-playsinline
        preload="auto"
        disablepictureinpicture
        controlslist="nodownload nofullscreen noremoteplayback"
        aria-hidden="true"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_102608_5fa1187d-9ac6-44fb-82ab-54376200abc0.mp4" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark">LivOn</p>
        <h1 id="story-lifestage-title" class="nls-film__slogan">${c.hero.titleHtml}</h1>
        <p class="nls-film__lead">${escapeHtml(c.hero.lead)}</p>
        <div class="nls-film__actions">
          <a class="nls-btn" href="#nls-why" data-nls-scroll>${escapeHtml(c.hero.ctaMain)} →</a>
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
  return `<div id="nls-why" class="nls-block nls-why-sec" data-hs-section>
    <div class="nls-split">
      ${titleBlock(c.why.kicker, c.why.title, "")}
      <ol class="nls-roster">${rows}</ol>
    </div>
  </div>`;
}

function journeyBlock(c) {
  const rail = (c.journey.items || [])
    .map(
      (it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${escapeHtml(it.id)}" aria-pressed="${i === 0 ? "true" : "false"}">
        <em>${escapeHtml(it.n)}</em>
        <span>${escapeHtml(it.age)}</span>
      </button>`
    )
    .join("");
  const cards = (c.journey.items || [])
    .map(
      (it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${escapeHtml(it.id)}" data-scene="${escapeHtml(it.id)}">
        <div class="nls-decade__mark" aria-hidden="true">
          <b>${escapeHtml(it.age)}</b>
          <em>${escapeHtml(it.n)}</em>
        </div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${escapeHtml(it.n)}</p>
          <p class="nls-decade__age">${escapeHtml(it.age)}</p>
          <h3>${escapeHtml(it.name)}</h3>
          <p class="nls-decade__lead">${escapeHtml(it.lead)}</p>
          ${chips(it.topics)}
        </div>
      </article>`
    )
    .join("");
  return `<div id="nls-journey" class="nls-block nls-block--band nls-journey-sec" data-hs-section>
    ${titleBlock(c.journey.kicker, c.journey.title, c.journey.lead)}
    <div class="nls-rail" role="tablist" aria-label="${escapeHtml(c.hero.pathLabel)}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    <p class="nls-note">${escapeHtml(c.ui.journeyNote)}</p>
    <p class="nls-note">${escapeHtml(c.ui.ongilNote)}</p>
  </div>`;
}

function pillarsBlock(c) {
  if (!c.pillars) return "";
  const cards = (c.pillars.items || [])
    .map(
      (it) => `<article class="nls-flow__item">
        <span class="nls-flow__n">${escapeHtml(it.n)}</span>
        <h3>${escapeHtml(it.name)}</h3>
        <p>${escapeHtml(it.lead)}</p>
      </article>`
    )
    .join("");
  return `<div id="nls-pillars" class="nls-block nls-pillars-sec" data-hs-section>
    ${titleBlock(c.pillars.kicker, c.pillars.title, c.pillars.lead)}
    <p class="nls-note">${escapeHtml(c.ui.pillarsNote || "")}</p>
    <div class="nls-flow">${cards}</div>
  </div>`;
}

function firstBlock(c) {
  if (!c.first) return "";
  const cards = (c.first.items || [])
    .map(
      (it) => `<article class="nls-board__item">
        <div class="nls-board__meta">
          <span class="nls-board__n">${escapeHtml(it.n)}</span>
        </div>
        <h3>${escapeHtml(it.name)}</h3>
        <p>${escapeHtml(it.lead)}</p>
        ${it.topics ? chips(it.topics) : ""}
      </article>`
    )
    .join("");
  return `<div id="nls-first" class="nls-block nls-first-sec" data-hs-section>
    ${titleBlock(c.first.kicker, c.first.title, c.first.lead)}
    <p class="nls-note">${escapeHtml(c.ui.firstNote || "")}</p>
    <div class="nls-board">${cards}</div>
  </div>`;
}

function changesBlock(c) {
  if (!c.changes) return "";
  const rows = (c.changes.items || [])
    .map(
      (t, i) => `<li>
        <span>${String(i + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(t)}</strong>
      </li>`
    )
    .join("");
  return `<div id="nls-changes" class="nls-block nls-block--band nls-changes-sec" data-hs-section>
    ${titleBlock(c.changes.kicker, c.changes.title, c.changes.lead)}
    <p class="nls-note">${escapeHtml(c.ui.changeNote || "")}</p>
    <ol class="nls-index">${rows}</ol>
  </div>`;
}

function platformBlock(c) {
  const cards = (c.platform.items || [])
    .map(
      (it) => `<article class="nls-proc__item">
        <span class="nls-proc__n">${escapeHtml(it.n)}</span>
        <h3>${escapeHtml(it.name)}</h3>
        <p>${escapeHtml(it.lead)}</p>
        ${it.topics ? chips(it.topics) : ""}
      </article>`
    )
    .join("");
  return `<div id="nls-platform" class="nls-block nls-platform-sec" data-hs-section>
    ${titleBlock(c.platform.kicker, c.platform.title, c.platform.lead)}
    <div class="nls-proc">${cards}</div>
  </div>`;
}

function areasBlock(c) {
  if (!c.areas) return "";
  const cards = (c.areas.items || [])
    .map(
      (it) => `<article class="nls-signal__item">
        <span class="nls-signal__n">${escapeHtml(it.n)}</span>
        <div class="nls-signal__copy">
          <h3>${escapeHtml(it.name)}</h3>
          <p>${escapeHtml(it.lead)}</p>
          ${it.topics ? chips(it.topics) : ""}
        </div>
      </article>`
    )
    .join("");
  return `<div id="nls-areas" class="nls-block nls-block--band nls-areas-sec" data-hs-section>
    ${titleBlock(c.areas.kicker, c.areas.title, c.areas.lead)}
    <p class="nls-note">${escapeHtml(c.ui.areasNote || "")}</p>
    <div class="nls-signal">${cards}</div>
  </div>`;
}

function relatedBlock(c) {
  if (!c.related) return "";
  const stages = (c.related.items || [])
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
  return `<div id="nls-related" class="nls-block nls-related-sec" data-hs-section>
    <div class="nls-split">
      <div>
        ${titleBlock(c.related.kicker, c.related.title, c.related.lead)}
        <p class="nls-note">${escapeHtml(c.ui.relatedNote || "")}</p>
      </div>
      <ol class="nls-dir">${stages}</ol>
    </div>
  </div>`;
}

function howBlock(c) {
  const steps = (c.how.steps || [])
    .map(
      (s, i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}">
        <p class="nls-pipe__n">${escapeHtml(s.n)}</p>
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.body)}</p>
      </article>`
    )
    .join("");
  return `<div id="nls-how" class="nls-block nls-how-sec" data-hs-section>
    ${titleBlock(c.how.kicker, c.how.title, "")}
    <p class="nls-status">${escapeHtml(c.ui.planned)}</p>
    <p class="nls-note">${escapeHtml(c.how.note)}</p>
    <div class="nls-pipe">${steps}</div>
  </div>`;
}

function expandBlock(c) {
  const stages = (c.expand.stages || [])
    .map(
      (s) => `<article class="nls-lane__item">
        <span class="nls-lane__n">${escapeHtml(s.n)}</span>
        <div class="nls-lane__copy">
          <h3>${escapeHtml(s.name)}</h3>
          <p>${escapeHtml(s.body)}</p>
        </div>
      </article>`
    )
    .join("");
  return `<div id="nls-expand" class="nls-block nls-expand-sec" data-hs-section>
    ${titleBlock(c.expand.kicker, c.expand.title, "")}
    <p class="nls-note">${escapeHtml(c.ui.expandNote)}</p>
    <p class="nls-note">${escapeHtml(c.expand.note)}</p>
    <div class="nls-lane">${stages}</div>
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
    ${heroBlock(c, L)}
  <div class="nls__wrap">
    ${back}
    ${whyBlock(c)}
    ${journeyBlock(c)}
    ${pillarsBlock(c)}
    ${firstBlock(c)}
    ${changesBlock(c)}
    ${platformBlock(c)}
    ${areasBlock(c)}
    ${howBlock(c)}
    ${expandBlock(c)}
    ${relatedBlock(c)}
    ${closeBlock(c, L)}
  </div>
</section>`;
}
