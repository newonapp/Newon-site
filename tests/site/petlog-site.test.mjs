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

test("section counts: 6 journey stages, 16 platform areas, 8 + 16 business, 12 partner types, 9 inquiry types", () => {
  const count = (html, re) => (main(html).match(re) || []).length;
  assert.equal(count(read("ko/petlog/index.html"), /data-nls-decade-card=/g), 6);
  assert.equal(count(read("ko/petlog/platform/index.html"), /class="nls-board__item"/g), 16);
  const biz = read("ko/petlog/business/index.html");
  assert.equal((biz.match(/<ol class="nls-index">[\s\S]*?<\/ol>/)[0].match(/<li>/g) || []).length, 8);
  assert.equal(count(biz, /class="nls-board__item"/g), 16);
  assert.equal(count(read("ko/petlog/partnerships/index.html"), /class="nls-board__item"/g), 12);
  const contact = read("ko/petlog/contact/index.html");
  const sel = contact.match(/<select id="bz-type"[\s\S]*?<\/select>/)[0];
  assert.equal((sel.match(/<option value="[^"]+"/g) || []).length, 9);
});

test("no unconfirmed price or fee is published; every service and business line carries a status", () => {
  for (const lang of ["ko", "en"]) {
    for (const p of PETLOG_SITE_PATHS) {
      const text = main(read(`${lang}/${p}/index.html`)).replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
      assert.doesNotMatch(text, /₩|원\s*\/|[0-9]+\s*~\s*[0-9]+\s*%|[0-9]+\s*%|9,900|99,000|29,000|3,900|19,900/, `${lang}/${p} shows a price or rate`);
      assert.doesNotMatch(text, /연동 완료|integration is complete|계약 체결 완료|official partner of/i, `${lang}/${p} overclaim`);
    }
    const plat = read(`${lang}/petlog/platform/index.html`);
    assert.equal((plat.match(/class="nls-status" data-status=/g) || []).length, 16);
    const biz = read(`${lang}/petlog/business/index.html`);
    assert.equal((biz.match(/class="nls-status" data-status=/g) || []).length, 16);
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
  for (const rel of ["ko/index.html", "en/petlog/index.html", "ja/portfolio/petlog/index.html", "de/partnerships/index.html", "id/lifestage/index.html"]) {
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
