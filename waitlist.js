/**
 * Waitlist + newsletter — FormSubmit with locale/source tracking, no PII in analytics.
 */
(function () {
  "use strict";

  var INBOX = "newon@newon.app";
  var ENDPOINT = "https://formsubmit.co/ajax/" + INBOX;
  var LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
  var STORAGE_PREFIX = "newon-wl-";

  function langDir() {
    var segs = (location.pathname || "").replace(/\/index\.html$/i, "").replace(/\/$/, "").split("/").filter(Boolean);
    for (var i = 0; i < segs.length; i++) {
      if (LANGS.indexOf(segs[i]) !== -1) return segs[i];
    }
    return "en";
  }

  function utmParams() {
    var p = new URLSearchParams(location.search);
    return {
      utm_source: p.get("utm_source") || "",
      utm_medium: p.get("utm_medium") || "",
      utm_campaign: p.get("utm_campaign") || "",
    };
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function setState(form, state) {
    form.dataset.state = state;
    form.classList.remove("is-loading", "is-success", "is-error", "is-invalid", "is-duplicate");
    if (state === "loading") form.classList.add("is-loading");
    if (state === "success") form.classList.add("is-success");
    if (state === "error") form.classList.add("is-error");
    if (state === "invalid") form.classList.add("is-invalid");
    if (state === "duplicate") form.classList.add("is-duplicate");
  }

  function showMessage(form, selector, visible) {
    var el = form.parentElement && form.parentElement.querySelector(selector);
    if (el) el.hidden = !visible;
  }

  function storageKey(formType, productId, email) {
    return STORAGE_PREFIX + formType + ":" + (productId || "general") + ":" + email.toLowerCase();
  }

  function bindForm(form) {
    if (!form || form.dataset.waitlistBound) return;
    form.dataset.waitlistBound = "1";

    if (window.newonTrack) {
      window.newonTrack(window.newonAnalyticsEvents.WAITLIST_VIEW, {
        formType: form.getAttribute("data-form-type") || "waitlist",
        productId: form.getAttribute("data-product-id") || "",
      });
    }

    form.addEventListener("focusin", function () {
      if (window.newonTrack && !form.dataset.started) {
        form.dataset.started = "1";
        window.newonTrack(window.newonAnalyticsEvents.WAITLIST_START, {
          formType: form.getAttribute("data-form-type") || "waitlist",
          productId: form.getAttribute("data-product-id") || "",
        });
      }
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (form.dataset.state === "loading") return;

      var emailEl = form.querySelector('[name="email"]');
      var email = emailEl ? String(emailEl.value || "").trim() : "";
      if (!isEmail(email)) {
        setState(form, "invalid");
        return;
      }

      var hp = form.querySelector('[name="_honey"]');
      if (hp && hp.value) return;

      var productIdEl = form.querySelector('[name="productId"]');
      var productId =
        (productIdEl && productIdEl.value) ||
        form.getAttribute("data-product-id") ||
        "";
      var formType = form.getAttribute("data-form-type") || "waitlist";
      var source = form.getAttribute("data-source") || location.pathname || "";

      try {
        if (localStorage.getItem(storageKey(formType, productId, email))) {
          setState(form, "duplicate");
          form.hidden = true;
          showMessage(form, "[data-waitlist-duplicate]", true);
          showMessage(form, "[data-waitlist-success]", false);
          return;
        }
      } catch (e) {}

      var utm = utmParams();
      var payload = {
        _subject: "Newon " + formType + " — " + (productId || "general"),
        _template: "table",
        formType: formType,
        email: email,
        productId: productId,
        locale: langDir(),
        source: source,
        landingPage: String(location.href || "").split("#")[0],
        referrer: document.referrer || "",
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        _captcha: "false",
      };

      var btn = form.querySelector('[type="submit"]');
      setState(form, "loading");
      if (btn) btn.disabled = true;

      var eventName =
        formType === "newsletter"
          ? window.newonAnalyticsEvents.NEWSLETTER_SIGNUP
          : window.newonAnalyticsEvents.WAITLIST_SIGNUP;
      if (window.newonTrack) {
        window.newonTrack(eventName, { productId: productId, locale: payload.locale, source: source });
      }

      fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (d) {
            return { ok: r.ok, data: d };
          }, function () {
            return { ok: r.ok, data: null };
          });
        })
        .then(function (out) {
          var flag = out.data && out.data.success;
          if (!out.ok && flag !== true && flag !== "true") throw new Error("submit-failed");
          try {
            localStorage.setItem(storageKey(formType, productId, email), payload.createdAt);
          } catch (e) {}
          setState(form, "success");
          form.hidden = true;
          showMessage(form, "[data-waitlist-success]", true);
          showMessage(form, "[data-waitlist-duplicate]", false);
        })
        .catch(function () {
          setState(form, "error");
          if (btn) btn.disabled = false;
          showMessage(form, "[data-waitlist-error]", true);
          if (window.newonTrack) {
            var errEvt =
              formType === "newsletter"
                ? window.newonAnalyticsEvents.NEWSLETTER_ERROR
                : window.newonAnalyticsEvents.WAITLIST_ERROR;
            window.newonTrack(errEvt, { productId: productId });
          }
        });
    });
  }

  document.querySelectorAll("[data-waitlist-form]").forEach(bindForm);
})();
