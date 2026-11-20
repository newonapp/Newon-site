/**
 * PETLOG left NEWON's core businesses on 2026-11-20 (core = SHAREON · BABYLOG · ONGIL).
 *
 * The PETLOG business website (/{lang}/petlog/, platform/, business/, partnerships/, contact/) is retired:
 *   - overview / platform / business / partnerships → noindex redirect stubs to /{lang}/portfolio/petlog/
 *     (the PetLog release & development history page)
 *   - contact → noindex redirect stub to the unified /{lang}/contact/ with PETLOG preselected
 * Kept: the PetLog app (Apps menu, app catalogue, Newon+), /{lang}/petlog/delete-account/, privacy, terms,
 * PETLOG on the unified contact form, and past news / release history.
 * Run: node --test tests/site/petlog-site.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PETLOG_SITE_PATHS, PETLOG_SITE_RETIRED } from "../../scripts/render-petlog-site.mjs";
import { VENTURE_NAV, FOOTER_MENUS } from "../../scripts/site-chrome.mjs";
import { TOP_NAV, MEGA_DESTINATIONS } from "../../scripts/venture-studio-data.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const target = (lang, slug) => (slug === "petlog/contact" ? `/${lang}/contact/?platform=petlog&source=petlog-contact` : `/${lang}/portfolio/petlog/`);
const esc = (s) => s.replace(/&/g, "&amp;");
const header = (html) => (html.match(/<header class="gnav[\s\S]*?<\/header>/) || [""])[0];
const footerNav = (html) => (html.match(/<nav class="site-foot__nav"[\s\S]*?<\/nav>/) || [""])[0];

test("the five PETLOG business pages are noindex redirect stubs in all nine locales (and at the root)", () => {
  assert.equal(PETLOG_SITE_RETIRED, true);
  assert.deepEqual(PETLOG_SITE_PATHS, ["petlog", "petlog/platform", "petlog/business", "petlog/partnerships", "petlog/contact"]);
  for (const lang of LANGS) {
    for (const slug of PETLOG_SITE_PATHS) {
      const rel = `${lang}/${slug}/index.html`;
      const html = read(rel);
      const to = target(lang, slug);
      assert.match(html, /<meta name="robots" content="noindex, follow" \/>/, `${rel} noindex`);
      assert.ok(html.includes(`<link rel="canonical" href="https://www.newon.app${esc(to)}" />`) || html.includes(`<link rel="canonical" href="https://www.newon.app${to}" />`), `${rel} canonical`);
      assert.ok(html.includes(`<meta http-equiv="refresh" content="0;url=${esc(to)}" />`), `${rel} refresh`);
      assert.ok(html.includes(`location.replace(${JSON.stringify(to)})`), `${rel} location.replace`);
      assert.ok(!/<main\b/.test(html) && !/gnav/.test(html), `${rel} has no page body or menus`);
      assert.ok(!/운영 중|Live|입점|제휴|partnership/i.test(html.replace(/<[^>]+>/g, " ").replace(/petlog-contact|platform=petlog/g, "")), `${rel} no business promotion`);
    }
    assert.ok(exists(`${lang}/portfolio/petlog/index.html`), `${lang} release history page exists`);
    assert.ok(exists(`${lang}/contact/index.html`), `${lang} unified contact page exists`);
  }
  for (const slug of PETLOG_SITE_PATHS) {
    const root = read(`${slug}/index.html`);
    assert.ok(root.includes("noindex") && root.includes(`content="0;url=${esc(target("ko", slug))}"`), `root /${slug}/ stub`);
  }
});

test("PETLOG is gone from the business row, its mega menu and the footer; the Apps menu keeps the PetLog app", () => {
  assert.ok(!TOP_NAV.includes("petlog"));
  assert.ok(!("petlog" in MEGA_DESTINATIONS));
  assert.deepEqual(VENTURE_NAV.map((v) => v.id), ["ongil", "shareon", "babylog"]);
  assert.ok(!FOOTER_MENUS.some(([id]) => id === "petlog"));
  const samples = ["ko/index.html", "en/about/index.html", "ja/portfolio/petlog/index.html", "de/business/partnerships/index.html", "id/shareon/index.html", "hi/ecosystem/index.html", "fr/news/petlog-community-update/index.html", "pt-br/portfolio/index.html", "es/studio/platforms/index.html"];
  for (const rel of samples) {
    const html = read(rel);
    const h = header(html);
    assert.ok(h, `${rel} header`);
    assert.ok(!h.includes('data-gnav-menu="petlog"') && !h.includes('data-gnav-mega="petlog"'), `${rel} no PETLOG business menu`);
    assert.ok(!/href="[^"]*\/petlog\/(platform\/|business\/|partnerships\/|contact\/)?"/.test(h), `${rel} no link to the retired PETLOG pages in the header`);
    assert.ok(!/\/petlog\/"/.test(footerNav(html)), `${rel} no PETLOG footer link`);
  }
});

test("sitemap: no retired PETLOG business or Studio page; the PetLog history page stays", () => {
  const xml = read("sitemap.xml");
  for (const lang of LANGS) {
    for (const slug of [...PETLOG_SITE_PATHS, "studio/platforms/petlog"]) assert.ok(!xml.includes(`<loc>https://www.newon.app/${lang}/${slug}/</loc>`), `${lang}/${slug} out of sitemap`);
    assert.ok(xml.includes(`<loc>https://www.newon.app/${lang}/portfolio/petlog/</loc>`), `${lang}/portfolio/petlog in sitemap`);
  }
});

test("kept for PETLOG users: account deletion, privacy, terms and PETLOG on the unified contact form", () => {
  for (const lang of LANGS) {
    const del = read(`${lang}/petlog/delete-account/index.html`);
    assert.ok(!/http-equiv="refresh"/.test(del) && /<main\b/.test(del) && /PetLog/.test(del), `${lang} PetLog account deletion page`);
    for (const p of ["privacy", "terms"]) assert.ok(exists(`${lang}/${p}/index.html`), `${lang}/${p}`);
    assert.match(read(`${lang}/contact/index.html`), /<option value="petlog"[^>]*>PETLOG<\/option>/, `${lang} contact form keeps PETLOG`);
  }
});

test("three core platforms on the home, About and Business pages (ko / en)", () => {
  const ko = read("ko/index.html");
  assert.match(ko, /세 개의 플랫폼\.<br \/>하나의 Newon\./);
  assert.ok(!/id="np-row-petlog"|data-np-id="petlog"|>PETLOG<\/h3>/.test(ko), "no PETLOG platform row on the KO home");
  assert.match(read("en/index.html"), /THREE CORE PLATFORMS/);
  for (const lang of ["ko", "en"]) {
    const about = read(`${lang}/about/index.html`);
    assert.ok(!about.includes("PETLOG — Pet Life"), `${lang} About has no PETLOG platform card`);
    const biz = read(`${lang}/business/platforms/index.html`);
    assert.ok(!biz.includes('id="platform-petlog"'), `${lang} Our Platforms has no PETLOG`);
  }
});
