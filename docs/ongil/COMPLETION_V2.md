# ONGIL Completion V2 — 병원 일정 · 건강검진 on the calendar, and 월 · 주 · 일

Branch `ongil-foundation-v1`, on top of `5e46d9144` (Completion V1).

## What changed

### 1. 병원 일정 and 건강검진 (건강·안부)
- Both are `CalendarEvent`s in the one `events` collection. There is no second schedule store.
- `life-contracts.js` adds an optional `kind`:
  - `GENERAL` is the default. It is stored without a `kind` field, so every existing event keeps exactly its old shape.
  - `MEDICAL_APPOINTMENT` and `HEALTH_SCREENING` are the two health kinds.
- A health event carries:
  - `title`: the 병원 이름, or the 검진 기관 for a screening.
  - `memo` (optional): the 진료 목적 or 준비 메모.
  - `screeningType` (optional, screenings only).
- An unknown kind is read as `GENERAL`, and its extra fields are dropped.
- `schedule.js` adds `listUpcoming(kind, from)` and `countPast(kind, before)`. The rules for edits:
  - `update` accepts `memo` and `screeningType`.
  - An edit never changes the kind.
- `health-appointments.js` is the new module. It draws two cards in `[data-og-extra="health"]` on 건강·안부:
  - Each card shows today's and upcoming events, with the date, time and 검진 종류, and the memo under them.
  - Each card can add, edit (inline form) and delete (with a confirmation) an event.
  - Each card links to 내 생활 › 캘린더 and counts the past events kept there.
  - The cards are drawn again every time 건강·안부 opens.
  - The copy says ONGIL keeps the date only. It does not book or confirm, and it does not judge a result or give advice.
- `areas.js`: 건강·안부's `hospital` and `checkup` modules are now live.

### 2. Health ↔ Calendar
- Health events appear on the calendar day, labelled 병원 일정 or 건강검진 in words.
- The calendar's own form changes only title, date and time. The kind and memo are kept.
- A deletion made on either screen removes the event from both. The same is true after reload.

### 3. Privacy
- `privacy.js` adds `eventClass(event)`. It returns `HEALTH_ADJACENT` for health events.
- `privacy.js` adds `eventShareableWithFamily(event)`. It is always false for health events, and family sharing is off anyway.
- Global search has no calendar provider.
- Family, community, notifications and analytics code do not read these events. Analytics only counts that an event was created.
- The assistant reads a health event as "병원 일정" or "건강검진" with its time. It never shows the hospital, the memo or the screening type.

### 4. Calendar 월 · 주 · 일 (내 생활 › 캘린더)
- **Month:** the Phase 2B grid, unchanged in behaviour.
- **Week:** the seven days, Sunday to Saturday. Each day shows:
  - its events (time, kind label, title)
  - the tasks due that day
  - how many routines are set for that weekday
  
  Navigation is 이전 주 / 다음 주 / 오늘로 가기. The arrow keys move by day.
- **Day:** the chosen date. It shows:
  - the events in time order (the editable list)
  - the tasks due that day
  - that weekday's routines, with whether each was done
  
  Navigation is 이전 날 / 다음 날 / 오늘로 가기.
- The view is a way of looking only. Nothing new is stored.

### 5. 320px touch targets (LOW issue closed)
- At 380px and below, the calendar card takes 12px of the page gutter on each side, and the month grid uses the card's padding with cells edge to edge.
- Measured day buttons:

  | Width | Day button |
  |---|---|
  | 320px | 44.6 × 46.4 |
  | 390px | 45.0 × 46.4 |

- The grid stays inside the card, and the page does not widen.

### 6. Accessibility
- The view switch is a group of pressed buttons (`aria-pressed` + ✓) with a hidden label "보기 방식". The change is announced.
- Day buttons have:
  - `aria-pressed`
  - `aria-current="date"` for today
  - a label with the full date, the number of events and tasks, or 일정 없음
  - roving tabindex
- Today is shown with a dashed ring. The chosen day is filled; in the week view it also shows a ✓ and the word 오늘.
- `home-list.js`: Escape closes an inline form or a delete confirmation, and focus returns to the button that opened it.

### 7. Store hero
- The Store screen has its film: `hf_20260815_075403_…mp4`, lazy, no autoplay, with the same classes as the other screens.
- It uses the requested copy.

### 8. Cache
- Only the changed entry points moved to the new version: `app.js` and `ongil-life.css` → `?v=20261004v12`.
- The other stylesheets keep `?v=20261003r11`.

## Tests
- New file `tests/ongil/health-calendar.test.mjs` (OG-HC-1…11).
- Earlier pins were updated where this change deliberately moved them:
  - module, test-file and video counts
  - health modules now live
  - the 320px rule
  - the Store hero copy
  - cache versions
- `node --test tests/ongil/*.test.mjs`: 714 / 714 pass.
- LIVON suite: 477 pass, 1 skipped (PostgreSQL). No LIVON file was changed.

## Browser QA (Chromium, Asia/Seoul clock)
Viewports: 390 for the round trip; 320 / 390 / 768 / 1440 for the views.

- **Round trip:** health add → calendar shows it → calendar edit → health shows it with the memo kept → reload → health delete → gone from the calendar after reload. The same for 건강검진.
- **Errors:** an empty name gives an alert and marks the field. Escape closes the form and returns focus.
- **Privacy:** search finds nothing, and the assistant tool shows only "병원 일정".
- **Views:** month, week and day; keyboard view switch; arrow keys; focus ring.
- **Size and layout:** 44 × 44 targets and no horizontal overflow at all four widths.
- **Date boundary:** at 00:05 on 1 January 2027, today is the local day, the week spans the new year, and a new event defaults to that day.
- **Store hero:** the film element and the requested copy are present.
- **Console:** 0 errors.

Safari and real devices were not tested; no WebKit is available in this environment.
