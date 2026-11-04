/**
 * Production monitor (scripts/monitoring/) — targets stay in step with the site, and the checker still catches breakage.
 *
 *  1. Every monitored business stub points where render-bizpart.mjs's LEGACY_REDIRECTS sends it; the stub pages in the
 *     committed site really are noindex refresh stubs to that screen.
 *  2. The content markers of the critical routes (business hub, unified contact form) exist in the committed pages, and
 *     the contact form script carries the FormSubmit endpoint the endpoint check looks for.
 *  3. Against a local fixture site the checker PASSes healthy pages and stubs, and FAILs a stub that points elsewhere, a
 *     stub whose destination is gone, and a contact page without the form (so the update did not weaken anything).
 * Run: node --test tests/monitoring/production-monitor.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import http from "http";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { BUSINESS_ROUTES, CRITICAL_ROUTES, CRITICAL_ASSETS, DEFAULTS } from "../../scripts/monitoring/targets.mjs";
import { LEGACY_REDIRECTS } from "../../scripts/render-bizpart.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const route = (id) => [...CRITICAL_ROUTES, ...BUSINESS_ROUTES].find((r) => r.id === id);

test("business redirect stubs match LEGACY_REDIRECTS and the committed stub pages", () => {
  const stubs = BUSINESS_ROUTES.filter((r) => r.type === "http/redirect-stub");
  assert.ok(stubs.length >= 6, "the six retired business pages are still monitored");
  for (const s of stubs) {
    const key = s.path.replace(/^\/ko\//, "").replace(/\/$/, "");
    assert.ok(LEGACY_REDIRECTS[key], `${key} is a retired URL in LEGACY_REDIRECTS`);
    assert.equal(s.redirectTo, `/ko/${LEGACY_REDIRECTS[key]}`, `${key} → ${LEGACY_REDIRECTS[key]}`);
    const html = read(`ko/${key}/index.html`);
    assert.ok(html.includes(`http-equiv="refresh" content="0;url=${s.redirectTo}`), `${key} refresh`);
    assert.match(html, /<meta name="robots" content="noindex/, `${key} noindex`);
    assert.ok(html.includes(`<link rel="canonical" href="${DEFAULTS.origin}${s.redirectTo}"`), `${key} canonical`);
    assert.ok(fs.existsSync(path.join(ROOT, s.redirectTo.slice(1), "index.html")), `${s.redirectTo} exists`);
  }
});

test("critical markers exist in the committed pages; the contact endpoint lives in contact-page.js", () => {
  for (const id of ["business-ko", "contact-ko", "inquiry-ko", "home-ko", "products-ko"]) {
    const r = route(id);
    const html = read(`${r.path.slice(1)}index.html`);
    for (const m of r.markers) assert.ok(html.includes(m), `${id}: ${m}`);
  }
  for (const r of BUSINESS_ROUTES.filter((x) => x.type === "http/content")) {
    const html = read(`${r.path.slice(1)}index.html`);
    for (const m of r.markers) assert.ok(html.includes(m), `${r.id}: ${m}`);
  }
  const contact = read("ko/contact/index.html");
  assert.ok(contact.includes('id="ct-form"') && contact.includes("/contact/contact-page.js"), "contact page loads the unified form");
  const js = read("contact/contact-page.js");
  assert.ok(js.includes("formsubmit.co/ajax/") && js.includes("newon@newon.app"), "contact-page.js has the endpoint");
  for (const a of CRITICAL_ASSETS) assert.ok(fs.existsSync(path.join(ROOT, a.path.slice(1))), `asset ${a.path}`);
});

/** Run the checker against a tiny fixture site and return its JSON report. */
async function runOnFixture(pages) {
  const server = http.createServer((req, res) => {
    const p = req.url.split("?")[0];
    const body = pages[p];
    if (body == null) {
      res.writeHead(404, { "content-type": "text/html" });
      res.end("<!doctype html><title>Page not found</title><h1>404</h1>");
      return;
    }
    res.writeHead(200, { "content-type": p.endsWith(".js") ? "text/javascript" : "text/html" });
    res.end(req.method === "HEAD" ? "" : body);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "newon-monitor-"));
  // spawn (not spawnSync): the fixture server shares this process's event loop
  const run = await new Promise((resolve) => {
    {
      const p = spawn(process.execPath, [path.join(ROOT, "scripts/monitoring/check-production.mjs"), "--no-store", "--origin", origin, "--out-dir", out], {
        env: { ...process.env, NEWON_MONITOR_RETRIES: "0", NEWON_MONITOR_TIMEOUT_MS: "4000" },
      });
      let log = "";
      p.stdout.on("data", (d) => (log += d));
      p.stderr.on("data", (d) => (log += d));
      p.on("close", (code) => resolve({ code, log }));
    }
  });
  server.close();
  const report = JSON.parse(fs.readFileSync(path.join(out, "monitoring-latest.json"), "utf8"));
  return { ...run, report, byId: Object.fromEntries(report.checks.map((c) => [c.id, c])) };
}

const PAD = "x".repeat(900);
const page = (extra = "") => `<!doctype html><html><body><div data-gnav></div>${extra}<p>${PAD}</p></body></html>`;
const stub = (to, canonicalTo = to) =>
  `<!doctype html><html><head><meta name="robots" content="noindex, follow" /><link rel="canonical" href="${DEFAULTS.origin}${canonicalTo}" /><meta http-equiv="refresh" content="0;url=${to}" /></head><body><a href="${to}">${to}</a></body></html>`;

test("checker: healthy stubs and screens PASS; broken stub, missing destination and missing form FAIL", async () => {
  const biz = (p) => page(`<nav class="fsn" data-biz="bizpart"><a>BUSINESS &amp; PARTNERSHIPS</a><a href="${p}" aria-current="page">x</a></nav>`);
  const pages = {
    "/ko/business/": page('<main id="hub-main"></main>NEWON Business <nav class="fsn" data-biz="bizpart"></nav>'),
    "/ko/business/platforms/": biz("/ko/business/platforms/"),
    "/ko/business/models/": biz("/ko/business/models/"),
    // partnerships screen missing → its BIZ_SCREEN check must FAIL
    "/ko/business/automation/": stub("/ko/business/models/"), // healthy
    "/ko/business/solutions/": stub("/ko/business/"), // points elsewhere → FAIL
    "/ko/business/build/": stub("/ko/business/"), // healthy
    "/ko/business/research/": stub("/ko/business/", "/ko/business/models/"), // wrong canonical → FAIL
    "/ko/business/care/": stub("/ko/business/gone/"), // wrong target and destination 404 → FAIL
    "/ko/business/mvp/": stub("/ko/business/"),
    "/ko/contact/": page("<p>no form here</p>"), // unified form missing → FAIL (critical)
    "/contact/contact-page.js": "var ENDPOINT='https://formsubmit.co/ajax/newon@newon.app';",
  };
  const { code, byId } = await runOnFixture(pages);
  assert.notEqual(code, 0, "a broken critical surface still makes the run fail");
  for (const id of ["biz-automation", "biz-build", "biz-mvp", "biz-platforms", "biz-models"]) assert.equal(byId[id].status, "PASS", `${id}: ${byId[id].reason}`);
  for (const id of ["biz-solutions", "biz-research", "biz-care", "biz-partnerships", "contact-ko"]) assert.equal(byId[id].status, "FAIL", `${id} must FAIL`);
  assert.match(byId["biz-solutions"].reason, /meta refresh/);
  assert.match(byId["biz-research"].reason, /canonical/);
  assert.equal(byId["contact-ko"].classification, "OUTAGE");
  assert.equal(byId["contact-endpoint-config"].status, "PASS");
  assert.equal(byId["business-ko"].severity, "P1", "severity is reported from the target (typo fixed)");
});

test("checker: the committed site passes every route, asset and form-config check (no store probes)", { skip: !fs.existsSync(path.join(ROOT, "_publish", "index.html")) && "build _publish first" }, async () => {
  const pub = path.join(ROOT, "_publish");
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    let f = path.join(pub, p);
    if (!f.startsWith(pub)) { res.writeHead(400); res.end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) { res.writeHead(404, { "content-type": "text/html" }); res.end(fs.readFileSync(path.join(pub, "404.html"))); return; }
    res.writeHead(200); res.end(req.method === "HEAD" ? "" : fs.readFileSync(f));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "newon-monitor-site-"));
  const code = await new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(ROOT, "scripts/monitoring/check-production.mjs"), "--no-store", "--origin", origin, "--out-dir", out], { stdio: "ignore" });
    p.on("close", resolve);
  });
  server.close();
  const report = JSON.parse(fs.readFileSync(path.join(out, "monitoring-latest.json"), "utf8"));
  const bad = report.checks.filter((c) => c.status !== "PASS").map((c) => `${c.id}: ${c.status} ${c.reason}`);
  assert.deepEqual(bad, []);
  assert.equal(code, 0);
});
