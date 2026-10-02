/*
 * ONGIL router — hash based, same convention the shell already used (html[data-og-view] + main > [data-og-screen]).
 *
 * Pure part (no DOM):   VIEWS · ROUTE_ALIASES · resolveView(hash) · hashFor(view)
 * Browser part:         createRouter({ win, doc, onChange })
 *
 * Old deep links keep working: #ongil-home, #learn, #profile, #settings, #support, #share.
 * A hash that is not a route (for example an in-page anchor) leaves the current view as it is.
 * A view may have sections: "#life/calendar" is the view "life" with the section "calendar" (Phase 2B).
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
  const key = String(hash || '').replace(/^#/, '').split('/')[0];
  return Object.prototype.hasOwnProperty.call(ROUTE_ALIASES, key) ? ROUTE_ALIASES[key] : null;
}
/* the part after the first "/": "#life/calendar" → "calendar"; none → "" */
export function sectionOf(hash) {
  const parts = String(hash || '').replace(/^#/, '').split('/');
  return parts.length === 2 && /^[a-z][a-z-]{0,30}$/.test(parts[1]) ? parts[1] : '';
}

export function hashFor(view) {
  if (!VIEWS.includes(view)) return '#ongil-home';
  return `#${CANONICAL[view] || view}`;
}

export function createRouter({ win, doc, onChange }) {
  const html = doc.documentElement;
  let current = null;
  let currentSection = '';

  function apply(view, { userInitiated, section = '' }) {
    const previous = current;
    const previousSection = currentSection;
    current = view;
    currentSection = section;
    html.dataset.ogView = view;
    for (const screen of doc.querySelectorAll('main > [data-og-screen]')) {
      const on = screen.getAttribute('data-og-screen') === view;
      screen.hidden = !on;
    }
    if (previous !== view) {
      if (previous !== null) win.scrollTo(0, 0);
      if (typeof onChange === 'function') onChange({ view, previous, userInitiated, section, sectionOnly: false });
    } else if (previousSection !== section && typeof onChange === 'function') {
      /* same view, another section: no scroll reset, the view decides where to go */
      onChange({ view, previous, userInitiated, section, sectionOnly: true });
    }
  }

  function sync(userInitiated) {
    const view = resolveView(win.location.hash);
    if (view === null) {
      if (current === null) apply('home', { userInitiated: false });
      return;
    }
    apply(view, { userInitiated, section: sectionOf(win.location.hash) });
  }

  function go(view) {
    const target = hashFor(view);
    if (win.location.hash === target) sync(true);
    else win.location.hash = target;
  }

  win.addEventListener('hashchange', () => sync(true));

  return Object.freeze({ start: () => sync(false), go, current: () => current, section: () => currentSection });
}
