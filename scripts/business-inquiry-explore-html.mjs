/**
 * Inquiry hub — replace services pillars with Business / Studio / Resources explore cards.
 */
import { escapeHtml, pick } from "./hub-utils.mjs";

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return v != null && v !== "" ? String(v) : fb;
}

const CARDS = [
  {
    n: "01",
    eyebrowKey: "business.inquiryExploreBusinessEyebrow",
    eyebrowFb: "BUSINESS",
    titleKey: "business.inquiryExploreBusinessTitle",
    titleFbKo: "비즈니스 알아보기",
    titleFbEn: "Explore Business",
    bodyKey: "business.inquiryExploreBusinessBody",
    bodyFbKo: "제품 제작, 자동화, 리서치, 솔루션과 협업 방식을 살펴봅니다.",
    bodyFbEn: "See how we build products, automate work, research markets, and collaborate.",
    ctaKey: "business.inquiryExploreBusinessCta",
    ctaFbKo: "Business 보기 →",
    ctaFbEn: "View Business →",
    href: "../",
    analytics: "business_inquiry_explore_business",
  },
  {
    n: "02",
    eyebrowKey: "business.inquiryExploreStudioEyebrow",
    eyebrowFb: "STUDIO",
    titleKey: "business.inquiryExploreStudioTitle",
    titleFbKo: "스튜디오 알아보기",
    titleFbEn: "Explore Studio",
    bodyKey: "business.inquiryExploreStudioBody",
    bodyFbKo: "브랜드, 디자인, 콘텐츠, IP 제작 서비스를 확인합니다.",
    bodyFbEn: "Brand, design, content, and IP production services.",
    ctaKey: "business.inquiryExploreStudioCta",
    ctaFbKo: "Studio 보기 →",
    ctaFbEn: "View Studio →",
    href: "../../studio/",
    analytics: "business_inquiry_explore_studio",
  },
  {
    n: "03",
    eyebrowKey: "business.inquiryExploreResourcesEyebrow",
    eyebrowFb: "RESOURCES",
    titleKey: "business.inquiryExploreResourcesTitle",
    titleFbKo: "리소스 알아보기",
    titleFbEn: "Explore Resources",
    bodyKey: "business.inquiryExploreResourcesBody",
    bodyFbKo: "스토어, 인사이트, 도구, 미디어 등 Newon 리소스를 탐색합니다.",
    bodyFbEn: "Browse the store, insights, tools, media, and more.",
    ctaKey: "business.inquiryExploreResourcesCta",
    ctaFbKo: "Resources 보기 →",
    ctaFbEn: "View Resources →",
    href: "../../resources/",
    analytics: "business_inquiry_explore_resources",
  },
];

function cardHtml(card, flat, flatEn, lang) {
  const isKo = lang === "ko";
  const eyebrow = escapeHtml(t(flat, flatEn, card.eyebrowKey, card.eyebrowFb));
  const title = escapeHtml(t(flat, flatEn, card.titleKey, isKo ? card.titleFbKo : card.titleFbEn));
  const body = escapeHtml(t(flat, flatEn, card.bodyKey, isKo ? card.bodyFbKo : card.bodyFbEn));
  const cta = escapeHtml(t(flat, flatEn, card.ctaKey, isKo ? card.ctaFbKo : card.ctaFbEn));
  return `<a class="bz-inq-explore__card" href="${escapeHtml(card.href)}" data-analytics="${escapeHtml(card.analytics)}">
    <div class="bz-inq-explore__top">
      <span class="bz-inq-explore__n" aria-hidden="true">${card.n}</span>
      <span class="bz-inq-explore__eyebrow">${eyebrow}</span>
    </div>
    <h3 class="bz-inq-explore__title">${title}</h3>
    <p class="bz-inq-explore__body">${body}</p>
    <span class="bz-inq-explore__cta">${cta}<span class="bz-inq-explore__arrow" aria-hidden="true">↗</span></span>
  </a>`;
}

export function businessInquiryExploreHtml(flat, flatEn, lang = "en") {
  const isKo = lang === "ko";
  const label = escapeHtml(t(flat, flatEn, "business.inquiryExploreLabel", "EXPLORE"));
  const title = escapeHtml(
    t(flat, flatEn, "business.inquiryExploreTitle", isKo ? "Newon 더 알아보기" : "Explore Newon")
  );
  const lead = escapeHtml(
    t(
      flat,
      flatEn,
      "business.inquiryExploreLead",
      isKo
        ? "문의 전에 Newon의 서비스, 제작 방식, 리소스를 살펴보세요."
        : "Browse services, how we work, and resources before you inquire."
    )
  );
  const cards = CARDS.map((c) => cardHtml(c, flat, flatEn, lang)).join("\n");

  return `<section id="explore" class="bz-section bz-inq-explore bz-reveal" aria-labelledby="bz-inq-explore-title">
    <div class="bz-inner">
      <header class="bz-sec-head">
        <div class="bz-sec-head__copy">
          <p class="bz-label">${label}</p>
          <h2 class="bz-title" id="bz-inq-explore-title">${title}</h2>
        </div>
        <p class="bz-lead bz-sec-head__lead">${lead}</p>
      </header>
      <div class="bz-inq-explore__grid">${cards}</div>
    </div>
  </section>`;
}
