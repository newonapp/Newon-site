#!/usr/bin/env node
/**
 * LIVON content quality audit (read-only, deterministic). Loads every curated LIVON record exactly as the browser does
 * (data files → Data Platform → screen bridge → search index) and scores each one. The score is internal only and is
 * never shown in the UI.
 *
 *   node scripts/livon-content-quality.mjs                    → summary on stdout
 *   node scripts/livon-content-quality.mjs --json report.json  → also writes the full per-record report (not committed)
 *
 * Grades: 90–100 Excellent · 75–89 Good · 60–74 Needs Review · <60 Poor.  PASS = Excellent + Good.
 * No network requests are made: URL checks are format checks only (HTTP status is not verified here).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLivon } from './livon-data-quality.mjs';

/* The evaluator itself lives in livon/data/livon-content-quality.js (one implementation for Node and the local
   Data Manager). loadLivon() runs it in the same context as the browser scripts. */
const REF = loadLivon().LivonContentQuality;
export const FLAGS = REF.FLAGS;
export const PROVENANCE = REF.PROVENANCE;
export const SEARCH_SET = REF.SEARCH_SET;
export const SCENARIOS = REF.SCENARIOS;
export const provenanceClass = REF.provenanceClass;
export function contentQuality(ctx, opts = {}) { return ctx.LivonContentQuality.evaluate(ctx, opts); }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rep = contentQuality(loadLivon());
  const t = rep.totals;
  const lines = [
    'LIVON CONTENT QUALITY',
    `TOTAL         ${t.total} (curated ${t.curated})`,
    `PASS          ${t.pass}  (Excellent ${t.byGrade.Excellent || 0} · Good ${t.byGrade.Good || 0})`,
    `NEEDS REVIEW  ${t.needsReview}`,
    `POOR          ${t.poor}`,
    `AVERAGE       ${t.averageScore}`,
    'ISSUES',
    ...Object.entries(rep.flags).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${k.padEnd(28)} ${v}`),
    `SEARCH        ${rep.searchSummary.queries} queries · zero ${rep.searchSummary.zeroResults.length} · weak ${rep.searchSummary.weak.length} · relevant@5 avg ${rep.searchSummary.relevantTop5Avg}`,
    `RECOMMEND     ${rep.recommendations.map(r => r.name + ' ' + r.relevant + '/' + r.count).join(' · ')}`
  ];
  console.log(lines.join('\n'));
  const i = process.argv.indexOf('--json');
  if (i > 0 && process.argv[i + 1]) { fs.writeFileSync(process.argv[i + 1], JSON.stringify(rep, null, 2)); console.log('report → ' + process.argv[i + 1]); }
}
