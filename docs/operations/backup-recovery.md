# Newon Backup & Recovery

Operational foundation for rollback and disaster response.  
**No production destructive tests. No automatic Firestore restore. No Rules auto-deploy.**

Full procedures live here. HQ Settings → **Export HQ backup** performs read-only JSON download (admin session only).

---

## 1. Systems

| System | Owner | Source of Truth | Backup | Recovery |
|--------|-------|-----------------|--------|----------|
| Git repo (`Newon-site`) | Newon | `origin/main` | Remote + local clone | `git revert` / checkout known-good |
| GitHub Pages | Newon | `_publish/` via Actions → `gh-pages` | Regenerable from `main` | Re-run workflow / revert + push |
| Public website content | Newon | Git (locales, templates, scripts) | Git | Rebuild + deploy |
| HQ admin UI | Newon | Git `admin/` | Git | Deploy via Pages |
| Firestore HQ data | Newon | Firebase project | **Manual HQ export** (+ Console/GCP if available) | Manual restore (documented) |
| Firestore Rules | Newon | Repo `firestore.rules` + Console | Git + Console copy | Console paste known-good |
| Firebase Auth | Google/Firebase | Console | N/A (account) | Console / provider recovery |
| FormSubmit | External | Inbox email | External | Dependency outage |
| App Store / Play | External | Store consoles | External | Dependency outage |
| Analytics | External / dataLayer | Optional provider | N/A | Disable broken tags |

---

## 2. Recovery priority (tiers)

### TIER 0 — CRITICAL
- Firestore HQ operational data (`hq_clients`, `hq_companies`, `hq_projects`, `hq_documents`, `hq_finance`, …)
- Firebase Auth admin access + UID allowlist alignment
- Git repository (`main`)
- `firestore.rules` (repo + Console)

### TIER 1 — IMPORTANT
- Public website production (Pages)
- Business inquiry workflow
- Locales / pricing / catalog SoT in Git
- GitHub Actions deploy workflow

### TIER 2 — REGENERABLE
- Generated HTML in `_publish/` / `gh-pages`
- `reports/*.json` health/reliability outputs
- Translate cache, build artifacts

### Collection classification (actual HQ names)

| Collection | Tier |
|------------|------|
| `hq_clients` | CRITICAL |
| `hq_companies` | CRITICAL |
| `hq_projects` | CRITICAL |
| `hq_documents` | CRITICAL |
| `hq_finance` | CRITICAL |
| `hq_leads` | CRITICAL |
| `hq_milestones` | IMPORTANT |
| `hq_tasks` | IMPORTANT |
| `hq_releases` | IMPORTANT |
| `hq_products_meta` | IMPORTANT |

---

## 3. RPO / RTO (realistic)

| Surface | RPO | RTO | Notes |
|---------|-----|-----|-------|
| Public website | Last good Git commit | 30–60 min | Automated via Actions |
| HQ source (`admin/`) | Last good Git commit | 30–60 min | Same Pages pipeline |
| Firestore data | Last **manual** export (weekly suggested) | Hours | Managed export: **MANUAL/UNKNOWN** (plan-dependent) |
| Rules | Last Git + Console copy | 30–60 min | Manual Console apply |

Do not assume Firebase PITR / scheduled exports without Console verification.

---

## 4. Git backup

- Remote: `origin` → `https://github.com/newonapp/Newon-site.git`
- Default working branch: `main`
- Deploy branch: `gh-pages` (orphan force from Actions)
- Secrets stay out of Git (`.env` gitignored)
- Do **not** commit HQ backup JSON

### Last Known Good

Record after successful production smoke:

- `main` commit SHA
- Actions run URL / ID
- timestamp (UTC)

Optional tag (sparingly): `prod-YYYYMMDD-N`

---

## 5. Website rollback (prefer revert)

1. Identify broken production (smoke: Home, Business, Inquiry).
2. Find last known good SHA + bad commit(s).
3. `git revert <bad-sha>` (or revert range) — **not** `reset --hard` + force push as default.
4. Local check / `node scripts/publish-site.mjs` if needed.
5. Push `main` → wait for Actions success.
6. Production smoke again.
7. Document cause.

---

## 6. GitHub Pages recovery

Workflow: `.github/workflows/github-pages.yml`  
Build: `node scripts/publish-site.mjs` → `./_publish` → `peaceiris/actions-gh-pages` → `gh-pages`.

| Symptom | Action |
|---------|--------|
| Actions fail | Fix build; re-run workflow_dispatch |
| Bad content live | Revert on `main` and redeploy |
| `gh-pages` weird | Re-run publish (orphan republish) |
| Permissions | Workflow needs `contents: write` |

---

## 7. Firestore backup capability

| Method | Status |
|--------|--------|
| HQ Settings → Export HQ backup | **Implemented** (read-only, browser download) |
| Firebase / GCP managed export | **MANUAL** — confirm in Console/plan |
| Console document export | **MANUAL** |
| Automatic scheduled backup | **Not in this phase** |

---

## 8. HQ export tool

- Location: HQ → **Settings** → Backup
- AuthZ: existing Firebase Auth + ADMIN_UID gate (export only after authorized shell)
- Reads only: `getDocs` per collection
- Download: `newon-hq-backup-YYYY-MM-DD-HHmm.json`
- Not written to `reports/`, not committed, not uploaded

### Format

```json
{
  "schemaVersion": 1,
  "kind": "newon-hq-firestore-backup",
  "generatedAt": "…",
  "warning": "Contains private business data…",
  "collectionCounts": { "hq_projects": 0 },
  "collections": {
    "hq_projects": [{ "id": "…", "data": { } }]
  }
}
```

Timestamps serialize as `{ "__type": "timestamp", "seconds", "nanoseconds", "iso" }`.

### Verification after export

- JSON parses
- `schemaVersion === 1`
- `generatedAt` present
- `collectionCounts` present
- collections keys match expected list
- file stored in **private** encrypted storage (not Git/Slack/public Drive)

---

## 9. Restore policy

**Backup = tooling OK. Restore = manual only in this phase.**  
No automatic restore UI/script writing to production.

### Cases

**A — Single doc deleted**  
Stop further edits → locate backup → find doc id → Console/manual recreate from backup JSON → validate related refs → review.

**B — Partial collection loss**  
Export current state first → scope IDs → restore from latest backup document-by-document → count check.

**C — Bad bulk update**  
Stop writes → export current → compare backup → selective field restore → validate.

**D — Rules wrong**  
Diff Console vs `firestore.rules` → apply known-good from Git via Console → verify signed-out deny + admin allow. **No auto-deploy from this phase.**

**E — Wide data incident**  
SEV-1: contain, preserve evidence, export current, escalate to managed restore if available, validate, postmortem.

---

## 10. Auth recovery

- Session/browser: sign out, clear site data, retry Google sign-in.
- Unauthorized Google account: expected deny — use authorized admin account.
- UID mismatch after account change: update allowlist in `admin/firebase-config.js` **and** `firestore.rules` together; deploy carefully (separate change window). **No public bypass.**
- Provider outage: wait / Firebase status — dependency incident.

---

## 11. External dependencies

| Outage | Newon can restore? |
|--------|--------------------|
| GitHub / Actions | Partial (local git) |
| Firebase | Limited (exports / Console) |
| FormSubmit | No — wait / alternate mailto |
| App Store / Play | No |
| Analytics CDN | Disable / remove tag |

---

## 12. Incident severity

- **SEV-1:** unauthorized private access, major data loss, credential leak, HQ full outage in ops
- **SEV-2:** major feature down, severe bad deploy, partial data corruption
- **SEV-3:** degraded feature / integration failure
- **SEV-4:** cosmetic / minor ops

### Response flow

Detect → Confirm → Contain → Preserve → Backup current → Recover → Validate → Resume → Document → Prevent.

---

## 13. Emergency checklist

```
NEWON INCIDENT CHECKLIST
□ Production impact confirmed (public / HQ / data)
□ Stop further deploys / risky writes
□ Firestore write freeze needed? (yes/no)
□ Problem commit / change identified
□ Current state backed up (HQ export if data risk)
□ Last Known Good identified
□ Rollback or manual restore executed
□ Production / HQ QA passed
□ Root cause noted
□ Follow-ups scheduled
```

### Backup before risky change

Before Rules change, schema change, bulk edit, migration, auth config change:

1. HQ Export JSON  
2. Note `main` SHA  
3. Copy Console Rules text  
4. Proceed in a controlled window  

---

## 14. Frequency & retention

| Asset | Frequency |
|-------|-----------|
| Git | Every change push |
| HQ Firestore export | **Weekly** minimum; before risky changes |
| After first real clients | Consider daily / managed backup (**MANUAL**) |

Retention suggestion: keep last **4 weekly** + **3 monthly** exports (adjust if volume tiny).

Store on encrypted disk / access-limited private drive. **Not** GitHub, Slack, public Drive, email blasts, `reports/`.

---

## 15. Firebase Console manual checklist

- [ ] Project ID matches `admin/firebase-config.js`
- [ ] Published Rules match repo `firestore.rules`
- [ ] Auth providers (Google) as expected
- [ ] Authorized admin account still valid
- [ ] Backup / export / PITR availability on current plan (**UNKNOWN until checked**)
- [ ] Billing alerts configured

---

## 15b. Monitoring → incident

Production monitoring (`scripts/monitoring/`, Actions **Production monitor**) is read-only.

On **FAIL / OUTAGE**:

1. Verify (re-run monitor + browser)
2. Determine scope
3. Check latest deploy
4. Classify severity
5. Follow this runbook + `docs/operations/incident-checklist.md`

Details: `docs/operations/monitoring.md`. No automatic rollback.

Repo / CI maintenance (SoT, fast checks, deploy flow): `docs/operations/repo-ci-maintenance.md`.

---

## 16. Security constraints

- No ADMIN_UID bypass for backup
- No public export endpoint
- No analytics on backup contents
- No `console.log` of backup payloads
- Backup files gitignored (`backup/`, `backups/`, `*hq-backup*.json`)

---

## 17. Restore drills

Do **not** restore against production for practice. When a staging Firebase project exists later, run restore drills there. **Do not create a new Firebase project in this phase.**
