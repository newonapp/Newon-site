/**
 * Render Studio service detail body — Business service design system (bs-*).
 * Content-driven only; do not invent new visual components.
 */
import { escapeHtml } from "./hub-utils.mjs";
import {
  formatStudioPriceDisplay,
  formatStudioTimelineDisplay,
  studioInquiryHref,
  studioServiceDetailHrefFromPillar,
  studioPillarPricingNote,
  STUDIO_PILLAR_SERVICE_SLUGS,
  STUDIO_SERVICE_PRICING,
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

/** Hero eyebrow service names (NEWON STUDIO · CATEGORY · NAME). */
const EYEBROW_SUB = {
  "brand-strategy": "BRAND STRATEGY",
  naming: "NAMING",
  identity: "IDENTITY",
  "logo-design": "LOGO DESIGN",
  "web-design": "WEB DESIGN",
  "app-ui-ux": "APP UI/UX",
  "landing-page-design": "LANDING PAGE",
  "product-design": "PRODUCT DESIGN",
  "social-content": "SOCIAL CONTENT",
  campaign: "CAMPAIGN",
  "visual-content": "VISUAL CONTENT",
  "character-lab": "CHARACTER LAB",
  "digital-stickers": "DIGITAL STICKERS",
  "newon-character": "NEWON CHARACTER",
  "experimental-ip": "EXPERIMENTAL IP",
};

/** All Studio services in menu order (Brand → Digital → Content → IP). */
const STUDIO_NAV_SLUGS = [
  ...(STUDIO_PILLAR_SERVICE_SLUGS.brand || []),
  ...(STUDIO_PILLAR_SERVICE_SLUGS.digital || []),
  ...(STUDIO_PILLAR_SERVICE_SLUGS.content || []),
  ...(STUDIO_PILLAR_SERVICE_SLUGS.ip || []),
];

/** Relative href from one Studio detail page to another (same or cross-pillar). */
function studioNavHref(fromSlug, toSlug) {
  if (fromSlug === toSlug) return "#";
  const from = STUDIO_SERVICE_PRICING[fromSlug];
  const to = STUDIO_SERVICE_PRICING[toSlug];
  if (!from?.detailSegment || !to?.detailSegment) return "#";
  if (from.category === to.category) return `../${to.detailSegment}/`;
  return `../../${to.category}/${to.detailSegment}/`;
}

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

function proseParas(textOrArr, leadClass = "bs-lead") {
  const parts = Array.isArray(textOrArr) ? textOrArr : textOrArr ? [textOrArr] : [];
  return parts
    .map((p, i) => {
      const cls = i === 0 ? leadClass : "";
      return `<p class="${cls}">${escapeHtml(String(p)).replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}

function processLayoutCols(count) {
  const n = Number(count) || 0;
  if (n <= 1) return 1;
  // Prefer a column count that fills the last row (no empty gray cells).
  const candidates = [5, 4, 3, 2].filter((c) => c <= n);
  let best = 3;
  let bestEmpty = n;
  for (const c of candidates) {
    const empty = (c - (n % c)) % c;
    if (empty < bestEmpty || (empty === bestEmpty && c === n)) {
      best = c;
      bestEmpty = empty;
    }
  }
  return best;
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
  const links = STUDIO_NAV_SLUGS.map((slug) => {
    const peer = getStudioServiceDetail(slug, detail._pageLang);
    if (!peer) return "";
    const label = escapeHtml(NAV_LABELS[slug] || peer.displayName);
    const isActive = slug === detail.slug;
    const cls = isActive ? "bs-nav__link is-active" : "bs-nav__link";
    const href = studioNavHref(detail.slug, slug);
    return `<a class="${cls}" href="${href}"${isActive ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");
  return `<nav class="bs-nav" aria-label="Studio services"><div class="bs-inner bs-nav__inner"><p class="bs-nav__label">SERVICES</p><div class="bs-nav__track">${links}</div></div></nav>`;
}

function metaRows(detail) {
  const lang = detail._pageLang;
  const price = formatStudioPriceDisplay(detail.slug, lang);
  const timeline = formatStudioTimelineDisplay(detail.slug, lang);
  const rows = [];

  rows.push({ k: "SERVICE", v: detail.displayName });
  rows.push({ k: "CATEGORY", v: detail.categoryLabel });

  if (detail.typeLabel) rows.push({ k: "TYPE", v: detail.typeLabel });
  if (detail.statusLabel && detail.pageKind !== "service") rows.push({ k: "STATUS", v: detail.statusLabel });
  if (price) rows.push({ k: "STARTING AT", v: price });
  if (timeline) rows.push({ k: "TIMELINE", v: timeline });
  if (!price && detail.pageKind === "exploring") {
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
      .map((p, i) => `<p class="${i === 0 ? "bs-lead" : ""}">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
      .join("")}</div>`;
  }
  return `<div class="bs-overview"><p class="bs-lead">${escapeHtml(String(body)).replace(/\n/g, "<br />")}</p></div>`;
}

function overviewSection(detail) {
  if (!detail.overview) return "";
  const title = detail.overview.title || detail.ui.overviewTitle;
  const criteriaLead = detail.overview.criteriaLead
    ? `<p class="bs-lead">${escapeHtml(detail.overview.criteriaLead)}</p>`
    : "";
  const criteria = tagChips(detail.overview.criteria);
  const summary = detail.summaryNote
    ? `<p class="bs-note">${escapeHtml(detail.summaryNote)}</p>`
    : "";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-overview-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(detail.ui.overview)}</p>
          <h2 class="bs-title" id="bs-ss-overview-title">${brHeadline(title)}</h2>
          ${overviewBodyHtml(detail.overview.body)}
          ${criteriaLead}
          ${criteria}
        </div>
        <aside class="bs-dr-meta" aria-label="Service summary">${metaRows(detail)}${summary}</aside>
      </div>
    </div></section>`;
}

/** Seam grid used across Studio detail body (who / what / deliverables / etc.). */
function getGridHtml(items, variant = "board") {
  if (!items?.length) return "";
  const mod = variant ? ` bs-get--${variant}` : "";
  return `<div class="bs-get${mod}" data-count="${items.length}" data-variant="${escapeHtml(variant)}">${items
    .map((item, i) => {
      const title = typeof item === "string" ? item : item.t || item.title || "";
      const body = typeof item === "string" ? "" : item.d || item.body || "";
      const prose = body
        ? `<p>${escapeHtml(body).replace(/\n{2,}/g, "\n").replace(/\n/g, "<br />")}</p>`
        : "";
      return `<article class="bs-get__item"><span class="bs-get__n" aria-hidden="true">${pad2(i + 1)}</span><div class="bs-get__copy"><h3>${escapeHtml(title)}</h3>${prose}</div></article>`;
    })
    .join("")}</div>`;
}

function areasHtml(items, variant = "board") {
  return getGridHtml(items, variant);
}

function problemsSection(detail) {
  if (!detail.problems?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-part="problems" data-bs-reveal aria-labelledby="bs-ss-problems-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.problemsLabel || detail.ui.problems)}</p>
      <h2 class="bs-title" id="bs-ss-problems-title">${brHeadline(detail.problemsTitle || detail.ui.problemsTitle)}</h2>
      ${areasHtml(detail.problems, "signal")}
    </div></section>`;
}

function principlesSection(detail) {
  if (!detail.principles?.length) return "";
  return `<section class="bs-section" data-bs-part="principles" data-bs-reveal aria-labelledby="bs-ss-principles-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.principlesLabel || "PRINCIPLES")}</p>
      <h2 class="bs-title" id="bs-ss-principles-title">${brHeadline(detail.principlesTitle || "")}</h2>
      ${detail.principlesLead ? `<p class="bs-lead">${escapeHtml(detail.principlesLead)}</p>` : ""}
      ${areasHtml(detail.principles, "axiom")}
    </div></section>`;
}

function directionsSection(detail) {
  if (!detail.directions?.length) return "";
  return `<section class="bs-section" data-bs-part="directions" data-bs-reveal aria-labelledby="bs-ss-directions-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.directionsLabel || "NAMING DIRECTIONS")}</p>
      <h2 class="bs-title" id="bs-ss-directions-title">${brHeadline(detail.directionsTitle || "")}</h2>
      ${detail.directionsLead ? `<p class="bs-lead">${escapeHtml(detail.directionsLead).replace(/\n/g, "<br />")}</p>` : ""}
      ${areasHtml(detail.directions, "board")}
      ${detail.directionsNote ? `<p class="bs-note">${escapeHtml(detail.directionsNote)}</p>` : ""}
    </div></section>`;
}

function whoSection(detail) {
  if (!detail.bestFor?.length) return "";
  const first = detail.bestFor[0];
  const asCards = typeof first === "object" && first && (first.t || first.d);
  return `<section class="bs-section bs-section--surface" data-bs-part="who" data-bs-reveal aria-labelledby="bs-ss-who-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.who)}</p>
      <h2 class="bs-title" id="bs-ss-who-title">${brHeadline(detail.whoTitle || detail.ui.whoTitle)}</h2>
      ${
        asCards
          ? getGridHtml(detail.bestFor, "who")
          : `<ol class="bs-who">${detail.bestFor
              .map(
                (t, i) =>
                  `<li class="bs-who__item"><span class="bs-who__n">${pad2(i + 1)}</span><p class="bs-who__t">${escapeHtml(t)}</p></li>`
              )
              .join("")}</ol>`
      }
    </div></section>`;
}

function whatWeDoSection(detail) {
  if (!detail.whatWeDo?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-part="what" data-bs-reveal aria-labelledby="bs-ss-what-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.whatWeDo)}</p>
      <h2 class="bs-title" id="bs-ss-what-title">${brHeadline(detail.whatWeDoTitle || detail.ui.whatWeDoTitle)}</h2>
      ${areasHtml(detail.whatWeDo, "what")}
    </div></section>`;
}

function useCasesSection(detail) {
  if (!detail.useCases?.length) return "";
  return `<section class="bs-section" data-bs-part="usecases" data-bs-reveal aria-labelledby="bs-ss-use-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.useCasesLabel || detail.ui.useCases)}</p>
      <h2 class="bs-title" id="bs-ss-use-title">${brHeadline(detail.useCasesTitle || detail.ui.useCasesTitle)}</h2>
      ${detail.useCasesLead ? `<p class="bs-lead">${escapeHtml(detail.useCasesLead).replace(/\n/g, "<br />")}</p>` : ""}
      ${areasHtml(detail.useCases, "board")}
      ${detail.useCasesNote ? `<p class="bs-note">${escapeHtml(detail.useCasesNote)}</p>` : ""}
    </div></section>`;
}

function compareSection(detail) {
  if (!detail.compare?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-part="compare" data-bs-reveal aria-labelledby="bs-ss-compare-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.compareLabel || "BEFORE → AFTER")}</p>
      <h2 class="bs-title" id="bs-ss-compare-title">${brHeadline(detail.compareTitle || "")}</h2>
      ${detail.compareLead ? `<p class="bs-lead">${escapeHtml(detail.compareLead)}</p>` : ""}
      ${areasHtml(detail.compare, "compare")}
    </div></section>`;
}

function checksSection(detail) {
  if (!detail.checks?.length) return "";
  return `<section class="bs-section" data-bs-part="checks" data-bs-reveal aria-labelledby="bs-ss-checks-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.checksLabel || "DIGITAL CHECK")}</p>
      <h2 class="bs-title" id="bs-ss-checks-title">${brHeadline(detail.checksTitle || "")}</h2>
      ${detail.checksLead ? `<p class="bs-lead">${escapeHtml(detail.checksLead).replace(/\n/g, "<br />")}</p>` : ""}
      ${areasHtml(detail.checks, "axiom")}
      ${detail.checksNote ? `<p class="bs-note">${escapeHtml(detail.checksNote)}</p>` : ""}
    </div></section>`;
}

function versusSection(detail) {
  if (!detail.versus?.length) return "";
  return `<section class="bs-section" data-bs-part="versus" data-bs-reveal aria-labelledby="bs-ss-versus-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.versusLabel || "LOGO vs IDENTITY")}</p>
      <h2 class="bs-title" id="bs-ss-versus-title">${brHeadline(detail.versusTitle || "")}</h2>
      ${detail.versusLead ? `<p class="bs-lead">${escapeHtml(detail.versusLead).replace(/\n/g, "<br />")}</p>` : ""}
      ${areasHtml(detail.versus, "compare")}
      ${detail.versusNote ? `<p class="bs-note">${escapeHtml(detail.versusNote)}</p>` : ""}
    </div></section>`;
}

function conceptFlowSection(detail) {
  if (!detail.conceptFlow?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-part="concept" data-bs-reveal aria-labelledby="bs-ss-concept-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.conceptFlowLabel || "CONCEPT → SYSTEM")}</p>
      <h2 class="bs-title" id="bs-ss-concept-title">${brHeadline(detail.conceptFlowTitle || "")}</h2>
      ${detail.conceptFlowLead ? `<p class="bs-lead">${escapeHtml(detail.conceptFlowLead).replace(/\n/g, "<br />")}</p>` : ""}
      ${areasHtml(detail.conceptFlow, "what")}
    </div></section>`;
}

function tagChips(items) {
  if (!items?.length) return "";
  return `<ul class="bs-chips">${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
}

function includedListHtml(items, variant = "included") {
  if (!items?.length) return "";
  return `<ul class="bs-deliver bs-deliver--${variant}" data-count="${items.length}" data-variant="${escapeHtml(variant)}">${items
    .map(
      (t, i) =>
        `<li class="bs-deliver__item"><span class="bs-deliver__n" aria-hidden="true">${pad2(i + 1)}</span><span class="bs-deliver__t">${escapeHtml(t)}</span></li>`
    )
    .join("")}</ul>`;
}

function includedSection(detail) {
  if (!detail.included?.length) return "";
  return `<section class="bs-section" data-bs-part="included" data-bs-reveal aria-labelledby="bs-ss-included-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.included)}</p>
      <h2 class="bs-title" id="bs-ss-included-title">${brHeadline(detail.includedTitle || detail.ui.includedTitle)}</h2>
      ${detail.includedNote ? `<p class="bs-lead">${escapeHtml(detail.includedNote)}</p>` : ""}
      ${includedListHtml(detail.included, "included")}
    </div></section>`;
}

function deliverablesSection(detail) {
  if (!detail.deliverables?.length) return "";
  return `<section class="bs-section bs-section--surface" data-bs-part="deliver" data-bs-reveal aria-labelledby="bs-ss-deliver-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.deliverables)}</p>
      <h2 class="bs-title" id="bs-ss-deliver-title">${brHeadline(detail.deliverablesTitle || detail.ui.deliverablesTitle)}</h2>
      <p class="bs-lead">${escapeHtml(detail.deliverablesLead || detail.ui.deliverablesLead)}</p>
      ${getGridHtml(detail.deliverables, "deliver")}
    </div></section>`;
}

function flowStageGridHtml(steps, opts = {}) {
  if (!steps?.length) return "";
  const cols = opts.cols || processLayoutCols(steps.length);
  const cards = steps
    .map((s, i) => {
      const n = pad2(i + 1);
      const title = escapeHtml(s.t);
      const body = escapeHtml(s.d || "")
        .replace(/\n{2,}/g, "\n")
        .replace(/\n/g, "<br />");
      const on = s.current ? " is-on" : "";
      const inner = `<span class="bs-flow-stage-grid__n">${n}</span><h3>${title}</h3><p>${body}</p>`;
      if (s.href && !s.current) {
        return `<a class="bs-flow-stage-grid__item${on}" href="${escapeHtml(s.href)}">${inner}</a>`;
      }
      return `<article class="bs-flow-stage-grid__item${on}">${inner}</article>`;
    })
    .join("");
  return `<div class="bs-flow-stage-grid" data-cols="${cols}">${cards}</div>`;
}

function processListHtml(steps) {
  if (!steps?.length) return "";
  return `<ol class="bs-process bs-process--steps" data-count="${steps.length}">${steps
    .map((s, i) => {
      const body = escapeHtml(s.d || "")
        .replace(/\n{2,}/g, "\n")
        .replace(/\n/g, "<br />");
      return `<li class="bs-process__item"><span class="bs-process__n" aria-hidden="true">${pad2(i + 1)}</span><div class="bs-process__copy"><h3>${escapeHtml(s.t)}</h3><p>${body}</p></div></li>`;
    })
    .join("")}</ol>`;
}

function processSection(detail) {
  if (!detail.process?.length) return "";
  return `<section class="bs-section" data-bs-part="process" data-bs-reveal id="process" aria-labelledby="bs-ss-process-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.ui.process)}</p>
      <h2 class="bs-title" id="bs-ss-process-title">${brHeadline(detail.processTitle || detail.ui.processTitle)}</h2>
      ${processListHtml(detail.process)}
    </div></section>`;
}

function timelineSection(detail) {
  const body = detail.timelineBody;
  const steps = detail.timelineSteps;
  if ((!body || !body.length) && !steps?.length) return "";
  const timeline = formatStudioTimelineDisplay(detail.slug, detail._pageLang);
  const meta =
    timeline
      ? `<aside class="bs-dr-meta" aria-label="Timeline">
        <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">TIMELINE</p><p class="bs-dr-meta__v">${escapeHtml(timeline)}</p></div>
        <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">${escapeHtml(detail._pageLang === "ko" ? "기준" : "BASE")}</p><p class="bs-dr-meta__v">${escapeHtml(detail._pageLang === "ko" ? "기본 범위 프로젝트" : "Basic-scope project")}</p></div>
      </aside>`
      : "";

  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-timeline-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(detail.timelineLabel || "TIMELINE")}</p>
          <h2 class="bs-title" id="bs-ss-timeline-title">${brHeadline(detail.timelineTitle || detail.ui.timeline)}</h2>
          ${proseParas(body)}
        </div>
        ${meta}
      </div>
      ${steps?.length ? flowStageGridHtml(steps) : ""}
    </div></section>`;
}

function optionalSection(detail) {
  if (!detail.optionalScope?.length) return "";
  return `<section class="bs-section" data-bs-part="optional" data-bs-reveal aria-labelledby="bs-ss-optional-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.optionalLabel || detail.ui.optional)}</p>
      <h2 class="bs-title" id="bs-ss-optional-title">${brHeadline(detail.optionalTitle || detail.ui.optionalTitle)}</h2>
      <p class="bs-lead">${escapeHtml(
        detail._pageLang === "ko"
          ? "아래 항목은 기본 범위에 포함되지 않습니다. 필요하면 별도 범위로 협의합니다."
          : "These items are outside the base scope. Add them only when needed."
      )}</p>
      ${includedListHtml(detail.optionalScope, "optional")}
    </div></section>`;
}

function priceFactorsFor(detail) {
  if (detail.baseScope?.length) return detail.baseScope;
  if (detail.priceFactors?.length) return detail.priceFactors;
  const defaults = DEFAULT_PRICE_FACTORS[detail.category];
  return defaults?.[detail._pageLang] || defaults?.en || [];
}

function priceSection(detail) {
  if (detail.pageKind === "comingSoon" || detail.pageKind === "internal") return "";
  const lang = detail._pageLang;
  const price = formatStudioPriceDisplay(detail.slug, lang);
  if (!price && !detail.priceNote) return "";

  const note = detail.priceNote || studioPillarPricingNote(detail.category, lang);
  const factors = priceFactorsFor(detail);
  const factorsLabel = detail.baseScopeLabel || detail.ui.priceFactorsLabel;

  const priceHtml = price
    ? `<div class="bs-price">
      <div class="bs-price__panel">
        <p class="bs-price__name">${escapeHtml(detail.displayName)}</p>
        <p class="bs-price__value">${escapeHtml(price)}</p>
        <p class="bs-price__note">${escapeHtml(note).replace(/\n/g, "<br />")}</p>
      </div>
      ${
        factors.length
          ? `<div class="bs-price__detail">
        <p class="bs-eyebrow">${escapeHtml(factorsLabel)}</p>
        <ul class="bs-price__factors">${factors.map((f) => `<li class="bs-price__factor"><span class="bs-price__factor-k">${escapeHtml(f)}</span></li>`).join("")}</ul>
      </div>`
          : ""
      }
    </div>`
    : "";

  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-price-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.priceLabel || detail.ui.timelinePrice)}</p>
      <h2 class="bs-title" id="bs-ss-price-title">${brHeadline(detail.priceTitle || detail.ui.priceTitle)}</h2>
      ${priceHtml}
    </div></section>`;
}

function developmentSection(detail) {
  const cta = detail.developmentCta;
  if (!cta) return "";
  const lang = detail._pageLang;
  const isStrategyResearch = detail.slug === "brand-strategy";
  const meta = isStrategyResearch
    ? `<aside class="bs-dr-meta" aria-label="Research vs Strategy">
          <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">STUDIO</p><p class="bs-dr-meta__v">${escapeHtml(lang === "ko" ? "Brand Strategy — 기본 검토" : "Brand Strategy — basic review")}</p></div>
          <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">BUSINESS</p><p class="bs-dr-meta__v">${escapeHtml(lang === "ko" ? "Research — 심층 조사" : "Research — deeper study")}</p></div>
        </aside>`
    : `<aside class="bs-dr-meta" aria-label="Studio to Business">
          <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">STUDIO</p><p class="bs-dr-meta__v">${escapeHtml(detail.displayName)}</p></div>
          <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">NEXT</p><p class="bs-dr-meta__v">${escapeHtml(cta.eyebrow || (lang === "ko" ? "Business 연계" : "Business link"))}</p></div>
        </aside>`;
  return `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-ss-dev-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(cta.eyebrow || detail.ui.developmentNeeded)}</p>
          <h2 class="bs-title" id="bs-ss-dev-title">${brHeadline(cta.title)}</h2>
          ${proseParas(cta.body)}
          <div class="bs-hero__actions">
            <a class="bs-btn bs-btn--primary" href="${escapeHtml(cta.href)}">${escapeHtml(cta.label)}</a>
          </div>
        </div>
        ${meta}
      </div>
    </div></section>`;
}

function nextStepsSection(detail) {
  if (!detail.nextSteps?.length) return "";
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-next-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.nextStepsLabel || "NEXT STEP")}</p>
      <h2 class="bs-title" id="bs-ss-next-title">${brHeadline(detail.nextStepsTitle)}</h2>
      ${detail.nextStepsLead ? `<p class="bs-lead">${escapeHtml(detail.nextStepsLead).replace(/\n/g, "<br />")}</p>` : ""}
      ${flowStageGridHtml(detail.nextSteps)}
    </div></section>`;
}

function noticesSection(detail) {
  if (!detail.notices?.length) return "";
  const head = detail.noticesTitle
    ? `<p class="bs-eyebrow">${escapeHtml(detail.noticesLabel || (detail._pageLang === "ko" ? "안내" : "NOTICE"))}</p>
      <h2 class="bs-title" id="bs-ss-notices-title">${brHeadline(detail.noticesTitle)}</h2>`
    : `<h2 class="bs-title" id="bs-ss-notices-title" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Notice</h2>`;
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-notices-title"><div class="bs-inner">
      ${head}
      ${detail.notices.map((n) => `<p class="bs-note">${escapeHtml(n).replace(/\n/g, "<br />")}</p>`).join("")}
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

function relatedBlurb(detail, slug, peer) {
  const pack = detail.relatedBlurbs?.[slug];
  if (!pack) return "";
  const text = typeof pack === "string" ? pack : pack[detail._pageLang] || pack.ko || pack.en || "";
  return text;
}

function exploreSection(detail) {
  const siblings = (detail.siblingSlugs || []).filter((s) => s !== detail.slug);
  if (siblings.length < 1) return "";
  const cards = siblings
    .map((slug) => {
      const peer = getStudioServiceDetail(slug, detail._pageLang);
      if (!peer) return "";
      const href = `../${studioServiceDetailHrefFromPillar(slug)}`;
      const blurb = relatedBlurb(detail, slug, peer);
      const price = formatStudioPriceDisplay(slug, detail._pageLang);
      const tag = blurb || (peer.statusLabel && peer.pageKind !== "service" ? peer.statusLabel : price || peer.categoryLabel);
      return `<a class="bs-related__link" href="${escapeHtml(href)}">
        <span><span class="bs-related__kicker">${escapeHtml(peer.categoryLabel)}</span><span class="bs-related__name">${escapeHtml(peer.displayName)}</span></span>
        <span class="bs-related__go" aria-hidden="true">${escapeHtml(tag)} →</span>
      </a>`;
    })
    .join("");
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ss-explore-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(detail.exploreLabel || detail.ui.explore)}</p>
      <h2 class="bs-title" id="bs-ss-explore-title">${brHeadline(detail.exploreTitle || detail.ui.exploreTitle)}</h2>
      <p class="bs-lead">${escapeHtml(detail.exploreLead || detail.ui.exploreLead)}</p>
      <div class="bs-related">${cards}</div>
    </div></section>`;
}

function adjacentSection(detail) {
  const siblings = STUDIO_NAV_SLUGS;
  const idx = siblings.indexOf(detail.slug);

  const prevSlug = idx > 0 ? siblings[idx - 1] : null;
  const nextSlug = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  let prevBlock = `<span class="bs-adjacent__link bs-adjacent__link--prev is-empty"></span>`;
  let nextBlock = `<span class="bs-adjacent__link bs-adjacent__link--next is-empty"></span>`;

  if (prevSlug) {
    const peer = getStudioServiceDetail(prevSlug, detail._pageLang);
    prevBlock = `<a class="bs-adjacent__link bs-adjacent__link--prev" href="${escapeHtml(studioNavHref(detail.slug, prevSlug))}">
      <span class="bs-adjacent__label">${escapeHtml(detail.ui.prevService)}</span>
      <span class="bs-adjacent__name">${escapeHtml(peer?.displayName || prevSlug)}</span>
    </a>`;
  }
  if (nextSlug) {
    const peer = getStudioServiceDetail(nextSlug, detail._pageLang);
    nextBlock = `<a class="bs-adjacent__link bs-adjacent__link--next" href="${escapeHtml(studioNavHref(detail.slug, nextSlug))}">
      <span class="bs-adjacent__label">${escapeHtml(detail.ui.nextService)}</span>
      <span class="bs-adjacent__name">${escapeHtml(peer?.displayName || nextSlug)}</span>
    </a>`;
  }

  return `<section class="bs-section bs-adjacent" data-bs-reveal aria-label="Adjacent services">
    <div class="bs-inner bs-adjacent__grid">${prevBlock}${nextBlock}</div>
  </section>`;
}

function heroSubEyebrow(detail) {
  if (detail.hideHeroSub) return "";
  if (detail.eyebrowSub) return detail.eyebrowSub;
  return EYEBROW_SUB[detail.slug] || detail.typeLabel || NAV_LABELS[detail.slug] || "";
}

function heroLeadHtml(description) {
  if (Array.isArray(description)) {
    return description
      .map((p) => `<p class="bs-hero__lead">${escapeHtml(String(p)).replace(/\n/g, "<br />")}</p>`)
      .join("");
  }
  return `<p class="bs-hero__lead">${escapeHtml(description || "").replace(/\n/g, "<br />")}</p>`;
}

function heroSection(detail, inquiryHref) {
  const sub = heroSubEyebrow(detail);
  const eyebrow = sub
    ? `${escapeHtml(detail.eyebrow)} <span class="bs-eyebrow__sep" aria-hidden="true">·</span> <span class="bs-eyebrow__sub">${escapeHtml(sub)}</span>`
    : escapeHtml(detail.eyebrow);

  let actions = "";
  if (hasInquiry(detail)) {
    const primaryLabel =
      detail.heroCtaBtn ||
      detail.ctaBtn ||
      (detail.pageKind === "exploring"
        ? detail._pageLang === "ko"
          ? "Experimental Project 문의 →"
          : "Experimental project inquiry →"
        : detail.ui.ctaBtn);
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
      ${heroLeadHtml(detail.description)}
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
    detail.ctaBtn ||
    (detail.pageKind === "exploring"
      ? detail._pageLang === "ko"
        ? "Experimental Project 문의 →"
        : "Experimental project inquiry →"
      : detail.ui.ctaBtn);

  return `<section class="bs-section bs-section--dark bs-final" data-bs-reveal aria-labelledby="bs-final-title"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(detail.ctaEyebrow || detail.ui.ctaEyebrow)}</p>
    <h2 class="bs-final__title" id="bs-final-title">${brHeadline(detail.ctaTitle || detail.ui.ctaTitle)}</h2>
    ${proseParas(detail.ctaLead || detail.ui.ctaLead)}
    <div class="bs-hero__actions">
      <a class="bs-btn bs-btn--primary" href="${escapeHtml(inquiryHref)}" data-bs-cta="final" data-analytics="studio_service_cta_click">${escapeHtml(primaryLabel)}</a>
      <a class="bs-btn bs-btn--ghost" href="../../">${escapeHtml(detail.ctaSecondary || (detail._pageLang === "ko" ? "Studio 보기 →" : "View Studio →"))}</a>
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

  const sourcePath = `/${lang === "ko" ? "ko" : lang}/${detail.pagePath}/`;
  const inquiryHref = hasInquiry(detail)
    ? studioInquiryHref(slug, "../../../business/inquiry/", { source: sourcePath })
    : "";

  return `${breadcrumb(detail)}
${heroSection(detail, inquiryHref)}
${serviceNav(detail)}
${overviewSection(detail)}
${problemsSection(detail)}
${principlesSection(detail)}
${whoSection(detail)}
${whatWeDoSection(detail)}
${directionsSection(detail)}
${useCasesSection(detail)}
${checksSection(detail)}
${includedSection(detail)}
${deliverablesSection(detail)}
${processSection(detail)}
${conceptFlowSection(detail)}
${compareSection(detail)}
${versusSection(detail)}
${timelineSection(detail)}
${priceSection(detail)}
${optionalSection(detail)}
${developmentSection(detail)}
${nextStepsSection(detail)}
${noticesSection(detail)}
${faqSection(detail)}
${finalSection(detail, inquiryHref)}
${adjacentSection(detail)}`;
}

export { listStudioDetailSlugs, getStudioServiceDetail };
