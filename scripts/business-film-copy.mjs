/** First-screen film copy for /{lang}/business/ only. Does not change existing locale strings. */

export const BIZ_FILM_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4";

const COPY = {
  ko: {
    sloganHtml: "비즈니스의 가능성을,<br>기술로 확장하다.",
    leadHtml:
      "기업용 소프트웨어부터 AI와 업무 자동화까지.<br>기업의 운영과 성장을 연결하는 디지털 솔루션을 만듭니다.",
  },
  en: {
    sloganHtml: "Expanding what business can do,<br>with technology.",
    leadHtml:
      "From enterprise software to AI and work automation.<br>We build digital solutions that connect how companies operate and grow.",
  },
  ja: {
    sloganHtml: "ビジネスの可能性を、<br>技術で広げる。",
    leadHtml:
      "企業向けソフトウェアからAIと業務自動化まで。<br>企業の運営と成長をつなぐデジタルソリューションをつくります。",
  },
  es: {
    sloganHtml: "Ampliar las posibilidades<br>del negocio con tecnología.",
    leadHtml:
      "Desde el software empresarial hasta la IA y la automatización del trabajo.<br>Creamos soluciones digitales que conectan la operación y el crecimiento de la empresa.",
  },
  "pt-br": {
    sloganHtml: "Ampliar as possibilidades<br>do negócio com tecnologia.",
    leadHtml:
      "Do software empresarial à IA e à automação do trabalho.<br>Criamos soluções digitais que conectam a operação e o crescimento da empresa.",
  },
  fr: {
    sloganHtml: "Étendre les possibilités<br>de l’entreprise avec la technologie.",
    leadHtml:
      "Des logiciels d’entreprise à l’IA et à l’automatisation du travail.<br>Nous créons des solutions numériques qui relient l’exploitation et la croissance de l’entreprise.",
  },
  de: {
    sloganHtml: "Die Möglichkeiten des Business<br>mit Technologie erweitern.",
    leadHtml:
      "Von Unternehmenssoftware bis zu KI und Arbeitsautomatisierung.<br>Wir entwickeln digitale Lösungen, die Betrieb und Wachstum von Unternehmen verbinden.",
  },
  hi: {
    sloganHtml: "बिज़नेस की संभावनाओं को<br>तकनीक से बढ़ाना.",
    leadHtml:
      "एंटरप्राइज़ सॉफ़्टवेयर से AI और काम के ऑटोमेशन तक।<br>हम ऐसी डिजिटल समाधान बनाते हैं जो कंपनी के संचालन और विकास को जोड़ते हैं।",
  },
  id: {
    sloganHtml: "Memperluas kemungkinan bisnis<br>dengan teknologi.",
    leadHtml:
      "Dari perangkat lunak perusahaan hingga AI dan otomatisasi kerja.<br>Kami membuat solusi digital yang menghubungkan operasi dan pertumbuhan perusahaan.",
  },
};

export function getBusinessFilmCopy(lang) {
  return COPY[lang] || COPY.en;
}
