/**
 * Studio explore hub — footer: pillar nav + FAQ + black CTA (build-page quality).
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { STUDIO_PILLAR_SLUGS, getStudioPillarCopy } from "./studio-pillar-copy.mjs";

const LABELS = { brand: "BRAND", digital: "DIGITAL", content: "CONTENT", ip: "IP" };

const FAQ = {
  ko: [
    {
      q: "브랜딩만 따로 의뢰할 수 있나요?",
      a: "가능합니다. 전략만, 네이밍만, 로고만 등 필요한 범위로 진행할 수 있습니다.",
    },
    {
      q: "디자인만 의뢰할 수 있나요?",
      a: "가능합니다. UI/UX 설계와 프로토타입까지 범위를 맞춰 진행할 수 있습니다. 개발은 Business BUILD와 연결할 수 있습니다.",
    },
    {
      q: "콘텐츠·캠페인만 따로 가능한가요?",
      a: "가능합니다. 소셜, 캠페인, 비주얼 중 필요한 범위로 진행합니다. 기존 브랜드가 있으면 그에 맞춥니다.",
    },
    {
      q: "IP·캐릭터 프로젝트는 어떻게 시작하나요?",
      a: "캐릭터 랩 또는 짧은 브리핑으로 방향을 정한 뒤 실험 범위를 설정합니다.",
    },
    {
      q: "결과물은 어떤 형태로 받나요?",
      a: "브랜드 가이드, 디자인 파일, 채널별 에셋 등 실무에 바로 쓸 수 있는 형태로 전달합니다.",
    },
  ],
  en: [
    {
      q: "Can we hire for branding only?",
      a: "Yes — strategy, naming, logo, or identity only, scoped to what you need.",
    },
    {
      q: "Design only?",
      a: "Yes — UI/UX and prototype scoped to your needs. Build can connect via Business BUILD.",
    },
    {
      q: "Content or campaigns only?",
      a: "Yes — social, campaign, or visual scope as needed. We can align to an existing brand.",
    },
    {
      q: "How do IP or character projects start?",
      a: "Character Lab or a short brief to set direction and experiment scope.",
    },
    {
      q: "What do we receive?",
      a: "Brand guides, design files, and channel-ready assets — ready for production use.",
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
  const title = escapeHtml(t(flat, flatEn, "studioHub.exploreNavTitle", "OTHER STUDIO AREAS"));
  const cards = STUDIO_PILLAR_SLUGS.map((slug, i) => {
    const copy = getStudioPillarCopy(slug, pageLang);
    return `<a class="bp-other__card" href="${slug}/">
      <span class="bp-other__top">
        <span class="bp-other__n">${pad2(i + 1)}</span>
        <span class="bp-other__arrow" aria-hidden="true">→</span>
      </span>
      <span class="bp-other__t">${LABELS[slug]}</span>
      <span class="bp-other__lead">${escapeHtml(copy?.headline || "")}</span>
    </a>`;
  }).join("");

  return `<section class="bp-sec bp-other bz-explore-nav" data-bp-reveal aria-labelledby="ns-explore-nav-label">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label" id="ns-explore-nav-label">${title}</p>
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
      <button type="button" class="bp-faq__q" aria-expanded="false" id="ns-faq-q-${i}" aria-controls="ns-faq-a-${i}">
        <span class="bp-faq__q-text">${escapeHtml(f.q)}</span>
        <span class="bp-faq__icon" aria-hidden="true"></span>
      </button>
      <div class="bp-faq__a" id="ns-faq-a-${i}" role="region" aria-labelledby="ns-faq-q-${i}" hidden>
        <div class="bp-faq__a-inner"><p>${escapeHtml(f.a)}</p></div>
      </div>
    </div>`
    )
    .join("");
  const label = escapeHtml(t(flat, flatEn, "studioHub.exploreFaqLabel", "FAQ"));
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
  const eyebrow = escapeHtml(t(flat, flatEn, "studioHub.exploreCtaEyebrow", "HAVE A PROJECT?"));
  const title = escapeHtml(
    t(
      flat,
      flatEn,
      "studioHub.exploreCtaTitle",
      ko
        ? "브랜드와 제품이 세상에 보이는 방식을 함께 만듭니다."
        : "Let's shape how your brand and product show up in the world."
    )
  );
  const lead = escapeHtml(
    t(
      flat,
      flatEn,
      "studioHub.exploreCtaLead",
      ko
        ? "아이디어 단계여도 괜찮습니다. 필요한 범위부터 함께 정리합니다."
        : "Even at the idea stage. We start by clarifying the scope you need."
    )
  );
  const btn = escapeHtml(
    t(flat, flatEn, "studioHub.exploreCtaBtn", ko ? "프로젝트 문의 →" : "Project inquiry →")
  );
  return `<section class="bp-cta bz-explore-cta" data-bp-reveal>
  <div class="bp-inner bp-cta__inner">
    <p class="bp-label">${eyebrow}</p>
    <h2 class="bp-cta__title">${title}</h2>
    <p class="bp-cta__lead">${lead}</p>
    <a class="bp-btn bp-btn--primary" href="../business/inquiry/#inquiry" data-analytics="studio_explore_cta">${btn}</a>
  </div>
</section>`;
}

export function studioExploreCloseHtml(flat, flatEn, lang = "en") {
  return `<div class="bp-page bz-explore-foot">
${pillarNav(flat, flatEn, lang)}
${faqSection(flat, flatEn, lang)}
${finalCta(flat, flatEn, lang)}
</div>`;
}
