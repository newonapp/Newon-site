/**
 * Newon Business hub — editorial Digital Product Studio body.
 * Preserves service routes, #svc-* anchors, #inquiry CTAs.
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { BUSINESS_SERVICES } from "./business-pricing.mjs";
import { HUB_ID_TO_SLUG } from "./business-service-catalog.mjs";

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return v != null && v !== "" ? String(v) : fb;
}

function br(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function isKoFlat(flat, flatEn) {
  const sample = String(
    (flat["studio.svcMvpDesc"] || "") + (flat["business.heroLead"] || "") + (flat["business.indTitle"] || "")
  );
  return /[가-힣]/.test(sample);
}

/** Rich per-service editorial copy (ko / en). Falls back to studio.* keys. */
const SERVICE_EXTRA = {
  mvp: {
    cat: "PRODUCT / MVP",
    valueKo: "아이디어를\n제품으로 바꾸는\n가장 빠른 방법.",
    valueEn: "The fastest path\nfrom idea\nto a real product.",
    bodyKo:
      "아이디어의 핵심 가설을 정의하고 실제로 사용할 수 있는 제품을 만들어 시장 반응을 검증합니다.",
    bodyEn:
      "Define the core hypothesis, build something people can use, and validate market response.",
    caps: ["Product Strategy", "UX Structure", "Web MVP", "Mobile MVP", "Backend", "Launch"],
    fitKo: "새로운 서비스 아이디어 · 스타트업 초기 제품 · 사내 신규 서비스 · 시장 검증용 제품",
    fitEn: "New service ideas · Early startup products · Internal pilots · Market-validation builds",
    ctaKo: "EXPLORE MVP DEVELOPMENT",
    ctaEn: "EXPLORE MVP DEVELOPMENT",
    layout: "split-process",
    visual: ["IDEA", "SCOPE", "BUILD", "TEST", "LAUNCH"],
  },
  website: {
    cat: "WEB / DIGITAL",
    valueKo: "브랜드를 설명하는\n웹이 아니라,\n움직이게 하는 웹.",
    valueEn: "Not a brochure site —\na web experience\nthat moves people.",
    bodyKo:
      "회사 홈페이지부터 제품 랜딩페이지까지 브랜드와 서비스의 목적에 맞는 디지털 경험을 설계하고 구축합니다.",
    bodyEn:
      "From corporate sites to product landings — design and build web experiences that match the job.",
    caps: ["Corporate Website", "Brand Website", "Landing Page", "Responsive", "SEO Foundation", "Analytics"],
    fitKo: "회사·서비스의 공식 웹이 필요한 경우",
    fitEn: "When you need an official company or product web presence",
    ctaKo: "EXPLORE WEBSITE",
    ctaEn: "EXPLORE WEBSITE",
    layout: "web",
    visual: null,
  },
  ai: {
    cat: "AI / AUTOMATION",
    valueKo: "반복되는 일을\n시스템에게 넘깁니다.",
    valueEn: "Hand repetitive work\nto the system.",
    bodyKo:
      "반복 업무와 고객 응대, 콘텐츠 처리와 내부 정보 활용을 분석해 실제로 사용할 수 있는 AI workflow를 구축합니다.",
    bodyEn:
      "Analyze repetitive work, support, and content flows — then build AI workflows people can actually run.",
    caps: [
      "Customer Support",
      "Review Analysis",
      "Content Workflow",
      "Document Summary",
      "Internal AI",
      "Workflow Automation",
    ],
    fitKo: "반복 업무를 자동화하고 싶은 경우",
    fitEn: "When repetitive work should become a reliable workflow",
    ctaKo: "EXPLORE AI AUTOMATION",
    ctaEn: "EXPLORE AI AUTOMATION",
    layout: "ink",
    visual: ["CUSTOMER INQUIRY", "AI", "CLASSIFY", "RESPONSE", "HUMAN REVIEW"],
  },
  app: {
    cat: "MOBILE / PRODUCT",
    valueKo: "앱을 만드는 것에서\n출시까지.",
    valueEn: "From building the app\nto shipping it.",
    bodyKo: "iOS와 Android 제품을 기획부터 UI/UX, 개발, 테스트, 스토어 출시까지 구축합니다.",
    bodyEn: "Plan, design, build, test, and launch iOS and Android products end to end.",
    caps: ["iOS", "Android", "Flutter", "API Integration", "Existing App Improvement", "App Store Launch"],
    fitKo: "실제 iOS/Android 제품이 필요한 경우",
    fitEn: "When you need a real iOS / Android product",
    ctaKo: "EXPLORE APP DEVELOPMENT",
    ctaEn: "EXPLORE APP DEVELOPMENT",
    layout: "pipeline",
    visual: ["DESIGN", "BUILD", "TEST", "STORE"],
  },
  whitelabel: {
    cat: "SYSTEM / B2B",
    valueKo: "하나의 시스템.\n당신의 브랜드.",
    valueEn: "One system.\nYour brand.",
    bodyKo: "검증된 제품 구조를 기반으로 브랜드와 운영 방식에 맞춘 맞춤형 소프트웨어를 제공합니다.",
    bodyEn: "Start from a proven product structure, then tailor brand and operations to your team.",
    caps: ["Reservation", "CRM", "Customer Inquiry", "Dashboard", "AI Assistant", "Operations"],
    fitKo: "기존 구조를 활용해 빠르게 자체 서비스를 만들고 싶은 경우",
    fitEn: "When you want a branded service fast on a proven structure",
    ctaKo: "EXPLORE WHITE-LABEL",
    ctaEn: "EXPLORE WHITE-LABEL",
    layout: "system",
    visual: ["CORE SYSTEM", "CUSTOM BRAND", "CUSTOM WORKFLOW", "YOUR PRODUCT"],
  },
  improve: {
    cat: "OPTIMIZATION / PRODUCT",
    valueKo: "새로 만들지 않아도\n더 좋아질 수 있습니다.",
    valueEn: "You don’t always need\nto rebuild to improve.",
    bodyKo: "이미 운영 중인 앱과 웹의 사용 경험, 전환, 성능과 제품 구조를 분석하고 개선합니다.",
    bodyEn: "Improve UX, conversion, performance, and structure on products already in market.",
    caps: ["UX/UI", "Onboarding", "Conversion", "Performance", "Redesign"],
    fitKo: "이미 있는 앱/웹을 개선하고 싶은 경우",
    fitEn: "When an existing app or web product needs to work better",
    ctaKo: "EXPLORE PRODUCT IMPROVEMENT",
    ctaEn: "EXPLORE PRODUCT IMPROVEMENT",
    layout: "before-after",
    visual: null,
  },
  design: {
    cat: "DESIGN / BRAND",
    valueKo: "제품과 브랜드를\n하나의 경험으로.",
    valueEn: "Product and brand\nas one experience.",
    bodyKo: "브랜드 아이덴티티부터 웹과 앱의 UI/UX까지 일관된 시각 시스템을 설계합니다.",
    bodyEn: "From brand identity to web and app UI/UX — one coherent visual system.",
    caps: ["Brand Identity", "Web Design", "App UI/UX", "Landing Page", "Design System"],
    fitKo: "제품과 브랜드의 시각 체계를 만들고 싶은 경우",
    fitEn: "When product and brand need one clear visual system",
    ctaKo: "EXPLORE DESIGN & BRANDING",
    ctaEn: "EXPLORE DESIGN & BRANDING",
    layout: "type",
    visual: ["BRAND", "PRODUCT", "INTERFACE", "SYSTEM"],
  },
};

const CTA_TYPES = {
  mvp: "MVP",
  website: "Website",
  ai: "AI",
  app: "App",
  whitelabel: "White-label",
  improve: "Maintenance",
  design: "Design",
};

function detailHref(svc) {
  const slug = HUB_ID_TO_SLUG[svc.id];
  return slug ? `${slug}/` : null;
}

function capsList(caps) {
  return caps.map((c) => `<li>${escapeHtml(c)}</li>`).join("");
}

function pipeVisual(steps, variant = "v") {
  if (!steps?.length) return "";
  const cls = variant === "h" ? "bz-pipe bz-pipe--h" : "bz-pipe bz-pipe--v";
  const parts = steps
    .map(
      (s, i) =>
        `<li><span>${escapeHtml(s)}</span>${i < steps.length - 1 ? '<i aria-hidden="true"></i>' : ""}</li>`
    )
    .join("");
  return `<ol class="${cls}" aria-hidden="true">${parts}</ol>`;
}

function browserVisual() {
  return `<div class="bz-browser" aria-hidden="true">
    <div class="bz-browser__chrome"><span></span><span></span><span></span></div>
    <div class="bz-browser__body">
      <div class="bz-browser__hero"></div>
      <div class="bz-browser__lines"><i></i><i></i><i></i></div>
    </div>
  </div>`;
}

function beforeAfter(ko) {
  const before = ko
    ? ["복잡한 UX", "낮은 전환", "느린 흐름", "일관되지 않은 UI"]
    : ["Complex UX", "Low conversion", "Slow flows", "Inconsistent UI"];
  const after = ko
    ? ["Clear UX", "Better Conversion", "Faster Experience", "Consistent Product"]
    : ["Clear UX", "Better Conversion", "Faster Experience", "Consistent Product"];
  return `<div class="bz-ba" aria-hidden="true">
    <div class="bz-ba__col">
      <p class="bz-ba__label">BEFORE</p>
      <ul>${before.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </div>
    <span class="bz-ba__arrow" aria-hidden="true">↓</span>
    <div class="bz-ba__col bz-ba__col--after">
      <p class="bz-ba__label">AFTER</p>
      <ul>${after.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </div>
  </div>`;
}

function typeVisual(steps) {
  return `<div class="bz-typeviz" aria-hidden="true">
    <p class="bz-typeviz__aa">Aa</p>
    <ul>${(steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
  </div>`;
}

function serviceBlock(svc, flat, flatEn, ko) {
  const extra = SERVICE_EXTRA[svc.id];
  const title = t(flat, flatEn, svc.titleKey, svc.id);
  const value = ko ? extra.valueKo : extra.valueEn;
  const body = ko ? extra.bodyKo : extra.bodyEn;
  const fit = ko ? extra.fitKo : extra.fitEn;
  const ctaLabel = (ko ? extra.ctaKo : extra.ctaEn) + " ↗";
  const href = detailHref(svc);
  const type = CTA_TYPES[svc.id] || "Other";
  const fitLabel = ko ? "이런 프로젝트에 적합합니다" : "GOOD FIT FOR";
  const capsLabel = "CAPABILITIES";

  let visual = "";
  if (extra.layout === "split-process" || extra.layout === "ink" || extra.layout === "system") {
    visual = pipeVisual(extra.visual, "v");
  } else if (extra.layout === "pipeline") {
    visual = pipeVisual(extra.visual, "h");
  } else if (extra.layout === "web") {
    visual = browserVisual();
  } else if (extra.layout === "before-after") {
    visual = beforeAfter(ko);
  } else if (extra.layout === "type") {
    visual = typeVisual(extra.visual);
  }

  const cta = href
    ? `<a class="bz-ed__cta" href="${href}" data-analytics="business_cta_click" data-analytics-product="${escapeHtml(svc.id)}">${escapeHtml(ctaLabel)}</a>`
    : `<a class="bz-ed__cta" href="#inquiry" data-inquiry-type="${type}" data-analytics="business_cta_click" data-analytics-product="${escapeHtml(svc.id)}">${escapeHtml(ctaLabel)}</a>`;

  const layoutClass = `bz-ed bz-ed--${extra.layout}`;
  const ink = extra.layout === "ink" ? " is-ink" : "";

  return `<article class="${layoutClass}${ink}" id="svc-${svc.id}">
    <div class="bz-ed__inner">
      <div class="bz-ed__meta">
        <span class="bz-ed__num">${svc.num}</span>
        <span class="bz-ed__cat">${escapeHtml(extra.cat)}</span>
      </div>
      <div class="bz-ed__grid">
        <div class="bz-ed__copy">
          <h3 class="bz-ed__title">${escapeHtml(title)}</h3>
          <p class="bz-ed__value">${br(value)}</p>
          <p class="bz-ed__body">${escapeHtml(body)}</p>
          <div class="bz-ed__caps">
            <p class="bz-ed__k">${capsLabel}</p>
            <ul>${capsList(extra.caps)}</ul>
          </div>
          <div class="bz-ed__fit">
            <p class="bz-ed__k">${escapeHtml(fitLabel)}</p>
            <p>${escapeHtml(fit)}</p>
          </div>
          ${cta}
        </div>
        <div class="bz-ed__visual">${visual}</div>
      </div>
    </div>
  </article>`;
}

function serviceIndex(flat, flatEn) {
  const items = BUSINESS_SERVICES.map((svc) => {
    const title = t(flat, flatEn, svc.titleKey, svc.id);
    return `<a class="bz-sidx__item" href="#svc-${svc.id}">
      <span class="bz-sidx__n">${svc.num}</span>
      <span class="bz-sidx__name">${escapeHtml(title)}</span>
      <span class="bz-sidx__go" aria-hidden="true">→</span>
    </a>`;
  }).join("");
  return `<nav class="bz-sidx" aria-label="Services">
    <div class="bz-inner">
      <div class="bz-sidx__head">
        <p class="bz-ed__k">SERVICES</p>
        <p class="bz-sidx__count">07</p>
      </div>
      <div class="bz-sidx__list">${items}</div>
    </div>
  </nav>`;
}

function heroHtml(flat, flatEn, ko) {
  const title = ko ? "아이디어에서\n실제 제품까지." : "From idea\nto real product.";
  const lead = ko
    ? "기획, 디자인, 개발, 출시와 개선까지.\nNewon이 직접 제품을 만들고 운영한 경험으로\n새로운 디지털 제품을 함께 만듭니다."
    : "Strategy, design, development, launch, and improvement.\nBuilt with the experience of shipping and running\nNewon’s own digital products.";
  const caps = ["PRODUCT STRATEGY", "DESIGN", "DEVELOPMENT", "AI", "LAUNCH"];
  return `<section class="bz-hero bz-hero--ed" aria-labelledby="bz-hero-title">
    <div class="bz-inner bz-hero__stage">
      <p class="bz-ed__k bz-hero__kicker">NEWON BUSINESS</p>
      <div class="bz-hero__grid">
        <div class="bz-hero__copy">
          <h1 class="bz-hero__title" id="bz-hero-title">${br(title)}</h1>
        </div>
        <div class="bz-hero__aside">
          <p class="bz-hero__lead">${br(lead)}</p>
          <ul class="bz-hero__caps">${caps.map((c) => `<li>${c}</li>`).join("")}</ul>
          <div class="bz-hero-actions">
            <a class="bz-hero__btn bz-hero__btn--primary" href="#inquiry">${escapeHtml(ko ? "START A PROJECT ↗" : "START A PROJECT ↗")}</a>
            <a class="bz-hero__btn bz-hero__btn--ghost" href="#services">${escapeHtml(ko ? "EXPLORE SERVICES ↓" : "EXPLORE SERVICES ↓")}</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function industriesHtml(flat, flatEn, ko) {
  const rows = [
    { n: "01", en: "LIFESTYLE", ko: "라이프스타일", tipKo: "Daily tools & consumer products", tipEn: "Daily tools & consumer products" },
    { n: "02", en: "FAMILY", ko: "가족 · 육아", tipKo: "Family management & parenting products", tipEn: "Family management & parenting products" },
    { n: "03", en: "PETS", ko: "반려동물", tipKo: "Pet care & community products", tipEn: "Pet care & community products" },
    { n: "04", en: "PRODUCTIVITY", ko: "생산성", tipKo: "Goals, habits & personal productivity", tipEn: "Goals, habits & personal productivity" },
    { n: "05", en: "FINANCE", ko: "금융 · 생활관리", tipKo: "Personal finance & subscription management", tipEn: "Personal finance & subscription management" },
    { n: "06", en: "TRAVEL", ko: "여행", tipKo: "Travel records & experience products", tipEn: "Travel records & experience products" },
    { n: "07", en: "AI", ko: "AI 서비스", tipKo: "AI-powered consumer & business tools", tipEn: "AI-powered consumer & business tools" },
  ];
  const title = t(flat, flatEn, "business.indTitle", ko ? "다양한 분야의\n가능성을 함께 봅니다" : "We look across\nmany product fields");
  const lead = t(
    flat,
    flatEn,
    "business.indLead",
    ko
      ? "현재 Newon이 직접 만들고 운영하는 제품 경험을 바탕으로, 아래 분야에서 협업을 논의할 수 있습니다."
      : "Based on products Newon builds and operates, we can discuss collaboration in these areas."
  );
  const list = rows
    .map(
      (r) => `<li class="bz-ind__item" tabindex="0">
      <span class="bz-ind__n">${r.n}</span>
      <span class="bz-ind__en">${r.en}</span>
      <span class="bz-ind__ko">${escapeHtml(r.ko)}</span>
      <span class="bz-ind__tip">${escapeHtml(ko ? r.tipKo : r.tipEn)}</span>
    </li>`
    )
    .join("");
  return `<section id="industries" class="bz-section bz-ind bz-reveal" aria-labelledby="bz-ind-title">
    <div class="bz-inner">
      <div class="bz-ind-head">
        <div>
          <p class="bz-ed__k">INDUSTRIES</p>
          <h2 class="bz-title" id="bz-ind-title">${br(title)}</h2>
        </div>
        <p class="bz-lead">${escapeHtml(lead)}</p>
      </div>
      <ol class="bz-ind__list">${list}</ol>
    </div>
  </section>`;
}

function whyHtml(ko) {
  const title = ko ? "직접 만들어본 팀과\n함께 만듭니다." : "Work with a team\nthat ships products.";
  const items = [
    {
      n: "01",
      en: "BUILD & OPERATE",
      ko: "제품을 실제로 만들고 운영하며 얻은 경험을 프로젝트에 적용합니다.",
      enB: "We apply experience from building and operating real products.",
    },
    {
      n: "02",
      en: "GLOBAL BY DESIGN",
      ko: "다국어와 글로벌 배포를 고려한 제품 구조를 설계합니다.",
      enB: "We design for multi-language and global distribution from the start.",
    },
    {
      n: "03",
      en: "FROM IDEA TO RELEASE",
      ko: "기획에서 디자인, 개발과 출시까지 하나의 흐름으로 진행합니다.",
      enB: "Strategy, design, development, and launch stay in one flow.",
    },
    {
      n: "04",
      en: "DIRECT COLLABORATION",
      ko: "불필요한 전달 단계를 줄이고 프로젝트 핵심에 직접 집중합니다.",
      enB: "Fewer handoffs — more focus on the product itself.",
    },
  ];
  return `<section id="why-newon" class="bz-section bz-why bz-reveal" aria-labelledby="bz-why-title">
    <div class="bz-inner">
      <p class="bz-ed__k">WHY NEWON</p>
      <h2 class="bz-title" id="bz-why-title">${br(title)}</h2>
      <ul class="bz-why__grid">
        ${items
          .map(
            (it) => `<li>
          <span class="bz-why__n">${it.n}</span>
          <h3>${it.en}</h3>
          <p>${escapeHtml(ko ? it.ko : it.enB)}</p>
        </li>`
          )
          .join("")}
      </ul>
    </div>
  </section>`;
}

function howHtml(ko) {
  const title = ko ? "이해에서\n개선까지." : "From understanding\nto improvement.";
  const steps = [
    { n: "01", en: "UNDERSTAND", ko: "문제와 목표, 사용자를 이해합니다.", enB: "Understand the problem, goals, and users." },
    { n: "02", en: "DEFINE", ko: "범위와 핵심 기능, 우선순위를 정의합니다.", enB: "Define scope, core features, and priorities." },
    { n: "03", en: "BUILD", ko: "제품 경험을 설계하고 개발합니다.", enB: "Design the experience and build the product." },
    { n: "04", en: "LAUNCH", ko: "테스트 후 배포와 출시를 지원합니다.", enB: "Test, deploy, and support the launch." },
    { n: "05", en: "IMPROVE", ko: "실제 데이터와 피드백으로 제품을 개선합니다.", enB: "Improve with real data and feedback." },
  ];
  return `<section id="how-we-work" class="bz-section bz-how bz-reveal" aria-labelledby="bz-process-title">
    <div class="bz-inner">
      <p class="bz-ed__k">HOW WE WORK</p>
      <h2 class="bz-title" id="bz-process-title">${br(title)}</h2>
      <ol class="bz-how__track">
        ${steps
          .map(
            (s, i) => `<li>
          <span class="bz-how__n">${s.n}</span>
          <h3>${s.en}</h3>
          <p>${escapeHtml(ko ? s.ko : s.enB)}</p>
          ${i < steps.length - 1 ? '<i class="bz-how__join" aria-hidden="true"></i>' : ""}
        </li>`
          )
          .join("")}
      </ol>
    </div>
  </section>`;
}

function portfolioHtml(ko) {
  const title = ko ? "Newon이\n직접 만든 제품들." : "Products\nNewon builds.";
  const lead = ko
    ? "Newon은 자체 앱과 웹 제품, SaaS 실험과 게임을 직접 만들고 운영합니다."
    : "Newon builds and operates its own apps, web products, SaaS experiments, and games.";
  return `<section id="portfolio" class="bz-section bz-port bz-reveal" aria-labelledby="bz-portfolio-title">
    <div class="bz-inner bz-port__grid">
      <div class="bz-port__copy">
        <p class="bz-ed__k">PORTFOLIO</p>
        <h2 class="bz-title" id="bz-portfolio-title">${br(title)}</h2>
        <p class="bz-lead">${escapeHtml(lead)}</p>
        <a class="bz-ed__cta" href="../portfolio/">EXPLORE PORTFOLIO ↗</a>
      </div>
      <a class="bz-port__panel" href="../products/">
        <p class="bz-port__panel-k">NEWON PRODUCTS</p>
        <ul class="bz-port__cats"><li>APPS</li><li>SAAS</li><li>AI</li><li>GAMES</li></ul>
        <ul class="bz-port__loop"><li>BUILD</li><li>SHIP</li><li>LEARN</li><li>IMPROVE</li></ul>
        <span class="bz-port__go">VIEW ALL PRODUCTS ↗</span>
      </a>
    </div>
  </section>`;
}

function projectStartHtml(ko) {
  const title = ko ? "문의 이후 흐름" : "After you reach out";
  const steps = ko
    ? ["문의", "프로젝트 검토", "범위 협의", "제안", "프로젝트 시작"]
    : ["Inquiry", "Review", "Scope", "Proposal", "Kickoff"];
  return `<section id="project-start" class="bz-section bz-start bz-reveal" aria-labelledby="bz-start-title">
    <div class="bz-inner">
      <p class="bz-ed__k">PROJECT START</p>
      <h2 class="bz-title" id="bz-start-title">${escapeHtml(title)}</h2>
      <ol class="bz-start__list">
        ${steps.map((s, i) => `<li><span class="bz-start__n">0${i + 1}</span><span>${escapeHtml(s)}</span></li>`).join("")}
      </ol>
    </div>
  </section>`;
}

function faqHtml(flat, flatEn, ko) {
  const title = t(flat, flatEn, "business.faqTitle", ko ? "궁금한 점을 확인해보세요" : "Frequently asked questions");
  const faqs = ko
    ? [
        ["어떤 단계의 프로젝트부터 문의할 수 있나요?", "아이디어 단계부터 출시 이후 개선까지 가능합니다. 현재 상태를 알려주시면 적합한 범위를 함께 잡습니다."],
        ["아이디어만 있어도 상담이 가능한가요?", "가능합니다. 목표와 제약만 있으면 가설과 MVP 범위를 정리하는 것부터 시작할 수 있습니다."],
        ["기존 앱이나 웹 개선도 가능한가요?", "가능합니다. UX, 전환, 성능, 구조 개선 모두 Product Improvement로 논의할 수 있습니다."],
        ["디자인만 의뢰할 수 있나요?", "가능합니다. 브랜드, 웹, 앱 UI/UX, 디자인 시스템까지 Design & Branding으로 진행할 수 있습니다."],
        ["iOS와 Android를 함께 개발할 수 있나요?", "가능합니다. 네이티브 또는 Flutter 등 제품 목표에 맞는 방식으로 제안합니다."],
        ["AI 기능만 기존 서비스에 추가할 수 있나요?", "가능합니다. 반복 업무·문의·콘텐츠 흐름을 분석한 뒤 실제 운영 가능한 AI workflow로 붙입니다."],
        ["프로젝트 기간은 어떻게 결정되나요?", "범위, 플랫폼, 디자인·개발 깊이, 기존 자산 여부에 따라 달라집니다. 문의 후 범위를 보면 일정을 제안합니다."],
        ["비용은 어떻게 결정되나요?", "고정 단가가 아니라 범위 기준 견적입니다. 필요한 기능과 일정에 맞춰 제안서를 드립니다."],
        ["출시 이후 개선도 가능한가요?", "가능합니다. 출시 후 데이터와 피드백을 바탕으로 개선 사이클을 이어갈 수 있습니다."],
      ]
    : [
        ["What stage can I inquire from?", "From early idea through post-launch improvement. Share where you are and we’ll scope together."],
        ["Can I talk with only an idea?", "Yes. Goals and constraints are enough to start shaping a hypothesis and MVP scope."],
        ["Can you improve an existing app or site?", "Yes — UX, conversion, performance, and structure under Product Improvement."],
        ["Can I commission design only?", "Yes — brand, web, app UI/UX, and design systems under Design & Branding."],
        ["Can you build iOS and Android together?", "Yes. We propose native or Flutter based on product goals."],
        ["Can you add AI to an existing service?", "Yes. We analyze the workflow, then attach a practical AI automation layer."],
        ["How is timeline decided?", "By scope, platforms, depth of design/dev, and existing assets — proposed after review."],
        ["How is pricing decided?", "Scoped quotes, not a fixed menu. We’ll propose based on needs and timeline."],
        ["Can you improve after launch?", "Yes. We can continue with data- and feedback-driven improvement cycles."],
      ];
  const items = faqs
    .map(
      ([q, a], i) => `<details class="bz-faq__item"${i === 0 ? " open" : ""}>
      <summary>${escapeHtml(q)}</summary>
      <p>${escapeHtml(a)}</p>
    </details>`
    )
    .join("");
  return `<section id="faq" class="bz-section bz-faq bz-reveal" aria-labelledby="bz-faq-title">
    <div class="bz-inner">
      <p class="bz-ed__k">FAQ</p>
      <h2 class="bz-title" id="bz-faq-title">${escapeHtml(title)}</h2>
      <div class="bz-faq__list">${items}</div>
    </div>
  </section>`;
}

function closingHtml(ko) {
  const title = ko ? "만들고 싶은 것이\n있다면 이야기해주세요." : "If you want to build\nsomething, tell us.";
  const lead = ko
    ? "아이디어 단계부터 기존 제품 개선까지 프로젝트의 현재 상태를 알려주세요."
    : "From early ideas to improving what already ships — share where the project stands.";
  return `<section class="bz-close bz-reveal" aria-labelledby="bz-band-title">
    <div class="bz-inner bz-close__inner">
      <p class="bz-ed__k bz-ed__k--on-dark">START A PROJECT</p>
      <h2 class="bz-close__title" id="bz-band-title">${br(title)}</h2>
      <p class="bz-close__lead">${escapeHtml(lead)}</p>
      <div class="bz-close__actions">
        <a class="bz-close__btn" href="#inquiry">${escapeHtml(ko ? "프로젝트 문의하기 ↗" : "Start a project ↗")}</a>
        <a class="bz-close__mail" href="mailto:newon@newon.app">newon@newon.app</a>
      </div>
    </div>
  </section>`;
}

/**
 * Full editorial stack: hero → services → industries → why → how → portfolio → process → FAQ → close
 * (Inquiry form remains in the template after this injection.)
 */
export function businessEditorialHtml(flat, flatEn) {
  const ko = isKoFlat(flat, flatEn);
  const services = BUSINESS_SERVICES.map((svc) => serviceBlock(svc, flat, flatEn, ko)).join("\n");

  return `${heroHtml(flat, flatEn, ko)}
${serviceIndex(flat, flatEn)}
<section id="services" class="bz-services-ed" aria-labelledby="bz-services-title">
  <div class="bz-inner bz-services-ed__intro">
    <p class="bz-ed__k">WHAT WE BUILD</p>
    <h2 class="bz-title" id="bz-services-title">${escapeHtml(ko ? "함께 만들 수 있는 디지털 제품" : "Digital products we can build together")}</h2>
  </div>
  ${services}
</section>
${industriesHtml(flat, flatEn, ko)}
${whyHtml(ko)}
${howHtml(ko)}
${portfolioHtml(ko)}
${projectStartHtml(ko)}
${faqHtml(flat, flatEn, ko)}
${closingHtml(ko)}`;
}
