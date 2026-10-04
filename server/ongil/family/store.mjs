/*
 * ONGIL Family Connection V2 — family store: PostgreSQL (production) + in-memory twin (tests / local development only).
 *
 * The store only executes; it decides nothing about who may do what. server/ongil/family/http.mjs resolves the signed-in
 * account from a verified Newon+ token and runs the V1 permission engine (ongil-start/js/family-permissions.js) first.
 * Every statement is scoped by an id the server derived (owner's group from the account, membership by member_account_id).
 *
 * Atomicity: every change that touches more than one table is ONE SQL statement (data-modifying CTEs), so it commits or
 * fails as a whole — accept (invitation consumed + member + audit), disconnect / leave (membership ended + permissions,
 * consents, snapshots removed + open requests cancelled + audit), sharing changes (permissions + consents + audit).
 * Concurrency: accepting updates the invitation row WHERE status = 'PENDING'; the row lock makes a second concurrent accept
 * see ACCEPTED and change nothing. A partial unique index allows one ACTIVE membership per (group, account).
 *
 * Interface (both implementations):
 *   kind
 *   ownedGroup(accountId) → { id } | null              ensureGroup(accountId, { id, now }) → { id }
 *   groupState(groupId) → { group, members, permissions, consents, requests }   (plain rows for the permission engine)
 *   createInvitation(row) → { ok } | { ok:false, reason:'LIMIT' }               listInvitations(groupId)
 *   revokeInvitation(groupId, invitationId, now) → boolean
 *   invitationByHash(hash) → row | null                 (with owner_account_id)
 *   acceptInvitation({ hash, accountId, memberId, ownerLabel, now, memberLimit }) → member row | null
 *   declineInvitation({ hash, accountId, now }) → boolean
 *   applySharing(groupId, memberId, { set, remove, grant, withdraw }, now) → boolean   (false: membership not ACTIVE)
 *   stopSharing(groupId, memberId, now) · stopAllSharing(groupId, now)
 *   endMembership(groupId, memberId, { status, actor, now }) → boolean
 *   memberships(accountId) → ACTIVE memberships of this account in other people's groups
 *   publishSnapshot(groupId, memberId, items, now) → boolean      snapshots(memberId) → rows
 *   createHelp(row) → boolean   help(requestId) → row | null   moveHelp(requestId, from, to, actor, now) → boolean
 *   activity(groupId, limit) → rows (newest first)
 */
export const ACTIVITY_KEEP = 200;
export const INVITATION_KEEP_MS = 30 * 24 * 3600e3;
export const HELP_FINISHED_KEEP = 50;
const num = (v) => (v === null || v === undefined ? null : Number(v));
const parseLines = (v) => { if (Array.isArray(v)) return v; try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } };

/* ───────── PostgreSQL ───────── */
export function createFamilyPostgresStore({ query }) {
  if (typeof query !== 'function') throw new Error('query function required');
  const prune = (groupId) => query(
    'DELETE FROM ongil_family_activity WHERE group_id = $1 AND id NOT IN (SELECT id FROM ongil_family_activity WHERE group_id = $1 ORDER BY id DESC LIMIT $2)',
    [groupId, ACTIVITY_KEEP]).catch(() => {});
  return {
    kind: 'postgres',
    async ownedGroup(accountId) {
      const r = await query('SELECT id FROM ongil_family_groups WHERE owner_account_id = $1', [accountId]);
      return r[0] ? { id: r[0].id } : null;
    },
    async ensureGroup(accountId, { id, now }) {
      const r = await query(
        'WITH ins AS (INSERT INTO ongil_family_groups (id, owner_account_id, created_at, updated_at) VALUES ($1, $2, $3, $3) ON CONFLICT (owner_account_id) DO NOTHING RETURNING id) ' +
        'SELECT id FROM ins UNION ALL SELECT id FROM ongil_family_groups WHERE owner_account_id = $2 AND NOT EXISTS (SELECT 1 FROM ins)', [id, accountId, now]);
      return { id: r[0].id };
    },
    async groupState(groupId) {
      const g = await query('SELECT id, owner_account_id FROM ongil_family_groups WHERE id = $1', [groupId]);
      if (!g[0]) return null;
      const [members, permissions, consents, requests] = await Promise.all([
        query('SELECT id, member_account_id, display_name, owner_label, relationship, role, status, joined_at, ended_at FROM ongil_family_members WHERE group_id = $1 ORDER BY joined_at, id', [groupId]),
        query('SELECT member_id, category, level, updated_at FROM ongil_family_permissions WHERE group_id = $1', [groupId]),
        query('SELECT member_id, category, level, status, granted_at, withdrawn_at FROM ongil_family_consents WHERE group_id = $1', [groupId]),
        query('SELECT id, member_id, kind, message, status, created_at, updated_at FROM ongil_family_help_requests WHERE group_id = $1 ORDER BY created_at, id', [groupId]),
      ]);
      return {
        group: { id: g[0].id, owner_account_id: g[0].owner_account_id },
        members: members.map((m) => ({ ...m, joined_at: num(m.joined_at), ended_at: num(m.ended_at) })),
        permissions, consents: consents.map((c) => ({ ...c, granted_at: num(c.granted_at), withdrawn_at: num(c.withdrawn_at) })),
        requests: requests.map((r) => ({ ...r, created_at: num(r.created_at), updated_at: num(r.updated_at) })),
      };
    },
    async createInvitation(row) {
      /* the pending limit and the insert are one statement. Under READ COMMITTED, creates racing at the same instant can each
         count before the others commit (bounded by the racing requests; the invite rate limit caps bursts) — see the V2 doc. */
      const r = await query(
        'WITH open AS (SELECT count(*)::int AS n FROM ongil_family_invitations WHERE group_id = $2 AND status = \'PENDING\' AND expires_at > $10), ' +
        'ins AS (INSERT INTO ongil_family_invitations (id, group_id, created_by, token_hash, display_name, relationship, role, status, expires_at, created_at, updated_at) ' +
        'SELECT $1, $2, $3, $4, $5, $6, $7, \'PENDING\', $8, $10, $10 WHERE (SELECT n FROM open) < $9 RETURNING id), ' +
        'act AS (INSERT INTO ongil_family_activity (group_id, actor, action, created_at) SELECT $2, \'OWNER\', \'INVITE_CREATED\', $10 FROM ins) ' +
        'SELECT id FROM ins',
        [row.id, row.groupId, row.createdBy, row.tokenHash, row.displayName, row.relationship, row.role, row.expiresAt, row.pendingLimit, row.now]);
      if (!r[0]) return { ok: false, reason: 'LIMIT' };
      prune(row.groupId);
      /* retention: a finished or expired invitation is kept 30 days (so its owner sees what happened), then removed */
      query('DELETE FROM ongil_family_invitations WHERE group_id = $1 AND (status <> \'PENDING\' OR expires_at <= $2) AND updated_at < $3 AND expires_at < $3', [row.groupId, row.now, row.now - INVITATION_KEEP_MS]).catch(() => {});
      return { ok: true };
    },
    async listInvitations(groupId) {
      const r = await query('SELECT id, display_name, relationship, role, status, expires_at, created_at, member_id FROM ongil_family_invitations WHERE group_id = $1 ORDER BY created_at DESC LIMIT 40', [groupId]);
      return r.map((i) => ({ ...i, expires_at: num(i.expires_at), created_at: num(i.created_at) }));
    },
    async revokeInvitation(groupId, invitationId, now) {
      const r = await query(
        'WITH up AS (UPDATE ongil_family_invitations SET status = \'REVOKED\', updated_at = $3 WHERE id = $2 AND group_id = $1 AND status = \'PENDING\' RETURNING id), ' +
        'act AS (INSERT INTO ongil_family_activity (group_id, actor, action, created_at) SELECT $1, \'OWNER\', \'INVITE_REVOKED\', $3 FROM up) SELECT id FROM up',
        [groupId, invitationId, now]);
      return !!r[0];
    },
    async invitationByHash(hash) {
      const r = await query(
        'SELECT i.id, i.group_id, i.created_by, i.display_name, i.relationship, i.role, i.status, i.expires_at, g.owner_account_id ' +
        'FROM ongil_family_invitations i JOIN ongil_family_groups g ON g.id = i.group_id WHERE i.token_hash = $1', [hash]);
      return r[0] ? { ...r[0], expires_at: num(r[0].expires_at) } : null;
    },
    async acceptInvitation({ hash, accountId, memberId, ownerLabel, now, memberLimit = 10 }) {
      const r = await query(
        'WITH inv AS (UPDATE ongil_family_invitations i SET status = \'ACCEPTED\', accepted_by = $2, member_id = $3, updated_at = $5 ' +
        'WHERE i.token_hash = $1 AND i.status = \'PENDING\' AND i.expires_at > $5 AND i.created_by <> $2 ' +
        'AND NOT EXISTS (SELECT 1 FROM ongil_family_members m WHERE m.group_id = i.group_id AND m.member_account_id = $2 AND m.status = \'ACTIVE\') ' +
        'AND (SELECT count(*) FROM ongil_family_members m WHERE m.group_id = i.group_id AND m.status = \'ACTIVE\') < $6 ' +
        'RETURNING i.id, i.group_id, i.display_name, i.relationship, i.role), ' +
        'mem AS (INSERT INTO ongil_family_members (id, group_id, member_account_id, display_name, owner_label, relationship, role, status, invitation_id, joined_at) ' +
        'SELECT $3, group_id, $2, display_name, $4, relationship, role, \'ACTIVE\', id, $5 FROM inv RETURNING id, group_id, display_name, owner_label, relationship, role, status, joined_at), ' +
        'act AS (INSERT INTO ongil_family_activity (group_id, actor, action, member_id, created_at) SELECT group_id, \'MEMBER\', \'INVITE_ACCEPTED\', id, $5 FROM mem) ' +
        'SELECT * FROM mem',
        [hash, accountId, memberId, ownerLabel, now, memberLimit]);
      if (!r[0]) return null;
      prune(r[0].group_id);
      return { ...r[0], joined_at: num(r[0].joined_at) };
    },
    async declineInvitation({ hash, accountId, now }) {
      const r = await query(
        'WITH up AS (UPDATE ongil_family_invitations SET status = \'DECLINED\', updated_at = $3 WHERE token_hash = $1 AND status = \'PENDING\' AND expires_at > $3 AND created_by <> $2 RETURNING group_id), ' +
        'act AS (INSERT INTO ongil_family_activity (group_id, actor, action, created_at) SELECT group_id, \'MEMBER\', \'INVITE_DECLINED\', $3 FROM up) SELECT group_id FROM up',
        [hash, accountId, now]);
      return !!r[0];
    },
    async applySharing(groupId, memberId, { set = [], remove = [], grant = [], withdraw = [] }, now) {
      /* one statement: nothing is written unless the membership is ACTIVE at that moment */
      const r = await query(
        'WITH ok AS (SELECT id FROM ongil_family_members WHERE id = $2 AND group_id = $1 AND status = \'ACTIVE\'), ' +
        'del AS (DELETE FROM ongil_family_permissions WHERE member_id = $2 AND group_id = $1 AND category IN (SELECT jsonb_array_elements_text($4::jsonb)) AND EXISTS (SELECT 1 FROM ok) RETURNING category), ' +
        'up AS (INSERT INTO ongil_family_permissions (group_id, member_id, category, level, updated_at) SELECT $1, $2, x.category, x.level, $7 FROM jsonb_to_recordset($3::jsonb) AS x(category text, level text) WHERE EXISTS (SELECT 1 FROM ok) ' +
        'ON CONFLICT (member_id, category) DO UPDATE SET level = EXCLUDED.level, updated_at = EXCLUDED.updated_at RETURNING category), ' +
        'gr AS (INSERT INTO ongil_family_consents (group_id, member_id, category, level, status, granted_at, withdrawn_at) SELECT $1, $2, x.category, x.level, \'GRANTED\', $7, NULL FROM jsonb_to_recordset($5::jsonb) AS x(category text, level text) WHERE EXISTS (SELECT 1 FROM ok) ' +
        'ON CONFLICT (member_id, category) DO UPDATE SET level = EXCLUDED.level, status = \'GRANTED\', granted_at = EXCLUDED.granted_at, withdrawn_at = NULL RETURNING category), ' +
        'wd AS (UPDATE ongil_family_consents SET status = \'WITHDRAWN\', withdrawn_at = $7 WHERE member_id = $2 AND group_id = $1 AND status = \'GRANTED\' AND category IN (SELECT jsonb_array_elements_text($6::jsonb)) AND EXISTS (SELECT 1 FROM ok) RETURNING category), ' +
        'snap AS (DELETE FROM ongil_family_snapshots WHERE member_id = $2 AND group_id = $1 AND category IN (SELECT jsonb_array_elements_text($4::jsonb)) RETURNING category), ' +
        'a1 AS (INSERT INTO ongil_family_activity (group_id, actor, action, member_id, created_at) SELECT $1, \'OWNER\', \'SHARING_CHANGED\', $2, $7 FROM ok), ' +
        'a2 AS (INSERT INTO ongil_family_activity (group_id, actor, action, member_id, category, created_at) SELECT $1, \'OWNER\', \'CONSENT_GIVEN\', $2, category, $7 FROM gr), ' +
        'a3 AS (INSERT INTO ongil_family_activity (group_id, actor, action, member_id, category, created_at) SELECT $1, \'OWNER\', \'CONSENT_WITHDRAWN\', $2, category, $7 FROM wd) ' +
        'SELECT (SELECT count(*) FROM ok)::int AS ok',
        [groupId, memberId, JSON.stringify(set), JSON.stringify(remove), JSON.stringify(grant), JSON.stringify(withdraw), now]);
      prune(groupId);
      return Number(r[0] && r[0].ok) === 1;
    },
    async stopSharing(groupId, memberId, now) {
      const r = await query(
        'WITH ok AS (SELECT id FROM ongil_family_members WHERE id = $2 AND group_id = $1 AND status = \'ACTIVE\'), ' +
        'p AS (DELETE FROM ongil_family_permissions WHERE member_id = $2 AND group_id = $1 RETURNING 1), ' +
        's AS (DELETE FROM ongil_family_snapshots WHERE member_id = $2 AND group_id = $1 RETURNING 1), ' +
        'c AS (UPDATE ongil_family_consents SET status = \'WITHDRAWN\', withdrawn_at = $3 WHERE member_id = $2 AND group_id = $1 AND status = \'GRANTED\' RETURNING 1), ' +
        'a AS (INSERT INTO ongil_family_activity (group_id, actor, action, member_id, created_at) SELECT $1, \'OWNER\', \'SHARING_STOPPED\', $2, $3 FROM ok) ' +
        'SELECT (SELECT count(*) FROM ok)::int AS ok', [groupId, memberId, now]);
      prune(groupId);
      return Number(r[0] && r[0].ok) === 1;
    },
    async stopAllSharing(groupId, now) {
      await query(
        'WITH p AS (DELETE FROM ongil_family_permissions WHERE group_id = $1 RETURNING 1), s AS (DELETE FROM ongil_family_snapshots WHERE group_id = $1 RETURNING 1), ' +
        'c AS (UPDATE ongil_family_consents SET status = \'WITHDRAWN\', withdrawn_at = $2 WHERE group_id = $1 AND status = \'GRANTED\' RETURNING 1), ' +
        'a AS (INSERT INTO ongil_family_activity (group_id, actor, action, created_at) VALUES ($1, \'OWNER\', \'SHARING_STOPPED_ALL\', $2) RETURNING 1) SELECT 1 AS ok', [groupId, now]);
      prune(groupId);
      return true;
    },
    async endMembership(groupId, memberId, { status, actor, now }) {
      const action = status === 'LEFT' ? 'MEMBER_LEFT' : 'DISCONNECTED';
      const r = await query(
        'WITH m AS (UPDATE ongil_family_members SET status = $3, ended_at = $5 WHERE id = $2 AND group_id = $1 AND status = \'ACTIVE\' RETURNING id), ' +
        'p AS (DELETE FROM ongil_family_permissions WHERE member_id IN (SELECT id FROM m) RETURNING 1), ' +
        's AS (DELETE FROM ongil_family_snapshots WHERE member_id IN (SELECT id FROM m) RETURNING 1), ' +
        'c AS (UPDATE ongil_family_consents SET status = \'WITHDRAWN\', withdrawn_at = $5 WHERE member_id IN (SELECT id FROM m) AND status = \'GRANTED\' RETURNING 1), ' +
        'h AS (UPDATE ongil_family_help_requests SET status = \'CANCELLED\', updated_at = $5 WHERE member_id IN (SELECT id FROM m) AND status IN (\'REQUESTED\',\'SEEN\',\'ACCEPTED\') RETURNING 1), ' +
        'a AS (INSERT INTO ongil_family_activity (group_id, actor, action, member_id, created_at) SELECT $1, $4, $6, id, $5 FROM m) ' +
        'SELECT (SELECT count(*) FROM m)::int AS ok', [groupId, memberId, status, actor, now, action]);
      prune(groupId);
      return Number(r[0] && r[0].ok) === 1;
    },
    async memberships(accountId) {
      const r = await query(
        'SELECT m.id, m.group_id, m.owner_label, m.role, m.relationship, m.joined_at FROM ongil_family_members m WHERE m.member_account_id = $1 AND m.status = \'ACTIVE\' ORDER BY m.joined_at, m.id', [accountId]);
      return r.map((m) => ({ ...m, joined_at: num(m.joined_at) }));
    },
    async membership(memberId) {
      const r = await query('SELECT id, group_id, member_account_id, owner_label, status FROM ongil_family_members WHERE id = $1', [memberId]);
      return r[0] || null;
    },
    async publishSnapshot(groupId, memberId, items, now) {
      const r = await query(
        'WITH ok AS (SELECT id FROM ongil_family_members WHERE id = $2 AND group_id = $1 AND status = \'ACTIVE\'), ' +
        'del AS (DELETE FROM ongil_family_snapshots WHERE member_id = $2 AND group_id = $1 AND EXISTS (SELECT 1 FROM ok) RETURNING 1), ' +
        'ins AS (INSERT INTO ongil_family_snapshots (group_id, member_id, category, level, lines, published_at) SELECT $1, $2, x.category, x.level, x.lines, $4 FROM jsonb_to_recordset($3::jsonb) AS x(category text, level text, lines jsonb) WHERE EXISTS (SELECT 1 FROM ok) ' +
        'ON CONFLICT (member_id, category) DO UPDATE SET level = EXCLUDED.level, lines = EXCLUDED.lines, published_at = EXCLUDED.published_at RETURNING 1) ' +
        'SELECT (SELECT count(*) FROM ok)::int AS ok', [groupId, memberId, JSON.stringify(items), now]);
      return Number(r[0] && r[0].ok) === 1;
    },
    async snapshots(memberId) {
      const r = await query('SELECT category, level, lines, published_at FROM ongil_family_snapshots WHERE member_id = $1', [memberId]);
      return r.map((s) => ({ category: s.category, level: s.level, lines: parseLines(s.lines), published_at: num(s.published_at) }));
    },
    async createHelp(row) {
      const r = await query(
        'WITH ok AS (SELECT id FROM ongil_family_members WHERE id = $3 AND group_id = $2 AND status = \'ACTIVE\'), ' +
        'ins AS (INSERT INTO ongil_family_help_requests (id, group_id, member_id, kind, message, status, created_at, updated_at) SELECT $1, $2, $3, $4, $5, \'REQUESTED\', $6, $6 FROM ok RETURNING id), ' +
        'a AS (INSERT INTO ongil_family_activity (group_id, actor, action, member_id, status, created_at) SELECT $2, \'OWNER\', \'HELP_REQUESTED\', $3, \'REQUESTED\', $6 FROM ins) SELECT id FROM ins',
        [row.id, row.groupId, row.memberId, row.kind, row.message, row.now]);
      prune(row.groupId);
      /* retention: finished requests (끝남 / 취소함) beyond the newest HELP_FINISHED_KEEP of a family are removed */
      query('DELETE FROM ongil_family_help_requests WHERE group_id = $1 AND status IN (\'COMPLETED\',\'CANCELLED\') AND id NOT IN (SELECT id FROM ongil_family_help_requests WHERE group_id = $1 AND status IN (\'COMPLETED\',\'CANCELLED\') ORDER BY updated_at DESC, id DESC LIMIT $2)', [row.groupId, HELP_FINISHED_KEEP]).catch(() => {});
      return !!r[0];
    },
    async help(requestId) {
      const r = await query('SELECT id, group_id, member_id, kind, message, status, created_at, updated_at FROM ongil_family_help_requests WHERE id = $1', [requestId]);
      return r[0] ? { ...r[0], created_at: num(r[0].created_at), updated_at: num(r[0].updated_at) } : null;
    },
    async moveHelp(requestId, from, to, actor, now) {
      const r = await query(
        'WITH up AS (UPDATE ongil_family_help_requests SET status = $3, updated_at = $5 WHERE id = $1 AND status = $2 RETURNING group_id, member_id), ' +
        'a AS (INSERT INTO ongil_family_activity (group_id, actor, action, member_id, status, created_at) SELECT group_id, $4, \'HELP_STATUS_CHANGED\', member_id, $3, $5 FROM up) SELECT group_id FROM up',
        [requestId, from, to, actor, now]);
      if (r[0]) prune(r[0].group_id);
      return !!r[0];
    },
    async activity(groupId, limit = 50) {
      const r = await query('SELECT actor, action, member_id, category, status, created_at FROM ongil_family_activity WHERE group_id = $1 ORDER BY id DESC LIMIT $2', [groupId, Math.min(Math.max(1, limit | 0), ACTIVITY_KEEP)]);
      return r.map((a) => ({ ...a, created_at: num(a.created_at) }));
    },
  };
}

/* ───────── in-memory twin (NOT wired into production: api/ongil/family.mjs never constructs it) ───────── */
export function createFamilyMemoryStore() {
  const groups = new Map();        /* id → { id, owner_account_id } */
  const members = new Map();       /* id → row */
  const invitations = new Map();   /* id → row */
  const permissions = new Map();   /* memberId|category → row */
  const consents = new Map();
  const snaps = new Map();
  const helps = new Map();
  const activityRows = [];
  let seq = 0;
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const log = (group_id, actor, action, extra = {}) => {
    activityRows.push({ id: ++seq, group_id, actor, action, member_id: extra.member_id || null, category: extra.category || null, status: extra.status || null, created_at: extra.now });
    const mine = activityRows.filter((a) => a.group_id === group_id);
    if (mine.length > ACTIVITY_KEEP) for (const old of mine.slice(0, mine.length - ACTIVITY_KEEP)) activityRows.splice(activityRows.indexOf(old), 1);
  };
  const activeMember = (groupId, memberId) => { const m = members.get(memberId); return m && m.group_id === groupId && m.status === 'ACTIVE' ? m : null; };
  const dropAccess = (memberId, now) => {
    for (const [k, p] of permissions) if (p.member_id === memberId) permissions.delete(k);
    for (const [k, s] of snaps) if (s.member_id === memberId) snaps.delete(k);
    for (const c of consents.values()) if (c.member_id === memberId && c.status === 'GRANTED') Object.assign(c, { status: 'WITHDRAWN', withdrawn_at: now });
  };
  return {
    kind: 'memory',
    async ownedGroup(accountId) { for (const g of groups.values()) if (g.owner_account_id === accountId) return { id: g.id }; return null; },
    async ensureGroup(accountId, { id, now }) {
      for (const g of groups.values()) if (g.owner_account_id === accountId) return { id: g.id };
      groups.set(id, { id, owner_account_id: accountId, created_at: now, updated_at: now });
      return { id };
    },
    async groupState(groupId) {
      const g = groups.get(groupId);
      if (!g) return null;
      return clone({
        group: { id: g.id, owner_account_id: g.owner_account_id },
        members: [...members.values()].filter((m) => m.group_id === groupId),
        permissions: [...permissions.values()].filter((p) => p.group_id === groupId),
        consents: [...consents.values()].filter((c) => c.group_id === groupId),
        requests: [...helps.values()].filter((h) => h.group_id === groupId),
      });
    },
    async createInvitation(row) {
      const open = [...invitations.values()].filter((i) => i.group_id === row.groupId && i.status === 'PENDING' && i.expires_at > row.now).length;
      if (open >= row.pendingLimit) return { ok: false, reason: 'LIMIT' };
      if ([...invitations.values()].some((i) => i.token_hash === row.tokenHash)) throw Object.assign(new Error('STORE_UNAVAILABLE'), { code: 'STORE_UNAVAILABLE', sqlState: '23505' });
      invitations.set(row.id, { id: row.id, group_id: row.groupId, created_by: row.createdBy, token_hash: row.tokenHash, display_name: row.displayName, relationship: row.relationship, role: row.role, status: 'PENDING', expires_at: row.expiresAt, accepted_by: null, member_id: null, created_at: row.now, updated_at: row.now });
      log(row.groupId, 'OWNER', 'INVITE_CREATED', { now: row.now });
      for (const [k, i] of invitations) if (i.group_id === row.groupId && (i.status !== 'PENDING' || i.expires_at <= row.now) && i.updated_at < row.now - INVITATION_KEEP_MS && i.expires_at < row.now - INVITATION_KEEP_MS) invitations.delete(k);
      return { ok: true };
    },
    async listInvitations(groupId) {
      return clone([...invitations.values()].filter((i) => i.group_id === groupId).sort((a, b) => b.created_at - a.created_at).slice(0, 40)
        .map(({ id, display_name, relationship, role, status, expires_at, created_at, member_id }) => ({ id, display_name, relationship, role, status, expires_at, created_at, member_id })));
    },
    async revokeInvitation(groupId, invitationId, now) {
      const i = invitations.get(invitationId);
      if (!i || i.group_id !== groupId || i.status !== 'PENDING') return false;
      Object.assign(i, { status: 'REVOKED', updated_at: now });
      log(groupId, 'OWNER', 'INVITE_REVOKED', { now });
      return true;
    },
    async invitationByHash(hash) {
      for (const i of invitations.values()) if (i.token_hash === hash) {
        const { id, group_id, created_by, display_name, relationship, role, status, expires_at } = i;
        return { id, group_id, created_by, display_name, relationship, role, status, expires_at, owner_account_id: groups.get(i.group_id).owner_account_id };
      }
      return null;
    },
    async acceptInvitation({ hash, accountId, memberId, ownerLabel, now, memberLimit = 10 }) {
      const i = [...invitations.values()].find((x) => x.token_hash === hash);
      if (!i || i.status !== 'PENDING' || !(i.expires_at > now) || i.created_by === accountId) return null;
      if ([...members.values()].filter((m) => m.group_id === i.group_id && m.status === 'ACTIVE').length >= memberLimit) return null;
      if ([...members.values()].some((m) => m.group_id === i.group_id && m.member_account_id === accountId && m.status === 'ACTIVE')) return null;
      Object.assign(i, { status: 'ACCEPTED', accepted_by: accountId, member_id: memberId, updated_at: now });
      const m = { id: memberId, group_id: i.group_id, member_account_id: accountId, display_name: i.display_name, owner_label: ownerLabel, relationship: i.relationship, role: i.role, status: 'ACTIVE', invitation_id: i.id, joined_at: now, ended_at: null };
      members.set(memberId, m);
      log(i.group_id, 'MEMBER', 'INVITE_ACCEPTED', { member_id: memberId, now });
      const { id, group_id, display_name, owner_label, relationship, role, status, joined_at } = m;
      return { id, group_id, display_name, owner_label, relationship, role, status, joined_at };
    },
    async declineInvitation({ hash, accountId, now }) {
      const i = [...invitations.values()].find((x) => x.token_hash === hash);
      if (!i || i.status !== 'PENDING' || !(i.expires_at > now) || i.created_by === accountId) return false;
      Object.assign(i, { status: 'DECLINED', updated_at: now });
      log(i.group_id, 'MEMBER', 'INVITE_DECLINED', { now });
      return true;
    },
    async applySharing(groupId, memberId, { set = [], remove = [], grant = [], withdraw = [] }, now) {
      if (!activeMember(groupId, memberId)) return false;
      for (const c of remove) { permissions.delete(memberId + '|' + c); snaps.delete(memberId + '|' + c); }
      for (const p of set) permissions.set(memberId + '|' + p.category, { group_id: groupId, member_id: memberId, category: p.category, level: p.level, updated_at: now });
      for (const g of grant) { consents.set(memberId + '|' + g.category, { group_id: groupId, member_id: memberId, category: g.category, level: g.level, status: 'GRANTED', granted_at: now, withdrawn_at: null }); }
      const withdrawn = [];
      for (const c of withdraw) { const k = consents.get(memberId + '|' + c); if (k && k.status === 'GRANTED') { Object.assign(k, { status: 'WITHDRAWN', withdrawn_at: now }); withdrawn.push(c); } }
      log(groupId, 'OWNER', 'SHARING_CHANGED', { member_id: memberId, now });
      for (const g of grant) log(groupId, 'OWNER', 'CONSENT_GIVEN', { member_id: memberId, category: g.category, now });
      for (const c of withdrawn) log(groupId, 'OWNER', 'CONSENT_WITHDRAWN', { member_id: memberId, category: c, now });
      return true;
    },
    async stopSharing(groupId, memberId, now) {
      if (!activeMember(groupId, memberId)) return false;
      dropAccess(memberId, now);
      log(groupId, 'OWNER', 'SHARING_STOPPED', { member_id: memberId, now });
      return true;
    },
    async stopAllSharing(groupId, now) {
      for (const m of members.values()) if (m.group_id === groupId) dropAccess(m.id, now);
      log(groupId, 'OWNER', 'SHARING_STOPPED_ALL', { now });
      return true;
    },
    async endMembership(groupId, memberId, { status, actor, now }) {
      const m = activeMember(groupId, memberId);
      if (!m) return false;
      Object.assign(m, { status, ended_at: now });
      dropAccess(memberId, now);
      for (const h of helps.values()) if (h.member_id === memberId && ['REQUESTED', 'SEEN', 'ACCEPTED'].includes(h.status)) Object.assign(h, { status: 'CANCELLED', updated_at: now });
      log(groupId, actor, status === 'LEFT' ? 'MEMBER_LEFT' : 'DISCONNECTED', { member_id: memberId, now });
      return true;
    },
    async memberships(accountId) {
      return clone([...members.values()].filter((m) => m.member_account_id === accountId && m.status === 'ACTIVE').sort((a, b) => a.joined_at - b.joined_at)
        .map(({ id, group_id, owner_label, role, relationship, joined_at }) => ({ id, group_id, owner_label, role, relationship, joined_at })));
    },
    async membership(memberId) {
      const m = members.get(memberId);
      return m ? { id: m.id, group_id: m.group_id, member_account_id: m.member_account_id, owner_label: m.owner_label, status: m.status } : null;
    },
    async publishSnapshot(groupId, memberId, items, now) {
      if (!activeMember(groupId, memberId)) return false;
      for (const [k, s] of snaps) if (s.member_id === memberId) snaps.delete(k);
      for (const it of items) snaps.set(memberId + '|' + it.category, { group_id: groupId, member_id: memberId, category: it.category, level: it.level, lines: clone(it.lines), published_at: now });
      return true;
    },
    async snapshots(memberId) {
      return clone([...snaps.values()].filter((s) => s.member_id === memberId).map(({ category, level, lines, published_at }) => ({ category, level, lines, published_at })));
    },
    async createHelp(row) {
      if (!activeMember(row.groupId, row.memberId)) return false;
      helps.set(row.id, { id: row.id, group_id: row.groupId, member_id: row.memberId, kind: row.kind, message: row.message, status: 'REQUESTED', created_at: row.now, updated_at: row.now });
      log(row.groupId, 'OWNER', 'HELP_REQUESTED', { member_id: row.memberId, status: 'REQUESTED', now: row.now });
      const finished = [...helps.values()].filter((h) => h.group_id === row.groupId && ['COMPLETED', 'CANCELLED'].includes(h.status)).sort((a, b) => b.updated_at - a.updated_at || (b.id < a.id ? -1 : 1));
      for (const h of finished.slice(HELP_FINISHED_KEEP)) helps.delete(h.id);
      return true;
    },
    async help(requestId) { const h = helps.get(requestId); return h ? clone(h) : null; },
    async moveHelp(requestId, from, to, actor, now) {
      const h = helps.get(requestId);
      if (!h || h.status !== from) return false;
      Object.assign(h, { status: to, updated_at: now });
      log(h.group_id, actor, 'HELP_STATUS_CHANGED', { member_id: h.member_id, status: to, now });
      return true;
    },
    async activity(groupId, limit = 50) {
      return clone(activityRows.filter((a) => a.group_id === groupId).sort((a, b) => b.id - a.id).slice(0, Math.min(Math.max(1, limit | 0), ACTIVITY_KEEP))
        .map(({ actor, action, member_id, category, status, created_at }) => ({ actor, action, member_id, category, status, created_at })));
    },
    _debug: { groups, members, invitations, permissions, consents, snaps, helps, activityRows },
  };
}
