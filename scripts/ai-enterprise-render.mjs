/**
 * Newon AI — Enterprise AI introduction body.
 * Reuses Personal AI hub styles (cai-*). No live-product claims.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getAiEnterpriseCopy } from "./ai-enterprise-copy.mjs";
import { renderAiSwitch } from "./ai-hub-render.mjs";
import { renderAiFilmHero } from "./ai-film-hero.mjs";

function nl(s) {
  return escapeHtml(String(s || "").replace(/<br\s*\/?>/gi, "\n")).replace(/\n/g, "<br />");
}

function head(c) {
  return `<header class="cai-ent-head">
      <p class="cai-more__eyebrow">${escapeHtml(c.kicker)}</p>
      <h2 class="cai-more__title">${nl(c.title)}</h2>
      ${c.lead ? `<p class="cai-hero__lead">${escapeHtml(c.lead)}</p>` : ""}
    </header>`;
}

function feats(items) {
  if (!items || !items.length) return "";
  return `<ul class="cai-card__feats">${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
}

function cards(items, c) {
  const plannedFlag = c.plannedFlag || "";
  const buildFlag = c.buildFlag || "";
  return (items || [])
    .map(
      (a) => `<article class="cai-card cai-ent-card">
        <p class="cai-card__type">${escapeHtml(a.n)}${a.en ? ` · ${escapeHtml(a.en)}` : ""}</p>
        <h3 class="cai-card__name">${escapeHtml(a.title)}</h3>
        ${a.planned ? `<p class="cai-ent-flag">${escapeHtml(plannedFlag)}</p>` : a.buildable && buildFlag ? `<p class="cai-ent-flag cai-ent-flag--build">${escapeHtml(buildFlag)}</p>` : ""}
        <p class="cai-card__title">${escapeHtml(a.body)}</p>
        ${feats(a.uses)}
        ${a.note ? `<p class="cai-ent-note">${escapeHtml(a.note)}</p>` : ""}
      </article>`
    )
    .join("");
}

function list(items, c = {}) {
  const plannedFlag = c.plannedFlag || "";
  const buildFlag = c.buildFlag || "";
  return `<ol class="cai-ent-list">${(items || [])
    .map((it, i) => {
      if (typeof it === "string") {
        return `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${escapeHtml(it)}</p></li>`;
      }
      const n = it.n || String(i + 1).padStart(2, "0");
      const name = it.title || it.name || "";
      const body = it.body || "";
      const flag = it.planned ? plannedFlag : it.buildable ? buildFlag : "";
      return `<li><span>${escapeHtml(n)}</span><div><p class="cai-ent-list__name">${escapeHtml(name)}</p>${flag ? `<p class="cai-ent-flag">${escapeHtml(flag)}</p>` : ""}${body ? `<p>${escapeHtml(body)}</p>` : ""}${feats(it.uses)}</div></li>`;
    })
    .join("")}</ol>`;
}

function catalog(id, cls, c, inner, note) {
  if (!c) return "";
  return `<section class="cai-catalog${cls ? ` ${cls}` : ""}" id="${id}" data-ai-reveal>
    <div class="hub-inner">
      ${head(c)}
      ${inner}
      ${note ? `<p class="cai-ent-note">${escapeHtml(note)}</p>` : ""}
    </div>
  </section>`;
}

export function renderAiEnterpriseBody(flat, flatEn, lang) {
  const langDir = typeof lang === "string" ? lang : lang?.dir || "en";
  const c = getAiEnterpriseCopy(langDir);

  return `<div class="ai-page cai-page cai-ent" data-ai-page>
  ${renderAiFilmHero("enterprise", langDir)}
  ${renderAiSwitch(flat, flatEn, { active: "enterprise", personalHref: "../", enterpriseHref: "./" })}
  <section id="cai-hero" class="cai-hero cai-hero--edit" data-ai-reveal>
    <div class="hub-inner cai-hero__grid">
      <div class="cai-hero__copy">
        <p class="cai-hero__eyebrow">${escapeHtml(c.kicker)}</p>
        <h1 class="cai-hero__title">${nl(c.titleHtml)}</h1>
        <p class="cai-hero__lead">${escapeHtml(c.lead)}</p>
        <div class="cai-hero__actions">
          <a class="cai-btn cai-btn--primary" href="#cai-ent-areas">${escapeHtml(c.areasKicker)} ↓</a>
          <a class="cai-btn cai-btn--ghost" href="../../business/inquiry/">${escapeHtml(c.ctaInquiry)} ↗</a>
        </div>
        <p class="cai-hero__meta">${escapeHtml(c.status)}</p>
      </div>
      <aside class="cai-hero__visual" aria-hidden="true">
        <p class="cai-mark">
          <span class="cai-mark__line">AI</span>
          <span class="cai-mark__dot"></span>
          <span class="cai-mark__line">NEWON</span>
        </p>
      </aside>
    </div>
  </section>

  ${catalog(
    "cai-ent-why",
    "",
    c.why,
    `${(c.why.body || []).map((p) => `<p class="cai-ent-prose">${escapeHtml(p)}</p>`).join("")}${list(c.why.items, c)}`
  )}

  ${catalog("cai-ent-areas", "", { kicker: c.areasKicker, title: c.areasTitle, lead: c.areasLead }, `${c.areasLegend ? `<p class="cai-ent-note cai-ent-legend">${escapeHtml(c.areasLegend)}</p>` : ""}<div class="cai-grid cai-ent-grid" aria-label="${escapeHtml(c.areasKicker)}">${cards(c.areas, c)}</div>`)}

  ${c.solutions ? catalog("cai-ent-solutions", "", c.solutions, `<div class="cai-grid cai-ent-grid" aria-label="${escapeHtml(c.solutions.kicker)}">${cards(c.solutions.items, c)}</div>`, c.solutions.note) : ""}

  ${catalog("cai-ent-caps", "", c.caps, `<div class="cai-grid cai-ent-grid" aria-label="${escapeHtml(c.caps.kicker)}">${cards(c.caps.items, c)}</div>`)}

  ${catalog("cai-ent-depts", "cai-ent-cases", c.depts, list(c.depts.items, c))}

  ${catalog("cai-ent-scale", "", c.scale, `<div class="cai-grid cai-ent-grid">${cards(c.scale.items, c)}</div>`, c.scale.note)}

  ${catalog("cai-ent-industry", "", c.industry, `<div class="cai-grid cai-ent-grid">${cards(c.industry.items, c)}</div>`, c.industry.note)}

  ${catalog("cai-ent-arch", "cai-ent-cases", c.arch, list(c.arch.items, c), c.arch.note)}

  ${catalog("cai-ent-security", "cai-ent-cases", c.security, list(c.security.items, c), c.security.note)}

  ${c.tech ? catalog("cai-ent-tech", "", c.tech, `<div class="cai-grid cai-ent-grid" aria-label="${escapeHtml(c.tech.kicker)}">${cards(c.tech.items, c)}</div>`, c.tech.note) : ""}

  ${catalog("cai-ent-process", "cai-ent-cases", c.process, list(c.process.steps, c), c.process.note)}

  ${catalog("cai-ent-model", "", c.model, `<div class="cai-grid cai-ent-grid">${cards(c.model.items, c)}</div>`, c.model.note)}

  ${catalog("cai-ent-roadmap", "cai-ent-cases", c.roadmap, list(c.roadmap.stages, c), c.roadmap.note)}

  ${c.related ? catalog("cai-ent-related", "cai-ent-cases", c.related, list(c.related.items, c), c.related.note) : ""}

  <section class="cai-close" id="cai-ent-next" data-ai-reveal>
    <div class="hub-inner cai-close__shell">
      <p class="cai-close__eyebrow">${escapeHtml(c.closeKicker)}</p>
      <h2 class="cai-close__title">${nl(c.closeTitleHtml)}</h2>
      <p class="cai-close__lead">${escapeHtml(c.closeLead)}</p>
      ${c.closeTopics ? `<ol class="cai-ent-list cai-ent-list--on-ink">${c.closeTopics.map((item, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${escapeHtml(item)}</p></li>`).join("")}</ol>` : ""}
      ${c.note ? `<p class="cai-close__lead">${escapeHtml(c.note)}</p>` : ""}
      <div class="cai-close__actions">
        <a class="cai-close__btn cai-close__btn--primary" href="../../business/inquiry/">${escapeHtml(c.ctaInquiry)}</a>
        <a class="cai-close__btn cai-close__btn--ghost" href="../">${escapeHtml(c.ctaPersonal || c.personal)}</a>
      </div>
    </div>
  </section>
</div>`;
}
