/**
 * Newon Labs hub — editorial R&D archive body HTML.
 */
import { escapeHtml } from "./hub-utils.mjs";

function t(obj, lang, koKey, enKey) {
  if (!obj) return "";
  return lang === "ko" ? obj[koKey] || obj[enKey] || "" : obj[enKey] || obj[koKey] || "";
}

function br(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function fmtUpdated(iso) {
  if (!iso) return "—";
  return String(iso).replace(/-/g, ".").slice(0, 7);
}

export function labVisual(slug) {
  if (slug === "review-ai") {
    return `<div class="lx-viz lx-viz--pipeline" aria-hidden="true">
      <span>USER REVIEW</span><i></i><span>SIGNAL</span><i></i><span>PATTERN</span><i></i><span>DECISION</span>
    </div>`;
  }
  if (slug === "newon-qr") {
    return `<div class="lx-viz lx-viz--qr" aria-hidden="true">
      <div class="lx-qr-mark">
        <span></span><span></span><span></span><span></span>
      </div>
      <ol class="lx-flow">
        <li>QR</li><li>SCAN</li><li>VISIT</li><li>DATA</li>
      </ol>
    </div>`;
  }
  if (slug === "newon-form") {
    return `<div class="lx-viz lx-viz--form" aria-hidden="true">
      <p>NAME</p><div class="lx-wire"></div>
      <p>EMAIL</p><div class="lx-wire"></div>
      <p>MESSAGE</p><div class="lx-wire lx-wire--lg"></div>
      <span class="lx-wire-cta">SUBMIT →</span>
    </div>`;
  }
  if (slug === "ai-experiment") {
    return `<div class="lx-viz lx-viz--pipeline lx-viz--ai" aria-hidden="true">
      <span class="is-dim">PROBLEM</span><i></i>
      <span class="is-dim">SIGNAL</span><i></i>
      <span class="is-dim">AI FIT</span><i></i>
      <span class="is-on">RESEARCH</span><i></i>
      <span class="is-dim">PROTOTYPE</span>
    </div>`;
  }
  if (slug === "game-experiment") {
    return `<div class="lx-viz lx-viz--term" aria-hidden="true">
      <pre>&gt; CHOICE RECORDED
&gt; MEMORY UPDATED
&gt; CONSEQUENCE PENDING_</pre>
    </div>`;
  }
  return "";
}

function ctaLabel(copy, n) {
  const base = (copy.viewExperiment || "VIEW EXPERIMENT").replace(/\s*[→↗]\s*$/, "").trim();
  return escapeHtml(base);
}

/**
 * @param {object} copies
 * @param {string} lang
 * @param {{ getLabsExperiments: Function, getLabStatusCounts: Function, breadcrumb: Function, heroBlock: Function, resourceSwitcher: Function, exploreGrid: Function, brHeadline: Function, visualLabStatus?: Function }} ctx
 */
export function buildLabsHubBody(copies, lang, ctx) {
  const copy = copies.labs;
  const experiments = ctx.getLabsExperiments().slice().sort((a, b) => (a.labNumber || 0) - (b.labNumber || 0));
  const counts = ctx.getLabStatusCounts();
  const total = experiments.length;
  // Spec counts: TESTING (+ ACTIVE), RESEARCH
  const testingOnly = (counts.TESTING || 0) + (counts.ACTIVE || 0);
  const researchN = counts.RESEARCH || 0;

  const filterDefs = [
    { key: "all", label: copy.filterAll || "ALL", count: total },
    { key: "TESTING", label: copy.activeLabel || "TESTING", count: testingOnly },
    { key: "RESEARCH", label: copy.researchLabel || "RESEARCH", count: researchN },
  ];

  const filters = filterDefs
    .map(
      (f, i) =>
        `<button type="button" class="lx-filter__btn${i === 0 ? " is-active" : ""}" data-rs-lab-filter="${escapeHtml(f.key)}" aria-pressed="${i === 0 ? "true" : "false"}">${escapeHtml(f.label)} <span class="lx-filter__n">${pad2(f.count)}</span></button>`
    )
    .join("");

  const metaPanel = `<aside class="lx-meta" aria-label="Lab status">
    <p class="lx-meta__brand">${escapeHtml(copy.statusTitle || "NEWON LABS")}</p>
    <p class="lx-meta__cycle"><span>${escapeHtml(copy.cycleLabel || "CURRENT CYCLE")}</span><strong>${escapeHtml(copy.cycleValue || "2026.08")}</strong></p>
    <dl class="lx-meta__stats">
      <div><dt>${escapeHtml(copy.statsExperiments || "EXPERIMENTS")}</dt><dd>${pad2(total)}</dd></div>
      <div><dt>${escapeHtml(copy.activeLabel || "TESTING")}</dt><dd>${pad2(testingOnly)}</dd></div>
      <div><dt>${escapeHtml(copy.researchLabel || "RESEARCH")}</dt><dd>${pad2(researchN)}</dd></div>
    </dl>
    <p class="lx-meta__next"><span>${escapeHtml(copy.nextReleaseLabel || "NEXT RELEASE")}</span><strong>${escapeHtml(copy.nextReleaseValue || "TBA")}</strong></p>
  </aside>`;

  function card(e, variant) {
    const n = pad2(e.labNumber || 0);
    const titleBreak = t(e, lang, "hubTitleBreakKo", "hubTitleBreakEn");
    const title = titleBreak || t(e, lang, "titleKo", "titleEn");
    const lead = t(e, lang, "hubLeadKo", "hubLeadEn") || t(e, lang, "listDescKo", "listDescEn");
    const desc = t(e, lang, "descKo", "descEn");
    const question =
      t(e, lang, "questionListKo", "questionListEn") || t(e, lang, "questionKo", "questionEn");
    const cat = String(e.category || "").toUpperCase();
    const viz = labVisual(e.slug);
    const flip = variant === "flip";

    return `<a class="lx-card lx-card--${escapeHtml(e.slug)}${flip ? " is-flip" : ""}" href="${escapeHtml(e.slug)}/" data-rs-lab-item data-rs-lab-status="${escapeHtml(e.status)}" data-lx-slug="${escapeHtml(e.slug)}">
      <div class="lx-card__head">
        <span class="lx-card__num" aria-hidden="true">${n}</span>
        <span class="lx-card__rule" aria-hidden="true"></span>
        <span class="lx-mono lx-card__meta">${escapeHtml(e.status)} / ${escapeHtml(cat)}</span>
      </div>
      <div class="lx-card__body${flip ? " is-flip" : ""}">
        <div class="lx-card__copy">
          <h3 class="lx-card__title">${br(titleBreak || title)}</h3>
          <p class="lx-card__lead">${br(lead)}</p>
          <p class="lx-card__desc">${escapeHtml(desc)}</p>
          <div class="lx-card__q">
            <p class="lx-k">${escapeHtml(copy.questionLabel || "THE QUESTION")}</p>
            <p>${br(question)}</p>
          </div>
        </div>
        <div class="lx-card__viz">${viz}</div>
      </div>
      <span class="lx-cta lx-cta--bar">${ctaLabel(copy, n)} <i aria-hidden="true">↗</i></span>
    </a>`;
  }

  // Same card size for all — #01 matches #02–05 (no featured mega block)
  const stack = experiments.map((e, i) => card(e, i % 2 === 1 ? "flip" : "plain")).join("\n");

  const lifeStages = (copy.lifeStages || ["RESEARCH", "PROTOTYPE", "TESTING", "VALIDATED", "PRODUCT"])
    .map((s, i, arr) => `<li><span>${escapeHtml(s)}</span>${i < arr.length - 1 ? '<i aria-hidden="true">→</i>' : ""}</li>`)
    .join("");

  return `${ctx.breadcrumb(copy, copy.navLabel || "LABS")}
${ctx.heroBlock(copy, "")}
${ctx.resourceSwitcher("labs", copies)}
<section class="rs-section lx-archive" id="rs-content" data-rs-lab-archive>
  <div class="rs-inner">
    <header class="lx-index">
      <div class="lx-index__copy">
        <p class="lx-k">${escapeHtml(copy.indexTitle || "EXPERIMENT INDEX")} <span class="lx-k__sep" aria-hidden="true">/</span> <span class="lx-mono">${escapeHtml(copy.indexYear || "2026")}</span></p>
        <h2 class="lx-index__title" id="rs-labs-index-title">${br(copy.indexHeading || copy.indexTitle)}</h2>
        ${copy.indexLead ? `<p class="lx-index__lead">${escapeHtml(copy.indexLead)}</p>` : ""}
      </div>
      ${metaPanel}
    </header>

    <div class="lx-filter" role="tablist" aria-label="Status filter">${filters}</div>
    <p class="lx-empty" data-rs-lab-empty hidden>${escapeHtml(copy.emptyTitle || "")}</p>

    <div class="lx-stack" data-rs-lab-grid>
      ${stack}
    </div>
  </div>
</section>

<section class="rs-section lx-life" data-rs-reveal aria-labelledby="lx-life-title">
  <div class="rs-inner">
    <p class="lx-k">${escapeHtml(copy.lifeEyebrow || "FROM QUESTION TO PRODUCT")}</p>
    <h2 class="lx-life__title" id="lx-life-title">${br(copy.lifeTitle)}</h2>
    ${copy.lifeLead ? `<p class="lx-life__lead">${escapeHtml(copy.lifeLead)}</p>` : ""}
    <ol class="lx-life__pipe">${lifeStages}</ol>
  </div>
</section>

<section class="lx-close" data-rs-reveal aria-labelledby="lx-close-title">
  <div class="rs-inner lx-close__inner">
    <p class="lx-k lx-k--on-dark">${escapeHtml(copy.closeEyebrow || "NEWON LABS")}</p>
    <h2 class="lx-close__title" id="lx-close-title">${br(copy.closeTitle)}</h2>
    ${copy.closeLead ? `<p class="lx-close__lead">${escapeHtml(copy.closeLead)}</p>` : ""}
    <div class="lx-close__actions">
      <a class="lx-close__link" href="${escapeHtml(copy.productsHref || "../../products/")}">${escapeHtml(copy.closeProducts || "EXPLORE NEWON PRODUCTS ↗")}</a>
      <a class="lx-close__link lx-close__link--ghost" href="${escapeHtml(copy.ideasHref || "../../ideas/")}">${escapeHtml(copy.closeIdea || "SUBMIT AN IDEA ↗")}</a>
    </div>
  </div>
</section>
${ctx.exploreGrid(copies)}`;
}
