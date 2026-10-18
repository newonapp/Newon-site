/**
 * Business · Studio page classification (PHASE 03 content alignment).
 *
 * Business model (confirmed by the owner):
 *   Business = own automation products, business solutions, seller tools, enterprise products, partnerships
 *   Studio   = own digital products, core-platform-linked projects, partnerships
 *   NOT a custom web/app outsourcing or per-client delivery business.
 *
 * class:  A = connectable to NEWON's own products / platform / partnerships
 *         B = technology · design · operations CAPABILITY page (no "we take your project" claim)
 *         C = describes custom production / outsourcing / delivery for individual clients only
 *         D = duplicate of another area, legacy alias, or does not match the real business
 * notice: cap     = capability notice banner
 *         legacy  = "being reorganized, no individual outsourcing" banner
 *         inquiry = inquiry-purpose banner
 *         none
 * Nothing here deletes a page or a URL. C / D pages only get a plan (see docs/web-closure/PHASE03-CONTENT-PLAN.md).
 */

const R = (plan = "기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다.") => ["D", "redirect", "none", "레거시 URL 별칭", plan];

export const PAGES = {
  // ── Business: hubs & system ─────────────────────────────────────────────
  business: ["A", "hub", "none", "Newon 자체 제품·자동화 솔루션·제휴를 소개하는 허브", "소개 문구의 '구축·제작' 표현을 '구현 역량 소개'로 전환(적용). 카드는 역량 페이지 링크로 유지"],
  "business/partners": ["A", "hub", "none", "제휴 유형과 진행 흐름 안내", "변경 없음"],
  "business/seller-center": ["A", "hub", "none", "판매자 안내·제휴(웹 계정·거래 기능 없음 고지)", "변경 없음"],
  "business/inquiry": ["B", "inquiry", "inquiry", "문의 폼(데이터·URL 보존 대상)", "폼·카테고리 값·URL 유지. 문의 목적(제휴·도입·협업) 안내만 추가"],
  "business/inquiry/success": ["B", "system", "none", "문의 접수 완료 화면", "변경 없음"],

  // ── Business: Automation ─────────────────────────────────────────────────
  "business/automation": ["B", "hub", "none", "자동화 역량 허브", "역량 안내 추가. 자체 자동화 상품이 확정되면 상품 소개로 승격(보류)"],
  "business/ai-automation": ["B", "detail", "cap", "AI 업무 자동화 역량(고객사 구축 프로젝트 서술 포함)", "역량 안내 추가. 고객사 구축 서술은 상품 확정 후 재작성(보류)"],
  "business/automation/workflow": ["B", "detail", "cap", "SaaS·업무 연결 자동화 역량", "역량 안내 추가"],
  "business/data-reporting": ["B", "detail", "cap", "데이터 수집·리포트 자동화 역량", "역량 안내 추가"],
  "business/internal-tools": ["B", "detail", "cap", "내부 도구 구현 역량", "역량 안내 추가"],
  "business/booking": ["C", "detail", "legacy", "예약·문의·고객 이력을 고객별로 새로 구축하는 서비스", "Automation 허브의 '예약·문의 자동화' 한 줄 역량으로 통합 후 리디렉션 후보. 대체 문구는 확정 필요(보류)"],

  // ── Business: Build ──────────────────────────────────────────────────────
  "business/build": ["B", "hub", "cap", "제품 구현 역량 허브", "역량 안내 추가. 하위 C 페이지의 통합 목적지 후보"],
  "business/mvp": ["C", "detail", "legacy", "고객 아이디어를 MVP로 구축해 인도", "Build 허브 '구현 역량' 요약으로 통합, URL은 허브로 리디렉션 후보"],
  "business/landing": ["C", "detail", "legacy", "고객 제품용 랜딩페이지 제작", "Build 허브로 통합, 리디렉션 후보"],
  "business/web": ["C", "detail", "legacy", "고객 브랜드 웹사이트 제작", "Build 허브로 통합, 리디렉션 후보"],
  "business/app": ["C", "detail", "legacy", "고객 앱 프로토타입 제작", "Build 허브로 통합, 리디렉션 후보"],
  "business/website-renewal": ["C", "detail", "legacy", "고객 기존 웹사이트 리뉴얼", "Build 허브로 통합, 리디렉션 후보"],
  "business/improvement": ["C", "detail", "legacy", "고객 웹·앱 부분 개선", "Care 허브로 통합, 리디렉션 후보"],

  // ── Business: Care ───────────────────────────────────────────────────────
  "business/care": ["B", "hub", "cap", "운영·유지 관리 체계 허브", "역량 안내 추가"],
  "business/maintenance": ["C", "detail", "legacy", "고객 웹·앱 월간 유지보수 계약", "Care 허브로 통합, 리디렉션 후보"],
  "business/post-launch": ["C", "detail", "legacy", "고객 제품 출시 직후 지원", "Care 허브로 통합, 리디렉션 후보"],

  // ── Business: Solutions ──────────────────────────────────────────────────
  "business/solutions": ["B", "hub", "none", "솔루션 구성 방식 허브", "역량 안내 추가"],
  "business/white-label": ["A", "detail", "cap", "검증된 자체 시스템(Base)을 브랜드에 맞게 제공하는 제품형 모델", "Base 시스템의 실제 제품 목록 확인 후 자체 제품 소개로 재작성(보류). 그 전까지 역량 안내 표시"],
  "business/custom-product": ["C", "detail", "legacy", "문제에 맞춘 고객별 맞춤 제품 구축", "Solutions 허브로 통합, 리디렉션 후보"],
  "business/internal-system": ["C", "detail", "legacy", "고객사 내부 시스템 구축", "Solutions 허브로 통합, 리디렉션 후보"],
  "business/product-launch": ["C", "detail", "legacy", "고객 제품 출시 준비 프로젝트", "Solutions 허브로 통합, 리디렉션 후보"],

  // ── Business: Research / Insights ────────────────────────────────────────
  "business/research": ["D", "hub", "legacy", "'기획·진단' 고객 서비스 프레임, resources/insights와 기능 중복", "resources/insights(Insights)로 통합·리디렉션 후보"],
  "business/market-research": ["B", "detail", "cap", "시장 조사 방법론", "역량 안내 추가. Insights 연계"],
  "business/competitor-analysis": ["B", "detail", "cap", "경쟁 분석 방법론", "역량 안내 추가. Insights 연계"],
  "business/consumer-research": ["B", "detail", "cap", "소비자 조사 방법론", "역량 안내 추가. Insights 연계"],
  "business/trend-research": ["B", "detail", "cap", "트렌드 조사 방법론", "역량 안내 추가. Insights 연계"],
  "business/ux-audit": ["B", "detail", "cap", "UX 진단 방법론", "역량 안내 추가. Insights 연계"],

  // ── Business: duplicates of Studio ───────────────────────────────────────
  "business/design": ["D", "detail", "legacy", "Studio Digital Products·Brand와 중복(디자인 서비스 설명)", "Studio로 통합·리디렉션 후보"],
  "business/creative": ["D", "hub", "legacy", "Studio Brand·Content와 중복", "Studio로 통합·리디렉션 후보"],

  // ── Business: partnerships ───────────────────────────────────────────────
  "business/collaboration/partnership": ["A", "detail", "none", "Newon 제품·기술·브랜드와 기업의 협업", "변경 없음"],
  "business/collaboration/product-service": ["A", "detail", "none", "Newon 앱·서비스에 콘텐츠·기능·브랜드를 연결하는 협업", "변경 없음"],
  "business/collaboration/promotion": ["A", "detail", "none", "Newon 제품 경험에 연결되는 브랜드 프로모션", "변경 없음"],
  "business/collaboration/development": ["B", "detail", "cap", "공동 제품 개발 협업 역량", "역량 안내 추가. '디지털 제품 제작의 전 과정' 서술은 파트너십 범위 확정 후 재작성(보류)"],

  // ── Studio ───────────────────────────────────────────────────────────────
  studio: ["A", "hub", "none", "자체 디지털 제품·디자인 파트너십 허브", "소개 문구·CTA를 제휴·협업 중심으로 전환(적용)"],
  "studio/partnerships": ["A", "hub", "none", "브랜드·기업과 장기 협업", "프로젝트 문구를 제휴·협업 문구로 전환(적용)"],
  "studio/projects": ["A", "hub", "none", "Newon이 직접 만들고 운영하는 제품", "프로젝트 문의를 제휴·협업 문의로 전환(적용)"],
  "studio/contact": ["A", "hub", "none", "제휴·협업 문의 진입", "CTA를 제휴·협업 문의로 전환(적용), 폼·URL 유지"],
  "studio/digital": ["B", "hub", "none", "웹·앱 디자인 역량 허브(Design Only)", "역량 안내 추가. 자체 디지털 상품 콘텐츠는 확정 후 추가(보류)"],
  "studio/digital/web-design": ["B", "detail", "cap", "웹 디자인 접근법·기준", "역량 안내 추가"],
  "studio/digital/app-ui-ux": ["B", "detail", "cap", "앱 UI/UX 접근법·기준", "역량 안내 추가"],
  "studio/digital/landing": ["B", "detail", "cap", "랜딩 디자인 접근법·기준", "역량 안내 추가"],
  "studio/digital/product-design": ["B", "detail", "cap", "제품 디자인 접근법·기준", "역량 안내 추가"],
  "studio/brand": ["B", "hub", "cap", "브랜드 디자인 역량 허브", "역량 안내 추가"],
  "studio/brand/identity": ["B", "detail", "cap", "아이덴티티 설계 기준", "역량 안내 추가"],
  "studio/brand/logo": ["B", "detail", "cap", "로고 설계 기준", "역량 안내 추가"],
  "studio/brand/naming": ["B", "detail", "cap", "네이밍 기준", "역량 안내 추가"],
  "studio/brand/strategy": ["B", "detail", "cap", "브랜드 전략 접근법", "역량 안내 추가"],
  "studio/content": ["B", "hub", "cap", "콘텐츠·캠페인 역량 허브", "역량 안내 추가"],
  "studio/content/campaign": ["B", "detail", "cap", "캠페인 설계 기준", "역량 안내 추가"],
  "studio/content/social": ["B", "detail", "cap", "소셜 콘텐츠 구조", "역량 안내 추가"],
  "studio/content/visual": ["B", "detail", "cap", "비주얼 콘텐츠 기준", "역량 안내 추가"],
  "studio/care": ["C", "hub", "legacy", "고객 브랜드·화면의 월간 디자인 운영 계약", "Studio Partnerships로 통합, 리디렉션 후보"],
  "studio/care/monthly-design": ["C", "detail", "legacy", "월 계약 디자인 지원", "Studio Partnerships로 통합, 리디렉션 후보"],
  "studio/care/design-improvement": ["C", "detail", "legacy", "고객 기존 디자인 일회성 개선", "Studio Partnerships로 통합, 리디렉션 후보"],

  // ── legacy URL aliases (redirect stubs) ──────────────────────────────────
  "business/automation/data-reporting": R(),
  "business/automation/internal-tools": R(),
  "business/build/app": R(),
  "business/build/landing": R(),
  "business/build/mvp": R(),
  "business/build/website": R(),
  "business/development": R(),
  "business/partnership": R(),
  "business/promotion": R(),
  "business/service": R(),
  "studio/ip": R(),
  "studio/ip/character-lab": R(),
  "studio/ip/digital-stickers": R(),
  "studio/ip/experimental-ip": R(),
  "studio/ip/newon-character": R(),
};

export const NOTICE = {
  cap: {
    ko: "이 페이지는 Newon의 기술·디자인·운영 역량을 소개합니다. Newon은 개별 고객의 개발·제작 프로젝트를 수주하지 않으며, 협업은 제휴·도입 문의를 통해 검토합니다.",
    en: "This page describes Newon's technology, design and operations capabilities. Newon does not take on custom development or production projects for individual clients; collaboration is reviewed through partnership and adoption inquiries.",
    ja: "このページでは、Newonの技術・デザイン・運用の対応力を紹介しています。Newonは個別のお客様向けのカスタム開発・制作案件の受託は行っておらず、協業はパートナーシップ・導入のお問い合わせを通じて検討します。",
    es: "Esta página describe las capacidades de tecnología, diseño y operaciones de Newon. Newon no asume proyectos de desarrollo o producción a medida para clientes individuales; las colaboraciones se estudian a través de consultas de alianzas y adopción.",
    "pt-br": "Esta página descreve as capacidades de tecnologia, design e operações da Newon. A Newon não aceita projetos de desenvolvimento ou produção sob medida para clientes individuais; as colaborações são avaliadas por meio de consultas de parceria e adoção.",
    fr: "Cette page présente les capacités de Newon en matière de technologie, de design et d'exploitation. Newon n'accepte pas de projets de développement ou de production sur mesure pour des clients individuels ; les collaborations sont étudiées via les demandes de partenariat et d'adoption.",
    de: "Diese Seite beschreibt die Technologie-, Design- und Betriebskompetenzen von Newon. Newon übernimmt keine individuellen Entwicklungs- oder Produktionsprojekte für Einzelkunden; Kooperationen werden über Partnerschafts- und Einführungsanfragen geprüft.",
    hi: "यह पृष्ठ Newon की प्रौद्योगिकी, डिज़ाइन और संचालन क्षमताओं का परिचय देता है। Newon व्यक्तिगत ग्राहकों के लिए कस्टम डेवलपमेंट या प्रोडक्शन प्रोजेक्ट स्वीकार नहीं करता; सहयोग पर विचार साझेदारी और अपनाने से जुड़ी पूछताछ के माध्यम से किया जाता है।",
    id: "Halaman ini menjelaskan kapabilitas teknologi, desain, dan operasional Newon. Newon tidak menerima proyek pengembangan atau produksi khusus untuk klien perorangan; kolaborasi ditinjau melalui pertanyaan kemitraan dan adopsi.",
  },
  legacy: {
    ko: "이 페이지는 사업 방향에 맞춰 정비 중입니다. Newon은 개별 고객의 맞춤 제작·외주·납품을 제공하지 않으며, 아래 내용은 기술·운영 역량을 설명하는 참고 자료입니다. 협업은 제휴·도입 문의를 통해 검토합니다.",
    en: "This page is being reorganized to match our business direction. Newon does not offer custom production, outsourcing or delivery for individual clients; the content below is reference material on our technology and operations capabilities. Collaboration is reviewed through partnership and adoption inquiries.",
    ja: "このページは事業方針に合わせて整理中です。Newonは個別のお客様向けのカスタム制作・外注・納品サービスは提供しておらず、以下の内容は当社の技術・運用力に関する参考情報です。協業はパートナーシップ・導入のお問い合わせを通じて検討します。",
    es: "Esta página se está reorganizando para ajustarse a la orientación de nuestro negocio. Newon no ofrece producción a medida, subcontratación ni entrega de proyectos para clientes individuales; el contenido siguiente es material de referencia sobre nuestras capacidades de tecnología y operaciones. Las colaboraciones se estudian a través de consultas de alianzas y adopción.",
    "pt-br": "Esta página está sendo reorganizada de acordo com a direção do nosso negócio. A Newon não oferece produção sob medida, terceirização nem entrega de projetos para clientes individuais; o conteúdo abaixo é material de referência sobre nossas capacidades de tecnologia e operações. As colaborações são avaliadas por meio de consultas de parceria e adoção.",
    fr: "Cette page est en cours de réorganisation pour refléter l'orientation de notre activité. Newon ne propose ni production sur mesure, ni sous-traitance, ni livraison de projets pour des clients individuels ; le contenu ci-dessous est une documentation de référence sur nos capacités technologiques et opérationnelles. Les collaborations sont étudiées via les demandes de partenariat et d'adoption.",
    de: "Diese Seite wird an die Ausrichtung unseres Geschäfts angepasst. Newon bietet für Einzelkunden weder individuelle Produktion noch Outsourcing oder Auslieferung an; die folgenden Inhalte sind Referenzmaterial zu unseren Technologie- und Betriebskompetenzen. Kooperationen werden über Partnerschafts- und Einführungsanfragen geprüft.",
    hi: "यह पृष्ठ हमारी व्यावसायिक दिशा के अनुरूप पुनर्गठित किया जा रहा है। Newon व्यक्तिगत ग्राहकों के लिए कस्टम प्रोडक्शन, आउटसोर्सिंग या डिलीवरी सेवाएँ नहीं देता; नीचे दी गई सामग्री हमारी प्रौद्योगिकी और संचालन क्षमताओं की संदर्भ जानकारी है। सहयोग पर विचार साझेदारी और अपनाने से जुड़ी पूछताछ के माध्यम से किया जाता है।",
    id: "Halaman ini sedang ditata ulang agar sesuai dengan arah bisnis kami. Newon tidak menyediakan produksi khusus, alih daya, maupun pengiriman hasil kerja untuk klien perorangan; konten di bawah ini adalah materi referensi tentang kapabilitas teknologi dan operasional kami. Kolaborasi ditinjau melalui pertanyaan kemitraan dan adopsi.",
  },
  inquiry: {
    ko: "문의는 제휴·도입·협업 목적으로 접수합니다. Newon은 개별 고객의 개발·제작 프로젝트를 수주하지 않습니다.",
    en: "Inquiries are accepted for partnerships, adoption and collaboration. Newon does not take on custom development or production projects for individual clients.",
    ja: "お問い合わせは、パートナーシップ・導入・協業を目的として受け付けています。Newonは個別のお客様向けのカスタム開発・制作案件の受託は行っておりません。",
    es: "Las consultas se aceptan para alianzas, adopción y colaboración. Newon no asume proyectos de desarrollo o producción a medida para clientes individuales.",
    "pt-br": "As consultas são recebidas para parcerias, adoção e colaboração. A Newon não aceita projetos de desenvolvimento ou produção sob medida para clientes individuais.",
    fr: "Les demandes sont acceptées pour des partenariats, de l'adoption et de la collaboration. Newon n'accepte pas de projets de développement ou de production sur mesure pour des clients individuels.",
    de: "Anfragen werden für Partnerschaften, Einführung und Kooperation entgegengenommen. Newon übernimmt keine individuellen Entwicklungs- oder Produktionsprojekte für Einzelkunden.",
    hi: "पूछताछ साझेदारी, अपनाने और सहयोग के उद्देश्य से स्वीकार की जाती है। Newon व्यक्तिगत ग्राहकों के लिए कस्टम डेवलपमेंट या प्रोडक्शन प्रोजेक्ट स्वीकार नहीं करता।",
    id: "Pertanyaan diterima untuk kemitraan, adopsi, dan kolaborasi. Newon tidak menerima proyek pengembangan atau produksi khusus untuk klien perorangan.",
  },
};

export function pageKey(relPath) {
  // "ko/business/web/index.html" → "business/web"
  const m = /^[a-z-]+\/(.+?)\/index\.html$/.exec(relPath.replace(/\\/g, "/"));
  return m ? m[1] : null;
}
