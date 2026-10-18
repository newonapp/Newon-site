/**
 * Regression tests for the Business · Studio · Partnerships restructure (Oct 2026).
 * Since 2026-10-19 Business and Partnerships are one "Business & Partnerships" menu (render-bizpart.mjs,
 * tests/site/bizpart.test.mjs): the render-bsp Business / Partnerships pages are redirect stubs now, so the
 * page checks below cover the Studio pages render-bsp still owns, plus the stubs that replaced the others.
 * Run: node --test tests/site/bsp-pages.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ALL_PAGES } from "../../scripts/render-bsp.mjs";
import { PAGES, MENUS } from "../../scripts/bsp-content.mjs";
import { LEGACY_REDIRECTS } from "../../scripts/render-bizpart.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const header = (html) => (html.match(/<header class="gnav[\s\S]*?<\/header>/) || [""])[0];
const STUDIO_PAGES = ALL_PAGES.filter((p) => p.section === "studio");
const RETIRED = ALL_PAGES.filter((p) => p.section !== "studio" && p.slug !== "business/platforms");
const megaRows = (h, id) => {
  const m = h.match(new RegExp(`data-gnav-mega="${id}"[\\s\\S]*?<p class="gnav-mega__foot">`));
  return m ? (m[0].match(/class="gnav-mega__row"/g) || []).length : 0;
};

test("every Studio page from render-bsp exists in all nine locales with SEO basics", () => {
  for (const lang of LANGS) {
    for (const page of STUDIO_PAGES) {
      const rel = `${lang}/${page.slug}/index.html`;
      assert.ok(fs.existsSync(path.join(ROOT, rel)), `${rel} missing`);
      const html = read(rel);
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${rel} must have one h1`);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.newon\\.app/${lang}/${page.slug}/"`), `${rel} canonical`);
      assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 10, `${rel} hreflang (9 + x-default)`);
      for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
      assert.ok(html.includes('data-gnav-menu="business"'), `${rel} header has Business & Partnerships`);
      assert.ok(!html.includes('data-gnav-menu="partnerships"'), `${rel} header has no separate Partnerships menu`);
    }
  }
});

test("global header: Business & Partnerships 5, Studio 5, no separate Partnerships menu on every migrated page", () => {
  const samples = ["ko/index.html", "en/about/index.html", "ja/portfolio/petlog/index.html", "de/ongil/index.html", "hi/shareon/index.html", "id/business/inquiry/index.html"];
  for (const rel of samples) {
    const h = header(read(rel));
    assert.equal(megaRows(h, "business"), 5, `${rel} business & partnerships`);
    assert.equal(megaRows(h, "studio"), 5, `${rel} studio`);
    assert.equal(megaRows(h, "partnerships"), 0, `${rel} partnerships merged`);
    assert.ok(!h.includes('data-gnav-menu="partnerships"'), `${rel} no Partnerships trigger`);
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
    for (const page of STUDIO_PAGES) {
      const html = read(`${lang}/${page.slug}/index.html`);
      const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
      const text = main.replace(/<[^>]+>/g, " ");
      assert.doesNotMatch(text, agency, `${lang}/${page.slug} agency wording`);
      assert.doesNotMatch(text, claims, `${lang}/${page.slug} overclaim`);
    }
    for (const hub of ["studio"]) {
      const html = read(`${lang}/${hub}/index.html`);
      const main = html.slice(html.indexOf("<main"), html.indexOf("</main>")).replace(/<[^>]+>/g, " ");
      assert.doesNotMatch(main, agency, `${lang}/${hub} hub agency wording`);
    }
  }
  // "live" status only where the site already lists something as available
  const live = PAGES.flatMap((p) => (p.ko.blocks || []).flatMap((b) => (b.items || []).filter((it) => it.status === "live").map((it) => `${p.slug}:${it.tab}`)));
  assert.deepEqual(live.sort(), ["business/digital-products:KIT", "business/digital-products:TOOLS", "studio/digital:PRODUCT", "studio/digital:TEMPLATE"].sort());
});

test("retired Business / Partnerships pages of render-bsp are redirect stubs to the new screens", () => {
  for (const lang of LANGS) {
    for (const page of RETIRED) {
      const html = read(`${lang}/${page.slug}/index.html`);
      const to = LEGACY_REDIRECTS[page.slug];
      assert.ok(to, `${page.slug} has a mapping`);
      assert.match(html, new RegExp(`<meta http-equiv="refresh" content="0;url=/${lang}/${to.replace(/\//g, "\\/")}"`), `${lang}/${page.slug} refresh`);
      assert.match(html, /<meta name="robots" content="noindex, follow"/, `${lang}/${page.slug} noindex`);
      assert.ok(!html.includes("<main"), `${lang}/${page.slug} has no body`);
    }
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

test("sitemap lists every Studio URL once and no retired Business / Partnerships URL", () => {
  const xml = read("sitemap.xml");
  for (const lang of LANGS) {
    for (const page of STUDIO_PAGES) {
      const loc = `<loc>https://www.newon.app/${lang}/${page.slug}/</loc>`;
      assert.equal(xml.split(loc).length - 1, 1, `${loc} in sitemap`);
    }
    for (const page of RETIRED) {
      assert.ok(!xml.includes(`<loc>https://www.newon.app/${lang}/${page.slug}/</loc>`), `${lang}/${page.slug} not in sitemap`);
    }
  }
});
