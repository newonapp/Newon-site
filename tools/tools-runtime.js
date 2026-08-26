/**
 * Tools runtime — mounts interactive UI for each tool detail page.
 * All tools remain client-side except QR image generation (external API).
 */
(function () {
  "use strict";

  var mount = document.querySelector("[data-tool-mount]");
  if (!mount) return;
  var slug = mount.getAttribute("data-tool-mount");
  if (window.newonTrack) window.newonTrack(window.newonAnalyticsEvents.TOOL_OPEN, { toolId: slug });

  function trackUse() {
    if (window.newonTrack) window.newonTrack(window.newonAnalyticsEvents.TOOL_USE, { toolId: slug });
  }
  function trackComplete() {
    if (window.newonTrack) window.newonTrack(window.newonAnalyticsEvents.TOOL_COMPLETE, { toolId: slug });
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
      btn.setAttribute("data-copy-label", btn.textContent || "Copy");
    }
    btn.textContent = "Copied ✓";
    window.clearTimeout(btn._copyT);
    btn._copyT = window.setTimeout(function () {
      btn.textContent = btn.getAttribute("data-copy-label") || "Copy";
    }, 1500);
  }

  function copyText(text, btn) {
    if (!text) return;
    function done() {
      toast("Copied ✓");
      markCopied(btn);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done);
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

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map(function (c) {
          return c + c;
        })
        .join("");
    }
    if (hex.length !== 6) return null;
    var n = parseInt(hex, 16);
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
    if (score <= 2) return "Weak";
    if (score <= 3) return "Medium";
    return "Strong";
  }

  var html = {
    qr:
      '<label for="qr-in">URL / Text</label><input type="text" id="qr-in" placeholder="https://newon.app" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="qr-go">Generate</button>' +
      '<button type="button" class="btn btn-ghost" id="qr-copy">Copy URL</button>' +
      '<button type="button" class="btn btn-ghost" id="qr-reset">Reset</button></div>' +
      '<div class="tool-output" id="qr-out">Enter text or URL</div>' +
      '<div class="tool-actions"><a class="btn btn-ghost" id="qr-dl" hidden download="newon-qr.png">Download PNG</a></div>',
    "random-picker":
      '<div class="rp" data-rp>' +
      '<section class="rp__stage" aria-live="polite">' +
      '<div class="rp__stage-top">' +
      '<p class="rp__kicker">Result</p>' +
      '<span class="rp__pool" id="rp-pool">0 in pool</span>' +
      '</div>' +
      '<div class="rp__result is-idle" id="rp-out"><span>Ready to pick</span></div>' +
      '<p class="rp__hint" id="rp-hint">목록에서 항목을 무작위로 선택합니다</p>' +
      '</section>' +
      '<section class="rp__editor">' +
      '<div class="rp__editor-head">' +
      '<label for="rp-in">Items <em>one per line</em></label>' +
      '<span class="rp__count" id="rp-count">0 items</span>' +
      '</div>' +
      '<textarea id="rp-in" rows="8" spellcheck="false">Apple\nBanana\nOrange</textarea>' +
      '<div class="rp__chips" id="rp-chips" aria-hidden="true"></div>' +
      '<div class="rp__actions">' +
      '<button type="button" class="btn btn-primary rp__pick" id="rp-go">Pick</button>' +
      '<button type="button" class="btn btn-ghost" id="rp-again">Again</button>' +
      '<button type="button" class="btn btn-ghost" id="rp-clear">Clear</button>' +
      '</div>' +
      '</section>' +
      '</div>',
    wheel:
      '<label for="wh-in">Items (one per line)</label><textarea id="wh-in" rows="6" placeholder="A&#10;B&#10;C"></textarea>' +
      '<div class="tool-wheel__pointer" aria-hidden="true"></div><div class="tool-wheel" id="wh-wheel" aria-hidden="true"></div>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="wh-go">Spin</button>' +
      '<button type="button" class="btn btn-ghost" id="wh-reset">Reset</button></div>' +
      '<div class="tool-output" id="wh-out">—</div>',
    dday:
      '<label for="dd-in">Target date</label><input type="date" id="dd-in" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="dd-go">Calculate</button>' +
      '<button type="button" class="btn btn-ghost" id="dd-copy">Copy result</button></div>' +
      '<div class="tool-output" id="dd-out">—</div>',
    counter:
      '<label for="ct-in">Text</label><textarea id="ct-in" rows="10" placeholder="Type or paste…"></textarea>' +
      '<div class="tool-stats" id="ct-out">' +
      "<div><span>Characters</span><strong>0</strong></div>" +
      "<div><span>No spaces</span><strong>0</strong></div>" +
      "<div><span>Words</span><strong>0</strong></div>" +
      "<div><span>Lines</span><strong>0</strong></div></div>",
    password:
      '<label for="pw-len">Length</label><input type="number" id="pw-len" value="16" min="8" max="64" />' +
      '<div class="tool-checks">' +
      '<label><input type="checkbox" id="pw-upper" checked /> Uppercase</label>' +
      '<label><input type="checkbox" id="pw-lower" checked /> Lowercase</label>' +
      '<label><input type="checkbox" id="pw-num" checked /> Numbers</label>' +
      '<label><input type="checkbox" id="pw-sym" checked /> Symbols</label></div>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="pw-go">Generate</button>' +
      '<button type="button" class="btn btn-ghost" id="pw-copy">Copy</button></div>' +
      '<div class="tool-output" id="pw-out">—</div>',
    uuid:
      '<label for="uuid-n">Count</label><input type="number" id="uuid-n" value="1" min="1" max="50" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="uuid-go">Generate</button>' +
      '<button type="button" class="btn btn-ghost" id="uuid-copy">Copy</button></div>' +
      '<div class="tool-output" id="uuid-out">—</div>',
    json:
      '<label for="js-in">JSON</label><textarea id="js-in" rows="12" placeholder=\'{"ok":true}\'></textarea>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="js-go">Format</button>' +
      '<button type="button" class="btn btn-ghost" id="js-min">Minify</button>' +
      '<button type="button" class="btn btn-ghost" id="js-val">Validate</button>' +
      '<button type="button" class="btn btn-ghost" id="js-copy">Copy</button></div>' +
      '<div class="tool-output" id="js-out">—</div>',
    color:
      '<label for="co-in">HEX</label><input type="text" id="co-in" placeholder="#0A0A0A" />' +
      '<div class="tool-color-swatch" id="co-swatch" aria-hidden="true"></div>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="co-go">Convert</button>' +
      '<button type="button" class="btn btn-ghost" id="co-copy">Copy RGB</button></div>' +
      '<div class="tool-output" id="co-out">—</div>',
    percent:
      '<label for="pc-mode">Mode</label><select id="pc-mode">' +
      '<option value="of">What is X% of Y?</option>' +
      '<option value="is">X is what % of Y?</option>' +
      '<option value="change">% change from X to Y</option></select>' +
      '<label for="pc-a">Value A</label><input type="number" id="pc-a" />' +
      '<label for="pc-b">Value B</label><input type="number" id="pc-b" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="pc-go">Calculate</button></div>' +
      '<div class="tool-output" id="pc-out">—</div>',
    subscription:
      '<label for="sub-in">Subscriptions (name, monthly price — one per line)</label>' +
      '<textarea id="sub-in" rows="7" placeholder="Netflix, 17000&#10;Spotify, 10900"></textarea>' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="sub-go">Calculate</button></div>' +
      '<div class="tool-output" id="sub-out">—</div>',
    date:
      '<label for="dt-a">Start</label><input type="date" id="dt-a" />' +
      '<label for="dt-b">End</label><input type="date" id="dt-b" />' +
      '<div class="tool-actions"><button type="button" class="btn btn-primary" id="dt-go">Calculate</button></div>' +
      '<div class="tool-output" id="dt-out">—</div>',
  };

  mount.innerHTML = html[slug] || "<p>Tool coming soon.</p>";

  if (slug === "qr") {
    var lastQr = "";
    document.getElementById("qr-go").addEventListener("click", function () {
      trackUse();
      var v = document.getElementById("qr-in").value.trim();
      var out = document.getElementById("qr-out");
      var dl = document.getElementById("qr-dl");
      if (!v) {
        out.textContent = "Enter text or URL";
        dl.hidden = true;
        return;
      }
      lastQr = qrImageUrl(v, 240);
      out.innerHTML = '<img alt="QR" width="200" height="200" src="' + lastQr + '" />';
      dl.href = lastQr;
      dl.hidden = false;
      toast("Generated");
      trackComplete();
    });
    document.getElementById("qr-copy").addEventListener("click", function () {
      copyText(document.getElementById("qr-in").value.trim(), this);
    });
    document.getElementById("qr-reset").addEventListener("click", function () {
      document.getElementById("qr-in").value = "";
      document.getElementById("qr-out").textContent = "Enter text or URL";
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
      rpCount.textContent = n + (n === 1 ? " item" : " items");
      if (rpPool) rpPool.textContent = n + (n === 1 ? " in pool" : " in pool");
      rpRenderChips(items);
      if (!n) {
        lastPick = "";
        rpOut.className = "rp__result is-idle";
        rpOut.innerHTML = "<span>Add items to begin</span>";
        if (rpHint) rpHint.textContent = "한 줄에 하나씩 입력하세요";
      }
    }

    function rpPick() {
      trackUse();
      var items = rpItems();
      if (!items.length) {
        lastPick = "";
        rpOut.className = "rp__result is-idle";
        rpOut.innerHTML = "<span>Add at least one item</span>";
        if (rpHint) rpHint.textContent = "항목을 추가한 뒤 Pick을 누르세요";
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
        if (rpHint) rpHint.textContent = "Again으로 다시 뽑을 수 있습니다";
        rpRenderChips(items);
        toast("Picked");
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
      rpOut.innerHTML = "<span>Ready to pick</span>";
      if (rpHint) rpHint.textContent = "목록에서 항목을 무작위로 선택합니다";
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
        document.getElementById("wh-out").textContent = "Add items";
        return;
      }
      paintWheel(items);
      var idx = Math.floor(Math.random() * items.length);
      rot += 1440 + (360 - (idx * 360) / items.length);
      wheel.style.transform = "rotate(" + rot + "deg)";
      window.setTimeout(function () {
        document.getElementById("wh-out").textContent = items[idx];
        toast("Result ready");
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
      lastDd = label + " · ~" + weeks + " weeks · ~" + months + " months";
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
      var t = this.value;
      var noSpace = t.replace(/\s/g, "").length;
      var words = t.trim() ? t.trim().split(/\s+/).length : 0;
      var lines = t ? t.split("\n").length : 0;
      var stats = document.querySelectorAll("#ct-out strong");
      stats[0].textContent = String(t.length);
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
        document.getElementById("pw-out").textContent = "Select at least one character set";
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
      document.getElementById("pw-out").textContent = out + "\n\nStrength: " + passwordStrength(out);
      toast("Generated");
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
      toast("Generated");
      trackComplete();
    });
    document.getElementById("uuid-copy").addEventListener("click", function () {
      copyText(document.getElementById("uuid-out").textContent, this);
    });
  }

  if (slug === "json") {
    function runJson(mode) {
      trackUse();
      var raw = document.getElementById("js-in").value;
      var out = document.getElementById("js-out");
      try {
        var obj = JSON.parse(raw);
        if (mode === "minify") out.textContent = JSON.stringify(obj);
        else if (mode === "validate") out.textContent = "Valid JSON ✓";
        else out.textContent = JSON.stringify(obj, null, 2);
        toast(mode === "validate" ? "Valid" : "Formatted");
        trackComplete();
      } catch (e) {
        out.textContent = "Invalid JSON: " + e.message + "\nFix the syntax near the reported position.";
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
      var hex = document.getElementById("co-in").value.trim();
      var rgb = hexToRgb(hex);
      if (!rgb) {
        document.getElementById("co-out").textContent = "Use a 3 or 6 digit HEX value (e.g. #0A0A0A)";
        return;
      }
      var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      lastRgb = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
      document.getElementById("co-swatch").style.background = lastRgb;
      document.getElementById("co-out").textContent =
        "#" +
        hex.replace("#", "").toUpperCase().padStart(6, "0").slice(0, 6) +
        "\n" +
        lastRgb +
        "\nhsl(" +
        hsl.h +
        ", " +
        hsl.s +
        "%, " +
        hsl.l +
        "%)";
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
        out.textContent = "Enter both values";
        return;
      }
      if (mode === "of") out.textContent = ((a / 100) * b).toFixed(4).replace(/\.?0+$/, "");
      else if (mode === "is") out.textContent = b ? ((a / b) * 100).toFixed(2) + "%" : "Value B cannot be 0";
      else out.textContent = a ? (((b - a) / a) * 100).toFixed(2) + "%" : "Value A cannot be 0";
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
        document.getElementById("sub-out").textContent = "Add subscriptions (name, price)";
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
        "\n\nMonthly total: ₩" +
        monthly.toLocaleString() +
        "\nYearly total: ₩" +
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
      var days = Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
      var weeks = (days / 7).toFixed(1);
      var months = (days / 30.44).toFixed(1);
      document.getElementById("dt-out").textContent =
        days + " days\n~" + weeks + " weeks\n~" + months + " months";
      trackComplete();
    });
  }
})();
