// LIVON Help & FAQ V1 — Help Center, contextual help, troubleshooting (HF-1 … HF-53).
// The consistency tests (HF-38 … HF-46) compare what Help says with what the code does: when a feature changes,
// they fail until livon/help-data.js is updated.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadLivon } from '../../scripts/livon-data-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, 'livon', f), 'utf8');
const J = x => JSON.parse(JSON.stringify(x));
const INDEX = read('index.html'), PAGE = read('help-page.js'), DATA_SRC = read('help-data.js'), CSS = read('help-page.css');
const text = html => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const code = src => src.replace(/\/\*[\s\S]*?\*\//g, '');

/* The public page with a stub DOM: Help renders HTML into one host, which is what the tests read. */
function hp({ hash = '#help', local = {}, full = false } = {}) {
  const listeners = { doc: {}, win: {} };
  const on = bag => (t, f) => { (bag[t] = bag[t] || []).push(f); };
  const els = {};
  const mk = () => { const a = {}; return { hidden: false, innerHTML: '', textContent: '', value: '', focused: 0, setAttribute(k, v) { a[k] = String(v); }, getAttribute: k => (k in a ? a[k] : null), removeAttribute(k) { delete a[k]; }, focus() { this.focused++; doc.activeElement = this; }, querySelector: () => null, closest: () => null, classList: { remove() {}, add() {} } }; };
  const WANT = ['[data-lv-hp-root]', '[data-lv-hp-status]', '#lv-hp-h', '#help [data-lv-hp-q]'];
  let doc;
  doc = {
    readyState: 'complete', title: 'LivOn', documentElement: { dataset: { lvView: 'home' } }, body: { style: {} }, head: { querySelector: () => null }, activeElement: null,
    getElementById: id => (/^lv-hp-/.test(id) ? (els['#' + id] = els['#' + id] || mk()) : null), querySelector: s => (WANT.includes(s) ? (els[s] = els[s] || mk()) : null), querySelectorAll: () => [],
    addEventListener: on(listeners.doc), contains: () => false, createElement: () => mk(), dispatchEvent: () => true
  };
  const net = [], writes = [];
  const ctx = loadLivon({
    patch(c) {
      c.document = doc;
      let cur = hash;   /* like the browser: location.hash always starts with # */
      c.location = { origin: 'https://www.newon.app', pathname: '/livon/', hostname: 'www.newon.app', get hash() { return cur; }, set hash(v) { v = String(v); cur = v && v.charAt(0) !== '#' ? '#' + v : v; } };
      c.scrollTo = () => {}; c.matchMedia = () => ({ matches: true });
      c.addEventListener = on(listeners.win);
      c.CustomEvent = class { constructor(type) { this.type = type; } };
      c.fetch = (...a) => { net.push('fetch ' + a[0]); return Promise.reject(new Error('offline')); };
      c.XMLHttpRequest = function () { net.push('xhr'); throw new Error('no network'); };
      c.navigator = { sendBeacon: u => { net.push('beacon ' + u); return false; }, onLine: false };
      c.Image = function () { net.push('image'); };
      vm.runInContext(read('data/livon-storage-guard.js'), c);
      const set = c.localStorage.setItem.bind(c.localStorage);
      c.localStorage.setItem = (k, v) => { writes.push(k); set(k, v); };
      for (const [k, v] of Object.entries(local)) set(k, JSON.stringify(v));
      vm.runInContext(read('data/livon-user-data.js'), c);
      vm.runInContext(read('livon-api-config.js'), c);
    }
  });
  const files = (full ? ['livon-platform.js', 'community-service.js'] : []).concat(['help-data.js', 'help-page.js']);
  for (const f of files) vm.runInContext(read(f), ctx, { filename: f });
  const H = ctx.LivonHelp, T = H._test;
  net.length = 0;   /* only what Help itself does from here on */
  const fire = (bag, type, e) => { (listeners[bag][type] || []).forEach(f => f(e)); return e; };
  return {
    ctx, H, T, D: ctx.LivonHelpData, doc, els, net, writes,
    html: () => els['[data-lv-hp-root]'].innerHTML, status: () => els['[data-lv-hp-status]'].textContent,
    go(h) { ctx.location.hash = '#' + h; fire('win', 'hashchange', {}); return els['[data-lv-hp-root]'].innerHTML; },
    submit(q) {
      const input = mk(); input.value = q;
      const form = { matches: s => s === '[data-lv-hp-search]', querySelector: () => input };
      const e = fire('doc', 'submit', { target: form, prevented: false, preventDefault() { this.prevented = true; } });
      fire('win', 'hashchange', {});
      return e;
    },
    click(attr, attrs) {
      const t = mk(); Object.entries(attrs || {}).forEach(([k, v]) => t.setAttribute(k, v));
      t.closest = s => (s === '[' + attr + ']' ? t : null);
      fire('doc', 'click', { target: t });
      return t;
    },
    key(k, target) { return fire('doc', 'keydown', { key: k, target, prevented: false, preventDefault() { this.prevented = true; } }); }
  };
}
const A = hp();
const D = A.D, byId = Object.fromEntries(D.articles.map(a => [a.id, a]));
const allText = a => [a.title, a.short].concat(a.body || [], a.steps || [], a.note || '', a.ts ? [a.ts.symptom].concat(a.ts.causes, a.ts.fixes) : []).join(' ');
const HELP_TEXT = D.articles.map(allText).join('\n') + '\n' + D.status.map(s => s.label + ' ' + s.text).join('\n') + '\n' + D.categories.map(c => c.label + ' ' + c.desc).join('\n');
const top = (q, n = 3) => J(A.H.search(q).items.slice(0, n).map(x => x.article.id));

/* ───────── Help Center ───────── */
test('HF-1 help route: #help is its own view on top of the existing router, which is left untouched', () => {
  const a = hp({ hash: '#help' });
  assert.equal(a.doc.documentElement.dataset.lvView, 'help');
  assert.match(a.html(), /무엇을 도와드릴까요\?/);
  assert.equal(a.doc.title, '도움말 · LIVON');
  const b = hp({ hash: '#life' });
  assert.equal(b.doc.documentElement.dataset.lvView, 'home', 'another screen is not taken over');
  assert.equal((b.els['[data-lv-hp-root]'] || {}).innerHTML || '', '', 'nothing is rendered until Help is opened');
  b.go('help/status');
  assert.equal(b.doc.documentElement.dataset.lvView, 'help');
  b.ctx.location.hash = '#today'; b.H.route();
  assert.equal(b.doc.title, 'LivOn', 'the tab title is restored when leaving Help');
  assert.match(INDEX, /<section class="lv-hp" id="help" data-lv-screen="help" aria-label="도움말">\s*<p class="visually-hidden" role="status" aria-live="polite" data-lv-hp-status><\/p>\s*<div class="lv-hp-inner" data-lv-hp-root><\/div>/);
  assert.doesNotMatch(INDEX.match(/function livonView\(hash\) \{[\s\S]*?\n        \}/)[0], /help/, 'the inline router (pinned by CSP hashes) is unchanged');
  assert.match(CSS, /html\[data-lv-view="help"\] main > #help \{\s*display: block !important;/);
  const order = ['community-page.js', 'help-data.js', 'help-page.js'].map(f => INDEX.indexOf('/livon/' + f + '?'));
  assert.ok(order.every(i => i > 0) && order[0] < order[1] && order[1] < order[2], 'data before page: ' + order);
});

test('HF-2 help home: title, short description, search, categories, popular help, troubleshooting, service status', () => {
  const h = A.T.viewHome(), t = text(h);
  assert.match(h, /<h1 class="lv-hp-title" id="lv-hp-h" tabindex="-1">무엇을 도와드릴까요\?<\/h1>/);
  assert.match(t, /지금 실제로 되는 기능만 설명해요/);
  assert.match(h, /<form class="lv-hp-search lv-hp-search--lg" role="search" aria-label="도움말 검색" data-lv-hp-search>/);
  for (const h2 of ['주제별로 찾기', '자주 찾는 도움말', '문제 해결', '서비스 상태']) assert.ok(h.includes('>' + h2 + '</h2>'), h2);
  assert.equal((h.match(/href="#help\/c\//g) || []).length, D.categories.length + 1);
  assert.match(h, /href="#help\/status">서비스 상태 전체 보기/);
  assert.equal((h.match(/<h1/g) || []).length, 1);
});

test('HF-3 categories: ten areas, every article belongs to one, none is empty', () => {
  assert.deepEqual(J(D.categories.map(c => c.label)), ['시작하기', '저장·데이터', '맞춤 설정', '라이프 스테이지', '오늘의 발견', '내 생활', '탐색·검색', '커뮤니티', 'LIVON AI', '문제 해결']);
  for (const c of D.categories) {
    const n = D.articles.filter(a => a.cat === c.id).length;
    assert.ok(n >= 2, c.id + ' has ' + n);
    assert.ok(A.T.viewHome().includes('<small>도움말 ' + n + '개</small>'), c.label + ' count shown');
  }
  assert.ok(D.articles.every(a => D.categories.some(c => c.id === a.cat)));
});

test('HF-4 FAQ: a category lists its questions as an accordion with a short answer and a link to the full article', () => {
  const h = A.go('help/c/community'), list = D.articles.filter(a => a.cat === 'community');
  assert.match(h, /<h1 class="lv-hp-title lv-hp-title--md" id="lv-hp-h" tabindex="-1">커뮤니티<\/h1>/);
  assert.equal((h.match(/data-lv-hp-toggle/g) || []).length, list.length);
  for (const a of list) assert.ok(h.includes('href="#help/a/' + a.id + '">자세히 보기'), a.id);
  assert.ok(list.some(a => allText(a).length > 250), 'long answers live in the article, not in the accordion');
  assert.equal(A.doc.title, '커뮤니티 · 도움말 · LIVON');
});

test('HF-5 article: one structure — title, short answer, explanation, steps, note, feature link, related help', () => {
  const h = A.go('help/a/onboarding-restart'), t = text(h);
  assert.match(h, /<article class="lv-hp-article" aria-labelledby="lv-hp-h"><h1 class="lv-hp-title lv-hp-title--md" id="lv-hp-h" tabindex="-1">맞춤 설정을 처음부터 다시 하려면\?<\/h1><p class="lv-hp-answer">/);
  assert.match(h, /<h2>이렇게 해 보세요<\/h2><ol><li>/);
  assert.match(h, /<p class="lv-hp-callout"><strong>알아 두세요<\/strong>/);
  assert.match(h, /<a class="lv-hp-btn lv-hp-btn--dark" href="#ml-settings">내 생활 › 설정 열기<\/a>/);
  assert.match(t, /관련 도움말/);
  // a short question stays short
  const short = byId['community-reaction-count'];
  assert.ok(!short.steps && !short.note && short.body.length === 1);
  for (const a of D.articles) {
    assert.ok(a.title && a.short && a.short.length <= 140, a.id + ' short answer');
    assert.ok(Array.isArray(a.feature) && /^#[\w\-/?=&]+$/.test(a.feature[1]), a.id + ' feature link');
    assert.ok(['CODE_VERIFIED', 'DOC_VERIFIED', 'PRODUCT_POLICY'].includes(a.v), a.id + ' verification');
    assert.ok((a.kw || []).length >= 3, a.id + ' keywords');
  }
  assert.doesNotMatch(D.articles.map(a => A.T.viewArticle(a.id)).join(''), /CODE_VERIFIED|DOC_VERIFIED|PRODUCT_POLICY|HF-\d/, 'internal labels are never shown');
});

test('HF-6 stable ids: readable, unique, not numbers — and the source inventory HF-1 … HF-28 is fully covered', () => {
  const ids = D.articles.map(a => a.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(id => /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(id) && !/\d{2,}/.test(id)), ids.filter(id => !/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(id)).join());
  for (const id of ['local-data-storage', 'community-following', 'personalization-reset', 'storage-blocked', 'ai-status', 'no-signup']) assert.ok(byId[id], id);
  const hf = D.articles.filter(a => a.hf).map(a => a.hf).sort((x, y) => x.slice(3) - y.slice(3));
  assert.deepEqual(J(hf), Array.from({ length: 28 }, (_, i) => 'HF-' + (i + 1)));
  const inv = fs.readFileSync(path.join(ROOT, 'docs/livon/LIVON_COMMUNITY_UX.md'), 'utf8');
  assert.equal([...inv.matchAll(/^\| (HF-\d+) \|/gm)].length, 28);
  assert.ok(D.articles.length >= 60, 'the inventory was extended for the whole of LIVON: ' + D.articles.length);
});

test('HF-7 deep links: every article, category, search and status page opens from its URL', () => {
  for (const a of D.articles) {
    const b = A.go('help/a/' + a.id);
    assert.ok(b.includes('id="lv-hp-h" tabindex="-1">' + A.T.fill(a.title).replace(/&/g, '&amp;').replace(/"/g, '&quot;')), a.id);
  }
  for (const c of D.categories) assert.equal(A.T.parse('help/c/' + c.id).view, 'category');
  assert.deepEqual(J(A.T.parse('help/search?q=' + encodeURIComponent('다른 기기'))), { view: 'search', q: '다른 기기' });
  assert.equal(A.T.parse('#help/status').view, 'status');
  assert.deepEqual(J(A.T.parse('help/troubleshooting')), { view: 'category', id: 'troubleshooting' });
  const direct = hp({ hash: '#help/a/community-report' });
  assert.match(direct.html(), /신고하면 운영자에게 전달되나요\?/);
});

test('HF-8 not found: a wrong id or path gets a friendly page with search and categories', () => {
  for (const h of ['help/a/nope', 'help/a/', 'help/c/nope', 'help/x', 'help/a/no-signup/extra', 'help/a/<script>', 'help/a/__proto__', 'help/c/constructor']) {
    const r = A.T.parse(h);
    assert.equal(r.view, 'notfound', h);
    const html = A.go(h);
    assert.match(text(html), /도움말을 찾을 수 없어요 주소가 바뀌었거나 없는 도움말이에요\. 검색하거나 주제별로 찾아보세요\./);
    assert.match(html, /data-lv-hp-search/);
    assert.doesNotMatch(html, /<script>/);
  }
  assert.equal(A.status(), '도움말을 찾을 수 없어요.');
});

const QUERIES = [
  ['회원가입', 'no-signup'], ['로그인', 'account-status'], ['계정', 'account-status'], ['저장', 'local-data-storage'], ['기기', 'other-device'], ['브라우저', 'clear-browser-data'],
  ['삭제', 'personalization-reset'], ['초기화', 'personalization-reset'], ['나이', 'what-is-life-stage'], ['연령', 'what-is-life-stage'], ['관심사', 'why-ask-profile'], ['추천', 'how-recommendation-works'],
  ['개인화', 'personalization-storage'], ['Life Event', 'what-is-life-event'], ['라이프 이벤트', 'what-is-life-event'], ['AI', 'ai-status'], ['인공지능', 'ai-status'], ['글쓰기', 'community-post-types'],
  ['게시글', 'community-post-storage'], ['댓글', 'community-comments'], ['답글', 'community-comments'], ['공감', 'community-reaction-count'], ['저장한 글', 'save-items'], ['신고', 'community-report'],
  ['팔로우', 'community-following'], ['팔로잉', 'community-following'], ['다른 사람', 'community-no-other-posts'], ['링크', 'community-share-link'], ['검색', 'explore-search'], ['정책', 'explore-search'],
  ['서비스', 'what-is-livon'], ['공식', 'official-badge'], ['내 생활', 'what-is-my-life'], ['할 일', 'what-is-my-life'], ['목표', 'what-is-my-life'], ['기록', 'clear-browser-data'],
  ['온보딩', 'onboarding-restart'], ['다시 설정', 'onboarding-restart'], ['추천 이유', 'recommendation-reason'], ['70대', 'other-life-stages'], ['육아', 'other-life-stages'], ['저장이 안 돼요', 'ts-cannot-save'],
  ['글이 사라졌어요', 'ts-data-disappeared'], ['다른 기기', 'other-device'], ['AI 안됨', 'ts-ai-not-working'], ['검색 안됨', 'ts-search-no-result'],
  ['NEWON+', 'account-status'], ['시크릿', 'storage-blocked'], ['백업', 'move-device'], ['문의', 'contact-support'], ['닉네임', 'community-display-name'], ['임시 저장', 'community-draft-vs-autosave'],
  ['자동 보관', 'community-autosave'], ['For You', 'community-for-you'], ['쿠키', 'clear-browser-data'], ['동기화', 'other-device'], ['실명', 'community-display-name'], ['공공 데이터', 'live-data'],
  ['프리랜서', 'life-event-no-guide'], ['체크리스트', 'life-stage-topics'], ['주제 228', 'what-is-life-stage'], ['왜 다른 기기에서 안 보이나요?', 'other-device']
];
test('HF-9 search: ' + QUERIES.length + ' queries — no zero result, the expected article is in the top three', () => {
  assert.ok(QUERIES.length >= 50);
  let zero = 0, first = 0;
  for (const [q, want] of QUERIES) {
    const got = top(q);
    if (!got.length) zero++;
    assert.ok(got.includes(want), JSON.stringify(q) + ' → ' + got.join(', ') + ' (wanted ' + want + ')');
    if (got[0] === want) first++;
  }
  assert.equal(zero, 0);
  assert.ok(first / QUERIES.length >= 0.6, 'expected article ranked first for ' + first + ' of ' + QUERIES.length);
  const r = A.H.search('저장');
  for (let i = 1; i < r.items.length; i++) assert.ok(r.items[i - 1].score >= r.items[i].score, 'best match first');
  assert.equal(JSON.stringify(top('저장', 20)), JSON.stringify(top('저장', 20)), 'deterministic');
});

test('HF-10 Korean search: particles, endings, question words and whole sentences are understood', () => {
  assert.equal(top('저장이 안 돼요')[0], 'ts-cannot-save');
  assert.equal(top('글이 사라졌어요')[0], 'ts-data-disappeared');
  assert.ok(top('신고는 어떻게 되나요').includes('community-report'));
  assert.ok(top('팔로잉을 왜').includes('community-following'));
  assert.ok(top('맞춤 설정은 어디에 저장되나요').includes('personalization-storage'));
  assert.equal(A.T.norm('카페'.normalize('NFD')), '카페', 'decomposed Hangul is normalized');
  assert.deepEqual(J(A.T.tokensOf('왜 다른 기기에서 안 보이나요?')), { topic: ['다른', '기기에서', '보이나요'], trouble: true });
});

test('HF-11 partial, spacing and case: fragments, extra spaces and upper / lower case all match', () => {
  assert.ok(top('팔로').includes('community-following'), 'partial word');
  assert.ok(top('초기').includes('personalization-reset'));
  assert.deepEqual(top('  저장   위치 '), top('저장 위치'), 'whitespace normalized');
  assert.ok(top('임시저장').includes('community-draft-vs-autosave'), 'spacing inside a word is ignored');
  assert.deepEqual(top('LOGIN'), top('login'));
  assert.deepEqual(top('ai'), top('AI'));
  assert.deepEqual(top('for you'), top('For You'));
  assert.ok(top('newon+').includes('account-status'));
});

test('HF-12 synonyms: other words for the same thing find the same help', () => {
  const pairs = [['계정', 'account-status'], ['아이디', 'account-status'], ['인공지능', 'ai-status'], ['챗봇', 'ai-status'], ['report', 'community-report'], ['follow', 'community-following'], ['구독', 'community-following'],
    ['리셋', 'personalization-reset'], ['지우기', 'personalization-reset'], ['연령대', 'what-is-life-stage'], ['세대', 'what-is-life-stage'], ['맞춤', 'personalization-storage'], ['찾기', 'explore-search'],
    ['핸드폰', 'other-device'], ['좋아요', 'community-reaction-count'], ['코멘트', 'community-comments'], ['고객센터', 'contact-support'], ['초안', 'community-draft-vs-autosave'], ['에러', 'ts-ai-not-working'], ['투두', 'what-is-my-life']];
  for (const [q, want] of pairs) assert.ok(top(q, 6).includes(want), q + ' → ' + top(q, 6).join(', '));
  assert.ok(D.synonyms.length >= 20);
  // every synonym leads somewhere: no dead word in the list
  for (const g of D.synonyms) assert.ok(g.some(w => A.H.search(w).items.length), 'synonym group without content: ' + g.join('/'));
  for (const [a, b] of [['계정', '로그인'], ['삭제', '초기화'], ['추천', '맞춤'], ['나이', '연령대'], ['신고', 'report'], ['찾기', '검색']]) assert.ok(D.synonyms.some(g => g.includes(a) && g.includes(b)), a + ' = ' + b);
});

test('HF-13 zero results: what to check, other words, categories — no invented article and no fake "contact us"', () => {
  assert.equal(A.H.search('!!! ??').query, '', 'punctuation only is an empty query, not an error');
  for (const q of ['zzzz', '블록체인', 'ㅋㅋㅋㅋ', 'asdf qwer']) {
    const r = A.H.search(q);
    assert.equal(r.items.length, 0, q);
    const h = A.T.viewSearch(q), t = text(h);
    assert.match(t, /맞는 도움말을 찾지 못했어요 검색어를 한두 단어로 줄여 보세요/);
    assert.match(t, /주제별로 둘러보기 시작하기 저장·데이터 맞춤 설정/);
    assert.doesNotMatch(h, /data-lv-hp-result/);
    assert.doesNotMatch(t, /문의 보내기|문의하기|1:1 문의|메일 보내기/);
    assert.match(t, /문의를 보내는 기능은 아직 연결되지 않았어요/);
  }
  assert.equal(text(A.T.viewSearch('')).includes('찾고 싶은 내용을 한두 단어로 입력해 주세요'), true, 'an empty query is not an error');
  assert.doesNotMatch(A.T.viewSearch('<img src=x onerror=1>'), /<img/, 'the query is shown as text');
  assert.equal(A.H.search('x'.repeat(500)).query.length, 80);
});

test('HF-14 related help: two to four related articles, all real, none pointing to itself', () => {
  for (const a of D.articles) {
    assert.ok(a.related.length >= 2 && a.related.length <= 4, a.id + ' has ' + a.related.length);
    assert.equal(new Set(a.related).size, a.related.length, a.id);
    for (const r of a.related) { assert.ok(byId[r], a.id + ' → ' + r); assert.notEqual(r, a.id); }
  }
  assert.deepEqual(J(byId['ts-other-device'].related), ['other-device', 'move-device', 'account-status']);
  assert.deepEqual(J(byId['other-device'].related), ['local-data-storage', 'move-device', 'account-status']);
  const h = A.T.viewArticle('other-device');
  assert.match(h, /<h2 id="lv-hp-rel">관련 도움말<\/h2><ul class="lv-hp-list"><li><a href="#help\/a\/local-data-storage"/);
});

test('HF-15 contextual help: eight entries where confusion is likely, each wired to its screen', () => {
  const where = { 'onboarding': ['livon-onboarding.js', /help\("personalization-storage", "맞춤 설정은 어디에 저장되나요\?"\)/], 'onboarding-storage-blocked': ['livon-onboarding.js', /help\("storage-blocked", "저장이 막혀 있다는 뜻은\?"\)/],
    'my-life-settings': ['life-now-page.js', /LivonHelp\.link\("personalization-reset", "초기화하면 무엇이 지워지나요\?"\)/], 'community-following': ['community-page.js', /helpLink\("community-following", "팔로잉이 왜 비어 있나요\?"\)/],
    'community-report': ['community-page.js', /helpLink\("community-report", "신고가 운영자에게 전달되나요\?"\)/], 'community-reset': ['community-page.js', /helpLink\("community-reset", "자세히"\)/],
    'ai-status': ['ai-page.js', /LivonHelp\.link\("ai-status", "LIVON AI는 지금 사용할 수 있나요\?"\)/], 'save-confirm': ['life-hub.js', /href="#help\/a\/local-data-storage" data-lv-help-link="local-data-storage" data-lh-modal-close>내 정보는 어디에 저장되나요\?/] };
  assert.deepEqual(J(D.contextual.map(c => c.screen)).sort(), Object.keys(where).sort());
  for (const c of D.contextual) { assert.ok(byId[c.article], c.screen); assert.match(read(where[c.screen][0]), where[c.screen][1], c.screen); }
  assert.equal(A.H.link('community-report', '신고가 운영자에게 전달되나요?'), '<a class="lv-help-link" href="#help/a/community-report" data-lv-help-link="community-report">신고가 운영자에게 전달되나요?</a>');
  assert.equal(A.H.link('nope'), '', 'an unknown article gives no link');
  // dialogs let the link through and close themselves
  assert.match(read('livon-onboarding.js'), /if \(c\("\[data-lv-help-link\]"\)\) \{ persist\(\); hide\(\); return; \}/);
  assert.match(read('community-page.js'), /if \(e\.target\.closest\("\[data-lv-help-link\]"\)\) \{ if \(dialog\) closeDialog\(false\); return; \}/);
  // not a "?" on every card: the total number of entry points stays small
  const total = ['livon-onboarding.js', 'life-now-page.js', 'community-page.js', 'ai-page.js', 'life-hub.js'].reduce((n, f) => n + (read(f).match(/help\("|helpLink\("[a-z]|LivonHelp\.link\("|data-lv-help-link="/g) || []).length, 0);
  assert.ok(total >= 8 && total <= 12, 'entry points: ' + total);
  assert.match(INDEX, /<a role="menuitem" href="#help">도움말<\/a>/);
  assert.match(INDEX, /<a class="gnav-mobile__sublink" href="#help">도움말<\/a>/);
  assert.doesNotMatch(INDEX.slice(INDEX.indexOf('class="gnav__nav"'), INDEX.indexOf('class="gnav__util"')), /#help/, 'Help is not an eighth top-level service');
});

/* ───────── help areas ───────── */
const has = (id, re) => assert.match(allText(byId[id]).replace(/\{(\w+)\}/g, (m, k) => D.facts[k]), re, id);
test('HF-16 local data guide: what is kept here, what is not on a server, clearing data, blocked storage, moving, future account', () => {
  has('local-data-storage', /이 브라우저 안에 저장돼요\. LIVON 서버에는 저장되지 않아요/);
  has('what-is-stored', /서버에 저장되지 않는 것: 위의 모든 내용/);
  has('clear-browser-data', /사이트 데이터.*지우면.*함께 지워져요.*되돌릴 수 없어요/);
  has('storage-blocked', /창을 닫으면 사라져요/);
  has('move-device', /아직 옮길 수 없어요/);
  has('future-account', /정해진 일정은 없어요.*동의 없이 서버로 올라가지 않아요/);
  const all = D.articles.filter(a => a.cat === 'data').map(allText).join(' ');
  assert.ok((all.match(/localStorage/g) || []).length === 0, 'no developer term in the guide');
});

test('HF-17 personalization help: why it asks, where it is kept, how it decides, no AI, reasons, other bands, change, reset', () => {
  for (const id of ['why-ask-profile', 'personalization-storage', 'how-recommendation-works', 'recommendation-ai', 'recommendation-reason', 'other-life-stages', 'change-preferences', 'personalization-reset', 'what-is-life-event', 'life-event-no-guide']) assert.equal(byId[id].cat, 'personalization', id);
  has('how-recommendation-works', /Life Event와 맞는 정보가 가장 앞에 오고, 다음이 연령대, 다음이 관심 분야/);
  has('recommendation-ai', /아니요\. 추천은 정해진 규칙으로 이 기기 안에서 계산해요/);
  has('recommendation-reason', /‘선택한 ‘○○’ 관련’.*‘20대 주제’.*‘관심사 ‘○○’’/);
  has('life-event-no-guide', /프리랜서, 차량 구매, 해외생활, 장기여행/);
  assert.doesNotMatch(allText(byId['life-event-no-guide']), /content gap|gaps|콘텐츠 갭/i, 'no internal wording');
});

test('HF-18 onboarding help: later, restart, resume, change, reset — and skipping limits nothing', () => {
  has('onboarding-skip', /건너뛰어도 막히는 기능은 없고, 안내도 다시 뜨지 않아요/);
  has('onboarding-resume', /‘이어서 하기’로 계속할 수 있어요/);
  has('onboarding-restart', /‘맞춤 설정 다시 하기’/);
  has('change-preferences', /‘변경’/);
  for (const label of ['나중에 할게요', '먼저 둘러보기', '이어서 하기', '그만두기', '이대로 시작하기', '바꾸지 않고 닫기']) {
    assert.ok(HELP_TEXT.includes(label), 'Help mentions ' + label);
    assert.ok(read('livon-onboarding.js').includes(label), 'the UI really says ' + label);
  }
  for (const label of ['맞춤 설정 다시 하기', '맞춤 설정 초기화']) assert.ok(HELP_TEXT.includes(label) && read('life-now-page.js').includes(label), label);
});

test('HF-19 Life Stage help: seven bands, the topic count, other bands stay open, Life Events', () => {
  has('what-is-life-stage', /10대부터 70대 이상까지 7개 연령대/);
  has('what-is-life-stage', /전체 주제는 228개예요/);
  has('other-life-stages', /다른 연령대의 주제를 숨기지 않아요/);
  has('what-is-life-event', /모두 34가지/);
  has('life-stage-topics', /체크리스트/);
});

test('HF-20 Today help: what it is, what personalization changes, and that LIVON does not guess region, price or date', () => {
  has('what-is-today', /지역, 가격, 날짜를 LIVON이 짐작해서 채우지 않아요/);
  has('today-personalization', /모든 항목이 개인화되는 것은 아니에요/);
  assert.match(read('today-feed.js'), /PZ\.eventBoost/);
});

test('HF-21 My Life help: saves, to-dos, goals, records — and which reset clears what', () => {
  has('what-is-my-life', /일정·할 일·목표·기록/);
  has('my-life-reset-scope', /맞춤 설정 초기화: 연령대·관심 분야·Life Event만 지워요/);
  has('my-life-reset-scope', /커뮤니티 기록 지우기: 커뮤니티 글·댓글·공감·신고 기록·표시 이름을 지워요/);
  has('save-items', /‘이 기기에 저장됩니다’/);
  assert.match(read('life-hub.js'), /이 기기에 저장됩니다/);
  // Help may only describe a My Life action whose button actually exists
  const ml = read('life-now-page.js'), rendered = attr => new RegExp("['\"][^'\"\\n]*<button[^>]*" + attr).test(ml) || INDEX.includes(attr);
  if (!rendered('data-lv-ml-export')) assert.doesNotMatch(HELP_TEXT, /내보내기’|내려받|파일로 받/, 'there is no export button, so Help must not promise one');
  if (!rendered('data-lv-ml-clear')) assert.doesNotMatch(HELP_TEXT, /내 생활 데이터 전체 삭제/, 'there is no clear-all button');
});

test('HF-22 Explore help: what is searched, what "공식 출처" means, the two searches, real-time data', () => {
  has('explore-search', /라이프 스테이지 주제, 오늘의 발견, 서비스, 정책·지원과 공식 기관, 교육, 장소/);
  has('official-badge', /정부·공공기관 같은 공식 기관의 사이트/);
  has('official-badge', /보증하거나 신청을 대신해 준다는 뜻은 아니에요/);
  has('search-difference', /커뮤니티 검색은 이 기기에 있는 커뮤니티 글에서만/);
  assert.match(read('explore-page.js'), /공식 출처/);
});

test('HF-23 Community help: all 28 inventory topics, the six post types, comments, search and privacy', () => {
  assert.ok(D.articles.filter(a => a.cat === 'community').length >= 18);
  has('community-post-types', /질문, 경험 공유, 생활 정보, 후기, 생활 팁, 일상 이야기 6가지/);
  has('community-comments', /답글을 한 단계까지/);
  has('community-guidelines', /실명, 전화번호, 이메일, 주소/);
  has('community-related-info', /글의 내용을 읽고 짐작해서 붙이지 않아요/);
  has('community-for-you', /AI는 쓰지 않아요/);
  assert.doesNotMatch(allText(byId['community-guidelines']), /처벌|법적 책임|고소|신상/, 'no scare wording');
});

test('HF-24 report accuracy: Help says a report stays in this browser, and never that someone reviews it', () => {
  has('community-report', /아니요\. 지금 신고는 이 브라우저에만 기록돼요\. 운영자나 서버로 전송되지 않아요/);
  has('ts-report-not-sent', /전송되는 기능이 아니라 이 브라우저에 기록만 하는 기능/);
  assert.doesNotMatch(HELP_TEXT, /운영팀이|운영자가 검토|검토 후 조치|신고가 접수|즉시 확인|처리 결과를 알려/);
  assert.equal(D.facts.reports, 'LOCAL_ONLY');
});

test('HF-25 follow accuracy: Help never says following works', () => {
  has('community-following', /팔로우는 계정이 있어야 하는 기능인데, 지금은 계정이 없어서 쓸 수 없어요/);
  assert.doesNotMatch(HELP_TEXT, /팔로우할 수 있(어요|습니다)|팔로우하면|팔로우해 보세요|팔로워가 늘/);
  assert.equal(D.facts.follow, 'ACCOUNT_REQUIRED');
  assert.equal(D.status.find(s => s.id === 'follow').state, 'off');
});

test('HF-26 AI accuracy: Help says LIVON AI is not connected, what it would send, and that nothing is saved without approval', () => {
  has('ai-status', /아직 답변을 받을 수 없어요.*지금은 연결되어 있지 않아요/);
  has('ai-what-it-uses', /자동으로 붙여 보내지 않아요/);
  has('ai-save-to-my-life', /승인해야만 내 생활에 들어가요/);
  has('ai-personalization', /AI로 자동 전송되지 않아요/);
  assert.doesNotMatch(HELP_TEXT, /AI가 알아서|AI가 자동으로 (저장|추천)|AI에게 물어보면 바로/);
  assert.equal(D.status.find(s => s.id === 'ai').state, 'off');
  const ai = read('ai-page.js');
  assert.match(ai, /Nothing from My Life \/ Community is attached automatically/);
  assert.match(ai, /if \(context\.personalize\) \["stage", "interests", "region", "goal"\]/, 'only the AI page’s own settings are sent');
  assert.doesNotMatch(code(ai), /LivonPersonalization|aiContext\(/, 'the onboarding profile is not read by the AI page');
  for (const label of ['연결 확인 불가', '연결 미완료']) assert.ok(HELP_TEXT.includes(label) && ai.includes(label), label);
  for (const label of ['개인화 설정', '개인화 사용']) assert.ok(HELP_TEXT.includes(label) && INDEX.includes(label), label);
});

test('HF-27 troubleshooting: eleven problems, each with symptom, possible reasons and what to do', () => {
  const ts = D.articles.filter(a => a.cat === 'troubleshooting');
  assert.deepEqual(J(ts.map(a => a.title)), ['저장이 안 돼요', '저장한 내용이 사라졌어요', '다른 기기에서 내용이 안 보여요', '추천이 나와 맞지 않아요', '처음 설정 안내가 다시 안 떠요', '커뮤니티 글이 안 보여요', '보낸 커뮤니티 링크가 안 열려요', '팔로잉이 비어 있어요', '신고가 전송되지 않아요', 'AI가 동작하지 않아요', '검색 결과가 없어요']);
  for (const a of ts) {
    assert.ok(a.ts && a.ts.symptom && a.ts.causes.length >= 1 && a.ts.fixes.length >= 2, a.id);
    const h = A.T.viewArticle(a.id);
    assert.match(h, /<h2>증상<\/h2><p>[^<]+<\/p><\/section><section class="lv-hp-block"><h2>가능한 이유<\/h2><ul><li>[\s\S]*<h2>해결 방법<\/h2><ol><li>/, a.id);
  }
  assert.ok(D.articles.filter(a => a.cat !== 'troubleshooting').every(a => !a.ts));
});

test('HF-28 service status: plain Korean states tied to facts — nothing shown as available that is not', () => {
  const h = A.go('help/status'), t = text(h);
  assert.deepEqual(J(D.statusLabel), { available: '사용 가능', local: '이 기기에서만', off: '아직 연결 안 됨' });
  const want = { core: 'available', personalization: 'local', storage: 'local', community: 'local', follow: 'off', reports: 'local', ai: 'off', 'live-data': 'off', account: 'off', support: 'off' };
  assert.deepEqual(Object.fromEntries(D.status.map(s => [s.id, s.state])), want);
  for (const s of D.status) { assert.ok(byId[s.article], s.id); assert.ok(s.fact in D.facts, s.id + ' fact'); assert.ok(t.includes(s.label), s.label); }
  const OFF = ['NOT_CONNECTED', 'ACCOUNT_REQUIRED'], LOCAL = ['LOCAL', 'LOCAL_ONLY', 'LOCAL_RULE_BASED'];
  for (const s of D.status) {
    const f = D.facts[s.fact];
    if (s.state === 'off') assert.ok(OFF.includes(f), s.id + ' is off but fact is ' + f);
    if (OFF.includes(f)) assert.equal(s.state, s.id === 'storage' ? 'local' : 'off', s.id + ' must not look available');
    if (s.state === 'local' && s.id !== 'storage') assert.ok(LOCAL.includes(f), s.id + ' fact ' + f);
  }
  assert.doesNotMatch(t, /READY|CODE READY|NOT_CONNECTED|LOCAL_ONLY|ACCOUNT_REQUIRED|BACKEND/, 'no technical state words');
  assert.match(t, /실시간 점검 결과가 아니라 현재 구성 안내예요/);
});

/* ───────── offline · privacy ───────── */
test('HF-29 offline: Help is bundled data — it renders and searches with no network', () => {
  const a = hp({ hash: '#help' });
  for (const h of ['help', 'help/c/data', 'help/a/local-data-storage', 'help/search?q=' + encodeURIComponent('저장'), 'help/status', 'help/a/nope']) a.go(h);
  assert.deepEqual(a.net, []);
  assert.doesNotMatch(code(PAGE) + code(DATA_SRC), /fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|import\(|\.json["']|https?:\/\//);
  assert.match(DATA_SRC, /^\(function \(root\) \{/m, 'content ships as a script, not as a request');
});

test('HF-30 privacy: Help stores nothing, asks nothing personal, and has no inquiry form', () => {
  const a = hp({ hash: '#help' });
  const before = a.writes.length;
  a.submit('내 전화번호 010-1234-5678'); a.go('help/a/no-signup'); a.go('help/search?q=' + encodeURIComponent('신고'));
  assert.equal(a.writes.length, before, 'no query, history or state is written to storage');
  assert.doesNotMatch(code(PAGE), /localStorage|sessionStorage|document\.cookie|LivonUserData/);
  assert.doesNotMatch(PAGE, /<textarea|type="email"|type="tel"|name="(email|phone|name|message)"/);
  assert.doesNotMatch(text(D.articles.map(x => a.T.viewArticle(x.id)).join(' ') + a.T.viewHome()), /문의 보내기|문의하기 버튼|접수되었습니다/);
  assert.equal(D.facts.support, 'NOT_CONNECTED');
  assert.match(allText(byId['contact-support']), /지금은 LIVON 안에서 문의를 보내는 기능이 없어요/);
});

test('HF-31 no external search request: a search is a hash change inside the page, never a request', () => {
  const a = hp({ hash: '#help' });
  const e = a.submit('  다른   기기 ');
  assert.equal(e.prevented, true, 'the form is not submitted to a server');
  assert.equal(a.ctx.location.hash, '#help/search?q=' + encodeURIComponent('다른 기기'));
  assert.match(text(a.html()), /‘다른 기기’ 검색 결과 \d+개/);
  assert.match(a.status(), /^‘다른 기기’ 검색 결과 \d+개$/);
  assert.deepEqual(a.net, []);
  assert.doesNotMatch(PAGE, /<form[^>]*(action|method)=/);
  assert.doesNotMatch(code(PAGE), /gtag|dataLayer|analytics|track\(/i);
});

/* ───────── accessibility · keyboard · layout ───────── */
test('HF-32 accordion accessibility: a button in a heading, aria-expanded, aria-controls, a labelled region', () => {
  const h = A.go('help/c/data'), first = D.articles.find(a => a.cat === 'data');
  assert.match(h, new RegExp('<h2 class="lv-hp-faq__q"><button type="button" id="lv-hp-b-' + first.id + '" aria-expanded="true" aria-controls="lv-hp-p-' + first.id + '" data-lv-hp-toggle>'));
  assert.match(h, new RegExp('<div class="lv-hp-faq__a" id="lv-hp-p-' + first.id + '" role="region" aria-labelledby="lv-hp-b-' + first.id + '">'));
  assert.equal((h.match(/aria-expanded="false"/g) || []).length, D.articles.filter(a => a.cat === 'data').length - 1, 'the others start closed');
  assert.equal((h.match(/role="region" aria-labelledby="lv-hp-b-[\w-]+" hidden>/g) || []).length, D.articles.filter(a => a.cat === 'data').length - 1);
  const panel = A.doc.getElementById('lv-hp-p-x');
  const btn = A.click('data-lv-hp-toggle', { 'aria-expanded': 'false', 'aria-controls': 'lv-hp-p-x' });
  assert.equal(btn.getAttribute('aria-expanded'), 'true'); assert.equal(panel.hidden, false);
  const again = A.click('data-lv-hp-toggle', { 'aria-expanded': 'true', 'aria-controls': 'lv-hp-p-x' });
  assert.equal(again.getAttribute('aria-expanded'), 'false'); assert.equal(panel.hidden, true);
});

test('HF-33 keyboard: Enter searches, Escape clears then leaves, arrows move through results, focus lands on the heading', () => {
  const a = hp({ hash: '#help' });
  a.go('help/a/no-signup');
  assert.equal(a.els['#lv-hp-h'].focused, 1, 'navigating inside the page moves focus to the heading; the initial page load does not steal focus');
  a.ctx.location.hash = '#help/search?q=x'; a.H.route();
  const inHelp = { closest: s => (s === '#help' ? {} : null), matches: s => s === '[data-lv-hp-q]', value: '저장' };
  a.doc.documentElement.dataset.lvView = 'help';
  let e = a.key('Escape', inHelp);
  assert.equal(inHelp.value, '', 'first Escape clears the box'); assert.equal(e.prevented, true);
  e = a.key('Escape', inHelp);
  assert.equal(a.ctx.location.hash, '#help', 'second Escape goes back to Help Home');
  assert.match(PAGE, /if \(input && e\.key === "ArrowDown"\) \{ e\.preventDefault\(\); links\[0\]\.focus\(\); \}/);
  assert.match(PAGE, /if \(next < 0\) \{ var box = \$\("#help \[data-lv-hp-q\]"\); if \(box\) box\.focus\(\); \}/);
  assert.match(a.T.viewSearch('저장'), /<a href="#help\/a\/[\w-]+" data-lv-hp-result>/);
  assert.doesNotMatch(PAGE, /role="combobox"|aria-activedescendant/, 'no custom combobox');
  assert.doesNotMatch(PAGE, /<div[^>]*onclick|<span[^>]*data-lv-hp-toggle/, 'only links and buttons are interactive');
  assert.match(INDEX, /<a class="skip-link" href="#livon-home">본문으로 건너뛰기<\/a>/);
});

test('HF-34 responsive: fluid widths, wrapping rows, 44px targets, long words wrap', () => {
  assert.match(CSS, /#help \.lv-hp-inner \{\s*width: min\(880px, calc\(100% - clamp\(1\.25rem, 4vw, 3rem\) \* 2\)\);/);
  assert.match(CSS, /overflow-wrap: anywhere;/);
  assert.match(CSS, /#help \.lv-hp-cats \{[^}]*grid-template-columns: repeat\(auto-fill, minmax\(min\(100%, 15rem\), 1fr\)\);/);
  assert.match(CSS, /#help \.lv-hp-btn \{[^}]*min-height: 44px;/);
  assert.match(CSS, /#help \.lv-hp-faq__q button \{[^}]*min-height: 56px;/);
  assert.match(CSS, /@media \(max-width: 480px\) \{[\s\S]*#help \.lv-hp-search \{ flex-wrap: wrap; \}/);
  assert.doesNotMatch(CSS.replace(/@media \([^)]*\)/g, '').replace(/min\(880px[^;]*;/, ''), /[^-]width:\s*\d{3,}px/, 'no fixed widths');
  assert.match(CSS, /html\[data-lv-view="help"\] body \{[^}]*overflow-x: clip !important;/);
});

test('HF-35 reduced motion: Help adds no animation or transition, and the accordion opens instantly', () => {
  assert.doesNotMatch(CSS, /transition|animation|@keyframes|scroll-behavior/);
  assert.doesNotMatch(code(PAGE), /behavior:\s*"smooth"|requestAnimationFrame|setInterval/);
});

/* ───────── separation ───────── */
function admin({ withHelp }) {
  const ctx = loadLivon();
  const mem = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
  for (const f of ['admin/data/data-manager-core.js', 'community-service.js'].concat(withHelp ? ['help-data.js'] : [], ['admin/admin-store.js', 'admin/admin-service.js'])) vm.runInContext(read(f), ctx, { filename: f });
  const adapter = ctx.LivonAdminStore.createLocalAdapter({ localStorage: mem(), sessionStorage: mem() });
  let t = Date.parse('2026-10-01T00:00:00Z');
  return { ctx, adapter, svc: ctx.LivonAdminService.create({ env: ctx, adapter, now: t, clock: () => (t += 1000), host: '127.0.0.1' }) };
}
test('HF-36 Help / Admin separation: the Admin only inspects Help (counts, verification) — no editor, no CMS', async () => {
  const { svc } = admin({ withHelp: true });
  const sys = Object.fromEntries(svc.system(await svc.adapterInfo()).map(s => [s.key, s]));
  assert.equal(sys['Help Content'].value, 'READY');
  assert.equal(sys['Help Content'].detail, D.articles.length + ' articles · ' + D.categories.length + ' categories · ' + D.contextual.length + ' contextual entries');
  assert.equal(sys['Help Verification'].value, 'VERIFIED');
  assert.match(sys['Help Verification'].detail, /CODE_VERIFIED \d+/);
  assert.equal(sys['Support Backend'].value, 'NOT CONNECTED');
  const without = admin({ withHelp: false });
  assert.ok(!without.svc.system(await without.svc.adapterInfo()).some(s => /Help|Support/.test(s.key)), 'no Help rows when the content is not loaded');
  assert.doesNotMatch(read('admin/admin-app.js') + read('admin/admin-service.js') + read('admin/admin-store.js'), /LivonHelpData\.articles\.(push|splice)|saveHelp|editArticle|help\.v1/);
  assert.doesNotMatch(PAGE + DATA_SRC, /livon\/admin|LivonAdmin/, 'the public Help does not link to or load the Admin');
  assert.match(read('admin/index.html'), /<script src="\/livon\/help-data\.js"><\/script>/);
});

test('HF-37 Data Manager separation: Help is its own content domain, not part of the 530 curated records', () => {
  const ctx = loadLivon();
  vm.runInContext(read('admin/data/data-manager-core.js'), ctx);
  vm.runInContext(read('help-data.js'), ctx);
  const DM = ctx.LivonDataManager, M = DM.createModel(ctx, { now: Date.parse('2026-10-01T00:00:00Z') });
  assert.equal(M.records.length, 530);
  assert.ok(!M.records.some(r => /^help/.test(String(r.id)) || r.type === 'help'));
  assert.ok(!DM.DATA_SCRIPTS.some(s => /help/.test(s)));
  assert.ok(!ctx.LivonScreenData.repository().all().some(e => /^help/.test(String(e.id))));
  assert.doesNotMatch(read('data/livon-data-platform.js') + read('data/livon-screen-data.js') + read('explore-search.js'), /LivonHelpData/, 'Help is not indexed by the Data Platform or Explore search');
});

/* ───────── consistency with the code (outdated-help detection) ───────── */
const full = hp({ full: true });
test('HF-38 account consistency: there is no login, and Help says so', () => {
  assert.equal(full.ctx.LivonUserData.auth().status, 'anonymous');
  assert.equal(full.ctx.LivonUserData.remote().configured, false);
  assert.match(INDEX, /<button type="button" role="menuitem" data-livon-logout hidden>/);
  assert.equal(D.facts.account, 'NOT_CONNECTED');
  assert.equal(D.facts.sync, 'NOT_CONNECTED');
  has('account-status', /아직 쓸 수 없어요\. 지금 LIVON에는 로그인도, NEWON\+ 계정 연결도 없어요/);
  assert.doesNotMatch(HELP_TEXT, /로그인하면|로그인 후|계정에 자동으로|NEWON\+에 연결하면|실시간 동기화|자동으로 동기화/);
});

test('HF-39 storage consistency: what Help calls "this browser" really is device-local in the storage inventory', () => {
  const UD = full.ctx.LivonUserData;
  for (const k of ['livon.personalization.v1', 'livon.aiStore.v1']) assert.equal(UD.classify(k), 'DEVICE_LOCAL', k);
  assert.equal(UD.classify('livon.cmStore.v1'), 'COMMUNITY_LOCAL');
  for (const k of ['livon.lifeStage', 'livon.lifeInterests', 'livon.lifeEvents']) assert.equal(UD.classify(k), 'ACCOUNT_SYNC', k + ' may sync only after an explicit choice');
  assert.equal(full.ctx.LIVON_STORAGE_FALLBACK.length, 0);
  assert.match(read('livon-onboarding.js'), /이 브라우저에서는 저장이 막혀 있어, 창을 닫으면 선택한 내용이 사라질 수 있어요\./);
  has('storage-blocked', /창을 닫으면 사라져요/);
  assert.match(read('life-hub.js'), /KEY_SAVE_ACK, true, sessionStorage/, 'the save notice is per browser session, as Help says');
  has('save-items', /창을 닫을 때까지는 다시 묻지 않고/);
  assert.doesNotMatch(HELP_TEXT, /안전하게 서버에 저장|서버에 백업|클라우드에 저장/);
});

test('HF-40 personalization consistency: local rules, three signals in that order, no AI', () => {
  const PZ = full.ctx.LivonPersonalization;
  assert.equal(PZ.ENGINE, 'LOCAL RULE-BASED');
  assert.equal(D.facts.personalization, 'LOCAL_RULE_BASED');
  const r = PZ.recommend({ lifeStage: '20', interests: ['주거'], lifeEvents: ['first-job'] }, { limit: 50 }).items;
  const w = t => Math.max(...r.filter(x => x.reasons[0].type === t).map(x => x.score), 0);
  console.log('DBG', r.length, JSON.stringify(r.slice(0,2)).slice(0,400));
  assert.ok(r[0].reasons.some(y => y.type === 'event'), 'Life Event first, as Help says');
  assert.equal(PZ.reasonText({ type: 'event', label: '첫 취업' }), '선택한 ‘첫 취업’ 관련');
  assert.equal(PZ.reasonText({ type: 'stage', label: '20대' }), '20대 주제');
  assert.equal(PZ.reasonText({ type: 'interest', label: '주거' }), '관심사 ‘주거’');
  assert.ok(w('event') >= w('interest'));
  assert.doesNotMatch(code(read('livon-personalization.js')), /fetch\(|openai|LivonAI/i);
  assert.equal(PZ.recommend({}).items.length, 0, 'no profile → no recommendation, as Help says');
  assert.equal(D.facts.lifeEvents, full.ctx.LivonLifeEvents.events.length);
  assert.deepEqual(J(PZ.recommend({ lifeStage: '30', lifeEvents: ['freelance', 'car', 'abroad', 'long-trip'] }, { limit: 400 }).gaps.map(g => g.title)), ['프리랜서', '차량 구매', '해외생활', '장기여행'], 'the four events Help names really have no guide');
  assert.ok(!PZ.recommend({ lifeStage: '70', interests: ['가족'] }, { limit: 2000 }).items.some(x => x.id === 'ex:ex-childcare'), 'the 70대 example in Help is true');
});

test('HF-41 Community post type consistency: six types with the labels Help uses', () => {
  const S = full.ctx.LivonCommunityService, labels = full.ctx.LivonCommunityData.typeLabels;
  assert.equal(S.TYPES.length, D.facts.postTypes);
  assert.equal(D.facts.postTypes, 6);
  const named = allText(byId['community-post-types']);
  for (const t of S.TYPES) assert.ok(named.includes(labels[t]), 'Help names ' + labels[t]);
  assert.equal(S.LIMITS.nick, 20); has('community-display-name', /20자 이내/);
  assert.deepEqual(J(S.REPORT_REASONS.map(r => r.label)), ['스팸', '부적절한 콘텐츠', '괴롭힘/비방', '잘못된 정보', '기타']);
  has('community-report-duplicate', /스팸, 부적절한 콘텐츠, 괴롭힘\/비방, 잘못된 정보, 기타 다섯 가지/);
});

test('HF-42 Life Stage count consistency', () => {
  assert.equal(full.ctx.LivonLifeData.stages.length, D.facts.lifeStages);
  assert.equal(D.facts.lifeStages, 7);
  assert.deepEqual(J(full.ctx.LivonLifeData.stages.map(s => s.label)), ['10대', '20대', '30대', '40대', '50대', '60대', '70대 이상']);
});

test('HF-43 topic count consistency', () => {
  assert.equal(full.ctx.LivonLifeHub.repo.data.topics.length, D.facts.topics);
  assert.equal(D.facts.topics, 228);
  assert.ok(A.T.viewArticle('what-is-life-stage').includes('전체 주제는 228개예요'));
  assert.doesNotMatch(A.T.viewArticle('what-is-life-stage') + A.T.viewHome(), /\{\w+\}/, 'every placeholder is filled');
});

test('HF-44 report, follow, AI and live-data consistency: each "not connected" in Help matches the code', () => {
  const S = full.ctx.LivonCommunityService;
  assert.equal(S.adapter().submitReport({}).status, 'local-only');
  assert.deepEqual(J(S.adapter().follows()), { available: false, status: 'ACCOUNT_REQUIRED', list: [] });
  assert.equal(S.adapter().kind, 'local');
  assert.equal(D.facts.communityPosts, 'LOCAL');
  // LIVON AI and the data server: no API origin is configured for this site
  assert.match(read('livon-api-config.js'), /var configured = "";/, 'an AI / data origin was configured — update facts.ai, facts.liveData and the ai-status / live-data articles');
  assert.equal(full.ctx.LivonApi.base, '');
  assert.equal(D.facts.ai, 'NOT_CONNECTED'); assert.equal(D.facts.liveData, 'NOT_CONNECTED');
  assert.match(read('data/livon-data-config.js'), /keyed providers go through this server route \(not deployed yet\)/);
  // dedupe and autosave, as described
  const R = (() => { const a = hp({ full: true }); vm.runInContext(read('community-page.js'), a.ctx); return a.ctx.LivonCommunityRepo; })();
  if (R) {
    const p = R.create({ type: 'story', title: '글', body: '본문' }).post;
    assert.equal(R.report('post:' + p.id, 'spam').status, 'ok');
    assert.equal(R.report('post:' + p.id, 'spam').status, 'duplicate');
    assert.equal(R.report('post:' + p.id, 'other').status, 'ok');
  }
});

test('HF-45 onboarding skip consistency: skipping is allowed and limits nothing', () => {
  const a = hp({ full: true }), PZ = a.ctx.LivonPersonalization;
  assert.equal(PZ.entry(), 'welcome');
  PZ.skip();
  assert.equal(PZ.state(), 'SKIPPED');
  assert.equal(PZ.entry(), 'none', 'not asked again, as Help says');
  assert.equal(PZ.allowedIds(''), null, 'nothing is filtered');
  assert.ok(a.ctx.LivonScreenData.repository().all().length > 400);
});

test('HF-46 reset preservation: resetting personalization keeps saves, My Life and community data, as Help says', () => {
  const keep = { 'livon.platform.v1': { saves: [{ id: 'ex:ex-career24', type: 'content', title: '고용24', href: '#ex-item-ex-career24', savedAt: 1 }] }, 'livon.mlStore.v1': { v: 3, todos: [{ id: 't1', title: 'a' }], goals: [{ id: 'g1', title: 'b' }] },
    'livon.cmStore.v1': { v: 2, posts: [{ id: 'post_1', title: '글', body: 'x', type: 'story', authorId: 'local' }], comments: [], likes: {}, reports: [] } };
  const a = hp({ full: true, local: Object.assign({ 'livon.lifeStage': '30', 'livon.lifeInterests': ['건강'], 'livon.lifeEvents': ['checkup'] }, keep) });
  const get = k => JSON.parse(a.ctx.localStorage.getItem(k));
  a.ctx.LivonPersonalization.reset();
  assert.deepEqual([get('livon.lifeStage'), get('livon.lifeInterests'), get('livon.lifeEvents')], [null, [], []]);
  assert.equal(get('livon.platform.v1').saves.length, 1);
  assert.deepEqual([get('livon.mlStore.v1').todos.length, get('livon.mlStore.v1').goals.length], [1, 1]);
  assert.equal(get('livon.cmStore.v1').posts.length, 1);
  has('personalization-reset', /세 가지만 지워져요\. 저장한 항목, 할 일, 목표, 기록, 커뮤니티 글은 그대로예요/);
  has('community-reset', /커뮤니티 기록만 지워지고 맞춤 설정과 내 생활의 다른 내용은 그대로 남아요/);
});

/* ───────── copy quality ───────── */
test('copy quality: plain, honest wording — no promise of something that does not exist', () => {
  assert.doesNotMatch(HELP_TEXT, /완벽하게|안전하게 서버에 저장|실시간 동기화|AI가 알아서|운영팀이 즉시 확인|100%|곧 출시|조만간/);
  for (const a of D.articles) {
    assert.doesNotMatch(allText(a), /합니다\.|습니다\.$/m, a.id + ' keeps the same friendly tone');
    assert.ok(a.short.length >= 20, a.id);
  }
  assert.ok(D.articles.filter(a => a.popular).length >= 8);
});

/* ───────── regressions ───────── */
test('HF-47 Community regression: feed, compose, draft, reaction, comments, search, report still work with Help loaded', () => {
  const a = hp({ full: true });
  vm.runInContext(read('community-page.js'), a.ctx);
  const R = a.ctx.LivonCommunityRepo, T = a.ctx.LivonCommunity._test;
  const p = R.create({ type: 'question', title: '첫 취업 면접 질문', body: '궁금해요', lifeStage: '20', lifeEvent: 'first-job' }).post;
  assert.equal(R.update(p.id, { type: 'question', title: '첫 취업 면접 질문 수정', body: '궁금해요', lifeStage: '20', lifeEvent: 'first-job' }).status, 'ok');
  assert.equal(R.saveComposeDraft({ title: '초안', body: 'x' }).status, 'ok');
  assert.equal(R.toggleReaction(p.id), true);
  T.applyFeedParams({ q: '첫취업' }); assert.equal(T.filterFeed().length, 1);
  T.applyFeedParams({ tab: 'following' }); assert.equal(T.filterFeed().length, 0);
  T.applyFeedParams({ tab: 'foryou', event: 'first-job' }); assert.equal(T.filterFeed().length, 1);
  assert.equal(R.report('post:' + p.id, 'spam').status, 'ok');
  assert.equal(R.activity().posts.length, 1);
  assert.equal(R.remove(p.id).status, 'ok');
  assert.equal(T.helpLink, undefined);
  assert.match(read('community-page.js'), /function helpLink\(id, label\) \{ return window\.LivonHelp && typeof window\.LivonHelp\.link === "function" \? window\.LivonHelp\.link\(id, label\) : ""; \}/, 'the community works when Help is not loaded');
});

test('HF-48 Onboarding regression: states and steps are unchanged; the help link never blocks the flow', () => {
  const a = hp({ full: true }), PZ = a.ctx.LivonPersonalization;
  assert.deepEqual([...PZ.STATES], ['NEW', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']);
  assert.deepEqual([...PZ.STEPS], ['stage', 'interests', 'events', 'preview']);
  assert.equal(PZ.VERSION, 1);
  PZ.start(); assert.equal(PZ.state(), 'IN_PROGRESS');
  PZ.saveDraft('interests', { lifeStage: '30' }); assert.equal(PZ.draft().step, 'interests');
  PZ.complete({ lifeStage: '30', interests: ['건강'], lifeEvents: ['checkup'] }); assert.equal(PZ.state(), 'COMPLETED');
  PZ.reset(); assert.equal(PZ.state(), 'SKIPPED');
  const ob = read('livon-onboarding.js');
  assert.match(ob, /function help\(id, label\) \{ return window\.LivonHelp && typeof window\.LivonHelp\.link === "function" \? " " \+ window\.LivonHelp\.link\(id, label\) : ""; \}/, 'no Help → no link, same dialog');
  for (const s of ['data-ob-entry-start', 'data-ob-entry-skip', 'data-ob-next', 'data-ob-back', 'data-ob-finish', 'data-ob-later']) assert.ok(ob.includes(s), s);
});

test('HF-49 Admin regression: sections and status rows are intact; Help adds three rows at the end', async () => {
  const { svc, ctx } = admin({ withHelp: true });
  assert.equal(ctx.LivonAdminService.NAV.length, 15);
  const rows = svc.system(await svc.adapterInfo()).map(s => s.key);
  assert.deepEqual(J(rows.slice(-3)), ['Help Content', 'Help Verification', 'Support Backend']);
  for (const k of ['Environment', 'Anonymous Mode', 'Data Platform', 'Curated Records', 'Personalization Engine', 'Community Backend', 'Storage', 'Provider Manifest']) assert.ok(rows.includes(k), k);
  assert.equal(svc.community(null).backend, 'NOT CONNECTED');
});

test('HF-50 Data Manager regression: unchanged by Help', () => {
  const ctx = loadLivon();
  vm.runInContext(read('admin/data/data-manager-core.js'), ctx);
  const DM = ctx.LivonDataManager, M = DM.createModel(ctx, { now: Date.parse('2026-10-01T00:00:00Z') });
  assert.equal(M.records.length, 530);
  assert.ok(DM.simulateOnboarding(M, { lifeStage: '20', lifeEvents: ['first-job'] }).items.length > 0);
  assert.equal(DM.isAllowedHost('www.newon.app'), false);
  assert.doesNotMatch(read('admin/data/index.html') + read('admin/data/data-manager.js') + read('admin/data/data-manager-core.js'), /help-data|LivonHelp/);
});

test('HF-51 public LIVON regression: the seven screens, their router and their scripts are as before', () => {
  const view = new Function(INDEX.match(/function livonView\(hash\) \{[\s\S]*?\n        \}/)[0] + '; return livonView;')();
  assert.deepEqual(['livon-home', 'life', 'today', 'life-now', 'explore', 'community', 'livon-ai', 'ml-settings', 'cm-home', 'ex-results', 'td-pick', 'life/20s/first-job'].map(view),
    ['home', 'life', 'today', 'life-now', 'explore', 'community', 'livon-ai', 'life-now', 'community', 'explore', 'today', 'life']);
  for (const id of ['livon-home', 'life', 'today', 'life-now', 'explore', 'community', 'livon-ai', 'help']) assert.equal((INDEX.match(new RegExp('<section[^>]* id="' + id + '"', 'g')) || []).length, 1, id);
  assert.equal((INDEX.match(/<section[^>]*data-lv-screen="/g) || []).length, 8, 'seven screens + Help');
  assert.equal((INDEX.match(/class="gnav-mobile__sublink"/g) || []).length, 8, 'seven services + Help in the mobile menu');
  for (const f of ['home-page.js', 'life-page.js', 'today-feed.js', 'explore-page.js', 'livon-platform.js', 'livon-personalization.js', 'community-service.js']) assert.doesNotMatch(read(f), /LivonHelp/, f + ' does not depend on Help');
  assert.match(CSS, /^html:not\(\[data-lv-view="help"\]\) main > #help \{ display: none; \}/m, 'Help is hidden on every other screen');
  assert.ok(!/(^|[^-\w#.])(body|main|html)\s*\{/.test(CSS.replace(/html\[data-lv-view="help"\][^{]*\{/g, '')), 'help-page.css styles only #help and the help view');
});

test('HF-52 anonymous mode: Help needs no account and tells the reader none exists', () => {
  const a = hp({ hash: '#help/a/no-signup' });
  assert.match(text(a.html()), /LIVON은 지금 계정 없이 쓰는 서비스예요/);
  assert.equal(a.ctx.LivonUserData.auth().status, 'anonymous');
  assert.doesNotMatch(code(PAGE), /auth\(|isSignedIn|requireLogin/);
  assert.doesNotMatch(text(a.T.viewHome()), /로그인하세요|로그인이 필요|회원가입 후/);
});

test('HF-53 build: the Help files are part of the published LIVON page, the Admin is not', () => {
  for (const f of ['help-data.js', 'help-page.js', 'help-page.css']) {
    assert.ok(fs.existsSync(path.join(ROOT, 'livon', f)), f);
    assert.equal(INDEX.split('/livon/' + f + '?v=').length - 1, 1, f + ' referenced once with a version');
  }
  const pub = fs.readFileSync(path.join(ROOT, 'scripts/publish-site.mjs'), 'utf8');
  assert.match(pub, /fs\.rmSync\(path\.join\(OUT, "livon", "admin"\)/);
  assert.doesNotThrow(() => new vm.Script(PAGE)); assert.doesNotThrow(() => new vm.Script(DATA_SRC));
  const doc = fs.readFileSync(path.join(ROOT, 'docs/livon/LIVON_HELP_FAQ.md'), 'utf8');
  for (const h of ['Audit', 'Information architecture', 'Categories', 'Article schema', 'Search', 'Synonyms', 'Contextual help', 'Troubleshooting', 'Service status', 'Local data', 'Personalization', 'Community', 'AI', 'Deep links', 'Accessibility', 'Offline', 'Content verification', 'Consistency testing', 'Future support backend']) {
    assert.match(doc, new RegExp('^## .*' + h, 'm'), 'doc section: ' + h);
  }
  const audit = [...doc.matchAll(/^\| [^|]+ \| (EXISTS|PARTIAL|MISSING|OUTDATED|NOT APPLICABLE) \|/gm)].map(m => m[1]);
  assert.ok(audit.length >= 30, 'audit rows: ' + audit.length);
});

test('performance: 500 searches and a full render of every page stay instant; the Data Platform is not rebuilt', () => {
  const a = hp({ full: true }), repo = a.ctx.LivonScreenData.repository();
  let t = process.hrtime.bigint();
  for (let i = 0; i < 500; i++) a.H.search(QUERIES[i % QUERIES.length][0]);
  const perSearch = Number(process.hrtime.bigint() - t) / 1e6 / 500;
  assert.ok(perSearch < 5, 'search ' + perSearch.toFixed(2) + 'ms');
  t = process.hrtime.bigint();
  a.go('help'); for (const c of a.D.categories) a.go('help/c/' + c.id); for (const x of a.D.articles) a.go('help/a/' + x.id); a.go('help/status');
  assert.ok(Number(process.hrtime.bigint() - t) / 1e6 < 500);
  assert.equal(a.ctx.LivonScreenData.repository(), repo);
  assert.doesNotMatch(code(PAGE), /LivonScreenData|LivonDataPlatform|repository\(/, 'Help never touches the Data Platform');
  assert.ok(fs.statSync(path.join(ROOT, 'livon/help-data.js')).size < 120 * 1024);
});
