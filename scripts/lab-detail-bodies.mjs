/**
 * Newon Labs — experiment detail pages (R&D case study layout).
 */
import { escapeHtml } from "./hub-utils.mjs";
import { LAB_PIPELINE, pipelineIndex, getLabsExperiments } from "./lab-experiments.mjs";
import { getLabDetailContent, LAB_DETAIL_RELATED } from "./lab-detail-content.mjs";
import { labsBackNav } from "./labs-hub.mjs";

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

function fmtUpdated(iso) {
  if (!iso) return "";
  return String(iso).replace(/-/g, ".").slice(0, 7);
}

function ui(lang) {
  const ko = lang === "ko";
  return {
    experiment: "EXPERIMENT",
    status: "STATUS",
    category: "CATEGORY",
    started: "STARTED",
    lastUpdated: "LAST UPDATED",
    snapshot: "EXPERIMENT SNAPSHOT",
    question: "THE QUESTION",
    why: "WHY THIS EXPERIMENT",
    problem: "PROBLEM",
    hypothesis: "HYPOTHESIS",
    experimentLabel: "EXPERIMENT",
    how: "HOW IT WORKS",
    testing: "WHAT WE'RE TESTING",
    signals: "WHAT WE OBSERVE",
    currentStatus: "CURRENT STATUS",
    next: "NEXT STEP",
    related: "RELATED EXPERIMENTS",
    backLabs: ko ? "← Back to Labs" : "← Back to Labs",
    nextExp: ko ? "Next Experiment" : "Next Experiment",
    viewExp: "VIEW EXPERIMENT",
    demo: "DEMO DATA",
    demoProto: ko ? "DEMO · PROTOTYPE" : "DEMO · PROTOTYPE",
    liveExperiment: "LIVE EXPERIMENT",
    prototypeNote: ko
      ? "PROTOTYPE HEURISTIC — 실제 AI API 아님"
      : "PROTOTYPE HEURISTIC — not a live AI API",
    collecting: ko ? "Collecting signals" : "Collecting signals",
    validating: ko ? "Validation in progress" : "Validation in progress",
    nextUndefined: ko
      ? "Next validation step is being defined."
      : "Next validation step is being defined.",
    playExperiment: "PLAY EXPERIMENT",
  };
}

function contentFor(exp, lang) {
  return getLabDetailContent(exp.slug, lang);
}

function statusPipeline(exp) {
  const idx = pipelineIndex(exp.stage === "PRODUCT" ? "PRODUCT" : exp.status || exp.stage);
  return LAB_PIPELINE.map((s, i) => {
    const cls = i === idx ? "is-current" : "is-muted";
    const arrow = i < LAB_PIPELINE.length - 1 ? '<i class="ld-pipe__arrow" aria-hidden="true">→</i>' : "";
    return `<li class="ld-pipe__step ${cls}"><span>${escapeHtml(s)}</span>${arrow}</li>`;
  }).join("");
}

function hero(exp, content, lang) {
  const u = ui(lang);
  const n = padLab(exp.labNumber);
  const cat = content?.category || String(exp.category || "").toUpperCase();
  const updated = fmtUpdated(exp.updatedAt);
  const title = t(exp, lang, "titleKo", "titleEn");
  const headline = content?.headline || t(exp, lang, "heroLeadKo", "heroLeadEn");
  const desc = content?.description || t(exp, lang, "descKo", "descEn");

  const metaItems = [
    `<div><dt>${escapeHtml(u.status)}</dt><dd class="ld-mono">${escapeHtml(exp.status)}</dd></div>`,
    `<div><dt>${escapeHtml(u.category)}</dt><dd class="ld-mono">${escapeHtml(cat)}</dd></div>`,
  ];
  if (updated) {
    metaItems.push(
      `<div><dt>${escapeHtml(u.lastUpdated)}</dt><dd class="ld-mono">${escapeHtml(updated)}</dd></div>`
    );
  }

  return `<header class="ld-hero" id="experiment-hero" data-ld-reveal>
    <div class="ld-hero__grid">
      <div class="ld-hero__copy">
        <p class="ld-k">${escapeHtml(u.experiment)} ${n}</p>
        <p class="ld-hero__meta-line"><span class="ld-mono">${escapeHtml(cat)}</span><span aria-hidden="true"> · </span><span class="ld-mono">${escapeHtml(exp.status)}</span></p>
        <h1 class="ld-hero__title">${br(headline)}</h1>
        <p class="ld-hero__desc">${escapeHtml(desc)}</p>
        <dl class="ld-hero__dl">${metaItems.join("")}</dl>
      </div>
      <aside class="ld-hero__visual" aria-label="Experiment preview">
        ${heroVisual(exp.slug, lang)}
      </aside>
    </div>
  </header>`;
}

function heroVisual(slug, lang) {
  const ko = lang === "ko";
  const demo = `<p class="ld-demo-tag">${escapeHtml(ui(lang).demo)}</p>`;

  if (slug === "review-ai") {
    return `<div class="ld-viz ld-viz--review">
      ${demo}
      <div class="ld-viz__cols">
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">USER REVIEWS</p>
          <ul class="ld-viz__reviews">
            <li>${ko ? "알림이 너무 많아요" : "Too many notifications"}</li>
            <li>${ko ? "위젯 추가해 주세요" : "Please add widgets"}</li>
            <li>${ko ? "로그인할 때마다 끊겨요" : "Login drops every time"}</li>
          </ul>
        </div>
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">SIGNALS</p>
          <ul class="ld-viz__tags">
            <li>Navigation confusing</li>
            <li>Onboarding too long</li>
            <li>Feature request</li>
          </ul>
        </div>
        <div class="ld-viz__col ld-viz__col--accent">
          <p class="ld-k ld-k--sm">PRODUCT INSIGHT</p>
          <dl class="ld-viz__insight">
            <div><dt>Priority</dt><dd class="ld-mono">High</dd></div>
            <div><dt>Pattern</dt><dd>${ko ? "Onboarding friction" : "Onboarding friction"}</dd></div>
          </dl>
        </div>
      </div>
    </div>`;
  }

  if (slug === "newon-qr") {
    return `<div class="ld-viz ld-viz--qr">
      ${demo}
      <div class="ld-viz__cols ld-viz__cols--qr">
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">URL INPUT</p>
          <div class="ld-wire">https://newon.app</div>
        </div>
        <div class="ld-viz__col ld-viz__col--center">
          <p class="ld-k ld-k--sm">QR PREVIEW</p>
          <div class="ld-viz__qr-mark" aria-hidden="true"><span></span><span></span><span></span><span></span><b></b></div>
        </div>
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">SCAN SIGNAL</p>
          <dl class="ld-viz__metrics">
            <div><dt>Scans</dt><dd class="ld-mono">—</dd></div>
            <div><dt>Visits</dt><dd class="ld-mono">—</dd></div>
            <div><dt>Conversion</dt><dd class="ld-mono">—</dd></div>
          </dl>
        </div>
      </div>
    </div>`;
  }

  if (slug === "newon-form") {
    return `<div class="ld-viz ld-viz--form">
      ${demo}
      <div class="ld-viz__cols">
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">FORM</p>
          <p class="ld-viz__form-title">${ko ? "Product feedback" : "Product feedback"}</p>
          <div class="ld-wire"></div>
          <p class="ld-viz__field">Name</p>
          <div class="ld-wire"></div>
          <p class="ld-viz__field">Email</p>
          <div class="ld-wire"></div>
          <p class="ld-viz__field">${ko ? "What should we improve?" : "What should we improve?"}</p>
          <div class="ld-wire ld-wire--lg"></div>
        </div>
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">RESPONSES</p>
          <p class="ld-viz__waiting">${ko ? "Waiting for data" : "Waiting for data"}</p>
        </div>
      </div>
    </div>`;
  }

  if (slug === "ai-experiment") {
    return `<div class="ld-viz ld-viz--ai">
      ${demo}
      <div class="ld-viz__cols">
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">SIGNALS</p>
          <ul class="ld-viz__tags">
            <li>User pain</li>
            <li>Market pattern</li>
            <li>Existing alternatives</li>
          </ul>
        </div>
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">OPPORTUNITY</p>
          <dl class="ld-viz__insight">
            <div><dt>Problem strength</dt><dd class="ld-mono">—</dd></div>
            <div><dt>AI fit</dt><dd class="ld-mono">—</dd></div>
            <div><dt>Build complexity</dt><dd class="ld-mono">—</dd></div>
          </dl>
        </div>
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">DECISION</p>
          <ul class="ld-viz__decision">
            <li class="is-on">RESEARCH</li>
            <li>PROTOTYPE</li>
            <li>PASS</li>
          </ul>
        </div>
      </div>
    </div>`;
  }

  if (slug === "game-experiment") {
    return `<div class="ld-viz ld-viz--game">
      ${demo}
      <div class="ld-viz__term">
        <p class="ld-k ld-k--sm">PLAYER CHOICE</p>
        <pre>&gt; Tell the truth
&gt; Hide the information</pre>
        <p class="ld-k ld-k--sm">SYSTEM MEMORY</p>
        <pre>&gt; Choice stored</pre>
        <p class="ld-k ld-k--sm">LATER</p>
        <pre>&gt; Previous behavior detected.</pre>
        <p class="ld-k ld-k--sm">CONSEQUENCE</p>
        <pre>&gt; Outcome changed_</pre>
      </div>
    </div>`;
  }

  if (slug === "character-lab") {
    return `<div class="ld-viz ld-viz--character">
      ${demo}
      <div class="ld-viz__cols">
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">CHARACTER</p>
          <div class="ld-viz__silhouette" aria-hidden="true"></div>
          <p class="ld-viz__caption">${ko ? "Primary silhouette" : "Primary silhouette"}</p>
        </div>
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">EXPRESSION</p>
          <ul class="ld-viz__tags">
            <li>Neutral</li>
            <li>Happy</li>
            <li>Curious</li>
            <li>Focused</li>
          </ul>
          <p class="ld-k ld-k--sm" style="margin-top:1rem">SYSTEM</p>
          <ul class="ld-viz__tags">
            <li>Shape</li>
            <li>Line</li>
            <li>Proportion</li>
            <li>Palette</li>
          </ul>
        </div>
        <div class="ld-viz__col">
          <p class="ld-k ld-k--sm">APPLICATION</p>
          <ul class="ld-viz__tags">
            <li>Digital</li>
            <li>Content</li>
            <li>Product</li>
            <li>Merchandise</li>
          </ul>
        </div>
      </div>
    </div>`;
  }

  return "";
}

function snapshot(content, lang) {
  const u = ui(lang);
  const s = content?.snapshot;
  if (!s) return "";
  return `<section class="ld-snap" data-ld-reveal aria-label="${escapeHtml(u.snapshot)}">
    <p class="ld-k">${escapeHtml(u.snapshot)}</p>
    <dl class="ld-snap__grid">
      <div><dt>QUESTION</dt><dd>${escapeHtml(s.question)}</dd></div>
      <div><dt>METHOD</dt><dd>${escapeHtml(s.method)}</dd></div>
      <div><dt>SIGNAL</dt><dd>${escapeHtml(s.signal)}</dd></div>
      <div><dt>OUTCOME</dt><dd>${escapeHtml(s.outcome)}</dd></div>
    </dl>
  </section>`;
}

function questionSection(content, lang) {
  const u = ui(lang);
  return `<section class="ld-q" id="the-question" data-ld-reveal aria-labelledby="ld-q-title">
    <p class="ld-q__num" aria-hidden="true">01</p>
    <p class="ld-k" id="ld-q-eyebrow">${escapeHtml(u.question)}</p>
    <h2 class="ld-q__title" id="ld-q-title">${br(content?.question)}</h2>
    ${content?.questionContext ? `<p class="ld-q__ctx">${escapeHtml(content.questionContext)}</p>` : ""}
  </section>`;
}

function whySection(content, lang) {
  const u = ui(lang);
  const w = content?.why;
  if (!w) return "";
  return `<section class="ld-why" id="why" data-ld-reveal aria-labelledby="ld-why-title">
    <p class="ld-k">${escapeHtml(u.why)}</p>
    <h2 class="visually-hidden" id="ld-why-title">${escapeHtml(u.why)}</h2>
    <div class="ld-why__grid">
      <article><p class="ld-k ld-k--sm">${escapeHtml(u.problem)}</p><p class="ld-body">${escapeHtml(w.problem)}</p></article>
      <article><p class="ld-k ld-k--sm">${escapeHtml(u.hypothesis)}</p><p class="ld-body">${escapeHtml(w.hypothesis)}</p></article>
      <article><p class="ld-k ld-k--sm">${escapeHtml(u.experimentLabel)}</p><p class="ld-body ld-mono">${escapeHtml(w.experiment)}</p></article>
    </div>
  </section>`;
}

function flowSection(content, lang) {
  const u = ui(lang);
  const steps = content?.flow || [];
  const items = steps
    .map(
      (s, i) =>
        `<li class="ld-flow__step"><span class="ld-flow__n ld-mono">${escapeHtml(s.n)}</span><div class="ld-flow__body"><strong>${escapeHtml(s.label)}</strong><p>${escapeHtml(s.desc)}</p></div>${i < steps.length - 1 ? '<i class="ld-flow__arrow" aria-hidden="true">↓</i>' : ""}</li>`
    )
    .join("");
  return `<section class="ld-flow" id="how-it-works" data-ld-reveal aria-labelledby="ld-flow-title">
    <p class="ld-k">${escapeHtml(u.how)}</p>
    <h2 class="visually-hidden" id="ld-flow-title">${escapeHtml(u.how)}</h2>
    <ol class="ld-flow__list">${items}</ol>
  </section>`;
}

function testingSection(content, lang) {
  const u = ui(lang);
  const tests = content?.testing || [];
  const items = tests
    .map(
      (t) =>
        `<article class="ld-test"><p class="ld-k ld-k--sm">TEST ${escapeHtml(t.n)}</p><h3 class="ld-test__title">${escapeHtml(t.title)}</h3><p class="ld-test__desc">${escapeHtml(t.desc)}</p></article>`
    )
    .join("");
  return `<section class="ld-tests" id="what-we-test" data-ld-reveal aria-labelledby="ld-tests-title">
    <p class="ld-k">${escapeHtml(u.testing)}</p>
    <h2 class="visually-hidden" id="ld-tests-title">${escapeHtml(u.testing)}</h2>
    <div class="ld-tests__grid">${items}</div>
  </section>`;
}

function signalsSection(content, lang) {
  const u = ui(lang);
  const sigs = content?.signals || [];
  const items = sigs
    .map((s) => `<article class="ld-signal"><p class="ld-k ld-k--sm">${escapeHtml(s.type)}</p><p class="ld-body">${escapeHtml(s.desc)}</p></article>`)
    .join("");
  return `<section class="ld-signals" id="signals" data-ld-reveal aria-labelledby="ld-signals-title">
    <p class="ld-k">${escapeHtml(u.signals)}</p>
    <h2 class="visually-hidden" id="ld-signals-title">${escapeHtml(u.signals)}</h2>
    <div class="ld-signals__grid">${items}</div>
  </section>`;
}

function statusSection(exp, lang) {
  const u = ui(lang);
  return `<section class="ld-status" id="current-status" data-ld-reveal aria-labelledby="ld-status-title">
    <p class="ld-k">${escapeHtml(u.currentStatus)}</p>
    <h2 class="visually-hidden" id="ld-status-title">${escapeHtml(u.currentStatus)}</h2>
    <ol class="ld-pipe ld-pipe--status" aria-label="Labs pipeline">${statusPipeline(exp)}</ol>
  </section>`;
}

function nextSection(exp, content, lang) {
  const u = ui(lang);
  const fromExp = t(exp, lang, "nextStepKo", "nextStepEn") || t(exp, lang, "nextKo", "nextEn");
  const steps = (content?.nextSteps || []).filter(Boolean);
  let body = "";
  if (steps.length) {
    body = `<ul class="ld-next__list">${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`;
  } else if (fromExp) {
    body = `<p class="ld-body">${escapeHtml(fromExp)}</p>`;
  } else {
    body = `<p class="ld-body">${escapeHtml(u.nextUndefined)}</p>`;
  }
  return `<section class="ld-next" id="next-step" data-ld-reveal aria-labelledby="ld-next-title">
    <p class="ld-k">${escapeHtml(u.next)}</p>
    <h2 class="visually-hidden" id="ld-next-title">${escapeHtml(u.next)}</h2>
    ${body}
  </section>`;
}

function relatedSection(exp, lang, all) {
  const u = ui(lang);
  const slugs = (LAB_DETAIL_RELATED[exp.slug] || []).slice(0, 2);
  const items = slugs
    .map((slug) => all.find((e) => e.slug === slug))
    .filter(Boolean)
    .map((e) => {
      const c = contentFor(e, lang);
      const title = t(e, lang, "titleKo", "titleEn");
      const desc = c?.description || t(e, lang, "listDescKo", "listDescEn");
      const cat = c?.category || String(e.category || "").toUpperCase();
      return `<a class="ld-related" href="../${escapeHtml(e.slug)}/">
        <span class="ld-related__meta ld-mono">${escapeHtml(e.status)} / ${escapeHtml(cat)}</span>
        <h3 class="ld-related__title">${escapeHtml(title)}</h3>
        <p class="ld-related__desc">${escapeHtml(desc)}</p>
        <span class="ld-related__go">${escapeHtml(u.viewExp)} <i aria-hidden="true">→</i></span>
      </a>`;
    })
    .join("");
  if (!items) return "";
  return `<section class="ld-related-wrap" id="related" data-ld-reveal aria-labelledby="ld-related-title">
    <p class="ld-k">${escapeHtml(u.related)}</p>
    <h2 class="visually-hidden" id="ld-related-title">${escapeHtml(u.related)}</h2>
    <div class="ld-related__grid">${items}</div>
  </section>`;
}

function footNav(exp, lang, all) {
  const u = ui(lang);
  const sorted = all.slice().sort((a, b) => (a.labNumber || 0) - (b.labNumber || 0));
  const idx = sorted.findIndex((e) => e.slug === exp.slug);
  const next = sorted[(idx + 1) % sorted.length];
  const nextTitle = t(next, lang, "titleKo", "titleEn");
  return `<nav class="ld-foot" aria-label="Experiment navigation">
    <a class="ld-foot__back" href="../">${escapeHtml(u.backLabs)}</a>
    <a class="ld-foot__next" href="../${escapeHtml(next.slug)}/">${escapeHtml(u.nextExp)} · ${escapeHtml(nextTitle)} <i aria-hidden="true">→</i></a>
  </nav>`;
}

/* ─── Interactive / live sections (preserve existing functionality) ─── */

function liveReviewAi(exp, lang) {
  const u = ui(lang);
  const ko = lang === "ko";
  return `<section class="ld-live ld-live--wide" id="live-experiment" data-ld-review data-ld-reveal>
    <div class="ld-live__head">
      <p class="ld-k">${escapeHtml(u.liveExperiment)}</p>
      <span class="ld-badge">${escapeHtml(u.prototypeNote)}</span>
    </div>
    <p class="ld-body ld-body--narrow">${ko ? "리뷰를 줄바꿈으로 여러 개 붙여넣고 분석해 보세요. 결과는 클라이언트 휴리스틱이며 실제 AI API가 아닙니다." : "Paste multiple reviews (one per line). Results use a client-side heuristic — not a live AI API."}</p>
    <label class="ld-label" for="ld-review-input">${ko ? "Review text" : "Review text"}</label>
    <textarea id="ld-review-input" class="ld-textarea" rows="8" placeholder="${ko ? "리뷰를 한 줄에 하나씩…" : "One review per line…"}"></textarea>
    <button type="button" class="ld-btn" data-ld-review-run>ANALYZE REVIEWS →</button>
    <div class="ld-review-out" data-ld-review-out hidden>
      <p class="ld-badge">${escapeHtml(u.demo)}</p>
      <div class="ld-stat-row" data-ld-review-stats></div>
      <div class="ld-review-cols" data-ld-review-cols></div>
      <div class="ld-priorities" data-ld-review-prio></div>
    </div>
  </section>`;
}

function liveQr(lang) {
  const u = ui(lang);
  const ko = lang === "ko";
  return `<section class="ld-live ld-live--wide" id="live-qr" data-ld-qr data-ld-reveal>
    <div class="ld-live__head">
      <p class="ld-k">LIVE QR BUILDER</p>
      <span class="ld-badge">${escapeHtml(u.demoProto)} · Client-side QR</span>
    </div>
    <div class="ld-qr-build">
      <div class="ld-qr-form">
        <label class="ld-label" for="ld-qr-url">Destination URL</label>
        <input id="ld-qr-url" class="ld-input" type="url" inputmode="url" placeholder="https://www.newon.app" autocomplete="url" />
        <label class="ld-label" for="ld-qr-name">QR Name</label>
        <input id="ld-qr-name" class="ld-input" type="text" maxlength="80" placeholder="${ko ? "Event poster" : "Event poster"}" />
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
        <div class="ld-qr-frame" data-ld-qr-frame><p class="ld-hint">${ko ? "Enter a URL and generate." : "Enter a URL and generate."}</p></div>
      </div>
    </div>
    <div class="ld-qr-dash" data-ld-qr-dash>
      <p class="ld-k ld-k--sm">SCAN SIGNAL</p>
      <div class="ld-stat-row">
        <div class="ld-stat"><strong class="ld-mono">—</strong><span>SCANS</span></div>
        <div class="ld-stat"><strong class="ld-mono">—</strong><span>VISITS</span></div>
        <div class="ld-stat"><strong class="ld-mono">—</strong><span>CONVERSION</span></div>
      </div>
      <div class="ld-table-wrap">
        <table class="ld-table">
          <thead><tr><th>QR NAME</th><th>DESTINATION</th><th>STATUS</th><th>SCANS</th></tr></thead>
          <tbody data-ld-qr-rows><tr><td colspan="4" class="ld-hint">${ko ? "Generate a QR to populate this preview." : "Generate a QR to populate this preview."}</td></tr></tbody>
        </table>
      </div>
    </div>
  </section>`;
}

function liveForm(lang) {
  const u = ui(lang);
  const ko = lang === "ko";
  return `<section class="ld-live ld-live--wide" id="form-builder" data-ld-form data-lang="${escapeHtml(lang)}" data-ld-reveal>
    <div class="ld-live__head">
      <p class="ld-k">FORM BUILDER PROTOTYPE</p>
      <span class="ld-badge">${escapeHtml(u.demoProto)}</span>
    </div>
    <div class="ld-form-split">
      <div class="ld-form-build">
        <p class="ld-k ld-k--sm">FORM BUILDER</p>
        <label class="ld-label" for="ld-form-title">Form title</label>
        <input id="ld-form-title" class="ld-input" type="text" value="${ko ? "Product feedback" : "Product feedback"}" maxlength="120" />
        <label class="ld-label" for="ld-form-desc">Description</label>
        <textarea id="ld-form-desc" class="ld-textarea ld-textarea--sm" rows="2">${ko ? "Tell us one thing." : "Tell us one thing."}</textarea>
        <p class="ld-k ld-k--sm" style="margin-top:1.25rem">${ko ? "Add question" : "Add question"}</p>
        <div class="ld-form-types" role="group">
          <button type="button" class="ld-chip" data-ld-form-add="short">Short Text</button>
          <button type="button" class="ld-chip" data-ld-form-add="long">Long Text</button>
          <button type="button" class="ld-chip" data-ld-form-add="email">Email</button>
          <button type="button" class="ld-chip" data-ld-form-add="rating">Rating</button>
        </div>
        <ul class="ld-form-qlist" data-ld-form-qlist></ul>
      </div>
      <div class="ld-form-preview">
        <p class="ld-k ld-k--sm">LIVE PREVIEW</p>
        <div class="ld-form-card" data-ld-form-preview aria-live="polite"></div>
        <button type="button" class="ld-btn" data-ld-form-open style="margin-top:1rem">PREVIEW FORM</button>
      </div>
    </div>
  </section>
  <dialog class="ld-dialog" data-ld-form-dialog aria-labelledby="ld-form-dialog-title">
    <form method="dialog" class="ld-dialog__inner" data-ld-form-respond>
      <p class="ld-k" id="ld-form-dialog-title">RESPONSE EXPERIENCE</p>
      <div data-ld-form-respond-body></div>
      <div class="ld-dialog__actions">
        <button type="submit" class="ld-btn" value="submit">SUBMIT RESPONSE →</button>
        <button type="submit" class="ld-link" value="cancel">Close</button>
      </div>
    </form>
    <div class="ld-dialog__done" data-ld-form-done hidden>
      <p class="ld-display ld-display--sm">RESPONSE RECEIVED</p>
      <button type="button" class="ld-btn" data-ld-form-done-close>Close</button>
    </div>
  </dialog>`;
}

function liveAiDiscovery(lang) {
  const u = ui(lang);
  const ko = lang === "ko";
  return `<section class="ld-live ld-live--wide" id="idea-test" data-ld-idea data-ld-reveal>
    <div class="ld-live__head">
      <p class="ld-k">IDEA TEST</p>
      <span class="ld-badge">${escapeHtml(u.prototypeNote)}</span>
    </div>
    <label class="ld-label" for="ld-idea-input">${ko ? "Describe a recurring problem." : "Describe a recurring problem."}</label>
    <textarea id="ld-idea-input" class="ld-textarea" rows="4" maxlength="600"></textarea>
    <button type="button" class="ld-btn" data-ld-idea-run>TEST THE IDEA →</button>
    <div class="ld-idea-out" data-ld-idea-out hidden></div>
  </section>`;
}

function liveGame(exp, lang) {
  const u = ui(lang);
  const ko = lang === "ko";
  const rel = exp.relatedProduct;
  const relBlock = rel
    ? `<div class="ld-game-link">
        <p class="ld-hint">${escapeHtml(t(rel, lang, "noteKo", "noteEn"))}</p>
        <a class="ld-btn" href="${escapeHtml(ko ? rel.hrefKo : rel.hrefEn)}">${escapeHtml(u.playExperiment)} ↗</a>
      </div>`
    : "";
  return `<section class="ld-live ld-live--wide ld-live--cinema" id="the-experiment" data-ld-game data-ld-reveal>
    <div class="ld-live__head">
      <p class="ld-k">${escapeHtml(u.liveExperiment)}</p>
      <span class="ld-badge">${escapeHtml(u.demoProto)}</span>
    </div>
    <div class="ld-game" aria-live="polite">
      <p class="ld-game__prompt" data-ld-game-prompt></p>
      <p class="ld-game__q" data-ld-game-q>WHAT DO YOU DO?</p>
      <div class="ld-game__choices" data-ld-game-choices></div>
      <div class="ld-game__result" data-ld-game-result hidden>
        <p class="ld-mono">CHOICE RECORDED</p>
        <p class="ld-game__remember">SYSTEM WILL REMEMBER THIS.</p>
        <button type="button" class="ld-btn" data-ld-game-next hidden>CONTINUE →</button>
        <button type="button" class="ld-link" data-ld-game-reset hidden>REPLAY</button>
      </div>
    </div>
    ${relBlock}
  </section>`;
}

function liveCharacter(lang) {
  const ko = lang === "ko";
  return `<section class="ld-live ld-live--wide" id="prototype" data-ld-reveal>
    <div class="ld-live__head">
      <p class="ld-k">SYSTEM BOARD</p>
      <span class="ld-badge">${escapeHtml(ui(lang).demoProto)}</span>
    </div>
    <p class="ld-body ld-body--narrow">${ko ? "공개 가능한 캐릭터 에셋은 아직 없습니다. 실루엣과 시스템 그리드로 규칙만 탐색합니다." : "No public character assets yet. Exploring rules via silhouette and system grid only."}</p>
    ${heroVisual("character-lab", lang)}
  </section>`;
}

function liveSection(exp, lang) {
  switch (exp.slug) {
    case "review-ai":
      return liveReviewAi(exp, lang);
    case "newon-qr":
      return liveQr(lang);
    case "newon-form":
      return liveForm(lang);
    case "ai-experiment":
      return liveAiDiscovery(lang);
    case "game-experiment":
      return liveGame(exp, lang);
    case "character-lab":
      return liveCharacter(lang);
    default:
      return "";
  }
}

function aiBoard(exp, lang) {
  const ko = lang === "ko";
  const u = ui(lang);
  const rows = (exp.board || [])
    .map(
      (row) => `<article class="ld-board__row">
        <p class="ld-badge">${escapeHtml(u.demo)}</p>
        <dl class="ld-board__dl">
          <div><dt>PROBLEM</dt><dd>${escapeHtml(ko ? row.problemKo : row.problemEn)}</dd></div>
          <div><dt>TARGET USER</dt><dd>${escapeHtml(ko ? row.userKo : row.userEn)}</dd></div>
          <div><dt>FREQUENCY</dt><dd class="ld-mono">${escapeHtml(row.frequency)}</dd></div>
          <div><dt>AI FIT</dt><dd class="ld-mono">${escapeHtml(row.aiFit)}</dd></div>
          <div><dt>POTENTIAL</dt><dd class="ld-mono">${escapeHtml(row.potential)}</dd></div>
          <div><dt>STATUS</dt><dd class="ld-mono">${escapeHtml(row.status)}</dd></div>
        </dl>
      </article>`
    )
    .join("");
  if (!rows) return "";
  return `<section class="ld-board-wrap" data-ld-reveal aria-label="Experiment board">
    <p class="ld-k">EXPERIMENT BOARD</p>
    <div class="ld-board">${rows}</div>
  </section>`;
}

function buildCaseStudy(exp, lang, all) {
  const content = contentFor(exp, lang);
  const extraBoard = exp.slug === "ai-experiment" ? aiBoard(exp, lang) : "";

  return `${hero(exp, content, lang)}
${snapshot(content, lang)}
${questionSection(content, lang)}
${whySection(content, lang)}
${flowSection(content, lang)}
${liveSection(exp, lang)}
${extraBoard}
${testingSection(content, lang)}
${signalsSection(content, lang)}
${statusSection(exp, lang)}
${nextSection(exp, content, lang)}
${relatedSection(exp, lang, all)}
${footNav(exp, lang, all)}`;
}

/**
 * @param {object} exp
 * @param {object} copies
 * @param {string} lang
 * @param {{ breadcrumb: Function, resourceSwitcher: Function }} helpers
 */
export function labDetailBody(exp, copies, lang, helpers) {
  const copy = copies.labs;
  const title = t(exp, lang, "titleKo", "titleEn");
  const all = getLabsExperiments();
  const { breadcrumb, resourceSwitcher } = helpers;

  return `${breadcrumb(copy, title, { resourcesHref: "../../", mid: copy.navLabel || "LABS", midHref: "../" })}
<article class="ld-page ld-case" data-ld-slug="${escapeHtml(exp.slug)}" data-ld-lang="${escapeHtml(lang)}" data-lab-number="${escapeHtml(String(exp.labNumber))}">
  <div class="rs-inner ld-inner">
    ${buildCaseStudy(exp, lang, all)}
  </div>
</article>
${labsBackNav({ ...copies, index: copies.index }, lang, "../../")}
${resourceSwitcher("labs", copies, "../")}`;
}

/** Interactive live prototype sections (used by bs-* detail layout). */
export { liveSection, aiBoard };

/** SEO description helper */
export function labDetailSeoDescription(exp, lang) {
  const c = contentFor(exp, lang);
  return c?.seoDescription || t(exp, lang, "descKo", "descEn");
}
