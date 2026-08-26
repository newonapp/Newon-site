function stageProgress(exp, lang) {
  const u = ui(lang);
  const idx = pipelineIndex(exp.stage === "PRODUCT" ? "PRODUCT" : exp.stage);
  const steps = LAB_PIPELINE.map((s, i) => {
    const state = i < idx ? "is-done" : i === idx ? "is-current" : "";
    return `<li class="ld-pipe__step ${state}"><span class="ld-pipe__name">${escapeHtml(s)}</span>${i < LAB_PIPELINE.length - 1 ? '<i aria-hidden="true">→</i>' : ""}</li>`;
  }).join("");

  const productCta =
    exp.status === "VALIDATED" && exp.relatedProduct
      ? `<div class="ld-became">
          <p class="ld-mono">${escapeHtml(u.becameProduct)}</p>
          <a class="ld-cta" href="${escapeHtml(lang === "ko" ? exp.relatedProduct.hrefKo : exp.relatedProduct.hrefEn)}">${escapeHtml(u.viewProduct)} <i aria-hidden="true">↗</i></a>
        </div>`
      : "";

  return `<nav class="ld-pipe" aria-label="${escapeHtml(u.pipelineLabel)}">
    <p class="ld-k">${escapeHtml(u.pipelineLabel)}</p>
    <ol class="ld-pipe__list">${steps}</ol>
    ${productCta}
  </nav>`;
}

const LIVE_ANCHORS = {
  "review-ai": "#live-experiment",
  "newon-qr": "#live-qr",
  "newon-form": "#form-builder",
  "ai-experiment": "#idea-test",
  "game-experiment": "#the-experiment",
};

function fmtUpdated(iso) {
  if (!iso) return "—";
  return String(iso).replace(/-/g, ".").slice(0, 7);
}

function hero(exp, lang) {
  const n = padLab(exp.labNumber);
  const cat = String(exp.category || "").toUpperCase();
  const titleBreak = t(exp, lang, "hubTitleBreakKo", "hubTitleBreakEn");
  const title =
    titleBreak || t(exp, lang, "displayTitleKo", "displayTitleEn") || t(exp, lang, "titleKo", "titleEn");
  const lead =
    t(exp, lang, "hubLeadKo", "hubLeadEn") || t(exp, lang, "heroLeadKo", "heroLeadEn");
  const desc = t(exp, lang, "descKo", "descEn");
  const question =
    t(exp, lang, "questionKo", "questionEn") || t(exp, lang, "questionListKo", "questionListEn");
  const stage = t(exp, lang, "stageLabelKo", "stageLabelEn") || exp.stage || exp.status;
  const stageShort = String(stage).replace(/^0\d\s*\/\s*/, "");
  const updated = fmtUpdated(exp.updatedAt);
  const viz = labVisual(exp.slug);
  const liveHref = LIVE_ANCHORS[exp.slug] || "#lab-note";
  const bandLabel =
    exp.labNumber === 1 ? "FEATURED EXPERIMENT" : "EXPERIMENT";

  return `<header class="lx-feat lx-feat--static ld-hero" id="experiment-hero">
    <div class="lx-feat__band">
      <p class="lx-k">${escapeHtml(bandLabel)}</p>
      <p class="lx-feat__id"><span class="lx-mono">${n}</span><span aria-hidden="true">/</span><span class="lx-mono">${escapeHtml(exp.status)}</span><span aria-hidden="true">/</span><span class="lx-mono">${escapeHtml(cat)}</span></p>
    </div>
    <div class="lx-feat__grid">
      <div class="lx-feat__main">
        <p class="lx-feat__num" aria-hidden="true">${n}</p>
        <h1 class="lx-feat__title">${br(title)}</h1>
        <p class="lx-feat__lead">${br(lead)}</p>
        <p class="lx-feat__desc">${escapeHtml(desc)}</p>
        <dl class="lx-feat__dl">
          <div><dt>STATUS</dt><dd class="lx-mono">${escapeHtml(exp.status)}</dd></div>
          <div><dt>STAGE</dt><dd class="lx-mono">${escapeHtml(stageShort)}</dd></div>
          <div><dt>CATEGORY</dt><dd class="lx-mono">${escapeHtml(cat)}</dd></div>
          <div><dt>UPDATED</dt><dd class="lx-mono">${escapeHtml(updated)}</dd></div>
        </dl>
        <a class="lx-cta" href="${escapeHtml(liveHref)}">VIEW EXPERIMENT <i aria-hidden="true">↗</i></a>
      </div>
      <div class="lx-feat__side">
        <p class="lx-k">THE QUESTION</p>
        <p class="lx-feat__q">${br(question)}</p>
        ${viz}
      </div>
    </div>
    ${stageProgress(exp, lang)}
  </header>`;
}

function labNote(exp, lang) {
  const u = ui(lang);
  const findings = t(exp, lang, "findingsKo", "findingsEn") || "—";
  const next = t(exp, lang, "nextStepKo", "nextStepEn") || t(exp, lang, "nextKo", "nextEn") || "—";
  return `<section class="ld-section ld-note" id="lab-note">
    <p class="ld-k">${escapeHtml(u.labNote)}</p>
    <div class="ld-note__grid">
      <article>
        <p class="ld-k ld-k--sm">${escapeHtml(u.findings)}</p>
        <p class="ld-body">${escapeHtml(findings)}</p>
      </article>
      <article>
        <p class="ld-k ld-k--sm">${escapeHtml(u.nextVerify)}</p>
        <p class="ld-body">${escapeHtml(next)}</p>
      </article>
    </div>
  </section>`;
}

function detailCtas(lang) {
  const u = ui(lang);
  return `<section class="ld-close" aria-label="Experiment actions">
    <div class="ld-close__inner">
      <a class="ld-cta ld-cta--ghost" href="../">${escapeHtml(u.backLabs)}</a>
      <a class="ld-cta" href="#lab-note">${escapeHtml(u.follow.replace(/\s*→\s*$/, ""))} <i aria-hidden="true">↗</i></a>
    </div>
  </section>`;
}

function metricDash(value) {
  return value == null || value === "" ? "—" : escapeHtml(String(value));
}