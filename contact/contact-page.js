/**
 * NEWON unified Contact page (/{lang}/contact/): section scroll, category → form preset, three-level inquiry
 * classification (inquirer · inquiry type · platform topic — scripts/contact-taxonomy.mjs), conditional fields,
 * URL preselection (?type ?inquirer ?inquiry ?platform ?topic ?source), validation, duplicate-submit guard,
 * FormSubmit delivery, copy email, FAQ accordion.
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
  var topicSel = document.getElementById("ct-topic");
  var inquirerBox = document.getElementById("ct-inquirer");
  var inquirerErr = document.getElementById("ct-inquirer-err");
  var orgBox = form.querySelector("[data-ct-org]");
  var detailBox = form.querySelector("[data-ct-detail]");
  var orgName = document.getElementById("ct-org-name");
  var errorDetail = document.getElementById("ct-error");
  var messageLabel = form.querySelector("[data-ct-message-label]");
  var alertBox = document.getElementById("ct-form-alert");
  var submitBtn = form.querySelector("[data-ct-submit]");
  var submitLabel = form.querySelector("[data-ct-submit-label]");
  var statusEl = form.querySelector("[data-ct-status]");
  var successBox = page.querySelector("[data-ct-success]");
  var successMeta = page.querySelector("[data-ct-success-meta]");
  var failBox = page.querySelector("[data-ct-fail]");
  var failBody = page.querySelector("[data-ct-fail-body]");
  var mailtoLink = page.querySelector("[data-ct-mailto]");
  var message = document.getElementById("ct-message");
  var countN = form.querySelector("[data-ct-count-n]");
  var countBox = form.querySelector("[data-ct-count]");
  var sending = false;
  var presets = cfg.presets || {};
  var rules = cfg.rules || {};
  var topicsBy = cfg.topics || {};
  var proposal = cfg.proposal || [];
  var orgLabels = cfg.orgLabels || {};
  var DUP_KEY = "newon-ct-last-sent";
  var DUP_MS = 10 * 60 * 1000;

  function has(list, v) {
    return !!v && (list || []).indexOf(v) !== -1;
  }
  function ids(list) {
    return (list || []).map(function (x) {
      return x.id;
    });
  }
  function labelOf(list, id) {
    for (var i = 0; i < (list || []).length; i++) if (list[i].id === id) return list[i].label;
    return "";
  }

  /* ── current selection ── */
  function inquirer() {
    var r = form.querySelector('input[name="inquirer"]:checked');
    return r ? r.value : "";
  }
  function setInquirer(v) {
    Array.prototype.forEach.call(form.querySelectorAll('input[name="inquirer"]'), function (r) {
      r.checked = r.value === v;
    });
  }
  function inquiry() {
    return typeSel ? typeSel.value : "";
  }
  function platform() {
    return platformSel ? platformSel.value : "";
  }
  function topic() {
    if (!topicSel || topicSel.closest("[hidden]")) return null;
    var list = topicsBy[platform()] || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === topicSel.value) return list[i];
    return null;
  }

  /** Category recorded with the submission (mirrors deriveContactCategory in scripts/contact-taxonomy.mjs). */
  function category() {
    var who = inquirer();
    var what = inquiry();
    if (!who && !what) return "";
    if (what === "investment" || who === "investor") return "investment";
    if (what === "partnership") return "partnership";
    if (who === "organization" || what === "institution") return "public";
    if (who === "media" || who === "other") return "media";
    if (who === "company") return "business";
    return "personal";
  }

  function markPicked(type) {
    Array.prototype.forEach.call(page.querySelectorAll("[data-ct-cat]"), function (card) {
      card.classList.toggle("is-picked", !!type && card.getAttribute("data-ct-cat") === type);
    });
  }

  /* ── level 3: topics of the chosen platform (labels already carry "출시 준비 중" / "향후 계획") ── */
  var topicFor = null;
  function fillTopics() {
    if (!topicSel) return;
    var p = platform();
    if (topicFor === p) return;
    topicFor = p;
    var keep = topicSel.value;
    var placeholder = topicSel.querySelector('option[value=""]');
    var phText = placeholder ? placeholder.textContent : "";
    while (topicSel.firstChild) topicSel.removeChild(topicSel.firstChild);
    var first = document.createElement("option");
    first.value = "";
    first.textContent = phText;
    topicSel.appendChild(first);
    (topicsBy[p] || []).forEach(function (t) {
      var o = document.createElement("option");
      o.value = t.id;
      o.textContent = t.label;
      topicSel.appendChild(o);
    });
    topicSel.value = (topicsBy[p] || []).some(function (t) {
      return t.id === keep;
    })
      ? keep
      : "";
  }

  /* ── conditional fields ── */
  function ruleOn(name) {
    if (name === "topic") return (topicsBy[platform()] || []).length > 0;
    var r = rules[name];
    if (!r) return false;
    if (r.ref) {
      var t = topic();
      return !!(t && t.ref);
    }
    return has(r.inquirers, inquirer()) || has(r.inquiries, inquiry());
  }
  function ruleRequired(name) {
    var r = rules[name];
    return !!(r && r.requiredFor && (has(r.requiredFor, inquirer()) || has(r.requiredFor, inquiry())));
  }
  function escapeText(s) {
    return String(s || "").replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }
  function setLabel(field, text, required) {
    if (!field) return;
    var lab = form.querySelector('label[for="' + field.id + '"]');
    if (!lab) return;
    if (!lab.hasAttribute("data-ct-opt")) {
      var o = lab.querySelector(".ct-opt");
      lab.setAttribute("data-ct-opt", o ? o.textContent : "");
    }
    var tag = required ? '<span class="ct-req" aria-hidden="true">*</span>' : '<span class="ct-opt">' + escapeText(lab.getAttribute("data-ct-opt")) + "</span>";
    lab.innerHTML = escapeText(text) + " " + tag;
    field.required = !!required;
  }

  function sync() {
    fillTopics();
    Array.prototype.forEach.call(form.querySelectorAll("[data-ct-when]"), function (box) {
      var on = ruleOn(box.getAttribute("data-ct-when"));
      box.hidden = !on;
      if (!on) Array.prototype.forEach.call(box.querySelectorAll("input, select, textarea"), clearFieldError);
    });
    [orgBox, detailBox].forEach(function (box) {
      if (!box) return;
      Array.prototype.forEach.call(box.querySelectorAll(".ct-row"), function (row) {
        row.hidden = !row.querySelector("[data-ct-when]:not([hidden])");
      });
      box.hidden = !box.querySelector("[data-ct-when]:not([hidden])");
    });
    var who = inquirer();
    setLabel(orgName, orgLabels[who] || T.orgLabel || "", ruleRequired("organization"));
    setLabel(errorDetail, T.errorDetailLabel || "", ruleRequired("error_detail"));
    if (messageLabel) messageLabel.textContent = has(proposal, inquiry()) ? T.messageLabelProposal || T.messageLabel : T.messageLabel || messageLabel.textContent;
    markPicked(category());
  }

  /** Apply a preselection { inquirer, inquiry, platform, topic } (values already validated). */
  function apply(sel) {
    if (sel.inquirer !== undefined) setInquirer(sel.inquirer);
    if (typeSel && sel.inquiry !== undefined) typeSel.value = has(ids(cfg.inquiries), sel.inquiry) ? sel.inquiry : "";
    if (platformSel && sel.platform !== undefined) platformSel.value = has(cfg.platforms, sel.platform) ? sel.platform : "";
    fillTopics();
    if (topicSel && sel.topic !== undefined) {
      topicSel.value = "";
      if ((topicsBy[platform()] || []).some(function (t) { return t.id === sel.topic; })) topicSel.value = sel.topic;
    }
    sync();
  }

  function presetFor(type) {
    return Object.prototype.hasOwnProperty.call(presets, type) ? presets[type] : null;
  }

  /* category card / ?type= → level 1 + level 2 */
  function setType(type, opts) {
    var p = presetFor(type);
    if (!p) return false;
    apply({ inquirer: p.inquirer || "", inquiry: p.inquiry || "" });
    if (typeSel) clearFieldError(typeSel);
    clearInquirerError();
    if (opts && opts.updateUrl) updateUrl();
    return true;
  }

  /** Keep the classification (never personal data) in the address bar so a language switch keeps it. */
  function updateUrl() {
    try {
      var u = new URL(location.href);
      var sp = u.searchParams;
      var pairs = { inquirer: inquirer(), inquiry: inquiry(), platform: platform(), topic: topic() ? topic().id : "" };
      if (pairs.inquirer || pairs.inquiry) sp.delete("type");
      Object.keys(pairs).forEach(function (k) {
        if (pairs[k]) sp.set(k, pairs[k]);
        else sp.delete(k);
      });
      history.replaceState(history.state, "", u.pathname + (sp.toString() ? "?" + sp.toString() : "") + u.hash);
    } catch (err) {
      /* ignore */
    }
  }

  Array.prototype.forEach.call(page.querySelectorAll("[data-ct-pick]"), function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      setType(a.getAttribute("data-ct-pick"), { updateUrl: true });
      showForm();
      scrollToSection("contact-form", form.querySelector('input[name="inquirer"]:checked') || typeSel);
    });
  });

  Array.prototype.forEach.call(form.querySelectorAll('input[name="inquirer"]'), function (r) {
    r.addEventListener("change", function () {
      clearInquirerError();
      sync();
      updateUrl();
    });
  });
  if (typeSel) {
    typeSel.addEventListener("change", function () {
      sync();
      updateUrl();
    });
  }
  if (platformSel) {
    platformSel.addEventListener("change", function () {
      sync();
      updateUrl();
    });
  }
  if (topicSel) {
    topicSel.addEventListener("change", function () {
      var t = topic();
      if (t && t.inquiry && typeSel && !typeSel.value) typeSel.value = t.inquiry;
      sync();
      updateUrl();
    });
  }

  /* URL: ?type= (category presets + older values), ?inquirer=, ?inquiry=, ?platform= (my-world alias), ?topic=, ?source= */
  var params;
  try {
    params = new URLSearchParams(location.search);
  } catch (err) {
    params = null;
  }
  function param(k) {
    return params ? String(params.get(k) || "").toLowerCase().trim() : "";
  }
  (function fromUrl() {
    if (!params) return;
    var sel = {};
    var p = presetFor(param("type"));
    if (p) {
      sel.inquirer = p.inquirer || "";
      sel.inquiry = p.inquiry || "";
    }
    if (has(ids(cfg.inquirers), param("inquirer"))) sel.inquirer = param("inquirer");
    if (has(ids(cfg.inquiries), param("inquiry"))) sel.inquiry = param("inquiry");
    var plat = param("platform");
    plat = (cfg.platformAliases || {})[plat] || plat;
    if (has(cfg.platforms, plat)) sel.platform = plat;
    var tp = param("topic");
    if (tp) {
      Object.keys(topicsBy).some(function (pid) {
        return (topicsBy[pid] || []).some(function (t) {
          if (t.id !== tp || (sel.platform && sel.platform !== pid)) return false;
          sel.platform = pid;
          sel.topic = t.id;
          if (!sel.inquiry && t.inquiry) sel.inquiry = t.inquiry;
          return true;
        });
      });
    }
    apply(sel);
  })();

  function cleanParam(k, max) {
    return params ? String(params.get(k) || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max) : "";
  }
  function sourceOf() {
    var s = cleanParam("source", 120);
    if (s) return s;
    try {
      if (document.referrer) {
        var r = new URL(document.referrer);
        if (r.origin === location.origin && r.pathname !== location.pathname) return r.pathname;
      }
    } catch (err) {
      /* ignore */
    }
    return "direct";
  }

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
    var list = base.split(/\s+/).filter(Boolean);
    if (withErr) list.push(field.id + "-err");
    if (list.length) field.setAttribute("aria-describedby", list.join(" "));
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

  function radios() {
    return form.querySelectorAll('input[name="inquirer"]');
  }
  function setInquirerError(msg) {
    if (inquirerErr) {
      inquirerErr.textContent = msg;
      inquirerErr.hidden = false;
    }
    if (inquirerBox) inquirerBox.setAttribute("aria-describedby", "ct-inquirer-err");
    Array.prototype.forEach.call(radios(), function (r) {
      r.setAttribute("aria-invalid", "true");
      r.setAttribute("aria-describedby", "ct-inquirer-err");
    });
  }
  function clearInquirerError() {
    if (inquirerErr) {
      inquirerErr.textContent = "";
      inquirerErr.hidden = true;
    }
    if (inquirerBox) inquirerBox.removeAttribute("aria-describedby");
    Array.prototype.forEach.call(radios(), function (r) {
      r.removeAttribute("aria-invalid");
      r.removeAttribute("aria-describedby");
    });
  }

  function val(name) {
    var f = form.elements[name];
    return f && typeof f.value === "string" ? f.value.trim() : "";
  }

  /** Value of a field only while it is shown (hidden conditional fields are never sent). */
  function shown(name) {
    var f = form.elements[name];
    if (!f || !f.id || f.closest("[hidden]")) return "";
    return typeof f.value === "string" ? f.value.trim() : "";
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

  var CHECKED = ["inquiry_type", "organization", "position", "website", "business_purpose", "partnership_goal", "investor_info", "name", "email", "phone", "platform", "topic", "environment", "error_detail", "reference_id", "subject", "message", "reference_url", "privacy_consent"];

  function validateAll() {
    var first = null;
    if (!inquirer()) {
      setInquirerError(T.errInquirer || T.errRequired);
      first = radios()[0] || null;
    } else {
      clearInquirerError();
    }
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
    if (f && f.getAttribute && f.getAttribute("aria-invalid") === "true" && f.name !== "inquirer" && !checkField(f)) clearFieldError(f);
  });
  form.addEventListener("change", function (ev) {
    var f = ev.target;
    if (f && f.getAttribute && f.getAttribute("aria-invalid") === "true" && f.name !== "inquirer" && !checkField(f)) clearFieldError(f);
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

  /* ── payload: the form fields (shown ones only) + classification ids + source / page / lang / submitted_at ── */
  function optionText(sel) {
    if (!sel || !sel.value) return "";
    var o = sel.options[sel.selectedIndex];
    return o ? o.text : sel.value;
  }

  function fingerprint(p) {
    var s = [p.email, p.inquirer_id, p.inquiry_id, p.platform_id, p.topic_id || "", p.subject, p.message].join("\u0001");
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function newRef() {
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    var r = "";
    try {
      var a = new Uint8Array(4);
      (window.crypto || window.msCrypto).getRandomValues(a);
      for (var i = 0; i < a.length; i++) r += ("0" + a[i].toString(16)).slice(-2);
    } catch (err) {
      r = Math.random().toString(16).slice(2, 10);
    }
    return "NW-" + ymd + "-" + r.toUpperCase();
  }

  function readLast() {
    try {
      return JSON.parse(sessionStorage.getItem(DUP_KEY) || "null");
    } catch (err) {
      return null;
    }
  }
  function writeLast(v) {
    try {
      sessionStorage.setItem(DUP_KEY, JSON.stringify(v));
    } catch (err) {
      /* ignore */
    }
  }

  var attempt = null; // { fp, ref } — a retry of the same content keeps its client_ref

  function buildPayload() {
    var who = inquirer();
    var what = inquiry();
    var plat = platform();
    var t = topic();
    var cat = category();
    var catLabel = labelOf(cfg.categories, cat);
    var platCode = plat ? plat.toUpperCase() : "-";
    var classes = cat + "/" + (what || "-") + (t ? "/" + t.id : "");
    var p = {
      _subject: "[NEWON Contact][" + platCode + "][" + classes + "] " + val("subject"),
      _template: "table",
      _captcha: "false",
      _replyto: val("email"),
      submitted_at: new Date().toISOString(),
      client_ref: "",
      platform: plat ? (cfg.platformLabels || {})[plat] || plat : "-",
      platform_id: plat || "-",
      type: catLabel,
      type_id: cat,
      inquirer: labelOf(cfg.inquirers, who),
      inquirer_id: who,
      inquiry_type: optionText(typeSel),
      inquiry_id: what,
    };
    if (t) {
      p.topic = t.label;
      p.topic_id = t.id;
    }
    p.source = sourceOf();
    var legacy = cleanParam("legacy", 200);
    if (legacy) p.legacy = legacy;
    p.name = val("name");
    p.email = val("email");
    [["organization", "organization"], ["position", "position"], ["partnership_goal", "partnership_goal"], ["investor_info", "investor_info"], ["environment", "environment"], ["error_detail", "error_detail"], ["reference_id", "reference_id"]].forEach(function (k) {
      var v = shown(k[0]);
      if (v) p[k[1]] = v;
    });
    if (shown("business_purpose")) p.business_purpose = optionText(form.elements.business_purpose);
    if (!emptyUrl(shown("website"))) p.website = shown("website");
    if (val("phone")) p.phone = val("phone");
    p.subject = val("subject");
    p.message = message ? message.value.trim() : "";
    if (!emptyUrl(val("reference_url"))) p.reference_url = val("reference_url");
    p.privacy_consent = "yes";
    p.page = String(location.href || "").split("#")[0];
    p.lang = cfg.lang || document.documentElement.lang || "";
    var fp = fingerprint(p);
    if (!attempt || attempt.fp !== fp) attempt = { fp: fp, ref: newRef() };
    p.client_ref = attempt.ref;
    p._fp = fp;
    return p;
  }

  function mailtoHref(p) {
    var keys = ["client_ref", "platform", "type", "inquirer", "inquiry_type", "topic", "source", "organization", "position", "business_purpose", "partnership_goal", "investor_info", "website", "name", "email", "phone", "environment", "reference_id", "subject", "reference_url"];
    var lines = [];
    keys.forEach(function (k) {
      if (p[k]) lines.push(k + ": " + p[k]);
    });
    if (p.error_detail) lines.push("", "error_detail:", String(p.error_detail).slice(0, 600));
    lines.push("", String(p.message || "").slice(0, 1500));
    return "mailto:" + INBOX + "?subject=" + encodeURIComponent(p._subject || (T.mailSubject || "NEWON inquiry") + " — " + (p.subject || "")) + "&body=" + encodeURIComponent(lines.join("\n"));
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
    var body = {};
    Object.keys(payload).forEach(function (k) {
      if (k !== "_fp") body[k] = payload[k];
    });
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, TIMEOUT_MS);
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined,
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
    })
      .then(
        function (res) {
          return res.json().then(
            function (data) {
              return { res: res, data: data };
            },
            function () {
              return { res: res, data: null };
            }
          );
        },
        function () {
          throw new Error("ct-network");
        }
      )
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

  function onSuccess(payload) {
    if (failBox) failBox.hidden = true;
    writeLast({ fp: payload._fp, at: Date.now() });
    if (successMeta) {
      var parts = [payload.platform !== "-" ? payload.platform : "", payload.inquiry_type, payload.topic || ""].filter(Boolean);
      successMeta.textContent = parts.length ? (T.successMetaLabel ? T.successMetaLabel + ": " : "") + parts.join(" · ") : "";
      successMeta.hidden = !parts.length;
    }
    form.hidden = true;
    if (successBox) {
      successBox.hidden = false;
      focusEl(successBox);
    }
  }

  function onFail(payload, err) {
    if (mailtoLink) mailtoLink.href = mailtoHref(payload);
    if (failBody) {
      var net = err && err.message === "ct-network";
      var server = err && err.message === "ct-not-confirmed";
      failBody.textContent = net ? T.failNetBody || T.failBody : server ? T.failServerBody || T.failBody : T.failNetBody || T.failBody;
    }
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
    var last = readLast();
    if (last && last.fp === payload._fp && Date.now() - last.at < DUP_MS) {
      showAlert(T.duplicate || "");
      return;
    }
    sending = true;
    setBusy(true);
    post(payload)
      .then(function () {
        sending = false;
        setBusy(false);
        onSuccess(payload);
      })
      .catch(function (err) {
        sending = false;
        setBusy(false);
        onFail(payload, err);
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
      attempt = null;
      clearInquirerError();
      topicFor = null;
      sync();
      updateUrl();
      updateCount();
      successBox.hidden = true;
      form.hidden = false;
      loadedAt = Date.now();
      focusEl(radios()[0] || typeSel);
    });
  }

  sync();

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
