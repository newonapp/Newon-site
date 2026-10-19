#!/usr/bin/env node
/**
 * Business · Studio · Partnerships pages (Oct 2026 restructure).
 *
 * Writes, for all nine locales:
 *   business/{automation,solutions,digital-products,platforms}/
 *   studio/{digital,design-systems,projects,partnerships}/
 *   partnerships/ + {corporate,individuals,public,platforms,platforms/<6>,strategic,inquiry}/
 * plus root language redirects for the new paths.
 *
 * Every page is built from existing components only — templates/business-pillar.html, the bp-* page
 * blocks (hero, explore panels, process, FAQ, CTA, section cards) and the editorial menu row
 * (gnav-mega__row: number · name · short description · arrow). No new CSS file.
 * The /business/ and /studio/ hubs reuse bspHubHtml() from their own renderers.
 * Copy: scripts/bsp-content.mjs (ko source, en meaning-checked; other locales show the English body).
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
  fillMissing,
  writeRootRedirect,
} from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import {
  PAGES,
  MENUS,
  SECTION_NAME,
  OTHER_LABEL,
  STATUS,
  ROW_LABELS,
  PARTNER_PROCESS,
  PLATFORMS,
  PLATFORM_PAGES,
  PLATFORM_PAGE_LABELS,
  FORM,
  HUBS,
  partnerAsk,
} from "./bsp-content.mjs";

const esc = escapeHtml;
const pad2 = (n) => String(n).padStart(2, "0");
const bodyLang = (lang) => (lang === "ko" ? "ko" : "en");
/** Lang-root-relative path → href from a page `depth` folders below /{lang}/. */
const rel = (depth, p) => (/^(mailto:|https?:|#|\/)/.test(p) ? p : "../".repeat(depth) + p);
const depthOf = (slug) => slug.split("/").filter(Boolean).length;
/** Menu entry title: Korean pages use the Korean menu label where one exists (Studio keeps English names). */
const menuTitle = (m, lang) => (lang === "ko" && m.koTitle ? m.koTitle : m.name);

/* ------------------------------------------------------------------------------------------------
 * Blocks
 * ---------------------------------------------------------------------------------------------- */

/** Editorial menu rows (the same row component as the global mega menu). items: [title, desc, href?] */
function rowsList(items, depth, { numbered = true } = {}) {
  const rows = items
    .map(([title, desc, href], i) => {
      const inner = `${numbered ? `<span class="gnav-mega__row-n" aria-hidden="true">${pad2(i + 1)}</span>` : ""}
      <span class="gnav-mega__row-main">
        <span class="gnav-mega__row-title">${esc(title)}</span>
        <span class="gnav-mega__row-desc">${esc(desc)}</span>
      </span>`;
      if (!href) return `<div class="gnav-mega__row" role="listitem">${inner}</div>`;
      const h = rel(depth, href);
      const arrow = /partnerships\/inquiry|business\/inquiry/.test(href) ? "↗" : "→";
      return `<a class="gnav-mega__row" href="${esc(h)}" role="listitem">${inner}
      <span class="gnav-mega__row-arrow" aria-hidden="true">${arrow}</span>
    </a>`;
    })
    .join("\n    ");
  return `<div class="gnav-mega__list gnav-mega__list--editorial" role="list">
    ${rows}
  </div>`;
}

function secHead(label, lead, id) {
  return `<header class="bp-sec__head">
      <p class="bp-label" id="${id}-label">${esc(label)}</p>${lead ? `\n      <p class="bp-lead">${esc(lead)}</p>` : ""}
    </header>`;
}

function rowsBlock(b, depth) {
  return `<section id="${b.id}" class="bp-sec" data-bp-reveal aria-labelledby="${b.id}-label">
  <div class="bp-inner">
    ${secHead(b.label, b.lead, b.id)}
    ${rowsList(b.items, depth, { numbered: true })}
  </div>
</section>`;
}

/** Single-line numbered items (existing "USE CASES" list). */
function ucBlock(b) {
  return `<section id="${b.id}" class="bp-sec bp-usecases" data-bp-reveal aria-labelledby="${b.id}-label">
  <div class="bp-inner">
    ${secHead(b.label, b.lead, b.id)}
    <ol class="bp-uc__list">${b.items
      .map(
        ([t], i) => `<li class="bp-uc__item">
      <span class="bp-uc__n">${pad2(i + 1)}</span>
      <span class="bp-uc__t">${esc(t)}</span>
      <span class="bp-uc__arrow" aria-hidden="true">→</span>
    </li>`
      )
      .join("")}</ol>
  </div>
</section>`;
}

function productsBlock(b, depth, lang, uid) {
  const L = ROW_LABELS[bodyLang(lang)];
  const S = STATUS[bodyLang(lang)];
  const tabs = b.items
    .map(
      (it, i) => `<button type="button" class="bp-explore__tab${i === 0 ? " is-active" : ""}" role="tab" id="${uid}-tab-${i}" aria-selected="${i === 0}" aria-controls="${uid}-panel-${i}" data-bp-tab="${i}">
      <span class="bp-explore__tab-n">${pad2(i + 1)}</span>
      <span class="bp-explore__tab-t">${esc(it.tab)}</span>
    </button>`
    )
    .join("");
  const panels = b.items
    .map((it, i) => {
      const rows = [
        [L.who, it.who],
        [L.problem, it.problem],
        [L.features, it.features],
        [L.how, it.how],
      ]
        .filter(([, v]) => v && v !== "—")
        .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
        .join("\n        ");
      const askHref =
        it.ask === "studio"
          ? partnerAsk("studio", `${b.source || "studio"}-${it.tab.toLowerCase().replace(/\s+/g, "-")}`)
          : `business/inquiry/?category=Business&type=${it.ask}&source=${b.source || "business"}-${it.tab.toLowerCase().replace(/\s+/g, "-")}#inquiry`;
      const askLabel = it.ask === "studio" ? L.partnerBtn : L.askBtn;
      const more = it.more
        ? `<a class="bp-btn bp-btn--ghost" href="${esc(rel(depth, it.more[1]))}">${esc(it.more[0])} →</a>`
        : "";
      return `<article class="bp-explore__panel${i === 0 ? " is-active" : ""}" role="tabpanel" id="${uid}-panel-${i}" aria-labelledby="${uid}-tab-${i}" data-bp-panel="${i}"${i === 0 ? "" : " hidden"}>
      <p class="bp-explore__kicker">${pad2(i + 1)} · ${esc(it.tab)}</p>
      <h2 class="bp-explore__title">${esc(it.name)}</h2>
      <p class="bp-explore__summary">${esc(it.summary)}</p>
      <dl class="bp-explore__detail">
        ${rows}
      </dl>
      <footer class="bp-explore__foot">
        <div class="bp-explore__price"><span>${esc(L.status)}</span><strong data-bsp-status="${esc(it.status)}">${esc(S[it.status])}</strong></div>
        <div class="bp-explore__actions">${more}<a class="bp-btn bp-btn--primary" href="${esc(rel(depth, askHref))}">${esc(askLabel)}</a></div>
      </footer>
    </article>`;
    })
    .join("");
  return `<section id="${b.id}" class="bp-sec bp-explore-sec" data-bp-reveal aria-labelledby="${b.id}-label">
  <div class="bp-inner">
    ${secHead(b.label, b.note, b.id)}
    <div class="bp-explore" data-bp-explore>
      <div class="bp-explore__tabs" role="tablist" aria-label="${esc(b.label)}">${tabs}</div>
      <div class="bp-explore__stage">${panels}</div>
    </div>
  </div>
</section>`;
}

function processBlock(lang) {
  const pr = PARTNER_PROCESS[bodyLang(lang)];
  return `<section id="process" class="bp-sec bp-process" data-bp-reveal aria-labelledby="process-label">
  <div class="bp-inner">
    ${secHead(pr.label, pr.note, "process")}
    <ol class="bp-proc" style="--bp-proc-n:${pr.steps.length}">${pr.steps
      .map(
        ([t, d], i) => `<li class="bp-proc__step" style="--i:${i}">
      <span class="bp-proc__n" aria-hidden="true">${pad2(i + 1)}</span>
      <span class="bp-proc__label">${pad2(i + 1)}</span>
      <span class="bp-proc__t">${esc(t)}</span>
      <span class="bp-proc__d">${esc(d)}</span>
    </li>`
      )
      .join("")}</ol>
  </div>
</section>`;
}

function faqBlock(items, uid) {
  return `<section id="faq" class="bp-sec bp-faq" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">FAQ</p>
    </header>
    <div class="bp-faq__list">${items
      .map(
        ([q, a], i) => `<div class="bp-faq__item">
      <button type="button" class="bp-faq__q" aria-expanded="false" id="${uid}-faq-q-${i}" aria-controls="${uid}-faq-a-${i}">
        <span class="bp-faq__q-text">${esc(q)}</span>
        <span class="bp-faq__icon" aria-hidden="true"></span>
      </button>
      <div class="bp-faq__a" id="${uid}-faq-a-${i}" role="region" aria-labelledby="${uid}-faq-q-${i}" hidden>
        <div class="bp-faq__a-inner"><p>${esc(a)}</p></div>
      </div>
    </div>`
      )
      .join("")}</div>
  </div>
</section>`;
}

function platformsBlock(b, depth, lang) {
  const P = PLATFORM_PAGES;
  const items = PLATFORMS.map((p) => [p.name, P[p.id][bodyLang(lang)].intro, `partnerships/platforms/${p.id}/`]);
  return rowsBlock({ ...b, items }, depth);
}

/** Existing form styles, copied verbatim from the business inquiry template (no new design). */
let FORM_CSS = null;
function formCss() {
  if (FORM_CSS) return FORM_CSS;
  const tpl = fs.readFileSync(path.join(ROOT, "templates", "business-inquiry.html"), "utf8");
  const a = tpl.indexOf("      .bz-form-wrap {");
  const end = ".bz-fail.is-visible { display: block; }";
  const b = tpl.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error("render-bsp: inquiry form styles not found in templates/business-inquiry.html");
  FORM_CSS = tpl.slice(a, b + end.length);
  return FORM_CSS;
}

/**
 * Partnership inquiry form (existing Newon inquiry system: business/inquiry.js → FormSubmit, honeypot,
 * validation, e-mail fallback). `o` lets another page reuse it with its own copy / types:
 *   o.copy (overrides FORM keys: label, title, lead, subject, types), o.category, o.interest (fixed area).
 */
export function inquiryFormHtml(lang, depth, o = {}) {
  return formBlock(lang, depth, o);
}

function formBlock(lang, depth, o = {}) {
  const F = { ...FORM[bodyLang(lang)], ...(o.copy || {}) };
  const opts = (list) => list.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("\n                ");
  return `<link rel="stylesheet" href="/business-page.css?v=20260923pad1" />
<style>
${formCss()}
</style>
<section id="inquiry" class="bp-sec" aria-labelledby="pt-form-title">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">${esc(F.label)}</p>
      <h2 class="bp-cta__title" id="pt-form-title">${esc(F.title)}</h2>
      <p class="bp-lead" id="pt-form-lead">${esc(F.lead)}</p>
    </header>
    <div class="bz-form-wrap">
      <form class="bz-form" id="bz-inquiry-form" novalidate data-analytics="partnership_inquiry" data-submit="${esc(F.submit)}" data-submitting="${esc(F.submitting)}" data-subject="${esc(F.subject)}" aria-describedby="pt-form-lead">
        <input type="hidden" name="category" value="${esc(o.category || "Partnership")}" />${o.interest ? `\n        <input type="hidden" name="interest" value="${esc(o.interest)}" />` : ""}
        <div class="bz-field">
          <label for="pt-participant">${esc(F.participant)}<span class="bz-req" aria-hidden="true">*</span></label>
          <select id="pt-participant" name="participant" required>
                <option value="" disabled selected>${esc(F.choose)}</option>
                ${opts(F.participants)}
          </select>
        </div>
        <div class="bz-field">
          <label for="bz-name">${esc(F.name)}<span class="bz-req" aria-hidden="true">*</span></label>
          <input id="bz-name" name="name" type="text" required maxlength="80" autocomplete="name" />
        </div>
        <div class="bz-field">
          <label for="pt-company">${esc(F.org)} <span class="bz-opt">(${esc(F.optional)})</span></label>
          <input id="pt-company" name="company" type="text" maxlength="120" autocomplete="organization" aria-describedby="pt-company-hint" />
          <p class="bz-field-hint" id="pt-company-hint">${esc(F.orgHint)}</p>
        </div>
        <div class="bz-field">
          <label for="bz-email">${esc(F.email)}<span class="bz-req" aria-hidden="true">*</span></label>
          <input id="bz-email" name="email" type="email" required maxlength="120" autocomplete="email" inputmode="email" />
        </div>
        <div class="bz-field">
          <label for="bz-type">${esc(F.type)}<span class="bz-req" aria-hidden="true">*</span></label>
          <select id="bz-type" name="type" required>
                <option value="" disabled selected>${esc(F.choose)}</option>
                ${opts(F.types)}
          </select>
        </div>
${o.interest ? "" : `        <div class="bz-field">
          <label for="pt-interest">${esc(F.interest)} <span class="bz-opt">(${esc(F.optional)})</span></label>
          <select id="pt-interest" name="interest">
                <option value="">${esc(F.choose)}</option>
                ${opts(F.interests)}
          </select>
        </div>
`}        <div class="bz-field">
          <label for="bz-message">${esc(F.message)}<span class="bz-req" aria-hidden="true">*</span></label>
          <textarea id="bz-message" name="message" required maxlength="4000" placeholder="${esc(F.messagePh)}"></textarea>
        </div>
        <div class="bz-field bz-field--check">
          <div class="bz-consent">
            <label class="bz-consent__label" for="bz-consent">
              <input id="bz-consent" name="consent" type="checkbox" value="yes" required />
              <span class="bz-consent__box" aria-hidden="true"></span>
              <span class="bz-consent__text">${esc(F.consent)}</span>
            </label>
            <a class="bz-consent__link" href="${rel(depth, "privacy/")}" target="_blank" rel="noopener noreferrer">${esc(F.privacy)}<span aria-hidden="true"> ↗</span></a>
          </div>
        </div>
        <div class="bz-hp" aria-hidden="true">
          <input name="_honey" tabindex="-1" autocomplete="off" />
        </div>
        <button class="bz-submit btn btn-primary" type="submit" id="bz-submit">
          <span class="bz-submit-spin" aria-hidden="true"></span>
          <span class="bz-submit-label">${esc(F.submit)}</span>
        </button>
      </form>
      <p class="bz-fail" id="bz-fail" role="alert" hidden>${esc(F.fail)}</p>
      <p class="bz-field-hint">${esc(F.direct)} <span>newon@newon.app</span></p>
    </div>
  </div>
</section>
<script>
(function () {
  /* Preselect the partnership type from ?type= (links on Partnerships / Studio pages). */
  var p = new URLSearchParams(location.search);
  var t = p.get("type");
  var sel = document.getElementById("bz-type");
  if (t && sel) {
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === t) { sel.selectedIndex = i; break; }
    }
  }
  var src = p.get("source");
  var form = document.getElementById("bz-inquiry-form");
  if (src && form) {
    var h = document.createElement("input");
    h.type = "hidden"; h.name = "source"; h.value = String(src).slice(0, 80);
    form.appendChild(h);
  }
})();
</script>
<script src="/business/inquiry.js?v=20260923inq1" defer></script>`;
}

/** Section cards (existing "OTHER …" card grid) for every menu entry of the section. */
function sectionCards(section, lang, depth, activeId) {
  const label = OTHER_LABEL[bodyLang(lang)][section];
  const cards = MENUS[section]
    .map((m, i) => {
      const on = m.id === activeId;
      return `<a class="bp-other__card${on ? " is-active" : ""}" href="${esc(rel(depth, m.href))}"${on ? ' aria-current="page"' : ""}>
      <span class="bp-other__top">
        <span class="bp-other__n">${pad2(i + 1)}</span>
        <span class="bp-other__arrow" aria-hidden="true">${on ? "·" : "→"}</span>
      </span>
      <span class="bp-other__t">${esc(menuTitle(m, lang).toUpperCase())}</span>
      <span class="bp-other__lead">${esc(m[bodyLang(lang)])}</span>
    </a>`;
    })
    .join("");
  return `<section class="bp-sec bp-other" data-bp-reveal aria-labelledby="bsp-other-label">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label" id="bsp-other-label">${esc(label)}</p>
    </header>
    <nav class="bp-other__grid" aria-label="${esc(label)}">${cards}</nav>
  </div>
</section>`;
}

function ctaBlock(cta, depth) {
  if (!cta) return "";
  return `<section class="bp-cta" data-bp-reveal>
  <div class="bp-inner bp-cta__inner">
    <p class="bp-label">${esc(cta.label)}</p>
    <h2 class="bp-cta__title">${esc(cta.title)}</h2>
    <p class="bp-cta__lead">${esc(cta.lead)}</p>
    <a class="bp-btn bp-btn--primary" href="${esc(rel(depth, cta.btn[1]))}">${esc(cta.btn[0])}</a>
  </div>
</section>`;
}

/* ------------------------------------------------------------------------------------------------
 * Page body
 * ---------------------------------------------------------------------------------------------- */

function crumbs(section, name, depth, parent) {
  const root = `<li><a href="${esc(rel(depth, `${section}/`))}">${esc(SECTION_NAME[section])}</a></li>`;
  const mid = parent ? `\n      <li><a href="${esc(rel(depth, parent[1]))}">${esc(parent[0])}</a></li>` : "";
  return `<nav class="bp-crumb" aria-label="Breadcrumb">
  <div class="bp-inner">
    <ol class="bp-crumb__list">
      ${depth > 1 || parent ? root : ""}${mid}
      <li aria-current="page">${esc(name)}</li>
    </ol>
  </div>
</nav>`;
}

function hero(section, name, b, depth) {
  const eyebrow = `NEWON ${SECTION_NAME[section].toUpperCase()} · ${(b.eyebrowName || name).toUpperCase()}`;
  return `<section class="bp-hero" data-bp-reveal aria-labelledby="bp-hero-title">
  <div class="bp-inner bp-hero__grid">
    <div class="bp-hero__copy">
      <p class="bp-eyebrow">${esc(eyebrow)}</p>
      <h1 class="bp-hero__title" id="bp-hero-title">${b.h1}</h1>
      <p class="bp-hero__lead">${esc(b.lead)}</p>
      <div class="bp-hero__actions">
        <a class="bp-btn bp-btn--primary" href="${esc(rel(depth, b.primary[1]))}">${esc(b.primary[0])}</a>
        <a class="bp-btn bp-btn--ghost" href="${esc(rel(depth, b.ghost[1]))}">${esc(b.ghost[0])}</a>
      </div>
    </div>
    <aside class="bp-hero__visual bp-hero__visual--mark" aria-hidden="true">
    <p class="bp-mark bp-mark--stack">
      <span class="bp-mark__line">${esc(SECTION_NAME[section].toUpperCase())}</span>
      <span class="bp-mark__dot"></span>
      <span class="bp-mark__line">${esc((b.markName || name).toUpperCase())}</span>
    </p>
  </aside>
  </div>
</section>`;
}

/**
 * Full-screen film hero — the existing Newon Studio first screen (#studio-film, studio-film.css/js),
 * reused as-is . `film.src` is the moving background (Partnerships uses the LIVON Community film).
 */
function filmHero(page, b, depth) {
  const f = page.film;
  return `<link rel="stylesheet" href="/studio-film.css?v=20261019rest1" />
<style>
  /* Same film hero as Newon Studio; only the wordmark is scaled so the longer "Partnerships" fits the screen. */
  #studio-film.st-film--${esc(page.section)} .st-film__wordmark { font-size: clamp(3.1rem, 14vw, 11rem); }
  @media (max-height: 720px) { #studio-film.st-film--${esc(page.section)} .st-film__wordmark { font-size: clamp(3rem, 11vw, 8rem); } }
</style>
<section id="studio-film" class="st-film st-film--${esc(page.section)}" data-st-film data-lockup-reveal aria-labelledby="bp-hero-title">
  <div class="st-film__stage">
    <div class="st-film__fallback" aria-hidden="true"></div>
    <video
      class="st-film__video"
      src="${esc(f.src)}"
      autoplay
      muted
      loop
      playsinline
      webkit-playsinline
      preload="auto"
      disablepictureinpicture
      controlslist="nodownload nofullscreen noremoteplayback"
      aria-hidden="true"
    >
      <source src="${esc(f.src)}" type="video/mp4" />
    </video>
    <div class="st-film__lockup">
      <div class="st-film__veil" aria-hidden="true"></div>
      <p class="st-film__wordmark" lang="en">${esc(f.wordmark)}</p>
      <h1 class="st-film__slogan" id="bp-hero-title">${b.h1}</h1>
      <p class="st-film__lead">${b.filmLead || esc(b.lead)}</p>
      <div class="st-film__actions">
        <a class="btn btn-ghost" href="${esc(rel(depth, b.ghost[1]))}">${esc(b.ghost[0])}</a>
        <a class="btn btn-primary" href="${esc(rel(depth, b.primary[1]))}">${esc(b.primary[0])}</a>
      </div>
    </div>
  </div>
</section>
<script src="/film-keep.js?v=20260924play2"></script>
<script src="/studio-film.js?v=20260922fade2" defer></script>`;
}

function pageBody(page, lang) {
  const b = page[bodyLang(lang)];
  const depth = depthOf(page.slug);
  const menu = MENUS[page.section].find((m) => m.id === page.menu);
  const name = page.name || menu.name;
  const blocks = (b.blocks || [])
    .map((blk, i) => {
      const uid = `bsp${i}`;
      if (blk.type === "rows") return rowsBlock(blk, depth);
      if (blk.type === "list") {
        if (blk.items.every(([, d]) => !d)) return ucBlock(blk);
        return rowsBlock({ ...blk, items: blk.items.map(([t, d]) => [t, d, null]) }, depth);
      }
      if (blk.type === "products") return productsBlock({ ...blk, source: page.slug.replace(/\//g, "-") }, depth, lang, uid);
      if (blk.type === "process") return processBlock(lang);
      if (blk.type === "faq") return faqBlock(blk.items, uid);
      if (blk.type === "platforms") return platformsBlock(blk, depth, lang);
      if (blk.type === "form") return formBlock(lang, depth);
      throw new Error(`render-bsp: unknown block ${blk.type}`);
    })
    .join("\n");
  const top = page.film ? filmHero(page, b, depth) : `${crumbs(page.section, name, depth, page.parent)}
${hero(page.section, name, b, depth)}`;
  return `${top}
${blocks}
${sectionCards(page.section, lang, depth, page.menu)}
${ctaBlock(b.cta, depth)}`;
}

function jsonLd(page, lang) {
  const b = page[bodyLang(lang)];
  const url = `${SITE_ORIGIN}/${lang}/${page.slug}/`;
  const menu = MENUS[page.section].find((m) => m.id === page.menu);
  const name = page.name || menu.name;
  const main = {
    "@context": "https://schema.org",
    "@type": page.form ? "ContactPage" : "WebPage",
    name: b.title,
    description: b.desc,
    url,
    inLanguage: lang,
    publisher: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN },
  };
  const items = [
    { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${lang}/` },
    { "@type": "ListItem", position: 2, name: SECTION_NAME[page.section], item: `${SITE_ORIGIN}/${lang}/${page.section}/` },
  ];
  if (page.parent) items.push({ "@type": "ListItem", position: 3, name: page.parent[0], item: `${SITE_ORIGIN}/${lang}/${page.parent[1]}` });
  if (page.slug !== page.section) items.push({ "@type": "ListItem", position: items.length + 1, name, item: url });
  const crumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
  return `    <script type="application/ld+json">${JSON.stringify(main)}</script>
    <script type="application/ld+json">${JSON.stringify(crumb)}</script>`;
}

/* Platform partnership detail pages are generated from PLATFORM_PAGES. */
function platformPages() {
  return PLATFORMS.map((p) => {
    const mk = (lng) => {
      const d = PLATFORM_PAGES[p.id][lng];
      const L = PLATFORM_PAGE_LABELS[lng];
      return {
        title: L.title(p.name),
        desc: L.desc(p.name, d.intro),
        eyebrowName: p.name,
        markName: p.name,
        h1: L.h1(p.name),
        lead: d.intro,
        primary: [`${L.ask} →`, partnerAsk("platform", `partnerships-platform-${p.id}`)],
        ghost: [L.see(p.name), p.page],
        blocks: [
          {
            type: "list",
            id: "about",
            label: L.aboutLabel,
            items: [
              [L.intro, d.intro],
              [L.users, d.users],
              [L.value, d.value],
            ],
          },
          { type: "list", id: "areas", label: L.areas, lead: L.status, items: d.areas.map((a) => [a, ""]) },
          { type: "rows", id: "join", label: L.join, items: [[L.ask, L.joinText, partnerAsk("platform", `partnerships-platform-${p.id}`)]] },
          { type: "process" },
        ],
        cta: { label: p.name, title: L.ask, lead: L.joinText, btn: [`${L.ask} →`, partnerAsk("platform", `partnerships-platform-${p.id}`)] },
      };
    };
    return {
      section: "partnerships",
      slug: `partnerships/platforms/${p.id}`,
      menu: "platforms",
      name: p.name,
      parent: ["Platform Partnerships", "partnerships/platforms/"],
      ko: mk("ko"),
      en: mk("en"),
    };
  });
}

export const ALL_PAGES = [...PAGES, ...platformPages()];

/* ------------------------------------------------------------------------------------------------
 * Hubs (/business/, /studio/) — overview + menu rows + CTA, inside the existing hub pages.
 * ---------------------------------------------------------------------------------------------- */
export function bspHubHtml(section, lang) {
  const h = HUBS[section][bodyLang(lang)];
  const depth = 1;
  const title = esc(h.title).replace(/\n/g, "<br />");
  const menu = MENUS[section]
    .filter((m) => m.id !== "overview")
    .map((m) => [menuTitle(m, lang), m[bodyLang(lang)], m.href]);
  return `<section id="overview" class="bz-section bz-services bz-pillars-sec" aria-labelledby="bsp-hub-title">
    <div class="bz-inner">
      <header class="bz-sec-head">
        <div class="bz-sec-head__copy">
          <p class="bz-label">${esc(h.label)}</p>
          <h2 class="bz-title" id="bsp-hub-title">${title}</h2>
        </div>
        <p class="bz-lead bz-sec-head__lead">${esc(h.lead)}</p>
      </header>
    </div>
  </section>
<div class="bp-page">
<section class="bp-sec" aria-labelledby="bsp-facts-label">
  <div class="bp-inner">
    ${secHead(h.factsLabel, "", "bsp-facts")}
    ${rowsList(h.facts.map(([k, v]) => [k, v, null]), depth)}
  </div>
</section>
<section id="menu" class="bp-sec" aria-labelledby="bsp-menu-label">
  <div class="bp-inner">
    ${secHead(h.menuLabel, "", "bsp-menu")}
    ${rowsList(menu, depth)}
  </div>
</section>
${ctaBlock(h.cta, depth)}
</div>`;
}

export function bspHubFilmCtas(section, lang) {
  const h = HUBS[section][bodyLang(lang)];
  return { explore: h.filmCta, primary: h.filmCta2 };
}

/* ------------------------------------------------------------------------------------------------
 * Write
 * ---------------------------------------------------------------------------------------------- */
export function renderBspPages() {
  const template = fs.readFileSync(path.join(ROOT, "templates", "business-pillar.html"), "utf8");
  const en = loadJson("en.json");
  const flatEn = flatten(en);
  const written = [];
  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(dir === "en" ? en : fillMissing(loadJson(file), en));
    for (const page of ALL_PAGES) {
      const b = page[bodyLang(dir)];
      const depth = depthOf(page.slug);
      let html = template;
      html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
      html = html.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(dir));
      html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
      html = html.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/${page.slug}/`);
      html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(page.slug));
      html = html.replace(/\{\{JSON_LD\}\}/g, () => jsonLd(page, dir));
      html = html.replace(/\{\{SEO_TITLE\}\}/g, esc(b.title));
      html = html.replace(/\{\{META_DESCRIPTION\}\}/g, esc(b.desc));
      html = html.replace(/\{\{PILLAR_SLUG\}\}/g, page.slug.replace(/\//g, "-"));
      html = html.replace(/\{\{PAGE_BODY\}\}/g, () => pageBody(page, dir));
      // Body copy exists in ko and en; other locales show the English body — mark it for assistive tech.
      if (dir !== "ko" && dir !== "en") html = html.replace('<main id="bp-main"', '<main lang="en" id="bp-main"');
      html = injectSiteChrome(html, flat, flatEn, { activeNav: page.section, base: "../".repeat(depth) });
      const out = path.join(ROOT, dir, page.slug, "index.html");
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, html);
      written.push(path.join(dir, page.slug, "index.html"));
    }
  }
  // Root /<path>/ → preferred-language page, only for paths that did not exist before.
  for (const page of ALL_PAGES) {
    const rootIndex = path.join(ROOT, page.slug, "index.html");
    if (fs.existsSync(rootIndex) && !page.slug.startsWith("partnerships") && !NEW_ROOTS.has(page.slug)) continue;
    if (page.slug.startsWith("partnerships")) writePartnershipsRootRedirect(page.slug);
    else writeRootRedirect(page.slug);
    written.push(path.join(page.slug, "index.html"));
  }
  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const r of written) {
      const dest = path.join(pub, r);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(ROOT, r), dest);
    }
  }
  return written;
}

/**
 * Root /partnerships/… → /{preferred lang}/partnerships/…  Same stub as writeRootRedirect() but without
 * lang-nav.js: lang-nav only knows the older unprefixed sections and would send /partnerships/ to the home page.
 */
function writePartnershipsRootRedirect(slug) {
  const dir = path.join(ROOT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="refresh" content="0;url=/ko/${slug}/" />
<script>
(function(){
  var LANGS=["ko","en","ja","es","pt-br","fr","de","hi","id"];
  var pref="ko";
  try{var s=localStorage.getItem("newon-lang-dir");if(s&&LANGS.indexOf(s)!==-1)pref=s;}catch(e){}
  location.replace("/"+pref+"/${slug}/"+(location.search||"")+(location.hash||""));
})();
</script>
<title>Redirect</title>
</head>
<body><p><a href="/ko/${slug}/">Continue</a></p></body>
</html>`
  );
}

/** Root redirect stubs owned by this renderer (new URLs). */
const NEW_ROOTS = new Set(["business/digital-products", "business/platforms", "studio/design-systems"]);
export const BSP_SITEMAP_PATHS = ALL_PAGES.map((p) => p.slug);

if (import.meta.url === `file://${process.argv[1]}`) {
  const w = renderBspPages();
  console.log(`render-bsp: wrote ${w.length} files (${ALL_PAGES.length} pages × ${LANGS.length} locales + root redirects)`);
}
