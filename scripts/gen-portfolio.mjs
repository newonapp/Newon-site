#!/usr/bin/env node
/**
 * Writes /portfolio/ (lang redirect) and /{lang}/portfolio/ pages
 * from locales + founder chrome copy in portfolio-i18n.mjs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { APP_CATALOG, featuredApps, loadPortfolioApps, moreApps } from "./portfolio-data.mjs";
import { LANG_OPTIONS, SITE_LANGS, portfolioCopy, visibleCopyStats } from "./portfolio-i18n.mjs";
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
    <link rel="stylesheet" href="/gnav-mega.css?v=20260826gnav5" />
    <link rel="stylesheet" href="/hub-pages.css?v=20260826co1" />
    <link rel="stylesheet" href="/portfolio/portfolio.css?v=20260822founder" />
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
  const header = renderGlobalHeader(flat, flatEn, { activeNav: "company", base, idSuffix });
  const switcher = renderCompanySwitcher(flat, flatEn, { active: "portfolio", base });
  return `
    <a class="skip-link" href="#pf-main">${esc(portfolioCopy(lang).skip)}</a>
    ${header}
    ${switcher}`;
}

function foot(lang, { base = "../", hub = false } = {}) {
  const { flat, flatEn } = localeFlats(lang);
  const siteFoot = renderStudioFooter(flat, flatEn, { base });
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

function openTopicHtml(topic) {
  const meta = topic.meta
    ? `<span class="pf-open__meta">/ ${esc(topic.meta)}</span>`
    : "";
  return `<li class="pf-open__row">
              <span class="pf-open__n">${esc(topic.n)}</span>
              <div class="pf-open__body">
                <p class="pf-open__title">${esc(topic.title)}${meta}</p>
                <p class="pf-open__desc">${esc(topic.desc)}</p>
              </div>
              <span class="pf-open__go" aria-hidden="true">→</span>
            </li>`;
}

function exploreRowHtml(lang, item) {
  const href = exploreHref(lang, item.href);
  return `<a class="pf-explore__row" href="${esc(href)}">
              <span class="pf-explore__n">${esc(item.n)}</span>
              <div class="pf-explore__body">
                <p class="pf-explore__title">${esc(item.title)}</p>
                <p class="pf-explore__desc">${esc(item.desc)}</p>
              </div>
              <span class="pf-explore__cta">${esc(item.cta)}</span>
            </a>`;
}

function indexPage(langMeta, copy, apps) {
  const lang = langMeta.dir;
  const featured = featuredApps(apps);
  const more = moreApps(apps);
  const work = copy.whatIDo
    .map(
      (w) =>
        `<article class="pf-reveal"><h3>${esc(w.title)}</h3>${workEn(lang, w)}<p>${esc(w.body)}</p></article>`
    )
    .join("\n          ");
  const process = copy.process
    .map(
      (s, i) =>
        `<div class="pf-step pf-reveal"><span class="pf-step__n">${i + 1}</span><div><strong>${esc(s.title)}</strong>${processEn(lang, s)}</div></div>`
    )
    .join("\n          ");
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
      <section class="pf-hero">
        <div class="pf-hero__grid">
          <div class="pf-hero__copy">
            <p class="pf-hero__eyebrow pf-enter" style="--d:0">${esc(copy.heroEyebrow)}</p>
            <img class="pf-hero__eko pf-enter" style="--d:1" src="/logo.png" alt="Newon" width="64" height="64" />
            <h1 class="pf-hero__name pf-enter" style="--d:2">경나원</h1>
            <p class="pf-hero__en pf-enter" style="--d:3">Nawon Kyung</p>
            <p class="pf-hero__role pf-enter" style="--d:4">CEO &amp; App Developer</p>
            <p class="pf-hero__lead pf-enter" style="--d:5">${copy.heroLeadHtml}</p>
            <div class="pf-hero__actions pf-enter" style="--d:6">
              <a class="btn btn-primary pf-hero__btn" href="#projects">${esc(copy.ctaProjects)}</a>
              <a class="btn btn-ghost pf-hero__btn" href="#contact">${esc(copy.ctaContact)}</a>
            </div>
          </div>
          <aside class="pf-hero__aside pf-enter" style="--d:5" aria-label="${esc(copy.heroMetaTitle)}">
            <p class="pf-hero__aside-title">${esc(copy.heroMetaTitle)}</p>
            <dl class="pf-hero__meta">
              <div>
                <dt>${esc(copy.heroMeta1En)}</dt>
                <dd>${esc(copy.heroMeta1Body)}</dd>
              </div>
              <div>
                <dt>${esc(copy.heroMeta2En)}</dt>
                <dd>${esc(copy.heroMeta2Body)}</dd>
              </div>
              <div>
                <dt>${esc(copy.heroMeta3En)}</dt>
                <dd>${esc(copy.heroMeta3Body)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section id="about" class="pf-section">
        <div class="pf-wrap pf-wrap--narrow pf-about">
          <p class="pf-label">${esc(copy.aboutLabel)}</p>
          <h2>${esc(copy.aboutTitle)}</h2>
          <p class="pf-reveal">${esc(copy.aboutP1)}</p>
          <p class="pf-reveal">${esc(copy.aboutP2)}</p>
        </div>
      </section>

      <section id="numbers" class="pf-section">
        <div class="pf-wrap">
          <p class="pf-label">${esc(copy.numbersLabel)}</p>
          <h2>${esc(copy.numbersTitle)}</h2>
          <p class="pf-stats__headline">${esc(copy.numbersHeadline)}</p>
          <p class="pf-stats__support">${esc(copy.numbersSupport)}</p>
          <div class="pf-stats">
          ${visibleCopyStats(copy).map(statCard).join("\n          ")}
          </div>
        </div>
      </section>

      <section class="pf-section" id="what-i-do">
        <div class="pf-wrap">
          <p class="pf-label">${esc(copy.workLabel)}</p>
          <h2>${esc(copy.workTitle)}</h2>
          <div class="pf-work">
          ${work}
          </div>
        </div>
      </section>

      <section class="pf-section">
        <div class="pf-wrap">
          <p class="pf-label">${esc(copy.processLabel)}</p>
          <h2>${esc(copy.processTitle)}</h2>
          <div class="pf-process" aria-label="${esc(copy.processAria)}">
          ${process}
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

      <section id="newon" class="pf-section">
        <div class="pf-wrap">
          <div class="pf-newon pf-reveal">
            <img class="pf-newon__mark" src="/logo.png" alt="Newon" width="72" height="72" />
            <div>
              <p class="pf-label">${esc(copy.studioLabel)}</p>
              <h2>Newon</h2>
              <p class="pf-sub">${esc(copy.studioSub)}</p>
              <p>${esc(copy.studioBody)}</p>
              <a class="btn btn-primary" href="${SITE}/${lang}/">${esc(copy.studioCta)}</a>
            </div>
          </div>
        </div>
      </section>

      <section id="founder" class="pf-section pf-founder">
        <div class="pf-wrap pf-founder__grid">
          <div class="pf-founder__id">
            <p class="pf-label">${esc(copy.founderLabel)}</p>
            <p class="pf-founder__name">경나원</p>
            <p class="pf-founder__en">Nawon Kyung</p>
            <p class="pf-founder__role">CEO &amp; App Developer</p>
          </div>
          <div class="pf-founder__story">
            <h2 class="pf-founder__title">${esc(copy.founderTitle)}</h2>
            <p class="pf-founder__intro">${esc(copy.founderIntro)}</p>
            <p class="pf-founder__intro">${esc(copy.founderIntro2)}</p>
            <p class="pf-founder__expertise">${copy.founderExpertise.map((e) => `<span>${esc(e)}</span>`).join("")}</p>
            <a class="pf-founder__biz" href="/${esc(lang)}/business/">${esc(copy.founderBusiness)}</a>
          </div>
        </div>
      </section>

      <section id="contact" class="pf-section pf-cx">
        <div class="pf-wrap">
          <header class="pf-cx__head">
            <p class="pf-label pf-cx-enter" style="--d: 0">${esc(copy.contactLabel)}</p>
            <h2 class="pf-cx__title pf-cx-enter" style="--d: 1">${copy.contactHeroTitleHtml}</h2>
            <p class="pf-cx__lead pf-cx-enter" style="--d: 2">${esc(copy.contactLead)}</p>
          </header>

          <div class="pf-cx__split">
            <div class="pf-cx__open-col pf-cx-enter" style="--d: 3">
              <p class="pf-cx__open-label">${esc(copy.contactOpenLabel)}</p>
              <ul class="pf-open">
                ${copy.contactOpenTopics.map(openTopicHtml).join("\n                ")}
              </ul>
            </div>

            <aside class="pf-cx__card pf-cx-enter" style="--d: 4" aria-labelledby="pf-cx-info-title">
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
        </div>

        <div class="pf-wrap pf-cx-msg">
          <div class="pf-cx-msg__grid pf-cx-enter" style="--d: 8">
            <div class="pf-cx-msg__copy">
              <p class="pf-label">${esc(copy.contactMsgLabel)}</p>
              <h2 class="pf-cx-msg__title">${copy.contactMsgTitleHtml}</h2>
              <p class="pf-cx-msg__lead">${esc(copy.contactMsgLead)}</p>
            </div>
            <a class="pf-cx-msg__mail" href="mailto:newon@newon.app">${esc(copy.contactMsgMail)}</a>
          </div>
        </div>
      </section>

      <section class="pf-section pf-explore" aria-labelledby="pf-explore-title">
        <div class="pf-wrap">
          <div class="pf-explore__head pf-cx-enter" style="--d: 0">
            <p class="pf-label">${esc(copy.exploreLabel)}</p>
            <h2 id="pf-explore-title" class="pf-explore__title">${esc(copy.exploreTitle)}</h2>
            <p class="pf-explore__lead">${esc(copy.exploreLead)}</p>
          </div>
          <nav class="pf-explore__nav" aria-label="${esc(copy.exploreLabel)}">
            ${copy.exploreNav.map((item) => exploreRowHtml(lang, item)).join("\n            ")}
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
