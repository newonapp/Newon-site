/**
 * BABYLOG corporate site — section HTML per page (Website Content Master Plan, 2026-10-18).
 *
 * Each of the five menu pages shows ONLY its own content (like ONGIL):
 *   01 Overview      about · mission · journey timeline · core experience · family first · beyond · commitment · next step
 *   02 Platform      21 services in groups A–E (sticky group index + numbered rows) · app access
 *   03 Business      8 group bands with 32 numbered rows · business models table · revenue note
 *   04 Partnerships  15 categories grid · why partner · 6 principles · process
 *   05 Contact       17 categories table · NEWON contact card · before-you-write guide
 * Every page keeps the shared dark film hero, the shared five-menu bar and ends with the common brand sign-off.
 *
 * Reuses the Life Stage shell (nls-film hero, nls-block, nls-head, nls-btn, nls-close) unchanged; BABYLOG-only
 * layouts are bl-* classes in /babylog-site.css, scoped to #lifestage-detail.nls[data-story="babylog"].
 * Information only: no form, input, login, booking or payment control is rendered here.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { renderFlagshipSubnav } from "./flagship-subnav.mjs";
import { BUSINESS } from "./six-businesses.mjs";
import {
  BL_NAV,
  BL_SLUG,
  getBabylogCopy,
  copyLangFor,
  PARTNER_CODES,
  CONTACT_CODES,
  CORE_STATUS,
  PLATFORM_STATUS,
  BUSINESS_STATUS,
} from "./babylog-site-copy.mjs";

const esc = escapeHtml;
const nl = (s) => esc(s || "").replace(/\n/g, "<br />");
const n2 = (i) => String(i).padStart(2, "0");

export const pagePath = (lang, sub = "") => `/${lang}/${BL_SLUG}/${sub ? sub + "/" : ""}`;

/** Existing official inquiry form, passing the BABYLOG source and inquiry type (no new data path). */
export function inquiryHref(lang, page, code) {
  const source = `babylog-${page}${code ? "-" + code : ""}`;
  return `/${lang}/business/inquiry/?category=Partnership&source=${encodeURIComponent(source)}#inquiry`;
}

const ARROW = `<span class="bl-arrow" aria-hidden="true">→</span>`;
const CHECK = `<svg class="bl-check" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>`;

function head(kicker, title, lead, id, cls = "") {
  return `<header class="nls-head bl-head${cls ? " " + cls : ""}">
      ${kicker ? `<p class="nls-kicker">${esc(kicker)}</p>` : ""}
      <h2 class="nls-title" id="${id}">${nl(title)}</h2>
      ${lead ? `<p class="nls-lead">${esc(lead)}</p>` : ""}
    </header>`;
}

function chip(C, key) {
  return `<span class="bl-status bl-status--${esc(key)}">${esc(C.status[key])}</span>`;
}

function section(id, cls, inner) {
  return `<section id="${id}" class="nls-block bl-sec ${cls}" data-hs-section aria-labelledby="${id}-title">
    ${inner}
  </section>`;
}

function legend(C) {
  return `<div class="bl-legend" role="note">
      <p class="bl-legend__k">${esc(C.status.legend)}</p>
      <ul class="bl-legend__list">
        <li>${chip(C, "live")}</li>
        <li>${chip(C, "prep")}</li>
        <li>${chip(C, "plan")}</li>
      </ul>
      <p class="bl-legend__body">${esc(C.status.legendBody)}</p>
    </div>`;
}

function emergency(C) {
  return `<div class="bl-emergency" role="note">
        <p class="bl-emergency__t">${esc(C.ui.emergencyTitle)}</p>
        <p>${esc(C.ui.emergencyBody)}</p>
        <p>${esc(C.ui.noChildData)}</p>
      </div>`;
}

/* ------------------------------------------------------------------------------------------- hero */
/** BABYLOG first-screen background film (owner-provided, 2026-10-18). */
const BABYLOG_FILM = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4";

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
    platform: `<a class="nls-btn" href="#bl-groups" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    business: `<a class="nls-btn" href="#bl-groups" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    partnerships: `<a class="nls-btn" href="#bl-cats" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
    contact: `<a class="nls-btn" href="#bl-cats" data-nls-scroll>${esc(h.ctaMain)} →</a>`,
  }[page];
  const second = {
    overview: inquiryHref(lang, "overview", "partnership"),
    platform: pagePath(lang, "contact"),
    business: pagePath(lang, "partnerships"),
    partnerships: pagePath(lang, "contact"),
    contact: pagePath(lang, "partnerships"),
  }[page];
  return `${first}
          <a class="nls-btn nls-btn--ghost" href="${second}">${esc(h.ctaSub)}</a>`;
}

/* ---------------------------------------------------------------------------- closing + sign-off */
function closeBlock(C, c, ctas) {
  return `<section id="bl-close" class="nls-block nls-close nls-block--ink" data-hs-section aria-labelledby="bl-close-title">
    <p class="nls-kicker">${esc(c.kicker)}</p>
    <h2 class="nls-hero__title" id="bl-close-title">${c.titleHtml}</h2>
    <p class="nls-lead">${esc(c.lead)}</p>
    <div class="nls-actions">${ctas}</div>
    <p class="nls-note">${esc(C.ui.infoOnly)}</p>
  </section>`;
}

/** Small strip of links to the other four menu pages (never their content). */
function moreStrip(C, lang, active) {
  const cl = copyLangFor(lang);
  const items = BL_NAV.filter((n) => n.id !== active)
    .map(
      (n) => `<li><a class="bl-more__a" href="${pagePath(lang, n.sub)}"><span class="bl-more__n">${n.n}</span><span class="bl-more__en">${esc(n.en)}</span>${cl === "ko" ? `<span class="bl-more__ko">${esc(n.ko)}</span>` : ""}${ARROW}</a></li>`
    )
    .join("");
  return `<nav class="bl-more" aria-label="${esc(C.ui.more)}"><p class="bl-more__k">${esc(C.ui.more)}</p><ul class="bl-more__list">${items}</ul></nav>`;
}

function brandSign(C) {
  const b = C.brand;
  return `<aside class="bl-brand" aria-label="${esc(b.kicker)}">
    <p class="bl-brand__k"><span class="bl-dot" aria-hidden="true"></span>${esc(b.kicker)}</p>
    <p class="bl-brand__t">${esc(b.title)}</p>
    <p class="bl-brand__b">${esc(b.body)}</p>
    <p class="bl-brand__s">${esc(b.sign)}</p>
  </aside>`;
}

/* ------------------------------------------------------------------------------------ 01 Overview */
function overviewBody(C, lang) {
  const o = C.overview;

  const about = section(
    "bl-about",
    "bl-about",
    `<p class="bl-eyebrow"><span class="bl-dot" aria-hidden="true"></span>${esc(o.eyebrow)}</p>
    <div class="bl-about__grid">
      <div>
        <p class="nls-kicker">${esc(o.about.kicker)}</p>
        <h2 class="bl-display" id="bl-about-title">${nl(o.about.title)}</h2>
      </div>
      <div class="bl-about__body">${o.about.body.map((p, i) => `<p${i === 1 ? ' class="bl-pull"' : ""}>${esc(p)}</p>`).join("")}</div>
    </div>
    <ul class="bl-facets" aria-label="${esc(o.about.kicker)}">${o.about.facets.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`
  );

  const mission = `<section id="bl-mission" class="nls-block nls-block--ink bl-sec bl-mission" data-hs-section aria-labelledby="bl-mission-title">
    <div class="bl-mission__grid">
      ${head(o.mission.kicker, o.mission.title, o.mission.lead, "bl-mission-title")}
      <ol class="bl-mission__list">${o.mission.items.map((t, i) => `<li><span class="bl-mission__n">${n2(i + 1)}</span><p>${esc(t)}</p></li>`).join("")}</ol>
    </div>
  </section>`;

  const journey = section(
    "bl-journey",
    "bl-journey",
    `<div class="bl-split">
      ${head(o.journey.kicker, o.journey.title, "", "bl-journey-title")}
      <p class="bl-body-lg">${esc(o.journey.body)}</p>
    </div>
    <ol class="bl-tl" aria-label="${esc(o.journey.kicker.replace(/^\d+ · /, ""))}">${o.journey.items
      .map(
        ([en, t], i) => `<li class="bl-tl__item">
        <span class="bl-tl__dot" aria-hidden="true"></span>
        <span class="bl-tl__n">${n2(i + 1)}</span>
        <h3 class="bl-tl__en">${esc(en)}</h3>
        <p class="bl-tl__t">${esc(t)}</p>
      </li>`
      )
      .join("")}</ol>`
  );

  const core = section(
    "bl-core",
    "nls-block--band bl-core",
    `${head(o.core.kicker, o.core.title, "", "bl-core-title")}
    <ul class="bl-matrix">${o.core.items
      .map(
        ([en, t], i) => `<li class="bl-matrix__cell">
        <div class="bl-matrix__top"><span class="bl-matrix__n">${n2(i + 1)}</span>${chip(C, CORE_STATUS[i])}</div>
        <h3 class="bl-matrix__en">${esc(en)}</h3>
        <p>${esc(t)}</p>
      </li>`
      )
      .join("")}</ul>
    ${legend(C)}`
  );

  const f = o.family;
  const family = section(
    "bl-family",
    "bl-family",
    `<div class="bl-family__grid">
      <div>
        ${head(f.kicker, f.title, "", "bl-family-title")}
        ${f.body.map((p) => `<p class="bl-body">${esc(p)}</p>`).join("")}
      </div>
      <figure class="bl-orbit">
        <div class="bl-orbit__stage">
          <div class="bl-orbit__ring" aria-hidden="true"></div>
          <div class="bl-orbit__ring bl-orbit__ring--in" aria-hidden="true"></div>
          <p class="bl-orbit__center">${esc(f.center)}</p>
          <ul class="bl-orbit__roles">${f.roles.map(([r, d], i) => `<li class="bl-orbit__role bl-orbit__role--${i + 1}"><strong>${esc(r)}</strong><span>${esc(d)}</span></li>`).join("")}</ul>
        </div>
        <figcaption class="bl-orbit__cap"><span class="bl-dot" aria-hidden="true"></span>${esc(f.guard)}</figcaption>
      </figure>
    </div>`
  );

  const b = o.beyond;
  const beyond = section(
    "bl-beyond",
    "nls-block--band bl-beyond",
    `<div class="bl-split">
      ${head(b.kicker, b.title, "", "bl-beyond-title")}
      <div>${b.body.map((p) => `<p class="bl-body">${esc(p)}</p>`).join("")}<p class="bl-beyond__tag">${chip(C, "plan")} <span>${esc(b.tag)}</span></p></div>
    </div>
    <ol class="bl-chain">${b.chain.map((t, i) => `<li${i === 0 ? ' class="is-home"' : ""}><span class="bl-chain__n">${n2(i + 1)}</span><span class="bl-chain__t">${esc(t)}</span></li>`).join("")}</ol>
    <ol class="bl-path">${b.path.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>`
  );

  const commitment = section(
    "bl-commit",
    "bl-commit",
    `<div class="bl-split bl-split--top">
      ${head(o.commitment.kicker, o.commitment.title, o.commitment.lead, "bl-commit-title")}
      <ul class="bl-checks">${o.commitment.items.map((t) => `<li>${CHECK}<span>${esc(t)}</span></li>`).join("")}</ul>
    </div>`
  );

  const nx = o.next;
  const ctas = `<a class="nls-btn" href="${pagePath(lang, "platform")}">${esc(nx.ctas[0])} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "business")}">${esc(nx.ctas[1])}</a>
      <a class="nls-btn nls-btn--ghost" href="${inquiryHref(lang, "overview", "partnership")}">${esc(nx.ctas[2])}</a>`;

  return {
    hero: hero(C, lang, "overview", o.hero, false),
    main: [about, mission, journey, core, family, beyond, commitment, moreStrip(C, lang, "overview"), closeBlock(C, nx, ctas)].join("\n"),
  };
}

/* ------------------------------------------------------------------------------------ 02 Platform */
function platformBody(C, lang) {
  const p = C.platform;
  const cl = copyLangFor(lang);
  const index = p.groups
    .map(
      (g) => `<li><a class="bl-gidx__a" href="#bl-grp-${g.id}"><span class="bl-gidx__l">${g.id.toUpperCase()}</span><span class="bl-gidx__t">${esc(g.en)}${cl === "ko" ? `<em>${esc(g.name)}</em>` : ""}</span><span class="bl-gidx__c">${g.items.length}</span></a></li>`
    )
    .join("");
  const groups = p.groups
    .map((g) => {
      const rows = g.items
        .map(([num, name, body, tags, note]) => {
          const st = PLATFORM_STATUS[+num - 1];
          const tagHtml = tags.length
            ? `<div class="bl-row__tags"><p class="bl-row__tk">${esc(C.ui.keyAreas)}</p><ul class="bl-tags">${tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`
            : "";
          const noteHtml = note ? `<p class="bl-row__note bl-row__note--${note}">${esc(C.ui[note])}</p>` : "";
          return `<li class="bl-row" id="bl-svc-${num}">
          <span class="bl-row__n">${num}</span>
          <div class="bl-row__main">
            <h4 class="bl-row__t">${esc(name)}</h4>
            <p class="bl-row__d">${esc(body)}</p>
            ${tagHtml}
            ${noteHtml}
          </div>
          <div class="bl-row__st">${chip(C, st)}</div>
        </li>`;
        })
        .join("");
      const safe = g.id === "e" ? `<div class="bl-safe"><p class="bl-safe__note">${esc(C.ui.csNote)}</p>${emergency(C)}</div>` : "";
      return `<section class="bl-pgrp" id="bl-grp-${g.id}" aria-labelledby="bl-grp-${g.id}-t">
        <header class="bl-pgrp__head">
          <span class="bl-pgrp__l" aria-hidden="true">${g.id.toUpperCase()}</span>
          <div>
            <p class="nls-kicker">${g.id.toUpperCase()} · ${esc(g.en)}</p>
            <h3 class="bl-pgrp__t" id="bl-grp-${g.id}-t">${esc(g.name)}</h3>
          </div>
          <span class="bl-pgrp__c">${g.items.length}${esc(C.ui.count)}</span>
        </header>
        <ol class="bl-rows">${rows}</ol>
        ${safe}
      </section>`;
    })
    .join("\n");

  const main = section(
    "bl-groups",
    "bl-platform",
    `<div class="bl-split bl-split--top">
      ${head(p.intro.kicker, p.intro.title, p.intro.lead, "bl-groups-title")}
      ${legend(C)}
    </div>
    <div class="bl-pf">
      <nav class="bl-gidx" aria-label="${esc(C.ui.groupIndex)}"><p class="bl-gidx__k">${esc(C.ui.groupIndex)}</p><ol class="bl-gidx__list">${index}</ol></nav>
      <div class="bl-pf__groups">${groups}</div>
    </div>`
  );

  const a = p.access;
  const st = BUSINESS.babylog.stores;
  const access = section(
    "bl-access",
    "nls-block--band bl-access",
    `<div class="bl-access__grid">
      ${head(a.kicker, a.title, a.lead, "bl-access-title")}
      <div class="bl-access__links">
        <a class="nls-btn" href="${esc(st.appStore)}" target="_blank" rel="noopener" data-analytics="app_store_babylog">${esc(a.appStore)}</a>
        <a class="nls-btn" href="${esc(st.googlePlay)}" target="_blank" rel="noopener" data-analytics="google_play_babylog">${esc(a.googlePlay)}</a>
        <a class="bl-textlink" href="/${lang}/${BL_SLUG}/delete-account/">${esc(a.deleteNote)} ${ARROW}</a>
      </div>
    </div>`
  );

  const c = p.close;
  const ctas = `<a class="nls-btn" href="${pagePath(lang, "business")}">${esc(c.ctas[0])} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}">${esc(c.ctas[1])}</a>`;
  return {
    hero: hero(C, lang, "platform", p.hero, true),
    main: [main, access, moreStrip(C, lang, "platform"), closeBlock(C, c, ctas)].join("\n"),
  };
}

/* ------------------------------------------------------------------------------------ 03 Business */
function businessBody(C, lang) {
  const b = C.business;
  const cl = copyLangFor(lang);

  const intro = section(
    "bl-bintro",
    "bl-bintro",
    `<div class="bl-split bl-split--top">
      ${head(b.intro.kicker, b.intro.title, b.intro.lead, "bl-bintro-title")}
      <dl class="bl-stats">${b.intro.stats.map(([v, k]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
    </div>
    ${legend(C)}`
  );

  let k = 0;
  const rail = b.groups
    .map((g) => `<li><a class="bl-rail__a" href="#grp-${g.n}"><span>${g.n}</span>${esc(cl === "ko" ? g.name : g.en)}</a></li>`)
    .join("");
  const bands = b.groups
    .map((g, gi) => {
      const rows = g.items
        .map(([en, body]) => {
          k++;
          const num = n2(k);
          return `<li class="bl-brow" id="biz-${num}">
            <span class="bl-brow__n">${num}</span>
            <div class="bl-brow__main"><h4 class="bl-brow__t">${esc(en)}</h4><p>${esc(body)}</p></div>
            <div class="bl-brow__st">${chip(C, BUSINESS_STATUS[k - 1])}</div>
          </li>`;
        })
        .join("");
      const tone = g.cs ? " bl-band--ink" : gi % 2 === 1 ? " bl-band--soft" : "";
      const cs = g.cs ? `<p class="bl-band__note">${esc(C.ui.csNote)}</p>${g.n === "07" ? emergency(C) : ""}` : "";
      return `<section class="bl-band${tone}" id="grp-${g.n}" aria-labelledby="grp-${g.n}-t">
        <div class="bl-band__in">
          <header class="bl-band__head">
            <span class="bl-band__n" aria-hidden="true">${g.n}</span>
            <p class="nls-kicker">${esc(g.en)}</p>
            <h3 class="bl-band__t" id="grp-${g.n}-t">${esc(g.name)}</h3>
            <p class="bl-band__c">${g.items.length}${esc(C.ui.count)} · ${n2(k - g.items.length + 1)}–${n2(k)}</p>
            ${cs}
          </header>
          <ol class="bl-brows">${rows}</ol>
        </div>
      </section>`;
    })
    .join("\n");

  const groups = `<section id="bl-groups" class="nls-block bl-sec bl-groups" data-hs-section aria-labelledby="bl-groups-title">
    <h2 class="bl-vh" id="bl-groups-title">${esc(b.intro.title)}</h2>
    <nav class="bl-rail" aria-label="${esc(C.ui.bizIndex)}"><ol class="bl-rail__list">${rail}</ol></nav>
    ${bands}
  </section>`;

  const m = b.models;
  const models = section(
    "bl-models",
    "bl-models",
    `${head(m.kicker, m.title, "", "bl-models-title")}
    <table class="bl-table">
      <thead><tr>${m.cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
      <tbody>${m.rows
        .map(([a, t, d]) => `<tr><th scope="row" data-k="${esc(m.cols[0])}">${esc(a)}</th><td data-k="${esc(m.cols[1])}">${esc(t)}</td><td data-k="${esc(m.cols[2])}">${esc(d)}</td></tr>`)
        .join("")}</tbody>
    </table>
    <p class="nls-note">${esc(C.ui.noPrice)}</p>`
  );

  const r = b.revenue;
  const revenue = section(
    "bl-revenue",
    "nls-block--band bl-revenue",
    `<div class="bl-split bl-split--top">
      <header class="nls-head bl-head"><p class="nls-kicker">${esc(r.label)}</p><h2 class="nls-title" id="bl-revenue-title">${esc(r.kicker)}</h2><p class="nls-lead">${esc(r.body)}</p></header>
      <ul class="bl-streams">${r.streams.map((s, i) => `<li><span>${n2(i + 1)}</span>${esc(s)}</li>`).join("")}</ul>
    </div>
    <aside class="bl-rule" aria-label="${esc(r.ruleLabel)}">
      <p class="bl-rule__k">${esc(r.ruleLabel)}</p>
      <p class="bl-rule__t">${esc(r.rule)}</p>
    </aside>`
  );

  const c = b.close;
  const ctas = `<a class="nls-btn" href="${pagePath(lang, "partnerships")}">${esc(c.ctas[0])} →</a>
      <a class="nls-btn nls-btn--ghost" href="${inquiryHref(lang, "business", "corporate")}">${esc(c.ctas[1])}</a>`;
  return {
    hero: hero(C, lang, "business", b.hero, true),
    main: [intro, groups, models, revenue, moreStrip(C, lang, "business"), closeBlock(C, c, ctas)].join("\n"),
  };
}

/* -------------------------------------------------------------------------------- 04 Partnerships */
function partnershipsBody(C, lang) {
  const p = C.partnerships;
  const cats = section(
    "bl-cats",
    "bl-pcats",
    `<div class="bl-split bl-split--top">
      ${head(p.cats.kicker, p.cats.title, "", "bl-cats-title")}
      <p class="bl-pcats__note">${chip(C, "review")} <span>${esc(C.ui.noPartner)}</span></p>
    </div>
    <ol class="bl-tiles">${p.cats.items
      .map(
        ([en, d], i) => `<li class="bl-tile" id="partner-${PARTNER_CODES[i]}">
        <span class="bl-tile__n">${n2(i + 1)}</span>
        <h3 class="bl-tile__t">${esc(en)}</h3>
        <p class="bl-tile__d">${esc(d)}</p>
        <a class="bl-tile__a" href="${inquiryHref(lang, "partnerships", PARTNER_CODES[i])}" aria-label="${esc(C.ui.propose)}: ${esc(en)}">${esc(C.ui.propose)} ${ARROW}</a>
      </li>`
      )
      .join("")}</ol>`
  );

  const w = p.why;
  const why = section(
    "bl-why",
    "nls-block--band bl-why",
    `<div class="bl-split">
      <div><p class="nls-kicker">${esc(w.kicker)}</p><h2 class="bl-display bl-display--md" id="bl-why-title">${nl(w.title)}</h2></div>
      <p class="bl-body-lg">${esc(w.body)}</p>
    </div>
    <ol class="bl-points">${w.points.map((t, i) => `<li><span>${n2(i + 1)}</span>${esc(t)}</li>`).join("")}</ol>`
  );

  const pr = p.principles;
  const principles = `<section id="bl-principles" class="nls-block nls-block--ink bl-sec bl-principles" data-hs-section aria-labelledby="bl-principles-title">
    ${head(pr.kicker, pr.title, "", "bl-principles-title")}
    <ol class="bl-princ">${pr.items.map((t, i) => `<li><span class="bl-princ__n">${n2(i + 1)}</span>${CHECK}<p>${esc(t)}</p></li>`).join("")}</ol>
  </section>`;

  const ps = p.process;
  const process = section(
    "bl-process",
    "bl-process",
    `${head(ps.kicker, ps.title, ps.lead, "bl-process-title")}
    <ol class="bl-steps">${ps.steps.map(([t, d], i) => `<li><span class="bl-steps__n">${n2(i + 1)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}</ol>
    <p class="nls-note">${esc(C.ui.noPrice)}</p>`
  );

  const c = p.close;
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "partnerships", "")}">${esc(c.ctas[0])} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "contact")}">${esc(c.ctas[1])}</a>`;
  return {
    hero: hero(C, lang, "partnerships", p.hero, true),
    main: [cats, why, principles, process, moreStrip(C, lang, "partnerships"), closeBlock(C, c, ctas)].join("\n"),
  };
}

/* ------------------------------------------------------------------------------------- 05 Contact */
function contactBody(C, lang) {
  const c = C.contact;
  const rows = c.cats.items
    .map(
      ([en, d], i) => `<li><a class="bl-crow" href="${inquiryHref(lang, "contact", CONTACT_CODES[i])}" data-analytics="babylog_contact_${CONTACT_CODES[i]}">
        <span class="bl-crow__n">${n2(i + 1)}</span>
        <strong class="bl-crow__t">${esc(en)}</strong>
        <span class="bl-crow__d">${esc(d)}</span>
        <span class="bl-crow__go">${esc(C.ui.ask)} ${ARROW}</span>
      </a></li>`
    )
    .join("");
  const info = c.info;
  const card = `<aside class="bl-ccard" aria-labelledby="bl-ccard-t">
      <p class="bl-ccard__k">${esc(info.kicker)}</p>
      <h3 class="bl-ccard__t" id="bl-ccard-t">${esc(info.name)}</h3>
      <p class="bl-ccard__mail"><a href="mailto:${esc(info.email)}">${esc(info.email)}</a></p>
      <div class="bl-ccard__act">
        <button type="button" class="nls-btn nls-btn--ghost bl-copy" data-bl-copy="${esc(info.email)}" data-bl-copied="${esc(C.ui.copied)}" hidden>${esc(C.ui.copy)}</button>
        <a class="nls-btn nls-btn--ghost" href="mailto:${esc(info.email)}">${esc(C.ui.mail)}</a>
      </div>
      <a class="nls-btn bl-ccard__form" href="${inquiryHref(lang, "contact", "")}">${esc(C.ui.form)} →</a>
      <p class="bl-ccard__note"><span class="bl-dot" aria-hidden="true"></span>${esc(info.note)}</p>
    </aside>`;

  const main = section(
    "bl-cats",
    "bl-contact",
    `${head(c.cats.kicker, c.cats.title, c.cats.lead, "bl-cats-title")}
    <div class="bl-cgrid">
      <div class="bl-ctable">
        <p class="bl-ctable__h" aria-hidden="true"><span>${esc(c.cats.cols[0])}</span><span>${esc(c.cats.cols[1])}</span><span>${esc(c.cats.cols[2])}</span></p>
        <ol class="bl-ctable__list">${rows}</ol>
      </div>
      ${card}
    </div>`
  );

  const g = c.guide;
  const guide = section(
    "bl-guide",
    "nls-block--band bl-guide",
    `${head(g.kicker, g.title, "", "bl-guide-title")}
    <ol class="bl-guide__list">${g.items.map(([t, d], i) => `<li><span>${n2(i + 1)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}</ol>
    ${emergency(C)}
    <p class="nls-note">${esc(C.ui.privacyNote)} <a class="bl-textlink" href="/${lang}/privacy/">${esc(C.ui.privacyLink)}</a></p>`
  );

  const cl = c.close;
  const ctas = `<a class="nls-btn" href="${inquiryHref(lang, "contact", "")}">${esc(cl.ctas[0])} →</a>
      <a class="nls-btn nls-btn--ghost" href="${pagePath(lang, "partnerships")}">${esc(cl.ctas[1])}</a>`;
  return {
    hero: hero(C, lang, "contact", c.hero, true),
    main: [main, guide, moreStrip(C, lang, "contact"), closeBlock(C, cl, ctas)].join("\n"),
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
    ${brandSign(C)}
  </div>
</section>`;
}
