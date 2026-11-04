/*
 * DOM helpers. ONGIL never builds markup from strings: text goes in through textContent and
 * links through safeHref, so user input and stored values cannot inject HTML or script URLs.
 */
import { safeHref } from './contracts.js';

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = String(value);
    else if (key === 'href') {
      const safe = safeHref(String(value));
      if (safe) node.setAttribute('href', safe);
    } else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else if (key === 'checked' || key === 'disabled' || key === 'hidden' || key === 'selected' || key === 'required') node[key] = value === true;
    else if (key === 'value') node.value = String(value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  append(node, children);
  return node;
}

export function append(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function clear(node) {
  node.replaceChildren();
  return node;
}

/* polite status line: cleared first so the same message is announced again */
export function announce(node, message) {
  if (!node) return;
  node.textContent = '';
  window.requestAnimationFrame(() => {
    node.textContent = message;
  });
}

export function formatDate(ms) {
  try {
    return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(ms));
  } catch {
    return '';
  }
}
