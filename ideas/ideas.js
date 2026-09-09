/**
 * Newon Ideas — type selection, forms, FormSubmit (same inbox as Business).
 */
(function () {
  var okRoot = document.getElementById("ni-success");
  if (okRoot) {
    bindSuccessPage();
    return;
  }

  var root = document.getElementById("ni-main");
  if (!root) return;

  var STORAGE_KEY = "newon-ideas-ok";
  var MAX_AGE_MS = 2 * 60 * 60 * 1000;
  var INBOX = "newon@newon.app";
  var ENDPOINT = "https://formsubmit.co/ajax/" + INBOX;
  var LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
  var TYPES = ["app", "feature", "message"];
  var MIN_MS = 1200;

  var i18n = {};
  try {
    i18n = JSON.parse(document.getElementById("ni-i18n").textContent || "{}");
  } catch (e) {}

  var mountedAt = Date.now();
  var currentType = null;
  var sending = false;

  function langDir() {
    var segs = (location.pathname || "")
      .replace(/\/index\.html$/i, "")
      .replace(/\/$/, "")
      .split("/")
      .filter(Boolean);
    var i;
    for (i = 0; i < segs.length; i++) {
      if (LANGS.indexOf(segs[i]) !== -1) return segs[i];
    }
    return root.getAttribute("data-lang") || "en";
  }

  function successHref() {
    return "/" + langDir() + "/ideas/success/";
  }

  function isLocalPreview() {
    var h = (location.hostname || "").toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "::1" || h === "[::1]";
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function normalizeType(raw) {
    if (!raw) return "";
    var s = String(raw).toLowerCase().replace(/_/g, " ").trim();
    if (s === "app" || s === "new app" || s === "new_app") return "app";
    if (s === "feature" || s === "feature request" || s === "feature_request") return "feature";
    if (s === "message" || s === "note to developer" || s === "note") return "message";
    return "";
  }

  function readParams() {
    try {
      return new URLSearchParams(location.search);
    } catch (e) {
      return new URLSearchParams();
    }
  }

  function setQuery(type, replace) {
    try {
      var u = new URL(location.href);
      if (type) u.searchParams.set("type", type);
      else u.searchParams.delete("type");
      var fn = replace ? "replaceState" : "pushState";
      history[fn](null, "", u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  function $(sel) {
    return root.querySelector(sel);
  }

  function failEl() {
    return document.getElementById("ni-fail");
  }

  function formWrap() {
    return document.getElementById("ni-form-wrap");
  }

  function typeButtons() {
    return root.querySelectorAll("[data-ni-type]");
  }

  function forms() {
    return root.querySelectorAll("[data-ni-form]");
  }

  function activeForm() {
    return root.querySelector('[data-ni-form="' + currentType + '"]');
  }

  function typeLabel(type) {
    if (type === "app") return i18n.typeApp || "NEW APP";
    if (type === "feature") return i18n.typeFeature || "FEATURE REQUEST";
    return i18n.typeMessage || "MESSAGE";
  }

  function submitLabel(type) {
    if (type === "app") return i18n.submitApp || "";
    if (type === "feature") return i18n.submitFeature || "";
    return i18n.submitMessage || "";
  }

  function formTitle(type) {
    if (type === "app") return i18n.appFormTitle || "";
    if (type === "feature") return i18n.featureFormTitle || "";
    return i18n.msgFormTitle || "";
  }

  function updateFormHead() {
    var crumb = document.getElementById("ni-form-crumb");
    var title = document.getElementById("ni-form-title");
    if (crumb) crumb.textContent = "NEWON IDEAS / " + typeLabel(currentType);
    if (title) title.textContent = formTitle(currentType);
  }

  function setTypeActive(type) {
    currentType = type;
    typeButtons().forEach(function (btn) {
      var on = btn.getAttribute("data-ni-type") === type;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    forms().forEach(function (f) {
      f.hidden = f.getAttribute("data-ni-form") !== type;
    });
    var wrap = formWrap();
    if (wrap) wrap.hidden = !type;
    updateFormHead();
    if (type) setQuery(type, false);
  }

  function scrollToForm() {
    var wrap = formWrap();
    if (!wrap || wrap.hidden) return;
    try {
      wrap.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      wrap.scrollIntoView(true);
    }
  }

  function openType(type, scroll) {
    if (TYPES.indexOf(type) === -1) return;
    setTypeActive(type);
    if (scroll !== false) scrollToForm();
  }

  function resetToChoose() {
    currentType = null;
    typeButtons().forEach(function (btn) {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-pressed", "false");
    });
    forms().forEach(function (f) {
      f.hidden = true;
    });
    var wrap = formWrap();
    if (wrap) wrap.hidden = true;
    setQuery("", true);
    var choose = document.getElementById("ni-choose");
    if (choose) {
      try {
        choose.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e) {
        choose.scrollIntoView(true);
      }
    }
  }

  function clearFieldError(field) {
    if (!field) return;
    field.classList.remove("is-error");
    var input = field.querySelector("input, select, textarea");
    if (input) input.removeAttribute("aria-invalid");
  }

  function setFieldError(field, msg) {
    if (!field) return;
    field.classList.add("is-error");
    var err = field.querySelector(".ni-field-error");
    if (err) err.textContent = msg || i18n.errRequired || "";
    var input = field.querySelector("input, select, textarea");
    if (input) {
      input.setAttribute("aria-invalid", "true");
      input.focus();
    }
  }

  function validateForm(form) {
    var firstBad = null;
    form.querySelectorAll("[data-required]").forEach(function (el) {
      var wrap = el.closest(".ni-field");
      clearFieldError(wrap);
      var val = String(el.value || "").trim();
      var need = el.getAttribute("data-required") === "1";
      if (el.type === "email" && need && val && !isEmail(val)) {
        if (!firstBad) firstBad = { wrap: wrap, msg: i18n.errEmail || "" };
        return;
      }
      if (need && !val) {
        if (!firstBad) firstBad = { wrap: wrap, msg: i18n.errRequired || "" };
      }
    });
    form.querySelectorAll("input[type='email']").forEach(function (el) {
      if (el.getAttribute("data-required") === "1") return;
      var wrap = el.closest(".ni-field");
      if (!wrap || wrap.hidden) return;
      var val = String(el.value || "").trim();
      if (val && !isEmail(val)) {
        clearFieldError(wrap);
        if (!firstBad) firstBad = { wrap: wrap, msg: i18n.errEmail || "" };
      }
    });
    if (firstBad) {
      setFieldError(firstBad.wrap, firstBad.msg);
      return false;
    }
    return true;
  }

  function collectPayload(form) {
    var type = form.getAttribute("data-ni-form");
    var internal =
      type === "app" ? "new_app" : type === "feature" ? "feature_request" : "message";
    var payload = {
      _subject: (i18n.formSubject || "Newon Ideas") + " — " + typeLabel(type),
      _template: "table",
      _captcha: "false",
      _url: String(location.href || "").split("#")[0],
      idea_type: internal,
    };
    Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (field) {
      if (!field.name || field.type === "submit" || field.name === "_honey") return;
      if (field.type === "checkbox" && !field.checked) return;
      if (field.closest("[hidden]")) return;
      var v = String(field.value || "").trim();
      if (!v) return;
      payload[field.name] = v;
    });
    var params = readParams();
    var source = params.get("source") || "";
    var news = params.get("news") || "";
    if (source) payload.source = source;
    if (news) payload.news_id = news;
    var emailField = form.querySelector("[name='email']");
    if (emailField && emailField.value.trim()) payload._replyto = emailField.value.trim();
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
        if (!ok) throw new Error("ideas-failed");
      })
      .finally(function () {
        clearTimeout(timer);
      });
  }

  function send(payload) {
    return postFormSubmit(payload).catch(function () {
      if (isLocalPreview()) return;
      throw new Error("ideas-failed");
    });
  }

  function writeRecord(data) {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: 1, ts: Date.now(), type: data.type || "" })
      );
    } catch (e) {}
  }

  function mailtoHref(payload) {
    var lines = [];
    Object.keys(payload).forEach(function (k) {
      if (k.charAt(0) === "_") return;
      lines.push(k + ": " + payload[k]);
    });
    return (
      "mailto:" +
      INBOX +
      "?subject=" +
      encodeURIComponent(payload._subject || "Newon Ideas") +
      "&body=" +
      encodeURIComponent(lines.join("\n"))
    );
  }

  function setBusy(form, btn, busy) {
    form.setAttribute("data-busy", busy ? "1" : "0");
    if (!btn) return;
    btn.disabled = busy;
    btn.setAttribute("aria-busy", busy ? "true" : "false");
    btn.textContent = busy ? i18n.submitting || "…" : submitLabel(form.getAttribute("data-ni-form"));
  }

  function showFail(mailHref) {
    var fail = failEl();
    if (!fail) return;
    if (mailHref) {
      var a = fail.querySelector("a");
      if (a) a.href = mailHref;
    }
    fail.classList.add("is-visible");
    fail.removeAttribute("hidden");
    try {
      fail.focus();
    } catch (e) {}
  }

  function bindReplyToggle() {
    var toggle = document.getElementById("ni-reply-toggle");
    var emailWrap = document.getElementById("ni-reply-email-wrap");
    var email = document.getElementById("ni-msg-email");
    if (!toggle || !emailWrap) return;
    function sync() {
      var on = toggle.checked;
      emailWrap.hidden = !on;
      if (email) email.setAttribute("data-required", on ? "1" : "0");
      if (!on) clearFieldError(emailWrap);
    }
    toggle.addEventListener("change", sync);
    sync();
  }

  function bindForms() {
    forms().forEach(function (form) {
      form.addEventListener("input", function (e) {
        var wrap = e.target.closest(".ni-field");
        if (wrap) clearFieldError(wrap);
      });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (sending || form.getAttribute("data-busy") === "1") return;
        var fail = failEl();
        if (fail) {
          fail.classList.remove("is-visible");
          fail.setAttribute("hidden", "");
        }
        var honey = form.querySelector("[name='_honey']");
        if (honey && String(honey.value || "").trim()) return;
        if (Date.now() - mountedAt < MIN_MS) return;
        if (!validateForm(form)) return;

        var btn = form.querySelector("[type='submit']");
        sending = true;
        setBusy(form, btn, true);
        var payload = collectPayload(form);
        send(payload)
          .then(function () {
            writeRecord({ type: form.getAttribute("data-ni-form") });
            location.replace(successHref());
          })
          .catch(function () {
            sending = false;
            setBusy(form, btn, false);
            showFail(mailtoHref(payload));
          });
      });
    });
  }

  function preselectProduct() {
    var params = readParams();
    var slug = (params.get("product") || "").trim().toLowerCase();
    if (!slug) {
      var appName = (params.get("app") || "").trim();
      if (appName) {
        var sel = document.getElementById("ni-feature-product");
        if (sel) {
          var opts = sel.options;
          var i;
          for (i = 0; i < opts.length; i++) {
            if (opts[i].textContent.trim().toLowerCase() === appName.toLowerCase()) {
              sel.value = opts[i].value;
              break;
            }
          }
        }
      }
      return;
    }
    var select = document.getElementById("ni-feature-product");
    if (select && select.querySelector('option[value="' + slug + '"]')) select.value = slug;
  }

  function initFromUrl() {
    var params = readParams();
    var type = normalizeType(params.get("type"));
    preselectProduct();
    if (type) openType(type, true);
  }

  typeButtons().forEach(function (btn) {
    btn.addEventListener("click", function () {
      openType(btn.getAttribute("data-ni-type"), true);
    });
  });

  var backBtn = document.getElementById("ni-form-back");
  if (backBtn) {
    backBtn.addEventListener("click", function (e) {
      e.preventDefault();
      resetToChoose();
    });
  }

  window.addEventListener("popstate", function () {
    var type = normalizeType(readParams().get("type"));
    if (type) setTypeActive(type);
    else resetToChoose();
  });

  bindReplyToggle();
  bindForms();
  initFromUrl();

  function bindSuccessPage() {
    var STORAGE_KEY = "newon-ideas-ok";
    var MAX_AGE_MS = 2 * 60 * 60 * 1000;

    function readRecord() {
      try {
        var raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        var data = JSON.parse(raw);
        if (!data || data.v !== 1 || !data.ts) return null;
        if (Date.now() - data.ts > MAX_AGE_MS) {
          sessionStorage.removeItem(STORAGE_KEY);
          return null;
        }
        return data;
      } catch (e) {
        return null;
      }
    }

    var record = readRecord();
    var ok = document.getElementById("ni-ok");
    var empty = document.getElementById("ni-ok-empty");
    if (!record) {
      if (ok) ok.hidden = true;
      if (empty) empty.hidden = false;
    } else {
      if (empty) empty.hidden = true;
      if (ok) ok.hidden = false;
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
})();
