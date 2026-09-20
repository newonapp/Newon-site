/**
 * Homepage below-hero: 6-business scroll storytelling.
 * Hero is never modified here.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getStoryCopy } from "./home-biz-copy.mjs";
import { getCompanyProjects } from "./company-portfolio-data.mjs";
import { APP_CATALOG, NAV_FLYOUT_SLUGS } from "./portfolio-data.mjs";
import {
  visualConsumer,
  visualAi,
  visualLifeStage,
  visualOngil,
  visualBusiness,
  visualStudio,
} from "./home-story-visuals.mjs";

const PRODUCT_SLUGS = [...NAV_FLYOUT_SLUGS];
const HOME_HASH_BY_SLUG = Object.fromEntries(
  APP_CATALOG.filter((a) => a.homeHash).map((a) => [a.slug, a.homeHash])
);

function langDir(lang) {
  return lang || "en";
}

function pageHref(lang, path) {
  if (!path || path.startsWith("#") || path.startsWith("/") || /^https?:/.test(path)) return path;
  return `/${langDir(lang)}/${path.replace(/^\.\//, "")}`;
}

function productHref(slug, lang) {
  if (slug === "404-human") return pageHref(lang, "404-human/");
  const hash = HOME_HASH_BY_SLUG[slug];
  if (hash) {
    if (hash.endsWith("/")) return hash.replace(/^\//, "");
    return hash.startsWith("#") ? hash : `#${hash}`;
  }
  return pageHref(lang, `portfolio/${slug}/`);
}

function projectsBySlug(lang) {
  const list = getCompanyProjects(lang === "ko" ? "ko" : "en");
  return Object.fromEntries(list.map((p) => [p.slug, p]));
}

function storyVisual(story, bySlug, lang) {
  switch (story.id) {
    case "consumer": {
      const apps = PRODUCT_SLUGS.slice(0, 8)
        .map((s) => bySlug[s])
        .filter((p) => p && p.icon)
        .map((p) => ({
          name: p.name,
          icon: p.icon,
          href: productHref(p.slug, lang),
        }));
      return visualConsumer(apps);
    }
    case "ai":
      return visualAi(lang);
    case "lifestage":
      return visualLifeStage();
    case "ongil":
      return visualOngil();
    case "business":
      return visualBusiness();
    case "studio":
      return visualStudio();
    default:
      return "";
  }
}

function storySectionHtml(story, copy, bySlug, lang, index) {
  const flip = index % 2 === 1 ? " hs-story--flip" : "";
  const nameLine =
    story.nameKo && story.nameKo !== story.name
      ? `${escapeHtml(story.name)} · ${escapeHtml(story.nameKo)}`
      : escapeHtml(story.name);
  const statusKey = story.status || "planned";
  const statusLabel =
    (copy.statusLabels && copy.statusLabels[statusKey]) || statusKey;
  const statusBadge = `<span class="hs-story__status hs-story__status--${escapeHtml(statusKey)}">${escapeHtml(statusLabel)}</span>`;
  const keys = (story.keys || [])
    .map((k) => `<li>${escapeHtml(k)}</li>`)
    .join("");
  const cta =
    story.cta && story.ctaHref
      ? `<a class="hs-story__cta" href="${escapeHtml(pageHref(lang, story.ctaHref))}">${escapeHtml(story.cta)}</a>`
      : `<span class="hs-story__planned">${escapeHtml(copy.plannedNote)}</span>`;
  const next = story.next
    ? `<p class="hs-story__next">${escapeHtml(copy.nextLabel)} · ${escapeHtml(story.next)}</p>`
    : "";
  const note = story.note ? `<p class="hs-story__note">${escapeHtml(story.note)}</p>` : "";

  return `<section id="story-${escapeHtml(story.id)}" class="hs-story hs-story--${escapeHtml(story.tone)}${flip}" data-hs-section data-story="${escapeHtml(story.id)}" aria-labelledby="story-${escapeHtml(story.id)}-title">
  <div class="hs-story__inner">
    <div class="hs-story__copy">
      <p class="hs-story__meta"><span class="hs-story__n">${escapeHtml(story.n)} / 06</span></p>
      <p class="hs-story__name">${nameLine}${statusBadge}</p>
      <p class="hs-story__cat">${escapeHtml(story.cat)}</p>
      <h2 id="story-${escapeHtml(story.id)}-title" class="hs-story__title">${story.titleHtml}</h2>
      <p class="hs-story__lead">${escapeHtml(story.lead)}</p>
      ${note}
      <ul class="hs-story__keys">${keys}</ul>
      <div class="hs-story__actions">${cta}</div>
      ${next}
    </div>
    <div class="hs-story__media">${storyVisual(story, bySlug, lang)}</div>
  </div>
</section>`;
}

function ecoHtml(copy, lang) {
  const e = copy.eco;
  const nodes = copy.rail
    .map(
      (n, i) =>
        `<a class="hs-story-eco__node hs-story-eco__node--${i + 1}" href="#story-${escapeHtml(n.id)}">${escapeHtml(n.label)}</a>`
    )
    .join("");
  return `<section id="${escapeHtml(e.id)}" class="hs-story-eco" data-hs-section aria-labelledby="story-eco-title">
  <div class="hs-story-eco__inner">
    <p class="hs-story-eco__kicker">${escapeHtml(e.kicker)}</p>
    <h2 id="story-eco-title" class="hs-story-eco__title">${e.titleHtml}</h2>
    <p class="hs-story-eco__lead">${escapeHtml(e.lead)}</p>
    <p class="hs-story-eco__note">${escapeHtml(e.note)}</p>
    <div class="hs-story-eco__stage">
      <svg class="hs-story-eco__lines" viewBox="0 0 400 400" aria-hidden="true">
        <circle cx="200" cy="200" r="118" fill="none" stroke="currentColor" stroke-width="1"/>
        <g stroke="currentColor" stroke-width="1">
          <line x1="200" y1="200" x2="200" y2="72"/>
          <line x1="200" y1="200" x2="310" y2="136"/>
          <line x1="200" y1="200" x2="310" y2="264"/>
          <line x1="200" y1="200" x2="200" y2="328"/>
          <line x1="200" y1="200" x2="90" y2="264"/>
          <line x1="200" y1="200" x2="90" y2="136"/>
        </g>
      </svg>
      <div class="hs-story-eco__core" aria-hidden="true">${escapeHtml(e.center)}</div>
      ${nodes}
    </div>
    <div class="hs-story-eco__actions">
      <a class="hs-story__cta hs-story__cta--ghost" href="${escapeHtml(pageHref(lang, e.ctaAboutHref))}">${escapeHtml(e.ctaAbout)}</a>
      <a class="hs-story__cta" href="${escapeHtml(pageHref(lang, e.ctaInquiryHref))}">${escapeHtml(e.ctaInquiry)}</a>
    </div>
  </div>
</section>`;
}

/** @param {string} lang */
export function buildBizHomeBody(lang) {
  const L = lang || "en";
  const copyLang = L === "ko" ? "ko" : "en";
  const copy = getStoryCopy(L);
  const bySlug = projectsBySlug(copyLang);

  const stories = copy.stories
    .map((s, i) => storySectionHtml(s, copy, bySlug, L, i))
    .join("\n");

  return `${stories}
${ecoHtml(copy, L)}`;
}
