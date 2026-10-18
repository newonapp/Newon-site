/**
 * Regression tests for the PETLOG business website (/{lang}/petlog/…), Oct 2026.
 * Run: node --test tests/site/petlog-site.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PETLOG_SITE_PATHS } from "../../scripts/render-petlog-site.mjs";
import { NOTICE, PLATFORM, BUSINESS, CONTACT } from "../../scripts/petlog-site-content.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const main = (html) => html.slice(html.indexOf('<section id="lifestage-detail"') >= 0 ? html.indexOf('<section id="lifestage-detail"') : html.indexOf('<section lang="en" id="lifestage-detail"'), html.lastIndexOf("</section>"));

test("five PETLOG pages exist in all nine locales with SEO basics", () => {
  assert.deepEqual(PETLOG_SITE_PATHS, ["petlog", "petlog/platform", "petlog/business", "petlog/partnerships", "petlog/contact"]);
  for (const lang of LANGS) {
    for (const p of PETLOG_SITE_PATHS) {
      const html = read(`${lang}/${p}/index.html`);
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${lang}/${p} h1`);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.newon\\.app/${lang}/${p}/"`));
      assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 10, `${lang}/${p} hreflang`);
      assert.match(html, /property="og:title"/);
      for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
      assert.ok(html.includes("/home-lifestage.css"), "Life Stage design");
    }
  }
});

test("section counts follow the V2 plan: 6 journey stages, 18 services, 20 business areas in 6 groups, 14 partner types, 12 inquiry types", () => {
  const count = (html, re) => (main(html).match(re) || []).length;
  for (const lang of ["ko", "en"]) {
    assert.equal(count(read(`${lang}/petlog/index.html`), /data-nls-decade-card=/g), 6, `${lang} journey`);
    assert.equal(count(read(`${lang}/petlog/platform/index.html`), /<article class="nls-(?:board|signal)__item" id="[a-z-]+"/g), 18, `${lang} services`);
    const biz = read(`${lang}/petlog/business/index.html`);
    assert.equal(count(biz, /<article class="nls-(?:board|signal)__item" id="line-\d\d"/g), 20, `${lang} business areas`);
    assert.equal(count(biz, /data-nls-decade-card=/g), 6, `${lang} business groups`);
    assert.equal(count(read(`${lang}/petlog/partnerships/index.html`), /<article class="nls-board__item" id="partner-\d\d"/g), 14, `${lang} partners`);
    const sel = read(`${lang}/petlog/contact/index.html`).match(/<select id="bz-type"[\s\S]*?<\/select>/)[0];
    assert.equal((sel.match(/<option value="[^"]+"/g) || []).length, 12, `${lang} inquiry types`);
  }
  assert.deepEqual(BUSINESS.groups.flatMap((g) => g.lines), BUSINESS.lines.map((l) => l.no), "every area is in exactly one group, in order");
  assert.equal(PLATFORM.items.length, 18);
});

test("no unconfirmed price or fee; no per-card status badge; one shared notice; only shipped features marked as in the app", () => {
  for (const lang of ["ko", "en"]) {
    for (const p of PETLOG_SITE_PATHS) {
      const html = main(read(`${lang}/${p}/index.html`));
      const text = html.replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
      assert.doesNotMatch(text, /₩|원\s*\/|[0-9]+\s*~\s*[0-9]+\s*%|[0-9]+\s*%|9,900|99,000|29,000|3,900|19,900/, `${lang}/${p} shows a price or rate`);
      assert.doesNotMatch(text, /연동 완료|integration is complete|계약 체결 완료|official partner of/i, `${lang}/${p} overclaim`);
      assert.doesNotMatch(html, /class="nls-status"/, `${lang}/${p} still renders a status badge`);
      assert.doesNotMatch(text, /검토 중|출시 일정 미정|기관 협력 확인 전|스토어 소개 기준/, `${lang}/${p} repeated status wording`);
    }
    for (const p of ["petlog", "petlog/platform", "petlog/business"]) {
      const html = main(read(`${lang}/${p}/index.html`));
      assert.equal(html.split(NOTICE[lang]).length - 1, 1, `${lang}/${p} carries the shared notice once`);
    }
  }
  assert.deepEqual(PLATFORM.items.filter((x) => x.status === "app").map((x) => x.label), ["Pet Profile", "Daily Life Log", "Health Records", "Vaccination & Medication", "Family Sharing", "App & Accessibility"]);
});

test("contact type links match the inquiry form options (preselected by the ?type= script)", () => {
  for (const lang of LANGS) {
    for (const p of PETLOG_SITE_PATHS) {
      const html = read(`${lang}/${p}/index.html`);
      const links = [...html.matchAll(/petlog\/contact\/\?type=([a-z-]+)/g)].map((m) => m[1]);
      const opts = new Set(CONTACT.en.types.map(([k]) => k));
      for (const t of links) assert.ok(opts.has(t), `${lang}/${p} links to unknown type ${t}`);
    }
    const c = read(`${lang}/petlog/contact/index.html`);
    assert.match(c, /var t = p\.get\("type"\);/);
  }
  assert.deepEqual(CONTACT.ko.types.map(([k]) => k), CONTACT.en.types.map(([k]) => k));
});

test("other locales show the English body: no Korean inside the PETLOG content of ja/es/pt-br/fr/de/hi/id", () => {
  for (const lang of LANGS.filter((l) => l !== "ko" && l !== "en")) {
    for (const p of PETLOG_SITE_PATHS) {
      const html = read(`${lang}/${p}/index.html`);
      const body = html.slice(html.indexOf('<section lang="en" id="lifestage-detail"'), html.indexOf("</main>") > 0 ? html.indexOf("</main>") : undefined);
      assert.ok(body.length > 1000, `${lang}/${p} body`);
      assert.doesNotMatch(body.replace(/<script[\s\S]*?<\/script>/g, ""), /[가-힣]/, `${lang}/${p} leaks Korean`);
    }
  }
});

test("JSON-LD does not declare future businesses as offered services", () => {
  for (const lang of LANGS) {
    for (const p of PETLOG_SITE_PATHS) {
      for (const m of read(`${lang}/${p}/index.html`).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        const j = JSON.parse(m[1]);
        assert.ok(!("hasOfferCatalog" in j) && !("offers" in j) && j["@type"] !== "Service", `${lang}/${p} ld+json offers`);
      }
    }
  }
});

test("no app feature on the web: only the shared Newon inquiry form, no login/order/payment/booking forms", () => {
  for (const lang of LANGS) {
    for (const p of PETLOG_SITE_PATHS) {
      const html = read(`${lang}/${p}/index.html`);
      const forms = html.match(/<form[\s\S]*?>/g) || [];
      if (p === "petlog/contact") {
        assert.equal(forms.length, 1);
        assert.ok(html.includes("/business/inquiry.js"));
        assert.match(html, /name="interest" value="PETLOG"/);
        assert.match(html, /name="_honey"/);
        assert.match(html, /name="consent" type="checkbox" value="yes" required/);
      } else {
        assert.equal(forms.length, 0, `${lang}/${p} must not contain a form`);
      }
      assert.doesNotMatch(html, /type="password"|name="card|data-checkout|data-booking-submit/);
    }
  }
});

test("business row: PETLOG has its own 5-item menu on every page header", () => {
  for (const rel of ["ko/index.html", "en/petlog/index.html", "ja/portfolio/petlog/index.html", "de/partnerships/index.html", "id/livon/index.html"]) {
    const h = read(rel).match(/<header class="gnav[\s\S]*?<\/header>/)[0];
    assert.match(h, /data-gnav-menu="petlog"/, rel);
    const panel = h.match(/data-gnav-mega="petlog"[\s\S]*?<p class="gnav-mega__foot">/)[0];
    assert.equal((panel.match(/class="gnav-mega__row"/g) || []).length, 5, rel);
  }
});

test("sitemap lists the PETLOG pages once each", () => {
  const xml = read("sitemap.xml");
  for (const lang of LANGS) for (const p of PETLOG_SITE_PATHS) assert.equal(xml.split(`<loc>https://www.newon.app/${lang}/${p}/</loc>`).length - 1, 1);
});
