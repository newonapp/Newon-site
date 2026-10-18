/**
 * LIVON corporate site — page copy (KO + EN) for the five pages
 * (/{lang}/livon/ · platform/ · business/ · partnerships/ · contact/).
 * Other site languages use the English copy, like the rest of the LivOn pages.
 *
 * Honesty rules for this file:
 *  - Present tense only for what the LIVON web service really has today.
 *  - No prices, fees, rates, user counts or statistics. Subscription / AI / business / ad /
 *    commission lines are proposals only.
 *  - Regulated fields (medical, legal, insurance, finance, welfare) are information + official
 *    channels only and never replace professional judgement.
 *  - Market is "in preparation": no products, booking or payment until real sellers exist.
 *  - Personal used-goods trading is not built in LIVON — it points to SHAREON.
 */

export const COPY = {
  ko: {
    brand: "LIVON",
    positioning: "All-in-One Life Platform",
    slogan: "인생의 모든 순간, LIVON 하나로.",
    subnavLabel: "LIVON 메뉴",
    appStatus: "LIVON 앱은 출시 준비 중입니다. 지금은 LIVON 웹에서 무료로, 로그인 없이 이용할 수 있습니다.",
    notice: "40개 분야는 사업·콘텐츠 분류입니다. 모두 제공 중인 기능이라는 뜻이 아니며, 분야마다 실제 제공 상태를 함께 표시합니다.",
    disclaimer: "의료·법률·보험·금융·복지 정보는 일반 안내와 공식 기관 연결만 제공하며, 전문가의 판단을 대신하지 않습니다.",
    tryWeb: "LIVON 웹 써 보기",
    toContact: "문의하기",
    seo: {
      overview: { title: "LIVON | NEWON — 인생의 모든 순간, LIVON 하나로", desc: "All-in-One Life Platform LIVON. 흩어진 생애 정보를 생애 단계와 인생 사건, 공식 출처 기준으로 연결합니다. 무료, 로그인 없이 시작하는 LIVON의 이야기와 원칙." },
      platform: { title: "LIVON Platform | 40개 생활 분야와 8개 핵심 기능 — NEWON", desc: "앱 탭 구성(홈·탐색·마켓·마이라이프·전체), 8개 핵심 기능, 로그인 없이 쓰는 범위, 인생 사건 탐색, 5개 영역 40개 분야의 세부 주제와 실제 제공 상태." },
      business: { title: "LIVON Business | 15개 사업 영역과 수익 모델 — NEWON", desc: "생활 슈퍼앱과 서비스·전문가 마켓이라는 방향, 5개 그룹 15개 사업 영역, B2C·마켓·B2B·B2G·광고·글로벌 사업 모델, 추진 단계와 운영 원칙." },
      partnerships: { title: "LIVON Partnerships | 20개 협력 유형 — NEWON", desc: "LIVON과 협력해야 하는 이유, 5개 그룹 20개 협력 유형, 공공정보 출처와 사업 파트너의 구분, 협력 원칙과 진행 과정." },
      contact: { title: "LIVON Contact | 문의 — NEWON", desc: "서비스 이용, 생활 분야 정보, 사업·제휴까지 LIVON 문의 14개 유형. NEWON 공식 문의 창구(newon@newon.app)로 연결됩니다." },
    },

    /* ───────── 01 Overview — brand story ───────── */
    overview: {
      heroTitleHtml: "인생의 모든 순간,<br>LIVON 하나로.",
      heroLead: "All-in-One Life Platform. 학교와 첫 직장, 첫 집과 결혼, 출산과 돌봄, 은퇴까지 — 인생의 단계마다 필요한 정보를 한 흐름으로 잇습니다.",
      heroCta: "플랫폼 살펴보기",
      why: {
        kicker: "Why LIVON",
        statement: "인생의 큰 결정은\n늘 처음 겪는 일입니다.",
        body: [
          "입대를 앞둔 날, 첫 월급을 받은 달, 처음 전셋집 계약서를 마주한 저녁, 부모님의 돌봄을 처음 고민하는 순간. 누구에게나 처음이고, 필요한 정보는 여러 기관과 포털, 게시판에 흩어져 있습니다.",
          "LIVON은 이 질문들을 한 사람의 삶이라는 하나의 흐름 위에 다시 놓기 위해 시작했습니다. 정보를 더 많이 모으는 것이 아니라, 지금의 삶에 맞게 연결하는 것이 LIVON이 하는 일입니다.",
        ],
        marks: [["처음", "인생의 고비는 대부분 처음 겪습니다."], ["흩어짐", "필요한 정보는 기관과 분야마다 따로 있습니다."], ["반복", "단계가 바뀔 때마다 같은 검색을 다시 합니다."]],
      },
      problem: {
        kicker: "Before & After",
        title: "같은 질문을, 고비마다\n다시 찾지 않도록.",
        cols: ["", "지금까지", "LIVON에서"],
        rows: [
          ["정보의 위치", "기관·포털·게시판에 분야별로 흩어져 있습니다.", "생애 단계와 인생 사건을 기준으로 한 흐름에 놓입니다."],
          ["출처와 시점", "언제, 어느 지역 기준인지 알기 어렵습니다.", "공공 제도는 출처·확인 기준일·대상 지역을 함께 보여 줍니다."],
          ["다음 단계", "하나를 해결해도 이어서 무엇을 할지 보이지 않습니다.", "관련 분야와 ‘먼저 확인할 것’을 이어서 안내합니다."],
          ["시작의 부담", "가입과 로그인부터 요구합니다.", "로그인 없이 시작하고, 기록은 이 기기에만 저장합니다."],
          ["광고와 정보", "유료 노출과 정보의 경계가 흐립니다.", "유료 광고·제휴는 항상 따로 표시합니다."],
        ],
      },
      vision: {
        kicker: "Mission & Vision",
        mission: "누구나 인생의 다음 단계를 혼자 헤매지 않고 준비할 수 있게.",
        vision: "인생의 모든 순간에 먼저 열어 보는 하나의 생활 플랫폼.",
        missionLabel: "Mission", visionLabel: "Vision",
        points: [["단계", "10대부터 70대 이상까지, 지금의 생애 단계에서 출발합니다."], ["사건", "군 입대, 첫 취업, 결혼, 은퇴처럼 한 사건에 필요한 여러 분야를 함께 보여 줍니다."], ["출처", "공공 제도는 공식 출처와 기준일, 대상 지역을 함께 표시합니다."]],
        facts: [["40", "생활 분야 (콘텐츠 분류)"], ["5", "생애 영역"], ["7", "생애 단계"], ["8", "핵심 기능"]],
        factsNote: "숫자는 LIVON의 정보 구조입니다. 이용자 수나 성과 지표가 아닙니다.",
      },
      journey: {
        kicker: "Life Journey",
        title: "성장에서 노후까지,\n하나로 이어지는 여정.",
        lead: "삶의 다섯 장(章)과 그 시기에 가장 자주 떠오르는 질문입니다. 나이는 일반적인 예시이며 사람마다 다릅니다.",
        questions: ["무엇을 배우고, 어디로 가야 할까?", "첫 일과 군 복무, 무엇부터 준비할까?", "혼자 살기 시작하면 무엇을 챙겨야 할까?", "가족이 생기면 어떤 제도가 있을까?", "은퇴 이후의 삶은 어떻게 준비할까?"],
      },
      stage: { kicker: "Life Stage", title: "지금의 생애 단계에서\n출발합니다.", lead: "LIVON 웹은 이미 7개 생애 단계별 주제와 가이드를 제공합니다. 단계를 고르면 그 시기의 대표 주제가 보입니다." },
      flow: {
        kicker: "A Person's Journey",
        title: "한 사람이 LIVON을\n쓰는 방식.",
        lead: "예시: 첫 독립을 준비하는 20대. 실제 화면이 아니라 LIVON이 정보를 잇는 순서를 보여 주는 예입니다.",
        steps: [
          ["단계를 고릅니다", "지금의 생애 단계에서 시작합니다.", "20대 — 독립·주거·첫 직장 주제가 먼저 보입니다."],
          ["사건으로 넓힙니다", "한 사건에 필요한 분야를 함께 봅니다.", "‘독립·이사’ — 주거, 계약 전 확인, 전입신고, 생활비가 이어집니다."],
          ["공식 출처로 확인합니다", "제도는 운영 기관에서 최종 확인합니다.", "주거 지원 제도 — 공식 포털 링크와 확인 기준일, 대상 지역."],
          ["내 기기에 정리합니다", "할 일과 일정을 로그인 없이 저장합니다.", "‘계약 전 확인’ 체크리스트를 마이라이프에 담습니다."],
          ["필요할 때 다음으로", "다른 NEWON 앱이나 서비스로 안내받습니다.", "쓰지 않는 물건 나누기는 SHAREON에서."],
        ],
        exampleLabel: "예시",
      },
      principles: {
        kicker: "Principles",
        title: "LIVON이 지키는 원칙.",
        items: [
          ["무료, 로그인 없이", "핵심 정보와 기기 안 기록은 회원가입 없이 무료로 씁니다."],
          ["출처·기준일·지역", "공공 정보는 출처, 확인 기준일, 대상 지역과 함께 보여 줍니다."],
          ["있는 그대로의 상태", "분야와 기능마다 제공 중·준비 중·추진 예정을 그대로 표시합니다."],
          ["전문가를 대신하지 않음", "의료·법률·보험·금융은 일반 정보와 공식 창구 안내까지만 합니다."],
          ["광고는 광고로", "유료 광고·제휴는 일반 정보와 항상 구분해 표시합니다."],
          ["개인정보 최소", "필요한 정보만, 가능하면 이용자의 기기 안에만 둡니다."],
          ["가짜 마켓 없음", "실제 판매자가 생기기 전까지 상품·예약·결제를 만들지 않습니다."],
        ],
      },
      direction: {
        kicker: "Direction",
        title: "정보에서 시작해,\n생활 전체로.",
        lead: "LIVON은 생애 정보에서 출발해 생활 슈퍼앱과 서비스·전문가 마켓으로 넓혀 갑니다. 아래는 방향이며, 지금 모두 제공된다는 뜻이 아닙니다.",
        items: [
          ["지금", "LIVON 웹", "생애 단계·오늘의 발견·탐색·마이라이프를 무료로, 로그인 없이.", "live"],
          ["다음", "단독 iOS·Android 앱", "웹을 감싼 앱이 아닌 독립 앱으로 출시를 준비합니다.", "preparing"],
          ["이후", "생활 슈퍼앱 + 서비스·전문가 마켓", "정보를 확인한 자리에서 믿을 수 있는 서비스와 전문가로 이어지는 구조. 실제 판매자가 생긴 뒤 엽니다.", "concept"],
        ],
      },
      newon: {
        kicker: "Inside NEWON",
        title: "NEWON 안에서\nLIVON의 자리.",
        lead: "NEWON의 각 앱은 자기 역할에 집중하고, LIVON은 인생 전반의 정보와 제도를 안내하며 필요한 앱을 알려 줍니다. 현재 앱 사이의 데이터 연동은 없습니다.",
        livon: "인생 전반의 정보·제도·생활 안내",
        center: "생애 정보의 출발점",
      },
      next: { kicker: "More about LIVON", title: "LIVON을 더 살펴보세요." },
    },

    /* ───────── 02 Platform ───────── */
    platform: {
      heroTitle: "40개 생활 분야와\n8개 핵심 기능.",
      heroLead: "LIVON 플랫폼의 구조입니다. 앱의 탭 구성, 핵심 기능, 로그인 없이 쓰는 범위, 40개 분야를 실제 제공 상태와 함께 정리했습니다.",
      tabs: {
        kicker: "App Structure",
        title: "다섯 개의 탭으로\n삶을 정리합니다.",
        lead: "단독 iOS·Android 앱의 하단 탭 구성입니다. 앱은 출시 준비 중이며, 같은 기능을 지금 LIVON 웹에서 쓸 수 있습니다.",
        items: [
          ["홈", "Home", "오늘의 발견과 관심 분야, 지금 생애 단계의 주제가 먼저 보입니다.", "live"],
          ["탐색", "Explore", "40개 분야, 공식 포털, 장소·강좌 등 실시간 검색(일부 제공처 점검 중).", "partial"],
          ["마켓", "Market", "생활 서비스·전문가 마켓. 실제 판매자가 생기기 전까지 ‘준비 중’으로 표시합니다.", "preparing"],
          ["마이라이프", "My Life", "할 일·일정·루틴·기록·저장. 로그인 없이 이 기기에만 저장합니다.", "live"],
          ["전체", "More", "설정, 이용 안내, 공식 정보 기준, 다른 NEWON 앱 안내.", "live"],
        ],
        phoneNote: "탭 구성 예시 · 실제 앱 화면이 아닙니다",
      },
      coreKicker: "Core Features", coreTitle: "8개 핵심 기능", coreLead: "기능마다 지금 제공하는 범위와 상태를 그대로 적었습니다.", tagsLabel: "주요 영역",
      anon: {
        kicker: "Anonymous Mode",
        title: "로그인 없이 쓰는 범위,\n나중에 계정이 필요한 범위.",
        lead: "LIVON은 무료이고 로그인 없이 쓸 수 있습니다. 기기 안에만 저장하는 기록에는 로그인이 필요 없습니다. 서버에 저장하거나 다른 사람과 거래하는 기능은 도입할 때 계정이 필요합니다.",
        cols: ["기능", "로그인", "저장 위치", "상태"],
        rows: [
          ["생애 단계·오늘의 발견·탐색 열람", "필요 없음", "저장하지 않음", "live"],
          ["마이라이프 할 일·일정·루틴·기록", "필요 없음", "이 기기", "live"],
          ["여러 기기 동기화", "필요 (도입 시)", "서버", "planned"],
          ["문서함", "필요 (도입 시)", "서버", "planned"],
          ["커뮤니티 공개 글쓰기", "필요 (도입 시)", "서버", "planned"],
          ["마켓 예약·결제", "필요 (도입 시)", "서버", "preparing"],
        ],
        note: "계정과 동기화를 도입하더라도 기존 익명 이용자의 기록은 그대로 지키는 것을 전제로 합니다.",
      },
      events: { kicker: "Life Event Explorer", title: "지금, 어떤 순간을\n준비하고 있나요?", lead: "하나의 인생 사건에 필요한 여러 분야를 함께 연결합니다. 사건을 고르면 40칸 분야 지도에 관련 분야가 표시됩니다.", check: "먼저 확인할 것", related: "연결되는 분야", mapLabel: "40개 분야 지도", tag: "구조 예시", note: "실제 앱 기능이 아니라, LIVON이 정보를 연결하는 구조를 보여 주는 예시입니다. 입력한 내용을 저장하거나 개인 결과를 계산하지 않습니다." },
      groupsKicker: "40 Life Categories", groupsTitle: "5개 영역, 40개 생활 분야", groupsLead: "영역을 고르면 해당 분야로 이동합니다. 분야마다 서비스 설명, 세부 주제, 공식 정보 출처, 제공 상태를 담았습니다.",
      market: {
        kicker: "Market",
        title: "마켓은 실제 판매자가\n생길 때 엽니다.",
        lead: "LIVON의 확장 방향은 정보를 확인한 바로 그 자리에서 믿을 수 있는 생활 서비스와 전문가를 찾는 마켓입니다. 지금은 준비 중이며, 웹사이트와 앱 어디에도 가짜 상품이나 예약·결제 화면을 두지 않습니다.",
        doTitle: "마켓에서 다룰 것 (준비 중)",
        doItems: ["이사·청소·수리 같은 생활 서비스", "교육·커리어 코칭 같은 전문가 서비스", "출처와 자격을 확인한 서비스 정보", "이용 후기와 신고 체계 (운영 정책 이후)"],
        dontTitle: "하지 않는 것",
        dontItems: ["실제 판매자 없이 상품·예약·결제 만들기", "개인 간 중고거래 — SHAREON으로 안내합니다", "의료·법률 분야 성과형 수수료 — 법률 검토 전까지 보류", "인허가가 필요한 판매·중개를 LIVON이 직접 하기"],
        shareon: "중고·공유는 SHAREON",
      },
      officialKicker: "Official Information", officialTitle: "공공 제도는 출처·기준일·대상 지역과 함께.", officialItems: [["출처", "제도를 운영하는 공식 기관과 링크"], ["기준일", "LIVON이 마지막으로 확인한 날짜"], ["대상 지역", "전국인지, 특정 지자체인지"], ["변경 안내", "신청 전 공식 사이트에서 다시 확인하도록 안내"]],
      faq: {
        kicker: "FAQ", title: "자주 묻는 질문",
        items: [
          ["LIVON은 무료인가요?", "네. 핵심 정보와 기기 안 기록은 무료입니다. 향후 고급 관리·개인화·AI 같은 프리미엄 기능은 제안 단계이며, 정해진 요금은 없습니다."],
          ["로그인해야 쓸 수 있나요?", "아니요. 로그인 없이 쓸 수 있고, 마이라이프 기록은 이 기기에만 저장됩니다. 여러 기기 동기화나 예약처럼 서버가 필요한 기능은 도입할 때 계정이 필요합니다."],
          ["40개 분야가 모두 제공되나요?", "아니요. 40개 분야는 콘텐츠 분류입니다. 분야마다 ‘제공 중(일부)’, ‘관련 안내 일부 제공’, ‘추진 예정’ 상태를 그대로 표시합니다."],
          ["앱은 언제 나오나요?", "단독 iOS·Android 앱을 준비하고 있습니다. 출시 일정은 확정되면 알려 드립니다. 그전까지는 LIVON 웹을 이용해 주세요."],
          ["중고 물건도 거래할 수 있나요?", "LIVON은 개인 간 중고거래를 만들지 않습니다. 물건·장비·공간 공유와 대여는 NEWON의 SHAREON을 이용해 주세요."],
          ["의료·법률 상담을 받을 수 있나요?", "LIVON은 일반 정보와 공식 기관 안내만 제공하며 전문가의 판단을 대신하지 않습니다. 위급한 상황에서는 공식 긴급 창구를 먼저 이용해 주세요."],
        ],
      },
      f: { line: "세부 서비스", topics: "세부 주제", situations: "관련 인생 상황", who: "이용 대상", src: "공식 정보 출처", svc: "관련 LIVON 서비스", newon: "NEWON 연계", newonNone: "없음", newonNote: "별도 앱 · 데이터 연동 없음", note: "운영 원칙", ctaWeb: "LIVON 웹에서 보기", ctaPlanned: "이 분야 협력 문의", more: "자세히 보기" },
    },

    /* ───────── 03 Business ───────── */
    business: {
      heroTitle: "15개 사업 영역과\n수익 모델.",
      heroLead: "LIVON은 상품을 직접 판매하기보다 정보·사용자 경험·기업용 솔루션, 그리고 실제 판매자가 생긴 뒤의 서비스 마켓으로 사업을 넓힙니다. 모든 요금과 수수료는 제안 단계입니다.",
      verdict: {
        kicker: "Principle",
        title: "40개 분야를\n40개의 앱으로 만들지 않습니다.",
        items: ["공통 데이터 구조, 생애 단계, 인생 사건별 연결, 공식 출처 관리를 중심으로 하나의 플랫폼을 운영합니다. 그래야 정보 갱신 부담을 줄이고 정확성을 지킬 수 있습니다.", "고객별 맞춤 외주가 아니라 표준화된 자체 솔루션과 플랫폼 제품을 만듭니다.", "무료 핵심 기능이 먼저이고, 수익 모델은 그 위에 얹습니다. 무료 범위를 줄여 수익을 만들지 않습니다."],
      },
      tracks: {
        kicker: "Two Tracks",
        title: "생활 슈퍼앱과\n서비스·전문가 마켓.",
        items: [
          ["Track 1", "생활 슈퍼앱", "인생의 단계마다 먼저 여는 앱. 정보·기록·공식 출처 연결은 무료로, 로그인 없이.", ["무료 핵심 유지", "프리미엄은 제안 단계", "단독 iOS·Android 앱 준비"], "live"],
          ["Track 2", "서비스·전문가 마켓", "정보를 확인한 이용자가 믿을 수 있는 서비스와 전문가로 이어지는 마켓. 실제 판매자가 확보된 뒤 엽니다.", ["앱 마켓 탭은 ‘준비 중’", "가짜 상품·예약·결제 없음", "중고거래는 SHAREON"], "preparing"],
        ],
      },
      kicker: "Business Areas", title: "15개 사업 영역", lead: "5개 그룹으로 나눈 15개 사업 영역입니다. 대부분은 준비 또는 확장 방향 단계이며, 영역마다 현재 상태를 그대로 표시합니다.",
      f: { what: "사업 개요", who: "대상 고객", value: "제공 가치", rev: "수익 구조 (제안)", partners: "협력 대상", rule: "규제·운영 조건", cta: "사업 문의", more: "세부 구조", tags: "주요 영역" },
      models: { kicker: "Business Models", title: "사업 모델", lead: "대상별 사업 모델입니다. 수익 방식은 모두 제안이며, 확정된 가격·수수료율은 없습니다.", cols: ["모델", "대상", "제공 가치", "수익 방식 (제안)", "상태"] },
      revenue: {
        kicker: "Revenue Opportunities",
        title: "수익 기회와\n솔직한 전제.",
        body: [
          "LIVON의 수익 기회는 정보를 찾는 시점과 실제 행동하는 시점이 만나는 곳에 있습니다. 결혼을 준비하는 사람은 일정과 예산, 서비스가 함께 필요하고, 은퇴를 준비하는 사람은 연금 정보와 생활 계획, 전문가의 조언이 함께 필요합니다. 이 순간을 이어 주는 서비스 마켓, 직원의 생애 이벤트를 돕는 기업 솔루션, 주민을 위한 공공 솔루션이 주요 기회입니다.",
          "다만 이 모든 것은 아직 제안입니다. 구독·AI·기업·광고·수수료의 가격은 정해지지 않았고, 이 페이지에 숫자를 쓰지 않습니다. 의료·법률처럼 규제가 있는 분야의 성과형 수수료는 법률 검토가 끝날 때까지 보류합니다.",
        ],
        caveats: ["가격·수수료율 미정 — 공개하지 않음", "규제 분야 성과형 수수료 보류 (법률 검토 전)", "공공 지원금·법정 급여에는 수수료를 부과하지 않음", "무료 핵심 기능과 로그인 없는 이용은 유지", "실제 판매자 확보 전 마켓 수익 없음"],
        caveatsTitle: "전제",
      },
      roadKicker: "Roadmap", roadTitle: "다섯 단계로 추진합니다.", roadNow: "진행 중", roadNext: "다음", roadLater: "이후",
      ruleKicker: "Operating Principles", ruleTitle: "일반 정보와 인허가 서비스의\n경계를 지킵니다.",
      ruleItems: ["보험 모집·중개를 하지 않습니다.", "금융상품을 판매·권유하지 않습니다.", "투자 자문·개인별 투자 추천을 하지 않습니다.", "진단·치료 등 의료행위를 하지 않습니다.", "법률 대리·세무 대리를 하지 않습니다.", "공공 지원금·법정 급여에는 수수료를 부과하지 않습니다.", "개인 간 중고거래를 만들지 않고 SHAREON으로 안내합니다.", "유료 광고·제휴는 항상 표시합니다."],
      close: { title: "LIVON과 사업을 이야기해 주세요.", lead: "기업 솔루션, 공공·기관 협력, 서비스 마켓 참여 의향 모두 NEWON 공식 문의 창구로 받습니다." },
    },

    /* ───────── 04 Partnerships ───────── */
    partnerships: {
      heroTitle: "삶의 중요한 순간을\n함께 연결할 파트너.",
      heroLead: "LIVON과 협력할 수 있는 20개 유형입니다. 이 페이지는 협력 유형 안내이며, 실제 협약이 체결되지 않은 기관을 파트너로 표시하지 않습니다.",
      why: {
        kicker: "Why Partner",
        title: "정확한 정보가 필요한 사람에게,\n필요한 순간에.",
        items: [["시점", "사람들이 실제로 그 문제를 겪는 생애 단계와 인생 사건에서 만납니다."], ["신뢰", "출처와 기준일을 표시하는 구조 안에서 기관의 정보가 정확하게 전달됩니다."], ["경계", "광고·제휴·출처를 구분해 표시하므로 이용자가 오해하지 않습니다."], ["확장", "웹에서 단독 앱, 서비스 마켓으로 넓어지는 과정에 함께합니다."]],
      },
      kicker: "Partnership Types", title: "20개 협력 유형", lead: "다섯 그룹으로 나눈 협력 유형입니다. 모두 ‘협력 검토 분야’이며, 현재 체결된 협약을 뜻하지 않습니다.",
      f: { what: "협력 내용", value: "제공 가치", rev: "수익 구조", cond: "협력 조건", cta: "협력 문의", officialTag: "공공정보 출처" },
      terms: {
        kicker: "Sources vs Partners",
        title: "공공정보 출처와\n사업 파트너는 다릅니다.",
        lead: "정부·공공기관은 협약이 없는 한 제휴사로 표시하지 않고, 공개된 정보의 출처로만 표시합니다.",
        cols: ["", "공공정보 출처", "사업 파트너"],
        rows: [["관계", "공개된 정보를 인용", "합의된 범위의 협력"], ["표시 방식", "‘출처’와 확인 기준일", "‘제휴’ 또는 ‘광고’ 표시"], ["계약", "없음", "문서로 합의"], ["수익", "해당 없음", "협의 (공개하지 않음)"], ["파트너 표기", "하지 않음", "협약 체결 후에만"]],
      },
      principles: {
        kicker: "Principles", title: "협력 원칙",
        items: ["공식 출처를 표시하고 허위·과장 표현을 쓰지 않습니다.", "유료 광고·제휴는 일반 정보와 항상 구분해 표시합니다.", "이용자 개인정보는 최소한으로, 동의 없이 제공하지 않습니다.", "인허가가 필요한 판매·중개·자문을 LIVON이 대신하지 않습니다.", "의료·법률 분야 성과형 수수료는 법률 검토 전까지 논의하지 않습니다.", "협약이 체결되기 전에는 어떤 기관도 파트너로 표시하지 않습니다."],
      },
      stepsKicker: "How it works", stepsTitle: "협력은 이렇게 진행됩니다.",
      faq: {
        kicker: "FAQ", title: "협력 전에 자주 묻는 질문",
        items: [
          ["지금 LIVON의 파트너는 누구인가요?", "이 페이지는 협력 유형 안내입니다. 체결된 협약이 생기면 해당 범위에서만 표시합니다."],
          ["협력 비용이나 수수료는 어떻게 되나요?", "조건은 협력마다 협의로 정하며 공개된 요금표는 없습니다. 이 페이지에도 숫자를 쓰지 않습니다."],
          ["마켓에 판매자로 참여할 수 있나요?", "마켓은 준비 중입니다. 참여 의향은 ‘콘텐츠·전문가 협력’ 문의로 남겨 주시면 준비 과정에서 함께 검토합니다."],
          ["공공기관 정보를 LIVON에 써도 되나요?", "LIVON은 공개된 공공 정보를 출처와 기준일을 밝혀 안내합니다. 정보 수정이 필요하면 문의해 주세요."],
        ],
      },
      close: { kicker: "Partnership", title: "함께할 방법을\n이야기해 주세요." },
    },

    /* ───────── 05 Contact ───────── */
    contact: {
      heroTitle: "LIVON 문의.",
      heroLead: "문의 유형을 고르면 NEWON 공식 문의 창구로 이동합니다. 추천 제목을 그대로 쓰면 담당 분야로 빠르게 전달됩니다.",
      kicker: "Inquiry Types", title: "14개 문의 유형", lead: "세 그룹으로 나눈 문의 유형입니다. 각 줄의 링크는 NEWON 공식 문의 창구의 해당 유형으로 연결됩니다.",
      cols: ["#", "문의 유형", "이런 내용을 보내 주세요", "추천 제목", ""],
      subjectLabel: "추천 제목", go: "문의 창구로",
      channel: {
        kicker: "NEWON Contact",
        title: "모든 문의는\nNEWON 공식 창구로.",
        lead: "LIVON 전용 문의 시스템이나 회원가입은 없습니다. NEWON 공식 문의 창구를 그대로 사용합니다.",
        emailLabel: "이메일", formLabel: "문의 창구", formCta: "NEWON 문의 창구 열기", bizLabel: "기업·기관 프로젝트", bizCta: "NEWON Business 문의",
      },
      tipsTitle: "문의 전에 확인해 주세요",
      tips: ["문의 유형과 기관·회사 이름을 적어 주세요.", "협력 또는 문의하려는 생활 분야를 알려 주세요.", "원하는 시기와 범위, 참고 자료 링크가 있으면 함께 보내 주세요.", "정보 오류 제보는 해당 페이지 주소와 확인한 공식 출처를 함께 보내 주시면 빠르게 확인합니다."],
      limitsTitle: "답변하지 않는 문의",
      limits: ["개인의 법률·의료·금융·세무 자문 요청 — 해당 공식 기관을 안내합니다.", "공공 지원금 자격·금액 판정 — 각 기관 공고와 창구가 기준입니다.", "대리 신청·대리 접수 요청", "위급한 상황 — 112·119 등 공식 긴급 창구를 먼저 이용해 주세요."],
      faq: {
        kicker: "FAQ", title: "문의 관련 질문",
        items: [
          ["답변은 어디로 오나요?", "NEWON 공식 문의 창구에 남긴 연락처나 보내 주신 이메일 주소로 답변합니다."],
          ["LIVON 앱 안에서 문의할 수 있나요?", "앱은 출시 준비 중입니다. 지금은 NEWON 공식 문의 창구와 이메일을 이용해 주세요."],
          ["내 기기에 저장한 기록을 복구해 줄 수 있나요?", "마이라이프 기록은 이용자의 기기에만 저장되어 NEWON이 볼 수 없고 복구할 수도 없습니다. 기기 백업을 권장합니다."],
        ],
      },
      close: { kicker: "Contact", title: "LIVON과 함께할\n새로운 가능성을 이야기해 주세요." },
    },
  },

  en: {
    brand: "LIVON",
    positioning: "All-in-One Life Platform",
    slogan: "Every moment of life, one LIVON.",
    subnavLabel: "LIVON menu",
    appStatus: "The LIVON app is in preparation. You can use LIVON on the web today — free, no account needed.",
    notice: "The 40 categories are a business and content classification, not 40 finished features. Each one shows what is actually available.",
    disclaimer: "Medical, legal, insurance, financial and welfare information is general guidance with links to official bodies. It does not replace professional judgement.",
    tryWeb: "Try LIVON on the web",
    toContact: "Contact us",
    seo: {
      overview: { title: "LIVON | NEWON — Every moment of life, one LIVON", desc: "LIVON, the All-in-One Life Platform, connects scattered life information around life stages, life events and official sources. Free, no account needed — LIVON's story and principles." },
      platform: { title: "LIVON Platform | 40 life categories and 8 core features — NEWON", desc: "App tabs (Home, Explore, Market, My Life, More), eight core features, what works without an account, the life-event explorer and forty categories with their real status." },
      business: { title: "LIVON Business | 15 business areas and models — NEWON", desc: "A life super app and a service and expert market — LIVON's 15 business areas in five groups, B2C, market, B2B, B2G, advertising and global models, roadmap and operating principles." },
      partnerships: { title: "LIVON Partnerships | 20 partnership types — NEWON", desc: "Why partner with LIVON, 20 partnership types in five groups, public sources versus business partners, principles and process." },
      contact: { title: "LIVON Contact — NEWON", desc: "14 LIVON inquiry types — service, life information, business and partnerships — through NEWON's official contact page (newon@newon.app)." },
    },

    overview: {
      heroTitleHtml: "Every moment of life,<br>one LIVON.",
      heroLead: "The All-in-One Life Platform. School and a first job, a first home and marriage, birth and care, retirement — the information each stage needs, in one flow.",
      heroCta: "Explore the platform",
      why: {
        kicker: "Why LIVON",
        statement: "Life's big decisions\nare almost always firsts.",
        body: [
          "The day before enlisting, the month of a first salary, the evening you first face a lease, the moment you first think about caring for a parent. It is a first for everyone, and the information you need is scattered across agencies, portals and forums.",
          "LIVON began to put those questions back onto one flow — a single person's life. Its job is not to collect more information, but to connect it to the life you are living now.",
        ],
        marks: [["Firsts", "Most of life's turning points happen to us once."], ["Scattered", "What you need sits with different bodies and fields."], ["Repeated", "Every new stage means searching all over again."]],
      },
      problem: {
        kicker: "Before & After",
        title: "So you don't search for the same\nanswers at every turning point.",
        cols: ["", "Until now", "With LIVON"],
        rows: [
          ["Where it lives", "Scattered by field across agencies, portals and forums.", "Placed on one flow, around life stages and life events."],
          ["Source and date", "Hard to tell when, and for which region, it applies.", "Public schemes show the source, the date checked and the region."],
          ["Next step", "Solve one thing and the next one is invisible.", "Related fields and ‘check first’ items follow on."],
          ["Getting started", "Sign-up comes first.", "Start without an account; records stay on your device."],
          ["Ads and information", "Paid placement blurs into information.", "Paid ads and partnerships are always labelled."],
        ],
      },
      vision: {
        kicker: "Mission & Vision",
        mission: "Help anyone prepare for the next stage of life without getting lost on their own.",
        vision: "The one life platform people open first, at every moment of life.",
        missionLabel: "Mission", visionLabel: "Vision",
        points: [["Stage", "Start from where you are, from the teens to 70+."], ["Event", "One life event — enlisting, a first job, marriage, retirement — shows every field it touches."], ["Source", "Public schemes always show the official source, the date checked and the region covered."]],
        facts: [["40", "Life categories (content classification)"], ["5", "Life areas"], ["7", "Life stages"], ["8", "Core features"]],
        factsNote: "These numbers describe LIVON's information structure. They are not user counts or performance figures.",
      },
      journey: {
        kicker: "Life Journey",
        title: "From growing up to later life,\none continuous journey.",
        lead: "Five chapters of life and the question that comes up most in each. Ages are typical examples — everyone's pace differs.",
        questions: ["What should I learn, and where am I heading?", "A first job, military service — where do I start?", "Living alone for the first time — what do I need?", "With a family, which schemes apply to us?", "How do I prepare for life after work?"],
      },
      stage: { kicker: "Life Stage", title: "Start from the stage\nyou are in.", lead: "The LIVON web service already offers topics and guides for seven life stages. Pick a stage to see its key topics." },
      flow: {
        kicker: "A Person's Journey",
        title: "How one person\nuses LIVON.",
        lead: "Example: someone in their 20s preparing to move out. Not a real screen — it shows the order in which LIVON connects information.",
        steps: [
          ["Pick a stage", "Start from your current life stage.", "20s — moving out, housing and first-job topics come first."],
          ["Widen to an event", "See every field one event touches.", "‘Moving out’ — housing, pre-contract checks, registration and living costs."],
          ["Check the official source", "Schemes are confirmed with the body that runs them.", "Housing support — the official portal link, date checked and region."],
          ["Keep it on your device", "Save to-dos and plans without an account.", "Add the ‘before signing’ checklist to My Life."],
          ["Move on when needed", "Get pointed to another NEWON app or service.", "Sharing things you no longer use — in SHAREON."],
        ],
        exampleLabel: "Example",
      },
      principles: {
        kicker: "Principles",
        title: "The principles LIVON keeps.",
        items: [
          ["Free, no account", "Core information and on-device records are free and need no sign-up."],
          ["Source, date, region", "Public information comes with its source, the date checked and the region."],
          ["Status as it is", "Every field and feature says available, in preparation or planned."],
          ["Not a professional", "Medical, legal, insurance and finance stop at general information and official channels."],
          ["Ads are ads", "Paid ads and partnerships are always labelled apart from information."],
          ["Minimal personal data", "Only what is needed — and, where possible, only on your device."],
          ["No fake market", "No products, booking or payment until real sellers exist."],
        ],
      },
      direction: {
        kicker: "Direction",
        title: "Starting from information,\ngrowing into everyday life.",
        lead: "LIVON starts from life information and grows into a life super app with a service and expert market. This is a direction — not a claim that all of it exists today.",
        items: [
          ["Now", "LIVON web", "Life stages, Today Feed, Explore and My Life — free, no account.", "live"],
          ["Next", "Standalone iOS & Android apps", "Real apps, not a wrapped website, in preparation.", "preparing"],
          ["Later", "Life super app + service & expert market", "From checking information straight to trustworthy services and experts. Opens once real sellers are on board.", "concept"],
        ],
      },
      newon: {
        kicker: "Inside NEWON",
        title: "LIVON's place\ninside NEWON.",
        lead: "Each NEWON app focuses on its own job. LIVON explains information and schemes across life and points to the right app. There is no data link between the apps today.",
        livon: "Information, schemes and guidance across life",
        center: "Where life information starts",
      },
      next: { kicker: "More about LIVON", title: "Look closer at LIVON." },
    },

    platform: {
      heroTitle: "40 life categories,\n8 core features.",
      heroLead: "How the LIVON platform is built: the app's tabs, the core features, what works without an account and the forty categories — each with its real status.",
      tabs: {
        kicker: "App Structure",
        title: "Five tabs\nto organise life.",
        lead: "The bottom tabs of the standalone iOS and Android apps. The apps are in preparation; the same features work on LIVON web today.",
        items: [
          ["홈", "Home", "Today Feed, your interests and the topics of your current life stage come first.", "live"],
          ["탐색", "Explore", "Forty categories, official portals, live search for places and classes (some providers under review).", "partial"],
          ["마켓", "Market", "A market for everyday services and experts. Shown as ‘in preparation’ until real sellers exist.", "preparing"],
          ["마이라이프", "My Life", "To-dos, plans, routines, notes and saved items — no account, stored on this device.", "live"],
          ["전체", "More", "Settings, help, how official information is checked, and other NEWON apps.", "live"],
        ],
        phoneNote: "Tab layout example · not a real app screen",
      },
      coreKicker: "Core Features", coreTitle: "8 core features", coreLead: "What each feature offers today, and its status, as it is.", tagsLabel: "Key areas",
      anon: {
        kicker: "Anonymous Mode",
        title: "What works without an account,\nand what will need one.",
        lead: "LIVON is free and works without an account. Records kept only on your device need no account. Features that store data on a server or involve other people will need an account when they arrive.",
        cols: ["Feature", "Account", "Stored", "Status"],
        rows: [
          ["Reading Life Stage, Today Feed, Explore", "Not needed", "Nothing stored", "live"],
          ["My Life to-dos, plans, routines, notes", "Not needed", "This device", "live"],
          ["Sync across devices", "Needed (when added)", "Server", "planned"],
          ["Document box", "Needed (when added)", "Server", "planned"],
          ["Public community posts", "Needed (when added)", "Server", "planned"],
          ["Market booking and payment", "Needed (when added)", "Server", "preparing"],
        ],
        note: "Accounts and sync are planned on the condition that existing anonymous users keep their records.",
      },
      events: { kicker: "Life Event Explorer", title: "What moment are you\npreparing for?", lead: "One life event, all the fields it touches. Choose an event and the 40-cell map shows which categories it connects.", check: "Check first", related: "Connected categories", mapLabel: "Map of the 40 categories", tag: "Structure example", note: "An example of how LIVON connects information, not an app feature. Nothing you choose is stored and no personal result is calculated." },
      groupsKicker: "40 Life Categories", groupsTitle: "Five areas, forty life categories", groupsLead: "Choose an area to jump to its categories. Each has its service line, topics, official sources and status.",
      market: {
        kicker: "Market",
        title: "The market opens\nwhen real sellers do.",
        lead: "LIVON's direction is a market where you find trustworthy everyday services and experts right where you checked the information. It is in preparation, and neither the website nor the app shows fake products, booking or payment.",
        doTitle: "What it will cover (in preparation)",
        doItems: ["Everyday services such as moving, cleaning and repairs", "Expert services such as education and career coaching", "Service information with checked sources and qualifications", "Reviews and reporting (after moderation rules)"],
        dontTitle: "What it will not do",
        dontItems: ["Products, booking or payment without real sellers", "Personal used-goods trading — that points to SHAREON", "Performance-based fees in medical and legal fields — on hold pending legal review", "Licensed selling or brokering by LIVON itself"],
        shareon: "Used goods & sharing: SHAREON",
      },
      officialKicker: "Official Information", officialTitle: "Public schemes come with source, date and region.", officialItems: [["Source", "The official body that runs it, with a link"], ["Date checked", "When LIVON last checked it"], ["Region", "National, or a specific local government"], ["Change notice", "A reminder to re-check on the official site"]],
      faq: {
        kicker: "FAQ", title: "Frequently asked questions",
        items: [
          ["Is LIVON free?", "Yes. Core information and on-device records are free. Premium features such as advanced management, personalisation and AI are proposals only, with no price set."],
          ["Do I need an account?", "No. LIVON works without one, and My Life records stay on your device. Features that need a server, such as sync or booking, will need an account when they arrive."],
          ["Are all forty categories available?", "No. The forty categories are a content classification. Each shows its status as it is: available (partly), related guides partly available, or planned."],
          ["When is the app coming?", "Standalone iOS and Android apps are in preparation. We will announce a date once it is set. Until then, please use LIVON web."],
          ["Can I trade used goods?", "LIVON does not build personal used-goods trading. For sharing and renting items, gear and space, use NEWON's SHAREON."],
          ["Can I get medical or legal advice?", "LIVON offers general information and official channels only, and does not replace professional judgement. In an emergency, use the official emergency services first."],
        ],
      },
      f: { line: "Services", topics: "Topics", situations: "Related life situations", who: "For", src: "Official sources", svc: "Related LIVON service", newon: "NEWON link", newonNone: "None", newonNote: "Separate app · no data link", note: "Principle", ctaWeb: "See it in LIVON web", ctaPlanned: "Discuss this area", more: "Details" },
    },

    business: {
      heroTitle: "15 business areas\nand models.",
      heroLead: "Rather than selling products, LIVON grows through information, user experience, solutions for organisations and — once real sellers exist — a service market. Every price and fee is a proposal.",
      verdict: {
        kicker: "Principle",
        title: "Forty categories,\nnot forty apps.",
        items: ["One platform built on a shared data structure, life stages, event-led connections and managed official sources — the only way to keep updates manageable and information accurate.", "Standard products and our own platform — not custom client work.", "The free core comes first; business models sit on top of it. We do not make money by shrinking what is free."],
      },
      tracks: {
        kicker: "Two Tracks",
        title: "A life super app and\na service & expert market.",
        items: [
          ["Track 1", "Life super app", "The app you open first at every stage. Information, records and official sources — free, no account.", ["Free core stays", "Premium is a proposal", "Standalone iOS & Android apps in preparation"], "live"],
          ["Track 2", "Service & expert market", "Where informed users reach trustworthy services and experts. Opens once real sellers are on board.", ["Market tab says ‘in preparation’", "No fake products, booking or payment", "Used goods point to SHAREON"], "preparing"],
        ],
      },
      kicker: "Business Areas", title: "15 business areas", lead: "Fifteen business areas in five groups. Most are in preparation or an expansion direction; each shows its status as it is.",
      f: { what: "Overview", who: "Customers", value: "Value", rev: "Revenue (proposal)", partners: "Partners", rule: "Rules and conditions", cta: "Business inquiry", more: "Structure", tags: "Key areas" },
      models: { kicker: "Business Models", title: "Business models", lead: "Models by customer. Every revenue line is a proposal; no prices or rates are set.", cols: ["Model", "For", "Value", "Revenue (proposal)", "Status"] },
      revenue: {
        kicker: "Revenue Opportunities",
        title: "Opportunities,\nand honest caveats.",
        body: [
          "LIVON's opportunities sit where the moment of looking something up meets the moment of acting on it. Someone preparing a wedding needs a timeline, a budget and services together; someone preparing to retire needs pension information, a plan and expert advice together. A service market that bridges those moments, enterprise solutions for employees' life events and public solutions for residents are the main opportunities.",
          "All of this is still a proposal. No prices are set for subscriptions, AI, business plans, advertising or commission, and no numbers appear on this page. Performance-based fees in regulated fields such as medical and legal services are on hold until a legal review is complete.",
        ],
        caveats: ["Prices and rates not set — not published", "Performance-based fees in regulated fields on hold (pending legal review)", "No fees on public benefits or statutory payments", "Free core and account-free use stay", "No market revenue before real sellers exist"],
        caveatsTitle: "Caveats",
      },
      roadKicker: "Roadmap", roadTitle: "Five stages.", roadNow: "Now", roadNext: "Next", roadLater: "Later",
      ruleKicker: "Operating Principles", ruleTitle: "We keep general information\napart from licensed services.",
      ruleItems: ["No insurance sales or brokerage.", "No sale or recommendation of financial products.", "No investment advice or personal recommendations.", "No diagnosis, treatment or other medical practice.", "No legal or tax representation.", "No fees on public benefits or statutory payments.", "No personal used-goods trading — that points to SHAREON.", "Paid ads and partnerships are always labelled."],
      close: { title: "Talk business with LIVON.", lead: "Enterprise solutions, public and institutional work and interest in the service market all go through NEWON's official contact page." },
    },

    partnerships: {
      heroTitle: "Partners to connect\nlife's important moments.",
      heroLead: "Twenty ways to work with LIVON. This page describes partnership types; organisations without a signed agreement are never shown as partners.",
      why: {
        kicker: "Why Partner",
        title: "Accurate information, for the people\nwho need it, when they need it.",
        items: [["Timing", "Meet people at the life stage and event where they actually face the question."], ["Trust", "Your information travels inside a structure that shows source and date."], ["Clarity", "Ads, partnerships and sources are labelled apart, so users are not misled."], ["Growth", "Grow with LIVON from the web to standalone apps and a service market."]],
      },
      kicker: "Partnership Types", title: "20 partnership types", lead: "Partnership types in five groups. All are ‘open for discussion’ — none means a signed agreement.",
      f: { what: "What we would do", value: "Value", rev: "Revenue", cond: "Conditions", cta: "Partnership inquiry", officialTag: "Public information source" },
      terms: {
        kicker: "Sources vs Partners",
        title: "Public information sources\nare not business partners.",
        lead: "Government and public bodies are shown only as sources of public information unless an agreement exists.",
        cols: ["", "Public information source", "Business partner"],
        rows: [["Relationship", "Published information is cited", "Cooperation within an agreed scope"], ["Shown as", "‘Source’ with the date checked", "‘Partnership’ or ‘Ad’"], ["Contract", "None", "Agreed in writing"], ["Revenue", "Not applicable", "Agreed privately (not published)"], ["Called a partner", "Never", "Only after an agreement"]],
      },
      principles: {
        kicker: "Principles", title: "Partnership principles",
        items: ["Official sources are shown; no false or exaggerated claims.", "Paid ads and partnerships are always labelled apart from information.", "User data is kept to a minimum and never shared without consent.", "LIVON never stands in for licensed selling, brokering or advice.", "Performance-based fees in medical and legal fields are not discussed until a legal review is complete.", "No organisation is shown as a partner before an agreement is signed."],
      },
      stepsKicker: "How it works", stepsTitle: "How a partnership comes together.",
      faq: {
        kicker: "FAQ", title: "Questions before partnering",
        items: [
          ["Who are LIVON's partners today?", "This page describes partnership types. When an agreement is signed, it is shown only within its scope."],
          ["What does a partnership cost?", "Terms are agreed case by case and there is no public price list. No numbers appear on this page."],
          ["Can I join the market as a seller?", "The market is in preparation. Leave your interest through a ‘Content & expert cooperation’ inquiry and we will consider it as the market is prepared."],
          ["Can LIVON use our public information?", "LIVON presents published public information with its source and date checked. If something needs correcting, please contact us."],
        ],
      },
      close: { kicker: "Partnership", title: "Tell us how we\ncould work together." },
    },

    contact: {
      heroTitle: "Contact LIVON.",
      heroLead: "Choose an inquiry type to open NEWON's official contact page. Use the suggested subject so it reaches the right team quickly.",
      kicker: "Inquiry Types", title: "14 inquiry types", lead: "Inquiry types in three groups. Each link opens the matching type on NEWON's official contact page.",
      cols: ["#", "Inquiry type", "What to send", "Suggested subject", ""],
      subjectLabel: "Suggested subject", go: "Open contact",
      channel: {
        kicker: "NEWON Contact",
        title: "Every inquiry goes through\nNEWON's official contact.",
        lead: "There is no separate LIVON contact system or sign-up. NEWON's official contact page is used as it is.",
        emailLabel: "Email", formLabel: "Contact page", formCta: "Open NEWON contact", bizLabel: "Company & institution projects", bizCta: "NEWON Business inquiry",
      },
      tipsTitle: "Before you write",
      tips: ["Include the inquiry type and your organisation.", "Tell us the life area you have in mind.", "Add timing, scope and links to any material.", "For a correction, send the page address and the official source you checked — it helps us verify quickly."],
      limitsTitle: "What we cannot answer",
      limits: ["Personal legal, medical, financial or tax advice — we point to the right official body.", "Eligibility or amounts for public support — each agency's notice and office decide.", "Applying or filing on someone's behalf.", "Emergencies — please use the official emergency services first."],
      faq: {
        kicker: "FAQ", title: "About contacting us",
        items: [
          ["Where will the reply come from?", "We reply to the contact details you left on NEWON's contact page or the email address you wrote from."],
          ["Can I contact you inside the LIVON app?", "The app is in preparation. For now, please use NEWON's official contact page or email."],
          ["Can you recover records saved on my device?", "My Life records are stored only on your device. NEWON cannot see or recover them, so we recommend backing up your device."],
        ],
      },
      close: { kicker: "Contact", title: "Tell us about new\npossibilities with LIVON." },
    },
  },
};
