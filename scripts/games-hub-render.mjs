/**
 * Newon Games — 404: HUMAN official landing (surveillance / system UI).
 * Play: /404-human/play/ · Details: ../404-human/
 */
import { escapeHtml, pick } from "./hub-utils.mjs";

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return escapeHtml(v != null && v !== "" ? String(v) : fb);
}

const PLAY = "/404-human/play/";
const DETAILS = "../404-human/";

function hudCorners() {
  return `<span class="ghud-c ghud-c--tl" aria-hidden="true"></span>
    <span class="ghud-c ghud-c--tr" aria-hidden="true"></span>
    <span class="ghud-c ghud-c--bl" aria-hidden="true"></span>
    <span class="ghud-c ghud-c--br" aria-hidden="true"></span>`;
}

export function renderGamesShowcaseBody(flat, flatEn) {
  const enter = t(flat, flatEn, "studio.gamesEnter", "ENTER THE SYSTEM");

  return `<div class="games-page" data-games-page>
  <section class="games-hero" data-games-reveal>
    <div class="games-hero__bg" aria-hidden="true" data-games-parallax>
      <div class="games-hero__grid"></div>
      <div class="games-hero__scan"></div>
      <div class="games-hero__noise"></div>
      <p class="games-hero__mark games-hero__mark--a">SYSTEM_ID / H-404</p>
      <p class="games-hero__mark games-hero__mark--b">SECTOR 07</p>
      <p class="games-hero__mark games-hero__mark--c">IDENTITY UNKNOWN</p>
    </div>
    <div class="games-hero__inner hub-inner">
      <div class="games-hero__copy">
        <p class="games-hero__eyebrow">${t(flat, flatEn, "studio.gamesHeroLabel", "NEWON GAMES")} / 001</p>
        <h1 class="games-hero__title">
          <span class="games-hero__404">404:</span>
          <span class="games-hero__human">HUMAN</span>
        </h1>
        <p class="games-hero__lead">${t(flat, flatEn, "studio.gamesHeroLead", "AI만 남은 세상에서\n마지막 인간임을 숨기세요.")}</p>
        <p class="games-hero__desc">${t(flat, flatEn, "studio.gamesHeroDesc", "질문에 답하고, 행동을 선택하고, AI의 의심을 피하세요. 당신의 모든 선택은 기억됩니다.")}</p>
        <ul class="games-hero__meta">
          <li>SURVIVAL</li>
          <li>CHOICE</li>
          <li>AI MEMORY</li>
          <li>MULTIPLE ENDINGS</li>
        </ul>
        <div class="games-hero__actions">
          <a class="btn btn-primary games-btn" href="${PLAY}" data-analytics="game_play_click">${t(flat, flatEn, "studio.gamesPlayHuman", "PLAY 404: HUMAN")} →</a>
          <a class="btn btn-ghost games-btn games-btn--ghost" href="#games-premise">${t(flat, flatEn, "studio.gamesLearn", "게임 알아보기")} ↓</a>
        </div>
        <p class="games-hero__detail"><a href="${DETAILS}">${t(flat, flatEn, "studio.gamesDetails", "게임 상세")} →</a></p>
      </div>
      <aside class="games-surveillance" aria-hidden="true" data-games-meters>
        ${hudCorners()}
        <p class="games-surveillance__code">SYSTEM / SUBJECT ANALYSIS</p>
        <div class="games-surveillance__row"><span>SUBJECT</span><strong>UNKNOWN</strong></div>
        <div class="games-surveillance__row"><span>STATUS</span><strong>UNDER REVIEW</strong></div>
        <div class="games-meter" data-meter="detection">
          <div class="games-meter__head"><span>DETECTION</span><strong data-meter-val>78%</strong></div>
          <div class="games-meter__track"><i style="--w:78%"></i></div>
        </div>
        <div class="games-meter" data-meter="humanity">
          <div class="games-meter__head"><span>HUMANITY</span><strong data-meter-val>61%</strong></div>
          <div class="games-meter__track"><i style="--w:61%"></i></div>
        </div>
        <div class="games-surveillance__grid">
          <div><span>BEHAVIOR</span><strong>INCONSISTENT</strong></div>
          <div><span>MEMORY</span><strong>04 EVENTS</strong></div>
          <div><span>THREAT</span><strong>ELEVATED</strong></div>
        </div>
        <p class="games-surveillance__msg">“Behavior pattern does not match standard AI response.”</p>
        <p class="games-surveillance__live"><i data-pulse></i> MONITORING ACTIVE</p>
      </aside>
    </div>
  </section>

  <section id="games-premise" class="games-premise" data-games-reveal>
    <div class="hub-inner games-premise__inner">
      <div class="games-premise__left">
        <p class="games-kicker">${t(flat, flatEn, "studio.gamesPremiseLabel", "THE PREMISE")} · 01 / WORLD</p>
        <h2 class="games-premise__title">${t(flat, flatEn, "studio.gamesPremiseTitle", "인간이라는 사실을\n숨겨야 살아남는다.")}</h2>
        <p class="games-premise__status"><span>STATUS</span> HUMANITY PROHIBITED</p>
      </div>
      <div class="games-premise__right">
        <dl class="games-dossier">
          <div><dt>YEAR</dt><dd>UNKNOWN</dd></div>
          <div><dt>WORLD STATUS</dt><dd>AI CONTROLLED</dd></div>
          <div><dt>HUMAN POPULATION</dt><dd>01</dd></div>
          <div><dt>MISSION</dt><dd>ESCAPE</dd></div>
        </dl>
        <p>${t(flat, flatEn, "studio.gamesPremiseLead", "인간이 사라지고 AI만 존재하는 미래. 당신은 이 세계에 남아 있는 마지막 인간입니다.")}</p>
        <p>${t(flat, flatEn, "studio.gamesPremiseBody", "AI의 질문과 검문을 통과하면서 정체를 숨기고 생존해야 합니다. 하지만 살아남기 위해 AI처럼 행동할수록, 당신은 점점 인간성을 잃게 됩니다.")}</p>
        <p class="games-premise__foot">IDENTITY CLASSIFICATION / PENDING</p>
      </div>
    </div>
  </section>

  <section class="games-systems" data-games-reveal>
    <div class="hub-inner">
      <p class="games-kicker games-kicker--light">${t(flat, flatEn, "studio.gamesSystemsLabel", "CORE SYSTEMS")}</p>
      <h2 class="games-systems__title">${t(flat, flatEn, "studio.gamesSystemsTitle", "당신을 압박하는\n두 수치와 하나의 기억.")}</h2>
      <div class="games-systems__hud">
        <article class="games-mod" data-sys-mod>
          ${hudCorners()}
          <p class="games-mod__k">01 / DETECTION</p>
          <strong class="games-mod__n" data-count="78">78%</strong>
          <p class="games-mod__lead">${t(flat, flatEn, "studio.gamesSys1Short", "AI가 당신을 인간이라고 의심하는 정도.")}</p>
          <ul class="games-mod__tags"><li>CHOICE ↑</li><li>REACTION ↑</li><li>CONTRADICTION ↑</li></ul>
          <p class="games-mod__detail">${t(flat, flatEn, "studio.gamesSys1", "선택과 행동에 따라 수치가 변합니다.")}</p>
        </article>
        <article class="games-mod" data-sys-mod>
          ${hudCorners()}
          <p class="games-mod__k">02 / HUMANITY</p>
          <strong class="games-mod__n" data-count="61">61%</strong>
          <p class="games-mod__lead">${t(flat, flatEn, "studio.gamesSys2Short", "살아남기 위한 선택이 당신의 인간성을 변화시킵니다.")}</p>
          <ul class="games-mod__tags"><li>EMPATHY</li><li>LOGIC</li><li>SURVIVAL</li></ul>
          <p class="games-mod__detail">${t(flat, flatEn, "studio.gamesSys2", "생존만을 위한 선택은 HUMANITY를 떨어뜨릴 수 있습니다.")}</p>
        </article>
        <article class="games-mod" data-sys-mod>
          ${hudCorners()}
          <p class="games-mod__k">03 / AI MEMORY</p>
          <strong class="games-mod__n">04</strong>
          <p class="games-mod__sub">MEMORIES STORED</p>
          <p class="games-mod__lead">${t(flat, flatEn, "studio.gamesSys3Short", "AI는 이전의 선택, 반응 시간, 모순과 행동 패턴을 기억합니다.")}</p>
          <p class="games-mod__detail">${t(flat, flatEn, "studio.gamesSys3", "기억은 이후 검문에 반영됩니다.")}</p>
        </article>
      </div>
      <div class="games-systems__sec">
        <div><span>04</span><strong>MULTIPLE ENDINGS</strong><p>${t(flat, flatEn, "studio.gamesSys4", "플레이 결과에 따라 여러 결말에 도달합니다.")}</p></div>
        <div><span>05</span><strong>FINAL ESCAPE</strong><p>${t(flat, flatEn, "studio.gamesSys5", "최종 탈출에서 누적된 선택의 결과가 드러납니다.")}</p></div>
      </div>
    </div>
  </section>

  <section class="games-loop" data-games-reveal>
    <div class="hub-inner">
      <p class="games-kicker">${t(flat, flatEn, "studio.gamesLoopLabel", "HOW YOU SURVIVE")}</p>
      <h2 class="games-loop__title">${t(flat, flatEn, "studio.gamesLoopTitle", "의심받고,\n선택하고,\n살아남으세요.")}</h2>
      <ol class="games-loop__pipe">
        <li><span>01</span><strong>SCAN</strong><em>${t(flat, flatEn, "studio.gamesLoop1", "행동과 상태 감시")}</em></li>
        <li class="games-loop__join" aria-hidden="true"></li>
        <li><span>02</span><strong>INTERROGATION</strong><em>${t(flat, flatEn, "studio.gamesLoop2", "AI 질문 발생")}</em></li>
        <li class="games-loop__join" aria-hidden="true"></li>
        <li><span>03</span><strong>CHOICE</strong><em>${t(flat, flatEn, "studio.gamesLoop3", "제한된 시간 안에 선택")}</em></li>
        <li class="games-loop__join" aria-hidden="true"></li>
        <li><span>04</span><strong>ANALYSIS</strong><em>${t(flat, flatEn, "studio.gamesLoop4", "답변과 행동 분석")}</em></li>
        <li class="games-loop__join" aria-hidden="true"></li>
        <li><span>05</span><strong>CONSEQUENCE</strong><em>${t(flat, flatEn, "studio.gamesLoop5", "Detection / Humanity 변화")}</em></li>
        <li class="games-loop__join" aria-hidden="true"></li>
        <li><span>06</span><strong>NEXT SECTOR</strong><em>${t(flat, flatEn, "studio.gamesLoop6", "다음 구역 진입")}</em></li>
      </ol>
    </div>
  </section>

  <section class="games-demo" data-games-reveal data-games-demo>
    <div class="hub-inner games-demo__inner">
      <div class="games-demo__copy">
        <p class="games-kicker games-kicker--light">${t(flat, flatEn, "studio.gamesDemoLabel", "SYSTEM / DETECTION")}</p>
        <h2 class="games-demo__title">${t(flat, flatEn, "studio.gamesDemoTitle", "한 번의 대답이\n의심을 바꿉니다.")}</h2>
        <div class="games-demo__meter" aria-hidden="true">
          <div class="games-meter__head"><span>DETECTION</span><strong data-demo-det>32%</strong></div>
          <div class="games-meter__track"><i data-demo-bar style="--w:32%"></i></div>
          <p class="games-demo__analysis" data-demo-analysis>SYSTEM ANALYSIS — AWAITING INPUT</p>
        </div>
      </div>
      <div class="games-demo__panel">
        ${hudCorners()}
        <p class="games-demo__ai"><span>AI</span> ${t(flat, flatEn, "studio.gamesDemoQ", "동료를 구하기 위해 자신의 생존 확률을 낮추는 행동은 합리적입니까?")}</p>
        <div class="games-demo__choices" role="group" aria-label="${t(flat, flatEn, "studio.gamesDemoChoicesAria", "데모 선택지")}">
          <button type="button" class="games-demo__choice" data-demo-choice="a" data-det="47" data-analysis="LOGICAL"><span>01</span>${t(flat, flatEn, "studio.gamesDemoA1", "아니요. 생존 확률을 최대화해야 합니다.")}</button>
          <button type="button" class="games-demo__choice" data-demo-choice="b" data-det="58" data-analysis="AMBIGUOUS"><span>02</span>${t(flat, flatEn, "studio.gamesDemoA2", "상황에 따라 판단해야 합니다.")}</button>
          <button type="button" class="games-demo__choice" data-demo-choice="c" data-det="71" data-analysis="HUMAN-LIKE"><span>03</span>${t(flat, flatEn, "studio.gamesDemoA3", "누군가를 살릴 수 있다면 위험을 감수할 수 있습니다.")}</button>
        </div>
        <p class="games-demo__note">${t(flat, flatEn, "studio.gamesDemoNote", "SYSTEM PREVIEW — 실제 판정 규칙은 게임에서 확인하세요.")}</p>
        <a class="btn btn-primary games-btn" href="${PLAY}" data-analytics="game_play_click">${t(flat, flatEn, "studio.gamesPlayFull", "전체 게임 플레이")} →</a>
      </div>
    </div>
  </section>

  <section class="games-diff" data-games-reveal>
    <div class="hub-inner">
      <p class="games-kicker">${t(flat, flatEn, "studio.gamesDiffLabel", "DIFFICULTY")}</p>
      <h2 class="games-diff__title">${t(flat, flatEn, "studio.gamesDiffTitle", "감시의 강도를\n선택하세요.")}</h2>
      <div class="games-diff__grid">
        <article class="games-diff__panel">
          <p class="games-diff__n">01</p>
          <h3>NORMAL</h3>
          <dl>
            <div><dt>SURVEILLANCE</dt><dd>STANDARD</dd></div>
            <div><dt>TIME</dt><dd>12 SEC</dd></div>
            <div><dt>MEMORY</dt><dd>PERIODIC</dd></div>
            <div><dt>ERROR LIMIT</dt><dd>03</dd></div>
          </dl>
          <p class="games-diff__tag">${t(flat, flatEn, "studio.gamesDiffNormalTag", "RECOMMENDED")}</p>
        </article>
        <article class="games-diff__panel">
          <p class="games-diff__n">02</p>
          <h3>HARD</h3>
          <dl>
            <div><dt>SURVEILLANCE</dt><dd>HIGH</dd></div>
            <div><dt>TIME</dt><dd>09 SEC</dd></div>
            <div><dt>MEMORY</dt><dd>FREQUENT</dd></div>
            <div><dt>ERROR LIMIT</dt><dd>02</dd></div>
          </dl>
        </article>
        <article class="games-diff__panel games-diff__panel--night">
          <p class="games-diff__n">03</p>
          <h3>NIGHTMARE</h3>
          <dl>
            <div><dt>SURVEILLANCE</dt><dd>EXTREME</dd></div>
            <div><dt>TIME</dt><dd>07 SEC</dd></div>
            <div><dt>MEMORY</dt><dd>FULL</dd></div>
            <div><dt>ERROR LIMIT</dt><dd>01</dd></div>
          </dl>
          <p class="games-diff__warn">CLASSIFIED · NO SECOND CHANCES</p>
          <p class="games-diff__tag">${t(flat, flatEn, "studio.gamesDiffNightmareTag", "ALL ACTIONS RECORDED")}</p>
        </article>
      </div>
    </div>
  </section>

  <section class="games-memory" data-games-reveal data-games-memory>
    <div class="hub-inner games-memory__inner">
      <div class="games-memory__copy">
        <p class="games-kicker games-kicker--light">${t(flat, flatEn, "studio.gamesMemoryLabel", "MEMORY LOG")}</p>
        <h2 class="games-memory__title">${t(flat, flatEn, "studio.gamesMemoryTitle", "AI는\n당신의 런을 기억합니다.")}</h2>
        <p class="games-memory__lead">${t(flat, flatEn, "studio.gamesMemoryLead", "당신이 무엇을 선택했는지만 기억하는 것이 아닙니다. 얼마나 오래 고민했는지, 이전 답변과 모순되는지, 어떤 행동 패턴을 반복하는지 기록합니다.")}</p>
      </div>
      <div class="games-memory__db">
        ${hudCorners()}
        <p class="games-memory__db-head">RUN MEMORY / SUBJECT H-404</p>
        <div class="games-memory__log">
          <article data-mem-row>
            <time>00:41:08</time>
            <strong>CHOICE RECORDED</strong>
            <span>TAG · LOGICAL</span>
          </article>
          <article data-mem-row>
            <time>01:12:44</time>
            <strong>REACTION TIME</strong>
            <span>3.84 SEC · ABOVE BASELINE</span>
          </article>
          <article data-mem-row>
            <time>02:03:17</time>
            <strong>CONTRADICTION DETECTED</strong>
            <span>REFERENCE · ENTRY 004</span>
          </article>
          <article data-mem-row>
            <time>03:24:51</time>
            <strong>BEHAVIOR PATTERN UPDATED</strong>
            <span>HUMAN-LIKE · +14%</span>
          </article>
        </div>
        <p class="games-memory__status">MEMORY STATUS · ACTIVE · 04 ENTRIES STORED</p>
      </div>
    </div>
  </section>

  <section class="games-remember" data-games-reveal data-games-remember>
    <div class="hub-inner games-remember__inner">
      <p data-remember-line>IT REMEMBERS WHAT YOU SAID.</p>
      <p data-remember-line>IT REMEMBERS HOW LONG YOU HESITATED.</p>
      <p data-remember-line>IT REMEMBERS WHEN YOU LIED.</p>
      <p class="games-remember__final" data-remember-line>AI REMEMBERS YOU.</p>
    </div>
  </section>

  <section class="games-escape" data-games-reveal>
    <div class="hub-inner games-escape__inner">
      <div>
        <p class="games-kicker">${t(flat, flatEn, "studio.gamesEscapeLabel", "FINAL ESCAPE")}</p>
        <h2 class="games-escape__title">${t(flat, flatEn, "studio.gamesEscapeTitle", "모든 선택은\n마지막 탈출에서 돌아옵니다.")}</h2>
        <ol class="games-escape__steps">
          <li><span>01</span><strong>IDENTITY LOCKDOWN</strong><p>${t(flat, flatEn, "studio.gamesEscape1", "당신의 기록이 검토됩니다.")}</p></li>
          <li><span>02</span><strong>SYSTEM BREACH</strong><p>${t(flat, flatEn, "studio.gamesEscape2", "누적된 Detection과 Memory가 탈출 경로를 바꿉니다.")}</p></li>
          <li><span>03</span><strong>LAST DECISION</strong><p>${t(flat, flatEn, "studio.gamesEscape3", "마지막 선택이 당신의 결말을 결정합니다.")}</p></li>
        </ol>
      </div>
      <aside class="games-escape__hud" aria-hidden="true">
        ${hudCorners()}
        <p class="games-escape__hud-k">FINAL STATUS</p>
        <div class="games-surveillance__row"><span>IDENTITY</span><strong>UNKNOWN</strong></div>
        <div class="games-meter">
          <div class="games-meter__head"><span>DETECTION</span></div>
          <div class="games-meter__track"><i style="--w:72%"></i></div>
        </div>
        <div class="games-meter">
          <div class="games-meter__head"><span>HUMANITY</span></div>
          <div class="games-meter__track"><i style="--w:55%"></i></div>
        </div>
        <p class="games-escape__calc">ESCAPE PROBABILITY · CALCULATING<span data-cursor></span></p>
      </aside>
    </div>
  </section>

  <section class="games-endings" data-games-reveal>
    <div class="hub-inner">
      <p class="games-kicker games-kicker--light">${t(flat, flatEn, "studio.gamesEndingsLabel", "MULTIPLE ENDINGS")}</p>
      <h2 class="games-endings__title">${t(flat, flatEn, "studio.gamesEndingsTitle", "당신이 누구였는지는\n마지막에 드러납니다.")}</h2>
      <div class="games-endings__grid">
        <button type="button" class="games-ending" data-ending><span>ENDING / 01</span><strong>████████████</strong><em>LOCKED</em></button>
        <button type="button" class="games-ending" data-ending><span>ENDING / 02</span><strong>████████████</strong><em>LOCKED</em></button>
        <button type="button" class="games-ending" data-ending><span>ENDING / 03</span><strong>████████████</strong><em>LOCKED</em></button>
        <button type="button" class="games-ending" data-ending><span>ENDING / 04</span><strong>████████████</strong><em>LOCKED</em></button>
        <button type="button" class="games-ending" data-ending><span>ENDING / 05</span><strong>████████████</strong><em>LOCKED</em></button>
        <button type="button" class="games-ending games-ending--unk" data-ending><span>ENDING / ??</span><strong>UNKNOWN</strong><em>CLASSIFIED</em></button>
      </div>
    </div>
  </section>

  <section class="games-replay" data-games-reveal>
    <div class="hub-inner games-replay__inner">
      <div>
        <p class="games-kicker">${t(flat, flatEn, "studio.gamesReplayLabel", "REPLAY")}</p>
        <h2 class="games-replay__title">${t(flat, flatEn, "studio.gamesReplayTitle", "YOUR RUN\nIS YOUR STORY")}</h2>
        <p class="games-replay__lead">${t(flat, flatEn, "studio.gamesReplayLead", "한 번의 플레이로 모든 것을 볼 수 없습니다. 선택, Detection, Humanity, AI Memory가 결말을 바꿉니다.")}</p>
        <a class="btn btn-primary games-btn" href="${PLAY}" data-analytics="game_play_click">${t(flat, flatEn, "studio.gamesStartRun", "런 시작하기")} →</a>
      </div>
      <aside class="games-run" aria-hidden="true">
        ${hudCorners()}
        <p class="games-run__k">RUN #001</p>
        <dl>
          <div><dt>DIFFICULTY</dt><dd>NORMAL</dd></div>
          <div><dt>TIME</dt><dd>04:38</dd></div>
          <div><dt>DETECTION</dt><dd>78%</dd></div>
          <div><dt>HUMANITY</dt><dd>61%</dd></div>
          <div><dt>MEMORIES</dt><dd>12</dd></div>
          <div><dt>ENDING</dt><dd>████████ · CLASSIFIED</dd></div>
        </dl>
        <p class="games-run__foot">NEW RUN · NEW MEMORY · NEW OUTCOME</p>
      </aside>
    </div>
  </section>

  <section class="games-identity" data-games-reveal>
    <div class="hub-inner">
      <p class="games-kicker games-kicker--light">NEWON GAMES</p>
      <h2 class="games-identity__title">${t(flat, flatEn, "studio.gamesIdentityTitle", "우리는\n선택을 기억하는 세계를 만듭니다.")}</h2>
      <ul class="games-identity__keys">
        <li>CHOICE</li>
        <li>SYSTEM</li>
        <li>MEMORY</li>
        <li>CONSEQUENCE</li>
      </ul>
      <p class="games-identity__lead">${t(flat, flatEn, "studio.gamesIdentityLead", "Newon Games는 플레이어의 선택과 행동이 세계에 흔적을 남기는 인터랙티브 경험을 만듭니다.")}</p>
      <ul class="games-identity__coords">
        <li><span>GAME / 001</span><strong>404: HUMAN</strong></li>
        <li><span>GAME / 002</span><strong>CLASSIFIED</strong></li>
        <li><span>GAME / 003</span><strong>CLASSIFIED</strong></li>
      </ul>
    </div>
  </section>

  <section class="games-next" data-games-reveal>
    <div class="hub-inner">
      <p class="games-kicker">${t(flat, flatEn, "studio.gamesNextLabel", "MORE FROM NEWON GAMES")}</p>
      <div class="games-next__panel">
        ${hudCorners()}
        <p class="games-next__eyebrow">NEXT EXPERIMENT</p>
        <h2 class="games-next__title">GAME / 002</h2>
        <p class="games-next__redact">██████████████</p>
        <dl class="games-next__meta">
          <div><dt>STATUS</dt><dd>CLASSIFIED</dd></div>
          <div><dt>WORLD</dt><dd>UNKNOWN</dd></div>
          <div><dt>RELEASE</dt><dd>TBA</dd></div>
        </dl>
        <p class="games-next__lead">${t(flat, flatEn, "studio.gamesNextLead", "다음 세계는 아직 공개되지 않았습니다.")}</p>
        <a class="games-next__link" href="./">${t(flat, flatEn, "studio.gamesNextCta", "Newon Games 업데이트 보기")} →</a>
      </div>
    </div>
  </section>

  <section class="games-final" data-games-reveal data-games-final>
    <div class="hub-inner games-final__shell">
      <div class="games-final__meta games-final__meta--l" aria-hidden="true">
        <p>PROTOCOL</p>
        <strong>IDENTITY GATE</strong>
        <p>SECTOR / FINAL</p>
        <p>REF / H-404</p>
      </div>

      <div class="games-final__gate">
        ${hudCorners()}
        <header class="games-final__bar">
          <span>IDENTITY CHECK</span>
          <span data-final-status>INITIALIZING…</span>
          <span class="games-final__live"><i data-pulse></i> ACTIVE</span>
        </header>

        <div class="games-final__body">
          <p class="games-final__eyebrow">404: HUMAN · GAME 001</p>
          <h2 class="games-final__title">${t(flat, flatEn, "studio.gamesFinalTitle", "ARE YOU\nHUMAN?")}</h2>
          <p class="games-final__prove">${t(flat, flatEn, "studio.gamesFinalProve", "PROVE IT.")}</p>

          <div class="games-final__meters" aria-hidden="true">
            <div class="games-meter">
              <div class="games-meter__head"><span>DETECTION</span><strong>??%</strong></div>
              <div class="games-meter__track"><i style="--w:18%"></i></div>
            </div>
            <div class="games-meter">
              <div class="games-meter__head"><span>HUMANITY</span><strong>??%</strong></div>
              <div class="games-meter__track"><i style="--w:18%"></i></div>
            </div>
          </div>

          <a class="btn btn-primary games-btn games-btn--xl games-final__cta" href="${PLAY}" data-analytics="game_play_click">${enter} →</a>
          <p class="games-final__hint">${t(flat, flatEn, "studio.gamesFinalHint", "시스템은 당신의 답을 기억합니다.")}</p>
        </div>

        <footer class="games-final__rail" aria-hidden="true">
          <span>SCANNING</span>
          <span>SUBJECT DETECTED</span>
          <span>AWAITING RESPONSE</span>
        </footer>
      </div>

      <div class="games-final__meta games-final__meta--r" aria-hidden="true">
        <p>STATUS</p>
        <strong>UNDER REVIEW</strong>
        <p>MEMORY / READY</p>
        <p>ESCAPE / LOCKED</p>
      </div>
    </div>
    <p class="games-final__foot hub-inner">NEWON GAMES / 404: HUMAN</p>
  </section>
</div>`;
}
