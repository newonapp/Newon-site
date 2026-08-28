/**
 * Supplemental high-quality content merged into Studio service detail pages.
 * Prices/timelines remain in studio-pricing.mjs only.
 */

/** Deep-merge enrichment fields into base detail (enrichment wins on conflict). */
export function mergeStudioDetail(base, slug, enrichment) {
  const extra = enrichment[slug];
  if (!extra || !base) return base;
  const out = { ...base };
  for (const [key, val] of Object.entries(extra)) {
    if (val && typeof val === "object" && !Array.isArray(val) && (val.ko != null || val.en != null)) {
      out[key] = val;
    } else if (Array.isArray(val) || typeof val === "string") {
      out[key] = val;
    } else if (val && typeof val === "object") {
      out[key] = { ...(out[key] || {}), ...val };
    } else {
      out[key] = val;
    }
  }
  return out;
}

export const STUDIO_DETAIL_ENRICHMENTS = {
  "brand-strategy": {},

  naming: {},

  identity: {},

  "logo-design": {},

  "web-design": {},

  "app-ui-ux": {},

  "landing-page-design": {},

  "product-design": {},

  "social-content": {
    eyebrowSub: { ko: "SOCIAL CONTENT", en: "SOCIAL CONTENT" },
    overview: {
      title: { ko: "꾸준히 말할 수 있는\n콘텐츠 구조를 만듭니다.", en: "A content structure\nyour brand can speak from." },
      body: {
        ko: [
          "Social Content는 채널 리뷰·콘텐츠 방향·필러·템플릿·카피 방향·채널 가이드를 만듭니다. 하나의 게시물을 만드는 것이 아니라 반복 가능한 콘텐츠 시스템을 설계합니다.",
          "월간 SNS 운영대행 전체는 포함되지 않으며, 지속 운영은 별도 견적입니다.",
        ],
        en: [
          "Social Content covers channel review, direction, pillars, templates, copy direction, and channel guide — not one-off posts, but a repeatable content system.",
          "Full monthly social ops is not included — ongoing management is a custom quote.",
        ],
      },
    },
    bestFor: {
      ko: ["브랜드 SNS 시작", "콘텐츠 방향 재정립", "런칭 전 SNS 준비", "템플릿·가이드 필요 팀", "인하우스 디자이너 있는 팀"],
      en: ["Starting brand social", "Resetting content direction", "Pre-launch social prep", "Teams needing templates/guides", "Teams with in-house designers"],
    },
    problems: {
      ko: [
        { t: "RANDOM POSTS", d: "매번 다른 톤·형식으로 올리는 경우." },
        { t: "NO PILLARS", d: "무엇을 말해야 할지 기준이 없는 경우." },
        { t: "TEMPLATE GAP", d: "디자이너 없이도 쓸 템플릿이 없는 경우." },
        { t: "PLATFORM COPY", d: "모든 채널에 같은 콘텐츠를 그대로 붙이는 경우." },
        { t: "NO CTA LOGIC", d: "모든 게시물에 CTA를 억지로 넣는 경우." },
        { t: "LAUNCH CHAOS", d: "출시 전후 Social 흐름이 없는 경우." },
      ],
      en: [
        { t: "RANDOM POSTS", d: "Different tone and format every post." },
        { t: "NO PILLARS", d: "No baseline for what to say." },
        { t: "TEMPLATE GAP", d: "No templates the team can reuse without a designer." },
        { t: "PLATFORM COPY", d: "Same post pasted across every channel." },
        { t: "NO CTA LOGIC", d: "Forced CTAs on every post." },
        { t: "LAUNCH CHAOS", d: "No social flow before and after launch." },
      ],
    },
    principlesLabel: "CONTENT SYSTEM",
    principlesTitle: {
      ko: "하나의 게시물이 아니라\n반복 가능한 구조.",
      en: "Not one post —\na repeatable structure.",
    },
    principlesLead: {
      ko: "Brand에서 Learn까지 이어지는 콘텐츠 구조를 만들어, 팀이 같은 기준으로 계속 이야기할 수 있게 합니다.",
      en: "From Brand to Learn, we build a content structure so the team can keep speaking with the same criteria.",
    },
    principles: {
      ko: [
        { t: "BRAND", d: "브랜드 기준" },
        { t: "GOAL", d: "콘텐츠 목표" },
        { t: "PILLAR", d: "말할 주제축" },
        { t: "FORMAT", d: "표현 형식" },
        { t: "MESSAGE", d: "핵심 메시지" },
        { t: "VISUAL", d: "비주얼 방향" },
        { t: "CTA", d: "다음 행동" },
        { t: "LEARN", d: "피드백·학습" },
      ],
      en: [
        { t: "BRAND", d: "Brand baseline" },
        { t: "GOAL", d: "Content goal" },
        { t: "PILLAR", d: "Topic pillars" },
        { t: "FORMAT", d: "Formats" },
        { t: "MESSAGE", d: "Key message" },
        { t: "VISUAL", d: "Visual direction" },
        { t: "CTA", d: "Next action" },
        { t: "LEARN", d: "Feedback & learning" },
      ],
    },
    directionsLabel: "CONTENT PILLARS",
    directionsTitle: {
      ko: "브랜드가 반복해서\n말할 주제축.",
      en: "Topic pillars\nyour brand can repeat.",
    },
    directionsLead: {
      ko: "모든 브랜드에 동일하게 적용하지 않습니다. 프로젝트에 맞는 Pillar만 선택합니다.",
      en: "Not every brand uses every pillar. We select what fits the project.",
    },
    directionsNote: {
      ko: "프로젝트 범위에 따라 필요한 Pillar만 사용합니다.",
      en: "Only the pillars needed for the project scope are used.",
    },
    directions: {
      ko: [
        { t: "BRAND", d: "브랜드 철학·Story" },
        { t: "PRODUCT", d: "기능·제품 가치" },
        { t: "EDUCATION", d: "정보와 문제 해결" },
        { t: "INSIGHT", d: "브랜드 관점" },
        { t: "COMMUNITY", d: "질문·참여" },
        { t: "PROOF", d: "실제 사례·성과" },
        { t: "BEHIND", d: "제작 과정" },
        { t: "CAMPAIGN", d: "Launch·Promotion" },
      ],
      en: [
        { t: "BRAND", d: "Brand philosophy & story" },
        { t: "PRODUCT", d: "Features & product value" },
        { t: "EDUCATION", d: "Information & problem-solving" },
        { t: "INSIGHT", d: "Brand point of view" },
        { t: "COMMUNITY", d: "Questions & participation" },
        { t: "PROOF", d: "Cases & results" },
        { t: "BEHIND", d: "Making process" },
        { t: "CAMPAIGN", d: "Launch & promotion" },
      ],
    },
    useCasesLabel: "CONTENT FORMATS",
    useCasesTitle: {
      ko: "목적에 맞는\n표현 형식.",
      en: "Formats matched\nto the goal.",
    },
    useCasesLead: {
      ko: "프로젝트별 범위에 따라 필요한 Format만 사용합니다.",
      en: "Only the formats needed for the project scope are used.",
    },
    useCases: {
      ko: [
        { t: "CAROUSEL", d: "여러 컷으로 설명·스토리" },
        { t: "SINGLE POST", d: "한 장의 핵심 메시지" },
        { t: "SHORT-FORM", d: "짧은 영상 콘텐츠" },
        { t: "STORY", d: "일시적·즉시성 콘텐츠" },
        { t: "PRODUCT DEMO", d: "제품 사용·기능 시연" },
        { t: "TEXT / INSIGHT", d: "텍스트 중심 인사이트" },
        { t: "ANNOUNCEMENT", d: "공지·업데이트" },
      ],
      en: [
        { t: "CAROUSEL", d: "Multi-frame explain / story" },
        { t: "SINGLE POST", d: "One-frame key message" },
        { t: "SHORT-FORM", d: "Short video content" },
        { t: "STORY", d: "Ephemeral, timely content" },
        { t: "PRODUCT DEMO", d: "Product use / feature demo" },
        { t: "TEXT / INSIGHT", d: "Text-led insight" },
        { t: "ANNOUNCEMENT", d: "Announcement / update" },
      ],
    },
    checksLabel: "CONTENT GOALS",
    checksTitle: {
      ko: "콘텐츠가 담당할\n목표를 정합니다.",
      en: "Set the job\neach content should do.",
    },
    checksLead: {
      ko: "모든 콘텐츠가 Conversion을 목표로 하지 않습니다. 목적에 맞는 Goal을 선택합니다.",
      en: "Not every post aims at conversion. We choose goals that fit the purpose.",
    },
    checks: {
      ko: [
        { t: "AWARENESS", d: "존재와 인상" },
        { t: "EDUCATION", d: "이해와 학습" },
        { t: "CONSIDERATION", d: "검토와 비교" },
        { t: "CONVERSION", d: "행동 전환" },
        { t: "RETENTION", d: "관계 유지" },
        { t: "COMMUNITY", d: "참여와 대화" },
      ],
      en: [
        { t: "AWARENESS", d: "Presence & impression" },
        { t: "EDUCATION", d: "Understanding & learning" },
        { t: "CONSIDERATION", d: "Evaluation & comparison" },
        { t: "CONVERSION", d: "Action" },
        { t: "RETENTION", d: "Ongoing relationship" },
        { t: "COMMUNITY", d: "Participation & dialogue" },
      ],
    },
    conceptFlowLabel: "LAUNCH CONTENT",
    conceptFlowTitle: {
      ko: "출시 전후 Social\n콘텐츠 흐름.",
      en: "Social content flow\nbefore and after launch.",
    },
    conceptFlowLead: {
      ko: "제품 출시를 하나의 게시물로 끝내지 않고, Tease부터 Follow-up까지 흐름으로 설계합니다.",
      en: "A launch is not one post — we design from Tease through Follow-up.",
    },
    conceptFlow: {
      ko: [
        { t: "TEASE", d: "기대와 궁금증" },
        { t: "INTRODUCE", d: "무엇인지 소개" },
        { t: "EXPLAIN", d: "가치와 사용" },
        { t: "PROVE", d: "근거와 신뢰" },
        { t: "LAUNCH", d: "출시 순간" },
        { t: "FOLLOW-UP", d: "이후 이야기" },
      ],
      en: [
        { t: "TEASE", d: "Curiosity & anticipation" },
        { t: "INTRODUCE", d: "What it is" },
        { t: "EXPLAIN", d: "Value & use" },
        { t: "PROVE", d: "Proof & trust" },
        { t: "LAUNCH", d: "Launch moment" },
        { t: "FOLLOW-UP", d: "What comes next" },
      ],
    },
    compareLabel: "PLATFORM APPROACH",
    compareTitle: {
      ko: "같은 콘텐츠를\n그대로 복사하지 않습니다.",
      en: "We do not paste\nthe same post everywhere.",
    },
    compareLead: {
      ko: "플랫폼의 소비 방식에 맞게 Format·길이와 CTA를 조정합니다. Instagram, TikTok, YouTube Shorts, YouTube, LinkedIn, Text-based Channel을 같은 기준으로 다루지 않습니다.",
      en: "We adapt format, length, and CTA to how each platform is consumed — Instagram, TikTok, YouTube Shorts, YouTube, LinkedIn, and text-based channels.",
    },
    compare: {
      ko: [
        { t: "VISUAL / SHORT", d: "Instagram · TikTok · YouTube Shorts — 짧은 시선과 시각 중심." },
        { t: "LONG / TEXT", d: "YouTube · LinkedIn · Text Channel — 설명·인사이트·전문성 중심." },
      ],
      en: [
        { t: "VISUAL / SHORT", d: "Instagram · TikTok · YouTube Shorts — short attention, visual-first." },
        { t: "LONG / TEXT", d: "YouTube · LinkedIn · Text channels — explanation, insight, expertise." },
      ],
    },
    versusLabel: "SOCIAL CONTENT vs MANAGEMENT",
    versusTitle: {
      ko: "콘텐츠 시스템과\n월간 운영은 다릅니다.",
      en: "Content system and\nmonthly ops differ.",
    },
    versusLead: {
      ko: "Social Content는 전략·Pillar·Format·Message·Design·Template을 만듭니다. Social Management는 게시·댓글/DM·일정·Daily Operation·Community Management입니다. 월간 운영은 기본 범위가 아닙니다.",
      en: "Social Content builds strategy, pillars, format, message, design, and templates. Social Management covers posting, comments/DM, scheduling, daily ops, and community. Monthly ops are not base scope.",
    },
    versus: {
      ko: [
        { t: "SOCIAL CONTENT", d: "전략 · Pillar · Format · Message · Design · Template" },
        { t: "SOCIAL MANAGEMENT", d: "게시 · 댓글/DM · 일정 관리 · Daily Operation · Community Management" },
      ],
      en: [
        { t: "SOCIAL CONTENT", d: "Strategy · Pillar · Format · Message · Design · Template" },
        { t: "SOCIAL MANAGEMENT", d: "Posting · Comments/DM · Scheduling · Daily ops · Community management" },
      ],
    },
    versusNote: {
      ko: "CTA SYSTEM — Save, Share, Comment, Follow, Visit, Download, Sign Up, Contact. 목적에 따라 선택하며 모든 콘텐츠에 CTA를 억지로 넣지 않습니다.",
      en: "CTA SYSTEM — Save, Share, Comment, Follow, Visit, Download, Sign Up, Contact. Chosen by goal; not forced onto every post.",
    },
  },

  campaign: {},

  "visual-content": {},

  "character-lab": {
    overview: {
      title: { ko: "작은 아이디어에서\nIP 가능성을 실험.", en: "Experiment IP potential\nfrom a small idea." },
      body: {
        ko: [
          "Character Lab은 Experimental · Available 서비스입니다. 캐릭터 콘셉트·성격·비주얼·표정·기본 세계관을 설계하고, 디지털 콘텐츠·브랜드 자산으로 확장할 수 있는지 실험합니다.",
          "완성된 상용 IP 라이선싱·대형 캐릭터 사업 형태가 아닙니다. 다만 실제 프로젝트 문의와 진행은 가능합니다.",
        ],
        en: [
          "Character Lab is Experimental · Available — we design concept, personality, visuals, expressions, and a basic world, then test expansion into digital content and brand assets.",
          "This is not a finished commercial IP licensing or large character business offering — inquiry and project work are still available.",
        ],
      },
    },
    bestFor: {
      ko: ["캐릭터 IP 탐색", "브랜드 마스코트 실험", "콘텐츠·게임 캐릭터 초기", "스티커·굿즈 전 단계"],
      en: ["Character IP exploration", "Brand mascot experiments", "Early content/game characters", "Pre-sticker/merch stage"],
    },
    problems: {
      ko: [
        { t: "CHARACTER IDEA ONLY", d: "아이디어만 있고 구체화가 안 된 경우." },
        { t: "NO USAGE PATH", d: "캐릭터를 어디에 쓸지 모르는 경우." },
        { t: "BRAND MASCOT", d: "브랜드 대표 캐릭터가 필요한 경우." },
        { t: "NO SYSTEM", d: "표정·포즈·보이스 규칙이 없는 경우." },
        { t: "LOGO CONFUSION", d: "로고와 캐릭터의 역할이 섞인 경우." },
        { t: "ONE-OFF ART", d: "일회성 일러스트만 있고 반복 사용이 어려운 경우." },
      ],
      en: [
        { t: "CHARACTER IDEA ONLY", d: "Idea exists but isn’t shaped." },
        { t: "NO USAGE PATH", d: "Unclear where the character lives." },
        { t: "BRAND MASCOT", d: "Need a brand mascot direction." },
        { t: "NO SYSTEM", d: "No expression, pose, or voice rules." },
        { t: "LOGO CONFUSION", d: "Logo and character roles are mixed." },
        { t: "ONE-OFF ART", d: "One illustration — hard to reuse across situations." },
      ],
    },
    principlesLabel: "CHARACTER FOUNDATION",
    principlesTitle: {
      ko: "캐릭터를 정의하는\n기본 축.",
      en: "The baseline axes\nthat define a character.",
    },
    principlesLead: {
      ko: "외형만이 아니라 Role부터 Relationship까지 함께 정의합니다.",
      en: "Not only looks — we define Role through Relationship together.",
    },
    principles: {
      ko: [
        { t: "ROLE", d: "역할" },
        { t: "PERSONALITY", d: "성격" },
        { t: "MOTIVATION", d: "동기" },
        { t: "BEHAVIOR", d: "행동" },
        { t: "VOICE", d: "말투·보이스" },
        { t: "RELATIONSHIP", d: "사용자와의 관계" },
      ],
      en: [
        { t: "ROLE", d: "Role" },
        { t: "PERSONALITY", d: "Personality" },
        { t: "MOTIVATION", d: "Motivation" },
        { t: "BEHAVIOR", d: "Behavior" },
        { t: "VOICE", d: "Voice" },
        { t: "RELATIONSHIP", d: "Relationship with users" },
      ],
    },
    directionsLabel: "CHARACTER ROLE",
    directionsTitle: {
      ko: "프로젝트 목적에 맞는\n역할을 선택합니다.",
      en: "Choose the role\nthat fits the project goal.",
    },
    directionsLead: {
      ko: "모든 역할을 한 번에 쓰지 않습니다. 목적에 맞는 Role을 고릅니다.",
      en: "We do not use every role at once — we pick what fits the purpose.",
    },
    directions: {
      ko: [
        { t: "MASCOT", d: "브랜드 대표" },
        { t: "GUIDE", d: "안내·온보딩" },
        { t: "COMPANION", d: "동반·관계" },
        { t: "NARRATOR", d: "이야기 전달" },
        { t: "REWARD", d: "보상·성취" },
        { t: "COMMUNITY", d: "커뮤니티 상징" },
      ],
      en: [
        { t: "MASCOT", d: "Brand representative" },
        { t: "GUIDE", d: "Guide / onboarding" },
        { t: "COMPANION", d: "Companion / relationship" },
        { t: "NARRATOR", d: "Storytelling" },
        { t: "REWARD", d: "Reward / achievement" },
        { t: "COMMUNITY", d: "Community symbol" },
      ],
    },
    useCasesLabel: "CHARACTER DESIGN SYSTEM",
    useCasesTitle: {
      ko: "반복 가능한\n비주얼 규칙.",
      en: "Visual rules\nyou can reuse.",
    },
    useCasesLead: {
      ko: "실루엣부터 Scale까지 Character Design System으로 정리합니다.",
      en: "From silhouette to scale — a character design system.",
    },
    useCases: {
      ko: [
        { t: "SILHOUETTE", d: "실루엣" },
        { t: "PROPORTION", d: "비율" },
        { t: "FACE", d: "얼굴" },
        { t: "COLOR", d: "컬러" },
        { t: "SIGNATURE DETAIL", d: "시그니처 디테일" },
        { t: "SHAPE LANGUAGE", d: "형태 언어" },
        { t: "SCALE", d: "스케일" },
      ],
      en: [
        { t: "SILHOUETTE", d: "Silhouette" },
        { t: "PROPORTION", d: "Proportion" },
        { t: "FACE", d: "Face" },
        { t: "COLOR", d: "Color" },
        { t: "SIGNATURE DETAIL", d: "Signature detail" },
        { t: "SHAPE LANGUAGE", d: "Shape language" },
        { t: "SCALE", d: "Scale" },
      ],
    },
    checksLabel: "EXPRESSION SYSTEM",
    checksTitle: {
      ko: "감정 표현의\n범위를 정의합니다.",
      en: "Define the range\nof expressions.",
    },
    checksLead: {
      ko: "실제 제공 Expression 수는 견적에 따라 결정합니다.",
      en: "The number of expressions delivered is set by quote.",
    },
    checks: {
      ko: [
        { t: "HAPPY", d: "기쁨" },
        { t: "EXCITED", d: "설렘" },
        { t: "CURIOUS", d: "호기심" },
        { t: "FOCUSED", d: "집중" },
        { t: "SURPRISED", d: "놀람" },
        { t: "CONFUSED", d: "당황" },
        { t: "SAD", d: "아쉬움" },
        { t: "ANGRY", d: "화남" },
        { t: "PROUD", d: "뿌듯" },
        { t: "TIRED", d: "지침" },
      ],
      en: [
        { t: "HAPPY", d: "Happy" },
        { t: "EXCITED", d: "Excited" },
        { t: "CURIOUS", d: "Curious" },
        { t: "FOCUSED", d: "Focused" },
        { t: "SURPRISED", d: "Surprised" },
        { t: "CONFUSED", d: "Confused" },
        { t: "SAD", d: "Sad" },
        { t: "ANGRY", d: "Angry" },
        { t: "PROUD", d: "Proud" },
        { t: "TIRED", d: "Tired" },
      ],
    },
    conceptFlowLabel: "POSE SYSTEM",
    conceptFlowTitle: {
      ko: "상황별 Pose\n범위를 정의합니다.",
      en: "Define pose range\nby situation.",
    },
    conceptFlowLead: {
      ko: "실제 Pose 수는 프로젝트별 협의합니다.",
      en: "Pose count is agreed per project.",
    },
    conceptFlow: {
      ko: [
        { t: "STANDING", d: "서 있기" },
        { t: "SITTING", d: "앉기" },
        { t: "WALKING", d: "걷기" },
        { t: "WAVING", d: "손 흔들기" },
        { t: "THINKING", d: "생각" },
        { t: "WORKING", d: "작업" },
        { t: "CELEBRATING", d: "축하" },
        { t: "REACTION", d: "반응" },
        { t: "HOLDING OBJECT", d: "물건 들기" },
      ],
      en: [
        { t: "STANDING", d: "Standing" },
        { t: "SITTING", d: "Sitting" },
        { t: "WALKING", d: "Walking" },
        { t: "WAVING", d: "Waving" },
        { t: "THINKING", d: "Thinking" },
        { t: "WORKING", d: "Working" },
        { t: "CELEBRATING", d: "Celebrating" },
        { t: "REACTION", d: "Reaction" },
        { t: "HOLDING OBJECT", d: "Holding object" },
      ],
    },
    compareLabel: "CHARACTER VOICE · DIGITAL",
    compareTitle: {
      ko: "말투와 Product UX에서도\n역할을 가질 수 있습니다.",
      en: "Voice and product UX\ncan carry the character too.",
    },
    compareLead: {
      ko: "Tone, Word Choice, Sentence Style, Reaction을 정의하고 Success / Error / Guide 상황에서 어떻게 말할지 정리할 수 있습니다. Onboarding, Empty State, Loading, Error, Success, Achievement, Guide, Notification 등 Digital Character 역할도 탐색합니다.",
      en: "We can define tone, word choice, sentence style, and reactions — including success / error / guide moments. Digital character roles can also cover onboarding, empty state, loading, error, success, achievement, guide, and notification.",
    },
    compare: {
      ko: [
        { t: "CHARACTER VOICE", d: "Tone · Word Choice · Sentence Style · Reaction" },
        { t: "DIGITAL CHARACTER", d: "Onboarding · Empty · Loading · Error · Success · Achievement · Guide · Notification" },
      ],
      en: [
        { t: "CHARACTER VOICE", d: "Tone · Word Choice · Sentence Style · Reaction" },
        { t: "DIGITAL CHARACTER", d: "Onboarding · Empty · Loading · Error · Success · Achievement · Guide · Notification" },
      ],
    },
    versusLabel: "CHARACTER vs LOGO / ILLUSTRATION",
    versusTitle: {
      ko: "로고·일러스트와\n시작점이 다릅니다.",
      en: "Different starting points\nthan logo or illustration.",
    },
    versusLead: {
      ko: "Logo는 브랜드 식별. Character는 브랜드 Personality와 사용자 관계. Illustration은 특정 장면의 단일 결과물. Character는 Personality / Expression / Pose / Rule을 정의한 반복 사용 System입니다.",
      en: "Logo identifies the brand. Character builds personality and user relationship. Illustration is a single scene asset. Character is a reusable system of personality, expression, pose, and rules.",
    },
    versus: {
      ko: [
        { t: "LOGO", d: "브랜드 식별." },
        { t: "CHARACTER", d: "Personality와 사용자 관계 형성. 반복 사용 System." },
        { t: "ILLUSTRATION", d: "특정 장면을 위한 단일 결과물." },
      ],
      en: [
        { t: "LOGO", d: "Brand identification." },
        { t: "CHARACTER", d: "Personality and user relationship — a reusable system." },
        { t: "ILLUSTRATION", d: "A single result for a specific scene." },
      ],
    },
    versusNote: {
      ko: "CHARACTER RIGHTS — 저작권 / 사용권 / Merchandise / Modification / Commercial Usage는 프로젝트 계약 범위에 따라 결정합니다. 무조건 양도한다고 표현하지 않습니다.",
      en: "CHARACTER RIGHTS — copyright, usage, merchandise, modification, and commercial usage are set by contract. We do not claim blanket assignment.",
    },
    optionalScope: {
      ko: ["Extended Expression Set", "Sticker Concept", "Merch Mockup", "Experimental IP (custom)"],
      en: ["Extended Expression Set", "Sticker Concept", "Merch Mockup", "Experimental IP (custom)"],
    },
  },

  "digital-stickers": {
    overview: {
      title: { ko: "캐릭터 감정을\n디지털 표현으로.", en: "Character emotion as\ndigital expression." },
      body: {
        ko: [
          "Digital Stickers는 Character Lab에서 다루는 캐릭터·감정을 메신저·SNS 등 디지털 채널용 표현으로 확장하는 영역입니다. 현재 준비 중이며, 판매·운영 중인 상용 서비스가 아닙니다.",
        ],
        en: [
          "Digital Stickers extends character and emotion from Character Lab into messenger and social expressions. Still in progress — not sold or operated as a live commercial service yet.",
        ],
      },
    },
    whatWeDo: {
      ko: [
        { t: "CHARACTER EMOTION", d: "캐릭터의 감정·표정 범위를 정의합니다. (예정)" },
        { t: "STICKER FORMAT", d: "메신저·SNS용 스티커 포맷을 설계합니다. (예정)" },
        { t: "PACK STRUCTURE", d: "스티커 팩 구성과 사용 맥락을 정리합니다. (예정)" },
      ],
      en: [
        { t: "CHARACTER EMOTION", d: "Define emotion and expression range. (Planned)" },
        { t: "STICKER FORMAT", d: "Design sticker formats for messenger/social. (Planned)" },
        { t: "PACK STRUCTURE", d: "Structure packs and usage context. (Planned)" },
      ],
    },
    faqs: {
      ko: [
        { q: "지금 의뢰할 수 있나요?", a: "아니요. Coming Soon 상태이며 상용 의뢰를 받지 않습니다. Character Lab에서 IP 가능성을 먼저 실험할 수 있습니다." },
        { q: "Character Lab과 무슨 관계인가요?", a: "Character Lab에서 만든 캐릭터·감정을 디지털 스티커로 확장하는 후속 영역으로 준비 중입니다." },
        { q: "가격은 언제 공개되나요?", a: "서비스가 정식 오픈될 때 범위와 함께 안내합니다. 현재는 가격을 표시하지 않습니다." },
      ],
      en: [
        { q: "Can we commission it now?", a: "No — Coming Soon. We don’t take commercial requests yet. Try Character Lab to explore IP potential first." },
        { q: "How does it relate to Character Lab?", a: "Planned as a follow-on from Character Lab — extending character emotion into digital stickers." },
        { q: "When will pricing be published?", a: "When the service opens with defined scope. No price is shown while in preparation." },
      ],
    },
  },

  "newon-character": {
    overview: {
      title: { ko: "Newon 자체 브랜드\n캐릭터 IP.", en: "Character IP for\nthe Newon brand." },
      body: {
        ko: [
          "Newon Character는 Newon 자체 브랜드를 위한 캐릭터·시각 IP를 개발하는 내부 프로젝트입니다. 외부 의뢰·커스텀 제작 서비스가 아닙니다.",
          "진행 상황은 Labs·News 등 채널을 통해 공유될 수 있습니다.",
        ],
        en: [
          "Newon Character is an internal project developing character and visual IP for Newon — not a client commission service.",
          "Progress may be shared through Labs, News, and similar channels.",
        ],
      },
    },
    whatWeDo: {
      ko: [
        { t: "BRAND CHARACTER", d: "Newon 브랜드에 맞는 캐릭터 방향을 탐색합니다." },
        { t: "VISUAL IP", d: "제품·콘텐츠에 쓸 수 있는 시각 IP를 실험합니다." },
        { t: "INTERNAL USE", d: "내부 브랜드·제품 경험에 적용 가능성을 검토합니다." },
      ],
      en: [
        { t: "BRAND CHARACTER", d: "Explore character direction for the Newon brand." },
        { t: "VISUAL IP", d: "Experiment with visual IP for products and content." },
        { t: "INTERNAL USE", d: "Review fit for internal brand and product experience." },
      ],
    },
    faqs: {
      ko: [
        { q: "외부 의뢰가 가능한가요?", a: "아니요. Internal Project이며 클라이언트 서비스가 아닙니다." },
        { q: "Character Lab과 다른가요?", a: "Character Lab은 Experimental 클라이언트 서비스입니다. Newon Character는 Newon 자체 IP 프로젝트입니다." },
        { q: "진행 상황은 어디서 보나요?", a: "Labs·News 등 Newon 채널을 통해 공유될 수 있습니다." },
      ],
      en: [
        { q: "Can clients commission this?", a: "No — internal project, not a client service." },
        { q: "How is it different from Character Lab?", a: "Character Lab is an Experimental client service. Newon Character is Newon’s own IP project." },
        { q: "Where can we follow progress?", a: "Through Newon channels such as Labs and News when shared." },
      ],
    },
  },

  "experimental-ip": {},
};
