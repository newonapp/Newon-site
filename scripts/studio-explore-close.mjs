/**
 * Studio explore hub — footer: pillar nav + FAQ + black CTA (build-page quality).
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { STUDIO_PILLAR_SLUGS, getStudioPillarCopy } from "./studio-pillar-copy.mjs";

const LABELS = { brand: "BRAND", digital: "DIGITAL", content: "CONTENT", ip: "IP" };

const FAQ = {
  ko: [
    {
      q: "Studio와 Business의 차이는 무엇인가요?",
      a: "Studio는 Brand · UI/UX · Content · IP 등 전략·디자인·크리에이티브를 담당합니다. Business는 Build · Automation · Research · Solutions로 개발·구축·자동화·리서치를 담당합니다.",
    },
    {
      q: "웹 디자인을 한 뒤 개발도 맡길 수 있나요?",
      a: "가능합니다. Studio DIGITAL에서 UI/UX를 설계한 뒤, 실제 구현은 Newon Business BUILD로 연결할 수 있습니다.",
    },
    {
      q: "브랜딩·콘텐츠만 따로 의뢰할 수 있나요?",
      a: "가능합니다. 전략, 네이밍, 아이덴티티, 소셜, 캠페인 등 필요한 범위만 진행할 수 있습니다.",
    },
    {
      q: "IP·캐릭터도 지금 의뢰할 수 있나요?",
      a: "Character Lab은 실험적으로 진행할 수 있습니다. Digital Stickers 등은 Coming Soon이며, Newon Character는 내부 프로젝트입니다.",
    },
    {
      q: "결과물은 어떤 형태로 받나요?",
      a: "서비스별로 Brand Strategy Document, UI Handoff, Campaign Assets처럼 실제 산출물 이름으로 전달합니다.",
    },
  ],
  en: [
    {
      q: "How is Studio different from Business?",
      a: "Studio covers Brand, UI/UX, Content, and IP — strategy, design, and creative. Business covers Build, Automation, Research, and Solutions — development, systems, and research.",
    },
    {
      q: "Can design continue into development?",
      a: "Yes. Studio DIGITAL designs UI/UX; implementation can continue through Newon Business BUILD.",
    },
    {
      q: "Can we hire branding or content only?",
      a: "Yes — strategy, naming, identity, social, campaign, and more, scoped to what you need.",
    },
    {
      q: "Can we start IP or character work now?",
      a: "Character Lab can run experimentally. Digital Stickers are Coming Soon, and Newon Character is an internal project.",
    },
    {
      q: "What do we receive?",
      a: "Concrete deliverables by service — for example Brand Strategy Document, UI Handoff, or Campaign Assets.",
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
