/*
 * An editable list inside a Home card — used by 오늘 일정 and 복약.
 *
 * States: EMPTY (nothing yet) · FILLED · adding · editing one item · confirming a delete.
 * Deleting always asks first. Every change is announced through the card's status line, and focus goes
 * somewhere sensible after each step (the new form, the button that opened it, or the card heading).
 */
import { el, clear } from './dom.js';
import { textField } from './home-ui.js';

export function createListCard({ card, config }) {
  let mode = { type: 'idle', id: null };
  let pendingFocus = null;

  function setMode(next, focus) {
    mode = next;
    pendingFocus = focus || null;
    render();
  }

  function form(item) {
    const fields = config.fields.map((f) => ({ spec: f, ...textField({ ...f, value: item ? item[f.name] || '' : '' }) }));
    const error = el('p', { class: 'og-form-error', role: 'alert' });
    const node = el(
      'form',
      { class: 'og-form og-home-form', novalidate: true, 'aria-label': item ? `${config.itemName} 고치기` : `${config.itemName} 추가` },
      fields.map((f) => f.node),
      error,
      el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', text: '저장' }), el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: '취소', onclick: () => setMode({ type: 'idle', id: null }, item ? `edit:${item.id}` : 'add') }))
    );
    node.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = Object.fromEntries(fields.map((f) => [f.spec.name, f.input.value]));
      for (const f of fields) f.input.removeAttribute('aria-invalid');
      const result = item ? config.onUpdate(item.id, values) : config.onAdd(values);
      if (!result.ok) {
        const bad = fields.find((f) => f.spec.errors && f.spec.errors.includes(result.reason)) || fields[0];
        bad.input.setAttribute('aria-invalid', 'true');
        error.textContent = config.errorText(result.reason);
        bad.input.focus();
        return;
      }
      card.say(item ? `${config.itemName}을 고쳤습니다.` : `${config.itemName}을 추가했습니다.`);
      setMode({ type: 'idle', id: null }, item ? `edit:${item.id}` : 'add');
    });
    return { node, first: fields[0].input };
  }

  function row(item) {
    if (mode.type === 'edit' && mode.id === item.id) {
      const f = form(item);
      if (pendingFocus === 'form') queueMicrotask(() => f.first.focus());
      return el('li', { class: 'og-home-item og-home-item--editing' }, f.node);
    }
    const d = config.describe(item);
    const done = config.isDone(item);
    const checkId = `og-home-check-${item.id}`;
    const main = el(
      'div',
      { class: 'og-home-item__main' },
      el('input', { type: 'checkbox', id: checkId, class: 'og-home-item__check', checked: done, onchange: (event) => { config.onToggle(item, event.target.checked); card.say(config.toggleText(item, event.target.checked)); setMode({ type: 'idle', id: null }, `check:${item.id}`); } }),
      el('label', { for: checkId, class: 'og-home-item__label' }, el('span', { class: 'og-home-item__title', text: d.title }), done ? el('span', { class: 'og-home-item__done', text: ` (${config.doneWord})` }) : null, el('span', { class: 'visually-hidden', text: ` — ${config.checkWord}` })),
      d.meta.length ? el('p', { class: 'og-home-item__meta', text: d.meta.join(' · ') }) : null
    );
    if (mode.type === 'delete' && mode.id === item.id) {
      const cancel = el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: '취소', onclick: () => setMode({ type: 'idle', id: null }, `delete:${item.id}`) });
      if (pendingFocus === 'confirm') queueMicrotask(() => cancel.focus());
      return el(
        'li',
        { class: 'og-home-item og-home-item--confirm', 'data-og-item': item.id },
        main,
        el('div', { class: 'og-confirm', role: 'group', 'aria-label': '지우기 확인' }, el('p', { text: `‘${d.title}’을(를) 지울까요? 되돌릴 수 없습니다.` }), el('div', { class: 'og-form__actions' }, cancel, el('button', { type: 'button', class: 'og-btn og-btn--danger', text: '지우기', onclick: () => { config.onRemove(item.id); card.say(`‘${d.title}’을(를) 지웠습니다.`); setMode({ type: 'idle', id: null }, 'title'); } })))
      );
    }
    const edit = el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-focus': `edit:${item.id}`, 'aria-label': `‘${d.title}’ 고치기`, text: '고치기', onclick: () => setMode({ type: 'edit', id: item.id }, 'form') });
    const del = el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-focus': `delete:${item.id}`, 'aria-label': `‘${d.title}’ 지우기`, text: '지우기', onclick: () => setMode({ type: 'delete', id: item.id }, 'confirm') });
    main.querySelector('input').dataset.ogFocus = `check:${item.id}`;
    return el('li', { class: done ? 'og-home-item is-done' : 'og-home-item', 'data-og-item': item.id }, main, el('div', { class: 'og-home-item__actions' }, edit, del));
  }

  function render() {
    const items = config.getItems();
    clear(card.body);
    card.root.dataset.ogState = items.length ? 'filled' : 'empty';
    if (items.length === 0 && mode.type !== 'add') card.body.append(el('p', { class: 'og-home-empty', text: config.emptyText }));
    if (items.length) card.body.append(el('ul', { class: 'og-home-items', 'aria-label': config.listLabel }, items.map(row)));
    if (mode.type === 'add') {
      const f = form(null);
      card.body.append(f.node);
      if (pendingFocus === 'form') queueMicrotask(() => f.first.focus());
    } else {
      card.body.append(el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--primary', 'data-og-focus': 'add', text: config.addLabel, onclick: () => setMode({ type: 'add', id: null }, 'form') })));
    }
    if (config.note) card.body.append(el('p', { class: 'og-home-note', text: config.note }));
    if (pendingFocus && pendingFocus !== 'form' && pendingFocus !== 'confirm') {
      const target = pendingFocus === 'title' ? card.root.querySelector('h3') : card.body.querySelector(`[data-og-focus="${pendingFocus}"]`);
      if (target) target.focus();
    }
    pendingFocus = null;
  }

  return Object.freeze({ render, openAdd: () => setMode({ type: 'add', id: null }, 'form'), reset: () => { mode = { type: 'idle', id: null }; pendingFocus = null; render(); } });
}
