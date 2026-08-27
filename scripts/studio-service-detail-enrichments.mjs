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
    overview: {
      title: { ko: "꾸준히 말할 수 있는\n콘텐츠 구조를 만듭니다.", en: "A content structure\nyour brand can speak from." },
      body: {
        ko: [
          "Social Content는 채널 리뷰·콘텐츠 방향·필러·템플릿·카피 방향·채널 가이드를 만듭니다. 월간 SNS 운영대행 전체는 포함되지 않으며, 지속 운영은 별도 견적입니다.",
        ],
        en: [
          "Social Content covers channel review, direction, pillars, templates, copy direction, and channel guide. Full monthly social ops is not included — ongoing management is a custom quote.",
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
      ],
      en: [
        { t: "RANDOM POSTS", d: "Different tone and format every post." },
        { t: "NO PILLARS", d: "No baseline for what to say." },
        { t: "TEMPLATE GAP", d: "No templates the team can reuse without a designer." },
      ],
    },
  },

  campaign: {},

  "visual-content": {},

  "character-lab": {
    overview: {
      title: { ko: "작은 아이디어에서\nIP 가능성을 실험.", en: "Experiment IP potential\nfrom a small idea." },
      body: {
        ko: [
          "Character Lab은 Experimental 서비스입니다. 캐릭터 콘셉트·성격·비주얼·표정·기본 세계관을 설계하고, 디지털 콘텐츠·브랜드 자산으로 확장할 수 있는지 실험합니다.",
          "완성된 상용 IP 라이선싱·대형 캐릭터 사업 형태가 아닙니다.",
        ],
        en: [
          "Character Lab is Experimental — we design concept, personality, visuals, expressions, and a basic world, then test expansion into digital content and brand assets.",
          "This is not a finished commercial IP licensing or large character business offering.",
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
      ],
      en: [
        { t: "CHARACTER IDEA ONLY", d: "Idea exists but isn’t shaped." },
        { t: "NO USAGE PATH", d: "Unclear where the character lives." },
        { t: "BRAND MASCOT", d: "Need a brand mascot direction." },
      ],
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
