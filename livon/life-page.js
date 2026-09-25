(function () {
  var KEY_STAGE = "livon.lifeStage";
  var KEY_SITUATIONS = "livon.lifeSituations";
  var KEY_INTERESTS = "livon.lifeInterests";
  var KEY_GOALS = "livon.lifeGoals";
  var KEY_SAVED = "livon.lifeSavedLocal";
  var KEY_AIQ = "livon.aiPrompt";
  var DATA = window.LivonLifeData || { stages: [], situations: [], interests: [], goals: [], transitions: [], packages: [], statusLabel: {} };

  var state = {
    setupTab: "stage",
    activeField: null,
    stageId: null,
    viewStage: null
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function stages() { return DATA.stages || []; }
  function stageById(id) {
    return stages().find(function (s) { return s.id === String(id); }) || null;
  }
  function statusLabel(key) {
    return (DATA.statusLabel && DATA.statusLabel[key]) || key || "안내";
  }
  function gnavOffset() {
    return (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h")) || 74) + 56;
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function resolveServices(stage, names) {
    var list = stage && stage.services ? stage.services : [];
    if (!names || !names.length) return list.slice(0, 6);
    return names.map(function (n) {
      return list.find(function (s) { return s.name === n; }) || {
        name: n,
        desc: "관련 생활 안내입니다.",
        feats: ["정보 안내"],
        audience: stage ? stage.label : "전체",
        status: "info",
        href: "#explore"
      };
    });
  }

  function prefs() {
    return {
      stage: readJSON(KEY_STAGE, null),
      situations: readJSON(KEY_SITUATIONS, []),
      interests: readJSON(KEY_INTERESTS, []),
      goals: readJSON(KEY_GOALS, [])
    };
  }

  function savedList() {
    return readJSON(KEY_SAVED, []);
  }
  function isSaved(name) {
    return savedList().indexOf(name) >= 0;
  }
  function toggleSave(name) {
    var list = savedList();
    var i = list.indexOf(name);
    if (i >= 0) list.splice(i, 1);
    else list.push(name);
    writeJSON(KEY_SAVED, list);
    return list.indexOf(name) >= 0;
  }

  function linkHtml(links) {
    if (!links) return "";
    var items = [];
    if (links.explore) items.push('<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(links.explore) + '">탐색</a>');
    if (links.lifeNow) items.push('<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(links.lifeNow) + '">내 생활</a>');
    if (links.today) items.push('<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(links.today) + '">오늘의 발견</a>');
    if (links.community) items.push('<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(links.community) + '">커뮤니티</a>');
    if (links.ongil) items.push('<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(links.ongil) + '">Ongil</a>');
    if (links.ai) {
      items.push('<a class="lv-life-btn lv-life-btn--dark lv-life-btn--sm" href="#livon-ai" data-lv-life-aiq="' + esc(links.ai) + '">LIVON AI</a>');
    }
    return items.length ? '<div class="lv-life-svc__acts">' + items.join("") + "</div>" : "";
  }

  function svcCard(svc, stageId, opts) {
    opts = opts || {};
    var saved = isSaved(svc.name);
    var feats = (svc.feats || []).slice(0, 3).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    var href = svc.href || "#explore";
    var status = statusLabel(svc.status);
    return (
      '<article class="lv-life-svc">' +
        '<p class="lv-life-svc__n">' + esc(status) + " · " + esc(svc.audience || "전체") + "</p>" +
        "<h4>" + esc(svc.name) + "</h4>" +
        "<p>" + esc(svc.desc || "") + "</p>" +
        (feats ? "<ul>" + feats + "</ul>" : "") +
        (opts.why ? '<p class="lv-life-svc__why">' + esc(opts.why) + "</p>" : "") +
        '<div class="lv-life-svc__acts">' +
          '<a class="lv-life-btn lv-life-btn--dark lv-life-btn--sm" href="' + esc(href) + '">관련 서비스 이용하기</a>' +
          '<button type="button" class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" data-lv-life-save="' + esc(svc.name) + '">' + (saved ? "저장됨" : "저장하기") + "</button>" +
          '<button type="button" class="lv-life-btn lv-life-btn--ghost-ink lv-life-btn--sm" data-lv-life-share="' + esc(svc.name) + '">공유</button>' +
          (stageId ? '<a class="lv-life-btn lv-life-btn--ghost-ink lv-life-btn--sm" href="#livon-ai" data-lv-life-aiq="' + esc(svc.name + "에 대해 알려 줘.") + '" data-stage="' + esc(stageId) + '">AI에 묻기</a>' : "") +
        "</div>" +
      "</article>"
    );
  }

  function renderRail() {
    var rail = $("[data-lv-life-rail]");
    if (!rail) return;
    rail.innerHTML = stages().map(function (s) {
      var fields = (s.fields || []).slice(0, 3).map(function (f) { return esc(f.name); }).join(" · ");
      return (
        '<button type="button" class="lv-life-card" role="listitem" data-lv-life-goto="stage-' + esc(s.id) + '" data-stage="' + esc(s.id) + '">' +
          '<div class="lv-life-card__media"><img class="lv-life-card__img" src="' + esc(s.img) + '" alt="' + esc(s.alt || "") + '" loading="lazy" /></div>' +
          '<div class="lv-life-card__body">' +
            '<p class="lv-life-card__age">' + esc(s.label) + "</p>" +
            '<p class="lv-life-card__name">' + esc(s.title) + "</p>" +
            '<p class="lv-life-card__desc">' + esc(s.desc) + "</p>" +
            (fields ? '<p class="lv-life-card__focus">' + fields + "</p>" : "") +
            '<span class="lv-life-card__go">살펴보기</span>' +
          "</div>" +
        "</button>"
      );
    }).join("");
  }

  function renderStageNav() {
    var track = $("[data-lv-life-stage-nav]");
    if (!track) return;
    track.innerHTML = stages().map(function (s) {
      return '<button type="button" class="lv-life-sticky__link" data-lv-life-goto="stage-' + esc(s.id) + '" data-stage="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
  }

  function renderStageSwitch() {
    var host = $("[data-lv-life-switch]");
    if (!host) return;
    var active = state.viewStage || "10";
    host.innerHTML = stages().map(function (s) {
      var on = String(s.id) === String(active);
      return '<button type="button" role="tab" aria-selected="' + (on ? "true" : "false") + '"' +
        (on ? ' class="is-on"' : "") +
        ' data-lv-life-switch-btn="' + esc(s.id) + '" data-stage="' + esc(s.id) + '">' +
        esc(s.label) +
      "</button>";
    }).join("");
  }

  function showStageView(id, opts) {
    opts = opts || {};
    var list = stages();
    if (!list.length) return;
    if (!stageById(id)) id = list[0].id;
    state.viewStage = String(id);

    $$("[data-lv-life-stages] .lv-life-decade").forEach(function (sec) {
      var on = sec.getAttribute("data-stage") === String(id);
      sec.hidden = !on;
      if (on) {
        sec.classList.add("is-active-stage", "is-in");
      } else {
        sec.classList.remove("is-active-stage");
      }
    });

    $$("[data-lv-life-switch-btn]").forEach(function (btn) {
      var on = btn.getAttribute("data-lv-life-switch-btn") === String(id);
      if (on) btn.classList.add("is-on");
      else btn.classList.remove("is-on");
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    $$("[data-lv-life-stage-nav] [data-stage]").forEach(function (btn) {
      var on = btn.getAttribute("data-stage") === String(id);
      if (on) btn.classList.add("is-on");
      else btn.classList.remove("is-on");
    });

    if (opts.updateHash !== false) {
      var next = "#stage-" + id;
      if (location.hash !== next) history.replaceState(null, "", next);
    }
    if (opts.scroll) {
      requestAnimationFrame(function () { scrollToId("life-stages-view"); });
    }
  }

  function renderStages() {
    var host = $("[data-lv-life-stages]");
    if (!host) return;
    host.innerHTML = stages().map(function (s) {
      var meta =
        '<div class="lv-life-decade__meta">' +
          "<div><p>FOCUS</p><strong>" + esc(s.focus) + "</strong></div>" +
          "<div><p>FIELDS</p><strong>" + esc(String((s.fields || []).length)) + "개 생활 분야</strong></div>" +
        "</div>";
      var fields =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Life Fields</p><h3 class="lv-life-title lv-life-title--md">생활 분야</h3></div>' +
        '<div class="lv-life-fields" data-lv-life-fields="' + esc(s.id) + '">' +
          (s.fields || []).map(function (f) {
            return '<button type="button" data-field="' + esc(f.id) + '" data-stage="' + esc(s.id) + '">' + esc(f.name) + "</button>";
          }).join("") +
        "</div>";
      var services =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Services</p><h3 class="lv-life-title lv-life-title--md">관련 생활 서비스</h3></div>' +
        '<div class="lv-life-services is-trio">' +
          (s.services || []).map(function (svc) { return svcCard(svc, s.id); }).join("") +
        "</div>";
      var ai =
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Ask AI</p><h3 class="lv-life-title lv-life-title--md">이 단계에서 물어보기</h3></div>' +
        '<div class="lv-life-aiq">' +
          (s.ai || []).map(function (q) {
            return '<a href="#livon-ai" data-lv-life-aiq="' + esc(q) + '" data-stage="' + esc(s.id) + '">' + esc(q) + "</a>";
          }).join("") +
        "</div>";
      var community =
        '<p class="lv-life-note">커뮤니티: ' + esc(s.community || "관련 이야기") +
        ' — <a href="#community">게시판으로 이동</a></p>';

      var heroImg = '<div class="lv-life-decade__show"><img src="' + esc(s.img) + '" alt="' + esc(s.alt || "") + '" loading="lazy" /></div>';
      var copy =
        '<div class="lv-life-decade__copy">' +
          '<p class="lv-life-decade__n">' + esc(s.n) + " · " + esc(s.label) + "</p>" +
          '<h2 class="lv-life-title">' + esc(s.title) + "</h2>" +
          '<p class="lv-life-lead">' + esc(s.lead) + "</p>" +
          meta +
        "</div>";

      /* All ages share the same 10s-style split layout + 2-col service cards */
      var top = '<div class="lv-life-decade__split">' + copy + heroImg + "</div>";

      return (
        '<section class="lv-life-sec lv-life-decade" id="stage-' + esc(s.id) + '" data-stage="' + esc(s.id) + '" hidden>' +
          top + fields + services + ai + community +
        "</section>"
      );
    }).join("");

    renderStageSwitch();
    var initial = "10";
    if (location.hash.indexOf("#stage-") === 0) {
      initial = location.hash.replace("#stage-", "");
    } else if (state.viewStage) {
      initial = state.viewStage;
    } else {
      initial = readJSON(KEY_STAGE, null) || "10";
    }
    if (!stageById(initial)) initial = "10";
    state.viewStage = String(initial);
    renderStageSwitch();
    showStageView(initial, { updateHash: false });
  }

  function renderSetupPanel() {
    var panel = $("[data-lv-setup-panel]");
    if (!panel) return;
    var p = prefs();
    var html = "";
    if (state.setupTab === "stage") {
      html = '<div class="lv-life-chips" role="group" aria-label="생애 단계">' +
        stages().map(function (s) {
          return '<button type="button" data-setup-stage="' + esc(s.id) + '"' + (p.stage === s.id ? ' class="is-on"' : "") + ">" + esc(s.label) + " · " + esc(s.title) + "</button>";
        }).join("") + "</div>";
    } else if (state.setupTab === "situation") {
      html = '<div class="lv-life-chips" role="group" aria-label="생활 상황">' +
        (DATA.situations || []).map(function (v) {
          return '<button type="button" data-setup-multi="situation" data-val="' + esc(v) + '"' + (p.situations.indexOf(v) >= 0 ? ' class="is-on"' : "") + ">" + esc(v) + "</button>";
        }).join("") + "</div>";
    } else if (state.setupTab === "interest") {
      html = '<div class="lv-life-chips" role="group" aria-label="관심 분야">' +
        (DATA.interests || []).map(function (v) {
          return '<button type="button" data-setup-multi="interest" data-val="' + esc(v) + '"' + (p.interests.indexOf(v) >= 0 ? ' class="is-on"' : "") + ">" + esc(v) + "</button>";
        }).join("") + "</div>";
    } else {
      html = '<div class="lv-life-chips" role="group" aria-label="현재 목표">' +
        (DATA.goals || []).map(function (v) {
          return '<button type="button" data-setup-multi="goal" data-val="' + esc(v) + '"' + (p.goals.indexOf(v) >= 0 ? ' class="is-on"' : "") + ">" + esc(v) + "</button>";
        }).join("") + "</div>";
    }
    panel.innerHTML = html + '<p class="lv-life-note">복수 선택 가능 · 언제든 수정 · 개인정보를 추가로 요구하지 않습니다.</p>';
  }

  function scoreService(svc, stage, p) {
    var score = 0;
    var reasons = [];
    if (p.stage && stage && stage.id === p.stage) {
      score += 3;
      reasons.push(stage.label + " 선택");
    }
    var blob = (svc.name + " " + (svc.desc || "") + " " + (svc.audience || "")).toLowerCase();
    (p.interests || []).forEach(function (it) {
      if (blob.indexOf(it.toLowerCase()) >= 0 || (stage && (stage.focus || "").indexOf(it) >= 0)) {
        score += 2;
        reasons.push("관심: " + it);
      }
    });
    (p.situations || []).forEach(function (sit) {
      if (blob.indexOf(sit.split("·")[0]) >= 0) {
        score += 2;
        reasons.push("상황: " + sit);
      }
    });
    (p.goals || []).forEach(function (g) {
      if (blob.indexOf(g.split("·")[0]) >= 0) {
        score += 1;
        reasons.push("목표: " + g);
      }
    });
    return { score: score, reasons: reasons.slice(0, 2) };
  }

  function renderPriority() {
    var host = $("[data-lv-life-priority]");
    var why = $("[data-lv-life-why]");
    if (!host) return;
    var p = prefs();
    var scored = [];
    stages().forEach(function (st) {
      (st.services || []).forEach(function (svc) {
        var r = scoreService(svc, st, p);
        if (r.score > 0) scored.push({ svc: svc, stage: st, score: r.score, reasons: r.reasons });
      });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    scored = scored.slice(0, 6);
    if (!scored.length) {
      host.innerHTML = '<div class="lv-life-empty">아직 우선 노출할 항목이 없습니다. 위에서 생애 단계나 관심 분야를 선택해 보세요.</div>';
      if (why) why.textContent = "맞춤 설정을 적용하면 추천 이유가 여기에 표시됩니다.";
      return;
    }
    if (why) {
      var bits = [];
      if (p.stage) bits.push(stageById(p.stage) ? stageById(p.stage).label : p.stage);
      if (p.situations.length) bits.push(p.situations.slice(0, 2).join(", "));
      if (p.interests.length) bits.push(p.interests.slice(0, 2).join(", "));
      why.textContent = "우선 기준: " + (bits.join(" · ") || "선택값") + " (규칙 기반)";
    }
    host.innerHTML = '<div class="lv-life-services is-trio">' +
      scored.map(function (item) {
        return svcCard(item.svc, item.stage.id, {
          why: "이유 · " + (item.reasons.join(" · ") || item.stage.label)
        });
      }).join("") +
    "</div>";
  }

  function renderTransitions() {
    var host = $("[data-lv-life-transitions]");
    if (!host) return;
    host.innerHTML = (DATA.transitions || []).map(function (t, i) {
      return (
        '<article class="lv-life-trans__card">' +
          '<span class="lv-life-trans__n" aria-hidden="true">' + String(i + 1).padStart(2, "0") + "</span>" +
          "<h3>" + esc(t.title) + "</h3>" +
          "<p>" + esc(t.desc) + "</p>" +
          '<ol class="lv-life-trans__steps">' +
            (t.steps || []).map(function (s, si) {
              return "<li><em>" + String(si + 1).padStart(2, "0") + "</em><span>" + esc(s) + "</span></li>";
            }).join("") +
          "</ol>" +
          linkHtml(t.links) +
        "</article>"
      );
    }).join("");
  }

  function renderPackages() {
    var host = $("[data-lv-life-packages]");
    if (!host) return;
    host.innerHTML = (DATA.packages || []).map(function (pk, i) {
      return (
        '<article class="lv-life-pack' + (i % 3 === 0 ? " is-accent" : "") + '">' +
          '<p class="lv-life-pack__eyebrow">Guide package</p>' +
          "<h3>" + esc(pk.title) + "</h3>" +
          '<p class="lv-life-pack__for">' + esc(pk.for) + "</p>" +
          '<p class="lv-life-pack__note">포함 안내 · 결제·예약 없음</p>' +
          '<ul class="lv-life-pack__includes">' +
            (pk.services || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
          "</ul>" +
          '<ol class="lv-life-pack__steps">' +
            (pk.steps || []).map(function (s, si) {
              return "<li><em>" + String(si + 1).padStart(2, "0") + "</em><span>" + esc(s) + "</span></li>";
            }).join("") +
          "</ol>" +
          linkHtml(pk.links) +
        "</article>"
      );
    }).join("");
  }

  function layoutClass(layout) {
    if (layout === "edu") return "is-edu";
    if (layout === "travel") return "is-travel";
    if (layout === "home" || layout === "housing") return "is-home";
    if (layout === "finance") return "is-finance";
    if (layout === "health") return "is-health";
    return "is-info";
  }

  function showField(stageId, fieldId) {
    var stage = stageById(stageId);
    if (!stage) return;
    var field = (stage.fields || []).find(function (f) { return f.id === fieldId; });
    if (!field) return;
    state.activeField = { stageId: stageId, fieldId: fieldId };
    var sec = $("#life-field");
    var view = $("[data-lv-life-field-view]");
    if (!sec || !view) return;
    sec.hidden = false;
    sec.classList.add("is-in");

    var svcs = resolveServices(stage, field.services);
    var related = (stage.fields || []).filter(function (f) { return f.id !== field.id; }).slice(0, 4);

    view.innerHTML =
      '<div class="lv-life-field__inner ' + layoutClass(field.layout) + '">' +
        '<button type="button" class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" data-lv-field-close>닫기</button>' +
        '<p class="lv-life-kicker">' + esc(stage.label) + " · Life Field</p>" +
        '<h2 class="lv-life-title">' + esc(field.name) + "</h2>" +
        '<p class="lv-life-lead">' + esc(field.blurb) + "</p>" +
        '<div class="lv-life-field__grid">' +
          '<div>' +
            '<h3 class="lv-life-title lv-life-title--md">주요 생활 상황</h3>' +
            '<ul class="lv-life-chips lv-life-chips--static">' +
              (field.situations || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
            "</ul>" +
            '<h3 class="lv-life-title lv-life-title--md" style="margin-top:1.75rem">단계별 준비 가이드</h3>' +
            '<ol class="lv-life-steps">' +
              (field.steps || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
            "</ol>" +
          "</div>" +
          '<aside class="lv-life-field__aside">' +
            "<p><strong>탐색</strong><br>전문가·업체·기관은 탐색 메뉴에서 연결합니다.</p>" +
            "<p><strong>내 생활</strong><br>일정·목표·체크리스트는 내 생활에서 관리합니다.</p>" +
            "<p><strong>커뮤니티</strong><br>경험·질문은 커뮤니티에서 나눕니다.</p>" +
            "<p><strong>LIVON AI</strong><br>맞춤 계획은 대화로 이어갑니다.</p>" +
            linkHtml(field.links) +
          "</aside>" +
        "</div>" +
        '<div class="lv-life-block-label"><p class="lv-life-kicker">Related services</p><h3 class="lv-life-title lv-life-title--md">관련 생활 서비스</h3></div>' +
        '<div class="lv-life-services">' + svcs.map(function (svc) { return svcCard(svc, stage.id); }).join("") + "</div>" +
        (related.length
          ? '<div class="lv-life-block-label"><p class="lv-life-kicker">More fields</p><h3 class="lv-life-title lv-life-title--md">연관 생활 분야</h3></div>' +
            '<div class="lv-life-fields">' +
              related.map(function (f) {
                return '<button type="button" data-field="' + esc(f.id) + '" data-stage="' + esc(stage.id) + '">' + esc(f.name) + "</button>";
              }).join("") +
            "</div>"
          : "") +
      "</div>";

    history.replaceState(null, "", "#field-" + stageId + "-" + fieldId);
    document.documentElement.dataset.lvView = "life";
    requestAnimationFrame(function () { scrollToId("life-field"); });
    bindDynamic(view);
  }

  function hideField() {
    var sec = $("#life-field");
    if (sec) sec.hidden = true;
    state.activeField = null;
  }

  function updateStageLabel() {
    var id = readJSON(KEY_STAGE, null);
    state.stageId = id;
    var label = $("[data-lv-life-stage-label]");
    var st = stageById(id);
    if (label) label.textContent = "선택된 라이프 스테이지: " + (st ? st.label + " · " + st.title : "없음");
    /* Prefer preference chips only — do not override the stage view switcher */
    $$("[data-setup-stage]").forEach(function (el) {
      el.classList.toggle("is-on", el.getAttribute("data-setup-stage") === String(id));
    });
    $$("[data-lv-life-rail] [data-stage]").forEach(function (el) {
      el.classList.toggle("is-on", el.getAttribute("data-stage") === String(id));
    });
  }

  function setStage(id, opts) {
    opts = opts || {};
    if (id) writeJSON(KEY_STAGE, String(id));
    updateStageLabel();
    if (id) {
      document.documentElement.dataset.lvView = "life";
      showStageView(id, { updateHash: !!opts.goto || opts.updateHash === true, scroll: !!opts.goto });
    }
  }

  function openModal() {
    var modal = $("#lv-life-age-modal");
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var first = modal.querySelector("button[data-age]");
    if (first) first.focus();
  }
  function closeModal() {
    var modal = $("#lv-life-age-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  function openLoginNotice(msg) {
    var modal = $("#lv-life-login-modal");
    if (!modal) return;
    var p = modal.querySelector("[data-lv-life-login-msg]");
    if (p && msg) p.textContent = msg;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLoginNotice() {
    var modal = $("#lv-life-login-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function initHero() {
    var hero = $("[data-lv-life-hero]");
    if (!hero) return;
    requestAnimationFrame(function () { hero.classList.add("is-ready"); });
  }

  function initReveal() {
    var nodes = $$("#life [data-lv-reveal]");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function stickyObserve() {
    var sticky = $("[data-lv-life-sticky]");
    var hero = $("[data-lv-life-hero]");
    if (!sticky || !hero) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        sticky.classList.toggle("is-show", !e.isIntersecting);
      });
    }, { threshold: 0.05 });
    io.observe(hero);
  }

  function bindDynamic(root) {
    root = root || document;
    $$("[data-lv-life-aiq]", root).forEach(function (link) {
      if (link._bound) return;
      link._bound = true;
      link.addEventListener("click", function () {
        var q = link.getAttribute("data-lv-life-aiq") || "";
        var stage = link.getAttribute("data-stage") || readJSON(KEY_STAGE, "");
        try {
          sessionStorage.setItem(KEY_AIQ, JSON.stringify({ q: q, stage: stage, at: Date.now() }));
        } catch (e) {}
      });
    });
    $$("[data-lv-life-save]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-lv-life-save");
        var on = toggleSave(name);
        btn.textContent = on ? "저장됨" : "저장하기";
        openLoginNotice("관심 서비스는 이 기기에 저장됩니다. 계정 동기화·클라우드 저장은 아직 연결되지 않았습니다.");
      });
    });
    $$("[data-lv-life-share]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-lv-life-share") || "LIVON 라이프 스테이지";
        var url = location.origin + location.pathname + "#life";
        if (navigator.share) {
          navigator.share({ title: name, url: url }).catch(function () {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            openLoginNotice("링크가 복사되었습니다. 공유 기능은 기기에서 지원하는 범위로 제공됩니다.");
          });
        } else {
          openLoginNotice("이 환경에서는 공유 API를 사용할 수 없습니다. 주소창의 링크를 복사해 주세요.");
        }
      });
    });
    $$("[data-field]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        showField(btn.getAttribute("data-stage"), btn.getAttribute("data-field"));
      });
    });
    $$("[data-lv-field-close]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", hideField);
    });
    $$("[data-lv-life-goto]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        var id = (btn.getAttribute("data-lv-life-goto") || "").replace("stage-", "");
        setStage(id, { goto: true });
      });
    });
    $$("[data-lv-life-switch-btn]", root).forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-lv-life-switch-btn");
        setStage(id, { goto: true, updateHash: true });
      });
    });
  }

  function bindSetup() {
    $$("[data-lv-setup-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.setupTab = btn.getAttribute("data-lv-setup-tab");
        $$("[data-lv-setup-tab]").forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-on", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        renderSetupPanel();
      });
    });
    var panel = $("[data-lv-setup-panel]");
    if (panel) {
      panel.addEventListener("click", function (e) {
        var t = e.target.closest("[data-setup-stage]");
        if (t) {
          setStage(t.getAttribute("data-setup-stage"), { goto: false });
          renderSetupPanel();
          return;
        }
        var m = e.target.closest("[data-setup-multi]");
        if (m) {
          var kind = m.getAttribute("data-setup-multi");
          var val = m.getAttribute("data-val");
          var key = kind === "situation" ? KEY_SITUATIONS : kind === "interest" ? KEY_INTERESTS : KEY_GOALS;
          var list = readJSON(key, []);
          var i = list.indexOf(val);
          if (i >= 0) list.splice(i, 1); else list.push(val);
          writeJSON(key, list);
          renderSetupPanel();
        }
      });
    }
    var skip = $("[data-lv-setup-skip]");
    if (skip) skip.addEventListener("click", function () { scrollToId("life-explore"); });
    var reset = $("[data-lv-setup-reset]");
    if (reset) reset.addEventListener("click", function () {
      writeJSON(KEY_STAGE, null);
      writeJSON(KEY_SITUATIONS, []);
      writeJSON(KEY_INTERESTS, []);
      writeJSON(KEY_GOALS, []);
      updateStageLabel();
      renderSetupPanel();
      renderPriority();
    });
    var apply = $("[data-lv-setup-apply]");
    if (apply) apply.addEventListener("click", function () {
      renderPriority();
      scrollToId("life-mine");
      var p = prefs();
      if (p.stage) setStage(p.stage, { goto: false });
    });
  }

  function bind() {
    var switchHost = $("[data-lv-life-switch]");
    if (switchHost && !switchHost._boundSwitch) {
      switchHost._boundSwitch = true;
      switchHost.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-lv-life-switch-btn]");
        if (!btn || !switchHost.contains(btn)) return;
        var id = btn.getAttribute("data-lv-life-switch-btn");
        setStage(id, { goto: true, updateHash: true });
      });
    }
    $$("[data-lv-life-find]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });
    $$("[data-lv-life-scroll]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href") || "";
        if (href.charAt(0) === "#") {
          e.preventDefault();
          document.documentElement.dataset.lvView = "life";
          scrollToId(href.slice(1));
        }
      });
    });
    var ageModal = $("#lv-life-age-modal");
    if (ageModal) {
      ageModal.querySelectorAll("[data-age]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-age");
          closeModal();
          setStage(id, { goto: true });
          renderSetupPanel();
          renderPriority();
        });
      });
      ageModal.querySelectorAll("[data-lv-life-modal-close]").forEach(function (btn) {
        btn.addEventListener("click", closeModal);
      });
    }
    var loginModal = $("#lv-life-login-modal");
    if (loginModal) {
      loginModal.querySelectorAll("[data-lv-life-modal-close]").forEach(function (btn) {
        btn.addEventListener("click", closeLoginNotice);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); closeLoginNotice(); hideField(); }
    });
  }

  function bootRender() {
    renderStageNav();
    renderRail();
    renderStages();
    renderSetupPanel();
    renderPriority();
    renderTransitions();
    renderPackages();
    bindDynamic(document);
  }

  window.LivonLife = {
    setStage: setStage,
    scrollToId: scrollToId,
    isLifeHash: function (hash) {
      return hash === "life" ||
        hash === "life-stages" ||
        hash.indexOf("stage-") === 0 ||
        hash.indexOf("field-") === 0 ||
        (hash.indexOf("life-") === 0 && hash !== "life-now");
    },
    onShow: function (hash) {
      initHero();
      updateStageLabel();
      $$("#life [data-lv-reveal]").forEach(function (n) {
        if (n.getBoundingClientRect().top < window.innerHeight * 1.2) n.classList.add("is-in");
      });
      if (hash.indexOf("field-") === 0) {
        var parts = hash.replace("field-", "").split("-");
        if (parts.length >= 2) showField(parts[0], parts.slice(1).join("-"));
        return;
      }
      var stage = null;
      if (hash.indexOf("stage-") === 0) stage = hash.replace("stage-", "");
      else stage = state.viewStage || readJSON(KEY_STAGE, null) || "10";
      showStageView(stage, { updateHash: hash.indexOf("stage-") === 0, scroll: false });
      if (hash.indexOf("stage-") === 0) {
        setTimeout(function () {
          scrollToId("life-stages-view");
          var panel = document.getElementById("life-stages-view");
          if (panel) panel.classList.add("is-in");
        }, 50);
      } else if (hash === "life-explore" || hash === "life-mine" || hash === "life-setup" || hash === "life-transitions" || hash === "life-packages" || hash === "life-family" || hash === "life-services" || hash === "life-ai" || hash === "life-cta" || hash === "life-field" || hash === "life-stages-view") {
        setTimeout(function () {
          scrollToId(hash);
          var target = document.getElementById(hash);
          if (target) target.classList.add("is-in");
        }, 50);
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!DATA.stages || !DATA.stages.length) {
      console.warn("[LivonLife] life-data missing");
    }
    bootRender();
    initHero();
    initReveal();
    stickyObserve();
    bindSetup();
    bind();
    updateStageLabel();
  });
})();
