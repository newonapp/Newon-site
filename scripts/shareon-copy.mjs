/**
 * SHAREON — Overview · Platform · Business · Partnerships · Contact (V3, Oct 2026).
 * 2026-11-04 refresh (owner-approved): official business introduction and partnership site — no development / launch
 * status, no pricing, fee or settlement detail. Body copy: shareon-copy-ko.mjs (KO) and shareon-copy-en.mjs (EN); the
 * seven other locales fall back to the EN body with localized SEO lines and hero titles (LOCAL below; these localized
 * lines are not native-reviewed).
 *
 * First screens (film hero) were finalized by the owner: KO_HERO / EN_HERO and LOCAL hero titles are frozen —
 * do not edit them as part of content work. Exception (owner, 2026-11-04, this refresh only): the platform and
 * business hero leads were updated to the current business structure.
 * Business introduction only: no listing, search, booking, payment, deposit, settlement, chat or login on the web.
 */
import { KO as KO_BODY } from "./shareon-copy-ko.mjs";
import { EN as EN_BODY } from "./shareon-copy-en.mjs";

/* Frozen first-screen copy (hero) per page. */
const KO_HERO = {
  overview: {"kicker":"SHAREON — ASSET SHARING & RENTAL MARKETPLACE","title":"소유하지 않아도,\n필요한 순간에.","lead":"필요한 물건은 합리적으로 이용하고, 사용하지 않는 자산에는 새로운 가치를 더하는 방법. SHAREON은 개인과 기업이 실물 자산을 공유하고 대여할 수 있도록 연결하는 오픈 마켓플레이스를 지향합니다.","ctaMain":"플랫폼 살펴보기","ctaSub":"SHAREON 알아보기"},
  platform: {"kicker":"SHAREON / PLATFORM","title":"필요한 자산을 찾고,\n보유한 자산의 가치를 연결합니다.","lead":"SHAREON은 개인과 기업이 실물 자산을 등록하고 필요한 기간 동안 대여할 수 있도록 연결하는 공유·대여 마켓플레이스를 지향합니다. 물품·장비와 공간 분야, 그리고 대여가 안전하게 끝나기 위한 거래 구조를 소개합니다.","ctaMain":"비즈니스 살펴보기","ctaSub":"문의하기"},
  business: {"kicker":"SHAREON / BUSINESS","title":"소유 중심의 시장에서,\n활용 중심의 경제로.","lead":"SHAREON은 개인과 기업의 실물 자산 공유·대여를 기반으로 다양한 자산 카테고리와 거래 지원, 기업 솔루션, 글로벌 공유경제 생태계로 확장하는 플랫폼을 지향합니다. 개인과 기업이 함께 참여하는 네 가지 거래 유형과 기업 협력 구조를 소개합니다.","ctaMain":"파트너십 살펴보기","ctaSub":"사업 문의하기"},
  partnerships: {"kicker":"SHAREON / PARTNERSHIPS","title":"자산의 새로운 가치를\n함께 만들어갑니다.","lead":"SHAREON은 개인과 기업이 보유한 자산을 더 효율적으로 활용할 수 있도록 다양한 사업자, 기술 기업과 기관의 참여를 지향합니다.","ctaMain":"파트너십 문의하기","ctaSub":"비즈니스 살펴보기"},
  contact: {"kicker":"SHAREON / CONTACT","title":"SHAREON과 새로운 가능성을\n이야기해 주세요.","lead":"플랫폼 이용 문의부터 개인·기업 입점, 자산 대여, 거래 인프라, 기업 솔루션과 글로벌 사업 제안까지. SHAREON에 관한 문의를 NEWON 공식 경로로 받습니다.","ctaMain":"문의 양식 열기","ctaSub":"이메일 보내기"},
};
const EN_HERO = {
  overview: {"kicker":"SHAREON — ASSET SHARING & RENTAL MARKETPLACE","title":"No need to own it.\nJust when you need it.","lead":"A way to use what you need sensibly, and to add new value to assets you are not using. SHAREON aims to be an open marketplace that connects people and businesses to share and rent physical assets.","ctaMain":"Explore the platform","ctaSub":"Discover SHAREON"},
  platform: {"kicker":"SHAREON / PLATFORM","title":"Find the assets you need,\nconnect the value of what you own.","lead":"SHAREON aims to be a sharing and rental marketplace where people and businesses list physical assets and rent them for the period needed. Here are the goods, equipment and space fields, and the trade structure that lets each rental end safely.","ctaMain":"See the business","ctaSub":"Contact us"},
  business: {"kicker":"SHAREON / BUSINESS","title":"From an ownership-centred market\nto a usage-centred economy.","lead":"Built on physical-asset sharing and rental between people and businesses, SHAREON aims to be a platform that expands into more asset categories, transaction support, business solutions and a global sharing-economy ecosystem. Here are the four trade types in which people and businesses take part together, and how SHAREON works with businesses.","ctaMain":"See partnerships","ctaSub":"Business inquiry"},
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
    overview: { seoTitle: "SHAREON | Newon — 個人と企業がつながるシェア・レンタルプラットフォーム", seoDescription: "SHAREONは、個人と企業がモノ・機材・空間を所有権の移転なく必要な期間だけ共有・レンタルできるプラットフォームです。地域の個人間取引と全国規模の企業レンタルを、C2C・B2C・C2B・B2Bの取引形態で扱います。", hero: { title: "所有しなくても、\n必要なときに。" } },
    platform: { seoTitle: "SHAREON プラットフォーム | モノ・機材・空間のシェア・レンタル分野 — Newon", seoDescription: "生活・家電、デジタル、撮影、キャンプ・スポーツ、育児・ペット、医療・リハビリ、シニアケア、産業・物流・研究機材と、業務・撮影・練習・集まりの空間まで。SHAREONの分野と、探す・確認・予約・受け渡し・返却・レビューの流れを紹介します。" },
    business: { seoTitle: "SHAREON ビジネス | シェア・レンタルの事業モデルと参加の仕組み — Newon", seoDescription: "個人と企業がC2C・B2C・C2B・B2Bで参加するシェア・レンタルの仕組み、企業との協力の進め方、市場機会、グローバルの方向性、運営・法務の原則を紹介します。" },
    partnerships: { seoTitle: "SHAREON パートナーシップ — Newon", seoDescription: "レンタル事業者、撮影・キャンプ・産業機材の企業、空間運営者、配送・回収、決済インフラ、保険、企業の資産部門、大学・機関との協力の形と進め方を紹介します。" },
    contact: { seoTitle: "SHAREON お問い合わせ — Newon", seoDescription: "SHAREONの利用、企業の出店、空間、企業資産、提携、技術、報道、投資に関するお問い合わせは、NEWONの公式フォームとnewon@newon.appで受け付けます。" },
  },
  es: {
    overview: { seoTitle: "SHAREON | Newon — Plataforma de alquiler y uso compartido para personas y empresas", seoDescription: "SHAREON es una plataforma donde personas y empresas comparten y alquilan objetos, equipos y espacios durante el tiempo que necesitan, sin transferir la propiedad. Reúne operaciones locales entre personas y alquileres de empresas en todo el país, en modalidades C2C, B2C, C2B y B2B.", hero: { title: "Sin tenerlo en propiedad.\nJusto cuando lo necesitas." } },
    platform: { seoTitle: "SHAREON Plataforma | Alquiler de objetos, equipos y espacios — Newon", seoDescription: "Hogar y electrodomésticos, digital, foto y vídeo, camping y deporte, bebés y mascotas, salud y rehabilitación, cuidado de mayores, equipos industriales, logísticos, agrícolas y de investigación, y espacios de trabajo, rodaje, ensayo y reuniones: los ámbitos de SHAREON y su flujo de alquiler." },
    business: { seoTitle: "SHAREON Negocio | Modelo de negocio y participación de personas y empresas — Newon", seoDescription: "El modelo de negocio de SHAREON: cómo participan personas y empresas en C2C, B2C, C2B y B2B, cómo colaboran las empresas, la oportunidad de mercado, la dirección global y los principios operativos y legales." },
    partnerships: { seoTitle: "SHAREON Alianzas — Newon", seoDescription: "Formas de colaborar con empresas de alquiler, equipos de foto, camping e industria, operadores de espacios, entrega y recogida, infraestructura de pago, seguros, equipos de activos de empresas, universidades e instituciones." },
    contact: { seoTitle: "SHAREON Contacto — Newon", seoDescription: "Consultas sobre uso, alta de empresas, espacios, activos de empresa, alianzas, tecnología, prensa e inversión de SHAREON a través del formulario oficial de NEWON y newon@newon.app." },
  },
  "pt-br": {
    overview: { seoTitle: "SHAREON | Newon — Plataforma de compartilhamento e aluguel para pessoas e empresas", seoDescription: "O SHAREON é uma plataforma em que pessoas e empresas compartilham e alugam objetos, equipamentos e espaços pelo tempo necessário, sem transferência de propriedade. Reúne negociações locais entre pessoas e aluguéis de empresas em todo o país, nos tipos C2C, B2C, C2B e B2B.", hero: { title: "Sem precisar ter.\nNa hora em que você precisa." } },
    platform: { seoTitle: "SHAREON Plataforma | Aluguel de objetos, equipamentos e espaços — Newon", seoDescription: "Casa e eletrodomésticos, digital, foto e vídeo, camping e esportes, bebês e pets, saúde e reabilitação, cuidado de idosos, equipamentos industriais, de logística, agricultura e pesquisa, e espaços de trabalho, gravação, ensaio e encontros: as áreas do SHAREON e seu fluxo de aluguel." },
    business: { seoTitle: "SHAREON Negócios | Modelo de negócio e participação de pessoas e empresas — Newon", seoDescription: "O modelo de negócio do SHAREON: como pessoas e empresas participam em C2C, B2C, C2B e B2B, como as empresas colaboram, a oportunidade de mercado, a direção global e os princípios operacionais e jurídicos." },
    partnerships: { seoTitle: "SHAREON Parcerias — Newon", seoDescription: "Formas de colaborar com locadoras, empresas de equipamentos de foto, camping e indústria, operadores de espaços, entrega e coleta, infraestrutura de pagamento, seguros, equipes de ativos de empresas, universidades e instituições." },
    contact: { seoTitle: "SHAREON Contato — Newon", seoDescription: "Dúvidas sobre uso, cadastro de empresas, espaços, ativos de empresas, parcerias, tecnologia, imprensa e investimento do SHAREON pelo formulário oficial da NEWON e newon@newon.app." },
  },
  fr: {
    overview: { seoTitle: "SHAREON | Newon — Plateforme de partage et de location pour particuliers et entreprises", seoDescription: "SHAREON est une plateforme où particuliers et entreprises partagent et louent objets, équipements et espaces pour la durée nécessaire, sans transfert de propriété. Elle réunit les échanges locaux entre particuliers et la location d’entreprises dans tout le pays, en C2C, B2C, C2B et B2B.", hero: { title: "Pas besoin de posséder.\nJuste quand il le faut." } },
    platform: { seoTitle: "SHAREON Plateforme | Location d’objets, d’équipements et d’espaces — Newon", seoDescription: "Maison et électroménager, numérique, photo et vidéo, camping et sport, bébé et animaux, santé et rééducation, aide aux seniors, équipements industriels, logistiques, agricoles et de recherche, et espaces de travail, de tournage, de répétition et de réunion : les domaines de SHAREON et son parcours de location." },
    business: { seoTitle: "SHAREON Business | Modèle économique et participation des particuliers et entreprises — Newon", seoDescription: "Le modèle économique de SHAREON : la participation des particuliers et des entreprises en C2C, B2C, C2B et B2B, la collaboration avec les entreprises, l’opportunité de marché, la direction internationale et les principes opérationnels et juridiques." },
    partnerships: { seoTitle: "SHAREON Partenariats — Newon", seoDescription: "Modes de collaboration avec loueurs, entreprises d’équipements photo, camping et industriels, gestionnaires d’espaces, livraison et collecte, infrastructure de paiement, assurance, services d’actifs d’entreprise, universités et institutions." },
    contact: { seoTitle: "SHAREON Contact — Newon", seoDescription: "Questions sur l’utilisation, l’inscription des entreprises, les espaces, les actifs d’entreprise, les partenariats, la technique, la presse et l’investissement de SHAREON via le formulaire officiel de NEWON et newon@newon.app." },
  },
  de: {
    overview: { seoTitle: "SHAREON | Newon — Plattform zum Teilen und Mieten für Privatpersonen und Unternehmen", seoDescription: "SHAREON ist eine Plattform, auf der Privatpersonen und Unternehmen Dinge, Geräte und Räume für die benötigte Zeit teilen und mieten, ohne Eigentumsübertragung. Sie verbindet lokale Geschäfte zwischen Privatpersonen und landesweite Unternehmensvermietung in C2C, B2C, C2B und B2B.", hero: { title: "Nicht besitzen müssen.\nGenau dann, wenn man es braucht." } },
    platform: { seoTitle: "SHAREON Plattform | Dinge, Geräte und Räume teilen und mieten — Newon", seoDescription: "Haushalt und Elektrogeräte, Digitales, Foto und Video, Camping und Sport, Baby und Haustier, Medizin und Reha, Seniorenpflege, Industrie-, Logistik-, Landwirtschafts- und Laborgeräte sowie Räume für Arbeit, Drehs, Proben und Treffen: die Bereiche von SHAREON und der Mietablauf." },
    business: { seoTitle: "SHAREON Business | Geschäftsmodell und Teilnahme von Privatpersonen und Unternehmen — Newon", seoDescription: "Das Geschäftsmodell von SHAREON: wie Privatpersonen und Unternehmen in C2C, B2C, C2B und B2B teilnehmen, wie Unternehmen mitwirken, die Marktchance, die globale Ausrichtung sowie Betriebs- und Rechtsgrundsätze." },
    partnerships: { seoTitle: "SHAREON Partnerschaften — Newon", seoDescription: "Formen der Zusammenarbeit mit Verleihern, Foto-, Camping- und Industriegeräte-Unternehmen, Raumbetreibern, Liefer- und Abholdiensten, Zahlungsinfrastruktur, Versicherungen, Asset-Teams in Unternehmen, Hochschulen und Institutionen." },
    contact: { seoTitle: "SHAREON Kontakt — Newon", seoDescription: "Anfragen zu Nutzung, Unternehmens-Anmeldung, Räumen, Unternehmenswerten, Partnerschaften, Technik, Presse und Investitionen über das offizielle Formular von NEWON und newon@newon.app." },
  },
  hi: {
    overview: { seoTitle: "SHAREON | Newon — व्यक्तियों और व्यवसायों के लिए साझा और किराये का प्लेटफ़ॉर्म", seoDescription: "SHAREON एक प्लेटफ़ॉर्म है जहाँ व्यक्ति और व्यवसाय सामान, उपकरण और जगहें स्वामित्व बदले बिना ज़रूरत की अवधि के लिए साझा करते और किराये पर लेते हैं। यह स्थानीय व्यक्तिगत लेन-देन और देशभर के व्यावसायिक किराये को C2C, B2C, C2B और B2B रूपों में एक साथ जोड़ता है।", hero: { title: "मालिक बने बिना,\nठीक ज़रूरत के समय।" } },
    platform: { seoTitle: "SHAREON प्लेटफ़ॉर्म | सामान, उपकरण और जगहों का साझा और किराया — Newon", seoDescription: "घर और उपकरण, डिजिटल, फ़ोटो-वीडियो, कैंपिंग और खेल, शिशु और पालतू, चिकित्सा और पुनर्वास, वरिष्ठ देखभाल, औद्योगिक, लॉजिस्टिक्स, कृषि और अनुसंधान उपकरण, और काम, शूटिंग, रिहर्सल व मिलन की जगहें: SHAREON के क्षेत्र और किराये की प्रक्रिया।" },
    business: { seoTitle: "SHAREON बिज़नेस | व्यवसाय मॉडल और व्यक्तियों व व्यवसायों की भागीदारी — Newon", seoDescription: "SHAREON का व्यवसाय मॉडल: व्यक्ति और व्यवसाय C2C, B2C, C2B और B2B में कैसे भाग लेते हैं, व्यवसायों के साथ सहयोग, बाज़ार का अवसर, वैश्विक दिशा और संचालन व कानूनी सिद्धांत।" },
    partnerships: { seoTitle: "SHAREON साझेदारी — Newon", seoDescription: "किराया व्यवसायों, फ़ोटो, कैंपिंग और औद्योगिक उपकरण कंपनियों, जगह संचालकों, डिलीवरी और वापसी, भुगतान ढाँचे, बीमा, कंपनियों की एसेट टीमों, विश्वविद्यालयों और संस्थानों के साथ सहयोग के तरीके।" },
    contact: { seoTitle: "SHAREON संपर्क — Newon", seoDescription: "SHAREON के उपयोग, व्यवसाय पंजीकरण, जगहों, कंपनी संपत्ति, साझेदारी, तकनीक, मीडिया और निवेश से जुड़ी पूछताछ NEWON के आधिकारिक फ़ॉर्म और newon@newon.app पर।" },
  },
  id: {
    overview: { seoTitle: "SHAREON | Newon — Platform berbagi dan sewa untuk perorangan dan bisnis", seoDescription: "SHAREON adalah platform tempat perorangan dan bisnis berbagi dan menyewakan barang, peralatan, dan ruang selama dibutuhkan, tanpa perpindahan kepemilikan. Platform ini menyatukan transaksi lokal antarperorangan dan sewa bisnis berskala nasional dalam bentuk C2C, B2C, C2B, dan B2B.", hero: { title: "Tak perlu memiliki.\nTepat saat dibutuhkan." } },
    platform: { seoTitle: "SHAREON Platform | Sewa barang, peralatan, dan ruang — Newon", seoDescription: "Rumah tangga dan elektronik, digital, foto dan video, berkemah dan olahraga, bayi dan hewan peliharaan, medis dan rehabilitasi, perawatan lansia, peralatan industri, logistik, pertanian, dan riset, serta ruang kerja, pemotretan, latihan, dan pertemuan: bidang SHAREON dan alur sewanya." },
    business: { seoTitle: "SHAREON Bisnis | Model bisnis dan partisipasi perorangan serta bisnis — Newon", seoDescription: "Model bisnis SHAREON: cara perorangan dan bisnis berpartisipasi dalam C2C, B2C, C2B, dan B2B, cara bekerja sama dengan bisnis, peluang pasar, arah global, serta prinsip operasional dan hukum." },
    partnerships: { seoTitle: "SHAREON Kemitraan — Newon", seoDescription: "Bentuk kerja sama dengan usaha sewa, perusahaan peralatan foto, berkemah, dan industri, pengelola ruang, pengiriman dan penjemputan, infrastruktur pembayaran, asuransi, tim aset perusahaan, universitas, dan lembaga." },
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

/**
 * SHAREON space taxonomy, S13 final r1 (2026-11-02; source: Newon-shareon-s13-space shared/s13/space_taxonomy35.json).
 * Kept as data only (owner, 2026-11-04): it is NOT rendered and is not a final service list until S25 publishes the
 * official classification. Pages introduce only the 7 "active" categories; phase-1 candidates (2) and phase-2 review (11)
 * stay unlisted; legal hold (15, incl. 3 prohibited types) is excluded from trading and recruitment.
 */
export const SPACE_TAXONOMY_S13 = [
  { no: 1, group: "A", groupKo: "업무·교육·상업", ko: "회의·비즈니스", phase: "active" },
  { no: 2, group: "A", groupKo: "업무·교육·상업", ko: "사무실·공유오피스", phase: "active" },
  { no: 3, group: "A", groupKo: "업무·교육·상업", ko: "교육·강의·연수", phase: "phase2_review" },
  { no: 4, group: "A", groupKo: "업무·교육·상업", ko: "전시·갤러리", phase: "phase2_review" },
  { no: 5, group: "A", groupKo: "업무·교육·상업", ko: "팝업스토어·쇼룸", phase: "active" },
  { no: 6, group: "A", groupKo: "업무·교육·상업", ko: "매장·상업시설", phase: "phase2_review" },
  { no: 7, group: "A", groupKo: "업무·교육·상업", ko: "컨벤션·대형 행사", phase: "active" },
  { no: 8, group: "B", groupKo: "문화·예술·콘텐츠", ko: "사진·영상 촬영", phase: "active" },
  { no: 9, group: "B", groupKo: "문화·예술·콘텐츠", ko: "방송·녹음·제작", phase: "phase1_candidate" },
  { no: 10, group: "B", groupKo: "문화·예술·콘텐츠", ko: "음악·댄스 연습", phase: "active" },
  { no: 11, group: "B", groupKo: "문화·예술·콘텐츠", ko: "공연·극장", phase: "phase2_review" },
  { no: 12, group: "B", groupKo: "문화·예술·콘텐츠", ko: "영화·상영", phase: "legal_hold" },
  { no: 13, group: "B", groupKo: "문화·예술·콘텐츠", ko: "공방·창작", phase: "phase2_review" },
  { no: 14, group: "B", groupKo: "문화·예술·콘텐츠", ko: "독서·문화모임", phase: "phase1_candidate" },
  { no: 15, group: "C", groupKo: "모임·식음료·행사", ko: "파티·프라이빗 모임", phase: "active" },
  { no: 16, group: "C", groupKo: "모임·식음료·행사", ko: "카페·라운지", phase: "legal_hold" },
  { no: 17, group: "C", groupKo: "모임·식음료·행사", ko: "레스토랑·다이닝", phase: "legal_hold" },
  { no: 18, group: "C", groupKo: "모임·식음료·행사", ko: "공유주방·쿠킹", phase: "legal_hold" },
  { no: 19, group: "C", groupKo: "모임·식음료·행사", ko: "웨딩·가족행사", phase: "phase2_review" },
  { no: 20, group: "C", groupKo: "모임·식음료·행사", ko: "루프탑·테라스·정원", phase: "phase2_review" },
  { no: 21, group: "D", groupKo: "스포츠·건강·생활", ko: "실내 스포츠", phase: "phase2_review" },
  { no: 22, group: "D", groupKo: "스포츠·건강·생활", ko: "야외 스포츠·레저", phase: "phase2_review" },
  { no: 23, group: "D", groupKo: "스포츠·건강·생활", ko: "피트니스·웰니스", phase: "phase2_review" },
  { no: 24, group: "D", groupKo: "스포츠·건강·생활", ko: "뷰티·미용", phase: "legal_hold" },
  { no: 25, group: "D", groupKo: "스포츠·건강·생활", ko: "반려동물 공간", phase: "phase2_review" },
  { no: 26, group: "E", groupKo: "숙박·주거·전통", ko: "독채·숙박·워크숍", phase: "legal_hold_prohibited" },
  { no: 27, group: "E", groupKo: "숙박·주거·전통", ko: "한옥·전통문화", phase: "legal_hold_prohibited" },
  { no: 28, group: "E", groupKo: "숙박·주거·전통", ko: "단기 주거·생활", phase: "legal_hold_prohibited" },
  { no: 29, group: "F", groupKo: "산업·물류·이동", ko: "창고·보관", phase: "legal_hold" },
  { no: 30, group: "F", groupKo: "산업·물류·이동", ko: "작업장·산업시설", phase: "legal_hold" },
  { no: 31, group: "F", groupKo: "산업·물류·이동", ko: "물류·상하차", phase: "legal_hold" },
  { no: 32, group: "F", groupKo: "산업·물류·이동", ko: "주차·차고", phase: "legal_hold" },
  { no: 33, group: "G", groupKo: "자연·농업·특수", ko: "캠핑·야외 부지", phase: "legal_hold" },
  { no: 34, group: "G", groupKo: "자연·농업·특수", ko: "농업·원예 공간", phase: "legal_hold" },
  { no: 35, group: "G", groupKo: "자연·농업·특수", ko: "연구·실험·특수시설", phase: "legal_hold" },
];
export const SPACE_ACTIVE_S13 = SPACE_TAXONOMY_S13.filter((s) => s.phase === "active").map((s) => s.ko);

/** Areas removed from SHAREON's core business (plan §3). Never rendered; used by checks to make sure they stay off the pages. */
export const EXCLUDED_BUSINESS_TERMS = {
  ko: ["중고거래", "신상품 쇼핑", "공동구매", "생활 서비스 예약", "클래스", "디지털 상품"],
  en: ["Second-hand trading", "New-product shopping", "Group buying", "Life-service booking", "Classes", "Digital goods"],
};
