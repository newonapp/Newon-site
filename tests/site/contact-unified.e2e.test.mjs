/**
 * Browser checks for the unified /{lang}/contact/ page and the retired inquiry URLs (owner specs 1 + 2, 2026-10-26).
 * Needs a local preview of _publish/ and Playwright; skipped otherwise (so the static suite stays offline):
 *
 *   node scripts/publish-site.mjs && PORT=8811 node scripts/serve-publish.mjs &
 *   CT_E2E_BASE=http://127.0.0.1:8811 node --test tests/site/contact-unified.e2e.test.mjs
 *
 * FormSubmit is never reached: every request to formsubmit.co is intercepted with route.fulfill / route.abort.
 * Only made-up test data is typed.
 */
import test from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.CT_E2E_BASE || "";
const PW = process.env.CT_PLAYWRIGHT || "/home/claude/.npm-global/lib/node_modules/playwright/index.mjs";
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
let chromium = null;
if (BASE) {
  try {
    ({ chromium } = await import(PW));
  } catch {
    chromium = null;
  }
}
const skip = !BASE || !chromium ? "set CT_E2E_BASE (and have Playwright) to run the browser checks" : false;

let browser;
test.before(async () => {
  if (!skip) browser = await chromium.launch();
});
test.after(async () => {
  if (browser) await browser.close();
});

async function open(url, { width = 1280, height = 900, formsubmit = "ok", delay = 0 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const posts = [];
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.route(/cloudfront|googleapis|gstatic|youtube|googletagmanager|google-analytics/, (r) => r.abort());
  await page.route(/formsubmit\.co/, async (r) => {
    posts.push(JSON.parse(r.request().postData() || "{}"));
    if (delay) await new Promise((res) => setTimeout(res, delay));
    if (formsubmit === "abort") return r.abort("failed");
    if (formsubmit === "fail") return r.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: "false", message: "test failure" }) });
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: "true", message: "test ok" }) });
  });
  await page.goto(BASE + url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#ct-form");
  return { ctx, page, posts, errors };
}

const state = (page) =>
  page.evaluate(() => {
    const f = document.getElementById("ct-form");
    const vis = (n) => {
      const w = f.querySelector(`[data-ct-when="${n}"]`);
      return !!w && !w.hidden && !w.closest("[hidden]");
    };
    return {
      inquirer: (f.querySelector('input[name="inquirer"]:checked') || {}).value || "",
      inquiry: f.elements.inquiry_type.value,
      platform: f.elements.platform.value,
      topic: f.elements.topic.value,
      topicOptions: [...f.elements.topic.options].map((o) => o.value).filter(Boolean),
      topicText: f.elements.topic.selectedOptions[0] ? f.elements.topic.selectedOptions[0].textContent : "",
      shown: ["organization", "position", "website", "business_purpose", "partnership_goal", "investor_info", "topic", "environment", "error_detail", "reference_id"].filter(vis),
      orgRequired: f.elements.organization.required,
      errorRequired: f.elements.error_detail.required,
      orgLabel: f.querySelector('label[for="ct-org-name"]').textContent.trim(),
      messageLabel: f.querySelector("[data-ct-message-label]").textContent.trim(),
      picked: [...document.querySelectorAll(".ct-cat.is-picked")].map((c) => c.getAttribute("data-ct-cat")),
      search: location.search,
    };
  });

async function fillValid(page, extra = {}) {
  await page.check(`input[name="inquirer"][value="${extra.inquirer || "personal"}"]`, { force: true });
  await page.selectOption("#ct-type", extra.inquiry || "general");
  await page.fill("#ct-name", "테스트 사용자");
  await page.fill("#ct-email", "qa-test@example.com");
  await page.fill("#ct-subject", extra.subject || "통합 문의 테스트");
  await page.fill("#ct-message", extra.message || "브라우저 테스트용 문의 내용입니다. 실제 문의가 아닙니다.");
  await page.check("#ct-consent", { force: true });
}

async function waitFill(page) {
  // MIN_FILL_MS spam guard (3 s after load)
  await page.waitForTimeout(3100);
}

test("URL preselection: platform alias my-world + type=business + source; user can change it", { skip }, async () => {
  const { ctx, page, errors } = await open("/ko/contact/?platform=my-world&type=business&source=qa");
  let s = await state(page);
  assert.equal(s.inquirer, "company");
  assert.equal(s.platform, "myworld");
  assert.equal(s.inquiry, "");
  assert.ok(s.shown.includes("organization") && s.shown.includes("position") && s.shown.includes("topic"), s.shown.join());
  assert.equal(s.orgRequired, true);
  assert.equal(s.orgLabel.replace(/\s+/g, " "), "기업명 *");
  assert.ok(s.topicOptions.length === 9 && s.topicOptions.every((t) => t.startsWith("myworld-")), s.topicOptions.join());
  assert.deepEqual(s.picked, ["business"]);
  await page.check('input[name="inquirer"][value="personal"]', { force: true });
  await page.selectOption("#ct-platform", "livon");
  s = await state(page);
  assert.equal(s.inquirer, "personal");
  assert.ok(!s.shown.includes("organization"));
  assert.ok(s.topicOptions.every((t) => t.startsWith("livon-")));
  assert.match(s.search, /inquirer=personal/);
  assert.match(s.search, /platform=livon/);
  assert.match(s.search, /source=qa/);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test("invalid params are ignored safely; topic implies its platform and inquiry type; statuses are labelled", { skip }, async () => {
  let { ctx, page, errors } = await open("/ko/contact/?type=zzz&platform=foo&topic=bar&inquirer=x&inquiry=y&source=%3Cscript%3E");
  let s = await state(page);
  assert.deepEqual([s.inquirer, s.inquiry, s.platform, s.topic], ["", "", "", ""]);
  assert.deepEqual(s.shown, []);
  assert.deepEqual(errors, []);
  assert.equal(await page.locator("#ct-form-alert").isHidden(), true);
  await ctx.close();
  ({ ctx, page, errors } = await open("/ko/contact/?topic=shareon-deposit"));
  s = await state(page);
  assert.deepEqual([s.platform, s.topic, s.inquiry], ["shareon", "shareon-deposit", "service"]);
  assert.match(s.topicText, /보증금 · 향후 계획/);
  assert.ok(s.shown.includes("reference_id") && s.shown.includes("environment"), s.shown.join());
  await ctx.close();
  ({ ctx, page } = await open("/ko/contact/?platform=livon&topic=shareon-deposit"));
  s = await state(page);
  assert.deepEqual([s.platform, s.topic], ["livon", ""], "mismatched topic ignored");
  await ctx.close();
});

test("conditional fields per inquirer and inquiry type", { skip }, async () => {
  const { ctx, page } = await open("/en/contact/");
  const expect = {
    personal: [],
    company: ["organization", "position", "website", "business_purpose"],
    organization: ["organization", "position", "website", "business_purpose"],
    investor: ["organization", "position", "website", "investor_info"],
    media: ["organization", "position", "website"],
    other: [],
  };
  for (const [who, fields] of Object.entries(expect)) {
    await page.check(`input[name="inquirer"][value="${who}"]`, { force: true });
    const s = await state(page);
    assert.deepEqual(s.shown, fields, who);
    assert.equal(s.orgRequired, ["company", "organization", "media"].includes(who), `${who} org required`);
  }
  await page.check('input[name="inquirer"][value="personal"]', { force: true });
  await page.selectOption("#ct-type", "bug");
  let s = await state(page);
  assert.deepEqual(s.shown, ["environment", "error_detail"]);
  assert.equal(s.errorRequired, true);
  await page.selectOption("#ct-type", "partnership");
  s = await state(page);
  assert.deepEqual(s.shown, ["business_purpose", "partnership_goal"]);
  assert.equal(s.messageLabel, "Proposal details");
  assert.deepEqual(s.picked, ["partnership"]);
  await page.selectOption("#ct-type", "investment");
  s = await state(page);
  assert.ok(s.shown.includes("investor_info"));
  assert.deepEqual(s.picked, ["investment"]);
  await ctx.close();
});

test("validation: required fields, inquirer, email format, consent — nothing is sent", { skip }, async () => {
  const { ctx, page, posts } = await open("/ko/contact/");
  await waitFill(page);
  await page.click("[data-ct-submit]");
  assert.equal(await page.locator("#ct-form-alert").isVisible(), true);
  assert.equal(await page.textContent("#ct-inquirer-err"), "문의자 구분을 선택해 주세요.");
  assert.equal(await page.textContent("#ct-type-err"), "문의 유형을 선택해 주세요.");
  assert.equal(await page.getAttribute("#ct-email", "aria-invalid"), "true");
  assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.name), "inquirer", "focus moves to the first invalid field");
  await fillValid(page);
  await page.fill("#ct-email", "not-an-email");
  await page.uncheck("#ct-consent", { force: true });
  await page.click("[data-ct-submit]");
  assert.match(await page.textContent("#ct-email-err"), /이메일 주소 형식/);
  assert.match(await page.textContent("#ct-consent-err"), /동의해야/);
  // conditional required: company → organization; bug → error_detail
  await page.fill("#ct-email", "qa-test@example.com");
  await page.check("#ct-consent", { force: true });
  await page.check('input[name="inquirer"][value="company"]', { force: true });
  await page.selectOption("#ct-type", "bug");
  await page.click("[data-ct-submit]");
  assert.equal(await page.textContent("#ct-org-name-err"), "필수 입력 항목입니다.");
  assert.equal(await page.textContent("#ct-error-err"), "필수 입력 항목입니다.");
  assert.equal(posts.length, 0);
  await ctx.close();
});

test("success: one confirmed POST with the classification, source and timestamp; hidden fields are not sent", { skip }, async () => {
  const { ctx, page, posts } = await open("/ko/contact/?platform=my-world&type=business&source=qa-e2e");
  await fillValid(page, { inquirer: "company", inquiry: "partnership" });
  await page.fill("#ct-org-name", "테스트 회사");
  await page.fill("#ct-goal", "공동 프로모션");
  await page.selectOption("#ct-topic", "myworld-agencies");
  // a value typed into a field that is then hidden must not be sent
  await page.selectOption("#ct-type", "investment");
  await page.fill("#ct-investor", "hidden later");
  await page.selectOption("#ct-type", "partnership");
  await page.check('input[name="inquirer"][value="company"]', { force: true });
  await waitFill(page);
  await page.click("[data-ct-submit]");
  await page.waitForSelector("[data-ct-success]:not([hidden])");
  assert.equal(posts.length, 1);
  const p = posts[0];
  assert.equal(p._subject, "[NEWON Contact][MYWORLD][partnership/partnership/myworld-agencies] 통합 문의 테스트");
  assert.equal(p.platform_id, "myworld");
  assert.equal(p.type_id, "partnership");
  assert.equal(p.inquirer_id, "company");
  assert.equal(p.inquiry_id, "partnership");
  assert.equal(p.topic_id, "myworld-agencies");
  assert.match(p.topic, /여행 업체 · 향후 계획/);
  assert.equal(p.source, "qa-e2e");
  assert.match(p.submitted_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
  assert.match(p.client_ref, /^NW-\d{6}-[0-9A-F]{8}$/);
  assert.equal(p.organization, "테스트 회사");
  assert.equal(p.partnership_goal, "공동 프로모션");
  assert.equal(p.investor_info, undefined, "hidden field not sent");
  assert.equal(p._honey, undefined);
  assert.equal(p._fp, undefined);
  assert.equal(p.privacy_consent, "yes");
  assert.equal(p.lang, "ko");
  assert.match(await page.textContent("[data-ct-success-meta]"), /접수 분류: MY WORLD · 제휴·파트너십 · 여행 업체/);
  await ctx.close();
});

test("double submit and duplicate re-send are blocked", { skip }, async () => {
  const { ctx, page, posts } = await open("/en/contact/", { delay: 1200 });
  await fillValid(page);
  await waitFill(page);
  await page.evaluate(() => {
    const f = document.getElementById("ct-form");
    f.requestSubmit();
    f.requestSubmit();
    f.requestSubmit();
  });
  assert.equal(await page.getAttribute("[data-ct-submit]", "aria-busy"), "true");
  await page.waitForSelector("[data-ct-success]:not([hidden])");
  assert.equal(posts.length, 1, "one request for three submits");
  // same content again within 10 minutes → duplicate notice, no request
  await page.evaluate(() => {
    const f = document.getElementById("ct-form");
    document.querySelector("[data-ct-success]").hidden = true;
    f.hidden = false;
  });
  await page.click("[data-ct-submit]");
  assert.match(await page.textContent("#ct-form-alert"), /same content was just received/);
  assert.equal(posts.length, 1);
  await ctx.close();
});

test("failure and network error keep the input and offer retry + e-mail", { skip }, async () => {
  let { ctx, page, posts } = await open("/ko/contact/", { formsubmit: "fail" });
  await fillValid(page);
  await waitFill(page);
  await page.click("[data-ct-submit]");
  await page.waitForSelector("[data-ct-fail]:not([hidden])");
  assert.match(await page.textContent("[data-ct-fail-body]"), /접수 확인을 받지 못했습니다/);
  assert.equal(await page.inputValue("#ct-subject"), "통합 문의 테스트");
  assert.match(await page.getAttribute("[data-ct-mailto]", "href"), /^mailto:newon@newon\.app\?subject=/);
  const ref1 = posts[0].client_ref;
  await page.click("[data-ct-retry]");
  await page.waitForTimeout(400);
  assert.equal(posts.length, 2);
  assert.equal(posts[1].client_ref, ref1, "retry keeps the same client_ref");
  await ctx.close();
  ({ ctx, page, posts } = await open("/ko/contact/", { formsubmit: "abort" }));
  await fillValid(page);
  await waitFill(page);
  await page.click("[data-ct-submit]");
  await page.waitForSelector("[data-ct-fail]:not([hidden])");
  assert.match(await page.textContent("[data-ct-fail-body]"), /인터넷 연결이 끊겼거나/);
  assert.equal(await page.isHidden("[data-ct-success]"), true);
  await ctx.close();
});

test("honeypot and the 3-second guard never POST", { skip }, async () => {
  const { ctx, page, posts } = await open("/ko/contact/");
  await fillValid(page);
  await page.click("[data-ct-submit]");
  assert.match(await page.textContent("#ct-form-alert"), /잠시 후 다시 시도/);
  await waitFill(page);
  await page.evaluate(() => (document.getElementById("ct-hp-field").value = "bot"));
  await page.click("[data-ct-submit]");
  await page.waitForTimeout(300);
  assert.equal(posts.length, 0);
  await ctx.close();
});

test("category cards preset the form; keyboard: arrow keys move through the inquirer group", { skip }, async () => {
  const { ctx, page } = await open("/ko/contact/");
  await page.click('[data-ct-pick="public"]');
  let s = await state(page);
  assert.deepEqual([s.inquirer, s.inquiry], ["organization", "institution"]);
  assert.match(s.search, /inquirer=organization/);
  await page.focus('input[name="inquirer"][value="organization"]');
  await page.keyboard.press("ArrowRight");
  s = await state(page);
  assert.equal(s.inquirer, "investor");
  await ctx.close();
});

test("language switch keeps the classification (query travels with the language link)", { skip }, async () => {
  const { ctx, page } = await open("/ko/contact/");
  await page.check('input[name="inquirer"][value="company"]', { force: true });
  await page.selectOption("#ct-type", "listing");
  await page.selectOption("#ct-platform", "petlog");
  await page.selectOption("#ct-topic", "petlog-business");
  const href = await page.evaluate(() => (typeof window.newonBuildLangHref === "function" ? window.newonBuildLangHref("en") : "/en/contact/" + location.search));
  assert.match(href, /^\/en\/contact\/\?/);
  await page.goto(BASE + href, { waitUntil: "domcontentloaded" });
  const s = await state(page);
  assert.deepEqual([s.inquirer, s.inquiry, s.platform, s.topic], ["company", "listing", "petlog", "petlog-business"]);
  await ctx.close();
});

test("mobile 390: no horizontal overflow with every conditional field shown", { skip }, async () => {
  for (const lang of ["ko", "en"]) {
    const { ctx, page } = await open(`/${lang}/contact/?type=investment&topic=shareon-deposit`, { width: 390, height: 844 });
    await page.selectOption("#ct-type", "bug");
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(over <= 0, `${lang} overflow ${over}px`);
    const card = await page.evaluate(() => {
      const r = document.querySelector(".ct-formcard").getBoundingClientRect();
      return [r.left, r.right];
    });
    assert.ok(card[0] >= 0 && card[1] <= 390, `${lang} form card inside the viewport ${card}`);
    await ctx.close();
  }
});

test("retired URLs redirect to the unified page in the same language with mapped values", { skip }, async () => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.route(/cloudfront|googleapis|gstatic|youtube|formsubmit/, (r) => r.abort());
  const land = async (url) => {
    await page.goto(BASE + url, { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/contact\/(\?|#|$)/, { timeout: 5000 }).catch(() => {});
    return page.url().replace(BASE, "");
  };
  for (const lang of LANGS) {
    assert.equal(await land(`/${lang}/business/contact/`), `/${lang}/contact/?type=business&platform=newon&topic=newon-business&source=business-contact`, lang);
    assert.equal(await land(`/${lang}/business/contact/?type=participation&platform=babylog&source=x#bpt-form`), `/${lang}/contact/?type=business&inquiry=listing&platform=babylog&source=x#contact-form`, lang);
    assert.equal(
      await land(`/${lang}/studio/contact/?type=license&area=business#sts-form`),
      `/${lang}/contact/?type=business&platform=newon&topic=newon-studio-license&source=studio-contact&legacy=studio-contact%3A+area%3Dbusiness#contact-form`,
      lang
    );
    assert.equal(await land(`/${lang}/company/contact/?type=investment`), `/${lang}/contact/?type=investment`, lang);
  }
  assert.equal(await land("/ko/business/inquiry/?category=Business&service=MVP&source=portfolio#inquiry"), "/ko/contact/?type=business&platform=newon&topic=newon-business&source=portfolio&legacy=business-inquiry%3A+category%3DBusiness%26service%3DMVP#contact-form");
  assert.equal(await land("/en/business/inquiry/?category=studio&type=brand-strategy"), "/en/contact/?type=business&platform=newon&topic=newon-studio&source=business-inquiry&legacy=business-inquiry%3A+type%3Dbrand-strategy%26category%3Dstudio");
  // the store purchase inflow keeps its own form
  await page.goto(BASE + "/ko/business/inquiry/?category=Store&product=X#inquiry", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  assert.match(page.url(), /\/ko\/business\/inquiry\/\?category=Store/);
  // language-less stubs go to the stored / default language and keep the query
  assert.equal(await land("/business/contact/?type=public"), "/ko/contact/?type=public&source=business-contact");
  await ctx.close();
});
