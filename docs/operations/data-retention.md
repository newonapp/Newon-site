# HQ data retention (operational guidance — not legal advice)

This note proposes retention principles for Newon HQ Firestore data. It is **not** a substitute for Korean Personal Information Protection Act (PIPA) legal counsel.

## Principles

1. Collect the **minimum** PII needed to respond / deliver.
2. Do not keep personal data longer than the **stated business purpose**.
3. Prefer **archive** (HQ soft-archive) before hard delete when accounting/history needs a pointer.
4. Separate **sales inquiry** (`hq_leads`) from **waitlist** (`hq_waitlist`) and from **client/contract** records.

## `hq_leads`

| Category | Suggested approach |
|---|---|
| **Spam** | Short retention (e.g. 30–90 days) then delete/hard-purge; mark `spam` immediately |
| **Lost / abandoned** (no reply, no contract) | Medium (e.g. 6–12 months) then anonymize or delete |
| **Won / contracted** | Keep operational fields only as needed; move durable facts to `hq_clients` / `hq_documents` / finance; avoid indefinite full message bodies |
| **Active / reviewing** | Retain while pipeline is open |

Automated TTL on `hq_leads` is **not** enabled in Phase 13. Prefer manual HQ archive + future scheduled job after policy sign-off.

## `hq_waitlist`

| Status | Suggested approach |
|---|---|
| `active` | Keep while campaign is live + consent valid |
| `unsubscribed` / `spam` | Short retention then delete |
| `converted` | Prefer link to client id; drop email from waitlist when no longer needed |

## `hq_ingest_dedupe`

Operational only — **14-day TTL** on `expiresAt` (see `inquiry-ingest.md`). No PII in document ids.

## Analytics

Public `analytics.js` must never receive email/phone/name/message. HQ dashboards must not push lead PII into analytics events.
