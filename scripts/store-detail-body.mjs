/**
 * Store product detail page body + unique Preview UIs.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getStoreProducts } from "./resources-data.mjs";
import { getStoreDetail, getStoreDetailUi } from "./store-detail-copy.mjs";

function pick(detail, lang, koKey, enKey) {
  return lang === "ko" ? detail[koKey] || detail[enKey] || "" : detail[enKey] || detail[koKey] || "";
}

function statusBadge(product, ui) {
  const inDev = product.status === "concept";
  const label = inDev ? ui.inDevBadge : ui.comingSoonBadge;
  const cls = inDev ? "sd-badge sd-badge--dev" : "sd-badge";
  return `<span class="${cls}">${escapeHtml(label)}</span>`;
}

function statusHeadline(product, ui) {
  return product.status === "concept" ? ui.statusInDevelopment : ui.statusComingSoon;
}

function flowPreview(steps, variant = "h") {
  const items = steps
    .map((s, i) => {
      const arrow =
        i < steps.length - 1
          ? variant === "v"
            ? `<span class="sd-flow__arrow sd-flow__arrow--v" aria-hidden="true">↓</span>`
            : `<span class="sd-flow__arrow" aria-hidden="true">→</span>`
          : "";
      return `<div class="sd-flow__step"><span class="sd-flow__label">${escapeHtml(s)}</span></div>${arrow}`;
    })
    .join("");
  return `<div class="sd-flow sd-flow--${variant}" role="list">${items}</div>`;
}

function previewLaunch(lang) {
  const checks =
    lang === "ko"
      ? [
          ["Product Definition", "문제 · 사용자 · 가치"],
          ["MVP Scope", "Must / Later 분리"],
          ["Store Metadata", "Name · Subtitle · Keywords"],
          ["QA Pass", "기능 · UI · 예외"],
        ]
      : [
          ["Product Definition", "Problem · User · Value"],
          ["MVP Scope", "Must / Later split"],
          ["Store Metadata", "Name · Subtitle · Keywords"],
          ["QA Pass", "Function · UI · Edge cases"],
        ];
  const timeline =
    lang === "ko"
      ? [
          ["T-14", "메타 · 계정 · 정책"],
          ["T-7", "QA · 스크린샷"],
          ["T-1", "최종 점검"],
          ["T+0", "출시"],
          ["T+7", "리뷰 · 버그"],
        ]
      : [
          ["T-14", "Meta · accounts · policy"],
          ["T-7", "QA · screenshots"],
          ["T-1", "Final check"],
          ["T+0", "Launch"],
          ["T+7", "Reviews · bugs"],
        ];
  const list = checks
    .map(
      ([t, d]) => `<li class="sd-check__item">
      <span class="sd-check__box" aria-hidden="true"></span>
      <span class="sd-check__text"><strong>${escapeHtml(t)}</strong><span>${escapeHtml(d)}</span></span>
    </li>`
    )
    .join("");
  const rail = timeline
    .map(
      ([t, d]) => `<li class="sd-timeline__item">
      <span class="sd-timeline__t">${escapeHtml(t)}</span>
      <span class="sd-timeline__d">${escapeHtml(d)}</span>
    </li>`
    )
    .join("");
  return `<div class="sd-preview sd-preview--launch">
    <div class="sd-preview__panel">
      <p class="sd-preview__label">LAUNCH CHECKLIST</p>
      <ul class="sd-check">${list}</ul>
    </div>
    <div class="sd-preview__panel">
      <p class="sd-preview__label">LAUNCH TIMELINE</p>
      <ol class="sd-timeline">${rail}</ol>
    </div>
  </div>`;
}

function previewMvp() {
  return `<div class="sd-preview sd-preview--mvp">${flowPreview(
    ["PROBLEM", "USER", "SOLUTION", "CORE FLOW", "MVP", "VALIDATION"],
    "v"
  )}</div>`;
}

function previewCursor() {
  return `<div class="sd-preview sd-preview--cursor">${flowPreview(
    ["DEFINE", "PLAN", "BUILD", "TEST", "REFINE", "SHIP"],
    "h"
  )}</div>`;
}

function previewCodex() {
  return `<div class="sd-preview sd-preview--codex">${flowPreview(
    ["REPO", "TASK", "EXECUTE", "TEST", "REVIEW", "RELEASE"],
    "h"
  )}</div>`;
}

function previewWebChecklist(lang) {
  const groups =
    lang === "ko"
      ? [
          { title: "CONTENT", items: ["오탈자", "링크", "CTA", "정책 페이지"] },
          { title: "SEO", items: ["Page Title", "Meta Description", "Open Graph", "Sitemap"] },
          { title: "PERFORMANCE", items: ["Images", "Loading Speed", "Fonts", "JS Errors"] },
          { title: "FINAL QA", items: ["Forms", "404", "Redirects", "Domain"] },
        ]
      : [
          { title: "CONTENT", items: ["Typos", "Links", "CTAs", "Policy pages"] },
          { title: "SEO", items: ["Page Title", "Meta Description", "Open Graph", "Sitemap"] },
          { title: "PERFORMANCE", items: ["Images", "Loading Speed", "Fonts", "JS Errors"] },
          { title: "FINAL QA", items: ["Forms", "404", "Redirects", "Domain"] },
        ];
  const cols = groups
    .map((g) => {
      const rows = g.items
        .map(
          (it) => `<li class="sd-check__item">
          <span class="sd-check__box" aria-hidden="true"></span>
          <span class="sd-check__text"><strong>${escapeHtml(it)}</strong></span>
        </li>`
        )
        .join("");
      return `<div class="sd-preview__panel">
        <p class="sd-preview__label">${escapeHtml(g.title)}</p>
        <ul class="sd-check">${rows}</ul>
      </div>`;
    })
    .join("");
  return `<div class="sd-preview sd-preview--webdoc" aria-label="Checklist preview">
    <div class="sd-doc">
      <div class="sd-doc__head">
        <span class="sd-doc__mark">CHECKLIST</span>
        <span class="sd-doc__name">Website Launch</span>
      </div>
      <div class="sd-doc__grid">${cols}</div>
    </div>
  </div>`;
}

function previewBiz() {
  return `<div class="sd-preview sd-preview--biz">${flowPreview(
    ["IDEA", "CUSTOMER", "MODEL", "LAUNCH", "GROW"],
    "h"
  )}</div>`;
}

function previewResearch(lang) {
  const cards =
    lang === "ko"
      ? [
          { k: "OBSERVATION", v: "Users abandon setup after step 3." },
          { k: "EVIDENCE", v: "7 / 10 interviews" },
          { k: "INSIGHT", v: "Reduce initial setup requirements." },
          { k: "DECISION", v: "Move optional fields after onboarding." },
        ]
      : [
          { k: "OBSERVATION", v: "Users abandon setup after step 3." },
          { k: "EVIDENCE", v: "7 / 10 interviews" },
          { k: "INSIGHT", v: "Reduce initial setup requirements." },
          { k: "DECISION", v: "Move optional fields after onboarding." },
        ];
  const grid = cards
    .map(
      (c) => `<article class="sd-board__card">
      <p class="sd-board__k">${escapeHtml(c.k)}</p>
      <p class="sd-board__v">${escapeHtml(c.v)}</p>
    </article>`
    )
    .join("");
  return `<div class="sd-preview sd-preview--research">
    <div class="sd-board">${grid}</div>
  </div>`;
}

function previewFounder(lang, previewNote) {
  const week =
    lang === "ko"
      ? [
          "01 Ship onboarding V2",
          "02 Review pricing",
          "03 Interview 5 users",
          "04 Fix signup drop-off",
        ]
      : [
          "01 Ship onboarding V2",
          "02 Review pricing",
          "03 Interview 5 users",
          "04 Fix signup drop-off",
        ];
  const metrics = [
    { k: "Revenue", v: "—" },
    { k: "Users", v: "—" },
    { k: "Conversion", v: "—" },
    { k: "Active Products", v: "—" },
  ];
  const metricHtml = metrics
    .map(
      (m) => `<div class="sd-dash__metric">
      <span class="sd-dash__mk">${escapeHtml(m.k)}</span>
      <strong class="sd-dash__mv">${escapeHtml(m.v)}</strong>
    </div>`
    )
    .join("");
  const weekHtml = week.map((w) => `<li>${escapeHtml(w)}</li>`).join("");
  return `<div class="sd-preview sd-preview--dash">
    <div class="sd-dash">
      <div class="sd-dash__top">
        <span class="sd-dash__badge">${escapeHtml(previewNote)}</span>
        <span class="sd-dash__title">FOUNDER DASHBOARD</span>
      </div>
      <div class="sd-dash__metrics" aria-label="Overview">${metricHtml}</div>
      <div class="sd-dash__split">
        <div class="sd-dash__panel">
          <p class="sd-preview__label">THIS WEEK</p>
          <ol class="sd-dash__week">${weekHtml}</ol>
        </div>
        <div class="sd-dash__panel sd-dash__panel--muted">
          <p class="sd-preview__label">ONE PLACE FOR</p>
          <p class="sd-dash__one">Product · Growth · Finance · Operations</p>
        </div>
      </div>
    </div>
  </div>`;
}

function previewRoadmap() {
  const cols = [
    { title: "NOW", items: ["Improve onboarding", "Fix payment flow"] },
    { title: "NEXT", items: ["Team workspace", "Analytics"] },
    { title: "LATER", items: ["API", "Marketplace", "Enterprise"] },
  ];
  const html = cols
    .map((c) => {
      const items = c.items.map((it) => `<li>${escapeHtml(it)}</li>`).join("");
      return `<div class="sd-road__col">
        <p class="sd-road__h">${escapeHtml(c.title)}</p>
        <ul class="sd-road__list">${items}</ul>
      </div>`;
    })
    .join("");
  return `<div class="sd-preview sd-preview--roadmap"><div class="sd-road">${html}</div></div>`;
}

function buildPreview(kind, lang, ui) {
  switch (kind) {
    case "launch-checklist":
      return previewLaunch(lang);
    case "mvp-flow":
      return previewMvp();
    case "cursor-workflow":
      return previewCursor();
    case "codex-workflow":
      return previewCodex();
    case "web-checklist":
      return previewWebChecklist(lang);
    case "biz-flow":
      return previewBiz();
    case "research-board":
      return previewResearch(lang);
    case "founder-dash":
      return previewFounder(lang, ui.previewNote);
    case "roadmap-cols":
      return previewRoadmap();
    default:
      return `<div class="sd-preview"><p class="sd-preview__empty">Preview</p></div>`;
  }
}

function navFor(slug, lang, ui) {
  const products = getStoreProducts();
  const idx = products.findIndex((p) => p.slug === slug);
  const next = idx >= 0 ? products[(idx + 1) % products.length] : null;
  const nextTitle =
    next && (lang === "ko" ? next.titleKo || next.titleEn : next.titleEn || next.titleKo);
  const nextHref = next ? `../${escapeHtml(next.slug)}/` : "../";
  return `<nav class="sd-nav" aria-label="Store navigation">
    <a class="sd-nav__back" href="../">${escapeHtml(ui.backStore)}</a>
    ${
      next && next.slug !== slug
        ? `<a class="sd-nav__next" href="${nextHref}"><span>${escapeHtml(ui.nextResource)}</span><strong>${escapeHtml(
            nextTitle || ""
          )}</strong></a>`
        : ""
    }
  </nav>`;
}

function includesMarkup(includes, layout) {
  if (layout === "grid") {
    return `<ul class="sd-inc sd-inc--grid">${includes
      .map(
        (it) => `<li class="sd-inc-card">
        <span class="sd-inc-card__n">${escapeHtml(it.n)}</span>
        <h3 class="sd-inc-card__t">${escapeHtml(it.title)}</h3>
        <p class="sd-inc-card__d">${escapeHtml(it.body)}</p>
      </li>`
      )
      .join("")}</ul>`;
  }
  if (layout === "steps") {
    return `<ol class="sd-inc sd-inc--steps">${includes
      .map(
        (it, i) => `<li class="sd-inc-step">
        <span class="sd-inc-step__rail" aria-hidden="true">
          <span class="sd-inc-step__dot">${escapeHtml(it.n)}</span>
          ${i < includes.length - 1 ? `<span class="sd-inc-step__line"></span>` : ""}
        </span>
        <div class="sd-inc-step__body">
          <h3 class="sd-inc-step__t">${escapeHtml(it.title)}</h3>
          <p class="sd-inc-step__d">${escapeHtml(it.body)}</p>
        </div>
      </li>`
      )
      .join("")}</ol>`;
  }
  if (layout === "matrix") {
    return `<ul class="sd-inc sd-inc--matrix">${includes
      .map(
        (it) => `<li class="sd-inc-cell">
        <span class="sd-inc-cell__n">${escapeHtml(it.n)}</span>
        <strong class="sd-inc-cell__t">${escapeHtml(it.title)}</strong>
        <span class="sd-inc-cell__d">${escapeHtml(it.body)}</span>
      </li>`
      )
      .join("")}</ul>`;
  }
  if (layout === "chapters") {
    return `<ol class="sd-inc sd-inc--chapters">${includes
      .map(
        (it) => `<li class="sd-inc-ch">
        <span class="sd-inc-ch__n">CH. ${escapeHtml(it.n)}</span>
        <div class="sd-inc-ch__main">
          <h3 class="sd-inc-ch__t">${escapeHtml(it.title)}</h3>
          <p class="sd-inc-ch__d">${escapeHtml(it.body)}</p>
        </div>
      </li>`
      )
      .join("")}</ol>`;
  }
  if (layout === "index") {
    return `<ol class="sd-inc sd-inc--index">${includes
      .map(
        (it) => `<li class="sd-inc-row">
        <span class="sd-inc-row__n">${escapeHtml(it.n)}</span>
        <span class="sd-inc-row__t">${escapeHtml(it.title)}</span>
        <span class="sd-inc-row__d">${escapeHtml(it.body)}</span>
      </li>`
      )
      .join("")}</ol>`;
  }
  if (layout === "panels") {
    return `<ul class="sd-inc sd-inc--panels">${includes
      .map(
        (it) => `<li class="sd-inc-panel">
        <p class="sd-inc-panel__n">${escapeHtml(it.n)} · ${escapeHtml(it.title)}</p>
        <p class="sd-inc-panel__d">${escapeHtml(it.body)}</p>
      </li>`
      )
      .join("")}</ul>`;
  }
  return `<ol class="sd-includes">${includes
    .map(
      (it) => `<li class="sd-include">
      <span class="sd-include__n">${escapeHtml(it.n)}</span>
      <div class="sd-include__body">
        <h3 class="sd-include__title">${escapeHtml(it.title)}</h3>
        <p class="sd-include__text">${escapeHtml(it.body)}</p>
      </div>
    </li>`
    )
    .join("")}</ol>`;
}

function heroBlock(product, detail, lang, ui, previewHtml) {
  const title = detail.title;
  const subtitle = pick(detail, lang, "subtitleKo", "subtitleEn");
  const description = pick(detail, lang, "descriptionKo", "descriptionEn");
  const kicker = pick(detail, lang, "heroKickerKo", "heroKickerEn");
  const layout = detail.layout || "editorial";

  const copy = `<div class="sd-hero__copy">
    <p class="sd-eyebrow">${escapeHtml(detail.categoryEyebrow)}</p>
    ${kicker ? `<p class="sd-hero__kicker">${escapeHtml(kicker)}</p>` : ""}
    <div class="sd-hero__row">
      <h1 class="sd-hero__title">${escapeHtml(title)}</h1>
      ${statusBadge(product, ui)}
    </div>
    <p class="sd-hero__sub">${escapeHtml(subtitle)}</p>
    <p class="sd-hero__desc">${escapeHtml(description)}</p>
  </div>`;

  if (layout === "split" || layout === "document" || layout === "dashboard" || layout === "board" || layout === "roadmap") {
    return `<header class="sd-hero sd-hero--${escapeHtml(layout)}">
      <div class="rs-inner sd-hero__split">
        ${copy}
        <div class="sd-hero__visual">
          <p class="sd-hero__visual-label">${escapeHtml(ui.previewNote)}</p>
          ${previewHtml}
        </div>
      </div>
    </header>`;
  }

  if (layout === "flow" || layout === "terminal" || layout === "agent") {
    return `<header class="sd-hero sd-hero--${escapeHtml(layout)}">
      <div class="rs-inner">
        ${copy}
        <div class="sd-hero__band">
          <p class="sd-hero__visual-label">${escapeHtml(ui.previewNote)}</p>
          ${previewHtml}
        </div>
      </div>
    </header>`;
  }

  if (layout === "chapters") {
    const chPreview = ((lang === "ko" ? detail.includesKo : detail.includesEn) || [])
      .slice(0, 5)
      .map((it) => `<li><span>${escapeHtml(it.n)}</span><strong>${escapeHtml(it.title)}</strong></li>`)
      .join("");
    return `<header class="sd-hero sd-hero--chapters">
      <div class="rs-inner sd-hero__split">
        ${copy}
        <aside class="sd-hero__toc" aria-label="Chapters">
          <p class="sd-hero__visual-label">CHAPTER INDEX</p>
          <ol class="sd-toc">${chPreview}<li class="sd-toc__more">···</li></ol>
        </aside>
      </div>
    </header>`;
  }

  return `<header class="sd-hero sd-hero--editorial">
    <div class="rs-inner sd-hero__inner">${copy}</div>
  </header>`;
}

/**
 * @param {object} product from STORE_PRODUCTS
 * @param {object} copies resources copies (for switcher/breadcrumb helpers passed in)
 * @param {'ko'|'en'} lang
 * @param {{ breadcrumb: Function, resourceSwitcher: Function }} helpers
 */
export function buildStoreDetailBody(product, copies, lang, helpers) {
  const ui = getStoreDetailUi(lang);
  const detail = getStoreDetail(product.slug);
  if (!detail) {
    return `<div class="rs-inner"><p>Product not found.</p><p><a href="../">${escapeHtml(ui.backStore)}</a></p></div>`;
  }

  const title = detail.title;
  const description = pick(detail, lang, "descriptionKo", "descriptionEn");
  const includes = (lang === "ko" ? detail.includesKo : detail.includesEn) || [];
  const who = (lang === "ko" ? detail.whoKo : detail.whoEn) || [];
  const format = (lang === "ko" ? detail.formatKo : detail.formatEn) || [];
  const disclaimer = pick(detail, lang, "disclaimerKo", "disclaimerEn");
  const statusText = statusHeadline(product, ui);
  const layout = detail.layout || "editorial";
  const previewInHero = ["split", "document", "dashboard", "board", "roadmap", "flow", "terminal", "agent"].includes(
    layout
  );
  const previewHtml = buildPreview(detail.preview, lang, ui);

  const whoHtml = who.map((w) => `<li class="sd-tag">${escapeHtml(w)}</li>`).join("");
  const formatHtml = format.map((f) => `<li class="sd-tag sd-tag--ghost">${escapeHtml(f)}</li>`).join("");
  const statusParas = escapeHtml(ui.statusBody)
    .split("\n")
    .map((p) => `<p>${p}</p>`)
    .join("");

  const crumb = helpers.breadcrumb(
    { crumbResources: ui.crumbResources },
    title,
    { resourcesHref: "../../", mid: ui.crumbStore, midHref: "../" }
  );

  const relatedProducts = getStoreProducts()
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4)
    .map((p) => {
      const t = lang === "ko" ? p.titleKo || p.titleEn : p.titleEn || p.titleKo;
      return `<a class="sd-related__item" href="../${escapeHtml(p.slug)}/">
        <span class="sd-related__cat">${escapeHtml(String(p.category || "").toUpperCase())}</span>
        <span class="sd-related__title">${escapeHtml(t)}</span>
        <span class="sd-related__go" aria-hidden="true">→</span>
      </a>`;
    })
    .join("");

  const overviewSection = previewInHero
    ? ""
    : `<section class="sd-section" aria-labelledby="sd-overview-title">
    <div class="rs-inner">
      <p class="sd-eyebrow">${escapeHtml(ui.overviewEyebrow)}</p>
      <h2 id="sd-overview-title" class="sd-title">${escapeHtml(ui.overviewTitle)}</h2>
      <p class="sd-lead">${escapeHtml(description)}</p>
    </div>
  </section>`;

  const previewSection = previewInHero
    ? ""
    : `<section class="sd-section" aria-labelledby="sd-preview-title">
    <div class="rs-inner">
      <p class="sd-eyebrow">${escapeHtml(ui.previewEyebrow)}</p>
      <div class="sd-preview-head">
        <h2 id="sd-preview-title" class="sd-title">${escapeHtml(ui.previewTitle)}</h2>
        <span class="sd-preview-note">${escapeHtml(ui.previewNote)}</span>
      </div>
      ${previewHtml}
    </div>
  </section>`;

  return `${crumb}
${helpers.resourceSwitcher("store", copies, "../")}
<article class="sd-page" data-sd-layout="${escapeHtml(layout)}">
  ${heroBlock(product, detail, lang, ui, previewHtml)}
  ${overviewSection}

  <section class="sd-section sd-section--wash" aria-labelledby="sd-includes-title">
    <div class="rs-inner">
      <p class="sd-eyebrow">${escapeHtml(ui.includesEyebrow)}</p>
      <h2 id="sd-includes-title" class="sd-title">${escapeHtml(ui.includesTitle)}</h2>
      ${includesMarkup(includes, detail.includesLayout || "list")}
    </div>
  </section>

  ${previewSection}

  <section class="sd-section${previewInHero ? "" : " sd-section--wash"}" aria-labelledby="sd-who-title">
    <div class="rs-inner sd-split">
      <div>
        <p class="sd-eyebrow">${escapeHtml(ui.whoEyebrow)}</p>
        <h2 id="sd-who-title" class="sd-title">${escapeHtml(ui.whoTitle)}</h2>
        <ul class="sd-tags">${whoHtml}</ul>
      </div>
      <div>
        <p class="sd-eyebrow">${escapeHtml(ui.formatEyebrow)}</p>
        <h2 class="sd-title">${escapeHtml(ui.formatTitle)}</h2>
        <ul class="sd-tags">${formatHtml}</ul>
      </div>
    </div>
  </section>

  <section class="sd-section sd-status" aria-labelledby="sd-status-title">
    <div class="rs-inner">
      <p class="sd-eyebrow">${escapeHtml(ui.statusEyebrow)}</p>
      <h2 id="sd-status-title" class="sd-status__title">${escapeHtml(statusText)}</h2>
      <div class="sd-status__body">${statusParas}</div>
    </div>
  </section>

  <section class="sd-section sd-section--wash" aria-labelledby="sd-related-title">
    <div class="rs-inner">
      <p class="sd-eyebrow">${escapeHtml(ui.relatedEyebrow)}</p>
      <h2 id="sd-related-title" class="sd-title">${escapeHtml(ui.relatedTitle)}</h2>
      <div class="sd-related">${relatedProducts}</div>
      ${navFor(product.slug, lang, ui)}
    </div>
  </section>

  ${
    disclaimer
      ? `<footer class="sd-disclaimer"><div class="rs-inner"><p>${escapeHtml(disclaimer).replace(
          /\n/g,
          "<br />"
        )}</p></div></footer>`
      : ""
  }
</article>`;
}

export function storeDetailSeo(product, lang) {
  const detail = getStoreDetail(product.slug);
  const title = detail?.title || (lang === "ko" ? product.titleKo : product.titleEn) || product.slug;
  const meta =
    (detail && pick(detail, lang, "metaKo", "metaEn")) ||
    (lang === "ko" ? product.descKo : product.descEn) ||
    "";
  return {
    seoTitle: `${title} | Newon Store`,
    metaDescription: meta,
  };
}
