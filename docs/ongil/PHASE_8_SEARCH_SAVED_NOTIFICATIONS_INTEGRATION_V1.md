# ONGIL PHASE 8 — SEARCH + SAVED + NOTIFICATIONS INTEGRATION V1

Branch `ongil-foundation-v1` · base `dcd89fd0a` (ONGIL Store and Products V1) · not committed (git add / commit / push not run).

## 1. OBJECTIVE

No new product area. Search, Saved and Notifications become one consistent layer across the eight areas:
one content registry, one search-result contract, one place that decides where a thing opens, one privacy boundary,
and notification wording that says exactly what exists (an in-app list) and what does not (push, text, e-mail).

## 2. AUDIT (before Phase 8)

| Area | State | Finding |
|---|---|---|
| Search providers | EXISTS | 5 (areas, saved, care, enjoy, store), built in `search.js`, registered in `app.js` |
| Provider contract | INCONSISTENT | `{ id, label, search }` only — no scope, no declared types; anything registered was run |
| Result contract | INCONSISTENT | no scope, no type label; each provider put (or did not put) the type word in its description |
| Result routing | INCONSISTENT | saved results carried the item's own `href` — usually an outside https page, so a search result could leave ONGIL; menu sections always opened the area, never the section |
| Saved posts in search | INCONSISTENT | a saved community post (LOCAL_ONLY since Phase 7) was still found by global search through the saved provider |
| Search states | PARTIAL | results / no results only; a failed provider was recorded in `failed` but never shown; no loading state; a list cut at 20 was not said to be cut |
| Search copy | INCONSISTENT | panel still said "서비스·프로그램·장소 검색은 아직 준비 중" although care, enjoy and store providers exist |
| Search rendering | BUG | `Element.append(null)` printed the word "null" under a result list (found in browser QA) |
| Saved types / labels | EXISTS | 7 types, labels in `contracts.js`; care / enjoy / store / community each mapped to them separately |
| Saved screen | PARTIAL | all 7 filters shown even at count 0; title doubled as the link (outside page or screen, unlabelled); every row rendered (500 possible); no word about a missing original |
| Saved sync policy | EXISTS | item level since Phase 7 (`SAVED_SYNC_POLICY`, `syncChange`) |
| Notification types | EXISTS | 9, all future-only: nothing calls `add()` |
| Notification center | PARTIAL | list + mark-all only; opening the panel marked everything read, so "unread" was never visible; no type label, no body, no per-item action; `href` could be any https address |
| Notification settings | PARTIAL | "받고 싶은 알림 / 받도록 설정했습니다" read like delivery, softened only by a note |
| Routing | PARTIAL | sections validated for life / care / enjoy / community / store; `#health/x`, `#family/x`, `#saved/x`, `#store/a/b` left a wrong address in the bar; 즐길거리 kept an earlier category while the address said `#enjoy` |
| Canonical ownership | MISSING | no single statement of which screen owns which content type |
| DUPLICATE | — | type → label and type → screen knowledge lived in `contracts.js`, `search.js`, `saved-view.js`, `care-contracts.js`, `enjoy-contracts.js` and `store-contracts.js`. Now read from one registry (`routes.js`); the per-screen `savedInputFor` mappers stay (they are the adapters) and a test ties them to the registry |

## 3. SEARCH ARCHITECTURE

`search.js` — registry + result contract.

- Provider: `{ id, label, scope, supportedTypes[], search(query) }`. `scope` is required (`PUBLIC` | `LOCAL_PRIVATE`); a provider without one is refused.
- `query()` runs PUBLIC providers only. A `LOCAL_PRIVATE` provider can be registered (a later "search my own records" screen has a place) but is never run by global search. None exists in the app.
- Result: `{ providerId, scope, type, contentType, typeLabel, id, title, description, source, route, href }`. `type` is the provider's word (CLASS, CARE_SERVICE, AREA …), `contentType` the canonical type, `typeLabel` what a person reads, `route` always inside ONGIL, `href` the same value (older callers). Nothing else from a provider reaches the screen.
- Outcome: `{ query, state, results, groups[{ providerId, label, results, found, truncated }], failed, failedLabels, total }`.
- States: `empty-query` · loading (panel) · `results` · `partial` · `no-results` · `error`.
- Truthfulness: counts are of what was really found; at most 20 a provider are shown and a cut list says "N개 가운데 앞의 20개만 보여 드려요". No suggested, popular or trending searches exist.

## 4. SEARCH PROVIDERS

| id | label | scope | types | reads |
|---|---|---|---|---|
| areas | 메뉴 | PUBLIC | AREA, SECTION | `areas.js` |
| saved | 저장한 항목 | PUBLIC | SERVICE, BENEFIT, FACILITY, PROGRAM, PLACE, PRODUCT | saved items whose policy is SYNCABLE — saved posts are left out |
| care | 돌봄·서비스 | PUBLIC | SERVICE, BENEFIT, FACILITY | items loaded on that screen this visit |
| enjoy | 즐길거리 | PUBLIC | PROGRAM, PLACE | items loaded this visit |
| store | 상품 | PUBLIC | PRODUCT | items loaded this visit (none in production) |

## 5. SEARCH PRIVACY

Never found (tests OG-IN8-3/4/5, browser check = 0 results each): check-ins, symptoms, medication and logs, health notes, journal,
expenses, family sharing choices, help requests, community posts, group and meetup drafts, calendar events, tasks, routines,
daily life, sleep — and saved posts. The panel says so: "건강 기록, 일정, 일기 같은 내 기록은 찾지 않아요."
A common word can match a MENU entry (its own title or description), never a record.

## 6. SEARCH ROUTING

- A content result opens its owner screen (§15), keeping the category when the item has one: `#care/facility`, `#enjoy/hobby`, `#store/bath-home`.
- A saved result opens `#saved`, where 화면에서 보기 / 출처 보기 / 저장 취소 are separate, named actions.
- A menu section opens its own address when it has one (`#life/calendar`, `#care/facility`, `#life/routines`); an unfinished section opens its area.
- The route is recomputed in `cleanResult`: a provider cannot send anyone outside ONGIL or into another area.

## 7. SAVED ARCHITECTURE

`saved.js` (store, unchanged) · `saved-view.js` (screen) · `routes.js` (registry).
Row = type label (+ "이 기기에만" for a local-only item) · title · description · saved date · source, then actions:

| Action | When |
|---|---|
| `<owner> 화면에서 보기` | always — a route inside ONGIL |
| `출처 보기 (새 창)` / `판매처·출처 보기 (새 창)` | only for a public type with a clean https address; `target="_blank" rel="noopener noreferrer"` |
| `저장 취소` | always; focus returns to the filters |

Filters appear only for the kinds that are actually saved. 30 rows at a time + 더 보기. The title is no longer a link.

## 8. SAVED TYPES

| Type | Label | Owner | Route | Scope | Sync policy | Outside link |
|---|---|---|---|---|---|---|
| SERVICE | 서비스 | care | `#care` | PUBLIC | SYNCABLE | yes |
| BENEFIT | 혜택·복지 | care | `#care` | PUBLIC | SYNCABLE | yes |
| FACILITY | 기관·시설 | care | `#care/facility` | PUBLIC | SYNCABLE | yes |
| PROGRAM | 프로그램 | enjoy | `#enjoy` | PUBLIC | SYNCABLE | yes |
| PLACE | 장소 | enjoy | `#enjoy` | PUBLIC | SYNCABLE | yes |
| POST | 글 | community | `#community` | LOCAL_PRIVATE | LOCAL_ONLY | no |
| PRODUCT | 상품 | store | `#store` | PUBLIC | SYNCABLE | yes |

`CONTENT_TYPES` in `routes.js` is built from `SAVED_TYPES`, `SAVED_TYPE_LABELS` and `savedSyncPolicy` — one list, not two.
Source words map onto it: CARE_SERVICE → SERVICE, PUBLIC_BENEFIT → BENEFIT, CLASS / EVENT → PROGRAM.

## 9. SAVED SYNC POLICY

Unchanged from Phase 7 and now verified through the whole flow: POST = LOCAL_ONLY; the six public types SYNCABLE by policy;
unknown types LOCAL_ONLY (fail closed). `account.js syncChange` filters a `saved` change item by item — with a test adapter
connected, seven saved items produce changes that never contain the post. Nothing syncs in this phase: no adapter is connected.

## 10. SAVED BACKWARD COMPATIBILITY

The stored shape did not change (9 fields: schemaVersion, key, type, id, title, description, href, source, savedAt).
`syncPolicy`, owner route and label are derived from the type when read, never written, so items saved by Phases 4–7 read as
before, and an item with no address still opens its owner screen. Reading does not rewrite storage.

Broken source: a row always shows its snapshot ("저장할 때의 내용을 보여 드려요. 지금의 정보는 해당 화면이나 출처에서 확인하세요.").
For a saved post the original can be checked on this device; when it was deleted the row says
"현재 원본 정보를 불러올 수 없어요. 원래 글이 지워져 저장한 제목만 남아 있어요." Nothing is rebuilt from a snapshot.

## 11. NOTIFICATION ARCHITECTURE

A LOCAL, IN-APP foundation — not a push system.

- `DELIVERY = { push: false, server: false, email: false, sms: false, inApp: true }`.
- `PRODUCERS`: every type `NONE`. Nothing in ONGIL creates a notification; `add()` exists for a later phase and for tests.
- Center (`notifications.js`): `list` (newest first, with `typeLabel`, `read`, `route`) · `unreadCount` · `count` · `add` · `markRead(id)` · `markAllRead` · `remove(id)` · preferences.
- Panel: "알림 N개 · 읽지 않은 알림 M개", 모두 읽음으로 표시, and per row: type · 읽음 / 읽지 않음 · date, title, body, 열기 · 읽음으로 표시 · 지우기. 20 rows at a time + 더 보기. At most 200 are read or kept.
- Changed behaviour: opening the panel no longer marks everything read (the state was never visible before). 열기 marks that one read.

## 12. NOTIFICATION TYPES

| Type | Label | Produced today | Opens |
|---|---|---|---|
| CHECK_IN | 안부 | no | `#life/checkin` |
| SCHEDULE | 일정 | no | `#life/calendar` |
| MEDICATION | 복약 | no | `#life/medication` |
| FAMILY | 가족 | no | `#family` |
| SERVICE | 돌봄·서비스 | no | `#care` |
| PROGRAM | 프로그램 | no | `#enjoy` |
| COMMUNITY | 커뮤니티 | no | `#community` |
| STORE | 스토어 | no | `#store` |
| SYSTEM | ONGIL 안내 | no | `#account` |

All nine are future-only. The list is kept (preferences already reference it); none is given a producer here because no real event exists.

## 13. NOTIFICATION TRUTHFULNESS

- Panel: "알림을 보내는 기능은 아직 연결되지 않았습니다." + "알림은 ONGIL 안에서만 보여요. 휴대폰 알림(푸시), 문자, 이메일은 보내지 않아요."
- Settings: legend "ONGIL 안에서 보고 싶은 알림 종류"; note "아직 ONGIL이 만드는 알림은 없어요. 고른 종류는 나중에 ONGIL 안의 알림 목록에 쓰여요. 휴대폰 알림(푸시), 문자, 이메일은 보내지 않아요."; confirmation "… 알림을 ONGIL 안에서 보도록 골라 두었습니다." (was "받도록 설정했습니다").
- Onboarding step keeps its question and adds the same no-push sentence.
- A preference reports `delivers: false` and `producer: 'NONE'` even when switched on.
- No OS API is used (`Notification`, service worker, push manager): checked by test.
- No fake event text exists anywhere: 가족이 확인했어요, 댓글, 공감, 새 참가자, 가격 인하, 재입고, 배송, 주문 — tests OG-IN8-40/41/42.

## 14. DEEP LINKS

- An address is `#view` or `#view/section`. Sections exist for life, care, enjoy, community, store.
- There is no detail-by-id address: public items live in memory for the visit, so an id cannot be promised after a refresh. Results, saved rows and notifications go as far as the owner screen and its category.
- `safeRoute()` turns any text into a route inside ONGIL or `''`: outside addresses, `javascript:`, `data:`, paths, unknown views and markup characters are refused; an unknown section falls back to the view.
- Wrong addresses are corrected with `history.replaceState` (no extra history entry): `#care/unknown` → `#care`, `#health/x` → `#health`, `#store/a/b` → `#store`, `#store/%3Cscript%3E` → `#store`. `#nope` is not a route and leaves the current screen as it is.
- 즐길거리 keeps the category chosen earlier in the visit; entering `#enjoy` now writes that category into the address.
- Back / Forward: one `hashchange` listener, no `pushState`, no `popstate` handler; panels are overlays and close on a route change. Checked in the browser: result → Store category → Saved → Back → Store category restored → Forward → Saved.

## 15. CANONICAL ROUTES

| Content | Owner | Search result | Saved row | Notification |
|---|---|---|---|---|
| SERVICE, BENEFIT | 돌봄·서비스 | `#care/<category>` | `#care` | SERVICE → `#care` |
| FACILITY | 돌봄·서비스 | `#care/facility` | `#care/facility` | — |
| PROGRAM (강좌·행사 포함) | 즐길거리 | `#enjoy/<category>` | `#enjoy` | PROGRAM → `#enjoy` |
| PLACE | 즐길거리 | `#enjoy/<category>` | `#enjoy[/<category>]` | — |
| PRODUCT | 스토어 | `#store/<category>` | `#store[/<category>]` | STORE → `#store` |
| POST | 커뮤니티 | never searched | `#community` | COMMUNITY → `#community` |

Search, Saved and Notifications import the same functions (`ownerRoute`, `safeRoute`, `notificationRoute`). A hint that
points outside the owner screen is dropped — a saved product can never be made to open another area.

## 16. PRIVACY MATRIX

| Data | Class | Global search | Saved | Sync | Family | Community |
|---|---|---|---|---|---|---|
| Care / Enjoy / Store items | PUBLIC (not stored) | yes, when loaded this visit | yes | saved copy: by policy | preview only, nothing sent | review prefill from Enjoy only |
| saved (public items) | APP | yes | — | SYNCABLE by policy (not connected) | no | no |
| saved (posts) | APP · LOCAL_ONLY | no | — | no | no | no |
| notifications | APP | no | no | no | no | no |
| profile, preferences, onboarding | APP | no | no | allowed (not connected) | no | no |
| journal, expenses, family sharing, help requests, community posts, group / meetup drafts | PRIVATE | no | no (posts: own, local-only) | no | no | no |
| check-ins, symptoms, medication + logs, health notes | HEALTH_ADJACENT | no | no | no | no | no |
| calendar, tasks, routines + logs, daily life, sleep | STANDARD | no | no | no | no | no |

23 collections, unchanged. Search, routing and the panels store nothing: no search history, no recent queries.

## 17. SYNC BOUNDARY

Allow-list unchanged: profile, preferences, saved, onboarding. A syncable collection is not sent whole: `syncChange`
removes LOCAL_ONLY saved items first. `notifications` is APP class but not on the allow-list (device only). No adapter is
connected and the app connects none.

## 18. ACCOUNT DELETE

The existing erase removes every `ongil.v1.*` key — saved items, notifications and notification preferences included.
Browser check: 0 ONGIL keys left, `livon.keep`, `newon-other`, `newon-app-theme` untouched, badge hidden, Saved empty.
Search has no stored state to erase.

## 19. SECURITY

- `innerHTML` family = 0 in the whole app; markup in a title or body is shown as text (browser: 0 injected nodes).
- One URL validator (`safeHref`); routes go through `safeRoute` (in-app only). Outside links only on Saved rows and detail dialogs: https, new window, `noopener noreferrer`.
- A notification's address is cleaned when added and again when read; an outside address is not stored and never followed.
- Provider rows, saved snapshots and notifications are bounded and field-whitelisted.
- No `pushState`, no script-driven navigation (`location.assign/replace/href=`, `window.open`), no `eval`.

## 20. ACCESSIBILITY

- Search: labelled input, `role="search"`, results region with `aria-busy` while loading, polite status line for every state, named result lists, type in words.
- Saved: filters with `aria-pressed` + ✓, named list, every action a button or link with the item's title in its accessible name, status line, focus kept after 저장 취소.
- Notifications: read state in words ("읽음" / "읽지 않음") plus a ● mark; focus stays inside the panel after an action re-renders its row; Escape closes and returns focus to the bell.
- Text ≥ 16px and controls ≥ 44px at all three widths (measured, 0 below).
- Static review only. **Actual screen reader: NOT VERIFIED.**

## 21. RESPONSIVE

Headless Chromium, 390 / 820 / 1440, 12 measured states each: search empty, no results, results (1,100 items), long result,
partial, loading; saved empty, mixed, 500; notifications empty, filled; account settings. Horizontal overflow 0, nothing
outside the panel, controls under 44px 0, text under 16px 0, console errors 0, page errors 0.

## 22. PERFORMANCE

QA fixtures (harness only): 200 care + 400 enjoy + 500 products, 500 saved, 500 notifications.

| Check | Result |
|---|---|
| Search over 1,100 items | about 80–125 ms from Enter to rendered; 61 result rows, search panel 262 nodes |
| Saved 500 | 30 rows in the DOM (289 nodes), 더 보기 → 60 |
| Notifications 500 | 200 read and kept, 20 rows in the DOM (156 nodes), mark-all immediate |
| Long tasks | one of 51–69 ms per run during page load with the fixtures; none during search, filter or mark-read |

## 23. TESTS

`node --test tests/ongil/*.test.mjs` → **455 / 455 pass, 0 skip.** Old 390 kept; new 65 in `cross-product.test.mjs`.
The brief names them OG-IN-1 … 65; that prefix belongs to Phase 2C, so they are **OG-IN8-1 … 65**, same order.

Existing assertions changed (intended integration changes; each has a comment in the test):

| Test | BEFORE | AFTER | WHY |
|---|---|---|---|
| OG-SE-1, OG-SE-3 (`foundation-flows`) | ad-hoc providers `{ id, label, search }` | `scope: 'PUBLIC'` added; a provider without a scope must be refused | scope is required by the registry |
| OG-SE-2 (`foundation-flows`) | saved result href = the item's own href (`#enjoy`) | `#saved`; type, contentType, typeLabel, scope also checked | a saved result must not leave ONGIL |
| OG-PV-3 (`life-privacy`) | menu section result opens `#life` | `#life/expenses`, typeLabel 메뉴 | sections with an address open there |
| OG-NT-1 (`foundation-flows`) | `DELIVERY` = push, server, inApp | + email, sms (all false) | every absent channel is named |
| OG-STO-58 (`store-data`) | Saved title is the outside link | separate "출처 보기" action, same https / new window / noopener | named actions on Saved rows |
| OG-CG-16, OG-STO-56 | version `store-v1`, `?v=20261003s7` | `integration-v2`, `?v=20261003i8` | version moved on |

## 24. KNOWN LIMITATIONS

- SEARCH LIVE DATA: care / enjoy / store results exist only for items loaded on their screens during the visit; nothing is fetched by search itself.
- SAVED SYNC: policy only; no adapter.
- OS PUSH: none. REMOTE NOTIFICATIONS: none. No notification is produced at all yet.
- DETAIL DEEP LINKS: none — routes stop at the owner screen and category.
- A saved public item cannot be checked against its source from the Saved screen; only saved posts can be said to be gone.
- A saved product whose link is an outside page opens `#store` without its category (the category is not part of the snapshot).
- Notification time shows the date only.
- Actual screen reader, real devices and real external sources were not verified.

## 25. PHASE 9 HANDOFF

Phase 9 = ADMIN + ANALYTICS V1.

- There is no analytics of any kind today: no event log, no search history, no click tracking, no backend. Anything Phase 9 counts must be new, declared, and classified in `privacy.js` before it is stored.
- Useful, already-structured seams: `search.query()` outcome (state, total, failed), `CONTENT_TYPES`, `NOTIFICATION_TYPES` + `PRODUCERS`, source states (`ready` / `empty` / `unavailable`).
- Keep: PUBLIC-only global search; POST = LOCAL_ONLY; no personal record in any aggregate that could leave the device; no fake numbers.
