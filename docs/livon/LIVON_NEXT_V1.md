# LIVON Next V1

STATUS = CODE READY on local branch `livon-next-v1` (base = main `70a816aa9`, remote main checked 2026-10-10: unchanged).
Not pushed, not merged, not deployed. Account features stay switched off.

## 1. Content review hold (DM-11 / RC-14)

Before: on main, RC-14 reported `stale = 13` and DM-11 failed — 13 curated records were past their review interval
(the Data Platform's freshness policy: program / class 14 days; last check 2026-09-25).

| Record | Decision | Why |
|---|---|---|
| ex:ex-qnet (큐넷) | check date → 2026-10-10 | official site loaded and matches the record (re-checked 2026-10-10) |
| ex:ex-lifelong (국가평생교육진흥원) | check date → 2026-10-10 | official site loaded and matches (2026-10-10) |
| ex:ex-senior-job (한국노인인력개발원) | check date → 2026-10-10 | official site loaded and matches (2026-10-10) |
| ex:ex-hrdkorea (HRD-Net) | review hold | hrd.go.kr now leads to 고용24 — title/description need an editorial update |
| ex:ex-allilearn (늘배움) | review hold | lifelongedu.go.kr did not load when re-checked |
| ex:ex-worknet-job (직업심리검사) | review hold | 고용24 is live but the specific claim could not be confirmed |
| td:learn-kmooc (K-MOOC) | review hold | site live; the price line "대부분 무료 (일부 유료)" could not be confirmed |
| td:exp-pottery, td:exp-baking, td:exp-yoga, td:exp-photo, td:learn-finance, td:learn-digital-senior | review hold | LIVON-written guides with prices / claims and no external source to re-check against |

- A held record gets `publishStatus: "review"` and a comment saying why and how to release it. Nothing is deleted;
  no date was moved without a real re-check.
- The Data Platform hides `review` records from every screen (Today, Explore, search, Life Stage). Inventory and QA
  tools ask for them with `includeHeld` and flag them `REVIEW_HOLD`; `livon-data-quality` reports `checks.held`.
- RC-14 now reads: 530 records in the inventory, 520 shown, 10 held, `stale = 0`. DM-11 passes.
- Consequence (visible): all Today 체험 and 배움 guides are held, so those two sections are empty until the guides are
  re-checked. Today no longer fills a typed section with records of another type (an empty 배움 used to show a park);
  it says "지금 이 영역에 보여 드릴 콘텐츠가 없습니다." Search for "요리" became a weak result for the same reason.
- To release a record: re-check its source, set `publishStatus` back to `"published"` (or remove it) and set `checkedAt`
  to the real check date.

## 2. Public data errors (평생학습 강좌 · 마을세무사 502)

- Server (`server/livon/data/http.mjs`, unchanged — it is one of main's byte-identical production routing files): it
  already separates the provider's failure from its own — a provider failure is answered `502 UPSTREAM_ERROR` (or
  `TIMEOUT` / `UPSTREAM_LIMIT`) and logged as one fixed-field line (provider, stage, error category, upstream HTTP
  status, provider result code, error class), never a key, URL, query or body. `diagnostics()` keeps
  `lastErrorCategory`. (A first version also stored `lastUpstreamStatus` there; it was reverted to keep the route
  identical to main — the status is in the log line.)
- Browser (`livon-data-providers.js`, `livon-data-core.js`): a failed load is classified by where it failed —
  `upstream` (LIVON answered with an upstream code), `livon` (LIVON's own error code), `gateway` (no LIVON JSON at all,
  e.g. a hosting 502 page), `network` (no answer), `not_configured`. Only fixed codes are read — never a body, URL or key.
- `LivonData.providerNotice(ids)` gives plain wording without guessing a provider's cause; Explore shows it on the
  results that would contain those items, with "공공데이터 다시 불러오기". The rest of Explore keeps working.
- The production 502 itself was not reproduced here (no production keys or logs in this environment): its real cause
  is NOT VERIFIED. The new fields tell, on the next failure, whether it came from the provider or from LIVON.

## 3. Account Sync V1

Merged with `git merge` (`0d7251c2d`: `livon-account-sync-v1` `d4a2cf735` into main `70a816aa9`). Conflicts in
`livon/index.html` and `tests/livon/release-candidate.test.mjs` resolved. `LIVON_ACCOUNT_SYNC_PUBLIC` is set nowhere
(default off), no login UI is shown, no server sync runs; no Firebase, PostgreSQL or Vercel setting changed.

## 4. Anonymous Free Mode data protection (`livon/data/livon-data-protect.js`)

Shown in My Life › 설정 under "내 생활 데이터" as "LIVON 데이터 백업 · 복원 · 삭제".

- **Backup**: every LIVON-owned `localStorage` key ("livon." prefix, known to the user-data inventory) → one JSON file
  `{ format: "livon-backup", version: 1, createdAt, notice, keys }`, named `livon-backup-YYYYMMDD-HHMM.json`, made in the
  browser (Blob). Caches, account-sync machinery and session drafts are not included. The screen says the file may hold
  personal information.
- **Restore**: the file is checked first (size, JSON, format, version, key names, value types). Default = keep existing
  data (only keys this device does not have are added); replacing needs its own choice and a confirmation checkbox.
  All writes are rolled back if one fails (e.g. storage full) — nothing is lost.
- **Delete all**: separate confirmation; removes `livon.` keys from local and session storage only — ONGIL (`ongil.`),
  Newon and other keys stay; refused while an account is active; then returns to the first-run state.
- **Storage full**: a failing write of a LIVON key is detected (the same error still reaches the caller), and a
  dismissible notice offers "백업 받기" and a link to the data section. The app keeps running.

## 5. Tests

`tests/livon/livon-next.test.mjs` NX-01 … NX-17; updated count / version expectations in content-quality, data-manager,
data-platform, screen-migration, release-candidate, explore-v2, today-v2 (TV2-51), life-stage-v2, saved-v2, home, real-data,
integration-ops, performance. Cache keys: changed files carry `?v=20261010nx1`.
