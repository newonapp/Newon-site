/**
 * Inject shared site chrome into legacy templates via {{CHROME_HEADER}} / {{CHROME_FOOTER}}.
 */
import { renderStudioHeader, renderStudioFooter, renderGlobalHeader } from "./site-chrome.mjs";

export function injectSiteChrome(html, flat, flatEn, { activeNav = "", mobileExtra = "", base = "../", idSuffix = "hub" } = {}) {
  const header = renderGlobalHeader(flat, flatEn, { activeNav, base, idSuffix });
  const footer = renderStudioFooter(flat, flatEn);
  return html.replace(/\{\{CHROME_HEADER\}\}/g, header).replace(/\{\{CHROME_FOOTER\}\}/g, footer);
}

/** Replace inline legacy header/footer blocks (news, ideas, etc.). */
export function replaceLegacyChrome(html, flat, flatEn, { activeNav = "", mobileExtra = "", base = "../" } = {}) {
  const header = renderGlobalHeader(flat, flatEn, { activeNav, base, idSuffix: "legacy" });
  const footer = renderStudioFooter(flat, flatEn);
  let out = html.replace(/<header class="site-header snav-header[\s\S]*?<\/header>/, header);
  out = out.replace(/<header class="site-header gnav[\s\S]*?<\/header>/, header);
  out = out.replace(/<footer class="site-footer[\s\S]*?<\/footer>/, footer);
  if (!out.includes("hub-pages.css")) {
    out = out.replace(
      /(<link rel="stylesheet" href="\/styles\.css[^"]*" \/>)/,
      '$1\n    <link rel="stylesheet" href="/hub-pages.css?v=20260825studio" />'
    );
  }
  if (!out.includes("analytics.js")) {
    out = out.replace(/<\/head>/, '    <script src="/analytics.js?v=20260825studio" defer></script>\n  </head>');
  }
  if (!out.includes("site-chrome.js")) {
    out = out.replace(
      /<\/body>/,
      '    <script src="/site-chrome.js?v=20260825gnav" defer></script>\n  </body>'
    );
  }
  return out;
}

export const CHROME_SCRIPTS = `<script src="/analytics.js?v=20260825studio" defer></script>
    <script src="/search.js?v=20260825studio" defer></script>
    <script src="/site-chrome.js?v=20260825studio" defer></script>`;
