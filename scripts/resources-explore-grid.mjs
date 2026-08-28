/**
 * Shared Resources explore grid — 2×2 rh-card layout (index + sub-page footers).
 */
import { RESOURCE_PAGES } from "./resources-catalog.mjs";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function exploreCardVisual(slug) {
  switch (slug) {
    case "store":
      return `<div class="rh-viz rh-viz--store" aria-hidden="true">
        <span class="rh-viz__doc"></span><span class="rh-viz__doc"></span>
        <span class="rh-viz__doc"></span><span class="rh-viz__doc"></span>
      </div>`;
    case "insights":
      return `<div class="rh-viz rh-viz--blog" aria-hidden="true">
        <span><i>IN</i><b></b></span>
        <span><i>AI</i><b></b></span>
        <span><i>MK</i><b></b></span>
      </div>`;
    case "blog":
      return `<div class="rh-viz rh-viz--blog" aria-hidden="true">
        <span><i>01</i><b></b></span>
        <span><i>02</i><b></b></span>
        <span><i>03</i><b></b></span>
      </div>`;
    case "labs":
      return `<div class="rh-viz rh-viz--labs" aria-hidden="true">
        <span>TEST</span><span>BUILD</span><span>LEARN</span><span>REPEAT</span>
      </div>`;
    default:
      return `<div class="rh-viz" aria-hidden="true"></div>`;
  }
}

/**
 * @param {object} copies
 * @param {{ base?: string, activeSlug?: string, escapeHtml: Function, brHeadline: Function, lang?: string }} opts
 */
export function buildRhExploreGrid(copies, opts) {
  const { escapeHtml, brHeadline, base = "../", activeSlug = "", lang = "ko" } = opts;
  const ko = lang === "ko";
  const pages = RESOURCE_PAGES.filter((p) => p.primary !== false);

  return pages
    .map((p, i) => {
      const c = copies[p.slug];
      const item = copies.index?.indexItems?.[p.slug];
      const n = pad2(i + 1);
      const current = activeSlug && activeSlug === p.slug;
      const href = current ? "#" : `${base}${p.slug}/`;
      const aria = current ? ' aria-current="page"' : "";
      const cls = `rh-card rh-card--${escapeHtml(p.slug)}`;

      const head = `<div class="rh-card__head">
        <span class="rh-card__num" aria-hidden="true">${n}</span>
        <span class="rh-card__cat">${escapeHtml(item?.category || c?.navLabel || p.slug.toUpperCase())}</span>
      </div>
      <h3 class="rh-card__title">${escapeHtml(item?.title || c?.navLabel || p.slug.toUpperCase())}</h3>
      <p class="rh-card__lead">${brHeadline(item?.lead || item?.desc || c?.lead || "")}</p>
      ${
        item?.desc && item?.lead && item.desc !== item.lead
          ? `<p class="rh-card__desc">${escapeHtml(item.desc)}</p>`
          : !item?.lead && (item?.desc || c?.lead)
            ? `<p class="rh-card__desc">${escapeHtml(item?.desc || c?.lead || "")}</p>`
            : ""
      }
      ${
        item?.meta
          ? `<div class="rh-card__meta">
        <span>${escapeHtml(item.meta)}</span>
        ${item.metaSub ? `<span class="rh-card__meta-sub">${escapeHtml(item.metaSub)}</span>` : ""}
      </div>`
          : ""
      }`;

      return `<a class="${cls}" href="${href}" data-rs-reveal${aria}>
      ${head}
      <span class="rh-card__cta">${escapeHtml(item?.cta || (ko ? "둘러보기 ↗" : "EXPLORE ↗"))}</span>
      ${exploreCardVisual(p.slug)}
    </a>`;
    })
    .join("");
}

/**
 * @param {object} copies
 * @param {{ base?: string, activeSlug?: string, escapeHtml: Function, brHeadline: Function, lang?: string }} opts
 */
export function buildRhExploreSection(copies, opts) {
  const { escapeHtml, lang = "ko" } = opts;
  const ko = lang === "ko";
  const pages = RESOURCE_PAGES.filter((p) => p.primary !== false);
  const total = pad2(pages.length);
  const title = escapeHtml(copies.index?.exploreTitle || copies.store?.exploreTitle || "EXPLORE RESOURCES");
  const indexLabel = escapeHtml(copies.index?.exploreIndexLabel || (ko ? "목록" : "INDEX"));
  const cards = buildRhExploreGrid(copies, opts);

  return `<section class="rs-section rh-explore" data-rs-reveal aria-labelledby="rh-explore-title">
    <div class="rx-shell">
      <header class="rh-explore__head">
        <div class="rh-explore__copy">
          <p class="rs-eyebrow" id="rh-explore-title">${title}</p>
        </div>
        <p class="rh-explore__count">
          <span class="rh-explore__count-k">${indexLabel}</span>
          <span class="rh-explore__count-n">${total}</span>
        </p>
      </header>
      <div class="rh-grid">${cards}</div>
    </div>
  </section>`;
}
