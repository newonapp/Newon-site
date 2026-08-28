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
    return `<div class="lx-viz lx-viz--pipeline" aria-hidden="true">
      <span>CHOICE</span><i></i><span>MEMORY</span><i></i><span>CONSEQUENCE</span>
    </div>`;
  }
  if (slug === "character-lab") {
    return `<div class="lx-viz lx-viz--term" aria-hidden="true">
      <pre>&gt; CHARACTER LAB
&gt; STATUS: BUILDING
&gt; PUBLIC ASSETS: NONE_</pre>
    </div>`;
  }
  return "";
}

function ctaLabel(copy) {
  const base = (copy.viewExperiment || "VIEW EXPERIMENT").replace(/\s*[→↗]\s*$/, "").trim();
  return escapeHtml(base);
}

/** Minimal footer nav for Labs — back link + compact Resources links. */
export function labsBackNav(copies, lang, base = "../") {
  const copy = copies.labs || {};
  const idx = copies.index || {};
  const backLabel = escapeHtml(
    copy.backToResources || (lang === "ko" ? "← Resources로 돌아가기" : "← Back to Resources")
  );
  const items = [
    { slug: "store", href: `${base}store/` },
    { slug: "insights", href: `${base}insights/` },
    { slug: "blog", href: `${base}blog/` },
    { slug: "labs", href: `${base}labs/`, current: true },
  ];
  const labels = {
    store: idx.indexItems?.store?.title || "Store",
    insights: idx.indexItems?.insights?.title || "Insights",
    blog: idx.indexItems?.blog?.title || "Blog",
    labs: copy.navLabel || "Labs",
  };
  const links = items
    .map((it, i) => {
      const label = escapeHtml(labels[it.slug] || it.slug);
      const sep = i > 0 ? '<span class="lx-back__sep" aria-hidden="true"> · </span>' : "";
      if (it.current) {
        return `${sep}<span class="lx-back__here" aria-current="page">${label}</span>`;
      }
      return `${sep}<a class="lx-back__link" href="${escapeHtml(it.href)}">${label}</a>`;
    })
    .join("");

  return `<nav class="rs-section lx-back" aria-label="Resources navigation">
  <div class="rs-inner lx-back__inner">
    <a class="lx-back__return" href="${escapeHtml(base)}">${backLabel}</a>
    <p class="lx-back__links">${links}</p>
  </div>
</nav>`;
}

/**
 * @param {object} copies
 * @param {string} lang
 * @param {{ getLabsExperiments: Function, getLabStatusCounts: Function, breadcrumb: Function, heroBlock: Function, resourceSwitcher: Function, brHeadline: Function }} ctx
 */
export function buildLabsHubBody(copies, lang, ctx) {
  const copy = copies.labs;
  const experiments = ctx.getLabsExperiments().slice().sort((a, b) => (a.labNumber || 0) - (b.labNumber || 0));
  const counts = ctx.getLabStatusCounts();
  const total = experiments.length;
  const testingN = counts.TESTING || 0;
  const researchN = counts.RESEARCH || 0;

  const filterDefs = [
    { key: "all", label: copy.filterAll || "ALL", count: total },
    { key: "TESTING", label: copy.activeLabel || "TESTING", count: testingN },
    { key: "RESEARCH", label: copy.researchLabel || "RESEARCH", count: researchN },
  ];

  const filters = filterDefs
    .map(
      (f, i) =>
        `<button type="button" class="lx-filter__btn${i === 0 ? " is-active" : ""}" data-rs-lab-filter="${escapeHtml(f.key)}" aria-pressed="${i === 0 ? "true" : "false"}">${escapeHtml(f.label)} <span class="lx-filter__n">${pad2(f.count)}</span></button>`
    )
    .join("");

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
      <span class="lx-cta lx-cta--bar">${ctaLabel(copy)} <i aria-hidden="true">↗</i></span>
    </a>`;
  }

  const stack = experiments.map((e, i) => card(e, i % 2 === 1 ? "flip" : "plain")).join("\n");

  const defaultStages =
    lang === "ko"
      ? [
          { stage: "RESEARCH", desc: "문제를 찾고 가설을 세웁니다." },
          { stage: "PROTOTYPE", desc: "가장 작은 형태로 만듭니다." },
          { stage: "TESTING", desc: "실제 반응을 확인합니다." },
          { stage: "VALIDATED", desc: "계속 만들 가치가 있는지 판단합니다." },
          { stage: "PRODUCT", desc: "검증된 실험을 제품으로 발전시킵니다." },
        ]
      : [
          { stage: "RESEARCH", desc: "Find problems and form hypotheses." },
          { stage: "PROTOTYPE", desc: "Build the smallest useful version." },
          { stage: "TESTING", desc: "Check real-world response." },
          { stage: "VALIDATED", desc: "Decide if it's worth continuing." },
          { stage: "PRODUCT", desc: "Graduate validated work into product." },
        ];
  const stageDetails = copy.lifeStageDetails || defaultStages;
  const stageCount = stageDetails.length;
  const lifeStages = stageDetails
    .map(
      (s, i) =>
        `<li class="bp-proc__step" style="--i:${i}">
      <span class="bp-proc__n" aria-hidden="true">${pad2(i + 1)}</span>
      <span class="bp-proc__label">${pad2(i + 1)}</span>
      <span class="bp-proc__t">${escapeHtml(s.stage)}</span>
      <span class="bp-proc__d">${escapeHtml(s.desc)}</span>
    </li>`
    )
    .join("");

  return `${ctx.breadcrumb(copy, copy.navLabel || "LABS")}
${ctx.heroBlock(copy)}
${ctx.resourceSwitcher("labs", copies)}

<section class="rs-section lx-archive" id="rs-content" data-rs-lab-archive>
  <div class="rs-inner">
    <header class="lx-experiments-head">
      <p class="lx-k">${escapeHtml(copy.experimentsTitle || "EXPERIMENTS")}</p>
    </header>

    <div class="lx-filter" role="tablist" aria-label="Status filter">${filters}</div>
    <p class="lx-empty" data-rs-lab-empty hidden aria-hidden="true">${escapeHtml(copy.emptyTitle || "")}</p>

    <div class="lx-stack" data-rs-lab-grid>
      ${stack}
    </div>
  </div>
</section>

<section class="lx-life" data-rs-reveal aria-labelledby="lx-life-title">
  <div class="rs-inner lx-life__shell">
    <div class="lx-life__hero">
      <div class="lx-life__copy">
        <p class="lx-life__eyebrow">${escapeHtml(copy.lifeEyebrow || "FROM QUESTION TO PRODUCT")}</p>
        <h2 class="lx-life__title" id="lx-life-title">${br(copy.lifeTitle)}</h2>
        ${copy.lifeLead ? `<p class="lx-life__lead">${escapeHtml(copy.lifeLead)}</p>` : ""}
      </div>
    </div>
    <ol class="bp-proc lx-life__proc" style="--bp-proc-n:${stageCount}">${lifeStages}</ol>
  </div>
</section>

<section class="lx-close" data-rs-reveal aria-labelledby="lx-close-title">
  <div class="rs-inner lx-close__shell">
    <div class="lx-close__grid">
      <div class="lx-close__copy">
        <p class="lx-close__eyebrow">${escapeHtml(copy.closeEyebrow || "NEWON LABS")}</p>
        <h2 class="lx-close__title" id="lx-close-title">${br(copy.closeTitle)}</h2>
        ${copy.closeLead ? `<p class="lx-close__lead">${escapeHtml(copy.closeLead)}</p>` : ""}
        <div class="lx-close__actions">
          <a class="lx-close__btn lx-close__btn--primary" href="${escapeHtml(copy.productsHref || "../../products/")}">${escapeHtml(copy.closeProducts || "EXPLORE PRODUCTS ↗")}</a>
          <a class="lx-close__btn lx-close__btn--ghost" href="${escapeHtml(copy.ideasHref || "../../ideas/")}">${escapeHtml(copy.closeIdea || "SUBMIT AN IDEA ↗")}</a>
        </div>
      </div>
    </div>
  </div>
</section>
${labsBackNav(copies, lang)}`;
}
