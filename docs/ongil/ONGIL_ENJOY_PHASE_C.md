# ONGIL Enjoy Phase C — 전국 축제·공연·행사

Base: `fac638ba5` (Enjoy Phase B `f1bc14574` + Stability V1 `8d7e83fb4`, merged locally). Not deployed.
Source: 한국관광공사 TourAPI (KorService2), contentTypeId **15** 축제공연행사, list operation **`searchFestival2`**,
as planned in `ONGIL_ENJOY_PHASE_B_TOUR_REGIONS.md` ("Phase C = festivals type 15 / searchFestival2").
The Phase C plan commit (`7ece5a2d6`) was not available to this session; the design follows the Phase B doc and
the existing `EVENT` contract in `enjoy-contracts.js`.

## What a person can do

- 즐길거리 › 지역에서 찾아보기 › **축제·공연·행사 (한국관광공사)** in 문화 and 나들이 (not in 여행: 여행 stays
  tourist information only).
- Region: the 16 Enjoy regions (세종 = 36110, 광주·전남 = 12), or **전국** — offered only for festivals. Choosing 전국
  with another target is refused with a sentence that says why.
- Date filter **기간 (축제·행사)**: 지금 열리는 중 · 7일 안에 · 이번 달 · 다음 달부터, read against today's date on the device (the server asks the API from today in Korea).
  Festivals whose last day has passed are not listed.
- Each result shows 기간 start ~ end. **자세히** loads the festival's own detail (place, 주최, 이용 요금, 소개, and its
  homepage when the source has one). The homepage is labelled 운영기관 누리집 보기 — it is the organiser's site as
  TourAPI gives it, not a page ONGIL vouches for.
- 저장 (favourites) uses the existing PROGRAM saved type ("행사 · … · start date"); 캘린더에 추가 uses the start day.
  No new saved type, no new storage key.
- Errors: a list that cannot be read is "could not load" with the Stability V1 reason and 다시 찾기, never "nothing
  found". If page 1 arrived and a later page did not, the found items are shown with "일부 자료는 받아오지 못했어요".
  A detail that cannot be read shows 오류: … and **다시 불러오기**.

## Changes

**Server — `server/livon/data/providers/tourapi.mjs`** (shared with LIVON; `http.mjs` unchanged, RC-1)

- `OPS.festival = 'searchFestival2'`; `type=15` accepted **only** as a festival list (region optional; query,
  coordinates, sigungu, radius → 400) or with `id` as a detail. 25 stays refused; place types are unchanged.
- `eventStartDate` = today in Korea (YYYYMMDD), `arrange=A`, `lDongRegnCd` when a region is chosen.
- `toEvent()` → schema `event` entity. Dates only from `eventstartdate` / `eventenddate`; a row without a valid
  start is dropped; an end before the start becomes `null`. `eventStatus: 'unknown'` (the API says nothing about
  cancellation). `source.sourceUrl` = the dataset page (`DATASET_URL`), because a list row has no page of its own.
- Detail: `detailCommon2` + `detailIntro2` (eventplace, playtime, usetimefestival, agelimit, spendtimefestival,
  bookingplace, sponsor1/2, program); homepage from `homepage` / `eventhomepage`.

**ONGIL**

- `data-source.js`: `createTourFestivalSource` — up to 3 pages × 20; `detail(contentId)` (digits only).
- `enjoy-contracts.js`: `fromTourEvent`, `EVENT_PERIODS`, `inEventPeriod`, `isEnded`; `contentId` kept on EVENT.
- `enjoy-view.js`: target `tour-15`, 전국 option, period filter, 기간 meta, event detail loading / retry.
- `app.js`: `sources.event` (observed in 자료 연결 상태 as `tour-event`).

## Tests

- `tests/ongil/enjoy-phase-c.test.mjs` (PC-1 … PC-11) — route, source, contract, date filter, favourites, screen.
- Pinned expectations updated with a BEFORE note: `tests/livon/tourapi.test.mjs` 1 and 29,
  `tests/ongil/enjoy-data.test.mjs` OG-EN-4 / 30 / 50 / B3, `tests/ongil/production-api.test.mjs` API-28 (+ `id`).

## Verification status

| What | Status |
| --- | --- |
| Route, adapter, client, view logic | **Fixtures / stubs only** (`[QA 픽스처]`), all passing |
| Live `searchFestival2` answer (field names, `eventStartDate` semantics, paging) | **NOT VERIFIED** — needs the key (preview deployment) |
| Live 세종 36110 / 광주·전남 12 for festivals | **NOT VERIFIED** |
| Live `detailIntro2` festival fields, `eventhomepage` | **NOT VERIFIED** |
| Production | **Not deployed**; Phase B is not in production either |

Live check (when a preview with `TOURAPI_SERVICE_KEY` exists): `GET /api/livon/data?provider=kr-tourapi&type=15`,
then `&region=세종`, `&region=광주·전남`, and one `&id=<contentid>&type=15`. Expect 200 with `items[].type === 'event'`
and `schedule.startAt` on or after today's start window.
