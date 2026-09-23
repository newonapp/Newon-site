/**
 * Shared film intro for /{lang}/ai/ and /{lang}/ai/enterprise/ only.
 * Does not replace the existing cai-hero; it is prepended above it.
 */
import { escapeHtml } from "./hub-utils.mjs";

export const AI_FILM_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260723_145606_ab143199-b593-4941-bb1b-9afca215416b.mp4";

const PERSONAL = {
  ko: {
    sloganHtml: "당신의 일상에,<br>더 가까운 AI.",
    leadHtml: "일상의 질문부터 계획과 실행까지.<br>개인의 삶을 이해하고 함께하는 AI를 만듭니다.",
  },
  en: {
    sloganHtml: "Closer AI,<br>for your everyday life.",
    leadHtml: "From everyday questions to planning and action.<br>We build AI that understands personal life and stays with you.",
  },
  ja: {
    sloganHtml: "あなたの日常に、<br>より近いAIを。",
    leadHtml: "日常の問いから計画と実行まで。<br>個人の暮らしを理解し、寄り添うAIをつくります。",
  },
  es: {
    sloganHtml: "Una IA más cercana<br>a tu día a día.",
    leadHtml: "Desde las preguntas cotidianas hasta el plan y la acción.<br>Creamos una IA que entiende la vida personal y acompaña.",
  },
  "pt-br": {
    sloganHtml: "Uma IA mais perto<br>do seu dia a dia.",
    leadHtml: "Das perguntas do cotidiano ao planejamento e à ação.<br>Criamos uma IA que entende a vida pessoal e acompanha.",
  },
  fr: {
    sloganHtml: "Une IA plus proche<br>de votre quotidien.",
    leadHtml: "Des questions du quotidien au plan et à l’action.<br>Nous créons une IA qui comprend la vie personnelle et l’accompagne.",
  },
  de: {
    sloganHtml: "KI, die Ihrem Alltag<br>näherkommt.",
    leadHtml: "Von alltäglichen Fragen bis zu Planung und Umsetzung.<br>Wir entwickeln KI, die das persönliche Leben versteht und begleitet.",
  },
  hi: {
    sloganHtml: "आपकी रोज़मर्रा की ज़िंदगी के<br>और करीब AI.",
    leadHtml: "रोज़मर्रा के सवालों से योजना और अमल तक।<br>हम ऐसा AI बनाते हैं जो व्यक्तिगत जीवन को समझे और साथ रहे।",
  },
  id: {
    sloganHtml: "AI yang lebih dekat<br>dengan keseharian Anda.",
    leadHtml: "Dari pertanyaan sehari-hari hingga rencana dan tindakan.<br>Kami membuat AI yang memahami kehidupan pribadi dan menemani.",
  },
};

const ENTERPRISE = {
  ko: {
    sloganHtml: "기업의 가능성을,<br>AI로 확장하다.",
    leadHtml: "업무 자동화부터 지능형 서비스까지.<br>기업의 성장과 변화를 연결하는 AI를 만듭니다.",
  },
  en: {
    sloganHtml: "Expanding what a company can do,<br>with AI.",
    leadHtml: "From work automation to intelligent services.<br>We build AI that connects a company’s growth and change.",
  },
  ja: {
    sloganHtml: "企業の可能性を、<br>AIで広げる。",
    leadHtml: "業務自動化から知能型サービスまで。<br>企業の成長と変化をつなぐAIをつくります。",
  },
  es: {
    sloganHtml: "Ampliar las posibilidades<br>de la empresa con IA.",
    leadHtml: "Desde la automatización del trabajo hasta los servicios inteligentes.<br>Creamos una IA que conecta el crecimiento y el cambio de la empresa.",
  },
  "pt-br": {
    sloganHtml: "Ampliar as possibilidades<br>da empresa com IA.",
    leadHtml: "Da automação do trabalho aos serviços inteligentes.<br>Criamos uma IA que conecta o crescimento e a mudança da empresa.",
  },
  fr: {
    sloganHtml: "Étendre les possibilités<br>de l’entreprise avec l’IA.",
    leadHtml: "De l’automatisation du travail aux services intelligents.<br>Nous créons une IA qui relie la croissance et le changement de l’entreprise.",
  },
  de: {
    sloganHtml: "Die Möglichkeiten des Unternehmens<br>mit KI erweitern.",
    leadHtml: "Von der Automatisierung der Arbeit bis zu intelligenten Diensten.<br>Wir entwickeln KI, die Wachstum und Wandel des Unternehmens verbindet.",
  },
  hi: {
    sloganHtml: "कंपनी की संभावनाओं को<br>AI से बढ़ाना.",
    leadHtml: "काम के ऑटोमेशन से बुद्धिमान सेवाओं तक।<br>हम ऐसा AI बनाते हैं जो कंपनी की वृद्धि और बदलाव को जोड़ता है।",
  },
  id: {
    sloganHtml: "Memperluas kemungkinan<br>perusahaan dengan AI.",
    leadHtml: "Dari otomatisasi kerja hingga layanan cerdas.<br>Kami membuat AI yang menghubungkan pertumbuhan dan perubahan perusahaan.",
  },
};

export function getAiFilmCopy(kind, lang) {
  const pack = kind === "enterprise" ? ENTERPRISE : PERSONAL;
  return pack[lang] || pack.en;
}

/** @param {"personal"|"enterprise"} kind */
export function renderAiFilmHero(kind, lang, switcher = {}) {
  const L = lang || "en";
  const c = getAiFilmCopy(kind, L);
  const personal = switcher.personal || (L === "ko" ? "개인 AI" : "Personal AI");
  const enterprise = switcher.enterprise || (L === "ko" ? "기업 AI" : "Enterprise AI");
  const personalHref = switcher.personalHref || (kind === "enterprise" ? "../#cai-hero" : "#cai-hero");
  const enterpriseHref = switcher.enterpriseHref || (kind === "enterprise" ? "#cai-hero" : "enterprise/#cai-hero");
  const personalNow = kind === "personal";
  const enterpriseNow = kind === "enterprise";
  return `<section class="nai-film" data-nai-film aria-label="Newon AI">
    <div class="nai-film__stage">
      <div class="nai-film__fallback" aria-hidden="true"></div>
      <video
        class="nai-film__video"
        src="${escapeHtml(AI_FILM_SRC)}"
        autoplay
        muted
        loop
        playsinline
        webkit-playsinline
        preload="auto"
        disablepictureinpicture
        controlslist="nodownload nofullscreen noremoteplayback"
        aria-hidden="true"
      >
        <source src="${escapeHtml(AI_FILM_SRC)}" type="video/mp4" />
      </video>
      <div class="nai-film__lockup">
        <div class="nai-film__veil" aria-hidden="true"></div>
        <p class="nai-film__wordmark">Newon AI</p>
        <p class="nai-film__slogan">${c.sloganHtml}</p>
        <p class="nai-film__lead">${c.leadHtml}</p>
        <div class="nai-film__actions">
          <a class="btn ${personalNow ? "btn-primary" : "btn-ghost"}" href="${escapeHtml(personalHref)}"${personalNow ? ' data-cai-scroll aria-current="page"' : ""}>${escapeHtml(personal)}</a>
          <a class="btn ${enterpriseNow ? "btn-primary" : "btn-ghost"}" href="${escapeHtml(enterpriseHref)}"${enterpriseNow ? ' data-cai-scroll aria-current="page"' : ""}>${escapeHtml(enterprise)}</a>
        </div>
      </div>
      <a class="nai-film__cue" href="#cai-hero" data-cai-scroll>
        <span class="visually-hidden">${L === "ko" ? "기존 소개로 이동" : "Continue to the introduction"}</span>
      </a>
    </div>
  </section>`;
}
