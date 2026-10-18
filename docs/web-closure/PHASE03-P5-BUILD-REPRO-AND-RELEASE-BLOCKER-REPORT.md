# NEWON WEBSITE PHASE 03 P5 BUILD REPRODUCIBILITY AND RELEASE BLOCKER REPORT

Branch `work/phase03-p5-build-repro` (local only, created from `abe3ab2`). Date 2026-10-17. Status words: PASS / FAIL / SKIP / NOT RUN / NOT VERIFIED. No push, merge, deploy, page deletion or redirect was done. No app repo, API, DB, user data or backup was touched.

## A. Exact cause of the 207 build-versus-committed mismatches

Details and table: `PHASE03-P5-BUILD-DRIFT.md`. Summary:

- A clean build is **deterministic** (two independent builds identical apart from timestamps). A second build in the same tree is **not idempotent** (48 in-place patch scripts rewrite tracked templates and locales: blank-line growth, `closingFoot` toggling).
- One clean build changes about 622 tracked files: 414 whitespace-only, 208 content (= the 207 + `admin/data.json` timestamp).
- The 207: delete-account 84 (12 apps × 7 languages), portfolio 91, home flyout 7, `locales/_sp.*.json` 7, sitemap `<lastmod>` 1, and 17 stale `20260923pad1` cache-bust pages (`business/index`, `studio/index`).
- **Why the non-English text differs:** the committed German/other-language strings exist only in generated HTML; no tracked template, locale or pack produces them. They came from `scripts/.translate-cache.json`, a **gitignored, machine-local** MT cache that `apply-translate-cache.mjs` reads. CI builds from a clean checkout without it, so the deployed site carries English there. Commit `aa576326` documents the same known problem. Who held the cache is an inference, not provable from the repo.
- **Canonical source: not established.** Per instruction, committed non-English text was not overwritten with English or Korean. Owner decision (G-1).
- Safe fixes made: the 17 stale cache-bust pages and the other stale generated Business/Studio pages were synced (below); sitemap date and timestamps are masked, not committed.
- **Guard added:** `npm run check:build-drift` (`scripts/qa-build-drift.mjs`) + `build-drift-baseline.json` (189 files). Fails on a new drifted file, a changed hash, or an unexpected new file. Result: clean build then check = **PASS** (189/189); tampering with `ko/index.html` / `ja/portfolio/index.html` = **FAIL** (correctly); second build in same tree = FAIL (expected, documented). Not wired into CI (NOT DONE; needs a git work tree and a workflow edit).

## B. Base commit versus P4 impact

`6be1475` has 663 drifted files (299 content) versus P4 (`abe3ab2`) 208 content. The base set is a superset. **P4 added no drift** and removed some (91 stale pages fixed). P5 reduces the baseline to 189 files, all in the non-derivable families above.

## C. Modified files and local commit

Commit hash: reported in the reply (a file cannot contain its own hash). `abe3ab2`, `6be1475` and the other branches are unchanged (checked after commit).

- Scripts: `business-model-sanitize.mjs` (timeline/price rows in 6 more languages; guard against re-sanitizing reframed pages; **JSON-LD fix**, see E), `business-model-reframe.mjs` (build/solutions hub rewrite, CTA rewrite that preserves button attributes, hub meta/JSON-LD description, ko/en wording), `render-business-services.mjs` (flow-stage list semantics), `ci/fast-check.mjs` (lang-mix step); new `qa-build-drift.mjs`, `qa-lang-mix.mjs`; `package.json` (`check:build-drift`).
- CSS: `business-service.css` (dark flow-stage number alpha 0.55 → 0.68). Cache-bust unchanged from `20261017p4a`.
- Pages: 265 generated Business/Studio pages (203 business + 55 studio from the generator fixes, plus 8 JSON-LD repairs, plus the flow-stage markup). No LIVON/ONGIL file and no other page changed.
- Docs: this report, `PHASE03-P5-BUILD-DRIFT.md`, `PHASE03-P5-CD-PAGE-CENSUS.md`, `PHASE03-P5-ARIA-HIDDEN-CENSUS.md`, update to `PHASE03-P4-SERVICE-JSONLD-ANALYSIS.md`, `build-drift-baseline.json`, `qa-artifacts/phase03-p5/`.

### Part B detail: `business/build` and `business/solutions` (items 11–17)

- ko/en: hero lead, price/timeline rows, offer CTAs ("START A PROJECT", "Talk automation"), "when to use" and FAQ sections of the two hubs removed or reworded to partnership-inquiry framing; meta/og/twitter/JSON-LD descriptions replaced by the localized capability notice. Only confirmed products/areas are named; nothing new was invented.
- Other 7 languages: hero lead dropped, CTA labels in English with `lang="en"`, notice present. **H1 and taglines still carry the old offer-like translations** (e.g. de H1 "Wir machen aus Ideen …"): they need native translation, not machine edits. Unresolved.
- The Solutions four-type taxonomy (WHITE-LABEL / CUSTOM / LAUNCH / INTERNAL) is unchanged: it is a business-model statement. Recommendation: merge into or redirect to a hub after the owner decides. Owner decision.
- Remaining "we design and build" capability sentences on other B pages (ko 180, en 50 per the P4 audit) and the CARE tagline / "유지보수 문의" CTA: unchanged, owner decision (`PHASE03-P4-B-TYPE-AUDIT.md`).

## D. Test results

| Check | Result |
|---|---|
| `node scripts/publish-site.mjs` on a clean copy of the final tree (build, verify, fast-check) | **PASS** (rc 0) |
| `fast-check`: Pricing QA 0/0, Footer sync 1334 pages 0 errors, Business i18n 666 pages / 432 notices / 92,518 links 0 unresolved / 0 errors, lang-mix 666 pages, 0 missing, 0 bad `<html lang>` | **PASS** |
| `check:fast` in the repo | **PASS** |
| Build-drift guard (clean build) / tamper / second build | PASS / FAIL as intended / FAIL as expected (A) |
| JSON-LD, 9 languages | 504 blocks, 108 Service, **0 unparseable** (8 before) |
| LIVON suites (50 files, in the repo) | 46 files rc 0; 4 files with 5 failing tests (below). `life-stage-v2` 33/0, `accessibility` 76/0 |
| ONGIL suites (35 files) | all rc 0 |
| Contrast scan, own computed-style script, transitions disabled, real theme key `newon-app-theme`, 59 Business/Studio paths | ko/en light+dark at 390 and 1440 px; ja, es, pt-br, fr, de, hi, id light+dark at 390 px: **0 failures on text exposed to assistive technology** in every configuration. Failures remain only inside `aria-hidden` decoration (class A/B census). |
| LIVON/ONGIL 시작하기 buttons and web features | no LIVON/ONGIL file changed; suites above PASS |

### The 6 earlier failures (item 28–29), compared on `6be1475` and `abe3ab2` and the final tree

The same 5 failing tests occur on the base, P4 and the final tree. **None is caused by P4 or P5.**

| Test | Cause (evidence) | Class |
|---|---|---|
| CV2-60, RC-1 | `git diff-tree <sha>^` / "commit … is in this repository": the source clone is **shallow**, so history checks cannot resolve | environment (history). NOT VERIFIED in a full clone |
| ON-35 | `1.9999999999999998 !== 2`, floating-point equality | existing test/code defect |
| DM-11, RC-14 | 13 records flagged `STALE_REVIEW_REQUIRED` / `stale` (ex-allilearn, ex-hrdkorea, … learn-kmooc) | date-dependent data review; the curated records are past their review window as of 2026-10-17 |
| accessibility timeout | passes 76/0 in all 3 trees when run alone | load, not a defect |

P4 had reported RC-1 passing once in isolation; in P5 it failed in all three trees, so it is classed as history-dependent, not flaky. No expectation was changed.

## E. Remaining translation, accessibility and SEO risk

- **Translation:** ja, es, pt-br, fr, de, hi, id still show English body lines on 46–55 of 74 pages (727–1,077 lines each; ko 2 lines, 2 pages); 18 lines per language are explicitly marked `lang="en"`. The 7-language notices are my drafts (`data-bm-l10n="draft"`), not native-reviewed. Hub H1/taglines in those languages are not rewritten.
- **Accessibility:** fixed — stage order of the flow grid is now announced (`role=list/listitem`; an attempt to expose the ghost numeral was reverted after the scan showed 223 failures). Open — class B mock-UI blocks (`PHASE03-P5-ARIA-HIDDEN-CENSUS.md`). Limits: contrast measured only on solid backgrounds (not images/gradients); axe not available; 7 languages scanned at 390 px, not 1440 px; no screen-reader run.
- **SEO:** build/solutions descriptions changed (all languages); titles and `@type` unchanged; display effect NOT VERIFIED. 8 broken JSON-LD blocks repaired. `@type: Service` on informational pages and `areaServed: Worldwide` remain owner decisions. Search inflow per URL NOT VERIFIED.

## F. C/D page recommendation

`PHASE03-P5-CD-PAGE-CENSUS.md`. 33 pages: 15 are already meta-refresh stubs, 18 real pages (+2 reworded hubs). Each business C page has about 24–29 inbound internal pages; content overlap with candidate redirect targets is about 0, so redirecting discards unique text; GitHub Pages allows only a soft meta-refresh redirect; D-stub → C-page chains already exist. **Recommend staged: keep now; collect 90 days of search data; `noindex` plus nav/sitemap removal for pages without inflow; redirect only after an owner mapping and collapsing chains; no deletion.** Nothing was executed.

## G. Work remaining to an actual deploy

1. Owner: canonical source for the non-English text behind the 207 (vendor reviewed translations into tracked files, or accept English). Until then, never rebuild-and-commit without running the guard.
2. Native review of 7-language notices, labels and hub H1/taglines; translation of the English body lines.
3. Owner: remaining capability wording, Solutions taxonomy, CARE tagline/CTA, Service JSON-LD proposals P-1/P-3/P-5.
4. Owner: C/D disposition with search data.
5. Wire `check:build-drift` into the CI workflow (needs a workflow edit; not done here).
6. Existing test failures: full (non-shallow) clone run for CV2-60/RC-1; fix ON-35 float compare; review the 13 stale LIVON records for DM-11/RC-14.
7. Class B aria-hidden judgment; screen-reader pass.
8. Deploy must ship pages and CSS together (cache-bust `20261017p4a`).

## H. Maximum safe scope of the next step

Safe without owner input, in an isolated branch: wire the drift guard into CI (workflow file only, no deploy); fix ON-35's comparison with a tolerance after confirming whether code or test is wrong; re-run CV2-60/RC-1 in a full clone; vendor translations **only after** the owner approves a source. Not safe without a decision: any C/D redirect, deletion or `noindex`, Solutions taxonomy changes, and any overwrite of committed non-English text.
