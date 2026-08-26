/**
 * Newon Creative inquiry — FormSubmit + local success state.
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
      else if (window.gtag) window.gtag("event", name, props || {});
    } catch (e) {}
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
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var status = document.getElementById("cr-form-status");
      var email = (form.email && form.email.value) || "";
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
        email: email,
        source: "business/creative",
        page: location.pathname,
      };
      track("creative_inquiry", {
        source: "business/creative",
        page: location.pathname,
        item_id: payload.type,
        category: "creative",
      });
      track("business_inquiry_submit", {
        source: "creative",
        page: location.pathname,
        item_id: payload.type,
        category: "creative",
      });

      if (isLocal()) {
        showSuccess();
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
          showSuccess();
        })
        .catch(function () {
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
          showSuccess();
        });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
