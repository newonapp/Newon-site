/**
 * MY WORLD business site — page bodies (scoped to #myworld-site.mws).
 *
 * Visual language = the clean white/black Life Stage system used by PETLOG and BABYLOG:
 * shared dark film hero, the shared five-menu bar (flagship-subnav) directly under it, then white
 * sections with hairlines, generous whitespace, big headings, small uppercase labels and numbered rows.
 * MY WORLD blue (#1769FF / #1257D6) is only a point colour.
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
const rosterRow = (n, body) => `<li><span class="mws-roster__n">${n}</span><p>${esc(body)}</p></li>`;
const shot = (s, cls = "") =>
  `<figure class="mws-phone${cls ? ` ${cls}` : ""}"><img src="${s.src}" alt="${esc(s.alt)}" width="1242" height="2688" loading="lazy" decoding="async" /></figure>`;

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

/* ================= 01 OVERVIEW ================= */
function overview(lang, copy) {
  const o = copy.overview;
  const h = hero(copy, o.hero, {
    ctas: hbtn(pageHref(lang, "platform"), copy.ui.platformCta) + hbtn(pageHref(lang, "contact"), copy.ui.heroInquiryCta || copy.ui.contactCta, { ghost: true }),
  });

  // NOW — slim status strip
  const now = `<div class="mws-now"><div class="mws__wrap mws-now__inner"><span class="mws-now__tag">${esc(o.now.kicker)}</span><p>${esc(o.now.text)}</p></div></div>`;

  // Vision — split + boxed numbered rows
  const vision = split({
    id: "mws-vision", kicker: o.vision.kicker, title: o.vision.title,
    rows: o.vision.items.map((t, i) => rosterRow(pad(i + 1), t)).join(""),
  });

  // Journey — light tabs
  const j = o.journey;
  const tabs = j.items
    .map((s, i) => `<button type="button" class="mws-tab" role="tab" id="mws-tab-${s.id}" aria-controls="mws-panel-${s.id}" aria-selected="${i === 4}" tabindex="${i === 4 ? 0 : -1}"><span class="mws-tab__n">${pad(i + 1)}</span><span class="mws-tab__name">${esc(s.name)}</span>${s.status === "live" ? `<span class="mws-tab__live" aria-hidden="true"></span>` : ""}</button>`)
    .join("");
  const panels = j.items
    .map((s, i) => `<div class="mws-panel" role="tabpanel" id="mws-panel-${s.id}" aria-labelledby="mws-tab-${s.id}"${i === 4 ? "" : " data-hidden"}>
        <div class="mws-panel__visual mws-panel__visual--${s.status}" aria-hidden="true"><span class="mws-panel__n">${pad(i + 1)} / ${pad(j.items.length)}</span><span class="mws-panel__big" lang="en">${esc(s.en)}</span></div>
        <div class="mws-panel__body">
          <p class="mws-en">${pad(i + 1)} · ${esc(s.en)}</p>
          <h3 class="mws-h3 mws-h3--lg">${esc(s.head)}</h3>
          <p class="mws-body">${esc(s.lead)}</p>
          ${chips(s.chips)}
          <p class="mws-panel__status">${badge(copy, s.status)}</p>
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

  // Pillars — five big-number columns
  const p = o.pillars;
  const pillars = section({
    id: "mws-pillars",
    inner: `${head({ id: "mws-pillars", kicker: p.kicker, title: p.title, lead: p.lead, cls: "mws-head--wide" })}
      <ol class="mws-cols mws-cols--5">${p.items.map((c, i) => `<li class="mws-col">
        <span class="mws-col__n">${pad(i + 1)}</span>
        <p class="mws-en">${esc(c.en)}</p>
        <h3 class="mws-h3">${esc(c.name)}</h3>
        <p class="mws-body">${esc(c.lead)}</p>
        <p class="mws-col__tags">${c.chips.map(esc).join('<span aria-hidden="true"> · </span>')}</p>
        <p class="mws-col__foot">${badge(copy, c.status)}</p>
      </li>`).join("")}</ol>`,
  });

  // Memories — tinted band, numbered list + three app screens
  const m = o.memories;
  const memories = section({
    id: "mws-memories", tone: "tint",
    inner: `<div class="mws-feature">
        <div class="mws-feature__copy">
          ${head({ id: "mws-memories", kicker: m.kicker, title: m.title, lead: m.lead })}
          <p class="mws-feature__badge">${badge(copy, "live")}</p>
          <ol class="mws-dir mws-dir--compact">${m.items.map((it, i) => `<li><span class="mws-dir__n">${pad(i + 1)}</span><div><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></div></li>`).join("")}</ol>
          <div class="mws-actions">${btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true })}</div>
        </div>
        <div class="mws-phones">${m.shots.map((s, i) => shot(s, `mws-phone--${i + 1}`)).join("")}</div>
      </div>`,
  });

  // Planning — two-column numbered rows
  const pl = o.planning;
  const planning = section({
    id: "mws-planning",
    inner: `${head({ id: "mws-planning", kicker: pl.kicker, title: pl.title, lead: pl.lead })}
      <ol class="mws-rows2">${pl.items.map((it, i) => `<li><span class="mws-rows2__n">${pad(i + 1)}</span><div><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p>${badge(copy, it.status)}</div></li>`).join("")}</ol>`,
  });

  // Booking — 4-col icon board + chip cloud
  const b = o.booking;
  const booking = section({
    id: "mws-booking",
    inner: `${head({ id: "mws-booking", kicker: b.kicker, title: b.title, lead: b.lead, note: b.note, cls: "mws-head--wide" })}
      <ul class="mws-board mws-board--4">${b.items.map((t) => `<li class="mws-board__cell">
        <span class="mws-ico-box">${icon(t.icon)}</span>
        <p class="mws-en">${esc(t.en)}</p>
        <h3 class="mws-h3">${esc(t.name)}</h3>
        <p class="mws-body">${esc(t.body)}</p>
        <p class="mws-board__foot">${badge(copy, t.status)}</p>
      </li>`).join("")}</ul>
      <div class="mws-cloud"><p class="mws-mini">${esc(b.packagesTitle)}</p>${chips(b.packages, "mws-chips--cloud")}</div>`,
  });

  // Commerce — two-column signal cards + SHAREON callout
  const c = o.commerce;
  const commerce = section({
    id: "mws-commerce",
    inner: `${head({ id: "mws-commerce", kicker: c.kicker, title: c.title, lead: c.lead })}
      <ul class="mws-cards2">${c.items.map((it, i) => `<li class="mws-card2">
        <div class="mws-card2__top"><span class="mws-card2__n">${pad(i + 1)}</span>${badge(copy, it.status)}</div>
        <h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3>
        <p class="mws-body">${esc(it.body)}</p>
        ${chips(it.chips)}
      </li>`).join("")}</ul>
      <p class="mws-callout"><strong lang="en">SHAREON</strong><span>${esc(c.shareon)}</span></p>`,
  });

  // Ecosystem — connected nodes
  const e = o.ecosystem;
  const ecosystem = section({
    id: "mws-ecosystem",
    inner: `<div class="mws-eco-head">${head({ id: "mws-ecosystem", kicker: e.kicker, title: e.title, lead: e.lead })}<div class="mws-actions">${btn(pageHref(lang, "business"), copy.ui.businessCta, { ghost: true })}</div></div>
      <ol class="mws-nodes">${e.items.map((it, i) => `<li class="mws-node"><span class="mws-node__dot" aria-hidden="true"></span><span class="mws-node__n">${pad(i + 1)}</span><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ol>`,
  });

  // Roadmap — boxed steps
  const r = o.roadmap;
  const roadmap = section({
    id: "mws-roadmap", tone: "tint",
    inner: `${head({ id: "mws-roadmap", kicker: r.kicker, title: r.title, lead: r.lead, note: r.note, cls: "mws-head--wide" })}${roadSteps(copy, r)}`,
  });

  // NEWON — split + plain directory rows
  const nw = o.newon;
  const newon = split({
    id: "mws-newon", kicker: nw.kicker, title: nw.title, lead: nw.lead, note: nw.note, listCls: "mws-dir",
    rows: nw.items.map((it, i) => `<li${it.self ? ' class="is-self"' : ""}><span class="mws-dir__n">${pad(i + 1)}</span><div><h3 class="mws-h4" lang="en">${esc(it.name)}</h3><p class="mws-body">${esc(it.role)}</p></div></li>`).join(""),
  });

  return [h, now, vision, journey, pillars, memories, planning, booking, commerce, ecosystem, roadmap, newon,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 02 PLATFORM ================= */
function platform(lang, copy) {
  const p = copy.platform;
  const h = hero(copy, p.hero, {
    ctas: hbtn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true }) + hbtn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });

  // App screens — tinted band, screenshot row
  const shots = section({
    id: "mws-shots", tone: "tint",
    inner: `<div class="mws-rowhead">${head({ id: "mws-shots", kicker: p.shotsKicker, title: p.shotsTitle })}<div class="mws-actions">${btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true })}</div></div>
      <div class="mws-strip" tabindex="0" role="region" aria-label="${esc(p.shotsTitle)}">${p.shots.map((s) => shot(s)).join("")}</div>`,
  });

  // Service map — 3-col board with letters
  const index = section({
    id: "mws-index",
    inner: `${head({ id: "mws-index", kicker: p.indexKicker, title: p.indexTitle })}
      <ol class="mws-board mws-board--3">${p.groups.map((g, gi) => `<li class="mws-board__cell">
        <div class="mws-board__top"><span class="mws-letter">${letter(gi)}</span><span class="mws-count">${pad(g.items.length)}</span></div>
        <p class="mws-en">${esc(g.en)}</p>
        <h3 class="mws-h3"><a class="mws-title-link" href="#mws-group-${gi + 1}">${esc(g.name)}</a></h3>
        <p class="mws-body">${esc(g.lead)}</p>
        <ul class="mws-jump">${g.items.map((n) => `<li><a href="#mws-svc-${n}"><span>${pad(n)}</span>${esc(p.items[n - 1].name)}</a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });

  // 20 services — sticky group heading + service rows
  const svcRow = (s, n) => `<li class="mws-svc" id="mws-svc-${n}">
      <div class="mws-svc__side"><span class="mws-ico-box">${icon(s.icon)}</span><span class="mws-svc__n">${pad(n)}</span></div>
      <div class="mws-svc__main">
        <div class="mws-svc__title"><div><p class="mws-en">${esc(s.en)}</p><h4 class="mws-h3 mws-h3--lg">${esc(s.name)}</h4></div>${badge(copy, s.status)}</div>
        <p class="mws-body">${esc(s.desc)}</p>
        <div class="mws-svc__grid">
          <div><p class="mws-mini">${esc(copy.ui.featuresLabel)}</p>${chips(s.features)}</div>
          <div><p class="mws-mini">${esc(copy.ui.targetLabel)}</p><p class="mws-body mws-body--ink">${esc(s.target)}</p><p class="mws-svc__cta">${itemCta(lang, copy, s.cta, s.name)}</p></div>
        </div>
      </div>
    </li>`;
  const groups = p.groups.map((g, gi) => `<section class="mws-gsplit" id="mws-group-${gi + 1}" aria-labelledby="mws-group-${gi + 1}-title">
      <div class="mws-gsplit__head"><span class="mws-letter mws-letter--lg">${letter(gi)}</span><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-group-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-body">${esc(g.lead)}</p></div>
      <ol class="mws-svcs">${g.items.map((n) => svcRow(p.items[n - 1], n)).join("")}</ol>
    </section>`).join("");
  const list = section({
    id: "mws-services",
    inner: `<div class="mws-rowhead">${head({ id: "mws-services", kicker: `${p.items.length} SERVICES`, title: `${copy.ui.brand} ${copy.nav[1].label}` })}${legend(copy)}</div>${groups}`,
  });
  return [h, shots, index, list, `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 03 BUSINESS ================= */
function business(lang, copy) {
  const b = copy.business;
  const h = hero(copy, b.hero, {
    ctas: hbtn(pageHref(lang, "partnerships"), copy.ui.partnerCta, {}) + hbtn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });

  // 8 groups — 4-col board with letters
  const groupsIdx = section({
    id: "mws-groups",
    inner: `${head({ id: "mws-groups", kicker: b.groupsKicker, title: b.groupsTitle, lead: b.groupsLead })}
      <ol class="mws-board mws-board--4">${b.groups.map((g, gi) => `<li class="mws-board__cell">
        <div class="mws-board__top"><span class="mws-letter">${letter(gi)}</span><span class="mws-count">${pad(g.lines.length)}</span></div>
        <p class="mws-en">${esc(g.en)}</p>
        <h3 class="mws-h3"><a class="mws-title-link" href="#mws-bgroup-${gi + 1}">${esc(g.name)}</a></h3>
        <p class="mws-body">${esc(g.lead)}</p>
        <ul class="mws-jump">${g.lines.map((n) => `<li><a href="#mws-line-${n}"><span>${pad(n)}</span>${esc(b.lines[n - 1].name)}</a></li>`).join("")}</ul>
      </li>`).join("")}</ol>`,
  });

  // 20 business lines — spec rows grouped
  const dl = (l) => [
    [copy.ui.customersLabel, l.customers],
    [copy.ui.valueLabel, l.value],
    [copy.ui.revenueLabel, l.revenue],
    [copy.ui.partnersLabel, l.partners],
  ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  const lineRow = (l, n) => `<li class="mws-spec" id="mws-line-${n}">
      <div class="mws-spec__side">
        <span class="mws-spec__n">${pad(n)}</span>
        <p class="mws-en">${esc(l.en)}</p>
        <h4 class="mws-h3 mws-h3--lg">${esc(l.name)}</h4>
        ${badge(copy, l.status)}
      </div>
      <div class="mws-spec__main">
        <p class="mws-body mws-body--ink">${esc(l.intro)}</p>
        <p class="mws-mini">${esc(copy.ui.servicesLabel)}</p>
        ${chips(l.services)}
        <dl class="mws-dl">${dl(l)}</dl>
        <p class="mws-spec__cta">${itemCta(lang, copy, l.cta, l.name)}</p>
      </div>
    </li>`;
  const lineGroups = b.groups.map((g, gi) => `<section class="mws-sgroup" id="mws-bgroup-${gi + 1}" aria-labelledby="mws-bgroup-${gi + 1}-title">
      <div class="mws-sgroup__head"><span class="mws-letter">${letter(gi)}</span><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-bgroup-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-body">${esc(g.lead)}</p></div>
      <ol class="mws-specs">${g.lines.map((n) => lineRow(b.lines[n - 1], n)).join("")}</ol>
    </section>`).join("");
  const linesBlock = section({
    id: "mws-lines",
    inner: `<div class="mws-rowhead">${head({ id: "mws-lines", kicker: b.linesKicker, title: b.linesTitle })}${legend(copy)}</div>${lineGroups}${notes(copy, ["priceNote", "partnerNote"])}`,
  });

  // Revenue — tinted big-number figures
  const rv = b.revenue;
  const revenue = section({
    id: "mws-revenue", tone: "tint",
    inner: `${head({ id: "mws-revenue", kicker: rv.kicker, title: rv.title, lead: rv.lead, cls: "mws-head--wide" })}
      <ol class="mws-figures">${rv.items.map((it, i) => `<li>
        <span class="mws-figures__n">${pad(i + 1)}</span>
        <h3 class="mws-h3 mws-h3--lg">${esc(it.name)}</h3>
        <p class="mws-meta"><span>${esc(copy.ui.customersLabel)}</span>${esc(it.target)}</p>
        <p class="mws-body">${esc(it.how)}</p>
      </li>`).join("")}</ol>
      ${notes(copy, ["priceNote"])}`,
  });

  // SaaS — split + module directory
  const s = b.saas;
  const saas = split({
    id: "mws-saas", kicker: s.kicker, title: s.title, lead: s.lead, listCls: "mws-modules",
    aside: `<p class="mws-saas__badge">${badge(copy, "review")}</p>`,
    rows: s.items.map((it, i) => `<li><span class="mws-modules__n">${pad(i + 1)}</span><h3 class="mws-h4" lang="en">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join(""),
  });

  // Roadmap — boxed steps
  const r = copy.overview.roadmap;
  const roadmap = section({
    id: "mws-roadmap", tone: "tint",
    inner: `${head({ id: "mws-roadmap", kicker: r.kicker, title: r.title, lead: r.lead, note: r.note, cls: "mws-head--wide" })}${roadSteps(copy, r)}`,
  });

  // Commerce principles — large statements
  const cm = b.commerce;
  const commerce = section({
    id: "mws-commerce",
    inner: `${head({ id: "mws-commerce", kicker: cm.kicker, title: cm.title })}
      <ol class="mws-statements">${cm.items.map((t, i) => `<li><span class="mws-statements__n">${pad(i + 1)}</span><p>${esc(t)}</p></li>`).join("")}</ol>`,
  });

  // Trust — 4-col numbered board
  const t = b.trust;
  const trust = section({
    id: "mws-trust",
    inner: `${head({ id: "mws-trust", kicker: t.kicker, title: t.title, lead: t.lead, cls: "mws-head--wide" })}
      <ol class="mws-board mws-board--4 mws-board--compact">${t.items.map((it, i) => `<li class="mws-board__cell"><span class="mws-board__num">${pad(i + 1)}</span><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ol>`,
  });

  return [h, groupsIdx, linesBlock, revenue, saas, roadmap, commerce, trust,
    `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

/* ================= 04 PARTNERSHIPS ================= */
function partnerships(lang, copy) {
  const p = copy.partnerships;
  const h = hero(copy, p.hero, {
    ctas: hbtn(mailHref(copy, copy.ui.partnerCta), copy.ui.partnerCta, {}) + hbtn(pageHref(lang, "business"), copy.ui.businessCta, { ghost: true }),
  });

  // Why — split + boxed rows
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

  // 14 partner types — grouped boxed cards
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

  // Process — tinted timeline
  const pr = p.process;
  const process = section({
    id: "mws-process", tone: "tint",
    inner: `${head({ id: "mws-process", kicker: pr.kicker, title: pr.title })}
      <ol class="mws-timeline">${pr.steps.map((s, i) => `<li><span class="mws-timeline__dot" aria-hidden="true"></span><span class="mws-timeline__n">${pad(i + 1)}</span><p class="mws-en">${esc(s.en)}</p><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });

  // Checklist — split + 2-col check grid
  const ck = p.checklist;
  const checklist = split({
    id: "mws-checklist", kicker: ck.kicker, title: ck.title, listCls: "mws-checks",
    aside: `<div class="mws-actions">${btn(mailHref(copy, copy.ui.partnerCta), copy.ui.partnerCta)}</div>`,
    rows: ck.items.map((t) => `<li><span class="mws-checks__ico">${icon("check")}</span><p>${esc(t)}</p></li>`).join(""),
  });

  return [h, why, models, types, process, checklist, closeBand(lang, copy)].join("\n");
}

/* ================= 05 CONTACT ================= */
function contact(lang, copy) {
  const c = copy.contact;
  const h = hero(copy, c.hero, {
    ctas: hbtn(`mailto:${MAIL}?subject=${encodeURIComponent(copy.ui.emailSubjectPrefix)}`, copy.ui.mailCta, {}) + hbtn(`/${lang}/contact/`, copy.ui.contactPageCta, { ghost: true }),
  });
  const links = (it) => {
    const out = [`<a class="mws-link" href="${esc(mailHref(copy, it.name))}">${esc(copy.ui.mailCta)} ${arrow}</a>`];
    if (it.route === "app") out.push(`<a class="mws-link" href="/${lang}/myworld/delete-account/">${esc(c.channels.items[2].name)} ${arrow}</a>`);
    if (it.route === "partner") out.push(`<a class="mws-link" href="${pageHref(lang, "partnerships")}">${esc(copy.nav[3].label)} ${arrow}</a>`);
    return out.join("");
  };

  // 13 inquiry types — grouped 3-col boards
  const types = section({
    id: "mws-types",
    inner: `${head({ id: "mws-types", kicker: c.typesKicker, title: c.typesTitle })}
      ${c.groups.map((g, gi) => `<section class="mws-cgroup" aria-labelledby="mws-cgroup-${gi + 1}-title">
        <div class="mws-cgroup__head"><span class="mws-letter">${letter(gi)}</span><div><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-cgroup-${gi + 1}-title">${esc(g.name)}</h3></div><p class="mws-body">${esc(g.lead)}</p></div>
        <ul class="mws-board mws-board--3">${g.items.map((n) => {
          const it = c.items[n - 1];
          return `<li class="mws-board__cell"><div class="mws-board__top"><span class="mws-ico-box">${icon(it.icon)}</span><span class="mws-count">${pad(n)}</span></div><h4 class="mws-h3">${esc(it.name)}</h4><p class="mws-body">${esc(it.body)}</p><p class="mws-board__foot mws-board__foot--links">${links(it)}</p></li>`;
        }).join("")}</ul>
      </section>`).join("")}`,
  });

  // How — tinted 3 big-number columns
  const how = section({
    id: "mws-how", tone: "tint",
    inner: `${head({ id: "mws-how", kicker: c.how.kicker, title: c.how.title })}
      <ol class="mws-cols mws-cols--3 mws-cols--big">${c.how.steps.map((s, i) => `<li class="mws-col"><span class="mws-col__n">${pad(i + 1)}</span><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });

  // Channels — 2x2 link cards
  const chHref = [`mailto:${MAIL}?subject=${encodeURIComponent(copy.ui.emailSubjectPrefix)}`, `/${lang}/contact/`, `/${lang}/myworld/delete-account/`, `/${lang}/privacy/`];
  const chIcon = ["chat", "building", "shield", "book"];
  const channels = section({
    id: "mws-channels",
    inner: `${head({ id: "mws-channels", kicker: c.channels.kicker, title: c.channels.title })}
      <ul class="mws-links">${c.channels.items.map((ch, i) => `<li><a class="mws-links__a" href="${esc(chHref[i])}"><span class="mws-ico-box">${icon(chIcon[i])}</span><span class="mws-links__body"><span class="mws-links__name">${esc(ch.name)}</span><span class="mws-links__desc">${esc(ch.body)}</span></span><span class="mws-links__go" aria-hidden="true">→</span></a></li>`).join("")}</ul>`,
  });

  // FAQ — split + accordion rows
  const faq = split({
    id: "mws-faq", kicker: c.faq.kicker, title: c.faq.title, listCls: "mws-faq",
    rows: c.faq.items.map((f, i) => `<li><details><summary><span class="mws-faq__q">Q${i + 1}</span><span class="mws-faq__text">${esc(f.q)}</span></summary><p class="mws-body">${esc(f.a)}</p></details></li>`).join(""),
  });

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
