/**
 * Business services — editorial catalog rows.
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { BUSINESS_SERVICES } from "./business-pricing.mjs";

const CTA_KEYS = {
  mvp: "studio.svcMvpCta",
  website: "studio.svcWebsiteCta",
  ai: "studio.svcAiCta",
  app: "studio.svcAppCta",
  whitelabel: "studio.svcWhitelabelCta",
  improve: "studio.svcImproveCta",
  design: "studio.svcDesignCta",
};

const CTA_TYPES = {
  mvp: "MVP",
  website: "Website",
  ai: "AI",
  app: "App",
  whitelabel: "White-label",
  improve: "Maintenance",
  design: "Design",
};

function metaLine(itemsStr) {
  return String(itemsStr || "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => escapeHtml(s))
    .join('<span class="bz-cat__dot" aria-hidden="true">·</span>');
}

function serviceBlock(svc, flat, flatEn) {
  const title = pick(flat, flatEn, svc.titleKey) || svc.id;
  const desc = pick(flat, flatEn, svc.descKey) || "";
  const items = pick(flat, flatEn, svc.itemsKey) || "";
  const cta = pick(flat, flatEn, CTA_KEYS[svc.id]) || pick(flat, flatEn, "business.ctaInquiry") || "Inquire";
  const type = CTA_TYPES[svc.id] || "Other";

  return `<a class="bz-cat" id="svc-${svc.id}" href="#inquiry" data-inquiry-type="${type}" data-analytics="business_cta_click">
  <span class="bz-cat__n">${svc.num}</span>
  <div class="bz-cat__main">
    <h3 class="bz-cat__title">${escapeHtml(title)}</h3>
    <p class="bz-cat__desc">${escapeHtml(desc)}</p>
    <p class="bz-cat__meta">${metaLine(items)}</p>
  </div>
  <span class="bz-cat__go"><span class="bz-cat__go-label">${escapeHtml(cta)}</span><span class="bz-cat__arrow" aria-hidden="true">→</span></span>
</a>`;
}

export function businessServicesHtml(flat, flatEn) {
  const label = escapeHtml(pick(flat, flatEn, "studio.servicesLabel") || "SERVICES");
  const title = escapeHtml(pick(flat, flatEn, "studio.servicesTitle") || "What we build");
  const lead = escapeHtml(pick(flat, flatEn, "studio.servicesLead") || "");
  const blocks = BUSINESS_SERVICES.map((svc) => serviceBlock(svc, flat, flatEn)).join("\n");

  return `<section id="services" class="bz-section bz-services bz-reveal" aria-labelledby="bz-services-title">
    <div class="bz-inner">
      <header class="bz-sec-head">
        <div class="bz-sec-head__copy">
          <p class="bz-label">${label}</p>
          <h2 class="bz-title" id="bz-services-title">${title}</h2>
        </div>
        <p class="bz-lead bz-sec-head__lead">${lead}</p>
      </header>
      <div class="bz-catalog" role="list">${blocks}</div>
    </div>
  </section>`;
}
