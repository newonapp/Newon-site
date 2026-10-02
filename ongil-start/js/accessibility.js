/*
 * Accessibility foundation for the ONGIL shell.
 *
 *   text size     html[data-og-text] = default | large | xlarge  (the whole page scales, including the header)
 *   skip link     moves focus to the main region without changing the route
 *   view change   the document title names the view and focus moves to its first heading
 *   scroll cue    "살펴보기" buttons move to the content below a film and focus its heading
 */
const BASE_TITLE = 'Ongil';

export function applyPreferences(html, preferences) {
  html.dataset.ogText = preferences.textSize;
}

export function viewTitle(area) {
  return !area || area.id === 'home' ? BASE_TITLE : `${area.label} | ${BASE_TITLE}`;
}

export function focusNode(node) {
  if (!node) return;
  if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1');
  try {
    node.focus({ preventScroll: true });
  } catch {
    node.focus();
  }
}

export function focusView(doc, view) {
  const screen = doc.querySelector(`main > [data-og-screen="${view}"]`);
  if (screen) focusNode(screen.querySelector('h1'));
}

export function bindSkipLink(doc) {
  const link = doc.querySelector('[data-og-skip]');
  const main = doc.getElementById('og-main');
  if (!link || !main) return;
  link.addEventListener('click', (event) => {
    event.preventDefault();
    focusNode(main);
    main.scrollIntoView({ block: 'start' });
  });
}

export function bindScrollCues(doc, win) {
  doc.addEventListener('click', (event) => {
    const cue = event.target.closest('[data-og-scroll-to]');
    if (!cue) return;
    const target = doc.getElementById(`og-${cue.dataset.ogScrollTo}-section-title`);
    if (!target) return;
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    focusNode(target);
  });
}
