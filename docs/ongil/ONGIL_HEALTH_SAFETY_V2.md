# ONGIL Health · Safety V2

Status: **LOCAL (this device)**. Health data stays in the browser storage of the person's own device.

```
REMOTE HEALTH = NOT IMPLEMENTED   (no health server, no sync, no backup, no remote sharing of health records)
FAMILY SHARING DEFAULT = OFF      (Family V1 permission engine; health-related categories need consent per member)
AI ACCESS TO HEALTH = NONE        (the assistant is given no health store)
CONNECTED DEVICES = NONE          (no wearable, sensor, camera or microphone)
```

## 1. PRODUCT PRINCIPLES

ONGIL is a Senior Life OS: the person records their own day and health, asks for help when they choose, and shares only what
they choose. Senior first, independence first, privacy by default, local-first, family sharing off by default, explicit and
granular consent, no surveillance, no false safety claims, no medical diagnosis, no fake data, no fake remote success, the
existing ONGIL design, existing parts reused.

## 2. AUDIT

Existing implementation (before V2) and what V2 did with it:

| Area | Where | V2 |
|---|---|---|
| 건강·안부 screen | `areas.js` shell + `views.js renderArea` + extras slot | KEEP shell · COMPLETE: 건강·안부 홈 added on top (`health-safety-view.js`) |
| 오늘의 안부 (check-in) | `checkin.js` (Home + 내 생활 › 건강, one record per day) | KEEP store · IMPROVE: quick check-in + delete with confirmation on 건강·안부 |
| 몸 상태·증상·건강 메모 | `checkin.js`, `symptoms.js`, `health-notes.js`, `life-health.js` | KEEP |
| 건강 수치 | `health-measures.js`, `life-contracts.js` | IMPROVE: + 체온, 산소포화도 (same validation, nothing judged) |
| 복약 | `medication.js`, `life-health.js`, Home 복약 card | COMPLETE: + 건너뜀 mark, + optional 시작일 · 종료일 |
| 병원 일정 · 건강검진 | `health-appointments.js` on the one calendar store | KEEP · summary of the next dates on the home |
| 최근 건강 기록 | `life-health.js describeHealthDay` | KEEP · reused on the home (+ 건너뜀 count) |
| 생활 변화 | — | NEW: `health-changes.js` (deterministic, explained by numbers) |
| 도움 요청 | area slot "준비 중"; Family V1 local help requests | COMPLETE: help card offering only what exists (family, 돌봄·서비스, emergency card) |
| 긴급 연락망 · 119/112 | `emergency-contacts.js` (confirmed tel: links) | KEEP · linked from the help card |
| 가족 공유 | Family V1 (`family-*`), Family V2 (account, CODE READY) | KEEP · status card reads the V1 engine; no new consent system |
| ONGIL AI | `assistant-*` | KEEP (no health access) |
| Search · Saved · Notifications | `search.js`, `saved.js`, `notifications.js` | KEEP (health never indexed; no OS/push notification) |
| Removed | — | nothing |

Shared ONGIL changes outside health: `home-today.js` (Home's 복약 row also says 건너뜀으로 표시했어요) and `home-list.js` — a row in a list without 고치기/지우기 can now carry its own buttons
(`rowActions`), used for 건너뜀. Minimal, documented in the file.

## 3. SENIOR FIRST

Large existing controls (44px), choice buttons with a tick and pressed state (not colour only), every field labelled,
confirmations before delete with Escape and focus return, status lines announced politely, nothing is required: a person can
choose only 기분 and nothing else. Verified at 320 / 390 / 768 / 1024 / 1440 px and at 200% text size (browser tests
OHS2-46 … 52).

## 4. LOCAL-FIRST

Every health record is in the existing local collections (`checkins`, `medications`, `medicationLogs`, `symptoms`,
`healthNotes`, `healthMeasures`, `events`). V2 adds no collection and no second copy: 건강·안부 홈 and 내 생활 › 건강 read
the same store instances. There is no health server, no sync and no cloud backup, and the screen never claims one.

## 5. PRIVACY DEFAULTS

Health collections are classified `HEALTH_ADJACENT`: never synced, never in the global search, never shared with family
except through the Family V1 categories the person turns on (summaries only, consent required). The health modules make no
network request, write no log and report nothing to analytics.

## 6. DATA OWNERSHIP

The person can read, change and delete each record where it is written (내 생활 › 건강, 건강·안부). Erasing everything uses the
existing 내 정보 › 이 기기의 ONGIL 데이터 지우기. ONGIL has no export tool yet, and V2 did not add one (no new export system). Deleting a record removes it from storage, from 최근 건강 기록, from
the counts and from 생활 변화 at the next draw (OHS2-11). Nothing claims a remote deletion, because nothing is remote.

## 7. CHECK-IN IS NOT SAFETY

A check-in is the person's note (`CHECKIN_DELIVERY.confirmsSafety === false`). Choosing "도움이 필요해요" alerts nobody, and
the screen says so. No copy says 안전합니다, 이상 없음, 정상, 보호자가 확인 or similar (OHS2-10, OHS2-44).

## 8. MEDICAL BOUNDARY

Numbers are kept as written: no normal range, no high/low word, no colour, no diagnosis. Validation only rejects input that
cannot be a reading (empty, NaN, Infinity, negative, exponent, out of a plausible input range, wrong decimals, future day,
invalid date). The only guidance: talk to a medical professional if worried or if something different keeps going on.

## 9. MEDICATION BOUNDARY

The plan is the person's own list (name, time, days, optional period, memo). 먹었어요 and 건너뜀 are only the person's own
marks — a time shown on screen, a family summary or anything else never marks a dose. No prescription, recommendation, dose,
change, stop advice or interaction check; questions go to a doctor or pharmacist; emergencies to 119.

## 10. EMERGENCY BOUNDARY

ONGIL is not an emergency service. The help card points to the existing 긴급 연락망 card, where 119 / 112 and saved
contacts open the phone app only after the person confirms; ONGIL never calls, reports, alerts family or sends a location,
and says it cannot know whether a call connected.

## 11. DAILY LIFE CHANGES

`health-changes.js` compares the last 7 days with the 7 days before, from the person's own records: 안부 기록 days, average
written sleep time, average written meals, days with exercise, and medication marks (taken / skipped / planned). Each line
shows its numbers. A day-count metric is compared only when the earlier week has records and both weeks together have at
least 3; an average needs at least 3 days with a value in each week; otherwise it says "아직 비교할 기록이 충분하지 않아요".
Words used: 늘었어요 / 줄었어요 / 비슷해요. No AI, no score, no risk, no illness name.

## 12. FAMILY SHARING AND CONSENT

Reused, not rebuilt: the Family V1 permission engine (`family-permissions.js`). WHO = one connected member; WHAT = a
category (안부, 복약, 병원·검진 일정, 건강 기록, 도움 요청 …); SCOPE = 요약만 / 자세히 as the category allows; WHEN = from the
moment it is saved; STATUS = 공유 안 함 by default, consent GRANTED / WITHDRAWN for sensitive categories. Turning a category off
withdraws its consent and stops anything new from being shown. Health values, symptoms and health notes are never categories.
The 가족 공유 card on the home shows the current state per member and links to the 가족 screen to change it. Family V2
(cross-device, CODE READY) is unchanged; nothing on this screen claims that anything was sent to another device.

## 13. NO SURVEILLANCE

No precise location, no camera, no microphone, no activity tracking, no "last seen". Family members see only what the person
explicitly allowed, as short summaries. Any future location, camera or microphone feature would need its own explicit consent
and its own design review; none is built.

## 14. AI BOUNDARY

The assistant receives no health store (`createAssistant({ schedule, tasks, routines, saved, search, familyConnection })`)
and its no-write list includes every health collection. The health modules never call it. Health-event titles on the shared
calendar are shown to it only by kind (병원 일정 / 건강검진), as before.

## 15. COMMUNITY BOUNDARY

Health never creates or fills a community post; community modules import nothing from health (OHS2-32). ONGIL Community V2
is unchanged.

## 16. FUTURE IOT BOUNDARY

The home says "연결된 기기 없음". A future ONGIL Home / wearable connection should prefer privacy-preserving sensors
(door, motion counts, wearable step/heart summaries chosen by the person) over cameras; readings must be labelled as device
readings, never mixed with what the person typed, stay local by default, and be shared only through the same consent model.

## 17. NOTIFICATIONS

There is no OS or push notification for medication or appointments. Times are shown in the app only, and the screen says
휴대폰 알림은 설정하지 않아요. In-app reminders, OS notifications and push are distinct; only the first (on-screen text) exists.

## 18. TESTS

`tests/ongil/health-safety-v2.test.mjs` — OHS2-01 … OHS2-56: medication skipped/period semantics, measures and validation,
check-in CRUD and honesty, delete integrity, medical and booking boundaries, deterministic changes, help and emergency
honesty, family default-off / granular / consent / revoke / privacy, no location-camera-microphone, IoT empty state,
local-first, search privacy, My Life / Community / AI / LIVON boundaries, Family V1 / V2 and Community V2 preservation,
cache versions, corrupt storage, and browser checks (5 widths, keyboard, focus, 200% text, reload, no outside request).

## 19. KNOWN LIMITATIONS

- Health data lives in one browser on one device; clearing browser data removes it, and there is no export tool yet.
- 생활 변화 uses fixed 7-day windows and simple thresholds; it does not account for days the app was not opened.
- 건너뜀 is set on 건강·안부 or 내 생활 › 건강; Home's 복약 card shows it but only offers the 먹었어요 check.
- Family help requests are local to this device (Family V1); cross-device delivery needs Family V2 activation.
- No real Safari / iPhone / Android device testing was done in this pass (Chromium only).
- Cache (production integration): GitHub Pages serves every file with max-age 600 and ignores the query string. The entry
  `app.js?v=` moved on (v13 → 20261005h14) so a new page never runs a cached old entry (that combination booted but showed
  the old screen for up to 10 minutes). The reverse — a cached old page with a fresh entry — still boots and shows the
  home; a 건너뜀 press there fails with "저장하지 못했어요" (nothing saved) until the page refreshes. Tested in Chromium with
  both mixed trees; no startup failure in either.
