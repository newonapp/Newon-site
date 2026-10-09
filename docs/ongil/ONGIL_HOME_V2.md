# ONGIL Home V2 — the senior's day first

Status in one line: **Home is nine sections in a fixed order, built only from existing stores and screens.** No new
collection, no new backend, no network on render. Base: `main` 67c87e83d (audit: `claude/ongil-home-v2-audit-plan-2026-10-09.md`).

## Order

| # | Section | What it shows | Data (canonical) |
|---|---|---|---|
| 1 | 오늘 | greeting, date, what is left today (counts) | `buildHomeSummary` (schedule · tasks · routines · medication · checkIn) |
| 2 | 오늘 할 것 | 오늘 일정 · 오늘 할 일 · 오늘 루틴 · 기한 지난 할 일 (only when there is one) · 다가오는 일정 (3 lines) | `splitToday(buildToday())` and `buildUpcoming()` from My Life V2 — the same records and numbers as 내 생활 › 요약 |
| 3 | 건강·안부 | 오늘의 안부 · 복약 (먹었어요 · 건너뜀 · 표시 풀기) · 식사·물·운동 | checkIn · `medication.setStatus` (the same call as 건강·안부) · dailyLife |
| 4 | 가족 | connected on this device, waiting invitations, unsent help notes | `familyConnect.connectedCount()` · `overview().pending` · `help.openCount()` — never a record |
| 5 | 즐길거리 | six categories · 내가 저장한 관심 활동 (only when saved) · 찾아 본 것 · 내 주변 강좌 (button only) | `buildActivities(saved)` · `enjoyView.items()` · lifelong-class source |
| 6 | 돌봄·서비스 | four kinds of help → `#care/<id>`; services and benefits have no data yet | links only |
| 7 | 커뮤니티 | counts of my posts and group drafts; this device only | `posts.count()` · `groups.count()` |
| 8 | ONGIL 도우미 | rule-based helper, three working examples, 도우미 열기 | the header assistant panel |
| 9 | 서비스 안내 | 저장한 것 · 내 정보·글자 크기 · ONGIL 소개 | links only |

## Approved decisions

1. 식사·물·운동 are in 건강·안부.
2. Home has no add/edit/delete for events or medications. 일정 추가 · 할 일 추가 · 약 추가 open the one form in 내 생활
   (`life.openAdd('calendar' | 'tasks' | 'medication')`; the calendar gained `openAdd`, for today). Marks reuse the stores.
3. 빠른 실행 was removed.
4. 내 주변 is part of 즐길거리.
5. The hero is `72svh` (min `32rem`) at ≤ 860px.

## Truth and privacy

- A check-in is a note; an unmarked dose is not "not taken"; nothing is judged, scored or sent.
- 가족: "지금은 이 기기 안에서만 가족과 연결돼요" — other-device connection is not open. Health, check-in, place and phone
  are never shown on the card and never shared automatically.
- 커뮤니티: this device only; publishing and comments are not open. 도우미: "정해진 요청만 알아듣는 도우미예요 … AI는 아니에요".
- No recommendation, ranking or invented programme. Nothing of the held Enjoy Phase B is used.

## Error isolation

Every card is made (`guard`) and redrawn (`draw`) inside its own try; a failing card is replaced by
"이 부분을 지금 보여 드리지 못했어요 …" and the other sections keep working. Drawing Home writes no storage, sends no request
and never changes the address (browser test HV2-B10).

## Files

`ongil-start/js/home-view.js` · `home-today.js` · `home-explore.js` · `areas.js` · `app.js` · `life-plan.js` (calendar
`openAdd`) · `life-view.js` · `ongil-start/styles/ongil-home-v2.css` (new; `ongil-home.css` unchanged) · `index.html`
(new stylesheet, `app.js?v=20261009hv2`, import map, family film sentence) · `tests/ongil/home-v2.test.mjs` (new).

## Large-text accessibility patch

Commit "Fix ONGIL Home V2 large-text accessibility" (on top of 4ca2647f). Layout only, in `ongil-home-v2.css`
(`[HV2-A11Y]` block, address `?v=20261009hv2` → `?v=20261009hv3`); no script, markup or data change.

- Before: at 200% text on a 320px phone four list rows had labels under 44px (checkbox and label shared a column a few
  letters wide), and at 320 / 390px the two hero buttons ran off both edges of the screen.
- After: when Home is narrower than 12rem (measured in text size) the card and row paddings give way and a checkbox sits
  above its label; at ≤600px the hero buttons wrap. At ordinary text sizes nothing changes (same page length at 100%).
- Browser tests HV2-B11…B15: 320 / 390 / 768 / 1024 / 1440px × 100% / 200%, empty and filled — overflow 0, cut text 0,
  controls off screen 0, every target ≥ 44 × 44. HV2-B16: keyboard at 200% (Space, Enter, focus-visible) and the helper
  panel opens by keyboard and by pointer and is still open 500ms later.
- Known: pressing 도우미 열기 while the panel is already open closes it (the panel's own outside-click rule); unchanged here.
- NOT VERIFIED: real phones and tablets, screen readers, the browser's own zoom menu, Safari / Firefox.
