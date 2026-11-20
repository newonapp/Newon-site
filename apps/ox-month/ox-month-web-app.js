/**
 * OX MONTH Web app — auth + Sync GET (no auto-bootstrap) + habit CRUD + O/X PATCH.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
  buildOxMonthViewModel,
  markForHabitTitle,
  parseSyncGetResponse,
  monthKey,
  dayKey,
} from "./ox-month-parser.mjs";
import {
  buildPatchedHabitCheckJson,
  habitCheckPrefsKey,
  nextMarkFromPick,
} from "./ox-month-habit-check.mjs";
import {
  applyHabitListMutation,
  habitTitlesPrefsKey,
} from "./ox-month-habit-list.mjs";
import { saveOxIntentionWithConflictRetry } from "./ox-month-ox-save.mjs";
import { savePrefsPatchWithConflictRetry } from "./ox-month-prefs-save.mjs";
import { bootstrapOxMonthSyncDocument } from "./ox-month-bootstrap.mjs";
import {
  ACCENT_OPTIONS,
  ACCENT_O_KEY,
  ACCENT_X_KEY,
  resolveAccents,
} from "./ox-month-accents.mjs";
import {
  computeMonthStats,
  goalsPrefsKey,
  goalsStorageMonthKey,
  parseGoalsMap,
  serializeGoalsMap,
} from "./ox-month-stats.mjs";
import {
  assertNoClientIdentityInUrl,
  createSyncClient,
} from "./ox-month-sync.mjs";

(function () {
  "use strict";

  var root = document.getElementById("oxm-app");
  if (!root) return;

  var els = {
    views: {
      loading: document.getElementById("oxm-view-loading"),
      config: document.getElementById("oxm-view-config"),
      signedOut: document.getElementById("oxm-view-signed-out"),
      app: document.getElementById("oxm-view-app"),
      today: document.getElementById("oxm-view-today"),
      habits: document.getElementById("oxm-view-habits"),
      settings: document.getElementById("oxm-view-settings"),
      stats: document.getElementById("oxm-view-stats"),
      error: document.getElementById("oxm-view-error"),
    },
    loginForm: document.getElementById("oxm-login-form"),
    email: document.getElementById("oxm-email"),
    password: document.getElementById("oxm-password"),
    authError: document.getElementById("oxm-auth-error"),
    loginBtn: document.getElementById("oxm-login-btn"),
    signupBtn: document.getElementById("oxm-signup-btn"),
    logoutBtn: document.getElementById("oxm-logout-btn"),
    habitsBtn: document.getElementById("oxm-habits-btn"),
    habitsBack: document.getElementById("oxm-habits-back"),
    habitsView: document.getElementById("oxm-view-habits"),
    manageList: document.getElementById("oxm-manage-list"),
    themeBtn: document.getElementById("oxm-theme-btn"),
    todayLabel: document.getElementById("oxm-today-label"),
    todayBlock: document.getElementById("oxm-today-block"),
    todayCta: document.getElementById("oxm-today-cta"),
    todayBack: document.getElementById("oxm-today-back"),
    todayDayPrev: document.getElementById("oxm-today-day-prev"),
    todayDayNext: document.getElementById("oxm-today-day-next"),
    habitAddForm: document.getElementById("oxm-habit-add-form"),
    habitAddInput: document.getElementById("oxm-habit-add-input"),
    habitAddBtn: document.getElementById("oxm-habit-add-btn"),
    habitPart: document.getElementById("oxm-habit-part"),
    habitList: document.getElementById("oxm-habit-list"),
    sheet: document.getElementById("oxm-sheet"),
    sheetDismiss: document.getElementById("oxm-sheet-dismiss"),
    sheetTitle: document.getElementById("oxm-sheet-title"),
    sheetBody: document.getElementById("oxm-sheet-body"),
    sheetActions: document.getElementById("oxm-sheet-actions"),
    monthLabel: document.getElementById("oxm-month-label"),
    monthGrid: document.getElementById("oxm-month-grid"),
    monthPrev: document.getElementById("oxm-month-prev"),
    monthNext: document.getElementById("oxm-month-next"),
    appView: document.getElementById("oxm-view-app"),
    todayView: document.getElementById("oxm-view-today"),
    syncBanner: document.getElementById("oxm-sync-banner"),
    emptySync: document.getElementById("oxm-empty-sync"),
    emptySyncMsg: document.getElementById("oxm-empty-sync-msg"),
    emptySyncCreate: document.getElementById("oxm-empty-sync-create"),
    errorMsg: document.getElementById("oxm-error-msg"),
    errorRetry: document.getElementById("oxm-error-retry"),
    settingsBack: document.getElementById("oxm-settings-back"),
    settingsEmail: document.getElementById("oxm-settings-email"),
    settingsTheme: document.getElementById("oxm-settings-theme"),
    settingsThemeMeta: document.getElementById("oxm-settings-theme-meta"),
    settingsStats: document.getElementById("oxm-settings-stats"),
    settingsLogout: document.getElementById("oxm-settings-logout"),
    goalInput: document.getElementById("oxm-goal-input"),
    goalPct: document.getElementById("oxm-goal-pct"),
    goalSave: document.getElementById("oxm-goal-save"),
    accentO: document.getElementById("oxm-accent-o"),
    accentX: document.getElementById("oxm-accent-x"),
    statsBack: document.getElementById("oxm-stats-back"),
    statsBody: document.getElementById("oxm-stats-body"),
  };

  var syncClient = createSyncClient({
    baseUrl: (window.OX_MONTH_SYNC_API_BASE || "https://api.newon.app").replace(
      /\/$/,
      "",
    ),
  });

  var auth = null;
  var state = {
    user: null,
    sync: null,
    syncStatus: "idle",
    busy: false,
    oxSaving: false,
    habitSaving: false,
    visibleMonth: new Date(),
    checkDay: new Date(),
  };

  var mockMode =
    new URLSearchParams(location.search).get("mock") === "1" ||
    window.OX_MONTH_WEB_MOCK === true;

  function isKo() {
    return document.documentElement.lang === "ko";
  }

  function bootstrapLocale() {
    return document.documentElement.lang === "ko" ? "ko" : "en";
  }

  function showView(name) {
    Object.keys(els.views).forEach(function (key) {
      var node = els.views[key];
      if (!node) return;
      node.hidden = key !== name;
    });
  }

  function setAuthError(msg) {
    if (!els.authError) return;
    els.authError.textContent = msg || "";
    els.authError.hidden = !msg;
  }

  /** Map Firebase Auth codes to safe, user-facing copy (never log tokens). */
  function mapAuthError(err) {
    var code = err && typeof err.code === "string" ? err.code : "";
    if (isKo()) {
      if (code === "auth/invalid-email") return "이메일 형식이 올바르지 않습니다.";
      if (code === "auth/missing-password" || code === "auth/weak-password") {
        return "비밀번호는 6자 이상이어야 합니다.";
      }
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        return "이메일 또는 비밀번호가 올바르지 않습니다.";
      }
      if (code === "auth/email-already-in-use") return "이미 가입된 이메일입니다.";
      if (code === "auth/operation-not-allowed") {
        return "이메일/비밀번호 로그인이 비활성화되어 있습니다.";
      }
      if (code === "auth/too-many-requests") {
        return "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
      }
      if (code === "auth/network-request-failed") {
        return "네트워크 오류로 인증에 실패했습니다.";
      }
      if (code === "auth/unauthorized-domain") {
        return "이 도메인은 Firebase Auth에 허용되지 않았습니다.";
      }
      return "인증에 실패했습니다.";
    }
    if (code === "auth/invalid-email") return "Invalid email address.";
    if (code === "auth/missing-password" || code === "auth/weak-password") {
      return "Password must be at least 6 characters.";
    }
    if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
      return "Incorrect email or password.";
    }
    if (code === "auth/email-already-in-use") return "That email is already registered.";
    if (code === "auth/operation-not-allowed") {
      return "Email/password sign-in is disabled.";
    }
    if (code === "auth/too-many-requests") return "Too many attempts. Try again later.";
    if (code === "auth/network-request-failed") return "Network error during authentication.";
    if (code === "auth/unauthorized-domain") {
      return "This domain is not authorized for Firebase Auth.";
    }
    return "Authentication failed.";
  }

  function readAuthFields() {
    var email = `${els.email && els.email.value}`.trim();
    var password = `${els.password && els.password.value}`;
    if (!email) {
      setAuthError(
        isKo() ? "이메일을 입력해 주세요." : "Enter your email.",
      );
      return null;
    }
    if (!password || password.length < 6) {
      setAuthError(
        isKo()
          ? "비밀번호는 6자 이상이어야 합니다."
          : "Password must be at least 6 characters.",
      );
      return null;
    }
    return { email: email, password: password };
  }

  function setSyncBanner(text, warn) {
    if (!els.syncBanner) return;
    els.syncBanner.textContent = text || "";
    els.syncBanner.hidden = !text;
    els.syncBanner.classList.toggle("oxm-banner--warn", Boolean(warn));
  }

  function formatToday(d) {
    try {
      return new Intl.DateTimeFormat(document.documentElement.lang || "en", {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    } catch {
      return d.toISOString().slice(0, 10);
    }
  }

  function formatMonthName(d) {
    try {
      return new Intl.DateTimeFormat(document.documentElement.lang || "en", {
        month: "long",
      }).format(d);
    } catch {
      return d.toISOString().slice(0, 7);
    }
  }

  function partLabel(part) {
    var app = els.habitsView || els.todayView || els.appView;
    if (!app) return part === 0 ? "Morning" : part === 1 ? "Lunch" : "Evening";
    if (part === 0) return app.getAttribute("data-part-morning") || "Morning";
    if (part === 1) return app.getAttribute("data-part-lunch") || "Lunch";
    return app.getAttribute("data-part-evening") || "Evening";
  }

  function habitsCopy(attr, fallback) {
    if (els.habitsView && els.habitsView.getAttribute(attr)) {
      return els.habitsView.getAttribute(attr);
    }
    return fallback;
  }

  function closeSheet() {
    if (!els.sheet) return;
    els.sheet.hidden = true;
    if (els.sheetBody) els.sheetBody.innerHTML = "";
    if (els.sheetActions) els.sheetActions.innerHTML = "";
    if (els.sheetTitle) els.sheetTitle.textContent = "";
  }

  function openSheet(opts) {
    if (!els.sheet || !els.sheetBody || !els.sheetActions || !els.sheetTitle) {
      return;
    }
    els.sheetTitle.textContent = opts.title || "";
    els.sheetBody.innerHTML = "";
    els.sheetActions.innerHTML = "";
    if (opts.bodyNode) els.sheetBody.appendChild(opts.bodyNode);
    (opts.actions || []).forEach(function (a) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "oxm-sheet__btn" +
        (a.primary ? " oxm-sheet__btn--primary" : "") +
        (a.danger ? " oxm-sheet__btn--danger" : "");
      btn.textContent = a.label;
      btn.disabled = !!a.disabled;
      btn.addEventListener("click", function () {
        if (typeof a.onClick === "function") a.onClick();
      });
      els.sheetActions.appendChild(btn);
    });
    els.sheet.hidden = false;
  }

  function openHabits(focusAdd) {
    renderAccentPickers();
    refreshView();
    showView("habits");
    if (focusAdd && els.habitAddInput) {
      setTimeout(function () {
        els.habitAddInput.focus();
      }, 50);
    }
  }

  function parseDateKeyLocal(dateKey) {
    var parts = `${dateKey || ""}`.split("-").map(Number);
    if (
      parts.length !== 3 ||
      parts.some(function (n) {
        return !Number.isFinite(n);
      })
    ) {
      return new Date();
    }
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  }

  function shiftCheckDay(delta) {
    var d = new Date(state.checkDay.getTime());
    d.setDate(d.getDate() + delta);
    var limit = new Date();
    limit.setHours(23, 59, 59, 999);
    if (d.getTime() > limit.getTime()) return;
    state.checkDay = d;
    refreshView();
  }

  function openTodayCheck(dateOrKey) {
    if (typeof dateOrKey === "string") {
      state.checkDay = parseDateKeyLocal(dateOrKey);
    } else if (dateOrKey instanceof Date) {
      state.checkDay = new Date(dateOrKey.getTime());
    } else {
      state.checkDay = new Date();
    }
    refreshView();
    showView("today");
  }

  function syncGoalPctLabel() {
    if (!els.goalPct || !els.goalInput) return;
    var n = Number(els.goalInput.value);
    if (!Number.isFinite(n)) n = 70;
    els.goalPct.textContent = Math.round(n) + "%";
  }

  function syncThemeMeta() {
    if (!els.settingsThemeMeta) return;
    var light = root.getAttribute("data-theme") === "light";
    els.settingsThemeMeta.textContent = light
      ? isKo()
        ? "라이트"
        : "Light"
      : isKo()
        ? "다크"
        : "Dark";
  }

  function editLabel() {
    if (els.habitList) {
      return (
        els.habitList.getAttribute("data-edit-label") ||
        (isKo() ? "수정" : "Edit")
      );
    }
    return isKo() ? "수정" : "Edit";
  }

  function deleteLabel() {
    if (els.habitList) {
      return (
        els.habitList.getAttribute("data-delete-label") ||
        (isKo() ? "삭제" : "Delete")
      );
    }
    return isKo() ? "삭제" : "Delete";
  }

  function currentPayload() {
    return state.sync && state.sync.payload ? state.sync.payload : {};
  }

  function cloneSync(sync) {
    if (!sync) return null;
    return {
      ok: true,
      appId: sync.appId || "ox_month",
      revision: sync.revision,
      schemaVersion: sync.schemaVersion || 1,
      updatedAt: sync.updatedAt || "",
      payload: Object.assign({}, sync.payload || {}),
    };
  }

  function setEmptySyncVisible(visible) {
    if (!els.emptySync) return;
    els.emptySync.hidden = !visible;
  }

  function showNotSyncedState() {
    state.sync = null;
    state.syncStatus = "not_synced";
    state.visibleMonth = new Date();
    setEmptySyncVisible(true);
    setSyncBanner(
      isKo()
        ? "아직 동기화된 데이터가 없습니다. 모바일에서 계정으로 연결한 뒤 다시 열어 주세요."
        : "No synced data yet. Link this account from the mobile app, then reopen.",
      true,
    );
    refreshView();
    showView("app");
  }

  async function handleExplicitCreateEmptySync() {
    if (!state.user || state.busy) return;
    var ok = window.confirm(
      isKo()
        ? "모바일 OX MONTH에 이미 습관 데이터가 있다면 여기서 새로 만들지 마세요.\n\n웹에서 빈 문서를 새로 만들까요? (모바일 데이터는 자동으로 가져오지 않습니다)"
        : "If this account already has OX MONTH data on mobile, do not create a web document here.\n\nCreate an empty web sync document? (Mobile data is not imported automatically.)",
    );
    if (!ok) return;

    state.busy = true;
    setSyncBanner(
      isKo() ? "동기화 문서를 만드는 중…" : "Creating sync document…",
      false,
    );
    try {
      var boot = await bootstrapOxMonthSyncDocument({
        client: syncClient,
        getIdToken: function () {
          return state.user.getIdToken();
        },
        locale: bootstrapLocale(),
      });
      if (boot.ok && boot.sync) {
        setEmptySyncVisible(false);
        applySyncResult(boot.sync);
        state.visibleMonth = new Date();
        setSyncBanner("", false);
        refreshView();
        showView("app");
        return;
      }
      if (boot.error === "unauthorized") {
        state.syncStatus = "unauthorized";
        if (els.errorMsg) {
          els.errorMsg.textContent = isKo()
            ? "로그인은 됐지만 동기화 서버가 인증 토큰을 거부했습니다."
            : "Signed in, but the sync server rejected the auth token.";
        }
        showView("error");
        return;
      }
      setSyncBanner(
        isKo()
          ? "동기화 문서를 만들 수 없습니다."
          : "Could not create sync document.",
        true,
      );
    } finally {
      state.busy = false;
    }
  }

  function applySyncResult(syncLike) {
    state.sync = {
      ok: true,
      appId: (state.sync && state.sync.appId) || "ox_month",
      revision: syncLike.revision,
      schemaVersion: syncLike.schemaVersion || 1,
      updatedAt: syncLike.updatedAt || "",
      payload: Object.assign({}, syncLike.payload || {}),
    };
    state.syncStatus = "ready";
    setEmptySyncVisible(false);
    applyAccentsFromPayload(state.sync.payload);
    var mode = state.sync.payload && state.sync.payload.ox_month_appearance_mode_v1;
    if (mode === "light" || mode === "dark") {
      applyTheme(mode, { persistSync: false });
    }
  }

  function applyAccentsFromPayload(payload) {
    var accents = resolveAccents(payload || {});
    root.style.setProperty("--ox-o", accents.oHex);
    root.style.setProperty("--ox-x", accents.xHex);
  }

  function openSettings() {
    if (els.settingsEmail) {
      els.settingsEmail.textContent =
        (state.user && state.user.email) || "";
    }
    syncThemeMeta();
    var email = state.user && state.user.email ? state.user.email : "";
    var goals = parseGoalsMap(currentPayload()[goalsPrefsKey(email)]);
    var gKey = goalsStorageMonthKey(state.visibleMonth);
    if (els.goalInput) {
      els.goalInput.value =
        goals[gKey] != null ? String(goals[gKey]) : "70";
      els.goalInput.disabled = !canEditOx();
      syncGoalPctLabel();
    }
    if (els.goalSave) els.goalSave.disabled = !canEditOx();
    showView("settings");
  }

  function renderAccentPickers() {
    var accents = resolveAccents(currentPayload());
    function fill(node, selectedId, which) {
      if (!node) return;
      node.innerHTML = "";
      ACCENT_OPTIONS.forEach(function (opt) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "oxm-accent-swatch" + (opt.id === selectedId ? " is-on" : "");
        btn.style.background = opt.hex;
        btn.setAttribute("data-accent-id", opt.id);
        btn.setAttribute("data-which", which);
        btn.title = opt.id;
        node.appendChild(btn);
      });
    }
    fill(els.accentO, accents.oId, "o");
    fill(els.accentX, accents.xId, "x");
  }

  function renderStatsPanel() {
    if (!els.statsBody) return;
    var email = state.user && state.user.email ? state.user.email : "";
    var mk = monthKey(state.visibleMonth);
    var titlesKey = habitTitlesPrefsKey(email, mk);
    var checkKey = habitCheckPrefsKey(email);
    var payload = currentPayload();
    var stats = computeMonthStats(payload[checkKey], payload[titlesKey], mk);
    var goals = parseGoalsMap(payload[goalsPrefsKey(email)]);
    var goal = goals[goalsStorageMonthKey(state.visibleMonth)];
    els.statsBody.innerHTML = "";

    var monthEl = document.createElement("p");
    monthEl.className = "oxm-stats-month";
    monthEl.textContent = formatMonthName(state.visibleMonth);
    els.statsBody.appendChild(monthEl);

    if (!stats.habitCount) {
      var empty = document.createElement("p");
      empty.className = "oxm-muted";
      empty.textContent = isKo()
        ? "이 달에 습관이 없습니다."
        : "No habits this month.";
      els.statsBody.appendChild(empty);
      return;
    }

    if (stats.ranked.length) {
      var rankCard = document.createElement("div");
      rankCard.className = "oxm-stats-card";
      var rankTitle = document.createElement("p");
      rankTitle.className = "oxm-stats-card__title";
      rankTitle.textContent = isKo() ? "습관별 O" : "Habits by O";
      rankCard.appendChild(rankTitle);
      var ul = document.createElement("ul");
      ul.className = "oxm-stats-rank";
      stats.ranked.forEach(function (r) {
        var li = document.createElement("li");
        var name = document.createElement("span");
        name.className = "oxm-stats-rank__name";
        name.textContent = r.title;
        var meta = document.createElement("span");
        meta.className = "oxm-stats-rank__meta";
        meta.textContent =
          "O " +
          r.oCount +
          " · X " +
          r.xCount +
          (r.rate != null ? " · " + Math.round(r.rate * 100) + "%" : "");
        li.appendChild(name);
        li.appendChild(meta);
        ul.appendChild(li);
      });
      rankCard.appendChild(ul);
      els.statsBody.appendChild(rankCard);
    }

    var countCard = document.createElement("div");
    countCard.className = "oxm-stats-card";
    var counts = document.createElement("div");
    counts.className = "oxm-stats-counts";
    ["O", "X"].forEach(function (letter) {
      var block = document.createElement("div");
      var lab = document.createElement("p");
      lab.className =
        "oxm-stats-count__label oxm-stats-count__label--" + letter.toLowerCase();
      lab.textContent = letter;
      var val = document.createElement("p");
      val.className = "oxm-stats-count__value";
      val.textContent = String(letter === "O" ? stats.totalO : stats.totalX);
      block.appendChild(lab);
      block.appendChild(val);
      counts.appendChild(block);
    });
    countCard.appendChild(counts);
    if (stats.oRatio != null) {
      var ratio = document.createElement("p");
      ratio.className = "oxm-muted";
      ratio.style.marginTop = "12px";
      ratio.style.textAlign = "center";
      ratio.textContent =
        (isKo() ? "O 비율 " : "O rate ") + Math.round(stats.oRatio * 100) + "%";
      countCard.appendChild(ratio);
    }
    if (goal != null) {
      var goalLine = document.createElement("p");
      goalLine.className = "oxm-muted";
      goalLine.style.textAlign = "center";
      goalLine.textContent = (isKo() ? "월 목표 " : "Goal ") + goal + "%";
      countCard.appendChild(goalLine);
    }
    els.statsBody.appendChild(countCard);

    if (stats.best) {
      var best = document.createElement("div");
      best.className = "oxm-stats-highlight";
      best.innerHTML =
        '<span class="oxm-stats-highlight__icon" aria-hidden="true">↑</span>';
      var bestBody = document.createElement("div");
      var kicker = document.createElement("p");
      kicker.className = "oxm-stats-highlight__kicker";
      kicker.textContent = isKo() ? "최고" : "Best";
      var name = document.createElement("p");
      name.className = "oxm-stats-highlight__name";
      name.textContent = stats.best.title;
      var rate = document.createElement("p");
      rate.className = "oxm-stats-highlight__rate";
      rate.textContent =
        Math.round((stats.best.rate || 0) * 100) +
        "% · O " +
        stats.best.oCount;
      bestBody.appendChild(kicker);
      bestBody.appendChild(name);
      bestBody.appendChild(rate);
      best.appendChild(bestBody);
      els.statsBody.appendChild(best);
    }
  }

  function canEditOx() {
    return (
      state.syncStatus === "ready" &&
      state.sync &&
      Number.isFinite(state.sync.revision) &&
      state.sync.revision >= 1
    );
  }

  /** Flutter month-cell cycle: empty→o, o→x, x→o (never clear). */
  function nextCycleMark(current) {
    if (current === "o") return "x";
    if (current === "x") return "o";
    return "o";
  }

  function refreshView() {
    var email = state.user && state.user.email ? state.user.email : null;
    var payload = currentPayload();
    var monthVm = buildOxMonthViewModel(payload, {
      email: email,
      now: state.visibleMonth,
    });
    var checkVm = buildOxMonthViewModel(payload, {
      email: email,
      now: state.checkDay || new Date(),
    });
    renderHome(monthVm, checkVm);
  }

  function makeOxButton(letter, mark, habitTitle, enabled) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "oxm-ox oxm-ox--" +
      letter.toLowerCase() +
      (mark === letter.toLowerCase() ? " is-on" : "");
    btn.textContent = letter;
    btn.setAttribute(
      "aria-label",
      letter === "O"
        ? isKo()
          ? habitTitle + " O 표시"
          : "Mark " + habitTitle + " as O"
        : isKo()
          ? habitTitle + " X 표시"
          : "Mark " + habitTitle + " as X",
    );
    btn.setAttribute(
      "aria-pressed",
      mark === letter.toLowerCase() ? "true" : "false",
    );
    btn.disabled = !enabled;
    btn.dataset.habitTitle = habitTitle;
    btn.dataset.pick = letter.toLowerCase();
    return btn;
  }

  function makeHabitIconActions(habitTitle, month, enabled) {
    var wrap = document.createElement("div");
    wrap.className = "oxm-manage-card__actions";

    var editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "oxm-icon-action";
    editBtn.textContent = "✎";
    editBtn.title = habitsCopy("data-edit-label", isKo() ? "수정" : "Edit");
    editBtn.setAttribute("aria-label", editBtn.title);
    editBtn.dataset.habitAction = "rename";
    editBtn.dataset.habitTitle = habitTitle;
    editBtn.dataset.habitMonth = month;
    editBtn.disabled = !enabled;

    var delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "oxm-icon-action oxm-icon-action--danger";
    delBtn.textContent = "⌫";
    delBtn.title = habitsCopy("data-delete-label", isKo() ? "삭제" : "Delete");
    delBtn.setAttribute("aria-label", delBtn.title);
    delBtn.dataset.habitAction = "delete";
    delBtn.dataset.habitTitle = habitTitle;
    delBtn.dataset.habitMonth = month;
    delBtn.disabled = !enabled;

    wrap.appendChild(editBtn);
    wrap.appendChild(delBtn);
    return wrap;
  }

  function makeDayPartSegment(habitTitle, part, month, enabled) {
    var wrap = document.createElement("div");
    wrap.className = "oxm-segment";
    wrap.setAttribute("role", "group");
    [0, 1, 2].forEach(function (p) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "oxm-segment__btn" + (part === p ? " is-on" : "");
      btn.textContent = partLabel(p);
      btn.disabled = !enabled;
      btn.dataset.habitPartSet = habitTitle;
      btn.dataset.part = String(p);
      btn.dataset.habitMonth = month;
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function renderManageList(monthVm) {
    if (!els.manageList) return;
    var editable = canEditOx() && !state.oxSaving && !state.habitSaving;
    var month = monthVm.month;
    els.manageList.innerHTML = "";
    var titles = monthVm.habitTitles || [];
    if (!titles.length) {
      var empty = document.createElement("p");
      empty.className = "oxm-muted";
      empty.textContent = isKo()
        ? "이 달에 표시할 습관이 없습니다."
        : "No habits for this month.";
      els.manageList.appendChild(empty);
      return;
    }
    titles.forEach(function (h) {
      var li = document.createElement("li");
      li.className = "oxm-manage-card";
      var top = document.createElement("div");
      top.className = "oxm-manage-card__top";
      var name = document.createElement("p");
      name.className = "oxm-manage-card__name";
      name.textContent = h.title;
      top.appendChild(name);
      top.appendChild(makeHabitIconActions(h.title, month, editable));
      li.appendChild(top);
      li.appendChild(makeDayPartSegment(h.title, h.part, month, editable));
      els.manageList.appendChild(li);
    });
  }

  function renderHome(monthVm, checkVm) {
    checkVm = checkVm || monthVm;
    var calendarTodayKey = dayKey(new Date());
    var checkDayKey = checkVm.today || calendarTodayKey;
    if (els.todayLabel) {
      els.todayLabel.textContent = formatToday(state.checkDay || new Date());
    }
    if (els.monthLabel) {
      els.monthLabel.textContent = formatMonthName(state.visibleMonth);
    }
    if (els.todayDayNext) {
      els.todayDayNext.disabled = checkDayKey >= calendarTodayKey;
    }

    var editable = canEditOx() && !state.oxSaving && !state.habitSaving;
    var canMarkCheckDay = editable && checkDayKey <= calendarTodayKey;
    if (els.habitAddInput) els.habitAddInput.disabled = !editable;
    if (els.habitAddBtn) els.habitAddBtn.disabled = !editable;
    if (els.habitPart) els.habitPart.disabled = !editable;

    renderManageList(monthVm);

    if (els.habitList) {
      els.habitList.innerHTML = "";
      if (!checkVm.hasTitles) {
        var empty = document.createElement("p");
        empty.className = "oxm-muted";
        empty.textContent = isKo()
          ? "이 달에 표시할 습관이 없습니다."
          : "No habits for this month.";
        els.habitList.appendChild(empty);
      } else {
        checkVm.habitsToday.forEach(function (h) {
          var li = document.createElement("li");
          li.className = "oxm-habit-row";
          var meta = document.createElement("div");
          meta.className = "oxm-habit-row__meta";
          var chip = document.createElement("span");
          chip.className = "oxm-part-chip oxm-part-chip--static";
          chip.textContent = partLabel(h.part);
          var name = document.createElement("p");
          name.className = "oxm-habit-name";
          name.textContent = h.title;
          meta.appendChild(chip);
          meta.appendChild(name);
          var pair = document.createElement("div");
          pair.className = "oxm-ox-pair";
          pair.appendChild(
            makeOxButton("O", h.mark, h.title, canMarkCheckDay),
          );
          pair.appendChild(
            makeOxButton("X", h.mark, h.title, canMarkCheckDay),
          );
          li.appendChild(meta);
          li.appendChild(pair);
          els.habitList.appendChild(li);
        });
      }
    }

    if (els.monthGrid) {
      els.monthGrid.innerHTML = "";
      var thead = document.createElement("thead");
      var headRow = document.createElement("tr");
      monthVm.monthDays.forEach(function (day) {
        var th = document.createElement("th");
        th.textContent = String(day.day);
        if (day.dateKey === calendarTodayKey) th.className = "is-today";
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      els.monthGrid.appendChild(thead);

      var tbody = document.createElement("tbody");
      var titles = monthVm.habitTitles || [];
      if (!titles.length) {
        var emptyRow = document.createElement("tr");
        var emptyTd = document.createElement("td");
        emptyTd.colSpan = Math.max(1, monthVm.monthDays.length);
        emptyTd.className = "oxm-muted";
        emptyTd.textContent = isKo()
          ? "이 달에 표시할 습관이 없습니다."
          : "No habits for this month.";
        emptyRow.appendChild(emptyTd);
        tbody.appendChild(emptyRow);
      } else {
        titles.forEach(function (h) {
          var tr = document.createElement("tr");
          monthVm.monthDays.forEach(function (day) {
            var td = document.createElement("td");
            var mark = markForHabitTitle(day.marks, h.title);
            var canOpen = day.dateKey <= calendarTodayKey;
            if (day.dateKey === calendarTodayKey) td.classList.add("is-today");
            if (day.dateKey > calendarTodayKey) td.classList.add("is-future");
            if (mark === "o") {
              td.textContent = "O";
              td.classList.add("mark-o");
            } else if (mark === "x") {
              td.textContent = "X";
              td.classList.add("mark-x");
            } else {
              td.textContent = "";
            }
            td.dataset.dateKey = day.dateKey;
            if (canOpen) {
              td.classList.add("oxm-cell--editable");
              td.setAttribute("role", "button");
              td.tabIndex = 0;
            } else {
              td.classList.add("oxm-cell--disabled");
            }
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
      }
      els.monthGrid.appendChild(tbody);

      var scroll = els.monthGrid.parentElement;
      if (scroll && monthVm.monthDays.length) {
        var todayIdx = monthVm.monthDays.findIndex(function (d) {
          return d.dateKey === calendarTodayKey;
        });
        if (todayIdx >= 0) {
          var cell = 40;
          var target = (todayIdx + 1) * cell - scroll.clientWidth;
          scroll.scrollLeft = Math.max(0, target);
        }
      }
    }
  }

  function buildHabitPrefsApplyLocal(op) {
    return function (payload) {
      var mutated = applyHabitListMutation(payload, op);
      var patch = {};
      patch[mutated.titlesKey] = mutated.payload[mutated.titlesKey];
      if (mutated.checkChanged) {
        patch[mutated.checkKey] = mutated.payload[mutated.checkKey];
      }
      return { payload: mutated.payload, patch: patch };
    };
  }

  async function saveHabitMutation(op) {
    if (!canEditOx() || !state.user || state.habitSaving || state.oxSaving) {
      return false;
    }

    // Validate Flutter titles key shape early (throws on bad YYYY-MM).
    try {
      habitTitlesPrefsKey(op.email, op.month);
    } catch {
      setSyncBanner(
        isKo() ? "습관을 변경할 수 없습니다." : "Unable to change habit.",
        true,
      );
      return false;
    }

    var rollbackSync = cloneSync(state.sync);

    try {
      var optimistic = applyHabitListMutation(currentPayload(), op);
      state.sync = {
        ok: true,
        appId: (state.sync && state.sync.appId) || "ox_month",
        revision: state.sync.revision,
        schemaVersion: state.sync.schemaVersion || 1,
        updatedAt: state.sync.updatedAt,
        payload: optimistic.payload,
      };
    } catch (err) {
      var msg =
        err && typeof err.message === "string" ? err.message : "bad_request";
      if (msg === "duplicate_habit_title") {
        setSyncBanner(
          isKo() ? "같은 이름의 습관이 이미 있습니다." : "That habit already exists.",
          true,
        );
        return false;
      }
      if (msg === "invalid_habit_title") {
        setSyncBanner(
          isKo() ? "습관 이름을 입력해 주세요." : "Enter a habit name.",
          true,
        );
        return false;
      }
      setSyncBanner(
        isKo() ? "습관을 변경할 수 없습니다." : "Unable to change habit.",
        true,
      );
      return false;
    }

    state.habitSaving = true;
    refreshView();

    try {
      var result = await savePrefsPatchWithConflictRetry({
        client: syncClient,
        getIdToken: function () {
          return state.user.getIdToken();
        },
        syncState: rollbackSync,
        applyLocal: buildHabitPrefsApplyLocal(op),
      });

      if (result.ok) {
        applySyncResult(result.sync);
        setSyncBanner("", false);
        return true;
      }

      if (result.error === "unauthorized") {
        await safeLogout();
        return false;
      }

      if (result.error === "duplicate_habit_title") {
        if (rollbackSync) state.sync = rollbackSync;
        setSyncBanner(
          isKo() ? "같은 이름의 습관이 이미 있습니다." : "That habit already exists.",
          true,
        );
        return false;
      }

      if (result.error === "forbidden") {
        if (result.sync && result.sync.payload) {
          applySyncResult(result.sync);
        } else if (rollbackSync) {
          state.sync = rollbackSync;
        }
        setSyncBanner(
          isKo() ? "저장할 수 없습니다." : "Unable to save.",
          true,
        );
        return false;
      }

      if (result.error === "not_found") {
        if (rollbackSync) state.sync = rollbackSync;
        setSyncBanner(
          isKo()
            ? "동기화 기록이 없어 저장할 수 없습니다."
            : "No sync record yet — cannot save.",
          true,
        );
        return false;
      }

      if (result.error === "conflict_retry_exhausted") {
        applySyncResult(result.sync);
        setSyncBanner(
          isKo()
            ? "다른 기기와 충돌했습니다. 다시 시도해 주세요."
            : "Conflict with another device. Please try again.",
          true,
        );
        return false;
      }

      if (rollbackSync) state.sync = rollbackSync;
      setSyncBanner(
        isKo()
          ? "저장에 실패했습니다. 다시 시도해 주세요."
          : "Save failed. Please try again.",
        true,
      );
      return false;
    } catch {
      if (rollbackSync) state.sync = rollbackSync;
      setSyncBanner(
        isKo()
          ? "저장에 실패했습니다. 다시 시도해 주세요."
          : "Save failed. Please try again.",
        true,
      );
      return false;
    } finally {
      state.habitSaving = false;
      refreshView();
    }
  }

  async function handleAddHabit(rawTitle) {
    var title = `${rawTitle ?? ""}`.trim();
    if (!title) {
      setSyncBanner(
        isKo() ? "습관 이름을 입력해 주세요." : "Enter a habit name.",
        true,
      );
      return;
    }
    var partEl = els.habitPart;
    var part = partEl ? Number(partEl.value) : 0;
    if (![0, 1, 2].includes(part)) part = 0;
    var ok = await saveHabitMutation({
      email: state.user.email || "",
      month: monthKey(state.visibleMonth),
      action: "add",
      title: title,
      part: part,
    });
    if (ok && els.habitAddInput) els.habitAddInput.value = "";
  }

  function handleRenameHabit(oldTitle, month) {
    if (!canEditOx() || !state.user) return;
    var input = document.createElement("input");
    input.className = "oxm-sheet__input";
    input.type = "text";
    input.maxLength = 80;
    input.value = oldTitle;
    input.autocomplete = "off";
    openSheet({
      title: habitsCopy(
        "data-rename-title",
        isKo() ? "습관 이름 수정" : "Rename habit",
      ),
      bodyNode: input,
      actions: [
        {
          label: habitsCopy("data-cancel-label", isKo() ? "취소" : "Cancel"),
          onClick: closeSheet,
        },
        {
          label: habitsCopy("data-save-label", isKo() ? "저장" : "Save"),
          primary: true,
          onClick: async function () {
            var next = `${input.value || ""}`.trim();
            if (!next || next === oldTitle) {
              closeSheet();
              return;
            }
            closeSheet();
            await saveHabitMutation({
              email: state.user.email || "",
              month: month || monthKey(state.visibleMonth),
              action: "rename",
              title: oldTitle,
              newTitle: next,
            });
          },
        },
      ],
    });
    setTimeout(function () {
      input.focus();
      input.select();
    }, 30);
  }

  function handleDeleteHabit(title, month) {
    if (!canEditOx() || !state.user) return;
    var msg = document.createElement("p");
    msg.className = "oxm-sheet__msg";
    var confirmTpl = habitsCopy(
      "data-delete-confirm",
      isKo() ? "이 습관을 삭제할까요?" : "Delete this habit?",
    );
    msg.textContent = '"' + title + '" — ' + confirmTpl;
    openSheet({
      title: habitsCopy(
        "data-delete-title",
        isKo() ? "습관 삭제" : "Delete habit",
      ),
      bodyNode: msg,
      actions: [
        {
          label: habitsCopy("data-cancel-label", isKo() ? "취소" : "Cancel"),
          onClick: closeSheet,
        },
        {
          label: habitsCopy("data-delete-label", isKo() ? "삭제" : "Delete"),
          danger: true,
          onClick: async function () {
            closeSheet();
            await saveHabitMutation({
              email: state.user.email || "",
              month: month || monthKey(state.visibleMonth),
              action: "delete",
              title: title,
            });
          },
        },
      ],
    });
  }

  async function handleOxPick(habitTitle, pick) {
    await handleOxPickForDate(
      habitTitle,
      pick,
      dayKey(state.checkDay || new Date()),
    );
  }

  async function handleOxPickForDate(habitTitle, pick, dateKey) {
    if (!canEditOx() || !state.user || state.oxSaving || state.habitSaving) {
      return;
    }
    if (!state.sync) {
      setSyncBanner(
        isKo()
          ? "아직 동기화 기록이 없어 저장할 수 없습니다."
          : "No sync record yet — cannot save.",
        true,
      );
      return;
    }

    var todayKey = dayKey(new Date());
    if (!dateKey || dateKey > todayKey) return;

    var email = state.user.email || "";
    var payload = currentPayload();
    var checkKey = habitCheckPrefsKey(email);
    var vm = buildOxMonthViewModel(payload, {
      email: email,
      now: new Date(dateKey + "T12:00:00"),
    });
    var dayMarks =
      (vm.checkRoot && vm.checkRoot[dateKey]) ||
      (vm.monthDays.find(function (d) {
        return d.dateKey === dateKey;
      }) || { marks: {} }).marks;
    var current = markForHabitTitle(dayMarks, habitTitle);
    var next = nextMarkFromPick(current, pick);
    if (current === next) return;

    var intention = {
      dateKey: dateKey,
      habitTitle: habitTitle,
      mark: next,
    };

    var rollbackSync = cloneSync(state.sync);
    var optimistic = buildPatchedHabitCheckJson(
      currentPayload()[checkKey],
      intention,
    );
    state.sync = {
      ok: true,
      appId: (state.sync && state.sync.appId) || "ox_month",
      revision: state.sync.revision,
      schemaVersion: state.sync.schemaVersion || 1,
      updatedAt: state.sync.updatedAt,
      payload: Object.assign({}, state.sync.payload, {
        [checkKey]: optimistic.json,
      }),
    };

    state.oxSaving = true;
    refreshView();

    try {
      var result = await saveOxIntentionWithConflictRetry({
        client: syncClient,
        getIdToken: function () {
          return state.user.getIdToken();
        },
        syncState: rollbackSync,
        email: email,
        intention: intention,
        onConflictGiveUp: function () {
          setSyncBanner(
            isKo()
              ? "다른 기기와 충돌했습니다. 다시 선택해 주세요."
              : "Conflict with another device. Please choose again.",
            true,
          );
        },
      });

      if (result.ok) {
        applySyncResult(result.sync);
        setSyncBanner("", false);
        return;
      }

      if (result.error === "unauthorized") {
        await safeLogout();
        return;
      }

      if (result.error === "forbidden") {
        if (result.sync && result.sync.payload) {
          applySyncResult(result.sync);
        } else if (rollbackSync) {
          state.sync = rollbackSync;
        }
        setSyncBanner(
          isKo() ? "저장할 수 없습니다." : "Unable to save.",
          true,
        );
        return;
      }

      if (result.error === "not_found") {
        if (rollbackSync) state.sync = rollbackSync;
        setSyncBanner(
          isKo()
            ? "아직 동기화 기록이 없어 저장할 수 없습니다."
            : "No sync record yet — cannot save.",
          true,
        );
        return;
      }

      if (result.error === "conflict_retry_exhausted") {
        applySyncResult(result.sync);
        return;
      }

      if (rollbackSync) state.sync = rollbackSync;
      setSyncBanner(
        isKo()
          ? "저장에 실패했습니다. 다시 시도해 주세요."
          : "Save failed. Please try again.",
        true,
      );
    } catch {
      if (rollbackSync) state.sync = rollbackSync;
      setSyncBanner(
        isKo()
          ? "저장에 실패했습니다. 다시 시도해 주세요."
          : "Save failed. Please try again.",
        true,
      );
    } finally {
      state.oxSaving = false;
      refreshView();
    }
  }

  async function loadSync(user) {
    state.syncStatus = "loading";
    setSyncBanner(isKo() ? "동기화 불러오는 중…" : "Loading sync…", false);

    try {
      var token = await user.getIdToken();
      var result = await syncClient.getOxMonthSync(token);
      assertNoClientIdentityInUrl(result.sentUrl);

      if (result.status === 401) {
        // Auth session is valid; Sync API rejected the ID token (server/Admin config).
        // Do not silent-logout — that looks like “login failed”.
        state.syncStatus = "unauthorized";
        if (els.errorMsg) {
          els.errorMsg.textContent = isKo()
            ? "로그인은 됐지만 동기화 서버가 인증 토큰을 거부했습니다. 서버 Firebase Admin(newon-oxmonth) 설정을 확인해 주세요."
            : "Signed in, but the sync server rejected the auth token. Check Firebase Admin (newon-oxmonth) on the API.";
        }
        showView("error");
        return;
      }
      if (result.status === 403) {
        state.syncStatus = "forbidden";
        setSyncBanner(
          isKo() ? "접근이 제한되었습니다." : "Access denied.",
          true,
        );
        state.visibleMonth = new Date();
        refreshView();
        showView("app");
        return;
      }
      if (result.status === 404) {
        // Never auto-PUT on GET 404 — preserve path for mobile→UID migration.
        showNotSyncedState();
        return;
      }
      if (result.status >= 500 || result.status < 200) {
        state.syncStatus = "error";
        if (els.errorMsg) {
          els.errorMsg.textContent = isKo()
            ? "동기화 서버 오류가 발생했습니다."
            : "Sync server error.";
        }
        showView("error");
        return;
      }

      var parsed = parseSyncGetResponse(result.body);
      if (!parsed.ok) {
        state.syncStatus = "error";
        if (els.errorMsg) {
          els.errorMsg.textContent = isKo()
            ? "동기화 응답을 해석할 수 없습니다."
            : "Could not parse sync response.";
        }
        showView("error");
        return;
      }

      applySyncResult(parsed);
      state.visibleMonth = new Date();
      setSyncBanner("", false);
      refreshView();
      showView("app");
    } catch {
      state.syncStatus = "error";
      if (els.errorMsg) {
        var offline =
          typeof navigator !== "undefined" && navigator.onLine === false;
        els.errorMsg.textContent = offline
          ? isKo()
            ? "오프라인 상태입니다. 연결 후 다시 시도해 주세요."
            : "You are offline. Reconnect and try again."
          : isKo()
            ? "네트워크 오류로 동기화를 불러오지 못했습니다."
            : "Network error while loading sync.";
      }
      showView("error");
    }
  }

  async function safeLogout() {
    try {
      if (auth) await signOut(auth);
    } catch {
      /* ignore */
    }
    state.user = null;
    state.sync = null;
    state.oxSaving = false;
    state.habitSaving = false;
    state.syncStatus = "idle";
    setEmptySyncVisible(false);
    showView("signedOut");
  }

  function bindAuthForm() {
    if (els.loginForm) {
      els.loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (state.busy || !auth) {
          if (!auth) {
            setAuthError(
              isKo()
                ? "인증 모듈이 아직 준비되지 않았습니다."
                : "Auth is not ready yet.",
            );
          }
          return;
        }
        var fields = readAuthFields();
        if (!fields) return;
        state.busy = true;
        setAuthError("");
        if (els.loginBtn) els.loginBtn.disabled = true;
        try {
          await signInWithEmailAndPassword(auth, fields.email, fields.password);
        } catch (err) {
          setAuthError(mapAuthError(err));
        } finally {
          state.busy = false;
          if (els.loginBtn) els.loginBtn.disabled = false;
        }
      });
    }

    if (els.signupBtn) {
      els.signupBtn.addEventListener("click", async function () {
        if (state.busy || !auth) {
          if (!auth) {
            setAuthError(
              isKo()
                ? "인증 모듈이 아직 준비되지 않았습니다."
                : "Auth is not ready yet.",
            );
          }
          return;
        }
        var fields = readAuthFields();
        if (!fields) return;
        state.busy = true;
        setAuthError("");
        try {
          await createUserWithEmailAndPassword(
            auth,
            fields.email,
            fields.password,
          );
        } catch (err) {
          setAuthError(mapAuthError(err));
        } finally {
          state.busy = false;
        }
      });
    }

    if (els.logoutBtn) {
      els.logoutBtn.addEventListener("click", function () {
        openSettings();
      });
    }

    if (els.settingsBack) {
      els.settingsBack.addEventListener("click", function () {
        showView("app");
      });
    }
    if (els.settingsTheme) {
      els.settingsTheme.addEventListener("click", toggleTheme);
    }
    if (els.settingsStats) {
      els.settingsStats.addEventListener("click", function () {
        renderStatsPanel();
        showView("stats");
      });
    }
    if (els.settingsLogout) {
      els.settingsLogout.addEventListener("click", function () {
        safeLogout();
      });
    }
    if (els.statsBack) {
      els.statsBack.addEventListener("click", function () {
        showView("settings");
      });
    }
    if (els.goalSave) {
      els.goalSave.addEventListener("click", async function () {
        if (!canEditOx() || !state.user) return;
        var n = Number(els.goalInput && els.goalInput.value);
        if (!Number.isFinite(n)) return;
        n = Math.max(30, Math.min(100, Math.round(n)));
        var email = state.user.email || "";
        var key = goalsPrefsKey(email);
        var gKey = goalsStorageMonthKey(state.visibleMonth);
        await savePrefsPatchWithConflictRetry({
          client: syncClient,
          getIdToken: function () {
            return state.user.getIdToken();
          },
          syncState: cloneSync(state.sync),
          applyLocal: function (payload) {
            var map = parseGoalsMap(payload[key]);
            map[gKey] = n;
            var next = Object.assign({}, payload, {
              [key]: serializeGoalsMap(map),
            });
            return { payload: next, patch: { [key]: next[key] } };
          },
        }).then(function (result) {
          if (result.ok && result.sync) {
            applySyncResult(result.sync);
            setSyncBanner(
              isKo() ? "월 목표를 저장했습니다." : "Month goal saved.",
              false,
            );
            renderAccentPickers();
          } else {
            setSyncBanner(
              isKo() ? "월 목표 저장에 실패했습니다." : "Could not save goal.",
              true,
            );
          }
        });
      });
    }
    function onAccentClick(e) {
      var btn = e.target && e.target.closest && e.target.closest("button[data-accent-id]");
      if (!btn || !canEditOx() || !state.user) return;
      var id = btn.getAttribute("data-accent-id");
      var which = btn.getAttribute("data-which");
      var patchKey = which === "x" ? ACCENT_X_KEY : ACCENT_O_KEY;
      savePrefsPatchWithConflictRetry({
        client: syncClient,
        getIdToken: function () {
          return state.user.getIdToken();
        },
        syncState: cloneSync(state.sync),
        applyLocal: function (payload) {
          var next = Object.assign({}, payload, { [patchKey]: id });
          return { payload: next, patch: { [patchKey]: id } };
        },
      }).then(function (result) {
        if (result.ok && result.sync) {
          applySyncResult(result.sync);
          renderAccentPickers();
          refreshView();
        }
      });
    }
    if (els.accentO) els.accentO.addEventListener("click", onAccentClick);
    if (els.accentX) els.accentX.addEventListener("click", onAccentClick);

    if (els.errorRetry) {
      els.errorRetry.addEventListener("click", function () {
        if (state.user) loadSync(state.user);
        else showView("signedOut");
      });
    }

    if (els.emptySyncCreate) {
      els.emptySyncCreate.addEventListener("click", function () {
        handleExplicitCreateEmptySync();
      });
    }

    if (els.themeBtn) {
      els.themeBtn.addEventListener("click", toggleTheme);
    }
  }

  function bindAppControls() {
    if (els.habitsBtn) {
      els.habitsBtn.addEventListener("click", function () {
        openHabits(true);
      });
    }
    if (els.habitsBack) {
      els.habitsBack.addEventListener("click", function () {
        closeSheet();
        showView("app");
      });
    }
    if (els.sheetDismiss) {
      els.sheetDismiss.addEventListener("click", closeSheet);
    }

    if (els.monthPrev) {
      els.monthPrev.addEventListener("click", function () {
        state.visibleMonth = new Date(
          state.visibleMonth.getFullYear(),
          state.visibleMonth.getMonth() - 1,
          1,
        );
        refreshView();
      });
    }
    if (els.monthNext) {
      els.monthNext.addEventListener("click", function () {
        state.visibleMonth = new Date(
          state.visibleMonth.getFullYear(),
          state.visibleMonth.getMonth() + 1,
          1,
        );
        refreshView();
      });
    }

    if (els.habitAddForm) {
      els.habitAddForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var value = els.habitAddInput ? els.habitAddInput.value : "";
        handleAddHabit(value);
      });
    }

    if (els.manageList) {
      els.manageList.addEventListener("click", function (e) {
        var t = e.target;
        if (!t || !t.closest) return;

        var partBtn = t.closest("button[data-habit-part-set]");
        if (partBtn && !partBtn.disabled) {
          var pTitle = partBtn.getAttribute("data-habit-part-set") || "";
          var nextPart = Number(partBtn.getAttribute("data-part") || 0);
          var pMonth =
            partBtn.dataset.habitMonth || monthKey(state.visibleMonth);
          if (pTitle && [0, 1, 2].includes(nextPart)) {
            saveHabitMutation({
              email: state.user.email || "",
              month: pMonth,
              action: "setPart",
              title: pTitle,
              part: nextPart,
            });
          }
          return;
        }

        var actionBtn = t.closest("button[data-habit-action]");
        if (actionBtn && !actionBtn.disabled) {
          var action = actionBtn.dataset.habitAction || "";
          var actionTitle = actionBtn.dataset.habitTitle || "";
          var actionMonth = actionBtn.dataset.habitMonth || "";
          if (!actionTitle) return;
          if (action === "rename") handleRenameHabit(actionTitle, actionMonth);
          else if (action === "delete") handleDeleteHabit(actionTitle, actionMonth);
        }
      });
    }

    if (els.habitList) {
      els.habitList.addEventListener("click", function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var btn = t.closest("button.oxm-ox");
        if (!btn || btn.disabled) return;
        var title = btn.dataset.habitTitle || "";
        var pick = btn.dataset.pick || "";
        if (!title || (pick !== "o" && pick !== "x")) return;
        handleOxPick(title, pick);
      });
    }

    if (els.todayCta) {
      els.todayCta.addEventListener("click", function () {
        openTodayCheck(new Date(), false);
      });
    }
    if (els.todayBack) {
      els.todayBack.addEventListener("click", function () {
        showView("app");
      });
    }
    if (els.todayDayPrev) {
      els.todayDayPrev.addEventListener("click", function () {
        shiftCheckDay(-1);
      });
    }
    if (els.todayDayNext) {
      els.todayDayNext.addEventListener("click", function () {
        shiftCheckDay(1);
      });
    }
    if (els.goalInput) {
      els.goalInput.addEventListener("input", syncGoalPctLabel);
    }

    if (els.monthGrid) {
      els.monthGrid.addEventListener("click", function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var cell = t.closest("td[data-date-key]");
        if (!cell || !cell.classList.contains("oxm-cell--editable")) return;
        var dateKey = cell.dataset.dateKey || "";
        if (!dateKey) return;
        openTodayCheck(dateKey, false);
      });

      els.monthGrid.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var t = e.target;
        if (!t || !t.closest) return;
        var cell = t.closest("td[data-date-key]");
        if (!cell || !cell.classList.contains("oxm-cell--editable")) return;
        e.preventDefault();
        cell.click();
      });
    }

    if (typeof window !== "undefined") {
      window.addEventListener("offline", function () {
        if (state.syncStatus !== "ready") return;
        setSyncBanner(
          isKo()
            ? "오프라인입니다. 연결이 복구되면 다시 저장할 수 있습니다."
            : "You are offline. Saves will work again when reconnected.",
          true,
        );
      });
      window.addEventListener("online", function () {
        if (state.syncStatus === "ready") setSyncBanner("", false);
      });
    }
  }

  function applyTheme(mode, opts) {
    var next = mode === "light" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ox_month_web_theme", next);
    } catch {
      /* ignore */
    }
    if (opts && opts.persistSync && canEditOx() && state.user) {
      savePrefsPatchWithConflictRetry({
        client: syncClient,
        getIdToken: function () {
          return state.user.getIdToken();
        },
        syncState: cloneSync(state.sync),
        applyLocal: function (payload) {
          var patch = { ox_month_appearance_mode_v1: next };
          return {
            payload: Object.assign({}, payload, patch),
            patch: patch,
          };
        },
      }).then(function (result) {
        if (result.ok && result.sync) applySyncResult(result.sync);
      });
    }
  }

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next, { persistSync: true });
    syncThemeMeta();
  }

  function startMock() {
    showView("loading");
    var email = "demo@example.com";
    var fakeUser = {
      email: email,
      getIdToken: async function () {
        return "mock-token";
      },
    };

    var now = new Date();
    var mk = monthKey(now);
    var today = dayKey(now);
    var titlesKey = "ox_month_habit_titles_" + email + "_" + mk;
    var checkKey = "ox_month_habit_check_" + email + "_v2";
    var goalsKey = "ox_month_goals_map_v1_" + email;
    var gKey = now.getFullYear() + "_" + (now.getMonth() + 1);
    var seedPayload = {};
    seedPayload[titlesKey] = JSON.stringify([
      { t: "Walk", p: 0 },
      { t: "Read", p: 2 },
      { t: "Stretch", p: 1 },
    ]);
    seedPayload[checkKey] = JSON.stringify({
      [today]: { Walk: "o", Read: "x" },
    });
    seedPayload[goalsKey] = JSON.stringify({
      [gKey]: 70,
    });
    seedPayload.ox_month_appearance_mode_v1 = "dark";

    var store = {
      exists: true,
      revision: 1,
      payload: seedPayload,
    };

    window.__OX_MONTH_SYNC_FETCH__ =
      window.__OX_MONTH_SYNC_FETCH__ ||
      (async function (url, init) {
        var method = ((init && init.method) || "GET").toUpperCase();

        if (method === "GET") {
          if (!store.exists) {
            return {
              status: 404,
              json: async function () {
                return { error: "not_found" };
              },
            };
          }
          return {
            status: 200,
            json: async function () {
              return {
                appId: "ox_month",
                revision: store.revision,
                schemaVersion: 1,
                updatedAt: new Date().toISOString(),
                payload: Object.assign({}, store.payload),
              };
            },
          };
        }

        if (method === "PUT") {
          var putBody = JSON.parse((init && init.body) || "{}");
          if (putBody.baseRevision === 0 && !store.exists) {
            store.exists = true;
            store.revision = 1;
            store.payload = Object.assign({}, putBody.payload || {});
            return {
              status: 200,
              json: async function () {
                return {
                  ok: true,
                  revision: store.revision,
                  schemaVersion: 1,
                  updatedAt: new Date().toISOString(),
                };
              },
            };
          }
          if (store.exists && putBody.baseRevision !== store.revision) {
            return {
              status: 409,
              json: async function () {
                return {
                  error: "revision_conflict",
                  currentRevision: store.revision,
                };
              },
            };
          }
          if (store.exists) {
            store.payload = Object.assign({}, putBody.payload || {});
            store.revision += 1;
            return {
              status: 200,
              json: async function () {
                return {
                  ok: true,
                  revision: store.revision,
                  schemaVersion: 1,
                  updatedAt: new Date().toISOString(),
                };
              },
            };
          }
          return {
            status: 409,
            json: async function () {
              return { error: "revision_conflict", currentRevision: 0 };
            },
          };
        }

        if (method === "PATCH") {
          if (!store.exists) {
            return {
              status: 404,
              json: async function () {
                return { error: "not_found" };
              },
            };
          }
          var body = JSON.parse((init && init.body) || "{}");
          if (body.baseRevision !== store.revision) {
            return {
              status: 409,
              json: async function () {
                return {
                  error: "revision_conflict",
                  currentRevision: store.revision,
                };
              },
            };
          }
          var patch = body.patch || {};
          Object.keys(patch).forEach(function (k) {
            if (patch[k] == null) delete store.payload[k];
            else store.payload[k] = patch[k];
          });
          store.revision += 1;
          return {
            status: 200,
            json: async function () {
              return {
                ok: true,
                revision: store.revision,
                updatedAt: new Date().toISOString(),
                appliedCount: Object.keys(patch).length,
              };
            },
          };
        }

        return {
          status: 405,
          json: async function () {
            return { error: "method_not_allowed" };
          },
        };
      });

    syncClient = createSyncClient({
      baseUrl: "https://api.newon.app",
      fetchImpl: async function (url, init) {
        assertNoClientIdentityInUrl(url);
        var headers = (init && init.headers) || {};
        if (
          !headers.Authorization ||
          !String(headers.Authorization).startsWith("Bearer ")
        ) {
          return {
            status: 401,
            json: async function () {
              return { error: "unauthorized" };
            },
          };
        }
        return window.__OX_MONTH_SYNC_FETCH__(url, init);
      },
    });

    state.user = fakeUser;
    loadSync(fakeUser);
  }

  function startFirebase() {
    var cfg = window.OX_MONTH_FIREBASE;
    var ready =
      typeof window.OX_MONTH_FIREBASE_IS_CONFIGURED === "function" &&
      window.OX_MONTH_FIREBASE_IS_CONFIGURED();

    if (!ready) {
      showView("config");
      return;
    }

    var app = initializeApp(cfg);
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(function () {
      /* ignore */
    });

    onAuthStateChanged(auth, function (user) {
      state.user = user;
      if (!user) {
        state.sync = null;
        state.syncStatus = "idle";
        showView("signedOut");
        return;
      }
      showView("loading");
      loadSync(user);
    });
  }

  try {
    var saved = localStorage.getItem("ox_month_web_theme");
    if (saved === "light" || saved === "dark") {
      root.setAttribute("data-theme", saved);
    }
  } catch {
    /* ignore */
  }

  bindAuthForm();
  bindAppControls();

  if (mockMode) {
    startMock();
  } else {
    showView("loading");
    startFirebase();
  }
})();
