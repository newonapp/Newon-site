// Test-only PostgreSQL executor: runs the production store's SQL against a REAL PostgreSQL server through the psql CLI
// (this environment has no npm registry access, so the "pg" driver cannot be installed for tests).
// Enabled only when LIVON_TEST_PG="host=<socket dir> port=<port> user=<user>" is set; otherwise the Postgres suite is skipped.
// Parameters are inlined as SQL literals (single quotes doubled; standard_conforming_strings=on) — test data only.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export function pgConfig(env = process.env) {
  const raw = String(env.LIVON_TEST_PG || '').trim();
  if (!raw) return null;
  const o = Object.fromEntries(raw.split(/\s+/).map(kv => kv.split('=')));
  return o.host && o.port && o.user ? o : null;
}
function lit(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') { if (!Number.isFinite(v)) throw new Error('bad number'); return String(v); }
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function inline(text, params = []) {
  return text.replace(/\$(\d+)/g, (_, n) => { const i = Number(n) - 1; if (i >= params.length) throw new Error('missing param $' + n); return lit(params[i]); });
}
function parseCsv(out) {
  const rows = []; let row = [], field = '', q = false, quoted = false;
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (q) { if (c === '"') { if (out[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; continue; }
    if (c === '"') { q = true; quoted = true; continue; }
    if (c === ',') { row.push(quoted ? field : field === '__NULL__' ? null : field); field = ''; quoted = false; continue; }
    if (c === '\n') { row.push(quoted ? field : field === '__NULL__' ? null : field); rows.push(row); row = []; field = ''; quoted = false; continue; }
    field += c;
  }
  if (field || row.length) { row.push(quoted ? field : field === '__NULL__' ? null : field); rows.push(row); }
  if (!rows.length) return [];
  const [head, ...body] = rows;
  return body.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] === undefined ? null : r[i]])));
}
function psql(cfg, db, args, input) {
  const r = spawnSync('psql', ['-h', cfg.host, '-p', cfg.port, '-U', cfg.user, '-d', db, '-X', '-q', '-v', 'ON_ERROR_STOP=1', ...args], { encoding: 'utf8', input });
  if (r.status !== 0) { const e = new Error('psql: ' + (r.stderr || '').trim().split('\n').slice(-1)[0]); e.stderr = r.stderr; throw e; }
  return r.stdout;
}
/* fresh database with the production migration applied */
export function createTestDatabase(cfg, name) {
  psql(cfg, 'postgres', ['-c', `DROP DATABASE IF EXISTS ${name}`]);
  psql(cfg, 'postgres', ['-c', `CREATE DATABASE ${name}`]);
  psql(cfg, name, ['-f', '-'], readFileSync(new URL('../../server/livon/userdata/migrations/001_account_backend.sql', import.meta.url), 'utf8'));
  return {
    query: async (text, params) => parseCsv(psql(cfg, name, ['--csv', '-P', 'null=__NULL__', '-c', inline(text, params)])),
    drop: () => psql(cfg, 'postgres', ['-c', `DROP DATABASE IF EXISTS ${name}`])
  };
}
