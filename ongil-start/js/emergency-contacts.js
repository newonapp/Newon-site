/*
 * 건강·안부 › 긴급 연락망 (Completion V3).
 *
 * People the user writes down to call quickly when they need help. It works with no family connection and no account:
 * the list is kept on this device only (collection `emergencyContacts`, privacy class PRIVATE — never synced, searched,
 * saved, shared with family, indexed or counted by content; the assistant never reads it).
 *
 *   EmergencyContact { schemaVersion, id, name, relation, phone, memo?, order, primary, createdAt, updatedAt }
 *     phone   digits only, checked here (0 + 8–10 digits, or a 1xxx-xxxx number); +82 is read as 0
 *     order   1 = called first (우선순위); primary = the one 주 연락처 (at most one)
 *
 * Calling: ONGIL never calls by itself. A row's 전화하기 opens a confirmation dialog ("[이름]님에게 전화할까요?"); only
 * the user's press on 전화 걸기 follows a `tel:` link built here from the checked digits — no other scheme is ever made.
 * ONGIL only asks the phone app to open. It cannot know whether a call connected and never says it did.
 * The public numbers (119, 112) are offered the same way — 직접 전화: the person presses and confirms — apart from the
 * user's own contacts; nothing reports anything or requests help.
 */
import { SCHEMA_VERSION, ContractError, isPlainObject, safeText } from './contracts.js';
import { newId, isId } from './life-contracts.js';
import { el, clear } from './dom.js';
import { createCard } from './home-ui.js';
import { createListCard } from './home-list.js';

export const EMERGENCY_LIMITS = Object.freeze({ contacts: 10, name: 30, memo: 100 });
const opt = (id, label) => Object.freeze({ id, label });
export const CONTACT_RELATIONS = Object.freeze([
  opt('spouse', '배우자'), opt('child', '자녀'), opt('sibling', '형제·자매'), opt('parent', '부모'), opt('relative', '친척'),
  opt('friend', '친구'), opt('neighbor', '이웃'), opt('carer', '돌봄 담당자'), opt('other', '그 밖의 관계'),
]);
export const PUBLIC_EMERGENCY_NUMBERS = Object.freeze([
  ...[['119', '응급·구급', '직접 전화'], ['112', '경찰', '직접 전화']].map(([number, what, how]) => Object.freeze({ number, label: `${number} — ${what}`, name: `${number}(${what})`, how })),
]);

/* ───────── phone numbers ───────── */

/* "010-1234-5678", "02 123 4567", "+82 10-1234-5678" → digits; anything else (letters, other symbols, too short/long) → '' */
export function normalizePhone(value) {
  if (typeof value !== 'string') return '';
  const t = value.trim();
  if (!/^\+?[0-9\s().-]{7,20}$/.test(t)) return '';
  let digits = t.replace(/[\s().-]/g, '');
  if (digits.startsWith('+')) {
    if (!digits.startsWith('+82')) return '';
    digits = `0${digits.slice(3).replace(/^0/, '')}`;
  }
  return /^(0\d{8,10}|1\d{7})$/.test(digits) ? digits : '';
}

/* digits → "010-1234-5678" / "02-123-4567" / "1588-1234" for reading (never stored this way) */
export function formatPhone(digits) {
  if (typeof digits !== 'string' || !/^\d+$/.test(digits)) return '';
  if (/^1\d{7}$/.test(digits)) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  if (digits.startsWith('02')) return digits.length === 9 ? `02-${digits.slice(2, 5)}-${digits.slice(5)}` : `02-${digits.slice(2, 6)}-${digits.slice(6)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return digits;
}

/* the ONLY place a call link is made: a checked contact number or a public emergency number, digits only — '' for anything else */
export function telHref(digits) {
  if (PUBLIC_EMERGENCY_NUMBERS.some((p) => p.number === digits)) return `tel:${digits}`;
  return typeof digits === 'string' && digits !== '' && normalizePhone(digits) === digits ? `tel:${digits}` : '';
}

/* ───────── contract ───────── */

const stamp = (value, fallback) => (Number.isSafeInteger(value) && value > 0 ? value : fallback);

export function normalizeEmergencyContact(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_CONTACT');
  if (!isId(input.id) || !input.id.startsWith('ec_')) throw new ContractError('INVALID_ID');
  const name = safeText(input.name, EMERGENCY_LIMITS.name);
  if (!name) throw new ContractError('INVALID_NAME');
  const phone = normalizePhone(typeof input.phone === 'string' ? input.phone : '');
  if (!phone) throw new ContractError('INVALID_PHONE');
  const relation = CONTACT_RELATIONS.some((r) => r.id === input.relation) ? input.relation : 'other';
  const order = Number.isInteger(input.order) && input.order >= 1 && input.order <= 100 ? input.order : 100;
  const out = { schemaVersion: SCHEMA_VERSION, id: input.id, name, relation, phone, order, primary: input.primary === true, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
  const memo = safeText(input.memo, EMERGENCY_LIMITS.memo);
  if (memo) out.memo = memo;
  return out;
}

export const relationLabel = (id) => (CONTACT_RELATIONS.find((r) => r.id === id) || CONTACT_RELATIONS[CONTACT_RELATIONS.length - 1]).label;

/* ───────── store ───────── */

const COLLECTION = 'emergencyContacts';
const byOrder = (a, b) => a.order - b.order || a.createdAt - b.createdAt || a.id.localeCompare(b.id);

export function createEmergencyContactStore(storage, { now = () => Date.now(), makeId = () => newId('ec', now()) } = {}) {
  /* damaged or duplicate entries are skipped; at most one primary survives (the first by order); orders are renumbered 1…n */
  function read() {
    const raw = storage.get(COLLECTION, null);
    const items = isPlainObject(raw) && Array.isArray(raw.items) ? raw.items : [];
    const seen = new Set();
    const out = [];
    for (const it of items) {
      try {
        const n = normalizeEmergencyContact(it, now());
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        out.push(n);
      } catch {
        /* skip */
      }
    }
    out.sort(byOrder);
    let primarySeen = false;
    return out.slice(0, EMERGENCY_LIMITS.contacts).map((c, i) => {
      const primary = c.primary && !primarySeen;
      if (primary) primarySeen = true;
      return { ...c, order: i + 1, primary };
    });
  }
  const write = (items) => storage.set(COLLECTION, { schemaVersion: SCHEMA_VERSION, items: items.map((c, i) => ({ ...c, order: i + 1 })) });
  const saved = (items, result) => (write(items) ? result : { ok: false, reason: 'STORAGE_UNAVAILABLE' });
  const fail = (e) => ({ ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_CONTACT' });
  const yes = (v) => v === true || v === 'yes';

  function add(input) {
    const src = isPlainObject(input) ? input : {};
    const items = read();
    if (items.length >= EMERGENCY_LIMITS.contacts) return { ok: false, reason: 'LIMIT' };
    let contact;
    try {
      contact = normalizeEmergencyContact({ id: makeId(), name: src.name, relation: src.relation, phone: src.phone, memo: src.memo, order: items.length + 1, primary: yes(src.primary), createdAt: now(), updatedAt: now() }, now());
    } catch (e) {
      return fail(e);
    }
    const next = contact.primary ? items.map((c) => ({ ...c, primary: false })) : items;
    next.push(contact);
    return saved(next, { ok: true, contact: { ...contact, order: next.length } });
  }

  function update(id, patch) {
    const items = read();
    const index = items.findIndex((c) => c.id === id);
    if (index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const p = isPlainObject(patch) ? patch : {};
    const allowed = {};
    for (const key of ['name', 'relation', 'phone', 'memo']) if (key in p) allowed[key] = p[key];
    if ('primary' in p) allowed.primary = yes(p.primary);
    let contact;
    try {
      contact = normalizeEmergencyContact({ ...items[index], ...allowed, id, createdAt: items[index].createdAt, updatedAt: now() }, now());
    } catch (e) {
      return fail(e);
    }
    let next = items.map((c, i) => (i === index ? contact : contact.primary ? { ...c, primary: false } : c));
    /* a contact made 주 연락처 here moves to the top, as with setPrimary */
    if (contact.primary && !items[index].primary) next = [contact, ...next.filter((c) => c.id !== id)];
    return saved(next, { ok: true, contact });
  }

  function remove(id) {
    const items = read();
    const next = items.filter((c) => c.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    return saved(next, { ok: true });
  }

  /* 우선순위: one step up (-1) or down (+1) */
  function move(id, step) {
    const items = read();
    const index = items.findIndex((c) => c.id === id);
    if (index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const to = index + (step < 0 ? -1 : 1);
    if (to < 0 || to >= items.length) return { ok: false, reason: 'AT_EDGE' };
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    return saved(next, { ok: true, order: to + 1 });
  }

  /* 주 연락처: exactly one, and it is called first */
  function setPrimary(id) {
    const items = read();
    const target = items.find((c) => c.id === id);
    if (!target) return { ok: false, reason: 'NOT_FOUND' };
    const next = [{ ...target, primary: true, updatedAt: now() }, ...items.filter((c) => c.id !== id).map((c) => ({ ...c, primary: false }))];
    return saved(next, { ok: true });
  }

  return Object.freeze({ list: read, get: (id) => read().find((c) => c.id === id) || null, add, update, remove, move, setPrimary, count: () => read().length });
}

/* ───────── screen ───────── */

export const EMERGENCY_NOTE = 'ONGIL은 전화를 대신 걸지 않아요. 연락처를 고르고 한 번 더 확인하면 이 기기의 전화 앱이 열려요. 통화가 연결됐는지는 ONGIL이 알 수 없어요.';
const ERRORS = Object.freeze({
  INVALID_NAME: '이름을 적어 주세요.',
  INVALID_PHONE: '전화번호를 다시 확인해 주세요. 숫자와 - 만 적을 수 있어요. 예: 010-1234-5678',
  LIMIT: `긴급 연락처는 ${EMERGENCY_LIMITS.contacts}명까지 적어 둘 수 있어요.`,
});
const PRIMARY_OPTIONS = Object.freeze([opt('no', '아니요'), opt('yes', '예, 주 연락처로 정해요')]);

export function createEmergencyContacts({ host, store, doc = typeof document !== 'undefined' ? document : null }) {
  const card = createCard({ area: 'health', slot: 'contacts-list', title: '긴급 연락망', level: 2, lead: '도움이 필요할 때 바로 연락할 사람을 적어 두세요. 가족 연결이 없어도 쓸 수 있고, 이 기기에만 저장돼요.' });
  let dialog = null;
  let opener = null;

  /* one confirmation dialog: Tab stays inside, Escape closes (native), focus returns to the button that opened it */
  function ensureDialog() {
    if (dialog) return dialog;
    dialog = el('dialog', { class: 'og-dialog og-call-dialog', id: 'og-call-confirm', 'aria-labelledby': 'og-call-title', 'aria-describedby': 'og-call-note' });
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll('a[href], button:not([disabled]), #og-call-title')].filter((n) => n.getClientRects().length);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.addEventListener('close', () => {
      clear(dialog);
      if (opener && opener.isConnected) opener.focus();
      else card.focusTitle();
      opener = null;
    });
    doc.body.append(dialog);
    return dialog;
  }

  /* "엄마님에게" for a person, "<번호>(응급·구급)에" for a public number */
  const toWhom = (name) => (/\)$/.test(name) ? `${name}에` : `${name}님에게`);

  function confirmCall({ name, digits, how = '' }, from) {
    const href = telHref(digits);
    if (!href || !doc) {
      card.say('이 번호로는 전화 앱을 열 수 없어요. 번호를 다시 확인해 주세요.');
      return;
    }
    const d = ensureDialog();
    opener = from || null;
    clear(d);
    const go = el('a', { class: 'og-btn og-btn--primary', 'data-og-call-go': digits, text: '전화 걸기' });
    /* the checked tel: link is set as a property — dom.js keeps every other link to #, / and https only */
    go.href = href;
    go.addEventListener('click', () => {
      card.say(`${toWhom(name)} 전화하도록 전화 앱 열기를 요청했어요. 통화 연결 여부는 ONGIL이 알 수 없어요.`);
      d.close();
    });
    d.append(
      el(
        'div',
        { class: 'og-dialog__body' },
        el('p', { class: 'og-dialog__progress', text: how || '전화하기' }),
        el('h2', { class: 'og-dialog__title', id: 'og-call-title', tabindex: '-1', text: `${toWhom(name)} 전화할까요?` }),
        el('p', { class: 'og-call-number', text: formatPhone(digits) || digits }),
        el('p', { class: 'og-home-note', id: 'og-call-note', text: EMERGENCY_NOTE }),
        el('div', { class: 'og-dialog__actions' }, go, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-call-cancel': 'true', text: '취소', onclick: () => d.close() }))
      )
    );
    if (!d.open && typeof d.showModal === 'function') d.showModal();
    const title = d.querySelector('#og-call-title');
    if (title) title.focus();
  }

  const moveBy = (item, step, word) => {
    const r = store.move(item.id, step);
    if (r.ok) card.say(`‘${item.name}’을(를) ${r.order}번째로 옮겼어요.`);
    else card.say(r.reason === 'AT_EDGE' ? `‘${item.name}’은(는) 이미 ${word === '위로' ? '맨 위' : '맨 아래'}예요.` : ERRORS[r.reason] || '저장하지 못했어요. 브라우저의 저장 공간이 가득 찼거나 꺼져 있을 수 있어요.');
    list.reset();
    const again = card.body.querySelector(`[data-og-contact-move="${item.id}:${step}"]`);
    if (again) again.focus();
  };

  const list = createListCard({
    card,
    config: {
      itemName: '긴급 연락처',
      listLabel: '긴급 연락처 목록 (우선순위 순)',
      emptyText: '등록된 긴급 연락처가 없습니다.',
      addLabel: '긴급 연락처 추가',
      checkable: false,
      fields: [
        { name: 'name', label: '이름', type: 'text', required: true, maxlength: EMERGENCY_LIMITS.name, errors: ['INVALID_NAME'] },
        { name: 'relation', label: '관계', type: 'select', required: true, options: CONTACT_RELATIONS, initial: 'child' },
        { name: 'phone', label: '전화번호', type: 'tel', required: true, maxlength: 20, errors: ['INVALID_PHONE'], hint: '예: 010-1234-5678', read: (item) => formatPhone(item.phone) },
        { name: 'memo', label: '메모', type: 'textarea', required: false, maxlength: EMERGENCY_LIMITS.memo, hint: `${EMERGENCY_LIMITS.memo}자까지. 예: 저녁에는 집 전화로` },
        { name: 'primary', label: '주 연락처', type: 'select', required: true, options: PRIMARY_OPTIONS, initial: 'no', read: (item) => (item.primary ? 'yes' : 'no') },
      ],
      getItems: () => store.list(),
      describe: (item) => ({ title: item.primary ? `${item.name} (주 연락처)` : item.name, meta: [relationLabel(item.relation), formatPhone(item.phone), `우선순위 ${item.order}`], text: item.memo || '' }),
      rowActions: (item) => [
        el('button', { type: 'button', class: 'og-btn og-btn--primary og-btn--small', 'data-og-contact-call': item.id, 'aria-label': `‘${item.name}’에게 전화하기`, text: '전화하기', onclick: (event) => confirmCall({ name: item.name, digits: item.phone }, event.currentTarget) }),
        el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-contact-move': `${item.id}:-1`, 'aria-label': `‘${item.name}’ 우선순위 올리기`, text: '위로', onclick: () => moveBy(item, -1, '위로') }),
        el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-contact-move': `${item.id}:1`, 'aria-label': `‘${item.name}’ 우선순위 내리기`, text: '아래로', onclick: () => moveBy(item, 1, '아래로') }),
        item.primary
          ? null
          : el('button', {
              type: 'button',
              class: 'og-btn og-btn--ghost og-btn--small',
              'data-og-contact-primary': item.id,
              'aria-label': `‘${item.name}’을(를) 주 연락처로 정하기`,
              text: '주 연락처로',
              onclick: () => {
                const r = store.setPrimary(item.id);
                card.say(r.ok ? `‘${item.name}’을(를) 주 연락처로 정했어요. 목록 맨 위에 있어요.` : '저장하지 못했어요. 브라우저의 저장 공간이 가득 찼거나 꺼져 있을 수 있어요.');
                list.reset();
                const call = card.body.querySelector(`[data-og-contact-call="${item.id}"]`);
                if (call) call.focus();
              },
            }),
      ],
      onAdd: (values) => store.add(values),
      onUpdate: (id, values) => store.update(id, values),
      onRemove: (id) => store.remove(id),
      errorText: (reason) => ERRORS[reason] || '저장하지 못했어요. 다시 시도해 주세요.',
      after: () =>
        el(
          'section',
          { class: 'og-call-public', 'aria-labelledby': 'og-call-public-title' },
          el('h4', { class: 'og-call-public__title', id: 'og-call-public-title', text: '공공 긴급전화' }),
          el('p', { class: 'og-home-note', text: '위급할 때는 직접 전화해 주세요. ONGIL은 신고하거나 구급차를 부르지 않아요.' }),
          el(
            'div',
            { class: 'og-form__actions' },
            PUBLIC_EMERGENCY_NUMBERS.map((p) => el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-call-public': p.number, text: p.label, onclick: (event) => confirmCall({ name: p.name, digits: p.number, how: p.how }, event.currentTarget) }))
          )
        ),
    },
  });
  list.render();
  if (host) host.append(card.root);
  return Object.freeze({ card, render: list.reset });
}
