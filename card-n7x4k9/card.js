(function () {
  var cfg = window.NEWON_CARD;
  if (!cfg || !cfg.links) return;

  var icons = {
    home:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>',
    store:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
    play:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M6.5 5.2 18.2 12 6.5 18.8z"/></svg>',
    portfolio:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><rect x="3.5" y="7.5" width="17" height="12" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M8 7.5V6.2A2.2 2.2 0 0 1 10.2 4h3.6A2.2 2.2 0 0 1 16 6.2v1.3"/></svg>',
    contact:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M4 6.5h16v11H4z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="m5 7.5 7 5.5 7-5.5"/></svg>',
    save:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="11" cy="8.2" r="2.7" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M5.8 18.2c.5-2.7 2.5-4.2 5.2-4.2s4.7 1.5 5.2 4.2"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M18.2 8.5v5.2M15.6 11.1h5.2"/></svg>',
  };

  function el(html) {
    var wrap = document.createElement("div");
    wrap.innerHTML = html.trim();
    return wrap.firstElementChild;
  }

  function vcardEscape(value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function buildVcard() {
    var v = cfg.vcard || {};
    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "PRODID:-//Newon//Business Card//EN",
      "N;CHARSET=UTF-8:;" + vcardEscape(v.nameKo) + ";;;",
      "FN;CHARSET=UTF-8:" + vcardEscape(v.nameKo),
      "NICKNAME;CHARSET=UTF-8:" + vcardEscape(v.nameEn),
      "ORG;CHARSET=UTF-8:" + vcardEscape(v.company),
      "TITLE;CHARSET=UTF-8:" + vcardEscape(v.title),
      "TEL;TYPE=CELL,VOICE,pref:" + vcardEscape(v.phone),
      "EMAIL;TYPE=INTERNET,WORK,pref:" + vcardEscape(v.email),
      "URL:" + vcardEscape(v.website),
      "END:VCARD",
      "",
    ].join("\r\n");
  }

  function isAppleTouch() {
    var ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function saveVcard(e) {
    var v = cfg.vcard || {};
    var filename = v.filename || "contact.vcf";
    if (isAppleTouch()) {
      return;
    }
    e.preventDefault();
    var blob = new Blob([buildVcard()], { type: "text/vcard;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  function rowMarkup(icon, label, hint) {
    return (
      '<span class="ncard__icon">' +
      icon +
      "</span>" +
      '<span class="ncard__meta">' +
      '<span class="ncard__label">' +
      label +
      "</span>" +
      (hint ? '<span class="ncard__hint">' + hint + "</span>" : "") +
      "</span>" +
      '<span class="ncard__go" aria-hidden="true"></span>'
    );
  }

  function makeLink(item, icon, aria) {
    var href = (item.href || "").trim();
    if (!href) {
      var disabled = el('<button type="button" class="ncard__item is-disabled" disabled></button>');
      disabled.innerHTML = rowMarkup(icon, item.label, item.hint);
      disabled.setAttribute("aria-label", item.label);
      return disabled;
    }
    var a = el('<a class="ncard__item"></a>');
    a.href = href;
    if (item.external) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    a.setAttribute("aria-label", aria || item.label);
    a.innerHTML = rowMarkup(icon, item.label, item.hint);
    return a;
  }

  function makeContact(item, icon) {
    var details = el('<details class="ncard-details"></details>');
    var summary = el('<summary class="ncard__item"></summary>');
    summary.setAttribute("aria-label", "Contact");
    summary.innerHTML = rowMarkup(icon, item.label, item.hint);
    details.appendChild(summary);

    var panel = el('<div class="ncard-details__panel"></div>');
    panel.appendChild(
      el(
        '<a class="ncard-details__link" href="' +
          item.phoneHref +
          '"><span class="ncard-details__kicker">Mobile</span><span class="ncard-details__value">' +
          item.phone +
          "</span></a>"
      )
    );
    panel.appendChild(
      el(
        '<a class="ncard-details__link" href="' +
          item.emailHref +
          '"><span class="ncard-details__kicker">Email</span><span class="ncard-details__value">' +
          item.email +
          "</span></a>"
      )
    );
    details.appendChild(panel);
    return details;
  }

  function makeVcard(item, icon) {
    var v = cfg.vcard || {};
    var file = v.file || "nawon-kyung.vcf";
    var a = el('<a class="ncard__item"></a>');
    a.href = file;
    a.setAttribute("download", v.filename || "nawon-kyung.vcf");
    a.setAttribute("aria-label", "Save contact");
    a.innerHTML = rowMarkup(icon, item.label, item.hint);
    a.addEventListener("click", saveVcard);
    return a;
  }

  var nav = document.getElementById("ncard-nav");
  if (!nav) return;

  var order = cfg.linkOrder || Object.keys(cfg.links);
  for (var i = 0; i < order.length; i++) {
    var key = order[i];
    var item = cfg.links[key];
    if (!item) continue;
    var icon = icons[item.icon] || icons.home;
    var type = item.type || "link";
    if (type === "contact") {
      nav.appendChild(makeContact(item, icon));
    } else if (type === "vcard") {
      nav.appendChild(makeVcard(item, icon));
    } else {
      nav.appendChild(makeLink(item, icon, item.label));
    }
  }
})();
