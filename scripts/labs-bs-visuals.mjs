/**
 * Labs experiment detail hero visuals — bs-visual shell (Studio / Store pattern).
 */
import { escapeHtml } from "./hub-utils.mjs";

function panelShell({ mod, live, meta, body }) {
  return `<div class="bs-visual bs-visual--lab bs-visual--${mod}" aria-hidden="true">
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

const VISUALS = {
  "review-ai": (lang) =>
    panelShell({
      mod: "review",
      live: "REVIEW AI",
      meta: "SIGNAL PIPELINE",
      body: flowSteps(
        lang === "ko"
          ? ["USER REVIEW", "SIGNAL", "PATTERN", "INSIGHT", "DECISION"]
          : ["USER REVIEW", "SIGNAL", "PATTERN", "INSIGHT", "DECISION"]
      ),
    }),
  "newon-qr": () =>
    panelShell({
      mod: "qr",
      live: "NEWON QR",
      meta: "SAAS · TRACKING",
      body: flowSteps(["QR", "SCAN", "VISIT", "DATA"]),
    }),
  "newon-form": (lang) =>
    panelShell({
      mod: "form",
      live: "NEWON FORM",
      meta: "SAAS · FORMS",
      body: `<div class="bs-sv-lab-form">
        <p class="bs-sv__k">NAME</p><div class="bs-sv-lab-form__wire"></div>
        <p class="bs-sv__k">EMAIL</p><div class="bs-sv-lab-form__wire"></div>
        <p class="bs-sv__k">${lang === "ko" ? "MESSAGE" : "MESSAGE"}</p><div class="bs-sv-lab-form__wire bs-sv-lab-form__wire--lg"></div>
        <span class="bs-sv-lab-form__cta">SUBMIT →</span>
      </div>`,
    }),
  "ai-experiment": () =>
    panelShell({
      mod: "ai",
      live: "AI DISCOVERY",
      meta: "RESEARCH",
      body: flowSteps(["PROBLEM", "SIGNAL", "AI FIT", "RESEARCH", "PROTOTYPE"]),
    }),
  "game-experiment": () =>
    panelShell({
      mod: "game",
      live: "GAME LAB",
      meta: "GAMES",
      body: flowSteps(["CHOICE", "MEMORY", "CONSEQUENCE"]),
    }),
  "character-lab": () =>
    panelShell({
      mod: "character",
      live: "CHARACTER LAB",
      meta: "IP · SYSTEM",
      body: `<pre class="bs-sv-lab-term">&gt; CHARACTER LAB
&gt; STATUS: BUILDING
&gt; PUBLIC ASSETS: NONE_</pre>`,
    }),
};

export function labsHeroVisual(slug, lang) {
  const fn = VISUALS[slug] || VISUALS["review-ai"];
  return fn(lang);
}
