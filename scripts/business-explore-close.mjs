/**
 * Business explore hub — footer: product matrix + pillar nav + FAQ + black CTA.
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { PILLAR_SLUGS, getPillarCopy } from "./business-pillar-copy.mjs";


const LABELS = {
  build: "BUILD",
  automation: "AUTOMATION",
  solutions: "SOLUTIONS",
  care: "CARE",
  research: "RESEARCH",
};

const FAQ = {
  ko: [
    { q: "Business에서는 무엇을 소개하나요?", a: "Newon이 직접 만들고 운영하는 제품, 반복 업무를 줄이는 자동화 솔루션, 기업·판매자·기관과의 파트너십을 소개합니다." },
    { q: "서비스를 웹사이트에서 이용할 수 있나요?", a: "아니요. 이 웹사이트는 소개, 앱 다운로드 안내, 제휴·문의만 제공합니다. 실제 서비스는 각 제품의 앱에서 이용합니다." },
    { q: "어떤 곳과 제휴할 수 있나요?", a: "기업, 판매자, 공공·지역 기관과 제휴할 수 있습니다. 범위와 조건은 문의 후 개별 협의합니다." },
    { q: "자동화 솔루션을 도입하고 싶습니다.", a: "현재 업무 흐름과 목표를 알려주세요. 적합한 도입 방식을 함께 검토합니다." },
    { q: "비용은 어떻게 정해지나요?", a: "고정된 가격표를 두지 않고, 문의 내용을 확인한 뒤 개별 협의합니다." },
    { q: "각 사업은 어디서 확인하나요?", a: "BabyLog, PetLog, My World, ShareOn, LivOn, Ongil 메뉴에서 각 사업을 소개합니다." },
  ],
  en: [
    { q: "What does Business cover?", a: "The products Newon builds and runs itself, automation solutions that reduce repetitive work, and partnerships with businesses, sellers and institutions." },
    { q: "Can I use the services on this website?", a: "No. This website provides information, app download guidance, partnerships and inquiries only. You use each service in its own app." },
    { q: "Who can partner with Newon?", a: "Businesses, sellers, and public or local institutions. Scope and terms are agreed individually after an inquiry." },
    { q: "I want to adopt an automation solution.", a: "Tell us about your current workflow and goals. We will review the right way to adopt it together." },
    { q: "How is pricing decided?", a: "There is no fixed price list. Terms are discussed individually after we review your inquiry." },
    { q: "Where can I see each business?", a: "BabyLog, PetLog, My World, ShareOn, LivOn and Ongil each have their own menu." },
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
    pageLang === "ko" ? "BUSINESS 영역" : "BUSINESS AREAS"
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
  const eyebrow = "PARTNERSHIP";
  const title = ko ? "함께하고 싶다면 이야기해주세요." : "If you want to work with us, tell us.";
  const lead = ko
    ? "기업·판매자·기관과의 제휴, 자동화 솔루션 도입 문의를 받습니다. 조건은 문의 후 개별 협의합니다."
    : "We welcome partnership and automation-solution inquiries from businesses, sellers and institutions. Terms are agreed individually.";
  const btn = ko ? "제휴·도입 문의 →" : "Partnership inquiry →";
  return `<section class="bp-cta bz-explore-cta" data-bp-reveal>
  <div class="bp-inner bp-cta__inner">
    <p class="bp-label">${escapeHtml(eyebrow)}</p>
    <h2 class="bp-cta__title">${escapeHtml(title)}</h2>
    <p class="bp-cta__lead">${escapeHtml(lead)}</p>
    <a class="bp-btn bp-btn--primary" href="inquiry/?category=Partnership#inquiry" data-analytics="business_explore_cta">${escapeHtml(btn)}</a>
  </div>
</section>`;
}

function portfolioStrip(lang = "en") {
  const ko = lang === "ko";
  const label = ko ? "BUILT BY NEWON" : "BUILT BY NEWON";
  const title = ko ? "Newon이 직접 만들고 운영하는 제품입니다." : "Products Newon builds and runs itself.";
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
        { n: "01", t: "INQUIRY", d: "제휴·도입 문의 접수" },
        { n: "02", t: "REVIEW", d: "목표와 현재 상황 확인" },
        { n: "03", t: "DISCUSS", d: "협력 범위와 방식 협의" },
        { n: "04", t: "AGREE", d: "조건 확정" },
        { n: "05", t: "START", d: "협력 시작" },
      ]
    : [
        { n: "01", t: "INQUIRY", d: "Send a partnership or adoption inquiry" },
        { n: "02", t: "REVIEW", d: "We review goals and context" },
        { n: "03", t: "DISCUSS", d: "Agree on scope and how to work together" },
        { n: "04", t: "AGREE", d: "Confirm terms" },
        { n: "05", t: "START", d: "Begin the collaboration" },
      ];
  const note = ko
    ? "조건은 문의 후 개별 협의합니다."
    : "Terms are agreed individually after an inquiry.";
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
      <p class="bp-label" id="bz-process-strip-label">${ko ? "PARTNERSHIP FLOW" : "PARTNERSHIP FLOW"}</p>
    </header>
    <div class="bp-other__grid">${items}</div>
    <p class="bp-note" style="margin-top:1.25rem">${escapeHtml(note)}</p>
  </div>
</section>`;
}

export function businessExploreCloseHtml(flat, flatEn, lang = "en") {
  const pageLang = lang === "ko" ? "ko" : "en";
  return `<div class="bp-page bz-explore-foot">
${processStrip(pageLang)}
${portfolioStrip(pageLang)}
${pillarNav(flat, flatEn, lang)}
${faqSection(flat, flatEn, lang)}
${finalCta(flat, flatEn, lang)}
</div>`;
}
