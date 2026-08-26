/**
 * Newon Labs — interactive prototypes (client-only).
 * No fake live AI/backend: all DEMO / PROTOTYPE heuristics.
 */
(function () {
  "use strict";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function safe(fn) {
    try {
      fn();
    } catch (err) {
      console.warn("[labs-detail]", err);
    }
  }

  /* ── Review AI heuristic ── */
  var NEG = /crash|bug|slow|broken|hate|worst|refund|scam|fail|못|느리|버그|불편|최악|환불|안됨|오류/i;
  var POS = /love|great|amazing|perfect|best|useful|좋|최고|편리|만족|추천|완벽/i;
  var FEAT = /wish|please add|need|should|feature|원해요|추가|기능|있으면|부탁/i;
  var ISSUE = /login|sync|price|ads|battery|notification|로그인|동기화|광고|배터리|알림|가격/i;

  function splitReviews(text) {
    return String(text || "")
      .split(/\n+/)
      .map(function (l) {
        return l.trim();
      })
      .filter(Boolean)
      .slice(0, 80);
  }

  function analyzeReviews(lines) {
    var pos = 0,
      neu = 0,
      neg = 0;
    var issues = {},
      feats = {},
      signals = {},
      complaints = {};

    lines.forEach(function (line) {
      var isNeg = NEG.test(line);
      var isPos = POS.test(line);
      if (isNeg && !isPos) neg++;
      else if (isPos && !isNeg) pos++;
      else neu++;

      var m = line.match(ISSUE);
      if (m) {
        var key = m[0].toLowerCase();
        issues[key] = (issues[key] || 0) + 1;
        if (isNeg) complaints[key] = (complaints[key] || 0) + 1;
      }
      if (FEAT.test(line)) {
        var fk = line.slice(0, 48);
        feats[fk] = (feats[fk] || 0) + 1;
      }
      if (isPos) {
        var sk = line.slice(0, 48);
        signals[sk] = (signals[sk] || 0) + 1;
      }
    });

    function top(map, n) {
      return Object.keys(map)
        .sort(function (a, b) {
          return map[b] - map[a];
        })
        .slice(0, n);
    }

    var topIssues = top(issues, 5);
    var topFeats = top(feats, 5);
    var topSig = top(signals, 5);
    var topComp = top(complaints, 5);

    return {
      total: lines.length,
      pos: pos,
      neu: neu,
      neg: neg,
      issues: topIssues.length ? topIssues : ["—"],
      feats: topFeats.length ? topFeats : ["—"],
      signals: topSig.length ? topSig : ["—"],
      complaints: topComp.length ? topComp : ["—"],
      priorities: [
        topComp[0] || topIssues[0] || "안정성 / 핵심 플로우",
        topIssues[1] || topComp[1] || "반복 불만 테마 2",
        topFeats[0] || "명시된 기능 요청 기회",
      ],
    };
  }

  function initReview(root) {
    var run = $("[data-ld-review-run]", root);
    var input = $("#ld-review-input", root);
    var out = $("[data-ld-review-out]", root);
    if (!run || !input || !out) return;

    run.addEventListener("click", function () {
      safe(function () {
        var lines = splitReviews(input.value);
        if (!lines.length) {
          input.focus();
          input.setAttribute("aria-invalid", "true");
          return;
        }
        input.removeAttribute("aria-invalid");
        var r = analyzeReviews(lines);
        var stats = $("[data-ld-review-stats]", out);
        var cols = $("[data-ld-review-cols]", out);
        var prio = $("[data-ld-review-prio]", out);

        stats.innerHTML =
          '<div class="ld-stat"><strong class="ld-mono">' +
          r.total +
          '</strong><span>TOTAL REVIEWS</span></div>' +
          '<div class="ld-stat"><strong class="ld-mono">' +
          r.pos +
          '</strong><span>POSITIVE</span></div>' +
          '<div class="ld-stat"><strong class="ld-mono">' +
          r.neu +
          '</strong><span>NEUTRAL</span></div>' +
          '<div class="ld-stat"><strong class="ld-mono">' +
          r.neg +
          '</strong><span>NEGATIVE</span></div>';

        function col(title, items) {
          return (
            '<div class="ld-review-col"><p class="ld-k ld-k--sm">' +
            title +
            "</p><ul>" +
            items
              .map(function (i) {
                return "<li>" + escapeHtml(i) + "</li>";
              })
              .join("") +
            "</ul></div>"
          );
        }

        cols.innerHTML =
          col("TOP ISSUES", r.issues) +
          col("FEATURE REQUESTS", r.feats) +
          col("POSITIVE SIGNALS", r.signals) +
          col("REPEATED COMPLAINTS", r.complaints);

        prio.innerHTML =
          '<p class="ld-k">PRODUCT PRIORITIES</p>' +
          r.priorities
            .map(function (p, i) {
              return (
                '<div class="ld-prio"><span class="ld-mono">0' +
                (i + 1) +
                "</span><p>" +
                escapeHtml(p) +
                "</p></div>"
              );
            })
            .join("");

        out.hidden = false;
        out.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ── QR builder ── */
  function loadQrLib() {
    if (window.QRCode && typeof window.QRCode.toCanvas === "function") {
      return Promise.resolve(window.QRCode);
    }
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js";
      s.async = true;
      s.onload = function () {
        if (window.QRCode) resolve(window.QRCode);
        else reject(new Error("QRCode missing"));
      };
      s.onerror = function () {
        reject(new Error("QR CDN failed"));
      };
      document.head.appendChild(s);
    });
  }

  function initQr(root) {
    var urlEl = $("#ld-qr-url", root);
    var nameEl = $("#ld-qr-name", root);
    var gen = $("[data-ld-qr-gen]", root);
    var frame = $("[data-ld-qr-frame]", root);
    var actions = $("[data-ld-qr-actions]", root);
    var err = $("[data-ld-qr-err]", root);
    var rows = $("[data-ld-qr-rows]", document);
    var state = { url: "", name: "", canvas: null };
    if (!gen || !urlEl || !frame) return;

    function showErr(msg) {
      if (!err) return;
      err.textContent = msg || "";
      err.hidden = !msg;
    }

    function isValidUrl(u) {
      try {
        var parsed = new URL(u);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch (e) {
        return false;
      }
    }

    gen.addEventListener("click", function () {
      safe(function () {
        var url = (urlEl.value || "").trim();
        var name = (nameEl.value || "").trim() || "Untitled QR";
        if (!isValidUrl(url)) {
          showErr("Enter a valid http(s) URL.");
          urlEl.focus();
          return;
        }
        showErr("");
        loadQrLib()
          .then(function (QRCode) {
            frame.innerHTML = "";
            var canvas = document.createElement("canvas");
            canvas.setAttribute("aria-label", "QR code for " + name);
            frame.appendChild(canvas);
            return QRCode.toCanvas(canvas, url, {
              width: 240,
              margin: 1,
              color: { dark: "#000000", light: "#ffffff" },
            }).then(function () {
              state = { url: url, name: name, canvas: canvas };
              if (actions) actions.hidden = false;
              if (rows) {
                rows.innerHTML =
                  "<tr>" +
                  '<td data-label="QR NAME">' +
                  escapeHtml(name) +
                  "</td>" +
                  '<td data-label="DESTINATION">' +
                  escapeHtml(url) +
                  "</td>" +
                  '<td data-label="STATUS" class="ld-mono">ACTIVE</td>' +
                  '<td data-label="SCANS" class="ld-mono">DEMO</td>' +
                  '<td data-label="LAST SCAN" class="ld-mono">—</td>' +
                  "</tr>";
              }
            });
          })
          .catch(function () {
            // Fallback image API (preview only)
            frame.innerHTML =
              '<img alt="QR preview" width="240" height="240" src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' +
              encodeURIComponent(url) +
              '" />';
            state = { url: url, name: name, canvas: null };
            if (actions) actions.hidden = false;
          });
      });
    });

    var dl = $("[data-ld-qr-dl]", root);
    if (dl) {
      dl.addEventListener("click", function () {
        safe(function () {
          if (state.canvas) {
            var a = document.createElement("a");
            a.href = state.canvas.toDataURL("image/png");
            a.download = (state.name || "newon-qr").replace(/\s+/g, "-") + ".png";
            a.click();
            return;
          }
          var img = $("img", frame);
          if (img && img.src) window.open(img.src, "_blank", "noopener");
        });
      });
    }

    var copy = $("[data-ld-qr-copy]", root);
    if (copy) {
      copy.addEventListener("click", function () {
        safe(function () {
          if (!state.url) return;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(state.url);
          }
        });
      });
    }

    var reset = $("[data-ld-qr-reset]", root);
    if (reset) {
      reset.addEventListener("click", function () {
        urlEl.value = "";
        nameEl.value = "";
        state = { url: "", name: "", canvas: null };
        frame.innerHTML = '<p class="ld-hint">Enter a URL and generate.</p>';
        if (actions) actions.hidden = true;
        showErr("");
      });
    }
  }

  /* ── Form builder ── */
  function initForm(root) {
    var lang = root.getAttribute("data-lang") || "en";
    var ko = lang === "ko";
    var titleEl = $("#ld-form-title", root);
    var descEl = $("#ld-form-desc", root);
    var list = $("[data-ld-form-qlist]", root);
    var preview = $("[data-ld-form-preview]", root);
    var questions = [
      { id: 1, type: "short", label: ko ? "가장 불편한 점은?" : "What's most frustrating?" },
      { id: 2, type: "rating", label: ko ? "전반 만족도" : "Overall rating" },
    ];
    var nextId = 3;

    var typeLabels = {
      short: "Short Text",
      long: "Long Text",
      choice: "Multiple Choice",
      email: "Email",
      rating: "Rating",
    };

    function renderList() {
      if (!list) return;
      list.innerHTML = questions
        .map(function (q) {
          return (
            "<li><span>" +
            escapeHtml(typeLabels[q.type] || q.type) +
            " · " +
            escapeHtml(q.label) +
            '</span><button type="button" class="ld-link" data-ld-form-rm="' +
            q.id +
            '" aria-label="Remove question">×</button></li>'
          );
        })
        .join("");
    }

    function fieldHtml(q, interactive) {
      var id = "fq-" + q.id;
      var label = '<label for="' + id + '">' + escapeHtml(q.label) + "</label>";
      if (q.type === "long") {
        return (
          '<div class="ld-field">' +
          label +
          '<textarea id="' +
          id +
          '" class="ld-textarea ld-textarea--sm" rows="3"' +
          (interactive ? "" : " disabled") +
          "></textarea></div>"
        );
      }
      if (q.type === "choice") {
        return (
          '<div class="ld-field">' +
          label +
          '<div><label><input type="radio" name="' +
          id +
          '" value="a"' +
          (interactive ? "" : " disabled") +
          "/> A</label> " +
          '<label><input type="radio" name="' +
          id +
          '" value="b"' +
          (interactive ? "" : " disabled") +
          "/> B</label></div></div>"
        );
      }
      if (q.type === "rating") {
        return (
          '<div class="ld-field">' +
          label +
          '<div role="group" aria-label="Rating">' +
          [1, 2, 3, 4, 5]
            .map(function (n) {
              return (
                '<label style="margin-right:0.5rem"><input type="radio" name="' +
                id +
                '" value="' +
                n +
                '"' +
                (interactive ? "" : " disabled") +
                "/> " +
                n +
                "</label>"
              );
            })
            .join("") +
          "</div></div>"
        );
      }
      var itype = q.type === "email" ? "email" : "text";
      return (
        '<div class="ld-field">' +
        label +
        '<input id="' +
        id +
        '" class="ld-input" type="' +
        itype +
        '"' +
        (interactive ? "" : " disabled") +
        " /></div>"
      );
    }

    function renderPreview(interactive) {
      if (!preview && !interactive) return "";
      var title = (titleEl && titleEl.value) || "";
      var desc = (descEl && descEl.value) || "";
      var html =
        "<h3>" +
        escapeHtml(title) +
        "</h3><p class=\"ld-hint\">" +
        escapeHtml(desc) +
        "</p>" +
        questions
          .map(function (q) {
            return fieldHtml(q, !!interactive);
          })
          .join("");
      if (preview && !interactive) preview.innerHTML = html;
      return html;
    }

    function refresh() {
      renderList();
      renderPreview(false);
    }

    $all("[data-ld-form-add]", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var type = btn.getAttribute("data-ld-form-add") || "short";
        questions.push({
          id: nextId++,
          type: type,
          label: typeLabels[type] || "Question",
        });
        refresh();
      });
    });

    if (list) {
      list.addEventListener("click", function (e) {
        var t = e.target.closest("[data-ld-form-rm]");
        if (!t) return;
        var id = Number(t.getAttribute("data-ld-form-rm"));
        questions = questions.filter(function (q) {
          return q.id !== id;
        });
        refresh();
      });
    }

    if (titleEl) titleEl.addEventListener("input", refresh);
    if (descEl) descEl.addEventListener("input", refresh);
    refresh();

    var dialog = $("[data-ld-form-dialog]", document);
    var openBtn = $("[data-ld-form-open]", root);
    var respondBody = $("[data-ld-form-respond-body]", dialog);
    var respondForm = $("[data-ld-form-respond]", dialog);
    var done = $("[data-ld-form-done]", dialog);
    var doneClose = $("[data-ld-form-done-close]", dialog);

    if (openBtn && dialog && respondBody) {
      openBtn.addEventListener("click", function () {
        respondBody.innerHTML = renderPreview(true);
        if (done) done.hidden = true;
        if (respondForm) respondForm.hidden = false;
        if (typeof dialog.showModal === "function") dialog.showModal();
      });
    }

    if (respondForm && dialog) {
      respondForm.addEventListener("submit", function (e) {
        var submitter = e.submitter;
        if (submitter && submitter.value === "cancel") return;
        if (submitter && submitter.value === "submit") {
          e.preventDefault();
          respondForm.hidden = true;
          if (done) done.hidden = false;
        }
      });
    }

    if (doneClose && dialog) {
      doneClose.addEventListener("click", function () {
        dialog.close();
      });
    }
  }

  /* ── Idea test heuristic ── */
  function scoreIdea(text) {
    var t = String(text || "").trim();
    var len = t.length;
    var clarity = len < 20 ? "LOW" : len < 80 ? "MED" : "HIGH";
    var freq = /every|daily|always|매번|매일|항상|반복/i.test(t) ? "HIGH" : /often|자주/i.test(t) ? "MED" : "LOW";
    var auto = /manual|copy|paste|정리|수동|반복 작업|excel|스프레드시트/i.test(t) ? "HIGH" : "MED";
    var aiFit =
      /summar|classif|detect|predict|생성|요약|분류|탐지|추천/i.test(t) || len > 40 ? "MED" : "LOW";
    if (/ai|automate|자동화/i.test(t)) aiFit = "HIGH";
    var money = /pay|price|customer|고객|결제|유료/i.test(t) ? "MED" : "LOW";
    return { clarity: clarity, freq: freq, auto: auto, aiFit: aiFit, money: money };
  }

  function initIdea(root) {
    var run = $("[data-ld-idea-run]", root);
    var input = $("#ld-idea-input", root);
    var out = $("[data-ld-idea-out]", root);
    if (!run || !input || !out) return;

    run.addEventListener("click", function () {
      safe(function () {
        var text = (input.value || "").trim();
        if (text.length < 8) {
          input.focus();
          input.setAttribute("aria-invalid", "true");
          return;
        }
        input.removeAttribute("aria-invalid");
        var s = scoreIdea(text);
        out.innerHTML =
          '<div class="ld-stat"><strong class="ld-mono">' +
          s.clarity +
          '</strong><span>PROBLEM CLARITY</span></div>' +
          '<div class="ld-stat"><strong class="ld-mono">' +
          s.freq +
          '</strong><span>FREQUENCY</span></div>' +
          '<div class="ld-stat"><strong class="ld-mono">' +
          s.auto +
          '</strong><span>AUTOMATION POTENTIAL</span></div>' +
          '<div class="ld-stat"><strong class="ld-mono">' +
          s.aiFit +
          '</strong><span>AI FIT</span></div>' +
          '<div class="ld-stat"><strong class="ld-mono">' +
          s.money +
          '</strong><span>MONETIZATION POSSIBILITY</span></div>' +
          '<p class="ld-hint" style="grid-column:1/-1;padding:0.75rem 1rem;margin:0;border-top:1px solid currentColor">PROTOTYPE HEURISTIC — not a live AI API</p>';
        out.hidden = false;
      });
    });
  }

  /* ── Game choice memory ── */
  function initGame(root) {
    var page = root.closest(".ld-page") || document;
    var lang = page.getAttribute("data-ld-lang") || "en";
    var ko = lang === "ko";
    var promptEl = $("[data-ld-game-prompt]", root);
    var qEl = $("[data-ld-game-q]", root);
    var choicesEl = $("[data-ld-game-choices]", root);
    var resultEl = $("[data-ld-game-result]", root);
    var nextBtn = $("[data-ld-game-next]", root);
    var resetBtn = $("[data-ld-game-reset]", root);
    if (!promptEl || !choicesEl || !resultEl) return;

    var memory = null;
    var step = 0;

    function showChoices(a, b) {
      choicesEl.innerHTML =
        '<button type="button" class="ld-btn" data-choice="save">' +
        escapeHtml(a) +
        '</button><button type="button" class="ld-btn ld-btn--ghost" data-choice="leave">' +
        escapeHtml(b) +
        "</button>";
      resultEl.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      if (resetBtn) resetBtn.hidden = true;
    }

    function renderStep() {
      if (step === 0) {
        promptEl.textContent = ko
          ? "한 사람을 구하면 당신의 탈출 확률이 낮아집니다."
          : "If you save someone, your chance of escape drops.";
        if (qEl) qEl.textContent = "WHAT DO YOU DO?";
        showChoices(ko ? "01  SAVE THEM" : "01  SAVE THEM", ko ? "02  LEAVE THEM" : "02  LEAVE THEM");
      } else if (step === 1) {
        var saved = memory === "save";
        promptEl.textContent = saved
          ? ko
            ? "당신은 이전에 누군가를 구했습니다. 같은 결정을 다시 내리겠습니까?"
            : "You saved someone before. Would you make the same decision again?"
          : ko
            ? "당신은 이전에 그들을 두고 갔습니다. 이번엔 다르게 하겠습니까?"
            : "You left them behind before. Would you choose differently now?";
        if (qEl) qEl.textContent = "THE SYSTEM REMEMBERS.";
        showChoices(ko ? "01  SAME CHOICE" : "01  SAME CHOICE", ko ? "02  DIFFERENT" : "02  DIFFERENT");
      } else {
        promptEl.textContent = ko
          ? "선택이 기억되고, 모순이 생기고, 다시 보고 싶어집니다."
          : "Choice becomes memory. Memory becomes tension. Tension invites replay.";
        choicesEl.innerHTML = "";
        resultEl.hidden = false;
        resultEl.querySelector(".ld-mono").textContent = "SESSION COMPLETE";
        var rem = resultEl.querySelector(".ld-game__remember");
        if (rem) {
          rem.textContent = ko
            ? "이 프로토타입은 로컬 상태로만 선택을 기억합니다."
            : "This prototype remembers choices in local state only.";
        }
        if (nextBtn) nextBtn.hidden = true;
        if (resetBtn) resetBtn.hidden = false;
      }
    }

    choicesEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-choice]");
      if (!btn) return;
      var choice = btn.getAttribute("data-choice");
      if (step === 0) memory = choice;
      resultEl.hidden = false;
      resultEl.querySelector(".ld-mono").textContent = "CHOICE RECORDED";
      var rem = resultEl.querySelector(".ld-game__remember");
      if (rem) rem.textContent = "SYSTEM WILL REMEMBER THIS.";
      choicesEl.innerHTML = "";
      if (nextBtn) nextBtn.hidden = step >= 1 ? true : false;
      if (step >= 1) {
        step = 2;
        if (resetBtn) resetBtn.hidden = false;
        if (nextBtn) nextBtn.hidden = true;
        setTimeout(renderStep, 400);
      }
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        step = 1;
        renderStep();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        memory = null;
        step = 0;
        renderStep();
      });
    }

    renderStep();
  }

  function initReveal(page) {
    var nodes = $all("[data-ld-reveal]", page);
    if (!nodes.length) return;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    nodes.forEach(function (el, i) {
      if (i === 0) {
        requestAnimationFrame(function () {
          el.classList.add("is-in");
        });
      } else {
        io.observe(el);
      }
    });
  }

  function boot() {
    var page = $(".ld-page");
    if (!page) return;
    var slug = page.getAttribute("data-ld-slug");
    safe(function () {
      initReveal(page);
    });
    safe(function () {
      if (slug === "review-ai") initReview($("[data-ld-review]") || page);
      if (slug === "newon-qr") initQr($("[data-ld-qr]") || page);
      if (slug === "newon-form") initForm($("[data-ld-form]") || page);
      if (slug === "ai-experiment") initIdea($("[data-ld-idea]") || page);
      if (slug === "game-experiment") initGame($("[data-ld-game]") || page);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
