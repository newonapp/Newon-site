/**
 * SHAREON — Overview · Platform · Business · Partnerships · Contact (V3, Oct 2026).
 * Sources: SHAREON final integrated business plan (18 areas, 10 revenue models) and the NEWON IR summary
 * ("개발·테스트 완료 · 미출시 · 결제 OFF"). Body copy: shareon-copy-ko.mjs (KO) and shareon-copy-en.mjs (EN);
 * the seven other locales fall back to the EN body with localized SEO lines and hero titles (LOCAL below).
 *
 * First screens (film hero) were finalized by the owner: KO_HERO / EN_HERO and LOCAL hero titles are frozen —
 * do not edit them as part of content work.
 * Business introduction only: no listing, search, booking, payment, deposit, settlement, chat or login on the web.
 */
import { KO as KO_BODY } from "./shareon-copy-ko.mjs";
import { EN as EN_BODY } from "./shareon-copy-en.mjs";

/* Frozen first-screen copy (hero) per page. */
const KO_HERO = {
  overview: {"kicker":"SHAREON — ASSET SHARING & RENTAL MARKETPLACE","title":"소유하지 않아도,\n필요한 순간에.","lead":"필요한 물건은 합리적으로 이용하고, 사용하지 않는 자산에는 새로운 가치를 더하는 방법. SHAREON은 개인과 기업이 실물 자산을 공유하고 대여할 수 있도록 연결하는 오픈 마켓플레이스를 지향합니다.","ctaMain":"플랫폼 살펴보기","ctaSub":"SHAREON 알아보기"},
  platform: {"kicker":"SHAREON / PLATFORM","title":"필요한 자산을 찾고,\n보유한 자산의 가치를 연결합니다.","lead":"SHAREON은 개인과 기업이 실물 자산을 등록하고 필요한 기간 동안 대여할 수 있도록 연결하는 공유·대여 마켓플레이스를 지향합니다. 준비 중인 열여덟 가지 서비스 영역과, 대여가 안전하게 끝나기 위한 거래 시스템을 소개합니다.","ctaMain":"비즈니스 살펴보기","ctaSub":"문의하기"},
  business: {"kicker":"SHAREON / BUSINESS","title":"소유 중심의 시장에서,\n활용 중심의 경제로.","lead":"SHAREON은 개인과 기업의 실물 자산 공유·대여를 기반으로 다양한 자산 카테고리와 거래 지원, 기업 솔루션, 글로벌 공유경제 생태계로 확장하는 플랫폼을 지향합니다. 처음 검토한 20개 영역에서 공유·대여와 거리가 먼 6개를 덜어 내고, 14개 핵심 사업군으로 다시 짰습니다.","ctaMain":"파트너십 살펴보기","ctaSub":"사업 문의하기"},
  partnerships: {"kicker":"SHAREON / PARTNERSHIPS","title":"자산의 새로운 가치를\n함께 만들어갑니다.","lead":"SHAREON은 개인과 기업이 보유한 자산을 더 효율적으로 활용할 수 있도록 다양한 사업자, 기술 기업과 기관의 참여를 지향합니다.","ctaMain":"파트너십 문의하기","ctaSub":"비즈니스 살펴보기"},
  contact: {"kicker":"SHAREON / CONTACT","title":"SHAREON과 새로운 가능성을\n이야기해 주세요.","lead":"플랫폼 이용 문의부터 개인·기업 입점, 자산 대여, 거래 인프라, 기업 솔루션과 글로벌 사업 제안까지. SHAREON에 관한 문의를 NEWON 공식 경로로 받습니다.","ctaMain":"문의 양식 열기","ctaSub":"이메일 보내기"},
};
const EN_HERO = {
  overview: {"kicker":"SHAREON — ASSET SHARING & RENTAL MARKETPLACE","title":"No need to own it.\nJust when you need it.","lead":"A way to use what you need sensibly, and to add new value to assets you are not using. SHAREON aims to be an open marketplace that connects people and businesses to share and rent physical assets.","ctaMain":"Explore the platform","ctaSub":"Discover SHAREON"},
  platform: {"kicker":"SHAREON / PLATFORM","title":"Find the assets you need,\nconnect the value of what you own.","lead":"SHAREON aims to be a sharing and rental marketplace where people and businesses list physical assets and rent them for the period needed. The eighteen service areas in preparation, and the rental system that lets each rental end safely.","ctaMain":"See the business","ctaSub":"Contact us"},
  business: {"kicker":"SHAREON / BUSINESS","title":"From an ownership-centred market\nto a usage-centred economy.","lead":"Built on physical-asset sharing and rental between people and businesses, SHAREON aims to be a platform that expands into more asset categories, transaction support, business solutions and a global sharing-economy ecosystem. From the 20 areas first considered, the six furthest from sharing and rental were set aside, leaving 14 core businesses.","ctaMain":"See partnerships","ctaSub":"Business inquiry"},
  partnerships: {"kicker":"SHAREON / PARTNERSHIPS","title":"Creating new value\nfor assets, together.","lead":"SHAREON welcomes businesses, technology companies and institutions that help people and businesses use the assets they own more efficiently.","ctaMain":"Partnership inquiry","ctaSub":"See the business"},
  contact: {"kicker":"SHAREON / CONTACT","title":"Talk to SHAREON\nabout new possibilities.","lead":"From questions about using the platform to joining as a person or business, renting assets, transaction infrastructure, business solutions and global business proposals — SHAREON inquiries come through NEWON’s official channels.","ctaMain":"Open the inquiry form","ctaSub":"Send an email"},
};

const PAGE_IDS = ["overview", "platform", "business", "partnerships", "contact"];
function withHero(body, heroes) {
  const out = { ...body };
  for (const id of PAGE_IDS) out[id] = { ...body[id], hero: heroes[id] };
  return out;
}

export const KO = withHero(KO_BODY, KO_HERO);
export const EN = withHero(EN_BODY, EN_HERO);

/* Other locales: EN body with localized page titles, descriptions and hero lines (no new locales added). */
const LOCAL = {
  ja: {
    overview: { seoTitle: "SHAREON | Newon — 近所で必要な分だけ借りるシェア・レンタル", seoDescription: "SHAREONは、近所の個人と企業が持つモノ・機材・空間を必要な期間だけ貸し借りするシェア・レンタルのプラットフォームです。中心は近所の個人間の小物レンタルです。アプリは開発中で、決済・保証金・精算はまだ運営していません。", hero: { title: "所有しなくても、\n必要なときに。" } },
    platform: { seoTitle: "SHAREON プラットフォーム | 18のシェア・レンタル領域 — Newon", seoDescription: "生活用品、電子機器、撮影、キャンプ、工具、イベント、育児、ペット、ファッション、空間・保管、企業資産と社内共有、無料レンタル、信頼・運営まで。SHAREONの18の事業領域と、登録から精算までのレンタルの流れ、現在の開発状況を紹介します。" },
    business: { seoTitle: "SHAREON ビジネス | 手数料・サブスクリプション・企業SaaSの構造 — Newon", seoDescription: "SHAREONの事業モデル：誰が支払うのか、10の収益モデルと段階、保証金を売上に含めない原則、少額取引の収益性、一つの地域から始める参入計画。料率と価格は未確定です。" },
    partnerships: { seoTitle: "SHAREON パートナーシップ — Newon", seoDescription: "地域のレンタル事業者、キャンプ・工具・撮影機材の事業者、空間運営者、配送・回収、保険・保証、企業の資産管理部門、大学・機関との協力モデルと地域パイロットの提案、進め方。現在契約済みのパートナーはいません。" },
    contact: { seoTitle: "SHAREON お問い合わせ — Newon", seoDescription: "SHAREONの利用、出店、空間、企業資産、提携、技術、報道、投資に関するお問い合わせは、NEWONの公式フォームと newon@newon.app で受け付けています。" },
  },
  es: {
    overview: { seoTitle: "SHAREON | Newon — Alquila cerca lo que necesitas, el tiempo que lo necesitas", seoDescription: "SHAREON es una plataforma para compartir y alquilar objetos, equipos y espacios de vecinos y empresas solo durante el tiempo necesario. Su núcleo es el alquiler de objetos pequeños entre vecinos; la app está en desarrollo y aún no hay pagos, depósitos ni liquidaciones.", hero: { title: "Sin tenerlo en propiedad.\nJusto cuando lo necesitas." } },
    platform: { seoTitle: "SHAREON Plataforma | 18 áreas de alquiler y uso compartido — Newon", seoDescription: "Hogar, electrónica, cámaras, camping, herramientas, eventos, bebés, mascotas y moda; espacios y almacenamiento; activos de empresa y uso interno; préstamo gratuito, confianza y operación. Las 18 áreas de SHAREON, el flujo de alquiler y el estado de desarrollo." },
    business: { seoTitle: "SHAREON Negocio | Comisiones, suscripciones y SaaS para empresas — Newon", seoDescription: "El modelo de negocio de SHAREON: quién paga, diez modelos de ingresos y sus etapas, por qué los depósitos no son ingresos, la economía de los alquileres pequeños y un plan de entrada que empieza en un barrio. Las tarifas no están decididas." },
    partnerships: { seoTitle: "SHAREON Alianzas — Newon", seoDescription: "Modelos de colaboración con tiendas de alquiler, operadores de espacios, entrega y recogida, seguros, equipos de activos de empresas, universidades e instituciones, con propuestas de pilotos locales. Hoy no hay socios con contrato." },
    contact: { seoTitle: "SHAREON Contacto — Newon", seoDescription: "Consultas sobre uso, alta de empresas, espacios, activos de empresa, socios, tecnología, prensa e inversión de SHAREON a través del formulario oficial de NEWON y newon@newon.app." },
  },
  "pt-br": {
    overview: { seoTitle: "SHAREON | Newon — Alugue perto o que precisa, pelo tempo que precisar", seoDescription: "O SHAREON é uma plataforma de compartilhamento e aluguel de objetos, equipamentos e espaços de vizinhos e empresas, só pelo período necessário. O foco é o aluguel de itens pequenos entre vizinhos; o app está em desenvolvimento e ainda não há pagamentos, depósitos ou repasses.", hero: { title: "Sem precisar ter.\nNa hora em que você precisa." } },
    platform: { seoTitle: "SHAREON Plataforma | 18 áreas de aluguel e compartilhamento — Newon", seoDescription: "Casa, eletrônicos, câmeras, camping, ferramentas, eventos, bebês, pets e moda; espaços e armazenamento; ativos de empresas e uso interno; empréstimo gratuito, confiança e operação. As 18 áreas do SHAREON, o fluxo de aluguel e o estado do desenvolvimento." },
    business: { seoTitle: "SHAREON Negócios | Taxas, assinaturas e SaaS para empresas — Newon", seoDescription: "O modelo de negócio do SHAREON: quem paga, dez modelos de receita e suas etapas, por que depósitos não são receita, a economia dos aluguéis pequenos e um plano de entrada que começa em um bairro. As taxas não estão definidas." },
    partnerships: { seoTitle: "SHAREON Parcerias — Newon", seoDescription: "Modelos de colaboração com locadoras, operadores de espaços, entrega e coleta, seguros, equipes de ativos de empresas, universidades e instituições, com propostas de pilotos locais. Hoje não há parceiros com contrato." },
    contact: { seoTitle: "SHAREON Contato — Newon", seoDescription: "Dúvidas sobre uso, cadastro de empresas, espaços, ativos de empresas, parceiros, tecnologia, imprensa e investimento do SHAREON pelo formulário oficial da NEWON e newon@newon.app." },
  },
  fr: {
    overview: { seoTitle: "SHAREON | Newon — Louer près de chez soi ce qu’il faut, le temps qu’il faut", seoDescription: "SHAREON est une plateforme de partage et de location d’objets, d’équipements et d’espaces entre voisins et entreprises, juste pour la durée nécessaire. Son cœur est la location de petits objets entre voisins ; l’app est en développement et paiement, dépôts et règlements ne fonctionnent pas encore.", hero: { title: "Pas besoin de posséder.\nJuste quand il le faut." } },
    platform: { seoTitle: "SHAREON Plateforme | 18 domaines de partage et de location — Newon", seoDescription: "Maison, électronique, photo, camping, outils, événements, bébé, animaux et mode ; espaces et stockage ; actifs d’entreprise et partage interne ; prêt gratuit, confiance et exploitation. Les 18 domaines de SHAREON, le parcours de location et l’état du développement." },
    business: { seoTitle: "SHAREON Business | Commissions, abonnements et SaaS pour entreprises — Newon", seoDescription: "Le modèle économique de SHAREON : qui paie, dix modèles de revenus et leurs étapes, pourquoi les dépôts ne sont pas des revenus, l’économie des petites locations et un plan d’entrée qui commence dans un quartier. Les taux ne sont pas fixés." },
    partnerships: { seoTitle: "SHAREON Partenariats — Newon", seoDescription: "Modèles de collaboration avec loueurs locaux, gestionnaires d’espaces, livraison et collecte, assurance, services d’actifs d’entreprise, universités et institutions, avec des propositions de pilotes locaux. Aucun partenaire sous contrat aujourd’hui." },
    contact: { seoTitle: "SHAREON Contact — Newon", seoDescription: "Questions sur l’utilisation, l’inscription des entreprises, les espaces, les actifs d’entreprise, les partenaires, la technique, la presse et l’investissement via le formulaire officiel de NEWON et newon@newon.app." },
  },
  de: {
    overview: { seoTitle: "SHAREON | Newon — In der Nähe leihen, was man braucht, so lange man es braucht", seoDescription: "SHAREON ist eine Plattform zum Teilen und Mieten von Dingen, Geräten und Räumen zwischen Nachbarn und Unternehmen, nur für die benötigte Zeit. Kern ist das Verleihen kleiner Gegenstände unter Nachbarn; die App ist in Entwicklung, Zahlung, Kaution und Abrechnung laufen noch nicht.", hero: { title: "Nicht besitzen müssen.\nGenau dann, wenn man es braucht." } },
    platform: { seoTitle: "SHAREON Plattform | 18 Bereiche für Teilen und Mieten — Newon", seoDescription: "Haushalt, Elektronik, Kamera, Camping, Werkzeug, Events, Baby, Haustier und Mode; Räume und Lager; Unternehmenswerte und internes Teilen; kostenloses Verleihen, Vertrauen und Betrieb. Die 18 Bereiche von SHAREON, der Mietablauf und der Entwicklungsstand." },
    business: { seoTitle: "SHAREON Business | Gebühren, Abos und SaaS für Unternehmen — Newon", seoDescription: "Das Geschäftsmodell von SHAREON: wer zahlt, zehn Erlösmodelle und ihre Stufen, warum Kautionen kein Umsatz sind, die Wirtschaftlichkeit kleiner Mieten und ein Markteintritt, der in einem Viertel beginnt. Gebührensätze stehen nicht fest." },
    partnerships: { seoTitle: "SHAREON Partnerschaften — Newon", seoDescription: "Kooperationsmodelle mit Verleihern, Raumbetreibern, Liefer- und Abholdiensten, Versicherungen, Asset-Teams in Unternehmen, Hochschulen und Einrichtungen sowie Vorschläge für lokale Piloten. Derzeit gibt es keine Vertragspartner." },
    contact: { seoTitle: "SHAREON Kontakt — Newon", seoDescription: "Anfragen zu Nutzung, Anbieter-Anmeldung, Räumen, Unternehmenswerten, Partnern, Technik, Presse und Investitionen über das offizielle Formular von NEWON und newon@newon.app." },
  },
  hi: {
    overview: { seoTitle: "SHAREON | Newon — पास में, ज़रूरत भर के लिए किराये पर लें", seoDescription: "SHAREON पड़ोसियों और व्यवसायों की चीज़ों, उपकरणों और जगहों को सिर्फ़ ज़रूरी अवधि के लिए किराये पर देने-लेने का प्लेटफ़ॉर्म है। इसका मुख्य हिस्सा पड़ोसियों के बीच छोटी चीज़ों का किराया है; ऐप विकास में है और भुगतान, जमा राशि और सेटलमेंट अभी चालू नहीं हैं।", hero: { title: "मालिक बने बिना,\nठीक ज़रूरत के समय।" } },
    platform: { seoTitle: "SHAREON प्लेटफ़ॉर्म | साझा और किराये के 18 क्षेत्र — Newon", seoDescription: "घरेलू सामान, इलेक्ट्रॉनिक्स, कैमरा, कैंपिंग, औज़ार, इवेंट, शिशु, पालतू और फ़ैशन; जगहें और भंडारण; कंपनी की संपत्ति और आंतरिक साझा; मुफ़्त उधार, भरोसा और संचालन। SHAREON के 18 क्षेत्र, किराये की प्रक्रिया और विकास की स्थिति।" },
    business: { seoTitle: "SHAREON बिज़नेस | शुल्क, सदस्यता और व्यवसायों के लिए SaaS — Newon", seoDescription: "SHAREON का बिज़नेस मॉडल: कौन भुगतान करता है, दस आय मॉडल और उनके चरण, जमा राशि आय क्यों नहीं है, छोटे किराये का अर्थशास्त्र और एक मोहल्ले से शुरू होने वाली योजना। दरें तय नहीं हैं।" },
    partnerships: { seoTitle: "SHAREON साझेदारी — Newon", seoDescription: "स्थानीय किराया दुकानों, जगह संचालकों, डिलीवरी और वापसी, बीमा, कंपनियों की एसेट टीमों, विश्वविद्यालयों और संस्थानों के साथ सहयोग मॉडल और स्थानीय पायलट प्रस्ताव। अभी कोई अनुबंधित साझेदार नहीं है।" },
    contact: { seoTitle: "SHAREON संपर्क — Newon", seoDescription: "SHAREON के उपयोग, व्यवसाय पंजीकरण, जगहों, कंपनी संपत्ति, साझेदारी, तकनीक, मीडिया और निवेश से जुड़े सवाल NEWON के आधिकारिक फ़ॉर्म और newon@newon.app से भेजें।" },
  },
  id: {
    overview: { seoTitle: "SHAREON | Newon — Sewa di dekat rumah, seperlunya dan selama dibutuhkan", seoDescription: "SHAREON adalah platform berbagi dan sewa barang, peralatan, dan ruang milik tetangga dan bisnis, hanya untuk jangka waktu yang dibutuhkan. Intinya adalah sewa barang kecil antartetangga; aplikasi masih dikembangkan dan pembayaran, deposit, serta penyelesaian dana belum berjalan.", hero: { title: "Tak perlu memiliki.\nTepat saat dibutuhkan." } },
    platform: { seoTitle: "SHAREON Platform | 18 bidang berbagi dan sewa — Newon", seoDescription: "Rumah tangga, elektronik, kamera, berkemah, perkakas, acara, bayi, hewan peliharaan, dan fesyen; ruang dan penyimpanan; aset perusahaan dan berbagi internal; pinjam gratis, kepercayaan, dan operasional. 18 bidang SHAREON, alur sewa, dan status pengembangan." },
    business: { seoTitle: "SHAREON Bisnis | Komisi, langganan, dan SaaS untuk bisnis — Newon", seoDescription: "Model bisnis SHAREON: siapa yang membayar, sepuluh model pendapatan dan tahapannya, mengapa deposit bukan pendapatan, ekonomi sewa bernilai kecil, dan rencana masuk pasar yang dimulai dari satu lingkungan. Tarif belum ditetapkan." },
    partnerships: { seoTitle: "SHAREON Kemitraan — Newon", seoDescription: "Model kerja sama dengan usaha sewa lokal, pengelola ruang, pengiriman dan penjemputan, asuransi, tim aset perusahaan, universitas, dan lembaga, beserta usulan pilot lokal. Saat ini belum ada mitra yang terikat kontrak." },
    contact: { seoTitle: "SHAREON Kontak — Newon", seoDescription: "Pertanyaan tentang penggunaan, pendaftaran bisnis, ruang, aset perusahaan, kemitraan, teknologi, media, dan investasi SHAREON melalui formulir resmi NEWON dan newon@newon.app." },
  },
};

function deepMerge(base, over) {
  if (!over || typeof over !== "object" || Array.isArray(over)) return over === undefined ? base : over;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = deepMerge(base ? base[k] : undefined, v);
  return out;
}

/** Full copy for a locale; `contentLang` tells the renderer which language the body text is in. */
export function getShareonCopy(lang) {
  if (lang === "ko") return { ...KO, contentLang: "ko" };
  if (lang === "en") return { ...EN, contentLang: "en" };
  const over = LOCAL[lang];
  const heroLang = {};
  for (const [id, v] of Object.entries(over || {})) if (v && v.hero && v.hero.title) heroLang[id] = lang;
  return { ...(over ? deepMerge(EN, over) : EN), lang, contentLang: "en", heroLang };
}

export const SHAREON_PAGES = [
  { id: "overview", path: "shareon" },
  { id: "platform", path: "shareon/platform" },
  { id: "business", path: "shareon/business" },
  { id: "partnerships", path: "shareon/partnerships" },
  { id: "contact", path: "shareon/contact" },
];

/** Areas removed from SHAREON's core business (plan §3). Never rendered; used by checks to make sure they stay off the pages. */
export const EXCLUDED_BUSINESS_TERMS = {
  ko: ["중고거래", "신상품 쇼핑", "공동구매", "생활 서비스 예약", "클래스", "디지털 상품"],
  en: ["Second-hand trading", "New-product shopping", "Group buying", "Life-service booking", "Classes", "Digital goods"],
};
