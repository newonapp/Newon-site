function parentIsKo() {
  try {
    return /^\/ko(\/|$)/.test(window.parent.location.pathname);
  } catch {
    return false;
  }
}

export const isKo =
  parentIsKo() ||
  /^\/ko(\/|$)/.test(window.location.pathname) ||
  new URLSearchParams(window.location.search).get("lang") === "ko";

const en = {
  htmlLang: "en",
  title: "Nawon — App Developer & Digital Creator",
  nav: [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#projects", label: "Projects" },
    { href: "#contact", label: "Contact" },
  ],
  heroTitle: "Hi, i'm nawon",
  heroRole: "App developer & digital creator",
  heroLine: "I build digital products that make everyday life better.",
  viewWork: "View my work",
  contactMe: "Contact me",
  selectedWork: "Selected work",
  aboutHeading: "About me",
  aboutText:
    "Hello, I'm Nawon. I am an app developer and creator who turns problems found in everyday life into digital products. I like shaping an idea, designing the experience, and building it into a real service. Through Newon, I create and operate lifestyle apps and digital services.",
  numbersHeading: "In numbers",
  stats: [
    { value: "11", label: "Apps", note: "Live on the stores." },
    { value: "13+", label: "Products", note: "Apps, a game, and the web." },
    { value: "13", label: "Languages", note: "Newon services, across locales." },
    { value: "177", label: "Countries", note: "App store reach." },
  ],
  processHeading: "The process",
  process: [
    { title: "Idea", body: "Find the problem and the possibility." },
    { title: "Planning", body: "Define the people and the core features." },
    { title: "UX/UI", body: "Shape the structure and the interface." },
    { title: "Build", body: "Make the actual product." },
    { title: "Launch", body: "Publish to the stores and the web." },
    { title: "Operate", body: "Learn from feedback and update." },
    { title: "Grow", body: "Content, marketing, and experiments." },
  ],
  workflowTitle: "AI speeds the work. Judgment stays human.",
  workflowBody: "AI speeds research, writing, development, and QA. Problem definition, priorities, and final calls stay with product judgment.",
  principlesHeading: "How I work",
  principles: [
    { n: "01", title: "Ship real products", body: "Ideas don't stop at screens. They reach launch." },
    { n: "02", title: "Keep the core simple", body: "Start with the core problem and the essential features." },
    { n: "03", title: "Learn after launch", body: "What happens after launch shapes the next improvement." },
    { n: "04", title: "Build systems", body: "Think in the structure of the whole product." },
    { n: "05", title: "Keep moving", body: "Execution and iteration come before waiting for perfect." },
  ],
  servicesHeading: "What I do",
  services: [
    { number: "01", name: "App Development", body: "Planning, building, and operating mobile apps." },
    { number: "02", name: "Web Development", body: "Responsive websites and web services." },
    { number: "03", name: "UI/UX Design", body: "User flows, interfaces, and digital experiences." },
    { number: "04", name: "Brand & Digital Design", body: "Brand identity and digital content." },
    { number: "05", name: "Product Building", body: "From an idea through planning, making, launch, and improvement." },
  ],
  projectsHeading: "Selected projects",
  livePage: "Live page",
  role: "Planning, interface, and product development",
  projects: [
    { type: "Live", name: "Apps", role: "Planning · UI/UX · Development", summary: "11 launched apps for habit, money, health, family, and travel. I plan, design, and build them. Links between apps expand in stages.", slogan: ["Everyday apps you need,", "in one Newon."], lead: "OX MONTH turns a daily O/X into a habit record. I planned the flow, designed the screens, and still operate the shipped app." },
    { type: "In progress", name: "AI", summary: "AI features in some apps are available now. Enterprise automation and an AI Agent are a later direction.", slogan: ["Closer AI,", "for your everyday life."], lead: "From everyday questions to planning and action. We build AI that understands personal life and stays with you." },
    { type: "In preparation", name: "LivOn", summary: "A platform in preparation, connecting information and living services from the teens through the 70s.", slogan: ["At every stage of life,", "the next thing you need."], lead: "From the teens through the 70s. A life-stage platform for first experiences, life changes, and new beginnings." },
    { type: "In preparation", name: "Ongil", summary: "A living platform in preparation for seniors’ daily life, care support, and family connection.", slogan: ["Warm connection,", "through the years of daily life."], lead: "Daily life, health, and care — connected with family and community." },
    { type: "Service", name: "Business", summary: "Software for companies and operators, from automation through operations and improvement. Build · Automation · Solutions · Care", slogan: ["Expanding what business can do,", "with technology."], lead: "From enterprise software to AI and work automation. We build digital solutions that connect how companies operate and grow." },
    { type: "Service", name: "Studio", summary: "Identity, screens, and content, designed as design work. Brand · UI/UX · Content", slogan: ["From idea to reality,", "from experience to new value."], lead: "From brand planning to design and development. We turn thinking into real digital experiences." },
    { type: "Playable", name: "Games", summary: "404: HUMAN is a choice-driven interactive game where you survive as the last human in an AI-only world.", slogan: ["In a world of AI,", "hide that you are the last human."], lead: "Answer questions, choose actions, and evade AI suspicion. Every choice you make is remembered." },
  ],
  contactHeading: "Let's build something great.",
  contactLead: "Have a project in mind?",
  contactTalk: "Let's talk.",
  blog: "Blog",
  portraitAlt: "Nawon",
};

const ko = {
  htmlLang: "ko",
  title: "경나원 — 앱 개발자 · 디지털 크리에이터",
  nav: [
    { href: "#about", label: "소개" },
    { href: "#services", label: "서비스" },
    { href: "#projects", label: "프로젝트" },
    { href: "#contact", label: "문의" },
  ],
  heroTitle: "Hi, i'm nawon",
  heroRole: "App developer & digital creator",
  heroLine: "일상을 더 나아지게 하는 디지털 제품을 만듭니다.",
  viewWork: "View my work",
  contactMe: "Contact me",
  selectedWork: "Selected work",
  aboutHeading: "About me",
  aboutText:
    "안녕하세요, 경나원입니다. 일상에서 발견한 문제를 디지털 제품으로 해결하는 앱 개발자이자 크리에이터입니다. 아이디어를 기획하고, 사용자 경험을 설계하며, 실제 서비스로 구현하는 과정을 좋아합니다. Newon을 통해 다양한 생활 앱과 디지털 서비스를 만들고 운영하고 있습니다.",
  servicesHeading: "What I do",
  services: [
    { number: "01", name: "앱 개발", body: "모바일 앱을 기획하고, 만들고, 운영합니다." },
    { number: "02", name: "웹 개발", body: "반응형 웹사이트와 웹 서비스를 만듭니다." },
    { number: "03", name: "UI/UX 디자인", body: "사용자 흐름, 화면, 디지털 경험을 설계합니다." },
    { number: "04", name: "브랜드 · 디지털 디자인", body: "브랜드 정체성과 디지털 콘텐츠를 만듭니다." },
    { number: "05", name: "제품 만들기", body: "아이디어부터 기획, 제작, 출시, 개선까지 이어 갑니다." },
  ],
  projectsHeading: "Selected projects",
  livePage: "Live page",
  role: "기획, 인터페이스, 제품 개발",
  projects: [
    { type: "출시 및 운영 중", name: "Apps", role: "Planning · UI/UX · Development", summary: "습관·돈·건강·가족·여행 앱 11개를 스토어에서 운영합니다. 기획, UI/UX, 개발을 직접 했고, 앱 연동은 단계적으로 확장합니다.", slogan: ["Everyday apps you need,", "in one Newon."], lead: "OX MONTH는 하루 O/X로 습관을 남기게 기획하고, 기록 화면을 설계해 출시한 뒤 운영 중입니다." },
    { type: "진행 중", name: "AI", summary: "일부 앱의 AI 기능은 제공 중이고, 기업용 자동화와 AI Agent는 확장 방향입니다.", slogan: ["Closer AI,", "for your everyday life."], lead: "일상의 질문부터 계획과 실행까지. 개인의 삶을 이해하고 함께하는 AI를 만듭니다." },
    { type: "준비 중", name: "LivOn", summary: "10대부터 70대까지, 삶의 단계마다 필요한 정보와 생활 서비스를 연결하는 플랫폼을 준비합니다.", slogan: ["At every stage of life,", "the next thing you need."], lead: "10대부터 70대까지. 생애 첫 경험과 인생의 변화까지 함께하는 생애주기 플랫폼." },
    { type: "준비 중", name: "Ongil", summary: "시니어의 일상과 돌봄을 지원하고, 가족을 연결하는 생활 플랫폼을 준비합니다.", slogan: ["Warm connection,", "through the years of daily life."], lead: "시니어의 일상·건강·돌봄부터 가족과 지역까지 잇는 종합 생활 플랫폼입니다." },
    { type: "서비스", name: "Business", summary: "기업과 사업자를 위한 소프트웨어를 구축하고, 자동화부터 운영·개선까지 지원합니다. Build · Automation · Solutions · Care", slogan: ["Expanding what business can do,", "with technology."], lead: "기업용 소프트웨어부터 AI와 업무 자동화까지. 기업의 운영과 성장을 연결하는 디지털 솔루션을 만듭니다." },
    { type: "서비스", name: "Studio", summary: "브랜드의 정체성부터 디지털 화면과 콘텐츠까지 디자인으로 설계합니다. Brand · UI/UX · Content", slogan: ["From idea to reality,", "from experience to new value."], lead: "브랜드 기획부터 디자인과 개발까지. 생각을 실제 디지털 경험으로 만듭니다." },
    { type: "플레이 가능", name: "Games", summary: "404: HUMAN은 AI만 남은 세계에서 마지막 인간으로 살아남는 선택형 인터랙티브 게임입니다.", slogan: ["In a world of AI,", "hide that you are the last human."], lead: "질문에 답하고, 행동을 선택하고, AI의 의심을 피하세요. 당신의 모든 선택은 기억됩니다." },
  ],
  numbersHeading: "In numbers",
  stats: [
    { value: "11", label: "앱", note: "스토어에 공개된 앱입니다." },
    { value: "13+", label: "제품", note: "앱, 게임, 웹을 함께 만듭니다." },
    { value: "13", label: "언어", note: "Newon 서비스의 다국어입니다." },
    { value: "177", label: "국가", note: "앱 스토어에 공개한 범위입니다." },
  ],
  processHeading: "The process",
  process: [
    { title: "Idea", body: "문제와 가능성을 찾습니다." },
    { title: "Planning", body: "핵심 사용자와 기능을 정합니다." },
    { title: "UX/UI", body: "구조와 화면을 설계합니다." },
    { title: "Build", body: "실제 제품으로 만듭니다." },
    { title: "Launch", body: "스토어와 웹에 공개합니다." },
    { title: "Operate", body: "반응을 보고 업데이트합니다." },
    { title: "Grow", body: "콘텐츠, 마케팅, 실험을 이어 갑니다." },
  ],
  workflowTitle: "AI speeds the work. Judgment stays human.",
  workflowBody: "조사, 작성, 개발, QA는 AI로 속도를 냅니다. 문제 정의, 우선순위, 최종 판단은 제품 기준으로 직접 합니다.",
  principlesHeading: "How I work",
  principles: [
    { n: "01", title: "실제로 출시한다", body: "아이디어를 화면에서 끝내지 않고 실제 출시까지 가져갑니다." },
    { n: "02", title: "핵심을 단순하게", body: "처음에는 핵심 문제와 기능에 집중합니다." },
    { n: "03", title: "출시 후 배운다", body: "출시 이후의 반응을 다음 개선에 반영합니다." },
    { n: "04", title: "시스템으로 만든다", body: "하나의 화면보다 제품 전체의 구조를 생각합니다." },
    { n: "05", title: "계속 움직인다", body: "완벽함보다 실행과 반복을 중요하게 봅니다." },
  ],
  contactHeading: "Let's build something great.",
  contactLead: "만들고 싶은 일이 있나요?",
  contactTalk: "이야기해 주세요.",
  blog: "블로그",
  portraitAlt: "경나원",
};

export const t = isKo ? ko : en;
