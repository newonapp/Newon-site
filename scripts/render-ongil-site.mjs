#!/usr/bin/env node
/**
 * ONGIL corporate website — five pages for KO and EN:
 *   /{ko,en}/ongil/               01 Overview      (replaces the earlier single ONGIL introduction for these two locales)
 *   /{ko,en}/ongil/platform/      02 Platform      (18 areas)
 *   /{ko,en}/ongil/business/      03 Business      (20 business groups in 8 categories)
 *   /{ko,en}/ongil/partnerships/  04 Partnerships  (14 partner types)
 *   /{ko,en}/ongil/contact/       05 Contact       (13 inquiry types → the existing Newon email / business inquiry form)
 *
 * Runs AFTER render-ongil.mjs (build-i18n.mjs). The other seven locales keep the existing localized ONGIL page that
 * render-ongil.mjs writes; they are not touched here. Common header/footer come from site-chrome.mjs unchanged.
 * Business introduction only: no sign-in, booking, payment, CRM or new inquiry backend.
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
import { renderStudioHeader, renderStudioFooter } from "./site-chrome.mjs";
import { KO, STATUS_KO } from "./ongil-site-ko.mjs";
import { EN, STATUS_EN } from "./ongil-site-en.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
export const OGS_VER = "20261018ogs1";
export const SITE_LANGS = ["ko", "en"];
export const PAGES = ["overview", "platform", "business", "partnerships", "contact"];
const CONTENT = { ko: { c: KO, s: STATUS_KO }, en: { c: EN, s: STATUS_EN } };

const e = escapeHtml;
const nl = (s) => e(s || "").replace(/\n/g, "<br>");
const pad = (i) => String(i).padStart(2, "0");

function pagePath(lang, page) {
  return page === "overview" ? `/${lang}/ongil/` : `/${lang}/ongil/${page}/`;
}
function rel(lang, p) {
  // content links: "contact/" → ONGIL page, "lifestage/" etc → site page, "/x" absolute
  if (!p) return `/${lang}/ongil/`;
  if (p.startsWith("/") || /^https?:|^mailto:/.test(p)) return p;
  if (["platform/", "business/", "partnerships/", "contact/"].includes(p)) return `/${lang}/ongil/${p}`;
  return `/${lang}/${p}`;
}

/* ───────── shared pieces ───────── */

function statusBadge(S, key) {
  const st = S[key] || S.plan;
  return `<span class="ogs-status ogs-status--${e(st.tone)}"><i aria-hidden="true"></i>${e(st.label)}</span>`;
}

function subnav(c, lang, active) {
  const items = c.ui.nav
    .map((n) => {
      const cur = n.id === active ? ' aria-current="page"' : "";
      const sub = c.lang === "ko" ? `<span class="ogs-subnav__ko">${e(n.ko)}</span>` : "";
      return `<li><a class="ogs-subnav__a" href="${pagePath(lang, n.id)}"${cur}><span class="ogs-subnav__n">${e(n.n)}</span><span class="ogs-subnav__en">${e(n.label)}</span>${sub}</a></li>`;
    })
    .join("");
  return `<nav class="ogs-subnav" aria-label="${e(c.ui.navLabel)}">
    <div class="ogs-wrap ogs-subnav__in">
      <a class="ogs-subnav__brand" href="${pagePath(lang, "overview")}"><span>ONGIL</span><em>${e(c.brandKo)}</em></a>
      <ol class="ogs-subnav__list">${items}</ol>
    </div>
  </nav>`;
}

function pageHero(h, { n = "", label = "", actions = "" } = {}) {
  return `<header class="ogs-hero">
    <div class="ogs-wrap">
      <p class="ogs-kicker">${n ? `<span class="ogs-kicker__n">${e(n)}</span>` : ""}${e(h.kicker || label)}</p>
      <h1 class="ogs-hero__title">${h.titleHtml}</h1>
      ${h.lead || h.body ? `<p class="ogs-hero__lead">${e(h.lead || h.body)}</p>` : ""}
      ${actions}
    </div>
  </header>`;
}

function secHead(n, label, title, lead) {
  return `<div class="ogs-sechead">
      <p class="ogs-label"><span class="ogs-label__n">${e(n)}</span><span class="ogs-label__t">${e(label)}</span></p>
      <h2 class="ogs-title">${nl(title)}</h2>
      ${lead ? `<p class="ogs-lead">${e(lead)}</p>` : ""}
    </div>`;
}

function notesFoot(c) {
  return `<aside class="ogs-foot" aria-label="${c.lang === "ko" ? "안내" : "Notes"}">
    <div class="ogs-wrap">
      <p>${e(c.appNote)}</p>
      <p>${e(c.safetyNote)}</p>
    </div>
  </aside>`;
}

function statusLegend(c, S) {
  const rows = ["web", "partial", "prep", "plan"]
    .map((k) => `<li>${statusBadge(S, k)}<span class="ogs-legend__note">${e(S[k].note)}</span></li>`)
    .join("");
  return `<div class="ogs-legend"><p class="ogs-legend__t">${e(c.ui.statusLegendTitle)}</p><ul>${rows}</ul></div>`;
}

function ctaLink(c, lang, key) {
  if (key === "start") return `<a class="ogs-btn ogs-btn--line" href="${c.ui.startHref}">${e(c.ui.start)} →</a>`;
  if (key === "partners") return `<a class="ogs-btn ogs-btn--line" href="${pagePath(lang, "partnerships")}">${e(c.ui.propose)} →</a>`;
  return `<a class="ogs-btn ogs-btn--line" href="${pagePath(lang, "contact")}">${e(c.ui.inquiry)} →</a>`;
}

function list(items, cls = "ogs-list") {
  return `<ul class="${cls}">${(items || []).map((t) => `<li>${e(t)}</li>`).join("")}</ul>`;
}

/* ───────── 01 Overview ───────── */

function overviewMain(c, S, lang) {
  const o = c.overview;
  const h = o.hero;
  const facts = h.facts.map((f) => `<li><span>${e(f.k)}</span><strong>${e(f.v)}</strong></li>`).join("");
  const hero = `<header class="ogs-hero ogs-hero--overview" id="ogs-hero">
    <div class="ogs-wrap">
      <p class="ogs-kicker"><span class="ogs-kicker__n">${e(h.n)}</span>${e(h.kicker)}</p>
      <h1 class="ogs-hero__title">${h.titleHtml}</h1>
      <p class="ogs-hero__lead">${e(h.body)}</p>
      <div class="ogs-actions">
        <a class="ogs-btn" href="${pagePath(lang, "platform")}">${e(h.ctaMain)} →</a>
        <a class="ogs-btn ogs-btn--ghost" href="${c.ui.startHref}">${e(h.ctaSub)}</a>
      </div>
      <ul class="ogs-facts">${facts}</ul>
    </div>
  </header>`;

  const vision = `<section class="ogs-sec" id="ogs-vision" aria-labelledby="ogs-vision-t">
    <div class="ogs-wrap">
      ${secHead(o.vision.n, o.vision.label, o.vision.title, o.vision.lead).replace('class="ogs-title"', 'class="ogs-title" id="ogs-vision-t"')}
      <ol class="ogs-values">${o.vision.values
        .map((v, i) => `<li><span class="ogs-values__n">${pad(i + 1)}</span><p class="ogs-values__en">${e(v.en)}</p>${c.lang === "ko" ? `<p class="ogs-values__ko">${e(v.ko)}</p>` : ""}<p class="ogs-values__t">${e(v.text)}</p></li>`)
        .join("")}</ol>
    </div>
  </section>`;

  const journey = `<section class="ogs-sec" id="ogs-journey">
    <div class="ogs-wrap">
      ${secHead(o.journey.n, o.journey.label, o.journey.title, o.journey.lead)}
      <ol class="ogs-steps">${o.journey.steps.map((s) => `<li><span class="ogs-steps__n">${e(s.n)}</span><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`).join("")}</ol>
    </div>
  </section>`;

  const who = `<section class="ogs-sec" id="ogs-who">
    <div class="ogs-wrap">
      ${secHead(o.who.n, o.who.label, o.who.title, "")}
      <ol class="ogs-grid ogs-grid--3">${o.who.items.map((s) => `<li class="ogs-cell"><span class="ogs-cell__n">${e(s.n)}</span><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`).join("")}</ol>
    </div>
  </section>`;

  const support = `<section class="ogs-sec" id="ogs-support">
    <div class="ogs-wrap">
      ${secHead(o.support.n, o.support.label, o.support.title, "")}
      <ol class="ogs-grid ogs-grid--3">${o.support.items
        .map((s) => `<li class="ogs-cell"><span class="ogs-cell__n">${e(s.n)}</span><h3>${e(s.name)}</h3><p>${e(s.text)}</p>${statusBadge(S, s.status)}</li>`)
        .join("")}</ol>
      ${statusLegend(c, S)}
    </div>
  </section>`;

  const family = `<section class="ogs-sec ogs-sec--tint" id="ogs-family">
    <div class="ogs-wrap ogs-split">
      ${secHead(o.family.n, o.family.label, o.family.title, o.family.lead)}
      <div>
        <ol class="ogs-roster">${o.family.points.map((p, i) => `<li><span>${pad(i + 1)}</span><p>${e(p)}</p></li>`).join("")}</ol>
        <p class="ogs-statusline">${statusBadge(S, o.family.status)} <span>${e(o.family.statusText)}</span></p>
      </div>
    </div>
  </section>`;

  const eco = `<section class="ogs-sec" id="ogs-ecosystem">
    <div class="ogs-wrap">
      ${secHead(o.ecosystem.n, o.ecosystem.label, o.ecosystem.title, o.ecosystem.lead)}
      <ol class="ogs-flow">${o.ecosystem.layers.map((s) => `<li><span class="ogs-flow__n">${e(s.n)}</span><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`).join("")}</ol>
      <p class="ogs-note">${e(o.ecosystem.note)}</p>
    </div>
  </section>`;

  const newon = `<section class="ogs-sec" id="ogs-newon">
    <div class="ogs-wrap">
      ${secHead(o.newon.n, o.newon.label, o.newon.title, o.newon.lead)}
      <ol class="ogs-links">${o.newon.items
        .map((s) => `<li><a href="${rel(lang, s.href)}"><span class="ogs-links__n">${e(s.n)}</span><span class="ogs-links__name">${e(s.name)}</span><span class="ogs-links__t">${e(s.text)}</span><span class="ogs-links__arrow" aria-hidden="true">→</span></a></li>`)
        .join("")}</ol>
    </div>
  </section>`;

  const next = `<section class="ogs-sec ogs-sec--close" id="ogs-next">
    <div class="ogs-wrap">
      ${secHead(o.next.n, o.next.label, o.next.title, "")}
      <ol class="ogs-grid ogs-grid--3">${o.next.items
        .map((s) => `<li class="ogs-cell"><p class="ogs-cell__k">${e(s.k)}</p><p>${e(s.text)}</p><a class="ogs-btn" href="${rel(lang, s.href)}">${e(s.cta)} →</a></li>`)
        .join("")}</ol>
    </div>
  </section>`;

  return [hero, vision, journey, who, support, family, eco, newon, next].join("\n");
}

/* ───────── 02 Platform ───────── */

function platformMain(c, S, lang) {
  const p = c.platform;
  const idx = p.sections
    .map((s, i) => `<li><a href="#p-${e(s.id)}"><span>${pad(i + 1)}</span>${e(s.label)}<em>${e(s.title)}</em></a></li>`)
    .join("");
  const secs = p.sections
    .map(
      (s, i) => `<article class="ogs-item" id="p-${e(s.id)}" aria-labelledby="p-${e(s.id)}-t">
      <div class="ogs-item__head">
        <p class="ogs-label"><span class="ogs-label__n">${pad(i + 1)}</span><span class="ogs-label__t">${e(s.label)}</span></p>
        <h2 class="ogs-item__title" id="p-${e(s.id)}-t">${e(s.title)}</h2>
        <p class="ogs-item__desc">${e(s.desc)}</p>
      </div>
      <div class="ogs-item__body">
        <p class="ogs-dt">${e(c.ui.services)}</p>
        ${list(s.services)}
        <dl class="ogs-dl">
          <div><dt>${e(c.ui.audience)}</dt><dd>${e(s.audience)}</dd></div>
          <div><dt>${e(c.ui.status)}</dt><dd>${statusBadge(S, s.status)}</dd></div>
        </dl>
        ${s.note ? `<p class="ogs-note">${e(s.note)}</p>` : ""}
        <div class="ogs-item__cta">${ctaLink(c, lang, s.cta)}<a class="ogs-top" href="#ogs-index">${e(c.ui.back)} ↑</a></div>
      </div>
    </article>`
    )
    .join("");
  return `${pageHero(p.hero, { n: "02" })}
  <section class="ogs-sec ogs-sec--index" id="ogs-index" aria-label="${e(c.ui.onThisPage)}">
    <div class="ogs-wrap">
      <p class="ogs-dt">${e(c.ui.onThisPage)} · 18</p>
      <ol class="ogs-index">${idx}</ol>
      ${statusLegend(c, S)}
    </div>
  </section>
  <div class="ogs-wrap ogs-items">${secs}</div>`;
}

/* ───────── 03 Business ───────── */

function businessMain(c, S, lang) {
  const b = c.business;
  const byCat = Object.fromEntries(b.categories.map((k) => [k.id, []]));
  b.groups.forEach((g, i) => byCat[g.cat].push(i));
  const catIdx = b.categories
    .map(
      (k) => `<li><p class="ogs-cats__en">${e(k.en)}</p>${c.lang === "ko" ? `<p class="ogs-cats__ko">${e(k.ko)}</p>` : ""}
        <ul>${byCat[k.id].map((i) => `<li><a href="#b-${pad(i + 1)}"><span>${pad(i + 1)}</span>${e(b.groups[i].name)}</a></li>`).join("")}</ul></li>`
    )
    .join("");
  const catName = Object.fromEntries(b.categories.map((k) => [k.id, k.en]));
  const groups = b.groups
    .map(
      (g, i) => `<article class="ogs-item" id="b-${pad(i + 1)}" aria-labelledby="b-${pad(i + 1)}-t">
      <div class="ogs-item__head">
        <p class="ogs-label"><span class="ogs-label__n">${pad(i + 1)}</span><span class="ogs-label__t">${e(catName[g.cat])}</span></p>
        <h2 class="ogs-item__title" id="b-${pad(i + 1)}-t">${e(g.name)}</h2>
        <p class="ogs-item__desc">${e(g.intro)}</p>
      </div>
      <div class="ogs-item__body">
        <dl class="ogs-dl ogs-dl--rows">
          <div><dt>${e(c.ui.audience)}</dt><dd>${e(g.audience)}</dd></div>
          <div><dt>${e(c.ui.value)}</dt><dd>${e(g.value)}</dd></div>
          <div><dt>${e(c.ui.partners)}</dt><dd>${e(g.partners)}</dd></div>
          <div><dt>${e(c.ui.revenue)}</dt><dd>${e(g.revenue)}</dd></div>
          <div><dt>${e(c.ui.regulation)}</dt><dd>${e(g.regulation)}</dd></div>
          <div><dt>${e(c.ui.status)}</dt><dd>${statusBadge(S, g.status)}</dd></div>
        </dl>
        <div class="ogs-item__cta">${ctaLink(c, lang, g.cta)}<a class="ogs-top" href="#ogs-index">${e(c.ui.back)} ↑</a></div>
      </div>
    </article>`
    )
    .join("");
  return `${pageHero(b.hero, { n: "03" })}
  <section class="ogs-sec ogs-sec--index" id="ogs-index" aria-label="${e(c.ui.onThisPage)}">
    <div class="ogs-wrap">
      <p class="ogs-dt">${e(c.ui.category)} · 8 / 20</p>
      <ol class="ogs-cats">${catIdx}</ol>
    </div>
  </section>
  <section class="ogs-sec ogs-sec--tint" id="ogs-revenue" aria-labelledby="ogs-revenue-t">
    <div class="ogs-wrap ogs-split">
      <div class="ogs-sechead">
        <p class="ogs-label"><span class="ogs-label__t">Revenue Model</span></p>
        <h2 class="ogs-title" id="ogs-revenue-t">${e(b.revenueTitle)}</h2>
        <p class="ogs-lead">${e(b.disclaimer)}</p>
      </div>
      <div>
        <ol class="ogs-roster">${b.revenue.map((r, i) => `<li><span>${pad(i + 1)}</span><p>${e(r)}</p></li>`).join("")}</ol>
        <p class="ogs-note">${e(b.revenueNote)}</p>
      </div>
    </div>
  </section>
  <div class="ogs-wrap ogs-items">${groups}</div>`;
}

/* ───────── 04 Partnerships ───────── */

function partnershipsMain(c, S, lang) {
  const p = c.partnerships;
  const proc = p.process.map((s) => `<li><span class="ogs-flow__n">${e(s.n)}</span><h3>${e(s.name)}</h3><p>${e(s.text)}</p></li>`).join("");
  const items = p.items
    .map(
      (it, i) => `<article class="ogs-item" id="pt-${pad(i + 1)}" aria-labelledby="pt-${pad(i + 1)}-t">
      <div class="ogs-item__head">
        <p class="ogs-label"><span class="ogs-label__n">${pad(i + 1)}</span><span class="ogs-label__t">Partner</span></p>
        <h2 class="ogs-item__title" id="pt-${pad(i + 1)}-t">${e(it.name)}</h2>
      </div>
      <div class="ogs-item__body">
        <dl class="ogs-dl ogs-dl--rows">
          <div><dt>${e(c.ui.target)}</dt><dd>${e(it.name)}</dd></div>
          <div><dt>${e(c.ui.field)}</dt><dd>${e(it.field)}</dd></div>
          <div><dt>${e(c.ui.value)}</dt><dd>${e(it.value)}</dd></div>
          <div><dt>${e(c.ui.structure)}</dt><dd>${e(it.structure)}</dd></div>
          <div><dt>${e(c.ui.conditions)}</dt><dd>${e(it.conditions)}</dd></div>
        </dl>
        <div class="ogs-item__cta"><a class="ogs-btn ogs-btn--line" href="${pagePath(lang, "contact")}#ogs-types">${e(c.ui.propose)} →</a><a class="ogs-top" href="#ogs-index">${e(c.ui.back)} ↑</a></div>
      </div>
    </article>`
    )
    .join("");
  const idx = p.items.map((it, i) => `<li><a href="#pt-${pad(i + 1)}"><span>${pad(i + 1)}</span>${e(it.name)}</a></li>`).join("");
  return `${pageHero(p.hero, { n: "04" })}
  <section class="ogs-sec" id="ogs-process" aria-labelledby="ogs-process-t">
    <div class="ogs-wrap">
      <div class="ogs-sechead"><p class="ogs-label"><span class="ogs-label__t">Process</span></p><h2 class="ogs-title" id="ogs-process-t">${e(p.processTitle)}</h2></div>
      <ol class="ogs-flow ogs-flow--5">${proc}</ol>
      <p class="ogs-note">${e(p.note)}</p>
    </div>
  </section>
  <section class="ogs-sec ogs-sec--index" id="ogs-index" aria-label="${e(c.ui.onThisPage)}">
    <div class="ogs-wrap"><p class="ogs-dt">${e(c.ui.onThisPage)} · 14</p><ol class="ogs-index ogs-index--compact">${idx}</ol></div>
  </section>
  <div class="ogs-wrap ogs-items">${items}</div>`;
}

/* ───────── 05 Contact ───────── */

function contactMain(c, S, lang) {
  const k = c.contact;
  const formHref = (topic) =>
    `/${lang}/business/inquiry/?service=partnership&source=${encodeURIComponent(`/${lang}/ongil/contact/`)}&topic=${encodeURIComponent(`ONGIL - ${topic}`)}`;
  const mailHref = (topic) => `mailto:${k.email}?subject=${encodeURIComponent(`[ONGIL] ${topic}`)}`;
  const channels = k.channels
    .map((ch) => `<li><p class="ogs-cell__k">${e(ch.k)}</p><p class="ogs-channel__v">${ch.href ? `<a href="${e(`/${lang}/${ch.href.replace("source=/ongil/", `source=/${lang}/ongil/`)}`)}">${e(ch.v)} →</a>` : `<a href="mailto:${e(ch.v)}">${e(ch.v)}</a>`}</p><p>${e(ch.text)}</p></li>`)
    .join("");
  const types = k.types
    .map(
      (t, i) => `<li class="ogs-type" id="c-${pad(i + 1)}">
        <span class="ogs-cell__n">${pad(i + 1)}</span>
        <h3>${e(t.name)}</h3>
        <p>${e(t.text)}</p>
        <a class="ogs-btn ogs-btn--line" href="${e(t.channel === "mail" ? mailHref(t.name) : formHref(t.name))}">${e(t.channel === "mail" ? k.mailCta : k.formCta)} →</a>
      </li>`
    )
    .join("");
  return `${pageHero(k.hero, { n: "05" })}
  <section class="ogs-sec" id="ogs-channels" aria-labelledby="ogs-channels-t">
    <div class="ogs-wrap">
      <div class="ogs-sechead"><p class="ogs-label"><span class="ogs-label__t">Channels</span></p><h2 class="ogs-title" id="ogs-channels-t">${e(k.channelsTitle)}</h2></div>
      <ul class="ogs-grid ogs-grid--2 ogs-channels">${channels}</ul>
    </div>
  </section>
  <section class="ogs-sec" id="ogs-types" aria-labelledby="ogs-types-t">
    <div class="ogs-wrap">
      <div class="ogs-sechead"><p class="ogs-label"><span class="ogs-label__n">13</span><span class="ogs-label__t">Inquiry Types</span></p><h2 class="ogs-title" id="ogs-types-t">${c.lang === "ko" ? "문의 유형" : "Inquiry types"}</h2></div>
      <ol class="ogs-grid ogs-grid--3 ogs-types">${types}</ol>
      <p class="ogs-note">${e(k.privacy)}</p>
      <p class="ogs-note ogs-note--strong">${e(k.emergency)}</p>
    </div>
  </section>`;
}

const MAINS = { overview: overviewMain, platform: platformMain, business: businessMain, partnerships: partnershipsMain, contact: contactMain };

export function renderMain(lang, page) {
  const { c, s } = CONTENT[lang];
  return `<div id="ongil-site" class="ogs" data-ogs-page="${page}" lang="${lang}">
  ${subnav(c, lang, page)}
  ${MAINS[page](c, s, lang)}
  ${notesFoot(c)}
</div>`;
}

function hreflangSub(page) {
  const p = page === "overview" ? "ongil" : `ongil/${page}`;
  if (page === "overview") return hreflangBlock("ongil");
  return [
    `    <link rel="alternate" hreflang="ko" href="${SITE_ORIGIN}/ko/${p}/" />`,
    `    <link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/en/${p}/" />`,
    `    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/${p}/" />`,
  ].join("\n");
}

function renderPage(lang, page) {
  const L = LANGS.find((l) => l.dir === lang);
  const en = loadJson("en.json");
  const loc = lang === "en" ? en : fillMissing(loadJson(L.file), en);
  const flat = flatten(loc);
  const flatEn = flatten(en);
  const { c } = CONTENT[lang];
  const seo = c.seo[page];
  const depth = page === "overview" ? "../" : "../../";
  const header = renderStudioHeader(flat, flatEn, { activeNav: "ongil", base: depth });
  const footer = renderStudioFooter(flat, flatEn, { base: depth });
  const canonical = `${SITE_ORIGIN}${pagePath(lang, page)}`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: L.htmlLang,
    LANG_DIR: lang,
    FONT_LINKS: fontLinksHtml(lang),
    TITLE: e(seo.title),
    META_DESCRIPTION: e(clampSeoDescription(seo.description)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang] || "en_US",
    HREFLANG_BLOCK: hreflangSub(page),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: renderMain(lang, page),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/ongil-site.css?v=${OGS_VER}" />`,
    EXTRA_SCRIPTS: "",
  });
  const out = page === "overview" ? path.join(ROOT, lang, "ongil", "index.html") : path.join(ROOT, lang, "ongil", page, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  return out;
}

function patchSitemap() {
  const file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return 0;
  let xml = fs.readFileSync(file, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  const extra = [];
  for (const lang of SITE_LANGS) {
    for (const page of PAGES.filter((p) => p !== "overview")) {
      const loc = `${SITE_ORIGIN}${pagePath(lang, page)}`;
      if (xml.includes(`<loc>${loc}</loc>`)) continue;
      extra.push(["  <url>", `    <loc>${loc}</loc>`, `    <lastmod>${today}</lastmod>`, "    <changefreq>monthly</changefreq>", "    <priority>0.6</priority>", "  </url>"].join("\n"));
    }
  }
  if (!extra.length) return 0;
  xml = xml.replace("</urlset>", `${extra.join("\n")}\n</urlset>\n`);
  fs.writeFileSync(file, xml);
  return extra.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const lang of SITE_LANGS) for (const page of PAGES) renderPage(lang, page);
  const added = patchSitemap();
  console.log("render-ongil-site: OK", SITE_LANGS.join(","), PAGES.length, "pages each; sitemap +", added);
}
