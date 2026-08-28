/**
 * Store product detail hero visuals — bs-visual shell (Studio service pattern).
 */
import { escapeHtml } from "./hub-utils.mjs";

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
