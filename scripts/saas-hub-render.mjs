/**
 * Newon SaaS showcase — premium product studio layout.
 * Status from products-data: Review/QR = building, Link/Form = concept.
 * No dead links; Labs/Tools/Business/Contact/Ideas only when real.
 */
import { escapeHtml, pick } from "./hub-utils.mjs";

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return escapeHtml(v != null && v !== "" ? String(v) : fb);
}

function statusBadge(flat, flatEn, kind) {
  // building | concept | live | beta
  const map = {
    building: {
      code: "IN DEVELOPMENT",
      label: t(flat, flatEn, "studio.saasStatusBuilding", "개발 중"),
      className: "is-dev",
    },
    concept: {
      code: "COMING SOON",
      label: t(flat, flatEn, "studio.saasStatusSoon", "준비 중"),
      className: "is-soon",
    },
    live: {
      code: "LIVE",
      label: t(flat, flatEn, "studio.saasStatusLive", "사용 가능"),
      className: "is-live",
    },
    beta: {
      code: "BETA",
      label: t(flat, flatEn, "studio.saasStatusBeta", "베타"),
      className: "is-beta",
    },
  };
  const s = map[kind] || map.concept;
  return `<span class="saas-status ${s.className}"><i aria-hidden="true"></i><span>${s.label}</span></span>`;
}

function mockChrome(label) {
  return `<div class="saas-mock__chrome" aria-hidden="true">
    <span class="saas-mock__dots"><i></i><i></i><i></i></span>
    <em>${label}</em>
  </div>`;
}

function reviewMock(flat, flatEn) {
  const demo = t(flat, flatEn, "studio.saasDemoData", "DEMO DATA");
  return `<div class="saas-mock saas-mock--review" aria-hidden="true">
    ${mockChrome(demo)}
    <div class="saas-mock__head">
      <strong>NEWON REVIEW</strong>
      <span>${t(flat, flatEn, "studio.saasMockOverview", "Overview")}</span>
    </div>
    <div class="saas-mock__review-top">
      <div class="saas-mock__stat">
        <strong>2,481</strong>
        <span>${t(flat, flatEn, "studio.saasMockReviewsAnalyzed", "REVIEWS ANALYZED")}</span>
      </div>
      <div class="saas-mock__sentiment">
        <p class="saas-mock__label">${t(flat, flatEn, "studio.saasMockSentiment", "Sentiment")}</p>
        <div class="saas-mock__bar-row"><span>${t(flat, flatEn, "studio.saasMockPos", "Positive")}</span><i style="--w:68%"></i><b>68%</b></div>
        <div class="saas-mock__bar-row"><span>${t(flat, flatEn, "studio.saasMockNeu", "Neutral")}</span><i style="--w:19%"></i><b>19%</b></div>
        <div class="saas-mock__bar-row"><span>${t(flat, flatEn, "studio.saasMockNeg", "Negative")}</span><i style="--w:13%"></i><b>13%</b></div>
      </div>
    </div>
    <div class="saas-mock__review-mid">
      <div class="saas-mock__chip">
        <span>${t(flat, flatEn, "studio.saasMockTopReq", "TOP REQUEST")}</span>
        <strong>${t(flat, flatEn, "studio.saasMockDarkMode", "Dark Mode")}</strong>
        <em>324 mentions</em>
      </div>
      <div class="saas-mock__trend">
        <span>${t(flat, flatEn, "studio.saasMockTrend", "TREND")}</span>
        <strong>↑ 12.4%</strong>
      </div>
    </div>
    <div class="saas-mock__rows">
      <p class="saas-mock__label">${t(flat, flatEn, "studio.saasMockInsights", "Recent insights")}</p>
      <div class="saas-mock__row"><span class="saas-mock__dot saas-mock__dot--pos"></span><p>${t(flat, flatEn, "studio.saasMockRow1", "UI는 깔끔한데 다크 모드가 필요해요.")}</p></div>
      <div class="saas-mock__row"><span class="saas-mock__dot saas-mock__dot--neu"></span><p>${t(flat, flatEn, "studio.saasMockRow2", "내보내기는 되는데 알림이 느려요.")}</p></div>
      <div class="saas-mock__row"><span class="saas-mock__dot saas-mock__dot--neg"></span><p>${t(flat, flatEn, "studio.saasMockRow3", "온보딩이 너무 길어요.")}</p></div>
    </div>
  </div>`;
}

function qrMock(flat, flatEn) {
  const demo = t(flat, flatEn, "studio.saasDemoData", "DEMO DATA");
  return `<div class="saas-mock saas-mock--qr" aria-hidden="true">
    ${mockChrome(demo)}
    <div class="saas-mock__head">
      <strong>NEWON QR</strong>
      <span>${t(flat, flatEn, "studio.saasQrUrlLabel", "URL")}</span>
    </div>
    <div class="saas-mock__qr-body">
      <div class="saas-mock__input">https://newon.app</div>
      <div class="saas-mock__qr-mark">
        <svg viewBox="0 0 88 88" width="120" height="120" focusable="false" aria-hidden="true">
          <rect width="88" height="88" rx="6" fill="#fff"/>
          <path fill="#0a0a0a" d="M12 12h28v28H12zm8 8h12v12H20zM48 12h28v28H48zm8 8h12v12H56zM12 48h28v28H12zm8 8h12v12H20zM52 48h8v8h-8zm12 0h12v8H64zM48 60h8v8h-8zm12 12h8v8h-8zm12-12h4v16h-4zM68 68h8v8h-8z"/>
        </svg>
        <span>${t(flat, flatEn, "studio.saasQrPreview", "QR Preview")}</span>
      </div>
    </div>
  </div>`;
}

function linkMock(flat, flatEn) {
  const demo = t(flat, flatEn, "studio.saasDemoData", "DEMO");
  return `<div class="saas-mock saas-mock--link" aria-hidden="true">
    ${mockChrome(demo)}
    <div class="saas-mock__link-url">newon.link/yourname</div>
    <div class="saas-mock__link-stack">
      <div><span>${t(flat, flatEn, "studio.saasLinkWebsite", "Website")}</span><i>↗</i></div>
      <div><span>Instagram</span><i>↗</i></div>
      <div><span>App Store</span><i>↗</i></div>
      <div><span>${t(flat, flatEn, "studio.saasLinkContact", "Contact")}</span><i>↗</i></div>
    </div>
    <div class="saas-mock__link-meta">
      <span>${t(flat, flatEn, "studio.saasLinkAnalytics", "Analytics")}</span>
      <strong>127 ${t(flat, flatEn, "studio.saasLinkClicks", "clicks")}</strong>
    </div>
  </div>`;
}

function formMock(flat, flatEn) {
  const demo = t(flat, flatEn, "studio.saasDemoData", "DEMO");
  return `<div class="saas-mock saas-mock--form" aria-hidden="true">
    ${mockChrome(demo)}
    <div class="saas-mock__head">
      <strong>NEWON FORM</strong>
      <span>${t(flat, flatEn, "studio.saasFormTitle", "Product Feedback")}</span>
    </div>
    <div class="saas-mock__form-block">
      <span class="saas-mock__label">${t(flat, flatEn, "studio.saasFormQ1", "이 제품에서 가장 마음에 드는 점은?")}</span>
      <div class="saas-mock__input saas-mock__input--ghost"></div>
    </div>
    <div class="saas-mock__form-block">
      <span class="saas-mock__label">${t(flat, flatEn, "studio.saasFormQ2", "어떤 기능이 필요하신가요?")}</span>
      <div class="saas-mock__input saas-mock__input--ghost"></div>
    </div>
    <div class="saas-mock__form-foot">
      <div class="saas-mock__btn">${t(flat, flatEn, "studio.saasFormSubmit", "보내기")}</div>
      <p><span>${t(flat, flatEn, "studio.saasFormResponses", "Responses")}</span> <strong>24</strong></p>
    </div>
  </div>`;
}

function productStack(flat, flatEn) {
  const rows = [
    {
      id: "review",
      name: "Review",
      desc: t(flat, flatEn, "studio.saasStackReviewDesc", "Customer insight"),
      status: "building",
      href: "#saas-review",
    },
    {
      id: "qr",
      name: "QR",
      desc: t(flat, flatEn, "studio.saasStackQrDesc", "Generate instantly"),
      status: "building",
      href: "#saas-qr",
    },
    {
      id: "link",
      name: "Link",
      desc: t(flat, flatEn, "studio.saasStackLinkDesc", "One link. Everywhere."),
      status: "concept",
      href: "#saas-link",
    },
    {
      id: "form",
      name: "Form",
      desc: t(flat, flatEn, "studio.saasStackFormDesc", "Simple data collection"),
      status: "concept",
      href: "#saas-form",
    },
  ];
  return `<aside class="saas-stack" aria-label="${t(flat, flatEn, "studio.saasStackAria", "Newon SaaS product stack")}">
    <div class="saas-stack__head">
      <span>${t(flat, flatEn, "studio.saasStackLabel", "NEWON SOFTWARE")}</span>
    </div>
    <ul class="saas-stack__list">
      ${rows
        .map((r) => {
          const badge = statusBadge(flat, flatEn, r.status);
          return `<li>
          <a class="saas-stack__row" href="${r.href}">
            <span class="saas-stack__main">
              <strong>${escapeHtml(r.name)}</strong>
              <em>${r.desc}</em>
            </span>
            <span class="saas-stack__side">${badge}<i aria-hidden="true">→</i></span>
          </a>
        </li>`;
        })
        .join("")}
    </ul>
  </aside>`;
}

function productNav(flat, flatEn) {
  const items = [
    { n: "01", label: "Review", href: "#saas-review" },
    { n: "02", label: "QR", href: "#saas-qr" },
    { n: "03", label: "Link", href: "#saas-link" },
    { n: "04", label: "Form", href: "#saas-form" },
    { n: "+", label: t(flat, flatEn, "studio.saasNavMore", "More"), href: "#saas-roadmap" },
  ];
  return `<nav class="saas-pnav hub-inner" aria-label="${t(flat, flatEn, "studio.saasPnavAria", "Products")}">
    <p class="saas-pnav__label">${t(flat, flatEn, "studio.saasPnavLabel", "PRODUCTS")}</p>
    <div class="saas-pnav__track" role="list">
      ${items
        .map(
          (it) =>
            `<a class="saas-pnav__item" role="listitem" href="${it.href}" data-saas-nav="${it.href.slice(1)}"><span>${it.n}</span><strong>${escapeHtml(it.label)}</strong></a>`
        )
        .join("")}
    </div>
  </nav>`;
}

function productSection({
  id,
  num,
  code,
  name,
  headline,
  body,
  tags,
  status,
  visual,
  reverse,
  tone,
  flat,
  flatEn,
}) {
  const orderClass = reverse ? " is-reverse" : "";
  const toneClass = tone ? ` saas-product--${tone}` : "";
  return `<section id="${id}" class="saas-product${toneClass}${orderClass}" data-saas-reveal data-saas-section="${id}">
    <div class="saas-product__inner hub-inner">
      <div class="saas-product__copy">
        <p class="saas-product__eyebrow"><span>${num}</span> / ${escapeHtml(code)}</p>
        <h2 class="saas-product__name">${name}</h2>
        <h3 class="saas-product__title">${headline}</h3>
        <p class="saas-product__body">${body}</p>
        ${tags ? `<p class="saas-product__tags">${tags}</p>` : ""}
        <div class="saas-product__meta">
          ${statusBadge(flat, flatEn, status)}
        </div>
      </div>
      <div class="saas-product__visual">${visual}</div>
    </div>
  </section>`;
}

export function renderSaasShowcaseBody(flat, flatEn) {
  const reviewTags = [
    t(flat, flatEn, "studio.saas1Tag1", "리뷰 분석"),
    t(flat, flatEn, "studio.saas1Tag2", "감성"),
    t(flat, flatEn, "studio.saas1Tag3", "인사이트"),
  ]
    .map((x) => `<span>${x}</span>`)
    .join('<span aria-hidden="true">·</span>');

  const formTags = [
    t(flat, flatEn, "studio.saas4Tag1", "폼 생성"),
    t(flat, flatEn, "studio.saas4Tag2", "응답 수집"),
    t(flat, flatEn, "studio.saas4Tag3", "알림"),
  ]
    .map((x) => `<span>${x}</span>`)
    .join('<span aria-hidden="true">·</span>');

  return `<div class="saas-page" data-saas-page>
  <section class="saas-hero" data-saas-reveal>
    <div class="saas-hero__inner hub-inner">
      <div class="saas-hero__copy">
        <p class="saas-hero__eyebrow">${t(flat, flatEn, "studio.saasHeroLabel", "Newon SaaS")}</p>
        <h1 class="saas-hero__title">${t(flat, flatEn, "studio.saasHeroTitle", "필요한 순간,\n바로 사용할 수 있는\n웹 도구.")}</h1>
        <p class="saas-hero__lead">${t(flat, flatEn, "studio.saasHeroLead", "설치 없이 웹에서 바로 시작하는\nNewon의 작고 빠른 소프트웨어 제품들.")}</p>
        <div class="saas-hero__actions">
          <a class="btn btn-primary" href="#saas-products">${t(flat, flatEn, "studio.saasCtaBrowse", "SaaS 둘러보기")} ↓</a>
          <a class="btn btn-ghost" href="../labs/">${t(flat, flatEn, "studio.saasCtaLabs", "Newon Labs")} →</a>
        </div>
        <ul class="saas-hero__meta" aria-label="${t(flat, flatEn, "studio.saasMetaAria", "특징")}">
          <li>${t(flat, flatEn, "studio.saasMeta1", "WEB BASED")}</li>
          <li>${t(flat, flatEn, "studio.saasMeta2", "NO INSTALL")}</li>
          <li>${t(flat, flatEn, "studio.saasMeta3", "BUILT BY NEWON")}</li>
        </ul>
      </div>
      ${productStack(flat, flatEn)}
    </div>
  </section>

  <div id="saas-products">${productNav(flat, flatEn)}</div>

  ${productSection({
    id: "saas-review",
    num: "01",
    code: "REVIEW",
    name: t(flat, flatEn, "studio.saas1Name", "NEWON REVIEW"),
    headline: t(flat, flatEn, "studio.saas1Headline", "리뷰를 읽는 대신,\n흐름을 봅니다."),
    body: t(flat, flatEn, "studio.saas1Body", "앱·제품 리뷰를 분석해 반복되는 불만, 요청, 긍정 요인을 정리합니다."),
    tags: reviewTags,
    status: "building",
    visual: reviewMock(flat, flatEn),
    reverse: false,
    tone: "soft",
    flat,
    flatEn,
  })}

  ${productSection({
    id: "saas-qr",
    num: "02",
    code: "QR",
    name: t(flat, flatEn, "studio.saas2Name", "NEWON QR"),
    headline: t(flat, flatEn, "studio.saas2Headline", "링크 하나를\n바로 QR로."),
    body: t(flat, flatEn, "studio.saas2Body", "URL을 입력하고 브랜드에 맞는 QR을 바로 생성합니다."),
    tags: `<span>${t(flat, flatEn, "studio.saasFree", "무료")}</span>`,
    status: "building",
    visual: qrMock(flat, flatEn),
    reverse: true,
    tone: "white",
    flat,
    flatEn,
  })}

  ${productSection({
    id: "saas-link",
    num: "03",
    code: "LINK",
    name: t(flat, flatEn, "studio.saas3Name", "NEWON LINK"),
    headline: t(flat, flatEn, "studio.saas3Headline", "하나의 링크로\n더 많은 곳에 연결하세요."),
    body: t(flat, flatEn, "studio.saas3Body", "프로필, 웹사이트, 앱스토어를 하나의 링크로 모읍니다."),
    tags: "",
    status: "concept",
    visual: linkMock(flat, flatEn),
    reverse: false,
    tone: "dark",
    flat,
    flatEn,
  })}

  ${productSection({
    id: "saas-form",
    num: "04",
    code: "FORM",
    name: t(flat, flatEn, "studio.saas4Name", "NEWON FORM"),
    headline: t(flat, flatEn, "studio.saas4Headline", "필요한 질문만,\n빠르게 받습니다."),
    body: t(flat, flatEn, "studio.saas4Body", "짧은 폼을 만들고 응답을 수집하는 가장 단순한 방법."),
    tags: formTags,
    status: "concept",
    visual: formMock(flat, flatEn),
    reverse: true,
    tone: "soft",
    flat,
    flatEn,
  })}

  <section class="saas-principle" data-saas-reveal data-saas-principle>
    <div class="saas-principle__bg" aria-hidden="true"></div>
    <div class="saas-principle__inner hub-inner">
      <header class="saas-principle__head">
        <p class="saas-principle__eyebrow">${t(flat, flatEn, "studio.saasPrincipleLabel", "NEWON SOFTWARE PRINCIPLE")}</p>
        <p class="saas-principle__ko">${t(flat, flatEn, "studio.saasPrincipleKo", "하나의 제품은 하나의 문제에 집중합니다.")}</p>
      </header>
      <ol class="saas-principle__list">
        <li class="saas-principle__item" data-principle-line>
          <span>01</span>
          <strong>${t(flat, flatEn, "studio.saasPrincipleL1", "하나의 문제.")}</strong>
        </li>
        <li class="saas-principle__item" data-principle-line>
          <span>02</span>
          <strong>${t(flat, flatEn, "studio.saasPrincipleL2", "하나의 제품.")}</strong>
        </li>
        <li class="saas-principle__item" data-principle-line>
          <span>03</span>
          <strong>${t(flat, flatEn, "studio.saasPrincipleL3", "가능한 한 단순하게.")}</strong>
        </li>
      </ol>
    </div>
  </section>

  <section class="saas-build" data-saas-reveal>
    <div class="hub-inner">
      <header class="saas-section-head">
        <p class="saas-section-head__eyebrow">${t(flat, flatEn, "studio.saasBuildLabel", "HOW WE BUILD")}</p>
        <h2 class="saas-section-head__title">${t(flat, flatEn, "studio.saasBuildTitle", "작게 만들고,\n빠르게 검증하고,\n계속 개선합니다.")}</h2>
      </header>
      <ol class="saas-build__list">
        <li>
          <span>01</span>
          <strong>${t(flat, flatEn, "studio.saasBuild1Title", "FOCUS")}</strong>
          <p>${t(flat, flatEn, "studio.saasBuild1Body", "하나의 제품은 하나의 핵심 문제부터 해결합니다.")}</p>
        </li>
        <li>
          <span>02</span>
          <strong>${t(flat, flatEn, "studio.saasBuild2Title", "SHIP")}</strong>
          <p>${t(flat, flatEn, "studio.saasBuild2Body", "완벽해질 때까지 기다리기보다 사용할 수 있는 제품을 먼저 만듭니다.")}</p>
        </li>
        <li>
          <span>03</span>
          <strong>${t(flat, flatEn, "studio.saasBuild3Title", "IMPROVE")}</strong>
          <p>${t(flat, flatEn, "studio.saasBuild3Body", "실제 사용과 피드백을 기반으로 제품을 계속 개선합니다.")}</p>
        </li>
      </ol>
    </div>
  </section>

  <section id="saas-roadmap" class="saas-roadmap" data-saas-reveal>
    <div class="hub-inner">
      <header class="saas-section-head">
        <p class="saas-section-head__eyebrow">${t(flat, flatEn, "studio.saasRoadmapLabel", "ROADMAP")}</p>
        <h2 class="saas-section-head__title">${t(flat, flatEn, "studio.saasRoadmapTitle", "계속 확장되는\nNewon Software.")}</h2>
        <p class="saas-section-head__lead">${t(flat, flatEn, "studio.saasRoadmapLead", "작은 문제에서 시작해 검증된 제품을 하나씩 확장합니다.")}</p>
      </header>
      <div class="saas-roadmap__rail" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="saas-roadmap__grid">
        <article class="saas-roadmap__stage">
          <p class="saas-roadmap__when"><span>01</span> ${t(flat, flatEn, "studio.saasRoadNow", "NOW")}</p>
          <ul>
            <li><strong>Newon Review</strong>${statusBadge(flat, flatEn, "building")}</li>
            <li><strong>Newon QR</strong>${statusBadge(flat, flatEn, "building")}</li>
          </ul>
        </article>
        <article class="saas-roadmap__stage">
          <p class="saas-roadmap__when"><span>02</span> ${t(flat, flatEn, "studio.saasRoadNext", "NEXT")}</p>
          <ul>
            <li><strong>Newon Link</strong>${statusBadge(flat, flatEn, "concept")}</li>
            <li><strong>Newon Form</strong>${statusBadge(flat, flatEn, "concept")}</li>
          </ul>
        </article>
        <article class="saas-roadmap__stage">
          <p class="saas-roadmap__when"><span>03</span> ${t(flat, flatEn, "studio.saasRoadLater", "LATER")}</p>
          <ul>
            <li>
              <strong>${t(flat, flatEn, "studio.saasRoadmapLaterTitle", "NEWON LABS")}</strong>
              <em>${t(flat, flatEn, "studio.saasRoadmapLater", "새로운 제품 실험")}</em>
              <span class="saas-status is-exp"><i aria-hidden="true"></i><span>${t(flat, flatEn, "studio.saasStatusExperiment", "EXPERIMENTAL")}</span></span>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>

  <section class="saas-cta" data-saas-reveal>
    <div class="saas-cta__bg" aria-hidden="true"></div>
    <div class="saas-cta__inner hub-inner">
      <div class="saas-cta__copy">
        <p class="saas-cta__eyebrow">${t(flat, flatEn, "studio.saasDiscoverLabel", "BUILD WITH NEWON")}</p>
        <h2 class="saas-cta__title">${t(flat, flatEn, "studio.saasDiscoverTitle", "필요한 소프트웨어가\n아직 없나요?")}</h2>
        <p class="saas-cta__lead">${t(flat, flatEn, "studio.saasDiscoverLead", "작은 도구부터 업무용 웹 서비스까지\nNewon과 함께 만들 수 있습니다.")}</p>
        <div class="saas-cta__actions">
          <a class="btn btn-primary saas-cta__btn" href="../business/">${t(flat, flatEn, "studio.saasCtaBiz", "프로젝트 문의")} →</a>
          <a class="btn btn-ghost saas-cta__btn saas-cta__btn--ghost" href="../contact/">${t(flat, flatEn, "studio.saasCtaContact", "문의하기")} →</a>
        </div>
      </div>
      <aside class="saas-cta__aside">
        <p class="saas-cta__aside-label">${t(flat, flatEn, "studio.saasToolsBridgeLabel", "LOOKING FOR TOOLS?")}</p>
        <p class="saas-cta__aside-q">${t(flat, flatEn, "studio.saasToolsBridge", "빠르게 사용할 무료 도구를 찾고 있나요?")}</p>
        <p class="saas-cta__aside-lead">${t(flat, flatEn, "studio.saasToolsBridgeLead", "QR, D-Day, Password 등 즉시 쓰는 웹 유틸리티.")}</p>
        <a class="saas-cta__aside-link" href="../tools/">${t(flat, flatEn, "studio.saasCtaTools", "Newon Tools")} →</a>
      </aside>
    </div>
  </section>
</div>`;
}
