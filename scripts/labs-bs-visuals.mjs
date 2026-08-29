/**
 * Labs experiment detail hero visuals — unique Studio-quality panel per keyword.
 */

function panelShell({ mod, live, meta, body }) {
  return `<div class="bs-visual bs-visual--studio bs-visual--lab bs-visual--${mod}" aria-hidden="true">
  <div class="bs-sv">
    <div class="bs-sv__head">
      <span class="bs-sv__live"><i></i> ${live}</span>
      <span class="bs-sv__meta">${meta}</span>
    </div>
    <div class="bs-sv__body">${body}</div>
  </div>
</div>`;
}

/** Review AI — review inbox → signal board → decision brief */
function visualReviewAi(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "review",
    live: "REVIEW SIGNAL BOARD",
    meta: "REVIEW AI",
    body: `
      <div class="bs-sv-lx-review">
        <aside class="bs-sv-lx-review__inbox">
          <p class="bs-sv__k">REVIEWS</p>
          <ul>
            <li class="is-on"><span>★★★★☆</span><strong>${ko ? "결제 흐름이 복잡해요" : "Checkout feels complex"}</strong></li>
            <li><span>★★★☆☆</span><strong>${ko ? "알림이 너무 많아요" : "Too many notifications"}</strong></li>
            <li><span>★★★★★</span><strong>${ko ? "속도는 빨라요" : "Speed is great"}</strong></li>
            <li><span>★★☆☆☆</span><strong>${ko ? "온보딩이 길어요" : "Onboarding is long"}</strong></li>
          </ul>
        </aside>
        <div class="bs-sv-lx-review__board">
          <p class="bs-sv__k">EXTRACTED SIGNALS</p>
          <div class="bs-sv-lx-review__signals">
            <article class="is-on"><span>01</span><strong>FRICTION</strong><em>${ko ? "결제 · 온보딩" : "Checkout · Onboard"}</em></article>
            <article><span>02</span><strong>REQUEST</strong><em>${ko ? "알림 제어" : "Notification control"}</em></article>
            <article><span>03</span><strong>PRAISE</strong><em>${ko ? "속도 · 안정" : "Speed · Stability"}</em></article>
          </div>
          <div class="bs-sv-lx-review__out">
            <span>DECISION BRIEF</span>
            <strong>${ko ? "다음 개선: 결제 단순화" : "Next: simplify checkout"}</strong>
          </div>
        </div>
      </div>`,
  });
}

/** Newon QR — QR mark + post-scan funnel */
function visualQr(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "qr",
    live: "QR TRACKING LOOP",
    meta: "NEWON QR",
    body: `
      <div class="bs-sv-lx-qr">
        <div class="bs-sv-lx-qr__mark">
          <div class="bs-sv-lx-qr__code" aria-hidden="true">
            <i class="c"></i><i></i><i></i>
            <i></i><i class="c"></i><i></i>
            <i></i><i></i><i class="c"></i>
          </div>
          <p class="bs-sv__k">DYNAMIC LINK</p>
          <strong>newon.app/q/…</strong>
        </div>
        <div class="bs-sv-lx-qr__funnel">
          <p class="bs-sv__k">AFTER SCAN</p>
          <ol>
            <li class="is-done"><span>01</span><strong>SCAN</strong><em>${ko ? "카메라 인식" : "Camera read"}</em></li>
            <li class="is-on"><span>02</span><strong>VISIT</strong><em>${ko ? "랜딩 진입" : "Landing hit"}</em></li>
            <li><span>03</span><strong>ACTION</strong><em>${ko ? "전환 이벤트" : "Convert event"}</em></li>
            <li><span>04</span><strong>DATA</strong><em>${ko ? "캠페인 리포트" : "Campaign report"}</em></li>
          </ol>
          <div class="bs-sv-lx-qr__bars">
            <div><span>Scan</span><i style="--w:92%"></i></div>
            <div class="is-on"><span>Visit</span><i style="--w:68%"></i></div>
            <div><span>Action</span><i style="--w:34%"></i></div>
          </div>
        </div>
      </div>`,
  });
}

/** Newon Form — form canvas + field kit + route */
function visualForm(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "form",
    live: "FORM BUILDER",
    meta: "NEWON FORM",
    body: `
      <div class="bs-sv-lx-form">
        <div class="bs-sv-lx-form__canvas">
          <p class="bs-sv__k">FORM CANVAS</p>
          <div class="bs-sv-lx-form__field is-on"><span>A</span><strong>${ko ? "이름" : "Name"}</strong><em>Short text</em></div>
          <div class="bs-sv-lx-form__field"><span>B</span><strong>Email</strong><em>Email</em></div>
          <div class="bs-sv-lx-form__field"><span>C</span><strong>${ko ? "문의 유형" : "Topic"}</strong><em>Select</em></div>
          <div class="bs-sv-lx-form__field is-lg"><span>D</span><strong>${ko ? "메시지" : "Message"}</strong><em>Long text</em></div>
          <span class="bs-sv-lx-form__cta">SUBMIT →</span>
        </div>
        <aside class="bs-sv-lx-form__side">
          <p class="bs-sv__k">FIELDS</p>
          <div class="bs-sv-lx-form__kit">
            <span class="is-on">Text</span><span>Email</span><span>Select</span><span>File</span>
          </div>
          <p class="bs-sv__k">ROUTE</p>
          <ul>
            <li class="is-on"><span>01</span>${ko ? "수집" : "Collect"}</li>
            <li class="is-on"><span>02</span>${ko ? "분류" : "Route"}</li>
            <li><span>03</span>${ko ? "알림" : "Notify"}</li>
          </ul>
        </aside>
      </div>`,
  });
}

/** AI Product Discovery — opportunity matrix */
function visualAiDisc(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "ai",
    live: "OPPORTUNITY MATRIX",
    meta: "AI DISCOVERY",
    body: `
      <div class="bs-sv-lx-ai">
        <div class="bs-sv-lx-ai__matrix">
          <p class="bs-sv__k">WHERE AI FITS</p>
          <div class="bs-sv-lx-ai__grid" aria-hidden="true">
            <span class="bs-sv-lx-ai__axis y">${ko ? "가치" : "Value"}</span>
            <span class="bs-sv-lx-ai__axis x">${ko ? "실현 난이도" : "Feasibility"}</span>
            <span class="bs-sv-lx-ai__dot" style="left:22%;top:28%">A</span>
            <span class="bs-sv-lx-ai__dot" style="left:58%;top:22%">B</span>
            <span class="bs-sv-lx-ai__dot is-you" style="left:42%;top:48%">YOU</span>
            <span class="bs-sv-lx-ai__dot" style="left:72%;top:62%">C</span>
            <span class="bs-sv-lx-ai__zone"></span>
          </div>
        </div>
        <aside class="bs-sv-lx-ai__side">
          <p class="bs-sv__k">PIPELINE</p>
          <ol>
            <li class="is-done"><span>01</span>Problem</li>
            <li class="is-on"><span>02</span>Signal</li>
            <li><span>03</span>AI Fit</li>
            <li><span>04</span>Prototype</li>
          </ol>
          <div class="bs-sv-lx-ai__verdict">
            <span>VERDICT</span>
            <strong>${ko ? "작게 프로토타입" : "Prototype small"}</strong>
          </div>
        </aside>
      </div>`,
  });
}

/** Game Experiment — play screen + choice loop */
function visualGame(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "game",
    live: "PLAY LOOP",
    meta: "GAME LAB",
    body: `
      <div class="bs-sv-lx-game">
        <div class="bs-sv-lx-game__screen">
          <div class="bs-sv-lx-game__hud">
            <span>STAGE 02</span>
            <span class="is-on">● LIVE</span>
          </div>
          <p class="bs-sv-lx-game__prompt">${ko ? "다음 선택은?" : "What next?"}</p>
          <div class="bs-sv-lx-game__choices">
            <button type="button" class="is-on">A · ${ko ? "기억한다" : "Remember"}</button>
            <button type="button">B · ${ko ? "무시한다" : "Ignore"}</button>
            <button type="button">C · ${ko ? "되돌린다" : "Undo"}</button>
          </div>
          <div class="bs-sv-lx-game__meter"><i style="--w:62%"></i></div>
        </div>
        <aside class="bs-sv-lx-game__side">
          <p class="bs-sv__k">LOOP</p>
          <ol>
            <li class="is-done"><span>01</span>Choice</li>
            <li class="is-on"><span>02</span>Memory</li>
            <li><span>03</span>Consequence</li>
          </ol>
          <div class="bs-sv-lx-game__tags">
            <span class="is-on">Session</span><span>Feedback</span><span>Retention</span>
          </div>
        </aside>
      </div>`,
  });
}

/** Character Lab — face system + expressions + use */
function visualCharacter(lang) {
  const ko = lang === "ko";
  return panelShell({
    mod: "character",
    live: "CHARACTER SYSTEM",
    meta: "CHARACTER LAB",
    body: `
      <div class="bs-sv-lx-char">
        <div class="bs-sv-lx-char__stage">
          <div class="bs-sv-lx-char__face" aria-hidden="true">
            <span class="eye l"></span><span class="eye r"></span>
            <span class="mouth"></span>
          </div>
          <p class="bs-sv-lx-char__name">NEWON FACE</p>
          <div class="bs-sv-lx-char__expr">
            <i class="is-on" title="default"></i>
            <i title="happy"></i>
            <i title="focus"></i>
            <i title="wow"></i>
          </div>
        </div>
        <aside class="bs-sv-lx-char__side">
          <p class="bs-sv__k">TRAITS</p>
          <div class="bs-sv-lx-char__chips">
            <span class="is-on">Shape</span><span class="is-on">Motion</span><span>Tone</span>
          </div>
          <p class="bs-sv__k">USE</p>
          <ul>
            <li class="is-on"><span>01</span>${ko ? "스티커" : "Sticker"}</li>
            <li class="is-on"><span>02</span>UI</li>
            <li><span>03</span>${ko ? "캠페인" : "Campaign"}</li>
          </ul>
          <div class="bs-sv-lx-char__note">
            <span>SYSTEM</span>
            <strong>${ko ? "표정 · 포즈 · 활용" : "Expr · Pose · Apply"}</strong>
          </div>
        </aside>
      </div>`,
  });
}

const VISUALS = {
  "review-ai": visualReviewAi,
  "newon-qr": visualQr,
  "newon-form": visualForm,
  "ai-experiment": visualAiDisc,
  "game-experiment": visualGame,
  "character-lab": visualCharacter,
};

export function labsHeroVisual(slug, lang = "ko") {
  const fn = VISUALS[slug];
  return fn ? fn(lang) : visualAiDisc(lang);
}
