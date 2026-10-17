/**
 * Writes /{lang}/shareon/ — the SHAREON business page linked from the flagship-business nav row.
 * Copy lives in shareon-page-data.mjs (all nine languages); see the rules at the top of that file.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SHAREON_PAGE } from "./shareon-page-data.mjs";
import { SITE_LANGS } from "./portfolio-i18n.mjs";
import { flatten, loadJson, fillMissing, fontLinksHtml } from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";
import { renderGlobalHeader, renderStudioFooter } from "./site-chrome.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.newon.app";
const SLUG = "shareon";
const BADGE = "NEWON BUSINESS";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function localeFlats(lang) {
  const en = loadJson("en.json");
  const data = fillMissing(loadJson(`${lang}.json`), en);
  return { flat: flatten(data), flatEn: flatten(en) };
}

function altLinks() {
  const extras = SITE_LANGS.map(
    (l) => `<link rel="alternate" hreflang="${esc(l.hreflang)}" href="${SITE}/${l.dir}/${SLUG}/" />`
  ).join("\n    ");
  return `${extras}
    <link rel="alternate" hreflang="x-default" href="${SITE}/ko/${SLUG}/" />`;
}

function page(langMeta) {
  const lang = langMeta.dir;
  const c = SHAREON_PAGE[lang];
  if (!c) throw new Error(`SHAREON copy missing for ${lang}`);
  const { flat, flatEn } = localeFlats(lang);
  const title = c.title;
  const desc = clampSeoDescription(c.lead);
  const list = (items) => items.map((t) => `<li>${esc(t)}</li>`).join("\n            ");
  const canonical = `${SITE}/${lang}/${SLUG}/`;
  const header = renderGlobalHeader(flat, flatEn, {
    activeNav: "shareon",
    base: "../",
    idSuffix: "shareon",
    langDir: lang,
  });
  const footer = renderStudioFooter(flat, flatEn, { base: "../", langDir: lang });
  return `<!DOCTYPE html>
<html lang="${esc(langMeta.htmlLang)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${esc(canonical)}" />
    ${altLinks()}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:locale" content="${esc(langMeta.ogLocale)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:site_name" content="Newon" />
    <meta property="og:image" content="${SITE}/logo.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(desc)}" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    ${fontLinksHtml(lang)}
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/gnav-mega.css?v=20261018petlog1" />
    <link rel="stylesheet" href="/hub-pages.css?v=20260830filt1" />
    <link rel="stylesheet" href="/portfolio/portfolio.css?v=20260903pfcs1" />
    <script src="/lang-nav.js?v=20260821stay2"></script>
    <script src="/theme-shell.js"></script>
  </head>
  <body class="pf-page">
    ${header}
    <main id="pf-main">
      <section class="pf-project-hero">
        <div class="pf-wrap pf-wrap--narrow">
          <span class="pf-badge">${esc(BADGE)}</span>
          <h1>SHAREON</h1>
          <p class="pf-case__cat">${esc(c.cat)}</p>
          <p class="pf-hero__lead">${esc(c.lead)}</p>
          <div class="pf-hero__actions">
            <a class="btn btn-ghost" href="/${lang}/news/">${esc(c.news)}</a>
            <a class="btn btn-ghost" href="/${lang}/contact/">${esc(c.contact)}</a>
          </div>
        </div>
      </section>
      <section class="pf-section pf-section--tight">
        <div class="pf-wrap pf-wrap--narrow">
          <h2>${esc(c.directionTitle)}</h2>
          <ul class="pf-roles">
            ${list(c.direction)}
          </ul>
        </div>
      </section>
      <section class="pf-section pf-section--tight">
        <div class="pf-wrap pf-wrap--narrow">
          <h2>${esc(c.statusTitle)}</h2>
          <ul class="pf-roles">
            ${list(c.status)}
          </ul>
        </div>
      </section>
    </main>
    ${footer}
    <script src="/lang-dropdown.js"></script>
    <script src="/analytics.js?v=20260904sec1" defer></script>
    <script src="/search.js?v=20260904a11y1" defer></script>
    <script src="/site-chrome.js?v=20260826gnav5" defer></script>
  </body>
</html>
`;
}

for (const langMeta of SITE_LANGS) {
  const dest = path.join(ROOT, langMeta.dir, SLUG, "index.html");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, page(langMeta));
}
console.log(`render-shareon: wrote ${SITE_LANGS.length} pages`);
