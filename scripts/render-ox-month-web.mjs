/**
 * Generate /{lang}/apps/ox-month/index.html for all locales.
 * Shared assets live under /apps/ox-month/.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { LANGS, OG_LOCALE, SITE_ORIGIN } from "./hub-utils.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSET_V = "20260907oxmw7";

const COPY = {
  ko: {
    title: "OX MONTH | 웹",
    description: "OX MONTH 웹 — 같은 계정으로 습관을 확인합니다.",
    brandMark: "O/X",
    brandTitle: "OX MONTH",
    loading: "불러오는 중…",
    configTitle: "Firebase Web 설정 필요",
    configBody:
      "newon-oxmonth Web 앱의 apiKey / appId가 아직 없습니다. Firebase Console에서 Web 앱을 등록한 뒤 apps/ox-month/firebase-config.js를 채워 주세요.",
    signIn: "로그인",
    signUp: "회원가입",
    noAccount: "계정이 없나요? ",
    email: "이메일",
    emailHint: "you@example.com",
    password: "비밀번호",
    passwordHint: "비밀번호",
    logout: "로그아웃",
    theme: "테마",
    todayHabits: "오늘",
    todayCheck: "오늘 체크하기",
    partMorning: "아침",
    partLunch: "점심",
    partEvening: "저녁",
    readOnly: "읽기 전용",
    retry: "다시 시도",
    syncError: "동기화 오류",
    settings: "설정",
    addHabit: "습관 추가",
    addHabitPlaceholder: "새 습관 이름",
    editHabit: "수정",
    deleteHabit: "삭제",
    emptySyncTitle: "아직 동기화된 데이터가 없습니다",
    emptySyncBody:
      "모바일 OX MONTH에서 같은 계정으로 데이터를 연결한 뒤 다시 열어 주세요. 웹에서 빈 문서를 자동으로 만들지 않습니다.",
    emptySyncCreate: "웹에서 새로 시작 (모바일 데이터 없음)",
  },
  en: {
    title: "OX MONTH | Web",
    description: "OX MONTH on the web — view habits with the same account.",
    brandMark: "O/X",
    brandTitle: "OX MONTH",
    loading: "Loading…",
    configTitle: "Firebase Web config required",
    configBody:
      "Web apiKey / appId for newon-oxmonth are missing. Register a Web app in Firebase Console, then fill apps/ox-month/firebase-config.js.",
    signIn: "Log in",
    signUp: "Create account",
    noAccount: "New here? ",
    email: "Email",
    emailHint: "you@example.com",
    password: "Password",
    passwordHint: "Password",
    logout: "Log out",
    theme: "Theme",
    todayHabits: "Today",
    todayCheck: "Today check",
    partMorning: "Morning",
    partLunch: "Lunch",
    partEvening: "Evening",
    readOnly: "Read-only",
    retry: "Retry",
    syncError: "Sync error",
    settings: "Settings",
    addHabit: "Add habit",
    addHabitPlaceholder: "New habit name",
    editHabit: "Edit",
    deleteHabit: "Delete",
    emptySyncTitle: "No synced data yet",
    emptySyncBody:
      "Link this account from the OX MONTH mobile app, then reopen. The web app will not create an empty document automatically.",
    emptySyncCreate: "Start fresh on web (no mobile data)",
  },
};

function copyFor(langDir) {
  return COPY[langDir] || COPY.en;
}

function hreflangs() {
  return LANGS.map(
    (l) =>
      `    <link rel="alternate" hreflang="${l.hreflang}" href="${SITE_ORIGIN}/${l.dir}/apps/ox-month/" />`,
  ).join("\n");
}

function pageHtml(lang) {
  const c = copyFor(lang.dir);
  const og = OG_LOCALE[lang.dir] || "en_US";
  const canonical = `${SITE_ORIGIN}/${lang.dir}/apps/ox-month/`;
  return `<!DOCTYPE html>
<html lang="${lang.htmlLang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${c.title}</title>
    <meta name="description" content="${c.description}" />
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:locale" content="${og}" />
    <meta property="og:title" content="${c.title}" />
    <meta property="og:description" content="${c.description}" />
    <meta property="og:site_name" content="Newon" />
    <meta property="og:image" content="${SITE_ORIGIN}/ox-month-logo.png" />
${hreflangs()}
    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/apps/ox-month/" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="/ox-month-logo.png" />
    <link rel="apple-touch-icon" href="/ox-month-logo.png" />
    <link rel="stylesheet" href="/apps/ox-month/ox-month-web.css?v=${ASSET_V}" />
    <script src="/apps/ox-month/firebase-config.js?v=${ASSET_V}"></script>
  </head>
  <body class="oxm-body">
    <div id="oxm-app" class="oxm-app" data-theme="dark">
      <div class="oxm-phone">
        <section id="oxm-view-loading" class="oxm-view oxm-view--fill oxm-center" hidden>
          <div class="oxm-spinner" aria-hidden="true"></div>
          <p class="oxm-muted">${c.loading}</p>
        </section>

        <section id="oxm-view-config" class="oxm-view oxm-view--fill oxm-config" hidden>
          <h2>${c.configTitle}</h2>
          <p class="oxm-muted">${c.configBody}</p>
        </section>

        <section id="oxm-view-signed-out" class="oxm-view oxm-view--fill" hidden>
          <div class="oxm-auth">
            <div class="oxm-logo">
              <p class="oxm-logo-mark">${c.brandMark}</p>
              <p class="oxm-logo-title">${c.brandTitle}</p>
            </div>
            <form id="oxm-login-form" class="oxm-auth-form">
              <div class="oxm-field">
                <label for="oxm-email">${c.email}</label>
                <input id="oxm-email" name="email" type="email" autocomplete="username" required placeholder="${c.emailHint}" />
              </div>
              <div class="oxm-field">
                <label for="oxm-password">${c.password}</label>
                <input id="oxm-password" name="password" type="password" autocomplete="current-password" required minlength="6" placeholder="${c.passwordHint}" />
              </div>
              <p id="oxm-auth-error" class="oxm-error" hidden></p>
              <button type="submit" class="oxm-btn-filled" id="oxm-login-btn">${c.signIn}</button>
              <p class="oxm-auth-links">
                <span class="oxm-auth-hint">${c.noAccount}</span><button type="button" id="oxm-signup-btn">${c.signUp}</button>
              </p>
              <div class="oxm-auth-theme">
                <button type="button" class="oxm-text-btn" id="oxm-theme-btn">${c.theme}</button>
              </div>
            </form>
          </div>
        </section>

        <section id="oxm-view-error" class="oxm-view oxm-view--fill oxm-error-panel" hidden>
          <h2>${c.syncError}</h2>
          <p id="oxm-error-msg" class="oxm-muted"></p>
          <button type="button" class="oxm-btn-filled oxm-btn-filled--mt" id="oxm-error-retry">${c.retry}</button>
        </section>

        <section id="oxm-view-app" class="oxm-view oxm-view--fill" hidden
          data-part-morning="${c.partMorning}"
          data-part-lunch="${c.partLunch}"
          data-part-evening="${c.partEvening}">
          <header class="oxm-home-bar">
            <button type="button" class="oxm-icon-btn" id="oxm-logout-btn" title="${c.logout}" aria-label="${c.logout}">⚙</button>
            <h1 class="oxm-home-bar__title">${c.brandTitle}</h1>
            <button type="button" class="oxm-icon-btn" id="oxm-theme-btn-home" title="${c.theme}" aria-label="${c.theme}">◐</button>
          </header>
          <hr class="oxm-divider" />
          <div id="oxm-sync-banner" class="oxm-banner" hidden></div>
          <div id="oxm-empty-sync" class="oxm-empty-sync" hidden>
            <h2 class="oxm-empty-sync__title">${c.emptySyncTitle}</h2>
            <p id="oxm-empty-sync-msg" class="oxm-muted">${c.emptySyncBody}</p>
            <button type="button" class="oxm-btn-outline oxm-btn-filled--mt" id="oxm-empty-sync-create">${c.emptySyncCreate}</button>
          </div>
          <div class="oxm-home-body">
            <div class="oxm-home-middle">
              <div class="oxm-month-nav">
                <button type="button" class="oxm-icon-btn" id="oxm-month-prev" aria-label="prev">‹</button>
                <h2 class="oxm-month-nav__label" id="oxm-month-label"></h2>
                <button type="button" class="oxm-icon-btn" id="oxm-month-next" aria-label="next">›</button>
              </div>
              <div class="oxm-grid-scroll">
                <table class="oxm-habit-table" id="oxm-month-grid" aria-label="${c.brandTitle}"></table>
              </div>
            </div>
            <div class="oxm-today-block">
              <p class="oxm-today-block__label" id="oxm-today-label">${c.todayHabits}</p>
              <form id="oxm-habit-add-form" class="oxm-habit-add">
                <input id="oxm-habit-add-input" type="text" maxlength="80" autocomplete="off" placeholder="${c.addHabitPlaceholder}" />
                <button type="submit" class="oxm-btn-filled oxm-btn-filled--small" id="oxm-habit-add-btn">${c.addHabit}</button>
              </form>
              <ul class="oxm-habit-list" id="oxm-habit-list"
                data-edit-label="${c.editHabit}"
                data-delete-label="${c.deleteHabit}"></ul>
            </div>
            <div class="oxm-home-footer">
              <button type="button" class="oxm-btn-outline" id="oxm-today-cta" disabled>${c.todayCheck}</button>
            </div>
          </div>
        </section>
      </div>
    </div>
    <script type="module" src="/apps/ox-month/ox-month-web-app.js?v=${ASSET_V}"></script>
  </body>
</html>
`;
}

export function renderOxMonthWeb() {
  for (const lang of LANGS) {
    const dir = path.join(ROOT, lang.dir, "apps", "ox-month");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), pageHtml(lang), "utf8");
  }

  const rootApp = path.join(ROOT, "apps", "ox-month");
  fs.mkdirSync(rootApp, { recursive: true });
  fs.writeFileSync(
    path.join(rootApp, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OX MONTH Web</title>
    <meta http-equiv="refresh" content="0;url=/en/apps/ox-month/" />
    <script src="/lang-nav.js"></script>
    <script>
      (function () {
        try {
          var pref = localStorage.getItem("newon-lang-dir");
          var langs = ["ko","en","ja","es","pt-br","fr","de","hi","id"];
          var dir = langs.indexOf(pref) >= 0 ? pref : "en";
          location.replace("/" + dir + "/apps/ox-month/");
        } catch (e) {
          location.replace("/en/apps/ox-month/");
        }
      })();
    </script>
  </head>
  <body></body>
</html>
`,
    "utf8",
  );

  console.log("render-ox-month-web: wrote", LANGS.length, "locale pages + root redirect");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  renderOxMonthWeb();
}
