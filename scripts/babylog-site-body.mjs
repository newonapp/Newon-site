/**
 * BABYLOG corporate site — section HTML per page.
 *
 * Reuses the Life Stage (nls-*) component vocabulary and its stylesheet unchanged:
 *   nls-film hero, nls-head, nls-split/nls-roster, nls-rail + nls-decade (journey), nls-flow, nls-proc,
 *   nls-board, nls-index, nls-pipe, nls-dir, nls-close, nls-chips, nls-note, nls-btn.
 * BABYLOG-only additions (sub navigation, status labels, detail list) are bl-* classes in babylog-site.css,
 * scoped to #lifestage-detail.nls[data-story="babylog"].
 *
 * Information only: no form, input, login or commerce control is rendered here.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { renderFlagshipSubnav, FLAGSHIP_SUBNAV_CSS } from "./flagship-subnav.mjs";
import { BUSINESS } from "./six-businesses.mjs";
import { BL_NAV, BL_SLUG, getBabylogCopy, copyLangFor } from "./babylog-site-copy.mjs";
import { CS_PARTNER_CODES, IND_PARTNER_CODES } from "./babylog-expansion-copy.mjs";

const esc = escapeHtml;
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");

export const pagePath = (lang, sub = "") => `/${lang}/${BL_SLUG}/${sub ? sub + "/" : ""}`;

/** Existing official inquiry form, passing the BABYLOG source and inquiry type (no new data path). */
export function inquiryHref(lang, page, code) {
  const source = `babylog-${page}${code ? "-" + code : ""}`;
  return `/${lang}/business/inquiry/?category=Partnership&source=${encodeURIComponent(source)}#inquiry`;
}

function titleBlock(kicker, title, lead, level = 2, id = "") {
  const tag = `h${level}`;
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${esc(kicker)}</p>` : ""}
    <${tag} class="nls-title"${id ? ` id="${id}"` : ""}>${nl(title)}</${tag}>
    ${lead ? `<p class="nls-lead">${esc(lead)}</p>` : ""}
  </header>`;
}

function chips(items) {
  return `<ul class="nls-chips">${(items || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
}

function statusChip(C, key) {
  return `<span class="bl-status bl-status--${esc(key)}">${esc(C.status[key])}</span>`;
}

function block(id, inner, band = false, cls = "") {
  return `<section id="${id}" class="nls-block${band ? " nls-block--band" : ""}${cls ? " " + cls : ""}" data-hs-section aria-labelledby="${id}-title">${inner}</section>`;
}

/** BABYLOG first-screen background film (owner-provided, 2026-10-18). */
const BABYLOG_FILM = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4";

/** Compact or full dark hero. No video, no external media. */
function hero(C, lang, page, h, compact) {
  return `<div class="nls-film bl-film${compact ? " bl-film--compact" : ""}" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${BABYLOG_FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${BABYLOG_FILM}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark">${esc(C.ui.wordmark)}</p>
        <h1 id="story-babylog-title" class="nls-film__slogan">${h.titleHtml}</h1>
        <p class="nls-film__lead">${esc(h.lead)}</p>
        <div class="nls-film__actions">
          ${heroActions(lang, page, h)}
        </div>
      </div>
    </div>
  </div>`;
}

function heroActions(lang, page, h) {
  const first = {
    overview: `<a class="nls-btn" href="${pagePath(lang, "platform")}">${esc(h.ctaMain)} →</a>`,
    platform: `<a class="nls-btn" href="#bl-access" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    business: `<a class="nls-btn" href="#bl-biz" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    partnerships: `<a class="nls-btn" href="#bl-types" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    contact: `<a class="nls-btn" href="#bl-contact-list" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
  }[page];
  const second = {
    overview: pagePath(lang, "partnerships"),
    platform: pagePath(lang, "contact"),
    business: pagePath(lang, "partnerships"),
    partnerships: pagePath(lang, "contact"),
    contact: pagePath(lang, "partnerships"),
  }[page];
  return `${first}
          <a class="nls-btn nls-btn--ghost" href="${second}">${esc(h.ctaSub)}</a>`;
}

/** The five-item BABYLOG menu. Same on every BABYLOG page; current page marked with aria-current. */
function subnav(C, lang, active) {
  const cl = copyLangFor(lang);
  const items = BL_NAV.map((it) => {
    const cur = it.id === active;
    return `<li><a class="bl-subnav__link${cur ? " is-current" : ""}" href="${pagePath(lang, it.sub)}"${cur ? ' aria-current="page"' : ""}>
        <span class="bl-subnav__n" aria-hidden="true">${it.n}</span>
        <span class="bl-subnav__en">${esc(it.en)}</span>
        <span class="bl-subnav__ko">${esc(cl === "ko" ? it.ko : it.en)}</span>
      </a></li>`;
  }).join("");
  return `<nav class="bl-subnav" aria-label="${esc(C.ui.menuLabel)}"><ul class="bl-subnav__list">${items}</ul></nav>`;
}

function legend(C) {
  return `<aside class="bl-legend" aria-label="${esc(C.status.legend)}">
    <p class="bl-legend__k">${esc(C.status.legend)}</p>
    <ul class="bl-legend__list">
      <li>${statusChip(C, "released")}</li>
      <li>${statusChip(C, "direction")}</li>
      <li>${statusChip(C, "review")}</li>
      <li>${statusChip(C, "plan")}</li>
    </ul>
    <p class="nls-note">${esc(C.status.legendBody)}</p>
    <p class="nls-note">${esc(C.status.planLegend)}</p>
  </aside>`;
}

function closeBlock(C, lang, page, c, ctas) {
  return `<section id="bl-close" class="nls-block nls-close nls-block--ink" data-hs-section aria-labelledby="bl-close-title">
    <p class="nls-kicker">${esc(c.closeKicker || c.next?.kicker || "")}</p>
    <h2 class="nls-hero__title" id="bl-close-title">${c.closeTitleHtml || c.next.titleHtml}</h2>
    <p class="nls-lead">${esc(c.closeLead || c.next.lead)}</p>
    <p class="nls-note">${esc(C.ui.infoOnly)}</p>
    <div class="nls-actions">${ctas}</div>
  </section>`;
}

/** Shared child-safety notices. Plan status, Korea-based systems, emergency routing, no child data. */
function csNotices(C, withEmergency = true) {
  return `<aside class="bl-notice" aria-label="${esc(C.x.platform.cs.kicker)}">
    <p class="nls-note">${esc(C.ui.csNote)}</p>
    <p class="nls-note">${esc(C.ui.koreaNote)}</p>
    ${
      withEmergency
        ? `<div class="bl-emergency" role="note"><p class="bl-emergency__t">${esc(C.ui.emergencyTitle)}</p><p>${esc(C.ui.emergencyBody)}</p><p>${esc(C.ui.noChildData)}</p></div>`
        : ""
    }
  </aside>`;
}

function flowItems(items) {
  return items
    .map((it) => `<article class="nls-flow__item"><span class="nls-flow__n">${esc(it.n)}</span><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`)
    .join("");
}

/** Alternate band backgrounds in order; ink blocks do not take part. */
function bands(list) {
  let i = 0;
  return list
    .map((b) => {
      if (b.ink) return b.html;
      const band = i % 2 === 1;
      i++;
      return block(b.id, b.inner, band, b.cls || "");
    })
    .join("\n");
}

/** The 32 business lines: 24 + 8 public welfare / child-safety lines (25-32), with category metadata. */
function allGroups(C) {
  const g = C.x.business.groups;
  const map = new Map();
  for (const it of g.items) {
    const [id, en, name, subs, customers, value, ops, status] = it;
    map.set(id, { id, n: id.slice(1), en, name, subs, customers, value, ops, status, cs: false });
  }
  for (const c of C.x.csGroups) {
    map.set(`g${c.n}`, { id: `g${c.n}`, n: c.n, en: c.en, name: c.name, subs: c.subs, customers: c.customers, value: c.service, ops: c.guard, sources: c.sources, rev: c.rev, status: "plan", cs: true });
  }
  return map;
}

/* ------------------------------------------------------------------ Overview */
function overviewBody(C, lang) {
  const o = C.overview;
  const roster = o.vision.lines
    .map((p, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${esc(p)}</p></li>`)
    .join("");
  const rail = o.journey.items
    .map(
      (it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${it.id}" aria-pressed="${i === 0 ? "true" : "false"}">
        <em>${esc(it.n)}</em><span>${esc(it.age)}</span></button>`
    )
    .join("");
  const cards = o.journey.items
    .map(
      (it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${it.id}" data-scene="${it.id}">
        <div class="nls-decade__mark" aria-hidden="true"><b>${esc(it.age)}</b><em>${esc(it.n)}</em></div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${esc(it.n)}</p>
          <p class="nls-decade__age">${esc(it.age)}</p>
          <h3>${esc(it.name)}</h3>
          <p class="nls-decade__lead">${esc(it.lead)}</p>
          ${chips(it.topics)}
        </div>
      </article>`
    )
    .join("");
  const connect = o.connect.items
    .map((it) => `<article class="nls-flow__item"><span class="nls-flow__n">${esc(it.n)}</span><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`)
    .join("");
  const eco = o.ecosystem.items
    .map((it) => `<article class="nls-proc__item"><span class="nls-proc__n">${esc(it.n)}</span><h3>${esc(it.name)}</h3><p>${esc(it.lead)}</p></article>`)
    .join("");
  const opp = C.business.categories
    .map(
      (b) => `<li><span>${esc(b.code)}</span><strong><a class="bl-link" href="${pagePath(lang, "business")}#biz-${b.id}">${esc(b.en)} <em>${esc(b.name === b.en ? "" : b.name)}</em></a></strong></li>`
    )
    .join("");
  const dir = o.newon.items
    .map((s) => `<li><span>${esc(s.n)}</span><div><strong>${esc(s.name)}</strong><p>${esc(s.body)}</p></div></li>`)
    .join("");
  const ctas = `<a class="nls-btn" href="${pagePath(lang, "platform")}">${esc(C.ui.toPlatform)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "business")}">${esc(C.ui.toBusiness)}</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}">${esc(C.ui.toPartnerships)}</a>`;
  const X = C.x.overview;
  const cats = C.x.business.groups.cats;
  const catIndex = cats
    .map(
      (c) => `<li><span>${esc(c.id)}</span><strong><a class="bl-link" href="${pagePath(lang, "business")}#cat-${c.id}">${esc(c.en)}${c.name === c.en ? "" : ` <em>${esc(c.name)}</em>`}</a></strong></li>`
    )
    .join("");
  const platformList = X.platforms.items
    .map((s2) => `<li><span>${esc(s2.n)}</span><div><strong>${esc(s2.name)}</strong><p>${esc(s2.body)}</p></div></li>`)
    .join("");
  const solutions = X.solutions.items
    .map((it) => `<article class="nls-pipe__item"><p class="nls-pipe__n">${esc(it.n)}</p><h3>${esc(it.name)}</h3><p>${esc(it.body)}</p></article>`)
    .join("");
  const impactItems = X.impact.items
    .map((it) => `<li><span>${esc(it.n)}</span><div><strong>${esc(it.name)}</strong><p>${esc(it.lead)}</p></div></li>`)
    .join("");
  const impact = `<section id="bl-impact" class="nls-block nls-block--ink bl-impact" data-hs-section aria-labelledby="bl-impact-title">
    <div class="nls-split">
      <div>
        ${titleBlock(X.impact.kicker, X.impact.title, "", 2, "bl-impact-title")}
        <p class="nls-lead">${esc(X.impact.body)}</p>
        <div class="nls-actions">
          <a class="nls-btn" href="${pagePath(lang, "business")}#cat-07">${esc(X.impact.ctaBusiness)} →</a>
          <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}#bl-cs-partners">${esc(X.impact.ctaPartner)}</a>
        </div>
      </div>
      <ol class="nls-dir">${impactItems}</ol>
    </div>
    <p class="nls-note">${esc(C.ui.csNote)}</p>
    <p class="nls-note">${esc(C.ui.koreaNote)}</p>
  </section>`;
  return {
    hero: hero(C, lang, "overview", o.hero, false),
    main: [
      bands([
        { id: "bl-vision", inner: `<div class="nls-split">${titleBlock(o.vision.kicker, o.vision.title, "", 2, "bl-vision-title")}<ol class="nls-roster">${roster}</ol></div>` },
        {
          id: "bl-journey",
          cls: "nls-journey-sec",
          inner: `${titleBlock(o.journey.kicker, o.journey.title, o.journey.lead, 2, "bl-journey-title")}
    <div class="nls-rail" role="group" aria-label="${esc(o.journey.kicker.replace(/^\d+ · /, ""))}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    <p class="nls-note">${esc(o.journey.note)}</p>`,
        },
        { id: "bl-connect", inner: `${titleBlock(o.connect.kicker, o.connect.title, o.connect.lead, 2, "bl-connect-title")}<div class="nls-flow bl-flow4">${connect}</div>` },
        { id: "bl-daily", inner: `${titleBlock(X.daily.kicker, X.daily.title, X.daily.lead, 2, "bl-daily-title")}<div class="nls-flow bl-flow4">${flowItems(X.daily.items)}</div>` },
        { id: "bl-health", inner: `${titleBlock(X.health.kicker, X.health.title, X.health.lead, 2, "bl-health-title")}<div class="nls-flow bl-flow4">${flowItems(X.health.items)}</div>` },
        { id: "bl-ecosystem", inner: `${titleBlock(o.ecosystem.kicker, o.ecosystem.title, o.ecosystem.lead, 2, "bl-ecosystem-title")}<div class="nls-proc">${eco}</div>` },
        { id: "bl-parent-eco", inner: `${titleBlock(X.parentEco.kicker, X.parentEco.title, X.parentEco.lead, 2, "bl-parent-eco-title")}<div class="nls-flow bl-flow4">${flowItems(X.parentEco.items)}</div>` },
        { id: "bl-solutions", inner: `${titleBlock(X.solutions.kicker, X.solutions.title, X.solutions.lead, 2, "bl-solutions-title")}<div class="nls-pipe bl-pipe5">${solutions}</div>` },
        {
          id: "bl-opportunities",
          inner: `${titleBlock(o.opportunities.kicker, o.opportunities.title, o.opportunities.lead, 2, "bl-opportunities-title")}
    <p class="nls-note">${esc(o.opportunities.note)}</p>
    <ol class="nls-index">${opp}</ol>
    <h3 class="bl-sub">${esc(X.groupsIndex.kicker)} · ${esc(X.groupsIndex.title.replace(/\n/g, " "))}</h3>
    <p class="nls-lead">${esc(X.groupsIndex.lead)}</p>
    <ol class="nls-index">${catIndex}</ol>`,
        },
        { ink: true, html: impact },
        {
          id: "bl-newon",
          inner: `<div class="nls-split"><div>${titleBlock(o.newon.kicker, o.newon.title, o.newon.lead, 2, "bl-newon-title")}</div><ol class="nls-dir">${dir}</ol></div>`,
        },
        {
          id: "bl-platforms",
          inner: `<div class="nls-split"><div>${titleBlock(X.platforms.kicker, X.platforms.title, X.platforms.lead, 2, "bl-platforms-title")}<p class="nls-note">${esc(X.platforms.note)}</p></div><ol class="nls-dir">${platformList}</ol></div>
    ${legend(C)}`,
        },
      ]),
      closeBlock(C, lang, "overview", o, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ Platform */
function platformBody(C, lang) {
  const p = C.platform;
  const secs = p.sections
    .map((s, i) => {
      const n = s.items.length;
      const items = s.items
        .map(
          (it) => `<article class="nls-board__item">
        <div class="nls-board__meta">${statusChip(C, it.status)}</div>
        <h3>${esc(it.name)}</h3>
        <p>${esc(it.lead)}</p>
      </article>`
        )
        .join("");
      return block(
        `bl-${s.id}`,
        `${titleBlock(s.kicker, s.title, s.lead, 2, `bl-${s.id}-title`)}
    <div class="nls-board bl-cols-${Math.min(n, 3)}">${items}</div>`,
        i % 2 === 1
      );
    })
    .join("\n");
  const X = C.x.platform;
  const sc = X.screens;
  const screenGroups = sc.groups
    .map(
      (g) => `<div class="bl-group" aria-labelledby="bl-${g.id}-t">
      <h3 class="bl-group__t" id="bl-${g.id}-t">${esc(g.name)}</h3>
      <div class="nls-board bl-cols-3">${g.items
        .map(
          (it) => `<article class="nls-board__item bl-screen">
        <div class="nls-board__meta"><span class="bl-screen__n" aria-hidden="true">${esc(it.n)}</span>${statusChip(C, it.status)}</div>
        <p class="nls-kicker">${esc(it.en)}</p>
        <h4>${esc(it.name)}</h4>
        <p>${esc(it.lead)}</p>
      </article>`
        )
        .join("")}</div>
    </div>`
    )
    .join("");
  const screens = block(
    "bl-screens",
    `${titleBlock(sc.kicker, sc.title, sc.lead, 2, "bl-screens-title")}
    <p class="nls-note">${esc(sc.note)}</p>
    ${screenGroups}`,
    false
  );
  const csRail = C.x.csGroups
    .map((g) => `<li><a class="bl-rail__link" href="#bl-cs-${g.id}"><span aria-hidden="true">${esc(g.n)}</span> ${esc(g.en)}</a></li>`)
    .join("");
  const F2 = X.cs.fields;
  const csIntro = block(
    "bl-cs",
    `${titleBlock(X.cs.kicker, X.cs.title, X.cs.lead, 2, "bl-cs-title")}
    ${csNotices(C, true)}
    <nav class="bl-rail" aria-label="${esc(X.cs.railLabel)}"><ol class="bl-rail__list">${csRail}</ol></nav>`,
    false
  );
  const csSecs = C.x.csGroups
    .map((g, i) =>
      block(
        `bl-cs-${g.id}`,
        `${titleBlock(`${g.n} · ${g.en}`, g.title, "", 2, `bl-cs-${g.id}-title`)}
    <p class="nls-lead">${esc(g.service)}</p>
    <p class="bl-sub">${esc(F2.subs)}</p>
    ${chips(g.subs)}
    ${dl([
      [F2.sources, esc(g.sources)],
      [F2.guard, esc(g.guard)],
      [F2.status, statusChip(C, "plan")],
    ])}`,
        i % 2 === 0,
        "bl-cs-sec"
      )
    )
    .join("\n");
  const csNote = block("bl-cs-note", `<p class="nls-note">${esc(C.ui.sourcesNote)}</p><p class="nls-note">${esc(C.ui.csNote)}</p>`, false, "bl-cs-end");
  const a = p.access;
  const b = BUSINESS.babylog;
  const access = block(
    "bl-access",
    `${titleBlock(a.kicker, a.title, a.lead, 2, "bl-access-title")}
    <div class="nls-actions">
      <a class="nls-btn" href="${esc(b.stores.appStore)}" target="_blank" rel="noopener" data-analytics="app_store_babylog">${esc(a.appStore)}</a>
      <a class="nls-btn" href="${esc(b.stores.googlePlay)}" target="_blank" rel="noopener" data-analytics="google_play_babylog">${esc(a.googlePlay)}</a>
      <a class="nls-btn nls-btn--ghost" href="/${lang}/${BL_SLUG}/delete-account/">${esc(a.deleteNote)}</a>
    </div>
    <p class="nls-note">${esc(a.note)}</p>
    ${legend(C)}`,
    true
  );
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "platform", "app")}">${esc(C.ui.toInquiry)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "business")}">${esc(C.ui.toBusiness)}</a>`;
  return {
    hero: hero(C, lang, "platform", p.hero, true),
    main: [
      screens,
      secs,
      csIntro,
      csSecs,
      csNote,
      access,
      closeBlock(C, lang, "platform", { closeKicker: p.closeKicker || C.contact.closeKicker, closeTitleHtml: p.closeTitleHtml || C.contact.closeTitleHtml, closeLead: p.closeLead || C.contact.closeLead }, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ Business */
function dl(rows) {
  return `<dl class="bl-dl">${rows
    .map(([k, v]) => `<div class="bl-dl__row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
    .join("")}</dl>`;
}

function businessBody(C, lang) {
  const b = C.business;
  const F = b.fields;
  const cards = b.categories
    .map((cat) => {
      const rows = [
        [F.overview, esc(cat.overview)],
        [F.customers, esc(cat.customers)],
        [F.problem, esc(cat.problem)],
        [F.value, esc(cat.value)],
        [F.revenue, esc(cat.revenue)],
        [F.partners, esc(cat.partners)],
        [F.status, statusChip(C, cat.status)],
      ];
      return `<article id="biz-${cat.id}" class="bl-biz" aria-labelledby="biz-${cat.id}-title">
      <header class="bl-biz__head">
        <span class="bl-biz__code" aria-hidden="true">${esc(cat.code)}</span>
        <div>
          <p class="nls-kicker">${esc(cat.en)}</p>
          <h3 id="biz-${cat.id}-title" class="bl-biz__title">${esc(cat.name)}</h3>
        </div>
      </header>
      ${chips(cat.items)}
      ${dl(rows)}
      <p class="bl-biz__cta"><a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}#partner-${cat.partnerType}" aria-label="${esc(F.cta)}: ${esc(cat.name)}">${esc(F.cta)} →</a></p>
    </article>`;
    })
    .join("\n");
  const intro = block(
    "bl-biz",
    `${titleBlock(b.intro.kicker, b.intro.title, b.intro.lead, 2, "bl-biz-title")}
    <p class="nls-note">${esc(C.ui.noOutsourcing)}</p>
    <p class="nls-note">${esc(C.ui.noPrice)}</p>
    <div class="bl-biz__list">${cards}</div>`
  );
  const G = C.x.business.groups;
  const GF = G.fields;
  const gmap = allGroups(C);
  const catRail = G.cats
    .map((c) => `<li><a class="bl-rail__link" href="#cat-${c.id}"><span aria-hidden="true">${esc(c.id)}</span> ${esc(copyLangFor(lang) === "ko" ? c.name : c.en)}</a></li>`)
    .join("");
  const catHtml = G.cats
    .map((c) => {
      const members = c.groups.map((id) => gmap.get(id));
      const csCat = !!c.cs;
      const catRows = [
        [GF.model, esc(c.model)],
        [GF.revenue, esc(c.revenue)],
      ];
      const forb = c.forbidden
        ? `<p class="bl-sub">${esc(c.forbiddenLabel)}</p>${chips(c.forbidden)}`
        : "";
      const cards2 = members
        .map((g) => {
          const rows = [
            [GF.customers, esc(g.customers)],
            [GF.value, esc(g.value)],
            [GF.ops, esc(g.ops)],
          ];
          if (g.cs) {
            rows.push([GF.sources, esc(g.sources)]);
            rows.push([GF.revenue, esc(g.rev)]);
          }
          rows.push([GF.status, statusChip(C, g.status)]);
          const target = g.cs ? `${pagePath(lang, "partnerships")}#bl-cs-partners` : `${pagePath(lang, "partnerships")}#bl-industry`;
          return `<article id="grp-${g.n}" class="bl-grp${g.cs ? " bl-grp--cs" : ""}" aria-labelledby="grp-${g.n}-title">
        <header class="bl-biz__head">
          <span class="bl-biz__code" aria-hidden="true">${esc(g.n)}</span>
          <div><p class="nls-kicker">${esc(g.en)}</p><h4 id="grp-${g.n}-title" class="bl-biz__title">${esc(copyLangFor(lang) === "ko" ? g.name : g.en)}</h4></div>
        </header>
        ${chips(g.subs)}
        ${dl(rows)}
        <p class="bl-biz__cta"><a class="bl-link" href="${target}">${esc(b.fields.cta)} →</a></p>
      </article>`;
        })
        .join("");
      return `<section id="cat-${c.id}" class="bl-cat${csCat ? " bl-cat--cs" : ""}" aria-labelledby="cat-${c.id}-title">
      <header class="bl-cat__head">
        <span class="bl-biz__code" aria-hidden="true">${esc(c.id)}</span>
        <div><p class="nls-kicker">${esc(c.en)}</p><h3 id="cat-${c.id}-title" class="bl-biz__title">${esc(copyLangFor(lang) === "ko" ? c.name : c.en)}</h3></div>
        <span class="bl-cat__count">${members.length}${esc(C.x.overview.groupsIndex.countUnit)}</span>
      </header>
      ${csCat ? csNotices(C, true) : ""}
      ${dl(catRows)}
      <p class="nls-note">${esc(C.ui.catApplies)}</p>
      ${forb}
      <div class="bl-grp__list">${cards2}</div>
    </section>`;
    })
    .join("\n");
  const groups = block(
    "bl-groups",
    `${titleBlock(G.kicker, G.title, G.lead, 2, "bl-groups-title")}
    <p class="nls-note">${esc(G.note)}</p>
    <nav class="bl-rail bl-rail--cats" aria-label="${esc(C.ui.cats)}"><ol class="bl-rail__list">${catRail}</ol></nav>
    ${catHtml}
    ${legend(C)}`,
    true
  );
  const ph = G ? C.x.business.phases : null;
  const phases = block(
    "bl-phases",
    `${titleBlock(ph.kicker, ph.title, ph.lead, 2, "bl-phases-title")}
    <div class="nls-pipe bl-pipe5">${ph.items
      .map((s2, i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}"><p class="nls-pipe__n">${esc(s2.n)}</p><h3>${esc(s2.name)}</h3><p>${esc(s2.body)}</p></article>`)
      .join("")}</div>
    <p class="nls-note">${esc(ph.note)}</p>`
  );
  const ctas = `<a class="nls-btn" href="${pagePath(lang, "partnerships")}">${esc(C.ui.toPartnerships)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${inquiryHref(lang, "business", "")}">${esc(C.ui.inquiryCta)}</a>`;
  return {
    hero: hero(C, lang, "business", b.hero, true),
    main: [intro, groups, phases, closeBlock(C, lang, "business", b, ctas)].join("\n"),
  };
}

/* -------------------------------------------------------------- Partnerships */
function partnershipsBody(C, lang) {
  const p = C.partnerships;
  const T = p.types;
  const steps = p.process.steps
    .map(
      (s, i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}"><p class="nls-pipe__n">${esc(s.n)}</p><h3>${esc(s.name)}</h3><p>${esc(s.body)}</p></article>`
    )
    .join("");
  const rail = T.items
    .map((it) => `<li><a class="bl-rail__link" href="#partner-${it.code}"><span aria-hidden="true">${esc(it.n)}</span> ${esc(it.name)}</a></li>`)
    .join("");
  const cards = T.items
    .map((it) => {
      const rows = [
        [T.fields.who, esc(it.who)],
        [T.fields.areas, esc(it.areas)],
        [T.fields.revenue, esc(it.revenue)],
        [T.fields.terms, esc(it.terms)],
        [T.fields.flow, esc(T.flowText)],
      ];
      return `<article id="partner-${it.code}" class="bl-biz" aria-labelledby="partner-${it.code}-title">
      <header class="bl-biz__head">
        <span class="bl-biz__code" aria-hidden="true">${esc(it.n)}</span>
        <div><h3 id="partner-${it.code}-title" class="bl-biz__title">${esc(it.name)}</h3></div>
      </header>
      ${dl(rows)}
      <p class="bl-biz__cta"><a class="nls-btn" href="${inquiryHref(lang, "partnerships", it.code)}">${esc(T.cta)} →</a></p>
    </article>`;
    })
    .join("\n");
  const PX = C.x.partnerships;
  const ind = PX.industry;
  const indRail = ind.items
    .map((it, i) => `<li><a class="bl-rail__link" href="#partner-${IND_PARTNER_CODES[i]}"><span aria-hidden="true">${String(i + 1).padStart(2, "0")}</span> ${esc(it[0])}</a></li>`)
    .join("");
  const indCards = ind.items
    .map((it, i) => {
      const code = IND_PARTNER_CODES[i];
      const n = String(i + 1).padStart(2, "0");
      const rows = [
        [ind.fields.purpose, esc(it[1])],
        [ind.fields.terms, esc(it[2])],
        [ind.fields.flow, esc(T.flowText)],
      ];
      return `<article id="partner-${code}" class="bl-biz bl-biz--compact" aria-labelledby="partner-${code}-title">
      <header class="bl-biz__head"><span class="bl-biz__code" aria-hidden="true">${n}</span><div><h3 id="partner-${code}-title" class="bl-biz__title">${esc(it[0])}</h3></div></header>
      ${dl(rows)}
      <p class="bl-biz__cta"><a class="nls-btn nls-btn--ghost" href="${inquiryHref(lang, "partnerships", code)}">${esc(T.cta)} →</a></p>
    </article>`;
    })
    .join("\n");
  const cs = PX.cs;
  const csRail = cs.items
    .map((it, i) => `<li><a class="bl-rail__link" href="#partner-${CS_PARTNER_CODES[i]}"><span aria-hidden="true">${String(i + 1).padStart(2, "0")}</span> ${esc(it[0])}</a></li>`)
    .join("");
  const csCards = cs.items
    .map((it, i) => {
      const code = CS_PARTNER_CODES[i];
      const n = String(i + 1).padStart(2, "0");
      const rows = [
        [cs.fields.purpose, esc(it[1])],
        [cs.fields.value, esc(it[2])],
        [cs.fields.flow, esc(cs.flowText)],
        [cs.fields.terms, esc(it[3])],
      ];
      return `<article id="partner-${code}" class="bl-biz bl-biz--compact bl-biz--cs" aria-labelledby="partner-${code}-title">
      <header class="bl-biz__head"><span class="bl-biz__code" aria-hidden="true">${n}</span><div><h3 id="partner-${code}-title" class="bl-biz__title">${esc(it[0])}</h3></div></header>
      ${dl(rows)}
      <p class="bl-biz__cta"><a class="nls-btn" href="${inquiryHref(lang, "partnerships", code)}">${esc(cs.cta)}</a></p>
    </article>`;
    })
    .join("\n");
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "partnerships", "")}">${esc(C.ui.inquiryCta)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "contact")}">${esc(C.ui.toInquiry)}</a>`;
  return {
    hero: hero(C, lang, "partnerships", p.hero, true),
    main: [
      block(
        "bl-process",
        `${titleBlock(p.process.kicker, p.process.title, p.process.lead, 2, "bl-process-title")}<div class="nls-pipe bl-pipe5">${steps}</div>`
      ),
      block(
        "bl-types",
        `${titleBlock(T.kicker, T.title, T.lead, 2, "bl-types-title")}
    <p class="nls-note">${esc(C.ui.noPartner)}</p>
    <nav class="bl-rail" aria-label="${esc(T.railLabel)}"><ol class="bl-rail__list">${rail}</ol></nav>
    <div class="bl-biz__list">${cards}</div>
    <p class="nls-note">${esc(C.ui.noPrice)}</p>`,
        true
      ),
      block(
        "bl-industry",
        `${titleBlock(ind.kicker, ind.title, ind.lead, 2, "bl-industry-title")}
    <nav class="bl-rail" aria-label="${esc(ind.railLabel)}"><ol class="bl-rail__list">${indRail}</ol></nav>
    <div class="bl-biz__list bl-biz__list--compact">${indCards}</div>`
      ),
      block(
        "bl-cs-partners",
        `${titleBlock(cs.kicker, cs.title, cs.lead, 2, "bl-cs-partners-title")}
    ${csNotices(C, true)}
    <p class="nls-note">${esc(C.ui.csPartnerNote)}</p>
    <nav class="bl-rail" aria-label="${esc(cs.railLabel)}"><ol class="bl-rail__list">${csRail}</ol></nav>
    <div class="bl-biz__list bl-biz__list--compact">${csCards}</div>
    <p class="nls-note">${esc(C.ui.noPrice)}</p>`,
        true
      ),
      closeBlock(C, lang, "partnerships", p, ctas),
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------- Contact */
function contactBody(C, lang) {
  const c = C.contact;
  const cards = c.list.items
    .map(
      (it) => `<li><a class="bl-card" href="${inquiryHref(lang, "contact", it.code)}" data-analytics="babylog_contact_${it.code}">
        <span class="bl-card__n" aria-hidden="true">${esc(it.n)}</span>
        <strong class="bl-card__t">${esc(it.name)}</strong>
        <span class="bl-card__d">${esc(it.lead)}</span>
        <span class="bl-card__go">${esc(c.list.go)}</span>
      </a></li>`
    )
    .join("");
  const guide = c.guide.items
    .map((it) => `<article class="nls-proc__item"><span class="nls-proc__n">${esc(it.n)}</span><h3>${esc(it.name)}</h3><p>${esc(it.body)}</p></article>`)
    .join("");
  const CX = C.x.contact;
  const cardList = (items) =>
    items
      .map(
        (it) => `<li><a class="bl-card" href="${inquiryHref(lang, "contact", it.code)}" data-analytics="babylog_contact_${it.code}">
        <span class="bl-card__n" aria-hidden="true">${esc(it.n)}</span>
        <strong class="bl-card__t">${esc(it.name)}</strong>
        <span class="bl-card__d">${esc(it.lead)}</span>
        <span class="bl-card__go">${esc(c.list.go)}</span>
      </a></li>`
      )
      .join("");
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "contact", "")}">${esc(C.ui.toInquiry)} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}">${esc(C.ui.toPartnerships)}</a>`;
  return {
    hero: hero(C, lang, "contact", c.hero, true),
    main: [
      block("bl-contact-list", `${titleBlock(c.list.kicker, c.list.title, c.list.lead, 2, "bl-contact-list-title")}<ul class="bl-cards">${cards}</ul>`),
      block("bl-contact-more", `${titleBlock(CX.more.kicker, CX.more.title, CX.more.lead, 2, "bl-contact-more-title")}<ul class="bl-cards">${cardList(CX.more.items)}</ul>`, true),
      block(
        "bl-contact-cs",
        `${titleBlock(CX.cs.kicker, CX.cs.title, CX.cs.lead, 2, "bl-contact-cs-title")}
    ${csNotices(C, true)}
    <ul class="bl-cards bl-cards--cs">${cardList(CX.cs.items)}</ul>`
      ),
      block(
        "bl-guide",
        `${titleBlock(c.guide.kicker, c.guide.title, "", 2, "bl-guide-title")}<div class="nls-proc bl-proc3">${guide}</div>
    <p class="nls-note">${esc(C.ui.privacyNote)} <a class="bl-link" href="/${lang}/privacy/">${esc(C.ui.privacyLink)}</a></p>`,
        true
      ),
      closeBlock(C, lang, "contact", c, ctas),
    ].join("\n"),
  };
}

const BODY = { overview: overviewBody, platform: platformBody, business: businessBody, partnerships: partnershipsBody, contact: contactBody };

/** @returns {string} the <section id="lifestage-detail" data-story="babylog"> markup for one page */
export function renderBabylogSection(lang, page) {
  const C = getBabylogCopy(lang);
  const { hero: heroHtml, main } = BODY[page](C, lang);
  const fallbackLang = copyLangFor(lang) !== lang ? ` lang="${copyLangFor(lang)}"` : "";
  return `<section id="lifestage-detail" class="nls" data-story="babylog" data-bl-page="${page}"${fallbackLang} aria-labelledby="story-babylog-title">
    ${heroHtml}
  ${renderFlagshipSubnav({ biz: "babylog", lang, active: page })}
  <div class="nls__wrap">
    ${main}
  </div>
</section>`;
}
