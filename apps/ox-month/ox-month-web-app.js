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
      error: document.getElementById("oxm-view-error"),
    },
    loginForm: document.getElementById("oxm-login-form"),
    email: document.getElementById("oxm-email"),
    password: document.getElementById("oxm-password"),
    authError: document.getElementById("oxm-auth-error"),
    loginBtn: document.getElementById("oxm-login-btn"),
    signupBtn: document.getElementById("oxm-signup-btn"),
    logoutBtn: document.getElementById("oxm-logout-btn"),
    themeBtn: document.getElementById("oxm-theme-btn"),
    themeBtnHome: document.getElementById("oxm-theme-btn-home"),
    todayLabel: document.getElementById("oxm-today-label"),
    habitAddForm: document.getElementById("oxm-habit-add-form"),
    habitAddInput: document.getElementById("oxm-habit-add-input"),
    habitAddBtn: document.getElementById("oxm-habit-add-btn"),
    habitList: document.getElementById("oxm-habit-list"),
    monthLabel: document.getElementById("oxm-month-label"),
    monthGrid: document.getElementById("oxm-month-grid"),
    monthPrev: document.getElementById("oxm-month-prev"),
    monthNext: document.getElementById("oxm-month-next"),
    appView: document.getElementById("oxm-view-app"),
    syncBanner: document.getElementById("oxm-sync-banner"),
    emptySync: document.getElementById("oxm-empty-sync"),
    emptySyncMsg: document.getElementById("oxm-empty-sync-msg"),
    emptySyncCreate: document.getElementById("oxm-empty-sync-create"),
    errorMsg: document.getElementById("oxm-error-msg"),
    errorRetry: document.getElementById("oxm-error-retry"),
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
    var app = els.appView;
    if (!app) return "";
    if (part === 0) return app.getAttribute("data-part-morning") || "Morning";
    if (part === 1) return app.getAttribute("data-part-lunch") || "Lunch";
    return app.getAttribute("data-part-evening") || "Evening";
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
    var todayVm = buildOxMonthViewModel(payload, {
      email: email,
      now: new Date(),
    });
    renderHome(monthVm, todayVm);
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

  function makeHabitActionButtons(habitTitle, month, enabled) {
    var wrap = document.createElement("div");
    wrap.className = "oxm-habit-actions";

    var editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "oxm-text-btn oxm-habit-edit";
    editBtn.textContent = editLabel();
    editBtn.dataset.habitAction = "rename";
    editBtn.dataset.habitTitle = habitTitle;
    editBtn.dataset.habitMonth = month;
    editBtn.disabled = !enabled;

    var delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "oxm-text-btn oxm-habit-delete";
    delBtn.textContent = deleteLabel();
    delBtn.dataset.habitAction = "delete";
    delBtn.dataset.habitTitle = habitTitle;
    delBtn.dataset.habitMonth = month;
    delBtn.disabled = !enabled;

    wrap.appendChild(editBtn);
    wrap.appendChild(delBtn);
    return wrap;
  }

  function renderHome(monthVm, todayVm) {
    todayVm = todayVm || monthVm;
    var todayKey = todayVm.today || dayKey(new Date());
    if (els.todayLabel) {
      els.todayLabel.textContent = formatToday(new Date());
    }
    if (els.monthLabel) {
      els.monthLabel.textContent = formatMonthName(state.visibleMonth);
    }

    var editable = canEditOx() && !state.oxSaving && !state.habitSaving;
    if (els.habitAddInput) els.habitAddInput.disabled = !editable;
    if (els.habitAddBtn) els.habitAddBtn.disabled = !editable;

    if (els.habitList) {
      els.habitList.innerHTML = "";
      if (!todayVm.hasTitles) {
        var empty = document.createElement("p");
        empty.className = "oxm-muted";
        empty.textContent = isKo()
          ? "이 달에 표시할 습관이 없습니다."
          : "No habits for this month.";
        els.habitList.appendChild(empty);
      } else {
        todayVm.habitsToday.forEach(function (h) {
          var li = document.createElement("li");
          li.className = "oxm-habit-row";
          var meta = document.createElement("div");
          meta.className = "oxm-habit-row__meta";
          var chip = document.createElement("span");
          chip.className = "oxm-part-chip";
          chip.textContent = partLabel(h.part);
          var name = document.createElement("p");
          name.className = "oxm-habit-name";
          name.textContent = h.title;
          meta.appendChild(chip);
          meta.appendChild(name);
          meta.appendChild(
            makeHabitActionButtons(h.title, todayVm.month, editable),
          );
          var pair = document.createElement("div");
          pair.className = "oxm-ox-pair";
          pair.appendChild(makeOxButton("O", h.mark, h.title, editable));
          pair.appendChild(makeOxButton("X", h.mark, h.title, editable));
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
      var corner = document.createElement("th");
      corner.className = "oxm-habit-col";
      corner.textContent = isKo() ? "습관" : "";
      headRow.appendChild(corner);
      monthVm.monthDays.forEach(function (day) {
        var th = document.createElement("th");
        th.textContent = String(day.day);
        if (day.dateKey === todayKey) th.className = "is-today";
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      els.monthGrid.appendChild(thead);

      var tbody = document.createElement("tbody");
      var titles = monthVm.habitTitles || [];
      if (!titles.length) {
        var emptyRow = document.createElement("tr");
        var emptyTd = document.createElement("td");
        emptyTd.colSpan = monthVm.monthDays.length + 1;
        emptyTd.className = "oxm-muted";
        emptyTd.textContent = isKo()
          ? "이 달에 표시할 습관이 없습니다."
          : "No habits for this month.";
        emptyRow.appendChild(emptyTd);
        tbody.appendChild(emptyRow);
      } else {
        titles.forEach(function (h) {
          var tr = document.createElement("tr");
          var nameTd = document.createElement("td");
          nameTd.className = "oxm-habit-col";
          var nameWrap = document.createElement("div");
          nameWrap.className = "oxm-habit-col__inner";
          var nameEl = document.createElement("span");
          nameEl.className = "oxm-habit-name";
          nameEl.textContent = h.title;
          nameWrap.appendChild(nameEl);
          nameWrap.appendChild(
            makeHabitActionButtons(h.title, monthVm.month, editable),
          );
          nameTd.appendChild(nameWrap);
          tr.appendChild(nameTd);

          monthVm.monthDays.forEach(function (day) {
            var td = document.createElement("td");
            var mark = markForHabitTitle(day.marks, h.title);
            var canEditDay = editable && day.dateKey <= todayKey;
            if (day.dateKey === todayKey) td.classList.add("is-today");
            if (day.dateKey > todayKey) td.classList.add("is-future");
            if (mark === "o") {
              td.textContent = "O";
              td.classList.add("mark-o");
            } else if (mark === "x") {
              td.textContent = "X";
              td.classList.add("mark-x");
            } else {
              td.textContent = "";
            }
            td.dataset.habitTitle = h.title;
            td.dataset.dateKey = day.dateKey;
            td.dataset.mark = mark || "";
            if (canEditDay) {
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
          return d.dateKey === todayKey;
        });
        if (todayIdx >= 0) {
          var cell = 40;
          var target = (todayIdx + 2) * cell - scroll.clientWidth;
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
    // Add form lives under "오늘": always write this calendar month's titles.
    var ok = await saveHabitMutation({
      email: state.user.email || "",
      month: monthKey(new Date()),
      action: "add",
      title: title,
      part: 2,
    });
    if (ok && els.habitAddInput) els.habitAddInput.value = "";
  }

  async function handleRenameHabit(oldTitle, month) {
    if (!canEditOx() || !state.user) return;
    var promptMsg = isKo() ? "새 습관 이름" : "New habit name";
    var next = window.prompt(promptMsg, oldTitle);
    if (next == null) return;
    next = `${next}`.trim();
    if (!next || next === oldTitle) return;
    await saveHabitMutation({
      email: state.user.email || "",
      month: month || monthKey(state.visibleMonth),
      action: "rename",
      title: oldTitle,
      newTitle: next,
    });
  }

  async function handleDeleteHabit(title, month) {
    if (!canEditOx() || !state.user) return;
    var ok = window.confirm(
      isKo()
        ? '"' + title + '" 습관을 삭제할까요?'
        : 'Delete habit "' + title + '"?',
    );
    if (!ok) return;
    await saveHabitMutation({
      email: state.user.email || "",
      month: month || monthKey(state.visibleMonth),
      action: "delete",
      title: title,
    });
  }

  async function handleOxPick(habitTitle, pick) {
    await handleOxPickForDate(habitTitle, pick, dayKey(new Date()));
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
        safeLogout();
      });
    }

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
    if (els.themeBtnHome) {
      els.themeBtnHome.addEventListener("click", toggleTheme);
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

    if (els.habitList) {
      els.habitList.addEventListener("click", function (e) {
        var t = e.target;
        if (!t || !t.closest) return;

        var actionBtn = t.closest("button[data-habit-action]");
        if (actionBtn && !actionBtn.disabled) {
          var action = actionBtn.dataset.habitAction || "";
          var actionTitle = actionBtn.dataset.habitTitle || "";
          var actionMonth = actionBtn.dataset.habitMonth || "";
          if (!actionTitle) return;
          if (action === "rename") handleRenameHabit(actionTitle, actionMonth);
          else if (action === "delete") handleDeleteHabit(actionTitle, actionMonth);
          return;
        }

        var btn = t.closest("button.oxm-ox");
        if (!btn || btn.disabled) return;
        var title = btn.dataset.habitTitle || "";
        var pick = btn.dataset.pick || "";
        if (!title || (pick !== "o" && pick !== "x")) return;
        handleOxPick(title, pick);
      });
    }

    if (els.monthGrid) {
      els.monthGrid.addEventListener("click", function (e) {
        var t = e.target;
        if (!t || !t.closest) return;

        var actionBtn = t.closest("button[data-habit-action]");
        if (actionBtn && !actionBtn.disabled) {
          var action = actionBtn.dataset.habitAction || "";
          var actionTitle = actionBtn.dataset.habitTitle || "";
          var actionMonth = actionBtn.dataset.habitMonth || "";
          if (!actionTitle) return;
          if (action === "rename") handleRenameHabit(actionTitle, actionMonth);
          else if (action === "delete") handleDeleteHabit(actionTitle, actionMonth);
          return;
        }

        var cell = t.closest("td[data-date-key]");
        if (!cell || !cell.classList.contains("oxm-cell--editable")) return;
        var habitTitle = cell.dataset.habitTitle || "";
        var dateKey = cell.dataset.dateKey || "";
        if (!habitTitle || !dateKey) return;
        var current = cell.dataset.mark || null;
        if (current !== "o" && current !== "x") current = null;
        var next = nextCycleMark(current);
        handleOxPickForDate(habitTitle, next, dateKey);
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

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ox_month_web_theme", next);
    } catch {
      /* ignore */
    }
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

    // Empty store: GET 404 stays not_synced until explicit create PUT.
    var store = {
      exists: false,
      revision: 0,
      payload: {},
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
