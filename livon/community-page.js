(function () {
  var KEY_JOINED = "livon.cmJoined";
  var KEY_SAVED = "livon.cmSaved";
  var KEY_INTERESTS = "livon.cmInterests";

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

  function joined() { var list = readJSON(KEY_JOINED, []); return Array.isArray(list) ? list : []; }
  function saved() { var list = readJSON(KEY_SAVED, []); return Array.isArray(list) ? list : []; }
  function interests() { var list = readJSON(KEY_INTERESTS, []); return Array.isArray(list) ? list : []; }

  function toggleJoin(id, label) {
    var list = joined();
    var exists = list.some(function (x) { return x.id === id; });
    var next = exists ? list.filter(function (x) { return x.id !== id; }) : list.concat([{ id: id, label: label, at: Date.now() }]).slice(0, 40);
    writeJSON(KEY_JOINED, next);
    return !exists;
  }
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

  function renderMine() {
    var host = $("[data-lv-cm-mine]");
    if (!host) return;
    var j = joined();
    var s = saved();
    var i = interests();
    if (!j.length && !s.length && !i.length) {
      host.innerHTML = '<div class="lv-cm-empty"><span class="lv-cm-badge">준비됨</span><h3>아직 참여·저장한 항목이 없습니다</h3><p>커뮤니티를 찾아 가입하거나 관심 주제를 저장하면 이곳에 모입니다. 실제 게시글·댓글 서버 연동은 준비 중입니다.</p></div>';
      return;
    }
    var parts = [];
    if (i.length) parts.push("<p><strong>관심 분야</strong> · " + i.map(function (x) { return x; }).join(", ") + "</p>");
    if (j.length) parts.push("<p><strong>가입·관심 커뮤니티</strong> · " + j.map(function (x) { return x.label; }).join(", ") + "</p>");
    if (s.length) parts.push("<p><strong>저장</strong> · " + s.map(function (x) { return x.label; }).join(", ") + "</p>");
    host.innerHTML = '<div class="lv-cm-empty"><span class="lv-cm-badge">이 기기</span><h3>나의 커뮤니티 요약</h3>' + parts.join("") + '<p style="margin-top:.75rem">계정 동기화 전에는 이 기기에만 저장됩니다.</p></div>';
  }

  function bindFilm() {
    var hero = $("#cm-hero");
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
    var nodes = $$("[data-lv-cm-reveal]");
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
    var links = $$(".lv-cm-nav__track a");
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
      var join = e.target.closest("[data-lv-cm-join]");
      if (join) {
        e.preventDefault();
        var id = join.getAttribute("data-lv-cm-join");
        var label = join.getAttribute("data-lv-cm-label") || id;
        var on = toggleJoin(id, label);
        join.classList.toggle("is-on", on);
        join.setAttribute("aria-pressed", on ? "true" : "false");
        var go = join.querySelector(".lv-cm-row__go, .lv-cm-stage__go");
        if (go) go.textContent = on ? "관심 등록됨" : "관심 등록 →";
        else if (join.tagName === "BUTTON") {
          if (!join.getAttribute("data-lv-cm-label-default")) {
            join.setAttribute("data-lv-cm-label-default", join.textContent.trim());
          }
          join.textContent = on ? "관심 등록됨" : join.getAttribute("data-lv-cm-label-default");
        }
        renderMine();
        return;
      }
      var save = e.target.closest("[data-lv-cm-save]");
      if (save) {
        e.preventDefault();
        var sid = save.getAttribute("data-lv-cm-save");
        var slabel = save.getAttribute("data-lv-cm-label") || sid;
        var son = toggleSave(sid, slabel);
        save.classList.toggle("is-on", son);
        if (save.tagName === "BUTTON") {
          if (!save.getAttribute("data-lv-cm-label-default")) {
            save.setAttribute("data-lv-cm-label-default", save.textContent.trim());
          }
          save.textContent = son ? "저장됨" : save.getAttribute("data-lv-cm-label-default");
        }
        renderMine();
        return;
      }
      var interest = e.target.closest("[data-lv-cm-interest]");
      if (interest) {
        e.preventDefault();
        var name = interest.getAttribute("data-lv-cm-interest");
        interest.classList.toggle("is-on", toggleInterest(name));
        renderMine();
        return;
      }
      var tab = e.target.closest("[data-lv-cm-tab]");
      if (tab) {
        e.preventDefault();
        $$("[data-lv-cm-tab]").forEach(function (b) { b.classList.remove("is-on"); });
        tab.classList.add("is-on");
        var empty = $("[data-lv-cm-feed-empty]");
        if (empty) {
          empty.querySelector("h3").textContent = "“" + tab.textContent.trim() + "” 게시글이 아직 없습니다";
        }
        return;
      }
      var find = e.target.closest("[data-lv-cm-find]");
      if (find) {
        e.preventDefault();
        scrollToId("cm-find");
        location.hash = "cm-find";
      }
    });
    var form = $("[data-lv-cm-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = $("[data-lv-cm-q]");
        var q = input ? input.value.trim() : "";
        var empty = $("[data-lv-cm-feed-empty]");
        if (empty) {
          empty.querySelector("h3").textContent = q ? ("“" + q + "” 검색 결과가 없습니다") : "게시글 데이터가 아직 연결되지 않았습니다";
          empty.querySelector("p").textContent = "커뮤니티 게시글·댓글·좋아요는 백엔드 연동 후 표시됩니다. 카테고리와 관심 등록은 지금 이용할 수 있습니다.";
        }
        scrollToId("cm-home");
      });
    }
  }

  function onShow(hash) {
    renderMine();
    if (!hash || hash === "community" || hash === "cm-hero") {
      window.scrollTo(0, 0);
      return;
    }
    if (hash.indexOf("cm-") === 0) setTimeout(function () { scrollToId(hash); }, 40);
  }

  function init() {
    if (!$("#community")) return;
    bindFilm();
    bindReveal();
    bindNav();
    bindClicks();
    renderMine();
    $$("[data-lv-cm-interest]").forEach(function (btn) {
      var name = btn.getAttribute("data-lv-cm-interest");
      if (interests().indexOf(name) !== -1) btn.classList.add("is-on");
    });
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "community") onShow(hash || "community");
  }

  window.LivonCommunity = { onShow: onShow };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
