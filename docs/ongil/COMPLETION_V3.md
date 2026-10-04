# ONGIL Completion V3 — 긴급 연락망 and production data verification

Branch `ongil-foundation-v1`, on top of `eac21b6d8` (Completion V2).

## 1. 긴급 연락망 (건강·안부)

**Audit.** Before this change there was no `EmergencyContact` model, store or screen. 건강·안부 had a `contacts` slot marked 준비 중, and the assistant answered call requests with "전화는 걸지 않아요." A new, single store was added; nothing was duplicated.

**Data**
- New module `emergency-contacts.js` holds the contract, the store and the screen.
- New collection `emergencyContacts`, privacy class `PRIVATE`. Contract class `EmergencyContact: PRIVATE`.
- Fields: `name` (≤30), `relation` (9 fixed options), `phone`, `memo` (≤100, optional), `order` (우선순위 1…n), `primary` (at most one).
- `phone` is stored as digits only:
  - accepted: 0 followed by 8–10 digits, or a 1xxx-xxxx number
  - `+82` is read as a leading 0
  - anything else is refused
- Up to 10 contacts.
- Damaged, duplicate, non-plain or prototype-polluted entries are skipped on read.

**Screen**
- Supports: add, edit, delete (asks first), 위로 / 아래로, and 주 연락처로 (the 주 연락처 moves to the top).
- Empty state: "등록된 긴급 연락처가 없습니다."
- No sample person or number exists anywhere.

**Calling**
1. The 전화하기 button on a row opens a confirmation `<dialog>`: "[이름]님에게 전화할까요?" with the number shown as text.
2. Only the user's press on 전화 걸기 follows the link. The link is `tel:` + checked digits, built by `telHref()`, the only place `tel:` exists in ONGIL.
3. After the press, the status line says "전화 앱 열기를 요청했어요. 통화 연결 여부는 ONGIL이 알 수 없어요." Nothing ever says a call was made or connected.
- In the dialog, Tab stays inside, Escape closes it, and focus returns to the opener.
- A browser without a phone app gets no error.

**119 / 112**
- Shown under the list as "공공 긴급전화", separate from the user's own contacts.
- They use the same confirmation dialog.
- The copy says ONGIL does not report anything or call an ambulance.

**Assistant**
- "엄마한테 전화해줘" and similar requests get "전화는 ONGIL 도우미가 걸지 않아요. 긴급 연락망을 열어 드릴게요." with a link to 건강·안부.
- The assistant has no access to the store. `emergencyContacts` is in `NO_WRITE_AREAS`.

**Privacy**
- Contacts are not synced, not in global search, not in Saved, not shared with family, not in community, and not in the public index.
- Analytics counts nothing about them; the store is not wrapped by instrumentation.

**Erase.** "ONGIL 데이터 삭제" removes the collection. LIVON and site keys stay.

**Storage failures**
- `home-list.js` now announces a delete only when the store wrote it.
- A refused add or edit shows the storage sentence, never "추가했습니다".

## 2. Production data verification (this session)

| Check | Result |
|---|---|
| `GET https://newon-api.vercel.app/api/health` | **NOT LIVE VERIFIED**. The cloud and the device egress proxies both refused the host (403). The fetch tool refused it on robots.txt. No other route was tried. |
| kr-kakao-place / kr-tourapi / kr-lifelong-class live requests | **NOT LIVE VERIFIED**, for the same reason. No request was sent, so no quota was used. |
| Public `https://www.newon.app/livon/livon-api-config.js` | `var configured = "";` (read in this session). |
| Public `https://www.newon.app/ongil-start/` | An older ONGIL build. This branch is not deployed. |

**API origin, from the code**
- ONGIL reads `window.LivonApi` from `/livon/livon-api-config.js`.
- That file is written at build time from the GitHub Actions variable `LIVON_API_ORIGIN`.
- When the variable is empty, the page asks the same origin (`/api/livon/data`). On GitHub Pages that answers 404, so every source shows "not connected" (`NOT_CONFIGURED`).
- There is no localhost fallback in the browser code.
- The server allows the `https://www.newon.app` and `https://newon.app` origins by default.

**Consequence.** The production build currently asks `www.newon.app/api/livon/data`, which does not exist on Pages. Live public data on the production site needs:
- `LIVON_API_ORIGIN=https://newon-api.vercel.app` set as a repository variable
- a rebuild of the site
- this branch deployed

This is an EXTERNAL CONFIG item; nothing was changed here.

**Deterministic verification.** Two layers, with no network:
- `tests/ongil/production-api.test.mjs` (API-01…32) runs ONGIL's real clients against the real route with fixture upstream answers. It covers allowlist, validation, CORS, timeouts, partial failure, sanitising, Saved snapshot and link safety.
- Browser QA, run separately from these tests: the real route served with fixture upstream answers labelled `[QA]` — not live data:

| Flow | Result |
|---|---|
| 돌봄 기관 찾기 → result → 자세히 (https links, `noopener`) → 저장 → 저장 화면 → reopen | PASS |
| Saved values | Contain no raw provider payload |
| 즐길거리 평생학습 | PASS |
| Search finds loaded items without calling the API | PASS |
| Requests | Carry only region, public words and fixed codes |
| Pages-like address (no route) | Care and enjoy say "not connected"; no card is invented |

## 3. Operating state

| Area | State | Basis |
|---|---|---|
| Home | LOCAL READY | Local stores; 내 주변 needs the API origin (EXTERNAL CONFIG) |
| My Life | LOCAL READY | Local stores, tests, browser QA |
| Health / Check-in | LOCAL READY | |
| Health Measures | LOCAL READY | |
| Medication | LOCAL READY | |
| Hospital Appointment / Health Screening | LOCAL READY | Shared calendar store |
| Emergency Contacts | LOCAL READY | This change; calling is a confirmed `tel:` link only |
| Family | PARTIAL | Local sharing choices and help-request notes; connection, permission, consent and sending are BACKEND REQUIRED |
| Care | PARTIAL | Facilities: code ready, EXTERNAL CONFIG REQUIRED. Services and benefits: NOT IMPLEMENTED (no source) |
| Enjoy | PARTIAL | Lifelong, TourAPI and Kakao sources are code ready, EXTERNAL CONFIG REQUIRED. Groups and meetups are local drafts |
| Community | PARTIAL | Local posts and drafts only; remote community is BACKEND REQUIRED |
| Store | PARTIAL | Discovery shell; no product source (NOT IMPLEMENTED); no commerce |
| Search | LOCAL READY | Menus, Saved, and items loaded during the visit |
| Saved | LOCAL READY | |
| Notifications | PARTIAL | Local model only; push is BACKEND REQUIRED |
| Account | PARTIAL | Local adapter; Newon+ sign-in and sync are BACKEND REQUIRED |
| Onboarding | LOCAL READY | |
| ONGIL AI | LOCAL READY | Deterministic, no model |
| Admin / Analytics | LOCAL READY | Local operations view and counters only |
| Public Data | EXTERNAL CONFIG REQUIRED | Route code verified with fixtures; live NOT LIVE VERIFIED |
| Newon+ | BACKEND REQUIRED | |
| Remote Sync | BACKEND REQUIRED | |
| Push Notifications | BACKEND REQUIRED | |

## 4. Backend dependency map (next phases)

| Capability | Frontend ready | Data model ready | Backend required | External config |
|---|---|---|---|---|
| Family connection / permission / consent / ShareGrant / ShareRevocation / AuditLog | Partly (settings and preview) | Contracts only (`family-contracts.js`) | Yes: identity, invites, grants, revocation, audit | Newon+ project |
| Community remote posts, comments, replies, reactions, follow, groups, meetups, reports, blocks | Local versions | Local contracts | Yes: storage, moderation, abuse handling | Newon+ |
| Account: Newon+, authentication, cross-device sync | Local adapter, sync hook (`storage.subscribe`) | Privacy classes decide what may sync | Yes | Firebase/Newon+ project and database |
| Notifications: push, server events | Local center | Notification types defined | Yes: push service and event producer | Push credentials |
| Store: real product source, future commerce | Discovery shell | Product contract; commerce flags all false | Product source yes; commerce out of scope | Partner feed |
| Public data (Care, Enjoy, 내 주변) | Yes | Yes | Exists (newon-api route) | `LIVON_API_ORIGIN` repository variable and provider keys (live verification) |
| Devices (ONGIL Home / IoT) | No | No | Yes | — |

## 5. Tests

- New: `tests/ongil/emergency-contacts.test.mjs` (OG-EC-1…11).
- Earlier pins were updated where this change deliberately moved them:
  - collection, module and test-file counts
  - `PRIVATE` class lists
  - 건강·안부 `contacts` now live
  - `tel:` now allowed in exactly one module
  - cache version `?v=20261004v13` for `app.js` and `ongil-life.css`
  - the delete announcement depends on the write result
- `node --test tests/ongil/*.test.mjs`: 725 / 725.
- LIVON suite (not modified): 477 pass, 1 skip (PostgreSQL).

**Browser QA.** Chromium at 320 / 360 / 390 / 430 / 768 / 1024 / 1280 / 1440:

| Check | Result |
|---|---|
| Full 긴급 연락망 flow | PASS |
| Call dialog stays inside the screen | PASS |
| Tab trap, Escape, focus return | PASS |
| Every control is named; targets ≥ 44 × 44 | PASS |
| No horizontal overflow | PASS |
| V2 calendar day targets ≥ 44 px | PASS |
| Refused write shows no success | PASS |
| Corrupted value reads as empty | PASS |
| Erase keeps LIVON keys | PASS |

Safari and real phones were not tested (no WebKit here).
