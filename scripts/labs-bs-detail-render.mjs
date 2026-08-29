/**
 * Labs experiment detail body — Brand Strategy–level narrative + Studio bs-* system.
 * Keeps Labs-specific live experiment + pipeline.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { LAB_PIPELINE, pipelineIndex, getLabsExperiments } from "./lab-experiments.mjs";
import { getLabDetailContent } from "./lab-detail-content.mjs";
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
    crumbResources: ko ? "리소스" : "Resources",
    crumbLabs: ko ? "랩스" : "Labs",
    overview: ko ? "개요" : "OVERVIEW",
    who: ko ? "대상" : "WHO IT'S FOR",
    whoTitle: ko ? "이런 팀에게 필요합니다." : "Built for these teams.",
    question: ko ? "질문" : "THE QUESTION",
    why: ko ? "왜 이 실험인가" : "WHY THIS EXPERIMENT",
    whyTitle: ko ? "문제를 이렇게 봅니다." : "How we frame the problem.",
    problem: "PROBLEM",
    hypothesis: "HYPOTHESIS",
    experiment: "EXPERIMENT",
    how: ko ? "작동 방식" : "HOW IT WORKS",
    howTitle: ko ? "실험이 흐르는 방식" : "How the experiment flows",
    includes: ko ? "포함 구성" : "INCLUDED",
    includesTitle: ko ? "실험 시스템에 들어가는 것" : "What's in the experiment system",
    includesLead: ko
      ? "실험 범위 기준으로 구성됩니다. 검증 단계에 따라 세부 항목은 달라질 수 있습니다."
      : "Scoped to the experiment. Details may refine as validation continues.",
    outcomes: ko ? "목표 결과" : "OUTCOMES",
    outcomesTitle: ko ? "검증이 끝나면 남기고 싶은 것" : "What we want to leave with",
    testing: ko ? "검증 중인 것" : "WHAT WE'RE TESTING",
    testingTitle: ko ? "지금 확인하고 있는 가설" : "Hypotheses under test",
    signals: ko ? "관찰 신호" : "WHAT WE OBSERVE",
    signalsTitle: ko ? "무엇을 보고 판단하는가" : "Signals we watch",
    snapshot: ko ? "실험 스냅샷" : "EXPERIMENT SNAPSHOT",
    status: ko ? "현재 상태" : "CURRENT STATUS",
    pipeline: "LABS PIPELINE",
    next: ko ? "다음 단계" : "NEXT STEP",
    nextTitle: ko ? "다음에 확인할 것" : "What comes next",
    live: ko ? "라이브 실험" : "LIVE EXPERIMENT",
    liveTitle: ko ? "직접 만져보는 실험." : "Try the experiment live.",
    liveLead: ko
      ? "프로토타입을 바로 실행해 보세요. 입력하면 결과가 이 보드에 나타납니다."
      : "Run the prototype here. Your input shows up on this board in real time.",
    liveNote: ko ? "DEMO · CLIENT-SIDE" : "DEMO · CLIENT-SIDE",
    faq: "FAQ",
    faqTitle: ko ? "자주 묻는 질문" : "Frequently asked questions",
    tryLive: ko ? "라이브 실험 ↓" : "Try live experiment ↓",
    seeQuestion: ko ? "질문 보기 ↓" : "See the question ↓",
    seeOverview: ko ? "개요 보기 ↓" : "View overview ↓",
    backLabs: ko ? "랩스 보기 →" : "View Labs →",
    submitIdea: ko ? "아이디어 제출 ↗" : "Submit an idea ↗",
    finalEyebrow: "NEWON LABS",
    finalTitle: ko ? "실험은 질문에서 시작합니다." : "Every experiment starts with a question.",
    finalLead: ko
      ? "검증된 실험은 Newon의 제품과 서비스로 이어집니다. 다른 실험을 탐색하거나 아이디어를 제출해 보세요."
      : "Validated experiments graduate into Newon products and services. Explore more experiments or submit an idea.",
    prevService: ko ? "이전 실험" : "Previous experiment",
    nextService: ko ? "다음 실험" : "Next experiment",
    experimentNo: "EXPERIMENT",
  };
}

function contentFor(exp, lang) {
  return getLabDetailContent(exp.slug, lang);
}

function experimentTitle(exp, lang) {
  return t(exp, lang, "displayTitleKo", "displayTitleEn") || t(exp, lang, "titleKo", "titleEn");
}

function proseLead(text) {
  if (!text) return "";
  return `<p class="bs-hero__lead">${escapeHtml(String(text)).replace(/\n/g, "<br />")}</p>`;
}

function overviewBodyHtml(paras) {
  if (!paras?.length) return "";
  return `<div class="bs-overview">${paras
    .map((p, i) => `<p class="${i === 0 ? "bs-lead" : ""}">${escapeHtml(String(p)).replace(/\n/g, "<br />")}</p>`)
    .join("")}</div>`;
}

function getGridHtml(items, variant = "board") {
  if (!items?.length) return "";
  const mod = variant ? ` bs-get--${variant}` : "";
  return `<div class="bs-get${mod}" data-count="${items.length}" data-variant="${escapeHtml(variant)}">${items
    .map((item, i) => {
      const title = typeof item === "string" ? item : item.t || item.title || item.label || item.type || "";
      const body = typeof item === "string" ? "" : item.d || item.body || item.desc || "";
      const n = typeof item === "object" && item?.n ? String(item.n) : pad2(i + 1);
      const prose = body
        ? `<p>${escapeHtml(body).replace(/\n{2,}/g, "\n").replace(/\n/g, "<br />")}</p>`
        : "";
      return `<article class="bs-get__item"><span class="bs-get__n" aria-hidden="true">${escapeHtml(
        n
      )}</span><div class="bs-get__copy"><h3>${escapeHtml(title)}</h3>${prose}</div></article>`;
    })
    .join("")}</div>`;
}

function deliverListHtml(items, variant = "included") {
  if (!items?.length) return "";
  return `<ul class="bs-deliver bs-deliver--${escapeHtml(variant)}" data-count="${items.length}" data-variant="${escapeHtml(
    variant
  )}">${items
    .map((item, i) => {
      const text = typeof item === "string" ? item : item.t || item.title || "";
      return `<li class="bs-deliver__item"><span class="bs-deliver__n" aria-hidden="true">${pad2(
        i + 1
      )}</span><span class="bs-deliver__t">${escapeHtml(text)}</span></li>`;
    })
    .join("")}</ul>`;
}

function faqHtml(items) {
  if (!items?.length) return "";
  return `<div class="bs-faq">${items
    .map((item, i) => {
      const qid = `bs-faq-q-${i}`;
      const aid = `bs-faq-a-${i}`;
      return `<div class="bs-faq-item">
      <button type="button" class="bs-faq-q" aria-expanded="false" id="${qid}" aria-controls="${aid}">
        <span>${escapeHtml(item.q)}</span><span class="bs-faq-icon" aria-hidden="true"></span>
      </button>
      <div class="bs-faq-a" id="${aid}" role="region" aria-labelledby="${qid}"><div><p>${escapeHtml(item.a).replace(
        /\n/g,
        "<br />"
      )}</p></div></div>
    </div>`;
    })
    .join("")}</div>`;
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
  const cat = content?.category || String(exp.categoryLabel || exp.category || "").toUpperCase();
  const headline =
    content?.headline || t(exp, lang, "heroLeadKo", "heroLeadEn") || experimentTitle(exp, lang);
  const lead =
    content?.heroLead ||
    content?.description ||
    t(exp, lang, "descKo", "descEn");
  const eyebrow = `NEWON LABS <span class="bs-eyebrow__sep" aria-hidden="true">·</span> <span class="bs-eyebrow__sub">${escapeHtml(
    cat
  )}</span>`;
  const secondaryHref = content?.question ? "#bs-lab-question" : "#bs-lab-overview-title";
  const secondaryLabel = content?.question ? u.seeQuestion : u.seeOverview;

  return `<section class="bs-hero" data-bs-reveal aria-labelledby="bs-hero-title">
  <div class="bs-inner bs-hero__grid">
    <div>
      <p class="bs-eyebrow">${eyebrow}</p>
      <h1 class="bs-hero__title" id="bs-hero-title">${brHeadline(headline)}</h1>
      ${proseLead(lead)}
      <div class="bs-hero__actions">
        <a class="bs-btn bs-btn--primary" href="#bs-lab-live" data-bs-cta="hero_primary">${escapeHtml(u.tryLive)}</a>
        <a class="bs-btn bs-btn--ghost" href="${secondaryHref}" data-bs-cta="hero_secondary">${escapeHtml(
          secondaryLabel
        )}</a>
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
  const includes = content?.includes || [];
  const rows = [
    { k: "PRODUCT", v: experimentTitle(exp, lang) },
    { k: u.experimentNo, v: pad2(exp.labNumber || 0) },
    { k: "STATUS", v: exp.status },
    { k: "CATEGORY", v: cat },
    { k: "STAGE", v: stage },
  ];
  if (includes.length) rows.push({ k: lang === "ko" ? "구성" : "MODULES", v: String(includes.length) });
  if (updated) rows.push({ k: "UPDATED", v: updated });
  return rows
    .map(
      (m) =>
        `<div class="bs-dr-meta__row"><p class="bs-dr-meta__k">${escapeHtml(m.k)}</p><p class="bs-dr-meta__v">${escapeHtml(
          m.v
        )}</p></div>`
    )
    .join("");
}

function overviewSection(exp, content, lang, u) {
  const title =
    content?.overviewTitle ||
    experimentTitle(exp, lang);
  const body = Array.isArray(content?.overviewBody)
    ? content.overviewBody
    : content?.description
      ? [content.description]
      : [];
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-lab-overview-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(u.overview)}</p>
          <h2 class="bs-title" id="bs-lab-overview-title">${brHeadline(title)}</h2>
          ${overviewBodyHtml(body)}
        </div>
        <aside class="bs-dr-meta" aria-label="Experiment summary">${metaRows(exp, content, lang, u)}</aside>
      </div>
    </div></section>`;
}

function whoSection(content, u) {
  const who = content?.who || [];
  if (!who.length) return "";
  const title = content?.whoTitle || u.whoTitle;
  const items = who.map((w) =>
    typeof w === "string" ? { t: w, d: "" } : { t: w.t || w.title, d: w.d || w.body || "" }
  );
  return `<section class="bs-section bs-section--surface" data-bs-part="who" data-bs-reveal aria-labelledby="bs-lab-who-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.who)}</p>
      <h2 class="bs-title" id="bs-lab-who-title">${brHeadline(title)}</h2>
      ${getGridHtml(items, "who")}
    </div></section>`;
}

function questionSection(content, u) {
  if (!content?.question) return "";
  return `<section class="bs-section" id="bs-lab-question" data-bs-part="question" data-bs-reveal aria-labelledby="bs-lab-q-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.question)}</p>
      <h2 class="bs-title" id="bs-lab-q-title">${brHeadline(content.question)}</h2>
      ${content.questionContext ? `<p class="bs-lead">${escapeHtml(content.questionContext).replace(/\n/g, "<br />")}</p>` : ""}
    </div></section>`;
}

function whySection(content, u) {
  const w = content?.why;
  if (!w) return "";
  const title = content?.whyTitle || u.whyTitle;
  const items = [
    { title: u.problem, body: w.problem },
    { title: u.hypothesis, body: w.hypothesis },
    { title: u.experiment, body: w.experiment },
  ];
  return `<section class="bs-section bs-section--surface" data-bs-part="why" data-bs-reveal aria-labelledby="bs-lab-why-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.why)}</p>
      <h2 class="bs-title" id="bs-lab-why-title">${brHeadline(title)}</h2>
      ${getGridHtml(items, "signal")}
    </div></section>`;
}

function processSection(content, u) {
  const steps = content?.flow || [];
  if (!steps.length) return "";
  const title = content?.flowTitle || u.howTitle;
  const list = `<ol class="bs-process bs-process--steps" data-count="${steps.length}">${steps
    .map(
      (s, i) =>
        `<li class="bs-process__item"><span class="bs-process__n" aria-hidden="true">${escapeHtml(
          s.n || pad2(i + 1)
        )}</span><div class="bs-process__copy"><h3>${escapeHtml(s.label)}</h3><p>${escapeHtml(s.desc).replace(
          /\n/g,
          "<br />"
        )}</p></div></li>`
    )
    .join("")}</ol>`;
  return `<section class="bs-section" id="process" data-bs-part="process" data-bs-reveal aria-labelledby="bs-lab-flow-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.how)}</p>
      <h2 class="bs-title" id="bs-lab-flow-title">${brHeadline(title)}</h2>
      ${list}
    </div></section>`;
}

function includesSection(content, u) {
  const includes = content?.includes || [];
  if (!includes.length) return "";
  const lead = u.includesLead ? `<p class="bs-lead">${escapeHtml(u.includesLead)}</p>` : "";
  return `<section class="bs-section bs-section--surface" data-bs-part="included" data-bs-reveal aria-labelledby="bs-lab-includes-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.includes)}</p>
      <h2 class="bs-title" id="bs-lab-includes-title">${escapeHtml(u.includesTitle)}</h2>
      ${lead}
      ${deliverListHtml(includes, "included")}
    </div></section>`;
}

function liveWrapper(exp, lang, u) {
  const live = liveSection(exp, lang);
  if (!live) return "";
  const board = exp.slug === "ai-experiment" ? aiBoard(exp, lang) : "";
  const labTag = LAB_NAV_LABELS[exp.slug] || "LAB";
  const lead = u.liveLead ? `<p class="bs-lead bs-lab-live-lead">${escapeHtml(u.liveLead)}</p>` : "";
  return `<section class="bs-section bs-lab-live-wrap" id="bs-lab-live" data-bs-part="live" data-bs-reveal aria-labelledby="bs-lab-live-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.live)}</p>
      <h2 class="bs-title" id="bs-lab-live-title">${escapeHtml(u.liveTitle || u.live)}</h2>
      ${lead}
      <div class="bs-lab-live-frame">
        <div class="bs-lab-live-chrome" aria-hidden="true">
          <span class="bs-lab-live-chrome__lab">${escapeHtml(labTag)}</span>
          <span class="bs-lab-live-chrome__mid">
            <span class="bs-lab-live-chrome__live"><i></i> LIVE</span>
            <span class="bs-lab-live-chrome__dot" aria-hidden="true">·</span>
            <span class="bs-lab-live-chrome__note">${escapeHtml(u.liveNote || "DEMO")}</span>
          </span>
          <span class="bs-lab-live-chrome__win">● ● ●</span>
        </div>
        <div class="bs-lab-live-board">
          <div class="bs-lab-live" data-ld-slug="${escapeHtml(exp.slug)}" data-ld-lang="${escapeHtml(lang)}">${live}${board}</div>
        </div>
      </div>
    </div></section>`;
}

function testingSection(content, u) {
  const tests = content?.testing || [];
  if (!tests.length) return "";
  const title = content?.testingTitle || u.testingTitle;
  return `<section class="bs-section bs-section--surface" data-bs-part="testing" data-bs-reveal aria-labelledby="bs-lab-test-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.testing)}</p>
      <h2 class="bs-title" id="bs-lab-test-title">${brHeadline(title)}</h2>
      ${getGridHtml(tests, "deliver")}
    </div></section>`;
}

function signalsSection(content, u) {
  const sigs = content?.signals || [];
  if (!sigs.length) return "";
  const title = content?.signalsTitle || u.signalsTitle;
  const items = sigs.map((s) => ({ title: s.type || s.t || s.title, body: s.desc || s.d || "" }));
  return `<section class="bs-section" data-bs-part="signals" data-bs-reveal aria-labelledby="bs-lab-signals-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.signals)}</p>
      <h2 class="bs-title" id="bs-lab-signals-title">${brHeadline(title)}</h2>
      ${getGridHtml(items, "axiom")}
    </div></section>`;
}

function outcomesSection(content, u) {
  const outcomes = content?.outcomes || [];
  if (!outcomes.length) return "";
  const title = content?.outcomesTitle || u.outcomesTitle;
  return `<section class="bs-section bs-section--surface" data-bs-part="deliver" data-bs-reveal aria-labelledby="bs-lab-outcomes-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.outcomes)}</p>
      <h2 class="bs-title" id="bs-lab-outcomes-title">${brHeadline(title)}</h2>
      ${getGridHtml(outcomes, "deliver")}
    </div></section>`;
}

function snapshotSection(content, u) {
  const s = content?.snapshot;
  if (!s) return "";
  const cells = [
    ["QUESTION", s.question],
    ["METHOD", s.method],
    ["SIGNAL", s.signal],
    ["OUTCOME", s.outcome],
  ].filter(([, v]) => String(v || "").trim());
  if (!cells.length) return "";
  const grid = cells
    .map(
      ([k, v]) => `<div class="bs-lab-snap__cell" role="listitem">
        <p class="bs-lab-snap__k">${escapeHtml(k)}</p>
        <p class="bs-lab-snap__v">${escapeHtml(v)}</p>
      </div>`
    )
    .join("");
  return `<section class="bs-section bs-lab-snap-sec" data-bs-part="snapshot" data-bs-reveal aria-labelledby="bs-lab-snap-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.snapshot)}</p>
      <h2 class="bs-title" id="bs-lab-snap-title">${escapeHtml(u.snapshot)}</h2>
      <div class="bs-lab-snap" role="list">${grid}</div>
    </div></section>`;
}

function statusPipeline(exp) {
  const idx = pipelineIndex(exp.stage === "PRODUCT" ? "PRODUCT" : exp.status || exp.stage);
  return LAB_PIPELINE.map((s, i) => {
    const cls = i === idx ? "is-current" : i < idx ? "is-done" : "is-muted";
    return `<li class="bs-lab-pipe__step ${cls}"><span>${escapeHtml(s)}</span></li>`;
  }).join("");
}

function statusSection(exp, u) {
  return `<section class="bs-section bs-section--surface" data-bs-part="status" data-bs-reveal aria-labelledby="bs-lab-status-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(u.status)}</p>
          <h2 class="bs-title" id="bs-lab-status-title">${escapeHtml(u.pipeline)}</h2>
          <p class="bs-lead">${escapeHtml(
            u.crumbLabs === "랩스"
              ? "실험은 RESEARCH에서 PRODUCT까지 단계적으로 이동합니다. 현재 위치가 강조됩니다."
              : "Experiments move from RESEARCH toward PRODUCT. The current stage is highlighted."
          )}</p>
        </div>
        <aside class="bs-dr-meta" aria-label="Pipeline status">
          <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">STATUS</p><p class="bs-dr-meta__v">${escapeHtml(
            exp.status || "—"
          )}</p></div>
          <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">EXPERIMENT</p><p class="bs-dr-meta__v">${pad2(
            exp.labNumber || 0
          )}</p></div>
        </aside>
      </div>
      <ol class="bs-lab-pipe" aria-label="Labs pipeline">${statusPipeline(exp)}</ol>
    </div></section>`;
}

function nextSection(exp, content, lang, u) {
  const title = content?.nextTitle || u.nextTitle;
  const steps = (content?.nextSteps || []).filter(Boolean);
  let items = [];
  if (steps.length) {
    items = steps.map((s) =>
      typeof s === "string" ? { title: s, body: "" } : { title: s.t || s.title, body: s.d || s.body || "" }
    );
  } else {
    const fromExp = t(exp, lang, "nextStepKo", "nextStepEn") || t(exp, lang, "nextKo", "nextEn");
    items = [
      {
        title:
          fromExp ||
          (lang === "ko" ? "다음 검증 단계를 정의 중입니다." : "Next validation step is being defined."),
        body: "",
      },
    ];
  }
  return `<section class="bs-section" data-bs-part="next" data-bs-reveal aria-labelledby="bs-lab-next-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.next)}</p>
      <h2 class="bs-title" id="bs-lab-next-title">${brHeadline(title)}</h2>
      ${getGridHtml(items, "who")}
    </div></section>`;
}

function faqSection(content, u) {
  const faq = content?.faq || [];
  if (!faq.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-lab-faq-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(u.faq)}</p>
      <h2 class="bs-title" id="bs-lab-faq-title">${escapeHtml(u.faqTitle)}</h2>
      ${faqHtml(faq)}
    </div></section>`;
}

function finalSection(content, u) {
  const title = content?.finalTitle || u.finalTitle;
  const lead = content?.finalLead || u.finalLead;
  return `<section class="bs-section bs-section--dark bs-final" data-bs-reveal aria-labelledby="bs-lab-final-title"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(u.finalEyebrow)}</p>
    <h2 class="bs-final__title" id="bs-lab-final-title">${brHeadline(title)}</h2>
    <p class="bs-lead">${escapeHtml(lead).replace(/\n/g, "<br />")}</p>
    <div class="bs-hero__actions">
      <a class="bs-btn bs-btn--primary" href="../">${escapeHtml(u.backLabs)}</a>
      <a class="bs-btn bs-btn--ghost" href="../../../ideas/">${escapeHtml(u.submitIdea)}</a>
    </div>
  </div></section>`;
}

function adjacentSection(exp, lang, u) {
  const exps = getLabsExperiments().slice().sort((a, b) => (a.labNumber || 0) - (b.labNumber || 0));
  const idx = exps.findIndex((e) => e.slug === exp.slug);
  if (idx < 0) return "";

  const prev = idx > 0 ? exps[idx - 1] : null;
  const next = idx < exps.length - 1 ? exps[idx + 1] : null;

  const prevBlock = prev
    ? `<a class="bs-adjacent__link bs-adjacent__link--prev" href="../${escapeHtml(prev.slug)}/">
      <span class="bs-adjacent__label">${escapeHtml(u.prevService)}</span>
      <span class="bs-adjacent__name">${escapeHtml(LAB_NAV_LABELS[prev.slug] || experimentTitle(prev, lang))}</span>
    </a>`
    : `<span class="bs-adjacent__link bs-adjacent__link--prev is-empty"></span>`;

  const nextBlock = next
    ? `<a class="bs-adjacent__link bs-adjacent__link--next" href="../${escapeHtml(next.slug)}/">
      <span class="bs-adjacent__label">${escapeHtml(u.nextService)}</span>
      <span class="bs-adjacent__name">${escapeHtml(LAB_NAV_LABELS[next.slug] || experimentTitle(next, lang))}</span>
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
${whoSection(content, u)}
${questionSection(content, u)}
${whySection(content, u)}
${processSection(content, u)}
${includesSection(content, u)}
${liveWrapper(exp, lang, u)}
${testingSection(content, u)}
${signalsSection(content, u)}
${outcomesSection(content, u)}
${snapshotSection(content, u)}
${statusSection(exp, u)}
${nextSection(exp, content, lang, u)}
${faqSection(content, u)}
${finalSection(content, u)}
${adjacentSection(exp, lang, u)}`;
}
