/**
 * Regression tests for the 17 broken internal links fixed on 2026-11-04 (owner-approved).
 *  - 8 root account-deletion links (/{app}/delete-account/) from the root page's app shells: the root redirect stubs
 *    must be published and point to the existing localized pages.
 *  - 9 Resources hero "Labs" buttons: /{lang}/resources/ must link to /{lang}/labs/, not /{lang}/resources/labs/.
 * Run: node --test tests/site/link-fixes.test.mjs   (reads the committed HTML and scripts; checks _publish when present)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const APPS = ["pillmate", "savy", "piggyup", "goalup", "countup", "newon", "eaton", "fiton"];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const PUBLISH = path.join(ROOT, "_publish");

test("root account-deletion links: the 8 root stubs are published and redirect to existing localized pages", () => {
  const publish = read("scripts/publish-site.mjs");
  const root = read("index.html");
  for (const app of APPS) {
    // the root page links here (relative from /)
    assert.ok(root.includes(`href="${app}/delete-account/"`), `root page links ${app}/delete-account/`);
    // the stub exists, is noindex, and redirects to /{lang}/{app}/delete-account/
    const stub = read(`${app}/delete-account/index.html`);
    assert.match(stub, /<meta name="robots" content="noindex"/, `${app} stub noindex`);
    assert.ok(stub.includes(`location.replace("/"+d+"/${app}/delete-account/"`), `${app} stub redirect`);
    assert.ok(stub.includes(`href="/ko/${app}/delete-account/"`), `${app} stub fallback link`);
    // the stub is copied into the published site
    assert.ok(publish.includes(`{ from: "${app}/delete-account", to: "${app}/delete-account", required: true }`), `${app} published`);
    // every localized target page exists (the account-deletion pages themselves are unchanged)
    for (const lang of LANGS) assert.ok(exists(`${lang}/${app}/delete-account/index.html`), `${lang}/${app}/delete-account/`);
    if (fs.existsSync(PUBLISH)) assert.ok(fs.existsSync(path.join(PUBLISH, app, "delete-account", "index.html")), `_publish/${app}/delete-account/`);
  }
});

test("Resources hero Labs button points to /{lang}/labs/ in all nine locales", () => {
  for (const lang of LANGS) {
    const html = read(`${lang}/resources/index.html`);
    assert.ok(!html.includes('href="labs/"'), `${lang}/resources/ still links labs/ (→ /${lang}/resources/labs/)`);
    assert.match(html, /<a class="btn btn-primary" href="\.\.\/labs\/">/, `${lang}/resources/ Labs button`);
    assert.ok(exists(`${lang}/labs/index.html`), `${lang}/labs/ exists`);
    assert.ok(!exists(`${lang}/resources/labs/index.html`), `${lang}/resources/labs/ is not a page`);
  }
});
