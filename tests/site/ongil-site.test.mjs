/**
 * Regression tests for the ONGIL business website (/{ko,en}/ongil/…), V2 (Oct 2026).
 * Run: node --test tests/site/ongil-site.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { KO } from "../../scripts/ongil-site-ko.mjs";
import { EN } from "../../scripts/ongil-site-en.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const PAGES = ["ongil", "ongil/platform", "ongil/business", "ongil/partnerships", "ongil/contact"];
const SITE = ["ko", "en"];
const STUB_LANGS = ["ja", "es", "pt-br", "fr", "de", "hi", "id"];
/** ONGIL's own markup: film hero + sub-menu + body + notes (shared header/footer excluded). */
const own = (html) => {
  const start = html.indexOf('<section id="lifestage-detail"');
  const end = html.indexOf("</main>");
  return html.slice(start, end > 0 ? end : undefined);
};
const text = (html) => own(html).replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");

test("five ONGIL pages exist in KO/EN with SEO basics; other locales keep forward stubs", () => {
  for (const lang of SITE) {
    for (const p of PAGES) {
      const html = read(`${lang}/${p}/index.html`);
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${lang}/${p} h1`);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.newon\\.app/${lang}/${p}/"`));
      assert.ok((html.match(/rel="alternate" hreflang=/g) || []).length >= 3, `${lang}/${p} hreflang`);
      assert.match(html, /property="og:title"/);
      assert.match(html, /<meta name="description" content="[^"]{20,}"/);
      assert.match(html, /<title>[^<]*ONGIL[^<]*<\/title>/);
      assert.ok(html.includes("/ongil-site.css?v="), "ONGIL styles kept");
    }
  }
  const titles = PAGES.map((p) => read(`ko/${p}/index.html`).match(/<title>([^<]*)<\/title>/)[1]);
  assert.equal(new Set(titles).size, 5, "unique titles");
  for (const lang of STUB_LANGS) {
    for (const p of PAGES.slice(1)) {
      const html = read(`${lang}/${p}/index.html`);
      assert.match(html, /<meta name="robots" content="noindex"/);
      assert.ok(html.includes(`url=/en/${p}/`), `${lang}/${p} forwards to EN`);
    }
  }
});

test("counts are preserved: 18 areas in 8 groups, 20 business groups in 8 categories, 14 partner types, 13 inquiry types", () => {
  for (const c of [KO, EN]) {
    assert.equal(c.platform.sections.length, 18);
    assert.equal(c.platform.groupMap.length, 8);
    for (const s of c.platform.sections) assert.ok(c.platform.groupMap.some((g) => g.id === s.grp), `${s.id} has a group`);
    assert.deepEqual([...new Set(c.platform.sections.map((s) => s.grp))].sort(), ["A", "B", "C", "D", "E", "F", "G", "H"]);
    assert.equal(c.business.groups.length, 20);
    assert.equal(c.business.categories.length, 8);
    for (const g of c.business.groups) assert.ok(c.business.categories.some((k) => k.id === g.cat), g.name);
    assert.equal(c.partnerships.items.length, 14);
    assert.equal(c.partnerships.process.length, 5);
    assert.equal(c.partnerships.principles.length, 7);
    assert.equal(c.contact.types.length, 13);
    assert.equal(c.overview.mission.values.length, 6);
    assert.equal(c.overview.journey.items.length, 8);
    assert.equal(c.overview.trust.points.length, 7);
    assert.equal(c.business.roadmap.length, 5);
  }
  const ko = (p) => read(`ko/${p}/index.html`);
  assert.equal((ko("ongil/platform").match(/<article class="ogs-(?:row|card)" id="p-[a-z-]+"/g) || []).length, 18);
  assert.equal((ko("ongil/business").match(/<article class="ogs-(?:row|card)" id="b-\d\d"/g) || []).length, 20);
  assert.equal((ko("ongil/partnerships").match(/<article class="ogs-card" id="pt-\d\d"/g) || []).length, 14);
  assert.equal((ko("ongil/contact").match(/<li id="c-\d\d">/g) || []).length, 13);
});

test("no per-card status badges or status legend; exactly one shared notice per page", () => {
  for (const lang of SITE) {
    for (const p of PAGES) {
      const html = read(`${lang}/${p}/index.html`);
      assert.equal((html.match(/class="ogs-status/g) || []).length, 0, `${lang}/${p} badges`);
      assert.equal((html.match(/ogs-statusline|ogs-flag"/g) || []).length, 0, `${lang}/${p} status line / flag`);
      assert.equal((html.match(/class="nls-note ogs-note ogs-notice"/g) || []).length, 1, `${lang}/${p} notice`);
    }
  }
  const t = text(read("ko/ongil/platform/index.html"));
  for (const w of ["계획 · 검토 단계", "일부 제공 · 나머지 준비 중", "웹 체험판에서 이용 가능", "출시 일정 미정", "기관 협력 확인 전"]) assert.ok(!t.includes(w), w);
  assert.ok(KO.notice.includes("향후 개발 또는 협력 방향"));
});

test("no prices, fee rates or currency amounts; no '온길 시작하기' entry", () => {
  for (const lang of SITE) {
    for (const p of PAGES) {
      const html = read(`${lang}/${p}/index.html`);
      const t = text(html);
      assert.doesNotMatch(t, /\d\s*%/, `${lang}/${p} percent`);
      assert.doesNotMatch(t, /₩\s*\d|\d\s*₩|\d[\d,]*\s*원(?![가-힣])|\$\s*\d|USD|KRW/, `${lang}/${p} price`);
      assert.ok(!html.includes("온길 시작하기") && !/Start Ongil/i.test(html), `${lang}/${p} start CTA`);
      assert.ok(!own(html).includes('href="/ongil-start/'), `${lang}/${p} no web-app entry link`);
    }
  }
  // the existing web app is preserved
  assert.ok(fs.existsSync(path.join(ROOT, "ongil-start", "index.html")));
});

test("safety: 119 emergency guidance on every page; no medical/emergency provider claims", () => {
  for (const lang of SITE) {
    for (const p of PAGES) {
      const t = text(read(`${lang}/${p}/index.html`));
      assert.ok(t.includes("119"), `${lang}/${p} 119`);
    }
  }
  const contact = text(read("ko/ongil/contact/index.html"));
  assert.ok(contact.includes("응급 상황은 문의로 접수되지 않습니다"));
  assert.ok(contact.includes("건강·돌봄 정보") && contact.includes("적지 마세요"), "contact asks not to send health/care details");
  const enContact = text(read("en/ongil/contact/index.html"));
  assert.ok(/Do not include health or care information/.test(enContact));
});

test("no Korean in the English pages' own markup", () => {
  for (const p of PAGES) {
    const t = text(read(`en/${p}/index.html`));
    const m = t.match(/[가-힣]+/g);
    assert.equal(m, null, `en/${p}: ${m && m.slice(0, 5).join(",")}`);
  }
});

test("JSON-LD sanity: none, or nothing that implies a medical / care / emergency provider", () => {
  for (const lang of SITE) {
    for (const p of PAGES) {
      const html = read(`${lang}/${p}/index.html`);
      for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        const data = JSON.parse(m[1]);
        const s = JSON.stringify(data);
        assert.doesNotMatch(s, /MedicalOrganization|Hospital|Physician|EmergencyService|MedicalBusiness|NursingHome|HealthAndBeautyBusiness/);
      }
    }
  }
});

test("contact links use the existing inquiry page with known params, and mailto subjects", () => {
  for (const lang of SITE) {
    const html = read(`${lang}/ongil/contact/index.html`);
    const forms = [...own(html).matchAll(/href="(\/[a-z-]+\/business\/inquiry\/\?[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    assert.ok(forms.length >= 12, `${lang} form links ${forms.length}`);
    for (const href of forms) {
      const u = new URL(href, "https://www.newon.app");
      assert.equal(u.pathname, `/${lang}/business/inquiry/`);
      assert.equal(u.searchParams.get("service"), "partnership");
      assert.equal(u.searchParams.get("source"), `/${lang}/ongil/contact/`);
    }
    const mails = [...own(html).matchAll(/href="mailto:([^"?]+)\?subject=([^"]+)"/g)];
    assert.ok(mails.length >= 3);
    for (const m of mails) {
      assert.equal(m[1], "newon@newon.app");
      assert.ok(decodeURIComponent(m[2]).startsWith("[ONGIL]"));
    }
    assert.ok(fs.existsSync(path.join(ROOT, lang, "business", "inquiry", "index.html")));
  }
  // the inquiry page maps service=partnership to an existing option
  assert.match(read("ko/business/inquiry/index.html"), /<option value="partnership"/);
});

test("role separation with LivOn and MY WORLD is stated", () => {
  for (const c of [KO, EN]) {
    const all = JSON.stringify(c);
    assert.ok(all.includes("LivOn") && all.includes("MY WORLD"));
  }
  const t = text(read("ko/ongil/index.html"));
  assert.ok(t.includes("LivOn이 다루") && t.includes("MY WORLD가"));
});

test("internal links on ONGIL pages resolve to files in the repo", () => {
  for (const lang of SITE) {
    for (const p of PAGES) {
      const html = own(read(`${lang}/${p}/index.html`));
      const ids = new Set([...read(`${lang}/${p}/index.html`).matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
      for (const m of html.matchAll(/href="([^"]+)"/g)) {
        const href = m[1].replace(/&amp;/g, "&");
        if (/^(https?:|mailto:)/.test(href)) continue;
        if (href.startsWith("#")) {
          assert.ok(ids.has(href.slice(1)), `${lang}/${p} anchor ${href}`);
          continue;
        }
        const [pathPart, hash] = href.split("#");
        const clean = pathPart.split("?")[0];
        const file = path.join(ROOT, clean.endsWith("/") ? clean + "index.html" : clean);
        assert.ok(fs.existsSync(file), `${lang}/${p} → ${href}`);
        if (hash) assert.ok(read(path.relative(ROOT, file)).includes(`id="${hash}"`), `${lang}/${p} → ${href} anchor`);
      }
    }
  }
});
