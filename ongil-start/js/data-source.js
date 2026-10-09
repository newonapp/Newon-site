/*
 * External data sources for ONGIL — the ONLY ONGIL module that may call the network.
 *
 * A source is { id, label, kind, load(params) → { state, items, attribution } } with
 *   state = 'ready' | 'empty' | 'unavailable'
 * 'unavailable' covers everything that is not a usable answer (endpoint missing, provider not configured,
 * timeout, malformed response). It is a normal state, shown as plain words — never as an error dump.
 * Nothing is invented: with no usable answer the item list is empty.
 *
 * Every source goes through the data route that already exists in this repository (GET <api>/api/livon/data,
 * server/livon/data/). The route keeps the API keys on the server and answers ?action=status with booleans only.
 * Whether a production key is set is not known from the code (no provider is live-verified), so every load first
 * asks the route for its status and gives up quietly otherwise. Nothing is requested before the user presses a button.
 *
 *   createLifelongClassSource   kr-lifelong-class   평생학습 강좌      Home 내 주변 (Phase 2A) · 즐길거리 (Phase 5)
 *   createFacilitySource        kr-kakao-place      기관·시설          돌봄·서비스 (Phase 4)
 *   createEnjoyPlaceSource      kr-kakao-place      공원·박물관 …      즐길거리 (Phase 5)
 *   createTourPlaceSource       kr-tourapi          관광지·문화시설·레포츠  즐길거리 (Phase 5)
 *   createUnconnectedSource     —                   no source yet (care services, benefits, events)
 *
 * Normalisation of what comes back lives in the contracts files (care-contracts.js, enjoy-contracts.js); the
 * lifelong-learning answer is normalised once (enjoy-contracts fromLifelong) for both Home and 즐길거리.
 */
import { safeText, REGIONS } from './contracts.js';
import { fromLifelong, normalizeProgram, ENJOY_REGIONS } from './enjoy-contracts.js';

export const SOURCE_STATES = Object.freeze(['ready', 'empty', 'unavailable']);
export const LIFELONG_PROVIDER = 'kr-lifelong-class';
export const KAKAO_PLACE_PROVIDER = 'kr-kakao-place';
export const TOUR_PROVIDER = 'kr-tourapi';
const DATA_PATH = '/api/livon/data';
const TIMEOUT_MS = 8000;
const MAX_ITEMS = 6;

const unavailable = (reason) => ({ state: 'unavailable', reason, items: [], attribution: '' });

/* one small client for the route: GET only, no credentials, a timeout, and null for anything that is not { ok: true } */
function dataClient({ apiUrl, fetcher, timeoutMs = TIMEOUT_MS }) {
  const usable = typeof apiUrl === 'function' && typeof fetcher === 'function';
  /* why the last request gave nothing: 'absent' = no data route at this address (404/405, e.g. GitHub Pages with no API
     origin set) · 'down' = the route did not answer usefully (offline, timeout, 5xx, not JSON, not { ok: true }) */
  let lastFailure = '';
  async function getJson(query) {
    lastFailure = '';
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const response = await fetcher(apiUrl(DATA_PATH) + query, { method: 'GET', headers: { accept: 'application/json' }, credentials: 'omit', signal: controller ? controller.signal : undefined });
      if (!response || !response.ok) {
        lastFailure = response && (response.status === 404 || response.status === 405) ? 'absent' : 'down';
        return null;
      }
      const body = await response.json();
      if (body && typeof body === 'object' && body.ok === true) return body;
      lastFailure = 'down';
      return null;
    } catch {
      lastFailure = 'down';
      return null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  /*
   * status first. 'yes' only when the route says this provider has a key; 'no' when it says it has none or when there
   * is no route at this address; 'down' when the route could not be asked (so the screen says "try again", not
   * "not connected").
   */
  async function configured(provider) {
    const status = await getJson('?action=status');
    if (!status) return lastFailure === 'absent' ? 'no' : 'down';
    const p = status.providers && status.providers[provider];
    return p && p.configured === true ? 'yes' : 'no';
  }
  const notReady = (state) => (state === 'down' ? 'NO_ANSWER' : 'NOT_CONFIGURED');
  return { usable, getJson, configured, notReady };
}

/* ───────── 평생학습 강좌 (kr-lifelong-class) ───────── */

/*
 * load({ region, query?, limit?, category? }) → items: Enjoy CLASS items (enjoy-contracts) with the few display names
 * Home's 내 주변 card uses (href, organizer, venue, period, days, time, attribution) — derived from the same
 * normalised item, so Home and 즐길거리 never normalise the provider differently.
 * Only the region name (and an optional search word) is sent, and only after the user presses a button.
 */
export function createLifelongClassSource({ apiUrl, fetcher, timeoutMs = TIMEOUT_MS } = {}) {
  const api = dataClient({ apiUrl, fetcher, timeoutMs });

  async function load({ region, query = '', limit = MAX_ITEMS, category = 'LEARNING' } = {}) {
    if (!api.usable) return unavailable('NOT_CONNECTED');
    if (!REGIONS.some((r) => r.id === region)) return unavailable('REGION_REQUIRED');
    const q = safeText(query, 30);
    const max = Number.isInteger(limit) && limit >= 1 && limit <= 50 ? limit : MAX_ITEMS;
    const ready = await api.configured(LIFELONG_PROVIDER);
    if (ready !== 'yes') return unavailable(api.notReady(ready));
    const data = await api.getJson(`?provider=${LIFELONG_PROVIDER}&region=${encodeURIComponent(region)}${q ? `&query=${encodeURIComponent(q)}` : ''}&status=open&limit=${max}`);
    if (!data || !Array.isArray(data.items)) return unavailable('NO_ANSWER');
    const items = [];
    for (const raw of data.items) {
      const input = fromLifelong(raw, category);
      if (!input) continue;
      let item;
      try {
        item = normalizeProgram(input);
      } catch {
        continue;
      }
      items.push({ ...item, href: item.sourceUrl, organizer: item.organization, venue: item.location, period: [item.startDate, item.endDate].filter(Boolean).join(' ~ '), days: item.scheduleText, time: '', attribution: item.sourceName });
      if (items.length >= max) break;
    }
    if (items.length === 0) return { state: 'empty', items: [], attribution: '' };
    return { state: 'ready', items, attribution: items[0].attribution };
  }

  return Object.freeze({ id: 'lifelong-class', label: '평생학습 강좌', kind: 'program', load });
}

/* ───────── Phase 4: 돌봄·서비스 — 기관·시설 (kr-kakao-place) ───────── */

/*
 * Facilities (기관·시설) through the existing place search. Kakao Local is a private platform, so the source is
 * named as such and its map page is offered as a map link — never as an official source. Only "<시·도> <기관 종류>"
 * is sent (e.g. "서울 보건소"), and only after the user presses the button. Public care services and benefits have
 * NO source in this repository yet (createUnconnectedSource).
 */
const FACILITY_LIMIT = 15;

function cleanFacility(raw, kind) {
  if (!raw || typeof raw !== 'object' || raw.type !== 'place') return null;
  const providerId = typeof raw.providerId === 'string' && /^\d{1,20}$/.test(raw.providerId) ? raw.providerId : '';
  const name = safeText(raw.title, 120);
  if (!providerId || !name) return null;
  const loc = raw.location && typeof raw.location === 'object' ? raw.location : {};
  const contact = raw.contact && typeof raw.contact === 'object' ? raw.contact : {};
  return {
    type: 'FACILITY',
    id: `kakao-${providerId}`,
    name,
    kind,
    placeType: safeText(raw.placeType, 80),
    address: safeText(loc.roadAddress || loc.address, 160),
    region: REGIONS.some((r) => r.id === loc.region) ? loc.region : '',
    phone: typeof contact.phone === 'string' ? contact.phone : '',
    sourceName: '카카오 (Kakao Local)',
    sourceUrl: '',
    mapUrl: typeof raw.mapUrl === 'string' ? raw.mapUrl : '',
    updatedAt: '',
  };
}

async function kakaoSearch(api, words, limit) {
  const ready = await api.configured(KAKAO_PLACE_PROVIDER);
  if (ready !== 'yes') return { error: api.notReady(ready) };
  const data = await api.getJson(`?provider=${KAKAO_PLACE_PROVIDER}&query=${encodeURIComponent(words)}&page=1&limit=${limit}`);
  if (!data || !Array.isArray(data.items)) return { error: 'NO_ANSWER' };
  return { items: data.items };
}

export function createFacilitySource({ apiUrl, fetcher, timeoutMs = TIMEOUT_MS } = {}) {
  const api = dataClient({ apiUrl, fetcher, timeoutMs });
  /* load({ region, kind: { id, query } }) → { state, items (raw Facility input — care-contracts sanitises), attribution } */
  async function load({ region, kind } = {}) {
    if (!api.usable) return unavailable('NOT_CONNECTED');
    if (!REGIONS.some((r) => r.id === region)) return unavailable('REGION_REQUIRED');
    if (!kind || typeof kind.query !== 'string' || !/^[가-힣 ()]{2,20}$/.test(kind.query)) return unavailable('KIND_REQUIRED');
    const r = await kakaoSearch(api, `${region} ${kind.query}`, FACILITY_LIMIT);
    if (r.error) return unavailable(r.error);
    const items = r.items.map((raw) => cleanFacility(raw, kind.id)).filter(Boolean).slice(0, FACILITY_LIMIT);
    if (items.length === 0) return { state: 'empty', items: [], attribution: '' };
    return { state: 'ready', items, attribution: '장소 정보 출처: Kakao Local (민간 지도 서비스, 공식 기관 자료 아님)' };
  }
  return Object.freeze({ id: 'facility', label: '기관·시설', kind: 'facility', load });
}

/* ───────── Phase 5: 즐길거리 — places ───────── */

/*
 * Enjoyable places by a search word (공원, 박물관 …) through the same Kakao route. Raw answers are returned; the
 * 즐길거리 screen normalises them with enjoy-contracts fromKakaoPlace (same model as every other Enjoy place).
 */
const PLACE_LIMIT = 15;
export function createEnjoyPlaceSource({ apiUrl, fetcher, timeoutMs = TIMEOUT_MS } = {}) {
  const api = dataClient({ apiUrl, fetcher, timeoutMs });
  async function load({ region, word } = {}) {
    if (!api.usable) return unavailable('NOT_CONNECTED');
    if (!REGIONS.some((r) => r.id === region)) return unavailable('REGION_REQUIRED');
    if (typeof word !== 'string' || !/^[가-힣]{2,10}$/.test(word)) return unavailable('WORD_REQUIRED');
    const r = await kakaoSearch(api, `${region} ${word}`, PLACE_LIMIT);
    if (r.error) return unavailable(r.error);
    const items = r.items.filter((x) => x && typeof x === 'object' && x.type === 'place').slice(0, PLACE_LIMIT);
    if (items.length === 0) return { state: 'empty', items: [], attribution: '' };
    return { state: 'ready', items, attribution: '장소 정보 출처: Kakao Local (민간 지도 서비스)' };
  }
  return Object.freeze({ id: 'enjoy-place', label: '장소 (카카오)', kind: 'place', load });
}

/*
 * 관광지 · 문화시설 · 레포츠 through kr-tourapi (한국관광공사). The route accepts exactly the region names its
 * adapter has a live code for (server/livon/data/providers/tourapi.mjs REGION_CODES) — the whole country, with 광주
 * and 전남 as the one region the tourism data files them under ('광주·전남'). Any other name ('광주' or '전남' alone
 * included) is answered here as 'unavailable' instead of sending a request the route would refuse.
 * 숙박·쇼핑·음식점 are never asked for.
 */
export const TOUR_REGIONS = Object.freeze(ENJOY_REGIONS.map((r) => r.id));
const TOUR_TYPE_IDS = Object.freeze(['12', '14', '28']);
const TOUR_LIMIT = 20;
export function createTourPlaceSource({ apiUrl, fetcher, timeoutMs = TIMEOUT_MS } = {}) {
  const api = dataClient({ apiUrl, fetcher, timeoutMs });
  async function load({ region, contentType } = {}) {
    if (!api.usable) return unavailable('NOT_CONNECTED');
    if (!TOUR_REGIONS.includes(region)) return unavailable(REGIONS.some((r) => r.id === region) ? 'REGION_NOT_SUPPORTED' : 'REGION_REQUIRED');
    if (!TOUR_TYPE_IDS.includes(contentType)) return unavailable('TYPE_REQUIRED');
    const ready = await api.configured(TOUR_PROVIDER);
    if (ready !== 'yes') return unavailable(api.notReady(ready));
    const data = await api.getJson(`?provider=${TOUR_PROVIDER}&region=${encodeURIComponent(region)}&type=${contentType}&page=1&limit=${TOUR_LIMIT}`);
    if (!data || !Array.isArray(data.items)) return unavailable('NO_ANSWER');
    const items = data.items.filter((x) => x && typeof x === 'object' && x.type === 'place').slice(0, TOUR_LIMIT);
    if (items.length === 0) return { state: 'empty', items: [], attribution: '' };
    return { state: 'ready', items, attribution: '관광 정보 출처: 한국관광공사 (TourAPI)' };
  }
  return Object.freeze({ id: 'tour-place', label: '관광 정보', kind: 'place', load });
}

/* services, benefits and events: no source exists yet. Real objects, so a screen has one way to ask and one answer. */
export function createUnconnectedSource(id, label) {
  return Object.freeze({ id, label, kind: id, connected: false, load: async () => unavailable('NOT_CONNECTED') });
}
