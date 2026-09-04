# CI fast checks

`fast-check.mjs` — no network, no Lighthouse, no store probes.

```bash
npm run check:fast
node scripts/publish-site.mjs   # runs fast-check on _publish at the end
npm run check:fast:publish
```

FAIL conditions are documented in `docs/operations/repo-ci-maintenance.md`.
