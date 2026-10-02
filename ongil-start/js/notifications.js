/*
 * ONGIL Notification center — foundation.
 *
 * Phase 1 has no push and no server notifications: DELIVERY says so and the UI repeats it.
 * What exists: the list (empty until a later phase adds real notifications through add()),
 * read state, and per-type preferences (stored in Preferences, see profile.js).
 * Nothing in Phase 1 calls add(); no sample notification is ever generated.
 */
import { NOTIFICATION_TYPES, SCHEMA_VERSION, normalizeNotification, isPlainObject, ContractError } from './contracts.js';

export const DELIVERY = Object.freeze({ push: false, server: false, inApp: true });
const MAX_ITEMS = 200;

export function createNotificationCenter({ storage, profile, now = () => Date.now() }) {
  function read() {
    const raw = storage.get('notifications', null);
    const items = isPlainObject(raw) && Array.isArray(raw.items) ? raw.items : [];
    const out = [];
    for (const it of items) {
      try {
        out.push(normalizeNotification(it, now()));
      } catch {
        /* skip damaged entries */
      }
    }
    return out;
  }
  function write(items) {
    return storage.set('notifications', { schemaVersion: SCHEMA_VERSION, items: items.slice(0, MAX_ITEMS) });
  }

  function list() {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  }
  function unreadCount() {
    return read().filter((n) => !n.readAt).length;
  }
  function add(input) {
    let n;
    try {
      n = normalizeNotification({ ...input, createdAt: now(), readAt: 0 }, now());
    } catch (e) {
      return { ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_NOTIFICATION' };
    }
    if (!isEnabled(n.type)) return { ok: false, reason: 'TYPE_DISABLED' };
    const items = read().filter((x) => x.id !== n.id);
    items.unshift(n);
    return { ok: write(items), notification: n };
  }
  function markAllRead() {
    const t = now();
    return write(read().map((n) => (n.readAt ? n : { ...n, readAt: t })));
  }
  function isEnabled(type) {
    return profile.getPreferences().notifications[type] === true;
  }
  function preferences() {
    const p = profile.getPreferences().notifications;
    return NOTIFICATION_TYPES.map((t) => ({ id: t.id, label: t.label, enabled: p[t.id] === true }));
  }
  function setPreference(type, enabled) {
    if (!NOTIFICATION_TYPES.some((t) => t.id === type)) return { ok: false, reason: 'INVALID_TYPE' };
    return profile.updatePreferences({ notifications: { [type]: enabled === true } });
  }

  return Object.freeze({ list, unreadCount, add, markAllRead, isEnabled, preferences, setPreference, delivery: DELIVERY });
}
