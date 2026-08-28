/**
 * Resources > Blog hub body — Naver blog archive (editorial list).
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getNaverBlogPosts, getFeaturedNaverBlogPost, NAVER_BLOG_HOME } from "./naver-blog-posts.mjs";

function t(post, lang, koKey, enKey) {
  return lang === "ko" ? post[koKey] || post[enKey] || "" : post[enKey] || post[koKey] || "";
}

function catLabel(copy, cat) {
  const labels = copy.filterLabels || {};
  return labels[cat] || String(cat || "").toUpperCase();
}

function postMeta(post, copy) {
  return `<span class="nb-meta__cat">${escapeHtml(catLabel(copy, post.category))}</span>
    <span class="nb-meta__sep" aria-hidden="true">·</span>
    <time class="nb-meta__date" datetime="${escapeHtml(post.date.replace(/\./g, "-"))}">${escapeHtml(post.date)}</time>
    <span class="nb-meta__sep" aria-hidden="true">·</span>
    <span class="nb-meta__src">${escapeHtml(copy.sourceLabel || "NAVER BLOG")}</span>`;
}

function featuredHtml(post, copy, lang) {
  if (!post) return "";
  const title = escapeHtml(t(post, lang, "titleKo", "titleEn"));
  const summary = escapeHtml(t(post, lang, "summaryKo", "summaryEn"));
  const hasImg = Boolean(post.thumbnail);
  const cat = escapeHtml(String(post.category || "").toLowerCase());
  return `<a class="nb-featured__card${hasImg ? " nb-featured__card--media" : ""}" href="${escapeHtml(post.url)}" target="_blank" rel="noopener noreferrer" data-category="${cat}" data-rs-reveal>
      <div class="nb-featured__main">
        <p class="nb-eyebrow nb-eyebrow--inline">${escapeHtml(copy.featuredTitle || "FEATURED")}</p>
        <p class="nb-meta">${postMeta(post, copy)}</p>
        <h2 class="nb-featured__title">${title}</h2>
        <p class="nb-featured__summary">${summary}</p>
        <span class="nb-link">${escapeHtml(copy.readFeatured || "Read on Naver →")}</span>
      </div>
      ${
        hasImg
          ? `<div class="nb-featured__media"><img src="${escapeHtml(post.thumbnail)}" alt="" loading="lazy" decoding="async" width="640" height="480" /></div>`
          : ""
      }
    </a>`;
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
 * @param {{ breadcrumb: Function, resourceSwitcher: Function, exploreGrid: Function }} helpers
 */
export function buildBlogHubBody(copies, lang, helpers) {
  const copy = copies.blog;
  const posts = getNaverBlogPosts();
  const featured = getFeaturedNaverBlogPost();
  const listPosts = featured ? posts.filter((p) => p.id !== featured.id) : posts;
  const filters = Object.entries(copy.filterLabels || { all: "ALL" })
    .map(
      ([k, v]) =>
        `<button type="button" class="nb-filter${k === "all" ? " is-active" : ""}" data-rs-filter="${escapeHtml(k)}">${escapeHtml(v)}</button>`
    )
    .join("");
  const rows = listPosts.map((p) => postRowHtml(p, copy, lang)).join("");
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
          ${featured ? featuredHtml(featured, copy, lang) : ""}
          <h2 class="nb-eyebrow nb-latest__label" id="nb-latest-title">${escapeHtml(copy.latestTitle || "LATEST POSTS")}</h2>
          ${rows}
        </div>
        <p class="nb-filter-empty" data-rs-filter-empty hidden>${emptyMsg}</p>
      </section>`;
  }

  const hero = `<header class="nb-hero">
    <div class="rs-inner nb-hero__inner">
      <div class="nb-hero__copy">
        <p class="nb-eyebrow">${escapeHtml(copy.eyebrow || "NEWON BLOG")}</p>
        <h1 class="nb-hero__title">${escapeHtml(copy.headline || "Blog")}</h1>
        <p class="nb-hero__lead">${escapeHtml(copy.lead || "")}</p>
      </div>
      <a class="nb-ext nb-hero__ext" href="${escapeHtml(NAVER_BLOG_HOME)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
        copy.naverLink || "Naver Blog ↗"
      )}</a>
    </div>
  </header>`;

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
${helpers.resourceSwitcher("blog", copies)}
<div class="nb-page">
${hero}
<section class="nb-section" id="rs-content">
  <div class="rs-inner">${archive}</div>
</section>
${cta}
</div>
${helpers.exploreGrid(copies, "../", "blog")}`;
}
