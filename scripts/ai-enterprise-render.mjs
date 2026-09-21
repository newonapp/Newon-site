/**
 * Newon AI — Enterprise AI introduction body.
 * Reuses Personal AI hub styles (cai-*). No live-product claims.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getAiEnterpriseCopy } from "./ai-enterprise-copy.mjs";
import { renderAiSwitch } from "./ai-hub-render.mjs";

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

function cards(items, plannedFlag) {
  return (items || [])
    .map(
      (a) => `<article class="cai-card cai-ent-card">
        <p class="cai-card__type">${escapeHtml(a.n)}${a.en ? ` · ${escapeHtml(a.en)}` : ""}</p>
        <h3 class="cai-card__name">${escapeHtml(a.title)}</h3>
        ${a.planned ? `<p class="cai-ent-flag">${escapeHtml(plannedFlag)}</p>` : ""}
        <p class="cai-card__title">${escapeHtml(a.body)}</p>
        ${feats(a.uses)}
        ${a.note ? `<p class="cai-ent-note">${escapeHtml(a.note)}</p>` : ""}
      </article>`
    )
    .join("");
}

function list(items) {
  return `<ol class="cai-ent-list">${(items || [])
    .map((it, i) => {
      if (typeof it === "string") {
        return `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${escapeHtml(it)}</p></li>`;
      }
      const n = it.n || String(i + 1).padStart(2, "0");
      const name = it.title || it.name || "";
      const body = it.body || "";
      return `<li><span>${escapeHtml(n)}</span><div><p class="cai-ent-list__name">${escapeHtml(name)}</p>${body ? `<p>${escapeHtml(body)}</p>` : ""}</div></li>`;
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
  const flag = c.plannedFlag || "";

  return `<div class="ai-page cai-page cai-ent" data-ai-page>
  ${renderAiSwitch(flat, flatEn, { active: "enterprise", personalHref: "../", enterpriseHref: "./" })}
  <section class="cai-hero cai-hero--edit" data-ai-reveal>
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
    `${(c.why.body || []).map((p) => `<p class="cai-ent-prose">${escapeHtml(p)}</p>`).join("")}${list(c.why.items)}`
  )}

  ${catalog("cai-ent-areas", "", { kicker: c.areasKicker, title: c.areasTitle, lead: c.areasLead }, `<div class="cai-grid cai-ent-grid" aria-label="${escapeHtml(c.areasKicker)}">${cards(c.areas, flag)}</div>`)}

  ${catalog("cai-ent-caps", "", c.caps, `<div class="cai-grid cai-ent-grid" aria-label="${escapeHtml(c.caps.kicker)}">${cards(c.caps.items, flag)}</div>`)}

  ${catalog("cai-ent-depts", "cai-ent-cases", c.depts, list(c.depts.items))}

  ${catalog("cai-ent-scale", "", c.scale, `<div class="cai-grid cai-ent-grid">${cards(c.scale.items, flag)}</div>`, c.scale.note)}

  ${catalog("cai-ent-industry", "", c.industry, `<div class="cai-grid cai-ent-grid">${cards(c.industry.items, flag)}</div>`, c.industry.note)}

  ${catalog("cai-ent-arch", "cai-ent-cases", c.arch, list(c.arch.items), c.arch.note)}

  ${catalog("cai-ent-security", "cai-ent-cases", c.security, list(c.security.items), c.security.note)}

  ${catalog("cai-ent-process", "cai-ent-cases", c.process, list(c.process.steps), c.process.note)}

  ${catalog("cai-ent-model", "", c.model, `<div class="cai-grid cai-ent-grid">${cards(c.model.items, flag)}</div>`, c.model.note)}

  ${catalog("cai-ent-roadmap", "cai-ent-cases", c.roadmap, list(c.roadmap.stages), c.roadmap.note)}

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
