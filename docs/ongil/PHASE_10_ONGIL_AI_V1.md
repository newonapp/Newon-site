# ONGIL PHASE 10 — ONGIL AI V1

Branch `ongil-foundation-v1` · base `0a79f168c` (ONGIL Admin and Analytics V1) · not committed (git add / commit / push not run).

AI MODEL = NOT CONNECTED. This phase builds the product layer an assistant needs — intents, a tool registry,
permissions, confirmation, fallback — and nothing that talks to a model.

## 1. OBJECTIVE

"ONGIL 도우미": one place where a person types what they want in ONGIL and gets taken there, shown what is already
recorded, or helped to prepare a change that they then confirm. It is an ACTION / ORCHESTRATION layer over the
features built in Phases 1–9, not a chat.

Not in this phase: a backend, a server route, an API key, a model call, Firebase, Newon+, a redesign.

## 2. POSITIONING

| It is | It is not |
|---|---|
| a header panel, next to 통합검색 and 알림, on every screen and on a phone | a new area in the menu, a page of its own, or a section on Home |
| a matcher over a fixed list of requests ONGIL can already serve | a conversation, a general question-answerer |
| a way to read today's plan, saved items and loaded public information | a way to read health records, the journal, expenses or family settings |
| a way to PREPARE a calendar entry or a task and save it after 확인 | something that changes anything by itself |

Audit before the phase:

| Area | State | Finding |
|---|---|---|
| ONGIL AI | MISSING | `areas.js` reserved a disabled global entry (`assistant`, "ONGIL AI"); no UI, no logic |
| Chat / model server | BACKEND_REQUIRED | LIVON has `server/livon/chat.mjs` (a server-side model call with rate limits, free-text answers, no tool registry). Read for reference only; not copied, not called |
| Search | EXISTS | registry with PUBLIC providers; `query()` ran all of them — a caller could not ask one |
| Calendar / tasks / routines / saved | EXISTS | stores with `listForDate`, `dueOn`, `add`, `list` — reused as they are |
| Check-in, medication, symptoms, health notes, journal, expenses, family, community | EXISTS | personal stores; deliberately not handed to the assistant |
| Routes | EXISTS | `routes.js` `safeRoute` / `canonicalHash` — reused; no second route table |
| Analytics | EXISTS | allowlisted events; no assistant events |
| Confirmation pattern | PARTIAL | screens confirm deletions inline; no shared "prepare → confirm" for additions |
| Natural-language date parsing | MISSING | `dates.js` has day keys and stepping, nothing that reads "내일 오후 2시" |

## 3. CURRENT MODE

`MODEL = { connected: false, provider: null, freeChat: false, medicalAdvice: false }` (assistant-intents.js).

On screen: "ONGIL에서 할 일을 찾아드려요. 정해진 요청만 알아듣고, 자유로운 대화는 아직 하지 않아요."
The panel never says "무엇이든 물어보세요" or "AI가 답변합니다", shows no typing indicator, and uses no technical word.
The operations view (`#admin`) shows "언어 모델 연결 없음 (NOT CONNECTED)".

## 4. ARCHITECTURE

```
today                                         later (production backend)
USER INPUT                                    USER INPUT
  ↓                                             ↓
LOCAL INTENT MATCHER  assistant-intents.js    SERVER MODEL (proposes a tool + arguments)
  ↓                                             ↓
TOOL REGISTRY         assistant-tools.js      SAME TOOL REGISTRY
  ↓  schema · privacy · mode                    ↓  PERMISSION LAYER (the same checks)
READ / NAVIGATE / PREPARE                     READ / NAVIGATE / PREPARE
  ↓  확인 (only for a change)                   ↓  확인
EXECUTE (WRITE)                               EXECUTE
  ↓                                             ↓
RESULT                assistant-view.js       RESULT
```

| File | Role |
|---|---|
| `assistant-intents.js` | `matchIntent(text, { today })` → `{ intent, args, reason }`; `parseDate`, `parseTime`. Pure |
| `assistant-tools.js` | tool definitions, `validateArgs`, `cleanResult`, `createAssistant` (handle / confirm / cancel / pending) |
| `assistant-view.js` | the panel: request box, examples, results, 확인 / 취소 |
| `app.js` | creates the assistant with six handles; routes navigation through `safeRoute`; counts kinds of events |
| `search.js` | `query(input, { only })` — ask a subset of the PUBLIC providers |

## 5. INTENTS

| Intent | Example | Served by |
|---|---|---|
| `VIEW_TODAY` | 오늘 | `get_today_overview` |
| `VIEW_SCHEDULE` | 오늘 일정 알려줘 · 내일 일정 | `get_today_schedule` |
| `VIEW_TASKS` | 오늘 해야 할 일 뭐 있어? | `get_today_tasks` |
| `VIEW_ROUTINES` | 루틴 보여줘 | `get_today_routines` |
| `VIEW_SAVED` | 내가 저장한 프로그램 보여줘 | `get_saved_items` |
| `SEARCH_CARE` | 병원 동행 서비스 찾아줘 | `search_care` |
| `SEARCH_ENJOY` | 근처에서 배울 만한 거 찾아줘 | `search_enjoy` |
| `SEARCH_STORE` | 지팡이 상품 찾아줘 | `search_store` |
| `ADD_CALENDAR` | 내일 오후 2시에 병원 일정 추가해줘 | `prepare_calendar_event` → `create_calendar_event` |
| `ADD_TASK` | 내일 장보기 할 일 추가해줘 | `prepare_task` → `create_task` |
| `OPEN_HOME` `OPEN_LIFE` `OPEN_HEALTH` `OPEN_FAMILY` `OPEN_CARE` `OPEN_ENJOY` `OPEN_COMMUNITY` `OPEN_STORE` `OPEN_SAVED` | 건강 화면 열어줘 | `open_home` … `open_saved` |
| `PREPARE_FAMILY_SHARE` | 엄마한테 이 프로그램 보여주고 싶어 | `prepare_family_share` |
| `HEALTH_SAFETY` | 머리가 아파 · 이 약 먹어도 돼? | a fixed sentence (no tool) |
| `NOT_AVAILABLE` | 결제해줘 · 예약해줘 · 문자 보내줘 · 일정 지워줘 | a fixed sentence (no tool) |
| `HELP` | 뭘 할 수 있어? | the list of examples |
| `UNSUPPORTED` | 오늘 날씨 어때 | "지금은 이 요청을 바로 처리할 수 없어요." + the examples |

## 6. MATCHER

Deterministic: ordered rules over the cleaned text, no randomness, no learning, no network.

1. An emergency word → `HEALTH_SAFETY` (told to call 119 themselves).
2. Changing or deleting something already recorded → `NOT_AVAILABLE` (done on its own screen).
3. A family member as recipient + show / share / send → `PREPARE_FAMILY_SHARE`.
4. A health judgement (약 추천, 먹어도 돼, 아파 …) → `HEALTH_SAFETY`. A request about a check-in, medication, symptom,
   health note, journal or expense → the screen is OFFERED (`OPEN_HEALTH` / `OPEN_LIFE` with reason
   `SENSITIVE_RECORD`).
5. Payment, message, call, booking → `NOT_AVAILABLE`.
6. Add + 할 일 → `ADD_TASK`; add + 일정 / 약속 → `ADD_CALENDAR`; add + 글 / 모임 → the community screen is offered.
7. 저장 → `VIEW_SAVED`; 루틴 / 할 일 / 일정 → the day's read; "오늘" → `VIEW_TODAY`.
8. Store, care and enjoy words → the three searches (with a category when one is named).
9. A screen name → `OPEN_*`. 10. Help words → `HELP`. Otherwise `UNSUPPORTED`.

Input: at most 120 characters; longer text, empty text and text with `<` or `>` are refused without matching.
A request that is understood but incomplete is asked again with a reason from a closed list
(`DATE_MISSING`, `DATE_UNCLEAR`, `DATE_INVALID`, `TIME_UNCLEAR`, `TITLE_MISSING`) — never completed by guessing.

## 7. TOOL REGISTRY

One `Map` inside `assistant-tools.js`. A tool that is not in it cannot run; there is no path from a request to a
store method, a property name or a function.

| Tool | Mode | Privacy | Confirmation |
|---|---|---|---|
| `get_today_schedule` · `get_today_tasks` · `get_today_routines` · `get_today_overview` | READ | STANDARD_LOCAL | no |
| `get_saved_items` | READ | PUBLIC | no |
| `search_care` · `search_enjoy` · `search_store` | READ | PUBLIC | no |
| `open_home` · `open_care` · `open_enjoy` · `open_store` · `open_saved` | NAVIGATE | PUBLIC | no |
| `open_life` | NAVIGATE | STANDARD_LOCAL | no |
| `open_health` | NAVIGATE | HEALTH_ADJACENT | no |
| `open_family` · `open_community` | NAVIGATE | PRIVATE | no |
| `prepare_calendar_event` · `prepare_task` | PREPARE | STANDARD_LOCAL | no (saves nothing) |
| `prepare_family_share` | PREPARE | PRIVATE | no (sends nothing) |
| `create_calendar_event` · `create_task` | WRITE | STANDARD_LOCAL | **yes** |

22 tools. Public surface of the registry: `ids`, `has`, `get`, `list` (descriptions only) and `run` — which refuses
WRITE tools. The confirmed path exists only inside `createAssistant().confirm()`.

## 8. TOOL CONTRACT

`{ id, description, mode, privacy, requiresConfirmation, schema, execute }`

- `mode`: READ · NAVIGATE · PREPARE · WRITE. `requiresConfirmation` is true exactly for WRITE.
- `privacy`: PUBLIC · STANDARD_LOCAL · PRIVATE · HEALTH_ADJACENT — what the tool touches or opens. No READ or WRITE
  tool is PRIVATE or HEALTH_ADJACENT.
- `schema`: field → `text` (max length, no markup or script address) · `date` (a real calendar day) · `time`
  (HH:MM) · `enum`. `validateArgs` rejects unknown fields (`UNKNOWN_FIELD`) and wrong values (`INVALID_ARGS`), and
  returns exactly the schema's fields.
- `execute(args)` gets validated arguments only; whatever it returns is rebuilt by `cleanResult`.

## 9. READ TOOLS

- Today: `schedule.listForDate`, `tasks.dueOn`, `routines.listForDate` — the stores' own methods, no second copy
  of the logic. A date may be given (오늘 / 내일 / a date); empty says "오늘 등록된 일정이 없어요."
- Saved: saved PUBLIC items only (`savedSyncPolicy === 'SYNCABLE'` and a public content type). A saved community
  post is never listed, and `POST` is not an accepted argument. A future private saved type is excluded by default.
- Search: `search.query(word, { only: [provider] })` over what the 돌봄·서비스 / 즐길거리 / 스토어 screen loaded
  during this visit. No source is asked from the panel. Nothing found: "현재 불러온 정보에서는 찾지 못했어요." with a
  link to the screen. No word given: the screen (and category) is offered. A failing provider:
  "지금은 … 정보를 불러오지 못했어요." Nothing is recommended, ranked or invented.
- At most 8 rows per result; the rest is counted ("이 밖에 N개가 더 있어요.").

## 10. NAVIGATION TOOLS

Nine tools, one per screen in `VIEWS` except 내 정보 (and never the operations view). The address is
`safeRoute(hashFor(view))` or a section from a fixed table (`life`: calendar, tasks, routines, journal, expenses;
`health`: checkin, medication, symptoms, health-notes; `community`: write, groups), checked again by `routes.js`.
A plain "○○ 열어줘" opens the screen; a request about a sensitive record only OFFERS the screen, with the reason.
`app.js` checks the route once more (`safeRoute`) before setting the address.

## 11. WRITE TOOLS

Exactly two: `create_calendar_event` (through `schedule.add`) and `create_task` (through `tasks.add`). They are the
only writing calls in the tool layer (tested by scanning the source).

There is no tool — WRITE or otherwise — for: check-in, medication, symptoms, health notes, family sharing or
consent, help requests, expenses, the journal, community posts, groups, meetups, routines, the profile
(`NO_WRITE_AREAS`). Editing or deleting anything is also absent.

## 12. CONFIRMATION

`PREPARE → PREVIEW → 확인 → EXECUTE`

- `prepare_*` validates the arguments, checks for the same entry already existing (said in the preview), and
  returns `NEEDS_CONFIRMATION` with a draft. Nothing is stored.
- PendingAction `{ id, toolId, payload, summary, createdAt }` lives in a variable. One at a time: a newer draft
  replaces the older one, which can then no longer be confirmed. Its id is a counter (`pa-1`), not random.
- 확인: the draft is taken out BEFORE it runs, so a double click, repeated Enter or replay finds nothing; the view
  also disables both buttons at the first press. The payload is validated again when it runs.
- 취소: the draft is dropped; storage is unchanged.
- A draft expires after 5 minutes. A reload starts with nothing waiting — an old draft can never run by itself.

## 13. DATE PARSING

Reuses `dates.js` (`dateKey`, `addDays`, `isDateKey`): local calendar days only, no UTC conversion.

| Understood | Example |
|---|---|
| 오늘 · 내일 · 모레 | 내일 병원 |
| YYYY-MM-DD | 2028-02-29 검진 |
| M월 D일 (this year, today or later) | 12월 31일 |
| 14:00 · 14시 · 오후 2시 · 오전 9시 30분 · 저녁 7시 반 | |

Not guessed (answered with a request to say it plainly): weekdays, 다음 주, 주말, 조만간, two different dates, a
month-day already past this year, "2시" without 오전/오후, 저녁쯤, 오후에, two times. An impossible date
(2026-02-30, 4월 31일) is `DATE_INVALID`. A calendar entry with no date is `DATE_MISSING` — it is not assumed to be
today. A task may have no date.

## 14. RESULT CONTRACT

`{ status, title, message, items[], route, routeLabel, more?, navigate?, pending? }`

- `status`: SUCCESS · EMPTY · UNAVAILABLE · ERROR · NEEDS_CONFIRMATION, shown in words (없음, 할 수 없음, 문제가 생김,
  확인 필요).
- `cleanResult` rebuilds every result: enum status, text bounded and stripped of control characters, at most 8
  items of `{ title, detail, route }`, routes through `safeRoute`. Unknown fields are dropped. A tool cannot attach
  a confirmation to its own result.
- A tool that throws, or answers something that is not a result, becomes ERROR with the fixed sentence
  "지금은 처리하지 못했어요. 잠시 뒤 다시 해 주세요." — never a message, a stack or a key.

## 15. HEALTH SAFETY

ONGIL 도우미 is not a medical assistant and contains no medical knowledge.

- A health judgement request gets one fixed sentence: "ONGIL은 건강 상태를 판단하거나 약을 권하지 않아요. 몸이 걱정되면
  의사나 약사와 상의해 주세요." and a link to 건강·안부.
- An emergency word gets: "ONGIL은 급한 상황인지 판단하거나 대신 신고하지 않아요. 급하다고 느끼면 119에 직접 전화해
  주세요." Whether it is an emergency is not decided.
- "안부 기록해줘": the check-in screen is offered. No value is chosen for the person; the matcher does not even
  contain the check-in values.
- Medication: no name, dose or log is read, so none can appear in an answer; "복약 기록 열기" is offered.
- Symptoms and health notes: the screen is offered.

## 16. FAMILY BOUNDARY

"가족에게 보여줘" → `prepare_family_share`: a preview only. It lists up to five saved PUBLIC items that could be
shown and states the real situation — "지금은 가족과 연결되어 있지 않아서 보낼 수 없어요." Health records and the journal
are said not to be included. There is no send, share, invite, message, consent or permission tool, and the tool
layer has no handle on family settings. If a connection existed one day, this layer would still send nothing.

## 17. PRIVACY

- Data access is an allowlist of six handles given in `app.js`: `schedule`, `tasks`, `routines`, `saved`, `search`,
  `familyConnection`. Not given: storage, profile, check-in, medication, symptoms, health notes, journal, expenses,
  family sharing, help requests, community stores, notifications, account.
- The three modules import only contracts, dates, routes, router, dom and each other (tested).
- Requests are never stored: no localStorage, sessionStorage, cookie or collection. The conversation is the last
  six requests in the panel's memory; a reload clears it. No new collection (still 24).
- No identifier of any kind; nothing is read from the browser about the device.

## 18. ANALYTICS

Four events, counted as daily totals like the Phase 9 events:

| Event | Properties | Counted when |
|---|---|---|
| `ai_open` | — | the panel is opened |
| `ai_intent_matched` | intent, result | a request was handled (`UNSUPPORTED` is an intent too) |
| `ai_action_confirmed` | tool, result | 확인 was pressed |
| `ai_action_cancelled` | tool | 취소 was pressed |

`intent` ∈ the 24 intent names, `tool` ∈ the two WRITE tools, `result` ∈ the five statuses. The typed text, a parsed
title, a date, a search word, a health or family word are never passed (the view hands over two enum values) and
could not be stored if they were (closed value sets).

## 19. ROUTE SAFETY

Every route in a result passes `safeRoute`: only `#view` or `#view/section` that exist. External addresses,
`javascript:`, `data:`, paths and unknown screens become empty and are not rendered as links. Request text never
becomes an address — routes come from `router.js`, `routes.js` and two category tables whose ids are validated
enums. `window.open`, `location.href` and new-window links are not used.

## 20. SECURITY

- innerHTML-family: 0. The panel is built with `el()` / `textContent`; typed markup stays text, and text with `<`
  or `>` is not matched at all.
- No `eval`, `Function`, dynamic import, script element or worker.
- Arguments are validated twice for a change (at prepare and at execute).
- No network code in the three modules; no key, token or header exists to leak.
- Model output is not a trusted instruction (section 26).

## 21. ACCESSIBILITY

- A labelled region with a labelled input; Enter sends. Examples, 확인, 취소 and 닫기 are buttons; results are lists
  with links.
- Opening focuses the request box; a result moves focus to its title (so the outcome is read and the next Tab is
  the first action); Escape or 닫기 closes and returns focus to the header button.
- A polite status line announces each result; states are words, not colour.
- Body text 16px or more, controls 44px or more (measured in the browser harness).
- No technical word (intent, tool, model) is shown.
- Actual screen reader: NOT VERIFIED.

## 22. RESPONSIVE

Checked at 390 / 820 / 1440 for: closed, open-empty, read (empty and results), search results, no result,
unsupported, write preview, cancel, confirm, family preview, provider error — horizontal overflow 0, no small text,
no small control.
On a phone the header now holds three 44px tools; under 430px the word "Ongil" beside the mark is hidden (the mark
and the link's name stay) so nothing overlaps. The panel is the same full-width sheet as 통합검색.

## 23. PERFORMANCE

- Matcher: 1,000 phrases in a few milliseconds in Node (the test allows 500 ms); a 100,000-character input is
  refused before matching.
- Tool lookup is a `Map` lookup.
- Opening the panel runs nothing and asks no source. A search asks one in-memory provider; no request is made
  (browser QA: 0 requests to the data API during the whole run).
- DOM bound: 6 requests, 8 rows each; the panel stayed under 90 nodes after 40 requests. No long task observed.

## 24. TESTS

`node --test tests/ongil/*.test.mjs` → **608 pass, 0 fail** (530 before + 78 new in `assistant.test.mjs`,
OG-AI-1 … 78 in the order of the brief).

Existing assertions changed (each has a comment in the test; none deleted or skipped):

| Test | Before | After | Why |
|---|---|---|---|
| shell OG-IA-3 | overlays search, notifications; `assistant` reserved and disabled; no assistant UI in the page | + `assistant` overlay, enabled; the page has the panel and its truthful sentence | the reserved entry became real |
| admin-analytics OG-AN-2 / 4 / 10 / 31 | 18 events, 7 properties, token ≤ 12 chars, < 120 counters | 22 events, 10 properties, token ≤ 24, < 160 counters | four `ai_*` events with enum properties |
| admin-analytics OG-AQ-13 / 16 / 20, cross-product, community-data, store-data | 65 modules, `admin-v1`, `?v=20261003a9`, 19 test files | 68 modules, `assistant-v1`, `?v=20261003b10`, 20 test files | three new modules, version moved on |

Browser QA (harness outside the repository; search fixtures registered in the page for the test only): open /
close / Escape / 닫기, the requests of the brief, unsupported, calendar and task prepare → cancel → confirm with
repeated clicks and Enter, duplicate notice, stale draft, unclear date and time, family preview, check-in and
medication requests (no health key written), a failing provider, long and markup input, 40 requests for the DOM
bound, storage inspection, navigation, reload, every screen, search, notifications, onboarding, admin — at
390 / 820 / 1440: console errors 0, page errors 0. The Phase 9, Phase 8, Store and Home harnesses were re-run.

## 25. KNOWN LIMITATIONS

- No language model: only the listed kinds of request are understood, by wording rules. A differently worded
  request may get "지금은 이 요청을 바로 처리할 수 없어요."
- Searches cover what was loaded on a screen during this visit; the assistant does not load from a source itself.
- Dates: 오늘 / 내일 / 모레, a full date, or a month-day later this year. Weekdays and "다음 주" are not understood.
- One draft at a time; no editing or deleting; no reminders.
- No family sending, no booking, no payment, no message, no call.
- Korean only.
- Real external APIs and an actual screen reader: NOT VERIFIED.

## 26. MODEL MIGRATION

When a model is connected (server side), it replaces `matchIntent` only.

- Model output is not a trusted instruction. The model may propose `{ tool, args }`; it cannot run anything.
- The permission layer stays in ONGIL's code and checks, for every proposal: the tool is in the registry; the
  arguments pass the schema; the privacy class is allowed for the request; a WRITE has a pending action that the
  person confirmed. A proposal that fails any check is dropped and answered with the fixed sentence.
- Text from tools that goes back to a model (titles of saved items, public descriptions) is data, never
  instructions: prompt injection through content must not be able to cause a tool call without the same checks.
- Tools keep returning the minimum (a day's titles, saved public items). HEALTH_ADJACENT and PRIVATE collections
  stay out of reach unless a later phase adds an explicit, per-use choice by the person.
- The model must not give medical advice; the fixed health sentences stay as the answer for those requests.
- `MODEL.connected` and the on-screen sentence change only when this is true end to end.

## 27. BACKEND REQUIREMENTS

- A server route for the model call: key on the server only, authentication, rate limits, timeouts, and a strict
  output schema (`tool` from the registry's ids, `args` as JSON). LIVON's `server/livon/chat.mjs` shows the
  rate-limit and timeout pattern; it has no tool layer.
- A decision, with consent, on what leaves the device: the request text would be sent — today nothing is.
- Server-side logging rules matching Phase 9: kinds and outcomes, not text.
- For family sharing, booking or payment tools: the corresponding backends first (Phases 4 and 7 list them).

## 28. PHASE 11 HANDOFF

Phase 11 is RELEASE HARDENING V1.

- Test baseline: 608 / 608. 68 modules, 24 collections, version `assistant-v1`.
- To verify by hand before release: an actual screen reader on the panel (focus moves and announcements), touch
  on a real phone at 360–390px (three header tools), and the real public-data APIs.
- The header now has three tools on a phone; the wordmark is hidden under 430px — confirm with design.
- Wording rules are the weakest part of a matcher: collect phrasing that fails ("지금은 이 요청을 …") from testers
  by observation, not by logging text.
- `docs/ongil/` holds one document per phase; a release checklist should be built from their KNOWN LIMITATIONS.
