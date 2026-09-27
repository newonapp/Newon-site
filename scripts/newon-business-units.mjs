/**
 * NEWON business structure — single source of truth (matches About).
 *
 *   1. Newon Apps     (apps, games, SaaS, Newon+ and other consumer digital products)
 *   2. Newon AI       (Personal AI · Enterprise AI)
 *   3. LivOn          (life-journey platform)
 *   4. Ongil          (care-centred senior platform)
 *   5. Newon Business (Build · Automation · Solutions · Care)
 *   6. Newon Studio   (Brand · Digital Design · Content & Campaign · Creative Lab · Design Care)
 *
 * Change names, order, routes or status here. Former names (Consumer, Commerce,
 * Games as a top-level business, Life Stage) are not business units any more:
 *   - Consumer  → Newon Apps
 *   - Games     → Newon Apps → Games
 *   - Commerce  → not a top-level business (ideas live under Apps / LivOn / Ongil as plans)
 *   - Life Stage→ LivOn (canonical /{lang}/livon/, legacy /{lang}/lifestage/ redirects)
 *   - ShareOn   → candidate under Apps, not a top-level business
 *
 * Status keys: live | partial | preparing | planned
 */
import { getCompanyMetrics } from "./company-metrics.mjs";

/** Canonical LivOn hub path (relative to /{lang}/). */
export const LIVON_HUB_PATH = "livon/";
/** Former LivOn hub path — kept only as a redirect stub. */
export const LIVON_LEGACY_PATH = "lifestage/";

export const BUSINESS_UNITS = [
  { id: "apps", n: "01", name: "Newon Apps", short: "Apps", path: "apps/", status: "live" },
  { id: "ai", n: "02", name: "Newon AI", short: "AI", path: "ai/", status: "partial" },
  { id: "livon", n: "03", name: "LivOn", short: "LivOn", path: LIVON_HUB_PATH, status: "preparing" },
  { id: "ongil", n: "04", name: "Ongil", short: "Ongil", path: "ongil/", status: "preparing" },
  { id: "business", n: "05", name: "Newon Business", short: "Business", path: "business/", status: "live" },
  { id: "studio", n: "06", name: "Newon Studio", short: "Studio", path: "studio/", status: "live" },
];

export function getBusinessUnit(id) {
  return BUSINESS_UNITS.find((u) => u.id === id) || null;
}

/** Name of the unit after `id` in the official order (null for the last). */
export function nextBusinessName(id) {
  const i = BUSINESS_UNITS.findIndex((u) => u.id === id);
  return i >= 0 && i < BUSINESS_UNITS.length - 1 ? BUSINESS_UNITS[i + 1].name : null;
}

/** Verified company numbers (from company-metrics / portfolio stats — never invented). */
export function getCompanyNumbers() {
  const m = getCompanyMetrics();
  return { apps: m.apps, services: m.products, countries: m.countries, languages: m.languages };
}
