/**
 * Store product detail hero visuals — bs-visual shell (Studio service pattern).
 */
import { escapeHtml } from "./hub-utils.mjs";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function panelShell({ mod, live, meta, body }) {
  return `<div class="bs-visual bs-visual--store bs-visual--${mod}" aria-hidden="true">
  <div class="bs-sv">
    <div class="bs-sv__head">
      <span class="bs-sv__live"><i></i> ${live}</span>
      <span class="bs-sv__meta">${meta}</span>
    </div>
    <div class="bs-sv__body">${body}</div>
  </div>
</div>`;
}

function flowSteps(steps, vertical = false) {
  const cls = vertical ? "bs-sv-store-flow bs-sv-store-flow--v" : "bs-sv-store-flow";
  const items = steps
    .map(
      (s, i) =>
        `<span class="bs-sv-store-flow__step${i === 0 ? " is-on" : ""}">${escapeHtml(s)}</span>${
          i < steps.length - 1 ? `<span class="bs-sv-store-flow__arrow" aria-hidden="true">${vertical ? "↓" : "→"}</span>` : ""
        }`
    )
    .join("");
  return `<div class="${cls}">${items}</div>`;
}

function checklist(items) {
  return `<ul class="bs-sv-store-check">${items
    .map(
      ([t, d], i) =>
        `<li class="bs-sv-store-check__item${i < 2 ? " is-on" : ""}"><span class="bs-sv-store-check__box" aria-hidden="true"></span><span><strong>${escapeHtml(
          t
        )}</strong><em>${escapeHtml(d)}</em></span></li>`
    )
    .join("")}</ul>`;
}

const VISUALS = {
  "launch-checklist": (lang) =>
    panelShell({
      mod: "launch",
      live: "LAUNCH CHECKLIST",
      meta: "TEMPLATES",
      body: checklist(
        lang === "ko"
          ? [
              ["Product Definition", "문제 · 사용자 · 가치"],
              ["MVP Scope", "Must / Later"],
              ["Store Metadata", "Name · Keywords"],
              ["QA Pass", "기능 · UI · 예외"],
            ]
          : [
              ["Product Definition", "Problem · User · Value"],
              ["MVP Scope", "Must / Later"],
              ["Store Metadata", "Name · Keywords"],
              ["QA Pass", "Function · UI · Edge cases"],
            ]
      ),
    }),
  "mvp-flow": () =>
    panelShell({
      mod: "mvp",
      live: "MVP FLOW",
      meta: "TEMPLATES",
      body: flowSteps(["PROBLEM", "USER", "SOLUTION", "CORE", "MVP", "VALIDATE"], true),
    }),
  "cursor-workflow": () =>
    panelShell({
      mod: "cursor",
      live: "BUILD WORKFLOW",
      meta: "AI / CODE",
      body: flowSteps(["DEFINE", "PLAN", "BUILD", "TEST", "REFINE", "SHIP"]),
    }),
  "codex-workflow": () =>
    panelShell({
      mod: "codex",
      live: "AGENT WORKFLOW",
      meta: "AI / CODE",
      body: flowSteps(["REPO", "TASK", "EXECUTE", "TEST", "REVIEW", "RELEASE"]),
    }),
  "web-checklist": (lang) =>
    panelShell({
      mod: "web",
      live: "WEB CHECKLIST",
      meta: "TEMPLATES",
      body: `<div class="bs-sv-store-matrix">${(lang === "ko"
        ? ["CONTENT", "SEO", "PERFORMANCE", "FINAL QA"]
        : ["CONTENT", "SEO", "PERFORMANCE", "FINAL QA"]
      )
        .map(
          (t, i) =>
            `<div class="bs-sv-store-matrix__cell${i === 0 ? " is-on" : ""}"><span>${escapeHtml(t)}</span><strong>${
              i + 1
            }</strong></div>`
        )
        .join("")}</div>`,
    }),
  "biz-flow": () =>
    panelShell({
      mod: "biz",
      live: "PLAN FLOW",
      meta: "BUSINESS",
      body: flowSteps(["IDEA", "CUSTOMER", "MODEL", "LAUNCH", "GROW"]),
    }),
  "research-board": (lang) =>
    panelShell({
      mod: "research",
      live: "RESEARCH BOARD",
      meta: "REPORTS",
      body: `<div class="bs-sv-store-board">${(lang === "ko"
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
    panelShell({
      mod: "dash",
      live: "FOUNDER VIEW",
      meta: "BUSINESS",
      body: `<div class="bs-sv-store-dash">
        <div class="bs-sv-store-dash__metrics">
          ${(lang === "ko"
            ? [
                ["MRR", "₩—"],
                ["USERS", "—"],
                ["RUNWAY", "—"],
              ]
            : [
                ["MRR", "—"],
                ["USERS", "—"],
                ["RUNWAY", "—"],
              ]
          )
            .map(
              ([k, v]) =>
                `<div><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`
            )
            .join("")}
        </div>
        <p class="bs-sv__k">${lang === "ko" ? "이번 주" : "THIS WEEK"}</p>
        <ol class="bs-sv-store-dash__week">
          <li class="is-on">${lang === "ko" ? "온보딩 V2" : "Onboarding V2"}</li>
          <li>${lang === "ko" ? "가격 검토" : "Pricing review"}</li>
          <li>${lang === "ko" ? "릴리즈 노트" : "Release notes"}</li>
        </ol>
      </div>`,
    }),
  "roadmap-cols": () =>
    panelShell({
      mod: "roadmap",
      live: "PRODUCT ROADMAP",
      meta: "TEMPLATES",
      body: `<div class="bs-sv-store-road">${["NOW", "NEXT", "LATER"]
        .map(
          (col, i) =>
            `<div class="bs-sv-store-road__col${i === 0 ? " is-on" : ""}"><p>${col}</p><ul><li>Item ${i + 1}</li><li>Item ${
              i + 2
            }</li></ul></div>`
        )
        .join("")}</div>`,
    }),
};

const SLUG_PREVIEW = {
  "app-launch-kit": "launch-checklist",
  "mvp-planning-kit": "mvp-flow",
  "cursor-prompt-pack": "cursor-workflow",
  "codex-builder-pack": "codex-workflow",
  "website-launch-checklist": "web-checklist",
  "business-planning-workbook": "biz-flow",
  "product-research-template": "research-board",
  "founder-dashboard": "founder-dash",
  "product-roadmap": "roadmap-cols",
};

export function storeHeroVisual(slug, previewKind, lang) {
  const kind = previewKind || SLUG_PREVIEW[slug] || "launch-checklist";
  const fn = VISUALS[kind] || VISUALS["launch-checklist"];
  return fn(lang);
}

function largeShell({ mod, body, foot = "" }) {
  return `<div class="bs-store-preview bs-store-preview--${mod}">
    <div class="bs-store-preview__frame">${body}</div>
    ${foot ? `<p class="bs-store-preview__foot">${foot}</p>` : ""}
  </div>`;
}

function cursorWorkspaceLarge(lang) {
  const phases = ["DEFINE", "PLAN", "BUILD", "DEBUG", "QA", "SHIP"];
  const nav = phases
    .map(
      (p, i) =>
        `<li class="bs-sv-store-ws__phase${i === 0 ? " is-on" : ""}"><span>${pad2(i + 1)}</span> ${escapeHtml(p)}</li>`
    )
    .join("");
  const flow = ["DEFINE", "PLAN", "BUILD", "TEST", "REFINE", "SHIP"]
    .map((s, i, arr) => `${escapeHtml(s)}${i < arr.length - 1 ? '<span aria-hidden="true">↓</span>' : ""}`)
    .join("");
  const fields =
    lang === "ko"
      ? [
          ["CONTEXT", "프로젝트 맥락과 제약"],
          ["GOAL", "무엇을 만들지"],
          ["CONSTRAINTS", "변경하면 안 되는 것"],
          ["ACCEPTANCE CRITERIA", "완료 기준"],
        ]
      : [
          ["CONTEXT", "Project context"],
          ["GOAL", "What should be built"],
          ["CONSTRAINTS", "What must not change"],
          ["ACCEPTANCE CRITERIA", "Expected result"],
        ];
  const prompt = fields
    .map(([k, v]) => `<div class="bs-sv-store-ws__field"><p>${escapeHtml(k)}</p><strong>${escapeHtml(v)}</strong></div>`)
    .join("");
  const foot =
    lang === "ko"
      ? "Independent resource by Newon. Not affiliated with Cursor."
      : "Independent resource by Newon. Not affiliated with Cursor.";
  return largeShell({
    mod: "cursor-ws",
    foot,
    body: `<div class="bs-sv-store-ws">
      <nav class="bs-sv-store-ws__nav" aria-hidden="true"><p class="bs-sv-store-ws__label">PHASES</p><ol>${nav}</ol></nav>
      <div class="bs-sv-store-ws__main" aria-hidden="true">
        <p class="bs-sv-store-ws__label">PRODUCT BUILD PROMPT</p>
        <div class="bs-sv-store-ws__prompt">${prompt}</div>
      </div>
      <aside class="bs-sv-store-ws__flow" aria-hidden="true"><p class="bs-sv-store-ws__label">WORKFLOW</p><div class="bs-sv-store-ws__pipe">${flow}</div></aside>
    </div>`,
  });
}

function codexConsoleLarge(lang) {
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
  const body = `<div class="bs-sv-store-console">
    <div class="bs-sv-store-console__bar"><span></span><span></span><span></span><em>AGENT EXECUTION CONSOLE</em></div>
    <div class="bs-sv-store-console__grid">${tasks
      .map(
        ([k, v], i) =>
          `<article class="bs-sv-store-console__cell${i === 1 ? " is-on" : ""}"><p>${escapeHtml(k)}</p><strong>${escapeHtml(v)}</strong></article>`
      )
      .join("")}</div>
    <div class="bs-sv-store-console__log"><p>$ agent run --task "implement-auth"</p><p>→ analyzing repository...</p><p>→ applying patch (4 files)</p></div>
  </div>`;
  return largeShell({ mod: "codex", body });
}

function launchCommandLarge(lang) {
  return largeShell({
    mod: "launch-cmd",
    body: `<div class="bs-sv-store-cmd">
      <div class="bs-sv-store-cmd__rail"><span class="is-on">PRE-LAUNCH</span><span>STORE</span><span>QA</span><span>SHIP</span></div>
      ${checklist(
        lang === "ko"
          ? [
              ["Product Definition", "문제 · 사용자 · 가치"],
              ["MVP Scope", "Must / Later 분리"],
              ["Store Metadata", "이름 · 키워드 · 설명"],
              ["Launch Timeline", "D-7 → D-Day"],
              ["Post-launch Review", "리뷰 · 버그 · 업데이트"],
            ]
          : [
              ["Product Definition", "Problem · user · value"],
              ["MVP Scope", "Must / Later split"],
              ["Store Metadata", "Name · keywords · copy"],
              ["Launch Timeline", "D-7 → D-Day"],
              ["Post-launch Review", "Reviews · bugs · updates"],
            ]
      )}
    </div>`,
  });
}

function mvpCanvasLarge() {
  return largeShell({
    mod: "mvp-canvas",
    body: `<div class="bs-sv-store-canvas">${flowSteps(["PROBLEM", "USER", "VALUE", "CORE", "MVP", "VALIDATE"], true)}<div class="bs-sv-store-canvas__notes"><span>Must ship</span><span>Later</span><span>Validate</span></div></div>`,
  });
}

const LARGE_VISUALS = {
  "launch-checklist": (lang) => launchCommandLarge(lang),
  "mvp-flow": () => mvpCanvasLarge(),
  "cursor-workflow": (lang) => cursorWorkspaceLarge(lang),
  "codex-workflow": (lang) => codexConsoleLarge(lang),
  "web-checklist": (lang) =>
    largeShell({
      mod: "web-qa",
      body: `<div class="bs-sv-store-matrix bs-sv-store-matrix--lg">${(lang === "ko"
        ? ["CONTENT", "SEO", "PERFORMANCE", "ACCESSIBILITY", "ANALYTICS", "FINAL QA"]
        : ["CONTENT", "SEO", "PERFORMANCE", "ACCESSIBILITY", "ANALYTICS", "FINAL QA"]
      )
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
      body: `<div class="bs-sv-store-wb">${flowSteps(
        lang === "ko" ? ["IDEA", "CUSTOMER", "MODEL", "CHANNEL", "LAUNCH"] : ["IDEA", "CUSTOMER", "MODEL", "CHANNEL", "LAUNCH"],
        true
      )}<div class="bs-sv-store-wb__sheet"><span>Revenue</span><span>Cost</span><span>Timeline</span></div></div>`,
    }),
  "research-board": (lang) =>
    largeShell({
      mod: "research-lg",
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
            .map(([k, v]) => `<div><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`)
            .join("")}
        </div>
        <div class="bs-sv-store-dash__ops">
          <p class="bs-sv__k">${lang === "ko" ? "운영 보드" : "OPERATING BOARD"}</p>
          <ol class="bs-sv-store-dash__week">
            <li class="is-on">${lang === "ko" ? "온보딩 V2" : "Onboarding V2"}</li>
            <li>${lang === "ko" ? "가격 검토" : "Pricing review"}</li>
            <li>${lang === "ko" ? "릴리즈 노트" : "Release notes"}</li>
            <li>${lang === "ko" ? "지표 리뷰" : "Metrics review"}</li>
          </ol>
        </div>
      </div>`,
    }),
  "roadmap-cols": (lang) =>
    largeShell({
      mod: "roadmap-lg",
      body: `<div class="bs-sv-store-road bs-sv-store-road--lg">${(lang === "ko" ? ["NOW", "NEXT", "LATER"] : ["NOW", "NEXT", "LATER"])
        .map(
          (col, i) =>
            `<div class="bs-sv-store-road__col${i === 0 ? " is-on" : ""}"><p>${col}</p><ul><li>${lang === "ko" ? "핵심 기능" : "Core feature"}</li><li>${lang === "ko" ? "출시 준비" : "Launch prep"}</li><li>${lang === "ko" ? "실험" : "Experiment"}</li></ul></div>`
        )
        .join("")}</div>`,
    }),
};

export function storeLargePreview(slug, previewKind, lang, _title) {
  const kind = previewKind || SLUG_PREVIEW[slug] || "launch-checklist";
  const fn = LARGE_VISUALS[kind] || LARGE_VISUALS["launch-checklist"];
  return fn(lang);
}
