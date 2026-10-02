/* Small building blocks shared by the Home cards. */
import { el, announce } from './dom.js';

let uid = 0;
export const nextId = (prefix) => `og-home-${prefix}-${++uid}`;

/*
 * A Home card: <section> with a heading, a body the module fills, and a polite status line.
 * level 1–4 is the visual weight (1 = what the day is about, 4 = quiet shortcuts).
 */
export function createCard({ slot, title, level, lead }) {
  const titleId = nextId('title');
  const body = el('div', { class: 'og-home-card__body' });
  const status = el('p', { class: 'og-live og-home-card__status', role: 'status', 'aria-live': 'polite' });
  const root = el(
    'section',
    { class: `og-home-card og-home-card--l${level}`, 'data-og-slot': `home.${slot}`, 'data-og-available': 'true', 'aria-labelledby': titleId },
    el('h3', { class: 'og-home-card__title', id: titleId, tabindex: '-1', text: title }),
    lead ? el('p', { class: 'og-home-card__lead', text: lead }) : null,
    body,
    status
  );
  return { root, body, status, titleId, say: (message) => announce(status, message), focusTitle: () => root.querySelector('h3').focus() };
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
