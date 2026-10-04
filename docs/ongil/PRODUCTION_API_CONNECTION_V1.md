# ONGIL PRODUCTION API CONNECTION V1

Branch `ongil-foundation-v1` · HEAD `e60b58153` (ONGIL Production Release V1, tag `ongil-v1.0.0-rc.1`) · changes
**not committed, not pushed, not deployed**. `main` untouched.

## 1. OBJECTIVE

Connect ONGIL's public-data features (Home 내 주변, 돌봄 기관·시설, 즐길거리) to a real production API:
frontend → https API origin → server route → provider → normalisation → safe response → ONGIL screen.
Reuse what exists; add no backend; put no secret in the frontend; deploy nothing.

## 2. BASELINE

- `git` (read-only, `--no-optional-locks`): branch `ongil-foundation-v1`, HEAD `e60b58153`, in step with
  `origin/ongil-foundation-v1`, working tree clean, tag `ongil-v1.0.0-rc.1` present. No other session active.
- `node --test tests/ongil/*.test.mjs`: **670 / 670** before any change.
- Existing backend tests (`tests/livon/kakao-place`, `tourapi`, `lifelong-class`, `live-backend`): **85 / 85** (run,
  not changed).

## 3. EXISTING BACKEND

Everything needed already exists in the repository (built for LIVON, provider-generic, no user data):

| Piece | File | What it does |
|---|---|---|
| Vercel functions | `api/health.mjs`, `api/livon/data.mjs` | entry points for `/api/health` and `/api/livon/data` |
| Data route | `server/livon/data/http.mjs` | provider allowlist, parameter allowlist and validation, GET (+ one JSON POST for position search, unused by ONGIL), bounded page/limit, fixed upstream URLs, shared-schema validation, cache, in-flight de-duplication, fixed error codes |
| Providers | `server/livon/data/providers/{lifelong-class,kakao-local,tourapi}.mjs` (+5 LIVON-only) | upstream request, timeout (8 s per request; lifelong 25 s total budget), normalisation to the shared entity schema |
| Schema | `livon/data/livon-data-schema.js` (shared with LIVON pages) | URL and text rules for every entity |
| CORS | `server/livon/cors.mjs` | exact https origin allowlist (`LIVON_ALLOWED_ORIGINS`, default `https://www.newon.app`, `https://newon.app`); never `*`; localhost only outside production; no credentials |
| Cache | `server/livon/data/cache.mjs` | memory per instance; Upstash shared cache when configured |
| Health | `server/livon/health.mjs` | status, time, booleans and counts only |
| API-only build | `scripts/vercel-build.mjs`, `vercel.json` | `LIVON_API_ONLY=1` publishes only a noindex page + the functions |
| Frontend config | `livon/livon-api-config.js`, `scripts/livon-api-config.mjs`, Pages workflow | public build variable `LIVON_API_ORIGIN` → `window.LivonApi` (https origin only) |
| ONGIL client | `ongil-start/js/data-source.js` (+ `app.js` reads `window.LivonApi`) | GET only, `credentials: 'omit'`, 8 s timeout, status first, region/word only |

Setup documented in `docs/livon/live-backend.md`, which states that the Vercel project, domain and keys **do not
exist yet**.

## 4. REUSED COMPONENTS

All of section 3. **No new backend, route, provider, config file or dependency was added; no server, LIVON or
shared file was changed.** ONGIL already reads the shared API config, so no ONGIL-local config was needed.

## 5. ARCHITECTURE

```
www.newon.app/ongil-start/  (GitHub Pages, static)
   │  window.LivonApi.base  ← /livon/livon-api-config.js  ← build variable LIVON_API_ORIGIN (public)
   └─HTTPS GET─▶ https://<API origin>/api/livon/data?…   (Vercel project, LIVON_API_ONLY=1)
                   CORS allowlist → provider allowlist → parameter checks → cache / one upstream call
                   → provider adapter (fixed URL, server key) → shared schema → { ok, provider, items, … }
                 ◀── ONGIL normalises again (enjoy-contracts / care-contracts) → screen
```

## 6. DEPLOYMENT TARGET

Vercel, as a separate **API-only** project from this repository (`LIVON_API_ONLY=1`), per the existing design. The
static site stays on GitHub Pages. API DOMAIN = **NOT CONFIGURED** (no Vercel project or custom domain exists yet;
`api.newon.app/api/health` and `www.newon.app/api/livon/data` both answer 404 today). No domain is assumed in code.

## 7. API ROUTES

ONGIL uses only:

| Request | Used by |
|---|---|
| `GET /api/livon/data?action=status` | every search, first (booleans per provider) |
| `GET …?provider=kr-lifelong-class&region=<시·도>[&query=<word>]&status=open&limit=<≤50>` | Home 내 주변, 즐길거리 강좌 |
| `GET …?provider=kr-kakao-place&query=<시·도> <word>&page=1&limit=15` | 돌봄 기관·시설, 즐길거리 장소 |
| `GET …?provider=kr-tourapi&region=<7 시·도>&type=<12|14|28>&page=1&limit=20` | 즐길거리 관광지·문화시설·레포츠 |

Parameters ever sent: `action, provider, region, query, status, limit, page, type` (checked in the browser harness
and by API-28). No request body, no coordinates, no cookies.

## 8. HEALTH

`GET /api/health` (existing contract kept): `status, service, time, ai{…}, data.providers{<id>: {configured}},
configuredCount, total, userdata{…}` — booleans, counts and a timestamp. API-07 checks that no key value appears.

## 9. PROVIDERS

| Provider | Route | ONGIL use | Upstream |
|---|---|---|---|
| kr-lifelong-class | list (cached window, server-side filter) | 강좌 | 공공데이터포털 전국평생학습강좌표준데이터 |
| kr-kakao-place | on-demand keyword search | 장소, 기관·시설 | Kakao Local |
| kr-tourapi | on-demand area list | 관광지 12, 문화시설 14, 레포츠 28 | 한국관광공사 KorService2 |

## 10. LIFELONG

Key `PUBLIC_DATA_SERVICE_KEY` (server). Region must be a 시·도 name; query ≤ 50 chars; `status=open` only;
`limit` ≤ 100 (ONGIL asks 6 on Home, 20 in 즐길거리). ONGIL turns each entity into a CLASS item; the homepage is kept
only when it is https.

## 11. KAKAO

Key `KAKAO_REST_API_KEY` (server, sent only in the `Authorization` header). ONGIL sends `"<시·도> <word>"` (공원,
박물관, 미술관, 공연장, 영화관, 수영장, 체육관, 도서관; 노인복지관, 행정복지센터, 보건소, 치매안심센터, 장기요양기관). No position is ever
sent (no geolocation). 15 per page, 45 pageable. Results cached 1 h under a hashed key (no plain query stored).

## 12. TOURAPI

Key `TOURAPI_SERVICE_KEY` (server). Regions: 서울 부산 대구 인천 광주 대전 경기 (the adapter's code list; ONGIL refuses
others itself with "관광 정보는 아직 … 만 찾을 수 있어요"). Types 12, 14, 28 only — lodging 32, shopping 38 and restaurants 39
are valid on the route but never asked by ONGIL (API-04). Not cached on the server (copyright policy); identical
concurrent requests share one call.

## 13. ENVIRONMENT VARIABLES

Names read by the code (values not shown, not read):

| Name | Required | Purpose | Configured |
|---|---|---|---|
| `PUBLIC_DATA_SERVICE_KEY` | required (lifelong) | 공공데이터포털 key, server | UNKNOWN (no Vercel project yet) |
| `KAKAO_REST_API_KEY` | required (Kakao) | Kakao Local REST key, server | UNKNOWN |
| `TOURAPI_SERVICE_KEY` | required (TourAPI) | 한국관광공사 key (Decoding), server | UNKNOWN |
| `LIVON_API_ONLY` | required for the API project | `1` = API-only build | UNKNOWN |
| `LIVON_ALLOWED_ORIGINS` | optional | CORS allowlist; default www.newon.app, newon.app | UNKNOWN (default is right) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | optional for the data route | shared cache (memory otherwise) | UNKNOWN |
| `LIVON_DATA_DIAGNOSTICS` | optional, dev only | diagnostics outside production | not for production |
| `LIVON_API_ORIGIN` | required for the frontend to use the API | GitHub repository **variable** (public) | NO (production config file has `""`) |

## 14. CORS

Default allowlist `https://www.newon.app`, `https://newon.app` (both are the site's names: `CNAME` is
`www.newon.app`). The route answers the exact origin, never `*`, no credentials; any other site gets 403 **before**
an upstream call (API-CORS). Preflight max-age 600 s.

## 15. RATE LIMIT

The data route has **no per-client rate limit** (the existing limiter `server/livon/ratelimit.mjs` is used by the AI
and account routes, and fails closed without Upstash in production — adding it to the data route would take LIVON's
data features down wherever Upstash is not set). Protection today: allowlisted providers and parameters, bounded
pages, keyword cache (1 h), list cache, in-flight de-duplication, upstream quotas surfaced as `UPSTREAM_LIMIT` (503)
→ ONGIL "받아오지 못했어요". Recorded as a known limitation; a data-route limit is a shared-backend decision.

## 16. CACHE

Lifelong: one cached window per provider (TTL from `livon-data-config.js`). Kakao: 1 h per hashed query (5 min,
memory-only, for position searches ONGIL does not make). TourAPI: none (policy). With Upstash set the cache is
shared across instances; otherwise per instance. Failures are never cached.

## 17. TIMEOUT

Server: 8 s per upstream request (lifelong 25 s total). Client: ONGIL aborts after 8 s and shows "받아오지 못했어요".
One stalled source never blocks another source or screen (API-09, API-21…25).

## 18. NORMALISATION

Route: shared schema drops invalid rows; a response whose rows all fail is an error, not "0 results". ONGIL: every
item goes through `fromLifelong` / `fromKakaoPlace` / `fromTourPlace` + `sanitizeEnjoyItems`, or `cleanFacility` +
`sanitizeCareItems`: bad ids, empty names, unsafe links and duplicates are dropped item by item.

**Contract gaps found by running ONGIL against the real route (fixed in ONGIL only):**

1. Kakao returns its place pages as `http://place.map.kakao.com/<id>`; ONGIL's map-link rule was https-only, so in
   production every Kakao map link would have been dropped. `care-contracts.js mapUrl()` now upgrades exactly
   `http://place.map.kakao.com` (no port) to https; every other http link is still refused.
2. TourAPI entities name the 시·도 in full (`서울특별시`); ONGIL's regions are short (`서울`), so TourAPI places had no
   region (region filter and labels empty). `enjoy-contracts.js regionName()` maps the 17 full names to the short
   ones; anything else stays empty.
3. "Not connected" and "could not load" were not told apart: an outage, a 5xx or a non-JSON answer at the status
   step read as "아직 연결되지 않았어요". `data-source.js` now says NOT_CONFIGURED only for a missing route (404/405) or
   a provider with no key, and NO_ANSWER for offline / 5xx / bad answers; Home 내 주변 shows
   "지금은 강좌 정보를 받아오지 못했어요. 잠시 뒤 다시 눌러 주세요." for NO_ANSWER (돌봄 and 즐길거리 already had their messages).

## 19. ERROR HANDLING

Route errors are `{ ok: false, code, error }` with fixed codes (BAD_REQUEST, UNKNOWN_PROVIDER, NOT_CONFIGURED,
UPSTREAM_ERROR, TIMEOUT, UPSTREAM_LIMIT, ORIGIN_NOT_ALLOWED, SERVER_ERROR) and a Korean sentence; upstream bodies,
keys, URLs and paths are never returned (API-08) and the server logs only code + status (and nothing on Vercel).
ONGIL shows its own short sentences, never the route's text.

## 20. FRONTEND CONFIG

Reused as is: `LIVON_API_ORIGIN` (GitHub repository variable) → `scripts/livon-api-config.mjs` (https origin only;
http, paths, credentials, wildcards, `javascript:`/`data:`/`file:` ignored — API-17) → `livon/livon-api-config.js`
→ `window.LivonApi` → ONGIL `app.js` `apiUrl`. Empty → same origin → 404 on Pages → "아직 연결되지 않았어요" (API-16). No
localhost, Vercel or api.newon.app address is written in ONGIL (API-31). No ONGIL-local config was added because the
shared file already does exactly this and no shared/LIVON change was needed.

## 21. HOME

내 주변: button only (no automatic request, no geolocation), the region from 내 정보, 6 open classes. States: ready
(rows), empty ("지금 모집 중인 강좌를 찾지 못했어요."), not connected, could not load — each distinct.

## 22. CARE

Only 기관·시설 (Kakao) is live-capable. 돌봄 서비스 and 혜택·복지 have **no source** and stay "not connected"; no new
public API was added.

## 23. ENJOY

강좌 (lifelong), 장소 (Kakao), 관광 정보 (TourAPI). Search / filters / detail / save / calendar unchanged. No
recommendation, popularity, review or availability is produced. Kakao map links open as https in a new window
(`noopener noreferrer`).

## 24. SEARCH

Global search covers only items loaded on a screen during the visit; typing in search makes **no** API request
(API-27; browser: 8 requests before and after two searches).

## 25. SAVED

Live items are saved as the existing minimal snapshot (type, id, title, a short description, link, source name):
no coordinates, no raw provider fields (API-26; browser: `description,href,id,key,savedAt,schemaVersion,source,
title,type`).

## 26. PRIVACY

Only a region name, a public search word or a fixed type code leaves the browser, after a button press. Family
settings, health notes, symptoms, medication, check-ins, journal, expenses, community drafts and assistant text are
never sent: the modules that hold them do not import the data client (API-28…30); the analytics store stays local.

## 27. SECURITY

Provider allowlist (unknown → 404, API-02); method allowlist (GET + one JSON POST action); parameter allowlist and
duplicates refused (API-03); region/type/page/limit validation (API-04, API-05); no URL parameter and fixed upstream
hosts — no SSRF path (API-06); keys only in server env and headers (API-07); sanitised errors (API-08); timeouts
(API-09); CORS exact allowlist (API-CORS); no rate limit on the data route (section 15).

## 28. TESTS

`node --test tests/ongil/*.test.mjs` → **695 / 695** (670 + 25 in `tests/ongil/production-api.test.mjs`). The new
suite runs ONGIL's real clients against the **real** route code with fake upstream providers (documented response
shapes) — it is what found the three gaps in section 18.

| ID | Covers |
|---|---|
| API-01 … 08 | allowlist, unknown provider, query, region, pagination, arbitrary URL, secrets, sanitised errors |
| API-09, 10 | timeout isolation, malformed upstream |
| API-11 … 15 | lifelong, Kakao, TourAPI normalisation end to end; duplicates; unsafe links |
| API-16 … 20 | missing / invalid API origin; route 503, upstream 500, offline |
| API-21 … 25 | one provider failing never affects another |
| API-CORS | exact origin, other sites refused before upstream |
| API-26 … 30 | saved snapshot, search loaded-only, nothing private sent |
| API-31 | API-only Vercel build, public frontend variable, no key or API host in ONGIL |
| API-32 | "not connected" vs "could not load" |

Existing assertions changed (each commented; none deleted or skipped):

| Test | Before | After | Why |
|---|---|---|---|
| care-data OG-CR-11 | `http://place.map.kakao.com/1` refused | upgraded to `https://place.map.kakao.com/1`; other http hosts / ports refused | the live Kakao route gives http place links (section 18) |
| assistant OG-AI-78, release-hardening RH-45 | 22 test files | 23 | `production-api.test.mjs` added |
| admin-analytics OG-AQ-20 | file list without `production-api` | with it | same |

## 29. LIVE VERIFICATION

**LIVE VERIFIED = NO.** No API is deployed (no Vercel project, no domain), no provider key is available to this
environment, and outbound requests to the site and API hosts are blocked here. Nothing in this document is a live
result: every success above is the real route code with fake upstream answers.

## 30. BROWSER QA

The published ONGIL files served locally; the browser talks to a separate origin (`https://api.example.test`)
answered by the **real route code** with fake upstream answers; `/livon/livon-api-config.js` carries that origin.

Configured, at 320 / 390 / 820 / 1440: Home 내 주변 6 classes; 돌봄 기관 5; 즐길거리 관광지 4 and 장소 5; a long unbroken
place name wraps in the detail; the map link is `https://place.map.kakao.com/…` (new window, `noopener noreferrer`);
saving gives the minimal snapshot and shows in 저장; global search finds a loaded item without a request.
No overflow, no "undefined / null", 0 console errors from ONGIL, 0 page errors.

## 31. FAILURE QA

At 390, each forced state:

| State | Home 내 주변 | 돌봄 기관 | 즐길거리 |
|---|---|---|---|
| route has no keys (503 at search, status says not configured) | 아직 연결되지 않았어요 | 아직 연결되지 않았어요 | 이 자료는 아직 연결되지 않았어요 |
| upstream 500 (route 502) | 받아오지 못했어요 · 다시 눌러 주세요 | 받아오지 못했어요 | 받아오지 못했어요 |
| answer not JSON | 받아오지 못했어요 | 받아오지 못했어요 | 받아오지 못했어요 |
| empty upstream | 모집 중인 강좌를 찾지 못했어요 | 서울에서 …을(를) 찾지 못했어요 | 서울에서 찾지 못했어요 |
| TourAPI down, others fine | 6 classes | 5 places | 관광 정보 받아오지 못했어요 · 장소 5 |
| offline | 받아오지 못했어요 | 받아오지 못했어요 | 받아오지 못했어요 |

Other screens unaffected in every state; blank screen 0; fake results 0; crashes 0. Timeouts: API-09.

## 32. PERFORMANCE

No request at start-up or on entering a screen; only on the person's 찾기 / 강좌 찾아보기 press: one status request +
one data request per search. The status request is repeated per search (small, cached by nothing); de-duplication
of identical concurrent upstream calls happens on the server.

## 33. KNOWN LIMITATIONS

Not live (no deployed API, no keys); no per-client rate limit on the data route; 돌봄 서비스 / 혜택 have no source;
Store has no product source; TourAPI covers 7 시·도; Kakao is a private map platform (named as such, never "공식");
the status request is not cached in the browser; Newon+, remote family, public community and any AI model remain
out of scope.

## 34. DEPLOYMENT STEPS (owner, after approval — nothing here was done)

1. Commit and push this branch (files in section 36); merge to `main` is a separate, later step.
2. Vercel: create a project from this repository; set `LIVON_API_ONLY=1`; set `PUBLIC_DATA_SERVICE_KEY`,
   `KAKAO_REST_API_KEY`, `TOURAPI_SERVICE_KEY` (Production environment, encrypted); optionally Upstash
   (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) and `LIVON_ALLOWED_ORIGINS` (default already right). Kakao
   console: register the API's server use as the key's platform requires.
3. Deploy the Vercel project; open `https://<project>.vercel.app/api/health` → `status: "ok"` and
   `data.providers` shows `configured: true` for the three providers.
4. Check one request per provider from a terminal (generic words only), e.g.
   `…/api/livon/data?provider=kr-kakao-place&query=서울%20공원&page=1&limit=3`; `…?provider=kr-tourapi&region=서울&type=12&page=1&limit=3`;
   `…?provider=kr-lifelong-class&region=서울&status=open&limit=3`.
5. GitHub → Settings → Secrets and variables → Actions → **Variables**: `LIVON_API_ORIGIN = https://<project>.vercel.app`
   (or the custom domain once DNS exists). It is public; never put a key there.
6. Deploy the frontend (fast-forward `main`, Phase 12 procedure). Then in production: Home 내 주변, 돌봄 기관, 즐길거리 —
   one search each, a source/map link, save one item. Only then: LIVE VERIFIED = YES.

## 35. ROLLBACK

- Frontend: clear the `LIVON_API_ORIGIN` variable and re-run the Pages workflow → ONGIL is back to "not connected"
  (no data loss; local data untouched). Code: `git revert` of the commit carrying sections 18's changes.
- API: in Vercel, promote the previous deployment or remove the provider keys (routes answer NOT_CONFIGURED).
- No storage format changed; saved items from live searches stay valid.

## 36. FILES

Created: `tests/ongil/production-api.test.mjs`, `docs/ongil/PRODUCTION_API_CONNECTION_V1.md`.
Modified: `ongil-start/js/data-source.js`, `ongil-start/js/home-explore.js`, `ongil-start/js/care-contracts.js`,
`ongil-start/js/enjoy-contracts.js`, `tests/ongil/care-data.test.mjs`, `tests/ongil/assistant.test.mjs`,
`tests/ongil/release-hardening.test.mjs`, `tests/ongil/admin-analytics.test.mjs`.
Server, LIVON frontend and shared files: not modified.
