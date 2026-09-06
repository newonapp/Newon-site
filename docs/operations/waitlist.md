# Waitlist architecture (Phase 13)

**Status: schema ready. Ingest NOT live. HQ Waitlist KPI remains Not connected.**

Waitlist is email-oriented product interest signup. It is **not** a sales inquiry.

Do **not** write waitlist rows into `hq_leads`.

## Collection

`hq_waitlist` (Admin SDK / future ingest only; client Rules stay admin-only)

| Field | Notes |
|---|---|
| `email` | Required, normalized lowercase |
| `source` | e.g. `ai_hub`, `store_kit`, `newsletter` |
| `status` | `active` \| `invited` \| `converted` \| `unsubscribed` \| `spam` |
| `createdAt` / `updatedAt` | Server timestamps |
| `locale` | Optional |
| `page` | Optional landing path |
| `campaign` | Optional |
| `consentVersion` | Optional policy marker |
| `archived` | Boolean |
| `createdBy` | `system` when ingested |
| `ingestVersion` | `"1"` |

Code: `ingest/src/waitlist-schema.mjs`

## Public path today

`waitlist.js` → FormSubmit email only (unchanged).

Future (Phase 14+): FormSubmit webhook **or** dedicated waitlist function → `hq_waitlist`, with email-hash dedupe (separate from inquiry fingerprint).

## HQ

- Flag: `WAITLIST_PIPELINE_ENABLED = false` in `admin/hq-app.js`
- While false: dashboard shows **Not connected** for Waitlist (no fake zeros as “live”)
- When flipped true after ingest deploy: loads `hq_waitlist` and shows Total / Active / Converted / 7D signups; empty collection → Empty state
