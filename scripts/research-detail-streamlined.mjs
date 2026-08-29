/**
 * Streamlined Business Research detail sections — decision-focused, no duplicate blocks.
 */
import { escapeHtml } from "./hub-utils.mjs";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function brHeadline(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function t(obj, lang) {
  return lang === "ko" ? obj.ko : obj.en;
}

const PROCESS = {
  ko: [
    { k: "DISCOVERY", v: "무엇을 결정하려는지 확인" },
    { k: "SCOPE", v: "질문과 조사 범위 정의" },
    { k: "RESEARCH", v: "관련 자료 수집" },
    { k: "ANALYSIS", v: "구조와 패턴 분석" },
    { k: "SYNTHESIS", v: "핵심 발견과 시사점 정리" },
    { k: "DELIVER", v: "리포트와 다음 행동 전달" },
  ],
  en: [
    { k: "DISCOVERY", v: "Confirm what you need to decide" },
    { k: "SCOPE", v: "Define questions and research scope" },
    { k: "RESEARCH", v: "Collect relevant material" },
    { k: "ANALYSIS", v: "Analyze structure and patterns" },
    { k: "SYNTHESIS", v: "Synthesize findings and implications" },
    { k: "DELIVER", v: "Deliver report and next actions" },
  ],
};

const CONSUMER_PROCESS = {
  ko: [
    { k: "DEFINE", v: "질문과 타깃 정의" },
    { k: "OBSERVE", v: "행동과 의견 수집" },
    { k: "CLUSTER", v: "반복 패턴 분류" },
    { k: "INTERPRET", v: "문제와 니즈 해석" },
    { k: "SYNTHESIZE", v: "핵심 Insight 정리" },
    { k: "APPLY", v: "제품·메시지 결정에 연결" },
  ],
  en: [
    { k: "DEFINE", v: "Define question and target" },
    { k: "OBSERVE", v: "Collect behavior and feedback" },
    { k: "CLUSTER", v: "Group repeating patterns" },
    { k: "INTERPRET", v: "Interpret problems and needs" },
    { k: "SYNTHESIZE", v: "Synthesize core insights" },
    { k: "APPLY", v: "Connect to product and messaging decisions" },
  ],
};

const SOURCES = {
  ko: [
    { k: "PUBLIC DATA", v: "공공 통계·정부 자료" },
    { k: "INDUSTRY", v: "시장 리포트·전문 기사" },
    { k: "COMPANIES", v: "기업 웹·IR·공시" },
    { k: "PRODUCTS", v: "가격·제품 구조" },
    { k: "VOICE", v: "리뷰·커뮤니티·사용자 반응" },
    { k: "PRIMARY", v: "필요 시 인터뷰·설문" },
  ],
  en: [
    { k: "PUBLIC DATA", v: "Public statistics and government data" },
    { k: "INDUSTRY", v: "Market reports and trade press" },
    { k: "COMPANIES", v: "Corporate sites, IR, filings" },
    { k: "PRODUCTS", v: "Pricing and product structure" },
    { k: "VOICE", v: "Reviews, communities, user reactions" },
    { k: "PRIMARY", v: "Interviews or surveys when scoped" },
  ],
};

const SLUG_CONFIG = {
  "market-research": {
    question: {
      ko: "이 시장에 지금 들어갈 이유가 있는가?",
      en: "Is there a reason to enter this market now?",
    },
    analyzeLabel: { ko: "WHAT WE ANALYZE", en: "WHAT WE ANALYZE" },
    analyze: {
      ko: [
        { k: "MARKET STRUCTURE", v: "시장 구성과 주요 영역" },
        { k: "DEMAND", v: "수요와 사용자 신호" },
        { k: "COMPETITION", v: "경쟁사와 대체재" },
        { k: "TREND", v: "시장 변화" },
        { k: "OPPORTUNITY", v: "진입·확장 가능성" },
        { k: "RISK", v: "주의해야 할 전제" },
      ],
      en: [
        { k: "MARKET STRUCTURE", v: "How the market is composed" },
        { k: "DEMAND", v: "Demand and user signals" },
        { k: "COMPETITION", v: "Competitors and substitutes" },
        { k: "TREND", v: "Market change" },
        { k: "OPPORTUNITY", v: "Entry and expansion potential" },
        { k: "RISK", v: "Assumptions to watch" },
      ],
    },
    whenItHelps: {
      ko: [
        "신규 시장 진입",
        "새로운 카테고리 검토",
        "제품 포지셔닝",
        "가격 전략 검토",
        "MVP 범위 정의",
        "내부 의사결정 정렬",
      ],
      en: [
        "New market entry",
        "New category review",
        "Product positioning",
        "Pricing strategy review",
        "MVP scope definition",
        "Internal decision alignment",
      ],
    },
    preview: "market",
    deliverables: {
      ko: [
        "Research Brief",
        "Market Map",
        "Competitive Context",
        "Opportunity Areas",
        "Key Trends",
        "Implications",
        "Next Actions",
        "Source Appendix",
      ],
      en: [
        "Research Brief",
        "Market Map",
        "Competitive Context",
        "Opportunity Areas",
        "Key Trends",
        "Implications",
        "Next Actions",
        "Source Appendix",
      ],
    },
  },
  "competitor-analysis": {
    question: {
      ko: "이미 존재하는 선택지 사이에서\n우리 제품은 왜 필요해야 하는가?",
      en: "Among choices that already exist,\nwhy should our product be needed?",
    },
    analyzeLabel: { ko: "WHAT WE COMPARE", en: "WHAT WE COMPARE" },
    analyze: {
      ko: [
        { k: "POSITIONING", v: "누구에게 어떤 가치를 약속하는가" },
        { k: "PRODUCT", v: "핵심 기능과 제품 구조" },
        { k: "EXPERIENCE", v: "주요 사용자 경험" },
        { k: "PRICING", v: "공개 가격과 패키징" },
        { k: "MESSAGING", v: "가치 전달 방식" },
        { k: "TARGET", v: "누구를 대상으로 하는가" },
        { k: "GAP", v: "비어 있는 영역" },
      ],
      en: [
        { k: "POSITIONING", v: "Who they serve and what they promise" },
        { k: "PRODUCT", v: "Core features and structure" },
        { k: "EXPERIENCE", v: "Key user experience" },
        { k: "PRICING", v: "Public pricing and packaging" },
        { k: "MESSAGING", v: "How value is communicated" },
        { k: "TARGET", v: "Who they target" },
        { k: "GAP", v: "Open or underserved areas" },
      ],
    },
    preview: "competitor",
    deliverables: {
      ko: [
        "Competitor Matrix",
        "Positioning Summary",
        "Product / Feature Comparison",
        "Pricing Context",
        "Messaging Comparison",
        "Opportunity Gaps",
        "Differentiation Directions",
        "Next Actions",
      ],
      en: [
        "Competitor Matrix",
        "Positioning Summary",
        "Product / Feature Comparison",
        "Pricing Context",
        "Messaging Comparison",
        "Opportunity Gaps",
        "Differentiation Directions",
        "Next Actions",
      ],
    },
  },
  "consumer-research": {
    question: {
      ko: "사용자가 정말 해결하고 싶은 문제는 무엇인가?",
      en: "What problem do users actually want solved?",
    },
    analyzeLabel: { ko: "WHAT WE OBSERVE", en: "WHAT WE OBSERVE" },
    analyze: {
      ko: [
        { k: "BEHAVIOR", v: "현재 행동" },
        { k: "PAIN", v: "불편과 마찰" },
        { k: "NEED", v: "해결하고 싶은 것" },
        { k: "MOTIVATION", v: "행동 이유" },
        { k: "ALTERNATIVE", v: "기존 해결 방식" },
        { k: "PATTERN", v: "반복되는 신호" },
      ],
      en: [
        { k: "BEHAVIOR", v: "Current behavior" },
        { k: "PAIN", v: "Friction and pain" },
        { k: "NEED", v: "What they want to achieve" },
        { k: "MOTIVATION", v: "Why they act" },
        { k: "ALTERNATIVE", v: "How they solve it today" },
        { k: "PATTERN", v: "Repeating signals" },
      ],
    },
    preview: "consumer",
    processKey: "consumer",
    deliverables: {
      ko: [
        "Research Questions",
        "Behavior / Need Map",
        "Pain Point Summary",
        "Alternative Analysis",
        "Pattern Summary",
        "Consumer Insights",
        "Product Implications",
        "Next Actions",
      ],
      en: [
        "Research Questions",
        "Behavior / Need Map",
        "Pain Point Summary",
        "Alternative Analysis",
        "Pattern Summary",
        "Consumer Insights",
        "Product Implications",
        "Next Actions",
      ],
    },
  },
  "ux-audit": {
    question: {
      ko: "사용자가 어디에서 막히고, 무엇부터 고쳐야 하는가?",
      en: "Where do users get stuck, and what should we fix first?",
    },
    analyzeLabel: { ko: "WHAT WE REVIEW", en: "WHAT WE REVIEW" },
    analyze: {
      ko: [
        { k: "ENTRY", v: "진입과 첫 경험" },
        { k: "CORE FLOW", v: "핵심 작업 흐름" },
        { k: "CONVERSION", v: "전환·완료 지점" },
        { k: "NAVIGATION", v: "정보 구조와 이동" },
        { k: "FEEDBACK", v: "상태·에러·빈 화면" },
        { k: "PRIORITY", v: "영향도와 수정 순서" },
      ],
      en: [
        { k: "ENTRY", v: "Entry and first experience" },
        { k: "CORE FLOW", v: "Core task flows" },
        { k: "CONVERSION", v: "Conversion and completion" },
        { k: "NAVIGATION", v: "Information architecture" },
        { k: "FEEDBACK", v: "States, errors, empty screens" },
        { k: "PRIORITY", v: "Impact and fix order" },
      ],
    },
    preview: "ux",
    deliverables: {
      ko: [
        "Audit Scope",
        "Flow Review",
        "Issue List",
        "Severity / Impact",
        "Quick Wins",
        "Recommendations",
        "Next Actions",
      ],
      en: [
        "Audit Scope",
        "Flow Review",
        "Issue List",
        "Severity / Impact",
        "Quick Wins",
        "Recommendations",
        "Next Actions",
      ],
    },
  },
  "trend-research": {
    question: {
      ko: "지금 어떤 변화가 시작되고, 우리에게 무엇을 의미하는가?",
      en: "What change is starting now, and what does it mean for us?",
    },
    analyzeLabel: { ko: "WHAT WE TRACK", en: "WHAT WE TRACK" },
    analyze: {
      ko: [
        { k: "EMERGING", v: "시작되는 신호" },
        { k: "GROWING", v: "커지는 흐름" },
        { k: "MAINSTREAM", v: "일반화되는 패턴" },
        { k: "DECLINING", v: "약해지는 영역" },
        { k: "DRIVERS", v: "변화를 만드는 요인" },
        { k: "IMPLICATION", v: "제품·사업 시사점" },
      ],
      en: [
        { k: "EMERGING", v: "Signals just starting" },
        { k: "GROWING", v: "Momentum building" },
        { k: "MAINSTREAM", v: "Patterns becoming normal" },
        { k: "DECLINING", v: "Areas losing strength" },
        { k: "DRIVERS", v: "What drives the change" },
        { k: "IMPLICATION", v: "Product and business meaning" },
      ],
    },
    preview: "trend",
    deliverables: {
      ko: [
        "Trend Brief",
        "Signal Map",
        "Theme Summary",
        "Industry Context",
        "Implications",
        "Watch List",
        "Next Actions",
      ],
      en: [
        "Trend Brief",
        "Signal Map",
        "Theme Summary",
        "Industry Context",
        "Implications",
        "Watch List",
        "Next Actions",
      ],
    },
  },
};

function dash() {
  return `<span class="bs-rd-dash" aria-hidden="true">—</span>`;
}

function previewMarket(lang) {
  const ko = lang === "ko";
  return `<div class="bs-rd-preview" id="bs-rd-preview">
  <div class="bs-rd-preview__head"><span class="bs-rd-preview__badge">${ko ? "SAMPLE RESEARCH VIEW" : "SAMPLE RESEARCH VIEW"}</span><span class="bs-rd-preview__note">${ko ? "DEMO DATA" : "DEMO DATA"}</span></div>
  <div class="bs-rd-preview__pipe">
    <div class="bs-rd-preview__col"><p class="bs-rd-preview__k">SOURCES</p><ul>${["Reports", "News", "Reviews", "Statistics", "Filings"].map((x) => `<li>${escapeHtml(x)} ${dash()}</li>`).join("")}</ul></div>
    <div class="bs-rd-preview__arrow" aria-hidden="true">→</div>
    <div class="bs-rd-preview__col"><p class="bs-rd-preview__k">MARKET STRUCTURE</p><ul>${["Segments", "Players", "Alternatives"].map((x) => `<li>${escapeHtml(x)} ${dash()}</li>`).join("")}</ul></div>
    <div class="bs-rd-preview__arrow" aria-hidden="true">→</div>
    <div class="bs-rd-preview__col"><p class="bs-rd-preview__k">SIGNALS</p><ul>${["Demand", "Trend", "Change", "Gap"].map((x) => `<li>${escapeHtml(x)} ${dash()}</li>`).join("")}</ul></div>
    <div class="bs-rd-preview__arrow" aria-hidden="true">→</div>
    <div class="bs-rd-preview__col"><p class="bs-rd-preview__k">DECISION</p><ul>${["Explore", "Validate", "Watch"].map((x) => `<li>${escapeHtml(x)} ${dash()}</li>`).join("")}</ul></div>
  </div>
</div>`;
}

function previewCompetitor(lang) {
  const rows = ["POSITIONING", "CORE VALUE", "FEATURES", "PRICING", "MESSAGE", "TARGET"];
  const cols = ["A", "B", "C", "YOUR PRODUCT"];
  const head = `<div class="bs-rd-matrix__row bs-rd-matrix__row--head"><span></span>${cols.map((c) => `<span>${escapeHtml(c)}</span>`).join("")}</div>`;
  const body = rows
    .map(
      (row) =>
        `<div class="bs-rd-matrix__row"><span class="bs-rd-matrix__label">${escapeHtml(row)}</span>${cols.map(() => `<span>${dash()}</span>`).join("")}</div>`
    )
    .join("");
  return `<div class="bs-rd-preview" id="bs-rd-preview">
  <div class="bs-rd-preview__head"><span class="bs-rd-preview__badge">SAMPLE FRAMEWORK</span><span class="bs-rd-preview__note">DEMO DATA</span></div>
  <div class="bs-rd-matrix">${head}${body}</div>
  <div class="bs-rd-gapmap"><p class="bs-rd-preview__k">GAP MAP</p><div class="bs-rd-gapmap__grid"><span>CROWDED</span><span>OPEN</span><span>DIFFERENT</span></div></div>
</div>`;
}

function previewConsumer(lang) {
  const steps = [
    ["OBSERVATION", lang === "ko" ? "What users do" : "What users do"],
    ["FRICTION", lang === "ko" ? "Where problems happen" : "Where problems happen"],
    ["NEED", lang === "ko" ? "What they want to accomplish" : "What they want to accomplish"],
    ["PATTERN", lang === "ko" ? "What repeats" : "What repeats"],
    ["INSIGHT", lang === "ko" ? "What this may mean" : "What this may mean"],
    ["PRODUCT DECISION", lang === "ko" ? "What to test next" : "What to test next"],
  ];
  const flow = steps
    .map(
      ([k, v], i) =>
        `<div class="bs-rd-board__step"><p class="bs-rd-board__k">${escapeHtml(k)}</p><p class="bs-rd-board__v">${escapeHtml(v)}</p>${i < steps.length - 1 ? `<span class="bs-rd-board__arrow" aria-hidden="true">↓</span>` : ""}</div>`
    )
    .join("");
  return `<div class="bs-rd-preview" id="bs-rd-preview">
  <div class="bs-rd-preview__head"><span class="bs-rd-preview__badge">SAMPLE FRAMEWORK</span><span class="bs-rd-preview__note">DEMO DATA</span></div>
  <div class="bs-rd-board">${flow}</div>
</div>`;
}

function previewUx(lang) {
  const flow = ["ENTRY", "ONBOARDING", "CORE ACTION", "CONVERSION", "RETURN"];
  const chips = flow
    .map((f, i) => `<span class="bs-rd-flowchip${i === 2 ? " is-on" : ""}">${escapeHtml(f)}</span>${i < flow.length - 1 ? `<span class="bs-rd-flowchip__sep" aria-hidden="true">→</span>` : ""}`)
    .join("");
  return `<div class="bs-rd-preview" id="bs-rd-preview">
  <div class="bs-rd-preview__head"><span class="bs-rd-preview__badge">SAMPLE FRAMEWORK</span><span class="bs-rd-preview__note">DEMO DATA</span></div>
  <p class="bs-rd-preview__k">FLOW</p>
  <div class="bs-rd-flowtrack">${chips}</div>
  <div class="bs-rd-auditcols"><div><span>ISSUE</span>${dash()}</div><div><span>SEVERITY</span>${dash()}</div><div><span>IMPACT</span>${dash()}</div></div>
  <p class="bs-rd-preview__trail">FIND → PRIORITIZE → IMPROVE</p>
</div>`;
}

function previewTrend(lang) {
  const rows = [
    ["EMERGING", lang === "ko" ? "무엇이 시작되는가" : "What is starting"],
    ["GROWING", lang === "ko" ? "무엇이 커지는가" : "What is growing"],
    ["MAINSTREAM", lang === "ko" ? "무엇이 일반화되는가" : "What is mainstream"],
    ["DECLINING", lang === "ko" ? "무엇이 약해지는가" : "What is declining"],
    ["IMPLICATION", lang === "ko" ? "제품/사업에 어떤 의미인가" : "What it means for the product"],
  ];
  const list = rows.map(([k, v]) => `<div class="bs-rd-trend__row"><span class="bs-rd-trend__k">${escapeHtml(k)}</span><span class="bs-rd-trend__v">${escapeHtml(v)}</span>${dash()}</div>`).join("");
  return `<div class="bs-rd-preview" id="bs-rd-preview">
  <div class="bs-rd-preview__head"><span class="bs-rd-preview__badge">SAMPLE FRAMEWORK</span><span class="bs-rd-preview__note">DEMO DATA</span></div>
  <p class="bs-rd-preview__k">SIGNAL MAP</p>
  <div class="bs-rd-trend">${list}</div>
</div>`;
}

const PREVIEWS = {
  market: previewMarket,
  competitor: previewCompetitor,
  consumer: previewConsumer,
  ux: previewUx,
  trend: previewTrend,
};

function snapshotSection(copy, lang) {
  const meta = copy.meta || [];
  const pick = (keys) => {
    const row = meta.find((m) => keys.some((k) => String(m.k || "").toUpperCase().includes(k)));
    return row?.v || "—";
  };
  const cells = [
    { k: "SERVICE", v: pick(["SERVICE"]) },
    { k: lang === "ko" ? "예상 기간" : "TIMELINE", v: pick(["TIMELINE", "예상"]) },
    { k: "PRICE", v: pick(["PRICE"]) },
    { k: "BEST FOR", v: pick(["BEST"]) },
  ];
  const grid = cells
    .map((c) => `<article class="bs-rd-snap__cell"><p class="bs-rd-snap__k">${escapeHtml(c.k)}</p><p class="bs-rd-snap__v">${escapeHtml(c.v)}</p></article>`)
    .join("");
  return `<section class="bs-section bs-rd-snap" data-bs-reveal aria-labelledby="bs-rd-snap-title"><div class="bs-inner">
    <p class="bs-eyebrow">RESEARCH SNAPSHOT</p>
    <h2 class="bs-sr-only" id="bs-rd-snap-title">RESEARCH SNAPSHOT</h2>
    <div class="bs-rd-snap__grid">${grid}</div>
  </div></section>`;
}

function questionSection(cfg, lang) {
  return `<section class="bs-section bs-rd-question" data-bs-reveal aria-labelledby="bs-rd-q-title"><div class="bs-inner">
    <p class="bs-eyebrow">THE QUESTION</p>
    <h2 class="bs-rd-question__title" id="bs-rd-q-title">${brHeadline(t(cfg.question, lang))}</h2>
  </div></section>`;
}

function analyzeSection(cfg, lang, areasHtml) {
  const items = t(cfg.analyze, lang).map((item, i) => ({
    n: pad2(i + 1),
    title: item.k,
    body: item.v,
  }));
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-rd-analyze-title"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(t(cfg.analyzeLabel, lang))}</p>
    <h2 class="bs-sr-only" id="bs-rd-analyze-title">${escapeHtml(t(cfg.analyzeLabel, lang))}</h2>
    ${areasHtml(items, "signal")}
  </div></section>`;
}

function whenSection(cfg, lang) {
  const items = cfg.whenItHelps ? t(cfg.whenItHelps, lang) : [];
  if (!items.length) return "";
  const list = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-rd-when-title"><div class="bs-inner">
    <p class="bs-eyebrow">${lang === "ko" ? "WHEN IT HELPS" : "WHEN IT HELPS"}</p>
    <h2 class="bs-sr-only" id="bs-rd-when-title">WHEN IT HELPS</h2>
    <ul class="bs-rd-when">${list}</ul>
  </div></section>`;
}

function previewSection(cfg, lang) {
  const fn = PREVIEWS[cfg.preview];
  if (!fn) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-rd-preview-title"><div class="bs-inner">
    <p class="bs-eyebrow">RESEARCH PREVIEW</p>
    <h2 class="bs-sr-only" id="bs-rd-preview-title">RESEARCH PREVIEW</h2>
    ${fn(lang)}
  </div></section>`;
}

function processSection(slug, lang, processHtmlFn) {
  const steps = cfgProcess(slug, lang);
  const detail = steps.map((s, i) => ({ n: pad2(i + 1), title: s.k, body: s.v }));
  return `<section class="bs-section" data-bs-reveal id="workflow" aria-labelledby="bs-rd-work-title"><div class="bs-inner">
    <p class="bs-eyebrow">HOW WE WORK</p>
    <h2 class="bs-sr-only" id="bs-rd-work-title">HOW WE WORK</h2>
    ${processHtmlFn(detail)}
  </div></section>`;
}

function cfgProcess(slug, lang) {
  const cfg = SLUG_CONFIG[slug];
  if (cfg?.processKey === "consumer") return t(CONSUMER_PROCESS, lang);
  return t(PROCESS, lang);
}

function sourcesSection(lang, tagChips, copy) {
  const items = t(SOURCES, lang);
  const note =
    copy.sourcesNote ||
    (lang === "ko"
      ? "모든 소스를 항상 사용하는 것은 아닙니다. 목적과 범위에 맞는 자료만 선별합니다."
      : "We do not use every source on every project — only what fits the goal and scope.");
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-rd-sources-title"><div class="bs-inner">
    <p class="bs-eyebrow">SOURCES</p>
    <h2 class="bs-title" id="bs-rd-sources-title">${lang === "ko" ? "조사에 사용할 수 있는 자료" : "Sources we may use"}</h2>
    <div class="bs-rd-sources">${items.map((s) => `<article class="bs-rd-sources__item"><p class="bs-rd-sources__k">${escapeHtml(s.k)}</p><p class="bs-rd-sources__v">${escapeHtml(s.v)}</p></article>`).join("")}</div>
    <p class="bs-note">${escapeHtml(note)}</p>
  </div></section>`;
}

function deliverablesSection(cfg, lang, copy) {
  const items = t(cfg.deliverables, lang);
  const lead =
    copy.deliverLead ||
    (lang === "ko"
      ? "범위에 따라 포함 항목이 달라질 수 있습니다."
      : "Included items may vary by scope.");
  const rows = items
    .map(
      (item, i) =>
        `<article class="bs-rd-deliver__row"><span class="bs-rd-deliver__n">${pad2(i + 1)}</span><span class="bs-rd-deliver__k">${escapeHtml(item)}</span></article>`
    )
    .join("");
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-rd-deliver-title"><div class="bs-inner">
    <p class="bs-eyebrow">DELIVERABLES</p>
    <h2 class="bs-title" id="bs-rd-deliver-title">${lang === "ko" ? "RESULTS MAY INCLUDE" : "RESULTS MAY INCLUDE"}</h2>
    <p class="bs-lead">${escapeHtml(lead)}</p>
    <div class="bs-rd-deliver">${rows}</div>
  </div></section>`;
}

function scopeSection(copy) {
  if (!copy.scopes?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-rd-scope-title"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(copy.scopeLabel || "PROJECT SCOPE")}</p>
    <h2 class="bs-title" id="bs-rd-scope-title">${escapeHtml(copy.scopeTitle || "")}</h2>
    ${copy.scopeLead ? `<p class="bs-lead">${escapeHtml(copy.scopeLead)}</p>` : ""}
    <div class="bs-scope bs-scope--levels bs-scope--cards">${copy.scopes
      .map(
        (s, i) =>
          `<article class="bs-scope__col"><p class="bs-scope__k"><span class="bs-scope__lvl">${pad2(i + 1)}</span>${escapeHtml(s.t)}</p><ul class="bs-scope__list">${(s.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>`
      )
      .join("")}</div>
  </div></section>`;
}

/**
 * @param {object} copy normalized service copy
 * @param {string} slug service slug
 * @param {object} helpers { areasHtml, processHtmlFn, engagementSectionHtml, tagChips, timelines }
 */
export function streamlinedResearchDetail(copy, slug, helpers) {
  const cfg = SLUG_CONFIG[slug];
  if (!cfg) return "";
  const lang = copy._pageLang === "ko" || /[가-힣]/.test(String(copy.headline || "")) ? "ko" : "en";
  const { areasHtml, processHtmlFn, engagementSectionHtml, tagChips, timelines = [] } = helpers;

  let html = snapshotSection(copy, lang);
  html += questionSection(cfg, lang);
  html += analyzeSection(cfg, lang, areasHtml);
  html += whenSection(cfg, lang);
  html += previewSection(cfg, lang);
  html += processSection(slug, lang, processHtmlFn);
  if (slug !== "ux-audit") html += sourcesSection(lang, tagChips, copy);
  html += deliverablesSection(cfg, lang, copy);
  html += scopeSection(copy);
  html += engagementSectionHtml(copy, timelines, { priceNameDefault: copy.priceName || slug.toUpperCase() });
  return html;
}
