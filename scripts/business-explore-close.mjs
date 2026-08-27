/**
 * Business explore hub — footer: pillar nav + FAQ + black CTA (build-page quality).
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { PILLAR_SLUGS, getPillarCopy } from "./business-pillar-copy.mjs";

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
      a: "랜딩은 보통 1–2주, 웹사이트 2–5주, MVP는 범위에 따라 3–6주 전후입니다. 착수 전에 일정표를 함께 확정합니다.",
    },
    {
      q: "수정은 몇 회 가능한가요?",
      a: "단계별(설계·디자인·구현)로 합의한 라운드 안에서 수정합니다. 범위 밖 변경은 일정·견적에 반영합니다.",
    },
    {
      q: "기존 프로젝트 개선도 가능한가요?",
      a: "가능합니다. 현재 상태와 목표를 확인한 뒤 개선 범위와 우선순위를 제안합니다.",
    },
    {
      q: "유지보수도 가능한가요?",
      a: "출시 후 운영·소규모 개선은 별도 유지보수 또는 후속 프로젝트로 협의할 수 있습니다.",
    },
    {
      q: "최종 결과물은 어떻게 전달되나요?",
      a: "배포된 URL, 소스/에셋, 운영에 필요한 간단한 가이드를 전달합니다.",
    },
  ],
  en: [
    {
      q: "How long does a project take?",
      a: "Landing pages are often 1–2 weeks, websites 2–5 weeks, MVPs roughly 3–6 weeks depending on scope. We align on a timeline before kickoff.",
    },
    {
      q: "How many revision rounds are included?",
      a: "Revisions within agreed rounds per phase (design, build, etc.). Out-of-scope changes are reflected in timeline and quote.",
    },
    {
      q: "Can you improve an existing product?",
      a: "Yes. We review current state and goals, then propose improvement scope and priorities.",
    },
    {
      q: "Do you offer maintenance?",
      a: "Post-launch ops and small improvements can continue as maintenance or a follow-on project.",
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

export function businessExploreCloseHtml(flat, flatEn, lang = "en") {
  return `<div class="bp-page bz-explore-foot">
${pillarNav(flat, flatEn, lang)}
${faqSection(flat, flatEn, lang)}
${finalCta(flat, flatEn, lang)}
</div>`;
}
