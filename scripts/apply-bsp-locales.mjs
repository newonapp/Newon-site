#!/usr/bin/env node
/**
 * Adds / updates the global-nav keys for the Business · Studio · Partnerships menus in locales/*.json,
 * plus the /business/ and /studio/ hub SEO + hidden hero keys (HUB_KEYS).
 * Only the keys listed here are touched; every other translation is left exactly as it is.
 *
 * Review status (BSP_NAV_REVIEW): ko is the source, en is meaning-checked. ja, es, pt-br, fr, de, hi, id
 * are Claude translation CANDIDATES — not native-reviewed. They are used on the site so the menus are not
 * shown in English, but must be reviewed before being treated as final.
 *
 * Run: node scripts/apply-bsp-locales.mjs   (idempotent; writes with the same 2-space JSON format)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export const BSP_NAV_REVIEW = {
  ko: "source",
  en: "meaning checked against ko",
  ja: "UNREVIEWED — Claude translation candidate",
  es: "UNREVIEWED — Claude translation candidate",
  "pt-br": "UNREVIEWED — Claude translation candidate",
  fr: "UNREVIEWED — Claude translation candidate",
  de: "UNREVIEWED — Claude translation candidate",
  hi: "UNREVIEWED — Claude translation candidate",
  id: "UNREVIEWED — Claude translation candidate",
};

// Key order: see KEYS below. Studio item titles stay English in every locale (existing Studio convention).
const KEYS = [
  "topPartnerships", "partnershipsMenuLabel", "partnershipsMenuLead", "partnershipsExploreCta",
  "businessMenuLead", "studioMenuLead",
  "bizMenuOverview", "bizMenuOverviewDesc", "bizMenuAutomation", "bizMenuSolutions", "bizMenuAutomationDesc", "bizMenuSolutionsDesc",
  "bizMenuDigital", "bizMenuDigitalDesc", "bizMenuPlatforms", "bizMenuPlatformsDesc", "bizMenuInquiry", "bizMenuInquiryDesc",
  "studioMenuOverviewDesc", "studioMenuDigitalDesc", "studioMenuDesignSystemsDesc", "studioMenuProjectsDesc", "studioMenuPartnershipsDesc",
  "ptOverview", "ptOverviewDesc", "ptCorporate", "ptCorporateDesc", "ptIndividuals", "ptIndividualsDesc",
  "ptPublic", "ptPublicDesc", "ptPlatforms", "ptPlatformsDesc", "ptStrategic", "ptStrategicDesc", "ptInquiry", "ptInquiryDesc",
];

const T = {
  ko: [
    "파트너십", "파트너십", "개인·판매자·기업·기관이 Newon과 협력하는 통합 창구", "파트너십 알아보기 →",
    "자체 소프트웨어 제품과 자동화 솔루션", "자체 디지털 제품과 디자인 자산",
    "개요", "자체 제품 중심 사업 구조", "자동화", "솔루션", "반복 업무를 줄이는 자동화 제품", "공통 제품 기반 솔루션",
    "디지털 상품", "구독 소프트웨어·도구·키트", "플랫폼 연계", "6개 플랫폼과 연결되는 기회", "비즈니스 문의", "도입·라이선스·유통 문의",
    "Studio의 목적과 제품 철학", "자체 디지털 제품과 리소스", "제품 디자인 원칙과 시스템", "직접 기획·개발하는 프로젝트", "제품 유통·라이선스 협력",
    "파트너십 개요", "협력 대상·방식·절차", "기업 파트너십", "기업·브랜드 제휴", "개인·판매자", "개인 판매자·크리에이터 참여",
    "공공·기관", "공공기관·지자체·교육·복지", "플랫폼 파트너십", "6개 플랫폼별 협력", "전략적 파트너십", "장기 제휴·기술·글로벌", "제휴 문의", "통합 제휴 문의 양식",
  ],
  en: [
    "Partnerships", "Partnerships", "One front door for individuals, sellers, companies and institutions", "Explore Partnerships →",
    "Own software products and automation solutions", "Own digital products and design assets",
    "Overview", "How the product business works", "Automation", "Solutions", "Automation products for repeated work", "Solutions on shared products",
    "Digital Products", "Software, tools and kits", "Platform Integration", "Opportunities across six platforms", "Business Inquiry", "Adoption, licensing, distribution",
    "Purpose and product philosophy", "Own digital products and resources", "Product design principles and systems", "Projects we plan and build ourselves", "Distribution and licensing partnerships",
    "Partnership Overview", "Who, how and the process", "Corporate Partnerships", "Companies and brands", "Individuals & Sellers", "Individual sellers and creators",
    "Public & Institutional", "Public bodies, education, welfare", "Platform Partnerships", "Partnering on each platform", "Strategic Partnerships", "Long-term, technology, global", "Partnership Inquiry", "One partnership inquiry form",
  ],
  ja: [
    "パートナーシップ", "パートナーシップ", "個人・販売者・企業・機関がNewonと協力する総合窓口", "パートナーシップを見る →",
    "自社ソフトウェア製品と自動化ソリューション", "自社デジタル製品とデザイン資産",
    "概要", "自社製品を中心とした事業構造", "オートメーション", "ソリューション", "繰り返し業務を減らす自動化製品", "共通製品をもとにしたソリューション",
    "デジタル商品", "サブスクリプション・ツール・キット", "プラットフォーム連携", "6つのプラットフォームとつながる機会", "ビジネスのお問い合わせ", "導入・ライセンス・流通のお問い合わせ",
    "Studioの目的と製品哲学", "自社デジタル製品とリソース", "製品デザインの原則とシステム", "自ら企画・開発するプロジェクト", "製品流通・ライセンスの協力",
    "パートナーシップ概要", "協力対象・方法・手順", "企業パートナーシップ", "企業・ブランドとの提携", "個人・販売者", "個人販売者・クリエイターの参加",
    "公共・機関", "公共機関・自治体・教育・福祉", "プラットフォーム連携", "6つのプラットフォーム別の協力", "戦略的パートナーシップ", "長期提携・技術・グローバル", "提携のお問い合わせ", "総合提携お問い合わせフォーム",
  ],
  es: [
    "Alianzas", "Alianzas", "Un punto de contacto para personas, vendedores, empresas e instituciones", "Ver alianzas →",
    "Productos de software y automatización propios", "Productos digitales y recursos de diseño propios",
    "Resumen", "Cómo funciona el negocio de productos", "Automatización", "Soluciones", "Productos de automatización para el trabajo repetitivo", "Soluciones sobre productos comunes",
    "Productos digitales", "Software, herramientas y kits", "Integración con plataformas", "Oportunidades en seis plataformas", "Consultas de negocio", "Adopción, licencias, distribución",
    "Propósito y filosofía de producto", "Productos digitales y recursos propios", "Principios y sistemas de diseño", "Proyectos que planificamos y creamos", "Alianzas de distribución y licencias",
    "Resumen de alianzas", "Con quién, cómo y el proceso", "Alianzas corporativas", "Empresas y marcas", "Personas y vendedores", "Vendedores individuales y creadores",
    "Sector público e instituciones", "Organismos públicos, educación, bienestar", "Alianzas por plataforma", "Colaborar en cada plataforma", "Alianzas estratégicas", "Largo plazo, tecnología, global", "Consulta de alianza", "Un único formulario de alianzas",
  ],
  "pt-br": [
    "Parcerias", "Parcerias", "Um canal único para pessoas, vendedores, empresas e instituições", "Ver parcerias →",
    "Produtos de software e automação próprios", "Produtos digitais e ativos de design próprios",
    "Visão geral", "Como funciona o negócio de produtos", "Automação", "Soluções", "Produtos de automação para trabalho repetitivo", "Soluções sobre produtos comuns",
    "Produtos digitais", "Software, ferramentas e kits", "Integração com plataformas", "Oportunidades em seis plataformas", "Contato comercial", "Adoção, licenciamento, distribuição",
    "Propósito e filosofia de produto", "Produtos digitais e recursos próprios", "Princípios e sistemas de design", "Projetos que planejamos e criamos", "Parcerias de distribuição e licenciamento",
    "Visão geral de parcerias", "Com quem, como e o processo", "Parcerias corporativas", "Empresas e marcas", "Pessoas e vendedores", "Vendedores individuais e criadores",
    "Setor público e instituições", "Órgãos públicos, educação, assistência", "Parcerias por plataforma", "Parceria em cada plataforma", "Parcerias estratégicas", "Longo prazo, tecnologia, global", "Contato de parceria", "Um único formulário de parceria",
  ],
  fr: [
    "Partenariats", "Partenariats", "Un point d’entrée unique pour particuliers, vendeurs, entreprises et institutions", "Voir les partenariats →",
    "Logiciels et solutions d’automatisation maison", "Produits numériques et ressources de design maison",
    "Vue d’ensemble", "Comment fonctionne l’activité produits", "Automatisation", "Solutions", "Produits d’automatisation pour les tâches répétitives", "Solutions bâties sur des produits communs",
    "Produits numériques", "Logiciels, outils et kits", "Intégration aux plateformes", "Opportunités sur six plateformes", "Contact commercial", "Adoption, licences, distribution",
    "Mission et philosophie produit", "Produits numériques et ressources maison", "Principes et systèmes de design", "Projets que nous concevons nous-mêmes", "Partenariats de distribution et de licence",
    "Vue d’ensemble des partenariats", "Avec qui, comment et la démarche", "Partenariats entreprises", "Entreprises et marques", "Particuliers et vendeurs", "Vendeurs individuels et créateurs",
    "Secteur public et institutions", "Organismes publics, éducation, social", "Partenariats par plateforme", "Collaborer sur chaque plateforme", "Partenariats stratégiques", "Long terme, technologie, international", "Demande de partenariat", "Un formulaire unique de partenariat",
  ],
  de: [
    "Partnerschaften", "Partnerschaften", "Eine Anlaufstelle für Privatpersonen, Verkäufer, Unternehmen und Institutionen", "Partnerschaften ansehen →",
    "Eigene Softwareprodukte und Automatisierungslösungen", "Eigene digitale Produkte und Design-Assets",
    "Überblick", "So funktioniert das Produktgeschäft", "Automatisierung", "Lösungen", "Automatisierungsprodukte für wiederkehrende Arbeit", "Lösungen auf gemeinsamen Produkten",
    "Digitale Produkte", "Software, Tools und Kits", "Plattform-Integration", "Chancen auf sechs Plattformen", "Geschäftsanfrage", "Einführung, Lizenzen, Vertrieb",
    "Zweck und Produktphilosophie", "Eigene digitale Produkte und Ressourcen", "Designprinzipien und -systeme", "Projekte, die wir selbst planen und bauen", "Vertriebs- und Lizenzpartnerschaften",
    "Partnerschaften im Überblick", "Mit wem, wie und der Ablauf", "Unternehmenspartnerschaften", "Unternehmen und Marken", "Privatpersonen & Verkäufer", "Einzelverkäufer und Creator",
    "Öffentlicher Sektor & Institutionen", "Behörden, Bildung, Soziales", "Plattform-Partnerschaften", "Partnerschaft je Plattform", "Strategische Partnerschaften", "Langfristig, Technologie, global", "Partnerschaftsanfrage", "Ein Formular für alle Partnerschaften",
  ],
  hi: [
    "साझेदारी", "साझेदारी", "व्यक्तियों, विक्रेताओं, कंपनियों और संस्थानों के लिए एक ही संपर्क द्वार", "साझेदारी देखें →",
    "अपने सॉफ़्टवेयर उत्पाद और स्वचालन समाधान", "अपने डिजिटल उत्पाद और डिज़ाइन एसेट",
    "परिचय", "उत्पाद-आधारित व्यवसाय कैसे चलता है", "स्वचालन", "समाधान", "दोहराए जाने वाले काम के लिए स्वचालन उत्पाद", "साझा उत्पादों पर आधारित समाधान",
    "डिजिटल उत्पाद", "सब्सक्रिप्शन सॉफ़्टवेयर, टूल और किट", "प्लेटफ़ॉर्म एकीकरण", "छह प्लेटफ़ॉर्म से जुड़े अवसर", "व्यवसाय पूछताछ", "अपनाना, लाइसेंस, वितरण",
    "Studio का उद्देश्य और उत्पाद दर्शन", "अपने डिजिटल उत्पाद और संसाधन", "उत्पाद डिज़ाइन सिद्धांत और सिस्टम", "हम स्वयं योजना बनाकर बनाते हैं", "वितरण और लाइसेंस साझेदारी",
    "साझेदारी परिचय", "किसके साथ, कैसे और प्रक्रिया", "कॉर्पोरेट साझेदारी", "कंपनियाँ और ब्रांड", "व्यक्ति और विक्रेता", "व्यक्तिगत विक्रेता और क्रिएटर",
    "सार्वजनिक और संस्थागत", "सरकारी निकाय, शिक्षा, कल्याण", "प्लेटफ़ॉर्म साझेदारी", "हर प्लेटफ़ॉर्म पर साझेदारी", "रणनीतिक साझेदारी", "दीर्घकालिक, तकनीक, वैश्विक", "साझेदारी पूछताछ", "साझेदारी का एक ही फ़ॉर्म",
  ],
  id: [
    "Kemitraan", "Kemitraan", "Satu pintu bagi individu, penjual, perusahaan, dan lembaga", "Lihat kemitraan →",
    "Produk perangkat lunak dan solusi otomatisasi sendiri", "Produk digital dan aset desain sendiri",
    "Ikhtisar", "Cara kerja bisnis produk", "Otomatisasi", "Solusi", "Produk otomatisasi untuk pekerjaan berulang", "Solusi di atas produk bersama",
    "Produk digital", "Perangkat lunak, alat, dan kit", "Integrasi platform", "Peluang di enam platform", "Pertanyaan bisnis", "Adopsi, lisensi, distribusi",
    "Tujuan dan filosofi produk", "Produk digital dan sumber daya sendiri", "Prinsip dan sistem desain produk", "Proyek yang kami rancang dan bangun sendiri", "Kemitraan distribusi dan lisensi",
    "Ikhtisar kemitraan", "Dengan siapa, bagaimana, dan prosesnya", "Kemitraan korporat", "Perusahaan dan merek", "Individu & penjual", "Penjual individu dan kreator",
    "Publik & lembaga", "Instansi publik, pendidikan, sosial", "Kemitraan platform", "Bermitra di setiap platform", "Kemitraan strategis", "Jangka panjang, teknologi, global", "Pertanyaan kemitraan", "Satu formulir kemitraan",
  ],
};

/**
 * Hub SEO + visually-hidden hero text for /business/ and /studio/ (were written for client build services).
 * [business.exploreSeoTitle, business.exploreMetaDescription, business.exploreTitle, business.exploreLead,
 *  studioHub.seoTitle, studioHub.metaDescription, studioHub.heroTitle, studioHub.heroLead]
 * exploreTitle keeps its existing "<br>" convention.
 */
const HUB_KEYS = [
  ["business", "exploreSeoTitle"], ["business", "exploreMetaDescription"], ["business", "exploreTitle"], ["business", "exploreLead"],
  ["studioHub", "seoTitle"], ["studioHub", "metaDescription"], ["studioHub", "heroTitle"], ["studioHub", "heroLead"],
];
const HUB = {
  ko: [
    "Newon Business | 자체 소프트웨어·자동화 제품", "개인 사업자, 판매자, 기업을 위한 Newon의 자체 소프트웨어 제품과 자동화 솔루션. 구독·라이선스·플랫폼 연계로 제공합니다.", "비즈니스의 반복을 줄이고,<br>성장의 가능성을 넓힙니다.", "개인 사업자, 판매자, 기업이 쓰는 Newon 자체 소프트웨어 제품과 자동화 솔루션입니다.",
    "Newon Studio | 자체 디지털 제품과 디자인", "Newon 자체 디지털 제품, 디자인 리소스, 디자인 시스템, 제품 연구·개발 프로젝트를 소개합니다.", "아이디어를 Newon만의 디지털 제품으로 발전시킵니다.", "Newon 자체 디지털 제품과 디자인 자산, 제품 연구·개발 프로젝트를 맡습니다.",
  ],
  en: [
    "Newon Business | Own software and automation products", "Newon's own software products and automation solutions for sole traders, sellers and companies, offered by subscription, licence and platform links.", "Less repetition in business,<br>more room to grow.", "Newon's own software products and automation solutions for sole traders, sellers and companies.",
    "Newon Studio | Own digital products and design", "Newon's own digital products, design resources, design systems and product R&D projects.", "Turning ideas into Newon's own digital products.", "Newon Studio looks after Newon's own digital products, design assets and product R&D.",
  ],
  ja: [
    "Newon Business | 自社ソフトウェア・自動化製品", "個人事業主・販売者・企業のためのNewon自社ソフトウェア製品と自動化ソリューション。サブスクリプション・ライセンス・プラットフォーム連携で提供します。", "ビジネスの繰り返しを減らし、<br>成長の可能性を広げます。", "個人事業主・販売者・企業が使うNewon自社のソフトウェア製品と自動化ソリューションです。",
    "Newon Studio | 自社デジタル製品とデザイン", "Newon自社のデジタル製品、デザインリソース、デザインシステム、製品研究開発プロジェクトを紹介します。", "アイデアをNewonならではのデジタル製品へ。", "Newon自社のデジタル製品、デザイン資産、製品研究開発を担います。",
  ],
  es: [
    "Newon Business | Software y automatización propios", "Productos de software y soluciones de automatización propios de Newon para autónomos, vendedores y empresas, por suscripción, licencia y plataformas.", "Menos repetición en el negocio,<br>más espacio para crecer.", "Productos de software y automatización propios de Newon para autónomos, vendedores y empresas.",
    "Newon Studio | Productos digitales y diseño propios", "Productos digitales propios de Newon, recursos y sistemas de diseño, y proyectos de I+D de producto.", "Convertimos ideas en productos digitales propios de Newon.", "Newon Studio se ocupa de los productos digitales, recursos de diseño e I+D propios de Newon.",
  ],
  "pt-br": [
    "Newon Business | Software e automação próprios", "Produtos de software e soluções de automação próprios da Newon para autônomos, vendedores e empresas, por assinatura, licença e plataformas.", "Menos repetição no negócio,<br>mais espaço para crescer.", "Produtos de software e automação próprios da Newon para autônomos, vendedores e empresas.",
    "Newon Studio | Produtos digitais e design próprios", "Produtos digitais próprios da Newon, recursos e sistemas de design e projetos de P&D de produto.", "Transformamos ideias em produtos digitais próprios da Newon.", "O Newon Studio cuida dos produtos digitais, ativos de design e P&D próprios da Newon.",
  ],
  fr: [
    "Newon Business | Logiciels et automatisation maison", "Les logiciels et solutions d’automatisation de Newon pour indépendants, vendeurs et entreprises, par abonnement, licence et plateformes.", "Moins de répétition,<br>plus de place pour grandir.", "Les logiciels et solutions d’automatisation de Newon pour indépendants, vendeurs et entreprises.",
    "Newon Studio | Produits numériques et design maison", "Les produits numériques de Newon, ses ressources et systèmes de design et ses projets de R&D produit.", "Faire des idées des produits numériques Newon.", "Newon Studio s’occupe des produits numériques, des ressources de design et de la R&D de Newon.",
  ],
  de: [
    "Newon Business | Eigene Software- und Automatisierungsprodukte", "Newons eigene Softwareprodukte und Automatisierungslösungen für Selbstständige, Verkäufer und Unternehmen – per Abo, Lizenz und Plattform-Anbindung.", "Weniger Wiederholung im Geschäft,<br>mehr Raum für Wachstum.", "Newons eigene Softwareprodukte und Automatisierungslösungen für Selbstständige, Verkäufer und Unternehmen.",
    "Newon Studio | Eigene digitale Produkte und Design", "Newons eigene digitale Produkte, Design-Ressourcen, Designsysteme und Produktentwicklungsprojekte.", "Aus Ideen werden Newons eigene digitale Produkte.", "Newon Studio betreut Newons eigene digitale Produkte, Design-Assets und Produktentwicklung.",
  ],
  hi: [
    "Newon Business | अपने सॉफ़्टवेयर और स्वचालन उत्पाद", "व्यक्तिगत व्यवसायियों, विक्रेताओं और कंपनियों के लिए Newon के अपने सॉफ़्टवेयर उत्पाद और स्वचालन समाधान — सब्सक्रिप्शन, लाइसेंस और प्लेटफ़ॉर्म के ज़रिए।", "व्यवसाय में दोहराव कम,<br>बढ़ने की संभावना ज़्यादा।", "व्यक्तिगत व्यवसायियों, विक्रेताओं और कंपनियों के लिए Newon के अपने सॉफ़्टवेयर और स्वचालन उत्पाद।",
    "Newon Studio | अपने डिजिटल उत्पाद और डिज़ाइन", "Newon के अपने डिजिटल उत्पाद, डिज़ाइन संसाधन, डिज़ाइन सिस्टम और उत्पाद अनुसंधान परियोजनाएँ।", "विचारों को Newon के अपने डिजिटल उत्पादों में बदलना।", "Newon Studio, Newon के अपने डिजिटल उत्पाद, डिज़ाइन एसेट और उत्पाद अनुसंधान संभालता है।",
  ],
  id: [
    "Newon Business | Produk perangkat lunak dan otomatisasi sendiri", "Produk perangkat lunak dan solusi otomatisasi milik Newon untuk pelaku usaha perorangan, penjual, dan perusahaan, melalui langganan, lisensi, dan platform.", "Lebih sedikit pengulangan,<br>lebih banyak ruang untuk tumbuh.", "Produk perangkat lunak dan otomatisasi milik Newon untuk pelaku usaha perorangan, penjual, dan perusahaan.",
    "Newon Studio | Produk digital dan desain sendiri", "Produk digital milik Newon, sumber daya dan sistem desain, serta proyek riset dan pengembangan produk.", "Mengubah ide menjadi produk digital milik Newon.", "Newon Studio menangani produk digital, aset desain, dan riset pengembangan produk milik Newon.",
  ],
};

export function bspNavStrings(lang) {
  const arr = T[lang];
  if (!arr || arr.length !== KEYS.length) throw new Error(`apply-bsp-locales: ${lang} has ${arr && arr.length} strings, expected ${KEYS.length}`);
  return Object.fromEntries(KEYS.map((k, i) => [k, arr[i]]));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const lang of Object.keys(T)) {
    const file = path.join(ROOT, "locales", `${lang}.json`);
    const raw = fs.readFileSync(file, "utf8");
    const data = JSON.parse(raw);
    data.nav = data.nav || {};
    Object.assign(data.nav, bspNavStrings(lang));
    HUB_KEYS.forEach(([sec, key], i) => {
      data[sec] = data[sec] || {};
      data[sec][key] = HUB[lang][i];
    });
    const out = JSON.stringify(data, null, 2) + (raw.endsWith("\n") ? "\n" : "");
    fs.writeFileSync(file, out);
  }
  console.log(`apply-bsp-locales: ${KEYS.length} nav keys + ${HUB_KEYS.length} hub keys × ${Object.keys(T).length} locales`);
}
