/**
 * Waitlist + newsletter — FormSubmit with locale/source tracking, product interest.
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
    form.classList.remove("is-loading", "is-success", "is-error", "is-invalid", "is-duplicate", "is-updated");
    if (state === "loading") form.classList.add("is-loading");
    if (state === "success") form.classList.add("is-success");
    if (state === "error") form.classList.add("is-error");
    if (state === "invalid") form.classList.add("is-invalid");
    if (state === "duplicate") form.classList.add("is-duplicate");
    if (state === "updated") form.classList.add("is-updated");
  }

  function showMessage(form, selector, visible) {
    var root = form.closest(".ai-early") || form.parentElement;
    var el = root && root.querySelector(selector);
    if (el) el.hidden = !visible;
  }

  function hideAllMessages(form) {
    showMessage(form, "[data-waitlist-success]", false);
    showMessage(form, "[data-waitlist-duplicate]", false);
    showMessage(form, "[data-waitlist-updated]", false);
    showMessage(form, "[data-waitlist-error]", false);
    var invalid = form.querySelector("[data-waitlist-invalid]");
    if (invalid) invalid.hidden = true;
  }

  function emailKeyPart(email) {
    var s = String(email || "").toLowerCase().trim();
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  }

  function storageKey(formType, productId, email) {
    return STORAGE_PREFIX + formType + ":" + (productId || "general") + ":" + emailKeyPart(email);
  }

  function readRecord(formType, productId, email) {
    try {
      var raw = localStorage.getItem(storageKey(formType, productId, email));
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.v === 2) return data;
      if (data && data.ts) return { v: 2, ts: data.ts, products: [] };
      return null;
    } catch (e) {
      return null;
    }
  }

  function writeRecord(formType, productId, email, products) {
    try {
      localStorage.setItem(
        storageKey(formType, productId, email),
        JSON.stringify({
          v: 2,
          ts: Date.now(),
          products: products || [],
        })
      );
    } catch (e) {}
  }

  function selectedProducts(form) {
    var out = [];
    form.querySelectorAll('[name="interestedProducts"]:checked').forEach(function (el) {
      var v = String(el.value || "").trim();
      if (v) out.push(v);
    });
    return out;
  }

  function sameProducts(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    var sa = a.slice().sort().join("|");
    var sb = b.slice().sort().join("|");
    return sa === sb;
  }

  function mergeProducts(existing, next) {
    var map = {};
    (existing || []).concat(next || []).forEach(function (p) {
      if (p) map[p] = 1;
    });
    return Object.keys(map);
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

      hideAllMessages(form);

      var emailEl = form.querySelector('[name="email"]');
      var email = emailEl ? String(emailEl.value || "").trim() : "";
      if (!isEmail(email)) {
        setState(form, "invalid");
        var invalid = form.querySelector("[data-waitlist-invalid]");
        if (invalid) invalid.hidden = false;
        return;
      }

      var hp = form.querySelector('[name="_honey"]');
      if (hp && hp.value) return;

      var productIdEl = form.querySelector('[name="productId"]');
      var productId =
        (productIdEl && productIdEl.value) || form.getAttribute("data-product-id") || "";
      var formType = form.getAttribute("data-form-type") || "waitlist";
      var source = form.getAttribute("data-source") || location.pathname || "";
      var products = selectedProducts(form);
      var existing = readRecord(formType, productId, email);

      if (existing && sameProducts(existing.products, products)) {
        setState(form, "duplicate");
        form.hidden = true;
        showMessage(form, "[data-waitlist-duplicate]", true);
        return;
      }

      var isUpdate = !!(existing && products.length);
      var merged = mergeProducts(existing && existing.products, products);

      var utm = utmParams();
      var payload = {
        _subject: "Newon " + formType + " — " + (productId || "general"),
        _template: "table",
        formType: formType,
        email: email,
        productId: productId,
        interestedProducts: merged.join(", "),
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

      try {
        var eventName =
          formType === "newsletter"
            ? (window.newonAnalyticsEvents && window.newonAnalyticsEvents.NEWSLETTER_SIGNUP) ||
              "newsletter_signup"
            : (window.newonAnalyticsEvents && window.newonAnalyticsEvents.WAITLIST_SIGNUP) ||
              "waitlist_signup";
        if (window.newonTrack) {
          window.newonTrack(eventName, {
            productId: productId,
            locale: payload.locale,
            source: source,
            interestedProducts: merged.length,
          });
        }
      } catch (e) {
        /* analytics must never block waitlist submit */
      }

      fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(
            function (d) {
              return { ok: r.ok, data: d };
            },
            function () {
              return { ok: r.ok, data: null };
            }
          );
        })
        .then(function (out) {
          var flag = out.data && out.data.success;
          var ok = out.ok && (flag === true || flag === "true");
          if (!ok) throw new Error("submit-failed");
          writeRecord(formType, productId, email, merged);
          setState(form, isUpdate ? "updated" : "success");
          form.hidden = true;
          showMessage(form, isUpdate ? "[data-waitlist-updated]" : "[data-waitlist-success]", true);
        })
        .catch(function () {
          setState(form, "error");
          if (btn) btn.disabled = false;
          showMessage(form, "[data-waitlist-error]", true);
          try {
            if (window.newonTrack) {
              var errEvt =
                formType === "newsletter"
                  ? (window.newonAnalyticsEvents && window.newonAnalyticsEvents.NEWSLETTER_ERROR) ||
                    "newsletter_error"
                  : (window.newonAnalyticsEvents && window.newonAnalyticsEvents.WAITLIST_ERROR) ||
                    "waitlist_error";
              window.newonTrack(errEvt, { productId: productId });
            }
          } catch (e2) {}
        });
    });
  }

  document.querySelectorAll("[data-waitlist-form]").forEach(bindForm);
})();
