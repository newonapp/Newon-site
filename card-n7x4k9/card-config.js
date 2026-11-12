/**
 * Business-card QR landing — edit links and vCard here only.
 * Page URL: /card-n7x4k9/
 *
 * Destinations default to Korean (/ko/) for QR visitors.
 * To add GitHub / LinkedIn later: add an entry to `links` and append its key to `linkOrder`.
 */
window.NEWON_CARD = {
  slug: "card-n7x4k9",
  profile: {
    nameKo: "경나원",
    nameEn: "Nawon Kyung",
    title: "CEO & App Developer",
    tagline: "Newon을 만들고 운영하며\n아이디어를 실제 디지털 제품으로 만듭니다.",
    studioMeta: "NEWON · PRODUCT & VENTURE STUDIO",
    logoSrc: "/logo.png",
    logoAlt: "Newon",
  },
  vcard: {
    file: "nawon-kyung.vcf",
    filename: "nawon-kyung.vcf",
    nameKo: "경나원",
    nameEn: "Nawon Kyung",
    family: "",
    given: "경나원",
    company: "Newon",
    title: "CEO & App Developer",
    phone: "010-3923-8904",
    email: "newon@newon.app",
    website: "https://www.newon.app/ko/",
  },
  linkOrder: ["home", "ir", "portfolio", "appStore", "googlePlay", "contact", "saveContact"],
  links: {
    home: {
      type: "link",
      icon: "home",
      href: "/ko/",
      label: "Newon",
      hint: "공식 웹사이트",
      external: false,
    },
    ir: {
      type: "list",
      icon: "ir",
      label: "NEWON IR",
      hint: "투자 자료 · 한국어 / English",
      items: [
        { kicker: "KR", label: "메인 IR · 투자제안서", href: "ir/NEWON_MAIN_IR_PRINT_KR.pdf", newTab: true },
        { kicker: "EN", label: "Main IR · Investment Proposal", href: "ir/NEWON_MAIN_IR_PRINT_EN.pdf", newTab: true },
        { kicker: "KR", label: "상세 부록", href: "ir/NEWON_DETAILED_APPENDIX_KR.pdf", newTab: true },
        { kicker: "EN", label: "Detailed Appendix", href: "ir/NEWON_DETAILED_APPENDIX_EN.pdf", newTab: true },
        { kicker: "KR", label: "팩트시트 · 투자 요약", href: "ir/NEWON_FACT_SHEET_KR.pdf", newTab: true },
        { kicker: "EN", label: "Fact Sheet · Investment Summary", href: "ir/NEWON_FACT_SHEET_EN.pdf", newTab: true },
      ],
    },
    portfolio: {
      type: "link",
      icon: "portfolio",
      href: "/ko/portfolio/",
      label: "Portfolio",
      hint: "제품 · 주요 작업",
      external: false,
    },
    appStore: {
      type: "link",
      icon: "store",
      href: "https://apps.apple.com/kr/developer/nawon-kyung/id1896528749",
      label: "App Store",
      hint: "iPhone · iPad용 Newon 앱",
      external: true,
    },
    googlePlay: {
      type: "link",
      icon: "play",
      href: "https://play.google.com/store/apps/dev?id=8016507493063681249&hl=ko",
      label: "Google Play",
      hint: "Android용 Newon 앱",
      external: true,
    },
    contact: {
      icon: "contact",
      label: "Contact",
      hint: "문의하기",
      href: "/ko/contact/",
    },
    saveContact: {
      type: "contact",
      icon: "save",
      label: "Save Contact",
      hint: "전화 · 이메일",
      phone: "010-3923-8904",
      phoneHref: "tel:01039238904",
      email: "newon@newon.app",
      emailHref: "mailto:newon@newon.app",
    },
  },
};
