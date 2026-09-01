/**
 * Business explore hub — Studio-style overview (hero + service pillars + close).
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { businessServicesHtml } from "./business-services-html.mjs";
import { businessExploreCloseHtml } from "./business-explore-close.mjs";

const CSS_V = "20260830wrap1";

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return escapeHtml(v != null && v !== "" ? String(v) : fb);
}

function titleHtml(flat, flatEn, key, fb = "") {
  return t(flat, flatEn, key, fb).replace(/\n/g, "<br />");
}

function rail(items, ariaLabel) {
  const parts = items.map((item, i) => {
    const link = `<a class="ns-rail__link" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`;
    if (i === 0) return link;
    return `<span class="ns-rail__sep" aria-hidden="true">·</span>${link}`;
  });
  return `<nav class="ns-rail" aria-label="${escapeHtml(ariaLabel)}">${parts.join("")}</nav>`;
}

function heroBoard({ parent, live, items, ariaLabel }) {
  const rows = items
    .map(
      (item, i) => `<li>
      <a class="ns-board__row" href="${escapeHtml(item.href)}">
        <span class="ns-board__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="ns-board__t">${escapeHtml(item.label)}</span>
        <span class="ns-board__go" aria-hidden="true">→</span>
      </a>
    </li>`
    )
    .join("");
  return `<aside class="ns-hero__visual" aria-label="${escapeHtml(ariaLabel)}">
    <div class="ns-board">
      <div class="ns-board__head">
        <span class="ns-board__live"><i></i> ${escapeHtml(live)}</span>
        <span class="ns-board__meta">${escapeHtml(parent)}</span>
      </div>
      <div class="ns-board__mark" aria-hidden="true">
        <span class="ns-board__word">${escapeHtml(parent)}</span>
        <span class="ns-board__dot"></span>
      </div>
      <ol class="ns-board__list">${rows}</ol>
    </div>
  </aside>`;
}

export function businessExploreHtml(flat, flatEn, lang = "en") {
  const ko = lang === "ko";
  const services = businessServicesHtml(flat, flatEn, lang);
  const close = businessExploreCloseHtml(flat, flatEn, lang);

  const pillars = [
    { href: "#build", label: "Build" },
    { href: "#automation", label: "Automation" },
    { href: "#research", label: "Research" },
    { href: "#solutions", label: "Solutions" },
  ];

  return `<link rel="stylesheet" href="/business-type.css?v=20260827type4" />
<link rel="stylesheet" href="/newon-studio.css?v=${CSS_V}" />
<link rel="stylesheet" href="/business-page.css?v=${CSS_V}" />
<link rel="stylesheet" href="/business-pillar.css?v=${CSS_V}" />
<section class="ns-hero">
  <div class="ns-hero__bg" aria-hidden="true"></div>
  <div class="ns-inner ns-hero__stage">
    <div class="ns-hero__copy">
      <p class="ns-kicker"><span class="ns-kicker__mark" aria-hidden="true">N</span>${t(flat, flatEn, "business.exploreEyebrow", "NEWON FOR BUSINESS")}</p>
      <h1 class="ns-title">${titleHtml(flat, flatEn, "business.exploreTitle", ko ? "아이디어에서\n실제 제품까지." : "From idea to\nreal product.")}</h1>
      <p class="ns-lead">${t(flat, flatEn, "business.exploreLead", ko ? "Build · Automation · Research · Solutions — 기업과 함께하는 네 가지 방식을 한눈에 살펴보세요." : "Build · Automation · Research · Solutions — four ways we work with teams.")}</p>
      <div class="ns-actions">
        <a class="btn btn-ghost" href="#services">${t(flat, flatEn, "business.exploreCtaServices", ko ? "서비스 살펴보기 ↓" : "Explore services ↓")}</a>
        <a class="btn btn-primary" href="inquiry/">${t(flat, flatEn, "business.ctaInquiry", ko ? "프로젝트 상담하기" : "Start a consultation")} ↗</a>
      </div>
      ${rail(pillars, ko ? "Business 영역" : "Business areas")}
    </div>
    ${heroBoard({
      parent: "BUSINESS",
      live: "SERVICE MAP",
      items: pillars,
      ariaLabel: ko ? "Business 서비스 맵" : "Business service map",
    })}
  </div>
  <div class="ns-hero__rule" aria-hidden="true"></div>
</section>
<div class="ns-studio-menu bz-page">
  ${services}
</div>
${close}
<script src="/business-pillar.js?v=${CSS_V}" defer></script>`;
}
