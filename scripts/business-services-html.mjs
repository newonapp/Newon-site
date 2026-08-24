/**
 * Business services 01–07 — varied layouts for conversion page.
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

function itemsList(itemsStr) {
  return String(itemsStr || "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join("");
}

function serviceBlock(svc, flat, flatEn, layout) {
  const title = pick(flat, flatEn, svc.titleKey) || svc.id;
  const desc = pick(flat, flatEn, svc.descKey) || "";
  const items = pick(flat, flatEn, svc.itemsKey) || "";
  const cta = pick(flat, flatEn, CTA_KEYS[svc.id]) || pick(flat, flatEn, "business.ctaInquiry") || "Inquire";
  const type = CTA_TYPES[svc.id] || "Other";

  if (layout === "split") {
    return `<article class="bz-svc bz-svc--split" id="svc-${svc.id}">
      <div class="bz-svc__head">
        <span class="bz-svc__num">${svc.num}</span>
        <h3 class="bz-svc__title">${escapeHtml(title)}</h3>
        <p class="bz-svc__desc">${escapeHtml(desc)}</p>
      </div>
      <ul class="bz-svc__list">${itemsList(items)}</ul>
      <a class="btn btn-ghost bz-svc__cta" href="#inquiry" data-inquiry-type="${type}" data-analytics="business_cta_click">${escapeHtml(cta)}</a>
    </article>`;
  }

  if (layout === "stack") {
    return `<article class="bz-svc bz-svc--stack" id="svc-${svc.id}">
      <span class="bz-svc__num">${svc.num}</span>
      <h3 class="bz-svc__title">${escapeHtml(title)}</h3>
      <p class="bz-svc__desc">${escapeHtml(desc)}</p>
      <ul class="bz-svc__tags">${itemsList(items).replace(/<\/?li>/g, (m) => (m === "<li>" ? '<span class="bz-svc__tag">' : "</span>"))}</ul>
      <a class="btn btn-primary bz-svc__cta" href="#inquiry" data-inquiry-type="${type}" data-analytics="business_cta_click">${escapeHtml(cta)}</a>
    </article>`;
  }

  return `<article class="bz-svc bz-svc--row" id="svc-${svc.id}">
    <div class="bz-svc__row-main">
      <span class="bz-svc__num">${svc.num}</span>
      <div>
        <h3 class="bz-svc__title">${escapeHtml(title)}</h3>
        <p class="bz-svc__desc">${escapeHtml(desc)}</p>
        <ul class="bz-svc__list bz-svc__list--inline">${itemsList(items)}</ul>
      </div>
    </div>
    <a class="btn btn-ghost bz-svc__cta" href="#inquiry" data-inquiry-type="${type}" data-analytics="business_cta_click">${escapeHtml(cta)}</a>
  </article>`;
}

const LAYOUTS = ["split", "row", "stack", "split", "row", "stack", "split"];

export function businessServicesHtml(flat, flatEn) {
  const label = escapeHtml(pick(flat, flatEn, "studio.servicesLabel") || "SERVICES");
  const title = escapeHtml(pick(flat, flatEn, "studio.servicesTitle") || "What we build");
  const lead = escapeHtml(pick(flat, flatEn, "studio.servicesLead") || "");
  const blocks = BUSINESS_SERVICES.map((svc, i) => serviceBlock(svc, flat, flatEn, LAYOUTS[i] || "row")).join("\n");

  return `<section id="services" class="bz-section bz-services bz-reveal" aria-labelledby="bz-services-title">
    <div class="bz-inner">
      <p class="bz-label">${label}</p>
      <h2 class="bz-title" id="bz-services-title">${title}</h2>
      <p class="bz-lead">${lead}</p>
      <div class="bz-services__grid">${blocks}</div>
    </div>
  </section>`;
}
