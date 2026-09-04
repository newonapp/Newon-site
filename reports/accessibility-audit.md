# Newon Accessibility Audit

**Phase 8** — static review + targeted fixes.  
Direction: **WCAG 2.2 Level AA**. This is **not** a certification.

`reports/` is not published to GitHub Pages.

---

## Method

- Source review: templates, `site-chrome.js`, `search.js`, inquiry/contact forms, CSS focus/motion
- Representative routes: Home, Business, Inquiry, Portfolio, Contact, Products, 404 (ko/en)
- Automation: no axe/pa11y in repo; Lighthouse a11y not required for this phase
- MANUAL still needed: real VoiceOver/TalkBack, full keyboard pass on device

---

## Summary

| Area | Status |
|------|--------|
| Skip links | Present; improved focus visibility |
| Landmarks | header/nav/main/footer generally OK; home has multiple `<main>` (app shells) |
| Mobile menu | Buttons + aria-expanded; **fixed** focus restore, Tab trap, main/footer inert |
| Search | **fixed** label + aria-live + focus restore |
| Inquiry form | Labels/types/autocomplete already strong; **fixed** aria-invalid + messages + required note |
| Contact form | **fixed** focus-visible + aria-invalid |
| Reduced motion | Present in styles / home-studio / gnav |
| Viewport zoom | No `user-scalable=no` / `maximum-scale=1` found |

---

## Issues

### P0
None identified.

### P1 (fixed)
- Mobile drawer: no focus restore / trap / background inert
- Search: unlabeled input; no live results; no focus restore

### P2 (fixed / reported)
- Inquiry: blank `setCustomValidity(" ")`; no `aria-invalid` → **fixed**
- Contact: `outline: none` on `:focus` → **focus-visible**; `aria-invalid` → **fixed**
- gnav icon controls lacking explicit focus-visible → **fixed**
- Home multiple `<main>` landmarks → **reported** (no redesign of 11 shells)

### P3
- Skip-link top/z-index polish → **fixed**
- ko/contact skip text sometimes English → report
- Compressed logo visual QA (from perf) unrelated

---

## Manual checklist

- [ ] Tab through header → skip link → main
- [ ] Open mobile menu: Tab cycles inside; Escape returns to menu button
- [ ] Search (Cmd/Ctrl+K or control): results announced; Escape restores focus
- [ ] Inquiry: submit empty → focus first invalid; email/consent messages
- [ ] Contact form errors + success status
- [ ] 200% zoom: CTAs still reachable
- [ ] `prefers-reduced-motion: reduce`

---

## Files touched

`site-chrome.js`, `search.js`, `business/inquiry.js`, `company.js`, `company.css`, `styles.css`, `gnav-mega.css`, `templates/business-inquiry.html`, generated inquiry/contact HTML (cache bust).
