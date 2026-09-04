/**
 * Newon Creative inquiry — FormSubmit + local success state.
 * Uses newonTrack SoT only (no PII in analytics).
 */
(function () {
  var INBOX = "newon@newon.app";
  var ENDPOINT = "https://formsubmit.co/ajax/" + INBOX;

  function isLocal() {
    var h = (location.hostname || "").toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0";
  }

  function track(name, props) {
    try {
      if (window.newonTrack) window.newonTrack(name, props || {});
    } catch (e) {}
  }

  function analyticsCtx(form) {
    var typeVal = form && form.type ? String(form.type.value || "").trim() : "";
    var internal =
      (window.newonAnalyticsInternal && window.newonAnalyticsInternal()) || {};
    return {
      service_id: "creative",
      category: "creative",
      service_type: typeVal || undefined,
      cta_location: "creative_form",
      from_page_type: internal.from_page_type || undefined,
      from_path: internal.from_path || undefined,
    };
  }

  function servicesValue(form) {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="services"]:checked'))
      .map(function (el) {
        return el.value;
      })
      .join(", ");
  }

  function showSuccess() {
    var form = document.getElementById("cr-inquiry-form");
    var ok = document.getElementById("cr-success");
    if (form) form.hidden = true;
    if (ok) ok.hidden = false;
  }

  function init() {
    var form = document.getElementById("cr-inquiry-form");
    if (!form) return;

    form.addEventListener("focusin", function () {
      if (form.dataset.started) return;
      form.dataset.started = "1";
      track(
        (window.newonAnalyticsEvents && window.newonAnalyticsEvents.INQUIRY_START) ||
          "inquiry_start",
        analyticsCtx(form)
      );
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var status = document.getElementById("cr-form-status");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var payload = {
        _subject: "Newon Creative inquiry",
        type: form.type.value,
        company: form.company.value,
        services: servicesValue(form),
        budget: form.budget.value,
        timeline: form.timeline.value,
        message: form.message.value,
        name: form.name.value,
        email: (form.email && form.email.value) || "",
        source: "business/creative",
        page: location.pathname,
      };

      var ctx = analyticsCtx(form);
      track(
        (window.newonAnalyticsEvents && window.newonAnalyticsEvents.INQUIRY_SUBMIT) ||
          "inquiry_submit",
        ctx
      );

      function onSuccess() {
        track(
          (window.newonAnalyticsEvents && window.newonAnalyticsEvents.INQUIRY_SUCCESS) ||
            "inquiry_success",
          ctx
        );
        showSuccess();
      }

      function onError() {
        track(
          (window.newonAnalyticsEvents && window.newonAnalyticsEvents.BUSINESS_FORM_ERROR) ||
            "inquiry_error",
          ctx
        );
      }

      if (isLocal()) {
        onSuccess();
        return;
      }

      if (status) {
        status.hidden = false;
        status.textContent = "…";
      }

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          if (!r.ok) throw new Error("submit failed");
          onSuccess();
        })
        .catch(function () {
          onError();
          var body = Object.keys(payload)
            .map(function (k) {
              return k + ": " + payload[k];
            })
            .join("\n");
          location.href =
            "mailto:" +
            INBOX +
            "?subject=" +
            encodeURIComponent(payload._subject) +
            "&body=" +
            encodeURIComponent(body);
          /* Mailto fallback is not treated as FormSubmit success. */
        });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
