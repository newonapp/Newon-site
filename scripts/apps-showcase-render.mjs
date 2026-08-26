/**
 * HTML builders for /apps/ premium showcase page.
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import {
  APP_CATEGORIES,
  appsCountLabel,
  appsEcosystem,
  appsForGrid,
  buildAppsShowcase,
} from "./apps-showcase-data.mjs";

const APPLE_SVG = `<svg class="apps-store__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`;

const PLAY_SVG = `<svg class="apps-store__icon apps-store__icon--play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="22" height="22" aria-hidden="true" focusable="false"><path fill="#00D9FF" d="M3 4.5v19l11-9.7L3 4.5z"/><path fill="#00F076" d="M15.4 14.3 25 20.8c.6-.4 1-1 1-1.8V9c0-.7-.4-1.4-1-1.8l-9.6 6.1z"/><path fill="#FFCE00" d="M15.4 13.7 25 7.2c-.6-.4-1.3-.6-2-.4L3 4.5l12.4 9.2z"/><path fill="#FF3A44" d="M3 23.5 23 21.2c.7.1 1.4-.1 2-.5L14 14l-11 9.5z"/></svg>`;

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return escapeHtml(v != null && v !== "" ? String(v) : fb);
}

function storeLinks(app, flat, flatEn) {
  const parts = [];
  const name = escapeHtml(app.name);
  if (app.appStoreUrl) {
    const tip = t(flat, flatEn, "studio.appsStoreAppleTip", "View on the App Store");
    const aria = t(flat, flatEn, "studio.appsStoreAppleAria", "{name} on the App Store").replace(
      "{name}",
      name
    );
    parts.push(
      `<a class="apps-store__badge apps-store__badge--apple" href="${escapeHtml(app.appStoreUrl)}" target="_blank" rel="noopener noreferrer" title="${tip}" aria-label="${aria}">
        ${APPLE_SVG}
        <span class="apps-store__text">
          <span class="apps-store__small">Download on</span>
          <span class="apps-store__name">App Store</span>
        </span>
      </a>`
    );
  }
  if (app.googlePlayUrl) {
    const tip = t(flat, flatEn, "studio.appsStoreGoogleTip", "View on Google Play");
    const aria = t(flat, flatEn, "studio.appsStoreGoogleAria", "{name} on Google Play").replace(
      "{name}",
      name
    );
    parts.push(
      `<a class="apps-store__badge apps-store__badge--google" href="${escapeHtml(app.googlePlayUrl)}" target="_blank" rel="noopener noreferrer" title="${tip}" aria-label="${aria}">
        ${PLAY_SVG}
        <span class="apps-store__text">
          <span class="apps-store__small">Get it on</span>
          <span class="apps-store__name">Google Play</span>
        </span>
      </a>`
    );
  }
  if (!parts.length) return "";
  return `<div class="apps-store" role="group" aria-label="${t(flat, flatEn, "studio.appsAvailableOn", "Available on")}">
    <span class="apps-store__label">${t(flat, flatEn, "studio.appsAvailableOn", "Available on")}</span>
    <div class="apps-store__btns">${parts.join("")}</div>
  </div>`;
}

function featureTags(features) {
  if (!features?.length) return "";
  return `<p class="apps-card__tags">${features.map((f) => `<span>${escapeHtml(f)}</span>`).join('<span class="apps-card__dot" aria-hidden="true">·</span>')}</p>`;
}

function heroMosaic(apps) {
  const picks = appsForGrid(apps);
  if (!picks.length) return "";
  return `<div class="apps-hero__mosaic" aria-hidden="true">
    ${picks
      .map(
        (a, i) =>
          `<span class="apps-hero__mosaic-item" style="--i:${i};--apps-tint:${escapeHtml(a.tint)}"><img src="${escapeHtml(a.icon)}" alt="" width="72" height="72" loading="eager" decoding="async" /></span>`
      )
      .join("")}
  </div>`;
}

function appCard(app, flat, flatEn, index) {
  const n = String(index + 1).padStart(2, "0");
  return `<article class="apps-card" data-apps-card data-category="${escapeHtml(app.category)}" data-slug="${escapeHtml(app.slug)}">
    <div class="apps-card__top">
      <div class="apps-card__icon-wrap" style="--apps-tint:${escapeHtml(app.tint)}">
        <img class="apps-card__icon" src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)}" width="72" height="72" loading="lazy" decoding="async" />
      </div>
      <span class="apps-card__idx" aria-hidden="true">${n}</span>
    </div>
    <p class="apps-card__cat">${escapeHtml(app.categoryLabel)}</p>
    <h3 class="apps-card__name">${escapeHtml(app.name)}</h3>
    <p class="apps-card__tagline">${escapeHtml(app.tagline)}</p>
    ${featureTags(app.features)}
    <div class="apps-card__foot">
      <a class="apps-card__cta" href="${escapeHtml(app.detailUrl)}">${t(flat, flatEn, "studio.appsLearnMore", "Learn more")} <span aria-hidden="true">→</span></a>
      ${storeLinks(app, flat, flatEn)}
    </div>
  </article>`;
}

function filterNav(flat, flatEn, gridApps) {
  const present = new Set(gridApps.map((a) => a.category));
  const cats = APP_CATEGORIES.filter((c) => c.id === "all" || present.has(c.id));
  return `<nav class="apps-filters" data-apps-filters aria-label="${t(flat, flatEn, "studio.appsFilterAria", "Filter apps")}">
    <div class="apps-filters__inner hub-inner">
      <div class="apps-filters__track">
        ${cats
          .map(
            (c, i) =>
              `<button type="button" class="apps-filter${i === 0 ? " is-active" : ""}" data-filter="${c.id}">${t(flat, flatEn, c.labelKey, c.labelEn)}</button>`
          )
          .join("")}
      </div>
    </div>
  </nav>`;
}

function ecosystemBlock(app, allApps, flat, flatEn) {
  if (!app) return "";
  const icons = appsForGrid(allApps)
    .map(
      (a) =>
        `<span class="apps-eco__orbit-item" style="--apps-tint:${escapeHtml(a.tint)}"><img src="${escapeHtml(a.icon)}" alt="" width="40" height="40" loading="lazy" decoding="async" /></span>`
    )
    .join("");
  return `<section class="apps-eco hub-inner" data-apps-section>
    <div class="apps-eco__panel">
      <div class="apps-eco__copy">
        <p class="apps-eco__eyebrow">${t(flat, flatEn, "studio.appsEcoLabel", "NEWON+")}</p>
        <h2 class="apps-eco__title">${t(flat, flatEn, "studio.appsEcoTitle", "One account connects Newon services.")}</h2>
        <p class="apps-eco__lead">${escapeHtml(app.tagline)}</p>
        <a class="btn btn-primary" href="${escapeHtml(app.detailUrl)}">${t(flat, flatEn, "studio.appsEcoCta", "Learn about Newon+")} →</a>
      </div>
      <div class="apps-eco__visual">
        <div class="apps-eco__logo-wrap">
          <img src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)}" width="88" height="88" loading="lazy" decoding="async" />
        </div>
        <div class="apps-eco__orbit" aria-hidden="true">${icons}</div>
      </div>
    </div>
  </section>`;
}

function discoverIcons(apps) {
  return appsForGrid(apps)
    .map(
      (a) =>
        `<span class="apps-discover__icon" style="--apps-tint:${escapeHtml(a.tint)}"><img src="${escapeHtml(a.icon)}" alt="" width="44" height="44" loading="lazy" decoding="async" /></span>`
    )
    .join("");
}

export function renderAppsShowcaseBody(flat, flatEn, lang) {
  const dir = lang.dir || lang;
  const apps = buildAppsShowcase(dir);
  const gridApps = appsForGrid(apps);
  const eco = appsEcosystem(apps);
  const count = appsCountLabel(apps);

  const cards = gridApps.map((a, i) => appCard(a, flat, flatEn, i)).join("\n");

  return `<div class="apps-page" data-apps-page>
  <section class="apps-hero hub-inner">
    <div class="apps-hero__layout">
      <div class="apps-hero__copy">
        <p class="apps-hero__eyebrow">${t(flat, flatEn, "studio.appsHeroLabel", "NEWON PRODUCTS / APPS")}</p>
        <h1 class="apps-hero__title">${t(flat, flatEn, "studio.appsHeroTitle", "Apps designed for everyday life.")}</h1>
        <p class="apps-hero__lead">${t(flat, flatEn, "studio.appsHeroLead", "")}</p>
        <div class="apps-hero__actions">
          <a class="btn btn-primary" href="#apps-grid">${t(flat, flatEn, "studio.appsCtaBrowse", "Browse apps")} ↓</a>
          <a class="btn btn-ghost" href="${escapeHtml(eco?.detailUrl || "../#newon-plus-app")}">${t(flat, flatEn, "studio.appsCtaNewonPlus", "Learn about Newon+")} →</a>
        </div>
        <ul class="apps-hero__stats" aria-label="${t(flat, flatEn, "studio.appsStatsAria", "Product stats")}">
          <li><strong>${escapeHtml(count)}</strong><span>${t(flat, flatEn, "studio.appsStatApps", "Apps")}</span></li>
          <li><strong>iOS &amp; Android</strong><span>${t(flat, flatEn, "studio.appsStatPlatforms", "Platforms")}</span></li>
          <li><strong>${t(flat, flatEn, "studio.appsStatGlobalValue", "177 countries")}</strong><span>${t(flat, flatEn, "studio.appsStatGlobal", "Availability")}</span></li>
          <li><strong>${t(flat, flatEn, "studio.appsStatLangValue", "13 languages")}</strong><span>${t(flat, flatEn, "studio.appsStatLang", "Languages")}</span></li>
        </ul>
      </div>
      ${heroMosaic(apps)}
    </div>
  </section>

  ${filterNav(flat, flatEn, gridApps)}

  <section id="apps-grid" class="apps-grid-section hub-inner" data-apps-section>
    <header class="apps-section-head apps-section-head--row">
      <div>
        <p class="apps-section-head__eyebrow">${t(flat, flatEn, "studio.appsGridLabel", "ALL APPS")}</p>
        <h2 class="apps-section-head__title">${t(flat, flatEn, "studio.appsGridTitle", "Find the right Newon app")}</h2>
      </div>
      <p class="apps-section-head__count"><strong>${escapeHtml(count)}</strong> apps</p>
    </header>
    <div class="apps-grid" data-apps-grid>${cards}</div>
    <p class="apps-grid__empty" data-apps-empty hidden>${t(flat, flatEn, "studio.appsFilterEmpty", "No apps in this category yet.")}</p>
  </section>

  ${ecosystemBlock(eco, apps, flat, flatEn)}

  <section class="apps-discover" data-apps-section>
    <div class="apps-discover__inner hub-inner">
      <div class="apps-discover__copy">
        <p class="apps-discover__eyebrow">${t(flat, flatEn, "studio.appsDiscoverLabel", "DISCOVER NEWON")}</p>
        <h2 class="apps-discover__title">${t(flat, flatEn, "studio.appsDiscoverTitle", "Find the Newon that fits your day.")}</h2>
        <p class="apps-discover__lead">${t(flat, flatEn, "studio.appsDiscoverLead", "")}</p>
        <div class="apps-discover__actions">
          <a class="btn btn-primary apps-discover__btn" href="../products/">${t(flat, flatEn, "studio.appsDiscoverCtaProducts", "View all products")}</a>
          <a class="btn btn-ghost apps-discover__btn apps-discover__btn--ghost" href="${escapeHtml(eco?.detailUrl || "../#newon-plus-app")}">${t(flat, flatEn, "studio.appsDiscoverCtaPlus", "Learn about Newon+")}</a>
        </div>
      </div>
      <div class="apps-discover__icons" aria-hidden="true">${discoverIcons(apps)}</div>
    </div>
  </section>
</div>`;
}
