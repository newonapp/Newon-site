#!/usr/bin/env node
/** Remove Noting nav, landing page, and JS from site templates. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const FLYOUT_NOTING_RE =
  /\n                <a href="#noting-app" role="menuitem" class="apps-flyout__item">[\s\S]*?<\/a>/g;

const MOBILE_NOTING_RE =
  /\n            <a href="#noting-app" class="mobile-apps-drawer__item">[\s\S]*?<\/a>/g;

function stripNotingNav(html) {
  return html.replace(FLYOUT_NOTING_RE, "").replace(MOBILE_NOTING_RE, "");
}

function stripNotingAppSection(html) {
  const start = html.indexOf('<div id="noting-app"');
  const end = html.indexOf('<div id="subping-app"');
  if (start < 0) return html;
  if (end <= start) {
    console.error("remove-noting: noting-app start found but subping-app marker missing");
    process.exit(1);
  }
  return html.slice(0, start) + html.slice(end);
}

function stripNotingJs(html) {
  let s = html;

  s = s.replace(/\n        var TITLE_NOTING = \{\{js:meta\.titleNoting\}\};/, "");
  s = s.replace(/\n        var elNt = document\.getElementById\("noting-app"\);/, "");
  s = s.replace(/\n        var themeKeyNt = "noting-app-theme";/, "");

  s = s.replace(
    /\n\n        function staggerNtReveals\(\) \{[\s\S]*?\n        \}\n\n        function closeMobileMenus\(\)/,
    "\n\n        function closeMobileMenus()"
  );

  s = s.replace(
    /\n\n        function syncNtThemeButton\(\) \{[\s\S]*?\n        \}\n\n        function getSystemThemePreference\(\)/,
    "\n\n        function getSystemThemePreference()"
  );

  s = s.replace(
    /\n          if \(elNt\) elNt\.setAttribute\("data-theme", theme\);/,
    ""
  );

  s = s.replace(/\n          syncNtThemeButton\(\);/, "");

  s = s.replace(/, themeKeyNt/g, "");

  s = s.replace(/\n            localStorage\.removeItem\(themeKeyNt\);/, "");

  s = s.replace(/\n          if \(elNt\) elNt\.hidden = true;/g, "");

  s = s.replace(
    /\n        function showNoting\(\) \{[\s\S]*?\n        \}\n\n        function routeFromHash\(\)/,
    "\n\n        function routeFromHash()"
  );

  s = s.replace(
    /\n          \} else if \(h === "#noting-app" \|\| h === "#noting"\) \{\n            showNoting\(\);\n/,
    "\n"
  );

  s = s.replace(
    /\n        var themeBtnNt = document\.getElementById\("nt-theme"\);[\s\S]*?\n        \}\n\n        var ntToggle = document\.getElementById\("nt-nav-toggle"\);[\s\S]*?\n        \}\n\n        function closeAllAppFlyouts\(\)/,
    "\n\n        function closeAllAppFlyouts()"
  );

  s = s.replace(/(\n          if \(elPu\) elPu\.hidden = true;)+/g, "\n          if (elPu) elPu.hidden = true;");

  return s;
}

function patchFile(relPath, { stripSection = false } = {}) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`skip (missing): ${relPath}`);
    return;
  }

  let s = fs.readFileSync(filePath, "utf8");
  const before = s;

  if (stripSection) s = stripNotingAppSection(s);
  s = stripNotingNav(s);
  if (stripSection) s = stripNotingJs(s);

  if (s === before) {
    console.log(`unchanged: ${relPath}`);
    return;
  }

  fs.writeFileSync(filePath, s, "utf8");
  console.log(`patched: ${relPath}`);
}

patchFile("templates/index.html", { stripSection: true });
for (const name of ["templates/petlog-app-inc.html", "templates/piggyup-app-inc.html"]) {
  patchFile(name);
}

console.log("remove-noting-from-site: OK");
