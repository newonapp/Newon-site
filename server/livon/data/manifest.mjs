/*
 * LIVON Real Data Layer — provider manifest (facts only; single place for operations/docs/tests).
 *
 * Every connected provider is described here by what its adapter really does. Nothing in this file is sent to
 * browsers (the public ?action=status answer stays booleans only). Tests check that the manifest, the route
 * allowlist (http.mjs PROVIDERS), the adapters, .env.example and the browser registry agree.
 *
 *   sourceKind      public            공공기관이 공개한 데이터 (API or published dataset)
 *                   private-platform  민간 플랫폼 API (Kakao) — never presented as official/public data
 *   freshness       source-updated    the API gives an update date per record        → source.updatedAt ("출처 업데이트")
 *                   registered-only   only a registration/announcement date           → metadata.registeredAt ("공고 등록")
 *                   reference-date    dataset 기준일/수정일 (not per record)          → metadata.referenceDate
 *                   fetched-only      no date from the source; LIVON fetch time only  → never shown as an official date
 *   liveVerified    true only after a real keyed call was checked against this adapter. No provider has one yet.
 */
export const PROVIDER_MANIFEST = Object.freeze({
  'kr-youth-policy': {
    entity: 'policy', sourceOrganization: '한국고용정보원 (온통청년)', officialSource: 'https://www.youthcenter.go.kr/',
    sourceKind: 'public', env: 'YOUTHCENTER_API_KEY', mode: 'list',
    capabilities: { search: 'client-index', filters: [], detail: false, pagination: 'bounded window (≤20 upstream pages × 100)' },
    cache: 'server TTL = policy (24 h); failures not cached', freshness: 'source-updated', liveVerified: false
  },
  'kr-business-support': {
    entity: 'policy', sourceOrganization: '중소벤처기업부 (기업마당)', officialSource: 'https://www.bizinfo.go.kr/',
    sourceKind: 'public', env: 'BIZINFO_API_KEY', mode: 'list',
    capabilities: { search: 'client-index', filters: ['category', 'region'], detail: false, pagination: 'bounded window (≤10 upstream pages × 100)' },
    cache: 'server TTL = policy (24 h) per filter; failures not cached', freshness: 'registered-only', liveVerified: false
  },
  'kr-business-event': {
    entity: 'event', sourceOrganization: '중소벤처기업부 (기업마당)', officialSource: 'https://www.bizinfo.go.kr/',
    sourceKind: 'public', env: 'BIZINFO_API_KEY', mode: 'list',
    capabilities: { search: 'client-index', filters: ['category', 'region'], detail: false, pagination: 'bounded window (≤10 upstream pages × 100)' },
    cache: 'server TTL = event (6 h) per filter; failures not cached', freshness: 'registered-only', liveVerified: false
  },
  'kr-kakao-place': {
    entity: 'place', sourceOrganization: '카카오 (Kakao Local API)', officialSource: 'https://developers.kakao.com/docs/ko/local/dev-guide',
    sourceKind: 'private-platform', env: 'KAKAO_REST_API_KEY', mode: 'search',
    capabilities: { search: 'on-demand', filters: ['query', 'category', 'nearby (POST)', 'sort'], detail: false, pagination: '≤45 documents (official window)' },
    cache: 'keyword 1 h (hashed key, shared); nearby 5 min, this instance only; failures not cached', freshness: 'fetched-only', liveVerified: false
  },
  'kr-tourapi': {
    entity: 'place', sourceOrganization: '한국관광공사 (TourAPI)', officialSource: 'https://api.visitkorea.or.kr/',
    sourceKind: 'public', env: 'TOURAPI_SERVICE_KEY', mode: 'search',
    capabilities: { search: 'on-demand', filters: ['query', 'region', 'type', 'nearby (POST)'], detail: true, pagination: '≤50 pages × 20' },
    cache: 'none (저작권 정책: content caching not allowed); concurrent identical requests share one call', freshness: 'source-updated', liveVerified: false
  },
  'kr-lifelong-class': {
    entity: 'program', sourceOrganization: '교육부 · 지방자치단체/교육청 (공공데이터포털)', officialSource: 'https://www.data.go.kr/data/15013110/standard.do',
    sourceKind: 'public', env: 'PUBLIC_DATA_SERVICE_KEY', mode: 'list',
    capabilities: { search: 'client-index + server post-filter', filters: ['query', 'region', 'method', 'status'], detail: false, pagination: 'bounded window (≤3 upstream pages × 1000)' },
    cache: 'server TTL = program (24 h), one window; filters never call upstream; failures not cached', freshness: 'reference-date', liveVerified: false
  },
  'kr-public-tax-expert': {
    entity: 'expert', sourceOrganization: '대구광역시 동구 · 인천광역시 (공공데이터포털)', officialSource: 'https://www.data.go.kr/',
    sourceKind: 'public', env: 'PUBLIC_DATA_SERVICE_KEY', mode: 'list',
    capabilities: { search: 'client-index + server post-filter', filters: ['region', 'query'], detail: false, pagination: 'per-source bounded pages' },
    cache: 'server TTL = expert (7 d); a partial result (one source failed) only 1 h; total failure not cached', freshness: 'reference-date', liveVerified: false
  },
  'kr-job-training': {
    entity: 'program', sourceOrganization: '한국고용정보원 (고용24)', officialSource: 'https://www.work24.go.kr/cm/e/a/0110/selectOpenApiIntro.do',
    sourceKind: 'public', env: 'WORK24_TRAINING_API_KEY', mode: 'search',
    capabilities: { search: 'on-demand', filters: ['query', 'org', 'region', 'method', 'type', 'period'], detail: true, pagination: '≤50 pages × 50' },
    cache: 'list 6 h / detail 24 h (hashed key, shared); failures not cached', freshness: 'fetched-only', liveVerified: false
  }
});

/* Facts, not scores. CODE READY = adapter + route + UI + fixture tests pass on this branch. */
export const READINESS = Object.freeze({
  'kr-youth-policy': ['CODE READY', 'LIVE KEY REQUIRED', 'LIVE VERIFICATION REQUIRED'],
  'kr-business-support': ['CODE READY', 'LIVE KEY REQUIRED', 'LIVE VERIFICATION REQUIRED'],
  'kr-business-event': ['CODE READY', 'LIVE KEY REQUIRED', 'LIVE VERIFICATION REQUIRED'],
  'kr-kakao-place': ['CODE READY', 'LIVE KEY REQUIRED', 'LIVE VERIFICATION REQUIRED'],
  'kr-tourapi': ['CODE READY', 'LIVE KEY REQUIRED', 'LIVE VERIFICATION REQUIRED'],
  'kr-lifelong-class': ['CODE READY', 'LIVE KEY REQUIRED', 'LIVE VERIFICATION REQUIRED'],
  'kr-public-tax-expert': ['CODE READY', 'LIVE KEY REQUIRED', 'LIVE VERIFICATION REQUIRED'],
  'kr-job-training': ['CODE READY', 'LIVE KEY REQUIRED', 'LIVE VERIFICATION REQUIRED']
});

/* Not a provider on this branch. Kept only so the readiness list is complete; nothing routes to it. */
export const BLOCKED_CANDIDATES = Object.freeze({
  'public-law-expert': ['BLOCKED: OFFICIAL SOURCE DOWNLOAD REQUIRED']
});

/* the only env names the data route reads (one per provider; PUBLIC_DATA_SERVICE_KEY is shared by two) */
export const DATA_ENV_KEYS = Object.freeze(['YOUTHCENTER_API_KEY', 'BIZINFO_API_KEY', 'KAKAO_REST_API_KEY', 'TOURAPI_SERVICE_KEY', 'PUBLIC_DATA_SERVICE_KEY', 'WORK24_TRAINING_API_KEY']);
