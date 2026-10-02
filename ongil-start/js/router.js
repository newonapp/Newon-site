/*
 * ONGIL router — hash based, same convention the shell already used (html[data-og-view] + main > [data-og-screen]).
 *
 * Pure part (no DOM):   VIEWS · ROUTE_ALIASES · resolveView(hash) · hashFor(view)
 * Browser part:         createRouter({ win, doc, onChange })
 *
 * Old deep links keep working: #ongil-home, #learn, #profile, #settings, #support, #share.
 * A hash that is not a route (for example an in-page anchor) leaves the current view as it is.
 */
export const VIEWS = Object.freeze(['home', 'life', 'health', 'family', 'care', 'enjoy', 'community', 'store', 'saved', 'account']);
export const PRIMARY_VIEWS = Object.freeze(['home', 'life', 'health', 'family', 'care', 'enjoy', 'community', 'store']);
export const GLOBAL_VIEWS = Object.freeze(['saved', 'account']);
/* overlays are panels on top of the current view, not views */
export const OVERLAYS = Object.freeze(['search', 'notifications']);

export const ROUTE_ALIASES = Object.freeze({
  '': 'home',
  'ongil-home': 'home',
  home: 'home',
  life: 'life',
  health: 'health',
  family: 'family',
  share: 'family',
  care: 'care',
  enjoy: 'enjoy',
  learn: 'enjoy',
  community: 'community',
  store: 'store',
  saved: 'saved',
  account: 'account',
  profile: 'account',
  settings: 'account',
  support: 'home',
});

const CANONICAL = Object.freeze({ home: 'ongil-home' });

export function resolveView(hash) {
  const key = String(hash || '').replace(/^#/, '');
  return Object.prototype.hasOwnProperty.call(ROUTE_ALIASES, key) ? ROUTE_ALIASES[key] : null;
}
export function hashFor(view) {
  if (!VIEWS.includes(view)) return '#ongil-home';
  return `#${CANONICAL[view] || view}`;
}

export function createRouter({ win, doc, onChange }) {
  const html = doc.documentElement;
  let current = null;

  function apply(view, { userInitiated }) {
    const previous = current;
    current = view;
    html.dataset.ogView = view;
    for (const screen of doc.querySelectorAll('main > [data-og-screen]')) {
      const on = screen.getAttribute('data-og-screen') === view;
      screen.hidden = !on;
    }
    if (previous !== view) {
      if (previous !== null) win.scrollTo(0, 0);
      if (typeof onChange === 'function') onChange({ view, previous, userInitiated });
    }
  }

  function sync(userInitiated) {
    const view = resolveView(win.location.hash);
    if (view === null) {
      if (current === null) apply('home', { userInitiated: false });
      return;
    }
    apply(view, { userInitiated });
  }

  function go(view) {
    const target = hashFor(view);
    if (win.location.hash === target) sync(true);
    else win.location.hash = target;
  }

  win.addEventListener('hashchange', () => sync(true));

  return Object.freeze({ start: () => sync(false), go, current: () => current });
}
