/*
 * 건강·안부 › 생활 변화 (Health · Safety V2) — how the user's OWN records changed, in plain counts.
 *
 * Deterministic and explainable: the last 7 days (today included) are compared with the 7 days before, metric by metric,
 * from what the user wrote down — 안부 · 잠 · 식사 · 운동 · 복약 표시. Every line carries its numbers ("최근 7일 5일 · 그 전
 * 7일 3일"), so the user can see exactly where it comes from. Nothing is scored, nothing is diagnosed and nothing is called
 * risky, normal or abnormal: a change is said as 늘었어요 / 줄었어요 / 비슷해요 and nothing more. A metric with too few
 * records in either week says so ("아직 비교할 기록이 충분하지 않아요") instead of guessing. No AI, no network, no storage.
 */
import { addDays } from './dates.js';

export const CHANGE_WINDOW_DAYS = 7;
/* averages: at least this many days with a value in BOTH weeks; day counts: the earlier week has a record and both weeks together this many */
export const CHANGE_MIN_DAYS = 3;
export const CHANGE_NOTE = '내가 적은 기록의 수를 비교한 것이에요. 건강 상태를 판단하지 않아요. 걱정되는 증상이 있거나 평소와 다른 상태가 이어지면 의료진과 상담하세요.';
export const NOT_ENOUGH_TEXT = '아직 비교할 기록이 충분하지 않아요.';

const days = (end, n) => Array.from({ length: n }, (_, i) => addDays(end, -i));
const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
const minutesOf = (t) => (typeof t === 'string' && /^\d{2}:\d{2}$/.test(t) ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) : null);
/* bed → wake across midnight; null when either time is missing */
export function sleepMinutes(s) {
  const bed = s ? minutesOf(s.bedTime) : null;
  const wake = s ? minutesOf(s.wakeTime) : null;
  if (bed === null || wake === null) return null;
  const d = (wake - bed + 1440) % 1440;
  return d === 0 ? null : d;
}
const direction = (a, b, tolerance) => (Math.abs(a - b) <= tolerance ? 'SAME' : a > b ? 'UP' : 'DOWN');
const WORDS = Object.freeze({ UP: '늘었어요', DOWN: '줄었어요', SAME: '비슷해요' });
/* Korean particle 로/으로 after a word: 으로 after a final consonant other than ㄹ ("7시간으로", "5일로", "3.0끼로") */
export function ro(word) {
  const c = String(word).charCodeAt(String(word).length - 1);
  if (c < 0xac00 || c > 0xd7a3) return `${word}로`;
  const jong = (c - 0xac00) % 28;
  return jong === 0 || jong === 8 ? `${word}로` : `${word}으로`;
}
const hm = (min) => `${Math.floor(min / 60)}시간${min % 60 ? ` ${Math.round(min % 60)}분` : ''}`;

/*
 * computeLifeChanges({ checkIn, sleep, dailyLife, medication }, today) →
 *   { window, enough, metrics: [{ id, label, enough, recent, before, direction, text, basis }] }
 * Any store may be missing; a store that throws reads as "no record" for that day.
 */
export function computeLifeChanges(stores, today) {
  const { checkIn, sleep, dailyLife, medication } = stores || {};
  const recent = days(today, CHANGE_WINDOW_DAYS);
  const before = days(addDays(today, -CHANGE_WINDOW_DAYS), CHANGE_WINDOW_DAYS);
  const metrics = [];

  /* a "days recorded" metric: count of days with a record in each week */
  const dayCount = (id, label, has) => {
    const a = recent.filter((d) => safe(() => has(d), false)).length;
    const b = before.filter((d) => safe(() => has(d), false)).length;
    /* the earlier week must have records too (someone who started this week has nothing to compare with) */
    const enough = b >= 1 && a + b >= CHANGE_MIN_DAYS;
    const dir = direction(a, b, 0);
    metrics.push({ id, label, enough, recent: a, before: b, direction: enough ? dir : null, basis: `최근 7일 ${a}일 · 그 전 7일 ${b}일`, text: enough ? `${label} — 최근 7일 ${a}일, 그 전 7일 ${ro(`${b}일`)} ${WORDS[dir]}.` : `${label} — ${NOT_ENOUGH_TEXT} (최근 7일 ${a}일 · 그 전 7일 ${b}일)` });
  };
  /* an "average of what was written" metric: only days with a value count; each week needs CHANGE_MIN_DAYS of them */
  const average = (id, label, valueOf, format, tolerance) => {
    const vals = (list) => list.map((d) => safe(() => valueOf(d), null)).filter((v) => typeof v === 'number' && Number.isFinite(v));
    const a = vals(recent);
    const b = vals(before);
    const enough = a.length >= CHANGE_MIN_DAYS && b.length >= CHANGE_MIN_DAYS;
    const avg = (xs) => xs.reduce((n, x) => n + x, 0) / xs.length;
    if (!enough) {
      metrics.push({ id, label, enough: false, recent: a.length, before: b.length, direction: null, basis: `적은 날: 최근 7일 ${a.length}일 · 그 전 7일 ${b.length}일`, text: `${label} — ${NOT_ENOUGH_TEXT} (적은 날: 최근 7일 ${a.length}일 · 그 전 7일 ${b.length}일)` });
      return;
    }
    const ra = avg(a);
    const rb = avg(b);
    const dir = direction(ra, rb, tolerance);
    metrics.push({ id, label, enough: true, recent: ra, before: rb, direction: dir, basis: `최근 7일 ${a.length}일 평균 · 그 전 7일 ${b.length}일 평균`, text: `${label} — 최근 7일 평균 ${format(ra)}, 그 전 7일 평균 ${ro(format(rb))} ${WORDS[dir]}.` });
  };

  if (checkIn) dayCount('checkin', '안부 기록', (d) => !!checkIn.get(d));
  if (sleep) average('sleep', '적어 둔 잠 시간', (d) => sleepMinutes(sleep.get(d)), (m) => hm(Math.round(m)), 30);
  if (dailyLife) {
    average('meals', '적어 둔 식사 끼니', (d) => { const r = dailyLife.get(d); return r && r.meals > 0 ? r.meals : null; }, (n) => `${n.toFixed(1)}끼`, 0.4);
    dayCount('exercise', '운동을 적은 날', (d) => { const r = dailyLife.get(d); return !!(r && r.exercise); });
  }
  if (medication) {
    /* planned medications marked 먹었어요 by the user, per week — only weeks that had planned medications count */
    const tally = (list) => list.reduce((acc, d) => {
      const rows = safe(() => medication.historyForDate(d), []).filter((r) => !r.removed);
      return { planned: acc.planned + rows.length, taken: acc.taken + rows.filter((r) => r.taken).length, skipped: acc.skipped + rows.filter((r) => r.skipped).length, days: acc.days + (rows.length ? 1 : 0) };
    }, { planned: 0, taken: 0, skipped: 0, days: 0 });
    const a = tally(recent);
    const b = tally(before);
    const enough = a.days >= CHANGE_MIN_DAYS && b.days >= CHANGE_MIN_DAYS;
    const rate = (t) => (t.planned ? t.taken / t.planned : 0);
    const dir = direction(rate(a), rate(b), 0.1);
    const line = (t) => `${t.planned}번 중 ${t.taken}번 먹었어요로 표시${t.skipped ? `, ${t.skipped}번 건너뜀` : ''}`;
    metrics.push({ id: 'medication', label: '복약 표시', enough, recent: a, before: b, direction: enough ? dir : null, basis: `최근 7일: ${line(a)} · 그 전 7일: ${line(b)}`, text: enough ? `복약 표시 — 최근 7일 ${line(a)}, 그 전 7일 ${line(b)}. 표시한 비율이 ${WORDS[dir]}.` : `복약 표시 — ${NOT_ENOUGH_TEXT}` });
  }
  return { window: { recent: [recent[recent.length - 1], recent[0]], before: [before[before.length - 1], before[0]] }, enough: metrics.some((m) => m.enough), metrics };
}
