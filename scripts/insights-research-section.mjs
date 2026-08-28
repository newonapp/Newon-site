/**
 * Insights hub — Business Research promo block (editorial panel, no watermark).
 */

function pad2(n) {
  return String(n).padStart(2, "0");
}

function br(s, escapeHtml) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function itemDesc(item, lang) {
  if (lang === "ko") return item.descKo || item.desc || "";
  return item.descEn || item.desc || "";
}

function defaultFacts(lang) {
  const ko = lang === "ko";
  return [
    { k: "SCOPE", v: ko ? "시장 · 경쟁 · 소비자 · 맞춤" : "Market · Competitor · Consumer · Custom" },
    { k: "OUTPUT", v: ko ? "리포트 · 브리프 · 실행 권고" : "Report · Brief · Recommendations" },
    { k: "PROCESS", v: ko ? "질문 → 리서치 → 납품" : "Question → Research → Delivery" },
  ];
}

/**
 * @param {object} copy insights hub copy
 * @param {'ko'|'en'} lang
 * @param {{ escapeHtml: Function, pathPrefix?: string }} ctx
 */
export function insightsResearchSection(copy, lang, ctx) {
  const { escapeHtml, pathPrefix = "../../" } = ctx;
  const ko = lang === "ko";
  const items = copy.researchItems || [];
  const fixHref = (href) => {
    if (!href) return `${pathPrefix}business/research/`;
    if (pathPrefix === "../../../" && href.startsWith("../../")) {
      return href.replace(/^\.\.\/\.\.\//, "../../../");
    }
    return href;
  };
  const researchHref = fixHref(copy.researchHref);
  const inquiryHref = fixHref(copy.researchInquiryHref || `${pathPrefix}business/inquiry/#inquiry`);

  const facts = (copy.researchMeta || defaultFacts(lang))
    .map(
      (row) =>
        `<div class="ri-research__meta-cell">
          <p class="ri-research__meta-k">${escapeHtml(row.k)}</p>
          <p class="ri-research__meta-v">${escapeHtml(row.v)}</p>
        </div>`
    )
    .join("");

  const cards = items
    .map((it, i) => {
      const href = escapeHtml(fixHref(it.href || copy.researchHref));
      const title = escapeHtml(it.title || "");
      const tag = escapeHtml(it.tag || "");
      const desc = escapeHtml(itemDesc(it, lang));
      const n = pad2(i + 1);
      return `<a class="ri-research__card" href="${href}" data-analytics="business_cta_click" data-item-id="${title}">
        <span class="ri-research__card-top">
          <span class="ri-research__card-n" aria-hidden="true">${n}</span>
          ${tag ? `<span class="ri-research__card-tag">${tag}</span>` : ""}
          <span class="ri-research__card-go" aria-hidden="true">→</span>
        </span>
        <span class="ri-research__card-title">${title}</span>
        ${desc ? `<span class="ri-research__card-desc">${desc}</span>` : ""}
      </a>`;
    })
    .join("");

  const scopeLabel = escapeHtml(
    copy.researchScopeCta || (ko ? "리서치 범위 보기 ↗" : "See research scope ↗")
  );
  const primaryLabel = escapeHtml(
    copy.researchCta || (ko ? "Business Research 문의 →" : "Inquire about Business Research →")
  );

  return `<section class="ri-research" data-rs-reveal aria-labelledby="ri-research-title">
  <div class="rs-inner">
    <div class="ri-research__panel">
      <div class="ri-research__intro">
        <p class="ri-research__eyebrow">${escapeHtml(copy.researchEyebrow || "BUSINESS RESEARCH")}</p>
        <h2 class="ri-research__title" id="ri-research-title">${br(copy.researchTitle, escapeHtml)}</h2>
        ${copy.researchLead ? `<p class="ri-research__lead">${escapeHtml(copy.researchLead)}</p>` : ""}
        <div class="ri-research__meta" aria-label="${escapeHtml(ko ? "리서치 개요" : "Research overview")}">${facts}</div>
        <div class="ri-research__actions">
          <a class="ri-research__btn ri-research__btn--primary" href="${escapeHtml(inquiryHref)}" data-analytics="business_cta_click">${primaryLabel}</a>
          <a class="ri-research__btn ri-research__btn--ghost" href="${escapeHtml(researchHref)}">${scopeLabel}</a>
        </div>
      </div>
      <div class="ri-research__grid">${cards}</div>
    </div>
  </div>
</section>`;
}
