const COPY = {
  ko: {
    seoTitle: "Newon 생태계 | Newon Ecosystem",
    seoDescription:
      "앱과 AI, 생활과 비즈니스까지. Newon의 다양한 서비스와 가능성을 하나의 생태계로 연결합니다.",
    sloganHtml: "하나의 연결로,<br>더 넓어지는 일상.",
    leadHtml: "앱과 AI, 생활과 비즈니스까지.<br>Newon의 다양한 서비스와 가능성을 하나의 생태계로 연결합니다.",
  },
  en: {
    seoTitle: "Newon Ecosystem | Newon",
    seoDescription:
      "From apps and AI to life and business. We connect Newon’s services and possibilities into one ecosystem.",
    sloganHtml: "One connection,<br>a wider everyday.",
    leadHtml:
      "From apps and AI to life and business.<br>We connect Newon’s services and possibilities into one ecosystem.",
  },
  ja: {
    seoTitle: "Newon エコシステム | Newon Ecosystem",
    seoDescription:
      "アプリとAI、暮らしとビジネスまで。Newonのさまざまなサービスと可能性を、ひとつのエコシステムでつなぎます。",
    sloganHtml: "ひとつのつながりで、<br>日常が広がる。",
    leadHtml:
      "アプリとAI、暮らしとビジネスまで。<br>Newonのさまざまなサービスと可能性を、ひとつのエコシステムでつなぎます。",
  },
  es: {
    seoTitle: "Ecosistema Newon | Newon Ecosystem",
    seoDescription:
      "De las apps y la IA a la vida y los negocios. Conectamos los servicios y las posibilidades de Newon en un solo ecosistema.",
    sloganHtml: "Una conexión,<br>una vida más amplia.",
    leadHtml:
      "De las apps y la IA a la vida y los negocios.<br>Conectamos los servicios y las posibilidades de Newon en un solo ecosistema.",
  },
  "pt-br": {
    seoTitle: "Ecossistema Newon | Newon Ecosystem",
    seoDescription:
      "Dos apps e da IA à vida e aos negócios. Conectamos os serviços e as possibilidades da Newon em um só ecossistema.",
    sloganHtml: "Uma conexão,<br>um cotidiano mais amplo.",
    leadHtml:
      "Dos apps e da IA à vida e aos negócios.<br>Conectamos os serviços e as possibilidades da Newon em um só ecossistema.",
  },
  fr: {
    seoTitle: "Écosystème Newon | Newon Ecosystem",
    seoDescription:
      "Des applications et de l’IA à la vie et aux affaires. Nous relions les services et les possibilités de Newon en un seul écosystème.",
    sloganHtml: "Une connexion,<br>un quotidien plus vaste.",
    leadHtml:
      "Des applications et de l’IA à la vie et aux affaires.<br>Nous relions les services et les possibilités de Newon en un seul écosystème.",
  },
  de: {
    seoTitle: "Newon-Ökosystem | Newon Ecosystem",
    seoDescription:
      "Von Apps und KI bis zu Alltag und Business. Wir verbinden Newons Dienste und Möglichkeiten in einem Ökosystem.",
    sloganHtml: "Eine Verbindung,<br>ein weiterer Alltag.",
    leadHtml:
      "Von Apps und KI bis zu Alltag und Business.<br>Wir verbinden Newons Dienste und Möglichkeiten in einem Ökosystem.",
  },
  hi: {
    seoTitle: "Newon इकोसिस्टम | Newon Ecosystem",
    seoDescription:
      "ऐप्स और AI से जीवन और बिज़नेस तक। हम Newon की सेवाओं और संभावनाओं को एक इकोसिस्टम में जोड़ते हैं।",
    sloganHtml: "एक जुड़ाव से,<br>और व्यापक रोज़मर्रा।",
    leadHtml:
      "ऐप्स और AI से जीवन और बिज़नेस तक।<br>हम Newon की सेवाओं और संभावनाओं को एक इकोसिस्टम में जोड़ते हैं।",
  },
  id: {
    seoTitle: "Ekosistem Newon | Newon Ecosystem",
    seoDescription:
      "Dari aplikasi dan AI hingga kehidupan dan bisnis. Kami menghubungkan layanan dan kemungkinan Newon menjadi satu ekosistem.",
    sloganHtml: "Satu koneksi,<br>keseharian yang lebih luas.",
    leadHtml:
      "Dari aplikasi dan AI hingga kehidupan dan bisnis.<br>Kami menghubungkan layanan dan kemungkinan Newon menjadi satu ekosistem.",
  },
};

export function getEcosystemCopy(lang) {
  return COPY[lang] || COPY.en;
}
