# ONGIL Family Connection V2 — cross-device family on Newon+ accounts

Status in one line: **CODE READY. Not live.** The server route, database schema, permission enforcement, client and
account card exist and are tested (memory store + a real PostgreSQL 16 server). No Firebase project, production database
or production switch is turned on, so no two real devices are connected today.

```
AUTH LIVE          = NO   (ONGIL does not load Newon+ auth; NEWON_AUTH_VERIFY_ENABLED / project id not set for this route)
DATABASE LIVE      = NO   (LIVON_DATABASE_URL not set in production; migrations 001_family.sql / 002_family_limits.sql not applied)
CROSS DEVICE LIVE  = NO
FAMILY V1 LOCAL    = LIVE (unchanged)
FAMILY V2          = CODE READY
```

## 1. OBJECTIVE

Keep V1 (one device, mode LOCAL) exactly as it is, and add a real connection between two accounts when Newon+ sign-in
and a database are active: account A creates an invitation, account B accepts on B's own device, A chooses per-member
permissions that are stored on the server, B sees only what is allowed, revoke / disconnect cut access at once, and help
requests can be seen and answered from the other account.

## 2. AUDIT

What existed and was reused (nothing was re-implemented):

| Need | Reused from | How |
|---|---|---|
| Token verification | `server/newon/auth/verify.mjs`, `firebase-verifier.mjs` | same `createTokenVerifier` + Google-certificate RS256 check as `/api/livon/userdata` |
| Account identity | `server/livon/userdata/store.mjs` (`user_accounts`, `account_refs`) | the same Newon+ account row: one person across LIVON and ONGIL; created on first use for the primary issuer only |
| Database access | `postgresQueryFromEnv` / `databaseConfig` | same `LIVON_DATABASE_URL`, TLS rules, pool and timeouts; errors keep SQLSTATE only |
| CORS | `server/livon/cors.mjs` | exact `https://www.newon.app` / `https://newon.app` (or `LIVON_ALLOWED_ORIGINS`), no wildcard, `Authorization` allowed |
| Rate limits | `server/livon/ratelimit.mjs` | same Upstash + HMAC identity; fails closed in production without it |
| Permission rules | `ongil-start/js/family-permissions.js` (V1) | imported by the server; the server builds the V1 state shape from rows |
| Ids, codes, kinds, levels | `ongil-start/js/family-domain.js` (V1) | `makeId`, `makeInvitationCode` (100 bits), `parseInvitationCode`, `SHARING_CATEGORIES`, `HELP_TRANSITIONS`, `normalizeRequest` |
| Snapshot lines | V1 family view readers | moved to `createSnapshotReaders(sources)` (same code, now exported) and used by both V1 and V2 |
| Client auth | `newon-auth/newon-auth.js` (`window.NewonAuth`) | read if present: `getState().status === 'authenticated'`, `getIdToken()` |
| API base | `livon/livon-api-config.js` (`window.LivonApi.url`) | the same base and the same injected `fetch` as ONGIL's data sources |

Shared files changed (minimal, with reason):

- `vercel.json` — **not changed**. Vercel picks up `api/ongil/family.mjs` by itself (as it does `api/health.mjs`) and
  traces the static imports of the four V1 files the server uses; the default function settings and `regions: ["icn1"]`
  apply.
- `ongil-start/js/package.json` — `{"type":"module"}` so Node treats the V1 modules the server imports as ES modules on
  every supported Node version (browsers ignore it).

No LIVON product file, LIVON Account Sync file, LIVON AI file or SHAREON file was changed.

## 3. ARCHITECTURE

```
ONGIL page (browser)                                   Vercel function                     PostgreSQL
family-remote-view.js ─ family-remote.js ──HTTPS──▶ api/ongil/family.mjs ─ server/ongil/family/http.mjs ─ store.mjs ─▶ ongil_family_*
   (card, only when signed in)  Authorization: Bearer <ID token>      │                                      (+ user_accounts)
                                                                       ├─ newon/auth verify (RS256, iss/aud/exp)
                                                                       ├─ livon cors · ratelimit · account store
                                                                       └─ V1 family-permissions.js (default deny)
```

- **FamilyRepository: Local** — `createLocalFamilyRepository` (V1, this device, collection `family`, PRIVATE). Unchanged
  and still the only repository the V1 screen chooses (`selectFamilyRepository`).
- **FamilyRepository: Remote** — `family-remote.js` (`createFamilyRemote`): one operation per request against
  `/api/ongil/family`. It never loads or saves the local family document. `createRemoteFamilyRepository` (V1 whole-state
  interface) stays refusing on purpose.
- **Server** — `GET ?op=status` (no sign-in, booleans only), `GET` (signed-in overview), `POST {op, payload}` with
  15 operations: `createInvitation`, `revokeInvitation`, `inspectInvitation`, `acceptInvitation`, `declineInvitation`,
  `setPermissions`, `stopSharing`, `stopAllSharing`, `disconnect`, `leave`, `publishSnapshot`, `viewShared`,
  `requestHelp`, `moveHelp`, `activity`. `FAMILY_REMOTE_CONTRACT` (status `CODE_READY`) lists them.
- **Group model** — owner-centric: each account owns at most one family group (the person whose ONGIL it is); a member is
  another account joined to that group. An account can own its group and be a member of other people's groups.

Order of checks (fail closed, before any database work): CORS → method → `ONGIL_FAMILY_REMOTE_ENABLED` → database
configured → verifier configured → duplicate `Authorization` refused → declared size → token verified (token in a URL
refused) → issuer (admin issuers and other projects refused) → account → per-account rate limit → strict payload → V1
permission engine → store.

## 4. MODES

| Mode | When | What the page does |
|---|---|---|
| `ANONYMOUS_LOCAL` | no `window.NewonAuth`, or not signed in | V1 LOCAL only. The account card is not added. Nothing is sent. **This is production today.** |
| `AUTHENTICATED_REMOTE_UNAVAILABLE` | signed in, but `?op=status` is not `ready` or the route is unreachable | one card line: the account feature is not open yet; V1 LOCAL keeps working |
| `AUTHENTICATED_REMOTE_READY` | signed in and the server reports `enabled && database && auth && protection` | the account card: invite, accept, sharing, publish, stop, disconnect, help, memberships |

The mode is asked for each time the family screen opens (`resolveMode`); it is never assumed.

## 5. DATABASE

`server/ongil/family/migrations/001_family.sql` — apply AFTER `server/livon/userdata/migrations/001_account_backend.sql`.
Idempotent (`IF NOT EXISTS`) and wrapped in one transaction.

| Table | Holds | Notes |
|---|---|---|
| `ongil_family_groups` | one row per owner account | `owner_account_id` unique → `user_accounts` (cascade) |
| `ongil_family_members` | memberships (`ACTIVE` / `DISCONNECTED` / `LEFT`) | partial unique index: one ACTIVE membership per (group, account) |
| `ongil_family_invitations` | `token_hash` (SHA-256 hex, unique), expiry, status | **no column for the code**; `EXPIRED` is computed from `expires_at` |
| `ongil_family_permissions` | (member, category) → `SUMMARY` / `DETAIL` | no row = not shared (default deny) |
| `ongil_family_consents` | sensitive categories, `GRANTED` / `WITHDRAWN` | withdrawn is never switched back on by itself |
| `ongil_family_snapshots` | the short lines published for (member, category, level) | 1–10 lines, ≤ 4096 bytes; deleted when access ends |
| `ongil_family_help_requests` | kind, message ≤ 300, status | |
| `ongil_family_activity` | actor, action, member id, category, status, time | metadata only; newest 200 per group kept |

Not stored anywhere: invitation codes, tokens, e-mail, the account holder's name, health values, medication names,
journal text, expenses, or any ONGIL record.

Atomicity: every change touching more than one table is **one SQL statement** (data-modifying CTEs): accept (invitation
consumed + membership + audit), disconnect / leave (membership ended + permissions, consents, snapshots removed + open
requests cancelled + audit), sharing changes (permissions + consents + snapshots + audit), invitation create (pending
limit + insert + audit).

`server/ongil/family/migrations/002_family_limits.sql` — apply AFTER `001_family.sql` (production integration). The two
limits are exact under concurrency: a `BEFORE INSERT` trigger on `ongil_family_members` (ACTIVE rows) and on
`ongil_family_invitations` (PENDING rows) takes a transaction-scoped advisory lock for the family group
(`pg_advisory_xact_lock(hashtextextended('ongil_family_group:' || group_id, 0))`) and counts again with a fresh snapshot.
A refused write raises `OGF01` (10 connected members) or `OGF02` (5 waiting invitations); the whole statement rolls back
(the invitation stays unused, no audit row) and the API answers `409 LIMIT_MEMBERS` / `409 LIMIT_INVITATIONS`. Only
requests of the same family wait for each other. No table, column or stored value changes; idempotent (`CREATE OR REPLACE
FUNCTION`, `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`, one transaction). Without 002 the statements still count first, but
requests overlapping in time could pass a limit (measured on PostgreSQL 16 before the fix: 14 members, 6 waiting
invitations).

## 6. INVITATIONS

- Create (owner): name the owner uses for the invitee (≤ 20), relationship, role, expiry (`1d` / `7d`). The server makes a
  20-character code from the unambiguous alphabet (100 bits) and returns it **once**; only
  `sha256("ongil-family-invite:v1:" + code)` is stored. Not readable again, not logged.
- Handing over: the owner tells the code to the invitee directly. ONGIL sends no SMS, e-mail or chat message. An invite
  *link* is FUTURE (code entry first, as required).
- Inspect / accept / decline (invitee): the code goes in the request **body** only (a code in a URL is refused).
  - unknown code → one generic `INVITATION_NOT_FOUND` (anti-enumeration);
  - a real code may answer `INVITATION_EXPIRED` / `INVITATION_REVOKED` / `INVITATION_DECLINED` / `INVITATION_USED`
    (its holder already knows it exists);
  - `SELF_INVITATION` — the creating account cannot inspect, accept or decline its own code;
  - `ALREADY_CONNECTED` — one ACTIVE membership per family;
  - `LIMIT_MEMBERS` (10) / `LIMIT_INVITATIONS` (5 pending).
- One use: accepting updates the invitation `WHERE status = 'PENDING' AND expires_at > now`; a concurrent second accept
  changes nothing (tested on PostgreSQL with three accounts racing).
- Inspect shows the relationship, role, expiry and "nothing is shared yet" — never an account id, group id or owner name.
- Accept asks the invitee what they call the inviter (`ownerLabel`): the account holder's own name is never needed.

## 7. PERMISSIONS

V1 semantics, enforced on the server by the V1 engine:

- Default deny: a new membership has no permission at all.
- Per member, per category, with the levels each category offers:
  `CHECK_IN`, `SCHEDULE`, `ACTIVITY`, `MEAL`, `SLEEP` (SUMMARY / DETAIL); `HELP_REQUEST` (DETAIL only);
  sensitive `MEDICATION`, `HEALTH`, `EMERGENCY_INFO` (SUMMARY only) and `CHECKUP` (SUMMARY / DETAIL).
- Sensitive categories need the owner's consent **in the same request** unless a standing consent covers the level; one
  missing consent refuses the whole request (`CONSENT_REQUIRED` with the categories) and nothing changes.
- Turning a sensitive category off withdraws its consent; sharing it again needs a new consent.
- A relationship or a role grants nothing.
- IDOR: the owner's group is found from the token; a `memberId` is used only inside the caller's own group (owner) or for
  the caller's own membership (member). Anything else answers exactly like an id that does not exist.
- Identity from the token only: a payload containing `userId`, `ownerId`, `accountId`, `groupId`, `ownerUserId` or
  `memberUserId` (or any unexpected key) is refused whole.

## 8. SHARED DATA AUDIT

What can reach another account, per ONGIL data:

| Data | V2 status | How |
|---|---|---|
| 안부 (check-in) | REMOTE READY | `CHECK_IN` lines (left / mood at DETAIL) |
| 일정 | REMOTE READY | `SCHEDULE` lines (count / names and times, hospital events excluded) |
| 복약 | REMOTE READY (sensitive) | `MEDICATION` count taken of planned — never medication names |
| 건강 기록 | REMOTE READY (sensitive) | `HEALTH` "recorded today or not" — never symptoms, values or notes |
| 병원·검진 일정 | REMOTE READY (sensitive) | `CHECKUP` count / date + kind — never hospital names or memos |
| 활동 · 식사 · 수면 | REMOTE READY | `ACTIVITY`, `MEAL`, `SLEEP` lines |
| 비상 연락 정보 | REMOTE READY (sensitive) | `EMERGENCY_INFO` count only — never names or numbers |
| 도움 요청 | REMOTE READY | help requests themselves (kind, message, status) |
| 건강 메모, 증상 내용, 기록(일기), 생활비 | NOT AVAILABLE | not categories at all (`NEVER_SHARED`) |
| Health measures, journal, expenses, community drafts, saved items, profile | LOCAL ONLY | never read by the family client |
| The V1 local family document | LOCAL ONLY | never uploaded; no automatic local → account migration |

Publishing: the owner's device builds lines with the V1 readers **only for the levels the server reports** and sends
them with `publishSnapshot`. The server keeps an item only if `effectiveLevel` for that member and category equals the
item's level at that moment (HELP_REQUEST is never a snapshot), and replaces the member's earlier lines as a whole.
Reading: `viewShared` re-filters by the permissions in force at the moment of reading — a lowered or removed category is
gone immediately, even before the owner publishes again. Forbidden categories are **absent** from the answer.

Shared lines are a point-in-time snapshot (`publishedAt` shown). There is no background push or polling (FUTURE).

## 9. HELP REQUESTS

States `REQUESTED → SEEN → ACCEPTED → COMPLETED`, `CANCELLED` — exactly V1 `HELP_TRANSITIONS`:

- member (the account it was sent to, while `HELP_REQUEST` is DETAIL): REQUESTED → SEEN / ACCEPTED, SEEN → ACCEPTED,
  ACCEPTED → COMPLETED;
- owner: REQUESTED / SEEN → CANCELLED, ACCEPTED → CANCELLED / COMPLETED.

A request needs `HELP_REQUEST` shared with that member (`SHARING_OFF` otherwise). Kinds are the V1 list; "직접 작성"
needs a message; messages are plain text ≤ 300. Open requests per family ≤ 50. Turning `HELP_REQUEST` off hides requests
from the member and stops their answers; disconnect / leave cancel open requests. Delivery is in-app only (no push, SMS
or e-mail — FUTURE).

## 10. REVOCATION

Five different actions, kept distinct:

| Action | Who | Effect |
|---|---|---|
| `revokeInvitation` | owner | a pending code stops working; nothing else changes |
| `stopSharing` (revoke) | owner | one member: permissions + snapshots deleted, consents withdrawn; connection stays |
| `stopAllSharing` (revoke-all) | owner | the same for every member; connections stay |
| `disconnect` | owner | membership `DISCONNECTED`, all access removed, open requests cancelled — one statement |
| `leave` | member | membership `LEFT`, same cut, started by the member; owner's log says `MEMBER_LEFT` |

All take effect on the next request: every read checks the membership and the permissions in the database.

## 11. SECURITY

- Tokens: Authorization header only; never in a URL (refused), never stored or logged by ONGIL; two Authorization headers
  are refused.
- Codes: body only; only a domain-separated SHA-256 is stored; never in logs, overview, activity or URLs.
- No production secret in code; no key in the browser; `?op=status` returns booleans only.
- Errors: fixed Korean messages; database failure → `503 STORE_UNAVAILABLE` with no database text; unique-index race →
  `409 CONFLICT` / `ALREADY_CONNECTED`.
- Logs: request id, route, method, op, status, code, latency — nothing else.
- Responses never contain an account id, the internal user id, the token hash or another person's membership.
- Not surveillance: there is no location, no "last seen", no read receipts other than help-request states the member sets.

## 12. RATE LIMITS

Per account, through the shared limiter (Upstash + `LIVON_RATE_LIMIT_SECRET`; production without it → 503, fail closed):

| Scope | Applies to | Caps |
|---|---|---|
| `ongil-family` | every signed-in call | 60 / minute, 3000 / day |
| `ongil-family-invite` | createInvitation | 5 / 10 minutes, 20 / day |
| `ongil-family-code` | inspect / accept / decline | 10 / 10 minutes, 30 / day |
| `ongil-family-help` | requestHelp | 10 / 10 minutes, 50 / day |

With 100-bit codes these caps make guessing pointless, not merely slow. `?op=status` reads no account and no database.

## 13. DELETION

- Deleting a Newon+ account (`user_accounts` row) cascades: its family group, memberships (both sides), invitations,
  permissions, consents, snapshots, help requests and activity (tested on PostgreSQL).
- Ended memberships stay as rows (status + time) so the owner's history makes sense; their permissions, consents and
  snapshots are deleted at once.
- Finished or expired invitations are removed 30 days after they ended (on the owner's next invitation).
- Help requests: open ones stay until answered, cancelled or the connection ends; finished ones (끝남 / 취소함) beyond the
  newest 50 of a family are removed when a new request is made.
- Activity: newest 200 per group.
- FUTURE: a scheduled retention job and a user-facing "delete my family data" action.

## 14. UI

One card, `계정으로 가족 연결`, added to the 가족 screen **only for a signed-in page**, built from the existing card, field,
choice, confirm and item-list parts (no new look). It never claims something the server did not confirm and never says a
code was "sent" (the owner hands it over). In production today the card is not added (ANONYMOUS_LOCAL).

Note on caching: `app.js` changed but its `?v=` address was not moved (as with Family V1). A browser with the old
`app.js` cached simply has no account card — the V1 behaviour — until the cache refreshes.

## 15. TESTS

`tests/ongil/family-v2.test.mjs` — FV2-01 … FV2-53 (production handler + memory twin + real verifier with a throwaway
key) and FV2-PG-01 … 10 on a REAL PostgreSQL server when `LIVON_TEST_PG` is set (both migrations twice, full cross-account
flow, two concurrency races, the pending-limit race, cascade deletion; production integration: the 11th member and the
6th invitation raced through the API and through overlapping held transactions — exact limits, OGF01 / OGF02). Structural pins in earlier ONGIL test files were updated
by value only, each with a BEFORE / AFTER comment (module count 76 → 78, test files 28 → 29, server/ongil now `family/`,
`family-remote.js` as the second module handed the injected fetch, the one `Bearer` / `NewonAuth` reference).

## 16. STATUS

| Item | Status |
|---|---|
| V1 family on one device | LIVE / LOCAL |
| Server route, schema, permission enforcement, client, card | CODE READY |
| `ONGIL_FAMILY_REMOTE_ENABLED=true` on the API project | CONFIG REQUIRED |
| Newon+ auth loaded on the ONGIL page; Firebase project for Newon+ | CONFIG REQUIRED · ACCOUNT REQUIRED |
| `LIVON_DATABASE_URL` + the account migration and both family migrations (001, 002) applied | DATABASE REQUIRED |
| Upstash + `LIVON_RATE_LIMIT_SECRET` (already set for LIVON in production) | LIVE for LIVON, reused |
| Invite link, push / SMS delivery, background refresh, retention job | FUTURE |

CROSS DEVICE LIVE = NO. Nothing here was tested on two real devices with real accounts.

## 17. ACTIVATION PLAN

1. Confirm the Newon+ Firebase project (consumer project, not HQ / OX) and its id.
2. On the API project set `NEWON_AUTH_VERIFY_ENABLED=true` and `NEWON_PLUS_FIREBASE_PROJECT_ID` (no secret: public id).
3. Provision PostgreSQL (TLS required in production) and set `LIVON_DATABASE_URL` as an encrypted env var.
4. Apply `server/livon/userdata/migrations/001_account_backend.sql` (if not yet applied).
5. Apply `server/ongil/family/migrations/001_family.sql`, then `002_family_limits.sql`; verify the eight `ongil_family_*`
   tables and the two triggers (`ongil_family_member_limit`, `ongil_family_invitation_limit`) exist. Take a database backup
   first; both files are idempotent and transactional.
6. Confirm Upstash + `LIVON_RATE_LIMIT_SECRET` are present for the API project (`/api/health` shows `shared`).
7. Deploy with `ONGIL_FAMILY_REMOTE_ENABLED` still unset; check `GET /api/ongil/family?op=status` → `ready:false`, `enabled:false`.
8. Load Newon+ auth on the ONGIL page (`newon-auth-config.js`, `newon-auth.js`, adapter) — updating the ONGIL structural
   pins that forbid it (OG-NF-4) and the CSP `connect-src` for the auth hosts.
9. Set `ONGIL_FAMILY_REMOTE_ENABLED=true` on a preview deployment only; check `?op=status` → `ready:true`.
10. Preview test with two real accounts on two devices: invite → accept → share → publish → view → help → disconnect.
11. Verify access is cut immediately on stop / disconnect / leave (member refreshes and sees nothing).
12. Verify logs contain no token, code, name or message; verify database rows contain no code.
13. Verify rate limits answer 429 with Retry-After for repeated code guesses.
14. Enable in production; re-run steps 10–13 with production accounts.
15. Only then change the cross-device status from NO to live, with the test date and how it was verified (no personal data).

## 18. KNOWN LIMITATIONS

- No invite link yet; the code is typed in.
- Snapshot lines are published when the owner presses "지금 내용 보내기"; there is no automatic refresh.
- No push / SMS / e-mail delivery of help requests.
- The member limit (10) and the pending-invitation limit (5) are exact once migration 002 is applied (FV2-PG-07 … 10).
  If the API were deployed against a database that has 001 but not 002, the earlier behaviour returns: overlapping
  requests could pass a limit by at most the number of racing requests (members: ≤ the pending invitations, so ≤ 14 in
  total; invitations: bounded by the invite rate limit, 5 per 10 minutes). Only the owner's own invitations and the people
  holding them can cause it; it is not reachable by a stranger. Apply 002 before turning the route on.
- The account card uses the existing ONGIL parts; its keyboard and screen-reader behaviour follow those parts but were not
  verified with a real screen reader.
- V1 LOCAL connections and V2 account connections are separate by design; there is no import.
