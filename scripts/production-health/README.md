# Production Health Check (11 Newon apps)

Read-only / static production readiness audit for Newon’s consumer products.

This repository is the **public website**. Flutter app sources are **not** vendored here. The checker audits everything available in-repo (store URLs, delete-account pages, package IDs, website secrets) and optionally audits Flutter projects when you point it at them.

## Run

```bash
# Website-side audit (default)
node scripts/production-health/check-apps.mjs

# Also HTTP-probe App Store / Play URLs
node scripts/production-health/check-apps.mjs --probe-store

# Enable Flutter static audits (pubspec, Firebase deps, debug remnants, …)
NEWON_APPS_ROOT=/path/to/parent-of-app-repos node scripts/production-health/check-apps.mjs
```

Or via npm:

```bash
npm run health:apps
npm run health:apps:probe
```

## Outputs

| File | Purpose |
|------|---------|
| `reports/production-health.json` | Machine-readable (HQ-ready schema v1) |
| `reports/production-health.md` | Human-readable report |

**Never** written into reports: secret values, API keys, private keys, Firebase UIDs, passwords.

## Status meanings

| Status | Meaning |
|--------|---------|
| **PASS** | Confirmed OK from available evidence |
| **WARN** | Likely works but needs confirmation or improvement |
| **FAIL** | High likelihood of a real production problem |
| **UNKNOWN** | Cannot judge from code/config alone (often needs Flutter source or Console) |
| **N/A** | Not applicable (e.g. no IAP dependency) — excluded from health score denominator |

## What is checked

1. **Inventory** — 11 products, Play `applicationId` from locale SoT, store URLs, delete-account paths  
2. **Website surface** — delete-account pages, privacy/terms presence, Play/App Store URL shape & package match  
3. **Optional store HTTP probe** — `--probe-store`  
4. **Optional Flutter audit** — `pubspec.yaml`, Android/iOS config presence, Firebase/IAP/Crashlytics/Analytics deps, localhost / privileged-secret patterns, coarse critical-flow keywords  
5. **Secrets** — privileged credentials / service accounts / private keys (Firebase *client* config is not auto-flagged as a leak)  
6. **HQ note** — `firestore.rules` belongs to HQ (`newon-hq`), not per-app consumer Firebase  

## Health score

Weights (only applicable categories count):

| Category | Weight |
|----------|--------|
| Build / Release | 20 |
| Firebase / Data | 20 |
| Security | 20 |
| Core Flow | 15 |
| Payments | 10 |
| Error Monitoring | 5 |
| Privacy | 5 |
| Store / Distribution | 5 |

Status → points factor: PASS 1.0, WARN 0.55, UNKNOWN 0.35, FAIL 0.0.  
**N/A** categories are removed from the denominator (apps without payments are not penalized).

Overall label: **HEALTHY** (≥85, no FAIL), **WATCH** (≥70), **AT_RISK** (else or any FAIL), **INCOMPLETE** (Flutter source not linked — website-only audit).

## Manual checks (typical)

- Flutter source clone / `NEWON_APPS_ROOT`
- Firebase Console rules & Auth providers per app
- App Store Connect / Play Console listings & IAP products
- Crashlytics / Analytics dashboards
- In-app privacy / family sharing for BabyLog, PetLog, Pillmate
- Runtime critical flows (habit, meds, etc.)

## Add a new app

1. Add an entry to `config.mjs` → `APPS` (ids, locale ns, Play package id, critical flows).  
2. Ensure `locales/en.json` has `appStoreUrl` / `googlePlayUrl` under that ns.  
3. Ensure delete-account pages exist under `/{lang}/{webPathSegment}/delete-account/`.  
4. Optionally set `FLUTTER_ROOTS[id]` or place the project under `NEWON_APPS_ROOT`.  
5. Re-run the checker.

## HQ compatibility

`production-health.json` is structured for a future **HQ → Products → Health** (or Operations → Product Health) reader. This work does **not** wire HQ UI.

## Safety

- No mass auto-fix of app code  
- No Firebase / Auth / payment architecture changes  
- No rules deploy  
- No GitHub Pages deploy required for this tooling  

## Priority labels

- **P0** — security / data loss / outage risk  
- **P1** — payment / auth / core / store listing  
- **P2** — ops stability / analytics / monitoring  
- **P3** — improvements  
