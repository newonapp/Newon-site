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

export const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.newon.myworld&pcampaignid=web_share";
/** Same App Store listing the NEWON home/portfolio already links (scripts/six-businesses.mjs BUSINESS.myworld.stores.appStore). */
export const APP_STORE_URL = "https://apps.apple.com/kr/app/my-world-%EC%97%AC%ED%96%89%EC%A7%80%EB%8F%84-%EB%B0%A9%EB%AC%B8%EA%B5%AD%EA%B0%80/id6792314945";
const MAIL = "newon@newon.app";

const pad = (n) => String(n).padStart(2, "0");
const letter = (i) => String.fromCharCode(65 + i);
const lines = (s) => esc(s).split("\n").join("<br />");
const pageHref = (lang, id) => `/${lang}/${myworldPagePath(id)}`;
const mailHref = (copy, topic) =>
  `mailto:${MAIL}?subject=${encodeURIComponent(`${copy.ui.emailSubjectPrefix} ${topic}`)}`;
const arrow = `<span class="mws-arrow" aria-hidden="true">→</span>`;
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
  if (cta === "partner") return `<a class="mws-link" href="${pageHref(lang, "partnerships")}">${esc(copy.ui.partnerCta)} ${arrow}</a>`;
  return `<a class="mws-link" href="${esc(mailHref(copy, topic))}">${esc(copy.ui.inquiryCta)} ${arrow}</a>`;
}
function notes(copy, keys) {
  return `<aside class="mws-notes" aria-label="${esc(copy.ui.notesAria)}">${keys.map((k) => `<p class="mws-note">${esc(copy.ui[k])}</p>`).join("")}</aside>`;
}
function head({ id, kicker, title, lead = "", note = "", cls = "" }) {
  return `<div class="mws-head${cls ? ` ${cls}` : ""}">
        ${kicker ? `<p class="mws-kicker">${esc(kicker)}</p>` : ""}
        <h2 class="mws-title" id="${id}-title">${lines(title)}</h2>
        ${lead ? `<p class="mws-lead">${esc(lead)}</p>` : ""}
        ${note ? `<p class="mws-small">${esc(note)}</p>` : ""}
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
  return `<ul class="mws-defs${cls ? ` ${cls}` : ""}">${items.map((it) => `<li${it.self ? ' class="is-self"' : ""}><h3 class="mws-defs__name">${esc(it[nameKey])}</h3><p class="mws-defs__body">${esc(it[bodyKey] || it.body || it.role)}</p></li>`).join("")}</ul>`;
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
      </li>`).join("")}</ol>`;
}
function faqList(items) {
  return `<ul class="mws-faq">${items.map((f) => `<li><details><summary><span class="mws-faq__text">${esc(f.q)}</span><span class="mws-faq__sign" aria-hidden="true"></span></summary><p class="mws-body">${esc(f.a)}</p></details></li>`).join("")}</ul>`;
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
const formHref = (lang, type) => `/${lang}/business/contact/?type=${type}&platform=myworld`;
const dl = (pairs, cls = "mws-dl") => `<dl class="${cls}">${pairs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;

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

function closeBand(lang, copy) {
  const n = copy.overview.next;
  return `<section class="mws-close" aria-labelledby="mws-close-title">
    <div class="mws__wrap mws-close__inner">
      <p class="mws-close__kicker">${esc(n.kicker)}</p>
      <h2 class="mws-close__title" id="mws-close-title">${lines(n.title)}</h2>
      <p class="mws-close__lead">${esc(n.lead)}</p>
      <div class="mws-actions mws-actions--center">
        ${btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true })}
        ${btn(APP_STORE_URL, copy.ui.appStoreCta, { external: true, ghost: true })}
        ${btn(pageHref(lang, "partnerships"), copy.ui.partnerCta, { ghost: true })}
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
    ctas: hbtn(pageHref(lang, "platform"), copy.ui.platformCta) + hbtn(pageHref(lang, "contact"), copy.ui.heroInquiryCta || copy.ui.contactCta, { ghost: true }),
  });

  // NOW — one quiet status line under the menu bar
  const now = `<div class="mws-now"><div class="mws__wrap mws-now__inner"><span class="mws-now__tag">${esc(o.now.kicker)}</span><p>${esc(o.now.text)}</p></div></div>`;

  // Definition — big statement left, the four platform layers as definition rows right
  const d = o.define;
  const define = split({
    id: "mws-define", kicker: d.kicker, title: d.title, lead: d.lead, cls: "mws-sec--first",
    aside: `<div class="mws-actions">${btn(pageHref(lang, "platform"), copy.ui.platformCta)}${btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true })}</div>`,
    body: defRows(d.items, { cls: "mws-defs--lead" }),
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
      <ul class="mws-bento">${v.items.map((c, i) => `<li class="mws-bento__cell${i === 0 ? " mws-bento__cell--lead" : ""}">
          <p class="mws-en">${esc(c.en)}</p>
          <h3 class="mws-h3${i === 0 ? " mws-h3--xl" : " mws-h3--lg"}">${esc(c.name)}</h3>
          <p class="mws-body">${esc(c.lead)}</p>
          ${chips(c.chips, "mws-chips--soft")}
      </li>`).join("")}</ul>`,
  });

  // Customers — three hairline columns
  const cu = o.customers;
  const customers = section({
    id: "mws-customers",
    inner: `${head({ id: "mws-customers", kicker: cu.kicker, title: cu.title, lead: cu.lead, note: cu.note, cls: "mws-head--wide" })}${feats(cu.items, { cols: 3 })}`,
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
      <ul class="mws-rail">${sc.items.map((it) => `<li class="mws-rail__card"><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ul>`,
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
  const globalVision = split({ id: "mws-global", kicker: gv.kicker, title: gv.title, lead: gv.lead, note: gv.note, body: defRows(gv.items, { cls: "mws-defs--lead" }) });

  // Long-term vision — priority steps (a real order)
  const r = o.roadmap;
  const roadmap = section({
    id: "mws-roadmap",
    inner: `${head({ id: "mws-roadmap", kicker: r.kicker, title: r.title, lead: r.lead, note: r.note, cls: "mws-head--wide" })}${roadSteps(copy, r)}`,
  });

  // NEWON — split + compact platform list (MY WORLD highlighted)
  const nw = o.newon;
  const newon = split({ id: "mws-newon", kicker: nw.kicker, title: nw.title, lead: nw.lead, note: nw.note, body: defRows(nw.items, { bodyKey: "role", cls: "mws-defs--grid" }) });

  return [h, now, define, problems, values, customers, journey, scenes, compare, status, globalVision, roadmap, newon,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 02 PLATFORM ================= */
function platform(lang, copy) {
  const p = copy.platform;
  const h = hero(copy, p.hero, {
    ctas: hbtn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true }) + hbtn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });

  // The app today — tinted band, six icon tiles + store buttons
  const shots = section({
    id: "mws-shots", tone: "tint", cls: "mws-sec--first",
    inner: `<div class="mws-rowhead">${head({ id: "mws-shots", kicker: p.shotsKicker, title: p.shotsTitle })}<div class="mws-actions">${storeButtons(copy)}</div></div>
      <ul class="mws-tiles">${p.shots.map((s) => `<li class="mws-tile"><span class="mws-ico-box">${icon(s.icon)}</span><p class="mws-tile__text">${esc(s.text)}</p></li>`).join("")}</ul>`,
  });

  // Area map — five group columns with jump links (letters / numbers = the plan's group and area IDs)
  const index = section({
    id: "mws-index",
    inner: `${head({ id: "mws-index", kicker: p.indexKicker, title: p.indexTitle, lead: p.indexLead, cls: "mws-head--wide" })}
      <ol class="mws-toc">${p.groups.map((g, gi) => `<li class="mws-toc__col">
        <div class="mws-toc__top"><span class="mws-letter">${letter(gi)}</span><span class="mws-count">${pad(g.items.length)}</span></div>
        <p class="mws-en">${esc(g.en)}</p>
        <h3 class="mws-h3"><a class="mws-title-link" href="#mws-group-${gi + 1}">${esc(g.name)}</a></h3>
        <p class="mws-body">${esc(g.lead)}</p>
        <ul class="mws-jump">${g.items.map((n) => `<li><a href="#mws-svc-${n}"><span>${pad(n)}</span>${esc(p.items[n - 1].name)}</a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });

  // 25 areas — group header row + area rows (id · description · now/next); status written in the "now / next" block
  const svcCard = (s, n) => `<li class="mws-area" id="mws-svc-${n}">
      <div class="mws-area__id"><span class="mws-ico-box">${icon(s.icon)}</span><span class="mws-area__n">${pad(n)}</span></div>
      <div class="mws-area__main">
        <p class="mws-en">${esc(s.en)}</p>
        <h4 class="mws-h3 mws-h3--lg">${esc(s.name)}</h4>
        <p class="mws-body">${esc(s.desc)}</p>
        <p class="mws-label">${esc(copy.ui.featuresLabel)}</p>
        ${chips(s.features)}
        <p class="mws-area__target"><span class="mws-label">${esc(copy.ui.targetLabel)}</span>${esc(s.target)}</p>
      </div>
      <div class="mws-area__status">
        ${nowNext(copy, s.now, s.next)}
        <p class="mws-area__cta">${itemCta(lang, copy, s.cta, s.name)}</p>
      </div>
    </li>`;
  const groups = p.groups.map((g, gi) => `<section class="mws-agroup" id="mws-group-${gi + 1}" aria-labelledby="mws-group-${gi + 1}-title">
      <div class="mws-agroup__head"><span class="mws-letter mws-letter--lg">${letter(gi)}</span><div><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-group-${gi + 1}-title">${esc(g.name)}</h3></div><p class="mws-body">${esc(g.lead)}</p></div>
      <ol class="mws-areas">${g.items.map((n) => svcCard(p.items[n - 1], n)).join("")}</ol>
    </section>`).join("");
  const list = section({
    id: "mws-services",
    inner: `${head({ id: "mws-services", kicker: `${p.items.length} AREAS`, title: `${copy.ui.brand} ${copy.nav[1].label}` })}${groups}`,
  });

  // Now & next — the 25 areas regrouped by status (one label per column)
  const sb = p.statusBoard;
  const byStatus = STATUS_ORDER.map((st) => ({ st, nums: p.items.map((s, i) => (s.status === st ? i + 1 : 0)).filter(Boolean) }));
  const statusBoard = section({
    id: "mws-now", tone: "tint",
    inner: `${head({ id: "mws-now", kicker: sb.kicker, title: sb.title, lead: sb.lead, cls: "mws-head--wide" })}
      <ol class="mws-kanban">${byStatus.map(({ st, nums }) => `<li class="mws-kanban__col mws-kanban__col--${st}">
        <div class="mws-kanban__top">${badge(copy, st)}<span class="mws-count">${pad(nums.length)}</span></div>
        <p class="mws-body">${esc(sb.groups[st])}</p>
        <ul class="mws-jump">${nums.map((n) => `<li><a href="#mws-svc-${n}"><span>${pad(n)}</span>${esc(p.items[n - 1].name)}</a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });

  // Global expansion — split: localisation checks under the heading, services to take abroad as rows
  const gl = p.global;
  const globalExp = split({
    id: "mws-global", kicker: gl.kicker, title: gl.title, lead: gl.lead, note: gl.note,
    aside: `<p class="mws-label">${esc(gl.localLabel)}</p>${chips(gl.local)}`,
    body: defRows(gl.items),
  });

  // How features connect — a six-step cycle
  const f = p.flow;
  const flow = section({
    id: "mws-flow",
    inner: `${head({ id: "mws-flow", kicker: f.kicker, title: f.title, lead: f.lead, note: f.note, cls: "mws-head--wide" })}${steps(f.items, { cls: "mws-steps--cycle" })}`,
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
  const users = split({ id: "mws-users", kicker: u.kicker, title: u.title, lead: u.lead, note: u.note, body: defRows(u.items, { bodyKey: "role" }) });

  // Privacy & trust — four hairline columns
  const t = p.trust;
  const trust = section({
    id: "mws-trust",
    inner: `${head({ id: "mws-trust", kicker: t.kicker, title: t.title, lead: t.lead, cls: "mws-head--wide" })}${feats(t.items, { cols: 4, cls: "mws-feats--check" })}`,
  });

  // App guide — tinted band, five numbered steps
  const g = p.guide;
  const guide = section({
    id: "mws-guide", tone: "tint",
    inner: `<div class="mws-rowhead">${head({ id: "mws-guide", kicker: g.kicker, title: g.title, lead: g.lead, note: g.note })}<div class="mws-actions">${storeButtons(copy)}</div></div>
      ${steps(g.steps, { cls: "mws-steps--big", en: true })}`,
  });

  // FAQ — split + accordion
  const fq = p.faq;
  const faq = split({ id: "mws-faq", kicker: fq.kicker, title: fq.title, body: faqList(fq.items) });

  return [h, shots, index, list, statusBoard, globalExp, flow, scenarios, users, trust, guide, faq,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 03 BUSINESS ================= */
function business(lang, copy) {
  const b = copy.business;
  const h = hero(copy, b.hero, {
    ctas: hbtn(pageHref(lang, "partnerships"), copy.ui.partnerCta, {}) + hbtn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });

  // Model overview — four platform layers in the order the lead describes
  const m = b.model;
  const model = section({
    id: "mws-model", cls: "mws-sec--first",
    inner: `${head({ id: "mws-model", kicker: m.kicker, title: m.title, lead: m.lead, cls: "mws-head--wide" })}
      <ol class="mws-layers">${m.items.map((it) => `<li class="mws-layer"><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ol>`,
  });

  // Who pays — clean data table
  const py = b.payers;
  const payers = section({
    id: "mws-payers", tone: "tint",
    inner: `<div class="mws-split mws-split--table">
        <div class="mws-split__head">${head({ id: "mws-payers", kicker: py.kicker, title: py.title, lead: py.lead })}</div>
        <div class="mws-split__body"><table class="mws-table mws-table--payers">
          <caption class="mws-sr">${esc(py.title.replace(/\n/g, " "))}</caption>
          <thead><tr><th scope="col"><span class="mws-sr" lang="en">${esc(py.kicker)}</span></th><th scope="col">${esc(copy.ui.payerLabel)}</th><th scope="col">${esc(copy.ui.revenueLabel)}</th></tr></thead>
          <tbody>${py.items.map((it) => `<tr><th scope="row" lang="en">${esc(it.name)}</th><td data-label="${esc(copy.ui.payerLabel)}">${esc(it.target)}</td><td data-label="${esc(copy.ui.revenueLabel)}">${esc(it.how)}</td></tr>`).join("")}</tbody>
        </table></div>
      </div>`,
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
  const deals = section({
    id: "mws-deals",
    inner: `${head({ id: "mws-deals", kicker: de.kicker, title: de.title })}
      <ul class="mws-quotes">${de.items.map((t) => `<li><p>${esc(t)}</p></li>`).join("")}</ul>`,
  });

  // Business & institution tools — tinted panel: heading + module grid
  const s = b.saas;
  const saas = section({
    id: "mws-saas",
    inner: `<div class="mws-panelbox">
        <div class="mws-panelbox__head">${head({ id: "mws-saas", kicker: s.kicker, title: s.title, lead: s.lead })}<p class="mws-saas__badge">${badge(copy, "review")}</p></div>
        <ul class="mws-modules">${s.items.map((it) => `<li><h3 class="mws-h4" lang="en">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ul>
      </div>`,
  });

  // Market opportunity — split + definition rows
  const mk = b.market;
  const market = split({ id: "mws-market", kicker: mk.kicker, title: mk.title, lead: mk.lead, body: defRows(mk.items, { cls: "mws-defs--lead" }) });

  // Differentiation hypotheses — 2×2 large-type cells
  const df = b.diff;
  const diff = section({
    id: "mws-diff",
    inner: `${head({ id: "mws-diff", kicker: df.kicker, title: df.title, lead: df.lead, note: df.note, cls: "mws-head--wide" })}
      <ul class="mws-cards mws-cards--2 mws-cards--line">${df.items.map((it) => `<li class="mws-card"><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ul>`,
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
    inner: `${head({ id: "mws-trust", kicker: t.kicker, title: t.title, lead: t.lead, cls: "mws-head--wide" })}${feats(t.items, { cols: 3, cls: "mws-feats--compact" })}
      <div class="mws-actions">${btn(pageHref(lang, "partnerships"), copy.ui.partnerCta)}${btn(formHref(lang, "general"), copy.ui.formCta, { ghost: true })}</div>`,
  });

  return [h, model, payers, groupsIdx, revenue, subscription, deals, saas, market, diff, gtm, roadmap, globalStrat, trust,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 04 PARTNERSHIPS ================= */
function partnerships(lang, copy) {
  const p = copy.partnerships;
  const h = hero(copy, p.hero, {
    ctas: hbtn(mailHref(copy, copy.ui.partnerCta), copy.ui.partnerCta, {}) + hbtn(pageHref(lang, "business"), copy.ui.businessCta, { ghost: true }),
  });

  // Vision — large-type statement: first statement leads, the others follow in columns
  const why = section({
    id: "mws-why", cls: "mws-sec--first",
    inner: `${head({ id: "mws-why", kicker: p.why.kicker, title: p.why.title, cls: "mws-head--wide" })}
      <div class="mws-vision"><p class="mws-vision__lead">${esc(p.why.items[0])}</p>
        <ul class="mws-vision__rest">${p.why.items.slice(1).map((t) => `<li><p>${esc(t)}</p></li>`).join("")}</ul></div>`,
  });

  // Models — six hairline columns
  const models = section({
    id: "mws-models", tone: "tint",
    inner: `${head({ id: "mws-models", kicker: p.models.kicker, title: p.models.title })}${feats(p.models.items, { cols: 3, cls: "mws-feats--rule" })}`,
  });

  // Partner types — segmented tabs by group; cards with the five facts (partner numbers = existing IDs)
  const card = (t, n) => `<li class="mws-pcard" id="mws-partner-${n}">
      <div class="mws-pcard__top"><span class="mws-ico-box">${icon(t.icon)}</span><span class="mws-pcard__n">${pad(n)}</span></div>
      <p class="mws-tag">${esc(t.field)}</p>
      <h4 class="mws-h3">${esc(t.name)}</h4>
      ${dl([
        [copy.ui.targetLabel, t.target],
        [copy.ui.collabLabel, t.collab],
        [copy.ui.valueLabel, t.value],
        [copy.ui.revenueLabel, t.revenue],
        [copy.ui.termsLabel, t.terms],
      ], "mws-dl mws-dl--stack")}
      <p class="mws-pcard__cta"><a class="mws-link" href="${esc(mailHref(copy, `${copy.ui.partnerCta} — ${t.name}`))}">${esc(copy.ui.partnerCta)} ${arrow}</a></p>
    </li>`;
  const ptabs = p.groups.map((g, gi) => `<button type="button" class="mws-seg" role="tab" id="mws-ptab-${gi + 1}" aria-controls="mws-pgroup-${gi + 1}" aria-selected="${gi === 0}" tabindex="${gi === 0 ? 0 : -1}"><span>${esc(g.name)}</span><span class="mws-seg__count">${pad(g.items.length)}</span></button>`).join("");
  const types = section({
    id: "mws-partners",
    inner: `${head({ id: "mws-partners", kicker: p.typesKicker, title: p.typesTitle })}
      <div class="mws-tabs mws-tabs--seg" data-mws-tabs>
        <div class="mws-tabs__list mws-segs" role="tablist" aria-label="${esc(p.typesTitle)}">${ptabs}</div>
        ${p.groups.map((g, gi) => `<section class="mws-pgroup" role="tabpanel" id="mws-pgroup-${gi + 1}" aria-labelledby="mws-pgroup-${gi + 1}-title"${gi === 0 ? "" : " data-hidden"}>
          <div class="mws-pgroup__head"><span class="mws-letter">${letter(gi)}</span><h3 class="mws-gtitle" id="mws-pgroup-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-en">${esc(g.en)}</p><span class="mws-count">${pad(g.items.length)}</span></div>
          <ul class="mws-pcards">${g.items.map((n) => card(p.items[n - 1], n)).join("")}</ul>
        </section>`).join("")}
      </div>
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
      <div class="mws-cloud"><p class="mws-label">${esc(sc.campaignsTitle)}</p>${chips(sc.campaigns, "mws-chips--cloud")}</div>`,
  });

  // Global partnerships — split: overseas partner kinds and collaboration possibilities; inquiry → unified Contact page
  const gp = p.global;
  const globalPart = split({
    id: "mws-global", kicker: gp.kicker, title: gp.title, lead: gp.lead, note: gp.note,
    aside: `<div class="mws-actions">${btn(`/${lang}/contact/?type=partnership&platform=myworld`, gp.cta)}${btn(mailHref(copy, gp.cta), copy.ui.mailCta, { ghost: true })}</div>`,
    body: defRows(gp.items),
  });

  // PoC & pilots — tinted band, spec cards
  const pc = p.poc;
  const pocRow = (it, i) => `<li class="mws-spec" id="mws-poc-${i + 1}">
      <div class="mws-spec__side"><p class="mws-en">${esc(it.en)}</p><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-tag">${esc(it.partner)}</p></div>
      <div class="mws-spec__main">
        <p class="mws-body mws-body--ink mws-body--lg">${esc(it.intro)}</p>
        ${dl([[copy.ui.scopeLabel, it.scope], [copy.ui.measureLabel, it.measure], [copy.ui.conditionLabel, it.premise]], "mws-dl mws-dl--3")}
        <p class="mws-spec__cta"><a class="mws-link" href="${esc(mailHref(copy, `PoC — ${it.name}`))}">${esc(copy.ui.partnerCta)} ${arrow}</a></p>
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
  const process = section({
    id: "mws-process", tone: "tint",
    inner: `${head({ id: "mws-process", kicker: pr.kicker, title: pr.title })}${steps(pr.steps, { cls: "mws-steps--grid", en: true })}`,
  });

  // Partner value — four hairline columns
  const va = p.value;
  const value = section({
    id: "mws-value",
    inner: `${head({ id: "mws-value", kicker: va.kicker, title: va.title, lead: va.lead, cls: "mws-head--wide" })}${feats(va.items, { cols: 4 })}`,
  });

  // Checklist — split + two-column checks
  const ck = p.checklist;
  const checklist = split({
    id: "mws-checklist", kicker: ck.kicker, title: ck.title,
    aside: `<div class="mws-actions">${btn(mailHref(copy, copy.ui.partnerCta), copy.ui.partnerCta)}${btn(formHref(lang, "brand"), copy.ui.formCta, { ghost: true })}</div>`,
    body: `<ul class="mws-checks">${ck.items.map((t) => `<li><span class="mws-checks__ico">${icon("check")}</span><p>${esc(t)}</p></li>`).join("")}</ul>`,
  });

  return [h, why, models, types, scenarios, globalPart, poc, data, process, value, checklist, closeBand(lang, copy)].join("\n");
}

/* ================= 05 CONTACT ================= */
function contact(lang, copy) {
  const c = copy.contact;
  const h = hero(copy, c.hero, {
    ctas: hbtn(`mailto:${MAIL}?subject=${encodeURIComponent(copy.ui.emailSubjectPrefix)}`, copy.ui.mailCta, {}) + hbtn(`/${lang}/contact/`, copy.ui.contactPageCta, { ghost: true }),
  });
  const links = (it) => {
    const out = [`<a class="mws-link" href="${esc(mailHref(copy, it.name))}">${esc(copy.ui.mailCta)} ${arrow}</a>`];
    if (it.route === "data") out.push(`<a class="mws-link" href="/${lang}/myworld/delete-account/">${esc(c.channels.items[2].name)} ${arrow}</a>`);
    if (it.form) out.push(`<a class="mws-link" href="${esc(formHref(lang, it.form))}">${esc(copy.ui.formCta)} ${arrow}</a>`);
    if (it.route === "partner") out.push(`<a class="mws-link" href="${pageHref(lang, "partnerships")}">${esc(copy.nav[3].label)} ${arrow}</a>`);
    if (it.route === "press") out.push(`<a class="mws-link" href="/${lang}/contact/">${esc(copy.ui.contactPageCta)} ${arrow}</a>`);
    return out.join("");
  };

  // Inquiry types — per group: heading column + inquiry rows (icon · text · links)
  const types = section({
    id: "mws-types", cls: "mws-sec--first",
    inner: `${head({ id: "mws-types", kicker: c.typesKicker, title: c.typesTitle })}
      ${c.groups.map((g, gi) => `<section class="mws-cgroup" aria-labelledby="mws-cgroup-${gi + 1}-title">
        <div class="mws-cgroup__head"><span class="mws-letter">${letter(gi)}</span><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-cgroup-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-body">${esc(g.lead)}</p></div>
        <ul class="mws-inq">${g.items.map((n) => {
          const it = c.items[n - 1];
          return `<li class="mws-inq__row"><span class="mws-ico-box">${icon(it.icon)}</span><div class="mws-inq__text"><h4 class="mws-h4"><span class="mws-inq__n">${pad(n)}</span>${esc(it.name)}</h4><p class="mws-body">${esc(it.body)}</p></div><p class="mws-inq__links">${links(it)}</p></li>`;
        }).join("")}</ul>
      </section>`).join("")}
      <p class="mws-callout"><strong>${esc(c.privacy.label)}</strong><span>${esc(copy.ui.sensitiveNote)}</span></p>`,
  });

  // How — tinted band, three numbered steps
  const how = section({
    id: "mws-how", tone: "tint",
    inner: `${head({ id: "mws-how", kicker: c.how.kicker, title: c.how.title })}${steps(c.how.steps, { cls: "mws-steps--big mws-steps--3" })}`,
  });

  // Channels — 2×2 link tiles (unchanged destinations)
  const chHref = [`mailto:${MAIL}?subject=${encodeURIComponent(copy.ui.emailSubjectPrefix)}`, `/${lang}/contact/`, `/${lang}/myworld/delete-account/`, `/${lang}/privacy/`];
  const chIcon = ["chat", "building", "shield", "book"];
  const channels = section({
    id: "mws-channels",
    inner: `${head({ id: "mws-channels", kicker: c.channels.kicker, title: c.channels.title })}
      <ul class="mws-links">${c.channels.items.map((ch, i) => `<li><a class="mws-links__a" href="${esc(chHref[i])}"><span class="mws-ico-box">${icon(chIcon[i])}</span><span class="mws-links__body"><span class="mws-links__name">${esc(ch.name)}</span><span class="mws-links__desc">${esc(ch.body)}</span></span><span class="mws-links__go" aria-hidden="true">→</span></a></li>`).join("")}</ul>`,
  });

  // FAQ — split + accordion
  const faq = split({ id: "mws-faq", kicker: c.faq.kicker, title: c.faq.title, body: faqList(c.faq.items) });

  return [h, types, how, channels, faq, `<div class="mws__wrap">${notes(copy, ["scopeNote"])}</div>`, closeBand(lang, copy)].join("\n");
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
