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

test("section counts follow the V3 plan: 6 journey stages, 26 platform areas, 12 revenue models in 5 groups, 15 partner types, 12 inquiry types", () => {
  const count = (html, re) => (main(html).match(re) || []).length;
  for (const lang of ["ko", "en"]) {
    // v5 (owner 2026-10-27): the six stages are always visible as one lifeline (no one-at-a-time tab rail)
    assert.equal(count(read(`${lang}/petlog/index.html`), /data-pl-stage=/g), 6, `${lang} journey`);
    const plat = read(`${lang}/petlog/platform/index.html`);
    assert.equal(count(plat, /<article class="pl-[a-z -]+" id="petlog-[a-z-]+"/g), 26, `${lang} platform areas`);
    assert.equal(count(plat, /<details>/g), PLATFORM.meta[lang].faq.items.length, `${lang} faq`);
    const biz = read(`${lang}/petlog/business/index.html`);
    assert.equal(count(biz, /<article class="pl-[a-z -]+" id="line-\d\d"/g), 12, `${lang} revenue models`);
    assert.equal(count(biz, /data-pl-group=/g), 5, `${lang} revenue groups`);
    // every revenue model is linked from the revenue map
    for (const l of BUSINESS.lines) assert.ok(main(biz).includes(`href="#line-${l.no}"`), `${lang} map links line ${l.no}`);
    assert.equal(count(read(`${lang}/petlog/partnerships/index.html`), /<article class="pl-[a-z -]+" id="partner-\d\d"/g), 15, `${lang} partners`);
    // Contact (owner 2026-10-26, ONGIL-style kit): the 12 inquiry types are rows, each with one "문의하기"
    const types = read(`${lang}/petlog/contact/index.html`).split('id="bct-types"')[1].split("</section>")[0];
    assert.equal((types.match(/class="bct-tlist__go"/g) || []).length, 12, `${lang} inquiry types`);
  }
  assert.deepEqual(BUSINESS.groups.flatMap((g) => g.lines).sort(), BUSINESS.lines.map((l) => l.no), "every revenue model is in exactly one group");
  assert.equal(PLATFORM.items.length, 26);
  for (const lang of ["ko", "en"]) {
    // 2026-11-04: the overview ledger groups the 26 areas (no status rows); every area once, and the one
    // "in the app today" row holds exactly the areas whose basics are in the released app
    const legend = PLATFORM.meta[lang].legend;
    assert.deepEqual(legend.flatMap((p) => p.areas).sort(), PLATFORM.items.map((_, i) => String(i + 1).padStart(2, "0")), `${lang} legend covers 26 areas once`);
    assert.deepEqual(legend.find((p) => p.kind === "now").areas.map((no) => PLATFORM.items[Number(no) - 1].status), ["app", "app", "app", "app", "app"], `${lang} legend now row`);
    assert.equal(legend.filter((p) => p.kind === "now").length, 1);
  }
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
      // 2026-11-04 refresh: no status labels, status columns/filters, internal roadmap or unconfirmed plan names
      assert.doesNotMatch(text, /개발 중|개발 예정|검토 단계|향후 계획|서비스 준비 중|출시 준비 중|In development|Under review|\bP[0-8]\b|AI Pro|Starter|Enterprise/, `${lang}/${p} status label or internal roadmap`);
      assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ""), /data-pl-filter|data-status=/, `${lang}/${p} status filter`);
    }
    for (const p of ["petlog", "petlog/platform", "petlog/business"]) {
      const html = main(read(`${lang}/${p}/index.html`));
      assert.equal(html.split(NOTICE[lang]).length - 1, 1, `${lang}/${p} carries the shared notice once`);
    }
  }
  assert.deepEqual(PLATFORM.items.filter((x) => x.status === "app").map((x) => x.label), ["PETLOG Profile", "PETLOG Health", "PETLOG Life", "PETLOG Calendar", "PETLOG Note"]);
  assert.deepEqual(BUSINESS.lines.filter((x) => x.status === "now").map((x) => x.no), ["01"], "only the store-listed subscription is shown as available now");
});

test("2026-11-04 content refresh: hero counts, five target tabs, pet jobs inside area 08, protection group", () => {
  const plat = { ko: main(read("ko/petlog/platform/index.html")), en: main(read("en/petlog/platform/index.html")) };
  assert.match(read("ko/petlog/platform/index.html"), /26개 영역 보기/);
  assert.match(read("en/petlog/platform/index.html"), /See 26 areas/);
  assert.match(read("ko/petlog/business/index.html"), /12개 수익 모델 보기/);
  assert.match(read("en/petlog/business/index.html"), /See 12 revenue models/);
  for (const lang of LANGS) {
    const pl = read(`${lang}/petlog/platform/index.html`);
    const bz = read(`${lang}/petlog/business/index.html`);
    assert.doesNotMatch(pl, /18개 서비스|See 18 services/, `${lang} platform hero`);
    assert.doesNotMatch(bz, /20개 사업 분야|See 20 areas/, `${lang} business hero`);
  }
  // target app structure: Home · Records · Care · Community · Market + My Page (top right), never "applied today"
  const tabs = (h) => [...h.matchAll(/class="pl-tabbtn[^"]*">\s*<span class="pl-n">\d\d<\/span><span class="pl-tabbtn__t"><strong>([^<]+)<\/strong>/g)].map((m) => m[1]);
  assert.deepEqual(tabs(plat.ko), ["홈", "기록", "케어", "커뮤니티", "마켓"]);
  assert.deepEqual(tabs(plat.en), ["Home", "Records", "Care", "Community", "Market"]);
  assert.match(plat.ko, /마이페이지/);
  assert.match(plat.en, /My Page/);
  // pet jobs (알바) live in area 08 Care and are told apart from booking a business
  assert.equal(PLATFORM.items.length, 26);
  assert.match(PLATFORM.items[7].lead.ko, /반려동물 알바/);
  assert.match(PLATFORM.items[7].lead.ko, /업무 종류·가격·날짜·시간·장소·모집 인원·조건/);
  assert.match(PLATFORM.items[7].lead.ko, /전문 업체 예약과는 별도로/);
  assert.match(PLATFORM.items[7].lead.en, /pet jobs/);
  assert.equal(PLATFORM.meta.ko.groups[4].title, "보호·입양·추모");
  assert.deepEqual(PLATFORM.meta.ko.groups[4].items, [20, 21, 22, 23, 24, 25]);
});

test("inquiry links open the unified Contact page with PETLOG and a valid type (no old ?type= shortcuts)", () => {
  // owner 2026-10-26: every inquiry button → /{lang}/contact/?platform=petlog&type=…&source=petlog-<page>
  const TYPES = ["personal", "business", "public", "partnership", "investment", "media"];
  for (const lang of LANGS) {
    for (const p of PETLOG_SITE_PATHS) {
      const html = read(`${lang}/${p}/index.html`);
      assert.doesNotMatch(main(html), /petlog\/contact\/\?type=|business\/(?:inquiry|contact)\//, `${lang}/${p} old inquiry links`);
      const page = p.split("/")[1] || "overview";
      for (const m of main(html).matchAll(/href="(\/[a-z-]+\/contact\/\?[^"]*)"/g)) {
        const u = new URL(m[1].replace(/&amp;/g, "&"), "https://www.newon.app");
        assert.equal(u.pathname, `/${lang}/contact/`);
        assert.equal(u.searchParams.get("platform"), "petlog");
        assert.ok(TYPES.includes(u.searchParams.get("type")), `${lang}/${p} ${m[1]}`);
        assert.equal(u.searchParams.get("source"), `petlog-${page}`);
      }
    }
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

test("no app feature on the web: no forms at all (inquiries go to the unified Contact page), no login/order/payment/booking forms", () => {
  for (const lang of LANGS) {
    for (const p of PETLOG_SITE_PATHS) {
      const html = read(`${lang}/${p}/index.html`);
      const forms = html.match(/<form[\s\S]*?>/g) || [];
      // owner 2026-10-26: the Contact page no longer embeds a form — the unified /{lang}/contact/ page is the form
      assert.equal(forms.length, 0, `${lang}/${p} must not contain a form`);
      assert.ok(!html.includes("/business/inquiry.js"), `${lang}/${p} no inquiry form script`);
      assert.doesNotMatch(html, /type="password"|name="card|data-checkout|data-booking-submit/);
    }
  }
});

test("business row: PETLOG has its own 5-item menu on every page header", () => {
  for (const rel of ["ko/index.html", "en/petlog/index.html", "ja/portfolio/petlog/index.html", "de/business/partnerships/index.html", "id/shareon/index.html"]) {
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
