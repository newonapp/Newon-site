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

test("counts follow the final plan: 18 areas, 10 revenue models, 10 partner types, 11 inquiry types, 7-step flow", () => {
  for (const c of [KO, EN]) {
    assert.equal(c.platform.services.length, 18);
    assert.equal(c.business.models.items.length, 10);
    assert.equal(c.partnerships.types.items.length, 10);
    assert.equal(c.contact.items.length, 11);
    assert.equal(c.platform.flow.steps.length, 7);
    // payment and settlement are the steps marked as not operating
    assert.deepEqual(c.platform.flow.steps.filter((s) => s.off).map((s) => s.n), ["04", "07"]);
  }
  const ko = (p) => read(`ko/${p}/index.html`);
  assert.equal((ko("shareon/platform").match(/id="svc-\d\d"/g) || []).length, 18);
  assert.equal((ko("shareon/business").match(/class="nsh-biz__item"/g) || []).length, 10);
  assert.equal((ko("shareon/partnerships").match(/class="nsh-dir__row"/g) || []).length, 10);
  // Contact (owner 2026-10-26, ONGIL-style kit): the 11 inquiry types are rows with one "문의하기" each
  assert.equal((ko("shareon/contact").split('id="bct-types"')[1].split("</section>")[0].match(/class="bct-tlist__go"/g) || []).length, 11);
  assert.equal((ko("shareon/platform").match(/class="nsh-track__step is-off"/g) || []).length, 2);
  // inquiry types separate usage/joining from partner/institution/external inquiries, incl. press and investment
  const groups = KO.contact.items.map((it) => it.g);
  assert.deepEqual([...new Set(groups)], ["trade", "partner"]);
  assert.ok(KO.contact.items.some((it) => it.slug === "media") && KO.contact.items.some((it) => it.slug === "investment"));
});

test("no per-card status badges; exactly one shared notice per page", () => {
  for (const lang of LANGS) {
    for (const p of SHAREON_PAGES) {
      const html = read(`${lang}/${p.path}/index.html`);
      assert.equal((html.match(/class="nsh-badge/g) || []).length, 0, `${lang}/${p.path} badges`);
      assert.equal((html.match(/class="nsh-status__note"/g) || []).length, 1, `${lang}/${p.path} notice`);
    }
  }
  assert.ok(KO.statusNote.includes("향후 개발 또는 운영 방향"));
  // status is expressed by group columns, not per-card labels
  assert.ok((read("ko/shareon/platform/index.html").match(/class="nsh-phase__col /g) || []).length >= 3);
});

test("no fee rates, prices or currency amounts are shown", () => {
  for (const lang of LANGS) {
    for (const p of SHAREON_PAGES) {
      const t = text(read(`${lang}/${p.path}/index.html`));
      assert.doesNotMatch(t, /\d\s*%/, `${lang}/${p.path} percent`);
      assert.doesNotMatch(t, /₩\s*\d|\d\s*₩/, `${lang}/${p.path} won`);
      assert.doesNotMatch(t, /9,900|29,900|99,000/, `${lang}/${p.path} subscription prices`);
    }
  }
  // the hypothetical calculator keeps an empty fee-rate field
  const biz = read("ko/shareon/business/index.html");
  assert.match(biz, /id="calc-rate" name="rate" type="number" inputmode="numeric" value=""/);
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
  const ko = text(read("ko/shareon/platform/index.html"));
  assert.ok(ko.includes("결제·보증금은 운영하지 않습니다") || ko.includes("결제·보증금은 아직 운영되지 않습니다") || ko.includes("운영하지 않습니다"));
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
