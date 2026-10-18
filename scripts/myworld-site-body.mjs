/**
 * MY WORLD business site — page bodies (scoped to #myworld-site.mws).
 *
 * Visual language = the clean white/black Life Stage system used by PETLOG and BABYLOG:
 * shared dark film hero, the shared five-menu bar (flagship-subnav) directly under it, then white
 * sections with hairlines, generous whitespace, big headings, small uppercase labels and numbered rows.
 * MY WORLD blue (#1769FF / #1257D6) is only a point colour.
 *
 * One topic per page (2026-10-18 rewrite): the Overview is the brand story only; services, business lines, partner
 * types and inquiry types each live on their own page. Neighbouring sections use different layouts:
 *   statement (editorial big type) · versus (before/after comparison) · feature (copy + app screens) · split ·
 *   htl (horizontal journey timeline) · tabs (V2.0 five tabs) · principles (checklist) · swatches (design language) ·
 *   dir · explore strip · table (responsive comparison tables) · jumpbar + gsplit (sticky grouped rows) ·
 *   statements · faq (<details>) · gindex (index rows with tags) · spec · stepper (money flow) · modules · road ·
 *   board · prows (numbered partner rows) · timeline · checks · desk (contact block) · cols.
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

function closeBand(lang, copy, n = copy.overview.next) {
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

/** Responsive table: real <table> on wide screens, stacked rows (data-label) on phones. */
function table({ cls = "", caption, cols, rows }) {
  const keys = Object.keys(cols);
  return `<div class="mws-table${cls ? ` ${cls}` : ""}"><table>
        <caption class="mws-vh">${esc(caption)}</caption>
        <thead><tr>${keys.map((k) => `<th scope="col">${esc(cols[k])}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((r) => `<tr>${keys.map((k, i) => {
          const v = r[k];
          const tag = i === 0 ? "th" : "td";
          const scope = i === 0 ? ' scope="row"' : "";
          return `<${tag}${scope} data-label="${esc(cols[k])}">${v}</${tag}>`;
        }).join("")}</tr>`).join("")}</tbody>
      </table></div>`;
}

/* ================= 01 OVERVIEW — brand story only ================= */
function overview(lang, copy) {
  const o = copy.overview;
  const h = hero(copy, o.hero, {
    ctas: hbtn(pageHref(lang, "platform"), copy.ui.platformCta) + hbtn(pageHref(lang, "contact"), copy.ui.heroInquiryCta || copy.ui.contactCta, { ghost: true }),
  });

  // NOW — slim status strip
  const now = `<div class="mws-now"><div class="mws__wrap mws-now__inner"><span class="mws-now__tag">${esc(o.now.kicker)}</span><p>${esc(o.now.text)}</p></div></div>`;

  // 1 Manifesto — editorial big type
  const mf = o.manifesto;
  const manifesto = section({
    id: "mws-manifesto",
    inner: `<p class="mws-kicker">${esc(mf.kicker)}</p>
      <h2 class="mws-statement" id="mws-manifesto-title">${lines(mf.statement)}</h2>
      <div class="mws-editorial">${mf.paras.map((t, i) => `<p${i === mf.paras.length - 1 ? ' class="is-ink"' : ""}>${esc(t)}</p>`).join("")}</div>`,
  });

  // 2 Why — before / after comparison
  const w = o.why;
  const why = section({
    id: "mws-why", tone: "tint",
    inner: `${head({ id: "mws-why", kicker: w.kicker, title: w.title, lead: w.lead, cls: "mws-head--wide" })}
      <div class="mws-versus" role="table" aria-label="${esc(w.before)} / ${esc(w.after)}">
        <div class="mws-versus__row mws-versus__row--head" role="row"><span role="columnheader"></span><span role="columnheader">${esc(w.before)}</span><span role="columnheader">${esc(w.after)}</span></div>
        ${w.rows.map((r) => `<div class="mws-versus__row" role="row"><span class="mws-versus__topic" role="rowheader">${esc(r.topic)}</span><span class="mws-versus__before" role="cell"><span class="mws-versus__lbl" aria-hidden="true">${esc(w.before)}</span>${esc(r.before)}</span><span class="mws-versus__after" role="cell"><span class="mws-versus__lbl" aria-hidden="true">${esc(w.after)}</span>${esc(r.after)}</span></div>`).join("")}
      </div>`,
  });

  // 3 Signature — home world map (split visual)
  const sg = o.signature;
  const signature = section({
    id: "mws-signature",
    inner: `<div class="mws-feature">
        <div class="mws-feature__copy">
          ${head({ id: "mws-signature", kicker: sg.kicker, title: sg.title, lead: sg.lead })}
          <p class="mws-feature__badge">${badge(copy, "live")}</p>
          <ol class="mws-dir mws-dir--compact">${sg.items.map((it, i) => `<li><span class="mws-dir__n">${pad(i + 1)}</span><div><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></div></li>`).join("")}</ol>
          <div class="mws-actions">${btn(GOOGLE_PLAY_URL, copy.ui.appCta, { external: true })}</div>
        </div>
        <div class="mws-phones">${sg.shots.map((s, i) => shot(s, `mws-phone--${i + 1}`)).join("")}</div>
      </div>`,
  });

  // 4 Mission & vision — labelled rows
  const ms = o.mission;
  const mission = split({
    id: "mws-mission", kicker: ms.kicker, title: ms.title, lead: ms.lead, listCls: "mws-roster mws-roster--label",
    rows: ms.items.map((it) => `<li><span class="mws-roster__n" lang="en">${esc(it.label)}</span><p>${esc(it.body)}</p></li>`).join(""),
  });

  // 5 Journey — horizontal timeline
  const j = o.journey;
  const journey = section({
    id: "mws-journey",
    inner: `${head({ id: "mws-journey", kicker: j.kicker, title: j.title, lead: j.lead, cls: "mws-head--wide" })}
      <ol class="mws-htl">${j.items.map((s, i) => `<li class="mws-htl__step mws-htl__step--${s.status}">
        <span class="mws-htl__dot" aria-hidden="true"></span>
        <span class="mws-htl__n">${pad(i + 1)}</span>
        <p class="mws-en" lang="en">${esc(s.en)}</p>
        <h3 class="mws-h3">${esc(s.name)}</h3>
        <p class="mws-body">${esc(s.body)}</p>
        ${badge(copy, s.status)}
      </li>`).join("")}</ol>
      <p class="mws-small">${esc(j.note)}</p>`,
  });

  // 6 V2.0 — five tabs
  const v = o.v2;
  const first = 0;
  const tabs = v.tabs
    .map((s, i) => `<button type="button" class="mws-tab" role="tab" id="mws-tab-${s.id}" aria-controls="mws-panel-${s.id}" aria-selected="${i === first}" tabindex="${i === first ? 0 : -1}"><span class="mws-tab__n">${pad(i + 1)}</span><span class="mws-tab__name" lang="en">${esc(s.en)}</span>${s.status === "live" ? `<span class="mws-tab__live" aria-hidden="true"></span>` : ""}</button>`)
    .join("");
  const panels = v.tabs
    .map((s, i) => `<div class="mws-panel" role="tabpanel" id="mws-panel-${s.id}" aria-labelledby="mws-tab-${s.id}"${i === first ? "" : " data-hidden"}>
        <div class="mws-panel__visual mws-panel__visual--${s.status}" aria-hidden="true"><span class="mws-panel__n">${pad(i + 1)} / ${pad(v.tabs.length)}</span><span class="mws-panel__big" lang="en">${esc(s.en)}</span>
          <span class="mws-tabbar">${v.tabs.map((t) => `<span class="mws-tabbar__i${t.id === s.id ? " is-on" : ""}" lang="en">${esc(t.en)}</span>`).join("")}</span></div>
        <div class="mws-panel__body">
          <p class="mws-en">${pad(i + 1)} · ${esc(s.name)}</p>
          <h3 class="mws-h3 mws-h3--lg">${esc(s.head)}</h3>
          <p class="mws-body">${esc(s.lead)}</p>
          ${chips(s.chips)}
          <p class="mws-panel__status">${badge(copy, s.status)}</p>
        </div>
      </div>`)
    .join("");
  const v2 = section({
    id: "mws-v2", tone: "tint",
    inner: `${head({ id: "mws-v2", kicker: v.kicker, title: v.title, lead: v.lead, cls: "mws-head--wide" })}
      <div class="mws-tabs mws-tabs--5" data-mws-tabs>
        <div class="mws-tabs__list" role="tablist" aria-label="${esc(copy.ui.tabsAria)}">${tabs}</div>
        ${panels}
      </div>
      <p class="mws-small">${esc(v.note)}</p>`,
  });

  // 7 Principles — checklist
  const pr = o.principles;
  const principles = section({
    id: "mws-principles",
    inner: `${head({ id: "mws-principles", kicker: pr.kicker, title: pr.title })}
      <ol class="mws-principles">${pr.items.map((it, i) => `<li><span class="mws-checks__ico">${icon("check")}</span><div><p class="mws-principles__n">${pad(i + 1)}</p><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></div></li>`).join("")}</ol>`,
  });

  // 8 Design language — swatches
  const d = o.design;
  const design = section({
    id: "mws-design",
    inner: `<div class="mws-design">
        ${head({ id: "mws-design", kicker: d.kicker, title: d.title, lead: d.lead })}
        <ul class="mws-swatches">${d.swatches.map((s, i) => `<li class="mws-swatch mws-swatch--${i + 1}"><span class="mws-swatch__chip" aria-hidden="true"></span><span class="mws-swatch__name" lang="en">${esc(s.name)}</span><span class="mws-swatch__hex">${esc(s.hex)}</span><span class="mws-swatch__role">${esc(s.role)}</span></li>`).join("")}</ul>
      </div>
      <ol class="mws-rows3">${d.items.map((it, i) => `<li><span class="mws-rows3__n">${pad(i + 1)}</span><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ol>`,
  });

  // 9 Inside NEWON — directory
  const nw = o.newon;
  const newon = split({
    id: "mws-newon", kicker: nw.kicker, title: nw.title, lead: nw.lead, note: nw.note, listCls: "mws-dir",
    rows: nw.items.map((it, i) => `<li${it.self ? ' class="is-self"' : ""}><span class="mws-dir__n">${pad(i + 1)}</span><div><h3 class="mws-h4" lang="en">${esc(it.name)}</h3><p class="mws-body">${esc(it.role)}</p></div></li>`).join(""),
  });

  // Explore strip — links to the other four pages only
  const ex = o.explore;
  const explore = `<nav class="mws-explore" aria-labelledby="mws-explore-title"><div class="mws__wrap">
      <div class="mws-explore__head"><p class="mws-kicker">${esc(ex.kicker)}</p><h2 class="mws-h3 mws-h3--lg" id="mws-explore-title">${esc(ex.title)}</h2></div>
      <ul class="mws-explore__list">${ex.items.map((it) => {
        const f = FLAGSHIP_PAGES.find((x) => x.id === it.id);
        const nav = copy.nav.find((x) => x.id === it.id);
        return `<li><a href="${pageHref(lang, it.id)}"><span class="mws-explore__n">${f.n}</span><span class="mws-explore__name">${esc(lang === "ko" ? `${f.en} · ${nav.label}` : f.en)}</span><span class="mws-explore__body">${esc(it.body)}</span><span class="mws-arrow" aria-hidden="true">→</span></a></li>`;
      }).join("")}</ul>
    </div></nav>`;

  return [h, now, manifesto, why, signature, mission, journey, v2, principles, design, newon, explore,
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

  // Today / next — comparison table per V2 tab
  const tm = p.tabmap;
  const tabmap = section({
    id: "mws-tabmap",
    inner: `${head({ id: "mws-tabmap", kicker: tm.kicker, title: tm.title, lead: tm.lead, cls: "mws-head--wide" })}
      ${table({
        cls: "mws-table--tabmap",
        caption: oneLine(tm.title),
        cols: tm.cols,
        rows: tm.rows.map((r) => ({ tab: `<span lang="en">${esc(r.tab)}</span>`, now: esc(r.now), next: esc(r.next), status: badge(copy, r.status) })),
      })}`,
  });

  // Sticky jump index + 20 services in groups
  const jump = `<nav class="mws-jumpbar" aria-label="${esc(copy.ui.jumpAria)}"><ol>${p.groups.map((g, gi) => `<li><a href="#mws-group-${gi + 1}"><span class="mws-jumpbar__l">${letter(gi)}</span>${esc(g.name)}<span class="mws-jumpbar__c">${pad(g.items.length)}</span></a></li>`).join("")}</ol></nav>`;
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
      <div class="mws-gsplit__head"><span class="mws-letter mws-letter--lg">${letter(gi)}</span><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-group-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-body">${esc(g.lead)}</p><p class="mws-count">${pad(g.items.length)} SERVICES</p></div>
      <ol class="mws-svcs">${g.items.map((n) => svcRow(p.items[n - 1], n)).join("")}</ol>
    </section>`).join("");
  const list = section({
    id: "mws-services",
    inner: `<div class="mws-rowhead">${head({ id: "mws-services", kicker: `${p.items.length} SERVICES`, title: p.indexTitle })}${legend(copy)}</div>${jump}${groups}`,
  });

  // How records are handled — statements
  const rc = p.records;
  const records = section({
    id: "mws-records", tone: "tint",
    inner: `${head({ id: "mws-records", kicker: rc.kicker, title: rc.title })}
      <ol class="mws-statements">${rc.items.map((t, i) => `<li><span class="mws-statements__n">${pad(i + 1)}</span><p>${esc(t)}</p></li>`).join("")}</ol>`,
  });

  // FAQ — split + accordion
  const faq = faqBlock("mws-pfaq", p.faq);

  return [h, shots, tabmap, list, records, faq, `<div class="mws__wrap">${notes(copy, ["scopeNote", "planNote"])}</div>`, closeBand(lang, copy)].join("\n");
}

function faqBlock(id, f) {
  return split({
    id, kicker: f.kicker, title: f.title, listCls: "mws-faq",
    rows: f.items.map((x, i) => `<li><details><summary><span class="mws-faq__q">Q${i + 1}</span><span class="mws-faq__text">${esc(x.q)}</span></summary><p class="mws-body">${esc(x.a)}</p></details></li>`).join(""),
  });
}

function roadSteps(copy, r) {
  return `<ol class="mws-road">${r.items.map((s, i) => `<li class="mws-road__step${i === 0 ? " is-current" : ""}">
        <span class="mws-road__n">${pad(i + 1)}</span>
        <p class="mws-road__stage">${esc(s.stage)}${i === 0 ? ` <span class="mws-current">${esc(copy.ui.currentStage)}</span>` : ""}</p>
        <h3 class="mws-h3">${esc(s.name)}</h3>
        <p class="mws-body">${esc(s.body)}</p>
      </li>`).join("")}</ol>`;
}

/* ================= 03 BUSINESS ================= */
function business(lang, copy) {
  const b = copy.business;
  const h = hero(copy, b.hero, {
    ctas: hbtn(pageHref(lang, "partnerships"), copy.ui.partnerCta, {}) + hbtn(pageHref(lang, "contact"), copy.ui.contactCta, { ghost: true }),
  });

  // Thesis — editorial statement + structural counts
  const t = b.thesis;
  const thesis = section({
    id: "mws-thesis",
    inner: `<p class="mws-kicker">${esc(t.kicker)}</p>
      <h2 class="mws-statement mws-statement--md" id="mws-thesis-title">${lines(t.statement)}</h2>
      <div class="mws-thesis">
        <div class="mws-editorial mws-editorial--2">${t.paras.map((x) => `<p>${esc(x)}</p>`).join("")}</div>
        <ul class="mws-facts">${t.facts.map((f) => `<li><span class="mws-facts__n">${esc(f.n)}</span><span class="mws-facts__l">${esc(f.label)}</span></li>`).join("")}</ul>
      </div>`,
  });

  // Business models — table
  const m = b.models;
  const models = section({
    id: "mws-models", tone: "tint",
    inner: `${head({ id: "mws-models", kicker: m.kicker, title: m.title, lead: m.lead, cls: "mws-head--wide" })}
      ${table({
        cls: "mws-table--models",
        caption: m.title,
        cols: m.cols,
        rows: m.rows.map((r) => ({ model: esc(r.model), customer: esc(r.customer), offer: esc(r.offer), revenue: esc(r.revenue), status: badge(copy, r.status) })),
      })}
      ${notes(copy, ["priceNote", "fundsNote"])}`,
  });

  // 8 groups — numbered index rows with line tags
  const groupsIdx = section({
    id: "mws-groups",
    inner: `${head({ id: "mws-groups", kicker: b.groupsKicker, title: b.groupsTitle, lead: b.groupsLead })}
      <ol class="mws-gindex">${b.groups.map((g, gi) => `<li>
        <span class="mws-letter">${letter(gi)}</span>
        <div class="mws-gindex__name"><p class="mws-en">${esc(g.en)}</p><h3 class="mws-h3"><a class="mws-title-link" href="#mws-bgroup-${gi + 1}">${esc(g.name)}</a></h3><p class="mws-body">${esc(g.lead)}</p></div>
        <ul class="mws-gindex__tags">${g.lines.map((n) => `<li><a href="#mws-line-${n}"><span>${pad(n)}</span>${esc(b.lines[n - 1].name)}</a></li>`).join("")}</ul>
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

  // Revenue opportunities — editorial prose with caveats
  const rv = b.revenue;
  const revenue = section({
    id: "mws-revenue",
    inner: `<div class="mws-split">
        <div class="mws-split__head">${head({ id: "mws-revenue", kicker: rv.kicker, title: rv.title })}</div>
        <div class="mws-editorial mws-editorial--prose">${rv.paras.map((x, i) => `<p${i === rv.paras.length - 1 ? ' class="is-caveat"' : ""}>${esc(x)}</p>`).join("")}</div>
      </div>`,
  });

  // Money flow — process stepper
  const mf = b.money;
  const money = section({
    id: "mws-money", tone: "tint",
    inner: `${head({ id: "mws-money", kicker: mf.kicker, title: mf.title, lead: mf.lead, cls: "mws-head--wide" })}
      <ol class="mws-stepper">${mf.steps.map((s, i) => `<li${i === 2 ? ' class="is-key"' : ""}><span class="mws-stepper__n">${pad(i + 1)}</span><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });

  // Business subscription — split + module directory
  const s = b.saas;
  const saas = split({
    id: "mws-saas", kicker: s.kicker, title: s.title, lead: s.lead, listCls: "mws-modules",
    aside: `<p class="mws-saas__badge">${badge(copy, "review")}</p>`,
    rows: s.items.map((it, i) => `<li><span class="mws-modules__n">${pad(i + 1)}</span><h3 class="mws-h4" lang="en">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join(""),
  });

  // Roadmap — boxed steps
  const r = b.roadmap;
  const roadmap = section({
    id: "mws-roadmap", tone: "tint",
    inner: `${head({ id: "mws-roadmap", kicker: r.kicker, title: r.title, lead: r.lead, note: r.note, cls: "mws-head--wide" })}${roadSteps(copy, r)}`,
  });

  // Trust — 4-col numbered board
  const tr = b.trust;
  const trust = section({
    id: "mws-trust",
    inner: `${head({ id: "mws-trust", kicker: tr.kicker, title: tr.title, lead: tr.lead, cls: "mws-head--wide" })}
      <ol class="mws-board mws-board--4 mws-board--compact">${tr.items.map((it, i) => `<li class="mws-board__cell"><span class="mws-board__num">${pad(i + 1)}</span><h3 class="mws-h3">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></li>`).join("")}</ol>`,
  });

  return [h, thesis, models, groupsIdx, linesBlock, revenue, money, saas, roadmap, trust,
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

  // Models — comparison table
  const models = section({
    id: "mws-models", tone: "tint",
    inner: `${head({ id: "mws-models", kicker: p.models.kicker, title: p.models.title })}
      ${table({
        cls: "mws-table--pmodels",
        caption: p.models.title,
        cols: p.models.cols,
        rows: p.models.items.map((m) => ({ name: esc(m.name), body: esc(m.body), fit: esc(m.fit) })),
      })}`,
  });

  // 14 partner types — grouped bands with sticky group index, numbered rows
  const row = (t, n) => `<li class="mws-prow" id="mws-partner-${n}">
      <div class="mws-prow__side"><span class="mws-prow__n">${pad(n)}</span><span class="mws-ico-box">${icon(t.icon)}</span></div>
      <div class="mws-prow__main">
        <p class="mws-tag">${esc(t.field)}</p>
        <h4 class="mws-h3 mws-h3--lg">${esc(t.name)}</h4>
        <dl class="mws-dl">${[
          [copy.ui.targetLabel, t.target],
          [copy.ui.collabLabel, t.collab],
          [copy.ui.valueLabel, t.value],
          [copy.ui.revenueLabel, t.revenue],
          [copy.ui.termsLabel, t.terms],
        ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
        <p class="mws-pcard__cta"><a class="mws-link" href="${esc(mailHref(copy, `${copy.ui.partnerCta} — ${t.name}`))}">${esc(copy.ui.partnerCta)} ${arrow}</a></p>
      </div>
    </li>`;
  const types = section({
    id: "mws-partners",
    inner: `${head({ id: "mws-partners", kicker: p.typesKicker, title: p.typesTitle })}
      ${p.groups.map((g, gi) => `<section class="mws-gsplit mws-gsplit--partners" id="mws-pgroup-${gi + 1}" aria-labelledby="mws-pgroup-${gi + 1}-title">
        <div class="mws-gsplit__head"><span class="mws-letter mws-letter--lg">${letter(gi)}</span><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-pgroup-${gi + 1}-title">${esc(g.name)}</h3><p class="mws-count">${pad(g.items.length)}</p></div>
        <ol class="mws-prows">${g.items.map((n) => row(p.items[n - 1], n)).join("")}</ol>
      </section>`).join("")}
      ${notes(copy, ["priceNote", "partnerNote"])}`,
  });

  // Principles — checklist grid
  const pr = p.principles;
  const principles = section({
    id: "mws-pprinciples",
    inner: `${head({ id: "mws-pprinciples", kicker: pr.kicker, title: pr.title })}
      <ol class="mws-principles">${pr.items.map((it, i) => `<li><span class="mws-checks__ico">${icon("check")}</span><div><p class="mws-principles__n">${pad(i + 1)}</p><h3 class="mws-h4">${esc(it.name)}</h3><p class="mws-body">${esc(it.body)}</p></div></li>`).join("")}</ol>`,
  });

  // Process — tinted timeline
  const ps = p.process;
  const process = section({
    id: "mws-process", tone: "tint",
    inner: `${head({ id: "mws-process", kicker: ps.kicker, title: ps.title })}
      <ol class="mws-timeline">${ps.steps.map((s, i) => `<li><span class="mws-timeline__dot" aria-hidden="true"></span><span class="mws-timeline__n">${pad(i + 1)}</span><p class="mws-en">${esc(s.en)}</p><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });

  // Checklist — split + check grid
  const ck = p.checklist;
  const checklist = split({
    id: "mws-checklist", kicker: ck.kicker, title: ck.title, listCls: "mws-checks",
    aside: `<div class="mws-actions">${btn(mailHref(copy, copy.ui.partnerCta), copy.ui.partnerCta)}</div>`,
    rows: ck.items.map((t) => `<li><span class="mws-checks__ico">${icon("check")}</span><p>${esc(t)}</p></li>`).join(""),
  });

  const faq = faqBlock("mws-partner-faq", p.faq);

  return [h, why, models, types, principles, process, checklist, faq, closeBand(lang, copy)].join("\n");
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
    if (it.route === "privacy") out.push(`<a class="mws-link" href="/${lang}/privacy/">${esc(c.channels.items[3].name)} ${arrow}</a>`);
    if (it.route === "partner") out.push(`<a class="mws-link" href="${pageHref(lang, "partnerships")}">${esc(copy.nav[3].label)} ${arrow}</a>`);
    return `<span class="mws-cell-links">${out.join("")}</span>`;
  };

  // Inquiry types — grouped table
  const types = section({
    id: "mws-types",
    inner: `${head({ id: "mws-types", kicker: c.typesKicker, title: c.typesTitle, lead: c.typesLead })}
      ${c.groups.map((g, gi) => `<section class="mws-cgroup" aria-labelledby="mws-cgroup-${gi + 1}-title">
        <div class="mws-cgroup__head"><span class="mws-letter">${letter(gi)}</span><div><p class="mws-en">${esc(g.en)}</p><h3 class="mws-gtitle" id="mws-cgroup-${gi + 1}-title">${esc(g.name)}</h3></div></div>
        ${table({
          cls: "mws-table--inquiry",
          caption: g.name,
          cols: c.cols,
          rows: g.items.map((n) => {
            const it = c.items[n - 1];
            return { no: `<span class="mws-num">${pad(n)}</span>`, type: `<span class="mws-cell-type"><span class="mws-ico-box">${icon(it.icon)}</span>${esc(it.name)}</span>`, about: esc(it.body), route: links(it) };
          }),
        })}
      </section>`).join("")}`,
  });

  // NEWON desk — split: big email + official link
  const d = c.desk;
  const desk = section({
    id: "mws-desk", tone: "tint",
    inner: `<div class="mws-split">
        <div class="mws-split__head">${head({ id: "mws-desk", kicker: d.kicker, title: d.title, lead: d.lead })}</div>
        <div class="mws-desk">
          <a class="mws-desk__mail" href="mailto:${MAIL}?subject=${encodeURIComponent(copy.ui.emailSubjectPrefix)}"><span class="mws-mini">${esc(d.emailLabel)}</span><span class="mws-desk__addr">${esc(d.email)}</span><span class="mws-arrow" aria-hidden="true">→</span></a>
          <a class="mws-desk__site" href="/${lang}/contact/"><span class="mws-mini">${esc(d.officialLabel)}</span><span class="mws-body">${esc(d.officialBody)}</span><span class="mws-arrow" aria-hidden="true">→</span></a>
          <ul class="mws-desk__more">${[[`/${lang}/myworld/delete-account/`, c.channels.items[2], "shield"], [`/${lang}/privacy/`, c.channels.items[3], "book"]].map(([href, ch, ic]) => `<li><a href="${href}"><span class="mws-ico-box">${icon(ic)}</span><span><span class="mws-links__name">${esc(ch.name)}</span><span class="mws-links__desc">${esc(ch.body)}</span></span></a></li>`).join("")}</ul>
        </div>
      </div>`,
  });

  // Before you contact — numbered notes
  const bf = c.before;
  const before = split({
    id: "mws-before", kicker: bf.kicker, title: bf.title,
    rows: bf.items.map((t, i) => rosterRow(pad(i + 1), t)).join(""),
  });

  // How — big-number columns
  const how = section({
    id: "mws-how",
    inner: `${head({ id: "mws-how", kicker: c.how.kicker, title: c.how.title })}
      <ol class="mws-cols mws-cols--3 mws-cols--big">${c.how.steps.map((s, i) => `<li class="mws-col"><span class="mws-col__n">${pad(i + 1)}</span><h3 class="mws-h3">${esc(s.name)}</h3><p class="mws-body">${esc(s.body)}</p></li>`).join("")}</ol>`,
  });

  const faq = faqBlock("mws-faq", c.faq);

  return [h, types, desk, before, how, faq, `<div class="mws__wrap">${notes(copy, ["scopeNote"])}</div>`, closeBand(lang, copy, c.closing)].join("\n");
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
