# ONGIL My Life V2 (내 생활)

Status: **LOCAL (this device)**. Feature branch `ongil-my-life-v2` on production main `32a8651d2`. Not live.

```
REMOTE SYNC = NOT IMPLEMENTED                (no My Life server, no account sync, no cloud backup, no multi-device)
FAMILY SHARING OF MY LIFE V2 RECORDS = NONE  (메모, 기록, 할 일 and 루틴 are no sharing category; 일정, 식사, 수면 and
                                              활동 stay Family V1 categories, off by default, turned on per member)
AI ACCESS TO MY LIFE V2 RECORDS = NONE       (the assistant is given no memo, record or expense store)
HEALTH = CANONICAL IN ITS OWN STORES         (My Life reads counts; it copies nothing)
```

## 1. AUDIT

My Life V1 (Phase 2B, Completion V1–V3) already had five tabs: 요약 · 일정 (캘린더 월/주/일, 할 일, 루틴) · 생활 (식사, 물,
운동, 수면) · 기록 (생활비, 기록) · 건강. V2 classifies each part as follows:

| Area | Where | V2 |
|---|---|---|
| 요약 (overview) | `life-view.js buildOverview` | KEEP tiles · COMPLETE: 오늘 할 것, 오늘의 건강·안부, 다가오는 일정, 메모, 관심 활동 |
| 캘린더 월 · 주 · 일 | `life-plan.js`, `schedule.js` (`events`) | KEEP · upcoming list on 요약 (no second calendar) |
| 할 일 | `tasks.js`, `life-plan.js` | IMPROVE: optional 시간 (on the due day) and 메모 |
| 루틴 | `routines.js`, `life-plan.js` | IMPROVE: example names to tap (words only) |
| 생활 (식사·물·운동·수면) | `life-daily.js` | KEEP |
| 기록 (journal) | `journal.js`, `life-records.js` | IMPROVE: optional 어떤 기록 (오늘 한 일 · 다녀온 곳 · 만난 사람 · 취미 활동 · 기억하고 싶은 일) |
| 생활비 | `expenses.js` | KEEP |
| 메모 | — | NEW: `memos.js` + 메모 section in 기록 (PRIVATE) |
| 건강 tab, 건강·안부 | `life-health.js`, `health-*` | KEEP (Health · Safety V2, unchanged) |
| 즐길거리 → 내 생활 | `saved.js` (PROGRAM, PLACE) | NEW read-only view: 관심 활동 |
| Search · Saved · Notifications · Family · Community · AI | existing | KEEP, no new access |
| Removed | — | nothing |

## 2. ARCHITECTURE

- `life-today.js` (new): pure builders, with no DOM, storage or network. They are `buildToday`, `buildUpcoming`,
  `buildHealthGlance`, `buildActivities` and `formatDateTimeShort`.
- `memos.js` (new): the memo store, built on the shared `record-store.js`.
- `life-view.js`: 요약 draws the new cards. 메모 is a third section of the 기록 tab (`#life/memos`).
- `life-plan.js`, `life-records.js`, `tasks.js`, `journal.js`, `life-contracts.js`: the field additions above.
- `home-ui.js`: an optional `suggestions` list under a text field. It is a shared form helper, and nothing else uses it.
- `app.js` wiring: `memos` goes to 내 생활 only, and `saved` is given read-only to 내 생활.
- Registration: `storage.js` registers the `memos` collection, and `privacy.js` classifies it PRIVATE.

## 3. CANONICAL DATA

One record, one store:

- **일정 and 병원 일정:** both are `events` (Health appointments are events with a `kind`).
- **Other records:**
  - 할 일 → `tasks`
  - 루틴 → `routines` and `routineLogs`
  - 기록 → `journal`
  - 생활비 → `expenses`
  - 메모 → `memos`
- **Health:** 안부 → `checkins`; 복약 → `medications` and `medicationLogs`.
- **관심 활동:** `saved`.

No V2 code writes a copy anywhere. 요약 reads the same instances as Home, the calendar and 건강·안부. Exactly one
collection is new: `memos`.

## 4. TODAY

오늘 할 것 is one list that holds:

- today's events (병원 일정 and 건강검진 are named by kind, in words rather than colour);
- the routines for today's weekday;
- the tasks due today;
- below these, open tasks whose day has passed ("…까지였어요"). These are shown, never dropped, and never marked for the person.

Each row's checkbox is the store's own mark: an event is 끝냄, a routine 했어요, a task 끝냄. Undo is the same box. The
day is the local day, and no UTC is used.

## 5. TASKS

The fields are 할 일, 언제까지 (optional), 시간 (optional, needs a day), 중요도 and 메모 (optional, 100 characters). On the
same day, timed tasks come first in time order. A task written before V2 has neither 시간 nor 메모 and reads unchanged.

## 6. ROUTINES

Routines are daily or weekly, set by weekday, with an optional time. You mark them done per day, undo the mark the same way, and pause or delete a routine (its marks go with it).
The examples 산책 · 독서 · 물 마시기 · 취미 · 운동 · 전화하기 are buttons that write the word into the name field. Nothing
exists until 저장. Nothing is claimed about health from a routine, and nothing is scored.

## 7. CALENDAR

The existing 월 · 주 · 일 views stay as they are. 다가오는 일정 on 요약 covers tomorrow through day 14. It lists events not yet finished and open tasks due, at most 20 lines, and says how many more there are. Health appointments appear from the one store. They are created, edited and deleted where they belong (캘린더 or 건강·안부), and 요약 never copies them.

## 8. LIFE RECORDS

기록 keeps the journal store and adds an optional 어떤 기록 choice. Records are PRIVATE. 요약 says only whether one was
written today, never what it says. Records are never shared with family, never in the global search, never given to
the assistant, and never turned into a community post.

## 9. MEMO

The memo is new and PRIVATE: an undated note of up to 1000 characters with line breaks kept, optionally pinned to the top.

- **Size:** at most 300 memos, with a clear message when the limit is reached.
- **메모에서 찾기:** searches the memos on this device only. Every word must appear, and case is ignored. The search words
  are not stored, not put in the address and not counted.
- **요약:** shows only how many memos there are.

## 10. ACTIVITIES

관심 활동 lists programmes and places the person saved in 즐길거리 (newest three, plus a count), as titles only. The card
says 저장만 해 둔 것이에요. 신청이나 예약은 ONGIL이 하지 않아요. ONGIL claims no participation, application or booking. A
person who decides to go can add it to the calendar themselves.

## 11. HEALTH CONNECTION

Health · Safety V2 is live and unchanged. 요약 shows 오늘의 건강·안부 from the Health stores, as counts only:

- whether today's 안부 was written (never what was chosen);
- how many doses today's plan has, and how many the person marked 먹었어요 or 건너뜀 (never a medicine's name);
- how many 병원 일정 and 건강검진 are today.

A check-in is the person's note, not a safety confirmation. A dose counts only when the person marked it. My Life shows no blood pressure, blood sugar, oxygen, symptom or health memo, and no diagnosis or score. The Phase 2B summary builder still reads no health store.

## 12. FAMILY

Family V1 and V2 are unchanged (no family file was touched). 메모, 기록, 할 일 and 루틴 are no category of the Family V1
permission engine. 일정, 식사, 수면 and 활동 are categories there. They are off by default, turned on per member by the
person, and shared as summaries. Nothing on 내 생활 claims anything was sent to another device.

## 13. COMMUNITY

Community V2 is unchanged. Community modules import nothing from My Life, and My Life imports nothing from community. A
private record is never turned into a post.

## 14. AI

ONGIL AI receives no memo, record or expense store. Its existing local tools for 일정, 할 일 and 루틴 are unchanged. No
remote provider is switched on, and the V2 modules never call the assistant.

## 15. LOCAL-FIRST

Everything stays in the browser storage of this device. 요약 ends with this line: 내 생활의 기록은 이 기기에만
저장돼요. 다른 기기와 맞추거나 백업하지 않아요. There is no sync, no backup and no cloud, and nothing claims one.

## 16. PRIVACY

These boundaries hold:

- My Life data never reaches the public or global search: no provider was added, and private providers are never run.
- No private record appears in Community, the static build or the sitemap.
- Addresses name a section only (`#life/memos`), never data.
- Analytics receives no content: V2 adds no event.
- Normal use makes no network request.
- Erasing ONGIL data removes `memos` along with everything else.

## 17. SENIOR UX

The design follows the existing ONGIL rules:

- **Copy and controls:** short Korean labels, large existing controls (44px rows; a checkbox's row is its label), and
  every field labelled.
- **Forms:** errors are tied to their field (`aria-invalid`, `aria-describedby`, `role="alert"`). Escape leaves a form
  or a delete confirmation, and focus returns to where it was.
- **Announcements:** status lines are polite live regions.
- **Visual state:** state is never shown by colour alone.

Verified at 320 / 390 / 768 / 1024 / 1440 px and at 200% text size in Chromium.

## 18. CACHE

The official generator (`node scripts/ongil-module-versions.mjs --write`) rewrote the import map: content-hash versions
for every changed module, including the new `memos.js` and `life-today.js`. Because `app.js` (the entry) changed, its `?v=` moved
on from `20261005h14` to `20261006m15`, following the Health · Safety V2 precedent. No CSS changed. No service worker
was added.

## 19. TESTS

`tests/ongil/my-life-v2.test.mjs` (OML2-01 … OML2-50) covers:

- **Data and features:** honest empty state; today; completion and undo; task, routine, calendar, record and memo CRUD with reload; validation; memo local search; corrupt storage and duplicate ids; long text; date and year boundaries.
- **Boundaries:** Health canonical; privacy class; search, family, community, AI and analytics boundaries; no network or sensors; no data in addresses; local-first copy; copy audit; activities.
- **Preservation and housekeeping:** Health V2, Family V2, Community V2 and LIVON; cache; security; docs; cleanup.
- **Browser:** 5 widths, keyboard, form errors, 200% text, reload, network privacy, Health connection and examples.

Earlier suites changed only where they count collections or modules or pin the entry version, each with a BEFORE/AFTER note.

## 20. KNOWN LIMITATIONS

- Everything is on one browser on one device. Clearing browser data removes it, and there is no export tool yet.
- 메모 has no categories or attachments. 메모에서 찾기 matches plain words only.
- 오늘 할 것 marks a routine or task for today only. Past days are corrected in 루틴 and 할 일 as before.
- 관심 활동 shows saved programmes and places. A plan to attend is a calendar entry the person writes.
- No real Safari, iPhone or Android device testing was done in this pass (Chromium only).
