(function () {
  var KEY_SAVED = "livon.tdSaved";
  var KEY_INTERESTS = "livon.tdInterests";
  var KEY_STAGE = "livon.tdStage";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function readJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function gnavOffset() {
    return (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h"), 10) || 74) + 8;
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function saved() { var list = readJSON(KEY_SAVED, []); return Array.isArray(list) ? list : []; }
  function interests() { var list = readJSON(KEY_INTERESTS, []); return Array.isArray(list) ? list : []; }

  function toggleSave(id, label) {
    var list = saved();
    var exists = list.some(function (x) { return x.id === id; });
    var next = exists ? list.filter(function (x) { return x.id !== id; }) : list.concat([{ id: id, label: label, at: Date.now() }]).slice(0, 40);
    writeJSON(KEY_SAVED, next);
    try {
      var ml = readJSON("livon.mlInterests", []);
      if (!Array.isArray(ml)) ml = [];
      if (!exists && ml.indexOf(label) === -1) writeJSON("livon.mlInterests", ml.concat([label]).slice(0, 40));
    } catch (e) {}
    return !exists;
  }
  function toggleInterest(label) {
    var list = interests();
    var exists = list.indexOf(label) !== -1;
    var next = exists ? list.filter(function (x) { return x !== label; }) : list.concat([label]).slice(0, 20);
    writeJSON(KEY_INTERESTS, next);
    return !exists;
  }
  function setStage(id, label) {
    writeJSON(KEY_STAGE, { id: id, label: label, at: Date.now() });
  }

  function renderSaved() {
    var host = $("[data-lv-td-saved]");
    if (!host) return;
    var s = saved();
    var i = interests();
    var st = readJSON(KEY_STAGE, null);
    if (!s.length && !i.length && !st) {
      host.innerHTML = '<div class="lv-td-empty"><span class="lv-td-badge">준비됨</span><h3>아직 저장한 발견이 없습니다</h3><p>관심 분야를 고르거나 콘텐츠를 저장하면 이곳에 모입니다. 계정 동기화 전에는 이 기기에만 저장됩니다.</p></div>';
      return;
    }
    var parts = [];
    if (st && st.label) parts.push("<p><strong>선택한 생애주기</strong> · " + st.label + "</p>");
    if (i.length) parts.push("<p><strong>관심 분야</strong> · " + i.join(", ") + "</p>");
    if (s.length) parts.push("<p><strong>저장</strong> · " + s.map(function (x) { return x.label; }).join(", ") + "</p>");
    host.innerHTML = '<div class="lv-td-empty"><span class="lv-td-badge">이 기기</span><h3>나의 발견 요약</h3>' + parts.join("") + '<p style="margin-top:.75rem">내 생활의 관심 목록과도 연결됩니다.</p></div>';
  }

  function bindFilm() {
    var hero = $("#td-hero");
    if (!hero) return;
    var reveal = function () { hero.classList.add("is-ready"); };
    var video = hero.querySelector("video");
    if (video) {
      if (video.readyState >= 2) reveal();
      else video.addEventListener("loadeddata", reveal, { once: true });
      setTimeout(reveal, 600);
    } else reveal();
  }

  function bindReveal() {
    var nodes = $$("[data-lv-td-reveal]");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    nodes.forEach(function (el) { io.observe(el); });
  }

  function bindNav() {
    var links = $$(".lv-td-nav__track a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").replace("#", "");
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-on"); });
        if (map[entry.target.id]) map[entry.target.id].classList.add("is-on");
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  function bindClicks() {
    document.addEventListener("click", function (e) {
      var save = e.target.closest("[data-lv-td-save]");
      if (save) {
        e.preventDefault();
        var sid = save.getAttribute("data-lv-td-save");
        var slabel = save.getAttribute("data-lv-td-label") || sid;
        var son = toggleSave(sid, slabel);
        save.classList.toggle("is-on", son);
        var go = save.querySelector(".lv-td-row__go");
        if (go) go.textContent = son ? "저장됨" : "관심 저장 →";
        else if (save.tagName === "BUTTON") {
          if (!save.getAttribute("data-lv-td-label-default")) {
            save.setAttribute("data-lv-td-label-default", save.textContent.trim());
          }
          save.textContent = son ? "저장됨" : save.getAttribute("data-lv-td-label-default");
        }
        renderSaved();
        return;
      }
      var interest = e.target.closest("[data-lv-td-interest]");
      if (interest) {
        e.preventDefault();
        var name = interest.getAttribute("data-lv-td-interest");
        interest.classList.toggle("is-on", toggleInterest(name));
        renderSaved();
        return;
      }
      var stage = e.target.closest("[data-lv-td-stage]");
      if (stage) {
        e.preventDefault();
        var id = stage.getAttribute("data-lv-td-stage");
        var label = stage.getAttribute("data-lv-td-label") || id;
        setStage(id, label);
        $$("[data-lv-td-stage]").forEach(function (el) { el.classList.remove("is-on"); });
        stage.classList.add("is-on");
        var go = stage.querySelector(".lv-td-stage__go");
        if (go) go.textContent = "선택됨";
        renderSaved();
        return;
      }
      var pill = e.target.closest("[data-lv-td-pill]");
      if (pill) {
        e.preventDefault();
        var group = pill.parentElement && pill.parentElement.parentElement;
        if (group) $$("[data-lv-td-pill]", group).forEach(function (b) { b.classList.remove("is-on"); });
        pill.classList.add("is-on");
        var empty = $("[data-lv-td-library-empty]");
        if (empty) {
          empty.querySelector("h3").textContent = "“" + pill.textContent.trim() + "” 콘텐츠가 아직 없습니다";
        }
        return;
      }
    });
    var form = $("[data-lv-td-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = $("[data-lv-td-q]");
        var q = input ? input.value.trim() : "";
        var empty = $("[data-lv-td-library-empty]");
        if (empty) {
          empty.querySelector("h3").textContent = q ? ("“" + q + "” 검색 결과가 없습니다") : "발견 콘텐츠가 아직 연결되지 않았습니다";
          empty.querySelector("p").textContent = "검증된 장소·행사·프로그램 데이터가 연동되면 여기에 표시됩니다. 관심 등록과 카테고리 탐색은 지금 이용할 수 있습니다.";
        }
        scrollToId("td-library");
      });
    }
  }

  function onShow(hash) {
    renderSaved();
    if (!hash || hash === "today" || hash === "td-hero") {
      window.scrollTo(0, 0);
      return;
    }
    if (hash.indexOf("td-") === 0) setTimeout(function () { scrollToId(hash); }, 40);
  }

  function init() {
    if (!$("#today")) return;
    bindFilm();
    bindReveal();
    bindNav();
    bindClicks();
    renderSaved();
    $$("[data-lv-td-interest]").forEach(function (btn) {
      var name = btn.getAttribute("data-lv-td-interest");
      if (interests().indexOf(name) !== -1) btn.classList.add("is-on");
    });
    var st = readJSON(KEY_STAGE, null);
    if (st && st.id) {
      var el = $('[data-lv-td-stage="' + st.id + '"]');
      if (el) {
        el.classList.add("is-on");
        var go = el.querySelector(".lv-td-stage__go");
        if (go) go.textContent = "선택됨";
      }
    }
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "today") onShow(hash || "today");
  }

  window.LivonToday = { onShow: onShow };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
