#!/usr/bin/env node
/** Wire GoalUp / CountUp / Newon+ / Noting theme toggles + mobile menus (idempotent). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const indexPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "templates", "index.html");
let s = fs.readFileSync(indexPath, "utf8");

if (!s.includes('getElementById("gu-nav-toggle")')) {
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
          var cut = document.getElementById("cu-nav-toggle");
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
          var ntt = document.getElementById("nt-nav-toggle");
          var ntm = document.getElementById("nt-mobile");
          if (ntt && ntm) {
            ntt.setAttribute("aria-expanded", "false");
            ntm.hidden = true;
          }
        }`
  );
}

const handlerBlock = `
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
`;

if (!s.includes("themeBtnGu")) {
  s = s.replace(/\n\s*function closeAllAppFlyouts\(\)/, `${handlerBlock}\n        function closeAllAppFlyouts()`);
}

fs.writeFileSync(indexPath, s, "utf8");
console.log("patch-index-late-app-js: OK");
