#!/usr/bin/env node
/**
 * Writes /portfolio/ (lang redirect) and /{lang}/portfolio/ pages
 * from locales + founder chrome copy in portfolio-i18n.mjs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { APP_CATALOG, featuredApps, loadPortfolioApps, moreApps } from "./portfolio-data.mjs";
import {
  getPortfolioBeyondItems,
  getPortfolioHubMetrics,
  getPortfolioNowGroups,
  COMPANY_TAGLINE,
} from "./portfolio-hub-data.mjs";
import { LANG_OPTIONS, SITE_LANGS, portfolioCopy } from "./portfolio-i18n.mjs";
import { flatten, loadJson, fillMissing } from "./hub-utils.mjs";
import { renderGlobalHeader, renderStudioFooter, renderCompanySwitcher } from "./site-chrome.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "portfolio");
const SITE = "https://www.newon.app";
const VCARD = "/card-n7x4k9/nawon-kyung.vcf";
const FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeFile(dest, html) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

function pfPrefix(lang) {
  return `/${lang}/portfolio`;
}

function altLinks(suffix = "") {
  const extras = SITE_LANGS.map(
    (l) =>
      `<link rel="alternate" hreflang="${esc(l.hreflang)}" href="${SITE}/${l.dir}/portfolio/${suffix}" />`
  ).join("\n    ");
  return `${extras}
    <link rel="alternate" hreflang="x-default" href="${SITE}/ko/portfolio/${suffix}" />`;
}

function langSelect(lang, copy) {
  const opts = LANG_OPTIONS.map((o) => {
    const sel = o.dir === lang ? " selected" : "";
    return `<option value="${esc(o.dir)}"${sel}>${esc(o.label)}</option>`;
  }).join("\n              ");
  return `<div class="lang-switcher" data-lang-switcher>
            <label class="visually-hidden" for="lang-select-pf">${esc(copy.language)}</label>
            <select id="lang-select-pf" class="lang-select lang-select--toolbar" data-lang-select aria-label="${esc(copy.language)}">
              ${opts}
            </select>
          </div>`;
}

function head({ langMeta, copy, title, description, canonical, suffix }) {
  const og = title;
  return `<!DOCTYPE html>
<html lang="${esc(langMeta.htmlLang)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${esc(canonical)}" />
    ${altLinks(suffix || "")}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:locale" content="${esc(langMeta.ogLocale)}" />
    <meta property="og:title" content="${esc(og)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:site_name" content="Newon" />
    <meta property="og:image" content="${SITE}/logo.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${esc(og)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${SITE}/logo.png" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link href="${FONTS}" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/gnav-mega.css?v=20260831menu1" />
    <link rel="stylesheet" href="/hub-pages.css?v=20260830filt1" />
    <link rel="stylesheet" href="/portfolio/portfolio.css?v=20260830pfinck2" />
    <script src="/lang-nav.js?v=20260821stay2"></script>
    <script src="/theme-shell.js"></script>
  </head>`;
}

function localeFlats(lang) {
  const en = loadJson("en.json");
  const data = fillMissing(loadJson(`${lang}.json`), en);
  return { flat: flatten(data), flatEn: flatten(en) };
}

function chromeNav(lang, { base = "../", idSuffix = "portfolio" } = {}) {
  const { flat, flatEn } = localeFlats(lang);
  const header = renderGlobalHeader(flat, flatEn, { activeNav: "company", base, idSuffix, langDir: lang });
  const switcher = renderCompanySwitcher(flat, flatEn, { active: "portfolio", base });
  return `
    <a class="skip-link" href="#pf-main">${esc(portfolioCopy(lang).skip)}</a>
    ${header}
    ${switcher}`;
}

function foot(lang, { base = "../", hub = false } = {}) {
  const { flat, flatEn } = localeFlats(lang);
  const siteFoot = renderStudioFooter(flat, flatEn, { base, langDir: lang });
  return `
    ${siteFoot}
    <script src="/lang-dropdown.js"></script>
    <script src="/portfolio/portfolio.js"></script>
    <script src="/analytics.js?v=20260825studio" defer></script>
    <script src="/search.js?v=20260825studio" defer></script>
    <script src="/site-chrome.js?v=20260826gnav5" defer></script>
  </body>
</html>
`;
}

function iconImg(app, className, size) {
  if (!app.icon) return "";
  return `<img class="${className}" src="${esc(app.icon)}" alt="${esc(app.iconAlt)}" width="${size}" height="${size}" />`;
}

function storeBtn(url, label, extraClass = "") {
  if (!url) return "";
  return `<a class="btn btn-ghost${extraClass ? ` ${extraClass}` : ""}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
}

function viewProjectBtn(app, copy) {
  if (!app.homeUrl) return "";
  return `<a class="btn btn-primary" href="${esc(app.homeUrl)}" target="_blank" rel="noopener noreferrer">${esc(copy.viewProject)}</a>`;
}

function storeButtons(app, copy) {
  return [viewProjectBtn(app, copy), storeBtn(app.appStoreUrl, copy.appStore), storeBtn(app.googlePlayUrl, copy.googlePlay)]
    .filter(Boolean)
    .join("\n              ");
}

function shotFigure(shot, lazy, sizes) {
  const loading = lazy ? ` loading="lazy" decoding="async"` : ` decoding="async"`;
  return `<figure><img src="${esc(shot.src)}" alt="${esc(shot.alt)}" width="1242" height="2688"${loading} sizes="${sizes}" /></figure>`;
}

function featurePills(feats, n) {
  const items = feats.slice(0, n);
  if (!items.length) return "";
  return `<ul class="pf-feats">${items.map((f) => `<li>${esc(f.title)}</li>`).join("")}</ul>`;
}

function statCard(item) {
  const Tag = item.href ? "a" : "article";
  const href = item.href ? ` href="${esc(item.href)}"` : "";
  const valueClass = item.valueKind === "text" ? " pf-stat__value--text" : "";
  const note = item.noteShort
    ? `<span class="pf-stat__note-short">${esc(item.noteShort)}</span><span class="pf-stat__note-full">${esc(item.note)}</span>`
    : esc(item.note);
  return `<${Tag} class="pf-stat pf-reveal"${href}>
            <p class="pf-stat__value${valueClass}">${esc(item.value)}</p>
            <h3>${esc(item.title)}</h3>
            <p class="pf-stat__note">${note}</p>
          </${Tag}>`;
}

function featuredCase(app, i, copy) {
  const shots = app.indexShotsList
    .map((s, idx) => shotFigure(s, i > 0 || idx > 0, "(max-width: 900px) 52vw, 176px"))
    .join("");
  const aria = copy.shotsAria.replace("{name}", app.displayName);
  return `
        <article class="pf-case pf-reveal" data-pf-type="apps">
          <div>
            ${iconImg(app, "pf-case__icon", 56)}
            <h3>${esc(app.displayName)}</h3>
            ${app.oneLiner ? `<p class="pf-case__cat">${esc(app.oneLiner)}</p>` : ""}
            ${app.summary ? `<p class="pf-case__sum">${esc(app.summary)}</p>` : ""}
            ${featurePills(app.features, 4)}
            <p class="pf-role">${esc(copy.roleLabel)}<br />${esc(copy.roleLine)}</p>
            <div class="pf-case__actions">
              ${storeButtons(app, copy)}
            </div>
          </div>
          ${shots ? `<div class="pf-shots" tabindex="0" aria-label="${esc(aria)}">${shots}</div>` : ""}
        </article>`;
}

function moreCard(app, copy) {
  return `
        <a href="${esc(app.homeUrl)}" target="_blank" rel="noopener noreferrer">
          ${iconImg(app, "", 44)}
          <span>
            <h3>${esc(app.displayName)}</h3>
            ${app.oneLiner ? `<p>${esc(app.oneLiner)}</p>` : ""}
          </span>
          <span class="pf-more__go">${esc(copy.moreGo)}</span>
        </a>`;
}

function workEn(lang, w) {
  if (lang === "en" || w.title === w.en) return "";
  return `<p class="pf-en">${esc(w.en)}</p>`;
}

function processEn(lang, s) {
  if (lang === "en" || s.title === s.en) return "";
  return `<span class="pf-en">${esc(s.en)}</span>`;
}

function exploreHref(lang, href) {
  return href.replace("{lang}", lang);
}

function openTopicHtml(lang, topic) {
  const meta = topic.meta ? `<span class="pf-open__meta">${esc(topic.meta)}</span>` : "";
  const href = topic.href ? `/${lang}/${String(topic.href).replace(/^\//, "")}` : "#contact";
  const chips = Array.isArray(topic.chips)
    ? topic.chips
    : String(topic.desc || "")
        .split(/[·/,]/)
        .map((s) => s.trim())
        .filter(Boolean);
  const chipHtml = chips.length
    ? `<p class="pf-open__chips">${chips.map((c) => `<span>${esc(c)}</span>`).join("")}</p>`
    : topic.desc
      ? `<p class="pf-open__desc">${esc(topic.desc)}</p>`
      : "";
  return `<li class="pf-open__row">
              <a class="pf-open__link" href="${esc(href)}">
                <span class="pf-open__n">${esc(topic.n)}</span>
                <div class="pf-open__body">
                  <p class="pf-open__title">${esc(topic.title)} ${meta}</p>
                  ${chipHtml}
                </div>
                <span class="pf-open__go" aria-hidden="true">→</span>
              </a>
            </li>`;
}

function hubMetricHtml(item) {
  return `<div class="pf-hub-metric pf-reveal">
            <p class="pf-hub-metric__value">${esc(item.value)}</p>
            <p class="pf-hub-metric__label">${esc(item.label)}</p>
            <p class="pf-hub-metric__note">${esc(item.note)}</p>
          </div>`;
}

function hubFocusHtml(item, i) {
  return `<article class="pf-focus pf-reveal">
            <span class="pf-focus__n">${String(i + 1).padStart(2, "0")}</span>
            <h3 class="pf-focus__title">${esc(item.title)}</h3>
            <p class="pf-focus__body">${esc(item.body)}</p>
          </article>`;
}

function hubCapHtml(cap, lang, i = 0) {
  const en =
    lang !== "en" && cap.en && cap.title !== cap.en
      ? `<p class="pf-en">${esc(cap.en)}</p>`
      : "";
  const chips = (cap.items || [])
    .map((item) => `<span class="pf-hub-cap__chip">${esc(item)}</span>`)
    .join("");
  return `<article class="pf-hub-cap pf-hub-cap--craft pf-reveal">
            <span class="pf-hub-cap__n" aria-hidden="true">${esc(cap.n)}</span>
            <header class="pf-hub-cap__head">
              <h3>${esc(cap.title)}</h3>
              ${en}
            </header>
            <div class="pf-hub-cap__chips">${chips}</div>
          </article>`;
}

function hubProcessHtml(copy, lang) {
  return copy.process
    .map((s, i, arr) => {
      const en = processEn(lang, s);
      const last = i === arr.length - 1;
      return `<div class="pf-hub-pipe__step pf-hub-pipe__step--craft pf-reveal">
                <span class="pf-hub-pipe__n">${String(i + 1).padStart(2, "0")}</span>
                <div class="pf-hub-pipe__copy">
                  <strong>${esc(s.title)}</strong>${en}
                  ${s.body ? `<p>${esc(s.body)}</p>` : ""}
                </div>
                ${last ? "" : `<span class="pf-hub-pipe__go" aria-hidden="true">→</span>`}
              </div>`;
    })
    .join("\n          ");
}

function hubBeyondHtml(item) {
  const status = item.status ? `<span class="pf-hub-beyond__status">${esc(item.status)}</span>` : "";
  const secondary =
    item.hrefSecondary && item.ctaSecondary
      ? `<a class="pf-hub-beyond__cta pf-hub-beyond__cta--ghost" href="${esc(item.hrefSecondary)}">${esc(item.ctaSecondary)}</a>`
      : "";
  return `<article class="pf-hub-beyond pf-reveal">
            <div class="pf-hub-beyond__meta">
              <span class="pf-hub-beyond__n">${esc(item.n)}</span>
              <span class="pf-hub-beyond__tag">${esc(item.tag)}</span>
              ${status}
            </div>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.body)}</p>
            <div class="pf-hub-beyond__actions">
              <a class="pf-hub-beyond__cta" href="${esc(item.href)}">${esc(item.cta)}</a>
              ${secondary}
            </div>
          </article>`;
}

function hubNowHtml(group, copy) {
  const rows = group.items
    .map(
      (it) => `<li>
        <a class="pf-hub-now__link" href="${esc(it.href)}">
          <span class="pf-hub-now__cat">${esc(it.category || "")}</span>
          <span class="pf-hub-now__title">${esc(it.title)}</span>
          <span class="pf-hub-now__go">${esc(copy.nowView)}</span>
        </a>
      </li>`
    )
    .join("");
  return `<div class="pf-hub-now__col pf-reveal">
            <p class="pf-hub-now__status">${esc(group.status)}</p>
            <p class="pf-hub-now__hint">${esc(group.statusHint)}</p>
            <ul class="pf-hub-now__list">${rows}</ul>
          </div>`;
}

function sectionNavHtml(copy) {
  const items = (copy.sectionNav || [])
    .map((it) => `<a class="pf-hub-index__link" href="#${esc(it.id)}">${esc(it.label)}</a>`)
    .join("");
  return `<nav class="pf-hub-index pf-hub-index--slim" aria-label="Portfolio sections">${items}</nav>`;
}

function exploreRowHtml(lang, item, i = 0) {
  const href = exploreHref(lang, item.href);
  return `<a class="pf-explore__panel pf-explore__panel--craft" href="${esc(href)}">
              <span class="pf-explore__n">${esc(item.n)}</span>
              <p class="pf-explore__title">${esc(item.title)}</p>
              <p class="pf-explore__desc">${esc(item.desc)}</p>
              <span class="pf-explore__go">${esc(item.cta || "→")}</span>
            </a>`;
}

function indexPage(langMeta, copy, apps) {
  const lang = langMeta.dir;
  const featured = featuredApps(apps);
  const more = moreApps(apps);
  const metrics = getPortfolioHubMetrics(lang);
  const beyond = getPortfolioBeyondItems(lang);
  const nowGroups = getPortfolioNowGroups(lang);
  const caps = (copy.capabilities || [])
    .map((c, i) => hubCapHtml(c, lang, i))
    .join("\n          ");
  const tagline = COMPANY_TAGLINE[lang] || COMPANY_TAGLINE.en;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: copy.jsonLdName,
    url: `${SITE}${pfPrefix(lang)}/`,
    inLanguage: langMeta.htmlLang,
    mainEntity: {
      "@type": "Person",
      name: "Nawon Kyung",
      alternateName: "경나원",
      jobTitle: "CEO & App Developer",
      description: copy.seoDescription,
      worksFor: { "@type": "Organization", name: "Newon", url: SITE },
      email: "mailto:newon@newon.app",
      url: `${SITE}${pfPrefix(lang)}/`,
    },
  };

  return `${head({
    langMeta,
    copy,
    title: copy.seoTitle,
    description: copy.seoDescription,
    canonical: `${SITE}${pfPrefix(lang)}/`,
    suffix: "",
  })}
  <body class="pf-page">
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    ${chromeNav(lang, { base: "../", idSuffix: "pf-hub" })}
    <main id="pf-main">
      <section class="pf-hero pf-hero--hq pf-hero--studio pf-hero--dense">
        <div class="pf-hero__grid">
          <div class="pf-hero__copy">
            <nav class="pf-hero__crumb pf-enter" style="--d:0" aria-label="Breadcrumb">
              <a href="/${esc(lang)}/about/">${esc(copy.heroCrumbLeft || "Company")}</a>
              <span class="pf-hero__crumb-sep" aria-hidden="true">/</span>
              <span>${esc(copy.heroCrumbRight || "PORTFOLIO")}</span>
            </nav>
            <p class="pf-hero__eyebrow pf-enter" style="--d:1">${esc(copy.heroEyebrow)}<span class="pf-hero__eyebrow-sep" aria-hidden="true">·</span><span class="pf-hero__eyebrow-role">CEO &amp; App Developer</span></p>
            <p class="pf-hero__word pf-enter" style="--d:2" aria-hidden="true">${esc(copy.heroName || "경나원")}</p>
            <p class="pf-hero__en pf-enter" style="--d:3">${esc(copy.heroNameEn || "Nawon Kyung")}</p>
            <h1 class="pf-hero__statement pf-enter" style="--d:4"><span class="visually-hidden">${esc(copy.heroName || "경나원")} — </span>${copy.heroStatementHtml || ""}</h1>
            <p class="pf-hero__lead pf-enter" style="--d:5">${copy.heroLeadHtml}</p>
            <ul class="pf-hero__domains pf-enter" style="--d:5.5" aria-label="${esc(copy.aboutFocusLabel || "Focus")}">
              ${(copy.heroDomains || ["Apps", "UX/UI", "Build", "Launch"]).map((d) => `<li>${esc(d)}</li>`).join("")}
            </ul>
            <div class="pf-hero__actions pf-enter" style="--d:6">
              <a class="btn btn-primary pf-hero__btn" href="#projects">${esc(copy.ctaProjects)}</a>
              <a class="btn btn-ghost pf-hero__btn" href="#contact">${esc(copy.ctaContact)}</a>
            </div>
          </div>
          <aside class="pf-hero__visual pf-enter" style="--d:3" aria-label="${esc(copy.cardAria || "Digital card")}">
            <div class="pf-sv">
              <div class="pf-sv__head">
                <span class="pf-sv__live" aria-hidden="true"><i></i> DIGITAL CARD</span>
                <span class="pf-sv__meta">NEWON</span>
              </div>
              <div class="pf-sv__body">
                <a class="pf-sv__card" href="/card-n7x4k9/" aria-label="${esc(copy.cardAria || "Open digital card")}">
                  <img src="/card-n7x4k9/newon-card-back.jpg" alt="${esc(copy.cardAlt || "Newon card")}" width="1024" height="588" decoding="async" fetchpriority="high" />
                </a>
                <p class="pf-sv__hint">${esc(copy.cardHint || "Digital card · tap to open")}</p>
              </div>
              <div class="pf-sv__foot" aria-hidden="true">
                <span>NAWON KYUNG</span>
                <span>CEO</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="about" class="pf-section pf-section--about">
        <div class="pf-wrap pf-about pf-about--story">
          <div class="pf-about__intro">
            <p class="pf-label">${esc(copy.aboutLabel)}</p>
            <h2>${esc(copy.aboutTitle)}</h2>
            <div class="pf-about__body">
              <p class="pf-reveal">${esc(copy.aboutP1)}</p>
              <p class="pf-reveal">${esc(copy.aboutP2)}</p>
            </div>
          </div>
          <div class="pf-about__focus">
            <p class="pf-label">${esc(copy.aboutFocusLabel || "FOCUS")}</p>
            <div class="pf-focus-grid">
            ${(copy.whatIDo || []).map((item, i) => hubFocusHtml(item, i)).join("\n            ")}
            </div>
          </div>
        </div>
      </section>

      <section id="numbers" class="pf-section pf-section--metrics pf-section--paper">
        <div class="pf-wrap">
          <div class="pf-ink__head pf-ink__head--compact pf-metrics-head">
            <p class="pf-label">${esc(copy.numbersLabel)}</p>
            <h2>${esc(copy.numbersTitle)}</h2>
            <p class="pf-stats__headline">${esc(copy.numbersHeadline)}</p>
            <p class="pf-stats__support">${esc(copy.numbersSupport)}</p>
          </div>
          <div class="pf-hub-metrics pf-hub-metrics--paper pf-board">
          ${metrics.map(hubMetricHtml).join("\n          ")}
          </div>
        </div>
      </section>

      <section class="pf-section pf-section--caps" id="capabilities">
        <div class="pf-wrap">
          <header class="pf-sec-head">
            <p class="pf-label">${esc(copy.workLabel)}</p>
            <h2>${esc(copy.workTitle)}</h2>
          </header>
          <div class="pf-hub-cap-grid pf-board pf-board--caps">
          ${caps}
          </div>
        </div>
      </section>

      <section class="pf-section pf-section--process" id="process">
        <div class="pf-wrap">
          <header class="pf-sec-head pf-sec-head--inline">
            <div>
              <p class="pf-label">${esc(copy.processLabel)}</p>
              <h2>${esc(copy.processTitle)}</h2>
            </div>
          </header>
          <div class="pf-hub-pipe pf-board pf-board--process" data-count="${copy.process.length}" aria-label="${esc(copy.processAria)}">
          ${hubProcessHtml(copy, lang)}
          </div>
        </div>
      </section>

      <section id="projects" class="pf-section">
        <div class="pf-wrap">
          <p class="pf-label">${esc(copy.projectsLabel)}</p>
          <h2>${esc(copy.projectsTitle)}</h2>
          <div class="hub-filters" data-portfolio-filters>
            <button type="button" class="hub-filter is-active" data-pf-filter="all">All</button>
            <button type="button" class="hub-filter" data-pf-filter="apps">Apps</button>
            <button type="button" class="hub-filter" data-pf-filter="games">Games</button>
            <button type="button" class="hub-filter" data-pf-filter="web">Web</button>
            <button type="button" class="hub-filter" data-pf-filter="design">Design</button>
            <button type="button" class="hub-filter" data-pf-filter="experiments">Experiments</button>
          </div>
          <div data-pf-grid>
          ${featured.map((a, i) => featuredCase(a, i, copy)).join("\n")}
          </div>
          <a class="pf-case" data-pf-type="games" href="${SITE}/${lang}/404-human/" style="display:block;margin-top:1rem;text-decoration:none;color:inherit">
            <div class="pf-case__inner"><h3>404: HUMAN</h3><p class="pf-case__sum">Newon Games — Live</p></div>
          </a>
        </div>
      </section>

      <section class="pf-section pf-section--tight">
        <div class="pf-wrap">
          <p class="pf-label">${esc(copy.moreLabel)}</p>
          <h2>${esc(copy.moreTitle)}</h2>
          <div class="pf-more">
          ${more.map((a) => moreCard(a, copy)).join("\n")}
          </div>
        </div>
      </section>

${""}

      <section id="beyond" class="pf-section pf-section--beyond">
        <div class="pf-wrap">
          <header class="pf-sec-head">
            <p class="pf-label">${esc(copy.beyondLabel)}</p>
            <h2>${esc(copy.beyondTitle)}</h2>
          </header>
          <div class="pf-hub-beyond-grid pf-board pf-board--beyond">
          ${beyond.map(hubBeyondHtml).join("\n          ")}
          </div>
        </div>
      </section>

      <section id="now" class="pf-section pf-section--now">
        <div class="pf-wrap">
          <header class="pf-sec-head pf-sec-head--row">
            <div>
              <p class="pf-label">${esc(copy.nowSectionLabel)}</p>
              <h2>${esc(copy.nowSectionTitle)}</h2>
            </div>
            <p class="pf-hub-lead pf-reveal">${esc(copy.nowSectionLead)}</p>
          </header>
          <div class="pf-hub-now-grid pf-board pf-board--now">
          ${nowGroups.map((g) => hubNowHtml(g, copy)).join("\n          ")}
          </div>
        </div>
      </section>

      <section id="principles" class="pf-section pf-section--principles">
        <div class="pf-wrap">
          <header class="pf-prin-head">
            <p class="pf-label">${esc(copy.principlesLabel)}</p>
            <h2>${esc(copy.principlesTitle)}</h2>
          </header>
          <ol class="pf-board pf-prin-rail" aria-label="${esc(copy.principlesLabel)}">
            ${(copy.principles || [])
              .map(
                (p) => `<li class="pf-prin-rail__row pf-reveal">
              <span class="pf-prin-rail__n">${esc(p.n)}</span>
              <strong class="pf-prin-rail__title">${esc(p.title)}</strong>
              <p class="pf-prin-rail__body">${esc(p.body)}</p>
              <span class="pf-prin-rail__go" aria-hidden="true">→</span>
            </li>`
              )
              .join("\n            ")}
          </ol>
        </div>
      </section>

      <section id="newon" class="pf-section pf-section--studio pf-section--hq">
        <div class="pf-wrap">
          <div class="pf-hq-duo pf-reveal">
            <article class="pf-hq-duo__studio pf-hq-duo__studio--paper">
              <div class="pf-hq-duo__studio-top">
                <img class="pf-hq-duo__mark" src="/logo.png" alt="" width="48" height="48" />
                <div>
                  <p class="pf-label">${esc(copy.studioLabel)}</p>
                  <h2 class="pf-hq-duo__brand">Newon</h2>
                </div>
              </div>
              <p class="pf-hq-duo__tag">${esc(tagline)}</p>
              <p class="pf-hq-duo__body">${esc(copy.studioBody)}</p>
              <ul class="pf-hq-duo__domains" aria-hidden="true">
                <li>Apps</li><li>AI</li><li>SaaS</li><li>Games</li><li>Web</li>
              </ul>
              <a class="btn btn-primary pf-hq-duo__cta" href="/${esc(lang)}/about/">${esc(copy.studioCta)}</a>
            </article>
            <article id="founder" class="pf-hq-duo__founder">
              <header class="pf-hq-duo__id">
                <p class="pf-label">${esc(copy.founderLabel)}</p>
                <p class="pf-hq-duo__name">${esc(copy.heroName || "경나원")}</p>
                <p class="pf-hq-duo__en">${esc(copy.heroNameEn || "Nawon Kyung")}</p>
                <p class="pf-hq-duo__role">CEO &amp; App Developer</p>
              </header>
              <div class="pf-hq-duo__story">
                <h2 class="pf-hq-duo__title">${esc(copy.founderTitle)}</h2>
                <p>${esc(copy.founderIntro)}</p>
                <p>${esc(copy.founderIntro2)}</p>
                <p class="pf-hq-duo__expertise">${copy.founderExpertise.map((e) => `<span>${esc(e)}</span>`).join("")}</p>
                <div class="pf-hq-duo__links">
                  <a href="/${esc(lang)}/about/">${esc(copy.founderAboutCta || copy.studioCta)}</a>
                  <a href="/${esc(lang)}/business/">${esc(copy.founderBusiness)}</a>
                  <a href="#contact">${esc(copy.founderContactCta || copy.ctaContact)}</a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="contact" class="pf-section pf-cx pf-cx--hq">
        <div class="pf-wrap pf-cx-hq">
          <div class="pf-cx-hq__main">
            <header class="pf-cx-hq__head">
              <p class="pf-label pf-cx-enter" style="--d: 0">${esc(copy.contactLabel)}</p>
              <h2 class="pf-cx__title pf-cx-enter" style="--d: 1">${copy.contactHeroTitleHtml}</h2>
              <p class="pf-cx__lead pf-cx-enter" style="--d: 2">${esc(copy.contactLead)}</p>
            </header>
            <div class="pf-cx-hq__topics pf-cx-enter" style="--d: 3">
              <p class="pf-cx__open-label">${esc(copy.contactOpenLabel)}</p>
              <ul class="pf-open pf-open--board">
                ${copy.contactOpenTopics.map((t) => openTopicHtml(lang, t)).join("\n                ")}
              </ul>
            </div>
          </div>

          <aside class="pf-cx-hq__card pf-cx-enter" style="--d: 4" aria-labelledby="pf-cx-info-title">
            <div class="pf-cx__card-head">
              <h3 id="pf-cx-info-title" class="pf-cx__info-title">${esc(copy.contactInfoTitle)}</h3>
              <p class="pf-cx__info-sub">${esc(copy.contactInfoSub)}</p>
            </div>
            <div class="pf-ci">
              <div class="pf-ci__item">
                <span class="pf-ci__k">${esc(copy.contactPhone)}</span>
                <div class="pf-ci__main">
                  <a class="pf-ci__v" href="tel:01039238904">010-3923-8904</a>
                  <button type="button" class="pf-ci__copy" data-copy="010-3923-8904" data-copied="${esc(copy.contactCopied)}" aria-live="polite">
                    <span data-copy-label>${esc(copy.contactCopy)}</span>
                  </button>
                </div>
              </div>
              <div class="pf-ci__item">
                <span class="pf-ci__k">${esc(copy.contactEmail)}</span>
                <div class="pf-ci__main">
                  <a class="pf-ci__v" href="mailto:newon@newon.app">newon@newon.app</a>
                  <button type="button" class="pf-ci__copy" data-copy="newon@newon.app" data-copied="${esc(copy.contactCopied)}" aria-live="polite">
                    <span data-copy-label>${esc(copy.contactCopy)}</span>
                  </button>
                </div>
              </div>
              <div class="pf-ci__item">
                <span class="pf-ci__k">${esc(copy.contactWeb)}</span>
                <div class="pf-ci__main">
                  <a class="pf-ci__v" href="https://www.newon.app">newon.app</a>
                </div>
              </div>
            </div>
            <div class="pf-cx__card-foot">
              <p class="pf-cx__quick-label">${esc(copy.contactQuick)}</p>
              <div class="pf-cx__actions">
                <a class="btn btn-primary pf-cx__btn-primary" href="mailto:newon@newon.app">${esc(copy.contactMailCta)}</a>
                <a class="btn btn-ghost pf-cx__btn-secondary" href="${VCARD}" data-save-vcard>${esc(copy.contactSave)}</a>
              </div>
            </div>
          </aside>
        </div>

        <div class="pf-cx-hq__band">
          <div class="pf-wrap pf-cx-msg pf-cx-msg--ink">
            <div class="pf-cx-msg__grid pf-cx-enter" style="--d: 8">
              <div class="pf-cx-msg__copy">
                <p class="pf-label">${esc(copy.contactMsgLabel)}</p>
                <h2 class="pf-cx-msg__title">${copy.contactMsgTitleHtml}</h2>
                <p class="pf-cx-msg__lead">${esc(copy.contactMsgLead)}</p>
              </div>
              <a class="pf-cx-msg__mail" href="mailto:newon@newon.app">${esc(copy.contactMsgMail)}</a>
            </div>
          </div>
        </div>
      </section>

      <section class="pf-section pf-explore pf-explore--board" aria-labelledby="pf-explore-title">
        <div class="pf-wrap">
          <div class="pf-explore__head pf-cx-enter" style="--d: 0">
            <p class="pf-label">${esc(copy.exploreLabel)}</p>
            <h2 id="pf-explore-title" class="pf-explore__title">${esc(copy.exploreTitle)}</h2>
            <p class="pf-explore__lead">${esc(copy.exploreLead)}</p>
          </div>
          <nav class="pf-explore__grid pf-board" aria-label="${esc(copy.exploreLabel)}">
            ${copy.exploreNav.map((item, i) => exploreRowHtml(lang, item, i)).join("\n            ")}
          </nav>
        </div>
      </section>
    </main>
${foot(lang, { base: "../", hub: true })}`;
}

function projectPage(langMeta, copy, app, apps) {
  const lang = langMeta.dir;
  const prefix = pfPrefix(lang);
  const others = apps.filter((a) => a.slug !== app.slug);
  const desc = app.summary || copy.projectFallback.replace("{name}", app.displayName);
  const idea = app.ideaParagraphs.length
    ? `<section class="pf-section pf-section--tight">
        <div class="pf-wrap pf-wrap--narrow pf-prose">
          <h2>${esc(copy.ideaTitle)}</h2>
          ${app.ideaParagraphs.map((p) => `<p class="pf-reveal">${esc(p)}</p>`).join("\n          ")}
        </div>
      </section>`
    : "";
  const feats = app.features.length
    ? `<section class="pf-section pf-section--tight">
        <div class="pf-wrap">
          <h2>${esc(copy.featuresTitle)}</h2>
          <div class="pf-work">
            ${app.features
              .map(
                (f) =>
                  `<article class="pf-reveal"><h3>${esc(f.title)}</h3>${f.lead ? `<p>${esc(f.lead)}</p>` : ""}</article>`
              )
              .join("\n            ")}
          </div>
        </div>
      </section>`
    : "";
  const screens = app.shots.length
    ? `<section class="pf-section pf-section--tight">
        <div class="pf-wrap">
          <h2>${esc(copy.screensTitle)}</h2>
          <div class="pf-screens">
            ${app.shots.map((s, i) => shotFigure(s, i > 0, "(max-width: 480px) 92vw, (max-width: 760px) 46vw, 30vw")).join("\n            ")}
          </div>
        </div>
      </section>`
    : "";
  const more = others.length
    ? `<section class="pf-section">
        <div class="pf-wrap">
          <h2>${esc(copy.moreTitle)}</h2>
          <div class="pf-more">
          ${others.map((a) => moreCard(a, copy)).join("\n")}
          </div>
        </div>
      </section>`
    : "";

  return `${head({
    langMeta,
    copy,
    title: `${app.displayName} — Nawon Kyung | Newon`,
    description: desc,
    canonical: `${SITE}${prefix}/${app.slug}/`,
    suffix: `${app.slug}/`,
  })}
  <body class="pf-page">
    ${chromeNav(lang, { base: "../../", idSuffix: `pf-${app.slug}` })}
    <main id="pf-main">
      <section class="pf-project-hero">
        <div class="pf-wrap pf-wrap--narrow">
          <a class="pf-back" href="${prefix}/#projects">${esc(copy.backPortfolio)}</a>
          ${iconImg(app, "pf-project-hero__icon", 64)}
          <h1>${esc(app.displayName)}</h1>
          ${app.oneLiner ? `<p class="pf-case__cat">${esc(app.oneLiner)}</p>` : ""}
          ${app.summary ? `<p class="pf-hero__lead">${esc(app.summary)}</p>` : ""}
          <div class="pf-hero__actions">
            ${viewProjectBtn(app, copy)}
            ${storeBtn(app.appStoreUrl, copy.appStore)}
            ${storeBtn(app.googlePlayUrl, copy.googlePlay)}
          </div>
        </div>
      </section>
      ${idea}
      ${feats}
      ${screens}
      <section class="pf-section pf-section--tight">
        <div class="pf-wrap pf-wrap--narrow">
          <h2>${esc(copy.rolesTitle)}</h2>
          <ul class="pf-roles">
            ${copy.roles.map((r) => `<li>${esc(r)}</li>`).join("")}
          </ul>
        </div>
      </section>
      ${
        app.appStoreUrl || app.googlePlayUrl
          ? `<section class="pf-section pf-section--tight">
        <div class="pf-wrap pf-wrap--narrow">
          <h2>App Store</h2>
          <div class="pf-hero__actions">
            ${storeBtn(app.appStoreUrl, copy.appStore)}
            ${storeBtn(app.googlePlayUrl, copy.googlePlay)}
          </div>
        </div>
      </section>`
          : ""
      }
      ${more}
    </main>
${foot(lang, { base: "../../", hub: false })}`;
}

function redirectPage(slug = "") {
  const destPath = slug ? `${slug}/` : "";
  const list = JSON.stringify(SITE_LANGS.map((l) => l.dir));
  const links = LANG_OPTIONS.map((o) => `<a href="/${o.dir}/portfolio/${destPath}">${esc(o.label)}</a>`).join(" · ");
  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href="${SITE}/ko/portfolio/${destPath}" />
    ${altLinks(destPath)}
    <title>Nawon Kyung — Portfolio | Newon</title>
    <script>(function(){var L=${list};var d="ko";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/portfolio/${destPath}"+(location.search||"")+(location.hash||""));})();</script>
  </head>
  <body style="font-family:system-ui,sans-serif;padding:1.5rem">
    <p>${links}</p>
  </body>
</html>
`;
}

writeFile(path.join(OUT, "index.html"), redirectPage());
for (const app of APP_CATALOG) {
  writeFile(path.join(OUT, app.slug, "index.html"), redirectPage(app.slug));
}

for (const langMeta of SITE_LANGS) {
  const copy = portfolioCopy(langMeta.dir);
  const apps = loadPortfolioApps(langMeta.dir);
  const langOut = path.join(ROOT, langMeta.dir, "portfolio");
  writeFile(path.join(langOut, "index.html"), indexPage(langMeta, copy, apps));
  for (const app of apps) {
    writeFile(path.join(langOut, app.slug, "index.html"), projectPage(langMeta, copy, app, apps));
  }
}

console.log(
  "portfolio generated:",
  SITE_LANGS.map((l) => l.dir).join(", "),
  "·",
  APP_CATALOG.map((a) => a.slug).join(", ")
);
