/**
 * /{lang}/business/inquiry/ — Business Inquiry (2026-10 owner brief: six-platform business · partnership inquiries).
 * Run: node --test tests/site/business-inquiry.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { INQ_TYPES, INQ_PLATFORMS, INQ_PLATFORM_EXTRA, inquiryTypeAliasMap } from "../../scripts/business-inquiry-copy.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const page = (lang) => read(`${lang}/business/inquiry/index.html`);
const main = (html) => (html.match(/<main\b[\s\S]*?<\/main>/) || [""])[0];
const text = (html) => main(html).replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
const form = (html) => (html.match(/<form[\s\S]*?id="bz-inquiry-form"[\s\S]*?<\/form>/) || [""])[0];
const selectOptions = (html, id) => {
  const sel = (html.match(new RegExp(`<select id="${id}"[\\s\\S]*?<\\/select>`)) || [""])[0];
  return [...sel.matchAll(/<option value="([^"]*)"([^>]*)>/g)].map((m) => ({ value: m[1], attrs: m[2] }));
};

test("nine locales: one h1, canonical, hreflang, JSON-LD, eight sections in brief order", () => {
  for (const lang of LANGS) {
    const html = page(lang);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${lang} one h1`);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.newon\\.app/${lang}/business/inquiry/"`));
    assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 10, `${lang} hreflang`);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
    assert.ok(!/\{\{/.test(html), `${lang} unreplaced placeholder`);
    const ids = [...main(html).matchAll(/<section(?: id="([^"]*)")? class="(bz-[^"]*)"/g)].map((m) => m[1] || m[2].split(" ")[0]);
    assert.deepEqual(ids, ["bz-hero", "categories", "platforms", "who", "how-we-work", "inquiry", "faq", "contact"], `${lang} sections`);
  }
});

test("hero keeps the existing markup and design classes", () => {
  const html = page("ko");
  for (const cls of ["bz-hero bz-hero--hq", "bz-hero__eyebrow", "bz-hero__word", "bz-hero__title", "bz-hero__lead", "bz-hero__domains", "bz-hero__visual", "bz-sv__card"]) {
    assert.ok(html.includes(cls), `hero ${cls}`);
  }
  assert.match(html, /BUSINESS INQUIRY/);
  assert.match(html, /새로운 비즈니스의<br \/>가능성을 연결합니다\./);
  assert.match(html, /<a class="btn btn-primary" href="#inquiry">사업 문의하기/);
});

test("form: required/optional fields, inquiry types and platform options per brief", () => {
  for (const lang of LANGS) {
    const f = form(page(lang));
    for (const name of ["name", "email", "type", "message", "consent"]) {
      assert.match(f, new RegExp(`name="${name}"[^>]*\\brequired\\b`), `${lang} ${name} required`);
    }
    for (const name of ["company", "phone", "platform", "website"]) {
      const tag = (f.match(new RegExp(`<(?:input|select)[^>]*name="${name}"[^>]*>`)) || [""])[0];
      assert.ok(tag, `${lang} ${name} present`);
      assert.ok(!/\brequired\b/.test(tag), `${lang} ${name} optional`);
    }
    for (const gone of ["budget", "stage", "timeline"]) assert.ok(!new RegExp(`name="${gone}"`).test(f), `${lang} ${gone} removed`);
    assert.ok(f.includes('name="_honey"'), `${lang} honeypot kept`);
    const types = selectOptions(f, "bz-type").filter((o) => o.value && !/data-store-option/.test(o.attrs)).map((o) => o.value);
    assert.deepEqual(types, INQ_TYPES.map((t) => t.value.replace(/&/g, "&amp;")), `${lang} inquiry types`);
    const store = selectOptions(f, "bz-type").find((o) => /data-store-option/.test(o.attrs));
    assert.ok(store && /\bhidden\b/.test(store.attrs) && /\bdisabled\b/.test(store.attrs), `${lang} store option only for store inflow`);
    const plats = selectOptions(f, "bz-platform").filter((o) => o.value).map((o) => o.value);
    assert.deepEqual(plats, [...INQ_PLATFORMS, ...INQ_PLATFORM_EXTRA].map((p) => p.value), `${lang} platforms`);
    assert.ok(page(lang).includes('<script src="/business/inquiry.js'), `${lang} submit script kept`);
  }
  const ko = page("ko");
  for (const label of ["플랫폼 입점 및 거래 참여", "브랜드·서비스·콘텐츠 제휴", "기업용 서비스 도입", "공공기관·단체 협력", "기술·글로벌 파트너십", "기타 사업 문의", "복수 플랫폼", "아직 정하지 않음"]) {
    assert.ok(form(ko).includes(label), `ko option ${label}`);
  }
  assert.match(form(ko), /수집 목적:[\s\S]*수집 항목:[\s\S]*보유 기간:/, "privacy purpose / items / retention");
});

test("no outsourcing, quote, budget, timeline or package content remains", () => {
  const ko = text(page("ko"));
  for (const bad of ["예산", "희망 일정", "프로젝트 패키지", "견적을", "MVP", "랜딩페이지 제작", "Studio /", "개발 협업", "프로젝트 유형"]) {
    assert.ok(!ko.includes(bad), `ko still contains ${bad}`);
  }
  const en = text(page("en"));
  for (const bad of ["Budget", "Timeline", "Packages", "Landing Page", "Product MVP", "Studio /", "Development collaboration"]) {
    assert.ok(!en.includes(bad), `en still contains ${bad}`);
  }
  assert.ok(!/bz-pkg|bz-budget|bz-timeline|bz-stage/.test(main(page("ko"))), "removed form/package markup");
});

test("platform cards link to each platform's business page; FAQ has 8 items ending with the outsourcing answer", () => {
  for (const lang of LANGS) {
    const html = page(lang);
    for (const p of INQ_PLATFORMS) {
      assert.ok(html.includes(`href="../../${p.href}"`), `${lang} ${p.id} link`);
      assert.ok(fs.existsSync(path.join(ROOT, lang, p.href, "index.html")), `${lang}/${p.href} exists`);
    }
    assert.equal((html.match(/class="bz-faq-item"/g) || []).length, 8, `${lang} 8 FAQ`);
    assert.ok(html.includes('href="mailto:newon@newon.app"'), `${lang} direct email`);
  }
  const ko = text(page("ko"));
  assert.match(ko, /외주 웹·앱 제작도 의뢰할 수 있나요\? 아니요\. NEWON은 고객별 외주 웹·앱 제작/);
  assert.ok(!/\b0\d{1,2}-\d{3,4}-\d{4}\b/.test(ko), "no phone number");
});

test("Korean and English written; other locales fall back to English with lang=\"en\" on <main>", () => {
  assert.ok(!/<main[^>]*lang=/.test(page("ko")));
  assert.ok(!/<main[^>]*lang=/.test(page("en")));
  assert.match(text(page("en")), /Connecting new business possibilities\./);
  for (const lang of LANGS.filter((l) => l !== "ko" && l !== "en")) {
    assert.match(page(lang), /<main id="business-main" class="bz-page" lang="en" data-bm-owner-copy="1">/, `${lang} fallback lang`);
  }
});

test("legacy ?type= values still preselect a valid type; outsourcing values do not", () => {
  const map = inquiryTypeAliasMap();
  const values = new Set(INQ_TYPES.map((t) => t.value));
  for (const k of ["partnership", "ai-automation", "product-adoption", "Other"]) assert.ok(values.has(map[k]), k);
  for (const k of ["Design", "development-collaboration", "Studio / Web Design", "web", "mvp"]) assert.equal(map[k], undefined, k);
});
