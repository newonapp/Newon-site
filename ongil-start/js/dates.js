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
