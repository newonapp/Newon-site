/**
 * NEWON Studio — eleven screens (owner brief "NEWON STUDIO — CONTENT DEPTH EXPANSION", 2026-10-19).
 * Run: node --test tests/site/studio-site.test.mjs   (reads the committed / built HTML in the repo; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { STUDIO_SCREENS, STUDIO_SITE_PATHS, LEGACY_STUDIO_REDIRECTS, getStudioCopy } from "../../scripts/render-studio-site.mjs";
import { ST_PLATFORMS, ST_FILM, ST_INQUIRY_TYPES } from "../../scripts/studio-site-content.mjs";
import { STUDIO_PAGE_FILM_SRC, STUDIO_FILM_SRC } from "../../scripts/studio-film-copy.mjs";
import { MEGA_DESTINATIONS } from "../../scripts/venture-studio-data.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const header = (html) => (html.match(/<header class="gnav[\s\S]*?<\/header>/) || [""])[0];
const own = (html) => (html.match(/<section id="lifestage-detail"[\s\S]*<\/section>\s*<\/main>/) || [""])[0];
const strip = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/\s+/g, " ");
const text = (html) => strip(own(html));
const section = (html, id) => (own(html).match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`)) || [""])[0];
const rel = (lang, p) => `${lang}/${p}/index.html`;
const OWNER_FILM = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260819_212700_3bb9329b-5c50-4257-a09b-ca85cf3654a3.mp4";

test("eleven screens in nine locales: one h1, canonical, 9+1 hreflang, JSON-LD, studio section, five-item sub-menu", () => {
  assert.equal(STUDIO_SCREENS.length, 11);
  assert.deepEqual(STUDIO_SITE_PATHS, [
    "studio",
    "studio/store",
    "studio/platforms",
    "studio/business",
    "studio/contact",
    ...["babylog", "petlog", "myworld", "shareon", "livon", "ongil"].map((p) => `studio/platforms/${p}`),
  ]);
  for (const lang of LANGS) {
    for (const s of STUDIO_SCREENS) {
      const p = s.sub ? `studio/${s.sub}` : "studio";
      const r = rel(lang, p);
      assert.ok(exists(r), `${r} missing`);
      const html = read(r);
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${r} one h1`);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.newon\\.app/${lang}/${p}/"`), `${r} canonical`);
      assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 10, `${r} hreflang`);
      for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
      assert.ok(!/http-equiv="refresh"/.test(html), `${r} is a real page`);
      assert.ok(html.includes(`data-story="studio" data-sts-page="${s.id}"`), `${r} studio section`);
      assert.match(html, /<nav class="fsn" data-biz="studio"/, `${r} five-menu bar`);
      const bar = html.match(/<nav class="fsn" data-biz="studio"[\s\S]*?<\/nav>/)[0];
      assert.equal((bar.match(/class="fsn__a"/g) || []).length, 5, `${r} five sub-menu items`);
      const active = s.platform ? "platforms/" : s.sub ? `${s.sub}/` : "";
      assert.match(bar, new RegExp(`href="/${lang}/studio/${active.replace(/\//g, "\\/")}" aria-current="page"`), `${r} active item`);
      assert.ok(bar.includes("NEWON STUDIO"), `${r} brand label`);
      assert.ok(html.includes("/studio-site.css?v="), `${r} stylesheet`);
      assert.ok(html.includes("/film-keep.js"), `${r} film-keep`);
      assert.ok(header(html).includes('gnav-dd gnav-dd--active" data-gnav-dd data-gnav-menu="studio"'), `${r} Studio menu active`);
      if (lang !== "ko" && lang !== "en") assert.match(html, /data-story="studio" data-sts-page="[a-z]+" lang="en"/, `${r} English body marked`);
      if (lang !== "ko") assert.ok(!/[가-힣]/.test(text(html)), `${r} no Korean in the body`);
    }
  }
  const bar = read("ko/studio/index.html").match(/<nav class="fsn" data-biz="studio"[\s\S]*?<\/nav>/)[0];
  for (const k of ["개요", "스토어", "플랫폼", "기업용 제품", "문의"]) assert.ok(bar.includes(`<span class="fsn__ko">${k}</span>`), k);
  for (const k of ["Overview", "Digital Store", "Our Platforms", "Business Products", "Contact"]) assert.ok(bar.includes(`<span class="fsn__en">${k}</span>`), k);
});

test("first screen: the owner's Studio page film on all eleven screens; home Studio card film unchanged", () => {
  assert.equal(STUDIO_PAGE_FILM_SRC, OWNER_FILM);
  assert.equal(ST_FILM, OWNER_FILM);
  assert.ok(read("scripts/studio-film-copy.mjs").includes("hf_20260622_202655_a7f5aca0"), "home Studio card film constant kept");
  assert.notEqual(STUDIO_FILM_SRC, OWNER_FILM);
  for (const lang of LANGS) {
    for (const p of STUDIO_SITE_PATHS) {
      const html = read(rel(lang, p));
      const vids = [...own(html).matchAll(/<video[^>]*src="([^"]+)"/g)].map((m) => m[1]);
      assert.deepEqual(vids, [OWNER_FILM], `${lang}/${p} film`);
      assert.match(own(html), /<p class="nls-film__wordmark" lang="en">[^<]+<\/p>\s*<h1 id="sts-title" class="nls-film__slogan">/, `${lang}/${p} wordmark + headline`);
      assert.equal((own(html).match(/class="nls-film__actions">[\s\S]*?<\/div>/)[0].match(/class="nls-btn/g) || []).length, 2, `${lang}/${p} two buttons`);
    }
  }
  // the unified-hero override leaves the Studio and Business & Partnerships first screens on their own design
  const css = read("home-lifestage.css");
  assert.ok(css.includes('#lifestage-detail.nls:not([data-story="bizpart"]):not([data-story="studio"]) .nls-film {'));
  assert.ok(!/#lifestage-detail\.nls:not\(\[data-story="bizpart"\]\) /.test(css), "every unified-hero rule excludes Studio too");
});

test("global header: Studio dropdown lists the five screens (desktop and mobile); other menus unchanged", () => {
  assert.deepEqual(MEGA_DESTINATIONS.studio.map((d) => d.href), ["studio/", "studio/store/", "studio/platforms/", "studio/business/", "studio/contact/"]);
  const samples = ["ko/index.html", "en/about/index.html", "ja/studio/store/index.html", "ko/business/index.html", "de/babylog/index.html", "id/tools/qr/index.html", "ko/resources/store/newon-project-starter-kit/index.html"];
  for (const r of samples) {
    const h = header(read(r));
    const panel = h.match(/data-gnav-mega="studio"[\s\S]*?<p class="gnav-mega__foot">/)[0];
    const hrefs = [...panel.matchAll(/class="gnav-mega__row" href="([^"]+)"/g)].map((m) => m[1].replace(/^(?:\.\.\/)+|^\/[a-z-]+\//, ""));
    assert.deepEqual(hrefs, ["studio/", "studio/store/", "studio/platforms/", "studio/business/", "studio/contact/"], `${r} studio mega`);
    const acc = h.match(/<a class="gnav-mobile__acc-link" href="[^"]*studio\/">[\s\S]*?<div class="gnav-mobile__acc-panel" hidden>([\s\S]*?)<\/div>/)[1];
    assert.equal((acc.match(/gnav-mobile__sublink/g) || []).length, 5, `${r} mobile studio items`);
    const biz = h.match(/data-gnav-mega="business"[\s\S]*?<p class="gnav-mega__foot">/)[0];
    const bh = [...biz.matchAll(/class="gnav-mega__row" href="([^"]+)"/g)].map((m) => m[1].replace(/^(?:\.\.\/)+|^\/[a-z-]+\//, ""));
    assert.deepEqual(bh, ["business/", "business/platforms/", "business/models/", "business/partnerships/", "business/contact/"], `${r} business mega unchanged`);
  }
  const ko = header(read("ko/about/index.html"));
  for (const k of ["개요", "스토어", "플랫폼", "기업용 제품", "문의"]) assert.ok(ko.includes(`<span class="gnav-mega__row-title">${k}</span>`), `ko mega ${k}`);
  assert.ok(header(read("en/about/index.html")).includes('<span class="gnav-mega__row-title">Business Products</span>'));
  // no committed page keeps the old Studio menu rows
  for (const r of ["ko/index.html", "en/portfolio/index.html", "fr/ai/index.html"]) assert.ok(!header(read(r)).includes("studio/design-systems/"), `${r} old studio row`);
});

test("old Studio URLs are redirect stubs (noindex, canonical, refresh, location.replace) to existing new screens", () => {
  assert.equal(Object.keys(LEGACY_STUDIO_REDIRECTS).length, 25);
  for (const [from, to] of Object.entries(LEGACY_STUDIO_REDIRECTS)) {
    assert.ok(STUDIO_SITE_PATHS.includes(to.replace(/\/$/, "")), `${from} → ${to} is a new screen`);
    for (const lang of LANGS) {
      const html = read(rel(lang, from));
      const target = `/${lang}/${to}`;
      assert.match(html, /<meta name="robots" content="noindex, follow"/, `${lang}/${from} noindex`);
      assert.ok(html.includes(`<link rel="canonical" href="https://www.newon.app${target}"`), `${lang}/${from} canonical`);
      assert.ok(html.includes(`<meta http-equiv="refresh" content="0;url=${target}"`), `${lang}/${from} refresh`);
      assert.ok(html.includes(`location.replace(${JSON.stringify(target)}`), `${lang}/${from} location.replace`);
      assert.ok(!html.includes("<main"), `${lang}/${from} has no body`);
    }
    const root = read(`${from}/index.html`);
    assert.ok(root.includes(`content="0;url=/ko/${to}"`) && root.includes("noindex"), `/${from}/ root stub`);
  }
  // /studio/contact/ stays a real page (now the Contact screen)
  assert.ok(!/http-equiv="refresh"/.test(read("ko/studio/contact/index.html")));
  const xml = read("sitemap.xml");
  for (const from of Object.keys(LEGACY_STUDIO_REDIRECTS)) for (const lang of LANGS) assert.ok(!xml.includes(`<loc>https://www.newon.app/${lang}/${from}/</loc>`), `${lang}/${from} not in sitemap`);
});

test("ko / en copy: no prices, currency, percentages, quotes or invented track records; candidates never on sale", () => {
  const price = /₩|\$\s?\d|%|가격은\s*\d|\d[\d,]*\s?원(?![가-힣])|\bKRW\b|\bUSD\b/;
  const record = /고객사|누적|만 명|다운로드 수|리뷰|후기 \d|매출 \d|revenue of|customers trust|reviews?:|rated \d|\d+ (users|customers|downloads)/i;
  const offer = /견적 문의|견적 요청|외주 제작 문의|제작 문의|프로젝트 상담|맞춤 제작해 드립니다|Request a quote|Get a quote|Start a project|Project inquiry/i;
  for (const lang of ["ko", "en"]) {
    for (const p of STUDIO_SITE_PATHS) {
      const t = text(read(rel(lang, p)));
      assert.doesNotMatch(t, price, `${lang}/${p} price`);
      assert.doesNotMatch(t, record, `${lang}/${p} track record`);
      assert.doesNotMatch(t, offer, `${lang}/${p} outsourcing offer`);
      // one shared notice per page at most, and every page that shows products or product families has it
      const notices = (own(read(rel(lang, p))).match(/class="nls-note sts-scope"/g) || []).length;
      assert.ok(notices <= 1, `${lang}/${p} one notice`);
      if (p !== "studio/contact") assert.equal(notices, 1, `${lang}/${p} has the notice`);
    }
    // candidates: tagged as candidates, never as on sale
    const onSale = /판매 중입니다|지금 구매|구매할 수 있습니다|바로 구매|출시되었습니다|on sale now|buy now|now available|available to buy/i;
    for (const pl of ST_PLATFORMS) {
      const html = read(rel(lang, `studio/platforms/${pl.id}`));
      const sec = section(html, "sts-products");
      const n = Number((sec.match(/data-sts-candidates="(\d+)"/) || [])[1]);
      assert.ok(n >= 5 && n <= 8, `${lang} ${pl.id} 5–8 candidates (${n})`);
      assert.equal((sec.match(/class="nls-board__tag">/g) || []).length, n, `${lang} ${pl.id} each candidate tagged`);
      assert.doesNotMatch(strip(sec), onSale, `${lang} ${pl.id} candidates not on sale`);
      assert.ok(!own(html).includes("sts-avail"), `${lang} ${pl.id} shows no 'available' card`);
    }
    // "available" only for the two real products, linked to their real pages
    for (const p of ["studio", "studio/store"]) {
      const o = own(read(rel(lang, p)));
      const avail = o.match(/<ul class="sts-cards sts-cards--2 sts-avail">[\s\S]*?<\/ul>/)[0];
      const links = [...avail.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      assert.deepEqual(links, [`/${lang}/tools/`, `/${lang}/resources/store/newon-project-starter-kit/`], `${lang}/${p} available products`);
      for (const l of links) assert.ok(exists(`${l.replace(/^\//, "")}index.html`), `${l} exists`);
      assert.equal((o.match(/sts-avail/g) || []).length, 1, `${lang}/${p} one available list`);
    }
  }
});

test("FAQ, use-case and content counts follow the brief; platform pages are not copies of each other", () => {
  const faqCount = (html) => Number((own(html).match(/data-sts-faq="(\d+)"/) || [])[1]);
  const want = { studio: [6, 8], "studio/store": [6, 8], "studio/business": [8, 10], "studio/contact": [6, 8], "studio/platforms": [4, 6] };
  for (const lang of ["ko", "en", "de"]) {
    for (const [p, [lo, hi]] of Object.entries(want)) {
      const n = faqCount(read(rel(lang, p)));
      assert.ok(n >= lo && n <= hi, `${lang}/${p} FAQ ${n}`);
    }
    for (const pl of ST_PLATFORMS) {
      const html = read(rel(lang, `studio/platforms/${pl.id}`));
      const n = faqCount(html);
      assert.ok(n >= 4 && n <= 6, `${lang} ${pl.id} FAQ ${n}`);
      const cases = (section(html, "sts-cases").match(/class="nls-flow__item"/g) || []).length;
      assert.ok(cases >= 3 && cases <= 4, `${lang} ${pl.id} use cases ${cases}`);
      for (const id of ["sts-purpose", "sts-personal", "sts-biz", "sts-products", "sts-cases", "sts-fit", "sts-links", "sts-faq"]) assert.ok(section(html, id), `${lang} ${pl.id} ${id}`);
      // links: this page's product list, business products for this industry, the platform's own site
      const links = section(html, "sts-links");
      assert.ok(links.includes('href="#sts-products"'), `${lang} ${pl.id} product list link`);
      assert.ok(links.includes(`href="/${lang}/studio/business/#industry-${pl.id}"`), `${lang} ${pl.id} business link`);
      assert.ok(links.includes(`href="/${lang}/${pl.site}/"`), `${lang} ${pl.id} platform link`);
      assert.ok(own(read(rel(lang, "studio/business"))).includes(`id="industry-${pl.id}"`), `industry-${pl.id} anchor`);
      // in-page switcher between the six
      const sw = own(html).match(/<nav class="sts-switch"[\s\S]*?<\/nav>/)[0];
      assert.equal((sw.match(/class="sts-switch__a"/g) || []).length, 6, `${lang} ${pl.id} switcher`);
      assert.match(sw, new RegExp(`href="/${lang}/studio/platforms/${pl.id}/" aria-current="page"`), `${lang} ${pl.id} switcher current`);
    }
  }
  // no empty title-only sections on any screen
  for (const lang of ["ko", "en"]) {
    for (const p of STUDIO_SITE_PATHS) {
      for (const m of own(read(rel(lang, p))).matchAll(/<section id="(sts-[a-z-]+)" class="nls-block[^"]*"[^>]*>([\s\S]*?)<\/section>/g)) {
        const body = strip(m[2].replace(/<header class="nls-head">[\s\S]*?<\/header>/, ""));
        assert.ok(body.trim().length > 80, `${lang}/${p} #${m[1]} has content beyond its title`);
      }
    }
  }
  // distinct candidates per platform (not one list with the name swapped)
  for (const L of ["ko", "en"]) {
    const C = getStudioCopy(L);
    const names = ST_PLATFORMS.flatMap((p) => C.plat[p.id].products.map((x) => x.name));
    assert.equal(new Set(names).size, names.length, `${L} candidate names unique`);
    const leads = ST_PLATFORMS.map((p) => C.plat[p.id].hero.lead);
    assert.equal(new Set(leads).size, 6, `${L} platform leads unique`);
  }
});

test("regulated areas: care, health and finance products stay on records (no diagnosis / treatment / professional-service wording)", () => {
  const med = /진단|치료|처방|진료|투약 지도|요양 서비스를 제공|diagnos|treatment|prescri|medical advice|financial advice we provide/i;
  for (const lang of ["ko", "en"]) {
    for (const id of ["babylog", "petlog", "ongil", "livon"]) {
      const t = text(read(rel(lang, `studio/platforms/${id}`)));
      assert.doesNotMatch(t, med, `${lang} ${id}`);
      assert.ok(own(read(rel(lang, `studio/platforms/${id}`))).includes('class="nls-note sts-caution"'), `${lang} ${id} caution note`);
    }
  }
});

test("Contact reuses the existing inquiry mechanism with ?type= / ?area= prefill; the shared inquiry page is untouched", () => {
  for (const lang of LANGS) {
    const html = read(rel(lang, "studio/contact"));
    assert.ok(html.includes('<form class="bz-form" id="bz-inquiry-form" novalidate data-analytics="studio_inquiry"'), `${lang} form`);
    assert.ok(html.includes('<script src="/business/inquiry.js?v='), `${lang} inquiry.js`);
    assert.ok(html.includes('<input type="hidden" name="category" value="NEWON Studio" />'), `${lang} category`);
    assert.ok(html.includes('name="_honey"'), `${lang} honeypot`);
    const sel = html.match(/<select id="bz-type"[\s\S]*?<\/select>/)[0];
    assert.deepEqual([...sel.matchAll(/data-code="([^"]+)"/g)].map((m) => m[1]), ST_INQUIRY_TYPES.map((t) => t.code), `${lang} types`);
    assert.ok(html.includes('pre("bz-type", p.get("type"));') && html.includes('pre("sts-area", p.get("area") || p.get("platform"));'), `${lang} prefill`);
    for (const t of ST_INQUIRY_TYPES) assert.ok(html.includes(`href="?type=${t.code}#sts-form"`), `${lang} type card ${t.code}`);
  }
  // links into the Contact screen use known type codes
  const codes = new Set(ST_INQUIRY_TYPES.map((t) => t.code));
  for (const lang of ["ko", "en"]) {
    for (const p of STUDIO_SITE_PATHS) {
      for (const m of read(rel(lang, p)).matchAll(/href="\/[a-z-]+\/studio\/contact\/\?type=([a-z]+)/g)) assert.ok(codes.has(m[1]), `${lang}/${p} ?type=${m[1]}`);
    }
  }
  assert.ok(read("ko/business/inquiry/index.html").includes('id="bz-inquiry-form"'), "shared inquiry form still there");
});
