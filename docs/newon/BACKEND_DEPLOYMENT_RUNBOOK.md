# NEWON backend deployment runbook (LIVON + ONGIL API)

Operational steps only. Background: `docs/livon/live-backend.md` (LIVON), `docs/ongil/PRODUCTION_API_CONNECTION_V1.md` (ONGIL).
No value of any secret belongs in this repository, in this document or in a chat: values are pasted only into the Vercel dashboard.

## A. Architecture

```
Browser ── https://www.newon.app/livon/ , /ongil-start/        GitHub Pages (static, unchanged)
   │        /livon/livon-api-config.js  ← LIVON_API_ORIGIN (public GitHub variable)
   └─HTTPS─▶ https://<project>.vercel.app                       ONE Vercel project, API only (LIVON_API_ONLY=1), region icn1 (Seoul)
              /api/health          status, booleans only
              /api/livon/data      public-data providers (LIVON and ONGIL), server cache, rate limits
              /api/livon/chat      LIVON AI (needs OPENAI_API_KEY + Upstash + LIVON_RATE_LIMIT_SECRET)
              /api/livon/userdata  accounts — stays OFF (Firebase / PostgreSQL not enabled)
```

- ONGIL reuses `/api/livon/data`; there are no `/api/ongil/*` routes.
- API origin: start with `https://<project>.vercel.app`. A custom domain can come later, for example `svc.newon.app`.
- **Do NOT use `api.newon.app` for this backend.** It is already assigned to another NEWON service (OX MONTH sync, `/api/sync/v1/ox_month`), served by a different server.
- `/api/livon/data` limits (server/livon/data/limit.mjs; only calls that would reach a provider count, cache hits never):
  30 per client per minute, 600 per client per day; site-wide per day: TourAPI 900, Kakao 90,000, lifelong classes 9,000, other providers 5,000.
  Over a client limit → 429 `RATE_LIMIT`; over a site ceiling → 503 `UPSTREAM_LIMIT`; both with `Retry-After`. LIVON and ONGIL show "불러오지 못했습니다".
  With Upstash + `LIVON_RATE_LIMIT_SECRET` the limits are shared by all instances (`/api/health` → `data.rateLimit.mode: "shared"`);
  without them, or while Upstash is down, the same limits count per server instance (`"instance"`): data keeps working.

## B. Create the Vercel project

1. vercel.com → Add New → Project → import the GitHub repository `newonapp/Newon-site`.
2. Production branch: `main` (the API code on `main` is what runs). Framework preset: Other. Leave build/output settings empty — `vercel.json` sets them.
3. Do not click Deploy before step C.

## C. Environment variable names

Project → Settings → Environment Variables (Production; add Preview too if previews should work). Names only here:

| Name | Needed for | Value |
|---|---|---|
| `LIVON_API_ONLY` | build | `1` |
| `KAKAO_REST_API_KEY` | Kakao places (ONGIL care/outings, LIVON places) | Kakao REST API key |
| `TOURAPI_SERVICE_KEY` | TourAPI (ONGIL outings, LIVON) | data.go.kr TourAPI key, **Decoding** form |
| `PUBLIC_DATA_SERVICE_KEY` | lifelong classes (ONGIL, LIVON), 마을세무사 | data.go.kr general key, **Decoding** form |
| `LIVON_RATE_LIMIT_SECRET` | shared rate limits, AI | 64 hex chars from `openssl rand -hex 32` in your own terminal |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | shared limits + cache | set automatically by step D (or `KV_REST_API_URL`, `KV_REST_API_TOKEN` — either pair works; if both exist, `UPSTASH_*` is used) |
| `OPENAI_API_KEY` | LIVON AI only (optional) | OpenAI key; leave unset to keep AI off |

Optional, empty = defaults: `LIVON_ALLOWED_ORIGINS` (default `https://www.newon.app,https://newon.app`), `OPENAI_MODEL`,
`LIVON_DATA_CLIENT_MINUTE_LIMIT`, `LIVON_DATA_CLIENT_DAILY_LIMIT`, `LIVON_DATA_TOURAPI_DAILY_LIMIT` (raise after the TourAPI 운영계정 is approved),
`LIVON_DATA_KAKAO_DAILY_LIMIT`, `LIVON_DATA_LIFELONG_DAILY_LIMIT`, `LIVON_AI_MINUTE_LIMIT`, `LIVON_AI_CLIENT_DAILY_LIMIT`, `LIVON_DAILY_REQUEST_LIMIT`.
Later providers: `YOUTHCENTER_API_KEY`, `BIZINFO_API_KEY`, `WORK24_TRAINING_API_KEY`. Keep `LIVON_USERDATA_ENABLED` and `NEWON_AUTH_VERIFY_ENABLED` unset/false.

## D. Connect Upstash

Project → Storage → Upstash (Redis) → Create / Connect, free plan, region close to Seoul if offered, connect to this project
(all environments). This adds the REST URL/token variables. Redeploy afterwards (E). The read-only token is never used.

## E. Deploy

Click Deploy (first time) or Deployments → ⋯ → Redeploy (after variable changes; variables apply only to new deployments).
The build publishes only a noindex placeholder page; the functions in `api/` run in `icn1`.

## F. Verify

From a terminal in the repository (no key needed):

```
node scripts/verify-api-deployment.mjs https://<project>.vercel.app
```

Pass = `HEALTH PASS`, `CORS PASS`, and `LIVE VERIFIED` for LIFELONG, KAKAO and TOURAPI; exit code 0. Also expect
`rate limit: shared` and `shared cache: yes` once Upstash is connected. `--json` prints the same report as JSON.
Only a run against the real https origin counts as LIVE VERIFIED; local dry runs say so.

## G. GitHub LIVON_API_ORIGIN

GitHub → repository → Settings → Secrets and variables → Actions → **Variables** (not Secrets) → New variable:
`LIVON_API_ORIGIN` = `https://<project>.vercel.app` (https origin only: no path, no trailing slash).

## H. Redeploy GitHub Pages

GitHub → Actions → "Deploy static site to GitHub Pages" → Run workflow (branch `main`). Then check that
`https://www.newon.app/livon/livon-api-config.js` contains the API origin. ONGIL's live-data screens only exist on `main`
after the ONGIL branch is merged (a separate decision).

## I. Rollback

- API: Vercel → Deployments → pick the last good deployment → Promote to Production (instant).
- Disconnect the frontend from the API: delete the `LIVON_API_ORIGIN` variable and re-run step H. LIVON and ONGIL return to
  their honest "not connected" states; nothing else breaks.
- One provider misbehaving: remove its key variable and redeploy → that provider answers `NOT_CONFIGURED` only.
- Code: revert the commit on `main`; Vercel and Pages rebuild from it.

## J. Common failures

| Symptom (verify script / health) | Cause → fix |
|---|---|
| HEALTH FAIL, http 404 | wrong origin, or the deployment has no `api/` functions → check the project URL; redeploy |
| CORS FAIL, preflight 403 | `LIVON_ALLOWED_ORIGINS` set without `https://www.newon.app` → fix or clear it, redeploy |
| provider `NOT CONFIGURED` | its key variable missing in this environment, or added after the deployment → add, redeploy |
| provider `FAILED UPSTREAM_ERROR` | key not approved for that API (data.go.kr 활용신청 per dataset; the Kakao app must be allowed to use the Local API), or the **Encoding** key pasted instead of the Decoding key |
| provider `FAILED TIMEOUT` | provider slow/down → retry later; nothing to change |
| provider `RATE LIMITED` | our ceiling or the provider quota reached → wait for `Retry-After`; raise the matching `LIVON_DATA_*_DAILY_LIMIT` only after the provider quota is raised |
| `rate limit: instance` | Upstash not connected or `LIVON_RATE_LIMIT_SECRET` missing/short (< 32 chars) → step D / C, redeploy |
| health `limitsValid: false` | a `LIVON_DATA_*` override is not a positive integer in range → fix it (defaults apply meanwhile) |
| LIVON AI 503 `PROTECTION_NOT_CONFIGURED` | AI needs Upstash + secret in production → steps C/D |
| site still "not connected" | step G/H not done, or browser cache → re-run H, reload |

## K. Secret rotation

1. Issue the new key at the provider (Kakao Developers, data.go.kr, OpenAI, Upstash dashboard → reset token).
2. Vercel → Settings → Environment Variables → edit the variable → paste the new value → Save.
3. Redeploy (E), run the verify command (F).
4. Revoke the old key at the provider only after F passes.

`LIVON_RATE_LIMIT_SECRET`: generate a new value (`openssl rand -hex 32`), replace, redeploy. Effect: current limit windows
restart; nothing else. If a secret was ever exposed (pasted into a chat, committed, screenshotted), rotate it immediately.
