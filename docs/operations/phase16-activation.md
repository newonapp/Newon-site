# NEWON HQ Phase 16 — Production Activation

**Status:** code readiness for Archive Sync. **No production deploy** until the operator explicitly confirms Billing/Blaze/Secret setup and requests deploy.

| Path | State |
|---|---|
| Webhook `inquiryIngest` | **NOT RECOMMENDED / NOT DEPLOYED** |
| Archive `syncFormSubmitInquiries` | **RECOMMENDED / NOT DEPLOYED** (awaiting user actions) |
| Waitlist | `WAITLIST_PIPELINE_ENABLED=false` |
| Firestore Rules | Admin-only — **do not change for this phase** |

---

## 1. User-required Console actions (do these yourself)

Cursor must **not** perform Billing, Secret value entry, or production deploy without your explicit go-ahead.

### A. Firebase project

Confirm active project is **`newon-hq`**.

- Console: https://console.firebase.google.com/project/newon-hq  
- CLI (from `ingest/`): `firebase use` → should print `newon-hq`

### B. Blaze plan

Cloud Functions (scheduled) require the **Blaze** (pay-as-you-go) plan.

- Console → Project settings → Usage and billing → confirm Blaze

### C. Billing account

Confirm a Google Cloud Billing account is linked to `newon-hq`.

### D. Budget + Budget Alert (required before deploy)

Create a **low monthly budget** appropriate for early-stage traffic and attach **budget alerts** (e.g. 50% / 90% / 100%).

**Important:** Budget alerts are **not a hard spend cap**. They notify; they do not automatically stop all charges.

Suggested starting point for early archive sync (very rough): a low single-digit to low tens of USD/month budget with alerts — adjust after 72h of real usage.

Console path (typical):

Google Cloud Console → Billing → Budgets & alerts → Create budget  
(scope: project `newon-hq`)

### E. Firestore location

Confirm Firestore database location for `newon-hq`.

Function code region: **`asia-northeast3`** (Seoul).

| If Firestore is… | Verdict |
|---|---|
| `asia-northeast3` (or multi-region that includes Seoul proximity) | **GO** |
| Far region (e.g. `us-central1`, `europe-west1`) | Evaluate latency/cost; **CHANGE REQUIRED** only if cross-region cost/latency is unacceptable — do not change region casually |

### F. FormSubmit API key

1. Request/confirm API key via FormSubmit’s documented get-apikey flow (operator email only).  
2. **Do not paste the key into Cursor chat, HTML, JS, or git.**  
3. Register as a Firebase/Google Secret interactively:

```bash
cd ingest
firebase functions:secrets:set FORMSUBMIT_API_KEY --project newon-hq
```

CLI prompts for the value. Leave the key out of shell history if possible (prefer interactive prompt).

---

## 2. Code / deploy readiness (repo)

| Item | Expected |
|---|---|
| `.firebaserc` (`ingest/`) | `default: newon-hq` |
| Export name | `syncFormSubmitInquiries` only for this deploy |
| Schedule | `every 30 minutes`, `timeZone: Asia/Seoul` |
| Runtime | `maxInstances: 1`, `minInstances: 0`, `memory: 256MiB`, `timeoutSeconds: 20` |
| Secret binding | `defineSecret("FORMSUBMIT_API_KEY")` + `secrets: […]` |
| Historical guard | default **blocks** full archive import (`importExisting=false`; cutoff = `ARCHIVE_SYNC_NOT_BEFORE` or prior `notBeforeIso` or **sync start time**) |
| Dry-run | `--dry-run` / `dryRun: true` — no `hq_leads` / dedupe / sync-state writes |
| Webhook | exported in package but **must not** be deployed in Phase 16 |
| Public site / `_publish/ingest` | must remain absent |

---

## 3. Historical import guard

Default production behavior **must not** dump the entire FormSubmit archive into `hq_leads` on first sync.

| Mode | Behavior |
|---|---|
| Default | Skip submissions with `submitted_at` **before** cutoff |
| `ARCHIVE_SYNC_NOT_BEFORE=<ISO>` | Explicit cutoff |
| Prior `hq_sync_state.notBeforeIso` | Reused after first bootstrap |
| First run with no env/state | Cutoff = **sync start** → existing archive rows skipped |
| `ARCHIVE_SYNC_IMPORT_EXISTING=true` or CLI `--import-existing` | Explicit full import (operator-only) |

---

## 4. Dry-run (before first write)

Fixture (no secrets):

```bash
npm run sync:archive:fixture
# or
node ingest/scripts/manual-archive-sync.mjs --fixture ingest/test/fixtures/archive-ok.json --dry-run
```

Live (after secret/ADC available; still **no writes** with `--dry-run`):

```bash
# Counts only — PII-safe logs
FORMSUBMIT_API_KEY=… node ingest/scripts/manual-archive-sync.mjs --dry-run

# To count historical rows that would import if allowed:
FORMSUBMIT_API_KEY=… node ingest/scripts/manual-archive-sync.mjs --dry-run --import-existing
```

Expect counts: `fetched`, `valid`, `invalid`, `wouldInsert`, `wouldDuplicate`, `skippedHistorical` — no lead writes.

---

## 5. Deploy scope (only after explicit approval)

**Allowed:**

```bash
cd ingest
firebase deploy --only functions:syncFormSubmitInquiries --project newon-hq
```

**Forbidden without separate approval:**

- `firebase deploy`
- `firebase deploy --only functions`
- webhook `inquiryIngest`
- Firestore Rules publish
- TTL enable
- Waitlist enable

Deploying a **scheduled** function may create Cloud Scheduler / Eventarc resources. Confirm only **one** schedule for this function (`every 30 minutes`).

---

## 6. First production run strategy

1. Deploy (if approved).  
2. Prefer **manual invoke** from Cloud Console (Functions → `syncFormSubmitInquiries` → Testing / Run) or dry-run CLI **before** waiting for the first scheduler tick.  
3. Do **not** add a new public HTTP endpoint.  
4. With default guard, first real sync should import **only** submissions at/after bootstrap cutoff — not the full history.  
5. If you intentionally want history: set `ARCHIVE_SYNC_IMPORT_EXISTING=true` (or `--import-existing`) after a dry-run count review.

---

## 7. Smoke test (only after deploy)

1. Submit **one** real inquiry → FormSubmit email arrives → after sync, `hq_leads` +1 with `source=formsubmit_archive`, `status=new`, `providerSubmittedAt` + `ingestedAt`.  
2. Re-run sync immediately → no new lead; duplicates increase.  
3. HQ: New inquiries KPI, pipeline, list, detail, activity, System Health.  
4. PII: activity/logs must not show email/message/API key.

---

## 8. TTL (separate from Function deploy)

After Function stability is confirmed, enable Firestore TTL yourself:

- Collection group / collection: `hq_ingest_dedupe`  
- Field: `expiresAt`  
- Retention written by code: **14 days**

Do **not** enable TTL in the same step as the first Function deploy.

---

## 9. Cost monitoring (24–72h)

Watch: Function invocations, runtime, Scheduler runs, Firestore reads/writes, Secret Manager access, Logging volume, unexpected errors. Confirm no extra polling beyond the 30-minute schedule.

---

## 10. Failure / abort conditions

Stop deploy if any of: project mismatch, Billing/Blaze uncertain, no budget alert, API key/secret not ready, secret binding missing, severe region mismatch, tests failing, no historical guard, scheduler duplication risk, secrets in repo, Rules change required.

---

## Related

- `docs/operations/formsubmit-archive-sync.md`
- `docs/operations/production-gate.md`
- `ingest/STATUS.md`
