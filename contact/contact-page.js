/**
 * NEWON unified Contact page (/{lang}/contact/): section scroll, category → form type, persona fields,
 * validation, FormSubmit delivery, copy email, FAQ accordion.
 *
 * Delivery: the same FormSubmit AJAX endpoint the site's other forms use (newon@newon.app).
 * A success message is shown only after FormSubmit confirms success (HTTP 2xx and success === true/"true").
 * Every other outcome — network error, timeout, non-2xx, success:false, local preview — is a failure.
 */
(function () {
  "use strict";
  var page = document.querySelector("[data-ct-page]");
  if (!page) return;

  var cfg = {};
  try {
    cfg = JSON.parse((document.getElementById("ct-config") || {}).textContent || "{}") || {};
  } catch (err) {
    cfg = {};
  }
  var T = cfg.t || {};
  var ENDPOINT = cfg.endpoint || "https://formsubmit.co/ajax/newon@newon.app";
  var INBOX = cfg.inbox || "newon@newon.app";
  var MSG_MIN = cfg.messageMin || 10;
  var MSG_MAX = cfg.messageMax || 3000;
  var MIN_FILL_MS = 3000;
  var TIMEOUT_MS = 15000;
  var loadedAt = Date.now();

  function reduced() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (err) {
      return false;
    }
  }

  /* ── hero reveal (film-keep.js also sets is-ready on the film host) ── */
  var hero = page.querySelector(".ct-hero");
  if (hero) {
    requestAnimationFrame(function () {
      hero.classList.add("is-ready");
    });
  }

  /* ── reveal on scroll (home np-reveal) ── */
  var reveals = page.querySelectorAll(".np-reveal");
  if (reduced() || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    Array.prototype.forEach.call(reveals, function (el, i) {
      el.style.transitionDelay = (i % 3) * 80 + "ms";
      io.observe(el);
    });
  }

  /* ── smooth scroll to sections ── */
  function scrollToSection(id, focusEl) {
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
    var f = focusEl || target.querySelector("h2[tabindex]") || target;
    if (f && typeof f.focus === "function") {
      if (!f.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(f.tagName)) f.setAttribute("tabindex", "-1");
      try {
        f.focus({ preventScroll: true });
      } catch (err) {
        f.focus();
      }
    }
  }

  Array.prototype.forEach.call(page.querySelectorAll("a[data-ct-scroll]"), function (a) {
    a.addEventListener("click", function (ev) {
      var id = (a.getAttribute("href") || "").replace(/^.*#/, "");
      if (!id || !document.getElementById(id)) return;
      ev.preventDefault();
      scrollToSection(id);
    });
  });

  /* ── form ── */
  var form = document.getElementById("ct-form");
  if (!form) return;
  var typeSel = document.getElementById("ct-type");
  var platformSel = document.getElementById("ct-platform");
  var orgBox = form.querySelector("[data-ct-org]");
  var alertBox = document.getElementById("ct-form-alert");
  var submitBtn = form.querySelector("[data-ct-submit]");
  var submitLabel = form.querySelector("[data-ct-submit-label]");
  var statusEl = form.querySelector("[data-ct-status]");
  var successBox = page.querySelector("[data-ct-success]");
  var failBox = page.querySelector("[data-ct-fail]");
  var mailtoLink = page.querySelector("[data-ct-mailto]");
  var message = document.getElementById("ct-message");
  var countN = form.querySelector("[data-ct-count-n]");
  var countBox = form.querySelector("[data-ct-count]");
  var personaTouched = false;
  var sending = false;
  var aliases = cfg.aliases || {};
  var orgCats = cfg.orgCategories || [];

  function persona() {
    var r = form.querySelector('input[name="persona"]:checked');
    return r ? r.value : "personal";
  }

  function setPersona(value) {
    var r = form.querySelector('input[name="persona"][value="' + value + '"]');
    if (r) r.checked = true;
    syncPersona();
  }

  function syncPersona() {
    var org = persona() === "organization";
    if (orgBox) {
      orgBox.hidden = !org;
      if (!org) {
        Array.prototype.forEach.call(orgBox.querySelectorAll("input, select"), clearFieldError);
      }
    }
  }

  Array.prototype.forEach.call(form.querySelectorAll('input[name="persona"]'), function (r) {
    r.addEventListener("change", function () {
      personaTouched = true;
      syncPersona();
    });
  });

  function markPicked(type) {
    Array.prototype.forEach.call(page.querySelectorAll("[data-ct-cat]"), function (card) {
      card.classList.toggle("is-picked", card.getAttribute("data-ct-cat") === type);
    });
  }

  function setType(type, opts) {
    opts = opts || {};
    if (!typeSel) return false;
    var ok = Array.prototype.some.call(typeSel.options, function (o) {
      return o.value && o.value === type;
    });
    if (!ok) return false;
    typeSel.value = type;
    clearFieldError(typeSel);
    markPicked(type);
    if (!personaTouched) setPersona(orgCats.indexOf(type) !== -1 ? "organization" : "personal");
    if (opts.updateUrl) {
      try {
        var u = new URL(location.href);
        u.searchParams.set("type", type);
        history.replaceState(history.state, "", u.pathname + u.search + u.hash);
      } catch (err) {
        /* ignore */
      }
    }
    return true;
  }

  if (typeSel) {
    typeSel.addEventListener("change", function () {
      markPicked(typeSel.value);
      if (typeSel.value && !personaTouched) setPersona(orgCats.indexOf(typeSel.value) !== -1 ? "organization" : "personal");
    });
  }

  Array.prototype.forEach.call(page.querySelectorAll("[data-ct-pick]"), function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      var type = a.getAttribute("data-ct-pick");
      setType(type, { updateUrl: true });
      showForm();
      scrollToSection("contact-form", typeSel);
    });
  });

  /* ?type= (new ids and the older values that already link here) and ?platform= */
  (function fromUrl() {
    var params;
    try {
      params = new URLSearchParams(location.search);
    } catch (err) {
      return;
    }
    var raw = String(params.get("type") || "").toLowerCase().trim();
    var mapped = Object.prototype.hasOwnProperty.call(aliases, raw) ? aliases[raw] : "";
    if (mapped) setType(mapped);
    var plat = String(params.get("platform") || "").toLowerCase().trim();
    if (plat && platformSel && (cfg.platforms || []).indexOf(plat) !== -1) platformSel.value = plat;
  })();

  /* message counter */
  function updateCount() {
    if (!message || !countN) return;
    var n = message.value.length;
    countN.textContent = n.toLocaleString("en-US");
    if (countBox) countBox.classList.toggle("is-over", n > MSG_MAX);
  }
  if (message) {
    message.addEventListener("input", updateCount);
    updateCount();
  }

  /* ── validation ── */
  function errEl(field) {
    return document.getElementById(field.id + "-err");
  }

  function setDescribedBy(field, withErr) {
    var base = field.getAttribute("data-ct-desc") || "";
    var ids = base.split(/\s+/).filter(Boolean);
    if (withErr) ids.push(field.id + "-err");
    if (ids.length) field.setAttribute("aria-describedby", ids.join(" "));
    else field.removeAttribute("aria-describedby");
  }

  function setFieldError(field, msg) {
    var el = errEl(field);
    field.setAttribute("aria-invalid", "true");
    if (el) {
      el.textContent = msg;
      el.hidden = false;
    }
    setDescribedBy(field, true);
  }

  function clearFieldError(field) {
    if (!field || !field.id) return;
    var el = errEl(field);
    field.removeAttribute("aria-invalid");
    if (el) {
      el.textContent = "";
      el.hidden = true;
    }
    setDescribedBy(field, false);
  }

  function val(name) {
    var f = form.elements[name];
    return f && typeof f.value === "string" ? f.value.trim() : "";
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v) && v.length <= 160;
  }

  function isHttpUrl(v) {
    try {
      var u = new URL(v);
      return (u.protocol === "http:" || u.protocol === "https:") && !!u.hostname && u.hostname.indexOf(".") !== -1;
    } catch (err) {
      return false;
    }
  }

  function emptyUrl(v) {
    return !v || /^https?:\/{0,2}$/i.test(v);
  }

  function checkField(field) {
    if (!field || field.closest("[hidden]")) return "";
    var name = field.name;
    var v = field.type === "checkbox" ? (field.checked ? "yes" : "") : String(field.value || "").trim();
    if (name === "inquiry_type") return v ? "" : T.errType || T.errRequired;
    if (name === "privacy_consent") return v ? "" : T.errConsent;
    if (field.required && !v) return T.errRequired;
    if (!v) return "";
    if (name === "email" && !isEmail(v)) return T.errEmail;
    if ((name === "website" || name === "reference_url") && !emptyUrl(v) && !isHttpUrl(v)) return T.errUrl;
    if (name === "phone" && !/^[0-9+()\-\s]{7,20}$/.test(v)) return T.errPhone;
    if (name === "message") {
      if (v.length < MSG_MIN) return T.errMessageMin;
      if (field.value.length > MSG_MAX) return T.errMessageMax;
    }
    return "";
  }

  var CHECKED = ["inquiry_type", "organization", "business_purpose", "website", "name", "email", "phone", "platform", "subject", "message", "reference_url", "privacy_consent"];

  function validateAll() {
    var first = null;
    CHECKED.forEach(function (name) {
      var field = form.elements[name];
      if (!field || !field.id) return;
      var msg = checkField(field);
      if (msg) {
        setFieldError(field, msg);
        if (!first) first = field;
      } else {
        clearFieldError(field);
      }
    });
    return first;
  }

  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.textContent = msg || "";
    alertBox.hidden = !msg;
  }

  form.addEventListener("input", function (ev) {
    var f = ev.target;
    if (f && f.getAttribute && f.getAttribute("aria-invalid") === "true" && !checkField(f)) clearFieldError(f);
  });
  form.addEventListener("change", function (ev) {
    var f = ev.target;
    if (f && f.getAttribute && f.getAttribute("aria-invalid") === "true" && !checkField(f)) clearFieldError(f);
  });
  form.addEventListener("focusout", function (ev) {
    var f = ev.target;
    if (!f || !f.name || CHECKED.indexOf(f.name) === -1) return;
    if (f.getAttribute("aria-invalid") === "true") {
      var msg = checkField(f);
      if (msg) setFieldError(f, msg);
      else clearFieldError(f);
    }
  });

  /* ── payload: only the form fields + page / lang / submittedAt ── */
  function optionText(sel) {
    if (!sel || !sel.value) return "";
    var o = sel.options[sel.selectedIndex];
    return o ? o.text : sel.value;
  }

  function buildPayload() {
    var org = persona() === "organization";
    var personaInput = form.querySelector('input[name="persona"]:checked');
    var personaText = personaInput && personaInput.nextElementSibling ? personaInput.nextElementSibling.textContent : persona();
    var typeText = optionText(typeSel);
    var p = {
      _subject: "[NEWON Contact] " + typeText + " — " + val("subject"),
      _template: "table",
      _captcha: "false",
      _replyto: val("email"),
      persona: personaText,
      inquiry_type: typeText,
      name: val("name"),
      email: val("email"),
    };
    if (org) {
      if (val("organization")) p.organization = val("organization");
      if (val("business_purpose")) p.business_purpose = optionText(form.elements.business_purpose);
      if (!emptyUrl(val("website"))) p.website = val("website");
    }
    if (val("phone")) p.phone = val("phone");
    if (val("platform")) p.platform = optionText(platformSel);
    p.subject = val("subject");
    p.message = message ? message.value.trim() : "";
    if (!emptyUrl(val("reference_url"))) p.reference_url = val("reference_url");
    p.privacy_consent = "yes";
    p.page = String(location.href || "").split("#")[0];
    p.lang = cfg.lang || document.documentElement.lang || "";
    p.submittedAt = new Date().toISOString();
    return p;
  }

  function mailtoHref(p) {
    var keys = ["persona", "inquiry_type", "organization", "business_purpose", "website", "name", "email", "phone", "platform", "subject", "reference_url"];
    var lines = [];
    keys.forEach(function (k) {
      if (p[k]) lines.push(k + ": " + p[k]);
    });
    lines.push("", String(p.message || "").slice(0, 1500));
    return "mailto:" + INBOX + "?subject=" + encodeURIComponent((T.mailSubject || "NEWON inquiry") + " — " + (p.subject || "")) + "&body=" + encodeURIComponent(lines.join("\n"));
  }

  function setBusy(busy) {
    form.setAttribute("aria-busy", busy ? "true" : "false");
    if (submitBtn) {
      submitBtn.disabled = !!busy;
      submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
    }
    if (submitLabel) submitLabel.textContent = busy ? T.submitting || "…" : T.submit || submitLabel.textContent;
    if (statusEl) statusEl.textContent = busy ? T.submitting || "" : "";
  }

  function post(payload) {
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, TIMEOUT_MS);
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined,
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
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
        var flag = out.data ? out.data.success : undefined;
        if (!(out.res.ok && (flag === true || flag === "true"))) throw new Error("ct-not-confirmed");
      })
      .finally(function () {
        clearTimeout(timer);
      });
  }

  function focusEl(el) {
    if (!el) return;
    try {
      el.focus({ preventScroll: false });
    } catch (err) {
      el.focus();
    }
  }

  function showForm() {
    if (successBox && !successBox.hidden) {
      successBox.hidden = true;
      form.hidden = false;
    }
  }

  function onSuccess() {
    if (failBox) failBox.hidden = true;
    form.hidden = true;
    if (successBox) {
      successBox.hidden = false;
      focusEl(successBox);
    }
  }

  function onFail(payload) {
    if (mailtoLink) mailtoLink.href = mailtoHref(payload);
    if (failBox) {
      failBox.hidden = false;
      focusEl(failBox);
    }
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (sending) return;
    showAlert("");
    if (failBox) failBox.hidden = true;

    var first = validateAll();
    if (first) {
      showAlert(T.errSummary || "");
      focusEl(first);
      return;
    }

    var honey = form.elements._honey;
    if (honey && String(honey.value || "").trim()) return; // bot: never POST
    if (Date.now() - loadedAt < MIN_FILL_MS) {
      showAlert(T.tooFast || "");
      return;
    }

    var payload = buildPayload();
    sending = true;
    setBusy(true);
    post(payload)
      .then(function () {
        sending = false;
        setBusy(false);
        onSuccess();
      })
      .catch(function () {
        sending = false;
        setBusy(false);
        onFail(payload);
      });
  });

  var retry = page.querySelector("[data-ct-retry]");
  if (retry) {
    retry.addEventListener("click", function () {
      if (sending) return;
      if (typeof form.requestSubmit === "function") form.requestSubmit();
      else form.dispatchEvent(new Event("submit", { cancelable: true }));
    });
  }

  var again = page.querySelector("[data-ct-again]");
  if (again) {
    again.addEventListener("click", function () {
      form.reset();
      personaTouched = false;
      syncPersona();
      markPicked("");
      updateCount();
      successBox.hidden = true;
      form.hidden = false;
      loadedAt = Date.now();
      focusEl(typeSel);
    });
  }

  syncPersona();

  /* ── copy email ── */
  Array.prototype.forEach.call(page.querySelectorAll("[data-ct-copy]"), function (btn) {
    var status = btn.parentNode ? btn.parentNode.querySelector("[data-ct-copy-status]") : null;
    function say(msg) {
      if (!status) return;
      status.textContent = "";
      setTimeout(function () {
        status.textContent = msg;
      }, 30);
    }
    function legacyCopy(text) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch (err) {
        return false;
      }
    }
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-ct-copy") || INBOX;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () {
            say(T.copied || "");
          },
          function () {
            say(legacyCopy(text) ? T.copied || "" : T.copyFail || "");
          }
        );
      } else {
        say(legacyCopy(text) ? T.copied || "" : T.copyFail || "");
      }
    });
  });

  /* ── FAQ accordion ── */
  Array.prototype.forEach.call(page.querySelectorAll(".ct-faq__btn"), function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      panel.hidden = open;
    });
  });
})();
