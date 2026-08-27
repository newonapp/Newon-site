import { escapeHtml } from "./hub-utils.mjs";
import { BUSINESS_CASE_STUDIES } from "./business-case-studies.mjs";
import { PORTFOLIO_STATS } from "./portfolio-data.mjs";

function br(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function statItems(ko) {
  const apps = PORTFOLIO_STATS.items.find((i) => i.id === "apps");
  const langs = PORTFOLIO_STATS.items.find((i) => i.id === "languages");
  const countries = PORTFOLIO_STATS.items.find((i) => i.id === "countries");
  return [
    { v: apps?.value || "11", l: ko ? "자체 앱·제품" : "In-house apps" },
    { v: langs?.value || "13", l: ko ? "지원 언어" : "Languages" },
    { v: countries?.value || "177", l: ko ? "서비스 국가" : "Countries" },
  ];
}

export function businessCaseStudiesHtml(lang = "ko") {
  const ko = lang === "ko";
  const title = ko ? "Newon이 직접 만든\n제품에서 검증한 역량" : "Capabilities proven\nin Newon products";
  const lead = ko
    ? "아래는 고객 프로젝트가 아닌 Newon이 기획·디자인·개발·운영하는 자체 제품입니다. Business 서비스는 같은 제작 방식으로 기업·브랜드 프로젝트에 적용됩니다."
    : "These are not client projects — they are products Newon plans, designs, builds, and operates. Business services apply the same craft to partner work.";
  const stats = statItems(ko);

  const cards = BUSINESS_CASE_STUDIES.map((cs, i) => {
    const c = ko ? cs.ko : cs.en;
    return `<article class="bz-cs-card">
      <header class="bz-cs-card__head">
        <span class="bz-cs-card__n">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <p class="bz-cs-card__badge">${escapeHtml(cs.badge)}</p>
          <h3 class="bz-cs-card__product"><a href="${escapeHtml(cs.href)}">${escapeHtml(cs.product)}</a></h3>
        </div>
      </header>
      <dl class="bz-cs-card__grid">
        <div><dt>Problem</dt><dd>${escapeHtml(c.problem)}</dd></div>
        <div><dt>Solution</dt><dd>${escapeHtml(c.solution)}</dd></div>
        <div><dt>What We Built</dt><dd>${escapeHtml(c.built)}</dd></div>
        <div><dt>Technology / Capability</dt><dd>${escapeHtml(c.tech)}</dd></div>
        <div class="bz-cs-card__full"><dt>Result</dt><dd>${escapeHtml(c.result)}</dd></div>
      </dl>
    </article>`;
  }).join("");

  return `<section id="selected-work" class="bz-section bz-cs bz-reveal" aria-labelledby="bz-cs-title">
    <div class="bz-inner">
      <p class="bz-label">${ko ? "SELECTED WORK" : "SELECTED WORK"}</p>
      <h2 class="bz-title" id="bz-cs-title">${br(title)}</h2>
      <p class="bz-lead">${escapeHtml(lead)}</p>
      <ul class="bz-cs-stats" aria-label="${ko ? "Newon 운영 지표" : "Newon operating metrics"}">
        ${stats.map((s) => `<li><strong>${escapeHtml(s.v)}</strong><span>${escapeHtml(s.l)}</span></li>`).join("")}
      </ul>
      <div class="bz-cs-grid">${cards}</div>
    </div>
  </section>`;
}
