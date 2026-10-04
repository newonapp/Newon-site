// ONGIL Completion V3 — 건강·안부 › 긴급 연락망: contract, store, phone safety, confirmation-only calling, privacy,
// assistant boundary, storage failure, erase, and the screen's accessibility/responsive rules.
// No browser, no network:  node --test tests/ongil/*.test.mjs
// The browser QA (320 → 1440, real clicks: add, invalid phone, edit, priority, primary, delete, call dialog, Escape,
// focus return, storage blocked) is recorded in docs/ongil/COMPLETION_V3.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import { normalizePhone, formatPhone, telHref, normalizeEmergencyContact, createEmergencyContactStore, CONTACT_RELATIONS, EMERGENCY_LIMITS, PUBLIC_EMERGENCY_NUMBERS, EMERGENCY_NOTE, relationLabel } from '../../ongil-start/js/emergency-contacts.js';
import { classOf, maySync, maySearchGlobally, familySharingAllowed, CONTRACT_CLASSES } from '../../ongil-start/js/privacy.js';
import { SYNCABLE_COLLECTIONS } from '../../ongil-start/js/account.js';
import { createAssistant, NO_WRITE_AREAS } from '../../ongil-start/js/assistant-tools.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createSearch, createAreaProvider, createSavedProvider } from '../../ongil-start/js/search.js';
import { SAVED_TYPE_LABELS } from '../../ongil-start/js/contracts.js';
import { familyConnection } from '../../ongil-start/js/onboarding.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { EVENT_NAMES } from '../../ongil-start/js/analytics.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const code = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const JS_DIR = path.join(ROOT, 'ongil-start', 'js');
const JS = Object.fromEntries(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).map((f) => [f, read('js', f)]));
const SRC = JS['emergency-contacts.js'];
const CODE = code(SRC);
const LIFE_CSS = read('styles', 'ongil-life.css');

function world(seed, backend = createMemoryBackend(seed)) {
  let t = new Date(2026, 9, 4, 9, 0, 0).getTime();
  const storage = createStorage({ backend });
  let n = 0;
  const store = createEmergencyContactStore(storage, { now: () => (t += 1000), makeId: () => `ec_test${String(++n).padStart(4, '0')}` });
  return { backend, storage, store, reopen: () => createEmergencyContactStore(storage, { now: () => (t += 1000) }) };
}
const must = (r) => {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.contact;
};

test('OG-EC-1 phone numbers: Korean mobile, landline, +82 and 1xxx numbers are kept as digits; anything else is refused', () => {
  for (const [input, digits] of [['010-1234-5678', '01012345678'], ['010 1234 5678', '01012345678'], ['(02) 123-4567', '021234567'], ['02-1234-5678', '0212345678'], ['031.123.4567', '0311234567'], ['+82 10-1234-5678', '01012345678'], ['+82-2-123-4567', '021234567'], ['1588-1234', '15881234'], [' 010-9999-0000 ', '01099990000']]) assert.equal(normalizePhone(input), digits, input);
  for (const bad of ['', '119', '112', '1234', 'abc-defg-hijk', '010-1234-567a', '+1 202 555 0100', 'javascript:alert(1)', 'tel:01012345678', '010-1234-5678<script>', '010\u00001234\u00005678', '0'.repeat(21), '01012345678901234', 12345678901, null, undefined, {}, ['01012345678']]) assert.equal(normalizePhone(bad), '', String(bad));
  assert.equal(formatPhone('01012345678'), '010-1234-5678');
  assert.equal(formatPhone('021234567'), '02-123-4567');
  assert.equal(formatPhone('0212345678'), '02-1234-5678');
  assert.equal(formatPhone('0311234567'), '031-123-4567');
  assert.equal(formatPhone('15881234'), '1588-1234');
  assert.equal(formatPhone('<b>'), '');
});

test('OG-EC-2 tel safety: the only call link is "tel:" + checked digits (or 119 / 112); no other scheme is ever built', () => {
  assert.equal(telHref('01012345678'), 'tel:01012345678');
  assert.equal(telHref('119'), 'tel:119');
  assert.equal(telHref('112'), 'tel:112');
  for (const bad of ['010-1234-5678', '+821012345678', 'tel:01012345678', 'javascript:alert(1)', 'sms:01012345678', '01012345678;ext=1', '0101234567890', '', null, 110, '911', '1339']) assert.equal(telHref(bad), '', String(bad));
  assert.deepEqual(PUBLIC_EMERGENCY_NUMBERS.map((p) => [p.number, p.label]), [['119', '119 — 응급·구급'], ['112', '112 — 경찰']]);
  /* in the code: every href comes from telHref; no sms:, mailto:, intent:, window.open, location change */
  assert.equal((CODE.match(/tel:/g) || []).length, 2, 'two literal tel: — both inside telHref');
  assert.match(CODE, /const href = telHref\(digits\);\s*if \(!href \|\| !doc\)/);
  assert.match(CODE, /go\.href = href;/);
  assert.equal(/sms:|mailto:|intent:|window\.open|location\.(href|assign|replace)|\.click\(\)/.test(CODE), false);
  assert.equal(/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(CODE), false, 'no HTML strings: the number is a text node');
  /* other modules still have no tel: at all */
  for (const [f, src] of Object.entries(JS)) if (f !== 'emergency-contacts.js') assert.equal(/tel:/i.test(code(src)), false, f);
});

test('OG-EC-3 contract: bounded text, known relation, checked phone, one id format, unexpected fields dropped', () => {
  /* stored JSON with an own "__proto__" key (what a tampered value would hold) and fields the contract does not know */
  const input = JSON.parse(`{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"isAdmin":true,"html":"<img src=x onerror=alert(1)>"}`);
  Object.assign(input, { id: 'ec_abc12345', name: `  김${'가'.repeat(50)}  `, relation: 'child', phone: '010-1234-5678', memo: `메모\u0007${'나'.repeat(300)}`, order: 2, primary: true, createdAt: 1, updatedAt: 2 });
  const c = normalizeEmergencyContact(input, 9);
  /* an object with a foreign prototype is not a plain record and is refused */
  assert.throws(() => normalizeEmergencyContact({ __proto__: { polluted: true }, id: 'ec_abc12345', name: 'x', phone: '01012345678' }), (e) => e.code === 'INVALID_CONTACT');
  assert.deepEqual(Object.keys(c), ['schemaVersion', 'id', 'name', 'relation', 'phone', 'order', 'primary', 'createdAt', 'updatedAt', 'memo']);
  assert.equal(c.name.length, EMERGENCY_LIMITS.name);
  assert.equal(c.memo.length, EMERGENCY_LIMITS.memo);
  assert.equal(/\u0007/.test(c.memo), false, 'control characters removed');
  assert.equal(c.phone, '01012345678');
  assert.equal(({}).polluted, undefined);
  assert.equal(normalizeEmergencyContact({ id: 'ec_abc12345', name: '이웃', relation: 'boss', phone: '01012345678' }).relation, 'other');
  for (const [input, code] of [[{ id: 'ec_abc12345', name: ' ', phone: '01012345678' }, 'INVALID_NAME'], [{ id: 'ec_abc12345', name: '엄마', phone: '12' }, 'INVALID_PHONE'], [{ id: 'ev_abc12345', name: '엄마', phone: '01012345678' }, 'INVALID_ID'], [{ id: 'ec_<x>', name: '엄마', phone: '01012345678' }, 'INVALID_ID'], ['x', 'INVALID_CONTACT']]) {
    assert.throws(() => normalizeEmergencyContact(input), (e) => e.code === code, code);
  }
  assert.deepEqual(CONTACT_RELATIONS.map((r) => r.id), ['spouse', 'child', 'sibling', 'parent', 'relative', 'friend', 'neighbor', 'carer', 'other']);
  assert.equal(relationLabel('child'), '자녀');
  assert.equal(relationLabel('nope'), '그 밖의 관계');
});

test('OG-EC-4 add / edit / delete / list, kept after reload; empty list is honest; the limit is enforced', () => {
  const w = world();
  assert.deepEqual(w.store.list(), []);
  const a = must(w.store.add({ name: '김민수', relation: 'child', phone: '010-1111-2222', memo: '저녁에는 집 전화' }));
  const b = must(w.store.add({ name: '박영희', relation: 'neighbor', phone: '02-333-4444' }));
  assert.deepEqual(w.store.list().map((c) => [c.name, c.order, c.primary]), [['김민수', 1, false], ['박영희', 2, false]]);
  const u = w.store.update(b.id, { name: '박영희 이웃', phone: '+82 10-5555-6666', memo: '열쇠 있음', id: 'ec_hijack0001', order: 99 });
  assert.equal(u.ok, true);
  assert.deepEqual([u.contact.id, u.contact.name, u.contact.phone, u.contact.memo], [b.id, '박영희 이웃', '01055556666', '열쇠 있음'], 'id and order can not be changed by an edit');
  assert.deepEqual(w.store.update(b.id, { phone: '없는 번호' }), { ok: false, reason: 'INVALID_PHONE' });
  assert.deepEqual(w.store.update(b.id, { name: '' }), { ok: false, reason: 'INVALID_NAME' });
  assert.deepEqual(w.store.update('ec_nothere0001', { name: 'x' }), { ok: false, reason: 'NOT_FOUND' });
  assert.equal('memo' in w.store.update(a.id, { memo: '' }).contact, false, 'a cleared memo is not stored');
  /* reload */
  assert.deepEqual(w.reopen().list().map((c) => c.name), ['김민수', '박영희 이웃']);
  /* delete; a second delete finds nothing; orders are renumbered */
  assert.deepEqual(w.store.remove(a.id), { ok: true });
  assert.deepEqual(w.store.remove(a.id), { ok: false, reason: 'NOT_FOUND' });
  assert.deepEqual(w.reopen().list().map((c) => [c.name, c.order]), [['박영희 이웃', 1]]);
  /* limit */
  for (let i = w.store.count(); i < EMERGENCY_LIMITS.contacts; i++) must(w.store.add({ name: `연락처 ${i}`, phone: `010-0000-${String(1000 + i)}` }));
  assert.deepEqual(w.store.add({ name: '열한 번째', phone: '010-9999-9999' }), { ok: false, reason: 'LIMIT' });
  assert.equal(w.store.count(), EMERGENCY_LIMITS.contacts);
});

test('OG-EC-5 priority (위로 / 아래로) and one 주 연락처 that is called first', () => {
  const w = world();
  const a = must(w.store.add({ name: 'A', phone: '01011111111' }));
  const b = must(w.store.add({ name: 'B', phone: '01022222222' }));
  const c = must(w.store.add({ name: 'C', phone: '01033333333' }));
  assert.deepEqual(w.store.move(c.id, -1), { ok: true, order: 2 });
  assert.deepEqual(w.store.list().map((x) => x.name), ['A', 'C', 'B']);
  assert.deepEqual(w.store.move(a.id, -1), { ok: false, reason: 'AT_EDGE' });
  assert.deepEqual(w.store.move(b.id, 1), { ok: false, reason: 'AT_EDGE' });
  assert.equal(w.store.setPrimary(b.id).ok, true);
  assert.deepEqual(w.store.list().map((x) => [x.name, x.order, x.primary]), [['B', 1, true], ['A', 2, false], ['C', 3, false]], 'the 주 연락처 is first');
  assert.equal(w.store.setPrimary(c.id).ok, true);
  assert.deepEqual(w.store.list().filter((x) => x.primary).map((x) => x.name), ['C'], 'only one 주 연락처');
  /* adding or editing with 주 연락처 = 예 moves the mark too */
  const d = must(w.store.add({ name: 'D', phone: '01044444444', primary: 'yes' }));
  assert.deepEqual(w.store.list().filter((x) => x.primary).map((x) => x.id), [d.id]);
  w.store.update(a.id, { primary: 'yes' });
  assert.deepEqual(w.store.list().map((x) => [x.name, x.primary]).slice(0, 1), [['A', true]]);
  assert.equal(w.store.list().filter((x) => x.primary).length, 1);
  /* damaged storage with two primaries and odd orders reads as one primary and orders 1…n */
  const v = world({ [`${KEY_PREFIX}emergencyContacts`]: JSON.stringify({ items: [{ id: 'ec_aaaa0001', name: 'X', phone: '01011112222', order: 7, primary: true }, { id: 'ec_aaaa0002', name: 'Y', phone: '01011113333', order: 3, primary: true }, { id: 'ec_aaaa0002', name: 'dup', phone: '01011114444' }, { id: 'ec_aaaa0003', name: 'bad', phone: 'x' }, null, 5, 'x'] }) });
  assert.deepEqual(v.store.list().map((x) => [x.name, x.order, x.primary]), [['Y', 1, true], ['X', 2, false]], 'duplicates and damaged rows skipped');
});

test('OG-EC-6 storage failure: blocked, full or corrupted storage never reports success', () => {
  /* a backend that refuses every write */
  const refusing = { ...createMemoryBackend(), kind: 'memory', setItem: () => { throw new Error('QuotaExceededError'); } };
  const w = world(undefined, refusing);
  assert.deepEqual(w.store.add({ name: '엄마', phone: '01012345678' }), { ok: false, reason: 'STORAGE_UNAVAILABLE' });
  assert.deepEqual(w.store.list(), []);
  /* a write that worked, then storage that fails: edit, move, primary and delete all say so */
  const backend = createMemoryBackend();
  const ok = world(undefined, backend);
  const a = must(ok.store.add({ name: '엄마', phone: '01012345678' }));
  must(ok.store.add({ name: '아빠', phone: '01012345679' }));
  backend.setItem = () => { throw new Error('blocked'); };
  assert.deepEqual(ok.store.update(a.id, { name: '어머니' }), { ok: false, reason: 'STORAGE_UNAVAILABLE' });
  assert.deepEqual(ok.store.move(a.id, 1), { ok: false, reason: 'STORAGE_UNAVAILABLE' });
  assert.deepEqual(ok.store.setPrimary(a.id), { ok: false, reason: 'STORAGE_UNAVAILABLE' });
  assert.deepEqual(ok.store.remove(a.id), { ok: false, reason: 'STORAGE_UNAVAILABLE' });
  assert.deepEqual(ok.store.list().map((c) => c.name), ['엄마', '아빠'], 'nothing changed');
  /* corrupted values read as empty, never throw */
  for (const bad of ['{not json', '[1,2]', '"x"', '12', 'null', '{"items":"x"}', '{"items":[null,{"id":"ec_aaaa0001"}]}']) assert.deepEqual(world({ [`${KEY_PREFIX}emergencyContacts`]: bad }).store.list(), [], bad);
  /* the list screen only says "지웠습니다" when the store wrote it, and save errors use the storage sentence */
  assert.match(JS['home-list.js'], /const removed = config\.onRemove\(item\.id\); if \(removed && removed\.ok === false\) \{ card\.say\(removeFailText\(removed, d\.title\)\);/);
  assert.match(JS['home-list.js'], /result\.reason === 'STORAGE_UNAVAILABLE' \|\| result\.reason === 'STORAGE_FULL' \? STORAGE_ERROR_TEXT/);
  assert.match(CODE, /if \(r\.ok\) card\.say\(`‘\$\{item\.name\}’을\(를\) \$\{r\.order\}번째로 옮겼어요\.`\);/);
  assert.match(CODE, /card\.say\(r\.ok \? `‘\$\{item\.name\}’을\(를\) 주 연락처로 정했어요\./);
});

test('OG-EC-7 erase: "ONGIL 데이터 삭제" removes the contacts; LIVON, the site and other products stay', () => {
  const w = world({ 'livon.platform.v1': '{"keep":1}', 'livon.mlStore.v1': '{"todos":[]}', 'newon-app-theme': 'dark', 'other.app': 'x' });
  must(w.store.add({ name: '엄마', phone: '01012345678' }));
  assert.ok(w.storage.list().includes('emergencyContacts'));
  assert.equal(w.storage.clear(), true);
  assert.deepEqual(w.store.list(), []);
  assert.deepEqual(w.backend.keys().sort(), ['livon.mlStore.v1', 'livon.platform.v1', 'newon-app-theme', 'other.app']);
  assert.ok(COLLECTIONS.includes('emergencyContacts'));
  assert.match(JS['app.js'], /onErased: \(\) => \{[\s\S]*emergencyView\.render\(\);/, 'the screen is redrawn empty after erase');
});

test('OG-EC-8 privacy: PRIVATE — never synced, searched, saved, shared, indexed or counted by content', () => {
  assert.equal(classOf('emergencyContacts'), 'PRIVATE');
  assert.equal(CONTRACT_CLASSES.EmergencyContact, 'PRIVATE');
  assert.equal(maySync('emergencyContacts'), false);
  assert.equal(maySearchGlobally('emergencyContacts'), false);
  assert.equal(familySharingAllowed(), false);
  assert.equal(SYNCABLE_COLLECTIONS.includes('emergencyContacts'), false);
  /* no other module reads the contacts: search, saved, family, community, notifications, analytics, instrumentation, the assistant */
  for (const [f, src] of Object.entries(JS)) {
    if (f === 'emergency-contacts.js' || f === 'app.js' || f === 'storage.js' || f === 'privacy.js' || f === 'assistant-tools.js') continue;
    assert.equal(/emergencyContacts|EmergencyContact|createEmergencyContact/.test(code(src)), false, f);
  }
  assert.equal(/track\(|instrument|analytics|fetch\(|XMLHttpRequest|sendBeacon|localStorage|saved\.|search\./.test(CODE), false, 'the module counts, sends and saves nothing elsewhere');
  /* no analytics event carries a contact; app.js does not wrap the store with instrumentation */
  assert.equal(EVENT_NAMES.some((n) => /contact|phone|call/i.test(n)), false);
  assert.match(JS['app.js'], /const emergencyContacts = createEmergencyContactStore\(storage\);/, 'not instrument.*(…) — nothing is counted');
  /* nothing in the static page lists a person: no fake contact, no sample number */
  const html = read('index.html');
  assert.equal(/010-\d{4}-\d{4}|01[016789]\d{7,8}/.test(html), false);
  assert.equal(/\b010\d{8}\b|010-\d{4}-\d{4}/.test(CODE.replace(/예: 010-1234-5678/g, '')), false, 'the only number in the code is the form hint');
});

test('OG-EC-9 assistant boundary: a call request is never made — it offers 긴급 연락망 and reads no name, number or memo', async () => {
  const backend = createMemoryBackend();
  const storage = createStorage({ backend });
  const contacts = createEmergencyContactStore(storage);
  must(contacts.add({ name: '엄마', relation: 'parent', phone: '010-1234-5678', memo: '비밀 메모' }));
  const saved = createSavedStore(storage);
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createSavedProvider(saved, SAVED_TYPE_LABELS));
  const assistant = createAssistant({ schedule: createScheduleStore(storage), tasks: createTaskStore(storage), routines: createRoutineStore(storage), saved, search, familyConnection });
  const before = backend.getItem(`${KEY_PREFIX}emergencyContacts`);
  for (const text of ['엄마한테 전화해줘', '긴급 연락처에 전화해줘', '아들에게 전화 걸어줘']) {
    const r = await assistant.handle(text);
    const out = JSON.stringify(r);
    assert.equal(r.intent, 'NOT_AVAILABLE', text);
    assert.equal(r.result.route, '#health', text);
    assert.equal(r.result.routeLabel, '긴급 연락망 열기');
    assert.match(r.result.message, /전화는 ONGIL 도우미가 걸지 않아요\. 긴급 연락망을 열어 드릴게요\./);
    assert.equal(r.result.navigate, undefined, 'offered as a link, not an automatic move');
    for (const secret of ['tel:', '01012345678', '010-1234-5678', '비밀 메모']) assert.equal(out.includes(secret), false, `${text}: ${secret}`);
  }
  assert.equal(backend.getItem(`${KEY_PREFIX}emergencyContacts`), before, 'nothing written');
  assert.ok(NO_WRITE_AREAS.includes('emergencyContacts'));
  /* the assistant modules cannot reach the store */
  for (const f of ['assistant-intents.js', 'assistant-tools.js', 'assistant-view.js']) assert.equal(/createEmergencyContact|emergency-contacts|listContacts|\.phone\b/.test(code(JS[f])), false, f);
  /* an emergency word still tells the person to call 119 themselves */
  const e = await assistant.handle('응급이야 119');
  assert.equal(e.intent, 'HEALTH_SAFETY');
  assert.match(e.result.message, /119에 직접 전화해 주세요/);
});

test('OG-EC-10 calling needs a confirmation; nothing calls on load; no "call done" wording', () => {
  /* the row button opens the dialog — it is not itself a link */
  assert.match(CODE, /'data-og-contact-call': item\.id, 'aria-label': `‘\$\{item\.name\}’에게 전화하기`, text: '전화하기', onclick: \(event\) => confirmCall\(\{ name: item\.name, digits: item\.phone \}, event\.currentTarget\) \}\)/);
  assert.equal(/el\('a', \{[^}]*href: /.test(CODE), false, 'no link is built from a template');
  /* the dialog: "[이름]님에게 전화할까요?", the number as text, 전화 걸기 (the tel: link) and 취소 */
  assert.match(CODE, /const toWhom = \(name\) => \(\/\\\)\$\/\.test\(name\) \? `\$\{name\}에` : `\$\{name\}님에게`\);/);
  assert.match(CODE, /text: `\$\{toWhom\(name\)\} 전화할까요\?` \}\)/);
  assert.match(CODE, /el\('a', \{ class: 'og-btn og-btn--primary', 'data-og-call-go': digits, text: '전화 걸기' \}\)/);
  assert.match(CODE, /'data-og-call-cancel': 'true', text: '취소', onclick: \(\) => d\.close\(\) \}/);
  /* after the press: "asked the phone app to open" — never "called" or "connected" */
  assert.match(CODE, /전화 앱 열기를 요청했어요\. 통화 연결 여부는 ONGIL이 알 수 없어요\./);
  assert.match(EMERGENCY_NOTE, /ONGIL은 전화를 대신 걸지 않아요\./);
  for (const word of ['전화 완료', '통화 완료', '연결되었습니다', '신고 완료', '신고했', '구급차 요청', '구급차를 불렀', '출동']) assert.equal(SRC.includes(word), false, word);
  assert.match(CODE, /ONGIL은 신고하거나 구급차를 부르지 않아요\./);
  /* nothing runs a call by itself: no showModal, click or tel: on load, timer, focus or storage events */
  assert.equal(/setTimeout|setInterval|addEventListener\('(load|focus|visibilitychange|storage)'/.test(CODE), false);
  assert.match(CODE, /if \(!d\.open && typeof d\.showModal === 'function'\) d\.showModal\(\);/, 'a browser without <dialog> support simply does nothing');
  /* the dialog: Tab is kept inside, Escape closes it (native), focus returns to the opener */
  assert.match(CODE, /if \(event\.key !== 'Tab'\) return;/);
  assert.match(CODE, /if \(opener && opener\.isConnected\) opener\.focus\(\);/);
  assert.match(CODE, /'aria-labelledby': 'og-call-title', 'aria-describedby': 'og-call-note'/);
});

test('OG-EC-11 the screen: honest empty state, labelled fields (tel input), alert errors, confirmed deletes, 44px rows, wraps at 320px', () => {
  assert.match(CODE, /emptyText: '등록된 긴급 연락처가 없습니다\.'/);
  for (const label of ['이름', '관계', '전화번호', '메모', '주 연락처']) assert.ok(CODE.includes(`label: '${label}'`), label);
  assert.match(CODE, /name: 'phone', label: '전화번호', type: 'tel', required: true, maxlength: 20, errors: \['INVALID_PHONE'\], hint: '예: 010-1234-5678'/);
  assert.match(JS['home-ui.js'], /inputmode: amount \? 'numeric' : type === 'tel' \? 'tel' : null/);
  assert.match(CODE, /INVALID_PHONE: '전화번호를 다시 확인해 주세요\. 숫자와 - 만 적을 수 있어요\. 예: 010-1234-5678'/);
  assert.match(JS['home-list.js'], /el\('p', \{ class: 'og-form-error', role: 'alert' \}\)/);
  assert.match(JS['home-list.js'], /을\(를\) 지울까요\? 되돌릴 수 없습니다\./);
  for (const name of ['우선순위 올리기', '우선순위 내리기', '주 연락처로 정하기', '에게 전화하기']) assert.ok(CODE.includes(name), name);
  /* the rows' buttons wrap on a phone; buttons keep the shared 44px rules; the dialog is the shared one (fits 320px) */
  assert.match(LIFE_CSS, /\[data-og-slot="health\.contacts-list"\] \.og-home-item__actions \{ flex-wrap: wrap; width: 100%; \}/);
  assert.match(read('styles', 'ongil-app.css'), /\.og-dialog \{ width: min\(34rem, calc\(100vw - 2rem\)\);/);
  assert.match(read('styles', 'ongil-tokens.css'), /--og-control: 2\.75rem;/);
  /* 건강·안부 lists it as built, and it is placed first among the screen's own cards */
  assert.deepEqual(AREAS.find((a) => a.id === 'health').modules.filter((m) => !m.available).map((m) => m.id), ['help']);
  assert.match(JS['app.js'], /if \(extraHost\) extraHost\.prepend\(emergencyView\.card\.root\);/);
  assert.match(JS['app.js'], /if \(view === 'health'\) \{\s*healthSchedule\.render\(\);\s*emergencyView\.render\(\);/);
});
