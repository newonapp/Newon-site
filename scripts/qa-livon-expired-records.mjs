#!/usr/bin/env node
/**
 * List the LIVON records that are past their freshness window on a given clock (read-only; never edits data).
 *   node scripts/qa-livon-expired-records.mjs [--now=<ISO>] [--json out.json]
 * Every record is reported as NOT VERIFIED here: this script cannot check a source, only a person (or a reviewed fetch) can.
 * A record leaves the list only when its lastCheckedAt is updated after a real re-check - see docs/web-closure/PHASE03-P7-LIVON-EXPIRED-RECORDS.md.
 */
import fs from 'node:fs';
import { loadLivon } from './livon-data-quality.mjs';

const argv = process.argv.slice(2);
const nowArg = argv.find((a) => a.startsWith('--now='));
const now = nowArg ? Date.parse(nowArg.slice(6)) : Date.now();
if (!Number.isFinite(now)) { console.error('livon-expired-records: --now must be an ISO date'); process.exit(2); }
const jsonOut = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null;
const ctx = loadLivon({ now });
const repo = ctx.LivonScreenData.repository();
const all = repo.all ? repo.all({ any: true }) : [];
const stale = (all.length ? all : []).filter((e) => repo.freshness(e) === 'stale');
const rows = stale.map((e) => ({
  id: e.id, type: e.type, title: e.title, lastCheckedAt: e.lastCheckedAt, officialUrl: e.officialUrl || null,
  sourceKind: e.officialUrl ? 'official' : 'editorial',
  daysSinceCheck: Math.floor((now - Date.parse(e.lastCheckedAt)) / 86400000),
  shownToUsers: !repo.hiddenReason(e.id), verification: 'NOT VERIFIED',
})).sort((a, b) => a.id.localeCompare(b.id));
if (jsonOut) fs.writeFileSync(jsonOut, `${JSON.stringify({ asOf: new Date(now).toISOString(), count: rows.length, rows }, null, 1)}\n`);
console.log(`livon-expired-records: ${rows.length} record(s) past the freshness window as of ${new Date(now).toISOString().slice(0, 10)}`);
for (const r of rows) console.log(`${r.id}\t${r.type}\t${r.sourceKind}\t${r.lastCheckedAt.slice(0, 10)}\t${r.daysSinceCheck}d\t${r.title}`);
