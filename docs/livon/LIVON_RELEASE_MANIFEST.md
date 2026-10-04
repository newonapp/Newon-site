# LIVON V1 — Release Manifest (Release Candidate V1)

Status: **RELEASE CANDIDATE — NOT DEPLOYED.** Nothing in this phase was pushed, merged or deployed, and no external
service, variable, key, DNS record or Search Console property was touched.

## Release candidate

| | |
|---|---|
| Branch | `livon-release-candidate-v1` (local only) |
| Base | `f41d58777` — LIVON Performance Optimization V1 (branch `livon-performance-v1`) |
| RC commit | the commit that adds this file (`git log -1 livon-release-candidate-v1`) |
| Product change vs base | 2 files, both release-blocker fixes (see *RC fixes*). Every other product file is byte-identical to `f41d58777`. |
| Feature freeze | in force from this commit: only blocker / serious-regression / security / data / accessibility / SEO-configuration fixes |
| Audit suite | `tests/livon/release-candidate.test.mjs` (RC-1 … RC-53, 63 tests) |

## Ancestry

Checked with `git merge-base --is-ancestor <phase> HEAD` on the RC (test RC-1), not from earlier reports.

| Phase | Commit | Status |
|---|---|---|
| Anonymous Free Mode | `12c1b4a6f` (branch `deploy/livon-anonymous-v1`, `07adb5275` on top = `origin/main`) | INCLUDED |
| Data Platform V1 (+ AI activation foundation) | `55be1ec29` | INCLUDED |
| Screen Migration V1 | `6f3a781e3` | INCLUDED |
| Real Data Integration V1 | `75bd82eff` | INCLUDED |
| Content Quality V1 | `ce95d33ce` | INCLUDED |
| Data Manager V1 | `437db6baa` | INCLUDED |
| Admin Local V1 | `e4c8e2f49` | INCLUDED |
| Onboarding V1 | `b1f1324d4` | INCLUDED |
| Community + Onboarding V1 | `70b24646d` | INCLUDED |
| Help & FAQ V1 | `8802d6a21` | INCLUDED |
| SEO Expansion V1 | `0ef28b895` | INCLUDED |
| Accessibility Hardening V1 | `29628c2ef` | INCLUDED |
| Performance Optimization V1 | `f41d58777` | INCLUDED (RC base) |

Branches that are **not** ancestors, and why:

| Branch | Tip | Status |
|---|---|---|
| `livon-v1-release` (provider line: youth policy, business support/event, Kakao place, TourAPI, lifelong class, public tax expert, V1 readiness, Vercel API) | `7fd6e02bf` | SUPERSEDED — its content was carried into `12c1b4a6f` (Anonymous Free Mode) as one commit; the provider tests (`tests/livon/tourapi.test.mjs` etc.) arrive from there. Untouched. |
| `livon-anonymous-v1`, `livon-anonymous-public` | `3795c8e95`, `f648ceede` | SUPERSEDED by `12c1b4a6f` |
| `livon-account-backend-v1`, `docs/livon-live-config` | `97c36f80c`, `26b9a5043` | DEFERRED — NEWON+ account backend and its live-config runbook (V1.1) |
| `wip/livon-public-law-expert` | `00011e6b9` | WIP, blocked on an official source; out of scope |
| local `main` | `e3d7d1510` | DIVERGED — see *Deployment gates* (G-2) |

## Included phases

Home · Life Stage (7 stages, 228 topics) · Life Events (34) · Today (34 items) · My Life (saves, to-dos, goals, records,
interests, settings) · Explore (search, filters, sort, detail, saves) · Community (local-first: For You / Latest /
Following-explained, compose, drafts, edit, delete, reactions, saves, comments and replies, search, filters, local
profile and activity, related content, local reports with de-duplication) · LIVON AI (UI; backend not connected) ·
Search · Onboarding (optional, resumable, resettable) · Preferences · Help Center (68 articles) · static SEO pages (125) ·
accessibility hardening (WCAG 2.2 AA target) · performance work (lazy films, on-demand start-up, optimized assets).
Local tools that are **not published**: Admin Local (`/livon/admin/`) and Data Manager (`/livon/admin/data/`).

## Feature status

| Area | Status | Notes |
|---|---|---|
| Home, Life Stage, Life Event, Today, My Life, Explore, Search | READY | anonymous, local-first |
| Community | READY WITH LIMITATION | local to this browser; no other users, no server moderation; Following needs an account (shown as such) |
| Onboarding / Preferences | READY | never forced; Skip does not nag; reset keeps saves, My Life and Community |
| Help | READY | 68 articles; statements match the shipped runtime (RC-24) |
| LIVON AI | DEFERRED (UI READY) | no backend: an honest error bubble, no invented answer (RC-24b / RC-43) |
| Live public data (8 providers) | DEFERRED | curated 530 records only; no empty screen without providers (RC-44b) |
| NEWON+ account / sync | DEFERRED | committed config is empty → anonymous; no sign-in wall |
| My Life export / clear-all | DEFERRED (POST-V1) | handlers exist in `life-now-page.js` but no control renders them; Help says there is no bulk-delete button. Not a release risk (unreachable). |
| Hero films | MANUAL REQUIRED | code checked; real playback on devices not observed (film host unreachable from the lab) |

## Deferred

NEWON+ accounts and sync · LIVON AI backend (OpenAI + Upstash) · live public-data providers · remote Community
(other users, follow, server moderation, report delivery) · support / contact backend · My Life export and clear-all UI ·
Search Console submission.

## Data counts

| | Count | Source |
|---|---|---|
| Curated records | 530 (visible 530 · sample 0 · expired 0 · draft 0 · duplicate IDs 0 · invalid URLs 0 · broken relations 0) | `scripts/livon-data-quality.mjs` |
| by type | lifeStage 7 · lifeEvent 34 · content 259 · service 143 · provider 21 · communityContent 26 · policy 17 · place 10 · program 9 · class 4 | same |
| by source | editorial 463 · official 65 · internal 2 | same |
| Life stages | 7 (10대 · 20대 · 30대 · 40대 · 50대 · 60대 · 70대+) | |
| Topics | 228 (228/228 placed) | |
| Life Events | 34 (34/34) | |
| Today items | 34 (34/34) | |
| Explore | 28/28 | |
| Help articles | 68 in 10 categories; 39 of them also as static pages (+ the Help index) | `livon/help-data.js` |
| Community post types | 6 compose types (+ curated) | Help facts |
| Content quality | 530 PASS (Excellent 529 · Good 1), average 99.6; review notes: duplicate candidates 97, date verification 30, unsourced specific 8, missing relation 4, field conflict 2 (non-blocking) | `scripts/livon-content-quality.mjs` |
| Freshness | fresh 320 · unknown 210 (no official date; never guessed) | |
| Childcare rule | 70대 + 돌봄 → no `ex:ex-childcare`; 30대 + 육아 → offered (RC-17) | |

## Routes

App (`/livon/`, hash routes): `#livon-home` · `#life`, `#life/{stage}`, `#life/{stage}/{topic}`, `#life-events` ·
`#today`, `#today/{id}` · `#life-now`, `#ml-saved`, `#ml-todos`, `#ml-settings` · `#explore`, `#ex-results?q=…`,
`#ex-item-{id}`, `#ex-experts` · `#community`, `#cm-post-{id}`, `#cm-communities`, `#cm-mine` · `#livon-ai`, `#ai-chat` ·
`#help`, `#help/c/{cat}`, `#help/a/{id}`, `#help/search?q=…`, `#help/status`.
Static: `/livon/life/` + 7 stages + 56 topics, `/livon/life-events/` + 20 events, `/livon/help/` + 39 articles
(125 pages), plus 236 Life route stubs and 35 Today route stubs. Unknown IDs render a screen, never a crash (RC-7);
unknown static paths return 404.

## SEO

| | |
|---|---|
| Static pages | 125 (unique titles 125, unique descriptions 125, orphans 0, broken internal 0, thin 0, slug collisions 0) |
| Indexable when ON | 126 (125 + `/livon/`) |
| DEFAULT INDEX STATE | **ON** — `LIVON_SEO_INDEX` unset builds the open site (`scripts/livon-seo-build.mjs`) |
| OFF build | `/livon/` `noindex, nofollow`; every static page `noindex, follow`; 0 LIVON URLs in the sitemap (1,117 URLs) |
| ON build | `/livon/` `index, follow`; 126 LIVON URLs in the sitemap (1,243 URLs) |
| OFF vs ON | same 3,153 files; differences only in LIVON robots meta, `livon/seo-manifest.json` and `sitemap.xml` (RC-52) |
| robots.txt | identical in both; `/livon/` allowed (so `noindex` is read), `/admin/` disallowed |
| Canonical | self, `https://www.newon.app/…`; no preview host |
| JSON-LD | parses on every page |
| Never indexable | My Life, Onboarding, Personalization, local Community posts, Today/Explore app views, search results, LIVON AI, Admin, Data Manager |
| Production switch | `.github/workflows/github-pages.yml` now forwards the repository variable `LIVON_SEO_INDEX` (RC fix 1). `off`/`false`/`0`/`no` close (RC fix 2). |

## Help

68 articles; HF-1 … HF-28 inventory topics covered (Help & FAQ V1). Help states, per area: core available ·
personalization local rule-based · storage local · Community local · follow off (account required) · reports local only ·
AI off · live data off · account off · support off. Each statement was checked against the shipped code (RC-24) and in
the browser (RC-23b, RC-24b). **If LIVON AI or accounts go live, the Help facts (`livon/help-data.js` → `facts`, `status`)
must be updated in the same release** — otherwise Help would contradict the product.

## Tests

| Run | Total | Pass | Fail | Skip | Skip reasons |
|---|---|---|---|---|---|
| Mac (user's machine, Node 22, no Chromium) — RC | 1,020 | 971 | 0 | 49 | 48 need a local Chromium · 1 needs `LIVON_TEST_PG` |
| Cloud (Chromium 1194, Node 22) — RC | 1,020 | 1,019 | 0 | 1 | `LIVON_TEST_PG` not set |
| Baseline re-run on `f41d58777` — Mac | 957 | 933 | 0 | 24 | same as Performance V1 |
| Baseline re-run on `f41d58777` — Cloud | 957 | 956 | 0 | 1 | same as Performance V1 |

Run the suite on a tree that has not been built in place: `scripts/publish-site.mjs` rewrites tracked files (see
*Known limitations* 1), and `NA-18` then reports `admin/data.json` as changed. Builds for this RC were made in separate
copies of the source.

## Known limitations

1. **The site build rewrites tracked source files (pre-existing, whole Newon site, not LIVON).** `node scripts/publish-site.mjs`
   regenerates 214 committed files (`*/index.html`, `locales/*.json`, `templates/*`, `sitemap.xml`, `admin/data.json`),
   and on this machine the non-Korean locale strings of the app pages fall back to English (for example
   `/de/babylog/delete-account/` titles become English). The same happens on `origin/main` (`07adb5275`), so it is not an
   RC regression; it affects the published non-LIVON locale pages of the whole site. Outside the LIVON freeze — listed
   for the site owner.
2. **P-04** start-up blocking on a mobile-like profile (CPU ×4) remains about 1.0–1.7 s on Home, Life, Today, Explore and
   Community (RC lab re-check, CPU throttling only; Performance V1 reported 0.75–1.6 s with network shaping). Desktop
   0.03–0.2 s. Product code is unchanged, so this is the known level, not a regression.
3. **P-20** interaction latency under CPU ×4 is above 200 ms for most tasks (unchanged; not re-measured).
4. Community is local to one browser: no other people, no remote moderation; reports are recorded locally only.
5. LIVON AI shows a clear "not connected" error when used; it gives no answers until a backend is configured.
6. Curated data only; 210 records carry no official date (never guessed); 30 time-bound portals need date checks.
7. Hero films: real playback, black-frame and mobile-data behaviour not observed; film host unreachable from the lab.
   With the host unreachable, the Home film is requested 2–3 times at load (up to 4 under CPU contention) and never
   again while idle (30 s observed); each other screen adds one film when opened. No retry storm.
8. Firefox and WebKit/Safari were not run (not installed in the lab; not installed for this audit). iOS Safari not run.
9. My Life export / clear-all have no controls (by design for V1).
10. Topic page titles use "LivOn" while app screens use "LIVON" (existing copy; not changed under the freeze).
11. P-06 one photo size for every use, P-09 no bundling/minification (Performance V1 known issues).

## Manual checks

Required before deploy (not done in this audit; never reported as PASS): hero films in Chrome macOS, Safari macOS,
Safari iPhone, Chrome Android (if available) on Home, Life Stage, Today, Explore, Community, LIVON AI — appears, autoplays
muted, loops, no black frame, fallback when blocked, pause/resume control, reduced motion, no retry storm, behaviour on
mobile data. 390 px mobile smoke and desktop smoke on a production-like host. See `LIVON_RELEASE_CHECKLIST.md`.

## Production environment matrix

Names only. No value was read, requested or set in this phase.

| Setting | Where | Class | Effect |
|---|---|---|---|
| `LIVON_SEO_INDEX` | GitHub repository variable (Pages build); Vercel env for a Vercel full-site build | **REQUIRED NOW** (decision) | unset = ON (opens LIVON to search on the next `main` deploy); `off` = closed |
| `LIVON_API_ORIGIN` | GitHub repository variable | OPTIONAL | unset = same-origin `/api` (nothing on GitHub Pages → AI "not connected"). Set only when the AI backend is live (option B). |
| `LIVON_API_ORIGIN_PREVIEW` | GitHub repository variable | OPTIONAL | preview hosts only |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Vercel API project (server secret) | DEFERRED | AI backend (option B) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `LIVON_RATE_LIMIT_SECRET` | Vercel API project (server secret) | DEFERRED | required with AI in production (fail closed without) |
| `LIVON_DAILY_REQUEST_LIMIT`, `LIVON_AI_MINUTE_LIMIT`, `LIVON_AI_CLIENT_DAILY_LIMIT` | Vercel API project | OPTIONAL | AI limits |
| `YOUTHCENTER_API_KEY`, `BIZINFO_API_KEY`, `KAKAO_REST_API_KEY`, `TOURAPI_SERVICE_KEY`, `PUBLIC_DATA_SERVICE_KEY`, `WORK24_TRAINING_API_KEY` | Vercel API project (server secret) | DEFERRED | live public data; curated data is used without them |
| `LIVON_DATA_DIAGNOSTICS` | Vercel API project | MUST REMAIN OFF | diagnostics outside production only |
| `NEWON_PLUS_FIREBASE_API_KEY`, `NEWON_PLUS_FIREBASE_AUTH_DOMAIN`, `NEWON_PLUS_FIREBASE_PROJECT_ID`, `NEWON_PLUS_FIREBASE_APP_ID`, `NEWON_PLUS_AUTH_PROVIDERS`, `NEWON_PLUS_AUTH_PERSISTENCE` | GitHub repository variables (public web config) | MUST REMAIN OFF for V1 | any value turns on the sign-in UI and the Firebase SDK |
| `NEWON_AUTH_VERIFY_ENABLED`, `NEWON_AUTH_ALLOWED_ISSUERS` | Vercel API project | MUST REMAIN OFF | account backend |
| `LIVON_USERDATA_ENABLED`, `LIVON_DATABASE_URL`, `LIVON_USERDATA_MINUTE_LIMIT`, `LIVON_USERDATA_DAILY_LIMIT` | Vercel API project | MUST REMAIN OFF | sync backend (V1.1) |
| `LIVON_ALLOWED_ORIGINS`, `LIVON_API_ONLY` | Vercel API project | DEFERRED | only for a separate API deployment |

Release options (not chosen here — owner decisions):

- **AI** — A: publish LIVON with AI "not connected" (the RC runs correctly in this state: RC-24b, RC-43). B: configure the
  AI backend first, set `LIVON_API_ORIGIN`, and update the Help AI facts in the same release.
- **Public data** — release on curated data (verified: no empty screen, RC-44b), providers later.
- **Account** — NEWON+ stays deferred; all NEWON+ variables unset.
- **Community** — local-first as shipped; copy says "this device only", Following needs an account, reports stay local.

## Deployment gates

| Gate | State |
|---|---|
| G-1 Code / tests | 0 failures (Mac and Cloud); RC-1 … RC-53 pass |
| G-2 **Merge path** | `livon-release-candidate-v1` is a fast-forward of `origin/main` (`07adb5275`). Local `main` (`e3d7d1510`) carries 2 commits that are on neither (`3aea5667e` "Unify the site around six businesses…", `e3d7d1510` "Fix app account-deletion links…", 2026-09-27); a trial `git merge-tree` shows conflicts in 13 files (45 hunks: `livon/index.html`, `livon/*.js|css`, `package.json`, `scripts/publish-site.mjs`, `scripts/serve-publish.mjs`, `vercel.json`). The owner must decide which `main` is authoritative before any merge. |
| G-3 Production trigger | a push to GitHub `main` deploys (`github-pages.yml` → `gh-pages`, `www.newon.app`). Pushing the RC branch itself triggers no deploy in this repository (a Vercel Git integration, if connected, may build a preview). |
| G-4 SEO decision | set `LIVON_SEO_INDEX` before the deploy that carries LIVON (unset = ON) |
| G-5 AI decision | A (preparing) or B (backend first) |
| G-6 Manual device QA | hero films and smokes in `LIVON_RELEASE_CHECKLIST.md` |
| G-7 Site build side effect | known limitation 1 (whole site, pre-existing) acknowledged by the owner |

## RC fixes

| # | File | Problem | Fix | Test |
|---|---|---|---|---|
| RC-FIX-1 | `.github/workflows/github-pages.yml` | The production build (main → gh-pages) did not pass `LIVON_SEO_INDEX`, so the documented pre-launch switch could not be used: any deploy of LIVON would open it to search engines whatever was decided. | Forward the repository variable `LIVON_SEO_INDEX` to the build step. Unset keeps today's default (ON); no policy change. | RC-30b |
| RC-FIX-2 | `scripts/livon-seo-build.mjs` | Only the exact string `off` closed indexing; `false`, `0`, `no` or ` off ` silently opened it. | Trim and accept `off`, `false`, `0`, `no` (any case). Unset still = ON. | RC-30b |

No product screen, script or style under `livon/` changed (RC-41).

## V1.1 backlog

Non-blockers found or carried, not implemented under the freeze:

1. NEWON+ accounts and sync (branches `livon-account-backend-v1`, `docs/livon-live-config`).
2. LIVON AI live (backend, `LIVON_API_ORIGIN`, Help facts update).
3. Live public-data providers (8 keys) and freshness for the 210 undated records.
4. Remote Community: other users, follow, report delivery, server moderation.
5. Support / contact backend.
6. My Life export and clear-all controls (handlers exist).
7. Bundling / minification (P-09) and responsive `srcset` images (P-06).
8. List windowing / `content-visibility` for Today and Life (P-04) and interaction latency (P-20).
9. Safari / WebKit specific refinements after device QA.
10. Site build: stop rewriting tracked files during `publish-site` and restore non-Korean locale strings (whole site).
11. Brand casing on topic titles ("LivOn" vs "LIVON").
12. AI error copy for "no API at this address" is technical ("AI API가 이 주소에서 실행되지 않음").
