# ONGIL PHASE 9 — ADMIN + ANALYTICS V1

Branch `ongil-foundation-v1` · base `aeb190d1f` (ONGIL Cross Product Integration V1) · not committed (git add / commit / push not run).

## 1. OBJECTIVE

Two things, both local and both honest about being local:

1. **운영 보기 (`#admin`)** — a LOCAL OPERATIONS VIEW of the copy of ONGIL running in this browser: what the system is,
   how each feature works, what the public-data sources answered during this visit, what is stored, and what is not
   implemented. It is not a secured admin page and says so in its first line.
2. **Local analytics** — privacy-preserving usage counters: an event contract and allowlists a later backend can
   adopt, stored as daily totals on the device, shown only on the operations view, sent nowhere.

No backend, no Firebase, no remote analytics, no new external API, no dependency, no redesign.

## 2. AUDIT

State before Phase 9 (455 tests):

| Area | State | Finding |
|---|---|---|
| Admin / operations screen | MISSING | nothing showed versions, sources or stored collections; QA read `window.Ongil` by hand |
| Analytics | MISSING | no event was counted anywhere; no contract to hand a future backend |
| Source status | MISSING | each screen knew its own source's state; nothing recorded that a source was asked, or what came back |
| Data classification | EXISTS | `privacy.js` classified 23 collections in 4 classes; no class for non-personal operational data |
| Internal routes | MISSING | every route was a product screen in the menu; an unlisted screen had no place in the router |
| Erase | EXISTS | the account erase clears every `ongil.v1.*` key — a new collection is covered automatically |
| Address correction | BUG | a malformed section typed on the screen already open (`#store` → `#store/SAFETY`) left the wrong address, because the router raises no change when the section stays empty — found in Phase 9 browser QA, fixed (section 4) |

## 3. ADMIN POSITIONING

`ADMIN_MODE` (admin.js) states what this is and is not:

| Field | Value |
|---|---|
| kind | `LOCAL_OPERATIONS_VIEW` |
| serverAuth · rbac · remoteAuditLog | false · false · false |
| remoteUsers · remoteModeration · remoteAnalytics · remoteDataEdit | false (all) |
| liveProviderChecks | false |

On screen: the label "LOCAL OPERATIONS VIEW", the title "운영 보기", and a notice — "로컬 운영 보기입니다 … 서버 로그인,
관리자 권한, 감사 기록이 없으므로 보안된 관리자 페이지가 아닙니다. 다른 사람의 정보는 없습니다."
There is no password, PIN or role prompt: a client-side gate would be a pretend one. The view has no menu entry, no
link and no search result; it is reached by typing the address. Hiding it is not protection and is not described as
protection — the view shows nothing that the person using this browser could not already see in their own data.

## 4. ADMIN ROUTES

| Address | Shows |
|---|---|
| `#admin` (= overview) | 시스템 상태 · 기능 상태 · 콘텐츠 상태 · 알려진 한계 |
| `#admin/data` | 자료 출처 상태 · 통합검색 · 저장함 · 알림 |
| `#admin/analytics` | 사용 기록 |
| `#admin/privacy` | 개인정보 분류 · 보안 상태 |

- `router.js`: `INTERNAL_VIEWS = ['admin']` — resolvable, but not in `VIEWS`, so navigation, areas and the mobile
  menu never list it. `routes.js`: `ADMIN_SECTIONS`, `resolveAdminSection`, and `admin` in the section check.
- Invalid addresses (`#admin/nope`, `#admin/data/x`, `#admin/OVERVIEW`, `#admin/%3Cscript%3E`) show the overview and
  the address bar is corrected to `#admin`.
- Fix for every sectioned screen: `app.js` now also corrects the address on `hashchange`, because the router is
  silent when a malformed section replaces "no section" on the same screen. `replaceState` raises no `hashchange`,
  so there is no loop.
- The pre-paint route map in `index.html` knows `admin`, so the first frame is already the right screen.

## 5. SYSTEM STATUS

`buildSystemStatus()` computes every row; nothing is a hard-coded "OK".

| Row | Source |
|---|---|
| ONGIL 버전 | `APP_VERSION` (`admin-v1`) |
| 환경 | the hostname only: `localhost` / `127.0.0.1` / `[::1]` → 로컬 미리보기, anything else → 알 수 없음. No build or server configuration is read |
| 저장소 | whether the storage backend persists |
| 저장 묶음 | `COLLECTIONS.length` defined (24) · how many hold data now |
| 화면 | 10 product views + 1 internal · number of accepted addresses |
| 통합검색 provider | count, public / private split from the registry |
| 저장함 종류 · 알림 종류 | from `contracts.js` |
| 사용 기록 | number of event names · retention days |

## 6. FEATURE STATUS

Each of the eight areas lists what it can do and HOW, in one of four modes. It is a description, not a score — there
is no percentage, grade or readiness number, and the card says so.

| Mode | Meaning |
|---|---|
| `LOCAL_READY` | works on this device |
| `PUBLIC_DATA_DEPENDENT` | works when the public-data source answers |
| `BACKEND_REQUIRED` | needs a server that does not exist |
| `FUTURE` | not built |

The line "메뉴 N개 가운데 M개 동작" is counted from `areas.js` (`available === true`), not typed in.
Examples: 가족 연결·전달 = BACKEND_REQUIRED; 커뮤니티 이웃 글·댓글·신고 = BACKEND_REQUIRED; 스토어 상품 정보 and
결제·주문·배송 = FUTURE; 돌봄 기관 찾기 and 즐길거리 강좌·관광·장소 = PUBLIC_DATA_DEPENDENT.

## 7. DATA SOURCES

`source-status.js` observes each source's `load()` (a wrapper; the source and its answer are unchanged).

| Source id | Provider | Used by |
|---|---|---|
| lifelong-class | kr-lifelong-class | 홈 › 내 주변, 즐길거리 |
| care-facility | kr-kakao-place | 돌봄·서비스 |
| tour-place | kr-tourapi | 즐길거리 |
| enjoy-place | kr-kakao-place | 즐길거리 |
| care-services · care-benefits · products | none (no data connected) | 돌봄·서비스, 스토어 |

States: `NOT_REQUESTED` · `LOADING` · `SUCCESS` · `EMPTY` · `UNAVAILABLE` · `ERROR`.

- Recorded per source: state, number of requests this visit, time of the last one, number of items, a reason
  CATEGORY (`NOT_CONNECTED`, `NOT_CONFIGURED`, `NO_ANSWER`, `REGION_REQUIRED`, `OTHER`) and `configured`
  (`YES` after an answer, `NO` after NOT_CONFIGURED / NOT_CONNECTED, else `UNKNOWN`).
- Never recorded: the request, the region or search word, the response, an item, an error message, a key, a header.
- ONGIL never asks a source by itself — no health check, no timer. A source that was not asked says
  "이번 방문에 요청하지 않음". The card states "운영 서버 확인: 하지 않음" and never shows the phrase LIVE VERIFIED.
- Memory only: a reload starts again from NOT_REQUESTED. "자료 상태 지우기" forgets the observations, not the sources.
- One failing source says nothing about the others (each has its own entry).

## 8. CONTENT STATUS

Counts only.

- 이번 방문에 불러온 공개 항목 — how many public items the 돌봄 / 즐길거리 / 스토어 screens hold right now. The card
  says this is not a catalogue size and returns to 0 on reload.
- 이 기기의 저장함 — count per saved type.
- 이 기기의 커뮤니티 초안 — number of the user's own posts, group drafts and meetup drafts, counted from the raw
  array length without reading a title or body. Public posts, reports and members: "없음 (서버 없음)" (the data value
  is `null` — unknown, not zero).
- Health records and family settings are neither read nor counted by the view (tested: their collection names do
  not occur in `admin.js` or `admin-view.js`).

## 9. ANALYTICS ARCHITECTURE

```
store method / screen hook ─▶ instrument.js ─▶ analytics.track(name, props, screen)
                                                  │ normalizeEvent → allowlist → closed value sets
                                                  ▼
                                    ongil.v1.analytics  { days: { 'YYYY-MM-DD': { counter: n } } }
                                                  ▼
                                    #admin/analytics (summary) — nowhere else
```

- `analytics.js` — the contract, the allowlists, the counters. No DOM, no network code.
- `instrument.js` — the one place that decides what is counted. `app.js` wraps each store once and hands the
  wrapped store to the screens; screens and stores never import analytics.
- `TRANSMISSION = { remote: false, endpoint: null, batch: false, beacon: false }` and
  `IDENTIFIERS = { userId, deviceId, advertisingId, sessionId, fingerprint: all false }` are exported and tested.
- An event is counted and thrown away: no event list, no timestamp and no order is kept.
- There is no DAU / MAU, user count, revenue, conversion or retention figure — none can be known without a server.

## 10. EVENT CONTRACT

`normalizeEvent(name, properties, { screen, now })` → `{ name, timestamp, screen, properties }` or `null`.

| Field | Rule |
|---|---|
| name | must be on the event allowlist, otherwise the event is refused (`UNKNOWN_EVENT`) |
| timestamp | used only to pick the day the counter belongs to; not stored |
| screen | one of the eleven screen names, otherwise `''`; not stored |
| properties | only the keys listed for that event, and only values from that key's closed set; everything else is dropped silently |

Properties and their closed value sets:

| Property | Values |
|---|---|
| view | home, life, health, family, care, enjoy, community, store, saved, account, admin |
| hasSection | yes, no |
| queryLength | 1-2, 3-5, 6-10, 11+ |
| resultCount | 0, 1-5, 6-20, 21+ |
| providerCount | 0, 1, 2, 3, 4, 5+ |
| outcome | results, partial, no-results, error |
| contentType | SERVICE, BENEFIT, FACILITY, PROGRAM, PLACE, POST, PRODUCT, MENU |

Free text cannot be expressed: there is no property for a query, title, body, name, note, amount, address, phone,
e-mail, location, id, date, status, category or level.

## 11. EVENT ALLOWLIST

| Event | Properties | Counted when |
|---|---|---|
| `app_open` | — | the app starts |
| `screen_view` | view, hasSection | a screen is shown (the section itself is not recorded) |
| `search_submit` | queryLength, resultCount, providerCount, outcome | a global search finishes |
| `search_result_open` | contentType | a search result is opened |
| `saved_add` | contentType | an item is saved (not when it was already saved) |
| `saved_remove` | contentType | an item is removed from saved |
| `checkin_saved` | — | a check-in is saved (not how the person feels) |
| `calendar_event_created` | — | a calendar entry is added |
| `task_created` | — | a task is added |
| `routine_completed` | — | a routine is marked done (not un-marked) |
| `family_settings_changed` | — | a family sharing choice is changed (not which, not to what) |
| `help_request_draft_created` | — | a help request is written down |
| `care_item_opened` | contentType | a 돌봄 item is opened by the person |
| `enjoy_item_opened` | contentType | a 즐길거리 item is opened by the person |
| `product_opened` | — | a product is opened by the person |
| `community_post_saved` | — | a post is saved on this device |
| `group_draft_created` | — | a group draft is created |
| `meetup_draft_created` | — | a meetup draft is created |

Deliberately absent: medication, symptom and health-note events; anything about who the family is; amounts; any
event carrying an item id.

## 12. PRIVACY

- No raw search query: the panel hands over `query.length`; `lengthBucket()` turns it into a range before counting.
- No health data: a check-in is counted as "saved", never its value. Medication, symptoms and health notes are not
  instrumented at all.
- No community text, family detail, expense, address, phone, e-mail or location: `instrument.js` reads only a
  content TYPE (tested: no `.title`, `.body`, `.name`, `.note`, `.amount`, `.address`, `.phone`, `.status`,
  `.category`, `.level` or `.id` access in the module).
- No identifier of any kind and no fingerprint input (no random id, no `navigator`, no cookie).
- No remote transmission: no `fetch`, XHR, beacon, socket or pixel in the five Phase 9 modules; no third-party
  analytics script in the page.
- Classification: the `analytics` collection is class `OPERATIONAL` — not synced, not searched, not shared.

## 13. RETENTION

- `RETENTION_DAYS = 14`. On every write only the newest fourteen days up to today are kept; a day dated in the
  future is dropped. On read, at most fourteen days are shown.
- Bounded: counter names are a finite set (`ALL_COUNTERS`, fewer than 120), so one day is at most that many
  numbers; each is capped at 1,000,000. 7,200 events across every counter stay under 6 KB.
- Damaged storage (bad JSON, wrong shapes, unknown counters, text, negatives, fractions) reads as "no records" or is
  dropped; the next event starts clean.
- Reset: "사용 기록 지우기" on `#admin/analytics`, after a confirmation, removes the key and nothing else.
- Erase: the account screen's "이 기기의 ONGIL 데이터 지우기" clears every `ongil.v1.*` key, counters included.
  (Opening a screen afterwards counts a new `screen_view`, so the key reappears with that single count.)
- Storage missing, full or throwing: `track()` answers `{ ok: false }` and never throws.

## 14. INSTRUMENTATION

| Where | How |
|---|---|
| saved, check-in, calendar, tasks, routines, family sharing, help requests, posts, groups, meetups | `app.js` wraps the store with `instrument.<name>(store)`. The wrapper calls the real method, returns its result unchanged and counts only when it succeeded |
| 돌봄 / 즐길거리 / 스토어 item opened | new optional `onOpen` option of the three views, called only for an open made by a person (not a restored one) |
| search submitted / result opened | new optional `onSearch` / `onResultOpen` options of `createPanels`; a failing callback is swallowed (`tell()`) |
| screen view / app open | `app.js` router callback and start-up |

A wrapped store has the same methods and is frozen like the original. A tracker that throws cannot change what a
feature does (tested with a tracker that always throws). Everything is synchronous; nothing waits on analytics.

## 15. DATA MANAGER

There is no data editor. The view is read-only apart from the three local actions in section 21. It cannot create,
change or delete a user's record, a public item, a post or a notification; it has no form field at all.
Why: without a server there is nothing an operator could legitimately manage — public content comes from the
sources at request time and is never stored, and personal records belong to the person using the device.

## 16. SEARCH OPERATIONS

From the search registry and the content registry: the five providers with scope (all PUBLIC, all run) and number
of types; which screen owns each content type and whether it is a search target (a saved post is not). Search
queries are stored nowhere — a search writes no key (tested).

## 17. SAVED OPERATIONS

Per saved type: its sync policy from `routes.js` (`POST` = LOCAL_ONLY, the others SYNCABLE as a policy — the card
says "연결 없음") and whether it can carry an outside source link. Counts per type are in Content status.

## 18. NOTIFICATION OPERATIONS

Delivery: in-app list 있음; OS push, e-mail, SMS, server delivery 없음. All nine notification types say
"만드는 곳 없음" (`PRODUCERS` = NONE). Nothing claims a notification was sent.

## 19. PRIVACY MATRIX

`buildPrivacyMatrix()` derives one row per class from `privacy.js` and `account.js`:

| Class | Collections | Global search | Account sync | Family | Community |
|---|---|---|---|---|---|
| PUBLIC (not stored) | — | loaded this visit only | no | preview only, nothing sent | no |
| APP | profile, preferences, onboarding, saved, notifications | saved public items only | allowed by policy, not connected (saved posts excluded) | no | no |
| STANDARD | events, tasks, routines, routineLogs, dailyLife, sleepRecords | no | no | no | no |
| PRIVATE | expenses, journal, familySharing, helpRequests, communityPosts, groupDrafts, meetupDrafts | no | no | no | no |
| HEALTH_ADJACENT | checkins, medications, medicationLogs, symptoms, healthNotes | no | no | no | no |
| OPERATIONAL | analytics | no | no | no | no |

The screen shows the classes and rules, never the content of a record.

## 20. SECURITY LIMITATIONS

Shown under "보안 상태":

- What the client code enforces (each covered by tests): text-only rendering, https-only outside links, route
  validation, item-level saved sync policy, the analytics allowlist.
- What does not exist: **SERVER AUTH — NOT IMPLEMENTED · ADMIN RBAC — NOT IMPLEMENTED · REMOTE AUDIT LOG — NOT
  IMPLEMENTED.**
- No overall verdict (`overall: null`): the words secure, protected and compliant are not used.
- No secret can appear: the Phase 9 modules have no access to keys, tokens, headers or server configuration;
  `configured` is a state (YES / NO / UNKNOWN), never a value. A repository-wide test refuses credential-shaped
  strings in `ongil-start/` and `docs/ongil/` (40-character hex strings are git commit ids and are allowed).

## 21. ADMIN ACTIONS

| Action | Effect | Confirmation |
|---|---|---|
| 다시 읽기 | re-renders the visible section from current state | none (reads only) |
| 자료 상태 지우기 | forgets this visit's source observations; sources untouched | none (nothing personal, nothing persistent) |
| 사용 기록 지우기 | deletes the local counters | yes — 취소 focused first; says personal records stay |

Nothing else can be changed from the view.

## 22. ACCESSIBILITY

- One h1; cards are h2 / h3, groups inside a card h4. The English label is marked `lang="en"`.
- Tabs: `tablist` / `tab` / `tabpanel`, `aria-selected`, roving tabindex, ←/→/Home/End; the address follows the tab.
- Every value is text. States, modes and answers have Korean labels; no state is carried by colour (the Phase 9 CSS
  has no state selector and no colour value).
- Label–value rows are lists with an `aria-label`; no table, chart, canvas or image.
- Actions report in each card's polite status line. Focus: the confirmation focuses 취소; cancel returns to the
  asking button; after a reset (button now disabled) focus goes to the card title.
- Keyboard checked in the browser harness (tab arrow keys, confirm / cancel focus). Actual screen reader: NOT VERIFIED.

## 23. RESPONSIVE

Checked at 390 / 820 / 1440 for overview, data (not requested / success / error), analytics (empty / filled /
confirmation) and privacy: no horizontal overflow, no clipped text, no control under 44 px, no small type.
Rows wrap; under 480 px the value moves below its label, left-aligned. The CSS is twelve layout rules appended to
`ongil-app.css` using existing tokens — no new stylesheet, colour, font or motion.

## 24. PERFORMANCE

- The view is built empty at start-up and computes a section only when it is shown; no timer, observer or
  background refresh.
- Browser harness: first render of `#admin` 7–13 ms, other sections about 1–2 ms, about 670 DOM nodes; one 57 ms
  task observed once at 1440 during the whole run, none at 820 / 390.
- `track()`: one small write of one key; 2,000 events measured under 1 ms each in Node. 28 mixed events stored in
  896 bytes.
- Network during the whole QA run: only the existing same-origin GET requests to the data API that the user's own
  actions triggered (mocked in the harness); no non-GET request and no tracking request.

## 25. TESTS

`node --test tests/ongil/*.test.mjs` → **530 pass, 0 fail** (455 before + 75 new in `admin-analytics.test.mjs`).

| Group | Count | Covers |
|---|---|---|
| OG-AD-1 … 20 | 20 | route and fallback, not in navigation, positioning, no fake sign-in, system / feature / source / content status, no score, health and family not read, search / saved / notification operations, privacy matrix, security gaps, actions |
| OG-AN-1 … 35 | 35 | contract, event and property allowlists, no free text, query length bucket, no identifier, no transmission, storage shape, bounds, retention, corruption, unavailable storage, reset, erase and classification, summary, no business metric, single module, each instrumented store's payload, non-blocking, source states, error sanitising, independence |
| OG-AQ-1 … 20 | 20 | headings, tabs, buttons, words not colour, focus and announcements, no chart, responsive rules, identity, no HTML-string rendering, secret detection, no secret reachable, no new network surface, no dependency, storage, wiring, version, performance, route / privacy regression, this document |

Existing assertions changed (each has a comment in the test; no test was deleted or skipped):

| Test file | Before | After | Why |
|---|---|---|---|
| care, enjoy, store, integration-data, integration-view, cross-product, foundation-data | 23 collections | 24 | `analytics` added (class OPERATIONAL) |
| community-data, store-data, cross-product | version `integration-v2`, `?v=20261003i8` | `APP_VERSION = 'admin-v1'`, `?v=20261003a9` | the version moved on and is now one constant the view can show |
| care-data, enjoy-data | `createFacilitySource(dataApi)` etc. passed directly | wrapped in `observeSource(…)` | sources are observed; the source object and its answers are unchanged |
| shell | screens = `VIEWS` | `VIEWS` + `INTERNAL_VIEWS` | one internal screen with its own h1 |
| cross-product | five sectioned views; result link without callback; 60 modules; four classes | + `admin`; link also calls `tell(onResultOpen, r)`; 65 modules; + OPERATIONAL | Phase 9 additions |

Browser QA (harness and fixtures outside the repository; public data mocked at the same-origin data API): admin
overview / data / analytics empty and filled / privacy; source NOT_REQUESTED → SUCCESS → EMPTY → ERROR with the other
sources unaffected; state clear; analytics filled through real UI actions, confirmation, cancel, reset; four
corrupted analytics values; invalid admin addresses; product open with a QA product source; account erase; route
regression over all screens; Phase 8 and Store harnesses re-run — 0 page errors at 390 / 820 / 1440.

## 26. KNOWN LIMITATIONS

- The operations view has no sign-in, role check or audit log. Anyone using this browser can open `#admin`; it shows
  only this browser's own state.
- Source status covers this visit only and only sources the person triggered. Real external APIs: NOT VERIFIED.
- Counters are per browser profile. They cannot say how many people use ONGIL.
- The view can not edit content, moderate, or see other people — none of that exists.
- The account screen's erase text does not name the usage counters separately (they are erased with everything).
- `environment` is "알 수 없음" on any host other than localhost.
- Actual screen reader: NOT VERIFIED.

## 27. PRODUCTION MIGRATION

Before anything here may be called an admin console:

1. **Server authentication** for operators, separate from user accounts.
2. **Role-based access control** enforced on the server for every admin read and write.
3. **Remote audit log** — append-only, of every admin action.
4. Serve the admin surface from the server (not shipped to every user), behind 1–3.
5. **Analytics**: keep `EVENTS` / `PROPERTIES` as the contract. Remote collection needs explicit consent, a
   published retention period, server-side validation against the same allowlists, aggregation before storage, and
   no identifier unless separately justified and consented. `TRANSMISSION.remote` stays false until then.
6. **Source health**: server-side checks with their own credentials; the client keeps showing only what it observed.
7. Content, moderation and member tools need the corresponding backend first (Phases 4 and 6 list those needs).

## 28. PHASE 10 HANDOFF

Phase 10 is ONGIL AI V1.

- No AI call exists; no model provider is connected. An AI feature must not read HEALTH_ADJACENT or PRIVATE
  collections without an explicit, per-use choice by the person — `privacy.js` is the boundary to extend.
- If AI use is counted, add event names to `EVENTS` with closed-set properties only (never a prompt or an answer).
- A model provider is a data source: register it with `observeSource`-style status so `#admin/data` shows its real
  state, with no key or header ever reaching the client view.
- Feature status gains its rows through `FEATURE_CAPABILITIES`; BACKEND_REQUIRED is the truthful mode until a
  server exists.
- Test baseline: 530 / 530.
