/**
 * Insights hub — Research capabilities explore block (links to Business Research services).
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

function cardExploreLabel(copy, lang) {
  if (copy.researchCardCta) return copy.researchCardCta;
  return lang === "ko" ? "VIEW RESEARCH →" : "VIEW RESEARCH →";
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
    // Local Insights research slugs (market-research/, …) from an insight article detail
    if (pathPrefix === "../../../" && !href.startsWith(".") && !href.startsWith("/") && !/^https?:/i.test(href)) {
      return `../${href}`;
    }
    return href;
  };
  const inquiryHref = fixHref(copy.researchInquiryHref || `${pathPrefix}business/inquiry/#inquiry`);

  const cards = items
    .map((it, i) => {
      const href = escapeHtml(fixHref(it.href || copy.researchHref));
      const title = escapeHtml(it.title || "");
      const tag = escapeHtml(it.tag || "");
      const desc = escapeHtml(itemDesc(it, lang));
      const explore = escapeHtml(cardExploreLabel(copy, lang));
      const n = pad2(i + 1);
      return `<a class="ri-research__card" href="${href}" data-analytics="insights_research_explore" data-item-id="${title}">
        <span class="ri-research__card-top">
          <span class="ri-research__card-n" aria-hidden="true">${n}</span>
          ${tag ? `<span class="ri-research__card-tag">${tag}</span>` : ""}
          <span class="ri-research__card-go" aria-hidden="true">→</span>
        </span>
        <span class="ri-research__card-title">${title}</span>
        ${desc ? `<span class="ri-research__card-desc">${desc}</span>` : ""}
        <span class="ri-research__card-explore">${explore}</span>
      </a>`;
    })
    .join("");

  const inquiryEyebrow = escapeHtml(copy.researchInquiryEyebrow || (ko ? "NEED CUSTOM RESEARCH?" : "NEED CUSTOM RESEARCH?"));
  const inquiryLabel = escapeHtml(
    copy.researchCta || (ko ? "Business Research 문의 →" : "Business Research inquiry →")
  );

  return `<section class="ri-research" data-rs-reveal aria-labelledby="ri-research-title">
  <div class="rs-inner">
    <div class="ri-research__panel ri-research__panel--capabilities">
      <header class="ri-research__intro ri-research__intro--capabilities">
        <p class="ri-research__eyebrow">${escapeHtml(copy.researchEyebrow || "RESEARCH CAPABILITIES")}</p>
        <h2 class="ri-research__title" id="ri-research-title">${br(copy.researchTitle, escapeHtml)}</h2>
        ${copy.researchLead ? `<p class="ri-research__lead">${escapeHtml(copy.researchLead)}</p>` : ""}
      </header>
      <div class="ri-research__grid">${cards}</div>
      <div class="ri-research__inquiry">
        <div class="ri-research__inquiry-copy">
          <p class="ri-research__inquiry-k">${inquiryEyebrow}</p>
          ${copy.researchInquiryLead ? `<p class="ri-research__inquiry-lead">${escapeHtml(copy.researchInquiryLead)}</p>` : ""}
        </div>
        <a class="ri-research__btn ri-research__btn--primary" href="${escapeHtml(inquiryHref)}" data-analytics="business_cta_click">${inquiryLabel}</a>
      </div>
    </div>
  </div>
</section>`;
}
