/**
 * NEWON Business & Partnerships — five hub screens (2026-10-19 owner brief).
 * Run: node --test tests/site/bizpart.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BIZPART_PATHS, LEGACY_REDIRECTS } from "../../scripts/render-bizpart.mjs";
import { BP_PLATFORMS, BP_FILMS, BP_PAGE_FILM, BP_NAV, BP_INQUIRY_TYPES, BP_INQUIRY_PLATFORMS } from "../../scripts/bizpart-content.mjs";
import { renderFlagshipSubnav } from "../../scripts/flagship-subnav.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const header = (html) => (html.match(/<header class="gnav[\s\S]*?<\/header>/) || [""])[0];
const footerNav = (html) => (html.match(/<nav class="site-foot__nav"[^>]*>([\s\S]*?)<\/nav>/) || ["", ""])[1];
const own = (html) => (html.match(/<section id="lifestage-detail"[\s\S]*<\/section>\s*<\/main>/) || [""])[0];
const text = (html) => own(html).replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
const pageRel = (lang, p) => `${lang}/${p}/index.html`;
const STUDIO_FILM = "hf_20260622_202655_a7f5aca0-2f80-4bc9-bcb5-96ac95662003.mp4";
const PARTNER_FILM = "hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

test("five screens in nine locales: one h1, canonical, 9+1 hreflang, JSON-LD, merged menu, sub-menu", () => {
  assert.deepEqual(BIZPART_PATHS, ["business", "business/platforms", "business/models", "business/partnerships", "business/contact"]);
  for (const lang of LANGS) {
    for (const p of BIZPART_PATHS) {
      const rel = pageRel(lang, p);
      assert.ok(exists(rel), `${rel} missing`);
      const html = read(rel);
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${rel} one h1`);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.newon\\.app/${lang}/${p}/"`), `${rel} canonical`);
      assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 10, `${rel} hreflang`);
      for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
      assert.ok(!/http-equiv="refresh"/.test(html), `${rel} is a real page`);
      assert.ok(html.includes('data-story="bizpart"'), `${rel} bizpart section`);
      assert.match(html, /<nav class="fsn" data-biz="bizpart"/, `${rel} five-menu bar`);
      assert.equal((html.match(/class="fsn__a"/g) || []).length, 5, `${rel} five sub-menu items`);
      assert.ok(html.includes("/bizpart-site.css?v="), `${rel} stylesheet`);
      assert.ok(html.includes("/film-keep.js"), `${rel} film-keep`);
      if (lang !== "ko" && lang !== "en") assert.match(html, /data-story="bizpart" data-bpt-page="[a-z]+" lang="en"/, `${rel} English body marked`);
      if (lang !== "ko") assert.ok(!/[가-힣]/.test(text(html)), `${rel} no Korean in the body`);
    }
  }
});

test("hero films: Studio film on Overview / Our Platforms / Business Models, Partnerships film on Partnerships / Contact", () => {
  assert.ok(BP_FILMS.studio.endsWith(STUDIO_FILM));
  assert.ok(BP_FILMS.partnerships.endsWith(PARTNER_FILM));
  // the films are the ones the Studio and the old Partnerships first screens use
  assert.ok(read("ko/studio/index.html").includes(STUDIO_FILM), "Studio hero film");
  assert.ok(read("scripts/bsp-content.mjs").includes(PARTNER_FILM), "Partnerships hero film");
  for (const nav of BP_NAV) {
    const want = BP_PAGE_FILM[nav.id] === "studio" ? STUDIO_FILM : PARTNER_FILM;
    const other = want === STUDIO_FILM ? PARTNER_FILM : STUDIO_FILM;
    for (const lang of ["ko", "en", "de"]) {
      const html = read(pageRel(lang, nav.sub ? `business/${nav.sub}` : "business"));
      assert.ok(html.includes(`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/${want}`), `${lang} ${nav.id} film`);
      assert.ok(!html.includes(other), `${lang} ${nav.id} has only its own film`);
    }
  }
  assert.deepEqual(BP_PAGE_FILM, { overview: "studio", platforms: "studio", models: "studio", partnerships: "partnerships", contact: "partnerships" });
});

test("global header: one Business & Partnerships menu with the five screens; footer link merged", () => {
  for (const rel of ["ko/index.html", "ko/business/index.html", "en/about/index.html", "ja/studio/index.html", "ko/babylog/index.html", "id/contact/index.html"]) {
    const html = read(rel);
    const h = header(html);
    assert.ok(!h.includes('data-gnav-menu="partnerships"') && !h.includes('data-gnav-mega="partnerships"'), `${rel} no separate Partnerships`);
    const panel = h.match(/data-gnav-mega="business"[\s\S]*?<p class="gnav-mega__foot">/)[0];
    const hrefs = [...panel.matchAll(/class="gnav-mega__row" href="([^"]+)"/g)].map((m) => m[1].replace(/^(?:\.\.\/)+|^\/[a-z-]+\//, ""));
    assert.deepEqual(hrefs, ["business/", "business/platforms/", "business/models/", "business/partnerships/", "business/contact/"], `${rel} mega rows`);
    const fn = footerNav(html);
    assert.ok(/business\/">/.test(fn) && !/(?<![a-z-])partnerships\/">/.test(fn), `${rel} footer`);
  }
  assert.match(header(read("ko/about/index.html")), /비즈니스·파트너십<svg/);
  assert.match(header(read("en/about/index.html")), /Business &amp; Partnerships<svg/);
  assert.match(footerNav(read("ko/about/index.html")), />비즈니스·파트너십<\/a>/);
});

test("the six business sites' sub-menus are unchanged by the bizpart option", () => {
  for (const biz of ["babylog", "petlog", "myworld", "shareon", "livon", "ongil"]) {
    const html = read(`ko/${biz}/index.html`);
    const bar = html.match(/<nav class="fsn" data-biz="[a-z]+"[\s\S]*?<\/nav>/)[0];
    assert.equal(bar, renderFlagshipSubnav({ biz, lang: "ko", active: "overview" }), biz);
  }
  const bp = renderFlagshipSubnav({ biz: "bizpart", lang: "ko", active: "models" });
  assert.match(bp, /href="\/ko\/business\/models\/" aria-current="page"/);
  for (const k of ["개요", "플랫폼", "비즈니스 모델", "파트너십", "문의"]) assert.ok(bp.includes(`<span class="fsn__ko">${k}</span>`), k);
  assert.ok(bp.includes("BUSINESS &amp; PARTNERSHIPS"));
});

test("the twelve platform Business / Partnerships links exist and stay on their own platform and language", () => {
  assert.equal(BP_PLATFORMS.length, 6);
  for (const lang of LANGS) {
    const ov = read(pageRel(lang, "business"));
    const pl = read(pageRel(lang, "business/platforms"));
    for (const p of BP_PLATFORMS) {
      for (const kind of ["business", "partnerships"]) {
        const href = `/${lang}/${p.slug}/${kind}/`;
        assert.ok(exists(`${lang}/${p.slug}/${kind}/index.html`), `${href} exists`);
        assert.ok(ov.includes(`href="${href}"`), `Overview links ${href}`);
        assert.ok(pl.includes(`href="${href}"`), `Our Platforms links ${href}`);
      }
      assert.ok(read(pageRel(lang, "business/partnerships")).includes(`href="/${lang}/${p.slug}/partnerships/"`), `${lang} Partnerships → ${p.slug}`);
    }
    // ko/en detail pages are real pages (not redirect stubs)
    if (lang === "ko" || lang === "en") {
      for (const p of BP_PLATFORMS) for (const kind of ["business", "partnerships"]) {
        assert.ok(!/http-equiv="refresh"/.test(read(`${lang}/${p.slug}/${kind}/index.html`)), `${lang}/${p.slug}/${kind} is a page`);
      }
    }
  }
});

test("ko / en copy: no outsourcing offers, prices, quotes or invented track records", () => {
  const offer = /견적 문의|견적 요청하기|제작 문의|제작 상담|외주 개발 문의|프로젝트 문의|시작가|제작비|부터 시작|Request a quote|Get a quote|Project inquiry|Start a project|starting at|from ₩/i;
  const money = /[₩$€]\s?\d|\d[\d,]*\s?(원|만원|KRW|USD)\b/;
  const record = /고객사 \d|\d+개 기업|\d+곳의 파트너|누적 거래|매출 \d|trusted by \d|\d+\+? (clients|partners|customers)\b/i;
  const status = /data-bsp-status|bl-status|bpt-status|class="[^"]*status/;
  for (const lang of ["ko", "en"]) {
    for (const p of BIZPART_PATHS) {
      const html = read(pageRel(lang, p));
      const t = text(html);
      assert.doesNotMatch(t, offer, `${lang}/${p} outsourcing offer`);
      assert.doesNotMatch(t, money, `${lang}/${p} price`);
      assert.doesNotMatch(t, record, `${lang}/${p} track record`);
      assert.doesNotMatch(own(html), status, `${lang}/${p} per-card status badge`);
      assert.doesNotMatch(own(html), /<img\b/, `${lang}/${p} no logos / images`);
    }
  }
  // exactly one shared notice, only on Business Models and Partnerships
  for (const lang of ["ko", "en"]) {
    for (const p of BIZPART_PATHS) {
      const n = (read(pageRel(lang, p)).match(/class="nls-note bpt-scope"/g) || []).length;
      assert.equal(n, p === "business/models" || p === "business/partnerships" ? 1 : 0, `${lang}/${p} notice count`);
    }
  }
  assert.ok(read(pageRel("ko", "business/models")).includes("NEWON은 자체 플랫폼을 기반으로 다양한 비즈니스 모델을 발전시키고 있습니다. 실제 제공 서비스와 계약 조건은 플랫폼 및 운영 단계에 따라 달라질 수 있습니다."));
});

test("screen contents: 6 platforms, 4 approaches, 6 ecosystem roles, 6 models, 6 principles, 6 partnership types, 5 steps", () => {
  const count = (rel, re) => (read(rel).match(re) || []).length;
  for (const lang of ["ko", "en"]) {
    assert.equal(count(pageRel(lang, "business"), /class="bpt-biz bpt-plat"/g), 6);
    assert.equal(count(pageRel(lang, "business"), /class="nls-flow__item"/g), 4);
    assert.equal(count(pageRel(lang, "business"), /class="nls-proc__item"/g), 6);
    assert.equal(count(pageRel(lang, "business/platforms"), /<article id="platform-/g), 6);
    assert.equal(count(pageRel(lang, "business/models"), /<article id="model-/g), 6);
    assert.equal(count(pageRel(lang, "business/models"), /<ol class="nls-dir">(?:[\s\S]*?<li>){6}/g), 1);
    assert.equal(count(pageRel(lang, "business/partnerships"), /<article id="type-/g), 6);
    assert.equal(count(pageRel(lang, "business/partnerships"), /class="nls-pipe__item/g), 5);
  }
  assert.match(read(pageRel("ko", "business")), /여섯 개의 플랫폼,<br>더 넓은 비즈니스의 가능성\./);
  assert.match(read(pageRel("ko", "business")), /<title>NEWON Business &amp; Partnerships \| 플랫폼 비즈니스·기업 제휴<\/title>/);
  assert.match(read(pageRel("ko", "business/contact")), /<title>Business Contact \| NEWON<\/title>/);
});

test("Business Contact: existing inquiry mechanism, platform + type selects, consent, honeypot, no extra data", () => {
  assert.equal(BP_INQUIRY_TYPES.length, 10);
  assert.equal(BP_INQUIRY_PLATFORMS.length, 8);
  for (const lang of LANGS) {
    const html = read(pageRel(lang, "business/contact"));
    const form = html.match(/<form[\s\S]*?<\/form>/)[0];
    assert.match(form, /<form class="bz-form" id="bz-inquiry-form" novalidate/);
    assert.doesNotMatch(form.split(">")[0], /\saction=/, `${lang} no action URL`);
    for (const name of ["name", "company", "email", "platform", "type", "message", "consent", "_honey", "category"]) assert.ok(form.includes(`name="${name}"`), `${lang} field ${name}`);
    for (const name of ["phone", "budget", "website", "timeline", "stage"]) assert.ok(!form.includes(`name="${name}"`), `${lang} must not collect ${name}`);
    assert.match(form, /name="consent" type="checkbox" value="yes" required/);
    assert.match(form, /id="bz-email" name="email" type="email" required/);
    assert.match(form, /<select id="bpt-platform" name="platform" required>/);
    assert.match(form, /<select id="bz-type" name="type" required>/);
    const types = [...form.match(/<select id="bz-type"[\s\S]*?<\/select>/)[0].matchAll(/data-code="([a-z]+)"/g)].map((m) => m[1]);
    assert.deepEqual(types, BP_INQUIRY_TYPES.map((t) => t.code));
    const plats = [...form.match(/<select id="bpt-platform"[\s\S]*?<\/select>/)[0].matchAll(/data-code="([a-z]+)"/g)].map((m) => m[1]);
    assert.deepEqual(plats, ["babylog", "petlog", "myworld", "shareon", "livon", "ongil", "multiple", "general"]);
    assert.ok(html.includes('/business/inquiry.js?v='), `${lang} reuses inquiry.js`);
    assert.ok(html.includes('id="bz-fail"') && html.includes('id="bz-submit"'), `${lang} submit + failure message`);
    assert.ok(html.includes("mailto:newon@newon.app"), `${lang} contact e-mail`);
    assert.ok(!/외주|맞춤 개발|유지보수 의뢰/.test(form), `${lang} no outsourcing types`);
  }
  // inquiry.js keeps working for the six business sites and adds the platform line to the e-mail fallback only
  const js = read("business/inquiry.js");
  assert.ok(js.includes('"platform",'), "mail fallback includes platform");
  assert.ok(js.includes('var ENDPOINT = "https://formsubmit.co/ajax/" + INBOX;'));
  assert.ok(exists("ko/business/inquiry/index.html") && read("ko/business/inquiry/index.html").includes('id="bz-inquiry-form"'), "shared inquiry page kept");
});

test("retired URLs are noindex redirect stubs to the right new screen (lang + root), and not in the sitemap", () => {
  const xml = read("sitemap.xml");
  const targets = new Set(Object.values(LEGACY_REDIRECTS));
  for (const t of targets) {
    if (t.startsWith("business/")) assert.ok(BIZPART_PATHS.includes(t.replace(/\/$/, "")), `${t} is a new screen`);
    else assert.match(t, /^(babylog|petlog|myworld|shareon|livon|ongil)\/partnerships\/$/, `${t} is a platform page`);
  }
  for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
    for (const lang of LANGS) {
      const html = read(`${lang}/${from}/index.html`);
      assert.match(html, /<meta name="robots" content="noindex, follow" \/>/, `${lang}/${from} noindex`);
      assert.ok(html.includes(`<link rel="canonical" href="https://www.newon.app/${lang}/${to}" />`), `${lang}/${from} canonical`);
      assert.ok(html.includes(`<meta http-equiv="refresh" content="0;url=/${lang}/${to}" />`), `${lang}/${from} refresh`);
      assert.ok(html.includes(`location.replace("/${lang}/${to}"`), `${lang}/${from} js`);
      assert.ok(exists(`${lang}/${to}index.html`), `${lang}/${to} target exists`);
      assert.ok(!xml.includes(`<loc>https://www.newon.app/${lang}/${from}/</loc>`), `${lang}/${from} out of sitemap`);
    }
    const root = read(`${from}/index.html`);
    assert.ok(root.includes(`url=/ko/${to}`) && root.includes(`"/"+pref+"/${to}"`), `root /${from}/ → ${to}`);
  }
  // the outsourcing pages go to Overview / Models, the inquiry page to Contact
  for (const k of ["business/build", "business/mvp", "business/web", "business/app", "business/landing", "business/website-renewal", "business/maintenance", "business/care"]) assert.equal(LEGACY_REDIRECTS[k], "business/");
  assert.equal(LEGACY_REDIRECTS["partnerships/inquiry"], "business/contact/");
  assert.equal(LEGACY_REDIRECTS.partnerships, "business/partnerships/");
  for (const lang of LANGS) for (const p of BIZPART_PATHS) assert.equal(xml.split(`<loc>https://www.newon.app/${lang}/${p}/</loc>`).length - 1, 1, `${lang}/${p} in sitemap once`);
  // pages that are not retired keep their place
  for (const keep of ["business/inquiry", "business/inquiry/success"]) assert.ok(!(keep in LEGACY_REDIRECTS));
});

test("every local link on the five ko / en screens resolves", () => {
  const resolves = (href) => {
    const clean = href.split("#")[0].split("?")[0];
    if (!clean || /^(?:[a-z]+:|\/\/)/i.test(clean)) return true;
    const abs = path.join(ROOT, clean);
    return (fs.existsSync(abs) && fs.statSync(abs).isFile()) || fs.existsSync(path.join(abs, "index.html"));
  };
  for (const lang of ["ko", "en"]) {
    for (const p of BIZPART_PATHS) {
      const html = read(pageRel(lang, p));
      for (const m of own(html).matchAll(/<a\b[^>]*?\shref="(\/[^"]*)"/g)) assert.ok(resolves(m[1].replace(/&amp;/g, "&")), `${lang}/${p}: ${m[1]}`);
    }
  }
});
