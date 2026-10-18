// Branch-scope rules behind RC-1 / RC-41 (PHASE 03 P7): the website line may change website files, never the LIVON product.
import test from 'node:test';
import assert from 'node:assert/strict';
import { WEBSITE_ANCHOR, WEBSITE_TOOLING, isLivonProtected, isWebsiteOwned, websiteExempt } from '../../scripts/qa-branch-scope.mjs';

const yes = () => true, no = () => false;
const web = { websiteLine: true, onlyWebsiteCommits: yes };

test('BS-1 website pages, css, locales, templates and website scripts are exempt on the website line', () => {
  for (const f of ['de/business/solutions/index.html', 'business-service.css', 'locales/de.json', 'templates/index.html', 'scripts/qa-jsonld.mjs', '.github/workflows/build-guards.yml', 'i18n-approved/de.json'])
    assert.equal(websiteExempt(f, web), true, f);
});
test('BS-2 the LIVON product and shared runtime are never exempt, even on the website line', () => {
  for (const f of ['livon/home-page.js', 'livon/index.html', 'server/livon/chat.mjs', 'api/livon/data/status.mjs', 'scripts/livon-seo-build.mjs', 'assets/livon-mark.jpg', 'vercel.json',
    '.github/workflows/github-pages.yml', 'api/ongil/family.mjs', 'scripts/serve-publish.mjs', 'docs/livon/LIVON_HOME_V2.md', 'tests/livon/home.test.mjs'])
    assert.equal(websiteExempt(f, web), false, f);
});
test('BS-3 nothing is exempt on a line without the website history (strict LIVON gate)', () => {
  const strict = { websiteLine: false, onlyWebsiteCommits: yes };
  for (const f of ['de/index.html', 'business-service.css', 'scripts/publish-site.mjs', 'livon/home-page.js']) assert.equal(websiteExempt(f, strict), false, f);
});
test('BS-4 shared tooling files are exempt only when every later commit touching them is a website commit', () => {
  for (const f of WEBSITE_TOOLING) {
    assert.equal(websiteExempt(f, { websiteLine: true, onlyWebsiteCommits: yes }), true, f);
    assert.equal(websiteExempt(f, { websiteLine: true, onlyWebsiteCommits: no }), false, f + ' touched by a non-website commit');
  }
  assert.equal(websiteExempt('scripts/livon-data-quality.mjs', { websiteLine: true, onlyWebsiteCommits: no }), false);
});
test('BS-5 protected and owned are exact complements; the anchor is a full commit id', () => {
  for (const f of ['livon/a.js', 'de/index.html', 'scripts/publish-site.mjs', 'tests/livon/x.test.mjs', 'styles.css']) assert.equal(isLivonProtected(f), !isWebsiteOwned(f), f);
  assert.match(WEBSITE_ANCHOR, /^[0-9a-f]{40}$/);
});
test('BS-6 the deploy workflow and the shared publish scripts stay protected (the website line cannot change them silently)', () => {
  for (const f of ['.github/workflows/github-pages.yml', 'scripts/publish-site.mjs', 'scripts/serve-publish.mjs']) assert.equal(isLivonProtected(f), true, f);
});
