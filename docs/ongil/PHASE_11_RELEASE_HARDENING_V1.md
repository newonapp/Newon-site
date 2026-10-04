# ONGIL PHASE 11 — RELEASE HARDENING V1

Branch `ongil-foundation-v1` · base `f9d65bb33` (ONGIL Assistant V1) · not committed (git add / commit / push not run).

This phase added no feature. It audited the whole of ONGIL V1, fixed what the audit found, verified the fixes and
wrote down what remains. Nothing here is a certification: no accessibility, security or medical audit by a third
party has taken place, and none is claimed.

## 1. OBJECTIVE

Audit → fix → verify → document, across accessibility, security, privacy, data integrity, performance, responsive
layout, error handling, routing, SEO and release configuration. Two known limitations from Phase 3 (medication
history) were to be resolved.

## 2. BASELINE

- `git status`: clean at `f9d65bb33`; no other session's changes in the worktree.
- `node --test tests/ongil/*.test.mjs`: 608 / 608 before any change.
- Original repository `~/Newon`: 56 changed entries before and after (unchanged by this phase).

## 3. INVENTORY

| Kind | Count | Notes |
|---|---|---|
| HTML | 1 page (`ongil-start/index.html`) | 11 screens (10 product + operations view), 3 header panels, 1 dialog shell |
| CSS | 6 ONGIL sheets + 5 shared site sheets | ONGIL: tokens, shell, app, home, life, care |
| JS modules | 68 | every module is imported; `app.js` is the only entry; no dynamic import |
| Routes | 17 accepted addresses → 11 views; sections in life (14), care (11), enjoy (6), community (2), store (10), admin (4) | pre-paint map in the page equals the router's table |
| Storage collections | 24 | all classified; no module writes outside the storage layer |
| Privacy classes | APP · STANDARD · PRIVATE · HEALTH_ADJACENT · OPERATIONAL (+ PUBLIC, never stored) | |
| Search providers | 5, all PUBLIC | areas, saved, care, enjoy, store |
| Saved types | 7 (POST is LOCAL_ONLY) | |
| Notification types | 9, none produced | in-app list only |
| Analytics events | 22 | closed-set properties only |
| Assistant | 24 intents, 22 tools (2 WRITE) | no model connected |
| Public data providers | kr-lifelong-class, kr-kakao-place, kr-tourapi; three sources unconnected | asked only on the person's button |
| Outside hosts | fonts.googleapis.com, fonts.gstatic.com, d8j0ntlcm91z4.cloudfront.net (7 film files) | no script from another host |

Dead / duplicate / orphan check: one unused export (`takesOn`) — removed. No unimported module, no orphan route
(every menu entry resolves to an existing address), no unreachable screen. The operations view is deliberately
outside the menu.

## 4. ISSUES FOUND

Only problems that were reproduced are listed.

| # | Severity | Area | Problem |
|---|---|---|---|
| H1 | HIGH | Data | Deleting a medication deleted every past "먹었어요" mark of it |
| H2 | HIGH | Mobile header | At 320–359px the three header tools overlapped the ONGIL mark (34px at 320) |
| M1 | MEDIUM | Data | Changing a medication's days changed how past, unmarked days read |
| M2 | MEDIUM | Keyboard | The first Tab landed on the menu, skipping "본문으로 건너뛰기" (the shared header scripts move the browser's tab starting point) |
| M3 | MEDIUM | Performance | List cards rendered every row: 500 tasks put 14,000 nodes in 내 생활 and each tab change took about 1 s |
| M4 | MEDIUM | Erase | "ONGIL 데이터 지우기" removed the known collections but left any other `ongil.v1.*` key |
| M5 | MEDIUM | Contrast | Field and button edges on the white header panels were 1.4:1 against the panel |
| M6 | MEDIUM | Touch | Calendar days were 35px wide at 320 and 41px at 360 |
| M7 | MEDIUM | Performance | The group list read the meetup collection once per group (290 ms with 100 groups) |
| M8 | MEDIUM | Errors | A write refused by the browser (storage full) said only "다시 시도해 주세요" |
| L1 | LOW | Routing | An address naming no screen (`#nope`) stayed in the address bar over another screen |
| L2 | LOW | Routing | 건강·안부 › 증상·건강 메모 led to the area page, not to the records |
| L3 | LOW | Text size | Panel caption 15.2px, panel group caption 14.4px, tick glyph 15.2px |
| L4 | LOW | Dead code | Unused export `takesOn` |
| L5 | LOW | Touch | At 320px a calendar day is 40px wide (seven columns cannot be 44px) |
| L6 | LOW | Text size | Two fixed labels stay under 16px: the capital eyebrow label (14.4px) and the shared site menu (14.7px) |
| L7 | LOW | Performance | Start-up has a long task of about 110 ms (68 unbundled modules, 180 small storage reads); about 300 ms with 1 MB stored |
| L8 | LOW | Touch | The shared language button in the ONGIL header was 34px high at every width (found in the existing-work review, section 37) |

CRITICAL 0 · HIGH 2 · MEDIUM 8 · LOW 8.

## 5. ISSUES FIXED

| # | Fix | Where |
|---|---|---|
| H1 | Removing a medication removes it from the plan only; marks stay, named, and are shown read-only as "목록에서 지운 약" | `medication.js`, `life-health.js`, `home-list.js` |
| H2 | 320–359px: tighter header spacing (tools stay 44px) | `ongil-shell.css` |
| M1 | A change of days is stored with the date it took effect; past days use the days set then | `life-contracts.js`, `medication.js` |
| M2 | An empty, unnamed marker before the skip link resets the tab starting point when nothing has focus | `index.html`, `accessibility.js`, `app.js` |
| M3 | List cards show 50 rows + "더 보기 (n개 남음)"; a row being edited or just added is always shown | `home-list.js` |
| M4 | Erase also removes any other key under ONGIL's prefix | `storage.js` |
| M5 | `--og-panel-input-border` 0.14 → 0.5 alpha (3.9:1) | `ongil-tokens.css` |
| M6 | ≤380px: the month grid uses the card's side padding → 46px days at 360, 40px at 320 | `ongil-life.css` |
| M7 | `meetups.countsByGroup()` — one read | `community.js`, `community-view.js` |
| M8 | One sentence for a refused write: why, and what to do | `home-list.js` |
| L1 | Unknown addresses are replaced by the current screen's address (page anchors such as `#og-main` are left alone) | `app.js` |
| L2 | The menu entry opens `#life/symptoms` | `routes.js` |
| L3 | Raised to 1rem | `ongil-shell.css`, `ongil-home.css` |
| L4 | Removed | `life-contracts.js` |
| L8 | 44px minimum height for that button from an ONGIL sheet (shared files untouched; width and layout unchanged) | `ongil-shell.css` |

## 6. REMAINING ISSUES

| # | Severity | Why it stays |
|---|---|---|
| L5 | LOW | 320px minus margins leaves 284px for seven days; 40 × 46px is above the WCAG 2.2 AA minimum (24px) and below ONGIL's own 44px target. From 360px it is 46px |
| L6 | LOW | Fixed labels, not sentences; the menu is sized by the shared site header and eight entries must fit at 1024px. Listed and tested as the only two exceptions |
| L7 | LOW | Bundling or lazy-loading modules is a build change (Phase 12). No start-up work asks the network; the operations view and the assistant compute nothing until opened |

CRITICAL open 0 · HIGH open 0 · MEDIUM open 0 · LOW open 3.

## 7. DATA INTEGRITY

Checked for every collection: create, update, delete, damaged values, older shapes.

- Every collection a module reads or writes is one of the 24 declared; no module touches `localStorage` directly.
- A damaged value in any one collection (nine kinds of garbage × 24 collections) never throws and never affects
  another collection; good entries next to bad ones survive; the next write repairs the collection.
- Deleting twice deletes once (stores answer NOT_FOUND / false the second time).
- A group deletion removes its meetup drafts; a medication deletion no longer removes its marks.

## 8. MEDICATION HISTORY

Plan (`medications`) and history (`medicationLogs`) are now separate.

- **Delete**: the plan entry is removed. Marks are not touched; a mark made before names were saved with marks is
  given the medication's name at removal (written first — if that write fails, nothing is removed).
- **Display**: `historyForDate` returns marks of removed medications with `removed: true`. 내 생활 › 복약 shows them
  without a checkbox, with "목록에서 지운 약 · 기록만 남아 있어요". Home's card shows the plan only.
- **Read-only**: `setTaken` on a removed medication answers NOT_FOUND.
- **Schedule changes**: when the days change, the medication keeps `schedule: [{ from, daysOfWeek }]` (first step =
  the days since it was created, then one step per change; at most 24). A past day is read with the step in force
  on that day. Marked days were never affected and still are not. Entries written before Phase 11 have no
  `schedule` and read exactly as before.
- Remaining semantics: an unmarked planned day of a medication that was later REMOVED is not shown (only its marks
  are history). The day list keeps marks for 366 days, as before.

## 9. STORAGE MIGRATION

There is no migration step: every reader accepts older shapes. Verified with fixtures shaped like Phase 1, 2, 3, 6
and 7 data (missing fields, unknown fields, missing `schemaVersion`, a saved type that no longer exists, a mark
without a name): no error, reading rewrites nothing, defaults fill gaps (no days = every day, no time = none,
no meal detail = not said), unknown fields are ignored, and a later write keeps the old entries.

## 10. PRIVACY MATRIX

| Class | Global search | Saved | Sync (policy; not connected) | Family | Community | Analytics | Assistant |
|---|---|---|---|---|---|---|---|
| PUBLIC (loaded this visit) | yes | can be saved | — | preview only | no | type only | search tools |
| APP — profile, preferences, onboarding | no | — | allowed | no | no | no | no |
| APP — saved public items | yes | — | allowed | preview only | no | type only | `get_saved_items` |
| APP — saved posts (LOCAL_ONLY) | no | — | no | no | no | type only | no |
| STANDARD — events, tasks, routines | no | no | no | no | no | "created" counts | today's read tools; add after 확인 |
| STANDARD — daily life, sleep | no | no | no | no | no | no | no |
| PRIVATE — journal, expenses, family settings, help requests, posts, groups, meetups | no | no | no | no | no | "saved / created" counts | no (screen offered) |
| HEALTH_ADJACENT — check-ins, medication, symptoms, health notes | no | no | no | no | no | "check-in saved" count only | no (screen offered) |
| OPERATIONAL — analytics | no | no | no | no | no | — | no |

Leak test: fifteen markers placed in the journal, an expense, a health note, a symptom note, a medication name and
memo, a check-in memo, a help request, a post title and body, a group name and description, a meetup title and
place. None appears in global search, in what sync would send, in the analytics store, in any assistant answer or
in the operations view's data. Modules holding personal records contain no network code; the only requests are
GETs to the site's data route, made by `data-source.js` with a region or search word the person entered.

## 11. SECURITY

- Dynamic HTML: 0 uses of innerHTML / outerHTML / insertAdjacentHTML / document.write / DOMParser. Elements are
  created in one module (`dom.js`); text goes in as text.
- Code from text: 0 uses of eval, Function, string timers, dynamic import, script or style elements.
- Inline handlers: none written by modules; the page has one inline script (the pre-paint route map).
- Input: every store validates type, enum, length, date and number through its contract; the assistant validates
  arguments by schema (twice for a change). Oversized text is cut; out-of-range numbers are refused.
- Provider answers are untrusted: wrong shapes, objects instead of lists, missing fields, unknown enums, duplicate
  ids, oversized text and unsafe addresses are dropped item by item; one bad item never spoils the rest.
- Headers (from the site's `vercel.json`, not changed here): `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy`, and a Content Security Policy in
  REPORT-ONLY mode. ONGIL adds no meta policy: an enforced policy needs the shared header scripts and the data API
  origin to be settled first, which is a deployment decision (section 29). Not claimed as enforced.

## 12. URL SAFETY

- Every link is built by `el()`, whose `href` passes `safeHref`: https, an ONGIL hash or a same-site path only.
  `javascript:`, `data:`, `vbscript:`, `file:`, `http:`, protocol-relative and credential-bearing addresses give ''.
- Outside links (source, seller, map): https only, new window, `rel="noopener noreferrer"` — all eight.
- Navigation: the address is written only from route tables (`lifeHash`, `adminHash`, `hashFor`, `safeRoute`).
  No `window.open`, `location.href`, `pushState`.
- Addresses in the source: the font host and seven film files. No plain-http address.

## 13. SECRETS

A scan of all shipped ONGIL source (68 modules, 6 sheets, the page) for key, token, bearer, private-key, JWT and
long-hex shapes finds nothing. No server setting name appears in the client. The data API location comes from the
site's public config object (`window.LivonApi`); no credential header is sent (`credentials: 'omit'`).

## 14. ACCESSIBILITY

Target: WCAG 2.2 AA, checked statically and with an automated browser harness. Not a certification.

- Structure: `lang="ko"`, one `main`, a labelled `nav`, one h1 per screen labelling the screen, unique ids, every
  `aria-controls` / `aria-labelledby` / `for` resolves (in the page or drawn by its view).
- Names: every button, field, image and icon in the page has a name or is marked decorative.
- State in words: read / unread, done, chosen, today, current, expanded, selected, invalid.
- Text size: sentences are 16px or more. Three captions were raised to 16px; two fixed labels remain smaller (L6).
- Touch targets: 44px or more at 360–1440; one exception at 320 (L5).
- Motion: section 18. Video: section 18.

## 15. CONTRAST

Computed from the design tokens and measured on rendered text (2,170 text nodes across all screens and panels,
at twelve widths): lowest text contrast 6.34:1 (muted text on a card); no text under 4.5:1.

| Pair | Ratio |
|---|---|
| ink on background / card | 15.9 / 12.0 (approx.) |
| muted on background / card | 8.3 / 6.3 |
| panel text on white, secondary grey on white | 18.9 / 7.5 |
| focus ring on dark / on panel | 21 / 18.9 |
| field edge on the page / on a card | ≥ 3:1 |
| field and button edge on the white panel | 3.9:1 (was 1.4:1) |

Text over the films: measured against the page colour only (the harness does not load outside video). Real frames
behind the hero text were NOT VERIFIED; the text has a veil and a shadow by design.

## 16. KEYBOARD

Run with real key presses in the harness:

- First Tab → "본문으로 건너뛰기" → Enter moves focus into main (Home and a deep link).
- Tab through Home: 55 distinct stops in 70 presses, never stuck; Shift+Tab goes back.
- Menu link + Enter opens the screen and focuses its heading.
- Tabs (내 생활, 운영 보기): ← → Home End. Calendar day: Space selects.
- Header panels (검색, 알림, 도우미): Tab moves through and out; Escape closes and returns focus to the button.
- Onboarding dialog: Tab stays inside; Escape closes; focus returns to the opener.
- No handler intercepts Tab. Keyboard traps found: 0.

## 17. SCREEN READER

STATIC REVIEW = PASS (names, roles, states, live regions, heading order, references — section 14).
ACTUAL SCREEN READER = NOT VERIFIED (no screen reader could be run in this environment).

## 18. RESPONSIVE

| Width | Result |
|---|---|
| 320 | no overflow; header: no overlap, three 44px tools; one exception — calendar day 40 × 46 |
| 360 · 390 · 430 · 431 | pass (wordmark hidden up to 430, shown from 431; no overlap on either side) |
| 640 · 720 (= 1280 and 1440 at 200% zoom) | pass: content reflows, no horizontal page scroll, every control reachable |
| 768 · 820 · 1024 · 1280 · 1440 | pass |

Per width: 32 screens and sections, three header panels with results, the mobile menu sheet (10 links, 44px+),
the onboarding dialog — with long unbroken Korean and Latin strings in every text field. Horizontal overflow 0;
"undefined / null / [object Object]" on screen 0.

Reduced motion: with the device setting on, films do not play (0 playing, button reads "영상 재생"), the reveal
transitions are off; what remains is a 0.2 s colour change on hover in the shared header. Video: the pause button
works with Space and Enter, is 44px high and has a visible name; with the film host blocked, the heading and both
actions are visible and usable.

## 19. PERFORMANCE

| Measure | Result |
|---|---|
| Start-up, empty data | 68 module requests, 1,776 nodes, 180 storage reads, long tasks 51 and 114 ms; 0 data-API requests; one film source attached of seven |
| Start-up work by 운영 보기 / 도우미 | none until opened (57 / 19 nodes of empty shells) |
| At the limits (1,000 events, 500 tasks, 30 routines, 365 days of marks and check-ins, 500 saved, 500 posts, 100 groups, 300 meetups ≈ 0.95 MB) | 내 생활 1,741 nodes; screen changes 80–130 ms; long tasks 65–125 ms; start-up long task ≈ 300 ms |
| Before the fixes, same data | 내 생활 14,415 nodes, about 1 s per tab change; 커뮤니티 › 모임 290 ms |
| 1,500 search matches + 500 products | 25 rows shown, "1505개 가운데 25개", 370 ms including typing |
| Assistant with 25 entries today | 8 rows + "이 밖에 17개가 더 있어요." |

Long tasks over 50 ms remain when a full collection is parsed (65–125 ms) and at start-up (L7). They were not
forced to zero at the cost of function.

## 20. STORAGE LIMIT

With `setItem` throwing QuotaExceededError: twenty kinds of write (tasks, calendar, journal, expenses, health
notes, symptoms, check-in, medication, daily life, routines, saved, posts, groups, help requests, sharing,
profile, analytics …) each answer `ok: false` without throwing; what was stored is byte-for-byte unchanged and
still readable; the form stays filled and shows "이 기기에 저장하지 못했어요. 브라우저의 저장 공간이 가득 찼거나 꺼져 있을 수
있어요. 오래된 기록을 지운 뒤 다시 해 주세요."; the assistant's 확인 shows its fixed error; writing works again when
there is room. A single value over 400,000 characters is refused by the storage layer.

## 21. OFFLINE

With the network off after load: calendar, tasks, check-in, family choices, help request notes, community drafts
and saved items all save; 13 screens render; global search and the assistant's local actions work. Public sources
(network aborted, an error page, bad JSON, a wrong shape): "주변 정보는 아직 연결되지 않았어요…" style messages, state
UNAVAILABLE / ERROR in the operations view, no raw error on screen. There is no service worker: a reload offline
needs the browser's own cache.

## 22. ROUTING

36 addresses exercised: 27 valid (each shows exactly one screen), 9 invalid. Invalid section → the screen's own
address; unknown address → the current screen's address (changed in this phase); `#og-main` (a place on the page)
is left alone. Corrections use `replaceState`: one `hashchange` per navigation, no loop, and Back does not return
to a corrected address. Back / Forward / Reload on a deep link restore the screen and the tab title.

## 23. SEO

- The app page (`/ongil-start/`) is a personal tool: `<meta name="robots" content="noindex, nofollow">`, not in
  the sitemap, no canonical / Open Graph / structured data. That is deliberate and unchanged.
- The public introduction page (`/ko/ongil/`) is the indexed page; it is outside ONGIL's files and was not touched.
- Private screens (내 생활, 건강, 가족, 저장, 내 정보, 운영 보기) are hash routes of that one unindexed page. A hash is
  not sent to a server and is not a separate document; no per-hash SEO exists or is claimed.
- Public items (돌봄, 즐길거리, 스토어) exist only in memory during a visit. PUBLIC ITEM INDEXING = NOT IMPLEMENTED;
  it needs static or server-rendered pages per item (Phase 12 or later).

## 24. COPY AUDIT

Searched all user-facing text for claims that would not be true. None found:
family sending / connection (0), order / payment / booking / application / stock / review (0),
published / joined / members (0), AI that answers anything / model / medical statements (0),
verified / secure / certified providers or admin (0), push or message sent (0).
"준비 중" appears only for family connection and menu entries marked unavailable — all of which are really absent.
Every sentence mentioning 119 says to call directly.

## 25. DATES

Local calendar days everywhere; no UTC conversion in any module. Verified: 23:59 and 00:01 belong to different
days and yesterday's records stay yesterday's; 31 December ↔ 1 January for the calendar, tasks, routines,
medication history, analytics retention and the assistant's "내일"; 29 February exists in 2028 and 2000, not in
2027 or 2100; a page left open overnight notices the new day (minute check and on becoming visible).
Daylight-saving time: day stepping is done at local noon, so a 23- or 25-hour day cannot skip or repeat a date
(Korea has no DST; other time zones were not run).

## 26. ANALYTICS

Re-verified with the assistant events included: 22 events, fewer than 160 counter names, 14 days kept, 13,200
events across 30 days stored in 14 days of counters; free text, a query, a title, a prompt, a user or device id
passed as properties are not stored; no transmission, no identifier; a failing tracker never blocks a feature.

## 27. AI

| Tool group | Needs | Privacy | Changes data | Confirmation |
|---|---|---|---|---|
| get_today_* (4) | calendar, tasks, routines | STANDARD_LOCAL | no | no |
| get_saved_items | saved public items | PUBLIC | no | no |
| search_care / enjoy / store | the public search | PUBLIC | no | no |
| open_* (9) | route tables | by destination | no | no |
| prepare_calendar_event / prepare_task | calendar / tasks (duplicate check) | STANDARD_LOCAL | no | no |
| prepare_family_share | saved public items, connection state | PRIVATE | no | no |
| create_calendar_event / create_task | calendar / tasks | STANDARD_LOCAL | yes | yes, once |

Six handles are passed in; storage, profile, health, journal, expense, family and community stores are not.
Unknown tool execution 0; sensitive write tools 0; a WRITE tool cannot be run without a confirmed draft.
No model is connected.

## 28. ADMIN

Unchanged and re-checked: no sign-in or role gate is pretended; SERVER AUTH / ADMIN RBAC / REMOTE AUDIT LOG shown
as NOT IMPLEMENTED; no secret, private text or health content (the leak markers do not appear in its data); not
in the menu, in search or in any link.

## 29. RELEASE CONFIG

Read, not changed (shared files): `vercel.json`, `netlify.toml`, `_redirects`, `scripts/publish-site.mjs`,
`robots.txt`, `sitemap.xml`.

- Static hosting; `ongil-start/` is copied as a whole by the publish script (required entry).
- Absolute paths (`/ongil-start/…`, `/assets/ongil-mark.svg`, shared sheets and scripts at the site root): the app
  must be served from the site root — it does not work from a sub-path or from `file://`.
- Hash routing: no server rewrite is needed; a 404 can only come from the page itself being absent.
- Depends on five shared sheets and four shared scripts of the Newon site, plus `/livon/livon-api-config.js`
  for the data API location (absent → same-origin path is tried; sources then report unavailable).
- No deployment was made in this phase.

To decide at deployment (not done here): enforce the Content Security Policy (currently report-only) once the
data API origin and the shared scripts' needs are fixed; confirm the cache headers of the host.

## 30. CACHE

- Every local sheet and script in the page carries `?v=`; the six files changed in this phase (app.js and five
  sheets) carry `20261003r11`; `APP_VERSION = 'hardening-v1'` is shown in the operations view.
- The other 67 modules are imported by relative path without a version. They rely on the host revalidating
  static files (no long-lived or immutable cache rule exists for `/ongil-start` in the config). If such a rule is
  ever added, old modules could be served with a new `app.js` — a build step with hashed file names would remove
  that risk (Phase 12).
- No service worker exists and none was added.

## 31. DEPENDENCIES

ONGIL has no package dependency: every import is a relative ONGIL module. The repository's `package.json`
dependencies (`pg`, a translate package) belong to other parts of the site. Outside files: Google Fonts and seven
film files on the media host — both optional (system fonts and the dark background are the fallback). No tracker,
analytics script, embed or CDN script.

## 32. TEST COVERAGE

`node --test tests/ongil/*.test.mjs` → **654 pass, 0 fail** (608 before + 46 new in `release-hardening.test.mjs`: RH-01 … RH-45, and RH-46 from the review in section 37).

| Area | Earlier suites | Gap closed by RH tests |
|---|---|---|
| Stores and contracts | foundation, home, life, health, family, community, store data suites | history after delete (RH-01), schedule steps (RH-02), old shapes (RH-03), quota for every store (RH-28), corruption across all 24 collections (RH-35) |
| Privacy | life-privacy, cross-product, admin-analytics, assistant | one matrix test across search, sync, analytics, assistant, admin (RH-05); erase inventory incl. stray keys (RH-04) |
| Security | shell, cross-product, assistant | whole-source inventories: URLs (RH-06), dynamic HTML (RH-07), secrets (RH-08), provider data (RH-09), routes (RH-10) |
| Accessibility | shell, integration-view, admin, assistant | keyboard and focus rules (RH-11, 12), page-wide ARIA references (RH-13), contrast from tokens (RH-14), reduced motion (RH-15) |
| Responsive | per-phase CSS checks | 320 / 360 / 430 rules, reflow, long text (RH-16 … 20) |
| States, offline, scale | per-phase | RH-21 … 30 |
| Dates, destructive actions | integration-data | RH-31 … 34 |
| Copy | shell (OG-NF) | per-domain truthfulness (RH-36 … 40) |
| SEO, cache, dependencies | none | RH-41 … 44; RH-45 regression |

Existing assertions changed (each has a comment in the test; none deleted or skipped):

| Test | Before | After | Why |
|---|---|---|---|
| home-data OG-MD-3 | deleting a medication removes its marks | the plan entry is removed, the marks stay | H1 |
| integration-view OG-IV-10 | seven text rules allowed under 1rem | four | L3 |
| community-data, store-data, cross-product, admin-analytics, assistant | `assistant-v1`, `?v=20261003b10`, 20 test files | `hardening-v1`, `?v=20261003r11`, 21 | version moved on; one test file added |

## 33. BROWSER QA

Automated, headless Chromium, harness and fixtures outside the repository. Journeys covered across this phase's
harnesses and the re-run harnesses of Phases 2–10: first visit, onboarding, Home, add schedule, add task,
check-in, medication (add, mark, delete, history), My Life history, family, care, enjoy, community, group, store,
search, saved, notifications, assistant, account (erase), admin.

Viewports: 320, 360, 390, 430, 431, 640, 720, 768, 820, 1024, 1280, 1440.
Console errors 0 · page errors 0 · horizontal overflow 0.
Real devices and real browsers other than Chromium: NOT VERIFIED.

## 34. KNOWN LIMITATIONS

- ACTUAL SCREEN READER: NOT VERIFIED. Real phone / tablet touch: NOT VERIFIED. Safari and Firefox: NOT VERIFIED.
- Live public-data providers: NOT VERIFIED (mocked answers and failures only).
- Text over real film frames: contrast NOT VERIFIED.
- The tab-start reset (M2) relies on browser behaviour observed in Chromium.
- Content Security Policy is report-only (site configuration).
- No AI model, backend, account sync, Newon+, remote family, public community, payment or booking — by design of V1.
- L5, L6, L7 (section 6).

## 35. RELEASE BLOCKERS

Checked against the blocker list — data loss, privacy leak, health data exposure, arbitrary script execution,
unsafe URL execution, broken account erase, a major inaccessible primary flow, a crash on a normal flow, broken
mobile primary navigation: **none open**.

BLOCKERS = NONE (for the local-first V1 as built; the unverified items in section 34 should be checked by hand
before a public launch).

## 36. PHASE 12 HANDOFF

Phase 12 is PRODUCTION RELEASE V1.

- Baseline: 654 / 654; 68 modules; 24 collections; version `hardening-v1`.
- Verify by hand first: a screen reader (VoiceOver / TalkBack) on Home, 내 생활, the three header panels and a
  detail dialog; touch at 320–390px; Safari and Firefox; the three live providers; film contrast.
- Decide: enforce the CSP; cache headers or a build with hashed module names; whether the app page stays
  `noindex`; where indexable public content would live.
- The publish step copies `ongil-start/` whole — commit first, then run the site's own publish checks.
- Nothing in ONGIL sends data anywhere except the data-route GETs; any backend, account or model connection is new
  scope with its own privacy review (Phases 4, 6, 7, 9 and 10 list the requirements).

## 37. EXISTING WORK REVIEW

A second session reviewed this phase's work after it was written. It did not reimplement anything. It checked the
document's claims against the source, the tests and its own browser runs (harness outside the repository).

- **Git**: the worktree's git directory is outside the folder that session could reach, so `git status`, `HEAD`
  and the Phase 11 diff were not read. GIT DIFF VERIFIED = NO. The review covered the files as they are now.
- **Tests**: 653 / 653 at the start of the review (608 + 45). After the review: 654 / 654 (RH-46 added).
- **Medication history**, checked with an independent script against `medication.js`: marks kept after a
  medication is removed (shown as removed, read-only, `setTaken` answers NOT_FOUND); a mark from before name
  snapshots existed is given the name on removal; a renamed medication keeps the name in earlier marks; after the
  days change, a past day that was not marked is still read with the old days; a second removal answers NOT_FOUND.
- **Erase and storage full**, independent script: `clear()` removes every `ongil.v1.*` key (a stray one too) and
  leaves other keys; a write refused by the browser answers `ok: false`, throws nothing, and leaves stored data
  unchanged.
- **Privacy**, in the browser: fourteen markers were saved through the real stores (journal, expense, health note,
  symptom, medication name and memo, check-in, help request, post title and body, group name and description, meetup
  title and place). None appeared in global search (exact or partial words), the analytics store, the 운영 보기
  screens, the 저장 screen or any of seven assistant answers. Each marker appears only on its own screen (the help
  request on 가족; the medication plan on Home's own card). An analytics call with a query, text, title, prompt and
  user and device ids passed as properties stored none of them.
- **Security**: whole-source search found no innerHTML, outerHTML, insertAdjacentHTML, document.write, DOMParser,
  eval, Function, string timers or dynamic import in ONGIL's files; no `window.open` or address assignment; no key,
  token or secret shape; outside hosts are the font host and the film host only. Note (INFO, not changed): `el()`
  sets any attribute key it is given; every caller passes fixed keys, `href` is checked by `safeHref` and the one
  image `src` comes from `safeImageUrl`. The shared language script writes a fixed SVG with innerHTML; it is a
  shared file and holds no data.
- **Header and responsive**, in the browser at 320, 360, 390, 430, 431, 640, 720, 768, 820, 1024, 1280 and 1440
  across 14 screens and the three header panels: no horizontal overflow, no overlap between the mark, the tools and
  the menu, tools 44 × 44, the wordmark hidden up to 430 and shown from 431, the panels inside the screen, Escape
  returning focus to the tool. One problem found: **L8**, the shared language button was 34px high. Fixed with
  one ONGIL rule (min-height 44px); re-checked at all widths: 44px high, no overlap, the header bar unchanged at 74px.
  Radio and checkbox fields on 가족 and 내 정보 are 22px, but their whole label is the target (44px or more).
- **Keyboard**: on a fresh load the first Tab lands on "본문으로 건너뛰기" (#life and Home), Enter moves into the main
  content, Tab goes through the page and back to the start without getting stuck, Shift+Tab goes back.
- **Offline**: with the network blocked, a task, an event and a post save; 즐길거리 says "이 자료는 아직 연결되지 않았어요.";
  스토어 says "아직 연결된 상품이 없어요."; no console or page error.
- **Routing**: `#nope` → `#ongil-home`; an unknown section → its screen's address (life, store, community, care,
  admin, enjoy); `#og-main` is left alone; Back, Forward and Reload on a deep link keep the screen and the title.
- **Reduced motion**: with the setting on, none of the seven films plays.
- **Large data**: 500 tasks (the limit), 1,000 events and 500 saved items: about 3,000 elements in the page at any
  screen, no overflow, no "undefined / null"; long tasks of 90–141 ms after reload, as section 19 says (L7).
- **Copy**: no claim of sending, booking, payment, application, publishing, a connected model, push delivery, a
  secured admin or verified providers. "준비 중" appears only for family connection and menu entries that really do
  not exist yet.

Result: one new LOW problem (L8), fixed. No CRITICAL, HIGH or MEDIUM problem was found beyond those already fixed.
ACTUAL SCREEN READER = NOT VERIFIED (none could be run here).

