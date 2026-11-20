/*
 * Living expenses — PRIVATE. Kept on this device only; never synced, shared or searchable (see privacy.js).
 * A plain list the user writes: date · category · amount (whole won) · memo.
 * No advice, no evaluation of spending, no budget judgement, nothing connected to a bank or card.
 *
 * add · update · remove · listForMonth("YYYY-MM") · monthTotal · countForMonth
 */
import { normalizeExpense, newId, LIFE_LIMITS } from './life-contracts.js';
import { createRecordList } from './record-store.js';
import { isMonthKey, dateKey } from './dates.js';

export function createExpenseStore(storage, { now = () => Date.now(), today = () => dateKey(now()), makeId = () => newId('ex', now()) } = {}) {
  const list = createRecordList(storage, { collection: 'expenses', normalize: normalizeExpense, limit: LIFE_LIMITS.expenses, now });
  const wrap = (r) => (r.ok ? { ok: true, expense: r.record } : r);
  const order = (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt || a.id.localeCompare(b.id);

  function listForMonth(month) {
    if (!isMonthKey(month)) return [];
    return list
      .read()
      .filter((e) => e.date.startsWith(`${month}-`))
      .sort(order);
  }

  return Object.freeze({
    add: (input) => wrap(list.insert({ id: makeId(), date: input && input.date ? input.date : today(), category: input && input.category, amount: input && input.amount, memo: input && input.memo }, 'INVALID_EXPENSE')),
    update: (id, changes) => wrap(list.patch(id, changes, ['date', 'category', 'amount', 'memo'], 'INVALID_EXPENSE')),
    remove: (id) => list.remove(id),
    get: (id) => list.get(id),
    listForMonth,
    monthTotal: (month) => listForMonth(month).reduce((sum, e) => sum + e.amount, 0),
    countForMonth: (month) => listForMonth(month).length,
    count: () => list.read().length,
  });
}

/* 12000 → "12,000원" */
export function formatWon(amount) {
  return `${Number(amount).toLocaleString('ko-KR')}원`;
}
