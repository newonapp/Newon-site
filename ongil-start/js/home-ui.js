/* Small building blocks shared by the Home cards. */
import { el, announce } from './dom.js';

let uid = 0;
export const nextId = (prefix) => `og-home-${prefix}-${++uid}`;

/*
 * A Home card: <section> with a heading, a body the module fills, and a polite status line.
 * level 1–4 is the visual weight (1 = what the day is about, 4 = quiet shortcuts).
 */
export function createCard({ area = 'home', slot, title, level, lead, heading = 'h3' }) {
  const titleId = nextId('title');
  const body = el('div', { class: 'og-home-card__body' });
  const status = el('p', { class: 'og-live og-home-card__status', role: 'status', 'aria-live': 'polite' });
  const titleNode = el(heading, { class: 'og-home-card__title', id: titleId, tabindex: '-1', text: title });
  const root = el(
    'section',
    { class: `og-home-card og-home-card--l${level}`, 'data-og-slot': `${area}.${slot}`, 'data-og-available': 'true', 'aria-labelledby': titleId },
    titleNode,
    lead ? el('p', { class: 'og-home-card__lead', text: lead }) : null,
    body,
    status
  );
  return { root, body, status, titleId, titleNode, say: (message) => announce(status, message), focusTitle: () => titleNode.focus() };
}

/* links from a Home card to the screen that holds the full list: [{ label, href }] */
export function moreLinks(links) {
  return el('p', { class: 'og-home-more' }, links.map((l) => el('a', { class: 'og-home-more__link', href: l.href, text: l.label })));
}

/* Korean object particle for a word: 일정 → 을, 생활비 → 를 (by whether the last syllable has a final consonant) */
export function eul(word) {
  const code = String(word).charCodeAt(String(word).length - 1);
  if (code < 0xac00 || code > 0xd7a3) return '을(를)';
  return (code - 0xac00) % 28 === 0 ? '를' : '을';
}

/* a button that shows whether it is the chosen one with a tick as well as the pressed state */
export function choiceButton({ label, pressed, onChoose, ariaLabel }) {
  return el('button', { type: 'button', class: 'og-pick', 'aria-pressed': pressed ? 'true' : 'false', 'aria-label': ariaLabel || null, onclick: onChoose }, el('span', { class: 'og-pick__mark', 'aria-hidden': 'true', text: pressed ? '✓' : '' }), el('span', { text: label }));
}

export function textField({ name, label, type = 'text', value = '', required = false, maxlength, hint }) {
  const id = nextId('field');
  const hintId = hint ? `${id}-hint` : null;
  const input = el('input', { class: 'og-input', id, name, type, value, maxlength: maxlength || null, required, 'aria-describedby': hintId, autocomplete: 'off' });
  return {
    input,
    node: el('div', { class: 'og-field' }, el('label', { class: 'og-field__label', for: id }, label, required ? null : el('span', { class: 'og-field__optional', text: ' (선택)' })), input, hint ? el('p', { class: 'og-field__hint', id: hintId, text: hint }) : null),
  };
}

/*
 * One form field from a spec. Types: text · time · date · amount · select · textarea · days (weekday checkboxes).
 * Returns { node, input (what receives focus), get() (the value to hand to the store) }.
 */
export function makeField(spec, value) {
  const { name, label, type = 'text', required = false, maxlength, hint, options = [], emptyLabel = '고르지 않음' } = spec;
  const id = nextId('field');
  const hintId = hint ? `${id}-hint` : null;
  const optional = required ? null : el('span', { class: 'og-field__optional', text: ' (선택)' });
  const hintNode = hint ? el('p', { class: 'og-field__hint', id: hintId, text: hint }) : null;

  if (type === 'days') {
    const chosen = Array.isArray(value) ? value : [];
    const boxes = options.map((o) => el('input', { type: 'checkbox', name, value: String(o.id), checked: chosen.includes(o.id) }));
    return {
      input: boxes[0],
      get: () => boxes.filter((b) => b.checked).map((b) => Number(b.value)),
      node: el('fieldset', { class: 'og-choices', 'aria-describedby': hintId }, el('legend', { class: 'og-field__label' }, label, optional), hintNode, el('div', { class: 'og-choices__list' }, options.map((o, i) => el('label', { class: 'og-choice og-choice--day' }, boxes[i], el('span', { text: o.label }))))),
    };
  }

  let input;
  if (type === 'select') {
    input = el('select', { class: 'og-input', id, name, 'aria-describedby': hintId }, required ? null : el('option', { value: '', text: emptyLabel, selected: !value }), options.map((o) => el('option', { value: o.id, text: o.label, selected: o.id === value })));
  } else if (type === 'textarea') {
    input = el('textarea', { class: 'og-input og-input--area', id, name, rows: '6', maxlength: maxlength || null, 'aria-describedby': hintId });
    input.value = value === undefined || value === null ? '' : String(value);
  } else {
    const amount = type === 'amount';
    input = el('input', { class: 'og-input', id, name, type: amount ? 'text' : type, inputmode: amount ? 'numeric' : type === 'tel' ? 'tel' : null, value: value === undefined || value === null ? '' : String(value), maxlength: maxlength || (amount ? 12 : null), required, 'aria-describedby': hintId, autocomplete: 'off' });
  }
  return { input, get: () => input.value, node: el('div', { class: 'og-field' }, el('label', { class: 'og-field__label', for: id }, label, optional), input, hintNode) };
}
