# Newon Security & Privacy Audit — Phase 5 snapshot

Generated for HQ/ops reference. **No secrets or UIDs.** See chat report for full detail.

## Boundary

- Public site does not fetch Firestore HQ data.
- HQ AuthZ: signed-in **and** UID allowlist (UI) + matching `firestore.rules` catch-all admin-only.
- `/admin/` on Pages is intentional for HQ hosting; protected by AuthZ + rules, not by secrecy of URL.
- `robots.txt` Disallow + `noindex` on admin.

## Fixes in this phase

- Escape search/resources HTML sinks
- Inquiry success: shorten TTL + clear sessionStorage after one-time display
- Analytics PII key denylist expanded
- Creative honeypot injected if missing
- Waitlist localStorage keys hash email (not plaintext)

## MANUAL

- Confirm Firebase Console rules match repo `firestore.rules` (no auto-deploy).
- Privacy policy still app-centric vs website analytics/FormSubmit (gap).
