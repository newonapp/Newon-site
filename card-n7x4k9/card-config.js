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
  linkOrder: ["home", "portfolio", "pages", "appStore", "googlePlay", "contact", "saveContact"],
  links: {
    home: {
      type: "link",
      icon: "home",
      href: "/ko/",
      label: "Newon",
      hint: "공식 웹사이트",
      external: false,
    },
    portfolio: {
      type: "link",
      icon: "portfolio",
      href: "/ko/portfolio/",
      label: "Portfolio",
      hint: "제품 · 주요 작업",
      external: false,
    },
    pages: {
      type: "link",
      icon: "pages",
      href: "/ko/business/",
      label: "Newon Business",
      hint: "제작 · 자동화 · 리서치",
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
      type: "contact",
      icon: "contact",
      label: "Contact",
      hint: "이메일 · 전화",
      phone: "010-3923-8904",
      phoneHref: "tel:01039238904",
      email: "newon@newon.app",
      emailHref: "mailto:newon@newon.app",
    },
    saveContact: {
      type: "vcard",
      icon: "save",
      label: "Save Contact",
      hint: "경나원 연락처 저장",
    },
  },
};
