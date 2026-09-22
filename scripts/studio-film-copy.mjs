/** First-screen film copy for /{lang}/studio/ only. */

export const STUDIO_FILM_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_202655_a7f5aca0-2f80-4bc9-bcb5-96ac95662003.mp4";

const COPY = {
  ko: {
    sloganHtml: "아이디어를 현실로,<br>경험을 새로운 가치로.",
    leadHtml:
      "브랜드 기획부터 디자인과 개발까지.<br>생각을 실제 디지털 경험으로 만듭니다.",
  },
  en: {
    sloganHtml: "From idea to reality,<br>from experience to new value.",
    leadHtml:
      "From brand planning to design and development.<br>We turn thinking into real digital experiences.",
  },
  ja: {
    sloganHtml: "アイデアを現実に、<br>経験を新しい価値に。",
    leadHtml:
      "ブランド企画からデザインと開発まで。<br>思考を実際のデジタル体験にします。",
  },
  es: {
    sloganHtml: "De la idea a la realidad,<br>de la experiencia a un nuevo valor.",
    leadHtml:
      "Desde la planificación de marca hasta el diseño y el desarrollo.<br>Convertimos las ideas en experiencias digitales reales.",
  },
  "pt-br": {
    sloganHtml: "Da ideia à realidade,<br>da experiência a um novo valor.",
    leadHtml:
      "Do planejamento de marca ao design e ao desenvolvimento.<br>Transformamos ideias em experiências digitais reais.",
  },
  fr: {
    sloganHtml: "De l’idée à la réalité,<br>de l’expérience à une nouvelle valeur.",
    leadHtml:
      "De la conception de marque au design et au développement.<br>Nous transformons les idées en expériences numériques réelles.",
  },
  de: {
    sloganHtml: "Von der Idee zur Wirklichkeit,<br>von der Erfahrung zu neuem Wert.",
    leadHtml:
      "Von der Markenplanung bis zu Design und Entwicklung.<br>Wir machen aus Gedanken echte digitale Erlebnisse.",
  },
  hi: {
    sloganHtml: "विचार को वास्तविकता में,<br>अनुभव को नए मूल्य में।",
    leadHtml:
      "ब्रांड प्लानिंग से डिज़ाइन और डेवलपमेंट तक।<br>हम विचारों को वास्तविक डिजिटल अनुभव बनाते हैं।",
  },
  id: {
    sloganHtml: "Dari ide menjadi nyata,<br>dari pengalaman menjadi nilai baru.",
    leadHtml:
      "Dari perencanaan merek hingga desain dan pengembangan.<br>Kami mengubah pemikiran menjadi pengalaman digital yang nyata.",
  },
};

export function getStudioFilmCopy(lang) {
  return COPY[lang] || COPY.en;
}
