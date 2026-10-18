// LIVON corporate site (/{lang}/livon/ + 4 sub pages): structure, content counts, honesty rules, SEO and links.
// Run: node scripts/render-lifestage.mjs && node --test tests/livon-site/*.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LIVON_SITE_PAGES, CATEGORIES, GROUPS, categoryStatus, LIFE_EVENTS, CORE_FEATURES, BUSINESS,
  PARTNERS, CONTACT_TYPES, COPY, REVENUE, ROADMAP,
} from "../../scripts/livon-site-data.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const page = (lang, id) => read(`${lang}/livon/${LIVON_SITE_PAGES.find((p) => p.id === id).path}index.html`);
const count = (s, re) => (s.match(re) || []).length;
const life = JSON.parse(read("livon/life-topics.json"));

test("5 top menus, in order, on every page of every language, current page marked", () => {
  assert.deepEqual(LIVON_SITE_PAGES.map((p) => p.en), ["Overview", "Platform", "Business", "Partnerships", "Contact"]);
  for (const lang of LANGS) for (const p of LIVON_SITE_PAGES) {
    const html = page(lang, p.id);
    const nav = html.match(/<nav class="lvs-subnav"[\s\S]*?<\/nav>/)[0];
    assert.equal(count(nav, /<a href=/g), 5, `${lang}/${p.id}`);
    for (const q of LIVON_SITE_PAGES) assert.ok(nav.includes(`href="/${lang}/livon/${q.path}"`), `${lang}/${p.id} → ${q.id}`);
    assert.equal(count(nav, /aria-current="page"/g), 1);
    assert.match(nav, new RegExp(`href="/${lang}/livon/${p.path}" aria-current="page"`));
  }
});

test("Overview has the 10 required sections, one h1 and the required slogan", () => {
  const html = page("ko", "overview");
  assert.equal(count(html, /<h1[\s>]/g), 1);
  assert.match(html, /인생의 모든 순간,<br>LIVON 하나로\./);
  for (const id of ["lvs-vision", "lvs-journey", "lvs-stage", "lvs-events", "lvs-daily", "lvs-family", "lvs-community", "lvs-ecosystem", "lvs-next"]) assert.ok(html.includes(`id="${id}"`), id);
  assert.equal(count(html, /data-lvs-section="/g) + 1 /* hero */, 10);
  assert.equal(count(html, /class="lvs-event[ "]/g), 13);
  assert.equal(count(html, /data-lvs-event="/g), 13);
  assert.equal(LIFE_EVENTS.length, 13);
  // the 6 featured events from the plan come first; the explorer map has 40 cells
  assert.deepEqual(LIFE_EVENTS.slice(0, 6).map((x) => x.id), ["enlist", "first-job", "move-out", "marriage", "birth", "retire"]);
  assert.equal(count(html.match(/<div class="lvs-ex"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)[0], /class="lvs-map__cell/g), 40);
  for (const ev of LIFE_EVENTS) for (const n of ev.cats) assert.ok(CATEGORIES.some((c) => c.n === n), ev.id + " " + n);
  // explorer is labelled as an example of a structure, not an app feature
  assert.match(html, /실제 앱 기능이 아니라/);
  // tabs are hidden without JS so the no-JS page lists every event
  assert.match(html, /class="lvs-ex__tabs" role="group" aria-label="[^"]+" hidden>/);
  assert.match(read("scripts/publish-site.mjs"), /"livon-site\.js"/);
});

test("Platform: 40 categories in 5 groups of 8, 200+ topics, every required field, 8 core features", () => {
  assert.equal(CATEGORIES.length, 40);
  assert.equal(GROUPS.length, 5);
  for (const g of GROUPS) assert.equal(CATEGORIES.filter((c) => c.g === g.id).length, 8, g.id);
  assert.deepEqual(CATEGORIES.map((c) => c.n), Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(2, "0")));
  let topics = 0;
  for (const c of CATEGORIES) {
    for (const k of ["en", "ko", "lineKo", "lineEn", "introKo", "introEn", "whoKo", "whoEn", "srcKo", "srcEn", "svcKo", "svcEn"]) assert.ok(c[k] && c[k].length > 1, `${c.n} ${k}`);
    assert.ok(c.topicsKo.length >= 5 && c.topicsKo.length === c.topicsEn.length, `${c.n} topics`);
    assert.ok(c.sitKo.length >= 1 && c.sitKo.length === c.sitEn.length, `${c.n} situations`);
    topics += c.topicsKo.length;
  }
  assert.ok(topics >= 200, `topics ${topics}`);
  for (const lang of ["ko", "en"]) {
    const html = page(lang, "platform");
    assert.equal(count(html, /class="nls-board__item lvs-cat" id="lvs-cat-\d\d"/g), 40);
    assert.equal(count(html, /class="nls-proc__item lvs-core"/g), 8);
    assert.equal(count(html, /class="nls-board__item lvs-cat" id="lvs-cat-\d\d" data-status="(web|partial|planned)"/g), 40);
  }
  assert.equal(CORE_FEATURES.length, 8);
  for (const f of CORE_FEATURES) assert.ok(f.nowKo && f.nowEn && ["live", "partial", "planned"].includes(f.st), f.en);
  assert.equal(CORE_FEATURES.find((f) => f.en === "AI Life Assistant").st, "planned");
  const mil = CATEGORIES.find((c) => c.n === "09").topicsKo.join(" ");
  for (const w of ["병역판정", "입영", "복무", "급여", "휴가", "전역", "예비군", "복학", "취업"]) assert.ok(mil.includes(w), "military " + w);
  const ins = CATEGORIES.find((c) => c.n === "21").topicsKo.join(" ");
  for (const w of ["보험 유형", "보장 범위", "보험료", "면책", "갱신", "보험금 청구", "분쟁 조정"]) assert.ok(ins.includes(w), "insurance " + w);
  const cert = CATEGORIES.find((c) => c.n === "03").topicsKo.join(" ");
  for (const w of ["자격 종류", "응시 조건", "시험 일정", "접수", "합격", "발급", "갱신"]) assert.ok(cert.includes(w), "certificate " + w);
});

test("status is derived from the real LIVON web data, and every mapped id exists", () => {
  const cats = new Set(life.categories.map((c) => c.id));
  const svcs = new Set(life.serviceTypes.map((s) => s.id));
  const pols = new Set(life.policies.map((p) => p.id));
  for (const c of CATEGORIES) {
    c.map.cat.forEach((id) => assert.ok(cats.has(id), `${c.n} cat ${id}`));
    c.map.svc.forEach((id) => assert.ok(svcs.has(id), `${c.n} svc ${id}`));
    c.map.pol.forEach((id) => assert.ok(pols.has(id), `${c.n} pol ${id}`));
  }
  // no LIVON web content for these today → must not be shown as available
  for (const n of ["04", "09", "10", "11", "13", "27", "31", "40"]) assert.equal(categoryStatus(CATEGORIES.find((c) => c.n === n)), "planned", n);
});

test("Business 15 areas, Partnerships 20 types, Contact 14 types — rendered with every field", () => {
  assert.equal(BUSINESS.length, 15);
  assert.equal(PARTNERS.length, 20);
  assert.equal(CONTACT_TYPES.length, 14);
  assert.equal(REVENUE.length, 6);
  assert.equal(ROADMAP.length, 5);
  for (const b of BUSINESS) for (const k of ["what", "who", "value", "rev", "partners", "rule"]) assert.ok(b.ko2[k] && b.en2[k], `${b.n} ${k}`);
  for (const lang of ["ko", "en"]) {
    assert.equal(count(page(lang, "business"), /class="nls-signal__item lvs-biz" id="lvs-biz-/g), 15);
    assert.equal(count(page(lang, "partnerships"), /id="lvs-partner-\d\d"/g), 20);
    assert.equal(count(page(lang, "contact"), /class="lvs-contact__item"/g), 14);
    assert.equal(count(page(lang, "business"), /class="nls-lane__item lvs-road__step"/g), 5);
    assert.equal(count(page(lang, "business"), /<tbody>[\s\S]*?<\/tbody>/g), 1);
  }
});

test("contact reuses the existing NEWON contact page and its existing types only (no new form, DB or login)", () => {
  const existing = read("company.js").match(/CONTACT_TYPES = \[([^\]]+)\]/)[1];
  for (const t of CONTACT_TYPES) assert.ok(existing.includes(`"${t.type}"`), t.type);
  for (const lang of LANGS) for (const p of LIVON_SITE_PAGES) {
    const main = page(lang, p.id).match(/<section id="lifestage-detail"[\s\S]*<\/section>/)[0];
    assert.doesNotMatch(main, /<form|<input|<textarea|localStorage|sessionStorage|login|sign-in/i, `${lang}/${p.id}`);
  }
});

test("honesty: no prices, no guarantees, licensed services never offered, official bodies never called partners", () => {
  for (const lang of ["ko", "en"]) for (const p of LIVON_SITE_PAGES) {
    const text = page(lang, p.id).match(/<section id="lifestage-detail"[\s\S]*<\/section>/)[0].replace(/<[^>]+>/g, " ");
    assert.doesNotMatch(text, /[₩$€]\s?\d|\d[\d,]*\s?원|\/\s?월|per month|만원/, `${lang}/${p.id} price`);
    assert.doesNotMatch(text, /보장합니다|guarantee(d|s)? (admission|employment|results)/i, `${lang}/${p.id} guarantee`);
  }
  const ko = JSON.stringify(COPY.ko) + JSON.stringify(BUSINESS);
  assert.match(ko, /보험 모집·중개/);
  assert.match(ko, /투자자문|투자 자문/);
  assert.match(ko, /공공 지원금·법정 급여에는 수수료를 부과하지 않/);
  assert.match(ko, /실제 협약이 체결되지 않은 기관을 파트너로 표시하지 않습니다/);
  for (const x of PARTNERS.filter((x) => x.official)) assert.match(x.whatKo + x.whatEn, /제휴 아님|not a partnership|공공 절차|public procedures/);
});

test("SEO: title, description, canonical, 9 hreflang + x-default, OG on all 45 pages; sitemap lists them", () => {
  const sitemap = read("sitemap.xml");
  for (const lang of LANGS) for (const p of LIVON_SITE_PAGES) {
    const html = page(lang, p.id);
    const url = `https://www.newon.app/${lang}/livon/${p.path}`;
    assert.match(html, /<title>[^<]{10,}<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]{30,}"/);
    assert.ok(html.includes(`<link rel="canonical" href="${url}" />`), url);
    assert.ok(html.includes(`<meta property="og:url" content="${url}" />`), url);
    assert.equal(count(html, /rel="alternate" hreflang=/g), 10, url);
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), "sitemap " + url);
  }
  assert.equal(count(sitemap, /<loc>https:\/\/www\.newon\.app\/ko\/livon\/<\/loc>/g), 1, "no duplicate overview entry");
});

test("internal links on the LIVON pages resolve to existing files or anchors", () => {
  for (const lang of LANGS) for (const p of LIVON_SITE_PAGES) {
    const html = page(lang, p.id);
    const main = html.match(/<section id="lifestage-detail"[\s\S]*<\/section>/)[0];
    for (const [, href] of main.matchAll(/href="([^"]+)"/g)) {
      if (/^https?:/.test(href)) continue;
      const [pathPart, hash] = href.split("#");
      if (!pathPart) { assert.ok(html.includes(`id="${hash}"`), `${lang}/${p.id} #${hash}`); continue; }
      const clean = pathPart.split("?")[0];
      const file = path.join(ROOT, clean.replace(/^\//, ""), clean.endsWith("/") ? "index.html" : "");
      assert.ok(fs.existsSync(file), `${lang}/${p.id} → ${href}`);
      if (hash) assert.ok(read(path.relative(ROOT, file)).includes(`id="${hash}"`), `${lang}/${p.id} → ${href}`);
    }
  }
});

test("accessibility basics: heading order, labelled nav, lang attribute, reduced-motion CSS", () => {
  for (const lang of LANGS) for (const p of LIVON_SITE_PAGES) {
    const html = page(lang, p.id);
    assert.match(html, new RegExp(`<html lang="${lang === "pt-br" ? "pt-BR" : lang}">`));
    const main = html.match(/<section id="lifestage-detail"[\s\S]*<\/section>/)[0];
    const levels = [...main.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    assert.equal(levels[0], 1, `${lang}/${p.id} starts with h1`);
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, `${lang}/${p.id} skips a heading level at ${i}`);
    assert.match(main, /<nav class="lvs-subnav" aria-label="[^"]+">/);
  }
  const css = read("livon-site.css");
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /focus-visible/);
  assert.match(css, /min-height: 44px|min-height: 48px/);
  // same visual language as the Life Stage page: no extra accent colour, no rounded cards
  assert.doesNotMatch(css, /#f6d76b|border-radius/i);
});

test("existing LIVON web service and other pages are untouched by the renderer's outputs", () => {
  // the web service lives at /livon/ (root) and must still be the original app shell
  assert.match(read("livon/index.html"), /lv-hm-display--brand/);
  // the legacy /{lang}/lifestage/ redirect stubs still point to the overview
  for (const lang of LANGS) assert.match(read(`${lang}/lifestage/index.html`), new RegExp(`url=/${lang}/livon/`));
});
