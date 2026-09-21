/**
 * Newon AI — Enterprise AI introduction body.
 * Reuses Personal AI hub styles (cai-*). No live-product claims.
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { getAiEnterpriseCopy } from "./ai-enterprise-copy.mjs";
import { renderAiSwitch } from "./ai-hub-render.mjs";

function nl(s) {
  return escapeHtml(String(s || "").replace(/<br\s*\/?>/gi, "\n")).replace(/\n/g, "<br />");
}

export function renderAiEnterpriseBody(flat, flatEn, lang) {
  const langDir = typeof lang === "string" ? lang : lang?.dir || "en";
  const c = getAiEnterpriseCopy(langDir);
  const t = (k, fb) => {
    const v = pick(flat, flatEn, k);
    return escapeHtml(v != null && v !== "" ? String(v) : fb);
  };

  const areas = (c.areas || [])
    .map(
      (a) => `<article class="cai-card cai-ent-card">
        <p class="cai-card__type">${escapeHtml(a.n)}</p>
        <h3 class="cai-card__name">${escapeHtml(a.title)}</h3>
        <p class="cai-card__title">${escapeHtml(a.body)}</p>
      </article>`
    )
    .join("");

  const cases = (c.cases || [])
    .map((item, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${escapeHtml(item)}</p></li>`)
    .join("");

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

  <section class="cai-catalog" id="cai-ent-areas" data-ai-reveal>
    <div class="hub-inner">
      <header class="cai-ent-head">
        <p class="cai-more__eyebrow">${escapeHtml(c.areasKicker)}</p>
        <h2 class="cai-more__title">${nl(c.areasTitle)}</h2>
        <p class="cai-hero__lead">${escapeHtml(c.areasLead)}</p>
      </header>
      <div class="cai-grid cai-ent-grid" aria-label="${escapeHtml(c.areasKicker)}">
        ${areas}
      </div>
    </div>
  </section>

  <section class="cai-catalog cai-ent-cases" data-ai-reveal>
    <div class="hub-inner">
      <header class="cai-ent-head">
        <p class="cai-more__eyebrow">${escapeHtml(c.casesKicker)}</p>
        <h2 class="cai-more__title">${nl(c.casesTitle)}</h2>
        <p class="cai-hero__lead">${escapeHtml(c.casesLead)}</p>
      </header>
      <ol class="cai-ent-list">${cases}</ol>
      <p class="cai-ent-note">${escapeHtml(c.note)}</p>
    </div>
  </section>

  <section class="cai-close" id="cai-ent-next" data-ai-reveal>
    <div class="hub-inner cai-close__shell">
      <p class="cai-close__eyebrow">${escapeHtml(c.closeKicker)}</p>
      <h2 class="cai-close__title">${nl(c.closeTitleHtml)}</h2>
      <p class="cai-close__lead">${escapeHtml(c.closeLead)}</p>
      <div class="cai-close__actions">
        <a class="cai-close__btn cai-close__btn--primary" href="../../business/inquiry/">${escapeHtml(c.ctaInquiry)}</a>
        <a class="cai-close__btn cai-close__btn--ghost" href="../">${t("studio.aiSwitchPersonal", c.personal)}</a>
      </div>
    </div>
  </section>
</div>`;
}
