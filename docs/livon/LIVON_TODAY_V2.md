# LIVON Today V2 — 내 오늘

STATUS = INTEGRATED, NOT DEPLOYED (feature `af3ef7307` on base `96f74d7ec`; merged into production main `32a8651d2` on branch
`livon-today-v2-production` — see §10).

## 1. What changed

The Today screen (`#today`, "오늘의 발견") gets one new first section, **내 오늘** (`#td-mytoday`, first link of the Today
menu). Everything else on Today — hero, discovery feed, For You, this week, places … library — is unchanged.

내 오늘 shows, from the records the person keeps in My Life on this device:

| Block | Content | Rule |
|---|---|---|
| Header | date, greeting, "이 기기에 저장한 내 생활 기록만 보여요." | device-local date |
| Summary | 오늘 할 일 N개 중 M개 완료 · 오늘 일정 N개 · 오늘 루틴 N개 중 M개 완료 · 기한 지난 할 일 N개 | counts only, no score |
| 오늘 할 일 | tasks due today (open first, priority shown when 높음), then open overdue tasks marked "기한 지남 · date" | check / uncheck |
| 오늘 일정 | today's events, all-day first then by start time, place if recorded | read only |
| 오늘 루틴 | routines scheduled today (existing weekday rule) | check / uncheck today |
| 다가오는 7일 | tomorrow … +7: events not done, open task deadlines, goal target dates | real dates only |
| Footer | link to My Life › 저장 when saves exist; pointer to 오늘의 발견 below; pointer to 라이프 스테이지 (`#life`); "이 기기에만 있고 어디에도 보내지 않아요" | no stage is inferred |

Empty blocks say so ("오늘 할 일이 없어요." …) and link to the real My Life screen. Nothing is invented.

## 2. Architecture

- **One store.** Today keeps no data and no storage key. It reads and changes `livon.mlStore.v1` only through
  `LivonMyLife.api` (in `livon/life-now-page.js`):
  - `today(now)` → `{ date, weekday, label, todos, overdue, events, routines, upcoming }` (plain copies)
  - `setTodoDone(id, done)` → the existing `setTodoDone` (sets / clears `doneAt`)
  - `setRoutineDone(id, done, now)` → the existing `setHabitDone`, refused for a routine not scheduled today
  - `josa(word, pair)` → Korean particle helper (below)
- Upcoming reuses My Life V2's `upcomingItems`; routine scheduling reuses `habitScheduledOn`. No second calculation.
- Rendering lives in `livon/today-page.js` (`renderMyToday`), styles in `livon/today-page.css` (existing Today tokens).
  It re-renders when Today is shown, after each change, when the tab regains focus on a new day, and on a `storage`
  event for `livon.mlStore.v1` (another tab).
- Changes made in Today are what My Life shows (and the reverse) — the same records, read fresh on each view.

## 3. My Life fixes included (minimal)

- **Routine week count**: days before a routine was created are no longer counted (`habitWeek`), so a routine made
  on Thursday shows "이번 주 0/3", not "0/7". The weekly review uses the same count. Older routines are unchanged.
- **Terminology**: what a person reads is "루틴" (form label, Today tile "루틴 · 오늘 남음", messages, 확인 필요 caption).
  Internal keys (`habits`, `habitLogs`, `data-lv-ml-habit`) are unchanged.
- **Korean particles**: messages use the right particle — "거래를 저장했습니다.", "할 일을 추가했습니다.",
  "‘보고서’가 …". A word that does not end in a Hangul syllable keeps the neutral form ("Run을(를)").

## 4. Dates

All dates are built from local year/month/day (`todayStr`, no `new Date("YYYY-MM-DD")`). Tested at 23:59:59 → 00:00:00,
month end, year end and 2028-02-29 in Asia/Seoul, UTC and America/Los_Angeles (TV2-24 … TV2-28). A page left open
across midnight shows the new day when the tab regains focus.

## 5. Privacy and boundaries

- Titles appear only as text on the page: never in a URL, hash, request, log or analytics; every link in 내 오늘 is a
  fixed internal route (TV2-33, TV2-34).
- Not in the public LIVON search, Community, sitemap, SEO pages or the static HTML (TV2-29 … TV2-32).
- LIVON AI: unchanged; My Life permission default OFF; Today sends nothing to AI and adds no AI text.
- Account sync / Firebase / remote userdata: not used, not mentioned; no cloud or sync claim.
- Notifications: unchanged; Today makes no notification or reminder claim.
- Saved: unchanged schema and export contract; Today only links to My Life › 저장 when saves exist.

## 6. Cache window

GitHub Pages caches HTML and scripts for up to 10 minutes and ignores `?v=`. Both mixes are safe:
new page + old Today script → the section keeps its static line "내 생활에 기록한 오늘의 할 일·일정·루틴은 내 생활에서 볼 수
있어요."; new script + old page → no `[data-td-my]` host, nothing renders. Changed files carry `?v=20261004c6`
(`today-page.js` `?v=20261004c7` after the production hardening).

## 7. Tests

`tests/livon/today-v2.test.mjs` (TV2-01 … TV2-56; data tests run everywhere, browser tests need Chromium). Updated:
`my-life-v2.test.mjs` (ML2-36 accepts a later `c` version, ML2-01 tile "루틴", ML2-03 message),
`release-candidate.test.mjs` (`TODAY_V2` named-commit entry for RC-1 / RC-41).

## 8. Known limitations

- 내 오늘 adds no new records itself; adding goes through My Life (links provided).
- Events cannot be completed from Today (My Life keeps that on the event row).
- Real Safari / iPhone / Android not verified.

## 9. Production activation

Nothing to configure: no environment variable, server, API or database. Needs only the normal production integration
(merge into main, full LIVON/ONGIL regression) and a deploy.

## 10. Production integration

- `git merge --no-ff` of `livon-today-v2` into production main `32a8651d2` (ONGIL Health · Safety V2, `app.js?v=20261005h14`).
  No path overlaps; no ONGIL file changes; the ONGIL import map is unchanged and current.
- Hardening: 내 오늘 footer links to 라이프 스테이지 (`#life`) without reading any Life Stage data (TV2-57);
  `today-page.js` moved to `?v=20261004c7`.
- Checked in Chromium: both cache mixes (new page + old Today script/CSS; old page + new scripts) render without errors;
  23:59:58 → 00:00 and 2028-02-28 → 29 in Asia/Seoul, UTC and America/Los_Angeles refresh 내 오늘 on focus; Space toggles
  a task with focus kept and an announcement; no request carries a record title.
- Real Safari / iPhone / Android: not verified.
