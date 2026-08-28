/**
 * Resources > Blog hub body — Naver blog archive (editorial list).
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getNaverBlogPosts, NAVER_BLOG_HOME } from "./naver-blog-posts.mjs";

function t(post, lang, koKey, enKey) {
  return lang === "ko" ? post[koKey] || post[enKey] || "" : post[enKey] || post[koKey] || "";
}

function catLabel(copy, cat) {
  const labels = copy.filterLabels || {};
  return labels[cat] || String(cat || "").toUpperCase();
}

function postRowHtml(post, copy, lang) {
  const title = escapeHtml(t(post, lang, "titleKo", "titleEn"));
  const summary = escapeHtml(t(post, lang, "summaryKo", "summaryEn"));
  const cat = escapeHtml(String(post.category || "").toLowerCase());
  const hasThumb = Boolean(post.thumbnail);
  const thumb = hasThumb
    ? `<span class="nb-row__thumb"><img src="${escapeHtml(post.thumbnail)}" alt="" loading="lazy" decoding="async" width="320" height="200" /></span>`
    : "";
  return `<a class="nb-row${hasThumb ? " nb-row--media" : ""}" href="${escapeHtml(post.url)}" target="_blank" rel="noopener noreferrer" data-category="${cat}" data-rs-reveal>
    <span class="nb-row__side">
      <span class="nb-row__cat">${escapeHtml(catLabel(copy, post.category))}</span>
      <time class="nb-row__date" datetime="${escapeHtml(post.date.replace(/\./g, "-"))}">${escapeHtml(post.date)}</time>
    </span>
    ${thumb}
    <span class="nb-row__main">
      <span class="nb-row__title">${title}</span>
      <span class="nb-row__summary">${summary}</span>
      <span class="nb-row__src">${escapeHtml(copy.sourceLabel || "NAVER BLOG")}</span>
    </span>
    <span class="nb-row__go">${escapeHtml(copy.readArticle || "Read article ↗")}</span>
  </a>`;
}

/**
 * @param {object} copies
 * @param {'ko'|'en'} lang
 * @param {{ breadcrumb: Function, resourceSwitcher: Function, exploreGrid: Function, heroBlock: Function }} helpers
 */
export function buildBlogHubBody(copies, lang, helpers) {
  const copy = copies.blog;
  const posts = getNaverBlogPosts();
  const filters = Object.entries(copy.filterLabels || { all: "ALL" })
    .map(
      ([k, v]) =>
        `<button type="button" class="nb-filter${k === "all" ? " is-active" : ""}" data-rs-filter="${escapeHtml(k)}">${escapeHtml(v)}</button>`
    )
    .join("");
  const rows = posts.map((p) => postRowHtml(p, copy, lang)).join("");
  const emptyMsg = escapeHtml(copy.filterEmpty || copy.emptyTitle || "");

  let archive = "";
  if (!posts.length) {
    archive = `<div class="nb-empty" data-rs-reveal>
      <p class="nb-empty__title">${escapeHtml(copy.emptyTitle || "")}</p>
      <p class="nb-empty__lead">${escapeHtml(copy.emptyLead || "")}</p>
      <a class="nb-ext" href="${escapeHtml(NAVER_BLOG_HOME)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
        copy.visitNaver || "View on Naver Blog ↗"
      )}</a>
    </div>`;
  } else {
    archive = `
      <div class="nb-filters" data-rs-filters role="tablist" aria-label="${escapeHtml(copy.filterAria || "Categories")}">${filters}</div>
      <section class="nb-latest" aria-labelledby="nb-latest-title">
        <div class="nb-list" data-rs-filter-grid>
          <h2 class="nb-eyebrow nb-latest__label" id="nb-latest-title">${escapeHtml(copy.latestTitle || "LATEST POSTS")}</h2>
          ${rows}
        </div>
        <p class="nb-filter-empty" data-rs-filter-empty hidden>${emptyMsg}</p>
      </section>`;
  }

  const hero = helpers.heroBlock(copy, {
    secondaryLabel: copy.naverLink,
    secondaryHref: NAVER_BLOG_HOME,
    secondaryExternal: true,
  });

  const cta = `<section class="nb-cta" data-rs-reveal>
    <div class="rs-inner">
      <p class="nb-eyebrow">${escapeHtml(copy.moreEyebrow || "MORE STORIES")}</p>
      <h2 class="nb-cta__title">${escapeHtml(copy.moreTitle || "")}</h2>
      <p class="nb-cta__lead">${escapeHtml(copy.moreLead || "")}</p>
      <a class="nb-ext" href="${escapeHtml(NAVER_BLOG_HOME)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
        copy.visitNaver || "Visit Naver Blog ↗"
      )}</a>
    </div>
  </section>`;

  return `${helpers.breadcrumb(copy, copy.navLabel || "BLOG")}
${hero}
${helpers.resourceSwitcher("blog", copies)}
<div class="nb-page">
<section class="nb-section" id="rs-content">
  <div class="rs-inner">${archive}</div>
</section>
${cta}
</div>
${helpers.exploreGrid(copies, "../", "blog")}`;
}
