# ONGIL Product Completion & Release Audit V1

Branch `ongil-foundation-v1`, on top of `0af49b53d`. No new feature was added. The audit looked for what would fail a
real person using ONGIL as it is, fixed every CRITICAL and HIGH defect, fixed the MEDIUM defects that were small and
safe, and wrote down the rest.

## 1. Scope

- All of `ongil-start/` (index.html, 71 JS modules, 6 stylesheets): Home, 내 생활, 건강·안부, 가족, 돌봄·서비스, 즐길거리,
  커뮤니티, 스토어, 검색, 알림, 저장, 내 정보, ONGIL 도우미, 처음 설정, 운영 보기.
- Three passes over the source: security / privacy / truthful copy; state and data integrity (every store executed in
  Node against the real modules, including refused writes, damaged data and 5,000 records); CTA / navigation /
  accessibility (headless Chromium at 320 and 390 with touch).
- A browser run of the fixed build at 320, 375, 390, 430, 768, 1024 and 1440 (section 6).
- Not in scope: provider adapters, `vercel.json`, LIVON, the shared site chrome files (`gnav-mega.css`,
  `site-chrome.js`), any deployment.

## 2. Baseline

| | Before | After |
|---|---|---|
| ONGIL tests | 725 pass | 743 pass (+18 in `tests/ongil/product-completion.test.mjs`) |
| LIVON / backend tests | 493 pass, 1 skipped (PostgreSQL suite, `LIVON_TEST_PG` not set) | same |
| Fail | 0 | 0 |

How ONGIL actually works (the code is the source of truth):

- Everything personal is stored in this browser only (`localStorage`, keys `ongil.v1.<collection>`). There is no ONGIL
  server, no account sync in use, no family connection, no shared community, no checkout.
- Public information (강좌, 장소, 관광지, 기관) comes from `GET <api>/api/livon/data`, only after the person presses a
  button. 스토어 has no product source connected: it never shows a product.
- ONGIL 도우미 is a fixed matcher over 22 tools. No model is connected. It writes only a calendar event or a task,
  after 확인.
- The page is one document with hash routes and `<meta name="robots" content="noindex, nofollow">`.

Differences from the product description given for this audit: 스토어 has no products to discover yet; 커뮤니티 keeps
the person's own drafts on the device only (no comments, replies, reactions, profiles or reports exist); 알림 has
preferences and a list but nothing creates a notification yet; 돌봄 "서비스/혜택" sources are not connected (기관 찾기 is).

## 3. Defects found

Severity: CRITICAL = the person's data is lost or overwritten, or a core screen cannot be used. HIGH = a core action
is broken or says something false about safety, health or what was saved. MEDIUM = a partial or misleading state.
LOW = wording, small targets, polish.

| | Found | Fixed | Remaining |
|---|---|---|---|
| CRITICAL | 1 | 1 | 0 |
| HIGH | 8 | 8 | 0 |
| MEDIUM | 14 | 13 | 1 |
| LOW | 23 | 7 | 16 |

### CRITICAL

**C1. Finishing a resumed 처음 설정 blanked the profile saved in 내 정보.**
Cause: `onboarding.start()` resumed the old draft as it was, and `complete()` wrote the draft — empty answers
included — over the profile. Path: open 처음 설정 once and press 나중에 하기 → fill 내 정보 → "처음 설정 이어서 하기" →
다음 to the end. Region, age range, interests and needs were erased; region is the default for every nearby search.
Fix: on resume, an answer the draft does not have comes from the profile, and when the profile was saved after the
draft the profile wins. An answer cleared inside the dialog is still applied. Tests PC-01, PC-02.

### HIGH

**H1. Going through 처음 설정 again reset the notification choices made in 내 정보.** The old preset was re-applied
even when that step was not touched. Fix: the preset is written only when the answer differs from the one last
applied (`appliedNotifications`). PC-03.

**H2. Home showed the text "nullnull" in the 가족 card for every new user.** The native `Node.append` received two
optional children as `null`. Fix: the null-safe `append` from `dom.js` (also for the 내 주변 result). A scan in PC-07
fails on any native `append` with an optional argument.

**H3. Tapping the label of a checklist row in 내 생활 changed the record but not the screen.** Home and 내 생활 are
both in the page and gave the same record the same checkbox id, so `label[for]` reached the hidden Home box. Fix: the
id is unique per card. PC-08.

**H4. The mobile menu had no close control.** The sheet covers the button that opened it; at 368 px and below (or with
larger text) it covers the backdrop too, and a phone has no Escape key. Fix: a visible "메뉴 닫기" button (44 px) at the
top of the sheet, in ONGIL's own page — the shared chrome already binds `data-gnav-close`. PC-16.

**H5. Medication marks stopped saving for good once the log passed 400,000 characters** (about 11 months with 12
entries; 3 months with 50). Fix: when the log does not fit, the oldest days are dropped, never the newest 31; a refused
write now returns `STORAGE_UNAVAILABLE`. PC-05.

**H6. Journal entries beyond the newest 20 could not be seen, edited or deleted**, and a back-dated entry vanished on
save. Fix: the list shows every entry, paged 50 at a time with 더 보기. PC-06.

**H7. Success was announced when the write had failed**: every checkbox list ("…먹은 약으로 표시했습니다"), 오늘 안부
지우기, 상태/증상 기록 지우기, 저장 취소, 글 지우기. Fix: each of them reads the store's result and says the storage
sentence instead. PC-09.

**H8. 건강·안부 listed working features under "준비 중인 기능 — 아래 항목은 아직 사용할 수 없습니다"** (긴급 연락망,
복약, 병원 일정 …) and said "이 화면에 따로 저장된 기록은 없습니다" on the screen that stores 긴급 연락망. Fix: two
lists — "지금 쓸 수 있는 기능" and "준비 중인 기능" — and a status line that matches. PC-10.

### MEDIUM — fixed

| Id | Defect | Fix | Test |
|---|---|---|---|
| M1 | The erase confirmation did not name 긴급 연락망, 건강 수치, 병원 일정/건강검진, 알림 | Named; focus stays on the screen after erase | PC-11 |
| M2 | "가족 공유 약속" stated planned behaviour as if it happened today | Planned parts are written as plans | PC-17 |
| M3 | 처음 설정 promised "ONGIL을 나에게 맞게 준비합니다"; only region and the notification choice are used | Copy says what is used | PC-17 |
| M4 | 도우미 gave a generic refusal to "살려줘", "쓰러졌어", "112…", and no 119 line for "가슴이 아파" | Those get the fixed "급하다고 느끼면 119에 직접 전화해 주세요" line; still no judgement | PC-15 |
| M5 | A preview button was labelled "가족에게 보내기" (돌봄, 즐길거리) | "가족에게 보여주기", as 스토어 already said | PC-17 |
| M6 | 즐길거리 "저장한 즐길거리" card stayed empty after saving | The card redraws on save | PC-18 |
| M7 | 즐길거리 "강좌 이름에 들어갈 말" never hid (`display:grid` beat `[hidden]`) | `.og-field[hidden]` | PC-16 |
| M8 | Browser Back left a modal dialog open over another screen | A screen change closes open dialogs | PC-16 |
| M9 | The page behind a modal dialog scrolled | Scroll lock while a dialog is open | PC-16 |
| M10 | The mobile menu did not show the current screen | Bold + ✓ on the current link; link text 16 px | PC-16 |
| M11 | Changing a routine's days or pausing it removed past marked days from the week count | A marked day keeps its routine | PC-14 |
| M12 | Reopening a completed 처음 설정 and leaving turned it into "마치지 않았습니다" | Stays completed | PC-04 |
| M13 | A contact added as 주 연락처 was placed last | Placed first | PC-12 |

### MEDIUM — remaining

- **M14. Leaving a screen in the middle of a form discards what was typed** (커뮤니티 글쓰기, 내 생활 forms), with no
  warning. Not fixed here: keeping drafts across screen changes touches every list form and the community composer.
  Nothing already saved is lost.

### LOW — fixed

Spaces-only check-in memo failed to clear (PC-13) · 운영 보기 said health is not counted while showing a count ·
운영 보기 listed 병원·검진 as "아직 만들지 않음" · 도우미 treated "약속" as a medicine word (PC-15) · list-form errors
were not tied to their field (`aria-describedby`) · focus was lost after 모두 지우기 · mobile menu links were 15 px.

### LOW — remaining

1. The 400,000-character cap per collection is reached before some stated limits (생활비 about 1,530 of 2,000 with long
   memos; 건강 수치 1,311 of 1,500). The write is refused with the storage sentence, not the "가득 찼습니다" one.
2. 처음 설정 does not say anything when the browser refuses to store an answer.
3. A refused write on the 운동 form shows the minutes error.
4. "가족과 나눕니다" / "이웃과 나누는 곳입니다" in area descriptions read as present tense; the notice beside them says
   준비 중.
5. The 스토어 hero says "만나보세요" while no product source is connected (the screen itself says so).
6. 도우미 says "긴급 연락망을 열어 드릴게요" and offers a link rather than opening it.
7. Where family connection will appear is described three ways (내 정보 / 가족 화면).
8. `window.Ongil` exposes the stores to same-origin scripts (no new exposure beyond `localStorage`).
9. Fonts (Google Fonts) and hero films (a CDN) are third-party requests from a "this device only" app.
10. A deep link to a 내 생활 section selects the tab but does not scroll to it.
11. A search result that points at the current screen closes the panel and drops focus.
12. 저장 취소 on the 저장 screen removes in one tap, without the confirm step other deletes have.
13. 저장 list headings go h1 → h3.
14. The film pause button uses both a changing label and `aria-pressed`.
15. "알림 설정 바꾸기" lands at the top of 내 정보, not at the 알림 card.
16. Brand link 40×40 px, language button text 13 px, decorative English labels 14.4 px (shared chrome and labels).

## 4. Areas checked and found clean

- No `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`. No `console.*`.
  No key or token in the source.
- Every link goes through `safeHref`; external links are https with `target="_blank" rel="noopener noreferrer"`;
  routes are recomputed (`safeRoute`, `ownerRoute`) — no open redirect. `tel:` is built in one place from checked
  digits, after a confirmation dialog.
- One network path (GET, `credentials: 'omit'`); the query carries a region, a fixed kind or the person's search word.
- Private records (health, check-in, medication, journal, expenses, emergency contacts, family settings) are not in
  global search, Saved, notifications or the assistant's handles; 운영 보기 reads counts only.
- Nothing claims a call was made or connected, that 119/112 was contacted, that family received anything, that a
  check-in means safe or healthy, that the helper is an AI model, or that checkout exists. No normal/abnormal
  judgement is applied to a record.
- Every store: add / edit / delete / reload, unique ids, refused writes, 18 kinds of damaged data across all
  collections (0 throws, no prototype pollution), 5,000 records, dates across 15 time zones, calendar ↔ 병원 일정/건강검진
  as one store, erase removes every `ongil.v1.*` key and nothing else.
- Routes: every `#…` in the page and the code resolves; unknown or malformed addresses are corrected; refresh keeps
  the screen; desktop and mobile menus have the same ten destinations; `aria-current` on one link each.
- Focus rings, `prefers-reduced-motion`, labels on every field, `maxlength` equal to the stored limit, deletes ask
  first, double submit creates one record, state is never shown by colour alone.

## 5. Public data

| | State | In this audit |
|---|---|---|
| TourAPI (`kr-tourapi`) | live verified in production on 2026-10-04 (HTTP 200, 20 rows) | adapter untouched |
| Kakao (`kr-kakao-place`) | production 502 `UPSTREAM_ERROR` — deferred, Vercel logs required | adapter untouched, not called again |
| Lifelong (`kr-lifelong-class`) | production 502 `UPSTREAM_ERROR` — deferred, Vercel logs required | adapter untouched, not called again |
| CORS | production verified after the `trailingSlash` fix | unchanged |
| Latest ONGIL frontend | not deployed yet: `main` and `gh-pages` hold only `ongil-start/index.html` | not deployed |

With the API answering 404 or a provider failing, 돌봄·서비스 and 즐길거리 show their "연결되지 않았어요 / 지금 불러올 수
없어요" states as text; no screen is blank and none prints a code (checked in the browser run with the API mocked as
404).

## 6. Browser run of the fixed build

Headless Chromium, 320 / 375 / 390 / 430 (touch) / 768 / 1024 / 1440, API mocked as 404, long Korean text seeded.
30 screens per viewport plus the onboarding dialog and the assistant panel.

| Check | Result |
|---|---|
| Console errors / page errors | 0 / 0 at every viewport |
| Horizontal overflow, controls under 44 px, printed `null` / `undefined` / `NaN`, `[hidden]` elements still drawn | 0 at every viewport |
| Home 가족 card (new user) | "아직 연결된 가족이 없어요. 가족 연결은 준비 중입니다. …" — no "null" |
| Duplicate ids in the page | 0 |
| Tap on a checklist label in 내 생활 | the visible box is ticked, the row's own card announces it |
| Journal with 25 entries | 25 rows, no "최근 20개만" |
| 건강·안부 | 8 chips under "지금 쓸 수 있는 기능", 1 under "준비 중인 기능" |
| Checkbox with storage refusing writes | "이 기기에 저장하지 못했어요. …" |
| Mobile menu (320 – 430) | 메뉴 닫기 99×44 px, reachable, closes the sheet; current link bold with ✓; links 16 px |
| Onboarding dialog | page scroll locked while open; closed after a screen change |
| Resume onboarding after filling 내 정보 | region, age range and interests kept |

## 7. Manual QA still required

- A real iPhone (Safari) and a real Android phone: touch, the on-screen keyboard over forms, safe areas, `tel:`.
- A real screen reader (VoiceOver, TalkBack): not run. Announcements were checked from the DOM only.
- Contrast of text over the hero films.
- Production with live providers once Kakao and Lifelong answer.
- 스토어 with products: no source exists, so product screens were not exercised.

## 8. Readiness

- CODE READY: CRITICAL 0, HIGH 0, tests 743 / 743 (ONGIL) and 493 pass + 1 skipped (LIVON, backend), 0 failures.
- PRODUCTION READY: no. Blockers: Kakao 502 and Lifelong 502 (cause unknown until the Vercel logs are read); this
  branch is not merged or deployed; no real-device or screen-reader QA has been done.
- Cache: the `?v=` values in `index.html` were not changed. No build of this branch has been published, so no browser
  holds an older copy of these files.
