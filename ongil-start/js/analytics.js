/*
 * ONGIL local analytics (Phase 9) — a PRIVACY-PRESERVING, LOCAL, AGGREGATE foundation.
 *
 * What it is: counters of which screens and features were used on this device, kept as daily totals for a short
 * time, shown only on the local operations view (#admin). An event contract a later backend can adopt.
 * What it is not: tracking. Nothing is sent anywhere (TRANSMISSION says so and there is no network code here), no
 * user id, device id, advertising id, session id or fingerprint is created or read, and no raw event is stored —
 * an event is counted and thrown away.
 *
 *   AnalyticsEvent  { name, timestamp, screen, properties }        (normalizeEvent)
 *   EVENTS          the allowlist: event name → the property names it may carry
 *   PROPERTIES      each property → the closed set of values it may take
 *
 * A property can only take a value from a closed list (a screen name, a content type, a size bucket …). Free text
 * cannot be expressed at all: there is no property for a search query, a title, a body, a name, a message, an
 * amount, an address, a phone number, an e-mail address or a location. A search is recorded as the LENGTH BUCKET of
 * the query and the bucket of how many results came back.
 *
 * Storage: collection "analytics" → { schemaVersion, days: { 'YYYY-MM-DD': { <counter>: n } } }.
 * Bounded: RETENTION_DAYS days, and the counter names are a finite set (events × allowed values), so a day cannot grow
 * without limit. Erased with the rest of ONGIL's data. If storage is missing, full or damaged, track() answers
 * { ok: false } and the feature that called it carries on: analytics never blocks or breaks anything.
 */
import { SCHEMA_VERSION, isPlainObject } from './contracts.js';
import { dateKey, isDateKey } from './dates.js';

export const TRANSMISSION = Object.freeze({ remote: false, endpoint: null, batch: false, beacon: false });
export const IDENTIFIERS = Object.freeze({ userId: false, deviceId: false, advertisingId: false, sessionId: false, fingerprint: false });
export const RETENTION_DAYS = 14;
export const MAX_COUNT = 1_000_000;

const SCREENS = Object.freeze(['home', 'life', 'health', 'family', 'care', 'enjoy', 'community', 'store', 'saved', 'account', 'admin']);
const CONTENT = Object.freeze(['SERVICE', 'BENEFIT', 'FACILITY', 'PROGRAM', 'PLACE', 'POST', 'PRODUCT', 'MENU']);
const SIZE = Object.freeze(['0', '1-5', '6-20', '21+']);

/* every property and the only values it may take */
export const PROPERTIES = Object.freeze({
  view: SCREENS,
  hasSection: Object.freeze(['yes', 'no']),
  queryLength: Object.freeze(['1-2', '3-5', '6-10', '11+']),
  resultCount: SIZE,
  providerCount: Object.freeze(['0', '1', '2', '3', '4', '5+']),
  outcome: Object.freeze(['results', 'partial', 'no-results', 'error']),
  contentType: CONTENT,
});

/* the allowlist: an event not listed here is refused; a property not listed for its event is dropped */
export const EVENTS = Object.freeze({
  app_open: Object.freeze([]),
  screen_view: Object.freeze(['view', 'hasSection']),
  search_submit: Object.freeze(['queryLength', 'resultCount', 'providerCount', 'outcome']),
  search_result_open: Object.freeze(['contentType']),
  saved_add: Object.freeze(['contentType']),
  saved_remove: Object.freeze(['contentType']),
  checkin_saved: Object.freeze([]),
  calendar_event_created: Object.freeze([]),
  task_created: Object.freeze([]),
  routine_completed: Object.freeze([]),
  family_settings_changed: Object.freeze([]),
  help_request_draft_created: Object.freeze([]),
  care_item_opened: Object.freeze(['contentType']),
  enjoy_item_opened: Object.freeze(['contentType']),
  product_opened: Object.freeze([]),
  community_post_saved: Object.freeze([]),
  group_draft_created: Object.freeze([]),
  meetup_draft_created: Object.freeze([]),
});
export const EVENT_NAMES = Object.freeze(Object.keys(EVENTS));
export const EVENT_LABELS = Object.freeze({
  app_open: 'ONGIL 열기',
  screen_view: '화면 보기',
  search_submit: '통합검색 하기',
  search_result_open: '검색 결과 열기',
  saved_add: '저장',
  saved_remove: '저장 취소',
  checkin_saved: '안부 남기기',
  calendar_event_created: '일정 만들기',
  task_created: '할 일 만들기',
  routine_completed: '루틴 표시',
  family_settings_changed: '가족 공유 선택 바꾸기',
  help_request_draft_created: '도움 요청 적기',
  care_item_opened: '돌봄·서비스 항목 열기',
  enjoy_item_opened: '즐길거리 항목 열기',
  product_opened: '상품 열기',
  community_post_saved: '내 글 저장',
  group_draft_created: '모임 초안 만들기',
  meetup_draft_created: '모임 일정 초안 만들기',
});

/* numbers become buckets before they are counted: an exact length or count is never kept */
export function lengthBucket(n) {
  const v = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return v <= 2 ? '1-2' : v <= 5 ? '3-5' : v <= 10 ? '6-10' : '11+';
}
export function sizeBucket(n) {
  const v = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return v === 0 ? '0' : v <= 5 ? '1-5' : v <= 20 ? '6-20' : '21+';
}
export function providerBucket(n) {
  const v = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return v >= 5 ? '5+' : String(v);
}

/*
 * normalizeEvent(name, properties, { screen, now }) → AnalyticsEvent, or null when the name is not on the allowlist.
 * Unknown properties and values outside a property's closed set are dropped — never stored, never an error.
 */
export function normalizeEvent(name, properties, { screen = '', now = Date.now() } = {}) {
  if (typeof name !== 'string' || !Object.prototype.hasOwnProperty.call(EVENTS, name)) return null;
  const allowed = EVENTS[name];
  const src = isPlainObject(properties) ? properties : {};
  const clean = {};
  for (const key of allowed) {
    const value = src[key];
    if (typeof value === 'string' && PROPERTIES[key].includes(value)) clean[key] = value;
  }
  return { name, timestamp: Number.isSafeInteger(now) && now > 0 ? now : Date.now(), screen: SCREENS.includes(screen) ? screen : '', properties: clean };
}

/* the counter names one event adds to: the event itself and one per property value */
export function countersOf(event) {
  return [event.name, ...Object.keys(event.properties).sort().map((k) => `${event.name}|${k}=${event.properties[k]}`)];
}
/* every counter name that can exist — the storage bound */
export const ALL_COUNTERS = Object.freeze(EVENT_NAMES.flatMap((n) => [n, ...EVENTS[n].flatMap((k) => PROPERTIES[k].map((v) => `${n}|${k}=${v}`))]));
const COUNTER_SET = new Set(ALL_COUNTERS);

export function createAnalytics({ storage, now = () => Date.now() }) {
  /* damaged days, unknown counters and non-numbers are dropped on read; only RETENTION_DAYS recent days are kept */
  function read() {
    let raw = null;
    try {
      raw = storage.get('analytics', null);
    } catch {
      raw = null;
    }
    const days = isPlainObject(raw) && isPlainObject(raw.days) ? raw.days : {};
    const out = {};
    for (const day of Object.keys(days).filter(isDateKey).sort().slice(-RETENTION_DAYS)) {
      if (!isPlainObject(days[day])) continue;
      const clean = {};
      for (const [k, v] of Object.entries(days[day])) if (COUNTER_SET.has(k) && Number.isSafeInteger(v) && v > 0) clean[k] = Math.min(v, MAX_COUNT);
      if (Object.keys(clean).length) out[day] = clean;
    }
    return out;
  }
  function prune(days, today) {
    const keep = Object.keys(days).filter((d) => d <= today).sort().slice(-RETENTION_DAYS);
    return Object.fromEntries(keep.map((d) => [d, days[d]]));
  }

  /* count one event. Never throws; a failure is { ok: false } and nothing else happens. */
  function track(name, properties, screen) {
    try {
      const event = normalizeEvent(name, properties, { screen, now: now() });
      if (!event) return { ok: false, reason: 'UNKNOWN_EVENT' };
      const today = dateKey(event.timestamp);
      const days = read();
      const day = { ...(days[today] || {}) };
      for (const c of countersOf(event)) day[c] = Math.min((day[c] || 0) + 1, MAX_COUNT);
      const next = prune({ ...days, [today]: day }, today);
      return { ok: storage.set('analytics', { schemaVersion: SCHEMA_VERSION, days: next }) === true, event };
    } catch {
      return { ok: false, reason: 'UNAVAILABLE' };
    }
  }

  /* totals over the kept days: { days, total, events: [{ name, label, count, breakdown: [{ key, value, count }] }] } */
  function summary() {
    let days = {};
    try {
      days = read();
    } catch {
      days = {};
    }
    const totals = {};
    for (const day of Object.values(days)) for (const [k, v] of Object.entries(day)) totals[k] = (totals[k] || 0) + v;
    const events = EVENT_NAMES.filter((n) => totals[n] > 0).map((n) => ({
      name: n,
      label: EVENT_LABELS[n],
      count: totals[n],
      breakdown: EVENTS[n].flatMap((k) => PROPERTIES[k].filter((v) => totals[`${n}|${k}=${v}`] > 0).map((v) => ({ key: k, value: v, count: totals[`${n}|${k}=${v}`] }))),
    }));
    const dayKeys = Object.keys(days).sort();
    return { days: dayKeys.length, firstDay: dayKeys[0] || '', lastDay: dayKeys[dayKeys.length - 1] || '', total: events.reduce((n, e) => n + e.count, 0), events, empty: events.length === 0 };
  }

  function reset() {
    try {
      return storage.remove('analytics') === true;
    } catch {
      return false;
    }
  }

  return Object.freeze({ track, summary, reset, transmission: TRANSMISSION, identifiers: IDENTIFIERS, retentionDays: RETENTION_DAYS });
}
