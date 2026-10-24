/*
 * ONGIL Notification center — a LOCAL, IN-APP foundation (Phase 1; made consistent in Phase 8).
 *
 * What this is: a list of notices kept on this device and shown inside ONGIL (the bell in the header), with a read
 * state, per-type preferences, and a route to the screen that owns each kind.
 * What this is not: push. Nothing is delivered to the phone's notification tray, by a server, by e-mail or by text
 * message — DELIVERY says so and every screen that mentions notifications repeats it.
 *
 * Nothing in ONGIL produces a notification yet (PRODUCERS is empty for every type): there is no backend and no
 * event that would make one true, so none is invented — no "가족이 확인했어요", no "댓글이 달렸어요", no price or
 * restock notice. add() exists for a later phase and for tests.
 *
 * A notification can only open a screen inside ONGIL: its route is recomputed from its type (routes.js), and an
 * address that points anywhere else is dropped.
 */
import { NOTIFICATION_TYPES, SCHEMA_VERSION, normalizeNotification, isPlainObject, ContractError } from './contracts.js';
import { notificationRoute, safeRoute } from './routes.js';

export const DELIVERY = Object.freeze({ push: false, server: false, email: false, sms: false, inApp: true });
/* which part of ONGIL creates notifications of each type today: none. A later phase fills this in, type by type. */
export const PRODUCERS = Object.freeze(Object.fromEntries(NOTIFICATION_TYPES.map((t) => [t.id, 'NONE'])));
export const MAX_ITEMS = 200;
const labelOf = (type) => (NOTIFICATION_TYPES.find((t) => t.id === type) || { label: '' }).label;

export function createNotificationCenter({ storage, profile, now = () => Date.now() }) {
  /* damaged entries are skipped; duplicates by id keep the first; at most MAX_ITEMS are ever read */
  function read() {
    const raw = storage.get('notifications', null);
    const items = isPlainObject(raw) && Array.isArray(raw.items) ? raw.items : [];
    const out = [];
    const seen = new Set();
    for (const it of items) {
      if (out.length >= MAX_ITEMS) break;
      try {
        const n = normalizeNotification(it, now());
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        /* only an address inside ONGIL is kept */
        out.push({ ...n, href: safeRoute(n.href) });
      } catch {
        /* skip damaged entries */
      }
    }
    return out;
  }
  function write(items) {
    return storage.set('notifications', { schemaVersion: SCHEMA_VERSION, items: items.slice(0, MAX_ITEMS) });
  }

  /* newest first; each item says its type in words, whether it was read, and where it opens */
  function list() {
    return read()
      .sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id))
      .map((n) => ({ ...n, typeLabel: labelOf(n.type), read: n.readAt > 0, route: notificationRoute(n.type, n.href) }));
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
    n.href = safeRoute(n.href);
    const items = read().filter((x) => x.id !== n.id);
    items.unshift(n);
    return { ok: write(items), notification: n };
  }
  function markRead(id) {
    const items = read();
    const target = items.find((n) => n.id === id);
    if (!target) return { ok: false, reason: 'NOT_FOUND' };
    if (target.readAt) return { ok: true, already: true };
    const t = now();
    return { ok: write(items.map((n) => (n.id === id ? { ...n, readAt: t } : n))) };
  }
  function markAllRead() {
    const t = now();
    return write(read().map((n) => (n.readAt ? n : { ...n, readAt: t })));
  }
  function remove(id) {
    const items = read();
    const next = items.filter((n) => n.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    return { ok: write(next) };
  }
  function isEnabled(type) {
    return profile.getPreferences().notifications[type] === true;
  }
  /* a preference is "show this kind inside ONGIL once it exists" — it never switches on a delivery that does not exist */
  function preferences() {
    const p = profile.getPreferences().notifications;
    return NOTIFICATION_TYPES.map((t) => ({ id: t.id, label: t.label, enabled: p[t.id] === true, producer: PRODUCERS[t.id], delivers: false }));
  }
  function setPreference(type, enabled) {
    if (!NOTIFICATION_TYPES.some((t) => t.id === type)) return { ok: false, reason: 'INVALID_TYPE' };
    return profile.updatePreferences({ notifications: { [type]: enabled === true } });
  }

  return Object.freeze({ list, unreadCount, count: () => read().length, add, markRead, markAllRead, remove, isEnabled, preferences, setPreference, delivery: DELIVERY, producers: PRODUCERS });
}
