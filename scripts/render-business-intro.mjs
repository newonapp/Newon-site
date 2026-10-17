#!/usr/bin/env node
/**
 * Information-only introduction pages for BabyLog · PetLog · My World · ShareOn
 * → /{lang}/{babylog,petlog,myworld,shareon}/ (all 9 locales; ko + en copy, other locales reuse en).
 *
 * Seven common sections (ids): intro · problem · features · audience · partners · download · contact.
 * No forms, inputs, sign-in or service controls. Real features live in each app.
 * Partnership / contact CTAs link to the existing inquiry page (?category=Partnership).
 */
import fs from "fs";
import path from "path";
import {
  LANGS,
  OG_LOCALE,
  SITE_ORIGIN,
  ROOT,
  escapeHtml,
  fontLinksHtml,
  hreflangBlock,
  loadJson,
  flatten,
  writeRootRedirect,
} from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { NEW_INTRO_IDS, SLUG, BUSINESS, PAGES, COMMON, LIFE_BLOCKS, PARTNER_INQUIRY_PATH, copyLang, isTransitional } from "./six-businesses.mjs";

const esc = escapeHtml;
const pad2 = (n) => String(n).padStart(2, "0");
const CSS_VER = "20261017bi1";

function cardsHtml(cards, cols) {
  return `<ul class="bi-grid bi-grid--${cols}">${cards
    .map(
      ([t, d], i) => `<li class="bi-card">
      <span class="bi-card__n" aria-hidden="true">${pad2(i + 1)}</span>
      <h3 class="bi-card__t">${esc(t)}</h3>
      <p class="bi-card__d">${esc(d)}</p>
    </li>`
    )
    .join("")}</ul>`;
}

function sectionHtml(id, label, lead, inner, extra = "") {
  return `<section id="${id}" class="bp-sec bi-sec" data-bp-reveal aria-labelledby="${id}-label">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label" id="${id}-label">${esc(label)}</p>${lead ? `\n      <p class="bp-lead">${esc(lead)}</p>` : ""}
    </header>
    ${inner}${extra}
  </div>
</section>`;
}

/** App download / launch block (also used by the LivOn and Ongil pages). `id` = element id. */
export function downloadBlockHtml(lang, bizId, lead, id = "download") {
  const C = COMMON[copyLang(lang)];
  const b = BUSINESS[bizId];
  const hasStores = b.launch === "stores" && b.stores;
  const actions = hasStores
    ? `<div class="bi-download__actions">
        <a class="bp-btn bp-btn--primary" href="${esc(b.stores.appStore)}" target="_blank" rel="noopener" data-analytics="app_store_${bizId}">${esc(C.appStore)}</a>
        <a class="bp-btn bp-btn--primary" href="${esc(b.stores.googlePlay)}" target="_blank" rel="noopener" data-analytics="google_play_${bizId}">${esc(C.googlePlay)}</a>
      </div>`
    : `<div class="bi-download__actions">
        <a class="bp-btn bp-btn--ghost" href="../news/">${esc(C.newsLink)}</a>
      </div>`;
  const title = hasStores ? C.statusStores : C.comingTitle;
  const body = hasStores ? lead : `${lead} ${C.comingBody}`;
  return `<div class="bi-download" id="${id}-card">
      <h3 class="bi-download__title">${esc(title)}</h3>
      <p class="bi-download__body">${esc(body)}</p>
      ${actions}
      <p class="bi-download__info"><strong>${esc(C.infoOnlyTitle)}.</strong> ${esc(C.infoOnlyBody)}</p>
    </div>`;
}

function pageBody(lang, id) {
  const cl = copyLang(lang);
  const P = PAGES[id][cl];
  const C = COMMON[cl];
  const S = C.sections;
  const b = BUSINESS[id];
  const hasStores = b.launch === "stores";
  const partnerHref = `../${PARTNER_INQUIRY_PATH}`;
  const NAME = b.name.toUpperCase();

  const hero = `<section class="bp-hero" data-bp-reveal aria-labelledby="bp-hero-title">
  <div class="bp-inner bp-hero__grid">
    <div class="bp-hero__copy">
      <p class="bp-eyebrow">NEWON · ${esc(NAME)}</p>
      <h1 class="bp-hero__title" id="bp-hero-title">${P.h1}</h1>
      <p class="bp-hero__lead">${esc(P.lead)}</p>
      <p class="bi-status">${esc(hasStores ? C.statusStores : C.statusComing)}</p>
      <div class="bp-hero__actions">
        <a class="bp-btn bp-btn--primary" href="#download" data-analytics="bi_hero_download">${esc(C.toDownload)}</a>
        <a class="bp-btn bp-btn--ghost" href="#partners">${esc(C.toPartners)}</a>
      </div>
    </div>
    <aside class="bp-hero__visual bp-hero__visual--mark" aria-hidden="true">
      <p class="bp-mark bp-mark--stack"><span class="bp-mark__line bi-mark-name">${esc(NAME)}</span></p>
    </aside>
  </div>
</section>`;

  const partnersExtra = `
    <p class="bi-note">${esc(C.partnersNote)}</p>`;

  const sections = [
    sectionHtml("intro", S.intro, P.intro.lead, cardsHtml(P.intro.cards, 3)),
    sectionHtml("problem", S.problem, P.problem.lead, cardsHtml(P.problem.cards, 3)),
    sectionHtml("features", S.features, P.features.lead, cardsHtml(P.features.cards, 6)),
    sectionHtml("audience", S.audience, P.audience.lead, cardsHtml(P.audience.cards, 3)),
    sectionHtml("partners", S.partners, P.partners.lead, cardsHtml(P.partners.cards, 3), partnersExtra),
    sectionHtml("download", S.download, "", downloadBlockHtml(lang, id, P.download.lead)),
  ].join("\n");

  const contact = `<section id="contact" class="bp-cta" data-bp-reveal>
  <div class="bp-inner bp-cta__inner">
    <p class="bp-label">${esc(C.contactLabel)}</p>
    <h2 class="bp-cta__title">${esc(C.contactTitle)}</h2>
    <p class="bp-cta__lead">${esc(C.contactLead)}</p>
    <a class="bp-btn bp-btn--primary" href="${esc(partnerHref)}" data-analytics="bi_contact_${id}">${esc(C.contactBtn)}</a>
  </div>
</section>`;

  return `<nav class="bp-crumb" aria-label="Breadcrumb">
  <div class="bp-inner">
    <ol class="bp-crumb__list">
      <li><a href="../">${esc(C.crumbHome)}</a></li>
      <li aria-current="page">${esc(b.name)}</li>
    </ol>
  </div>
</nav>
${hero}
${sections}
${contact}`;
}

function jsonLd(lang, id, P) {
  const url = `${SITE_ORIGIN}/${lang}/${SLUG[id]}/`;
  const b = BUSINESS[id];
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: P.title,
    description: P.desc,
    url,
    about: { "@type": "Thing", name: b.name },
    publisher: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN },
  };
  const crumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${lang}/` },
      { "@type": "ListItem", position: 2, name: b.name, item: url },
    ],
  };
  return `    <script type="application/ld+json">${JSON.stringify(page)}</script>
    <script type="application/ld+json">${JSON.stringify(crumb)}</script>`;
}


/** Stylesheets needed by the appended blocks on the LivOn / Ongil pages. */
export const LIFE_EXTRA_CSS = `<link rel="stylesheet" href="/business-pillar.css?v=20261017p4a" />
    <link rel="stylesheet" href="/business-intro.css?v=${CSS_VER}" />`;

/**
 * Closing blocks appended to the existing LivOn (`lifestage`) and Ongil pages, in /{lang}/{lifestage|ongil}/:
 * #bi-partners (business / seller / institution partnerships), #bi-download (app launch guide + info-only notice),
 * and — while the app migration is not verified — a notice that the existing web preview stays online.
 * The existing editorial sections are not touched.
 */
export function lifeExtraHtml(lang, id) {
  const cl = copyLang(lang);
  const L = LIFE_BLOCKS[id][cl];
  const C = COMMON[cl];
  const b = BUSINESS[id];
  const transition = isTransitional(id)
    ? `<div class="bi-download" id="bi-transition">
      <h3 class="bi-download__title">${esc(LIFE_BLOCKS.transition[cl].title)}</h3>
      <p class="bi-download__body">${esc(LIFE_BLOCKS.transition[cl].body)}</p>
      <div class="bi-download__actions"><a class="bp-btn bp-btn--ghost" href="${esc(b.webStartHref)}" data-analytics="web_preview_${id}">${esc(LIFE_BLOCKS.transition[cl].btn)}</a></div>
    </div>`
    : "";
  const partners = `<section id="bi-partners" class="bi-extra" aria-labelledby="bi-partners-label">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label" id="bi-partners-label">${esc(C.sections.partners)}</p>
      <p class="bp-lead">${esc(L.partnersLead)}</p>
    </header>
    ${cardsHtml(L.partnersCards, 3)}
    <p class="bi-note">${esc(C.partnersNote)}</p>
    <p class="bi-note"><a class="bp-btn bp-btn--primary" href="../${esc(PARTNER_INQUIRY_PATH)}" data-analytics="bi_contact_${id}">${esc(C.contactBtn)}</a></p>
  </div>
</section>`;
  const download = `<section id="bi-download" class="bi-extra" aria-labelledby="bi-download-label">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label" id="bi-download-label">${esc(C.sections.download)}</p>
    </header>
    ${downloadBlockHtml(lang, id, L.downloadLead, "bi-download")}
    ${transition}
  </div>
</section>`;
  return `<div class="bp-page bi-page" style="--bi-accent:${b.accent}">
${partners}
${download}
</div>`;
}

export function renderBusinessIntroPages() {
  const template = fs.readFileSync(path.join(ROOT, "templates", "business-pillar.html"), "utf8");
  const flatEn = flatten(loadJson("en.json"));
  const written = [];
  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(loadJson(file));
    for (const id of NEW_INTRO_IDS) {
      const slug = SLUG[id];
      const P = PAGES[id][copyLang(dir)];
      let html = template;
      html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
      html = html.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(dir));
      html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
      html = html.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/${slug}/`);
      html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(slug));
      html = html.replace(/\{\{JSON_LD\}\}/g, () => jsonLd(dir, id, P));
      html = html.replace(/\{\{SEO_TITLE\}\}/g, () => esc(P.title));
      html = html.replace(/\{\{META_DESCRIPTION\}\}/g, () => esc(P.desc));
      html = html.replace(/\{\{PILLAR_SLUG\}\}/g, slug);
      html = html.replace(/\{\{PAGE_BODY\}\}/g, () => pageBody(dir, id));
      // accent colour + page class, and the intro stylesheet
      html = html.replace(
        `class="bp-page bp--${slug}"`,
        `class="bp-page bi-page bp--${slug}" style="--bi-accent:${BUSINESS[id].accent}"`
      );
      html = html.replace(
        /(\s*<link rel="stylesheet" href="\/business-pillar\.css[^>]*>)/,
        `$1\n    <link rel="stylesheet" href="/business-intro.css?v=${CSS_VER}" />`
      );
      html = injectSiteChrome(html, flat, flatEn, { activeNav: id, base: "../" });
      const rel = path.join(dir, slug, "index.html");
      fs.mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true });
      fs.writeFileSync(path.join(ROOT, rel), html);
      written.push(rel);
    }
  }
  for (const id of NEW_INTRO_IDS) {
    writeRootRedirect(SLUG[id]);
    written.push(path.join(SLUG[id], "index.html"));
  }
  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const rel of written) {
      const dest = path.join(pub, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(ROOT, rel), dest);
    }
  }
  console.log(`render-business-intro: wrote ${written.length} files (${NEW_INTRO_IDS.join(", ")})`);
}

if (import.meta.url === `file://${process.argv[1]}`) renderBusinessIntroPages();
