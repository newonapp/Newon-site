#!/usr/bin/env node
/**
 * LIVON accessibility quality check — deterministic, no browser, no dependency.
 *
 *   node scripts/livon-accessibility-quality.mjs                 sources only (livon/index.html, Admin, Data Manager, CSS, JS)
 *   node scripts/livon-accessibility-quality.mjs --root _publish  also every generated static page under <root>/livon/
 *
 * What it can check (static markup and CSS):
 *   lang · title · one <main> · skip link · one H1 per screen · heading order · landmark names · image alt ·
 *   links/buttons without a name · form controls without a label · duplicate ids · ARIA references to missing ids ·
 *   unknown roles · tabs outside a tab list · interactive elements with a non-interactive role · positive tabindex ·
 *   focusable content inside aria-hidden · whole-page live regions · outline removal without a replacement ·
 *   reduced-motion coverage · declared text colours (contrast against white and near-black).
 *
 * What it cannot check, and reports as MANUAL REVIEW instead of PASS:
 *   colours whose background is not known statically · text over images or video · real focus order and focus
 *   visibility · target size after layout · screen-reader output. Those are covered by the browser QA described in
 *   docs/livon/LIVON_ACCESSIBILITY.md.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
export const ROLES = new Set(('alert alertdialog application article banner button cell checkbox columnheader combobox complementary contentinfo definition dialog directory document feed figure form grid gridcell group heading img link list listbox listitem log main marquee math menu menubar menuitem menuitemcheckbox menuitemradio meter navigation none note option presentation progressbar radio radiogroup region row rowgroup rowheader scrollbar search searchbox separator slider spinbutton status switch tab table tablist tabpanel term textbox timer toolbar tooltip tree treegrid treeitem').split(' '));
const NON_INTERACTIVE_ROLES = new Set(['listitem', 'list', 'group', 'region', 'article', 'presentation', 'none', 'img', 'heading', 'status', 'note']);

/* ---------- a small tolerant HTML tree (enough for attribute and structure checks) ---------- */
export function parseHtml(html) {
  const src = String(html).replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b([^>]*)>[\s\S]*?<\/\1>/gi, (m, t, a) => `<${t}${a}></${t}>`);
  const root = { tag: '#root', attrs: {}, children: [], parent: null };
  let cur = root;
  const re = /<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'=<>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[5] !== undefined) { if (m[5].trim()) cur.children.push({ text: m[5], parent: cur }); continue; }
    if (m[1]) {
      const t = m[1].toLowerCase();
      let p = cur;
      while (p && p.tag !== t) p = p.parent;
      if (p && p.parent) cur = p.parent;
      continue;
    }
    const tag = m[2].toLowerCase(), attrs = {};
    const ar = /([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let a;
    while ((a = ar.exec(m[3] || ''))) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? '';
    if (tag === 'p' && cur.tag === 'p') cur = cur.parent;                 /* implied </p> */
    if (tag === 'li' && cur.tag === 'li') cur = cur.parent;
    if (tag === 'option' && cur.tag === 'option') cur = cur.parent;
    const node = { tag, attrs, children: [], parent: cur };
    cur.children.push(node);
    if (!VOID.has(tag) && !m[4]) cur = node;
  }
  return root;
}
export function walk(node, fn) { for (const c of node.children || []) { if (c.tag) { fn(c); walk(c, fn); } } }
export function all(node, pred) { const out = []; walk(node, n => { if (pred(n)) out.push(n); }); return out; }
function closest(n, pred) { for (let p = n; p && p.tag; p = p.parent) if (pred(p)) return p; return null; }
function hiddenFromAT(n) { return !!closest(n, p => p.attrs['aria-hidden'] === 'true'); }
export function textOf(n) {
  let s = '';
  (function rec(x) {
    for (const c of x.children || []) {
      if (c.text !== undefined) { s += c.text; continue; }
      if (c.attrs['aria-hidden'] === 'true') continue;
      if (c.tag === 'img') { s += ' ' + (c.attrs.alt || '') + ' '; continue; }
      if (c.attrs['aria-label']) { s += ' ' + c.attrs['aria-label'] + ' '; continue; }
      rec(c);
    }
  })(n);
  return s.replace(/\s+/g, ' ').trim();
}
const isInteractive = n => (n.tag === 'a' && 'href' in n.attrs) || n.tag === 'button' || (n.tag === 'input' && n.attrs.type !== 'hidden') || n.tag === 'select' || n.tag === 'textarea' || n.tag === 'summary';
function sel(n) { return n.tag + (n.attrs.id ? '#' + n.attrs.id : '') + (n.attrs.class ? '.' + n.attrs.class.split(/\s+/)[0] : ''); }

/**
 * Checks one HTML document. opts.knownIds: ids that scripts create at run time (so a static reference to them is fine).
 * opts.screens: true for the app page — each main > [data-lv-screen] is one screen with its own H1.
 */
export function checkHtml(html, opts = {}) {
  const errors = [], warnings = [];
  const E = (rule, msg) => errors.push(`${rule}: ${msg}`);
  const W = (rule, msg) => warnings.push(`${rule}: ${msg}`);
  const root = parseHtml(html);
  const htmlEl = all(root, n => n.tag === 'html')[0];
  if (!htmlEl || !htmlEl.attrs.lang) E('lang', 'html has no lang');
  else if (opts.lang && htmlEl.attrs.lang !== opts.lang) E('lang', `html lang is "${htmlEl.attrs.lang}", expected "${opts.lang}"`);
  const title = all(root, n => n.tag === 'title')[0];
  if (!title || !textOf(title)) E('title', 'missing <title>');
  const mains = all(root, n => n.tag === 'main' || n.attrs.role === 'main');
  if (!opts.appShell) { if (mains.length !== 1) E('main', `${mains.length} main landmarks`); }
  /* skip link: the first link in the document goes to a fragment */
  const firstLink = all(root, n => n.tag === 'a' && 'href' in n.attrs)[0];
  if (!opts.noSkip && !(firstLink && /^#/.test(firstLink.attrs.href) && /skip/.test(firstLink.attrs.class || ''))) E('skip-link', 'the first link is not a skip link');

  /* ids and references */
  const ids = new Map();
  walk(root, n => { if (n.attrs.id !== undefined) { const v = n.attrs.id; if (!v || /\s/.test(v)) E('id', `invalid id "${v}" on ${sel(n)}`); ids.set(v, (ids.get(v) || 0) + 1); } });
  for (const [id, c] of ids) if (c > 1) E('duplicate-id', `#${id} ×${c}`);
  const known = opts.knownIds || new Set();
  walk(root, n => {
    for (const a of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'aria-activedescendant']) {
      if (!(a in n.attrs)) continue;
      for (const id of n.attrs[a].split(/\s+/).filter(Boolean)) if (!ids.has(id) && !known.has(id)) E('aria-reference', `${sel(n)} ${a}="${id}" has no target`);
    }
    if (n.tag === 'label' && n.attrs.for && !ids.has(n.attrs.for) && !known.has(n.attrs.for)) E('label-for', `label for="${n.attrs.for}" has no control`);
    if (n.attrs.role !== undefined) for (const r of n.attrs.role.split(/\s+/).filter(Boolean)) if (!ROLES.has(r)) E('role', `${sel(n)} role="${r}" is not an ARIA role`);
    if (isInteractive(n) && NON_INTERACTIVE_ROLES.has(n.attrs.role)) E('role-override', `${sel(n)} is interactive but has role="${n.attrs.role}"`);
    if (n.attrs.role === 'tab' && !closest(n.parent, p => p.attrs.role === 'tablist')) E('tabs', `${sel(n)} role="tab" outside a tablist`);
    if (n.attrs.role === 'tab' && !('aria-selected' in n.attrs)) E('tabs', `${sel(n)} tab without aria-selected`);
    if ((n.attrs.role === 'dialog' || n.attrs.role === 'alertdialog') && !(n.attrs['aria-label'] || n.attrs['aria-labelledby'])) E('dialog', `${sel(n)} dialog without a name`);
    if (n.attrs.role === 'dialog' && n.attrs['aria-modal'] !== 'true' && n.tag !== 'dialog') W('dialog', `${sel(n)} dialog without aria-modal`);
    if ('tabindex' in n.attrs && Number(n.attrs.tabindex) > 0) E('tabindex', `${sel(n)} has a positive tabindex`);
    if ('aria-pressed' in n.attrs && n.tag !== 'button' && n.attrs.role !== 'button') E('aria-pressed', `${sel(n)} is not a button`);
    if ('aria-selected' in n.attrs && !/^(tab|option|row|gridcell|treeitem)$/.test(n.attrs.role || '')) E('aria-selected', `${sel(n)} has aria-selected without a matching role`);
    if (n.attrs['aria-live'] && (n.tag === 'main' || n.tag === 'body' || /-app$/.test(n.attrs.id || ''))) E('live-region', `${sel(n)}: a live region around the whole page announces every change`);
  });
  /* images */
  for (const img of all(root, n => n.tag === 'img')) {
    if (!('alt' in img.attrs) && !hiddenFromAT(img) && img.attrs.role !== 'presentation') E('img-alt', `${sel(img)} ${img.attrs.src || ''} has no alt`);
    else if (/\.(png|jpe?g|webp|gif|svg)$/i.test(img.attrs.alt || '')) E('img-alt', `alt is a file name: ${img.attrs.alt}`);
  }
  /* names */
  for (const n of all(root, isInteractive)) {
    if (hiddenFromAT(n)) { if (closest(n, p => 'hidden' in p.attrs)) continue;   /* display:none while hidden — not focusable */
      if (!('tabindex' in n.attrs && Number(n.attrs.tabindex) < 0) && n.attrs.disabled === undefined) E('aria-hidden-focus', `${sel(n)} is focusable inside aria-hidden`); continue; }
    if (n.tag === 'input' || n.tag === 'select' || n.tag === 'textarea') {
      if (['submit', 'button', 'reset'].includes(n.attrs.type)) { if (!n.attrs.value && !n.attrs['aria-label']) E('control-name', `${sel(n)} has no value`); continue; }
      const labelled = n.attrs['aria-label'] || n.attrs['aria-labelledby'] || n.attrs.title || closest(n.parent, p => p.tag === 'label') ||
        (n.attrs.id && all(root, l => l.tag === 'label' && l.attrs.for === n.attrs.id).length);
      if (!labelled) E('label', `${sel(n)} ${n.attrs.name || n.attrs.type || ''} has no label` + (n.attrs.placeholder ? ' (placeholder is not a label)' : ''));
      continue;
    }
    const name = n.attrs['aria-label'] || (n.attrs['aria-labelledby'] ? 'x' : '') || textOf(n) || n.attrs.title;
    if (!name) E(n.tag === 'a' ? 'link-name' : 'button-name', `${sel(n)} ${n.attrs.href || ''} has no accessible name`);
    if (closest(n.parent, isInteractive)) E('nested-interactive', `${sel(n)} inside ${sel(closest(n.parent, isInteractive))}`);
  }
  /* landmarks: several navs need names; names must differ */
  const navs = all(root, n => (n.tag === 'nav' || n.attrs.role === 'navigation') && !hiddenFromAT(n));
  const scope = opts.screens ? null : root;
  const navCheck = list => {
    if (list.length < 2) return;
    const names = list.map(n => n.attrs['aria-label'] || n.attrs['aria-labelledby'] || '');
    names.forEach((x, i) => { if (!x) E('nav-name', `${sel(list[i])} has no name (${list.length} navigation landmarks)`); else if (names.indexOf(x) !== i) E('nav-name', `two navigation landmarks are named "${x}"`); });
  };
  /* headings */
  const headingCheck = (base, label) => {
    const hs = all(base, n => /^h[1-6]$/.test(n.tag) && !hiddenFromAT(n) && !closest(n, p => 'hidden' in p.attrs && p !== base));
    const h1 = hs.filter(h => (h.attrs['aria-level'] || h.tag[1]) === '1');
    if (h1.length !== 1) E('h1', `${label}: ${h1.length} H1`);
    let prev = 0;
    for (const h of hs) {
      const l = Number(h.attrs['aria-level'] || h.tag[1]);
      if (!textOf(h) && !opts.dynamicHeadings) E('heading-empty', `${label}: empty ${h.tag}`);
      if (prev && l > prev + 1) E('heading-order', `${label}: h${prev} → h${l} "${textOf(h).slice(0, 24)}"`);
      prev = l;
    }
  };
  if (opts.screens) {
    const screens = all(root, n => 'data-lv-screen' in n.attrs && n.parent && n.parent.tag === 'main');
    if (!screens.length) E('screens', 'no main > [data-lv-screen]');
    for (const s of screens) {
      if (!s.attrs['aria-label'] && !s.attrs['aria-labelledby']) E('screen-name', `screen ${s.attrs['data-lv-screen']} has no name`);
      if (opts.dynamicScreens && opts.dynamicScreens.includes(s.attrs['data-lv-screen'])) continue;   /* rendered by script */
      headingCheck(s, `screen ${s.attrs['data-lv-screen']}`);
      navCheck(all(s, n => (n.tag === 'nav' || n.attrs.role === 'navigation') && !hiddenFromAT(n) && !closest(n, p => 'hidden' in p.attrs)));
    }
  } else if (!opts.appShell) { headingCheck(root, 'page'); navCheck(navs); }
  return { errors, warnings, root };
}

/* ---------- colour ---------- */
export function hexToRgb(h) { let x = h.replace('#', ''); if (x.length === 3) x = x.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16)); }
export function luminance([r, g, b]) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
export function contrast(a, b) { const l1 = luminance(a), l2 = luminance(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
const WHITE = [255, 255, 255], INK = [10, 10, 10];
/** Text and UI colour pairs the product relies on — these are known pairs, so they are a real PASS/FAIL. */
export const TOKEN_PAIRS = [
  ['body text', '#0a0a0a', '#ffffff', 4.5], ['secondary text', '#404040', '#ffffff', 4.5], ['muted text', '#525252', '#ffffff', 4.5],
  ['meta text', '#737373', '#ffffff', 4.5], ['text on ink', '#ffffff', '#0a0a0a', 4.5], ['muted text on ink', '#a8a8a8', '#0a0a0a', 4.5],
  ['error text', '#b3261e', '#ffffff', 4.5], ['form field boundary', '#858585', '#ffffff', 3], ['admin field boundary', '#85827a', '#ffffff', 3],
  ['focus ring on white', '#0a0a0a', '#ffffff', 3], ['focus ring on ink', '#ffffff', '#0a0a0a', 3], ['static page answer box', '#0a0a0a', '#f6f6f6', 4.5],
  ['static page muted', '#737373', '#ffffff', 4.5], ['static page crumbs', '#525252', '#ffffff', 4.5]
];

/* ---------- CSS ---------- */
export function cssRules(css) {
  const out = [];
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) { const s = m[1].trim(); if (s.startsWith('@')) continue; out.push({ selector: s.replace(/\s+/g, ' '), body: m[2] }); }
  return out;
}
const stripFocus = s => s.replace(/:focus(-visible|-within)?/g, '').replace(/\s+/g, ' ').trim();
export function checkCss(files) {
  const errors = [], warnings = [], manual = [];
  const rules = [];
  for (const [name, css] of files) for (const r of cssRules(css)) rules.push({ ...r, file: name });
  /* 1. outline removal needs a replacement indicator (or the element is only a script focus target) */
  const indicator = b => /(?:^|;)\s*outline\s*:(?!\s*(?:none|0)\b)|box-shadow\s*:(?!\s*none)|border(?:-[a-z]+)?-color\s*:|border\s*:|background(?:-color)?\s*:|text-decoration/.test(b);
  const focusRules = rules.filter(r => /:focus/.test(r.selector) && indicator(r.body));
  let removed = 0;
  for (const r of rules) {
    if (!/outline\s*:\s*(none|0)\b/.test(r.body)) continue;
    for (const part of r.selector.split(',').map(s => s.trim())) {
      removed++;
      if (/\[tabindex="-1"\]|title|h[1-6]\b|__panel|\.ad-main|\.dm-main|data-lv-screen|heading/.test(part)) continue;   /* headings / containers focused by script */
      if (/::/.test(part)) continue;
      const base = stripFocus(part);
      const last = base.split(' ').pop();
      const wrapper = base.split(' ').slice(0, -1).join(' ');
      const ok = indicator(r.body) || focusRules.some(f => f.selector.split(',').some(fp => {
        const fb = stripFocus(fp.trim());
        return fb === base || (wrapper && (fb === wrapper || fb.endsWith(' ' + wrapper.split(' ').pop()))) || fb.endsWith(last) || (/:focus-within/.test(fp) && base.includes(stripFocus(fp.trim()).split(' ').pop()));
      })) || focusRules.some(f => /:is\(|:where\(/.test(f.selector) && /input|textarea|select/.test(f.selector) && /input|textarea|select/.test(last));
      if (!ok) errors.push(`outline-removal: ${r.file} "${part}" removes the outline and no focus rule replaces it`);
    }
  }
  /* 2. reduced motion: motion declared anywhere must be covered by a reduce rule */
  const allCss = files.map(f => f[1]).join('\n');
  const hasMotion = /(animation|transition)\s*:/.test(allCss);
  const globalReduce = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?animation-duration:\s*0?\.01ms\s*!important[\s\S]*?transition-duration:\s*0?\.01ms\s*!important/.test(allCss);
  if (hasMotion && !globalReduce) errors.push('reduced-motion: animations/transitions exist but no global prefers-reduced-motion rule neutralises them');
  if (/scroll-behavior:\s*smooth/.test(allCss) && !/prefers-reduced-motion:\s*reduce[\s\S]*?scroll-behavior:\s*auto/.test(allCss)) errors.push('reduced-motion: smooth scrolling is not switched off for reduced motion');
  if (/infinite/.test(allCss) && !globalReduce) errors.push('reduced-motion: an infinite animation is not stopped for reduced motion');
  /* 3. declared text colours */
  let colours = 0;
  for (const r of rules) {
    const m = /(?:^|;)\s*color\s*:\s*(#[0-9a-fA-F]{3,6})\b/.exec(r.body);
    if (!m) continue;
    if (/::placeholder|::before|::after|:disabled|\[disabled\]|\.is-done|:hover/.test(r.selector)) continue;   /* placeholder, decoration, inactive: outside 1.4.3 */
    colours++;
    const rgb = hexToRgb(m[1]);
    const onWhite = contrast(rgb, WHITE), onInk = contrast(rgb, INK);
    if (onWhite < 4.5 && onInk < 4.5) errors.push(`contrast: ${r.file} "${r.selector.slice(0, 70)}" ${m[1]} reaches 4.5:1 on neither white (${onWhite.toFixed(2)}) nor ink (${onInk.toFixed(2)})`);
    else if (onWhite < 4.5 && onInk < 12) manual.push(`${r.file} "${r.selector.slice(0, 70)}" ${m[1]} (white ${onWhite.toFixed(2)}, ink ${onInk.toFixed(2)}): passes only on a dark background`);
  }
  for (const [label, fg, bg, need] of TOKEN_PAIRS) {
    const c = contrast(hexToRgb(fg), hexToRgb(bg));
    if (c < need) errors.push(`contrast-token: ${label} ${fg} on ${bg} = ${c.toFixed(2)} < ${need}`);
  }
  /* 4. forced colours */
  if (!/@media\s*\(forced-colors:\s*active\)/.test(allCss)) warnings.push('forced-colors: no forced-colors rule');
  return { errors, warnings, manual, stats: { rules: rules.length, outlineRemovals: removed, colours, tokenPairs: TOKEN_PAIRS.length } };
}

/* ---------- markup inside script templates ---------- */
export function checkJsTemplates(files) {
  const errors = [];
  for (const [name, js] of files) {
    for (const m of js.matchAll(/<img\b[^>]*>/g)) if (!/\balt\s*=/.test(m[0])) errors.push(`img-alt: ${name} template <img> without alt: ${m[0].slice(0, 80)}`);
    for (const m of js.matchAll(/<(?:button|a)\b[^>]*\brole=\\?["'](listitem|list|presentation|none|heading|img)\\?["']/g)) errors.push(`role-override: ${name} interactive element with role="${m[1]}"`);
    for (const m of js.matchAll(/tabindex=\\?["']([1-9]\d*)\\?["']/g)) errors.push(`tabindex: ${name} positive tabindex ${m[1]}`);
    for (const m of js.matchAll(/<(?:div|span|p|li)\b[^>]*\bonclick=/g)) errors.push(`click-handler: ${name} click handler on a non-interactive element: ${m[0].slice(0, 60)}`);
  }
  return { errors };
}
/** ids that scripts create (so static aria references to them are valid once the script has rendered). */
export function idsInScripts(files) {
  const ids = new Set();
  for (const [, js] of files) {
    for (const m of js.matchAll(/\bid=\\?["']([A-Za-z][\w:.-]*)\\?["']/g)) ids.add(m[1]);
    for (const m of js.matchAll(/\.id\s*=\s*["']([A-Za-z][\w:.-]*)["']/g)) ids.add(m[1]);
    for (const m of js.matchAll(/setAttribute\(\s*["']id["']\s*,\s*["']([A-Za-z][\w:.-]*)["']/g)) ids.add(m[1]);
    for (const m of js.matchAll(/\bid=\\?["']([A-Za-z][\w:.-]*-)\\?["']?\s*\+/g)) ids.add(m[1] + '*');
  }
  return ids;
}

function listHtml(dir) {
  const out = [];
  (function rec(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) rec(p); else if (n === 'index.html') out.push(p); } })(dir);
  return out.sort();
}

export function checkSources(repo = REPO) {
  const read = p => readFileSync(join(repo, p), 'utf8');
  const livonJs = readdirSync(join(repo, 'livon')).filter(n => n.endsWith('.js')).map(n => ['livon/' + n, read('livon/' + n)]);
  const adminJs = ['livon/admin/admin-app.js', 'livon/admin/admin-service.js', 'livon/admin/data/data-manager.js'].map(n => [n, read(n)]);
  const sharedJs = ['site-chrome.js', 'lang-dropdown.js', 'lang-nav.js'].filter(n => existsSync(join(repo, n))).map(n => [n, read(n)]);
  const known = idsInScripts(livonJs.concat(sharedJs));
  const knownHas = { has: id => known.has(id) || [...known].some(k => k.endsWith('*') && id.startsWith(k.slice(0, -1))) };
  const errors = [], warnings = [], manual = [], stats = {};
  const add = (label, r) => { r.errors.forEach(e => errors.push(`[${label}] ${e}`)); (r.warnings || []).forEach(w => warnings.push(`[${label}] ${w}`)); };
  /* the app page: Help is rendered by help-page.js, so its screen has no static heading */
  add('livon/index.html', checkHtml(read('livon/index.html'), { lang: 'ko', screens: true, knownIds: knownHas, dynamicScreens: ['help'], dynamicHeadings: true }));
  add('livon/admin/index.html', checkHtml(read('livon/admin/index.html'), { appShell: true, knownIds: { has: () => true } }));
  add('livon/admin/data/index.html', checkHtml(read('livon/admin/data/index.html'), { appShell: true, knownIds: { has: () => true } }));
  const cssFiles = readdirSync(join(repo, 'livon')).filter(n => n.endsWith('.css')).map(n => ['livon/' + n, read('livon/' + n)])
    .concat([['livon/admin/admin.css', read('livon/admin/admin.css')], ['livon/admin/data/data-manager.css', read('livon/admin/data/data-manager.css')]]);
  const css = checkCss(cssFiles);
  css.errors.forEach(e => errors.push(`[css] ${e}`)); css.warnings.forEach(w => warnings.push(`[css] ${w}`)); css.manual.forEach(x => manual.push(x));
  Object.assign(stats, css.stats);
  const tpl = checkJsTemplates(livonJs.concat(adminJs));
  tpl.errors.forEach(e => errors.push(`[templates] ${e}`));
  /* the accessibility layer is loaded, last, by the app page */
  const app = read('livon/index.html');
  const scripts = [...app.matchAll(/<script src="([^"]+)"/g)].map(m => m[1].split('?')[0]);
  if (scripts[scripts.length - 1] !== '/livon/livon-a11y.js') errors.push('[livon/index.html] livon-a11y.js is not the last script');
  if (!/href="\/livon\/livon-a11y\.css/.test(app)) errors.push('[livon/index.html] livon-a11y.css is not loaded');
  const videos = (app.match(/<video\b/g) || []).length;
  if (videos && !/data-lv-motion-toggle/.test(read('livon/livon-a11y.js'))) errors.push('[motion] background videos exist but there is no pause control');
  stats.backgroundVideos = videos; stats.sourcePages = 3; stats.scriptFiles = livonJs.length + adminJs.length;
  return { errors, warnings, manual, stats };
}

export function checkPublished(root) {
  const errors = [], stats = { staticPages: 0 };
  const dir = join(root, 'livon');
  if (!existsSync(dir)) return { errors: [`${dir} does not exist`], stats };
  for (const f of listHtml(dir)) {
    const rel = relative(root, f);
    if (rel === join('livon', 'index.html')) continue;                       /* the app page is checked from source */
    const html = readFileSync(f, 'utf8');
    if (/http-equiv="refresh"/i.test(html)) continue;                         /* redirect stubs carry no content */
    stats.staticPages++;
    const r = checkHtml(html, { lang: 'ko' });
    r.errors.forEach(e => errors.push(`[${rel}] ${e}`));
    const root2 = r.root;
    const crumbs = all(root2, n => n.tag === 'nav' && /crumb/.test(n.attrs.class || ''))[0];
    if (crumbs && !all(crumbs, n => n.attrs['aria-current'] === 'page').length) errors.push(`[${rel}] breadcrumb: no aria-current="page"`);
    if (all(root2, n => n.tag === 'script' && n.attrs.type !== 'application/ld+json').length) errors.push(`[${rel}] static page loads a script`);
    for (const a of all(root2, n => n.tag === 'a' && n.attrs.target === '_blank')) if (!/새 창/.test(textOf(a))) errors.push(`[${rel}] new-window link does not say so: ${a.attrs.href}`);
  }
  return { errors, stats };
}

function main() {
  const args = process.argv.slice(2);
  const ri = args.indexOf('--root');
  const res = checkSources(REPO);
  let pub = null;
  if (ri >= 0) { pub = checkPublished(resolve(process.cwd(), args[ri + 1])); pub.errors.forEach(e => res.errors.push(e)); Object.assign(res.stats, pub.stats); }
  const line = `livon-accessibility-quality: ${res.errors.length} error(s), ${res.warnings.length} warning(s), ${res.manual.length} manual review · ${JSON.stringify(res.stats)}`;
  if (args.includes('--verbose') || res.errors.length) { res.errors.forEach(e => console.log('  ERROR ' + e)); res.warnings.forEach(w => console.log('  WARN  ' + w)); }
  if (args.includes('--verbose')) res.manual.forEach(m => console.log('  MANUAL ' + m));
  console.log(line + ' · static checks only (browser QA is separate)');
  if (res.errors.length) process.exit(1);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
