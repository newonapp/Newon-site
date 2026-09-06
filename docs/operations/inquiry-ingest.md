# Inquiry → HQ leads ingest

**Status: CONDITIONAL GO (Phase 14).** Code ready; **production webhook not connected.**  
Public path remains **FormSubmit email-only** on GitHub Pages.

See **[production-gate.md](./production-gate.md)** for the GO/NO-GO decision, FormSubmit auth limits, smoke tests, and deploy commands (not executed in Phase 14).

## Architecture (target — not live)

```
Public form (unchanged)
  → FormSubmit AJAX (email)                         [PRODUCTION — keep]
  → [FUTURE] authenticated path only
       → Cloud Function inquiryIngest (Admin SDK)
            → validate / sanitize / rate-limit / safe log
            → atomic hq_ingest_dedupe + hq_leads
```

**Forbidden production default:** FormSubmit `_webhook` URL with `?k=<SECRET>` in public HTML, or relying on query secrets (log exposure).

**Function auth (code):** header `X-Newon-Ingest-Secret` / `X-Newon-Webhook-Secret` required.  
Query secret only if `NEWON_INGEST_ALLOW_QUERY_SECRET=true` (not recommended).

## Idempotency

- Fingerprint: provider id **or** `SHA-256(email|formType|normalizedMessage)` (no time bucket — see Phase 14 trade-off).
- Firestore **transaction** for dedupe + lead create.
- Dedupe TTL schema: `expiresAt` Timestamp, **14 days** (Console TTL not enabled yet).

## FormSubmit payload

Handler unwraps `{ form_data: { ... } }` envelopes.

## Cost / Functions defaults

| Setting | Value |
|---|---|
| project | `newon-hq` |
| region | `asia-northeast3` |
| maxInstances | 3 |
| minInstances | 0 |
| timeoutSeconds | 20 |
| memory | 256MiB |

Budget **alerts ≠ hard cap**.

## Local verification

```bash
npm run test:ingest
npm run check:ingest
npm run check:fast
node scripts/publish-site.mjs   # ingest/ must not appear in _publish/
```

## Rollback

Disable webhook (if ever connected) → email-only continues without Pages redeploy.

## Waitlist

Out of scope until inquiry path is stable. `WAITLIST_PIPELINE_ENABLED=false`.
