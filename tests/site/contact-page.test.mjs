/**
 * /{lang}/contact/ — NEWON unified Contact page (owner brief 2026-10 "통합 문의 페이지").
 * Run: node --test tests/site/contact-page.test.mjs   (reads the committed HTML; no build needed)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONTACT_CATEGORY_IDS, CONTACT_TYPE_ALIASES, CONTACT_HERO_FILM } from "../../scripts/contact-page-copy.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const page = (lang) => read(`${lang}/contact/index.html`);
const main = (html) => (html.match(/<main\b[\s\S]*?<\/main>/) || [""])[0];
const header = (html) => (html.match(/<header class="gnav[\s\S]*?<\/header>/) || [""])[0];
const form = (html) => (html.match(/<form id="ct-form"[\s\S]*?<\/form>/) || [""])[0];
const text = (html) => html.replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/\s+/g, " ");

test("nine locales: canonical, hreflang, one h1, JSON-LD contactPoint (email only), six sections in brief order", () => {
  for (const lang of LANGS) {
    const html = page(lang);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.newon\\.app/${lang}/contact/"`), lang);
    assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 10, `${lang} hreflang`);
    assert.equal((main(html).match(/<h1[\s>]/g) || []).length, 1, `${lang} one h1`);
    assert.ok(!/\{\{/.test(html), `${lang} unreplaced placeholder`);
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const cp = ld.find((x) => x["@type"] === "ContactPage");
    assert.ok(cp, `${lang} ContactPage`);
    assert.equal(cp.mainEntity.contactPoint.email, "newon@newon.app");
    assert.ok(!JSON.stringify(cp).match(/telephone|address/i), `${lang} no phone/address`);
    const ids = [...main(html).matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(ids, ["contact-top", "contact-categories", "contact-form", "contact-info", "contact-faq", "contact-cta"], `${lang} sections`);
  }
});

test("hero: home film-hero structure with the owner's background film and poster, readable veil, two scroll buttons", () => {
  const html = page("ko");
  const hero = (main(html).match(/<section id="contact-top"[\s\S]*?<\/section>/) || [""])[0];
  assert.match(hero, /class="hero--film ct-hero"/);
  assert.match(hero, /<video\s+class="nhv-video"/);
  for (const attr of ["autoplay", "muted", "loop", "playsinline"]) assert.match(hero, new RegExp(`\\n\\s+${attr}\\n`), attr);
  assert.ok(hero.includes(`src="${CONTACT_HERO_FILM.video}"`) && hero.includes(`poster="${CONTACT_HERO_FILM.poster}"`));
  assert.match(hero, /ct-hero__shade/);
  assert.match(hero, /ct-hero__veil/);
  assert.match(hero, /<h1 class="ct-hero__title">새로운 연결은,<br \/>대화에서 시작됩니다\.<\/h1>/);
  assert.match(hero, /href="#contact-form" data-ct-scroll>문의 작성하기</);
  assert.match(hero, /href="#contact-categories" data-ct-scroll>문의 유형 살펴보기</);
  assert.equal((hero.match(/<img\b/g) || []).length, 0, "no extra images");
  assert.match(html, /\/film-keep\.js/);
  assert.match(html, /\/contact\/contact-page\.css/);
});

test("six categories in brief order; each card links into the form with its type", () => {
  for (const lang of ["ko", "en"]) {
    const m = main(page(lang));
    const cats = [...m.matchAll(/data-ct-cat="([a-z]+)"/g)].map((x) => x[1]);
    assert.deepEqual(cats, CONTACT_CATEGORY_IDS, lang);
    for (const id of CONTACT_CATEGORY_IDS) assert.match(m, new RegExp(`href="\\?type=${id}#contact-form" data-ct-pick="${id}"`), `${lang} ${id}`);
    const opts = [...form(page(lang)).matchAll(/<select class="ct-input ct-select" id="ct-type"[\s\S]*?<\/select>/g)][0][0];
    assert.deepEqual([...opts.matchAll(/value="([a-z]*)"/g)].map((x) => x[1]), ["", ...CONTACT_CATEGORY_IDS]);
  }
  const t = text(main(page("ko")));
  for (const s of ["개인 문의", "기업 문의", "기관·공공 문의", "파트너십 문의", "투자 문의", "언론·기타 문의", "B2B·B2B2C 협력", "시범사업 및 PoC", "IR 자료 요청"]) assert.ok(t.includes(s), s);
});

test("legacy ?type= values that already link to /contact/ map to a category", () => {
  for (const legacy of ["support", "business", "partnership", "media", "other", "project"]) {
    assert.ok(CONTACT_CATEGORY_IDS.includes(CONTACT_TYPE_ALIASES[legacy]), legacy);
  }
});

test("form: required and optional fields, persona/org fields, no file upload, honeypot", () => {
  for (const lang of LANGS) {
    const f = form(page(lang));
    for (const name of ["inquiry_type", "name", "email", "subject", "message", "privacy_consent"]) {
      assert.match(f, new RegExp(`name="${name}"[^>]*\\brequired\\b`), `${lang} ${name} required`);
    }
    for (const name of ["organization", "phone", "platform", "website", "reference_url", "business_purpose"]) {
      const tag = (f.match(new RegExp(`<(?:input|select)[^>]*name="${name}"[^>]*>`)) || [""])[0];
      assert.ok(tag, `${lang} ${name} present`);
      assert.ok(!/\brequired\b/.test(tag), `${lang} ${name} optional`);
    }
    assert.match(f, /name="persona" value="personal" checked/);
    assert.match(f, /name="persona" value="organization"/);
    assert.match(f, /<div class="ct-org" data-ct-org hidden>[\s\S]*name="organization"[\s\S]*name="business_purpose"/);
    assert.ok(!/type="file"/.test(f), `${lang} no file input`);
    assert.match(f, /maxlength="3000"/);
    assert.ok(f.includes('name="_honey"'), `${lang} honeypot`);
    assert.ok(!/<form[^>]*\baction=/.test(f), `${lang} no form action`);
  }
  const ko = text(form(page("ko")));
  for (const s of ["NEWON 전체", "LIVON", "ONGIL", "SHAREON", "BABYLOG", "PETLOG", "MY WORLD", "기업 제휴", "서비스 입점", "공동 사업", "기술 협력", "기관 서비스", "투자", "문의 보내기 →"]) assert.ok(ko.includes(s), s);
  assert.match(form(page("ko")), /placeholder="문의하실 내용이나 협력 제안을 자세히 작성해 주세요\."/);
});

test("consent notice: purpose, items, FormSubmit handling, published retention wording, right to refuse, privacy link", () => {
  const t = text(form(page("ko")));
  for (const s of [
    "문의 확인·회신 및 처리 기록",
    "[자동] 문의를 보낸 페이지 주소, 언어, 제출 시각",
    "FormSubmit(formsubmit.co)",
    "30일간 보관",
    "NEWON 웹사이트는 별도의 서버나 데이터베이스에 문의 내용을 저장하지 않습니다.",
    "문의 확인과 회신에 필요한 기간 동안 보관하며, 열람·삭제 등을 요청하시면 관련 법령에 따라 조치합니다. 그 밖의 사항은 개인정보처리방침을 따릅니다.",
    "동의하지 않을 권리가 있습니다",
    "newon@newon.app으로 직접 이메일을 보내",
  ]) assert.ok(t.includes(s), s);
  assert.match(form(page("ko")), /href="\/ko\/privacy\/"/);
  assert.match(form(page("en")), /href="\/en\/privacy\/"/);
});

test("delivery = the site's FormSubmit endpoint; success only on a confirmed response; no localhost success; no secrets", () => {
  const js = read("contact/contact-page.js");
  assert.match(page("ko"), /"endpoint":"https:\/\/formsubmit\.co\/ajax\/newon@newon\.app"/);
  assert.match(js, /out\.res\.ok && \(flag === true \|\| flag === "true"\)/);
  assert.ok(!/isLocalPreview|localhost/.test(js.replace(/\/\*[\s\S]*?\*\//g, "")), "no localhost success path");
  assert.ok(!/api[_-]?key|secret|token/i.test(js), "no secrets");
  assert.match(js, /TIMEOUT_MS = 15000/);
  assert.match(js, /MIN_FILL_MS = 3000/);
  assert.match(text(main(page("ko"))), /문의가 정상적으로 접수되었습니다\. 남겨주신 이메일을 통해 안내드리겠습니다\./);
});

test("contact information and FAQ; no unverified address, phone or hours; no response-time promise", () => {
  const m = main(page("ko"));
  const t = text(m);
  assert.ok(t.includes("NEWON | 뉴온") && t.includes("www.newon.app"));
  assert.match(m, /href="mailto:newon@newon\.app"/);
  assert.match(m, /data-ct-copy="newon@newon\.app"/);
  assert.match(m, /data-ct-copy-status/);
  assert.equal((m.match(/class="ct-faq__btn"[^>]*aria-expanded="false"/g) || []).length, 6);
  assert.ok(!/(영업시간|대표전화|주소:|영업일|이내 답변|이내에 답변|within \d+)/.test(t), "no invented contact data or SLA");
  assert.match(t, /모든 새로운 가능성은, 하나의 연결에서 시작됩니다\./);
});

test("languages: ko and en fully written; the other seven use the English copy marked lang=en", () => {
  assert.match(page("ko"), /<html lang="ko"/);
  assert.match(main(page("en")), /Every new connection<br \/>begins with a conversation\./);
  for (const lang of ["ja", "es", "pt-br", "fr", "de", "hi", "id"]) {
    assert.match(main(page(lang)), /<div class="np-home ct-page" data-ct-page lang="en">/, lang);
  }
  assert.ok(!/data-ct-page lang=/.test(page("ko")) && !/data-ct-page lang=/.test(page("en")));
});

test("menu: black header CTA, mobile drawer CTA and the company menu's Contact item all open /{lang}/contact/", () => {
  for (const rel of ["ko/index.html", "en/index.html", "ko/about/index.html", "ja/business/index.html", "ko/contact/index.html", "ko/babylog/index.html", "ko/ecosystem/index.html"]) {
    const h = header(read(rel));
    const cta = (h.match(/class="gnav__cta" href="([^"]+)"/) || [])[1] || "";
    assert.match(cta, /^(?:(?:\.\.\/)+|\/[a-z-]+\/)contact\/$/, `${rel} header CTA ${cta}`);
    const html = read(rel);
    const mob = (html.match(/class="gnav-mobile__cta btn btn-primary" href="([^"]+)"/) || [])[1] || "";
    assert.match(mob, /^(?:(?:\.\.\/)+|\/[a-z-]+\/)contact\/$/, `${rel} drawer CTA ${mob}`);
    if (rel === "ko/ecosystem/index.html") continue; // frozen page without the company mega panel
    const panel = (h.match(/data-gnav-mega="company"[\s\S]*?<p class="gnav-mega__foot">/) || [""])[0];
    const rows = [...panel.matchAll(/class="gnav-mega__row" href="([^"]+)"/g)].map((m) => m[1].replace(/^(?:\.\.\/)+|^\/[a-z-]+\//, ""));
    assert.ok(rows.includes("contact/") && !rows.includes("business/contact/"), `${rel} company menu ${rows}`);
  }
  // Business & Partnerships keeps its own contact screen in its menu
  const biz = (header(read("ko/index.html")).match(/data-gnav-mega="business"[\s\S]*?<p class="gnav-mega__foot">/) || [""])[0];
  assert.match(biz, /href="\/ko\/business\/contact\/"|href="(?:\.\.\/)+business\/contact\/"/);
});

test("legacy /{lang}/company/contact/ redirects to /{lang}/contact/", () => {
  for (const lang of LANGS) assert.match(read(`${lang}/company/contact/index.html`), new RegExp(`url=/${lang}/contact/`));
});
