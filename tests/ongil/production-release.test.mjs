// ONGIL Phase 12 — Production Release V1: release-only checks that earlier suites do not cover.
// Entry and asset paths as the publish step ships them, the deploy pipeline, the production API configuration,
// provider failure isolation through the real data client, the network and logging boundary, outside hosts,
// production SEO, and the capability boundaries as the published page states them.
// Browser smoke / E2E (production-like server, /api answering 404 as on GitHub Pages) runs from a harness outside
// the repository; see docs/ongil/PHASE_12_PRODUCTION_RELEASE_V1.md.   node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLifelongClassSource, createFacilitySource, createEnjoyPlaceSource, createTourPlaceSource } from '../../ongil-start/js/data-source.js';
import { createProductSource } from '../../ongil-start/js/store-source.js';
import { TRANSMISSION, IDENTIFIERS } from '../../ongil-start/js/analytics.js';
import { AREAS } from '../../ongil-start/js/areas.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const HTML = read('ongil-start/index.html');
const JS_DIR = path.join(ROOT, 'ongil-start', 'js');
const JS_FILES = fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).sort();
const CODE = Object.fromEntries(JS_FILES.map((f) => [f, strip(fs.readFileSync(path.join(JS_DIR, f), 'utf8'))]));
const ALL = Object.values(CODE).join('\n');
const PUBLISH = read('scripts/publish-site.mjs');
const WORKFLOW = read('.github/workflows/github-pages.yml');

/* exact-case existence (a case mismatch works on macOS and fails on the Linux build / GitHub Pages) */
function existsExact(rel) {
  let dir = ROOT;
  for (const part of rel.split('/').filter(Boolean)) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory() || !fs.readdirSync(dir).includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}
const fakeFetch = (behaviour) => async () => {
  if (behaviour === 'throw') throw new Error('offline');
  if (behaviour === '404') return { ok: false, status: 404, json: async () => ({}) };
  if (behaviour === 'badjson') return { ok: true, status: 200, json: async () => { throw new SyntaxError('bad'); } };
  if (behaviour === 'html') return { ok: true, status: 200, json: async () => '<html>' };
  return { ok: true, status: 200, json: async () => ({ ok: true, providers: {} }) };
};

test('PR-01 production entry: the publish step copies ongil-start whole and fails the build without its page and mark', () => {
  assert.match(PUBLISH, /\{ from: "ongil-start", to: "ongil-start", required: true \}/);
  assert.match(PUBLISH, /required\.push\(path\.join\(OUT, "ongil-start", "index\.html"\)\)/);
  assert.match(PUBLISH, /required\.push\(path\.join\(OUT, "assets", "ongil-mark\.svg"\)\)/);
  assert.ok(existsExact('ongil-start/index.html'));
});

test('PR-02 asset paths: every site-root file the page loads exists with the exact case; module imports are relative', () => {
  const refs = [...HTML.matchAll(/(?:href|src|data-og-src)="([^"]+)"/g)].map((m) => m[1]);
  const local = refs.filter((u) => u.startsWith('/') && !u.startsWith('//')).map((u) => u.replace(/[?#].*$/, ''));
  assert.ok(local.length >= 16);
  for (const u of local) assert.ok(existsExact(u.replace(/^\//, '')) || existsExact(`${u.replace(/^\//, '')}index.html`), `missing or case mismatch: ${u}`);
  assert.equal(refs.filter((u) => /^\.\.?\//.test(u)).length, 0, 'no page-relative asset path (the page is served at /ongil-start/)');
  for (const f of JS_FILES) for (const m of CODE[f].matchAll(/from '([^']+)'/g)) assert.ok(existsExact(`ongil-start/js/${m[1].replace('./', '')}`), `${f} imports a missing module ${m[1]}`);
});

test('PR-03 release version: one APP_VERSION, shown in the operations view and on the page handle', () => {
  assert.equal((ALL.match(/const APP_VERSION = '/g) || []).length, 1);
  assert.match(CODE['app.js'], /version: APP_VERSION,/);
  assert.match(CODE['app.js'], /win\.Ongil = Object\.freeze\(\{ version: APP_VERSION,/);
});

test('PR-04 provider configuration: the committed API location is empty (same origin) and only an https origin can be set at build time', () => {
  const cfg = strip(read('livon/livon-api-config.js'));
  assert.match(cfg, /var configured = "";/);
  assert.doesNotMatch(cfg, /key|token|secret/i);
  assert.match(WORKFLOW, /LIVON_API_ORIGIN: \$\{\{ vars\.LIVON_API_ORIGIN \}\}/, 'a public repository variable, never a secret');
  assert.match(PUBLISH, /if \(origin\) fs\.writeFileSync\(path\.join\(OUT, "livon", "livon-api-config\.js"\)/);
  assert.match(CODE['data-source.js'], /credentials: 'omit'/);
  assert.match(CODE['data-source.js'], /method: 'GET'/);
});

test('PR-05 provider failure: 404 (GitHub Pages has no /api), offline, bad JSON, HTML or an unconfigured route → unavailable, never a throw', async () => {
  const makers = [
    (f) => createLifelongClassSource({ apiUrl: (p) => p, fetcher: f }).load({ region: '서울' }),
    (f) => createFacilitySource({ apiUrl: (p) => p, fetcher: f }).load({ region: '서울', kind: 'welfare' }),
    (f) => createEnjoyPlaceSource({ apiUrl: (p) => p, fetcher: f }).load({ region: '서울', word: '공원' }),
    (f) => createTourPlaceSource({ apiUrl: (p) => p, fetcher: f }).load({ region: '서울', contentType: '12' }),
  ];
  for (const behaviour of ['404', 'throw', 'badjson', 'html', 'unconfigured']) {
    for (const [i, make] of makers.entries()) {
      const r = await make(fakeFetch(behaviour));
      assert.equal(r.state, 'unavailable', `source ${i} · ${behaviour}`);
      assert.deepEqual(r.items, []);
    }
  }
  const store = await createProductSource().load();
  assert.deepEqual([store.state, store.reason], ['unavailable', 'NOT_CONNECTED']);
});

test('PR-06 community boundary on the published page: stored on this device only, nothing published', () => {
  const area = AREAS.find((a) => a.id === 'community');
  assert.match(area.notice, /이 기기에만 저장되고 다른 사람에게 보이지 않습니다/);
  assert.match(HTML, /이야기를 나누는 곳으로 준비하고 있습니다/);
  assert.doesNotMatch(`${HTML}\n${CODE['community-view.js']}`, /게시되었|공개되었|회원 \d|명 참여|조회수/);
});

test('PR-07 family boundary: connection is not available and nothing is sent', () => {
  assert.match(HTML, /가족 연결은 아직 준비 중입니다/);
  assert.match(AREAS.find((a) => a.id === 'family').notice, /가족 연결은 아직 할 수 없습니다/);
  for (const f of ['family-view.js', 'store-view.js', 'enjoy-view.js', 'care-view.js']) assert.doesNotMatch(CODE[f], /보냈어요|전송했|공유됐어요|전달됐어요|공유했어요/, f);
});

test('PR-08 health boundary: records the person keeps, not diagnosis, treatment or emergency judgement', () => {
  assert.match(HTML, /의료 진단이나 치료 판단을 대신하지 않습니다/);
  assert.doesNotMatch(ALL, /진단 결과|진단해 드|처방해|복용하세요|응급 상황입니다|위험합니다/);
});

test('PR-09 assistant boundary: local rules, no model, no network, no free-form AI claim', () => {
  const A = `${CODE['assistant-tools.js']}\n${CODE['assistant-intents.js']}\n${CODE['assistant-view.js']}`;
  assert.doesNotMatch(A, /\bfetch\(|XMLHttpRequest|openai|anthropic|\bgpt-|\bLLM\b|apiKey/i);
  assert.doesNotMatch(`${A}\n${HTML}`, /무엇이든 물어보|AI가 답|인공지능 상담/);
});

test('PR-10 admin boundary: the operations view is not in the menu, search, sitemap or any link, and claims no security', () => {
  assert.doesNotMatch(HTML, /href="#admin/);
  assert.equal(AREAS.some((a) => a.id === 'admin'), false);
  assert.doesNotMatch(read('sitemap.xml'), /ongil-start/);
  assert.doesNotMatch(`${CODE['admin-view.js']}\n${CODE['admin.js']}`, /보안이 확인|안전하게 보호됩니다|관리자 인증 완료|secure admin/i);
});

test('PR-11 / PR-12 network and analytics: one module talks to the network (GET to the data route); analytics stays on the device', () => {
  const withFetch = JS_FILES.filter((f) => /\bfetch\(|fetcher\(/.test(CODE[f]));
  assert.deepEqual(withFetch, ['app.js', 'data-source.js']);
  assert.match(CODE['app.js'], /fetcher: typeof win\.fetch === 'function' \? \(url, init\) => win\.fetch\(url, init\) : null/);
  assert.doesNotMatch(ALL, /XMLHttpRequest|sendBeacon|WebSocket|EventSource|navigator\.share|postMessage\(/);
  assert.deepEqual({ ...TRANSMISSION }, { remote: false, endpoint: null, batch: false, beacon: false });
  assert.ok(Object.values(IDENTIFIERS).every((v) => v === false));
});

test('PR-13 outside hosts: fonts and the film host only; no host is written in any module', () => {
  const hosts = [...new Set([...HTML.matchAll(/https:\/\/([a-z0-9.-]+)/g)].map((m) => m[1]))].sort();
  assert.deepEqual(hosts, ['d8j0ntlcm91z4.cloudfront.net', 'fonts.googleapis.com', 'fonts.gstatic.com']);
  assert.equal(/https?:\/\/[a-z0-9-]+\.[a-z]/i.test(ALL), false, 'no outside address in ONGIL modules (links come from provider data, checked by safeHref)');
});

test('PR-14 no personal logging: ONGIL modules never write to the console', () => {
  for (const f of JS_FILES) assert.doesNotMatch(CODE[f], /console\.(log|info|warn|error|debug|trace|table)\(/, f);
});

test('PR-26 deploy pipeline: GitHub Pages builds only from main and serves www.newon.app; this branch deploys nothing by itself', () => {
  assert.match(WORKFLOW, /on:\n  push:\n    branches: \["main"\]/);
  assert.match(WORKFLOW, /run: node scripts\/publish-site\.mjs/);
  assert.match(WORKFLOW, /publish_branch: gh-pages/);
  assert.match(WORKFLOW, /cname: www\.newon\.app/);
  assert.equal(read('CNAME').trim(), 'www.newon.app');
});

test('PR-27 production SEO: the app page is noindex and stays out of the sitemap; robots does not hide it (so noindex is read)', () => {
  assert.match(HTML, /<meta name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(read('sitemap.xml'), /ongil-start/);
  assert.doesNotMatch(read('robots.txt'), /Disallow:\s*\/ongil-start/);
  assert.match(read('sitemap.xml'), /https:\/\/www\.newon\.app\/ko\/ongil\//, 'the public introduction page is the indexed one');
});

test('PR-28 no PWA layer was added at release: no service worker, manifest or cache API', () => {
  assert.doesNotMatch(`${ALL}\n${HTML}`, /serviceWorker|caches\.open|rel="manifest"|workbox/);
});
