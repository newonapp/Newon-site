/**
 * Resources > Media hub body — Instagram / YouTube Media Library.
 */
import { escapeHtml } from "./hub-utils.mjs";
import {
  getSocialLinks,
  getMediaHubItems,
  getFeaturedMediaItem,
  getMediaByPlatform,
  getActiveMediaSeries,
  iso8601Duration,
} from "./media-data.mjs";

function t(item, lang, koKey, enKey) {
  return lang === "ko" ? item[koKey] || item[enKey] || "" : item[enKey] || item[koKey] || "";
}

function displayDate(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 10).replace(/-/g, ".");
}

function platformLabel(platform) {
  return platform === "instagram" ? "INSTAGRAM" : "YOUTUBE";
}

function extAttrs() {
  return `target="_blank" rel="noopener noreferrer"`;
}

function thumbHtml(item, className = "mh-thumb") {
  const alt = escapeHtml(t(item, "ko", "titleKo", "titleEn") || "Newon media");
  const src = item.thumbnail
    ? `<img class="${className}__img" src="${escapeHtml(item.thumbnail)}" alt="${alt}" loading="lazy" decoding="async" width="640" height="360" onerror="this.closest('.${className}').classList.add('is-fallback')" />`
    : "";
  return `<div class="${className}${item.thumbnail ? "" : " is-fallback"}" data-mh-thumb>
    ${src}
    <span class="${className}__fallback" aria-hidden="true"></span>
  </div>`;
}

function playButton(item, copy) {
  const label =
    item.platform === "youtube"
      ? escapeHtml(copy.playLabel || "Play video")
      : escapeHtml(copy.viewReelLabel || "View on Instagram");
  if (item.platform === "youtube" && item.embedUrl) {
    return `<button type="button" class="mh-play" data-mh-play aria-label="${label}">
      <span class="mh-play__icon" aria-hidden="true"></span>
    </button>`;
  }
  return `<span class="mh-play mh-play--link" aria-hidden="true"><span class="mh-play__icon"></span></span>`;
}

function watchLabel(item, copy) {
  if (item.platform === "instagram") {
    return escapeHtml(copy.viewInstagram || "View on Instagram ↗");
  }
  return escapeHtml(copy.watchYoutube || "Watch on YouTube ↗");
}

function cardHtml(item, copy, lang, opts = {}) {
  const title = escapeHtml(t(item, lang, "titleKo", "titleEn"));
  const desc = escapeHtml(t(item, lang, "descriptionKo", "descriptionEn"));
  const cat = escapeHtml(item.category || "");
  const plat = escapeHtml(platformLabel(item.platform));
  const date = displayDate(item.date);
  const dur = item.duration ? escapeHtml(item.duration) : "";
  const canPlay = item.platform === "youtube" && item.embedUrl;
  const tag = canPlay ? "div" : "a";
  const href = canPlay ? "" : ` href="${escapeHtml(item.url)}" ${extAttrs()}`;
  const playable = canPlay
    ? ` data-mh-inline data-mh-embed="${escapeHtml(item.embedUrl)}" data-mh-title="${title}"`
    : "";

  return `<${tag} class="mh-card" data-category="${cat.toLowerCase()}" data-collection="${escapeHtml(
    item.platform
  )}" data-rs-reveal${playable}${canPlay ? ' tabindex="0" role="group"' : ""}${href}>
    <div class="mh-card__media">
      ${thumbHtml(item, "mh-thumb")}
      ${playButton(item, copy)}
      ${dur ? `<span class="mh-card__dur">${dur}</span>` : ""}
    </div>
    <div class="mh-card__body">
      <p class="mh-card__meta"><span>${plat}</span><span aria-hidden="true"> · </span><span>${cat}</span></p>
      <h3 class="mh-card__title">${title}</h3>
      ${desc ? `<p class="mh-card__desc">${desc}</p>` : ""}
      <p class="mh-card__foot">
        ${date ? `<time datetime="${escapeHtml(item.date)}">${escapeHtml(date)}</time>` : ""}
        ${dur && date ? `<span aria-hidden="true"> · </span>` : ""}
        ${dur ? `<span>${dur}</span>` : ""}
      </p>
      ${
        canPlay
          ? `<a class="mh-link" href="${escapeHtml(item.url)}" ${extAttrs()}>${watchLabel(item, copy)}</a>`
          : `<span class="mh-link">${watchLabel(item, copy)}</span>`
      }
    </div>
  </${tag}>`;
}

function featuredHtml(item, copy, lang, social) {
  if (!item) return "";
  const title = escapeHtml(t(item, lang, "titleKo", "titleEn"));
  const desc = escapeHtml(t(item, lang, "descriptionKo", "descriptionEn"));
  const cat = escapeHtml(item.category || "");
  const plat = escapeHtml(platformLabel(item.platform));
  const date = displayDate(item.date);
  const canPlay = item.platform === "youtube" && item.embedUrl;
  const watch =
    item.platform === "instagram"
      ? escapeHtml(copy.viewInstagram || "View on Instagram ↗")
      : escapeHtml(copy.watchYoutube || "Watch on YouTube ↗");

  const player = canPlay
    ? `<div class="mh-featured__player" data-mh-inline data-mh-embed="${escapeHtml(
        item.embedUrl
      )}" data-mh-title="${title}" tabindex="0">
      ${thumbHtml(item, "mh-thumb mh-thumb--featured")}
      ${playButton(item, copy)}
    </div>`
    : `<a class="mh-featured__player mh-featured__player--link" href="${escapeHtml(item.url)}" ${extAttrs()}>
      ${thumbHtml(item, "mh-thumb mh-thumb--featured")}
      ${playButton(item, copy)}
    </a>`;

  return `<section class="mh-featured" aria-labelledby="mh-featured-title" data-rs-reveal>
    <div class="mh-featured__grid">
      ${player}
      <div class="mh-featured__copy">
        <p class="mh-eyebrow mh-eyebrow--inline">${escapeHtml(copy.featuredTitle || "FEATURED")}</p>
        <h2 class="mh-featured__title" id="mh-featured-title">${title}</h2>
        <p class="mh-featured__desc">${desc}</p>
        <p class="mh-featured__meta">
          <span>${plat}</span><span aria-hidden="true"> · </span><span>${cat}</span>
          ${date ? `<span aria-hidden="true"> · </span><time datetime="${escapeHtml(item.date)}">${escapeHtml(date)}</time>` : ""}
          ${item.duration ? `<span aria-hidden="true"> · </span><span>${escapeHtml(item.duration)}</span>` : ""}
        </p>
        <a class="mh-link" href="${escapeHtml(item.url)}" ${extAttrs()}>${watch}</a>
      </div>
    </div>
  </section>`;
}

function socialDirHtml(copy, social) {
  return `<section class="mh-social" aria-label="${escapeHtml(copy.socialAria || "Social")}">
    <a class="mh-social__row" href="${escapeHtml(social.instagram)}" ${extAttrs()}>
      <span class="mh-social__brand">
        <svg class="mh-social__icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.668-.072-4.948-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        INSTAGRAM
      </span>
      <span class="mh-social__desc">${escapeHtml(copy.igDirDesc || "Short videos, product moments and updates")}</span>
      <span class="mh-social__go">${escapeHtml(copy.viewIgDir || "View Instagram ↗")}</span>
    </a>
    <a class="mh-social__row" href="${escapeHtml(social.youtube)}" ${extAttrs()}>
      <span class="mh-social__brand">
        <svg class="mh-social__icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        YOUTUBE
      </span>
      <span class="mh-social__desc">${escapeHtml(copy.ytDirDesc || "Product demos, builds and longer stories")}</span>
      <span class="mh-social__go">${escapeHtml(copy.viewYtDir || "View YouTube ↗")}</span>
    </a>
  </section>`;
}

function seriesHtml(copy, lang) {
  const series = getActiveMediaSeries();
  if (!series.length) return "";
  const items = series
    .map((s) => {
      const title = escapeHtml(lang === "ko" ? s.titleKo : s.titleEn);
      const desc = escapeHtml(lang === "ko" ? s.descKo : s.descEn);
      const cat = escapeHtml(String(s.category || "").toLowerCase());
      return `<button type="button" class="mh-series__item" data-mh-series-filter="${cat}">
        <span class="mh-series__title">${title}</span>
        <span class="mh-series__desc">${desc}</span>
      </button>`;
    })
    .join("");
  return `<section class="mh-series" aria-labelledby="mh-series-title">
    <h2 class="mh-eyebrow" id="mh-series-title">${escapeHtml(copy.seriesTitle || "SERIES")}</h2>
    <div class="mh-series__list">${items}</div>
  </section>`;
}

function platformSection(platform, items, copy, lang, social) {
  if (!items.length) return "";
  const isIg = platform === "instagram";
  const title = escapeHtml(isIg ? copy.fromInstagram || "FROM INSTAGRAM" : copy.fromYoutube || "FROM YOUTUBE");
  const viewAll = isIg
    ? `<a class="mh-link" href="${escapeHtml(social.instagram)}" ${extAttrs()}>${escapeHtml(
        copy.viewAllIg || "View all on Instagram ↗"
      )}</a>`
    : `<a class="mh-link" href="${escapeHtml(social.youtube)}" ${extAttrs()}>${escapeHtml(
        copy.viewAllYt || "View all on YouTube ↗"
      )}</a>`;

  const cards = items
    .slice(0, isIg ? 6 : 6)
    .map((item) => {
      if (isIg) {
        const titleT = escapeHtml(t(item, lang, "titleKo", "titleEn"));
        const date = displayDate(item.date);
        return `<a class="mh-ig-card" href="${escapeHtml(item.url)}" ${extAttrs()} data-rs-reveal>
          ${thumbHtml(item, "mh-thumb mh-thumb--square")}
          <span class="mh-ig-card__type">${escapeHtml(item.igType || "REEL")}</span>
          <span class="mh-ig-card__title">${titleT}</span>
          ${date ? `<time datetime="${escapeHtml(item.date)}">${escapeHtml(date)}</time>` : ""}
          <span class="mh-link">${escapeHtml(copy.viewInstagram || "View on Instagram ↗")}</span>
        </a>`;
      }
      return cardHtml(item, copy, lang);
    })
    .join("");

  return `<section class="mh-platform" aria-labelledby="mh-${platform}-title">
    <div class="mh-platform__head">
      <h2 class="mh-eyebrow" id="mh-${platform}-title">${title}</h2>
      ${viewAll}
    </div>
    <div class="${isIg ? "mh-ig-grid" : "mh-grid"}">${cards}</div>
  </section>`;
}

function videoJsonLd(items) {
  const videos = items.filter((m) => m.platform === "youtube" && m.thumbnail && m.date && m.durationSeconds);
  if (!videos.length) return "";
  const nodes = videos.slice(0, 12).map((m) => {
    const dur = iso8601Duration(m.durationSeconds);
    const obj = {
      "@type": "VideoObject",
      name: m.titleEn || m.titleKo,
      description: m.descriptionEn || m.descriptionKo,
      thumbnailUrl: [m.thumbnail],
      uploadDate: m.date,
      contentUrl: m.url,
      embedUrl: m.embedUrl,
    };
    if (dur) obj.duration = dur;
    return obj;
  });
  const payload = {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
  return `<script type="application/ld+json">${JSON.stringify(payload).replace(/</g, "\\u003c")}</script>`;
}

/**
 * @param {object} copies
 * @param {'ko'|'en'} lang
 * @param {{ breadcrumb: Function, resourceSwitcher: Function, exploreGrid: Function }} helpers
 */
export function buildMediaHubBody(copies, lang, helpers) {
  const copy = copies.media;
  const social = getSocialLinks(lang);
  const all = getMediaHubItems();
  const featured = getFeaturedMediaItem();
  const listItems = featured ? all.filter((m) => m.id !== featured.id) : all;
  const ig = getMediaByPlatform("instagram");
  const yt = getMediaByPlatform("youtube");

  const filters = Object.entries(
    copy.filterLabels || {
      all: "ALL",
      youtube: "YOUTUBE",
      instagram: "INSTAGRAM",
      product: "PRODUCT",
      build: "BUILD",
      design: "DESIGN",
      newon: "NEWON",
    }
  )
    .map(
      ([k, v]) =>
        `<button type="button" class="mh-filter${k === "all" ? " is-active" : ""}" data-rs-filter="${escapeHtml(
          k
        )}" aria-pressed="${k === "all" ? "true" : "false"}">${escapeHtml(v)}</button>`
    )
    .join("");

  const cards = listItems.map((m) => cardHtml(m, copy, lang)).join("");
  const emptyMsg = escapeHtml(copy.filterEmpty || "No media yet.");

  const hero = `<header class="mh-hero">
    <div class="rs-inner mh-hero__inner">
      <div class="mh-hero__copy">
        <p class="mh-eyebrow">${escapeHtml(copy.eyebrow || "NEWON MEDIA")}</p>
        <h1 class="mh-hero__title">${escapeHtml(copy.headline || "Media")}</h1>
        <p class="mh-hero__lead">${escapeHtml(copy.lead || "")}</p>
        ${copy.subLead ? `<p class="mh-hero__sub">${escapeHtml(copy.subLead)}</p>` : ""}
      </div>
      <div class="mh-hero__links">
        <a class="mh-ext" href="${escapeHtml(social.instagram)}" ${extAttrs()}>${escapeHtml(
    copy.igHeroLink || "Instagram ↗"
  )}</a>
        <a class="mh-ext" href="${escapeHtml(social.youtube)}" ${extAttrs()}>${escapeHtml(
    copy.ytHeroLink || "YouTube ↗"
  )}</a>
      </div>
    </div>
  </header>`;

  const latest =
    all.length === 0
      ? `<div class="mh-empty" data-rs-reveal>
      <p class="mh-empty__title">${escapeHtml(copy.emptyTitle || "No media yet.")}</p>
      <p class="mh-empty__lead">${escapeHtml(copy.emptyLead || "")}</p>
    </div>`
      : `
    ${featuredHtml(featured, copy, lang, social)}
    <div class="mh-filters" data-rs-filters role="tablist" aria-label="${escapeHtml(
      copy.filterAria || "Filter media"
    )}">${filters}</div>
    <section class="mh-latest" aria-labelledby="mh-latest-title">
      <h2 class="mh-eyebrow" id="mh-latest-title">${escapeHtml(copy.latestTitle || "LATEST MEDIA")}</h2>
      <div class="mh-grid" data-rs-filter-grid>${cards}</div>
      <p class="mh-filter-empty" data-rs-filter-empty hidden>${emptyMsg}<br /><span class="mh-filter-empty__sub">${escapeHtml(
          copy.filterEmptySub || "현재 등록된 콘텐츠가 없습니다."
        )}</span></p>
    </section>
    ${seriesHtml(copy, lang)}
    ${platformSection("instagram", ig, copy, lang, social)}
    ${platformSection("youtube", yt, copy, lang, social)}`;

  const cta = `<section class="mh-cta" data-rs-reveal>
    <div class="rs-inner">
      <p class="mh-eyebrow">${escapeHtml(copy.followEyebrow || "FOLLOW NEWON")}</p>
      <h2 class="mh-cta__title">${escapeHtml(copy.followTitle || "")}</h2>
      <p class="mh-cta__lead">${escapeHtml(copy.followLead || "")}</p>
      <div class="mh-cta__links">
        <a class="mh-ext" href="${escapeHtml(social.instagram)}" ${extAttrs()}>${escapeHtml(
    copy.igHeroLink || "Instagram ↗"
  )}</a>
        <a class="mh-ext" href="${escapeHtml(social.youtube)}" ${extAttrs()}>${escapeHtml(
    copy.ytHeroLink || "YouTube ↗"
  )}</a>
      </div>
    </div>
  </section>`;

  return `${helpers.breadcrumb(copy, copy.navLabel || "MEDIA")}
${helpers.resourceSwitcher("media", copies)}
<div class="mh-page">
${hero}
<section class="mh-section" id="rs-content">
  <div class="rs-inner">
    ${socialDirHtml(copy, social)}
    ${latest}
  </div>
</section>
${cta}
</div>
${helpers.exploreGrid(copies, "../", "media")}
${videoJsonLd(yt)}`;
}
