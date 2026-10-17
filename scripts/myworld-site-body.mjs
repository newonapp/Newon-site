/**
 * MY WORLD business site — page bodies (scoped to #myworld-site.mws).
 * Information only: no booking, ordering, payment, sign-in, seller registration or record entry.
 */
import { escapeHtml as esc } from "./hub-utils.mjs";
import { MYWORLD_PAGES, myworldPagePath } from "./myworld-site-copy.mjs";

export const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.newon.myworld&pcampaignid=web_share";
const MAIL = "newon@newon.app";

const pad = (n) => String(n).padStart(2, "0");
const lines = (s) => esc(s).split("\n").join("<br />");
const pageHref = (lang, id) => `/${lang}/${myworldPagePath(id)}`;
const mailHref = (copy, topic) =>
  `mailto:${MAIL}?subject=${encodeURIComponent(`${copy.ui.emailSubjectPrefix} ${topic}`)}`;

function badge(copy, status) {
  return `<span class="mws-badge mws-badge--${status}"><span class="mws-badge__dot" aria-hidden="true"></span>${esc(copy.ui.status[status])}</span>`;
}

function btn(href, label, { ghost = false, external = false } = {}) {
  const ext = external ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a class="mws-btn${ghost ? " mws-btn--ghost" : ""}" href="${esc(href)}"${ext}>${esc(label)}</a>`;
}

function itemCta(lang, copy, cta, topic) {
  if (cta === "app") return `<a class="mws-link" href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener noreferrer">${esc(copy.ui.appCta)} <span aria-hidden="true">↗</span></a>`;
  if (cta === "partner") return `<a class="mws-link" href="${pageHref(lang, "partnerships")}">${esc(copy.ui.partnerCta)} <span aria-hidden="true">→</span></a>`;
  return `<a class="mws-link" href="${esc(mailHref(copy, topic))}">${esc(copy.ui.inquiryCta)} <span aria-hidden="true">→</span></a>`;
}

const GLOBE = `<svg class="mws-globe" viewBox="0 0 320 320" role="img" aria-hidden="true" focusable="false">
  <circle cx="160" cy="160" r="128" class="mws-globe__ring"/>
  <ellipse cx="160" cy="160" rx="54" ry="128" class="mws-globe__line"/>
  <ellipse cx="160" cy="160" rx="100" ry="128" class="mws-globe__line"/>
  <line x1="160" y1="32" x2="160" y2="288" class="mws-globe__line"/>
  <ellipse cx="160" cy="160" rx="128" ry="44" class="mws-globe__line"/>
  <ellipse cx="160" cy="160" rx="118" ry="90" class="mws-globe__line mws-globe__line--faint"/>
  <line x1="32" y1="160" x2="288" y2="160" class="mws-globe__line"/>
  <path d="M96 112 C 140 70, 200 70, 236 124 S 250 214, 190 236" class="mws-globe__route"/>
  <circle cx="96" cy="112" r="6" class="mws-globe__pin"/>
  <circle cx="236" cy="124" r="6" class="mws-globe__pin"/>
  <circle cx="190" cy="236" r="6" class="mws-globe__pin"/>
  <circle cx="132" cy="196" r="4" class="mws-globe__dot"/>
  <circle cx="206" cy="176" r="4" class="mws-globe__dot"/>
</svg>`;

function subnav(lang, copy, active) {
  const items = copy.nav
    .map((n) => {
      const cur = n.id === active ? ' aria-current="page"' : "";
      return `<li><a class="mws-subnav__link" href="${pageHref(lang, n.id)}"${cur}><span class="mws-subnav__n">${n.n}</span>${esc(n.label)}</a></li>`;
    })
    .join("");
  return `<nav class="mws-subnav" aria-label="${esc(copy.ui.subnavAria)}">
    <div class="mws__wrap mws-subnav__inner">
      <a class="mws-subnav__brand" href="${pageHref(lang, "overview")}">${esc(copy.ui.brand)}</a>
      <ul class="mws-subnav__list">${items}</ul>
    </div>
  </nav>`;
}

function hero(h, { globe = false, extra = "", ctas = "" } = {}) {
  return `<header class="mws-hero">
    <div class="mws__wrap mws-hero__grid${globe ? " mws-hero__grid--globe" : ""}">
      <div class="mws-hero__copy">
        <p class="mws-kicker">${esc(h.kicker)}</p>
        <h1 class="mws-hero__title">${lines(h.title)}</h1>
        <p class="mws-lead">${esc(h.lead)}</p>
        ${extra}
        ${ctas ? `<div class="mws-actions">${ctas}</div>` : ""}
      </div>
      ${globe ? `<div class="mws-hero__art">${GLOBE}</div>` : ""}
    </div>
  </header>`;
}

function block({ id, kicker, title, lead = "", inner, band = false }) {
  return `<section class="mws-block${band ? " mws-block--band" : ""}" id="${id}" aria-labelledby="${id}-title">
    <div class="mws__wrap">
      <div class="mws-head">
        ${kicker ? `<p class="mws-kicker">${esc(kicker)}</p>` : ""}
        <h2 class="mws-title" id="${id}-title">${lines(title)}</h2>
        ${lead ? `<p class="mws-lead">${esc(lead)}</p>` : ""}
      </div>
      ${inner}
    </div>
  </section>`;
}

function notes(copy, keys) {
  return `<aside class="mws-notes" aria-label="Notes">${keys.map((k) => `<p class="mws-note">${esc(copy.ui[k])}</p>`).join("")}</aside>`;
}

function legend(copy) {
  return `<p class="mws-legend"><span class="mws-legend__label">${esc(copy.ui.statusLabel)}</span>${["live", "partial", "planned", "review"].map((s) => badge(copy, s)).join("")}</p>`;
}

function pager(lang, copy, current) {
  const i = MYWORLD_PAGES.indexOf(current);
  const prevId = MYWORLD_PAGES[i - 1];
  const nextId = MYWORLD_PAGES[i + 1];
  const nav = (id, dir) => {
    if (!id) return "<span></span>";
    const n = copy.nav.find((x) => x.id === id);
    return `<a class="mws-pager__link mws-pager__link--${dir}" href="${pageHref(lang, id)}"><span class="mws-pager__dir">${esc(dir === "prev" ? copy.ui.prev : copy.ui.next)}</span><span class="mws-pager__name">${n.n} ${esc(n.label)}</span></a>`;
  };
  return `<nav class="mws-pager mws__wrap" aria-label="${esc(copy.ui.subnavAria)}">${nav(prevId, "prev")}${nav(nextId, "next")}</nav>`;
}

function closeBand(lang, copy, title, lead) {
  return `<section class="mws-close" aria-labelledby="mws-close-title">
    <div class="mws__wrap mws-close__inner">
      <div>
        <h2 class="mws-close__title" id="mws-close-title">${lines(title)}</h2>
        ${lead ? `<p class="mws-close__lead">${esc(lead)}</p>` : ""}
      </div>
      <div class="mws-actions">
        ${btn(pageHref(lang, "partnerships"), copy.ui.partnerCta, { ghost: true })}
        ${btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true })}
        ${btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true })}
      </div>
    </div>
  </section>`;
}

/* ---------- 01 Overview ---------- */
function overview(lang, copy) {
  const o = copy.overview;
  const b = copy.business;
  const h = hero(o.hero, {
    globe: true,
    extra: `<p class="mws-now"><span class="mws-now__tag">NOW</span>${esc(o.hero.now)}</p>`,
    ctas: [
      btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true }),
      btn(pageHref(lang, "platform"), copy.ui.platformCta, { ghost: true }),
      btn(pageHref(lang, "partnerships"), copy.ui.partnerCta, { ghost: true }),
    ].join("") + `<p class="mws-hint">${esc(copy.ui.appIosNote)}</p>`,
  });
  const vision = block({
    id: "mws-vision", kicker: o.vision.kicker, title: o.vision.title,
    inner: `<ol class="mws-rows">${o.vision.items.map((t, i) => `<li class="mws-row"><span class="mws-row__n">${pad(i + 1)}</span><p class="mws-row__body">${esc(t)}</p></li>`).join("")}</ol>`,
  });
  const journey = block({
    id: "mws-journey", kicker: o.journey.kicker, title: o.journey.title, lead: o.journey.lead,
    inner: `<ol class="mws-rail">${o.journey.items.map((s, i) => `<li class="mws-rail__step mws-rail__step--${s.status}"><span class="mws-rail__n">${pad(i + 1)}</span><p class="mws-en">${esc(s.en)}</p><h3 class="mws-card__title">${esc(s.name)}</h3><p class="mws-card__body">${esc(s.lead)}</p>${badge(copy, s.status)}</li>`).join("")}</ol>`,
  });
  const connect = block({
    id: "mws-connect", kicker: o.connect.kicker, title: o.connect.title,
    inner: `<ul class="mws-grid mws-grid--3">${o.connect.items.map((c, i) => `<li class="mws-card"><p class="mws-en">${pad(i + 1)} · ${esc(c.en)}</p><h3 class="mws-card__title">${esc(c.name)}</h3><p class="mws-card__body">${esc(c.lead)}</p>${badge(copy, c.status)}</li>`).join("")}</ul>`,
  });
  const eco = block({
    id: "mws-ecosystem", kicker: o.ecosystem.kicker, title: o.ecosystem.title, lead: o.ecosystem.lead,
    inner: `<ol class="mws-rows">${o.ecosystem.items.map((e) => `<li class="mws-row"><span class="mws-row__n">${esc(e.n)}</span><h3 class="mws-row__title">${esc(e.name)}</h3><p class="mws-row__body">${esc(e.body)}</p></li>`).join("")}</ol>`,
  });
  const opp = block({
    id: "mws-opportunities", kicker: o.opportunities.kicker, title: o.opportunities.title, lead: o.opportunities.lead,
    inner: `<ul class="mws-grid mws-grid--4">${b.categories.map((c, i) => `<li class="mws-card mws-card--link"><a class="mws-card__a" href="${pageHref(lang, "business")}#mws-cat-${i + 1}"><p class="mws-en">${pad(i + 1)} · ${esc(c.en)}</p><h3 class="mws-card__title">${esc(c.name)}</h3><p class="mws-card__body">${esc(c.lead)}</p></a></li>`).join("")}</ul>
      <div class="mws-actions">${btn(pageHref(lang, "business"), copy.ui.businessCta, { ghost: true })}</div>`,
  });
  const newon = block({
    id: "mws-newon", kicker: o.newon.kicker, title: o.newon.title, lead: o.newon.lead,
    inner: `<ol class="mws-rows">${o.newon.items.map((e) => `<li class="mws-row mws-row--status"><span class="mws-row__n">${esc(e.n)}</span><h3 class="mws-row__title">${esc(e.name)}</h3><p class="mws-row__body">${esc(e.body)}</p>${badge(copy, e.status)}</li>`).join("")}</ol>`,
  });
  return [h, vision, journey, connect, eco, opp, newon,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`,
    closeBand(lang, copy, o.next.title, o.next.lead)].join("\n");
}

/* ---------- 02 Platform ---------- */
function platform(lang, copy) {
  const p = copy.platform;
  const shots = `<figure class="mws-shots" aria-label="${esc(p.shotsLabel)}">
      <figcaption class="mws-kicker">${esc(p.shotsLabel)}</figcaption>
      <div class="mws-shots__row">${p.shots.map((s) => `<img src="${s.src}" alt="${esc(s.alt)}" width="1242" height="2688" loading="lazy" decoding="async" />`).join("")}</div>
    </figure>`;
  const h = hero(p.hero, {
    extra: shots,
    ctas: btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true }) + btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });
  const list = block({
    id: "mws-services", kicker: "20 SERVICES", title: `${copy.ui.brand} ${copy.nav[1].label}`,
    inner: `${legend(copy)}<ol class="mws-grid mws-grid--2 mws-services">${p.items.map((s, i) => `<li class="mws-card mws-svc" id="mws-svc-${i + 1}">
        <div class="mws-svc__top"><span class="mws-row__n">${pad(i + 1)}</span>${badge(copy, s.status)}</div>
        <p class="mws-en">${esc(s.en)}</p>
        <h3 class="mws-card__title">${esc(s.name)}</h3>
        <p class="mws-card__body">${esc(s.desc)}</p>
        <p class="mws-mini">${esc(copy.ui.featuresLabel)}</p>
        <ul class="mws-chips">${s.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <p class="mws-card__cta">${itemCta(lang, copy, s.cta, s.name)}</p>
      </li>`).join("")}</ol>`,
  });
  return [h, list, `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`,
    closeBand(lang, copy, copy.overview.next.title, copy.overview.next.lead)].join("\n");
}

/* ---------- 03 Business ---------- */
function business(lang, copy) {
  const b = copy.business;
  const h = hero(b.hero, {
    ctas: btn(pageHref(lang, "partnerships"), copy.ui.partnerCta) + btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });
  const cats = block({
    id: "mws-categories", kicker: "8 CATEGORIES", title: b.categoriesTitle,
    inner: `<ol class="mws-grid mws-grid--4">${b.categories.map((c, i) => `<li class="mws-card" id="mws-cat-${i + 1}">
        <p class="mws-en">${pad(i + 1)} · ${esc(c.en)}</p>
        <h3 class="mws-card__title">${esc(c.name)}</h3>
        <p class="mws-card__body">${esc(c.lead)}</p>
        <ul class="mws-chips mws-chips--links">${c.lines.map((n) => `<li><a href="#mws-line-${n}">${pad(n)} ${esc(b.lines[n - 1].name)}</a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });
  const dl = (l) => [
    [copy.ui.customersLabel, l.customers],
    [copy.ui.valueLabel, l.value],
    [copy.ui.revenueLabel, l.revenue],
    [copy.ui.partnersLabel, l.partners],
  ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  const linesBlock = block({
    id: "mws-lines", kicker: "20 BUSINESS LINES", title: b.linesTitle,
    inner: `${legend(copy)}<ol class="mws-lines">${b.lines.map((l, i) => `<li class="mws-line" id="mws-line-${i + 1}">
        <div class="mws-line__head"><span class="mws-row__n">${pad(i + 1)}</span><div><p class="mws-en">${esc(l.en)}</p><h3 class="mws-card__title">${esc(l.name)}</h3></div>${badge(copy, l.status)}</div>
        <p class="mws-card__body">${esc(l.intro)}</p>
        <dl class="mws-dl">${dl(l)}</dl>
        <p class="mws-card__cta">${itemCta(lang, copy, l.cta, l.name)}</p>
      </li>`).join("")}</ol>
      ${notes(copy, ["priceNote", "partnerNote"])}`,
  });
  const commerce = block({
    id: "mws-commerce", kicker: b.commerce.kicker, title: b.commerce.title, band: true,
    inner: `<ol class="mws-rows">${b.commerce.items.map((t, i) => `<li class="mws-row"><span class="mws-row__n">${pad(i + 1)}</span><p class="mws-row__body">${esc(t)}</p></li>`).join("")}</ol>`,
  });
  const trust = block({
    id: "mws-trust", kicker: b.trust.kicker, title: b.trust.title, lead: b.trust.lead,
    inner: `<ul class="mws-grid mws-grid--4">${b.trust.items.map((t, i) => `<li class="mws-card mws-card--flat"><p class="mws-en">${pad(i + 1)}</p><h3 class="mws-card__title">${esc(t.name)}</h3><p class="mws-card__body">${esc(t.body)}</p></li>`).join("")}</ul>`,
  });
  return [h, cats, linesBlock, commerce, trust, `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`,
    closeBand(lang, copy, copy.overview.next.title, copy.overview.next.lead)].join("\n");
}

/* ---------- 04 Partnerships ---------- */
function partnerships(lang, copy) {
  const p = copy.partnerships;
  const h = hero(p.hero, {
    ctas: btn(mailHref(copy, copy.ui.partnerCta), copy.ui.partnerCta) + btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });
  const types = block({
    id: "mws-partners", kicker: "15 PARTNER TYPES", title: p.typesTitle,
    inner: `<ol class="mws-lines">${p.items.map((t, i) => `<li class="mws-line" id="mws-partner-${i + 1}">
        <div class="mws-line__head"><span class="mws-row__n">${pad(i + 1)}</span><div><h3 class="mws-card__title">${esc(t.name)}</h3></div></div>
        <dl class="mws-dl">${[
          [copy.ui.targetLabel, t.target],
          [copy.ui.collabLabel, t.collab],
          [copy.ui.valueLabel, t.value],
          [copy.ui.revenueLabel, t.revenue],
          [copy.ui.termsLabel, t.terms],
        ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
        <p class="mws-card__cta"><a class="mws-link" href="${esc(mailHref(copy, `${copy.ui.partnerCta} — ${t.name}`))}">${esc(copy.ui.partnerCta)} <span aria-hidden="true">→</span></a></p>
      </li>`).join("")}</ol>
      ${notes(copy, ["priceNote", "partnerNote"])}`,
  });
  const process = block({
    id: "mws-process", kicker: p.process.kicker, title: p.process.title, band: true,
    inner: `<ol class="mws-rail mws-rail--5">${p.process.steps.map((s, i) => `<li class="mws-rail__step"><span class="mws-rail__n">${pad(i + 1)}</span><p class="mws-en">${esc(s.en)}</p><h3 class="mws-card__title">${esc(s.name)}</h3><p class="mws-card__body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });
  return [h, types, process, closeBand(lang, copy, copy.overview.next.title, copy.overview.next.lead)].join("\n");
}

/* ---------- 05 Contact ---------- */
function contact(lang, copy) {
  const c = copy.contact;
  const h = hero(c.hero, {
    ctas: btn(`mailto:${MAIL}?subject=${encodeURIComponent(copy.ui.emailSubjectPrefix)}`, copy.ui.mailCta) + btn(`/${lang}/contact/`, copy.ui.contactPageCta, { ghost: true }),
  });
  const routeLinks = (it) => {
    const links = [`<a class="mws-link" href="${esc(mailHref(copy, it.name))}">${esc(copy.ui.mailCta)} <span aria-hidden="true">→</span></a>`];
    if (it.route === "app") links.push(`<a class="mws-link" href="/${lang}/myworld/delete-account/">${esc(c.channels.items[2].name)} <span aria-hidden="true">→</span></a>`);
    if (it.route === "partner") links.push(`<a class="mws-link" href="${pageHref(lang, "partnerships")}">${esc(copy.nav[3].label)} <span aria-hidden="true">→</span></a>`);
    return links.join("");
  };
  const types = block({
    id: "mws-types", kicker: "10 INQUIRY TYPES", title: c.typesTitle,
    inner: `<ol class="mws-grid mws-grid--2">${c.items.map((it, i) => `<li class="mws-card"><p class="mws-en">${pad(i + 1)}</p><h3 class="mws-card__title">${esc(it.name)}</h3><p class="mws-card__body">${esc(it.body)}</p><p class="mws-card__cta mws-card__cta--multi">${routeLinks(it)}</p></li>`).join("")}</ol>`,
  });
  const chHref = [`mailto:${MAIL}?subject=${encodeURIComponent(copy.ui.emailSubjectPrefix)}`, `/${lang}/contact/`, `/${lang}/myworld/delete-account/`, `/${lang}/privacy/`];
  const channels = block({
    id: "mws-channels", kicker: c.channels.kicker, title: c.channels.title, band: true,
    inner: `<ul class="mws-grid mws-grid--4">${c.channels.items.map((ch, i) => `<li class="mws-card mws-card--link"><a class="mws-card__a" href="${esc(chHref[i])}"><h3 class="mws-card__title">${esc(ch.name)}</h3><p class="mws-card__body">${esc(ch.body)}</p></a></li>`).join("")}</ul>`,
  });
  return [h, types, channels, `<div class="mws__wrap">${notes(copy, ["scopeNote"])}</div>`].join("\n");
}

const RENDER = { overview, platform, business, partnerships, contact };

export function renderMyWorldSitePage(pageLang, page, { copy, contentLang, isFallback }) {
  const langAttr = contentLang !== pageLang ? ` lang="${contentLang}"` : "";
  const fallback = isFallback
    ? `<p class="mws-fallback mws__wrap" lang="en">This page is currently available in English. Translations are in preparation.</p>`
    : "";
  return `<div id="myworld-site" class="mws mws--${page}"${langAttr}>
  ${subnav(pageLang, copy, page)}
  ${fallback}
  ${RENDER[page](pageLang, copy)}
  ${pager(pageLang, copy, page)}
</div>`;
}
