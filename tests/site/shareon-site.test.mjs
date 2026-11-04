/**
 * Regression tests for the SHAREON business website (/{lang}/shareon/…), V3 content (Oct 2026).
 * Run: node --test tests/site/shareon-site.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SHAREON_PAGES, KO, EN, EXCLUDED_BUSINESS_TERMS } from "../../scripts/shareon-copy.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const FALLBACK = LANGS.filter((l) => l !== "ko" && l !== "en");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
/** SHAREON's own markup: film hero + sub-menu + body (shared header/footer excluded). */
const own = (html) => {
  const end = html.indexOf("</main>");
  return html.slice(html.indexOf('<section id="lifestage-detail"'), end > 0 ? end : undefined);
};
const text = (html) => own(html).replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");

test("five SHAREON pages exist in all nine locales with SEO basics", () => {
  assert.deepEqual(SHAREON_PAGES.map((p) => p.path), ["shareon", "shareon/platform", "shareon/business", "shareon/partnerships", "shareon/contact"]);
  for (const lang of LANGS) {
    for (const p of SHAREON_PAGES) {
      const html = read(`${lang}/${p.path}/index.html`);
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${lang}/${p.path} h1`);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.newon\\.app/${lang}/${p.path}/"`));
      assert.ok((html.match(/rel="alternate" hreflang=/g) || []).length >= 9, `${lang}/${p.path} hreflang`);
      assert.match(html, /property="og:title"/);
      assert.match(html, /<meta name="description" content="[^"]{20,}"/);
      assert.ok(html.includes("/shareon.css"), "SHAREON styles kept");
    }
  }
});

test("structure follows the 2026-11-04 refresh: goods fields, 7 space groups with 35 categories, 4 trade types, 6-step flow, 10 partner types, 11 inquiry types", () => {
  const SPACE35 = [
    "회의·비즈니스", "사무실·공유오피스", "교육·강의·연수", "전시·갤러리", "팝업스토어·쇼룸", "매장·상업시설", "컨벤션·대형 행사",
    "사진·영상 촬영", "방송·녹음·제작", "음악·댄스 연습", "공연·극장", "영화·상영", "공방·창작", "독서·문화모임",
    "파티·프라이빗 모임", "카페·라운지", "레스토랑·다이닝", "공유주방·쿠킹", "웨딩·가족행사", "루프탑·테라스·정원",
    "실내 스포츠", "야외 스포츠·레저", "피트니스·웰니스", "뷰티·미용", "반려동물 공간",
    "독채·숙박·워크숍", "한옥·전통문화", "단기 주거·생활",
    "창고·보관", "작업장·산업시설", "물류·상하차", "주차·차고",
    "캠핑·야외 부지", "농업·원예 공간", "연구·실험·특수시설",
  ];
  for (const c of [KO, EN]) {
    assert.deepEqual(c.trades.map((t) => t.en), ["C2C", "B2C", "C2B", "B2B"]);
    const spaces = c.platform.services.filter((s) => s.g === "c");
    assert.equal(spaces.length, 7, "seven space groups");
    assert.equal(spaces.flatMap((s) => s.chips).length, 35, "35 space categories");
    assert.equal(c.partnerships.types.items.length, 10);
    assert.equal(c.contact.items.length, 11);
    assert.equal(c.platform.flow.steps.length, 6);
    assert.ok(c.platform.flow.steps.every((s) => !s.off), "no step is marked as not operating");
    assert.equal(new Set(c.platform.services.map((s) => s.n)).size, c.platform.services.length);
    for (const gone of ["status", "glance"]) assert.ok(!(gone in c.overview), `overview.${gone}`);
    for (const gone of ["status"]) assert.ok(!(gone in c.platform), `platform.${gone}`);
    for (const gone of ["models", "subs", "calc", "small", "payment", "roadmap", "glance"]) assert.ok(!(gone in c.business), `business.${gone}`);
  }
  assert.deepEqual(KO.platform.services.filter((s) => s.g === "c").flatMap((s) => s.chips), SPACE35, "space taxonomy (S13 final, 2026-11-02)");
  // the owner-confirmed goods fields all appear in the Korean platform copy
  const plat = JSON.stringify(KO.platform.services);
  for (const f of ["생활", "가전", "디지털·IT", "촬영", "스포츠·레저", "캠핑", "여행", "육아", "반려동물", "의료·재활", "시니어", "가구·인테리어", "사무·OA", "교육", "청소", "주방", "미용", "헬스", "패션·명품", "행사·공연", "산업·건설", "물류", "농업", "연구"]) assert.ok(plat.includes(f), f);
  const ko = (p) => read(`ko/${p}/index.html`);
  assert.equal((ko("shareon/platform").match(/id="svc-\d\d"/g) || []).length, KO.platform.services.length);
  assert.equal((ko("shareon/partnerships").match(/class="nsh-dir__row"/g) || []).length, 10);
  // Contact (owner 2026-10-26, ONGIL-style kit): the 11 inquiry types are rows with one "문의하기" each
  assert.equal((ko("shareon/contact").split('id="bct-types"')[1].split("</section>")[0].match(/class="bct-tlist__go"/g) || []).length, 11);
  assert.equal((ko("shareon/platform").match(/class="nsh-track__step is-off"/g) || []).length, 0);
  // inquiry types separate usage/joining from partner/institution/external inquiries, incl. press and investment
  const groups = KO.contact.items.map((it) => it.g);
  assert.deepEqual([...new Set(groups)], ["trade", "partner"]);
  assert.ok(KO.contact.items.some((it) => it.slug === "media") && KO.contact.items.some((it) => it.slug === "investment"));
});

test("no per-card status badges; exactly one shared neutral notice per page; no launch / development status", () => {
  for (const lang of LANGS) {
    for (const p of SHAREON_PAGES) {
      const html = read(`${lang}/${p.path}/index.html`);
      assert.equal((html.match(/class="nsh-badge/g) || []).length, 0, `${lang}/${p.path} badges`);
      assert.equal((html.match(/class="nsh-status__note"/g) || []).length, 1, `${lang}/${p.path} notice`);
      assert.doesNotMatch(html, /class="nsh-phase__col|nsh-table--state|data-nsh-calc|class="nsh-biz__item"/, `${lang}/${p.path} status board, calculator or revenue-model tabs`);
    }
  }
  assert.equal(KO.statusNote, "SHAREON의 서비스 이용은 모바일 앱을 통해 이루어지며, 본 웹사이트에서는 예약 및 결제 기능을 제공하지 않습니다.");
  for (const lang of ["ko", "en"]) {
    for (const p of SHAREON_PAGES) {
      const t = text(read(`${lang}/${p.path}/index.html`));
      assert.doesNotMatch(t, /개발 중|개발 예정|출시 준비|출시 전|미출시|출시되지|출시 일정|준비 중|검토 단계|향후 계획|개발 환경|추가 개발|설계 단계|꺼져 있|P[0-7]\b|in development|not launched|has not launched|in preparation|launch is being|under review|future plan|not operating|switched off/i, `${lang}/${p.path} status wording`);
      assert.doesNotMatch(t, /동네|이웃 간|한 동네|세 카테고리|18개|열여덟|14개 (핵심 )?사업군|neighbourhood|neighborhood|eighteen|18 (business )?areas/i, `${lang}/${p.path} old structure`);
      assert.doesNotMatch(t, /계약을 맺은 파트너사는 없습니다|계약한 파트너사는 없습니다|no contracted partners|no partners under contract/i, `${lang}/${p.path} contract status`);
    }
  }
});

test("no fee rates, fee calculation, PG cost, prices or currency amounts are shown", () => {
  for (const lang of LANGS) {
    for (const p of SHAREON_PAGES) {
      const t = text(read(`${lang}/${p.path}/index.html`));
      assert.doesNotMatch(t, /\d\s*%/, `${lang}/${p.path} percent`);
      assert.doesNotMatch(t, /₩\s*\d|\d\s*₩|\d\s*원\b/, `${lang}/${p.path} won`);
      assert.doesNotMatch(t, /9,900|29,900|99,000/, `${lang}/${p.path} subscription prices`);
      assert.doesNotMatch(t, /\d+\s*(일|시간|분|days?|hours?|minutes?)\b.{0,12}(전|이내|기준|before|within)/i, `${lang}/${p.path} policy time limit`);
    }
  }
  for (const lang of ["ko", "en"]) {
    for (const p of SHAREON_PAGES) {
      const t = text(read(`${lang}/${p.path}/index.html`));
      assert.doesNotMatch(t, /수수료율|요율|결제대행 수수료|지급대행 비용|최소 수수료|fee rate|commission rate|PG fee|payout cost|minimum fee/i, `${lang}/${p.path} fee detail`);
    }
  }
});

test("fallback locales show no Korean and English locales keep EN body", () => {
  for (const lang of [...FALLBACK, "en"]) {
    for (const p of SHAREON_PAGES) {
      const t = text(read(`${lang}/${p.path}/index.html`));
      assert.doesNotMatch(t, /[가-힣]/, `${lang}/${p.path} has Korean`);
    }
  }
  for (const lang of FALLBACK) assert.match(read(`${lang}/shareon/index.html`), /<div id="shareon-detail"[^>]*lang="en"/);
});

test("no claims that future infrastructure is offered; excluded areas stay off the pages", () => {
  for (const lang of LANGS) {
    for (const p of SHAREON_PAGES) {
      const html = read(`${lang}/${p.path}/index.html`);
      for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        const j = JSON.stringify(JSON.parse(m[1]));
        assert.doesNotMatch(j, /"offers"|PaymentService|InsuranceAgency|"priceSpecification"/, `${lang}/${p.path} JSON-LD`);
      }
    }
  }
  for (const [lang, terms] of [["ko", EXCLUDED_BUSINESS_TERMS.ko], ["en", EXCLUDED_BUSINESS_TERMS.en]]) {
    for (const p of SHAREON_PAGES) {
      const t = text(read(`${lang}/${p.path}/index.html`));
      for (const term of terms) assert.ok(!t.includes(term), `${lang}/${p.path} mentions ${term}`);
    }
  }
  // the website never offers booking or payment (one neutral sentence instead of a status)
  const ko = text(read("ko/shareon/platform/index.html"));
  assert.ok(ko.includes("본 웹사이트에서는 예약 및 결제 기능을 제공하지 않습니다"));
});

test("inquiry links open the unified Contact page (platform + type + source) and internal links resolve", () => {
  for (const lang of ["ko", "en"]) {
    for (const p of SHAREON_PAGES) {
      const html = own(read(`${lang}/${p.path}/index.html`));
      for (const m of html.matchAll(/href="(\/[^"#?]*)(\?[^"#]*)?(#[^"]*)?"/g)) {
        const rel = m[1].replace(/^\//, "");
        const file = rel.endsWith("/") || rel === "" ? path.join(rel, "index.html") : rel;
        assert.ok(fs.existsSync(path.join(ROOT, file)), `${lang}/${p.path} → ${m[1]}`);
        // owner 2026-10-26: every inquiry button opens the unified Contact page with SHAREON and a valid type
        assert.ok(!/\/business\/(?:contact|inquiry)\/$/.test(m[1]), `${lang}/${p.path} old inquiry form link ${m[1]}`);
        if (m[1] === `/${lang}/contact/` && m[2]) {
          const q = new URLSearchParams(m[2].slice(1).replace(/&amp;/g, "&"));
          assert.equal(q.get("platform"), "shareon");
          assert.ok(["personal", "business", "public", "partnership", "investment", "media"].includes(q.get("type")), q.get("type"));
          assert.match(q.get("source") || "", /^shareon-(overview|platform|business|partnerships|contact)$/);
        }
      }
      for (const m of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${m[1]}"`), `${lang}/${p.path} anchor #${m[1]}`);
      for (const m of html.matchAll(/href="mailto:([^"?]+)/g)) assert.equal(m[1], "newon@newon.app");
    }
  }
});
