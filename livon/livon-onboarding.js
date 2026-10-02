/*
 * LIVON Onboarding V1 — optional, anonymous first-run setup.
 *
 *   arrival      a small, non-blocking note (never a forced dialog):
 *                  first visit      → what LIVON is · [나에게 맞게 시작하기] [먼저 둘러보기]
 *                  returning device → a short invitation only
 *                  unfinished       → [이어서 하기]
 *   dialog       opens only when the user asks: 연령대 → 관심 분야 → Life Event → 미리보기 (4 short steps)
 *                every step can be passed without choosing; "나중에 할게요" is always visible
 *   result       LivonPersonalization.complete() writes the three existing preference keys that Home, Life Stage,
 *                Today, Explore, Community and My Life already read
 *
 * No sign-up, no network, no AI call. Logic and state live in livon-personalization.js; this file is the UI.
 */
(function () {
  "use strict";
  var P = function () { return window.LivonPersonalization || null; };
  var STEP_LABEL = { stage: "연령대", interests: "관심 분야", events: "Life Event", preview: "미리보기" };
  var PRIVACY = "선택한 내용은 이 기기에서 LIVON을 맞춤 설정하는 데만 사용돼요. 회원가입 없이 쓸 수 있고, 언제든 바꾸거나 지울 수 있어요.";
  var TEMP_NOTE = "이 브라우저에서는 저장이 막혀 있어, 창을 닫으면 선택한 내용이 사라질 수 있어요.";
  var ui = { step: "stage", draft: { lifeStage: "", interests: [], lifeEvents: [] }, more: false, edit: false };
  var returnFocus = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /* contextual help: a link into the Help Center (help-page.js). Nothing is shown when Help is not loaded. */
  function help(id, label) { return window.LivonHelp && typeof window.LivonHelp.link === "function" ? " " + window.LivonHelp.link(id, label) : ""; }
  function steps() { return (P() && P().STEPS) || ["stage", "interests", "events", "preview"]; }

  /* ───────── markup (pure: state in, HTML out) ───────── */
  function chip(attr, value, label, on) {
    return '<button type="button" class="lv-ob__chip' + (on ? " is-on" : "") + '" ' + attr + '="' + esc(value) + '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(label) + "</button>";
  }
  function progress(step) {
    var list = steps(), n = list.indexOf(step) + 1, total = list.length;
    return '<div class="lv-ob__bar" role="progressbar" aria-label="맞춤 설정 진행" aria-valuemin="1" aria-valuemax="' + total + '" aria-valuenow="' + n + '" aria-valuetext="' + total + "단계 중 " + n + "단계, " + esc(STEP_LABEL[step] || "") + '"><span style="width:' + Math.round(n / total * 100) + '%"></span></div>' +
      '<p class="lv-ob__count" aria-hidden="true">' + n + " / " + total + " · " + esc(STEP_LABEL[step] || "") + "</p>";
  }
  function actions(step) {
    var first = steps().indexOf(step) === 0, last = step === "preview";
    return '<div class="lv-ob__actions">' +
      (first ? "" : '<button type="button" class="lv-life-btn lv-life-btn--outline" data-ob-back>이전</button>') +
      (last ? '<button type="button" class="lv-life-btn lv-life-btn--dark" data-ob-finish>이대로 시작하기</button>'
            : '<button type="button" class="lv-life-btn lv-life-btn--dark" data-ob-next>다음</button>') +
      "</div>" +
      '<p class="lv-ob__later"><button type="button" class="lv-ob__link" data-ob-later>' + (ui.edit ? "바꾸지 않고 닫기" : "나중에 할게요") + "</button></p>";
  }
  function summary(d) {
    var p = P(), parts = [];
    if (d.lifeStage) parts.push(p.stageLabel(d.lifeStage) || d.lifeStage + "대");
    d.interests.forEach(function (i) { parts.push(i); });
    d.lifeEvents.forEach(function (id) { var ev = p.eventById(id); if (ev) parts.push(ev.title); });
    return parts;
  }
  function selectedText(n) { return n ? n + "개 선택했어요." : ""; }
  function body(state) {
    var p = P(), d = state.draft, step = state.step, html = progress(step);
    if (step === "stage") {
      var st = p.stages();
      html += '<h2 id="livon-onboard-title" tabindex="-1">연령대를 알려주세요</h2>' +
        '<p class="lv-ob__lead">하나만 고르면 돼요. 생년월일이나 정확한 나이는 묻지 않아요.</p>' +
        (st.length
          ? '<div class="lv-ob__chips lv-ob__chips--stage" role="group" aria-labelledby="livon-onboard-title">' + st.map(function (s) { return chip("data-ob-stage", s.id, s.label, d.lifeStage === s.id); }).join("") + "</div>"
          : '<p class="lv-ob__empty">연령대 목록을 불러오지 못했어요. 이 단계는 건너뛰어도 괜찮아요.</p>') +
        '<p class="lv-ob__status" role="status" aria-live="polite">' + (d.lifeStage ? "선택: " + esc(p.stageLabel(d.lifeStage)) : "") + "</p>";
    } else if (step === "interests") {
      var opts = p.interestOptions();
      /* interests the user already had (typed in My Life) stay selectable so nothing is lost */
      d.interests.forEach(function (i) { if (opts.indexOf(i) < 0) opts.push(i); });
      html += '<h2 id="livon-onboard-title" tabindex="-1">요즘 관심 있는 분야를 골라 주세요</h2>' +
        '<p class="lv-ob__lead">여러 개 고를 수 있어요. 고르지 않아도 다음으로 넘어갈 수 있어요.</p>' +
        (opts.length
          ? '<div class="lv-ob__chips" role="group" aria-labelledby="livon-onboard-title">' + opts.map(function (i) { return chip("data-ob-interest", i, i, d.interests.indexOf(i) >= 0); }).join("") + "</div>"
          : '<p class="lv-ob__empty">관심 분야 목록을 불러오지 못했어요. 이 단계는 건너뛰어도 괜찮아요.</p>') +
        '<p class="lv-ob__status" role="status" aria-live="polite">' + selectedText(d.interests.length) + "</p>";
    } else if (step === "events") {
      var ev = p.eventsFor(d.lifeStage), label = d.lifeStage ? p.stageLabel(d.lifeStage) : "";
      /* a chosen event outside the current stage stays visible */
      var showMore = state.more || ev.more.some(function (e) { return d.lifeEvents.indexOf(e.id) >= 0; });
      var one = function (e) { return chip("data-ob-event", e.id, e.title, d.lifeEvents.indexOf(e.id) >= 0); };
      html += '<h2 id="livon-onboard-title" tabindex="-1">준비하고 있거나 겪고 있는 일이 있나요?</h2>' +
        '<p class="lv-ob__lead">' + (label ? esc(label) + "에 해당하는 항목을 먼저 보여드려요. " : "") + "해당하는 것만 고르면 돼요.</p>" +
        (ev.primary.length
          ? '<div class="lv-ob__chips" role="group" aria-labelledby="livon-onboard-title">' + ev.primary.map(one).join("") + "</div>"
          : '<p class="lv-ob__empty">' + (label ? esc(label) + "에 해당하는 항목이 아직 없어요." : "항목을 불러오지 못했어요.") + " 건너뛰어도 괜찮아요.</p>") +
        (ev.more.length
          ? '<p class="lv-ob__more"><button type="button" class="lv-ob__link" data-ob-more aria-expanded="' + (showMore ? "true" : "false") + '" aria-controls="lv-ob-more">' + (showMore ? "다른 항목 접기" : "다른 항목 더 보기") + "</button></p>" +
            '<div class="lv-ob__chips" id="lv-ob-more" role="group" aria-label="다른 Life Event"' + (showMore ? "" : " hidden") + ">" + ev.more.map(one).join("") + "</div>"
          : "") +
        '<p class="lv-ob__status" role="status" aria-live="polite">' + selectedText(d.lifeEvents.length) + "</p>";
    } else {
      var pv = p.preview(d), picked = summary(d);
      html += '<h2 id="livon-onboard-title" tabindex="-1">' + (picked.length ? "이런 정보를 먼저 보여드릴게요" : "기본 화면으로 시작할게요") + "</h2>";
      if (!picked.length) {
        html += '<p class="lv-ob__lead">고른 항목이 없어요. 기본 화면으로 시작하고, 언제든 내 생활의 개인 설정에서 고를 수 있어요.</p>';
      } else {
        html += '<p class="lv-ob__lead">내 선택</p><ul class="lv-ob__picked" aria-label="내 선택">' + picked.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
        if (pv.gaps.length) html += '<p class="lv-ob__note">' + esc(pv.gaps.map(function (g) { return "‘" + g.title + "’"; }).join(", ")) + " 안내는 아직 준비 중이에요. 다른 선택에 맞는 정보를 먼저 보여드려요.</p>";
        if (!pv.groups.length) html += '<p class="lv-ob__empty">선택에 꼭 맞는 정보가 아직 없어요. 기본 순서로 보여드리고, 모든 메뉴는 그대로 둘러볼 수 있어요.</p>';
        else html += '<div class="lv-ob__preview">' + pv.groups.map(function (g) {
          return '<section class="lv-ob__group" aria-label="' + esc(g.label) + '"><h3>' + esc(g.label) + "</h3><ul>" + g.items.map(function (x) {
            return "<li><strong>" + esc(x.title) + "</strong><small>" + esc(x.why) + "</small></li>";
          }).join("") + "</ul></section>";
        }).join("") + "</div>";
      }
      html += '<p class="lv-ob__status" role="status" aria-live="polite"></p>';
    }
    return html + actions(step) +
      '<p class="lv-life-modal__foot">' + PRIVACY + help("personalization-storage", "맞춤 설정은 어디에 저장되나요?") +
        (p.storageIsTemporary() ? " " + TEMP_NOTE + help("storage-blocked", "저장이 막혀 있다는 뜻은?") : "") + "</p>";
  }
  var ENTRY = {
    welcome: { title: "LIVON에 오신 걸 환영해요", text: "삶의 단계와 상황에 맞는 정보·서비스·할 일을 한곳에서 찾고 관리하는 서비스예요. 회원가입 없이 바로 쓸 수 있어요.", go: "나에게 맞게 시작하기", no: "먼저 둘러보기" },
    invite: { title: "나에게 맞게 보기", text: "연령대와 관심 분야를 고르면 맞는 정보를 먼저 보여드려요. 지금 쓰던 내용은 그대로예요.", go: "맞춤 설정하기", no: "괜찮아요" },
    resume: { title: "맞춤 설정을 이어서 할까요?", text: "고르던 내용이 이 기기에 남아 있어요.", go: "이어서 하기", no: "그만두기" }
  };
  function entryHtml(kind) {
    var c = ENTRY[kind];
    if (!c) return "";
    return '<div class="lv-ob-entry__copy"><strong id="livon-onboard-entry-title">' + esc(c.title) + "</strong><p>" + esc(c.text) + "</p></div>" +
      '<div class="lv-ob-entry__acts"><button type="button" class="lv-life-btn lv-life-btn--dark" data-ob-entry-start>' + esc(c.go) + "</button>" +
      '<button type="button" class="lv-life-btn lv-life-btn--outline" data-ob-entry-skip>' + esc(c.no) + "</button></div>";
  }

  /* ───────── DOM ───────── */
  function modal() { return document.getElementById("livon-onboard-modal"); }
  function host() { var m = modal(); return m ? m.querySelector("[data-lv-ob-body]") : null; }
  function entryEl() { return document.getElementById("livon-onboard-entry"); }
  function render(focusTitle) {
    var h = host();
    if (!h) return;
    h.innerHTML = body(ui);
    if (focusTitle) {
      var t = h.querySelector("#livon-onboard-title");
      if (t && typeof t.focus === "function") { try { t.focus({ preventScroll: true }); } catch (e) {} }
      if (typeof h.scrollTop === "number") h.scrollTop = 0;
      var panel = modal().querySelector(".lv-life-modal__panel");
      if (panel && typeof panel.scrollTop === "number") panel.scrollTop = 0;
    }
  }
  function setStatus(text) {
    var h = host(), s = h && h.querySelector(".lv-ob__status");
    if (s) s.textContent = text || "";
  }
  function persist() { var p = P(); if (p) p.saveDraft(ui.step, ui.draft); }
  function notify() {
    if (window.LivonHome && typeof window.LivonHome.render === "function") { try { window.LivonHome.render(); } catch (e) {} }
    try { document.dispatchEvent(new CustomEvent("livon:personalization")); } catch (e) {}
  }
  function hideEntry() { var e = entryEl(); if (e) e.hidden = true; }
  function showEntry() {
    var p = P(), e = entryEl();
    if (!p || !e) return;
    var kind = p.entry();
    if (kind === "none") { e.hidden = true; return; }
    e.innerHTML = entryHtml(kind);
    e.setAttribute("data-kind", kind);
    e.hidden = false;
  }

  function open(opts) {
    var p = P(), m = modal();
    if (!p || !m) return;
    opts = opts || {};
    var s = p.start();
    ui.edit = p.state() === "COMPLETED";
    ui.draft = s.draft || { lifeStage: "", interests: [], lifeEvents: [] };
    ui.step = steps().indexOf(opts.step) >= 0 ? opts.step : (ui.edit ? "stage" : s.step);
    ui.more = false;
    hideEntry();
    if (m.hidden) returnFocus = document.activeElement;
    m.hidden = false;
    if (!m._kbBound) { m._kbBound = true; document.addEventListener("keydown", keydown); }
    render(false);
    setTimeout(function () {
      if (m.hidden) return;
      var t = m.querySelector("#livon-onboard-title") || m.querySelector(".lv-life-modal__close");
      if (t && typeof t.focus === "function") { try { t.focus({ preventScroll: true }); } catch (e) {} }
    }, 0);
  }
  function hide() {
    var m = modal();
    if (!m || m.hidden) return;
    m.hidden = true;
    var back = returnFocus;
    returnFocus = null;
    /* the opener may be gone (the arrival note closes with the dialog): fall back to the page's main region */
    if (!back || back === document.body || !document.contains(back) || back.offsetParent === null) {
      back = document.querySelector ? document.querySelector("main") : null;
      if (back && back.setAttribute && !back.hasAttribute("tabindex")) back.setAttribute("tabindex", "-1");
    }
    if (back && typeof back.focus === "function") { try { back.focus({ preventScroll: true }); } catch (e) {} }
  }
  /* × / Escape / backdrop: close and keep what was chosen so far (it can be resumed) */
  function closeKeep() { persist(); hide(); showEntry(); }
  /* "나중에 할게요": stop asking. Nothing is limited; the entry points in Home and My Life stay. */
  function later() { var p = P(); if (p) p.skip(); hide(); hideEntry(); }
  function finish() {
    var p = P();
    if (!p) return;
    p.complete(ui.draft);
    hide(); hideEntry(); notify();
  }
  function go(delta) {
    var list = steps(), i = list.indexOf(ui.step) + delta;
    if (i < 0 || i >= list.length) return;
    ui.step = list[i]; ui.more = false;
    persist();
    render(true);
  }
  function toggle(list, v, max) {
    var i = list.indexOf(v);
    if (i >= 0) list.splice(i, 1); else if (list.length < max) list.push(v);
    return list.indexOf(v) >= 0;
  }
  function press(btn, on) {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    if (btn.classList) btn.classList.toggle("is-on", !!on);
  }

  function keydown(e) {
    var m = modal();
    if (!m || m.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); closeKeep(); return; }
    if (e.key !== "Tab") return;
    var f = Array.prototype.filter.call(m.querySelectorAll("button:not([tabindex='-1']), a[href], input, select, textarea"), function (el) { return el.offsetParent !== null && !el.disabled; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    var active = document.activeElement, onTitle = active === m.querySelector("#livon-onboard-title");
    if (!m.contains(active)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && (active === first || onTitle)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  }

  function bind() {
    var m = modal(), p = P();
    if (m && !m._obBound) {
      m._obBound = true;
      m.addEventListener("click", function (e) {
        var t = e.target, c = function (sel) { return t.closest ? t.closest(sel) : null; };
        if (c("[data-lv-onboard-close]")) { closeKeep(); return; }
        if (c("[data-lv-help-link]")) { persist(); hide(); return; }   /* the link opens Help: keep what was chosen, and do not cover the article with the resume note (it returns on the next visit) */
        if (c("[data-ob-later]")) { later(); return; }
        if (c("[data-ob-next]")) { go(1); return; }
        if (c("[data-ob-back]")) { go(-1); return; }
        if (c("[data-ob-finish]")) { finish(); return; }
        var more = c("[data-ob-more]");
        if (more) { ui.more = more.getAttribute("aria-expanded") !== "true"; render(false); var again = host().querySelector("[data-ob-more]"); if (again) again.focus(); return; }
        var st = c("[data-ob-stage]");
        if (st) {
          var id = st.getAttribute("data-ob-stage");
          ui.draft.lifeStage = ui.draft.lifeStage === id ? "" : id;
          Array.prototype.forEach.call(m.querySelectorAll("[data-ob-stage]"), function (b) { press(b, b.getAttribute("data-ob-stage") === ui.draft.lifeStage); });
          setStatus(ui.draft.lifeStage ? "선택: " + (P().stageLabel(ui.draft.lifeStage) || "") : "선택을 해제했어요.");
          persist();
          return;
        }
        var it = c("[data-ob-interest]");
        if (it) {
          var was = ui.draft.interests.length;
          var on = toggle(ui.draft.interests, it.getAttribute("data-ob-interest"), 20);
          press(it, on);
          setStatus(!on && was === ui.draft.interests.length ? "더 고를 수 없어요." : (selectedText(ui.draft.interests.length) || "선택한 항목이 없어요."));
          persist();
          return;
        }
        var ev = c("[data-ob-event]");
        if (ev) {
          var before = ui.draft.lifeEvents.length;
          var on2 = toggle(ui.draft.lifeEvents, ev.getAttribute("data-ob-event"), 8);
          press(ev, on2);
          setStatus(!on2 && before === ui.draft.lifeEvents.length ? "8개까지 고를 수 있어요." : (selectedText(ui.draft.lifeEvents.length) || "선택한 항목이 없어요."));
          persist();
          return;
        }
      });
    }
    var en = entryEl();
    if (en && !en._obBound) {
      en._obBound = true;
      en.addEventListener("click", function (e) {
        var t = e.target;
        if (t.closest && t.closest("[data-ob-entry-start]")) { open(); return; }
        if (t.closest && t.closest("[data-ob-entry-skip]")) { if (p) p.skip(); hideEntry(); }
      });
    }
    /* "관심 설정 변경" / "다시 설정" links anywhere on the page */
    if (document.addEventListener && !document._obBound) {
      document._obBound = true;
      document.addEventListener("click", function (e) {
        var t = e.target && e.target.closest ? e.target.closest("[data-lv-onboard-edit]") : null;
        if (!t) return;
        e.preventDefault();
        open({ step: t.getAttribute("data-lv-onboard-edit") || "stage" });
      });
    }
  }
  function init() {
    if (!P()) return;
    bind();
    /* never a dialog on arrival: only the small note, and only for a new or unfinished state */
    setTimeout(showEntry, 600);
  }

  window.LivonOnboarding = {
    open: open, close: closeKeep, later: later, showEntry: showEntry, init: init,
    _html: body, _entryHtml: entryHtml, _state: function () { return ui; }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
