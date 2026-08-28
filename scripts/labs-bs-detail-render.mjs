/**
 * Labs experiment detail body — Business service design system (bs-*), matching Studio detail pages.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { LAB_PIPELINE, pipelineIndex, getLabsExperiments } from "./lab-experiments.mjs";
import { getLabDetailContent, LAB_DETAIL_RELATED } from "./lab-detail-content.mjs";
import { liveSection, aiBoard } from "./lab-detail-bodies.mjs";
import { labsHeroVisual } from "./labs-bs-visuals.mjs";

const LAB_NAV_LABELS = {
  "review-ai": "REVIEW AI",
  "newon-qr": "QR",
  "newon-form": "FORM",
  "ai-experiment": "AI DISC",
  "game-experiment": "GAME",
  "character-lab": "CHARACTER",
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function brHeadline(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function t(obj, lang, koKey, enKey) {
  if (!obj) return "";
  return lang === "ko" ? obj[koKey] || obj[enKey] || "" : obj[enKey] || obj[koKey] || "";
}

function fmtUpdated(iso) {
  if (!iso) return "";
  return String(iso).replace(/-/g, ".").slice(0, 7);
}

function ui(lang) {
  const ko = lang === "ko";
  return {
    crumbResources: "RESOURCES",
    crumbLabs: "LABS",
    overview: ko ? "개요" : "Overview",
    snapshot: "EXPERIMENT SNAPSHOT",
    question: "THE QUESTION",
    why: "WHY THIS EXPERIMENT",
    problem: "PROBLEM",
    hypothesis: "HYPOTHESIS",
    experiment: "EXPERIMENT",
    how: "HOW IT WORKS",
    testing: "WHAT WE'RE TESTING",
    signals: "WHAT WE OBSERVE",
    status: ko ? "현재 상태" : "Current status",
    pipeline: "LABS PIPELINE",
    next: "NEXT STEP",
    related: ko ? "관련 실험" : "Related experiments",
    live: "LIVE EXPERIMENT",
    tryLive: ko ? "라이브 실험 ↓" : "Try live experiment ↓",
    seeQuestion: ko ? "질문 보기 ↓" : "See the question ↓",
    backLabs: ko ? "Labs로 돌아가기" : "Back to Labs",
    submitIdea: ko ? "아이디어 제출 ↗" : "Submit an idea ↗",
    finalTitle: ko ? "실험은 질문에서 시작합니다" : "Every experiment starts with a question",
    finalLead: ko
      ? "검증된 실험은 Newon의 제품과 서비스로 이어집니다. 다른 실험을 탐색하거나 아이디어를 제출해 보세요."
      : "Validated experiments graduate into Newon products and services. Explore more experiments or submit an idea.",
    viewExp: "VIEW EXPERIMENT",
    experimentNo: "EXPERIMENT",
  };
}

function contentFor(exp, lang) {
  return getLabDetailContent(exp.slug, lang);
}

function experimentTitle(exp, lang) {
  return t(exp, lang, "displayTitleKo", "displayTitleEn") || t(exp, lang, "titleKo", "titleEn");
}

function breadcrumb(title, u) {
  return `<nav class="bs-crumb" aria-label="Breadcrumb">
    <div class="bs-inner">
      <a href="../../">${escapeHtml(u.crumbResources)}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <a href="../">${escapeHtml(u.crumbLabs)}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <span>${escapeHtml(title)}</span>
    </div>
  </nav>`;
}

function experimentNav(currentSlug) {
  const exps = getLabsExperiments().slice().sort((a, b) => (a.labNumber || 0) - (b.labNumber || 0));
  const links = exps
    .map((e) => {
      const label = escapeHtml(LAB_NAV_LABELS[e.slug] || String(e.category || "").toUpperCase());
      const isActive = e.slug === currentSlug;
      const cls = isActive ? "bs-nav__link is-active" : "bs-nav__link";
      const href = isActive ? "#" : `../${e.slug}/`;
      return `<a class="${cls}" href="${href}"${isActive ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");
  return `<nav class="bs-nav" aria-label="Labs experiments"><div class="bs-inner bs-nav__inner"><p class="bs-nav__label">EXPERIMENTS</p><div class="bs-nav__track">${links}</div></div></nav>`;
}

function heroSection(exp, content, lang, u) {
  const title = experimentTitle(exp, lang);
  const cat = content?.category || String(exp.categoryLabel || exp.category || "").toUpperCase();
  const headline = content?.headline || t(exp, lang, "heroLeadKo", "heroLeadEn");
  const desc = content?.description || t(exp, lang, "descKo", "descEn");
  const eyebrow = `NEWON LABS <span class="bs-eyebrow__sep" aria-hidden="true">·</span> <span class="bs-eyebrow__sub">${escapeHtml(cat)}</span>`;

  return `<section class="bs-hero" data-bs-reveal aria-labelledby="bs-hero-title">
  <div class="bs-inner bs-hero__grid">
    <div>
      <p class="bs-eyebrow">${eyebrow}</p>
      <h1 class="bs-hero__title" id="bs-hero-title">${escapeHtml(title)}</h1>
      <p class="bs-hero__lead">${brHeadline(headline)}</p>
      <p class="bs-hero__lead">${escapeHtml(desc)}</p>
      <div class="bs-hero__actions">
        <a class="bs-btn bs-btn--primary" href="#bs-lab-live" data-bs-cta="hero_primary">${escapeHtml(u.tryLive)}</a>
        <a class="bs-btn bs-btn--ghost" href="#bs-lab-question" data-bs-cta="hero_secondary">${escapeHtml(u.seeQuestion)}</a>
      </div>
    </div>
    ${labsHeroVisual(exp.slug, lang)}
  </div>
</section>`;
}

function metaRows(exp, content, lang, u) {
  const cat = content?.category || String(exp.categoryLabel || exp.category || "").toUpperCase();
  const updated = fmtUpdated(exp.updatedAt);
  const stage = t(exp, lang, "stageLabelKo", "stageLabelEn") || exp.status;
  const rows = [
    { k: u.experimentNo, v: pad2(exp.labNumber || 0) },
    { k: "STATUS", v: exp.status },
    { k: "CATEGORY", v: cat },
    { k: "STAGE", v: stage },
  ];
  if (updated) rows.push({ k: "UPDATED", v: updated });
  return rows
    .map(
      (m) =>
        `<div class="bs-dr-meta__row"><p class="bs-dr-meta__k">${escapeHtml(m.k)}</p><p class="bs-dr-meta__v">${escapeHtml(m.v)}</p></div>`
    )
    .join("");
}

function overviewSection(exp, content, lang, u) {
  const desc = content?.description || t(exp, lang, "descKo", "descEn");
  const headline = content?.headline || t(exp, lang, "heroLeadKo", "heroLeadEn");
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-lab-overview-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(u.overview)}</p>
          <h2 class="bs-title" id="bs-lab-overview-title">${brHeadline(headline)}</h2>
          <div class="bs-overview"><p class="bs-lead">${escapeHtml(desc)}</p></div>
        </div>
        <aside class="bs-dr-meta" aria-label="Experiment summary">${metaRows(exp, content, lang, u)}</aside>
      </div>
    </div></section>`;
}

function snapshotSection(content, lang, u) {
  const s = content?.snapshot;
  if (!s) return "";
  const cells = [
    { k: "QUESTION", v: s.question },
    { k: "METHOD", v: s.method },
    { k: "SIGNAL", v: s.signal },
    { k: "OUTCOME", v: s.outcome },
  ];
  const grid = cells
    .map(
      (c) =>
        `<article class="bs-lab-snap__cell"><p class="bs-lab-snap__k">${escapeHtml(c.k)}</p><p class="bs-lab-snap__v">${escapeHtml(c.v)}</p></article>`
    )
    .join("");
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-lab-snap-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.snapshot)}</p>
      <h2 class="bs-title" id="bs-lab-snap-title">${escapeHtml(u.snapshot)}</h2>
      <div class="bs-lab-snap">${grid}</div>
    </div></section>`;
}

function questionSection(content, lang, u) {
  if (!content?.question) return "";
  return `<section class="bs-section bs-lab-question" id="bs-lab-question" data-bs-reveal aria-labelledby="bs-lab-q-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.question)}</p>
      <h2 class="bs-title bs-lab-question__title" id="bs-lab-q-title">${brHeadline(content.question)}</h2>
      ${content.questionContext ? `<p class="bs-lead">${escapeHtml(content.questionContext)}</p>` : ""}
    </div></section>`;
}

function whySection(content, lang, u) {
  const w = content?.why;
  if (!w) return "";
  const cols = [
    { k: u.problem, v: w.problem },
    { k: u.hypothesis, v: w.hypothesis },
    { k: u.experiment, v: w.experiment, mono: true },
  ];
  const grid = cols
    .map(
      (c) =>
        `<article class="bs-lab-why__cell"><p class="bs-eyebrow">${escapeHtml(c.k)}</p><p class="bs-lead${c.mono ? " bs-lab-mono" : ""}">${escapeHtml(c.v)}</p></article>`
    )
    .join("");
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-lab-why-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.why)}</p>
      <h2 class="bs-title" id="bs-lab-why-title">${escapeHtml(u.why)}</h2>
      <div class="bs-lab-why">${grid}</div>
    </div></section>`;
}

function processSection(content, lang, u) {
  const steps = content?.flow || [];
  if (!steps.length) return "";
  const list = `<ol class="bs-process bs-process--steps" data-count="${steps.length}">${steps
    .map(
      (s, i) =>
        `<li class="bs-process__item"><span class="bs-process__n" aria-hidden="true">${escapeHtml(s.n || pad2(i + 1))}</span><div class="bs-process__copy"><h3>${escapeHtml(s.label)}</h3><p>${escapeHtml(s.desc)}</p></div></li>`
    )
    .join("")}</ol>`;
  return `<section class="bs-section" id="process" data-bs-reveal aria-labelledby="bs-lab-flow-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.how)}</p>
      <h2 class="bs-title" id="bs-lab-flow-title">${escapeHtml(u.how)}</h2>
      ${list}
    </div></section>`;
}

function liveWrapper(exp, lang, u) {
  const live = liveSection(exp, lang);
  if (!live) return "";
  const board = exp.slug === "ai-experiment" ? aiBoard(exp, lang) : "";
  return `<section class="bs-section bs-section--surface bs-lab-live-wrap" id="bs-lab-live" data-bs-reveal aria-labelledby="bs-lab-live-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.live)}</p>
      <h2 class="bs-title" id="bs-lab-live-title">${escapeHtml(u.live)}</h2>
      <div class="bs-lab-live" data-ld-slug="${escapeHtml(exp.slug)}" data-ld-lang="${escapeHtml(lang)}">${live}${board}</div>
    </div></section>`;
}

function testingSection(content, lang, u) {
  const tests = content?.testing || [];
  if (!tests.length) return "";
  const grid = `<div class="bs-get bs-get--deliver" data-count="${tests.length}" data-variant="deliver">${tests
    .map((t, i) => {
      const n = t.n || pad2(i + 1);
      return `<article class="bs-get__item"><span class="bs-get__n" aria-hidden="true">${escapeHtml(String(n))}</span><div class="bs-get__copy"><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.desc)}</p></div></article>`;
    })
    .join("")}</div>`;
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-lab-test-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.testing)}</p>
      <h2 class="bs-title" id="bs-lab-test-title">${escapeHtml(u.testing)}</h2>
      ${grid}
    </div></section>`;
}

function signalsSection(content, lang, u) {
  const sigs = content?.signals || [];
  if (!sigs.length) return "";
  const grid = sigs
    .map(
      (s) =>
        `<article class="bs-lab-signal"><p class="bs-eyebrow">${escapeHtml(s.type)}</p><p class="bs-lead">${escapeHtml(s.desc)}</p></article>`
    )
    .join("");
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-lab-signals-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.signals)}</p>
      <h2 class="bs-title" id="bs-lab-signals-title">${escapeHtml(u.signals)}</h2>
      <div class="bs-lab-signals">${grid}</div>
    </div></section>`;
}

function statusPipeline(exp) {
  const idx = pipelineIndex(exp.stage === "PRODUCT" ? "PRODUCT" : exp.status || exp.stage);
  return LAB_PIPELINE.map((s, i) => {
    const cls = i === idx ? "is-current" : i < idx ? "is-done" : "is-muted";
    return `<li class="bs-lab-pipe__step ${cls}"><span>${escapeHtml(s)}</span></li>`;
  }).join("");
}

function statusSection(exp, lang, u) {
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-lab-status-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.status)}</p>
      <h2 class="bs-title" id="bs-lab-status-title">${escapeHtml(u.pipeline)}</h2>
      <ol class="bs-lab-pipe" aria-label="Labs pipeline">${statusPipeline(exp)}</ol>
    </div></section>`;
}

function nextSection(exp, content, lang, u) {
  const fromExp = t(exp, lang, "nextStepKo", "nextStepEn") || t(exp, lang, "nextKo", "nextEn");
  const steps = (content?.nextSteps || []).filter(Boolean);
  let body = "";
  if (steps.length) {
    body = `<ol class="bs-who">${steps
      .map(
        (s, i) =>
          `<li class="bs-who__item"><span class="bs-who__n">${pad2(i + 1)}</span><p class="bs-who__t">${escapeHtml(s)}</p></li>`
      )
      .join("")}</ol>`;
  } else if (fromExp) {
    body = `<p class="bs-lead">${escapeHtml(fromExp)}</p>`;
  } else {
    body = `<p class="bs-lead">${escapeHtml(lang === "ko" ? "다음 검증 단계를 정의 중입니다." : "Next validation step is being defined.")}</p>`;
  }
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-lab-next-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.next)}</p>
      <h2 class="bs-title" id="bs-lab-next-title">${escapeHtml(u.next)}</h2>
      ${body}
    </div></section>`;
}

function relatedSection(exp, lang, u) {
  const all = getLabsExperiments();
  const slugs = (LAB_DETAIL_RELATED[exp.slug] || []).slice(0, 2);
  const peers = slugs.map((slug) => all.find((e) => e.slug === slug)).filter(Boolean);
  if (!peers.length) return "";
  const cards = peers
    .map((e) => {
      const c = contentFor(e, lang);
      const title = experimentTitle(e, lang);
      const desc = c?.description || t(e, lang, "listDescKo", "listDescEn");
      const cat = c?.category || String(e.categoryLabel || e.category || "").toUpperCase();
      return `<a class="bs-related__link" href="../${escapeHtml(e.slug)}/">
        <span><span class="bs-related__kicker">${escapeHtml(e.status)} / ${escapeHtml(cat)}</span><span class="bs-related__name">${escapeHtml(title)}</span></span>
        <span class="bs-related__go" aria-hidden="true">${escapeHtml(u.viewExp)} →</span>
      </a>`;
    })
    .join("");
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-lab-related-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.related)}</p>
      <h2 class="bs-title" id="bs-lab-related-title">${escapeHtml(u.related)}</h2>
      <div class="bs-related">${cards}</div>
      <p class="bs-related__all"><a href="../">${escapeHtml(u.backLabs)}</a></p>
    </div></section>`;
}

function finalSection(lang, u) {
  return `<section class="bs-section bs-section--dark bs-final" data-bs-reveal aria-labelledby="bs-lab-final-title"><div class="bs-inner">
    <p class="bs-eyebrow">NEWON LABS</p>
    <h2 class="bs-final__title" id="bs-lab-final-title">${escapeHtml(u.finalTitle)}</h2>
    <p class="bs-lead">${escapeHtml(u.finalLead)}</p>
    <div class="bs-hero__actions">
      <a class="bs-btn bs-btn--primary" href="../">${escapeHtml(u.backLabs)}</a>
      <a class="bs-btn bs-btn--ghost" href="../../../ideas/">${escapeHtml(u.submitIdea)}</a>
    </div>
  </div></section>`;
}

function adjacentSection(exp, lang) {
  const exps = getLabsExperiments().slice().sort((a, b) => (a.labNumber || 0) - (b.labNumber || 0));
  const idx = exps.findIndex((e) => e.slug === exp.slug);
  if (idx < 0) return "";

  const prev = idx > 0 ? exps[idx - 1] : null;
  const next = idx < exps.length - 1 ? exps[idx + 1] : null;

  const prevBlock = prev
    ? `<a class="bs-adjacent__link bs-adjacent__link--prev" href="../${escapeHtml(prev.slug)}/">
      <span class="bs-adjacent__label">${escapeHtml(lang === "ko" ? "이전 실험" : "Previous")}</span>
      <span class="bs-adjacent__name">${escapeHtml(experimentTitle(prev, lang))}</span>
    </a>`
    : `<span class="bs-adjacent__link bs-adjacent__link--prev is-empty"></span>`;

  const nextBlock = next
    ? `<a class="bs-adjacent__link bs-adjacent__link--next" href="../${escapeHtml(next.slug)}/">
      <span class="bs-adjacent__label">${escapeHtml(lang === "ko" ? "다음 실험" : "Next")}</span>
      <span class="bs-adjacent__name">${escapeHtml(experimentTitle(next, lang))}</span>
    </a>`
    : `<span class="bs-adjacent__link bs-adjacent__link--next is-empty"></span>`;

  return `<section class="bs-section bs-adjacent" data-bs-reveal aria-label="Adjacent experiments">
    <div class="bs-inner bs-adjacent__grid">${prevBlock}${nextBlock}</div>
  </section>`;
}

/**
 * @param {object} exp
 * @param {'ko'|'en'} lang
 */
export function renderLabDetailBody(exp, lang = "ko") {
  const u = ui(lang);
  const content = contentFor(exp, lang);
  const title = experimentTitle(exp, lang);

  return `${breadcrumb(title, u)}
${heroSection(exp, content, lang, u)}
${experimentNav(exp.slug)}
${overviewSection(exp, content, lang, u)}
${snapshotSection(content, lang, u)}
${questionSection(content, lang, u)}
${whySection(content, lang, u)}
${processSection(content, lang, u)}
${liveWrapper(exp, lang, u)}
${testingSection(content, lang, u)}
${signalsSection(content, lang, u)}
${statusSection(exp, lang, u)}
${nextSection(exp, content, lang, u)}
${relatedSection(exp, lang, u)}
${finalSection(lang, u)}
${adjacentSection(exp, lang)}`;
}
