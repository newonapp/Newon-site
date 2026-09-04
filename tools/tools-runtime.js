/**
 * Tools runtime — mounts interactive UI for each tool detail page.
 * All tools remain client-side except QR image generation (external API).
 * Analytics never receives user input content (JSON, URLs, passwords, text).
 */
(function () {
  "use strict";

  var mount = document.querySelector("[data-tool-mount]");
  if (!mount) return;
  var slug = mount.getAttribute("data-tool-mount");
  if (window.newonTrack) window.newonTrack(window.newonAnalyticsEvents.TOOL_OPEN, { toolId: slug });

  var I18N = {};
  try {
    var raw = document.getElementById("tool-runtime-i18n");
    if (raw && raw.textContent) I18N = JSON.parse(raw.textContent) || {};
  } catch (e) {
    I18N = {};
  }

  function t(key, fallback) {
    var v = I18N[key];
    return v != null && v !== "" ? v : fallback;
  }

  function trackUse() {
    if (window.newonTrack) window.newonTrack(window.newonAnalyticsEvents.TOOL_USE, { toolId: slug });
  }
  function trackComplete() {
    if (window.newonTrack) window.newonTrack(window.newonAnalyticsEvents.TOOL_COMPLETE, { toolId: slug });
  }
  function trackCopy() {
    if (window.newonTrack && window.newonAnalyticsEvents.TOOL_COPY) {
      window.newonTrack(window.newonAnalyticsEvents.TOOL_COPY, { toolId: slug });
    }
  }

  function toast(msg) {
    var el = document.querySelector("[data-tools-toast]");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(function () {
      el.hidden = true;
    }, 1600);
  }

  function markCopied(btn) {
    if (!btn) return;
    if (!btn.getAttribute("data-copy-label")) {
      btn.setAttribute("data-copy-label", btn.textContent || t("copy", "Copy"));
    }
    btn.textContent = t("copied", "Copied ✓");
    window.clearTimeout(btn._copyT);
    btn._copyT = window.setTimeout(function () {
      btn.textContent = btn.getAttribute("data-copy-label") || t("copy", "Copy");
    }, 1500);
  }

  function copyText(text, btn) {
    if (!text) return;
    function done() {
      toast(t("copied", "Copied ✓"));
      markCopied(btn);
      trackCopy();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {});
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {}
    document.body.removeChild(ta);
  }

  function qrImageUrl(data, size) {
    size = size || 220;
    return (
      "https://api.qrserver.com/v1/create-qr-code/?size=" +
      size +
      "x" +
      size +
      "&data=" +
      encodeURIComponent(data)
    );
  }

  /** Expand 3-digit HEX and validate; returns uppercase 6-char without # or null. */
  function normalizeHex(hex) {
    if (!hex) return null;
    hex = String(hex).trim().replace(/^#/, "");
    if (hex.length === 3 && /^[0-9a-fA-F]{3}$/.test(hex)) {
      hex = hex
        .split("")
        .map(function (c) {
          return c + c;
        })
        .join("");
    }
    if (hex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(hex)) return null;
    return hex.toUpperCase();
  }

  function hexToRgb(hex6) {
    var n = parseInt(hex6, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h = 0,
      s,
      l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        default:
          h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  function passwordStrength(pw) {
    var score = 0;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return t("weak", "Weak");
    if (score <= 3) return t("medium", "Medium");
    return t("strong", "Strong");
  }

  function parseWebsiteUrl(raw) {
    var v = String(raw || "").trim();
    if (!v) return { error: "empty" };
    var candidates = [v];
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) {
      candidates.push("https://" + v);
    }
    for (var i = 0; i < candidates.length; i++) {
      try {
        var u = new URL(candidates[i]);
        if (u.protocol !== "http:" && u.protocol !== "https:") continue;
        return { url: u };
      } catch (e) {}
    }
    return { error: "invalid" };
  }

  var html = {
    qr:
      '<label for="qr-in">' +
      t("qrLabel", "URL / Text") +
      '</label><input type="text" id="qr-in" placeholder="' +
      t("qrPlaceholder", "https://newon.app") +
      '" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="qr-go">' +
      t("generate", "Generate") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="qr-copy">' +
      t("copyUrl", "Copy URL") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="qr-reset">' +
      t("reset", "Reset") +
      "</button></div>" +
      '<div class="tool-output" id="qr-out" aria-live="polite">' +
      t("enterUrlText", "Enter text or URL") +
      "</div>" +
      '<div class="tool-actions"><a class="btn btn-ghost" id="qr-dl" hidden download="newon-qr.png">' +
      t("downloadPng", "Download PNG") +
      "</a></div>",
    "random-picker":
      '<div class="rp" data-rp>' +
      '<section class="rp__stage" aria-live="polite">' +
      '<div class="rp__stage-top">' +
      '<p class="rp__kicker">' +
      t("result", "Result") +
      '</p>' +
      '<span class="rp__pool" id="rp-pool">0 ' +
      t("inPoolPlural", "in pool") +
      "</span>" +
      "</div>" +
      '<div class="rp__result is-idle" id="rp-out"><span>' +
      t("poolReady", "Ready to pick") +
      "</span></div>" +
      '<p class="rp__hint" id="rp-hint">' +
      t("poolHint", "Pick one item at random from your list") +
      "</p>" +
      "</section>" +
      '<section class="rp__editor">' +
      '<div class="rp__editor-head">' +
      '<label for="rp-in">' +
      t("itemsLabel", "Items") +
      " <em>" +
      t("itemsHint", "one per line") +
      "</em></label>" +
      '<span class="rp__count" id="rp-count">0 ' +
      t("itemPlural", "items") +
      "</span>" +
      "</div>" +
      '<textarea id="rp-in" rows="8" spellcheck="false">Apple\nBanana\nOrange</textarea>' +
      '<div class="rp__chips" id="rp-chips" aria-hidden="true"></div>' +
      '<div class="rp__actions">' +
      '<button type="button" class="btn btn-primary rp__pick" id="rp-go">' +
      t("pick", "Pick") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="rp-again">' +
      t("again", "Again") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="rp-clear">' +
      t("clear", "Clear") +
      "</button>" +
      "</div>" +
      "</section>" +
      "</div>",
    wheel:
      '<label for="wh-in">' +
      t("itemsLabel", "Items") +
      " (" +
      t("itemsHint", "one per line") +
      ')</label><textarea id="wh-in" rows="6" placeholder="A&#10;B&#10;C"></textarea>' +
      '<div class="tool-wheel__pointer" aria-hidden="true"></div><div class="tool-wheel" id="wh-wheel" aria-hidden="true"></div>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="wh-go">' +
      t("spin", "Spin") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="wh-reset">' +
      t("reset", "Reset") +
      "</button></div>" +
      '<div class="tool-output" id="wh-out" aria-live="polite">—</div>',
    dday:
      '<label for="dd-in">' +
      t("targetDate", "Target date") +
      '</label><input type="date" id="dd-in" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="dd-go">' +
      t("calculate", "Calculate") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="dd-copy">' +
      t("copyResult", "Copy result") +
      "</button></div>" +
      '<div class="tool-output" id="dd-out" aria-live="polite">—</div>',
    counter:
      '<label for="ct-in">' +
      t("textLabel", "Text") +
      '</label><textarea id="ct-in" rows="10" placeholder="…"></textarea>' +
      '<div class="tool-stats" id="ct-out" aria-live="polite">' +
      "<div><span>" +
      t("characters", "Characters") +
      "</span><strong>0</strong></div>" +
      "<div><span>" +
      t("noSpaces", "No spaces") +
      "</span><strong>0</strong></div>" +
      "<div><span>" +
      t("words", "Words") +
      "</span><strong>0</strong></div>" +
      "<div><span>" +
      t("lines", "Lines") +
      "</span><strong>0</strong></div></div>",
    password:
      '<label for="pw-len">' +
      t("length", "Length") +
      '</label><input type="number" id="pw-len" value="16" min="8" max="64" />' +
      '<div class="tool-checks">' +
      '<label><input type="checkbox" id="pw-upper" checked /> ' +
      t("uppercase", "Uppercase") +
      "</label>" +
      '<label><input type="checkbox" id="pw-lower" checked /> ' +
      t("lowercase", "Lowercase") +
      "</label>" +
      '<label><input type="checkbox" id="pw-num" checked /> ' +
      t("numbers", "Numbers") +
      "</label>" +
      '<label><input type="checkbox" id="pw-sym" checked /> ' +
      t("symbols", "Symbols") +
      "</label></div>" +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="pw-go">' +
      t("generate", "Generate") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="pw-copy">' +
      t("copy", "Copy") +
      "</button></div>" +
      '<div class="tool-output" id="pw-out" aria-live="polite">—</div>',
    uuid:
      '<label for="uuid-n">' +
      t("count", "Count") +
      '</label><input type="number" id="uuid-n" value="1" min="1" max="50" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="uuid-go">' +
      t("generate", "Generate") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="uuid-copy">' +
      t("copy", "Copy") +
      "</button></div>" +
      '<div class="tool-output" id="uuid-out" aria-live="polite">—</div>',
    json:
      '<label for="js-in">' +
      t("jsonLabel", "JSON") +
      '</label><textarea id="js-in" rows="12" placeholder=\'{"ok":true}\'></textarea>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="js-go">' +
      t("format", "Format") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="js-min">' +
      t("minify", "Minify") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="js-val">' +
      t("validate", "Validate") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="js-copy">' +
      t("copy", "Copy") +
      "</button></div>" +
      '<div class="tool-output" id="js-out" aria-live="polite">—</div>',
    color:
      '<label for="co-in">' +
      t("hexLabel", "HEX") +
      '</label><input type="text" id="co-in" placeholder="#0A0A0A" />' +
      '<div class="tool-color-swatch" id="co-swatch" aria-hidden="true"></div>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="co-go">' +
      t("convert", "Convert") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="co-copy">' +
      t("copyRgb", "Copy RGB") +
      "</button></div>" +
      '<div class="tool-output" id="co-out" aria-live="polite">—</div>',
    percent:
      '<label for="pc-mode">' +
      t("mode", "Mode") +
      '</label><select id="pc-mode">' +
      '<option value="of">' +
      t("modeOf", "What is X% of Y?") +
      "</option>" +
      '<option value="is">' +
      t("modeIs", "X is what % of Y?") +
      "</option>" +
      '<option value="change">' +
      t("modeChange", "% change from X to Y") +
      "</option></select>" +
      '<label for="pc-a">' +
      t("valueA", "Value A") +
      '</label><input type="number" id="pc-a" />' +
      '<label for="pc-b">' +
      t("valueB", "Value B") +
      '</label><input type="number" id="pc-b" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="pc-go">' +
      t("calculate", "Calculate") +
      "</button></div>" +
      '<div class="tool-output" id="pc-out" aria-live="polite">—</div>',
    subscription:
      '<label for="sub-in">' +
      t("subLabel", "Subscriptions (name, monthly price — one per line)") +
      '</label>' +
      '<textarea id="sub-in" rows="7" placeholder="' +
      t("subPlaceholder", "Netflix, 17000") +
      '"></textarea>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="sub-go">' +
      t("calculate", "Calculate") +
      "</button></div>" +
      '<div class="tool-output" id="sub-out" aria-live="polite">—</div>',
    date:
      '<label for="dt-a">' +
      t("start", "Start") +
      '</label><input type="date" id="dt-a" />' +
      '<label for="dt-b">' +
      t("end", "End") +
      '</label><input type="date" id="dt-b" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="dt-go">' +
      t("calculate", "Calculate") +
      "</button></div>" +
      '<div class="tool-output" id="dt-out" aria-live="polite">—</div>',
    utm:
      '<label for="utm-url">' +
      t("websiteUrl", "Website URL") +
      '</label><input type="url" id="utm-url" placeholder="https://example.com/page" autocomplete="url" />' +
      '<label for="utm-source">' +
      t("utmSource", "utm_source") +
      '</label><input type="text" id="utm-source" placeholder="newsletter" />' +
      '<label for="utm-medium">' +
      t("utmMedium", "utm_medium") +
      '</label><input type="text" id="utm-medium" placeholder="email" />' +
      '<label for="utm-campaign">' +
      t("utmCampaign", "utm_campaign") +
      '</label><input type="text" id="utm-campaign" placeholder="spring_sale" />' +
      '<label for="utm-term">' +
      t("utmTerm", "utm_term") +
      " <em>(" +
      t("optional", "optional") +
      ')</em></label><input type="text" id="utm-term" />' +
      '<label for="utm-content">' +
      t("utmContent", "utm_content") +
      " <em>(" +
      t("optional", "optional") +
      ')</em></label><input type="text" id="utm-content" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="utm-go">' +
      t("generate", "Generate") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="utm-copy">' +
      t("copy", "Copy") +
      '</button>' +
      '<button type="button" class="btn btn-ghost" id="utm-reset">' +
      t("reset", "Reset") +
      "</button></div>" +
      '<p class="tool-output-label" id="utm-out-label">' +
      t("generatedUrl", "Generated URL") +
      "</p>" +
      '<div class="tool-output tool-output--url" id="utm-out" aria-live="polite">—</div>',
  };

  mount.innerHTML = html[slug] || "<p>" + t("comingSoon", "Tool coming soon.") + "</p>";

  if (slug === "qr") {
    var lastQr = "";
    document.getElementById("qr-go").addEventListener("click", function () {
      trackUse();
      var v = document.getElementById("qr-in").value.trim();
      var out = document.getElementById("qr-out");
      var dl = document.getElementById("qr-dl");
      if (!v) {
        out.textContent = t("enterUrlText", "Enter text or URL");
        dl.hidden = true;
        return;
      }
      lastQr = qrImageUrl(v, 240);
      out.innerHTML = '<img alt="QR" width="200" height="200" src="' + lastQr + '" />';
      dl.href = lastQr;
      dl.hidden = false;
      toast(t("generated", "Generated"));
      trackComplete();
    });
    document.getElementById("qr-copy").addEventListener("click", function () {
      copyText(document.getElementById("qr-in").value.trim(), this);
    });
    document.getElementById("qr-reset").addEventListener("click", function () {
      document.getElementById("qr-in").value = "";
      document.getElementById("qr-out").textContent = t("enterUrlText", "Enter text or URL");
      document.getElementById("qr-dl").hidden = true;
    });
  }

  if (slug === "random-picker") {
    var rpIn = document.getElementById("rp-in");
    var rpOut = document.getElementById("rp-out");
    var rpCount = document.getElementById("rp-count");
    var rpPool = document.getElementById("rp-pool");
    var rpChips = document.getElementById("rp-chips");
    var rpHint = document.getElementById("rp-hint");
    var lastPick = "";

    function rpItems() {
      return rpIn.value
        .split("\n")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
    }

    function rpRenderChips(items) {
      if (!rpChips) return;
      if (!items.length) {
        rpChips.innerHTML = "";
        return;
      }
      var max = 12;
      var shown = items.slice(0, max);
      rpChips.innerHTML = shown
        .map(function (item, i) {
          var active = lastPick && item === lastPick ? " rp__chip--picked" : "";
          return (
            '<span class="rp__chip' +
            active +
            '"><i>' +
            String(i + 1).padStart(2, "0") +
            "</i>" +
            escapeHtmlLite(item) +
            "</span>"
          );
        })
        .join("");
      if (items.length > max) {
        rpChips.innerHTML += '<span class="rp__chip rp__chip--more">+' + (items.length - max) + "</span>";
      }
    }

    function escapeHtmlLite(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function rpUpdateCount() {
      var items = rpItems();
      var n = items.length;
      rpCount.textContent = n + " " + (n === 1 ? t("itemSingular", "item") : t("itemPlural", "items"));
      if (rpPool)
        rpPool.textContent =
          n + " " + (n === 1 ? t("inPoolSingular", "in pool") : t("inPoolPlural", "in pool"));
      rpRenderChips(items);
      if (!n) {
        lastPick = "";
        rpOut.className = "rp__result is-idle";
        rpOut.innerHTML = "<span>" + t("poolEmpty", "Add items to begin") + "</span>";
        if (rpHint) rpHint.textContent = t("poolHintAdd", "Enter one item per line");
      }
    }

    function rpPick() {
      trackUse();
      var items = rpItems();
      if (!items.length) {
        lastPick = "";
        rpOut.className = "rp__result is-idle";
        rpOut.innerHTML = "<span>" + t("poolNeedOne", "Add at least one item") + "</span>";
        if (rpHint) rpHint.textContent = t("poolHintAdd", "Enter one item per line");
        rpRenderChips(items);
        return;
      }
      var pick = items[Math.floor(Math.random() * items.length)];
      lastPick = pick;
      rpOut.className = "rp__result is-picking";
      rpOut.innerHTML = "<span>…</span>";
      window.setTimeout(function () {
        rpOut.className = "rp__result is-done";
        rpOut.innerHTML = "<strong>" + escapeHtmlLite(pick) + "</strong>";
        if (rpHint) rpHint.textContent = t("poolHintAgain", "Use Again to pick once more");
        rpRenderChips(items);
        toast(t("picked", "Picked"));
        trackComplete();
      }, 280);
    }

    rpIn.addEventListener("input", rpUpdateCount);
    document.getElementById("rp-go").addEventListener("click", rpPick);
    document.getElementById("rp-again").addEventListener("click", rpPick);
    document.getElementById("rp-clear").addEventListener("click", function () {
      rpIn.value = "";
      lastPick = "";
      rpUpdateCount();
      rpOut.className = "rp__result is-idle";
      rpOut.innerHTML = "<span>" + t("poolReady", "Ready to pick") + "</span>";
      if (rpHint) rpHint.textContent = t("poolHint", "Pick one item at random from your list");
      rpIn.focus();
    });
    rpUpdateCount();
  }

  if (slug === "wheel") {
    var whIn = document.getElementById("wh-in");
    var wheel = document.getElementById("wh-wheel");
    var rot = 0;
    function paintWheel(items) {
      if (!items.length) {
        wheel.style.background = "var(--tools-soft, #f7f7f5)";
        return;
      }
      var step = 360 / items.length;
      var parts = items.map(function (_, i) {
        var a = i * step;
        var b = (i + 1) * step;
        var c = i % 2 === 0 ? "#111" : "#888";
        return c + " " + a + "deg " + b + "deg";
      });
      wheel.style.background = "conic-gradient(" + parts.join(",") + ")";
    }
    whIn.addEventListener("input", function () {
      paintWheel(
        whIn.value
          .split("\n")
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)
      );
    });
    document.getElementById("wh-go").addEventListener("click", function () {
      trackUse();
      var items = whIn.value
        .split("\n")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      if (!items.length) {
        document.getElementById("wh-out").textContent = t("addItems", "Add items");
        return;
      }
      paintWheel(items);
      var idx = Math.floor(Math.random() * items.length);
      rot += 1440 + (360 - (idx * 360) / items.length);
      wheel.style.transform = "rotate(" + rot + "deg)";
      window.setTimeout(function () {
        document.getElementById("wh-out").textContent = items[idx];
        toast(t("resultReady", "Result ready"));
        trackComplete();
      }, 2400);
    });
    document.getElementById("wh-reset").addEventListener("click", function () {
      whIn.value = "";
      document.getElementById("wh-out").textContent = "—";
      rot = 0;
      wheel.style.transform = "rotate(0deg)";
      paintWheel([]);
    });
  }

  if (slug === "dday") {
    var lastDd = "";
    document.getElementById("dd-go").addEventListener("click", function () {
      trackUse();
      var d = document.getElementById("dd-in").value;
      if (!d) return;
      var diff = Math.ceil((new Date(d + "T00:00:00") - new Date()) / 86400000);
      var label = diff >= 0 ? "D − " + diff : "D + " + Math.abs(diff);
      var weeks = Math.round(Math.abs(diff) / 7);
      var months = Math.round(Math.abs(diff) / 30.44);
      lastDd =
        label +
        " · ~" +
        weeks +
        " " +
        t("weeks", "weeks") +
        " · ~" +
        months +
        " " +
        t("months", "months");
      document.getElementById("dd-out").textContent = lastDd;
      trackComplete();
    });
    document.getElementById("dd-copy").addEventListener("click", function () {
      copyText(lastDd || document.getElementById("dd-out").textContent, this);
    });
  }

  if (slug === "counter") {
    document.getElementById("ct-in").addEventListener("input", function () {
      trackUse();
      var txt = this.value;
      var noSpace = txt.replace(/\s/g, "").length;
      var words = txt.trim() ? txt.trim().split(/\s+/).length : 0;
      var lines = txt ? txt.split("\n").length : 0;
      var stats = document.querySelectorAll("#ct-out strong");
      stats[0].textContent = String(txt.length);
      stats[1].textContent = String(noSpace);
      stats[2].textContent = String(words);
      stats[3].textContent = String(lines);
    });
  }

  if (slug === "password") {
    document.getElementById("pw-go").addEventListener("click", function () {
      trackUse();
      var len = parseInt(document.getElementById("pw-len").value, 10) || 16;
      len = Math.max(8, Math.min(64, len));
      var sets = [];
      if (document.getElementById("pw-upper").checked) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
      if (document.getElementById("pw-lower").checked) sets.push("abcdefghijklmnopqrstuvwxyz");
      if (document.getElementById("pw-num").checked) sets.push("0123456789");
      if (document.getElementById("pw-sym").checked) sets.push("!@#$%^&*()-_=+[]{}");
      if (!sets.length) {
        document.getElementById("pw-out").textContent = t("selectCharset", "Select at least one character set");
        return;
      }
      var chars = sets.join("");
      var out = "";
      var arr = new Uint32Array(len);
      if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(arr);
      for (var i = 0; i < len; i++) {
        var r = arr[i] != null ? arr[i] : Math.floor(Math.random() * chars.length);
        out += chars[r % chars.length];
      }
      document.getElementById("pw-out").textContent =
        out + "\n\n" + t("strength", "Strength") + ": " + passwordStrength(out);
      toast(t("generated", "Generated"));
      trackComplete();
    });
    document.getElementById("pw-copy").addEventListener("click", function () {
      var text = document.getElementById("pw-out").textContent.split("\n")[0];
      copyText(text === "—" ? "" : text, this);
    });
  }

  if (slug === "uuid") {
    document.getElementById("uuid-go").addEventListener("click", function () {
      trackUse();
      var n = parseInt(document.getElementById("uuid-n").value, 10) || 1;
      n = Math.max(1, Math.min(50, n));
      var lines = [];
      for (var i = 0; i < n; i++) {
        lines.push(crypto.randomUUID ? crypto.randomUUID() : "uuid-unavailable");
      }
      document.getElementById("uuid-out").textContent = lines.join("\n");
      toast(t("generated", "Generated"));
      trackComplete();
    });
    document.getElementById("uuid-copy").addEventListener("click", function () {
      copyText(document.getElementById("uuid-out").textContent, this);
    });
  }

  if (slug === "json") {
    function runJson(mode) {
      trackUse();
      var rawJson = document.getElementById("js-in").value;
      var out = document.getElementById("js-out");
      try {
        var obj = JSON.parse(rawJson);
        if (mode === "minify") out.textContent = JSON.stringify(obj);
        else if (mode === "validate") out.textContent = t("validJson", "Valid JSON ✓");
        else out.textContent = JSON.stringify(obj, null, 2);
        toast(mode === "validate" ? t("validJson", "Valid") : t("generated", "Formatted"));
        trackComplete();
      } catch (err) {
        out.textContent = t("invalidJson", "Invalid JSON") + ": " + err.message;
      }
    }
    document.getElementById("js-go").addEventListener("click", function () {
      runJson("format");
    });
    document.getElementById("js-min").addEventListener("click", function () {
      runJson("minify");
    });
    document.getElementById("js-val").addEventListener("click", function () {
      runJson("validate");
    });
    document.getElementById("js-copy").addEventListener("click", function () {
      copyText(document.getElementById("js-out").textContent, this);
    });
  }

  if (slug === "color") {
    var lastRgb = "";
    document.getElementById("co-go").addEventListener("click", function () {
      trackUse();
      var hex6 = normalizeHex(document.getElementById("co-in").value);
      if (!hex6) {
        document.getElementById("co-out").textContent = t(
          "hexHint",
          "Use a 3 or 6 digit HEX value (e.g. #0A0A0A)"
        );
        return;
      }
      var rgb = hexToRgb(hex6);
      if (!rgb) {
        document.getElementById("co-out").textContent = t(
          "hexHint",
          "Use a 3 or 6 digit HEX value (e.g. #0A0A0A)"
        );
        return;
      }
      var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      lastRgb = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
      document.getElementById("co-swatch").style.background = lastRgb;
      document.getElementById("co-out").textContent =
        "#" + hex6 + "\n" + lastRgb + "\nhsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
      trackComplete();
    });
    document.getElementById("co-copy").addEventListener("click", function () {
      copyText(lastRgb, this);
    });
  }

  if (slug === "percent") {
    document.getElementById("pc-go").addEventListener("click", function () {
      trackUse();
      var mode = document.getElementById("pc-mode").value;
      var a = parseFloat(document.getElementById("pc-a").value);
      var b = parseFloat(document.getElementById("pc-b").value);
      var out = document.getElementById("pc-out");
      if (Number.isNaN(a) || Number.isNaN(b)) {
        out.textContent = t("enterBoth", "Enter both values");
        return;
      }
      if (mode === "of") out.textContent = ((a / 100) * b).toFixed(4).replace(/\.?0+$/, "");
      else if (mode === "is")
        out.textContent = b ? ((a / b) * 100).toFixed(2) + "%" : t("bCannotZero", "Value B cannot be 0");
      else
        out.textContent = a
          ? (((b - a) / a) * 100).toFixed(2) + "%"
          : t("aCannotZero", "Value A cannot be 0");
      trackComplete();
    });
  }

  if (slug === "subscription") {
    document.getElementById("sub-go").addEventListener("click", function () {
      trackUse();
      var lines = document
        .getElementById("sub-in")
        .value.split("\n")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      if (!lines.length) {
        document.getElementById("sub-out").textContent = t("addSubs", "Add subscriptions (name, price)");
        return;
      }
      var monthly = 0;
      var rows = [];
      lines.forEach(function (line) {
        var parts = line.split(/[,:]/);
        var name = (parts[0] || "Item").trim();
        var price = parseFloat((parts[1] || "").replace(/[^\d.]/g, "")) || 0;
        monthly += price;
        rows.push(name + ": ₩" + price.toLocaleString());
      });
      document.getElementById("sub-out").textContent =
        rows.join("\n") +
        "\n\n" +
        t("monthlyTotal", "Monthly total") +
        ": ₩" +
        monthly.toLocaleString() +
        "\n" +
        t("yearlyTotal", "Yearly total") +
        ": ₩" +
        (monthly * 12).toLocaleString();
      trackComplete();
    });
  }

  if (slug === "date") {
    document.getElementById("dt-go").addEventListener("click", function () {
      trackUse();
      var a = document.getElementById("dt-a").value;
      var b = document.getElementById("dt-b").value;
      if (!a || !b) return;
      var dayCount = Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
      var weeks = (dayCount / 7).toFixed(1);
      var months = (dayCount / 30.44).toFixed(1);
      document.getElementById("dt-out").textContent =
        dayCount +
        " " +
        t("days", "days") +
        "\n~" +
        weeks +
        " " +
        t("weeks", "weeks") +
        "\n~" +
        months +
        " " +
        t("months", "months");
      trackComplete();
    });
  }

  if (slug === "utm") {
    var lastUtm = "";
    document.getElementById("utm-go").addEventListener("click", function () {
      trackUse();
      var out = document.getElementById("utm-out");
      var parsed = parseWebsiteUrl(document.getElementById("utm-url").value);
      if (parsed.error === "empty") {
        lastUtm = "";
        out.textContent = t("enterWebsite", "Enter a website URL");
        return;
      }
      if (parsed.error === "invalid") {
        lastUtm = "";
        out.textContent = t("invalidUrl", "Enter a valid http(s) URL");
        return;
      }
      var source = document.getElementById("utm-source").value.trim();
      var medium = document.getElementById("utm-medium").value.trim();
      var campaign = document.getElementById("utm-campaign").value.trim();
      var term = document.getElementById("utm-term").value.trim();
      var content = document.getElementById("utm-content").value.trim();
      if (!source && !medium && !campaign && !term && !content) {
        lastUtm = "";
        out.textContent = t("needUtm", "Enter at least one UTM parameter");
        return;
      }
      var u = parsed.url;
      // Set/update only filled UTM fields; leave blank fields untouched (preserve existing).
      if (source) u.searchParams.set("utm_source", source);
      if (medium) u.searchParams.set("utm_medium", medium);
      if (campaign) u.searchParams.set("utm_campaign", campaign);
      if (term) u.searchParams.set("utm_term", term);
      if (content) u.searchParams.set("utm_content", content);
      lastUtm = u.toString();
      out.textContent = lastUtm;
      toast(t("generated", "Generated"));
      trackComplete();
    });
    document.getElementById("utm-copy").addEventListener("click", function () {
      copyText(lastUtm || document.getElementById("utm-out").textContent, this);
    });
    document.getElementById("utm-reset").addEventListener("click", function () {
      ["utm-url", "utm-source", "utm-medium", "utm-campaign", "utm-term", "utm-content"].forEach(
        function (id) {
          document.getElementById(id).value = "";
        }
      );
      lastUtm = "";
      document.getElementById("utm-out").textContent = "—";
    });
  }
})();
