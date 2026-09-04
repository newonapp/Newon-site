# Newon Repository & CI Maintenance

Operational guide for keeping Newon **boring and predictable**.  
Companion to backup/recovery, monitoring, and incident docs.

---

## 1. Repo structure (classification)

| Area | Class | Notes |
|------|-------|-------|
| `ko/` `en/` … locale HTML trees | GENERATED (+ some hand edits) | Prefer regenerate via `build-i18n` / render scripts |
| `templates/` | SOURCE | App landing / page templates |
| `locales/` | SOURCE | Product/app copy JSON |
| `scripts/` | SOURCE | Generators, QA, monitoring, publish |
| `admin/` | SOURCE (HQ) | Public shell + Auth; data in Firestore |
| `*.css` `*.js` (site root) | SOURCE | Browser runtime — do not add CI tooling here |
| `sitemap.xml` `robots.txt` `search-index.json` | GENERATED | Produced/updated by build pipeline |
| `_publish/` | TEMP / DEPLOY ARTIFACT | Assembled by `publish-site.mjs`; gitignored |
| `reports/` | REPORT | Audits OK to track; `*-latest` monitor + Lighthouse dirs ignored |
| `docs/operations/` | PRIVATE-OPS docs | Not published to Pages |
| `.github/workflows/` | CI | Deploy + monitor only |
| `backup/` `backups/` `*hq-backup*` | PRIVATE-OPS | Must never be committed or published |
| `_restore_tmp/` `.chrome-*` | TEMP | Local scratch; do not publish |

---

## 2. Sources of Truth (edit these)

| Concern | SoT | Do not hand-edit as primary |
|---------|-----|-----------------------------|
| Business pricing | `scripts/business-pricing.mjs` | Locale HTML price strings |
| Studio pricing | `scripts/studio-pricing.mjs` | Generated studio HTML |
| Business service catalog | `scripts/business-service-catalog.mjs` (+ related renderers) | One-off HTML |
| SEO meta helpers | `scripts/seo-meta.mjs` | Scattered title tags without regen |
| Portfolio apps | `scripts/portfolio-data.mjs` + locales | Portfolio HTML alone |
| Product locales | `locales/*.json` | Translated HTML without locale update |
| Admin pricing snapshot | `scripts/generate-admin-data.mjs` ← business pricing | `admin/data.json` by hand |
| Sitemap / robots | generated in `build-i18n` / publish verify | Random sitemap edits without regen |
| Delete-account apps | `scripts/delete-account-data.mjs` | Per-locale pages only |
| Store URLs | `locales/en.json` (app sections) + health inventory | Invented URLs |

**Before changing X, edit Y:**

- Business price → `business-pricing.mjs` → re-render business pages → `npm run check:fast` / pricing QA → commit
- SEO description/title helpers → `seo-meta.mjs` + relevant renderer → regenerate → SEO QA
- Product store link → `locales/*.json` → rebuild pages that embed links → health probe optional
- HQ UI behavior → `admin/*.js` (never put secrets in repo)
- Accessibility / perf in chrome → `site-chrome.js`, `search.js`, templates — **not only** one generated HTML file

---

## 3. Generated files

| Output | Generator | Commit? | Deploy? |
|--------|-----------|---------|---------|
| `ko/**` … locale HTML | `build-i18n.mjs` + renderers | Yes (site works from git + Actions) | Via `_publish` |
| `admin/data.json` | `generate-admin-data.mjs` | Yes (public snapshot) | Yes |
| `sitemap.xml` | build pipeline | Yes | Yes |
| `_publish/**` | `publish-site.mjs` | **No** (gitignored) | **Yes** (gh-pages) |
| `reports/monitoring-latest.*` | monitor script | **No** (ignored; CI artifact) | No |
| Lighthouse JSON trees | local/CI | Prefer ignored | No |

**Do not edit generated HTML as the only fix** if a generator will overwrite it on the next publish.

---

## 4. Local commands (real scripts only)

```bash
# Install (optional — deploy/monitor need no npm deps)
npm install

# Assemble Pages artifact (build + portfolio + verify)
node scripts/publish-site.mjs

# Fast gate (placeholders, pricing drift, optional publish hygiene)
npm run check:fast
npm run check:fast:publish   # after publish-site

# QA / health / monitor
node scripts/qa-business-pricing.mjs
npm run health:apps
npm run monitor:production
npm run monitor:production:smoke

# Preview
npm run preview
```

Deploy to production: push `main` (or Actions → Deploy workflow_dispatch).  
Do **not** use force-push to `main` / `gh-pages` except documented recovery.

---

## 5. CI workflows

### Deploy static site to GitHub Pages (`github-pages.yml`)

| Field | Value |
|-------|-------|
| Trigger | `push` to `main`, `workflow_dispatch` |
| Permissions | `contents: write` (gh-pages publish) |
| Node | 20 |
| Build | `node scripts/publish-site.mjs` (includes fast-check) |
| Deploy | `peaceiris/actions-gh-pages` → branch `gh-pages` from `_publish/` |
| Concurrency | group `pages`, **cancel-in-progress: false** |
| Post | 404 HUMAN verify; smoke monitor **report-only** |
| Does not publish | `reports/`, `docs/`, `scripts/`, `.github/` |

### Production monitor (`production-monitor.yml`)

| Field | Value |
|-------|-------|
| Trigger | schedule 6h + `workflow_dispatch` |
| Permissions | `contents: read` |
| Concurrency | `production-monitor` (separate from pages) |
| Side effects | none (read-only GET/HEAD) |

---

## 6. Deploy flow

```
main push
  → checkout
  → publish-site (build-i18n → gen-portfolio → assemble _publish → verify → fast-check)
  → publish _publish → gh-pages
  → verify 404 HUMAN
  → smoke monitor (report-only; does not rollback)
```

**FAIL blocks deploy:** generator/syntax failure, missing artifact files, pricing drift, unresolved `{{TOKENS}}` on critical pages, publish verify.

**Does not hard-block deploy:** store probes, Lighthouse, full `qa-business-pages` locale gaps, external FormSubmit delivery.

---

## 7. Fast vs deep checks

| Check | Local | Pre-deploy | Post-deploy | Scheduled | Manual |
|-------|-------|------------|-------------|-----------|--------|
| Syntax / publish verify | ✓ | ✓ | | | |
| Fast-check / pricing drift | ✓ | ✓ | | | |
| 404 HUMAN artifact | ✓ | ✓ | ✓ verify | | |
| Production smoke | ✓ | | ✓ report-only | | |
| Full monitoring | ✓ | | | ✓ 6h | ✓ |
| Production Health apps | ✓ | | | | ✓ deep |
| Security / perf / a11y audits | | | | | ✓ deep |
| FormSubmit / Firebase Console | | | | | ✓ manual |
| `qa-business-pages` full | ✓ deep | **not** gate | | | ✓ |

---

## 8. Rollback / Last Known Good

See `docs/operations/backup-recovery.md` + `incident-checklist.md`.

Track: GitHub Actions run ID, commit SHA on `main`, deployment time. Prefer `git revert` + redeploy. No auto-rollback from smoke FAIL.

---

## 9. Monitoring

`docs/operations/monitoring.md` — scheduled + post-deploy smoke. Separate concurrency from deploy.

---

## 10. Backup safety

HQ export JSON: never in git, `reports/`, or `_publish/`. Patterns in `.gitignore`.

---

## 11. Dependency updates

| Type | Policy |
|------|--------|
| Patch | QA + commit |
| Minor | Read changelog + QA |
| Major | Separate task |
| Security | Fix if reachable / high severity; **no** `npm audit fix --force` |
| Goal | Not “always latest” |

Runtime site has **no** production npm dependencies. Only `devDependency` translate tooling.

---

## 12. Maintenance routine

**Every change:** `git status` → relevant QA / `check:fast` → commit → push → watch Actions → smoke artifact  

**Weekly:** monitor Actions, failed deploys, HQ backup if data changed  

**Monthly:** `npm audit`, store link spot-check, backup readiness  

**Quarterly:** security / performance / accessibility / recovery runbook review  

---

## 13. FAIL vs WARN

- **FAIL:** build/generator broken, critical consistency, missing publish files  
- **WARN:** external store flake, optional locale gaps, perf variance, manual follow-up  

Do not train the team to ignore red deploys by over-blocking on flaky externals.
