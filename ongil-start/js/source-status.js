/*
 * Data source status (Phase 9) — what each public-data source did DURING THIS VISIT, for the local operations view.
 *
 *   observeSource(source, meta, registry) → the same source object; its load() is recorded
 *   createSourceRegistry()                → list() · clear() · get(id)
 *
 * Recorded per source: state, when it was last asked, how many items came back, and a reason CATEGORY.
 *   NOT_REQUESTED · LOADING · SUCCESS · EMPTY · UNAVAILABLE · ERROR
 * Never recorded: the request, the response, an item, a region or search word, a key, a header, an error message.
 * A reason is one of a closed list; anything else becomes OTHER.
 *
 * Nothing here asks a source by itself: there is no health check and no background request. So nothing is ever
 * "live verified" — a source that was not asked says NOT_REQUESTED, and `configured` is only what an answer implied
 * (YES after an answer, NO after NOT_CONFIGURED / NOT_CONNECTED, otherwise UNKNOWN). Memory only; gone on reload.
 */
export const SOURCE_STATES = Object.freeze(['NOT_REQUESTED', 'LOADING', 'SUCCESS', 'EMPTY', 'UNAVAILABLE', 'ERROR']);
export const SOURCE_STATE_LABELS = Object.freeze({
  NOT_REQUESTED: '이번 방문에 요청하지 않음',
  LOADING: '요청 중',
  SUCCESS: '이번 방문에 응답 받음',
  EMPTY: '응답은 왔지만 항목이 없음',
  UNAVAILABLE: '사용할 수 없음',
  ERROR: '요청 실패',
});
export const REASONS = Object.freeze(['NOT_CONNECTED', 'NOT_CONFIGURED', 'NO_ANSWER', 'REGION_REQUIRED', 'OTHER']);
export const REASON_LABELS = Object.freeze({
  NOT_CONNECTED: '연결된 자료가 없음',
  NOT_CONFIGURED: '서버에 이 자료의 설정이 없음',
  NO_ANSWER: '응답을 받지 못함',
  REGION_REQUIRED: '지역이 정해지지 않음',
  OTHER: '기타',
});
export const CONFIGURED = Object.freeze(['YES', 'NO', 'UNKNOWN']);
/* stated once, for every source: this app never checks a production service on its own */
export const LIVE_VERIFIED = false;

const reasonOf = (value) => (typeof value === 'string' && REASONS.includes(value) ? value : value ? 'OTHER' : '');
const text = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max) : '');

export function createSourceRegistry({ now = () => Date.now() } = {}) {
  const entries = new Map();
  const blank = (meta) => ({ ...meta, state: 'NOT_REQUESTED', requests: 0, lastRequestAt: 0, lastCount: null, lastReason: '', configured: meta.connected === false ? 'NO' : 'UNKNOWN', liveVerified: LIVE_VERIFIED });

  /* meta: { id, label, provider, purpose, features[] , connected } — names only, nothing secret */
  function register(meta) {
    const id = text(meta && meta.id, 40);
    if (!/^[a-z][a-z0-9-]{1,39}$/.test(id)) throw new Error('INVALID_SOURCE');
    const clean = { id, label: text(meta.label, 40) || id, provider: text(meta.provider, 40), purpose: text(meta.purpose, 120), features: (Array.isArray(meta.features) ? meta.features : []).map((f) => text(f, 30)).filter(Boolean).slice(0, 6), connected: meta.connected !== false };
    entries.set(id, blank(clean));
    return id;
  }
  function started(id) {
    const e = entries.get(id);
    if (!e) return;
    entries.set(id, { ...e, state: 'LOADING', requests: e.requests + 1, lastRequestAt: now() });
  }
  /* result: what load() answered — only its state, its reason category and the NUMBER of items are read */
  function finished(id, result, failed) {
    const e = entries.get(id);
    if (!e) return;
    if (failed || !result || typeof result !== 'object') {
      entries.set(id, { ...e, state: 'ERROR', lastCount: null, lastReason: 'OTHER' });
      return;
    }
    const count = Array.isArray(result.items) ? result.items.length : 0;
    if (result.state === 'ready') entries.set(id, { ...e, state: count ? 'SUCCESS' : 'EMPTY', lastCount: count, lastReason: '', configured: 'YES' });
    else if (result.state === 'empty') entries.set(id, { ...e, state: 'EMPTY', lastCount: 0, lastReason: '', configured: 'YES' });
    else {
      const reason = reasonOf(result.reason) || 'OTHER';
      entries.set(id, { ...e, state: reason === 'NO_ANSWER' || reason === 'OTHER' ? 'ERROR' : 'UNAVAILABLE', lastCount: null, lastReason: reason, configured: reason === 'NOT_CONFIGURED' || reason === 'NOT_CONNECTED' ? 'NO' : e.configured });
    }
  }
  const view = (e) => ({ id: e.id, label: e.label, provider: e.provider, purpose: e.purpose, features: [...e.features], connected: e.connected, state: e.state, requests: e.requests, lastRequestAt: e.lastRequestAt, lastCount: e.lastCount, lastReason: e.lastReason, configured: e.configured, liveVerified: e.liveVerified });

  return Object.freeze({
    register,
    started,
    finished,
    list: () => [...entries.values()].map(view),
    get: (id) => (entries.has(id) ? view(entries.get(id)) : null),
    /* forget what was observed (the sources themselves are untouched) */
    clear() {
      for (const [id, e] of entries) entries.set(id, blank({ id: e.id, label: e.label, provider: e.provider, purpose: e.purpose, features: e.features, connected: e.connected }));
      return true;
    },
  });
}

/*
 * Wraps a source so its load() is observed. The source's own behaviour and answer are unchanged; a failure in the
 * registry can never fail the load.
 */
export function observeSource(source, meta, registry) {
  let id = '';
  try {
    id = registry.register({ ...meta, connected: source.connected !== false });
  } catch {
    return source;
  }
  const note = (fn) => {
    try {
      fn();
    } catch {
      /* observation never interferes */
    }
  };
  return Object.freeze({
    ...source,
    async load(...args) {
      note(() => registry.started(id));
      let result;
      try {
        result = await source.load(...args);
      } catch (error) {
        note(() => registry.finished(id, null, true));
        throw error;
      }
      note(() => registry.finished(id, result, false));
      return result;
    },
  });
}
