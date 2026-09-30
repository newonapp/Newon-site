# LIVON Admin Local V1 (prototype)

A **local** operations console for LIVON, built on the Data Manager.

It is not the Production Admin: there is no login, server, database, Vercel, Firebase, NEWON+ or API key. Its data is
read-only. Drafts, review states, moderation and the audit log are local simulations.

- Branch: `livon-admin-local-v1`, built on the Data Manager V1 (`437db6baa`).

```
node scripts/livon-data-manager.mjs        # 127.0.0.1 only
  → http://127.0.0.1:8790/livon/admin/          Admin
  → http://127.0.0.1:8790/livon/admin/data/     Data Manager (unchanged, still standalone)
node --test tests/livon/admin-local.test.mjs    # AD-1 … AD-36 (+ responsive/a11y sweep)
```

## 1. Architecture

```
Admin UI            livon/admin/admin-app.js      rendering, routing, keyboard; never touches storage
   ↓
Admin Service       livon/admin/admin-service.js  every Admin fact, drafts, validation, audit, status words (STATUS)
   ↓                        ↘ reuses
Adapter             livon/admin/admin-store.js    LocalAdapter (today) · ServerAdapter (future, same interface)
                    livon/admin/data/data-manager-core.js   model, filters, queue, relations, gaps, sources, export
                    livon/data/livon-content-quality.js     quality rules (shared with the CLI)
                    server/livon/data/manifest.mjs          provider facts (imported read-only by the local page)
```

**One model, one set of rules.** The service builds `LivonDataManager.createModel()` **once** per session, and every
view reads from it. As a result the Admin and the Data Manager always show the same numbers; AD-4 and AD-32 compare
them.

The only change to the Data Manager is that the list of data scripts, `DATA_SCRIPTS`, and the report exporter,
`exportTable`, now live in the shared core, so both tools use one copy.

## 2. Routes

The Admin is a hash-routed page at `/livon/admin/`.

**Main areas:**

- `#overview`
- `#content` and `#record/<id>`
- `#life-stage` and `#life-stage/<10…70>`
- `#life-events`
- `#today`
- `#explore`
- `#community`, `#community/posts`, `#community/reports`, `#community/moderation`, `#community/profiles` and `#community/groups`
- `#quality`
- `#review` and `#review/P0…P4`
- `#sources`
- `#providers` and `#provider/<id>`
- `#reports` and `#reports/<id>`
- `#drafts`
- `#audit`
- `#system`

**Future areas:** `#users`, `#partners`, `#bookings` and `#payments`.

**Unknown pages and ids:** an unknown route, record or provider shows a clear "not found" message rather than a blank
screen.

## 3. Local-only guard and Production exclusion

- **Not published.** `scripts/publish-site.mjs` deletes all of `_publish/livon/admin/**` (the Admin and the Data
  Manager) and fails the build if anything remains. GitHub Pages and Vercel both deploy `_publish`, so these pages
  return 404 in Production. Verified after this branch's build.
- **Host guard.** `admin-app.js` checks `location.hostname` (localhost, 127.0.0.1, ::1, *.localhost, *.test) before
  loading any data script or the provider manifest. On any other host the page shows **Unavailable** and requests
  nothing.
- **Not linked.** No public LIVON file references `/livon/admin`, and `livon/index.html` loads none of the tool code.
  The pages are `noindex`.
- **No fake security.** There is no client-side password; a password in client code would only look like security.
- **Local server limits.** `scripts/livon-data-manager.mjs` binds to `127.0.0.1`, answers GET/HEAD only, and refuses
  `.env*`, `.git`, `node_modules` and `.vercel`.

## 4. Modules

| Area | What it shows (all computed at load) |
|---|---|
| Overview | Content (total, types, searchable, with a detail page, content gaps); quality (average, grades, active flags); review P0–P4; sources (official, LIVON-written, Government, Public institution, Newon); freshness (fresh, stale, expired, unknown); records per screen; **operations status**. |
| Operations status | Curated Data READY · Data Platform READY · Screen Integration READY · Real Data Providers CODE READY (0 live) · LIVON AI NOT CONNECTED · Community Backend BACKEND REQUIRED · NEWON+ DEFERRED · Booking and Payments BACKEND REQUIRED. Each value is computed; nothing is LIVE unless it is. |
| Content | All 530 records with search, 13 filters, sort and 50-per-page pagination. Filter state is kept across navigation and reload. |
| Record | Where the record is shown; source, quality, freshness, relations with link status, incoming links, CTA, dates and review issues; **Edit preview → LOCAL DRAFT** with a before/after diff. |
| Life Stage | 7 stages with their topics and the unique related content, policy, service, program, place and class entities. Each stage opens a list of all its topics (228 in total) with relation count, searchability, score, flags and the stage's content gaps. |
| Life Events | All 34 events with status (linked / CONTENT GAP), PLANNED marker (14), stages, related topics and content, searchability and quality. Filters: guides, planned, content gap. The gaps are 프리랜서, 차량 구매, 해외생활 and 장기여행. |
| Today | 34 items in 8 sections. Each section shows count, sources, budgets, average quality, freshness, date status and flagged items. UNSOURCED_SPECIFIC (8) and FIELD_CONFLICT (2) are highlighted. The public Today screen is not changed. |
| Explore | Items by card type and by the 10 Explore categories: count, official, sources, freshness, quality and detail route. **0 individual expert profiles**: the "expert" cards are institutions, and none are invented. |
| Community | Curated groups (21) and challenges (5) are shown separately from device posts, which are read-only from this browser's `livon.cmStore.v1`. Backend: NOT CONNECTED. Tabs: Posts, Reports, Moderation, Profiles (BACKEND REQUIRED) and Groups. |
| Data Quality | Grades and every flag from the shared evaluator. New flags appear automatically. |
| Review Queue | P0–P4 (currently 0 / 10 / 30 / 4 / 183). Each issue has a local state (OPEN, REVIEWED, NEEDS_ACTION, RESOLVED_LOCAL) and links to its record. |
| Sources | The 5 classes, each with records, official count, freshness, date verification and quality issues, plus every source name and its URLs. |
| Providers | The 8 real-data providers from the manifest: data type, status, key required, last fetch, last success, last failure, records and error type. With no server in this session, every provider is **NOT CONFIGURED** with 0 records. The detail page shows provider ID, organisation, official source, data type, **env variable name only**, key and approval requirements (from `real-data-providers.md`), normaliser file, mode, capabilities, cache and freshness policy, readiness and last status. |
| Reports | Content Inventory, Quality, Review Queue, Content Gaps, Sources, Date Verification, Duplicate Candidates, Taxonomy Review, CTA Review and Provider Status. Each is previewed and exported as **JSON / CSV**. |
| Local Drafts / Audit Events | Lists of local drafts and local audit events. |
| System | Environment LOCAL · Anonymous Mode ACTIVE · Data Platform READY · Quality Evaluator READY · Curated Records 530 · Live External 0 · AI NOT CONNECTED · Account DEFERRED · Community Backend NOT CONNECTED · Storage LOCAL-FIRST · Provider Manifest READY. All status words are defined once, in `STATUS`. |
| Future: Users, Partners, Bookings, Payments | "BACKEND REQUIRED" and the planned management scope. No data and no statistics. |
| Global search | Searches content, life stages, life events, sources, providers and review issues (under 1 ms per query). Supports the arrow keys, Enter and Escape. |
| Command palette | Ctrl/⌘ + K opens a labelled dialog with "Go to …" commands, Data Manager, Provider Status and Reports, plus record search. Supports the arrow keys and Enter; Escape closes it and returns focus. |

## 5. Local drafts

The editable fields are `title`, `summary`, `category`, `tags` and `cta`.

**Validation:**

- title: 2–30 characters
- summary: 16–160 characters
- category: 1–30 characters
- tags: up to 10, each 1–20 characters
- CTA: 12 characters or fewer
- "신청하기" is allowed only when the record has an official page
- no HTML
- non-editable fields are refused
- a draft with no change is refused

**Stored draft:** `{ id, recordId, changedFields, before, after, createdAt, updatedAt, status, localOnly: true }`.

**Status flow:** DRAFT → READY_FOR_REVIEW → APPROVED_LOCAL or REJECTED_LOCAL, and back to DRAFT.

A draft is **never applied**: even an APPROVED_LOCAL draft leaves the model, the repository and the curated files
unchanged (AD-33). Every screen labels it **LOCAL DRAFT**.

The diff shows every editable field as before and after, with the changed fields highlighted.

## 6. Review states and moderation simulation

- **Review states** (OPEN / REVIEWED / NEEDS_ACTION / RESOLVED_LOCAL) are stored per issue key
  (`priority|rule|record`).
- **Moderation** (FLAGGED / HIDDEN_LOCAL / NEEDS_REVIEW / RESOLVED_LOCAL) is stored per `post:<id>`.
- Both are Admin-only marks. The public community store is read, never written (AD-15, AD-16). Nothing is deleted,
  hidden or suspended on LIVON.

## 7. Storage and fallback

The local adapter uses these keys:

- **localStorage:** `livon.admin.v1.drafts`, `.review`, `.moderation` and `.audit` (capped at 500 events).
- **sessionStorage:** `livon.admin.v1.ui`, for filter and page state.

Behaviour when storage is unavailable or wrong:

- **Blocked or failing storage:** state is kept in memory, and the top bar and System say "memory only".
- **Malformed stored state:** it is validated entry by entry, dropped and reported under System → storage notes. It is
  never trusted or executed (AD-10, AD-30).

## 8. Audit events

Each event has the shape `{ id, at, action, entity, actor: "local-operator", before, after }`.

The actions are `draft.create`, `draft.update`, `draft.status`, `draft.discard`, `review.state` and
`moderation.state`.

- Values are sanitised: keys matching secret or personal words (secret, token, password, api key, credential,
  authorization, cookie, email, phone) are removed, and strings are truncated.
- The shape is the same one a server audit log will store (AD-31).

## 9. Future server adapter

`LivonAdminStore.createServerAdapter()` already exposes the full interface. Until a backend exists, every call
rejects with `BACKEND_REQUIRED`.

The interface is `listDrafts`, `getDraft`, `putDraft`, `removeDraft`, `getReviewStates`, `setReviewState`,
`getModeration`, `setModeration`, `appendAudit`, `listAudit`, `getUiState`, `setUiState`, `readCommunitySnapshot` and
`info`. Every method returns a Promise, so swapping adapters changes neither the service nor the UI.

The backend will need to add:

1. Authentication. The **auth hook** is where the service is created: the server adapter must carry a verified
   session.
2. Roles. The **role hook** belongs on the service mutation methods (`saveDraft`, `setDraftStatus`, `setReviewState`,
   `setModeration`); the server must enforce roles, since client checks are advisory.
3. A real publish step, which turns an approved draft into a data change with review.
4. A server-side audit log.

## 10. Security limitations (read before extending)

- The guard is a safety net against accidental exposure, not access control. Real protection comes from the tool
  never being deployed, plus the server authentication and roles described in §9.
- Local state lives in the browser profile, so anyone using the same browser profile can see it. Do not type personal
  data into drafts. Audit sanitising removes secret and personal keys, not free text.
- The provider page shows env variable **names** only. Key values exist only on the server, which this local session
  does not have.

## 11. Verification (this branch)

- **Tests:** 609 total, 608 pass, 1 skip (AB-17 PG). That is 572 existing plus 37 Admin tests: AD-1…AD-36 and a
  responsive/a11y sweep of 21 views × 4 widths.
- **Public LIVON:**
  - 26 routes × 320/390/768/1440 compared with the baseline: 0 new styles, 0 layout issues, 0 console errors.
  - No auth request is made and no user is stored (anonymous mode).
  - No public file changed on this branch.
- **Build:** build and fast-check pass, and `_publish/livon/admin` does not exist.
