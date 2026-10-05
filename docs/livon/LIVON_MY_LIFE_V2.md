# LIVON My Life V2 — Personal Life Hub

Branch `livon-my-life-v2` (base `dd92aaa2d` = origin/main). Frontend only, local-first: everything stays in this browser.
No server, API, Vercel, OpenAI, Firebase or ONGIL file changed. The existing screen (`#life-now`, `#ml-*` routes), design,
store (`livon.mlStore.v1`, `STORE_VERSION 2`) and shared saves (`LivonPlatform`) are reused; nothing was redesigned.

Principle: **TODAY → PLAN → DO → RECORD → REVIEW**. Today shows what is due now; Calendar / Tasks / Goals / Routines are
for planning and doing; Records keep what happened; the weekly review counts it. Every number is counted from saved
records — there are no sample data, scores or predictions.

## 1. Audit of the existing My Life (before V2)

| Feature | Before | V2 |
|---|---|---|
| Home dashboard (date, tiles, priority, timeline, today tasks, goals, saved, recent) | LIVE · real counts | kept; greeting from real counts, quick actions incl. +기록, today's routines, next 7 days, private search |
| Calendar (month/week/day, select date, event CRUD, conflict check) | LIVE | kept; day cells count task deadlines too; selected day lists its tasks and records |
| Tasks (CRUD, done/undo, due/priority/category/memo, 전체/오늘/예정/완료, source filter, duplicates, checklists) | LIVE | kept; **sort** 마감일순/최근 만든 순/우선순위순 (URL `sort=`) |
| Goals (CRUD, status, linked-task progress) | LIVE · progress only from linked tasks | kept; one-click 완료 / 다시 진행, `doneAt` recorded |
| Habits (daily/weekly, today check, streak) | PARTIAL · inside Goals; no weekdays; streak broke on an unchecked today | **Routines** view: weekdays, scheduled-day check, streak/week counts from the log only |
| Journal (CRUD, category, mood, private) | LIVE · private | kept |
| Money (tx CRUD, monthly totals by category, monthly budget) | PARTIAL · current month only, `amount` validated loosely | month navigation, `saveTx` validation, budget used %, plain over-budget wording |
| Health records | LIVE · local, no diagnosis | kept (new title "건강 기록" so "루틴" means habits) |
| Experiences, projects, checklists, bookings, interests, recent, family | LIVE / honest PLACEHOLDER (family, bookings) | unchanged |
| Saved | LIVE · global `LivonPlatform` store shared with Life Stage / Today / Explore / Community | unchanged; not copied into My Life, not exported or deleted by My Life |
| Records hub | NOT IMPLEMENTED | **전체 기록** (`#ml-records`) |
| Upcoming | NOT IMPLEMENTED | **다가오는 7일** on Today |
| Weekly review | PARTIAL · "리포트" had all-time totals; "최근 7일 일정" counted every future event | **주간 리뷰** with week navigation; the 7-day count fixed |
| Private search | NOT IMPLEMENTED | **내 생활 검색** (`#ml-search`, hidden module) |
| Export | NOT IMPLEMENTED · an unreachable handler wrote the raw store | settings button, warning dialog, versioned JSON, browser download |
| Delete all | NOT IMPLEMENTED · unreachable handler replaced the whole store | settings button, scope dialog + final confirmation, My Life collections only |
| Damaged storage | PARTIAL · non-object store was handled; junk entries and duplicate ids were not | `sanitize()` |

## 2. Architecture

`livon/life-now-page.js` still owns the screen (store, forms, existing views, routing, one event delegate). The V2 parts
live in `livon/life-now-hub.js`, loaded just before it (`?v=20261004c5`): the page installs the hub with its own helpers
and store functions (`LivonMyLifeHub.install(core)`), so there is still one store and one set of date/format helpers.
The split keeps every script under the 160 KB per-script performance budget (page 148 KB, hub 37 KB; was 135 KB). If the
hub were missing, the rest of My Life keeps working and the four hub views say they could not be loaded.
Module list in `livon/life-now-data.js`, styles in `livon/life-now-page.css`, markup in `livon/index.html`. Reads/writes
go through `readJSON`/`writeJSON` → `window.LivonUserData` (repository, local adapter) → `localStorage`. UI and tests call
the same functions (`window.LivonMyLife._test`).

- page: `sanitize`, `saveHabit`, `setHabitDone`, `habitScheduledOn`, `saveTx`, `moneySummary`, `sortTodos` (+ forms, handlers)
- hub: `habitStreak`, `habitWeek`, `dayItems`, `upcomingItems`, `weeklyReview`, `recordsList`, `searchMyLife`,
  `exportPayload`, `exportCounts`, `clearMyLifeData`, `downloadExport`; views `routines`, `records`, `search`, `money`;
  blocks 오늘의 루틴, 다가오는 7일, the calendar day extras, 주간 리뷰, 내 생활 데이터

Views: `routines`, `records` (menu), `search` (reached from the search form; `hidden: true`, not a card or menu item).

## 3. Data model (`livon.mlStore.v1`, still `v: 2`)

No new top-level key and no version bump — additions live inside existing records:

| Record | New field | Meaning |
|---|---|---|
| habit | `freq: "days"` + `days: [0..6]` | routine on chosen weekdays (`daily` / `weekly` unchanged; all 7 days saves as `daily`) |
| goal | `doneAt` (ms) | set when status becomes 완료, kept on later edits, removed on reopen |
| transaction | — | `amount` now always a non-negative integer (validated in `saveTx`) |

`sanitize()` on load: a store that is not an object reads as empty and is not written back; non-object entries are
skipped; a missing or duplicate id gets a fresh id (the first record keeps its id), so no valid record is lost and
edit/delete touch exactly one record; `habitLogs`/`budgets`/`settings` get their shape back. A repaired store is saved.

Dates are device-local calendar days (`todayStr`, `parseDate`, `addDays` build dates from local Y/M/D), checked in five
time zones (ML2-31). Week start follows `settings.weekStartsOn` (default Sunday).

## 4. Counting rules (no invented numbers)

- Today tiles and greeting: events dated today, open tasks due today or overdue, goals 진행 중, routines scheduled today and
  not yet checked.
- Routine streak: consecutive scheduled days checked, walking back from today; an unchecked today does not break it;
  unscheduled days and days before the routine existed are skipped; weekly routines count weeks.
- Upcoming: tomorrow … +7 days — events not done, open task deadlines, target dates of goals 진행 중. Nothing else.
- Weekly review: events dated in the week, tasks completed in the week (`doneAt`), tasks due / still open, tasks created,
  goals completed (`doneAt`), routine checks vs scheduled, journal and health entries, expense/income. No score or grade.
- Money: only typed amounts; budget remaining and used % only when a budget is set; over budget reads "예산보다 N원 더 썼어요".

## 5. Privacy

- Journal, health, money, budget, schedule, tasks, goals and routines stay on this device; journal entries are `private: true`.
- Nothing in My Life posts to Community; Community code never reads the journal.
- The public LIVON search index (`explore-search.js`) never contains My Life content (ML2-32). 내 생활 검색 runs in memory
  on this store only; its query is not put in the URL or stored.
- `life-now-page.js` has no `console.*`, `fetch`, XHR, beacon or analytics call (ML2-33).

## 6. Export

내 생활 › 설정 › 내 생활 데이터 › "내 생활 데이터 내보내기 (JSON)". A dialog first warns that diary/health/money are in the
file and that it is not uploaded. The file `livon-my-life-YYYY-MM-DD.json` is created with a Blob URL in the browser
(revoked after the click):

```json
{ "app": "LIVON", "kind": "my-life-export", "version": 1, "storeVersion": 2, "exportedAt": "<ISO>",
  "collections": { "events": [], "todos": [], "goals": [], "habits": [], "habitLogs": {}, "checklists": [], "projects": [],
                   "journal": [], "transactions": [], "budgets": {}, "health": [], "experiences": [] } }
```

Only these My Life collections. Not included: saved items (global store), Community, personalization, interests, recent
views, LIVON AI threads, store settings. There is no import yet (Help says so: "다시 불러오는 기능은 아직 없어요").

## 7. Delete all

"내 생활 데이터 전체 삭제" (disabled when there is nothing to delete). Dialog 1 lists what is deleted and what stays; dialog 2
is the final confirmation ("되돌릴 수 없어요"). Cancel or Escape at either step changes nothing. `clearMyLifeData()` empties
exactly the collections in `ML_COLLECTIONS` and writes the store once through `saveStore`; store settings, folders and
legacy keys stay. Untouched: `LivonPlatform` saves (Saved is a global store — audit result), `livon.cmStore.v1`
(Community), personalization, interests, recent views, `livon.aiStore.v1`, ONGIL, Newon+ session (ML2-24…26).

## 8. Account Sync compatibility (`d4a2cf735`, not merged)

The sync engine maps store fields to collections (`todos→tasks`, `events→calendar_items`, `habits`, `journal`, …) and
records tombstones when ids disappear from a tracked field. V2 keeps every top-level key in the inventory (ML2-40), adds
fields only inside records (synced as part of the record), and deletes through the same repository write, so a delete-all
produces ordinary tombstones. No migration is needed; `STORE_VERSION` stays 2. Not verified against a live sync server
(sync is off in production).

## 9. LIVON AI compatibility

AI code is unchanged. "LIVON AI가 내 생활 사용" in settings shows the AI permission (`livon.aiStore.v1`
`settings.shareMyLife`, default OFF) and links to AI settings; My Life never changes it. With it ON, AI still reads only
open task / goal / 14-day schedule titles and dates (`scopedPersonalData`) — never journal, health or money (ML2-13, ML2-34).

## 10. Accessibility and layout

Existing tokens and components only (chips, manage lists, stat tiles, dialogs). Pressed filter chips use `aria-pressed`;
results and actions are announced in the existing live region; completion is in the text ("(완료)", "오늘 완료"), not colour
only; calendar day labels include event and task counts; routine checkboxes keep focus after re-render; confirm dialogs
are `alertdialog`, focus Cancel, trap Tab and close on Escape. 320–1440 px without horizontal overflow, 200% text without
clipping, new controls ≥ 44 px (ML2-41…46).

## 11. Limitations

- No import of an exported file; no category budgets (the `budgets.categories` field stays unused).
- Records hub renders 30 at a time ("더 보기"); search shows the 50 newest matches with the total count.
- Weekly "완료한 할 일" needs `doneAt`, which exists only for tasks completed in the app (older imports have none).
- Reminders/notifications for routines are not implemented.

## 12. Tests

`tests/livon/my-life-v2.test.mjs` ML2-01 … ML2-47 (34 data-layer tests run everywhere; the 13 browser tests ML2-01/02/03/05/22/23/41…47 need Chromium).
Updated for the new truth: `release-candidate.test.mjs` RC-24 (Help describes export/delete; the two controls exist only in
the My Life settings block), RC-20 (controls only on `#ml-settings`), RC-1/RC-41 accept the files of the commit
"Complete LIVON My Life V2" (`MY_LIFE_V2`); `completion.test.mjs` LC-20 accepts help-data.js on a later `c` version.

Results on this commit's tree:

| Run | LIVON | ONGIL |
|---|---|---|
| cloud, with Chromium | 1151 pass · 0 fail · 1 skip (AB-17, needs `LIVON_TEST_PG`) | 777 pass · 0 fail |
| Mac worktree, no Chromium | 1079 pass · 0 fail · 73 skip (browser tests) | 777 pass · 0 fail |

Build: `publish-site` OK (89 asset references on `livon/index.html`, 0 missing; `life-now-hub.js` published), API-only build OK,
performance check 0 errors (the one warning, `theme-shell.js` in `<head>`, is older than this branch), no key or fixture
content in the published output.

## 13. Production integration (branch `livon-my-life-v2-production`)

Merged `--no-ff` into production main `4b46d50f0` (with LIVON Community V2, ONGIL Family V2, ONGIL Community V2 and the
ONGIL module-version map): "Integrate LIVON My Life V2 with production". Conflicts in `livon/index.html` (Community V2
cache keys kept, `help-data.js` on `c5`) and `tests/livon/release-candidate.test.mjs` (COMMUNITY_V2, ONGIL_FAMILY_V2 and
MY_LIFE_V2 entries all kept). No LIVON Community, LIVON AI, ONGIL, server or API file changed.

Test-only hardening ("Harden LIVON My Life V2 production integration"): RC-41 failed on production main itself — Community
V2's product files and `scripts/ongil-module-versions.mjs` (ONGIL cache hardening) had no RC-41 entry. RC-41 now accepts the
files of named commits only when that commit is in HEAD's history and really changed each listed file (`namedCommitFiles`:
COMMUNITY_V2, ONGIL_MODULE_VERSIONS, MY_LIFE_V2). Nothing else is accepted; no SHA is hard-coded.

The My Life "route state" test failed on main whenever the device's local date was 2026-10-05 (its fixture date). The
feature's fix (a date that is never today) was kept; checked with a fixed clock at four instants in Asia/Seoul and UTC:
main fails exactly on the local day 2026-10-05, the integration passes at every instant.
