#!/usr/bin/env node
/**
 * Moving first screens: every editorial (white, static) hero gets the NEWON film backdrop —
 * a full-bleed muted autoplay loop video under a dark scrim, the same treatment as the
 * Business / Studio / Contact film heroes. Content, copy, buttons and layout stay as they are;
 * only the background moves (colours switch to white in /hero-motion.css).
 *
 *   node scripts/apply-hero-motion.mjs          (runs at the end of build-i18n and again in publish-site
 *                                                after the portfolio pages are regenerated)
 *
 * Idempotent: a hero that already carries data-hm-film is left alone.
 * Videos: only films already used elsewhere on the site (same CloudFront host), each with its local poster.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

export const HERO_MOTION_LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
export const HERO_MOTION_CSS_V = "20261027hm1";
export const HERO_MOTION_JS_V = "20261027hm1";
const FILM_KEEP_V = "20260924play2";

const CF = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/";

/** Films already on the site, with the local poster that matches each film's first frame. */
export const HERO_FILMS = {
  /** Home first screen (green valley). */
  home: { src: `${CF}hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4`, poster: "/assets/hero-film/poster.jpg" },
  /** Ecosystem (dark orb). */
  eco: { src: `${CF}hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4`, poster: "/assets/hero-film/ecosystem-poster.jpg" },
  /** NEWON AI (glass crystal). */
  ai: { src: `${CF}hf_20260723_145606_ab143199-b593-4941-bb1b-9afca215416b.mp4`, poster: "/assets/hero-film/ai-poster.jpg" },
  /** LIVON (floating rock garden). */
  livon: { src: `${CF}hf_20260702_102608_5fa1187d-9ac6-44fb-82ab-54376200abc0.mp4`, poster: "/assets/hero-film/livon-poster.jpg" },
  /** Newon Business (field robot, blue sky). */
  biz: { src: `${CF}hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4`, poster: "/assets/hero-film/business-poster.jpg" },
  /** ONGIL (lakeside gathering). */
  ongil: { src: `${CF}hf_20260323_071151_38c3924f-c312-48af-a196-3fbb80e4226f.mp4`, poster: "/assets/hero-film/ongil-poster.jpg" },
};

/** Hero opening tags, one per editorial hero family. */
export const HERO_KINDS = {
  about: /<header class="ab-brand ab-brand--hq ab-brand--intro"[^>]*>/,
  ox: /<section id="fh-top" class="ox-hero[^"]*"[^>]*>/,
  co: /<section class="co-hero"[^>]*>/,
  hub: /<section class="hub-hero hub-inner"[^>]*>/,
  mh: /<header class="mh-hero"[^>]*>/,
  nr: /<section class="nr-hero"[^>]*>/,
  pf: /<section class="pf-project-hero"[^>]*>/,
  ns: /<section class="ns-hero rs-explore-hero"[^>]*>/,
  bp: /<section class="bp-hero"[^>]*>/,
  bs: /<section class="bs-hero"[^>]*>/,
  plus: /<section class="plus-hero"[^>]*>/,
  tools: /<section class="tools-hero"[^>]*>/,
};

const STORE_ITEMS = [
  "app-launch-kit",
  "business-planning-workbook",
  "founder-dashboard",
  "mvp-planning-kit",
  "newon-project-starter-kit",
  "product-research-template",
  "product-roadmap",
  "website-launch-checklist",
];

const PORTFOLIO_PROJECTS = [
  "babylog",
  "countup",
  "eaton",
  "fiton",
  "goalup",
  "myworld",
  "newon-plus",
  "ox-month",
  "petlog",
  "piggyup",
  "pillmate",
  "savy",
  "subping",
];
const PORTFOLIO_ROTATION = ["livon", "ai", "eco", "ongil", "home", "biz"];

/** Page (path inside /{lang}/) → hero family + film. Neighbouring sections get different films. */
export const HERO_MOTION_PAGES = [
  { page: "about/", kind: "about", film: "eco" },
  { page: "news/", kind: "nr", film: "ai" },
  { page: "media/", kind: "mh", film: "livon" },
  { page: "ideas/", kind: "co", film: "home" },
  { page: "404-human/", kind: "ox", film: "ai" },
  { page: "products/", kind: "hub", film: "ongil" },
  { page: "market/", kind: "hub", film: "biz" },
  { page: "saas/", kind: "plus", film: "ai" },
  { page: "tools/", kind: "tools", film: "eco" },
  { page: "resources/", kind: "ns", film: "ai" },
  { page: "resources/store/", kind: "bp", film: "biz" },
  { page: "resources/insights/", kind: "bp", film: "livon" },
  { page: "resources/blog/", kind: "bp", film: "ongil" },
  { page: "resources/education/", kind: "bp", film: "home" },
  { page: "resources/newsletter/", kind: "bp", film: "eco" },
  ...STORE_ITEMS.map((slug) => ({ page: `resources/store/${slug}/`, kind: "bs", film: "eco" })),
  ...PORTFOLIO_PROJECTS.map((slug, i) => ({
    page: `portfolio/${slug}/`,
    kind: "pf",
    film: PORTFOLIO_ROTATION[i % PORTFOLIO_ROTATION.length],
  })),
];

export function heroFilmStageHtml(filmKey) {
  const film = HERO_FILMS[filmKey];
  if (!film) throw new Error(`hero-motion: unknown film ${filmKey}`);
  return (
    `<div class="hm-film__stage" aria-hidden="true">` +
    `<video class="hm-film__video" src="${film.src}" poster="${film.poster}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture disableremoteplayback controlslist="nodownload nofullscreen noremoteplayback" tabindex="-1" aria-hidden="true">` +
    `<source src="${film.src}" type="video/mp4" />` +
    `</video>` +
    `<div class="hm-film__scrim"></div>` +
    `</div>`
  );
}

/**
 * Converts the page's editorial hero into a film hero. Returns the html unchanged when it
 * is already converted, and null when the hero cannot be found (the caller reports it).
 */
export function applyHeroMotion(html, { kind, film }) {
  if (html.includes("data-hm-film=")) return html;
  const re = HERO_KINDS[kind];
  if (!re) throw new Error(`hero-motion: unknown hero kind ${kind}`);
  const m = html.match(re);
  if (!m) return null;
  const open = m[0];
  const tag = open
    .replace(/class="([^"]*)"/, (_, cls) => `class="${cls} hm-film hm-film--${film}"`)
    .replace(/>$/, ` data-hm-film="${film}">`);
  let out = html.slice(0, m.index) + tag + heroFilmStageHtml(film) + html.slice(m.index + open.length);

  if (!out.includes("/hero-motion.css")) {
    out = out.replace(/<\/head>/i, `<link rel="stylesheet" href="/hero-motion.css?v=${HERO_MOTION_CSS_V}" />\n</head>`);
  }
  const tail = [];
  if (!out.includes("/film-keep.js")) tail.push(`<script src="/film-keep.js?v=${FILM_KEEP_V}"></script>`);
  if (!out.includes("/hero-motion.js")) tail.push(`<script src="/hero-motion.js?v=${HERO_MOTION_JS_V}" defer></script>`);
  if (tail.length) {
    const idx = out.toLowerCase().lastIndexOf("</body>");
    out = idx >= 0 ? out.slice(0, idx) + tail.join("\n") + "\n" + out.slice(idx) : out + tail.join("\n");
  }
  return out;
}

export function runHeroMotion(root = ROOT) {
  let changed = 0;
  let kept = 0;
  const missing = [];
  for (const lang of HERO_MOTION_LANGS) {
    for (const entry of HERO_MOTION_PAGES) {
      const fp = path.join(root, lang, entry.page, "index.html");
      if (!fs.existsSync(fp)) {
        missing.push(`${lang}/${entry.page} (no file)`);
        continue;
      }
      const html = fs.readFileSync(fp, "utf8");
      if (/http-equiv="refresh"/i.test(html)) {
        missing.push(`${lang}/${entry.page} (redirect stub)`);
        continue;
      }
      const next = applyHeroMotion(html, entry);
      if (next === null) {
        missing.push(`${lang}/${entry.page} (no ${entry.kind} hero)`);
        continue;
      }
      if (next !== html) {
        fs.writeFileSync(fp, next);
        changed += 1;
      } else kept += 1;
    }
  }
  return { changed, kept, missing };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { changed, kept, missing } = runHeroMotion();
  if (missing.length) {
    console.error(`apply-hero-motion: ${missing.length} page(s) without a convertible hero:\n  ${missing.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`apply-hero-motion: ${changed} converted · ${kept} already moving · ${HERO_MOTION_PAGES.length} pages × ${HERO_MOTION_LANGS.length} langs`);
}
