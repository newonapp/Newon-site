# NEWON WEBSITE PHASE 03 P4 CONTENT I18N QA REPORT

Branch: `work/phase03-p4-content-i18n` (local only, created from `6be1475`). Date: 2026-10-17.
Status words: PASS / FAIL / SKIP / NOT RUN / NOT VERIFIED. No push, merge or deploy was done.

## 0. Baseline and preservation

- Base: `6be1475` on `work/phase03-content-recovery`. P4 work sits in one new local commit above it.
- Unchanged: `6be1475`, `work/phase03-content-recovery`, `work/phase03-qa` (`5a3ed06`), `work/business-hub-integration` (`dd8dd8f`), `work/info-only-app-first` (`b155c27`), `main` (`70a816a`). Checked with `git branch -v` after the commit.
- 74 pages kept. No C/D redirect. LIVON/ONGIL 시작하기 buttons and web features untouched. No new product, price or business model was written.

## 1. Modified files and commit

- Commit hash: see the final line of the git log (reported in the reply; a hash cannot be embedded in the file it belongs to).
- Scripts: `scripts/site-chrome.mjs`, `scripts/build-i18n.mjs`, `scripts/business-model-pages.mjs`, `scripts/business-model-reframe.mjs`, `scripts/business-model-sanitize.mjs`, `scripts/ci/fast-check.mjs`; new `scripts/qa-footer-sync.mjs`, `scripts/qa-business-i18n.mjs`.
- Template: `templates/index.html` (footer nav placeholder).
- CSS: `business-pillar.css`, `business-service.css` (contrast fixes, section 7); cache-bust `?v=20261017dark1` → `20261017p4a` in 731 files (scripts and pages).
- Pages: about 430 Business/Studio pages (notices, B-type wording), 90 hub/games pages and the home pages (footer sync), 16 `de/business/*` pages (stale cache-bust string and blank line synced to build output).
- Docs: this report, `PHASE03-P4-B-TYPE-AUDIT.md`, `PHASE03-P4-SERVICE-JSONLD-ANALYSIS.md`, `PHASE03-P4-ARIA-HIDDEN-CLASSIFICATION.md`, and `qa-artifacts/phase03-p4/`.

## 2. Footer: cause, before and after

**Correction of the earlier report.** `PHASE03-CONTENT-QA-RECOVERY-REPORT.md` blocker #2 said the build regenerates an old footer. That diagnosis was wrong. The 10 committed hub/games pages were stale, and the generator already produced the current footer. The real defects were:

1. `templates/index.html` had the footer links hard-coded, so every home page was built from a stale list.
2. `ensureBrandFooter` in `build-i18n.mjs` returned early when a page already had a brand footer, so an old footer was never replaced.

Fix: one function `renderFooterNavLinks` (in `site-chrome.mjs`) is now the only source of footer links. The template takes `{{FOOTER_NAV_LINKS}}`, and `ensureBrandFooter` replaces an existing footer in place. A guard, `qa-footer-sync.mjs`, runs in `check:fast`.

| Page (ko) | Before (`6be1475`) | After |
|---|---|---|
| home | products, ai, lifestage, ongil, business, studio, about, privacy, terms | products, ai, babylog, petlog, myworld, shareon, lifestage, ongil, business-hub, about, privacy, terms |
| business-hub | already current | unchanged |
| games | old 9-link list | current 12-link list |

Result after a full build: footer sync QA PASS (1334 pages, 0 errors).

## 3. Nine-language verification

`qa-business-i18n.mjs`, run in `check:fast`: 666 pages, 432 notices, 92,518 local links (0 unresolved), 1 header-menu variant across 9 languages, 0 errors. PASS.

- The notices for ja, es, pt-br, fr, de, hi, id are **my own drafts, not native-reviewed**. Each such page carries `data-bm-l10n="draft"`. Native review is a release blocker for those 7 languages.
- Non-ko/en pages mostly reuse English body copy. That is a pre-existing structure; P4 did not translate bodies.

## 4. B-type wording (items 4–6)

Details and counts: `PHASE03-P4-B-TYPE-AUDIT.md`. Fixed by neutralising or deleting, without creating new meaning: project/contract scope wording, "START A PROJECT", "Project consultation", "what you receive when the project completes", three client-implementation sentences, one "keep entrusting" item, six hire/outsource FAQ entries. Only confirmed products and areas are named; no White Label, Automation or Solutions product was invented.

**Unresolved (owner decision, not changed):** capability sentences such as "we design and build" (ko 180, en 50), scope/deliverable spec structure (ko 24, en 15), second-person "your project" (ko 3, en 16), custom wording (ko 2, en 1). The audit file lists options A/B/C. The C/D pages `business/build` and `business/solutions` still describe white-label/custom products, in body text and in their Service JSON-LD; they are held for the redirect decision.

Service structured data: analysis and proposals only, no edit (`PHASE03-P4-SERVICE-JSONLD-ANALYSIS.md`).

## 5. Shared-CSS regression (item 7)

Computed-style diff of `ko` ongil, lifestage, shareon, petlog, babylog, myworld and business-hub, old tree `1aaaf40` against the current repo, light and dark, 1440 and 390 px: DOM counts identical (0 DOM differences). Style differences are 1–55 elements per page. Findings:

- Greys of labels, numbers and footer text moved to higher-contrast values (e.g. rgb(161,161,166) → rgb(110,110,115)). Footer text on these pages is on a white footer in both themes: 5.07:1 PASS.
- In dark mode the `bp-btn--primary` button changed from white text on #111 to dark text on a light fill. It stays legible and present.
- LIVON, ONGIL and the other app pages keep their 시작하기 buttons. PASS.

## 6. aria-hidden (item 9)

`PHASE03-P4-ARIA-HIDDEN-CLASSIFICATION.md`. Class A (decorative or duplicated, exempt): watermark, step numbers with a visible twin, index numerals. Class B (needs a judgment): the unlabelled flow-stage numbers, the "report structure preview" brief on `business/research`, the phone-mock text, mock-UI chips.

## 7. WCAG AA contrast (item 8)

Method: own computed-style script (axe not available), light and dark, text nodes only, 4.5:1 (3:1 large), reveal-animation-hidden elements skipped, text over images and header/footer skipped.

Scan set: ko and en at 1440 and 390 px; ja, es, pt-br, fr, de, hi, id at 1440 px; 59 Business/Studio paths each.

The first P4 scan found **real failures** that earlier scans missed, because it covered more languages and widths. They were fixed:

| Element | Cause | Fix |
|---|---|---|
| `bs-wf-case-steps__n` on the active step (business/automation/workflow) | circle filled with the page colour while the number colour was meant for the row | circle transparent on active/hover rows; number colour set per theme |
| `bp-other__card.is-active` and `bp-cta` on Studio pages in dark | ink fill flips to light while the text stays white (ratio 1.04–1.09) | dark overrides in `business-pillar.css` |
| `bp-shift` "before" panel | white at 32–42% alpha on #111 (2.9:1, 4.1:1) | alpha 0.62 |

After the fix, rescan of the full set (`qa-artifacts/phase03-p4/contrast/`):

- Light, ko+en, all other 7 languages: **0** failing items that are exposed to assistive technology.
- Dark: 4 pages still flagged in the bulk scan (`ko/business/creative`, `ja/business/creative`, `ja/studio/digital/landing`, `hi/business/seller-center`). A steady-state recheck with transitions disabled and the real theme toggle gave **0 failures** on all four. The bulk scan hit them in a mid-reveal state; treat as PASS in steady state, with the transient state NOT VERIFIED.
- All remaining low-contrast items are inside `aria-hidden` (class A/B above), not counted as failures.
- Limit: screenshots were checked for 3 of the fixed states only. The 7 other languages were scanned at 1440 px only, not 390 px. Computed colours were not measured over background images or gradients.

## 8. Tests (item 10)

| Check | Result |
|---|---|
| `node scripts/publish-site.mjs` (build, verify, fast-check) in a scratch copy, run twice (before and after the CSS fix) | PASS |
| `check:fast` incl. Pricing QA, Footer sync QA, Business i18n QA | PASS (Pricing 0/0, Footer 0 errors, i18n 0 errors) |
| `check:fast` on the repo | PASS |
| LIVON/ONGIL/ox-month suites, 86 files, full run under load | 80 pass, 6 non-zero (below) |
| livon-accessibility, isolated rerun | PASS (76/0); the full-run timeout was load |
| livon-release-candidate, isolated rerun | FAIL: RC-14 only (59/1); RC-1 passed this time |
| livon-life-stage-v2 | PASS in the repo (33/0). It failed in the scratch copy only because the copy has no `.git` (LS2-10 runs `git diff`) |

**Existing failures versus new:** CV2-60, DM-11, ON-35, RC-14 reproduce unchanged (4 of the original 6). RC-1 and the accessibility timeout did not reproduce when run alone, so they are load-flaky; they are not fixed by P4. **New failures: none.** LS2-10 is a copy artefact, not a regression. The 4 existing failures were not hidden and no expectation was lowered. CV2-60 depends on git state like LS2-10 and was not re-run inside the repo (NOT VERIFIED whether it passes there).

## 9. Build output versus committed pages

The build in the scratch copy produces output that differs from the committed files in 623 paths; 207 differ beyond whitespace. Examples: 91 `portfolio` pages, the app `delete-account` pages and the de home flyout descriptions, where the committed files carry German or other-language strings and the generators emit English. P4 did not edit those generators or pages. Whether the same divergence exists on `6be1475` was not checked (NOT VERIFIED). Because `_publish` is built from the generators, the published site would carry the English text. Lists: `qa-artifacts/phase03-p4/build-vs-repo-*.txt`.

## 10. Remaining production-deploy blockers

1. Native review of the 7-language notices and labels (drafts).
2. Owner decision on the remaining A/B capability wording and on Service JSON-LD.
3. C/D redirect decision; `business/build` and `business/solutions` still describe white-label/custom offers.
4. Build output differs from committed pages for non-ko/en text (section 9); decide which side is authoritative.
5. Four existing test failures (CV2-60, DM-11, ON-35, RC-14) and two load-flaky tests.
6. Class B aria-hidden items need a design/owner judgment.
7. Cache-bust bump changed 731 files; deploy must ship CSS and pages together.
