/**
 * MY WORLD business site — page bodies (scoped to #myworld-site.mws).
 *
 * Visual language = the clean white/black Life Stage system used by PETLOG and BABYLOG:
 * shared dark film hero, the shared five-menu bar (flagship-subnav) directly under it, then white
 * sections with hairlines, generous whitespace, big headings, small uppercase labels and numbered rows.
 * MY WORLD blue (#1769FF / #1257D6) is only a point colour.
 *
 * Content follows the MY WORLD final integrated business plan (25 areas, 13 revenue models) and the IR status labels.
 * Status is expressed by grouping (status sections, stage groups, a "now / next" text column) — never one badge per card.
 *
 * Every section on a page uses a different layout from its neighbours:
 *   split (heading + boxed numbered rows) · tabs (journey) · cols (big-number columns) · feature (tinted band +
 *   app screens) · rows2 (two-column numbered rows) · board (hairline grid) · cloud (chip cloud) · cards2
 *   (two-column signal cards) · nodes (connected flow) · road (boxed roadmap steps) · dir (plain directory rows) ·
 *   strip (app screenshots row) · gsplit (sticky group heading + service rows) · spec (business line rows) ·
 *   figures (tinted big-number grid) · statements · timeline · checks · links · faq.
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
const oneLine = (s) => esc(String(s).replace(/\n/g, " "));
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
function legend(copy) {
  return `<p class="mws-legend"><span class="mws-legend__label">${esc(copy.ui.statusLabel)}</span>${["live", "partial", "planned", "review"].map((s) => badge(copy, s)).join("")}</p>`;
}
function head({ id, kicker, title, lead = "", note = "", cls = "" }) {
  return `<div class="mws-head${cls ? ` ${cls}` : ""}">
        ${kicker ? `<p class="mws-kicker">${esc(kicker)}</p>` : ""}
        <h2 class="mws-title" id="${id}-title">${lines(title)}</h2>
        ${lead ? `<p class="mws-lead">${esc(lead)}</p>` : ""}
        ${note ? `<p class="mws-small">${esc(note)}</p>` : ""}
      </div>`;
}
/** Section shell. tone: "" (white) · "tint" (light MY WORLD tint band). */
function section({ id, tone = "", cls = "", inner }) {
  const c = ["mws-sec", tone ? `mws-sec--${tone}` : "", cls].filter(Boolean).join(" ");
  return `<section class="${c}" id="${id}" aria-labelledby="${id}-title">
    <div class="mws__wrap">
      ${inner}
    </div>
  </section>`;
}
/** Layout: heading on the left, boxed numbered rows on the right. */
function split({ id, kicker, title, lead = "", note = "", rows, aside = "", tone = "", listCls = "mws-roster" }) {
  return section({
    id, tone,
    inner: `<div class="mws-split">
        <div class="mws-split__head">${head({ id, kicker, title, lead, note })}${aside}</div>
        <ol class="${listCls}">${rows}</ol>
      </div>`,
  });
}
const rosterRow = (n, body, name = "") => `<li><span class="mws-roster__n">${n}</span><p>${name ? `<strong>${esc(name)}</strong> ` : ""}${esc(body)}</p></li>`;
/* ---------- abstract line art (inline SVG, decorative, no images) ---------- */
/** Line-drawn globe with dotted routes and pins — the MY WORLD "world map" motif. */
function globeArt(uid, cls = "") {
  return `<div class="mws-art${cls ? ` ${cls}` : ""}" aria-hidden="true"><svg viewBox="0 0 480 400" focusable="false">
      <defs><pattern id="mws-dots-${uid}" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" class="mws-art__grid" /></pattern></defs>
      <rect width="480" height="400" fill="url(#mws-dots-${uid})" />
      <g class="mws-art__globe" fill="none">
        <circle cx="240" cy="200" r="150" class="mws-art__disc" />
        <ellipse cx="240" cy="200" rx="100" ry="150" />
        <ellipse cx="240" cy="200" rx="48" ry="150" />
        <path d="M240 50v300" />
        <path d="M95 160h290M95 240h290M120 110h240M120 290h240" />
        <path d="M90 200h300" />
      </g>
      <path class="mws-art__route" d="M150 262C178 168 252 140 318 168" />
      <path class="mws-art__route" d="M318 168C352 186 362 232 330 272" />
      <path class="mws-art__route mws-art__route--soft" d="M150 262C120 230 128 160 186 120" />
      <g class="mws-art__pin" transform="translate(150 262)"><circle r="11" class="mws-art__halo" /><circle r="5.5" /></g>
      <g class="mws-art__pin" transform="translate(318 168)"><circle r="11" class="mws-art__halo" /><circle r="5.5" /></g>
      <g class="mws-art__pin mws-art__pin--open" transform="translate(330 272)"><circle r="6" /></g>
      <g class="mws-art__pin mws-art__pin--open" transform="translate(186 120)"><circle r="6" /></g>
    </svg></div>`;
}
/** Six-stop route line for the journey tabs; stops up to `active` are filled. */
function routeArt(count, active) {
  const xs = Array.from({ length: count }, (_, i) => 14 + (i * 292) / (count - 1));
  const ys = xs.map((_, i) => (i % 2 ? 22 : 44));
  const d = xs.map((x, i) => (i === 0 ? `M${x} ${ys[i]}` : `S${x - 26} ${ys[i]} ${x} ${ys[i]}`)).join(" ");
  const stops = xs
    .map((x, i) => `<circle cx="${x}" cy="${ys[i]}" r="${i === active ? 7 : 4.5}" class="mws-route__stop${i < active ? " is-done" : ""}${i === active ? " is-on" : ""}" />`)
    .join("");
  return `<svg class="mws-route" viewBox="0 0 320 66" aria-hidden="true" focusable="false"><path d="${d}" class="mws-route__line" fill="none" />${stops}</svg>`;
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

function closeBand(lang, copy) {
  const n = copy.overview.next;
  return `<section class="mws-close" aria-labelledby="mws-close-title">
    <div class="mws__wrap mws-close__inner">
      <p class="mws-close__kicker"><span class="mws-close__dot" aria-hidden="true"></span>${esc(n.kicker)}</p>
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

function roadSteps(copy, r) {
  return `<ol class="mws-road">${r.items.map((s, i) => `<li class="mws-road__step${i === 0 ? " is-current" : ""}">
        <span class="mws-road__n">${pad(i + 1)}</span>
        <p class="mws-road__stage">${esc(s.stage)}${i === 0 ? ` <span class="mws-current">${esc(copy.ui.currentStage)}</span>` : ""}</p>
        <h3 class="mws-h3">${esc(s.name)}</h3>
        <p class="mws-body">${esc(s.body)}</p>
      </li>`).join("")}</ol>`;
}

/* ---------- shared section helpers (existing classes only) ---------- */
const STATUS_ORDER = ["live", "partial", "planned", "review"];
/** "지금 앱에서 / 확장 계획" text column — status is written out, not shown as a per-card badge. */
function nowNext(copy, now, next) {
  return `<div class="mws-dl mws-dl--stack">
          <div><dt>${esc(copy.ui.nowLabel)}</dt><dd>${esc(now)}</dd></div>
          ${next ? `<div><dt>${esc(copy.ui.nextLabel)}</dt><dd>${esc(next)}</dd></div>` : ""}
        </div>`;
}
function storeButtons(copy, { ghost = false } = {}) {
  return btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true, ghost }) + btn(APP_STORE_URL, copy.ui.appStoreCta, { external: true, ghost: true });
}
const formHref = (lang, type) => `/${lang}/business/contact/?type=${type}&platform=myworld`;
function dirRows(items) {
  return items.map((it, i) => `<li${it.self ? ' class="is-self"' : ""}><span class="mws-dir__n">${pad(i + 1)}</span><div><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.role || it.body)}</p></div></li>`).join("");
}
function faqRows(items) {
  return items.map((f, i) => `<li><details><summary><span class="mws-faq__q">Q${i + 1}</span><span class="mws-faq__text">${esc(f.q)}</span></summary><p class="mws-body">${esc(f.a)}</p></details></li>`).join("");
}
function boardCompact(items, { answerLabel = "" } = {}) {
  return `<ol class="mws-board mws-board--4 mws-board--compact">${items.map((it, i) => `<li class="mws-board__cell"><span class="mws-board__num">${pad(i + 1)}</span><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p>${it.answer ? `<p class="mws-mini">${esc(answerLabel)}</p><p class="mws-body mws-body--ink">${esc(it.answer)}</p>` : ""}</li>`).join("")}</ol>`;
}

/* ================= 01 OVERVIEW ================= */
function overview(lang, copy) {
  const o = copy.overview;
  const h = hero(copy, o.hero, {
    ctas: hbtn(pageHref(lang, "platform"), copy.ui.platformCta) + hbtn(pageHref(lang, "contact"), copy.ui.heroInquiryCta || copy.ui.contactCta, { ghost: true }),
  });

  // NOW — slim status strip
  const now = `<div class="mws-now"><div class="mws__wrap mws-now__inner"><span class="mws-now__tag">${esc(o.now.kicker)}</span><p>${esc(o.now.text)}</p></div></div>`;

  // Definition + key message — split + boxed rows (four business directions)
  const d = o.define;
  const define = split({
    id: "mws-define", kicker: d.kicker, title: d.title, lead: d.lead,
    aside: `<div class="mws-actions">${btn(pageHref(lang, "platform"), copy.ui.platformCta)}${btn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true })}</div>`,
    rows: d.items.map((it, i) => rosterRow(pad(i + 1), it.body, it.name)).join(""),
  });

  // Problem → solution — two-column cards
  const pb = o.problems;
  const problems = section({
    id: "mws-problems",
    inner: `${head({ id: "mws-problems", kicker: pb.kicker, title: pb.title, lead: pb.lead })}
      <ul class="mws-cards2">${pb.items.map((it, i) => `<li class="mws-card2">
        <div class="mws-card2__top"><span class="mws-card2__n">${pad(i + 1)}</span><span class="mws-tag">${esc(copy.ui.problemLabel)}</span></div>
        <h3 class="mws-h3 mws-h3--lg">${esc(it.problem)}</h3>
        <p class="mws-body">${esc(it.body)}</p>
        <p class="mws-mini">${esc(copy.ui.answerLabel)}</p>
        <p class="mws-body mws-body--ink">${esc(it.answer)}</p>
      </li>`).join("")}</ul>`,
  });

  // Core values — bento
  const v = o.values;
  const values = section({
    id: "mws-values",
    inner: `${head({ id: "mws-values", kicker: v.kicker, title: v.title, lead: v.lead, cls: "mws-head--wide" })}
      <ol class="mws-bento">${v.items.map((c, i) => `<li class="mws-bento__cell${i === 0 ? " mws-bento__cell--lead" : ""}">
        <div class="mws-bento__top"><span class="mws-bento__n">${pad(i + 1)}</span></div>
        <div class="mws-bento__body">
          <p class="mws-en">${esc(c.en)}</p>
          <h3 class="mws-h3${i === 0 ? " mws-h3--lg" : ""}">${esc(c.name)}</h3>
          <p class="mws-body">${esc(c.lead)}</p>
          ${chips(c.chips, "mws-chips--soft")}
        </div>
      </li>`).join("")}</ol>`,
  });

  // Customers — split + directory rows
  const cu = o.customers;
  const customers = split({ id: "mws-customers", kicker: cu.kicker, title: cu.title, lead: cu.lead, note: cu.note, listCls: "mws-dir", rows: dirRows(cu.items) });

  // Journey — tabs; each panel states what the app does today
  const j = o.journey;
  const tabs = j.items
    .map((s, i) => `<button type="button" class="mws-tab" role="tab" id="mws-tab-${s.id}" aria-controls="mws-panel-${s.id}" aria-selected="${i === 4}" tabindex="${i === 4 ? 0 : -1}"><span class="mws-tab__n">${pad(i + 1)}</span><span class="mws-tab__name">${esc(s.name)}</span>${s.status === "live" ? `<span class="mws-tab__live" aria-hidden="true"></span>` : ""}</button>`)
    .join("");
  const panels = j.items
    .map((s, i) => `<div class="mws-panel" role="tabpanel" id="mws-panel-${s.id}" aria-labelledby="mws-tab-${s.id}"${i === 4 ? "" : " data-hidden"}>
        <div class="mws-panel__visual mws-panel__visual--${s.status}" aria-hidden="true"><span class="mws-panel__n">${pad(i + 1)} / ${pad(j.items.length)}</span>${routeArt(j.items.length, i)}<span class="mws-panel__big" lang="en">${esc(s.en)}</span></div>
        <div class="mws-panel__body">
          <p class="mws-en">${pad(i + 1)} · ${esc(s.en)}</p>
          <h3 class="mws-h3 mws-h3--lg">${esc(s.head)}</h3>
          <p class="mws-body">${esc(s.lead)}</p>
          ${chips(s.chips)}
          <p class="mws-meta mws-panel__status"><span>${esc(copy.ui.nowLabel)}</span>${esc(s.now)}</p>
        </div>
      </div>`)
    .join("");
  const journey = section({
    id: "mws-journey",
    inner: `${head({ id: "mws-journey", kicker: j.kicker, title: j.title, lead: j.lead })}
      <div class="mws-tabs" data-mws-tabs>
        <div class="mws-tabs__list" role="tablist" aria-label="${esc(copy.ui.tabsAria)}">${tabs}</div>
        ${panels}
      </div>
      <p class="mws-small">${esc(j.note)}</p>`,
  });

  // Use cases — two-column numbered rows
  const sc = o.scenes;
  const scenes = section({
    id: "mws-scenes",
    inner: `${head({ id: "mws-scenes", kicker: sc.kicker, title: sc.title, lead: sc.lead })}
      <ol class="mws-rows2">${sc.items.map((it, i) => `<li><span class="mws-rows2__n">${pad(i + 1)}</span><div><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></div></li>`).join("")}</ol>`,
  });

  // Differentiation — compact board
  const cp = o.compare;
  const compare = section({
    id: "mws-compare",
    inner: `${head({ id: "mws-compare", kicker: cp.kicker, title: cp.title, lead: cp.lead, cls: "mws-head--wide" })}${boardCompact(cp.items, { answerLabel: copy.ui.brand })}`,
  });

  // Current status — tinted band: what the app does today, then the other status groups
  const st = o.status;
  const status = section({
    id: "mws-status", tone: "tint",
    inner: `<div class="mws-feature mws-feature--solo">
        <div class="mws-feature__copy">
          ${head({ id: "mws-status", kicker: st.kicker, title: st.title, lead: st.lead })}
          <p class="mws-feature__badge">${badge(copy, "live")}</p>
          <ol class="mws-dir mws-dir--compact">${st.items.map((it, i) => `<li><span class="mws-dir__n">${pad(i + 1)}</span><div><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></div></li>`).join("")}</ol>
          <div class="mws-actions">${storeButtons(copy)}</div>
        </div>
      </div>
      <ol class="mws-cols mws-cols--3">${st.groups.map((g, i) => `<li class="mws-col"><span class="mws-col__n">${pad(i + 2)}</span><p class="mws-feature__badge">${badge(copy, g.status)}</p><h3 class="mws-h3">${esc(g.name)}</h3><p class="mws-body">${esc(g.body)}</p><p class="mws-col__tags">${g.chips.map(esc).join(" · ")}</p></li>`).join("")}</ol>`,
  });

  // Long-term vision — boxed priority steps
  const r = o.roadmap;
  const roadmap = section({
    id: "mws-roadmap",
    inner: `${head({ id: "mws-roadmap", kicker: r.kicker, title: r.title, lead: r.lead, note: r.note, cls: "mws-head--wide" })}${roadSteps(copy, r)}`,
  });

  // NEWON — split + plain directory rows
  const nw = o.newon;
  const newon = split({ id: "mws-newon", kicker: nw.kicker, title: nw.title, lead: nw.lead, note: nw.note, listCls: "mws-dir", rows: dirRows(nw.items) });

  return [h, now, define, problems, values, customers, journey, scenes, compare, status, roadmap, newon,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 02 PLATFORM ================= */
function platform(lang, copy) {
  const p = copy.platform;
  const h = hero(copy, p.hero, {
    ctas: hbtn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true }) + hbtn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });

  // The app today — tinted band, feature tiles (no screenshots)
  const shots = section({
    id: "mws-shots", tone: "tint",
    inner: `<div class="mws-rowhead">${head({ id: "mws-shots", kicker: p.shotsKicker, title: p.shotsTitle })}<div class="mws-actions">${storeButtons(copy)}</div></div>
      <div class="mws-today mws-today--solo">
        <ol class="mws-tiles">${p.shots.map((s, i) => `<li class="mws-tile"><span class="mws-ico-box mws-ico-box--soft">${icon(s.icon)}</span><span class="mws-tile__n">${pad(i + 1)}</span><p class="mws-tile__text">${esc(s.text)}</p></li>`).join("")}</ol>
      </div>`,
  });

  // Area map — board of the five groups with jump links (numbers = plan area numbers)
  const index = section({
    id: "mws-index",
    inner: `${head({ id: "mws-index", kicker: p.indexKicker, title: p.indexTitle, lead: p.indexLead, cls: "mws-head--wide" })}
      <ol class="mws-board mws-board--3">${p.groups.map((g, gi) => `<li class="mws-board__cell">
        <div class="mws-board__top"><span class="mws-letter">${letter(gi)}</span><span class="mws-count">${pad(g.items.length)}</span></div>
        <p class="mws-en">${esc(g.en)}</p>
        <h3 class="mws-h3"><a class="mws-title-link" href="#mws-group-${gi + 1}">${esc(g.name)}</a></h3>
        <p class="mws-body">${esc(g.lead)}</p>
        <ul class="mws-jump">${g.items.map((n) => `<li><a href="#mws-svc-${n}"><span>${pad(n)}</span>${esc(p.items[n - 1].name)}</a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });

  // 25 areas — sticky group heading + area rows; status written in the "now / next" column
  const svcRow = (s, n) => `<li class="mws-svc" id="mws-svc-${n}">
      <div class="mws-svc__side"><span class="mws-ico-box">${icon(s.icon)}</span><span class="mws-svc__n">${pad(n)}</span></div>
      <div class="mws-svc__main">
        <div class="mws-svc__title"><div><p class="mws-en">${esc(s.en)}</p><h4 class="mws-h3 mws-h3--lg">${esc(s.name)}</h4></div></div>
        <p class="mws-body">${esc(s.desc)}</p>
        <div class="mws-svc__grid">
          <div><p class="mws-mini">${esc(copy.ui.featuresLabel)}</p>${chips(s.features)}<p class="mws-mini">${esc(copy.ui.targetLabel)}</p><p class="mws-body mws-body--ink">${esc(s.target)}</p></div>
          <div>${nowNext(copy, s.now, s.next)}<p class="mws-svc__cta">${itemCta(lang, copy, s.cta, s.name)}</p></div>
        </div>
      </div>
    </li>`;
  const groups = p.groups.map((g, gi) => `<section class="mws-gsplit" id="mws-group-${gi + 1}" aria-labelledby="mws-group-${gi + 1}-title">
      <div class="mws-gsplit__head"><span class="mws-letter mws-letter--lg">${letter(gi)}</span><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-group-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-body">${esc(g.lead)}</p></div>
      <ol class="mws-svcs">${g.items.map((n) => svcRow(p.items[n - 1], n)).join("")}</ol>
    </section>`).join("");
  const list = section({
    id: "mws-services",
    inner: `<div class="mws-rowhead">${head({ id: "mws-services", kicker: `${p.items.length} AREAS`, title: `${copy.ui.brand} ${copy.nav[1].label}` })}</div>${groups}`,
  });

  // Now & next — areas regrouped by status (one label per group)
  const sb = p.statusBoard;
  const byStatus = STATUS_ORDER.map((st) => ({ st, nums: p.items.map((s, i) => (s.status === st ? i + 1 : 0)).filter(Boolean) }));
  const statusBoard = section({
    id: "mws-now", tone: "tint",
    inner: `${head({ id: "mws-now", kicker: sb.kicker, title: sb.title, lead: sb.lead, cls: "mws-head--wide" })}
      <ol class="mws-board mws-board--4">${byStatus.map(({ st, nums }) => `<li class="mws-board__cell">
        <div class="mws-board__top">${badge(copy, st)}<span class="mws-count">${pad(nums.length)}</span></div>
        <p class="mws-body">${esc(sb.groups[st])}</p>
        <ul class="mws-jump">${nums.map((n) => `<li><a href="#mws-svc-${n}"><span>${pad(n)}</span>${esc(p.items[n - 1].name)}</a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });

  // How features connect — connected nodes
  const f = p.flow;
  const flow = section({
    id: "mws-flow",
    inner: `${head({ id: "mws-flow", kicker: f.kicker, title: f.title, lead: f.lead, note: f.note })}
      <ol class="mws-nodes">${f.items.map((it, i) => `<li class="mws-node"><span class="mws-node__dot" aria-hidden="true"></span><span class="mws-node__n">${pad(i + 1)}</span><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ol>`,
  });

  // Scenarios — two-column cards
  const sc = p.scenarios;
  const scenarios = section({
    id: "mws-scenarios",
    inner: `${head({ id: "mws-scenarios", kicker: sc.kicker, title: sc.title, lead: sc.lead })}
      <ul class="mws-cards2">${sc.items.map((it, i) => `<li class="mws-card2">
        <div class="mws-card2__top"><span class="mws-card2__n">${pad(i + 1)}</span><span class="mws-tag">${esc(it.persona)}</span></div>
        <h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3>
        ${chips(it.steps)}
        ${nowNext(copy, it.now, it.later)}
      </li>`).join("")}</ul>`,
  });

  // User types — split + directory
  const u = p.users;
  const users = split({ id: "mws-users", kicker: u.kicker, title: u.title, lead: u.lead, note: u.note, listCls: "mws-dir", rows: dirRows(u.items) });

  // Privacy & trust — compact board
  const t = p.trust;
  const trust = section({
    id: "mws-trust",
    inner: `${head({ id: "mws-trust", kicker: t.kicker, title: t.title, lead: t.lead, cls: "mws-head--wide" })}${boardCompact(t.items)}`,
  });

  // App guide — tinted timeline
  const g = p.guide;
  const guide = section({
    id: "mws-guide", tone: "tint",
    inner: `<div class="mws-rowhead">${head({ id: "mws-guide", kicker: g.kicker, title: g.title, lead: g.lead, note: g.note })}<div class="mws-actions">${storeButtons(copy)}</div></div>
      <ol class="mws-timeline">${g.steps.map((s, i) => `<li><span class="mws-timeline__dot" aria-hidden="true"></span><span class="mws-timeline__n">${pad(i + 1)}</span><p class="mws-en">${esc(s.en)}</p><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });

  // FAQ — split + accordion
  const fq = p.faq;
  const faq = split({ id: "mws-faq", kicker: fq.kicker, title: fq.title, listCls: "mws-faq", rows: faqRows(fq.items) });

  return [h, shots, index, list, statusBoard, flow, scenarios, users, trust, guide, faq,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 03 BUSINESS ================= */
function business(lang, copy) {
  const b = copy.business;
  const h = hero(copy, b.hero, {
    ctas: hbtn(pageHref(lang, "partnerships"), copy.ui.partnerCta, {}) + hbtn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });

  // Model overview — split + boxed rows
  const m = b.model;
  const model = split({
    id: "mws-model", kicker: m.kicker, title: m.title, lead: m.lead,
    rows: m.items.map((it, i) => rosterRow(pad(i + 1), it.body, it.name)).join(""),
  });

  // Who pays — tinted big-number figures (structure label as the heading)
  const py = b.payers;
  const payers = section({
    id: "mws-payers", tone: "tint",
    inner: `${head({ id: "mws-payers", kicker: py.kicker, title: py.title, lead: py.lead, cls: "mws-head--wide" })}
      <ol class="mws-figures">${py.items.map((it, i) => `<li>
        <span class="mws-figures__n">${pad(i + 1)}</span>
        <h3 class="mws-h3 mws-h3--lg" lang="en">${esc(it.name)}</h3>
        <p class="mws-meta"><span>${esc(copy.ui.payerLabel)}</span>${esc(it.target)}</p>
        <p class="mws-body">${esc(it.how)}</p>
      </li>`).join("")}</ol>`,
  });

  // 8 groups · 20 business lines — 4-col board; each line jumps to its revenue model
  const groupsIdx = section({
    id: "mws-groups",
    inner: `${head({ id: "mws-groups", kicker: b.groupsKicker, title: b.groupsTitle, lead: b.groupsLead })}
      <ol class="mws-board mws-board--4">${b.groups.map((g, gi) => `<li class="mws-board__cell">
        <div class="mws-board__top"><span class="mws-letter">${letter(gi)}</span><span class="mws-count">${pad(g.lines.length)}</span></div>
        <p class="mws-en">${esc(g.en)}</p>
        <h3 class="mws-h3">${esc(g.name)}</h3>
        <p class="mws-body">${esc(g.lead)}</p>
        <ul class="mws-jump">${g.lines.map((n) => `<li><a href="#mws-rev-${b.lines[n - 1].rev}"><span>${pad(n)}</span>${esc(b.lines[n - 1].name)}</a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });

  // 13 revenue models — grouped by activation stage (the group heading carries the status)
  const rv = b.revenue;
  const dl = (l) => [
    [copy.ui.payerLabel, l.payer],
    [copy.ui.revenueLabel, l.how],
    [copy.ui.valueLabel, l.value],
    [copy.ui.nowLabel, l.now],
  ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  const revRow = (l, n) => `<li class="mws-spec" id="mws-rev-${n}">
      <div class="mws-spec__side">
        <span class="mws-spec__n">${pad(n)}</span>
        <p class="mws-en">${esc(l.en)}</p>
        <h4 class="mws-h3 mws-h3--lg">${esc(l.name)}</h4>
      </div>
      <div class="mws-spec__main"><dl class="mws-dl">${dl(l)}</dl></div>
    </li>`;
  const stages = rv.stages.map((g, gi) => `<section class="mws-sgroup" id="mws-stage-${gi + 1}" aria-labelledby="mws-stage-${gi + 1}-title">
      <div class="mws-sgroup__head"><span class="mws-letter">${letter(gi)}</span><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-stage-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-body">${esc(g.lead)}</p></div>
      <ol class="mws-specs">${g.items.map((n) => revRow(rv.items[n - 1], n)).join("")}</ol>
    </section>`).join("");
  const revenue = section({
    id: "mws-revenue",
    inner: `${head({ id: "mws-revenue", kicker: rv.kicker, title: rv.title, lead: rv.lead, cls: "mws-head--wide" })}${stages}${notes(copy, ["priceNote", "partnerNote"])}`,
  });

  // Subscription — tinted big-number columns
  const su = b.subscription;
  const subscription = section({
    id: "mws-subscription", tone: "tint",
    inner: `${head({ id: "mws-subscription", kicker: su.kicker, title: su.title, lead: su.lead, cls: "mws-head--wide" })}
      <ol class="mws-cols mws-cols--3 mws-cols--big">${su.items.map((it, i) => `<li class="mws-col"><span class="mws-col__n">${pad(i + 1)}</span><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p><p class="mws-col__tags">${esc(it.tags)}</p></li>`).join("")}</ol>`,
  });

  // Booking & brokerage principles — large statements
  const de = b.deals;
  const deals = section({
    id: "mws-deals",
    inner: `${head({ id: "mws-deals", kicker: de.kicker, title: de.title })}
      <ol class="mws-statements">${de.items.map((t, i) => `<li><span class="mws-statements__n">${pad(i + 1)}</span><p>${esc(t)}</p></li>`).join("")}</ol>`,
  });

  // Business & institution tools — split + modules
  const s = b.saas;
  const saas = split({
    id: "mws-saas", kicker: s.kicker, title: s.title, lead: s.lead, listCls: "mws-modules",
    aside: `<p class="mws-saas__badge">${badge(copy, "review")}</p>`,
    rows: s.items.map((it, i) => `<li><span class="mws-modules__n">${pad(i + 1)}</span><h3 class="mws-h4" lang="en">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join(""),
  });

  // Market opportunity — two-column cards
  const mk = b.market;
  const market = section({
    id: "mws-market",
    inner: `${head({ id: "mws-market", kicker: mk.kicker, title: mk.title, lead: mk.lead })}
      <ul class="mws-cards2">${mk.items.map((it, i) => `<li class="mws-card2"><div class="mws-card2__top"><span class="mws-card2__n">${pad(i + 1)}</span></div><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ul>`,
  });

  // Differentiation hypotheses — compact board
  const df = b.diff;
  const diff = section({
    id: "mws-diff",
    inner: `${head({ id: "mws-diff", kicker: df.kicker, title: df.title, lead: df.lead, note: df.note, cls: "mws-head--wide" })}${boardCompact(df.items)}`,
  });

  // Go-to-market — two-column rows + callout
  const gt = b.gtm;
  const gtm = section({
    id: "mws-gtm",
    inner: `${head({ id: "mws-gtm", kicker: gt.kicker, title: gt.title, lead: gt.lead })}
      <ol class="mws-rows2">${gt.items.map((it, i) => `<li><span class="mws-rows2__n">${pad(i + 1)}</span><div><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></div></li>`).join("")}</ol>
      <p class="mws-callout"><strong lang="en">BEACHHEAD</strong><span>${esc(gt.callout)}</span></p>`,
  });

  // Roadmap — tinted boxed steps
  const r = b.roadmap;
  const roadmap = section({
    id: "mws-roadmap", tone: "tint",
    inner: `${head({ id: "mws-roadmap", kicker: r.kicker, title: r.title, lead: r.lead, note: r.note, cls: "mws-head--wide" })}${roadSteps(copy, r)}`,
  });

  // Operations & legal — compact board
  const t = b.trust;
  const trust = section({
    id: "mws-trust",
    inner: `${head({ id: "mws-trust", kicker: t.kicker, title: t.title, lead: t.lead, cls: "mws-head--wide" })}${boardCompact(t.items)}
      <div class="mws-actions">${btn(pageHref(lang, "partnerships"), copy.ui.partnerCta)}${btn(formHref(lang, "general"), copy.ui.formCta, { ghost: true })}</div>`,
  });

  return [h, model, payers, groupsIdx, revenue, subscription, deals, saas, market, diff, gtm, roadmap, trust,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 04 PARTNERSHIPS ================= */
function partnerships(lang, copy) {
  const p = copy.partnerships;
  const h = hero(copy, p.hero, {
    ctas: hbtn(mailHref(copy, copy.ui.partnerCta), copy.ui.partnerCta, {}) + hbtn(pageHref(lang, "business"), copy.ui.businessCta, { ghost: true }),
  });

  // Vision — split + boxed rows
  const why = split({
    id: "mws-why", kicker: p.why.kicker, title: p.why.title,
    rows: p.why.items.map((t, i) => rosterRow(pad(i + 1), t)).join(""),
  });

  // Models — 3 big-number columns
  const models = section({
    id: "mws-models",
    inner: `${head({ id: "mws-models", kicker: p.models.kicker, title: p.models.title })}
      <ol class="mws-cols mws-cols--3">${p.models.items.map((m, i) => `<li class="mws-col"><span class="mws-col__n">${pad(i + 1)}</span><h3 class="mws-h3">${esc(m.name)}</h3><p class="mws-body">${esc(m.body)}</p></li>`).join("")}</ol>`,
  });

  // Partner types — grouped boxed cards
  const card = (t, n) => `<li class="mws-pcard" id="mws-partner-${n}">
      <div class="mws-pcard__top"><span class="mws-ico-box">${icon(t.icon)}</span><span class="mws-pcard__n">${pad(n)}</span></div>
      <p class="mws-tag">${esc(t.field)}</p>
      <h4 class="mws-h3">${esc(t.name)}</h4>
      <dl class="mws-dl mws-dl--stack">${[
        [copy.ui.targetLabel, t.target],
        [copy.ui.collabLabel, t.collab],
        [copy.ui.valueLabel, t.value],
        [copy.ui.revenueLabel, t.revenue],
        [copy.ui.termsLabel, t.terms],
      ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      <p class="mws-pcard__cta"><a class="mws-link" href="${esc(mailHref(copy, `${copy.ui.partnerCta} — ${t.name}`))}">${esc(copy.ui.partnerCta)} ${arrow}</a></p>
    </li>`;
  const types = section({
    id: "mws-partners",
    inner: `${head({ id: "mws-partners", kicker: p.typesKicker, title: p.typesTitle })}
      ${p.groups.map((g, gi) => `<section class="mws-pgroup" id="mws-pgroup-${gi + 1}" aria-labelledby="mws-pgroup-${gi + 1}-title">
        <div class="mws-pgroup__head"><span class="mws-letter">${letter(gi)}</span><h3 class="mws-gtitle" id="mws-pgroup-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-en">${esc(g.en)}</p><span class="mws-count">${pad(g.items.length)}</span></div>
        <ul class="mws-pcards">${g.items.map((n) => card(p.items[n - 1], n)).join("")}</ul>
      </section>`).join("")}
      ${notes(copy, ["priceNote", "partnerNote"])}`,
  });

  // Scenarios — two-column cards + campaign idea cloud
  const sc = p.scenarios;
  const scenarios = section({
    id: "mws-scenarios",
    inner: `${head({ id: "mws-scenarios", kicker: sc.kicker, title: sc.title, lead: sc.lead })}
      <ul class="mws-cards2">${sc.items.map((it, i) => `<li class="mws-card2">
        <div class="mws-card2__top"><span class="mws-card2__n">${pad(i + 1)}</span><span class="mws-tag">${esc(it.partner)}</span></div>
        <h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3>
        <p class="mws-body">${esc(it.body)}</p>
        ${chips(it.chips)}
      </li>`).join("")}</ul>
      <div class="mws-cloud"><p class="mws-mini">${esc(sc.campaignsTitle)}</p>${chips(sc.campaigns, "mws-chips--cloud")}</div>`,
  });

  // PoC & pilots — spec rows
  const pc = p.poc;
  const pocRow = (it, i) => `<li class="mws-spec" id="mws-poc-${i + 1}">
      <div class="mws-spec__side"><span class="mws-spec__n">${pad(i + 1)}</span><p class="mws-en">${esc(it.en)}</p><h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3><p class="mws-tag">${esc(it.partner)}</p></div>
      <div class="mws-spec__main">
        <p class="mws-body mws-body--ink">${esc(it.intro)}</p>
        <dl class="mws-dl">${[[copy.ui.scopeLabel, it.scope], [copy.ui.measureLabel, it.measure], [copy.ui.conditionLabel, it.premise]].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
        <p class="mws-spec__cta"><a class="mws-link" href="${esc(mailHref(copy, `PoC — ${it.name}`))}">${esc(copy.ui.partnerCta)} ${arrow}</a></p>
      </div>
    </li>`;
  const poc = section({
    id: "mws-poc", tone: "tint",
    inner: `${head({ id: "mws-poc", kicker: pc.kicker, title: pc.title, lead: pc.lead, cls: "mws-head--wide" })}<ol class="mws-specs">${pc.items.map(pocRow).join("")}</ol>`,
  });

  // Data & API — three columns
  const da = p.data;
  const data = section({
    id: "mws-data",
    inner: `${head({ id: "mws-data", kicker: da.kicker, title: da.title, lead: da.lead })}
      <ol class="mws-cols mws-cols--3">${da.items.map((it, i) => `<li class="mws-col"><span class="mws-col__n">${pad(i + 1)}</span><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p><p class="mws-col__tags">${esc(it.tags)}</p></li>`).join("")}</ol>`,
  });

  // Process — tinted timeline
  const pr = p.process;
  const process = section({
    id: "mws-process", tone: "tint",
    inner: `${head({ id: "mws-process", kicker: pr.kicker, title: pr.title })}
      <ol class="mws-timeline">${pr.steps.map((s, i) => `<li><span class="mws-timeline__dot" aria-hidden="true"></span><span class="mws-timeline__n">${pad(i + 1)}</span><p class="mws-en">${esc(s.en)}</p><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });

  // Partner value — compact board
  const va = p.value;
  const value = section({
    id: "mws-value",
    inner: `${head({ id: "mws-value", kicker: va.kicker, title: va.title, lead: va.lead, cls: "mws-head--wide" })}${boardCompact(va.items)}`,
  });

  // Checklist — split + 2-col check grid
  const ck = p.checklist;
  const checklist = split({
    id: "mws-checklist", kicker: ck.kicker, title: ck.title, listCls: "mws-checks",
    aside: `<div class="mws-actions">${btn(mailHref(copy, copy.ui.partnerCta), copy.ui.partnerCta)}${btn(formHref(lang, "brand"), copy.ui.formCta, { ghost: true })}</div>`,
    rows: ck.items.map((t) => `<li><span class="mws-checks__ico">${icon("check")}</span><p>${esc(t)}</p></li>`).join(""),
  });

  return [h, why, models, types, scenarios, poc, data, process, value, checklist, closeBand(lang, copy)].join("\n");
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

  // Inquiry types — grouped 3-col boards
  const types = section({
    id: "mws-types",
    inner: `${head({ id: "mws-types", kicker: c.typesKicker, title: c.typesTitle })}
      ${c.groups.map((g, gi) => `<section class="mws-cgroup" aria-labelledby="mws-cgroup-${gi + 1}-title">
        <div class="mws-cgroup__head"><span class="mws-letter">${letter(gi)}</span><div><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-cgroup-${gi + 1}-title">${esc(g.name)}</h3></div><p class="mws-body">${esc(g.lead)}</p></div>
        <ul class="mws-board mws-board--3">${g.items.map((n) => {
          const it = c.items[n - 1];
          return `<li class="mws-board__cell"><div class="mws-board__top"><span class="mws-ico-box">${icon(it.icon)}</span><span class="mws-count">${pad(n)}</span></div><h4 class="mws-h3">${esc(it.name)}</h4><p class="mws-body">${esc(it.body)}</p><p class="mws-board__foot mws-board__foot--links">${links(it)}</p></li>`;
        }).join("")}</ul>
      </section>`).join("")}
      <p class="mws-callout"><strong>${esc(c.privacy.label)}</strong><span>${esc(copy.ui.sensitiveNote)}</span></p>`,
  });

  // How — tinted 3 big-number columns
  const how = section({
    id: "mws-how", tone: "tint",
    inner: `${head({ id: "mws-how", kicker: c.how.kicker, title: c.how.title })}
      <ol class="mws-cols mws-cols--3 mws-cols--big">${c.how.steps.map((s, i) => `<li class="mws-col"><span class="mws-col__n">${pad(i + 1)}</span><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });

  // Channels — 2x2 link cards (unchanged destinations)
  const chHref = [`mailto:${MAIL}?subject=${encodeURIComponent(copy.ui.emailSubjectPrefix)}`, `/${lang}/contact/`, `/${lang}/myworld/delete-account/`, `/${lang}/privacy/`];
  const chIcon = ["chat", "building", "shield", "book"];
  const channels = section({
    id: "mws-channels",
    inner: `${head({ id: "mws-channels", kicker: c.channels.kicker, title: c.channels.title })}
      <ul class="mws-links">${c.channels.items.map((ch, i) => `<li><a class="mws-links__a" href="${esc(chHref[i])}"><span class="mws-ico-box">${icon(chIcon[i])}</span><span class="mws-links__body"><span class="mws-links__name">${esc(ch.name)}</span><span class="mws-links__desc">${esc(ch.body)}</span></span><span class="mws-links__go" aria-hidden="true">→</span></a></li>`).join("")}</ul>`,
  });

  // FAQ — split + accordion rows
  const faq = split({ id: "mws-faq", kicker: c.faq.kicker, title: c.faq.title, listCls: "mws-faq", rows: faqRows(c.faq.items) });

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
