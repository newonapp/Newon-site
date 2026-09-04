/**
 * Inject shared site chrome into legacy templates via {{CHROME_HEADER}} / {{CHROME_FOOTER}}.
 */
import { renderStudioHeader, renderStudioFooter, renderGlobalHeader, renderCompanySwitcher } from "./site-chrome.mjs";
import { CHROME_HEAD_CSS } from "./hub-utils.mjs";

const GnavCss = "gnav-mega.css?v=20260902nav1";
const SiteChromeJs = "site-chrome.js?v=20260902nav2";

function injectHeadCss(html) {
  let out = html;
  if (!out.includes("site-dark.css")) {
    out = out.replace(/<\/head>/, `    ${CHROME_HEAD_CSS}\n  </head>`);
  } else {
    out = out.replace(/site-dark\.css\?v=[^"]+/g, "site-dark.css?v=20260902perf1");
    out = out.replace(/site-mobile\.css\?v=[^"]+/g, "site-mobile.css?v=20260902nav1");
  }
  // Remove invalid late CSS in body (legacy inject)
  out = out.replace(/\s*<link rel="stylesheet" href="\/site-dark\.css[^"]*" \/?>\s*/g, "\n");
  out = out.replace(/\s*<link rel="stylesheet" href="\/site-mobile\.css[^"]*" \/?>\s*/g, "\n");
  if (!out.includes("site-mobile.css")) {
    out = out.replace(/(<link rel="stylesheet" href="\/site-dark\.css[^"]*" \/>)/, `$1\n    <link rel="stylesheet" href="/site-mobile.css?v=20260902nav1" />`);
  }
  return out;
}

export function injectSiteChrome(
  html,
  flat,
  flatEn,
  { activeNav = "", mobileExtra = "", base = "../", idSuffix = "hub", companySwitch = "", langDir = "" } = {}
) {
  const header = renderGlobalHeader(flat, flatEn, { activeNav, base, idSuffix, langDir });
  const footer = renderStudioFooter(flat, flatEn, { base, langDir });
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
      `$1\n    <link rel="stylesheet" href="/${GnavCss}" />`
    );
  }
  out = injectHeadCss(out);
  if (!out.includes("site-chrome.js")) {
    out = out.replace(
      /<\/body>/,
      `    <script src="/${SiteChromeJs}" defer></script>\n  </body>`
    );
  }
  return out;
}

/** Replace inline legacy header/footer blocks (news, ideas, etc.). */
export function replaceLegacyChrome(
  html,
  flat,
  flatEn,
  { activeNav = "", mobileExtra = "", base = "../", companySwitch = "", langDir = "" } = {}
) {
  const header = renderGlobalHeader(flat, flatEn, { activeNav, base, idSuffix: "legacy", langDir });
  const footer = renderStudioFooter(flat, flatEn, { base, langDir });
  let out = html.replace(/<header class="site-header snav-header[\s\S]*?<\/header>/, header);
  out = out.replace(/<header class="site-header gnav[\s\S]*?<\/header>/, header);
  out = out.replace(/<header class="gnav site-header[\s\S]*?<\/header>/, header);
  out = out.replace(/<header class="site-header pf-header[\s\S]*?<\/header>/, header);
  out = out.replace(/<footer class="site-footer[\s\S]*?<\/footer>/g, footer);
  out = out.replace(/<footer class="pf-foot[\s\S]*?<\/footer>/g, footer);
  out = out.replace(/<nav class="co-switch"[\s\S]*?<\/nav>\s*/g, "");
  out = out.replace(/<nav class="co-nav"[\s\S]*?<\/nav>\s*/g, "");
  if (companySwitch) {
    const switcher = renderCompanySwitcher(flat, flatEn, { active: companySwitch, base });
    if (switcher) {
      out = out.replace(/(<\/header>)/, `$1\n${switcher}`);
    }
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
      `$1\n    <link rel="stylesheet" href="/${GnavCss}" />`
    );
  } else {
    out = out.replace(/gnav-mega\.css\?v=[^"]+/g, GnavCss);
  }
  out = injectHeadCss(out);
  if (!out.includes("analytics.js")) {
    out = out.replace(/<\/head>/, '    <script src="/analytics.js?v=20260904growth1" defer></script>\n  </head>');
  }
  if (!out.includes("site-chrome.js")) {
    out = out.replace(
      /<\/body>/,
      `    <script src="/${SiteChromeJs}" defer></script>\n  </body>`
    );
  } else {
    out = out.replace(/site-chrome\.js\?v=[^"]+/g, SiteChromeJs);
  }
  return out;
}

export const CHROME_SCRIPTS = `<script src="/analytics.js?v=20260904growth1" defer></script>
    <script src="/search.js?v=20260825studio" defer></script>
    <script src="/${SiteChromeJs}" defer></script>`;
