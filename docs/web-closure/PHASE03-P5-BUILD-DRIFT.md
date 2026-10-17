# PHASE 03 P5 — Build output versus committed files ("the 207")

Status words: PASS / FAIL / NOT RUN / NOT VERIFIED. Measured on scratch copies of `abe3ab2` (git-initialised archives, so the repo was never built in place).

## 1. What was measured

- Two independent clean builds (`node scripts/publish-site.mjs`) from `abe3ab2` give identical output, except timestamps (`admin/data.json` `generatedAt`, deploy marker, sitemap `<lastmod>`). A clean build is **deterministic**.
- A second build in the same tree is **not idempotent**: templates gain blank lines and `closingFoot` in the locale files toggles to English.
- One clean build changes about 622 tracked files. 414 are whitespace/blank-line only. 208 are content: the "207" plus `admin/data.json` (timestamp).

## 2. The 207, by family (before P5)

| Family | Files | Nature |
|---|---|---|
| `*/delete-account/` of the 12 apps, 7 non-ko/en languages | 84 | committed text is not English; the build writes English |
| `*/portfolio/` | 91 | same |
| home `{lang}/index.html` (flyout descriptions) | 7 | German etc. replaced by English |
| `locales/_sp.*.json` | 7 | same |
| `sitemap.xml` | 1 | `<lastmod>` = build date |
| `business/index`, `studio/index` stale cache-bust `20260923pad1` | 17 | pages P4 missed |

## 3. Root cause

1. The non-English strings above exist **only in generated HTML**. No tracked template, locale file or pack contains them (`scripts/i18n/packs/de/chrome-nav-footer.json` has German `babylogDesc`, but only `apply-service-counts.mjs` reads it).
2. They came from a machine-local machine-translation cache, `scripts/.translate-cache.json`, which is **gitignored** and is an input of `apply-translate-cache.mjs`. Most likely the committer had the cache (inferred, not provable from the repo); CI (`.github/workflows/github-pages.yml`, clean checkout) does not, so the shipped site carries English for these strings. Commit `aa576326` documents the same known issue.
3. The 48 pre-build patch scripts (`run-index-patches.mjs`, `run-all-locale-patches.mjs`) rewrite tracked templates and locales in place; that is the whitespace growth and the non-idempotency.
4. The 17 stale pages and the sitemap date are ordinary staleness.

## 4. Base commit versus P4

`6be1475` has 663 drifted files (299 content). That set is a superset of P4's. **P4 introduced none of the drift**, and fixed 91 stale pages (46 business, 36 studio, 9 games).

## 5. Decision

Committed non-English text was **not** overwritten with English or Korean: which side is canonical is the owner's call. Options: (a) vendor the reviewed translations into tracked pack/locale files and make the generators read them; (b) accept English fallback and let the build output replace the committed text. Until then the drift is made explicit and guarded.

## 6. What P5 changed

- 258 stale generated Business/Studio pages were synced to the build output of the P5 generator fixes (203 business, 55 studio). Together with the 8 pages whose JSON-LD the sanitizer used to truncate (section 7 of the P5 report).
- `scripts/qa-build-drift.mjs` (`npm run check:build-drift`) plus `docs/web-closure/build-drift-baseline.json`: after one clean build, **fails** on a drifted file not in the baseline, a drifted file whose content hash changed, or an unexpected new untracked file. Whitespace and the timestamps above are ignored. Baseline: 189 files (91 portfolio, 84 delete-account, 7 home, 7 `_sp` locale).
- Verified: clean build then check = PASS (189/189). A tampered `ko/index.html` and `ja/portfolio/index.html` = FAIL. A second build in the same tree = FAIL, as predicted (non-idempotent patchers); the guard is for a build from a clean checkout.
- The guard is **not** wired into `publish-site.mjs` or CI, because it needs a git work tree and a freshly built tree. Wiring it into the workflow is a deploy-side step (NOT DONE).
