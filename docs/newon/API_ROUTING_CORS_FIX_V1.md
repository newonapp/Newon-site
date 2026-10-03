# NEWON API — canonical routing and CORS fix (2026-10-04)

Scope: the Vercel API project (`https://newon-api.vercel.app`) that serves LIVON and ONGIL. Nothing here contains a key,
token or environment value; variables are named only.

## 1. What was observed in production

Requests sent from a page on `https://www.newon.app` (browser fetch):

| URL | Result |
| --- | --- |
| `/api/health`, `/api/livon/data?…`, `/api/livon/chat`, `/api/livon/userdata` (no slash) | redirect to the same path + `/`; the browser blocks it: *No 'Access-Control-Allow-Origin' header* |
| `/api/health/`, `/api/livon/data/?…` (slash) | function answer, `Access-Control-Allow-Origin: https://www.newon.app` |
| `/api/livon/chat/` (GET) | 405 from the function |
| `/api/livon/userdata/` (GET) | 503 `SYNC_NOT_AVAILABLE` from the function |
| `/`, `/robots.txt` | the API-only placeholder and `Disallow: /` |

The redirect status code and `Location` header cannot be read from a cross-origin browser fetch (opaque redirect). The
target was seen by navigation (`/api/health` → `/api/health/`). Vercel documents this redirect as 308.

## 2. Architecture

1. **Vercel `trailingSlash`** — `vercel.json` had `"trailingSlash": true`. Vercel then redirects every path that has no
   trailing slash and no file extension to the slash form. `/api/health` has no extension, so it was redirected as well.
2. **Canonical API path** — the function files are `api/health.mjs`, `api/livon/data.mjs`, `api/livon/chat.mjs`,
   `api/livon/userdata.mjs`; their routes are `/api/health`, `/api/livon/data`, `/api/livon/chat`, `/api/livon/userdata`
   (no slash). Every client uses that form: ONGIL `DATA_PATH = '/api/livon/data'`, LIVON `LivonApi.url("/api/…")`,
   `scripts/verify-api-deployment.mjs`.
3. **Where CORS headers are set** — only in `server/livon/cors.mjs` (`applyCors`), called first by each handler:
   `server/livon/health.mjs`, `server/livon/data/http.mjs`, `server/livon/http.mjs` (chat), `server/livon/userdata/http.mjs`.
   Exact allowlist (`LIVON_ALLOWED_ORIGINS`, default `https://www.newon.app` and `https://newon.app`), never `*`, no
   credentials. `vercel.json` writes no `Access-Control-*` header.
4. **Redirect before the handler** — yes. The redirect is produced by Vercel's routing layer; the function does not run,
   so the response has none of the headers from item 3.
5. **OPTIONS** — inside each handler (`applyCors` → `preflight` → 204). A preflight to the no-slash path was redirected
   too, and a redirected preflight is always a CORS failure.
6. **GET / POST** — inside each handler, after `applyCors`.
7. **Expected behaviour**

   | Path | Before (`trailingSlash: true`) | After (no `trailingSlash`) |
   | --- | --- | --- |
   | `/api/…` (no slash, canonical) | platform redirect, no CORS header → blocked in browsers | function answer with CORS headers |
   | `/api/…/` (slash) | function answer | not used by any client; behaviour on Vercel after the change is **not verified** until the next deployment |

## 3. Root cause

`trailingSlash: true` in `vercel.json` + clients that (correctly) call the canonical no-slash route. Server-to-server
checks did not notice because a client that follows redirects and ignores CORS still gets an answer.

## 4. Fix

`"trailingSlash": true` is removed from `vercel.json`. No client, handler or CORS rule changed.

Why removal is safe for the API project:

- The Vercel project is API-only (`LIVON_API_ONLY=1`, `scripts/vercel-build.mjs`): its static output is `index.html` and
  `robots.txt` at the root — no directory page that needs a slash rule (test CORS-10; confirmed on the production root).
- The public site is served by GitHub Pages from the `gh-pages` branch; GitHub Pages does not read `vercel.json`.
- Existing `rewrites` (`/terms`, `/privacy`) and all `headers` rules are unchanged.

Known limitation: if the **full site** were ever deployed on Vercel (build without `LIVON_API_ONLY`), directory URLs
without a slash (`/ko`) would no longer be redirected to `/ko/`. No such deployment exists today; it would need its own
redirect rule that excludes `/api`.

Not chosen: changing every client to `/api/…/` (leaves health/chat/userdata and any future client exposed to the same
redirect), and adding a static `Access-Control-Allow-Origin` header in `vercel.json` (would bypass the exact allowlist).

## 5. Upstream failure diagnostics

`kr-kakao-place` and `kr-lifelong-class` answered 502 `UPSTREAM_ERROR` in production. The route logged nothing in
production, so the cause cannot be read from the Vercel logs. The adapters were audited (endpoint, method, query,
required parameters, error mapping, timeout): no deterministic defect was found, and the same adapters pass their
fixture tests. The cause is therefore unconfirmed and may be external (key, per-API 활용신청/승인, product activation,
IP/domain restriction, quota, upstream outage).

Added (`server/livon/data/http.mjs`): one log line per upstream failure, in production too:

```
[LIVON DATA] upstream {"provider":"kr-kakao-place","stage":"search","category":"HTTP_4XX","upstreamStatus":401,"resultCode":null,"errorClass":null,"timeout":false}
```

Fields: provider id, stage (`search` | `list`), category (`TIMEOUT` `NETWORK` `HTTP_4XX` `HTTP_5XX` `PARSE`
`INVALID_DATA` `QUOTA` `UNKNOWN`), upstream HTTP status (number), the provider's own numeric result code (data.go.kr
`resultCode` / `returnReasonCode`), JS error class for an uncoded failure, timeout flag. Never a key, header, URL,
query, body, coordinate or client address. `lifelong-class.mjs` now attaches the status / result code to its error
object for this purpose only; its behaviour and the public answer (`502 UPSTREAM_ERROR`, fixed sentence) are unchanged.

Reading the line after the next deployment:

| Log | Meaning |
| --- | --- |
| Kakao `upstreamStatus: 401` | the REST API key is not accepted |
| Kakao `upstreamStatus: 403` | the app is not allowed to use the Local API (product not enabled, or an IP restriction) |
| lifelong `resultCode: "30"` / `"20"` / `"32"` | key not registered for this API / access denied / unregistered IP |
| lifelong `resultCode: "22"` or category `QUOTA` | request limit exceeded |
| `category: "NETWORK"` / `timeout: true` | the upstream could not be reached from the function region |
| `category: "PARSE"` | the upstream answered something that is not the documented JSON |

## 6. ONGIL on production

`https://www.newon.app/ongil-start/js/data-source.js` is 404 because production is an **old build**: GitHub Pages is
built from `main`, and `main` (and `gh-pages`) contain only `ongil-start/index.html`. The branch `ongil-foundation-v1`
has 78 files under `ongil-start/`. `scripts/publish-site.mjs` copies the whole `ongil-start` directory
(`{ from: "ongil-start", to: "ongil-start", required: true }`, `copyDir` skips only `.py`, `.env*`, `.DS_Store`), so the
file is published once the branch is merged. This is not a publish bug.

## 7. Tests

`tests/livon/api-routing-cors.test.mjs` — CORS-0 (reproduction with a model of the Vercel rule), CORS-1 … CORS-10,
DIAG-1 … DIAG-4. The platform model is not Vercel itself; after a deployment run:

```
node scripts/verify-api-deployment.mjs https://newon-api.vercel.app --site-origin https://www.newon.app
```
