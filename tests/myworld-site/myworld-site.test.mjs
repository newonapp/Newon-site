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

test("required counts: 20 services in 6 groups, 8 groups/20 lines, 6 models, 14 partner types, 5 steps, 16 inquiry types", () => {
  for (const c of [KO, EN]) {
    assert.equal(c.overview.journey.items.length, 6);
    assert.equal(c.overview.v2.tabs.length, 5);
    assert.deepEqual(c.overview.v2.tabs.map((t) => t.en), ["World", "Travel", "Book", "Community", "My"]);
    assert.equal(c.overview.principles.items.length, 8);
    assert.equal(c.platform.items.length, 20);
    assert.equal(c.platform.groups.length, 6);
    assert.equal(c.platform.tabmap.rows.length, 5);
    assert.equal(c.business.groups.length, 8);
    assert.equal(c.business.lines.length, 20);
    assert.equal(c.business.models.rows.length, 6);
    assert.equal(c.business.roadmap.items.length, 5);
    assert.equal(c.partnerships.items.length, 14);
    assert.equal(c.partnerships.models.items.length, 6);
    assert.equal(c.partnerships.principles.items.length, 8);
    assert.equal(c.partnerships.process.steps.length, 5);
    assert.equal(c.contact.items.length, 16);
    const seq = (n) => Array.from({ length: n }, (_, i) => i + 1);
    const cover = (groups, key) => groups.flatMap((x) => x[key]).sort((a, b) => a - b);
    assert.deepEqual(cover(c.business.groups, "lines"), seq(20));
    assert.deepEqual(cover(c.platform.groups, "items"), seq(20));
    assert.deepEqual(cover(c.partnerships.groups, "items"), seq(14));
    assert.deepEqual(cover(c.contact.groups, "items"), seq(16));
    assert.deepEqual(c.platform.items.filter((s) => s.status === "live").length, 3);
    for (const s of c.platform.items) assert.ok(s.features.length >= 3 && s.features.length <= 5, s.name);
    // Book stays "in preparation" until affiliate contracts; community is not presented as shared
    assert.equal(c.overview.v2.tabs.find((t) => t.id === "book").status, "planned");
    assert.equal(c.overview.v2.tabs.find((t) => t.id === "community").status, "planned");
  }
});

test("overview is the brand story only: no service, business-line, partner-type or inquiry lists", () => {
  for (const l of ["ko", "en"]) {
    const m = main(read(`${l}/myworld/index.html`));
    for (const cls of ["mws-svc", "mws-spec", "mws-prow", "mws-table--inquiry", "mws-table--models"]) {
      assert.doesNotMatch(m, new RegExp(`class="${cls}[" ]`), `${l} overview contains ${cls}`);
    }
    assert.match(m, /class="mws-explore"/);
  }
});

test("hero film constant and shared sub-menu are kept on every page", () => {
  for (const l of LANGS) for (const p of PAGES) {
    const html = read(`${l}/${p}index.html`);
    assert.match(html, /hf_20260407_043131_ebe2f0b5-9acc-4a4f-b2c1-7297f1a3beb9\.mp4/);
    assert.match(html, /class="fsn" data-biz="myworld"/);
    assert.match(html, /film-keep\.js/);
  }
});

test("contact page links to the NEWON inquiry system and email", () => {
  for (const l of ["ko", "en"]) {
    const m = main(read(`${l}/myworld/contact/index.html`));
    assert.match(m, new RegExp(`href="/${l}/contact/"`));
    assert.match(m, /mailto:newon@newon\.app/);
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
