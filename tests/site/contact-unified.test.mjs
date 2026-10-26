/**
 * Unified inquiry system (owner specs 1 + 2, 2026-10-26): taxonomy, URL preselection, retired inquiry URLs, entry points.
 * Run: node --test tests/site/contact-unified.test.mjs   (reads the committed HTML; no build or browser needed —
 * the browser checks are in contact-unified.e2e.test.mjs)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
import {
  CONTACT_PLATFORM_IDS,
  CONTACT_INQUIRER_IDS,
  CONTACT_INQUIRY_IDS,
  CONTACT_CATEGORY_IDS,
  CONTACT_TYPE_PRESETS,
  CONTACT_TOPICS,
  CONTACT_TOPIC_INDEX,
  CONTACT_TOPIC_STATUS,
  CONTACT_CONDITIONAL_FIELDS,
  deriveContactCategory,
  resolveContactParams,
  legacyRedirectScript,
  legacyContactUrl,
  LEGACY_BUSINESS_TYPES,
  LEGACY_STUDIO_TYPES,
} from "../../scripts/contact-taxonomy.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const main = (html) => (html.match(/<main\b[\s\S]*?<\/main>/) || [""])[0];
const config = (lang) => JSON.parse(read(`${lang}/contact/index.html`).match(/<script type="application\/json" id="ct-config">([\s\S]*?)<\/script>/)[1]);

test("taxonomy: six inquirers, eleven inquiry types, the spec's topics per platform, unique ids, valid statuses", () => {
  assert.deepEqual(CONTACT_INQUIRER_IDS, ["personal", "company", "organization", "investor", "media", "other"]);
  assert.deepEqual(CONTACT_INQUIRY_IDS, ["general", "service", "support", "bug", "partnership", "listing", "investment", "advertising", "institution", "privacy", "other"]);
  const want = { livon: 8, ongil: 8, shareon: 10, babylog: 9, petlog: 8, myworld: 9 };
  for (const [p, n] of Object.entries(want)) assert.equal(CONTACT_TOPICS[p].length, n, `${p} topics`);
  const all = Object.values(CONTACT_TOPICS).flat();
  assert.equal(new Set(all.map((t) => t.id)).size, all.length, "unique topic ids");
  for (const [p, list] of Object.entries(CONTACT_TOPICS)) {
    assert.ok(CONTACT_PLATFORM_IDS.includes(p), p);
    for (const t of list) {
      assert.ok(t.id.startsWith(`${p}-`), t.id);
      assert.ok(t.status === null || CONTACT_TOPIC_STATUS[t.status], `${t.id} status`);
      assert.ok(t.inquiry === null || CONTACT_INQUIRY_IDS.includes(t.inquiry), `${t.id} inquiry`);
      assert.ok(t.ko && t.en, `${t.id} labels`);
    }
  }
  // the six platforms are all "앱 출시 준비 중": nothing of theirs may read as available today
  for (const p of Object.keys(want)) for (const t of CONTACT_TOPICS[p]) assert.notEqual(t.status, "available", t.id);
  for (const name of Object.keys(CONTACT_CONDITIONAL_FIELDS)) assert.ok(read("ko/contact/index.html").includes(`data-ct-when="${name}"`), `${name} rendered`);
});

test("presets, derived category and URL resolution (my-world alias, invalid values, topic → platform)", () => {
  for (const [k, v] of Object.entries(CONTACT_TYPE_PRESETS)) {
    assert.ok(CONTACT_CATEGORY_IDS.includes(v.category), k);
    assert.equal(deriveContactCategory(v.inquirer, v.inquiry || ""), v.category, `${k} preset derives back to its category`);
  }
  const r = (q) => resolveContactParams(new URLSearchParams(q));
  assert.deepEqual(r("platform=my-world&type=business&source=x"), { category: "business", inquirer: "company", inquiry: "", platform: "myworld", topic: "", source: "x" });
  assert.deepEqual(r("type=<x>&platform=../../&topic=nope&inquirer=admin&inquiry=1"), { category: "", inquirer: "", inquiry: "", platform: "", topic: "", source: "" });
  assert.deepEqual(r("topic=petlog-shelter"), { category: "", inquirer: "", inquiry: "institution", platform: "petlog", topic: "petlog-shelter", source: "" });
  assert.equal(r("platform=ongil&topic=petlog-shelter").topic, "", "mismatched topic ignored");
  assert.equal(r("type=institution").category, "public");
  assert.equal(r("type=general").category, "media");
  assert.equal(r("source=" + "a".repeat(300)).source.length, 120);
});

test("the page config matches the taxonomy in every locale; ko labels for ko, en for the rest; status words on topics", () => {
  for (const lang of LANGS) {
    const c = config(lang);
    assert.deepEqual(c.inquirers.map((x) => x.id), CONTACT_INQUIRER_IDS, lang);
    assert.deepEqual(c.inquiries.map((x) => x.id), CONTACT_INQUIRY_IDS, lang);
    assert.deepEqual(Object.keys(c.topics), Object.keys(CONTACT_TOPICS), lang);
    assert.deepEqual(c.platforms, CONTACT_PLATFORM_IDS);
    assert.equal(c.platformAliases["my-world"], "myworld");
    assert.equal(c.lang, lang);
    const deposit = c.topics.shareon.find((t) => t.id === "shareon-deposit");
    assert.equal(deposit.label, lang === "ko" ? "보증금 · 향후 계획" : "Deposits · future plan", lang);
    const records = c.topics.petlog.find((t) => t.id === "petlog-records");
    assert.equal(records.label, lang === "ko" ? "반려동물 기록 · 출시 준비 중" : "Pet records · launch in preparation", lang);
    for (const [k, v] of Object.entries(c.t)) if (k !== "counterSuffix") assert.ok(typeof v === "string" && v.length, `${lang} ${k} message`);
  }
});

/** Run a stub's inline redirect script with a fake location; returns the replaced URL. */
function runStub(script, url) {
  const u = new URL(url, "https://www.newon.app");
  let to = "";
  const location = { search: u.search, hash: u.hash, pathname: u.pathname, replace: (x) => (to = x) };
  vm.runInNewContext(script, { location, URLSearchParams });
  return to;
}

test("retired-page mapping: the stub script and the renderer helper agree", () => {
  const cases = [
    ["business-contact", ""],
    ["business-contact", "?type=participation&platform=babylog&source=x#bpt-form"],
    ["business-contact", "?type=saas"],
    ["business-contact", "?type=global&platform=multiple"],
    ["business-contact", "?type=public&platform=ongil"],
    ["business-contact", "?type=weird&foo=bar"],
    ["business-contact", "?type=investment"],
    ["studio-contact", "?type=license&area=business#sts-form"],
    ["studio-contact", "?type=product&area=babylog"],
    ["studio-contact", "?type=support"],
    ["business-inquiry", "?category=Business&service=MVP&slug=mvp&area=BUILD&source=portfolio#inquiry"],
    ["business-inquiry", "?category=studio&type=brand-strategy&source=portfolio"],
    ["business-inquiry", "?category=Partnership#inquiry"],
    ["business-inquiry", "?topic=livon-ai&platform=livon"],
  ];
  for (const lang of ["ko", "en", "pt-br"]) {
    for (const [kind, q] of cases) {
      const [query, hash = ""] = q.split("#");
      const fromScript = runStub(legacyRedirectScript(lang, kind), `/${lang}/x/${q}`);
      assert.equal(fromScript, legacyContactUrl(lang, kind, query.replace(/^\?/, ""), hash), `${lang} ${kind} ${q}`);
      assert.ok(fromScript.startsWith(`/${lang}/contact/?`), `${lang} stays in its language`);
      const r = resolveContactParams(new URL(fromScript, "https://x").searchParams);
      assert.ok(r.category, `${kind} ${q} lands on a category`);
    }
  }
  assert.equal(legacyContactUrl("ko", "business-contact", "type=participation&platform=babylog&source=x", "f"), "/ko/contact/?type=business&inquiry=listing&platform=babylog&source=x#contact-form");
  assert.equal(legacyContactUrl("en", "studio-contact", "type=license&area=business"), "/en/contact/?type=business&platform=newon&topic=newon-studio-license&source=studio-contact&legacy=studio-contact%3A+area%3Dbusiness");
  for (const v of Object.values(LEGACY_BUSINESS_TYPES)) assert.ok(CONTACT_TYPE_PRESETS[v.type] && (!v.topic || CONTACT_TOPIC_INDEX[v.topic]));
  for (const v of Object.values(LEGACY_STUDIO_TYPES)) assert.ok(CONTACT_TYPE_PRESETS[v.type] && CONTACT_TOPIC_INDEX[v.topic]);
  // a broken query never throws the visitor away from the contact page
  assert.equal(runStub(legacyRedirectScript("ko", "business-contact").replace("new URLSearchParams(location.search)", "(function(){throw 1})()"), "/ko/x/"), "/ko/contact/");
});

test("redirect stubs: business/contact, studio/contact, company/contact in nine languages + root; out of the sitemap", () => {
  const xml = read("sitemap.xml");
  for (const lang of LANGS) {
    for (const [p, kind] of [["business/contact", "business-contact"], ["studio/contact", "studio-contact"]]) {
      const html = read(`${lang}/${p}/index.html`);
      assert.match(html, /<meta name="robots" content="noindex, follow" \/>/, `${lang}/${p} noindex`);
      assert.ok(html.includes(`<link rel="canonical" href="https://www.newon.app/${lang}/contact/" />`), `${lang}/${p} canonical`);
      assert.ok(html.includes(`<meta http-equiv="refresh" content="0;url=/${lang}/contact/?`), `${lang}/${p} no-JS fallback`);
      const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
      assert.ok(runStub(script, `/${lang}/${p}/?type=public`).startsWith(`/${lang}/contact/?type=public`), `${lang}/${p} maps`);
      assert.ok(!html.includes("<main"), `${lang}/${p} has no body`);
      assert.ok(!xml.includes(`<loc>https://www.newon.app/${lang}/${p}/</loc>`), `${lang}/${p} not in sitemap`);
      assert.equal(kind.length > 0, true);
    }
    const co = read(`${lang}/company/contact/index.html`);
    assert.ok(co.includes(`location.replace("/${lang}/contact/"+(location.search||"")+(location.hash||""))`), `${lang} company/contact keeps the query`);
    assert.equal(xml.split(`<loc>https://www.newon.app/${lang}/contact/</loc>`).length - 1, 1, `${lang}/contact in sitemap once`);
    // business/inquiry: noindex, forwards except the store purchase inflow, success page kept
    const inq = read(`${lang}/business/inquiry/index.html`);
    assert.ok(inq.includes('"kind":"business-inquiry"') && inq.includes(`"lang":"${lang}"`), `${lang} business/inquiry forwards`);
    assert.ok(inq.includes('(q.get("category") || "").toLowerCase() === "store"'), `${lang} store inflow kept`);
    assert.ok(!xml.includes(`/${lang}/business/inquiry/`), `${lang} business/inquiry not in sitemap`);
  }
  for (const p of ["business/contact", "studio/contact"]) {
    const root = read(`${p}/index.html`);
    assert.ok(root.includes(`location.replace("/"+pref+"/${p}/"+(location.search||"")+(location.hash||""))`), `root ${p} keeps the query`);
  }
  assert.ok(read("contact/index.html").includes('+(location.search||"")+(location.hash||"")'), "root /contact/ keeps the query");
});

test("entry points outside the six platforms open /{lang}/contact/ with the right type (home, about, Business, Studio)", () => {
  const hrefs = (html) => [...main(html).matchAll(/href="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
  for (const lang of ["ko", "en", "de"]) {
    const home = hrefs(read(`${lang}/index.html`));
    assert.ok(home.includes(`/${lang}/contact/?type=partnership&source=home#contact-form`), `${lang} home partnership`);
    assert.ok(home.includes(`/${lang}/contact/?type=business&source=home#contact-form`), `${lang} home business inquiry`);
    assert.ok(home.includes(`/${lang}/contact/`), `${lang} home contact`);
    assert.ok(!home.some((h) => /business\/inquiry\/|collaboration\/partnership\//.test(h)), `${lang} home has no old inquiry links`);
    assert.ok(hrefs(read(`${lang}/about/index.html`)).includes("../contact/?type=partnership&source=about#contact-form"), `${lang} about`);
    for (const p of ["business", "business/platforms", "business/models", "business/partnerships"]) {
      const list = hrefs(read(`${lang}/${p}/index.html`));
      assert.ok(!list.some((h) => /business\/contact\/[?#]/.test(h)), `${lang}/${p} no old Business Contact links in the body`);
      const unified = list.filter((h) => h.startsWith(`/${lang}/contact/?`));
      assert.ok(unified.length >= 1, `${lang}/${p} links the unified page`);
      for (const h of unified) {
        const r = resolveContactParams(new URL(h, "https://x").searchParams);
        assert.ok(["business", "partnership", "public"].includes(r.category), `${lang}/${p} ${h}`);
        assert.equal(new URL(h, "https://x").searchParams.get("source"), "business");
      }
    }
    // partnership-type buttons on the Business partnerships screen are partnership inquiries
    const pa = hrefs(read(`${lang}/business/partnerships/index.html`)).filter((h) => h.startsWith(`/${lang}/contact/?type=partnership`));
    assert.ok(pa.length >= 2, `${lang} partnership buttons ${pa.length}`);
  }
  // the header CTA and company menu already open /{lang}/contact/ (checked in contact-page.test.mjs)
});
