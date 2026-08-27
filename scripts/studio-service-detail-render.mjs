/**
 * Render Studio service detail body — Business service design system (bs-*).
 */
import { escapeHtml } from "./hub-utils.mjs";
import {
  formatStudioPriceDisplay,
  formatStudioTimelineDisplay,
  studioInquiryHref,
  studioServiceDetailHrefFromPillar,
  studioPillarPricingNote,
} from "./studio-pricing.mjs";
import { getStudioServiceDetail, listStudioDetailSlugs } from "./studio-service-detail-data.mjs";
import { studioHeroVisual } from "./studio-bs-visuals.mjs";

const NAV_LABELS = {
  "brand-strategy": "STRATEGY",
  naming: "NAMING",
  identity: "IDENTITY",
  "logo-design": "LOGO",
  "web-design": "WEB",
  "app-ui-ux": "APP",
  "landing-page-design": "LANDING",
  "product-design": "PRODUCT",
  "social-content": "SOCIAL",
  campaign: "CAMPAIGN",
  "visual-content": "VISUAL",
  "character-lab": "LAB",
  "digital-stickers": "STICKERS",
  "newon-character": "NEWON",
  "experimental-ip": "EXP IP",
};

const DEFAULT_PRICE_FACTORS = {
  brand: {
    ko: ["브랜드·제품 복잡도", "리서치 깊이", "납품 문서 범위", "수정 라운드", "추가 언어·채널"],
    en: ["Brand/product complexity", "Research depth", "Deliverable scope", "Revision rounds", "Extra languages/channels"],
  },
  digital: {
    ko: ["페이지·화면 수", "와이어프레임 깊이", "반응형 범위", "컴포넌트·DS 포함 여부", "프로토타입 수준"],
    en: ["Page/screen count", "Wireframe depth", "Responsive scope", "Components / design system", "Prototype level"],
  },
  content: {
    ko: ["채널 수", "템플릿·에셋 개수", "카피·비주얼 범위", "캠페인 기간", "월간 운영 포함 여부"],
    en: ["Channel count", "Template/asset count", "Copy/visual scope", "Campaign duration", "Monthly ops included"],
  },
  ip: {
    ko: ["캐릭터·세계관 깊이", "표정·변형 수", "실험 범위", "확장 가능성 검토", "후속 제작 연계"],
    en: ["Character/world depth", "Expression/variant count", "Experiment scope", "Expansion review", "Follow-on production"],
  },
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function brHeadline(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function processLayoutCols(count) {
  return Math.max(2, Math.ceil(count / 2));
}

function hasInquiry(detail) {
  return detail.pageKind !== "comingSoon" && detail.pageKind !== "internal";
}

function breadcrumb(detail) {
  const studio = escapeHtml(detail.ui.crumbStudio);
  const category = escapeHtml(detail.categoryLabel);
  const current = escapeHtml(detail.displayName);
  return `<nav class="bs-crumb" aria-label="Breadcrumb">
    <div class="bs-inner">
      <a href="../../">${studio}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <a href="../">${category}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <span>${current}</span>
    </div>
  </nav>`;
}

function serviceNav(detail) {
  const siblings = detail.siblingSlugs || [];
  if (siblings.length < 2) return "";
  const links = siblings
    .map((slug) => {
      const peer = getStudioServiceDetail(slug, detail._pageLang);
      if (!peer) return "";
      const label = escapeHtml(NAV_LABELS[slug] || peer.displayName);
      const isActive = slug === detail.slug;
      const cls = isActive ? "bs-nav__link is-active" : "bs-nav__link";
      const href = isActive ? "#" : `../${studioServiceDetailHrefFromPillar(slug)}`;
      return `<a class="${cls}" href="${href}"${isActive ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");
  return `<nav class="bs-nav" aria-label="Studio services"><div class="bs-inner bs-nav__inner"><p class="bs-nav__label">SERVICES</p><div class="bs-nav__track">${links}</div></div></nav>`;
}

function metaRows(detail) {
  const lang = detail._pageLang;
  const price = formatStudioPriceDisplay(detail.slug, lang);
  const timeline = formatStudioTimelineDisplay(detail.slug, lang);
  const rows = [];

  rows.push({ k: "SERVICE", v: detail.displayName.replace(/^NEWON STUDIO · /, "") });

  if (detail.typeLabel) rows.push({ k: "TYPE", v: detail.typeLabel });
  if (detail.statusLabel && detail.pageKind !== "service") rows.push({ k: "STATUS", v: detail.statusLabel });
  if (timeline) rows.push({ k: detail.ui.timeline.toUpperCase(), v: timeline });
  if (price) {
    rows.push({ k: detail.ui.startingAt.toUpperCase(), v: price });
  } else if (detail.pageKind === "exploring") {
    rows.push({ k: lang === "ko" ? "견적" : "QUOTE", v: lang === "ko" ? "별도 견적" : "Custom Quote" });
  }

  return rows
    .map(
      (m) =>
        `<div class="bs-dr-meta__row"><p class="bs-dr-meta__k">${escapeHtml(m.k)}</p><p class="bs-dr-meta__v">${escapeHtml(m.v)}</p></div>`
    )
    .join("");
}

function overviewBodyHtml(body) {
  if (!body) return "";
  if (Array.isArray(body)) {
    return `<div class="bs-overview">${body
      .map((p, i) => `<p class="${i === 0 ? "bs-lead" : ""}">${escapeHtml(p)}</p>`)
      .join("")}</div>`;
  }
  return `<div class="bs-overview"><p class="bs-lead">${escapeHtml(String(body)).replace(/\n/g, "<br />")}</p></div>`;
}

function overviewSection(detail) {
  if (!detail.overview) return "";
  const title = detail.overview.title || detail.ui.overviewTitle;
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-overview-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(detail.ui.overview)}</p>
          <h2 class="bs-title" id="bs-ss-overview-title">${brHeadline(title)}</h2>
          ${overviewBodyHtml(detail.overview.body)}
        </div>
        <aside class="bs-dr-meta" aria-label="Service summary">${metaRows(detail)}</aside>
      </div>
    </div></section>`;
}

function areasHtml(items, modifier = "") {
  if (!items?.length) return "";
  const mod = modifier ? ` bs-areas--${modifier}` : "";
  return `<div class="bs-areas${mod}">${items
    .map((item, i) => {
      const title = typeof item === "string" ? item : item.t;
      const body = typeof item === "string" ? "" : item.d || "";
      return `<article class="bs-areas__item"><span class="bs-areas__n">${pad2(i + 1)}</span><h3>${escapeHtml(title)}</h3>${body ? `<p>${escapeHtml(body).replace(/\n/g, "<br />")}</p>` : ""}</article>`;
    })
    .join("")}</div>`;
}

function problemsSection(detail) {
  if (!detail.problems?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-problems-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.problems)}</p>
      <h2 class="bs-title" id="bs-ss-problems-title">${brHeadline(detail.ui.problemsTitle)}</h2>
      ${areasHtml(detail.problems)}
    </div></section>`;
}

function whatWeDoSection(detail) {
  if (!detail.whatWeDo?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-what-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.whatWeDo)}</p>
      <h2 class="bs-title" id="bs-ss-what-title">${brHeadline(detail.ui.whatWeDoTitle)}</h2>
      ${areasHtml(detail.whatWeDo)}
    </div></section>`;
}

function useCasesSection(detail) {
  if (!detail.useCases?.length) return "";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-use-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.useCases)}</p>
      <h2 class="bs-title" id="bs-ss-use-title">${brHeadline(detail.ui.useCasesTitle)}</h2>
      ${areasHtml(detail.useCases, "quad")}
    </div></section>`;
}

function tagChips(items) {
  if (!items?.length) return "";
  return `<div class="bs-chips">${items.map((t) => `<span class="bs-chips__item">${escapeHtml(t)}</span>`).join("")}</div>`;
}

function includedSection(detail) {
  if (!detail.included?.length) return "";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-included-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.included)}</p>
      <h2 class="bs-title" id="bs-ss-included-title">${brHeadline(detail.ui.includedTitle)}</h2>
      ${tagChips(detail.included)}
    </div></section>`;
}

function deliverGridHtml(items) {
  if (!items?.length) return "";
  return `<div class="bs-deliver-grid">${items
    .map((t, i) => {
      const title = typeof t === "string" ? t : t.title || t.t || "";
      const body = typeof t === "object" ? t.body || t.d || "" : "";
      return `<article class="bs-deliver-grid__item"><span class="bs-deliver-grid__n">${pad2(i + 1)}</span><h3>${escapeHtml(title)}</h3>${body ? `<p>${escapeHtml(body)}</p>` : ""}</article>`;
    })
    .join("")}</div>`;
}

function deliverablesSection(detail) {
  if (!detail.deliverables?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-deliver-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.deliverables)}</p>
      <h2 class="bs-title" id="bs-ss-deliver-title">${brHeadline(detail.ui.deliverablesTitle)}</h2>
      <p class="bs-lead">${escapeHtml(detail.ui.deliverablesLead)}</p>
      ${deliverGridHtml(detail.deliverables)}
    </div></section>`;
}

function flowStageGridHtml(steps) {
  if (!steps?.length) return "";
  const cols = processLayoutCols(steps.length);
  const cards = steps
    .map(
      (s, i) =>
        `<article class="bs-flow-stage-grid__item"><span class="bs-flow-stage-grid__n">${pad2(i + 1)}</span><h3>${escapeHtml(s.t)}</h3><p>${escapeHtml(s.d || "")}</p></article>`
    )
    .join("");
  return `<div class="bs-flow-stage-grid" data-cols="${cols}">${cards}</div>`;
}

function processSection(detail) {
  if (!detail.process?.length) return "";
  return `<section class="bs-section" data-bs-reveal id="process" aria-labelledby="bs-ss-process-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.process)}</p>
      <h2 class="bs-title" id="bs-ss-process-title">${brHeadline(detail.ui.processTitle)}</h2>
      ${flowStageGridHtml(detail.process)}
    </div></section>`;
}

function whoList(items) {
  return `<ol class="bs-who">${items
    .map(
      (t, i) =>
        `<li class="bs-who__item"><span class="bs-who__n">${pad2(i + 1)}</span><p class="bs-who__t">${escapeHtml(t)}</p></li>`
    )
    .join("")}</ol>`;
}

function whoSection(detail) {
  if (!detail.bestFor?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-who-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.who)}</p>
      <h2 class="bs-title" id="bs-ss-who-title">${brHeadline(detail.ui.whoTitle)}</h2>
      ${whoList(detail.bestFor)}
    </div></section>`;
}

function optionalSection(detail) {
  if (!detail.optionalScope?.length) return "";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-optional-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.optional)}</p>
      <h2 class="bs-title" id="bs-ss-optional-title">${brHeadline(detail.ui.optionalTitle)}</h2>
      ${tagChips(detail.optionalScope)}
    </div></section>`;
}

function priceFactorsFor(detail) {
  if (detail.priceFactors?.length) return detail.priceFactors;
  const defaults = DEFAULT_PRICE_FACTORS[detail.category];
  return defaults?.[detail._pageLang] || defaults?.en || [];
}

function priceSection(detail) {
  if (detail.pageKind === "comingSoon" || detail.pageKind === "internal") return "";
  const lang = detail._pageLang;
  const price = formatStudioPriceDisplay(detail.slug, lang);
  const timeline = formatStudioTimelineDisplay(detail.slug, lang);
  if (!price && !timeline) return "";

  const note = studioPillarPricingNote(detail.category, lang);
  const factors = priceFactorsFor(detail);

  const timelineHtml = timeline
    ? `<div class="bs-price-tiers"><article class="bs-price-tiers__item"><span class="bs-price-tiers__n">01</span><h3 class="bs-price-tiers__title">${escapeHtml(detail.ui.timeline)}</h3><p class="bs-price-tiers__meta">${escapeHtml(timeline)}</p></article></div>`
    : "";

  const priceHtml = price
    ? `<div class="bs-price">
      <div class="bs-price__panel">
        <p class="bs-price__name">${escapeHtml(detail.displayName)}</p>
        <p class="bs-price__value">${escapeHtml(price)}</p>
        <p class="bs-price__note">${escapeHtml(note)}</p>
      </div>
      ${
        factors.length
          ? `<div class="bs-price__detail">
        <p class="bs-eyebrow">${escapeHtml(detail.ui.priceFactorsLabel)}</p>
        <ul class="bs-price__factors">${factors.map((f) => `<li class="bs-price__factor"><span class="bs-price__factor-k">${escapeHtml(f)}</span></li>`).join("")}</ul>
      </div>`
          : ""
      }
    </div>`
    : "";

  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-price-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.timelinePrice)}</p>
      <h2 class="bs-title" id="bs-ss-price-title">${brHeadline(detail.ui.priceTitle)}</h2>
      ${timelineHtml}
      ${priceHtml}
    </div></section>`;
}

function developmentSection(detail) {
  const cta = detail.developmentCta;
  if (!cta) return "";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-dev-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(detail.ui.developmentNeeded)}</p>
          <h2 class="bs-title" id="bs-ss-dev-title">${escapeHtml(cta.title)}</h2>
          <p class="bs-lead">${escapeHtml(cta.body)}</p>
          <div class="bs-hero__actions">
            <a class="bs-btn bs-btn--ghost" href="${escapeHtml(cta.href)}">${escapeHtml(cta.label)}</a>
          </div>
        </div>
      </div>
    </div></section>`;
}

function noticesSection(detail) {
  if (!detail.notices?.length) return "";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-notices-title"><div class="bs-inner">
      ${detail.notices.map((n) => `<p class="bs-note">${escapeHtml(n)}</p>`).join("")}
    </div></section>`;
}

function faqHtml(faqs) {
  return `<div class="bs-faq">${faqs
    .map(
      (f, i) => `<div class="bs-faq-item">
      <button type="button" class="bs-faq-q" aria-expanded="false" id="bs-faq-q-${i}" aria-controls="bs-faq-a-${i}">
        <span>${escapeHtml(f.q)}</span><span class="bs-faq-icon" aria-hidden="true"></span>
      </button>
      <div class="bs-faq-a" id="bs-faq-a-${i}" role="region" aria-labelledby="bs-faq-q-${i}"><div><p>${escapeHtml(f.a)}</p></div></div>
    </div>`
    )
    .join("")}</div>`;
}

function faqSection(detail) {
  if (!detail.faqs?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-faq-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.faq)}</p>
      <h2 class="bs-title" id="bs-ss-faq-title">${escapeHtml(detail.ui.faqTitle)}</h2>
      ${faqHtml(detail.faqs)}
    </div></section>`;
}

function exploreSection(detail) {
  const siblings = (detail.siblingSlugs || []).filter((s) => s !== detail.slug);
  if (siblings.length < 1) return "";
  const cards = siblings
    .map((slug) => {
      const peer = getStudioServiceDetail(slug, detail._pageLang);
      if (!peer) return "";
      const href = `../${studioServiceDetailHrefFromPillar(slug)}`;
      const price = formatStudioPriceDisplay(slug, detail._pageLang);
      const tag = peer.statusLabel && peer.pageKind !== "service" ? peer.statusLabel : price || peer.categoryLabel;
      return `<a class="bs-related__link" href="${escapeHtml(href)}">
        <span><span class="bs-related__kicker">${escapeHtml(peer.categoryLabel)}</span><span class="bs-related__name">${escapeHtml(peer.displayName)}</span></span>
        <span class="bs-related__go" aria-hidden="true">${escapeHtml(tag)} →</span>
      </a>`;
    })
    .join("");
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-explore-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.explore)}</p>
      <h2 class="bs-title" id="bs-ss-explore-title">${brHeadline(detail.ui.exploreTitle)}</h2>
      <p class="bs-lead">${escapeHtml(detail.ui.exploreLead)}</p>
      <div class="bs-related">${cards}</div>
    </div></section>`;
}

function adjacentSection(detail) {
  const siblings = detail.siblingSlugs || [];
  const idx = siblings.indexOf(detail.slug);
  if (idx < 0 || siblings.length < 2) return "";

  const prevSlug = idx > 0 ? siblings[idx - 1] : null;
  const nextSlug = idx < siblings.length - 1 ? siblings[idx + 1] : null;

  let prevBlock = `<span class="bs-adjacent__link bs-adjacent__link--prev is-empty"></span>`;
  let nextBlock = `<span class="bs-adjacent__link bs-adjacent__link--next is-empty"></span>`;

  if (prevSlug) {
    const peer = getStudioServiceDetail(prevSlug, detail._pageLang);
    prevBlock = `<a class="bs-adjacent__link bs-adjacent__link--prev" href="../${studioServiceDetailHrefFromPillar(prevSlug)}">
      <span class="bs-adjacent__label">${escapeHtml(detail.ui.prevService)}</span>
      <span class="bs-adjacent__name">${escapeHtml(peer?.displayName || prevSlug)}</span>
    </a>`;
  }
  if (nextSlug) {
    const peer = getStudioServiceDetail(nextSlug, detail._pageLang);
    nextBlock = `<a class="bs-adjacent__link bs-adjacent__link--next" href="../${studioServiceDetailHrefFromPillar(nextSlug)}">
      <span class="bs-adjacent__label">${escapeHtml(detail.ui.nextService)}</span>
      <span class="bs-adjacent__name">${escapeHtml(peer?.displayName || nextSlug)}</span>
    </a>`;
  }

  return `<section class="bs-section bs-adjacent" data-bs-reveal aria-label="Adjacent services">
    <div class="bs-inner bs-adjacent__grid">${prevBlock}${nextBlock}</div>
  </section>`;
}

function heroSubEyebrow(detail) {
  if (detail.typeLabel) return detail.typeLabel;
  if (detail.statusLabel && detail.pageKind !== "service") return detail.statusLabel;
  return NAV_LABELS[detail.slug] || "";
}

function heroSection(detail, inquiryHref) {
  const sub = heroSubEyebrow(detail);
  const eyebrow = sub
    ? `${escapeHtml(detail.eyebrow)}<span class="bs-eyebrow__sep" aria-hidden="true">·</span><span class="bs-eyebrow__sub">${escapeHtml(sub)}</span>`
    : escapeHtml(detail.eyebrow);

  let actions = "";
  if (hasInquiry(detail)) {
    const primaryLabel =
      detail.pageKind === "exploring"
        ? detail._pageLang === "ko"
          ? "IP 프로젝트 문의 →"
          : "IP project inquiry →"
        : detail.ui.ctaBtn;
    const secondaryHref = detail.process?.length ? "#process" : detail.overview ? "#bs-ss-overview-title" : "#";
    const secondaryLabel = detail.process?.length
      ? detail._pageLang === "ko"
        ? "프로세스 보기 ↓"
        : "View process ↓"
      : detail._pageLang === "ko"
        ? "개요 보기 ↓"
        : "View overview ↓";
    actions = `<div class="bs-hero__actions">
        <a class="bs-btn bs-btn--primary" href="${escapeHtml(inquiryHref)}" data-bs-cta="hero_primary" data-analytics="studio_service_cta_click">${escapeHtml(primaryLabel)}</a>
        <a class="bs-btn bs-btn--ghost" href="${secondaryHref}" data-bs-cta="hero_secondary">${escapeHtml(secondaryLabel)}</a>
      </div>`;
  } else if (detail.altCtas?.length) {
    actions = `<div class="bs-hero__actions">${detail.altCtas
      .map(
        (c, i) =>
          `<a class="bs-btn${i === 0 ? " bs-btn--primary" : " bs-btn--ghost"}" href="${escapeHtml(c.href)}">${escapeHtml(c.label)}</a>`
      )
      .join("")}</div>`;
  }

  return `<section class="bs-hero" data-bs-reveal aria-labelledby="bs-hero-title">
  <div class="bs-inner bs-hero__grid">
    <div>
      <p class="bs-eyebrow">${eyebrow}</p>
      <h1 class="bs-hero__title" id="bs-hero-title">${brHeadline(detail.headline)}</h1>
      <p class="bs-hero__lead">${escapeHtml(detail.description)}</p>
      ${actions}
    </div>
    ${studioHeroVisual(detail.slug)}
  </div>
</section>`;
}

function finalSection(detail, inquiryHref) {
  if (!hasInquiry(detail)) {
    if (!detail.altCtas?.length) return "";
    return `<section class="bs-section bs-section--dark bs-final" data-bs-reveal aria-labelledby="bs-final-title"><div class="bs-inner">
      <div class="bs-hero__actions">${detail.altCtas
        .map(
          (c, i) =>
            `<a class="bs-btn${i === 0 ? " bs-btn--primary" : " bs-btn--ghost"}" href="${escapeHtml(c.href)}">${escapeHtml(c.label)}</a>`
        )
        .join("")}</div>
    </div></section>`;
  }

  const primaryLabel =
    detail.pageKind === "exploring"
      ? detail._pageLang === "ko"
        ? "IP 프로젝트 문의 →"
        : "IP project inquiry →"
      : detail.ui.ctaBtn;

  return `<section class="bs-section bs-section--dark bs-final" data-bs-reveal aria-labelledby="bs-final-title"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(detail.ui.ctaEyebrow)}</p>
    <h2 class="bs-final__title" id="bs-final-title">${brHeadline(detail.ui.ctaTitle)}</h2>
    <p class="bs-lead">${escapeHtml(detail.ui.ctaLead)}</p>
    <div class="bs-hero__actions">
      <a class="bs-btn bs-btn--primary" href="${escapeHtml(inquiryHref)}" data-bs-cta="final" data-analytics="studio_service_cta_click">${escapeHtml(primaryLabel)}</a>
      <a class="bs-btn bs-btn--ghost" href="../../">${detail._pageLang === "ko" ? "Studio 둘러보기 →" : "Explore Studio →"}</a>
    </div>
  </div></section>`;
}

/**
 * @param {string} slug
 * @param {'ko'|'en'} lang
 */
export function renderStudioServiceDetailBody(slug, lang = "ko") {
  const detail = getStudioServiceDetail(slug, lang);
  if (!detail) return "";

  const inquiryHref = hasInquiry(detail) ? studioInquiryHref(slug, "../../../business/inquiry/") : "";

  return `${breadcrumb(detail)}
${heroSection(detail, inquiryHref)}
${serviceNav(detail)}
${overviewSection(detail)}
${problemsSection(detail)}
${whatWeDoSection(detail)}
${useCasesSection(detail)}
${includedSection(detail)}
${deliverablesSection(detail)}
${processSection(detail)}
${whoSection(detail)}
${optionalSection(detail)}
${priceSection(detail)}
${developmentSection(detail)}
${noticesSection(detail)}
${faqSection(detail)}
${exploreSection(detail)}
${adjacentSection(detail)}
${finalSection(detail, inquiryHref)}`;
}

export { listStudioDetailSlugs, getStudioServiceDetail };
