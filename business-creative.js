/**
 * Newon Creative inquiry — FormSubmit with inquiry-aligned reliability.
 * Uses newonTrack SoT only (no PII in analytics).
 */
(function () {
  var INBOX = "newon@newon.app";
  var ENDPOINT = "https://formsubmit.co/ajax/" + INBOX;

  function isLocal() {
    var h = (location.hostname || "").toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "::1";
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

  function setBusy(form, btn, on) {
    form.setAttribute("data-busy", on ? "1" : "0");
    if (btn) btn.disabled = !!on;
  }

  function mailtoHref(payload) {
    var body = Object.keys(payload)
      .map(function (k) {
        return k + ": " + payload[k];
      })
      .join("\n");
    return (
      "mailto:" +
      INBOX +
      "?subject=" +
      encodeURIComponent(payload._subject) +
      "&body=" +
      encodeURIComponent(body)
    );
  }

  function showFail(status, payload) {
    if (!status) return;
    status.hidden = false;
    status.innerHTML = "";
    status.appendChild(document.createTextNode("Submission failed. "));
    var a = document.createElement("a");
    a.href = mailtoHref(payload);
    a.textContent = "Email us instead";
    status.appendChild(a);
  }

  function postFormSubmit(payload) {
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, 15000);
    return fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
        if (!ok) throw new Error("creative-failed");
      })
      .finally(function () {
        clearTimeout(timer);
      });
  }

  function init() {
    var form = document.getElementById("cr-inquiry-form");
    if (!form) return;
    var status = document.getElementById("cr-form-status");
    var submitBtn = form.querySelector('[type="submit"]');
    var sending = false;

    form.addEventListener("focusin", function () {
      if (form.dataset.started) return;
      form.dataset.started = "1";
      track(
        (window.newonAnalyticsEvents && window.newonAnalyticsEvents.INQUIRY_START) ||
          "inquiry_start",
        analyticsCtx(form)
      );
    });

    if (!form.querySelector("[name='_honey']")) {
      var honey = document.createElement("input");
      honey.type = "text";
      honey.name = "_honey";
      honey.setAttribute("tabindex", "-1");
      honey.setAttribute("autocomplete", "off");
      honey.setAttribute("aria-hidden", "true");
      honey.style.cssText = "position:absolute;left:-9999px;opacity:0;height:0;width:0;overflow:hidden";
      form.appendChild(honey);
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (sending || form.getAttribute("data-busy") === "1") return;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var honey = form.querySelector("[name='_honey']");
      if (honey && String(honey.value || "").trim()) return;

      var payload = {
        _subject: "Newon Creative inquiry",
        _captcha: "false",
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

      sending = true;
      setBusy(form, submitBtn, true);
      if (status) {
        status.hidden = false;
        status.textContent = "…";
      }

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
        showFail(status, payload);
        sending = false;
        setBusy(form, submitBtn, false);
      }

      if (isLocal()) {
        onSuccess();
        return;
      }

      postFormSubmit(payload).then(onSuccess).catch(onError);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
