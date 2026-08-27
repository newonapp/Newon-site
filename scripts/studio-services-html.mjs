/**
 * Studio hub — Brand / Digital / Content / IP pillars (Business hub layout).
 */
import { escapeHtml, pick, studioStatusBadge } from "./hub-utils.mjs";
import { STUDIO_IA } from "./venture-studio-data.mjs";

const PILLAR_NUM = {
  brand: "01",
  digital: "02",
  content: "03",
  ip: "04",
};

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return v != null && v !== "" ? String(v) : fb;
}

function studioHref(href) {
  if (!href) return null;
  if (href.startsWith("#")) return href;
  return `../${href}`;
}

function itemRow(it, lang) {
  const title = escapeHtml(lang === "ko" && it.titleKo ? it.titleKo : it.title);
  const desc = escapeHtml(lang === "ko" ? it.desc || it.descEn : it.descEn || it.desc || "");
  const status =
    it.status && it.status !== "OPERATING" && it.status !== "LIVE"
      ? studioStatusBadge(it.status, lang)
      : "";
  const href = studioHref(it.href);
  if (!href) {
    return `<div class="bz-pillar__item bz-pillar__item--soon" role="listitem">
      <div class="bz-pillar__item-copy">
        <span class="bz-pillar__item-title">${title}</span>
        <span class="bz-pillar__item-desc">${desc}</span>
      </div>
      ${status}
    </div>`;
  }
  return `<a class="bz-pillar__item" href="${escapeHtml(href)}" role="listitem" data-analytics="studio_service_view">
    <div class="bz-pillar__item-copy">
      <span class="bz-pillar__item-title">${title}</span>
      <span class="bz-pillar__item-desc">${desc}</span>
    </div>
    <span class="bz-pillar__item-meta">${status}<span class="bz-pillar__arrow" aria-hidden="true">→</span></span>
  </a>`;
}

function pillarBlock(col, flat, flatEn, lang) {
  const n = PILLAR_NUM[col.id] || "00";
  const title = escapeHtml(t(flat, flatEn, col.labelKey, col.labelFb));
  const lead = escapeHtml(t(flat, flatEn, col.leadKey, col.leadFb));
  const items = (col.items || []).map((it) => itemRow(it, lang)).join("\n");
  const detailHref = col.detailHref || `${col.id}/`;
  const moreLabel = escapeHtml(
    t(flat, flatEn, "business.pillarMore", lang === "ko" ? "자세히 보기 →" : "Learn more →")
  );
  return `<article class="bz-pillar" id="${col.id}">
  <header class="bz-pillar__head">
    <span class="bz-pillar__n" aria-hidden="true">${n}</span>
    <div class="bz-pillar__intro">
      <h3 class="bz-pillar__title"><a class="bz-pillar__title-link" href="${escapeHtml(detailHref)}">${title}</a></h3>
      <p class="bz-pillar__lead">${lead}</p>
    </div>
    <a class="bz-pillar__more" href="${escapeHtml(detailHref)}">${moreLabel}</a>
  </header>
  <div class="bz-pillar__list" role="list">${items}</div>
</article>`;
}

export function studioServicesHtml(flat, flatEn, lang = "en") {
  const label = escapeHtml(t(flat, flatEn, "studioHub.servicesLabel", "STUDIO"));
  const title = escapeHtml(
    t(flat, flatEn, "studioHub.pillarsTitle", lang === "ko" ? "네 가지 영역으로 설계합니다" : "Four areas of craft")
  );
  const lead = escapeHtml(
    t(flat, flatEn, "studioHub.pillarsLead", "Brand · Digital · Content · IP")
  );
  const blocks = STUDIO_IA.map((col) => pillarBlock(col, flat, flatEn, lang)).join("\n");

  return `<div class="ns-studio-menu bz-page">
  <section id="areas" class="bz-section bz-services bz-pillars-sec" aria-labelledby="ns-services-title">
    <div class="bz-inner">
      <header class="bz-sec-head">
        <div class="bz-sec-head__copy">
          <p class="bz-label">${label}</p>
          <h2 class="bz-title" id="ns-services-title">${title}</h2>
        </div>
        <p class="bz-lead bz-sec-head__lead">${lead}</p>
      </header>
      <div class="bz-pillars">${blocks}</div>
    </div>
  </section>
</div>`;
}
