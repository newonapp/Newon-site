# LIVON Explore V2

STATUS = INTEGRATED, NOT DEPLOYED (feature `b6f6500f1` on base `04ee2649c`; merged into production main `28b8a7b66` on branch
`livon-explore-v2-production` — see §6).

## 1. Audit of Explore before V2 (base `04ee2649c`)

| Area | What existed | Kind |
|---|---|---|
| IA | One long screen (`#explore`, ~20,000px): film hero → search (`#ex-home`) → section nav → categories, stages, experts, consult flow, services, local, programs, housing, family, health, career, leisure, senior, commerce, compare, "For you", My Life, CTA. Results (`#ex-results`) and detail (`#ex-detail`) open in place. | REAL (layout) |
| Categories | `LivonExploreData.categories` (10) for the grid; `LivonSearch.CATS` (12 regex topics) for search filters / quick chips. | STATIC |
| Data | 28 curated items in `explore-data.js` (checkedAt 2026-09-25, 24 with an official URL), served through the LIVON Data Platform (`LivonScreenData.exploreItems()`); search index (`explore-search.js`) adds Life Stage topics, service types and policy portals (`life-topics.json`), Today contents and Life Events; real-data providers (Kakao Local, TourAPI, job training, public tax experts, lifelong classes) add entries only when the server says they are configured. | STATIC + LOCAL index + REMOTE (configured providers) |
| Search | Local scoring (title > category/tags > description > related), synonyms, autocomplete combobox, recent queries (with an off switch), URL state `#ex-results?q=…&type=…&cat=…&age=…&ex=…&region=…&mode=…&sort=…`. Public Community posts of this device are searched (drafts / private / members / deleted are not). | REAL / LOCAL |
| Filters | Type tabs (with counts), 분야, 연령대, 지역, 방식, 방문 서비스, sort (관련도 / 최신). Reset button. Collapsed side panel on phones. | REAL |
| Cards / detail | Card with credential badge, type, region, provider, price label, 상세 / 저장 / 비교. Detail at `#ex-item-{id}` with focus to the heading, source and check date, official link, compare, AI draft button. | REAL |
| Saved | Card/detail save went through the shared Life Hub save (`life-hub:{type}:ex:{id}`). **But** three keyword "관심 저장" buttons (전문가 찾기 / 지역 서비스 / 생활 상품) and a dead `data-lv-ex-save-id` path wrote a second Explore list (`livon.exSaved`), a platform `ex:` save, **`livon.mlStore.v1.savedExplore`** (the My Life store) and **`livon.mlInterests`**. | REAL + duplicate store (fixed) |
| Life Stage | Stage links to results; "For you" uses the stored stage / interests the person chose, the personalization profile and, if on, recently viewed items. | LOCAL, explicit |
| Today / My Life | No Today/My Life records are read by search. The "For you" block read only interests. The keyword save path wrote into the My Life store (see Saved). | fixed |
| Community / AI | Public posts of this device in search, labelled "커뮤니티 · 이 기기". AI: a button prepares a draft in LIVON AI; nothing is sent until the person sends it there. | LOCAL / opt-in |
| Experts, consult, booking, commerce, map | Copy describes a future marketplace; expert results show an honest empty state; map opens an external map only for items with an address. | PLACEHOLDER (stated as such) / UNIMPLEMENTED |
| States | No-result state with tips; Life Stage data loading / error states; type-specific empty states. **No idle state** (no query, no filter showed "조건에 맞는 결과가 없습니다"). | REAL (idle added) |
| Wording | "인기 · 추천 검색" in the shared search panel (a fixed list, not popularity), "추천 검색어", "맞춤 탐색", "연령대별 추천", "My Life sync", category tiles "N개 확인됨" (counted unverified items). | fixed |
| Accessibility | Combobox, tablist with arrow keys, `role=status` count, focus to detail heading. **59 controls under 44px** on the home screen; focus fell to `<body>` after a filter press (the pressed button was re-rendered). | fixed |
| Robustness | One malformed Explore row (null / no id) threw inside the Data Platform's static adapter and **emptied the whole repository** (Today, Life Stage and Explore). | fixed |
| Cache | Query-string versions per file (`?v=…`), no service worker. | REAL |

## 2. What V2 changes

- **주제별 보기** (`[data-lv-ex-quick]`): the 12 topics of the search index (`LivonSearch.CATS`) plus 정책·지원 / 클래스·교육 / 장소, each with the number of public items in the index right now ("정보 N개"; "준비 중" when 0). Counts come from `LivonSearch.index()` — never Community posts or anything personal — and say so on screen ("많이 본 순서나 인기를 뜻하지 않습니다"). Re-counted when the Life Stage data arrives.
- **공식 기관 정보** (`[data-lv-ex-official]`): Explore items with a verified official https link — title (opens the canonical `#ex-item-{id}`), source, subfield, "LIVON 확인일 YYYY-MM-DD" (the data's `checkedAt`), and a separate "공식 사이트 ↗" link (new window, said to screen readers). States that LIVON is not the agency.
- **적용된 조건**: every active condition (검색어, 유형, 분야, 카테고리, 연령대, 지역, 방식, 방문) is a removable chip above the results, plus "모두 지우기". Works on phones without opening the filter panel. With nothing chosen the results show an idle prompt ("검색어를 입력하거나 주제를 골라 보세요."), not a failure.
- **Focus**: after a filter, tab, sort, "더 보기" or condition press, focus returns to the re-rendered control (or the results heading).
- **One saved store**: Explore saves only through the shared Life Hub saves; keyword "관심 저장" buttons removed; an old cached page's keyword button now opens the matching public results. Explore no longer writes `livon.mlStore.v1`, `livon.mlInterests` or a new `livon.exSaved` entry (the one-time migration of old entries stays). Saves made from Explore/Today cards through the shared button are labelled 탐색 / 오늘의 발견 instead of 라이프 스테이지 (`life-hub.js`).
- **Truthful wording**: "검색어 예시" (Explore autocomplete and the shared header search panel), "내가 고른 기준으로 보기" (states that only chosen interests / stage / region and, if on, recently viewed items are used — no My Life records, not AI), "연령대별 안내", "My Life" (not "sync"), category tiles "정보 N개", detail "LIVON 확인일", "출처: … LIVON은 출처 기관이 아니며 …". External links carry "↗" and "(외부 사이트, 새 창)"; an ONGIL page of this site opens in the same window; any other scheme is not linked.
- **44px targets** for every Explore control (buttons, chips, pills, nav, selects, mini lists, card title buttons, summaries); card images are no longer an extra tab stop.
- **Malformed data**: skipped or normalised in the Data Platform adapter, the search index and `explore-page.js` `items()`.

Not changed: the section structure and visual language, search scoring, real-data providers, compare, Community, LIVON AI, Today, My Life, ONGIL.

## 3. Boundaries (tested in `tests/livon/explore-v2.test.mjs`)

- Explore reads no My Life store (todos, events, routines, records, journal, money, goals, private search) — `EV2-03`, `EV2-18`.
- Community: only public, published posts of this device (labelled "커뮤니티 · 이 기기"); drafts, private, members-only and deleted posts never — `EV2-03`.
- Public search queries stay in the URL (`#ex-results?q=…`) by design (shareable, back/forward); My Life search keeps its query out of the URL. No private record is ever in a URL or a request — `EV2-18`.
- AI: Explore does not call the AI endpoint; the AI button only prepares a draft — `EV2-07`. OpenAI is not activated by this change.
- Account sync / Firebase / cloud backup: not touched; Explore copy says saves stay on this device.
- Life Stage: links to `#life`; a stored stage is used only for ordering "내가 고른 기준으로 보기"; nothing announces "당신은 …" — `EV2-17`.

## 4. Cache

Changed files carry `?v=20261006ex1`: `explore-page.js`, `explore-search.js`, `explore-page.css`, `life-hub.js`, `livon-platform.js`, `data/livon-data-platform.js`. Today stays `today-page.js?v=20261004c7`; ONGIL keeps its own entry version (`app.js?v=20261005h14` at this base, `20261006m15` after ONGIL My Life V2) — Explore V2 does not change it. GitHub Pages caches HTML and scripts for up to 10 minutes and ignores `?v=`, so for a short window a page and a script from different versions can meet:
new page + old `explore-page.js` → works (old script still fills the topic host with plain chips; the official block stays hidden) — `EV2-27`;
old page + new scripts → works (topics fill the old page's quick list; old keyword "관심 저장" buttons open results and write nothing) — `EV2-28`.

## 5. Known limitations

- Experts, booking, payment, commerce and the map remain placeholders (stated on screen).
- Topic counts are counts of public LIVON items, not of real-world services.
- Real Safari / iPhone / Android and a real screen reader were not used.
- Pre-existing, not changed here: Life Stage "인기 질문" heading; Today single-line task rows (32px) and some My Life home row buttons (~23px) under the 44px target.

## 6. Production integration

- `git merge --no-ff` of `livon-explore-v2` into production main `28b8a7b66` (ONGIL My Life V2, `app.js?v=20261006m15`).
  No path overlaps; no ONGIL file changes; the ONGIL module map stays current.
- Hardening: EV2-09 no longer pins ONGIL's entry version (another product's release line moved on to m15); it checks that
  ONGIL keeps a version of its own, that its module map is current and that Explore loads no ONGIL module.
