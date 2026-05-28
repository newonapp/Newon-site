/**
 * Custom accessible language picker (rounded panel + checkmark). Enhances native
 * selects marked [data-lang-select] once values are already set per page locale.
 */
(function () {
  var SEL = "[data-lang-select]";
  var idSeq = 0;

  function optsList(root) {
    return Array.prototype.slice.call(root.querySelectorAll(".lang-menu__option"));
  }

  function closeAllMenus() {
    document.querySelectorAll("[data-lang-menu-root].is-open").forEach(function (root) {
      closeMenu(root);
    });
  }

  function closeMenu(root) {
    var btn = root.querySelector(".lang-menu__btn");
    var panel = root.querySelector(".lang-menu__panel");
    if (!btn || !panel) return;
    root.classList.remove("is-open");
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  }

  function focusOption(root, mode) {
    var opts = optsList(root);
    if (!opts.length) return;
    var sel = root.querySelector(SEL);
    var val = sel && sel.value;
    if (mode === "last") {
      opts[opts.length - 1].focus();
      return;
    }
    if (mode === "selected") {
      for (var i = 0; i < opts.length; i++) {
        if (opts[i].getAttribute("data-lang-value") === val) {
          opts[i].focus();
          return;
        }
      }
    }
    opts[0].focus();
  }

  /** @param {'none'|'first'|'last'|'selected'|'keyboard-down'|'keyboard-up'} focusMode */
  function openMenu(root, focusMode) {
    var btn = root.querySelector(".lang-menu__btn");
    var panel = root.querySelector(".lang-menu__panel");
    if (!btn || !panel) return;
    closeAllMenus();
    root.classList.add("is-open");
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    syncSelectedMarks(root);
    if (focusMode && focusMode !== "none") {
      var m =
        focusMode === "keyboard-down"
          ? "first"
          : focusMode === "keyboard-up"
            ? "last"
            : focusMode;
      requestAnimationFrame(function () {
        focusOption(root, m);
      });
    }
  }

  function labelFor(sel) {
    var id = sel.id;
    if (!id) return null;
    return document.querySelector("label.visually-hidden[for=\"" + id + "\"]");
  }

  function syncBtnLabel(sel, btn) {
    var ix = sel.selectedIndex;
    var opt = sel.options[ix >= 0 ? ix : 0];
    btn.textContent = opt ? opt.textContent.replace(/^\u2713\s*/, "").trim() : "";
  }

  function syncSelectedMarks(root) {
    var sel = root.querySelector(SEL);
    if (!sel) return;
    var val = sel.value;
    root.querySelectorAll('[role="option"]').forEach(function (optBtn) {
      var v = optBtn.getAttribute("data-lang-value") || "";
      var isSel = v === val;
      optBtn.setAttribute("aria-selected", isSel ? "true" : "false");
      var mark = optBtn.querySelector(".lang-menu__check");
      if (mark) mark.hidden = !isSel;
    });
  }

  function navigateToLang(nextDir) {
    if (typeof newonApplyLangChoice === "function") {
      newonApplyLangChoice(nextDir);
    } else {
      try {
        localStorage.setItem("newon-lang-dir", nextDir);
      } catch (e) {}
      if (typeof newonBuildLangHref === "function") {
        location.href = newonBuildLangHref(nextDir);
      }
    }
  }

  function enhanceSelect(sel) {
    if (!sel.closest("body")) return;
    if (sel.closest("[data-lang-menu-root]")) return;
    if (sel.dataset.newonLangEnhanced === "1") return;

    sel.dataset.newonLangEnhanced = "1";
    var toolbar = sel.classList.contains("lang-select--toolbar");
    sel.classList.remove("lang-select", "lang-select--toolbar");
    sel.classList.add("visually-hidden");

    var ariaLabel =
      sel.getAttribute("aria-label") || sel.getAttribute("title") || undefined;

    var root = document.createElement("div");
    root.className = "lang-menu" + (toolbar ? " lang-menu--toolbar" : " lang-menu--legal");
    root.setAttribute("data-lang-menu-root", "");

    var anon = sel.id ? "" : "-" + String(++idSeq);
    var btnId = (sel.id || "lang-select-anon" + anon) + "__menu-trigger";
    var panelId = (sel.id || "lang-select-anon" + anon) + "__menu-listbox";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lang-menu__btn";
    btn.id = btnId;
    if (ariaLabel) btn.setAttribute("aria-label", ariaLabel);
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-controls", panelId);

    var panel = document.createElement("div");
    panel.id = panelId;
    panel.className = "lang-menu__panel";
    panel.setAttribute("role", "listbox");
    panel.hidden = true;
    panel.setAttribute("tabindex", "-1");

    sel.setAttribute("tabindex", "-1");

    var lf = labelFor(sel);
    if (lf) lf.setAttribute("for", btnId);

    for (var i = 0; i < sel.options.length; i++) {
      (function (value, labelText) {
        var row = document.createElement("button");
        row.type = "button";
        row.className = "lang-menu__option";
        row.setAttribute("role", "option");
        row.setAttribute("data-lang-value", value);

        var mark = document.createElement("span");
        mark.className = "lang-menu__check";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = "\u2713";

        row.appendChild(mark);

        var lbl = document.createElement("span");
        lbl.className = "lang-menu__label";
        lbl.textContent = labelText;

        row.appendChild(lbl);

        row.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (sel.value === value) {
            closeMenu(root);
            btn.focus();
            return;
          }
          sel.value = value;
          syncBtnLabel(sel, btn);
          closeMenu(root);
          navigateToLang(value);
        });

        panel.appendChild(row);
      })(
        sel.options[i].value,
        String(sel.options[i].textContent || "").replace(/^\u2713\s*/, "").trim()
      );
    }

    var parent = sel.parentNode;
    parent.insertBefore(root, sel);
    root.appendChild(sel);
    root.appendChild(btn);
    root.appendChild(panel);

    syncBtnLabel(sel, btn);
    syncSelectedMarks(root);

    sel.addEventListener("change", function () {
      syncBtnLabel(sel, btn);
      syncSelectedMarks(root);
      if (sel.value) navigateToLang(sel.value);
    });

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (root.classList.contains("is-open")) closeMenu(root);
      else openMenu(root, "none");
    });

    btn.addEventListener("keydown", function (e) {
      var open = root.classList.contains("is-open");

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (open) closeMenu(root);
        else openMenu(root, "selected");
        return;
      }

      if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        openMenu(root, e.key === "ArrowDown" ? "keyboard-down" : "keyboard-up");
        return;
      }

      if (open && e.key === "ArrowDown") {
        e.preventDefault();
        optsList(root)[0] && optsList(root)[0].focus();
      } else if (open && e.key === "ArrowUp") {
        e.preventDefault();
        var os = optsList(root);
        if (os.length) os[os.length - 1].focus();
      }
    });
  }

  function bindGlobalsOnce() {
    if (document.documentElement.dataset.newonLangMenusBound === "1") return;
    document.documentElement.dataset.newonLangMenusBound = "1";

    document.addEventListener(
      "click",
      function (e) {
        if (!e.target.closest("[data-lang-menu-root]")) closeAllMenus();
      },
      true
    );

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAllMenus();
        return;
      }

      var openRoot = document.querySelector("[data-lang-menu-root].is-open");
      if (!openRoot) return;

      if (e.key === "Tab") {
        closeAllMenus();
        return;
      }

      var act = document.activeElement;
      if (!act || !act.classList || !act.classList.contains("lang-menu__option")) return;

      var opts = optsList(openRoot);
      var i = opts.indexOf(act);
      if (i === -1) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        opts[(i + 1) % opts.length].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        opts[(i - 1 + opts.length) % opts.length].focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        opts[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        opts[opts.length - 1].focus();
      } else if (e.key === "PageDown") {
        e.preventDefault();
        opts[Math.min(i + 5, opts.length - 1)].focus();
      } else if (e.key === "PageUp") {
        e.preventDefault();
        opts[Math.max(i - 5, 0)].focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        act.click();
      }
    });
  }

  function initNewonLangMenus() {
    bindGlobalsOnce();
    document.querySelectorAll(SEL).forEach(enhanceSelect);
  }

  if (typeof globalThis !== "undefined") globalThis.initNewonLangMenus = initNewonLangMenus;
  initNewonLangMenus();
})();
