/**
 * Newon Company hub — filters, forms, reveal, copy email.
 */
(function () {
  var root = document.getElementById("co-main");
  if (!root) return;

  var INBOX = "newon@newon.app";
  var ENDPOINT = "https://formsubmit.co/ajax/" + INBOX;
  var IDEA_DRAFT_KEY = "newon-company-idea-draft";
  var CONTACT_TYPES = ["project", "partnership", "business", "media", "support", "other"];
  var MIN_MS = 900;

  var i18n = {};
  try {
    var i18nEl = document.getElementById("co-i18n");
    i18n = JSON.parse((i18nEl && i18nEl.textContent) || "{}") || {};
  } catch (e) {
    i18n = {};
  }

  var mountedAt = Date.now();
  var sending = false;

  function t(key, fallback) {
    var v = i18n[key];
    return v == null || v === "" ? fallback : v;
  }

  function isLocalPreview() {
    var h = (location.hostname || "").toLowerCase();
    return (
      h === "localhost" ||
      h === "127.0.0.1" ||
      h === "0.0.0.0" ||
      h === "::1" ||
      h === "[::1]"
    );
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function isUrl(v) {
    if (!v) return true;
    try {
      var u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  function readParams() {
    try {
      return new URLSearchParams(location.search);
    } catch (e) {
      return new URLSearchParams();
    }
  }

  function reduceMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  /* ── Reveal ── */
  function initReveal() {
    var nodes = document.querySelectorAll("[data-co-reveal]");
    if (!nodes.length) return;

    if (reduceMotion() || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, function (el) {
        el.classList.add("is-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    Array.prototype.forEach.call(nodes, function (el) {
      io.observe(el);
    });
  }

  /* ── Filters (portfolio + news) ── */
  function initFilters() {
    var buttons = root.querySelectorAll("[data-co-filter]");
    if (!buttons.length) return;

    var items = root.querySelectorAll("[data-co-filter-item]");
    var empty = root.querySelector("[data-co-filter-empty]");

    function apply(cat) {
      var visible = 0;
      Array.prototype.forEach.call(items, function (item) {
        var itemCat = (item.getAttribute("data-co-cat") || "").toLowerCase();
        var show = cat === "all" || itemCat === cat;
        item.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) {
        empty.hidden = visible > 0;
        if (!visible && i18n.emptyFilter) empty.textContent = i18n.emptyFilter;
      }
    }

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        var cat = (btn.getAttribute("data-co-filter") || "all").toLowerCase();
        Array.prototype.forEach.call(buttons, function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          if (b.hasAttribute("aria-pressed")) {
            b.setAttribute("aria-pressed", on ? "true" : "false");
          }
        });
        apply(cat);
      });
    });
  }

  /* ── News list / timeline view ── */
  function initNewsView() {
    var hub = root.querySelector("[data-co-news-hub]");
    if (!hub) return;

    var toggles = hub.querySelectorAll("[data-co-view]");
    var panels = hub.querySelectorAll("[data-co-panel]");
    if (!toggles.length || !panels.length) return;

    function setView(view) {
      Array.prototype.forEach.call(toggles, function (btn) {
        var on = btn.getAttribute("data-co-view") === view;
        btn.classList.toggle("is-active", on);
        if (btn.hasAttribute("aria-pressed")) {
          btn.setAttribute("aria-pressed", on ? "true" : "false");
        }
      });
      Array.prototype.forEach.call(panels, function (panel) {
        panel.hidden = panel.getAttribute("data-co-panel") !== view;
      });
    }

    Array.prototype.forEach.call(toggles, function (btn) {
      btn.addEventListener("click", function () {
        setView(btn.getAttribute("data-co-view") || "list");
      });
    });
  }

  /* ── Copy email ── */
  function initCopyEmail() {
    var buttons = root.querySelectorAll("[data-co-copy-email]");
    if (!buttons.length) return;

    Array.prototype.forEach.call(buttons, function (btn) {
      var original = btn.textContent;
      btn.addEventListener("click", function () {
        var email = btn.getAttribute("data-co-copy-email") || INBOX;
        var doneLabel = t("copied", "COPIED");
        var idleLabel = t("copyEmail", original || "COPY EMAIL");

        function markCopied() {
          btn.textContent = doneLabel;
          window.setTimeout(function () {
            btn.textContent = idleLabel;
          }, 1600);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(markCopied).catch(function () {
            fallbackCopy(email, markCopied);
          });
        } else {
          fallbackCopy(email, markCopied);
        }
      });
    });
  }

  function fallbackCopy(text, onOk) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      if (onOk) onOk();
    } catch (e) {}
  }

  /* ── Form helpers ── */
  function showError(form, msg) {
    var el = form.querySelector("[data-co-form-error]");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  function clearError(form) {
    showError(form, "");
    Array.prototype.forEach.call(form.querySelectorAll(".is-error"), function (el) {
      el.classList.remove("is-error");
      el.removeAttribute("aria-invalid");
    });
  }

  function markError(el) {
    if (!el) return;
    el.classList.add("is-error");
    el.setAttribute("aria-invalid", "true");
  }

  function setBusy(form, busy) {
    var btn = form.querySelector("[data-co-submit]");
    form.setAttribute("data-busy", busy ? "1" : "0");
    if (!btn) return;
    btn.disabled = !!busy;
    btn.setAttribute("aria-busy", busy ? "true" : "false");
    if (busy) {
      btn.textContent = t("submitting", "SUBMITTING...");
    } else {
      btn.textContent = t("submit", btn.getAttribute("data-co-idle") || btn.textContent);
    }
  }

  function showSuccess(form) {
    form.classList.add("is-sent");
    var box = form.querySelector("[data-co-form-success]");
    if (!box) return;
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    var title = box.querySelector(".co-form__success-title");
    var body = box.querySelector("p");
    if (title && i18n.successTitle) title.textContent = i18n.successTitle;
    if (body && i18n.successBody) body.textContent = i18n.successBody;
    box.hidden = false;
    try {
      box.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "nearest" });
    } catch (e) {}
  }

  function collectFields(form) {
    var payload = {};
    Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (field) {
      if (!field.name || field.type === "submit") return;
      if (field.name === "_honey") return;
      if (field.closest("[hidden]")) return;
      if (field.type === "checkbox") {
        if (!field.checked) return;
        if (payload[field.name]) {
          payload[field.name] = String(payload[field.name]) + ", " + field.value;
        } else {
          payload[field.name] = field.value;
        }
        return;
      }
      if (field.type === "radio") {
        if (!field.checked) return;
        payload[field.name] = field.value;
        return;
      }
      var v = String(field.value || "").trim();
      if (!v && field.name.charAt(0) !== "_") return;
      payload[field.name] = field.name.charAt(0) === "_" ? field.value : v;
    });
    return payload;
  }

  function postFormSubmit(payload) {
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, 15000);
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined,
    })
      .then(function (res) {
        return res.json().then(
          function (data) {
            return { res: res, data: data };
          },
          function () {
            return { res: res, data: null };
          }
        );
      })
      .then(function (out) {
        var data = out.data || {};
        var flag = data.success;
        var ok = out.res.ok && (flag === true || flag === "true");
        if (!ok) throw new Error("co-failed");
      })
      .finally(function () {
        clearTimeout(timer);
      });
  }

  function sendPayload(payload) {
    return postFormSubmit(payload).catch(function () {
      if (isLocalPreview()) return;
      throw new Error("co-failed");
    });
  }

  /* ── Idea form ── */
  function initIdeaForm() {
    var form = document.getElementById("co-idea-form");
    if (!form) return;

    var submitBtn = form.querySelector("[data-co-submit]");
    if (submitBtn && !submitBtn.getAttribute("data-co-idle")) {
      submitBtn.setAttribute("data-co-idle", submitBtn.textContent);
    }

    restoreIdeaDraft(form);
    form.addEventListener("input", function () {
      clearError(form);
      saveIdeaDraft(form);
    });
    form.addEventListener("change", function () {
      saveIdeaDraft(form);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending || form.getAttribute("data-busy") === "1") return;

      clearError(form);
      var honey = form.querySelector("[name='_honey']");
      if (honey && String(honey.value || "").trim()) return;
      if (Date.now() - mountedAt < MIN_MS) return;

      var title = form.querySelector("[name='title']");
      var problem = form.querySelector("[name='problem']");
      var email = form.querySelector("[name='email']");
      var link = form.querySelector("[name='link']");
      var legal = form.querySelector("[name='legal']");

      if (!title || !String(title.value || "").trim() || !problem || !String(problem.value || "").trim()) {
        if (title && !String(title.value || "").trim()) markError(title);
        if (problem && !String(problem.value || "").trim()) markError(problem);
        showError(form, t("errRequired", "Please fill in the required fields."));
        return;
      }

      var emailVal = email ? String(email.value || "").trim() : "";
      if (emailVal && !isEmail(emailVal)) {
        if (email) markError(email);
        showError(form, t("errEmail", "Please check the email format."));
        return;
      }

      var linkVal = link ? String(link.value || "").trim() : "";
      if (linkVal && !isUrl(linkVal)) {
        if (link) markError(link);
        showError(form, t("errUrl", "Please check the URL format."));
        return;
      }

      if (legal && !legal.checked) {
        var check = legal.closest(".co-check");
        if (check) markError(check);
        showError(form, t("errLegal", "Please confirm the notice before submitting."));
        return;
      }

      var payload = collectFields(form);
      payload._subject = payload._subject || "Newon Idea";
      payload._template = payload._template || "table";
      payload._captcha = "false";
      payload._url = String(location.href || "").split("#")[0];
      if (emailVal) payload._replyto = emailVal;

      sending = true;
      setBusy(form, true);
      sendPayload(payload)
        .then(function () {
          try {
            localStorage.removeItem(IDEA_DRAFT_KEY);
          } catch (err) {}
          showSuccess(form);
        })
        .catch(function () {
          sending = false;
          setBusy(form, false);
          showError(
            form,
            t("errSend", "Could not send. Please try again or email newon@newon.app.")
          );
        });
    });
  }

  function ideaDraftFields(form) {
    var data = { v: 1 };
    Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (field) {
      if (!field.name || field.name.charAt(0) === "_" || field.name === "legal") return;
      if (field.type === "checkbox" || field.type === "radio") {
        if (!data[field.name]) data[field.name] = [];
        if (field.checked) data[field.name].push(field.value);
        return;
      }
      data[field.name] = field.value;
    });
    return data;
  }

  function saveIdeaDraft(form) {
    try {
      localStorage.setItem(IDEA_DRAFT_KEY, JSON.stringify(ideaDraftFields(form)));
    } catch (e) {}
  }

  function restoreIdeaDraft(form) {
    var raw;
    try {
      raw = localStorage.getItem(IDEA_DRAFT_KEY);
    } catch (e) {
      return;
    }
    if (!raw) return;
    var data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }
    if (!data || data.v !== 1) return;

    Object.keys(data).forEach(function (name) {
      if (name === "v") return;
      var fields = form.querySelectorAll('[name="' + name + '"]');
      if (!fields.length) return;
      var val = data[name];
      Array.prototype.forEach.call(fields, function (field) {
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = Array.isArray(val) ? val.indexOf(field.value) !== -1 : field.value === val;
        } else {
          field.value = val == null ? "" : val;
        }
      });
    });
  }

  /* ── Contact form ── */
  function initContactForm() {
    var form = document.getElementById("co-contact-form");
    if (!form) return;

    var typeInput = document.getElementById("co-contact-type");
    var typeButtons = root.querySelectorAll("[data-co-type]");
    var whenGroups = form.querySelectorAll("[data-co-when]");
    var submitBtn = form.querySelector("[data-co-submit]");
    if (submitBtn && !submitBtn.getAttribute("data-co-idle")) {
      submitBtn.setAttribute("data-co-idle", submitBtn.textContent);
    }

    function setType(type, updateUrl) {
      if (CONTACT_TYPES.indexOf(type) === -1) type = "project";
      Array.prototype.forEach.call(typeButtons, function (btn) {
        var on = btn.getAttribute("data-co-type") === type;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      Array.prototype.forEach.call(whenGroups, function (group) {
        var when = group.getAttribute("data-co-when");
        group.hidden = when !== type;
      });
      if (typeInput) typeInput.value = type;
      if (updateUrl) {
        try {
          var u = new URL(location.href);
          u.searchParams.set("type", type);
          history.replaceState(null, "", u.pathname + u.search + u.hash);
        } catch (e) {}
      }
    }

    Array.prototype.forEach.call(typeButtons, function (btn) {
      btn.addEventListener("click", function () {
        setType(btn.getAttribute("data-co-type") || "project", true);
      });
    });

    var params = readParams();
    var fromUrl = (params.get("type") || "").toLowerCase().trim();
    setType(CONTACT_TYPES.indexOf(fromUrl) !== -1 ? fromUrl : "project", false);

    form.addEventListener("input", function () {
      clearError(form);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending || form.getAttribute("data-busy") === "1") return;

      clearError(form);
      var honey = form.querySelector("[name='_honey']");
      if (honey && String(honey.value || "").trim()) return;
      if (Date.now() - mountedAt < MIN_MS) return;

      var name = form.querySelector("[name='name']");
      var email = form.querySelector("[name='email']");
      var subject = form.querySelector("[name='subject']");
      var message = form.querySelector("[name='message']");
      var url = form.querySelector("[name='url']");

      var missing = false;
      [name, email, subject, message].forEach(function (field) {
        if (!field || !String(field.value || "").trim()) {
          missing = true;
          if (field) markError(field);
        }
      });
      if (missing) {
        showError(form, t("errRequired", "Please fill in the required fields."));
        return;
      }

      var emailVal = String(email.value || "").trim();
      if (!isEmail(emailVal)) {
        markError(email);
        showError(form, t("errEmail", "Please check the email format."));
        return;
      }

      var urlVal = url ? String(url.value || "").trim() : "";
      if (urlVal && !isUrl(urlVal)) {
        if (url) markError(url);
        showError(form, t("errUrl", "Please check the URL format."));
        return;
      }

      var contactType = typeInput ? typeInput.value : "project";
      var payload = collectFields(form);
      payload._subject = "Newon Contact — " + String(contactType).toUpperCase();
      payload._template = "table";
      payload._captcha = "false";
      payload._url = String(location.href || "").split("#")[0];
      payload._replyto = emailVal;
      payload.contact_type = contactType;

      sending = true;
      setBusy(form, true);
      sendPayload(payload)
        .then(function () {
          showSuccess(form);
        })
        .catch(function () {
          sending = false;
          setBusy(form, false);
          showError(
            form,
            t("errSend", "Could not send. Please try again or email newon@newon.app.")
          );
        });
    });
  }

  initReveal();
  initFilters();
  initNewsView();
  initCopyEmail();
  initIdeaForm();
  initContactForm();
})();
