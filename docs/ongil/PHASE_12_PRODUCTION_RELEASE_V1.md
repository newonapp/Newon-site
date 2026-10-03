# ONGIL PHASE 12 — PRODUCTION RELEASE V1

Branch `ongil-foundation-v1` · HEAD `84fdec2b9` (ONGIL Release Hardening V1) · release candidate prepared, **not
committed, not tagged, not pushed, not deployed**. Deployment needs the owner's explicit approval (section 33).

## 1. OBJECTIVE

Make the ONGIL V1 that exists safe to release, and say exactly what it is: audit the real deployment path, settle
the production capability boundary, check the live providers, check assets, cache and version, run production-like
smoke and end-to-end journeys, prepare a release candidate, write the deploy and rollback procedure, and separate
what automation verified from what a person must still verify before a public launch. Nothing was invented: no
backend, no provider, no service worker, no build system.

## 2. BASELINE

- `git` (read through the worktree's git directory, read-only, `--no-optional-locks`): branch `ongil-foundation-v1`,
  HEAD `84fdec2b9`, tracking `origin/ongil-foundation-v1` with nothing ahead or behind at the start; working tree
  clean at the start. `origin/main` (`07adb5275`, last fetched ref — a new fetch was not possible from this
  environment) is an ancestor of HEAD: HEAD is 10 ONGIL commits ahead, 0 behind; every changed path is under
  `ongil-start/`, `tests/ongil/` or `docs/ongil/`.
- No other session was writing to the worktree (no file changed in the hour before the start).
- `node --test tests/ongil/*.test.mjs`: **654 / 654** before any change.

## 3. PRODUCTION V1 SCOPE

| Kind | Areas |
|---|---|
| READY — local, on this device | 홈, 내 생활 (calendar, tasks, routines, meals, water, exercise, sleep, expenses, journal), 건강·안부 local records (check-in, symptoms, medication with history, health notes), 가족 local choices and preview, 커뮤니티 local posts / group and meetup drafts, 저장, 알림 (in-app list foundation; nothing produces one), ONGIL 도우미 (local rules: read, open, prepare, confirm two kinds of write), 내 정보 / onboarding / erase, 운영 보기 (local diagnostics), analytics (local daily counters) |
| PUBLIC DATA DEPENDENT | 돌봄·서비스 기관·시설 (kr-kakao-place), 즐길거리 (kr-lifelong-class, kr-tourapi, kr-kakao-place), Home 내 주변 (kr-lifelong-class), 스토어 (no product source exists: shows "아직 연결된 상품이 없어요.") |

## 4. NOT CONNECTED FEATURES

Real family sharing, public community (feed, comments, reactions, reports, members), remote notifications and OS
push, booking / application, payment, cart, order, shipping, inventory, Newon+ sign-in and sync, any AI model or
backend, server-side admin with authentication and roles. Each is stated as absent on screen; none is shown as ready.

## 5. DEPLOYMENT ARCHITECTURE

Read from the repository (not assumed):

- **Hosting**: GitHub Pages. `.github/workflows/github-pages.yml` runs on a push to `main` (and manual dispatch):
  `node scripts/publish-site.mjs` builds `_publish/`, which is force-pushed to `gh-pages` with `cname: www.newon.app`
  (`CNAME` = `www.newon.app`). Post-deploy checks: the 404 HUMAN route and a report-only production smoke.
- **ONGIL in the build**: `{ from: "ongil-start", to: "ongil-start", required: true }`; the build fails without
  `ongil-start/index.html` or `assets/ongil-mark.svg`.
- **Production URL**: `https://www.newon.app/ongil-start/` (hash routes after it). Today that address serves an
  earlier placeholder (`main` holds only `ongil-start/index.html`; title "Ongil", `noindex, nofollow`) — checked by
  fetching it.
- **API**: the browser learns the data API's location from `/livon/livon-api-config.js`, written at build time from
  the repository variable `LIVON_API_ORIGIN`. Production today: `configured = ""` (checked by fetching the live
  file) → same origin → `https://www.newon.app/api/livon/data` answers **404** on GitHub Pages (checked).
  `https://api.newon.app/api/health` also answered 404. `vercel.json` describes a Vercel deployment (rewrites,
  headers); whether and where a Vercel API project runs is not visible from the repository: CONFIG UNKNOWN.
- **Other files**: `netlify.toml` and `_redirects` exist (legal-page redirects only) and are not the production path.
- **Build check**: the whole publish step was run on a **copy** of the worktree outside the repository (the step
  regenerates tracked site files, so it was not run in place): `publish-site OK`, `fast-check: PASS`,
  `_publish/ongil-start` byte-identical to `ongil-start/`.

## 6. ROUTES

Production-like server (the publish output's ONGIL files and the shared files they load; `/api/*` → 404 as on Pages):

| Address | Result |
|---|---|
| `/ongil-start/` direct load | 200, Home, title "Ongil" |
| `#life` `#health` `#care` `#enjoy` `#store` `#saved` `#community/groups` `#store/gift` | the screen, its title |
| `#nope` | replaced by the current screen's address (no loop) |
| `#life/nope` | `#life` |
| Reload on `#life` | stays on 내 생활 |

Hash routes need no server rewrite; a 404 can only come from the page itself being missing.

## 7. ASSETS

- Every site-root file the page loads exists with the exact case (PR-02): 6 ONGIL sheets, `app.js` and 67 modules
  (relative imports), 5 shared sheets, 4 shared scripts, `/livon/livon-api-config.js`, `/assets/ongil-mark.svg`.
  The shared files in the build output are byte-identical to the repository's.
- In the browser: 86 local requests, **0 failed**. The only failures were the outside font and film requests, which
  the harness blocks on purpose.
- Absolute `/…` paths mean the app must be served from the site root (it is).

## 8. LIVE PROVIDERS

| Provider | Production configuration | Live request | Result |
|---|---|---|---|
| kr-lifelong-class | NOT CONFIGURED for the production frontend (API origin empty, same-origin `/api` is 404); server key: CONFIG UNKNOWN | not possible from this environment | LIVE VERIFIED = NO |
| kr-kakao-place | same | same | LIVE VERIFIED = NO |
| kr-tourapi | same | same | LIVE VERIFIED = NO |
| products | no source exists (`createProductSource` → NOT_CONNECTED) | — | correct "not connected" state |

No key, token or secret was read or printed. Mocked answers from earlier phases are not counted as live.
Consequence for a launch today: 돌봄·서비스 기관 search, 즐길거리 search and Home 내 주변 say
"이 자료는 아직 연결되지 않았어요." until `LIVON_API_ORIGIN` points at a working API whose provider keys are set.

## 9. PROVIDER FAILURES

Through the real data client (PR-05) for all four sources: a 404 (the GitHub Pages case), no network, bad JSON, an
HTML answer and an unconfigured route each give `unavailable` with no items and no exception. In the browser, with
`/api` answering 404: 즐길거리 shows "공원 (지도 검색) · 이 자료는 아직 연결되지 않았어요."; 돌봄 and 스토어 render; other
screens are unaffected. The browser itself records the 404 of that one status request in its console as a network
line ("Failed to load resource") — after the person presses 찾기, never at start-up; ONGIL writes no console message.

## 10. COMMUNITY BOUNDARY

"이 기기에만 저장되고 다른 사람에게 보이지 않습니다" (area notice); the film lead says it is being prepared. No feed,
counts, members or comment activity. Saved posts are LOCAL_ONLY. (PR-06.)

## 11. FAMILY BOUNDARY

"가족 연결은 아직 준비 중입니다" / "가족 연결은 아직 할 수 없습니다". Previews say nothing was sent. No sent / shared /
delivered message exists in any view. (PR-07.)

## 12. HEALTH BOUNDARY

"의료 진단이나 치료 판단을 대신하지 않습니다"; medication is a list the person writes, with no advice; 119 sentences
say to call directly. No diagnosis, prescription, dose or emergency-judgement wording. (PR-08.)

## 13. ASSISTANT BOUNDARY

Local deterministic rules; no model, no network in its modules (PR-09). Writes: calendar event and task only, after
the person confirms. Health, family, expenses, journal and community are never written by it.

## 14. ADMIN

Decision: **keep `#admin` in the build, not linked** — not in the menu, search, sitemap or any link (PR-10). It holds
local diagnostics only (no private text, no health content, no secret; checked in Phase 11 and its review). Anyone
who types the address on their own device sees their own device's diagnostics. It is not a secured admin and does
not say so; a production admin needs a server, sign-in and roles (future task).

## 15. ANALYTICS

Local daily counters only: `TRANSMISSION.remote = false`, no endpoint, no beacon, no identifier; closed property
sets, no text, 14 days kept (PR-11, RH-29, Phase 11 review). The same in production: there is nothing to configure.

## 16. LOCAL STORAGE

Everything personal lives in this browser's storage. The page already says so where it matters: the community and
family notices, "고른 내용은 이 기기에만 남습니다" on check-in, the 내 정보 screen (storage mode, and the erase
action that removes only ONGIL's data), and a clear message when the browser refuses a write. No backup or cloud copy
is claimed anywhere. Clearing site data, another browser or device, or a private window starts empty — this is
listed in the launch checklist as something to say in public material.

## 17. CACHE

- GitHub Pages serves every file with its own default caching (short `max-age`, no custom headers possible).
  ONGIL has no service worker (PR-28) and none was added.
- Local sheets and `app.js` carry `?v=`; the 67 other modules are imported by plain relative path.
- **First release**: `main` serves no ONGIL module today (only a placeholder page), so no old module can be mixed
  with the new page. No risk.
- **Later releases**: for the few minutes a browser may keep an older module, it could load a newer `app.js` with an
  older module. Remedy for then: hashed file names from a build step, or a version in every import. Not needed for
  this release; recorded for Phase 13+.

## 18. VERSION

One `APP_VERSION` (`'hardening-v1'`) in `app.js`, shown in 운영 보기 and on `window.Ongil` (PR-03). It was not renamed
for the release: renaming touches seven earlier test files for a label only. The release is identified by the
recommended tag (section 33), which points at the commit carrying this version.

Bundling: start-up measured on the production-like server at 390px, three cold loads — ready in 355–432 ms, one long
task of 85–112 ms, 68 module requests, 1,776 elements. Not a release blocker: **DEFERRED**.

## 19. NETWORK INVENTORY

| Domain | Kind | When |
|---|---|---|
| www.newon.app (same origin) | page, sheets, scripts | load |
| fonts.googleapis.com, fonts.gstatic.com | FONT | load (optional; system fonts otherwise) |
| d8j0ntlcm91z4.cloudfront.net | MEDIA (7 films) | when a film is shown (not with reduced motion) |
| same origin `/api/livon/data` (or `LIVON_API_ORIGIN` when set) | PUBLIC DATA | only after the person presses 찾기 / 내 주변 |
| seller, source and map pages | SELLER LINK / source link | only when the person opens one (new window, `noopener noreferrer`) |

In the full new-user journey (95 requests): no request carried any text the person wrote; the only data-route
request was `?action=status`. Search requests send only the region and the search word the person typed for that
public search. No other third party. (PR-12, PR-13.)

## 20. SECURITY HEADERS

- Production is GitHub Pages: **custom response headers cannot be set there**. The `vercel.json` headers
  (`nosniff`, `Referrer-Policy`, `Permissions-Policy`, report-only CSP) apply only to a Vercel deployment and are
  **not** applied on www.newon.app by this pipeline.
- In the page: outside links use `noopener noreferrer`; browsers already default to
  `strict-origin-when-cross-origin`. No meta CSP was added — an enforced policy must cover the shared site scripts
  and the API origin and belongs to the site as a whole (decision listed in the launch checklist).
- Frontend secrets 0; dynamic HTML 0; unsafe URLs 0 (Phase 11 inventories, re-run in its review).

## 21. SEO

The app page is `noindex, nofollow`, not in the sitemap; `robots.txt` does not hide it (so the noindex is read);
the indexed public page is `/ko/ongil/` (PR-27). Private screens are hash routes of that one page. Care / Enjoy /
Store items exist only in memory during a visit: PUBLIC ITEM INDEXING = NOT IMPLEMENTED.

## 22. SMOKE TEST

Fresh storage, production-like server, 390 and 1440: 홈, 내 생활, 건강·안부, 가족, 돌봄, 즐길거리, 커뮤니티, 스토어, 저장, 내 정보 —
no blank screen, no horizontal overflow, no "undefined / null / [object Object]", 0 console errors from ONGIL,
0 page errors, 0 unhandled rejections; search, notification and assistant panels open inside the screen.

## 23. E2E

New user at 390 and 1440, all steps through the interface: onboarding (opened, completed, closed) → Home 할 일 추가
(opens 내 생활 › 할 일, saved) → 일정 추가 (saved) → 안부 "좋아요" (saved) → 내 생활 shows the task → search "캘린더"
(results; the task text is not searchable) → a community post saved to 저장 → 도우미 "오늘 일정 보기" (shows the
event) → "내일 장보기 할 일 추가" → 확인 → one new task → 내 정보 › 데이터 지우기 (every `ongil.*` key removed, a non-ONGIL
key kept) → every screen still renders. Test profile only. PASS.

## 24. MOBILE

320 and 390: no overlap in the header; tools 44px; the menu sheet lists 10 links; the three panels fit; 캘린더,
건강·안부, 스토어, 복약 render without overflow. (Phase 11 review: 12 widths, 320–1440.)

## 25. OFFLINE

Network turned off after load: a task and an event save, the assistant answers locally, all 10 screens render, 즐길거리
search says not connected. No service worker: opening the app with no network needs the browser's own cache.

## 26. FRESH STORAGE

First visit with empty storage: every screen shows its empty state; the onboarding invitation is on Home. PASS.

## 27. OLD STORAGE

Phase 1 / 3 / 6 / 7-shaped data (no `schemaVersion`, an unknown saved type, an unknown collection key, a medication
mark without a name, an event with an unknown field): no error; saved items kept (the unknown type skipped), the old
medication and its mark shown, the old post and region read. Nothing is migrated on read; the release changes no
storage format, so rolling back is data-safe (section 35).

## 28. REAL DEVICE CHECKLIST

Not verified here (no device). For a person, on **iPhone Safari, Android Chrome, Mac Safari and desktop Chrome**:

- [ ] open `/ongil-start/`, first visit, onboarding to the end
- [ ] header: menu, 검색, 알림, 도우미, 언어 — tap each; nothing overlaps; the page does not scroll sideways
- [ ] 내 생활 › 캘린더: add an event, move between months, pick a day
- [ ] 홈 › 오늘의 안부: choose one; 몸 상태·증상도 적기
- [ ] 통합검색: a menu word; a saved item
- [ ] 저장: save and remove
- [ ] 도우미: "오늘 일정 알려줘"; "내일 장보기 할 일 추가" → 확인
- [ ] typing Korean in every form (IME), the on-screen keyboard not hiding the save button
- [ ] the film plays and 영상 멈춤 stops it; with Reduce Motion on, nothing plays
- [ ] an outside link (source, map) opens a new tab and ONGIL stays open
- [ ] rotate the phone; text size at the largest system setting

## 29. SCREEN READER CHECKLIST

Not verified here. VoiceOver on Mac and iPhone:

- [ ] "본문으로 건너뛰기" is first and works
- [ ] header: each tool is announced with its name and expanded / collapsed state
- [ ] primary menu: the current screen is announced as current
- [ ] 검색: field label, result count and "no results" are announced
- [ ] 알림 / 도우미 panels: opening moves into the panel, Escape returns to the button
- [ ] forms: every field label and hint is read; an error is announced and the field is marked invalid
- [ ] dialogs (onboarding, details): focus stays inside, the title is read first, closing returns focus
- [ ] confirmations (도우미 확인, 삭제, 데이터 지우기): what will happen is read before the button
- [ ] chosen / pressed / done states are spoken, not only shown by colour

## 30. FILM CONTRAST CHECKLIST

Not verified here (outside video blocked in the harness). For a person, on each screen's film (홈 and the seven
area films): pause at the brightest frames and check that the slogan, lead text and buttons stay readable at 390px
and 1440px; check again with the film failed to load (dark background); report any frame where text is hard to read.

## 31. TESTS

`node --test tests/ongil/*.test.mjs` → **670 / 670** (654 before + 16 in `production-release.test.mjs`: PR-01 … PR-14,
PR-26, PR-27, PR-28 — release risks not covered by earlier suites). PR-15 … PR-25 (console, fresh / old storage,
offline, routes, widths, E2E) are browser checks: sections 6, 22–27.

Existing assertions changed (each commented in the test; none deleted or skipped):

| Test | Before | After | Why |
|---|---|---|---|
| assistant OG-AI (suite shape) | 21 test files | 22 | `production-release.test.mjs` added |
| release-hardening RH-45 | 21 test files | 22 | same |
| admin-analytics OG-AQ-20 | file list without `production-release` | with it | same |

No ONGIL source file changed in this phase.

## 32. RELEASE CANDIDATE

State: **RC READY (uncommitted)** — tests 670 / 670, build check passed on a copy, smoke and E2E passed on a
production-like server. Files to commit: `tests/ongil/production-release.test.mjs` (new),
`tests/ongil/assistant.test.mjs`, `tests/ongil/release-hardening.test.mjs`, `tests/ongil/admin-analytics.test.mjs`,
`docs/ongil/PHASE_12_PRODUCTION_RELEASE_V1.md` (new).

## 33. DEPLOY PROCEDURE (after approval)

1. On `ongil-foundation-v1`: `git add tests/ongil docs/ongil && git commit -m "ONGIL Production Release V1"`.
2. `git tag -a ongil-v1.0.0-rc.1 -m "ONGIL V1 release candidate"`; `git push origin ongil-foundation-v1 --follow-tags`.
3. Optional before deploy: if a working data API exists, set the repository variable `LIVON_API_ORIGIN` (Settings →
   Secrets and variables → Actions → Variables) to its https origin; otherwise public searches will say "not
   connected" in production.
4. `git fetch origin` and confirm `origin/main` is still an ancestor of the release commit.
5. Deploy = update `main`: `git checkout main && git pull --ff-only && git merge --ff-only ongil-foundation-v1 &&
   git push origin main` (no force; a pull request is equivalent). The push runs the GitHub Pages workflow.
6. Watch the workflow; then open `https://www.newon.app/ongil-start/` and repeat the smoke list (section 22) and the
   manual gates (section 36). Tag `ongil-v1.0.0` when the gates pass.

## 34. KNOWN LIMITATIONS

Live providers not reachable from production yet; no backend, account, sync, remote family, public community,
commerce or AI model; data lives in one browser; no offline start without the browser cache; no enforceable security
headers on GitHub Pages; start-up long task about 0.1 s (bundling deferred); calendar day 40px at 320px and two small
fixed labels (Phase 11 L5, L6); real devices, screen readers and film contrast not verified by automation.

## 35. ROLLBACK

- Known good: `07adb5275` (current `main`, serving the ONGIL placeholder page).
- Method: `git revert --no-edit <merge or fast-forward range>` on `main` and push (no force, no reset), or redeploy
  the previous `main` commit through the workflow's manual dispatch after reverting. GitHub Pages republishes
  `gh-pages` from `main` on every push.
- Data: this release changes no storage format and writes only `ongil.v1.*` keys in each visitor's own browser.
  Rolling back to the placeholder leaves that data in place, unused; rolling forward again reads it. No server data
  exists to restore.

## 36. LAUNCH CHECKLIST

Manual gates — **PUBLIC LAUNCH VERIFIED stays NO until all four pass**:

1. [ ] REAL DEVICE (section 28)
2. [ ] SCREEN READER (section 29)
3. [ ] FILM CONTRAST (section 30)
4. [ ] LIVE PROVIDERS: decide whether launch needs them; if yes, deploy the API, set `LIVON_API_ORIGIN`, then check one
   search per provider (a result, an empty answer, the source link) in production

Also before launch: decide the site-wide security header approach (GitHub Pages cannot send headers); say in public
material that ONGIL keeps data on the device only; confirm `origin/main` has not moved.

AUTOMATED RELEASE READY = YES · PUBLIC LAUNCH VERIFIED = NO.
