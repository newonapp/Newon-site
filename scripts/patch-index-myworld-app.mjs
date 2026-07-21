#!/usr/bin/env node
/** Insert myworld-app HTML + JS routing into templates/index.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(ROOT, "templates", "index.html");
let s = fs.readFileSync(indexPath, "utf8");

const marker = '<div id="noting-app"';

if (!s.includes('id="myworld-app"')) {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "myworld-app-inc.html"), "utf8");
  if (!s.includes(marker)) {
    console.error("patch-index-myworld-app: noting-app marker not found");
    process.exit(1);
  }
  s = s.replace(marker, inc + "\n\n    " + marker);
  console.log("inserted myworld-app section");
} else {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "myworld-app-inc.html"), "utf8");
  const start = s.indexOf('<div id="myworld-app"');
  const end = s.indexOf(marker);
  if (start >= 0 && end > start) {
    s = s.slice(0, start) + inc + "\n\n    " + s.slice(end);
    console.log("refreshed myworld-app section");
  }
}

if (!s.includes("TITLE_MYWORLD")) {
  s = s.replace(
    "var TITLE_NEWON_PLUS = {{js:meta.titleNewonPlus}};",
    "var TITLE_NEWON_PLUS = {{js:meta.titleNewonPlus}};\n        var TITLE_MYWORLD = {{js:meta.titleMyworld}};"
  );
}

if (!s.includes('getElementById("myworld-app")')) {
  s = s.replace(
    'var elNp = document.getElementById("newon-plus-app");',
    'var elNp = document.getElementById("newon-plus-app");\n        var elMw = document.getElementById("myworld-app");'
  );
}

if (!s.includes("themeKeyMw")) {
  s = s.replace(
    'var themeKeyNp = "newon-plus-app-theme";',
    'var themeKeyNp = "newon-plus-app-theme";\n        var themeKeyMw = "myworld-app-theme";'
  );
}

if (!s.includes("staggerMwReveals")) {
  const staggerFn = `
        function staggerMwReveals() {
          if (!elMw) return;
          requestAnimationFrame(function () {
            var reds = elMw.querySelectorAll(".ox-reveal-on-scroll:not(.is-visible)");
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

if (!s.includes("mw-nav-toggle")) {
  s = s.replace(
    `          var npt = document.getElementById("np-nav-toggle");
          var npm = document.getElementById("np-mobile");
          if (npt && npm) {
            npt.setAttribute("aria-expanded", "false");
            npm.hidden = true;
          }
        }`,
    `          var npt = document.getElementById("np-nav-toggle");
          var npm = document.getElementById("np-mobile");
          if (npt && npm) {
            npt.setAttribute("aria-expanded", "false");
            npm.hidden = true;
          }
          var mwt = document.getElementById("mw-nav-toggle");
          var mwm = document.getElementById("mw-mobile");
          if (mwt && mwm) {
            mwt.setAttribute("aria-expanded", "false");
            mwm.hidden = true;
          }
        }`
  );
}

if (!s.includes("syncMwThemeButton")) {
  s = s.replace(
    `        function syncNpThemeButton() {
          var btn = document.getElementById("np-theme");
          if (!btn || !elNp) return;
          var dark = elNp.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`,
    `        function syncNpThemeButton() {
          var btn = document.getElementById("np-theme");
          if (!btn || !elNp) return;
          var dark = elNp.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }

        function syncMwThemeButton() {
          var btn = document.getElementById("mw-theme");
          if (!btn || !elMw) return;
          var dark = elMw.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`
  );
  s = s.replace(
    "          syncNpThemeButton();\n        }",
    "          syncNpThemeButton();\n          syncMwThemeButton();\n        }"
  );
}

if (!s.includes("if (elMw) elMw.setAttribute")) {
  s = s.replace(
    '          if (elNp) elNp.setAttribute("data-theme", theme);',
    '          if (elNp) elNp.setAttribute("data-theme", theme);\n          if (elMw) elMw.setAttribute("data-theme", theme);'
  );
}

if (!s.includes("localStorage.removeItem(themeKeyMw)")) {
  s = s.replace(
    "            localStorage.removeItem(themeKeyNp);",
    "            localStorage.removeItem(themeKeyNp);\n            localStorage.removeItem(themeKeyMw);"
  );
  s = s.replace(
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu, themeKeyCu, themeKeyNp];",
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu, themeKeyCu, themeKeyNp, themeKeyMw];"
  );
}

const hideMw = "if (elMw) elMw.hidden = true;";
if (!s.includes(hideMw)) {
  s = s.replace(/if \(elNp\) elNp\.hidden = true;/g, (m) => m + "\n          " + hideMw);
}

if (!s.includes("elMw.querySelectorAll")) {
  s = s.replace(
    `          if (elNp) {
            elNp.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`,
    `          if (elNp) {
            elNp.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          if (elMw) {
            elMw.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`
  );
}

if (!s.includes('h === "#myworld-app"')) {
  s = s.replace(
    `          } else if (
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
        }`,
    `          } else if (
            h === "#newon-plus-app" ||
            h === "#newon-plus" ||
            h === "#newon-package" ||
            h === "#np-top"
          ) {
            showNewonPlus();
          } else if (h === "#myworld-app" || h === "#myworld" || h === "#mw-top") {
            showMyworld();
          } else if (h === "#noting-app" || h === "#noting") {
            showNoting();
          } else {
            showHome();
          }
        }`
  );
}

if (!s.includes("function showMyworld")) {
  const showFn = `        function showMyworld() {
          if (!elMw) {
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
          if (elNt) elNt.hidden = true;
          elMw.hidden = false;
          document.title = TITLE_MYWORLD;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerMwReveals();
          });
        }


`;
  if (!s.includes("        function showNoting() {")) {
    console.error("patch-index-myworld-app: showNoting not found");
    process.exit(1);
  }
  s = s.replace("        function showNoting() {", showFn + "        function showNoting() {");
}

if (!s.includes("themeBtnMw")) {
  s = s.replace(
    `        var npToggle = document.getElementById("np-nav-toggle");
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

        function closeAllAppFlyouts() {`,
    `        var npToggle = document.getElementById("np-nav-toggle");
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

        var themeBtnMw = document.getElementById("mw-theme");
        if (themeBtnMw && elMw) {
          syncMwThemeButton();
          themeBtnMw.addEventListener("click", function () {
            var next = elMw.getAttribute("data-theme") === "dark" ? "light" : "dark";
            persistUnifiedTheme(next);
          });
        }

        var mwToggle = document.getElementById("mw-nav-toggle");
        var mwMenu = document.getElementById("mw-mobile");
        if (mwToggle && mwMenu) {
          mwToggle.addEventListener("click", function () {
            var open = mwToggle.getAttribute("aria-expanded") === "true";
            mwToggle.setAttribute("aria-expanded", String(!open));
            mwMenu.hidden = open;
          });
          mwMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              mwToggle.setAttribute("aria-expanded", "false");
              mwMenu.hidden = true;
            });
          });
        }

        function closeAllAppFlyouts() {`
  );
}

fs.writeFileSync(indexPath, s, "utf8");
console.log("patch-index-myworld-app: OK");
