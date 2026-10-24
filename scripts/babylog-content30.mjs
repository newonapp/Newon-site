/**
 * BABYLOG corporate website — content upgrade 30 (2026-10-24).
 *
 * Source: "BABYLOG 최종 통합 사업계획서" (2026-10-20, 26 long-term areas, 12 revenue models, lifecycle, roles,
 * roadmap P0-P9, priorities 1-5, operating/legal checks) and the IR summary (customer/payer structure, go-to-market,
 * V/P/A labels). Rewritten for visitors; NOT reviewed by the owner.
 *
 * Status rule: "provided" = described in the store-verified BabyLog app listing (scripts/babylog-data.mjs) and the
 * existing site copy; "preparing" = next app version (V3) scope, no release date; "planned" = plan roadmap;
 * "review" = needs business/legal/safety review first. Status is shown by grouping only (no per-card badge).
 *
 * Public / private rule (qa-babylog-site.mjs): no price, fee rate, fee amount, revenue or user figure appears here.
 * The current Premium price is verified in the IR but is referred to the store screens, not printed.
 */

export const AREA_COUNT = 26;

/* =========================================================================== KO */
const KO = {
  seo: {
    overview: {
      title: "BABYLOG | NEWON — 한 아이의 20년, 한 가족의 기록",
      desc: "BABYLOG는 임신부터 고등학교 졸업까지 아이의 성장·건강·교육·가족 생활과 추억을 잇는 NEWON의 가족 종합 플랫폼입니다. 현재 iOS·Android 앱에서 육아·성장·건강 기록, 일정, 가족 공유를 제공합니다.",
    },
    platform: {
      title: "플랫폼 | BABYLOG — 26개 장기 사업 영역과 현재 제공 기능",
      desc: "BABYLOG의 26개 장기 사업 영역, 영역별 기능과 사용자 시나리오, 부모·조부모·보호자·청소년 권한 원칙, 현재 제공 기능과 개발 계획, 아동 보호 공익 영역과 자주 묻는 질문을 안내합니다.",
    },
    business: {
      title: "비즈니스 | BABYLOG — 가족 플랫폼의 사업 구조와 수익 모델",
      desc: "BABYLOG의 이용자와 지불 주체, B2C·C2C·B2B·B2B2C·B2G 구조, 12개 수익 모델의 운영·제안 단계, 32개 사업 분야, 시장 진입 전략과 운영·법률 원칙을 소개합니다.",
    },
    partnerships: {
      title: "파트너십 | BABYLOG — 협력 모델과 파일럿 제안",
      desc: "산후조리원·어린이집·유치원·학원·교육 콘텐츠·육아 브랜드·키즈카페·가족 촬영·아동복지기관·공공기관과의 BABYLOG 협력 모델, 파일럿 제안, 데이터 연계 원칙과 협력 절차를 안내합니다.",
    },
    contact: {
      title: "문의 | BABYLOG — 목적에 맞는 연결 경로",
      desc: "서비스·기능 문의부터 기업 제휴, 기관·공공 협력, 기술·API, 언론·미디어, 투자 문의까지 목적별 연결 경로와 26개 문의 분야를 안내합니다.",
    },
  },

  /* ---------------------------------------------------------------- shared: status board */
  status: {
    columns: [
      {
        id: "now", name: "지금 앱에서 제공",
        basis: "App Store·Google Play에 공개된 BabyLog 앱 소개 기준입니다.",
        items: ["아이 프로필", "임신 주차·검진 일정", "수유·수면·기저귀·식사·놀이 기록", "키·몸무게·예방접종·건강 기록", "성장 통계", "병원·교육·가족 일정", "가족 공유(부모·조부모·보호자)", "참고용 AI 기록 요약", "Premium 구독(앱 내 결제)"],
      },
      {
        id: "next", name: "다음 버전 준비 중",
        basis: "다음 앱 버전의 설계 범위입니다. 출시 일정은 정해지지 않았습니다.",
        items: ["부모 커뮤니티", "탐색: 기관·서비스 정보와 예약", "마켓: 육아용품 쇼핑·중고·공동구매", "판매자·업체 입점 절차", "역할별 세부 권한"],
      },
      {
        id: "plan", name: "향후 계획",
        basis: "통합 사업계획서의 로드맵 순서에 따라 진행합니다.",
        items: ["학교·학습·진로", "Family Trust 검증 후기", "청소년 계정·성인 전환", "아동 안전·공식 신고 안내", "Books·Learning 콘텐츠", "교육·육아기관 SaaS", "가정위탁·입양·자립 공식 정보"],
      },
      {
        id: "review", name: "검토 단계",
        basis: "사업성·법률·안전 검토가 먼저 필요한 영역입니다.",
        items: ["Toy Club 장난감 대여·구독", "Family Box 정기배송", "스마트 육아 기기", "AI 기능 확장", "후원·봉사 연결", "아동복지기관 SaaS·CSR", "글로벌 확장"],
      },
    ],
    note: "‘다음 버전 준비 중’, ‘향후 계획’, ‘검토 단계’의 기능은 출시된 기능이 아니며 범위와 일정이 바뀔 수 있습니다.",
    more: "기능별 상태 자세히 보기",
  },

  /* ---------------------------------------------------------------- Overview */
  overview: {
    vision: {
      kicker: "02 · About BABYLOG",
      title: "한 아이의 20년,\n한 가족의 기록.",
      lines: [
        "BABYLOG는 임신부터 고등학교 졸업까지 아이의 성장, 건강, 교육, 가족 생활과 추억을 하나로 잇는 NEWON의 가족 종합 플랫폼입니다. 영유아기의 기록에서 멈추지 않고, 아이가 자라는 동안 가족에게 필요한 기록·정보·서비스를 단계별로 연결하는 것을 목표로 합니다.",
        "지금은 iOS와 Android 앱에서 수유·수면·기저귀·식사 같은 육아 기록, 키·몸무게와 예방접종 같은 성장·건강 기록, 병원·교육 일정, 부모·조부모·보호자와의 가족 공유, 참고용 AI 기록 요약을 제공합니다.",
        "통합 사업계획서는 교육, 커뮤니티, 예약, 쇼핑·중고·공동구매, 도서, 기관 서비스까지 26개 장기 사업 영역을 설계합니다. 이 영역들은 단계적으로 검증하며 열어 갈 계획이며, 아직 모두 제공되는 것은 아닙니다.",
        "실종 아동 찾기, 아동 보호, 가정위탁·입양 정보 같은 공익 영역은 상업 서비스와 분리하고 공식 기관 연계를 중심으로 준비합니다.",
      ],
    },
    problem: {
      kicker: "Problem → Solution",
      title: "흩어진 육아의 기록을,\n한 가족의 타임라인으로.",
      lead: "가족이 실제로 겪는 문제와 BABYLOG가 제안하는 해결 방식입니다.",
      items: [
        { name: "기록이 앱·메신저·종이 메모에 흩어집니다", lead: "수유·수면·성장·예방접종 기록을 아이별 프로필 하나에 모읍니다. 지금 앱에서 제공하는 핵심 기능입니다." },
        { name: "돌보는 사람은 여럿인데 같은 정보를 보기 어렵습니다", lead: "부모·조부모·보호자가 같은 기록과 일정을 함께 확인합니다. 누가 무엇을 볼지는 가족이 정하는 것을 원칙으로 합니다." },
        { name: "영유아기가 지나면 쓸 수 있는 도구가 끊깁니다", lead: "학교 일정·학습·진로까지 사용 기간을 넓히고, 성인이 되면 본인 계정으로 기록을 넘겨받는 구조를 계획합니다." },
        { name: "육아 상품·서비스·기관을 믿고 고르기 어렵습니다", lead: "실제 이용을 확인한 후기, 광고와 일반 정보의 구분, 공식 출처 우선 원칙으로 탐색·예약·마켓 영역을 준비합니다." },
        { name: "보호와 지원이 필요한 아이가 공식 정보에 닿기 어렵습니다", lead: "실종 신고 경로, 위탁·입양, 자립 지원 정보를 무료로 안내하고 공식 기관으로 연결하는 공익 영역을 따로 준비합니다." },
      ],
    },
    who: {
      kicker: "Who It's For",
      title: "BABYLOG를 쓰는 사람들,\n그리고 쓰는 순간.",
      lead: "초기 핵심 고객은 0~2세 자녀를 함께 키우는 가족입니다. 기관과 기업은 별도의 비즈니스·협력 고객으로 만납니다.",
      customers: [
        { name: "임신부·영유아 부모", lead: "임신 주차와 검진 일정, 신생아의 수유·수면·기저귀를 매일 기록하는 BABYLOG의 중심 이용자입니다." },
        { name: "조부모·돌봄 가족", lead: "맞벌이 가정에서 낮 동안 아이를 돌보는 조부모와 가족입니다. 같은 기록을 보고 이어서 남깁니다." },
        { name: "학령기 자녀와 청소년", lead: "학교 일정과 학습, 진로로 넓어지는 단계입니다. 청소년의 독립 권한과 사생활을 보호하는 구조로 계획합니다." },
        { name: "기관·기업·공공", lead: "어린이집·유치원·학원, 육아 브랜드, 임직원 가족복지 기업, 아동복지기관과 공공기관은 비즈니스·협력 고객입니다." },
      ],
      momentsTitle: "대표적인 이용 상황",
      moments: [
        { name: "새벽 수유를 기록하고 아침에 교대", body: "밤에 남긴 수유·기저귀 기록을 아침에 배우자가 확인하고 이어서 기록합니다. 지금 앱에서 할 수 있습니다." },
        { name: "예방접종·검진 일정 챙기기", body: "병원 방문과 예방접종 일정을 등록하고 가족이 함께 확인합니다. 지금 앱에서 할 수 있습니다." },
        { name: "조부모와 하루 기록 나누기", body: "복직 후 낮 동안 아이를 돌보는 조부모가 기록을 남기고, 퇴근 후 부모가 하루를 한눈에 봅니다." },
        { name: "입학 준비와 학교 일정", body: "초등학교 입학 후 시간표·준비물·학사 일정을 가족이 함께 관리하는 장면은 앞으로 열어 갈 영역입니다." },
      ],
    },
    journey: {
      kicker: "04 · The Family Journey",
      title: "임신부터 고등학교 졸업,\n그리고 성인 전환까지.",
      lead: "아이의 성장 단계마다 가족에게 필요한 것은 달라집니다. 지금 앱은 임신과 영유아기 기록을 중심으로 제공하며, 학령기 이후 단계는 계획에 따라 넓혀 갑니다.",
      items: [
        { id: "s1", n: "01", age: "임신", name: "임신 준비부터 출산 준비까지", lead: "앱에서 임신 주차별 변화와 검진 일정을 관리합니다. 임신 준비 정보와 지원 제도 안내는 확장해 나갈 영역입니다.", topics: ["임신 주차 정보", "검진 일정", "출산 준비물", "지원 제도 안내"] },
        { id: "s2", n: "02", age: "출산·신생아", name: "아이를 맞이하는 첫 몇 달", lead: "앱에서 수유·수면·기저귀와 예방접종을 기록하고 가족과 나눕니다. 산후 회복 정보는 확장 영역입니다.", topics: ["수유·수면·기저귀", "예방접종", "가족 공유", "산후 생활"] },
        { id: "s3", n: "03", age: "영아·유아", name: "성장·발달·놀이, 그리고 어린이집", lead: "키·몸무게와 이유식 기록, 성장 통계를 앱에서 확인합니다. 놀이·발달 정보와 어린이집 연결은 다음 단계 영역입니다.", topics: ["성장 그래프", "이유식", "발달 기록", "어린이집"] },
        { id: "s4", n: "04", age: "초등학생", name: "학교생활이 시작되는 시기", lead: "시간표·학사 일정·과제·준비물, 방과 후 프로그램과 생활 안전 정보를 가족이 함께 관리하는 단계로 계획합니다.", topics: ["학교 일정", "준비물", "방과 후", "생활 안전"] },
        { id: "s5", n: "05", age: "중·고등학생", name: "학습·진로·진학을 준비하는 시기", lead: "공부 계획과 진로·진학 정보, 졸업 준비로 이어지는 단계입니다. 청소년이 스스로 관리하는 범위를 넓히는 권한 구조로 계획합니다.", topics: ["학습 계획", "진로 탐색", "진학·자격증", "청소년 계정"] },
        { id: "s6", n: "06", age: "성인 전환", name: "기록을 본인에게 돌려주는 순간", lead: "성인이 된 자녀가 본인 계정으로 기록을 넘겨받아 관리하는 구조를 계획합니다. 이후의 생활은 LIVON과 연결하는 방향을 검토합니다.", topics: ["본인 계정", "기록 통제", "LIVON 연계"] },
      ],
    },
    diff: {
      kicker: "How It's Different",
      title: "기존 대안과\n무엇이 다른가.",
      lead: "공개된 서비스 유형과 비교한 BABYLOG의 차별화 가설입니다. 아직 갖추지 않은 기능을 이미 확보한 강점으로 주장하지 않습니다.",
      items: [
        { name: "영유아 기록 앱 → 고등학교 졸업까지", lead: "많은 기록 앱이 영유아 시기에 집중합니다. BABYLOG는 같은 가족 계정으로 학령기·청소년기까지 이어지는 구조를 지향합니다." },
        { name: "커뮤니티 게시판 → 기록과 연결된 정보", lead: "흩어진 게시글 대신 아이의 단계와 일정에 맞는 정보와 커뮤니티를 아동 사진·개인정보 보호 정책과 함께 준비합니다." },
        { name: "기관 알림장 → 가족 중심의 권한", lead: "기관이 보내는 알림을 받기만 하는 구조가 아니라, 가족이 기록의 주인이 되고 공유 범위를 정합니다." },
        { name: "사진첩·포토북 → 성장 데이터와 추억", lead: "사진만이 아니라 성장 기록과 기념일을 함께 남기고, 기록의 내보내기·삭제 권리를 제한하지 않는 것을 원칙으로 합니다." },
        { name: "일반 커머스 → 공익 영역의 분리", lead: "아동 보호·위탁·입양·실종 관련 정보는 무료로 안내하며 상업 거래와 섞지 않습니다." },
      ],
    },
    now: {
      kicker: "Service Status",
      title: "지금 제공하는 것과\n앞으로 열어 갈 것.",
      lead: "현재 상태를 네 단계로 나누었습니다. 앱 기능은 iOS·Android 앱에서 이용하며, 기능별 설명은 플랫폼 페이지에서 확인할 수 있습니다.",
    },
  },

  /* ---------------------------------------------------------------- Platform */
  platform: {
    areas: {
      kicker: "26 Long-term Areas",
      title: "스물여섯 개 장기 사업 영역,\n다섯 개 그룹.",
      lead: "통합 사업계획서가 설계한 BABYLOG의 전체 확장 영역입니다. 영역 수는 장기 기획 단위이며 모두 구현되었다는 뜻이 아닙니다. 공통 계정·기록·거래 시스템을 함께 쓰므로 영역마다 별도의 앱이나 서버를 만들지 않습니다. 지금 앱에서 이용하는 기능은 현재형으로, 그 밖의 영역은 계획으로 적었습니다.",
      groups: [
        {
          id: "s-a", name: "A · Family & Growth · 가족·성장 코어", items: [
            { n: "01", en: "BABYLOG Family", name: "가족 계정·권한", lead: "부모·조부모·보호자를 한 가족으로 연결하고 아이별 프로필, 공동 일정, 가족 알림을 관리합니다. 가족 공유는 지금 앱에서 제공하며, 역할별 세부 권한과 청소년 계정·성인 전환은 단계적으로 설계합니다." },
            { n: "02", en: "BABYLOG Pregnancy", name: "임신·출산·산후", lead: "임신 주차별 기록과 검진 일정은 앱에서 관리합니다. 임신 준비, 출산 준비물, 산후 회복, 정부 지원 제도 안내로 넓혀 가며, 생애 이벤트 전반의 제도 안내는 LIVON과 역할을 나눕니다." },
            { n: "03", en: "BABYLOG Growth", name: "성장·발달·건강 기록", lead: "키·몸무게 성장 그래프, 수유·수면·기저귀·이유식, 예방접종과 진료 일정·건강 메모를 앱에서 기록합니다. 발달 평가나 의료적 판단은 하지 않으며 전문 의료진을 대신하지 않습니다." },
            { n: "04", en: "BABYLOG Education", name: "학교·학습·진로", lead: "시간표·학사 일정·과제·준비물, 공부 계획, 진로·진학 정보, 방과 후 프로그램을 가족이 함께 관리하는 영역으로 계획합니다. 학교·기관 정보 연동은 출처와 사용 권한, 학생 정보 보호를 확인한 뒤 진행합니다." },
            { n: "05", en: "BABYLOG Memories", name: "사진·영상·성장 앨범", lead: "첫걸음·첫말·입학·졸업 같은 순간을 가족 앨범과 성장 타임라인으로 남기는 영역입니다. 유료 기능이 생기더라도 기록의 기본 접근, 내보내기와 삭제는 부당하게 제한하지 않습니다." },
          ],
        },
        {
          id: "s-b", name: "B · Trust & Community · 신뢰·커뮤니티", items: [
            { n: "06", en: "BABYLOG Family Trust", name: "어린이집·유치원·학원·돌봄 후기", lead: "기관 등록 여부, 확인 가능한 자격, 실제 이용을 확인한 후기, 비용 공개, 최근 확인일을 기준으로 비교하는 신뢰 서비스로 계획합니다. 유료 광고와 일반 후기를 구분하고, 후기에 아이의 신원·건강·학교생활 정보가 드러나지 않도록 제한합니다." },
            { n: "07", en: "BABYLOG Community", name: "부모·가족 커뮤니티", lead: "비슷한 성장 단계의 가족이 경험과 질문을 나누는 공간입니다. 아동 사진·개인정보 보호, 잘못된 건강 정보와 광고성 게시물에 대한 운영 정책을 먼저 갖춥니다." },
          ],
        },
        {
          id: "s-c", name: "C · Market & Subscriptions · 거래·구독", items: [
            { n: "08", en: "BABYLOG Market", name: "쇼핑·중고·공동구매", lead: "기저귀·분유·의류 같은 육아용품 쇼핑, 성장 단계별 중고 거래, 공동구매를 BABYLOG 안에서 탐색·거래하는 마켓입니다. 판매자 확인 후 판매를 열고, 결제·정산은 NEWON 공통 거래 인프라 활용을 계획합니다. 육아용품 대여는 SHAREON의 영역입니다." },
            { n: "09", en: "BABYLOG Booking", name: "생활·체험 서비스 예약", lead: "클래스·체험, 가족 촬영, 키즈 공간 같은 적법한 생활 서비스 예약을 앱의 탐색 영역 안에서 제공하는 구조로 계획합니다. 의료기관은 정보·일정·공식 예약 경로 안내만 하며 진료비에 비례한 수수료를 두지 않습니다." },
            { n: "10", en: "BABYLOG Books", name: "도서·전자책·오디오북", lead: "그림책·동화책·학습 도서를 성장 단계에 맞게 추천하고, 출판사 제휴와 정기 도서 배송을 검토합니다. 전자책·오디오북은 저작권과 앱스토어 디지털 결제 정책을 먼저 확인합니다." },
            { n: "11", en: "BABYLOG Toy Club", name: "장난감 대여·정기구독", lead: "성장 단계에 맞는 장난감을 정기적으로 받고 반납하는 구독 구상입니다. 초기에는 검증된 렌털 업체와의 제휴로 위생·안전·파손·회수 기준을 검증합니다." },
            { n: "12", en: "BABYLOG Learning", name: "교육 콘텐츠·학습 서비스", lead: "연령별 놀이·학습 자료와 교육 콘텐츠를 연결하는 영역입니다. 콘텐츠 제공자의 저작권과 이용 범위, 연령 적합성을 확인합니다." },
            { n: "13", en: "BABYLOG Family Box", name: "육아·성장 물품 정기배송", lead: "임신·신생아·유아·학교 준비 단계별 물품 정기배송 구상입니다. 가족 선물과 기업 출산 축하 선물로도 검토하며, 원가·배송·반품·재고 검증이 먼저입니다." },
          ],
        },
        {
          id: "s-d", name: "D · Technology & Business · 기술·사업", items: [
            { n: "14", en: "BABYLOG Devices", name: "스마트 육아 기기", lead: "아기 모니터, 아동용 태블릿, 실내 환경 센서, 동화 스피커와의 연동을 검토합니다. 카메라·위치·음성 정보는 동의, 접근 권한, 암호화, 보관 기간, KC 인증 같은 기준을 먼저 확인합니다." },
            { n: "15", en: "BABYLOG AI", name: "육아·학습·가족 AI", lead: "지금 앱에서는 기록을 참고용으로 요약해 보여 줍니다. 일정·준비물 정리, 도서·놀이 제안, 공식 지원 제도 탐색으로 넓혀 가되 의료 진단, 발달 장애 판정, 얼굴 자동 식별, 위탁·입양 아동 선정은 하지 않습니다." },
            { n: "16", en: "BABYLOG Safety", name: "가정 안전·긴급 지원", lead: "일반 가정을 위한 생활 안전 체크리스트, 보호자 긴급 연락처, 112·119 같은 공식 신고 경로 안내를 준비합니다. 긴급 기능은 복잡한 메뉴에 숨기지 않는 것을 원칙으로 합니다." },
            { n: "17", en: "BABYLOG Business", name: "교육·육아기관 SaaS", lead: "어린이집·유치원·학원이 공지·일정·보호자 소통·운영을 관리하는 표준 기관 도구입니다. 고객별 외주 개발이 아닌 공통 제품으로 만들며, 아동·보호자 정보 접근 권한을 먼저 설계합니다." },
            { n: "18", en: "BABYLOG Partnerships", name: "기업·기관·공공 제휴", lead: "기업 가족복지, 브랜드 캠페인, 공공기관 협력을 표준화된 방식으로 운영하는 영역입니다. 계약이 확인된 곳만 파트너로 공개합니다." },
          ],
        },
        {
          id: "s-e", name: "E · Child Protection & Welfare · 아동 보호·복지(공익)", items: [
            { n: "19", en: "BABYLOG Find", name: "실종 아동 공식 신고 연계", lead: "실종 예방 정보, 112와 공식 실종아동 기관으로 이어지는 신고 경로, 확인된 공공기관 공지 연결을 무료로 안내하는 영역입니다. 검증되지 않은 사진·신상·위치 게시나 AI 얼굴 매칭은 도입하지 않습니다." },
            { n: "20", en: "BABYLOG Safety Network", name: "실종 예방·안전 교육", lead: "연령별 안전 교육, 보호자 연락망, 동의 기반의 귀가·외출 확인, 공식 보호기관 안내를 다룹니다. 위치 기능은 상시 감시가 아닌 안전 목적의 최소 범위로 제한합니다." },
            { n: "21", en: "BABYLOG Child Care", name: "아동복지시설·보호기관 연계", lead: "아동양육시설, 공동생활가정, 지역아동센터 등 공식 기관 정보와 검증된 기관의 필요 물품·봉사·프로그램을 연결합니다. 보호 아동의 얼굴·실명·거주 정보·사례 기록은 공개하지 않습니다." },
            { n: "22", en: "BABYLOG Foster", name: "가정위탁 정보·지원", lead: "공식 가정위탁 제도, 신청 자격, 절차, 교육과 담당 기관을 안내합니다. 아동과 위탁가정을 개인 간에 직접 연결하지 않으며, 위탁 결정은 법적 권한이 있는 기관의 절차로 이루어집니다." },
            { n: "23", en: "BABYLOG Adoption Support", name: "공식 입양 절차·정보", lead: "공식 입양 절차, 상담 기관, 자격·서류, 교육, 입양 후 지원 정보를 안내합니다. 아동 프로필 공개, 아동 검색·선택, 직접 매칭, 입양 성사 수수료는 운영하지 않습니다." },
            { n: "24", en: "BABYLOG Hope", name: "후원·기부·봉사 연결", lead: "공식 기관의 필요 물품과 검증된 봉사 프로그램을 연결합니다. 법적 요건과 계약을 갖추기 전까지 BABYLOG가 기부금을 직접 모금·보관하지 않고 공식 채널로 안내합니다." },
            { n: "25", en: "BABYLOG Independence", name: "자립준비청년 지원", lead: "주거·장학금·취업·금융 교육·공식 상담기관·검증된 멘토링 정보를 연결하고, 성인 생활 관리는 LIVON과 이어지도록 합니다. 보호 이력은 커뮤니티나 광고 타기팅에 쓰지 않습니다." },
            { n: "26", en: "BABYLOG Welfare Business", name: "아동복지기관 SaaS·CSR", lead: "아동복지기관의 일정·프로그램·물품 수요·봉사·후원 관리와 기관 보고를 돕는 도구, 기업 사회공헌 연결을 검토합니다. 실종 신고·보호·위탁·입양 안내 자체는 계속 무료로 유지합니다." },
          ],
        },
      ],
    },
    flow: {
      kicker: "How It Connects",
      title: "한 번의 기록이\n가족 전체로 이어집니다.",
      lead: "영역은 따로 떨어진 기능이 아니라 하나의 아이 프로필과 가족 계정을 중심으로 연결됩니다.",
      items: [
        { n: "01", name: "아이 프로필·가족 계정", body: "모든 기록과 권한의 출발점입니다. 아이별로 성장 단계와 기본 정보를 관리합니다." },
        { n: "02", name: "매일의 기록", body: "수유·수면·기저귀·식사와 성장·건강 기록이 하나의 타임라인에 쌓입니다." },
        { n: "03", name: "요약·통계·일정", body: "기록이 성장 그래프, 참고용 AI 요약, 병원·교육 일정 알림으로 정리됩니다." },
        { n: "04", name: "가족 공유", body: "허용된 범위 안에서 부모·조부모·보호자가 같은 정보를 보고 이어서 기록합니다." },
        { n: "05", name: "탐색·마켓", body: "단계에 맞는 기관·서비스·상품 정보로 이어지는 단계입니다. 다음 버전에서 준비 중이며, 아동 데이터 기반 개인화 광고는 하지 않습니다." },
      ],
      note: "다른 NEWON 앱(LIVON·SHAREON·PETLOG·ONGIL·MY WORLD)과 아동·건강·가족 데이터는 명시적 동의와 적법한 권한 없이 자동으로 공유하지 않습니다.",
    },
    roles: {
      kicker: "Roles & Permissions",
      title: "부모, 조부모, 보호자, 청소년.\n볼 수 있는 범위가 다릅니다.",
      lead: "가족 공유는 지금 앱에서 제공합니다. 아래 역할별 권한은 BABYLOG가 설계 원칙으로 삼는 방향이며, 세부 기능은 개발 단계에서 확정합니다.",
      items: [
        { name: "부모·법정대리인", lead: "아이 프로필을 만들고 기록 전체를 관리합니다. 가족 초대, 공유 범위, 내보내기와 삭제를 결정하는 주 관리자이며, 만 14세 미만 아동의 정보는 법정대리인 동의를 기준으로 다룹니다." },
        { name: "조부모·가족 구성원", lead: "초대받은 범위에서 기록과 일정을 보고 이어서 남깁니다. 함께 돌보는 데 필요한 정보 중심으로 공유하는 것을 원칙으로 합니다." },
        { name: "보호자·돌봄 제공자", lead: "아이를 맡아 돌보는 동안 필요한 일정과 기록만 보는 제한된 권한을 계획합니다. 가족 연결은 관계나 적법한 권한 확인이 필요한 상황을 고려해 설계합니다." },
        { name: "청소년 본인", lead: "연령에 맞게 스스로 관리하는 범위를 넓히고, 사생활이 필요한 기록은 부모에게 자동으로 공개되지 않는 구조를 계획합니다. 성인이 되면 본인 계정으로 기록을 넘겨받습니다." },
      ],
      note: "성인이 된 자녀의 기록이 부모에게 계속 자동으로 공개되는 구조는 두지 않습니다.",
    },
    scenarios: {
      kicker: "User Scenarios",
      title: "가족의 하루에서\nBABYLOG가 쓰이는 장면.",
      lead: "지금 앱에서 가능한 장면과 앞으로 열어 갈 장면을 함께 적었습니다.",
      items: [
        { name: "출산 후 첫 달, 교대로 돌보는 부부", lead: "밤에 남긴 수유·기저귀 기록을 아침에 배우자가 확인하고 이어서 기록합니다. 하루 요약과 성장 통계로 수면 패턴을 살핍니다. 지금 앱에서 가능한 장면입니다." },
        { name: "복직 후 조부모와 함께하는 공동 육아", lead: "낮 동안 아이를 돌보는 조부모가 같은 기록과 일정을 보고 남기고, 예방접종·병원 일정을 가족이 함께 챙깁니다. 지금 앱의 가족 공유로 가능합니다." },
        { name: "돌 사진 촬영과 주말 클래스 찾기", lead: "앱의 탐색 영역에서 가족 촬영이나 키즈 클래스를 찾아 예약하는 장면입니다. 다음 버전에서 준비 중인 기능이며 웹사이트에서는 예약을 받지 않습니다." },
        { name: "초등학교 입학 준비", lead: "시간표·준비물·학사 일정을 가족이 함께 관리하고 방과 후 프로그램을 알아보는 장면은 향후 계획입니다." },
        { name: "고등학교 졸업과 본인 계정", lead: "진학·진로 준비를 마친 자녀가 성인이 되어 자신의 기록을 본인 계정으로 넘겨받는 장면은 장기 계획입니다." },
      ],
    },
    roadmap: {
      kicker: "Now & Next",
      title: "현재 제공 기능과\n개발 계획.",
      lead: "기능의 상태를 네 단계로 나누어 표시합니다. 각 기능의 자세한 설명은 위의 영역 소개에서 확인할 수 있습니다.",
    },
    trustExtra: [
      { name: "AI의 역할 제한", lead: "AI는 기록 요약과 일반 정보 안내에 한정하며 진단, 발달 판정, 얼굴 식별, 위탁·입양 대상 선정을 하지 않습니다.", status: "released" },
      { name: "위치 기능의 최소화", lead: "위치 관련 기능은 상시 감시가 아닌 안전 목적의 최소 범위로, 보호자 권한과 아동의 권리를 함께 고려해 설계합니다.", status: "plan" },
    ],
    faq: {
      kicker: "FAQ",
      title: "자주 묻는 질문.",
      items: [
        { q: "웹사이트에서 육아 기록을 할 수 있나요?", a: "아니요. 기록과 계정 관리는 BABYLOG 앱(iOS·Android)에서 이용합니다. 웹사이트는 서비스 소개와 문의 연결만 제공합니다." },
        { q: "가족과 어떻게 함께 쓰나요?", a: "앱에서 부모·조부모·보호자를 초대해 같은 아이의 기록과 일정을 함께 볼 수 있습니다. 역할별 세부 권한은 위의 권한 원칙에 따라 단계적으로 설계하고 있습니다." },
        { q: "AI가 아이의 건강이나 발달 상태를 판단하나요?", a: "아니요. AI는 기록을 참고용으로 요약해 보여 줄 뿐 진단, 발달 판정, 처방을 하지 않습니다. 건강이 걱정되면 의료기관에 문의해 주세요." },
        { q: "커뮤니티·예약·마켓은 언제 이용할 수 있나요?", a: "다음 앱 버전에서 준비 중인 기능이며 출시 일정은 정해지지 않았습니다. 출시되면 앱과 이 웹사이트에서 안내합니다." },
        { q: "유료 구독이 있나요?", a: "앱에서 Premium 구독을 제공합니다. 가격과 조건은 App Store·Google Play의 앱 화면 표시를 기준으로 합니다. 가족 구독 같은 다른 상품은 제안 단계이며 아직 판매하지 않습니다." },
        { q: "계정을 삭제하면 기록은 어떻게 되나요?", a: "계정 삭제 방법과 처리 범위는 계정 삭제 안내 페이지에서 확인할 수 있습니다.", link: "delete" },
        { q: "실종이나 아동학대를 BABYLOG에 신고할 수 있나요?", a: "아니요. 긴급할 때는 112 등 공식 신고 경로를 먼저 이용해 주세요. BABYLOG는 신고를 접수하거나 아이의 위치·신원을 확인하지 않습니다." },
        { q: "다른 NEWON 앱과 아이의 정보가 공유되나요?", a: "명시적 동의와 적법한 권한 없이 자동으로 공유하지 않습니다." },
      ],
      deleteLink: "계정 삭제 안내 보기",
    },
  },

  /* ---------------------------------------------------------------- Business */
  business: {
    payers: {
      kicker: "Customers & Payers",
      title: "누가 쓰고,\n누가 지불하는가.",
      lead: "BABYLOG의 사업 구조를 이용자와 지불 주체로 나누었습니다. 현재 판매 중인 상품은 개인 Premium 구독 하나이며, 나머지는 제안 또는 검토 단계입니다.",
      fields: { users: "이용자", payer: "지불 주체·방식" },
      stages: [
        { id: "now", name: "지금 판매 중" },
        { id: "proposal", name: "제안 단계" },
        { id: "review", name: "검토 단계" },
      ],
      items: [
        { stage: "now", code: "B2C", name: "개인 구독", users: "임신부·영유아 부모", payer: "부모 개인. 앱 내 결제로 Premium을 구독하며, 가격은 App Store·Google Play 표시를 기준으로 합니다." },
        { stage: "proposal", code: "B2C+", name: "가족 구독", users: "조부모·돌보미를 포함한 가족", payer: "가족 대표자. 여러 가족 구성원이 함께 쓰는 가족 단위 구독을 제안합니다." },
        { stage: "proposal", code: "C2C", name: "중고·공동구매", users: "육아용품을 사고파는 가족", payer: "직거래에는 수수료를 두지 않고, 안전결제를 선택한 거래에만 수수료를 두는 방안을 검토합니다. 안전결제 원가 검증이 먼저입니다." },
        { stage: "proposal", code: "B2B", name: "입점·예약 업체", users: "육아 클래스·키즈카페·가족 촬영·육아 브랜드", payer: "입점 업체. 기업 구독과 이용 완료 기준의 예약·판매 수수료를 제안합니다." },
        { stage: "proposal", code: "B2B2C", name: "교육·보육기관", users: "어린이집·유치원·학원과 그 보호자", payer: "기관. 기관용 도구의 월 구독을 제안하며, 기관 인터뷰와 파일럿으로 먼저 검증합니다." },
        { stage: "review", code: "B2G·CSR", name: "공공·복지·기업 사회공헌", users: "지자체·공공기관·아동복지기관·기업", payer: "공공 계약, 복지기관용 도구, 기업 사회공헌 계약을 검토합니다. 실종·보호·위탁·입양 안내 자체는 무료입니다." },
      ],
    },
    revenue: {
      kicker: "12 Revenue Models",
      title: "열두 개의 수익 모델,\n운영 단계별로.",
      lead: "통합 사업계획서의 12개 수익 모델을 구독·거래·기관 세 갈래로 묶고, 현재 운영 여부에 따라 나누었습니다. 요금과 수수료율은 확정 전 제안이므로 이 페이지에 표시하지 않습니다.",
      kinds: [
        { name: "구독", lead: "개인·가족 구독, AI 기능, Books·Learning 같은 디지털 구독입니다. 디지털 기능은 앱스토어의 앱 내 결제를 따릅니다." },
        { name: "거래·예약·중개", lead: "쇼핑·중고·공동구매와 비의료 생활 서비스 예약 수수료입니다. 수수료는 이용 완료·구매 확정 시점을 기준으로 하고, 대금은 NEWON이 보관하지 않고 결제대행·지급대행을 통해 처리하는 구조를 계획합니다." },
        { name: "기업·기관 서비스", lead: "교육·돌봄·복지기관 SaaS, 기업 가족복지, 브랜드 캠페인, 공공·사회공헌 계약입니다. 고객별 외주가 아닌 표준 제품과 계약 방식으로 운영합니다." },
      ],
      columns: [
        { id: "now", name: "지금 운영 중", basis: "스토어에 구독 상품이 공개되어 있습니다. 유료 이용 실적은 측정 중이며 공개하지 않습니다.", items: ["개인 Premium 구독"] },
        { id: "next", name: "다음 단계 제안", basis: "다음 앱 버전의 기능 출시와 법률·결제 검토 후 검증합니다.", items: ["가족 구독", "AI 구독·리포트", "쇼핑 수수료", "중고 안전거래 수수료", "공동구매 수수료", "생활 서비스 예약 수수료"] },
        { id: "plan", name: "장기 계획", basis: "기관 인터뷰·파일럿과 원가 검증 이후의 단계입니다.", items: ["기관 SaaS", "기업·공공 제휴", "Books", "Toy Club", "Family Box", "Devices"] },
        { id: "free", name: "수익화하지 않는 영역", basis: "공익 안내는 무료로 유지하고, 진료비에 비례한 수수료는 두지 않습니다.", items: ["실종 신고·안전 안내", "가정위탁·입양 정보", "아동복지시설 정보", "기부·봉사 안내", "자립준비청년 지원 정보", "병원 진료비 비례 수수료"] },
      ],
      note: "광고는 향후 별도 수익원으로 검토할 수 있지만 아동 데이터를 기반으로 한 개인화 광고는 하지 않습니다. 기부금은 BABYLOG의 수익이 아닙니다.",
    },
    market: {
      kicker: "Market & Opportunity",
      title: "출생 반등기,\n가족 단위 도구의 빈자리.",
      lead: "공개 통계와 시장 구조에서 본 사업 기회와 위험입니다. 금액 기준 시장 규모는 추정하지 않았습니다.",
      items: [
        { name: "출생아 수가 다시 늘고 있습니다", lead: "통계청 2025년 출생 통계(잠정)에서 출생아는 약 25만 명으로 전년보다 늘었습니다. 가족 단위의 기록과 지출 수요가 다시 커지는 시기입니다." },
        { name: "도구가 단계마다 끊깁니다", lead: "기록 앱, 커뮤니티, 기관 알림장, 포토북, 쇼핑몰이 따로 있어 가족이 같은 정보를 여러 곳에 옮겨 적습니다." },
        { name: "신뢰가 선택의 기준입니다", lead: "어린이집·학원·돌봄·육아용품은 실제 이용 확인과 공식 등록 정보가 중요합니다. 검증된 후기와 공식 정보 연결이 기회입니다." },
        { name: "진입 장벽도 분명합니다", lead: "이미 다른 기록 앱을 쓰는 가족에게는 기록을 옮기는 부담이 있고, 아동 개인정보·법정대리인 동의, 영유아 상품 KC 인증 같은 규제를 먼저 갖춰야 합니다." },
      ],
      diffTitle: "차별화 가설",
      diff: [
        { name: "생애 전 주기의 깊이", lead: "영유아 기록에서 고등학교 졸업까지 이어지는 같은 가족 계정." },
        { name: "기록과 서비스의 연결", lead: "쌓인 기록과 성장 단계에 맞춘 정보·예약·마켓 연결(계획)." },
        { name: "공익 안전망의 분리 운영", lead: "아동 보호·복지 영역을 무료 공식 연계로 운영해 신뢰를 쌓는 구조." },
      ],
      diffNote: "경쟁 비교는 공개된 서비스 유형을 기준으로 한 가설이며, 아직 구축하지 않은 기능을 확보한 강점으로 주장하지 않습니다.",
    },
    entry: {
      kicker: "Go-to-Market",
      title: "무료 기록 습관에서\n기관 협력까지, 네 단계.",
      lead: "초기 핵심 고객은 0~2세 자녀를 함께 키우는 가족입니다. 아래 순서는 계획이며, 각 단계는 앞 단계의 실측 결과를 확인한 뒤 진행합니다.",
      items: [
        { n: "01", name: "무료 기록 습관", body: "산후조리원·육아 커뮤니티 제휴와 가족 초대로 매일 쓰는 기록 습관을 만듭니다. 이용 지속과 가족 초대 수락을 먼저 측정합니다." },
        { n: "02", name: "구독 전환", body: "Premium 구독의 체험 기간과 가족 단위 상품을 실험해 유료 전환을 검증합니다." },
        { n: "03", name: "거래·예약 파일럿", body: "키즈 클래스·가족 촬영 같은 지역 예약 파일럿과 마켓 거래를 법률·결제 준비가 끝난 뒤 작게 시작합니다." },
        { n: "04", name: "기관·기업 협력", body: "어린이집·유치원 인터뷰와 기관 기능 시제품, 파일럿 협의를 거쳐 기관용 상품을 제안합니다." },
      ],
    },
    phases: {
      kicker: "Business Roadmap",
      title: "다섯 개의 우선순위로\n단계적으로 확장합니다.",
      lead: "사업은 26개 영역으로 넓게 설계하되, 가족이 매일 쓰는 기능을 먼저 완성하고 수요를 확인하는 순서로 확장합니다.",
      note: "로드맵은 추진 순서이며 출시일이나 매출 목표가 아닙니다. 공익 영역의 실제 기관 연계·운영은 검증된 협력과 보호 체계가 확인되는 단계에서 진행합니다.",
      items: [
        { n: "01", name: "가족 계정·성장·건강·캘린더", body: "가족이 매일 쓰는 핵심 기록 플랫폼을 완성합니다. 현재 앱이 이 단계의 기반입니다." },
        { n: "02", name: "학교·학습·진로·기관 탐색", body: "임신·영유아기를 넘어 고등학교 졸업까지 사용 기간을 넓힙니다." },
        { n: "03", name: "아동 안전·공식 신고·복지 정보", body: "무료로 이용하는 안전·보호 정보 기반을 만듭니다. 공식 정보와 긴급 연락 경로 안내를 먼저 준비합니다." },
        { n: "04", name: "마켓·예약·Books·Toy Club", body: "실제 거래와 반복 이용으로 수익 구조를 검증합니다." },
        { n: "05", name: "기관 SaaS·AI·기기·공공 협력", body: "교육·돌봄·복지기관과 공공 영역으로 넓힙니다. 위탁·입양 정보와 자립 지원은 검증된 기관 협력과 보호 체계를 갖춘 뒤 진행합니다." },
      ],
    },
    rules: {
      kicker: "Operating & Legal Principles",
      title: "사업보다 먼저\n지키는 기준.",
      lead: "아동과 가족을 다루는 사업이기에 기능을 열기 전에 아래 항목을 검토합니다. 법률 검토가 끝나지 않은 결제·거래 기능은 열지 않습니다.",
      items: [
        { name: "아동 개인정보", lead: "보호자 권한과 연령별 동의, 만 14세 미만 아동의 법정대리인 동의, 보관 기간을 기준으로 다룹니다." },
        { name: "건강·발달 정보", lead: "민감정보로 다루고, 의료적 판단처럼 보이는 표현을 쓰지 않습니다." },
        { name: "위치 정보", lead: "관련 법과 아동의 권리를 고려해 안전 목적의 최소 기능으로 제한합니다." },
        { name: "실종·보호", lead: "공식 신고와 검증된 공지만 연결하고, 보호 아동의 신원과 사례는 공개하지 않습니다." },
        { name: "가정위탁·입양", lead: "공식 절차만 안내하며 직접 매칭과 성사 수수료를 두지 않습니다." },
        { name: "기부·후원", lead: "기부금 모집에 필요한 법적 요건과 회계 체계를 갖추기 전에는 직접 모금하지 않습니다." },
        { name: "의료기관", lead: "정보·일정·공식 예약 경로 안내만 하며 환자 알선이나 진료비 비례 수수료를 두지 않습니다. 세부 구조는 법률 검토를 거칩니다." },
        { name: "중고·공동구매", lead: "소비자 보호, 결제·환불·분쟁 처리 기준과 판매자 확인을 먼저 갖춥니다." },
        { name: "상품·기기·콘텐츠", lead: "영유아 상품과 기기의 KC 인증, 장난감 대여의 위생·파손 기준, 도서·콘텐츠의 저작권과 디지털 결제 정책을 확인합니다." },
        { name: "기관 SaaS", lead: "기관별 접근 권한과 개인정보 처리 위탁 기준을 계약에 담습니다." },
      ],
    },
  },

  /* ---------------------------------------------------------------- Partnerships */
  partnerships: {
    vision: {
      kicker: "Partnership Vision",
      title: "가족이 매일 여는 앱에서,\n신뢰할 수 있는 연결을.",
      lead: "BABYLOG는 가족의 기록을 중심에 두고, 그 기록이 필요로 하는 기관·서비스·상품을 검증된 방식으로 연결하려 합니다. 지금 단계의 협력은 체결된 제휴가 아니라 함께 검증할 모델과 파일럿 제안입니다.",
      items: [
        { name: "가족에게 필요한 연결만", lead: "협력은 가족에게 실제로 도움이 되는 정보와 서비스일 때 진행합니다." },
        { name: "적격성과 공식 출처", lead: "사업자 등록, 자격, 안전 기준을 확인한 파트너와 공식 정보를 우선합니다." },
        { name: "공익과 상업의 분리", lead: "아동 보호·복지 협력은 무료 공식 연계로, 상업 협력과 구분해 진행합니다." },
      ],
    },
    pilots: {
      kicker: "PoC & Pilot Proposals",
      title: "작게 시작해\n함께 검증하는 파일럿.",
      lead: "BABYLOG가 제안하는 협업 시나리오입니다. 진행 중인 계약이 아니며, 문의를 통해 범위와 조건을 함께 정합니다.",
      fields: { who: "함께할 곳", how: "진행 방식", check: "함께 확인할 것" },
      items: [
        { code: "pilot-care", name: "산후조리원 ‘첫 기록’ 파일럿", who: "산후조리원", how: "퇴소 안내에 BABYLOG 앱 소개와 가족 초대 방법을 담아, 집으로 돌아간 가정이 기록을 바로 시작하도록 돕습니다.", check: "기록 지속 여부와 가족 초대 흐름. 산모·아동 정보는 조리원과 주고받지 않습니다." },
        { code: "pilot-booking", name: "키즈 클래스·가족 촬영·키즈카페 예약 파일럿", who: "키즈 클래스, 가족 촬영 업체, 키즈카페", how: "앱의 탐색·예약 기능이 출시된 뒤, 한 지역의 소수 업체와 예약 흐름을 시험합니다.", check: "예약 완료와 취소·환불 기준, 아이 대상 시설의 안전 기준." },
        { code: "pilot-institution", name: "어린이집·유치원·학원 기관 기능 공동 설계", who: "어린이집, 유치원, 학원", how: "기관 인터뷰로 공지·일정·보호자 소통의 불편을 듣고, 기관용 도구 시제품을 함께 검토합니다.", check: "기관 업무 부담을 줄일 수 있는지, 기관별 접근 권한과 아동 정보 보호." },
        { code: "pilot-brand", name: "육아 브랜드 공동구매·체험 캠페인", who: "육아용품 브랜드, 유아식품 브랜드", how: "마켓 출시 후 성장 단계 카테고리를 기준으로 공동구매·체험 캠페인을 진행합니다. 아동 데이터 기반 개인화 광고는 하지 않습니다.", check: "상품 안전·표시 기준, 정품·배송·반품 관리." },
        { code: "pilot-content", name: "교육 콘텐츠·도서·장난감 협업", who: "교육 콘텐츠 기업, 출판사, 장난감 렌털 업체", how: "연령별 콘텐츠·도서 추천과 장난감 대여 구독을 제휴 방식으로 먼저 시험합니다.", check: "저작권과 이용 범위, 디지털 결제 정책, 위생·파손 기준." },
        { code: "pilot-corporate", name: "임직원 출산·육아 지원 파일럿", who: "임직원 가족복지를 운영하는 기업", how: "출산·육아 중인 임직원에게 앱 Premium 이용과 육아 정보를 복지 형태로 제공하는 방안을 함께 검토합니다.", check: "이용 대상 확인 방식, 기업과 공유하지 않는 개인 기록의 범위." },
        { code: "pilot-welfare", name: "아동복지기관 운영 도구 공동 설계", who: "아동복지기관, 지자체, 공공기관", how: "필요 물품·봉사 프로그램·후원 안내를 관리하는 도구를 기관과 함께 설계합니다. 공익 안내는 무료입니다.", check: "보호 아동 정보의 비공개, 기관 예산을 고려한 별도 지원 정책." },
      ],
      cta: "이 파일럿으로 문의하기",
    },
    data: {
      kicker: "Data & API",
      title: "데이터 연계는\n동의와 최소 범위로.",
      lead: "현재 BABYLOG는 외부에 공개된 API를 제공하지 않습니다. 아래는 협력 과정에서 검토할 수 있는 연계 방식과 지키는 원칙입니다.",
      items: [
        { name: "공공·공식 정보", lead: "예방접종 일정, 지원 제도, 실종 예방 같은 공식 공개 정보를 출처와 최신 확인일과 함께 연결하는 방식." },
        { name: "기관 공지·일정", lead: "보호자가 동의한 경우에 한해 기관의 공지·일정을 가족 캘린더에 표시하는 방식." },
        { name: "상품·예약 정보", lead: "입점 업체의 상품 정보와 예약 가능 시간을 연동하는 방식. 마켓·예약 기능 출시 이후에 검토합니다." },
        { name: "기기 연동", lead: "스마트 기기의 데이터를 보호자 동의와 보안 기준 아래 기록에 연결하는 방식. 검토 단계입니다." },
      ],
      principlesTitle: "데이터 연계 원칙",
      principles: ["아동·가족 데이터를 판매하지 않습니다", "보호자 동의 없이 기록을 외부로 보내지 않습니다", "필요한 최소 정보만 주고받습니다", "다른 NEWON 앱과도 자동으로 공유하지 않습니다", "연계는 별도 계약과 보안 검토 후 진행합니다"],
    },
    joint: {
      kicker: "Joint Services & Campaigns",
      title: "함께 만드는\n콘텐츠와 캠페인.",
      lead: "협력은 판매만이 아니라 가족에게 도움이 되는 콘텐츠와 공익 캠페인으로도 가능합니다.",
      items: [
        { name: "공동 콘텐츠", lead: "육아·발달 전문가, 교육 콘텐츠 기업과 연령별 놀이·부모 교육·안전 교육 자료를 함께 만듭니다. 의료·법률 조언으로 오해되지 않도록 표현 기준을 정합니다." },
        { name: "공익 캠페인", lead: "공공기관·아동 안전교육 기관과 실종 예방·생활 안전 캠페인을 함께 기획합니다. 공익 캠페인에는 상업 광고를 섞지 않습니다." },
        { name: "공동 서비스", lead: "기관용 도구나 기업 가족복지처럼 파트너의 고객에게 BABYLOG 기능을 함께 제공하는 모델입니다. 표준 제품 방식으로 운영합니다." },
      ],
    },
    value: {
      kicker: "Value for Partners",
      title: "협력하면\n무엇을 얻을 수 있나요.",
      lead: "파트너가 기대할 수 있는 가치입니다. 이용자 규모나 성과 수치는 측정 전이므로 약속하지 않습니다.",
      items: [
        { name: "필요한 시기의 가족과 만나는 접점", lead: "임신·출산·영유아·학령기처럼 단계가 분명한 가족에게, 그 시기에 맞는 정보로 닿을 수 있습니다." },
        { name: "검증 중심의 신뢰 구조", lead: "실제 이용 확인 후기, 광고와 정보의 구분, 공식 등록 확인으로 신뢰를 쌓는 구조에 함께합니다." },
        { name: "운영 부담 감소", lead: "기관은 표준 도구로 공지·일정·보호자 소통을 정리하고, 업체는 예약·문의 흐름을 정리할 수 있습니다(기능 출시 후)." },
        { name: "공익 가치", lead: "아동 안전·복지 협력은 공식 기관 연계 안에서 사회적 가치를 만드는 방식으로 진행합니다." },
      ],
    },
  },

  /* ---------------------------------------------------------------- Contact */
  contact: {
    purpose: {
      kicker: "Inquiry Purposes",
      title: "문의 목적에 따라\n연결되는 곳이 다릅니다.",
      lead: "일곱 가지 목적 중 가까운 것을 골라 주세요. 모든 경로는 NEWON의 기존 공식 문의 양식이나 공식 이메일로 이어집니다.",
      items: [
        { name: "일반 서비스 문의", lead: "BABYLOG가 어떤 서비스인지, 어떤 가족에게 맞는지 같은 일반적인 궁금증.", to: "babylog:general", go: "문의 양식으로" },
        { name: "기능·사용 관련 문의", lead: "앱 기능, 오류, 계정, 구독 관련 문의. 기기 종류와 앱 버전을 함께 적어 주시면 확인이 빠릅니다.", to: "babylog:app", go: "문의 양식으로" },
        { name: "기업 제휴 문의", lead: "육아 브랜드 입점, 예약 업체 협력, 기업 가족복지 제안.", to: "biz:brand", go: "기업 문의 양식으로" },
        { name: "기관·공공 협력 문의", lead: "어린이집·유치원·학원, 아동복지기관, 지자체·공공기관과의 협력.", to: "biz:institution", go: "기업 문의 양식으로" },
        { name: "기술·API 협력 문의", lead: "보안·데이터 보호·기기·AI 기술 협력. 공개 API는 아직 없으며 협의를 통해 검토합니다.", to: "biz:technology", go: "기업 문의 양식으로" },
        { name: "언론·미디어 문의", lead: "취재, 인터뷰, 자료 요청. 매체명과 마감 일정을 함께 적어 주세요.", to: "mail", go: "newon@newon.app" },
        { name: "투자 관련 문의", lead: "NEWON과 BABYLOG 사업에 대한 투자 관련 문의. 공개 가능한 범위에서 안내합니다.", to: "mail", go: "newon@newon.app" },
      ],
      mailSubjectMedia: "[BABYLOG] 언론·미디어 문의",
      mailSubjectInvest: "[BABYLOG] 투자 관련 문의",
    },
    sensitive: { n: "04", name: "개인정보 입력 주의", body: "문의에는 답변에 필요한 연락처와 내용만 적어 주세요. 아이의 이름·사진·건강 정보나 주민등록번호 같은 불필요한 개인정보·민감정보는 적지 않아도 됩니다." },
  },
};

/* =========================================================================== EN */
const EN = {
  seo: {
    overview: {
      title: "BABYLOG | NEWON — Twenty years of one child, one family's record",
      desc: "BABYLOG is NEWON's family platform connecting a child's growth, health, education, family life and memories from pregnancy to high-school graduation. Today the iOS and Android app offers parenting, growth and health records, schedules and family sharing.",
    },
    platform: {
      title: "Platform | BABYLOG — 26 long-term areas and what the app offers today",
      desc: "BABYLOG's 26 long-term areas, features and user scenarios, permission principles for parents, grandparents, guardians and teens, current features and development plans, public-interest child protection areas and FAQ.",
    },
    business: {
      title: "Business | BABYLOG — Business structure and revenue models",
      desc: "BABYLOG's users and payers, B2C, C2C, B2B, B2B2C and B2G structure, 12 revenue models by stage, 32 business lines, go-to-market plan and operating and legal principles.",
    },
    partnerships: {
      title: "Partnerships | BABYLOG — Partnership models and pilot proposals",
      desc: "BABYLOG partnership models with postpartum care centers, daycare centers, kindergartens, academies, education content, parenting brands, kids cafes, family photo studios, child welfare institutions and public bodies, plus pilot proposals and data principles.",
    },
    contact: {
      title: "Contact | BABYLOG — The right channel for each inquiry",
      desc: "From service and app questions to business partnerships, institutional and public cooperation, technology and API, press and media, and investment: routes for each purpose and 26 inquiry categories.",
    },
  },

  status: {
    columns: [
      { id: "now", name: "In the app today", basis: "Based on the BabyLog app listing published on the App Store and Google Play.", items: ["Child profile", "Pregnancy weeks and checkup schedule", "Feeding, sleep, diaper, meal and play records", "Height, weight, vaccination and health records", "Growth statistics", "Hospital, education and family schedules", "Family sharing (parents, grandparents, guardians)", "Reference-only AI record summary", "Premium subscription (in-app purchase)"] },
      { id: "next", name: "Preparing for the next version", basis: "Design scope of the next app version. No release date has been set.", items: ["Parent community", "Explore: institutions, services and booking", "Market: baby goods shopping, used goods and group buying", "Seller and business onboarding", "Role-based detailed permissions"] },
      { id: "plan", name: "Planned", basis: "Follows the roadmap order of the integrated business plan.", items: ["School, learning and career", "Family Trust verified reviews", "Teen accounts and adult transition", "Child safety and official reporting guidance", "Books and Learning content", "Education and childcare institution SaaS", "Official foster care, adoption and independence information"] },
      { id: "review", name: "Under review", basis: "Areas that need business, legal and safety review first.", items: ["Toy Club toy rental subscription", "Family Box deliveries", "Smart parenting devices", "Expanded AI features", "Donation and volunteering links", "Child welfare institution SaaS and CSR", "Global expansion"] },
    ],
    note: "Features preparing for the next version, planned or under review are not released features, and their scope and timing may change.",
    more: "See status by feature",
  },

  overview: {
    vision: {
      kicker: "02 · About BABYLOG",
      title: "Twenty years of one child,\none family's record.",
      lines: [
        "BABYLOG is NEWON's family platform that brings together a child's growth, health, education, family life and memories from pregnancy to high-school graduation. It does not stop at the baby years: the goal is to connect the records, information and services a family needs at each stage as the child grows.",
        "Today the iOS and Android app offers parenting records such as feeding, sleep, diapers and meals, growth and health records such as height, weight and vaccinations, hospital and education schedules, family sharing with parents, grandparents and guardians, and a reference-only AI record summary.",
        "The integrated business plan designs 26 long-term areas, from education, community and booking to shopping, used goods, group buying, books and institution services. They will be opened step by step after validation; not all of them are available yet.",
        "Public-interest areas such as finding missing children, child protection, and foster care and adoption information are kept separate from commercial services and are prepared around links to official agencies.",
      ],
    },
    problem: {
      kicker: "Problem → Solution",
      title: "From scattered parenting notes\nto one family timeline.",
      lead: "The problems families actually face and how BABYLOG proposes to solve them.",
      items: [
        { name: "Records are scattered across apps, messengers and paper", lead: "Feeding, sleep, growth and vaccination records come together in one profile per child. This is a core feature of the app today." },
        { name: "Several people care for the child but cannot see the same information", lead: "Parents, grandparents and guardians check the same records and schedules. The principle is that the family decides who sees what." },
        { name: "Tools stop after the baby years", lead: "The plan is to extend use to school schedules, learning and careers, and to hand records over to the child's own account at adulthood." },
        { name: "It is hard to choose goods, services and institutions with confidence", lead: "Explore, booking and market areas are being prepared around verified-use reviews, a clear line between ads and information, and official sources first." },
        { name: "Children who need protection struggle to reach official information", lead: "A separate public-interest area is being prepared to guide missing-child reporting routes, foster care, adoption and independence support for free and link to official agencies." },
      ],
    },
    who: {
      kicker: "Who It's For",
      title: "The people who use BABYLOG,\nand when they use it.",
      lead: "The initial core customers are families raising a child aged 0 to 2 together. Institutions and companies are met separately as business and partnership customers.",
      customers: [
        { name: "Expecting and new parents", lead: "BABYLOG's central users, who log pregnancy weeks and checkups and a newborn's feeding, sleep and diapers every day." },
        { name: "Grandparents and caring family", lead: "Grandparents and family who look after the child during the day in dual-income households. They see the same records and keep adding to them." },
        { name: "School-age children and teens", lead: "The stage that widens into school schedules, learning and careers, planned around protecting teens' independence and privacy." },
        { name: "Institutions, companies, public bodies", lead: "Daycare centers, kindergartens, academies, parenting brands, companies with family benefits, child welfare institutions and public bodies are business and partnership customers." },
      ],
      momentsTitle: "Typical moments of use",
      moments: [
        { name: "Logging a night feed and handing over in the morning", body: "A partner checks the feeding and diaper records left overnight and carries on. Possible in the app today." },
        { name: "Keeping track of vaccinations and checkups", body: "Hospital visits and vaccinations are added to the schedule and checked by the whole family. Possible in the app today." },
        { name: "Sharing the day with grandparents", body: "Grandparents caring for the child after a parent returns to work leave records, and the parent sees the whole day in the evening." },
        { name: "Preparing for school", body: "Managing timetables, supplies and school calendars together after starting elementary school is an area still to come." },
      ],
    },
    journey: {
      kicker: "04 · The Family Journey",
      title: "From pregnancy to high-school graduation,\nand the move to adulthood.",
      lead: "What a family needs changes at every stage. Today the app focuses on pregnancy and the baby years; later stages will be added according to the plan.",
      items: [
        { id: "s1", n: "01", age: "Pregnancy", name: "From planning a pregnancy to preparing for birth", lead: "Weekly changes and checkup schedules are managed in the app. Pregnancy planning information and support programs are areas still to be added.", topics: ["Pregnancy weeks", "Checkup schedule", "Birth essentials", "Support programs"] },
        { id: "s2", n: "02", age: "Birth & Newborn", name: "The first months with a new baby", lead: "Feeding, sleep, diapers and vaccinations are recorded and shared with family in the app. Postpartum recovery information is an expansion area.", topics: ["Feeding · sleep · diapers", "Vaccinations", "Family sharing", "Postpartum life"] },
        { id: "s3", n: "03", age: "Baby & Toddler", name: "Growth, development, play and daycare", lead: "Height, weight, baby food records and growth statistics are in the app. Play and development information and daycare links are next-stage areas.", topics: ["Growth charts", "Baby food", "Development notes", "Daycare"] },
        { id: "s4", n: "04", age: "Elementary School", name: "When school life begins", lead: "Planned as the stage where the family manages timetables, school calendars, homework, supplies, after-school programs and everyday safety together.", topics: ["School schedule", "Supplies", "After school", "Everyday safety"] },
        { id: "s5", n: "05", age: "Middle & High School", name: "Preparing for study, careers and higher education", lead: "The stage of study plans, career and admissions information and graduation. Planned with permissions that widen what teens manage themselves.", topics: ["Study plans", "Career exploration", "Admissions · certificates", "Teen accounts"] },
        { id: "s6", n: "06", age: "Adulthood", name: "Handing the record back to its owner", lead: "The plan is for an adult child to take over their records in their own account. Links to adult life through LIVON are under consideration.", topics: ["Own account", "Control of records", "LIVON link"] },
      ],
    },
    diff: {
      kicker: "How It's Different",
      title: "How it differs\nfrom existing alternatives.",
      lead: "BABYLOG's differentiation hypotheses, compared with publicly known types of service. Features not yet built are not claimed as strengths.",
      items: [
        { name: "Baby log apps → through high-school graduation", lead: "Many log apps focus on the baby years. BABYLOG aims for one family account that continues into school age and the teen years." },
        { name: "Community boards → information tied to records", lead: "Instead of scattered posts, information and community matched to the child's stage and schedule, prepared together with policies protecting children's photos and personal data." },
        { name: "Institution notice apps → family-centered permissions", lead: "Not just receiving notices from an institution: the family owns the record and decides how far it is shared." },
        { name: "Photo albums → growth data and memories", lead: "Growth records and milestones kept alongside photos, with the principle of never restricting export or deletion of records." },
        { name: "General commerce → a separate public-interest area", lead: "Information on child protection, foster care, adoption and missing children is free and never mixed with commercial transactions." },
      ],
    },
    now: {
      kicker: "Service Status",
      title: "What is offered today,\nand what comes next.",
      lead: "The current state is divided into four stages. App features are used in the iOS and Android app; see the Platform page for details by feature.",
    },
  },

  platform: {
    areas: {
      kicker: "26 Long-term Areas",
      title: "Twenty-six long-term areas,\nfive groups.",
      lead: "The full expansion scope of BABYLOG designed in the integrated business plan. The number of areas is a long-term planning unit and does not mean everything is built. Areas share common account, record and transaction systems, so there is no separate app or server per area. Features available in the app today are written in the present tense; other areas are written as plans.",
      groups: [
        {
          id: "s-a", name: "A · Family & Growth", items: [
            { n: "01", en: "BABYLOG Family", name: "Family accounts and permissions", lead: "Connects parents, grandparents and guardians as one family and manages per-child profiles, shared schedules and family notifications. Family sharing is in the app today; role-based permissions, teen accounts and the move to adulthood are being designed step by step." },
            { n: "02", en: "BABYLOG Pregnancy", name: "Pregnancy, birth and postpartum", lead: "Weekly pregnancy records and checkup schedules are managed in the app. It will widen to pregnancy planning, birth essentials, postpartum recovery and government support programs, while LIVON handles guidance on life-event programs in general." },
            { n: "03", en: "BABYLOG Growth", name: "Growth, development and health records", lead: "Height and weight growth charts, feeding, sleep, diapers, baby food, vaccinations, appointments and health notes are recorded in the app. It makes no developmental assessment or medical judgment and does not replace medical professionals." },
            { n: "04", en: "BABYLOG Education", name: "School, learning and careers", lead: "Planned as an area where the family manages timetables, school calendars, homework, supplies, study plans, career and admissions information and after-school programs together. Links to school and institution data come only after checking sources, rights of use and student data protection." },
            { n: "05", en: "BABYLOG Memories", name: "Photos, videos and growth albums", lead: "An area for keeping moments such as first steps, first words, school entry and graduation in family albums and a growth timeline. Even if paid features appear, basic access, export and deletion of records will not be unfairly restricted." },
          ],
        },
        {
          id: "s-b", name: "B · Trust & Community", items: [
            { n: "06", en: "BABYLOG Family Trust", name: "Reviews of daycare, kindergartens, academies and care", lead: "Planned as a trust service comparing institutions by official registration, verifiable qualifications, reviews from verified use, published costs and the date last checked. Paid ads are separated from ordinary reviews, and reviews may not reveal a child's identity, health or school life." },
            { n: "07", en: "BABYLOG Community", name: "Parent and family community", lead: "A space for families at similar stages to share experiences and questions. Policies on children's photos and personal data, incorrect health information and promotional posts come first." },
          ],
        },
        {
          id: "s-c", name: "C · Market & Subscriptions", items: [
            { n: "08", en: "BABYLOG Market", name: "Shopping, used goods and group buying", lead: "A market for finding and trading baby goods such as diapers, formula and clothing, used goods by growth stage and group buys within BABYLOG. Sellers are verified before selling, and payment and settlement are planned on NEWON's shared transaction infrastructure. Renting baby goods belongs to SHAREON." },
            { n: "09", en: "BABYLOG Booking", name: "Everyday and experience bookings", lead: "Planned so that lawful everyday services such as classes, experiences, family photos and kids' venues are booked inside the app's explore area. For medical institutions it only guides information, schedules and official booking routes, with no fee proportional to medical charges." },
            { n: "10", en: "BABYLOG Books", name: "Books, e-books and audiobooks", lead: "Recommends picture books, stories and study books by growth stage, and reviews publisher partnerships and regular book deliveries. For e-books and audiobooks, copyright and app-store digital payment rules are checked first." },
            { n: "11", en: "BABYLOG Toy Club", name: "Toy rental and subscription", lead: "A concept for receiving and returning age-appropriate toys on a regular schedule. It would start with verified rental partners to validate hygiene, safety, damage and collection standards." },
            { n: "12", en: "BABYLOG Learning", name: "Education content and learning services", lead: "An area connecting age-based play and learning material and education content. Copyright, scope of use and age suitability of each provider's content are checked." },
            { n: "13", en: "BABYLOG Family Box", name: "Regular deliveries of baby and growth goods", lead: "A concept for regular deliveries by stage, from pregnancy and newborn to toddler and school preparation. Gifts from family and corporate birth gifts are also considered; cost, delivery, returns and inventory must be validated first." },
          ],
        },
        {
          id: "s-d", name: "D · Technology & Business", items: [
            { n: "14", en: "BABYLOG Devices", name: "Smart parenting devices", lead: "Reviews links with baby monitors, children's tablets, room sensors and story speakers. For camera, location and voice data, consent, access rights, encryption, retention periods and KC certification come first." },
            { n: "15", en: "BABYLOG AI", name: "Parenting, learning and family AI", lead: "In the app today it summarizes records for reference. It may widen to organizing schedules and supplies, suggesting books and play and exploring official support programs, but it never diagnoses, assesses developmental disorders, identifies faces or selects children for foster care or adoption." },
            { n: "16", en: "BABYLOG Safety", name: "Home safety and emergency support", lead: "Everyday safety checklists for families, guardian emergency contacts and guidance on official reporting routes such as 112 and 119 are being prepared. Emergency functions are not to be hidden in complex menus." },
            { n: "17", en: "BABYLOG Business", name: "SaaS for education and childcare institutions", lead: "A standard tool for daycare centers, kindergartens and academies to manage notices, schedules, guardian communication and operations. Built as a common product, not per-client development, with access rights for child and guardian data designed first." },
            { n: "18", en: "BABYLOG Partnerships", name: "Corporate, institutional and public partnerships", lead: "An area for running corporate family benefits, brand campaigns and public-sector cooperation in a standardized way. Only organizations with a confirmed contract are shown as partners." },
          ],
        },
        {
          id: "s-e", name: "E · Child Protection & Welfare (public interest)", items: [
            { n: "19", en: "BABYLOG Find", name: "Links to official missing-child reporting", lead: "An area that guides prevention information, reporting routes to 112 and official missing-child agencies, and verified public notices, free of charge. Posting unverified photos, personal details or locations, and AI face matching, will not be introduced." },
            { n: "20", en: "BABYLOG Safety Network", name: "Missing-child prevention and safety education", lead: "Covers age-based safety education, guardian contact networks, consent-based check-ins for going out and coming home, and guidance on official protection agencies. Location features are limited to the minimum needed for safety, never constant monitoring." },
            { n: "21", en: "BABYLOG Child Care", name: "Links to child welfare facilities and protection agencies", lead: "Connects official information on child care facilities, group homes and community child centers with verified institutions' needed goods, volunteering and programs. Faces, real names, residence and case records of children in care are never published." },
            { n: "22", en: "BABYLOG Foster", name: "Foster care information and support", lead: "Guides the official foster care system, eligibility, procedures, training and responsible agencies. Children and foster families are never matched person to person; foster decisions are made through the procedures of legally authorized agencies." },
            { n: "23", en: "BABYLOG Adoption Support", name: "Official adoption procedures and information", lead: "Guides official adoption procedures, counseling agencies, eligibility and documents, training and post-adoption support. No child profiles, child search or selection, direct matching or adoption success fees." },
            { n: "24", en: "BABYLOG Hope", name: "Links to sponsorship, giving and volunteering", lead: "Connects official institutions' needed goods and verified volunteer programs. Until the legal requirements and contracts are in place, BABYLOG does not collect or hold donations itself and points to official channels." },
            { n: "25", en: "BABYLOG Independence", name: "Support for young people leaving care", lead: "Connects information on housing, scholarships, jobs, financial education, official counseling agencies and verified mentoring, with adult life management linked to LIVON. Care history is never used for community features or ad targeting." },
            { n: "26", en: "BABYLOG Welfare Business", name: "SaaS and CSR for child welfare institutions", lead: "Reviews tools that help child welfare institutions manage schedules, programs, needed goods, volunteering, sponsorship and reporting, and links to corporate social contribution. Guidance on missing-child reporting, protection, foster care and adoption itself stays free." },
          ],
        },
      ],
    },
    flow: {
      kicker: "How It Connects",
      title: "One record\nreaches the whole family.",
      lead: "The areas are not isolated features; they connect around one child profile and one family account.",
      items: [
        { n: "01", name: "Child profile and family account", body: "The starting point of every record and permission, with stage and basic details per child." },
        { n: "02", name: "Everyday records", body: "Feeding, sleep, diapers, meals, growth and health records build up on one timeline." },
        { n: "03", name: "Summaries, statistics, schedules", body: "Records turn into growth charts, a reference-only AI summary and hospital and education reminders." },
        { n: "04", name: "Family sharing", body: "Within the permitted scope, parents, grandparents and guardians see the same information and keep adding to it." },
        { n: "05", name: "Explore and market", body: "The stage that leads on to institutions, services and goods suited to the child's stage. Being prepared for the next version, with no personalized ads based on children's data." },
      ],
      note: "Children's, health and family data is never shared automatically with other NEWON apps (LIVON, SHAREON, PETLOG, ONGIL, MY WORLD) without explicit consent and lawful authority.",
    },
    roles: {
      kicker: "Roles & Permissions",
      title: "Parents, grandparents, guardians, teens:\ndifferent scopes of access.",
      lead: "Family sharing is in the app today. The role-based permissions below are the design principles BABYLOG follows; detailed features are settled during development.",
      items: [
        { name: "Parents and legal guardians", lead: "Create the child profile and manage all records. As main administrators they decide on family invitations, sharing scope, export and deletion; data on children under 14 is handled on the basis of legal-guardian consent." },
        { name: "Grandparents and family members", lead: "See and add to records and schedules within the scope they are invited to, focused on what is needed to care for the child together." },
        { name: "Guardians and caregivers", lead: "A limited permission is planned so caregivers only see the schedules and records needed while looking after the child. Family links are designed with situations that require verifying the relationship or lawful authority in mind." },
        { name: "Teens themselves", lead: "The scope a teen manages grows with age, and records that need privacy are planned not to be shown to parents automatically. At adulthood, records move to the young person's own account." },
      ],
      note: "There is no structure in which an adult child's records keep being shown to parents automatically.",
    },
    scenarios: {
      kicker: "User Scenarios",
      title: "Moments in a family's day\nwhere BABYLOG is used.",
      lead: "Moments possible in the app today and moments still to come are listed together.",
      items: [
        { name: "The first month after birth, parents taking turns", lead: "A partner checks the night's feeding and diaper records in the morning and carries on, using the daily summary and growth statistics to look at sleep patterns. Possible in the app today." },
        { name: "Shared care with grandparents after returning to work", lead: "Grandparents caring for the child during the day see and add to the same records and schedules, and the family keeps track of vaccinations and appointments together. Possible today with family sharing." },
        { name: "Booking a first-birthday photo shoot or a weekend class", lead: "Finding and booking a family photographer or a kids' class in the app's explore area is being prepared for the next version; the website does not take bookings." },
        { name: "Getting ready for elementary school", lead: "Managing timetables, supplies and school calendars together and looking for after-school programs is planned." },
        { name: "High-school graduation and an own account", lead: "A child who has finished preparing for university or work taking over their records in their own account at adulthood is a long-term plan." },
      ],
    },
    roadmap: {
      kicker: "Now & Next",
      title: "Current features\nand development plans.",
      lead: "Feature status is shown in four stages. See the area descriptions above for details of each feature.",
    },
    trustExtra: [
      { name: "Limits on the role of AI", lead: "AI is limited to summarizing records and general information; it never diagnoses, assesses development, identifies faces or selects children for foster care or adoption.", status: "released" },
      { name: "Minimal location features", lead: "Location-related features are designed for the minimum needed for safety, not constant monitoring, balancing guardian permissions with children's rights.", status: "plan" },
    ],
    faq: {
      kicker: "FAQ",
      title: "Frequently asked questions.",
      items: [
        { q: "Can I keep parenting records on the website?", a: "No. Records and account management are in the BABYLOG app for iOS and Android. The website only introduces the service and routes inquiries." },
        { q: "How do I use it with my family?", a: "In the app you can invite parents, grandparents and guardians to see the same child's records and schedules. Role-based permissions are being designed step by step following the principles above." },
        { q: "Does the AI judge my child's health or development?", a: "No. The AI only summarizes records for reference; it does not diagnose, assess development or prescribe. If you are worried about health, please contact a medical institution." },
        { q: "When will community, booking and market be available?", a: "They are being prepared for the next app version and no release date has been set. We will announce them in the app and on this website when they launch." },
        { q: "Is there a paid subscription?", a: "The app offers a Premium subscription. Prices and terms follow what the App Store and Google Play show in the app. Other products such as a family subscription are proposals and are not on sale." },
        { q: "What happens to records if I delete my account?", a: "How to delete an account and what is deleted are explained on the account deletion page.", link: "delete" },
        { q: "Can I report a missing child or child abuse to BABYLOG?", a: "No. In an emergency, please use official routes such as 112 first. BABYLOG does not accept reports or identify a child's location or identity." },
        { q: "Is my child's information shared with other NEWON apps?", a: "Not automatically, and never without explicit consent and lawful authority." },
      ],
      deleteLink: "Read the account deletion guide",
    },
  },

  business: {
    payers: {
      kicker: "Customers & Payers",
      title: "Who uses it,\nand who pays.",
      lead: "BABYLOG's business structure, split by users and payers. The only product on sale today is the individual Premium subscription; everything else is a proposal or under review.",
      fields: { users: "Users", payer: "Payer and method" },
      stages: [
        { id: "now", name: "On sale today" },
        { id: "proposal", name: "Proposals" },
        { id: "review", name: "Under review" },
      ],
      items: [
        { stage: "now", code: "B2C", name: "Individual subscription", users: "Expecting and new parents", payer: "The parent. Premium is subscribed through in-app purchase; prices follow what the App Store and Google Play show." },
        { stage: "proposal", code: "B2C+", name: "Family subscription", users: "Families including grandparents and caregivers", payer: "A family representative. A family-level subscription shared by several members is proposed." },
        { stage: "proposal", code: "C2C", name: "Used goods and group buying", users: "Families buying and selling baby goods", payer: "No fee on direct deals; a fee only when buyers choose safe payment is being reviewed. The cost of safe payment must be validated first." },
        { stage: "proposal", code: "B2B", name: "Listed and bookable businesses", users: "Kids' classes, kids cafes, family photo studios, parenting brands", payer: "The listed business. A business subscription and booking or sales fees charged on completion are proposed." },
        { stage: "proposal", code: "B2B2C", name: "Education and childcare institutions", users: "Daycare centers, kindergartens, academies and their guardians", payer: "The institution. A monthly subscription to the institution tool is proposed, validated first through interviews and a pilot." },
        { stage: "review", code: "B2G · CSR", name: "Public bodies, welfare and corporate giving", users: "Local governments, public bodies, child welfare institutions, companies", payer: "Public contracts, tools for welfare institutions and corporate social contribution contracts are under review. Guidance on missing children, protection, foster care and adoption itself is free." },
      ],
    },
    revenue: {
      kicker: "12 Revenue Models",
      title: "Twelve revenue models,\nby operating stage.",
      lead: "The 12 revenue models of the integrated business plan, grouped into subscriptions, transactions and institutions and divided by whether they operate today. Prices and fee rates are unconfirmed proposals and are not shown on this page.",
      kinds: [
        { name: "Subscriptions", lead: "Individual and family subscriptions, AI features and digital subscriptions such as Books and Learning. Digital features follow app-store in-app purchase." },
        { name: "Transactions, booking and brokerage", lead: "Fees on shopping, used goods, group buying and non-medical everyday service bookings. Fees are recognized on completion or purchase confirmation, and payments are planned to run through payment and payout agents without NEWON holding the funds." },
        { name: "Corporate and institutional services", lead: "SaaS for education, care and welfare institutions, corporate family benefits, brand campaigns and public or social-contribution contracts, run as standard products and contracts rather than per-client outsourcing." },
      ],
      columns: [
        { id: "now", name: "Operating today", basis: "The subscription product is listed in the stores. Paid usage is being measured and is not published.", items: ["Individual Premium subscription"] },
        { id: "next", name: "Next-stage proposals", basis: "To be validated after next-version features launch and legal and payment reviews.", items: ["Family subscription", "AI subscription and reports", "Shopping fees", "Used-goods safe payment fees", "Group-buying fees", "Everyday service booking fees"] },
        { id: "plan", name: "Long-term plans", basis: "Stages that follow institution interviews, pilots and cost validation.", items: ["Institution SaaS", "Corporate and public partnerships", "Books", "Toy Club", "Family Box", "Devices"] },
        { id: "free", name: "Not monetized", basis: "Public-interest guidance stays free, and there is no fee proportional to medical charges.", items: ["Missing-child reporting and safety guidance", "Foster care and adoption information", "Child welfare facility information", "Donation and volunteering guidance", "Information for young people leaving care", "Fees proportional to hospital charges"] },
      ],
      note: "Advertising may be reviewed later as a separate source of revenue, but there are no personalized ads based on children's data. Donations are not BABYLOG revenue.",
    },
    market: {
      kicker: "Market & Opportunity",
      title: "A rebound in births,\nand a gap in family-level tools.",
      lead: "Opportunities and risks seen from public statistics and market structure. No market size in money terms has been estimated.",
      items: [
        { name: "Births are rising again", lead: "Statistics Korea's provisional 2025 figures show about 250 thousand births, up on the previous year. Demand for family-level records and spending is growing again." },
        { name: "Tools break at every stage", lead: "Log apps, communities, institution notice apps, photo books and shops are all separate, so families copy the same information into many places." },
        { name: "Trust decides the choice", lead: "For daycare, academies, care and baby goods, verified use and official registration matter. Verified reviews and links to official information are the opportunity." },
        { name: "The barriers are real", lead: "Families already using another log app face the effort of moving records, and regulations such as children's data protection, legal-guardian consent and KC certification for infant products must be in place first." },
      ],
      diffTitle: "Differentiation hypotheses",
      diff: [
        { name: "Depth across the whole childhood", lead: "One family account from baby records to high-school graduation." },
        { name: "Records connected to services", lead: "Accumulated records linked to information, booking and market suited to the stage (planned)." },
        { name: "A separately run public-interest safety net", lead: "Child protection and welfare areas run as free links to official agencies, building trust." },
      ],
      diffNote: "Competitive comparisons are hypotheses based on publicly known service types; features not yet built are not claimed as strengths.",
    },
    entry: {
      kicker: "Go-to-Market",
      title: "From a free recording habit\nto institutional cooperation, in four steps.",
      lead: "The initial core customers are families raising a child aged 0 to 2 together. The order below is a plan, and each step starts only after the previous step's measured results are checked.",
      items: [
        { n: "01", name: "Free recording habit", body: "Build an everyday recording habit through postpartum care center and parenting community partnerships and family invitations, measuring continued use and invitation acceptance first." },
        { n: "02", name: "Subscription conversion", body: "Test Premium trial periods and family-level products to validate paid conversion." },
        { n: "03", name: "Transaction and booking pilots", body: "Start small with local booking pilots such as kids' classes and family photos, and with market trading, once legal and payment preparation is done." },
        { n: "04", name: "Institutions and companies", body: "Propose institutional products after interviews with daycare centers and kindergartens, a prototype of institution features and pilot discussions." },
      ],
    },
    phases: {
      kicker: "Business Roadmap",
      title: "Expanding step by step\nthrough five priorities.",
      lead: "The business is designed broadly across 26 areas, but expands by completing what families use every day first and checking demand.",
      note: "The roadmap is an order of work, not a release date or a revenue target. Actual institution links and operations in public-interest areas proceed only once verified cooperation and protection systems are confirmed.",
      items: [
        { n: "01", name: "Family accounts, growth, health, calendar", body: "Complete the core recording platform families use every day. Today's app is the base of this stage." },
        { n: "02", name: "School, learning, careers, finding institutions", body: "Extend use beyond pregnancy and the baby years to high-school graduation." },
        { n: "03", name: "Child safety, official reporting, welfare information", body: "Build a free safety and protection information base, starting with official information and emergency contact routes." },
        { n: "04", name: "Market, booking, Books, Toy Club", body: "Validate the revenue structure through real transactions and repeat use." },
        { n: "05", name: "Institution SaaS, AI, devices, public cooperation", body: "Expand to education, care and welfare institutions and the public sector. Foster care and adoption information and independence support follow only once verified institutional cooperation and protection systems are in place." },
      ],
    },
    rules: {
      kicker: "Operating & Legal Principles",
      title: "Standards that come\nbefore business.",
      lead: "Because this business deals with children and families, the items below are reviewed before a feature opens. Payment and trading features do not open before legal review is complete.",
      items: [
        { name: "Children's personal data", lead: "Handled on the basis of guardian permissions, age-appropriate consent, legal-guardian consent for children under 14 and retention periods." },
        { name: "Health and development data", lead: "Treated as sensitive data, without wording that looks like a medical judgment." },
        { name: "Location data", lead: "Limited to minimal safety features, considering the relevant law and children's rights." },
        { name: "Missing children and protection", lead: "Only official reporting and verified notices are linked; the identity and cases of children in care are never published." },
        { name: "Foster care and adoption", lead: "Only official procedures are guided, with no direct matching and no success fees." },
        { name: "Donations and sponsorship", lead: "No direct fundraising before the legal requirements and accounting systems for donations are in place." },
        { name: "Medical institutions", lead: "Only information, schedules and official booking routes, with no patient referral and no fees proportional to medical charges. The detailed structure goes through legal review." },
        { name: "Used goods and group buying", lead: "Consumer protection, payment, refund and dispute rules and seller verification come first." },
        { name: "Goods, devices and content", lead: "KC certification for infant products and devices, hygiene and damage rules for toy rental, and copyright and digital payment rules for books and content are checked." },
        { name: "Institution SaaS", lead: "Access rights per institution and personal data processing outsourcing terms are written into contracts." },
      ],
    },
  },

  partnerships: {
    vision: {
      kicker: "Partnership Vision",
      title: "Trustworthy connections\nfrom an app families open every day.",
      lead: "BABYLOG keeps the family's record at the center and aims to connect, in a verified way, the institutions, services and goods that record calls for. At this stage, cooperation means models and pilot proposals to validate together, not signed partnerships.",
      items: [
        { name: "Only connections families need", lead: "Cooperation goes ahead when the information or service genuinely helps families." },
        { name: "Eligibility and official sources", lead: "Partners whose registration, qualifications and safety standards are checked, and official information, come first." },
        { name: "Public interest kept apart from commerce", lead: "Child protection and welfare cooperation is run as free links to official agencies, separate from commercial cooperation." },
      ],
    },
    pilots: {
      kicker: "PoC & Pilot Proposals",
      title: "Pilots that start small\nand are validated together.",
      lead: "Collaboration scenarios BABYLOG proposes. None is a contract in progress; scope and terms are agreed together after an inquiry.",
      fields: { who: "Who with", how: "How it works", check: "What we check together" },
      items: [
        { code: "pilot-care", name: "Postpartum care center 'first record' pilot", who: "Postpartum care centers", how: "Discharge information includes an introduction to the BABYLOG app and how to invite family, so families start recording as soon as they get home.", check: "Whether recording continues and how family invitations flow. No maternal or child data is exchanged with the center." },
        { code: "pilot-booking", name: "Kids' class, family photo and kids cafe booking pilot", who: "Kids' classes, family photo studios, kids cafes", how: "After the app's explore and booking features launch, test the booking flow with a few businesses in one area.", check: "Completed bookings, cancellation and refund rules, and safety standards for venues for children." },
        { code: "pilot-institution", name: "Co-designing institution features with daycare centers, kindergartens and academies", who: "Daycare centers, kindergartens, academies", how: "Hear pain points in notices, schedules and guardian communication through interviews, and review a prototype institution tool together.", check: "Whether it reduces workload, access rights per institution and protection of children's data." },
        { code: "pilot-brand", name: "Parenting brand group-buy and trial campaigns", who: "Baby goods and baby food brands", how: "After the market launches, run group-buy and trial campaigns by growth-stage category, with no personalized ads based on children's data.", check: "Product safety and labeling standards, authenticity, delivery and returns." },
        { code: "pilot-content", name: "Education content, books and toys", who: "Education content companies, publishers, toy rental companies", how: "Test age-based content and book recommendations and toy rental subscriptions through partnerships first.", check: "Copyright and scope of use, digital payment rules, hygiene and damage standards." },
        { code: "pilot-corporate", name: "Employee birth and parenting support pilot", who: "Companies running employee family benefits", how: "Review together offering app Premium use and parenting information to employees having or raising a baby as a benefit.", check: "How eligibility is checked, and which personal records are never shared with the company." },
        { code: "pilot-welfare", name: "Co-designing tools for child welfare institutions", who: "Child welfare institutions, local governments, public bodies", how: "Design with institutions a tool for managing needed goods, volunteer programs and sponsorship information. Public-interest guidance is free.", check: "No disclosure of data on children in care, and a separate support policy that reflects institutions' budgets." },
      ],
      cta: "Inquire about this pilot",
    },
    data: {
      kicker: "Data & API",
      title: "Data links with consent\nand the minimum scope.",
      lead: "BABYLOG does not offer a public API today. Below are the kinds of links that can be reviewed during a partnership and the principles we keep.",
      items: [
        { name: "Public and official information", lead: "Linking officially published information such as vaccination schedules, support programs and missing-child prevention, with source and date last checked." },
        { name: "Institution notices and schedules", lead: "Showing an institution's notices and schedules in the family calendar only when the guardian consents." },
        { name: "Goods and booking information", lead: "Linking listed businesses' product information and available booking times, reviewed after market and booking features launch." },
        { name: "Device links", lead: "Linking smart-device data to records under guardian consent and security standards. Under review." },
      ],
      principlesTitle: "Data link principles",
      principles: ["We never sell children's or family data", "Records never leave without guardian consent", "Only the minimum information is exchanged", "Nothing is shared automatically with other NEWON apps either", "Links proceed only after a separate contract and security review"],
    },
    joint: {
      kicker: "Joint Services & Campaigns",
      title: "Content and campaigns\nmade together.",
      lead: "Cooperation is not only about selling: it can also be content that helps families and public-interest campaigns.",
      items: [
        { name: "Joint content", lead: "Age-based play, parent education and safety education material made with parenting and development experts and education content companies, with wording rules so it is not mistaken for medical or legal advice." },
        { name: "Public-interest campaigns", lead: "Missing-child prevention and everyday safety campaigns planned with public bodies and child safety education institutions, never mixed with commercial ads." },
        { name: "Joint services", lead: "Models that offer BABYLOG features to a partner's own customers, such as institution tools or corporate family benefits, run as standard products." },
      ],
    },
    value: {
      kicker: "Value for Partners",
      title: "What partners\ncan expect.",
      lead: "The value a partner can expect. User numbers and performance figures have not been measured yet, so none are promised.",
      items: [
        { name: "Reaching families at the right time", lead: "Families at clear stages such as pregnancy, birth, the baby years and school age can be reached with information that fits that time." },
        { name: "A verification-first trust structure", lead: "Take part in a structure that builds trust through verified-use reviews, a clear line between ads and information, and official registration checks." },
        { name: "Less operational load", lead: "Institutions can organize notices, schedules and guardian communication with a standard tool, and businesses can organize booking and inquiry flows (after launch)." },
        { name: "Public value", lead: "Child safety and welfare cooperation creates social value within links to official agencies." },
      ],
    },
  },

  contact: {
    purpose: {
      kicker: "Inquiry Purposes",
      title: "Where your inquiry goes\ndepends on its purpose.",
      lead: "Choose the closest of seven purposes. Every route leads to NEWON's existing official inquiry forms or official email address.",
      items: [
        { name: "General service inquiry", lead: "General questions such as what BABYLOG is and which families it suits.", to: "babylog:general", go: "To the inquiry form" },
        { name: "Features and app use", lead: "App features, errors, accounts and subscriptions. Including your device type and app version helps us check faster.", to: "babylog:app", go: "To the inquiry form" },
        { name: "Business partnership", lead: "Parenting brand listings, cooperation with bookable businesses and corporate family-benefit proposals.", to: "biz:brand", go: "To the business form" },
        { name: "Institutional and public cooperation", lead: "Cooperation with daycare centers, kindergartens, academies, child welfare institutions, local governments and public bodies.", to: "biz:institution", go: "To the business form" },
        { name: "Technology and API cooperation", lead: "Security, data protection, devices and AI. There is no public API yet; links are reviewed through discussion.", to: "biz:technology", go: "To the business form" },
        { name: "Press and media", lead: "Coverage, interviews and material requests. Please include the outlet name and your deadline.", to: "mail", go: "newon@newon.app" },
        { name: "Investment", lead: "Investment-related questions about NEWON and the BABYLOG business, answered within what can be disclosed.", to: "mail", go: "newon@newon.app" },
      ],
      mailSubjectMedia: "[BABYLOG] Press and media inquiry",
      mailSubjectInvest: "[BABYLOG] Investment inquiry",
    },
    sensitive: { n: "04", name: "Keep personal data out", body: "Please include only the contact details and content needed for a reply. You do not need to include unnecessary personal or sensitive data such as a child's name, photo or health information, or national ID numbers." },
  },
};

export function getContent30(lang) {
  return lang === "ko" ? KO : EN;
}
