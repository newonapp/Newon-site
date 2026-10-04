/*
 * ONGIL routes and content ownership (Phase 8) — the one place that says where a thing lives.
 *
 * Search results, saved items and notifications all point somewhere. Before Phase 8 each of them carried its own
 * href (sometimes an external page, sometimes a screen), so the same kind of thing could open in different places.
 * Now:
 *
 *   CONTENT_TYPES     every content type → label · owner screen · canonical route · scope · sync policy
 *   ownerRoute()      the screen that owns a type (optionally keeping a category the item already points at)
 *   safeRoute()       turns any text into a route INSIDE ONGIL, or '' — never an external address
 *   moduleRoute()     a menu entry → the section it names, when that section exists
 *   notificationRoute() a notification → its owner screen
 *
 * Pure: no DOM, no storage, no network. Nothing here opens a detail by id: the screens load public items only for
 * the visit, so an id cannot be promised to exist after a refresh. A route goes as far as the owner screen and,
 * where the item says so, its category.
 */
import { SAVED_TYPES, SAVED_TYPE_LABELS, savedSyncPolicy, safeHref } from './contracts.js';
import { resolveView, hashFor } from './router.js';
import { resolveSection } from './life-view.js';
import { resolveCareSection } from './care-view.js';
import { resolveEnjoySection } from './enjoy-view.js';
import { resolveCommunitySection } from './community-view.js';
import { resolveStoreSection } from './store-view.js';

export const SCOPES = Object.freeze(['PUBLIC', 'LOCAL_PRIVATE']);

/* canonical owner of each content type. A type has exactly one owner, whichever screen it was found on. */
const OWNERS = Object.freeze({
  SERVICE: Object.freeze({ owner: 'care', route: '#care' }),
  BENEFIT: Object.freeze({ owner: 'care', route: '#care' }),
  FACILITY: Object.freeze({ owner: 'care', route: '#care/facility' }),
  PROGRAM: Object.freeze({ owner: 'enjoy', route: '#enjoy' }),
  PLACE: Object.freeze({ owner: 'enjoy', route: '#enjoy' }),
  POST: Object.freeze({ owner: 'community', route: '#community' }),
  PRODUCT: Object.freeze({ owner: 'store', route: '#store' }),
});
const OWNER_LABELS = Object.freeze({ care: '돌봄·서비스', enjoy: '즐길거리', community: '커뮤니티', store: '스토어' });

/*
 * The registry. Built from the Saved contract (types, labels, sync policy) so there is one list, not two.
 *   scope      PUBLIC — public information from a source · LOCAL_PRIVATE — the user's own writing on this device
 *   external   whether an item of this type may carry a link to an outside page (a source or a seller)
 */
export const CONTENT_TYPES = Object.freeze(
  Object.fromEntries(
    SAVED_TYPES.map((id) => {
      const local = savedSyncPolicy(id) === 'LOCAL_ONLY';
      return [id, Object.freeze({ id, label: SAVED_TYPE_LABELS[id], owner: OWNERS[id].owner, ownerLabel: OWNER_LABELS[OWNERS[id].owner], route: OWNERS[id].route, scope: local ? 'LOCAL_PRIVATE' : 'PUBLIC', syncPolicy: savedSyncPolicy(id), external: !local })];
    })
  )
);
export const CONTENT_TYPE_IDS = Object.freeze(Object.keys(CONTENT_TYPES));
export const PUBLIC_CONTENT_TYPES = Object.freeze(CONTENT_TYPE_IDS.filter((t) => CONTENT_TYPES[t].scope === 'PUBLIC'));

/* what the sources call their items → the content type. 강좌 and 행사 are programmes. */
export const SOURCE_TYPE_ALIASES = Object.freeze({ CARE_SERVICE: 'SERVICE', PUBLIC_BENEFIT: 'BENEFIT', CLASS: 'PROGRAM', EVENT: 'PROGRAM' });
export function contentType(type) {
  if (typeof type !== 'string') return '';
  if (Object.prototype.hasOwnProperty.call(CONTENT_TYPES, type)) return type;
  return Object.prototype.hasOwnProperty.call(SOURCE_TYPE_ALIASES, type) ? SOURCE_TYPE_ALIASES[type] : '';
}
/* the word a person sees — never the enum. Menu entries are 메뉴. Unknown types have no label. */
const MENU_TYPES = Object.freeze(['AREA', 'SECTION']);
export function typeLabel(type) {
  if (MENU_TYPES.includes(type)) return '메뉴';
  const t = contentType(type);
  return t ? CONTENT_TYPES[t].label : '';
}

/* ───────── routes ───────── */

/* the local operations view (Phase 9) has four parts */
export const ADMIN_SECTIONS = Object.freeze(['overview', 'data', 'analytics', 'privacy']);
export const resolveAdminSection = (name) => (typeof name === 'string' && ADMIN_SECTIONS.includes(name) ? name : '');

const SECTION_CHECK = Object.freeze({
  life: (s) => !!resolveSection(s),
  care: (s) => !!resolveCareSection(s),
  enjoy: (s) => !!resolveEnjoySection(s),
  community: (s) => !!resolveCommunitySection(s),
  store: (s) => !!resolveStoreSection(s),
  admin: (s) => !!resolveAdminSection(s),
});
export const SECTIONED_VIEWS = Object.freeze(Object.keys(SECTION_CHECK));
export function sectionValid(view, section) {
  if (typeof section !== 'string' || section === '') return true;
  return Object.prototype.hasOwnProperty.call(SECTION_CHECK, view) ? SECTION_CHECK[view](section) : false;
}

/*
 * safeRoute(value) → '#view' or '#view/section', or '' when the text is not a route inside ONGIL.
 * External addresses, javascript:, data:, paths, unknown views and anything with markup characters give ''.
 * An unknown or malformed section falls back to the view itself — a wrong address never breaks a screen.
 */
export function safeRoute(value) {
  const href = safeHref(value);
  if (!href || href[0] !== '#') return '';
  const parts = href.slice(1).split('/');
  const view = resolveView(`#${parts[0]}`);
  if (!view) return '';
  const base = hashFor(view);
  if (parts.length === 1) return base;
  const section = parts.length === 2 && /^[a-z][a-z-]{0,30}$/.test(parts[1]) ? parts[1] : '';
  return section && sectionValid(view, section) ? `#${view}/${section}` : base;
}
/* the corrected form of whatever is in the address bar: '' when it is not a route at all */
export function canonicalHash(hash) {
  return safeRoute(typeof hash === 'string' && hash[0] === '#' ? hash : `#${hash || ''}`);
}

/*
 * ownerRoute(type, hint) → where an item of this type opens. `hint` is a route the item already carries (for
 * example '#store/safety'): it is kept only when it is inside the type's own screen, so a saved product can
 * never be made to open another area.
 */
export function ownerRoute(type, hint) {
  const t = contentType(type);
  if (!t) return '';
  const def = CONTENT_TYPES[t];
  const route = safeRoute(hint);
  return route && resolveView(route) === def.owner ? route : def.route;
}
export const ownerOf = (type) => (contentType(type) ? CONTENT_TYPES[contentType(type)].owner : '');

/* menu entries whose id is not the section's own name */
const MODULE_SECTIONS = Object.freeze({
  life: Object.freeze({ routine: 'routines' }),
  care: Object.freeze({ nearby: 'facility' }),
  health: Object.freeze({ 'check-in': '#life/checkin', medication: '#life/medication', 'life-check': '#life/daily', records: '#life/symptoms', measures: '#life/measures' }),
});
/* a menu entry → its section when one exists, otherwise the area itself */
export function moduleRoute(area, moduleId) {
  const base = safeRoute(area && area.hash);
  if (!base) return '';
  const view = resolveView(base);
  const mapped = (MODULE_SECTIONS[view] || {})[moduleId];
  if (typeof mapped === 'string' && mapped[0] === '#') return safeRoute(mapped) || base;
  const section = mapped || moduleId;
  return typeof section === 'string' && /^[a-z][a-z-]{0,30}$/.test(section) && Object.prototype.hasOwnProperty.call(SECTION_CHECK, view) && sectionValid(view, section) ? `#${view}/${section}` : base;
}

/* a notification's owner screen, by type. Only routes inside ONGIL; a notification can never open an outside page. */
export const NOTIFICATION_ROUTES = Object.freeze({
  CHECK_IN: '#life/checkin',
  SCHEDULE: '#life/calendar',
  MEDICATION: '#life/medication',
  FAMILY: '#family',
  SERVICE: '#care',
  PROGRAM: '#enjoy',
  COMMUNITY: '#community',
  STORE: '#store',
  SYSTEM: '#account',
});
export function notificationRoute(type, hint) {
  const base = Object.prototype.hasOwnProperty.call(NOTIFICATION_ROUTES, type) ? NOTIFICATION_ROUTES[type] : '';
  if (!base) return '';
  const route = safeRoute(hint);
  /* a hint is honoured only inside the screen that owns this kind of notification */
  return route && resolveView(route) === resolveView(base) ? route : base;
}
