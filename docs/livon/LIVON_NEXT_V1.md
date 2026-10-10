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
- Consequence (visible): every Today 체험 (experience) and 배움 (learn) record is held. Today no longer fills a typed
  section with unrelated records (an empty 배움 used to show a park). After its own type, a section shows only records
  the data itself assigns to it (`sections`) that do not state a price or budget without an official source:
  배움 → 국립중앙도서관에서 하루 공부·독서 (official nl.go.kr, site checked 2026-10-10), 체험 → 새 취미, 장비가 아니라 루틴으로
  시작하기 (LIVON editorial, no price or factual claim). The season guides tagged 체험 stay out of it (unsourced budgets).
  If a section has nothing left it says "지금 이 영역에 보여 드릴 콘텐츠가 없습니다." Search for "요리" is a weak result.
- Recovery re-check (2026-10-10, second pass): learn-kmooc — kmooc.kr confirms university / institution open courses
  and per-course 이수증, but the price line "대부분 무료 (일부 유료)" is not stated on the pages checked → stays held.
  The six LIVON-written guides have no external source to check their prices and claims against → stay held.
  ex-worknet-job — 고용24 does offer 직업심리검사 (menu present 2026-10-10), but the record's "free" price type is not
  stated there → stays held. ex-allilearn — lifelongedu.go.kr again did not load → stays held. ex-hrdkorea — hrd.go.kr
  leads to 고용24; the HRD-Net wording needs an editorial decision → stays held.
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

## 6. Integration (branch `livon-next-v1-final`)

Two versions of LIVON Next V1 were built in parallel from main `70a816aa9`: **A** `livon-next-v1` `1a21d6dca` (this
document's §1–§5) and **B** `livon-next-v1-review` `7f2ed205b` (its own backup module `livon-backup.js`, its own 502
wording, an evergreen exemption that showed LIVON-written guides with their budgets). Both re-implement the same features,
so they were **not merged** (a merge would load two backup modules, two storage-full handlers and two stale rules).
`livon-next-v1-final` starts from A and takes only these parts of B, each re-checked:

| Taken from B | Why |
|---|---|
| ex-hrdkorea correction | HRD-Net was merged into 고용24 (고용24's site introduction lists HRD-net among the merged sites; hrd.go.kr answers 302 → work24.go.kr; footer: 고용노동부 · 한국고용정보원). Title 직업훈련 · 고용24 (구 HRD-Net), provider 고용노동부 · 한국고용정보원 (고용24), link work24.go.kr, body says the old address leads to 고용24, compare price "과정·대상별 상이" (no "지원 가능" claim). checkedAt 2026-10-10 = the check. Released from the hold. |
| `providerRef` in the Data Platform adapter | links ex-hrdkorea to the existing 고용24 provider record (ex-career24) instead of deriving a new provider row: 530 records, ids unchanged |
| static Life Stage pages skip hidden records (`scripts/livon-seo-build.mjs`) | A still linked held records (e.g. 늘배움, K-MOOC) from the generated static pages |
| (new) static Today pages skip held records (`scripts/render-livon-today-routes.mjs`) | both A and B still generated `/livon/today/{id}/` for the 7 held Today records (title + description in the page) |
| Help describes the backup | A's Help still said a file cannot be restored; rewritten for A's panel (내 생활 › 설정 › ‘LIVON 데이터 백업 · 복원 · 삭제’, default = add missing items, overwrite needs its own choice) |

Not taken from B: `livon-backup.js` (A's `livon-data-protect.js` stays — merge-by-default restore), B's 502 retry/wording
(A's classification stays), B's evergreen exemption (it would show unsourced budgets), B's `includeReview` option (A's
`includeHeld` is the same idea).

New in the integration:

- **Prices**: a price from a Today record is shown only when the record has an official https source; LIVON's own
  `budget` is shown (card meta, "예산" reason, "무료" filter) only when that source's price wording supports it — "무료"
  needs "무료" in the price, an amount needs an amount (`today-page.js` `priceSourced` / `shownBudget`, `today-feed.js`;
  the Data Platform's Today adapter derives `priceType` from the source's price only). Effect: LIVON-written guides
  (함께 · 계절 · 생활) and 국립현대미술관 ("전시·프로그램별 상이" vs budget 1만~3만 원) no longer show a budget; 한강공원 and
  국립중앙도서관 keep "무료" (their price says 무료). The data keeps every budget. Explore records with "무료" all link an
  official public portal. The page scripts still ship every record's data (held ones included); screens hide them.
- **Today touch targets**: every Today button, tab, chip, nav link and card title link is at least 44 × 44 px
  (`today-page.css`, measured in Chromium at 390 and 1280 px: 0 smaller controls; before: 100+ at 39–42 px and title
  links at 20 px).
- **Cache**: `livon-data-platform.js`, `explore-data.js`, `today-data.js`, `today-page.js`, `today-page.css`,
  `today-feed.js`, `help-data.js` → `?v=20261010nx2` (A had changed `explore-data.js` and `today-data.js` without a new key).

### 13 records (status on the integration branch)

| Record | Status | Basis |
|---|---|---|
| ex-qnet, ex-lifelong, ex-senior-job | shown, checkedAt 2026-10-10 | official sites loaded and matched (both versions) |
| ex-hrdkorea | shown, corrected, checkedAt 2026-10-10 | see above |
| ex-worknet-job | **held** | 고용24 offers 직업심리검사, but the record's "free" price type was not confirmed (official pages refused automated reading on 2026-10-11) |
| ex-allilearn | **held** | lifelongedu.go.kr did not load (2026-10-10, several tries) |
| td:learn-kmooc | **held** | site live; "대부분 무료 (일부 유료)" not confirmed on an official page |
| td:exp-pottery, exp-baking, exp-yoga, exp-photo, learn-finance, learn-digital-senior | **held** | LIVON-written, prices/claims without a source |

Inventory: 530 records, 521 shown, 9 held, stale shown 0. Today 체험 / 배움 keep A's recovery (루틴 guide, 국립중앙도서관).
