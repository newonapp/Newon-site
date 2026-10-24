#!/usr/bin/env node
/**
 * PETLOG business website — /{lang}/petlog/{,platform/,business/,partnerships/,contact/} for all locales.
 *
 * Design: the existing LivOn Life Stage page shell and film hero (/lifestage/) — same shell, same #lifestage-detail.nls
 * components (film hero, roster, journey rail, flow/board/signal/index/dir/pipe lists, ink close) and the same
 * home-lifestage.css / home-lifestage-layout.css / home-lifestage.js. The PETLOG green is used only for the
 * small kicker labels and status tags (scoped .nls--petlog rules below). The Contact form is the shared Newon
 * inquiry form (render-bsp.mjs → business/inquiry.js → FormSubmit).
 * No app feature (records, booking, orders, payment, sign-in, seller sign-up, posting) is built on the web.
 * Copy: scripts/petlog-site-content.mjs (ko + en; other locales show the English body, like the rest of the site).
 * V3 (2026-10-24): 25 platform areas, 12 revenue models, scenarios, FAQ, PoC/data sections, inquiry purposes — content only.
 * V2: no per-card status badge (owner brief PART 04) — one shared notice per page in the existing .nls-note style.
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
import { renderGlobalHeader, renderStudioFooter } from "./site-chrome.mjs";
import { inquiryFormHtml } from "./render-bsp.mjs";
import { NOTICE, PETLOG_FILM, STORE, PETLOG_MENU, OVERVIEW, PLATFORM, BUSINESS, PARTNERS, CONTACT } from "./petlog-site-content.mjs";
import { renderFlagshipSubnav, FLAGSHIP_SUBNAV_CSS } from "./flagship-subnav.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20261025ov1";
const esc = escapeHtml;
const bl = (lang) => (lang === "ko" ? "ko" : "en");
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");
const pad2 = (n) => String(n).padStart(2, "0");
const rel = (depth, p) => (/^(https?:|mailto:|#|\/)/.test(p) ? p : "../".repeat(depth) + p);

/* ---------------------------------------------------------------- design (2026-10-19 accent redesign)
 * The film hero, the shared sub-menu and the Life Stage shell stay exactly as they are. Everything below the hero
 * is PETLOG's own layout (pl-* classes, scoped to #lifestage-detail.nls--petlog): value tiles, a step timeline,
 * icon bento cards, feature rows, column lists, spec cards, a comparison list, a vertical roadmap, checklists and
 * link tiles — no screenshots or images, only inline line icons.
 * PETLOG green is a point colour only:
 *   #278A53 brand (rules, dots, CTA) · #1E6B41 text on white/tint (AA) · #F4F9F6 band tint · #E8F3EC icon/chip wash
 *   dark: #4FBF80 brand · #8FDDB0 text · #0D1612 band tint · rgba(111,207,151,.12) wash
 */
const PETLOG_CSS = `<style>
  /* Background film framing: show more of the right side (owner request 2026-10-19). */
  #lifestage-detail.nls[data-story="petlog"] .nls-film__video { object-position: 75% 50%; }
  /* the shared film fallback is the LIVON poster; PETLOG shows plain black until its film loads */
  #lifestage-detail.nls--petlog .nls-film__fallback { background: #050505; }

  #lifestage-detail.nls--petlog {
    --pl-g: #278a53; --pl-gi: #1e6b41; --pl-tint: #f4f9f6; --pl-soft: #e8f3ec; --pl-line: rgba(39, 138, 83, 0.28);
    --pl-card: #ffffff; --pl-r: 10px;
  }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog {
    --pl-g: #4fbf80; --pl-gi: #8fddb0; --pl-tint: #0d1612; --pl-soft: rgba(111, 207, 151, 0.12); --pl-line: rgba(111, 207, 151, 0.32);
    --pl-card: #111311;
  }
  #lifestage-detail.nls--petlog .nls-kicker { color: var(--pl-gi); }
  #lifestage-detail.nls--petlog :where(.pl-list, .pl-checks, .pl-steps, .pl-timeline, .pl-values, .pl-grid, .pl-rows, .pl-cols, .pl-chips, .pl-models, .pl-fam, .pl-menu, .pl-types, .pl-table, .pl-legend ul) { margin: 0; padding: 0; list-style: none; }
  #lifestage-detail.nls--petlog :where(.pl-checks, .pl-steps, .pl-timeline, .pl-values, .pl-chips, .pl-fam, .pl-menu, .pl-types, .pl-legend ul) > li::before { content: none; }
  #lifestage-detail.nls--petlog .nls-block--band.pl-tint { background: var(--pl-tint); }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-block--band.pl-tint { background: var(--pl-tint); }
  #lifestage-detail.nls--petlog h3 { margin: 0; font-size: 1.08rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1.4; color: var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-p { margin: 0; font-size: 0.92rem; line-height: 1.62; color: var(--nls-muted); }

  /* icon */
  #lifestage-detail.nls--petlog .pl-ic { flex: none; display: inline-grid; place-items: center; width: 2.6rem; height: 2.6rem; border-radius: 50%; background: var(--pl-soft); color: var(--pl-gi); }
  #lifestage-detail.nls--petlog .pl-ic svg { width: 1.3rem; height: 1.3rem; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  #lifestage-detail.nls--petlog .pl-ic--lg { width: 3.2rem; height: 3.2rem; }
  #lifestage-detail.nls--petlog .pl-ic--lg svg { width: 1.55rem; height: 1.55rem; }
  #lifestage-detail.nls--petlog .pl-n { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; color: var(--pl-gi); font-variant-numeric: tabular-nums; }
  #lifestage-detail.nls--petlog .pl-label { margin: 0; font-size: 0.72rem; font-weight: 650; letter-spacing: 0.1em; text-transform: uppercase; color: var(--nls-faint); }

  /* chips + links */
  #lifestage-detail.nls--petlog .pl-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  #lifestage-detail.nls--petlog .pl-chips li { padding: 0.28rem 0.6rem; border-radius: 999px; background: var(--pl-soft); color: var(--pl-gi); font-size: 0.78rem; font-weight: 600; line-height: 1.3; }
  #lifestage-detail.nls--petlog .pl-chips--line li { background: transparent; border: 1px solid var(--nls-line-strong, #d8d8d8); color: var(--nls-muted); }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .pl-chips--line li { border-color: rgba(255, 255, 255, 0.22); }
  #lifestage-detail.nls--petlog .pl-more { display: inline-flex; align-items: center; gap: 0.3rem; margin-top: auto; padding-top: 0.4rem; width: fit-content; font-size: 0.88rem; font-weight: 650; color: var(--pl-gi); text-decoration: none; border-bottom: 1px solid var(--pl-line); }
  #lifestage-detail.nls--petlog .pl-more:hover { border-bottom-color: var(--pl-g); }
  #lifestage-detail.nls--petlog .pl-more:focus-visible, #lifestage-detail.nls--petlog .pl-tile:focus-visible { outline: 2px solid var(--pl-g); outline-offset: 3px; }
  #lifestage-detail.nls--petlog .pl-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem 1.2rem; margin-top: 1.8rem; }
  #lifestage-detail.nls--petlog .pl-pill { display: inline-flex; align-items: center; gap: 0.45rem; min-height: 2.6rem; padding: 0.5rem 1.05rem; border: 1px solid var(--pl-line); border-radius: 999px; color: var(--pl-gi); font-size: 0.88rem; font-weight: 650; text-decoration: none; background: var(--pl-card); }
  #lifestage-detail.nls--petlog .pl-pill:hover { border-color: var(--pl-g); background: var(--pl-soft); }
  #lifestage-detail.nls--petlog .pl-pill svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  #lifestage-detail.nls--petlog .pl-aside { margin: 0; font-size: 0.85rem; color: var(--nls-faint); }

  /* callout (shared notice / process note) */
  #lifestage-detail.nls--petlog .pl-callout { display: flex; gap: 0.8rem; align-items: flex-start; max-width: 52rem; margin: 0 0 2rem; padding: 1rem 1.15rem; border-left: 3px solid var(--pl-g); border-radius: 0 var(--pl-r) var(--pl-r) 0; background: var(--pl-tint); font-size: 0.9rem; line-height: 1.6; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .nls-block--band.pl-tint .pl-callout { background: var(--pl-card); }
  #lifestage-detail.nls--petlog .pl-callout svg { flex: none; width: 1.15rem; height: 1.15rem; margin-top: 0.15rem; fill: none; stroke: var(--pl-gi); stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }

  /* section head variants */
  #lifestage-detail.nls--petlog .pl-split { display: grid; gap: 2rem; }
  @media (min-width: 960px) {
    #lifestage-detail.nls--petlog .pl-split { grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr); gap: 4rem; align-items: start; }
    #lifestage-detail.nls--petlog .pl-split > .pl-split__head { position: sticky; top: calc(var(--gnav-h, 74px) + 4.5rem); }
  }
  #lifestage-detail.nls--petlog .pl-split .nls-head { margin-bottom: 0; }
  #lifestage-detail.nls--petlog .pl-split .pl-checks { grid-template-columns: minmax(0, 1fr); }
  #lifestage-detail.nls--petlog .pl-split__head .pl-callout { margin: 1.4rem 0 0; }

  /* grid of cards */
  #lifestage-detail.nls--petlog .pl-grid { display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 640px) { #lifestage-detail.nls--petlog .pl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (min-width: 1040px) { #lifestage-detail.nls--petlog .pl-grid { grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-card { display: flex; flex-direction: column; gap: 0.7rem; min-width: 0; margin: 0; padding: 1.45rem 1.35rem 1.5rem; border: 1px solid var(--nls-line); border-radius: var(--pl-r); background: var(--pl-card); transition: border-color 0.2s ease; }
  #lifestage-detail.nls--petlog .pl-card:hover { border-color: var(--pl-line); }
  #lifestage-detail.nls--petlog .pl-card__top { display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; margin-bottom: 0.3rem; }
  #lifestage-detail.nls--petlog .pl-card__top .pl-n { margin-right: auto; }
  #lifestage-detail.nls--petlog .pl-card--tint { background: var(--pl-tint); border-color: transparent; }
  #lifestage-detail.nls--petlog .nls-block--band.pl-tint .pl-card { border-color: transparent; background: var(--pl-card); }
  #lifestage-detail.nls--petlog .pl-card--wide { padding: 1.8rem 1.7rem; }
  @media (min-width: 640px) {
    #lifestage-detail.nls--petlog .pl-card--wide { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 1.3rem; row-gap: 0.7rem; align-content: start; }
    #lifestage-detail.nls--petlog .pl-card--wide > :not(.pl-card__icon) { grid-column: 2; }
    #lifestage-detail.nls--petlog .pl-card--wide > .pl-card__icon { grid-row: 1 / span 8; }
  }

  /* key/value list inside cards and rows */
  #lifestage-detail.nls--petlog .pl-meta { display: grid; gap: 0.5rem; margin: 0.2rem 0 0; padding: 0.85rem 0 0; border-top: 1px dashed var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-meta div { display: grid; grid-template-columns: minmax(4.8rem, auto) minmax(0, 1fr); gap: 0.75rem; font-size: 0.85rem; line-height: 1.5; }
  html:not([lang="ko"]) #lifestage-detail.nls--petlog .pl-meta div { grid-template-columns: 6.6rem minmax(0, 1fr); }
  #lifestage-detail.nls--petlog .pl-meta dt { font-weight: 650; color: var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-meta dd { margin: 0; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-stage { flex: none; width: fit-content; justify-self: start; padding: 0.22rem 0.6rem; border-radius: 999px; border: 1px solid var(--pl-line); color: var(--pl-gi); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.02em; white-space: nowrap; }

  /* feature rows */
  #lifestage-detail.nls--petlog .pl-rows { border-bottom: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-row { display: grid; gap: 0.9rem 2rem; padding: 1.7rem 0; border-top: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-row__lead { display: flex; gap: 1rem; align-items: flex-start; }
  #lifestage-detail.nls--petlog .pl-row__lead > div { display: grid; gap: 0.45rem; min-width: 0; }
  #lifestage-detail.nls--petlog .pl-row__side { display: grid; gap: 0.8rem; align-content: start; }
  #lifestage-detail.nls--petlog .pl-row__side .pl-meta { margin: 0; padding: 0; border: 0; }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .pl-row { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); }
    #lifestage-detail.nls--petlog .pl-row__side { padding-left: 2rem; border-left: 1px solid var(--nls-line); }
  }

  /* column list (top rule, no box) */
  #lifestage-detail.nls--petlog .pl-cols { display: grid; gap: 2rem 1.6rem; grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 760px) { #lifestage-detail.nls--petlog .pl-cols { grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-col { display: flex; flex-direction: column; gap: 0.7rem; min-width: 0; margin: 0; padding-top: 1.2rem; border-top: 2px solid var(--pl-g); }
  #lifestage-detail.nls--petlog .pl-col:nth-child(3n + 2) { border-top-color: color-mix(in srgb, var(--pl-g) 60%, transparent); }
  #lifestage-detail.nls--petlog .pl-col:nth-child(3n + 3) { border-top-color: color-mix(in srgb, var(--pl-g) 35%, transparent); }
  #lifestage-detail.nls--petlog .pl-col__head { display: flex; align-items: center; gap: 0.75rem; }

  /* values (mission) */
  #lifestage-detail.nls--petlog .pl-values { display: grid; gap: 1px; grid-template-columns: minmax(0, 1fr); background: var(--nls-line); border: 1px solid var(--nls-line); border-radius: var(--pl-r); overflow: hidden; }
  @media (min-width: 640px) { #lifestage-detail.nls--petlog .pl-values { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (min-width: 1040px) { #lifestage-detail.nls--petlog .pl-values { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-values li { display: grid; gap: 0.55rem; align-content: start; padding: 1.6rem 1.45rem 1.7rem; background: var(--nls-paper, #fff); }
  #lifestage-detail.nls--petlog .pl-values li:nth-child(2n) { background: var(--pl-tint); }
  #lifestage-detail.nls--petlog .pl-values .pl-ic { margin-bottom: 0.4rem; background: var(--pl-card); box-shadow: inset 0 0 0 1px var(--pl-line); }
  #lifestage-detail.nls--petlog .pl-values h3 { font-size: 1.25rem; }
  #lifestage-detail.nls--petlog .pl-values strong { font-size: 0.95rem; font-weight: 650; color: var(--pl-gi); line-height: 1.45; }
  #lifestage-detail.nls--petlog .pl-head-row { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 1rem 3rem; margin-bottom: 2rem; }
  #lifestage-detail.nls--petlog .pl-head-row .nls-head { margin-bottom: 0; }

  /* horizontal step timeline */
  #lifestage-detail.nls--petlog .pl-steps { display: grid; gap: 0; grid-template-columns: minmax(0, 1fr); counter-reset: none; }
  #lifestage-detail.nls--petlog .pl-steps li { position: relative; display: grid; gap: 0.5rem; align-content: start; padding: 0 0 2rem 2.4rem; }
  #lifestage-detail.nls--petlog .pl-steps li::after { content: ""; position: absolute; left: 0.55rem; top: 1.4rem; bottom: 0; width: 1px; background: var(--pl-line); }
  #lifestage-detail.nls--petlog .pl-steps li:last-child::after { display: none; }
  #lifestage-detail.nls--petlog .pl-steps .pl-dot { position: absolute; left: 0; top: 0.1rem; width: 1.15rem; height: 1.15rem; border-radius: 50%; border: 2px solid var(--pl-g); background: var(--nls-paper, #fff); }
  #lifestage-detail.nls--petlog .pl-steps li:first-child .pl-dot { background: var(--pl-g); }
  #lifestage-detail.nls--petlog .nls-block--band.pl-tint .pl-steps .pl-dot { background: var(--pl-tint); }
  #lifestage-detail.nls--petlog .nls-block--band.pl-tint .pl-steps li:first-child .pl-dot { background: var(--pl-g); }
  #lifestage-detail.nls--petlog .pl-steps .pl-big { font-size: clamp(2rem, 3.4vw, 2.6rem); font-weight: 700; letter-spacing: -0.05em; line-height: 1; color: var(--pl-gi); }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .pl-steps { grid-template-columns: repeat(var(--n, 3), minmax(0, 1fr)); gap: 0 1.8rem; }
    #lifestage-detail.nls--petlog .pl-steps li { padding: 2.2rem 0 0; }
    #lifestage-detail.nls--petlog .pl-steps li::after { left: 1.6rem; right: -1.8rem; top: 0.66rem; bottom: auto; width: auto; height: 1px; }
    #lifestage-detail.nls--petlog .pl-steps li:last-child::after { display: block; right: 0; background: linear-gradient(90deg, var(--pl-line), transparent); }
  }

  /* vertical timeline (roadmap) */
  #lifestage-detail.nls--petlog .pl-timeline { position: relative; display: grid; gap: 0; max-width: 56rem; }
  #lifestage-detail.nls--petlog .pl-timeline li { position: relative; display: grid; gap: 0.45rem; padding: 0 0 2.1rem 2.6rem; }
  #lifestage-detail.nls--petlog .pl-timeline li::after { content: ""; position: absolute; left: 0.6rem; top: 1.5rem; bottom: 0.2rem; width: 2px; background: var(--pl-soft); }
  #lifestage-detail.nls--petlog .pl-timeline li:last-child { padding-bottom: 0; }
  #lifestage-detail.nls--petlog .pl-timeline li:last-child::after { display: none; }
  #lifestage-detail.nls--petlog .pl-timeline .pl-dot { position: absolute; left: 0; top: 0.12rem; display: grid; place-items: center; width: 1.3rem; height: 1.3rem; border-radius: 50%; background: var(--pl-soft); }
  #lifestage-detail.nls--petlog .pl-timeline .pl-dot::before { content: ""; width: 0.5rem; height: 0.5rem; border-radius: 50%; background: var(--pl-g); }
  #lifestage-detail.nls--petlog .pl-timeline .pl-stage { width: fit-content; }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .pl-timeline li { grid-template-columns: 9rem minmax(0, 1fr); column-gap: 1.6rem; }
    #lifestage-detail.nls--petlog .pl-timeline li > .pl-stage { grid-row: 1 / span 2; align-self: start; }
  }

  /* checklist */
  #lifestage-detail.nls--petlog .pl-checks { display: grid; gap: 0 2.4rem; grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 760px) { #lifestage-detail.nls--petlog .pl-checks { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-checks li { display: grid; grid-template-columns: 1.6rem minmax(0, 1fr); gap: 0.75rem; align-items: start; padding: 1rem 0; border-top: 1px solid var(--nls-line); font-size: 0.95rem; line-height: 1.6; color: var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-checks li > i { display: grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; background: var(--pl-soft); color: var(--pl-gi); }
  #lifestage-detail.nls--petlog .pl-checks li > i svg { width: 0.95rem; height: 0.95rem; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  #lifestage-detail.nls--petlog .pl-checks--cards li { grid-template-columns: auto minmax(0, 1fr); padding: 1.3rem 0; }
  #lifestage-detail.nls--petlog .pl-checks--cards li > div { display: grid; gap: 0.35rem; }

  /* model tiles (business structure) */
  #lifestage-detail.nls--petlog .pl-models { display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 560px) { #lifestage-detail.nls--petlog .pl-models { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (min-width: 1040px) { #lifestage-detail.nls--petlog .pl-models { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-models li { display: grid; gap: 0.6rem; align-content: start; padding: 1.4rem 1.35rem 1.5rem; border-radius: var(--pl-r); background: var(--pl-tint); }
  #lifestage-detail.nls--petlog .pl-models li::before { content: none; }
  #lifestage-detail.nls--petlog .pl-models b { font-size: clamp(1.45rem, 2.4vw, 1.8rem); font-weight: 700; letter-spacing: -0.04em; line-height: 1.1; color: var(--pl-gi); }
  #lifestage-detail.nls--petlog .pl-models span { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; color: var(--nls-faint); }

  /* legend panels (platform) */
  #lifestage-detail.nls--petlog .pl-legend { display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 860px) { #lifestage-detail.nls--petlog .pl-legend { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); } }
  #lifestage-detail.nls--petlog .pl-panel { display: grid; gap: 1rem; align-content: start; padding: 1.6rem 1.5rem 1.7rem; border-radius: var(--pl-r); border: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-panel--now { background: var(--pl-tint); border-color: var(--pl-line); }
  #lifestage-detail.nls--petlog .pl-panel--next { border-style: dashed; border-color: var(--nls-line-strong, #d8d8d8); }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .pl-panel--next { border-color: rgba(255, 255, 255, 0.22); }
  #lifestage-detail.nls--petlog .pl-panel__head { display: flex; align-items: center; gap: 0.8rem; }

  /* comparison list (revenue) */
  #lifestage-detail.nls--petlog .pl-table { border-top: 2px solid var(--pl-g); }
  #lifestage-detail.nls--petlog .pl-table li { display: grid; gap: 0.4rem 1.5rem; padding: 1.15rem 0; border-bottom: 1px solid var(--nls-line); grid-template-columns: minmax(0, 1fr) auto; }
  #lifestage-detail.nls--petlog .pl-table li::before { content: none; }
  #lifestage-detail.nls--petlog .pl-table .pl-table__name { display: flex; gap: 0.8rem; align-items: baseline; font-weight: 700; color: var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-table .pl-p { grid-column: 1 / -1; }
  #lifestage-detail.nls--petlog .pl-table .pl-stage { grid-column: 2; grid-row: 1; align-self: center; }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .pl-table li { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.8fr) 8rem; align-items: center; }
    #lifestage-detail.nls--petlog .pl-table .pl-p { grid-column: 2; grid-row: 1; }
    #lifestage-detail.nls--petlog .pl-table .pl-stage { grid-column: 3; justify-self: end; }
  }
  #lifestage-detail.nls--petlog .pl-table__hd { display: none; }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .pl-table li.pl-table__hd { display: grid; padding: 0.7rem 0; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--nls-faint); }
  }

  /* NEWON family tiles + PETLOG menu + contact types (link tiles) */
  #lifestage-detail.nls--petlog .pl-fam { display: grid; gap: 0.75rem; grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 560px) { #lifestage-detail.nls--petlog .pl-fam { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-tile { display: flex; flex-direction: column; gap: 0.4rem; height: 100%; padding: 1.15rem 1.15rem 1.2rem; border: 1px solid var(--nls-line); border-radius: var(--pl-r); background: var(--pl-card); color: inherit; text-decoration: none; transition: border-color 0.2s ease, background-color 0.2s ease; }
  #lifestage-detail.nls--petlog a.pl-tile:hover { border-color: var(--pl-g); }
  #lifestage-detail.nls--petlog .pl-tile strong { display: flex; justify-content: space-between; gap: 0.6rem; font-size: 1rem; font-weight: 700; letter-spacing: -0.01em; color: var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-tile strong em { font-style: normal; color: var(--pl-gi); font-weight: 600; }
  #lifestage-detail.nls--petlog .pl-tile .pl-p { font-size: 0.86rem; line-height: 1.55; }
  #lifestage-detail.nls--petlog .pl-tile[aria-current="page"], #lifestage-detail.nls--petlog .pl-tile.is-self { border-color: var(--pl-line); background: var(--pl-tint); box-shadow: inset 0 3px 0 var(--pl-g); }
  #lifestage-detail.nls--petlog .pl-menu { display: grid; gap: 0.75rem; grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 640px) { #lifestage-detail.nls--petlog .pl-menu { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (min-width: 1040px) { #lifestage-detail.nls--petlog .pl-menu { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-types { display: grid; gap: 0.75rem; grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 640px) { #lifestage-detail.nls--petlog .pl-types { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (min-width: 1040px) { #lifestage-detail.nls--petlog .pl-types { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-types .pl-tile { flex-direction: row; align-items: flex-start; gap: 0.9rem; }
  #lifestage-detail.nls--petlog .pl-tile__body { display: grid; gap: 0.35rem; min-width: 0; flex: 1; }
  #lifestage-detail.nls--petlog .pl-types .pl-ic { width: 2.3rem; height: 2.3rem; }
  #lifestage-detail.nls--petlog .pl-types .pl-ic svg { width: 1.15rem; height: 1.15rem; }

  /* SaaS sub-panel (business) */
  #lifestage-detail.nls--petlog .pl-sub { margin-top: 2.4rem; padding: clamp(1.4rem, 3vw, 2.2rem); border-radius: var(--pl-r); background: var(--pl-tint); }
  #lifestage-detail.nls--petlog .nls-block--band.pl-tint .pl-sub { background: var(--pl-card); }
  #lifestage-detail.nls--petlog .pl-sub .nls-head { margin-bottom: 1.4rem; }
  #lifestage-detail.nls--petlog .pl-sub .nls-title { font-size: clamp(1.3rem, 2.3vw, 1.65rem); }
  #lifestage-detail.nls--petlog .pl-sub .pl-cols { --cols: 5; }
  @media (min-width: 760px) and (max-width: 1039px) { #lifestage-detail.nls--petlog .pl-sub .pl-cols { --cols: 2; } }

  /* journey rail (shared component, PETLOG tint) */
  #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail { border-radius: var(--pl-r) var(--pl-r) 0 0; overflow: hidden; }
  #lifestage-detail.nls--petlog .nls-journey { border-radius: 0 0 var(--pl-r) var(--pl-r); overflow: hidden; background: var(--pl-card); }
  #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn { background: var(--pl-card); }
  #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn em { color: var(--nls-faint); }
  #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on { background: var(--pl-soft); box-shadow: inset 0 -3px 0 var(--pl-g); color: var(--pl-gi); }
  #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on em { color: var(--pl-gi); }
  #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on span { color: var(--pl-gi); }
  #lifestage-detail.nls--petlog .nls-decade { background: var(--pl-card); }
  #lifestage-detail.nls--petlog .nls-decade__mark { background: var(--pl-soft); color: var(--pl-gi); }
  #lifestage-detail.nls--petlog .nls-decade__mark em { color: var(--pl-gi); opacity: 0.7; }
  #lifestage-detail.nls--petlog .nls-decade__n { color: var(--pl-gi); }
  #lifestage-detail.nls--petlog .nls-decade .nls-chips li { border-color: var(--pl-line); color: var(--pl-gi); background: transparent; }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail--petlog { grid-template-columns: repeat(var(--petlog-rail-n, 7), minmax(0, 1fr)); }
  }
  html[data-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn,
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn { background: var(--pl-card) !important; border-color: rgba(255, 255, 255, 0.1); }
  html[data-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on,
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on { background: #16271d !important; color: var(--pl-gi); }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on > * { color: var(--pl-gi) !important; background: transparent !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn span { color: #f2f2f2; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-decade,
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey { background: var(--pl-card) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-decade__mark { background: #16271d !important; color: var(--pl-gi) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-decade__mark * { color: var(--pl-gi) !important; }

  /* FAQ (platform) — native details/summary in the checklist rule language */
  #lifestage-detail.nls--petlog .pl-faq { max-width: 56rem; border-bottom: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-faq details { border-top: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-faq summary { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1.15rem 0; cursor: pointer; list-style: none; font-size: 1rem; font-weight: 700; line-height: 1.5; color: var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-faq summary::-webkit-details-marker { display: none; }
  #lifestage-detail.nls--petlog .pl-faq summary::after { content: "+"; flex: none; display: grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; background: var(--pl-soft); color: var(--pl-gi); font-weight: 600; }
  #lifestage-detail.nls--petlog .pl-faq details[open] summary::after { content: "−"; }
  #lifestage-detail.nls--petlog .pl-faq summary:focus-visible { outline: 2px solid var(--pl-g); outline-offset: 2px; }
  #lifestage-detail.nls--petlog .pl-faq details > .pl-p { padding: 0 2.6rem 1.3rem 0; }
  #lifestage-detail.nls--petlog .pl-subhead { margin: 0 0 1.2rem; }

  /* closing band: ink stays, the main button takes the point colour */
  #lifestage-detail.nls--petlog .nls-close .nls-kicker { color: #7fd6a4; }
  #lifestage-detail.nls--petlog .nls-close .nls-btn:not(.nls-btn--ghost) { background: #278a53; border-color: #278a53; color: #fff; }
  #lifestage-detail.nls--petlog .nls-close .nls-btn:not(.nls-btn--ghost):hover { background: #1e6b41; border-color: #1e6b41; color: #fff; }

  /* contact form accents */
  #lifestage-detail.nls--petlog .bp-page .bp-label { color: var(--pl-gi); }
  #lifestage-detail.nls--petlog .bp-page .bz-submit { background: #1e6b41; border-color: #1e6b41; color: #fff; }
  #lifestage-detail.nls--petlog .bp-page .bz-submit:hover { background: #278a53; border-color: #278a53; }
  #lifestage-detail.nls--petlog .bp-page :where(input, select, textarea):focus-visible { outline: 2px solid var(--pl-g); outline-offset: 1px; }
  /* dark: the site-wide dark canvas (site-dark.css) paints every descendant black/white with !important —
     PETLOG re-applies its quiet accents inside the content wrapper only (hero + sub-menu untouched). */
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap :where(*) { background-color: transparent !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .nls-block--band.pl-tint { background-color: var(--pl-tint) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .nls-block--ink { background-color: #000 !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap :is(.pl-card, .pl-tile, .pl-values li, .nls-journey, .nls-decade, .nls-journey-sec .nls-rail__btn) { background-color: var(--pl-card) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap :is(.pl-card--tint, .pl-models li, .pl-panel--now, .pl-sub, .pl-callout, .pl-tile.is-self, .pl-tile[aria-current="page"], .pl-values li:nth-child(2n)) { background-color: var(--pl-tint) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .nls-block--band.pl-tint :is(.pl-card, .pl-card--tint, .pl-callout, .pl-sub) { background-color: #000 !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap :is(.pl-ic, .pl-chips li, .pl-checks li > i, .pl-timeline .pl-dot, .nls-decade__mark, .nls-journey-sec .nls-rail__btn.is-on) { background-color: var(--pl-soft) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap :is(.nls-kicker, .pl-n, .pl-ic, .pl-chips li, .pl-checks li > i, .pl-stage, .pl-more, .pl-pill, .pl-values strong, .pl-models b, .pl-steps .pl-big, .pl-tile strong em, .nls-decade__mark, .nls-decade__mark *, .nls-decade__n, .nls-decade .nls-chips li, .nls-journey-sec .nls-rail__btn.is-on, .nls-journey-sec .nls-rail__btn.is-on *) { color: var(--pl-gi) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap :is(.pl-stage, .pl-pill, .nls-decade .nls-chips li, .pl-panel--now) { border-color: var(--pl-line) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap :is(.pl-col, .pl-table) { border-top-color: var(--pl-g) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .pl-col:nth-child(3n + 2) { border-top-color: rgba(79, 191, 128, 0.6) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .pl-col:nth-child(3n + 3) { border-top-color: rgba(79, 191, 128, 0.35) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .pl-callout { border-left-color: var(--pl-g) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap :is(.pl-tile.is-self, .pl-tile[aria-current="page"]) { border-color: var(--pl-line) !important; border-top: 3px solid var(--pl-g) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .nls-journey-sec .nls-rail__btn.is-on { border-bottom: 3px solid var(--pl-g) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .pl-steps .pl-dot { border-color: var(--pl-g) !important; background-color: #000 !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .nls-block--band.pl-tint .pl-steps .pl-dot { background-color: var(--pl-tint) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .pl-steps li:first-child .pl-dot, html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .pl-timeline .pl-dot::before { background-color: var(--pl-g) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .pl-steps li::after { background-color: var(--pl-line) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .pl-timeline li::after { background-color: var(--pl-soft) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .pl-steps li:last-child::after { background: linear-gradient(90deg, var(--pl-line), transparent) !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .nls-close .nls-kicker { color: #7fd6a4 !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .nls-close .nls-btn:not(.nls-btn--ghost) { background-color: #278a53 !important; border-color: #278a53 !important; color: #fff !important; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls__wrap .nls-close .nls-btn:not(.nls-btn--ghost):hover { background-color: #1e6b41 !important; border-color: #1e6b41 !important; }
</style>`;

/* ---------------------------------------------------------------- inline line icons (24×24, stroke) */
const ICON = {
  paw: '<circle cx="6.5" cy="10" r="1.7"/><circle cx="10" cy="6" r="1.7"/><circle cx="14" cy="6" r="1.7"/><circle cx="17.5" cy="10" r="1.7"/><path d="M8 17.2c0-2.6 1.9-5.2 4-5.2s4 2.6 4 5.2c0 1.5-1.2 2.4-2.6 2-.9-.3-1.9-.3-2.8 0-1.4.4-2.6-.5-2.6-2z"/>',
  heart: '<path d="M12 20s-7.5-4.5-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.5 12 20 12 20z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  sprout: '<path d="M12 20v-8"/><path d="M12 12c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5z"/><path d="M12 14.5c0-3-2.6-5.2-6-5.2 0 3 2.6 5.2 6 5.2z"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7l1.4-2.5h4.2L15.5 7"/><circle cx="12" cy="13.5" r="3.4"/>',
  shield: '<path d="M12 3l7 3v5.2c0 4.8-3.3 8.3-7 9.8-3.7-1.5-7-5-7-9.8V6z"/><path d="M9 12l2.1 2.1L15.2 10"/>',
  access: '<circle cx="12" cy="4.8" r="1.8"/><path d="M5 8.8l7 1.2 7-1.2M12 10v4.5m0 0L9 21m3-6.5L15 21"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1-4 3.8-6 7-6s6 2 7 6"/>',
  note: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h3.5"/>',
  bowl: '<path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 8.5c0-1.5 1-2 1-3.5M14 8.5c0-1.5 1-2 1-3.5"/>',
  pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/><path d="M9.5 14.5l1.8 1.8 3.4-3.4"/>',
  users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M3 19.5c.8-3.4 3.2-5.2 6-5.2s5.2 1.8 6 5.2M15.5 14.3c2.5-.4 4.7 1 5.5 3.7"/>',
  chat: '<path d="M4 5h16v11H9.5L4 20z"/><path d="M8 9.5h8M8 12.5h5"/>',
  spark: '<path d="M12 3.5l1.7 5L19 10.2l-5.3 1.7L12 17l-1.7-5.1L5 10.2l5.3-1.7z"/><path d="M18.5 15.5l.7 1.7 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  book: '<path d="M4 5.2c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6.2v14"/>',
  bag: '<path d="M5 8h14l-1.1 12H6.1z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  cycle: '<path d="M4.5 12a7.5 7.5 0 0 1 13.2-4.9M19.5 12a7.5 7.5 0 0 1-13.2 4.9"/><path d="M18 3.5v4h-4M6 20.5v-4h4"/>',
  cart: '<circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/><path d="M3 4h2.2l2.2 10.5h10.8L20 7.5H6.4"/>',
  clinic: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M12 8.2v7.6M8.2 12h7.6"/>',
  scissors: '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8.2 8.3L20 18M8.2 15.7L20 6"/>',
  home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
  walk: '<circle cx="13" cy="4.6" r="1.7"/><path d="M10 21l2-6.5 2.5 2.5V21M12 14.5l-1-4 3-2 2 3.5h3M11 10.5L8 12v3"/>',
  pin: '<path d="M12 21s-6.2-5.6-6.2-11a6.2 6.2 0 0 1 12.4 0c0 5.4-6.2 11-6.2 11z"/><circle cx="12" cy="10" r="2.2"/>',
  umbrella: '<path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v6a2 2 0 0 0 4 0"/>',
  star: '<path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.3l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M11 21v-3h2v3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.5 5.5 3.5 9s-1.1 6.5-3.5 9c-2.4-2.5-3.5-5.5-3.5-9s1.1-6.5 3.5-9z"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8.5 16v-4M12.5 16V8M16.5 16v-6"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.8h2"/>',
  megaphone: '<path d="M4 10v4h3l8 4V6L7 10z"/><path d="M18 9.5a3.5 3.5 0 0 1 0 5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  tool: '<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.3 8.3a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};
const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[k] || ICON.paw}</svg>`;
const ic = (k, big) => `<span class="pl-ic${big ? " pl-ic--lg" : ""}" aria-hidden="true">${svg(k)}</span>`;
const CHECK = `<i aria-hidden="true">${svg("check")}</i>`;

/** Pick a line icon from an English label/name. */
function iconFor(text) {
  const t = String(text || "").toLowerCase();
  const rules = [
    [/memorial|end-of-life|memor|photo/, t.includes("photo") ? "camera" : "star"],
    [/insur/, "umbrella"],
    [/adopt|lost animal|welfare|protection/, "heart"],
    [/profile/, "user"],
    [/daily|diary/, "note"],
    [/meal|walks? &|activity/, "bowl"],
    [/vaccin|medication|vet visit/, "calendar"],
    [/health|medical/, "pulse"],
    [/\bai\b/, "spark"],
    [/family|shar(e|ing)/, "users"],
    [/creator|community|info &/, "chat"],
    [/train|educat|behaviou?r|content/, "book"],
    [/secondhand|circular/, "cycle"],
    [/group buy/, "cart"],
    [/vet|clinic/, "clinic"],
    [/groom/, "scissors"],
    [/sitting|walking/, "walk"],
    [/hotel|daycare|lodging/, "home"],
    [/travel|places/, "pin"],
    [/app &|accessib/, "phone"],
    [/global|licens/, "globe"],
    [/local government|public/, "building"],
    [/saas|enterprise|business|technology/, "chart"],
    [/food|treat|goods|brand|shopping|commerce/, "bag"],
    [/campaign/, "megaphone"],
    [/operations tool/, "tool"],
    [/reaching/, "link"],
    [/data principle/, "shield"],
  ];
  for (const [re, k] of rules) if (re.test(t)) return k;
  return "paw";
}
const VALUE_ICONS = ["heart", "link", "sprout", "shield", "access"];
/** One line icon per platform area (01–25), per revenue model and per partner type. */
const AREA_ICONS = ["user", "pulse", "bowl", "calendar", "camera", "clinic", "scissors", "walk", "home", "book", "chat", "check", "cart", "cycle", "globe", "spark", "shield", "phone", "chart", "link", "building", "pin", "heart", "users", "star"];
const LINE_ICONS = { "01": "cycle", "02": "scissors", "03": "walk", "04": "home", "05": "book", "06": "cart", "07": "bag", "08": "globe", "09": "phone", "10": "chart", "11": "star", "12": "megaphone" };
const PARTNER_ICONS = { "01": "clinic", "02": "scissors", "03": "home", "04": "users", "05": "walk", "06": "book", "07": "bag", "08": "megaphone", "09": "pin", "10": "phone", "11": "umbrella", "12": "heart", "13": "star", "14": "building" };
const BEYOND_ICONS = ["note", "scissors", "chat", "spark", "heart"];
const TYPE_ICONS = { general: "mail", "app-support": "phone", content: "book", vet: "clinic", "booking-provider": "scissors", sitting: "walk", brand: "bag", "group-buying": "cart", "insurance-adoption": "umbrella", saas: "chart", public: "building", global: "globe" };

/* ---------------------------------------------------------------- shared blocks */
function head(kicker, title, lead) {
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${esc(kicker)}</p>` : ""}
    <h2 class="nls-title">${nl(title)}</h2>
    ${lead ? `<p class="nls-lead">${esc(lead)}</p>` : ""}
  </header>`;
}
const ext = (h) => /^https?:/.test(h);
const href = (depth, h) => (ext(h) ? h : rel(depth, h));
const extAttr = (h) => (ext(h) ? ' target="_blank" rel="noopener noreferrer"' : "");
const chipList = (items, line) => (items && items.length ? `<ul class="pl-chips${line ? " pl-chips--line" : ""}">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "");
const callout = (t) => (t ? `<p class="nls-note pl-callout">${svg("info")}<span>${esc(t)}</span></p>` : "");
const more = (link, depth) => (link ? `<a class="pl-more" href="${esc(href(depth, link[1]))}"${extAttr(link[1])}>${esc(link[0])} <span aria-hidden="true">→</span></a>` : "");
const metaList = (points) => {
  const rows = (points || []).filter(([, v]) => v && v !== "—");
  return rows.length ? `<dl class="pl-meta">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : "";
};

/**
 * Section wrapper. tint → full-bleed pale-green band.
 */
function section(id, { kicker, title, lead, noteText, tint, body, extraClass }) {
  return `<div id="${id}" class="nls-block${tint ? " nls-block--band pl-tint" : ""}${extraClass ? ` ${extraClass}` : ""}" data-hs-section>
    ${head(kicker, title, lead)}
    ${callout(noteText)}
    ${body}
  </div>`;
}
function splitSection(id, { kicker, title, lead, noteText, tint, body, aside }) {
  return `<div id="${id}" class="nls-block${tint ? " nls-block--band pl-tint" : ""}" data-hs-section>
    <div class="pl-split">
      <div class="pl-split__head">${head(kicker, title, lead)}${callout(noteText)}${aside || ""}</div>
      <div>${body}</div>
    </div>
  </div>`;
}

/**
 * Cards in one of several PETLOG layouts.
 * kind: tile (icon card grid) · tint (tinted icon cards) · wide (2 large cards) · row (feature rows) · col (ruled columns)
 * card: { n, label?, icon?, name, lead, points?: [k, v][], chips?, stage?, link?: [label, href], anchor? }
 */
function cards(kind, list, depth, cols) {
  const id = (c) => (c.anchor ? ` id="${esc(c.anchor)}"` : "");
  const label = (c) => (c.label ? `<p class="pl-label" lang="en">${esc(c.label)}</p>` : "");
  const stage = (c) => (c.stage ? `<span class="pl-stage">${esc(c.stage)}</span>` : "");
  if (kind === "row")
    return `<div class="pl-rows">${list
      .map(
        (c) => `<article class="pl-row"${id(c)}>
        <div class="pl-row__lead">${ic(c.icon)}<div><span class="pl-n">${esc(c.n)}</span>${label(c)}<h3>${esc(c.name)}</h3><p class="pl-p">${esc(c.lead)}</p></div></div>
        <div class="pl-row__side">${stage(c)}${metaList(c.points)}${chipList(c.chips)}${more(c.link, depth)}</div>
      </article>`
      )
      .join("")}</div>`;
  if (kind === "col")
    return `<div class="pl-cols" style="--cols:${cols || 3}">${list
      .map(
        (c) => `<article class="pl-col"${id(c)}>
        <div class="pl-col__head">${c.icon ? ic(c.icon) : ""}<span class="pl-n">${esc(c.n)}</span>${stage(c)}</div>
        ${label(c)}<h3>${esc(c.name)}</h3><p class="pl-p">${esc(c.lead)}</p>
        ${metaList(c.points)}${chipList(c.chips)}${more(c.link, depth)}
      </article>`
      )
      .join("")}</div>`;
  if (kind === "wide")
    return `<div class="pl-grid" style="--cols:2">${list
      .map(
        (c) => `<article class="pl-card pl-card--wide pl-card--tint"${id(c)}>
        <span class="pl-card__icon">${ic(c.icon, true)}</span>
        <span class="pl-n">${esc(c.n)}</span>${label(c)}<h3>${esc(c.name)}</h3><p class="pl-p">${esc(c.lead)}</p>
        ${stage(c)}${metaList(c.points)}${chipList(c.chips)}${more(c.link, depth)}
      </article>`
      )
      .join("")}</div>`;
  return `<div class="pl-grid" style="--cols:${cols || 3}">${list
    .map(
      (c) => `<article class="pl-card${kind === "tint" ? " pl-card--tint" : ""}"${id(c)}>
        <div class="pl-card__top">${c.icon ? ic(c.icon) : ""}<span class="pl-n">${esc(c.n)}</span>${stage(c)}</div>
        ${label(c)}<h3>${esc(c.name)}</h3><p class="pl-p">${esc(c.lead)}</p>
        ${metaList(c.points)}${chipList(c.chips)}${more(c.link, depth)}
      </article>`
    )
    .join("")}</div>`;
}

function hero({ wordmark, titleHtml, lead, main, sub }) {
  return `<div class="nls-film" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${esc(PETLOG_FILM)}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${esc(PETLOG_FILM)}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark" lang="en">${esc(wordmark)}</p>
        <h1 id="story-lifestage-title" class="nls-film__slogan">${titleHtml}</h1>
        <p class="nls-film__lead">${esc(lead)}</p>
        <div class="nls-film__actions">
          <a class="nls-btn" href="${esc(main[1])}"${main[1].startsWith("#") ? " data-nls-scroll" : ""}>${esc(main[0])}</a>
          <a class="nls-btn nls-btn--ghost" href="${esc(sub[1])}"${ext(sub[1]) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(sub[0])}</a>
        </div>
      </div>
    </div>
  </div>`;
}

/** Horizontal step timeline. steps: [big, title, body][] */
const stepList = (steps) =>
  `<ol class="pl-steps" style="--n:${steps.length}">${steps
    .map(([big, t, d]) => `<li><span class="pl-dot" aria-hidden="true"></span>${big ? `<span class="pl-big">${esc(big)}</span>` : ""}<h3>${esc(t)}</h3><p class="pl-p">${esc(d)}</p></li>`)
    .join("")}</ol>`;

/** Vertical timeline. rows: [stage, title, body][] */
const timeline = (rows) =>
  `<ol class="pl-timeline">${rows
    .map(([s, t, d]) => `<li><span class="pl-dot" aria-hidden="true"></span><span class="pl-stage">${esc(s)}</span><h3>${esc(t)}</h3><p class="pl-p">${esc(d)}</p></li>`)
    .join("")}</ol>`;

/** Checklist. items: string[] or [title, body][] */
const checks = (items) =>
  typeof items[0] === "string"
    ? `<ul class="pl-checks">${items.map((t) => `<li>${CHECK}<span>${esc(t)}</span></li>`).join("")}</ul>`
    : `<ul class="pl-checks pl-checks--cards">${items.map(([t, d, k]) => `<li>${k ? ic(k) : CHECK}<div><h3>${esc(t)}</h3><p class="pl-p">${esc(d)}</p></div></li>`).join("")}</ul>`;

/** Link tiles. items: { n, name, body, href, on?, icon? } */
const tiles = (cls, items, depth) =>
  `<ul class="${cls}">${items
    .map((s) => {
      const inner = `${s.icon ? ic(s.icon) : ""}<div class="pl-tile__body">${s.n ? `<span class="pl-n">${esc(s.n)}</span>` : ""}<strong>${esc(s.name)}<em aria-hidden="true">${s.href ? "→" : ""}</em></strong>${s.body ? `<p class="pl-p">${esc(s.body)}</p>` : ""}</div>`;
      return `<li>${
        s.href
          ? `<a class="pl-tile${s.self ? " is-self" : ""}" href="${esc(href(depth, s.href))}"${s.on ? ' aria-current="page"' : ""}${extAttr(s.href)}>${inner}</a>`
          : `<div class="pl-tile">${inner}</div>`
      }</li>`;
    })
    .join("")}</ul>`;

/** Tab rail + cards (Life Stage "life journey" component; home-lifestage.js drives it). One rail per page. */
function railBlock(id, { kicker, title, lead, noteText, items, ariaLabel }) {
  const rail = items
    .map((it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${esc(it.id)}" aria-pressed="${i === 0}"><em>${esc(it.n)}</em><span>${esc(it.tab)}</span></button>`)
    .join("");
  const cardsHtml = items
    .map(
      (it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${esc(it.id)}" data-scene="${esc(it.id)}">
        <div class="nls-decade__mark" aria-hidden="true"><b>${esc(it.mark)}</b><em>${esc(it.n)}</em></div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${esc(it.n)}</p>
          <p class="nls-decade__age" lang="en">${esc(it.label)}</p>
          <h3>${esc(it.name)}</h3>
          <p class="nls-decade__lead">${esc(it.lead)}</p>
          ${it.chips && it.chips.length ? `<ul class="nls-chips">${it.chips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        </div>
      </article>`
    )
    .join("");
  return `<div id="${id}" class="nls-block nls-block--band pl-tint nls-journey-sec" data-hs-section>
    ${head(kicker, title, lead)}
    <div class="nls-rail nls-rail--petlog" style="--petlog-rail-n:${items.length}" role="group" aria-label="${esc(ariaLabel || kicker)}">${rail}</div>
    <div class="nls-journey">${cardsHtml}</div>
    ${callout(noteText)}
  </div>`;
}

function menuBlock(lang, depth, active) {
  const items = PETLOG_MENU.map((m) => ({ n: m.n, name: `${m.name} · ${m[bl(lang)]}`, body: bl(lang) === "ko" ? m.koLead : m.enLead, href: m.href, on: m.id === active }));
  const label = lang === "ko" ? "PETLOG 메뉴" : "PETLOG MENU";
  return `<div id="nls-petlog-menu" class="nls-block" data-hs-section>
    ${head("PETLOG", label, "")}
    <nav aria-label="${esc(label)}">${tiles("pl-menu", items, depth)}</nav>
  </div>`;
}

function closeBlock(c, depth) {
  return `<div id="nls-close" class="nls-block nls-close nls-block--ink" data-hs-section>
    <p class="nls-kicker">${esc(c.kicker)}</p>
    <h2 class="nls-hero__title">${c.titleHtml}</h2>
    <p class="nls-lead">${esc(c.lead)}</p>
    <div class="nls-actions">
      <a class="nls-btn" href="${esc(rel(depth, c.main[1]))}">${esc(c.main[0])} →</a>
      <a class="nls-btn nls-btn--ghost" href="${esc(href(depth, c.sub[1]))}"${extAttr(c.sub[1])}>${esc(c.sub[0])}</a>
    </div>
  </div>`;
}

const wrap = (inner) => `<section id="lifestage-detail" class="nls nls--petlog" data-story="petlog" aria-labelledby="story-lifestage-title">${inner}</section>`;
const CONTACT_HREF = (type) => `petlog/contact/?type=${type}#inquiry`;
/** "Care — tagline. body" → [key, tagline, body] */
const splitValue = (s) => {
  const [k, rest = ""] = s.split(" — ");
  const i = rest.indexOf(". ");
  return i > 0 ? [k, rest.slice(0, i + 1), rest.slice(i + 2)] : [k, rest, ""];
};
const storeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M9 7h8v8"/></svg>';

/* ---------------------------------------------------------------- pages */
const storePills = (label) =>
  `<div class="pl-actions"><p class="pl-aside">${esc(label)}</p><a class="pl-pill" href="${esc(STORE.ios)}" target="_blank" rel="noopener noreferrer">App Store ${storeIcon}</a><a class="pl-pill" href="${esc(STORE.android)}" target="_blank" rel="noopener noreferrer">Google Play ${storeIcon}</a></div>`;

/** FAQ list (native details/summary). items: [question, answer][] */
const faqList = (items) =>
  `<div class="pl-faq">${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p class="pl-p">${esc(a)}</p></details>`).join("")}</div>`;

function overviewPage(lang) {
  const c = OVERVIEW[bl(lang)];
  const L = bl(lang);
  const D = 1;
  const journey = c.journey.items.map((it) => ({ id: it.id, n: it.n, tab: it.tab, mark: it.tab, label: it.label, name: it.name, lead: it.lead, chips: it.topics }));
  const values = `<h3 class="pl-subhead">${esc(c.mission.valuesTitle)}</h3><ul class="pl-values">${c.mission.body
    .map((s, i) => {
      const [k, tag, body] = splitValue(s);
      return `<li>${ic(VALUE_ICONS[i] || "paw")}<span class="pl-n">${pad2(i + 1)}</span><h3 lang="en">${esc(k)}</h3><strong>${esc(tag)}</strong>${body ? `<p class="pl-p">${esc(body)}</p>` : ""}</li>`;
    })
    .join("")}</ul>`;
  const problem = c.problem.items.map((x) => ({ n: x.n, label: x.label, icon: x.icon, name: x.name, lead: x.lead, points: [[c.problem.pointLabel, x.solve]] }));
  const users = c.users.items.map(([t, d, k]) => [t, d, k]);
  const scenes = c.scenes.items.map((x) => ({ n: x.n, icon: x.icon, name: x.name, lead: x.lead, points: [[c.scenes.nowLabel, x.now], [c.scenes.nextLabel, x.next]] }));
  const core = c.core.items.map((x) => ({ ...x, icon: iconFor(x.label) }));
  const diff = c.diff.items.map((x) => ({ n: x.n, icon: x.icon, name: x.name, lead: x.lead, points: [[c.diff.pointLabel, x.point]] }));
  const beyond = c.beyond.items.map((x, i) => ({ ...x, icon: BEYOND_ICONS[i] }));
  const trust = c.trust.items.map((x) => [x.name, x.lead]);
  const fam = c.newon.items.map((x) => ({ name: x.name, body: x.body, href: x.href, self: x.name === "PETLOG" }));
  return wrap(`${hero({ wordmark: "PETLOG", titleHtml: c.heroTitle, lead: c.heroLead, main: [`${c.ctaMain} →`, "#nls-mission"], sub: [c.ctaSub, rel(D, "petlog/platform/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "overview" })}
  <div class="nls__wrap">
    <div id="nls-mission" class="nls-block" data-hs-section>
      ${head(c.mission.kicker, c.mission.title, c.mission.lead)}
      ${values}
    </div>
    ${section("nls-problem", { kicker: c.problem.kicker, title: c.problem.title, lead: c.problem.lead, tint: true, body: cards("row", problem, D) })}
    ${section("nls-about", { kicker: c.about.kicker, title: c.about.title, lead: c.about.lead, body: stepList(c.about.steps) })}
    ${railBlock("nls-journey", { kicker: c.journey.kicker, title: c.journey.title, lead: c.journey.lead, items: journey })}
    ${splitSection("nls-users", { kicker: c.users.kicker, title: c.users.title, lead: c.users.lead, body: checks(users) })}
    ${section("nls-scenes", { kicker: c.scenes.kicker, title: c.scenes.title, lead: c.scenes.lead, tint: true, body: cards("tile", scenes, D, 2) })}
    ${section("nls-core", { kicker: c.core.kicker, title: c.core.title, lead: c.core.lead, body: `${cards("tile", core, D, 4)}${storePills(c.core.appLabel)}` })}
    ${section("nls-diff", { kicker: c.diff.kicker, title: c.diff.title, lead: c.diff.lead, tint: true, body: cards("col", diff, D, 3) })}
    ${section("nls-beyond", { kicker: c.beyond.kicker, title: c.beyond.title, lead: c.beyond.lead, noteText: NOTICE[L], body: `${cards("tint", beyond, D, 3)}<div class="pl-actions">${more([c.beyond.cta, "petlog/platform/"], D)}</div>` })}
    ${section("nls-trust", { kicker: c.trust.kicker, title: c.trust.title, tint: true, body: checks(trust) })}
    ${splitSection("nls-newon", { kicker: c.newon.kicker, title: c.newon.title, lead: c.newon.lead, body: tiles("pl-fam", fam, D) })}
    ${menuBlock(lang, D, "overview")}
    ${closeBlock({ ...c.close, main: [c.close.ctaMain, "petlog/platform/"], sub: [c.close.ctaSub, "petlog/contact/"] }, D)}
  </div>`);
}

function platformPage(lang) {
  const m = PLATFORM.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const card = (idx) => {
    const it = PLATFORM.items[idx];
    const link = it.cta === "app" ? [m.labels.app, STORE.ios] : [m.labels.cta, CONTACT_HREF(it.cta)];
    return {
      n: pad2(idx + 1),
      label: it.label,
      icon: AREA_ICONS[idx],
      name: it.name[L],
      lead: it.lead[L],
      points: [[m.labels.users, it.users[L]], [m.labels.connect, it.connect[L]]],
      chips: it.f[L],
      link,
      anchor: it.label.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, ""),
    };
  };
  // a different layout per group so the page does not repeat one card grid
  const LAYOUT = { records: ["row"], services: ["tile", 3], community: ["col", 3], tech: ["tint", 3], welfare: ["wide", 2] };
  const groups = m.groups
    .map((g, gi) => {
      const [kind, cols] = LAYOUT[g.id] || ["tile", 3];
      return section(`nls-${g.id}`, { kicker: g.kicker, title: g.title, lead: g.lead, tint: gi % 2 === 1, body: cards(kind, g.items.map(card), D, cols) });
    })
    .join("\n");
  const PANEL = { now: " pl-panel--now", dev: "", plan: " pl-panel--next", review: " pl-panel--next" };
  const legend = `<div class="pl-legend">${m.legend
    .map(
      (p) => `<div class="pl-panel${PANEL[p.kind]}"><div class="pl-panel__head">${ic(p.icon)}<h3>${esc(p.title)}</h3></div><p class="pl-p">${esc(p.body)}</p>${chipList(
        p.areas.map((no) => `${no} ${PLATFORM.items[Number(no) - 1].name[L]}`),
        p.kind === "plan" || p.kind === "review"
      )}</div>`
    )
    .join("")}</div>`;
  const scen = m.scenarios;
  const scenarios = scen.items.map((it) => ({ id: it.id, n: it.n, tab: it.tab, mark: it.tab, label: it.label, name: it.name, lead: it.lead, chips: it.chips }));
  const close = { ...m.close, main: [m.close.ctaMain, "petlog/business/"], sub: [m.close.ctaSub, STORE.ios] };
  return wrap(`${hero({ wordmark: "Platform", titleHtml: m.heroTitle, lead: m.heroLead, main: [lang === "ko" ? "18개 서비스 보기 ↓" : "See 18 services ↓", "#nls-records"], sub: [lang === "ko" ? "PETLOG 소개" : "About PETLOG", rel(D, "petlog/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "platform" })}
  <div class="nls__wrap">
    ${section("nls-legend", { kicker: m.legendKicker, title: m.legendTitle, lead: m.legendLead, noteText: NOTICE[L], body: legend })}
    ${groups}
    ${railBlock("nls-scenarios", { kicker: scen.kicker, title: scen.title, lead: scen.lead, items: scenarios })}
    ${splitSection("nls-roles", { kicker: m.roles.kicker, title: m.roles.title, lead: m.roles.lead, body: checks(m.roles.items) })}
    ${section("nls-flow", { kicker: m.flow.kicker, title: m.flow.title, lead: m.flow.lead, tint: true, body: stepList(m.flow.steps) })}
    ${section("nls-privacy", { kicker: m.privacy.kicker, title: m.privacy.title, body: checks(m.privacy.items) })}
    ${section("nls-app", { kicker: m.app.kicker, title: m.app.title, lead: m.app.lead, tint: true, body: `${stepList(m.app.steps)}${storePills(m.app.storeLabel)}` })}
    ${section("nls-faq", { kicker: m.faq.kicker, title: m.faq.title, body: faqList(m.faq.items) })}
    ${menuBlock(lang, D, "platform")}
    ${closeBlock(close, D)}
  </div>`);
}

function businessPage(lang) {
  const m = BUSINESS.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const line = (no) => BUSINESS.lines.find((x) => x.no === no);
  const rail = BUSINESS.groups.map((g, i) => ({ id: g.id, n: pad2(i + 1), tab: g.tab, mark: pad2(g.lines.length), label: g.label, name: g[L], lead: L === "ko" ? g.koLead : g.enLead, chips: g.lines.map((no) => `${no} ${line(no).name[L]}`) }));
  const lineCard = (no) => {
    const x = line(no);
    return {
      n: x.no,
      label: x.label,
      icon: LINE_ICONS[x.no] || "paw",
      name: x.name[L],
      lead: x.lead[L],
      points: [
        [m.labels.payer, x.payer[L]],
        [m.labels.how, x.how[L]],
        [m.labels.cond, x.cond[L]],
      ],
      link: [m.labels.cta, CONTACT_HREF(x.type)],
      anchor: `line-${x.no}`,
    };
  };
  const sp = m.subPanel;
  const subPanel = `<div class="pl-sub">${head(sp.kicker, sp.title, sp.lead)}<div class="pl-legend">
      <div class="pl-panel pl-panel--now"><div class="pl-panel__head">${ic("phone")}<h3>${esc(sp.now[0])}</h3></div><p class="pl-p">${esc(sp.now[1])}</p>${chipList(sp.now[2])}</div>
      <div class="pl-panel pl-panel--next"><div class="pl-panel__head">${ic("sprout")}<h3>${esc(sp.next[0])}</h3></div><p class="pl-p">${esc(sp.next[1])}</p>${chipList(sp.next[2], true)}</div>
    </div></div>`;
  const saasPanel = `<div class="pl-sub">${head(m.saasKicker, m.saasTitle, m.saasLead)}${cards("col", m.saas.map(([t, d], i) => ({ n: pad2(i + 1), name: t, lead: d })), D, 5)}</div>`;
  const LAYOUT = { subscription: ["row"], booking: ["tile", 2], commerce: ["wide", 2], lifestyle: ["col", 3], enterprise: ["row"] };
  const groupSections = BUSINESS.groups
    .map((g, gi) => {
      const [kind, cols] = LAYOUT[g.id] || ["tile", 2];
      let body = cards(kind, g.lines.map(lineCard), D, cols);
      if (g.id === "subscription") body += subPanel;
      if (g.id === "enterprise") body += saasPanel;
      return section(`nls-group-${g.id}`, { kicker: `${pad2(gi + 1)} · ${g.label.toUpperCase()}`, title: g[L], lead: L === "ko" ? g.koLead : g.enLead, tint: gi % 2 === 1, body });
    })
    .join("\n");
  const models = `<ul class="pl-models">${m.structure.map(([k, v], i) => `<li><span>${pad2(i + 1)}</span><b lang="en">${esc(k)}</b><p class="pl-p">${esc(v)}</p></li>`).join("")}</ul>`;
  const hd = m.revenueHead;
  const revenue = `<ul class="pl-table"><li class="pl-table__hd" aria-hidden="true"><span>${esc(hd[0])}</span><span>${esc(hd[1])}</span><span style="justify-self:end">${esc(hd[2])}</span></li>${BUSINESS.lines
    .map((x) => `<li><span class="pl-table__name"><span class="pl-n">${esc(x.no)}</span>${esc(x.name[L])}</span><p class="pl-p">${esc(x.sum[L])}</p><span class="pl-stage">${esc(m.statusLabel[x.status])}</span></li>`)
    .join("")}</ul>`;
  return wrap(`${hero({ wordmark: "Business", titleHtml: m.heroTitle, lead: m.heroLead, main: [lang === "ko" ? "20개 사업 분야 보기 ↓" : "See 20 areas ↓", "#nls-groups"], sub: [m.close.ctaMain, rel(D, "petlog/partnerships/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "business" })}
  <div class="nls__wrap">
    ${section("nls-structure", { kicker: m.structureKicker, title: m.structureTitle, lead: m.structureLead, noteText: NOTICE[L], body: models })}
    ${railBlock("nls-groups", { kicker: m.groupsKicker, title: m.groupsTitle, lead: m.groupsLead, items: rail })}
    ${groupSections}
    ${section("nls-revenue", { kicker: m.revenueKicker, title: m.revenueTitle, lead: m.revenueLead, tint: true, body: revenue })}
    ${splitSection("nls-public", { kicker: m.publicKicker, title: m.publicTitle, lead: m.publicLead, body: checks(m.publicItems) })}
    ${section("nls-market", { kicker: m.marketKicker, title: m.marketTitle, lead: m.marketLead, tint: true, body: checks(m.market) })}
    ${section("nls-diff", { kicker: m.diffKicker, title: m.diffTitle, lead: m.diffLead, body: cards("tint", m.diff.map(([t, d, k], i) => ({ n: pad2(i + 1), icon: k, name: t, lead: d })), D, 4) })}
    ${section("nls-priority", { kicker: m.gtmKicker, title: m.gtmTitle, lead: m.gtmLead, tint: true, body: stepList(m.gtm.map(([t, d], i) => [pad2(i + 1), t, d])) })}
    ${splitSection("nls-roadmap", { kicker: m.roadmapKicker, title: m.roadmapTitle, lead: m.roadmapNote, body: timeline(m.roadmap) })}
    ${section("nls-trust", { kicker: m.trustKicker, title: m.trustTitle, tint: true, body: checks(m.trust) })}
    ${menuBlock(lang, D, "business")}
    ${closeBlock({ ...m.close, main: [m.close.ctaMain, "petlog/partnerships/"], sub: [m.close.ctaSub, "petlog/contact/"] }, D)}
  </div>`);
}

function partnershipsPage(lang) {
  const m = PARTNERS.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const card = (no) => {
    const p = PARTNERS.items.find((x) => x.no === no);
    return { n: p.no, icon: PARTNER_ICONS[p.no] || iconFor(p.name.en), name: p.name[L], lead: p.value[L], points: [[m.labels.scope, p.scope[L]], [m.labels.how, p.how[L]], [m.labels.terms, p.terms[L]]], link: [m.labels.cta, CONTACT_HREF(p.type)], anchor: `partner-${p.no}` };
  };
  const LAYOUT = { care: ["tile", 3], brand: ["row"], public: ["tint", 2] };
  const groups = m.groups
    .map((g, gi) => {
      const [kind, cols] = LAYOUT[g.id] || ["tile", 3];
      return section(`nls-p-${g.id}`, { kicker: g.kicker, title: g.title, lead: g.lead, tint: gi % 2 === 0, body: cards(kind, g.items.map(card), D, cols) });
    })
    .join("\n");
  const offer = m.offer.map((o) => ({ ...o, icon: iconFor(PARTNERS.meta.en.offer.find((e) => e.n === o.n).name) }));
  const [lw, lr, lp] = m.scenarioLabels;
  const scenarios = m.scenarios.map((x) => ({ n: x.n, icon: x.icon, name: x.name, lead: x.lead, points: [[lw, x.who], [lr, x.role], [lp, x.pre]] }));
  const poc = m.poc.map(([t, d], i) => [`STEP ${pad2(i + 1)}`, t, d]);
  return wrap(`${hero({ wordmark: "Partnerships", titleHtml: m.heroTitle, lead: m.heroLead, main: [lang === "ko" ? "14개 협력 분야 ↓" : "14 partner types ↓", "#nls-p-care"], sub: [m.labels.cta, rel(D, "petlog/contact/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "partnerships" })}
  <div class="nls__wrap">
    ${section("nls-offer", { kicker: m.offerKicker, title: m.offerTitle, lead: m.offerLead, body: cards("tint", offer, D, 4) })}
    ${groups}
    ${section("nls-scenarios", { kicker: m.scenariosKicker, title: m.scenariosTitle, lead: m.scenariosLead, body: cards("row", scenarios, D) })}
    ${splitSection("nls-poc", { kicker: m.pocKicker, title: m.pocTitle, lead: m.pocLead, tint: true, body: timeline(poc) })}
    ${section("nls-data", { kicker: m.dataKicker, title: m.dataTitle, lead: m.dataLead, body: checks(m.data) })}
    ${section("nls-joint", { kicker: m.jointKicker, title: m.jointTitle, tint: true, body: cards("col", m.joint, D, 3) })}
    ${splitSection("nls-principles", { kicker: m.principlesKicker, title: m.principlesTitle, body: checks(m.principles) })}
    ${section("nls-process", { kicker: m.processKicker, title: m.processTitle, noteText: m.processNote, tint: true, body: stepList(m.steps.map(([t, d], i) => [pad2(i + 1), t, d])) })}
    ${menuBlock(lang, D, "partnerships")}
    ${closeBlock({ ...m.close, main: [m.close.ctaMain, "petlog/contact/"], sub: [m.close.ctaSub, "partnerships/"] }, D)}
  </div>`);
}

function contactPage(lang) {
  const c = CONTACT[bl(lang)];
  const D = 2;
  const purposes = c.purposes.map((p, i) => ({ n: pad2(i + 1), name: p.name, body: p.body, href: p.href, icon: p.icon }));
  const items = c.types.map(([key, name, body], i) => ({ n: pad2(i + 1), name, body, href: `petlog/contact/?type=${key}#inquiry`, icon: TYPE_ICONS[key] || "mail" }));
  const direct = c.direct.map((d) => ({ name: d.name, body: d.body, href: d.href === "ios" ? STORE.ios : d.href === "android" ? STORE.android : d.href }));
  const form = inquiryFormHtml(lang, D, {
    category: "PETLOG",
    interest: "PETLOG",
    copy: { label: "PETLOG", title: c.formTitle, subject: c.subject, types: c.types.map(([k, n]) => [k, n]), type: c.typeLabel, message: c.messageLabel, messagePh: c.messagePh, submit: lang === "ko" ? "문의 보내기" : "Send inquiry" },
  });
  return wrap(`${hero({ wordmark: "Contact", titleHtml: c.heroTitle, lead: c.heroLead, main: [lang === "ko" ? "문의하기 ↓" : "Send an inquiry ↓", "#inquiry"], sub: [lang === "ko" ? "PETLOG 소개" : "About PETLOG", rel(D, "petlog/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "contact" })}
  <div class="nls__wrap">
    ${section("nls-purpose", { kicker: c.purposeKicker, title: c.purposeTitle, lead: c.purposeLead, body: tiles("pl-types", purposes, D) })}
    ${section("nls-types", { kicker: c.kicker, title: c.listTitle, lead: c.listLead, tint: true, body: tiles("pl-types", items, D) })}
    ${section("nls-direct", { kicker: c.directKicker, title: c.directTitle, body: tiles("pl-fam", direct, D) })}
    ${section("nls-guide", { kicker: c.guideKicker, title: c.guideTitle, tint: true, body: checks(c.guide) })}
  </div>
  <div class="bp-page">${form}</div>
  <div class="nls__wrap">
    ${menuBlock(lang, D, "contact")}
  </div>`);
}

const PAGES = [
  { slug: "petlog", render: overviewPage, seo: (l) => OVERVIEW[bl(l)] },
  { slug: "petlog/platform", render: platformPage, seo: (l) => PLATFORM.meta[bl(l)] },
  { slug: "petlog/business", render: businessPage, seo: (l) => BUSINESS.meta[bl(l)] },
  { slug: "petlog/partnerships", render: partnershipsPage, seo: (l) => PARTNERS.meta[bl(l)] },
  { slug: "petlog/contact", render: contactPage, seo: (l) => CONTACT[bl(l)], contact: true },
];
export const PETLOG_SITE_PATHS = PAGES.map((p) => p.slug);

function jsonLd(page, lang, seo) {
  const url = `${SITE_ORIGIN}/${lang}/${page.slug}/`;
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${lang}/` },
    { "@type": "ListItem", position: 2, name: "PETLOG", item: `${SITE_ORIGIN}/${lang}/petlog/` },
  ];
  if (page.slug !== "petlog") crumbs.push({ "@type": "ListItem", position: 3, name: page.slug.split("/")[1].replace(/^./, (c) => c.toUpperCase()), item: url });
  const main =
    page.slug === "petlog"
      ? {
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          name: "PETLOG",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "iOS, Android",
          url,
          description: seo.desc,
          publisher: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN },
          sameAs: [STORE.ios, STORE.android],
        }
      : { "@context": "https://schema.org", "@type": page.contact ? "ContactPage" : "WebPage", name: seo.title, description: seo.desc, url, inLanguage: lang };
  return `    <script type="application/ld+json">${JSON.stringify(main)}</script>
    <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs })}</script>`;
}

/** Root /petlog/… → preferred-language page (lang-nav.js does not know /petlog/, so it is not loaded here). */
function writeRootStub(slug) {
  const dir = path.join(ROOT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="refresh" content="0;url=/ko/${slug}/" />
<script>
(function(){
  var LANGS=["ko","en","ja","es","pt-br","fr","de","hi","id"];
  var pref="ko";
  try{var s=localStorage.getItem("newon-lang-dir");if(s&&LANGS.indexOf(s)!==-1)pref=s;}catch(e){}
  location.replace("/"+pref+"/${slug}/"+(location.search||"")+(location.hash||""));
})();
</script>
<title>Redirect</title>
</head>
<body><p><a href="/ko/${slug}/">Continue</a></p></body>
</html>`
  );
}

export function renderPetlogSite() {
  const en = loadJson("en.json");
  const flatEn = flatten(en);
  let n = 0;
  for (const lang of LANGS) {
    const flat = flatten(lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en));
    for (const page of PAGES) {
      const depth = page.slug.split("/").length;
      const seo = page.seo(lang.dir);
      const header = renderGlobalHeader(flat, flatEn, { activeNav: "petlog", base: "../".repeat(depth), idSuffix: "hub" });
      const footer = renderStudioFooter(flat, flatEn, { base: "../".repeat(depth) });
      let main = page.render(lang.dir);
      if (lang.dir !== "ko" && lang.dir !== "en") main = main.replace('<section id="lifestage-detail"', '<section lang="en" id="lifestage-detail"');
      let html = applyTemplate(SHELL, flat, flatEn, {
        HTML_LANG: lang.htmlLang,
        LANG_DIR: lang.dir,
        FONT_LINKS: fontLinksHtml(lang.dir),
        TITLE: esc(seo.title),
        META_DESCRIPTION: esc(clampSeoDescription(seo.desc, 160)),
        CANONICAL: `${SITE_ORIGIN}/${lang.dir}/${page.slug}/`,
        OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
        HREFLANG_BLOCK: `${hreflangBlock(page.slug)}\n${jsonLd(page, lang.dir, seo)}`,
        SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
        CHROME_HEADER: header,
        MAIN_CONTENT: main,
        CHROME_FOOTER: footer,
        EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=20261019rest1" />
    <link rel="stylesheet" href="/flagship-subnav.css?v=20261019fsn3" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=${NLS_VER}" />${page.contact ? `\n    <link rel="stylesheet" href="/business-pillar.css?v=20260923pad1" />` : ""}
    ${PETLOG_CSS}`,
        EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260924play2"></script>
    <script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
      });
      const out = path.join(ROOT, lang.dir, page.slug, "index.html");
      ensureDir(out);
      fs.writeFileSync(out, html);
      n++;
    }
  }
  for (const page of PAGES) writeRootStub(page.slug);
  return n;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = renderPetlogSite();
  console.log(`render-petlog-site: wrote ${n} pages + ${PAGES.length} root redirects`);
}
