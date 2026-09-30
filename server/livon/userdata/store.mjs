/*
 * LIVON account data store — PostgreSQL implementation (production) + in-memory twin (tests/dev only).
 *
 * Both implement:
 *   kind
 *   findAccount({issuer, subject})                  → { accountId, status } | null
 *   createAccount({issuer, subject}, {accountId, now}) → { accountId, created }       (race-safe; one identity → one account)
 *   pull(accountId, {since, limit, collection})     → { records, hasMore, nextSince, serverRev }
 *   write(accountId, record, {sensitive})           → { status: 'applied', serverRev } | { status: 'conflict', current }
 *   serverRev(accountId)                            → number
 *   touchDevice(accountId, deviceId, {lastServerRev, conflicts, importDecided, now})
 *
 * Optimistic concurrency: record.serverRev is the revision the client last saw for that record (null = "I think it is new").
 * A write lands only if the stored revision still equals it; otherwise the current server copy is returned and the client
 * merges with its policy (livon-user-data.js mergeCollection) and retries. Nothing is ever overwritten blindly.
 * Every statement is scoped by account_id taken from the verified session — never from the request.
 */
import { randomBytes } from 'node:crypto';

export const TABLE_FOR = Object.freeze({
  saved_items: 'saved_items',
  calendar_items: 'calendar_items',
  preferences: 'preferences', save_folders: 'preferences', life_progress: 'preferences',
  tasks: 'user_records', goals: 'user_records', checklists: 'user_records', habits: 'user_records', projects: 'user_records',
  experiences: 'user_records', journal: 'user_records', transactions: 'user_records', health_records: 'user_records', budgets: 'user_records'
});
const TABLES = [...new Set(Object.values(TABLE_FOR))];
export const PULL_MAX = 500;

export function newAccountId() { return 'acct_' + randomBytes(16).toString('hex'); }
const num = v => (v === null || v === undefined ? null : Number(v));
function toRecord(row) {
  let data = row.data;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = null; } }
  return {
    id: row.record_id, collection: row.collection, schemaVersion: Number(row.schema_version),
    createdAt: num(row.created_at), updatedAt: num(row.updated_at), deletedAt: num(row.deleted_at),
    localRev: Number(row.device_rev) || 0, serverRev: num(row.server_rev), data: row.deleted_at == null ? data : null
  };
}
function tableFor(collection) {
  const t = typeof collection === 'string' && Object.prototype.hasOwnProperty.call(TABLE_FOR, collection) ? TABLE_FOR[collection] : null;
  if (!t) { const e = new Error('UNKNOWN_COLLECTION'); e.code = 'UNKNOWN_COLLECTION'; throw e; }
  return t;
}
const COLS = 'collection, record_id, schema_version, data, created_at, updated_at, deleted_at, device_rev, server_rev';

/* ───────── PostgreSQL ───────── */
export function createPostgresStore({ query }) {
  if (typeof query !== 'function') throw new Error('query function required');
  return {
    kind: 'postgres',
    async findAccount({ issuer, subject }) {
      const rows = await query('SELECT r.account_id, a.status FROM account_refs r JOIN user_accounts a ON a.account_id = r.account_id WHERE r.issuer = $1 AND r.subject = $2', [issuer, subject]);
      return rows[0] ? { accountId: rows[0].account_id, status: rows[0].status } : null;
    },
    async createAccount({ issuer, subject }, { accountId = newAccountId(), now = Date.now() } = {}) {
      /* the ref row is inserted first; the account row only if the ref insert won (FK is checked at statement end) */
      const rows = await query(
        'WITH ref AS (INSERT INTO account_refs (issuer, subject, account_id, is_primary, created_at) VALUES ($1, $2, $3, true, $4) ' +
        'ON CONFLICT (issuer, subject) DO NOTHING RETURNING account_id), ' +
        'acc AS (INSERT INTO user_accounts (account_id, created_at) SELECT account_id, $4 FROM ref RETURNING account_id) ' +
        'SELECT account_id FROM acc', [issuer, subject, accountId, now]);
      if (rows[0]) return { accountId: rows[0].account_id, created: true };
      const found = await this.findAccount({ issuer, subject });           /* lost a concurrent first-login race */
      if (!found) throw Object.assign(new Error('ACCOUNT_CREATE_FAILED'), { code: 'ACCOUNT_CREATE_FAILED' });
      return { accountId: found.accountId, created: false };
    },
    async serverRev(accountId) {
      const rows = await query('SELECT server_rev FROM user_accounts WHERE account_id = $1', [accountId]);
      return rows[0] ? Number(rows[0].server_rev) : 0;
    },
    async pull(accountId, { since = 0, limit = PULL_MAX, collection = null } = {}) {
      const lim = Math.min(Math.max(1, limit | 0), PULL_MAX);
      const tables = collection ? [tableFor(collection)] : TABLES;
      const parts = tables.map(t => `SELECT ${COLS} FROM ${t} WHERE account_id = $1 AND server_rev > $2` + (collection ? ' AND collection = $4' : ''));
      const params = [accountId, since, lim + 1].concat(collection ? [collection] : []);
      const rows = await query(`SELECT ${COLS} FROM (${parts.join(' UNION ALL ')}) x ORDER BY server_rev LIMIT $3`, params);
      const hasMore = rows.length > lim;
      const records = rows.slice(0, lim).map(toRecord);
      const serverRev = await this.serverRev(accountId);
      return { records, hasMore, nextSince: records.length ? records[records.length - 1].serverRev : since, serverRev };
    },
    async write(accountId, r, { sensitive = false } = {}) {
      const t = tableFor(r.collection);
      const base = r.serverRev == null ? null : Number(r.serverRev);
      const rows = await query(
        `WITH cur AS (SELECT server_rev FROM ${t} WHERE account_id = $1 AND collection = $2 AND record_id = $3 FOR UPDATE), ` +
        `gate AS (SELECT 1 AS ok WHERE (SELECT server_rev FROM cur) IS NOT DISTINCT FROM $4::bigint), ` +
        `rev AS (UPDATE user_accounts SET server_rev = server_rev + 1 WHERE account_id = $1 AND status = 'active' AND EXISTS (SELECT 1 FROM gate) RETURNING server_rev), ` +
        `up AS (INSERT INTO ${t} (account_id, collection, record_id, schema_version, data, sensitive, created_at, updated_at, deleted_at, device_rev, server_rev) ` +
        `SELECT $1, $2, $3, $5, $6::jsonb, $7, $8, $9, $10, $11, rev.server_rev FROM rev ` +
        `ON CONFLICT (account_id, collection, record_id) DO UPDATE SET schema_version = EXCLUDED.schema_version, data = EXCLUDED.data, sensitive = EXCLUDED.sensitive, ` +
        `created_at = LEAST(${t}.created_at, EXCLUDED.created_at), updated_at = EXCLUDED.updated_at, deleted_at = EXCLUDED.deleted_at, device_rev = EXCLUDED.device_rev, server_rev = EXCLUDED.server_rev ` +
        `WHERE ${t}.server_rev IS NOT DISTINCT FROM $4::bigint RETURNING server_rev) ` +
        `SELECT (SELECT server_rev FROM up) AS written_rev`,
        [accountId, r.collection, r.id, base, r.schemaVersion, r.deletedAt ? null : JSON.stringify(r.data), !!sensitive,
          r.createdAt, r.updatedAt, r.deletedAt || null, Number(r.localRev) || 0]);
      const written = rows[0] ? num(rows[0].written_rev) : null;
      if (written != null) return { status: 'applied', serverRev: written };
      const cur = await query(`SELECT ${COLS} FROM ${t} WHERE account_id = $1 AND collection = $2 AND record_id = $3`, [accountId, r.collection, r.id]);
      return { status: 'conflict', current: cur[0] ? toRecord(cur[0]) : null };
    },
    async touchDevice(accountId, deviceId, { lastServerRev = 0, conflicts = 0, importDecided = false, now = Date.now() } = {}) {
      await query(
        'INSERT INTO sync_metadata (account_id, device_id, last_sync_at, last_server_rev, conflict_count, import_decided_at) VALUES ($1, $2, $3, $4, $5, CASE WHEN $6 THEN $3 ELSE NULL END) ' +
        'ON CONFLICT (account_id, device_id) DO UPDATE SET last_sync_at = EXCLUDED.last_sync_at, last_server_rev = GREATEST(sync_metadata.last_server_rev, EXCLUDED.last_server_rev), ' +
        'conflict_count = sync_metadata.conflict_count + EXCLUDED.conflict_count, import_decided_at = COALESCE(sync_metadata.import_decided_at, EXCLUDED.import_decided_at)',
        [accountId, deviceId, now, lastServerRev, conflicts, !!importDecided]);
    }
  };
}

/*
 * Production executor: node-postgres Pool, loaded only when LIVON_DATABASE_URL is set and the "pg" package is installed
 * (package.json dependency; Vercel installs it). Pooled/managed connection strings (Neon, Supabase, RDS proxy…) all work.
 * Returns null when the database is not configured → the API answers 503 SERVER_NOT_CONFIGURED (fail closed).
 *
 * TLS: the connection-string sslmode is never trusted to weaken TLS (node-postgres lets it override the ssl option).
 *   production  → certificate-verified TLS always; a URL that asks for disable/allow/prefer/no-verify is refused (503)
 *   elsewhere   → verified TLS, or plain only when the URL says sslmode=disable (local development databases)
 * Timeouts: connect 5 s, each query 8 s (client side, works through PgBouncer/transaction poolers), idle 10 s.
 * A server-side statement_timeout can additionally be set on the database role (docs/newon/newon-plus-account-backend.md).
 */
const WEAK_SSLMODES = ['disable', 'allow', 'prefer', 'no-verify'];
export function databaseConfig(env = {}) {
  const raw = String(env.LIVON_DATABASE_URL || '').trim();
  if (!/^postgres(ql)?:\/\//.test(raw)) return { ok: false, reason: 'NOT_SET' };
  let url; try { url = new URL(raw); } catch { return { ok: false, reason: 'INVALID_URL' }; }
  const production = env.NODE_ENV === 'production' || !!env.VERCEL;
  const mode = String(url.searchParams.get('sslmode') || '').toLowerCase();
  if (production && (WEAK_SSLMODES.includes(mode) || url.searchParams.get('ssl') === 'false')) return { ok: false, reason: 'TLS_REQUIRED' };
  for (const k of ['sslmode', 'ssl', 'uselibpqcompat']) url.searchParams.delete(k);
  const ssl = !production && mode === 'disable' ? false : { rejectUnauthorized: true };
  return { ok: true, connectionString: url.toString(), ssl };
}
export const POOL_OPTIONS = Object.freeze({ max: 3, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 5_000, query_timeout: 8_000 });
/* Pool construction is separated from the pg import so it can be checked without the driver (tests pass a fake Pool). */
export function createPoolQuery(Pool, cfg) {
  const pool = new Pool({ ...POOL_OPTIONS, connectionString: cfg.connectionString, ssl: cfg.ssl });
  /* an idle client that errors (network drop, server restart) must not crash the function; nothing about it is logged */
  pool.on('error', () => {});
  return async (text, params) => {
    try { return (await pool.query(text, params)).rows; }
    catch (e) {
      /* constraint/serialization errors keep their SQLSTATE for callers; the message (may contain data) never leaves */
      const err = new Error('STORE_UNAVAILABLE'); err.code = 'STORE_UNAVAILABLE'; err.sqlState = e && typeof e.code === 'string' && /^[0-9A-Z]{5}$/.test(e.code) ? e.code : null;
      throw err;
    }
  };
}
let poolPromise = null;
export async function postgresQueryFromEnv(env = {}) {
  const cfg = databaseConfig(env);
  if (!cfg.ok) return null;
  if (!poolPromise) {
    poolPromise = import('pg').then(m => {
      const Pool = m.Pool || (m.default && m.default.Pool);
      return createPoolQuery(Pool, cfg);
    }).catch(() => { poolPromise = null; return null; });
  }
  return poolPromise;
}

/* ───────── in-memory twin (NOT used by the production route: api/livon/userdata.mjs never constructs it) ───────── */
export function createMemoryStore() {
  const accounts = new Map();       /* accountId → { status, serverRev } */
  const refs = new Map();           /* issuer|subject → accountId */
  const rows = new Map();           /* accountId|collection|id → record */
  const devices = new Map();
  const clone = v => (v == null ? v : JSON.parse(JSON.stringify(v)));
  return {
    kind: 'memory',
    async findAccount({ issuer, subject }) { const id = refs.get(issuer + '|' + subject); return id ? { accountId: id, status: accounts.get(id).status } : null; },
    async createAccount({ issuer, subject }, { accountId = newAccountId(), now = Date.now() } = {}) {
      const k = issuer + '|' + subject;
      if (refs.has(k)) return { accountId: refs.get(k), created: false };
      refs.set(k, accountId); accounts.set(accountId, { status: 'active', serverRev: 0, createdAt: now });
      return { accountId, created: true };
    },
    async serverRev(accountId) { return accounts.has(accountId) ? accounts.get(accountId).serverRev : 0; },
    async pull(accountId, { since = 0, limit = PULL_MAX, collection = null } = {}) {
      if (collection) tableFor(collection);
      const lim = Math.min(Math.max(1, limit | 0), PULL_MAX);
      const all = [...rows.entries()].filter(([k, r]) => k.startsWith(accountId + '|') && r.serverRev > since && (!collection || r.collection === collection))
        .map(([, r]) => r).sort((a, b) => a.serverRev - b.serverRev);
      const records = all.slice(0, lim).map(r => { const c = clone(r); delete c._sensitive; return c; });
      return { records, hasMore: all.length > lim, nextSince: records.length ? records[records.length - 1].serverRev : since, serverRev: await this.serverRev(accountId) };
    },
    async write(accountId, r, { sensitive = false } = {}) {
      tableFor(r.collection);
      const acc = accounts.get(accountId);
      const k = accountId + '|' + r.collection + '|' + r.id;
      const cur = rows.get(k) || null;
      const base = r.serverRev == null ? null : Number(r.serverRev);
      if (!acc || acc.status !== 'active' || (cur ? cur.serverRev : null) !== base) { const c = clone(cur); if (c) delete c._sensitive; return { status: 'conflict', current: c }; }
      acc.serverRev += 1;
      rows.set(k, { id: r.id, collection: r.collection, schemaVersion: r.schemaVersion, createdAt: cur ? Math.min(cur.createdAt, r.createdAt) : r.createdAt, updatedAt: r.updatedAt,
        deletedAt: r.deletedAt || null, localRev: Number(r.localRev) || 0, serverRev: acc.serverRev, data: r.deletedAt ? null : clone(r.data), _sensitive: !!sensitive });
      return { status: 'applied', serverRev: acc.serverRev };
    },
    async touchDevice(accountId, deviceId, o = {}) { devices.set(accountId + '|' + deviceId, { ...o }); },
    _debug: { accounts, refs, rows, devices }
  };
}
