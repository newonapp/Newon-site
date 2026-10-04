# LIVON Content Quality V1

An audit of the 530 curated LIVON records, the fixes made, and the tool that keeps the audit repeatable.
Baseline: `75bd82eff` · branch `livon-content-quality-v1`.

```
node scripts/livon-content-quality.mjs                    # summary: TOTAL / PASS / NEEDS REVIEW / POOR + issue counts
node scripts/livon-content-quality.mjs --json report.json # full per-record report (do not commit)
node --test tests/livon/content-quality.test.mjs          # CQ-1 … CQ-25
```

The evaluator itself lives in `livon/data/livon-content-quality.js`. The CLI and the local Data Manager (`docs/livon/LIVON_DATA_MANAGER.md`) run that one implementation, so there is no second copy of the rules.

The script loads the data files, the Data Platform, the screen bridge and the search index the same way the browser
does, and makes no network requests. The quality score is internal only: nothing in `livon/` reads it, and CQ-25
checks this.

## 1. Inventory (530 = curated total)

| Type | Count | Records |
|---|---|---|
| lifeStage | 7 | `stage:10` … `stage:70` |
| lifeEvent | 34 | `le:*` (20 guides + 14 planned) |
| content | 259 | 228 `topic:*` + 31 Today guides/editorials |
| policy | 17 | `pol:*` official portals |
| service | 143 | 38 `svc:*` service types · 99 `tool:*` stage tool cards · 6 Explore services |
| place | 10 | Today places + Explore places |
| class | 4 | Today experience/learn |
| program | 9 | Explore programs |
| provider | 21 | 2 Explore institution cards + 19 `prov:*` derived from Explore providers |
| communityContent | 26 | 21 `cm:*` groups + 5 `ch:*` challenges |

Where each record is used:

| Screen | Records |
|---|---|
| HOME | 49 |
| TODAY | 34 |
| LIFE STAGE | 423 |
| EXPLORE | 28 |
| SEARCH | 379 |
| MY LIFE (saveable) | 345 |
| DETAIL | 461 |
| COMMUNITY | 26 |

**Orphans: 0.** The `prov:*` rows have no screen of their own. They are still referenced, because every Explore card
points to its provider through `providerId`, and they are used for provider lookup and dedupe. They were not deleted.

Every record lists these fields: `id, type, title, summary, category, ageGroup, lifeStage, lifeEvent, tags, keywords
(domains), source {name, type, class, verification}, urls, relations, cta, dates, screens, score, grade, flags`.

## 2. Score and flags (deterministic, internal)

| Part | Points | Rule |
|---|---|---|
| Title | 10 | present · 2–30 characters |
| Summary | 45 | present 10 · 16–100 characters 5 · informative 25 · unique 5 |
| Source | 15 | factual types need an official link or a traceable source · well-formed URL |
| Search metadata | 10 | category/domains 5 · tags 5 |
| Relations | 10 | no broken relation 3 · guide-type record has at least one relation 7 |
| Dates | 10 | time-bound rows without an official date get 5 |

Penalties: −5 each for an unsourced amount, a time-sensitive claim, or a stale check.

Grades: 90–100 Excellent · 75–89 Good · 60–74 Needs Review · <60 Poor. General (all-age) content is never penalised
for having no age.

Flags (only the ones needed):

| Flag | Meaning |
|---|---|
| `MISSING_SUMMARY` | No summary. |
| `PLACEHOLDER_SUMMARY` | Placeholder text instead of a description. |
| `WEAK_SUMMARY` | Restates the title ("X입니다."), or eligibility text used as a summary. |
| `DUPLICATE_SUMMARY` | Same summary as another record. |
| `TITLE_LENGTH` | Title outside 2–30 characters. |
| `MISSING_SOURCE` | Factual record with no traceable source. |
| `INVALID_URL` | Malformed URL or route. |
| `MISSING_RELATION` | Guide-type record with no relations. |
| `BROKEN_RELATION` | Missing target, self-reference, or repeated id. |
| `TOO_MANY_RELATIONS` | More than 12 in one list. Tool cards and service types are counted separately because they render as separate lists. |
| `DATE_VERIFICATION_REQUIRED` | Time-bound record with no official date. |
| `STALE_REVIEW_REQUIRED` | Past its freshness window. |
| `DUPLICATE_CANDIDATE` | Shares a title or URL with another record. |
| `WEAK_SEARCH_METADATA` | No category and no tags. |
| `UNSOURCED_SPECIFIC` | States an amount with no official link. |
| `TIME_SENSITIVE_CLAIM` | A year, or "현재 운영/모집/신청 중", stated as fact. |
| `FIELD_CONFLICT` | Added in Data Manager V1: two fields of one record disagree, e.g. a budget amount next to "프로그램별 상이". Currently td:place-mmca and td:exp-pottery. Never auto-corrected. |
| `ORPHAN` | Not shown anywhere and not referenced. |

## 3. Before → after

| | Before (75bd82eff) | After |
|---|---|---|
| PASS (Excellent + Good) | 435 | **530** |
| NEEDS REVIEW | 92 | 0 |
| POOR | 3 | 0 |
| Average score | 93.5 | 99.6 |
| WEAK_SUMMARY | 81 | 0 |
| PLACEHOLDER_SUMMARY | 14 | 0 |
| DUPLICATE_SUMMARY | 18 | 0 |
| WEAK_SEARCH_METADATA | 26 | 0 |
| MISSING_RELATION | 20 | 4 (intentional, see §5) |
| MISSING_SOURCE | 1 | 0 |
| DATE_VERIFICATION_REQUIRED | 30 | 30 (flagged, never guessed) |
| UNSOURCED_SPECIFIC | 8 | 8 (manual review) |
| DUPLICATE_CANDIDATE | 97 | 97 (all kept, with reasons) |
| Search: zero-result queries (of 66) | 5 | 0 |
| Search: relevant results in top 5 (average) | 3.82 | 4.38 |
| Records tagged with a Life Event | 50 | 87 |
| Life Events linked to guides | 17 | 30 |

## 4. What was fixed

These changes are content and metadata only. IDs, routes, CSS and markup are unchanged.

| Area | Change |
|---|---|
| Life Events (`life-events-data.js`) | The 14 planned events shared one placeholder ("확장 예정 Life Event입니다 …"). Each now says what the event is and what to prepare, within the old length. The `planned` flag and the UI badge stay as they were. |
| Tool cards (`life-data.js`) | 59 descriptions only restated the name ("건강 정보입니다.", "디지털 교육입니다."). They were rewritten as who/what/what-to-do lines of 28 characters or fewer (the existing card maximum). Two pairs of identical descriptions are now distinct. |
| Official portals (`life-topics.json`) | The 17 portals used their eligibility text as the summary ("전 연령"). Each now has a `summary` that says what the portal is and what you can do there. `target` (대상), `conditions` and `period` are untouched, and the portal card still shows them. Search results use the summary. |
| Service types | `relatedContentIds` are now mapped into Data Platform relations (e.g. `svc:public-docs → td:life-public`). `svc:internet` gained its one clear link (`td:td-moving-checklist`, which contains 인터넷 이전). |
| Life Event relations | 17 events gained curated `topicIds` (53 links). Each link was chosen by hand and overlaps the event's life stages. The platform writes the back-link onto the topic (`lifeEvents`) and merges it with the existing title inference (`meta.topicLinks = curated / curated+inferred / inferred`). No UI renders these yet. |
| Derived providers | The summary is now "LIVON 탐색의 ‘…’ 안내를 제공하는 기관입니다 …" instead of "X 공식 안내". Category, tags and domains come from the card. The Ongil provider keeps its internal URL, so its source is traceable (D). |
| Canonical categories | Tool categories are now Korean (가이드 / 도구 / 전문가·기관 / 활동·콘텐츠), matching `service-details-data.js`. Portals are 공식 포털. Community rows use their interest. Stage tags come from each stage's focus words. UI filter ids (Explore categories, Today types) are unchanged. |
| Dates | Every time-bound row (policy/program/class/event) without an official date gets `meta.requiresDateVerification = true`. That is 30 rows: 17 portals, 7 Today classes/learning guides and 6 Explore programs. No date was added. |
| Search (`explore-search.js`) | Added two-way pairs (취업/구직, 창업/사업, 집/주거, 육아/양육, 노후/은퇴) and everyday phrasings (키우기, 배우고/배우기, 우울, 치매, 요양, 요리, 청약) in a separate `ALIAS` table, so the suggestion chips are unchanged. An alias match ranks below any direct match of the word, so "청약" still puts 마이홈 first. Filler words (싶어, 알려줘, 방법 …) are dropped when another word remains. The Data Platform `SYNONYMS` table has the same pairs. |
| Cache | Script and JSON `?v=` values were bumped to `20261001cq1`. |

## 5. What was checked and kept

| Check | Result |
|---|---|
| Titles | 2–29 characters. No spelling errors found. Official names are not renamed and no `displayTitle` was needed. The longest are 5 Today editorial titles (22–29 characters), which fit their cards. |
| Fabrication | No amounts, hours, phones, dates or eligibility were added. The rewritten text contains no digits (CQ-7). Existing specifics carry an official link: 국립중앙도서관 반포대로 201 · 서울도서관 세종대로 110 · "변동 가능" hours. |
| Duplicates | 43 groups / 97 records. Nothing merged, because merging would break saved ids. Every group has a reason, in 6 classes: AGE_VARIANT (9), DIFFERENT_ROLE svc↔tool/topic (7), LIFE_EVENT_VS_GUIDE (3), DERIVED_PROVIDER (20), SAME_OFFICIAL_PORTAL portal↔card↔guide (3), GUIDE_VS_PORTAL (1). |
| Related ids | 0 missing, 0 self-references, 0 repeated ids, 0 lists over 12. There are 54 one-way topic→topic links; they are intentional (a broad topic points to a narrower one) and were not made two-way. |
| Life Stage matrix | Each of the 7 stages has 28–38 topics. Every topic links services and most link policies. Places and classes are sparse by design (few curated places). |
| Life Events without links | `freelance`, `car`, `abroad` and `long-trip` have no matching guide, so no link was forced. They are listed as content gaps. |
| ageGroup | Portals, Explore and Today rows stay general (not age-restricted). No official age range was guessed (`targetAges` stays null). |
| CTA | No "신청하기" CTA without an official page. The only "신청하기" strings are the user's own checklist items. Tool CTAs are 12 characters or fewer. |
| URLs | 659 URLs/routes pass the format check (https, host, no spaces, valid internal routes). **HTTP status was not checked**, because this environment blocks outbound requests to these hosts. |
| Provenance | A LIVON guide 463 · B government (.go.kr / gov.kr) 44 · C public institution 21 · D Newon service 2 · E other 0. |
| Time wording | 올해/현재/최근/지금/이번 달/이번 주/최신 appear 90 times. All of them are relative instructions ("올해 검진 대상인지 확인하기", "최신 공고를 확인하세요"), not claims about the world. There are 0 year-specific or "현재 운영/모집/신청 중" claims. |
| Detail completeness | Every record with a detail page has a title, a type and a summary. |

## 6. Search test set and recommendation scenarios

`SEARCH_SET` holds 66 queries, each with a pattern for what a relevant top-5 result looks like.

- **Before:** 5 queries had zero results (아이 키우기, 배우고 싶어, 우울, 치매, 요리) and 5 were weak (양육, 배우기, 청약, 요양, 프리랜서).
- **After:** 0 queries have zero results. One is weak, 프리랜서, because only its Life Event exists (a content gap). The relevant-in-top-5 average went from 3.82 to 4.38.

`SCENARIOS` holds 9 cases that use only age, life event and interest. Returned count, all relevant:

| Scenario | Before | After |
|---|---|---|
| 10대 학생 | 1 | 3 |
| 20대 취업 | 2 | 5 |
| 20대 독립 | 5 | 5 |
| 30대 창업 | 4 | 4 |
| 30대 육아 | 4 | 4 |
| 40대 자산/가족 | 8/10 relevant | 10/10 |
| 50대 재취업 | 1 | 4 |
| 60대 은퇴 | 4 | 4 |
| 70대+ 생활 | 10 | 10 |

No scenario returns an item for the wrong age.

## 7. Manual review (not changed automatically)

1. **Today budget buckets without an official link (8).** These are 3만~5만 원 / 1만~3만 원 estimates on exp-pottery, exp-baking, together-*, season-summer/autumn/winter. They drive the budget filter, so they were kept. An editor should confirm or relabel them as estimates.
2. **`td:place-mmca`.** The budget "1만~3만 원" and the price text "전시·프로그램별 상이" do not agree.
3. **`pol:pol-kordi` target "만 60세 이상 등".** Confirm against the current 한국노인인력개발원 announcement.
4. **The 30 `requiresDateVerification` rows.** They are portals and evergreen guides. If a dated program is ever written into one, add the official date.
5. **Generic tool CTAs.** "정보 보기" (21) and "둘러보기" (26) could be unified or made specific. They were left alone to avoid UI text churn.
6. **Display category labels with near-duplicates.** Examples: 대학/입시 vs 대학/교육, 건강 vs 건강관리, 부모 돌봄 vs 부모/가족 돌봄. Filtering uses the 9 domains, so these are cosmetic.
7. **Content gaps.** Freelancing, car purchase, living abroad, long trips, dementia-specific care and cooking.
8. **`ex:ex-childcare` in the 70대 interest scenario.** Its "돌봄" tag means childcare. Consider a more specific tag.
