/*
 * An editable list inside a card — used by Home (오늘 일정, 복약) and by every list in My Life.
 *
 * States: EMPTY (nothing yet) · FILLED · adding · editing one item · confirming a delete.
 * Deleting always asks first. Every change is announced through the card's status line, and focus goes
 * somewhere sensible after each step (the new form, the button that opened it, or the card heading).
 *
 * config
 *   itemName · listLabel · emptyText · addLabel · note
 *   fields[]                 form fields (see makeField); field.initial = value or () => value for a new item
 *   getItems() · describe(item) → { title, meta[], text? }
 *   onAdd(values) · onUpdate(id, values) · onRemove(id) · errorText(reason)
 *   checkable (default true): isDone(item) · onToggle(item, checked) · toggleText · doneWord · checkWord
 *   canAdd / canEdit (default true): a list that only shows and checks, e.g. today's routines; canAdd may be a function
 *   afterChange(): called after any change so the owner can refresh what depends on the list
 *   before() / after(): extra nodes above the list and below its buttons (a heading, links to the full screen)
 *   rowActions(item) (Completion V3): extra buttons placed before 고치기 / 지우기 on a row (e.g. 전화하기, 위로)
 *   A delete is announced only when the store says it was written; otherwise the row stays and the reason is shown.
 */
import { el, clear } from './dom.js';
import { makeField, eul } from './home-ui.js';

/* Phase 11: a long list is shown a page at a time (+ 더 보기), so a card never puts hundreds of rows in the page */
export const LIST_PAGE = 50;
export const STORAGE_ERROR_TEXT = '이 기기에 저장하지 못했어요. 브라우저의 저장 공간이 가득 찼거나 꺼져 있을 수 있어요. 오래된 기록을 지운 뒤 다시 해 주세요.';
/* Completion V3: a delete the store did not write is never announced as done */
const removeFailText = (r, title) => (r.reason === 'NOT_FOUND' ? `‘${title}’은(는) 이미 지워졌어요.` : STORAGE_ERROR_TEXT);

/* Product Completion Audit V1: Home and 내 생활 draw the same record in two cards that are both in the page, so a
   checkbox id is made unique per card — a label must tick its own box, not the one on a hidden screen */
let CARD_SEQ = 0;
const TOGGLE_FAIL_TEXT = '바꾸지 못했어요. 화면을 다시 연 뒤 한 번 더 해 주세요.';

export function createListCard({ card, config }) {
  const uid = ++CARD_SEQ;
  let mode = { type: 'idle', id: null };
  let shown = LIST_PAGE;
  /* a row the user is working on (or has just added) must be on screen even when it sorts past the first page */
  let keepVisible = null;
  let pendingFocus = null;
  const checkable = config.checkable !== false;
  const mayAdd = () => (typeof config.canAdd === 'function' ? config.canAdd() : config.canAdd !== false);
  const canEdit = config.canEdit !== false;
  const changed = () => typeof config.afterChange === 'function' && config.afterChange();

  function setMode(next, focus) {
    mode = next;
    pendingFocus = focus || null;
    render();
  }

  function form(item) {
    const fields = config.fields.map((f) => ({ spec: f, ...makeField(f, item ? (typeof f.read === 'function' ? f.read(item) : item[f.name]) : typeof f.initial === 'function' ? f.initial() : f.initial) }));
    const errorId = `og-list-error-${uid}-${item ? item.id : 'new'}`;
    const error = el('p', { class: 'og-form-error', role: 'alert' });
    error.id = errorId;
    const node = el(
      'form',
      { class: 'og-form og-home-form', novalidate: true, 'aria-label': item ? `${config.itemName} 고치기` : `${config.itemName} 추가` },
      fields.map((f) => f.node),
      error,
      el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', text: '저장' }), el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: '취소', onclick: () => setMode({ type: 'idle', id: null }, item ? `edit:${item.id}` : 'add') }))
    );
    /* Completion V2: Escape leaves the form the same way 취소 does, and focus goes back to the button that opened it */
    node.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setMode({ type: 'idle', id: null }, item ? `edit:${item.id}` : 'add');
    });
    node.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = Object.fromEntries(fields.map((f) => [f.spec.name, f.get()]));
      for (const f of fields) {
        f.input.removeAttribute('aria-invalid');
        if (f.described === undefined) f.described = f.input.getAttribute('aria-describedby') || '';
        if (f.described) f.input.setAttribute('aria-describedby', f.described);
        else f.input.removeAttribute('aria-describedby');
      }
      const result = item ? config.onUpdate(item.id, values) : config.onAdd(values);
      if (!result.ok) {
        const bad = fields.find((f) => f.spec.errors && f.spec.errors.includes(result.reason)) || fields[0];
        /* the message stays tied to its field, so it is read again when the field is focused later */
        bad.input.setAttribute('aria-describedby', bad.described ? `${bad.described} ${errorId}` : errorId);
        bad.input.setAttribute('aria-invalid', 'true');
        /* Phase 11: a write the browser refused (storage full or switched off) says so — "try again" alone does not help */
        error.textContent = result.reason === 'STORAGE_UNAVAILABLE' || result.reason === 'STORAGE_FULL' ? STORAGE_ERROR_TEXT : config.errorText(result.reason);
        bad.input.focus();
        return;
      }
      card.say(item ? `${config.itemName}${eul(config.itemName)} 고쳤습니다.` : `${config.itemName}${eul(config.itemName)} 추가했습니다.`);
      const saved = Object.values(result).find((v) => v && typeof v === 'object' && typeof v.id === 'string');
      keepVisible = item ? item.id : saved ? saved.id : null;
      changed();
      setMode({ type: 'idle', id: null }, item ? `edit:${item.id}` : 'add');
    });
    return { node, first: fields[0].input };
  }

  function mainOf(item, d, done) {
    const meta = d.meta.length ? el('p', { class: 'og-home-item__meta', text: d.meta.join(' · ') }) : null;
    const text = d.text ? el('p', { class: 'og-home-item__text', text: d.text }) : null;
    /* a row that is history only (Phase 11: a mark of a medication since removed from the plan) is shown, not changed */
    const locked = typeof config.isLocked === 'function' && config.isLocked(item);
    if (!checkable || locked) return el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: locked && done ? `${d.title} (${config.doneWord})` : d.title }), meta, text);
    const checkId = `og-check-${uid}-${item.id}`;
    const box = el('input', {
      type: 'checkbox',
      id: checkId,
      class: 'og-home-item__check',
      checked: done,
      onchange: (event) => {
        /* a mark the store did not write is never announced as done (the box goes back when the card redraws) */
        const r = config.onToggle(item, event.target.checked);
        const failed = r === false || (!!r && r.ok === false);
        if (failed) card.say(r && r.reason && r.reason !== 'STORAGE_UNAVAILABLE' && r.reason !== 'STORAGE_FULL' ? TOGGLE_FAIL_TEXT : STORAGE_ERROR_TEXT);
        else card.say(config.toggleText(item, event.target.checked));
        if (!failed) changed();
        setMode({ type: 'idle', id: null }, `check:${item.id}`);
      },
    });
    box.dataset.ogFocus = `check:${item.id}`;
    return el(
      'div',
      { class: 'og-home-item__main' },
      box,
      el('label', { for: checkId, class: 'og-home-item__label' }, el('span', { class: 'og-home-item__title', text: d.title }), done ? el('span', { class: 'og-home-item__done', text: ` (${config.doneWord})` }) : null, el('span', { class: 'visually-hidden', text: ` — ${config.checkWord}` })),
      meta,
      text
    );
  }

  function row(item) {
    if (mode.type === 'edit' && mode.id === item.id) {
      const f = form(item);
      if (pendingFocus === 'form') queueMicrotask(() => f.first.focus());
      return el('li', { class: 'og-home-item og-home-item--editing' }, f.node);
    }
    const d = config.describe(item);
    const done = checkable ? config.isDone(item) : false;
    const main = mainOf(item, d, done);
    if (mode.type === 'delete' && mode.id === item.id) {
      const cancel = el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: '취소', onclick: () => setMode({ type: 'idle', id: null }, `delete:${item.id}`) });
      if (pendingFocus === 'confirm') queueMicrotask(() => cancel.focus());
      return el(
        'li',
        { class: 'og-home-item og-home-item--confirm', 'data-og-item': item.id },
        main,
        el('div', { class: 'og-confirm', role: 'group', 'aria-label': '지우기 확인', onkeydown: (event) => { if (event.key === 'Escape') { event.preventDefault(); setMode({ type: 'idle', id: null }, `delete:${item.id}`); } } }, el('p', { text: `‘${d.title}’을(를) 지울까요? 되돌릴 수 없습니다.` }), el('div', { class: 'og-form__actions' }, cancel, el('button', { type: 'button', class: 'og-btn og-btn--danger', text: '지우기', onclick: () => { const removed = config.onRemove(item.id); if (removed && removed.ok === false) { card.say(removeFailText(removed, d.title)); setMode({ type: 'idle', id: null }, `delete:${item.id}`); return; } card.say(`‘${d.title}’을(를) 지웠습니다.`); changed(); setMode({ type: 'idle', id: null }, 'title'); } })))
      );
    }
    const actions = canEdit
      ? el(
          'div',
          { class: 'og-home-item__actions' },
          typeof config.rowActions === 'function' ? config.rowActions(item) : null,
          el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-focus': `edit:${item.id}`, 'aria-label': `‘${d.title}’ 고치기`, text: '고치기', onclick: () => setMode({ type: 'edit', id: item.id }, 'form') }),
          el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-focus': `delete:${item.id}`, 'aria-label': `‘${d.title}’ 지우기`, text: '지우기', onclick: () => setMode({ type: 'delete', id: item.id }, 'confirm') })
        )
      : null;
    return el('li', { class: done ? 'og-home-item is-done' : 'og-home-item', 'data-og-item': item.id }, main, actions);
  }

  function render() {
    const items = config.getItems();
    clear(card.body);
    card.root.dataset.ogState = items.length ? 'filled' : 'empty';
    if (config.before) card.body.append(config.before());
    if (items.length === 0 && mode.type !== 'add') card.body.append(el('p', { class: 'og-home-empty', text: typeof config.emptyText === 'function' ? config.emptyText() : config.emptyText }));
    const wanted = mode.id || keepVisible;
    if (wanted) {
      const at = items.findIndex((it) => it.id === wanted);
      if (at >= shown) shown = at + 1;
    }
    keepVisible = null;
    const page = items.slice(0, shown);
    if (items.length) card.body.append(el('ul', { class: 'og-home-items', 'aria-label': typeof config.listLabel === 'function' ? config.listLabel() : config.listLabel }, page.map(row)));
    if (items.length > page.length) {
      card.body.append(
        el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-focus': 'more', 'data-og-list-more': String(items.length - page.length), text: `더 보기 (${items.length - page.length}개 남음)`, onclick: () => { shown += LIST_PAGE; pendingFocus = 'more'; render(); } }))
      );
    }
    const canAdd = mayAdd();
    if (canAdd && mode.type === 'add') {
      const f = form(null);
      card.body.append(f.node);
      if (pendingFocus === 'form') queueMicrotask(() => f.first.focus());
    } else if (canAdd) {
      card.body.append(el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--primary', 'data-og-focus': 'add', text: config.addLabel, onclick: () => setMode({ type: 'add', id: null }, 'form') })));
    }
    if (config.after) {
      const extra = config.after();
      if (extra) card.body.append(extra);
    }
    if (config.note) card.body.append(el('p', { class: 'og-home-note', text: config.note }));
    if (pendingFocus && pendingFocus !== 'form' && pendingFocus !== 'confirm') {
      const target = pendingFocus === 'title' ? null : card.body.querySelector(`[data-og-focus="${pendingFocus}"]`);
      if (target) target.focus();
      else card.focusTitle();
    }
    pendingFocus = null;
  }

  return Object.freeze({ render, openAdd: () => setMode({ type: 'add', id: null }, 'form'), reset: () => { mode = { type: 'idle', id: null }; pendingFocus = null; shown = LIST_PAGE; render(); } });
}
