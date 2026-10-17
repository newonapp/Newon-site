#!/usr/bin/env node
/**
 * PETLOG business website — /{lang}/petlog/{,platform/,business/,partnerships/,contact/} for all locales.
 *
 * Design: the existing LivOn Life Stage page (/lifestage/) — same shell, same #lifestage-detail.nls
 * components (film hero, roster, journey rail, flow/board/signal/index/dir/pipe lists, ink close) and the same
 * home-lifestage.css / home-lifestage-layout.css / home-lifestage.js. The PETLOG green is used only for the
 * small kicker labels and status tags (scoped .nls--petlog rules below). The Contact form is the shared Newon
 * inquiry form (render-bsp.mjs → business/inquiry.js → FormSubmit).
 * No app feature (records, booking, orders, payment, sign-in, seller sign-up, posting) is built on the web.
 * Copy: scripts/petlog-site-content.mjs (ko + en; other locales show the English body, like the rest of the site).
 */
import fs from "fs";
import path from "path";
import {
  ROOT,
  LANGS,
  OG_LOCALE,
  SITE_ORIGIN,
  loadJson,
  flatten,
  fillMissing,
  applyTemplate,
  hreflangBlock,
  ensureDir,
  escapeHtml,
  pick,
  fontLinksHtml,
} from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";
import { renderGlobalHeader, renderStudioFooter } from "./site-chrome.mjs";
import { inquiryFormHtml } from "./render-bsp.mjs";
import { STATUS, PETLOG_FILM, STORE, PETLOG_MENU, OVERVIEW, PLATFORM, BUSINESS, PARTNERS, CONTACT } from "./petlog-site-content.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20260924livon1";
const esc = escapeHtml;
const bl = (lang) => (lang === "ko" ? "ko" : "en");
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");
const pad2 = (n) => String(n).padStart(2, "0");
const rel = (depth, p) => (/^(https?:|mailto:|#|\/)/.test(p) ? p : "../".repeat(depth) + p);

/* PETLOG green (#278A53 brand; darker #1E6B41 for text contrast on white) — kicker labels and status tags only. */
const PETLOG_CSS = `<style>
  #lifestage-detail.nls--petlog .nls-kicker { color: #1e6b41; }
  #lifestage-detail.nls--petlog .nls-status { border-color: #278a53; color: #1e6b41; }
  #lifestage-detail.nls--petlog .nls-status[data-status="app"] { background: #278a53; border-color: #278a53; color: #fff; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-kicker,
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-status { color: #6fcf97; border-color: #6fcf97; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-status[data-status="app"] { background: #1e6b41; border-color: #1e6b41; color: #fff; }
  #lifestage-detail.nls--petlog .nls-link { display: inline-block; margin-top: 0.9rem; font-weight: 600; text-decoration: underline; text-underline-offset: 0.2em; color: inherit; }
  #lifestage-detail.nls--petlog .nls-board__item .nls-status { margin: 0 0 0.6rem; }
  /* the shared film fallback is the LIVON poster; PETLOG shows plain black until its film loads */
  #lifestage-detail.nls--petlog .nls-film__fallback { background: #050505; }
</style>`;

/* ---------------------------------------------------------------- shared blocks (Life Stage markup) */
function head(kicker, title, lead) {
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${esc(kicker)}</p>` : ""}
    <h2 class="nls-title">${nl(title)}</h2>
    ${lead ? `<p class="nls-lead">${esc(lead)}</p>` : ""}
  </header>`;
}
const chips = (items) => `<ul class="nls-chips">${(items || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
const status = (lang, s) => `<p class="nls-status" data-status="${esc(s)}">${esc(STATUS[bl(lang)][s])}</p>`;

function hero({ wordmark, titleHtml, lead, main, sub }) {
  return `<div class="nls-film" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${esc(PETLOG_FILM)}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${esc(PETLOG_FILM)}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark" lang="en">${esc(wordmark)}</p>
        <h1 id="story-lifestage-title" class="nls-film__slogan">${titleHtml}</h1>
        <p class="nls-film__lead">${esc(lead)}</p>
        <div class="nls-film__actions">
          <a class="nls-btn" href="${esc(main[1])}"${main[1].startsWith("#") ? " data-nls-scroll" : ""}>${esc(main[0])}</a>
          <a class="nls-btn nls-btn--ghost" href="${esc(sub[1])}">${esc(sub[0])}</a>
        </div>
      </div>
    </div>
  </div>`;
}

function rosterBlock(id, kicker, title, body) {
  const rows = body.map((p, i) => `<li><span>${pad2(i + 1)}</span><p>${esc(p)}</p></li>`).join("");
  return `<div id="${id}" class="nls-block nls-why-sec" data-hs-section>
    <div class="nls-split">
      ${head(kicker, title, "")}
      <ol class="nls-roster">${rows}</ol>
    </div>
  </div>`;
}

function indexBlock(id, kicker, title, lead, items, band = true) {
  const rows = items.map((t, i) => `<li><span>${pad2(i + 1)}</span><strong>${esc(t)}</strong></li>`).join("");
  return `<div id="${id}" class="nls-block${band ? " nls-block--band" : ""} nls-changes-sec" data-hs-section>
    ${head(kicker, title, lead)}
    <ol class="nls-index">${rows}</ol>
  </div>`;
}

/** Board cards: { n, name, label?, lead, status?, points?: [k, v][], topics?, link?: [label, href] } */
function boardBlock(id, kicker, title, lead, note, cards, lang, depth) {
  const items = cards
    .map(
      (c) => `<article class="nls-board__item" id="${esc(c.anchor || "")}">
        <div class="nls-board__meta">
          <span class="nls-board__n">${esc(c.n)}${c.label ? ` · <span lang="en">${esc(c.label)}</span>` : ""}</span>
        </div>
        ${c.status ? status(lang, c.status) : ""}
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.lead)}</p>
        ${c.points ? `<ul class="nls-points">${c.points.filter(([, v]) => v && v !== "—").map(([k, v]) => `<li><strong>${esc(k)}</strong> · ${esc(v)}</li>`).join("")}</ul>` : ""}
        ${c.topics ? chips(c.topics) : ""}
        ${c.link ? `<a class="nls-link" href="${esc(rel(depth, c.link[1]))}"${/^https?:/.test(c.link[1]) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(c.link[0])} →</a>` : ""}
      </article>`
    )
    .join("")
    .replace(/ id=""/g, "");
  return `<div id="${id}" class="nls-block nls-first-sec" data-hs-section>
    ${head(kicker, title, lead)}
    ${note ? `<p class="nls-note">${esc(note)}</p>` : ""}
    <div class="nls-board">${items}</div>
  </div>`;
}

function flowBlock(id, kicker, title, lead, items) {
  const cards = items.map((it) => `<article class="nls-flow__item"><span class="nls-flow__n">${esc(it.n)}</span><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`).join("");
  return `<div id="${id}" class="nls-block nls-pillars-sec" data-hs-section>
    ${head(kicker, title, lead)}
    <div class="nls-flow">${cards}</div>
  </div>`;
}

function signalBlock(id, kicker, title, lead, items, extra = "") {
  const cards = items
    .map((it) => `<article class="nls-signal__item"><span class="nls-signal__n">${esc(it.n)}</span><div class="nls-signal__copy"><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></div></article>`)
    .join("");
  return `<div id="${id}" class="nls-block nls-block--band nls-areas-sec" data-hs-section>
    ${head(kicker, title, lead)}
    <div class="nls-signal">${cards}</div>
    ${extra}
  </div>`;
}

function dirBlock(id, kicker, title, lead, items, depth) {
  const rows = items
    .map((s) => `<li><span>${esc(s.n)}</span><div><strong>${s.href ? `<a href="${esc(rel(depth, s.href))}">${esc(s.name)}</a>` : esc(s.name)}</strong><p>${esc(s.body)}</p></div></li>`)
    .join("");
  return `<div id="${id}" class="nls-block nls-related-sec" data-hs-section>
    <div class="nls-split">
      <div>${head(kicker, title, lead)}</div>
      <ol class="nls-dir">${rows}</ol>
    </div>
  </div>`;
}

function pipeBlock(id, kicker, title, note, steps) {
  const items = steps.map(([t, d], i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}"><p class="nls-pipe__n">${pad2(i + 1)}</p><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join("");
  return `<div id="${id}" class="nls-block nls-how-sec" data-hs-section>
    ${head(kicker, title, "")}
    <p class="nls-note">${esc(note)}</p>
    <div class="nls-pipe">${items}</div>
  </div>`;
}

function journeyBlock(j) {
  const rail = j.items
    .map((it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${esc(it.id)}" aria-pressed="${i === 0}"><em>${esc(it.n)}</em><span>${esc(it.age)}</span></button>`)
    .join("");
  const cards = j.items
    .map(
      (it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${esc(it.id)}" data-scene="${esc(it.id)}">
        <div class="nls-decade__mark" aria-hidden="true"><b>${esc(it.age)}</b><em>${esc(it.n)}</em></div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${esc(it.n)}</p>
          <p class="nls-decade__age" lang="en">${esc(it.age)}</p>
          <h3>${esc(it.name)}</h3>
          <p class="nls-decade__lead">${esc(it.lead)}</p>
          ${chips(it.topics)}
        </div>
      </article>`
    )
    .join("");
  return `<div id="nls-journey" class="nls-block nls-block--band nls-journey-sec" data-hs-section>
    ${head(j.kicker, j.title, j.lead)}
    <div class="nls-rail" role="group" aria-label="${esc(j.kicker)}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    <p class="nls-note">${esc(j.note)}</p>
  </div>`;
}

function menuBlock(lang, depth, active) {
  const items = PETLOG_MENU.map((m) => ({ n: m.n, name: `${m.name} · ${m[bl(lang)]}`, href: m.href, on: m.id === active }));
  const label = lang === "ko" ? "PETLOG 메뉴" : "PETLOG MENU";
  const rows = items
    .map((s) => `<li><span>${esc(s.n)}</span><div><strong><a href="${esc(rel(depth, s.href))}"${s.on ? ' aria-current="page"' : ""}>${esc(s.name)}${s.on ? " ·" : ""}</a></strong></div></li>`)
    .join("");
  return `<div id="nls-petlog-menu" class="nls-block nls-related-sec" data-hs-section>
    <div class="nls-split">
      <div>${head("PETLOG", label, "")}</div>
      <nav aria-label="${esc(label)}"><ol class="nls-dir">${rows}</ol></nav>
    </div>
  </div>`;
}

function closeBlock(c, depth) {
  return `<div id="nls-close" class="nls-block nls-close nls-block--ink" data-hs-section>
    <p class="nls-kicker">${esc(c.kicker)}</p>
    <h2 class="nls-hero__title">${c.titleHtml}</h2>
    <p class="nls-lead">${esc(c.lead)}</p>
    <div class="nls-actions">
      <a class="nls-btn" href="${esc(rel(depth, c.main[1]))}">${esc(c.main[0])} →</a>
      <a class="nls-btn nls-btn--ghost" href="${esc(c.sub[1].startsWith("http") ? c.sub[1] : rel(depth, c.sub[1]))}"${c.sub[1].startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(c.sub[0])}</a>
    </div>
  </div>`;
}

const wrap = (inner) => `<section id="lifestage-detail" class="nls nls--petlog" data-story="petlog" aria-labelledby="story-lifestage-title">${inner}</section>`;

/* ---------------------------------------------------------------- pages */
const CONTACT_HREF = (type) => `petlog/contact/?type=${type}#inquiry`;

function overviewPage(lang) {
  const c = OVERVIEW[bl(lang)];
  const D = 1;
  return wrap(`${hero({ wordmark: "PETLOG", titleHtml: c.heroTitle, lead: c.heroLead, main: [`${c.ctaMain} →`, "#nls-vision"], sub: [c.ctaSub, rel(D, "petlog/contact/")] })}
  <div class="nls__wrap">
    <p class="nls-note">${esc(c.statusNote)}</p>
    ${rosterBlock("nls-vision", c.vision.kicker, c.vision.title, c.vision.body)}
    ${journeyBlock(c.journey)}
    ${flowBlock("nls-connect", c.connect.kicker, c.connect.title, c.connect.lead, c.connect.items)}
    ${boardBlock("nls-ecosystem", c.ecosystem.kicker, c.ecosystem.title, c.ecosystem.lead, "", c.ecosystem.items, lang, D)}
    ${signalBlock("nls-business", c.biz.kicker, c.biz.title, c.biz.lead, c.biz.items, `<p class="nls-note"><a class="nls-link" href="${rel(D, "petlog/business/")}">${esc(c.biz.cta)} →</a></p>`)}
    ${dirBlock("nls-newon", c.newon.kicker, c.newon.title, c.newon.lead, c.newon.items, D)}
    ${menuBlock(lang, D, "overview")}
    ${closeBlock({ ...c.close, main: [c.close.ctaMain, "petlog/contact/"], sub: [c.close.ctaSub, STORE.ios] }, D)}
  </div>`);
}

function platformPage(lang) {
  const m = PLATFORM.meta[bl(lang)];
  const D = 2;
  const cards = PLATFORM.items.map((it, i) => {
    const link =
      it.href === "app" ? [m.appCta, STORE.ios] : it.href === "partnerships" ? [m.cta, "petlog/partnerships/"] : [m.cta, CONTACT_HREF(i < 6 ? "app-support" : i < 7 ? "shopping" : i < 8 ? "shopping" : i < 9 ? "group-buying" : i < 10 ? "booking-provider" : i < 13 ? "content" : "public")];
    return { n: pad2(i + 1), label: it.label, name: it.t[bl(lang)], lead: it.lead[bl(lang)], status: it.status, topics: it.f[bl(lang)], link, anchor: it.label.toLowerCase().replace(/[^a-z]+/g, "-") };
  });
  return wrap(`${hero({ wordmark: "Platform", titleHtml: m.heroTitle, lead: m.heroLead, main: [`${m.listTitle} ↓`, "#nls-platform-list"], sub: [lang === "ko" ? "PETLOG 소개" : "About PETLOG", rel(D, "petlog/")] })}
  <div class="nls__wrap">
    ${boardBlock("nls-platform-list", m.kicker, m.listTitle, m.listLead, "", cards, lang, D)}
    ${menuBlock(lang, D, "platform")}
    ${closeBlock({ ...OVERVIEW[bl(lang)].close, main: [OVERVIEW[bl(lang)].close.ctaMain, "petlog/contact/"], sub: [OVERVIEW[bl(lang)].close.ctaSub, STORE.ios] }, D)}
  </div>`);
}

function businessPage(lang) {
  const m = BUSINESS.meta[bl(lang)];
  const D = 2;
  const k = bl(lang) === "ko";
  const cats = BUSINESS.categories.map(([en, ko, enLabel]) => (k ? `${en} · ${ko}` : `${en}`));
  const units = BUSINESS.units.map((u, i) => {
    const [koN, enN, koO, enO, koC, enC, koV, enV, koR, enR, koP, enP, st] = u;
    return {
      n: pad2(i + 1),
      name: k ? koN : enN,
      lead: k ? koO : enO,
      status: st,
      points: [
        [m.labels.customers, k ? koC : enC],
        [m.labels.value, k ? koV : enV],
        [m.labels.revenue, k ? koR : enR],
        [m.labels.partners, k ? koP : enP],
      ],
      link: [m.cta, CONTACT_HREF(i === 14 ? "saas" : i === 15 ? "global" : i === 11 ? "public" : i === 4 ? "group-buying" : i === 5 ? "booking-provider" : i === 2 || i === 3 ? "shopping" : "brand")],
    };
  });
  return wrap(`${hero({ wordmark: "Business", titleHtml: m.heroTitle, lead: m.heroLead, main: [`${m.unitTitle} ↓`, "#nls-units"], sub: [m.cta, rel(D, "petlog/contact/")] })}
  <div class="nls__wrap">
    ${indexBlock("nls-categories", m.catKicker, m.catTitle, "", cats)}
    ${boardBlock("nls-units", m.unitKicker, m.unitTitle, m.unitLead, "", units, lang, D)}
    ${rosterBlock("nls-shareon", m.shareon.kicker, m.shareon.title, m.shareon.body)}
    ${indexBlock("nls-trust", m.trust.kicker, m.trust.title, "", m.trust.items)}
    ${menuBlock(lang, D, "business")}
    ${closeBlock({ ...OVERVIEW[bl(lang)].close, main: [m.cta, "petlog/contact/"], sub: [lang === "ko" ? "파트너십 보기" : "See partnerships", "petlog/partnerships/"] }, D)}
  </div>`);
}

function partnershipsPage(lang) {
  const m = PARTNERS.meta[bl(lang)];
  const D = 2;
  const k = bl(lang) === "ko";
  const types = ["booking-provider", "booking-provider", "booking-provider", "booking-provider", "content", "booking-provider", "brand", "shopping", "content", "global", "public", "global"];
  const cards = PARTNERS.items.map((p, i) => {
    const [koN, enN, koW, enW, koV, enV, koH, enH, koR, enR, koT, enT] = p;
    return {
      n: pad2(i + 1),
      name: k ? koN : enN,
      lead: k ? koV : enV,
      points: [
        [m.labels.who, k ? koW : enW],
        [m.labels.how, k ? koH : enH],
        [m.labels.revenue, k ? koR : enR],
        [m.labels.terms, k ? koT : enT],
      ],
      link: [m.cta, CONTACT_HREF(types[i])],
    };
  });
  return wrap(`${hero({ wordmark: "Partnerships", titleHtml: m.heroTitle, lead: m.heroLead, main: [`${m.listTitle} ↓`, "#nls-partners"], sub: [m.cta, rel(D, "petlog/contact/")] })}
  <div class="nls__wrap">
    ${boardBlock("nls-partners", m.kicker, m.listTitle, "", "", cards, lang, D)}
    ${pipeBlock("nls-process", m.processKicker, m.processTitle, m.processNote, m.steps)}
    ${menuBlock(lang, D, "partnerships")}
    ${closeBlock({ ...OVERVIEW[bl(lang)].close, main: [m.cta, "petlog/contact/"], sub: [lang === "ko" ? "Newon 파트너십 전체 보기" : "All Newon partnerships", "partnerships/"] }, D)}
  </div>`);
}

function contactPage(lang) {
  const c = CONTACT[bl(lang)];
  const D = 2;
  const items = c.types.map(([key, name, body], i) => ({ n: pad2(i + 1), name, body, href: `petlog/contact/?type=${key}#inquiry` }));
  const form = inquiryFormHtml(lang, D, {
    category: "PETLOG",
    interest: "PETLOG",
    copy: { label: "PETLOG", title: c.formTitle, subject: c.subject, types: c.types.map(([k, n]) => [k, n]), type: c.typeLabel, message: c.messageLabel, messagePh: c.messagePh },
  });
  return wrap(`${hero({ wordmark: "Contact", titleHtml: c.heroTitle, lead: c.heroLead, main: [lang === "ko" ? "문의하기 ↓" : "Send an inquiry ↓", "#inquiry"], sub: [lang === "ko" ? "PETLOG 소개" : "About PETLOG", rel(D, "petlog/")] })}
  <div class="nls__wrap">
    ${dirBlock("nls-types", c.kicker, c.listTitle, "", items, D)}
  </div>
  <div class="bp-page">${form}</div>
  <div class="nls__wrap">
    ${menuBlock(lang, D, "contact")}
  </div>`);
}

const PAGES = [
  { slug: "petlog", render: overviewPage, seo: (l) => OVERVIEW[bl(l)] },
  { slug: "petlog/platform", render: platformPage, seo: (l) => PLATFORM.meta[bl(l)] },
  { slug: "petlog/business", render: businessPage, seo: (l) => BUSINESS.meta[bl(l)] },
  { slug: "petlog/partnerships", render: partnershipsPage, seo: (l) => PARTNERS.meta[bl(l)] },
  { slug: "petlog/contact", render: contactPage, seo: (l) => CONTACT[bl(l)], contact: true },
];
export const PETLOG_SITE_PATHS = PAGES.map((p) => p.slug);

function jsonLd(page, lang, seo) {
  const url = `${SITE_ORIGIN}/${lang}/${page.slug}/`;
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${lang}/` },
    { "@type": "ListItem", position: 2, name: "PETLOG", item: `${SITE_ORIGIN}/${lang}/petlog/` },
  ];
  if (page.slug !== "petlog") crumbs.push({ "@type": "ListItem", position: 3, name: page.slug.split("/")[1].replace(/^./, (c) => c.toUpperCase()), item: url });
  const main =
    page.slug === "petlog"
      ? {
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          name: "PETLOG",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "iOS, Android",
          url,
          description: seo.desc,
          publisher: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN },
          sameAs: [STORE.ios, STORE.android],
        }
      : { "@context": "https://schema.org", "@type": page.contact ? "ContactPage" : "WebPage", name: seo.title, description: seo.desc, url, inLanguage: lang };
  return `    <script type="application/ld+json">${JSON.stringify(main)}</script>
    <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs })}</script>`;
}

/** Root /petlog/… → preferred-language page (lang-nav.js does not know /petlog/, so it is not loaded here). */
function writeRootStub(slug) {
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

export function renderPetlogSite() {
  const en = loadJson("en.json");
  const flatEn = flatten(en);
  let n = 0;
  for (const lang of LANGS) {
    const flat = flatten(lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en));
    for (const page of PAGES) {
      const depth = page.slug.split("/").length;
      const seo = page.seo(lang.dir);
      const header = renderGlobalHeader(flat, flatEn, { activeNav: "petlog", base: "../".repeat(depth), idSuffix: "hub" });
      const footer = renderStudioFooter(flat, flatEn, { base: "../".repeat(depth) });
      let main = page.render(lang.dir);
      if (lang.dir !== "ko" && lang.dir !== "en") main = main.replace('<section id="lifestage-detail"', '<section lang="en" id="lifestage-detail"');
      let html = applyTemplate(SHELL, flat, flatEn, {
        HTML_LANG: lang.htmlLang,
        LANG_DIR: lang.dir,
        FONT_LINKS: fontLinksHtml(lang.dir),
        TITLE: esc(seo.title),
        META_DESCRIPTION: esc(clampSeoDescription(seo.desc, 160)),
        CANONICAL: `${SITE_ORIGIN}/${lang.dir}/${page.slug}/`,
        OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
        HREFLANG_BLOCK: `${hreflangBlock(page.slug)}\n${jsonLd(page, lang.dir, seo)}`,
        SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
        CHROME_HEADER: header,
        MAIN_CONTENT: main,
        CHROME_FOOTER: footer,
        EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />${page.contact ? `\n    <link rel="stylesheet" href="/business-pillar.css?v=20260923pad1" />` : ""}
    ${PETLOG_CSS}`,
        EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260924play2"></script>
    <script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
      });
      const out = path.join(ROOT, lang.dir, page.slug, "index.html");
      ensureDir(out);
      fs.writeFileSync(out, html);
      n++;
    }
  }
  for (const page of PAGES) writeRootStub(page.slug);
  return n;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = renderPetlogSite();
  console.log(`render-petlog-site: wrote ${n} pages + ${PAGES.length} root redirects`);
}
