# LIVON V1 — Release Checklist

For the owner. Every box starts unchecked: none of these steps was done in the Release Candidate phase (no push, merge,
deploy, variable or external service change). Facts behind each step: `LIVON_RELEASE_MANIFEST.md`.

## 1. Decisions

- [ ] SEO INDEX decision — `LIVON_SEO_INDEX` repository variable: `off` (closed: noindex, no LIVON URL in the sitemap) or
      unset/`on` (open: 126 URLs). **Unset means ON.** Recommended for a first public release: `off`.
- [ ] AI release decision — A: LIVON with AI "not connected" (works as shipped) · B: AI backend first, then
      `LIVON_API_ORIGIN` and the Help AI facts in the same release.
- [ ] Public API decision — curated data only (works as shipped) or provider keys on the API project later.
- [ ] NEWON+ remains deferred — every `NEWON_PLUS_*` variable stays unset; `NEWON_AUTH_VERIFY_ENABLED` and
      `LIVON_USERDATA_ENABLED` stay off.
- [ ] Merge path decision — local `main` (`e3d7d1510`) and `origin/main` (`07adb5275`) have diverged; the RC is a
      fast-forward of `origin/main` and conflicts with local `main` in 13 files. Decide which `main` is authoritative.
- [ ] Site build side effect acknowledged — `publish-site` rewrites tracked locale/page files and non-Korean app pages fall
      back to English (pre-existing, whole site, manifest *Known limitations* 1).

## 2. Manual device QA (hero films and smokes)

Screens with a film: Home, Life Stage, Today, Explore, Community, LIVON AI (My Life also has a header film).
For each: film appears · autoplays muted · loops · no black frame · fallback when the film cannot load ·
"배경 영상 일시 정지" pauses and resumes every film · reduced motion starts paused · no repeated requests in DevTools ·
reasonable on mobile data (only the open screen's film loads).

- [ ] Chrome hero video (macOS)
- [ ] Safari macOS hero video
- [ ] Safari iPhone hero video
- [ ] Chrome Android hero video (if a device is available)
- [ ] 390 mobile smoke — seven views, Help, Onboarding open/skip, a Community post, a save, a to-do; text size 200%
- [ ] Desktop smoke — the same at 1440 px; keyboard only (Tab, Enter, Escape) through Onboarding and a dialog

## 3. Build and branches

- [ ] Production build — on a clean checkout of the RC: `LIVON_SEO_INDEX=<decision> node scripts/publish-site.mjs`
      → `publish-site OK`; `livon-seo-build … indexing OFF|ON` matches the decision
- [ ] Full test suite on a tree that was not built in place: `node --test tests/livon/*.test.mjs` → 0 failures
- [ ] GitHub backup branches — push `livon-release-candidate-v1` (and keep `livon-performance-v1`) as backups
      (a non-`main` push does not deploy)
- [ ] Repository variable `LIVON_SEO_INDEX` set as decided (Settings → Secrets and variables → Actions → Variables)
- [ ] Merge approval — owner approves the merge into the chosen `main`
- [ ] Deploy approval — owner approves; the `main` push deploys automatically (`github-pages.yml`)

## 4. Post-deploy

- [ ] Post-deploy smoke — run every item of section 5 within an hour of the deploy
- [ ] sitemap — `/sitemap.xml` has 0 LIVON URLs (closed) or 126 (open), never anything under `/livon/admin/`
- [ ] Search Console — later, only if index ON: submit the sitemap, inspect `/livon/` and two static pages

## 5. Post-deploy checklist

Run on `https://www.newon.app` after the deploy (not before; nothing here was run against production).

| Check | Expected |
|---|---|
| `/livon/` | 200; seven main views open from the nav; no console error |
| `/livon/#life`, `#today`, `#life-now`, `#explore`, `#community`, `#livon-ai`, `#help` | each renders content; back/forward works |
| Help | `#help/a/no-signup`, `#help/status` and `/livon/help/no-signup/` render; status matches the decision (AI off unless option B) |
| SEO pages | `/livon/life/20s/`, `/livon/life/20s/first-job/`, `/livon/life-events/startup/` → 200 |
| robots | `/robots.txt` allows `/livon/`; page `robots` meta = `noindex, nofollow` on `/livon/` (closed) or `index, follow` (open) |
| canonical | `https://www.newon.app/livon/…` on each static page |
| sitemap | as section 4 |
| assets | logo, topic photos, `seo.css`, scripts load (no 404 in the Network panel) |
| video | one film request per opened screen; no repeating requests |
| console | no error on the seven views |
| network | no request to Firebase/identitytoolkit, OpenAI, Upstash or provider hosts; at most one `/api/health` and one `/api/livon/data?action=status` (404 on Pages is expected in option A) |
| 404 | `/livon/life/20s/no-such-topic/` → 404 page |
| mobile | 390 px: no sideways scroll on the seven views |
| Admin | `/livon/admin/` → 404 |
