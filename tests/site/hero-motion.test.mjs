/**
 * Moving first screens (scripts/apply-hero-motion.mjs). Switched off on 2026-11-17 at the owner's request:
 * the 35 editorial pages keep their original white, still first screen. With HERO_MOTION_ENABLED = true
 * every editorial hero carries a muted autoplay loop film again.
 * Run: node --test tests/site/hero-motion.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  HERO_MOTION_MODE,
  HERO_MOTION_ENABLED,
  HERO_MOTION_PAGES,
  HERO_MOTION_LANGS,
  HERO_FILMS,
  applyHeroMotion,
  removeHeroMotion,
} from "../../scripts/apply-hero-motion.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/** Films reused from the existing pages only — no new hosts. */
const siteFilmSources = () => {
  const dir = path.join(ROOT, "scripts");
  const all = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mjs") && f !== "apply-hero-motion.mjs")
    .map((f) => fs.readFileSync(path.join(dir, f), "utf8"))
    .join("\n") + read("ko/index.html");
  return all;
};

test("black mode: the 35 editorial first screens × 9 languages are dark on plain black (no film)", { skip: HERO_MOTION_MODE !== "black" }, () => {
  assert.equal(HERO_MOTION_PAGES.length, 35);
  for (const lang of HERO_MOTION_LANGS) {
    for (const { page } of HERO_MOTION_PAGES) {
      const html = read(`${lang}/${page}index.html`);
      const where = `${lang}/${page}`;
      assert.equal((html.match(/data-hm-film="black"/g) || []).length, 1, `${where} one black hero`);
      assert.ok(html.includes('<div class="hm-film__stage" aria-hidden="true"><div class="hm-film__scrim"></div></div>'), `${where} black stage`);
      assert.ok(!html.includes("hm-film__video"), `${where} no film video`);
      assert.match(html, /<link rel="stylesheet" href="\/hero-motion\.css\?v=/, `${where} css`);
      assert.match(html, /<script src="\/hero-motion\.js\?v=[^"]+" defer><\/script>/, `${where} hero-motion.js`);
    }
  }
  assert.match(read("hero-motion.css"), /\.hm-film--black:not\(#hm\) \.hm-film__stage \{ background-image: none !important; background-color: #0c0c0c !important; \}/);
});

test("switched off: the 35 editorial first screens × 9 languages are still (no film)", { skip: HERO_MOTION_MODE !== "off" }, () => {
  assert.equal(HERO_MOTION_PAGES.length, 35);
  for (const lang of HERO_MOTION_LANGS) {
    for (const { page } of HERO_MOTION_PAGES) {
      const html = read(`${lang}/${page}index.html`);
      const where = `${lang}/${page}`;
      assert.ok(!html.includes("data-hm-film="), `${where} no film host`);
      assert.ok(!html.includes("hm-film__video"), `${where} no film video`);
      assert.ok(!html.includes("/hero-motion.css"), `${where} no hero-motion.css`);
      assert.ok(!html.includes("/hero-motion.js"), `${where} no hero-motion.js`);
    }
  }
});

test("35 editorial first screens × 9 languages carry one film hero", { skip: !HERO_MOTION_ENABLED }, () => {
  assert.equal(HERO_MOTION_PAGES.length, 35);
  for (const lang of HERO_MOTION_LANGS) {
    for (const { page, film } of HERO_MOTION_PAGES) {
      const html = read(`${lang}/${page}index.html`);
      const where = `${lang}/${page}`;
      assert.equal((html.match(/data-hm-film="/g) || []).length, 1, `${where} one film host`);
      assert.match(html, new RegExp(`data-hm-film="${film}"`), `${where} film ${film}`);
      const video = html.match(/<video class="hm-film__video"[^>]*>/);
      assert.ok(video, `${where} video`);
      for (const attr of ["autoplay", "muted", "loop", "playsinline", "webkit-playsinline", 'preload="auto"', "disablepictureinpicture", 'aria-hidden="true"']) {
        assert.ok(video[0].includes(` ${attr}`), `${where} video ${attr}`);
      }
      assert.ok(video[0].includes(`src="${HERO_FILMS[film].src}"`), `${where} src`);
      assert.ok(video[0].includes(`poster="${HERO_FILMS[film].poster}"`), `${where} poster`);
      assert.match(html, /<link rel="stylesheet" href="\/hero-motion\.css\?v=/, `${where} css`);
      assert.match(html, /<script src="\/film-keep\.js\?v=/, `${where} film-keep`);
      assert.match(html, /<script src="\/hero-motion\.js\?v=[^"]+" defer><\/script>/, `${where} hero-motion.js`);
    }
  }
});

test("About keeps its plain white first screen (no film)", () => {
  for (const lang of HERO_MOTION_LANGS) {
    const html = read(`${lang}/about/index.html`);
    assert.ok(!html.includes("data-hm-film="), `${lang}/about no film`);
    assert.ok(!html.includes("/hero-motion.css"), `${lang}/about no hero-motion.css`);
  }
});

test("films are existing site films with local posters; film-keep.js covers the video class", () => {
  const sources = siteFilmSources();
  for (const [key, { src, poster }] of Object.entries(HERO_FILMS)) {
    /* "garden" was first used on pages that were later removed from the site; the film itself is unchanged. */
    if (key !== "garden") assert.ok(sources.includes(src), `${key} film already used on the site`);
    assert.ok(fs.existsSync(path.join(ROOT, poster)), `${key} poster ${poster}`);
  }
  const keep = read("film-keep.js");
  assert.ok(keep.includes(`"video[class*='film__video']"`), "film-keep selector matches hm-film__video");
  const css = read("hero-motion.css");
  assert.doesNotMatch(css, /@media\s*\(prefers-reduced-motion/, "film keeps playing under reduced motion, like the other film heroes");
  const publish = read("scripts/publish-site.mjs");
  assert.ok(publish.includes('"hero-motion.css"') && publish.includes('"hero-motion.js"'), "published at the site root");
});

test("applyHeroMotion is idempotent and keeps the hero content", () => {
  const html = read("ko/news/index.html");
  const moving = applyHeroMotion(html, { kind: "nr", film: "ai" });
  assert.equal(applyHeroMotion(moving, { kind: "nr", film: "ai" }), moving);
  const raw = `<html><head></head><body><main><section class="bp-hero" data-rs-reveal aria-labelledby="t"><h1 id="t">Blog</h1></section></main></body></html>`;
  const once = applyHeroMotion(raw, { kind: "bp", film: "ongil" });
  assert.match(once, /<section class="bp-hero hm-film hm-film--ongil" data-rs-reveal aria-labelledby="t" data-hm-film="ongil"><div class="hm-film__stage"/);
  assert.ok(once.includes('<h1 id="t">Blog</h1>'));
  assert.equal(applyHeroMotion(once, { kind: "bp", film: "ongil" }), once);
});

test("removeHeroMotion is the exact inverse of applyHeroMotion", () => {
  for (const lang of HERO_MOTION_LANGS) {
    for (const entry of HERO_MOTION_PAGES) {
      const still = read(`${lang}/${entry.page}index.html`);
      const moving = applyHeroMotion(removeHeroMotion(still), entry);
      assert.ok(moving && moving.includes(`data-hm-film="${entry.film}"`), `${lang}/${entry.page} converts`);
      assert.equal(removeHeroMotion(moving), removeHeroMotion(still), `${lang}/${entry.page} round trip`);
    }
  }
});
