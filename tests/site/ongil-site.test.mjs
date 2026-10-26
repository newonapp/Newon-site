/**
 * Regression tests for the ONGIL business website (/{ko,en}/ongil/…), V2 (Oct 2026); V4 content upgrade (2026-10-24): 28 areas.
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

test("counts: 29 areas (25 + 3 signature sections + 29 Giving) in 7 groups, 21 business groups in 8 categories, 16 partner types, 14 inquiry types", () => {
  for (const c of [KO, EN]) {
    assert.equal(c.platform.sections.length + c.platform.features.length, 29); // 2026-10-25: + 29 Giving (planned)
    assert.deepEqual(c.platform.features.map((f) => f.id), ["life-box", "friends", "safe-band"]);
    assert.equal(c.platform.groupMap.length, 7);
    for (const s of c.platform.sections) assert.ok(c.platform.groupMap.some((g) => g.id === s.grp), `${s.id} has a group`);
    assert.deepEqual([...new Set(c.platform.sections.map((s) => s.grp))].sort(), ["A", "B", "C", "D", "E", "G"]);
    // 29 Giving: its own group G, numbered 29, listed as planned (never as available now)
    const giving = c.platform.sections.find((s) => s.id === "giving");
    assert.equal(giving.n, "29");
    assert.equal(giving.grp, "G");
    assert.ok(c.status.cols.find((k) => k.id === "plan").items.some((it) => it.a === "giving"));
    for (const col of c.status.cols.filter((k) => k.id !== "plan")) assert.ok(!col.items.some((it) => it.a === "giving"), col.id);
    // status is grouped (now / in development / planned / under review) and every item points to a real area
    const areaIds = new Set([...c.platform.sections.map((s) => s.id), ...c.platform.features.map((f) => f.id)]);
    assert.deepEqual(c.status.cols.map((k) => k.id), ["now", "dev", "plan", "review"]);
    for (const col of c.status.cols) for (const it of col.items) assert.ok(areaIds.has(it.a), `${col.id}: ${it.a}`);
    // Life Box, Friends and Safe Band are never listed as available now
    for (const it of c.status.cols[0].items) assert.ok(!["life-box", "friends", "safe-band", "devices"].includes(it.a), it.a);
    assert.equal(c.business.groups.length, 21);
    assert.equal(c.business.categories.length, 8);
    for (const g of c.business.groups) assert.ok(c.business.categories.some((k) => k.id === g.cat), g.name);
    assert.equal(c.business.revenue.length, 12);
    assert.equal(c.partnerships.items.length, 16);
    assert.equal(c.partnerships.process.length, 5);
    assert.equal(c.partnerships.principles.length, 7);
    assert.equal(c.contact.types.length, 14);
    for (const t of c.contact.types) assert.ok(c.contact.groups.some((g) => g.id === t.grp), t.name);
    assert.equal(c.overview.mission.values.length, 6);
    assert.equal(c.overview.journey.items.length, 7);
    assert.equal(c.overview.trust.points.length, 7);
    assert.equal(c.business.roadmap.length, 5);
  }
  const ko = (p) => read(`ko/${p}/index.html`);
  assert.equal((ko("ongil/platform").match(/<article class="ogs-(?:row|card)" id="p-[a-z-]+"/g) || []).length, 26);
  for (const id of ["life-box", "friends", "safe-band"]) assert.ok(ko("ongil/platform").includes(`<section id="p-${id}"`), id);
  assert.equal((ko("ongil/business").match(/<article class="ogs-(?:row|card)" id="b-\d\d"/g) || []).length, 21);
  assert.equal((ko("ongil/partnerships").match(/<article class="ogs-card" id="pt-\d\d"/g) || []).length, 16);
  assert.equal((ko("ongil/contact").match(/<li id="c-\d\d">/g) || []).length, 14);
  // press and investor inquiry types exist (brief §3E)
  const contact = text(ko("ongil/contact"));
  assert.ok(contact.includes("언론·미디어") && contact.includes("투자 관련"));
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

test("contact: every inquiry button is one 문의하기 to the unified Contact page (platform + type + source); email only as an address", () => {
  // owner 2026-10-26: "이메일로 문의하기, 문의 양식 … 말고 그냥 문의하기" → /{lang}/contact/?platform=ongil&type=…
  const TYPES = ["personal", "business", "public", "partnership", "investment", "media"];
  for (const lang of SITE) {
    const html = read(`${lang}/ongil/contact/index.html`);
    const body = own(html);
    assert.ok(!/href="[^"]*business\/(?:inquiry|contact)\//.test(body), `${lang} no old business form links`);
    const links = [...body.matchAll(/href="(\/[a-z-]+\/contact\/\?[^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    assert.ok(links.length >= 16, `${lang} unified links ${links.length}`); // 14 types + channel panel + hero + closing band
    for (const href of links) {
      const u = new URL(href, "https://www.newon.app");
      assert.equal(u.pathname, `/${lang}/contact/`);
      assert.equal(u.searchParams.get("platform"), "ongil");
      assert.ok(TYPES.includes(u.searchParams.get("type")), `${href} type`);
      assert.equal(u.searchParams.get("source"), "ongil-contact");
    }
    // the 14 inquiry rows: one "문의하기" each, no Email/Form channel tags
    const label = lang === "ko" ? "문의하기" : "Contact us";
    const rows = [...body.matchAll(/class="ogs-tlist__go"[^>]*><span>([^<]+)<\/span><\/a>/g)].map((m) => m[1]);
    assert.equal(rows.length, 14);
    assert.ok(rows.every((t) => t === `${label} →`), `${lang} row labels`);
    assert.doesNotMatch(body, /ogs-tlist__ch|>Email<|>Form<|이메일 보내기|문의 양식 열기|Send an email|Open the inquiry form/);
    // press → media, investors → investment, institutions → public
    assert.ok(links.some((h) => /type=media/.test(h)) && links.some((h) => /type=investment/.test(h)) && links.some((h) => /type=public/.test(h)));
    // the e-mail address stays as text in the channel panel only (no mailto buttons)
    const mails = [...body.matchAll(/<a class="([^"]*)" href="mailto:/g)].map((m) => m[1]);
    assert.deepEqual(mails, ["ogs-channels__v"]);
  }
});

test("role separation with LIVON and MY WORLD is stated", () => {
  for (const c of [KO, EN]) {
    const all = JSON.stringify(c);
    assert.ok(all.includes("LIVON") && all.includes("MY WORLD"));
  }
  const t = text(read("ko/ongil/index.html"));
  assert.ok(t.includes("LIVON이 다루") && t.includes("MY WORLD가"));
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

test("v3 detail sections (2026-10-26): rendered once, counts kept consistent, nothing shown as available now", () => {
  for (const c of [KO, EN]) {
    assert.equal(c.overview.limits.items.length, 6);
    assert.equal(c.overview.beyond.focus.length, 4);
    assert.equal(c.platform.health.items.length, 10);
    assert.equal(c.platform.delivery.kinds.length, 4);
    assert.equal(c.platform.aiDevices.devices.length, 8);
    assert.equal(c.platform.appMap.tabs.length, 5);
    assert.deepEqual(c.business.phases.items.map((p) => p.n), ["P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7"]);
    assert.equal(c.partnerships.stages.items.length, 5);
    assert.equal(c.contact.after.steps.length, 3);
    assert.ok(c.contact.route.items.some((r) => r.where === "119" && r.alert));
    // UI counts match the content (7 groups, 7 opportunities, 16 partner types)
    assert.ok(c.ui.groupMapTitle.includes(String(c.platform.groupMap.length)));
    assert.ok(c.ui.partnerTypesTitle.includes(String(c.partnerships.items.length)));
    assert.ok(c.ui.partnerIndexTitle.includes(String(new Set(c.partnerships.items.map((i) => i.opp)).size)));
  }
  const now = /지금 제공 중|이용 가능|available now|now available/i;
  for (const c of [KO, EN]) {
    for (const r of [...c.platform.health.items, ...c.platform.aiDevices.devices]) assert.doesNotMatch(r.stage, now, r.t);
  }
  const ids = {
    "ongil": ["ogs-limits"],
    "ongil/platform": ["ogs-health", "ogs-delivery", "ogs-ai-devices", "ogs-appmap"],
    "ongil/business": ["ogs-roadmap"],
    "ongil/partnerships": ["ogs-stages", "ogs-proposal"],
    "ongil/contact": ["ogs-route", "ogs-after", "ogs-faq"],
  };
  for (const lang of SITE) {
    for (const [p, list] of Object.entries(ids)) {
      const html = read(`${lang}/${p}/index.html`);
      for (const id of list) assert.equal((html.match(new RegExp(`<section id="${id}"`, "g")) || []).length, 1, `${lang}/${p} #${id}`);
    }
    assert.ok(read(`${lang}/ongil/business/index.html`).includes("P7"), `${lang} development stages`);
  }
});
