// ONGIL Completion V1 — 건강 수치 (health measures): numbers the user reads off their own device and writes down.
// Contract, store, privacy, wiring and copy. No browser, no dependencies:  node --test tests/ongil/*.test.mjs
// The browser QA (320 / 390 / 1280: add, wrong value → error, edit, confirmed delete, recent list, history count,
// search/assistant/analytics never see it) is recorded in docs/ongil/COMPLETION_V1.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import { createHealthMeasureStore } from '../../ongil-start/js/health-measures.js';
import { MEASURE_TYPES, MEASURE_TIMINGS, MEASURE_LIMITS, parseMeasureValue, normalizeHealthMeasure, measureText, LIFE_LIMITS } from '../../ongil-start/js/life-contracts.js';
import { classOf, maySync, maySearchGlobally, CONTRACT_CLASSES } from '../../ongil-start/js/privacy.js';
import { SYNCABLE_COLLECTIONS } from '../../ongil-start/js/account.js';
import { describeHealthDay, MEASURE_NOTE } from '../../ongil-start/js/life-health.js';
import { LIFE_SECTIONS, LIFE_GROUPS, resolveSection } from '../../ongil-start/js/life-view.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { moduleRoute } from '../../ongil-start/js/routes.js';
import { dateKey, addDays } from '../../ongil-start/js/dates.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const JS_DIR = path.join(ROOT, 'ongil-start', 'js');
const JS = Object.fromEntries(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).map((f) => [f, read('js', f)]));

function world(seed, start = new Date(2026, 9, 2, 9, 0, 0)) {
  let t = start.getTime();
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend });
  let n = 0;
  const store = createHealthMeasureStore(storage, { now: () => t, makeId: () => `hm_test${String(++n).padStart(4, '0')}` });
  return { backend, storage, store, today: dateKey(t), advance: (ms) => { t += ms; } };
}

test('OG-HM-1 contract: four kinds with a unit, typed numbers checked against a plausible input range, blood pressure as high/low', () => {
  assert.deepEqual(MEASURE_TYPES.map((t) => [t.id, t.label, t.unit]), [['weight', '체중', 'kg'], ['bloodPressure', '혈압', 'mmHg'], ['bloodSugar', '혈당', 'mg/dL'], ['pulse', '맥박', '회/분']]);
  assert.deepEqual(MEASURE_TIMINGS.map((t) => t.id), ['morning', 'beforeMeal', 'afterMeal', 'bedtime', 'other']);
  assert.deepEqual(parseMeasureValue('weight', '62.5'), { value: 62.5, value2: null });
  assert.deepEqual(parseMeasureValue('weight', '62,5'), { value: 62.5, value2: null }, 'a comma is read as the decimal point');
  assert.deepEqual(parseMeasureValue('bloodPressure', '120/80'), { value: 120, value2: 80 });
  assert.deepEqual(parseMeasureValue('bloodPressure', ' 135 / 88 '), { value: 135, value2: 88 });
  assert.deepEqual(parseMeasureValue('bloodSugar', '105'), { value: 105, value2: null });
  assert.deepEqual(parseMeasureValue('pulse', '72'), { value: 72, value2: null });
  /* a typo is caught, never stored: out of the input range, too many decimals, reversed or missing blood-pressure values */
  for (const [t, v] of [['weight', '1200'], ['weight', '62.55'], ['weight', ''], ['weight', 'abc'], ['weight', '-60'], ['bloodPressure', '80/120'], ['bloodPressure', '120'], ['bloodPressure', '120/80/70'], ['bloodSugar', '10.5'], ['pulse', '999'], ['weight', '<b>60</b>']]) {
    assert.throws(() => parseMeasureValue(t, v), /INVALID_VALUE/, `${t} ${v}`);
  }
  assert.throws(() => parseMeasureValue('cholesterol', '200'), /INVALID_TYPE/);
  assert.equal(measureText({ type: 'bloodPressure', value: 120, value2: 80 }), '120/80 mmHg');
  assert.equal(measureText({ type: 'weight', value: 62.5 }), '62.5 kg');
  /* a stored record is checked again: a damaged number does not come back */
  assert.throws(() => normalizeHealthMeasure({ id: 'hm_abcdef12', date: '2026-10-01', type: 'weight', value: 9999 }), /INVALID_VALUE/);
  const m = normalizeHealthMeasure({ id: 'hm_abcdef12', date: '2026-10-01', type: 'pulse', value: 70, timing: 'nope', time: '25:00', memo: 'x'.repeat(500) });
  assert.equal(m.timing, ''); assert.equal(m.time, ''); assert.equal(m.memo.length, MEASURE_LIMITS.memo);
  assert.equal(CONTRACT_CLASSES.HealthMeasure, 'HEALTH_ADJACENT');
});

test('OG-HM-2 store: add / update / remove on a day, sorted by time, several per day, recent per kind, no future day', () => {
  const w = world();
  const a = w.store.add({ type: 'bloodPressure', text: '128/82', time: '07:30', timing: 'morning' });
  assert.equal(a.ok, true); assert.equal(a.measure.value, 128); assert.equal(a.measure.value2, 82);
  const b = w.store.add({ type: 'weight', text: '62.5', time: '06:50' });
  const c = w.store.add({ type: 'weight', text: '62.1' });
  assert.deepEqual(w.store.listForDate(w.today).map((m) => m.id), [b.measure.id, a.measure.id, c.measure.id], 'timed records first, by time; untimed after');
  assert.equal(w.store.countForDate(w.today), 3);
  assert.deepEqual(w.store.add({ type: 'weight', text: '1200' }), { ok: false, reason: 'INVALID_VALUE' });
  assert.deepEqual(w.store.add({ type: 'weight', text: '60', date: addDays(w.today, 1) }), { ok: false, reason: 'FUTURE_DATE' });
  assert.deepEqual(w.store.add({ type: 'weight', text: '60', date: addDays(w.today, -LIFE_LIMITS.days) }), { ok: false, reason: 'TOO_OLD' });
  /* a past day can be filled in */
  assert.equal(w.store.add({ type: 'weight', text: '63.0', date: addDays(w.today, -3) }).ok, true);
  assert.deepEqual(w.store.recent('weight', 5).map((m) => m.value), [62.1, 62.5, 63], 'newest first');
  /* update keeps the day; a bad value changes nothing */
  const u = w.store.update(c.measure.id, { text: '61.8', memo: '저녁', date: addDays(w.today, -1) });
  assert.equal(u.ok, true); assert.equal(u.measure.value, 61.8); assert.equal(u.measure.date, w.today); assert.equal(u.measure.memo, '저녁');
  assert.deepEqual(w.store.update(c.measure.id, { text: '0' }), { ok: false, reason: 'INVALID_VALUE' });
  assert.equal(w.store.listForDate(w.today).find((m) => m.id === c.measure.id).value, 61.8);
  /* switching the kind re-checks the number for that kind */
  assert.deepEqual(w.store.update(b.measure.id, { type: 'bloodPressure' }), { ok: false, reason: 'INVALID_VALUE' });
  assert.equal(w.store.update(b.measure.id, { type: 'bloodPressure', text: '118/76' }).measure.type, 'bloodPressure');
  assert.deepEqual(w.store.remove(a.measure.id), { ok: true });
  assert.deepEqual(w.store.remove(a.measure.id), { ok: false, reason: 'NOT_FOUND' });
  assert.equal(w.store.countForDate(w.today), 2);
});

test('OG-HM-3 limits, damaged entries and storage failure: honest results, never a fake save', () => {
  const w = world();
  for (let i = 0; i < MEASURE_LIMITS.perDay; i++) assert.equal(w.store.add({ type: 'pulse', text: String(60 + i) }).ok, true);
  assert.deepEqual(w.store.add({ type: 'pulse', text: '70' }), { ok: false, reason: 'LIMIT' });
  /* a damaged list: the readable rows survive, the rest are skipped */
  const key = `${KEY_PREFIX}healthMeasures`;
  const seeded = world({ [key]: JSON.stringify({ schemaVersion: 1, items: [{ id: 'hm_good0001', date: '2026-10-02', type: 'weight', value: 60, createdAt: 1, updatedAt: 1 }, { id: 'bad', type: 'weight', value: 60 }, { id: 'hm_good0002', date: '2026-10-02', type: 'weight', value: 99999 }, null, 'x'] }) });
  assert.deepEqual(seeded.store.listForDate('2026-10-02').map((m) => m.id), ['hm_good0001']);
  /* storage that refuses to write: the add says so */
  const broken = createStorage({ backend: { kind: 'local', getItem: () => null, setItem: () => { throw new Error('quota'); }, removeItem: () => {}, key: () => null, get length() { return 0; } } });
  const s = createHealthMeasureStore(broken, { now: () => new Date(2026, 9, 2, 9).getTime() });
  assert.deepEqual(s.add({ type: 'weight', text: '60' }), { ok: false, reason: 'STORAGE_UNAVAILABLE' });
});

test('OG-HM-4 privacy: HEALTH_ADJACENT — never synced, searched, shared, sent to analytics or read by the assistant', () => {
  assert.ok(COLLECTIONS.includes('healthMeasures'));
  assert.equal(classOf('healthMeasures'), 'HEALTH_ADJACENT');
  assert.equal(maySync('healthMeasures'), false);
  assert.equal(maySearchGlobally('healthMeasures'), false);
  assert.equal(SYNCABLE_COLLECTIONS.includes('healthMeasures'), false);
  for (const f of ['search.js', 'assistant-tools.js', 'assistant-intents.js', 'assistant-view.js', 'analytics.js', 'instrument.js', 'family.js', 'family-view.js', 'community.js', 'notifications.js', 'admin.js']) {
    assert.equal(/healthMeasures|health-measures|createHealthMeasureStore/.test(strip(JS[f])), false, `${f} never touches 건강 수치`);
  }
  /* the store is created once in app.js and handed only to My Life's 건강 group */
  const app = strip(JS['app.js']);
  assert.equal((app.match(/createHealthMeasureStore\(/g) || []).length, 1);
  assert.match(app, /health: \{ checkIn, symptoms, medication, healthNotes, healthMeasures \}/);
  assert.equal(/instrument\.[a-z]+\(healthMeasures|instrument\.[a-z]+\(createHealthMeasureStore/i.test(app), false, 'not wrapped by usage counters');
  /* the 7-day history line says how many numbers, never which */
  const w = world();
  w.store.add({ type: 'weight', text: '62.5' });
  const none = { get: () => null, historyForDate: () => [], countForDate: () => 0 };
  const parts = describeHealthDay({ checkIn: none, symptoms: none, medication: none, healthNotes: none, healthMeasures: w.store }, w.today);
  assert.deepEqual(parts, ['수치 1건']);
  assert.equal(parts.join(' ').includes('62.5'), false);
});

test('OG-HM-5 copy: numbers are kept as written and never judged — no range, verdict, colour, score or advice', () => {
  const code = strip(JS['health-measures.js']) + strip(JS['life-health.js'].slice(JS['life-health.js'].indexOf('건강 수치 ─'), JS['life-health.js'].indexOf('최근 건강 기록 ─')));
  const copy = [...code.matchAll(/(['`])((?:(?!\1)[^\\\n]|\\.)*[가-힣](?:(?!\1)[^\\\n]|\\.)*)\1/g)].map((m) => m[2]).join('\n');
  for (const word of ['정상', '비정상', '위험', '주의', '경고', '고혈압', '저혈압', '당뇨', '비만', '과체중', '저체중', '높아요', '낮아요', '높습니다', '낮습니다', '진단', '처방', '치료', '목표', '점수', '좋은 수치', '나쁜']) {
    assert.equal(copy.includes(word), false, `no "${word}" in 건강 수치 copy`);
  }
  assert.equal(/normalRange|threshold|isHigh|isLow|risk|score/i.test(strip(JS['health-measures.js'])), false);
  assert.equal(MEASURE_NOTE, '적은 숫자를 그대로 보관합니다. 높고 낮음을 판단하지 않아요. 수치가 걱정되면 의료진과 상담하세요.');
  /* no colour is used to carry a meaning in the section (it reuses the plain list styles) */
  assert.equal(/og-measure[a-z-]*--(high|low|warn|alert|danger)/.test(JS['life-health.js']), false);
});

test('OG-HM-6 wiring: 내 생활 › 건강 › 건강 수치 (#life/measures); the 건강·안부 and 내 생활 menus point there', () => {
  assert.equal(LIFE_SECTIONS[LIFE_SECTIONS.length - 1], 'measures');
  assert.deepEqual([...LIFE_GROUPS.find((g) => g.id === 'health').sections], ['checkin', 'symptoms', 'medication', 'health-notes', 'measures']);
  assert.equal(resolveSection('measures'), 'measures');
  const health = AREAS.find((a) => a.id === 'health');
  const life = AREAS.find((a) => a.id === 'life');
  assert.equal(health.modules.find((m) => m.id === 'measures').available, true);
  assert.equal(life.modules.find((m) => m.id === 'measures').available, true);
  assert.equal(moduleRoute(health, 'measures'), '#life/measures');
  assert.equal(moduleRoute(life, 'measures'), '#life/measures');
  /* the form is built from makeField / the shared list card: labelled fields, alert errors, confirmed deletes */
  const section = JS['life-health.js'].slice(JS['life-health.js'].indexOf('export function createHealthMeasuresSection'), JS['life-health.js'].indexOf('/* ───────── 최근 건강 기록'));
  assert.match(section, /createListCard\(/);
  assert.equal(/el\('input'/.test(section), false, 'no hand-built input');
  for (const name of ['type', 'text', 'timing', 'time', 'memo']) assert.match(section, new RegExp(`name: '${name}'`));
  assert.match(section, /required: true, options: MEASURE_TYPES/);
});
