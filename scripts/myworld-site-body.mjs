/**
 * MY WORLD business site — page bodies (scoped to #myworld-site.mws).
 *
 * 2026-10-25 redesign (below the hero only): a calm editorial product site on the white NEWON canvas.
 * MY WORLD blue (#1769FF / #1257D6) is a point colour. No ornaments (no globes, orbits, rings, route lines,
 * blobs or watermark numbers). Each section's layout is chosen for its content, and neighbours differ:
 *   split (statement left, rows right) · pairs (problem → answer) · bento · feats (hairline columns) ·
 *   tabs (journey, partner groups) · rail (cards; scroll-snap on phones) · table (comparison / payers /
 *   revenue) · band (tinted key section) · steps (real sequences only) · kanban (status) · quotes · faq.
 * Numbers are shown only for real sequences or existing IDs (area 01–25, revenue model 01–13, partner 01–18,
 * inquiry 01–16) — never as decoration.
 *
 * Information only: no booking, ordering, payment, sign-in, seller registration or record entry.
 */
import { escapeHtml as esc } from "./hub-utils.mjs";
import { MYWORLD_PAGES, myworldPagePath } from "./myworld-site-copy.mjs";
import { icon } from "./myworld-site-icons.mjs";
import { renderFlagshipSubnav, FLAGSHIP_PAGES } from "./flagship-subnav.mjs";
import { renderBizContact, ctaLabel, SEE_TYPES, TYPES_ID } from "./biz-contact-kit.mjs";
import { myworldContactModel } from "./biz-contact-data.mjs";
import { unifiedContactHref } from "./unified-contact-links.mjs";

export const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.newon.myworld&pcampaignid=web_share";
/** Same App Store listing the NEWON home/portfolio already links (scripts/six-businesses.mjs BUSINESS.myworld.stores.appStore). */
export const APP_STORE_URL = "https://apps.apple.com/kr/app/my-world-%EC%97%AC%ED%96%89%EC%A7%80%EB%8F%84-%EB%B0%A9%EB%AC%B8%EA%B5%AD%EA%B0%80/id6792314945";
const MAIL = "newon@newon.app";

const pad = (n) => String(n).padStart(2, "0");
const letter = (i) => String.fromCharCode(65 + i);
const lines = (s) => esc(s).split("\n").join("<br />");
const pageHref = (lang, id) => `/${lang}/${myworldPagePath(id)}`;
const arrow = `<span class="mws-arrow" aria-hidden="true">→</span>`;
/** Inquiry action → unified NEWON Contact page, MY WORLD preselected (owner, 2026-10-26). */
const ask = (lang, type, page) => unifiedContactHref(lang, "myworld", { type, source: `myworld-${page}` });
const ext = `<span class="mws-arrow" aria-hidden="true">↗</span>`;

/* ---------- atoms ---------- */
function badge(copy, status) {
  return `<span class="mws-badge mws-badge--${status}"><span class="mws-badge__dot" aria-hidden="true"></span>${esc(copy.ui.status[status])}</span>`;
}
function btn(href, label, { ghost = false, external = false } = {}) {
  const e = external ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a class="mws-btn${ghost ? " mws-btn--ghost" : ""}" href="${esc(href)}"${e}>${esc(label)} ${external ? ext : arrow}</a>`;
}
function chips(list, cls = "") {
  return `<ul class="mws-chips${cls ? ` ${cls}` : ""}">${list.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;
}
function itemCta(lang, copy, cta, topic) {
  if (cta === "app") return `<a class="mws-link" href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener noreferrer">${esc(copy.ui.appCta)} ${ext}</a>`;
  if (cta === "partner") return `<a class="mws-link" href="${esc(ask(lang, "partnership", "platform"))}">${esc(copy.ui.partnerCta)} ${arrow}</a>`;
  return `<a class="mws-link" href="${esc(ask(lang, "personal", "platform"))}">${esc(copy.ui.inquiryCta)} ${arrow}</a>`;
}
function notes(copy, keys) {
  return `<aside class="mws-notes" aria-label="${esc(copy.ui.notesAria)}">${keys.map((k) => `<p class="mws-note">${esc(copy.ui[k])}</p>`).join("")}</aside>`;
}
function head({ id, kicker, title, lead = "", note = "", cls = "" }) {
  const side = lead || note
    ? `<div class="mws-head__side">${lead ? `<p class="mws-lead">${esc(lead)}</p>` : ""}${note ? `<p class="mws-small">${esc(note)}</p>` : ""}</div>`
    : "";
  return `<div class="mws-head${side ? " mws-head--has-side" : ""}${cls ? ` ${cls}` : ""}">
        <div class="mws-head__main">${kicker ? `<p class="mws-kicker">${esc(kicker)}</p>` : ""}<h2 class="mws-title" id="${id}-title">${lines(title)}</h2></div>
        ${side}
      </div>`;
}
/** Section shell. tone: "" (white) · "tint" (light MY WORLD band). */
function section({ id, tone = "", cls = "", inner }) {
  const c = ["mws-sec", tone ? `mws-sec--${tone}` : "", cls].filter(Boolean).join(" ");
  return `<section class="${c}" id="${id}" aria-labelledby="${id}-title">
    <div class="mws__wrap">
      ${inner}
    </div>
  </section>`;
}
/** Asymmetric split: statement on the left, content on the right (no sticky heading). */
function split({ id, kicker, title, lead = "", note = "", aside = "", body, tone = "", cls = "" }) {
  return section({
    id, tone, cls,
    inner: `<div class="mws-split">
        <div class="mws-split__head">${head({ id, kicker, title, lead, note })}${aside}</div>
        <div class="mws-split__body">${body}</div>
      </div>`,
  });
}
/** Definition rows: name in the left column, text on the right. */
function defRows(items, { nameKey = "name", bodyKey = "body", cls = "" } = {}) {
  return `<ul class="mws-defs${cls ? ` ${cls}` : ""}">${items.map((it) => `<li${it.self ? ' class="is-self"' : ""}><h3 class="mws-defs__name">${esc(it[nameKey])}</h3><div class="mws-defs__main"><p class="mws-defs__body">${esc(it[bodyKey] || it.body || it.role)}</p>${it.tags ? `<p class="mws-defs__tags">${esc(it.tags)}</p>` : ""}</div></li>`).join("")}</ul>`;
}
/** Hairline feature columns (no boxes). */
function feats(items, { cols = 3, cls = "" } = {}) {
  return `<ul class="mws-feats mws-feats--${cols}${cls ? ` ${cls}` : ""}">${items.map((it) => `<li><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body || it.role)}</p>${it.tags ? `<p class="mws-tags">${esc(it.tags)}</p>` : ""}</li>`).join("")}</ul>`;
}
/** Numbered steps — only for real sequences. */
function steps(items, { cls = "", en = false } = {}) {
  return `<ol class="mws-steps${cls ? ` ${cls}` : ""}">${items.map((s, i) => `<li class="mws-step">
        <span class="mws-step__n">${pad(i + 1)}</span>
        ${en && s.en ? `<p class="mws-en">${esc(s.en)}</p>` : ""}
        <h3 class="mws-h3">${esc(s.name)}</h3>
        <p class="mws-body">${esc(s.body)}</p>
      </li>`).join("")}</ol>`;
}
function roadSteps(copy, r) {
  return `<ol class="mws-road">${r.items.map((s, i) => `<li class="mws-road__step${i === 0 ? " is-current" : ""}">
        <p class="mws-road__stage">${esc(s.stage)}${i === 0 ? ` <span class="mws-current">${esc(copy.ui.currentStage)}</span>` : ""}</p>
        <h3 class="mws-h3">${esc(s.name)}</h3>
        <p class="mws-body">${esc(s.body)}</p>
        ${s.scope ? `<p class="mws-road__scope"><span>${esc(r.scopeLabel)}</span>${esc(s.scope)}</p>` : ""}
      </li>`).join("")}</ol>`;
}
function faqList(items, cls = "") {
  return `<ul class="mws-faq${cls ? ` ${cls}` : ""}">${items.map((f) => `<li><details><summary><span class="mws-faq__text">${esc(f.q)}</span><span class="mws-faq__sign" aria-hidden="true"></span></summary><p class="mws-body">${esc(f.a)}</p></details></li>`).join("")}</ul>`;
}
/** FAQ — full-width heading row, then a two-column accordion on wide screens. */
function faqSection(fq, { tone = "" } = {}) {
  return section({
    id: "mws-faq", tone,
    inner: `${head({ id: "mws-faq", kicker: fq.kicker, title: fq.title, lead: fq.lead || "" })}${faqList(fq.items, "mws-faq--cols")}`,
  });
}
function nowNext(copy, now, next) {
  return `<dl class="mws-nn">
          <div class="mws-nn__now"><dt>${esc(copy.ui.nowLabel)}</dt><dd>${esc(now)}</dd></div>
          ${next ? `<div class="mws-nn__next"><dt>${esc(copy.ui.nextLabel)}</dt><dd>${esc(next)}</dd></div>` : ""}
        </dl>`;
}
function storeButtons(copy, { ghost = false } = {}) {
  return btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true, ghost }) + btn(APP_STORE_URL, copy.ui.appStoreCta, { external: true, ghost: true });
}
const dl = (pairs, cls = "mws-dl") => `<dl class="${cls}">${pairs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;

/* ---------- v4 visual atoms (2026-10-26) ----------
   Product-like mockups are built in HTML/CSS from existing copy only and always carry the "예시 화면 /
   Illustrative screen" caption — no metrics, users, prices or partners are shown in them. */
const tl = (s) => esc(String(s).replace(/\n/g, " "));
/** Phone-style app screen. */
function phone(copy, { label, status = "", body, cls = "" }) {
  return `<figure class="mws-mock mws-mock--phone${cls ? ` ${cls}` : ""}" aria-label="${esc(copy.ui.mockLabel)} · ${tl(label)}">
      <div class="mws-mock__screen">
        <div class="mws-mock__bar"><span class="mws-mock__brand" lang="en">${esc(copy.ui.brand)}</span>${status ? badge(copy, status) : ""}</div>
        ${body}
      </div>
      <figcaption class="mws-mock__cap">${esc(copy.ui.mockLabel)}</figcaption>
    </figure>`;
}
/** Desktop-window mockup (business tools). */
function windowMock(copy, { label, status = "", side, body }) {
  return `<figure class="mws-mock mws-mock--window" aria-label="${esc(copy.ui.mockLabel)} · ${tl(label)}">
      <div class="mws-mock__win">
        <div class="mws-mock__bar"><span class="mws-mock__brand" lang="en">${esc(copy.ui.brand)}</span><span class="mws-mock__path">${tl(label)}</span>${status ? badge(copy, status) : ""}</div>
        <div class="mws-mock__cols"><div class="mws-mock__side">${side}</div><div class="mws-mock__main">${body}</div></div>
      </div>
      <figcaption class="mws-mock__cap">${esc(copy.ui.mockLabel)}</figcaption>
    </figure>`;
}
const mockRows = (rows) => `<ul class="mws-mock__rows">${rows.map(([ic, text, sub]) => `<li><span class="mws-mock__ico">${icon(ic)}</span><span class="mws-mock__txt"><span>${esc(text)}</span>${sub ? `<small>${esc(sub)}</small>` : ""}</span></li>`).join("")}</ul>`;
/** Icon cards (bento). The first card can be the large lead. */
function iconCards(items, icons, { cls = "", lead = true, nameKey = "name", bodyKey = "body" } = {}) {
  return `<ul class="mws-icards${cls ? ` ${cls}` : ""}">${items.map((it, i) => `<li class="mws-icard${lead && i === 0 ? " mws-icard--lead" : ""}">
        <span class="mws-icard__ico">${icon(icons[i % icons.length])}</span>
        ${it.en ? `<p class="mws-en">${esc(it.en)}</p>` : ""}
        <h3 class="mws-h3${lead && i === 0 ? " mws-h3--xl" : " mws-h3--lg"}">${esc(it[nameKey])}</h3>
        <p class="mws-body">${esc(it[bodyKey] || it.body || it.role || it.lead)}</p>
        ${it.chips ? chips(it.chips, "mws-chips--soft") : ""}
        ${it.tags ? `<p class="mws-tags">${esc(it.tags)}</p>` : ""}
      </li>`).join("")}</ul>`;
}
/** Card rail: a balanced grid from 760px up (v5: no cut-off cards or scrollbar on desktop); a scroll-snap rail on phones.
 *  Keyboard: on phones the rail is a focusable scroll region. */
function snapRail(copy, title, cards) {
  return `<div class="mws-snap" role="region" tabindex="0" aria-label="${tl(title)} — ${esc(copy.ui.railAria)}"><ul class="mws-snap__list">${cards}</ul></div>`;
}
/** Full-bleed accent band (one per page). */
function accent({ id, inner, cls = "" }) {
  return section({ id, tone: "accent", cls, inner });
}

/* ---------- hero (shared flagship film hero — keep as is) ---------- */
/** Hero — the same dark film hero as the other flagship pages (PETLOG · BABYLOG · LIVON):
 *  wordmark, slogan, lead and two buttons. No art, kicker or stats. */
/** MY WORLD first-screen background film (owner-provided, 2026-10-18). */
const MYWORLD_FILM = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260407_043131_ebe2f0b5-9acc-4a4f-b2c1-7297f1a3beb9.mp4";

function hbtn(href, label, { ghost = false, external = false } = {}) {
  const e = external ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a class="nls-btn${ghost ? " nls-btn--ghost" : ""}" href="${esc(href)}"${e}>${esc(label)}${ghost ? "" : " →"}</a>`;
}
function hero(copy, h, { ctas = "" } = {}) {
  return `<section id="lifestage-detail" class="nls mws-film" data-story="myworld" aria-labelledby="story-myworld-title">
  <div class="nls-film" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${MYWORLD_FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${MYWORLD_FILM}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark" lang="en">${esc(copy.ui.brand)}</p>
        <h1 id="story-myworld-title" class="nls-film__slogan">${lines(h.title)}</h1>
        <p class="nls-film__lead">${esc(h.lead)}</p>
        ${ctas ? `<div class="nls-film__actions">${ctas}</div>` : ""}
      </div>
    </div>
  </div>
</section><!--mws-hero-end-->`;
}

/* ---------- page chrome ---------- */
function pager(lang, copy, current) {
  const i = MYWORLD_PAGES.indexOf(current);
  const nav = (id, dir) => {
    if (!id) return "<span></span>";
    const f = FLAGSHIP_PAGES.find((x) => x.id === id);
    const label = lang === "ko" ? `${f.en} · ${f.ko}` : f.en;
    return `<a class="mws-pager__link mws-pager__link--${dir}" href="${pageHref(lang, id)}"><span class="mws-pager__dir">${dir === "prev" ? "←" : ""} ${esc(dir === "prev" ? copy.ui.prev : copy.ui.next)} ${dir === "next" ? "→" : ""}</span><span class="mws-pager__name"><span class="mws-pager__n">${f.n}</span>${esc(label)}</span></a>`;
  };
  return `<nav class="mws-pager mws__wrap" aria-label="${esc(copy.ui.prev)} / ${esc(copy.ui.next)}">${nav(MYWORLD_PAGES[i - 1], "prev")}${nav(MYWORLD_PAGES[i + 1], "next")}</nav>`;
}

function closeBand(lang, copy, page = "overview") {
  const n = copy.overview.next;
  return `<section class="mws-close" aria-labelledby="mws-close-title">
    <div class="mws__wrap mws-close__inner">
      <p class="mws-close__kicker">${esc(n.kicker)}</p>
      <h2 class="mws-close__title" id="mws-close-title">${lines(n.title)}</h2>
      <p class="mws-close__lead">${esc(n.lead)}</p>
      <div class="mws-actions mws-actions--center">
        ${btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true })}
        ${btn(APP_STORE_URL, copy.ui.appStoreCta, { external: true, ghost: true })}
        ${btn(ask(lang, "partnership", page), copy.ui.partnerCta, { ghost: true })}
        ${btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true })}
      </div>
    </div>
  </section>`;
}

const STATUS_ORDER = ["live", "partial", "planned", "review"];

/* ================= 01 OVERVIEW ================= */
function overview(lang, copy) {
  const o = copy.overview;
  const h = hero(copy, o.hero, {
    ctas: hbtn(pageHref(lang, "platform"), copy.ui.platformCta) + hbtn(ask(lang, "business", "overview"), copy.ui.heroInquiryCta || copy.ui.contactCta, { ghost: true }),
  });

  // NOW — one quiet status line under the menu bar
  const now = `<div class="mws-now"><div class="mws__wrap mws-now__inner"><span class="mws-now__tag">${esc(o.now.kicker)}</span><p>${esc(o.now.text)}</p></div></div>`;

  // Definition — big statement left, the four platform layers as definition rows right
  const d = o.define;
  // Left column: an illustrative record screen built from the live feature names (fills the former empty half-column)
  const st0 = o.status;
  const recIcons = ["globe", "pin", "map", "book", "grid", "spark"];
  const v0 = o.values.items[0];
  const recordPhone = phone(copy, {
    label: d.items[0].name, status: "live", cls: "mws-mock--define",
    body: `<div class="mws-mock__hero"><p class="mws-mock__eyebrow" lang="en">${esc(v0.en)}</p><p class="mws-mock__title">${esc(v0.name)}</p>${chips(v0.chips, "mws-mock__chips")}</div>
        ${mockRows(st0.items.map((it, i) => [recIcons[i % recIcons.length], it.name]))}`,
  });
  const layerStatus = ["live", "partial", "review", "review"];
  const layerIcons = ["map", "plane", "bag", "building"];
  const define = section({
    id: "mws-define", cls: "mws-sec--first",
    inner: `<div class="mws-split mws-split--mock">
        <div class="mws-split__head">${head({ id: "mws-define", kicker: d.kicker, title: d.title, lead: d.lead })}
          <div class="mws-actions">${btn(pageHref(lang, "platform"), copy.ui.platformCta)}${btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true })}</div>
        </div>
        <div class="mws-split__body">
          <ol class="mws-layerlist">${d.items.map((it, i) => `<li class="mws-layerlist__item mws-layerlist__item--${layerStatus[i] || "review"}">
            <span class="mws-layerlist__ico">${icon(layerIcons[i % layerIcons.length])}</span>
            <div class="mws-layerlist__main"><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p>${it.tags ? `<p class="mws-layerlist__tag"><span class="mws-layerlist__dot" aria-hidden="true"></span>${esc(it.tags)}</p>` : ""}</div>
          </li>`).join("")}</ol>
        </div>
        <div class="mws-split__mock">${recordPhone}</div>
      </div>`,
  });

  // Problem → answer — paired cards: the problem on top, MY WORLD's answer underneath
  const pb = o.problems;
  const problems = section({
    id: "mws-problems",
    inner: `${head({ id: "mws-problems", kicker: pb.kicker, title: pb.title, lead: pb.lead, cls: "mws-head--wide" })}
      <ul class="mws-pairs">${pb.items.map((it) => `<li class="mws-pair">
        <div class="mws-pair__q">
          <p class="mws-label">${esc(copy.ui.problemLabel)}</p>
          <h3 class="mws-h3 mws-h3--lg">${esc(it.problem)}</h3>
          <p class="mws-body">${esc(it.body)}</p>
        </div>
        <div class="mws-pair__a">
          <p class="mws-label mws-label--blue">${esc(copy.ui.answerLabel)}</p>
          <p class="mws-pair__answer">${esc(it.answer)}</p>
        </div>
      </li>`).join("")}</ul>`,
  });

  // Core values — bento: the map value as the large tile
  const v = o.values;
  const values = section({
    id: "mws-values", tone: "tint",
    inner: `${head({ id: "mws-values", kicker: v.kicker, title: v.title, lead: v.lead })}
      <ul class="mws-bento">${v.items.map((c, i) => i === 0
        ? `<li class="mws-bento__cell mws-bento__cell--lead">
          <div class="mws-bento__text">
            <span class="mws-bento__ico">${icon("map")}</span>
            <p class="mws-en">${esc(c.en)}</p>
            <h3 class="mws-h3 mws-h3--xl">${esc(c.name)}</h3>
            <p class="mws-body">${esc(c.lead)}</p>
          </div>
          <ul class="mws-bento__marks">${c.chips.map((t) => `<li><span class="mws-bento__tick" aria-hidden="true">${icon("check")}</span>${esc(t)}</li>`).join("")}</ul>
      </li>`
        : `<li class="mws-bento__cell">
          <span class="mws-bento__ico">${icon(["map", "wallet", "flag", "shield", "chat"][i % 5])}</span>
          <p class="mws-en">${esc(c.en)}</p>
          <h3 class="mws-h3 mws-h3--lg">${esc(c.name)}</h3>
          <p class="mws-body">${esc(c.lead)}</p>
          ${chips(c.chips, "mws-chips--soft")}
      </li>`).join("")}</ul>`,
  });

  // Customers — three hairline columns
  const cu = o.customers;
  const customers = section({
    id: "mws-customers",
    inner: `${head({ id: "mws-customers", kicker: cu.kicker, title: cu.title, lead: cu.lead, note: cu.note, cls: "mws-head--wide" })}
      <ul class="mws-people">${cu.items.map((it, i) => `<li class="mws-people__item${i === 0 ? " mws-people__item--lead" : ""}"><span class="mws-people__ico">${icon(["users", "book", "users", "camera", "briefcase", "building"][i % 6])}</span><div><h3 class="mws-h3${i === 0 ? " mws-h3--xl" : ""}">${esc(it.name)}</h3><p class="mws-body">${esc(it.body || it.role)}</p></div></li>`).join("")}</ul>`,
  });

  // Journey — segmented tabs (a real six-step sequence); each panel states what the app does today
  const j = o.journey;
  const tabs = j.items
    .map((s, i) => `<button type="button" class="mws-tab" role="tab" id="mws-tab-${s.id}" aria-controls="mws-panel-${s.id}" aria-selected="${i === 4}" tabindex="${i === 4 ? 0 : -1}"><span class="mws-tab__n">${pad(i + 1)}</span><span class="mws-tab__name">${esc(s.name)}</span>${s.status === "live" ? `<span class="mws-tab__live" aria-hidden="true"></span>` : ""}</button>`)
    .join("");
  const panels = j.items
    .map((s, i) => `<div class="mws-panel mws-panel--${s.status}" role="tabpanel" id="mws-panel-${s.id}" aria-labelledby="mws-tab-${s.id}"${i === 4 ? "" : " data-hidden"}>
        <div class="mws-panel__body">
          <p class="mws-en">${pad(i + 1)} · ${esc(s.en)}</p>
          <h3 class="mws-h3 mws-h3--xl">${esc(s.head)}</h3>
          <p class="mws-body mws-body--lg">${esc(s.lead)}</p>
          ${s.more ? `<p class="mws-body">${esc(s.more)}</p>` : ""}
          ${chips(s.chips)}
        </div>
        <div class="mws-panel__now">
          <p class="mws-label${s.status === "live" ? " mws-label--blue" : ""}">${esc(copy.ui.nowLabel)}</p>
          <p class="mws-panel__nowtext">${esc(s.now)}</p>
        </div>
      </div>`)
    .join("");
  const journey = section({
    id: "mws-journey",
    inner: `${head({ id: "mws-journey", kicker: j.kicker, title: j.title, lead: j.lead, cls: "mws-head--wide" })}
      <div class="mws-tabs" data-mws-tabs>
        <div class="mws-tabs__list" role="tablist" aria-label="${esc(copy.ui.tabsAria)}">${tabs}</div>
        ${panels}
      </div>
      <p class="mws-small">${esc(j.note)}</p>`,
  });

  // Use cases — card rail (grid on desktop, scroll-snap on phones)
  const sc = o.scenes;
  const scenes = section({
    id: "mws-scenes",
    inner: `${head({ id: "mws-scenes", kicker: sc.kicker, title: sc.title, lead: sc.lead })}
      ${snapRail(copy, sc.title, sc.items.map((it, i) => `<li class="mws-snap__card"><div class="mws-snap__top"><span class="mws-snap__ico">${icon(["plane", "calendar", "flag", "suitcase", "users", "bed"][i % 6])}</span><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3></div><p class="mws-body">${esc(it.body)}</p></li>`).join(""))}`,
  });

  // Differentiation — comparison table: the existing way vs MY WORLD
  const cp = o.compare;
  const compare = section({
    id: "mws-compare",
    inner: `${head({ id: "mws-compare", kicker: cp.kicker, title: cp.title, lead: cp.lead, cls: "mws-head--wide" })}
      <div class="mws-vs" role="table" aria-labelledby="mws-compare-title">
        <div class="mws-vs__row mws-vs__row--head" role="row"><span role="columnheader">${esc(copy.ui.altLabel)}</span><span role="columnheader" lang="en">${esc(copy.ui.brand)}</span></div>
        ${cp.items.map((it) => `<div class="mws-vs__row" role="row">
          <div class="mws-vs__alt" role="cell"><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></div>
          <div class="mws-vs__us" role="cell"><span class="mws-vs__mark" aria-hidden="true">${icon("check")}</span><p>${esc(it.answer)}</p></div>
        </div>`).join("")}
      </div>`,
  });

  // Current status — full-bleed tinted band: what the app does today, then the other status groups
  const st = o.status;
  const status = section({
    id: "mws-status", tone: "band",
    inner: `<div class="mws-live">
        <div class="mws-live__head">
          ${head({ id: "mws-status", kicker: st.kicker, title: st.title, lead: st.lead })}
          <div class="mws-actions">${storeButtons(copy)}</div>
        </div>
        <div class="mws-live__panel">
          <p class="mws-live__badge">${badge(copy, "live")}</p>
          <ul class="mws-live__list">${st.items.map((it) => `<li><span class="mws-live__ico" aria-hidden="true">${icon("check")}</span><div><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></div></li>`).join("")}</ul>
        </div>
      </div>
      <ul class="mws-later">${st.groups.map((g) => `<li class="mws-later__col">${badge(copy, g.status)}<h3 class="mws-h3">${esc(g.name)}</h3><p class="mws-body">${esc(g.body)}</p><p class="mws-tags">${g.chips.map(esc).join(" · ")}</p></li>`).join("")}</ul>`,
  });

  // Global vision — split + definition rows (the world map leads; plan, not current service)
  const gv = o.global;
  const globalVision = section({
    id: "mws-global",
    inner: `${head({ id: "mws-global", kicker: gv.kicker, title: gv.title, lead: gv.lead, note: gv.note, cls: "mws-head--wide" })}${iconCards(gv.items, ["map", "chat", "users", "briefcase"], { cls: "mws-icards--quad mws-icards--row4", lead: false })}`,
  });

  // Long-term vision — priority steps (a real order)
  const r = o.roadmap;
  const roadmap = section({
    id: "mws-roadmap",
    inner: `${head({ id: "mws-roadmap", kicker: r.kicker, title: r.title, lead: r.lead, note: r.note, cls: "mws-head--wide" })}${roadSteps(copy, r)}`,
  });

  // NEWON — split + compact platform list (MY WORLD highlighted)
  const nw = o.newon;
  const newon = section({
    id: "mws-newon",
    inner: `${head({ id: "mws-newon", kicker: nw.kicker, title: nw.title, lead: nw.lead, note: nw.note })}${defRows(nw.items, { bodyKey: "role", cls: "mws-defs--grid mws-defs--grid3 mws-defs--dir" })}`,
  });

  // FAQ — split + accordion
  const faq = faqSection(o.faq);

  return [h, now, define, problems, values, customers, journey, scenes, compare, status, globalVision, roadmap, newon, faq,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy, "overview")].join("\n");
}

/* ================= 02 PLATFORM ================= */
function platform(lang, copy) {
  const p = copy.platform;
  const h = hero(copy, p.hero, {
    ctas: hbtn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true }) + hbtn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });

  // The app today — asymmetric split: an illustrative trip-record screen (areas 02 + 03, both live) beside the six live capabilities
  const a2 = p.items[1], a3 = p.items[2];
  const tripPhone = phone(copy, {
    label: a2.name, status: "live", cls: "mws-mock--trip",
    body: `<div class="mws-mock__hero"><p class="mws-mock__eyebrow" lang="en">${esc(a2.en)}</p><p class="mws-mock__title">${esc(a2.name)}</p></div>
        ${mockRows(a2.features.map((f, i) => [["camera", "pin", "map", "book"][i % 4], f]))}
        <div class="mws-mock__card"><p class="mws-mock__eyebrow" lang="en">${esc(a3.en)}</p><p class="mws-mock__sub">${esc(a3.name)}</p>
          <ul class="mws-mock__grid">${a3.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>`,
  });
  const shots = section({
    id: "mws-shots", cls: "mws-sec--first",
    inner: `<div class="mws-showcase">
        <div class="mws-showcase__mock">${tripPhone}</div>
        <div class="mws-showcase__main">
          ${head({ id: "mws-shots", kicker: p.shotsKicker, title: p.shotsTitle })}
          <ul class="mws-caps">${p.shots.map((s) => `<li><span class="mws-ico-box">${icon(s.icon)}</span><div><p class="mws-tile__text">${esc(s.text)}</p>${s.body ? `<p class="mws-tile__body">${esc(s.body)}</p>` : ""}</div></li>`).join("")}</ul>
          <div class="mws-actions">${storeButtons(copy)}</div>
        </div>
      </div>`,
  });

  // 25 areas — v5: every group is always visible (no one-at-a-time tabs): a group header, then full-width area rows
  // (id · description · features · now/next). Status is written in the "now / next" block, not as badges.
  const svcCard = (s, n) => `<li class="mws-area" id="mws-svc-${n}">
      <div class="mws-area__id"><span class="mws-ico-box">${icon(s.icon)}</span><span class="mws-area__n">${pad(n)}</span></div>
      <div class="mws-area__main">
        <p class="mws-en">${esc(s.en)}</p>
        <h4 class="mws-h3 mws-h3--lg">${esc(s.name)}</h4>
        <p class="mws-body">${esc(s.desc)}</p>
        <p class="mws-area__target"><span class="mws-label">${esc(copy.ui.targetLabel)}</span>${esc(s.target)}</p>
      </div>
      <div class="mws-area__feats">
        <p class="mws-label">${esc(copy.ui.featuresLabel)}</p>
        ${chips(s.features)}
        ${s.plan ? `<p class="mws-label">${esc(copy.ui.planLabel)}</p>${chips(s.plan, "mws-chips--plan")}` : ""}
      </div>
      <div class="mws-area__status">
        ${nowNext(copy, s.now, s.next)}
        <p class="mws-area__cta">${itemCta(lang, copy, s.cta, s.name)}</p>
      </div>
    </li>`;
  const groups = p.groups.map((g, gi) => `<section class="mws-agroup" id="mws-group-${gi + 1}" aria-labelledby="mws-group-${gi + 1}-title">
      <div class="mws-agroup__head"><span class="mws-letter mws-letter--lg">${letter(gi)}</span><div class="mws-agroup__title"><p class="mws-en">${esc(g.en)} · ${pad(g.items.length)}</p><h3 class="mws-gtitle" id="mws-group-${gi + 1}-title">${esc(g.name)}</h3></div><div class="mws-agroup__text"><p class="mws-body mws-body--ink">${esc(g.lead)}</p>${g.intro ? `<p class="mws-body">${esc(g.intro)}</p>` : ""}</div></div>
      <ol class="mws-areas">${g.items.map((n) => svcCard(p.items[n - 1], n)).join("")}</ol>
    </section>`).join("");
  const list = section({
    id: "mws-services",
    inner: `${head({ id: "mws-services", kicker: p.indexKicker, title: p.indexTitle, lead: p.indexLead, cls: "mws-head--wide" })}
      <ol class="mws-pindex mws-pindex--5">${p.groups.map((g, gi) => `<li><a href="#mws-group-${gi + 1}"><span class="mws-letter">${letter(gi)}</span><span class="mws-pindex__name">${esc(g.name)}</span><span class="mws-count">${pad(g.items.length)}</span></a></li>`).join("")}</ol>
      <div class="mws-agroups">${groups}</div>`,
  });

  // Now & next — v5: a 25-cell area map (01–25 in plan order), each cell marked by status, then the four status groups
  const sb = p.statusBoard;
  const byStatus = STATUS_ORDER.map((st) => ({ st, nums: p.items.map((s, i) => (s.status === st ? i + 1 : 0)).filter(Boolean) }));
  const statusBoard = section({
    id: "mws-now", tone: "tint",
    inner: `${head({ id: "mws-now", kicker: sb.kicker, title: sb.title, lead: sb.lead, cls: "mws-head--wide" })}
      <ol class="mws-amap" aria-label="${tl(sb.title)}">${p.items.map((s, i) => `<li class="mws-amap__cell mws-amap__cell--${s.status}"><a href="#mws-svc-${i + 1}"><span class="mws-amap__n">${pad(i + 1)}</span><span class="mws-amap__name">${esc(s.name)}</span><span class="mws-sr"> · ${esc(copy.ui.status[s.status])}</span></a></li>`).join("")}</ol>
      <ul class="mws-amap__legend">${byStatus.map(({ st, nums }) => `<li class="mws-amap__key mws-amap__key--${st}">
        <div class="mws-amap__keytop"><span class="mws-amap__swatch" aria-hidden="true"></span>${badge(copy, st)}<span class="mws-count">${pad(nums.length)}</span></div>
        <p class="mws-body">${esc(sb.groups[st])}</p>
      </li>`).join("")}</ul>`,
  });

  // Global expansion — split: localisation checks under the heading, services to take abroad as rows
  const gl = p.global;
  const globalExp = split({
    id: "mws-global", kicker: gl.kicker, title: gl.title, lead: gl.lead, note: gl.note,
    aside: `<div class="mws-checkcard"><p class="mws-label mws-label--blue">${esc(gl.localLabel)}</p><ul class="mws-checkcard__list">${gl.local.map((t) => `<li><span class="mws-checks__ico">${icon("check")}</span>${esc(t)}</li>`).join("")}</ul></div>`,
    body: defRows(gl.items),
  });

  // How features connect — a six-step cycle
  const f = p.flow;
  const flow = section({
    id: "mws-flow",
    inner: `${head({ id: "mws-flow", kicker: f.kicker, title: f.title, lead: f.lead, note: f.note, cls: "mws-head--wide" })}${steps(f.items, { cls: "mws-steps--cycle mws-steps--line" })}`,
  });

  // Scenarios — 2×2 cards: persona, the steps as a chain, now / later
  const sc = p.scenarios;
  const scenarios = section({
    id: "mws-scenarios",
    inner: `${head({ id: "mws-scenarios", kicker: sc.kicker, title: sc.title, lead: sc.lead })}
      <ul class="mws-cards mws-cards--2">${sc.items.map((it) => `<li class="mws-card">
        <p class="mws-tag">${esc(it.persona)}</p>
        <h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3>
        <ol class="mws-chain">${it.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        ${nowNext(copy, it.now, it.later)}
      </li>`).join("")}</ul>`,
  });

  // User types — split + definition rows
  const u = p.users;
  const users = section({
    id: "mws-users",
    inner: `${head({ id: "mws-users", kicker: u.kicker, title: u.title, lead: u.lead, note: u.note, cls: "mws-head--wide" })}
      <ul class="mws-roles">${u.items.map((it, i) => `<li><span class="mws-roles__ico">${icon(["pin", "spark", "users", "camera", "briefcase", "building"][i % 6])}</span><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.role || it.body)}</p></li>`).join("")}</ul>`,
  });

  // Privacy & trust — four hairline columns
  const t = p.trust;
  const trust = section({
    id: "mws-trust",
    inner: `${head({ id: "mws-trust", kicker: t.kicker, title: t.title, lead: t.lead, cls: "mws-head--wide" })}${feats(t.items, { cols: 4, cls: "mws-feats--check" })}`,
  });

  // App guide — tinted band, five numbered steps
  const g = p.guide;
  const guide = accent({
    id: "mws-guide",
    inner: `<div class="mws-rowhead">${head({ id: "mws-guide", kicker: g.kicker, title: g.title, lead: g.lead, note: g.note })}<div class="mws-actions">${storeButtons(copy)}</div></div>
      ${steps(g.steps, { cls: "mws-steps--big", en: true })}`,
  });

  // FAQ — split + accordion
  const faq = faqSection(p.faq);

  return [h, shots, list, statusBoard, globalExp, flow, scenarios, users, trust, guide, faq,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy, "platform")].join("\n");
}

/* ================= 03 BUSINESS ================= */
function business(lang, copy) {
  const b = copy.business;
  const h = hero(copy, b.hero, {
    ctas: hbtn(ask(lang, "partnership", "business"), copy.ui.partnerCta, {}) + hbtn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });

  // Model overview — four platform layers in the order the lead describes
  const m = b.model;
  const model = section({
    id: "mws-model", cls: "mws-sec--first",
    inner: `${head({ id: "mws-model", kicker: m.kicker, title: m.title, lead: m.lead, cls: "mws-head--wide" })}
      <ol class="mws-layers">${m.items.map((it, i) => `<li class="mws-layer"><span class="mws-layer__ico">${icon(["map", "plane", "bag", "building"][i % 4])}</span><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p>${i < m.items.length - 1 ? `<span class="mws-layer__to" aria-hidden="true">${icon("arrow")}</span>` : ""}</li>`).join("")}</ol>`,
  });

  // Who pays — clean data table
  const py = b.payers;
  const payers = section({
    id: "mws-payers", tone: "tint",
    inner: `${head({ id: "mws-payers", kicker: py.kicker, title: py.title, lead: py.lead })}
        <table class="mws-table mws-table--payers">
          <caption class="mws-sr">${esc(py.title.replace(/\n/g, " "))}</caption>
          <thead><tr><th scope="col"><span class="mws-sr" lang="en">${esc(py.kicker)}</span></th><th scope="col">${esc(copy.ui.payerLabel)}</th><th scope="col">${esc(copy.ui.revenueLabel)}</th></tr></thead>
          <tbody>${py.items.map((it) => `<tr><th scope="row" lang="en">${esc(it.name)}</th><td data-label="${esc(copy.ui.payerLabel)}">${esc(it.target)}</td><td data-label="${esc(copy.ui.revenueLabel)}">${esc(it.how)}</td></tr>`).join("")}</tbody>
        </table>`,
  });

  // 8 groups · 20 business lines — tiles; each line jumps to its revenue model
  const groupsIdx = section({
    id: "mws-groups",
    inner: `${head({ id: "mws-groups", kicker: b.groupsKicker, title: b.groupsTitle, lead: b.groupsLead })}
      <ol class="mws-gtiles">${b.groups.map((g) => `<li class="mws-gtile">
        <p class="mws-en">${esc(g.en)}</p>
        <h3 class="mws-h3">${esc(g.name)}</h3>
        <p class="mws-body">${esc(g.lead)}</p>
        <ul class="mws-golinks">${g.lines.map((n) => `<li><a href="#mws-rev-${b.lines[n - 1].rev}">${esc(b.lines[n - 1].name)}<span class="mws-golinks__to" aria-hidden="true">${pad(b.lines[n - 1].rev)}</span></a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });

  // 13 revenue models — grouped by activation stage (a real sequence); each stage is a table
  const rv = b.revenue;
  const cols = [[copy.ui.payerLabel, "payer"], [copy.ui.revenueLabel, "how"], [copy.ui.valueLabel, "value"], [copy.ui.nowLabel, "now"]];
  const stages = rv.stages.map((g, gi) => `<section class="mws-stage${gi === 0 ? " is-current" : ""}" id="mws-stage-${gi + 1}" aria-labelledby="mws-stage-${gi + 1}-title">
      <div class="mws-stage__head"><p class="mws-stage__en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-stage-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-body">${esc(g.lead)}</p></div>
      <table class="mws-table mws-table--rev">
        <thead><tr><th scope="col"><span class="mws-sr">#</span></th><th scope="col"><span class="mws-sr">${esc(rv.kicker)}</span></th>${cols.map(([k]) => `<th scope="col">${esc(k)}</th>`).join("")}</tr></thead>
        <tbody>${g.items.map((n) => {
          const l = rv.items[n - 1];
          return `<tr id="mws-rev-${n}"><td class="mws-table__n">${pad(n)}</td><th scope="row"><span class="mws-en">${esc(l.en)}</span><span class="mws-table__name">${esc(l.name)}</span></th>${cols.map(([k, key]) => `<td data-label="${esc(k)}">${esc(l[key])}</td>`).join("")}</tr>`;
        }).join("")}</tbody>
      </table>
    </section>`).join("");
  const revenue = section({
    id: "mws-revenue",
    inner: `${head({ id: "mws-revenue", kicker: rv.kicker, title: rv.title, lead: rv.lead, cls: "mws-head--wide" })}${stages}${notes(copy, ["priceNote", "partnerNote"])}`,
  });

  // Subscription — three plan cards (no prices)
  const su = b.subscription;
  const subscription = section({
    id: "mws-subscription", tone: "tint",
    inner: `${head({ id: "mws-subscription", kicker: su.kicker, title: su.title, lead: su.lead, cls: "mws-head--wide" })}
      <ul class="mws-plans">${su.items.map((it) => `<li class="mws-plan"><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p><p class="mws-tags">${esc(it.tags)}</p></li>`).join("")}</ul>`,
  });

  // Booking & brokerage principles — large statements
  const de = b.deals;
  const deals = accent({
    id: "mws-deals",
    inner: `${head({ id: "mws-deals", kicker: de.kicker, title: de.title })}
      <ul class="mws-quotes">${de.items.map((t) => `<li><p>${esc(t)}</p></li>`).join("")}</ul>`,
  });

  // Business & institution tools — tinted panel: heading + module grid
  const s = b.saas;
  const saas = section({
    id: "mws-saas",
    inner: `${head({ id: "mws-saas", kicker: s.kicker, title: s.title, lead: s.lead, cls: "mws-head--wide" })}
      <div class="mws-saas5">
        <div class="mws-saas5__mock">${windowMock(copy, {
          label: s.kicker, status: "review",
          side: `<ul class="mws-mock__nav">${s.items.map((it, i) => `<li${i === 0 ? ' class="is-on"' : ""} lang="en">${esc(it.name)}</li>`).join("")}</ul>`,
          body: `<ul class="mws-modules">${s.items.map((it) => `<li><h3 class="mws-h4" lang="en">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ul>`,
        })}</div>
      <div class="mws-who">
        <h3 class="mws-h3 mws-who__title">${esc(s.whoTitle)}</h3>
        <table class="mws-table mws-table--who">
          <caption class="mws-sr">${esc(s.whoTitle)}</caption>
          <thead><tr><th scope="col">${esc(copy.ui.customersLabel)}</th><th scope="col">${esc(copy.ui.featuresLabel)}</th></tr></thead>
          <tbody>${s.who.map((it) => `<tr><th scope="row">${esc(it.name)}</th><td data-label="${esc(copy.ui.featuresLabel)}">${esc(it.body)}</td></tr>`).join("")}</tbody>
        </table>
        <p class="mws-small">${esc(s.whoNote)}</p>
      </div>
      </div>`,
  });

  // Market opportunity — split + definition rows
  const mk = b.market;
  const market = section({
    id: "mws-market",
    inner: `${head({ id: "mws-market", kicker: mk.kicker, title: mk.title, lead: mk.lead, cls: "mws-head--wide" })}
      <ol class="mws-statements">${mk.items.map((it) => `<li><h3 class="mws-statements__h">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ol>`,
  });

  // Differentiation hypotheses — v5: four outlined icon cards in one row (the market section above stays as statements)
  const df = b.diff;
  const diff = section({
    id: "mws-diff",
    inner: `${head({ id: "mws-diff", kicker: df.kicker, title: df.title, lead: df.lead, note: df.note, cls: "mws-head--wide" })}
      ${iconCards(df.items, ["map", "plane", "spark", "users"], { cls: "mws-icards--four mws-icards--hyp", lead: false })}`,
  });

  // Go-to-market — four columns + beachhead pull statement
  const gt = b.gtm;
  const gtm = section({
    id: "mws-gtm",
    inner: `${head({ id: "mws-gtm", kicker: gt.kicker, title: gt.title, lead: gt.lead })}
      ${feats(gt.items, { cols: 4 })}
      <figure class="mws-pull"><figcaption lang="en">BEACHHEAD</figcaption><blockquote><p>${esc(gt.callout)}</p></blockquote></figure>`,
  });

  // Roadmap — tinted band, staged steps
  const r = b.roadmap;
  const roadmap = section({
    id: "mws-roadmap", tone: "tint",
    inner: `${head({ id: "mws-roadmap", kicker: r.kicker, title: r.title, lead: r.lead, note: r.note, cls: "mws-head--wide" })}${roadSteps(copy, r)}`,
  });

  // Global strategy — customer groups / entry / revenue columns, then the five expansion phases (a real sequence)
  const gs = b.global;
  const globalStrat = section({
    id: "mws-global",
    inner: `${head({ id: "mws-global", kicker: gs.kicker, title: gs.title, lead: gs.lead, note: gs.note, cls: "mws-head--wide" })}${feats(gs.items, { cols: 3 })}
      <p class="mws-label">${esc(gs.phasesLabel)}</p>${steps(gs.phases, { cls: "mws-steps--big", en: true })}`,
  });

  // Operations & legal — three compact hairline columns
  const t = b.trust;
  const trust = section({
    id: "mws-trust",
    inner: `${head({ id: "mws-trust", kicker: t.kicker, title: t.title, lead: t.lead, cls: "mws-head--wide" })}${defRows(t.items, { cls: "mws-defs--cols2" })}
      <div class="mws-actions">${btn(ask(lang, "partnership", "business"), copy.ui.partnerCta)}${btn(ask(lang, "business", "business"), copy.ui.inquiryCta, { ghost: true })}</div>`,
  });

  // FAQ — split + accordion
  const faq = faqSection(b.faq);

  return [h, model, payers, groupsIdx, revenue, subscription, deals, saas, market, diff, gtm, roadmap, globalStrat, trust, faq,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy, "business")].join("\n");
}

/* ================= 04 PARTNERSHIPS ================= */
function partnerships(lang, copy) {
  const p = copy.partnerships;
  const h = hero(copy, p.hero, {
    ctas: hbtn(ask(lang, "partnership", "partnerships"), copy.ui.partnerCta, {}) + hbtn(pageHref(lang, "business"), copy.ui.businessCta, { ghost: true }),
  });

  // Vision — large-type statement: first statement leads, the others follow in columns
  // + an illustrative plan screen: how a clearly labelled partner card would sit inside a trip plan (planned, not live)
  const plan = copy.overview.journey.items[1];
  const m0 = p.models.items[0];
  const adLabel = copy.overview.values.items[4].chips[0];
  const planPhone = phone(copy, {
    label: plan.name, cls: "mws-mock--plan",
    body: `<div class="mws-mock__hero"><p class="mws-mock__eyebrow" lang="en">${esc(plan.en)}</p><p class="mws-mock__title">${esc(plan.head)}</p></div>
        ${mockRows(plan.chips.slice(0, 4).map((c, i) => [["calendar", "check", "wallet", "flag"][i % 4], c]))}
        <div class="mws-mock__card mws-mock__card--partner"><p class="mws-mock__tags"><span class="mws-mock__flag">${esc(adLabel)}</span>${badge(copy, "planned")}</p><p class="mws-mock__sub">${esc(m0.name)}</p><p class="mws-mock__note">${esc(m0.tags)}</p></div>`,
  });
  const why = section({
    id: "mws-why", cls: "mws-sec--first",
    inner: `<div class="mws-whygrid">
        <div class="mws-whygrid__main">${head({ id: "mws-why", kicker: p.why.kicker, title: p.why.title, cls: "mws-head--wide" })}
          <div class="mws-vision"><p class="mws-vision__lead">${esc(p.why.items[0])}</p>
            <ul class="mws-vision__rest">${p.why.items.slice(1).map((t) => `<li><p>${esc(t)}</p></li>`).join("")}</ul></div>
        </div>
        <div class="mws-whygrid__mock">${planPhone}</div>
      </div>`,
  });

  // Models — six hairline columns
  const models = section({
    id: "mws-models",
    inner: `${head({ id: "mws-models", kicker: p.models.kicker, title: p.models.title })}${iconCards(p.models.items, ["ticket", "bag", "book", "flag", "code", "globe"], { cls: "mws-icards--six" })}`,
  });

  // Partner types — v5: all 18 always visible: one comparison table per group (partner numbers = existing IDs);
  // the five facts are columns on wide screens and labelled rows on phones.
  const pcols = [[copy.ui.targetLabel, "target"], [copy.ui.collabLabel, "collab"], [copy.ui.valueLabel, "value"], [copy.ui.revenueLabel, "revenue"], [copy.ui.termsLabel, "terms"]];
  const prow = (t, n) => `<tr id="mws-partner-${n}">
      <th scope="row"><span class="mws-ptable__who"><span class="mws-ico-box">${icon(t.icon)}</span><span><span class="mws-ptable__meta"><span class="mws-pcard__n">${pad(n)}</span><span class="mws-tag">${esc(t.field)}</span></span><span class="mws-ptable__name">${esc(t.name)}</span></span></span></th>
      ${pcols.map(([k, key]) => `<td data-label="${esc(k)}">${esc(t[key])}</td>`).join("")}
    </tr>`;
  const types = section({
    id: "mws-partners",
    inner: `${head({ id: "mws-partners", kicker: p.typesKicker, title: p.typesTitle })}
      <ol class="mws-pindex">${p.groups.map((g, gi) => `<li><a href="#mws-pgroup-${gi + 1}"><span class="mws-letter">${letter(gi)}</span><span class="mws-pindex__name">${esc(g.name)}</span><span class="mws-count">${pad(g.items.length)}</span></a></li>`).join("")}</ol>
      ${p.groups.map((g, gi) => `<section class="mws-pgroup" id="mws-pgroup-${gi + 1}" aria-labelledby="mws-pgroup-${gi + 1}-title">
          <div class="mws-pgroup__head"><span class="mws-letter">${letter(gi)}</span><h3 class="mws-gtitle" id="mws-pgroup-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-en">${esc(g.en)}</p><span class="mws-count">${pad(g.items.length)}</span><a class="mws-link mws-pgroup__cta" href="${esc(ask(lang, "partnership", "partnerships"))}">${esc(copy.ui.partnerCta)} ${arrow}</a></div>
          ${g.lead ? `<p class="mws-body mws-pgroup__lead">${esc(g.lead)}</p>` : ""}
          <table class="mws-table mws-ptable">
            <caption class="mws-sr">${esc(g.name)}</caption>
            <thead><tr><th scope="col">${esc(copy.ui.partnersLabel)}</th>${pcols.map(([k]) => `<th scope="col">${esc(k)}</th>`).join("")}</tr></thead>
            <tbody>${g.items.map((n) => prow(p.items[n - 1], n)).join("")}</tbody>
          </table>
        </section>`).join("")}
      ${notes(copy, ["priceNote", "partnerNote"])}`,
  });

  // Scenarios — editorial rows + campaign idea cloud
  const sc = p.scenarios;
  const scenarios = section({
    id: "mws-scenarios",
    inner: `${head({ id: "mws-scenarios", kicker: sc.kicker, title: sc.title, lead: sc.lead, cls: "mws-head--wide" })}
      <ul class="mws-xrows">${sc.items.map((it) => `<li>
        <div class="mws-xrows__side"><p class="mws-tag">${esc(it.partner)}</p><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3></div>
        <div class="mws-xrows__main"><p class="mws-body mws-body--lg">${esc(it.body)}</p>${chips(it.chips)}</div>
      </li>`).join("")}</ul>
      <div class="mws-ideas"><p class="mws-label">${esc(sc.campaignsTitle)}</p><ul class="mws-ideas__grid">${sc.campaigns.map((c, i) => `<li><span class="mws-ideas__ico">${icon(["flag", "globe", "plane", "calendar", "pin", "camera", "map", "spark"][i % 8])}</span>${esc(c)}</li>`).join("")}</ul></div>`,
  });

  // Global partnerships — split: overseas partner kinds and collaboration possibilities; inquiry → unified Contact page
  const gp = p.global;
  const globalPart = section({
    id: "mws-global",
    inner: `<div class="mws-rowhead">${head({ id: "mws-global", kicker: gp.kicker, title: gp.title, lead: gp.lead, note: gp.note, cls: "mws-head--wide" })}<div class="mws-actions">${btn(ask(lang, "partnership", "partnerships"), gp.cta)}</div></div>
      <table class="mws-table mws-table--glob">
        <caption class="mws-sr">${tl(gp.title)}</caption>
        <thead><tr><th scope="col">${esc(copy.ui.partnersLabel)}</th><th scope="col">${esc(copy.ui.collabLabel)}</th></tr></thead>
        <tbody>${gp.items.map((it, i) => `<tr><th scope="row"><span class="mws-table__ico">${icon(["globe", "flag", "ticket", "bed", "book", "pin", "code"][i % 7])}</span>${esc(it.name)}</th><td data-label="${esc(copy.ui.collabLabel)}">${esc(it.body)}</td></tr>`).join("")}</tbody>
      </table>`,
  });

  // PoC & pilots — tinted band, spec cards
  const pc = p.poc;
  const pocRow = (it, i) => `<li class="mws-spec" id="mws-poc-${i + 1}">
      <div class="mws-spec__side"><p class="mws-en">${esc(it.en)}</p><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-tag">${esc(it.partner)}</p></div>
      <div class="mws-spec__main">
        <p class="mws-body mws-body--ink mws-body--lg">${esc(it.intro)}</p>
        ${dl([[copy.ui.scopeLabel, it.scope], [copy.ui.measureLabel, it.measure], [copy.ui.conditionLabel, it.premise]], "mws-dl mws-dl--3")}
        <p class="mws-spec__cta"><a class="mws-link" href="${esc(ask(lang, "partnership", "partnerships"))}">${esc(copy.ui.partnerCta)} ${arrow}</a></p>
      </div>
    </li>`;
  const poc = section({
    id: "mws-poc", tone: "tint",
    inner: `${head({ id: "mws-poc", kicker: pc.kicker, title: pc.title, lead: pc.lead, cls: "mws-head--wide" })}<ol class="mws-specs">${pc.items.map(pocRow).join("")}</ol>`,
  });

  // Data & API — three columns: possible · order · not done
  const da = p.data;
  const data = section({
    id: "mws-data",
    inner: `${head({ id: "mws-data", kicker: da.kicker, title: da.title, lead: da.lead, cls: "mws-head--wide" })}
      <ul class="mws-cards mws-cards--3">${da.items.map((it, i) => `<li class="mws-card${i === da.items.length - 1 ? " mws-card--no" : ""}"><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p><p class="mws-tags">${esc(it.tags)}</p></li>`).join("")}</ul>`,
  });

  // Process — tinted band, six numbered steps
  const pr = p.process;
  const process = accent({
    id: "mws-process",
    inner: `${head({ id: "mws-process", kicker: pr.kicker, title: pr.title })}${steps(pr.steps, { cls: "mws-steps--big mws-steps--6", en: true })}`,
  });

  // Partner value — four hairline columns
  const va = p.value;
  const value = section({
    id: "mws-value",
    inner: `${head({ id: "mws-value", kicker: va.kicker, title: va.title, lead: va.lead, cls: "mws-head--wide" })}${iconCards(va.items, ["flag", "map", "shield", "check"], { cls: "mws-icards--four", lead: false })}`,
  });

  // Checklist — split + two-column checks
  const ck = p.checklist;
  const checklist = split({
    id: "mws-checklist", kicker: ck.kicker, title: ck.title,
    aside: `<div class="mws-actions">${btn(ask(lang, "partnership", "partnerships"), copy.ui.partnerCta)}${btn(ask(lang, "business", "partnerships"), copy.ui.inquiryCta, { ghost: true })}</div>`,
    body: `<ul class="mws-checks">${ck.items.map((t) => `<li><span class="mws-checks__ico">${icon("check")}</span><p>${esc(t)}</p></li>`).join("")}</ul>`,
  });

  const faq = faqSection(p.faq);

  return [h, why, models, types, scenarios, globalPart, poc, data, process, value, checklist, faq, closeBand(lang, copy, "partnerships")].join("\n");
}

/* ================= 05 CONTACT ================= */
/* ONGIL-style Contact page (owner, 2026-10-26): film hero + menu unchanged (hero buttons → "문의하기" on the unified
   Contact page and a scroll to the inquiry types); body = the shared Contact kit (biz-contact-kit.mjs, MY WORLD blue).
   Every inquiry action is one "문의하기" → /{lang}/contact/?platform=myworld&type=… */
function contact(lang, copy) {
  const c = copy.contact;
  const L = lang === "ko" ? "ko" : "en";
  const h = hero(copy, c.hero, {
    ctas: hbtn(ask(lang, "personal", "contact"), ctaLabel(L), {}) + hbtn(`#${TYPES_ID}`, L === "ko" ? SEE_TYPES.ko : SEE_TYPES.en, { ghost: true }),
  });
  return [h, renderBizContact(myworldContactModel(lang, { googlePlay: GOOGLE_PLAY_URL, appStore: APP_STORE_URL }))].join("\n");
}

const RENDER = { overview, platform, business, partnerships, contact };

export function renderMyWorldSitePage(pageLang, page, { copy, contentLang, isFallback }) {
  const langAttr = contentLang !== pageLang ? ` lang="${contentLang}"` : "";
  const fallback = isFallback
    ? `<p class="mws-fallback mws__wrap" lang="en">This page is currently available in English. Translations are in preparation.</p>`
    : "";
  const body = RENDER[page](pageLang, copy);
  // hero first, then the shared five-menu bar (01 Overview · 02 Platform · …), then the rest
  const cut = body.indexOf("<!--mws-hero-end-->") + "<!--mws-hero-end-->".length;
  return `<div id="myworld-site" class="mws mws--${page}"${langAttr}>
  ${body.slice(0, cut)}
  ${renderFlagshipSubnav({ biz: "myworld", lang: pageLang, active: page })}
  ${fallback}
  ${body.slice(cut)}
  ${pager(pageLang, copy, page)}
</div>`;
}
