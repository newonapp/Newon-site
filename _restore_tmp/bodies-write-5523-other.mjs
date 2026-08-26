/**
 * Newon Labs — per-experiment detail HTML bodies.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { LAB_PIPELINE, pipelineIndex } from "./lab-experiments.mjs";

function t(obj, lang, koKey, enKey) {
  if (!obj) return "";
  return lang === "ko" ? obj[koKey] || obj[enKey] || "" : obj[enKey] || obj[koKey] || "";
}

function br(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function padLab(n) {
  return String(n).padStart(2, "0");
}

function ui(lang) {
  const ko = lang === "ko";
  return {
    status: "STATUS",
    stage: "STAGE",
    category: "CATEGORY",
    lastUpdated: ko ? "LAST UPDATED" : "LAST UPDATED",
    theQuestion: "THE QUESTION",
    labNote: "LAB NOTE",
    findings: ko ? "현재 발견한 것" : "What we found",
    nextVerify: ko ? "다음 검증할 것" : "Next to verify",
    backLabs: ko ? "BACK TO LABS ←" : "BACK TO LABS ←",
    follow: ko ? "FOLLOW THIS EXPERIMENT →" : "FOLLOW THIS EXPERIMENT →",
    demo: "DEMO / PROTOTYPE",
    demoData: "DEMO DATA",
    demoAnalytics: "DEMO ANALYTICS",
    demoResponse: "DEMO RESPONSE DATA",
    researchConcept: "RESEARCH CONCEPT",
    prototypeHeuristic: ko ? "PROTOTYPE HEURISTIC — 실제 AI API 아님" : "PROTOTYPE HEURISTIC — not a live AI API",
    becameProduct: "THIS EXPERIMENT BECAME A PRODUCT",
    viewProduct: ko ? "VIEW PRODUCT →" : "VIEW PRODUCT →",
    pipelineLabel: ko ? "LABS → PRODUCT" : "LABS → PRODUCT",
    metrics: "EXPERIMENT METRICS",
    howItWorks: "HOW IT WORKS",
    liveExperiment: "LIVE EXPERIMENT",
    why: "WHY THIS EXPERIMENT",
    roadmap: "ROADMAP",
    corePrinciple: "CORE PRINCIPLE",
    discoveryPipeline: "DISCOVERY PIPELINE",
    experimentBoard: "EXPERIMENT BOARD",
    ideaTest: "IDEA TEST",
    theExperiment: "THE EXPERIMENT",
    researchSystem: "RESEARCH SYSTEM",
    whatTesting: "WHAT WE ARE TESTING",
    related: "RELATED PROJECT",
  };
}

function stageProgress(exp, lang) {
  const u = ui(lang);
  const idx = pipelineIndex(exp.stage === "PRODUCT" ? "PRODUCT" : exp.stage);
  const steps = LAB_PIPELINE.map((s, i) => {
    const state = i < idx ? "is-done" : i === idx ? "is-current" : "";
    return `<li class="ld-pipe__step ${state}"><span class="ld-pipe__dot" aria-hidden="true"></span><span class="ld-pipe__name">${escapeHtml(s)}</span></li>`;
  }).join("");

  const productCta =
    exp.status === "VALIDATED" && exp.relatedProduct
      ? `<div class="ld-became">
          <p class="ld-mono">${escapeHtml(u.becameProduct)}</p>
          <a class="ld-btn" href="${escapeHtml(lang === "ko" ? exp.relatedProduct.hrefKo : exp.relatedProduct.hrefEn)}">${escapeHtml(u.viewProduct)}</a>
        </div>`
      : "";

  return `<nav class="ld-pipe" aria-label="${escapeHtml(u.pipelineLabel)}">
    <p class="ld-k">${escapeHtml(u.pipelineLabel)}</p>
    <ol class="ld-pipe__list">${steps}</ol>
    ${productCta}
  </nav>`;
}

function statusPanel(exp, lang) {
  const u = ui(lang);
  const stageLabel = t(exp, lang, "stageLabelKo", "stageLabelEn");
  return `<aside class="ld-status" aria-label="Lab status">
    <p class="ld-k">LAB STATUS</p>
    <dl class="ld-status__dl">
      <div><dt>${escapeHtml(u.status)}</dt><dd class="ld-mono">${escapeHtml(exp.status)}</dd></div>
      <div><dt>${escapeHtml(u.stage)}</dt><dd class="ld-mono">${escapeHtml(stageLabel)}</dd></div>
      <div><dt>${escapeHtml(u.category)}</dt><dd class="ld-mono">${escapeHtml(exp.categoryLabel || String(exp.category || "").toUpperCase())}</dd></div>
      <div><dt>${escapeHtml(u.lastUpdated)}</dt><dd class="ld-mono">${escapeHtml(exp.updatedAt || "—")}</dd></div>
    </dl>
  </aside>`;
}

function hero(exp, lang, copy) {
  const u = ui(lang);
  const labId = `LAB ${padLab(exp.labNumber)}`;
  const cat = String(exp.category || "").toUpperCase();
  const title = t(exp, lang, "displayTitleKo", "displayTitleEn") || t(exp, lang, "titleKo", "titleEn");
  const lead = t(exp, lang, "heroLeadKo", "heroLeadEn");
  const desc = t(exp, lang, "descKo", "descEn");

  return `<header class="ld-hero${exp.slug === "game-experiment" ? " ld-hero--cinema" : ""}">
    <div class="ld-hero__grid">
      <div class="ld-hero__copy">
        <p class="ld-meta"><span class="ld-mono">${escapeHtml(labId)} / ${escapeHtml(cat)}</span><span class="ld-meta__sep" aria-hidden="true">·</span><span class="ld-mono">STATUS — ${escapeHtml(exp.status)}</span></p>
        <h1 class="ld-hero__title">${escapeHtml(title)}</h1>
        <p class="ld-hero__lead">${br(lead)}</p>
        <p class="ld-hero__desc">${escapeHtml(desc)}</p>
      </div>
      ${statusPanel(exp, lang)}
    </div>
    ${stageProgress(exp, lang)}
  </header>`;
}

function questionBlock(exp, lang) {
  const u = ui(lang);
  const q = t(exp, lang, "questionKo", "questionEn");
  return `<section class="ld-section ld-question" id="the-question">
    <p class="ld-k">${escapeHtml(u.theQuestion)}</p>
    <h2 class="ld-display">${br(q)}</h2>
  </section>`;
}

function labNote(exp, lang) {
  const u = ui(lang);
  const findings = t(exp, lang, "findingsKo", "findingsEn") || "—";
  const next = t(exp, lang, "nextStepKo", "nextStepEn") || t(exp, lang, "nextKo", "nextEn") || "—";
  return `<section class="ld-section ld-note" id="lab-note">
    <p class="ld-k">${escapeHtml(u.labNote)}</p>
    <div class="ld-note__grid">
      <div>
        <p class="ld-k ld-k--sm">${escapeHtml(u.findings)}</p>
        <p class="ld-body">${escapeHtml(findings)}</p>
      </div>
      <div>
        <p class="ld-k ld-k--sm">${escapeHtml(u.nextVerify)}</p>
        <p class="ld-body">${escapeHtml(next)}</p>
      </div>
    </div>
  </section>`;
}

function detailCtas(lang, copy) {
  const u = ui(lang);
  return `<section class="ld-section ld-ctas">
    <a class="ld-link" href="../">${escapeHtml(u.backLabs)}</a>
    <a class="ld-btn" href="#lab-note">${escapeHtml(u.follow)}</a>
  </section>`;
}

function metricDash(value) {
  return value == null || value === "" ? "—" : escapeHtml(String(value));
}

/* ─── 01 Review AI ─── */
function bodyReviewAi(exp, lang) {
  const u = ui(lang);
  const ko = lang === "ko";
  const steps = [
    { n: "01", t: "COLLECT", d: ko ? "리뷰 수집" : "Collect reviews" },
    { n: "02", t: "CLASSIFY", d: ko ? "감정과 유형 분류" : "Classify sentiment & type" },
    { n: "03", t: "DETECT", d: ko ? "반복 패턴 발견" : "Detect repeated patterns" },
    { n: "04", t: "PRIORITIZE", d: ko ? "제품 개선 우선순위 생성" : "Generate product priorities" },
  ]
    .map(
      (s) => `<li class="ld-steps__item"><span class="ld-mono">${s.n}</span><strong>${escapeHtml(s.t)}</strong><span>${escapeHtml(s.d)}</span></li>`
    )
    .join("");

  return `${questionBlock(exp, lang)}
<section class="ld-section ld-live" id="live-experiment" data-ld-review>
  <div class="ld-section__head">
    <p class="ld-k">${escapeHtml(u.liveExperiment)}</p>
    <span class="ld-badge" role="status">${escapeHtml(u.prototypeHeuristic)}</span>
  </div>
  <p class="ld-body ld-body--tight">${ko ? "리뷰를 줄바꿈으로 여러 개 붙여넣고 분석해 보세요. 결과는 클라이언트 휴리스틱이며 실제 AI API가 아닙니다." : "Paste multiple reviews (one per line). Results use a client-side heuristic — not a live AI API."}</p>
  <label class="ld-label" for="ld-review-input">${ko ? "리뷰 텍스트" : "Review text"}</label>
  <textarea id="ld-review-input" class="ld-textarea" rows="8" placeholder="${ko ? "리뷰를 한 줄에 하나씩 붙여넣으세요…" : "Paste one review per line…"}" aria-describedby="ld-review-hint"></textarea>
  <p id="ld-review-hint" class="ld-hint">${escapeHtml(u.demo)} · Review AI service layer ready for API wiring</p>
  <button type="button" class="ld-btn" data-ld-review-run>${ko ? "ANALYZE REVIEWS →" : "ANALYZE REVIEWS →"}</button>
  <div class="ld-review-out" data-ld-review-out hidden>
    <p class="ld-badge">${escapeHtml(u.demoData)}</p>
    <div class="ld-stat-row" data-ld-review-stats></div>
    <div class="ld-review-cols" data-ld-review-cols></div>
    <div class="ld-priorities" data-ld-review-prio></div>
  </div>
</section>
<section class="ld-section" id="how-it-works">
  <p class="ld-k">${escapeHtml(u.howItWorks)}</p>
  <ol class="ld-steps">${steps}</ol>
</section>
<section class="ld-section" id="metrics">
  <p class="ld-k">${escapeHtml(u.metrics)}</p>
  <div class="ld-stat-row">
    <div class="ld-stat"><strong class="ld-mono">${metricDash(exp.metrics?.reviewsAnalyzed)}</strong><span>REVIEWS ANALYZED</span></div>
    <div class="ld-stat"><strong class="ld-mono">${metricDash(exp.metrics?.signalsFound)}</strong><span>SIGNALS FOUND</span></div>
    <div class="ld-stat"><strong class="ld-mono">${metricDash(exp.metrics?.repeatedIssues)}</strong><span>REPEATED ISSUES</span></div>
    <div class="ld-stat"><strong class="ld-mono">${escapeHtml(exp.status)}</strong><span>EXPERIMENT STATUS</span></div>
  </div>
</section>
${labNote(exp, lang)}
${detailCtas(lang)}`;
}

/* ─── 02 Newon QR ─── */
function bodyQr(exp, lang) {
  const u = ui(lang);
  const ko = lang === "ko";
  const hyps = (exp.hypotheses || [])
    .map(
      (h) => `<li class="ld-hyp"><span class="ld-mono">${escapeHtml(h.n)}</span><p>${escapeHtml(ko ? h.ko : h.en)}</p></li>`
    )
    .join("");

  return `${questionBlock(exp, lang)}
<section class="ld-section ld-live" id="live-qr" data-ld-qr>
  <div class="ld-section__head">
    <p class="ld-k">LIVE QR BUILDER</p>
    <span class="ld-badge">${escapeHtml(u.demo)} · Client-side QR</span>
  </div>
  <div class="ld-qr-build">
    <div class="ld-qr-form">
      <label class="ld-label" for="ld-qr-url">Destination URL</label>
      <input id="ld-qr-url" class="ld-input" type="url" inputmode="url" placeholder="https://www.newon.app" autocomplete="url" />
      <label class="ld-label" for="ld-qr-name">QR Name</label>
      <input id="ld-qr-name" class="ld-input" type="text" maxlength="80" placeholder="${ko ? "이벤트 포스터" : "Event poster"}" />
      <p class="ld-err" data-ld-qr-err hidden role="alert"></p>
      <button type="button" class="ld-btn" data-ld-qr-gen>GENERATE QR →</button>
      <div class="ld-qr-actions" data-ld-qr-actions hidden>
        <button type="button" class="ld-btn ld-btn--ghost" data-ld-qr-dl>Download PNG</button>
        <button type="button" class="ld-btn ld-btn--ghost" data-ld-qr-copy>Copy Link</button>
        <button type="button" class="ld-link" data-ld-qr-reset>Reset</button>
      </div>
    </div>
    <div class="ld-qr-preview" data-ld-qr-preview aria-live="polite">
      <p class="ld-k ld-k--sm">QR PREVIEW</p>
      <div class="ld-qr-frame" data-ld-qr-frame>
        <p class="ld-hint">${ko ? "URL을 입력하고 생성하세요." : "Enter a URL and generate."}</p>
      </div>
    </div>
  </div>
</section>
<section class="ld-section" id="qr-dashboard" data-ld-qr-dash>
  <div class="ld-section__head">
    <p class="ld-k">QR DASHBOARD PREVIEW</p>
    <span class="ld-badge">${escapeHtml(u.demoAnalytics)}</span>
  </div>
  <div class="ld-table-wrap">
    <table class="ld-table">
      <thead><tr><th>QR NAME</th><th>DESTINATION</th><th>STATUS</th><th>SCANS</th><th>LAST SCAN</th></tr></thead>
      <tbody data-ld-qr-rows>
        <tr><td colspan="5" class="ld-hint">${ko ? "QR을 생성하면 여기에 미리보기가 나타납니다." : "Generate a QR to populate this preview."}</td></tr>
      </tbody>
    </table>
  </div>
  <div class="ld-stat-row ld-stat-row--demo">
    <div class="ld-stat"><strong class="ld-mono">—</strong><span>TOTAL SCANS</span></div>
    <div class="ld-stat"><strong class="ld-mono">—</strong><span>UNIQUE VISITORS</span></div>
    <div class="ld-stat"><strong class="ld-mono">DEMO</strong><span>DEVICE</span></div>
    <div class="ld-stat"><strong class="ld-mono">DEMO</strong><span>COUNTRY</span></div>
    <div class="ld-stat"><strong class="ld-mono">DEMO</strong><span>TIME</span></div>
  </div>
</section>
<section class="ld-section" id="why">
  <p class="ld-k">${escapeHtml(u.why)}</p>
  <h2 class="ld-display ld-display--sm">${br(t(exp, lang, "questionKo", "questionEn"))}</h2>
  <ol class="ld-hyp-list">${hyps}</ol>
</section>
<section class="ld-section" id="roadmap">
  <p class="ld-k">${escapeHtml(u.roadmap)}</p>
  <ol class="ld-roadmap" aria-label="QR product roadmap">
    <li class="is-done"><span>GENERATE</span></li>
    <li class="is-current"><span>MANAGE</span></li>
    <li><span>TRACK</span></li>
    <li><span>ANALYZE</span></li>
  </ol>
</section>
${labNote(exp, lang)}
${detailCtas(lang)}`;
}

/* ─── 03 Newon Form ─── */
function bodyForm(exp, lang) {
  const u = ui(lang);
  const ko = lang === "ko";
  const principles = (ko ? exp.principles?.ko : exp.principles?.en) || [];
  const prinHtml = principles.map((p) => `<p class="ld-principle">${escapeHtml(p)}</p>`).join("");

  return `${questionBlock(exp, lang)}
<section class="ld-section ld-live" id="form-builder" data-ld-form data-lang="${escapeHtml(lang)}">
  <div class="ld-section__head">
    <p class="ld-k">FORM BUILDER PROTOTYPE</p>
    <span class="ld-badge">${escapeHtml(u.demo)}</span>
  </div>
  <div class="ld-form-split">
    <div class="ld-form-build">
      <p class="ld-k ld-k--sm">FORM BUILDER</p>
      <label class="ld-label" for="ld-form-title">Form title</label>
      <input id="ld-form-title" class="ld-input" type="text" value="${ko ? "제품 피드백" : "Product feedback"}" maxlength="120" />
      <label class="ld-label" for="ld-form-desc">Description</label>
      <textarea id="ld-form-desc" class="ld-textarea ld-textarea--sm" rows="2">${ko ? "한 가지만 알려주세요." : "Tell us one thing."}</textarea>
      <p class="ld-k ld-k--sm" style="margin-top:1.25rem">${ko ? "질문 추가" : "Add question"}</p>
      <div class="ld-form-types" role="group" aria-label="Question types">
        <button type="button" class="ld-chip" data-ld-form-add="short">${ko ? "Short Text" : "Short Text"}</button>
        <button type="button" class="ld-chip" data-ld-form-add="long">${ko ? "Long Text" : "Long Text"}</button>
        <button type="button" class="ld-chip" data-ld-form-add="choice">${ko ? "Multiple Choice" : "Multiple Choice"}</button>
        <button type="button" class="ld-chip" data-ld-form-add="email">Email</button>
        <button type="button" class="ld-chip" data-ld-form-add="rating">Rating</button>
      </div>
      <button type="button" class="ld-btn ld-btn--ghost" data-ld-form-add="short" style="margin-top:0.75rem">ADD QUESTION +</button>
      <ul class="ld-form-qlist" data-ld-form-qlist></ul>
    </div>
    <div class="ld-form-preview">
      <p class="ld-k ld-k--sm">LIVE PREVIEW</p>
      <div class="ld-form-card" data-ld-form-preview aria-live="polite"></div>
      <button type="button" class="ld-btn" data-ld-form-open style="margin-top:1rem">${ko ? "PREVIEW FORM" : "PREVIEW FORM"}</button>
    </div>
  </div>
</section>
<dialog class="ld-dialog" data-ld-form-dialog aria-labelledby="ld-form-dialog-title">
  <form method="dialog" class="ld-dialog__inner" data-ld-form-respond>
    <p class="ld-k" id="ld-form-dialog-title">${ko ? "RESPONSE EXPERIENCE" : "RESPONSE EXPERIENCE"}</p>
    <div data-ld-form-respond-body></div>
    <div class="ld-dialog__actions">
      <button type="submit" class="ld-btn" value="submit">SUBMIT RESPONSE →</button>
      <button type="submit" class="ld-link" value="cancel">${ko ? "닫기" : "Close"}</button>
    </div>
  </form>
  <div class="ld-dialog__done" data-ld-form-done hidden>
    <p class="ld-display ld-display--sm">RESPONSE RECEIVED</p>
    <button type="button" class="ld-btn" data-ld-form-done-close>${ko ? "닫기" : "Close"}</button>
  </div>
</dialog>
<section class="ld-section" id="response-dashboard">
  <div class="ld-section__head">
    <p class="ld-k">RESPONSE DASHBOARD</p>
    <span class="ld-badge">${escapeHtml(u.demoResponse)}</span>
  </div>
  <div class="ld-stat-row">
    <div class="ld-stat"><strong class="ld-mono">—</strong><span>RESPONSES</span></div>
    <div class="ld-stat"><strong class="ld-mono">—</strong><span>COMPLETION RATE</span></div>
    <div class="ld-stat"><strong class="ld-mono">DEMO</strong><span>LATEST RESPONSE</span></div>
    <div class="ld-stat"><strong class="ld-mono">—</strong><span>AVERAGE RATING</span></div>
  </div>
  <div class="ld-table-wrap">
    <table class="ld-table">
      <thead><tr><th>#</th><th>TIME</th><th>CHANNEL</th><th>SUMMARY</th></tr></thead>
      <tbody>
        <tr><td class="ld-mono">01</td><td class="ld-mono">—</td><td>DEMO</td><td>${ko ? "백엔드 미연결 · 샘플 없음" : "No backend · no sample rows"}</td></tr>
      </tbody>
    </table>
  </div>
</section>
<section class="ld-section ld-principle-block" id="principle">
  <p class="ld-k">${escapeHtml(u.corePrinciple)}</p>
  ${prinHtml}
</section>
${labNote(exp, lang)}
${detailCtas(lang)}`;
}

/* ─── 04 AI Product Discovery ─── */
function bodyAi(exp, lang) {
  const u = ui(lang);
  const ko = lang === "ko";
  const pipe = [
    { n: "01", t: "PROBLEM", d: ko ? "반복되는 사용자 문제 발견" : "Find recurring user problems" },
    { n: "02", t: "SIGNAL", d: ko ? "실제 수요와 행동 신호 확인" : "Confirm demand & behavior signals" },
    { n: "03", t: "AI FIT", d: ko ? "AI가 기존 방식보다 나은지 판단" : "Judge if AI beats existing approaches" },
    { n: "04", t: "PROTOTYPE", d: ko ? "최소 기능 실험" : "Minimum viable experiment" },
    { n: "05", t: "VALIDATE", d: ko ? "실제 사용자 반응 검증" : "Validate with real users" },
    { n: "06", t: "PRODUCT", d: ko ? "검증된 경우 Newon 제품으로 전환" : "Graduate to a Newon product" },
  ]
    .map(
      (s, i) =>
        `<li class="ld-vpipe__item"><span class="ld-mono">${s.n}</span><div><strong>${escapeHtml(s.t)}</strong><p>${escapeHtml(s.d)}</p></div>${i < 5 ? '<span class="ld-vpipe__arrow" aria-hidden="true">↓</span>' : ""}</li>`
    )
    .join("");

  const board = (exp.board || [])
    .map((row) => {
      return `<article class="ld-board__row">
        <p class="ld-badge">${escapeHtml(u.researchConcept)}</p>
        <dl class="ld-board__dl">
          <div><dt>PROBLEM</dt><dd>${escapeHtml(ko ? row.problemKo : row.problemEn)}</dd></div>
          <div><dt>TARGET USER</dt><dd>${escapeHtml(ko ? row.userKo : row.userEn)}</dd></div>
          <div><dt>FREQUENCY</dt><dd class="ld-mono">${escapeHtml(row.frequency)}</dd></div>
          <div><dt>AI FIT</dt><dd class="ld-mono">${escapeHtml(row.aiFit)}</dd></div>
          <div><dt>BUSINESS POTENTIAL</dt><dd class="ld-mono">${escapeHtml(row.potential)}</dd></div>
          <div><dt>STATUS</dt><dd class="ld-mono">${escapeHtml(row.status)}</dd></div>
        </dl>
      </article>`;
    })
    .join("");

  return `${questionBlock(exp, lang)}
<section class="ld-section" id="discovery-pipeline">
  <p class="ld-k">${escapeHtml(u.discoveryPipeline)}</p>
  <ol class="ld-vpipe">${pipe}</ol>
</section>
<section class="ld-section" id="experiment-board">
  <div class="ld-section__head">
    <p class="ld-k">${escapeHtml(u.experimentBoard)}</p>
    <span class="ld-badge">${escapeHtml(u.researchConcept)}</span>
  </div>
  <div class="ld-board">${board}</div>
</section>
<section class="ld-section ld-live" id="idea-test" data-ld-idea>
  <div class="ld-section__head">
    <p class="ld-k">${escapeHtml(u.ideaTest)}</p>
    <span class="ld-badge">${escapeHtml(u.prototypeHeuristic)}</span>
  </div>
  <label class="ld-label" for="ld-idea-input">${ko ? "반복해서 겪고 있는 문제를 적어주세요." : "Describe a problem you keep running into."}</label>
  <textarea id="ld-idea-input" class="ld-textarea" rows="4" maxlength="600"></textarea>
  <button type="button" class="ld-btn" data-ld-idea-run>TEST THE IDEA →</button>
  <div class="ld-idea-out" data-ld-idea-out hidden></div>
</section>
<section class="ld-section ld-principle-block ld-principle-block--xl" id="principle">
  <p class="ld-display">WE DON'T START WITH AI.<br />WE START WITH THE PROBLEM.</p>
</section>
${labNote(exp, lang)}
${detailCtas(lang)}`;
}

/* ─── 05 Game Experiment ─── */
function bodyGame(exp, lang) {
  const u = ui(lang);
  const ko = lang === "ko";
  const tests = [
    {
      n: "01",
      ko: "선택이 실제로 중요하다고 느끼는가?",
      en: "Do players feel their choices actually matter?",
    },
    {
      n: "02",
      ko: "게임이 이전 행동을 기억하면 몰입도가 올라가는가?",
      en: "Does remembering prior actions deepen immersion?",
    },
    {
      n: "03",
      ko: "플레이어가 자신의 선택과 모순될 때 긴장감이 생기는가?",
      en: "Does contradiction with past choices create tension?",
    },
    {
      n: "04",
      ko: "결과를 알게 된 뒤 다시 플레이하고 싶어지는가?",
      en: "After seeing consequences, do players want to replay?",
    },
  ]
    .map(
      (x) => `<li class="ld-hyp"><span class="ld-mono">${x.n}</span><p>${escapeHtml(ko ? x.ko : x.en)}</p></li>`
    )
    .join("");

  const system = [
    { t: "CHOICE", d: ko ? "결정을 강제하는 순간" : "A forced decision" },
    { t: "MEMORY", d: ko ? "시스템이 선택을 기록" : "The system stores the choice" },
    { t: "CONTRADICTION", d: ko ? "이전 선택과 충돌" : "Collision with prior choice" },
    { t: "CONSEQUENCE", d: ko ? "결과에 영향" : "Outcome shifts" },
    { t: "REPLAY", d: ko ? "다시 보고 싶은 루프" : "The urge to replay" },
  ]
    .map(
      (s, i) =>
        `<li class="ld-vpipe__item ld-vpipe__item--cinema"><strong>${escapeHtml(s.t)}</strong><p>${escapeHtml(s.d)}</p>${i < 4 ? '<span class="ld-vpipe__arrow" aria-hidden="true">↓</span>' : ""}</li>`
    )
    .join("");

  const rel = exp.relatedProduct;
  const relHref = ko ? rel.hrefKo : rel.hrefEn;

  return `${questionBlock(exp, lang)}
<section class="ld-section ld-cinema" id="the-experiment" data-ld-game>
  <p class="ld-k">${escapeHtml(u.theExperiment)}</p>
  <div class="ld-game" aria-live="polite">
    <p class="ld-k ld-k--sm">SYSTEM</p>
    <p class="ld-game__prompt" data-ld-game-prompt></p>
    <p class="ld-game__q" data-ld-game-q>WHAT DO YOU DO?</p>
    <div class="ld-game__choices" data-ld-game-choices></div>
    <div class="ld-game__result" data-ld-game-result hidden>
      <p class="ld-mono">CHOICE RECORDED</p>
      <p class="ld-game__remember">SYSTEM WILL REMEMBER THIS.</p>
      <button type="button" class="ld-btn" data-ld-game-next hidden>${ko ? "CONTINUE →" : "CONTINUE →"}</button>
      <button type="button" class="ld-link" data-ld-game-reset hidden>${ko ? "REPLAY" : "REPLAY"}</button>
    </div>
  </div>
</section>
<section class="ld-section" id="research-system">
  <p class="ld-k">${escapeHtml(u.researchSystem)}</p>
  <ol class="ld-vpipe">${system}</ol>
</section>
<section class="ld-section" id="what-we-test">
  <p class="ld-k">${escapeHtml(u.whatTesting)}</p>
  <ol class="ld-hyp-list">${tests}</ol>
</section>
<section class="ld-section ld-related" id="related">
  <p class="ld-k">${escapeHtml(u.related)}</p>
  <p class="ld-badge">${escapeHtml(t(rel, lang, "labelKo", "labelEn"))}</p>
  <h3 class="ld-display ld-display--sm">${escapeHtml(t(rel, lang, "titleKo", "titleEn"))}</h3>
  <p class="ld-body">${escapeHtml(t(rel, lang, "blurbKo", "blurbEn"))}</p>
  <p class="ld-hint">${escapeHtml(t(rel, lang, "noteKo", "noteEn"))}</p>
  <a class="ld-btn" href="${escapeHtml(relHref)}">VIEW 404: HUMAN →</a>
</section>
${labNote(exp, lang)}
${detailCtas(lang)}`;
}

const BODIES = {
  "review-ai": bodyReviewAi,
  "newon-qr": bodyQr,
  "newon-form": bodyForm,
  "ai-experiment": bodyAi,
  "game-experiment": bodyGame,
};

/**
 * @param {object} exp
 * @param {object} copies
 * @param {string} lang
 * @param {{ breadcrumb: Function, exploreGrid: Function, resourceSwitcher: Function }} helpers
 */
export function labDetailBody(exp, copies, lang, helpers) {
  const copy = copies.labs;
  const title = t(exp, lang, "titleKo", "titleEn");
  const bodyFn = BODIES[exp.slug] || bodyReviewAi;
  const { breadcrumb, exploreGrid, resourceSwitcher } = helpers;

  return `${breadcrumb(copy, title, { resourcesHref: "../../", mid: copy.navLabel || "LABS", midHref: "../" })}
<article class="ld-page" data-ld-slug="${escapeHtml(exp.slug)}" data-ld-lang="${escapeHtml(lang)}" data-lab-number="${escapeHtml(String(exp.labNumber))}">
  <div class="rs-inner ld-inner">
    ${hero(exp, lang, copy)}
    ${bodyFn(exp, lang)}
  </div>
</article>
${exploreGrid(copies, "../../")}
${resourceSwitcher("labs", copies, "../")}`;
}
