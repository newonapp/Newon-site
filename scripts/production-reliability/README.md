# Production reliability audit

Read-only / static checks for public website operational reliability.

```bash
npm run health:reliability
npm run health:reliability:probe   # also HTTP-probes www.newon.app
```

Output: `reports/production-reliability.json`

Does not change routes, pricing, SEO, HQ, or Auth. Use findings to apply only clear P0/P1 fixes.
