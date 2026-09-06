# FormSubmit Archive Sync (Phase 15–16)

**Recommended production path** (not deployed yet).  
Webhook ingest remains **NOT RECOMMENDED / NOT DEPLOYED**.

Phase 16 activation checklist (Billing / Secret / deploy policy): `docs/operations/phase16-activation.md`.

## Architecture

```
GitHub Pages public form
  → FormSubmit AJAX
  → Email (always — keep)

Scheduled Function syncFormSubmitInquiries  [future deploy]
  → GET https://formsubmit.co/api/get-submissions/<API_KEY>
  → validate / normalize / atomic dedupe
  → hq_leads (source: formsubmit_archive)
  → hq_sync_state/formsubmit
```

Public browser never sees the API key.

## Official API (documented)

- Get key: `GET https://formsubmit.co/api/get-apikey/<email>` (operator only; key emailed)
- Submissions: `GET https://formsubmit.co/api/get-submissions/<API_KEY>`
- Sample item: `{ form_url, form_data, submitted_at: { date, timezone_type, timezone } }`

**Unknown / not assumed:** pagination, max result count, retention length, rate-limit headers, stable submission id beyond content+timestamp.

Strategy: **full response + deterministic dedupe** (safe for small volume). No invented pagination.

## Secrets

| Secret | Use |
|---|---|
| `FORMSUBMIT_API_KEY` | Archive GET path (server only) |

Never commit, never put in HTML/JS/`_publish`, never log.

## Timestamps

| Field | Meaning |
|---|---|
| `providerSubmittedAt` | Parsed FormSubmit `submitted_at` |
| `createdAt` | Provider time when parseable; else server time |
| `ingestedAt` | HQ sync write time |

Malformed `submitted_at` → skip record (no invented clock).

## Dedupe

`SHA-256(archive:v1\|form_url\|email\|message\|submitted_at_iso)` → `hq_ingest_dedupe` via **transaction**.

Same email/message with **different** `submitted_at` → distinct leads.

## Sync state (`hq_sync_state/formsubmit`)

status, lastAttemptAt, lastSuccessfulSyncAt, lastProviderTimestamp, notBeforeIso, processed/inserted/duplicates/skipped/skippedHistorical/errors, syncVersion — **no PII**.

## Historical import guard

Default: **do not** import the full archive on first sync.  
Cutoff: `ARCHIVE_SYNC_NOT_BEFORE` → prior `notBeforeIso` → else sync start time.  
Full history only with explicit `ARCHIVE_SYNC_IMPORT_EXISTING=true` / `--import-existing`.

## Scheduler

**Every 30 minutes**, `timeZone: Asia/Seoul`, `minInstances=0`, `maxInstances=1`, `memory: 256MiB`, `timeoutSeconds: 20`, region `asia-northeast3`.  
Created only when `syncFormSubmitInquiries` is deployed (not done yet).

## Manual sync

```bash
# Fixture (no secrets / no network)
npm run sync:archive:fixture
node ingest/scripts/manual-archive-sync.mjs --fixture ingest/test/fixtures/archive-ok.json --dry-run

# Live dry-run (no writes) — after API key available
FORMSUBMIT_API_KEY=… node ingest/scripts/manual-archive-sync.mjs --dry-run

# Live write (Phase 16+ only when approved)
FORMSUBMIT_API_KEY=… node ingest/scripts/manual-archive-sync.mjs
FORMSUBMIT_API_KEY=… node ingest/scripts/manual-archive-sync.mjs --import-existing
```

## HQ

- Lead `source: formsubmit_archive`, `ingestVersion: archive-1`
- Health row reads `hq_sync_state/formsubmit` → Not configured / Healthy / Stale / Error / Warning (never hard-coded Healthy)

## Email fallback

If sync is down, FormSubmit email still works. Treat sync downtime as ops risk; do not hard-code FormSubmit retention days in code.

## Related

- `docs/operations/production-gate.md` (webhook NO-GO)
- `ingest/STATUS.md`
