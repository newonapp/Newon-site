/**
 * SHAREON pages — section HTML.
 *
 *   <section id="lifestage-detail" class="nls" data-story="shareon">   shared dark "film" first screen
 *                                                                       (/home-lifestage*.css + /home-lifestage.js)
 *   <nav class="fsn" data-biz="shareon">                                shared five-menu bar (scripts/flagship-subnav.mjs)
 *   <div id="shareon-detail" class="nsh">                               body sections (/shareon.css, /shareon.js)
 *
 * Body language (2026-10-25 redesign): calm editorial product site on a white canvas — readable 16px body, clear type
 * scale, one radius scale, SHAREON violet used sparingly. Every section uses a layout chosen for its content and
 * neighbouring sections never share one. No decorative shapes, no watermark numbers, nothing sticky.
 * Information only: every action is a link to another page, the NEWON inquiry form or the official email.
 * The interactive pieces (revenue-model tabs, one-rental calculator, FAQ details) work without JS; shareon.js enhances tabs/calculator.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getShareonCopy, SHAREON_PAGES } from "./shareon-copy.mjs";
import { icon } from "./shareon-icons.mjs";
import { renderFlagshipSubnav } from "./flagship-subnav.mjs";

export { getShareonCopy };

const e = (s) => escapeHtml(s == null ? "" : String(s));
const nl = (s) => e(s).replace(/\n/g, "<br />");

/** SHAREON first-screen background film (owner-provided, 2026-10-18). */
const SHAREON_FILM = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4";

function pageHref(lang, id) {
  const p = SHAREON_PAGES.find((x) => x.id === id);
  return `/${lang}/${p.path}/`;
}

export function inquiryHref(lang, slug = "general") {
  const q = new URLSearchParams({ type: "partnership", source: "shareon", utm_source: "shareon", utm_content: slug });
  return `/${lang}/business/inquiry/?${q.toString()}#inquiry`;
}

function mailHref(c, title) {
  return `mailto:newon@newon.app?subject=${encodeURIComponent(`${c.contact.mailSubjectPrefix} ${title}`)}`;
}

/* ───────── small building blocks ───────── */

function head(id, kicker, title, lead, { extra = "", cls = "" } = {}) {
  return `<header class="nsh-head${cls ? ` ${cls}` : ""}">
      ${kicker ? `<p class="nsh-kicker" lang="en">${e(kicker)}</p>` : ""}
      <h2 class="nsh-title" id="nsh-${e(id)}-t">${nl(title)}</h2>
      ${lead ? `<p class="nsh-lead">${e(lead)}</p>` : ""}${extra}
    </header>`;
}

/** One body section. `mod` picks the background: "" (white, thin top rule) · "tint" (faint purple wash) · "band" (purple tint) · "ink" (black). */
function sec(id, inner, mod = "") {
  return `<section class="nsh-sec${mod ? ` nsh-sec--${mod}` : ""}" id="nsh-${e(id)}" aria-labelledby="nsh-${e(id)}-t">
    <div class="nsh-wrap">${inner}</div>
  </section>`;
}

function chips(items, cls = "") {
  if (!items || !items.length) return "";
  return `<ul class="nsh-chips${cls ? ` ${cls}` : ""}" role="list">${items.map((t) => `<li>${e(t)}</li>`).join("")}</ul>`;
}

function btn(href, label, kind = "") {
  return `<a class="nsh-btn${kind ? ` nsh-btn--${kind}` : ""}" href="${e(href)}">${e(label)}${kind === "primary" ? ' <span aria-hidden="true">→</span>' : ""}</a>`;
}

function link(href, label, hidden = "") {
  return `<a class="nsh-link" href="${e(href)}">${e(label)}${hidden ? `<span class="nsh-vh"> — ${e(hidden)}</span>` : ""} <span aria-hidden="true">→</span></a>`;
}

/* ───────── first screen: shared film hero ───────── */

function hero(c, lang, id, h, main, sub) {
  const page = c.subnav.find((s) => s.id === id);
  const heroLang = c.heroLang && c.heroLang[id];
  const bodyLang = c.contentLang !== lang ? c.contentLang : "";
  return `<section id="lifestage-detail" class="nls" data-story="shareon" data-shareon-hero="${e(id)}"${bodyLang ? ` lang="${e(bodyLang)}"` : ""} aria-labelledby="nsh-hero-t">
  <div class="nls-film${id === "overview" ? "" : " nsh-film--compact"}" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${SHAREON_FILM}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${SHAREON_FILM}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark" lang="en" aria-hidden="true">SHAREON</p>
        <h1 id="nsh-hero-t" class="nls-film__slogan"${heroLang ? ` lang="${e(heroLang)}"` : ""}><span class="nsh-vh" lang="en">SHAREON ${e(page ? page.en : "")} — </span>${nl(h.title)}</h1>
        <p class="nls-film__lead">${e(h.lead)}</p>
        <div class="nls-film__actions">
          <a class="nls-btn" href="${e(main)}">${e(h.ctaMain)} <span aria-hidden="true">→</span></a>
          <a class="nls-btn nls-btn--ghost" href="${e(sub)}">${e(h.ctaSub)}</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/** Thin strip directly under the menu bar: the one shared notice per page (per-card status badges were removed in V2). */
function status(c) {
  return `<div class="nsh-wrap nsh-status">
    <p class="nsh-status__note"><span class="nsh-status__pilot" lang="en">Pilot</span><span class="nsh-vh">${e(c.statusLabel)}: </span>${e(c.statusNote)}</p>
  </div>`;
}

/** Closing band (black). */
function closing(id, n, ctas, { big = false } = {}) {
  return `<section class="nsh-sec nsh-sec--ink nsh-close" id="nsh-${e(id)}" aria-labelledby="nsh-${e(id)}-t">
    <div class="nsh-wrap nsh-close__in">
      ${n.kicker ? `<p class="nsh-kicker" lang="en">${e(n.kicker)}</p>` : ""}
      <h2 class="nsh-close__title${big ? " nsh-close__title--mail" : ""}" id="nsh-${e(id)}-t">${nl(n.title)}</h2>
      ${n.lead ? `<p class="nsh-close__lead">${e(n.lead)}</p>` : ""}
      <div class="nsh-close__ctas">${ctas.map(([href, label], i) => btn(href, label, i === 0 ? "primary" : "ghost")).join("")}</div>
    </div>
  </section>`;
}

/* ───────── layouts (2026-10-25 redesign) ─────────
   Each section gets a layout chosen for its content; neighbouring sections never share one.
   split · rows · trio · cards (bento) · rail · matrix · compare table · board (status) · steps · tabs · faq · checks */

/** Asymmetric split: statement left, content right (nothing sticks, so nothing slides over text). */
function split(id, t, right, { mod = "", extra = "", cls = "" } = {}) {
  return sec(
    id,
    `<div class="nsh-split${cls ? ` ${cls}` : ""}">
      ${head(id, t.kicker, t.title, t.lead, { extra, cls: "nsh-head--side" })}
      <div class="nsh-split__body">${right}</div>
    </div>`,
    mod
  );
}

/** Hairline rows: title + body. `n` is shown only when it is an ID used elsewhere (platform areas). */
function rows(list, { showN = false, cls = "" } = {}) {
  return `<ul class="nsh-rows${cls ? ` ${cls}` : ""}" role="list">${list
    .map(
      (r) => `<li class="nsh-rows__item"${r.id ? ` id="${e(r.id)}"` : ""}>${showN && r.n ? `<span class="nsh-rows__n" aria-hidden="true">${e(r.n)}</span>` : ""}<div class="nsh-rows__text">${
        r.meta || ""
      }${r.title ? `<h3 class="nsh-rows__title">${r.titleHtml || e(r.title)}</h3>` : ""}<p class="nsh-rows__body">${e(r.body)}</p>${r.more || ""}</div></li>`
    )
    .join("")}</ul>`;
}

/** Role-style title "Label — rest": the label becomes a small tag; the full text (incl. the dash) stays in the heading. */
function roleTitle(title) {
  const i = String(title).indexOf(" — ");
  if (i < 0) return e(title);
  return `<span class="nsh-role">${e(title.slice(0, i))}</span><span class="nsh-vh"> — </span><span class="nsh-role__rest">${e(title.slice(i + 3))}</span>`;
}

/** Large-type trio: three statements side by side, no boxes. `numbered` only for a real chain of reasoning. */
function trio(id, t, { mod = "", numbered = false } = {}) {
  return sec(
    id,
    `${head(id, t.kicker, t.title, t.lead)}
    <ol class="nsh-trio${numbered ? " nsh-trio--n" : ""}" role="list">${t.points
      .map(
        (pt) => `<li class="nsh-trio__item">${numbered ? `<span class="nsh-trio__n" aria-hidden="true">${e(pt.n)}</span>` : ""}<h3 class="nsh-trio__title">${e(pt.title)}</h3><p class="nsh-trio__body">${e(pt.body)}</p></li>`
      )
      .join("")}</ol>`,
    mod
  );
}

/** Card grid (bento). `layout` picks the tile rhythm: "duo" (2 × 2, mixed widths) · "five" (3 + 2) · "four". */
function cards(items, layout = "duo") {
  return `<ul class="nsh-cards nsh-cards--${e(layout)}" role="list">${items
    .map(
      (it) => `<li class="nsh-card"${it.id ? ` id="${e(it.id)}"` : ""}>
        <div class="nsh-card__top"><span class="nsh-ico-well">${icon(it.icon)}</span>${it.en && !it.headHtml ? `<p class="nsh-card__en" lang="en">${e(it.en)}</p>` : ""}</div>
        ${it.headHtml || `<h3 class="nsh-card__title">${e(it.title)}</h3>`}
        <p class="nsh-card__body">${e(it.body)}</p>
        ${chips(it.chips)}
        ${it.after || ""}
      </li>`
    )
    .join("")}</ul>`;
}

/** Icon feature list (2 columns, no boxes). */
function features(items, { cls = "" } = {}) {
  return `<ul class="nsh-feat${cls ? ` ${cls}` : ""}" role="list">${items
    .map(
      (it) => `<li class="nsh-feat__item"${it.id ? ` id="${e(it.id)}"` : ""}>
        <span class="nsh-ico-well">${icon(it.icon)}</span>
        <div class="nsh-feat__text">
          ${it.headHtml || `${it.en ? `<p class="nsh-card__en" lang="en">${e(it.en)}</p>` : ""}<h3 class="nsh-feat__title">${e(it.title)}</h3>`}
          <p class="nsh-feat__body">${e(it.body)}</p>
          ${chips(it.chips)}
        </div>
      </li>`
    )
    .join("")}</ul>`;
}

/** Provider × renter matrix (C2C/C2B/B2C/B2B) with visible axis headers, plus two wide cards. */
function matrix(c, rest) {
  const m = c.matrix;
  const by = Object.fromEntries(c.trades.map((it) => [it.en, it]));
  const cell = (it) =>
    `<li class="nsh-matrix__cell"><p class="nsh-matrix__code" lang="en">${e(it.en)}</p><h3 class="nsh-matrix__title">${e(it.title)}</h3><p class="nsh-matrix__body">${e(it.body)}</p></li>`;
  return `<div class="nsh-matrix">
      <div class="nsh-matrix__corner" aria-hidden="true"><span>${e(m.provider)} ↓</span><span>${e(m.renter)} →</span></div>
      <p class="nsh-matrix__ax nsh-matrix__ax--c1" aria-hidden="true">${e(m.person)}</p>
      <p class="nsh-matrix__ax nsh-matrix__ax--c2" aria-hidden="true">${e(m.business)}</p>
      <p class="nsh-matrix__ax nsh-matrix__ax--r1" aria-hidden="true">${e(m.person)}</p>
      <p class="nsh-matrix__ax nsh-matrix__ax--r2" aria-hidden="true">${e(m.business)}</p>
      <ul class="nsh-matrix__grid" role="list">${cell(by.C2C)}${cell(by.C2B)}${cell(by.B2C)}${cell(by.B2B)}</ul>
    </div>
    <ul class="nsh-signal" role="list">${rest
      .map(
        (it) => `<li class="nsh-signal__item"><p class="nsh-signal__code" lang="en">${e(it.en)}</p><div><h3 class="nsh-signal__title">${e(it.title)}</h3><p class="nsh-signal__body">${e(
          it.body
        )}</p></div></li>`
      )
      .join("")}</ul>`;
}

/** Data table. `cols` = keys of each row; the first is the row header. `accent` = key of the highlighted column. */
function table(id, t, cols, { accent = "", muted = "" } = {}) {
  return `<div class="nsh-table-wrap" role="region" aria-labelledby="nsh-${e(id)}-t" tabindex="0">
      <table class="nsh-table${accent ? " nsh-table--accent" : ""}">
        <thead><tr>${cols.map((k) => `<th scope="col"${k === accent ? ' class="is-accent"' : ""}>${e(t.head[k])}</th>`).join("")}</tr></thead>
        <tbody>${t.rows
          .map(
            (row) =>
              `<tr>${cols
                .map((k, i) =>
                  i === 0
                    ? `<th scope="row">${e(row[k])}</th>`
                    : `<td data-label="${e(t.head[k])}"${k === accent ? ' class="is-accent"' : k === muted ? ' class="is-muted"' : ""}>${e(row[k])}</td>`
                )
                .join("")}</tr>`
          )
          .join("")}</tbody>
      </table>
    </div>`;
}

/** Status board: one column per status group (dot style = tone), so no card carries its own badge. */
function phase(id, t, mod = "") {
  return sec(
    id,
    `${head(id, t.kicker, t.title, t.lead)}
    <div class="nsh-phase nsh-phase--${t.groups.length}">${t.groups
      .map(
        (g) => `<section class="nsh-phase__col nsh-phase__col--${e(g.tone)}" aria-label="${e(g.title)}">
        <h3 class="nsh-phase__k"><span class="nsh-phase__dot" aria-hidden="true"></span><span class="nsh-phase__name">${e(g.title)}</span><span class="nsh-count">${g.items.length}</span></h3>
        ${g.lead ? `<p class="nsh-phase__lead">${e(g.lead)}</p>` : ""}
        <ul class="nsh-phase__list" role="list">${g.items.map((x) => `<li>${e(x)}</li>`).join("")}</ul>
      </section>`
      )
      .join("")}</div>`,
    mod
  );
}

/** Numbered steps — only for real sequences (eco stages, go-to-market, partner process). */
function steps(id, t, list, { mod = "", more = "" } = {}) {
  return sec(
    id,
    `${head(id, t.kicker, t.title, t.lead)}
    <ol class="nsh-steps nsh-steps--${list.length}" role="list">${list
      .map(
        (s) => `<li class="nsh-steps__item"><span class="nsh-steps__n" aria-hidden="true">${e(s.n)}</span><h3 class="nsh-steps__title">${e(s.title)}</h3><p class="nsh-steps__body">${e(s.body)}</p></li>`
      )
      .join("")}</ol>${more}`,
    mod
  );
}

/** FAQ accordion (native details/summary; keyboard-operable without JS). */
function faq(id, t, mod = "") {
  return split(
    id,
    { kicker: t.kicker, title: t.title, lead: "" },
    `<div class="nsh-faq">${t.items
      .map(
        (it) => `<details class="nsh-faq__item"><summary class="nsh-faq__q"><span>${e(it.q)}</span><span class="nsh-faq__sign" aria-hidden="true"></span></summary><p class="nsh-faq__a">${e(
          it.a
        )}</p></details>`
      )
      .join("")}</div>`,
    { mod }
  );
}

function checks(items) {
  return `<ul class="nsh-checks" role="list">${items.map((t) => `<li class="nsh-checks__item">${CHECK_SVG}<p>${e(t)}</p></li>`).join("")}</ul>`;
}

/* ───────── 01 Overview ───────── */

function overview(c, lang) {
  const o = c.overview;
  const body = [
    split("vision", o.vision, rows(o.vision.points), { cls: "nsh-split--lead" }),
    trio("values", o.values, { mod: "tint" }),
    sec("customers", `${head("customers", o.customers.kicker, o.customers.title, o.customers.lead)}${cards(o.customers.items, "duo")}`),
    sec(
      "scenes",
      `${head("scenes", o.scenes.kicker, o.scenes.title, o.scenes.lead)}
      <ul class="nsh-rail" role="list">${o.scenes.items
        .map(
          (s) => `<li class="nsh-rail__item"><span class="nsh-ico-well">${icon(s.icon)}</span><p class="nsh-card__en" lang="en">${e(s.en)}</p><h3 class="nsh-rail__title">${e(
            s.title
          )}</h3><p class="nsh-rail__body">${e(s.body)}</p></li>`
        )
        .join("")}</ul>`,
      "tint"
    ),
    sec(
      "connect",
      `${head("connect", o.connect.kicker, o.connect.title, o.connect.lead)}${matrix(c, o.connect.rest)}
    <p class="nsh-more">${link(`${pageHref(lang, "platform")}#nsh-flow`, c.lang === "ko" ? "7단계 대여 흐름 보기" : "See the seven-step rental flow")}</p>`
    ),
    sec("diff", `${head("diff", o.diff.kicker, o.diff.title, o.diff.lead)}${table("diff", o.diff, ["alt", "pain", "ours"], { accent: "ours" })}`, "line"),
    phase("status", o.status, "tint"),
    steps("eco", o.eco, o.eco.items, { more: `<p class="nsh-more">${link(pageHref(lang, "business"), o.eco.cta)}</p>` }),
    split(
      "newon",
      o.newon,
      `<ul class="nsh-family" role="list">${o.newon.items
        .map(
          (r) => `<li class="nsh-family__item${r.self ? " is-self" : ""}"><h3 class="nsh-family__name" lang="en">${e(r.name)}</h3><p class="nsh-family__body">${e(r.body)}</p></li>`
        )
        .join("")}</ul>`,
      { mod: "line" }
    ),
    closing("next", o.next, [
      [pageHref(lang, "platform"), o.next.ctas[0]],
      [pageHref(lang, "business"), o.next.ctas[1]],
      [pageHref(lang, "contact"), o.next.ctas[2]],
    ]),
  ];
  return { hero: hero(c, lang, "overview", o.hero, pageHref(lang, "platform"), "#nsh-vision"), body };
}

/* ───────── 02 Platform ───────── */

function svcHead(c, s) {
  return `<p class="nsh-svc__meta"><span class="nsh-svc__n" aria-hidden="true">${e(s.n)}</span><span lang="en">${e(s.en)}</span></p>
          <h3 class="nsh-svc__title" id="svc-${e(s.n)}-t">${e(s.title)}</h3>`;
}

function consider(c, s) {
  return s.consider ? `<p class="nsh-consider"><strong>${e(c.considerLabel)}</strong>${e(s.consider)}</p>` : "";
}

function platform(c, lang) {
  const p = c.platform;
  const G = Object.fromEntries(p.groups.map((g) => [g.id, g]));
  const S = (gid) => p.services.filter((s) => s.g === gid);

  /* Index — five group columns of anchor links (area numbers 01–18 are IDs used across the page) */
  const index = sec(
    "index",
    `${head("index", "18 BUSINESS AREAS", p.indexTitle, p.indexLead)}
    <div class="nsh-index">${p.groups
      .map(
        (g) => `<div class="nsh-index__group"><p class="nsh-index__k" lang="en">${e(g.kicker)}</p><p class="nsh-index__t">${e(g.title)}</p><ul class="nsh-index__list" role="list">${S(g.id)
          .map((s) => `<li><a href="#svc-${e(s.n)}"><span class="nsh-index__n" aria-hidden="true">${e(s.n)}</span><span>${e(s.title)}</span></a></li>`)
          .join("")}</ul></div>`
      )
      .join("")}</div>`,
    "tint"
  );

  /* A — catalog rows: name | description + chips | what to check */
  const a = sec(
    "grp-a",
    `${head("grp-a", G.a.kicker, G.a.title, G.a.lead)}
    <div class="nsh-catalog">${S("a")
      .map(
        (s) => `<article class="nsh-catalog__row" id="svc-${e(s.n)}" aria-labelledby="svc-${e(s.n)}-t">
          <div class="nsh-catalog__side"><span class="nsh-ico-well">${icon(s.icon)}</span><div>${svcHead(c, s)}</div></div>
          <div class="nsh-catalog__main"><p class="nsh-catalog__body">${e(s.body)}</p>${chips(s.chips)}</div>
          <div class="nsh-catalog__aside">${consider(c, s)}</div>
        </article>`
      )
      .join("")}</div>`
  );

  /* B — bento cards (3 + 2) */
  const b = sec(
    "grp-b",
    `${head("grp-b", G.b.kicker, G.b.title, G.b.lead)}${cards(
      S("b").map((s) => ({ ...s, id: `svc-${s.n}`, headHtml: svcHead(c, s), after: consider(c, s) })),
      "five"
    )}`,
    "tint"
  );

  /* C — spaces: two large panels */
  const cc = sec(
    "grp-c",
    `<div class="nsh-duo-head">${head("grp-c", G.c.kicker, G.c.title, G.c.lead)}</div>
    <div class="nsh-duo">${S("c")
      .map(
        (s) => `<article class="nsh-duo__item" id="svc-${e(s.n)}" aria-labelledby="svc-${e(s.n)}-t">
          <span class="nsh-ico-well nsh-ico-well--solid">${icon(s.icon)}</span>
          ${svcHead(c, s)}
          <p class="nsh-duo__body">${e(s.body)}</p>
          ${chips(s.chips)}
          ${consider(c, s)}
        </article>`
      )
      .join("")}</div>`
  );

  /* D — business assets: heading left, two rows right */
  const d = split(
    "grp-d",
    G.d,
    rows(
      S("d").map((s) => ({
        id: `svc-${s.n}`,
        n: s.n,
        meta: `<p class="nsh-svc__meta"><span lang="en">${e(s.en)}</span></p>`,
        title: s.title,
        body: s.body,
      })),
      { showN: true, cls: "nsh-rows--lg" }
    ),
    { mod: "line" }
  );

  /* E — trust & operations: icon feature list */
  const e1 = sec(
    "grp-e",
    `${head("grp-e", G.e.kicker, G.e.title, G.e.lead)}${features(
      S("e").map((s) => ({ ...s, id: `svc-${s.n}`, headHtml: svcHead(c, s) }))
    )}`,
    "tint"
  );

  /* Rental flow — 7 steps (a real sequence); payment and settlement are dashed (legend below) */
  const f = p.flow;
  const flow = sec(
    "flow",
    `${head("flow", f.kicker, f.title, f.lead)}
    <ol class="nsh-track" role="list">${f.steps
      .map(
        (s) => `<li class="nsh-track__step${s.off ? " is-off" : ""}">
          <p class="nsh-track__n"><span class="nsh-track__num" aria-hidden="true">${e(s.n)}</span><span lang="en">${e(s.en)}</span></p>
          <h3 class="nsh-track__title">${e(s.title)}${s.off ? `<span class="nsh-vh"> — ${c.lang === "ko" ? "현재 운영하지 않음" : "not operating"}</span>` : ""}</h3>
          <p class="nsh-track__body">${e(s.body)}</p>
        </li>`
      )
      .join("")}</ol>
    <p class="nsh-callout nsh-flow__legend"><span class="nsh-flow__key" aria-hidden="true"></span><span>${e(f.legend)}</span></p>
    <div class="nsh-flow__booking">
      <h3 class="nsh-flow__bt">${e(f.bookingTitle)}</h3>
      ${chips(f.booking, "nsh-chips--lg")}
      <p class="nsh-note">${e(f.bookingNote)}</p>
    </div>`
  );

  const sc = p.scenarios;
  const scen = sec(
    "scenarios",
    `${head("scenarios", sc.kicker, sc.title, sc.lead)}
    <ul class="nsh-story" role="list">${sc.rows
      .map((r) => `<li class="nsh-story__item"><h3 class="nsh-story__title">${roleTitle(r.title)}</h3><p class="nsh-story__body">${e(r.body)}</p></li>`)
      .join("")}</ul>`,
    "tint"
  );

  const users = sec("users", `${head("users", p.users.kicker, p.users.title, p.users.lead)}${table("users", p.users, ["who", "does", "tabs", "check"])}`);

  /* Five tabs + one shared engine: tab tiles over a wide engine bar */
  const L = p.links;
  const tabsItems = L.items.slice(0, -1);
  const engine = L.items[L.items.length - 1];
  const links = sec(
    "links",
    `${head("links", L.kicker, L.title, L.lead)}
    <ul class="nsh-appbar" role="list">${tabsItems
      .map((it) => `<li class="nsh-appbar__tab"><h3 class="nsh-appbar__name" lang="en">${e(it.name)}</h3><p class="nsh-appbar__body">${e(it.body)}</p></li>`)
      .join("")}
      <li class="nsh-appbar__engine"><h3 class="nsh-appbar__name" lang="en">${e(engine.name)}</h3><p class="nsh-appbar__body">${e(engine.body)}</p></li>
    </ul>`,
    "line"
  );

  const T = p.trust;
  const trust = split(
    "trust",
    T,
    `${rows(T.items, { cls: "nsh-rows--tight" })}${T.note ? `<p class="nsh-callout">${e(T.note)}</p>` : ""}`,
    { mod: "tint" }
  );
  const statusSec = phase("status", p.status);

  const ap = p.app;
  const app = sec(
    "app",
    `<div class="nsh-panel">
      <div class="nsh-panel__main">
        ${head("app", ap.kicker, ap.title, "")}
        <p class="nsh-svc__meta"><span lang="en">${e(ap.en)}</span></p>
        <p class="nsh-panel__body">${e(ap.body)}</p>
      </div>
      <div class="nsh-panel__side">
        ${chips(ap.chips, "nsh-chips--lg")}
        <p class="nsh-more">${link(`/${lang}/news/`, ap.news)}</p>
      </div>
    </div>`,
    "flush"
  );

  return {
    hero: hero(c, lang, "platform", p.hero, pageHref(lang, "business"), pageHref(lang, "contact")),
    body: [
      index,
      a,
      b,
      cc,
      d,
      e1,
      flow,
      scen,
      users,
      links,
      trust,
      statusSec,
      app,
      faq("faq", p.faq, "tint"),
      closing("next", p.next, [
        [pageHref(lang, "business"), p.next.ctas[0]],
        [pageHref(lang, "partnerships"), p.next.ctas[1]],
        [pageHref(lang, "contact"), p.next.ctas[2]],
      ]),
    ],
  };
}

/* ───────── 03 Business ───────── */

function fmt(n, lang) {
  try {
    return new Intl.NumberFormat(lang === "ko" ? "ko-KR" : "en-US").format(n);
  } catch {
    return String(n);
  }
}

function business(c, lang) {
  const b = c.business;

  /* 10 revenue models — segmented tabs (3 groups) */
  const k = b.models;
  const L = k.labels;
  const tabs = `<div class="nsh-tabs__list" role="tablist" aria-label="${e(k.tabsAria)}" hidden data-nsh-tablist>${k.cats
    .map(
      (cat, i) => `<button type="button" role="tab" class="nsh-tabs__tab" id="tab-${e(cat.id)}" aria-controls="panel-${e(cat.id)}" aria-selected="${
        i === 0 ? "true" : "false"
      }" tabindex="${i === 0 ? "0" : "-1"}"><span class="nsh-tabs__n" aria-hidden="true">${e(cat.n)}</span><span class="nsh-tabs__label">${e(cat.title)}</span></button>`
    )
    .join("")}</div>`;
  const panels = k.cats
    .map((cat) => {
      const items = k.items.filter((it) => it.c === cat.id);
      return `<div class="nsh-tabs__panel" id="panel-${e(cat.id)}" role="region" aria-labelledby="panel-${e(cat.id)}-t" data-nsh-panel>
        <div class="nsh-tabs__side">
          <p class="nsh-tabs__en" lang="en"><span aria-hidden="true">${e(cat.n)} · </span>${e(cat.en)}</p>
          <h3 class="nsh-tabs__title" id="panel-${e(cat.id)}-t">${e(cat.title)}</h3>
          <p class="nsh-tabs__count">${items.length} / ${k.items.length}</p>
        </div>
        <ul class="nsh-biz" role="list">${items
          .map(
            (it) => `<li class="nsh-biz__item">
              <div class="nsh-biz__top">
                <span class="nsh-ico-well">${icon(it.icon)}</span>
                <div class="nsh-biz__name"><p class="nsh-biz__en"><span aria-hidden="true">${e(it.n)} · </span><span lang="en">${e(it.en)}</span></p><h4 class="nsh-biz__title">${e(
                  it.title
                )}</h4></div>
              </div>
              <dl class="nsh-biz__dl">
                <div><dt>${e(L.payer)}</dt><dd>${e(it.payer)}</dd></div>
                <div><dt>${e(L.how)}</dt><dd>${e(it.how)}</dd></div>
                <div><dt>${e(L.stage)}</dt><dd>${e(it.stage)}</dd></div>
                ${it.note ? `<div><dt>${e(L.note)}</dt><dd>${e(it.note)}</dd></div>` : ""}
              </dl>
            </li>`
          )
          .join("")}</ul>
      </div>`;
    })
    .join("");
  const models = sec("models", `${head("models", k.kicker, k.title, k.lead)}<div class="nsh-tabs" data-nsh-tabs>${tabs}${panels}</div>`, "tint");

  /* One rental, illustrated — black band. Fee is on the rental fee only; the deposit is shown apart (not revenue). */
  const k2 = b.calc;
  const d = k2.defaults;
  const field = (name, label, unit, val, attrs) =>
    `<div class="nsh-calc__field"><label for="calc-${name}">${e(label)}</label><div class="nsh-calc__input"><input id="calc-${name}" name="${name}" type="number" inputmode="numeric" value="${val}" ${attrs} data-nsh-calc-in="${name}" />${
      unit ? `<span>${e(unit)}</span>` : ""
    }</div></div>`;
  const calc = sec(
    "calc",
    `<div class="nsh-calc" data-nsh-calc data-lang="${e(lang === "ko" ? "ko-KR" : "en-US")}">
      ${head("calc", k2.kicker, k2.title, k2.lead, { extra: `<p class="nsh-calc__badge">${e(k2.badge)}</p>`, cls: "nsh-head--side" })}
      <form class="nsh-calc__form" aria-labelledby="nsh-calc-t">
        <div class="nsh-calc__fields">
          ${field("rent", k2.fields.rent, k2.fields.rentUnit, d.rent, 'min="0" max="100000000" step="1000"')}
          ${field("deposit", k2.fields.deposit, k2.fields.depositUnit, d.deposit, 'min="0" max="100000000" step="1000"')}
          ${field("rate", k2.fields.rate, k2.fields.rateUnit, d.rate, 'min="0" max="100" step="0.5"')}
        </div>
        <dl class="nsh-calc__out" aria-live="polite">
          <div class="is-fee"><dt>${e(k2.out.fee)}</dt><dd><output data-nsh-calc-out="fee" for="calc-rent calc-rate">0</output> <span>${e(k2.currency)}</span></dd></div>
          <div><dt>${e(k2.out.payout)}</dt><dd><output data-nsh-calc-out="payout" for="calc-rent calc-rate">${fmt(d.rent, lang)}</output> <span>${e(k2.currency)}</span></dd></div>
          <div><dt>${e(k2.out.deposit)}</dt><dd><output data-nsh-calc-out="deposit" for="calc-deposit">${fmt(d.deposit, lang)}</output> <span>${e(k2.currency)}</span></dd></div>
        </dl>
        <p class="nsh-calc__note">${e(k2.note)}</p>
      </form>
    </div>`,
    "ink"
  );

  const s = b.saas;
  const saas = sec(
    "saas",
    `${head("saas", s.kicker, s.title, s.lead, { extra: `<div class="nsh-head__row">${link(inquiryHref(lang, "saas"), s.cta)}</div>` })}
    <ul class="nsh-modules" role="list">${s.items
      .map((it) => `<li class="nsh-modules__item"><h3 class="nsh-modules__name" lang="en">${e(it.name)}</h3><p class="nsh-modules__body">${e(it.body)}</p></li>`)
      .join("")}</ul>`
  );

  /* Roadmap — four priorities stacked; the current one is highlighted */
  const rm = b.roadmap;
  const roadmap = split(
    "roadmap",
    rm,
    `<ol class="nsh-timeline" role="list">${rm.steps
      .map(
        (st, i) => `<li class="nsh-timeline__item${i === 0 ? " is-now" : ""}"><p class="nsh-timeline__n" lang="en">STEP ${e(st.n)}</p><div><h3 class="nsh-timeline__title">${e(st.title)}${
          st.tag ? ` <span class="nsh-tag">${e(st.tag)}</span>` : ""
        }</h3><p class="nsh-timeline__body">${e(st.body)}</p></div></li>`
      )
      .join("")}</ol>`,
    { mod: "tint", extra: `<p class="nsh-now"><span class="nsh-now__dot" aria-hidden="true"></span>${e(rm.now)}</p>` }
  );

  const pr = b.principles;
  const principles = sec("principles", `${head("principles", pr.kicker, pr.title, pr.lead)}${checks(pr.items)}`);

  const mk = b.market;
  const market = split("market", mk, rows(mk.rows.map((r) => ({ ...r, titleHtml: roleTitle(r.title) })), { cls: "nsh-rows--role" }), { mod: "tint" });

  return {
    hero: hero(c, lang, "business", b.hero, pageHref(lang, "partnerships"), inquiryHref(lang, "business")),
    body: [
      split("payers", b.payers, table("payers", b.payers, ["who", "use", "pay"]), { cls: "nsh-split--wide" }),
      sec("structure", `${head("structure", b.structure.kicker, b.structure.title, b.structure.lead)}${matrix(c, b.structure.rest)}`),
      models,
      sec("subs", `${head("subs", b.subs.kicker, b.subs.title, b.subs.lead)}${table("subs", b.subs, ["item", "now", "plan"], { accent: "plan", muted: "now" })}`),
      calc,
      trio("small", b.small, { numbered: true }),
      saas,
      market,
      steps("entry", b.entry, b.entry.items),
      roadmap,
      principles,
      closing("next", b.next, [
        [pageHref(lang, "partnerships"), b.next.ctas[0]],
        [inquiryHref(lang, "business"), b.next.ctas[1]],
      ]),
    ],
  };
}

const CHECK_SVG = `<svg class="nsh-checks__ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ───────── 04 Partnerships ───────── */

function partnerships(c, lang) {
  const p = c.partnerships;
  const t = p.types;

  const open = split(
    "open",
    p.open,
    `<ul class="nsh-quad" role="list">${p.open.points
      .map((pt) => `<li class="nsh-quad__item"><h3 class="nsh-quad__title">${e(pt.title)}</h3><p class="nsh-quad__body">${e(pt.body)}</p></li>`)
      .join("")}</ul>`
  );

  const types = sec(
    "types",
    `<div class="nsh-dir__head">${head("types", t.kicker, t.title, "")}<p class="nsh-notice"><span class="nsh-notice__k" aria-hidden="true">!</span><span>${e(p.notice)}</span></p></div>
    <ul class="nsh-pidx" role="list">${t.items
      .map((it) => `<li><a class="nsh-pidx__a" href="#ptype-${e(it.n)}"><span class="nsh-pidx__n" aria-hidden="true">${e(it.n)}</span><span class="nsh-pidx__t">${e(it.title)}</span></a></li>`)
      .join("")}</ul>
    <ol class="nsh-dir" role="list">
      <li class="nsh-dir__row nsh-dir__row--head" aria-hidden="true"><span></span><span>${e(t.labels.collab)}</span><span>${e(t.labels.value)}</span><span>${e(t.labels.terms)}</span><span>${e(
        t.labels.route
      )}</span></li>
      ${t.items
        .map(
          (it) => `<li class="nsh-dir__row" id="ptype-${e(it.n)}">
        <div class="nsh-dir__name"><span class="nsh-ico-well nsh-ico-well--sm">${icon(it.icon)}</span><div><p class="nsh-dir__n" aria-hidden="true">${e(it.n)}</p><h3 class="nsh-dir__title">${e(
            it.title
          )}</h3>${link(inquiryHref(lang, `partner-${it.n}`), c.partnershipInquiry, it.title)}</div></div>
        <dl class="nsh-dir__dl">
          <div><dt>${e(t.labels.collab)}</dt><dd>${e(it.collab)}</dd></div>
          <div><dt>${e(t.labels.value)}</dt><dd>${e(it.value)}</dd></div>
          <div><dt>${e(t.labels.terms)}</dt><dd>${e(it.terms)}</dd></div>
          <div><dt>${e(t.labels.route)}</dt><dd>${e(it.route)}</dd></div>
        </dl>
      </li>`
        )
        .join("")}
    </ol>`
  );

  const pilots = sec("pilots", `${head("pilots", p.pilots.kicker, p.pilots.title, p.pilots.lead)}${cards(p.pilots.items, "five")}`, "tint");
  const data = split("data", p.data, rows(p.data.rows));
  const campaigns = trio("campaigns", p.campaigns, { mod: "line" });
  const process = steps("process", p.process, p.process.steps, { mod: "tint" });
  const value = sec("value", `${head("value", p.value.kicker, p.value.title, p.value.lead)}${features(p.value.items)}`);

  return {
    hero: hero(c, lang, "partnerships", p.hero, inquiryHref(lang, "partnership"), pageHref(lang, "business")),
    body: [
      open,
      types,
      pilots,
      data,
      campaigns,
      process,
      value,
      closing("next", p.next, [
        [inquiryHref(lang, "partnership"), p.next.ctas[0]],
        [pageHref(lang, "contact"), p.next.ctas[1]],
      ]),
    ],
  };
}

/* ───────── 05 Contact ───────── */

/** NEWON's shared inquiry page with the type/platform codes it already understands. */
function contactPageHref(lang, type) {
  return `/${lang}/business/contact/?type=${encodeURIComponent(type)}&platform=shareon#bpt-form`;
}

function contact(c, lang) {
  const k = c.contact;
  const types = sec(
    "types",
    `${head("types", k.kicker, k.title, k.lead)}
    <div class="nsh-tgroups">${Object.keys(k.groups)
      .map((gid) => {
        const list = k.items.filter((it) => it.g === gid);
        return `<div class="nsh-tgroup nsh-tgroup--${e(gid)}">
      <p class="nsh-tgroup__k"><span class="nsh-tgroup__name">${e(k.groups[gid])}</span><span class="nsh-count">${list.length}</span></p>
      <ul class="nsh-tiles" role="list">${list
        .map(
          (it) => `<li class="nsh-tiles__item">
          <div class="nsh-tiles__top"><span class="nsh-ico-well">${icon(it.icon)}</span><span class="nsh-tiles__n">${e(k.groups[it.g])} <span aria-hidden="true">· ${e(it.n)}</span></span></div>
          <h3 class="nsh-tiles__title">${e(it.title)}</h3>
          <p class="nsh-tiles__body">${e(it.body)}</p>
          <div class="nsh-tiles__acts">
            <a class="nsh-tiles__btn" href="${e(inquiryHref(lang, it.slug))}">${e(k.formCta)}<span class="nsh-vh"> — ${e(it.title)}</span> <span aria-hidden="true">→</span></a>
            <a class="nsh-tiles__mail" href="${e(mailHref(c, `${k.groups[it.g]} · ${it.title}`))}">${e(k.mailCta)}<span class="nsh-vh"> — ${e(it.title)}</span></a>
            ${it.alt ? `<a class="nsh-tiles__mail" href="${e(contactPageHref(lang, it.alt))}">${e(k.altCta)}<span class="nsh-vh"> — ${e(it.title)}</span></a>` : ""}
          </div>
        </li>`
        )
        .join("")}</ul></div>`;
      })
      .join("")}</div>`
  );
  const g = k.guide;
  const guide = split(
    "guide",
    { kicker: g.kicker, title: g.title, lead: "" },
    checks(g.items),
    {
      mod: "tint",
      extra: `<div class="nsh-guide__links"><p><a class="nsh-link" href="/${e(lang)}/privacy/">${e(g.privacy)} <span aria-hidden="true">→</span></a></p>
        <p>${link(contactPageHref(lang, "general"), g.contactPage)}</p></div>`,
    }
  );
  return {
    hero: hero(c, lang, "contact", k.hero, inquiryHref(lang, "general"), mailHref(c, "SHAREON")),
    body: [
      types,
      guide,
      closing(
        "next",
        { kicker: "NEWON · SHAREON", title: "newon@newon.app", lead: "" },
        [
          [inquiryHref(lang, "general"), k.hero.ctaMain],
          [mailHref(c, "SHAREON"), k.hero.ctaSub],
        ],
        { big: true }
      ),
    ],
  };
}

const RENDER = { overview, platform, business, partnerships, contact };

export function renderShareonPage(lang, id) {
  const c = getShareonCopy(lang);
  const { hero: first, body } = RENDER[id](c, lang);
  return `${first}
${renderFlagshipSubnav({ biz: "shareon", lang, active: id })}
<div id="shareon-detail" class="nsh" data-shareon-page="${e(id)}" data-content-lang="${e(c.contentLang)}"${c.contentLang !== lang ? ` lang="${e(c.contentLang)}"` : ""}>
${status(c)}
${body.join("\n")}
</div>`;
}
