/*
 * Day and time helpers.
 *
 * ONGIL's daily data (check-in, today's schedule, medication log, daily life) is keyed by the user's LOCAL
 * calendar day, "YYYY-MM-DD". UTC is never used for a day key: at 08:00 in Seoul the UTC date is still yesterday.
 */
const pad = (n) => String(n).padStart(2, '0');

export function dateKey(ms = Date.now()) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isDateKey(value) {
  if (typeof value !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]);
}

/* "HH:MM", 24-hour */
export function isTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function partOfDay(hour) {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'day';
  return 'evening';
}

const GREETINGS = Object.freeze({ morning: '좋은 아침이에요', day: '오늘도 반가워요', evening: '오늘 하루는 어떠셨나요?' });

/* The nickname is used only when the user gave one; nobody is asked for a name here. */
export function greeting(hour, nickname = '') {
  const text = GREETINGS[partOfDay(hour)];
  const name = typeof nickname === 'string' ? nickname.trim() : '';
  return name ? `${name}님, ${text}` : text;
}

export function formatDay(ms = Date.now()) {
  try {
    return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date(ms));
  } catch {
    return dateKey(ms);
  }
}

/* "14:30" → "오후 2:30" */
export function formatTime(value) {
  if (!isTime(value)) return '';
  const [h, m] = value.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour}:${pad(m)}`;
}

/* ───────── calendar helpers (Phase 2B). Everything works on local "YYYY-MM-DD" keys; no UTC conversion. ───────── */

export function parseDateKey(key) {
  if (!isDateKey(key)) return null;
  const [y, m, d] = key.split('-').map(Number);
  return { year: y, month: m, day: d };
}

/* local noon avoids any daylight-saving edge when stepping by days */
function toDate(key) {
  const p = parseDateKey(key);
  return p ? new Date(p.year, p.month - 1, p.day, 12, 0, 0) : null;
}

export function addDays(key, days) {
  const d = toDate(key);
  if (!d) return key;
  d.setDate(d.getDate() + days);
  return dateKey(d.getTime());
}

/* 0 = Sunday … 6 = Saturday */
export function weekdayOf(key) {
  const d = toDate(key);
  return d ? d.getDay() : -1;
}

export const WEEKDAY_LABELS = Object.freeze(['일', '월', '화', '수', '목', '금', '토']);

/* "YYYY-MM" */
export function monthKey(key) {
  return isDateKey(key) ? key.slice(0, 7) : '';
}
export function isMonthKey(value) {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}
export function shiftMonth(month, delta) {
  if (!isMonthKey(month)) return month;
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1, 12);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
export function formatMonth(month) {
  if (!isMonthKey(month)) return '';
  const [y, m] = month.split('-').map(Number);
  return `${y}년 ${m}월`;
}

/* weeks of a month, Sunday first; cells outside the month are null */
export function monthGrid(month) {
  if (!isMonthKey(month)) return [];
  const [y, m] = month.split('-').map(Number);
  const first = new Date(y, m - 1, 1, 12);
  const days = new Date(y, m, 0, 12).getDate();
  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(`${month}-${pad(d)}`);
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/* the seven day keys of the week (Sunday … Saturday) that contains `key` */
export function weekOf(key) {
  const start = addDays(key, -weekdayOf(key));
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/* "10월 2일 금요일" from a day key */
export function formatDateKey(key) {
  const d = toDate(key);
  return d ? formatDay(d.getTime()) : '';
}
