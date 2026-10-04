# LIVON Data Manager V1 (local only)

A local tool for searching, inspecting, filtering and checking the 530 curated LIVON records in one place,
without opening the data files by hand.

It is **not** the Production Admin. There is no login, server, database, API or Vercel, and it is **read-only**.

- Branch `livon-data-manager-v1`, built on Content Quality V1 (`ce95d33ce`).

```
node scripts/livon-data-manager.mjs      # → http://127.0.0.1:8790/livon/admin/data/
node --test tests/livon/data-manager.test.mjs   # DM-1 … DM-30
```

## 1. Purpose

- Data inspection, QA and debugging for the curated catalogue (Life Stage topics, Life Events, portals, services, tools,
  Today, Explore, providers, community).
- Every number is computed at load from the same scripts the site uses. No count is hard-coded.
- Nothing is edited. Facts that look wrong go to the **Review Queue**; they are never corrected automatically.

## 2. Architecture

```
livon/admin/data/index.html            page shell (noindex), loads the two tool scripts only
livon/admin/data/data-manager.js       UI: guard → loads LIVON data scripts → builds the model → renders views
livon/admin/data/data-manager-core.js  core (no DOM): model, filters, queue, relations, gaps, export, review state
livon/admin/data/data-manager.css      tool styles (not used by LIVON)
livon/data/livon-content-quality.js    the quality evaluator, shared with scripts/livon-content-quality.mjs
scripts/livon-data-manager.mjs         127.0.0.1-only static server (GET/HEAD only)
```

**Single source of truth.** The Content Quality rules (flags, score, duplicates, provenance, search set and
scenarios) moved from `scripts/livon-content-quality.mjs` into `livon/data/livon-content-quality.js`.

- The Node CLI runs that file in the same vm context as the browser scripts (`loadLivon`).
- The Data Manager runs it in the browser.
- The CLI output is unchanged, and CQ-1…CQ-25 still pass.

**Load order in the tool:**

1. The data files: `life-data`, `life-events-data`, `explore-data`, `community-data`, `today-data`.
2. The Data Platform: `livon-data-config`, `livon-data-schema`, `livon-data-platform`, `livon-screen-data`.
3. `life-hub` (fetches `life-topics.json`).
4. `explore-search` and `livon-content-quality`.
5. The tool builds `LivonDataManager.createModel(window)` **once**.

Filters, search and sorting then run on an in-memory index: one pass takes under 1 ms on 530 records, and a model
build takes about 150 ms. Views that need more work (duplicates, taxonomy, queue, coverage) are memoized. The
66-query search set runs only on request.

## 3. Local-only guard

The tool is protected in three separate ways:

- **Not published.** `scripts/publish-site.mjs` deletes `_publish/livon/admin` after copying `livon/` and fails the
  build if it is still there. GitHub Pages and Vercel both deploy `_publish`, so the tool returns 404 in Production.
- **Host guard.** `data-manager.js` checks `location.hostname` before loading any data. Allowed hosts are
  `localhost`, `127.0.0.1`, `::1`, `*.localhost` and `*.test`. On any other host the page shows "Unavailable" and
  requests no data; DM-29 serves the files under `www.newon.app` and verifies this.
- **Not linked.** No LIVON page or navigation links to `/livon/admin/`, and `livon/index.html` loads none of the tool
  code. The page is `noindex` and the local server sends `X-Robots-Tag: noindex`.

There is no client-side password: a password in client code would only look like security.

## 4. Views

| View | What it shows |
|---|---|
| **Dashboard** | Total; counts by type, category, age group, Life Stage, Life Event, source class and source name. Quality: Excellent / Good / Needs Review / Poor and the average. Count per flag. Dates: date verification required, stale review required, expired, undated time-sensitive. Relations: related, missing relation (error), content gap, orphan, broken. |
| **Content Explorer** | All 530 records, 50 per page. Search over id, title, summary, description, tags, domains and source. Filters: Type, Category, Age, Life Stage, Life Event, Source class, Source type, Quality level, Quality flag, Priority, Date verification, Has relations, Has official URL, Freshness, Screen. Sort by ID, Title, Type, Score, Updated or Flag count, ascending or descending. The current filter can be exported. |
| **Record Inspector** | A dialog with every field (see §5), which screens show the record, relations with a status on each link, which records link to it, its queue items, and a local review mark. |
| **Quality Review** | Quality-level buttons and a flag table with counts. The manual-review flags (UNSOURCED_SPECIFIC, FIELD_CONFLICT, DATE_VERIFICATION_REQUIRED, MISSING_RELATION, DUPLICATE_CANDIDATE) are highlighted. The screen states that the score is data-completeness QA, not a user rating. |
| **Review Queue** | Only what a person has to check, by deterministic priority (§6). |
| **Duplicates** | 43 groups covering the 97 candidates. Each group shows its members (id, title, type, age, category, URL), the similarity basis (same title / same official URL) and the reason it is kept. It has a local **KEEP / REVIEW** mark; nothing is merged or deleted. |
| **Relations** | Broken, self or duplicate relations (currently 0). Life Event → stages → topics, with status linked or CONTENT GAP. Life Stage × related-kind matrix. Each topic → Policy / Program / Service / Place / Guide / Topic, filterable by stage. |
| **Content Gaps** | See §7. |
| **Sources** | Classes A LIVON-written · B Government · C Public institution · D Newon · E Other. Each shows record count, official count and missing source, with every source name, its count and its URLs. |
| **Unsourced / Conflicts** | The 8 Today budget estimates and the 2 field conflicts. Each shows the record, claim, field, current value, the other field, source, flags and reason. **CONFLICT** is computed (§8), never fixed. |
| **Date Review** | The 30 `DATE_VERIFICATION_REQUIRED` rows: type, kind (policy / program / class / event / application / other), current dates, source, official URL and reason. No date is ever generated. |
| **Freshness** | Reuses the Real Data Integration freshness windows: fresh / stale / expired / unknown, overall and by type. Editorial guides with no check date are `unknown` by design. |
| **Search Tester** | Runs the live `LivonSearch` engine (read-only) and shows rank, title, type, score and why each result matched. The reasons are direct field, synonym, alias (ranks below direct matches), or "linked from a strong match". Dropped filler words are shown. |
| **66 Search Queries** | The Content Quality test set, run on demand: PASS / WEAK / ZERO RESULT. Currently 65 PASS, and 프리랜서 is WEAK (a content gap). |
| **Recommendation Tester** | Inputs: age (converted to a stage), Life Stage, Life Event and interests. Shows rank, title, type, score and reasons from the rule-based engine. No personal data is used. |
| **Taxonomy** | Every display category with records, types, screens and related categories, plus near-duplicate label pairs marked **TAXONOMY REVIEW** (e.g. 대학/입시 · 대학/교육, 건강 · 건강관리). Domain counts are included. Nothing is merged. |
| **CTA** | Every CTA label with its count. `(screen default)` means the screen renders its own button. The generic labels 정보 보기 (21) and 둘러보기 (26) are marked **CTA REVIEW**. "신청하기" without an official page: 0. |
| **Screen Coverage** | A matrix of records × HOME / TODAY / LIFE STAGE / EXPLORE / SEARCH / MY LIFE / DETAIL / COMMUNITY. Filters: only one screen, no screen, not searchable, no detail, no My Life. |
| **Export** | See §9. |

## 5. Record Inspector fields

The inspector shows ID, Title, Summary, Description, Type, Category, Tags, Keywords (domains), Age, Life Stage and
Life Event. It also shows Source (class · name · type · verification), Source URL, Official URL, Route, CTA, Dates
(with `requiresDateVerification`), Freshness and hidden reason. Finally, it shows Quality score and grade, Flags and
notes, Relations with a status on each link (ok / broken / self / duplicate / external-tool), Referenced by, Review
queue items, and "Where this record is shown" (§4 screens).

## 6. Review Queue (deterministic)

| Priority | Rule |
|---|---|
| **P0** broken / invalid | BROKEN_RELATION, INVALID_URL, MISSING_SOURCE, MISSING_SUMMARY, ORPHAN |
| **P1** unsourced or conflicting factual claim | UNSOURCED_SPECIFIC, FIELD_CONFLICT, TIME_SENSITIVE_CLAIM |
| **P2** dates | DATE_VERIFICATION_REQUIRED, STALE_REVIEW_REQUIRED |
| **P3** missing relation / weak content | MISSING_RELATION (shown as **CONTENT_GAP** when no guide exists), TOO_MANY_RELATIONS, PLACEHOLDER/WEAK/DUPLICATE_SUMMARY, WEAK_SEARCH_METADATA, TITLE_LENGTH |
| **P4** cleanup | DUPLICATE_CANDIDATE, TAXONOMY_REVIEW (near-duplicate labels), CTA_REVIEW (generic CTA labels) |

Current counts: **P0 0** · P1 10 (8 unsourced + 2 conflicts) · P2 30 · P3 4 (content gaps) · P4 183 (97 duplicates +
39 taxonomy pairs + 47 generic CTAs). Items are sorted by priority, then rule, then record. DM-11 checks that a broken
relation moves an item to P0.

## 7. Content gaps

A **content gap** is not an error: the taxonomy has a slot with no content in it. Gaps are reported only, and no
content is generated. There are four checks:

1. **Life Events with no matching guide:** 프리랜서, 차량 구매, 해외생활 and 장기여행. They are shown as CONTENT GAP,
   not as a missing relation, and no relation was invented.
2. **Subjects with no record at all**, checked with fixed term lists across the catalogue: freelancing, car purchase,
   living abroad and dementia-specific care. Long trips (장기 여행) and cooking (요리) have at least one mention, so
   they are thin rather than absent.
3. **Life Stage × domain cells with no topic** (from the 9 domains). Examples: 10대 × local, 10대 × senior,
   20대 × senior, 30대 × local, 40대 × local and 70대 × career.
4. **Explore categories with no item.** There are currently none.

## 8. Unsourced specifics and conflicts

`UNSOURCED_SPECIFIC` covers the 8 Today budget estimates that have no official link.

`FIELD_CONFLICT` is a new flag in the shared evaluator. It is raised when a record's budget states an amount while its
price text says "상이/변동/별도" with no amount, or when the budget says 무료 while the price has an amount.

- It currently fires on `td:place-mmca` (budget 1만~3만 원 vs price 전시·프로그램별 상이) and `td:exp-pottery`.
- It costs −5 points; both records still PASS.
- The values are shown as they are and are never corrected.

## 9. Export

These exports are read-only and are downloaded to the local computer only:

- **All records**: JSON or CSV.
- **The current Explorer filter**: JSON or CSV.
- **The full quality report**: the same evaluator as `livon-content-quality.mjs --json`.
- **The reviewer's own review marks**: JSON.

Only the whitelisted content fields in `EXPORT_FIELDS` are written, so there are no keys, tokens, storage or
internal fields. CSV is UTF-8 with a BOM, quoted, and protected against formula injection (a leading `=+-@` gets a
`'` prefix). DM-28 feeds poisoned records to the export and checks that nothing leaks.

## 10. Local review state

The review marks are: record `reviewed` / `needs-review`, and duplicate group `keep` / `review`.

- They are stored in `localStorage` under `livon.dataManager.review.v1` and nowhere else. Unknown values are refused.
- If storage is blocked or full, the tool falls back to memory (DM-26) and says so on the Export view.
- Marks never change a curated file or the repository. DM-27 hashes the six data files and snapshots every entity
  before and after running every tool function.

## 11. Recommendation fix (ex-childcare / 70대)

**Cause.** For all-age rows, the rule-based `getRecommendations` scored interests by tag. `ex:ex-childcare` (아이사랑
보육 포털) has no life stage and carries the tag 돌봄, so a 70대 context with interest 돌봄 recommended a childcare
portal.

**Fix** (`livon-data-platform.js`, recommendations only). When a stage is requested, an all-age row whose own
**category** is a Life Event category (`CATEGORY_LIFE_EVENTS`: 육아, 보육, 창업, 은퇴 …) is kept only if that Life
Event's stages (from the Life Event catalogue) include the requested stage. 육아 maps to the Life Event 육아, which
covers 20·30·40대.

Unchanged:

- Tags and search.
- Rows with their own stages.
- Requests without a stage.
- General portals such as 복지로, which has the same 돌봄 tag and category 복지.

Each recommendation now also returns `reasons` (stage, interest, verified, region), which the tester displays. No
consumer screen calls `getRecommendations` today. DM-19 is the regression test.

## 12. Future Admin integration (LIVON ADMIN LOCAL V1)

These parts can be reused as they are:

- The core (`data-manager-core.js`): model, filters, sort, pagination, inspector data, queue rules, relation, gap,
  source, date and freshness analysis, and export.
- The shared quality evaluator.
- The local guard and the publish exclusion.
- The review-state store interface (replaceable by a server store).
- The search explain API (`LivonSearch.explain`) and the recommendation reasons.

The Admin will add, and this tool deliberately does not have: authentication, write/CMS flows with validation and
an audit log, partner, reservation and payment management, and an operations dashboard.
