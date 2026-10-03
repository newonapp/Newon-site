# LIVON V1 — Product Completion Audit

Branch `livon-v1-completion`, base `51aba9c16` (LIVON RC `cc24713a6` + NEWON backend production hardening `e52cab1c3`).
Nothing was pushed, merged or deployed. No Vercel / GitHub / OpenAI / database setting, variable or key was read, set or changed.
The only contact with production was two read-only `GET` requests to the live API (`/api/health`, `/api/livon/data?action=status`)
and one cross-origin probe from `https://newon.app` (GET + an empty chat `POST` that the server rejects before any AI call).

## How the audit was done

- Every main route and detail route at 1280 px and 320 px in Chromium: script errors, console errors, horizontal overflow,
  unnamed controls, dead links, duplicate ids, broken ARIA references, small targets, placeholder text.
- User journeys end to end: header search vs Explore, save → My Life → unsave → revisit → reload, notifications after
  adding / finishing a to-do, header panels and the mobile menu after following a link, film loading with the film host
  unreachable and reachable, the AI page against a separate API origin.
- Code review of the frontend ↔ backend contract (`livon-api-config.js`, data layer, AI page, user-data adapter) and of the
  backend routes (`/api/health`, `/api/livon/data`, `/api/livon/chat`, `/api/livon/userdata`), plus the live `/api/health`.

## Defects found and fixed

| # | Severity | Area | Defect | Fix | Tests |
|---|---|---|---|---|---|
| 1 | HIGH | Backend integration | The live API (Vercel, `vercel.json` `"trailingSlash": true`) answers `/api/health`, `/api/livon/data`, `/api/livon/chat` with a 308 redirect to the slash URL. A cross-origin fetch from `newon.app` cannot pass that redirect (no CORS headers; a preflight never follows a redirect): verified live — every URL the frontend used failed with "Failed to fetch", the slash URLs answered. With `LIVON_API_ORIGIN` set, AI, live data and sync would all have been unreachable. | `LivonApi.url()` adds the trailing slash for a separate API origin only (same origin and localhost unchanged); the AI page asks the config for the chat URL instead of gluing `"/chat"` onto a base. `vercel.json` is not changed. | LC-16, LC-B6, LB-9 (expectation updated to the slash URLs) |
| 2 | MEDIUM | Search | The header (global) search used its own narrower list: no Life Stage topics, different matching, so it disagreed with Explore (`청약` 1 vs 36, `이직` 1 vs 14, `퇴직` and `치매` 0 vs results). | The header panel answers from the same index as Explore (`LivonSearch`), with a "탐색에서 전체 결과 보기" link; official sites open in a new tab and say so. The old list stays only as a fallback. | LC-1, LC-2, LC-4, LC-B1 |
| 3 | MEDIUM | Privacy (local) | That old header list also showed members-only community posts (Explore shows public posts only). | Fixed by #2; the fallback list now applies the same public-only rule. | LC-3 |
| 4 | MEDIUM | Notifications | The alerts panel was filled once on the first visit and never again: new to-dos and Life Events never appeared, finished or deleted to-dos stayed. | Alerts are derived on every refresh from today's schedule (local date), open to-dos (overdue / due today marked) and active Life Events; preferences still apply; nothing extra is stored. | LC-8 … LC-11, LC-B2 |
| 5 | MEDIUM | Saved | Removing a save whose legacy copy lives in `livon.tdSaved` / `livon.lifeSavedLocal` (e.g. a Today item saved from the 30s family service) came back on the next panel refresh. Legacy plain-string entries without an id were re-imported under a new random id on every refresh. | `removeSave` prunes the legacy lists; the legacy import keeps one stable id per entry and skips entries without one. | LC-5 … LC-7, LC-B3 |
| 6 | MEDIUM | Navigation / accessibility | A link inside a header panel (search result, saved item, alert, profile menu) and every link in the mobile menu drawer changed the screen but left the panel / drawer open over it (the shared `site-chrome.js` closes the drawer only for links to other pages). | On a route change LIVON closes the open header panel and closes the drawer through its own close control; focus continues on the new screen's heading. `site-chrome.js` is not changed. | LC-15, LC-B5 |
| 7 | LOW | Performance | `film-keep.js` (shared) calls `load()` on every hero film at start-up, cancelling and resending the film request LIVON had just started (2 film requests per visit on a working network; up to 4 for an unreachable host — the cause of the intermittent PERF-57 failure). | Header films receive their source after `film-keep.js` start-up; a retry that begins after a failure is counted. Measured: reachable film 2 → 1 request and plays; unreachable host 2–4 → 2 (≤ 3). | LC-12, LC-13, LC-B4, PERF-57 |

| 8 | HIGH | LIVON AI ↔ chat server | The page attached every search hit whose link began with `#` or `https://` as a reference. The chat server accepts only the links in `REF_HREF` and rejects the whole request for one other link. A question that matches a Life Event (`#life-events`) — "첫 취업 준비 방법", "이직", "육아" … — was answered `400 INVALID_CONTEXT`: the user saw "일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해 주세요" instead of the honest "not configured" line, and with AI enabled those questions would never have been answered. Found by sending a real question through the real handlers (`server/livon`) instead of a stub. | The page filters references with the server's own pattern (identical copy, compared by test), bounds link length to the server's 200, and filters job-training references the same way. No server file changed. | LC-17, LC-B8, OPS-15 and lifelong-class "29" (assertions updated to the stricter rule) |
| 9 | HIGH | Help truthfulness | `LIVON_API_ORIGIN` is now set in production. As soon as fix #1 ships, the data server answers and public rows (평생학습 강좌, 마을세무사; place search on demand) appear in Explore and search — while Help › 서비스 상태 and the `live-data` article said "아직 연결되지 않았어요". Reproduced locally with the real data handler, four providers configured, fixture upstreams: 3 public rows in the repository, Help still "not connected". | The status row for public data is computed from what this browser actually received (`LivonData.status()`, providers in state `active`): "일부 연결됨" with the source names, otherwise unchanged. A provider that is only *configured* is never shown as connected. The row follows data that arrives after the page is shown. The `live-data` article (also a static SEO page) now reads true in both deployments. | LC-18, LC-19, LC-B7 |
| 10 | MEDIUM | Privacy wording | Help › "이 기기에 저장되는 것과 서버에 저장되지 않는 것" said the only thing ever sent to a server is an AI question. With a data server, a place or course search sends the search word (and, only after "내 위치 기준으로 찾기", a position rounded to about 100 m). | The article names both cases and says the position is not stored, matching the text on the search screen. | LC-19 |

Cache keys bumped once for the changed scripts (`?v=20261004c1`: `livon-media.js`, `livon-platform.js`,
`livon-api-config.js`, `ai-page.js`; `?v=20261004c2`: `help-data.js`, `help-page.js`); every other version string is unchanged.

## Checked and found working (no change)

Home, Life Stage (7 stages / 228 topics), Life Events, Today, Explore (search, filters, detail, save), My Life (saved,
to-dos, settings), Community (compose, visibility rules, local-only copy), Help, Onboarding (never forced), deep links and
unknown ids, 320 px layout (no page overflow on any route), AI page without a backend (honest "not connected" state, no
invented answer), data layer without providers (curated data, no empty screens), Admin / Data Manager not published, no
analytics transport, user-data API (fail-closed order, server-resolved owner, no client user id).

## Production state reported by the owner (2026-10-04, after the first audit pass)

- Repository variable `LIVON_API_ORIGIN = https://newon-api.vercel.app` is set and GitHub Pages was redeployed; the deployed
  `https://www.newon.app/livon/livon-api-config.js` contains that origin.
- `/api/health`: `status ok`, `protectionConfigured true`, rate limit `shared`, shared cache on; providers configured:
  `kr-kakao-place`, `kr-tourapi`, `kr-lifelong-class`, `kr-public-tax-expert`; `aiConfigured false`; `userdata` enabled / database / auth all `false`.
- What that means for this branch: the frontend that is live today was built **without** fix #1, so its cross-origin API calls
  stop at the 308 redirect (it shows its "not connected" states). Deploying this branch is what makes the data server reachable —
  which is why #8, #9 and #10 had to be fixed in the same change.
- **Configured is not LIVE VERIFIED.** This second pass made no request to the live API (the fetch tool available here refuses
  that host's robots rules, and no other route was used). Provider-by-provider data requests against production remain an open
  check for the live QA. The behaviour above was verified locally with the real handlers and fixture upstreams.
- AI stays "not connected" in every screen and in Help (`aiConfigured false`). No sign-in or sync control is shown (`userdata` disabled, no Newon+ web config).

## Live backend (read-only check, 2026-10-04)

`GET https://newon-api.vercel.app/api/health/` → `status: ok`, `aiConfigured: false`, `protectionConfigured: true`,
data rate limit `shared`, shared cache on, `userdata.enabled/database/auth: false`.

| Provider | Server | Shipped frontend (`LIVON_API_ORIGIN` unset) |
|---|---|---|
| kr-kakao-place | CONFIGURED BUT NOT VERIFIED (key present; no data call made) | NOT USED |
| kr-tourapi | CONFIGURED BUT NOT VERIFIED | NOT USED |
| kr-lifelong-class | CONFIGURED BUT NOT VERIFIED | NOT USED |
| kr-public-tax-expert | CONFIGURED BUT NOT VERIFIED | NOT USED |
| kr-youth-policy | NOT CONFIGURED | NOT USED |
| kr-business-support | NOT CONFIGURED | NOT USED |
| kr-business-event | NOT CONFIGURED | NOT USED |
| kr-job-training | NOT CONFIGURED | NOT USED |
| OpenAI (LIVON AI) | NOT CONFIGURED | NOT USED |
| User data (NEWON+ sync) | NOT CONFIGURED (disabled, no database, no auth) | NOT USED |

## Release classification

| Area | Status |
|---|---|
| Home, Life Stage, Today, Explore, My Life, Search, Saved, Notifications, Onboarding, Help | LOCAL READY (anonymous, this device) |
| Community | LOCAL READY (this device only — by design) |
| SEO | LOCAL READY (index switch is an owner decision: `LIVON_SEO_INDEX`) |
| Accessibility / responsive | LOCAL READY (Chromium; Safari / Firefox / devices not run) |
| Public data | LOCAL READY in code; CONFIGURED in production (4 of 8 providers), NOT LIVE VERIFIED until this branch is deployed and smoke-tested |
| LIVON AI | EXTERNAL CONFIG REQUIRED (`OPENAI_API_KEY` on the API, then Help facts); shown as not connected |
| Account / user data | EXTERNAL CONFIG REQUIRED (NEWON+ Firebase config, auth verification, PostgreSQL — all deferred) |
| Backend integration | LOCAL READY in code (fix #1); not LIVE VERIFIED until `LIVON_API_ORIGIN` is set and smoke-tested |
| Admin / Data Manager | LOCAL READY (local tools, never published) |
| Analytics | NOT USED (no transport) |

## Known issues (not fixed here)

1. After this branch is deployed, a production smoke test is required (AI status line, Help › 서비스 상태, Explore expert / class /
   place results per provider). If AI goes live, the Help facts update (`livon/help-data.js`) belongs in the same release.
1a. The AI page still sends a question to the chat endpoint when the health check said AI is not configured; the server refuses it
   before any AI call and the page shows the honest "연결이 아직 완료되지 않았습니다" line. Left as is (LOW).
2. `vercel.json` Content-Security-Policy-Report-Only for `/livon/` has no `connect-src` entry for a separate API origin. Report-Only and
   only applied when the site itself is served by Vercel (it is served by GitHub Pages), so no effect today; shared file, left unchanged.
3. `film-keep.js` (shared) still issues extra `load()` calls on films that are already playing; LIVON no longer depends on it for
   start-up. Not changed (shared file).
4. Unchanged from the RC: Safari / Firefox / real devices not run, hero film playback on devices not observed, P-04 / P-20 mobile CPU
   timings, My Life export / clear-all have no controls (by design), "LivOn" vs "LIVON" in topic titles.
