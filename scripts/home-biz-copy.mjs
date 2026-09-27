/**
 * Scroll-story homepage copy (below hero) — KO / EN.
 * Business order, names, routes and status come from newon-business-units.mjs
 * (the same six businesses as About). Edit status there, copy here.
 */
import { BUSINESS_UNITS, getCompanyNumbers, nextBusinessName } from "./newon-business-units.mjs";

/** Status per business-unit id (derived from the shared business config). */
export const STORY_STATUS_BY_ID = Object.fromEntries(BUSINESS_UNITS.map((u) => [u.id, u.status]));

function numbersLine(lang) {
  const n = getCompanyNumbers();
  return lang === "ko"
    ? `앱 ${n.apps}개 · 서비스 ${n.services} · ${n.countries}개국 출시 · ${n.languages}개 언어 지원.`
    : `${n.apps} apps · ${n.services} services · launched in ${n.countries} countries · up to ${n.languages} languages.`;
}

const KO_BODY = {
  apps: {
    cat: "APPS · GAMES · NEWON+",
    titleHtml: "일상에 쓰는 앱을<br />하나로 연결합니다.",
    lead: "개인과 가족이 쓰는 생활 앱과 게임 404: HUMAN을 출시·운영하고, Newon+ 통합 계정으로 로그인을 연결하는 디지털 제품 사업입니다.",
    keys: ["생활 앱", "Games", "Newon+"],
    tone: "consumer",
    cta: "앱 둘러보기",
    visualCap: "운영 중인 Newon 앱 · Newon+ 계정 연결",
    note: "생활 앱, 게임, SaaS와 Newon+를 Apps 안에서 운영하고 관리합니다.",
  },
  ai: {
    cat: "PERSONAL AI · ENTERPRISE AI",
    titleHtml: "개인과 기업을 위한<br />AI.",
    lead: "Personal AI는 Newon 앱 안에서 일부 제공 중이며, 기업 업무를 위한 Enterprise AI는 개발 예정입니다. AI Agent는 향후 방향입니다.",
    keys: ["Personal AI", "Enterprise AI", "AI Agent · 향후"],
    tone: "ai",
    cta: "AI 서비스 알아보기",
    note: "개인의 일상부터 기업의 업무까지, 다양한 상황에 필요한 AI 서비스를 만들어갑니다.",
  },
  livon: {
    cat: "LIFE JOURNEY PLATFORM",
    titleHtml: "인생의 처음을<br />준비하고 연결합니다.",
    lead: "10대부터 70대 이상까지 진로·경제생활·취업·독립·가족·건강·은퇴 등 생애 상황을 연결하는 생애주기 생활 플랫폼을 준비하고 있습니다.",
    keys: ["10대~70대+", "생애 상황", "생활 준비"],
    tone: "life",
    cta: "LivOn 알아보기",
    note: "진로와 취업, 독립과 가족, 건강과 은퇴까지. 인생의 새로운 순간에 필요한 정보와 서비스를 연결합니다.",
  },
  ongil: {
    nameKo: "온길",
    cat: "CARE PLATFORM",
    titleHtml: "어르신의 돌봄과<br />일상을 잇습니다.",
    lead: "일상생활 지원, 건강·돌봄, 가족 연결, 지역 생활을 잇는 돌봄 중심 플랫폼을 준비하고 있습니다.",
    keys: ["일상 지원", "건강·돌봄", "가족 연결"],
    tone: "ongil",
    cta: "Ongil 알아보기",
    note: "어르신의 돌봄과 안전, 건강과 일상생활을 지원하고, 가족과 필요한 서비스를 연결합니다.",
  },
  business: {
    cat: "BUILD · AUTOMATION · SOLUTIONS · CARE",
    titleHtml: "기업과 소상공인을 위한<br />개발 · 자동화.",
    lead: "웹·앱 구축, 업무 자동화, 기업 맞춤 솔루션, 출시 이후 Care까지. 기업과 소상공인을 위한 개발·기술 사업입니다.",
    keys: ["Build", "Automation", "Solutions", "Care"],
    tone: "biz",
    cta: "비즈니스 솔루션 알아보기",
    note: "기업과 소상공인의 업무를 더 효율적으로 운영할 수 있도록 개발·자동화·솔루션을 제공합니다.",
  },
  studio: {
    cat: "BRAND · DESIGN · CONTENT",
    titleHtml: "브랜드와 디자인,<br />콘텐츠를 만듭니다.",
    lead: "브랜드, 디지털 디자인(Design Only), 콘텐츠·캠페인, 크리에이티브 랩, 디자인 케어. 브랜드와 크리에이티브를 담당하는 사업입니다.",
    keys: ["Brand", "Digital Design", "Content & Campaign"],
    tone: "studio",
    cta: "스튜디오 둘러보기",
    note: "개발·구축은 Newon Business, 브랜드·디자인·콘텐츠는 Newon Studio가 담당합니다.",
  },
};

const EN_BODY = {
  apps: {
    cat: "APPS · GAMES · NEWON+",
    titleHtml: "Everyday apps,<br />one Newon account.",
    lead: "Everyday apps for people and families plus the game 404: HUMAN — live today, with sign-in connected through a Newon+ account.",
    keys: ["Life apps", "Games", "Newon+"],
    tone: "consumer",
    cta: "Explore apps",
    visualCap: "Live Newon apps · Newon+ account connection",
    note: "Apps, games, SaaS, and Newon+ are run and managed within Newon Apps.",
  },
  ai: {
    cat: "PERSONAL AI · ENTERPRISE AI",
    titleHtml: "AI for people<br />and companies.",
    lead: "Personal AI is partly available inside Newon apps. Enterprise AI for company work is planned. AI agents are a future direction.",
    keys: ["Personal AI", "Enterprise AI", "AI Agent · later"],
    tone: "ai",
    cta: "Explore AI services",
    note: "From everyday life to company work, we build the AI services each situation needs.",
  },
  livon: {
    cat: "LIFE JOURNEY PLATFORM",
    titleHtml: "Prepare life’s<br />first moments.",
    lead: "A life-journey platform in preparation for teens through people in their seventies and beyond — career, money, work, independence, family, health, and retirement.",
    keys: ["Teens to 70s+", "Life moments", "Getting ready"],
    tone: "life",
    cta: "Explore LivOn",
    note: "From career and work to independence, family, health, and retirement — we connect what each new life moment needs.",
  },
  ongil: {
    nameKo: "Ongil",
    cat: "CARE PLATFORM",
    titleHtml: "Care and daily life<br />for older adults.",
    lead: "A care-centred platform in preparation for daily-life support, health and care, family connection, and local living.",
    keys: ["Daily support", "Health & care", "Family"],
    tone: "ongil",
    cta: "Explore Ongil",
    note: "We support older adults’ care, safety, health, and daily life — and connect families with the services they need.",
  },
  business: {
    cat: "BUILD · AUTOMATION · SOLUTIONS · CARE",
    titleHtml: "Development and automation<br />for companies.",
    lead: "Web and app builds, workflow automation, custom solutions, and Care after launch — the development and technology business for companies and small businesses.",
    keys: ["Build", "Automation", "Solutions", "Care"],
    tone: "biz",
    cta: "Explore business solutions",
    note: "We build, automate, and maintain the software companies and small businesses run on.",
  },
  studio: {
    cat: "BRAND · DESIGN · CONTENT",
    titleHtml: "Brand, design,<br />and content.",
    lead: "Brand, Digital Design (design only), Content & Campaign, Creative Lab, and Design Care — the brand and creative business.",
    keys: ["Brand", "Digital Design", "Content & Campaign"],
    tone: "studio",
    cta: "Explore Studio",
    note: "Newon Business handles development and builds; Newon Studio handles brand, design, and content.",
  },
};

function buildStories(body) {
  return BUSINESS_UNITS.map((u) => ({
    id: u.id,
    n: u.n,
    name: u.name,
    ctaHref: u.path,
    next: nextBusinessName(u.id),
    ...body[u.id],
  }));
}

export const STORY_KO = {
  railAria: "사업 바로가기",
  nextLabel: "다음",
  plannedNote: "확장 계획",
  statusLabels: {
    live: "운영 중",
    partial: "일부 제공 중",
    preparing: "준비 중",
    progress: "진행 중",
    planned: "확장 계획",
    playable: "플레이 가능",
  },
  stories: buildStories(KO_BODY),
  rail: BUSINESS_UNITS.map((u) => ({ id: u.id, label: u.short })),
  eco: {
    id: "story-ecosystem",
    kicker: "ONE NEWON",
    titleHtml: "여섯 가지 사업.<br />각각의 역할이 다릅니다.",
    lead: "생활 앱과 게임, 개인·기업 AI, 생애주기 플랫폼, 돌봄 플랫폼, 기업 개발·자동화, 브랜드·디자인. 대상과 역할이 다른 여섯 사업을 운영하고 준비합니다.",
    note: `${numbersLine("ko")} 출시된 생활 앱과 404: HUMAN, Business·Studio 프로젝트는 지금 이용할 수 있습니다. LivOn과 Ongil은 준비 단계이며, Newon AI의 AI Agent는 향후 방향입니다.`,
    center: "NEWON",
    ctaAbout: "Newon 알아보기",
    ctaAboutHref: "about/",
    ctaInquiry: "프로젝트 문의하기",
    ctaInquiryHref: "business/inquiry/",
  },
};

export const STORY_EN = {
  railAria: "Jump to business",
  nextLabel: "Next",
  plannedNote: "Expansion plan",
  statusLabels: {
    live: "Live",
    partial: "Partly live",
    preparing: "In preparation",
    progress: "In progress",
    planned: "Expansion plan",
    playable: "Playable",
  },
  stories: buildStories(EN_BODY),
  rail: BUSINESS_UNITS.map((u) => ({ id: u.id, label: u.short })),
  eco: {
    id: "story-ecosystem",
    kicker: "ONE NEWON",
    titleHtml: "Six businesses.<br />Six different jobs.",
    lead: "Life apps and games, personal and company AI, a life-journey platform, a care platform, company development and automation, and brand and design. Each business has a different customer and role.",
    note: `${numbersLine("en")} Live apps, 404: HUMAN, and Business and Studio projects are available now. LivOn and Ongil are in preparation. Newon AI agents are a future direction.`,
    center: "NEWON",
    ctaAbout: "About Newon",
    ctaAboutHref: "about/",
    ctaInquiry: "Start a project",
    ctaInquiryHref: "business/inquiry/",
  },
};

/** CTA labels for non-KO/EN locales (story body stays EN; CTAs localize). */
const STORY_CTA_I18N = {
  ja: {
    apps: "アプリを見る",
    ai: "AIサービスを見る",
    livon: "LivOnを見る",
    ongil: "Ongilを見る",
    business: "ビジネスソリューションを見る",
    studio: "Studioを見る",
  },
  es: {
    apps: "Explorar apps",
    ai: "Conocer servicios de IA",
    livon: "Conocer LivOn",
    ongil: "Conocer Ongil",
    business: "Explorar soluciones business",
    studio: "Explorar Studio",
  },
  "pt-br": {
    apps: "Explorar apps",
    ai: "Conhecer serviços de IA",
    livon: "Conhecer LivOn",
    ongil: "Conhecer Ongil",
    business: "Explorar soluções business",
    studio: "Explorar Studio",
  },
  fr: {
    apps: "Découvrir les apps",
    ai: "Découvrir les services IA",
    livon: "Découvrir LivOn",
    ongil: "Découvrir Ongil",
    business: "Découvrir les solutions business",
    studio: "Découvrir Studio",
  },
  de: {
    apps: "Apps entdecken",
    ai: "KI-Services entdecken",
    livon: "LivOn entdecken",
    ongil: "Ongil entdecken",
    business: "Business-Lösungen entdecken",
    studio: "Studio entdecken",
  },
  hi: {
    apps: "ऐप्स देखें",
    ai: "AI सेवाएँ जानें",
    livon: "LivOn जानें",
    ongil: "Ongil जानें",
    business: "बिज़नेस समाधान जानें",
    studio: "Studio देखें",
  },
  id: {
    apps: "Jelajahi aplikasi",
    ai: "Pelajari layanan AI",
    livon: "Pelajari LivOn",
    ongil: "Pelajari Ongil",
    business: "Pelajari solusi bisnis",
    studio: "Jelajahi Studio",
  },
};

export function getStoryCopy(lang) {
  const base = lang === "ko" ? STORY_KO : STORY_EN;
  const ctaMap = STORY_CTA_I18N[lang] || null;
  const stories = base.stories.map((s) => {
    const next = {
      ...s,
      status: STORY_STATUS_BY_ID[s.id] || "planned",
    };
    if (ctaMap && ctaMap[s.id]) next.cta = ctaMap[s.id];
    return next;
  });
  return { ...base, stories };
}
