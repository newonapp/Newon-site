/*
 * Tasks — things to do, separate from calendar events (a task may have a due date, an event has a day and time).
 * add · update · toggle · remove · list({ filter }) · dueOn(date) · openCount
 */
import { normalizeTask, newId, LIFE_LIMITS } from './life-contracts.js';
import { createRecordList } from './record-store.js';

export const TASK_FILTERS = Object.freeze(['all', 'open', 'done']);

export function createTaskStore(storage, { now = () => Date.now(), makeId = () => newId('tk', now()) } = {}) {
  const list = createRecordList(storage, { collection: 'tasks', normalize: normalizeTask, limit: LIFE_LIMITS.tasks, now });
  const wrap = (r) => (r.ok ? { ok: true, task: r.record } : r);

  /* open first; important before normal; then by due date (dated before undated); then oldest first */
  function order(a, b) {
    return (
      Number(a.completed) - Number(b.completed) ||
      (a.priority === 'important' ? 0 : 1) - (b.priority === 'important' ? 0 : 1) ||
      (a.dueDate === '' ? 1 : 0) - (b.dueDate === '' ? 1 : 0) ||
      a.dueDate.localeCompare(b.dueDate) ||
      a.createdAt - b.createdAt ||
      a.id.localeCompare(b.id)
    );
  }

  return Object.freeze({
    add: (input) => wrap(list.insert({ id: makeId(), title: input && input.title, dueDate: input && input.dueDate, priority: input && input.priority, completed: false }, 'INVALID_TASK')),
    update: (id, changes) => wrap(list.patch(id, changes, ['title', 'dueDate', 'priority', 'completed'], 'INVALID_TASK')),
    toggle(id) {
      const current = list.get(id);
      return current ? wrap(list.patch(id, { completed: !current.completed }, ['completed'], 'INVALID_TASK')) : { ok: false, reason: 'NOT_FOUND' };
    },
    remove: (id) => list.remove(id),
    get: (id) => list.get(id),
    list({ filter = 'all' } = {}) {
      const items = list.read().sort(order);
      if (filter === 'open') return items.filter((t) => !t.completed);
      if (filter === 'done') return items.filter((t) => t.completed);
      return filter === 'all' ? items : [];
    },
    dueOn: (date) => list.read().filter((t) => t.dueDate === date).sort(order),
    openCount: () => list.read().filter((t) => !t.completed).length,
    /* { 'YYYY-MM-DD': number of open tasks due } for one month */
    dueCountsForMonth(month) {
      const out = {};
      for (const t of list.read()) if (!t.completed && t.dueDate.startsWith(`${month}-`)) out[t.dueDate] = (out[t.dueDate] || 0) + 1;
      return out;
    },
    count: () => list.read().length,
  });
}
