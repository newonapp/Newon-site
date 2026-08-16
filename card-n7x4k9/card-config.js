/**
 * Business-card QR landing — edit links and vCard here only.
 * Page URL: /card-n7x4k9/
 *
 * To add GitHub / LinkedIn later: add an entry to `links` and append its key to `linkOrder`.
 */
window.NEWON_CARD = {
  slug: "card-n7x4k9",
  profile: {
    nameKo: "경나원",
    nameEn: "Nawon Kyung",
    title: "CEO & App Developer",
    tagline: "기획부터 개발, 출시, 운영과 마케팅까지\n직접 만들어갑니다.",
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
    website: "https://www.newon.app",
  },
  linkOrder: ["home", "appStore", "googlePlay", "portfolio", "contact", "saveContact"],
  links: {
    home: {
      type: "link",
      icon: "home",
      href: "https://www.newon.app/",
      label: "Newon",
      hint: "Official website",
      external: false,
    },
    appStore: {
      type: "link",
      icon: "store",
      href: "https://apps.apple.com/kr/developer/nawon-kyung/id1896528749",
      label: "App Store",
      hint: "Newon Apps",
      external: true,
    },
    googlePlay: {
      type: "link",
      icon: "play",
      href: "https://play.google.com/store/apps/dev?id=8016507493063681249",
      label: "Google Play",
      hint: "Newon Apps",
      external: true,
    },
    portfolio: {
      type: "link",
      icon: "portfolio",
      href: "/portfolio/",
      label: "Portfolio",
      hint: "Selected works",
      external: false,
    },
    contact: {
      type: "contact",
      icon: "contact",
      label: "Contact",
      hint: "Phone & email",
      phone: "010-3923-8904",
      phoneHref: "tel:01039238904",
      email: "newon@newon.app",
      emailHref: "mailto:newon@newon.app",
    },
    saveContact: {
      type: "vcard",
      icon: "save",
      label: "Save Contact",
      hint: "Add to contacts",
    },
  },
};
