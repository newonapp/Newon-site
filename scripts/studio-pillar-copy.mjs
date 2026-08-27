/**
 * Copy for Studio pillar detail pages: brand / digital / content / ip.
 */
import { STUDIO_IA } from "./venture-studio-data.mjs";

export const STUDIO_PILLAR_SLUGS = ["brand", "digital", "content", "ip"];

const SHARED = {
  ko: {
    crumbStudio: "Studio",
    otherTitle: "OTHER STUDIO AREAS",
    ctaEyebrow: "HAVE A PROJECT?",
    ctaTitle: "브랜드와 제품이 세상에 보이는 방식을 함께 만듭니다.",
    ctaLead: "아이디어 단계여도 괜찮습니다. 필요한 범위부터 함께 정리합니다.",
    ctaBtn: "프로젝트 문의 →",
    servicesLabel: "서비스",
    processLabel: "PROCESS",
    faqLabel: "FAQ",
    quoteCta: "프로젝트 문의 →",
    whatWeBuild: "무엇을 하나요",
    recommendedFor: "이런 분께",
    included: "포함",
    deliverables: "결과물",
    timeline: "예상 기간",
    detailCta: "자세히 보기 →",
    soonBtn: "준비 중",
    comingSoon: "준비중",
    comingSoonLead: "이 서비스 상세는 곧 공개됩니다.",
    ctaPrimary: "프로젝트 시작하기 →",
    ctaSecondary: "작업 범위 보기 ↓",
  },
  en: {
    crumbStudio: "Studio",
    otherTitle: "OTHER STUDIO AREAS",
    ctaEyebrow: "HAVE A PROJECT?",
    ctaTitle: "Let's shape how your brand and product show up in the world.",
    ctaLead: "Even at the idea stage. We start by clarifying the scope you need.",
    ctaBtn: "Project inquiry →",
    servicesLabel: "Services",
    processLabel: "PROCESS",
    faqLabel: "FAQ",
    quoteCta: "Project inquiry →",
    whatWeBuild: "What we do",
    recommendedFor: "Recommended for",
    included: "Included",
    deliverables: "Deliverables",
    timeline: "Estimated timeline",
    detailCta: "View details →",
    soonBtn: "Coming soon",
    comingSoon: "Coming soon",
    comingSoonLead: "This service detail will be available shortly.",
    ctaPrimary: "Start a project →",
    ctaSecondary: "View scope ↓",
  },
};

const PILLAR_META = {
  brand: {
    ko: {
      seoTitle: "BRAND | Newon Studio",
      metaDescription:
        "Newon Studio BRAND — 브랜드 전략, 네이밍, 아이덴티티, 로고. 브랜드의 방향과 정체성을 하나의 시스템으로 설계합니다.",
      eyebrow: "NEWON STUDIO · BRAND",
      headline: "브랜드의 방향과 정체성을 만듭니다.",
      lead: "브랜드가 어디로 가야 하는지부터 이름, 색, 타이포, 로고까지 — 세상에 보이는 방식을 하나의 방향으로 설계합니다.",
      process: [
        { n: "01", t: "DISCOVER", d: "브랜드와 문제 이해" },
        { n: "02", t: "DEFINE", d: "방향과 핵심 메시지 정의" },
        { n: "03", t: "DESIGN", d: "정체성과 시각 언어 설계" },
        { n: "04", t: "DELIVER", d: "실제 사용 가능한 결과물 전달" },
      ],
      faq: [
        { q: "브랜딩만 따로 의뢰할 수 있나요?", a: "가능합니다. 전략만, 네이밍만, 로고만 등 필요한 범위로 진행할 수 있습니다." },
        { q: "기존 브랜드를 개선할 수도 있나요?", a: "가능합니다. 현재 브랜드 자산과 목표를 확인한 뒤 개선 범위를 제안합니다." },
        { q: "결과물은 어떤 형태인가요?", a: "브랜드 가이드, 로고 파일, 컬러·타이포 시스템 등 실무에 바로 쓸 수 있는 형태로 전달합니다." },
        { q: "제품 개발과 함께할 수 있나요?", a: "가능합니다. 브랜드 설계 후 웹·앱·콘텐츠로 자연스럽게 이어갈 수 있습니다." },
      ],
    },
    en: {
      seoTitle: "BRAND | Newon Studio",
      metaDescription:
        "Newon Studio BRAND — strategy, naming, identity, and logo systems that define how your brand shows up.",
      eyebrow: "NEWON STUDIO · BRAND",
      headline: "Shape brand direction and identity.",
      lead: "From where the brand should go to name, color, type, and logo — one coherent system for how you show up.",
      process: [
        { n: "01", t: "DISCOVER", d: "Understand brand and problem" },
        { n: "02", t: "DEFINE", d: "Set direction and core messages" },
        { n: "03", t: "DESIGN", d: "Design identity and visual language" },
        { n: "04", t: "DELIVER", d: "Hand over usable deliverables" },
      ],
      faq: [
        { q: "Can we hire for branding only?", a: "Yes — strategy, naming, logo, or identity only, scoped to what you need." },
        { q: "Can you refresh an existing brand?", a: "Yes. We review current assets and goals, then propose an improvement scope." },
        { q: "What do we receive?", a: "Brand guides, logo files, color and type systems — ready for production use." },
        { q: "Can this connect to product work?", a: "Yes. Brand can flow into web, app, and content as one direction." },
      ],
    },
  },
  digital: {
    ko: {
      seoTitle: "DIGITAL | Newon Studio",
      metaDescription:
        "Newon Studio DIGITAL — 웹 디자인, 앱 UI/UX, 랜딩, 제품 디자인. 브랜드와 서비스를 연결하는 디지털 경험을 설계합니다.",
      eyebrow: "NEWON STUDIO · DIGITAL",
      headline: "웹과 제품 경험을 설계합니다.",
      lead: "웹사이트, 앱, 랜딩페이지, 제품 인터페이스까지 — 사용자가 실제로 경험하는 디지털 화면을 하나의 흐름으로 만듭니다.",
      process: [
        { n: "01", t: "DISCOVER", d: "목표와 사용자 흐름 파악" },
        { n: "02", t: "DEFINE", d: "정보 구조와 핵심 화면 정의" },
        { n: "03", t: "DESIGN", d: "UI/UX 및 인터랙션 설계" },
        { n: "04", t: "HANDOFF", d: "개발·구현을 위한 전달" },
      ],
      faq: [
        { q: "디자인만 의뢰할 수 있나요?", a: "가능합니다. UI/UX 설계와 프로토타입까지 범위를 맞춰 진행할 수 있습니다." },
        { q: "개발도 함께 하나요?", a: "Newon Business BUILD와 연결해 설계부터 구현까지 이어갈 수 있습니다." },
        { q: "기존 제품 개선도 가능한가요?", a: "가능합니다. UX 감사와 화면 개선 범위를 함께 정리합니다." },
        { q: "반응형·모바일도 포함되나요?", a: "포함됩니다. 사용 환경에 맞는 레이아웃과 컴포넌트를 설계합니다." },
      ],
    },
    en: {
      seoTitle: "DIGITAL | Newon Studio",
      metaDescription:
        "Newon Studio DIGITAL — web design, app UI/UX, landing pages, and product design for connected digital experiences.",
      eyebrow: "NEWON STUDIO · DIGITAL",
      headline: "Design web and product experience.",
      lead: "Websites, apps, landing pages, and product UI — digital surfaces users actually experience, as one flow.",
      process: [
        { n: "01", t: "DISCOVER", d: "Goals and user flows" },
        { n: "02", t: "DEFINE", d: "Structure and key screens" },
        { n: "03", t: "DESIGN", d: "UI/UX and interaction" },
        { n: "04", t: "HANDOFF", d: "Ready for build" },
      ],
      faq: [
        { q: "Design only?", a: "Yes — UI/UX and prototype scoped to your needs." },
        { q: "Do you also build?", a: "We can connect to Newon Business BUILD from design through implementation." },
        { q: "Can you improve an existing product?", a: "Yes — UX review and screen improvements with a clear scope." },
        { q: "Is responsive/mobile included?", a: "Yes — layouts and components for each environment." },
      ],
    },
  },
  content: {
    ko: {
      seoTitle: "CONTENT | Newon Studio",
      metaDescription:
        "Newon Studio CONTENT — 소셜 콘텐츠, 캠페인, 비주얼 에셋. 브랜드를 보여주는 콘텐츠와 비주얼을 기획·제작합니다.",
      eyebrow: "NEWON STUDIO · CONTENT",
      headline: "브랜드 콘텐츠와 비주얼을 만듭니다.",
      lead: "소셜 채널, 캠페인, 출시 프로모션에 맞는 메시지와 비주얼을 기획하고 브랜드가 실제로 보이는 형태로 제작합니다.",
      process: [
        { n: "01", t: "DISCOVER", d: "채널과 목표 파악" },
        { n: "02", t: "DEFINE", d: "메시지와 포맷 정의" },
        { n: "03", t: "CREATE", d: "비주얼·콘텐츠 제작" },
        { n: "04", t: "DELIVER", d: "채널별 에셋 전달" },
      ],
      faq: [
        { q: "콘텐츠만 따로 의뢰할 수 있나요?", a: "가능합니다. 소셜, 캠페인, 비주얼 중 필요한 범위로 진행합니다." },
        { q: "브랜드 작업과 함께해야 하나요?", a: "기존 브랜드가 있으면 그에 맞추고, 없으면 Brand 영역과 함께 진행할 수 있습니다." },
        { q: "영상·모션도 포함되나요?", a: "범위에 따라 가능합니다. 필요 시 모션·짧은 영상 에셋을 포함할 수 있습니다." },
        { q: "채널별 포맷도 맞춰주나요?", a: "각 채널 규격에 맞는 크기와 포맷으로 전달합니다." },
      ],
    },
    en: {
      seoTitle: "CONTENT | Newon Studio",
      metaDescription:
        "Newon Studio CONTENT — social content, campaigns, and visual assets that show your brand in the world.",
      eyebrow: "NEWON STUDIO · CONTENT",
      headline: "Create brand content and visuals.",
      lead: "Message and visuals for social, campaigns, and launches — planned and produced so the brand actually shows up.",
      process: [
        { n: "01", t: "DISCOVER", d: "Channels and goals" },
        { n: "02", t: "DEFINE", d: "Message and formats" },
        { n: "03", t: "CREATE", d: "Visual and content production" },
        { n: "04", t: "DELIVER", d: "Channel-ready assets" },
      ],
      faq: [
        { q: "Content only?", a: "Yes — social, campaign, or visual scope as needed." },
        { q: "Must we do brand first?", a: "We can align to an existing brand or run Brand in parallel." },
        { q: "Motion or video?", a: "Possible by scope — short motion or video assets when needed." },
        { q: "Channel-specific formats?", a: "Delivered sized and formatted for each channel." },
      ],
    },
  },
  ip: {
    ko: {
      seoTitle: "IP | Newon Studio",
      metaDescription:
        "Newon Studio IP — 캐릭터 랩, 디지털 스티커, Newon 캐릭터, 실험 IP. 새로운 IP와 캐릭터 가능성을 탐색합니다.",
      eyebrow: "NEWON STUDIO · IP",
      headline: "캐릭터와 새로운 IP를 실험합니다.",
      lead: "캐릭터 콘셉트부터 디지털 표현, 스티커, 실험적 IP까지 — 아직 정의되지 않은 가능성을 빠르게 형태로 만들어 봅니다.",
      process: [
        { n: "01", t: "EXPLORE", d: "콘셉트와 방향 탐색" },
        { n: "02", t: "SKETCH", d: "캐릭터·IP 초안 제작" },
        { n: "03", t: "TEST", d: "표현·포맷 실험" },
        { n: "04", t: "EXPAND", d: "확장 가능한 IP 형태 정리" },
      ],
      faq: [
        { q: "IP 프로젝트는 어떻게 시작하나요?", a: "캐릭터 랩 또는 짧은 브리핑으로 방향을 정한 뒤 실험 범위를 설정합니다." },
        { q: "상업적 이용이 가능한가요?", a: "범위와 라이선스는 프로젝트별로 협의합니다." },
        { q: "스티커·굿즈까지 가능한가요?", a: "디지털 스티커 등은 준비 중이며, 범위에 따라 확장 가능합니다." },
        { q: "Character Lab과의 관계는?", a: "Character Lab은 Newon IP 실험 공간입니다. 랩 페이지에서 진행 중인 실험을 볼 수 있습니다." },
      ],
    },
    en: {
      seoTitle: "IP | Newon Studio",
      metaDescription:
        "Newon Studio IP — character lab, digital stickers, Newon characters, and experimental IP explorations.",
      eyebrow: "NEWON STUDIO · IP",
      headline: "Experiment with characters and new IP.",
      lead: "From character concepts to digital expression, stickers, and experimental IP — we shape possibilities still being defined.",
      process: [
        { n: "01", t: "EXPLORE", d: "Concept and direction" },
        { n: "02", t: "SKETCH", d: "Character and IP drafts" },
        { n: "03", t: "TEST", d: "Format experiments" },
        { n: "04", t: "EXPAND", d: "Expandable IP form" },
      ],
      faq: [
        { q: "How do IP projects start?", a: "Character Lab or a short brief to set direction and experiment scope." },
        { q: "Commercial use?", a: "Scope and licensing are agreed per project." },
        { q: "Stickers or goods?", a: "Digital stickers are in progress; expansion by scope." },
        { q: "What is Character Lab?", a: "Newon's IP experiment space — see ongoing work on the lab page." },
      ],
    },
  },
};

function shortTab(title) {
  const t = String(title || "");
  if (t.length <= 12) return t.toUpperCase();
  return t.split(/\s+/)[0].toUpperCase();
}

function hrefFromStudioPillar(href) {
  if (!href) return "";
  if (href.startsWith("#")) return href;
  if (href.startsWith("resources/")) return `../../${href}`;
  if (href.startsWith("business/")) return `../../${href}`;
  if (href.startsWith("studio/")) return `../${href.slice("studio/".length)}`;
  return `../../${href}`;
}

function servicesFromIA(col, lang) {
  return (col.items || []).map((it) => {
    const title = lang === "ko" && it.titleKo ? it.titleKo : it.title;
    const desc = lang === "ko" ? it.desc || it.descEn : it.descEn || it.desc || "";
    const ready = !it.status || it.status === "OPERATING" || it.status === "LIVE";
    const genericFor =
      lang === "ko"
        ? "브랜드·제품·콘텐츠가 하나의 방향으로 보이길 원하는 팀."
        : "Teams that want brand, product, and content aligned in one direction.";
    return {
      title: title.toUpperCase(),
      tab: shortTab(title),
      href: hrefFromStudioPillar(it.href),
      summary: desc,
      what: desc,
      for: genericFor,
      included:
        lang === "ko"
          ? "방향 정리 · 핵심 산출물 · 실무 활용 가이드"
          : "Direction · core deliverables · practical usage guide",
      deliverables:
        lang === "ko" ? "설계 문서, 시각 에셋, 전달 파일" : "Briefs, visual assets, delivery files",
      timeline: lang === "ko" ? "범위에 따라 1–4주" : "Typically 1–4 weeks by scope",
      ready,
    };
  });
}

function headlineFromIA(col, lang) {
  const meta = PILLAR_META[col.id];
  if (meta?.[lang]?.headline) return meta[lang].headline;
  return col.labelFb || col.id.toUpperCase();
}

export function getStudioPillarCopy(slug, lang) {
  const col = STUDIO_IA.find((c) => c.id === slug);
  const meta = PILLAR_META[slug];
  if (!col || !meta) return null;
  const pageLang = lang === "ko" ? "ko" : "en";
  const shared = SHARED[pageLang];
  const local = meta[pageLang] || meta.en;
  return {
    ...shared,
    ...local,
    slug,
    _pageLang: pageLang,
    crumbBusiness: shared.crumbStudio,
    services: servicesFromIA(col, pageLang),
    headline: local.headline || headlineFromIA(col, pageLang),
  };
}
