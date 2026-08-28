/**
 * Inject shared site chrome into legacy templates via {{CHROME_HEADER}} / {{CHROME_FOOTER}}.
 */
import { renderStudioHeader, renderStudioFooter, renderGlobalHeader, renderCompanySwitcher } from "./site-chrome.mjs";

export function injectSiteChrome(
  html,
  flat,
  flatEn,
  { activeNav = "", mobileExtra = "", base = "../", idSuffix = "hub", companySwitch = "" } = {}
) {
  const header = renderGlobalHeader(flat, flatEn, { activeNav, base, idSuffix });
  const footer = renderStudioFooter(flat, flatEn, { base });
  let out = html.replace(/\{\{CHROME_HEADER\}\}/g, header).replace(/\{\{CHROME_FOOTER\}\}/g, footer);
  if (out.includes("{{COMPANY_SWITCHER}}")) {
    const switcher = companySwitch
      ? renderCompanySwitcher(flat, flatEn, { active: companySwitch, base })
      : "";
    out = out.replace(/\{\{COMPANY_SWITCHER\}\}/g, switcher);
  }
  if (!out.includes("gnav-mega.css")) {
    out = out.replace(
      /(<link rel="stylesheet" href="\/styles\.css[^"]*" \/>)/,
      '$1\n    <link rel="stylesheet" href="/gnav-mega.css?v=20260828logo" />'
    );
  }
  if (!out.includes("site-chrome.js")) {
    out = out.replace(
      /<\/body>/,
      '    <script src="/site-chrome.js?v=20260826gnav5" defer></script>\n  </body>'
    );
  }
  return out;
}

/** Replace inline legacy header/footer blocks (news, ideas, etc.). */
export function replaceLegacyChrome(
  html,
  flat,
  flatEn,
  { activeNav = "", mobileExtra = "", base = "../", companySwitch = "" } = {}
) {
  const header = renderGlobalHeader(flat, flatEn, { activeNav, base, idSuffix: "legacy" });
  const footer = renderStudioFooter(flat, flatEn, { base });
  let out = html.replace(/<header class="site-header snav-header[\s\S]*?<\/header>/, header);
  out = out.replace(/<header class="site-header gnav[\s\S]*?<\/header>/, header);
  out = out.replace(/<header class="gnav site-header[\s\S]*?<\/header>/, header);
  out = out.replace(/<header class="site-header pf-header[\s\S]*?<\/header>/, header);
  out = out.replace(/<footer class="site-footer[\s\S]*?<\/footer>/, footer);
  out = out.replace(/<footer class="pf-foot[\s\S]*?<\/footer>/, footer);
  if (companySwitch) {
    const switcher = renderCompanySwitcher(flat, flatEn, { active: companySwitch, base });
    // Remove prior switcher then insert after header
    out = out.replace(/<nav class="co-switch"[\s\S]*?<\/nav>\s*/g, "");
    out = out.replace(/(<\/header>)/, `$1\n${switcher}`);
  }
  if (!out.includes("hub-pages.css")) {
    out = out.replace(
      /(<link rel="stylesheet" href="\/styles\.css[^"]*" \/>)/,
      '$1\n    <link rel="stylesheet" href="/hub-pages.css?v=20260826co1" />'
    );
  } else {
    out = out.replace(/hub-pages\.css\?v=[^"]+/g, "hub-pages.css?v=20260826co1");
  }
  if (!out.includes("gnav-mega.css")) {
    out = out.replace(
      /(<link rel="stylesheet" href="\/styles\.css[^"]*" \/>)/,
      '$1\n    <link rel="stylesheet" href="/gnav-mega.css?v=20260828logo" />'
    );
  } else {
    out = out.replace(/gnav-mega\.css\?v=[^"]+/g, "gnav-mega.css?v=20260828logo");
  }
  if (!out.includes("analytics.js")) {
    out = out.replace(/<\/head>/, '    <script src="/analytics.js?v=20260825studio" defer></script>\n  </head>');
  }
  if (!out.includes("site-chrome.js")) {
    out = out.replace(
      /<\/body>/,
      '    <script src="/site-chrome.js?v=20260826gnav5" defer></script>\n  </body>'
    );
  } else {
    out = out.replace(/site-chrome\.js\?v=[^"]+/g, "site-chrome.js?v=20260826gnav5");
  }
  return out;
}

export const CHROME_SCRIPTS = `<script src="/analytics.js?v=20260825studio" defer></script>
    <script src="/search.js?v=20260825studio" defer></script>
    <script src="/site-chrome.js?v=20260826gnav5" defer></script>`;
