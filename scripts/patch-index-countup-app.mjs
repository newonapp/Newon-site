#!/usr/bin/env node
/** Insert countup-app HTML + JS routing into templates/index.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(ROOT, "templates", "index.html");
let s = fs.readFileSync(indexPath, "utf8");

if (!s.includes('id="countup-app"')) {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "countup-app-inc.html"), "utf8");
  const marker = '<div id="subping-app"';
  if (!s.includes(marker)) {
    console.error("patch-index-countup-app: subping-app marker not found");
    process.exit(1);
  }
  s = s.replace(marker, inc + "\n\n    " + marker);
  console.log("inserted countup-app section");
} else {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "countup-app-inc.html"), "utf8");
  const start = s.indexOf('<div id="countup-app"');
  let end = s.indexOf('<div id="newon-plus-app"');
  if (end < 0 || end <= start) end = s.indexOf('<div id="noting-app"');
  if (end < 0 || end <= start) end = s.indexOf('<div id="subping-app"');
  if (start >= 0 && end > start) {
    s = s.slice(0, start) + inc + "\n\n    " + s.slice(end);
    console.log("refreshed countup-app section");
  }
}

if (!s.includes("TITLE_COUNTUP")) {
  s = s.replace(
    "var TITLE_GOALUP = {{js:meta.titleGoalup}};",
    "var TITLE_GOALUP = {{js:meta.titleGoalup}};\n        var TITLE_COUNTUP = {{js:meta.titleCountup}};"
  );
}

if (!s.includes('getElementById("countup-app")')) {
  s = s.replace(
    'var elGu = document.getElementById("goalup-app");',
    'var elGu = document.getElementById("goalup-app");\n        var elCu = document.getElementById("countup-app");'
  );
}

if (!s.includes("themeKeyCu")) {
  s = s.replace(
    'var themeKeyGu = "goalup-app-theme";',
    'var themeKeyGu = "goalup-app-theme";\n        var themeKeyCu = "countup-app-theme";'
  );
}

if (!s.includes("staggerCuReveals")) {
  const staggerFn = `
        function staggerCuReveals() {
          if (!elCu) return;
          requestAnimationFrame(function () {
            var reds = elCu.querySelectorAll(".ox-reveal-on-scroll:not(.is-visible)");
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

if (!s.includes("cu-nav-toggle")) {
  s = s.replace(
    `          var gut = document.getElementById("gu-nav-toggle");
          var gum = document.getElementById("gu-mobile");
          if (gut && gum) {
            gut.setAttribute("aria-expanded", "false");
            gum.hidden = true;
          }
        }`,
    `          var gut = document.getElementById("gu-nav-toggle");
          var gum = document.getElementById("gu-mobile");
          if (gut && gum) {
            gut.setAttribute("aria-expanded", "false");
            gum.hidden = true;
          }
          var cut = document.getElementById("cu-nav-toggle");
          var cum = document.getElementById("cu-mobile");
          if (cut && cum) {
            cut.setAttribute("aria-expanded", "false");
            cum.hidden = true;
          }
        }`
  );
}

if (!s.includes("syncCuThemeButton")) {
  s = s.replace(
    `        function syncGuThemeButton() {
          var btn = document.getElementById("gu-theme");
          if (!btn || !elGu) return;
          var dark = elGu.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`,
    `        function syncGuThemeButton() {
          var btn = document.getElementById("gu-theme");
          if (!btn || !elGu) return;
          var dark = elGu.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }

        function syncCuThemeButton() {
          var btn = document.getElementById("cu-theme");
          if (!btn || !elCu) return;
          var dark = elCu.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`
  );
  s = s.replace(
    "          syncGuThemeButton();\n        }",
    "          syncGuThemeButton();\n          syncCuThemeButton();\n        }"
  );
}

if (!s.includes("if (elCu) elCu.setAttribute")) {
  s = s.replace(
    '          if (elGu) elGu.setAttribute("data-theme", theme);',
    '          if (elGu) elGu.setAttribute("data-theme", theme);\n          if (elCu) elCu.setAttribute("data-theme", theme);'
  );
}

if (!s.includes("localStorage.removeItem(themeKeyCu)")) {
  s = s.replace(
    "            localStorage.removeItem(themeKeyGu);",
    "            localStorage.removeItem(themeKeyGu);\n            localStorage.removeItem(themeKeyCu);"
  );
  s = s.replace(
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu];",
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu, themeKeyCu];"
  );
}

const hideCu = "if (elCu) elCu.hidden = true;";
if (!s.includes(hideCu)) {
  s = s.replace(/if \(elGu\) elGu\.hidden = true;/g, (m) => m + "\n          " + hideCu);
}

if (!s.includes("elCu.querySelectorAll")) {
  s = s.replace(
    `          if (elGu) {
            elGu.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`,
    `          if (elGu) {
            elGu.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          if (elCu) {
            elCu.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`
  );
}

if (!s.includes("function showCountup")) {
  s = s.replace(
    `          } else if (h === "#goalup-app" || h === "#goalup") {
            showGoalup();
          } else {
            showHome();
          }
        }`,
    `          } else if (h === "#goalup-app" || h === "#goalup") {
            showGoalup();
          } else if (h === "#countup-app" || h === "#countup") {
            showCountup();
          } else {
            showHome();
          }
        }`
  );

  s = s.replace(
    `        function showGoalup() {
          if (!elGu) {
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
          elGu.hidden = false;
          document.title = TITLE_GOALUP;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerGuReveals();
          });
        }


        function routeFromHash() {`,
    `        function showGoalup() {
          if (!elGu) {
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
          if (elCu) elCu.hidden = true;
          elGu.hidden = false;
          document.title = TITLE_GOALUP;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerGuReveals();
          });
        }

        function showCountup() {
          if (!elCu) {
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
          elCu.hidden = false;
          document.title = TITLE_COUNTUP;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerCuReveals();
          });
        }


        function routeFromHash() {`
  );
}

if (!s.includes("showPiggyup() {\n          if (!elPu)")) {
  // already patched
} else if (!s.match(/function showPiggyup\(\)[\s\S]*?elCu\.hidden = true/)) {
  s = s.replace(
    /(function showPiggyup\(\) \{[\s\S]*?if \(elGu\) elGu\.hidden = true;\n)(\s*elPu\.hidden = false;)/,
    "$1          if (elCu) elCu.hidden = true;\n$2"
  );
}

if (!s.includes("themeBtnCu")) {
  s = s.replace(
    `        var guToggle = document.getElementById("gu-nav-toggle");
        var guMenu = document.getElementById("gu-mobile");
        if (guToggle && guMenu) {
          guToggle.addEventListener("click", function () {
            var open = guToggle.getAttribute("aria-expanded") === "true";
            guToggle.setAttribute("aria-expanded", String(!open));
            guMenu.hidden = open;
          });
          guMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              guToggle.setAttribute("aria-expanded", "false");
              guMenu.hidden = true;
            });
          });
        }

        function closeAllAppFlyouts() {`,
    `        var guToggle = document.getElementById("gu-nav-toggle");
        var guMenu = document.getElementById("gu-mobile");
        if (guToggle && guMenu) {
          guToggle.addEventListener("click", function () {
            var open = guToggle.getAttribute("aria-expanded") === "true";
            guToggle.setAttribute("aria-expanded", String(!open));
            guMenu.hidden = open;
          });
          guMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              guToggle.setAttribute("aria-expanded", "false");
              guMenu.hidden = true;
            });
          });
        }

        var themeBtnCu = document.getElementById("cu-theme");
        if (themeBtnCu && elCu) {
          syncCuThemeButton();
          themeBtnCu.addEventListener("click", function () {
            var next = elCu.getAttribute("data-theme") === "dark" ? "light" : "dark";
            persistUnifiedTheme(next);
          });
        }

        var cuToggle = document.getElementById("cu-nav-toggle");
        var cuMenu = document.getElementById("cu-mobile");
        if (cuToggle && cuMenu) {
          cuToggle.addEventListener("click", function () {
            var open = cuToggle.getAttribute("aria-expanded") === "true";
            cuToggle.setAttribute("aria-expanded", String(!open));
            cuMenu.hidden = open;
          });
          cuMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              cuToggle.setAttribute("aria-expanded", "false");
              cuMenu.hidden = true;
            });
          });
        }

        function closeAllAppFlyouts() {`
  );
}

fs.writeFileSync(indexPath, s, "utf8");
console.log("patch-index-countup-app: OK");
