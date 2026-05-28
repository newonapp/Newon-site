#!/usr/bin/env node
/** Insert piggyup-app HTML + JS routing into templates/index.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(ROOT, "templates", "index.html");
let s = fs.readFileSync(indexPath, "utf8");

if (!s.includes('id="piggyup-app"')) {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "piggyup-app-inc.html"), "utf8");
  const marker = '<div id="subping-app"';
  if (!s.includes(marker)) {
    console.error("patch-index-piggyup-app: subping-app marker not found");
    process.exit(1);
  }
  s = s.replace(marker, inc + "\n\n    " + marker);
  console.log("inserted piggyup-app section");
} else {
  const inc = fs.readFileSync(path.join(ROOT, "templates", "piggyup-app-inc.html"), "utf8");
  const start = s.indexOf('<div id="piggyup-app"');
  const end = s.indexOf('<div id="subping-app"');
  if (start >= 0 && end > start) {
    s = s.slice(0, start) + inc + "\n\n    " + s.slice(end);
    console.log("refreshed piggyup-app section");
  } else {
    console.log("piggyup-app section already present");
  }
}

if (!s.includes("TITLE_PIGGYUP")) {
  s = s.replace(
    "var TITLE_PETLOG = {{js:meta.titlePetlog}};",
    "var TITLE_PETLOG = {{js:meta.titlePetlog}};\n        var TITLE_PIGGYUP = {{js:meta.titlePiggyup}};"
  );
}

if (!s.includes('getElementById("piggyup-app")')) {
  s = s.replace(
    'var elPl = document.getElementById("petlog-app");',
    'var elPl = document.getElementById("petlog-app");\n        var elPu = document.getElementById("piggyup-app");'
  );
}

if (!s.includes("themeKeyPu")) {
  s = s.replace(
    'var themeKeyPl = "petlog-app-theme";',
    'var themeKeyPl = "petlog-app-theme";\n        var themeKeyPu = "piggyup-app-theme";'
  );
}

if (!s.includes("staggerPuReveals")) {
  const staggerFn = `
        function staggerPuReveals() {
          if (!elPu) return;
          requestAnimationFrame(function () {
            var reds = elPu.querySelectorAll(".ox-reveal-on-scroll:not(.is-visible)");
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

if (!s.includes("pu-nav-toggle")) {
  s = s.replace(
    `          var plt = document.getElementById("pl-nav-toggle");
          var plm = document.getElementById("pl-mobile");
          if (plt && plm) {
            plt.setAttribute("aria-expanded", "false");
            plm.hidden = true;
          }
        }`,
    `          var plt = document.getElementById("pl-nav-toggle");
          var plm = document.getElementById("pl-mobile");
          if (plt && plm) {
            plt.setAttribute("aria-expanded", "false");
            plm.hidden = true;
          }
          var put = document.getElementById("pu-nav-toggle");
          var pum = document.getElementById("pu-mobile");
          if (put && pum) {
            put.setAttribute("aria-expanded", "false");
            pum.hidden = true;
          }
        }`
  );
}

if (!s.includes("syncPuThemeButton")) {
  s = s.replace(
    `        function syncPlThemeButton() {
          var btn = document.getElementById("pl-theme");
          if (!btn || !elPl) return;
          var dark = elPl.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`,
    `        function syncPlThemeButton() {
          var btn = document.getElementById("pl-theme");
          if (!btn || !elPl) return;
          var dark = elPl.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }

        function syncPuThemeButton() {
          var btn = document.getElementById("pu-theme");
          if (!btn || !elPu) return;
          var dark = elPu.getAttribute("data-theme") === "dark";
          btn.setAttribute("aria-label", dark ? LABEL_THEME_LIGHT : LABEL_THEME_DARK);
          btn.textContent = dark ? "☀" : "🌙";
        }`
  );
  s = s.replace(
    "          syncPlThemeButton();\n        }",
    "          syncPlThemeButton();\n          syncPuThemeButton();\n        }"
  );
}

if (!s.includes("if (elPu) elPu.setAttribute")) {
  s = s.replace(
    "          if (elPl) elPl.setAttribute(\"data-theme\", theme);",
    "          if (elPl) elPl.setAttribute(\"data-theme\", theme);\n          if (elPu) elPu.setAttribute(\"data-theme\", theme);"
  );
}

if (!s.includes("localStorage.removeItem(themeKeyPu)")) {
  s = s.replace(
    "            localStorage.removeItem(themeKeyPl);",
    "            localStorage.removeItem(themeKeyPl);\n            localStorage.removeItem(themeKeyPu);"
  );
  s = s.replace(
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl];",
    "            var keys = [themeKey, themeKeySp, themeKeyPm, themeKeySv, themeKeyBl, themeKeyPl, themeKeyPu];"
  );
}

const hidePu = "if (elPu) elPu.hidden = true;";
if (!s.includes(hidePu)) {
  s = s.replace(/if \(elPl\) elPl\.hidden = true;/g, (m) => m + "\n          " + hidePu);
}

if (!s.includes("elPu.querySelectorAll")) {
  s = s.replace(
    `          if (elPl) {
            elPl.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`,
    `          if (elPl) {
            elPl.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          if (elPu) {
            elPu.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
              if (!el.classList.contains("ox-hero")) {
                el.classList.remove("is-visible");
              }
            });
          }
          requestAnimationFrame(function () {`
  );
}

if (!s.includes("function showPiggyup")) {
  s = s.replace(
    `        function routeFromHash() {
          var h = location.hash;
          if (h === "#ox-month") {
            showOx();
          } else if (h === "#subping-app" || h === "#subping") {
            showSubping();
          } else if (h === "#pillmate" || h === "#pillmate-app") {
            showPillmate();
          } else if (h === "#savy-app" || h === "#savy") {
            showSavy();
          } else if (h === "#babylog-app" || h === "#babylog") {
            showBabylog();
          } else if (h === "#petlog-app" || h === "#petlog") {
            showPetlog();
          } else {
            showHome();
          }
        }`,
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

        function routeFromHash() {
          var h = location.hash;
          if (h === "#ox-month") {
            showOx();
          } else if (h === "#subping-app" || h === "#subping") {
            showSubping();
          } else if (h === "#pillmate" || h === "#pillmate-app") {
            showPillmate();
          } else if (h === "#savy-app" || h === "#savy") {
            showSavy();
          } else if (h === "#babylog-app" || h === "#babylog") {
            showBabylog();
          } else if (h === "#petlog-app" || h === "#petlog") {
            showPetlog();
          } else if (h === "#piggyup-app" || h === "#piggyup") {
            showPiggyup();
          } else {
            showHome();
          }
        }`
  );
}

if (!s.includes("var themeBtnPu = document.getElementById(\"pu-theme\")")) {
  s = s.replace(
    `        var plToggle = document.getElementById("pl-nav-toggle");
        var plMenu = document.getElementById("pl-mobile");
        if (plToggle && plMenu) {
          plToggle.addEventListener("click", function () {
            var open = plToggle.getAttribute("aria-expanded") === "true";
            plToggle.setAttribute("aria-expanded", String(!open));
            plMenu.hidden = open;
          });
          plMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              plToggle.setAttribute("aria-expanded", "false");
              plMenu.hidden = true;
            });
          });
        }

        function closeAllAppFlyouts() {`,
    `        var plToggle = document.getElementById("pl-nav-toggle");
        var plMenu = document.getElementById("pl-mobile");
        if (plToggle && plMenu) {
          plToggle.addEventListener("click", function () {
            var open = plToggle.getAttribute("aria-expanded") === "true";
            plToggle.setAttribute("aria-expanded", String(!open));
            plMenu.hidden = open;
          });
          plMenu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              plToggle.setAttribute("aria-expanded", "false");
              plMenu.hidden = true;
            });
          });
        }

        var themeBtnPu = document.getElementById("pu-theme");
        if (themeBtnPu && elPu) {
          syncPuThemeButton();
          themeBtnPu.addEventListener("click", function () {
            var next = elPu.getAttribute("data-theme") === "dark" ? "light" : "dark";
            persistUnifiedTheme(next);
          });
        }

        var puToggle = document.getElementById("pu-nav-toggle");
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

        function closeAllAppFlyouts() {`
  );
}

// showOx/showSubping/etc must hide elPu
for (const fn of ["showOx", "showSubping", "showPillmate", "showSavy", "showBabylog", "showPetlog"]) {
  const re = new RegExp(`function ${fn}\\(\\)[\\s\\S]*?if \\(elPl\\) elPl\\.hidden = true;\\n`);
  const m = s.match(re);
  if (m && !m[0].includes("elPu")) {
    s = s.replace(m[0], m[0].replace("if (elPl) elPl.hidden = true;\n", "if (elPl) elPl.hidden = true;\n          if (elPu) elPu.hidden = true;\n"));
  }
}

fs.writeFileSync(indexPath, s, "utf8");
console.log("patch-index-piggyup-app: OK");
