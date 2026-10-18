#!/usr/bin/env node
/**
 * PETLOG business website — /{lang}/petlog/{,platform/,business/,partnerships/,contact/} for all locales.
 *
 * Design: the existing LivOn Life Stage page shell (#lifestage-detail.nls, home-lifestage*.css/js) — shared dark film
 * hero (wordmark "PETLOG" on every page, h1 = the page topic) and the shared flagship sub-menu under it. Each sub-page
 * shows only its own topic, with varied PETLOG-scoped layouts (editorial statement, day timeline, split text/visual,
 * checklist, sticky-index groups, ledger rows, tables, stepper, FAQ / partner accordions). PETLOG green is an accent only.
 * The Contact form is the shared Newon inquiry form (render-bsp.mjs → business/inquiry.js → FormSubmit).
 * No app feature (records, booking, orders, payment, sign-in, seller tools, posting) is built on the web.
 * Copy: scripts/petlog-site-content.mjs (ko + en; other locales show the English body, like the rest of the site).
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
import { STATUS, PETLOG_FILM, STORE, PETLOG_MENU, OVERVIEW, PLATFORM, BUSINESS, PARTNERS, CONTACT } from "./petlog-site-content.mjs";
import { renderFlagshipSubnav, FLAGSHIP_SUBNAV_CSS } from "./flagship-subnav.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20260924livon1";
const esc = escapeHtml;
const bl = (lang) => (lang === "ko" ? "ko" : "en");
const nl = (s) => esc(s || "").replace(/\n/g, "<br>");
const pad2 = (n) => String(n).padStart(2, "0");
const rel = (depth, p) => (/^(https?:|mailto:|#|\/)/.test(p) ? p : "../".repeat(depth) + p);

/* PETLOG green (#278A53 brand; darker #1E6B41 for text contrast on white) — used only as an accent:
 * kicker labels, status tags, numbers and small rules. Everything else follows the Life Stage black/white tokens. */
const PETLOG_CSS = `<style>
  #lifestage-detail.nls--petlog { --pl-green: #278a53; --pl-green-ink: #1e6b41; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog { --pl-green: #6fcf97; --pl-green-ink: #6fcf97; }
  #lifestage-detail.nls--petlog .nls-kicker { color: var(--pl-green-ink); }
  #lifestage-detail.nls--petlog .nls-status { width: fit-content; max-width: 100%; margin: 0; border-color: var(--pl-green); color: var(--pl-green-ink); white-space: nowrap; }
  #lifestage-detail.nls--petlog .nls-status[data-status="app"] { background: var(--pl-green); border-color: var(--pl-green); color: #fff; }
  #lifestage-detail.nls--petlog .nls-status[data-status="dir"],
  #lifestage-detail.nls--petlog .nls-status[data-status="legal"] { border-style: dashed; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-status[data-status="app"] { background: #1e6b41 !important; border-color: #1e6b41; color: #fff; }
  #lifestage-detail.nls--petlog .nls-film__fallback { background: #050505; }
  #lifestage-detail.nls--petlog .nls-link { display: inline-block; margin-top: 0.9rem; font-weight: 600; text-decoration: underline; text-underline-offset: 0.2em; color: inherit; }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail--petlog { grid-template-columns: repeat(var(--petlog-rail-n, 7), minmax(0, 1fr)); }
  }
  html[data-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on,
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on { background: #fff !important; border-color: #fff; color: rgba(17, 17, 17, 0.6); }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .nls-journey-sec .nls-rail__btn.is-on > * { color: #111 !important; background: transparent !important; }
  #lifestage-detail.nls--petlog .nls-pipe__item .nls-pipe__n, #lifestage-detail.nls--petlog .nls-pipe__item.is-on .nls-pipe__n { color: var(--pl-green-ink); }
  @media (min-width: 860px) { #lifestage-detail.nls--petlog .nls-pipe { grid-template-columns: repeat(var(--pl-pipe, 3), minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .nls-lane__n { color: var(--pl-green-ink); }

  /* --- editorial statement --- */
  #lifestage-detail.nls--petlog .pl-statement__big { margin: 0.6rem 0 0; max-width: 22em; font-size: clamp(1.75rem, 4.4vw, 3.3rem); font-weight: 700; letter-spacing: -0.045em; line-height: 1.22; }
  #lifestage-detail.nls--petlog .pl-statement__body { display: grid; gap: 1.1rem 2.4rem; margin-top: clamp(1.6rem, 3vw, 2.4rem); padding-top: 1.4rem; border-top: 2px solid var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-statement__body p { margin: 0; font-size: 1rem; line-height: 1.75; color: var(--nls-muted); }
  @media (min-width: 900px) { #lifestage-detail.nls--petlog .pl-statement__body { grid-template-columns: repeat(var(--pl-cols, 3), minmax(0, 1fr)); } }

  /* --- horizontal day timeline --- */
  #lifestage-detail.nls--petlog .pl-timeline { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; }
  #lifestage-detail.nls--petlog .pl-timeline li { position: relative; padding: 0 0 1.5rem 1.6rem; border-left: 1px solid var(--nls-line-strong); }
  #lifestage-detail.nls--petlog .pl-timeline li::before { content: ""; position: absolute; left: -5px; top: 0.3rem; width: 9px; height: 9px; border-radius: 50%; background: var(--nls-paper); border: 2px solid var(--pl-green); }
  #lifestage-detail.nls--petlog .pl-timeline time { display: block; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; color: var(--pl-green-ink); font-variant-numeric: tabular-nums; }
  #lifestage-detail.nls--petlog .pl-timeline h3 { margin: 0.3rem 0 0.35rem; font-size: 1.08rem; letter-spacing: -0.02em; }
  #lifestage-detail.nls--petlog .pl-timeline p { margin: 0; font-size: 0.92rem; line-height: 1.6; color: var(--nls-muted); }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .pl-timeline { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    #lifestage-detail.nls--petlog .pl-timeline li { padding: 1.5rem 1.2rem 0 0; border-left: 0; border-top: 1px solid var(--nls-line-strong); }
    #lifestage-detail.nls--petlog .pl-timeline li::before { left: 0; top: -5px; }
  }

  /* --- split text / visual (app tabs, business diagram, contact card) --- */
  #lifestage-detail.nls--petlog .pl-split { display: grid; gap: clamp(1.8rem, 4vw, 3.5rem); align-items: start; }
  @media (min-width: 960px) { #lifestage-detail.nls--petlog .pl-split { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
  #lifestage-detail.nls--petlog .pl-tablist { list-style: none; margin: 1.4rem 0 0; padding: 0; border-top: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-tablist li { display: grid; grid-template-columns: 4.6rem minmax(0, 1fr); gap: 0.4rem 1rem; padding: 1rem 0; border-bottom: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-tablist strong { font-size: 1.05rem; }
  #lifestage-detail.nls--petlog .pl-tablist strong small { display: block; margin-top: 0.15rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--nls-faint); }
  #lifestage-detail.nls--petlog .pl-tablist p { margin: 0 0 0.5rem; font-size: 0.94rem; line-height: 1.6; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-phone { margin: 0 auto; width: min(100%, 300px); aspect-ratio: 9 / 17; border: 2px solid var(--nls-ink); border-radius: 34px; padding: 14px; display: flex; flex-direction: column; background: var(--nls-paper); }
  @media (max-width: 959px) { #lifestage-detail.nls--petlog .pl-phone { width: min(100%, 240px); } }
  #lifestage-detail.nls--petlog .pl-phone__screen { flex: 1; display: flex; flex-direction: column; gap: 10px; padding: 18px 6px 10px; }
  #lifestage-detail.nls--petlog .pl-phone__brand { margin: 0 0 6px; font-size: 0.95rem; font-weight: 800; letter-spacing: -0.02em; }
  #lifestage-detail.nls--petlog .pl-phone__card { border: 1px solid var(--nls-line-strong); border-radius: 10px; padding: 10px 12px; font-size: 0.78rem; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-phone__card b { display: block; margin-bottom: 4px; font-size: 0.82rem; color: var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-phone__bar { display: grid; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--nls-line-strong); padding-top: 10px; font-size: 0.72rem; text-align: center; color: var(--nls-faint); }
  #lifestage-detail.nls--petlog .pl-phone__bar span.is-on { color: var(--pl-green-ink); font-weight: 700; }
  #lifestage-detail.nls--petlog .pl-phone__bar span::before { content: ""; display: block; width: 6px; height: 6px; margin: 0 auto 5px; border-radius: 50%; background: currentColor; opacity: 0.55; }

  /* --- principles checklist --- */
  #lifestage-detail.nls--petlog .pl-checks { list-style: none; margin: 0; padding: 0; display: grid; gap: 0 2.6rem; }
  @media (min-width: 900px) { #lifestage-detail.nls--petlog .pl-checks { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-checks li { display: grid; grid-template-columns: 1.6rem minmax(0, 1fr); gap: 0.9rem; padding: 1.15rem 0; border-top: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-checks li::before { content: "✓"; display: grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; border: 1.5px solid var(--pl-green); color: var(--pl-green-ink); font-size: 0.8rem; font-weight: 800; }
  #lifestage-detail.nls--petlog .pl-checks strong { display: block; font-size: 1.02rem; letter-spacing: -0.015em; }
  #lifestage-detail.nls--petlog .pl-checks p { margin: 0.35rem 0 0; font-size: 0.93rem; line-height: 1.6; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-checks--plain li { align-items: center; }
  #lifestage-detail.nls--petlog .pl-checks--plain span { font-size: 0.98rem; line-height: 1.55; }

  /* --- bottom strip to the other pages --- */
  #lifestage-detail.nls--petlog .pl-strip { padding: clamp(1.8rem, 3.5vw, 2.6rem) 0 0; border-top: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-strip ul { list-style: none; margin: 0.8rem 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
  @media (min-width: 900px) { #lifestage-detail.nls--petlog .pl-strip ul { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-strip a { display: block; height: 100%; padding: 0.95rem 1rem; border: 1px solid var(--nls-line-strong); color: inherit; text-decoration: none; transition: border-color 0.2s ease; }
  #lifestage-detail.nls--petlog .pl-strip a:hover, #lifestage-detail.nls--petlog .pl-strip a:focus-visible { border-color: var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-strip em { display: block; font-style: normal; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; color: var(--pl-green-ink); }
  #lifestage-detail.nls--petlog .pl-strip strong { display: block; margin-top: 0.25rem; font-size: 1rem; }
  #lifestage-detail.nls--petlog .pl-strip span { display: block; margin-top: 0.2rem; font-size: 0.82rem; line-height: 1.45; color: var(--nls-faint); }

  /* --- status legend --- */
  #lifestage-detail.nls--petlog .pl-legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem 1.4rem; }
  @media (min-width: 900px) { #lifestage-detail.nls--petlog .pl-legend { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-legend li { display: grid; gap: 0.55rem; align-content: start; padding-top: 0.9rem; border-top: 1px solid var(--nls-line); font-size: 0.9rem; line-height: 1.55; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-chip { display: inline-block; width: fit-content; padding: 0.28rem 0.62rem; border: 1px solid var(--pl-green); font-size: 0.72rem; letter-spacing: 0.06em; color: var(--pl-green-ink); white-space: nowrap; }
  #lifestage-detail.nls--petlog .pl-chip[data-status="app"] { background: var(--pl-green); color: #fff; }
  #lifestage-detail.nls--petlog .pl-chip[data-status="dir"], #lifestage-detail.nls--petlog .pl-chip[data-status="legal"] { border-style: dashed; }
  html[data-newon-shell-theme="dark"] #lifestage-detail.nls--petlog .pl-chip[data-status="app"] { background: #1e6b41; border-color: #1e6b41; }

  /* --- tables (stack into labelled rows on phones) --- */
  #lifestage-detail.nls--petlog .pl-table { width: 100%; border-collapse: collapse; font-size: 0.94rem; line-height: 1.55; }
  #lifestage-detail.nls--petlog .pl-table th { padding: 0.75rem 0.9rem 0.75rem 0; text-align: left; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--nls-faint); border-bottom: 2px solid var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-table td { padding: 1rem 0.9rem 1rem 0; vertical-align: top; border-bottom: 1px solid var(--nls-line); color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-table td:first-child { color: var(--nls-ink); font-weight: 700; }
  #lifestage-detail.nls--petlog .pl-table td.pl-num { font-variant-numeric: tabular-nums; font-weight: 700; color: var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-table a { color: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 0.2em; white-space: nowrap; }
  @media (max-width: 760px) {
    #lifestage-detail.nls--petlog .pl-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    #lifestage-detail.nls--petlog .pl-table, #lifestage-detail.nls--petlog .pl-table tbody, #lifestage-detail.nls--petlog .pl-table tr, #lifestage-detail.nls--petlog .pl-table td { display: block; width: 100%; }
    #lifestage-detail.nls--petlog .pl-table tr { padding: 0.9rem 0; border-bottom: 1px solid var(--nls-line); }
    #lifestage-detail.nls--petlog .pl-table td { padding: 0.2rem 0; border: 0; }
    #lifestage-detail.nls--petlog .pl-table td[data-label]:not(:first-child)::before { content: attr(data-label); display: block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--nls-faint); }
    #lifestage-detail.nls--petlog .pl-table td:first-child { font-size: 1.02rem; }
    #lifestage-detail.nls--petlog .pl-table td:empty { display: none; }
  }

  /* --- grouped bands with a sticky index (platform) --- */
  #lifestage-detail.nls--petlog .pl-group { display: grid; gap: 1.2rem 3rem; padding: clamp(1.6rem, 3vw, 2.4rem) 0; border-top: 1px solid var(--nls-line-strong); }
  @media (min-width: 960px) {
    #lifestage-detail.nls--petlog .pl-group { grid-template-columns: minmax(0, 0.36fr) minmax(0, 1fr); }
    #lifestage-detail.nls--petlog .pl-group__aside { position: sticky; top: calc(var(--gnav-h, 64px) + 4.5rem); align-self: start; }
  }
  #lifestage-detail.nls--petlog .pl-group__en { margin: 0; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.12em; color: var(--pl-green-ink); }
  #lifestage-detail.nls--petlog .pl-group__aside h3 { margin: 0.35rem 0 0.25rem; font-size: clamp(1.5rem, 2.6vw, 2rem); letter-spacing: -0.04em; }
  #lifestage-detail.nls--petlog .pl-group__role { margin: 0; font-size: 0.86rem; font-weight: 600; color: var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-group__aside .pl-group__lead { margin: 0.7rem 0 0; font-size: 0.93rem; line-height: 1.6; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-group__count { margin: 0.9rem 0 0; font-size: 0.8rem; color: var(--nls-faint); }
  #lifestage-detail.nls--petlog .pl-rows { list-style: none; margin: 0; padding: 0; }
  #lifestage-detail.nls--petlog .pl-row { display: grid; grid-template-columns: 2.4rem minmax(0, 1fr); gap: 0.4rem 1rem; padding: 1.25rem 0; border-top: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-row:first-child { border-top: 0; padding-top: 0.2rem; }
  #lifestage-detail.nls--petlog .pl-row__n { font-size: 0.86rem; font-weight: 700; color: var(--pl-green-ink); font-variant-numeric: tabular-nums; padding-top: 0.2rem; }
  #lifestage-detail.nls--petlog .pl-row__top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1rem; }
  #lifestage-detail.nls--petlog .pl-row__label { margin: 0; font-size: 0.72rem; font-weight: 650; letter-spacing: 0.1em; text-transform: uppercase; color: var(--nls-faint); }
  #lifestage-detail.nls--petlog .pl-row h4 { margin: 0.3rem 0 0.4rem; font-size: 1.15rem; letter-spacing: -0.025em; }
  #lifestage-detail.nls--petlog .pl-row__lead { margin: 0; max-width: 44rem; font-size: 0.95rem; line-height: 1.65; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-keys { display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem 0.4rem; margin: 0.75rem 0 0; padding: 0; list-style: none; font-size: 0.8rem; }
  #lifestage-detail.nls--petlog .pl-keys li { padding: 0.2rem 0.5rem; border: 1px solid var(--nls-line); color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-keys li.pl-keys__k { padding-left: 0; border: 0; font-weight: 700; color: var(--nls-ink); }

  /* --- business direction diagram --- */
  #lifestage-detail.nls--petlog .pl-diagram { display: grid; gap: 0.9rem; align-items: stretch; }
  @media (min-width: 640px) { #lifestage-detail.nls--petlog .pl-diagram { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr) minmax(0, 1fr); align-items: center; } }
  #lifestage-detail.nls--petlog .pl-diagram__side { padding: 1.1rem; border: 1px solid var(--nls-line-strong); }
  #lifestage-detail.nls--petlog .pl-diagram__side strong { display: block; margin-bottom: 0.6rem; font-size: 0.98rem; }
  #lifestage-detail.nls--petlog .pl-diagram__side ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.35rem; font-size: 0.86rem; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-diagram__hub { padding: 1.2rem 1rem; border: 2px solid var(--pl-green); border-radius: 999px; text-align: center; }
  @media (min-width: 640px) { #lifestage-detail.nls--petlog .pl-diagram__hub { aspect-ratio: 1; display: grid; align-content: center; border-radius: 50%; } }
  #lifestage-detail.nls--petlog .pl-diagram__hub b { display: block; font-size: 1.15rem; letter-spacing: -0.02em; }
  #lifestage-detail.nls--petlog .pl-diagram__hub span { display: block; margin-top: 0.45rem; font-size: 0.7rem; line-height: 1.5; letter-spacing: 0.04em; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-dirbody p { margin: 0 0 0.9rem; font-size: 1rem; line-height: 1.75; color: var(--nls-muted); }

  /* --- business ledger --- */
  #lifestage-detail.nls--petlog .pl-ledger__group { margin-top: clamp(1.8rem, 3.5vw, 2.6rem); }
  #lifestage-detail.nls--petlog .pl-ledger__head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.3rem 1rem; padding-bottom: 0.8rem; border-bottom: 2px solid var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-ledger__head span { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; color: var(--pl-green-ink); }
  #lifestage-detail.nls--petlog .pl-ledger__head h3 { margin: 0; font-size: clamp(1.25rem, 2.2vw, 1.55rem); letter-spacing: -0.03em; }
  #lifestage-detail.nls--petlog .pl-ledger__head p { margin: 0; flex-basis: 100%; font-size: 0.92rem; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-line { display: grid; grid-template-columns: 2.6rem minmax(0, 1fr); gap: 0.5rem 1rem; padding: 1.15rem 0; border-bottom: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-line__n { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; }
  #lifestage-detail.nls--petlog .pl-line__label { margin: 0; font-size: 0.7rem; font-weight: 650; letter-spacing: 0.1em; text-transform: uppercase; color: var(--nls-faint); }
  #lifestage-detail.nls--petlog .pl-line h4 { margin: 0.25rem 0 0.35rem; font-size: 1.1rem; letter-spacing: -0.02em; }
  #lifestage-detail.nls--petlog .pl-line__lead { margin: 0; font-size: 0.93rem; line-height: 1.62; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-line__meta { grid-column: 2; display: grid; gap: 0.5rem; margin: 0.3rem 0 0; font-size: 0.85rem; }
  #lifestage-detail.nls--petlog .pl-line__meta div { display: grid; gap: 0.1rem; }
  #lifestage-detail.nls--petlog .pl-line__meta dt { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--nls-faint); }
  #lifestage-detail.nls--petlog .pl-line__meta dd { margin: 0; color: var(--nls-ink); }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .pl-line { grid-template-columns: 3.2rem minmax(0, 1fr) minmax(0, 0.62fr) 8.6rem; gap: 1.6rem; align-items: start; }
    #lifestage-detail.nls--petlog .pl-line__meta { grid-column: auto; margin: 0; }
    #lifestage-detail.nls--petlog .pl-line .nls-status { justify-self: end; }
  }
  @media (max-width: 899px) { #lifestage-detail.nls--petlog .pl-line .nls-status { grid-column: 2; } }

  /* --- revenue editorial --- */
  #lifestage-detail.nls--petlog .pl-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.6rem 0 0; padding: 0; list-style: none; }
  #lifestage-detail.nls--petlog .pl-tags li { padding: 0.4rem 0.75rem; border: 1px dashed var(--pl-green); font-size: 0.82rem; font-weight: 600; color: var(--pl-green-ink); }

  /* --- process stepper --- */
  #lifestage-detail.nls--petlog .pl-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; counter-reset: pl-step; }
  @media (min-width: 700px) { #lifestage-detail.nls--petlog .pl-steps { grid-template-columns: repeat(var(--pl-steps, 3), minmax(0, 1fr)); gap: 0 1.4rem; } }
  #lifestage-detail.nls--petlog .pl-steps li { position: relative; padding: 1.2rem 0 1.4rem; border-top: 1px solid var(--nls-line-strong); counter-increment: pl-step; }
  #lifestage-detail.nls--petlog .pl-steps li::before { content: counter(pl-step, decimal-leading-zero); display: inline-grid; place-items: center; width: 2.3rem; height: 2.3rem; border-radius: 50%; border: 1.5px solid var(--nls-ink); font-size: 0.8rem; font-weight: 700; font-variant-numeric: tabular-nums; }
  #lifestage-detail.nls--petlog .pl-steps li.is-first { border-top: 2px solid var(--pl-green); }
  #lifestage-detail.nls--petlog .pl-steps li.is-first::before { background: var(--pl-green); border-color: var(--pl-green); color: #fff; }
  #lifestage-detail.nls--petlog .pl-steps h3 { margin: 0.8rem 0 0.35rem; font-size: 1.05rem; letter-spacing: -0.02em; }
  #lifestage-detail.nls--petlog .pl-steps p { margin: 0; font-size: 0.92rem; line-height: 1.6; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-steps .pl-chip { position: absolute; top: 1.6rem; right: 0; }

  /* --- FAQ + partner accordions --- */
  #lifestage-detail.nls--petlog .pl-faq { border-top: 2px solid var(--nls-ink); }
  #lifestage-detail.nls--petlog .pl-faq details, #lifestage-detail.nls--petlog .pl-acc__item { border-bottom: 1px solid var(--nls-line); }
  #lifestage-detail.nls--petlog .pl-faq summary, #lifestage-detail.nls--petlog .pl-acc__item summary { list-style: none; cursor: pointer; position: relative; padding: 1.15rem 2.4rem 1.15rem 0; }
  #lifestage-detail.nls--petlog .pl-faq summary::-webkit-details-marker, #lifestage-detail.nls--petlog .pl-acc__item summary::-webkit-details-marker { display: none; }
  #lifestage-detail.nls--petlog .pl-faq summary::after, #lifestage-detail.nls--petlog .pl-acc__item summary::after { content: "+"; position: absolute; right: 0.2rem; top: 50%; transform: translateY(-50%); font-size: 1.4rem; font-weight: 300; color: var(--pl-green-ink); }
  #lifestage-detail.nls--petlog .pl-faq details[open] summary::after, #lifestage-detail.nls--petlog .pl-acc__item[open] summary::after { content: "−"; }
  #lifestage-detail.nls--petlog .pl-faq summary { font-size: 1.04rem; font-weight: 650; letter-spacing: -0.015em; }
  #lifestage-detail.nls--petlog .pl-faq details p { margin: 0 0 1.3rem; max-width: 46rem; font-size: 0.95rem; line-height: 1.7; color: var(--nls-muted); }
  #lifestage-detail.nls--petlog .pl-acc__title { margin: clamp(1.8rem, 3vw, 2.4rem) 0 0; padding-bottom: 0.7rem; border-bottom: 2px solid var(--nls-ink); font-size: 1.1rem; letter-spacing: -0.02em; }
  #lifestage-detail.nls--petlog .pl-acc__item summary { display: grid; grid-template-columns: 2.4rem minmax(0, 1fr); gap: 0.2rem 1rem; align-items: baseline; }
  #lifestage-detail.nls--petlog .pl-acc__n { font-size: 0.86rem; font-weight: 700; color: var(--pl-green-ink); font-variant-numeric: tabular-nums; }
  #lifestage-detail.nls--petlog .pl-acc__name { font-size: 1.08rem; font-weight: 700; letter-spacing: -0.02em; }
  #lifestage-detail.nls--petlog .pl-acc__value { grid-column: 2; font-size: 0.92rem; line-height: 1.55; color: var(--nls-muted); }
  @media (min-width: 900px) {
    #lifestage-detail.nls--petlog .pl-acc__item summary { grid-template-columns: 2.6rem minmax(0, 0.42fr) minmax(0, 1fr) auto; }
    #lifestage-detail.nls--petlog .pl-acc__value { grid-column: auto; }
  }
  #lifestage-detail.nls--petlog .pl-acc__tag { display: none; font-size: 0.72rem; color: var(--nls-faint); white-space: nowrap; }
  @media (min-width: 900px) { #lifestage-detail.nls--petlog .pl-acc__tag { display: block; } }
  #lifestage-detail.nls--petlog .pl-acc__body { padding: 0 0 1.4rem 3.4rem; }
  @media (max-width: 899px) { #lifestage-detail.nls--petlog .pl-acc__body { padding-left: 3.4rem; } }
  #lifestage-detail.nls--petlog .pl-acc__body dl { display: grid; gap: 0.7rem 2rem; margin: 0; }
  @media (min-width: 900px) { #lifestage-detail.nls--petlog .pl-acc__body dl { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  #lifestage-detail.nls--petlog .pl-acc__body dt { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--nls-faint); }
  #lifestage-detail.nls--petlog .pl-acc__body dd { margin: 0.2rem 0 0; font-size: 0.92rem; line-height: 1.55; }
  #lifestage-detail.nls--petlog .pl-acc__body .pl-chip { margin-top: 1rem; }

  /* --- contact mail card --- */
  #lifestage-detail.nls--petlog .pl-mail { padding: clamp(1.4rem, 3vw, 2rem); border: 2px solid var(--nls-ink); display: grid; gap: 1.1rem; }
  #lifestage-detail.nls--petlog .pl-mail dt { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--nls-faint); }
  #lifestage-detail.nls--petlog .pl-mail dd { margin: 0.25rem 0 0; }
  #lifestage-detail.nls--petlog .pl-mail__addr { font-size: clamp(1.3rem, 3vw, 1.8rem); font-weight: 700; letter-spacing: -0.03em; color: inherit; text-decoration: none; border-bottom: 2px solid var(--pl-green); overflow-wrap: anywhere; }
  #lifestage-detail.nls--petlog .pl-mail a:not(.pl-mail__addr) { color: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 0.2em; }
  #lifestage-detail.nls--petlog .pl-body { margin: 1rem 0 0; max-width: 34rem; font-size: 1rem; line-height: 1.75; color: var(--nls-muted); }
</style>`;

/* ---------------------------------------------------------------- shared blocks (Life Stage markup) */
function head(kicker, title, lead) {
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${esc(kicker)}</p>` : ""}
    <h2 class="nls-title">${nl(title)}</h2>
    ${lead ? `<p class="nls-lead">${esc(lead)}</p>` : ""}
  </header>`;
}
const chips = (items) => (items && items.length ? `<ul class="nls-chips">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "");
const status = (lang, s) => (s ? `<p class="nls-status" data-status="${esc(s)}">${esc(STATUS[bl(lang)][s])}</p>` : "");
const chip = (lang, s) => `<span class="pl-chip" data-status="${esc(s)}">${esc(STATUS[bl(lang)][s])}</span>`;
const note = (t) => (t ? `<p class="nls-note">${esc(t)}</p>` : "");
const ext = (h) => /^https?:/.test(h);
const extAttr = (h) => (ext(h) ? ' target="_blank" rel="noopener noreferrer"' : "");

/** Shared dark film hero. The wordmark is always "PETLOG"; the h1 states the page topic. */
function hero({ titleHtml, lead, main, sub }) {
  return `<div class="nls-film" data-nls-film data-hs-section>
    <div class="nls-film__stage">
      <div class="nls-film__fallback" aria-hidden="true"></div>
      <video class="nls-film__video" src="${esc(PETLOG_FILM)}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" aria-hidden="true">
        <source src="${esc(PETLOG_FILM)}" type="video/mp4" />
      </video>
      <div class="nls-film__lockup">
        <div class="nls-film__veil" aria-hidden="true"></div>
        <p class="nls-film__wordmark" lang="en">PETLOG</p>
        <h1 id="story-lifestage-title" class="nls-film__slogan">${titleHtml}</h1>
        <p class="nls-film__lead">${esc(lead)}</p>
        <div class="nls-film__actions">
          <a class="nls-btn" href="${esc(main[1])}"${main[1].startsWith("#") ? " data-nls-scroll" : ""}>${esc(main[0])}</a>
          <a class="nls-btn nls-btn--ghost" href="${esc(sub[1])}"${extAttr(sub[1])}>${esc(sub[0])}</a>
        </div>
      </div>
    </div>
  </div>`;
}

function section(id, { kicker, title, lead, noteText, band, body, cls }) {
  return `<div id="${id}" class="nls-block${band ? " nls-block--band" : ""}${cls ? ` ${cls}` : ""}" data-hs-section>
    ${title ? head(kicker, title, lead) : ""}
    ${body}
    ${note(noteText)}
  </div>`;
}

/** Editorial big-type statement with supporting paragraphs. */
function statementBlock(id, { kicker, statement, body }) {
  const paras = Array.isArray(body) ? body : [body];
  return `<div id="${id}" class="nls-block pl-statement" data-hs-section>
    <p class="nls-kicker">${esc(kicker)}</p>
    <h2 class="pl-statement__big">${nl(statement)}</h2>
    <div class="pl-statement__body" style="--pl-cols:${Math.min(paras.length, 3)}">${paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
  </div>`;
}

function rosterBlock(id, kicker, title, body) {
  const rows = body.map((p, i) => `<li><span>${pad2(i + 1)}</span><p>${esc(p)}</p></li>`).join("");
  return `<div id="${id}" class="nls-block nls-why-sec" data-hs-section>
    <div class="nls-split">
      ${head(kicker, title, "")}
      <ol class="nls-roster">${rows}</ol>
    </div>
  </div>`;
}

function dirList(items, depth) {
  return `<ol class="nls-dir">${items
    .map((s) => `<li><span>${esc(s.n)}</span><div><strong>${s.href ? `<a href="${esc(rel(depth, s.href))}"${s.on ? ' aria-current="page"' : ""}>${esc(s.name)}</a>` : esc(s.name)}</strong>${s.body ? `<p>${esc(s.body)}</p>` : ""}</div></li>`)
    .join("")}</ol>`;
}

function splitDir(id, { kicker, title, lead, noteText, items, depth }) {
  return `<div id="${id}" class="nls-block nls-related-sec" data-hs-section>
    <div class="nls-split">
      <div>${head(kicker, title, lead)}${note(noteText)}</div>
      ${dirList(items, depth)}
    </div>
  </div>`;
}

/** Big-number rows (Life Stage lane). rows: [title, body][] */
const laneList = (rows) => `<div class="nls-lane">${rows.map(([t, d], i) => `<article class="nls-lane__item"><span class="nls-lane__n">${pad2(i + 1)}</span><div class="nls-lane__copy"><h3>${esc(t)}</h3><p>${esc(d)}</p></div></article>`).join("")}</div>`;

/** Big-number columns (Life Stage pipe). cols: [big, title, body][] */
const pipeList = (cols) => `<div class="nls-pipe" style="--pl-pipe:${cols.length}">${cols.map(([n, t, d], i) => `<article class="nls-pipe__item${i === 0 ? " is-on" : ""}"><p class="nls-pipe__n">${esc(n)}</p><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join("")}</div>`;

/** Tab rail + cards (Life Stage "life journey"). One rail per page (home-lifestage.js). */
function railBlock(id, { kicker, title, lead, noteText, items, ariaLabel }) {
  const rail = items
    .map((it, i) => `<button type="button" class="nls-rail__btn${i === 0 ? " is-on" : ""}" data-nls-decade="${esc(it.id)}" aria-pressed="${i === 0}"><em>${esc(it.n)}</em><span>${esc(it.tab)}</span></button>`)
    .join("");
  const cards = items
    .map(
      (it, i) => `<article class="nls-decade${i === 0 ? " is-on" : ""}" data-nls-decade-card="${esc(it.id)}" data-scene="${esc(it.id)}">
        <div class="nls-decade__mark" aria-hidden="true"><b>${esc(it.mark)}</b><em>${esc(it.n)}</em></div>
        <div class="nls-decade__copy">
          <p class="nls-decade__n">${esc(it.n)}</p>
          <p class="nls-decade__age" lang="en">${esc(it.label)}</p>
          <h3>${esc(it.name)}</h3>
          <p class="nls-decade__lead">${esc(it.lead)}</p>
          ${chips(it.chips)}
        </div>
      </article>`
    )
    .join("");
  return `<div id="${id}" class="nls-block nls-block--band nls-journey-sec" data-hs-section>
    ${head(kicker, title, lead)}
    <div class="nls-rail nls-rail--petlog" style="--petlog-rail-n:${items.length}" role="group" aria-label="${esc(ariaLabel || kicker)}">${rail}</div>
    <div class="nls-journey">${cards}</div>
    ${note(noteText)}
  </div>`;
}

const checks = (items) =>
  `<ul class="pl-checks">${items.map((it) => (Array.isArray(it) ? `<li><div><strong>${esc(it[0])}</strong><p>${esc(it[1])}</p></div></li>` : `<li><span>${esc(it)}</span></li>`)).join("")}</ul>`;
const checksPlain = (items) => checks(items).replace('class="pl-checks"', 'class="pl-checks pl-checks--plain"');

/** Table that stacks into labelled rows on phones. rows: (string | {html})[][] */
function table(headRow, rows, { numFirst } = {}) {
  const cell = (c, i) => {
    const html = typeof c === "object" && c ? c.html : esc(c);
    const label = headRow[i] ? ` data-label="${esc(headRow[i])}"` : "";
    return `<td${label}${numFirst && i === 0 ? ' class="pl-num"' : ""}>${html}</td>`;
  };
  return `<table class="pl-table">
      <thead><tr>${headRow.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map(cell).join("")}</tr>`).join("")}</tbody>
    </table>`;
}

const steps = (items, { cols, firstTag } = {}) =>
  `<ol class="pl-steps" style="--pl-steps:${cols || 3}">${items
    .map(([t, d], i) => `<li${i === 0 && firstTag ? ' class="is-first"' : ""}>${i === 0 && firstTag ? `<span class="pl-chip">${esc(firstTag)}</span>` : ""}<h3>${esc(t)}</h3><p>${esc(d)}</p></li>`)
    .join("")}</ol>`;

const faq = (items) => `<div class="pl-faq">${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`;

/** Small strip linking to the other four PETLOG pages. */
function strip(lang, depth, active) {
  const L = bl(lang);
  const items = PETLOG_MENU.filter((m) => m.id !== active)
    .map((m) => `<li><a href="${esc(rel(depth, m.href))}"><em>${esc(m.n)} · ${esc(m.name)}</em><strong>${esc(m[L])}</strong><span>${esc(L === "ko" ? m.koLead : m.enLead)}</span></a></li>`)
    .join("");
  const label = OVERVIEW[L].stripTitle;
  return `<nav id="nls-more" class="pl-strip" aria-label="${esc(`PETLOG — ${label}`)}">
    <p class="nls-kicker">${esc(label)}</p>
    <ul>${items}</ul>
  </nav>`;
}

function closeBlock(c, depth) {
  return `<div id="nls-close" class="nls-block nls-close nls-block--ink" data-hs-section>
    <p class="nls-kicker">${esc(c.kicker)}</p>
    <h2 class="nls-hero__title">${c.titleHtml}</h2>
    <p class="nls-lead">${esc(c.lead)}</p>
    <div class="nls-actions">
      <a class="nls-btn" href="${esc(ext(c.main[1]) ? c.main[1] : rel(depth, c.main[1]))}"${extAttr(c.main[1])}>${esc(c.main[0])} →</a>
      <a class="nls-btn nls-btn--ghost" href="${esc(ext(c.sub[1]) ? c.sub[1] : rel(depth, c.sub[1]))}"${extAttr(c.sub[1])}>${esc(c.sub[0])}</a>
    </div>
  </div>`;
}

const wrap = (inner) => `<section id="lifestage-detail" class="nls nls--petlog" data-story="petlog" aria-labelledby="story-lifestage-title">${inner}</section>`;
const CONTACT_HREF = (type) => `petlog/contact/?type=${type}#inquiry`;

/* ---------------------------------------------------------------- pages */
/** 01 Overview — brand story only: why, mission, journey, a day, app structure, principles, direction, NEWON. */
function overviewPage(lang) {
  const c = OVERVIEW[bl(lang)];
  const D = 1;
  const journey = c.journey.items.map((it) => ({ id: it.id, n: it.n, tab: it.age, mark: it.age, label: it.age, name: it.name, lead: it.lead, chips: it.topics }));
  const timeline = `<ol class="pl-timeline">${c.day.items.map(([t, h, p]) => `<li><time>${esc(t)}</time><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join("")}</ol>`;
  const tabs = c.app.tabs;
  const phone = `<div class="pl-phone" aria-hidden="true">
        <div class="pl-phone__screen">
          <p class="pl-phone__brand">PETLOG</p>
          <div class="pl-phone__card"><b>${esc(c.day.items[0][1])}</b>${esc(c.day.items[0][0])}</div>
          <div class="pl-phone__card"><b>${esc(c.day.items[2][1])}</b>${esc(c.day.items[2][0])}</div>
          <div class="pl-phone__card"><b>${esc(c.day.items[4][1])}</b>${esc(c.day.items[4][0])}</div>
        </div>
        <div class="pl-phone__bar">${tabs.map(([n], i) => `<span${i === 0 ? ' class="is-on"' : ""}>${esc(n)}</span>`).join("")}</div>
      </div>`;
  const tabList = `<ul class="pl-tablist">${tabs.map(([n, en, d, s]) => `<li><strong>${esc(n)}${lang === "ko" ? `<small lang="en">${esc(en)}</small>` : ""}</strong><div><p>${esc(d)}</p>${status(lang, s)}</div></li>`).join("")}</ul>`;
  return wrap(`${hero({ titleHtml: c.heroTitle, lead: c.heroLead, main: [`${c.ctaMain} ↓`, "#nls-why"], sub: [c.ctaSub, STORE.ios] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "overview" })}
  <div class="nls__wrap">
    <p class="nls-note">${esc(c.statusNote)}</p>
    ${statementBlock("nls-why", c.why)}
    ${rosterBlock("nls-mission", c.mission.kicker, c.mission.title, c.mission.body)}
    ${railBlock("nls-journey", { kicker: c.journey.kicker, title: c.journey.title, lead: c.journey.lead, noteText: c.journey.note, items: journey })}
    ${section("nls-day", { kicker: c.day.kicker, title: c.day.title, lead: c.day.lead, noteText: c.day.note, body: timeline })}
    <div id="nls-app" class="nls-block" data-hs-section>
      <div class="pl-split">
        <div>${head(c.app.kicker, c.app.title, c.app.lead)}${tabList}${note(c.app.note)}</div>
        ${phone}
      </div>
    </div>
    ${section("nls-principles", { kicker: c.principles.kicker, title: c.principles.title, lead: c.principles.lead, band: true, body: checks(c.principles.items) })}
    ${section("nls-direction", { kicker: c.vision.kicker, title: c.vision.title, lead: c.vision.lead, noteText: c.vision.note, body: laneList(c.vision.rows) })}
    ${splitDir("nls-newon", { kicker: c.newon.kicker, title: c.newon.title, lead: c.newon.lead, noteText: c.newon.note, items: c.newon.items, depth: D })}
    ${closeBlock({ ...c.close, main: [c.close.ctaMain, "petlog/contact/"], sub: [c.close.ctaSub, STORE.ios] }, D)}
    ${strip(lang, D, "overview")}
  </div>`);
}

/** 02 Platform — 18 services by app tab. */
function platformPage(lang) {
  const m = PLATFORM.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const legend = `<ul class="pl-legend">${m.legend.map(([s, d]) => `<li>${chip(lang, s)}<span>${esc(d)}</span></li>`).join("")}</ul>`;
  const mapRows = m.groups.map((g) => {
    const its = g.items.map((i) => PLATFORM.items[i]);
    const live = its.filter((it) => it.status === "app").length;
    return [g.tab, g.role, { html: `${its.length} · ${its.map((it) => esc(it.name[L])).join(", ")}` }, live ? String(live) : "—"];
  });
  let n = 0;
  const groups = m.groups
    .map((g) => {
      const rows = g.items
        .map((idx) => {
          const it = PLATFORM.items[idx];
          n++;
          const anchor = it.label.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
          return `<li class="pl-row" id="svc-${anchor}">
            <span class="pl-row__n">${pad2(n)}</span>
            <div>
              <div class="pl-row__top"><p class="pl-row__label" lang="en">${esc(it.label)}</p>${status(lang, it.status)}</div>
              <h4>${esc(it.name[L])}</h4>
              <p class="pl-row__lead">${esc(it.lead[L])}</p>
              <ul class="pl-keys"><li class="pl-keys__k">${esc(m.keysLabel)}</li>${it.keys[L].map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
            </div>
          </li>`;
        })
        .join("");
      return `<section class="pl-group" id="nls-${g.id}" aria-labelledby="pl-g-${g.id}">
        <div class="pl-group__aside">
          <p class="pl-group__en" lang="en">${esc(g.en)}</p>
          <h3 id="pl-g-${g.id}">${esc(g.tab)}</h3>
          <p class="pl-group__role">${esc(g.role)}</p>
          <p class="pl-group__lead">${esc(g.lead)}</p>
        </div>
        <ol class="pl-rows">${rows}</ol>
      </section>`;
    })
    .join("");
  return wrap(`${hero({ titleHtml: m.heroTitle, lead: m.heroLead, main: [`${m.heroCta} ↓`, "#nls-services"], sub: [L === "ko" ? "PETLOG 앱 보기" : "See the PETLOG app", STORE.ios] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "platform" })}
  <div class="nls__wrap">
    ${section("nls-legend", { kicker: m.legendKicker, title: m.legendTitle, body: legend })}
    ${section("nls-map", { kicker: m.mapKicker, title: m.mapTitle, lead: m.mapLead, band: true, body: table(m.mapHead, mapRows) })}
    ${section("nls-services", { kicker: m.servicesKicker, title: m.servicesTitle, body: `<div class="pl-groups">${groups}</div>` })}
    ${section("nls-flow", { kicker: m.flowKicker, title: m.flowTitle, lead: m.flowLead, band: true, body: pipeList(m.flow) })}
    ${section("nls-faq", { kicker: m.faqKicker, title: m.faqTitle, body: faq(m.faq) })}
    ${strip(lang, D, "platform")}
  </div>`);
}

/** 03 Business — direction, 8 pillars, 20 lines, models, revenue, order of work, compliance. */
function businessPage(lang) {
  const m = BUSINESS.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const line = (no) => BUSINESS.lines.find((x) => x.no === no);
  const diagram = `<div class="pl-diagram" role="img" aria-label="${esc(`${m.dirOwners} — ${m.dirHub} — ${m.dirBiz}`)}">
      <div class="pl-diagram__side"><strong>${esc(m.dirOwners)}</strong><ul>${m.dirOwnersItems.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
      <div class="pl-diagram__hub"><b>${esc(m.dirHub)}</b><span lang="en">${BUSINESS.groups.map((g) => esc(g.label)).join(" · ")}</span></div>
      <div class="pl-diagram__side"><strong>${esc(m.dirBiz)}</strong><ul>${m.dirBizItems.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
    </div>`;
  const rail = BUSINESS.groups.map((g, i) => ({ id: g.id, n: pad2(i + 1), tab: g[L], mark: pad2(g.lines.length), label: g.label, name: g[L], lead: L === "ko" ? g.koLead : g.enLead, chips: g.lines.map((no) => `${no} ${line(no).name[L]}`) }));
  const ledger = BUSINESS.groups
    .map(
      (g, gi) => `<section class="pl-ledger__group" id="pillar-${g.id}" aria-labelledby="pl-p-${g.id}">
      <header class="pl-ledger__head"><span lang="en">${g.label.toLowerCase() === g[L].toLowerCase() ? pad2(gi + 1) : `${pad2(gi + 1)} · ${esc(g.label.toUpperCase())}`}</span><h3 id="pl-p-${g.id}">${esc(g[L])}</h3><p>${esc(L === "ko" ? g.koLead : g.enLead)}</p></header>
      ${g.lines
        .map((no) => {
          const x = line(no);
          return `<article class="pl-line" id="line-${x.no}">
        <span class="pl-line__n">${esc(x.no)}</span>
        <div><p class="pl-line__label" lang="en">${esc(x.label)}</p><h4>${esc(x.name[L])}</h4><p class="pl-line__lead">${esc(x.lead[L])}</p></div>
        <dl class="pl-line__meta"><div><dt>${esc(m.labels.for)}</dt><dd>${esc(x.for[L])}</dd></div><div><dt>${esc(m.labels.rev)}</dt><dd>${esc(x.rev[L])}</dd></div></dl>
        ${status(lang, x.status)}
      </article>`;
        })
        .join("")}
    </section>`
    )
    .join("");
  const revenue = `<div class="pl-split">
      ${head(m.revenueKicker, m.revenueTitle, "")}
      <div class="pl-dirbody">${m.revenueBody.map((p) => `<p>${esc(p)}</p>`).join("")}<ul class="pl-tags">${m.revenueCaveats.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
    </div>`;
  return wrap(`${hero({ titleHtml: m.heroTitle, lead: m.heroLead, main: [`${m.heroCta} ↓`, "#nls-lines"], sub: [m.labels.cta, rel(D, "petlog/contact/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "business" })}
  <div class="nls__wrap">
    <div id="nls-direction" class="nls-block" data-hs-section>
      <div class="pl-split">
        <div>${head(m.dirKicker, m.dirTitle, "")}<div class="pl-dirbody">${m.dirBody.map((p) => `<p>${esc(p)}</p>`).join("")}</div></div>
        ${diagram}
      </div>
    </div>
    ${railBlock("nls-groups", { kicker: m.groupsKicker, title: m.groupsTitle, lead: m.groupsLead, items: rail })}
    ${section("nls-lines", { kicker: m.linesKicker, title: m.linesTitle, lead: m.linesLead, body: `<div class="pl-ledger">${ledger}</div>` })}
    ${section("nls-models", { kicker: m.modelsKicker, title: m.modelsTitle, noteText: m.modelsNote, band: true, body: table(m.modelsHead, m.models) })}
    <div id="nls-revenue" class="nls-block" data-hs-section>${revenue}</div>
    ${section("nls-roadmap", { kicker: m.roadmapKicker, title: m.roadmapTitle, lead: m.roadmapLead, noteText: m.roadmapNote, band: true, body: steps(m.roadmap, { cols: 3, firstTag: m.roadmapFirst }) })}
    ${section("nls-trust", { kicker: m.trustKicker, title: m.trustTitle, body: checksPlain(m.trust) })}
    ${closeBlock({ ...m.close, main: [m.close.main, "petlog/contact/"], sub: [m.close.sub, "petlog/partnerships/"] }, D)}
    ${strip(lang, D, "business")}
  </div>`);
}

/** 04 Partnerships — honest status, why partner, 14 types, data, principles, process. */
function partnershipsPage(lang) {
  const m = PARTNERS.meta[bl(lang)];
  const L = bl(lang);
  const D = 2;
  const acc = ["care", "market", "public"]
    .map(
      (gid) => `<h3 class="pl-acc__title">${esc(m.groupNames[gid])}</h3>
    <div class="pl-acc">${PARTNERS.items
      .filter((p) => p.group === gid)
      .map(
        (p) => `<details class="pl-acc__item" id="partner-${p.no}">
        <summary><span class="pl-acc__n">${esc(p.no)}</span><span class="pl-acc__name">${esc(p.name[L])}</span><span class="pl-acc__value">${esc(p.value[L])}</span><span class="pl-acc__tag">${esc(m.reviewTag)}</span></summary>
        <div class="pl-acc__body">
          <dl><div><dt>${esc(m.labels.scope)}</dt><dd>${esc(p.scope[L])}</dd></div><div><dt>${esc(m.labels.how)}</dt><dd>${esc(p.how[L])}</dd></div><div><dt>${esc(m.labels.check)}</dt><dd>${esc(p.check[L])}</dd></div></dl>
          <a class="nls-link" href="${esc(rel(D, CONTACT_HREF(p.type)))}">${esc(m.labels.cta)} →</a>
        </div>
      </details>`
      )
      .join("")}</div>`
    )
    .join("");
  return wrap(`${hero({ titleHtml: m.heroTitle, lead: m.heroLead, main: [`${m.heroCta} ↓`, "#nls-types"], sub: [m.close.main, rel(D, "petlog/contact/")] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "partnerships" })}
  <div class="nls__wrap">
    ${statementBlock("nls-honest", { kicker: m.honestKicker, statement: m.honestStatement, body: [m.honestBody] })}
    ${section("nls-why", { kicker: m.whyKicker, title: m.whyTitle, band: true, body: pipeList(m.why) })}
    ${section("nls-types", { kicker: m.typesKicker, title: m.typesTitle, lead: m.typesLead, body: acc })}
    ${section("nls-data", { kicker: m.dataKicker, title: m.dataTitle, lead: m.dataLead, band: true, body: table(m.dataHead, m.data) })}
    ${section("nls-principles", { kicker: m.principlesKicker, title: m.principlesTitle, body: checksPlain(m.principles) })}
    ${section("nls-process", { kicker: m.processKicker, title: m.processTitle, noteText: m.processNote, band: true, body: steps(m.steps, { cols: 5 }) })}
    ${closeBlock({ ...m.close, main: [m.close.main, "petlog/contact/"], sub: [m.close.sub, "partnerships/"] }, D)}
    ${strip(lang, D, "partnerships")}
  </div>`);
}

/** 05 Contact — inquiry types table, NEWON contact, notes, the shared NEWON inquiry form, closing. */
function contactPage(lang) {
  const c = CONTACT[bl(lang)];
  const D = 2;
  const rows = c.types.map(([key, name, body, incl]) => [name, body, incl, { html: `<a href="?type=${esc(key)}#inquiry">${esc(c.pick)} →</a>` }]);
  const form = inquiryFormHtml(lang, D, {
    category: "PETLOG",
    interest: "PETLOG",
    copy: { label: "PETLOG", title: c.formTitle, subject: c.subject, types: c.types.map(([k, n]) => [k, n]), type: c.typeLabel, message: c.messageLabel, messagePh: c.messagePh, submit: lang === "ko" ? "문의 보내기" : "Send inquiry" },
  });
  const mail = `<div class="pl-split">
      <div>${head(c.mailKicker, c.mailTitle, "")}<p class="pl-body">${esc(c.mailBody)}</p></div>
      <dl class="pl-mail">
        <div><dt>${esc(c.mailLabel)}</dt><dd><a class="pl-mail__addr" href="mailto:${esc(c.mail)}">${esc(c.mail)}</a></dd></div>
        <div><dt>${esc(c.formLabel)}</dt><dd><a href="#inquiry" data-nls-scroll>${esc(c.formLink)} ↓</a></dd></div>
        <div><dt>${esc(c.deleteLabel)}</dt><dd><a href="${esc(rel(D, "petlog/delete-account/"))}">${esc(c.deleteLink)} →</a></dd></div>
      </dl>
    </div>`;
  return wrap(`${hero({ titleHtml: c.heroTitle, lead: c.heroLead, main: [`${c.heroCta} ↓`, "#nls-types"], sub: [lang === "ko" ? "문의 양식" : "Inquiry form", "#inquiry"] })}
  ${renderFlagshipSubnav({ biz: "petlog", lang, active: "contact" })}
  <div class="nls__wrap">
    ${section("nls-types", { kicker: c.kicker, title: c.listTitle, lead: c.listLead, body: table(c.tableHead, rows) })}
    <div id="nls-mail" class="nls-block nls-block--band" data-hs-section>${mail}</div>
    ${section("nls-guide", { kicker: c.guideKicker, title: c.guideTitle, body: checks(c.guide) })}
  </div>
  <div class="bp-page">${form}</div>
  <div class="nls__wrap">
    ${closeBlock({ ...c.close, main: [c.close.main, "petlog/"], sub: [c.close.sub, STORE.ios] }, D)}
    ${strip(lang, D, "contact")}
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
        EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=${NLS_VER}" />
    <link rel="stylesheet" href="/flagship-subnav.css?v=20261018fsn2" />
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
