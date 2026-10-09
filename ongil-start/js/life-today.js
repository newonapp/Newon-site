/*
 * My Life V2 — what 내 생활 › 요약 shows about today and the days ahead. Pure functions: no DOM, no storage of their
 * own, no network. Each one reads the existing stores (one record, many screens) and returns plain data, so tests can
 * check that nothing is invented, copied or judged.
 *
 *   buildToday       오늘 할 것: today's events, today's routines, tasks due today and open tasks whose day has passed
 *   buildUpcoming    다가오는 일정: the next days' events (병원 일정 · 건강검진 named by kind) and open tasks due
 *   buildHealthGlance 오늘의 건강·안부: whether a check-in was written and how many doses were marked — counts only,
 *                    never how the person felt, never a medicine's name, never a number they measured
 *   buildActivities  관심 활동: programmes and places the person saved themselves (저장) — a bookmark, not a booking
 *
 * Nothing here is stored: there is no second copy of any record. Health stays canonical in its own stores.
 */
import { dateKey, addDays, formatTime, formatDateKey } from './dates.js';
import { isHealthEvent, eventKind, eventKindLabel } from './life-contracts.js';
import { SAVED_TYPE_LABELS } from './contracts.js';

export const UPCOMING_DAYS = 14;
export const UPCOMING_MAX_LINES = 20;
export const ACTIVITY_TYPES = Object.freeze(['PROGRAM', 'PLACE']);
export const ACTIVITY_LIMIT = 3;

const timeOrder = (a, b) => (a.time === '' ? 1 : 0) - (b.time === '' ? 1 : 0) || a.time.localeCompare(b.time);
const KIND_ORDER = Object.freeze({ event: 0, routine: 1, task: 2 });

/* "10월 6일 오후 2:30" — when a memo was last changed (local time) */
export function formatDateTimeShort(ms) {
  if (!Number.isSafeInteger(ms) || ms <= 0) return '';
  const d = new Date(ms);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${formatTime(time)}`;
}

/*
 * buildToday(stores, now) → { date, items, overdue, counts }
 *   items    today's events, routines and tasks due today, in time order (untimed last); each can be marked done
 *   overdue  open tasks whose day has passed — shown, never dropped and never marked for the person
 */
export function buildToday({ schedule, tasks, routines }, now = () => Date.now()) {
  const date = dateKey(now());
  const events = schedule.listForDate(date).map((e) => ({
    key: `event:${e.id}`,
    kind: 'event',
    id: e.id,
    title: e.title,
    time: e.time,
    done: e.completed === true,
    label: isHealthEvent(e) ? eventKindLabel(eventKind(e)) : '일정',
  }));
  const todaysRoutines = routines.listForDate(date).map((r) => ({ key: `routine:${r.id}`, kind: 'routine', id: r.id, title: r.title, time: r.time, done: r.completed === true, label: '루틴' }));
  const due = tasks.dueOn(date).map((t) => ({ key: `task:${t.id}`, kind: 'task', id: t.id, title: t.title, time: t.time || '', done: t.completed === true, label: '할 일', important: t.priority === 'important' }));
  const items = [...events, ...todaysRoutines, ...due].sort((a, b) => timeOrder(a, b) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.title.localeCompare(b.title, 'ko'));
  const overdue = (typeof tasks.overdue === 'function' ? tasks.overdue(date) : []).map((t) => ({ key: `task:${t.id}`, kind: 'task', id: t.id, title: t.title, time: t.time || '', done: false, label: '할 일', dueDate: t.dueDate, important: t.priority === 'important' }));
  return { date, items, overdue, counts: { total: items.length, done: items.filter((i) => i.done).length, overdue: overdue.length } };
}

/*
 * buildUpcoming(stores, now, days) → { from, to, days: [{ date, lines }], total, shown }
 * The days after today (today is 오늘 할 것). A health event is named by its kind and shown with its title, as the
 * calendar in 내 생활 does — it is the same record, read from the same store.
 */
export function buildUpcoming({ schedule, tasks }, now = () => Date.now(), days = UPCOMING_DAYS) {
  const today = dateKey(now());
  const from = addDays(today, 1);
  const to = addDays(today, days);
  const out = [];
  let total = 0;
  let shown = 0;
  for (let i = 1; i <= days; i += 1) {
    const date = addDays(today, i);
    const lines = [
      ...schedule.listForDate(date).filter((e) => !e.completed).map((e) => ({ kind: 'event', title: e.title, time: e.time, label: isHealthEvent(e) ? eventKindLabel(eventKind(e)) : '일정' })),
      ...tasks.dueOn(date).filter((t) => !t.completed).map((t) => ({ kind: 'task', title: t.title, time: t.time || '', label: '할 일' })),
    ].sort((a, b) => timeOrder(a, b) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
    total += lines.length;
    if (!lines.length || shown >= UPCOMING_MAX_LINES) continue;
    const room = UPCOMING_MAX_LINES - shown;
    out.push({ date, lines: lines.slice(0, room) });
    shown += Math.min(lines.length, room);
  }
  return { from, to, days: out, total, shown };
}

/*
 * buildHealthGlance({ checkIn, medication, schedule }, now) → counts only.
 * Whether today's 안부 was written (yes / no — never what was chosen), how many doses today's plan has and how many the
 * person marked 먹었어요 / 건너뜀 (never a name), and how many 병원 일정 · 건강검진 are today. A check-in is the person's
 * note, not a safety confirmation; a dose is "taken" only when the person marked it.
 */
export function buildHealthGlance({ checkIn, medication, schedule }, now = () => Date.now()) {
  const date = dateKey(now());
  const doses = medication ? medication.listForDate(date) : [];
  return {
    date,
    checkInWritten: !!(checkIn && checkIn.get(date)),
    doses: { planned: doses.length, taken: doses.filter((d) => d.taken === true).length, skipped: doses.filter((d) => d.skipped === true).length },
    healthEvents: schedule ? schedule.listForDate(date).filter(isHealthEvent).length : 0,
  };
}

/* the words for the glance — what was written, never a judgement and never "safe" */
export function healthGlanceLines(g) {
  const lines = [g.checkInWritten ? '오늘 안부를 남겼어요.' : '오늘 안부는 아직 남기지 않았어요.'];
  if (g.doses.planned) {
    const parts = [`오늘 복약 ${g.doses.planned}번 가운데 ${g.doses.taken}번 먹었다고 표시했어요`];
    if (g.doses.skipped) parts.push(`${g.doses.skipped}번은 건너뜀으로 표시했어요`);
    lines.push(`${parts.join(', ')}.`);
  } else lines.push('오늘 먹을 약으로 적어 둔 것이 없어요.');
  if (g.healthEvents) lines.push(`오늘 병원 일정·건강검진 ${g.healthEvents}개가 있어요.`);
  return lines;
}

/* buildActivities(saved) → the programmes and places the person saved (newest first) — a bookmark, not a booking */
export function buildActivities(saved, limit = ACTIVITY_LIMIT) {
  const all = saved ? saved.list().filter((it) => ACTIVITY_TYPES.includes(it.type)) : [];
  return { total: all.length, items: all.slice(0, limit).map((it) => ({ title: it.title, label: SAVED_TYPE_LABELS[it.type] || '' })) };
}

/* "오전 9:00 · 병원 일정" — the small line under a row */
export const lineMeta = (line) => [line.time ? formatTime(line.time) : '', line.label].filter(Boolean).join(' · ');
export const dayTitle = (date, today) => (date === addDays(today, 1) ? `내일 · ${formatDateKey(date)}` : formatDateKey(date));
