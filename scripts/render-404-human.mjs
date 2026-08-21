#!/usr/bin/env node
/**
 * Renders /{lang}/404-human/index.html for all languages + /404-human/ redirect stub.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  fhKo,
  fhEn,
  fhTimeline as fhTimelineKo,
  fhTimelineEn,
} from "./human404-data.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ORIGIN = "https://www.newon.app";
const I18N_PATH = path.join(ROOT, "scripts", "human404-i18n.json");

const LANGS = [
  { dir: "ko", file: "ko.json", htmlLang: "ko", hreflang: "ko" },
  { dir: "en", file: "en.json", htmlLang: "en", hreflang: "en" },
  { dir: "ja", file: "ja.json", htmlLang: "ja", hreflang: "ja" },
  { dir: "es", file: "es.json", htmlLang: "es", hreflang: "es" },
  { dir: "pt-br", file: "pt-br.json", htmlLang: "pt-BR", hreflang: "pt-BR" },
  { dir: "fr", file: "fr.json", htmlLang: "fr", hreflang: "fr" },
  { dir: "de", file: "de.json", htmlLang: "de", hreflang: "de" },
  { dir: "hi", file: "hi.json", htmlLang: "hi", hreflang: "hi" },
  { dir: "id", file: "id.json", htmlLang: "id", hreflang: "id" },
];

const APP_DEFS = [
  { hash: "ox-month", logo: "/ox-month-logo.png", name: "OX MONTH", descKey: "nav.oxDesc" },
  { hash: "subping-app", logo: "/subping-logo.png", name: "SubPing", descKey: "nav.subpingDesc" },
  { hash: "pillmate-app", logo: "/pillmate-logo.png", name: "Pillmate", descKey: "nav.pillmateDesc" },
  { hash: "savy-app", logo: "/savy-logo.png", name: "SAVY", descKey: "nav.savyDesc" },
  { hash: "babylog-app", logo: "/babylog-logo.png", name: "BabyLog", descKey: "nav.babylogDesc" },
  { hash: "petlog-app", logo: "/petlog-logo.png", name: "PetLog", descKey: "nav.petlogDesc" },
  { hash: "piggyup-app", logo: "/piggyup-logo.png", name: "PiggyUp", descKey: "nav.piggyupDesc" },
  { hash: "goalup-app", logo: "/goalup-logo.png", name: "GoalUp", descKey: "nav.goalupDesc" },
  { hash: "countup-app", logo: "/countup-logo.png", name: "CountUp", descKey: "nav.countupDesc" },
  { hash: "newon-plus-app", logo: "/newon-plus-logo.png", name: "Newon", descKey: "nav.newonPlusDesc" },
  { hash: "myworld-app", logo: "/myworld-logo.png", name: "My World", descKey: "nav.myworldDesc" },
];

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
}

function flatten(obj, prefix = "") {
  const out = {};
  if (obj == null) return out;
  if (typeof obj !== "object") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

function pick(flat, flatEn, key) {
  let val = flat[key];
  if (val === undefined || val === null || val === "") val = flatEn[key];
  return val != null ? String(val) : "";
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hreflangBlock() {
  const lines = LANGS.map(
    ({ dir, hreflang }) =>
      `    <link rel="alternate" hreflang="${hreflang}" href="${SITE_ORIGIN}/${dir}/404-human/" />`
  );
  lines.push(
    `    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/404-human/" />`
  );
  return lines.join("\n");
}

function langOptions(dir) {
  const opts = [
    ["ko", "한국어"],
    ["en", "English"],
    ["ja", "日本語"],
    ["es", "Español"],
    ["pt-br", "Português (Brasil)"],
    ["fr", "Français"],
    ["de", "Deutsch"],
    ["hi", "हिन्दी"],
    ["id", "Bahasa Indonesia"],
  ];
  return opts
    .map(
      ([v, label]) =>
        `                  <option value="${v}"${v === dir ? " selected" : ""}>${label}</option>`
    )
    .join("\n");
}

function flyoutItem(app) {
  const name = app.badge
    ? `${esc(app.name)} <span class="apps-flyout__badge">${esc(app.badge)}</span>`
    : esc(app.name);
  const cls = app.current ? "apps-flyout__item apps-flyout__item--current" : "apps-flyout__item";
  const cur = app.current ? ' aria-current="page"' : "";
  return `<a href="${esc(app.href)}" role="menuitem" class="${cls}"${cur}>
                  <span class="apps-flyout__icon"><img src="${esc(app.logo)}" alt="" width="44" height="44" loading="lazy" /></span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">${name}</span>
                    <span class="apps-flyout__desc">${esc(app.desc)}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;
}

function mobileItem(app) {
  const name = app.badge
    ? `${esc(app.name)} <span class="mobile-apps-drawer__badge">${esc(app.badge)}</span>`
    : esc(app.name);
  const cls = app.current
    ? "mobile-apps-drawer__item mobile-apps-drawer__item--current"
    : "mobile-apps-drawer__item";
  return `<a href="${esc(app.href)}" class="${cls}">
              <span class="mobile-apps-drawer__icon"><img src="${esc(app.logo)}" alt="" width="36" height="36" loading="lazy" /></span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">${name}</span>
                <span class="mobile-apps-drawer__hint">${esc(app.desc)}</span>
              </span>
            </a>`;
}

function playBadge(t, name) {
  return `<div class="ox-store-badges">
                  <a class="ox-store-badge fh-play-badge" data-fh-play href="#fh-cta">
                    <span class="ox-store-badge__text">
                      <span class="ox-store-badge__name">${esc(name)}</span>
                    </span>
                  </a>
                </div>`;
}

function socialFooter(t) {
  return `<div class="footer-icon-row footer-icon-row--ox" role="group" aria-label="${esc(t.socialAria)}">
            <a class="footer-icon-btn footer-icon-btn--ox" href="mailto:newon@newon.app" aria-label="${esc(t.emailAria)}"><svg class="footer-icon-btn__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" points="22,6 12,13 2,6"/></svg></a>
            <a class="footer-icon-btn footer-icon-btn--ox" href="${esc(t.instagramUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(t.instagramAria)}"><svg class="footer-icon-btn__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            <a class="footer-icon-btn footer-icon-btn--ox" href="${esc(t.youtubeUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(t.youtubeAria)}"><svg class="footer-icon-btn__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            <a class="footer-icon-btn footer-icon-btn--ox" href="https://m.blog.naver.com/newonapp" target="_blank" rel="noopener noreferrer" aria-label="${esc(t.blogAria)}"><svg class="footer-icon-btn__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M5 2H19A3 3 0 0 1 22 5V19A3 3 0 0 1 19 22H5A3 3 0 0 1 2 19V5A3 3 0 0 1 5 2ZM8 6.5H10.2V10.5H16V17.5H8ZM11.8 12.7H14.2V15.3H11.8Z"/></svg></a>
            <a class="footer-icon-btn footer-icon-btn--ox" href="https://www.tiktok.com/@newon.app" target="_blank" rel="noopener noreferrer" aria-label="${esc(t.tiktokAria)}"><svg class="footer-icon-btn__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.28v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></a>
          </div>`;
}

function buildApps(dir, flat, flatEn, t) {
  const apps = APP_DEFS.map((a) => ({
    href: `/${dir}/#${a.hash}`,
    logo: a.logo,
    name: a.name,
    desc: pick(flat, flatEn, a.descKey),
  }));
  apps.push({
    href: `/${dir}/404-human/`,
    logo: "/404-human-logo.png",
    name: "404: HUMAN",
    desc: pick(flat, flatEn, "nav.human404Desc") || t.navTagline,
    badge: "GAME",
    current: true,
  });
  return apps;
}

function redirectStub() {
  const list = JSON.stringify(LANGS.map((l) => l.dir));
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/404-human/"/><title>404: HUMAN | Newon</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/404-human/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/404-human/">404: HUMAN</a> · <a href="/ko/404-human/">404: HUMAN (한국어)</a></p></body></html>\n`;
}

function render(dir, t, flat, flatEn) {
  const apps = buildApps(dir, flat, flatEn, t);
  const flyout = apps.map(flyoutItem).join("\n");
  const mobile = apps.map(mobileItem).join("\n");
  const timelineRows = t.timeline || [];
  const timeline = timelineRows
    .map(
      (row) => `<li class="fh-timeline__item${row.accent ? " fh-timeline__item--accent" : ""}">
                <span class="fh-timeline__year">${esc(row.year)}</span>
                <span class="fh-timeline__text">${esc(row.text)}</span>
              </li>`
    )
    .join("\n");
  const loop = (t.loopSteps || [])
    .map(
      (s, i) => `${i ? '<span class="fh-loop__arrow" aria-hidden="true">→</span>' : ""}
              <li class="fh-loop__step">
                <span class="fh-loop__code">${esc(s.code)}</span>
                <span class="fh-loop__desc">${esc(s.desc)}</span>
              </li>`
    )
    .join("\n");
  const credits = (t.creditRows || [])
    .map(
      (r) => `<div class="fh-credit-row">
                <dt>${esc(r.key)}</dt>
                <dd>${esc(r.value)}</dd>
              </div>`
    )
    .join("\n");

  const brandHome = pick(flat, flatEn, "nav.brandHomeAria") || "Newon";
  const pageUrl = `${SITE_ORIGIN}/${dir}/404-human/`;

  return `<!DOCTYPE html>
<html lang="${esc(t.htmlLang || dir)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(t.seoTitle)}</title>
    <meta name="description" content="${esc(t.seoDescription)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${pageUrl}" />
${hreflangBlock()}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:locale" content="${esc(t.ogLocale)}" />
    <meta property="og:title" content="${esc(t.ogTitle)}" />
    <meta property="og:description" content="${esc(t.ogDescription)}" />
    <meta property="og:site_name" content="Newon" />
    <meta property="og:image" content="${SITE_ORIGIN}/404-human-logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(t.ogTitle)}" />
    <meta name="twitter:description" content="${esc(t.ogDescription)}" />
    <meta name="twitter:image" content="${SITE_ORIGIN}/404-human-logo.png" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css?v=20260822phone" />
    <link rel="stylesheet" href="/ox-month.css" />
    <link rel="stylesheet" href="/app-landing-extras.css?v=20260822phone" />
    <link rel="stylesheet" href="/404-human/404-human.css?v=20260822m" />
    <script src="/lang-nav.js?v=20260821fh"></script>
    <script src="/theme-shell.js"></script>
    <script src="/404-human/play-config.js"></script>
  </head>
  <body class="fh-body">
    <div id="human404-app" class="ox-page site-shell" data-theme="light">
      <a class="ox-skip" href="#fh-main">${esc(t.skip)}</a>

      <header class="ox-header">
        <div class="ox-container navbar-bar navbar-bar--ox navbar-bar--brand-header">
          <div class="navbar-bar__cell navbar-bar__cell--left">
            <div class="navbar-hub navbar-hub--ox">
              <a class="navbar-hub__logo" href="${esc(t.homeHref)}" aria-label="${esc(brandHome)}">
                <img class="navbar-hub__logo-img" src="/logo.png" alt="" width="44" height="44" decoding="async" loading="lazy" />
              </a>
              <nav class="ox-nav ox-nav--apps-only" aria-label="${esc(t.appsAria)}">
                <div class="apps-flyout apps-flyout--in-ox apps-flyout--align-start" data-apps-flyout>
                  <button type="button" class="apps-flyout__trigger apps-flyout__trigger--toolbar ox-apps-toolbar-trigger" id="apps-trigger-fh" aria-expanded="false" aria-haspopup="true" aria-controls="apps-panel-fh" aria-label="${esc(t.appsAria)}">
                    <span>${esc(t.appsLabel)}</span>
                    <span class="apps-flyout__chev" aria-hidden="true"></span>
                  </button>
                  <div id="apps-panel-fh" class="apps-flyout__panel" role="menu" aria-labelledby="apps-trigger-fh" hidden>
${flyout}
                  </div>
                </div>
              </nav>
            </div>
          </div>
          <div class="navbar-bar__cell navbar-bar__cell--center">
            <a href="#fh-top" class="navbar-app-showcase" aria-label="${esc(t.brandAria)}">
              <span class="navbar-app-showcase__icon">
                <img class="navbar-app-showcase__icon-img" src="/404-human-logo.png" alt="" width="56" height="56" decoding="async" loading="lazy" />
              </span>
              <span class="navbar-app-showcase__title">404: HUMAN</span>
              <span class="navbar-app-showcase__tagline">${esc(t.navTagline)}</span>
            </a>
          </div>
          <div class="navbar-bar__cell navbar-bar__cell--controls">
            <div class="navbar-bar__controls navbar-bar__controls--ox navbar-bar__controls--brand-toolbar">
              <div class="lang-switcher lang-switcher--ox" data-lang-switcher>
                <label class="visually-hidden" for="lang-select-fh">${esc(t.language)}</label>
                <select id="lang-select-fh" class="lang-select lang-select--toolbar" data-lang-select aria-label="${esc(t.language)}">
${langOptions(dir)}
                </select>
              </div>
              <div class="ox-header-actions">
                <button type="button" class="ox-theme-toggle" id="fh-theme" aria-label="${esc(t.themeToDark)}" title="${esc(t.themeToggle)}">☾</button>
                <button type="button" class="ox-nav-toggle" id="fh-nav-toggle" aria-expanded="false" aria-controls="fh-mobile" aria-label="${esc(t.menuOpen)}"><span></span><span></span></button>
              </div>
            </div>
          </div>
        </div>
        <div id="fh-mobile" class="ox-mobile-menu" hidden>
          <details class="mobile-apps-drawer mobile-apps-drawer--ox" open>
            <summary class="mobile-apps-drawer__summary">${esc(t.appsLabel)}</summary>
${mobile}
          </details>
        </div>
      </header>

      <main id="fh-main">
        <section id="fh-top" class="ox-hero ox-reveal-on-scroll is-visible">
          <div class="ox-container ox-hero-grid">
            <div class="ox-hero-copy">
              <div class="ox-badge-row">
                <p class="ox-badge"><span class="ox-badge-dot" aria-hidden="true"></span>${esc(t.badge)}</p>
              </div>
              <h1>${esc(t.h1)}</h1>
              <p class="ox-subtitle"><span class="ox-accent">${t.subtitleHtml}</span></p>
              <p class="ox-hero-value">${esc(t.heroValueLine)}</p>
              <p class="ox-hero-reach-summary">${esc(t.heroSummary)}</p>
              <div class="ox-store-release" role="group" aria-label="${esc(t.playLabel)}">
                <p class="ox-store-release__label">${esc(t.storeReleaseLine)}</p>
                ${playBadge(t, t.playLabel)}
              </div>
            </div>
            <div class="ox-hero-visual">
              <div class="ox-hero-frame ox-hero-frame--logo">
                <img class="ox-hero-logo-img" src="/404-human-logo.png" alt="${esc(t.heroLogoAlt)}" width="512" height="512" />
              </div>
            </div>
          </div>
        </section>

        <section id="fh-glance" class="ox-section al-glance fh-glance ox-reveal-on-scroll" data-variant="game" data-accent="fh" aria-labelledby="fh-glance-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">${esc(t.glanceLabel)}</p>
              <h2 id="fh-glance-title" class="ox-section-title-inline"><span class="ox-section-title-inline__icon" aria-hidden="true">👀</span> ${esc(t.glanceTitle)}</h2>
            </header>
            <div class="al-snap">
              <div class="al-snap__main">
                <div class="al-snap__brand">
                  <span class="al-snap__icon-wrap" aria-hidden="true">
                    <img class="al-snap__icon" src="/404-human-logo.png" alt="" width="48" height="48" loading="lazy" decoding="async" />
                  </span>
                  <div class="al-snap__brand-text">
                    <p class="al-snap__eyebrow">${esc(t.glanceSnapshotEyebrow)}</p>
                    <p class="al-snap__app-name">404: HUMAN</p>
                  </div>
                </div>
                <p class="al-snap__line">${esc(t.glanceSnapshot)}</p>
                <div class="al-snap__best">
                  <p class="al-snap__kicker">${esc(t.glanceBestForLabel)}</p>
                  <p class="al-snap__best-text">${esc(t.glanceBestFor)}</p>
                </div>
              </div>
              <dl class="al-snap__side">
                <div class="al-snap__meta-item">
                  <dt>${esc(t.glancePlatformLabel)}</dt>
                  <dd class="al-snap__platforms"><span class="al-snap__plat">${esc(t.glancePlatform)}</span></dd>
                </div>
                <div class="al-snap__meta-item">
                  <dt>${esc(t.glanceGenreLabel)}</dt>
                  <dd>${esc(t.glanceGenre)}</dd>
                </div>
                <div class="al-snap__meta-item">
                  <dt>${esc(t.glanceModeLabel)}</dt>
                  <dd>${esc(t.glanceMode)}</dd>
                </div>
                <div class="al-snap__meta-item">
                  <dt>${esc(t.glanceStatusLabel)}</dt>
                  <dd><span class="al-snap__status fh-status" data-fh-status>IN DEVELOPMENT</span></dd>
                </div>
              </dl>
              <div class="al-snap__core">
                <p class="al-snap__kicker">${esc(t.glanceCoreLabel)}</p>
                <ul class="al-snap__core-list">
                  <li>${esc(t.glanceCore1)}</li>
                  <li>${esc(t.glanceCore2)}</li>
                  <li>${esc(t.glanceCore3)}</li>
                  <li>${esc(t.glanceCore4)}</li>
                  <li>${esc(t.glanceCore5)}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="fh-mission" class="ox-section ox-app-intro ox-reveal-on-scroll" aria-labelledby="fh-mission-title">
          <div class="ox-container ox-app-intro__inner">
            <header class="ox-app-intro__head">
              <p class="ox-section-label">${esc(t.missionLabel)}</p>
              <h2 id="fh-mission-title" class="ox-app-intro__title"><span class="ox-app-intro__title-icon" aria-hidden="true">🎯</span> ${esc(t.missionTitle)}</h2>
            </header>
            <div class="ox-app-intro__panel">
              <div class="ox-app-intro__body">${t.missionHtml}<p class="ox-app-intro__closing">${t.missionEmphHtml}</p></div>
            </div>
          </div>
        </section>

        <section id="fh-core" class="ox-section ox-reveal-on-scroll" aria-labelledby="fh-core-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">${esc(t.coreLabel)}</p>
              <h2 id="fh-core-title" class="ox-section-title-inline"><span class="ox-section-title-inline__icon" aria-hidden="true">💡</span> ${esc(t.coreTitle)}</h2>
            </header>
            <div class="ox-features">
              <article class="ox-feature-card"><h3>${esc(t.core1Title)}</h3><p class="ox-feature-lead">${esc(t.core1Lead)}</p><p class="ox-feature-note">${esc(t.core1Note)}</p></article>
              <article class="ox-feature-card"><h3>${esc(t.core2Title)}</h3><p class="ox-feature-lead">${esc(t.core2Lead)}</p><p class="ox-feature-note">${esc(t.core2Note)}</p></article>
              <article class="ox-feature-card"><h3>${esc(t.core3Title)}</h3><p class="ox-feature-lead">${esc(t.core3Lead)}</p><p class="ox-feature-note">${esc(t.core3Note)}</p></article>
            </div>
          </div>
        </section>

        <section id="fh-loop" class="ox-section ox-reveal-on-scroll" aria-labelledby="fh-loop-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">${esc(t.loopLabel)}</p>
              <h2 id="fh-loop-title" class="ox-section-title-inline"><span class="ox-section-title-inline__icon" aria-hidden="true">🔁</span> ${esc(t.loopTitle)}</h2>
            </header>
            <ol class="fh-loop">${loop}</ol>
          </div>
        </section>

        <section id="fh-dual" class="ox-section fh-dual ox-reveal-on-scroll" aria-labelledby="fh-dual-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">${esc(t.dualLabel)}</p>
              <h2 id="fh-dual-title" class="ox-section-title-inline"><span class="ox-section-title-inline__icon" aria-hidden="true">📊</span> ${esc(t.dualTitle)}</h2>
            </header>
            <div class="fh-dual__grid">
              <article class="fh-metric fh-metric--detection">
                <p class="fh-metric__code">${esc(t.dual1Code)}</p>
                <h3 class="fh-metric__title">${esc(t.dual1Title)}</h3>
                <p class="fh-metric__lead">${esc(t.dual1Lead)}</p>
                <div class="fh-metric__bar" aria-hidden="true"><span class="fh-metric__fill fh-metric__fill--warn" style="--fh-fill:42%"></span></div>
                <div class="fh-metric__scale"><span>${esc(t.dual1Low)}</span><span>${esc(t.dual1High)}</span></div>
                <p class="fh-metric__note">${esc(t.dual1Note)}</p>
              </article>
              <article class="fh-metric fh-metric--humanity">
                <p class="fh-metric__code">${esc(t.dual2Code)}</p>
                <h3 class="fh-metric__title">${esc(t.dual2Title)}</h3>
                <p class="fh-metric__lead">${esc(t.dual2Lead)}</p>
                <div class="fh-metric__bar" aria-hidden="true"><span class="fh-metric__fill fh-metric__fill--ok" style="--fh-fill:68%"></span></div>
                <div class="fh-metric__scale"><span>${esc(t.dual2Low)}</span><span>${esc(t.dual2High)}</span></div>
                <p class="fh-metric__note">${esc(t.dual2Note)}</p>
              </article>
            </div>
            <p class="fh-dual-foot">${esc(t.dualFoot)}</p>
          </div>
        </section>

        <section id="fh-preview" class="ox-section ox-reveal-on-scroll" aria-labelledby="fh-preview-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">${esc(t.previewLabel)}</p>
              <h2 id="fh-preview-title" class="ox-section-title-inline"><span class="ox-section-title-inline__icon" aria-hidden="true">🗣️</span> ${esc(t.previewTitle)}</h2>
            </header>
            <div class="fh-preview">
              <p class="fh-preview__code">${esc(t.previewCode)}</p>
              <p class="fh-preview__q">${esc(t.previewQ)}</p>
              <ul class="fh-preview__choices">
                <li><button type="button" class="fh-choice" tabindex="0"><span class="fh-choice__key">A</span><span class="fh-choice__text">${esc(t.previewA)}</span></button></li>
                <li><button type="button" class="fh-choice" tabindex="0"><span class="fh-choice__key">B</span><span class="fh-choice__text">${esc(t.previewB)}</span></button></li>
                <li><button type="button" class="fh-choice" tabindex="0"><span class="fh-choice__key">C</span><span class="fh-choice__text">${esc(t.previewC)}</span></button></li>
              </ul>
              <p class="fh-preview__foot">${esc(t.previewFoot)}</p>
            </div>
          </div>
        </section>

        <section id="fh-world" class="ox-section ox-reveal-on-scroll" aria-labelledby="fh-world-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">${esc(t.worldLabel)}</p>
              <h2 id="fh-world-title" class="ox-section-title-inline"><span class="ox-section-title-inline__icon" aria-hidden="true">🌐</span> ${esc(t.worldTitle)}</h2>
            </header>
            <ol class="fh-timeline">${timeline}</ol>
          </div>
        </section>

        <section id="fh-scenario" class="ox-section ox-reveal-on-scroll" aria-labelledby="fh-scenario-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">${esc(t.scenarioLabel)}</p>
              <h2 id="fh-scenario-title" class="ox-section-title-inline"><span class="ox-section-title-inline__icon" aria-hidden="true">🧩</span> ${esc(t.scenarioTitle)}</h2>
            </header>
            <div class="ox-features">
              <article class="ox-feature-card">
                <p class="ox-feature-note">${esc(t.sc1Code)} · ${esc(t.sc1Tag)}</p>
                <h3>${esc(t.sc1Quote)}</h3>
                <p class="ox-feature-lead">${esc(t.sc1Meta)}</p>
              </article>
              <article class="ox-feature-card">
                <p class="ox-feature-note">${esc(t.sc2Code)} · ${esc(t.sc2Tag)}</p>
                <h3>${esc(t.sc2Quote)}</h3>
                <p class="ox-feature-lead">${esc(t.sc2Meta)}</p>
              </article>
              <article class="ox-feature-card">
                <p class="ox-feature-note">${esc(t.sc3Code)} · ${esc(t.sc3Tag)}</p>
                <h3>${esc(t.sc3Quote)}</h3>
                <p class="ox-feature-lead">${esc(t.sc3Meta)}</p>
              </article>
              <article class="ox-feature-card">
                <p class="ox-feature-note">${esc(t.sc4Code)} · ${esc(t.sc4Tag)}</p>
                <h3>${esc(t.sc4Quote)}</h3>
                <p class="ox-feature-lead">${esc(t.sc4Meta)}</p>
              </article>
            </div>
          </div>
        </section>

        <section id="fh-ending" class="ox-section ox-reveal-on-scroll" aria-labelledby="fh-ending-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">${esc(t.endingLabel)}</p>
              <h2 id="fh-ending-title" class="ox-section-title-inline"><span class="ox-section-title-inline__icon" aria-hidden="true">🏁</span> ${esc(t.endingTitle)}</h2>
            </header>
            <div class="ox-features">
              <article class="ox-feature-card fh-ending-card"><p class="ox-feature-note">${esc(t.end1Code)}</p><h3>${esc(t.end1Name)}</h3><p class="fh-ending-lock">${esc(t.end1Lock)}</p></article>
              <article class="ox-feature-card fh-ending-card"><p class="ox-feature-note">${esc(t.end2Code)}</p><h3>${esc(t.end2Name)}</h3><p class="fh-ending-lock">${esc(t.end2Lock)}</p></article>
              <article class="ox-feature-card fh-ending-card"><p class="ox-feature-note">${esc(t.end3Code)}</p><h3>${esc(t.end3Name)}</h3><p class="fh-ending-lock">${esc(t.end3Lock)}</p></article>
            </div>
            <p class="fh-ending-foot">${esc(t.endingFoot)}</p>
            <p class="fh-ending-foot-sub">${esc(t.endingFootSub)}</p>
          </div>
        </section>

        <section id="fh-showcase" class="ox-section ox-reveal-on-scroll" aria-labelledby="fh-showcase-title" hidden aria-hidden="true" data-fh-showcase>
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">${esc(t.showcaseLabel)}</p>
              <h2 id="fh-showcase-title" class="ox-section-title-inline">${esc(t.showcaseTitle)}</h2>
            </header>
            <div class="fh-showcase-grid" data-fh-showcase-grid></div>
          </div>
        </section>

        <section id="fh-reco" class="ox-section ox-reveal-on-scroll" aria-labelledby="fh-reco-title">
          <div class="ox-container ox-reco-head">
            <h2 id="fh-reco-title" class="ox-premium-heading"><span class="ox-premium-heading__spark" aria-hidden="true">🎮</span> ${esc(t.recoTitle)}</h2>
            <ul class="co-build-list">
              <li>${esc(t.reco1)}</li><li>${esc(t.reco2)}</li><li>${esc(t.reco3)}</li><li>${esc(t.reco4)}</li><li>${esc(t.reco5)}</li><li>${esc(t.reco6)}</li><li>${esc(t.reco7)}</li>
            </ul>
          </div>
        </section>

        <section id="fh-note" class="ox-section ox-app-intro ox-reveal-on-scroll" aria-labelledby="fh-note-title">
          <div class="ox-container ox-app-intro__inner">
            <header class="ox-app-intro__head">
              <p class="ox-section-label">${esc(t.noteLabel)}</p>
              <h2 id="fh-note-title" class="ox-app-intro__title"><span class="ox-app-intro__title-icon" aria-hidden="true">✍️</span> ${esc(t.noteTitle)}</h2>
            </header>
            <div class="ox-app-intro__panel">
              <div class="ox-app-intro__body">${t.noteHtml}<p class="ox-app-intro__closing">${esc(t.noteClosing)}</p></div>
            </div>
          </div>
        </section>

        <section id="fh-credit" class="ox-section fh-credit ox-reveal-on-scroll" aria-labelledby="fh-credit-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">${esc(t.creditLabel)}</p>
              <h2 id="fh-credit-title" class="ox-section-title-inline">${esc(t.creditTitle)}</h2>
            </header>
            <dl class="fh-credit-list">${credits}</dl>
          </div>
        </section>

        <section id="fh-cta" class="ox-section fh-final-cta ox-reveal-on-scroll" aria-labelledby="fh-cta-title">
          <div class="ox-container">
            <div class="fh-final-cta__panel">
              <p class="fh-final-cta__kicker">${esc(t.ctaKicker)}</p>
              <p class="fh-final-cta__line" id="fh-cta-title">${esc(t.ctaLine)}</p>
              <p class="fh-final-cta__ask">${esc(t.ctaAsk)}</p>
              <div class="fh-final-cta__actions">
                <a class="fh-final-cta__btn" data-fh-play href="#fh-cta">
                  <span class="fh-final-cta__btn-name">${esc(t.playCtaFinal)}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="ox-footer">
        <div class="ox-container ox-footer-inner">
          <div class="footer-legal-links footer-legal-links--ox">
            <a class="footer-legal" href="/${esc(dir)}/privacy/">${esc(t.privacy)}</a>
            <span class="footer-legal-sep" aria-hidden="true">·</span>
            <a class="footer-legal" href="/${esc(dir)}/terms/">${esc(t.terms)}</a>
          </div>
          ${socialFooter(t)}
          <p class="ox-footer-meta">${esc(t.footerRights)} <a href="${esc(t.homeHref)}">${esc(t.newonLink)}</a></p>
        </div>
      </footer>
    </div>

    <script src="/404-human/404-human.js"></script>
    <script src="/lang-dropdown.js"></script>
    <script>
      (function () {
        var cur = ${JSON.stringify(dir)};
        document.querySelectorAll("[data-lang-select]").forEach(function (sel) {
          sel.value = cur;
        });
      })();
    </script>
  </body>
</html>
`;
}

function loadPack() {
  if (fs.existsSync(I18N_PATH)) {
    return JSON.parse(fs.readFileSync(I18N_PATH, "utf8"));
  }
  console.warn("human404-i18n.json missing — using ko/en only. Run: node scripts/fill-404-human-i18n.mjs");
  return {
    ko: { ...fhKo, timeline: fhTimelineKo },
    en: { ...fhEn, timeline: fhTimelineEn },
  };
}

const pack = loadPack();
if (!pack.ko) pack.ko = { ...fhKo, timeline: fhTimelineKo };
if (!pack.en) pack.en = { ...fhEn, timeline: fhTimelineEn };
if (!pack.ko.timeline) pack.ko.timeline = fhTimelineKo;
if (!pack.en.timeline) pack.en.timeline = fhTimelineEn;

const flatEn = flatten(loadJson("en.json"));

for (const { dir, file, htmlLang } of LANGS) {
  const flat = flatten(loadJson(file));
  const t = pack[dir] || pack.en || pack.ko;
  if (!t) throw new Error(`Missing 404 copy for ${dir}`);
  const page = {
    ...t,
    htmlLang: t.htmlLang || htmlLang,
    homeHref: `/${dir}/`,
    lang: dir,
  };
  const outDir = path.join(ROOT, dir, "404-human");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "index.html");
  fs.writeFileSync(outFile, render(dir, page, flat, flatEn), "utf8");
  console.log("wrote", path.relative(ROOT, outFile));
}

fs.mkdirSync(path.join(ROOT, "404-human"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "404-human", "index.html"), redirectStub(), "utf8");
console.log("wrote 404-human/index.html (redirect stub)");
console.log(`render-404-human: ${LANGS.length} languages`);
