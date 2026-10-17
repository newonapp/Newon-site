/**
 * Branch-scope rules for the LIVON release-candidate gates RC-1 and RC-41 (PHASE 03 P7).
 *
 * The gates guard the LIVON V1 product. They were written when the whole repository was the LIVON line, so every
 * changed file outside docs/ and tests/ counted as "product". The NEWON website lines (info-only-app-first, business
 * hub, phase 03 ...) legitimately change website files (pages, css, locales, templates, website scripts) and a few
 * shared build/test tooling files. This module separates the two without weakening the LIVON guard:
 *
 *   - LIVON-protected paths (livon/, server/, api/, scripts/livon-*, assets/livon-*, vercel.json, the deploy workflow,
 *     the shared publish scripts) are NEVER exempt, on any line;
 *   - website-owned paths are exempt only on a line whose history contains WEBSITE_ANCHOR;
 *   - the few shared tooling files in WEBSITE_TOOLING are exempt only on that line and only if every commit that touched
 *     them after the integration commit descends from WEBSITE_ANCHOR (so a LIVON-line edit of the same file still fails).
 *
 * When the website line is merged to main WITHOUT its history (squash), WEBSITE_ANCHOR is no longer in history and the
 * strict gate applies again: record the squash commit as the new anchor in this file in the same change.
 */
export const WEBSITE_ANCHOR = 'b155c2785298d6f0affe855cc84bfae74f6c03d1'; // work/info-only-app-first: first commit of the website line

/** Paths of the LIVON product and the shared runtime. A change here is never exempted by the website line. */
export const LIVON_PROTECTED = [
  /^livon\//, /^server\//, /^api\//, /^scripts\/livon-/, /^assets\/livon-/,
  /^vercel\.json$/, /^\.github\/workflows\/github-pages\.yml$/, /^\.env/,
  /^scripts\/(publish-site|serve-publish)\.mjs$/, /^docs\/livon\//, /^tests\/livon\//,
];

/**
 * Shared tooling the website line is allowed to change (each change is reviewed and recorded in docs/web-closure):
 *   scripts/publish-site.mjs         publishes the new website pages; SOURCE_DATE_EPOCH (P6)
 *   scripts/livon-data-quality.mjs   --now / LIVON_NOW fixed clock for the data-quality script (P6)
 *   tests/livon/data-manager.test.mjs, onboarding.test.mjs, release-candidate.test.mjs   fixed-clock / tolerance repairs (P6)
 */
export const WEBSITE_TOOLING = [
  'scripts/publish-site.mjs', 'scripts/livon-data-quality.mjs',
  'tests/livon/data-manager.test.mjs', 'tests/livon/onboarding.test.mjs', 'tests/livon/release-candidate.test.mjs',
];

export const isLivonProtected = (file) => LIVON_PROTECTED.some((re) => re.test(file));
/** Website-owned = not LIVON-protected (pages, css, locales, templates, website scripts, build-guard workflows ...). */
export const isWebsiteOwned = (file) => !isLivonProtected(file);

/**
 * Pure decision used by the gates and by tests/livon/branch-scope-gate.test.mjs.
 * ctx: { websiteLine: boolean, onlyWebsiteCommits: (file) => boolean }
 * Returns true when `file` may differ from the LIVON baseline on this line.
 */
export function websiteExempt(file, ctx) {
  if (!ctx.websiteLine) return false;
  if (WEBSITE_TOOLING.includes(file)) return ctx.onlyWebsiteCommits(file) === true;
  return isWebsiteOwned(file);
}
