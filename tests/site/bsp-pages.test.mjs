/**
 * Regression tests for the Business · Studio · Partnerships restructure (Oct 2026).
 * Since 2026-10-19 Business and Partnerships are one "Business & Partnerships" menu (render-bizpart.mjs,
 * tests/site/bizpart.test.mjs): the render-bsp Business / Partnerships pages are redirect stubs now, so the
 * page checks below cover the stubs that replaced them. Since 2026-10-19 (later) the Studio pages render-bsp writes are
 * retired as well: NEWON Studio is eleven screens (render-studio-site.mjs, tests/site/studio-site.test.mjs) and the
 * render-bsp Studio pages are redirect stubs to them.
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
import { LEGACY_STUDIO_REDIRECTS, STUDIO_SITE_PATHS } from "../../scripts/render-studio-site.mjs";

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

test("the Studio pages render-bsp writes are redirect stubs to the new Studio screens in all nine locales", () => {
  for (const lang of LANGS) {
    for (const page of STUDIO_PAGES) {
      const rel = `${lang}/${page.slug}/index.html`;
      const to = LEGACY_STUDIO_REDIRECTS[page.slug];
      assert.ok(to, `${page.slug} has a Studio mapping`);
      const html = read(rel);
      assert.match(html, new RegExp(`<meta http-equiv="refresh" content="0;url=/${lang}/${to.replace(/\//g, "\\/")}"`), `${rel} refresh`);
      assert.match(html, /<meta name="robots" content="noindex, follow"/, `${rel} noindex`);
      assert.ok(!html.includes("<main"), `${rel} has no body`);
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
    // The Studio hub is the new Overview screen: no outsourcing offer (it may name the Starter Kit's quotation template).
    const offer = /견적 문의|견적 요청|외주 제작 문의|프로젝트 상담|맞춤 제작해|구축 대행합니다|Request a quote|Get a quote|Project inquiry/;
    const html = read(`${lang}/studio/index.html`);
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>")).replace(/<[^>]+>/g, " ");
    assert.doesNotMatch(main, offer, `${lang}/studio hub agency wording`);
    assert.doesNotMatch(main, claims, `${lang}/studio hub overclaim`);
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

test("business inquiry lists the six business inquiry types (Oct 2026 brief) after the placeholder", () => {
  const html = read("ko/business/inquiry/index.html");
  const sel = html.match(/<select id="bz-type"[\s\S]*?<\/select>/)[0];
  const opts = [...sel.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(opts.slice(1, 7), [
    "Platform Participation &amp; Transactions",
    "Brand, Service &amp; Content Partnership",
    "Enterprise Service Adoption",
    "Public Sector &amp; Organization Partnership",
    "Technology &amp; Global Partnership",
    "Other Business Inquiry",
  ]);
});

test("sitemap lists every new Studio screen once and no retired Studio, Business or Partnerships URL", () => {
  const xml = read("sitemap.xml");
  for (const lang of LANGS) {
    for (const p of STUDIO_SITE_PATHS) {
      const loc = `<loc>https://www.newon.app/${lang}/${p}/</loc>`;
      assert.equal(xml.split(loc).length - 1, 1, `${loc} in sitemap`);
    }
    for (const page of [...STUDIO_PAGES, ...RETIRED]) {
      assert.ok(!xml.includes(`<loc>https://www.newon.app/${lang}/${page.slug}/</loc>`), `${lang}/${page.slug} not in sitemap`);
    }
  }
});
