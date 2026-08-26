/**
 * Newon AI showcase — clean product studio layout.
 * White canvas, editorial product sections, no duplicate process blocks.
 */
import { APP_CATALOG } from "./portfolio-data.mjs";
import { escapeHtml, pick } from "./hub-utils.mjs";

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return escapeHtml(v != null && v !== "" ? String(v) : fb);
}

const AI_IN_APPS = [
  { slug: "savy", name: "Savy", capabilityKo: "AI 소비 인사이트", capabilityEn: "AI Spending Insight" },
  { slug: "babylog", name: "BabyLog", capabilityKo: "AI 육아 인사이트", capabilityEn: "AI Parenting Insight" },
  { slug: "petlog", name: "PetLog", capabilityKo: "AI 케어 인사이트", capabilityEn: "AI Care Insight" },
  { slug: "piggyup", name: "PiggyUp", capabilityKo: "AI 코치", capabilityEn: "AI Coach" },
  { slug: "myworld", name: "My World", capabilityKo: "AI 여행 리포트", capabilityEn: "AI Travel Report" },
  { slug: "ox-month", name: "OX MONTH", capabilityKo: "AI 패턴 분석", capabilityEn: "AI Pattern Analysis" },
];

function appBySlug(slug) {
  return APP_CATALOG.find((a) => a.slug === slug) || null;
}

function statusBadge(flat, flatEn, kind) {
  if (kind === "building") {
    return `<span class="ai-status is-dev">${t(flat, flatEn, "studio.aiStatusBuilding", "IN DEVELOPMENT")}</span>`;
  }
  return `<span class="ai-status is-soon">${t(flat, flatEn, "studio.aiStatusSoon", "COMING SOON")}</span>`;
}

function processVisual(flat, flatEn) {
  return `<aside class="ai-process" data-ai-process aria-label="${t(flat, flatEn, "studio.aiProcessAria", "AI process")}">
    <div class="ai-process__step" data-process-step>
      <span>INPUT</span>
      <strong>Customer Reviews</strong>
      <em>2,481 inputs</em>
    </div>
    <div class="ai-process__arrow" aria-hidden="true">↓</div>
    <div class="ai-process__step" data-process-step>
      <span>UNDERSTAND</span>
      <strong>Product · Market · Users</strong>
    </div>
    <div class="ai-process__arrow" aria-hidden="true">↓</div>
    <div class="ai-process__step" data-process-step>
      <span>ANALYZE</span>
      <div class="ai-process__metrics">
        <p><em>Sentiment</em><b>78%</b></p>
        <p><em>Requests</em><b>342</b></p>
      </div>
    </div>
    <div class="ai-process__arrow" aria-hidden="true">↓</div>
    <div class="ai-process__step ai-process__step--out" data-process-step>
      <span>OUTPUT</span>
      <strong>${t(flat, flatEn, "studio.aiProcessAction", "Priority Insight")}</strong>
    </div>
  </aside>`;
}

function reviewDashboard() {
  return `<div class="ai-mock ai-mock--review" aria-hidden="true">
    <div class="ai-mock__chrome"><i></i><i></i><i></i><em>DEMO</em></div>
    <div class="ai-mock__stat">
      <strong>2,481</strong>
      <span>REVIEWS ANALYZED</span>
    </div>
    <div class="ai-mock__sentiment">
      <p class="ai-mock__label">Sentiment</p>
      <div class="ai-mock__row"><span>Positive</span><i style="--w:68%"></i><b>68%</b></div>
      <div class="ai-mock__row"><span>Neutral</span><i style="--w:19%"></i><b>19%</b></div>
      <div class="ai-mock__row"><span>Negative</span><i style="--w:13%"></i><b>13%</b></div>
    </div>
    <div class="ai-mock__split">
      <div>
        <p class="ai-mock__label">Top requests</p>
        <ul>
          <li><span>01</span> Dark mode <em>342</em></li>
          <li><span>02</span> Widget <em>218</em></li>
          <li><span>03</span> CSV Export <em>164</em></li>
        </ul>
      </div>
      <div>
        <p class="ai-mock__label">AI Insight</p>
        <p class="ai-mock__quote">“Users frequently request faster access to daily statistics.”</p>
        <p class="ai-mock__trend"><span>Trend</span><strong>+18.4%</strong></p>
      </div>
    </div>
  </div>`;
}

function contentMock() {
  return `<div class="ai-mock ai-mock--content" aria-hidden="true">
    <div class="ai-mock__chrome"><i></i><i></i><i></i><em>DEMO</em></div>
    <div class="ai-mock__cols">
      <div>
        <p class="ai-mock__label">INPUT</p>
        <div class="ai-mock__field"><em>Product</em><strong>BabyLog</strong></div>
        <div class="ai-mock__field"><em>Audience</em><strong>Parents</strong></div>
        <div class="ai-mock__field"><em>Tone</em><strong>Clear / Friendly</strong></div>
        <div class="ai-mock__btn">GENERATE →</div>
      </div>
      <div>
        <p class="ai-mock__label">OUTPUT</p>
        <ul class="ai-mock__out">
          <li>App Store</li>
          <li>Instagram</li>
          <li>Launch Copy</li>
          <li>Short-form</li>
        </ul>
      </div>
    </div>
  </div>`;
}

function launchMock(flat, flatEn) {
  return `<div class="ai-launch-flow" aria-hidden="true">
    <div class="ai-launch-flow__stage">
      <strong>IDEA</strong>
      <span>${t(flat, flatEn, "studio.aiLaunchIdea", "Problem defined")} ✓</span>
    </div>
    <span class="ai-launch-flow__arrow" aria-hidden="true">→</span>
    <div class="ai-launch-flow__stage">
      <strong>MVP</strong>
      <span>6 Core Features</span>
    </div>
    <span class="ai-launch-flow__arrow" aria-hidden="true">→</span>
    <div class="ai-launch-flow__stage">
      <strong>BUILD</strong>
      <span>14 Tasks</span>
    </div>
    <span class="ai-launch-flow__arrow" aria-hidden="true">→</span>
    <div class="ai-launch-flow__stage">
      <strong>LAUNCH</strong>
      <span>${t(flat, flatEn, "studio.aiLaunchReady", "Ready")}</span>
    </div>
  </div>`;
}

function csMock(flat, flatEn) {
  return `<div class="ai-mock ai-mock--cs" aria-hidden="true">
    <div class="ai-mock__chrome"><i></i><i></i><i></i><em>DEMO</em></div>
    <div class="ai-mock__cs">
      <div class="ai-mock__inbox">
        <p class="ai-mock__label">INBOX</p>
        <span class="is-on">Payment issue</span>
        <span>Bug report</span>
        <span>Feature request</span>
      </div>
      <div class="ai-mock__ticket">
        <p class="ai-mock__label">CUSTOMER</p>
        <p class="ai-mock__quote">“Subscription isn't showing...”</p>
        <p class="ai-mock__label">AI SUGGESTED RESPONSE</p>
        <p class="ai-mock__reply">${t(flat, flatEn, "studio.aiCsReply", "Please check Billing → Subscriptions. If the plan still doesn’t appear, reply here and we’ll restore access.")}</p>
        <div class="ai-mock__meta">
          <p><em>Knowledge sources</em><strong>03 matched</strong></p>
          <p><em>Confidence</em><strong>94%</strong></p>
        </div>
      </div>
    </div>
  </div>`;
}

function productSection({
  id,
  num,
  category,
  name,
  headline,
  body,
  status,
  visual,
  reverse,
  dark,
  flat,
  flatEn,
}) {
  const order = reverse ? " is-reverse" : "";
  const tone = dark ? " ai-product--dark" : "";
  return `<section id="${id}" class="ai-product${tone}${order}" data-ai-reveal data-ai-section="${id}">
    <div class="ai-product__inner hub-inner">
      <div class="ai-product__copy">
        <p class="ai-product__eyebrow"><span>${num}</span> / ${escapeHtml(category)}</p>
        <h2 class="ai-product__name">${name}</h2>
        <h3 class="ai-product__title">${headline}</h3>
        <p class="ai-product__body">${body}</p>
        <div class="ai-product__meta">
          ${statusBadge(flat, flatEn, status)}
        </div>
      </div>
      <div class="ai-product__visual">${visual}</div>
    </div>
  </section>`;
}

function earlyAccessForm(flat, flatEn) {
  return `<section class="ai-early" id="ai-early-access" data-ai-reveal>
    <div class="ai-early__inner hub-inner">
      <div class="ai-early__copy">
        <p class="ai-early__eyebrow">${t(flat, flatEn, "studio.aiEarlyLabel", "NEWON AI / EARLY ACCESS")}</p>
        <h2 class="ai-early__title">${t(flat, flatEn, "studio.aiEarlyTitle", "Newon AI 제품 출시 소식을\n가장 먼저 받아보세요.")}</h2>
      </div>
      <form class="ai-early__form waitlist-form" data-waitlist-form data-product-id="newon-ai" data-form-type="waitlist">
        <input type="hidden" name="productId" value="newon-ai" />
        <label class="ai-early__field">
          <span class="visually-hidden">Email</span>
          <input type="email" name="email" placeholder="email@example.com" required autocomplete="email" aria-label="Email" />
        </label>
        <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" />
        <button type="submit" class="btn btn-primary">${t(flat, flatEn, "studio.aiEarlyCta", "Join waitlist")}</button>
      </form>
      <p class="waitlist-success" data-waitlist-success hidden>${t(flat, flatEn, "studio.waitlistSuccess", "")}</p>
      <p class="waitlist-success" data-waitlist-duplicate hidden>${t(flat, flatEn, "studio.newsletterAlready", "")}</p>
      <p class="waitlist-error" data-waitlist-error hidden role="alert">${t(flat, flatEn, "studio.waitlistError", "")}</p>
    </div>
  </section>`;
}

function appsCapabilityMap(flat, flatEn, lang) {
  const isKo = (lang?.dir || lang) === "ko";
  const items = AI_IN_APPS.map((row) => {
    const app = appBySlug(row.slug);
    if (!app) return "";
    const cap = isKo ? row.capabilityKo : row.capabilityEn;
    return `<a class="ai-chip" href="../${escapeHtml(app.homeHash)}">
      <img src="${escapeHtml(app.icon)}" alt="" width="36" height="36" loading="lazy" decoding="async" />
      <span>
        <strong>${escapeHtml(row.name)}</strong>
        <em>${escapeHtml(cap)}</em>
      </span>
    </a>`;
  }).join("\n");

  return `<div class="ai-chips" aria-label="${t(flat, flatEn, "studio.aiInsideAria", "AI inside Newon apps")}">${items}</div>`;
}

export function renderAiShowcaseBody(flat, flatEn, lang) {
  const appsCount = String(AI_IN_APPS.length);

  return `<div class="ai-page" data-ai-page>
  <section class="ai-hero" data-ai-reveal>
    <div class="ai-hero__inner hub-inner">
      <div class="ai-hero__copy">
        <p class="ai-hero__eyebrow">${t(flat, flatEn, "studio.aiHeroLabel", "NEWON AI")}</p>
        <h1 class="ai-hero__title">${t(flat, flatEn, "studio.aiHeroTitle", "AI를 기능이 아니라\n실제 사용할 수 있는\n제품으로 만듭니다.")}</h1>
        <p class="ai-hero__lead">${t(flat, flatEn, "studio.aiHeroLead", "분석, 콘텐츠, 제품 기획, 고객 지원까지.\nNewon은 AI를 실제 업무와 제품에 연결합니다.")}</p>
        <div class="ai-hero__actions">
          <a class="btn btn-primary" href="#ai-products">${t(flat, flatEn, "studio.aiCtaBrowse", "AI Products")} ↓</a>
          <a class="btn btn-ghost" href="../business/#inquiry" data-analytics="business_cta_click">${t(flat, flatEn, "studio.aiCta", "AI 프로젝트 문의하기")} →</a>
        </div>
        <ul class="ai-hero__trust">
          <li><i aria-hidden="true"></i>${t(flat, flatEn, "studio.aiTrust1", "AI-FIRST")}</li>
          <li><i aria-hidden="true"></i>${t(flat, flatEn, "studio.aiTrust2", "REAL USE")}</li>
          <li><i aria-hidden="true"></i>${t(flat, flatEn, "studio.aiTrust3", "BUILT BY NEWON")}</li>
        </ul>
      </div>
      ${processVisual(flat, flatEn)}
    </div>
  </section>

  <section class="ai-proof" data-ai-reveal aria-label="${t(flat, flatEn, "studio.aiStatsAria", "AI overview")}">
    <div class="hub-inner">
      <ul class="ai-proof__list">
        <li><strong>04</strong> ${t(flat, flatEn, "studio.aiStatProducts", "AI Products")}</li>
        <li><strong>${escapeHtml(appsCount)}</strong> ${t(flat, flatEn, "studio.aiStatApps", "AI-enabled Apps")}</li>
        <li>${t(flat, flatEn, "studio.aiStatFocusValue", "Product First")}</li>
        <li>${t(flat, flatEn, "studio.aiStatBiz", "Built for Real Use")}</li>
      </ul>
    </div>
  </section>

  <div id="ai-products" class="ai-pnav-wrap">
    <nav class="ai-pnav hub-inner" aria-label="${t(flat, flatEn, "studio.aiSection1Title", "PRODUCTS")}">
      <p class="ai-pnav__label">${t(flat, flatEn, "studio.aiSection1Title", "PRODUCTS")}</p>
      <div class="ai-pnav__track" role="list">
        <a class="ai-pnav__item" role="listitem" href="#ai-review" data-ai-nav="ai-review"><span>01</span><strong>Review</strong></a>
        <a class="ai-pnav__item" role="listitem" href="#ai-content" data-ai-nav="ai-content"><span>02</span><strong>Content</strong></a>
        <a class="ai-pnav__item" role="listitem" href="#ai-launch" data-ai-nav="ai-launch"><span>03</span><strong>Launch</strong></a>
        <a class="ai-pnav__item" role="listitem" href="#ai-cs" data-ai-nav="ai-cs"><span>04</span><strong>CS AI</strong></a>
      </div>
      <a class="ai-pnav__all" href="#ai-products">${t(flat, flatEn, "studio.aiViewAll", "View all")} →</a>
    </nav>
  </div>

  ${productSection({
    id: "ai-review",
    num: "01",
    category: "REVIEW INTELLIGENCE",
    name: t(flat, flatEn, "studio.aiProduct1Name", "Newon Review AI"),
    headline: t(flat, flatEn, "studio.aiP1Headline", "수천 개의 리뷰에서\n다음 제품 결정을 찾습니다."),
    body: t(flat, flatEn, "studio.aiP1Body", "고객 리뷰를 분석해 반복되는 불만, 기능 요청, 긍정 요인과 개선 우선순위를 정리합니다."),
    status: "building",
    visual: reviewDashboard(),
    reverse: false,
    dark: false,
    flat,
    flatEn,
  })}

  ${productSection({
    id: "ai-content",
    num: "02",
    category: "GENERATIVE CONTENT",
    name: t(flat, flatEn, "studio.aiProduct2Name", "Newon Content AI"),
    headline: t(flat, flatEn, "studio.aiP2Headline", "하나의 제품 정보에서\n여러 채널의 콘텐츠를."),
    body: t(flat, flatEn, "studio.aiP2Body", "제품 정보를 한 번 입력하면 스토어 설명, SNS 콘텐츠, 광고 카피, 출시 콘텐츠를 생성합니다."),
    status: "concept",
    visual: contentMock(),
    reverse: true,
    dark: false,
    flat,
    flatEn,
  })}

  ${productSection({
    id: "ai-launch",
    num: "03",
    category: "PRODUCT STRATEGY",
    name: t(flat, flatEn, "studio.aiProduct3Name", "Newon Launch AI"),
    headline: t(flat, flatEn, "studio.aiP3Headline", "아이디어에서\n출시 계획까지."),
    body: t(flat, flatEn, "studio.aiP3Body", "아이디어를 입력하면 MVP 범위, 핵심 기능, 출시 체크리스트와 초기 로드맵을 정리합니다."),
    status: "concept",
    visual: launchMock(flat, flatEn),
    reverse: false,
    dark: true,
    flat,
    flatEn,
  })}

  ${productSection({
    id: "ai-cs",
    num: "04",
    category: "AI SUPPORT",
    name: t(flat, flatEn, "studio.aiProduct4Name", "Newon CS AI"),
    headline: t(flat, flatEn, "studio.aiP4Headline", "문의는 빠르게,\n답변은 일관되게."),
    body: t(flat, flatEn, "studio.aiP4Body", "기업/제품의 knowledge base를 기반으로 문의 분류, 답변 초안, 반복 질문 처리를 지원합니다."),
    status: "concept",
    visual: csMock(flat, flatEn),
    reverse: true,
    dark: false,
    flat,
    flatEn,
  })}

  ${earlyAccessForm(flat, flatEn)}

  <section class="ai-biz" data-ai-reveal>
    <div class="ai-biz__inner hub-inner">
      <div class="ai-biz__copy">
        <p class="ai-biz__eyebrow">${t(flat, flatEn, "studio.aiSection2Title", "AI FOR BUSINESS")}</p>
        <h2 class="ai-biz__title">${t(flat, flatEn, "studio.aiBizTitle", "반복 업무를\nAI Workflow로.")}</h2>
        <p class="ai-biz__lead">${t(flat, flatEn, "studio.aiSection2Lead", "기업의 기존 업무와 데이터를 AI에 연결해 반복 작업을 자동화합니다.")}</p>
        <a class="btn btn-primary" href="../business/#inquiry" data-analytics="business_cta_click">${t(flat, flatEn, "studio.aiCta", "AI 프로젝트 문의하기")} →</a>
      </div>
      <ol class="ai-biz__pipe" data-ai-biz-pipe>
        <li data-biz-step data-case="automation" class="is-active">
          <span>01</span>
          <strong>AUTOMATION</strong>
          <p>${t(flat, flatEn, "studio.aiBizPoint1", "반복 작업 자동화")}</p>
        </li>
        <li data-biz-step data-case="workflow">
          <span>02</span>
          <strong>WORKFLOW</strong>
          <p>${t(flat, flatEn, "studio.aiBizPoint2", "기존 서비스와 AI 연결")}</p>
        </li>
        <li data-biz-step data-case="knowledge">
          <span>03</span>
          <strong>KNOWLEDGE</strong>
          <p>${t(flat, flatEn, "studio.aiBizPoint3", "내부 자료 기반 AI")}</p>
        </li>
        <li data-biz-step data-case="action">
          <span>04</span>
          <strong>ACTION</strong>
          <p>${t(flat, flatEn, "studio.aiBizPoint4", "분석 결과를 실제 업무로 연결")}</p>
        </li>
      </ol>
      <aside class="ai-biz__case" data-biz-case aria-live="polite">
        <p class="ai-biz__case-label">USE CASE</p>
        <div data-case-body>
          <div><span>Input</span><strong>Customer inquiry</strong></div>
          <div><span>AI</span><strong>Classify + Analyze</strong></div>
          <div><span>Action</span><strong>Generate response</strong></div>
          <div><span>Result</span><strong>Support workflow</strong></div>
        </div>
      </aside>
    </div>
  </section>

  <section class="ai-how" data-ai-reveal>
    <div class="hub-inner">
      <header class="ai-section-head">
        <p class="ai-section-head__eyebrow">${t(flat, flatEn, "studio.aiHowLabel", "HOW WE BUILD")}</p>
        <h2 class="ai-section-head__title">${t(flat, flatEn, "studio.aiHowTitle", "모델보다 중요한 건,\n어디에 쓰이느냐입니다.")}</h2>
      </header>
      <ol class="ai-how__track">
        <li>
          <span>01</span>
          <strong>DISCOVER</strong>
          <p>${t(flat, flatEn, "studio.aiProj1", "문제와 현재 업무 흐름 파악")}</p>
        </li>
        <li>
          <span>02</span>
          <strong>DESIGN</strong>
          <p>${t(flat, flatEn, "studio.aiProj2", "AI 적용 영역 및 데이터 구조 설계")}</p>
        </li>
        <li>
          <span>03</span>
          <strong>PROTOTYPE</strong>
          <p>${t(flat, flatEn, "studio.aiProj3", "작은 AI prototype 제작")}</p>
        </li>
        <li>
          <span>04</span>
          <strong>BUILD</strong>
          <p>${t(flat, flatEn, "studio.aiProj4", "실제 제품/업무 시스템에 연결")}</p>
        </li>
        <li>
          <span>05</span>
          <strong>IMPROVE</strong>
          <p>${t(flat, flatEn, "studio.aiProj5", "사용 데이터를 기반으로 개선")}</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="ai-inside" data-ai-reveal>
    <div class="hub-inner">
      <header class="ai-section-head">
        <p class="ai-section-head__eyebrow">${t(flat, flatEn, "studio.aiInsideLabel", "AI INSIDE NEWON")}</p>
        <h2 class="ai-section-head__title">${t(flat, flatEn, "studio.aiInsideTitle", "AI는 별도의 기능이 아니라\n제품 안에서 작동합니다.")}</h2>
        <p class="ai-section-head__lead">${t(flat, flatEn, "studio.aiFeaturesLead", "습관, 금융, 가족, 여행 앱 안에서 이미 AI가 동작합니다.")}</p>
      </header>
      ${appsCapabilityMap(flat, flatEn, lang)}
      <p class="ai-inside__cta"><a class="btn btn-ghost" href="../apps/">${t(flat, flatEn, "studio.aiFeaturesCta", "앱 둘러보기")} →</a></p>
    </div>
  </section>

  <section class="ai-caps" data-ai-reveal data-ai-caps>
    <div class="hub-inner ai-caps__inner">
      <header class="ai-caps__head">
        <p class="ai-caps__eyebrow">${t(flat, flatEn, "studio.aiCapsLabel", "CAPABILITIES")}</p>
        <h2 class="ai-caps__title">${t(flat, flatEn, "studio.aiCapsTitle", "What we build\nwith AI.")}</h2>
        <p class="ai-caps__lead">${t(flat, flatEn, "studio.aiCapsLead", "모델을 나열하지 않습니다. 제품과 업무에 실제로 붙는 능력만 만듭니다.")}</p>
      </header>
      <ol class="ai-caps__index">
        <li class="ai-caps__row is-active" data-cap-row>
          <button type="button" class="ai-caps__trigger" data-cap-trigger aria-expanded="true">
            <span class="ai-caps__n">01</span>
            <span class="ai-caps__name">ANALYSIS</span>
            <span class="ai-caps__tag">Review AI</span>
          </button>
          <div class="ai-caps__panel">
            <p>${t(flat, flatEn, "studio.aiCap1", "데이터와 사용자 반응에서 패턴을 찾습니다.")}</p>
            <a href="#ai-review">${t(flat, flatEn, "studio.aiCapLink", "관련 제품 보기")} →</a>
          </div>
        </li>
        <li class="ai-caps__row" data-cap-row>
          <button type="button" class="ai-caps__trigger" data-cap-trigger aria-expanded="false">
            <span class="ai-caps__n">02</span>
            <span class="ai-caps__name">GENERATION</span>
            <span class="ai-caps__tag">Content AI</span>
          </button>
          <div class="ai-caps__panel">
            <p>${t(flat, flatEn, "studio.aiCap2", "텍스트와 콘텐츠를 생성합니다.")}</p>
            <a href="#ai-content">${t(flat, flatEn, "studio.aiCapLink", "관련 제품 보기")} →</a>
          </div>
        </li>
        <li class="ai-caps__row" data-cap-row>
          <button type="button" class="ai-caps__trigger" data-cap-trigger aria-expanded="false">
            <span class="ai-caps__n">03</span>
            <span class="ai-caps__name">RECOMMENDATION</span>
            <span class="ai-caps__tag">Launch AI</span>
          </button>
          <div class="ai-caps__panel">
            <p>${t(flat, flatEn, "studio.aiCap3", "상황에 맞는 다음 행동을 제안합니다.")}</p>
            <a href="#ai-launch">${t(flat, flatEn, "studio.aiCapLink", "관련 제품 보기")} →</a>
          </div>
        </li>
        <li class="ai-caps__row" data-cap-row>
          <button type="button" class="ai-caps__trigger" data-cap-trigger aria-expanded="false">
            <span class="ai-caps__n">04</span>
            <span class="ai-caps__name">AUTOMATION</span>
            <span class="ai-caps__tag">Business</span>
          </button>
          <div class="ai-caps__panel">
            <p>${t(flat, flatEn, "studio.aiCap4", "반복 업무를 자동화합니다.")}</p>
            <a href="../business/#inquiry">${t(flat, flatEn, "studio.aiCapBizLink", "비즈니스 문의")} →</a>
          </div>
        </li>
        <li class="ai-caps__row" data-cap-row>
          <button type="button" class="ai-caps__trigger" data-cap-trigger aria-expanded="false">
            <span class="ai-caps__n">05</span>
            <span class="ai-caps__name">KNOWLEDGE</span>
            <span class="ai-caps__tag">CS AI</span>
          </button>
          <div class="ai-caps__panel">
            <p>${t(flat, flatEn, "studio.aiCap5", "기업과 제품의 정보를 AI에 연결합니다.")}</p>
            <a href="#ai-cs">${t(flat, flatEn, "studio.aiCapLink", "관련 제품 보기")} →</a>
          </div>
        </li>
        <li class="ai-caps__row" data-cap-row>
          <button type="button" class="ai-caps__trigger" data-cap-trigger aria-expanded="false">
            <span class="ai-caps__n">06</span>
            <span class="ai-caps__name">PERSONALIZATION</span>
            <span class="ai-caps__tag">Apps</span>
          </button>
          <div class="ai-caps__panel">
            <p>${t(flat, flatEn, "studio.aiCap6", "사용자 맥락에 맞춰 경험을 조정합니다.")}</p>
            <a href="../apps/">${t(flat, flatEn, "studio.aiFeaturesCta", "앱 둘러보기")} →</a>
          </div>
        </li>
      </ol>
    </div>
  </section>

  <section class="ai-cta" data-ai-reveal>
    <div class="ai-cta__bg" aria-hidden="true"></div>
    <div class="ai-cta__inner hub-inner">
      <p class="ai-cta__eyebrow">${t(flat, flatEn, "studio.aiDiscoverLabel", "BUILD WITH NEWON")}</p>
      <h2 class="ai-cta__title">${t(flat, flatEn, "studio.aiDiscoverTitle", "AI가 필요한 곳을\n제품으로 만듭니다.")}</h2>
      <p class="ai-cta__lead">${t(flat, flatEn, "studio.aiDiscoverLead", "아이디어 검증부터 AI 기능 설계, 제품 개발과 자동화까지 함께 설계합니다.")}</p>
      <div class="ai-cta__actions">
        <a class="btn btn-primary ai-cta__btn" href="../business/#inquiry" data-analytics="business_cta_click">${t(flat, flatEn, "studio.aiCta", "AI 프로젝트 문의하기")} →</a>
        <a class="btn btn-ghost ai-cta__btn ai-cta__btn--ghost" href="../business/">${t(flat, flatEn, "studio.aiCtaBusiness", "Newon Business 보기")} →</a>
      </div>
      <p class="ai-cta__foot">NEWON AI · PRODUCT STUDIO</p>
    </div>
  </section>
</div>`;
}
