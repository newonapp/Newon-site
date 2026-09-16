#!/usr/bin/env node
/** Insert fiton-app HTML + JS routing into templates/index.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(ROOT, "templates", "index.html");
let s = fs.readFileSync(indexPath, "utf8");

const marker = '<div id="subping-app"';

if (!s.includes(marker)) {
  console.error("patch-index-fiton-app: subping-app marker not found");
  process.exit(1);
}

const inc = fs.readFileSync(path.join(ROOT, "templates", "fiton-app-inc.html"), "utf8");

if (!s.includes('id="fiton-app"')) {
  s = s.replace(marker, inc + "\n\n    " + marker);
  console.log("inserted fiton-app section");
} else {
  const start = s.indexOf('<div id="fiton-app"');
  const end = s.indexOf(marker);
  if (start >= 0 && end > start) {
    s = s.slice(0, start) + inc + "\n\n    " + s.slice(end);
    console.log("refreshed fiton-app section");
  } else {
    console.error("patch-index-fiton-app: fiton-app slice not found before subping");
    process.exit(1);
  }
}

if (!s.includes("TITLE_FITON")) {
  s = s.replace(
    "var TITLE_EATON = {{js:meta.titleEaton}};",
    "var TITLE_EATON = {{js:meta.titleEaton}};\n        var TITLE_FITON = {{js:meta.titleFiton}};"
  );
}

if (!s.includes('getElementById("fiton-app")')) {
  s = s.replace(
    'var elEo = document.getElementById("eaton-app");',
    'var elEo = document.getElementById("eaton-app");\n        var elFo = document.getElementById("fiton-app");'
  );
}

if (!s.includes("themeKeyFo")) {
  s = s.replace(
    'var themeKeyEo = "eaton-app-theme";',
    'var themeKeyEo = "eaton-app-theme";\n        var themeKeyFo = "fiton-app-theme";'
  );
}

if (!s.includes("staggerFoReveals")) {
  const staggerFn = `
        function staggerFoReveals() {
          if (!elFo) return;
          requestAnimationFrame(function () {
            var reds = elFo.querySelectorAll(".ox-reveal-on-scroll:not(.is-visible)");
            if (!reds.length) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              reds.forEach(function (el) {
                el.classList.add("is-visible");
              });
            } else {
              reds.forEach(function (el, i) {
                setTimeout(function () {
                  el.classList.add("is-visible");
                }, 50 + i * 75);
              });
            }
          });
        }
`;
  s = s.replace("        function closeMobileMenus() {", staggerFn + "\n        function closeMobileMenus() {");
}

if (!s.includes('var fot = document.getElementById("fo-nav-toggle")')) {
  const closeExtra = `          var fot = document.getElementById("fo-nav-toggle");
          var fom = document.getElementById("fo-mobile");
          if (fot && fom) {
            fot.setAttribute("aria-expanded", "false");
            fom.hidden = true;
          }
`;
  if (s.includes('var eot = document.getElementById("eo-nav-toggle")')) {
    s = s.replace(
      `          if (eot && eom) {
            eot.setAttribute("aria-expanded", "false");
            eom.hidden = true;
          }
        }`,
      `          if (eot && eom) {
            eot.setAttribute("aria-expanded", "false");
            eom.hidden = true;
          }
${closeExtra}        }`
    );
  } else {
    console.error("patch-index-fiton-app: closeMobileMenus eo anchor not found");
    process.exit(1);
  }
}

if (!s.includes("syncFoThemeButton")) {
  s = s.replace(
    `        function syncEoThemeButton() {
          var btn = document.getElementById("eo-theme");
          if (!btn || !elEo) return;
          var dark = elEo.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`,
    `        function syncEoThemeButton() {
          var btn = document.getElementById("eo-theme");
          if (!btn || !elEo) return;
          var dark = elEo.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }

        function syncFoThemeButton() {
          var btn = document.getElementById("fo-theme");
          if (!btn || !elFo) return;
          var dark = elFo.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`
  );
  s = s.replace(
    "          syncEoThemeButton();\n        }",
    "          syncEoThemeButton();\n          syncFoThemeButton();\n        }"
  );
}

if (!s.includes("if (elFo) elFo.setAttribute")) {
  s = s.replace(
    '          if (elEo) elEo.setAttribute("data-theme", theme);',
    '          if (elEo) elEo.setAttribute("data-theme", theme);\n          if (elFo) elFo.setAttribute("data-theme", theme);'
  );
}

if (!s.includes("localStorage.removeItem(themeKeyFo)")) {
  s = s.replace(
    "            localStorage.removeItem(themeKeyEo);",
    "            localStorage.removeItem(themeKeyEo);\n            localStorage.removeItem(themeKeyFo);"
  );
  s = s.replace(
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu, themeKeyCu, themeKeyNp, themeKeyMw, themeKeyEo];",
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu, themeKeyCu, themeKeyNp, themeKeyMw, themeKeyEo, themeKeyFo];"
  );
}

const hideFo = "if (elFo) elFo.hidden = true;";
if (!s.includes(hideFo)) {
  s = s.replace(/if \(elEo\) elEo\.hidden = true;/g, (m) => m + "\n          " + hideFo);
}

if (!s.includes("elFo.querySelectorAll")) {
  s = s.replace(
    `          if (elEo) {
            elEo.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`,
    `          if (elEo) {
            elEo.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          if (elFo) {
            elFo.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`
  );
}

if (!s.includes('h === "#fiton-app" || h === "#fiton" || h === "#fo-top"')) {
  if (
    !s.includes(
      `          } else if (h === "#eaton-app" || h === "#eaton" || h === "#eo-top") {
            showEaton();`
    )
  ) {
    console.error("patch-index-fiton-app: eaton hash branch not found");
    process.exit(1);
  }
  s = s.replace(
    `          } else if (h === "#eaton-app" || h === "#eaton" || h === "#eo-top") {
            showEaton();
`,
    `          } else if (h === "#eaton-app" || h === "#eaton" || h === "#eo-top") {
            showEaton();
          } else if (h === "#fiton-app" || h === "#fiton" || h === "#fo-top") {
            showFiton();
`
  );
}

if (!s.includes("function showFiton")) {
  const showFn = `        function showFiton() {
          if (!elFo) {
            showHome();
            return;
          }
          elHome.hidden = true;
          elOx.hidden = true;
          elSp.hidden = true;
          if (elPm) elPm.hidden = true;
          if (elSv) elSv.hidden = true;
          if (elBl) elBl.hidden = true;
          if (elPl) elPl.hidden = true;
          if (elPu) elPu.hidden = true;
          if (elGu) elGu.hidden = true;
          if (elCu) elCu.hidden = true;
          if (elNp) elNp.hidden = true;
          if (elMw) elMw.hidden = true;
          if (elEo) elEo.hidden = true;
          elFo.hidden = false;
          document.title = TITLE_FITON;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerFoReveals();
          });
        }


`;
  if (!s.includes("        function showEaton() {")) {
    console.error("patch-index-fiton-app: showEaton not found");
    process.exit(1);
  }
  s = s.replace("        function showEaton() {", showFn + "        function showEaton() {");
}

// Ensure showEaton hides FitOn (scope to this function only)
{
  const eoFn = s.match(/function showEaton\(\) \{[\s\S]*?\n        function /);
  if (eoFn && !/if \(elFo\) elFo\.hidden = true;/.test(eoFn[0])) {
    const next = s.replace(
      /(function showEaton\(\) \{[\s\S]*?if \(elMw\) elMw\.hidden = true;\n)(\s*elEo\.hidden = false;)/,
      "$1          if (elFo) elFo.hidden = true;\n$2"
    );
    if (next === s) {
      console.error("patch-index-fiton-app: failed to inject elFo hide into showEaton");
      process.exit(1);
    }
    s = next;
  }
}

// Ensure showMyworld hides FitOn (may already hide EatOn)
if (s.includes("function showMyworld()") && !s.match(/function showMyworld\(\) \{[\s\S]*?if \(elFo\) elFo\.hidden = true;/)) {
  // hideFo already added via global replace on elEo.hidden lines inside showMyworld if elEo hide exists
}

if (!s.includes("themeBtnFo")) {
  const binders = `        var themeBtnFo = document.getElementById("fo-theme");
        if (themeBtnFo && elFo) {
          syncFoThemeButton();
          themeBtnFo.addEventListener("click", function () {
            var next = elFo.getAttribute("data-theme") === "dark" ? "light" : "dark";
            persistUnifiedTheme(next);
          });
        }

        var foToggle = document.getElementById("fo-nav-toggle");
        var foMenu = document.getElementById("fo-mobile");
        if (foToggle && foMenu) {
          foToggle.addEventListener("click", function () {
            var open = foToggle.getAttribute("aria-expanded") === "true";
            foToggle.setAttribute("aria-expanded", String(!open));
            foMenu.hidden = open;
          });
          foMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              foToggle.setAttribute("aria-expanded", "false");
              foMenu.hidden = true;
            });
          });
        }

`;
  if (!s.includes("function closeAllAppFlyouts()")) {
    console.error("patch-index-fiton-app: closeAllAppFlyouts not found");
    process.exit(1);
  }
  if (s.includes('var eoToggle = document.getElementById("eo-nav-toggle")')) {
    s = s.replace(
      "        function closeAllAppFlyouts() {",
      binders + "        function closeAllAppFlyouts() {"
    );
  } else {
    s = s.replace("        function closeAllAppFlyouts() {", binders + "        function closeAllAppFlyouts() {");
  }
}

fs.writeFileSync(indexPath, s, "utf8");
console.log("patch-index-fiton-app: OK");
