/**
 * Store product detail hero visuals — unique Studio-quality panel per product.
 * Large mid-page previews stay below (storeLargePreview).
 */
import { escapeHtml } from "./hub-utils.mjs";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function panelShell({ mod, live, meta, body, lang = "ko" }) {
  const badge = `<span class="bs-store-preview__badge">${lang === "ko" ? "SAMPLE DATA" : "DEMO PREVIEW"}</span>`;
  return `<div class="bs-visual bs-visual--studio bs-visual--store bs-visual--${mod}" aria-hidden="true">
  <div class="bs-sv">
    <div class="bs-sv__head">
      <span class="bs-sv__live"><i></i> ${live}</span>
      <span class="bs-sv__meta">${meta}</span>
    </div>
    <div class="bs-sv__body">${badge}${body}</div>
  </div>
</div>`;
}

/** App Launch Kit — launch command center */
function visualLaunch(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "launch",
    live: "LAUNCH COMMAND",
    meta: "LAUNCH",
    lang,
    body: `
      <div class="bs-sv-sx-launch">
        <div class="bs-sv-sx-launch__rail">
          <span class="is-on">PRE</span><i></i><span>STORE</span><i></i><span>QA</span><i></i><span>SHIP</span>
        </div>
        <div class="bs-sv-sx-launch__list">
          <article class="is-on"><span>01</span><strong>Product Definition</strong><em>${ko ? "문제 · 사용자 · 가치" : "Problem · User · Value"}</em></article>
          <article class="is-on"><span>02</span><strong>MVP Scope</strong><em>Must / Later</em></article>
          <article><span>03</span><strong>Store Metadata</strong><em>${ko ? "이름 · 키워드" : "Name · Keywords"}</em></article>
          <article><span>04</span><strong>QA Pass</strong><em>${ko ? "기능 · UI · 예외" : "Function · UI · Edge"}</em></article>
        </div>
        <div class="bs-sv-sx-launch__day">
          <span>TIMELINE</span>
          <strong>D-7 → D-Day → D+7</strong>
        </div>
      </div>`,
  });
}

/** MVP Planning Kit — planning canvas */
function visualMvp(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "mvp",
    live: "MVP CANVAS",
    meta: "MVP",
    lang,
    body: `
      <div class="bs-sv-sx-mvp">
        <div class="bs-sv-sx-mvp__cols">
          <div class="is-on"><p class="bs-sv__k">PROBLEM</p><strong>${ko ? "해결할 문제" : "Problem to solve"}</strong></div>
          <div><p class="bs-sv__k">USER</p><strong>${ko ? "누구를 위해" : "Who it's for"}</strong></div>
          <div><p class="bs-sv__k">VALUE</p><strong>${ko ? "핵심 가치" : "Core value"}</strong></div>
          <div class="is-wide"><p class="bs-sv__k">MVP SCOPE</p>
            <div class="bs-sv-sx-mvp__tags"><span class="is-on">Must</span><span>Later</span><span>Cut</span></div>
          </div>
        </div>
        <ol class="bs-sv-sx-mvp__flow">
          <li class="is-done"><span>01</span>Problem</li>
          <li class="is-on"><span>02</span>Scope</li>
          <li><span>03</span>Validate</li>
        </ol>
      </div>`,
  });
}

/** Product Builder Prompt Pack — prompt workspace */
function visualPromptPack(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "prompt",
    live: "PROMPT WORKSPACE",
    meta: "PROMPTS",
    lang,
    body: `
      <div class="bs-sv-sx-prompt">
        <aside class="bs-sv-sx-prompt__phases">
          <p class="bs-sv__k">PHASES</p>
          <ol>
            <li class="is-on"><span>01</span>DEFINE</li>
            <li><span>02</span>PLAN</li>
            <li><span>03</span>BUILD</li>
            <li><span>04</span>SHIP</li>
          </ol>
        </aside>
        <div class="bs-sv-sx-prompt__prompt">
          <p class="bs-sv__k">PRODUCT BUILD PROMPT</p>
          <div class="bs-sv-sx-prompt__fields">
            <div class="is-on"><span>CONTEXT</span><strong>${ko ? "프로젝트 맥락" : "Project context"}</strong></div>
            <div><span>GOAL</span><strong>${ko ? "무엇을 만들지" : "What to build"}</strong></div>
            <div><span>CONSTRAINTS</span><strong>${ko ? "바꾸면 안 되는 것" : "Must not change"}</strong></div>
            <div><span>ACCEPTANCE</span><strong>${ko ? "완료 기준" : "Done when"}</strong></div>
          </div>
        </div>
      </div>`,
  });
}

/** AI Product Builder Pack — agent console */
function visualAiBuild(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "aibuild",
    live: "AGENT CONSOLE",
    meta: "AI BUILD",
    lang,
    body: `
      <div class="bs-sv-sx-aibuild">
        <div class="bs-sv-sx-aibuild__bar"><i></i><i></i><i></i><em>agent · run</em></div>
        <div class="bs-sv-sx-aibuild__grid">
          <article><p class="bs-sv__k">REPO</p><strong>${ko ? "구조 스캔" : "Scan structure"}</strong></article>
          <article class="is-on"><p class="bs-sv__k">TASK</p><strong>${ko ? "작업 단위" : "Work unit"}</strong></article>
          <article><p class="bs-sv__k">EXECUTE</p><strong>${ko ? "멀티파일" : "Multi-file"}</strong></article>
          <article><p class="bs-sv__k">REVIEW</p><strong>${ko ? "품질 점검" : "QA check"}</strong></article>
        </div>
        <div class="bs-sv-sx-aibuild__log">
          <p>$ agent run --task "implement-auth"</p>
          <p>→ analyzing repository…</p>
          <p class="is-on">→ applying patch (4 files)</p>
        </div>
      </div>`,
  });
}

/** Website Launch Checklist — browser + QA */
function visualWeb(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "web",
    live: "SITE QA BOARD",
    meta: "WEB",
    lang,
    body: `
      <div class="bs-sv-sx-web">
        <div class="bs-sv-sx-web__browser">
          <div class="bs-sv-sx-web__chrome"><i></i><i></i><i></i><span>yoursite.com</span></div>
          <div class="bs-sv-sx-web__page">
            <strong>YOUR SITE</strong>
            <em>${ko ? "출시 전 최종 점검" : "Final launch check"}</em>
            <div class="bs-sv-sx-web__wire"><i></i><i></i><i></i></div>
          </div>
        </div>
        <aside class="bs-sv-sx-web__qa">
          <p class="bs-sv__k">CHECKLIST</p>
          <ul>
            <li class="is-on"><span>✓</span>Content</li>
            <li class="is-on"><span>✓</span>SEO</li>
            <li><span>○</span>Performance</li>
            <li><span>○</span>Final QA</li>
          </ul>
        </aside>
      </div>`,
  });
}

/** Business Planning Workbook — model canvas */
function visualBiz(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "biz",
    live: "BUSINESS CANVAS",
    meta: "BIZ PLAN",
    lang,
    body: `
      <div class="bs-sv-sx-biz">
        <div class="bs-sv-sx-biz__grid">
          <div class="is-on"><p class="bs-sv__k">IDEA</p><strong>${ko ? "아이디어" : "Idea"}</strong></div>
          <div><p class="bs-sv__k">CUSTOMER</p><strong>${ko ? "고객" : "Customer"}</strong></div>
          <div><p class="bs-sv__k">MODEL</p><strong>${ko ? "수익 모델" : "Revenue"}</strong></div>
          <div><p class="bs-sv__k">CHANNEL</p><strong>${ko ? "채널" : "Channel"}</strong></div>
          <div class="is-wide"><p class="bs-sv__k">LAUNCH</p>
            <div class="bs-sv-sx-biz__row"><span class="is-on">Plan</span><span>Cost</span><span>Timeline</span></div>
          </div>
        </div>
      </div>`,
  });
}

/** Product Research Template — evidence board */
function visualResearch(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "research",
    live: "EVIDENCE BOARD",
    meta: "RESEARCH",
    lang,
    body: `
      <div class="bs-sv-sx-research">
        <div class="bs-sv-sx-research__cards">
          <article><p class="bs-sv__k">OBSERVE</p><strong>${ko ? "설정 단계 이탈" : "Setup drop-off"}</strong></article>
          <article><p class="bs-sv__k">EVIDENCE</p><strong>${ko ? "인터뷰 패턴" : "Interview pattern"}</strong></article>
          <article class="is-on"><p class="bs-sv__k">INSIGHT</p><strong>${ko ? "초기 설정 축소" : "Reduce setup"}</strong></article>
          <article><p class="bs-sv__k">DECIDE</p><strong>${ko ? "온보딩 재설계" : "Redesign onboard"}</strong></article>
        </div>
        <div class="bs-sv-sx-research__flow">
          <span>Observe</span><i></i><span class="is-on">Insight</span><i></i><span>Decide</span>
        </div>
      </div>`,
  });
}

/** Founder Dashboard — operating view */
function visualDash(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "dash",
    live: "FOUNDER VIEW",
    meta: "DASHBOARD",
    lang,
    body: `
      <div class="bs-sv-sx-dash">
        <div class="bs-sv-sx-dash__metrics">
          <div class="is-on"><span>MRR</span><strong>—</strong></div>
          <div><span>USERS</span><strong>—</strong></div>
          <div><span>RUNWAY</span><strong>—</strong></div>
        </div>
        <div class="bs-sv-sx-dash__week">
          <p class="bs-sv__k">${ko ? "이번 주" : "THIS WEEK"}</p>
          <ol>
            <li class="is-on"><span>01</span>${ko ? "온보딩 V2" : "Onboarding V2"}</li>
            <li><span>02</span>${ko ? "가격 검토" : "Pricing review"}</li>
            <li><span>03</span>${ko ? "릴리즈 노트" : "Release notes"}</li>
          </ol>
        </div>
      </div>`,
  });
}

/** Product Roadmap — now / next / later */
function visualRoadmap(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "roadmap",
    live: "ROADMAP BOARD",
    meta: "ROADMAP",
    lang,
    body: `
      <div class="bs-sv-sx-road">
        <div class="bs-sv-sx-road__col is-on">
          <p>NOW</p>
          <ul><li>${ko ? "핵심 기능" : "Core feature"}</li><li>${ko ? "출시 준비" : "Launch prep"}</li></ul>
        </div>
        <div class="bs-sv-sx-road__col">
          <p>NEXT</p>
          <ul><li>${ko ? "개선" : "Improve"}</li><li>${ko ? "실험" : "Experiment"}</li></ul>
        </div>
        <div class="bs-sv-sx-road__col">
          <p>LATER</p>
          <ul><li>${ko ? "확장" : "Expand"}</li><li>${ko ? "자동화" : "Automate"}</li></ul>
        </div>
      </div>`,
  });
}

/** NEWON Project Starter Kit — document kit panel */
function visualProjectStarter(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "starter",
    live: "DOC KIT",
    meta: "STARTER",
    lang,
    body: `
      <div class="bs-sv-sx-launch">
        <div class="bs-sv-sx-launch__rail">
          <span class="is-on">REQ</span><i></i><span>QUOTE</span><i></i><span>SCOPE</span><i></i><span>CONTRACT</span><i></i><span>DELIVER</span>
        </div>
        <div class="bs-sv-sx-launch__list">
          <article class="is-on"><span>01</span><strong>Requirements</strong><em>${ko ? "요구사항 질문지" : "Questionnaire"}</em></article>
          <article class="is-on"><span>02</span><strong>Quotation</strong><em>${ko ? "견적서" : "Quote sheet"}</em></article>
          <article><span>03</span><strong>Scope of Work</strong><em>${ko ? "범위서" : "In / out"}</em></article>
          <article><span>04</span><strong>Contract Draft</strong><em>${ko ? "계약 초안" : "Reference draft"}</em></article>
          <article><span>05</span><strong>Delivery Checklist</strong><em>${ko ? "납품 체크" : "Handoff list"}</em></article>
        </div>
        <div class="bs-sv-sx-launch__day">
          <span>FORMAT</span>
          <strong>DOCX · PDF</strong>
        </div>
      </div>`,
  });
}

const SLUG_VISUAL = {
  "newon-project-starter-kit": visualProjectStarter,
  "app-launch-kit": visualLaunch,
  "mvp-planning-kit": visualMvp,
  "cursor-prompt-pack": visualPromptPack,
  "codex-builder-pack": visualAiBuild,
  "website-launch-checklist": visualWeb,
  "business-planning-workbook": visualBiz,
  "product-research-template": visualResearch,
  "founder-dashboard": visualDash,
  "product-roadmap": visualRoadmap,
};

const SLUG_PREVIEW = {
  "newon-project-starter-kit": "project-starter",
  "app-launch-kit": "launch-checklist",
  "mvp-planning-kit": "mvp-flow",
  "cursor-prompt-pack": "prompt-workflow",
  "codex-builder-pack": "agent-workflow",
  "website-launch-checklist": "web-checklist",
  "business-planning-workbook": "biz-flow",
  "product-research-template": "research-board",
  "founder-dashboard": "founder-dash",
  "product-roadmap": "roadmap-cols",
};

export function storeHeroVisual(slug, _previewKind, lang = "ko") {
  const fn = SLUG_VISUAL[slug] || visualLaunch;
  return fn(lang);
}

/* ——— Large mid-page previews (editorial 2-col boards) ——— */

function checklistGrid(items) {
  return `<ul class="bs-sv-store-check bs-sv-store-check--grid">${items
    .map(
      ([t, d], i) =>
        `<li class="bs-sv-store-check__item${i < 2 ? " is-on" : ""}"><span class="bs-sv-store-check__n" aria-hidden="true">${pad2(
          i + 1
        )}</span><span class="bs-sv-store-check__copy"><strong>${escapeHtml(t)}</strong><em>${escapeHtml(
          d
        )}</em></span></li>`
    )
    .join("")}</ul>`;
}

function stepGrid(steps) {
  return `<div class="bs-sv-store-steps">${steps
    .map(
      (s, i) =>
        `<div class="bs-sv-store-steps__cell${i === 0 ? " is-on" : ""}"><span>${pad2(i + 1)}</span><strong>${escapeHtml(
          s
        )}</strong></div>`
    )
    .join("")}</div>`;
}

function largeShell({ mod, body, foot = "", lang = "ko" }) {
  const badge = `<span class="bs-store-preview__badge">${lang === "ko" ? "SAMPLE DATA" : "DEMO PREVIEW"}</span>`;
  return `<div class="bs-store-preview bs-store-preview--board bs-store-preview--${mod}">
    <div class="bs-store-preview__frame">${badge}${body}</div>
    ${foot ? `<p class="bs-store-preview__foot">${foot}</p>` : ""}
  </div>`;
}

function promptWorkspaceLarge(lang) {
  const phases = ["DEFINE", "PLAN", "BUILD", "SHIP"];
  const nav = phases
    .map(
      (p, i) =>
        `<li class="bs-sv-store-ws__phase${i === 0 ? " is-on" : ""}"><span>${pad2(i + 1)}</span> ${escapeHtml(p)}</li>`
    )
    .join("");
  const fields =
    lang === "ko"
      ? [
          ["CONTEXT", "프로젝트 맥락과 제약"],
          ["GOAL", "무엇을 만들지"],
          ["CONSTRAINTS", "변경하면 안 되는 것"],
          ["ACCEPTANCE", "완료 기준"],
        ]
      : [
          ["CONTEXT", "Project context"],
          ["GOAL", "What should be built"],
          ["CONSTRAINTS", "What must not change"],
          ["ACCEPTANCE", "Expected result"],
        ];
  const prompt = fields
    .map(
      ([k, v], i) =>
        `<div class="bs-sv-store-ws__field${i === 0 ? " is-on" : ""}"><p>${escapeHtml(k)}</p><strong>${escapeHtml(
          v
        )}</strong></div>`
    )
    .join("");
  return largeShell({
    mod: "prompt-ws",
    foot: "Independent resource by Newon. Independent Newon resource.",
    lang,
    body: `<div class="bs-sv-store-ws">
      <div class="bs-sv-store-ws__rail" aria-hidden="true"><p class="bs-sv-store-ws__label">PHASES</p><ol>${nav}</ol></div>
      <div class="bs-sv-store-ws__main" aria-hidden="true">
        <p class="bs-sv-store-ws__label">PRODUCT BUILD PROMPT</p>
        <div class="bs-sv-store-ws__prompt">${prompt}</div>
      </div>
    </div>`,
  });
}

function aiBuildConsoleLarge(lang) {
  const tasks =
    lang === "ko"
      ? [
          ["REPO SCAN", "구조 · 의존성 분석"],
          ["TASK SPEC", "에이전트 작업 단위"],
          ["EXECUTE", "멀티파일 변경"],
          ["REVIEW", "회귀 · 품질 점검"],
        ]
      : [
          ["REPO SCAN", "Structure · dependencies"],
          ["TASK SPEC", "Agent-sized work unit"],
          ["EXECUTE", "Multi-file change"],
          ["REVIEW", "Regression · quality"],
        ];
  return largeShell({
    mod: "aibuild",
    lang,
    body: `<div class="bs-sv-store-console">
    <div class="bs-sv-store-console__bar"><em>AGENT EXECUTION CONSOLE</em></div>
    <div class="bs-sv-store-console__grid">${tasks
      .map(
        ([k, v], i) =>
          `<article class="bs-sv-store-console__cell${i === 1 ? " is-on" : ""}"><p>${escapeHtml(k)}</p><strong>${escapeHtml(
            v
          )}</strong></article>`
      )
      .join("")}</div>
    <div class="bs-sv-store-console__log"><p>$ agent run --task "implement-auth"</p><p>→ analyzing repository...</p><p class="is-on">→ applying patch (4 files)</p></div>
  </div>`,
  });
}

function launchCommandLarge(lang) {
  return largeShell({
    mod: "launch-cmd",
    lang,
    body: `<div class="bs-sv-store-cmd">
      <div class="bs-sv-store-cmd__rail"><span class="is-on">PRE-LAUNCH</span><span>STORE</span><span>QA</span><span>SHIP</span></div>
      ${checklistGrid(
        lang === "ko"
          ? [
              ["Product Definition", "문제 · 사용자 · 가치"],
              ["MVP Scope", "Must / Later 분리"],
              ["Store Metadata", "이름 · 키워드 · 설명"],
              ["Launch Timeline", "D-7 → D-Day"],
            ]
          : [
              ["Product Definition", "Problem · user · value"],
              ["MVP Scope", "Must / Later split"],
              ["Store Metadata", "Name · keywords · copy"],
              ["Launch Timeline", "D-7 → D-Day"],
            ]
      )}
      <div class="bs-sv-store-cmd__foot"><span>POST-SHIP</span><strong>${
        lang === "ko" ? "리뷰 · 버그 · 업데이트" : "Reviews · bugs · updates"
      }</strong></div>
    </div>`,
  });
}

function mvpCanvasLarge(lang) {
  return largeShell({
    mod: "mvp-canvas",
    lang,
    body: `<div class="bs-sv-store-canvas">
      ${stepGrid(["PROBLEM", "USER", "VALUE", "CORE", "MVP", "VALIDATE"])}
      <div class="bs-sv-store-canvas__notes"><span class="is-on">Must ship</span><span>Later</span><span>Validate</span></div>
    </div>`,
  });
}

const LARGE_VISUALS = {
  "project-starter": (lang) =>
    largeShell({
      mod: "starter-kit",
      lang,
      body: checklistGrid([
        ["Requirements", lang === "ko" ? "요구사항 질문지" : "Questionnaire"],
        ["Quotation", lang === "ko" ? "견적서" : "Quote sheet"],
        ["Scope of Work", lang === "ko" ? "범위서" : "Scope sheet"],
        ["Contract Draft", lang === "ko" ? "계약 초안" : "Reference draft"],
        ["Delivery Checklist", lang === "ko" ? "납품 체크" : "Handoff list"],
        ["Formats", "DOCX · PDF"],
      ]),
    }),
  "launch-checklist": (lang) => launchCommandLarge(lang),
  "mvp-flow": (lang) => mvpCanvasLarge(lang),
  "prompt-workflow": (lang) => promptWorkspaceLarge(lang),
  "agent-workflow": (lang) => aiBuildConsoleLarge(lang),
  "web-checklist": (lang) =>
    largeShell({
      mod: "web-qa",
      lang,
      body: `<div class="bs-sv-store-matrix bs-sv-store-matrix--lg">${[
        "CONTENT",
        "SEO",
        "PERFORMANCE",
        "ACCESSIBILITY",
        "ANALYTICS",
        "FINAL QA",
      ]
        .map(
          (t, i) =>
            `<div class="bs-sv-store-matrix__cell${i < 2 ? " is-on" : ""}"><span>${escapeHtml(t)}</span><strong>${pad2(
              i + 1
            )}</strong></div>`
        )
        .join("")}</div>`,
    }),
  "biz-flow": (lang) =>
    largeShell({
      mod: "biz-wb",
      lang,
      body: `<div class="bs-sv-store-wb">
        ${stepGrid(["IDEA", "CUSTOMER", "MODEL", "CHANNEL", "LAUNCH", "REVIEW"])}
        <div class="bs-sv-store-wb__sheet"><span class="is-on">Revenue</span><span>Cost</span><span>Timeline</span></div>
      </div>`,
    }),
  "research-board": (lang) =>
    largeShell({
      mod: "research-lg",
      lang,
      body: `<div class="bs-sv-store-board bs-sv-store-board--lg">${(lang === "ko"
        ? [
            ["OBSERVATION", "설정 단계 이탈"],
            ["EVIDENCE", "7 / 10 인터뷰"],
            ["INSIGHT", "초기 설정 축소"],
            ["DECISION", "온보딩 재설계"],
          ]
        : [
            ["OBSERVATION", "Setup drop-off"],
            ["EVIDENCE", "7 / 10 interviews"],
            ["INSIGHT", "Reduce setup"],
            ["DECISION", "Redesign onboarding"],
          ]
      )
        .map(
          ([k, v], i) =>
            `<article class="bs-sv-store-board__card${i === 2 ? " is-on" : ""}"><p>${escapeHtml(k)}</p><strong>${escapeHtml(
              v
            )}</strong></article>`
        )
        .join("")}</div>`,
    }),
  "founder-dash": (lang) =>
    largeShell({
      mod: "dash-lg",
      lang,
      body: `<div class="bs-sv-store-dash bs-sv-store-dash--lg">
        <div class="bs-sv-store-dash__metrics">
          ${(lang === "ko"
            ? [
                ["MRR", "₩—"],
                ["USERS", "—"],
                ["RUNWAY", "—"],
                ["FOCUS", "Launch"],
              ]
            : [
                ["MRR", "—"],
                ["USERS", "—"],
                ["RUNWAY", "—"],
                ["FOCUS", "Launch"],
              ]
          )
            .map(
              ([k, v], i) =>
                `<div${i === 0 ? ' class="is-on"' : ""}><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`
            )
            .join("")}
        </div>
        <div class="bs-sv-store-dash__ops">
          <p class="bs-sv__k">${lang === "ko" ? "이번 주" : "THIS WEEK"}</p>
          <ol class="bs-sv-store-dash__week">
            <li class="is-on"><span>01</span>${lang === "ko" ? "온보딩 V2" : "Onboarding V2"}</li>
            <li><span>02</span>${lang === "ko" ? "가격 검토" : "Pricing review"}</li>
            <li><span>03</span>${lang === "ko" ? "릴리즈 노트" : "Release notes"}</li>
            <li><span>04</span>${lang === "ko" ? "지표 리뷰" : "Metrics review"}</li>
          </ol>
        </div>
      </div>`,
    }),
  "roadmap-cols": (lang) =>
    largeShell({
      mod: "roadmap-lg",
      lang,
      body: `<div class="bs-sv-store-road bs-sv-store-road--lg">${[
        ["NOW", lang === "ko" ? ["핵심 기능", "출시 준비"] : ["Core feature", "Launch prep"]],
        ["NEXT", lang === "ko" ? ["개선", "실험"] : ["Improve", "Experiment"]],
        ["LATER", lang === "ko" ? ["확장", "자동화"] : ["Expand", "Automate"]],
      ]
        .map(
          ([col, items], i) =>
            `<div class="bs-sv-store-road__col${i === 0 ? " is-on" : ""}"><p>${col}</p><ul>${items
              .map((it) => `<li>${escapeHtml(it)}</li>`)
              .join("")}</ul></div>`
        )
        .join("")}</div>`,
    }),
};

export function storeLargePreview(slug, previewKind, lang, _title) {
  const kind = previewKind || SLUG_PREVIEW[slug] || "launch-checklist";
  const fn = LARGE_VISUALS[kind] || LARGE_VISUALS["launch-checklist"];
  return fn(lang);
}
