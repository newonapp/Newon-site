// LIVON SEO Expansion V1 — static pages, manifest, sitemap, structured data, exclusions (SEO-1 … SEO-58).
// The generator is run once into a temporary site root; scripts/livon-seo-quality.mjs is the same check the build runs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadLivon } from '../../scripts/livon-data-quality.mjs';
import { loadSources, buildManifest, renderPages, sitemapEntries, patchSitemap, applyIndexingToApp, topicPolicy, eventPolicy, structuredData, POLICY, SITE, BRAND, INTENTS, EXCLUDED_AREAS, OG_IMAGE } from '../../scripts/livon-seo-build.mjs';
import { checkSite, parsePage } from '../../scripts/livon-seo-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const INDEX = src('livon/index.html'), BUILD = src('scripts/livon-seo-build.mjs'), QUALITY = src('scripts/livon-seo-quality.mjs'), CSS = src('livon/seo.css'), PUBLISH = src('scripts/publish-site.mjs');
const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* a minimal site root: what the generator and the checker need from the published site */
function makeRoot(env = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'livon-seo-'));
  for (const f of ['sitemap.xml', 'robots.txt', 'livon/index.html', 'livon/seo.css', 'assets/livon-mark.jpg', 'ko/index.html', '404.html']) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  }
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/livon-seo-build.mjs'), '--out', dir], { cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, env) });
  assert.equal(r.status, 0, r.stderr);
  return { dir, log: r.stdout };
}
const SITEROOT = makeRoot();
const OUT = SITEROOT.dir;
const Q = checkSite(OUT);
const M = Q.manifest, P = M.pages, byPath = Object.fromEntries(P.map(p => [p.path, p]));
const S = loadSources();
const page = p => fs.readFileSync(path.join(OUT, ...p.split('/').filter(Boolean), 'index.html'), 'utf8');
const of = t => P.filter(p => p.type === t);
const text = h => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const SITEMAP = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
const LOCS = [...SITEMAP.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const LIVON_LOCS = LOCS.filter(l => l.startsWith(SITE + '/livon/'));
/* path segments, so that a Help slug such as "explore-search" is not mistaken for a search page */
const segs = u => u.replace(SITE, '').split('/').filter(Boolean);
const NEVER = ['admin', 'data', 'today', 'community', 'my-life', 'life-now', 'search', 'results', 'onboarding', 'preferences', 'personalization', 'ai', 'explore'];
test.after(() => fs.rmSync(OUT, { recursive: true, force: true }));

test('SEO-1 audit: every surface is classified in docs/livon/LIVON_SEO.md', () => {
  const doc = src('docs/livon/LIVON_SEO.md');
  const rows = [...doc.matchAll(/^\| ([^|]+) \| (GOOD|PARTIAL|MISSING|WRONG|NOT INDEXABLE|SHOULD NOT INDEX) \|/gm)].map(m => [m[1].trim(), m[2]]);
  assert.ok(rows.length >= 28, 'audit rows: ' + rows.length);
  for (const k of ['GOOD', 'PARTIAL', 'MISSING', 'WRONG', 'NOT INDEXABLE', 'SHOULD NOT INDEX']) assert.ok(rows.some(r => r[1] === k), k);
  for (const name of ['/livon/ title', '/livon/ robots', 'Help hash routes', 'sitemap.xml', 'robots.txt', 'My Life', 'Local community posts', 'Admin', 'hreflang']) assert.ok(rows.some(r => r[0] === name), 'audit row: ' + name);
  for (const h of ['Audit', 'Indexability policy', 'URL architecture', 'Static generator', 'Manifest', 'Life Stage strategy', 'Topic strategy', 'Life Event strategy', 'Help strategy', 'Community policy', 'Canonical', 'Metadata', 'Structured data', 'Sitemap', 'Robots', 'Internal links', 'Multilingual readiness', 'GitHub Pages', 'CSP', 'Quality checks', 'Deployment notes']) {
    assert.match(doc, new RegExp('^## .*' + h, 'm'), 'doc section: ' + h);
  }
});

test('SEO-2 manifest: every page has type, source, slug, URL, title, description, canonical, index flag', () => {
  assert.equal(M.version, 1); assert.equal(M.site, 'https://www.newon.app'); assert.equal(M.indexing, true);
  for (const p of P) {
    for (const k of ['type', 'sourceId', 'slug', 'path', 'url', 'title', 'description', 'canonical', 'h1']) assert.ok(typeof p[k] === 'string' && p[k], p.path + ' ' + k);
    assert.equal(typeof p.index, 'boolean'); assert.ok(p.lastmod === null || /^\d{4}-\d{2}-\d{2}$/.test(p.lastmod));
    assert.ok(Array.isArray(p.breadcrumbs) && p.breadcrumbs.length >= 2 && p.breadcrumbs[0].path === '/livon/');
  }
  assert.deepEqual([of('life-overview').length, of('life-stage').length, of('life-topic').length, of('life-event-overview').length, of('life-event').length, of('help-home').length, of('help-article').length], [1, 7, 56, 1, 20, 1, 39]);
  assert.equal(P.length, 125);
  assert.deepEqual(JSON.parse(JSON.stringify(buildManifest(S))), M, 'the published manifest is what the sources produce');
});

test('SEO-3 main metadata: /livon/ says what LIVON is — title, description, canonical, index, OG, social', () => {
  const a = parsePage(INDEX);
  assert.equal(a.title, 'LIVON | 생애주기 생활 정보');
  assert.match(a.description, /10대부터 70대 이상까지 삶의 단계와 상황에 맞는 생활 정보와 공식 지원 정보, 할 일을 한곳에서 찾고 관리하는 서비스예요\. 회원가입 없이 쓸 수 있어요\./);
  assert.ok(a.description.length >= 60 && a.description.length <= 160);
  assert.equal(a.canonical, 'https://www.newon.app/livon/');
  assert.equal(a.robots, 'index, follow');
  assert.deepEqual([a.og.type, a.og.site_name, a.og.locale, a.og.title, a.og.url, a.og.image], ['website', 'LIVON', 'ko_KR', a.title, a.canonical, OG_IMAGE]);
  assert.equal(a.og.description, a.description);
  assert.doesNotMatch(a.title + a.description, /최고|완벽|1위|AI가 알아서|모든 것/, 'no exaggeration');
});

test('SEO-4 titles: one rule per page type, brand last, none too long', () => {
  assert.equal(byPath['/livon/life/'].title, '라이프 스테이지: 10대부터 70대 이상까지 | LIVON');
  assert.equal(byPath['/livon/life/20s/'].title, '20대 라이프 스테이지: 독립과 도전 | LIVON');
  assert.equal(byPath['/livon/life/20s/first-job/'].title, '첫 취업 준비 · 20대 | LIVON');
  assert.equal(byPath['/livon/life-events/first-job/'].title, '첫 취업 · Life Event | LIVON');
  assert.equal(byPath['/livon/help/'].title, 'LIVON 도움말');
  assert.equal(byPath['/livon/help/no-signup/'].title, '회원가입 없이 왜 쓸 수 있나요? | LIVON 도움말');
  for (const p of P) { assert.ok(p.title.includes(BRAND), p.path); assert.ok(p.title.length <= 60, p.title); }
});

test('SEO-5 descriptions: unique, 40–160 characters, taken from the source — no keyword stuffing', () => {
  const t = S.topics.find(x => x.id === '20s.first-job');
  assert.ok(byPath['/livon/life/20s/first-job/'].description.startsWith(t.description));
  assert.equal(byPath['/livon/help/no-signup/'].description, S.help.articles.find(a => a.id === 'no-signup').short);
  for (const p of P) {
    assert.ok(p.description.length >= 40 && p.description.length <= 160, p.path + ' ' + p.description.length);
    const words = p.description.split(/\s+/), top = Math.max(...Object.values(words.reduce((m, w) => (m[w] = (m[w] || 0) + 1, m), {})));
    assert.ok(top <= 3, 'a word repeated ' + top + ' times: ' + p.description);
  }
});

test('SEO-6 canonical: every page points to itself on https://www.newon.app (www, https, trailing slash)', () => {
  for (const p of P) {
    assert.equal(p.canonical, 'https://www.newon.app' + p.path);
    assert.match(p.path, /^\/livon\/[a-z0-9\-/]+\/$/);
    assert.equal(parsePage(page(p.path)).canonical, p.canonical);
  }
  assert.equal(fs.readFileSync(path.join(ROOT, 'CNAME'), 'utf8').trim(), 'www.newon.app');
  assert.doesNotMatch(P.map(p => p.canonical).join('\n'), /#|\?|\/\/newon\.app/);
});

test('SEO-7 index policy: what is indexable, and why', () => {
  assert.equal(Q.stats.indexable, 126, '125 static pages + /livon/');
  assert.ok(P.every(p => p.index === true));
  const stageById = Object.fromEntries(S.stages.map(s => [s.id, s]));
  for (const p of of('life-topic')) assert.equal(topicPolicy(S.topics.find(t => t.id === p.sourceId), stageById[p.sourceId.slice(0, 2)]).index, true);
  for (const p of of('life-event')) assert.equal(eventPolicy(S.events.find(e => e.id === p.sourceId), S.topicsByEvent[p.sourceId]).index, true);
  assert.deepEqual(JSON.parse(JSON.stringify(POLICY.topic)), { featuredOnly: true, minKnowledge: 2, minGuide: 3, minChecklist: 3, minRelations: 2, minText: 250 });
});

test('SEO-8 noindex policy: everything left out is listed with its reason; the pre-launch switch turns all of it off', () => {
  const by = M.excluded.reduce((m, e) => (m[e.type] = (m[e.type] || 0) + 1, m), {});
  assert.deepEqual(by, { 'life-topic': 172, 'life-event': 14, 'help-article': 29 });
  assert.ok(M.excluded.every(e => e.reason && e.where));
  assert.deepEqual(M.excludedAreas.map(a => a.area), ['my-life', 'onboarding', 'personalization', 'community-local', 'community-curated', 'today', 'explore', 'search-results', 'livon-ai', 'admin', 'data-manager']);
  const off = makeRoot({ LIVON_SEO_INDEX: 'off' });
  try {
    const q = checkSite(off.dir);
    assert.deepEqual(q.errors, []);
    assert.equal(q.manifest.indexing, false); assert.equal(q.stats.indexable, 0); assert.equal(q.stats.sitemapLivon, 0);
    assert.match(fs.readFileSync(path.join(off.dir, 'livon/index.html'), 'utf8'), /<meta name="robots" content="noindex, nofollow" \/>/);
    assert.match(fs.readFileSync(path.join(off.dir, 'livon/help/index.html'), 'utf8'), /<meta name="robots" content="noindex, follow" \/>/);
    assert.equal(fs.readFileSync(path.join(off.dir, 'sitemap.xml'), 'utf8'), src('sitemap.xml'), 'the sitemap is left exactly as it was');
  } finally { fs.rmSync(off.dir, { recursive: true, force: true }); }
});

test('SEO-9 Help static: a home page and 39 article pages with the whole answer in the HTML', () => {
  const home = page('/livon/help/'), t = text(home);
  assert.match(home, /<h1>LIVON 도움말<\/h1>/);
  for (const a of of('help-article')) assert.ok(home.includes(`<dt><a href="${a.path}">`), a.path + ' linked from Help home');
  const h = page('/livon/help/community-report/');
  assert.match(h, /<h1>신고하면 운영자에게 전달되나요\?<\/h1><p class="lv-seo-answer">아니요\. 지금 신고는 이 브라우저에만 기록돼요\. 운영자나 서버로 전송되지 않아요\.<\/p>/);
  assert.match(h, /<a class="lv-seo-btn" href="\/livon\/#help\/a\/community-report">LIVON 도움말에서 보기<\/a>/);
  assert.match(page('/livon/help/ts-cannot-save/'), /<h2>증상<\/h2>[\s\S]*<h2>가능한 이유<\/h2><ul>[\s\S]*<h2>해결 방법<\/h2><ol>/);
  assert.match(t, /검색, 문제 해결, 서비스 상태는 LIVON 안의 도움말에 있어요/);
});

test('SEO-10 Help single source: the static pages are generated from help-data.js — the same text as the interactive Help', () => {
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(src('livon/help-data.js'), ctx);
  const D = ctx.window.LivonHelpData, fill = s => String(s).replace(/\{(\w+)\}/g, (m, k) => D.facts[k]);
  assert.deepEqual([...D.seoIndexable].sort(), of('help-article').map(p => p.sourceId).sort());
  assert.ok(D.seoIndexable.every(id => D.articles.some(a => a.id === id)));
  for (const id of D.seoIndexable) {
    const a = D.articles.find(x => x.id === id), t = text(page('/livon/help/' + id + '/'));
    for (const s of [a.title, a.short].concat(a.body || [], a.steps || [], a.note || [], a.ts ? [a.ts.symptom, ...a.ts.causes, ...a.ts.fixes] : [])) assert.ok(t.includes(fill(s)), id + ': ' + String(s).slice(0, 30));
  }
  assert.doesNotMatch(text(page('/livon/help/what-is-life-stage/')), /\{\w+\}/);
  assert.ok(text(page('/livon/help/what-is-life-stage/')).includes('전체 주제는 228개예요'));
  assert.doesNotMatch(code(BUILD), /회원가입 없이 왜|신고하면 운영자에게|내 정보는 어디에 저장/, 'no Help sentence is retyped in the generator');
  assert.match(BUILD, /fs\.readFileSync\(path\.join\(ROOT, "livon", "help-data\.js"\)/);
});

test('SEO-11 Life Stage overview: the seven bands, each a real link', () => {
  const h = page('/livon/life/');
  assert.match(h, /<h1>라이프 스테이지<\/h1>/);
  for (const s of S.stages) assert.ok(h.includes(`<a href="/livon/life/${s.slug}/"><strong>${s.label} · ${s.title}</strong>`), s.slug);
  assert.match(h, /<a class="lv-seo-btn" href="\/livon\/#life">LIVON에서 라이프 스테이지 보기<\/a>/);
  assert.match(h, /href="\/livon\/life-events\/"/);
});

test('SEO-12 seven Life Stages: H1, intro, topics, Life Events, official information, a way into the app', () => {
  assert.deepEqual(of('life-stage').map(p => p.path), ['10s', '20s', '30s', '40s', '50s', '60s', '70s'].map(s => `/livon/life/${s}/`));
  for (const s of S.stages) {
    const h = page(`/livon/life/${s.slug}/`), t = text(h), n = S.topics.filter(x => x.lifeStageId === s.id).length;
    assert.ok(h.includes(`<h1>${s.label} · ${s.title}</h1>`), s.slug);
    assert.ok(t.includes(s.heroTitle) && t.includes(s.heroLead), s.slug + ' intro from the data');
    assert.ok(h.includes(`>분야별 주제 ${n}개</h2>`), s.slug);
    for (const x of S.topics.filter(x => x.lifeStageId === s.id)) assert.ok(t.includes(x.title), s.slug + ' lists ' + x.title);
    assert.ok(h.includes(`<a class="lv-seo-btn" href="/livon/#life/${s.slug}">LIVON에서 ${s.label} 정보 보기</a>`), s.slug + ' CTA');
    assert.match(h, /<h2 id="official">함께 확인할 공식 정보<\/h2>/);
  }
  assert.equal(byPath['/livon/life/70s/'].title, S.stages[6].label + ' 라이프 스테이지: ' + S.stages[6].title + ' | LIVON');
  assert.match(S.stages[6].label, /^70대/);
});

test('SEO-13 topic thin policy: 56 featured topics with full content are pages; the other 172 are grouped on their stage page', () => {
  const featured = new Set(S.stages.flatMap(s => s.featuredTopicIds));
  assert.equal(featured.size, 56);
  assert.deepEqual(of('life-topic').map(p => p.sourceId).sort(), [...featured].sort());
  assert.equal(S.topics.length, 228);
  for (const e of M.excluded.filter(x => x.type === 'life-topic')) assert.match(e.reason, /not-featured/);
  const grouped = S.topics.find(t => !featured.has(t.id) && t.lifeStageId === '20');
  assert.ok(!fs.existsSync(path.join(OUT, 'livon/life', grouped.stageSlug, grouped.slug, 'index.html')), 'no static page for a grouped topic');
  assert.ok(page('/livon/life/20s/').includes(`<a href="/livon/#life/20s/${grouped.slug}">${grouped.title}</a>`), 'a grouped topic links into the app');
  const h = page('/livon/life/20s/first-job/'), t = S.topics.find(x => x.id === '20s.first-job');
  for (const sec of ['알아 둘 점', '단계별 가이드', '체크리스트', '공식 정보', '관련 주제']) assert.ok(h.includes('>' + sec + '</h2>'), sec);
  for (const k of t.knowledge) assert.ok(h.includes(k.body.replace(/&/g, '&amp;')));
  assert.equal((h.match(/<ol class="lv-seo-steps">([\s\S]*?)<\/ol>/)[1].match(/<li>/g) || []).length, t.guide.length);
  // a topic that fails the thin rule is never a page, featured or not
  assert.equal(topicPolicy(Object.assign({}, t, { guide: t.guide.slice(0, 2) }), S.stages[1]).index, false);
  assert.equal(topicPolicy(Object.assign({}, t, { relatedPolicyIds: [], relatedServiceIds: [], relatedContentIds: [], relatedClassIds: [] }), S.stages[1]).index, false);
});

test('SEO-14 Life Events: an overview and 20 event pages built from the catalog and its real topic relations', () => {
  const h = page('/livon/life-events/first-job/'), e = S.events.find(x => x.id === 'first-job');
  assert.match(h, /<h1>첫 취업<\/h1>/);
  assert.ok(text(h).includes(e.blurb));
  for (const c of e.checklist) assert.ok(text(h).includes(c));
  for (const id of S.topicsByEvent['first-job']) assert.ok(text(h).includes(S.topics.find(t => t.id === id).title), id);
  assert.match(h, /<h3><a href="\/livon\/life\/20s\/">20대<\/a><\/h3>/);
  assert.match(h, /<a class="lv-seo-btn" href="\/livon\/#life-events">LIVON에서 관련 정보 확인<\/a>/);
  const ov = page('/livon/life-events/');
  for (const p of of('life-event')) assert.ok(ov.includes(`<a href="${p.path}"><strong>`), p.path);
  for (const p of of('life-event')) assert.ok((S.topicsByEvent[p.sourceId] || []).length >= 3, p.sourceId);
  assert.equal(S.events.length, 34);
});

test('SEO-15 content gaps: Life Events without enough content get no page and no index — only an honest line', () => {
  for (const id of ['freelance', 'car', 'abroad', 'long-trip']) {
    assert.ok(!byPath[`/livon/life-events/${id}/`], id);
    assert.ok(!fs.existsSync(path.join(OUT, 'livon/life-events', id)), id + ' directory');
    assert.ok(!LOCS.some(l => l.includes('/life-events/' + id + '/')));
    assert.equal(M.excluded.find(x => x.sourceId === id).reason, 'no-content');
  }
  const ov = page('/livon/life-events/'), t = text(ov);
  assert.match(t, /안내를 준비 중인 Life Event 현재 연결된 안내가 충분하지 않아요\. 프리랜서 차량 구매 해외생활 장기여행/);
  assert.doesNotMatch(ov, /href="\/livon\/life-events\/(freelance|car|abroad|long-trip)\//);
  assert.equal(M.excluded.filter(x => x.type === 'life-event' && x.reason === 'few-topics').length, 10);
});

test('SEO-16 sitemap: the existing sitemap plus the indexable LIVON URLs — no hash, query, date invention or excluded area', () => {
  assert.equal(LIVON_LOCS.length, 126);
  assert.ok(LIVON_LOCS.includes('https://www.newon.app/livon/'));
  assert.equal(LOCS.length, [...src('sitemap.xml').matchAll(/<loc>/g)].length + 126, 'nothing that was there is removed');
  assert.equal(new Set(LOCS).size, LOCS.length);
  assert.ok(LIVON_LOCS.every(l => /^https:\/\/www\.newon\.app\/livon\/([a-z0-9-]+\/)*$/.test(l)));
  assert.doesNotMatch(LIVON_LOCS.join('\n'), /#|\?/);
  assert.ok(!LIVON_LOCS.some(l => segs(l).some(x => NEVER.includes(x))), 'no excluded area in the sitemap');
  const block = SITEMAP.slice(SITEMAP.indexOf('<!-- LIVON SEO'), SITEMAP.indexOf('<!-- /LIVON SEO'));
  const dates = [...block.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1]);
  assert.ok(dates.length === 64 && dates.every(d => d === S.updatedAt), 'lastmod only on Life Stage pages, from life-topics.json updatedAt');
  assert.equal(S.updatedAt, JSON.parse(src('livon/life-topics.json')).updatedAt);
  assert.doesNotMatch(code(BUILD), /new Date\(|Date\.now\(/, 'no build-time date');
  assert.match(SITEMAP, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
});

test('SEO-17 sitemap consistency: patching is idempotent and equals the manifest', () => {
  const once = patchSitemap(src('sitemap.xml'), M), twice = patchSitemap(once, M);
  assert.equal(once, twice);
  assert.equal(once, SITEMAP);
  assert.deepEqual(sitemapEntries(M).map(e => e.loc).sort(), [...LIVON_LOCS].sort());
  assert.equal(patchSitemap(once, Object.assign({}, M, { indexing: false, pages: P.map(p => Object.assign({}, p, { index: false })) })), src('sitemap.xml'), 'switching off removes exactly the block');
});

test('SEO-18 robots: the sitemap is declared, the Admin is disallowed and — more importantly — not published', () => {
  const r = src('robots.txt');
  assert.match(r, /Sitemap: https:\/\/www\.newon\.app\/sitemap\.xml/);
  assert.match(r, /Disallow: \/admin\//);
  assert.doesNotMatch(r, /Disallow: \/livon\/?$/m, 'LIVON is crawlable');
  assert.match(PUBLISH, /fs\.rmSync\(path\.join\(OUT, "livon", "admin"\)/, 'removal from the build, not robots, keeps the Admin private');
  assert.equal(fs.readFileSync(path.join(OUT, 'robots.txt'), 'utf8'), r, 'the generator does not rewrite robots.txt');
});

test('SEO-19 internal links: real <a href> everywhere — from the app, between static pages, and back into the app', () => {
  assert.match(INDEX, /<p class="lv-hm-guides">안내 페이지 · <a href="\/livon\/life\/">연령대별 라이프 스테이지<\/a> · <a href="\/livon\/life-events\/">Life Event<\/a> · <a href="\/livon\/help\/">도움말<\/a><\/p>/);
  assert.match(INDEX, /<noscript>\s*<nav class="lv-noscript" aria-label="LIVON 안내 페이지">[\s\S]*<a href="\/livon\/life\/">라이프 스테이지<\/a>[\s\S]*<a href="\/livon\/help\/">도움말<\/a>\s*<\/nav>\s*<\/noscript>/);
  for (const p of P) {
    const d = Q.parsed[p.path];
    for (const nav of ['/livon/', '/livon/life/', '/livon/life-events/', '/livon/help/']) assert.ok(d.links.includes(nav), p.path + ' → ' + nav);
    assert.ok(d.links.some(l => /^\/livon\/#/.test(l)), p.path + ' has a link into the app');
  }
  assert.doesNotMatch(P.map(p => page(p.path)).join(''), /onclick=|href="javascript:|data-href=/);
});

test('SEO-20 breadcrumbs: LIVON › section › page, visible and equal to the manifest', () => {
  assert.deepEqual(byPath['/livon/life/20s/'].breadcrumbs.map(b => b.name), ['LIVON', '라이프 스테이지', '20대']);
  assert.deepEqual(byPath['/livon/life/20s/first-job/'].breadcrumbs.map(b => b.name), ['LIVON', '라이프 스테이지', '20대', '첫 취업 준비']);
  assert.deepEqual(byPath['/livon/help/how-recommendation-works/'].breadcrumbs.map(b => b.name), ['LIVON', '도움말', '맞춤 설정', '추천은 어떻게 정해지나요?']);
  for (const p of P) {
    const d = Q.parsed[p.path];
    assert.deepEqual(d.crumbs.map(c => c.name), p.breadcrumbs.map(b => b.name), p.path);
    assert.equal(d.crumbs[d.crumbs.length - 1].path, null, 'the current page is text with aria-current');
  }
  assert.match(page('/livon/life/20s/'), /<nav class="lv-seo-crumbs" aria-label="현재 위치"><ol><li><a href="\/livon\/">LIVON<\/a><\/li><li><a href="\/livon\/life\/">라이프 스테이지<\/a><\/li><li aria-current="page">20대<\/li><\/ol><\/nav>/);
  assert.ok(page('/livon/help/').includes('<h2 id="personalization">맞춤 설정</h2>'), 'the category crumb target exists');
});

const graphOf = html => parsePage(html).jsonld.flatMap(j => JSON.parse(j)['@graph']);
test('SEO-21 WebSite schema: once, on /livon/, with the real publisher', () => {
  const g = graphOf(INDEX), ws = g.find(x => x['@type'] === 'WebSite');
  assert.deepEqual([ws['@id'], ws.url, ws.name, ws.inLanguage], ['https://www.newon.app/livon/#website', 'https://www.newon.app/livon/', 'LIVON', 'ko']);
  assert.deepEqual(ws.publisher, { '@type': 'Organization', name: 'Newon', url: 'https://www.newon.app/' });
  assert.equal(ws.description, parsePage(INDEX).description);
  assert.ok(!ws.potentialAction, 'no SearchAction: LIVON has no indexable search URL');
  for (const p of P) assert.ok(!graphOf(page(p.path)).some(x => x['@type'] === 'WebSite'), p.path);
  assert.match(src('ko/index.html'), /Newon/);
});

test('SEO-22 WebPage schema: name, description and URL equal the page', () => {
  for (const p of P) {
    const wp = graphOf(page(p.path)).find(x => x['@type'] === 'WebPage');
    assert.deepEqual([wp.url, wp.name, wp.description, wp.inLanguage, wp.isPartOf['@id']], [p.url, p.title, p.description, 'ko', 'https://www.newon.app/livon/#website'], p.path);
  }
  const app = graphOf(INDEX).find(x => x['@type'] === 'WebPage');
  assert.deepEqual([app.url, app.name], ['https://www.newon.app/livon/', 'LIVON | 생애주기 생활 정보']);
});

test('SEO-23 Breadcrumb schema: positions, names and absolute URLs match the visible trail', () => {
  for (const p of P) {
    const bc = graphOf(page(p.path)).find(x => x['@type'] === 'BreadcrumbList');
    assert.deepEqual(bc.itemListElement.map(i => [i.position, i.name, i.item]), p.breadcrumbs.map((b, i) => [i + 1, b.name, SITE + b.path]), p.path);
  }
});

test('SEO-24 FAQ schema correctness: only on the Help home, and only text that is visible there', () => {
  const withFaq = P.filter(p => graphOf(page(p.path)).some(x => x['@type'] === 'FAQPage'));
  assert.deepEqual(withFaq.map(p => p.path), ['/livon/help/']);
  const faq = graphOf(page('/livon/help/')).find(x => x['@type'] === 'FAQPage'), t = text(page('/livon/help/'));
  assert.equal(faq.mainEntity.length, 39);
  for (const q of faq.mainEntity) { assert.equal(q['@type'], 'Question'); assert.ok(t.includes(q.name) && t.includes(q.acceptedAnswer.text), q.name); }
  assert.ok(!P.some(p => graphOf(page(p.path)).some(x => ['Article', 'Organization', 'Product', 'Review', 'AggregateRating', 'HowTo', 'Person'].includes(x['@type']))), 'no schema is used to chase rich results');
});

test('SEO-25 JSON-LD validity: parses, one block per page, safe against markup in the data', () => {
  for (const p of P) { const d = Q.parsed[p.path]; assert.equal(d.jsonld.length, 1, p.path); const j = JSON.parse(d.jsonld[0]); assert.equal(j['@context'], 'https://schema.org'); assert.ok(j['@graph'].length >= 2); }
  const evil = structuredData({ url: 'u', title: '</script><script>alert(1)</script>', description: 'd', breadcrumbs: [{ name: 'a', path: '/livon/' }] });
  assert.equal(JSON.parse(JSON.stringify(evil))['@graph'][0].name, '</script><script>alert(1)</script>');
  assert.match(BUILD, /JSON\.stringify\(obj\)\.replace\(\/<\/g, "\\\\u003c"\)/, '"<" is escaped inside the data block');
  assert.doesNotThrow(() => JSON.parse(parsePage(INDEX).jsonld[0]));
});

test('SEO-26 Open Graph: type, title, description, url, site name, locale and an image that exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/livon-mark.jpg')));
  assert.equal(OG_IMAGE, 'https://www.newon.app/assets/livon-mark.jpg');
  for (const p of P) {
    const og = Q.parsed[p.path].og;
    assert.deepEqual([og.title, og.description, og.url, og.site_name, og.locale, og.image], [p.title, p.description, p.canonical, 'LIVON', 'ko_KR', OG_IMAGE], p.path);
    assert.equal(og.type, ['help-article', 'life-topic'].includes(p.type) ? 'article' : 'website');
  }
});

test('SEO-27 social metadata: the same card on every page (summary — the image is square)', () => {
  for (const p of P) assert.deepEqual(Q.parsed[p.path].twitter, { card: 'summary', title: p.title, description: p.description, image: OG_IMAGE }, p.path);
  assert.deepEqual(parsePage(INDEX).twitter, { card: 'summary', title: 'LIVON | 생애주기 생활 정보', description: parsePage(INDEX).description, image: OG_IMAGE });
});

test('SEO-28 lang: every LIVON page is declared Korean', () => {
  assert.match(INDEX, /^<!DOCTYPE html>\s*<html lang="ko">/);
  for (const p of P) assert.match(page(p.path), /^<!DOCTYPE html>\n<html lang="ko">/, p.path);
});

test('SEO-29 hreflang validity: none is declared, because no translated LIVON page exists', () => {
  for (const lang of ['en', 'ja', 'es', 'fr', 'de', 'hi', 'id', 'pt-br']) assert.ok(!fs.existsSync(path.join(ROOT, lang, 'livon', 'index.html')), lang + '/livon does not exist');
  assert.doesNotMatch(INDEX, /hreflang=/);
  for (const p of P) assert.doesNotMatch(page(p.path), /hreflang=|x-default/, p.path);
});

test('SEO-30 community local exclusion: no post, profile or community page is ever generated', () => {
  assert.ok(!P.some(p => segs(p.path).includes('community')));
  assert.ok(!fs.existsSync(path.join(OUT, 'livon/community')));
  assert.doesNotMatch(code(BUILD), /cmStore|LivonCommunityRepo|LivonCommunityService|community-page|localStorage|sessionStorage/);
  assert.ok(M.excludedAreas.find(a => a.area === 'community-local').reason.includes('never generated'));
  assert.equal(loadLivon().LivonCommunityData.posts, undefined, 'there are no curated posts to publish either');
});

test('SEO-31 My Life exclusion: nothing personal is in the build', () => {
  assert.ok(!P.some(p => segs(p.path).some(x => ['my-life', 'life-now'].includes(x) || /^ml-/.test(x))));
  assert.doesNotMatch(code(BUILD), /mlStore|LivonMyLife|life-now/);
  assert.doesNotMatch(P.map(p => page(p.path)).join(''), /href="\/livon\/#ml-(?!settings|saved)/, 'only the settings / saved screens are linked, as destinations from Help');
});

test('SEO-32 onboarding exclusion: the generator never reads a visitor profile', () => {
  assert.doesNotMatch(code(BUILD), /LivonPersonalization|getProfile|livon\.lifeStage|livon\.lifeInterests|livon\.lifeEvents|livon\.personalization|LivonOnboarding/);
  assert.ok(!P.some(p => segs(p.path).some(x => ['onboarding', 'preferences', 'personalization'].includes(x))));
  // the same output whatever is in a browser profile: sources are files only
  const ctx = loadLivon(); ctx.localStorage.setItem('livon.lifeStage', '"70"');
  assert.deepEqual(JSON.parse(JSON.stringify(buildManifest(loadSources()))), M);
});

test('SEO-33 Admin exclusion', () => {
  assert.ok(!P.some(p => /admin/.test(p.path)));
  assert.ok(!LOCS.some(l => /\/admin\//.test(l)));
  assert.doesNotMatch(code(BUILD), /livon\/admin|LivonAdmin|admin-service/);
  assert.doesNotMatch(P.map(p => page(p.path)).join(''), /\/livon\/admin/);
});

test('SEO-34 Data Manager exclusion', () => {
  assert.doesNotMatch(code(BUILD), /LivonDataManager|admin\/data|data-manager-core/);
  assert.ok(!P.some(p => /data-manager|admin\/data/.test(p.path)));
  assert.equal(loadLivon().LivonScreenData.repository().all().length > 400, true, 'the curated records are read, not copied into pages one by one');
  assert.ok(P.length < 130, 'not a page per record: ' + P.length);
});

test('SEO-35 search results exclusion: no query or filter URL is a page or a sitemap entry', () => {
  assert.ok(!P.some(p => /\?/.test(p.path) || segs(p.path).some(x => ['search', 'results'].includes(x))));
  assert.doesNotMatch(LIVON_LOCS.join('\n'), /\?|=|\/search\//);
  assert.doesNotMatch(P.map(p => page(p.path)).join(''), /href="[^"]*(\?q=|\?query=|\?filter=|\?sort=)/);
  assert.ok(M.excludedAreas.some(a => a.area === 'search-results'));
});

test('SEO-36 static content without JS: title, description, H1, content and links are in the HTML; no script runs', () => {
  for (const p of P) {
    const h = page(p.path), d = Q.parsed[p.path];
    assert.equal(d.inlineScripts, 0, p.path); assert.deepEqual(d.externalScripts, [], p.path);
    assert.doesNotMatch(h, /http-equiv="refresh"|location\.replace|<noscript>/, p.path + ' is content, not a redirect');
    assert.ok(d.text.length >= 280, p.path + ' text ' + d.text.length);
  }
  assert.match(page('/livon/life/20s/first-job/'), /희망 직무 3개 정하기/);
});

test('SEO-37 slug stability: URLs come from stable ids in the data, not from titles or positions', () => {
  for (const p of of('life-topic')) { const t = S.topics.find(x => x.id === p.sourceId); assert.equal(p.path, `/livon/life/${t.stageSlug}/${t.slug}/`); assert.equal(t.id, t.stageSlug + '.' + t.slug); }
  for (const p of of('life-event')) assert.equal(p.path, `/livon/life-events/${p.sourceId}/`);
  for (const p of of('help-article')) assert.equal(p.path, `/livon/help/${p.sourceId}/`);
  for (const p of P) assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, p.slug);
  // the paths the app already used for its direct-URL stubs are kept
  assert.match(src('scripts/render-livon-life-routes.mjs'), /pathName: `\/livon\/life\/\$\{t\.stageSlug\}\/\$\{t\.slug\}\/`/);
  const reordered = Object.assign({}, S, { topics: [...S.topics].reverse(), events: [...S.events].reverse() });
  assert.deepEqual(buildManifest(reordered).pages.map(p => p.path).sort(), P.map(p => p.path).sort(), 'order of the data does not change any URL');
});

test('SEO-38 slug collision: duplicate or unsafe paths stop the build', () => {
  assert.equal(new Set(P.map(p => p.path)).size, P.length);
  const dup = Object.assign({}, S, { events: S.events.concat([Object.assign({}, S.events.find(e => e.id === 'first-job'))]) });
  assert.throws(() => buildManifest(dup), /duplicate path: \/livon\/life-events\/first-job\//);
  const bad = Object.assign({}, S, { events: S.events.map(e => (e.id === 'first-job' ? Object.assign({}, e, { id: '../x' }) : e)), topicsByEvent: Object.assign({}, S.topicsByEvent, { '../x': S.topicsByEvent['first-job'] }) });
  assert.throws(() => buildManifest(bad), /unsafe path/);
  assert.ok(!Q.errors.some(e => e.code === 'duplicate-slug' || e.code === 'bad-slug'));
});

test('SEO-39 duplicate title: none', () => {
  assert.equal(new Set(P.map(p => p.title)).size, P.length);
  assert.ok(!P.some(p => p.title === parsePage(INDEX).title));
  assert.equal(Q.stats.uniqueTitles, 125);
});

test('SEO-40 duplicate description: none', () => {
  assert.equal(new Set(P.map(p => p.description)).size, P.length);
  assert.ok(!P.some(p => p.description === parsePage(INDEX).description));
  assert.equal(Q.stats.uniqueDescriptions, 125);
});

test('SEO-41 missing H1: exactly one per page, equal to the manifest, no skipped heading level', () => {
  for (const p of P) { const d = Q.parsed[p.path]; assert.deepEqual(d.h1, [p.h1], p.path); for (let i = 1; i < d.headings.length; i++) assert.ok(d.headings[i] <= d.headings[i - 1] + 1, p.path); }
});

test('SEO-42 broken internal links: every internal link resolves to a published file; external links are https (format only)', () => {
  assert.equal(Q.stats.brokenInternal, 0);
  assert.ok(!Q.errors.some(e => ['broken-link', 'bad-link', 'relative-link'].includes(e.code)));
  const ext = P.flatMap(p => Q.parsed[p.path].links.filter(l => /^https?:/.test(l)));
  assert.ok(ext.length > 50 && ext.every(l => /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(l)), 'https with a host');
  assert.ok(ext.every(l => !l.startsWith(SITE)), 'own pages are linked with site-relative paths');
  const h = page('/livon/life/20s/first-job/');
  assert.match(h, /<a href="https:\/\/www\.work24\.go\.kr\/" rel="noopener noreferrer" target="_blank">[^<]+<span class="lv-seo-ext"> \(공식 사이트, 새 창\)<\/span><\/a>/, 'official links are marked as external');
  assert.doesNotMatch(P.map(p => page(p.path)).join(''), /rel="[^"]*nofollow|display:\s*none|visibility:\s*hidden/, 'no hidden or manipulated link');
  assert.match(QUALITY, /format checked only \(not fetched\)/);
});

test('SEO-43 orphan pages: every indexable page is linked from another indexable static page', () => {
  assert.equal(Q.stats.orphans, 0);
  assert.ok(!Q.errors.some(e => e.code === 'orphan'));
});

test('SEO-44 thin content: no indexable page is thin — own text, useful links, a list and a way into the app', () => {
  assert.equal(Q.stats.thin, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(POLICY.thin)), { minTextChars: 280, minInternalLinks: 3 });
  // the checker really catches a thin page
  const tmp = makeRoot();
  try {
    const f = path.join(tmp.dir, 'livon/help/no-signup/index.html');
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/<main[\s\S]*<\/main>/, '<main id="main"><h1>회원가입 없이 왜 쓸 수 있나요?</h1><p>짧은 글.</p></main>'));
    const codes = checkSite(tmp.dir).errors.filter(e => e.where === '/livon/help/no-signup/').map(e => e.code);
    assert.ok(codes.includes('thin-indexable'), codes.join());
  } finally { fs.rmSync(tmp.dir, { recursive: true, force: true }); }
});

test('SEO-45 manifest-page consistency: every manifest page exists and says what the manifest says; nothing extra', () => {
  assert.deepEqual(Q.errors, []);
  const found = [];
  (function walk(d) { for (const n of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, n.name); if (n.isDirectory()) walk(f); else if (n.name === 'index.html') found.push('/' + path.relative(OUT, d).split(path.sep).join('/') + '/'); } })(path.join(OUT, 'livon'));
  assert.deepEqual(found.filter(f => f !== '/livon/').sort(), P.map(p => p.path).sort());
  const rendered = renderPages(S, M);
  for (const r of rendered) assert.equal(r.html, page(r.path), r.path + ' is deterministic');
});

test('SEO-46 manifest-sitemap consistency: index → in the sitemap; the checker reports any drift', () => {
  for (const p of P) assert.equal(LOCS.includes(p.url), p.index, p.path);
  const tmp = makeRoot();
  try {
    const sm = path.join(tmp.dir, 'sitemap.xml'), x = fs.readFileSync(sm, 'utf8');
    fs.writeFileSync(sm, x.replace('  <url>\n    <loc>https://www.newon.app/livon/help/no-signup/</loc>\n  </url>\n', '').replace('<!-- /LIVON SEO -->', '<url>\n    <loc>https://www.newon.app/livon/admin/</loc>\n  </url>\n  <!-- /LIVON SEO -->'));
    const codes = checkSite(tmp.dir).errors.map(e => e.code);
    assert.ok(codes.includes('sitemap-missing') && codes.includes('sitemap-unknown') && codes.includes('sitemap-excluded-area'), codes.join());
  } finally { fs.rmSync(tmp.dir, { recursive: true, force: true }); }
});

test('SEO-47 responsive: fluid width, wrapping rows, no fixed widths', () => {
  assert.match(CSS, /\.lv-seo-inner \{ width: min\(880px, calc\(100% - clamp\(1\.25rem, 4vw, 3rem\) \* 2\)\); margin: 0 auto; \}/);
  assert.match(CSS, /overflow-wrap: anywhere;/);
  assert.match(CSS, /\.lv-seo-cards \{[^}]*grid-template-columns: repeat\(auto-fill, minmax\(min\(100%, 15rem\), 1fr\)\);/);
  assert.match(CSS, /\.lv-seo-top__row \{ display: flex; flex-wrap: wrap;/);
  assert.match(CSS, /@media \(max-width: 480px\)/);
  assert.doesNotMatch(CSS.replace(/@media \([^)]*\)/g, '').replace(/min\(880px[^;]*;/, ''), /[^-]width:\s*\d{3,}px/);
  for (const p of P) assert.match(page(p.path), /<meta name="viewport" content="width=device-width, initial-scale=1\.0" \/>/);
});

test('SEO-48 accessibility: landmarks, skip link, labelled navigation, focus styles, 44px targets, readable contrast', () => {
  for (const p of P) {
    const h = page(p.path);
    for (const re of [/<a class="lv-seo-skip" href="#main">본문으로 건너뛰기<\/a>/, /<header class="lv-seo-top">/, /<main id="main" class="lv-seo-inner">/, /<footer class="lv-seo-foot">/, /<nav class="lv-seo-nav" aria-label="LIVON 안내">/, /<nav class="lv-seo-crumbs" aria-label="현재 위치">/, /<nav aria-label="LIVON 바로가기">/]) assert.match(h, re, p.path);
    assert.doesNotMatch(h, /<img(?![^>]*alt=)|tabindex="[1-9]/, p.path);
    for (const m of h.matchAll(/<section aria-labelledby="([\w-]+)"/g)) assert.ok(h.includes(`id="${m[1]}"`), p.path + ' #' + m[1]);
  }
  assert.match(CSS, /\.lv-seo a:focus-visible \{ outline: 2px solid #0a0a0a; outline-offset: 2px; \}/);
  assert.match(CSS, /\.lv-seo-skip:focus \{ left: 0\.5rem; top: 0\.5rem; \}/);
  assert.ok((CSS.match(/min-height: 4[48]px/g) || []).length >= 8);
  const greys = [...CSS.matchAll(/color: #([0-9a-f]{6})/g)].map(m => m[1]);
  const lum = hex => { const c = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  for (const g of greys.filter(x => x !== 'ffffff' && x !== 'a3a3a3')) assert.ok(1.05 / (lum(g) + 0.05) >= 4.5, 'text colour #' + g + ' on white');
  assert.doesNotMatch(CSS, /transition|animation/);
});

test('SEO-49 performance: small pages, one stylesheet, no application script, no Data Platform at runtime', () => {
  const sizes = P.map(p => Buffer.byteLength(page(p.path)));
  assert.ok(Math.max(...sizes) < 40 * 1024, 'largest page ' + Math.max(...sizes));
  assert.ok(Buffer.byteLength(CSS) < 12 * 1024);
  for (const p of P) { const h = page(p.path); assert.equal((h.match(/<link[^>]*rel="stylesheet"[^>]*href="\/livon\//g) || []).length, 1, p.path); assert.doesNotMatch(h, /<script[^>]*src=|livon-data-platform|life-topics\.json|<img /, p.path); }
  const t = process.hrtime.bigint(); renderPages(S, buildManifest(S));
  assert.ok(Number(process.hrtime.bigint() - t) / 1e6 < 1500);
});

test('SEO-50 GitHub Pages compatibility: real directories with index.html, no rewrite or server needed, real 404', () => {
  for (const p of P) assert.ok(fs.existsSync(path.join(OUT, ...p.path.split('/').filter(Boolean), 'index.html')), p.path);
  assert.ok(fs.existsSync(path.join(ROOT, '404.html')), 'unknown URLs get the site 404 page with a 404 status on GitHub Pages');
  assert.ok(!fs.existsSync(path.join(OUT, 'livon/help/nope')));
  assert.doesNotMatch(code(BUILD), /rewrite|_redirects|vercel/);
  assert.match(src('.github/workflows/github-pages.yml'), /run: node scripts\/publish-site\.mjs[\s\S]*publish_dir: \.\/_publish/);
});

test('SEO-51 Help regression: the interactive Help is unchanged — same routes, same data, one extra list', () => {
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(src('livon/help-data.js'), ctx);
  const D = ctx.window.LivonHelpData;
  assert.deepEqual([D.articles.length, D.categories.length, D.synonyms.length, D.status.length, D.contextual.length], [68, 10, 29, 10, 8]);
  const hp = src('livon/help-page.js');
  for (const r of ['"help/search?q="', '#help/a/', '#help/c/', '#help/status']) assert.ok(hp.includes(r), 'hash route kept: ' + r);
  assert.doesNotMatch(src('livon/help-page.js'), /seoIndexable|\/livon\/help\//);
  assert.doesNotMatch(INDEX.match(/function livonView\(hash\) \{[\s\S]*?\n        \}/)[0], /help/, 'the inline router was not changed for SEO');
});

test('SEO-52 Community regression: the community is not read, changed or published by the SEO build', () => {
  const ctx = loadLivon(); vm.runInContext(src('livon/community-service.js'), ctx);
  assert.equal(ctx.LivonCommunityService.TYPES.length, 6);
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.LivonCommunityService.adapter().follows())), { available: false, status: 'ACCOUNT_REQUIRED', list: [] });
  assert.match(INDEX, /\/livon\/community-service\.js\?v=[\w]+"><\/script>\s*<script src="\/livon\/community-page\.js/);
  assert.ok(text(page('/livon/help/community-post-storage/')).includes('글, 댓글, 공감은 이 브라우저에만 저장돼요'));
});

test('SEO-53 Onboarding regression: states, steps and the dialog markup are as before', () => {
  const PZ = loadLivon().LivonPersonalization;
  assert.deepEqual([...PZ.STATES], ['NEW', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']);
  assert.deepEqual([...PZ.STEPS], ['stage', 'interests', 'events', 'preview']);
  assert.match(INDEX, /<aside class="lv-ob-entry" id="livon-onboard-entry" role="region" aria-labelledby="livon-onboard-entry-title" hidden><\/aside>/);
  assert.match(INDEX, /<div class="lv-life-modal lv-ob" id="livon-onboard-modal" hidden>/);
});

test('SEO-54 Admin regression: still local-only, noindex and removed from the build', () => {
  assert.match(src('livon/admin/index.html'), /<meta name="robots" content="noindex, nofollow">/);
  assert.match(PUBLISH, /console\.error\("publish-site: livon\/admin must not be published"\)/);
  assert.ok(Q.errors.every(e => e.code !== 'admin-published'));
  assert.match(QUALITY, /if \(fs\.existsSync\(path\.join\(root, "livon", "admin"\)\)\) err\("admin-published"/, 'the SEO check fails a build that contains the Admin');
});

test('SEO-55 Data Manager regression: 530 curated records, none turned into a page of its own', () => {
  const ctx = loadLivon(); vm.runInContext(src('livon/admin/data/data-manager-core.js'), ctx);
  const DM = ctx.LivonDataManager, model = DM.createModel(ctx, { now: Date.parse('2026-10-01T00:00:00Z') });
  assert.equal(model.records.length, 530);
  assert.ok(!DM.DATA_SCRIPTS.some(x => /seo/.test(x)));
  assert.equal(S.topics.length, 228); assert.equal(S.policies.length, 17);
});

test('SEO-56 public LIVON regression: the app page gained metadata, a noscript fallback and one line of links — its scripts are unchanged', () => {
  const hashes = [...INDEX.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(m => "'sha256-" + crypto.createHash('sha256').update(m[1]).digest('base64') + "'");
  assert.equal(hashes.length, 4, 'four executable inline scripts, as before');
  const csp = src('vercel.json');
  for (const h of hashes) assert.ok(csp.includes(h), 'inline script changed: its CSP hash ' + h + ' is no longer in vercel.json');
  assert.equal((INDEX.match(/<script type="application\/ld\+json">/g) || []).length, 1, 'one JSON-LD data block (data, not executed)');
  assert.equal((INDEX.match(/<section[^>]*data-lv-screen="/g) || []).length, 8);
  assert.equal((INDEX.match(/class="gnav-mobile__sublink"/g) || []).length, 8);
  assert.match(src('livon/home-page.css'), /#livon-home \.lv-hm-guides \{/);
  assert.match(src('livon/help-page.css'), /\.lv-noscript \{/);
});

test('SEO-57 anonymous mode: static pages ask for nothing and promise no account', () => {
  const all = P.map(p => page(p.path)).join('');
  assert.doesNotMatch(all, /<form|<input|<button|type="password"|로그인하세요|회원가입 후/);
  assert.match(text(page('/livon/help/no-signup/')), /LIVON은 지금 계정 없이 쓰는 서비스예요/);
  assert.match(all, /회원가입 없이 쓸 수 있어요/);
});

test('SEO-58 build: the generator and the quality check are part of publish-site, after the route stubs and before verification', () => {
  const a = PUBLISH.indexOf('render-livon-today-routes.mjs"), "--out"'), b = PUBLISH.indexOf('"livon-seo-build.mjs"), "--out", OUT'), c = PUBLISH.indexOf('"livon-seo-quality.mjs"), "--root", OUT'), d = PUBLISH.lastIndexOf('\nverify();');
  assert.ok(a > 0 && a < b && b < c && c < d, [a, b, c, d].join());
  for (const f of ['"seo.css"', '"seo-manifest.json"', '"help", "index.html"', '"life-events", "index.html"']) assert.ok(PUBLISH.includes('required.push(path.join(OUT, "livon", ' + f + '));'), f);
  assert.match(SITEROOT.log, /livon-seo-build: 125 pages \(stages 7, topics 56, life events 20, help 39\) · indexing ON · excluded 215/);
  const q = spawnSync(process.execPath, [path.join(ROOT, 'scripts/livon-seo-quality.mjs'), '--root', OUT], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(q.status, 0, q.stderr);
  assert.match(q.stdout, /livon-seo-quality: 0 error\(s\)/);
  assert.equal(applyIndexingToApp(INDEX, true), INDEX);
});

test('SEO intent QA: ' + INTENTS.length + ' search intents each have one landing page whose title, H1 or description carries the words', () => {
  assert.ok(INTENTS.length >= 40);
  const app = parsePage(INDEX);
  for (const [q, target] of INTENTS) {
    const p = target === '/livon/' ? { title: app.title, h1: 'LIVON', description: app.description, index: true } : byPath[target];
    assert.ok(p && p.index, q + ' → ' + target);
    const hay = (p.title + ' ' + p.h1 + ' ' + p.description + ' ' + (target === '/livon/' ? '' : text(page(target)))).toLowerCase().replace(/\s+/g, '');
    const words = q.toLowerCase().replace(/리브온/g, 'livon').split(/\s+/).filter(w => w.length >= 2);
    const hit = words.filter(w => hay.includes(w) || hay.includes(w.replace(/(준비|정보|사용|기준|위치)$/, ''))).length;
    assert.ok(hit >= Math.ceil(words.length * 0.6), q + ' → ' + target + ' (' + hit + '/' + words.length + ')');
  }
  assert.equal(new Set(INTENTS.map(i => i[0])).size, INTENTS.length);
  assert.doesNotMatch(src('docs/livon/LIVON_SEO.md'), /1위|상위 노출 보장|순위를 보장/, 'a mapping, not a ranking promise');
});
