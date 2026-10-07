# LIVON Life Stage V2

Branch `livon-life-stage-v2` · base `cf0b1505e` · 2026-10-07

Life Stage is the structured information hub of LIVON: the person picks a life stage and a topic themselves and finds
general guides, service types and official portals. V2 keeps every V1 record and screen and changes how it is searched,
filtered, labelled and protected. This document is a feature record, not a release statement: V2 is not live.

## 1. What exists (counted from `livon/life-topics.json`, not assumed)

| | Count |
|---|---|
| Life stages | 7 (10대 … 70대+) |
| Topics | 228 (28 · 38 · 33 · 31 · 31 · 33 · 34 per stage) |
| Interest categories | 88 (55 distinct names) |
| Checklist items | 831 |
| Service types | 38 in 13 groups (no partner, no price, no booking) |
| Official portals | 17 (17 hosts, all https; 11 with a LIVON link-check date, 6 without) |
| Experts | 0 |

The landing page also uses `life-data.js` (7 stage summaries, 99 stage tools) and `life-events-data.js`.

## 2. V1 audit — what was found

| Area | Finding | V2 |
|---|---|---|
| Search | Life Stage had its own matcher, separate from the shared LIVON index used by the header and 탐색 | One system: the shared index, limited to Life Stage's own rows |
| Search state | Filters lived in memory; reload and Back lost them | Query and conditions are in the URL |
| Filters | 종류 and 연령 only, no way to see or remove what is applied | 생애 단계 · 정보 종류 · 분야, removable chips, 모두 지우기 |
| Wording | "인기 질문", "지금 많이 찾는 주제", "많이 겪는 Life Event", "추천 콘텐츠" with no popularity data behind them | Truthful names (below) |
| Saved | A fallback card wrote a Life Stage-only list (`livon.lifeSavedLocal`) | Shared saved list only |
| Data loading | One malformed row could break a screen (arrays assumed) | Row-level checks; bad rows are left out and counted |
| Attribution | Topic pages did not say who wrote them or when | "LIVON이 정리한 일반 생활 안내 … 내용 정리일" |
| Touch targets | Small buttons 40px, sticky links 38px, breadcrumbs 32px, page index 36px | 44px minimum |
| Stage inference | None found: a stage is stored only when the person presses a stage control | Kept, and locked by tests |

## 3. Information architecture (unchanged routes, one addition)

```
#life                               landing: stage chooser · one search box · stage view · Life Events · …
#life/{stage}                       stage view (inside the landing)
#life/{stage}/c/{category}          category → topics
#life/{stage}/{topic}               topic detail: 알아야 할 것 · 가이드 · 체크리스트 · 정책 · 서비스 · …
#life/{stage}/{topic}/services[/…]  related service types
#life/services/{service}            service type
#life/search/{query}?stage=&type=&area=     search (V2: conditions in the URL)
```

No section was added to the landing except the search box. `#life` from 탐색 and 오늘의 발견 keeps working.

## 4. Search and filters

- Engine: `LivonSearch.search()` (`explore-search.js`). Life Stage keeps only its own rows — keys `lt:` (topics),
  `svc:` (service types), `pol:` (official portals). 탐색 items and Community posts in the same index are not listed here;
  the results screen links to 탐색 for them.
- Filters exist only for metadata the index really has: **생애 단계** (topics have one), **정보 종류** (주제 · 서비스 유형 ·
  공식 포털), **분야** (the shared index's 12 areas). There is no region, price, rating or sort filter: the data has none.
- A stage belongs to topics only, so choosing a stage lists topics.
- Enter submits; the clear button empties the box and the URL; the count is announced (`role="status"`); no result offers
  "조건 모두 지우기" and a link to 탐색; focus stays on the control that was pressed; unknown values in a pasted URL are ignored.
- Filtering by a stage is not choosing "my" stage: nothing is stored.

## 5. Truthful wording

| Before | After | Why |
|---|---|---|
| 인기 질문 (Popular) | LIVON AI에게 물어볼 질문 예시 (Questions) | Example prompts; no popularity is measured |
| 지금 많이 찾는 주제 (Popular Topics) | 먼저 살펴볼 주제 (Topics) | An editor-picked list in a fixed order |
| 많이 겪는 Life Event | 이 시기의 Life Event | No frequency data |
| 추천 콘텐츠 | 함께 볼 콘텐츠 | Linked content, not a scored recommendation |
| (static pages) …에 많이 찾는 주제 | …에 먼저 살펴볼 주제 | Same list as above |

No rating, ranking, view count, score, eligibility decision or success probability is shown anywhere in Life Stage.

## 6. Sources and dates

- Topic guides are LIVON's own general guides and say so; they are not presented as an official body's text.
- Official portals: https only, opened in a new window and labelled so.
- A link-check date is shown only when the record has a valid one (`YYYY-MM-DD`, not in the future). Six portals have none
  and show none. The content date is the data file's own (`2026-09-28`). No date was changed in V2 and none is generated.

## 7. Privacy, AI, account

- Life Stage reads public files only. It never reads My Life records to choose or suggest a stage, and its search never
  reads My Life or Community stores. Topic pages may list public Community posts of this device (not drafts, private,
  members-only or deleted ones), as in V1.
- "LIVON AI에게 물어보기" prepares a draft the person sends; Life Stage calls no AI endpoint. Account sync is not enabled.

## 8. Data quality

`Repo.use()` checks every row: id, duplicate id, title, summary, stage, route, slug, https source, provider, check date,
array shapes. A failing row is left out (or repaired when only an optional list is malformed) and recorded in
`LivonLifeHub.repo.issues`; the shipped file produces no issue. Only a file that is not Life Stage data at all is refused,
and what was loaded before stays.

## 9. Cache

`life-hub.js`, `life-page.js`, `life-page.css` → `?v=20261007ls1`. Nothing else moved (탐색 `ex1`, 오늘의 발견 `c7`,
data files `cq1`).

## 10. Tests

`tests/livon/life-stage-v2.test.mjs` (LS2-01 … LS2-40): data and contract tests run everywhere; browser tests need a local
Chromium; the two cache-window tests need the base commit.

## 11. Known limitations

- Search finds guide steps through their topic; a step is no longer a separate result.
- 분야 is the shared index's keyword-based area, not a field edited per topic.
- The landing page still has its V1 sections (packages, family, showcase); V2 did not redesign them.
- Six official portals have no link-check date in the data.
- Verified in Chromium only; Safari, Firefox and real devices were not run.
