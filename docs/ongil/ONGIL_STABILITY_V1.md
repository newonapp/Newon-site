# ONGIL Stability V1

STATUS = LOCAL COMMITS ON `ongil-stability-v1-final` (from `ongil-stability-v1` `8d7e83fb4`) (base main `70a816aa9`, separate worktree from LIVON). PUSH = NO. DEPLOY = NO.

## 1. 502 analysis

### What ONGIL calls

ONGIL has no data server of its own. `ongil-start/js/data-source.js` (the only ONGIL module that may use the network) calls
the LIVON data route `GET <API origin>/api/livon/data` (`server/livon/data/http.mjs`, shared with LIVON):

| ONGIL screen | Provider id | Upstream |
|---|---|---|
| 홈 내 주변 강좌 · 즐길거리 배우기 | `kr-lifelong-class` | data.go.kr 전국평생학습강좌표준데이터 (`api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api`) |
| 돌봄 기관·시설 · 즐길거리 장소 | `kr-kakao-place` | Kakao Local keyword search (`dapi.kakao.com/v2/local/search/keyword.json`) |
| 즐길거리 관광 정보 | `kr-tourapi` | 한국관광공사 TourAPI |

The production API origin read from the live site (`www.newon.app/livon/livon-api-config.js`) is `https://newon-api.vercel.app`.

### Observed on 2026-10-10 (public GET requests, the same ones a person's button sends)

| Request | Answer |
|---|---|
| `?action=status` | `ok: true`; `kr-kakao-place` configured, `kr-lifelong-class` configured, `kr-tourapi` configured |
| `?provider=kr-kakao-place&query=서울 공원&page=1&limit=3` | **502** `{"ok":false,"code":"UPSTREAM_ERROR"}` |
| `?provider=kr-lifelong-class&region=서울&status=open&limit=3` | **502** `{"ok":false,"code":"UPSTREAM_ERROR"}` |
| `?provider=kr-tourapi&region=서울&type=12&page=1&limit=3` | 200, `ok: true`, 770 items (control: the route and the function work) |

### What a 502 UPSTREAM_ERROR can mean (from the code)

`server/livon/data/http.mjs` answers 502 `UPSTREAM_ERROR` when the provider adapter fails with `NETWORK`, `HTTP_4XX`,
`HTTP_5XX`, `PARSE` or `INVALID_DATA` (a quota is 503 `UPSTREAM_LIMIT`, a timeout 504 `TIMEOUT`). So for both providers the
key is set (status says configured) but the call to Kakao / data.go.kr did not give a usable answer. Candidates, all
equally possible from the outside:

- Kakao Local: `HTTP_4XX` (401 key rejected, 403 app/domain/service not enabled), `HTTP_5XX`, network, or a response shape
  the adapter refuses (`PARSE`).
- data.go.kr lifelong: `HTTP_4XX` (also result codes 20/21/30/31/32/33: SERVICE_KEY / ACCESS_DENIED / UNREGISTERED_IP /
  DEADLINE_HAS_EXPIRED), `HTTP_5XX`, network, an XML error the adapter cannot map (`PARSE`), or `INVALID_DATA`.

**Root cause: NOT VERIFIED.** The route writes one fixed diagnostic line per failure in production
(`[LIVON DATA] upstream {provider, stage, category, upstreamStatus, resultCode, errorClass}`) — reading it needs the Vercel
function logs, and Vercel login is out of scope for this task. Calling Kakao or data.go.kr directly would need the
production keys. Nothing in this branch changes the server, the keys or the environment.

Next step for a person with Vercel access: read the `[LIVON DATA] upstream` lines for `kr-kakao-place` and
`kr-lifelong-class`; the `category` + `upstreamStatus` / `resultCode` there name the cause (for example 401 → re-issue or
fix the Kakao REST key; resultCode 30 → the data.go.kr key is not registered for this API).

## 2. What changed (ONGIL only)

- `data-source.js`: every `NO_ANSWER` now also carries `detail` — `OFFLINE` (navigator offline), `NETWORK` (request never
  reached the route), `TIMEOUT` (8 s), `UPSTREAM` (502), `UPSTREAM_SLOW` (504), `LIMIT` (503/429), `SERVER` (other). The
  reasons themselves are unchanged (`source-status.js` and the admin view read them as before). A 502 / 504 gets one quiet
  second try after 0.8 s (GET only); a limit, a refusal or "not configured" is never retried.
- `views.js` (next to `setRegionState`, no new module): `failureText(result, subject)` — what happened, in plain words, ending with what to do;
  never a guessed cause, never a provider blamed. `isRetryable(result)`.
- 홈 내 주변 강좌 and 돌봄 기관 찾기: a temporary failure is shown as `error` (role="alert", "오류:" prefix) with
  **다시 찾기** (the same search again), not as an empty result. 즐길거리: the source line says the kind and is marked
  `data-og-state="error"`; its 찾기 button is next to it.
- Loading (`aria-busy`, polite status), empty ("찾지 못했어요") and error (alert + retry) are now three states everywhere a
  public-data search runs. "Not connected" (`NOT_CONFIGURED` / `NOT_CONNECTED`) keeps its own words and has no retry.
- Import map regenerated (`node scripts/ongil-module-versions.mjs --write`); `app.js` did not change, so its entry
  version stays.

## 3. ONGIL Home V2 and shared code

- Home V2 structure, copy and large-text patch untouched except the failure branch of 내 주변 강좌.
- Shared server code (`server/livon/**`, `api/**`) and every LIVON file: not changed (OST-10). The 502 handling for LIVON is
  done separately on `livon-next-v1` (client side only); the two branches touch no common file.

## 4. Tests

`tests/ongil/stability-v1.test.mjs` OST-01 … OST-12. `API-32` (production-api) and `OG-HM-6` (home-view) carry BEFORE/AFTER
notes: Home's 내 주변 강좌 now has exactly one error state (a temporary failure, with 다시 찾기).
Full ONGIL suite on this branch (2026-10-10): 1106 tests, 1096 pass, 0 fail, 10 skipped (main `70a816aa9`: 1094 / 1084 / 0 / 10).

### Browser (added on `ongil-stability-v1-final`)

`OST-B1 … OST-B3` run the real ONGIL app in Chromium (390 px) with the data route answered by a stub:
loading (`aria-busy="true"`, polite status) → two 502s (exactly one quiet retry, never a third request) → error
(`role="alert"`, "강좌 정보를 주는 곳이 지금 응답하지 않아요…") with 다시 찾기 (44 × 44 px) → 다시 찾기 sends the same
search → empty ("지금 모집 중인 강좌를 찾지 못했어요", no alert, no retry button). A single 502 followed by an answer shows
no error. 504 ×2 → "응답이 늦어요"; 503 → not retried, "요청이 많아"; a provider that is not configured → the plain
"쓸 수 없어요" sentence, no 다시 찾기 and no data request.

## 4a. Enjoy Phase B (`ongil-enjoy-phase-b-production` `f1bc14574`, not deployed)

Files both branches change: `ongil-start/index.html` (import map), `ongil-start/js/data-source.js`,
`ongil-start/js/enjoy-view.js`, `tests/ongil/production-api.test.mjs`. A trial merge of this branch into Phase B
(`ongil-stability-v1-phase-b-trial`, cloud only, not for release) gave two textual conflicts:

| File | Conflict | Resolution |
|---|---|---|
| `ongil-start/index.html` | import-map hashes of `data-source.js`, `enjoy-contracts.js`, `enjoy-view.js` | regenerate with `node scripts/ongil-module-versions.mjs --write` (never hand-edit) |
| `ongil-start/js/enjoy-view.js` | the `views.js` import line; the source-status sentence | import `setRegionState, failureText, isRetryable` (Phase B dropped `REGIONS`); keep Phase B's "일부 지역 자료는 받아오지 못했어요" for a partial answer and Stability's error state + `failureText` for a failed one |

`data-source.js` merges cleanly: Phase B's tour regions and Stability's retry/`detail` touch different lines; Phase B's
merged-region loader returns the first failed part as is, so its `detail` reaches `failureText`.
Phase B also changes LIVON files (`livon/data/livon-data-providers.js`, `livon/explore-page.js`, `livon/index.html`)
that LIVON Next V1 changes too — that is a LIVON ↔ Phase B question, not part of this branch.
Order when Phase B is verified: Phase B first, then this branch with the resolution above, then Phase C.

## 5. Not done

- Root cause of the production 502s (NOT VERIFIED, needs Vercel logs).
- Real iPhone / Android / Safari and screen reader checks.
- Deploy (DEPLOY = NO).
