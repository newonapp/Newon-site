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

  var html = {
    qr: '<label>Text or URL</label><input type="text" id="qr-in" /><div class="tool-actions"><button type="button" class="btn btn-primary" id="qr-go">Generate</button></div><div class="tool-output" id="qr-out"></div>',
    "random-picker": '<label>Items (one per line)</label><textarea id="rp-in" rows="6"></textarea><div class="tool-actions"><button type="button" class="btn btn-primary" id="rp-go">Pick</button></div><div class="tool-output" id="rp-out"></div>',
    wheel: '<label>Items (one per line)</label><textarea id="wh-in" rows="6"></textarea><div class="tool-actions"><button type="button" class="btn btn-primary" id="wh-go">Spin</button></div><div class="tool-output" id="wh-out"></div>',
    dday: '<label>Target date</label><input type="date" id="dd-in" /><div class="tool-actions"><button type="button" class="btn btn-primary" id="dd-go">Calculate</button></div><div class="tool-output" id="dd-out"></div>',
    counter: '<label>Text</label><textarea id="ct-in" rows="8"></textarea><div class="tool-output" id="ct-out">Characters: 0 · Words: 0 · Lines: 0</div>',
    password: '<label>Length</label><input type="number" id="pw-len" value="16" min="8" max="64" /><div class="tool-actions"><button type="button" class="btn btn-primary" id="pw-go">Generate</button></div><div class="tool-output" id="pw-out"></div>',
    uuid: '<div class="tool-actions"><button type="button" class="btn btn-primary" id="uuid-go">Generate UUID</button></div><div class="tool-output" id="uuid-out"></div>',
    json: '<label>JSON</label><textarea id="js-in" rows="10"></textarea><div class="tool-actions"><button type="button" class="btn btn-primary" id="js-go">Format</button></div><div class="tool-output" id="js-out"></div>',
    color: '<label>HEX</label><input type="text" id="co-in" placeholder="#000000" /><div class="tool-actions"><button type="button" class="btn btn-primary" id="co-go">Convert</button></div><div class="tool-output" id="co-out"></div>',
    percent: '<label>Value</label><input type="number" id="pc-a" /><label>Total</label><input type="number" id="pc-b" /><div class="tool-actions"><button type="button" class="btn btn-primary" id="pc-go">Calculate</button></div><div class="tool-output" id="pc-out"></div>',
    subscription: '<label>Monthly price (₩)</label><input type="number" id="sub-p" /><label>Months</label><input type="number" id="sub-m" value="12" /><div class="tool-actions"><button type="button" class="btn btn-primary" id="sub-go">Calculate</button></div><div class="tool-output" id="sub-out"></div>',
    date: '<label>Start</label><input type="date" id="dt-a" /><label>End</label><input type="date" id="dt-b" /><div class="tool-actions"><button type="button" class="btn btn-primary" id="dt-go">Calculate</button></div><div class="tool-output" id="dt-out"></div>',
  };

  mount.innerHTML = html[slug] || "<p>Tool coming soon.</p>";

  if (slug === "qr") {
    document.getElementById("qr-go").addEventListener("click", function () {
      trackUse();
      var v = document.getElementById("qr-in").value.trim();
      document.getElementById("qr-out").innerHTML = v
        ? '<img alt="QR" width="200" height="200" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(v) + '" />'
        : "Enter text or URL";
      trackComplete();
    });
  }
  if (slug === "random-picker") {
    document.getElementById("rp-go").addEventListener("click", function () {
      trackUse();
      var items = document.getElementById("rp-in").value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      document.getElementById("rp-out").textContent = items.length ? items[Math.floor(Math.random() * items.length)] : "Add items";
      trackComplete();
    });
  }
  if (slug === "wheel") {
    document.getElementById("wh-go").addEventListener("click", function () {
      trackUse();
      var items = document.getElementById("wh-in").value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      document.getElementById("wh-out").textContent = items.length ? items[Math.floor(Math.random() * items.length)] : "Add items";
      trackComplete();
    });
  }
  if (slug === "dday") {
    document.getElementById("dd-go").addEventListener("click", function () {
      trackUse();
      var d = document.getElementById("dd-in").value;
      if (!d) return;
      var diff = Math.ceil((new Date(d) - new Date()) / 86400000);
      document.getElementById("dd-out").textContent = diff >= 0 ? "D-" + diff : "D+" + Math.abs(diff);
      trackComplete();
    });
  }
  if (slug === "counter") {
    document.getElementById("ct-in").addEventListener("input", function () {
      trackUse();
      var t = this.value;
      var words = t.trim() ? t.trim().split(/\s+/).length : 0;
      document.getElementById("ct-out").textContent = "Characters: " + t.length + " · Words: " + words + " · Lines: " + (t ? t.split("\n").length : 0);
    });
  }
  if (slug === "password") {
    document.getElementById("pw-go").addEventListener("click", function () {
      trackUse();
      var len = parseInt(document.getElementById("pw-len").value, 10) || 16;
      var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      var out = "";
      for (var i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
      document.getElementById("pw-out").textContent = out;
      trackComplete();
    });
  }
  if (slug === "uuid") {
    document.getElementById("uuid-go").addEventListener("click", function () {
      trackUse();
      document.getElementById("uuid-out").textContent = crypto.randomUUID ? crypto.randomUUID() : "uuid-unavailable";
      trackComplete();
    });
  }
  if (slug === "json") {
    document.getElementById("js-go").addEventListener("click", function () {
      trackUse();
      try {
        document.getElementById("js-out").textContent = JSON.stringify(JSON.parse(document.getElementById("js-in").value), null, 2);
        trackComplete();
      } catch (e) {
        document.getElementById("js-out").textContent = "Invalid JSON: " + e.message;
      }
    });
  }
  if (slug === "color") {
    document.getElementById("co-go").addEventListener("click", function () {
      trackUse();
      var hex = document.getElementById("co-in").value.replace("#", "");
      if (hex.length !== 6) { document.getElementById("co-out").textContent = "Use 6-digit HEX"; return; }
      var r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
      document.getElementById("co-out").textContent = "rgb(" + r + ", " + g + ", " + b + ")";
      trackComplete();
    });
  }
  if (slug === "percent") {
    document.getElementById("pc-go").addEventListener("click", function () {
      trackUse();
      var a = parseFloat(document.getElementById("pc-a").value), b = parseFloat(document.getElementById("pc-b").value);
      document.getElementById("pc-out").textContent = b ? ((a / b) * 100).toFixed(2) + "%" : "Enter total";
      trackComplete();
    });
  }
  if (slug === "subscription") {
    document.getElementById("sub-go").addEventListener("click", function () {
      trackUse();
      var p = parseFloat(document.getElementById("sub-p").value) || 0;
      var m = parseInt(document.getElementById("sub-m").value, 10) || 12;
      document.getElementById("sub-out").textContent = "Total: ₩" + (p * m).toLocaleString() + " / year";
      trackComplete();
    });
  }
  if (slug === "date") {
    document.getElementById("dt-go").addEventListener("click", function () {
      trackUse();
      var a = document.getElementById("dt-a").value, b = document.getElementById("dt-b").value;
      if (!a || !b) return;
      var days = Math.round((new Date(b) - new Date(a)) / 86400000);
      document.getElementById("dt-out").textContent = days + " days";
      trackComplete();
    });
  }
})();
