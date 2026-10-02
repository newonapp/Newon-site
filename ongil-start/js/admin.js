/*
 * 운영 보기 (Admin + Analytics V1, Phase 9) — the facts the local operations view shows, as plain data.
 *
 * This is a LOCAL OPERATIONS VIEW: it describes the copy of ONGIL running in this browser. There is no server
 * behind it, so there is no sign-in, no role check, no audit log, no list of users, no moderation queue and no
 * business metric — ADMIN_MODE says each of those is absent, and nothing here pretends otherwise.
 *
 * Everything is computed from what the code already knows (registries, contracts, the stores' counts) or from what
 * happened during this visit (source-status.js, analytics.js). No "정상" badge is hard-coded and there is no
 * readiness score. Personal content is never read: no title, text, name, amount or health record — where a number
 * about personal data is shown at all it is a COUNT of the user's own community drafts, read without their content.
 * Health and family records are not counted or read here at all.
 *
 * Pure: no DOM, no network. Storage is read only through the handles it is given.
 */
import { isPlainObject, SAVED_TYPES, NOTIFICATION_TYPES } from './contracts.js';
import { COLLECTIONS } from './storage.js';
import { CLASSIFICATION, DATA_CLASSES, maySearchGlobally, familySharingAllowed } from './privacy.js';
import { isSyncable, SYNCABLE_COLLECTIONS } from './account.js';
import { VIEWS, INTERNAL_VIEWS, ROUTE_ALIASES } from './router.js';
import { CONTENT_TYPES, CONTENT_TYPE_IDS, SECTIONED_VIEWS, ADMIN_SECTIONS } from './routes.js';
import { PRIMARY_AREAS } from './areas.js';
import { SOURCE_STATE_LABELS, REASON_LABELS, LIVE_VERIFIED } from './source-status.js';
import { EVENT_NAMES, ALL_COUNTERS, RETENTION_DAYS, TRANSMISSION, IDENTIFIERS } from './analytics.js';
import { DELIVERY, PRODUCERS } from './notifications.js';

export const ADMIN_MODE = Object.freeze({ kind: 'LOCAL_OPERATIONS_VIEW', serverAuth: false, rbac: false, remoteAuditLog: false, remoteUsers: false, remoteModeration: false, remoteAnalytics: false, remoteDataEdit: false, liveProviderChecks: false });
export const ADMIN_TABS = Object.freeze([
  Object.freeze({ id: 'overview', label: '개요' }),
  Object.freeze({ id: 'data', label: '자료' }),
  Object.freeze({ id: 'analytics', label: '사용 기록' }),
  Object.freeze({ id: 'privacy', label: '개인정보' }),
]);
export const adminHash = (section) => (section && section !== 'overview' && ADMIN_SECTIONS.includes(section) ? `#admin/${section}` : '#admin');

/* ───────── feature status ───────── */

export const CAPABILITY_MODES = Object.freeze(['LOCAL_READY', 'PUBLIC_DATA_DEPENDENT', 'BACKEND_REQUIRED', 'FUTURE']);
export const CAPABILITY_LABELS = Object.freeze({
  LOCAL_READY: '이 기기에서 동작',
  PUBLIC_DATA_DEPENDENT: '공개 자료가 연결돼야 동작',
  BACKEND_REQUIRED: '서버가 있어야 동작 (없음)',
  FUTURE: '아직 만들지 않음',
});
const cap = (label, mode, sources = []) => Object.freeze({ label, mode, sources: Object.freeze(sources) });
/* what each area can do today, by how it works — a description, not a score */
export const FEATURE_CAPABILITIES = Object.freeze({
  home: Object.freeze([cap('오늘의 안부·일정·할 일·루틴·복약·생활', 'LOCAL_READY'), cap('내 주변 강좌', 'PUBLIC_DATA_DEPENDENT', ['lifelong-class']), cap('가족 소식', 'BACKEND_REQUIRED')]),
  life: Object.freeze([cap('캘린더·할 일·루틴·식사·물·운동·수면·생활비·기록', 'LOCAL_READY'), cap('건강 기록 (안부·증상·복약·건강 메모)', 'LOCAL_READY')]),
  health: Object.freeze([cap('안부와 건강 기록 (내 생활 › 건강에서)', 'LOCAL_READY'), cap('도움 요청 보내기·긴급 연락', 'BACKEND_REQUIRED'), cap('병원·검진', 'FUTURE')]),
  family: Object.freeze([cap('공유할 내용 고르기·도움 요청 적어 두기', 'LOCAL_READY'), cap('가족 연결·전달', 'BACKEND_REQUIRED')]),
  care: Object.freeze([cap('기관·시설 찾기', 'PUBLIC_DATA_DEPENDENT', ['care-facility']), cap('돌봄 서비스 정보', 'FUTURE', ['care-services']), cap('복지 혜택 정보', 'FUTURE', ['care-benefits'])]),
  enjoy: Object.freeze([cap('강좌·프로그램', 'PUBLIC_DATA_DEPENDENT', ['lifelong-class']), cap('관광 정보·장소', 'PUBLIC_DATA_DEPENDENT', ['tour-place', 'enjoy-place']), cap('모임', 'FUTURE')]),
  community: Object.freeze([cap('내 글·모임 초안 (이 기기에만)', 'LOCAL_READY'), cap('이웃 글·댓글·공감·신고', 'BACKEND_REQUIRED')]),
  store: Object.freeze([cap('분류·찾기·비교·저장 화면', 'LOCAL_READY'), cap('상품 정보', 'FUTURE', ['products']), cap('결제·주문·배송', 'FUTURE')]),
});

/* per area: its capabilities and how many of its menu entries really work (counted from areas.js) */
export function buildFeatureStatus(areas = PRIMARY_AREAS) {
  return areas.map((a) => {
    const modules = Array.isArray(a.modules) ? a.modules : [];
    const capabilities = (FEATURE_CAPABILITIES[a.id] || []).map((c) => ({ label: c.label, mode: c.mode, modeLabel: CAPABILITY_LABELS[c.mode], sources: [...c.sources] }));
    return { id: a.id, label: a.label, modulesAvailable: modules.filter((m) => m.available === true).length, modulesTotal: modules.length, capabilities };
  });
}

/* ───────── system status ───────── */

/* the environment is only what the address shows; ONGIL reads no server or build configuration */
export function environmentOf(hostname) {
  const h = typeof hostname === 'string' ? hostname.toLowerCase() : '';
  if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]') return { id: 'LOCAL_PREVIEW', label: '로컬 미리보기' };
  return { id: 'UNKNOWN', label: '알 수 없음 (ONGIL은 서버 환경 정보를 읽지 않아요)' };
}
export function buildSystemStatus({ version = '', hostname = '', storage, search }) {
  const providers = search && typeof search.providers === 'function' ? search.providers() : [];
  let stored = [];
  try {
    stored = storage.list();
  } catch {
    stored = [];
  }
  return {
    version: typeof version === 'string' ? version : '',
    environment: environmentOf(hostname),
    storage: { persistent: storage.persistent === true, kind: storage.backendKind === 'local' ? 'local' : 'memory', collectionsDefined: COLLECTIONS.length, collectionsInUse: stored.length },
    routes: { views: VIEWS.length, internalViews: INTERNAL_VIEWS.length, addresses: Object.keys(ROUTE_ALIASES).filter(Boolean).length, sectionedViews: SECTIONED_VIEWS.length },
    search: { providers: providers.length, publicProviders: providers.filter((p) => p.scope === 'PUBLIC').length, privateProviders: providers.filter((p) => p.scope === 'LOCAL_PRIVATE').length },
    savedTypes: SAVED_TYPES.length,
    notificationTypes: NOTIFICATION_TYPES.length,
    analytics: { events: EVENT_NAMES.length, counters: ALL_COUNTERS.length, retentionDays: RETENTION_DAYS },
  };
}

/* ───────── data sources ───────── */

export function buildSourceStatus(registry) {
  const list = registry && typeof registry.list === 'function' ? registry.list() : [];
  return list.map((s) => ({
    id: s.id,
    label: s.label,
    provider: s.provider || '',
    purpose: s.purpose,
    features: s.features,
    connected: s.connected,
    state: s.state,
    stateLabel: SOURCE_STATE_LABELS[s.state] || '',
    requests: s.requests,
    lastRequestAt: s.lastRequestAt,
    lastCount: s.lastCount,
    lastReason: s.lastReason,
    lastReasonLabel: s.lastReason ? REASON_LABELS[s.lastReason] || REASON_LABELS.OTHER : '',
    configured: s.configured,
    liveVerified: LIVE_VERIFIED,
  }));
}

/* ───────── content ───────── */

/* how many entries a collection holds, without normalising or looking at any of them */
export function rawCount(storage, collection) {
  try {
    const raw = storage.get(collection, null);
    return isPlainObject(raw) && Array.isArray(raw.items) ? raw.items.length : 0;
  } catch {
    return 0;
  }
}
/*
 * loaded: { care, enjoy, store } — numbers of public items the screens hold right now (this visit only).
 * saved: counts by type. community: counts of the user's own drafts. No title, text or id is passed in or out.
 */
export function buildContentStatus({ loaded = {}, savedCounts = {}, storage }) {
  const n = (v) => (Number.isSafeInteger(v) && v >= 0 ? v : 0);
  return {
    loadedThisVisit: { care: n(loaded.care), enjoy: n(loaded.enjoy), store: n(loaded.store) },
    saved: CONTENT_TYPE_IDS.map((t) => ({ type: t, label: CONTENT_TYPES[t].label, count: n(savedCounts[t]), syncPolicy: CONTENT_TYPES[t].syncPolicy })),
    communityLocal: { posts: rawCount(storage, 'communityPosts'), groupDrafts: rawCount(storage, 'groupDrafts'), meetupDrafts: rawCount(storage, 'meetupDrafts'), publicPosts: null, reports: null, members: null },
  };
}

/* ───────── search · saved · notifications ───────── */

export function buildSearchOps(search) {
  const providers = search && typeof search.providers === 'function' ? search.providers() : [];
  return {
    providers: providers.map((p) => ({ id: p.id, label: p.label, scope: p.scope, runs: p.scope === 'PUBLIC', supportedTypes: [...p.supportedTypes] })),
    owners: CONTENT_TYPE_IDS.map((t) => ({ type: t, label: CONTENT_TYPES[t].label, ownerLabel: CONTENT_TYPES[t].ownerLabel, route: CONTENT_TYPES[t].route, searchable: CONTENT_TYPES[t].scope === 'PUBLIC' })),
    storesQueries: false,
  };
}
export function buildSavedOps() {
  return CONTENT_TYPE_IDS.map((t) => ({ type: t, label: CONTENT_TYPES[t].label, ownerLabel: CONTENT_TYPES[t].ownerLabel, scope: CONTENT_TYPES[t].scope, syncPolicy: CONTENT_TYPES[t].syncPolicy, external: CONTENT_TYPES[t].external }));
}
export function buildNotificationOps() {
  return {
    delivery: { inApp: DELIVERY.inApp === true, osPush: DELIVERY.push === true, email: DELIVERY.email === true, sms: DELIVERY.sms === true, remote: DELIVERY.server === true },
    types: NOTIFICATION_TYPES.map((t) => ({ id: t.id, label: t.label, producer: PRODUCERS[t.id], produced: PRODUCERS[t.id] !== 'NONE' })),
  };
}

/* ───────── privacy ───────── */

export const CLASS_LABELS = Object.freeze({ PUBLIC: '공개 자료 (저장하지 않음)', APP: '앱 설정·저장함', STANDARD: '일상 기록', PRIVATE: '사적인 기록', HEALTH_ADJACENT: '건강 관련 기록', OPERATIONAL: '사용 기록 집계' });
/* one row per class: which collections it covers and what they may do. PUBLIC content is never stored. */
export function buildPrivacyMatrix() {
  const rows = [{ class: 'PUBLIC', label: CLASS_LABELS.PUBLIC, collections: [], search: 'LOADED_ONLY', sync: 'NO', family: 'PREVIEW_ONLY', community: 'NO', note: '돌봄·즐길거리·스토어에서 이번 방문에 불러온 항목' }];
  for (const cls of DATA_CLASSES) {
    const collections = COLLECTIONS.filter((c) => CLASSIFICATION[c] === cls);
    const searchable = collections.filter(maySearchGlobally);
    const syncable = collections.filter(isSyncable);
    rows.push({
      class: cls,
      label: CLASS_LABELS[cls] || cls,
      collections,
      search: searchable.length ? 'PUBLIC_ITEMS_ONLY' : 'NO',
      sync: syncable.length ? 'ALLOWED_NOT_CONNECTED' : 'NO',
      family: familySharingAllowed() ? 'YES' : 'NO',
      community: 'NO',
      note: cls === 'APP' ? `검색: ${searchable.join(', ') || '없음'} · sync 허용 목록: ${SYNCABLE_COLLECTIONS.join(', ')} (연결 없음, 저장한 글은 제외)` : '',
    });
  }
  return rows;
}
export const PRIVACY_ANSWERS = Object.freeze({ NO: '안 함', LOADED_ONLY: '이번 방문에 불러온 것만', PREVIEW_ONLY: '미리보기만 (전송 없음)', PUBLIC_ITEMS_ONLY: '저장한 공개 항목만', ALLOWED_NOT_CONNECTED: '정책상 허용 (연결 없음)', YES: '함' });

/* ───────── security ───────── */

/* what the client code itself enforces (each is checked by tests) — not a claim that ONGIL as a whole is secure */
export const CLIENT_POLICIES = Object.freeze([
  Object.freeze({ id: 'text-rendering', label: '글자 그리기', detail: '화면은 textContent로만 만든다 (HTML 문자열로 그리지 않음)' }),
  Object.freeze({ id: 'external-url', label: '외부 주소', detail: 'https 주소만, 새 창, noopener' }),
  Object.freeze({ id: 'route-validation', label: '앱 안 주소', detail: '알려진 화면과 section만, 틀린 주소는 화면 자체로 고침' }),
  Object.freeze({ id: 'saved-sync-policy', label: '저장함 sync 정책', detail: '항목별 정책, 저장한 글은 LOCAL_ONLY' }),
  Object.freeze({ id: 'analytics-allowlist', label: '사용 기록', detail: '정해진 이름과 값만 세고, 글·이름·검색어는 받지 않음' }),
]);
/* what does not exist. A production admin needs all three before it may be called secured. */
export const SERVER_GAPS = Object.freeze([
  Object.freeze({ id: 'server-auth', label: '서버 로그인 (SERVER AUTH)', implemented: false }),
  Object.freeze({ id: 'admin-rbac', label: '관리자 권한 (ADMIN RBAC)', implemented: false }),
  Object.freeze({ id: 'remote-audit-log', label: '원격 감사 기록 (REMOTE AUDIT LOG)', implemented: false }),
]);
export function buildSecurityStatus() {
  return { policies: CLIENT_POLICIES.map((p) => ({ ...p })), serverGaps: SERVER_GAPS.map((g) => ({ ...g })), overall: null, transmission: { ...TRANSMISSION }, identifiers: { ...IDENTIFIERS } };
}

export const KNOWN_LIMITATIONS = Object.freeze([
  '이 화면은 로그인이나 권한 확인이 없는 로컬 화면이에요. 보안된 관리자 페이지가 아니에요.',
  '다른 사람의 정보, 회원 수, 이용자 수 같은 숫자는 없어요. 서버가 없어서 알 수 없어요.',
  '공개 자료(강좌·기관·장소·관광)는 사용자가 버튼을 눌러 요청했을 때의 결과만 알아요. 운영 서버를 따로 확인하지 않아요.',
  '사용 기록은 이 기기의 횟수 집계뿐이고 어디로도 보내지 않아요.',
  '커뮤니티의 공개 글, 신고, 운영 처리는 없어요.',
  '알림은 만드는 곳이 없고, 휴대폰 알림(푸시)·문자·이메일도 없어요.',
]);
