/*
 * ONGIL data contracts (Phase 1 foundation).
 *
 * Plain validation/normalisation only: no DOM, no storage, no network. Every object that is written to
 * storage passes through one of the normalise* functions here, so a later account-sync adapter and the
 * UI agree on one shape.
 *
 * Implemented now:  Profile · Preference · SavedItem · Notification (shape only)
 * Reserved for later phases (names only, see docs/ongil/PHASE_1_FOUNDATION_V1.md): FUTURE_CONTRACTS
 */

export const SCHEMA_VERSION = 1;

export class ContractError extends Error {
  constructor(code) {
    super(code);
    this.name = 'ContractError';
    this.code = code;
  }
}

const opt = (id, label) => Object.freeze({ id, label });
const ids = (list) => list.map((x) => x.id);

export const SAVED_TYPES = Object.freeze(['SERVICE', 'BENEFIT', 'FACILITY', 'PROGRAM', 'PLACE', 'POST', 'PRODUCT']);
export const SAVED_TYPE_LABELS = Object.freeze({
  SERVICE: '서비스',
  BENEFIT: '혜택·복지',
  FACILITY: '기관·시설',
  PROGRAM: '프로그램',
  PLACE: '장소',
  POST: '글',
  PRODUCT: '상품',
});

export const USAGE_MODES = Object.freeze([opt('self', '내가 사용'), opt('with-family', '가족과 함께 사용')]);

export const AGE_RANGES = Object.freeze([
  opt('under-60', '60세 미만'),
  opt('60s', '60대'),
  opt('70s', '70대'),
  opt('80-plus', '80세 이상'),
]);

export const REGIONS = Object.freeze(
  ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map((name) =>
    opt(name, name)
  )
);

export const INTERESTS = Object.freeze([
  opt('health', '건강'),
  opt('exercise', '운동'),
  opt('hobby', '취미'),
  opt('learning', '배움'),
  opt('culture', '문화'),
  opt('outing', '나들이·여행'),
  opt('community', '모임·이웃'),
  opt('family', '가족'),
]);

export const NEEDS = Object.freeze([
  opt('daily', '일정과 할 일 챙기기'),
  opt('medication', '약 먹는 시간 챙기기'),
  opt('hospital', '병원·검진 일정 챙기기'),
  opt('care', '돌봄·생활 서비스 찾기'),
  opt('welfare', '복지·혜택 정보 보기'),
  opt('digital', '스마트폰 사용 도움'),
  opt('activity', '즐길거리 찾기'),
]);

export const FAMILY_INTENTS = Object.freeze([opt('now', '지금 연결하고 싶어요'), opt('later', '나중에 할게요')]);

export const TEXT_SIZES = Object.freeze([opt('default', '기본'), opt('large', '크게'), opt('xlarge', '아주 크게')]);

/* system = follow the device's "reduce motion" setting · on = play background films · off = keep them still */
export const MOTION_MODES = Object.freeze([opt('system', '기기 설정 따르기'), opt('on', '영상 재생'), opt('off', '영상 멈춤')]);

export const NOTIFICATION_TYPES = Object.freeze([
  opt('CHECK_IN', '안부'),
  opt('SCHEDULE', '일정'),
  opt('MEDICATION', '복약'),
  opt('FAMILY', '가족'),
  opt('SERVICE', '돌봄·서비스'),
  opt('PROGRAM', '프로그램'),
  opt('COMMUNITY', '커뮤니티'),
  opt('STORE', '스토어'),
  opt('SYSTEM', 'ONGIL 안내'),
]);

export const NOTIFICATION_PRESETS = Object.freeze([
  opt('all', '모두 받기'),
  opt('important', '꼭 필요한 것만 (안부·일정·복약·가족·안내)'),
  opt('none', '받지 않기'),
]);
const IMPORTANT_TYPES = Object.freeze(['CHECK_IN', 'SCHEDULE', 'MEDICATION', 'FAMILY', 'SYSTEM']);

/* Named now so later phases extend one list instead of inventing parallel shapes. Not implemented in Phase 1. */
export const FUTURE_CONTRACTS = Object.freeze([
  'CheckIn',
  'CalendarEvent',
  'Task',
  'Routine',
  'Medication',
  'FamilyConnection',
  'FamilyPermission',
  'CareService',
  'Program',
  'Place',
  'CommunityPost',
  'Product',
  'Notification',
]);

export const LIMITS = Object.freeze({ nickname: 20, title: 120, description: 300, id: 160, href: 500, source: 60, savedItems: 500, query: 60 });

/* ───────── primitives ───────── */

export function isPlainObject(v) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

/* Text is always rendered with textContent; this only bounds it and drops control characters. */
export function safeText(value, max) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/* In-app hash, same-site path, or https URL. Anything else (javascript:, data:, //host, http:) becomes ''. */
export function safeHref(value) {
  if (typeof value !== 'string') return '';
  const v = value.trim();
  if (!v || v.length > LIMITS.href) return '';
  // eslint-disable-next-line no-control-regex
  if (/[\u0000- \u007f"'<>\\]/.test(v)) return '';
  if (/^#[A-Za-z0-9][A-Za-z0-9_\-/]*$/.test(v)) return v;
  if (/^\/(?!\/)[^\s]*$/.test(v)) return v;
  if (/^https:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      return u.protocol === 'https:' && u.hostname && !u.username && !u.password ? u.href : '';
    } catch {
      return '';
    }
  }
  return '';
}

function oneOf(value, options, fallback = '') {
  return typeof value === 'string' && ids(options).includes(value) ? value : fallback;
}
function manyOf(value, options) {
  if (!Array.isArray(value)) return [];
  const allowed = ids(options);
  return allowed.filter((id) => value.includes(id));
}
function timestamp(value, fallback) {
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

/* ───────── Profile ───────── */

export function emptyProfile() {
  return { schemaVersion: SCHEMA_VERSION, nickname: '', usageMode: '', ageRange: '', region: '', interests: [], needs: [], familyIntent: '', updatedAt: 0 };
}

/* Unknown fields are dropped (no mass assignment). No real name, birth date, phone or address is accepted. */
export function normalizeProfile(input, now = Date.now()) {
  const src = isPlainObject(input) ? input : {};
  return {
    schemaVersion: SCHEMA_VERSION,
    nickname: safeText(src.nickname, LIMITS.nickname),
    usageMode: oneOf(src.usageMode, USAGE_MODES),
    ageRange: oneOf(src.ageRange, AGE_RANGES),
    region: oneOf(src.region, REGIONS),
    interests: manyOf(src.interests, INTERESTS),
    needs: manyOf(src.needs, NEEDS),
    familyIntent: oneOf(src.familyIntent, FAMILY_INTENTS),
    updatedAt: timestamp(src.updatedAt, now),
  };
}

/* ───────── Preference ───────── */

export function notificationPreset(preset) {
  const out = {};
  for (const t of NOTIFICATION_TYPES) {
    out[t.id] = preset === 'all' ? true : preset === 'important' ? IMPORTANT_TYPES.includes(t.id) : false;
  }
  return out;
}

export function emptyPreferences() {
  return { schemaVersion: SCHEMA_VERSION, textSize: 'default', motion: 'system', notifications: notificationPreset('none'), updatedAt: 0 };
}

export function normalizePreferences(input, now = Date.now()) {
  const src = isPlainObject(input) ? input : {};
  const given = isPlainObject(src.notifications) ? src.notifications : {};
  const notifications = {};
  for (const t of NOTIFICATION_TYPES) notifications[t.id] = given[t.id] === true;
  return {
    schemaVersion: SCHEMA_VERSION,
    textSize: oneOf(src.textSize, TEXT_SIZES, 'default'),
    motion: oneOf(src.motion, MOTION_MODES, 'system'),
    notifications,
    updatedAt: timestamp(src.updatedAt, now),
  };
}

/* ───────── SavedItem ───────── */

export function savedKey(type, id) {
  return `${type}:${id}`;
}

export function normalizeSavedItem(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_ITEM');
  if (!SAVED_TYPES.includes(input.type)) throw new ContractError('INVALID_TYPE');
  const id = typeof input.id === 'string' ? input.id.trim() : '';
  if (!id || id.length > LIMITS.id || !/^[A-Za-z0-9][A-Za-z0-9._:\-]*$/.test(id)) throw new ContractError('INVALID_ID');
  const title = safeText(input.title, LIMITS.title);
  if (!title) throw new ContractError('INVALID_TITLE');
  return {
    schemaVersion: SCHEMA_VERSION,
    key: savedKey(input.type, id),
    type: input.type,
    id,
    title,
    description: safeText(input.description, LIMITS.description),
    href: safeHref(input.href),
    source: safeText(input.source, LIMITS.source),
    savedAt: timestamp(input.savedAt, now),
  };
}

/* ───────── Notification (shape only; nothing produces one in Phase 1) ───────── */

export function normalizeNotification(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_NOTIFICATION');
  if (!ids(NOTIFICATION_TYPES).includes(input.type)) throw new ContractError('INVALID_TYPE');
  const id = typeof input.id === 'string' ? input.id.trim() : '';
  if (!id || id.length > LIMITS.id || !/^[A-Za-z0-9][A-Za-z0-9._:\-]*$/.test(id)) throw new ContractError('INVALID_ID');
  const title = safeText(input.title, LIMITS.title);
  if (!title) throw new ContractError('INVALID_TITLE');
  return {
    schemaVersion: SCHEMA_VERSION,
    id,
    type: input.type,
    title,
    body: safeText(input.body, LIMITS.description),
    href: safeHref(input.href),
    createdAt: timestamp(input.createdAt, now),
    readAt: timestamp(input.readAt, 0),
  };
}
