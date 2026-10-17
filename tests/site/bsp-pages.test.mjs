/**
 * Regression tests for the Business · Studio · Partnerships restructure (Oct 2026).
 * Run: node --test tests/site/bsp-pages.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ALL_PAGES } from "../../scripts/render-bsp.mjs";
import { PAGES, MENUS } from "../../scripts/bsp-content.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const header = (html) => (html.match(/<header class="gnav[\s\S]*?<\/header>/) || [""])[0];
const megaRows = (h, id) => {
  const m = h.match(new RegExp(`data-gnav-mega="${id}"[\\s\\S]*?<p class="gnav-mega__foot">`));
  return m ? (m[0].match(/class="gnav-mega__row"/g) || []).length : 0;
};

test("every Business · Studio · Partnerships page exists in all nine locales with SEO basics", () => {
  for (const lang of LANGS) {
    for (const page of ALL_PAGES) {
      const rel = `${lang}/${page.slug}/index.html`;
      assert.ok(fs.existsSync(path.join(ROOT, rel)), `${rel} missing`);
      const html = read(rel);
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${rel} must have one h1`);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.newon\\.app/${lang}/${page.slug}/"`), `${rel} canonical`);
      assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 10, `${rel} hreflang (9 + x-default)`);
      for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
      assert.ok(html.includes('data-gnav-menu="partnerships"'), `${rel} header has Partnerships`);
    }
  }
});

test("global header: Business 6, Studio 5, Partnerships 7 items on every migrated page", () => {
  const samples = ["ko/index.html", "en/about/index.html", "ja/portfolio/petlog/index.html", "de/ongil/index.html", "hi/shareon/index.html", "id/business/inquiry/index.html"];
  for (const rel of samples) {
    const h = header(read(rel));
    assert.equal(megaRows(h, "business"), 6, `${rel} business`);
    assert.equal(megaRows(h, "studio"), 5, `${rel} studio`);
    assert.equal(megaRows(h, "partnerships"), 7, `${rel} partnerships`);
    for (const v of ["BABYLOG", "PETLOG", "MY WORLD", "SHAREON", "LIVON", "ONGIL"]) assert.ok(h.includes(`>${v}<`), `${rel} venture row ${v}`);
  }
});

test("menus and page data agree", () => {
  assert.deepEqual(MENUS.business.map((m) => m.id), ["overview", "automation", "solutions", "digital-products", "platforms", "inquiry"]);
  assert.deepEqual(MENUS.studio.map((m) => m.id), ["overview", "digital", "design-systems", "projects", "partnerships"]);
  assert.equal(MENUS.partnerships.length, 7);
  for (const p of PAGES) assert.ok(MENUS[p.section].some((m) => m.id === p.menu), `${p.slug} menu id`);
});

test("copy never presents outsourcing, unreleased sales, unbuilt integrations or investment as fact", () => {
  const agency = /견적|외주 제작|프로젝트 상담|맞춤 제작해|구축 대행합니다|Custom quote|Project inquiry/;
  const claims = /판매 중입니다|연동 완료|연동되어 있습니다|투자를 유치했습니다|공식 모집 중|협약을 체결했습니다|now on sale everywhere|integration is complete|investment round is open/i;
  for (const lang of ["ko", "en"]) {
    for (const page of ALL_PAGES) {
      const html = read(`${lang}/${page.slug}/index.html`);
      const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
      const text = main.replace(/<[^>]+>/g, " ");
      assert.doesNotMatch(text, agency, `${lang}/${page.slug} agency wording`);
      assert.doesNotMatch(text, claims, `${lang}/${page.slug} overclaim`);
    }
    for (const hub of ["business", "studio"]) {
      const html = read(`${lang}/${hub}/index.html`);
      const main = html.slice(html.indexOf("<main"), html.indexOf("</main>")).replace(/<[^>]+>/g, " ");
      assert.doesNotMatch(main, agency, `${lang}/${hub} hub agency wording`);
    }
  }
  // "live" status only where the site already lists something as available
  const live = PAGES.flatMap((p) => (p.ko.blocks || []).flatMap((b) => (b.items || []).filter((it) => it.status === "live").map((it) => `${p.slug}:${it.tab}`)));
  assert.deepEqual(live.sort(), ["business/digital-products:KIT", "business/digital-products:TOOLS", "studio/digital:PRODUCT", "studio/digital:TEMPLATE"].sort());
});

test("partnership inquiry form: minimal fields, consent, honeypot, no external action, existing mail fallback", () => {
  for (const lang of LANGS) {
    const html = read(`${lang}/partnerships/inquiry/index.html`);
    const form = html.match(/<form[\s\S]*?<\/form>/)[0];
    assert.doesNotMatch(form.split(">")[0], /\saction=/, `${lang} form must not post to an action URL`);
    for (const name of ["participant", "name", "company", "email", "type", "interest", "message", "consent", "_honey"]) {
      assert.ok(form.includes(`name="${name}"`), `${lang} field ${name}`);
    }
    for (const name of ["phone", "budget", "website"]) assert.ok(!form.includes(`name="${name}"`), `${lang} must not collect ${name}`);
    assert.match(form, /name="consent" type="checkbox" value="yes" required/);
    assert.match(form, /type="email" required/);
    assert.ok(html.includes("/business/inquiry.js"), `${lang} reuses the existing inquiry script`);
    assert.ok(html.includes('id="bz-fail"'), `${lang} failure message`);
  }
});

test("business inquiry lists the product-business types first", () => {
  const html = read("ko/business/inquiry/index.html");
  const sel = html.match(/<select id="bz-type"[\s\S]*?<\/select>/)[0];
  const opts = [...sel.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(opts.slice(1, 7), [
    "PRODUCT / Product adoption",
    "PRODUCT / Enterprise solution",
    "PRODUCT / Automation product",
    "PRODUCT / Sales &amp; distribution",
    "PRODUCT / Platform integration",
    "PRODUCT / License",
  ]);
});

test("sitemap lists every new URL once", () => {
  const xml = read("sitemap.xml");
  for (const lang of LANGS) {
    for (const page of ALL_PAGES) {
      const loc = `<loc>https://www.newon.app/${lang}/${page.slug}/</loc>`;
      assert.equal(xml.split(loc).length - 1, 1, `${loc} in sitemap`);
    }
  }
});
