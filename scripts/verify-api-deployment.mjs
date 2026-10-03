#!/usr/bin/env node
/**
 * Verify a deployed NEWON API (the Vercel API project that serves LIVON and ONGIL) from the outside, like a browser would.
 *
 *   node scripts/verify-api-deployment.mjs https://<project>.vercel.app
 *   node scripts/verify-api-deployment.mjs https://<project>.vercel.app --site-origin https://www.newon.app --json
 *
 * Takes only the public API origin. It needs no key, reads no environment variable and sends no Authorization header:
 * the API keys stay in the Vercel project. Output is status codes, fixed error codes and counts only — never response
 * rows, keys, tokens, URLs with credentials or Redis details.
 *
 * Checks
 *   1. GET  /api/health                          → 200, status "ok"; which providers report a key (booleans)
 *   2. CORS from the site origin                 → OPTIONS /api/livon/data answers 204 with that exact origin;
 *                                                  a foreign origin is refused (403)
 *   3. one small request per provider ONGIL uses → kr-lifelong-class, kr-kakao-place, kr-tourapi
 *      LIVE VERIFIED   200, ok:true, ≥1 row, every row carries a title and a source.providerName (from a public https API)
 *      NOT CONFIGURED  503 NOT_CONFIGURED (the key is missing in the Vercel project)
 *      RATE LIMITED    429 RATE_LIMIT or 503 UPSTREAM_LIMIT (our limiter or the provider quota)
 *      FAILED          anything else (code only)
 *   A local origin (http://localhost, http://127.0.0.1) is accepted for dry runs but is never reported as LIVE VERIFIED.
 *
 * Exit code: 0 when every check passes, 1 when any required check fails, 2 for a usage error.
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const DEFAULT_SITE_ORIGIN = 'https://www.newon.app';
export const FOREIGN_ORIGIN = 'https://cors-check.invalid';
export const PROVIDER_CHECKS = Object.freeze([
  Object.freeze({ id: 'kr-lifelong-class', label: 'LIFELONG', query: '?provider=kr-lifelong-class&limit=1' }),
  Object.freeze({ id: 'kr-kakao-place', label: 'KAKAO', query: '?provider=kr-kakao-place&query=' + encodeURIComponent('도서관') + '&limit=1' }),
  Object.freeze({ id: 'kr-tourapi', label: 'TOURAPI', query: '?provider=kr-tourapi&query=' + encodeURIComponent('경복궁') + '&limit=1' })
]);
export const STATUS = Object.freeze({ LIVE: 'LIVE VERIFIED', LOCAL: 'VERIFIED (LOCAL, NOT LIVE)', NOT_CONFIGURED: 'NOT CONFIGURED', RATE_LIMITED: 'RATE LIMITED', FAILED: 'FAILED' });

const HTTPS_ORIGIN = /^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:\d{1,5})?$/;
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

/* an origin only: scheme + host [+ port]; no credentials, path, query or fragment */
export function parseOrigin(value) {
  const v = String(value || '').trim().replace(/\/+$/, '').toLowerCase();
  if (HTTPS_ORIGIN.test(v)) return { origin: v, local: false };
  if (LOCAL_ORIGIN.test(v)) return { origin: v, local: true };
  return null;
}

async function call(fetcher, url, init) {
  try {
    const res = await fetcher(url, { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(20000), ...init });
    let body = null;
    const text = await res.text().catch(() => '');
    try { body = text ? JSON.parse(text) : null; } catch { body = null; }
    return { status: res.status, headers: res.headers, body };
  } catch (e) {
    return { status: 0, headers: new Headers(), body: null, network: (e && e.name === 'TimeoutError') ? 'TIMEOUT' : 'NETWORK' };
  }
}
const codeOf = r => (r.body && typeof r.body.code === 'string' && /^[A-Z_]{2,40}$/.test(r.body.code) ? r.body.code : r.network || null);

export function classifyProvider(r, { local }) {
  const code = codeOf(r);
  if (r.status === 200 && r.body && r.body.ok === true && Array.isArray(r.body.items)) {
    const rows = r.body.items;
    const real = rows.length > 0 && rows.every(e => e && typeof e.title === 'string' && e.title.trim() && e.source && typeof e.source.providerName === 'string' && e.source.providerName.trim());
    if (real) return { status: local ? STATUS.LOCAL : STATUS.LIVE, http: 200, rows: rows.length, cached: r.body.cached === true };
    return { status: STATUS.FAILED, http: 200, code: rows.length ? 'INVALID_ROWS' : 'NO_ROWS' };
  }
  if (r.status === 503 && code === 'NOT_CONFIGURED') return { status: STATUS.NOT_CONFIGURED, http: 503, code };
  if ((r.status === 429 && code === 'RATE_LIMIT') || (r.status === 503 && code === 'UPSTREAM_LIMIT')) return { status: STATUS.RATE_LIMITED, http: r.status, code };
  return { status: STATUS.FAILED, http: r.status, code: code || 'HTTP_' + r.status };
}

export async function verifyDeployment({ apiOrigin, siteOrigin = DEFAULT_SITE_ORIGIN, fetcher = fetch } = {}) {
  const api = parseOrigin(apiOrigin);
  const site = parseOrigin(siteOrigin);
  if (!api || !site || site.local) throw new Error('usage');
  const base = api.origin;
  const report = { api: base, site: site.origin, local: api.local, checks: {}, providers: {}, ok: true };
  const fail = (name, detail) => { report.checks[name] = { pass: false, ...detail }; report.ok = false; };
  const pass = (name, detail) => { report.checks[name] = { pass: true, ...detail }; };

  /* 1. health */
  const h = await call(fetcher, base + '/api/health', { headers: { Origin: site.origin } });
  if (h.status === 200 && h.body && h.body.status === 'ok') {
    const providers = (h.body.data && h.body.data.providers) || {};
    const rl = (h.body.data && h.body.data.rateLimit) || {};
    pass('health', { http: 200, configured: Object.fromEntries(PROVIDER_CHECKS.map(p => [p.id, !!(providers[p.id] && providers[p.id].configured === true)])),
      rateLimitMode: typeof rl.mode === 'string' ? rl.mode : null, limitsValid: rl.limitsValid !== false, sharedCache: !!(h.body.data && h.body.data.sharedCache) });
  } else fail('health', { http: h.status, code: codeOf(h) || 'UNEXPECTED_RESPONSE' });

  /* 2. CORS: the site origin is allowed exactly; a foreign origin is refused */
  const pre = await call(fetcher, base + '/api/livon/data', { method: 'OPTIONS', headers: { Origin: site.origin, 'Access-Control-Request-Method': 'GET' } });
  const allow = pre.headers.get('access-control-allow-origin');
  const foreign = await call(fetcher, base + '/api/livon/data?action=status', { headers: { Origin: FOREIGN_ORIGIN } });
  const corsDetail = { preflight: pre.status, allowOriginMatches: allow === site.origin, wildcard: allow === '*', credentials: pre.headers.get('access-control-allow-credentials') === 'true', foreign: foreign.status };
  if (pre.status === 204 && allow === site.origin && foreign.status === 403 && !corsDetail.credentials) pass('cors', corsDetail); else fail('cors', corsDetail);

  /* 3. providers used by ONGIL — one small request each, sequential */
  for (const p of PROVIDER_CHECKS) {
    const r = await call(fetcher, base + '/api/livon/data' + p.query, { headers: { Origin: site.origin } });
    const c = classifyProvider(r, { local: api.local });
    report.providers[p.id] = { label: p.label, ...c };
    if (c.status !== STATUS.LIVE && c.status !== STATUS.LOCAL) report.ok = false;
  }
  return report;
}

export function formatReport(report) {
  const lines = [`NEWON API VERIFICATION — ${report.api}${report.local ? '  (LOCAL DRY RUN — nothing here is live)' : ''}`, `site origin: ${report.site}`];
  const h = report.checks.health || {};
  lines.push(`HEALTH   ${h.pass ? 'PASS' : 'FAIL'}  http ${h.http}${h.code ? '  ' + h.code : ''}${h.pass ? `  rate limit: ${h.rateLimitMode}${h.limitsValid ? '' : ' (invalid override → defaults)'}  shared cache: ${h.sharedCache ? 'yes' : 'no'}` : ''}`);
  const c = report.checks.cors || {};
  lines.push(`CORS     ${c.pass ? 'PASS' : 'FAIL'}  preflight ${c.preflight}, allow-origin ${c.allowOriginMatches ? 'exact' : c.wildcard ? '"*" (wrong)' : 'missing/other'}, foreign origin ${c.foreign}${c.credentials ? ', credentials (wrong)' : ''}`);
  for (const [id, p] of Object.entries(report.providers)) {
    const extra = p.rows ? `  rows ${p.rows}${p.cached ? ' (served from the API cache)' : ''}` : (p.code ? `  ${p.code}` : '');
    const configured = h.pass && h.configured ? `  key in health: ${h.configured[id] ? 'yes' : 'no'}` : '';
    lines.push(`${p.label.padEnd(8)} ${p.status}  http ${p.http}${extra}${configured}  [${id}]`);
  }
  lines.push(report.ok ? 'RESULT   PASS' : 'RESULT   FAIL — see the lines above (docs/newon/BACKEND_DEPLOYMENT_RUNBOOK.md › Common failures)');
  return lines.join('\n');
}

export function parseArgs(argv) {
  const out = { apiOrigin: '', siteOrigin: DEFAULT_SITE_ORIGIN, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') out.json = true;
    else if (a === '--site-origin') out.siteOrigin = argv[++i] || '';
    else if (a.startsWith('--site-origin=')) out.siteOrigin = a.slice(14);
    else if (!out.apiOrigin && !a.startsWith('--')) out.apiOrigin = a;
    else return null;
  }
  return out.apiOrigin ? out : null;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (!args || !parseOrigin(args.apiOrigin) || !parseOrigin(args.siteOrigin) || parseOrigin(args.siteOrigin).local) {
    console.error('usage: node scripts/verify-api-deployment.mjs https://<project>.vercel.app [--site-origin https://www.newon.app] [--json]\n' +
      '       (an https origin only — no path, query or credentials; http://localhost is accepted for a local dry run)');
    process.exit(2);
  }
  const report = await verifyDeployment(args);
  console.log(args.json ? JSON.stringify(report, null, 2) : formatReport(report));
  process.exit(report.ok ? 0 : 1);
}
