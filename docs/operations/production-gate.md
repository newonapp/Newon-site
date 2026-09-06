# NEWON HQ — Production Deployment Gate (Phase 14)

**Gate result: CONDITIONAL GO**  
*(Do not connect FormSubmit → Function webhook yet. Keep email-only production path.)*

This document is the Phase 14 gate. It does **not** authorize Blaze upgrade, secret creation, Function deploy, TTL enable, or webhook attach by itself.

---

## 1. FormSubmit webhook capability

Official docs document:

```html
<input type="hidden" name="_webhook" value="https://yourdomain.co/your-webhook">
```

Sample payload shape:

```json
{ "form_data": { "name": "...", "email": "...", "message": "..." } }
```

**Not documented:** custom `Authorization` / `X-*` secret headers, signed payloads, stable submission ids.

Implications:

| Risk | Detail |
|---|---|
| `_webhook` in public HTML | Webhook URL (and any `?k=`) is public |
| Query secret | Often appears in Cloud Run / load balancer request URL logs |
| No provider signature | Anyone who learns the URL can POST forged inquiries |

Code now unwraps `form_data` (`unwrapProviderPayload`).

---

## 2. Architecture options (A–D)

| Option | Security | Complexity | Cost | Secret exposure | Reliability | Maintenance | Fit for Newon now |
|---|---|---|---|---|---|---|---|
| **A. FormSubmit → Function `?k=`** | Weak | Low | Low | **High** (URL logs / HTML) | Medium | Low | **Reject as production default** |
| **B. FormSubmit → gateway that adds header → Function** | Strong | Medium | Low–Med | Low (header) | Medium | Medium | Good later |
| **C. Provider-signed webhook** | Strong | Low | Low | Low | High | Low | **Unavailable** (not documented) |
| **D. Email-only + optional server-side archive import / manual HQ** | Strong | Low | Near zero | None in browser | High (email proven) | Low | **Recommended now** |

### Authentication decision (production)

1. **Current production:** FormSubmit **email-only** (unchanged public forms).
2. **Function auth policy:** header-only  
   `X-Newon-Ingest-Secret` / `X-Newon-Webhook-Secret`  
   Query secret **disabled unless** `NEWON_INGEST_ALLOW_QUERY_SECRET=true` (compatibility; not recommended).
3. **Do not** ship `_webhook` with secrets in public HTML/JS.
4. **Preferred next ingest path (Phase 15+):**  
   - **B** small authenticated gateway, or  
   - **D+** scheduled Admin Function pulling FormSubmit submission archive with API key in Secret Manager (no public webhook URL).

---

## 3. Query secret risk

May appear in: Cloud Logging request URLs, reverse proxies, error reports, bookmarks, docs paste.

Referrer leakage is lower for server-to-server webhooks but **log exposure remains**.

**Production recommendation: do not use query secret.**

---

## 4. Firebase project alignment

| Surface | Expected |
|---|---|
| Project ID | `newon-hq` |
| Client config | `admin/firebase-config.js` → `projectId: "newon-hq"` |
| Rules | `firestore.rules` (admin UID only) |
| Functions deploy flag | `--project newon-hq` |
| Region (code) | `asia-northeast3` (Seoul) |
| Runtime guard | `EXPECTED_PROJECT_ID` in `cloud-function.mjs` |

Confirm Firestore database **location** in Console before first deploy; keep Functions region aligned with latency needs (Seoul is appropriate for KR-first). Do not change region casually.

---

## 5. Functions configuration (code defaults)

| Setting | Value |
|---|---|
| `maxInstances` | **3** |
| `minInstances` | **0** (no idle cost) |
| `timeoutSeconds` | **20** |
| `memory` | **256MiB** |
| `region` | `asia-northeast3` |

---

## 6. Cost guardrails (before Blaze)

- [ ] Google Cloud Billing linked to `newon-hq`
- [ ] Budget created (e.g. modest monthly)
- [ ] Budget **alert** emails configured  
  **Note: Budget alerts are not a hard spending cap.** They notify; they do not freeze spend at $0.
- [ ] `maxInstances` ≤ 5 (code: 3)
- [ ] `minInstances = 0`
- [ ] Estimate monthly inquiries (e.g. &lt; 1k) recorded
- [ ] Abuse: secret required, honeypot, 24KB cap, rate limit
- [ ] Logging: PII-safe events only

---

## 7. Transaction & dedupe

Single transaction:

1. Read `hq_ingest_dedupe/{id}`
2. If exists → return existing lead id (`duplicate`)
3. Else create `hq_leads` + dedupe doc with `expiresAt` Timestamp

Retries / concurrent webhooks → one lead (unit-tested).

Fingerprint: `email|formType|message` hash (no time bucket) — see trade-off in `dedupe.mjs` comments. Keep until provider id exists.

TTL field `expiresAt` is Firestore `Timestamp`. **14 days.** Expired docs may linger briefly after TTL; harmless (hash ids, no PII). **Do not enable Console TTL until deploy phase.**

---

## 8. Waitlist

`WAITLIST_PIPELINE_ENABLED = false` — **out of scope** for this gate.

---

## 9. Production smoke tests (after a future approved connect)

| ID | Action | Expect |
|---|---|---|
| A | Valid inquiry | 1 email + 1 `hq_leads` (`new` / `public_contact`) + KPI/activity |
| B | Replay same payload | No second lead; `duplicate` |
| C | Wrong/missing auth | No Firestore write |
| D | Honeypot filled | No lead |
| E | `<script>` in message | Stored sanitized; HQ text-only render |
| F | Function down / webhook disabled | FormSubmit **email still works** |

---

## 10. Observability (minimal)

Cloud Functions metrics: invocations, errors, 4xx/5xx.  
App logs: `accepted` / `duplicate` / `validation_failed` / `write_failed` / `unauthorized` — **no PII**.

---

## 11. Rollback

1. Disable FormSubmit webhook / remove `_webhook` (if ever added)  
2. Confirm email-only still works (**no Pages redeploy required** for dashboard webhook disable)  
3. Leave Function idle or undeploy later  
4. Fix → re-enable only with approved auth path  

---

## 12. Deployment commands (DO NOT RUN in Phase 14)

Placeholders only — never paste real secrets into git/chat logs.

```bash
# 0) Confirm project
firebase projects:list
firebase use newon-hq
# expect projectId newon-hq

# 1) Billing + budget alerts in Cloud Console (manual UI)

# 2) Secret (interactive — do not echo value)
firebase functions:secrets:set NEWON_INGEST_WEBHOOK_SECRET --project newon-hq

# 3) Install + deploy function only
cd ingest
npm install
npx firebase-tools deploy --only functions:inquiryIngest --project newon-hq

# 4) TTL (Console): collection hq_ingest_dedupe, field expiresAt — after deploy

# 5) Do NOT set FormSubmit _webhook with ?k= in public HTML
# Prefer header-auth gateway or archive API import before connecting.
```

---

## Preferred ingest path (Phase 15+)

**FormSubmit Archive API sync** (`syncFormSubmitInquiries`) — see `formsubmit-archive-sync.md`.  
Webhook / query-secret remains **NO-GO**.

## 13. GO / NO-GO

| Decision | Scope |
|---|---|
| **CONDITIONAL GO** | Archive sync code ready; deploy only after Blaze + `FORMSUBMIT_API_KEY` + scheduler |
| **NO-GO (now)** | FormSubmit → Function via query secret / public `_webhook` |
| **GO (current site)** | Keep GitHub Pages + FormSubmit email-only |

**Phase 14/15 performed:** code + docs only. **No** Blaze, billing, deploy, secret, TTL, scheduler, or webhook changes in production.
