/**
 * MY WORLD business site — content-safety and structure checks.
 * Run: node --test tests/myworld-site/*.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { KO } from "../../scripts/myworld-site-copy-ko.mjs";
import { EN } from "../../scripts/myworld-site-copy-en.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const PAGES = ["myworld/", "myworld/platform/", "myworld/business/", "myworld/partnerships/", "myworld/contact/"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const main = (html) => html.slice(html.indexOf('<div id="myworld-site"'), html.indexOf("</main>"));

function shape(o, p = "") {
  if (Array.isArray(o)) return [`${p}[]${o.length}`, ...o.flatMap((x, i) => (x && typeof x === "object" ? shape(x, `${p}[${i}]`) : []))];
  if (o && typeof o === "object") return Object.keys(o).flatMap((k) => shape(o[k], `${p}.${k}`));
  return [p];
}

test("KO and EN copy share the same structure", () => {
  assert.deepEqual(shape(EN), shape(KO));
});

test("required counts: 6 journey steps, 25 plan areas in 5 groups, 8 groups/20 lines, 13 revenue models in 4 stages, 18 partner types, 6 steps, 16 inquiry types", () => {
  for (const c of [KO, EN]) {
    assert.equal(c.overview.journey.items.length, 6);
    assert.equal(c.overview.values.items.length, 5);
    assert.equal(c.overview.roadmap.items.length, 5);
    assert.equal(c.platform.items.length, 25);
    assert.equal(c.platform.groups.length, 5);
    assert.equal(c.business.groups.length, 8);
    assert.equal(c.business.lines.length, 20);
    assert.equal(c.business.revenue.items.length, 13);
    assert.equal(c.business.roadmap.items.length, 5);
    assert.equal(c.partnerships.items.length, 18);
    assert.equal(c.partnerships.process.steps.length, 6);
    assert.equal(c.contact.items.length, 16);
    const seq = (n) => Array.from({ length: n }, (_, i) => i + 1);
    const cover = (groups, key) => groups.flatMap((x) => x[key]).sort((a, b) => a - b);
    assert.deepEqual(cover(c.business.groups, "lines"), seq(20));
    assert.deepEqual(cover(c.business.revenue.stages, "items"), seq(13));
    assert.deepEqual(cover(c.platform.groups, "items"), seq(25));
    assert.deepEqual(cover(c.partnerships.groups, "items"), seq(18));
    assert.deepEqual(cover(c.contact.groups, "items"), seq(16));
    for (const l of c.business.lines) assert.ok(l.rev >= 1 && l.rev <= 13, l.name);
    // "available in the app" only for the verified record core (world map, journal, history & stats)
    assert.deepEqual(c.platform.items.map((s, i) => (s.status === "live" ? i + 1 : 0)).filter(Boolean), [1, 2, 3]);
    for (const s of c.platform.items) {
      assert.ok(s.features.length >= 3 && s.features.length <= 5, s.name);
      assert.ok(s.now && s.next, `${s.name} has now/next text`);
    }
  }
});

test("status is shown by grouping, not as a badge on every card", () => {
  for (const l of ["ko", "en"]) {
    const platform = main(read(`${l}/myworld/platform/index.html`));
    const services = platform.slice(platform.indexOf('id="mws-services"'), platform.indexOf('id="mws-now"'));
    assert.doesNotMatch(services, /mws-badge/, `${l} platform area rows carry no badges`);
    const business = main(read(`${l}/myworld/business/index.html`));
    const rev = business.slice(business.indexOf('id="mws-revenue"'), business.indexOf('id="mws-subscription"'));
    assert.doesNotMatch(rev, /mws-badge/, `${l} revenue rows carry no badges`);
  }
});

test("store links: the Google Play link is unchanged and the App Store link matches the NEWON home listing", async () => {
  const { BUSINESS } = await import("../../scripts/six-businesses.mjs");
  for (const p of PAGES) {
    const html = read(`ko/${p}index.html`);
    assert.match(html, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.newon\.myworld&amp;pcampaignid=web_share/);
    assert.ok(html.includes(BUSINESS.myworld.stores.appStore), p);
  }
});

test("every page exists in every language with canonical, 10 hreflang links and one h1", () => {
  for (const l of LANGS) {
    for (const p of PAGES) {
      const html = read(`${l}/${p}index.html`);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://www.newon.app/${l}/${p}" />`));
      assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 10, `${l}/${p}`);
      assert.equal((main(html).match(/<h1[\s>]/g) || []).length, 1, `${l}/${p}`);
      assert.match(html, /myworld-site\.js/);
      assert.match(html, /<meta property="og:title"/);
    }
  }
});

test("no internal prices, fee rates or fabricated partner claims are published", () => {
  const banned = [/9,?900/, /99,?000/, /3,?900/, /19,?900/, /29,?000/, /\d+\s*[–-]\s*\d+\s*%/, /\d+\s*%/, /[₩$€]\s?\d/, /\d+\s*원/];
  for (const l of LANGS) {
    for (const p of PAGES) {
      const text = main(read(`${l}/${p}index.html`)).replace(/<[^>]+>/g, " ");
      for (const re of banned) assert.doesNotMatch(text, re, `${l}/${p} matches ${re}`);
    }
  }
});

test("web pages contain no forms, sign-in, checkout or booking controls", () => {
  for (const l of LANGS) {
    for (const p of PAGES) {
      const m = main(read(`${l}/${p}index.html`));
      assert.doesNotMatch(m, /<form|<input|<select|<textarea|type="submit"/i, `${l}/${p}`);
    }
  }
});

test("internal links inside MY WORLD pages resolve to existing files", () => {
  for (const l of LANGS) {
    for (const p of PAGES) {
      const m = main(read(`${l}/${p}index.html`));
      for (const [, href] of m.matchAll(/href="(\/[^"#?]*)/g)) {
        const target = href.endsWith("/") ? `${href}index.html` : href;
        assert.ok(fs.existsSync(path.join(ROOT, target)), `${l}/${p} -> ${href}`);
      }
      for (const [, src] of m.matchAll(/src="(\/[^"?]*)/g)) assert.ok(fs.existsSync(path.join(ROOT, src)), src);
    }
  }
});

test("account-deletion pages are still present and untouched by the renderer", () => {
  for (const l of LANGS) {
    const html = read(`${l}/myworld/delete-account/index.html`);
    assert.match(html, /delete-account/);
    assert.doesNotMatch(html, /myworld-site\.css/);
  }
});

test("non-KO/EN locales are marked as English content", () => {
  for (const l of LANGS.filter((x) => x !== "ko" && x !== "en")) {
    assert.match(read(`${l}/myworld/index.html`), /<div id="myworld-site" class="mws mws--overview" lang="en">/);
  }
});

test("sitemap lists all 45 MY WORLD pages exactly once", () => {
  const xml = read("sitemap.xml");
  for (const l of LANGS) for (const p of PAGES) {
    const n = xml.split(`<loc>https://www.newon.app/${l}/${p}</loc>`).length - 1;
    assert.equal(n, 1, `${l}/${p}`);
  }
});
