/**
 * Moving first screens: every editorial hero carries a muted autoplay loop film (scripts/apply-hero-motion.mjs).
 * Run: node --test tests/site/hero-motion.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  HERO_MOTION_PAGES,
  HERO_MOTION_LANGS,
  HERO_FILMS,
  applyHeroMotion,
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

test("36 editorial first screens × 9 languages carry one film hero", () => {
  assert.equal(HERO_MOTION_PAGES.length, 36);
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

test("films are existing site films with local posters; film-keep.js covers the video class", () => {
  const sources = siteFilmSources();
  for (const [key, { src, poster }] of Object.entries(HERO_FILMS)) {
    assert.ok(sources.includes(src), `${key} film already used on the site`);
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
  const html = read("ko/about/index.html");
  assert.equal(applyHeroMotion(html, { kind: "about", film: "eco" }), html);
  const raw = `<html><head></head><body><main><section class="bp-hero" data-rs-reveal aria-labelledby="t"><h1 id="t">Blog</h1></section></main></body></html>`;
  const once = applyHeroMotion(raw, { kind: "bp", film: "ongil" });
  assert.match(once, /<section class="bp-hero hm-film hm-film--ongil" data-rs-reveal aria-labelledby="t" data-hm-film="ongil"><div class="hm-film__stage"/);
  assert.ok(once.includes('<h1 id="t">Blog</h1>'));
  assert.equal(applyHeroMotion(once, { kind: "bp", film: "ongil" }), once);
});
