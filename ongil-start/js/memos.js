/*
 * Memos (My Life V2) — PRIVATE. Notes the person keeps for themselves, with no date.
 * Kept on this device only: never synced, shared with family, offered to the global search, given to the assistant,
 * counted by content or turned into a community post (privacy.js). Nothing is ever written here for the person.
 *
 * add · update · remove · get · list · filter(query) · count
 */
import { normalizeMemo, newId, LIFE_LIMITS } from './life-contracts.js';
import { createRecordList } from './record-store.js';

/* pinned first, then the most recently changed */
const order = (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt || b.createdAt - a.createdAt || a.id.localeCompare(b.id);

/* the words of a local search inside 메모 — case is ignored, spaces separate words, every word must appear */
export function memoMatches(memo, query) {
  const words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  if (!words.length) return true;
  const text = memo.text.toLowerCase();
  return words.every((w) => text.includes(w));
}

export function createMemoStore(storage, { now = () => Date.now(), makeId = () => newId('mm', now()) } = {}) {
  const list = createRecordList(storage, { collection: 'memos', normalize: normalizeMemo, limit: LIFE_LIMITS.memos, now });
  const wrap = (r) => (r.ok ? { ok: true, memo: r.record } : r);
  return Object.freeze({
    add: (input) => wrap(list.insert({ id: makeId(), text: input && input.text, pinned: !!(input && input.pinned === true) }, 'INVALID_MEMO')),
    update: (id, changes) => wrap(list.patch(id, changes, ['text', 'pinned'], 'INVALID_MEMO')),
    remove: (id) => list.remove(id),
    get: (id) => list.get(id),
    list: () => list.read().sort(order),
    filter: (query) => list.read().sort(order).filter((m) => memoMatches(m, query)),
    count: () => list.read().length,
  });
}
