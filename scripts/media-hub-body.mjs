/**
 * Company > Media hub — Instagram / YouTube Media Library.
 * Canonical: /{lang}/media/
 */
import { escapeHtml } from "./hub-utils.mjs";
import {
  getSocialLinks,
  getMediaHubItems,
  getMediaByPlatform,
  iso8601Duration,
} from "./media-data.mjs";

const LATEST_LIMIT = 8;
const PLATFORM_LIMIT = 4;

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

function cardHtml(item, copy, lang) {
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

function platformSection(platform, items, copy, lang, social) {
  const slice = items.slice(0, PLATFORM_LIMIT);
  if (!slice.length) return "";
  const isIg = platform === "instagram";
  const title = escapeHtml(isIg ? copy.fromInstagram || "FROM INSTAGRAM" : copy.fromYoutube || "FROM YOUTUBE");
  const viewAll = isIg
    ? `<a class="mh-link" href="${escapeHtml(social.instagram)}" ${extAttrs()}>${escapeHtml(
        copy.viewAllIg || "View all on Instagram ↗"
      )}</a>`
    : `<a class="mh-link" href="${escapeHtml(social.youtube)}" ${extAttrs()}>${escapeHtml(
        copy.viewAllYt || "View all on YouTube ↗"
      )}</a>`;

  const cards = slice
    .map((item) => {
      if (isIg) {
        const titleT = escapeHtml(t(item, lang, "titleKo", "titleEn"));
        const date = displayDate(item.date);
        return `<a class="mh-ig-card" href="${escapeHtml(item.url)}" ${extAttrs()} data-rs-reveal data-category="${escapeHtml(
          String(item.category || "").toLowerCase()
        )}" data-collection="instagram">
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
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c")}</script>`;
}

function companyCrumb(copy, lang) {
  const company = escapeHtml(lang === "ko" ? "회사" : "COMPANY");
  const media = escapeHtml(copy.navLabel || "MEDIA");
  return `<nav class="rs-crumb" aria-label="Breadcrumb">
    <div class="rs-inner">
      <a href="../about/">${company}</a>
      <span class="rs-crumb__sep" aria-hidden="true">/</span>
      <span>${media}</span>
    </div>
  </nav>`;
}

/**
 * @param {object} copies
 * @param {'ko'|'en'} lang
 * @param {{ companySwitcher?: string }} [opts]
 */
export function buildMediaHubBody(copies, lang, opts = {}) {
  const copy = copies.media;
  const social = getSocialLinks(lang);
  const all = getMediaHubItems();
  const listItems = all.slice(0, LATEST_LIMIT);
  const ig = getMediaByPlatform("instagram");
  const yt = getMediaByPlatform("youtube");
  const emptyMsg = escapeHtml(
    lang === "ko"
      ? copy.filterEmptyKo || "이 카테고리에 해당하는 콘텐츠가 없습니다."
      : copy.filterEmpty || "No media in this category."
  );

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
    <div data-rs-filters data-rs-filter-scope>
    <div class="mh-filters" role="tablist" aria-label="${escapeHtml(copy.filterAria || "Filter media")}">${filters}</div>
    <section class="mh-latest" aria-labelledby="mh-latest-title">
      <h2 class="mh-eyebrow" id="mh-latest-title">${escapeHtml(copy.latestTitle || "LATEST MEDIA")}</h2>
      <div class="mh-grid" data-rs-filter-grid>${cards}</div>
      <p class="mh-filter-empty" data-rs-filter-empty hidden>${emptyMsg}</p>
    </section>
    </div>
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

  return `${companyCrumb(copy, lang)}
${opts.companySwitcher || ""}
<div class="mh-page">
${hero}
<section class="mh-section" id="rs-content">
  <div class="rs-inner">
    ${latest}
  </div>
</section>
${cta}
</div>
${videoJsonLd(yt)}`;
}
