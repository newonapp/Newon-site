#!/usr/bin/env node
/** Insert goalup-app HTML + JS routing into templates/index.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(ROOT, "templates", "index.html");
let s = fs.readFileSync(indexPath, "utf8");

if (!s.includes('id="goalup-app"')) {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "goalup-app-inc.html"), "utf8");
  const marker = '<div id="subping-app"';
  if (!s.includes(marker)) {
    console.error("patch-index-goalup-app: subping-app marker not found");
    process.exit(1);
  }
  s = s.replace(marker, inc + "\n\n    " + marker);
  console.log("inserted goalup-app section");
} else {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "goalup-app-inc.html"), "utf8");
  const start = s.indexOf('<div id="goalup-app"');
  const end = s.indexOf('<div id="subping-app"');
  if (start >= 0 && end > start) {
    s = s.slice(0, start) + inc + "\n\n    " + s.slice(end);
    console.log("refreshed goalup-app section");
  }
}

if (!s.includes("TITLE_GOALUP")) {
  s = s.replace(
    "var TITLE_PIGGYUP = {{js:meta.titlePiggyup}};",
    "var TITLE_PIGGYUP = {{js:meta.titlePiggyup}};\n        var TITLE_GOALUP = {{js:meta.titleGoalup}};"
  );
}

if (!s.includes('getElementById("goalup-app")')) {
  s = s.replace(
    'var elPu = document.getElementById("piggyup-app");',
    'var elPu = document.getElementById("piggyup-app");\n        var elGu = document.getElementById("goalup-app");'
  );
}

if (!s.includes("themeKeyGu")) {
  s = s.replace(
    'var themeKeyPu = "piggyup-app-theme";',
    'var themeKeyPu = "piggyup-app-theme";\n        var themeKeyGu = "goalup-app-theme";'
  );
}

if (!s.includes("staggerGuReveals")) {
  const staggerFn = `
        function staggerGuReveals() {
          if (!elGu) return;
          requestAnimationFrame(function () {
            var reds = elGu.querySelectorAll(".ox-reveal-on-scroll:not(.is-visible)");
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

if (!s.includes("gu-nav-toggle")) {
  s = s.replace(
    `          var put = document.getElementById("pu-nav-toggle");
          var pum = document.getElementById("pu-mobile");
          if (put && pum) {
            put.setAttribute("aria-expanded", "false");
            pum.hidden = true;
          }
        }`,
    `          var put = document.getElementById("pu-nav-toggle");
          var pum = document.getElementById("pu-mobile");
          if (put && pum) {
            put.setAttribute("aria-expanded", "false");
            pum.hidden = true;
          }
          var gut = document.getElementById("gu-nav-toggle");
          var gum = document.getElementById("gu-mobile");
          if (gut && gum) {
            gut.setAttribute("aria-expanded", "false");
            gum.hidden = true;
          }
        }`
  );
}

if (!s.includes("syncGuThemeButton")) {
  s = s.replace(
    `        function syncPuThemeButton() {
          var btn = document.getElementById("pu-theme");
          if (!btn || !elPu) return;
          var dark = elPu.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`,
    `        function syncPuThemeButton() {
          var btn = document.getElementById("pu-theme");
          if (!btn || !elPu) return;
          var dark = elPu.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }

        function syncGuThemeButton() {
          var btn = document.getElementById("gu-theme");
          if (!btn || !elGu) return;
          var dark = elGu.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`
  );
  s = s.replace(
    "          syncPuThemeButton();\n        }",
    "          syncPuThemeButton();\n          syncGuThemeButton();\n        }"
  );
}

if (!s.includes("if (elGu) elGu.setAttribute")) {
  s = s.replace(
    '          if (elPu) elPu.setAttribute("data-theme", theme);',
    '          if (elPu) elPu.setAttribute("data-theme", theme);\n          if (elGu) elGu.setAttribute("data-theme", theme);'
  );
}

if (!s.includes("localStorage.removeItem(themeKeyGu)")) {
  s = s.replace(
    "            localStorage.removeItem(themeKeyPu);",
    "            localStorage.removeItem(themeKeyPu);\n            localStorage.removeItem(themeKeyGu);"
  );
  s = s.replace(
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu];",
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu];"
  );
}

const hideGu = "if (elGu) elGu.hidden = true;";
if (!s.includes(hideGu)) {
  s = s.replace(/if \(elPu\) elPu\.hidden = true;/g, (m) => m + "\n          " + hideGu);
}

if (!s.includes("elGu.querySelectorAll")) {
  s = s.replace(
    `          if (elPu) {
            elPu.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`,
    `          if (elPu) {
            elPu.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          if (elGu) {
            elGu.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`
  );
}

if (!s.includes("function showGoalup")) {
  s = s.replace(
    `          } else if (h === "#piggyup-app" || h === "#piggyup") {
            showPiggyup();
          } else {
            showHome();
          }
        }`,
    `          } else if (h === "#piggyup-app" || h === "#piggyup") {
            showPiggyup();
          } else if (h === "#goalup-app" || h === "#goalup") {
            showGoalup();
          } else {
            showHome();
          }
        }`
  );

  s = s.replace(
    `        function showPiggyup() {
          if (!elPu) {
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
          elPu.hidden = false;
          document.title = TITLE_PIGGYUP;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerPuReveals();
          });
        }


        function routeFromHash() {`,
    `        function showPiggyup() {
          if (!elPu) {
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
          if (elGu) elGu.hidden = true;
          elPu.hidden = false;
          document.title = TITLE_PIGGYUP;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerPuReveals();
          });
        }

        function showGoalup() {
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


        function routeFromHash() {`
  );
}

if (!s.includes("themeBtnGu")) {
  s = s.replace(
    `        var puToggle = document.getElementById("pu-nav-toggle");
        var puMenu = document.getElementById("pu-mobile");
        if (puToggle && puMenu) {
          puToggle.addEventListener("click", function () {
            var open = puToggle.getAttribute("aria-expanded") === "true";
            puToggle.setAttribute("aria-expanded", String(!open));
            puMenu.hidden = open;
          });
          puMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              puToggle.setAttribute("aria-expanded", "false");
              puMenu.hidden = true;
            });
          });
        }

        function closeAllAppFlyouts() {`,
    `        var puToggle = document.getElementById("pu-nav-toggle");
        var puMenu = document.getElementById("pu-mobile");
        if (puToggle && puMenu) {
          puToggle.addEventListener("click", function () {
            var open = puToggle.getAttribute("aria-expanded") === "true";
            puToggle.setAttribute("aria-expanded", String(!open));
            puMenu.hidden = open;
          });
          puMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              puToggle.setAttribute("aria-expanded", "false");
              puMenu.hidden = true;
            });
          });
        }

        var themeBtnGu = document.getElementById("gu-theme");
        if (themeBtnGu && elGu) {
          syncGuThemeButton();
          themeBtnGu.addEventListener("click", function () {
            var next = elGu.getAttribute("data-theme") === "dark" ? "light" : "dark";
            persistUnifiedTheme(next);
          });
        }

        var guToggle = document.getElementById("gu-nav-toggle");
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

        function closeAllAppFlyouts() {`
  );
}

fs.writeFileSync(indexPath, s, "utf8");
console.log("patch-index-goalup-app: OK");
