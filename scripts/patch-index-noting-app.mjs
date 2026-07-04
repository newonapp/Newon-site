#!/usr/bin/env node
/** Insert noting-app HTML + JS routing into templates/index.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(ROOT, "templates", "index.html");
let s = fs.readFileSync(indexPath, "utf8");

if (!s.includes('id="noting-app"')) {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "noting-app-inc.html"), "utf8");
  const marker = '<div id="subping-app"';
  if (!s.includes(marker)) {
    console.error("patch-index-noting-app: subping-app marker not found");
    process.exit(1);
  }
  s = s.replace(marker, inc + "\n\n    " + marker);
  console.log("inserted noting-app section");
} else {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "noting-app-inc.html"), "utf8");
  const start = s.indexOf('<div id="noting-app"');
  const end = s.indexOf('<div id="subping-app"');
  if (start >= 0 && end > start) {
    s = s.slice(0, start) + inc + "\n\n    " + s.slice(end);
    console.log("refreshed noting-app section");
  }
}

if (!s.includes("TITLE_NOTING")) {
  s = s.replace(
    "var TITLE_PIGGYUP = {{js:meta.titlePiggyup}};",
    "var TITLE_PIGGYUP = {{js:meta.titlePiggyup}};\n        var TITLE_NOTING = {{js:meta.titleNoting}};"
  );
}

if (!s.includes('getElementById("noting-app")')) {
  s = s.replace(
    'var elPu = document.getElementById("piggyup-app");',
    'var elPu = document.getElementById("piggyup-app");\n        var elNt = document.getElementById("noting-app");'
  );
}

if (!s.includes("themeKeyNt")) {
  s = s.replace(
    'var themeKeyPu = "piggyup-app-theme";',
    'var themeKeyPu = "piggyup-app-theme";\n        var themeKeyNt = "noting-app-theme";'
  );
}

if (!s.includes("staggerNtReveals")) {
  const staggerFn = `
        function staggerNtReveals() {
          if (!elNt) return;
          requestAnimationFrame(function () {
            var reds = elNt.querySelectorAll(".ox-reveal-on-scroll:not(.is-visible)");
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

if (!s.includes("nt-nav-toggle")) {
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
          var ntt = document.getElementById("nt-nav-toggle");
          var ntm = document.getElementById("nt-mobile");
          if (ntt && ntm) {
            ntt.setAttribute("aria-expanded", "false");
            ntm.hidden = true;
          }
        }`
  );
}

if (!s.includes("syncNtThemeButton")) {
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

        function syncNtThemeButton() {
          var btn = document.getElementById("nt-theme");
          if (!btn || !elNt) return;
          var dark = elNt.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`
  );
  s = s.replace(
    "          syncPuThemeButton();\n        }",
    "          syncPuThemeButton();\n          syncNtThemeButton();\n        }"
  );
}

if (!s.includes("if (elNt) elNt.setAttribute")) {
  s = s.replace(
    '          if (elPu) elPu.setAttribute("data-theme", theme);',
    '          if (elPu) elPu.setAttribute("data-theme", theme);\n          if (elNt) elNt.setAttribute("data-theme", theme);'
  );
}

if (!s.includes("localStorage.removeItem(themeKeyNt)")) {
  s = s.replace(
    "            localStorage.removeItem(themeKeyPu);",
    "            localStorage.removeItem(themeKeyPu);\n            localStorage.removeItem(themeKeyNt);"
  );
  s = s.replace(
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu];",
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyNt];"
  );
}

const hideNt = "if (elNt) elNt.hidden = true;";
if (!s.includes(hideNt)) {
  s = s.replace(/if \(elPu\) elPu\.hidden = true;/g, (m) => m + "\n          " + hideNt);
}

if (!s.includes("elNt.querySelectorAll")) {
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
          if (elNt) {
            elNt.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`
  );
}

if (!s.includes("function showNoting")) {
  const showNotingBlock = `        function showNoting() {
          if (!elNt) {
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
          elNt.hidden = false;
          document.title = TITLE_NOTING;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerNtReveals();
          });
        }

`;

  s = s.replace(
    "        function routeFromHash() {",
    showNotingBlock + "        function routeFromHash() {"
  );

  s = s.replace(
    `          } else if (h === "#countup-app" || h === "#countup") {
            showCountup();
          } else {
            showHome();
          }`,
    `          } else if (h === "#countup-app" || h === "#countup") {
            showCountup();
          } else if (h === "#noting-app" || h === "#noting") {
            showNoting();
          } else {
            showHome();
          }`
  );
}

if (!s.includes("themeBtnNt")) {
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

        var themeBtnNt = document.getElementById("nt-theme");
        if (themeBtnNt && elNt) {
          syncNtThemeButton();
          themeBtnNt.addEventListener("click", function () {
            var next = elNt.getAttribute("data-theme") === "dark" ? "light" : "dark";
            persistUnifiedTheme(next);
          });
        }

        var ntToggle = document.getElementById("nt-nav-toggle");
        var ntMenu = document.getElementById("nt-mobile");
        if (ntToggle && ntMenu) {
          ntToggle.addEventListener("click", function () {
            var open = ntToggle.getAttribute("aria-expanded") === "true";
            ntToggle.setAttribute("aria-expanded", String(!open));
            ntMenu.hidden = open;
          });
          ntMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              ntToggle.setAttribute("aria-expanded", "false");
              ntMenu.hidden = true;
            });
          });
        }

        function closeAllAppFlyouts() {`
  );
}

if (!s.includes("function showPiggyup")) {
  console.warn("patch-index-noting-app: showPiggyup missing — hide elNt in show* may be incomplete");
} else if (!s.match(/function showPiggyup\(\)[\s\S]*?elNt\.hidden = true/)) {
  s = s.replace(
    /(function showPiggyup\(\) \{[\s\S]*?if \(elPl\) elPl\.hidden = true;\n)(\s*elPu\.hidden = false;)/,
    "$1          if (elNt) elNt.hidden = true;\n$2"
  );
}

fs.writeFileSync(indexPath, s, "utf8");
console.log("patch-index-noting-app: OK");
