#!/usr/bin/env node
/** Insert newon-plus-app HTML + JS routing into templates/index.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(ROOT, "templates", "index.html");
let s = fs.readFileSync(indexPath, "utf8");

const marker = '<div id="noting-app"';

if (!s.includes('id="newon-plus-app"')) {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "newon-plus-app-inc.html"), "utf8");
  if (!s.includes(marker)) {
    console.error("patch-index-newon-plus-app: noting-app marker not found");
    process.exit(1);
  }
  s = s.replace(marker, inc + "\n\n    " + marker);
  console.log("inserted newon-plus-app section");
} else {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "newon-plus-app-inc.html"), "utf8");
  const start = s.indexOf('<div id="newon-plus-app"');
  const end = s.indexOf(marker);
  if (start >= 0 && end > start) {
    s = s.slice(0, start) + inc + "\n\n    " + s.slice(end);
    console.log("refreshed newon-plus-app section");
  }
}

if (!s.includes("TITLE_NEWON_PLUS")) {
  s = s.replace(
    "var TITLE_COUNTUP = {{js:meta.titleCountup}};",
    "var TITLE_COUNTUP = {{js:meta.titleCountup}};\n        var TITLE_NEWON_PLUS = {{js:meta.titleNewonPlus}};"
  );
}

if (!s.includes('getElementById("newon-plus-app")')) {
  s = s.replace(
    'var elCu = document.getElementById("countup-app");',
    'var elCu = document.getElementById("countup-app");\n        var elNp = document.getElementById("newon-plus-app");'
  );
}

if (!s.includes("themeKeyNp")) {
  s = s.replace(
    'var themeKeyCu = "countup-app-theme";',
    'var themeKeyCu = "countup-app-theme";\n        var themeKeyNp = "newon-plus-app-theme";'
  );
}

if (!s.includes("staggerNpReveals")) {
  const staggerFn = `
        function staggerNpReveals() {
          if (!elNp) return;
          requestAnimationFrame(function () {
            var reds = elNp.querySelectorAll(".ox-reveal-on-scroll:not(.is-visible)");
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

if (!s.includes("np-nav-toggle")) {
  s = s.replace(
    `          var cut = document.getElementById("cu-nav-toggle");
          var cum = document.getElementById("cu-mobile");
          if (cut && cum) {
            cut.setAttribute("aria-expanded", "false");
            cum.hidden = true;
          }
        }`,
    `          var cut = document.getElementById("cu-nav-toggle");
          var cum = document.getElementById("cu-mobile");
          if (cut && cum) {
            cut.setAttribute("aria-expanded", "false");
            cum.hidden = true;
          }
          var npt = document.getElementById("np-nav-toggle");
          var npm = document.getElementById("np-mobile");
          if (npt && npm) {
            npt.setAttribute("aria-expanded", "false");
            npm.hidden = true;
          }
        }`
  );
}

if (!s.includes("syncNpThemeButton")) {
  s = s.replace(
    `        function syncCuThemeButton() {
          var btn = document.getElementById("cu-theme");
          if (!btn || !elCu) return;
          var dark = elCu.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`,
    `        function syncCuThemeButton() {
          var btn = document.getElementById("cu-theme");
          if (!btn || !elCu) return;
          var dark = elCu.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }

        function syncNpThemeButton() {
          var btn = document.getElementById("np-theme");
          if (!btn || !elNp) return;
          var dark = elNp.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`
  );
  s = s.replace(
    "          syncCuThemeButton();\n        }",
    "          syncCuThemeButton();\n          syncNpThemeButton();\n        }"
  );
}

if (!s.includes("if (elNp) elNp.setAttribute")) {
  s = s.replace(
    '          if (elCu) elCu.setAttribute("data-theme", theme);',
    '          if (elCu) elCu.setAttribute("data-theme", theme);\n          if (elNp) elNp.setAttribute("data-theme", theme);'
  );
}

if (!s.includes("localStorage.removeItem(themeKeyNp)")) {
  s = s.replace(
    "            localStorage.removeItem(themeKeyCu);",
    "            localStorage.removeItem(themeKeyCu);\n            localStorage.removeItem(themeKeyNp);"
  );
  s = s.replace(
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu, themeKeyCu];",
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu, themeKeyCu, themeKeyNp];"
  );
}

const hideNp = "if (elNp) elNp.hidden = true;";
if (!s.includes(hideNp)) {
  s = s.replace(/if \(elCu\) elCu\.hidden = true;/g, (m) => m + "\n          " + hideNp);
}

if (!s.includes("elNp.querySelectorAll")) {
  s = s.replace(
    `          if (elCu) {
            elCu.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`,
    `          if (elCu) {
            elCu.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          if (elNp) {
            elNp.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`
  );
}

if (!s.includes("function showNewonPlus")) {
  s = s.replace(
    `          } else if (h === "#countup-app" || h === "#countup") {
            showCountup();
          } else if (h === "#noting-app" || h === "#noting") {
            showNoting();
          } else {
            showHome();
          }
        }`,
    `          } else if (h === "#countup-app" || h === "#countup") {
            showCountup();
          } else if (
            h === "#newon-plus-app" ||
            h === "#newon-plus" ||
            h === "#newon-package" ||
            h === "#np-top"
          ) {
            showNewonPlus();
          } else if (h === "#noting-app" || h === "#noting") {
            showNoting();
          } else {
            showHome();
          }
        }`
  );

  s = s.replace(
    `        function showCountup() {
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
          if (elNt) elNt.hidden = true;
          if (elGu) elGu.hidden = true;
          elCu.hidden = false;
          document.title = TITLE_COUNTUP;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerCuReveals();
          });
        }


        function showNoting() {`,
    `        function showCountup() {
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
          if (elNt) elNt.hidden = true;
          if (elGu) elGu.hidden = true;
          if (elNp) elNp.hidden = true;
          elCu.hidden = false;
          document.title = TITLE_COUNTUP;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerCuReveals();
          });
        }

        function showNewonPlus() {
          if (!elNp) {
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
          if (elNt) elNt.hidden = true;
          elNp.hidden = false;
          document.title = TITLE_NEWON_PLUS;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerNpReveals();
          });
        }


        function showNoting() {`
  );
}

if (s.includes('h === "#newon-plus-app"') && !s.includes('h === "#np-top"')) {
  s = s.replace(
    /h === "#newon-plus-app" \|\| h === "#newon-plus" \|\| h === "#newon-package"/,
    'h === "#newon-plus-app" || h === "#newon-plus" || h === "#newon-package" || h === "#np-top"'
  );
}

if (!s.includes("themeBtnNp")) {
  s = s.replace(
    `        var cuToggle = document.getElementById("cu-nav-toggle");
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

        function closeAllAppFlyouts() {`,
    `        var cuToggle = document.getElementById("cu-nav-toggle");
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

        var themeBtnNp = document.getElementById("np-theme");
        if (themeBtnNp && elNp) {
          syncNpThemeButton();
          themeBtnNp.addEventListener("click", function () {
            var next = elNp.getAttribute("data-theme") === "dark" ? "light" : "dark";
            persistUnifiedTheme(next);
          });
        }

        var npToggle = document.getElementById("np-nav-toggle");
        var npMenu = document.getElementById("np-mobile");
        if (npToggle && npMenu) {
          npToggle.addEventListener("click", function () {
            var open = npToggle.getAttribute("aria-expanded") === "true";
            npToggle.setAttribute("aria-expanded", String(!open));
            npMenu.hidden = open;
          });
          npMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              npToggle.setAttribute("aria-expanded", "false");
              npMenu.hidden = true;
            });
          });
        }

        function closeAllAppFlyouts() {`
  );
}

fs.writeFileSync(indexPath, s, "utf8");
console.log("patch-index-newon-plus-app: OK");
