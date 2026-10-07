# LIVON Saved V2

Branch `livon-saved-v2` · base `cc08c9068` · 2026-10-07

Saved V2 turns `#ml-saved` (내 생활 › 저장) from a plain list into a place where saved items can be found again and used:
search, filters, sorting, folders, a check of the original, and 저장함 비우기. It is a feature record, not a release
statement: Saved V2 is not live.

## 1. What did not change

| | |
|---|---|
| Storage | `localStorage["livon.platform.v1"].saves` — the same array, the same row shape, the same 200-row rule |
| API | `LivonPlatform.saveItem / removeSave / listSaves / hasSave / saveIds / setSaveFolder / folders / load / save` — `livon/livon-platform.js` is byte-identical |
| Route | `#ml-saved` is still the only full Saved screen (header panel, Today, Explore, Community keep linking to it) |
| Identity | one item = one row; the same item under its old id and its shared id (`life-hub:{kind}:{ref}`) is still one row |
| Older saved lists | `livon.tdSaved`, `livon.lifeSavedLocal`, `livon.exSaved` are still read and imported exactly as before |
| Server, API, database, environment | none involved |

New storage keys: 0. Search text, filters and sorting live in memory; filters and sort are also in the address
(`#ml-saved?type=&folder=&source=&sort=`), the search text never is.

## 2. What is new

| | Behaviour |
|---|---|
| Search | "저장함에서 찾기": title, source, kind, folder, and the description only where the saved row carries a snapshot (real-data saves). Worked out on the device; no request, nothing stored, not in the address or history. A reload or re-opening the screen starts without a search |
| Kind filter | Chips appear only for kinds that have rows: 라이프 스테이지 · 콘텐츠 · 정책·지원 · 서비스 · 장소 · 클래스 · 행사 · 전문가 · 커뮤니티 · 기타 (a saved Explore program is stored as 클래스; there is no "프로그램" kind) |
| Source filter | The sources the rows actually have (라이프 스테이지, 탐색, 오늘의 발견, 커뮤니티, a provider name). Shown when there is more than one |
| Folder filter | The folders the platform already has (취업 준비 · 여행 · 독립 준비 · 부모님 · 나중에 보기). A row without a folder counts as 나중에 보기 |
| Sort | 최근 저장 · 오래된 저장 · 제목. Rows without a date (older saves) keep their stored order after the dated rows and say "저장 날짜 없음" |
| Folder move | A "폴더" select on every row. Only the row's `folder` field changes (through `setSaveFolder`); a folder that does not exist is refused, so no folder is created |
| Original | 원본 보기 when the item is still in the data the page has (Life Stage topics / service types / portals, Explore items, Today contents, the device's community posts) or the saved address is an `https://` address. Otherwise the row stays, says "원본을 찾을 수 없습니다", has no link, and can still be moved or removed. An address is judged by its form only — no request is made to check it. An id that cannot be checked keeps its link |
| Bad rows | A row that is not an object or has no id is skipped on screen, counted ("형식이 맞지 않아 표시하지 못한 저장 기록이 N개 있습니다"), and left in storage. Missing title → "저장 항목"; unknown kind → 기타; unsafe address → no link |
| 저장함 비우기 | Confirmation dialog (alertdialog, focus on 취소, Tab stays inside, Escape cancels, cancel returns focus to the button). Confirm empties `saves` and the three older saved lists — the lists first, so nothing is imported back. Folders, My Life records, community posts, personalisation, AI settings and all content data are untouched |
| 200 rows | Unchanged. From 180 rows the screen says: "저장은 이 기기에 최대 200개까지 보관됩니다(지금 N개). 200개를 넘으면 목록의 맨 뒤에 있는 오래된 저장부터 빠집니다." |
| Wording | "저장한 항목은 이 기기에만 보관됩니다." No cloud, sync or account claim |

## 3. Where the code is

- `livon/life-now-hub.js` — the Saved V2 module (`Saved`), installed with the rest of the My Life hub. It was put here, not in
  `life-now-page.js`, because that file is at 152 KB of the 160 KB single-script budget (PERF): the page keeps its earlier
  Saved list and hands over to the module when it is present.
- `livon/life-now-page.js` — state (`savedSource`, `savedSort`, `savedQ`), address parameters, the six hand-over points,
  a guarded 저장 해제.
- `livon/life-now-page.css` — one appended block: row actions wrap and go under the text on narrow screens; 44px controls.
- `livon/index.html` — version keys only: `life-now-page.js`, `life-now-hub.js`, `life-now-page.css` → `?v=20261007sv1`.
  Life Stage `ls1`, Explore `ex1`, Today `c7`, platform `ex1`, ONGIL `r14` are unchanged.

Cache window: the new page script with an old hub shows the earlier Saved list; the new hub with an old page script
installs without Saved V2. Both are covered by SV2-21.

## 4. Privacy

Saved items are personal data on the device. Saved V2 adds no request, no analytics call and no log line. The search text
is never in the address, history, storage or a request (SV2-04, SV2-31). LIVON AI reads saves only when the person has
turned on `shareSaved` (off by default) — unchanged. Account sync is not connected — unchanged.

## 5. Tests

`tests/livon/saved-v2.test.mjs` — SV2-01 … SV2-22 run everywhere (node:vm with the real `livon-platform.js`); SV2-30 … SV2-45
need a local Chromium (flows with Explore, Life Stage, Today and Community, keyboard, dialog, layout at 320 / 390 / 768 /
1024 / 1440px at normal and 200% text).

Three existing tests that pin version keys now also accept `20261007sv\d` for the My Life files (ML2-36, TV2-51, PERF-49).

## 6. Known limits

- A non-object row inside `saves` (for example `null`) makes `LivonPlatform`'s own start-up import and its
  `saveItem` / `removeSave` throw. That is the platform's existing behaviour and the platform file was not changed. Saved V2
  still lists the other rows, says how many it could not show, and 저장함 비우기 removes the bad rows too.
- The 200-row rule still drops the oldest rows without asking; V2 only says so in advance.
- Folders cannot be created, renamed or deleted (there was no such feature before; none was added).
- The original check covers what the page has on the device. An outside address is not fetched, so a dead outside page
  still shows 원본 보기.
- 200% text was measured by doubling the root font size, not with browser zoom. No real iPhone, Android device or screen
  reader was used.
