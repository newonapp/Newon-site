# Newon Monitoring Operations

Companion to `scripts/monitoring/`. Phase 9 foundation: **DETECT → VERIFY → REPORT**.

No auto-repair. No admin credentials in CI. No PII collection.

---

## Monitoring matrix

| Target | Type | Method | Frequency | Timeout | Retry | Severity | Automated / Manual |
|--------|------|--------|-----------|---------|-------|----------|--------------------|
| Homepage `/` `/ko/` `/en/` | HTTP/content | GET + markers | 6h + post-deploy smoke | 12s | 2 | P1 | Automated |
| Products `/ko/products/` | HTTP/content | GET + markers | 6h + smoke | 12s | 2 | P1 | Automated |
| Business `/ko/business/` | HTTP/content | GET + markers | 6h + smoke | 12s | 2 | P1 | Automated |
| Inquiry page + form markers | HTTP/form | GET + structure | 6h + smoke | 12s | 2 | P1 | Automated |
| Inquiry FormSubmit **delivery** | External | Inbox test | As needed | — | — | P1 | Manual / External |
| Contact page + form | HTTP/form | GET + structure | 6h | 12s | 2 | P1 | Automated |
| Contact delivery | External | Inbox test | As needed | — | — | P1 | Manual / External |
| 11 product portfolio pages | HTTP/content | GET | 6h | 12s | 2 | P2 | Automated |
| Core business service pages | HTTP/content | GET | 6h | 12s | 2 | P2 | Automated |
| Portfolio / store / tools | HTTP/content | GET (`/ko/resources/store/` for store) | 6h | 12s | 2 | P2–P3 | Automated |
| Delete-account samples | HTTP/content | GET | 6h | 12s | 2 | P2 | Automated |
| 404 behavior | HTTP | Missing path | 6h | 12s | 2 | P3 | Automated |
| Critical CSS/JS/logo | Asset | HEAD→GET | 6h | 12s | 2 | P1–P2 | Automated |
| App Store / Play links | HTTP | GET (inventory) | 6h | 10s | 1 | P1–P2 | Automated |
| HQ `/admin/` shell | HTTP/public | GET noindex+login | 6h | 12s | 2 | P2 | Automated |
| HQ Auth / Firestore data | Firebase | Console | Weekly / incident | — | — | P0–P1 | Manual |
| Firestore Rules / quota / billing | Firebase | Console | Weekly | — | — | P1 | Manual |
| GitHub Actions / Pages | GitHub | UI | On FAIL / weekly | — | — | P1 | Manual |
| Client runtime errors | Observability | — | — | — | — | P3 | Missing / future |
| Analytics zero-drop signals | Analytics | — | — | — | — | P3 | Future design |

---

## Manual checklist

### Firebase Console

- [ ] Auth sign-in methods healthy
- [ ] No unexpected Auth spikes / lockouts
- [ ] Firestore usage vs quota
- [ ] Rules match known-good (`firestore.rules` in repo)
- [ ] Billing / budget alerts

### GitHub

- [ ] Actions: Deploy workflow green
- [ ] Actions: Production monitor green / review artifacts
- [ ] Pages: custom domain `www.newon.app` OK

### FormSubmit

- [ ] Send **one** manual test inquiry/contact when validating a release
- [ ] Confirm inbox delivery to `newon@newon.app`
- [ ] Never automate production form spam from CI

### Stores

- [ ] App Store Connect listings
- [ ] Google Play Console listings
- [ ] Newon+ App Store intentional exception still documented

---

## Incident connection

When monitoring reports **FAIL** / **OUTAGE**:

1. **Verify** — re-run `npm run monitor:production` or workflow_dispatch; open the URL in a browser
2. **Scope** — critical only vs product/store/external
3. **Latest deploy** — GitHub Actions deploy run + commit SHA
4. **Classify** — SEV per `docs/operations/incident-checklist.md`
5. **Recover** — follow `docs/operations/backup-recovery.md` (prefer `git revert`; no auto rollback)

---

## Future (not in this phase)

- Analytics anomaly: sudden `store_click` / `inquiry_success` → 0
- Optional client error vendor (only if scale justifies)
- Secure HQ Auth/data health checks (never with public CI credentials)
