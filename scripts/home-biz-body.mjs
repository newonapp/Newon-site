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
  visualCommerce,
} from "./home-story-visuals.mjs";
import { renderCompanyBefore, renderCompanyAfter } from "./home-company-body.mjs";

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
    case "commerce":
      return visualCommerce();
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

function ecoPoint(deg, r, cx = 300, cy = 300) {
  const a = (deg * Math.PI) / 180;
  return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
}

function ecoOrbitSvg() {
  const angles = [-90, -30, 30, 90, 150, 210];
  const spokes = angles
    .map((deg) => {
      const [x, y] = ecoPoint(deg, 214);
      return `<line x1="300" y1="300" x2="${x}" y2="${y}" />`;
    })
    .join("");
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const deg = i * 5 - 90;
    const [x1, y1] = ecoPoint(deg, i % 6 === 0 ? 236 : 240);
    const [x2, y2] = ecoPoint(deg, 248);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
  }).join("");
  const dots = angles
    .map((deg) => {
      const [x, y] = ecoPoint(deg, 176);
      return `<circle cx="${x}" cy="${y}" r="2.2" />`;
    })
    .join("");
  return `<svg class="hs-story-eco__lines" viewBox="0 0 600 600" aria-hidden="true">
        <g class="hs-story-eco__rings" fill="none">
          <circle class="hs-story-eco__ring hs-story-eco__ring--outer" cx="300" cy="300" r="228" />
          <circle class="hs-story-eco__ring hs-story-eco__ring--mid" cx="300" cy="300" r="176" />
          <circle class="hs-story-eco__ring hs-story-eco__ring--inner" cx="300" cy="300" r="86" />
        </g>
        <g class="hs-story-eco__ticks">${ticks}</g>
        <g class="hs-story-eco__spokes">${spokes}</g>
        <g class="hs-story-eco__dots">${dots}</g>
      </svg>`;
}

function ecoHtml(copy, lang) {
  const e = copy.eco;
  const byId = Object.fromEntries(copy.stories.map((s) => [s.id, s]));
  const nodes = copy.rail
    .map((n, i) => {
      const story = byId[n.id] || {};
      const num = story.n || String(i + 1).padStart(2, "0");
      const role = story.cat || "";
      return `<a class="hs-story-eco__node hs-story-eco__node--${i + 1}" href="#story-${escapeHtml(n.id)}">
        <span class="hs-story-eco__num">${escapeHtml(num)}</span>
        <span class="hs-story-eco__lab">${escapeHtml(n.label)}</span>
        <span class="hs-story-eco__role">${escapeHtml(role)}</span>
      </a>`;
    })
    .join("");
  return `<section id="${escapeHtml(e.id)}" class="hs-story-eco" data-hs-section aria-labelledby="story-eco-title">
  <div class="hs-story-eco__inner">
    <div class="hs-story-eco__copy">
      <p class="hs-story-eco__kicker">${escapeHtml(e.kicker)}</p>
      <h2 id="story-eco-title" class="hs-story-eco__title">${e.titleHtml}</h2>
      <p class="hs-story-eco__lead">${escapeHtml(e.lead)}</p>
      <p class="hs-story-eco__note">${escapeHtml(e.note)}</p>
    </div>
    <div class="hs-story-eco__stage">
      ${ecoOrbitSvg()}
      <div class="hs-story-eco__core" aria-hidden="true"><span>${escapeHtml(e.center)}</span></div>
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

  return `${renderCompanyBefore(L)}
${stories}
${ecoHtml(copy, L)}
${renderCompanyAfter(L)}`;
}
