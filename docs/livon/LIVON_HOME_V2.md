# LIVON Home V2 — the personal hub

Base: `0a3d8ea36` (Saved V2 in production). Branch `livon-home-v2`. Not integrated, not deployed.

Home was a long introduction with the personal summary in seventh place. Home V2 puts a personal hub directly under the
hero and keeps the introduction below it. Home is a reading and linking layer: it owns no data and writes none.

## Order

1. Hero (unchanged)
2. Hub `#hm-hub` — **오늘 → 내 생활 → 지금 내 생애주기 → 발견 → 저장한 것**
3. Community `#hm-connect` (small)
4. LIVON AI `#hm-ai` (small)
5. Introduction: LIVON 의미 `#hm-meaning`, 삶의 단계 `#hm-journey`, 여섯 가지 연결 `#hm-services`, 시작 `#hm-start`

## Where each card reads from

| Card | Source | Notes |
| --- | --- | --- |
| 오늘 | `LivonMyLife.api.today(new Date())` | The model 오늘의 발견 › 내 오늘 uses. One call per render, shared with 내 생활. Counts: to-dos due today (done / total), today's events, today's routines, overdue as a separate line. Home has no date arithmetic. |
| 내 생활 | the same model's `upcoming` (다가오는 7일) + `api.snapshot()` goals | Goal progress = linked to-dos ticked / linked to-dos. No score. No add / edit / delete on Home. |
| 지금 내 생애주기 | `livon.lifeStage` + LivonLifeHub | Only the stage the person chose. Not set → one sentence and the existing onboarding. Topics, one checklist in progress, one related service; topics that match Life Events chosen in onboarding (with the reason); real-data columns when a provider has data. |
| 발견 | registered 오늘의 발견 and 탐색 items | Two of each. With chosen interests, items containing one of those words come first and the card says so; otherwise registered order. No numbering, nothing called a recommendation. |
| 저장한 것 | `LivonPlatform.listSaves("all")` (`livon.platform.v1` → saves) | Three most recent → `#ml-saved`. A stored outside link is not followed from Home. |
| Community | local Community repo, public posts, newest first | No counts, no numbering. |
| AI | fixed prompts + input | The question is placed in the AI composer as a draft; nothing from the hub is attached; Home calls no API. |

## Removed from Home (decisions 2–4)

- The PERSONALIZE form (stage select, 생활 상황, 관심사, 관심 지역) — settings live in onboarding / 내 생활.
- "내가 준비 중인 변화" chips — the stage card links to Life Stage `#life-events`.
- "나를 위한 추천", the 오늘의 발견 photo mosaic, the numbered Explore list, "이어서 하기".
- The "나의 라이프 스테이지 설정" button that wrote the stage from Home — it now opens onboarding.

Home no longer writes `livon.lifeStage`, `livon.lifeInterests`, `livon.mlInterests`, `livon.lifeSituations`,
`livon.lifeEvents` or `livon.hmRegion`, and no longer reads the last three or `livon.tdSaved` / `savedCommunity`.
Nothing stored is deleted or migrated. `livon.hmRegion`: Home read 0 / write 0; onboarding (`livon-platform.js`) still
writes its region there and no screen reads it.

## Isolation

`renderAll()` draws each section through `safe(name)`: a section that throws shows "이 영역을 지금 보여 드리지 못했어요…"
in its own box and the others are still drawn. Stored rows are shape-checked (objects with an id and a title); a
`javascript:` or outside link from storage is never used as a link.

## Files

- `livon/index.html` — Home section markup reordered; `home-page.css?v=20261008hv2`, `home-page.js?v=20261008hv2`. No other version changed.
- `livon/home-page.js` — 51 KB → 35 KB.
- `livon/home-page.css` — hub styles appended (rem sizes, one column → two at 720px → three at 1080px); one rule keeps the service showcase inside the page at large text.
- Tests: `tests/livon/home.test.mjs` rewritten as HOME-V2-01…20; five existing tests updated with WHY / BEFORE / AFTER (accessibility A11Y-16, onboarding ON-34, performance PERF-9 / PERF-49, screen-migration S-4, release-candidate guard entry).

## Checked

- Unit: HOME-V2-01…20 (order, Today consistency, Seoul / UTC / LA date boundary, My Life, explicit-only stage, wording, saves, Community, AI, hmRegion, isolation, malformed data, empty states, routing, privacy, performance, accessibility, cache).
- Browser (Chromium, local copy): 320 / 390 / 768 / 1024 / 1440 at 100% and 200% text, empty device and filled device — no horizontal overflow, no clipped control, no control under 44px in the hub / Community / AI blocks, heading levels in order, Tab order follows the visual order with a visible focus ring, the stage button opens onboarding and leaves the stored stage as it is.

## Not verified / known limitations

- Real browser zoom, real screen reader, real devices.
- 내 생활 shows upcoming items and goals only — no "최근 기록" or "이번 주" line (My Life has no read-only summary for them yet).
- The unused V1 rules stay in `home-page.css` (dashboard, mosaic, form); they match nothing now.
- With 200% text on a phone the hub is long (about ten screens at 390px with a filled device).
- `livon.hmRegion` is still written by onboarding; cleaning that up is a separate change.
