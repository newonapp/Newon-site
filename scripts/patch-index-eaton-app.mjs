#!/usr/bin/env node
/** Insert eaton-app HTML + JS routing into templates/index.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(ROOT, "templates", "index.html");
let s = fs.readFileSync(indexPath, "utf8");

const subpingMarker = '<div id="subping-app"';
const fitonMarker = '<div id="fiton-app"';
// Prefer FitOn marker when present so refreshing EatOn does not wipe FitOn.
const endMarker = s.includes(fitonMarker) ? fitonMarker : subpingMarker;

if (!s.includes(endMarker)) {
  console.error("patch-index-eaton-app: end marker not found");
  process.exit(1);
}

const inc = fs.readFileSync(path.join(ROOT, "templates", "eaton-app-inc.html"), "utf8");

if (!s.includes('id="eaton-app"')) {
  s = s.replace(endMarker, inc + "\n\n    " + endMarker);
  console.log("inserted eaton-app section");
} else {
  const start = s.indexOf('<div id="eaton-app"');
  const end = s.indexOf(endMarker);
  if (start >= 0 && end > start) {
    s = s.slice(0, start) + inc + "\n\n    " + s.slice(end);
    console.log("refreshed eaton-app section");
  } else {
    console.error("patch-index-eaton-app: eaton-app slice not found before end marker");
    process.exit(1);
  }
}

if (!s.includes("TITLE_EATON")) {
  s = s.replace(
    "var TITLE_MYWORLD = {{js:meta.titleMyworld}};",
    "var TITLE_MYWORLD = {{js:meta.titleMyworld}};\n        var TITLE_EATON = {{js:meta.titleEaton}};"
  );
}

if (!s.includes('getElementById("eaton-app")')) {
  s = s.replace(
    'var elMw = document.getElementById("myworld-app");',
    'var elMw = document.getElementById("myworld-app");\n        var elEo = document.getElementById("eaton-app");'
  );
}

if (!s.includes("themeKeyEo")) {
  s = s.replace(
    'var themeKeyMw = "myworld-app-theme";',
    'var themeKeyMw = "myworld-app-theme";\n        var themeKeyEo = "eaton-app-theme";'
  );
}

if (!s.includes("staggerEoReveals")) {
  const staggerFn = `
        function staggerEoReveals() {
          if (!elEo) return;
          requestAnimationFrame(function () {
            var reds = elEo.querySelectorAll(".ox-reveal-on-scroll:not(.is-visible)");
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

if (!s.includes('var eot = document.getElementById("eo-nav-toggle")')) {
  const closeExtra = `          var mwt = document.getElementById("mw-nav-toggle");
          var mwm = document.getElementById("mw-mobile");
          if (mwt && mwm) {
            mwt.setAttribute("aria-expanded", "false");
            mwm.hidden = true;
          }
          var eot = document.getElementById("eo-nav-toggle");
          var eom = document.getElementById("eo-mobile");
          if (eot && eom) {
            eot.setAttribute("aria-expanded", "false");
            eom.hidden = true;
          }
`;
  if (s.includes('var ntt = document.getElementById("nt-nav-toggle")')) {
    s = s.replace(
      `          if (ntt && ntm) {
            ntt.setAttribute("aria-expanded", "false");
            ntm.hidden = true;
          }
        }`,
      `          if (ntt && ntm) {
            ntt.setAttribute("aria-expanded", "false");
            ntm.hidden = true;
          }
${closeExtra}        }`
    );
  } else if (s.includes('var npt = document.getElementById("np-nav-toggle")')) {
    s = s.replace(
      `          if (npt && npm) {
            npt.setAttribute("aria-expanded", "false");
            npm.hidden = true;
          }
        }`,
      `          if (npt && npm) {
            npt.setAttribute("aria-expanded", "false");
            npm.hidden = true;
          }
${closeExtra}        }`
    );
  } else {
    console.error("patch-index-eaton-app: closeMobileMenus anchor not found");
    process.exit(1);
  }
}

if (!s.includes("syncEoThemeButton")) {
  s = s.replace(
    `        function syncMwThemeButton() {
          var btn = document.getElementById("mw-theme");
          if (!btn || !elMw) return;
          var dark = elMw.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`,
    `        function syncMwThemeButton() {
          var btn = document.getElementById("mw-theme");
          if (!btn || !elMw) return;
          var dark = elMw.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }

        function syncEoThemeButton() {
          var btn = document.getElementById("eo-theme");
          if (!btn || !elEo) return;
          var dark = elEo.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`
  );
  s = s.replace(
    "          syncMwThemeButton();\n        }",
    "          syncMwThemeButton();\n          syncEoThemeButton();\n        }"
  );
}

if (!s.includes("if (elEo) elEo.setAttribute")) {
  s = s.replace(
    '          if (elMw) elMw.setAttribute("data-theme", theme);',
    '          if (elMw) elMw.setAttribute("data-theme", theme);\n          if (elEo) elEo.setAttribute("data-theme", theme);'
  );
}

if (!s.includes("localStorage.removeItem(themeKeyEo)")) {
  s = s.replace(
    "            localStorage.removeItem(themeKeyMw);",
    "            localStorage.removeItem(themeKeyMw);\n            localStorage.removeItem(themeKeyEo);"
  );
  s = s.replace(
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu, themeKeyCu, themeKeyNp, themeKeyMw];",
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu, themeKeyGu, themeKeyCu, themeKeyNp, themeKeyMw, themeKeyEo];"
  );
}

const hideEo = "if (elEo) elEo.hidden = true;";
if (!s.includes(hideEo)) {
  s = s.replace(/if \(elMw\) elMw\.hidden = true;/g, (m) => m + "\n          " + hideEo);
}

if (!s.includes("elEo.querySelectorAll")) {
  s = s.replace(
    `          if (elMw) {
            elMw.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`,
    `          if (elMw) {
            elMw.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          if (elEo) {
            elEo.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`
  );
}

if (!s.includes('h === "#eaton-app" || h === "#eaton" || h === "#eo-top"')) {
  if (
    !s.includes(
      `          } else if (h === "#myworld-app" || h === "#myworld" || h === "#mw-top") {
            showMyworld();`
    )
  ) {
    console.error("patch-index-eaton-app: myworld hash branch not found");
    process.exit(1);
  }
  s = s.replace(
    `          } else if (h === "#myworld-app" || h === "#myworld" || h === "#mw-top") {
            showMyworld();
`,
    `          } else if (h === "#myworld-app" || h === "#myworld" || h === "#mw-top") {
            showMyworld();
          } else if (h === "#eaton-app" || h === "#eaton" || h === "#eo-top") {
            showEaton();
`
  );
}

if (!s.includes("function showEaton")) {
  const showFn = `        function showEaton() {
          if (!elEo) {
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
          elEo.hidden = false;
          document.title = TITLE_EATON;
          closeMobileMenus();
          requestAnimationFrame(function () {
            window.scrollTo(0, 0);
            staggerEoReveals();
          });
        }


`;
  if (!s.includes("        function showMyworld() {")) {
    console.error("patch-index-eaton-app: showMyworld not found");
    process.exit(1);
  }
  s = s.replace("        function showMyworld() {", showFn + "        function showMyworld() {");
}

// Ensure showMyworld hides EatOn
if (s.includes("function showMyworld()") && !s.match(/function showMyworld\(\) \{[\s\S]*?if \(elEo\) elEo\.hidden = true;/)) {
  s = s.replace(
    `        function showMyworld() {
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
          elMw.hidden = false;`,
    `        function showMyworld() {
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
          if (elEo) elEo.hidden = true;
          elMw.hidden = false;`
  );
}

if (!s.includes("themeBtnEo")) {
  const binders = `        var themeBtnMw = document.getElementById("mw-theme");
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

        var themeBtnEo = document.getElementById("eo-theme");
        if (themeBtnEo && elEo) {
          syncEoThemeButton();
          themeBtnEo.addEventListener("click", function () {
            var next = elEo.getAttribute("data-theme") === "dark" ? "light" : "dark";
            persistUnifiedTheme(next);
          });
        }

        var eoToggle = document.getElementById("eo-nav-toggle");
        var eoMenu = document.getElementById("eo-mobile");
        if (eoToggle && eoMenu) {
          eoToggle.addEventListener("click", function () {
            var open = eoToggle.getAttribute("aria-expanded") === "true";
            eoToggle.setAttribute("aria-expanded", String(!open));
            eoMenu.hidden = open;
          });
          eoMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              eoToggle.setAttribute("aria-expanded", "false");
              eoMenu.hidden = true;
            });
          });
        }

`;
  if (!s.includes('function closeAllAppFlyouts()')) {
    console.error("patch-index-eaton-app: closeAllAppFlyouts not found");
    process.exit(1);
  }
  if (s.includes("var mwToggle = document.getElementById(\"mw-nav-toggle\")")) {
    s = s.replace(
      "        function closeAllAppFlyouts() {",
      `        var themeBtnEo = document.getElementById("eo-theme");
        if (themeBtnEo && elEo) {
          syncEoThemeButton();
          themeBtnEo.addEventListener("click", function () {
            var next = elEo.getAttribute("data-theme") === "dark" ? "light" : "dark";
            persistUnifiedTheme(next);
          });
        }

        var eoToggle = document.getElementById("eo-nav-toggle");
        var eoMenu = document.getElementById("eo-mobile");
        if (eoToggle && eoMenu) {
          eoToggle.addEventListener("click", function () {
            var open = eoToggle.getAttribute("aria-expanded") === "true";
            eoToggle.setAttribute("aria-expanded", String(!open));
            eoMenu.hidden = open;
          });
          eoMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              eoToggle.setAttribute("aria-expanded", "false");
              eoMenu.hidden = true;
            });
          });
        }

        function closeAllAppFlyouts() {`
    );
  } else {
    s = s.replace("        function closeAllAppFlyouts() {", binders + "        function closeAllAppFlyouts() {");
  }
}

fs.writeFileSync(indexPath, s, "utf8");
console.log("patch-index-eaton-app: OK");
