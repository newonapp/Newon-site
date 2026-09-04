/**
 * Business inquiry submit + success-page state.
 * Live site posts to FormSubmit; local preview still opens the success page
 * if FormSubmit is not activated. Direct visits to success see the empty state.
 */
(function () {
  var STORAGE_KEY = "newon-bz-inquiry-ok";
  var MAX_AGE_MS = 2 * 60 * 60 * 1000;
  var INBOX = "newon@newon.app";
  var ENDPOINT = "https://formsubmit.co/ajax/" + INBOX;
  var LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

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
    try {
      var stored = localStorage.getItem("newon-lang-dir");
      if (stored && LANGS.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    return "en";
  }

  function successHref() {
    return "/" + langDir() + "/business/inquiry/success/";
  }

  function inquiryHref() {
    return "/" + langDir() + "/business/inquiry/#inquiry";
  }

  function isLocalPreview() {
    var h = (location.hostname || "").toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "::1" || h === "[::1]";
  }

  function emptyWebsite(value) {
    var v = String(value || "").trim();
    return !v || v === "https://" || v === "http://" || v === "https:" || v === "http:";
  }

  function mailtoHref(payload) {
    var order = [
      "company",
      "name",
      "email",
      "phone",
      "website",
      "type",
      "type_label",
      "category",
      "service",
      "starting_price",
      "estimated_timeline",
      "message",
      "features",
      "budget",
      "stage",
      "timeline",
      "reference",
      "notes",
    ];
    var lines = [];
    var i;
    for (i = 0; i < order.length; i++) {
      var key = order[i];
      if (payload[key]) lines.push(key + ": " + payload[key]);
    }
    return (
      "mailto:" +
      INBOX +
      "?subject=" +
      encodeURIComponent(payload._subject || "Newon Business inquiry") +
      "&body=" +
      encodeURIComponent(lines.join("\n"))
    );
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

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

  function writeRecord(data) {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          v: 1,
          ts: Date.now(),
          type: data.type || "",
          name: data.name || "",
          email: data.email || "",
        })
      );
    } catch (e) {}
  }

  function typeLabel(form) {
    var typeEl = form.querySelector("[name='type']") || document.getElementById("bz-type");
    if (!typeEl) return "";
    if (typeEl.tagName === "SELECT") {
      var opt = typeEl.options[typeEl.selectedIndex];
      return opt ? String(opt.textContent || "").trim() : String(typeEl.value || "").trim();
    }
    return String(typeEl.getAttribute("data-label") || typeEl.value || "").trim();
  }

  function fieldValue(form, name, id) {
    var el = form.querySelector("[name='" + name + "']") || document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function setBusy(form, submitBtn, busy) {
    form.setAttribute("data-busy", busy ? "1" : "0");
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
    submitBtn.classList.toggle("is-busy", busy);
    var label = submitBtn.querySelector(".bz-submit-label");
    var text = busy
      ? form.getAttribute("data-submitting") || ""
      : form.getAttribute("data-submit") || "";
    if (label) label.textContent = text;
    else submitBtn.textContent = text;
  }

  function showFail(fail, mailHref) {
    if (!fail) return;
    if (mailHref) {
      var a = fail.querySelector("a.bz-fail-mail");
      if (!a) {
        fail.appendChild(document.createElement("br"));
        a = document.createElement("a");
        a.className = "bz-fail-mail";
        fail.appendChild(a);
      }
      a.href = mailHref;
      a.textContent = langDir() === "ko" ? "이메일로 보내기 →" : "Send by email →";
      a.style.display = "inline-block";
      a.style.marginTop = "0.7rem";
      a.style.fontWeight = "600";
      a.style.textDecoration = "underline";
      a.style.textUnderlineOffset = "0.18em";
    }
    fail.classList.add("is-visible");
    fail.removeAttribute("hidden");
    try {
      fail.focus();
    } catch (e) {}
  }

  function utmParams() {
    var p = new URLSearchParams(location.search);
    var fromUrl = {
      utm_source: p.get("utm_source") || "",
      utm_medium: p.get("utm_medium") || "",
      utm_campaign: p.get("utm_campaign") || "",
      utm_content: p.get("utm_content") || "",
    };
    var stored = {};
    try {
      if (typeof window.newonAnalyticsUtm === "function") stored = window.newonAnalyticsUtm() || {};
    } catch (e) {}
    return {
      utm_source: fromUrl.utm_source || stored.utm_source || "",
      utm_medium: fromUrl.utm_medium || stored.utm_medium || "",
      utm_campaign: fromUrl.utm_campaign || stored.utm_campaign || "",
      utm_content: fromUrl.utm_content || stored.utm_content || "",
    };
  }

  function inquiryAnalyticsContext(form) {
    var slugEl = form && form.querySelector("[name='slug']");
    var serviceEl = form && form.querySelector("[name='service']");
    var typeEl = form && (form.querySelector("[name='type']") || document.getElementById("bz-type"));
    var categoryEl = form && form.querySelector("[name='category']");
    var serviceId = "";
    if (slugEl && String(slugEl.value || "").trim()) serviceId = String(slugEl.value || "").trim();
    else if (serviceEl && String(serviceEl.value || "").trim()) serviceId = String(serviceEl.value || "").trim();
    var category = categoryEl ? String(categoryEl.value || "").trim() : "";
    var typeVal = typeEl ? String(typeEl.value || "").trim() : "";
    return {
      service_id: serviceId || undefined,
      category: category || undefined,
      service_type: typeVal || undefined,
      locale: langDir(),
      cta_location: "inquiry_form",
    };
  }

  function collectPayload(form) {
    var websiteEl = form.querySelector("[name='website']") || document.getElementById("bz-website");
    if (websiteEl && emptyWebsite(websiteEl.value)) websiteEl.value = "";
    // Keep service hidden field aligned with the visible type select (clear when unset)
    var typeField = form.querySelector("[name='type']") || document.getElementById("bz-type");
    var serviceField = form.querySelector("[name='service']");
    var slugField = form.querySelector("[name='slug']");
    var productField = form.querySelector("[name='product']");
    var categoryField = form.querySelector("[name='category']");
    var isStore =
      (categoryField && /^store$/i.test(String(categoryField.value || "").trim())) ||
      (typeField && /^Store\s*\//i.test(String(typeField.value || "").trim())) ||
      !!(productField && String(productField.value || "").trim());
    var preservedStoreSlug = isStore && slugField ? String(slugField.value || "").trim() : "";
    var preservedStoreProduct = isStore && productField ? String(productField.value || "").trim() : "";
    if (typeField) {
      var tv = String(typeField.value || "").trim();
      var next = "";
      if (tv) {
        if (/^Studio\s*\//i.test(tv)) next = tv.replace(/^Studio\s*\/\s*/i, "");
        else if (/^Store\s*\//i.test(tv)) next = preservedStoreProduct || tv.replace(/^Store\s*\/\s*/i, "");
        else next = tv.replace(/^(BUILD|AUTOMATION|RESEARCH|SOLUTIONS)\s*\/\s*/i, "");
      }
      if (next) {
        if (!serviceField) {
          serviceField = document.createElement("input");
          serviceField.type = "hidden";
          serviceField.name = "service";
          form.appendChild(serviceField);
        }
        serviceField.value = next;
      } else if (serviceField && !isStore) {
        serviceField.value = "";
      }
      var opt = typeField.tagName === "SELECT" ? typeField.options[typeField.selectedIndex] : null;
      var slugVal = opt && opt.getAttribute("data-slug") ? String(opt.getAttribute("data-slug")).trim() : "";
      if (slugVal) {
        if (!slugField) {
          slugField = document.createElement("input");
          slugField.type = "hidden";
          slugField.name = "slug";
          form.appendChild(slugField);
        }
        slugField.value = slugVal;
      } else if (slugField && !slugVal && !isStore) {
        slugField.value = "";
      }
      if (isStore && preservedStoreSlug) {
        if (!slugField) {
          slugField = document.createElement("input");
          slugField.type = "hidden";
          slugField.name = "slug";
          form.appendChild(slugField);
        }
        slugField.value = preservedStoreSlug;
      }
      if (isStore && preservedStoreProduct) {
        if (!productField) {
          productField = document.createElement("input");
          productField.type = "hidden";
          productField.name = "product";
          form.appendChild(productField);
        }
        productField.value = preservedStoreProduct;
        if (serviceField) serviceField.value = preservedStoreProduct;
      }
      var areaFromOpt = opt && opt.getAttribute("data-area") ? String(opt.getAttribute("data-area")).trim() : "";
      if (areaFromOpt) {
        var areaField = form.querySelector("[name='area']");
        if (!areaField) {
          areaField = document.createElement("input");
          areaField.type = "hidden";
          areaField.name = "area";
          form.appendChild(areaField);
        }
        areaField.value = areaFromOpt;
      }
    }
    var payload = {
      _subject: form.getAttribute("data-subject") || "Newon Business inquiry",
      _template: "table",
      _captcha: "false",
      _url: String(location.href || "").split("#")[0],
    };
    Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (field) {
      if (!field.name || field.type === "submit" || field.name === "_honey") return;
      if (field.type === "checkbox" || field.type === "radio") {
        if (!field.checked) return;
      }
      var v = String(field.value || "").trim();
      if (!v) return;
      if (payload[field.name]) {
        payload[field.name] = payload[field.name] + ", " + v;
      } else {
        payload[field.name] = v;
      }
    });
    var email = fieldValue(form, "email", "bz-email");
    if (email) payload._replyto = email;
    var type = typeLabel(form);
    if (type && !payload.type_label) payload.type_label = type;
    if (type) payload._subject = payload._subject + " — " + type;
    var utm = utmParams();
    payload.utm_source = utm.utm_source;
    payload.utm_medium = utm.utm_medium;
    payload.utm_campaign = utm.utm_campaign;
    payload.referrer = document.referrer || "";
    payload.landingPage = String(location.href || "").split("#")[0];
    payload.submittedAt = new Date().toISOString();
    payload.locale = langDir();
    payload.formType = "business_inquiry";
    if (payload.consent) {
      payload.privacyConsent = payload.consent;
    }
    return payload;
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
        if (!ok) throw new Error("inquiry-failed");
      })
      .finally(function () {
        clearTimeout(timer);
      });
  }

  function sendInquiry(payload) {
    return postFormSubmit(payload).catch(function (err) {
      if (isLocalPreview()) return;
      throw err;
    });
  }

  function bindForm() {
    var form = document.getElementById("bz-inquiry-form");
    if (!form) return;
    var fail = document.getElementById("bz-fail");
    var submitBtn = document.getElementById("bz-submit");
    var sending = false;

    if (fail) {
      fail.setAttribute("tabindex", "-1");
      fail.classList.remove("is-visible");
    }

    form.addEventListener("focusin", function () {
      if (window.newonTrack && !form.dataset.started) {
        form.dataset.started = "1";
        var startEvt =
          (window.newonAnalyticsEvents &&
            (window.newonAnalyticsEvents.INQUIRY_START ||
              window.newonAnalyticsEvents.BUSINESS_FORM_START)) ||
          "inquiry_start";
        window.newonTrack(startEvt, inquiryAnalyticsContext(form));
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending || form.getAttribute("data-busy") === "1") return;
      if (fail) {
        fail.classList.remove("is-visible");
        fail.setAttribute("hidden", "");
      }

      var honey = form.querySelector("[name='_honey']");
      if (honey && String(honey.value || "").trim()) return;

      var nameEl = document.getElementById("bz-name") || form.querySelector("[name='name']");
      var emailEl = document.getElementById("bz-email") || form.querySelector("[name='email']");
      var websiteEl = document.getElementById("bz-website") || form.querySelector("[name='website']");
      var name = nameEl ? String(nameEl.value || "").trim() : "";
      var email = emailEl ? String(emailEl.value || "").trim() : "";
      if (nameEl) nameEl.value = name;
      if (emailEl) emailEl.value = email;
      if (websiteEl && emptyWebsite(websiteEl.value)) {
        websiteEl.value = "";
        websiteEl.setCustomValidity("");
      }
      if (emailEl) emailEl.setCustomValidity("");
      if (email && !isEmail(email) && emailEl) emailEl.setCustomValidity(" ");
      if (!form.reportValidity()) {
        if (emailEl) emailEl.setCustomValidity("");
        return;
      }
      if (emailEl) emailEl.setCustomValidity("");

      var consent = form.querySelector("[name='consent']");
      if (consent && !consent.checked) {
        consent.setCustomValidity(" ");
        form.reportValidity();
        consent.setCustomValidity("");
        return;
      }

      if (window.newonTrack) {
        var submitEvt =
          (window.newonAnalyticsEvents &&
            (window.newonAnalyticsEvents.INQUIRY_SUBMIT ||
              window.newonAnalyticsEvents.BUSINESS_FORM_SUBMIT)) ||
          "inquiry_submit";
        window.newonTrack(submitEvt, inquiryAnalyticsContext(form));
      }

      sending = true;
      setBusy(form, submitBtn, true);

      var payload = collectPayload(form);
      sendInquiry(payload)
        .then(function () {
          if (window.newonTrack) {
            var okEvt =
              (window.newonAnalyticsEvents &&
                (window.newonAnalyticsEvents.INQUIRY_SUCCESS ||
                  window.newonAnalyticsEvents.BUSINESS_FORM_SUCCESS)) ||
              "inquiry_success";
            window.newonTrack(okEvt, inquiryAnalyticsContext(form));
          }
          writeRecord({
            type: typeLabel(form),
            name: name,
            email: email,
          });
          location.replace(successHref());
        })
        .catch(function () {
          if (window.newonTrack) {
            window.newonTrack(
              (window.newonAnalyticsEvents && window.newonAnalyticsEvents.BUSINESS_FORM_ERROR) ||
                "inquiry_error",
              inquiryAnalyticsContext(form)
            );
          }
          sending = false;
          setBusy(form, submitBtn, false);
          showFail(fail, mailtoHref(payload));
        });
    });
  }

  function fillText(el, value) {
    if (!el) return;
    el.textContent = value || "";
    var wrap = el.closest("div");
    if (wrap && wrap.parentNode && wrap.parentNode.classList.contains("bz-ok-dl")) {
      wrap.hidden = !value;
    }
  }

  function bindSuccess() {
    var root = document.getElementById("bz-inquiry-success");
    if (!root) return;
    var ok = document.getElementById("bz-ok");
    var empty = document.getElementById("bz-empty");
    var summary = document.getElementById("bz-ok-summary");
    var record = readRecord();

    if (!record) {
      if (ok) {
        ok.hidden = true;
        ok.setAttribute("aria-hidden", "true");
      }
      if (empty) {
        empty.hidden = false;
        empty.removeAttribute("aria-hidden");
      }
      var emptyCta = document.getElementById("bz-empty-cta");
      if (emptyCta && !emptyCta.getAttribute("href")) emptyCta.setAttribute("href", inquiryHref());
      var emptyTitle = document.getElementById("bz-empty-title");
      if (emptyTitle) {
        try {
          emptyTitle.focus();
        } catch (e) {}
      }
      return;
    }

    if (empty) {
      empty.hidden = true;
      empty.setAttribute("aria-hidden", "true");
    }
    if (ok) {
      ok.hidden = false;
      ok.removeAttribute("aria-hidden");
    }

    var hasSummary = !!(record.type || record.name || record.email);
    if (summary) {
      summary.hidden = !hasSummary;
      if (!hasSummary) summary.setAttribute("aria-hidden", "true");
      else summary.removeAttribute("aria-hidden");
    }
    fillText(document.getElementById("bz-ok-type"), record.type);
    fillText(document.getElementById("bz-ok-name"), record.name);
    var mail = document.getElementById("bz-ok-email");
    if (mail) {
      var addr = record.email || "";
      mail.textContent = addr;
      if (addr) mail.setAttribute("href", "mailto:" + addr);
      else mail.removeAttribute("href");
    }

    var title = document.getElementById("bz-ok-title");
    if (title) {
      try {
        title.focus();
      } catch (e) {}
    }
  }

  bindForm();
  bindSuccess();
})();
