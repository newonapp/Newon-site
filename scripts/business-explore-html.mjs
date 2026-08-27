/**
 * Business explore hub — Studio-style overview (hero + service pillars + close).
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { businessServicesHtml } from "./business-services-html.mjs";
import { businessExploreCloseHtml } from "./business-explore-close.mjs";

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return escapeHtml(v != null && v !== "" ? String(v) : fb);
}

export function businessExploreHtml(flat, flatEn, lang = "en") {
  const ko = lang === "ko";
  const services = businessServicesHtml(flat, flatEn, lang);

  const close = businessExploreCloseHtml(flat, flatEn, lang);

  return `<link rel="stylesheet" href="/newon-studio.css?v=20260827bz2" />
<link rel="stylesheet" href="/business-page.css?v=20260827bz2" />
<link rel="stylesheet" href="/business-pillar.css?v=20260827bz2" />
<section class="ns-hero">
  <div class="ns-inner">
    <p class="ns-kicker">${t(flat, flatEn, "business.exploreEyebrow", "NEWON FOR BUSINESS")}</p>
    <h1 class="ns-title">${t(flat, flatEn, "business.exploreTitle", ko ? "아이디어에서\n실제 제품까지." : "From idea to\nreal product.")}</h1>
    <p class="ns-lead">${t(flat, flatEn, "business.exploreLead", ko ? "Build · Automation · Research · Solutions — 기업과 함께하는 네 가지 방식을 한눈에 살펴보세요." : "Build · Automation · Research · Solutions — four ways we work with teams.")}</p>
    <div class="ns-actions">
      <a class="btn btn-ghost" href="#services">${t(flat, flatEn, "business.exploreCtaServices", ko ? "서비스 살펴보기 ↓" : "Explore services ↓")}</a>
      <a class="btn btn-primary" href="inquiry/">${t(flat, flatEn, "business.ctaInquiry", ko ? "프로젝트 문의하기" : "Project inquiry")} ↗</a>
    </div>
    <p class="ns-note">${t(flat, flatEn, "business.exploreNote", "Product · Technology · Partnership")}</p>
  </div>
</section>
<div class="ns-studio-menu bz-page">
  ${services}
</div>
${close}
<script src="/business-pillar.js?v=20260827bz2" defer></script>`;
}
