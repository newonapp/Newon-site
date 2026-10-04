// LIVON Final Integration & Release Candidate V1 (RC-1 … RC-53).
// A release audit, not a feature suite: it re-checks, on the frozen RC source, what every earlier phase promised
// (ancestry, source integrity, secrets, build/publish exclusions, data, SEO index switch, truthfulness, local data,
// anonymous mode, network, accessibility reflow, performance structure) and pins the release documents.
// Static tests run everywhere. Browser tests need a local Chromium and are skipped without one (same rule as the
// accessibility and performance suites). Git-based checks are skipped where the tree is not a git checkout.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkSite } from '../../scripts/livon-seo-quality.mjs';
import * as PERF from '../../scripts/livon-performance-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const has = f => fs.existsSync(path.join(ROOT, f));
const INDEX = src('livon/index.html');
const PUBLISH = src('scripts/publish-site.mjs');
const MANIFEST_DOC = has('docs/livon/LIVON_RELEASE_MANIFEST.md') ? src('docs/livon/LIVON_RELEASE_MANIFEST.md') : '';
const CHECKLIST_DOC = has('docs/livon/LIVON_RELEASE_CHECKLIST.md') ? src('docs/livon/LIVON_RELEASE_CHECKLIST.md') : '';

/* ───────── git (optional) ───────── */
const git = (...a) => spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' });
const isGit = git('rev-parse', '--is-inside-work-tree').stdout.trim() === 'true';
const hasCommit = h => isGit && git('cat-file', '-e', h + '^{commit}').status === 0;
const noGit = !isGit && 'not a git checkout';

/* the phases that make up LIVON V1, oldest first (commit = the phase's own commit on its branch) */
export const PHASES = [
  ['ANONYMOUS FREE MODE', '12c1b4a6f', 'Ship LIVON anonymous free mode'],
  ['DATA PLATFORM V1', '55be1ec29', 'LIVON Data Platform V1'],
  ['SCREEN MIGRATION V1', '6f3a781e3', 'LIVON Data Platform Screen Migration V1'],
  ['REAL DATA INTEGRATION V1', '75bd82eff', 'LIVON Real Data Integration V1'],
  ['CONTENT QUALITY V1', 'ce95d33ce', 'LIVON Content Quality V1'],
  ['DATA MANAGER V1', '437db6baa', 'LIVON Data Management Tool V1'],
  ['ADMIN LOCAL V1', 'e4c8e2f49', 'LIVON Admin Local V1'],
  ['ONBOARDING V1', 'b1f1324d4', 'LIVON Onboarding V1'],
  ['COMMUNITY + ONBOARDING V1', '70b24646d', 'LIVON Community UX V1'],
  ['HELP & FAQ V1', '8802d6a21', 'LIVON Help & FAQ V1'],
  ['SEO EXPANSION V1', '0ef28b895', 'LIVON SEO Expansion V1'],
  ['ACCESSIBILITY HARDENING V1', '29628c2ef', 'LIVON Accessibility Hardening V1'],
  ['PERFORMANCE OPTIMIZATION V1', 'f41d58777', 'LIVON Performance Optimization V1']
];
export const RC_BASE = 'f41d58777';
/* product files changed by the RC (release-blocker fixes only). Empty = the RC ships the Performance V1 product unchanged. */
export const RC_FIXES = ['.github/workflows/github-pages.yml', 'scripts/livon-seo-build.mjs'];
/* livon-v1-completion: the NEWON backend production hardening (main f65dfab06), brought onto the RC as one commit */
export const BACKEND_HARDENING = { subject: 'Prepare NEWON backend for production deployment', files: ['.env.example', 'vercel.json', 'scripts/verify-api-deployment.mjs', 'server/livon/chat.mjs', 'server/livon/data/cache.mjs', 'server/livon/data/http.mjs', 'server/livon/data/limit.mjs', 'server/livon/health.mjs', 'server/livon/ratelimit.mjs', 'server/livon/redis-env.mjs'] };
/* later completion commits (product fixes) list their files here */
/* Product Completion Audit (livon-v1-completion): header search on the shared index, derived alerts, legacy-save removal,
   film request de-duplication, separate-API-origin URLs — see docs/livon/LIVON_PRODUCT_COMPLETION_AUDIT.md and tests/livon/completion.test.mjs */
export const COMPLETION_FIXES = ['livon/index.html', 'livon/livon-platform.js', 'livon/livon-media.js', 'livon/ai-page.js', 'livon/livon-api-config.js', 'scripts/livon-api-config.mjs',
  /* with the data server reachable (LIVON_API_ORIGIN set in production): Help reports the public data that really arrived */
  'livon/help-data.js', 'livon/help-page.js'];

/* main 652a8375f: canonical API routing + CORS fix (trailingSlash rule removed, upstream failure diagnostics) — kept from main */
export const ROUTING_CORS_FIX = { commit: '5ae277ef1', subject: 'Fix NEWON API canonical routing and CORS for production clients', files: ['vercel.json', 'server/livon/data/http.mjs', 'server/livon/data/providers/lifelong-class.mjs'] };
/* livon-production-v1: LIVON V1 brought onto main path by path (no merge, no cherry-pick), so the phase commits are not ancestors
   there. `source` is the completion commit whose tree was integrated, `paths` what was taken from it, `aligned` the only files
   under those paths that may differ from it (production API routing alignment + the routing/CORS test main owns). */
export const PRODUCTION_INTEGRATION = {
  source: 'fdcabc2fa',
  subjects: ['Integrate LIVON production frontend', 'Align LIVON with production API routing'],
  paths: ['livon', 'docs/livon', 'tests/livon', 'scripts/livon-*', 'scripts/publish-site.mjs', 'scripts/serve-publish.mjs', '.github/workflows/github-pages.yml',
    'assets/livon-mark-icon-120.jpg', 'api/livon/ai/chat.mjs', 'api/livon/data/status.mjs', 'server/livon/ai/tools.mjs', 'server/livon/chat.mjs', 'server/livon/http.mjs'],
  aligned: ['livon/livon-api-config.js', 'livon/ai-page.js', 'livon/index.html', 'scripts/livon-api-config.mjs', 'docs/livon/LIVON_PRODUCT_COMPLETION_AUDIT.md',
    'tests/livon/completion.test.mjs', 'tests/livon/live-backend.test.mjs', 'tests/livon/release-candidate.test.mjs', 'tests/livon/api-routing-cors.test.mjs'],
  /* the one LIVON-path file the integration kept from main instead of the completion tree (see the integration commit message) */
  mainKept: ['tests/livon/api-routing-cors.test.mjs'],
  /* content fingerprint of the completion tree (source) on `paths` without `mainKept`: SHA-256 over the sorted "path blob-id"
     lines of `git ls-tree -r`. Git blob ids are content hashes, so this pins the exact LIVON V1 product content. It lets a
     checkout that has only main's history (no livon-v1-completion branch) prove that the integration commit carried that
     content, without needing the source commit object. */
  sourceDigest: 'd23fcabc184dd6d1b95b3725db40c76438cf59c28e4b09e046529ef4a5573cdc'
};
/* "path blob" lines of a commit's tree on the given paths (git pathspecs), minus excluded files → SHA-256 */
export function treeDigest(commit, paths, exclude = []) {
  const r = git('ls-tree', '-r', commit, '--', ...paths);
  if (r.status !== 0) return null;
  const lines = r.stdout.split('\n').filter(Boolean).map(l => { const [meta, file] = l.split('\t'); return file + ' ' + meta.split(' ')[2]; })
    .filter(l => !exclude.includes(l.slice(0, l.lastIndexOf(' ')))).sort();
  return crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
}
const commitBySubject = subject => (git('log', '--format=%H%x09%s', 'HEAD').stdout.split('\n').find(l => l.split('\t')[1] === subject) || '').split('\t')[0] || null;

/* LIVON AI LIVE V1 (branch livon-ai-live-v1): AI orchestration, tools and consent-scoped context. Accepted only on a line
   whose history contains this commit, and only these files. */
export const AI_LIVE = { subject: 'Implement LIVON AI live foundation',
  files: ['livon/ai-page.js', 'livon/ai-page.css', 'livon/index.html', 'server/livon/chat.mjs', 'server/livon/http.mjs', 'server/livon/ai/agent.mjs',
    'docs/livon/LIVON_AI_LIVE.md', 'tests/livon/ai-live.test.mjs', 'tests/livon/completion.test.mjs', 'tests/livon/release-candidate.test.mjs'] };
const aiLiveIn = () => git('log', '--format=%s', 'HEAD').stdout.split('\n').includes(AI_LIVE.subject);

/* LIVON Community V2 (branch livon-community-v2, merged into production): the local-first Community completion. Accepted
   only on a line whose history contains this commit, and only these files — each of which that commit actually changed. */
export const COMMUNITY_V2 = { subject: 'Complete LIVON Community V2',
  files: ['livon/community-page.js', 'livon/community-page.css', 'livon/community-service.js', 'livon/community-remote.js', 'livon/index.html',
    'docs/livon/LIVON_COMMUNITY_V2.md', 'tests/livon/community-v2.test.mjs', 'tests/livon/performance.test.mjs'] };
const communityV2Commit = () => (git('log', '--no-merges', '--format=%H%x09%s', 'HEAD').stdout.split('\n').find(l => l.split('\t')[1] === COMMUNITY_V2.subject) || '').split('\t')[0] || null;

/* main e0436c916: ONGIL (another product on the same site) integrated for production. Its files are not LIVON product files;
   they are accepted only under its own directory and only on a line that contains that integration commit. */
export const ONGIL_PRODUCT = { subject: 'Integrate ONGIL production frontend', dir: 'ongil-start/' };
/* ONGIL Family Connection V2 (production integration merge): ONGIL's own family route and store — not LIVON product files.
   Accepted file by file, and only on a line that contains that merge; any other server / api file still needs its own entry. */
export const ONGIL_FAMILY_V2 = { subject: 'Integrate ONGIL Family V2 with production', files: ['api/ongil/family.mjs', 'server/ongil/family/http.mjs', 'server/ongil/family/store.mjs',
  'server/ongil/family/migrations/001_family.sql', 'server/ongil/family/migrations/002_family_limits.sql'] };
const familyV2In = () => git('log', '--format=%s', 'HEAD').stdout.split('\n').includes(ONGIL_FAMILY_V2.subject);

/* ───────── static SEO roots: the same generator the build runs, closed and open ───────── */
function makeRoot(env) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'livon-rc-'));
  for (const f of ['sitemap.xml', 'robots.txt', 'livon/index.html', 'livon/seo.css', 'assets/livon-mark.jpg', 'ko/index.html', '404.html']) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  }
  const e = Object.assign({}, process.env); delete e.LIVON_SEO_INDEX; Object.assign(e, env);
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/livon-seo-build.mjs'), '--out', dir], { cwd: ROOT, encoding: 'utf8', env: e });
  assert.equal(r.status, 0, r.stderr);
  return { dir, log: r.stdout };
}
function makeRootLog(env) { const r = makeRoot(env); fs.rmSync(r.dir, { recursive: true, force: true }); return r.log; }
const OPEN = makeRoot({ LIVON_SEO_INDEX: 'on' });
const CLOSED = makeRoot({ LIVON_SEO_INDEX: 'off' });
const DEFAULT = makeRoot({});
test.after(() => { for (const r of [OPEN, CLOSED, DEFAULT]) fs.rmSync(r.dir, { recursive: true, force: true }); });
const read = (r, p) => fs.readFileSync(path.join(r.dir, ...p.split('/').filter(Boolean), ...(p.endsWith('/') ? ['index.html'] : [])), 'utf8');
const locs = r => [...read(r, 'sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const robotsMeta = h => (h.match(/<meta name="robots" content="([^"]+)"/) || [])[1] || '';
const SITE = 'https://www.newon.app';

/* ───────── data (loaded the way the quality scripts load it) ───────── */
const DQ = JSON.parse(spawnSync(process.execPath, [path.join(ROOT, 'scripts/livon-data-quality.mjs')], { cwd: ROOT, encoding: 'utf8' }).stdout);
function helpData() {
  const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(src('livon/help-data.js'), ctx);
  return ctx.LivonHelpData;
}
const HELP = helpData();

/* ───────── RC-1 … RC-5: ancestry, source, secrets, build, publish ───────── */
test('RC-1 ancestry: every V1 phase commit is an ancestor of the RC; the RC starts at Performance V1', { skip: noGit }, () => {
  const included = hash => git('merge-base', '--is-ancestor', hash, 'HEAD').status === 0;
  const history = git('log', '--format=%s', 'HEAD').stdout.split('\n');
  /* a path-level integration branch (livon-production-v1) carries the product as a tree, not as ancestors */
  const integrated = history.includes(PRODUCTION_INTEGRATION.subjects[0]);
  if (!integrated) for (const [name, hash, subject] of PHASES) {
    assert.ok(hasCommit(hash), name + ' commit ' + hash + ' is in this repository');
    assert.equal(included(hash), true, name + ' ' + hash + ' is included');
    assert.ok(git('log', '-1', '--format=%s', hash).stdout.startsWith(subject), name + ' subject');
  }
  if (integrated) {
    /*
     * Path-level integration (main): the V1 phases arrived as the content of the completion commit, not as ancestors, so the
     * proof is by content and uses only main's own history:
     *   1. the integration commit is in HEAD's history and its message records the completion commit it came from;
     *   2. its LIVON tree has exactly the pinned completion fingerprint (sourceDigest) — blob ids are content hashes;
     *   3. HEAD's LIVON tree differs from the integration commit only in files of later, named commits in this history
     *      (production routing alignment, AI LIVE V1);
     *   4. where the completion commit itself is available (a full clone fetches origin/livon-v1-completion), it is checked
     *      directly as well: same fingerprint, and every V1 phase is its ancestor with the expected subject.
     */
    const I = PRODUCTION_INTEGRATION;
    assert.equal(included(PHASES[0][1]), true, PHASES[0][0] + ' is an ancestor (it is on main)');
    for (const subj of I.subjects) assert.ok(history.includes(subj), 'integration commit: ' + subj);
    const integ = commitBySubject(I.subjects[0]);
    assert.ok(integ, 'the integration commit is in the history');
    assert.match(git('log', '-1', '--format=%B', integ).stdout, new RegExp('livon-v1-completion ' + I.source), 'the integration commit records its source');
    assert.equal(treeDigest(integ, I.paths, I.mainKept), I.sourceDigest, 'the integration commit carries exactly the LIVON V1 completion content');
    if (hasCommit(I.source)) {
      assert.equal(treeDigest(I.source, I.paths, I.mainKept), I.sourceDigest, 'the completion commit has the pinned fingerprint');
      for (const [name, hash, subject] of PHASES) {
        assert.ok(hasCommit(hash), name + ' commit ' + hash + ' is in this repository');
        assert.equal(git('merge-base', '--is-ancestor', hash, I.source).status, 0, name + ' ' + hash + ' is included in ' + I.source);
        assert.ok(git('log', '-1', '--format=%s', hash).stdout.startsWith(subject), name + ' subject');
      }
    }
    const d = git('diff', '--name-only', integ, 'HEAD', '--', ...I.paths);
    assert.equal(d.status, 0);
    const aiLive = aiLiveIn() ? AI_LIVE.files : [];
    const cv2 = communityV2Commit();
    const community = cv2 ? COMMUNITY_V2.files : [];
    if (cv2) {
      const touched = git('diff-tree', '--no-commit-id', '--name-only', '-r', cv2 + '^', cv2).stdout.split('\n').filter(Boolean);
      assert.deepEqual(COMMUNITY_V2.files.filter(f => !touched.includes(f)), [], 'every accepted Community V2 file was changed by that commit');
    }
    assert.deepEqual(d.stdout.split('\n').filter(Boolean).filter(f => !I.aligned.includes(f) && !aiLive.includes(f) && !community.includes(f)), [], 'LIVON tree = integration commit except the alignment / AI LIVE / Community V2 files');
    /* main's production routing/CORS fix is part of this line */
    assert.ok(history.includes(ROUTING_CORS_FIX.subject), 'main routing/CORS fix is an ancestor');
    assert.ok(history.includes(BACKEND_HARDENING.subject), 'backend hardening is an ancestor');
  } else {
    /* nothing but the RC's own commits sits between Performance V1 and HEAD */
    const between = git('log', '--format=%s', RC_BASE + '..HEAD').stdout.trim().split('\n').filter(Boolean);
    for (const s of between) assert.ok(/^LIVON (Final Integration|Release Candidate|V1 Completion)/.test(s) || s === BACKEND_HARDENING.subject, 'unexpected commit on the RC: ' + s);
  }
  /* The release is checked by content, not by where a local branch pointer happens to be (a local `main` moves with every
     pull). What main contributed to production must be in this tree unchanged: the routing/CORS fix files are byte-identical
     to main's fix commit, and vercel.json still has no trailing-slash rule. */
  if (integrated) {
    assert.ok(hasCommit(ROUTING_CORS_FIX.commit), 'main routing/CORS fix commit ' + ROUTING_CORS_FIX.commit + ' is in this repository');
    assert.equal(included(ROUTING_CORS_FIX.commit), true, 'main routing/CORS fix is an ancestor');
    const kept = ROUTING_CORS_FIX.files.filter(f => f !== 'vercel.json').concat('docs/newon/API_ROUTING_CORS_FIX_V1.md');
    const d = git('diff', '--name-only', ROUTING_CORS_FIX.commit, 'HEAD', '--', ...kept);
    assert.equal(d.status, 0); assert.deepEqual(d.stdout.split('\n').filter(Boolean), [], 'main routing/CORS files unchanged');
    const was = JSON.parse(git('show', ROUTING_CORS_FIX.commit + ':vercel.json').stdout), now = JSON.parse(src('vercel.json'));
    assert.equal('trailingSlash' in now, false, 'no trailing-slash rule');
    for (const k of Object.keys(was)) if (k !== 'functions') assert.deepEqual(now[k], was[k], 'vercel.json ' + k + ' unchanged from main');
    for (const f of Object.keys(was.functions)) assert.equal(now.functions[f].maxDuration, was.functions[f].maxDuration, f + ' keeps its limit');
  }
  /* the frozen V1 release branch the RC must not move (a release tag in branch form, never advanced by a pull) */
  const rel = git('rev-parse', '--short=9', 'livon-v1-release');
  if (rel.status === 0) assert.equal(rel.stdout.trim(), '7fd6e02bf', 'livon-v1-release is untouched');
});

const TRACKED = isGit ? git('ls-files').stdout.split('\n').filter(Boolean) : [];
const LIVON_SCOPE = f => /^(livon\/|tests\/livon\/|docs\/livon\/|scripts\/livon|scripts\/render-livon|server\/livon\/|api\/livon|assets\/livon)/.test(f);

test('RC-2 source integrity: no env file, key, debug dump, screenshot, report or temp bundle in the LIVON tree', { skip: noGit }, () => {
  const bad = TRACKED.filter(f => /(^|\/)\.env(\.|$)/.test(f) && f !== '.env.example')
    .concat(TRACKED.filter(f => /\.(pem|key|p12|pfx|keystore|jks)$/i.test(f)))
    .concat(TRACKED.filter(LIVON_SCOPE).filter(f => /(\.bak|\.orig|\.rej|\.log|~|\.tmp|\.swp|\.DS_Store|\.zip|\.tgz|\.har)$|(^|\/)(\.tmp-livon-qa|playwright-report|test-results|screenshots?|debug|_publish|node_modules)(\/|$)/i.test(f)));
  assert.deepEqual(bad, []);
  /* no QA scratch directory left in the working tree */
  for (const d of ['.tmp-livon-qa', 'playwright-report', 'test-results']) assert.ok(!has(d) || !TRACKED.some(f => f.startsWith(d + '/')), d);
  /* LIVON test fixtures are fixtures, not captured user data */
  for (const f of TRACKED.filter(f => f.startsWith('tests/livon/fixtures/'))) assert.match(f, /\.(mjs|json|js)$/, f);
});

const SECRET = /sk-(proj-)?[A-Za-z0-9_-]{24,}|-----BEGIN [A-Z ]*PRIVATE KEY-----[A-Za-z0-9+/=\s]{40,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|xox[bpas]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|"private_key"\s*:\s*"-----|Bearer [A-Za-z0-9._~+/-]{32,}|AIza[0-9A-Za-z_-]{35}/;
/* public, client-visible Firebase web configs of other Newon products (not LIVON, not secrets) */
const PUBLIC_WEB_CONFIG = new Set(['admin/firebase-config.js', 'apps/ox-month/firebase-config.js']);
function scanSecrets(files, base) {
  const hits = [];
  for (const f of files) {
    const p = path.join(base, f);
    let s; try { const st = fs.statSync(p); if (!st.isFile() || st.size > 4e6) continue; s = fs.readFileSync(p, 'utf8'); } catch (e) { continue; }
    if (s.indexOf('\u0000') >= 0) continue;
    const m = s.match(SECRET);
    if (m && !PUBLIC_WEB_CONFIG.has(f.replace(/\\/g, '/'))) hits.push(f + ': ' + m[0].slice(0, 12) + '…');
  }
  return hits;
}
function walk(dir, base = dir, out = []) {
  for (const n of fs.readdirSync(dir)) { const p = path.join(dir, n); const st = fs.statSync(p); if (st.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p)); }
  return out;
}

test('RC-3 secret scan: no real key, token or private key in the source or in the generated pages', () => {
  const files = isGit ? TRACKED.filter(f => /\.(m?js|json|html|md|txt|toml|ya?ml|py|sh|css)$|^\.env\.example$/.test(f)) : walk(path.join(ROOT, 'livon')).map(f => 'livon/' + f);
  assert.deepEqual(scanSecrets(files, ROOT), []);
  for (const r of [OPEN, CLOSED]) assert.deepEqual(scanSecrets(walk(r.dir), r.dir), []);
  /* .env.example carries names only */
  for (const line of src('.env.example').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (!m) continue;
    if (/KEY|TOKEN|SECRET|PASSWORD|DATABASE_URL/.test(m[1])) assert.equal(m[2].trim(), '', m[1] + ' must be empty in .env.example');
  }
  /* test placeholders are clearly fake */
  assert.match(src('tests/livon/ai-activation.test.mjs'), /sk-test-placeholder/);
});

test('RC-4 build: publish-site runs the LIVON steps in order and stops on any failure', () => {
  assert.equal(spawnSync(process.execPath, ['--check', path.join(ROOT, 'scripts/publish-site.mjs')]).status, 0);
  const order = ['render-livon-life-routes.mjs', 'render-livon-today-routes.mjs', 'livon-seo-build.mjs', 'livon-seo-quality.mjs', 'livon-accessibility-quality.mjs', 'livon-performance-quality.mjs'].map(s => PUBLISH.indexOf(s));
  for (const i of order) assert.ok(i > 0);
  assert.deepEqual(order.slice().sort((a, b) => a - b), order, 'LIVON build steps run in order');
  assert.ok((PUBLISH.match(/\.status === 0 \|\| process\.exit\(1\)/g) || []).length >= 4, 'each LIVON step is fatal on failure');
});

test('RC-5 publish exclusions: Admin/Data Manager removed and verified; source-only folders never copied', () => {
  assert.match(PUBLISH, /fs\.rmSync\(path\.join\(OUT, "livon", "admin"\), \{ recursive: true, force: true \}\)/);
  assert.match(PUBLISH, /livon\/admin must not be published/);
  /* a built _publish, when one is present next to the source, is checked as shipped */
  const P = path.join(ROOT, '_publish');
  if (fs.existsSync(path.join(P, 'livon', 'index.html'))) {
    for (const d of ['livon/admin', 'docs', 'tests', 'server', 'api', 'scripts', '_restore_tmp', '.env', 'node_modules', '.tmp-livon-qa']) assert.ok(!fs.existsSync(path.join(P, d)), '_publish/' + d);
    assert.ok(!walk(path.join(P, 'livon')).some(f => /\.(py|mjs|md|test\.js)$/.test(f)), 'no source-only file under _publish/livon');
  }
});

/* ───────── RC-14 … RC-18, RC-23: data and content inventory ───────── */
test('RC-14 curated inventory: 530 records, no duplicate, broken relation, invalid URL, expired, sample or draft', () => {
  const c = DQ.counts;
  assert.equal(c.total, 530); assert.equal(c.visible, 530);
  for (const k of ['sample', 'expired', 'unsourced', 'draft', 'duplicates']) assert.equal(c[k], 0, k);
  assert.deepEqual(DQ.invalidUrls, []); assert.deepEqual(DQ.dangling, []);
  for (const k of ['missingId', 'duplicateId', 'duplicateSourceId', 'invalidUrl', 'missingSource', 'invalidDate', 'endBeforeStart', 'expired', 'stale', 'invalidEntityType', 'missingTitle', 'rejected']) assert.equal(DQ.checks[k], 0, k);
  assert.deepEqual(DQ.checks.orphanRelations, []);
  assert.equal(DQ.blocking, 0);
});

test('RC-15 Life Stage: 7 stages, 10대 … 70대+', () => {
  assert.equal(DQ.counts.byType.lifeStage, 7);
  assert.equal(HELP.facts.lifeStages, 7);
  for (const s of ['10s', '20s', '30s', '40s', '50s', '60s', '70s']) assert.ok(fs.existsSync(path.join(OPEN.dir, 'livon', 'life', s, 'index.html')), s);
  assert.match(read(OPEN, '/livon/life/70s/'), /70대/);
});

test('RC-16 topics: 228 topics, every one reachable on its screen; 34 Life Events', () => {
  assert.equal(DQ.screens.topics, '228/228'); assert.equal(HELP.facts.topics, 228);
  assert.equal(DQ.screens.lifeEvents, '34/34'); assert.equal(HELP.facts.lifeEvents, 34);
  assert.equal(DQ.counts.byType.lifeEvent, 34);
});

test('RC-18 Today: 34 items, every one placed; Explore 28/28; no empty category', () => {
  assert.equal(DQ.screens.today, '34/34'); assert.equal(DQ.screens.explore, '28/28');
  for (const [k, v] of Object.entries(DQ.emptyCategories)) assert.deepEqual(v, [], k);
});

test('RC-23 Help: 68 articles in 10 categories; 39 static Help pages; facts match the product', () => {
  assert.equal(HELP.articles.length, 68); assert.equal(HELP.categories.length, 10); assert.equal(HELP.seoIndexable.length, 39);
  const ids = HELP.articles.map(a => a.id); assert.equal(new Set(ids).size, ids.length);
  for (const id of HELP.seoIndexable) assert.ok(ids.includes(id), id);
  assert.equal(HELP.facts.help, 'READY');
});

/* ───────── RC-24, RC-42 … RC-46: truthfulness and release modes ───────── */
const SERVICE = src('livon/community-service.js');
test('RC-24 Help vs runtime: what Help says is off is off in the code that ships', () => {
  const F = HELP.facts;
  /* AI: no API origin is configured in the committed build → same-origin /api, which a static host does not serve */
  assert.equal(F.ai, 'NOT_CONNECTED'); assert.match(src('livon/livon-api-config.js'), /var configured = "";/);
  /* account: the committed Newon+ config is empty → anonymous */
  assert.equal(F.account, 'NOT_CONNECTED'); assert.match(src('newon-auth/newon-auth-config.js'), /root\.NEWON_PLUS_AUTH_CONFIG = null;/);
  /* follow / reports: the local adapter */
  assert.equal(F.follow, 'ACCOUNT_REQUIRED'); assert.match(SERVICE, /follows: function \(\) \{ return \{ available: false, status: "ACCOUNT_REQUIRED", list: \[\] \}; \}/);
  assert.equal(F.reports, 'LOCAL_ONLY'); assert.match(SERVICE, /submitReport: function \(\) \{ return \{ status: "local-only" \}; \}/);
  assert.equal(F.communityPosts, 'LOCAL'); assert.equal(F.personalization, 'LOCAL_RULE_BASED'); assert.equal(F.liveData, 'NOT_CONNECTED');
  assert.equal(F.support, 'NOT_CONNECTED');
  const st = Object.fromEntries(HELP.status.map(s => [s.id, s.state]));
  assert.deepEqual(st, { core: 'available', personalization: 'local', storage: 'local', community: 'local', follow: 'off', reports: 'local', ai: 'off', 'live-data': 'off', account: 'off', support: 'off' });
  /* My Life: Help says there is no bulk delete / export button — and none is rendered (the handlers are unreachable) */
  assert.match(JSON.stringify(HELP.articles), /한꺼번에 지우는 버튼은 없어요/);
  for (const f of fs.readdirSync(path.join(ROOT, 'livon')).filter(n => /\.(js|html)$/.test(n))) {
    const s = src('livon/' + f).replace(/closest\("\[data-lv-ml-(export|clear)\]"\)/g, '');
    assert.doesNotMatch(s, /data-lv-ml-(export|clear)/, f + ' renders a My Life export/clear-all control');
  }
});

test('RC-42 production configuration inventory: every LIVON setting is named in the release manifest with its class', () => {
  const keys = [...src('.env.example').matchAll(/^([A-Z0-9_]+)=/gm)].map(m => m[1]);
  for (const k of ['LIVON_API_ORIGIN', 'OPENAI_API_KEY', 'UPSTASH_REDIS_REST_TOKEN', 'NEWON_PLUS_FIREBASE_API_KEY', 'LIVON_USERDATA_ENABLED']) assert.ok(keys.includes(k), k);
  assert.match(src('scripts/livon-seo-build.mjs'), /String\(process\.env\.LIVON_SEO_INDEX \|\| "on"\)\.trim\(\)\.toLowerCase\(\)/, 'unset LIVON_SEO_INDEX means ON');
  for (const k of ['LIVON_API_ORIGIN', 'LIVON_SEO_INDEX', 'OPENAI_API_KEY', 'UPSTASH_REDIS_REST_URL', 'LIVON_RATE_LIMIT_SECRET', 'NEWON_PLUS_FIREBASE_API_KEY', 'NEWON_AUTH_VERIFY_ENABLED', 'LIVON_USERDATA_ENABLED', 'LIVON_DATABASE_URL', 'YOUTHCENTER_API_KEY', 'KAKAO_REST_API_KEY', 'TOURAPI_SERVICE_KEY', 'PUBLIC_DATA_SERVICE_KEY', 'WORK24_TRAINING_API_KEY', 'BIZINFO_API_KEY'])
    assert.ok(MANIFEST_DOC.includes('`' + k + '`'), 'manifest lists ' + k);
  for (const c of ['REQUIRED NOW', 'OPTIONAL', 'DEFERRED', 'MUST REMAIN OFF']) assert.ok(MANIFEST_DOC.includes(c), c);
});

test('RC-43 AI unavailable mode: no fake answer path — failures render an error bubble with retry, the UI stays usable', () => {
  const ai = src('livon/ai-page.js');
  assert.match(ai, /lv-ai-bubble--error/); assert.match(ai, /data-lv-ai-retry/);
  assert.doesNotMatch(ai, /mockReply|fakeReply|demoAnswer|sampleAnswer/i);
});

test('RC-44 provider unavailable mode: curated data is the default; live providers are off unless their server keys exist', () => {
  assert.equal(DQ.counts.bySourceType.official + DQ.counts.bySourceType.editorial + DQ.counts.bySourceType.internal, 530);
  assert.equal(HELP.facts.liveData, 'NOT_CONNECTED');
  /* keys are read on the server only */
  for (const f of fs.readdirSync(path.join(ROOT, 'livon')).filter(n => n.endsWith('.js'))) assert.doesNotMatch(src('livon/' + f), /process\.env|_API_KEY|SERVICE_KEY/, f);
});

test('RC-45 account deferred mode: no sign-in wall, no Firebase SDK on the LIVON page, Newon+ config empty', () => {
  assert.doesNotMatch(INDEX, /firebase-app|firebasejs|gstatic\.com\/firebasejs|identitytoolkit/);
  assert.match(src('newon-auth/newon-auth-config.js'), /NEWON_PLUS_AUTH_CONFIG = null/);
  assert.doesNotMatch(INDEX, /로그인(이|해야) 필요|로그인 후 이용/);
});

test('RC-46 Community local mode: copy says local; following needs an account; reports are not sent', () => {
  const cm = src('livon/community-page.js');
  assert.match(cm, /신고는 이 기기에만 기록되며 운영자나 서버로 전송되지 않습니다/);
  assert.match(cm, /팔로잉이 왜 비어 있나요\?/);
  assert.match(HELP.status.find(s => s.id === 'community').text, /다른 사람과 공유되지 않아요/);
});

test('RC-22 Community truthfulness: no invented follower, view, reaction-total, user or live-activity numbers in the code', () => {
  const files = ['community-page.js', 'community-data.js', 'community-service.js'].map(f => src('livon/' + f)).join('\n');
  assert.doesNotMatch(files, /(followers|followerCount|viewCount|views)\s*:\s*\d/);
  assert.doesNotMatch(files, /팔로워 \d|조회 ?\d|\d+명이 (보고|읽|참여)|실시간 (접속|참여)/);
  assert.doesNotMatch(files, /likeCount\s*:\s*\d{2,}/);
});

test('RC-47 Admin excluded: the public page never loads Admin code', () => {
  assert.doesNotMatch(INDEX, /\/livon\/admin\//);
  for (const f of fs.readdirSync(path.join(ROOT, 'livon')).filter(n => n.endsWith('.js'))) assert.doesNotMatch(src('livon/' + f), /["'`]\/livon\/admin\/[a-z-]+\.js/, f);
});

test('RC-48 Data Manager excluded: not published, not linked from public pages, not in the sitemap', () => {
  for (const r of [OPEN, CLOSED]) {
    assert.ok(!locs(r).some(u => /\/livon\/admin/.test(u)));
    assert.ok(!walk(r.dir).some(f => f.startsWith(path.join('livon', 'admin'))));
  }
  assert.doesNotMatch(read(OPEN, '/livon/help/'), /\/livon\/admin/);
});

/* ───────── RC-30 … RC-35, RC-52, RC-53: SEO index switch ───────── */
test('RC-30 SEO index OFF build: LIVON closed — every LIVON page noindex, no LIVON URL in the sitemap', () => {
  const q = checkSite(CLOSED.dir);
  assert.equal(q.errors.length, 0, q.errors.join('\n'));
  assert.match(CLOSED.log, /indexing OFF/);
  assert.equal(robotsMeta(read(CLOSED, '/livon/')), 'noindex, nofollow');
  const pages = q.manifest.pages;
  assert.equal(pages.length, 125);
  for (const p of pages) assert.match(robotsMeta(read(CLOSED, p.path)), /^noindex/, p.path);
  assert.equal(locs(CLOSED).filter(u => u.startsWith(SITE + '/livon/')).length, 0);
  assert.equal(q.manifest.indexing, false);
});

test('RC-31 SEO index ON build: exactly 126 selected URLs indexable (125 static + /livon/)', () => {
  const q = checkSite(OPEN.dir);
  assert.equal(q.errors.length, 0, q.errors.join('\n'));
  assert.match(OPEN.log, /indexing ON/);
  assert.equal(robotsMeta(read(OPEN, '/livon/')), 'index, follow');
  const L = locs(OPEN).filter(u => u.startsWith(SITE + '/livon/'));
  assert.equal(L.length, 126); assert.equal(new Set(L).size, 126);
  for (const p of q.manifest.pages) assert.equal(robotsMeta(read(OPEN, p.path)), 'index, follow', p.path);
});

test('RC-30b index switch reaches production: the Pages workflow forwards LIVON_SEO_INDEX; "false", "0", "no", " OFF " also close', () => {
  const wf = src('.github/workflows/github-pages.yml');
  assert.match(wf, /^ {10}LIVON_SEO_INDEX: \$\{\{ vars\.LIVON_SEO_INDEX \}\}$/m, 'the main → gh-pages build can be closed with a repository variable');
  assert.ok(wf.indexOf('LIVON_SEO_INDEX') > wf.indexOf('run: node scripts/publish-site.mjs') && wf.indexOf('LIVON_SEO_INDEX') < wf.indexOf('Publish to gh-pages'), 'set on the build step');
  for (const v of ['false', '0', 'no', ' OFF ', 'Off']) assert.match(makeRootLog({ LIVON_SEO_INDEX: v }), /indexing OFF/, JSON.stringify(v));
  for (const v of ['on', 'true', '1', '']) assert.match(makeRootLog({ LIVON_SEO_INDEX: v }), /indexing ON/, JSON.stringify(v));
});

test('RC-31b default SEO index state: LIVON_SEO_INDEX unset builds the OPEN site (decision recorded in the manifest)', () => {
  assert.match(DEFAULT.log, /indexing ON/);
  assert.equal(read(DEFAULT, 'sitemap.xml'), read(OPEN, 'sitemap.xml'));
  assert.equal(read(DEFAULT, '/livon/'), read(OPEN, '/livon/'));
  assert.match(MANIFEST_DOC, /DEFAULT INDEX STATE[^\n]*ON/);
});

test('RC-32 sitemap: manifest, sitemap and page robots agree in both builds; non-LIVON URLs unchanged by the switch', () => {
  for (const r of [OPEN, CLOSED]) {
    const q = checkSite(r.dir), L = new Set(locs(r));
    for (const p of q.manifest.pages) assert.equal(L.has(SITE + p.path), /^index/.test(robotsMeta(read(r, p.path))), p.path);
  }
  const other = r => locs(r).filter(u => !u.startsWith(SITE + '/livon/'));
  assert.deepEqual(other(OPEN), other(CLOSED));
});

test('RC-33 robots: robots.txt allows /livon/ in both builds so that page-level noindex is seen; Admin disallowed', () => {
  for (const r of [OPEN, CLOSED]) {
    const t = read(r, 'robots.txt');
    assert.doesNotMatch(t, /^Disallow: \/livon\/?$/m);
    assert.match(t, /^Disallow: \/admin\/$/m);
    assert.match(t, /^Sitemap: https:\/\/www\.newon\.app\/sitemap\.xml$/m);
  }
});

test('RC-34 SEO exclusions: My Life, Onboarding, Community posts, Admin, Data Manager and search results never indexable', () => {
  const NEVER = ['my-life', 'life-now', 'onboarding', 'community', 'admin', 'data', 'search', 'results', 'preferences', 'today', 'explore', 'ai'];
  for (const r of [OPEN, CLOSED]) for (const u of locs(r).filter(u => u.startsWith(SITE + '/livon/'))) {
    const segs = u.replace(SITE, '').split('/').filter(Boolean).slice(1);
    for (const s of segs) assert.ok(!NEVER.includes(s), u);
    assert.doesNotMatch(u, /[?#]/, u);
  }
  const m = JSON.parse(read(OPEN, 'livon/seo-manifest.json'));
  for (const a of ['my-life', 'onboarding', 'personalization', 'community-local', 'search-results', 'admin', 'data-manager']) assert.ok(JSON.stringify(m).includes(a), 'manifest records the exclusion ' + a);
});

test('RC-35 static SEO: 125 pages — unique titles/descriptions, self canonical on www.newon.app, OG, JSON-LD, no orphan or broken link', () => {
  const q = checkSite(OPEN.dir), s = q.stats;
  assert.equal(s.pages, 125); assert.equal(s.uniqueTitles, 125); assert.equal(s.uniqueDescriptions, 125);
  assert.equal(s.orphans, 0); assert.equal(s.brokenInternal, 0); assert.equal(s.thin, 0);
  const slugs = q.manifest.pages.map(p => p.path); assert.equal(new Set(slugs).size, slugs.length);
  for (const p of q.manifest.pages) {
    const h = read(OPEN, p.path);
    assert.ok(h.includes('<link rel="canonical" href="' + SITE + p.path + '"'), 'canonical ' + p.path);
    assert.match(h, /<meta property="og:title"/); assert.match(h, /<script type="application\/ld\+json">/);
    for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
    assert.doesNotMatch(h, /https?:\/\/(localhost|127\.0\.0\.1|[a-z0-9-]+\.vercel\.app|[a-z0-9-]+\.github\.io)/, 'no preview host in ' + p.path);
  }
  /* JS-off: the static page carries its content and runs no app script */
  const t = read(OPEN, '/livon/life/20s/first-job/');
  assert.ok(t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').length > 800); assert.doesNotMatch(t, /<script src=/);
});

test('RC-52 build closed: OFF differs from ON only in LIVON robots, the SEO manifest and the sitemap', () => {
  const a = walk(OPEN.dir).sort(), b = walk(CLOSED.dir).sort();
  assert.deepEqual(a, b, 'same files');
  const diff = a.filter(f => fs.readFileSync(path.join(OPEN.dir, f), 'utf8') !== fs.readFileSync(path.join(CLOSED.dir, f), 'utf8'));
  for (const f of diff) assert.ok(f === 'sitemap.xml' || f === path.join('livon', 'seo-manifest.json') || f.startsWith('livon' + path.sep), f);
  for (const f of diff.filter(f => f.endsWith('.html'))) {
    const x = fs.readFileSync(path.join(OPEN.dir, f), 'utf8'), y = fs.readFileSync(path.join(CLOSED.dir, f), 'utf8');
    const norm = h => h.replace(/<meta name="robots" content="[^"]+"/, '<meta name="robots"');
    assert.equal(norm(x), norm(y), 'only the robots meta differs in ' + f);
  }
});

test('RC-53 build open: OPEN is what an unset LIVON_SEO_INDEX produces; quality checks pass', () => {
  assert.deepEqual(walk(DEFAULT.dir).sort(), walk(OPEN.dir).sort());
  assert.equal(checkSite(DEFAULT.dir).errors.length, 0);
});

/* ───────── RC-36, RC-37 (privacy), RC-28/29 (structure) ───────── */
test('RC-36 XSS (static): user text is escaped before markup; no javascript: URL accepted; storage JSON parsed defensively', () => {
  const cm = src('livon/community-page.js');
  assert.match(cm, /function esc\(/);
  const raw = cm.split('\n').filter(l => /innerHTML\s*[+]?=/.test(l) && /\b(p|post|c|comment|x|item)\.(title|body|authorNick)\b/.test(l) && !/esc\b/.test(l));
  assert.deepEqual(raw, [], 'post/comment text reaches innerHTML only through esc()');
  for (const f of ['life-now-page.js', 'community-page.js', 'help-page.js', 'ai-page.js']) assert.doesNotMatch(src('livon/' + f), /eval\(|new Function\(/, f);
  assert.match(src('livon/life-now-page.js'), /function safeHref/);
});

test('RC-37 privacy (static): no required name/phone/email/address field; Help search and Community stay in the browser', () => {
  assert.doesNotMatch(INDEX, /<input[^>]+type="(email|tel)"[^>]*required/);
  assert.doesNotMatch(INDEX, /name="(phone|email|address|realname)"[^>]*required/);
  for (const f of ['help-page.js', 'community-page.js', 'community-service.js', 'livon-personalization.js', 'livon-onboarding.js']) assert.doesNotMatch(src('livon/' + f), /fetch\(|XMLHttpRequest|sendBeacon|navigator\.sendBeacon/, f);
});

test('RC-28 performance structure kept: lazy films, boot, card limit, optimized logo, 42 photos, 6 font variants, quality gate', () => {
  const media = src('livon/livon-media.js');
  assert.match(media, /var FAIL_LIMIT = 2;/); assert.match(media, /data-src/);
  assert.match(src('livon/livon-boot.js'), /root\.LivonBoot = \{/);
  assert.ok(has('assets/livon-mark-icon-120.jpg') && fs.statSync(path.join(ROOT, 'assets/livon-mark-icon-120.jpg')).size < 20000);
  assert.equal(fs.readdirSync(path.join(ROOT, 'livon/assets/topics')).filter(n => n.endsWith('.jpg')).length, 42);
  const q = PERF.checkSources(ROOT);
  assert.deepEqual(q.errors, []); assert.equal(q.stats.webFontFamilies, 6); assert.equal(q.stats.images, 42); assert.equal(q.stats.backgroundVideos, 8);
  assert.match(PUBLISH, /"livon-performance-quality\.mjs"\), "--root", OUT\]/, 'the build runs the performance gate on its output');
});

test('RC-29 hero video (code): muted, inline, autoplay, loop, lazy data-src, one pause control, reduced motion respected', () => {
  const vids = [...INDEX.matchAll(/<video\b[^>]*>/g)].map(m => m[0]);
  assert.ok(vids.length >= 8);
  for (const v of vids) { assert.match(v, /\bmuted\b/, v); assert.match(v, /\bplaysinline\b/, v); assert.match(v, /\bautoplay\b/, v); assert.match(v, /\bloop\b/, v); assert.match(v, /(src|data-src)="https:\/\/[^"]+\.mp4"/, v); }
  assert.ok(vids.filter(v => /data-src=/.test(v)).length >= 7, 'films other than Home are lazy');
  const a11y = src('livon/livon-a11y.js');
  assert.match(a11y, /prefers-reduced-motion/); assert.match(INDEX + a11y, /배경 영상 일시 정지/);
});

test('RC-26 accessibility (static): the build gate still reports 0 errors on the RC pages', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/livon-accessibility-quality.mjs'), '--root', OPEN.dir], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /livon-accessibility-quality: 0 error\(s\), 0 warning\(s\)/);
});

test('RC-41 visual regression by construction: the RC ships the Performance V1 product files unchanged (or only listed RC fixes)', { skip: noGit || (!hasCommit(RC_BASE) && 'base commit missing') }, () => {
  const changed = git('diff', '--name-only', RC_BASE, 'HEAD').stdout.split('\n').filter(Boolean);
  const product = changed.filter(f => !/^(docs\/|tests\/)/.test(f));
  const allowed = new Set([...RC_FIXES, ...BACKEND_HARDENING.files, ...ROUTING_CORS_FIX.files, ...COMPLETION_FIXES, ...(aiLiveIn() ? AI_LIVE.files : []), ...(familyV2In() ? ONGIL_FAMILY_V2.files : [])]);
  /* ONGIL is its own product in its own directory: accepted only where its production integration is part of the history,
     and then only inside that directory — a LIVON, shared or any other file still needs an entry above */
  const ongilIntegrated = git('log', '--format=%s', 'HEAD').stdout.split('\n').includes(ONGIL_PRODUCT.subject);
  const ongil = product.filter(f => f.startsWith(ONGIL_PRODUCT.dir));
  if (!ongilIntegrated) assert.deepEqual(ongil, [], 'ONGIL files changed on a line without the ONGIL production integration');
  assert.deepEqual(product.filter(f => !allowed.has(f) && !f.startsWith(ONGIL_PRODUCT.dir)), [], 'product files changed without an RC fix entry');
  for (const f of ['livon/', 'server/', 'api/', 'scripts/', 'vercel.json', 'site-chrome.js', 'styles.css']) assert.equal(f.startsWith(ONGIL_PRODUCT.dir), false);
});

test('RC-49 release manifest: commit, ancestry, phases, counts, limitations, manual checks, env matrix, gates', () => {
  for (const h of ['Release candidate', 'Ancestry', 'Included phases', 'Feature status', 'Deferred', 'Data counts', 'Routes', 'SEO', 'Help', 'Tests', 'Known limitations', 'Manual checks', 'Production environment matrix', 'Deployment gates', 'RC fixes', 'V1.1 backlog'])
    assert.match(MANIFEST_DOC, new RegExp('^## .*' + h, 'mi'), 'section ' + h);
  for (const [, hash] of PHASES) assert.ok(MANIFEST_DOC.includes(hash), hash);
  for (const n of ['530', '228', '68', '125', '126']) assert.ok(MANIFEST_DOC.includes(n), n);
  assert.doesNotMatch(MANIFEST_DOC, /Safari[^\n]*\bPASS\b|iPhone[^\n]*\bPASS\b/, 'no unrun device test is reported as PASS');
});

test('RC-50 release checklist: every required gate is a checkbox; post-deploy checks listed', () => {
  for (const item of ['Chrome hero video', 'Safari macOS hero video', 'Safari iPhone hero video', '390 mobile smoke', 'Desktop smoke', 'SEO INDEX decision', 'AI release decision', 'Public API decision', 'NEWON+ remains deferred', 'Production build', 'GitHub backup branches', 'Merge approval', 'Deploy approval', 'Post-deploy smoke', 'sitemap', 'Search Console'])
    assert.match(CHECKLIST_DOC, new RegExp('^- \\[ \\] .*' + item.replace(/[+]/g, '\\+'), 'mi'), item);
  assert.match(CHECKLIST_DOC, /^## .*Post-deploy/mi);
  for (const k of ['/livon/', 'robots', 'canonical', 'console', 'network', '404']) assert.ok(CHECKLIST_DOC.includes(k), k);
});

test('RC-51 public regression: the seven main screens, Help and Onboarding are still in the LIVON page', () => {
  for (const id of ['livon-home', 'life', 'today', 'life-now', 'explore', 'community', 'livon-ai', 'help']) assert.match(INDEX, new RegExp('<section[^>]+id="' + id + '"'), id);
  assert.match(INDEX, /id="livon-onboard-entry"/);
  assert.match(INDEX, /<a class="skip-link" href="#livon-home">/);
});

/* ───────── browser (skipped when no local Chromium) ───────── */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const canBrowse = fs.existsSync(PW) && fs.existsSync(CHROME);
const skip = !canBrowse && 'no local Chromium';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain' };
let B = null, SERVER = null, BASE = '';
async function boot() {
  if (B) return;
  const { chromium } = await import(PW);
  SERVER = await new Promise(resolve => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      for (const root of [OPEN.dir, ROOT]) {
        let f = path.join(root, p);
        if (!f.startsWith(root)) continue;
        if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
        if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(fs.readFileSync(f)); return; }
      }
      res.writeHead(404); res.end('not found');
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  BASE = 'http://127.0.0.1:' + SERVER.address().port;
  B = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
}
test.after(async () => { if (B) await B.close(); if (SERVER) SERVER.close(); });
const SKIPPED = JSON.stringify({ version: 1, state: 'SKIPPED', step: '', draft: null, updatedAt: 1 });
/* external hosts are never contacted in tests: films, fonts and CDN script are answered locally or refused */
async function open(url = '/livon/', { width = 1280, height = 800, fresh = false, init = null, offlineFilms = true, record = null, reducedMotion = 'reduce' } = {}) {
  await boot();
  const ctx = await B.newContext({ viewport: { width, height }, reducedMotion });
  await ctx.route('**/*', r => {
    const u = r.request().url();
    if (record) record.push(r.request().method() + ' ' + u);
    if (u.startsWith(BASE)) return r.continue();
    return r.abort();
  });
  if (!fresh) await ctx.addInitScript(v => { try { if (!localStorage.getItem('livon.personalization.v1')) localStorage.setItem('livon.personalization.v1', v); } catch (e) {} }, SKIPPED);
  if (init) await ctx.addInitScript(init.fn, init.arg);
  const pg = await ctx.newPage();
  pg._errors = []; pg.on('pageerror', e => pg._errors.push(e.message));
  await pg.goto(BASE + url, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(700);
  return pg;
}
const go = async (pg, hash, wait = 600) => { await pg.evaluate(h => { location.hash = h; }, hash); await pg.waitForTimeout(wait); };
const shown = pg => pg.evaluate(() => { const v = document.documentElement.getAttribute('data-lv-view'); const s = v && document.querySelector('main > [data-lv-screen="' + v + '"]'); return { view: v, text: s ? s.innerText.replace(/\s+/g, ' ').trim().length : 0, title: document.title }; });

const ROUTES = [['#livon-home', 'home'], ['#life', 'life'], ['#life/30s', 'life'], ['#life/20s/first-job', 'life'], ['#life-events', 'life'], ['#today', 'today'], ['#today/td-indep-missed', 'today'], ['#life-now', 'life-now'], ['#ml-saved', 'life-now'], ['#ml-todos', 'life-now'], ['#ml-settings', 'life-now'], ['#explore', 'explore'], ['#ex-results?q=취업', 'explore'], ['#ex-item-ex-qnet', 'explore'], ['#community', 'community'], ['#livon-ai', 'livon-ai'], ['#ai-chat', 'livon-ai'], ['#help', 'help'], ['#help/a/no-signup', 'help'], ['#help/c/troubleshooting', 'help'], ['#help/status', 'help']];

test('RC-6 public route matrix: every main view, detail and Help route renders with content and no script error', { skip }, async () => {
  const pg = await open('/livon/');
  for (const [h, view] of ROUTES) {
    await go(pg, h, 650);
    const s = await shown(pg);
    assert.equal(s.view, view, h); assert.ok(s.text > 200, h + ' has content (' + s.text + ')'); assert.match(s.title, /LIVON|LivOn/, h);
  }
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-7 deep links: direct entry and reload on Help, Help article, Community, Life Stage, topic and static pages; unknown ids never crash', { skip }, async () => {
  const pg = await open('/livon/');
  for (const h of ['#help/a/community-report', '#help/c/community', '#life/70s', '#life/20s/first-job', '#community', '#today/td-moving-checklist', '#help/a/does-not-exist', '#help/c/nope', '#cm-post-nope', '#life/99s', '#life/20s/no-such-topic', '#today/no-such-item', '#ex-item-no-such', '#ml-nope', '#totally-unknown']) {
    await pg.goto(BASE + '/livon/' + h, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(600);
    await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(500);
    const s = await shown(pg);
    assert.ok(s.view && s.text > 100, h + ' shows a screen after reload');
  }
  for (const p of ['/livon/life/', '/livon/life/30s/', '/livon/life/20s/first-job/', '/livon/life-events/', '/livon/life-events/startup/', '/livon/help/', '/livon/help/community-report/']) {
    const r = await pg.goto(BASE + p); assert.equal(r.status(), 200, p);
    assert.ok((await pg.locator('main').innerText()).length > 200, p);
  }
  const r404 = await pg.goto(BASE + '/livon/life/20s/no-such-topic/'); assert.equal(r404.status(), 404);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-8 navigation: main nav, back and forward between the seven views (desktop and 390px)', { skip }, async () => {
  for (const width of [1280, 390]) {
    const pg = await open('/livon/', { width, height: 844 });
    const seq = ['#life', '#today', '#life-now', '#explore', '#community', '#livon-ai', '#livon-home'];
    for (const h of seq) await go(pg, h, 450);
    const back = ['#livon-ai', '#community', '#explore', '#life-now', '#today', '#life'];
    for (const h of back) { await pg.goBack(); await pg.waitForTimeout(450); assert.equal(await pg.evaluate(() => location.hash), h, 'back → ' + h); assert.ok((await shown(pg)).text > 100); }
    await pg.goForward(); await pg.waitForTimeout(450); assert.equal(await pg.evaluate(() => location.hash), '#today');
    /* nav links exist and route */
    const links = await pg.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].filter(a => a.offsetParent && /^#(life|today|life-now|explore|community|livon-ai)$/.test(a.getAttribute('href'))).length);
    if (width >= 1024) assert.ok(links >= 6, width + 'px: visible nav links ' + links);
    else assert.ok(await pg.evaluate(() => [...document.querySelectorAll('button[aria-controls],button[aria-expanded]')].some(b => b.offsetParent)), width + 'px: a menu button is visible');
    assert.deepEqual(pg._errors, []);
    await pg.context().close();
  }
});

const FORBIDDEN_HOST = /firebase|googleapis\.com\/(identitytoolkit|securetoken)|identitytoolkit|securetoken|gstatic\.com\/firebasejs|accounts\.google|openai\.com|upstash|data\.go\.kr|apis\.data\.go\.kr|dapi\.kakao|youthcenter|bizinfo|work24|hrd\.go\.kr|visitkorea/i;
test('RC-9 anonymous mode: a first visit uses every main view with no sign-in, no forced dialog and no auth/AI/provider request', { skip }, async () => {
  const rec = [];
  const pg = await open('/livon/', { fresh: true, record: rec });
  assert.equal(await pg.evaluate(() => [...document.querySelectorAll('[role=dialog],[aria-modal=true],dialog[open]')].filter(d => d.offsetParent !== null).length), 0, 'no dialog on arrival');
  for (const h of ['#life', '#today', '#explore', '#life-now', '#community', '#help', '#livon-ai', '#livon-home']) {
    await go(pg, h, 600);
    assert.ok((await shown(pg)).text > 100, h);
    assert.equal(await pg.evaluate(() => [...document.querySelectorAll('[role=dialog],[aria-modal=true]')].filter(d => d.offsetParent !== null && /로그인|sign ?in/i.test(d.innerText)).length), 0, 'no login dialog on ' + h);
  }
  assert.deepEqual(rec.filter(u => !u.includes(BASE) && FORBIDDEN_HOST.test(u)), [], 'no request to an auth, AI or provider host');
  /* the Newon+ adapter file is served from this origin but imports no SDK without a config */
  assert.equal(rec.filter(u => /firebasejs|firebase-app|firebase-auth\.js/.test(u)).length, 0);
  assert.equal(await pg.evaluate(() => typeof window.firebase), 'undefined');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-38 network: start-up talks only to its own origin plus films/fonts/GSAP; one status probe each; no retry loop', { skip }, async () => {
  const rec = [];
  const pg = await open('/livon/', { record: rec });
  await pg.waitForTimeout(6000);
  const ext = [...new Set(rec.filter(u => !u.includes(BASE)).map(u => new URL(u.split(' ')[1]).host))].sort();
  for (const h of ext) assert.match(h, /^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net|d8j0ntlcm91z4\.cloudfront\.net|db\.onlinewebfonts\.com)$/, 'unexpected host ' + h);
  const api = rec.filter(u => /\/api\//.test(u));
  assert.ok(api.length <= 2, 'status probes: ' + api.join(', '));
  for (const p of ['/api/health', '/api/livon/data?action=status']) assert.ok(api.filter(u => u.includes(p)).length <= 1, p + ' asked once');
  const n = rec.length; await pg.waitForTimeout(5000);
  assert.ok(rec.length - n <= 2, 'idle requests: ' + (rec.length - n));
  await pg.context().close();
});

test('RC-10 storage: saves, to-dos, goals, records, onboarding profile and Community data survive a reload', { skip }, async () => {
  const pg = await open('/livon/');
  await go(pg, '#community', 800); await go(pg, '#life-now', 800);
  const ids = await pg.evaluate(() => {
    const P = window.LivonPlatform, ML = window.LivonMyLife._test, R = window.LivonCommunityRepo, PZ = window.LivonPersonalization;
    P.saveItem({ id: 'ex:ex-qnet', title: 'Q-Net', type: 'explore', href: '#ex-item-ex-qnet' });
    const todo = ML.saveTodo({ title: 'RC 할 일 확인' }); const goal = ML.saveGoal({ title: 'RC 목표' });
    const ev = ML.saveEvent({ title: 'RC 일정', date: '2026-10-20', allDay: true });
    PZ.complete({ lifeStage: '30', interests: ['육아'], lifeEvents: ['parenting'] });
    const post = R.create({ type: 'question', title: 'RC 질문 글', body: '로컬 저장 확인용 본문입니다.', tags: '확인' }).post;
    R.saveComposeDraft({ type: 'story', title: 'RC 임시 저장', body: '작성 중' });
    R.toggleReaction(post.id);
    const c = R.addComment(post.id, 'RC 댓글');
    R.report('post:' + post.id, 'spam');
    return { post: post.id, todo: todo.status, goal: goal.status, ev: ev.status, comment: c.status };
  });
  assert.equal(ids.todo, 'ok'); assert.equal(ids.goal, 'ok'); assert.equal(ids.ev, 'ok'); assert.equal(ids.comment, 'ok');
  await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(700);
  await go(pg, '#community', 800); await go(pg, '#life-now', 800);
  const after = await pg.evaluate(id => {
    const P = window.LivonPlatform, ML = window.LivonMyLife._test, R = window.LivonCommunityRepo, PZ = window.LivonPersonalization;
    const s = ML.loadStore();
    return { saved: P.hasSave('ex:ex-qnet'), todo: s.todos.some(t => t.title === 'RC 할 일 확인'), goal: s.goals.some(g => g.title === 'RC 목표'), ev: s.events.some(e => e.title === 'RC 일정'),
      profile: PZ.getProfile(), state: PZ.state(), post: !!R.get(id), draft: (R.composeDraft() || {}).title, comments: R.comments(id).length, reported: R.reported('post:' + id), saveRemoved: (P.removeSave('ex:ex-qnet'), !P.hasSave('ex:ex-qnet')) };
  }, ids.post);
  assert.deepEqual({ ...after, profile: undefined }, { saved: true, todo: true, goal: true, ev: true, profile: undefined, state: 'COMPLETED', post: true, draft: 'RC 임시 저장', comments: 1, reported: true, saveRemoved: true });
  assert.equal(after.profile.lifeStage, '30');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

const BLOCK = () => { for (const k of ['localStorage', 'sessionStorage']) { try { Object.defineProperty(window, k, { configurable: true, get() { const e = new Error('The operation is insecure.'); e.name = 'SecurityError'; throw e; } }); } catch (e) {} } };
test('RC-11 storage blocked: no crash; saving, writing and onboarding work for this tab (memory fallback)', { skip }, async () => {
  const pg = await open('/livon/', { fresh: true, init: { fn: BLOCK } });
  assert.deepEqual(await pg.evaluate(() => [...(window.LIVON_STORAGE_FALLBACK || [])]), ['localStorage', 'sessionStorage']);
  for (const h of ['#life', '#today', '#explore', '#life-now', '#community', '#help', '#livon-home']) { await go(pg, h, 500); assert.ok((await shown(pg)).text > 100, h); }
  const r = await pg.evaluate(() => { const R = window.LivonCommunityRepo; const p = R.create({ type: 'story', title: '저장 차단 글', body: '이 탭에서만 유지됩니다.' }); window.LivonPlatform.saveItem({ id: 'ex:ex-qnet', title: 'Q-Net' }); return { st: p.status, back: !!R.get(p.post.id), saved: window.LivonPlatform.hasSave('ex:ex-qnet') }; });
  assert.deepEqual(r, { st: 'ok', back: true, saved: true });
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

const MALFORMED = () => {
  const junk = ['{', 'null', '[]', '"x"', '{"posts":"nope","comments":7}', '{"version":99,"state":{"a":1}}', '[1,2,{"__proto__":{"polluted":true}}]', 'NaN'];
  const keys = ['livon.mlStore.v1', 'livon.cmStore.v1', 'livon.platform.v1', 'livon.personalization.v1', 'livon.lifeStage', 'livon.lifeInterests', 'livon.lifeEvents', 'livon.aiStore.v1', 'livon.tdSaved', 'livon.exSaved', 'livon.mlInterests', 'livon.data.v1', 'livon.today.recent.v1', 'livon.lifeHub.checklist.v1', 'livon.lifeEventProgress.v1', 'livon.lifeGoals', 'livon.tdPrefs', 'livon.vault.anon.v1'];
  if (sessionStorage.getItem('rc-seeded')) return;
  sessionStorage.setItem('rc-seeded', '1');
  keys.forEach((k, i) => localStorage.setItem(k, junk[i % junk.length]));
};
test('RC-12 malformed storage: damaged or old JSON in every LIVON key is repaired or ignored; every view renders', { skip }, async () => {
  const pg = await open('/livon/', { fresh: true, init: { fn: MALFORMED } });
  for (const h of ['#life', '#today', '#explore', '#life-now', '#ml-todos', '#ml-settings', '#community', '#help', '#livon-ai', '#livon-home']) { await go(pg, h, 500); assert.ok((await shown(pg)).text > 100, h); }
  assert.equal(await pg.evaluate(() => ({}).polluted), undefined, 'no prototype pollution');
  const ok = await pg.evaluate(() => window.LivonCommunityRepo.create({ type: 'story', title: '복구 후 글', body: '정상 저장' }).status);
  assert.equal(ok, 'ok');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-13 data isolation: onboarding reset, Community actions, personalization reset and Community delete keep unrelated data', { skip }, async () => {
  const pg = await open('/livon/');
  await go(pg, '#community', 700); await go(pg, '#life-now', 700);
  const r = await pg.evaluate(() => {
    const P = window.LivonPlatform, ML = window.LivonMyLife._test, R = window.LivonCommunityRepo, PZ = window.LivonPersonalization;
    const out = {};
    PZ.complete({ lifeStage: '40', interests: ['주거'], lifeEvents: [] });
    P.saveItem({ id: 'ex:ex-qnet', title: 'Q-Net' }); ML.saveTodo({ title: '격리 확인 할 일' }); ML.saveGoal({ title: '격리 확인 목표' });
    const post = R.create({ type: 'story', title: '격리 확인 글', body: '본문' }).post; const other = R.create({ type: 'tip', title: '남을 글', body: '본문' }).post;
    /* onboarding reset → Community kept */
    PZ.reset(); out.a = !!R.get(post.id) && !!R.get(other.id);
    /* Community actions → personalization kept */
    PZ.complete({ lifeStage: '40', interests: ['주거'], lifeEvents: [] });
    R.toggleReaction(post.id); R.addComment(post.id, '댓글'); R.report('post:' + post.id, 'spam');
    out.b = PZ.getProfile().lifeStage === '40';
    /* personalization reset → saves / to-dos / goals kept */
    PZ.reset(); const s = ML.loadStore();
    out.c = P.hasSave('ex:ex-qnet') && s.todos.some(t => t.title === '격리 확인 할 일') && s.goals.some(g => g.title === '격리 확인 목표');
    /* Community delete → unrelated local data kept */
    R.remove(post.id); const s2 = ML.loadStore();
    out.d = !R.get(post.id) && !!R.get(other.id) && P.hasSave('ex:ex-qnet') && s2.todos.some(t => t.title === '격리 확인 할 일');
    return out;
  });
  assert.deepEqual(r, { a: true, b: true, c: true, d: true });
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-17 childcare regression: 70대 + 돌봄 never gets ex-childcare; 30대 + 육아 does', { skip }, async () => {
  const pg = await open('/livon/');
  const r = await pg.evaluate(() => {
    const PZ = window.LivonPersonalization;
    const rec = p => PZ.recommend(p, { limit: 2000 }).items.map(x => x.id);
    return { old: [['돌봄'], ['돌봄', '가족'], ['돌봄', '육아']].map(i => rec({ lifeStage: '70', interests: i, lifeEvents: ['later-life'] }).includes('ex:ex-childcare')), young: rec({ lifeStage: '30', interests: ['육아'], lifeEvents: ['parenting'] }).includes('ex:ex-childcare') };
  });
  assert.deepEqual(r, { old: [false, false, false], young: true });
  await pg.context().close();
});

test('RC-19 Explore: search, filters, detail and save; source labels shown; no invented expert profile', { skip }, async () => {
  const pg = await open('/livon/#explore');
  await pg.fill('#lv-ex-q', '자격증'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(800);
  const t = await pg.evaluate(() => document.querySelector('#explore').innerText);
  assert.match(t, /자격/); assert.match(t, /(공식|출처|기관)/);
  await go(pg, '#ex-item-ex-qnet', 800);
  assert.match(await pg.evaluate(() => document.querySelector('#explore').innerText), /Q-Net|큐넷|자격/);
  await go(pg, '#ex-experts', 800);
  const ex = await pg.evaluate(() => document.querySelector('#explore').innerText);
  assert.doesNotMatch(ex, /(박사|변호사|세무사|전문가)\s?[가-힣]{2,3}\s?(님|씨)\b|★\s?\d\.\d|리뷰 \d+개|상담 \d+건/);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-20 My Life: saved, to-dos, goals, records and settings panels render; export/clear-all stay unreachable (POST-V1)', { skip }, async () => {
  const pg = await open('/livon/#life-now');
  for (const h of ['#ml-saved', '#ml-todos', '#ml-settings', '#ml-home']) { await go(pg, h, 600); assert.ok((await shown(pg)).text > 100, h); }
  assert.equal(await pg.evaluate(() => document.querySelectorAll('[data-lv-ml-export],[data-lv-ml-clear]').length), 0);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-21 Community: For You / Latest / Following; Following explains the account requirement; compose validation', { skip }, async () => {
  const pg = await open('/livon/#community');
  const tabs = await pg.evaluate(() => [...document.querySelectorAll('[data-lv-cm-tab]')].map(b => b.innerText.trim()));
  for (const t of ['For You', '최신', '팔로잉']) assert.ok(tabs.some(x => x.includes(t)), 'tab ' + t + ' in ' + tabs.join('|'));
  await pg.locator('[data-lv-cm-tab="following"]').first().click(); await pg.waitForTimeout(500);
  assert.match(await pg.evaluate(() => document.querySelector('#community').innerText), /계정|팔로잉이 왜 비어/);
  const v = await pg.evaluate(() => { const R = window.LivonCommunityRepo; return [R.create({ type: 'story', title: '', body: 'x' }).status, R.create({ type: 'story', title: '   ', body: '   ' }).status, R.create({ type: 'story', title: 'a'.repeat(500), body: 'b' }).status]; });
  assert.deepEqual(v, ['invalid', 'invalid', 'invalid']);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-22b Community truthfulness (rendered): no follower/view counts, no claim of real users or moderators', { skip }, async () => {
  const pg = await open('/livon/#community');
  for (const h of ['#community', '#cm-communities', '#cm-mine']) {
    await go(pg, h, 600);
    const t = await pg.evaluate(() => document.querySelector('#community').innerText);
    assert.doesNotMatch(t, /팔로워 \d|조회 ?수? ?\d|\d+명이 (보|읽|참여)|접속 중|실시간 참여|운영자가 (검토|확인)했/, h);
  }
  await pg.context().close();
});

test('RC-25 Onboarding: never forced; open, skip, resume; Skip does not nag after reload', { skip }, async () => {
  const pg = await open('/livon/', { fresh: true });
  const visible = () => pg.evaluate(() => { const m = document.getElementById('livon-onboard-modal'); return !!m && !m.hidden && getComputedStyle(m).display !== 'none'; });
  assert.equal(await visible(), false, 'not opened on arrival');
  await pg.evaluate(() => window.LivonPersonalization.skip());
  for (let i = 0; i < 2; i++) { await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(900); assert.equal(await visible(), false, 'no nag after skip'); }
  assert.equal(await pg.evaluate(() => window.LivonPersonalization.state()), 'SKIPPED');
  await pg.evaluate(() => window.LivonPlatform.openOnboarding()); await pg.waitForTimeout(600);
  assert.equal(await visible(), true, 'opens on request');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(400);
  assert.equal(await visible(), false, 'Escape closes');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-23b Help in the browser: search finds articles for account, follow, reports, AI, storage and personalization', { skip }, async () => {
  const pg = await open('/livon/#help');
  for (const [q, re] of [['계정', /계정/], ['팔로우', /팔로/], ['신고', /신고/], ['AI', /AI/], ['저장', /저장/], ['맞춤', /맞춤/]]) {
    await go(pg, 'help/search?q=' + encodeURIComponent(q), 600);
    const t = await pg.evaluate(() => document.querySelector('#help').innerText);
    assert.match(t, re, q); assert.doesNotMatch(t, /검색 결과가 없/, q);
  }
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-24b Help/runtime in the browser: AI with no backend shows an honest error, never an answer; one request per send', { skip }, async () => {
  const rec = [];
  const pg = await open('/livon/#ai-chat', { record: rec });
  await pg.locator('[data-lv-ai-chat-q]').fill('서울 주말 데이트 추천');
  await pg.locator('[data-lv-ai-send]').click(); await pg.waitForTimeout(1500);
  const b = await pg.evaluate(() => [...document.querySelectorAll('.lv-ai-bubble')].map(x => x.className));
  assert.equal(b.filter(c => /--ai\b/.test(c)).length, 0, 'no AI answer');
  assert.equal(b.filter(c => /--error/.test(c)).length, 1);
  assert.equal(rec.filter(u => /\/api\/livon\/chat/.test(u)).length, 1);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-27 390px + 200% text: no page overflow and no clipped text on the main views', { skip }, async () => {
  const CLIP = () => { const out = []; document.querySelectorAll('main *').forEach(e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('[aria-hidden=true]') || e.closest('[hidden]') || /visually-hidden|lh-sr|wordmark|skip-link/.test(e.className)) return; if (![...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())) return; if ((cs.overflowX === 'hidden' || cs.overflow === 'hidden') && e.scrollWidth > e.clientWidth + 2 && cs.textOverflow !== 'ellipsis' && !/-webkit-box/.test(cs.display)) out.push(e.tagName + '.' + String(e.className).split(' ')[0]); }); return { overflow: document.documentElement.scrollWidth - innerWidth, clipped: out.slice(0, 8) }; };
  const pg = await open('/livon/', { width: 390, height: 844 });
  for (const h of ['#livon-home', '#life', '#life/20s/first-job', '#today', '#life-now', '#ml-settings', '#explore', '#community', '#ai-chat', '#help', '#help/a/no-signup']) {
    await pg.goto(BASE + '/livon/' + h, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(650);
    await pg.addStyleTag({ content: 'html{font-size:200% !important}' }); await pg.waitForTimeout(250);
    const r = await pg.evaluate(CLIP);
    assert.ok(r.overflow <= 1, h + ' overflow ' + r.overflow); assert.deepEqual(r.clipped, [], h);
  }
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-28b film requests: one film per opened screen, an unreachable host is tried a bounded number of times, no growth when idle', { skip }, async () => {
  const rec = [];
  const pg = await open('/livon/', { record: rec, reducedMotion: 'no-preference' });
  const films = () => rec.filter(u => /\.mp4/.test(u));
  await pg.waitForTimeout(2500);
  const home = new Set(films().map(u => u.split('/').pop())).size;
  assert.equal(home, 1, 'Home entry asks for one film');
  assert.ok(films().length <= 4, 'bounded attempts: ' + films().length);   /* 2–3 typical in the lab; one more under CPU contention */
  for (const h of ['#life', '#today', '#explore', '#community', '#livon-ai', '#life-now']) {
    const n = new Set(films().map(u => u.split('/').pop())).size;
    await go(pg, h, 1500);
    assert.ok(new Set(films().map(u => u.split('/').pop())).size - n <= 1, h + ' adds at most one film');
  }
  const total = films().length; await pg.waitForTimeout(8000);
  assert.equal(films().length, total, 'no retry while idle');
  assert.ok(total <= 3 * 7, 'total film requests ' + total);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-29b video controls in the browser: one pause control; reduced motion starts paused', { skip }, async () => {
  const pg = await open('/livon/', { reducedMotion: 'reduce' });
  const st = await pg.evaluate(() => { const vs = [...document.querySelectorAll('video')]; return { n: vs.length, muted: vs.every(v => v.muted), inline: vs.every(v => v.playsInline), ctl: document.querySelectorAll('[data-lv-video-toggle], .lv-video-toggle, [aria-label*="배경 영상"]').length + [...document.querySelectorAll('button')].filter(b => /배경 영상/.test(b.innerText + (b.getAttribute('aria-label') || ''))).length }; });
  assert.ok(st.n >= 8 && st.muted && st.inline); assert.ok(st.ctl >= 1, 'pause control present');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-36b XSS in the browser: markup and script URLs in a post, comment and tag render as text', { skip }, async () => {
  const pg = await open('/livon/#community');
  const id = await pg.evaluate(() => { const R = window.LivonCommunityRepo; const p = R.create({ type: 'story', title: '<img src=x onerror="window.__xss=1">제목', body: '<script>window.__xss=2</script>[링크](javascript:window.__xss=3) <a href="javascript:window.__xss=4">x</a>', tags: '태그' }).post; window.__tagRes = R.create({ type: 'story', title: '태그 확인', body: '본문', tags: '<b>태그</b>' }).status; R.addComment(p.id, '<img src=y onerror="window.__xss=5">'); return p.id; });
  await go(pg, 'cm-post-' + id, 900);
  await pg.evaluate(() => { document.querySelectorAll('#community a').forEach(a => { if (/^javascript:/i.test(a.getAttribute('href') || '')) window.__jslink = (window.__jslink || 0) + 1; }); });
  assert.equal(await pg.evaluate(() => window.__xss), undefined);
  assert.equal(await pg.evaluate(() => window.__jslink), undefined, 'no javascript: link rendered');
  assert.match(await pg.evaluate(() => document.querySelector('#community').innerText), /<img src=x/);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('RC-37b privacy in the browser: Help search and Community writing send nothing anywhere', { skip }, async () => {
  const rec = [];
  const pg = await open('/livon/#help', { record: rec });
  await go(pg, 'help/search?q=' + encodeURIComponent('비밀번호 전화번호'), 500);
  await pg.evaluate(() => window.LivonCommunityRepo.create({ type: 'story', title: '개인정보 없는 글', body: '본문' }));
  const n = rec.length; await pg.waitForTimeout(1200);
  const sent = rec.slice(0).filter(u => /^(POST|PUT|PATCH) /.test(u) || /%EB%B9%84%EB%B0%80%EB%B2%88%ED%98%B8|비밀번호/.test(u));
  assert.deepEqual(sent, []); assert.ok(rec.length - n <= 2);
  await pg.context().close();
});

test('RC-39 offline after load: Home, Life Stage, My Life, local Community and Help keep working', { skip }, async () => {
  const pg = await open('/livon/');
  for (const h of ['#life', '#life-now', '#community', '#help']) await go(pg, h, 500);   /* first visit loads each screen */
  await pg.context().setOffline(true);
  for (const h of ['#livon-home', '#life', '#life/30s', '#life-now', '#ml-todos', '#community', '#help', '#help/a/local-data-storage']) { await go(pg, h, 500); assert.ok((await shown(pg)).text > 100, h); }
  const r = await pg.evaluate(() => [window.LivonMyLife._test.saveTodo({ title: '오프라인 할 일' }).status, window.LivonCommunityRepo.create({ type: 'story', title: '오프라인 글', body: '본문' }).status]);
  assert.deepEqual(r, ['ok', 'ok']);
  assert.deepEqual(pg._errors, []);
  await pg.context().setOffline(false);
  await pg.context().close();
});

test('RC-40 responsive matrix: 320 / 390 / 768 / 1024 / 1440 × seven views — no page overflow, no script error', { skip }, async () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const pg = await open('/livon/', { width, height: 820 });
    for (const h of ['#livon-home', '#life', '#today', '#life-now', '#explore', '#community', '#livon-ai', '#help']) {
      await go(pg, h, 450);
      assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), width + 'px ' + h);
    }
    assert.deepEqual(pg._errors, [], width + 'px');
    await pg.context().close();
  }
});

test('RC-44b provider/API unavailable in the browser: status probe 404 → curated Today and Explore still fill their screens', { skip }, async () => {
  const pg = await open('/livon/#today');
  assert.ok((await shown(pg)).text > 2000, 'Today has curated content');
  await go(pg, '#explore', 700);
  assert.ok((await shown(pg)).text > 2000, 'Explore has curated content');
  assert.doesNotMatch(await pg.evaluate(() => document.body.innerText), /undefined|NaN|\[object Object\]|INTERNAL_ERROR|stack trace/);
  await pg.context().close();
});
