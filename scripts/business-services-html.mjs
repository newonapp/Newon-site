/**
 * Business hub services — 4 editorial pillars (Build / Automation / Research / Solutions).
 * Creative lives under Studio top nav.
 */
import { escapeHtml, pick, studioStatusBadge } from "./hub-utils.mjs";
import { BUSINESS_IA } from "./venture-studio-data.mjs";

const PILLAR_COPY = {
  build: {
    num: "01",
    titleKey: "business.pillarBuildTitle",
    titleFb: "BUILD",
    leadKey: "business.pillarBuildLead",
    leadFb: "아이디어를 실제 제품으로.",
  },
  automation: {
    num: "02",
    titleKey: "business.pillarAutoTitle",
    titleFb: "AUTOMATE",
    leadKey: "business.pillarAutoLead",
    leadFb: "반복되는 업무를 시스템으로.",
  },
  research: {
    num: "03",
    titleKey: "business.pillarResearchTitle",
    titleFb: "RESEARCH",
    leadKey: "business.pillarResearchLead",
    leadFb: "감이 아니라 근거를 찾습니다.",
  },
  solutions: {
    num: "04",
    titleKey: "business.pillarSolutionsTitle",
    titleFb: "SOLUTIONS",
    leadKey: "business.pillarSolutionsLead",
    leadFb: "이미 만든 기술을 기업에 맞게.",
  },
};

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return v != null && v !== "" ? String(v) : fb;
}

function hubHref(href) {
  if (!href) return null;
  if (href.startsWith("business/")) return href.slice("business/".length);
  return href;
}

function itemRow(flat, flatEn, lang, item) {
  const title = escapeHtml(t(flat, flatEn, item.titleKey));
  const desc = escapeHtml(t(flat, flatEn, item.descKey));
  const status =
    item.status && item.status !== "OPERATING" && item.status !== "LIVE"
      ? studioStatusBadge(item.status, lang)
      : "";
  const href = hubHref(item.href);
  if (!href) {
    return `<div class="bz-pillar__item bz-pillar__item--soon" role="listitem">
      <div class="bz-pillar__item-copy">
        <span class="bz-pillar__item-title">${title}</span>
        <span class="bz-pillar__item-desc">${desc}</span>
      </div>
      ${status}
    </div>`;
  }
  return `<a class="bz-pillar__item" href="${escapeHtml(href)}" role="listitem" data-analytics="business_service_view" data-item-id="${escapeHtml(item.titleKey)}">
    <div class="bz-pillar__item-copy">
      <span class="bz-pillar__item-title">${title}</span>
      <span class="bz-pillar__item-desc">${desc}</span>
    </div>
    <span class="bz-pillar__item-meta">${status}<span class="bz-pillar__arrow" aria-hidden="true">→</span></span>
  </a>`;
}

function pillarBlock(col, flat, flatEn, lang) {
  const meta = PILLAR_COPY[col.id] || {
    num: "00",
    titleKey: col.labelKey,
    titleFb: col.labelFb,
    leadKey: "",
    leadFb: "",
  };
  const title = escapeHtml(t(flat, flatEn, meta.titleKey, meta.titleFb));
  const lead = escapeHtml(t(flat, flatEn, meta.leadKey, meta.leadFb));
  const items = col.items.map((it) => itemRow(flat, flatEn, lang, it)).join("\n");
  const detailHref = hubHref(col.detailHref || `business/${col.id}/`);
  const moreLabel = escapeHtml(
    t(flat, flatEn, "business.pillarMore", lang === "ko" ? "자세히 보기 →" : "Learn more →")
  );
  return `<article class="bz-pillar" id="${col.id}">
  <header class="bz-pillar__head">
    <span class="bz-pillar__n" aria-hidden="true">${meta.num}</span>
    <div class="bz-pillar__intro">
      <h3 class="bz-pillar__title"><a class="bz-pillar__title-link" href="${escapeHtml(detailHref)}">${title}</a></h3>
      <p class="bz-pillar__lead">${lead}</p>
    </div>
    <a class="bz-pillar__more" href="${escapeHtml(detailHref)}">${moreLabel}</a>
  </header>
  <div class="bz-pillar__list" role="list">${items}</div>
</article>`;
}

export function businessServicesHtml(flat, flatEn, lang = "en") {
  const label = escapeHtml(t(flat, flatEn, "studio.servicesLabel", "BUSINESS"));
  const title = escapeHtml(t(flat, flatEn, "business.pillarsTitle", "How we work with you"));
  const lead = escapeHtml(
    t(flat, flatEn, "business.pillarsLead", "Build · Automation · Research · Solutions")
  );
  const blocks = BUSINESS_IA.map((col) => pillarBlock(col, flat, flatEn, lang)).join("\n");

  return `<section id="services" class="bz-section bz-services bz-pillars-sec bz-reveal" aria-labelledby="bz-services-title">
    <div class="bz-inner">
      <header class="bz-sec-head">
        <div class="bz-sec-head__copy">
          <p class="bz-label">${label}</p>
          <h2 class="bz-title" id="bz-services-title">${title}</h2>
        </div>
        <p class="bz-lead bz-sec-head__lead">${lead}</p>
      </header>
      <div class="bz-pillars">${blocks}</div>
    </div>
  </section>`;
}
