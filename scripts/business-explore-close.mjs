/**
 * Business explore hub — footer: product matrix + pillar nav + FAQ + black CTA.
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { PILLAR_SLUGS, getPillarCopy } from "./business-pillar-copy.mjs";
import {
  businessProductMatrixHtml,
  paymentPolicyBrief,
  revisionPolicyBrief,
  externalCostDisclaimer,
} from "./business-pricing.mjs";

const LABELS = {
  build: "BUILD",
  automation: "AUTOMATION",
  research: "RESEARCH",
  solutions: "SOLUTIONS",
};

const FAQ = {
  ko: [
    {
      q: "프로젝트 기간은 얼마나 걸리나요?",
      a: "요구사항 확정·착수 이후 기준으로 랜딩 3–5일, 웹 5–10일, 앱 프로토타입 3–7일, MVP Starter 1–2주가 일반적입니다. 고객 피드백 지연·외부 심사·스토어 심사 기간은 별도일 수 있습니다.",
    },
    {
      q: "수정은 몇 회 가능한가요?",
      a: revisionPolicyBrief("ko"),
    },
    {
      q: "결제는 어떻게 진행되나요?",
      a: `${paymentPolicyBrief("ko")} ${externalCostDisclaimer("ko")}`,
    },
    {
      q: "기존 프로젝트 개선도 가능한가요?",
      a: "가능합니다. 현재 상태와 목표를 확인한 뒤 개선 범위와 우선순위를 제안합니다.",
    },
    {
      q: "유지보수도 가능한가요?",
      a: "납품 이후 계약 범위 내 오류 수정 기간을 안내할 수 있습니다. 장기 유지보수는 별도 계약이며, 프로젝트 문의로 연결해 주세요.",
    },
    {
      q: "최종 결과물은 어떻게 전달되나요?",
      a: "배포된 URL, 소스/에셋, 운영에 필요한 간단한 가이드를 전달합니다.",
    },
  ],
  en: [
    {
      q: "How long does a project take?",
      a: "After requirements lock and kickoff: landing 3–5 days, web 5–10 days, app prototype 3–7 days, MVP Starter 1–2 weeks are typical. Feedback delays and store review time may be separate.",
    },
    {
      q: "How many revision rounds are included?",
      a: revisionPolicyBrief("en"),
    },
    {
      q: "How does payment work?",
      a: `${paymentPolicyBrief("en")} ${externalCostDisclaimer("en")}`,
    },
    {
      q: "Can you improve an existing product?",
      a: "Yes. We review current state and goals, then propose improvement scope and priorities.",
    },
    {
      q: "Do you offer maintenance?",
      a: "We can cover in-scope defect fixes after delivery. Longer maintenance is a separate agreement — start via project inquiry.",
    },
    {
      q: "What do we receive at the end?",
      a: "Deployed URLs, source/assets, and a concise guide for operating the deliverable.",
    },
  ],
};

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return v != null && v !== "" ? String(v) : fb;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function pillarNav(flat, flatEn, lang) {
  const pageLang = lang === "ko" ? "ko" : "en";
  const title = escapeHtml(
    t(flat, flatEn, "business.exploreNavTitle", pageLang === "ko" ? "OTHER BUSINESS SERVICES" : "OTHER BUSINESS SERVICES")
  );
  const cards = PILLAR_SLUGS.map((slug, i) => {
    const copy = getPillarCopy(slug, pageLang);
    return `<a class="bp-other__card" href="${slug}/">
      <span class="bp-other__top">
        <span class="bp-other__n">${pad2(i + 1)}</span>
        <span class="bp-other__arrow" aria-hidden="true">→</span>
      </span>
      <span class="bp-other__t">${LABELS[slug]}</span>
      <span class="bp-other__lead">${escapeHtml(copy?.headline || "")}</span>
    </a>`;
  }).join("");

  return `<section class="bp-sec bp-other bz-explore-nav" data-bp-reveal aria-labelledby="bz-explore-nav-label">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label" id="bz-explore-nav-label">${title}</p>
    </header>
    <nav class="bp-other__grid" aria-label="${title}">${cards}</nav>
  </div>
</section>`;
}

function faqSection(flat, flatEn, lang) {
  const pageLang = lang === "ko" ? "ko" : "en";
  const items = (FAQ[pageLang] || FAQ.en)
    .map(
      (f, i) => `<div class="bp-faq__item">
      <button type="button" class="bp-faq__q" aria-expanded="false" id="bz-faq-q-${i}" aria-controls="bz-faq-a-${i}">
        <span class="bp-faq__q-text">${escapeHtml(f.q)}</span>
        <span class="bp-faq__icon" aria-hidden="true"></span>
      </button>
      <div class="bp-faq__a" id="bz-faq-a-${i}" role="region" aria-labelledby="bz-faq-q-${i}" hidden>
        <div class="bp-faq__a-inner"><p>${escapeHtml(f.a)}</p></div>
      </div>
    </div>`
    )
    .join("");
  const label = escapeHtml(t(flat, flatEn, "business.exploreFaqLabel", "FAQ"));
  return `<section id="faq" class="bp-sec bp-faq bz-explore-faq" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">${label}</p>
    </header>
    <div class="bp-faq__list">${items}</div>
  </div>
</section>`;
}

function finalCta(flat, flatEn, lang) {
  const ko = lang === "ko";
  const eyebrow = escapeHtml(t(flat, flatEn, "business.exploreCtaEyebrow", "HAVE A PROJECT?"));
  const title = escapeHtml(
    t(
      flat,
      flatEn,
      "business.exploreCtaTitle",
      ko ? "만들고 싶은 것이 있다면 이야기해주세요." : "If you have something to build, tell us."
    )
  );
  const lead = escapeHtml(
    t(
      flat,
      flatEn,
      "business.exploreCtaLead",
      ko
        ? "아이디어 단계여도 괜찮습니다. 필요한 범위부터 함께 정리합니다."
        : "Even at the idea stage. We start by clarifying the scope you need."
    )
  );
  const btn = escapeHtml(t(flat, flatEn, "business.exploreCtaBtn", ko ? "프로젝트 문의 →" : "Project inquiry →"));
  return `<section class="bp-cta bz-explore-cta" data-bp-reveal>
  <div class="bp-inner bp-cta__inner">
    <p class="bp-label">${eyebrow}</p>
    <h2 class="bp-cta__title">${title}</h2>
    <p class="bp-cta__lead">${lead}</p>
    <a class="bp-btn bp-btn--primary" href="inquiry/#inquiry" data-analytics="business_explore_cta">${btn}</a>
  </div>
</section>`;
}

function portfolioStrip(lang = "en") {
  const ko = lang === "ko";
  const label = ko ? "BUILT BY NEWON" : "BUILT BY NEWON";
  const title = ko ? "직접 출시한 제품으로 신뢰를 쌓습니다." : "Trust built on products we ship ourselves.";
  const btn = ko ? "Portfolio 보기 →" : "See portfolio →";
  return `<section class="bp-sec bz-built-by" data-bp-reveal aria-labelledby="bz-built-by-label">
  <div class="bp-inner" style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1.25rem">
    <div>
      <p class="bp-label" id="bz-built-by-label">${label}</p>
      <p class="bp-lead" style="margin:0.65rem 0 0;max-width:28rem">${escapeHtml(title)}</p>
    </div>
    <a class="bp-btn bp-btn--ghost" href="../portfolio/">${escapeHtml(btn)}</a>
  </div>
</section>`;
}

function processStrip(lang = "en") {
  const ko = lang === "ko";
  const steps = ko
    ? [
        { n: "01", t: "DISCOVER", d: "요구사항과 목표 확인" },
        { n: "02", t: "DEFINE", d: "범위 · 일정 · 견적 확정" },
        { n: "03", t: "BUILD", d: "디자인 · 개발 · 검증" },
        { n: "04", t: "REVIEW", d: "피드백 및 수정" },
        { n: "05", t: "LAUNCH", d: "배포 · 출시 · 납품" },
      ]
    : [
        { n: "01", t: "DISCOVER", d: "Align on goals and requirements" },
        { n: "02", t: "DEFINE", d: "Lock scope, timeline, and quote" },
        { n: "03", t: "BUILD", d: "Design, develop, and validate" },
        { n: "04", t: "REVIEW", d: "Feedback and revisions" },
        { n: "05", t: "LAUNCH", d: "Deploy, ship, and hand off" },
      ];
  const note = ko
    ? "소규모 프로젝트는 불필요하게 복잡한 절차 없이 빠르게 진행할 수 있습니다."
    : "Smaller projects move quickly without unnecessary process overhead.";
  const items = steps
    .map(
      (s) => `<article class="bp-other__card" style="pointer-events:none">
      <span class="bp-other__top"><span class="bp-other__n">${s.n}</span></span>
      <span class="bp-other__t">${escapeHtml(s.t)}</span>
      <span class="bp-other__lead">${escapeHtml(s.d)}</span>
    </article>`
    )
    .join("");
  return `<section class="bp-sec bp-other bz-process-strip" data-bp-reveal aria-labelledby="bz-process-strip-label">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label" id="bz-process-strip-label">${ko ? "PROCESS" : "PROCESS"}</p>
    </header>
    <div class="bp-other__grid">${items}</div>
    <p class="bp-note" style="margin-top:1.25rem">${escapeHtml(note)}</p>
  </div>
</section>`;
}

export function businessExploreCloseHtml(flat, flatEn, lang = "en") {
  const pageLang = lang === "ko" ? "ko" : "en";
  return `<div class="bp-page bz-explore-foot">
${businessProductMatrixHtml(pageLang)}
${processStrip(pageLang)}
${portfolioStrip(pageLang)}
${pillarNav(flat, flatEn, lang)}
${faqSection(flat, flatEn, lang)}
${finalCta(flat, flatEn, lang)}
</div>`;
}
