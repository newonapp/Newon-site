# Newon production monitoring

Read-only synthetic checks for `https://www.newon.app`.  
Goal: detect outages and broken critical surfaces **before** users report them.

## What is monitored

| Surface | Method |
|--------|--------|
| Critical routes (home, products, business, contact, inquiry) | HTTP + structural content markers |
| 11 product portfolio pages | HTTP + `pf-main` / brand markers |
| NEWON Business & Partnerships screens (Overview, Our Platforms, Business Models, Partnerships) | HTTP + markers (hub sub-menu with the screen current) |
| Retired business URLs (build, automation, research, solutions, care, mvp) | Redirect stub: 200 + noindex + canonical + meta refresh to the screen in `LEGACY_REDIRECTS`, and the destination must load |
| Portfolio / store / tools / sample delete-account | HTTP |
| Custom 404 behavior | Intentional missing path |
| Critical CSS/JS/logo assets | HEAD with GET fallback |
| Inquiry form (`/ko/business/inquiry/`) and unified Contact form (`/ko/contact/`, `#ct-form`) structure + FormSubmit endpoint in `business/inquiry.js` / `contact/contact-page.js` | Markers only |
| HQ `/admin/` public shell | Reachable + `noindex` + login control |
| App Store / Google Play URLs | HTTP (inventory from locales); an App Store developer page used instead of a listing (Newon+) is probed too and must exist |

## What is not monitored

- All ~973 sitemap URLs every run
- Every image / every locale
- FormSubmit **delivery** (no automatic inquiry POST)
- Firebase Auth / Firestore / quotas / billing
- HQ login or private client data
- Client-side JS runtime errors (Sentry etc.) — future option
- Analytics anomaly engine

## Run locally

```bash
npm run monitor:production
# or
node scripts/monitoring/check-production.mjs

# Post-deploy style (critical routes only, no store)
npm run monitor:production:smoke

# Skip store probes
node scripts/monitoring/check-production.mjs --no-store
```

Writes:

- `reports/monitoring-latest.json`
- `reports/monitoring-latest.md`

These files are **not** auto-committed by scheduled CI.

## Run in GitHub Actions

Workflow: `.github/workflows/production-monitor.yml`

- Schedule: every 6 hours
- Manual: Actions → **Production monitor** → Run workflow
- Permissions: `contents: read` only
- Uploads JSON/MD as artifacts
- Does **not** deploy, regenerate content, or write production

Post-deploy smoke (report-only) runs after Pages publish in `github-pages.yml`.

## Status meanings

| Status | Meaning |
|--------|---------|
| PASS | Expected HTTP + markers (or expected 404 behavior) |
| WARN | Slow response, rate-limit, non-fatal gap |
| FAIL | Broken route/asset/store listing after retries |
| UNKNOWN | Checker/network uncertainty — **not** treated as confirmed outage alone |

## Failure classification

| Class | Meaning |
|-------|---------|
| OUTAGE | Critical route unreachable / 5xx / soft-404 / timeout after retry |
| DEGRADED | Non-critical route/asset/config issue |
| EXTERNAL | App Store / Play / third-party |
| MONITORING_ERROR | Checker/network problem — do not treat as site outage |

Response-time alone never confirms an outage.

## Retry / timeout / concurrency

- Per-request timeout: 12s (override `NEWON_MONITOR_TIMEOUT_MS`)
- FAIL candidates: up to 2 retries with 1.5s delay
- Site concurrency: 3
- Store probes: sequential with delay (rate-limit aware)
- User-Agent: `NewonProductionMonitor/1.0 (+https://www.newon.app/; ops-health-check)`

## Manual checks

See `docs/operations/monitoring.md` (Firebase, FormSubmit delivery, store consoles, GitHub Pages).

## Privacy

- GET/HEAD only
- No cookies / auth headers / form payloads in logs
- No response body dump to CI logs
- No user tracking

## Incident flow

On FAIL → verify → determine scope → check latest deploy → classify severity →  
`docs/operations/incident-checklist.md` + `docs/operations/backup-recovery.md`  
No automatic rollback.

## Adding a new route

1. Confirm the URL exists in the repo / production.
2. Add an entry in `targets.mjs` with stable **structural** markers (IDs/classes), not full marketing copy.
3. Choose level + severity.
4. Run `npm run monitor:production` once.
5. Prefer smoke set only for true critical paths.

## Keeping targets in step with the site

`tests/monitoring/production-monitor.test.mjs` checks that every monitored marker exists in the committed pages, that the
business redirect stubs match `LEGACY_REDIRECTS` (scripts/render-bizpart.mjs), and — against a local fixture site — that
broken stubs, missing destinations and a missing contact form still FAIL. Run it whenever a monitored page is redesigned:

```bash
node --test tests/monitoring/production-monitor.test.mjs
```
