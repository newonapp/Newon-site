/**
 * Redirect stubs that retire the separate inquiry pages into the unified /{lang}/contact/ page (owner spec 1, 2026-10-26).
 *
 *   /{lang}/business/contact/  → /{lang}/contact/?type=business… (old Business & Partnerships type codes mapped)
 *   /{lang}/studio/contact/    → /{lang}/contact/?type=business|personal&platform=newon&topic=newon-studio…
 *   /business/contact/, /studio/contact/ (no language) → the visitor's language stub, query and hash kept
 *
 * Static hosting (GitHub Pages) has no server 301, so each stub is the site's existing pattern: noindex +
 * canonical to the new page + meta refresh (no-JS fallback, default mapping) + location.replace (maps and keeps the
 * incoming query; unknown values travel in `legacy` so the operator still sees them). Same language, never /ko/.
 */
import { SITE_ORIGIN, escapeHtml } from "./hub-utils.mjs";
import { LEGACY_PAGE_DEFAULTS, legacyRedirectScript, unifiedContactUrl } from "./contact-taxonomy.mjs";

const TITLE = { ko: "문의하기 | NEWON", en: "Contact | NEWON" };

/** No-JS fallback target for a retired page. */
export function legacyDefaultTarget(lang, kind) {
  const d = LEGACY_PAGE_DEFAULTS[kind];
  return unifiedContactUrl(lang, { type: d.type, platform: "newon", topic: d.topic, source: d.source });
}

/** /{lang}/{business|studio}/contact/ stub. `lang` = { dir, htmlLang }. */
export function contactLegacyLangStub(lang, kind) {
  const fallback = legacyDefaultTarget(lang.dir, kind);
  const title = TITLE[lang.dir] || TITLE.en;
  return `<!DOCTYPE html>
<html lang="${lang.htmlLang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, follow" />
<title>${escapeHtml(title)}</title>
<link rel="canonical" href="${SITE_ORIGIN}/${lang.dir}/contact/" />
<meta http-equiv="refresh" content="0;url=${escapeHtml(fallback)}" />
<script>${legacyRedirectScript(lang.dir, kind)}</script>
</head>
<body><p><a href="${escapeHtml(fallback)}">NEWON Contact →</a></p></body>
</html>
`;
}

/** Language-less /{path}/ stub → /{preferred lang}/{path}/ with query and hash (that stub then maps). */
export function contactLegacyRootStub(relPath) {
  const p = relPath.replace(/^\/+|\/+$/g, "");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, follow" />
<title>Contact | NEWON</title>
<link rel="canonical" href="${SITE_ORIGIN}/ko/contact/" />
<meta http-equiv="refresh" content="0;url=/ko/${p}/" />
<script>
(function(){
  var LANGS=["ko","en","ja","es","pt-br","fr","de","hi","id"];
  var pref="ko";
  try{var s=localStorage.getItem("newon-lang-dir");if(s&&LANGS.indexOf(s)!==-1)pref=s;}catch(e){}
  location.replace("/"+pref+"/${p}/"+(location.search||"")+(location.hash||""));
})();
</script>
</head>
<body><p><a href="/ko/${p}/">NEWON Contact →</a></p></body>
</html>
`;
}

/** Plain query-keeping stub (old path → /{lang}/contact/ with the same query), e.g. /{lang}/company/contact/. */
export function contactAliasStub(lang, title = "Contact") {
  const to = `/${lang}/contact/`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=${to}"/><link rel="canonical" href="${SITE_ORIGIN}${to}"/><meta name="robots" content="noindex"/><title>${escapeHtml(title)}</title><script>location.replace(${JSON.stringify(to)}+(location.search||"")+(location.hash||""));</script></head><body><p><a href="${to}">Continue</a></p></body></html>\n`;
}
