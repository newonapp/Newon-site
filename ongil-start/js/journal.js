/*
 * Journal — PRIVATE. The user's own writing, kept on this device only.
 * It is never synced, shared with family, shown in search, used for notifications or sent anywhere
 * (see privacy.js). There is no photo upload and no cloud copy in this phase.
 *
 * add · update · remove · listForDate · recent · hasEntry(date)
 */
import { normalizeJournal, newId, LIFE_LIMITS } from './life-contracts.js';
import { createRecordList } from './record-store.js';
import { dateKey } from './dates.js';

export function createJournalStore(storage, { now = () => Date.now(), today = () => dateKey(now()), makeId = () => newId('jn', now()) } = {}) {
  const list = createRecordList(storage, { collection: 'journal', normalize: normalizeJournal, limit: LIFE_LIMITS.journalEntries, now });
  const wrap = (r) => (r.ok ? { ok: true, entry: r.record } : r);
  const order = (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt || a.id.localeCompare(b.id);

  return Object.freeze({
    add: (input) => wrap(list.insert({ id: makeId(), date: input && input.date ? input.date : today(), text: input && input.text, mood: input && input.mood }, 'INVALID_JOURNAL')),
    update: (id, changes) => wrap(list.patch(id, changes, ['date', 'text', 'mood'], 'INVALID_JOURNAL')),
    remove: (id) => list.remove(id),
    get: (id) => list.get(id),
    listForDate: (date = today()) => list.read().filter((e) => e.date === date).sort(order),
    recent: (limit = 20) => list.read().sort(order).slice(0, limit),
    hasEntry: (date = today()) => list.read().some((e) => e.date === date),
    count: () => list.read().length,
  });
}
