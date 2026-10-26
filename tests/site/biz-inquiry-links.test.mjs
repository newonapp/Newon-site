/**
 * Six business sites (ONGIL · LIVON · SHAREON · BABYLOG · PETLOG · MY WORLD) × 5 pages × 9 languages:
 * every inquiry link opens the unified NEWON Contact page (owner, 2026-10-26).
 *
 *   /{lang}/contact/?platform=<biz>&type=<personal|business|public|partnership|investment|media>[&topic=…]&source=<biz>-<page>
 *
 * - same language prefix as the page; platform = the business; a valid primary type; source names the page
 * - topic (optional) only with an id of the unified page's taxonomy (scripts/contact-taxonomy.mjs when present)
 * - no link to the retired forms (/business/inquiry/, /business/contact/) or to the old …/{biz}/contact/?type= shortcuts
 * - an inquiry label ("문의하기", "Contact us", …) never points anywhere else
 * - e-mail stays only as a text address (the link text is the address itself)
 * - Contact pages: ONGIL-style sections, one label "문의하기"/"Contact us", none of the retired labels, no form
 * - the 05 Contact item of the business menu still opens the business's own Contact page
 * Run: node --test tests/site/biz-inquiry-links.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const BIZ = ["ongil", "livon", "shareon", "babylog", "petlog", "myworld"];
const PAGES = ["overview", "platform", "business", "partnerships", "contact"];
const TYPES = ["personal", "business", "public", "partnership", "investment", "media"];
const rel = (biz, page) => (page === "overview" ? `${biz}/` : `${biz}/${page}/`);
const decode = (h) => h.replace(/&amp;/g, "&");

/** Topic ids of the unified page: the taxonomy module once merged, otherwise the ids it defines today (ct-unified). */
let TOPICS = null;
const TAXONOMY = path.join(ROOT, "scripts", "contact-taxonomy.mjs");
if (fs.existsSync(TAXONOMY)) TOPICS = new Set(Object.keys((await import(TAXONOMY)).CONTACT_TOPIC_INDEX));
const FALLBACK_TOPICS = new Set([
  "ongil-senior", "ongil-guardian", "ongil-caregiver", "ongil-health", "ongil-welfare", "ongil-services", "ongil-bug", "ongil-partnership",
  "livon-lifecycle", "livon-welfare", "livon-living", "livon-account", "livon-ai", "livon-experts", "livon-bug", "livon-partnership",
  "shareon-sharing", "shareon-booking", "shareon-trade", "shareon-deposit", "shareon-payment", "shareon-dispute", "shareon-report",
  "shareon-provider", "shareon-business", "shareon-partnership",
  "babylog-pregnancy", "babylog-parenting", "babylog-growth", "babylog-family", "babylog-school", "babylog-safety", "babylog-institution",
  "babylog-bug", "babylog-partnership",
  "petlog-records", "petlog-health", "petlog-booking", "petlog-providers", "petlog-shelter", "petlog-business", "petlog-bug", "petlog-partnership",
  "myworld-map", "myworld-visits", "myworld-trips", "myworld-travel-services", "myworld-booking", "myworld-agencies", "myworld-tourism",
  "myworld-bug", "myworld-partnership",
]);
const validTopic = (id) => (TOPICS || FALLBACK_TOPICS).has(id);

/** The business's own markup: from its first-screen section to </main> (shared header/footer excluded). */
function own(html) {
  const starts = ['<div id="myworld-site"', '<section lang="en" id="lifestage-detail"', '<section id="lifestage-detail"', '<section id="ongil-detail"']
    .map((s) => html.indexOf(s))
    .filter((i) => i >= 0);
  assert.ok(starts.length, "business markup found");
  const start = Math.min(...starts);
  const end = html.indexOf("</main>");
  return html.slice(start, end > 0 ? end : undefined);
}
const isStub = (html) => /<meta http-equiv="refresh"/.test(html) && !/<main\b/.test(html);
const anchors = (html) =>
  [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    attrs: m[1],
    href: decode((m[1].match(/\bhref="([^"]*)"/) || [])[1] || ""),
    cls: (m[1].match(/\bclass="([^"]*)"/) || [])[1] || "",
    text: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  }));

/** Every rendered (non-stub) page of the six businesses. */
function pages() {
  const out = [];
  for (const biz of BIZ)
    for (const lang of LANGS)
      for (const page of PAGES) {
        const file = `${lang}/${rel(biz, page)}index.html`;
        if (!fs.existsSync(path.join(ROOT, file))) continue;
        out.push({ biz, lang, page, file, html: read(file) });
      }
  return out;
}
const ALL = pages();

const INQUIRY_LABEL = /^(문의하기|Contact us|문의 양식|문의 양식 열기|이메일 보내기|이메일로 문의하기|공식 문의 양식|Form|Email|Send an email|Open the inquiry form|Send an inquiry|お問い合わせ|파트너십 문의하기|파트너십 문의|Partnership inquiry|사업 문의하기|사업 문의|Business inquiry|협력 문의|Partnership inquiries|협력 제안하기|Propose a partnership)\s*[→↓]?$/;
const RETIRED_LABEL = /^(문의 양식|문의 양식 열기|이메일 보내기|이메일로 문의하기|공식 문의 양식|Form|Email|Send an email|Open the inquiry form)\s*[→↓]?$/;

test("all 30 pages exist for the six businesses (ONGIL's other locales forward to English)", () => {
  for (const biz of BIZ)
    for (const lang of LANGS)
      for (const page of PAGES) {
        const file = `${lang}/${rel(biz, page)}index.html`;
        assert.ok(fs.existsSync(path.join(ROOT, file)), file);
        const html = read(file);
        if (isStub(html)) {
          assert.equal(biz, "ongil", `${file} is a stub`);
          assert.match(html, new RegExp(`url=/en/ongil/${page}/`), `${file} forwards to EN`);
        }
      }
  assert.ok(ALL.filter((p) => !isStub(p.html)).length >= 5 * 6 * 2 + 5 * 5 * 7 + 7, "rendered pages");
});

test("every inquiry link opens /{lang}/contact/ with the business, a valid type and the page as source", () => {
  let n = 0;
  for (const p of ALL) {
    if (isStub(p.html)) continue;
    const body = own(p.html);
    for (const a of anchors(body)) {
      const h = a.href;
      assert.ok(!/(^|\/)business\/(inquiry|contact)\//.test(h), `${p.file}: retired form link ${h}`);
      assert.ok(!new RegExp(`(^|/)${p.biz}/contact/\\?`).test(h), `${p.file}: old ${p.biz}/contact/? shortcut ${h}`);
      const m = h.match(/^\/([a-z-]+)\/contact\/(\?.*)?$/);
      if (m) {
        n++;
        assert.equal(m[1], p.lang, `${p.file}: language prefix ${h}`);
        const q = new URLSearchParams((m[2] || "").slice(1).split("#")[0]);
        assert.equal(q.get("platform"), p.biz, `${p.file}: platform ${h}`);
        assert.ok(TYPES.includes(q.get("type")), `${p.file}: type ${h}`);
        assert.equal(q.get("source"), `${p.biz}-${p.page}`, `${p.file}: source ${h}`);
        if (q.has("topic")) assert.ok(validTopic(q.get("topic")) && q.get("topic").startsWith(`${p.biz}-`), `${p.file}: topic ${h}`);
      }
      if (INQUIRY_LABEL.test(a.text)) assert.ok(m, `${p.file}: "${a.text}" → ${h}`);
      if (h.startsWith("mailto:")) assert.equal(a.text, "newon@newon.app", `${p.file}: mailto must be a text address, got "${a.text}"`);
    }
  }
  assert.ok(n > 1000, `unified links checked: ${n}`);
});

test("Contact pages: ONGIL-style structure, one label 문의하기 / Contact us, no retired labels and no form", () => {
  for (const p of ALL.filter((x) => x.page === "contact" && !isStub(x.html))) {
    const body = own(p.html);
    const L = p.lang === "ko" ? "ko" : "en";
    const pre = p.biz === "ongil" ? "ogs" : "bct";
    if (p.biz !== "ongil") {
      assert.match(body, new RegExp(`<div id="bct-contact" class="bct" data-bct-biz="${p.biz}"`), p.file);
      assert.ok(p.html.includes("/biz-contact.css?v="), `${p.file}: kit stylesheet`);
      // ONGIL section order: channels → (route) → inquiry types → (next steps) → (before you contact) → (FAQ) → closing band
      const order = ["bct-channels", "bct-route", "bct-types", "bct-after", "bct-guard", "bct-faq", "bct-close"]
        .map((id) => body.indexOf(`<section id="${id}"`))
        .filter((i) => i >= 0);
      assert.deepEqual(order, [...order].sort((a, b) => a - b), `${p.file}: section order`);
      for (const id of ["bct-channels", "bct-types", "bct-guard", "bct-close"]) assert.ok(body.includes(`<section id="${id}"`), `${p.file} ${id}`);
    }
    const rows = anchors(body).filter((a) => a.cls === `${pre}-tlist__go`);
    assert.ok(rows.length >= 11, `${p.file}: inquiry rows ${rows.length}`);
    const label = L === "ko" ? "문의하기" : "Contact us";
    for (const r of rows) assert.equal(r.text, `${label} →`, `${p.file}: row label`);
    for (const a of anchors(body)) assert.ok(!RETIRED_LABEL.test(a.text), `${p.file}: retired label "${a.text}"`);
    assert.doesNotMatch(body, /<form\b|<input\b|<select\b|<textarea\b/, `${p.file}: no form on the business Contact page`);
    assert.doesNotMatch(body, /class="[^"]*tlist__ch/, `${p.file}: no Email/Form channel tags`);
    const close = body.slice(body.indexOf(`id="${pre}-close"`));
    assert.match(close, new RegExp(`href="/${p.lang}/contact/\\?platform=${p.biz}&amp;type=`), `${p.file}: closing band → unified page`);
  }
});

test("the 05 Contact menu item still opens each business's own Contact page", () => {
  for (const p of ALL) {
    if (isStub(p.html)) continue;
    const nav = (p.html.match(/<nav class="fsn"[\s\S]*?<\/nav>/) || [])[0];
    if (!nav) {
      assert.ok(p.biz === "ongil" && p.page === "overview" && !["ko", "en"].includes(p.lang), `${p.file}: business menu`);
      continue;
    }
    const contact = anchors(nav).find((a) => /\b05\b/.test(a.text));
    assert.ok(contact, `${p.file}: 05 item`);
    const target = path.posix.normalize(path.posix.join(`/${p.file.replace(/index\.html$/, "")}`, contact.href));
    assert.ok([`/${p.lang}/${p.biz}/contact/`, "/en/ongil/contact/"].includes(contact.href.startsWith("/") ? contact.href : target), `${p.file}: 05 → ${contact.href}`);
  }
});

test("the safety net maps any leftover old form link onto the unified page", async () => {
  const { toUnifiedContact, unifiedContactHref } = await import("../../scripts/unified-contact-links.mjs");
  const out = toUnifiedContact(
    '<a href="/ko/business/inquiry/?category=Partnership&amp;source=x#inquiry">a</a><a href="../../petlog/contact/?type=app-support#inquiry">b</a>' +
      '<a href="/ko/business/contact/?type=saas&amp;platform=livon">c</a><a href="/ko/petlog/contact/">menu</a><a href="mailto:newon@newon.app">newon@newon.app</a>',
    "ko",
    "petlog",
    "business"
  );
  assert.match(out, /href="\/ko\/contact\/\?platform=petlog&amp;type=partnership&amp;topic=petlog-partnership&amp;source=petlog-business">a/);
  assert.match(out, /href="\/ko\/contact\/\?platform=petlog&amp;type=personal&amp;source=petlog-business">b/);
  assert.match(out, /href="\/ko\/contact\/\?platform=petlog&amp;type=business&amp;source=petlog-business">c/);
  assert.match(out, /href="\/ko\/petlog\/contact\/">menu/);
  assert.match(out, /href="mailto:newon@newon.app"/);
  assert.equal(unifiedContactHref("ja", "myworld", { type: "press", source: "myworld-contact" }), "/ja/contact/?platform=myworld&type=media&source=myworld-contact");
});
