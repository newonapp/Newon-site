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
    <link rel="stylesheet" href="/portfolio/portfolio.css" />
    <script src="/lang-nav.js"></script>
    <script src="/theme-shell.js"></script>
  </head>`;
}

function chromeNav(lang, copy, activeHash) {
  const prefix = pfPrefix(lang);
  const items = [
    { href: `${prefix}/#about`, label: copy.navAbout, hash: "about" },
    { href: `${prefix}/#projects`, label: copy.navProjects, hash: "projects" },
    { href: `${prefix}/#newon`, label: copy.navNewon, hash: "newon" },
    { href: `${prefix}/#contact`, label: copy.navContact, hash: "contact" },
  ];
  const links = items
    .map((it) => {
      const cur = activeHash === it.hash ? ' aria-current="page"' : "";
      return `<a href="${it.href}"${cur}>${esc(it.label)}</a>`;
    })
    .join("\n            ");
  return `
    <a class="skip-link" href="#pf-main">${esc(copy.skip)}</a>
    <header class="site-header pf-header">
      <div class="container pf-header__inner">
        <a class="pf-brand" href="${prefix}/">
          <img src="/logo.png" alt="Newon" width="36" height="36" />
          <span>Nawon Kyung</span>
        </a>
        <nav class="pf-nav" aria-label="${esc(copy.navAria)}">
            ${links}
        </nav>
        <div class="pf-header__actions">
          ${langSelect(lang, copy)}
          <button
            type="button"
            class="navbar-theme-toggle"
            data-theme-toggle
            data-label-light="${esc(copy.themeToLight)}"
            data-label-dark="${esc(copy.themeToDark)}"
            title="${esc(copy.themeToggle)}"
            aria-label="${esc(copy.themeToDark)}"
          >🌙</button>
          <button
            class="nav-toggle nav-toggle--toolbar"
            type="button"
            data-pf-nav-toggle
            aria-expanded="false"
            aria-controls="pf-mobile-nav"
            aria-label="${esc(copy.menuOpen)}"
          >
            <span></span><span></span>
          </button>
        </div>
      </div>
      <nav id="pf-mobile-nav" class="pf-mobile-nav" hidden>
        ${links}
      </nav>
    </header>`;
}

function foot() {
  return `
    <footer class="pf-foot">
      <p>© Newon</p>
    </footer>
    <script src="/lang-dropdown.js"></script>
    <script src="/portfolio/portfolio.js"></script>
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
        <article class="pf-case pf-reveal">
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
    ${chromeNav(lang, copy, "")}
    <main id="pf-main">
      <section class="pf-hero">
        <div class="pf-hero__inner">
          <img class="pf-hero__eko" src="/logo.png" alt="Newon" width="56" height="56" />
          <h1 class="pf-hero__name">경나원</h1>
          <p class="pf-kicker-en">Nawon Kyung</p>
          <p class="pf-hero__role">CEO &amp; App Developer</p>
          <p class="pf-hero__lead">${copy.heroLeadHtml}</p>
          <div class="pf-hero__actions">
            <a class="btn btn-primary" href="#projects">${esc(copy.ctaProjects)}</a>
            <a class="btn btn-ghost" href="#contact">${esc(copy.ctaContact)}</a>
          </div>
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
          ${featured.map((a, i) => featuredCase(a, i, copy)).join("\n")}
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

      <section id="contact" class="pf-section">
        <div class="pf-wrap pf-wrap--narrow pf-contact">
          <h2>${esc(copy.contactTitle)}</h2>
          <p class="pf-contact__name">경나원</p>
          <p class="pf-contact__en">Nawon Kyung</p>
          <p class="pf-contact__role">CEO &amp; App Developer</p>
          <div class="pf-dl">
            <a href="tel:01039238904"><small>${esc(copy.contactPhone)}</small><span>010-3923-8904</span></a>
            <a href="mailto:newon@newon.app"><small>${esc(copy.contactEmail)}</small><span>newon@newon.app</span></a>
            <a href="https://www.newon.app"><small>${esc(copy.contactWeb)}</small><span>https://www.newon.app</span></a>
          </div>
          <div class="pf-hero__actions">
            <a class="btn btn-primary" href="mailto:newon@newon.app">${esc(copy.contactMailCta)}</a>
            <a class="btn btn-ghost" href="${VCARD}" data-save-vcard>${esc(copy.contactSave)}</a>
          </div>
        </div>
      </section>
    </main>
${foot()}`;
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
    ${chromeNav(lang, copy, "projects")}
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
${foot()}`;
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
