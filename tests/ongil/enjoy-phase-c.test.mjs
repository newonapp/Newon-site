// ONGIL Enjoy Phase C — 전국 축제·공연·행사 (한국관광공사 TourAPI, contentTypeId 15 / searchFestival2).
// Everything here runs on TEST FIXTURES ([QA 픽스처]) and stub fetchers: no key, no network.
// The live TourAPI festival answer (field names, eventStartDate behaviour, 36110) is NOT VERIFIED by these tests —
// see docs/ongil/ONGIL_ENJOY_PHASE_C.md "Verification status".
//   node --test tests/ongil/enjoy-phase-c.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as tour from '../../server/livon/data/providers/tourapi.mjs';
import { createDataHandler } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';
import * as E from '../../ongil-start/js/enjoy-contracts.js';
import { createTourFestivalSource, TOUR_EVENT_TYPE, TOUR_PROVIDER, TOUR_REGIONS } from '../../ongil-start/js/data-source.js';
import { SEARCH_TARGETS, TARGETS_BY_CATEGORY, NATIONWIDE } from '../../ongil-start/js/enjoy-view.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const VIEW = strip(read('ongil-start', 'js', 'enjoy-view.js'));
const APP = read('ongil-start', 'js', 'app.js');
const enc = encodeURIComponent;

/* ───────── server fixtures (fields from the KorService2 명세; values invented and marked) ───────── */
const KEY = 'phase-c-test-key-DO-NOT-LEAK';
const fest = (o = {}) => ({ contentid: '3100001', contenttypeid: '15', title: '[QA 픽스처] 가을 음악 축제', addr1: '세종특별자치시 조치원읍 1', addr2: '', mapx: '127.29', mapy: '36.60', tel: '044-000-0000', eventstartdate: '20261010', eventenddate: '20261020', firstimage: '', cpyrhtDivCd: '', lDongRegnCd: '36110', modifiedtime: '20260901101010', ...o });
const ok = (items, total = items.length) => JSON.stringify({ response: { header: { resultCode: '0000', resultMsg: 'OK' }, body: { items: items.length ? { item: items } : '', numOfRows: 20, pageNo: 1, totalCount: total } } });
const reply = (text, status = 200) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => 'application/json' }, text: async () => text });
function upstream(answer) {
  const calls = [];
  return { calls, fetcher: async (url) => { const u = new URL(url); calls.push(u); return answer(u); } };
}
async function get(h, qs) {
  const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } };
  await h({ method: 'GET', url: '/api/livon/data?provider=kr-tourapi&' + qs, headers: {} }, r);
  return { status: r.statusCode, json: () => JSON.parse(r.body) };
}
const handler = (up) => createDataHandler({ env: { TOURAPI_SERVICE_KEY: KEY }, fetcher: up.fetcher, cache: memoryCache(), log: () => {} });
const op = (u) => u.pathname.split('/').pop();
const kstToday = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '');

/* ───────── route ───────── */

test('PC-1 route: type=15 asks searchFestival2 from today in Korea; a chosen region is its code (세종 36110, 광주·전남 12); no keyword, no coordinates', async () => {
  const up = upstream(() => reply(ok([fest()])));
  const h = handler(up);
  const r = await get(h, 'type=15&region=' + enc('세종'));
  assert.equal(r.status, 200);
  const u = up.calls[0];
  assert.equal(op(u), 'searchFestival2');
  assert.equal(u.searchParams.get('eventStartDate'), kstToday(), 'past festivals are not asked for');
  assert.equal(u.searchParams.get('lDongRegnCd'), '36110');
  assert.equal(u.searchParams.get('arrange'), 'A');
  for (const k of ['keyword', 'mapX', 'mapY', 'radius', 'contentTypeId', 'areaCode']) assert.equal(u.searchParams.has(k), false, k);
  await get(h, 'type=15&region=' + enc('광주·전남'));
  assert.equal(up.calls[1].searchParams.get('lDongRegnCd'), '12');
  await get(h, 'type=15');
  assert.equal(up.calls[2].searchParams.has('lDongRegnCd'), false, 'no region = nationwide');
  for (const q of ['type=15&query=a', 'type=15&lat=37.5&lng=127', 'type=15&region=' + enc('서울') + '&sigungu=110', 'type=15&region=' + enc('광주'), 'type=15&region=' + enc('전남'), 'type=15&radius=1000']) assert.equal((await get(h, q)).status, 400, q);
  assert.equal(up.calls.length, 3, 'a refused request never reaches the service');
});

test('PC-2 route: a festival becomes an event entity — dates only from the source; a row without a valid start is dropped; the key never leaves', async () => {
  const up = upstream(() => reply(ok([fest(), fest({ contentid: '3100002', eventstartdate: '' }), fest({ contentid: '3100003', eventstartdate: '20261399' }), fest({ contentid: '3100004', eventenddate: '20261001' })])));
  const r = await get(handler(up), 'type=15');
  const body = r.json();
  assert.deepEqual(body.items.map((e) => e.providerId), ['3100001', '3100004']);
  const e = body.items[0];
  assert.equal(e.type, 'event');
  assert.equal(e.eventStatus, 'unknown', 'no cancellation state is invented');
  assert.equal(e.source.sourceUrl, tour.DATASET_URL, 'the list row links the dataset page, not a made-up festival page');
  assert.equal(e.contact.website, null, 'a list row has no homepage');
  assert.equal(body.items[1].schedule.endAt, null, 'an end before the start is dropped, not fixed');
  assert.doesNotMatch(JSON.stringify(body), new RegExp(KEY));
});

test('PC-3 route: detail (id + type 15) reads common + intro; the homepage and intro fields are the source\'s; a non-festival id answers nothing', async () => {
  const up = upstream((u) => {
    if (op(u) === 'detailCommon2') return reply(ok([fest({ homepage: '<a href="https://fest.example.kr/">홈페이지</a>', overview: '[QA 픽스처] 소개 글' })]));
    if (op(u) === 'detailIntro2') return reply(ok([{ contentid: '3100001', contenttypeid: '15', eventstartdate: '20261010', eventenddate: '20261020', eventplace: '[QA 픽스처] 중앙공원', usetimefestival: '무료', sponsor1: '[QA 픽스처] 세종시' }]));
    return reply(ok([]));
  });
  const h = handler(up);
  const r = await get(h, 'id=3100001&type=15');
  assert.equal(r.status, 200);
  const e = r.json().items[0];
  assert.deepEqual([e.contact.website, e.venue, e.organizer, e.metadata.usetimefestival, e.description], ['https://fest.example.kr/', '[QA 픽스처] 중앙공원', '[QA 픽스처] 세종시', '무료', '[QA 픽스처] 소개 글']);
  assert.deepEqual(up.calls.map(op), ['detailCommon2', 'detailIntro2']);
  const up2 = upstream(() => reply(ok([fest({ contenttypeid: '12' })])));
  assert.deepEqual((await get(handler(up2), 'id=3100001&type=15')).json().items, []);
});

/* ───────── client source ───────── */

function api({ pages = [], configured = true, failPage = 0 } = {}) {
  const calls = [];
  const fetcher = async (url) => {
    calls.push(url);
    if (/action=status/.test(url)) return { ok: true, status: 200, json: async () => ({ ok: true, providers: { [TOUR_PROVIDER]: { configured } } }) };
    const page = Number(new URLSearchParams(url.slice(url.indexOf('?'))).get('page') || 1);
    if (page === failPage) return { ok: false, status: 500, json: async () => ({ ok: false }) };
    const p = pages[page - 1] || { items: [], hasMore: false };
    return { ok: true, status: 200, json: async () => ({ ok: true, ...p }) };
  };
  return { calls, opts: { apiUrl: (p) => p, fetcher, retryDelayMs: 0 } };
}
const ev = (id, over = {}) => ({ type: 'event', providerId: String(id), title: `[QA 픽스처] 행사 ${id}`, organizer: null, venue: null, schedule: { startAt: '2026-10-10', endAt: '2026-10-20' }, location: { region: '세종', address: '세종특별자치시 조치원읍 1' }, contact: null, source: { providerName: '한국관광공사 TourAPI', attribution: '출처: ⓒ한국관광공사', sourceUrl: tour.DATASET_URL }, metadata: {}, ...over });

test('PC-4 source: one request per page, at most three pages; the request carries only provider, type 15, region, page and limit', async () => {
  const a = api({ pages: [{ items: [ev(1)], hasMore: true }, { items: [ev(2)], hasMore: true }, { items: [ev(3)], hasMore: true }, { items: [ev(4)] }] });
  const r = await createTourFestivalSource(a.opts).load({ region: '세종' });
  assert.equal(r.state, 'ready');
  assert.deepEqual(r.items.map((x) => x.providerId), ['1', '2', '3']);
  const lists = a.calls.filter((u) => !/action=status/.test(u));
  assert.equal(lists.length, 3);
  for (const u of lists) assert.deepEqual([...new URLSearchParams(u.slice(u.indexOf('?'))).keys()].sort(), ['limit', 'page', 'provider', 'region', 'type']);
  assert.equal(new URLSearchParams(lists[0].slice(lists[0].indexOf('?'))).get('type'), TOUR_EVENT_TYPE);
  const all = api({ pages: [{ items: [ev(1)] }] });
  await createTourFestivalSource(all.opts).load({ region: '' });
  assert.equal(all.calls.filter((u) => !/action=status/.test(u)).every((u) => !/region=/.test(u)), true, 'nationwide sends no region');
});

test('PC-5 source: failure is not "nothing found"; a later page that fails is said, not hidden; an unknown region is refused before any request', async () => {
  assert.equal((await createTourFestivalSource(api({ failPage: 1 }).opts).load({ region: '부산' })).state, 'unavailable');
  const part = await createTourFestivalSource(api({ pages: [{ items: [ev(1)], hasMore: true }], failPage: 2 }).opts).load({ region: '부산' });
  assert.deepEqual([part.state, part.partial, part.items.length], ['ready', true, 1]);
  assert.deepEqual(await createTourFestivalSource(api({ pages: [{ items: [] }] }).opts).load({ region: '부산' }), { state: 'empty', items: [], attribution: '' });
  for (const region of ['광주', '전남', '서울시', 'x']) {
    const a = api();
    assert.equal((await createTourFestivalSource(a.opts).load({ region })).state, 'unavailable', region);
    assert.equal(a.calls.length, 0, region);
  }
  assert.equal(TOUR_REGIONS.length, 16);
  const off = api({ configured: false });
  assert.equal((await createTourFestivalSource(off.opts).load({ region: '서울' })).reason, 'NOT_CONFIGURED');
});

test('PC-6 source detail: only a numeric content id is asked for; a failed detail is unavailable (retryable), not empty', async () => {
  const a = api({ pages: [{ items: [ev(7, { contact: { website: 'https://fest.example.kr/' } })] }] });
  const d = await createTourFestivalSource(a.opts).detail('7');
  assert.equal(d.items[0].contact.website, 'https://fest.example.kr/');
  assert.match(a.calls[a.calls.length - 1], /\?provider=kr-tourapi&id=7&type=15$/);
  const b = api();
  assert.equal((await createTourFestivalSource(b.opts).detail('7&x=1')).reason, 'NOT_FOUND');
  assert.equal(b.calls.length, 0);
  assert.equal((await createTourFestivalSource(api({ failPage: 1 }).opts).detail('7')).state, 'unavailable');
});

/* ───────── contract ───────── */

test('PC-7 fromTourEvent: an EVENT with the source\'s own dates (Korean day), region, place and homepage; nothing filled in', () => {
  const item = E.normalizeProgram(E.fromTourEvent(ev(9, { venue: '중앙공원', schedule: { startAt: '2026-10-09T15:00:00.000Z', endAt: '2026-10-20T14:59:59.000Z' }, contact: { website: 'https://fest.example.kr/' }, metadata: { usetimefestival: '무료' } }), 'CULTURE'));
  assert.deepEqual([item.type, item.id, item.startDate, item.endDate, item.region, item.costText, item.contentId], ['EVENT', 'tourev-9', '2026-10-10', '2026-10-20', '세종', '무료', '9']);
  assert.equal(item.location, '중앙공원 · 세종특별자치시 조치원읍 1');
  assert.equal(item.linkKind, 'organizer', 'the festival homepage is shown as the organiser\'s site, not "official"');
  const bare = E.normalizeProgram(E.fromTourEvent(ev(10)));
  assert.deepEqual([bare.costText, bare.organization, bare.sourceUrl], ['', '', ''], 'no fee, organiser or link is invented');
  assert.equal(E.fromTourEvent(ev(11, { schedule: { startAt: '' } })), null);
  assert.equal(E.fromTourEvent({ ...ev(12), type: 'place' }), null);
  assert.equal(E.fromTourEvent(ev('x1')), null);
});

test('PC-8 date filter: now / 7 days / this month / later, against today; ended festivals never match', () => {
  const at = (s, e) => ({ type: 'EVENT', startDate: s, endDate: e });
  const today = '2026-10-11';
  const cases = [[at('2026-10-10', '2026-10-20'), [true, true, true, false]], [at('2026-10-25', '2026-10-26'), [false, false, true, false]], [at('2026-10-15', ''), [false, true, true, false]], [at('2026-11-02', '2026-11-03'), [false, false, false, true]], [at('2026-10-01', '2026-10-05'), [false, false, false, false]]];
  for (const [item, want] of cases) assert.deepEqual(E.EVENT_PERIODS.map((p) => E.inEventPeriod(item, p.id, today)), want, JSON.stringify(item));
  assert.equal(E.inEventPeriod(at('2026-10-01', '2026-10-05'), '', today), true, 'no period chosen = no date filter');
  assert.equal(E.inEventPeriod({ type: 'EVENT', startDate: '' }, 'week', today), false);
  assert.deepEqual([E.isEnded(at('2026-10-01', '2026-10-10'), today), E.isEnded(at('2026-10-01', '2026-10-11'), today), E.isEnded({ type: 'CLASS', startDate: '2020-01-01' }, today)], [true, false, false]);
  assert.equal(E.inEventPeriod(at('2026-12-31', ''), 'later', '2026-12-05'), false, 'December: this month');
  assert.equal(E.inEventPeriod(at('2027-01-02', ''), 'later', '2026-12-05'), true, 'December → January rolls the year');
});

test('PC-9 favourites and calendar: a festival is saved as PROGRAM (existing type) and goes to the calendar on its start day', () => {
  const item = E.normalizeProgram(E.fromTourEvent(ev(9)));
  const s = E.savedInputFor(item);
  assert.deepEqual([s.type, s.id], ['PROGRAM', 'tourev-9']);
  assert.match(s.description, /^행사 · .*2026-10-10$/);
  assert.deepEqual(E.calendarDraft(item), { title: '[QA 픽스처] 행사 9', date: '2026-10-10', time: '' });
});

/* ───────── screen (source checks; the rendered screen is checked in the browser run, see the doc) ───────── */

test('PC-10 screen: one event target in 문화·나들이 (not 여행); 전국 only for events; period filter, 기간 meta, detail retry; event source wired once', () => {
  assert.deepEqual(SEARCH_TARGETS.filter((t) => t.source === 'event').map((t) => [t.id, t.label]), [['tour-15', '축제·공연·행사 (한국관광공사)']]);
  assert.ok(TARGETS_BY_CATEGORY.CULTURE.includes('tour-15') && TARGETS_BY_CATEGORY.OUTING.includes('tour-15'));
  assert.deepEqual(TARGETS_BY_CATEGORY.TRAVEL, ['tour-12']);
  assert.equal(NATIONWIDE, '전국');
  assert.match(VIEW, /sources\.event\.load\(\{ region: region === NATIONWIDE \? '' : region \}\)/);
  assert.match(VIEW, /\.filter\(\(i\) => !isEnded\(i, today\(\)\)\)/, 'ended festivals are not offered');
  assert.match(VIEW, /기간 \(축제·행사\)/);
  assert.match(VIEW, /data-og-enjoy-event-retry/);
  assert.match(VIEW, /failureText\(/, 'a failed detail says why, with the Stability V1 words');
  assert.equal((APP.match(/createTourFestivalSource\(/g) || []).length, 1);
  assert.match(APP, /event: observeSource\(createTourFestivalSource\(dataApi\), \{ id: 'tour-event'/);
});

test('PC-11 boundaries: the shared route keeps its fixed parameters (RC-1); no key or provider host in the browser code', () => {
  const http = read('server', 'livon', 'data', 'http.mjs');
  for (const p of ['page', 'limit', 'query', 'region', 'area', 'sigungu', 'type', 'lat', 'lng', 'radius', 'id', 'view']) assert.match(http, new RegExp(`\\b${p}\\b`));
  const DS = strip(read('ongil-start', 'js', 'data-source.js'));
  assert.doesNotMatch(DS, /apis\.data\.go\.kr|TOURAPI_SERVICE_KEY|serviceKey|searchFestival2/);
});
