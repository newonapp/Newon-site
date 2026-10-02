/*
 * ONGIL local-first storage layer.
 *
 *   UI / feature modules
 *        ↓ storage.get / set / remove / list          (collections, never raw keys)
 *   Storage (this file)   namespace · JSON safety · change events
 *        ↓ backend { getItem, setItem, removeItem, keys }
 *   localStorage  — or an in-memory backend when the browser blocks storage (private mode, quota, policy)
 *
 * Rules
 *   - UI code never touches localStorage directly; it goes through a store built on this module.
 *   - Every key is "ongil.v1.<collection>". Nothing outside that namespace is read, written or cleared,
 *     so ONGIL cannot collide with LIVON ("livon.*") or the site ("newon*") on the same origin.
 *   - A value that cannot be parsed is treated as missing (the fallback is returned); it is never executed
 *     or rendered, and it is replaced on the next successful write.
 *   - subscribe() reports every change. It is the single hook a future account-sync adapter uses
 *     (see account.js). Nothing is sent anywhere by this file.
 */

export const NAMESPACE = 'ongil';
export const STORAGE_VERSION = 'v1';
export const KEY_PREFIX = `${NAMESPACE}.${STORAGE_VERSION}.`;

/*
 * Known collections. A name that is not listed here is refused.
 *   Phase 1  : profile · preferences · onboarding · saved · notifications
 *   Phase 2A : checkins · events · medications · medicationLogs · dailyLife   (Home V1, shared with My Life)
 *   Phase 2B : tasks · routines · routineLogs · sleepRecords · expenses · journal   (My Life V1)
 *   Phase 3  : symptoms · healthNotes   (Health + Check-in V1; check-in and medication reuse the Phase 2A collections)
 *   Phase 6  : communityPosts · groupDrafts · meetupDrafts   (the user's own posts and group/meetup drafts, this device only)
 *   Phase 4  : familySharing · helpRequests   (the user's own sharing choices and help-request notes; no family record —
 *              connections, permissions, consents and shared items have contracts only, see family-contracts.js) Every name here has a privacy class in privacy.js.
 */
export const COLLECTIONS = Object.freeze([
  'profile', 'preferences', 'onboarding', 'saved', 'notifications',
  'checkins', 'events', 'medications', 'medicationLogs', 'dailyLife',
  'tasks', 'routines', 'routineLogs', 'sleepRecords', 'expenses', 'journal',
  'symptoms', 'healthNotes',
  'familySharing', 'helpRequests',
  'communityPosts', 'groupDrafts', 'meetupDrafts',
]);

const MAX_VALUE_CHARS = 400000;

export function storageKey(collection) {
  if (!COLLECTIONS.includes(collection)) throw new Error(`UNKNOWN_COLLECTION:${String(collection)}`);
  return KEY_PREFIX + collection;
}

export function createMemoryBackend(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    kind: 'memory',
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
    keys: () => [...map.keys()],
  };
}

function wrapWebStorage(webStorage) {
  return {
    kind: 'local',
    getItem: (k) => webStorage.getItem(k),
    setItem: (k, v) => webStorage.setItem(k, v),
    removeItem: (k) => webStorage.removeItem(k),
    keys: () => {
      const out = [];
      for (let i = 0; i < webStorage.length; i++) out.push(webStorage.key(i));
      return out;
    },
  };
}

/* Returns the browser's localStorage when it really works, otherwise a memory backend (data lasts until the tab closes). */
export function resolveBackend(win) {
  try {
    const ls = win && win.localStorage;
    if (ls) {
      const probe = `${KEY_PREFIX}__probe`;
      ls.setItem(probe, '1');
      ls.removeItem(probe);
      return wrapWebStorage(ls);
    }
  } catch {
    /* blocked or full → memory */
  }
  return createMemoryBackend();
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function createStorage({ backend = createMemoryBackend(), now = () => Date.now() } = {}) {
  const listeners = new Set();

  function emit(change) {
    for (const fn of [...listeners]) {
      try {
        fn(change);
      } catch {
        /* a failing listener must not break a write */
      }
    }
  }

  function get(collection, fallback = null) {
    const key = storageKey(collection);
    let raw = null;
    try {
      raw = backend.getItem(key);
    } catch {
      return clone(fallback);
    }
    if (typeof raw !== 'string' || raw === '') return clone(fallback);
    try {
      const parsed = JSON.parse(raw);
      return parsed === null || typeof parsed !== 'object' ? clone(fallback) : parsed;
    } catch {
      return clone(fallback);
    }
  }

  function set(collection, value) {
    const key = storageKey(collection);
    if (value === null || typeof value !== 'object') throw new Error('INVALID_VALUE');
    const raw = JSON.stringify(value);
    if (raw.length > MAX_VALUE_CHARS) return false;
    try {
      backend.setItem(key, raw);
    } catch {
      return false;
    }
    emit({ collection, op: 'set', value: JSON.parse(raw), at: now() });
    return true;
  }

  function remove(collection) {
    const key = storageKey(collection);
    try {
      backend.removeItem(key);
    } catch {
      return false;
    }
    emit({ collection, op: 'remove', value: null, at: now() });
    return true;
  }

  /* collections that currently hold a value */
  function list() {
    let keys = [];
    try {
      keys = backend.keys();
    } catch {
      return [];
    }
    return COLLECTIONS.filter((c) => keys.includes(KEY_PREFIX + c));
  }

  /* removes ONGIL's own keys only */
  function clear() {
    let ok = true;
    for (const c of list()) ok = remove(c) && ok;
    return ok;
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') throw new Error('INVALID_LISTENER');
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return Object.freeze({ persistent: backend.kind === 'local', backendKind: backend.kind, get, set, remove, list, clear, subscribe });
}
