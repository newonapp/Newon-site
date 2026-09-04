# Newon Performance / Core Web Vitals Audit

**Phase 7** — measure first, safe fixes only.  
Metrics are **LAB / ESTIMATED** (Lighthouse 13, simulated mobile/desktop throttling against production). **Not CrUX field data.**

`reports/` is **not** published to GitHub Pages.

---

## 1. Systems / inventory (production-loaded)

| Layer | Notes |
|-------|--------|
| HTML | Static generated locales (`build-i18n` / hub renderers) |
| CSS | `styles.css`, `gnav-mega`, hub/page CSS, `site-dark`, `site-mobile` |
| JS | `theme-shell` (head), `lang-nav` (head), deferred chrome/analytics/search |
| Fonts | Google Fonts Noto stack (`display=swap`) |
| Images | Root logos, wordmarks, `i18n-img`, `myworld-img`, card assets |
| Third-party | fonts.googleapis / gstatic; analytics dataLayer (no public GA4 ID in repo) |
| Cache | Query `?v=` tokens; GitHub Pages `Cache-Control: max-age=600` (**EXTERNAL**) |
| Compression | gzip/brotli via GitHub CDN (**EXTERNAL / MANUAL**) |

---

## 2. Routes audited (lab)

Mobile: `/`, `/ko/`, `/en/`, `/ko/products/`, `/ko/business/`, `/ko/studio/`, `/ko/portfolio/`, `/ko/store/`, `/ko/tools/`, `/ko/contact/`, `/ko/business/inquiry/`, `/404.html`  
Desktop sample: `/ko/`, `/ko/business/`, `/ko/portfolio/`, `/ko/business/inquiry/`  
Product paths `/ko/ox-month/`, `/ko/myworld/` returned **404** in lab (products live on hubs / home hashes) — use `/ko/products/` + app hubs instead.

---

## 3. Baseline (before fixes) — LAB

| Route | Score | LCP ms | CLS | TBT | kB |
|-------|------:|-------:|----:|----:|---:|
| mobile `/ko/` | 59–75* | 4k–12k* | 0–0.09 | low | ~3001 |
| mobile `/ko/business/` | 62 | ~6474 | 0 | 0 | ~775 |
| mobile `/ko/portfolio/` | 68 | ~9860 | 0 | 0 | ~1988 |
| mobile `/ko/business/inquiry/` | 57 | ~11938 | 0 | 0 | ~2431 |
| mobile `/404.html` | 100 | 890 | 0 | 0 | 4 |
| desktop `/ko/` | 59 | ~5128 | 0.09 | 0 | ~3001 |

\* Lab variance is high (network/cache). Treat as directional, not absolute CWV.

**Dominant payloads before:** full multi-scripture Google Fonts CSS (often 200KB+), `newon-wordmark-chrome(-dark).png` (~312–366KB), oversized nav `logo.png` (~128KB), heavy app logos (myworld/pillmate/404 ~250–320KB each).

---

## 4. Core Web Vitals (lab)

| Metric | Observation |
|--------|-------------|
| LCP | Often wordmark / large image / font-delayed text — **P1** |
| CLS | Usually low; occasional ~0.09 on home (font/theme) — watch |
| INP | Not reliably measured in these lab runs; TBT generally low |
| FCP / SI | Tracked in Lighthouse JSON under `reports/lighthouse-baseline/` |

---

## 5. Fixes applied (safe)

1. **Locale-aware Google Fonts** — `patch-perf-load.mjs` + `fontLinksHtml`; strip JP/Devanagari except needed locales; ensure preconnect.  
2. **Home LCP wordmark WebP** + PNG fallback (`picture`); preload WebP.  
3. **Dark wordmark deferred** (`data-src` until dark theme) via `theme-shell.js`.  
4. **`logo-nav.png` (~5KB)** for gnav/footer instead of master `logo.png`.  
5. **Palette-optimized** heavy logos (backup `.logo-perf-bak/`).  
6. **`defer`** on inquiry / portfolio / ideas / news scripts.  
7. Generators updated: `gen-portfolio.mjs`, `site-chrome.mjs`, `render-creative.mjs`, templates `{{FONT_LINKS}}`.

**Not done (by policy):** CSS purge, critical CSS inline, SPA/bundler migration, aggressive showcase compression, all-font preload, mechanical async on every script.

---

## 6. Suggested budgets (current scale)

| Category | Soft budget |
|----------|-------------|
| HTML | ≤ 200 KB (home may exceed — known) |
| JS (first party) | ≤ 150 KB |
| CSS | ≤ 250 KB |
| Fonts CSS+files | ≤ 200 KB |
| Above-fold images | ≤ 200 KB |
| Third-party | ≤ 100 KB |

---

## 7. Manual checks

- [ ] Home light theme: WebP wordmark sharp  
- [ ] Home dark toggle: dark wordmark loads  
- [ ] Nav logo crisp at 40px  
- [ ] Business / Portfolio / Inquiry: fonts OK per locale  
- [ ] Inquiry submit still works  
- [ ] Mobile menu / search / analytics page_view  

---

## 8. Restore drill note

No production restore. Re-measure after deploy with:

`node scripts/performance/run-lighthouse.mjs`  
`node scripts/performance/run-lighthouse.mjs --desktop`
